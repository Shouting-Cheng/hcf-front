import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
 /**
   * 根据报销单头ID集合，批量删除报销单
   * @param {*} ids
   */
  batchDeleteReport(ids) {
    return httpFetch.post(`${config.trainUrl}/api/training/report/header/batch/delete`, ids);
  },

  /**
   * 根据报销单头ID，删除报销单
   * @param {*} id
   */
  deleteReport(id) {
    return httpFetch.delete(`${config.trainUrl}/api/training/report/header/${id}`);
  },

  /**
  * 根据报销单行ID，删除报销单行
  * @param {*} id
  */
  deleteReportLine(id) {
    return httpFetch.delete(`${config.trainUrl}/api/training/report/line/${id}`);
  },

  /**
   * 获取报销单列表
   * @param {*} page
   * @param {*} size
   * @param {*} searchParams
   */
  getReportHeadList(page, size, searchParams) {
    let url = `${config.trainUrl}/api/training/report/header/query?&page=${page}&size=${size}`;
    for (const searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

   /**
   * 根据报销单头ID，获取报销单行列表
   * @param {*} page
   * @param {*} size
   * @param {*} headerId
   */
  getReportLineListByHeaderId(page, size,headerId) { 
    let url = `${config.trainUrl}/api/training/report/line/query?&page=${page}&size=${size}&headerId=${headerId}`;
    return httpFetch.get(url);
  },

  /**
   * 更新单行
   * @param {*} record
   */
  updateLine(record) {
    return httpFetch.put(`${config.trainUrl}/api/training/report/line`, record);
  },

  /**
   * 根据报销单头ID，获取报销单头和行的信息
   * @param {*} headerId
   */
  getReportHeadAndLine(headerId) {
    return httpFetch.get(`${config.trainUrl}/api/training/report/header/dto/${headerId}/page`);
  },

  /**
   * 根据账套ID，获取账套下公司列表
   * @param {*} setOfBooksId
   */
  getCompanyListByBooksId(setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/company/by/condition?setOfBooksId=${setOfBooksId}`);
  },

  /**
   * 获取责任部门列表
   */
  getUnitList() {
    return httpFetch.get(`${config.baseUrl}/api/departments/root/v2?flag=1001`);
  },

  /**
   * 根据部门OID，获取人员列表
   * @param {*} departmentOID
   */
  getEmployeeListByUnitOID(departmentOID) {
    return httpFetch.get(`${config.baseUrl}/api/departments/users/${departmentOID}`);
  },

  /**
   * 保存报销单的头行
   * @param {*} params ：包含头行结构的数据
   */
  saveReportHeadAndLine(params) {
    return httpFetch.post(`${config.trainUrl}/api/training/report/header/dto/save`, params);
  },

  /**
   * 提交报销单
   * @param {*} headerId
   */
  submitReport(headerId) {
    return httpFetch.put(`${config.trainUrl}/api/training/report/header/submit/${headerId}`);
  },

  /**
   * 更新报销单头
   * @param {*} record
   */
  updateHeader(record) {
    return httpFetch.put(`${config.trainUrl}/api/training/report/header`, record);
  }
};
