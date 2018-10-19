import httpFetch from 'share/httpFetch'
import config from 'config'

export default {
  //预算余额导出
  exportBalance(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/results/export`, params, {}, {responseType: 'arraybuffer'})
  },

  //预算明细导出
  exportDetail(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/results/detail/export`, params, {}, {responseType: 'arraybuffer'})
  },

  //根据单据businessCode查询单据
  searchExportByBusinessCode(businessCode){
    let params = {
      page: 0,
      size: 1,
      businessCode
    };
    return httpFetch.get(`${config.baseUrl}/api/approvals/filters/get`, params)
  }
}
