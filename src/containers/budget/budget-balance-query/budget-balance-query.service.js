import httpFetch from 'share/httpFetch'
import config from 'config'

export default {
  //预算余额导出
  exportBalance(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/results/export`, params, {}, { responseType: 'arraybuffer' })
  },

  //预算明细导出
  exportDetail(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/results/detail/export`, params, {}, { responseType: 'arraybuffer' })
  },

  /**
   * 获取预算余额明细
   * @param {*} id 
   */
  getBudgetBalanceDetail(id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/solution/header/apply/${id}`);
  },

  /**
   * 获取方案
   */
  getSolution() {
    return httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/header/list/solution`)
  },

  /**
   * 获取预算余额
   * @param {*} id 
   */
  getBudgetBalance(id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/header/${id}`);
  },

  /**
   * 删除预算余额
   * @param {*} id 
   */
  deleteBudgetBalance(id) {
    return httpFetch.delete(`${config.budgetUrl}/api/budget/balance/query/header/${id}`);
  },

  /**
   * 获取查询详情
   * @param {*} params 
   */
  getResultsDetail(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/results/detail`, params);
  },

  /**
   * 查询
   * @param {*} params 
   */
  queryBalance(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/header/user`, params)
  },
  /**
  * 查询
  * @param {*} structureId 
  */
  queryStructures(structureId) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/structures/${structureId}`)
  },
  /**
   * 查询所有参数
   * @param {*} structureId 
   */
  queryAllStructures(structureId) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/structure/assign/layouts/queryAll?structureId=${structureId}`);
  },
  /**
   * 查询所有参数
   * @param {*} page 
   * @param {*} size 
   * @param {*} id 
   */
  queryResults(page, size, id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/results/${id}?page=${page}&size=${size}`);
  },
  /**
   * 查询所有成本中心
   * @param {*} setOfBooksId
   */
  queryCostCenter(setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/cost/center/by/setOfBooks?setOfBooksId=${setOfBooksId}`);
  }
}
