/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import valueListService from 'containers/setting/value-list/value-list.service';
export default {
  //撤销离职
  cancelResign: function(userOID) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/users/set/cancel/leaved/' + userOID)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //设置离职时间：点击离职：都是一个接口
  setResignDate: function(userOID, date) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/users/' + userOID + '/set/leaving/date/' + date)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //重新入职
  rehire: function(userOID) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/refactor/users/rehire/' + userOID)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //获取可用的电话前缀列表
  getMobilevalidateList() {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/mobilevalidate/list?isEnabled=false')
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  // 新增个人基本信息
  createPersonDetail(obj) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/refactor/users/v2', obj)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //获取个人基本信息
  getPersonDetail(userOID) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/users/v2/' + userOID)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err);
          reject(err);
        });
    });
  },
  //更新个人基本信息
  updatePersonDetail(obj) {
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/refactor/users/v2', obj)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //获取值列表：根据值列表oid
  //在扩展字段信息里面，有些字段是值列表，这个时候需要从dataSource解析值列表oid获取值列表
  getListByCustomEnumerationOID(customEnumerationOID) {
    return new Promise((resolve, reject) => {
      valueListService
        .getValueListInfo(customEnumerationOID)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //获取银行卡:马磊完成：返回禁用与禁用的银行卡
  getBankCards(userOID) {
    let param = {
      userOID: userOID,
      enable: null, //新加参数enable ，启用 true，禁用 false，全部 空
    };
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/contact/bank/account', param)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //创建银行卡
  creatBankCard(card) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/contact/bank/account', card)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //更新银行卡
  updateBankCard(card) {
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/contact/bank/account', card)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //获取证件信息:马磊完成：返回禁用与禁用的证件
  getContactCards(userOID) {
    let param = {
      userOID: userOID,
      enable: null, //新加参数enable ，启用 true，禁用 false，全部 空
    };
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/contact/cards', param)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //创建证件
  creatContactCard(card) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/contact/cards', card)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //更新证件
  updateContactCard(card) {
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/contact/cards', card)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //获取供应商信息
  getSupplierInfo: function(userOID) {
    let param = {
      userOID: userOID,
      enable: null, //新加参数enable ，启用 true，禁用 false，全部 空
    };
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/contact/supplier/ctrip', param)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //更新携程子账户
  updateSupplierInfo: function(data) {
    // let data = {
    //   userOID: "",
    //   enable: true,
    //   subAccountName: "testtest",
    //   userOID: "3caee0f8-7424-4a21-acc5-f8f3a2910d14",
    //   ...
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/contact/supplier/ctrip?userOID' + data.userOID, data)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
};
