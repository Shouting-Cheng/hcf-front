
import httpFetch from 'share/httpFetch';
import config from 'config';

export default {
   /**
    * 获取维值数据
    * @param {*} params
    */
   getDimensionList(params) {
      return httpFetch.get(`${config.baseUrl}/api/dimension/item/page/by/cond`,params);
   },
   /**
    * 新增维值
    * @param {*} params
    */
   addNewDimensionValue(params) {
      const url = `${config.baseUrl}/api/dimension/item`;
      return httpFetch.post(url,params);
   },
   /**
    * 修改维值
    * @param {*} params
    */
   upDateDimensionValue(params) {
      const url = `${config.baseUrl}/api/dimension/item`;
      return httpFetch.put(url,params)
   },
   /**
    * 删除维值
    * @param {*} params
    */
   delDimensionValue(dimensionItemId) {
      return httpFetch.delete(`/api/dimension/item/${dimensionItemId}`)
   },
   /**
    * 查询维值详情
    * @param {*} params
    */
   getCurrentDimensionValue(dimensionItemId) {
       const url = `${config.baseUrl}/api/dimension/item/${dimensionItemId}`;
       return httpFetch.get(url);
   },
    /**
    * 关联公司，获取公司数据
    * @param {*} params
    */
   getCompanyList(params) {
      const url = `${config.baseUrl}/api/dimension/item/assign/company/query`;
      return httpFetch.get(url,params);
   },
   /**
    * 新增公司信息
    * @param {*} params
    */
   addNewCompanyData(params) {
       const url = `${config.baseUrl}/api/dimension/item/assign/company/batch`;
       return httpFetch.post(url,params);
   },
   /**
    * 公司状态：启用/关闭
    * @param {*} params
    */
   toEnableTheCompany(params) {
       const url = `${config.baseUrl}/api/dimension/item/assign/company/batch`;
       return httpFetch.put(url, params);
   },
}
