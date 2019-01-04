import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 获取参数设置列表
     * @param {*} params
     */
    getParamsSettingList(params) {
        return httpFetch.get(`${config.authUrl}/api/dimension/list/unselected/sequence/by/{setOfBooksId}`, params);
    },
    /**
     * 新增参数设置
     * @param {*} params
     */
    addParamsSetting(params) {
        return httpFetch.post(`${config.authUrl}/api/dimension`, params);
    },
    /**
     * 编辑参数设置
     * @param {*} params
     */
    editParamsSetting(params) {
        return httpFetch.put(`${config.authUrl}/api/dimension`, params);
    },
    /**
     * 删除参数设置
     * @param {*} params
     */
    deleteParamsSetting(id) {
        return httpFetch.delete(`${config.authUrl}/api/dimension/{dimensionId}${id}`);
    },
    /**
     *条件查询
     */
    queryParamsSetting(id) {
        return httpFetch.get(`${config.authUrl}/api/dimension/page/by/cond${id}`);
    },
    /**
     * 查询序号
     */
    NumberParamsSetting(id) {
        return httpFetch.get(`${config.authUrl}/api/dimension/page/by/cond${id}`);
    }
}
