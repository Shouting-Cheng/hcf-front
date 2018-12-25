import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 首页查询
   */
  workOrderHeadQuery(params) {
    return httpFetch.get(
      `${config.accountingUrl}/api/general/ledger/work/order/head/query`,
      params
    );
  },
  /**
   * 获取核算工单类型集合
   */
  getTypeList(userId) {
    return httpFetch.get(
      `${
        config.accountingUrl
      }/api/general/ledger/work/order/types/queryByEmployeeId?userId=${userId}&enabled=true`
    );
  },
  /**
   * 获取币种集合
   */
  getCurrency(setOfBooksId, tenantId) {
    return httpFetch.get(
      `${
        config.baseUrl
      }/api/currency/rate/list?enable=true&setOfBooksId=${setOfBooksId}&tenantId=${tenantId}`
    );
  },
  /**
   * 根据oid获取id-部门
   */
  getDepartmentId(departmentOid) {
    return httpFetch.get(`${config.baseUrl}/api/departments/${departmentOid}`);
  },
  /**
   * 核算工单新增更新
   */
  orderInsert(params) {
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/work/order/head`, params);
  },
  /**
   * 根据头id获取单据头信息
   */
  getHeaderData(id, page, size) {
    return httpFetch.get(
      `${config.accountingUrl}/api/general/ledger/work/order/head/${id}?page=${page}&size=${size}`
    );
  },
  /**
   * 核算工单行保存更新
   */
  saveLineData(params) {
    return httpFetch.post(
      `${config.accountingUrl}/api/general/ledger/work/order/head/insertOrUpdateLine`,
      params
    );
  },
  /**
   * 核算工单行删除
   */
  delLineData(lineId) {
    return httpFetch.delete(
      `${config.accountingUrl}/api/general/ledger/work/order/head/delete/line/${lineId}`
    );
  },
  /**
   * 获取审批历史
   */
  getHistory(documentOid) {
    return httpFetch.get(
      `${config.baseUrl}/api/accounting/reports/history?entityType=801008&entityOid=${documentOid}`
    );
  },
  /**
   * 核算工单整单删除
   */
  delDocument(headerId) {
    return httpFetch.delete(
      `${config.accountingUrl}/api/general/ledger/work/order/head/delete/head/line/by/${headerId}`
    );
  },
  /**
   * 核算工单整单提交
   */
  submitDocument(params) {
    return httpFetch.post(`${config.baseUrl}/api/accounting/submit`, params);
  },
  /**
   *工作流撤回
   */
  approvalsWithdraw(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/withdraw`, params);
  },
  /**
   * 导入确定
   */
  importOk(transactionID) {
    return httpFetch.post(
      `${
        config.accountingUrl
      }/api/general/ledger/work/order/head/import/new/confirm/${transactionID}`
    );
  },
};
