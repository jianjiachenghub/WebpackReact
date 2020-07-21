## Webpack 热更新(HMR)原理

>https://juejin.im/post/5de0cfe46fb9a071665d3df0
>https://juejin.im/post/5d8b755fe51d45781332e919
>https://www.mybj123.com/4764.html

主要依赖webpack, express, websocket

- 使用express启动本地服务，这个服务端可以监听本地文件的变化，当浏览器访问的时候做出响应
- 服务端和客户端使用websocket实现长连接建立通信
- webpack监听源文件的变化
  - 每次编译完成之后会生成hash值，已改动模块的json文件，已改动模块代码的js文件
  - 编译完成后本地服务端通过socket向客户端推送当前编译的hash值
- 客户端的websocket监听到有文件改动推送过来的hash值，会和上一次进行对比
  - 一致就走缓存
  - 不一致则通过ajax和jsonp获取最新的资源
- 使用内存文件系统去替换有修改的内容实现局部更新

<img src='../img/Webpack热更新流程.png'>

### 监听webpack编译结束

```
// node_modules/webpack-dev-server/lib/Server.js
// 绑定监听事件
setupHooks() {
    const {done} = compiler.hooks;
    // 监听webpack的done钩子，tapable提供的监听方法
    done.tap('webpack-dev-server', (stats) => {
        this._sendStats(this.sockets, this.getStats(stats));
        this._stats = stats;
    });
};
// 通过websoket给客户端发消息
_sendStats() {
    this.sockWrite(sockets, 'hash', stats.hash);
    this.sockWrite(sockets, 'ok');
}
```

###  webpack监听文件变化

每次修改代码，就会触发编译。说明我们还需要监听本地代码的变化，主要是通过setupDevMiddleware方法实现的。
```
// node_modules/webpack-dev-middleware/index.js
compiler.watch(options.watchOptions, (err) => {
    if (err) { /*错误处理*/ }
});

// 通过“memory-fs”库将打包后的文件写入内存
setFs(context, compiler); 

```

- 首先对本地文件代码进行编译打包，也就是webpack的一系列编译流程。
- 其次编译结束后，开启对本地文件的监听，当文件发生变化，重新编译，编译完成之后继续监听。

为什么代码的改动保存会自动编译，重新打包？这一系列的重新检测编译就归功于compiler.watch这个方法了。监听本地文件的变化主要是通过文件的生成时间是否有变化，这里就不细讲了。

**注意：执行setFs方法，这个方法主要目的就是将编译后的文件打包到内存。而不是你的dist目录，因为运行时内存效率更高**

### 客户端从新拉取资源

```
// webpack-dev-server/client/index.js
var socket = require('./socket');
var onSocketMessage = {
    hash: function hash(_hash) {
        // 更新currentHash值
        status.currentHash = _hash;
    },
    ok: function ok() {
        sendMessage('Ok');
        // 进行更新检查等操作
        reloadApp(options, status);
    },
};
// 连接服务地址socketUrl，?http://localhost:8080，本地服务地址
socket(socketUrl, onSocketMessage);

function reloadApp() {
	if (hot) {
        log.info('[WDS] App hot update...');
        
        // hotEmitter其实就是EventEmitter的实例
        var hotEmitter = require('webpack/hot/emitter');
        hotEmitter.emit('webpackHotUpdate', currentHash);
    } 
}

hotEmitter.on('webpackHotUpdate',()=>{
	if(!hotCurrentHash || hotCurrentHash == currentHash){
		return hotCurrentHash = currentHash
	} 
	hotCheck()
})
```

- hotCheck 会通过ajax请求服务端拉取最新的 hot-update.json 描述文件 说明哪些模块哪些chunk（大集合）发生了更新改变
<img src="../img/update-json.png">
- 然后根据描述文件 hotDownloadUpdateChunk 去创建jsonp拉取到最新的更新后的代码,返回形式为： webpackHotUpdate(id, {...})
 <img src="../img/jsonp-hot-update.png"> 
- 为了拉取到的代码直接执行，客户端需要定义一个 window.webpackHotUpdate 函数来处理
这里面将缓存的旧代码更新为最新的代码，接着将父模块中的render函数执行一下
- 最后将 hotCurrentHash = currentHash 置旧hash方便下次比较
