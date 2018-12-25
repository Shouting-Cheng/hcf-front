import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //获取单据列表，finished：true（已审批）、false（待审批），entityType：1001（申请单）、1002（报销单）
  getDocumentType(finished) {
    return httpFetch.get(`${config.baseUrl}/api/approvals/custom/form?entityType=1002&finished=${finished}`)
  },

  //获取申请单审批列表，finished：true（已审批）、false（待审批），entityType：1001（申请单）、1002（报销单）
  getApproveExpenseReportList(finished, page, size, searchParams) {
    let url = `${config.baseUrl}/api/approvals/batchfilters?entityType=1002&finished=${finished}&page=${page}&size=${size}`;
    for(let searchName in searchParams) {
      if (searchName === 'formOids') {
        searchParams.formOids && searchParams.formOids.length > 0 && searchParams.formOids.map(oid => {
          url += `&formOids=${oid}`
        })
      } else {
        url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : ''
      }
    }
    return httpFetch.get(url)
  },

  //审批通过
  handleExpenseReportApprovePass(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/pass`, params)
  },

  //审批驳回
  handleExpenseReportApproveReject(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/reject`, params)
  },

  //是否可以加签 counterSignType：enableAddSignForSubmitter（验证提交人是否可加签，单据为编辑状态）、enableAddSign（验证审批人审批单据时是否可加签）
  isCounterSignEnable(companyOid, formOid, counterSignType) {
    let params = {
      companyOid, formOid, counterSignType
    };
    return httpFetch.post(`${config.baseUrl}/api/countersign/addSign/enable/and/scope`, params)
  },

  //批量驳回费用
  batchRejectInvoice(params){
    return httpFetch.post(`${config.baseUrl}/api/approvals/reject/expensereport/invoice`, params)
  }

}
