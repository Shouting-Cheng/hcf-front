import axios from 'axios';
import { notification } from 'antd';
import store from '../index';
import { routerRedux } from 'dva/router';

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 对响应错误做点什么

  if (error.response.status == 401) {
    store.dispatch({
      type: 'login/logout',
    });
  }

  return Promise.reject(error);
});

const baseUrl = '';
export default {
  get(url, params) {
    let option = {
      url: baseUrl + url,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      params: { ...params, roleType: 'TENANT' }
    };
    return axios(option);
  },
  post(url, params) {
    let option = {
      url: baseUrl + url,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data: params,
      params: { roleType: "TENANT" }
    };

    return axios(option);
    // return new Promise((resolve, reject) => {

    //     .then(res => {
    //       resolve(res);
    //     })
    //     .catch(e => {
    //       notification.error({
    //         message: `请求错误 ${e.response.status}: ${e.response.config.url}`,
    //         description: e.response.data && e.response.data.message,
    //       });
    //       reject && reject(e.response);
    //     });
    // });
  },
  put(url, params) {
    let option = {
      url: baseUrl + url,
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data: params,
      params: { roleType: "TENANT" }
    };
    return axios(baseUrl + url, option);
  },
  delete(url, params) {
    let option = {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data: params,
      params: { roleType: "TENANT" }
    };
    return axios(baseUrl + url, option);
  },
};
