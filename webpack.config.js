const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs'); // to check if the file exists
const path = require('path'); // to get the current path

module.exports = (env) => {
  // // Get the root path (assuming your webpack config is in the root of your project!)
  // const currentPath = path.join(__dirname);
  //
  // // Create the fallback path (the production .env)
  // const basePath = currentPath + '/.env';
  //
  // // We're concatenating the environment name to our filename to specify the correct env file!
  // const envPath = basePath + '.' + env.ENVIRONMENT;
  // console.log('the envPath:', envPath)
  //
  // // Check if the file exists, otherwise fall back to the production .env
  // const finalPath = fs.existsSync(envPath) ? envPath : basePath;
  // console.log(finalPath)
  //
  // // Set the path parameter in the dotenv config
  // const fileEnv = dotenv.config({ path: finalPath }).parsed;
  // console.log(fileEnv)
  //
  // // reduce it to a nice object, the same as before (but with the variables from the file)
  // const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
  //   prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
  //   return prev;
  // }, {});
  // console.log('envKeys', envKeys)
return {
  entry: './src/index.js',
  output: {
    path: __dirname + 'dist',
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
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
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
    })
  ],
  devServer: {
     contentBase: __dirname,
     hot: true,
     historyApiFallback: true,
     contentBase: './',
     open: true
  }
}
};
