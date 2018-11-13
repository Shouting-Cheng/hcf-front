import config from 'config';
import httpFetch from 'share/httpFetch';

export default{
    /**
     * 
     * 查询数据权限
     */
    getDataAuthority(params){
        return httpFetch.get( `${config.baseUrl}/api/system/data/authority/query`,params);
    }
}