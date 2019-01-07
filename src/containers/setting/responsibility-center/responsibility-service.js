import config from 'config';
import httpFetch from 'share/httpFetch';

export default{
    /**
     * 
     * 保存新建责任中心
     */
    saveResponsibility(params){
        let url = `${config.baseUrl}/api/responsibilityCenter/insertOrUpdate`;
        return httpFetch.post(url, params);
    },
    /**
     * 
     * 保存新建责任中心组
     */
    saveResponsibilityGroup(params){
        let url = `${config.baseUrl}/api/responsibilityCenter/group/insertOrUpdate`;
        return httpFetch.post(url, params);
    },
    deleteResponsibility(id){
        let url=`${config.baseUrl}/api/responsibilityCenter/delete/${id}`;
        return httpFetch.delete(url)
    },
    deleteResponsibilityGroup(id){
        let url=`${config.baseUrl}/api/responsibilityCenter/group/delete/${id}`;
        return httpFetch.delete(url)
    },
}