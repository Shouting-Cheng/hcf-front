import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //根据账套ID获取合同类型定义列表
  getContractTypeDefineList(page, size, searchParams) {
    let url = `${config.contractUrl}/api/contract/type/query?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  //新建合同类型定义
  newContractType(setOfBooksId, params) {
    return httpFetch.post(`${config.contractUrl}/api/contract/type/${setOfBooksId}`, params);
  },

  //更新合同类型定义
  updateContractType(setOfBooksId, params) {
    return httpFetch.put(`${config.contractUrl}/api/contract/type/${setOfBooksId}`, params);
  },

  //根据账套ID和合同类型ID查询合同类型信息
  getContractTypeInfo(setOfBooksId, id) {
    return httpFetch.get(`${config.contractUrl}/api/contract/type/${setOfBooksId}/${id}`);
  },

  //根据账套ID和合同类型ID查询分配公司列表
  getCompanyDistributionByContractType(page, size, setOfBooksId, id) {
    return httpFetch.get(
      `${
        config.contractUrl
      }/api/contract/type/${setOfBooksId}/companies/query?page=${page}&size=${size}&contractTypeId=${id}`
    );
  },

  //分配公司
  distributionCompany(setOfBooksId, params) {
    return httpFetch.post(
      `${config.contractUrl}/api/contract/type/${setOfBooksId}/toCompany`,
      params
    );
  },

  //更新公司分配状态
  updateCompanyDistributionStatus(setOfBooksId, params) {
    return httpFetch.put(
      `${config.contractUrl}/api/contract/type/${setOfBooksId}/toCompany`,
      params
    );
  },
};
