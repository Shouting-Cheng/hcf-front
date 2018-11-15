import fetch from '../utils/fetch';
import axios from 'axios';

export default {
  async getInterface(id, params = {}) {
    let info = await fetch.get('/auth/api/interface/query/' + id);
    let list = await fetch.get('/auth/api/interfaceRequest/query?page=0&size=10&interfaceId=' + id);

    let values = {};

    let data = list.filter(o => o.parentId == 0);

    this.formatValues(data, list, values);

    console.log(values);

    let option = {
      url: info.reqUrl,
      method: info['requestMethod'],
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      data: { ...values, ...params },
      params:
        info['requestMethod'] === 'get' || info['requestMethod'] === 'delete' ? { ...values, ...params } : undefined,
    };

    return axios(option);
  },

  formatValues(data, dataSource, values) {
    data.map(item => {
      if (item.reqType == "object") {
        let result = dataSource.filter(o => o.parentId == item.id);
        if (result && result.length) {
          values[item.keyCode] = {};
          result.map(i => {
            values[item.keyCode][i.keyCode] = this.dataDel(i.defaultValue, i.reqType);
          })
          this.formatValues(result, dataSource, values[item.keyCode]);
        }
      } else if (item.reqType == "array") {
        let result = dataSource.filter(o => o.parentId == item.id);
        if (result && result.length) {
          values[item.keyCode] = [{}];
          result.map(i => {
            values[item.keyCode][0][i.keyCode] = this.dataDel(i.defaultValue, i.reqType);
          })
          this.formatValues(result, dataSource, values[item.keyCode][0]);
        }
      } else {
        values[item.keyCode] = this.dataDel(item.defaultValue, item.reqType);
      }
    })
  },

  dataDel(value, type) {
    if (type == "bool") {
      return Boolean(value);
    }
    return value;
  }

};
