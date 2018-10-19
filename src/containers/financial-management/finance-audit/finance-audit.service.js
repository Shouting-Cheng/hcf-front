import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //审核通过
  auditPass(params) {
    return httpFetch.post(`${config.baseUrl}/api/audit/pass`, params);
  },

  //审核拒绝
  auditReject(params) {
    return httpFetch.post(`${config.baseUrl}/api/audit/reject`, params);
  },

  //审核通知
  noticeApplication(params) {
    return httpFetch.post(`${config.baseUrl}/api/approval/send/notice`, params);
  },

  //审核图片
  checkAttachment(params) {
    return httpFetch.post(`${config.baseUrl}/api/audit/image/checked`, params);
  },

  //扫码枪审核
  scan(code) {
    let params = {
      code,
      operate: 'AUDIT',
    };
    return httpFetch.post(`${config.baseUrl}/api/audit/scancode`, params);
  },
};
