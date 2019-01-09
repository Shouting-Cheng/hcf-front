import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //条件查询控制规则（分页）
  getRuleByOptions(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/control/rules/query`,params)
  },

  //根据id查询规则
  getRuleById(id){
    return httpFetch.get(`${config.budgetUrl}/api/budget/control/rules/${id}`)
  },

  //更新预算规则
  updateRule(params){
    return httpFetch.put(`${config.budgetUrl}/api/budget/control/rules`,params)
  },

  //增加预算规则
  addRule(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/control/rules`,params)
  },

  //获取规则明细
  getRuleDetail(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/control/rule/details/query`,params)
  },

  //新增规则明细
  addRuleDetail(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/control/rule/details`,params)
  },

  //更新规则名称
  updateRuleDetail(params){
    return httpFetch.put(`${config.budgetUrl}/api/budget/control/rule/details`,params)
  },

  //删除规则名称
  deleteRuleDetail(id){
    return httpFetch.delete(`${config.budgetUrl}/api/budget/control/rule/details/${id}`)
  },

  //查询所有启用预算策略
  getStrategy(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/control/strategies/query/all`,params)
  },

  //获取成本中心
  getCostCenter(params){
    return httpFetch.get(`${config.baseUrl}/api/dimension/page/by/cond`,params)
  },

}
