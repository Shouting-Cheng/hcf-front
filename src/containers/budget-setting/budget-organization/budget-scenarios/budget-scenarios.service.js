import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //根据organizationId获取
  getScenariosList(page, size, organizationId, searchParams) {
    let url = `${config.budgetUrl}/api/budget/scenarios/query?page=${page}&size=${size}&organizationId=${organizationId}`;
    for(let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url)
  },

  //新建预算场景
  newScenarios(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/scenarios`, params)
  },

  //更新预算场景
  updateScenarios(params) {
    return httpFetch.put(`${config.budgetUrl}/api/budget/scenarios`, params)
  },

}
