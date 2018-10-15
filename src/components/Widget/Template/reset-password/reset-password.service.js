import { messages } from 'share/common';
/**
 * Created by zhouli on 18/6/20
 * Email li.zhou@huilianyi.com
 */

import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';
import { message } from 'antd';

export default {
  //重置密码的接口
  resetPassword: function(params) {
    // let params = {
    //   newPassword: "",
    // }
    return new Promise((resolve, reject) => {
      httpFetch
        .post(
          config.baseUrl + '/api/refactor/account/change_password?newPassword=' + params.newPassword
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

  // 获取密码设置规则
  getPasswordRule: function(mobile_or_email) {
    //建议能用邮箱获取,就邮箱,因为手机可能被修改
    return new Promise((resolve, reject) => {
      httpFetch
        .get(
          config.baseUrl +
            '/api/refactor/password/rule/topic?username=' +
            encodeURIComponent(mobile_or_email)
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
  // 校验密码
  regPasswordByRule: function(password, password_rule) {
    //先验证长度
    if (password.length < parseInt(password_rule.minLength)) {
      //密码长度不能小于{min}位
      message.error(messages('reset-password.rule.min', { min: password_rule.minLength }));
      return false;
    }
    if (password.length > parseInt(password_rule.maxLength)) {
      // 密码长度不能大于{max}位
      message.error(messages('reset-password.rule.max', { min: password_rule.maxLength }));
      return false;
    }
    //验证数字
    var regexNum = /^.*[0-9].*$/;
    //验证小写字母
    var regexLowerCase = /^.*[a-z].*$/;
    //验证大写字母
    var regexUpperCase = /^.*[A-Z].*$/;
    //验证特殊字符
    var regexSpecialChar = /^.*[~!@#\$%\^&\*\(\)_+\-=\[\]\{\}\\\|\'\";:,\<\.\>\/\?\s+].*$/;
    if (password_rule.isNeedNumber) {
      var val = regexNum.test(password);
      if (!val) {
        // 密码需要包含数字
        message.error(messages('reset-password.rule.num'));
        return false;
      }
    }
    if (password_rule.isNeedLowercase) {
      var val = regexLowerCase.test(password);
      if (!val) {
        // 密码需要包含小写字母
        message.error(messages('reset-password.rule.lower'));
        return false;
      }
    }
    if (password_rule.isNeedUppercase) {
      var val = regexUpperCase.test(password);
      if (!val) {
        // 密码需要包含大写字母
        message.error(messages('reset-password.rule.upper'));
        return false;
      }
    }
    if (password_rule.isNeedSpecialChar) {
      var val = regexSpecialChar.test(password);
      if (!val) {
        // 密码需要包含特殊字符
        message.error(messages('reset-password.rule.special'));
        return false;
      }
    }
    //如果上面都通过
    return true;
  },
};
