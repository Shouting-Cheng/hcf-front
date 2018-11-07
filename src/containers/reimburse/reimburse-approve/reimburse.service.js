import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

    /**
     * 获取审批预付款列表
     * @param {*} params
     */
    getReimburseList(params) {

        let url = `${config.baseUrl}/api/approvals/public/exp/report/filters/api/approvals/public/exp/report/filters?`;
        //let url = `http://192.168.1.71:9083/api/approvals/prepayment/filters?`;
        for (let key in params) {
            if(params[key] || params[key] == 0) {
                url += `&${key}=${params[key]}`;
            }
        }

        return httpFetch.get(url);
    },

    /**
     * 驳回（走工作流）
     * @param {*} params
     */
    approveReject(params) {

        let url = `${config.baseUrl}/api/approvals/reject`;

        return httpFetch.post(url, params);
    },

    /**
     * 通过（走工作流）
     * @param {*} params
     */
    approvePass(params) {
        let url = `${config.baseUrl}/api/approvals/pass`;

        return httpFetch.post(url, params);
    },
    /**
     * 推送到支付平台
     * @param {*} id
     */
    push(id) {
        let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/push/by/head/id?headId=${id}`;

        return httpFetch.post(url);
    },

    /**
   * 获取报账单详情
   * @param {*} id 
   */
    getReimburseDetailById(id) {
        return httpFetch.get(`${config.baseUrl}/api/expReportHeader/${id}`);
    },

}
