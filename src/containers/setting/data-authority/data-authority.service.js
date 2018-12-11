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
    },
    getSingleDataAuthorityDetail(id,ruleId){
        
        return httpFetch.get(`${config.authUrl}/api/system/data/authority/detail/${id}?ruleId=${ruleId}`);
    },
    /**
     * 获取数据类型
     */
    getDataAuthorityType(){
        return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=3101

        `);
    },
    /**
     * 获取数据范围
     */
    getDataAuthorityRange(){
        return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=3102

        `);
    },
    /**
     * 获取数据取值方式
     */
    getDataAuthorityWay(){
        return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=3103

        `);
    },
    /**
     * 保存单个的数据权限
     */
    saveDataAuthority(params){
        let url = `${config.authUrl}/api/system/data/authority`;
        return httpFetch.post(url, params);
    },
    /**
     * 删除单条数据权限规则
     */
    deletRuleItem(id){
        return httpFetch.delete(`${config.authUrl}/api/data/authority/rule/${id}`);
    },
    /**
     * 获取当前租户下的所有公司
     */
    getTenantCompany(keyWord){
        return httpFetch.get(`${config.baseUrl}/api/company/all/current/tenant?keyWord=${keyWord}`);
       
    },
    getTenantDepartment(keyWord){
        return httpFetch.get(`${config.baseUrl}/api/department/current/tenant?keyWord=${keyWord}`);
    },
    /**
     * 获取具体规则的明细值
     */
    getRuleDetail(ruleId,dataType){
        return httpFetch.get(`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${ruleId}&dataType=${dataType}`);
    }


}