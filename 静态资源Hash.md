## hash
> https://juejin.cn/post/6844903542893854734

 hash一般是结合CDN缓存来使用，通过webpack构建之后，生成对应文件名自动带上对应的MD5值。如果文件内容改变的话，那么对应文件哈希值也会改变，对应的HTML引用的URL地址也会改变，触发CDN服务器从源服务器上拉取对应数据，进而更新本地缓存。

如果使用了CDN缓存，不使用hash发布代码，会导致资源域名拉取的一直是缓存的文件，导致发布无效。

### hash

hash是跟整个webpack构建项目相关的，每次项目构建hash对应的值都是不同的，即使项目文件没有做“任何修改”。

### chunkhash

chunkhash，从字面上就能猜出它是跟webpack打包的chunk相关的。

具体来说webpack是根据入口entry配置文件来分析其依赖项并由此来构建该entry的chunk，并生成对应的hash值。
不同的chunk会有不同的hash值。一般在项目中把**公共的依赖库**和程序入口文件隔离并进行单独打包构建，用chunkhash来生成hash值，只要**依赖公共库不变**，那么其对应的chunkhash就不会变，从而达到缓存的目的。


### contenthash

contenthash表示由文件内容产生的hash值，内容不同产生的contenthash值也不一样。在项目中，通常做法是把项目中css都抽离出对应的css文件来加以引用。

在chunkhash中
- 项目主入口文件Index.js及其对应的依赖文件Index.css由于被打包在同一个模块，所以共用相同的chunkhash
- 但是公共库由于是不同的模块，所以有单独的chunkhash。
这样子就保证了在线上构建的时候只要文件内容没有更改就不会重复构建，但是这样子有个问题，如果index.js更改了代码，css文件就算内容没有任何改变，由于是该模块发生了改变，导致css文件会重复构建。

使用extra-text-webpack-plugin里的contenthash值，保证即使css文件所处的模块里就算其他文件内容改变，只要css文件内容不变，那么不会重复构建。

```js
 var extractTextPlugin = require('extract-text-webpack-plugin'),
  	path = require('path')
  
  module.exports = {
  	...
  	...
  	output:{
  		path:path.join(__dirname, '/dist/js'),
  		filename: 'bundle.[name].[chunkhash].js',
  	},
  	plugins:[
  		new extractTextPlugin('../css/bundle.[name].[contenthash].css')
  	]
  }
```