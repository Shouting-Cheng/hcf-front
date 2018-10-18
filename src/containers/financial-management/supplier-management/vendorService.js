import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //查询供应商类型
  getVendorType(params) {
    return httpFetch.get(`${config.vendorUrl}/api/ven/type/query`, params);
  },

  //条件查询供应商（分页）
  getVenInfoByOptions(params) {
    return httpFetch.get(`${config.vendorUrl}/api/ven/info`, params);
  },

  //新增供应商信息
  addVendorInfo(params) {
    return httpFetch.post(`${config.vendorUrl}/api/ven/info/insert`, params);
  },

  //更新供应商信息
  updateVendorInfo(params) {
    return httpFetch.put(`${config.vendorUrl}/api/ven/info/update`, params);
  },

  //查询供应商下的银行信息
  getBanks(params) {
    return httpFetch.get(`${config.vendorUrl}/api/ven/bank`, params);
  },

  //新增银行卡信息
  addBankCardInfo(params) {
    return httpFetch.post(`${config.vendorUrl}/api/ven/bank/insert`, params);
  },

  //修改银行卡信息
  updateBankCardInfo(params) {
    return httpFetch.put(`${config.vendorUrl}/api/ven/bank/update`, params);
  },

  //获取供应商下公司
  getCompanies(params) {
    return httpFetch.get(
      `${config.vendorUrl}/api/ven/info/assign/company/query/company/dto`,
      params
    );
  },

  //供应商分配公司
  batchDeliveryCompany(params) {
    return httpFetch.post(`${config.vendorUrl}/api/ven/info/assign/company/batch`, params);
  },

  //根据id查供应商信息
  getVendorInfoById(id) {
    return httpFetch.get(`${config.vendorUrl}/api/ven/info/${id}`);
  },

  //修改供应商分配公司的状态
  changeVendorCompanyInfo(params) {
    return httpFetch.put(`${config.vendorUrl}/api/ven/info/assign/company`, params);
  },
};
