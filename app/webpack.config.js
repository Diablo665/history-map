
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.[contenthash].js',
        clean: true,
    },
    mode: 'production',
    devtool: false,
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ]
                    }
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
    ],

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                    },
                    mangle: true,
                    output: {
                        comments: false,
                    },
                },
            }),
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: [
                        'default',
                        { discardComments: { removeAll: true } },
                    ],
                },
            }),
        ],
        splitChunks: {
            chunks: 'all',
        },
    },

    resolve: {
        extensions: ['.js', '.jsx'],
  }
};