const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  // 关闭eslint检测
  lintOnSave: false,
  transpileDependencies: true,
  publicPath: '/hospital_office_work_web',
  outputDir: 'hospital_office_work_web',
  devServer: {
    client: {
      overlay: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD',
      'Access-Control-Allow-Headers': '*'
    },
    port: 8080,
    compress: true,
    proxy: {
      '/api': {
        target: 'http://192.168.8.52:1010/hospital_office_work',
        // target: 'https://uat.zhixunchelian.com/hospital_office_work',
        ws: true,
        changeOrigin: true, // 允许跨域
        pathRewrite: {
          '^/api': ''
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD',
          'Access-Control-Allow-Headers': '*'
        }
      }
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js'
      })
    ]
  }
})
