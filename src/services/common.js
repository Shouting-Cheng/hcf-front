import fetch from '../utils/fetch';
import axios from 'axios';

export default {
  async getInterface(id, params = {}) {
    let info = await fetch.get('/auth/api/interface/query/' + id);
    let list = await fetch.get('/auth/api/interfaceRequest/query?page=0&size=10&interfaceId=' + id);
    let values = {};
    list.map(item => {
      values[item.keyCode] = item.defaultValue;
    })

    let option = {
      url: info.reqUrl,
      method: info['requestMethod'],
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      body: { ...values, ...params },
      params:
        info['requestMethod'] === 'get' || info['requestMethod'] === 'delete' ? { ...values, ...params } : undefined,
    };

    return axios(option);
  },
};
