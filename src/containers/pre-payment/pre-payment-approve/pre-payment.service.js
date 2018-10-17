import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

    /**
     * 获取审批预付款列表
     * @param {*} params
     */
    getPrePaymentList(params) {

        let url = `${config.baseUrl}/api/approvals/prepayment/filters?`;
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
     * 获取预付款头（工作流）
     * */
    getPrePaymentHeadById(OId){
      return httpFetch.get(`${config.baseUrl}/api/get/prepayment/by/oid?oid=${OId}`)
    },
    /**
     * 通过id获取预付款头信息
     * @param {*} id
     */
    getHeadById(id) {
      let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getHeadById?id=${id}`;
      return httpFetch.get(url);
    },

}
