/**
 * Created by zhouli on 18/4/18
 * Email li.zhou@huilianyi.com
 * 我在其他模板实际上是要用到查询账套，
 * 我把获取账套的接口，放在账套的服务里面，
 * 其他地方要用，就直接引入
 *
 * 注意：之前没有把账套相关接口，放在这里，导致整个应用api写得到处都是
 * 之后会有序组织api
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
export default {
  //获取租户下所有的账套：
  getTenantAllSob(params) {
    return new Promise((resolve, reject) => {
      httpFetch
        .get(config.baseUrl + '/api/setOfBooks/by/tenant', params)
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
