import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //获取会计期间定义列表
  getPeriodDefineList(page, size, searchParams) {
    let url = `${config.baseUrl}/api/periodset?&page=${page}&size=${size}`;
    for(let paramsName in searchParams){
      url += searchParams[paramsName] ? `&${paramsName}=${searchParams[paramsName]}` : '';
    }
    return httpFetch.get(url)
  },

  //新建会计期间定义
  newPeriodDefine(params) {
    return httpFetch.post(`${config.baseUrl}/api/periodset`, params)
  },

  //编辑会计期间定义
  updatePeriodDefine(params) {
    return httpFetch.put(`${config.baseUrl}/api/periodset`, params)
  },

  //根据期间id获取期间内容
  getPeriodInfo(id) {
    return httpFetch.get(`${config.baseUrl}/api/periodset/${id}`)
  },

  //新建会计期规则
  newAccountRule(params) {
    return httpFetch.post(`${config.baseUrl}/api/periodrule/batch`, params)
  },

  //根据期间id获取会计期规则列表
  getAccountRuleList(id) {
    return httpFetch.get(`${config.baseUrl}/api/periodrule/query?periodSetId=${id}`)
  },

  //创建期间
  createPeriod(periodSetCode, yearFrom, yearTo) {
    return httpFetch.post(`${config.baseUrl}/api/periods/batch/create/periods?periodSetCode=${periodSetCode}&yearFrom=${yearFrom}&yearTo=${yearTo}`)
  },

}
