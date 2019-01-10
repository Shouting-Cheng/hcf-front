import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  //获取租户下成本中心查询
  getCostCenters(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(`${config.baseUrl}/api/dimension/page/by/cond`, params)
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
  getCostCenterItems(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(`${config.baseUrl}/api/dimension/item/page/by/cond`, params)
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
