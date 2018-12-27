import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 获取维值组
   * @param params
   */
  getDimensionGroup(params) {
    return httpFetch.get(`${config.baseUrl}/api/dimension/item/group/page/by/cond`, params);
  },
  /**
   * 新增维值组
   * @param {*} data
   */
  saveDimensionGroup(data) {
    return httpFetch.post(`${config.baseUrl}/api/dimension/item/group`, data);
  },
  /**
   * 修改维值组
   * @param {*} data
   */
  updateDimensionGroup(data) {
    return httpFetch.put(`${config.baseUrl}/api/dimension/item/group`, data);
  },
  /**
   * 删除维值组
   * @param {*} id
   */
  deleteDimensionGroup(id) {
    return httpFetch.delete(`${config.baseUrl}/api/dimension/item/group/${id}`);
  },
  /**
   * 批量删除维值组
   * @param {*} ids
   */
  batchDeleteDimensionGroup(ids) {
    return httpFetch.delete(`${config.baseUrl}/api/dimension/item/group/batch`, ids);
  },
  /**
   * 获取子维值
   * @param params
   */
  getDimensionItem(params) {
    return httpFetch.get(`${config.baseUrl}/api/dimension/item/group/subDimensionItem/query`, params);
  },
  /**
   * 弹窗获取分配子维值
   * @param params
   */
  getDistributeDimensionItem(params) {
    return httpFetch.get(`${config.baseUrl}/api/dimension/item/group/subDimensionItem/filter`, params);
  },
  /**
   * 删除子维值
   * @param params
   */
  deleteDimensionItem(groupId, id) {
    return httpFetch.delete(`${config.baseUrl}/api/dimension/item/group/subDimensionItem?dimensionItemGroupId=${groupId}&dimensionItemId=${id}`);
  },
  /**
   * 批量删除子维值
   * @param params
   */
  batchDeleteDimensionItem(groupId, ids) {
    return httpFetch.delete(`${config.baseUrl}/api/dimension/item/group/subDimensionItem/batch?dimensionItemGroupId=${groupId}`, ids);
  },
  /**
   * 批量分配子维值
   * @param params
   */
  distributeDimensionItem(groupId,ids) {
    return httpFetch.post(`${config.baseUrl}/api/dimension/item/group/subDimensionItem/batch?dimensionItemGroupId=${groupId}`, ids);
  },
  /**
   * 维度详情
   * @param {*} id
   */
  getDimensionDetail(id) {
    return httpFetch.get(`${config.baseUrl}/api/dimension/${id}`);
  },
  /**
   * 维值组详情
   * @param {*} id
   */
  getDimensionGroupDetail(id) {
    return httpFetch.get(`${config.baseUrl}/api/dimension/item/group/${id}`);
  },
}
