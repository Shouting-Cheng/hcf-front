import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //获取单据列表，formType：101（申请单）、102（报销单）、103（全部）
  getDocumentType(formType) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/my/available?formType=${formType}`);
  },

  //获取表单默认值
  getFormValue(userOid, formOid) {
    return httpFetch.get(
      `${config.baseUrl}/api/custom/form/user/default/values?userOid=${userOid}&formOid=${formOid}`
    );
  },

  //得到报销单列表
  getExpenseReportList(page, size, searchParams) {
    let url = `${config.baseUrl}/api/expense/reports/search/my?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      if (searchName !== 'status') {
        url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
      } else {
        let temp = searchParams[searchName].match(/\d{4}/g);
        let value = searchParams[searchName].split(',');
        if (value.length > 1) {
          url += `&status=${value[0]}`;
          value.shift();
          value.forEach(item => (url += `&rejectType=${item}`));
        } else if (temp.length === 2) {
          url += `&status=${temp[0]}&rejectType=${temp[1]}`;
        } else {
          temp.map(value => {
            url += `&status=${value}`;
          });
        }
      }
    }
    return httpFetch.get(url);
  },

  saveExpenseReport(expenseReport) {
    return httpFetch.post(`${config.baseUrl}/api/expense/reports/custom/form/draft`, expenseReport);
  },

  //得到报销单详情 /api/expense/reports/custom/
  // /api/claims/
  getExpenseReportDetail(Oid) {
    return httpFetch.get(`${config.baseUrl}/api/v2/expenses/${Oid}`);
  },

  //删除报销单
  deleteExpenseReport(Oid) {
    return httpFetch.delete(`${config.baseUrl}/api/expense/reports/${Oid}`);
  },

  //撤回报销单
  withdraw(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/withdraw`, params);
  },

  //得到我的借款单
  getLoanRequestList(applicantOid, currencyCode, venMasterId, companyOid) {
    let params = {
      applicantOid,
      currencyCode,
      companyOid,
      page: 0,
      size: 100,
      status: [1005, 1006],
    };
    venMasterId && venMasterId !== '' && (params.venMasterId = venMasterId);
    return httpFetch.get(`${config.baseUrl}/api/loan/application/statusIn/my`, params);
  },

  //导入费用
  importExpense(expenseReportOid, invoiceOids) {
    let params = {
      expenseReportOid,
      invoiceOids,
    };
    return httpFetch.post(`${config.baseUrl}/api/expense/report/invoices/import`, params);
  },

  //删除费用
  removeExpense(expenseReportOid, invoiceOid) {
    return httpFetch.delete(
      `${config.baseUrl}/api/expense/reports/remove/invoice/${expenseReportOid}/${invoiceOid}`
    );
  },

  //提交之前差标检测
  checkStandard(expenseReport) {
    return httpFetch.post(`${config.baseUrl}/api/travel/standards/validate`, expenseReport);
  },

  //提交之前预算检测
  submitOrCheckBudget(expenseReport) {
    return httpFetch.post(
      `${config.baseUrl}/api/v2/expense/reports/custom/form/submit`,
      expenseReport
    );
  },

  //提交报销单
  submitExpenseReport(expenseReport) {
    return httpFetch.post(
      `${config.baseUrl}/api/expense/reports/custom/form/submit`,
      expenseReport
    );
  },

  //获取默认借款单
  getDefaultLoanRequest(applicationOid, applicantOid) {
    let params = {
      applicationOid,
      applicantOid,
    };
    return httpFetch.get(`${config.baseUrl}/api/loan/application/verification/my/default`, params);
  },

  //根据费用Oid计算报销单下费用列表的个人支付金额总和
  getTotalPersonalPaymentAmount(invoiceOids) {
    return httpFetch.post(`${config.baseUrl}/api/invoices/summary/`, invoiceOids);
  },

  //得到报销单内费用类型的默认分摊项
  getDefaultApportionment(expenseReportOid, expenseTypeId) {
    return httpFetch.get(
      `${
        config.baseUrl
      }/api/v2/expense/default/apportionment?expenseReportOid=${expenseReportOid}&expenseTypeId=${expenseTypeId}`
    );
  },

  /**
   * 得到报销单可导入费用
   * invoiceStatus: 'INIT',
   * applicantOid: applicant.userOid,
   * expenseReportOid: info.expenseReportOid,
   * expenseTypeOidStr
   * @return {*|AxiosPromise}
   */
  getAllExpenseByExpenseReport(params) {
    return httpFetch.post(`${config.baseUrl}/api/v2/invoices/currency`, params).then(res => {
      return httpFetch.post(
        `${config.baseUrl}/api/v2/invoices/currency?page=0&size=${Number(
          res.headers['x-total-count']
        ) || 0}`,
        params
      );
    });
  },

  //获得差补统计
  getTravelSubsidy(expenseReportOid, userOid, subsidyType) {
    return httpFetch.get(`${config.baseUrl}/api/expense/report/invoices/statistics`, {
      expenseReportOid,
      userOid,
      subsidyType,
    });
  },

  //检查费用
  checkExpense(invoiceOids) {
    let data = '';
    invoiceOids.map(invoiceOid => (data += `invoiceOids=${invoiceOid}&`));
    data.substr(0, data.length - 1);
    return httpFetch.post(`${config.baseUrl}/api/travel/standard/results`, data, {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    });
  },

  //检查发票
  checkInvoice(expenseReportOid) {
    return httpFetch.get(
      `${config.receiptUrl}/api/receipt/pjj/checked/failed?expenseReportOid=${expenseReportOid}`
    );
  },

  //获取申请单信息(默认差旅申请单)
  getApplicationInfo(applicationOid, isShowValue = false) {
    let url = '/api/application/';
    let params = {
      showValue: isShowValue,
    };
    return httpFetch.get(`${config.baseUrl}${url}${applicationOid}`, { showValue: true });
  },

  //获取英孚费用,带费用审批组
  getYingfuInvoiceInfo(data) {
    return httpFetch.post(`${config.baseUrl}/api/expense/report/yingfu/select/user`, data);
  },
  //是否可以加签 counterSignType：enableAddSignForSubmitter（验证提交人是否可加签，单据为编辑状态）、enableAddSign（验证审批人审批单据时是否可加签）
  isCounterSignEnable(companyOid, formOid, counterSignType) {
    let params = {
      companyOid,
      formOid,
      counterSignType,
    };
    return httpFetch.post(`${config.baseUrl}/api/countersign/addSign/enable/and/scope`, params);
  },
  //答复财务通知
  replyComment(params) {
    return httpFetch.post(`${config.baseUrl}/api/billcomment`, params);
  },
  //重新查验发票
  recheckInvoice(params) {
    return httpFetch.post(`${config.receiptUrl}/api/receipt/recheck`, params);
  },
};
