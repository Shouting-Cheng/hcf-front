import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 获取列表
     * @param {*} params
     */
    getParamsSettingList(params) {
        return httpFetch.get(`${config.baseUrl}/api/dimension/page/by/cond`, params);
    },
    /**
     * 创建维度
     * @param {*} params
     */
    addParamsSetting(params) {
        return httpFetch.post(`${config.baseUrl}/api/dimension`, params);
    },
    /**
     * 更改维度
     * @param {*} params
     */
    editParamsSetting(params) {
      return httpFetch.put(`${config.baseUrl}/api/dimension`, params);
  },
    /**
     * 删除参数设置
     * @param {*} params
     */
    deleteParamsSetting(id) {
        return httpFetch.delete(`${config.baseUrl}/api/dimension/{dimensionId}${id}`);
    },
    /**
     *条件查询
     */
    queryParamsSetting(id) {
      return httpFetch.get(`${config.baseUrl}/api/dimension/page/by/cond${id}`);
  },
  /**
   * 查询维度序号
   */
  NumberParamsSetting(id) {
    return httpFetch.get(`${config.baseUrl}/api/dimension/list/unselected/sequence/by/{setOfBooksId}${id}`);
},
}
