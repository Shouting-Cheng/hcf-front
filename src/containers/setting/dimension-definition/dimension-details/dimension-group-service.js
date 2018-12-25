import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 获取维值组
   * @param
   */
  getDimensionGroup(params) {
    return httpFetch.get(``, params);
  },
  /**
   * 新增维值组
   * @param {*} data
   */
  saveDimensionGroup(data) {
    return httpFetch.post(``, data);
  },
  /**
   * 修改维值组
   * @param {*} data
   */
  updateDimensionGroup(data) {
    return httpFetch.put(``, data);
  },
  /**
   * 删除维值组
   * @param {*} id
   */
  deleteDimensionGroup(id) {
    return httpFetch.delete(``, id);
  },
  /**
   * 获取维值
   * @param
   */
  getDimension(params) {
    return httpFetch.get(`${config.baseUrl}/api/get/costcenter/items/by/costcenter/id`, params);
  },
  /**
   * 获取子维值
   * @param params
   */
  getDimensionChildren(params) {
    return httpFetch.get(``, params);
  },
  /**
   * 删除子维值
   * @param id
   */
  getDimensionChildren(id) {
    return httpFetch.delete(``, id);
  },
  /**
   * 分配子维值
   * @param params
   */
  getDimensionChildren(params) {
    return httpFetch.post(``, params);
  },
}
