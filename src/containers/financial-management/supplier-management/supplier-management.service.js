import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //条件查询供应商
  getVenInfoByOptions(params) {
    return httpFetch.post(`${config.baseUrl}/vendor-info-service/api/ven/info`, params);
  },

  //新增供应商
  addNewSupplier(params) {
    return httpFetch.post(`${config.baseUrl}/vendor-info-service/api/ven/info/insert`, params);
  },

  //供应商信息详情
  getSupplierDetail(id) {
    return httpFetch.get(`${config.baseUrl}/vendor-info-service/api/ven/info/${id}`);
  },

  //供应商银行信息
  getSupplierBankInfo(params) {
    return httpFetch.post(`${config.baseUrl}/vendor-info-service/api/ven/bank/`, params);
  },

  //更新供应商信息详情
  updateSupplierInfo(params) {
    return httpFetch.post(`${config.baseUrl}/vendor-info-service/api/ven/info/update`, params);
  },

  //供应商银行信息增加更新
  updateSupplierBank(params) {
    return httpFetch.post(`${config.baseUrl}/vendor-info-service/api/ven/bank/update`, params);
  },

  //停用供应商银行账户
  disableSupplierBank(params) {
    return httpFetch.post(`${config.baseUrl}/vendor-info-service/api/change/bank/type`, params);
  },
};
