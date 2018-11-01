import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 待复核反冲核销记录
     */
    getWriteOffRecheckReserveDetail(params) {
        return httpFetch.get(`${config.payUrl}/api/payment/cash/write/off/rechecking/reserve/detail`, params);
    },
    /**
     * 获取每条记录的凭证
     */
    getCredence(tenantId, transactionHeaderId) {
        return httpFetch.post(`${config.accountingUrl}/api/accounting/gl/journal/lines/query/by/line?tenantId=${tenantId}&sourceTransactionType=CSH_WRITE_OFF&transactionHeaderId=${transactionHeaderId}`, []);
    },
    /**
     * 核销反冲创建凭证
     * @param {*单据类型} documentType 
     * @param {*单据头ID} documentHeaderId 
     * @param {*单据行ID(若不传值则与单据相关核销记录全部生成凭证)} documentLineIds 
     * @param {*租户ID} tenantId 
     * @param {*操作人ID} operatorId 
     * @param {*账务日期} accountDate 
     * @param {*账务期间 可选} accountPeriod 
     */
    createCredence(documentType, documentHeaderId, documentLineIds, tenantId, operatorId, accountDate) {
        let params = {
            documentType: documentType,
            documentHeaderId: documentHeaderId,
            documentLineIds: documentLineIds,
            tenantId: tenantId,
            operatorId: operatorId,
            accountDate: accountDate
        };
        return httpFetch.post(`${config.payUrl}/api/payment/cash/write/off/reverse/init/journal`, params);
    },
    /**
     * 是否核算
     * 根据当前登陆信息直接判断
     */
    judgeAccounting() {
        return httpFetch.get(`${config.payUrl}/api/payment/cash/write/off/judge/post/accounting/service`);
    },
    /**
     * 通过驳回
     * operationType:
     * 1  通过 -1  驳回
     */
    reverseUpdateStatus(id, operationType, approvalOpinions) {
        return httpFetch.post(`${config.payUrl}/api/payment/cash/write/off/operation/reserved?id=${id}&operationType=${operationType}&approvalOpinions=${approvalOpinions}`);
    },
    /**
     * 获取科目段
     */
    getSegments(setOfBooksId) {
        return httpFetch.get(`${config.accountingUrl}/api/general/ledger/segments/query/by/setOfBooks?setOfBooksId=${setOfBooksId}`);
    },
    /**
     * 已复核反冲记录
     */
    getWriteOffRecheckedReserveDetail(params) {
        return httpFetch.get(`${config.payUrl}/api/payment/cash/write/off/rechecked/reserve/detail`, params);
    }
}