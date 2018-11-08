/**
 * Created by zhouli on 18/3/13
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import SobService from 'containers/finance-setting/set-of-books/set-of-books.service';
import valueListService from 'containers/setting/value-list/value-list.service';

export default {
  getTenantAllSob(params) {
    return new Promise(function (resolve, reject) {
      SobService.getTenantAllSob(params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //是否启用部门
  toggleDepartment: function (enabled) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/company/configurations/set/cost/center/department/' + enabled)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //新增成本中心
  createCostCenter(params) {
    //之前创建成本中心需要掉一个接口，校验名称是否唯一，这次重构希望在新增的时候校验
    // let params = {
    //   "costCenterOID": null,
    //   "name": "1111111",
    //   "setOfBooksId": "957127071024513026",
    //   "i18n": {"name": [{"language": "zh_cn", "value": "1111111"}, {"language": "en", "value": "1111111"}]},
    //   "enabled": false,
    //   "i118name": [{"language": "zh_cn", "value": "1111111"}, {"language": "en", "value": "1111111"}],
    //   "code": "111"
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/cost/centers', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //编辑成本中心
  updateCostCenter: function (costCenter) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/cost/centers/', costCenter)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //查询账套
  //根据成本中心查询列表
  getCostCenterBySobId(params) {
    // let params = {
    //   roleType:"TENANT",
    //   page:"page",
    //   size:"page",
    //   setOfBooksId:"setOfBooksId",
    // }
    return new Promise(function (resolve, reject) {
      //这个接口需要做成，没有传账套就查询全部
      httpFetch.get(config.baseUrl + '/api/cost/center/company', params)
        .then(function (res) {
          resolve({
            data: res.data,
            total: Number.parseInt(res.headers['x-total-count'])
          })
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //查询成本中心详情
  getCostCenterDetail: function (costCenterOID) {
    return new Promise(function (resolve, reject) {
      //这个接口需要做成，没有传账套就查询全部
      httpFetch.get(config.baseUrl + '/api/cost/centers/simple/' + costCenterOID)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //获取成本中心项列表
  //搜索成本中心项
  getCostCenterItemsAll(costCenterOID, params) {
    // let params = {
    //   page: page,
    //   size: size,
    //   keyword:keyword,//成本中心项名称与code
    //   sort: sort//是否安装code排序
    // }
    return new Promise(function (resolve, reject) {
      //这个接口需要做成，没有传账套就查询全部
      httpFetch.get(config.baseUrl + '/api/cost/center/items/' + costCenterOID + '/all', params)
        .then(function (res) {
          resolve({
            data: res.data,
            total: Number.parseInt(res.headers['x-total-count'])
          })
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //--------导入成本中心项----start
  //导入成本中心项：下载模板
  downloadCostCenterItemTemplate: function () {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/cost/center/items/template/download', {}, {}, {responseType: "arraybuffer"})
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //导入成本中心项人员关系：下载模板
  downloadCostCenterItemPersonTemplate: function () {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/cost/center/items/with/users/template/download', {}, {}, {responseType: "arraybuffer"})
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //导入成本中心项
  importTemplateCostCenterOID: function (costCenterOID, file) {
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/cost/center/items/import/' + costCenterOID, file)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //导入成本中心项-人员
  importTemplateCostCenterPersonOID: function ( file) {
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/cost/center/items/import/with/users', file)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //成本中心项：值导入后根据transactionOID查看有无错误信息
  //成本中心项-人员：值导入后根据transactionOID查看有无错误信息
  //两个导入错误信息，都一样的
  getCostCenterBatchTransactionLog: function (transactionOID) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/batch/transaction/logs/costcenteritem/' + transactionOID)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //成本中心项：值导入后若有错误信息，则下载该错误信息excel
  exportCostCenterBatchTransactionLog: function (transactionOID) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/batch/transaction/logs/failed/export/costcenteritem/' + transactionOID, {}, {},
        {responseType: "arraybuffer"})
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //成本中心项-人员：值导入后若有错误信息，则下载该错误信息excel
  exportCostCenterPersonBatchTransactionLog:function (transactionOID) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/batch/transaction/logs/failed/export/costcenteritem/with/user/' + transactionOID, {}, {},
        {responseType: "arraybuffer"})
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //--------导入成本中心项----end
  //新增成本中心项
  createCostCenterItem: function (costCenterOID, data) {
    // let data={
    //     name: data.name,
    //     code: data.code,
    //     enabled: data.enabled,
    //     public: data.public,
    //     managerOID: data.managerOID,
    //     parentCostCenterItemOID: data.parentCostCenterItemOID
    //     secondaryDepartmentNames
    //     secondaryDepartmentIds
    //     primaryDepartmentName
    //     primaryDepartmentId
    //     i18n
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/cost/center/items/' + costCenterOID, data)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //编辑成本中心项
  updateCostCenterItem: function (data) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/cost/center/items', data)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //添加成本中心项的人
  costCenterItemAssociateUsersDTO: function (params) {
    // let  params = {
    //   userOIDs:[],
    //   costCenterItemOIDs:[],
    //   selectMode:"default",
    //   costCenterOID:""
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/cost/center/items/with/users/', params)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //查看成本中心项详情
  getCostCenterItemDetail: function (CostCenterItemOID) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/cost/center/item/' + CostCenterItemOID)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //搜索成本中心项的人
  //todo:keyword
  //关键字查询：姓名与工号
  getCostCenterItemUsers: function (params, CostCenterItemOID) {
    // let  params = {
    //   page:[],
    //   size:[],
    //   keyword:"员工姓名与工号,
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/cost/center/item/' + CostCenterItemOID + '/users', params)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //删除成本中心项的人
  removeUserFromCostCenterItemAssociation: function (userOID, costCenterOID) {
    return new Promise(function (resolve, reject) {
      httpFetch.delete(config.baseUrl + '/api/remove/user/' + userOID + '/cost/center/' + costCenterOID)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //获取值列表：根据值列表oid
  //在扩展字段信息里面，有些字段是值列表，这个时候需要从dataSource解析值列表oid获取值列表
  getListByCustomEnumerationOID(customEnumerationOID) {
    return new Promise((resolve, reject) => {
      valueListService.getValueListInfo(customEnumerationOID)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //批量启用／禁用成本中心项
  batchUpdate(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + `/api/cost/center/items/batch/enable/or/disable`,params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //每次翻页，获取勾选过的
  //allData本页所有数据，unselected本页没有勾选的
  getSelected(allData,unselected){
    let arr = [];
    if(unselected && unselected.length > 0){
      for(let i = 0; i < allData.length; i++){
        if(!hasIn(allData[i],unselected)){
          arr.push(allData[i]);
        }
      }
      return arr;
    }else {
      return allData;
    }

    function hasIn(target,unselected) {
      for(let i = 0; i < unselected.length; i++){
        if(target === unselected[i]){
          return true;
        }
      }
      return false;
    }
  },
  //把没有勾选的挑出来
  //allData本页所有数据,selectData本页没有勾选的
  getUnSelected(allData, selectData) {
    //这种情况是全部勾选的
    if (allData.length <= selectData.length) {
      return []
    }
    //这种请求是全部没勾选
    if (selectData.length == 0) {
      return allData;
    }

    let t = [];
    for (let j = 0; j < allData.length; j++) {
      if (!arrHas(allData[j], selectData)) {
        t.push(allData[j]);
      }
    }
    return t;

    //目标元素是否在数组里面，在里面返回true
    function arrHas(target, arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
          return true;
        }
      }
      return false;
    }
  },
  //获取每页反选的数据的总数，以数组形式返回
  getReverseSelection(reverseSelectionMap) {
    let arr = [];
    for (let key in reverseSelectionMap) {
      arr = arr.concat(reverseSelectionMap[key]);
    }
    return arr;
  },

  //关联部门到成本中心项，包含子部门
  asDepartmentToCostcenteritem(params){
    // let params = {
    //   "costCenterItemId":"costCenterItemId",
    //   "departmentDTOs":[{"id":部门id,"custDeptNumber":部门编码}]
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + "/api/department/costcenteritem", params)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //关键字查询部门列表
  getCostcenteritemDepartmentList(costCenterItemId,params){
    // let params = {
    //   keyword: keyword
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + "/api/department/costcenteritem/by/" + costCenterItemId, params)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //删除关联的部门在成本中心项
  delDepartmentToCostcenteritem(costCenterItemDepartmentId){
    return new Promise(function (resolve, reject) {
      httpFetch.delete(config.baseUrl + "/api/department/costcenteritem/" + costCenterItemDepartmentId)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  }


}
