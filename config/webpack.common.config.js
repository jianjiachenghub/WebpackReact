const path = require("path");

module.exports = {
  devtool: "cheap-module-eval-source-map",
  entry: {
    // 定义入口文件
    index: "./src/index.js"
    //index: ['babel-polyfill','./src/index.js'], // 添加polyfill垫片（挂载ES6+的方法和API如Promise等）这是很老的写法被坑了，会污染全局，现在preset-env内置了按需加载
    //framework: ['react','react-dom'],// 代码分割 定义分组 后面splitChunks.cacheGroups(无test属性)里name:[framework]就可以把'react'打入framework的包里
  },
  output: {
    // 编译打包之后的文件名以及所在路径
    filename: "js/bundle.js",
    path: path.resolve(__dirname, "../dist")
  },
  module: {
    // 编译器
    //noPars:/jquery/,// 比如我引入了jquery 它不依赖其他的包，就不需要解析 直接打包
    rules: [
      {
        test: /\.(js|jsx)$/, // 代码
        use: "babel-loader",
        exclude: /node_modules/ // 不需要去转译
        // ["import",{libraryName: "antd", style: 'css'}],   //antd按需加载  配置到options的plugins里
      },
      {
        test: /\.(jpg|png|gif)$/, //图片
        use: {
          loader: "url-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "images/",
            limit: 8192 // 大于8Kb走file-loader（好像是自动的不用添加fallback），小的ICON什么的直接打包插入到bundle.js中减少Http请求
            /*             fallback: {
              loader: 'file-loader',
              options: {
                  name: 'img/[name].[hash:8].[ext]'
              } */
          }
        }
      },
      {
        test: /\.(eot|ttf|svg|woff|woff2)$/, // 字体
        use: {
          loader: "file-loader",
          options: {
            name: "[name]_[hash].[ext]",
            outputPath: "font/"
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, //媒体文件
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash:8].[ext]",
            outputPath: "media/"
          }
        }
      },
 /*      {
        test: /\.css$/,
        use: [ 
           
          'style-loader',// 最后计算完的css，将会使用style-loader生成一个内容为最终解析完的css代码的style标签，放到head标签里
          'css-loader' // css-loader加载器去解析这个文件，遇到“@import”等语句就将相应样式文件引入
        ]
      } */
    ]
  }
};
