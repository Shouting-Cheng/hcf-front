import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 首页查询
   */
  getList(params) {
    return httpFetch.get(
      `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/get/head/by/query`,
      params
    );
  },
  /**
   * 导出
   */
  export(params, setOfBooksId, exportParams) {
    let url = `${config.prePaymentUrl}/api/export?setOfBooksId=${setOfBooksId}`;
    for (let searchName in exportParams) {
      url += exportParams[searchName] ? `&${searchName}=${exportParams[searchName]}` : '';
    }
    return httpFetch.post(url, params, {}, { responseType: 'arraybuffer' });
  },
};
