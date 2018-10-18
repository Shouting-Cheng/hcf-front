import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 分页查询核算工单类型
   */
  typeQuery(params) {
    return httpFetch.get(
      `${config.accountingUrl}/api/general/ledger/work/order/types/query`,
      params
    );
  },
  /**
   * 获取关联表单类型
   */
  getRelatedFormList(setOfBooksId) {
    return httpFetch.get(
      `${
        config.baseUrl
      }/api/custom/forms/setOfBooks/my/available/all?formTypeId=801008&setOfBooksId=${setOfBooksId}&roleType=TENANT`
    );
  },
  /**
   * 新增核算工单类型
   */
  typeInsert(params) {
    return httpFetch.post(`${config.accountingUrl}/api/general/ledger/work/order/types`, params);
  },
  /**
   * 更新核算工单类型
   */
  typeUpdate(params) {
    return httpFetch.put(`${config.accountingUrl}/api/general/ledger/work/order/types`, params);
  },
  /**
   * 根据id获取核算工单类型详细
   */
  getTypeById(id) {
    return httpFetch.get(`${config.accountingUrl}/api/general/ledger/work/order/types/${id}`);
  },
  /**
   * 获取核算工单类型分配公司
   */
  getTypeDistributionCompany(id, page, size) {
    return httpFetch.get(
      `${
        config.accountingUrl
      }/api/general/ledger/work/order/type/companies/query?workOrderTypeId=${id}&page=${page}&size=${size}`
    );
  },
  /**
   * 批量修改核算工单类型分配公司
   */
  typeDistributionCompanyUpdate(params) {
    return httpFetch.put(
      `${config.accountingUrl}/api/general/ledger/work/order/type/companies/batch`,
      params
    );
  },
  /**
   * 批量新增核算工单类型分配公司
   */
  typeDistributionCompanyInsert(params) {
    return httpFetch.post(
      `${config.accountingUrl}/api/general/ledger/work/order/type/companies/batch`,
      params
    );
  },
};
