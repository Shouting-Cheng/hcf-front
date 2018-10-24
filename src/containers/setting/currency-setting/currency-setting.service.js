import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  // 启用或取消启用自动汇率
  enableAutoUpdate(params) {
    //todo
    //参数需要后端修改在body里面
    //目前是在url后面
    // let params = {
    //   tenantId:"",
    //   setOfBooksId:"",
    //   enableAutoUpdate:"",
    // }
    return new Promise((resolve, reject) => {
      httpFetch.put(config.baseUrl + '/api/currency/status/enable/auto/update', params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //点击汇率容差的保存
  configInput(params) {
    // let params = {
    //   prohibitExchangeRateTol,
    //   warnExchangeRateTo,
    //   setOfBooksId,
    //   tenantId,
    // };
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/tenant/config/input', params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
}

