import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  /**
   * 查询凭证
   * @param {*} params
   */
  getAccountingMessage(params) {
    return httpFetch.get(`${config.accountingUrl}/api/accounting/gl/journal/lines/query`,params);
  },

  /**
   * 取租户下配置的科目段集合
   * @param {*} setOfBooksId
   */
  getAccountingSegment(setOfBooksId) {
    let url = `${config.accountingUrl}/api/general/ledger/segments/query/by/setOfBooks?setOfBooksId=${setOfBooksId}`;
    return httpFetch.get(url);
  },

  /**
   * 获取账套下启用的成本中心信息
   * @param setOfBooksId
   */
  getAccountingCostCenter(setOfBooksId) {
    let url = `${config.baseUrl}/api/cost/center/by/setOfBooks?setOfBooksId=${setOfBooksId}`;
    return httpFetch.get(url);
  },

  /**
   * 导出凭证
   * @param {*} params
   */
  exportAccountingMessage(params) {
    return httpFetch.get(`${config.accountingUrl}/api/accounting/gl/journal/lines/export`,params,{}, {responseType: 'arraybuffer'});
  },
}
