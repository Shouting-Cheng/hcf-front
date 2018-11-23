import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  /**
   * 得到组件列表
   */
  getWidgetList() {
    return httpFetch.get(`${config.baseUrl}/invoice/api/expense/widgets`)
  },

  /**
   * 得到图标列表
   */
  getIconList() {
    return httpFetch.get(`${config.baseUrl}/api/expense/types/icon`)
  },

  /**
   * 排序大类
   * @param params  大类数组
   * @return {*|AxiosPromise}
   */
  sortCategory(params) {
    return httpFetch.post(`${config.baseUrl}/invoice/api/expense/types/category/sort`, params)
  },

  /**
   * 创建大类
   * @param expenseTypeCategory
   */
  createCategory(expenseTypeCategory) {
    return httpFetch.post(`${config.expenseUrl}/api/expense/types/category`, expenseTypeCategory)
  },

  /**
   * 删除大类
   * @param expenseTypeCategoryOID
   */
  deleteCategory(expenseTypeCategoryOID) {
    return httpFetch.delete(`${config.baseUrl}/api/expense/types/category/${expenseTypeCategoryOID}`)
  },

  /**
   * 编辑大类
   * @param expenseTypeCategory
   */
  editCategory(expenseTypeCategory) {
    return httpFetch.put(`${config.baseUrl}/api/expense/types/category`, expenseTypeCategory)
  },

  /**
   * 排序小类
   * @param params  小类数组
   * @return {*|AxiosPromise}
   */
  sortExpenseType(params) {
    return httpFetch.post(`${config.baseUrl}/invoice/api/expense/types/sort`, params)
  },

  /**
   * 获得费用类型编码
   */
  getExpenseTypeCode(setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/invoice/api/expense/type/code/produce`, { setOfBooksId })
  },

  /**
   * 获得费用类型详情
   * @param id
   */
  getExpenseTypeDetail(id) {
    return httpFetch.get(`${config.baseUrl}/api/expense/types/select/${id}`)
  },

  /**
   * 保存费用类型
   */
  saveExpenseType(expenseType) {
    return httpFetch.post(`${config.expenseUrl}/api/expense/types`, expenseType)
  },

  /**
   * 保存费用类型的字段
   * @param expenseTypeId
   * @param fields
   * @return {*|AxiosPromise}
   */
  saveExpenseTypeFields(expenseTypeId, fields) {
    return httpFetch.post(`${config.baseUrl}/invoice/api/expense/type/${expenseTypeId}/fields`, fields)
  },

  /**
   * 获得费用类型人员组权限
   * @param expenseTypeId
   */
  getExpenseTypeScope(expenseTypeId) {
    return httpFetch.get(`${config.baseUrl}/invoice/api/expense/type/user/groups`, { expenseTypeId })
  },

  /**
   * 保存费用类型权限
   * @param scope
   * @return {*|AxiosPromise}
   */
  saveExpenseTypeScope(scope) {
    return httpFetch.post(`${config.baseUrl}/invoice/api/expense/type/user/groups`, scope)
  },

  /**
   * 创建一个类别(申请或者费用)
   * @param {*} params 
   */
  addTypes(params) {
    return httpFetch.post(`${expenseUrl}/api/expense/types`, params);
  }
}
