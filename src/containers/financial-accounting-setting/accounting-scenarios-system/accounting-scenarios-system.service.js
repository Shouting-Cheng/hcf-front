import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //条件查询系统级核算场景（分页）
  getAccountingScenarios(params){
    return httpFetch.get(`${config.accountingUrl}/api/account/general/ledger/scene/query`,params)
  },

  //修改系统级核算场景账
  updateAccountingScenarios(params){
    return httpFetch.put(`${config.accountingUrl}/api/account/general/ledger/scene`,params)
  },

  //增加系统级核算场景
  addAccountingScenarios(params){
    return httpFetch.post(`${config.accountingUrl}//api/account/general/ledger/scene`,params)
  },

  //增加系统级核算要素
  addSysAccountingElements(params){
    return httpFetch.post(`${config.accountingUrl}/api/account/general/ledger/scene/elements`,params)
  },

  //更新系统级核算要素
  updateSysAccountingElements(params){
    return httpFetch.put(`${config.accountingUrl}/api/account/general/ledger/scene/elements`,params)
  },

  //根据id查询系统级核算场景
  getSysScenariosById(params){
    return httpFetch.get(`${config.accountingUrl}/api/account/general/ledger/scene/${params}`)
  },

  //获取匹配组字段
  getMatchGroupField(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/match/group/filed/selectByInput`,params)
  },

  //系统级核算要素条件查询（分页）
  getElement(params){
    return httpFetch.get(`${config.accountingUrl}/api/account/general/ledger/scene/elements/query`,params)
  },

}
