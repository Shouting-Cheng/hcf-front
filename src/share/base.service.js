import config from 'config'
import React from 'react'
import app from '../index';
import httpFetch from 'share/httpFetch'
// import configureStore from 'stores'
// import { setUser, setLoginUser, setCompany, setLoginCompany, setTenant,
//   setProfile, setTenantProfile, setCompanyConfiguration, setIsOldCompany, setLanguageList} from 'actions/login'
import { message } from 'antd';
// import { setLanguage, setTenantMode } from 'actions/main'
// import errorMessage from 'share/errorMessage';
// import {getLanguageObjByCode} from 'share/utils';
// import {getBrowserInfo} from 'utils/common';

export default {

  //切换语言并设置
  changeLanguage(value) {
    let language = getLanguageObjByCode(value);

    let code = value;
    if (value === "zh_cn") {
      code = "zh_cn"
    }
    return httpFetch.post(`${config.baseUrl}/api/users/language/${code}`).then(response => {
      configureStore.store.dispatch(setLanguage(language));
      window.location.reload();
    })
  },
  pageRolesToObj(pageRoles) {
    let temp = {};
    pageRoles.forEach(function (item) {
      temp[item.pageName] = {
        pageName: item.pageName,
        action: item.action
      }
    });
    return temp;
  },
  //得到用户信息并存储信息
  getUser() {
    return new Promise((resolve, reject) => {
      //header加参数
      let accountHeader = {
        "x-helios-client": "web",
        "x-helios-clientVersion": getBrowserInfo().name + ":" + getBrowserInfo().version,
        "x-helios-appVersion": config.heliosVersion,
      };
      httpFetch.get(`${config.baseUrl}/api/account`, {}, accountHeader)
        .then((response) => {
          let user = response.data;
          //根据老中控设置
          let pageRoles = this.pageRolesToObj(response.data.pageRoles);
          sessionStorage.setItem('HLY-PageRoles', JSON.stringify(pageRoles));
          this.getTenant(user.tenantId);
          if (user.language === null) {
            //请初始化集团语言
            message.warn(messages("login.user.please.init.lang"));
            return;
          }
          let language = getLanguageObjByCode(user.language);
          configureStore.store.dispatch(setLanguage(language));
          configureStore.store.dispatch(setUser(response.data));
          configureStore.store.dispatch(setLoginUser(response.data));
          if (sessionStorage.getItem('HLY-RoleType')) {
            let roleType = JSON.parse(sessionStorage.getItem('HLY-RoleType'));
            configureStore.store.dispatch(setTenantMode(roleType === 'tenant'))
          } else {
            configureStore.store.dispatch(setTenantMode(React.Component.prototype.checkAuthorities('ROLE_TENANT_ADMIN')))
          }
          resolve(response)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err.response);
        })
    })
  },

  //获取个人待还款总金额
  getRepaymentAmount(userOID, companyOID, statusList) {
    return httpFetch.get(`${config.baseUrl}/api/loan/application/user/debt/amount`, {
      userOID: userOID,
      companyOID: companyOID,
      statusList: statusList
    }).then((response) => {
      return response;
    })
  },

  /**
   * 得到用户信息
   * @return {*|Promise.<TResult>}
   */
  getInfo() {
    return this.getUser().then(() => {
      return Promise.all([
        this.getCompany(),
        this.getProfile(),
        this.getTenantProfile(),
        this.getCompanyConfiguration(),
        this.getIsOldCompany(),
        this.getLanguageList()
      ])
    })
  },

  getLanguageList() {
    return httpFetch.post(`${config.baseUrl}/api/lov/language/zh_cn`, {}).then((response) => {
      configureStore.store.dispatch(setLanguageList(response.data));
      return response;
    })
  },

  //得到公司信息并存储在redux内
  getCompany() {
    return httpFetch.get(`${config.baseUrl}/api/my/companies`, {}).then((response) => {
      app.dispatch({
        type: 'user/saveCompany',
        payload: response.data,
      });
      // configureStore.store.dispatch(setCompany(response.data));
      // configureStore.store.dispatch(setLoginCompany(response.data));
      return response;
    })
  },
  //临时更换登录信息
  changeLoginInfo(userOID) {
    return Promise.all([
      this.getTmpUser(userOID),
      this.getTmpFp(userOID),
      this.getTmpCompany(userOID)
    ])
  },
  getTmpUser(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/users/proxy/${userOID}`, {}).then((response) => {
      return configureStore.store.dispatch(setUser(response.data));
    })
  },
  getTmpCompany(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/company/user`, { useroid: userOID }).then((response) => {
      return configureStore.store.dispatch(setCompany(response.data));
    })
  },
  getTmpFp(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/function/profiles/${userOID}`, {}).then((response) => {
      return configureStore.store.dispatch(setProfile(response.data));
    })
  },
  getFpByUserOID(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/function/profiles/${userOID}`, {}).then((response) => {
      return response;
    })
  },
  getCompanyByUserOID(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/company/user`, { useroid: userOID }).then((response) => {
      return response;
    })
  },
  //得到集团信息并存储在redux内
  getTenant(tenantId) {
    return httpFetch.get(config.baseUrl + '/api/tenant/getById?tenantId=' + tenantId, {}).then((response) => {
      //给老中控用，新中控替换完毕，这个可以去掉--start
      sessionStorage.setItem('HLY-tenantInfo', JSON.stringify(response.data));
      //给老中控用，新中控替换完毕，这个可以去掉--end
      configureStore.store.dispatch(setTenant(response.data));
      return response;
    })
  },

  //得到公司配置并存储在redux内
  getCompanyConfiguration() {
    return httpFetch.get(`${config.baseUrl}/api/company/configurations/user`).then(response => {
      configureStore.store.dispatch(setCompanyConfiguration(response.data));
      return response;
    })
  },

  //得到公司的functionProfile并存储在redux内
  getProfile() {
    console.log(app)
    return httpFetch.get(`${config.baseUrl}/api/function/profiles`).then((response) => {
      app.dispatch({ type: 'user', profile: response.data });
      return response;
    })
  },
  //得到租户functionProfile并存储在redux内
  getTenantProfile() {
    return httpFetch.get(`${config.baseUrl}/api/function/profiles?roleType=TENANT`).then((response) => {
      configureStore.store.dispatch(setTenantProfile(response.data));
      return response;
    })
  },

  //得到是否为老公司并存储在redux内
  getIsOldCompany() {
    return httpFetch.get(`${config.baseUrl}/api/tenant/check/exsit/company/his`).then((response) => {
      sessionStorage.setItem('HLY-isOldCompanyFlag', response.data);
      configureStore.store.dispatch(setIsOldCompany(response.data));
      return response;
    })
  },

  //根据租户查询账套信息
  getSetOfBooksByTenant() {
    return httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant`)
  },

  //调用腾讯地图搜索区域
  searchLocation(keyword) {
    return httpFetch.get(`${config.mapUrl}/ws/place/v1/suggestion/?region=&keyword=${keyword}&key=${config.mapKey}`)
  },

  //获取国家
  getCountries(params) {
    return httpFetch.get(`${config.accountingUrl}/location-service/api/localization/query/country`, params)
  },

  //根据国家code获取城市信息
  getCities(params) {
    return httpFetch.get(`${config.accountingUrl}/location-service/api/localization/query/all/address`, params)
  },

  //根据表单OID和用户OID获取费用类型
  getExpenseTypesByFormOID(param) {
    let formOID = param.formOID;
    delete param.formOID;
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${formOID}/selected/expense/types`, param)
  },

  //根据表单OID获取费用类型
  getExpenseTypesByFormOIDV2(param) {
    let formOID = param.formOID;
    delete param.formOID;
    return httpFetch.get(`${config.baseUrl}/api/v2/custom/forms/${formOID}/selected/expense/types`, param)
  },

  //根据表单OID获取费用类型的选择历史
  getExpenseTypesHistoryByFormOID(param) {
    return httpFetch.get(`${config.baseUrl}/api/application/budget/type/history`, param)
  },

  //根据公司OID获取费用类型
  getExpenseTypeByCompanyOID(companyOID) {
    return httpFetch.get(`${config.baseUrl}/api/expense/types?companyOID=${companyOID}`)
  },

  //获取费用大类型
  getExpenseTypeCategory(setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/expense/types/category`, { setOfBooksId: setOfBooksId })
  },

  // //获取费用大类型
  // getExpenseTypeCategory(setOfBooksId) {
  //   return httpFetch.get(`${config.expenseUrl}/api/expense/types/category/query`, { setOfBooksId: setOfBooksId })
  // },

  //根据账套获得费用类型
  getExpenseTypesBySetOfBooks(setOfBooksId, typeFlag = 0) {
    return httpFetch.get(`${config.expenseUrl}/api/expense/types/category/query`, {
      setOfBooksId,
      typeFlag
    })
  },

  //根据费用OID获取费用类型
  getExpenseTypeByOID(expenseTypeOID) {
    return httpFetch.get(`${config.baseUrl}/api/expense/types/${expenseTypeOID}`)
  },

  //根据费用id获取费用类型
  getExpenseTypeById(id) {
    return httpFetch.get(`${config.baseUrl}/api/expense/types/select/${id}`)
  },

  //根据语言和本位币获取货币列表
  getCurrencyList(currencyCode, language = 'chineseName') {
    return httpFetch.get(`${config.baseUrl}/api/currencyI18n?currencyCode=${currencyCode}&language=${language}`)
  },

  //根据语言获得货币列表
  getAllCurrencyByLanguage(language = 'chineseName', userOID = configureStore.store.getState().login.user.userOID) {
    return httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll?language=${language}&userOID=${userOID}`)
  },

  //根据本位币获取汇率
  getExchangeRate(baseCurrency, currency) {
    return httpFetch.get(`${config.baseUrl}/api/standardCurrency/selectStandardCurrency?base=${baseCurrency}&otherCurrency=${currency}`)
  },

  //根据用户OID获得用户
  getUserByOID(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/users/oid/${userOID}`)
  },

  //得到商务卡消费记录，分页
  getBusinessCardConsumptionList(bankCard, used, ownerOID, page, size, currMaxID) {
    let params = {
      ownerOID,
      page,
      size,
      currMaxID
    };
    return httpFetch.get(`${config.baseUrl}/api/bankcard/transactions/${bankCard}/${used}`, params)
  },

  //得到表单内容
  getFormDetail(formId) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${formId}`)
  },

  //获取用户信息
  getUserInfo(userOID) {
    return httpFetch.get(`${config.baseUrl}/api/users/v2/${userOID}`)
  },

  //得到成本中心
  getCostCenter(booksID) {
    return httpFetch.get(`${config.baseUrl}/api/cost/center/company`, { setOfBooksId: booksID })
  },

  //得到公司银行账户
  getCompanyBank(setOfBooksId, page, size) {
    return httpFetch.get(`${config.baseUrl}/api/CompanyBank/get/by/setOfBooksId?setOfBooksId=${setOfBooksId}&page=${page}&size=${size}`)
  },

  //获取汇率容差配置
  getRateDeviation(tenantId, setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/tenant/config/by/tenantId?tenantId=${tenantId}&setOfBooksId=${setOfBooksId}`)
  },

  //根据OID获得值列表
  getCustomEnumerationsByOID(enumOID) {
    return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/${enumOID}/items/v2`)
  },


  //根据部门OID得到部门
  getDepartmentByOID(departmentOID) {
    return httpFetch.get(`${config.baseUrl}/api/departments/${departmentOID}`)
  },

  //搜索人员
  searchUser(keyword, isCompany = true) {
    return httpFetch.get(`${config.baseUrl}/api/search/users/by/${keyword}?isCompany=${isCompany}`)
  },

  //打印单据
  printApplication(applicationOID) {
    return httpFetch.get(`${config.baseUrl}/api/loan/application/generate/pdf/${applicationOID}`)
  },

  //打印单据
  printExpense(applicationOID) {
    return httpFetch.get(`${config.baseUrl}/api/expense/reports/generate/pdf/${applicationOID}`)
  },


  //得到快速回复
  getQuickReply() {
    return httpFetch.get(`${config.baseUrl}/api/quick/reply`)
  },

  //直接删除附件
  attachmentDelete(invoiceOid, attachmentId) {
    return httpFetch.delete(`${config.baseUrl}/api/finance/delete/attachment?invoiceOid=${invoiceOid}&attachmentId=${attachmentId}`);
  },

  //获取银行卡账户
  getUserBanks(param) {
    return httpFetch.get(`${config.baseUrl}/api/contact/bank/account/enable`, param)
  },

  //获取系统值列表（模板级）
  getSystemValueList(params) {
    return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type`, params)
  },

  /**
   * 获取收款方列表
   */
  getReceivables(value, type = 1003) {
    return httpFetch.get(`${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName?pageFlag=false&name=${value}&empFlag=${type}`);
  }


}
