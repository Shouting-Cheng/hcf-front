import config from "config"
import httpFetch from "share/httpFetch"

export default {
  /**
   * 查询当前机构下所有的申请单类型（查询下拉框)
   * @param {*} params
   */
  getApplicationTypeList(params) {
    return httpFetch.get(`${config.expenseUrl}/api/expense/application/type/query/all`, params);
  },
  /**
   * 获取分配的公司
   * @param {*} id 
   */
  getDistributiveCompany(id) {
    return httpFetch.get(`${config.expenseUrl}/api/expense/application/type/${id}/company/query`);
  },

  /**
   * 更改公司分配状态
   * @param {*} parmas
   */
  updateAssignCompany(parmas) {
    return httpFetch.put(`${config.expenseUrl}/api/expense/application/type/assign/company`, parmas);
  },

  /**
   * 批量分配公司
   * @param {*} parmas 
   */
  batchDistributeCompany(id, parmas) {
    return httpFetch.post(`${config.expenseUrl}/api/expense/application/type/${id}/assign/company`, parmas);
  },

  /**
  * 获取维度列表
  * @param {*} id 
  */
  getDimensionById(id, params = {}) {
    return httpFetch.get(`${config.expenseUrl}/api/expense/application/type/${id}/dimension/query`, params);
  },

  /**
  * 获取可关联表单类型
  * @param {*} setOfBooksId
  */
  getFormList(setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/setOfBooks/my/available/all?formTypeId=801009&setOfBooksId=${setOfBooksId}`);
  },

  /**
  * 新建申请单类型
  * @param {*} params
  */
  addApplicationType(params) {
    return httpFetch.post(`${config.expenseUrl}/api/expense/application/type`, params);
  },

  /**
  * 更新申请单类型
  * @param {*} params
  */
  updateApplicationType(params) {
    return httpFetch.put(`${config.expenseUrl}/api/expense/application/type`, params);
  }

}

