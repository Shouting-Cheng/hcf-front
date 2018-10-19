import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //根据organizationId获取预算策略列表
  getStrategyList(page, size, organizationId, searchParams) {
    let url = `${config.budgetUrl}/api/budget/control/strategies/query?page=${page}&size=${size}&organizationId=${organizationId}`;
    for(let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : ''
    }
    return httpFetch.get(url)
  },

  //新建预算控制策略
  newStrategy(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/control/strategies`, params)
  },

  //更新预算控制策略
  updateStrategy(params) {
    return httpFetch.put(`${config.budgetUrl}/api/budget/control/strategies`, params)
  },

  //根据strategyId获取预算控制策略信息
  getStrategyInfo(strategyId) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/control/strategies/${strategyId}`)
  },

  //根据strategyId和organizationId获取策略明细列表
  getStrategyDetailList(page, size, strategyId, organizationId, keyWords) {
    let url = `${config.budgetUrl}/api/budget/control/strategy/details/query?page=${page}&size=${size}&controlStrategyId=${strategyId}&organizationId=${organizationId}`;
    url += keyWords ? `&keyWords=${keyWords}` : '';
    return httpFetch.get(url)
  },

  //新建策略明细
  newStrategyDetail(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/control/strategy/details`, params)
  },

  //更新策略明细
  updateStrategyDetail(params) {
    return httpFetch.put(`${config.budgetUrl}/api/budget/control/strategy/details`, params)
  },

  //根据策略明细id获取策略明细信息
  getStrategyDetailInfo(id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/control/strategy/details/${id}`)
  },

  //新建触发条件
  newCondition(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/control/strategy/mp/conds`, params)
  },

  //更新触发条件
  updateCondition(params) {
    return httpFetch.put(`${config.budgetUrl}/api/budget/control/strategy/mp/conds`, params)
  },

  //根据策略明细id获取触发条件列表
  getCondition(page, size, id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/control/strategy/mp/conds/query?page=${page}&size=${size}&controlStrategyDetailId=${id}`)
  },

}
