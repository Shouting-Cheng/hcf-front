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
  }

}
