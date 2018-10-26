import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //新增编码规则对象
  addCodingRuleObject(params){
    return httpFetch.post(`${config.baseUrl}/api/budget/coding/rule/objects`, params)
  },

  //根据id得到编码规则对象
  getCodingRuleObjectById(id){
    return httpFetch.get(`${config.baseUrl}/api/budget/coding/rule/objects/${id}`);
  },

  //得到编码规则对象id得到对象内的编码规则列表
  getCodingRuleList(page, size, id){
    return httpFetch.get(`${config.baseUrl}/api/budget/coding/rules/query?&page=${page}&size=${size}&codingRuleObjectId=${id}`);
  },

  //更新编码规则对象
  updateCodingRuleObject(params){
    return httpFetch.put(`${config.baseUrl}/api/budget/coding/rule/objects`, params);
  },

  //得到编码规则对象列表
  getCodingRuleObjectList(page, size, params){
    let url = `${config.baseUrl}/api/budget/coding/rule/objects/query?&page=${page}&size=${size}`;
    for(let paramsName in params){
      url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
    }
    return httpFetch.get(url)
  },

  //删除编码规则对象
  deleteCodingRuleObject(id){
    return httpFetch.delete(`${config.baseUrl}/api/budget/coding/rule/details/${id}`)
  },

  //得到编码规则
  getCodingRule(ruleId){
    return httpFetch.get(`${config.baseUrl}/api/budget/coding/rules/${ruleId}`)
  },

  //得到编码规则值列表
  getCodingRuleValueList(page, size, ruleId){
    return httpFetch.get(`${config.baseUrl}/api/budget/coding/rule/details/query?&page=${page}&size=${size}&codingRuleId=${ruleId}`)
  },

  //编辑编码规则
  updateCodingRule(params){
    return httpFetch.put(`${config.baseUrl}/api/budget/coding/rules`, params)
  },

  //新增编码规则
  addCodingRule(params){
    return httpFetch.post(`${config.baseUrl}/api/budget/coding/rules`, params)
  },

  //新增编码规则值
  addCodingRuleValue(params){
    return httpFetch.post(`${config.baseUrl}/api/budget/coding/rule/details`, params)
  },

  //更新编码规则值
  updateCodingRuleValue(params){
    return httpFetch.put(`${config.baseUrl}/api/budget/coding/rule/details`, params)
  }

}
