var webpack = require('webpack');
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
// var pathToReact = path.resolve(node_modules, 'react/dist');
// var pathToJquery = path.resolve(node_modules, 'jquery/dist');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    //插件项
    plugins: [new webpack.optimize.MinChunkSizePlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js'),
        new ExtractTextPlugin("[name].[hash].css"),
        new HtmlWebpackPlugin({
            title: 'LeoJs',
            filename: '../index.html',
            template: './index.html'
        })
    ],
    //页面入口文件配置
    entry: {
        index: './index.js',
        common: ['jquery']
    },
    //入口文件输出配置
    output: {
        path: '../dist/',
        filename: '[name].[hash].js',
        publicPath: 'dist/'
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader")
        }, {
            test: /\.(js|jsx)$/,
            loader: 'babel-loader?presets=es2015'
        }, {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192'
        }, {
            test: /\.(woff|eot|svg|woff2|ttf)$/,
            loader: 'url-loader?limit=100000'
        }],
        // noParse: [pathToReact, pathToJquery]
    },
    //其它解决方案配置
    resolve: {
        extensions: ['', '.js', '.json', '.scss', '.jsx']
    }
};
