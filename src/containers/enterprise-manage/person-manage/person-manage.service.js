/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';
export default {
  getSomething(params) {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + 'url', params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },

  //搜索人：新查询员工的接口，可以加很多参数
  searchPersonInDep(params) {
    return new Promise((resolve, reject) => {
      OrgService.searchPersonInDep(params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },

  //邀请没有激活的用户使用
  inviteUser(userOIDS){
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/refactor/users/invite', userOIDS)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },

  //导出人员信息数据
  //统一用导出组件export-modal
  // exportEmployeeData: function (params) {
    // let params = {
    //   roleType:"TENANT",
    //   keyword: keyword,
    //   status: status,
    //   departmentOIDs: departmentOIDs,
    //   corporationOIDs: entityOIDs
    // }
  //   return new Promise((resolve, reject) => {
  //     httpFetch.get(config.baseUrl + '/api/users/v2/search/full/export', params, {}, {responseType: 'arraybuffer'})
  //       .then((res) => {
  //         resolve(res)
  //       })
  //       .catch((err) => {
  //         errorMessage(err.response);
  //         reject(err);
  //       })
  //   })
  // },
  //导出证件信息数据
  //统一用导出组件export-modal
  // exportIDCardData: function (params) {

    // let params = {
    //   roleType:"TENANT",
    //   keyword: keyword,
    //   status: status,
    //   departmentOIDs: departmentOIDs,
    //   corporationOIDs: entityOIDs
    // }
  //   return new Promise((resolve, reject) => {
  //     httpFetch.get(config.baseUrl + '/api/users/v2/search/contact/card/export', params, {}, {responseType: 'arraybuffer'})
  //       .then((res) => {
  //         resolve(res)
  //       })
  //       .catch((err) => {
  //         errorMessage(err.response);
  //         reject(err);
  //       })
  //   })
  // },
  //导出银行卡信息数据
  //统一用导出组件export-modal
  // exportBankCardData: function (params) {

    // let params = {
    //   roleType:"TENANT",
    //   keyword: keyword,
    //   status: status,
    //   departmentOIDs: departmentOIDs,
    //   corporationOIDs: entityOIDs
    // }
    // return new Promise((resolve, reject) => {
    //   httpFetch.get(config.baseUrl + '/api/users/v2/search/contact/bank/account/export', params, {}, {responseType: 'arraybuffer'})
    //     .then((res) => {
    //       resolve(res)
    //     })
    //     .catch((err) => {
    //       errorMessage(err.response);
    //       reject(err);
    //     })
    // })

  // },
  //导出携程信息数据
  //统一用导出组件export-modal
  // exportCtripData: function (params) {
    // let params = {
    //   roleType:"TENANT",
    //   keyword: keyword,
    //   status: status,
    //   departmentOIDs: departmentOIDs,
    //   corporationOIDs: entityOIDs
    // }
    // return new Promise((resolve, reject) => {
    //   httpFetch.get(config.baseUrl + '/api/users/v2/search/contact/supplier/ctrip/export', params, {}, {responseType: 'arraybuffer'})
    //     .then((res) => {
    //       resolve(res)
    //     })
    //     .catch((err) => {
    //       errorMessage(err.response);
    //       reject(err);
    //     })
    // })

  // },

  //人员信息模版
  downloadEmployeeTemplate: function () {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/users/v2/fullInfo/template/export', {},  {},{responseType: 'arraybuffer'})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //下载携程供应商模版
  downloadCtripSupplierTemplate: function () {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/contact/supplier/ctrip/template/export', {}, {},{responseType: 'arraybuffer'})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //下载银行信息模板
  downloadBankAccountTemplate: function () {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/contact/bank/accounts/template/export', {},{}, {responseType: 'arraybuffer'})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //下载证件信息模板
  downloadCardAccountTemplate: function () {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/contact/cards/template/export', {},{}, {responseType: 'arraybuffer'})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },


  //人员信息导入
  importEmployeeNew: function (file) {
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/refactor/users/v2/info/import', file)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //导入监听返回:人员信息导入之后监听
  getBatchTransactionLogNew: function (transactionOID) {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/batch/transaction/logs/v2/' + transactionOID)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //导出错误记录：人员信息
  exportFailedLog: function (transactionOID) {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/batch/transaction/logs/failed/export/' + transactionOID,{},{},{responseType: "arraybuffer"})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })

  }


}
