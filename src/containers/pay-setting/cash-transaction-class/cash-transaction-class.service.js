/**
 * Created by zk on 2018/2/2.
 */
import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //获取现金事务分类
  getCashTransactionClass(params) {
    return httpFetch.get(`${config.payUrl}/api/cash/transaction/classes/query`, params);
  },

  //新增现金事务分类
  addCashTransactionClass(params) {
    return httpFetch.post(`${config.payUrl}/api/cash/transaction/classes`, params);
  },

  //更新现金事务分类
  updateCashTransactionClass(params) {
    return httpFetch.put(`${config.payUrl}/api/cash/transaction/classes`, params);
  },

  //获取现金事物明细
  getCashTransactionClassById(id) {
    return httpFetch.get(`${config.payUrl}/api/cash/transaction/classes/${id}`);
  },

  //获取现金事物关联的现金流量项
  getCashTransactionClassRefCashFlowItem(params) {
    return httpFetch.get(`${config.payUrl}/api/cash/default/flowitems/query`, params);
  },

  //批量新增现金事物关联的现金流量项
  batchAddCashTransactionClassRefCashFlowItem(params) {
    return httpFetch.post(`${config.payUrl}/api/cash/default/flowitems/batch`, params);
  },

  //更新现金事务分类现金流量项
  updateCashTransactionClassRefCashFlowItem(params) {
    return httpFetch.put(`${config.payUrl}/api/cash/default/flowitems`, params);
  },
};
