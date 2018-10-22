/**
 * Created by 13576 on 2018/1/30.
 */
/**
 * Created by 13576 on 2018/1/8.
 */
import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  /**
   * 获取付款公司配置列表（分页）
   * */
  getPaymentCompanySetting(params){
    return httpFetch.get(`${config.baseUrl}/api/paymentCompanyConfig/selectByInput`,params)
  },

  /**
   * 保存或者修改付款公司配置
   * */
  addOrUpdataPaymentCompanySetting(params){
    return httpFetch.post(`${config.baseUrl}/api/paymentCompanyConfig/insertOrUpdate`,params)
  },

  /**
   * 删除付款公司配置
   */
  deletePaymentCompanySetting(params){
    return httpFetch.delete(`${config.baseUrl}/api/paymentCompanyConfig/deleteByIds`,params)
  },

  //根据租户查询账套信息
  getSetOfBooksByTenant(){
    return httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`)
  }

}
