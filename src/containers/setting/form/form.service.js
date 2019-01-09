import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //params可传账套id，来查询账套下的表单列表
  getFormList(params){
    // let params = {
    //   roleType:"TENANT",
    //   fromType:"1",//查询的表单类型 1：公司表单 2：租户下表单
    //   booksID:"",//账套ID
    // }
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/company/all`, params)
  },

  /**
   * 表单权限分配公司
   * @param data
   */
  setCompanyPermission(data){
    return httpFetch.post(`${config.baseUrl}/api/custom/form/company/relation`, data)
  },

  /**
   * 得到控件列表
   * @param formType 表单类型
   * @param type 1001 普通控件  1002 组合控件
   */
  getWidgetList(formType, type){
    return httpFetch.get(`${config.baseUrl}/api/form/gui/widgets/all/filter`, {formType, type})
  },

  /**
   * 得到表单详情
   * @param formOid
   */
  getFormDetail(formOid){
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${formOid}/simple`)
  },

  /**
   * 新建表单
   * @param form
   */
  newFormDetail(form){
    return httpFetch.post(`${config.baseUrl}/api/custom/forms`, form)
  },

  /**
   * 保存表单详情
   * @param form
   * @return {AxiosPromise}
   */
  saveFormDetail(form){
    return httpFetch.put(`${config.baseUrl}/api/custom/forms`, form)
  },

  /**
   * 新版保存表单详情
   * @param form  包含了权限设置的表单信息
   * @return {AxiosPromise}
   */
  saveForm(form){
    return httpFetch.put(`${config.baseUrl}/api/custom/forms/all`, form)
  },

  /**
   * 得到所有费用类型
   */
  getExpenseTypeList(){
    return httpFetch.get(`${config.baseUrl}/api/expense/type/current/company/all`)
  },

  /**
   * 得到账套下所有费用类型
   */
  getExpenseTypeListByBooksID(booksID){
    return httpFetch.get(`${config.baseUrl}/api/expense/type/by/setOfBooks?setOfBooksId=${booksID}`, {page : 0, size : 1000})
  },

  /**
   * 得到表单可见费用类型
   * @param formOid  表单Oid
   * @param subsidyType  新差补费用的展示
   */
  getExpenseTypeScope(formOid, subsidyType){
    return httpFetch.get(`${config.baseUrl}/api/v2/custom/forms/${formOid}/selected/expense/types`, {isAll: true, subsidyType: subsidyType})
  },

  /**
   * 获得代入报表的可映射字段
   */
  getExpenseReportScope(type){
    return httpFetch.get(`${config.baseUrl}/api/custom/enumeration/system/by/type`, {
      systemCustomEnumerationType: type
    })
  },

  /**
   * 更新表单可见费用类型
   * @param entityOid  表单Oid
   * @param expenseTypeList  费用列表
   * @param visibleScope  费用可见类型
   * @return {*|AxiosPromise}
   */
  updateExpenseTypeScope(entityOid, expenseTypeList, visibleScope){
    let expenseTypeOids = [];
    expenseTypeList.map(item => {
      expenseTypeOids.push(item.expenseTypeOid)
    });
    let params = { entityOid, expenseTypeOids, visibleScope  };
    return httpFetch.post(`${config.baseUrl}/api/custom/forms/associate/expense/types`, params)
  },

  /**
   * 得到表单适用人员
   * @param formOid  表单Oid
   */
  getUserScope(formOid){
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${formOid}/user/scope`)
  },

  /**
   * 更新表单适用人员
   * @param formOid  表单Oid
   * @param departmentOids 部门Oid数组
   * @param userGroupOids 人员组Oid数组
   * @param visibleScope  适用人员类型
   * @return {*|AxiosPromise}
   */
  updateUserScope(params){
    return httpFetch.post(`${config.baseUrl}/api/custom/forms/user/scope`, params)
  },

  /**
   * 得到表单属性列表
   * @param formOid
   */
  getFormPropertyList(formOid){
    return httpFetch.get(`${config.baseUrl}/api/applications/propertyList/${formOid}`)
  },

  /**
   * 修改表单属性
   * @param data 需要更改的表单数组
   * @return {*|AxiosPromise}
   */
  saveFormProperty(data){
    return httpFetch.post(`${config.baseUrl}/api/applications/property/export`, data)
  },

  /**
   * 删除表单属性
   * @param propertyNames 需要删除的表单属性名数组
   * @return {*|AxiosPromise}
   */
  removeFormProperty(formOid, propertyNames){
    return httpFetch.delete(`${config.baseUrl}/api/custom/forms/property?formOid=${formOid}&propertyNames=${propertyNames}`)
  },

  /**
   * 得到所有值列表
   * @param page
   * @param size
   * @isExtendField bool，扩展字段的地方，获取自定义值类别需要另一个接口：加载租户级别的列表
   */
  getCustomEnumeration(page, size,enabled,typeFlag){
    return httpFetch.get(`${config.baseUrl}/api/custom/enumerations`, {page, size, enabled, typeFlag})
  },

  /**
   * 得到表单配置页面里所需数据
   * @param formOid
   */
  getFormField (formOid){
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/property/travel/configuration/${formOid}`)
  },
  /**
   * 得到表单配置页面里的表单字段propertyList
   * @param formOid
   */
  getPropertyList (formOid){
    return httpFetch.get(`${config.baseUrl}/api/applications/propertyList/${formOid}`)
  },
  /**
   * 点击供应商管控页面,行程表单页面的保存,二者调用的接口一样
   * @param formOid
   */
  saveSupplierForm (formOid, params){
    return httpFetch.post(`${config.baseUrl}/api/custom/forms/property/travel/configuration/${formOid}`, params)
  },
  /**
   * 点击供应商管控页面,行程表单页面的保存,二者调用的接口一样
   * @param
   */
  saveHuilianyiForm (params){
    return httpFetch.post(`${config.baseUrl}/api/applications/property/export`, params)
  },
  /**
   * 获取供应商管控页面select里面options的值
   * @param formOid
   */
  getSupplierOptions (formOid){
    return httpFetch.get(`${config.baseUrl}/api/ctrip/cost/center/form/value/${formOid}`)
  },
}
