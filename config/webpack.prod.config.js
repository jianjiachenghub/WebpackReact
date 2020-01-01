const merge = require('webpack-merge'); // 区分生产环境和开发环境
const common = require('./webpack.common.config.js'); // 导入基础配置
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 插件为你生成一个HTML文件，并主动加入JS文件
const TerserPlugin = require('terser-webpack-plugin');// 可配置删除console.log
const {CleanWebpackPlugin} = require('clean-webpack-plugin');// 只想要最新打包编译的文件，就需要先清除dist目录
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');// 压缩代码
const MiniCssExtractPlugin = require('mini-css-extract-plugin');// 将css提出去，而不是直接在页面来内嵌
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');// 将提出去的css压缩
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 包大小分析工具




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
          MiniCssExtractPlugin.loader,// 单独提出CSS
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
      template: 'public/index.html',// 定义的html为模板生成 从根路径开始查找
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
    }),
    new BundleAnalyzerPlugin({
      analyzerPort: 9001,
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
    splitChunks: {// 抽离公共代码 具体配置看官网
      chunks: 'all',// 效值是all、async和initial。提供all可能特别强大，因为这意味着即使在异步和非异步块之间也可以共享块
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      cacheGroups: {// 定义了被抽离的模块如何分成组，不然公共代码全打包到一个JS文件里面
        vendors: {// 第三方库抽离
          priority: 1,// 权重 先进行第三方库抽离
          test:  /[\\/]node_modules[\\/]/,// 选从node_modules文件夹下引入的模块，所以所有第三方模块才会被拆分出来 递归的
          name: "vendor",
          enforce: true,
        },
      }
    }
  }
});