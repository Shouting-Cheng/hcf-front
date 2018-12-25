import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 获取参数设置列表
     * @param {*} params 
     */
    getParamsSettingList(params) {
        return httpFetch.get(`${config.authUrl}/api/data/auth/table/properties/query`, params);
    },
    /**
     * 新增参数设置
     * @param {*} params 
     */
    addParamsSetting(params) {
        return httpFetch.post(`${config.authUrl}/api/data/auth/table/properties`, params);
    },
    /**
     * 删除参数设置
     * @param {*} params 
     */
    deleteParamsSetting(id) {
        return httpFetch.delete(`${config.authUrl}/api/data/auth/table/properties/${id}`);
    },
    /**
     * 更新参数设置
     * @param {*} params 
     */
    updateParamsSetting(params) {
        return httpFetch.put(`${config.authUrl}/api/data/auth/table/properties`, params);
    },
}