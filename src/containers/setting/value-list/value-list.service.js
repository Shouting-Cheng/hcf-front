import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
export default {
  //新建值列表
  newValueList(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/v2/custom/enumerations', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //编辑值列表
  uploadValueList(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/v2/custom/enumerations', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //获取值列表 列表，isCustom: CUSTOM(自定义值列表)、SYSTEM(系统值列表)
  getValueListList(page, size, isCustom) {
    let params = {
      isCustom: isCustom,
      page: page,
      size: size
    }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/v2/custom/enumerations', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //根据公司Oid及值列表Oid分配公司
  distributeCompany(companies, customOids) {
    let params = {
      customEnumerationOids: customOids,
      companyOids: companies
    }
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/custom/enumeration/relevance/company', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //根据值列表Oid获取值列表信息
  getValueListInfo(Oid) {
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/custom/enumerations/' + Oid)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //获取值列表项:包括系统值列表项与自定义值列表项
  //主要用于读取多语言
  getValue(customEnumerationItemOid){
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/custom/enumerations/items/'+customEnumerationItemOid)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //根据值列表oid与value，查询值列表的messageKey
  getMessageKeyByValue(params){
    // let params = {
    //   customEnumerationOid:"",
    //   messageKey:""//注意一下，刚才与后端陈良钦，确认过，这个参数要传value，
    // }
    //整个接口返回的结果是messageKey
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/custom/enumerations/items',params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //新建值列表项:包括系统值列表项与自定义值列表项
  newValue(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/custom/enumerations/items', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //编辑值列表项:包括系统值列表项与自定义值列表项
  updateValue(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.put(config.baseUrl + '/api/custom/enumerations/items', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //根据值列表Oid获取值内容列表
  getValueList(page, size, Oid, keyWords) {
    let params = {
      page,
      size,
      keyword: keyWords
    }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/custom/enumerations/' + Oid + '/items', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //根据值列表Oid获取已分配的公司列表
  getCompanyList(page, size, Oid) {
    let params = {
      page,
      size,
      customEnumerationOid:Oid
    }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/custom/enumeration/find/distribution', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //根据值列表Oid导出值,isCustom: CUSTOM(自定义值列表)、SYSTEM(系统值列表)
  exportValues(params, Oid, isCustom) {
    //isCustom传false就是系统值列表
    let url = `${config.baseUrl}/api/custom/enumerations/items/export?customEnumerationOid=${Oid}&isCustom=${isCustom === 'CUSTOM'}`;
    return httpFetch.post(url, params, {}, { responseType: 'arraybuffer' });
  },
  //根据值Oid获取员工列表
  getEmployeeList(page, size, Oid) {
    let params = {
      page,
      size,
      customEnumerationItemOid:Oid
    }
    return new Promise(function (resolve, reject) {
      httpFetch.get(config.baseUrl + '/api/custom/enumerations/items/users', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //新增员工
  newAddEmployees(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/custom/enumerations/items/users', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //编辑添加员工
  updateAddEmployees(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + '/api/custom/enumerations/items/users', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //删除员工
  deleteEmployees(params) {
    return new Promise(function (resolve, reject) {
      httpFetch.delete(config.baseUrl + '/api/custom/enumerations/items/users', params)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },
  //批量启用／禁用值列表项
  batchUpdate(customEnumerationItemOids, enable) {
    return new Promise(function (resolve, reject) {
      httpFetch.post(config.baseUrl + `/api/custom/enumeration/items/batch/enable/or/disable?customEnumerationItemOids=${customEnumerationItemOids}&enable=${enable}`)
        .then(function (res) {
          resolve(res)
        })
        .catch(function (err) {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  }

}
