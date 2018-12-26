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
   * 获取币种列表
   * @param {*} id 
   */
  getCurrencyList(id) {
    return httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll`);
  },

  /**
   * 获取维度
   * @param {*} parmas
   */
  getDimension(typeId) {
    return httpFetch.get(`${config.expenseUrl}/api/expense/application/type/${typeId}/dimension/query`);
  },

  /**
   * 获取申请单类型详情
   * @param {*} typeId
   */
  getApplicationTypeById(typeId) {
    return httpFetch.get(`${config.expenseUrl}/api/expense/application/type/query/` + typeId);
  },

  /**
  * 创建一个费用申请单头
  * @param {*} params
  */
  addExpenseApplictionForm(params) {
    return httpFetch.post(`${config.expenseUrl}/api/expense/application/header`, params);
  },

  /**
  * 根据单据头ID查询单据头详情
  * @param {*} id 
  */
  getApplicationDetail(id) {
    return httpFetch.get(`${config.expenseUrl}/api/expense/application/header/` + id);
  },

  /**
  * 删除申请单
  * @param {*} id
  */
  deleteExpenseApplication(id) {
    return httpFetch.delete(`${config.expenseUrl}/api/expense/application/header/` + id);
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

