import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  //获取价格审核列表,status 1005（待审核）、1006（已审核）
  getPriceReviewList(page, size, status, searchParams) {
    let params = {
      page,
      size,
      status,
    };
    Object.keys(searchParams).map(key => {
      searchParams[key] && (params[key] = searchParams[key]);
    });
    return new Promise((resolve, reject) => {
      httpFetch
        .get(`${config.baseUrl}/api/travel/operations/priceAudit`, params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  //价格审核通过／驳回
  priceReviewPassOrReject(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(`${config.baseUrl}/api/travel/operation/priceAudit`, params)
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
