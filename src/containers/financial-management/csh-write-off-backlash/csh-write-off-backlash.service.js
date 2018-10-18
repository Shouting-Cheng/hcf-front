import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 获取待反冲核销记录
     * @param {*} params 
     */
    getWriteOffWaitReserveDetail(params) {
        return httpFetch.get(`${config.payUrl}/api/payment/cash/write/off/wait/reserve/detail`, params);
    },
    /**
     * 发起核销反冲
     */
    cshWriteOffDoReserved(id, reverseAmount, remark, attachmentOid) {
        return httpFetch.post(`${config.payUrl}/api/payment/cash/write/off/do/reserved?id=${id}&reverseAmount=${reverseAmount}&remark=${remark}&attachmentOid=${attachmentOid}`);
    },
    /**
     * 获取我发起的核销反冲记录
     */
    getWriteOffUserReservedDetail(params) {
        return httpFetch.get(`${config.payUrl}/api/payment/cash/write/off/user/reserved/detail`, params);
    },
    /**
     * 核销反冲作废
     */
    cshWriteOffDoReservedCancel(id) {
        return httpFetch.delete(`${config.payUrl}/api/payment/cash/write/off/reserved/cancel?id=${id}`);
    },
    /**
     * 重新发起
     */
    cshWriteOffDoReservedAgain(id, reverseAmount, remark, attachmentOid) {
        return httpFetch.post(`${config.payUrl}/api/payment/cash/write/off/do/reserved/again?id=${id}&reverseAmount=${reverseAmount}&remark=${remark}&attachmentOid=${attachmentOid}`);
    }
}