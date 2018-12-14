import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 获取参数设置列表
   * @param params
   */
  getParamsSettingList(params) {
    return httpFetch.get(`${config.authUrl}/api/data/auth/table/properties/query`, params);
  },
  /**
   * 新增参数设置
   * @param data
   */
  addParamsSetting(data) {
    return httpFetch.post(`${config.authUrl}/api/data/auth/table/properties`, data);
  },
  /**
   * 删除参数设置
   * @param id
   */
  deleteParamsSetting(id) {
    return httpFetch.delete(`${config.authUrl}/api/data/auth/table/properties/${id}`);
  },
  /**
   * 修改参数设置
   * @param {*} data
   */
  updateParamsSetting(data) {
    return httpFetch.put(`${config.authUrl}/api/data/auth/table/properties`, data);
  },
};
