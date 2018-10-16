import config from 'config'
import httpFetch from 'share/httpFetch'
import errorMessage from 'share/errorMessage'

export default {

  //获取表单配置
  getCustomForm(formOID){
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${formOID}`)
  },

  //获取表单默认值
  getFormValue(userOID, formOID) {
    return httpFetch.get(`${config.baseUrl}/api/custom/form/user/default/values?userOID=${userOID}&formOID=${formOID}`)
  },

  /**
   * 获取汇率
   * @param currency 要算汇率的币种
   * @param currencyDate (YYYY-MM-DD HH:mm:ss)
   * @param userOID 后台判断优先级2 如果有传userOID，则算的汇率是基于userOID所在公司的本位币的汇率 非必填字段
   * @param baseCode 后台判断优先级1 如果有传baseCode，则算的汇率是基于baseCode的汇率 非必填字段
   */
  getCurrencyRate(currency, currencyDate, userOID, baseCode) {
    let params = {
      currency,
      currencyDate,
      userOID,
      baseCode
    };
    return httpFetch.get(`${config.baseUrl}/api/company/standard/currency/get`, params)
  },

  //获取单据列表，formType：101（申请单）、102（报销单）、103（全部）
  getDocumentType(formType) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=${formType}`)
  },

  //获取申请单列表
  getRequestList(page, size, searchParams) {
    let url = `${config.baseUrl}/api/applications/v3/search?page=${page}&size=${size}`;
    let params = {
      withBudget: false,
      withCustomForm: false,
      withCustomFormProperty: false,
      withCustomFormValue: false,
      withParticipant: true,
      withUserInfo: true
    };
    for(let param in params) {
      url += `&${param}=${params[param]}`
    }
    for(let searchName in searchParams) {
      if(searchName !== 'status') {
        url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : ''
      } else {
        let temp = searchParams[searchName].match(/\d{4}/g);
        if(temp.length === 2) {
          url += `&status=${temp[0]}&rejectTypes=${temp[1]}`
        } else {
          temp.map(value => { url += `&status=${value}` })
        }
      }
    }
    return httpFetch.get(url)
  },

  //获取申请单详情接口 (借款、差旅、费用、订票、京东申请单详情全部合并成了该接口)
  getRequestDetail(OID) {
    return httpFetch.get(`${config.baseUrl}/api/application/${OID}`)
  },

  //根据申请单OID及订票任务OID获取订票申请单详情(用于退改签审批页面)
  getBookerTaskRequestDetail(OID, bookTaskOID) {
    return httpFetch.get(`${config.baseUrl}/api/book/task/my/get/${OID}?travelOperationRecordOID=${bookTaskOID}`)
  },

  //申请单撤回
  recallRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/approvals/withdraw`, params)
  },

  //根据申请单OID获取借款单的还款进度
  getLoanRepayment(page, size, OID) {
    return httpFetch.get(`${config.baseUrl}/api/repayment/list?page=${page}&size=${size}&loanApplicationOid=${OID}`)
  },
  // 新增供应商
  addData(data) {
    return httpFetch.post(`${config.vendorUrl}/api/ven/infobank/insert`,data)
  },
  // 新增银行卡
  addNewAccount (data) {
    return httpFetch.post(`${config.vendorUrl}/api/ven/bank/insert`,data)
  },
  //根据表单OID获取申请单类型
  getFormType(OID) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/${OID}`)
  },

  //获取收款人信息
  getVenMasterInfo(params) {
    return httpFetch.get(`${config.vendorUrl}/api/ven/info/search`, params)
  },

  //根据收款人id获取收款账号
  getAccountInfo(id) {
    return httpFetch.get(config.vendorUrl + '/api/ven/infoBank?vendorInfoId='+id);
  },

  //保存借款申请单
  saveLoanRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/loan/application/draft`, params)
  },

  //保存费用申请单
  saveExpenseRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/expense/applications/draft`, params)
  },

  //保存订票申请单
  saveBookerRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/booker/applications/draft`, params)
  },

  //保存京东申请单
  saveJDRequest(params) {
    return new Promise((resolve, reject) => {
      httpFetch.post(`${config.baseUrl}/api/jingdong/order/applications/draft`, params).then(res => {
        resolve(res)
      }).catch(err => {
        errorMessage(err.response);
        reject(err)
      })
    })
  },

  //删除申请单
  deleteRequest(applicationOID) {
    return httpFetch.delete(`${config.baseUrl}/api/applications/all/${applicationOID}`)
  },

  //提交借款申请单
  submitLoanRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/loan/application/submit`, params)
  },

  //提交费用申请单
  submitExpenseRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/expense/applications/submit`, params)
  },

  //提交订票申请单
  submitBookerRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/booker/applications/submit`, params)
  },

  //提交京东申请单
  submitJDRequest(params) {
    return new Promise((resolve, reject) => {
      httpFetch.post(`${config.baseUrl}/api/jingdong/order/applications/custom/form/submit`, params).then(res => {
        resolve(res)
      }).catch(err => {
        errorMessage(err.response);
        reject(err)
      })
    })
  },

  //获取地点
  getDestinationByKeywork(keyword) {
    return httpFetch.get(`${config.baseUrl}/api/city/search/${keyword}?page=0&size=10&useType=FLIGHT`)
  },

  /**
   * 根据申请单OID获取行程信息
   * @param applicationOID 申请单OID
   * itineraryShowDetails 行程备注中展示的行程样式是否需要返回统一的格式 REMARK中itineraryDetails表示标准行程格式，itineraryShowDetails
   * withRequestDetail 是否查询差补行程的详细信息（每条差补行程的费用类型、参与人姓名、币种和金额）
   * withItemDetail 是否查询差补行程下的每个人的差补详情
   */
  getItineraryByApplicationOID(applicationOID) {
    let params = {
      applicationOID,
      // itineraryShowDetails: true,
      withRequestDetail: true,
      withItemDetail: true
    };
    return httpFetch.get(`${config.baseUrl}/api/travel/applications/itinerarys`, params)
  },

  /**
   * 根据申请单OID和最新版申请单OID获取行程信息
   * @param applicationOID 申请单OID
   * @param latestApplicationOID 最新版申请单OID
   * itineraryShowDetails 行程备注中展示的行程样式是否需要返回统一的格式
   * withRequestDetail 是否查询差补行程的详细信息（每条差补行程的费用类型、参与人姓名、币种和金额）
   * withItemDetail 是否查询差补行程下的每个人的差补详情
   */
  getLastItineraryByApplicationOID(applicationOID, latestApplicationOID) {
    let params = {
      applicationOID: applicationOID,
      newApplicationOID: latestApplicationOID,
      // itineraryShowDetails: true,
      withRequestDetail: true,
      withItemDetail: true
    };
    return httpFetch.get(`${config.baseUrl}/api/v2/travel/applications/itinerarys`, params)
  },

  //机票反馈信息是否合适
  handleBoardingConfirmation(applicationOID, comment, flag, travelOrderOIDs) {
    let url = `${config.baseUrl}/api/travel/operation/confirm?applicationOID=${applicationOID}&flag=${flag}&travelOrderOIDs=${travelOrderOIDs}`;
    comment && (url += `&comment=${comment}`);
    return httpFetch.get(url)
  },

  //判断审批通过的差旅申请单能否进行更改操作
  judgeEnableChange(applicationOID) {
    return httpFetch.get(`${config.baseUrl}/api/travel/application/change/enable?lastApplicationOID=${applicationOID}`)
  },

  //差旅申请单更改
  handleApplicationUpload(applicationOID, params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/applications/draft/${applicationOID}`, params)
  },

  //订票申请单退票
  submitRefundApplication(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/orders/refund/apply`, params)
  },

  //订票申请单改签
  submitEndorseApplication(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/orders/endorse/apply`, params)
  },

  //打印差旅申请单
  printTravelApplication(applicationOID) {
    return new Promise((resolve, reject) => {
      httpFetch.get(`${config.baseUrl}/api/travel/application/generate/pdf/${applicationOID}`).then(res => {
        resolve(res)
      }).catch(err => {
        errorMessage(err.response);
        reject(err)
      })
    })
  },

  //打印借款申请单
  printLoanApplication(applicationOID) {
    return new Promise((resolve, reject) => {
      httpFetch.get(`${config.baseUrl}/api/loan/application/generate/pdf/${applicationOID}`).then(res => {
        resolve(res)
      }).catch(err => {
        errorMessage(err.response);
        reject(err)
      })
    })
  },

  //打印费用申请单
  printExpenseApplication(applicationOID) {
    return new Promise((resolve, reject) => {
      httpFetch.get(`${config.baseUrl}/api/expense/application/generate/pdf/${applicationOID}`).then(res => {
        resolve(res)
      }).catch(err => {
        errorMessage(err.response);
        reject(err)
      })
    })
  },

  //申请单停用
  expireApplication(applicationOID, participantOID) {
    return new Promise((resolve, reject) => {
      httpFetch.post(`${config.baseUrl}/api/applications/close?applicationOID=${applicationOID}&participantOID=${participantOID}`).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //申请单重新启用
  restartApplication(applicationOID, participantOID, closeDay) {
    return new Promise((resolve, reject) => {
      httpFetch.post(`${config.baseUrl}/api/applications/restart?applicationOID=${applicationOID}&participantOID=${participantOID}&closeDay=${closeDay}`).then(res => {
        resolve(res)
      }).catch(e => {
        errorMessage(e.response);
        reject(e)
      })
    })
  },

  //获取借款单的默认关联申请单
  getLoanDefaultRelativeApplication(formOID) {
    let params = {
      "withTravelApplication": true,
      "withExpenseApplication": true,
      "withBookingApplication": false,
      "withLoanApplication": false,
      "withUserInfo": true,
      "withParticipant": true,
      "withCustomFormValue": true
    };
    return httpFetch.post(`${config.baseUrl}/api/loan/reference/my/application/default?formOID=${formOID}`, params)
  },

  //免打印查询
  searchPrintFree(tenantId,params) {
    return httpFetch.post(`${config.baseUrl}/config/api/config/hit/EXPENSE_REPORT_PRINT_FREE?tenantId=${tenantId}`, params);
  },

  //获取收款方
  getPayee(page, size, keyword) {
    return httpFetch.get(`${config.baseUrl}/api/search/users/entire?page=${page}&size=${size}&keyword=${keyword}`)
  },

  //获取无代理关系的单据列表，formType：101（申请单）、102（报销单）、103（全部）
  //传userOID则获取该用户下可代理的单据
  getMyDocumentType(formType, userOID) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/my/available`, {
      formType: formType,
      userOID: userOID
    });
  },

  //查询是否有代理的表单，formType：101（申请单）、102（报销单）、103（全部）
  isShowProxy(formType) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/my/proxy/customForm`, {
      formType: formType
    });
  },

  //查询我的制单被代理人
  getProxyApplicantList(formType) {
    return httpFetch.get(`${config.baseUrl}/api/bill/proxy/query/my/principals?formType=${formType}`);
  },
}
