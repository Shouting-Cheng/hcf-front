import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  //条件查询科目段结构（分页）
  getSectionStructuresByOptions(params){
    return httpFetch.get(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/sets/query`,params)
  },

  //新增科目段结构
  addSectionStructure(params){
    return httpFetch.post(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/sets`,params)
  },

  //修改科目段结构
  updateSectionStructure(params){
    return httpFetch.put(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/sets`,params)
  },

  //条件查询科目段设置(分页)
  getSectionSettingsByOptions(params){
    return httpFetch.get(`${config.accountingUrl}/accounting_service/api/general/ledger/segments/query`,params)
  },

  //新增科目段设置
  addSectionSetting(params){
    return httpFetch.post(`${config.accountingUrl}/accounting_service/api/general/ledger/segments/query`,params)
  },

  //条件查询 科目段映射集(分页)
  getSectionMapSet(params){
    return httpFetch.get(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/map/query`,params)
  },

  //导出映射集
  downLoadMapping(params){
    return httpFetch.get(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/map/export/data`,params)
  },

  //删除映射集
  deleteSectionMap(params){
    return httpFetch.delete(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/map/batch`,params)
  },

  //添加或修改映射集
  addOrUpdateSectionMapping(params){
    return httpFetch.post(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/map/batch`,params)
  },

  //条件查询科目段结构
  getSectionStructures(params){
    return httpFetch.get(`${config.accountingUrl}/accounting_service/api/general/ledger/segment/sets/query`,params)
  },


  /**
   *获取未添加的来源事务（系统级）
   * */

  getSourceTransactionNotAdd(){
    return httpFetch.get(`${config.baseUrl}/api/general/source/transactions/all/codeValue`)
  },

  /**
   *新增来源事务（系统级）
   * @param params={
       "sourceTransactionCode":"Test4",
       "description":"测试"
   }
   * */
  addSourceTransaction(params){
    return httpFetch.post(`${config.localUrl}/api/general/source/transactions`,params)
  },

  /**
   * 修改来源事务（系统级）
   * @param params={
    	"id":945540376126406657,
	    "sourceTransactionCode":"Test1",
	    "description":"测试1",
	    "versionNumber":1
   }
   * */
  upSourceTransaction(params){
    return httpFetch.put(`${config.localUrl}/api/general/source/transactions`,params)
  },

  /**
   * 删除来源事务（系统级）
   * */
  delectSourceTransaction(id){
    return httpFetch.delete(`${config.localUrl}/api/general/source/transactions/${id}`)
  },

  /**
   * 查询来源事务byID（系统级）
   * */
  getSourceTransactionbyID(id){
    return httpFetch.get(`${config.localUrl}/api/general/source/transactions/${id}`)
  },

  /**
   * 查询来源事务（系统级）
   * @param param={
   *   "setOfBooksId":
   *  "sourceTransactionCode":""
   *  "description":""
   * }
   * */
  getSourceTransaction(params){
    return httpFetch.get(`${config.localUrl}/api/general/source/transactions/query`,params)
  },

  /**
   * 新建来源数据结构（系统级）
   * @param  param=[{
    	"sourceDateCode":"Test2",
	    "description":"测试2945176306781097985",
	    "sourceTransactionId":1
   },{}....]
   * */

  addSourceTransactionData(params){
    return httpFetch.post(`${config.localUrl}/api/general/source/transaction/data/tables`,params)
  },

  /**
   * 修改来源数据结构（系统级）
   * @param params={
    	"id":945540376126406657,
	    "sourceTransactionCode":"Test1",
	    "description":"测试1",
	    "versionNumber":1
   }
   * */
  upSourceTransactionData(params){
    return httpFetch.put(`${config.localUrl}/api/general/source/transaction/data/tables`,params)
  },

  /**
   * 删除来源数据结构（系统级）
   * */
  delectSourceTransactionData(id){
    return httpFetch.delete(`${config.localUrl}/api/general/source/transaction/data/tables/${id}`)
  },

  /**
   * 查询来源数据结构byID（系统级）
   * */
  getSourceTransactionDatabyID(id){
    return httpFetch.get(`${config.localUrl}/api/general/source/transaction/data/tables/${id}`)
  },

  /**
   * 查询来源数据结构（系统级）
   * @param params={
   * "sourceDateCode":""
   * "sourceTransactionId":1
   * "description":""
   * "enabled":true
   *
   * }
   * */
  /*  getSourceTransactionData(params){
   return httpFetch.get(`${config.localUrl}/api/general/source/transaction/data/tables/query`,params)
   },*/

  /**
   * 查询来源事务结构（张开）
   * @param param = {
      sourceTransactionType :""    ( 传来源事务代码)
   }
   * */
  getSourceTransactionData(params){
    return httpFetch.get(`${config.localUrl}/api/accounting/util/general/ledger/fields/data/source`,params)
  },


  /**
   * 新建来源事务凭证模板（系统级）
   * @param  param={
    	"journalLineModelCode":"Test3",
	    "description":"测试",
	    "sourceTransactionId":1,
	     "glSceneId":1,
	     "basicSourceDate":1
   *}
   * */

  addSourceTransactionModel(params){
    return httpFetch.post(`${config.localUrl}/api/general/journal/line/model`,params)
  },

  /**
   * 修改来源事务凭证模板（系统级）
   * @param params={
	   "id":945496154606243841,
	   "description":"测试",
	    "versionNumber":1
   }* */
  upSourceTransactionModel(params){
    return httpFetch.put(`${config.localUrl}/api/general/journal/line/model`,params)
  },

  /**
   * 删除来源事务凭证模板（系统级）
   * */
  delectSourceTransactionModel(id){
    return httpFetch.delete(`${config.localUrl}/api/general/journal/line/model/${id}`)
  },

  /**
   * 查询来源事务凭证模板byID（系统级）
   * */
  getSourceTransactionModelbyID(id){
    return httpFetch.get(`${config.localUrl}/api/general/journal/line/model/${id}`)
  },

  /**
   * 查询来源事务凭证模板（系统级）
   * @param params={
       "journalLineModelCode":"Test3",
	    "sourceTransactionId":1,
   * }
   * */
  getSourceTransactionModel(params){
    return httpFetch.get(`${config.localUrl}/api/general/journal/line/model/query`,params)
  },

  /**
   *新增来源事务(账套级)
   * @param params=[
    {
        "sourceTransactionId": "951295549062877185",
        "glInterfaceFlag": "true"
    }
   ]
   * */
  addSourceTransactionSob(setOfBooksId,params){
    return httpFetch.post(`${config.localUrl}/api/general/ledger/sob/source/transactions?setOfBooksId=${setOfBooksId}`,params)
  },

  /**
   * 修改来源事务(账套级)
   * @param params={
    	"id":945540376126406657,
	    "sourceTransactionCode":"Test1",
	    "description":"测试1",
	    "versionNumber":1
   }
   * */
  upSourceTransactionSob(params){
    return httpFetch.put(`${config.localUrl}/api/general/ledger/sob/source/transactions`,params)
  },

  /**
   * 删除来源事务(账套级)
   * */
  delectSourceTransactionSob(id){
    return httpFetch.delete(`${config.localUrl}/api/general/ledger/sob/source/transactions/${id}`)
  },

  /**
   * 查询来源事务byID(账套级)
   * */
  getSourceTransactionbyIDSob(id){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/sob/source/transactions/${id}`)
  },

  /**
   * 查询来源事务(账套级)
   * @param params={
   *    setOfBooksId
   *    page
   *    size
   * }
   * */
  getSourceTransactionSob(params){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/sob/source/transactions/query`,params)
  },

  /**
   * 新建来源数据结构(账套级)
   * @param  param={
    	"sourceDateCode":"Test2",
	    "description":"测试2945176306781097985",
	    "sourceTransactionId":1
   *}
   * */

  addSourceTransactionDataSob(params){
    return httpFetch.post(`${config.localUrl}/api/general/source/transaction/data/tables`,params)
  },

  /**
   * 修改来源数据结构(账套级)
   * @param params={
    	"id":945540376126406657,
	    "sourceTransactionCode":"Test1",
	    "description":"测试1",
	    "versionNumber":1
   }
   * */
  upSourceTransactionDataSob(params){
    return httpFetch.put(`${config.localUrl}/api/general/source/transaction/data/tables`,params)
  },

  /**
   * 删除来源数据结构(账套级)
   * */
  delectSourceTransactionDataSob(id){
    return httpFetch.delete(`${config.localUrl}/api/general/source/transaction/data/tables/${id}`)
  },

  /**
   * 查询来源数据结构byID(账套级)
   * */
  getSourceTransactionDatabyIDSob(id){
    return httpFetch.get(`${config.localUrl}/api/general/source/transaction/data/tables/${id}`)
  },

  /**
   * 查询来源数据结构(账套级)
   * @param params={
   * "sourceDateCode":""
   * "sourceTransactionId":1
   * "description":""
   * "enabled":true
   *
   * }
   * */
  getSourceTransactionDataSob(params){
    return httpFetch.post(`${config.localUrl}/api/general/source/transaction/data/tables/query`,params)
  },

  /**
   * 添加源事务凭证模板(账套级)
   * @param  param=[
      {
          "journalLineModelId": "1",
          "glSceneId": "1"
      }
   ]
   * */

  addSourceTransactionModelSob(sobSourceTransactionId,params){
    return httpFetch.post(`${config.localUrl}/api/general/ledger/sob/journal/line/model?sobSourceTransactionId=${sobSourceTransactionId}`,params)
  },

  /**
   * 修改来源事务凭证模板(账套级)
   * @param params={
	   "id":945496154606243841,
	   "description":"测试",
	    "versionNumber":1
   }* */
  upSourceTransactionModelSob(params){
    return httpFetch.put(`${config.localUrl}/api/general/ledger/sob/journal/line/model`,params)
  },

  /**
   * 删除来源事务凭证模板(账套级)
   * */
  delectSourceTransactionModelSob(id){
    return httpFetch.delete(`${config.localUrl}/api/general/ledger/sob/journal/line/model/${id}`)
  },


  /**
   * 查询来源事务凭证模板(账套级)
   * @param params={
       "sobSourceTransactionId":1
	    "size":1,
	    "page":
   * }
   * */
  getSourceTransactionModelSob(params){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/sob/journal/line/model/query`,params)

  },

  /**
   * 查询来源事务凭证模板ById
   * */
  getSourceTransactionModelSobById(id){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/sob/journal/line/model/${id}`)
  },

  /**
   * 获取核算场景
   * @param params ={
      glSceneCode:""
      glSceneName:""
      isEnable:""
   }
   * */
  getGlScene(params){
    return httpFetch.get(`${config.localUrl}/api/account/general/ledger/scene/queryAll`,params)

  },

  /**
   * 添加凭证行模板取值规则(账套级)
   * @param  param=[
    {
        "sobJournalLineModelId":"1234",
	      "accountElementCode":"123",
	      "dataRule":"asd",
	       "sourceDataId":"124",
	       "tableField":"asf"
    }
   ]
   * */

  addSourceLineModelDataRules(params){
    return httpFetch.post(`${config.localUrl}/api/general/ledger/journal/line/model/data/rules`,params)
  },

  /**
   * 修改凭证行模板取值规则(账套级)
   * @param params={
	  "id": "944134708152950785",
	  "sobJournalLineModelId":"1234",
	  "accountElementCode":"123fasf",
	  "dataRule":"asd",
	  "sourceDataId":"124",
	  "tableField":"asf",
	   "enabled": true,
    "deleted": false,
    "createdDate": "2017-12-22T17:17:10.22+08:00",
    "createdBy": 174342,
    "lastUpdatedDate": "2017-12-22T17:17:10.22+08:00",
    "lastUpdatedBy": 174342,
    "versionNumber": 2
   }* */
  upSourceLineModelDataRules(params){
    return httpFetch.put(`${config.localUrl}/api/general/ledger/journal/line/model/data/rules`,params)
  },



  /**
   * 查询凭证行模板取值规则(账套级)
   * @param params={
       "sobJournalLineModelId":1
	    "size":1,
	    "page":
   * }
   * */
  getSourceLineModelDataRules(params){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/journal/line/model/data/rules/query`,params)

  },

  /**
   * 添加转换规则(账套级)
   * @param  param={
	"modelDataRuleId":"23",
	"priority":2,
	"changeRule":"123",
	"compareData":"124",
	"compareElementId":"124",
	"changeData":"asf"
 }

   * */

  addSourceLineModelChangeRules(params){
    return httpFetch.post(`${config.localUrl}/api/general/ledger/journal/line/model/change/rules`,params)
  },

  /**
   * 修改转换规则(账套级)
   * @param params={}* */
  upSourceLineModelChangeRules(params){
    return httpFetch.put(`${config.localUrl}/api/general/ledger/journal/line/model/change/rules`,params)
  },



  /**
   * 查询转换规则(账套级)
   * @param params={
       "modelDataRuleId":1
	    "size":1,
	    "page":
   * }
   * */
  getSourceLineModelChanegRules(params){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/journal/line/model/change/rules`,params)

  },




  /**
   * 添加凭证行模板判断条件(账套级)
   * @param  param=[
    {
      "sequence":2,
	    "sobJournalLineModelId":"123",
	    "accountElementCode":"214",
	    "leftBracket":"(",
	    "andOr":"or",
	    "rightBracket":")",
	    "judgeRule":"Asf",
	     "judgeData":"Asf"
    }
   ]
   * */

  addSourceLineModelJudgeRules(params){
    return httpFetch.post(`${config.localUrl}/api/general/ledger/journal/line/model/judge/rules`,params)
  },

  /**
   * 修改凭证行模板判断条件(账套级)
   * @param params={
	    "id": "944134708152950785",
	    "sobJournalLineModelId":"1234",
	    "accountElementCode":"123fasf",
	    "dataRule":"asd",
	    "sourceDataId":"124",
	    "tableField":"asf",
	    "enabled": true,
      "deleted": false,
      "createdDate": "2017-12-22T17:17:10.22+08:00",
      "createdBy": 174342,
      "lastUpdatedDate": "2017-12-22T17:17:10.22+08:00",
      "lastUpdatedBy": 174342,
      "versionNumber": 2
   }* */
  upSourceLineModelJudgeRules(params){
    return httpFetch.put(`${config.localUrl}/api/general/ledger/journal/line/model/judge/rules`,params)
  },



  /**
   * 查询凭证行模板判断条件(账套级)
   * @param params={
       "sobJournalLineModelId":1
	    "size":1,
	    "page":
   * }
   * */
  getSourceLineModelJudgeRules(params){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/journal/line/model/judge/rules/query`,params)

  },


  /**
   * 添加凭证行模板核算规则(账套级)
   * @param  param=[
    {
     	"sobJournalLineModelId":"1234",
	   "journalFieldCode":"123",
	   "dataRule":"asd",
   	"data":"124",
	  "segementId":"23"
    }
   ]
   * */

  addSourceLineModelRules(params){
    return httpFetch.post(`${config.localUrl}/api/general/ledger/sob/transaction/account/rules`,params)
  },

  /**
   * 修改凭证行模板核算规则(账套级)
   * @param params={
	     "id": "944136702292844545",
	     "sobJournalLineModelId":"1234",
	     "journalFieldCode":"123",
	     "dataRule":"asdasfd",
	     "data":"124sdfasdf",
	    "segementId":"134",
	    "enabled": true,
      "deleted": false,
       "createdDate": "2017-12-22T17:25:05.653+08:00",
      "createdBy": 174342,
     "lastUpdatedDate": "2017-12-22T17:25:05.653+08:00",
    "lastUpdatedBy": 174342,
    "versionNumber": 3
}
   }* */
  upSourceLineModelRules(params){
    return httpFetch.put(`${config.localUrl}/api/general/ledger/sob/transaction/account/rules`,params)
  },


  /**
   * 查询凭证行模板核算规则(账套级)
   * @param params={
       "sobJournalLineModelId":1
	    "size":1,
	    "page":
   * }
   * */
  getSourceLineModelRules(params){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/sob/transaction/account/rules/query`,params)
  },

  //获取科目段值
  getSegmentBySetOfBooksId(setOfBooksId){
    return httpFetch.get(`${config.localUrl}/api/general/ledger/segment/sets/querySegmentBySetOfBooksId?setOfBooksId=${setOfBooksId}`)
  },

  //条件查询系统级核算场景（分页）
  getAccountingScenarios(params){
    return httpFetch.get(`${config.accountingUrl}/accounting_service/api/account/general/ledger/scene/query`,params)
  },

  //修改系统级核算场景账
  updateAccountingScenarios(params){
    return httpFetch.put(`${config.accountingUrl}/accounting_service/api/account/general/ledger/scene`,params)
  },

  //增加系统级核算场景
  addAccountingScenarios(params){
    return httpFetch.post(`${config.accountingUrl}/accounting_service//api/account/general/ledger/scene`,params)
  },

  //增加系统级核算要素
  addSysAccountingElements(params){
    return httpFetch.post(`${config.accountingUrl}/accounting_service/api/account/general/ledger/scene/elements`,params)
  },

  //更新系统级核算要素
  updateSysAccountingElements(params){
    return httpFetch.put(`${config.accountingUrl}/accounting_service/api/account/general/ledger/scene/elements`,params)
  },

  //根据id查询系统级核算场景
  getSysScenariosById(params){
    return httpFetch.get(`${config.accountingUrl}/accounting_service/api/account/general/ledger/scene/${params}`)
  },

  //获取匹配组字段
  getMatchGroupField(params){
    return httpFetch.get(`http://192.168.1.195:9998/api/general/match/group/filed/selectByInput`,params)
  },

  //系统级核算要素条件查询（分页）
  getElement(params){
    return httpFetch.get(`http://192.168.1.72:9988/api/account/general/ledger/scene/elements/query`,params)
  },

  //查询核算要素（过滤掉该场景下已经添加过的）


  //条件查询账套级核算要素（分页）
  getScenariosSob(params){
    return httpFetch.get(`http:////192.168.1.195:9091/api/generalLedgerSceneMapping/selectByInput`,params)
  },

  //新增或修改账套级核算场景
  addOrUpdateScenarios(params){
    return httpFetch.post(`http://192.168.1.195:9998/api/generalLedgerSceneMapping/insertOrUpdate`,params)
  },

  //根据id查询账套级核算场景
  getScenariosById(params){
    return httpFetch.get(`http://192.168.1.195:9091/api/generalLedgerSceneMapping/getById`,params)
  },

  //查询未添加到改账套下核算场景的系统场景
  getScenarioNotInSob(params){
    return httpFetch.get(`http://192.168.1.195:9091/api/generalLedgerSceneMapping/select/unassigned/scene`,params)
  },

  //获取匹配组代码非空的核算要素
  getElementsGroupNotNull(params){
    return httpFetch.get(`http://192.168.1.195:9091/api/account/general/ledger/scene/elements/all`,params)
  },

  //新增或修改账套级核算要素
  addOrUpdateSobElements(params){
    return httpFetch.post(`http://192.168.1.195:9091/api/generalLedgerSceneMappingGrpsHd/insert/head/and/line`,params)
  },


  //查询账套级核算要素
  getSobElement(params){
    return httpFetch.get(`http://192.168.1.195:9091/api/generalLedgerSceneMappingGrpsHd/selectByInput`,params)
  },

  //根据id查询匹配组信息
  getMatchGroupById(params){
    return httpFetch.get(`http://192.168.1.195:9091/api/generalLedgerSceneMappingGrpsHd/get/account/view/by/head/id`,params)
  },

  //条件查询科目匹配（分页）
  getSectionMatchByOptions(params,body){
    return httpFetch.post(`http://192.168.1.195:9091/api/generalLedgerSceneMappingDetails/get/details/by/codes?headId=${params.headId}&page=${params.page}&size=${params.size}`,body)
  },

  //批量新增或修改科目匹配
  batchInsertOrUpdateSection(params){
    return httpFetch.post(`http://192.168.1.195:9091/api/generalLedgerSceneMappingDetails/insertOrUpdateBatch`,params)
  },

  //批量删除科目匹配
  batchDeleteSection(params){
    return httpFetch.delete(`http://192.168.1.195:9091/api/generalLedgerSceneMappingDetails/deleteByIds`,params)
  },


}
