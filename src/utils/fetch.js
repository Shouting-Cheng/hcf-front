import axios from 'axios';
import request from './request';
import store from '../index';
import { routerRedux } from 'dva/router';
import { notification } from 'antd';

const baseUrl = '';
export default {
  get(url, params) {
    return new Promise((resolve, reject) => {
      let option = {
        url: baseUrl + url,
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
        params: params,
      };
      axios(option)
        .then(res => {
          resolve(res.data);
        })
        .catch(error => {
          if (error.response.status == 401) {
            if (store) {
              store.dispatch({
                type: 'login/logout',
              });
            }
          }
          reject(error)
        });
    });
  },
  post(url, params) {
    let option = {
      url: baseUrl + url,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data: params,
    };
    return new Promise((resolve, reject) => {
      axios(option)
        .then(res => {
          resolve(res.data);
        })
        .catch(e => {
          notification.error({
            message: `请求错误 ${e.response.status}: ${e.response.config.url}`,
            description: e.response.data && e.response.data.message,
          });
          reject && reject(e.response);
        });
    });
  },
  put(url, params) {
    let option = {
      url: baseUrl + url,
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data: params,
    };
    return new Promise((resolve, reject) => {
      axios(option)
        .then(res => {
          resolve(res.data);
        })
        .catch(e => {
          notification.error({
            message: `请求错误 ${e.response.status}: ${e.response.config.url}`,
            description: e.response.data && e.response.data.message,
          });
          reject && reject(e.response);
        });
    });
  },
  delete(url, params) {
    let option = {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      body: params,
    };
    return request(baseUrl + url, option);
  },
  post1(url, params) {
    let option = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      body: params,
    };
    return request(url, option);
  },
};
