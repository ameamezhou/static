const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    lintOnSave: process.env.NODE_ENV !== 'production',

    publicPath: '/wego/forecast/',
    outputDir: './dist',
    indexPath: 'main.html',
    assetsDir: 'static' ,

    devServer: {
        host: '9.134.4.141',
        port: 33999,
        disableHostCheck: true,
        sockHost: 'localhost',
        sockPort: 33999,
        proxy: {
            '/api': {
                target: 'http://9.134.4.141:13999'
            }
        }
    },

    configureWebpack: {
        plugins: [],
    },

    chainWebpack: config => {
        config.resolve.alias
            .set('utils', resolve('src/utils'));
    }

    // crossorigin: 'use-credentials',
};
