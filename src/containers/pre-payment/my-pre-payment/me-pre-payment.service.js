import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  /**
   * 获取我的预付款列表
   * @param {*} params
   */
  getPrePaymentList(params) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/query?`;
    for (let key in params) {
      if (params[key] || params[key] == 0) {
        url += `&${key}=${params[key]}`;
      }
    }
    return httpFetch.get(url);
  },
  /**
   * 通过id获取预付款头信息
   * @param {*} id
   */
  getHeadById(id) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getHeadById?id=${id}`;
    return httpFetch.get(url);
  },
  /**
   * 根据id获取预付款单行信息
   * @param {*} id
   */
  getLineByHeadId(params) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getLineByHeadId?`;
    for (let key in params) {
      url += `&${key}=${params[key]}`;
    }
    return httpFetch.get(url);
  },
  /**
   * 根据id获取行金额总和
   * @param {*} id
   */
  getAmountByHeadId(id) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getAmountByHeadId?headId=${id}`;
    return httpFetch.get(url);
  },
  /**
   * 获取走工作流的审批历史
   * @param {*} entityOid
   */
  getApproveHistoryWorkflow(entityOid) {
    let url = `${config.baseUrl}/api/prepayment/reports/history?entityType=801003&entityOid=${entityOid}`;
    return httpFetch.get(url);
  },
  /**
   * 获取不走工作流的审批历史
   * @param {*} id
   */
  getApproveHistory(id) {
    let url = `${config.prePaymentUrl}/api/prepayment/log/get/all/by/id?id=${id}`;
    return httpFetch.get(url);
  },
  /**
   * 提交单据（不走工作流）
   * @param {*} id
   */
  submit(id, userId) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/updateStatus?id=${id}&status=1002&userId=${userId}`;
    return httpFetch.post(url, {});
  },
  /**
   * 提交单据（走工作流）
   * @param {*} params
   */
  submitToWorkflow(params) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/submit`;
    return httpFetch.post(url, params);
  },
  /**
   * 撤回（不走工作流）
   * @param {*} id
   */
  back(id, userId) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/updateStatus?id=${id}&status=1003&userId=${userId}`;
    return httpFetch.post(url, {});
  },
  /**
   * 撤回（走工作流）
   * @param {*} params
   */
  backFromWorkflow(params) {
    let url = `${config.baseUrl}/api/workflow/withdraw`;
    return httpFetch.post(url, params);
  },
  /**
   * 添加预付款头信息
   * @param {*} params
   */
  addPrepaymentHead(params) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead`;
    return httpFetch.post(url, params);
  },
  /**
   * 删除预付款单通过id
   * @param {*} id
   */
  deleteHeadAndLineByHeadId(id) {
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/deleteHeadAndLineByHeadId?headId=${id}`;
    return httpFetch.delete(url);
  },
  /**
   * 获取收款方列表
   */
  getPartnerd(value, type = 1003) {
    return httpFetch.get(`${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName?&page=0&size=9999&name=${value}&empFlag=${type}`);
  },
  /**
   * 获取新建预付款单所需单据类型
   */
  getPrePaymentType(params) {
    return httpFetch.get(`${config.prePaymentUrl}/api/cash/pay/requisition/types/queryByEmployeeId`, params);
  }
}
