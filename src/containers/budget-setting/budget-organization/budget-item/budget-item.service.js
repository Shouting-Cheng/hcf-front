import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //查询预算项目（不分页）
  getItems(params) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/items/find/all`, params);
  },

  //条件查询预算项目（分页）
  getItemsByOption(params) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/items/query`, params);
  },

  //根据id查询预算项目
  getItemById(id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/items/${id}`);
  },

  //新增预算项目
  addItem(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/items`, params);
  },

  //更新预算项目
  updateItem(params) {
    return httpFetch.put(`${config.budgetUrl}/api/budget/items`, params);
  },

  //预算项目批量分配公司
  batchAddCompanyToItem(params) {
    return httpFetch.post(
      `${config.budgetUrl}/api/budget/item/companies/batch/assign/company`,
      params
    );
  },

  //查询预算项目已分配的公司
  itemAssignedCompany(params) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/item/companies/query`, params);
  },

  //改变某项目已分配的公司的状态
  updateItemAssignedCompany(params) {
    return httpFetch.put(`${config.budgetUrl}/api/budget/item/companies`, params);
  },
  //根据预算组织id得到预算组织信息
  getOrganizationById(id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/organizations/${id}`);
  },

  importOk(transactionID) {
    return httpFetch.post(
      `${config.budgetUrl}/api/budget/items/import/new/confirm/${transactionID}`
    );
  },
};
