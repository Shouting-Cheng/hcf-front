/**
 * Created by Allen on 2018/5/7.
 */
import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  /**
   * 获取可反冲列表（分页）
   * @param ={
   *  businessClass:"",
   *  documentTypeId:"",
   *  documentCode:"",
   *  applyDateFrom:"",
   *  applyDateTo:"",
   *  amountFrom:"",
   *  amountTo:"",
   *  applyId:"",
   *  companyId:"",
   *  departmentId:"",
   *  currency:"",
   *  reverseAmountFrom::"",
   *  reverseAmoutTo:"",
   *  page:"",
   *  size:"",
   * }
   * */
  reverseList(params){
    return httpFetch.get(`${config.baseUrl}/api/report/reverse/get/result`,params)
  },

  /**
   * 获取我发起的反冲列表（分页）
   * @param ={
   * reportReverseNumber:"",
   *  businessClass:"",
   *  sourceDocumentTypeId:"",
   *  sourceDocumentCode:"",
   *  reverseDateFrom:"",
   *  reverseDateTo:"",
   *  reverseAmountFrom:"",
   *  reverseAmountTo:"",
   *  applyId:"",
   *  reverseStatus:"",
   *  description: "",
   *  createdBy:"",
   *  page:"",
   *  size:"",
   * }
   * */
  myReverseList(params){
    return httpFetch.get(`${config.baseUrl}/api/report/reverse/get/reverse/by/own`,params)
  },

  //发起
  reverseDetail(params){
    return httpFetch.get(`${config.baseUrl}/api/report/reverse/to/reverse?id=${params.id}&businessClass=${params.businessClass}&description=${params.description}&companyId=${params.companyId}&departmentOid=${params.departmentId}`)
  },

  //保存新建反冲
  saveReverse(params){
    return httpFetch.put(`${config.baseUrl}/api/report/reverse/save/remark?id=${params.id}&description=${params.description}&companyId=${params.companyId}&departmentOid=${params.departmentId}`)
  },

  //根据费用反冲单据头id获取报销单详情
  getExpenseDetail(id){
    return httpFetch.get(`${config.baseUrl}/api/report/reverse/get/detail/by/header/id?id=${id}`)
  },

  //查询费用行
  getExpenseLine(page,pageSize,params){
    return httpFetch.post(`${config.baseUrl}/api/exp/report/reverse/line/get/all?page=${page}&size=${pageSize}`, params)
  },

  //查询冲销费用信息行上总金额
  queryAmount(id) {
    return httpFetch.get(`${config.baseUrl}/api/exp/report/reverse/line/getLineTotalAmount/by/headerId?headerId=${id}`)
  },

  //保存费用反冲行
  saveExpenseLine(id,params){
    return httpFetch.post(`${config.baseUrl}/api/exp/report/reverse/line/insert/batch?reverseHeaderId=${id}`,params)
  },

  //通过反冲费用头id获取费用反冲单行信息，分页
  getReverseLine(id,page,pageSize){
    return httpFetch.get(`${config.baseUrl}/api/exp/report/reverse/line/get/lines/by/headId?headerId=${id}&page=${page}&size=${pageSize}`)
  },

  //通过反冲费用头id获取费用反冲行的币种，金额信息
  getReverseAmount(id){
    return httpFetch.get(`${config.baseUrl}/api/exp/report/reverse/line/get/amount/group/by/currency?headerId=${id}`)
  },

  //通过id获取费用反冲单行信息
  getReverseExpenseInfo(id){
    return httpFetch.get(`${config.baseUrl}/api/exp/report/reverse/line/get/by/id?id=${id}`)
  },

  //修改费用反冲行
  updataReverseLine(params,body){
    return httpFetch.put(`${config.baseUrl}/api/exp/report/reverse/line/update/by/id?id=${params.id}&voiceType=${params.invoiceType}&description=${params.description}&amount=${params.amount}&exculedTaxAmount=${params.exculedTaxAmount}&taxAmount=${params.taxAmount}&voiceOperationType=${params.invoiceOperationType}`,body)
  },

  //根据id删除费用反冲单行信息
  deleteReverseLine(id){
    return httpFetch.delete(`${config.baseUrl}/api/exp/report/reverse/line/delete/by/id?id=${id}`)
  },

  //根据费用反冲头id查询费用反冲支付行
  getReversePayLine(reverseHeaderId,page,pageSize){
    return httpFetch.get(`${config.baseUrl}/api/reverse/csh/data/getCashData/by/reverse/headerId?reverseHeaderId=${reverseHeaderId}&page=${page}&size=${pageSize}`)
  },

  //根据费用反冲头id查询可添加的支付行信息
  getUpaidLineList(params){
    return httpFetch.get(`${config.baseUrl}/api/reverse/csh/data/get/can/reverse/pay/data?reverseHeaderId=${params.id}&page=${params.page}&size=${params.size}&partnerCategory=${params.partnerCategory ?params.partnerCategory : ''}&partnerId=${params.partnerId ? params.partnerId : ''}&amountFrom=${params.amountFrom ? params.amountFrom : ''}&amountTo=${params.amountFrom ? params.amountTo : ''}`)
  },

  //新建反冲支付行
  createPayLine(params){
    return httpFetch.post(`${config.baseUrl}/api/reverse/csh/data/insert`,params)
  },

  //修改费用反冲支付行
  updatePayLine(params){
    return httpFetch.put(`${config.baseUrl}/api/reverse/csh/data/update`,params)
  },

  //删除反冲支付行
  deletePayLine(id){
    return httpFetch.delete(`${config.baseUrl}/api/reverse/csh/data/delete?id=${id}`)
  },

  //提交费用反冲单据
  submitReverseDocument(reverseHeaderId){
    return httpFetch.put(`${config.baseUrl}/api/report/reverse/submit?reverseHeaderId=${reverseHeaderId}`)
  },

  //撤回费用反冲单据
  recallReverseDocument(id,userId){
    return httpFetch.put(`${config.baseUrl}/api/report/reverse/update/status?id=${id}&remark=&status=1003&userId=${userId}`)
  },

  //获取审批历史
  getApproveHistory(id){
    return httpFetch.get(`${config.baseUrl}/api/report/reverse/getHistory?entityType=801007&id=${id}`)
  },

  //获取原附件信息
  getAttInfo(sourceReportLineId){
    return httpFetch.get(`${config.baseUrl}/api/expReportLine/${sourceReportLineId}`)
  },

  //根据费用头id删除费用反冲数据
  deleteReserveByHeadId(id){
    return httpFetch.delete(`${config.baseUrl}/api/report/reverse/delete/by/id?reverseHeaderId=${id}`)
  },
}
