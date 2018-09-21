import fetch from '../utils/fetch';
import axios from 'axios';

export default {
  async getInterface(id, params = {}) {
    let info = await fetch.get('/auth/api/interface/query/' + id);

    let option = {
      url: info.reqUrl,
      method: info['requestMethod'],
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      body: params,
      params:
        info['requestMethod'] === 'get' || info['requestMethod'] === 'delete' ? params : undefined,
    };

    return axios(option);
  },
};
