## tapable 钩子
>参考https://juejin.im/post/5aa3d2056fb9a028c36868aa

webpack本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是Tapable，webpack中最核心的负责编译的Compiler和负责创建bundles的Compilation都是Tapable的实例。

（1）多个事件连续顺序执行
（2）并行执行
（3）异步执行
（4）一个接一个地执行插件，前面的输出是后一个插件的输入的瀑布流执行顺序
（5）在允许时停止执行插件，即某个插件返回了一个undefined的值，即退出执行
我们可以看到，Tapable就像nodejs中EventEmitter,提供对事件的注册on和触发emit,理解它很重要


## Compiler 和 Compilation
>https://segmentfault.com/a/1190000015088834?utm_source=tag-newest

在开发 Plugin 时最常用的两个对象就是 Compiler 和 Compilation，它们是 Plugin 和 Webpack 之间的桥梁。 Compiler 和 Compilation 的含义如下：

Compiler 对象包含了 Webpack 环境所有的的配置信息，包含 options，loaders，plugins 这些信息，这个对象在 Webpack 启动时候被实例化，它是全局唯一的，可以简单地把它理解为 Webpack 实例；
Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 Webpack 以开发模式运行时，每当检测到一个文件变化，一次新的 Compilation 将被创建。Compilation 对象也提供了很多事件回调供插件做扩展。通过 Compilation 也能读取到 Compiler 对象。
Compiler 和 Compilation 的区别在于：Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。

webpack 的入口文件其实就实例了Compiler并调用了run方法开启了编译，webpack的编译都按照下面的钩子调用顺序执行。

before-run 清除缓存
run 注册缓存数据钩子
before-compile
compile 开始编译
make 从入口分析依赖以及间接依赖模块，创建模块对象
build-module 模块构建
seal 构建结果封装， 不可再更改
after-compile 完成构建，缓存数据
emit 输出到dist目录



## alias对文件路径优化

extension: 指定extension之后可以不用在require或是import的时候加文件扩展名,会依次尝试添加扩展名进行匹配
alias: 配置别名可以加快webpack查找模块的速度

```
resolve: {
    extension: ["", ".js", ".jsx"],
    alias: {
      "@": path.join(__dirname, "src"),// @就代表src这个地址
      pages: path.join(__dirname, "src/pages"),
      router: path.join(__dirname, "src/router")
    }
  },

```

## noParse（无需解析内部依赖的包）

```

module：{
    noParse：/jquery/
}
```

## 为什么需要hash

为了解决浏览器文件缓存问题，例如：代码更新后，文件名称未改变，浏览器非强制刷新后，浏览器去请求文件时认为文件名称未改变而直接从缓存中读取不去重新请求。我们可以在webpack.prod.js输出文件名称中添加hash值.

## babel-polyfill的作用

Babel默认只转换新的JavaScript句法（syntax），而不转换新的API，比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，以及一些定义在全局对象上的方法（比如Object.assign）都不会转码。

举例来说，ES6在Array对象上新增了Array.from方法。Babel就不会转码这个方法。如果想让这个方法运行，必须使用babel-polyfill，为当前环境提供一个垫片。

polyfill指的是“用于实现浏览器不支持原生功能的代码”，比如，现代浏览器应该支持fetch函数，对于不支持的浏览器，网页中引入对应fetch的polyfill后，这个polyfill就给全局的window对象上增加一个fetch函数，让这个网页中的JavaScript可以直接使用fetch函数了，就好像浏览器本来就支持fetch一样。在这个链接上 https://github.com/github/fetch 可以找到fetch polyfill的一个实现。

presets的"@babel/preset-env"里可以设置useBuiltIns来动态载入polyfill，不用全局引入babel-polyfill


## css编译器顺序导致了Webpack编译报错

### 错误实例

下面写法看似逻辑是对的，其实在报错，因为编译器的执行不是css-loader-》style-loader-》
```
module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'css-loader',// css-loader加载器去解析这个文件，遇到“@import”等语句就将相应样式文件引入
          'style-loader',// 最后计算完的css，将会使用style-loader生成一个内容为最终解析完的css代码的style标签，放到head标签里
         	...
        ]
      },
    ]
  }
```

### 了解Webpack编译器顺序
其实为啥是从右往左，而不从左往右，只是Webpack选择了compose方式，而不是pipe的方式而已，在技术上实现从左往右也不会有难度

在Uninx有pipeline的概念，平时应该也有接触，比如 ps aux | grep node，这些都是从左往右的。

