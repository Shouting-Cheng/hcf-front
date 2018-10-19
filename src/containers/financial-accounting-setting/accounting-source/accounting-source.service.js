import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  /**
   *获取未添加的来源事务（系统级）
   * */

  getSourceTransactionNotAdd(){
    return httpFetch.get(`${config.accountingUrl}/api/general/source/transactions/all/codeValue`)
  },

  /**
   *新增来源事务（系统级）
   * @param params={
       "sourceTransactionCode":"Test4",
       "description":"测试"
   }
   * */
  addSourceTransaction(params){
    return httpFetch.post(`${config.accountingUrl}/api/general/source/transactions`, params)
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
    return httpFetch.put(`${config.accountingUrl}/api/general/source/transactions`, params)
  },

  /**
   * 删除来源事务（系统级）
   * */
  delectSourceTransaction(id){
    return httpFetch.delete(`${config.accountingUrl}/api/general/source/transactions/${id}`)
  },

  /**
   * 查询来源事务byID（系统级）
   * */
  getSourceTransactionbyID(id){
    return httpFetch.get(`${config.accountingUrl}/api/general/source/transactions/${id}`)
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
    return httpFetch.get(`${config.accountingUrl}/api/general/source/transactions/query`, params)
  },

  /**
   * 新建来源数据结构（系统级）
   * @param  param=[{
    	"sourceDateCode":"Test2",
	    "description":"测试2945176306781097985",
	    "sourceTransactionId":1
   },{}....]
   * */

  // addSourceTransactionData(params){
  //   return httpFetch.post(`${config.accountingUrl}/api/general/source/transaction/data/tables`, params)
  // },

  /**
   * 修改来源数据结构（系统级）
   * @param params={
    	"id":945540376126406657,
	    "sourceTransactionCode":"Test1",
	    "description":"测试1",
	    "versionNumber":1
   }
   * */
  // upSourceTransactionData(params){
  //   return httpFetch.put(`${config.accountingUrl}/api/general/source/transaction/data/tables`, params)
  // },

  /**
   * 删除来源数据结构（系统级）
   * */
  // delectSourceTransactionData(id){
  //   return httpFetch.delete(`${config.accountingUrl}/api/general/source/transaction/data/tables/${id}`)
  // },

  /**
   * 查询来源数据结构byID（系统级）
   * */
  // getSourceTransactionDatabyID(id){
  //   return httpFetch.get(`${config.accountingUrl}/api/general/source/transaction/data/tables/${id}`)
  // },

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
   return httpFetch.get(`${config.accountingUrl}/api/general/source/transaction/data/tables/query`,params)
   },*/

  /**
   * 查询来源事务结构（张开）
   * @param param = {
      sourceTransactionType :""    ( 传来源事务代码)
   }
   * */
  getSourceTransactionData(params){
    return httpFetch.get(`${config.accountingUrl}/api/accounting/util/general/ledger/fields/data/source`, params)
  },


  /**
   *数据来源
   * @param param = {
      sourceTransactionType :""    ( 传来源事务代码)
      dataStructure :"" (数据结构id)
   }
   * */
  getSourceTransactionDataValue(params){
    return httpFetch.get(`${config.accountingUrl}/api/accounting/util/general/ledger/fields/data/source/relate`, params)
  },

  /**
   * 根据来源事务代码获取来源事务数据结构下的明细字段
   * @param param = {
   *   sourceTransactionType = ""
   *   dataStructure = ""
   * }
   * */

  getTableField(params){
    return httpFetch.get(`${config.accountingUrl}/api/accounting/util/general/ledger/fields/data/source/fields`, params);
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
    return httpFetch.post(`${config.accountingUrl}/api/general/journal/line/model`, params)
  },

  /**
   * 修改来源事务凭证模板（系统级）
   * @param params={
	   "id":945496154606243841,
	   "description":"测试",
	    "versionNumber":1
   }* */
  upSourceTransactionModel(params){
    return httpFetch.put(`${config.accountingUrl}/api/general/journal/line/model`, params)
  },

  /**
   * 删除来源事务凭证模板（系统级）
   * */
  delectSourceTransactionModel(id){
    return httpFetch.delete(`${config.accountingUrl}/api/general/journal/line/model/${id}`)
  },

  /**
   * 查询来源事务凭证模板byID（系统级）
   * */
  getSourceTransactionModelbyID(id){
    return httpFetch.get(`${config.accountingUrl}/api/general/journal/line/model/${id}`)
  },

  /**
   * 查询来源事务凭证模板（系统级）
   * @param params={
       "journalLineModelCode":"Test3",
	    "sourceTransactionId":1,
   * }
   * */
  getSourceTransactionModel(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/journal/line/model/query`, params)
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
  addSourceTransactionSob(setOfBooksId, params){
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/sob/source/transactions?setOfBooksId=${setOfBooksId}`, params)
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
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/sob/source/transactions`, params)
  },

  /**
   * 删除来源事务(账套级)
   * */
  delectSourceTransactionSob(id){
    return httpFetch.delete(`${config.accountingUrl}/api/general/ledger/sob/source/transactions/${id}`)
  },

  /**
   * 查询来源事务byID(账套级)
   * */
  getSourceTransactionbyIDSob(id){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/sob/source/transactions/${id}`)
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
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/sob/source/transactions/query`, params)
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
    return httpFetch.post(`${config.accountingUrl}/api/general/source/transaction/data/tables`, params)
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
    return httpFetch.put(`${config.accountingUrl}/api/general/source/transaction/data/tables`, params)
  },

  /**
   * 删除来源数据结构(账套级)
   * */
  delectSourceTransactionDataSob(id){
    return httpFetch.delete(`${config.accountingUrl}/api/general/source/transaction/data/tables/${id}`)
  },

  /**
   * 查询来源数据结构byID(账套级)
   * */
  getSourceTransactionDatabyIDSob(id){
    return httpFetch.get(`${config.accountingUrl}/api/general/source/transaction/data/tables/${id}`)
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
    return httpFetch.post(`${config.accountingUrl}/api/general/source/transaction/data/tables/query`, params)
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

  addSourceTransactionModelSob(sobSourceTransactionId, params){
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/sob/journal/line/model?sobSourceTransactionId=${sobSourceTransactionId}`, params)
  },

  /**
   * 修改来源事务凭证模板(账套级)
   * @param params={
	   "id":945496154606243841,
	   "description":"测试",
	    "versionNumber":1
   }* */
  upSourceTransactionModelSob(params){
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/sob/journal/line/model`, params)
  },

  /**
   * 删除来源事务凭证模板(账套级)
   * */
  delectSourceTransactionModelSob(id){
    return httpFetch.delete(`${config.accountingUrl}/api/general/ledger/sob/journal/line/model/${id}`)
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
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/sob/journal/line/model/query`, params)

  },

  /**
   * 查询来源事务凭证模板ById
   * */
  getSourceTransactionModelSobById(id){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/sob/journal/line/model/${id}`)
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
    return httpFetch.get(`${config.accountingUrl}/api/account/general/ledger/scene/queryAll`, params)

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
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/journal/line/model/data/rules`, params)
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
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/journal/line/model/data/rules`, params)
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
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/journal/line/model/data/rules/query`, params)
  },


  /**
   * 根据id查询凭证模板取值规则
   * */
  getSourceLineModelDataRulesById(id){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/journal/line/model/data/rules/${id}`)
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
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/journal/line/model/change/rules`, params)
  },

  /**
   * 修改转换规则(账套级)
   * @param params={}* */
  upSourceLineModelChangRules(params){
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/journal/line/model/change/rules`, params)
  },


  /**
   * 查询转换规则(账套级)
   * @param params={
       "modelDataRuleId":1
	    "size":1,
	    "page":
   * }
   * */
  getSourceLineModelChangeRules(params){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/journal/line/model/change/rules/query?`, params)

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
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/journal/line/model/judge/rules`, params)
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
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/journal/line/model/judge/rules`, params)
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
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/journal/line/model/judge/rules/query`, params)

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
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/sob/transaction/account/rules`, params)
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
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/sob/transaction/account/rules`, params)
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
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/sob/transaction/account/rules/query`, params)
  },

  /**
   * 获取场景的核素要素
   * @param params = {
        transactionSceneId:"",
        enabled :"",
    }
   * */
  getElementsByTransActionSceneId(params){
    return httpFetch.get(`${config.accountingUrl}/api/account/general/ledger/scene/elements/queryAll`, params)

  },

  //获取科目段值
  getSegmentBySetOfBooksId(setOfBooksId,sobJournalLineModelId){
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/segment/sets/querySegmentBySetOfBooksId?setOfBooksId=${setOfBooksId}&sobJournalLineModelId=${sobJournalLineModelId}`)
  },

  //根据租户查询帐套信息
  getSetOfBooksByTenant(){
    return httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`)
  }

}
