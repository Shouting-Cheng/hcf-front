import httpFetch from 'share/httpFetch'
import config from 'config'

export default {
    /**
     * company-account-setting 根据companyCode获取公司
     */
    getCompanyByCode(companyCode) {
        return httpFetch.get(`${config.baseUrl}/api/company/by/term?companyCode=${companyCode}`);
    },
    /**
     * company-account-setting getList
     */
    test(url) {
        return httpFetch.get(url);
    },
    getList(page, pageSize, temp, params) {
        let url = `${config.baseUrl}/api/CompanyBank/selectByCompanyId?page=${page}&size=${pageSize}${temp}`;
        for (let paramsName in params) {
            url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
        }
        return httpFetch.get(url);
    },
    /**
     * 根据companyBankId获取公司银行信息
     */
    getCompanyBankByCompanyBankId(companyBankId) {
        return httpFetch.get(`${config.baseUrl}/api/CompanyBank/selectById?companyBankId=${companyBankId}`);
    },
    /**
     * bank-account-detail getList
     */
    getBankAccountDetailList(url) {
        return httpFetch.get(`${url}`);
    },
    /**
     * 获取付款方式
     */
    getPayWayList(companyBankId,type,temp1,temp2) {
        let url = `${config.payUrl}/api/cash/payment/method/get/payment/by/bankId/and/code?companyBankId=${companyBankId}&type=${type}${temp1}${temp2}`
        return httpFetch.get(`${url}`);
    },
    /**
     * add-pay-way 编辑保存
     */
    savePayWay(temp) {
        let url = `${config.baseUrl}/api/comapnyBankPayment/insertOrUpdate`;
        return httpFetch.post(`${url}`, temp);
    },
    /**
     * add-authorization 编辑保存
     */
    saveAuthorization(toValue) {
        let url = `${config.baseUrl}/api/companyBankAuth/insertOrUpdate`;
        return httpFetch.post(`${url}`, toValue);
    },
    /**
     * 删除一个付款方式
     */
    deletePayWay(recordId) {
        return httpFetch.delete(`${config.baseUrl}/api/comapnyBankPayment/deleteById?id=${recordId}`);
    },
    /**
     * 公司详情编辑
     */
    updateHandle(temp) {
        let url = `${config.baseUrl}/api/CompanyBank/insertOrUpdate`;
        return httpFetch.post(`${url}`, temp);
    },
    /**
     * bank-account-detail 提交表单
     */
    submitHandle(companyOidFrom, companyOidTo, selectedRowKeys) {
        let url = `${config.baseUrl}/api/users/move?companyOidFrom=${companyOidFrom}&companyOidTo=${companyOidTo}&selectMode=default?`;
        selectedRowKeys.map((item) => {
            url = `${url}&userOids=${item}`
        });
        return httpFetch.put(url);
    }
}