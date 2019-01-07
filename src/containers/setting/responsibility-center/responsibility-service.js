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
    }
}