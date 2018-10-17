/**
 * Created by 13576 on 2018/1/30.
 */
/**
 * Created by 13576 on 2018/1/8.
 */
import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 获取付款方式(分页)
   * */
  getPaymentType(params) {
    return httpFetch.get(`${config.payUrl}/api/cash/payment/method/query`, params);
  },

  /**
   * 保存或者修改付款方式
   * */
  addOrUpDataPaymentType(params) {
    return httpFetch.post(`${config.payUrl}/api/cash/payment/method`, params);
  },

  //根据租户查询账套信息
  getSetOfBooksByTenant() {
    return httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`);
  },
};
