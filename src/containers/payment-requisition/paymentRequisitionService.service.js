import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 获取付款申请单列表
   * @param page
   * @param size
   * @param searchParams
   */
  queryList(page, size, searchParams) {
    let url = `${config.payUrl}/api/acp/requisition/header/query?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },
  /**
   * 根据付款申请单头Id查询
   * @param id
   */
  quertHeaderById(id) {
    let url = `${config.payUrl}/api/acp/requisition/header/query/${id}`;
    return httpFetch.get(url);
  },

  /**
   * 根据付款申请单头Id查询
   * @param id
   */
  queryDetailById(id) {
    let url = `${config.payUrl}/api/acp/requisition/header/query/detail/${id}`;
    return httpFetch.get(url);
  },
  /**
   * @Author: bin.xie
   * @Description: 新建付款申请单头
   * @Date: Created in 2018/1/26 16:28
   * @Modified by
   */
  createHeader(param) {
    let url = `${config.payUrl}/api/acp/requisition/header`;
    return httpFetch.post(url, param);
  },
  /**
   * @Author: bin.xie
   * @Description: 保存付款申请单头行信息
   * @Date: Created in 2018/1/26 16:29
   * @Modified by
   */
  saveFunc(param) {
    let url = `${config.payUrl}/api/acp/requisition/header/save`;
    return httpFetch.post(url, param);
  },
  /**
   * @Author: bin.xie
   * @Description: 根据付款申请单头Id删除改付款申请单
   * @Date: Created in 2018/3/22 17:55
   * @Modified by
   */
  deleteFunc(id) {
    let url = `${config.payUrl}/api/acp/requisition/header/${id}`;
    return httpFetch.delete(url);
  },
  /**
   * 根据付款申请单行ID单个删除数据
   * @param id
   */
  deleteLineFunc(id) {
    let url = `${config.payUrl}/api/acp/requisition/header/line/${id}`;
    return httpFetch.delete(url);
  },
  /**
   * 根据付款申请单头ID批量删除付款申请单数据
   * @param ids(为付款申请单头Id集合)
   */
  deleteHeadByIdsFunc(ids) {
    let url = `${config.payUrl}/api/acp/requisition/header/deleteByIds`;
    return httpFetch.post(url, ids);
  },
  /**
   * @Author: bin.xie
   * @Description: 根据行ID查询行信息
   * @Date: Created in 2018/3/27 13:46
   * @Modified by
   */
  queryLineByLineId(id) {
    let url = `${config.payUrl}/api/acp/requisition/line/query/${id}`;
    return httpFetch.get(url);
  },
  /**
   * @Author: bin.xie
   * @Description: 提交付款申请单
   * @Date: Created in 2018/3/27 15:29
   * @Modified by
   */
  submitHeader(param) {
 //   let url = `${config.baseUrl}/api/acpRequisition/submit`;
    let url = `${config.payUrl}/api/acp/requisition/header/acpRequisition/submit`;
    return httpFetch.post(url, param);
  },

  /**
   * @Author: bin.xie
   * @Description: 获取审批记录
   * @Date: Created in 2018/4/23 15:44
   * @Modified by
   */
  getLogs(params) {
    let url = `${
      config.baseUrl
    }/api/acpRequisition/reports/history?entityType=801005&entityOID=${params}`;
    return httpFetch.get(url);
  },

  /**
   * 获取审批付款申请单列表
   * @param {*} params
   */
  getPaymentList(params) {
    let url = `${config.baseUrl}/api/approvals/acp/payment/filters?`;
    //let url = `http://192.168.1.71:9083/api/approvals/prepayment/filters?`;

    for (let key in params) {
      if (params[key] || params[key] == 0) {
        url += `&${key}=${params[key]}`;
      }
    }

    return httpFetch.get(url);
  },
  /**
   * @Author: bin.xie
   * @Description: 驳回
   * @Date: Created in 2018/4/23 16:41
   * @Modified by
   */
  rejectFunction(params) {
    let url = `${config.baseUrl}/api/approvals/reject`;
    return httpFetch.post(url, params);
  },
  /**
   * @Author: bin.xie
   * @Description: 通过
   * @Date: Created in 2018/4/23 16:41
   * @Modified by
   */
  passFunction(params) {
    let url = `${config.baseUrl}/api/approvals/pass`;
    return httpFetch.post(url, params);
  },
  /**
   * @Author: bin.xie
   * @Description: 撤回
   * @Date: Created in 2018/4/23 17:10
   * @Modified by
   */
  returnFunction(params) {
    let url = `${config.baseUrl}/api/approvals/withdraw`;
    return httpFetch.post(url, params);
  },
};
