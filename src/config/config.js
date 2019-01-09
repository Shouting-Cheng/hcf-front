const config = {
  appEnv: 'dev',
  // baseUrl: 'http://139.224.2.45:11024',
  baseUrl: '',
  workflowUrl: '/workflow',
  //baseUrl: 'http://101.132.92.213:9083',
  receiptUrl: 'http://106.15.26.10:10080/receipt',
  budgetUrl: '/budget',
  pushUrl: 'http://139.224.2.45:11024/push',
  accountingUrl: '/accounting',
  // payUrl: 'http://116.228.77.183:25297/payment',
  payUrl: '/payment',
  authUrl: '/auth',
  contractUrl: '/contract',
  prePaymentUrl: '/prepayment',
  // vendorUrl:`http://116.228.77.183:25297/vendor`, //供应商url    +  /vendor-info-service
  localUrl: `http://localhost:9998`,
  locationUrl: `/`,
  mapUrl: '/mapUrl',
  ssoUrl: 'http://139.224.2.45:11059',
  wsUrl: 'ws://http://106.15.26.10:10080',
  expAdjustUrl: 'http://116.228.77.183:25297',
  //baseUrl:'http://116.228.77.183:25297',
  jobUrl: '/job',
  vendorUrl: '/supplier',
  brmsUrl: '/',
  // Settings configured here will be merged into the final config object.
  mapKey: 'E5XBZ-LWVWJ-2TUFJ-F73PP-VS5LS-W3FUM',
  expenseUrl: '/expense',
  txManagerUrl: "/tx-manager"

};

export default config;
