import dotenv from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ImageminPluginImport from 'imagemin-webpack-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ImageminPlugin = ImageminPluginImport.default;

dotenv.config({ path: path.join(__dirname, '.env') });

export default (_env, argv) => {
  return {
    mode: argv.mode || 'production',
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, '/dist'),
      publicPath: '/',
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic',
                  },
                ],
                '@babel/preset-typescript',
              ],
            },
          },
        },
        {
          test: /\.(c)ss$/,
          use: [
            {
              loader: 'style-loader',
              options: { injectType: 'singletonStyleTag' },
            },
            'css-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(true),
        'process.env': {
          GOOGLE_LOGIN_CLIENT_ID: JSON.stringify(
            process.env.GOOGLE_LOGIN_CLIENT_ID,
          ),
        },
      }),
      new ImageminPlugin({
        disable: process.env.NODE_ENV !== 'production',
        pngquant: {
          quality: '95-100',
        },
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@theme': path.resolve(__dirname, 'src/components/theme.ts'),
        '@icons': path.resolve(__dirname, 'src/components/icons.tsx'),
      },
    },
    devServer: {
      static: './dist',
      historyApiFallback: true,
      proxy: [
        {
          context: ['/**'],
          target: 'http://localhost:3000',
          secure: false,
          changeOrigin: true,
        },
      ],
    },
  };
};
