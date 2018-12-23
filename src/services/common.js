import fetch from '../utils/fetch';
import axios from 'axios';
import app from "../index"

export default {
  async getInterface(id, params = {}) {
    let info = await fetch.get('/api/interface/query/' + id);
    let list = await fetch.get('/api/interfaceRequest/query?page=0&size=9999&interfaceId=' + id);

    let values = {};

    let data = list.filter(o => o.parentId == 0);

    this.formatValues(data, list, values);

    let option = {
      url: info.reqUrl,
      method: info['requestMethod'],
      headers: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
      },
      data: values.data,
      params:
        info['requestMethod'] === 'get' || info['requestMethod'] === 'delete' ? { ...values.data, ...params } : undefined,
    };

    return axios(option);
  },

  formatValues(data, dataSource, values) {
    data.map((item, index) => {
      if (item.reqType == "object") {
        let result = dataSource.filter(o => o.parentId == item.id);
        if (result && result.length) {
          values.data = {};
          values.data[item.keyCode] = {};
          result.map(i => {
            values.data[item.keyCode][i.keyCode] = this.dataDel(i.defaultValue, i.reqType);
          })
          this.formatValues(result, dataSource, values.data[item.keyCode]);
        }
      } else if (item.reqType == "array") {
        if (item.parentId == 0) {
          let result = dataSource.filter(o => o.parentId == item.id);
          if (result && result.length) {
            values.data = [{}];
            result.map(i => {
              values.data[0][i.keyCode] = this.dataDel(i.defaultValue, i.reqType);
            })
            this.formatValues(result, dataSource, values.data[0]);
          }
        } else {
          let result = dataSource.filter(o => o.parentId == item.id);
          if (result && result.length) {
            values.data = {};
            values.data[item.keyCode] = [{}];
            result.map(i => {
              values.data[item.keyCode][0][i.keyCode] = this.dataDel(i.defaultValue, i.reqType);
            })
            this.formatValues(result, dataSource, values.data[item.keyCode][0]);
          }
        }
      } else {
        if (item.parentId == 0) {
          values.data = {};
          values.data[item.keyCode] = this.dataDel(item.defaultValue, item.reqType);
        } else {
          values[item.keyCode] = this.dataDel(item.defaultValue, item.reqType);
        }
      }
    })
  },

  dataDel(value, type) {

    let store = app.getState();

    let key = "";
    value.replace(/\$\{(.+)\}/g, (target, result) => {
      key = result;
    });

    if (key) {
      let temp = this.getValue(store, key);
      if (temp && temp.length) {
        value = temp[0];
      }
    }

    if (type == "bool") {
      return Boolean(value);
    }
    return value;
  },

  getValue(data, ...args) {
    const res = JSON.stringify(data);
    return args.map((item) => (new Function(`try {return ${res}.${item} } catch(e) {}`))());
  }
};
