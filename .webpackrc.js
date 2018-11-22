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
    '/api': {
      target: 'http://115.159.108.80:9081/artemis-sit',
      changeOrigin: true,
    },
    // '/api': {
    // target: 'http://localhost:9083',
    //   changeOrigin: true,
    // },
    '/auth': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/prepayment': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/contract': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/payment': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/job': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/supplier': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/accounting': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/budget': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/brms': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/location': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true,
    },
    '/invoice': {
      target: 'http://115.159.108.80:9081/artemis-sit',
      changeOrigin: true,
    },
    '/expense': {
      target: 'http://115.159.108.80:9081',
      changeOrigin: true
    },
    '/config': {
      target: 'http://115.159.108.80:9081/artemis-sit',
      changeOrigin: true,
    },
    '/mapUrl': {
      target: 'http://apis.map.qq.com',
    },
  },
};
