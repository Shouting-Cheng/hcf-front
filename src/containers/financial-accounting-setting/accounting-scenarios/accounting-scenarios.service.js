import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //条件查询账套级核算要素（分页）
  getScenariosSob(params){
    return httpFetch.get(`${config.accountingUrl}/api/generalLedgerSceneMapping/selectByInput`,params)
  },

  //新增或修改账套级核算场景
  addOrUpdateScenarios(params){
    return httpFetch.post(`${config.accountingUrl}/api/generalLedgerSceneMapping/insertOrUpdate`,params)
  },

  //根据id查询账套级核算场景
  getScenariosById(params){
    return httpFetch.get(`${config.accountingUrl}/api/generalLedgerSceneMapping/getById`,params)
  },

  //查询未添加到改账套下核算场景的系统场景
  getScenarioNotInSob(params){
    return httpFetch.get(`${config.accountingUrl}/api/generalLedgerSceneMapping/select/unassigned/scene`,params)
  },

  //获取匹配组代码非空的核算要素
  getElementsGroupNotNull(params){
    return httpFetch.get(`${config.accountingUrl}/api/account/general/ledger/scene/elements/all`,params)
  },

  //新增或修改账套级核算要素
  addOrUpdateSobElements(params){
    return httpFetch.post(`${config.accountingUrl}/api/generalLedgerSceneMappingGrpsHd/insert/head/and/line`,params)
  },


  //查询账套级核算要素
  getSobElement(params){
    return httpFetch.get(`${config.accountingUrl}/api/generalLedgerSceneMappingGrpsHd/selectByInput`,params)
  },

  //根据id查询匹配组信息
  getMatchGroupById(params){
    return httpFetch.get(`${config.accountingUrl}/api/generalLedgerSceneMappingGrpsHd/get/account/view/by/head/id`,params)
  },

  //条件查询科目匹配（分页）
  getSectionMatchByOptions(params,body){
    let url = `${config.accountingUrl}/api/generalLedgerSceneMappingDetails/get/values/by/input?`;
    for(let paramsName in params){
      url += `&${paramsName}=${params[paramsName]}`
    }
    return httpFetch.post(url,body)
  },

  //批量新增或修改科目匹配
  batchInsertOrUpdateSection(params){
    return httpFetch.post(`${config.accountingUrl}/api/generalLedgerSceneMappingDetails/insertOrUpdateBatch`,params)
  },

  //批量删除科目匹配
  batchDeleteSection(params){
    return httpFetch.delete(`${config.accountingUrl}/api/generalLedgerSceneMappingDetails/deleteByIds`,params)
  },

//获取值列表类型的核算要素
  getElementsValueType(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/match/group/filed/values`,params)
  }

}
