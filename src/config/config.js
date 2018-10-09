
const config = {
  appEnv: 'dev',
  // baseUrl: 'http://139.224.2.45:11024',
  baseUrl: '/api',
  //baseUrl: 'http://101.132.92.213:9083',
  receiptUrl: 'http://106.15.26.10:10080/receipt',
  budgetUrl: '/api/budget',
  pushUrl: 'http://139.224.2.45:11024/push',
  accountingUrl: '/api/accounting_service',
  // payUrl: 'http://116.228.77.183:25297/payment',
  payUrl: '/api/payment',
  contractUrl: '/api/contract',
  prePaymentUrl: "/api/prepayment",
  // vendorUrl:`http://116.228.77.183:25297/vendor`, //供应商url    +  /vendor-info-service
  localUrl:`http://localhost:9998`,
  mapUrl: 'http://apis.map.qq.com',
  ssoUrl: 'http://139.224.2.45:11059',
  wsUrl: 'ws://http://106.15.26.10:10080',
  expAdjustUrl:'http://116.228.77.183:25297',
  //baseUrl:'http://116.228.77.183:25297',
  jobUrl: '/api/job',
  vendorUrl:'/api/supplier'
};

export default config;
