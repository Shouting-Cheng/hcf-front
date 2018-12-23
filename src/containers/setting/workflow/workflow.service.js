import config from 'config'
import httpFetch from 'share/httpFetch'
import errorMessage from 'share/errorMessage'

export default {

  //获取审批流列表，booksID：帐套id
  getWorkflowList(params) {
    return httpFetch.get(`${config.baseUrl}/brms/api/rule/custom/forms`, params)
  },

  //复制审批链
  copyApproveChains(sourceFormOID, targetFormOID) {
    let params = {
      sourceFormOID,
      targetFormOID
    };
    return new Promise((resolve, reject) => {
      httpFetch.put(`${config.baseUrl}/brms/api/rule/approval/chains/copy/v2`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //获取表单信息
 /* getCustomForm(formOID) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${formOID}`)
  },
*/
  //获取审批链详情
  getApprovalChainDetail(formOID) {
    let params = {
      formOID,
      cascadeApprovalNode: true,
      cascadeApprover: true,
      cascadeCondition: true
    };
    return httpFetch.get(`${config.baseUrl}/brms/api/rule/approval/chains/form`, params)
  },

  //删除节点
  deleteApprovalNode(ruleApprovalNodeOID) {
    return new Promise((resolve, reject) => {
      httpFetch.delete(`${config.baseUrl}/brms/api/rule/approval/nodes/${ruleApprovalNodeOID}`).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //获取表单配置
  getCustomFormProperty(formOID) {
    return httpFetch.get(`${config.baseUrl}/api/customForm/property/${formOID}`)
  },

  //保存表单配置
  saveCustomFormProperty(params) {
    return new Promise((resolve, reject) => {
      httpFetch.put(`${config.baseUrl}/api/customForm/property`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //创建审批节点
  createApprovalNodes(params) {
    return new Promise((resolve, reject) => {
      httpFetch.post(`${config.baseUrl}/brms/api/rule/approval/nodes`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //修改审批节点
  modifyApprovalNodes(params) {
    return new Promise((resolve, reject) => {
      httpFetch.put(`${config.baseUrl}/brms/api/rule/approval/nodes`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //移动审批节点
  moveApprovalNode(ruleApprovalNodeOID, nextRuleApprovalNodeOID) {
    return new Promise((resolve, reject) => {
      httpFetch.put(`${config.baseUrl}/brms/api/rule/approval/nodes/move?ruleApprovalNodeOID=${ruleApprovalNodeOID}&nextRuleApprovalNodeOID=${nextRuleApprovalNodeOID || ''}`).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //获取审批者类型
  getApproverType() {
    return httpFetch.get(`${config.baseUrl}/brms/api/rule/approver/types`);
  },

  //批量获取部门
  getDepartmentSimpleList(params) {
    return httpFetch.post(`${config.baseUrl}/api/departments/oids/simple`, params)
  },

  //批量获取成本中心
  getBatchCostCenterList(params) {
    return httpFetch.post(`${config.baseUrl}/api/cost/center/items/oids`, params)
  },

  //批量获取公司控件
  getBatchCompanyItemList(params) {
    let url = `${config.baseUrl}/api/company/by/companyOIDs`;
    params && params.map((oid, index) => {
      url += index === 0 ? `?companyOIDs=${oid}` : `&companyOIDs=${oid}`
    });
    return httpFetch.get(url)
  },

  //批量获取法人实体
  getBatchCorporationEntityList(params) {
    return httpFetch.post(`${config.baseUrl}/api/company/receipted/invoice/oids`, params)
  },

  //批量获取值列表
  getCustomEnumerationList(params) {
    return httpFetch.post(`${config.baseUrl}/api/custom/enumeration/items/oids`, params)
  },

  //批量获取人员
  getBatchUserList(params) {
    return httpFetch.post(`${config.baseUrl}/api/users/oids`, params)
  },

  //表单字段获取(审批条件)
  getFormFields(formOID) {
    let params = {
      formOID
    };
    return httpFetch.get(`${config.baseUrl}/brms/api/rule/custom/form/fields`, params)
  },

  //创建审批者
  createApprovers(params) {
    return new Promise((resolve, reject) => {
      httpFetch.post(`${config.baseUrl}/brms/api/rule/approvers/batch`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //修改审批者
  updateApprovers: function (params) {
    return new Promise((resolve, reject) => {
      httpFetch.put(`${config.baseUrl}/brms/api/rule/approvers`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //移除审批者
  deleteApprovers(ruleApproverOID) {
    return new Promise((resolve, reject) => {
      httpFetch.delete(`${config.baseUrl}/brms/api/rule/approvers/${ruleApproverOID}`).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //所有的条件操作符
  getSymbolsType() {
    return httpFetch.get(`${config.baseUrl}/brms/api/rule/approval/symbols`)
  },

  //批量创建审批者条件
  createRuleCondition(params) {
    return new Promise((resolve, reject) => {
      httpFetch.post(`${config.baseUrl}/brms/api/rule/conditions/batch`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //批量修改审批者条件
  updateRuleCondition(params) {
    return new Promise((resolve, reject) => {
      httpFetch.put(`${config.baseUrl}/brms/api/rule/conditions/batch`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //批量删除审批者条件, params ruleConditionOID数组
  deleteRuleCondition(params) {
    return new Promise((resolve, reject) => {
      httpFetch.delete(`${config.baseUrl}/brms/api/rule/conditions/batch`, params).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //获取组织架构列表
  getDepartmentPositionList() {
    return httpFetch.get(`${config.baseUrl}/api/departmentposition`)
  },

  //获取自钉子列表的值列表
  getBatchTypeList(params) {
    return httpFetch.get(`${config.baseUrl}/api/custom/enumeration/system/by/type`,params)
  },
  getBatchUsers(params) {

    let url = `${config.baseUrl}/api/users/oids`;
    params && params.map((oid, index) => {
      url += index === 0 ? `?userOIDs=${oid}` : `&userOIDs=${oid}`
    });
    return httpFetch.get(url);
  },

  //获取扩展字段表单
  getCustomForm(oid) {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/custom/forms/' + oid + '/simple')
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },

  //根据值列表OID获取值列表信息
  getValueListInfo(OID) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/custom/enumerations/' + OID)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

}
