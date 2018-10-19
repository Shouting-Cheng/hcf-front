import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  //根据id查询当前预算组织
  getOrganizationsById(id){
    return httpFetch.get(`${config.budgetUrl}/api/budget/organizations/${id}`)
  },

  //条件搜索预算组织(分页)
  getOrganizations(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/organizations/query`, params)
  },

  //新增预算组织
  addOrganization(organization){
    return httpFetch.post(`${config.budgetUrl}/api/budget/organizations`, organization)
  },

  //更新预算组织
  updateOrganization(organization){
    return httpFetch.put(`${config.budgetUrl}/api/budget/organizations`, organization)
  },

  //根据预算组织id得到预算组织信息
  getOrganizationById(id){
    return httpFetch.get(`${config.budgetUrl}/api/budget/organizations/${id}`)
  },

  //根据帐套id得到默认预算组织信息
  getOrganizationBySetOfBooksId(id){
    return httpFetch.get(`${config.budgetUrl}/api/budget/organizations/default/${id}`)
  },

  //更新参数设置
  updateParameterSetting(parameterSetting){
    return httpFetch.put(`${config.budgetUrl}/api/budget/parameterSettings`, parameterSetting)
  },
}
