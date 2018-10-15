/**
 * Created by zhouli on 18/7/24
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
export default {
  //获取搜索要选择的城市
  getCityForSearch: function(params) {
    // let params = {
    //   language: "",
    //   type: "",//state
    //   code: ""
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/areas/international/list', params)
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
