/**
 * Created by 13576 on 2018/1/30.
 */
import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  /**
   * 获取付款公司配置列表（分页）
   * */
  getPaymentCompanySetting(params) {
    return httpFetch.get(`${config.baseUrl}/api/paymentCompanyConfig/selectByInput`, params)
  },

  /**
   * 保存或者修改付款公司配置
   * */
  addOrUpdataPaymentCompanySetting(params) {
    return httpFetch.post(`${config.baseUrl}/api/paymentCompanyConfig/insertOrUpdate`, params)
  },

  /**
   * 删除付款公司配置
   */
  deletePaymentCompanySetting(params) {
    return httpFetch.delete(`${config.baseUrl}/api/paymentCompanyConfig/deleteByIds`, params)
  },


  //根据租户查询帐套信息
  getSetOfBooksByTenant() {
    return httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`)
  },
  //获取对公报账单类型接口，根据公司和是否启用
  getDocumentType(companyId) {
    return httpFetch.get(`${config.baseUrl}/api/expReportHeader/custom/forms?formType=801001&companyId=${companyId}&enabledFlag=1`)
  },
  //获取付款申请单类型接口，根据公司和是否启用
  getPaymentType(companyId){
    return httpFetch.get(`${config.payUrl}/api/acp/request/type/queryByCompanyId/${companyId}?page=0&size=10&id=&acpReqTypeCode=&description=`);
  },
  //获取预付款单类型接口，根据公司和是否启用
  getPrePaymentType(companyId,setOfBookId){
    return httpFetch.get(`${config.prePaymentUrl}/api/cash/pay/requisition/types/queryAll?setOfBookId=${setOfBookId}&isEnabled=true&assginEnable=true&companyId=${companyId}`)
  }

}
