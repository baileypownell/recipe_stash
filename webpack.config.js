const webpack = require('webpack');
const fs = require('fs'); // to check if the file exists
const path = require('path'); // to get the current path
var ImageminPlugin = require('imagemin-webpack-plugin').default
var dotenv = require('dotenv').config({path: __dirname + '/.env'});

module.exports = (env) => {
  return {
    entry: './src/index.js',
    output: {
      path: __dirname + '/dist',
      publicPath: '/',
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            // Creates `style` nodes from JS strings
            { loader: 'style-loader', options: { injectType: 'singletonStyleTag'}},
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader',
          ],
        },
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(true),
        'process.env': {
          GOOGLE_LOGIN_CLIENT_ID: JSON.stringify(process.env.GOOGLE_LOGIN_CLIENT_ID)
        }
      }),
      new ImageminPlugin({
        disable: process.env.NODE_ENV !== 'production', // Disable during development
        pngquant: {
          quality: '95-100'
        }
      }),
    ],
    devServer: {
      contentBase: './dist',
      historyApiFallback: true,
      proxy: {
        '/**': {
          target: 'http://localhost:3000',
          secure: false,
          changeOrigin: true,
        }
      },
    }
  }
};
