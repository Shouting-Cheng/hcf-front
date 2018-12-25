import httpFetch from 'share/httpFetch';
import config from 'config';

export default {
  //查询我的代理表单101申请单，102报销单，103所有
  getProxyMyForms(formType, userOid) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/my/available`, {
      formType: formType,
      userOid: userOid,
    });
  },
  //查询我是否有代理单据,101申请单，102报销单，103所有
  getIsProxyCustomForm(formType) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/my/proxy/customForm`, {
      formType: formType,
    });
  },
  //查询我的代理人
  getProxyMyPrincipals(formType) {
    return httpFetch.get(`${config.baseUrl}/api/bill/proxy/query/my/principals`, {
      formType: formType,
    });
  },
};
