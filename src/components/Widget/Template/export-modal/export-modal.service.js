/**
 * Created by zhouli on 18/6/25
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import axios from 'axios';
export default {
  //导出信息
  exportInfo: function(params, body) {
    return new Promise((resolve, reject) => {
      httpFetch
        .post(
          config.baseUrl +
            '/api/common/download/by/command?' +
            'exportType=' +
            params.exportType +
            '&' +
            'command=' +
            params.command +
            '&' +
            'timestamp=' +
            params.timestamp,
          body
        )
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },
  //导出进度
  exportInfoProgress: function(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/common/download/async/progress', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          errorMessage(err.response);
          reject(err);
        });
    });
  },

  getFileByPath: function(path) {
    return axios({
      url: path,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    // return new Promise((resolve, reject) => {
    //   httpFetch.get(path)
    //     .then((res) => {
    //       resolve(res)
    //     })
    //     .catch((err) => {
    //       errorMessage(err.response);
    //       reject(err);
    //     })
    // })
  },
};
