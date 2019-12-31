const path = require('path');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: {// 定义入口文件
    index: './src/index.js',
    framework: ['react','react-dom'],// 代码分割 不修改的部分提出来单独打包
  },
  output: {// 编译打包之后的文件名以及所在路径
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  module: {// 编译器
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,// 不需要去转译
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/',
            limit: 8192,// 大于8Kb走file-loader，小的ICON什么的直接打包插入到bundle.js中减少Http请求
          },
        }
      },
      {
        test: /\.(eot|ttf|svg|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]',
            outputPath: 'font/'
          }
        }
      }
/*       {
        test: /\.css$/,
        use: [ 
           
          'css-loader', // css-loader加载器去解析这个文件，遇到“@import”等语句就将相应样式文件引入
          'style-loader'// 最后计算完的css，将会使用style-loader生成一个内容为最终解析完的css代码的style标签，放到head标签里
        ]
      } */
    ]
  }
}