/**
 * Created by zhouli on 18/1/26
 * Email li.zhou@huilianyi.com
 * 人员规则组系列接口
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  //根据国家的code获取国家省市的数据
  getCountryDataByCode(code, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].code + "" === code) {
        return data[i].children
      }
    }
    return "";
  },
  //根据国家code获取国家名字
  getCountryNameByCode(code, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].code + "" === code) {
        return data[i].country
      }
    }
    return "";
  },
  //根据省的code获取省名
  getStateNameByCode(countryCode, stateCode, data) {
    var country = "";
    for (let i = 0; i < data.length; i++) {
      if (data[i].code + "" === countryCode) {
        country = data[i].children;
        break;
      }
    }
    for (let i = 0; i < country.length; i++) {
      if (country[i].code + "" === stateCode) {

        return country[i].state
      }
    }
    return "";
  },
  //根据code获取市名
  getCityNameByCode(countryCode, stateCode, cityCode, data) {
    var country = "";
    var state = "";
    for (let i = 0; i < data.length; i++) {
      if (data[i].code + "" === countryCode) {
        country = data[i].children;
        break;
      }
    }
    for (let i = 0; i < country.length; i++) {
      if (country[i].code + "" === stateCode) {

        state = country[i].children;
        break;
      }
    }
    for (let i = 0; i < state.length; i++) {
      if (state[i].code + "" === cityCode) {
        return state[i].city;
      }
    }
    return "";
  },
  //获取所有国家列表
  getCountries(lang) {
    let params = {
      language: lang === 'zh_CN' ? "zh_CN" : "en_US",
      page: 0,
      size: 1000
    };
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.locationUrl + '/api/localization/query/country', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //产品需求是，只是选择了中国，才出现省市的地址

  //获取省和市
  getStatesAndCitys(params) {
    // let params = {
    //   language: "zh_cn",
    //   code: "",
    //   vendorType: "standard"
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.locationUrl + '/api/localization/query/stateAndCity', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //获取省
  getStates(params) {
    // let params = {
    //   language: "zh_cn",
    //   code: "",
    //   vendorType: "standard"
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.locationUrl + '/api/localization/query/state', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //获取市
  getCities(params) {
    // let params = {
    //   language: "zh_cn",
    //   code: "",
    //   vendorType: "standard"
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.locationUrl + '/api/localization/query/city', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },


  //查询或者搜索通用银行列表
  getSystemBankList(param, ps) {
    // let params = {"bankCode":"","bankBranchName":"创建","countryCode":"","openAccount":"甄汇",size,page}
    param.keyword = param.bankBranchName;
    param.page = ps.page;
    param.size = ps.size;
    param.isAll = true;
    //这个接口不加isSearchGeneral，代表查询全部的银行，包含自定义银行与系统银行
    //加上这个参数，代表只查询系统银行
    param.isSearchGeneral = true;
    // isAll 代表查询启用禁用的
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/bank/infos', param)
        .then(function (response) {
          response.data.map((item) => {
            item.key = item.id;
            if (item.detailAddress === null) {
              item.detailAddress = "";
            }
            if (item.openAccount === null) {
              item.openAccount = "";
            }
          });
          resolve(response)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //todo
  // 后端正在开发 '/api/bank/infos'接口，准备替换调/api/bank/infos/custom/search
  //通过一个接口，传参数，获取系统银行与自定义银行
  //查询或者搜索自定义银行列表
  getSelfBankList(params, ps) {
    // let params = {"bankCode":"","bankBranchName":"创建","countryCode":"","openAccount":"甄汇",}
    // isAll 代表查询启用禁用的
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/bank/infos/custom/search?page=' + ps.page + '&size=' + ps.size + '&isAll=true', params)
        .then(function (response) {
          response.data.map((item) => {
            //如果国家名字字段没有,设置为空
            if (!item.countryName) {
              item.countryName = "";
            }
            item.key = item.id;
          });
          resolve(response)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //新增自定义银行
  createSelfBank(params) {
    //  params = {
    //   "bankCode":"100861112321",
    //   "bankName":"测试创建银行信息",
    //   "enable":"true",
    //   "bankBranchName":"测试创建银行信息solr",
    // "openAccount":"开户地"
    // detailAddress："详细地址"
    // swiftCode："swiftCode"
    //   "countryCode":"CHN",
    //   "province":"上海",
    //   "provinceCode":"10086",
    //   "city":"上海市",
    //   "cityCode":"SHANGHAI",
    //   "bankHead":"315"
    // }
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/bank/infos/custom/create', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //修改自定义银行
  updateSelfBank(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/bank/infos/custom/modify', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //删除自定义银行
  deleteSelfBank(id) {
    return new Promise(function (resolve, reject) {
      httpFetch.delete(config.baseUrl + '/api/bank/infos/custom/remove/' + id)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //导入自定义银行：接口测试ok
  importSelfBank: function (file) {
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/bank/infos/import/custom/bank/info', file)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //导入自定义银行时:发生错误，循环调用：因为导入自定义银行报系统异常，接口测试ok
  importSelfBankErr: function (transactionOID) {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/batch/transaction/logs/bank/info/' + transactionOID)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //导出错误信息：因为导入自定义银行报系统异常，接口测试ok
  exportSelfBankErr: function (transactionOID) {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/batch/transaction/logs/failed/export/bankinfo/' + transactionOID, {}, {}, {responseType: 'arraybuffer'})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //导出自定义银行：接口测试ok
  exportSelfBank: function () {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/bank/infos/export/custom/bank/info', {}, {}, {responseType: 'arraybuffer'})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //下载导入模板:接口测试ok
  downloadSelfBankTemp: function () {
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/bank/infos/custom/bank/info/template', {},{}, {responseType: 'arraybuffer'})
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
}