但是在函数式编程中有组合的概念，我们数学中常见的f(g(x))，在函数式编程一般的实现方式是从右往左，如
```
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const add1 = n => n + 1; //加1
const double = n => n * 2; // 乘2
const add1ThenDouble = compose(
  double,
  add1
);
add1ThenDouble(2); // 6
// ((2 + 1 = 3) * 2 = 6) 
```
这里可以看到我们先执行的加1，然后执行的double，在compose中是采用reduceRight，所以我们传入参数的顺序编程了先传入double，后传入add1

那么其实也可以实现从左往右
```
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const add1ThenDouble = pipe(
  add1,
  double
);
add1ThenDouble(2); // 6
// ((2 + 1 = 3) * 2 = 6)
```
所以只不过webpack选择了函数式编程的方式，所以loader的顺序编程了从右往左

### 完整的配置
```
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
```

## Es6 import() 动态加载

在代码中所有被import()的模块，都将打成一个单独的包，放在chunk存储的目录下。在浏览器运行到这一行代码时，就会自动请求这个资源，实现异步加载。
webpack4已经支持了Es6的动态加载，无需再做配置

## 什么是CDN
CDN的全称是Content Delivery Network，即内容分发网络。
其基本思路是尽可能避开互联网上有可能影响数据传输速度和稳定性的瓶颈和环节，使内容传输的更快、更稳定。通过在网络各处放置节点服务器所构成的在现有的互联网基础之上的一层智能虚拟网络，CDN系统能够实时地根据网络流量和各节点的连接、负载状况以及到用户的距离和响应时间等综合信息将用户的请求重新导向离用户最近的服务节点上。
其目的是使用户可就近取得所需内容，解决Internet网络拥挤的状况，提高用户访问网站的响应速度。

## CDN关键技术

- 内容发布：它借助于建立索引、缓存、流分裂、组播（Multicast）等技术，将内容发布或投递到距离用户最近的远程服务点（POP）处；
- 内容路由：它是整体性的网络负载均衡技术，通过内容路由器中的重定向（DNS）机制，在多个远程 POP 上均衡用户的请求，以使用户请求得到最近内容源的响应；
- 内容交换：它根据内容的可用性、服务器的可用性以及用户的背景，在POP的缓存服务器上，利用应用层交换、流分裂、重定向（ICP、WCCP）等技术，智能地平衡负载流量；
- 性能管理：它通过内部和外部监控系统，获取网络部件的状况信息，测量内容发布的端到端性能（如包丢失、延时、平均带宽、启动时间、帧速率等），保证网络处于最佳的运行状态。

## 用 Webpack 实现 CDN 的接入

构建需要实现以下几点：
静态资源的导入 URL 需要变成指向 CDN 服务的绝对路径的 URL 而不是相对于 HTML 文件的 URL。
静态资源的文件名称需要带上有文件内容算出来的 Hash 值，以防止被缓存。
不同类型的资源放到不同域名的 CDN 服务上去，以防止资源的并行加载被阻塞。

使用公共cdn。webpack中可以利用externals属性，将不希望打包的第三方公共库独立出来在html中全局引入，这样的优势在于加快了编译打包的速度，更重要的是减小了打包后文件的大小，可以利用公共cdn引入第三方库。

```
externals: {
    'jquery': 'jQuery',
    'react': 'React',
    'react-dom': 'ReactDOM',
    'antd': 'antd'
  },
```

然后在模板中加上链接
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title><%= htmlWebpackPlugin.options.title %></title>
    <link href="https://cdn.bootcss.com/antd/4.0.0-rc.4/antd.css" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <!-- 正常的引入 cdn 资源即可 -->
    <script src="https://cdn.bootcss.com/react/16.12.0/cjs/react.production.min.js"></script>
    <script src="https://cdn.bootcss.com/react-dom/16.12.0/cjs/react-dom.production.min.js"></script>
    <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdn.bootcss.com/antd/4.0.0-rc.4/antd-with-locales.min.js"></script>
    <!-- built files will be auto injected -->
  </body>
</html>
```

## 首屏渲染loading
使用 html-webpack-plugin 来帮助我们自动插入 loading
```
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

// 读取写好的 loading 态的 html 和 css
var loading = {
    html: fs.readFileSync(path.join(__dirname, './loading.html')),
    css: '<style>' + fs.readFileSync(path.join(__dirname, './loading.css')) + '</style>'
}

var webpackConfig = {
  entry: 'index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'xxxx.html',
      template: 'template.html',
      loading: loading
    })
  ]
};

```

模板中：
```
<!DOCTYPE html>
<html lang="en">
    <head>
        <%= htmlWebpackPlugin.options.loading.css %>
    </head>

    <body>
        <div id="root">
            <%= htmlWebpackPlugin.options.loading.html %>
        </div>
    </body>
</html>

```





