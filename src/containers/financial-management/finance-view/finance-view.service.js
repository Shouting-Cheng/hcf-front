import config from 'config'
import httpFetch from "share/httpFetch"

export default {
  //获取单据查看列表
  getFinanceViewList(page, size,searchParams) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/filters/get?size=${size}&page=${page}`,searchParams);
  },

  //获取报销单类型列表 enabledFlag: 0（禁用）、1（启用）、2（启用和禁用）
  getExpenseTypeList() {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/company/expense/report/all?enabledFlag=2`)
  },

  //获取借款单类型列表 enabledFlag: 0（禁用）、1（启用）、2（启用和禁用）
  getLoanTypeList() {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/company/loan/application/all?enabledFlag=2`)
  },

  //导出单据列表
  exportFinanceList(searchParams) {
    let url = `${config.baseUrl}/api/reimbursement/batch/detail/export/expensReportOrApplication`;
    return httpFetch.post(url, searchParams, {}, {responseType: 'arraybuffer'});
  },

  printExpenseReport(expenseReportOid){
    return httpFetch.get(`${config.baseUrl}/api/expense/reports/generate/pdf/${expenseReportOid}`);
  }

}
