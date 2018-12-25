import httpFetch from 'share/httpFetch';
import config from 'config';

export default {
  //查看借还款全局查看列表
  getGlobalList(page, size, searchParams) {
    let url = `${config.baseUrl}/api/global/list?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  //查看还款单管理列表
  getRefundList(page, size, searchParams) {
    let url = `${config.baseUrl}/api/global/repayment/management?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  //查看借款单管理列表
  getLoanList(page, size, searchParams) {
    let url = `${config.baseUrl}/api/global/loan/management?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  //财务确认是否收款
  confirmReceipt(params) {
    return httpFetch.post(`${config.baseUrl}/api/repayment/financial/app/manage`, params);
  },

  //根据employeeId查询员工借款情况，repaymentStatus：0（全部）、1（有欠款）、2（已还款）
  getLoanInfoByEmployeeId(employeeId, currencyCode, repaymentStatus = 0) {
    return httpFetch.get(
      `${
        config.baseUrl
      }/api/global/list?employeeId=${employeeId}&currencyCode=${currencyCode}&repaymentStatus=${repaymentStatus}&page=0&size=1`
    );
  },

  //根据employeeId查询员工借款列表
  getLoanListByEmployeeId(page, size, employeeId, searchParams) {
    let url = `${
      config.baseUrl
    }/api/global/loan/list?employeeId=${employeeId}&page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  //根据还款Oid获取还款信息
  getRefundInfo(Oid) {
    return httpFetch.get(`${config.baseUrl}/api/repayment/detail/${Oid}`);
  },

  //获取付款银行信息
  getRepaymentBankInfo() {
    return httpFetch.get(`${config.baseUrl}/api/repayment/bank/list?page=0&size=9999`);
  },

  //转账还款
  cardRepayment(params) {
    return httpFetch.post(`${config.baseUrl}/api/repayment/submit`, params);
  },

  //现金还款
  cashRepayment(params) {
    return httpFetch.post(`${config.baseUrl}/api/repayment/cash/submit`, params);
  },

  //撤回还款
  callBackRefund(params) {
    return httpFetch.post(`${config.baseUrl}/api/repayment/financial/delete`, params);
  },

  //获取还款用户的账户信息
  getAccountBankInfo(applicationOid, userOid) {
    return httpFetch.get(
      `${
        config.baseUrl
      }/api/repayment/contact/bank?applicationOid=${applicationOid}&userOid=${userOid}`
    );
  },
};
