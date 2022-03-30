### 查看webpack文件系统
- http://127.0.0.1:4001/webpack-dev-server

### add-asset-html-webpack-plugin

这个插件和HtmlWebpackPlugin配合使用，且在他之后使用。
往html里在映入一些全局的js，比如dll，和一些定义全局变量或者枚举类型的js

### webpack配置文件中publicPath和contentBase

- output的publicPath是用来给生成的静态资源路径添加前缀的； 一般用于CDN
- devServer里面的publicPath表示的是打包生成的静态文件所在的位置（若是devServer里面的publicPath没有设置，则会认为是output里面设置的publicPath的值）；

两个publicPath可以看作是devServer对生成目录dist设置的虚拟目录，devServer首先从devServer.publicPath中取值，如果它没有设置，就取output.publicPath的值作为虚拟目录，如果它也没有设置，就取默认值 “/”。

output.publicPath，不仅可以影响虚拟目录的取值，也影响利用html-webpack-plugin插件生成的index.html中引用的js、css、img等资源的引用路径。会自动在资源路径前面追加设置的output.publicPath。

- contentBase是用来指定被访问html页面所在目录的；devServer里面的contentBase表示的是告诉服务器从哪里提供内容。（也就是服务器启动的根目录，默认为当前执行目录，一般不需要设置）

### UMD

随着模块标准越来越多，对一些类库出现了困扰，类库为了兼容各模块系统，又出现了 UMD 规范，标准的 UMD 主要兼容了 CJS、AMD 以及全局变量三种模块方式。

umd是一种思想，就是一种兼容 commonjs,AMD,CMD 的兼容写法，define.amd / define.cmd / module 等判断当前支持什么方式，
UMD先判断支持Node.js的模块（exports）是否存在，存在则使用Node.js模块模式。再判断是否支持AMD（define是否存在），存在则使用AMD方式加载模块。都不行就挂载到 window 全局对象上面去

```
(function (root, factory) {
if (typeof define === 'function' && (define.amd || define.cmd)) {
//AMD,CMD
define(['b'], function(b){
return (root.returnExportsGlobal = factory(b))
});
} else if (typeof module === 'object' && module.exports) {
//Node, CommonJS之类的
module.exports = factory(require('b'));
} else {
//公开暴露给全局对象
root.returnExports = factory(root.b);
}
}(this, function (b) {
return {};
}));
```

### webpack中library和libraryTarget使用场景



有些时候我们想要开发一个库，如lodash、underscore这些，这些库既可以用commonjs和amd的方式使用，也可以通过script标签的方式引入使用，目前很多库都是支持这几种使用方式的。

这时候我们就可以使用library和libraryTarget了，我们只需要用用es6的方式写代码，如何编译成umd就交给webpack了。
```
libraryTarget: “var”（default）
output.library 会将值作为变量声明导出（当使用 script 标签时，其执行后在全局作用域可用）。
libraryTarget: “window”
当 library 加载完成，入口起点的返回值将分配给 window 对象。
window["MyLibrary"] = _entry_return_;
// 使用者将会这样调用你的 library：
window.MyLibrary.doSomething();
libraryTarget: “assign”
libraryTarget: “this”
libraryTarget: “global”
libraryTarget: “commonjs”
当 library 加载完成，入口起点的返回值将分配给 exports 对象。这个名称也意味着模块用于 CommonJS 环境
exports["MyLibrary"] = _entry_return_;
// 使用者将会这样调用你的 library：
require("MyLibrary").doSomething();

libraryTarget: “commonjs2”
libraryTarget: “amd”
libraryTarget: “umd”
这是一种可以将你的 library 能够在所有的模块定义下都可运行的方式（并且导出的完全不是模块）。它将在 CommonJS, AMD 环境下运行，或将模块导出到 global 下的变量
```

### webpack.DefinePlugin
> Webpack 4.3 后的mode参数配置后可以自动添加环境变量
```
new webpack.DefinePlugin({
  // Definitions...
});


//webpack.config.js

 plugins: [
    new webpack.DefinePlugin({
        OBJ: JSON.stringify({"key1": "this is value"}),
        OBJ2: {"key1": "this is value"},
        OBJ3: {"key1": "'this is value'"},
        ARRAY: JSON.stringify(["value1", "value2"]),
        ARRAY2: ["value1", "value2"],
        ARRAY3: ["'value1'", "'value2'"],
// Number 和 Boolean 两种变量类型
        NUMBER: 12,
        BOOL: true
    })
]

//index.js
console.log('OBJ=', OBJ);//  OBJ= { key1: 'this is value' }
console.log('OBJ2=', OBJ2);//报错  console.log('OBJ2=', Object({"key1":this is value}));
console.log('OBJ3=', OBJ3);// OBJ3= { key1: 'this is value' }
console.log('ARRAY=', ARRAY);// ARRAY= [ 'value1', 'value2' ]
console.log('ARRAY2=', ARRAY2);// ARRAY2= {"0":value1,"1":value2}  value1 is not defined
console.log('ARRAY3=', ARRAY3);// ARRAY3= { '0': 'value1', '1': 'value2' }
console.log(NUMBER,BOOL);// 12 true
```

因为这个插件直接执行文本替换，给定的值必须包含字符串本身内的实际引号。通常，有两种方式来达到这个效果，使用 '"production"', 或者使用 JSON.stringify('production')

一般用来定义环境变量

```
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
```
