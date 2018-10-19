import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //查询预算项目类型
  getItemType(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/itemType/query`,params)
  },

  //新增预算项目类型
  addItemType(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/itemType`,params)
  },

  updateItemType(params){
    return httpFetch.put(`${config.budgetUrl}/api/budget/itemType`,params)
  }

}
