import axios from 'axios';
import { notification } from 'antd';
import store from '../index';
import { routerRedux } from 'dva/router';
import qs from 'qs'

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

  get(url, params, header = {}, options = {}) {

    if (url.indexOf("TENANT") < 0) {
      params = { ...params, roleType: 'TENANT' }
    }

    let option = {
      ...options,
      url: baseUrl + url,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    };
    return axios(option);
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
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data,
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    };

    return axios(option);
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
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data,
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    };
    return axios(baseUrl + url, option);
  },
  delete(url, data) {

    let params = {};
    if (url.indexOf("TENANT") < 0) {
      params = { ...params, roleType: 'TENANT' }
    }

    let option = {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data,
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    };
    return axios(baseUrl + url, option);
  },
};
