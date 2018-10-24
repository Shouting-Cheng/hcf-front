import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //获取单据列表，finished：true（已审批）、false（待审批），entityType：1001（申请单）、1002（报销单）
  getDocumentType(finished) {
    return httpFetch.get(`${config.baseUrl}/api/approvals/custom/form?entityType=1001&finished=${finished}`)
  },

  //获取申请单审批列表，finished：true（已审批）、false（待审批），entityType：1001（申请单）、1002（报销单）
  getApproveRequestList(finished, page, size, searchParams) {
    let url = `${config.baseUrl}/api/approvals/batchfilters?entityType=1001&finished=${finished}&page=${page}&size=${size}`;
    for(let searchName in searchParams) {
      if (searchName === 'formOIDs') {
        searchParams.formOIDs && searchParams.formOIDs.length > 0 && searchParams.formOIDs.map(oid => {
          url += `&formOIDs=${oid}`
        })
      } else {
        url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : ''
      }
    }
    return httpFetch.get(url)
  },

  //审批通过
  handleRequestApprovePass(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/pass`, params)
  },

  //审批驳回
  handleRequestApproveReject(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/reject`, params)
  },

  //是否可以加签 counterSignType：enableAddSignForSubmitter（验证提交人是否可加签，单据为编辑状态）、enableAddSign（验证审批人审批单据时是否可加签）
  isCounterSignEnable(companyOID, formOID, counterSignType) {
    let params = {
      companyOID, formOID, counterSignType
    };
    return httpFetch.get(`${config.baseUrl}/api/countersign/addSign/enable`, params)
  },

  //加签人的选择范围人员
  postAddSignEnableScope(params){
    return httpFetch.post(`${config.baseUrl}/api/countersign/addSign/enable/and/scope`, params)
  }
}
