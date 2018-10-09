const path = require('path');
let webpack = require('webpack');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  externals: {
    '@antv/data-set': 'DataSet',
    bizcharts: 'BizCharts',
    rollbar: 'rollbar',
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
    config: path.resolve(__dirname, 'src/config/config.js'),
    images: path.resolve(__dirname, 'src/images/'),
    styles: path.resolve(__dirname, 'src/styles/'),
    routes: path.resolve(__dirname, 'src/routes/'),
    containers: path.resolve(__dirname, 'src/containers/'),
    widget: path.resolve(__dirname, 'src/components/Widget/'),
    utils: path.resolve(__dirname, 'src/utils/'),
    chooserData: path.resolve(__dirname, 'src/chooser-data/index.js'),
    share: path.resolve(__dirname, 'src/share/'),
  },
  commons: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   names: ['antd', 'vendor', 'bizcharts'],
    //   minChunks: Infinity
    // })
  ],
  extraBabelIncludes: ['node_modules/@antv'],
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableDynamicImport: true,
  es5ImcompatibleVersions: true,
  publicPath: '/',
  hash: true,
  proxy: {
    '/service': {
      target: 'http://localhost:8087',
      changeOrigin: true,
      pathRewrite: { '^/service': '' },
    },
    '/oauth': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
    },
    '/api': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
    '/auth': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
    },
    '/artemis-sit': {
      target: 'http://116.228.77.183:25297',
      changeOrigin: true,
    },
  },
};
