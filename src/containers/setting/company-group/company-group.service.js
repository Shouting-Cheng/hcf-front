import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //条件查询公司组(分页)
  getCompanyGroupByOptions(params) {
    return httpFetch.get(`${config.baseUrl}/api/company/group/query/dto`, params);
  },

  //根据id删除公司组
  deleteCompanyGroupById(params) {
    return httpFetch.delete(`${config.baseUrl}/api/company/group/${params}`);
  },

  //新建公司组
  addCompanyGroup(params) {
    return httpFetch.post(`${config.baseUrl}/api/company/group`, params);
  },

  //根据id查询公司组
  getCompanyGroupById(params) {
    return httpFetch.get(`${config.baseUrl}/api/company/group/trans/${params}`);
  },

  //查询公司组下公司
  getCompanies(params) {
    return httpFetch.get(`${config.baseUrl}/api/company/group/assign/query/dto`, params);
  },

  //删除公司
  deleteCompany(params) {
    return httpFetch.delete(`${config.baseUrl}/api/company/group/assign/batch`, params);
  },

  //修改公司组
  updateCompanyGroup(params) {
    return httpFetch.put(`${config.baseUrl}/api/company/group`, params);
  },

  //添加公司
  addCompanies(params) {
    return httpFetch.post(`${config.baseUrl}/api/company/group/assign/batch`, params);
  },
};
