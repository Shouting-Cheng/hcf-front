import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 获取可关联申请类型数据
     */
    getRequisitionType(params) {
        let url = `${config.prePaymentUrl}/api/cash/pay/requisition/type/assign/requisition/types/getCustomFormByRange`;
        return httpFetch.post(url, params);
    },
    /**
     * 获取预付款单类型数据
     */
    getPrePaymentType(page, pageSize, params) {
        let url = `${config.prePaymentUrl}/api/cash/pay/requisition/types/query?&page=${page}&size=${pageSize}`;
        for (let paramsName in params) {
            url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
        }
        return httpFetch.get(url);
    },
    /**
     * 根据id获取预付款单类型数据
     */
    getPrePaymentTypeById(typeId) {
        return httpFetch.get(`${config.prePaymentUrl}/api/cash/pay/requisition/types/${typeId}`);
    },
    /**
     * 获取关联表单类型数据
     */
    getRequisitionList(setOfBooksId) {
        return httpFetch.get(`${config.baseUrl}/api/custom/forms/setOfBooks/my/available/all?formTypeId=801003&setOfBooksId=${setOfBooksId}`);
    },
    /**
     * 新增或修改预付款单类型
     */
    updatePrePaymentType(nowTypeId, params) {
        console.log(nowTypeId);
        httpFetch[nowTypeId ? "put" : "post"](`${config.prePaymentUrl}/api/cash/pay/requisition/types`, params)
    },
    /**
     * 获取可用现金事物数据
     */
    getCashTransaction(params) {
        let url = `${config.prePaymentUrl}/api/cash/pay/requisition/type/assign/transaction/classes/queryByRange`;
        return httpFetch.post(url, params);
    },
    /**
     * 获取已分配公司
     */
    getDistributiveCompany(typeId) {
        return httpFetch.get(`${config.prePaymentUrl}/api/cash/pay/requisition/type/assign/companies/query?sobPayReqTypeId=${typeId}`);
    },
    /**
     * 启用或不启用分配公司
     */
    updateAssignCompany(params) {
        return httpFetch.put(`${config.prePaymentUrl}/api/cash/pay/requisition/type/assign/companies/batch`, params);
    },
    /**
     * 批量分配公司
     */
    batchDistributeCompany(paramsValue){
        return httpFetch.post(`${config.prePaymentUrl}/api/cash/pay/requisition/type/assign/companies/batch`, paramsValue);
    }
}
