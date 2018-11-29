/**
 * Created by 13576 on 2018/3/23.
 */
import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 查询费用调整单头（分页）
   * @param ={
   *  expAdjustHeaderNumber:"",
   *  expAdjustTypeId:"",
   *  status:"",
   *  dateTimeFrom:"",
   *  dateTimeTo:"",
   *  amountMin:"",
   *  amountMax:"",
   *  employeeId:"",
   *  language:"",
   *  page:"",
   *  size:"",
   * }
   * */
  getExpenseAdjustHead(params) {
    return httpFetch.get(`${config.baseUrl}/api/expense/adjust/headers/query/dto`, params);
  },

  /**
   * 查询费用调整单头(单个)
   * */
  getExpenseAdjustHeadById(id) {
    return httpFetch.get(
      `${config.baseUrl}/api/expense/adjust/headers/query/id?expAdjustHeaderId=${id}`
    );
  },

  /**
   * 添加费用调整单头
   * */
  addExpenseAdjustHead(params) {
    return httpFetch.post(`${config.baseUrl}/api/expense/adjust/headers`, params);
  },

  /**
   * 修改费用调整单头
   * */
  upExpenseAdjustHead(params) {
    return httpFetch.put(`${config.baseUrl}/api/expense/adjust/headers`, params);
  },

  /**
   * 删除费用调整单
   * */
  deleteExpenseAdjustHead(id) {
    return httpFetch.delete(`${config.baseUrl}/api/expense/adjust/headers/${id}`);
  },

  /**
   * 查询费用调整单行(分页)
   * @param = {
   *  expAdjustHeaderId:"",
   *  page:0,
   *  size:10
   * }
   * */
  getExpenseAdjustLine(params) {
    return httpFetch.get(
      `${config.baseUrl}/api/expense/adjust/lines/query/dto/by/header/id`,
      params
    );
  },

  /**
   * 查询费用调整单行(单个)
   * */
  getExpenseAdjustLineById(id) {
    return httpFetch.get(`${config.baseUrl}/api/expense/adjust/lines/query/dto/by/id?id=${id}`);
  },

  /**
   * 删除费用调整单行
   * */
  deleteExpenseAdjustLine(id) {
    return httpFetch.delete(`${config.baseUrl}/api/expense/adjust/lines/${id}`);
  },

  /**
   * 添加费用调整单行
   * */
  addExpenseAdjustLine(params) {
    return httpFetch.post(`${config.baseUrl}/api/expense/adjust/lines`, params);
  },

  /**
   * 修改费用调整单行
   * */
  upExpenseAdjustLine(params) {
    return httpFetch.put(`${config.baseUrl}/api/expense/adjust/lines`, params);
  },

  /**
   * 获取费用类型
   * */
  getExpenseTypeByExpenseAdjustType(params) {
    return httpFetch.get(`${config.baseUrl}/api/expense/adjust/types/getExpenseType`, params);
  },

  //获取费用类型
  getExpenseTypes(params) {
    return httpFetch.get(
      `${config.baseUrl}/api/expense/adjust/types/queryExpenseAdjustType`,
      params
    );
  },

  /*
  * 获取维度和对应的维值
  * */
  getDimensionAndValue(expAdjustTypeId) {
    return httpFetch.get(
      `${
        config.baseUrl
      }/api/expense/adjust/headers/query/dimension/dto?expAdjustTypeId=${expAdjustTypeId}`
    );
  },

  /*根据id查询费用类型*/
  getExpenseAdjustTypeById(id) {
    return httpFetch.get(`${config.baseUrl}/api/expense/adjust/types/${id}`);
  },

  getDeptByOid(oid) {
    return httpFetch.get(`${config.baseUrl}/api/departments/${oid}`);
  },

  /**
   * 提交前检查预算
   * @param {*} id
   */
  checkBudgetAndSubmit(id) {
    let url = `${config.baseUrl}/api/expense/adjust/headers/check/budget/${id}`;
    return httpFetch.post(url);
  },

  //提交费用调整单单据（走工作流）
  submitOnWorkflow(id, ignoreBudgetWarningFlag) {
    return httpFetch.get(`${config.baseUrl}/api/expense/adjust/headers/preSubmit?headerId=${id}`);
  },
  //提交费用调整单单据（走工作流）
  forceSubmitOnWorkflow(params) {
    return httpFetch.post(`${config.baseUrl}/api/expense/adjust/headers/forceSubmit`, params);
  },

  /**
   * 撤回
   * @param {*} params
   */
  withdraw(params) {
    let url = `${config.baseUrl}/api/approvals/withdraw`;
    return httpFetch.post(url, params);
  },

  /**
   * 拒绝
   * @param {*} params
   */
  reject(params) {
    let url = `${config.baseUrl}/api/approvals/reject`;
    return httpFetch.post(url, params);
  },

  /**
   * 通过
   * @param {*} params
   */
  pass(params) {
    let url = `${config.baseUrl}/api/approvals/pass`;
    return httpFetch.post(url, params);
  },

  /**
   * 获取走工作流的审批历史
   * @param {*} entityOID
   */
  getApproveHistoryWorkflow(entityOID) {
    let url = `${
      config.baseUrl
    }/api/expense/adjust/headers/history?entityType=801006&entityOID=${entityOID}`;

    return httpFetch.get(url);
  },
  /**
   * 获取审批费用调整单待审批列表
   * @param {*} params
   */
  getAdjustApproveList(params) {
    let url = `${config.baseUrl}/api/approvals/expense/adjust/filters?`;
    for (let key in params) {
      if (params[key] || params[key] == 0) {
        url += `&${key}=${params[key]}`;
      }
    }
    return httpFetch.get(url);
  },

  //获取凭证信息
  getVoucherInfo(params) {
    return httpFetch.post(
      `${
        config.accountingUrl
      }/api/accounting/gl/journal/lines/query/by/transaction/number?tenantId=${
        params.tenantId
      }&sourceTransactionType=${params.sourceTransactionType}&transactionNumber=${
        params.transactionNumber
      }&page=${params.page}&size=${params.size}`
    );
  },

  //获取导入成功后的分摊行信息
  getImportDetailData(oid) {
    return httpFetch.get(`${config.baseUrl}/api/expense/adjust/lines/query/temp/by/${oid}`);
  },
  //导入完成
  importData(oid) {
   return httpFetch.post(`${config.baseUrl} /api/expense/adjust/lines/import/new/confirm/${oid}`);
  },
};
