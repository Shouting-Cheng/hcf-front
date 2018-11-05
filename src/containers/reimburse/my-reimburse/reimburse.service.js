import config from 'config'
import httpFetch from 'utils/httpFetch'

export default {
  //根据用户查询帐套信息
  getSetOfBooks(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/setOfBooks/selectSetOfBooksByUserOid?userOid=${userOID}`)
  },
  //查询表单设置信息
  getFormSet(formOID) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${formOID}`)
  },
  //根据用户id查询用户信息
  getUserInfo(userOid) {
    return httpFetch.get(`${config.baseUrl}/api/users/oid/${userOid}`)
  },
  //查询当前用户可用币种
  getCurrencyCode() {
    return httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll`);
  },
  //获得自定义列表
  getCustomEnumeration(customEnumerationOID) {
    return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/${customEnumerationOID}/simple`);
  },
  //得到用户的银行账号信息
  getBankData(name) {
    return httpFetch.get(`${config.baseUrl}/prepayment/api/cash/prepayment/requisitionHead/getReceivablesByName?name=${name}`);
  },
  //新建对账单
  newReimburse(params) {
    return httpFetch.post(`${config.baseUrl}/api/expReportHeader/insertOrUpdate`, params);
  },
  /**
   * 获取报账单详情
   * @param {*} id
   */
  getReimburseDetailById(id) {
    return httpFetch.get(`${config.baseUrl}/api/expReportHeader/${id}`);
  },
  /**
   * 获取费用明细
   * @param {*} id
   * @param {*} page
   */
  getCostLineInfo(id, page,pageSize, expenseTypeId) {
    return httpFetch.get(`${config.baseUrl}/api/expReportLine/query?expReportHeaderId=${id}&size=${pageSize}&page=${page}&expenseTypeId=${expenseTypeId}`)
  },

  /**
   * 获取所有费用类型
   */
  getAllCostType() {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/279673ce-9c6d-4487-b3b2-d1a3eb5e1de1/selected/expense/types`)
  },

  /**
   * 获取开票类型
   */
  getAllInvoiceType() {
    return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=1012`);
  },

  /**
   * 获取税率
   */
  getRate(value) {
    return httpFetch.get(`${config.baseUrl}/api/custom/enumeration/tax/rate?receiptValue=${value}`);
  },

  /**
   * 获取公司
   */
  getCompanyList(value) {
    return httpFetch.get(`${config.baseUrl}/api/company/by/condition?setOfBooksId=${value}`);
  },

  /**
   * 获取部门
   */
  getDepartmentList(value) {
    return httpFetch.get(`${config.baseUrl}/api/departments/root/v2?flag=1001`);
  },

  /**
   * 获取成本中心数据
   */
  getCostList(value) {
    return httpFetch.get(`${config.baseUrl}/api/my/cost/center/items/${value}?name=&page=0&size=20&sort=code`);
  },

  /**
   * 获取核销列表
   */
  getWriteOffList({ tenantId, companyId, partnerCategory, partnerId, formId, exportHeaderId, contractId, documentLineId, currencyCode, page, contractHeaderId }) {
    let params = `tenantId=${tenantId}&companyId=${companyId}&partnerCategory=${partnerCategory}&partnerId=${partnerId}&formId=${formId}&exportHeaderId=${exportHeaderId}&page=${page}&size=5&documentType=PUBLIC_REPORT&documentLineId=${documentLineId}&currencyCode=${currencyCode}&contractId=${contractHeaderId || ""}`;
    return httpFetch.get(`${config.payUrl}/api/payment/cash/write/off/query?${params}`);
  },

  /**
   * 获取审批人列表
   */
  getApproverList() {
    return httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/get/users/by/department/and/company?&page=0&size=9999&companyId=&departmentId=`);
  },


  /**
   * 获取收款方列表
   */
  getReceivables(value, type = 1003) {
    return httpFetch.get(`${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName?pageFlag=false&name=${value}&empFlag=${type}`);
  },

  /**
   * 获取默认分摊行信息
   * @param {*} id
   */
  getDefaultApportion(id) {
    return httpFetch.get(`${config.baseUrl}/api/expReportHeader/default/apportion/${id}`);
  },

  /**
    * 新建费用行
    * @param {*} params
    */
  newReportLine(params) {
    return httpFetch.post(`${config.baseUrl}/api/expReportLine`, params);
  },

  /**
    * 新建计划付款行
    * @param {*} params
    */
  newPayLine(params) {
    return httpFetch.post(`${config.baseUrl}/api/expense/payment/schedules`, params);
  },

  /**
     * 获取计划付款行列表
     * @param {*} id
     */
  getPayLineList(id, page,pageSize) {
    return httpFetch.get(`${config.baseUrl}/api/expense/payment/schedules/query?expReportHeaderId=${id}&size=${pageSize}&page=${page}`);
  },

  /**
     * 获取费用行详细信息
     * @param {*} id
     */
  getCostDetail(id) {
    return httpFetch.get(`${config.baseUrl}/api/expReportLine/${id}`);
  },

  /**
   * 删除费用行
   * @param {*} id
   */
  deleteCostDetail(id) {
    return httpFetch.delete(`${config.baseUrl}/api/expReportLine/${id}`);
  },

  /**
  * 删除付款行
  * @param {*} id
  */
  deletePayDetail(id) {
    return httpFetch.delete(`${config.baseUrl}/api/expense/payment/schedules/${id}`);
  },

  /**
   * 获得付款用途数据源
   * @param {*} id
   */
  queryCashTransactionClassForForm(id) {
    return httpFetch.get(`${config.baseUrl}/api/expense/form/assign/cash/transaction/classes/queryCashTransactionClassForForm?formOid=${id}`);
  },

  /**
  * 获取合同列表
  * @param {*} id
  */
  getContractList(id) {
    let url = `${config.baseUrl}/contract/api/contract/document/relations/associate/query?page=${page}&size=${pageSize}`;
    return httpFetch.get(url);
  },

  /**
  * 核销
  * @param {*} data
  */
  writeOff(data) {
    let url = `${config.payUrl}/api/payment/cash/write/off/do`;
    return httpFetch.post(url, data);
  },

  /**
  * 删除报账单
  * @param {*} id
  */
  deleteExpReportHeader(id) {
    let url = `${config.baseUrl}/api/expReportHeader/${id}`;
    return httpFetch.delete(url);
  },

  /**
  * 提交前检查预算
  * @param {*} id
  */
  checkBudget(id) {
    let url = `${config.baseUrl}/api/expReportHeader/check/budget/${id}`;
    return httpFetch.post(url);
  },

  /**
 * 从账本导入
 * @param {*} params
 */
  import(params) {
    let url = `${config.baseUrl}/api/expReportLine/import`;
    return httpFetch.post(url, params);
  },

  /**
   * 提交
   * @param {*} params
   */
  submit(params) {
    let url = `${config.baseUrl}/api/expReportHeader/submit`;
    return httpFetch.post(url, params);
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
   * 获取审批历史
   * @param {*} params
   */
  getReportsHistory(entityOID) {
    let url = `${config.baseUrl}/api/budget/journa/reports/history?entityType=801001&entityOID=${entityOID}`;
    return httpFetch.get(url);
  },

  /**
 * 获取申请单列表
 * @param {*} params
 */
  getApplicationList(expenseTypeId, currencyCode, expReportHeaderId) {
    let url = `${config.baseUrl}/api/application/related/expense?expenseTypeId=${expenseTypeId}&currencyCode=${currencyCode}&expReportHeaderId=${expReportHeaderId}`;
    return httpFetch.get(url);
  },

  /**
   * 创建凭证
   * @param {*} headerId
   * @param accountDate 凭证日期 yyyy-mm-dd格式
   */
  createAccounting(headerId, accountDate) {
    let url = `${config.baseUrl}/api/expReport/create/account/entry/${headerId}/${accountDate}`;
    return httpFetch.get(url);
  },

  /**
  * 查询凭证 弃用
  * @param {*} params
  */
  getAccountingInfo(params) {
    let url = `${config.accountingUrl}/api/accounting/gl/journal/lines/query/by/line?tenantId=${params.tenantId}&sourceTransactionType=${params.sourceTransactionType}&transactionHeaderId=${params.transactionHeaderId}&page=${params.page}&size=${params.size}`;
    return httpFetch.post(url,[]);
  },

  /**
  * 查询凭证 ,改用 transactionNumber + sourceTransactionType查询
  * @param {*} params
  */
  getAccountingInfoByNumber(params) {
    let url = `${config.accountingUrl}/api/accounting/gl/journal/lines/query/by/transaction/number?tenantId=${params.tenantId}&sourceTransactionType=${params.sourceTransactionType}&transactionNumber=${params.transactionNumber}&page=${params.page}&size=${params.size}`;
    return httpFetch.post(url);
  },



  /**
 * 凭证审核
 * @param {*} params
 */
  auditAccounting(headerId, actionType, commons) {
    //处理未填写审批意见的情况
    if(commons == 'undefined'){
      commons = '';
    }
    let url = `${config.baseUrl}/api/expReport/audit?headerId=${headerId}&actionType=${actionType}&commons=${commons}`;
    return httpFetch.post(url);
  },
  /**
  * 获取报账单详情
  * @param {*} id
  */
  getReimburseBasicDetailById(id) {
    return httpFetch.get(`${config.baseUrl}/api/expReport/${id}`);
  },
  /**
  * 取租户下配置的科目段集合
  * @param {*} setOfBooksId
  */
  getAccountingSegment(setOfBooksId) {
    let url = `${config.accountingUrl}/api/general/ledger/segments/query/by/setOfBooks?setOfBooksId=${setOfBooksId}`;
    return httpFetch.get(url);
  },
  /**
  * 获取费用行
  * @param {*} lineId
  */
  getApprotionLine(lineId) {
    let url = `${config.baseUrl}/api/expReportLine/lineApprotion/${lineId}`;
    return httpFetch.get(url);
  },
  /**
   * 获取费用凭证信息
   */
  getVoucherInfo(tenantId,sourceTransactionType,transactionNumber){
    let url=`${config.accountingUrl}/api/accounting/gl/journal/lines/query/by/transaction/number?tenantId=${tenantId}&sourceTransactionType=${sourceTransactionType}&transactionNumber=${transactionNumber}`
    return httpFetch.post(url)
  },

  /**
   * 获取成本中心信息
   * @param setOfBooksId
   */
  getAccountingCostCenter(setOfBooksId) {
    let url = `${config.baseUrl}/api/cost/center/by/setOfBooks?setOfBooksId=${setOfBooksId}`;
    return httpFetch.get(url);
  },

  /**
   * 获取银行账户通过员工
   * @param userID
   */
  getAccountByUserId(userID) {
    let url = `${config.baseUrl}/api/contact/bank/account/user/id?userID=${userID}`;
    return httpFetch.get(url);
  },

  /**
   * 获取银行账户通过供应商
   * @param vendorId
   */
  getAccountByVendorId(vendorId) {
    let url = `${config.vendorUrl}/api/ven/bank?page=0&size=999&vendorInfoId=${vendorId}`;
    return httpFetch.get(url);
  }


}
