import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';

//服务重新封装，这样方便这里统一错误处理
export default {
  //条件查询公司
  getCompaniesByOptions(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/company/by/term', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //根据公司id查询公司信息
  getCompanyById(id) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/company/' + id)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //根据公司oid，与法人实体id，过滤公司
  getSelectListParentCompany(params) {
    // let params = {
    //   legalEntityId:"legalEntityId",
    //   filterCompanyOIDs:"filterCompanyOIDs"
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/company/by/tenant', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //新建公司
  addCompany(company) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/refactor/tenant/company/register', company)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //编辑公司
  updateCompany(company) {
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/refactor/companies', company)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //获取银行账户信息
  getBankAccountInfo(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/CompanyBank/selectByCompanyId', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //获取员工信息
  //搜索人：新查询员工的接口，可以加很多参数
  getUserInfo(params) {
    return new Promise((resolve, reject) => {
      OrgService.searchPersonInDep(params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //新建银行账户
  addOrUpdateBankAccount(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/CompanyBank/insertOrUpdate', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //根据id查询银行信息
  getCompanyBankInfoById(id) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/CompanyBank/selectById?companyBankId=' + id)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //员工一到另一个公司
  //todo
  //这个接口需要重构,才能跑通：已经通知周宗云
  //   let path = `${config.baseUrl}/api/users/move?companyOIDFrom=${companyOIDFrom}&companyOIDTo=${companyOIDTo}&selectMode=default?`
  //   selectedRowKeys.map((item) => {
  //   path = `${path}&userOIDs=${item}`
  // });
  movePersonToCompany(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/users/move', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
};
