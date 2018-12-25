/**
 * Created by zhouli on 18/4/25
 * Email li.zhou@huilianyi.com
 * 停机公告
 * 运维公告
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import axios from 'axios';
//这块是走停机公告的服务，不需要这边的token，不需要拦截器中的header
export default {
  //运维公告与停机公告，停机预告
  getOperationAnnouncements: function(tenantId, userOid, account, language) {
    let params = {
      tenantId: tenantId,
      useOid: userOid,
      account: account,
      language: language || 'zh_cn',
    };
    return axios({
      url: config.baseUrl + '/operationservice/public/search/maintenanceAnnounce',
      method: 'GET',
      params: params,
    });
  },

  //白名单
  getIsWhiteList: function(login) {
    let params = {
      login: login,
    };
    return axios({
      url: config.baseUrl + '/operationservice/public/isWhitelist',
      method: 'GET',
      params: params,
    });
  },
};
