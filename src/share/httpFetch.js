import axios from 'axios';
import { routerRedux } from 'dva/router';
import { notification } from 'antd';

const baseUrl = '';
export default {
  get(url, params) {
    let option = {
      url: baseUrl + url,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      params: { ...params, roleType: "TENANT" },
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
    };
    return axios(baseUrl + url, option);
  },
};
