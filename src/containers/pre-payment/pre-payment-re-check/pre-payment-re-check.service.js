import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 获取复核预付款列表
     * @param {*} params 
     */
    getPrePaymentList(params) {

        let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/query?ifWorkflow=false`;

        for (let key in params) {
            if (params[key] || params[key] == 0) {
                url += `&${key}=${params[key]}`;
            }
        }

        return httpFetch.get(url);
    },

    /**
     * 驳回（不走工作流）
     * @param {*} id 
     */
    approveReject(id, remark, userId) {
        let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/updateStatus?id=${id}&status=1005&&userId=${userId}`;

        return httpFetch.post(url, { approvalRemark: remark });
    },

    /**
     * 通过（不走工作流）
     * @param {*} id 
     */
    approvePass(id, remark, userId) {
        let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/updateStatus?id=${id}&status=1004&userId=${userId}`;

        return httpFetch.post(url, { approvalRemark: remark });
    },

    /**
     * 推送到支付平台
     * @param {*} id 
     */
    push(id) {
        let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/push/by/head/id?headId=${id}`;

        return httpFetch.post(url);
    }


}
