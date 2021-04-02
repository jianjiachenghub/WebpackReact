/*
 * @Author: Yi-love
 * @SourcePath: https://github.com/Yi-love/webpack4-demo/tree/step_2
 * @Date: 2019-12-31 14:56:14
 * @LastEditTime : 2019-12-31 16:06:41
 * @LastEditors  : Please set LastEditors
 * @Description: 
 * 网上找的Webpack多入口配置
 * entry时定义两个入口
 * 可以发现是在生成HTML的时候压入不同的包即可
 * 可能会有不同入口引入相同的包而出现重复打入的现象（a和b都用了c，那么c会被同时打进a和b的包）
 * 为了避免这个问题我们可以提出引用次数超出两次的模块
 */


'use strict';

const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'development', //编译模式
    // 1.写成数组的方式就可以打出多入口文件，不过这里打包后的文件都合成了一个
    // entry: ['./src/index.js', './src/login.js'],
     // 2.真正实现多入口和多出口需要写成对象的方式
    entry:{//入口文件
        pagea:'./client/pagea/index.js', 
        pageb:['babel-polyfill' , './client/pageb/index.js']
    },
    resolve:{
        extensions: ['.js', '.vue', '.json'], //import引入时，无需写扩展名的文件
        alias: {
            'vue$': 'vue/dist/vue.esm.js' //完整版本的vue
        }
    },
    module:{
        rules:[
        {
            test:/\.js$/,
            exclude: /node_modules/,
            loader:'babel-loader' //js编译 依赖.babelrc
        },
        {
            test:/\.vue$/,
            include: [path.join(__dirname, './client/')],
            loader: 'vue-loader',
            options: {
                extractCSS: true
            }
        },
        {
            test: /\.s?[ac]ss$/,//postcss-loader 依赖 postcss-config.js
            use: [MiniCssExtractPlugin.loader,'css-loader','postcss-loader','sass-loader'] 
        },
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader'
        },
        {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader'
        }]
    },
    watch: false,
    watchOptions: { //不监听目录
        ignored: [/node_modules/ , '/static/']
    },
    output:{
        filename:'js/[name].js?v=[hash]',
        path:path.resolve(__dirname , './static/dist'),
        publicPath:'/dist/'
    },
    devtool: '#source-map',
    plugins:[
        new CleanWebpackPlugin([
            path.resolve(__dirname , './static'),
            path.resolve(__dirname , './server/views')
        ]),
        new VueLoaderPlugin(),
        new webpack.optimize.SplitChunksPlugin({
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '-',
            name: true,
            cacheGroups: {
                vue: {
                    test: /[\\/]node_modules[\\/]vue[\\/]/,
                    priority: -10,
                    name: 'vue'
                },
                'tui-chart': {
                    test: /[\\/]node_modules[\\/]tui-chart[\\/]/,
                    priority: -20,
                    name: 'tui-chart'
                }
            }
        }),
        //* 这里就是压入不同的包
        new HtmlWebpackPlugin({
            filename: './../../server/views/pagea.html', // 输出html文件的位置和名称
            chunks:['vue','tui-chart','pagea'],
            template: path.resolve(__dirname , './client/template.html')
        }),
        new HtmlWebpackPlugin({
            filename: './../../server/views/pageb.html',
            chunks:['vue','pageb'],
            template: path.resolve(__dirname , './client/template.html')
        }),
        new MiniCssExtractPlugin({ //提取为外部css代码
            filename:'[name].css?v=[contenthash]'
        }),
        new webpack.NoEmitOnErrorsPlugin()
    ]
};