const merge = require('webpack-merge'); // 区分生产环境和开发环境
const common = require('./webpack.common.config.js'); // 导入基础配置
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 插件为你生成一个HTML文件，并主动加入JS文件
const TerserPlugin = require('terser-webpack-plugin');// 可配置删除console.log
const {CleanWebpackPlugin} = require('clean-webpack-plugin');// 只想要最新打包编译的文件，就需要先清除dist目录
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');// 压缩代码
const MiniCssExtractPlugin = require('mini-css-extract-plugin');// 将css提出去，而不是直接在页面来内嵌
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');// 将提出去的css压缩



module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: 'js/[name].[chunkhash:8].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'// 对css编译的工具 可以：1.使用下一代css语法 2 . 自动补全浏览器前缀 3 . 自动把px代为转换成rem 
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // 这里有小伙伴可能会疑惑为什么不是 '../public/index.html'
      // 我的理解是无论与要用的template是不是在一个目录，都是从根路径开始查找
      template: 'public/index.html',// 定义的html为模板生成
      inject: 'body',
      minify: {// 压缩HTML文件
        removeComments: true,//去除注释
        collapseWhitespace: true,//去除空格
      },
    }),
    new CleanWebpackPlugin(),
    new UglifyJsPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[id].[hash].css',
    })
  ],
  optimization: {// 优化
    minimizer: [ // 最小化器
      new TerserPlugin({// 缩减代码的插件
        terserOptions: {
          compress: {
            drop_console: true, // 删除console.log
          },
        }
      }),
      new OptimizeCssAssetsPlugin({// 压缩CSS
        assetNameRegExp:/\.css$/g,
        cssProcessor:require("cssnano"),// 用于压缩和优化CSS 的处理器
        cssProcessorPluginOptions:{
          preset:['default', { discardComments: { removeAll:true } }]
        },
        canPrint:true
      })
    ],
    splitChunks: {// 抽离公共代码
      chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      cacheGroups: {// 定义了需要被抽离的模块
        framework: {
          test: "framework",// 字符串|正则表达式|函数 从其他模块中把包含这个模块的抽离出来
          name: "framework",// 抽离后生成的名字
          enforce: true
        },
        vendors: {// 缓存组
          priority: -10,
          test: /node_modules/,// 选从node_modules文件夹下引入的模块，所以所有第三方模块才会被拆分出来
          name: "vendor",
          enforce: true,
        },
      }
    }
  }
});