/**
 * Created by zk on 2018/2/2.
 */
import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //获取现金流量项
  getCashFlowItem(params) {
    return httpFetch.get(`${config.payUrl}/api/cash/flow/items/query`, params);
  },

  //新增现金流量项
  addCashFlowItem(params) {
    return httpFetch.post(`${config.payUrl}/api/cash/flow/items`, params);
  },

  //更新现金流量项
  updateCashFlowItem(params) {
    return httpFetch.put(`${config.payUrl}/api/cash/flow/items`, params);
  },
};
