import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //条件搜索预算表（分页）
  getStructures(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/structures/query`,params)
  },

  //根据id查询预算表
  getStructureById(id){
    return httpFetch.get(`${config.budgetUrl}/api/budget/structures/${id}`)
  },

  //查询所有预算表（不分页）
  getAllStructures(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/structures/queryAll`,params)
  },

  //更新预算表
  updateStructures(params){
    return httpFetch.put(`${config.budgetUrl}/api/budget/structures`,params)
  },

  //新增预算表
  addStructure(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/structures`,params)
  },

  //获取某预算表下分配的公司
  getCompanyAssignedStructure(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/structure/assign/companies/query`,params)
  },

  //预算表分配公司
  structureAssignCompany(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/structure/assign/companies/batch`,params)
  },

  //改变某预算表分配的公司状态
  updateStructureAssignCompany(params){
    return httpFetch.put(`${config.budgetUrl}/api/budget/structure/assign/companies`,params)
  },

  //预算表分配维度
  structureAssignDimension(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/structure/assign/layouts`,params)
  },

  //预算表更新维度
  structureUpdateDimension(params){
    return httpFetch.put(`${config.budgetUrl}/api/budget/structure/assign/layouts`,params)
  },

  //获取某预算表下分配的维度
  getDimensionAssignedStructure(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/structure/assign/layouts/query`,params)
  },

}
