import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //查询预算版本
  getVersions(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/versions/query`,params)
  },

  //新增预算版本
  addVersions(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/versions`,params)
  },

  //更新预算版本
  updateVersions(params){
    return httpFetch.put(`${config.budgetUrl}/api/budget/versions`,params)
  },

  //获取列表
  getSystemValueList(code){
    return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=${code}`)
  }

}
