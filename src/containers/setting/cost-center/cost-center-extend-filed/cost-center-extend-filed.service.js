/**
 * Created by zhouli on 18/4/18
 * Email li.zhou@huilianyi.com
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import EFService from 'containers/enterprise-manage/extend-field/extend-field.service';

export default {

  //获取表单类型
  getWidgetList(params) {
    return new Promise((resolve, reject) => {
      EFService.getWidgetList(params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //获取扩展字段表单
  getCustomForm() {
    let params = {
      formCode:"cost_center_item_form"
    }
    return new Promise((resolve, reject) => {
      httpFetch.get(config.baseUrl + '/api/custom/forms/by/form/code',params)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //创建个人信息扩展字段表单
  createCustomForm: function (form) {
    return new Promise((resolve, reject) => {
      httpFetch.post(config.baseUrl + '/api/cost/center/item/custom/forms', form)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  },
  //保存表单
  updateCustomForm(form) {
    return new Promise((resolve, reject) => {
      EFService.updateCustomForm(form)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          errorMessage(err.response);
          reject(err);
        })
    })
  }

}
