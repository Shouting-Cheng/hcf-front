/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
  getSomething(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + 'url', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //获取表单类型
  getWidgetList(params) {
    // let params = {
    //   type:1003
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/form/gui/widgets/all', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //获取扩展字段表单
  getCustomForm(oid) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/custom/forms/' + oid + '/simple')
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //创建个人信息扩展字段表单
  createCustomForm: function(form) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(config.baseUrl + '/api/users/v2/custom/forms', form)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //保存表单
  updateCustomForm(form) {
    return new Promise((resolve, reject) => {
      httpFetch
        .put(config.baseUrl + '/api/custom/forms', form)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
};
