import axios from 'axios';
import store from '../index';
import qs from 'qs'
import moment from "moment"

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

//过期时间  单位秒
const InvalidTime = 60 * 60 * 2;   //2小时

let requestCount = 1;


axios.interceptors.request.use(function (config) {

  httpFetch.checkoutToken();

  return config;
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {

  window.sessionStorage.setItem("LastRequestDate", moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));

  return response;
}, async function (error) {

  if (error.response && error.response.status == 401) {

    //连续刷新三次token 就跳回登录页面
    if(requestCount >= 3) {
      requestCount = 0;
      message.error("服务器出现错误，请稍后重试...");
      store.dispatch({
        type: 'login/logout',
      });
      error.response.status = 500;
      return  Promise.reject(error);
    };

    requestCount++;

    await httpFetch.refreshToken();
    let config = error.config;
    return httpFetch[config.method](config.url, config.params, config.headers);
  }

  return Promise.reject(error);
});


const baseUrl = '';
const httpFetch = {

  get(url, params, header = {}, options = {}) {

    if (url.indexOf("TENANT") < 0) {
      params = { ...params, roleType: 'TENANT' }
    }

    let option = {
      ...options,
      url: baseUrl + url,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem("token"),
      },
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
      cancelToken: source.token
    };

    return new Promise((resolve, reject) => {
      axios(option).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    })
  },
  post(url, data, header = {}, options = {}) {

    let params = {};
    if (url.indexOf("TENANT") < 0) {
      params = { ...params, roleType: 'TENANT' }
    }

    let option = {
      ...options,
      url: baseUrl + url,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
      },
      data,
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
      cancelToken: source.token
    };

    return new Promise((resolve, reject) => {
      axios(option).then(res => {
        resolve(res.data);
      })
    }).catch(err => {
      reject(err);
    })
  },

  put(url, data) {
    let params = {};
    if (url.indexOf("TENANT") < 0) {
      params = { ...params, roleType: 'TENANT' }
    }

    let option = {
      url: baseUrl + url,
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
      },
      data,
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
      cancelToken: source.token
    };

    return new Promise((resolve, reject) => {
      axios(baseUrl + url, option).then(res => {
        resolve(res.data);
      })
    }).catch(err => {
      reject(err);
    })

  },
  delete(url, data) {

    let params = {};
    if (url.indexOf("TENANT") < 0) {
      params = { ...params, roleType: 'TENANT' }
    }

    let option = {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
      },
      data,
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
      cancelToken: source.token
    };

    return new Promise((resolve, reject) => {
      axios(baseUrl + url, option).then(res => {
        resolve(res.data);
      })
    }).catch(err => {
      reject(err);
    })

  },

  //刷新token
  refreshToken: function () {

    console.error("refreshToken");

    return new Promise((resolve, reject) => {
      let refreshParams = `client_id=ArtemisWeb&client_secret=nLCnwdIhizWbykHyuZM6TpQDd7KwK9IXDK8LGsa7SOW&refresh_token=${window.sessionStorage.getItem("refresh_token")}&grant_type=refresh_token`;
      return axios(encodeURI(`auth/oauth/token?${refreshParams}`), {
        method: 'POST',
        headers: {
          'x-helios-client': 'web',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + window.sessionStorage.getItem("token")
        }
      }).then(response => {
        let token = response.data;
        window.sessionStorage.setItem("token", token.access_token);
        window.sessionStorage.setItem("refresh_token", token.refresh_token);
        resolve();
      })
    })
  },

  //检查token是否失效，如果失效就跳到登录页面
  checkoutToken() {
    let currentDate = new Date(moment(new Date()).format("YYYY-MM-DD hh:mm:ss"));

    let lastDate = new Date(window.sessionStorage.getItem("LastRequestDate") || currentDate);

    let span = currentDate.getTime() - lastDate.getTime();

    if (span > InvalidTime * 1000) {

      store.dispatch({
        type: 'login/logout',
      });
      return true;
    }
  }
};

export default httpFetch
