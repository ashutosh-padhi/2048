/* eslint-disable */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var packageJson = require('../package.json');
var envConfig = require('dotenv').config();
var globalDefinations = { VERSION: `"${packageJson.version}"` };
var _envConfig;
for (_envConfig in envConfig.parsed) {
    if (envConfig.parsed.hasOwnProperty(_envConfig)) {
        if (_envConfig === 'COLLISION_FUNCTION') {
            globalDefinations[_envConfig] = JSON.stringify(
                envConfig.parsed[_envConfig]
            );
        } else {
            globalDefinations[_envConfig] = envConfig.parsed[_envConfig];
        }
    }
}
var sassEnvVariables = `
    $env-matrix-size: ${globalDefinations.MATRIX_SIZE};
    $env-play-sensitivity: ${Math.min(
        0.1,
        globalDefinations.PLAY_SENSITIVITY / 1000
    )};
    $env-tile-size: ${globalDefinations.STYLE_TILE_SIZE};
    $env_tile_margin: ${globalDefinations.STYLE_TILE_MARGIN};
    `;
if (
    globalDefinations.STYLE_BACK_IMAGE_ENABLED &&
    globalDefinations.STYLE_BACK_IMAGE_ENABLED.toLowerCase() === 'true'
) {
    (function generateImagesAssets() {
        var imageSize =
            +globalDefinations.MATRIX_SIZE *
                +globalDefinations.STYLE_TILE_SIZE +
            (+globalDefinations.MATRIX_SIZE + 1) *
                +globalDefinations.STYLE_TILE_MARGIN;
        var imagePath = path.join(
            __dirname,
            '..',
            'res',
            globalDefinations.STYLE_BACK_IMAGE_NAME || 'background.jpg'
        );
        if (fs.existsSync(imagePath)) {
            sassEnvVariables += `$env-background-enabled: true;
            $env-background-image: url(${
                globalDefinations.STYLE_BACK_IMAGE_NAME || 'background.jpg'
            });
            `;
            sharp(imagePath)
                .resize(imageSize)
                .toFile(
                    path.join(
                        __dirname,
                        '..',
                        'src',
                        'web',
                        'assets',
                        globalDefinations.STYLE_BACK_IMAGE_NAME ||
                            'background.jpg'
                    ),
                    function (err, info) {
                        if (err) {
                            throw err;
                        }
                        console.log(info);
                    }
                );
        }
    })();
} else {
    sassEnvVariables += `$env-background-enabled: false;
    $env-background-image: none;
    `;
}

var config = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../dist'),
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: sassEnvVariables,
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.svg$/i,
                loader: 'svg-inline-loader',
            },
            {
                test: /\.tmpl\.htm[l]+$/i,
                use: ['html-loader'],
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    emitError: true,
                    emitWarning: true,
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/web/index.html',
        }),
        new webpack.DefinePlugin(globalDefinations),
    ],
};
if (process.env.NODE_ENV === 'development') {
    config.mode = 'development';
    config.devtool = 'source-map';
    config.devServer = {
        static: {
            directory: path.join(__dirname, '../dist'),
        },
        compress: true,
        port: 9000,
    };
} else {
    config.mode = 'production';
}
module.exports = config;
