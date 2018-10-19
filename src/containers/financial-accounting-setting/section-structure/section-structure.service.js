import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  //条件查询科目段结构（分页）
  getSectionStructuresByOptions(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/segment/sets/query`,params)
  },

  //新增科目段结构
  addSectionStructure(params){
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/segment/sets`,params)
  },

  //修改科目段结构
  updateSectionStructure(params){
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/segment/sets`,params)
  },

  //条件查询科目段设置(分页)
  getSectionSettingsByOptions(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/segments/query`,params)
  },

  //新增科目段设置
  addSectionSetting(params){
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/segments`,params)
  },

  //修改科目段设置
  updateSectionSetting(params){
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/segments`,params)
  },

  //条件查询 科目段映射集(分页)
  getSectionMapSet(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/segment/map/query`,params)
  },

  //导出映射集
  downLoadMapping(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/segment/map/export/data`,params,{}, {responseType: 'arraybuffer'})
  },

  //删除映射集
  deleteSectionMap(params){
    return httpFetch.delete(`${config.accountingUrl}/api/general/ledger/segment/map/batch`,params)
  },

  //添加或修改映射集
  addOrUpdateSectionMapping(params){
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/segment/map/batch`,params)
  },

  //条件查询科目段结构
  getSectionStructures(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/segment/sets/query`,params)
  },

}
