/**
 * Created by zhouli on 18/4/25
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
export default {
  /**
   * 获取供应商类型列表
   * @param {*} params
   */
  getSupplierList(params) {
    return httpFetch.get(`${config.vendorUrl}/api/ven/type/query`,params);
  },

  /**
   * 新增供应商类型
   * @param {*} params
   */
  addSupplierType(params) {
    return httpFetch.post(`${config.vendorUrl}/api/ven/type`,params);
  },

  /**
   * 更新供应商类型
   * @param {*} params
   */
  updateSupplierType(params) {
    return httpFetch.put(`${config.vendorUrl}/api/ven/type`,params);
  }

}
