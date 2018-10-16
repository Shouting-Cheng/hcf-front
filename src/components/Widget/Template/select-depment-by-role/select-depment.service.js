/**
 * Created by zhouli on 18/4/25
 * Email li.zhou@huilianyi.com
 * 角色的api配置
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
export default {
  //获取财务人员的部门树
  getFinanceRoleTree: function(params) {
    // let params = {
    //   keyword: keyword,
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/department/tree/by/finance/role', params)
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
