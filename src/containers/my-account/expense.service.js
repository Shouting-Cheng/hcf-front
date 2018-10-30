import httpFetch from 'share/httpFetch'
import config from 'config'

export default {

  /**
   * 得到税率
   */
  getRates(){
    return httpFetch.get(`${config.baseUrl}/api/custom/enumeration/tax/rate`);
  },

  /**
   * 保存 费用
   * @param expense
   * @return {AxiosPromise}
   */
  saveExpense(expense){
    //报销单费用
    // v3 统一费用保存接口
    return httpFetch.post(`${config.baseUrl}/invoice/api/v3/invoices`, expense);
  },

  deleteExpense(invoiceOID){
    return httpFetch.delete(`${config.baseUrl}/api/invoice/batch?invoiceOIDs=${invoiceOID}`)
  },

  getTitleListByEntity(userOID){
    return httpFetch.get(`${config.baseUrl}/api/receipt/header/enable/check`, {
      userOID
    })
  },

  /**
   * 得到发票类型列表
   */
  getInvoiceTypeList(){
    return httpFetch.get(`${config.baseUrl}/api/custom/enumeration/receipt/type`)
  },

  /**
   * 得到可查验发票类型列表
   */
  getTestInvoiceTypeList(){
    return httpFetch.get(`${config.baseUrl}/api/invoice/invoiceType`)
  },

  /**
   * 根据发票类型得到税率
   * @param type
   */
  getRateByInvoiceType(type){
    return httpFetch.get(`${config.baseUrl}/api/custom/enumeration/tax/rate?receiptValue=${type}`)
  },

  /**
   * 发票查验
   * @param code 组装的代码
   * @return {AxiosPromise | *}
   */
  testInvoice(code){
    return httpFetch.post(`${config.receiptUrl}/api/receipt/verify`, {code})
  },

  getBusinessCardStatus(){
    return httpFetch.get(`${config.baseUrl}/api/bankcard/user/status/CMBC`)
  },

  getTitleList(companyOID){
    return httpFetch.get(`${config.baseUrl}/api/invoice/header/list`, { companyOID })
  },

  getExpenseList(page, pageSize){
    return httpFetch.get(`${config.baseUrl}/api/invoices/init/all/by?page=${page}&size=${pageSize}`)
  },
  // 打印支付宝发票
  printAlipayInvoice(invoice) {
    let params = {
      userId: invoice.openid,
      invoiceCode: invoice.billingCode,
      invoiceNo: invoice.billingNo
    };
    return httpFetch.get(`${config.baseUrl}/api/invoice/alipay/pdf`, params, {}, {responseType: 'arraybuffer'});
  },
  //打印微信发票
  printInvoice(invoice, companyOID){
    let params = {
      timestamp: parseInt((new Date()).getTime() / 1000),
      type: invoice.cardsignType,
      companyOID
    };
    return httpFetch.post(`${config.baseUrl}/api/getCardSign`, params).then(res => {
      if(res.data && res.data.accessToken){
        let url;
        if (!invoice.cardsignType || invoice.cardsignType === 'JSCARDSIGN') {
          url = 'https://qyapi.weixin.qq.com/cgi-bin/card/invoice/reimburse/getinvoiceinfo?access_token=';
        } else {
          url = 'https://api.weixin.qq.com/card/invoice/reimburse/getinvoiceinfo?access_token=';
        }
        let data = {
          url: url + res.data.accessToken,
          params: JSON.stringify({
            card_id: invoice.cardId,
            encrypt_code: invoice.encryptCode
          })
        };
        httpFetch.post(`${config.baseUrl}/api/proxyPost`, data).then(result => {
          if (result.data && result.data.user_info && result.data.user_info.pdf_url) {
            window.open(result.data.user_info.pdf_url, '_blank');
          }
        });
      }
    })
  },

  //修改核定金额
  editAuditAmount(params){
    return httpFetch.post(`${config.baseUrl}/api/v2/invoices/review/amount`, params)
  },

  //财务修改录入发票内容
  editAuditInvoice(params){
    return httpFetch.post(`${config.baseUrl}/api/update/invoice/tax/rate`, params)
  },

  //财务补录发票信息
  financialAuditInvoice(params){
    return httpFetch.post(`${config.baseUrl}/receipt/api/receipt/supplement`, params)
  },


  //费用模板下载
  invoiceTemplateDown(templateId){
    return httpFetch.get(`${config.baseUrl}/api/expense/template/`+templateId, {}, {}, {responseType: 'arraybuffer'})
  },

  //费用模板上传
  invoiceTemplateUpload(formData,expenseReportOID,expenseTypeOID){
    return httpFetch.post(`${config.baseUrl}/api/expense/import`, formData, {"Content-type": 'multipart/form-data'})
  },

  //检查发票重复
  checkRepeatInvoice(receiptCode, receiptNo){
    return httpFetch.get(`${config.baseUrl}/api/receipt/duplicate/check`, {
      receiptCode,
      receiptNo
    })
  },

  //修改商务卡备注
  updateBusinessCardRemark(cardId, remark){
    return httpFetch.put(`${config.baseUrl}/api/bankcard/transaction/add/remark/${cardId}?remark=${remark}`)
  },

  //得到阶梯或者单价模式
  getMileageMode(){
    return httpFetch.get(`${config.baseUrl}/api/pcfp/mode`)
  },
  //获取发票控件灵活配置信息
  getReceiptDisplay(receiptCheckEnabled, invoiceType, tenantId, setOfBookId, companyID) {
    let params = [{"factorCode": "TENANT", "factorValue": tenantId}, {
      "factorCode": "SET_OF_BOOKS",
      "factorValue": setOfBookId
    }, {"factorCode": "COMPANY", "factorValue": companyID}, {
      "factorCode": "RECEIPT_CHECK_ENABLED",
      "factorValue": receiptCheckEnabled === true ? 'Y':'N'
    }, {"factorCode": "RECEIPT_TYPE", "factorValue": invoiceType}]
    return httpFetch.post(`${config.baseUrl}/config/api/config/hit/RECEIPT_DISPLAY_CONTROL?tenantId=${tenantId}`, params)
  }

}
