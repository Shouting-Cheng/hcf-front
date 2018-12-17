import config from 'config'
import httpFetch from 'share/httpFetch'
import app from '../index';

export default {

  /**
   * 得到账本数据
   */
  getAccountBook() {
    let dashboardUserOID = app.getState().user.currentUser.userOID;
    return httpFetch.get(`${config.baseUrl}/api/dashboard/accountbook/${dashboardUserOID}`);
  },

  /**ƒ
   * 得到商务卡数据
   */
  getBusinessCard() {
    let dashboardUserOID = app.getState().user.currentUser.userOID;
    return httpFetch.get(`${config.baseUrl}/api/dashboard/businesscard/${dashboardUserOID}`);
  },

  /**
   * 得到待审批单据总数量
   */
  getWaitForApproveNum() {
    return httpFetch.get(`${config.baseUrl}/api/approvals/amount?finished=false`);
  },

  /**
   * 得到待提报单据
   * @param page
   * @param size
   */
  getPendSubmitList(page, size) {
    return httpFetch.get(`${config.baseUrl}/api/document/draft?pageSize=${size}&pageNumber=${page}`);
  },

  /**
   * 得到企业各信息数量
   */
  getEnterpriseCount() {
    return httpFetch.post(`${config.baseUrl}/api/company/info/count`);
  },

  /**
   * 根据公司得到公告信息
   */
  getCarouselsByCompany(companyOID) {
    return httpFetch.get(`${config.baseUrl}/api/carousels/company/${companyOID}`);
  },

  /**
   * 得到公告信息
   * @param params {enabled}是否可用
   */
  getCarousels(params) {
    return httpFetch.get(`${config.baseUrl}/api/carousels/all`, params);
  },

  /**
   * 获取当前用户未审批单据
   */
  getUnApprovals() {
    return httpFetch.get(`${config.baseUrl}/api/dashboard/approvals/batchfilters`);
  },

  /**
   * 获取公告信息详情
   * @param {*} id 
   */
  getCatouselsContent(id) {
    return httpFetch.get(`${config.baseUrl}/api/carousels/${id}`);
  },

  /***
   * 获取未完成的单据
   */
  getDoingDocument() {
    return httpFetch.get(`${config.baseUrl}/api/dashboard/my/document/2`);
  },

  /***
  * 获取退回的单据
  */
  getBackDocument() {
    return httpFetch.get(`${config.baseUrl}/api/dashboard/my/document/1`);
  },

  /***
   * 获取费用趋势
   */
  getExpenceTrend(startDate, endDate) {
    return httpFetch.get(`${config.baseUrl}/api/dashboard/my/report/cost/trend?startDate=${startDate}&endDate=${endDate}`);
  },

  /***
   * 获取费用占比
   */
  getExpenceRatio(startDate, endDate) {
    return httpFetch.get(`${config.baseUrl}/api/dashboard/my/report/cost/ratio?startDate=${startDate}&endDate=${endDate}`);
  },

  /***
   * 获取付款信息
   */
  getPayInfo(startDate, endDate, type) {
    return httpFetch.get(`${config.payUrl}/api/dashboard/my/report/payment/situation?entityType=${type}&startDate=${startDate}&endDate=${endDate}`);
  }



}
