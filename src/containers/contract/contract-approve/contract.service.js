import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 获取合同列表
   * @param page
   * @param size
   * @param searchParams
   */
  getContractList(page, size, searchParams) {
    let url = `${config.contractUrl}/api/contract/header/update/query?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  /**
   * 获取合同头信息
   * @param id
   */
  getContractHeaderInfo(id) {
    return httpFetch.get(`${config.contractUrl}/api/contract/header/${id}`);
  },

  /**
   * 保存合同头信息
   * @param params
   */
  addContractInfo(params) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header`, params);
  },

  /**
   * 保存合同头信息
   * @param params
   */
  newContractHeader(params) {
    return httpFetch.post(`${config.contractUrl}/api/contract/header/init/contract/header`, params);
  },

  /**
   * 更新合同头信息
   * @param params
   */
  updateContractHeader(params) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header`, params);
  },

  /**
   * 编辑合同头信息
   * @param params
   */
  updateEditInfoContractHeader(params) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header/edit`, params);
  },

  /**
   * 获取资金行计划
   * @param page
   * @param size
   * @param id
   */
  getPayPlan(page, size, id) {
    return httpFetch.get(
      `${config.contractUrl}/api/contract/line/herder/${id}?page=${page}&size=${size}`
    );
  },

  /**
   *  新建资金行计划
   * @param params
   */
  newPayPlan(params) {
    return httpFetch.post(`${config.contractUrl}/api/contract/line`, params);
  },

  /**
   * 更新资金行计划
   * @param params
   */
  updatePayPlan(params) {
    return httpFetch.put(`${config.contractUrl}/api/contract/line`, params);
  },

  /**
   * 删除资金行计划
   * @param id
   */
  deletePayPlan(id) {
    return httpFetch.delete(`${config.contractUrl}/api/contract/line/${id}`);
  },

  /**
   * 提交合同
   * @param id = 合同id
   */
  submitContract(id) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header/submit/${id}`, { id });
  },

  /**
   * 提交合同工作流
   * @param id = 合同id
   */
  submitWorkflowContract(params) {
    return httpFetch.post(`${config.baseUrl}/api/contract/reports/submit`, params);
  },

  /**
   * 删除合同
   * @param id
   */
  deleteContract(id) {
    return httpFetch.delete(`${config.contractUrl}/api/contract/header/${id}`, { id });
  },

  /**
   * 撤回合同
   * @param id
   */
  recallContract(id) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header/withdrawal/${id}`);
  },

  /**
   * 暂挂合同
   * @param id
   */
  holdContract(id) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header/hold/${id}`);
  },

  /**
   * 取消暂挂合同
   * @param id
   */
  unHoldContract(id) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header/unHold/${id}`);
  },

  /**
   * 取消合同
   * @param id
   */
  cancelContract(id) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header/cancel/${id}`);
  },

  /**
   * 完成合同
   * @param id
   */
  finishContract(id) {
    return httpFetch.put(`${config.contractUrl}/api/contract/header/finish/${id}`);
  },

  /**
   * 获取合同类型定义列表
   * @param page
   * @param size
   * @param setOfBooksId
   * @param searchParams
   */
  getContractTypeDefineList(page, size, setOfBooksId, searchParams) {
    let url = `${
      config.contractUrl
    }/api/contract/type/query?setOfBooksId=${setOfBooksId}&page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      searchName !== 'setOfBooksId' &&
        (url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '');
    }
    return httpFetch.get(url);
  },

  /**
   * 查询某合同类型下的分配公司列表
   * @param page
   * @param size
   * @param setOfBooksId
   * @param id
   */
  getCompanyDistributionByContractType(setOfBooksId, params) {
    return httpFetch.get(
      `${config.contractUrl}/api/contract/type/${setOfBooksId}/companies/query`,
      params
    );
  },

  /**
   * 查询合同类型信息
   * @param setOfBooksId
   * @param id
   */
  getContractTypeInfo(setOfBooksId, id, params) {
    return httpFetch.get(`${config.contractUrl}/api/contract/type/${setOfBooksId}/${id}`, params);
  },

  //获取合同类型//公司
  getContractTypeByCompany(params) {
    return httpFetch.get(
      `${config.contractUrl}/api/contract/type/contract/type/by/user`,
      params
    );
  },

  /**
   * 新建合同类型定义
   * @param setOfBooksId
   * @param params = [{ }]
   */
  newContractType(setOfBooksId, params) {
    return httpFetch.post(`${config.contractUrl}/api/contract/type/${setOfBooksId}`, params);
  },

  /**
   * 更新合同类型定义
   * @param setOfBooksId
   * @param params = [{ }]
   */
  updateContractType(setOfBooksId, params) {
    return httpFetch.put(`${config.contractUrl}/api/contract/type/${setOfBooksId}`, params);
  },

  /**
   * 更新公司分配状态
   * @param setOfBooksId
   * @param params
   */
  updateCompanyDistributionStatus(setOfBooksId, params) {
    return httpFetch.put(
      `${config.contractUrl}/api/contract/type/${setOfBooksId}/toCompany`,
      params
    );
  },

  /**
   * 分配公司
   * @param setOfBooksId
   * @param params
   */
  distributionCompany(setOfBooksId, params) {
    return httpFetch.post(
      `${config.contractUrl}/api/contract/type/${setOfBooksId}/toCompany`,
      params
    );
  },

  /**
   * 获取未审批合同列表 不走工作流
   * @param page
   * @param size
   * @param searchParams
   */
  getUnapprovedContractList(page, size, searchParams) {
    let url = `${config.contractUrl}/api/contract/header/confirm/query?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  /**
   * 获取已审批合同列表 不走工作流
   * @param page
   * @param size
   * @param searchParams
   */
  getApprovedContractList(page, size, searchParams) {
    let url = `${config.contractUrl}/api/contract/header/confirmEd/query?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  /**
   * 合同审批通过 不走工作流
   * @param id = 合同id
   * @param reason = 审批意见(可空)
   */
  contractApprovePass(id, reason) {
    return httpFetch.put(
      `${config.contractUrl}/api/contract/header/confirm/${id}?reason=${reason}`
    );
  },

  /**
   * 合同审批驳回 不走工作流
   * @param id = 合同id
   * @param reason = 审批意见(不可空)
   */
  contractApproveReject(id, reason) {
    let params = { id, reason };
    return httpFetch.put(
      `${config.contractUrl}/api/contract/header/rejected/${id}?reason=${reason}`,
      params
    );
  },

  /**
   * 获取合同历史 不走工作流
   * @param id = 合同id
   */
  getContractHistory(id) {
    return httpFetch.get(
      `${config.baseUrl}/api/contract/reports/history?entityType=801004&entityOid=${id}`
    );
  },

  /**
   * 获取未审批合同列表 走工作流
   * @param page
   * @param size
   * @param searchParams
   */
  getUnapprovedWorkflowContractList(page, size, searchParams) {
    let url = `${
      config.baseUrl
    }/api/approvals/contract/report/filters?finished=false&page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  /**
   * 获取已审批合同列表 走工作流
   * @param page
   * @param size
   * @param searchParams
   */
  getApprovedWorkflowContractList(page, size, searchParams) {
    let url = `${
      config.baseUrl
    }/api/approvals/contract/report/filters?finished=true&page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  /**
  * 合同审批通过 走工作流
  * @params {
              "approvalTxt":null,
              "entities":[
              {
                  "entityOid":"270e4a68-5b3c-4908-8dff-947144ba3632",
                  "entityType":801004
                  }
              ],
            "countersignApproverOids":["1111","333"]
          }
  */
  contractApproveWorkflowPass(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/pass`, params);
  },

  /**
   * 合同审批驳回 走工作流
   * @param params {"approvalTxt":"测试合同审批驳回",
                    "entities":[{
                            "entityOid":"0858f65b-95e9-4e30-a9a5-e80c10daaf52",
                            "entityType":801004}
                    ]}
   */
  contractApproveWorkflowReject(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/reject`, params);
  },

  /**
   * 撤回合同 走工作流
   * @params {"entities":[
                {"entityOid":"0858f65b-95e9-4e30-a9a5-e80c10daaf52",
                "entityType":801004}
              ]
            }
   */
  recallWorkflowContract(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/withdraw`, params);
  },

  /**
   * 获取合同历史 走工作流
   * @entityType   801004&
   * @entityOid    88b29a3d-fee8-432f-a4ef-8a2fd4a9f398
   */
  getContractWorkflowHistory(entityType, entityOid) {
    return httpFetch.get(
      `${
        config.baseUrl
      }/api/contract/reports/history?entityType=${entityType}&entityOid=${entityOid}`
    );
  },

  /**
   * 获取合同关联的预付款单
   * @param number="CON_CONTRACT2018031300002"
   * */
  getPrepaymentHeadByContractNumber(number) {
    return httpFetch.get(
      `${
        config.prePaymentUrl
      }/api/cash/prepayment/requisitionHead/get/by/contract/number?number=${number}`
    );
  },
  /**
   * 获取合同关联的报账单
   */
  getAccountHeadByContract(contractHeaderId) {
    return httpFetch.get(
      `${
        config.contractUrl
      }/api/contract/document/relations/associate/expReport/${contractHeaderId}`
    );
  },
  /**
   * 获取合同关联的支付明细
   */
  getPayDetailByContractHeaderId(contractHeaderId, page, pageSize) {
    return httpFetch.get(
      `${
        config.payUrl
      }/api/cash/transaction/details/getDetailByContractHeaderId?page=${page}&size=${pageSize}&contractHeaderId=${contractHeaderId}`
    );
  },
};
