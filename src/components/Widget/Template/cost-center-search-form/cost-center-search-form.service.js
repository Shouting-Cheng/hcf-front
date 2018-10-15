import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  //获取租户下成本中心查询
  getCostCenters(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(`${config.baseUrl}/api/cost/centers/search`, params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //获取租户下成本中心项
  getCostCenterItems(costCenterOID, params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(`${config.baseUrl}/api/cost/center/${costCenterOID}/item/search`, params)
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
