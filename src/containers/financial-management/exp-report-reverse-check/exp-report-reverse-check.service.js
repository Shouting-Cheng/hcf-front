import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 查询所有已提交待审核的费用反冲单据
   */
  getList(params) {
    // return httpFetch.get(`${config.baseUrl}/api/report/reverse/get/reverse/by/own?`, params);
    return httpFetch.get(
      `${config.baseUrl}/api/report/reverse/get/reverse/by/own/?reverseStatus=1002`,
      params
    );
  },
  /**查询所有已审核的费用反冲单据 */
  getCheckedList(params) {
    return httpFetch.get(
      `${config.baseUrl}/api/report/reverse/get/reverse/by/own?reverseStatus=1004`,
      params
    );
  },
  /**
   * 获取基本信息数据
   */
  getBasicInfo(id) {
    return httpFetch.get(`${config.baseUrl}/api/report/reverse/get/detail/by/header/id?id=${id}`);
  },
  /**
   * 审批历史
   */
  getHistory(id) {
    return httpFetch.get(
      `${config.baseUrl}/api/report/reverse/getHistory?entityType=801007&id=${id}`
    );
  },
  /**
   * 通过驳回
   * status:
   * 1004  通过 1005  驳回
   */
  reportReverseUpdateStatus(id, remark, status, userId) {
    return httpFetch.put(
      `${
        config.baseUrl
      }/api/report/reverse/update/status?id=${id}&remark=${remark}&status=${status}&userId=${userId}`
    );
  },
  /**
   * 创建凭证
   */
  createCredence(reverseHeaderId, credenceDate) {
    return httpFetch.put(
      `${
        config.baseUrl
      }/api/report/reverse/create/account?reverseHeaderId=${reverseHeaderId}&accountDate=${credenceDate}`
    );
  },
  /**
   * 获取凭证
   */
  getCredence(tenantId, transactionHeaderId, page, size) {
    return httpFetch.post(
      `${
        config.accountingUrl
      }/api/accounting/gl/journal/lines/query/by/line?tenantId=${tenantId}&sourceTransactionType=EXP_REVERSE&transactionHeaderId=${transactionHeaderId}&page=${page}&size=${size}`,
      []
    );
  },
};
