import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //获取申请单查看的搜索结果列表
  getFinanceViewList(page, size, sort, searchParams) {
    let url = `${
      config.baseUrl
    }/api/application/finance/search?size=${size}&page=${page}&sort=${sort}`;
    searchParams.businessCode = searchParams.businessCode === '' ? null : searchParams.businessCode;
    return httpFetch.post(url, searchParams);
  },

  //获取费用单类型列表 enabledFlag: 0（禁用）、1（启用）、2（启用和禁用）
  getCostTypeList(params) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/company/all/types`, params);
  },

  //导出单据列表
  exportFinanceList(searchParams) {
    let url = `${config.baseUrl}/api/application/finance/export`;
    return httpFetch.post(url, searchParams, {}, { responseType: 'arraybuffer' });
  },

  printExpenseReport(expenseReportOid) {
    return httpFetch.get(`${config.baseUrl}/api/reports/generate/pdf/${expenseReportOid}`);
  },
};
