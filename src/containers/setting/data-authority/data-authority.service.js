import config from 'config';
import httpFetch from 'share/httpFetch';

export default{
    /**
     * 
     * 删除数据权限
     *  
     * */
    deleteDataAuthority(id){
        return httpFetch.delete(`${config.authUrl}/api/system/data/authority/${id}`);
    },
    /**
     * 定位数据权限详情
     */
    getDataAuthorityDetail(id){
        return httpFetch.get(`${config.authUrl}/api/system/data/authority/detail/${id}`);
    }
}