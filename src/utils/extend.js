import React from 'react';
import app from '../index';
import httpFetch from 'share/httpFetch';
import config from 'config';
import constants from 'share/constants';

React.Component.prototype.$t = (id, values = {}) => {
  if (!app) return '';

  if (id && typeof id == 'object') {
    id = id.id;
  }

  let result = app.getState().languages.languages[id];

  //#代表没找到
  if (result === undefined) {
    return id;
  }
  //匹配 {*} 格式
  result = result.replace(/\{(.*?)\}/g, (target, $1) => {
    let replacement = false;
    //values内寻找是否有值，否则不替换
    Object.keys(values).map(key => {
      if (key === $1) replacement = values[key];
    });
    return replacement === undefined ? target : replacement;
  });
  return result;
};

/**
 * 删除数组元素.
 * @param item  被删的元素
 * @return 被删的下标
 */
Array.prototype.delete = function (item) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] === item) {
      this.splice(i, 1);
      return i;
    }
  }
  return -1;
};

Array.prototype.has = function (item, func = (a, b) => a === b) {
  for (let i = 0; i < this.length; i++) {
    if (func(item, this[i])) return true;
  }
  return false;
};

Array.prototype.addIfNotExist = function (item) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] === item) return;
  }
  this.push(item);
};

//给String类型添加 '_self' 的getter， 使得 typeof a === 'string' && a['_self'] === a 成立
if (String.prototype.__defineGetter__)
  String.prototype.__defineGetter__('_self', function () {
    return this.toString();
  });
else
  Object.defineProperty(String.prototype, '_self', {
    get: function () {
      return this.toString();
    },
  });

//金额过滤
React.Component.prototype.filterMoney = (money, fixed = 2, isString = false, isNumber = false) => {
  if (typeof fixed !== 'number') fixed = 2;
  money = Number(money || 0)
    .toFixed(fixed)
    .toString();
  let numberString = '';
  if (money.indexOf('.') > -1) {
    let integer = money.split('.')[0];
    let decimals = money.split('.')[1];
    numberString = integer.replace(/(\d)(?=(\d{3})+(?!\d))/g, isNumber ? '$1' : '$1,') + '.' + decimals;
  } else {
    numberString = money.replace(/(\d)(?=(\d{3})+(?!\d))\./g, isNumber ? '$1' : '$1,');
  }
  numberString += numberString.indexOf('.') > -1 ? '' : '.00';
  if (isString === true) {
    return numberString;
  } else {
    return <span className="money-cell">{numberString}</span>;
  }
};

//状态汇总
React.Component.prototype.$statusList = {
  1001: { label: '编辑中', state: 'default', color: "#108ee9" },
  1002: { label: '审批中', state: 'processing', color: "#108ee9" },
  1003: { label: '撤回', state: 'warning', color: "orange" },
  1004: { label: '审批通过', state: 'success', color: "#87d068" },
  1005: { label: '审批驳回', state: 'error', color: "#f50" },
  1006: { label: '审核通过', state: 'success', color: "#87d068" },
  1007: { label: '审核驳回', state: 'success', color: "#87d068" },
  2002: { label: '审核通过', state: 'success', color: "#87d068" },
  3002: { label: '审核中', state: 'processing', color: "#108ee9" },
  5001: { label: '复核(过账)', state: 'processing', color: "#108ee9" },
  5002: { label: '反冲提交', state: 'processing', color: "#108ee9" },
  5003: { label: '反冲审核', state: 'processing', color: "#108ee9" },
  6001: { label: '暂挂中', state: 'warning', color: "orange" },
  6002: { label: '已取消', state: 'error', color: "#f50" },
  6003: { label: '已完成', state: 'success', color: "#87d068" },
  6004: { label: '取消暂挂', state: 'success', color: "#87d068" },
  9001: { label: '支付', state: 'processing', color: "#108ee9" },
  9002: { label: '退款', state: 'processing', color: "#108ee9" },
  9003: { label: '退票', state: 'processing', color: "#108ee9" },
  9004: { label: '反冲', state: 'processing', color: "#108ee9" },
};
//格式化金额
React.Component.prototype.formatMoney = (number, decimals = 2, isString = false) => {
  number = (number + '').replace(/[^0-9+-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep,
    dec = typeof dec_point === 'undefined' ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.ceil(n * k) / k;
    };
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  var re = /(-?\d+)(\d{3})/;
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2');
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  if (isString === true) {
    return s.join(dec);
  } else {
    return <span className="money-cell">{s.join(dec)}</span>;
  }
};

//检查用户操作权限
React.Component.prototype.checkAuthorities = auth => {
  let user = app.getState().user.currentUser;
  let result;
  if (auth.splice) {
    result = true;
    user.authorities &&
      auth.length >= 1 &&
      auth.map(authItem => {
        let authFlag = false;
        user.authorities.map(item => {
          authFlag = authFlag || authItem === item;
        });
        result = result && authFlag;
      });
  } else {
    result = false;
    user.authorities &&
      user.authorities.map(item => {
        result = result || auth === item;
      });
  }
  return result;
};

//检查用户操作权限
React.Component.prototype.checkPageRole = (pageName, action) => {
  let user = app.getState().user.currentUser;
  let result = false;
  if (user.pageRoles && user.pageRoles.splice) {
    user.pageRoles.map(item => {
      if (item.pageName === pageName && item.action === action) result = true;
    });
  }
  return result;
};

//检查用户菜单按钮显示权限
React.Component.prototype.checkPageShowRole = pageName => {
  let user = app.getState().user.currentUser;
  let result = false;
  if (user.pageRoles && user.pageRoles.splice) {
    user.pageRoles.map(item => {
      if (item.pageName === pageName && item.action > 0) result = true;
    });
  }
  return result;
};

// 记住页码状态需求。需要三个函数---start---
/*
* 用法
* 1.在跳转页面(具体跳转动作，可根据需求决定)的时候，记住页码 this.setBeforePage(pagination);
* 2.在进入页面的时候，获取记住的页码 this.getBeforePage()
* 3.进入页面，获取并且设置页面之后，需要清除已经记住的页面，不然会导致跳转混乱 this.clearBeforePage();
* 4.如果一个页面组件里面有多个table需要记住页面，可以传入指定的key
* this.setBeforePage(pagination,'myKey');
* this.getBeforePage('myKey')
* this.clearBeforePage('myKey')
* */
//翻页前缓存页码
React.Component.prototype.setBeforePage = function (pagination, key) {
  let _key = this.constructor.name.replace(/([A-Z])/g, '-$1').toLowerCase();
  if (key) {
    _key = key;
  }
  sessionStorage.setItem(_key, JSON.stringify(pagination));
};
//回来后获取页码
React.Component.prototype.getBeforePage = function (key) {
  let _key = this.constructor.name.replace(/([A-Z])/g, '-$1').toLowerCase();
  if (key) {
    _key = key;
  }
  let pagination = JSON.parse(sessionStorage.getItem(_key));
  if (
    pagination === null ||
    pagination === undefined ||
    pagination.page === null ||
    pagination.page === undefined
  ) {
    pagination = {
      page: 0,
    };
  }
  return pagination;
};
//清除设置的页面
React.Component.prototype.clearBeforePage = function (key) {
  let _key = this.constructor.name.replace(/([A-Z])/g, '-$1').toLowerCase();
  if (key) {
    _key = key;
  }
  sessionStorage.removeItem(_key);
};
// 记住页码状态需求。需要三个函数---end---

//检查单个functionProfile
let checkFunctionProfile = (fpItem, fpValue, ifTenant) => {
  /* let profile = ifTenant
    ? configureStore.store.getState().login.tenantProfile
    : configureStore.store.getState().login.profile;*/
  let profile = {};
  if (fpItem[0] === '[') {
    fpItem = fpItem.replace(/]/g, '');
    let attrs = fpItem.split('[');
    let targetItem = profile;
    attrs.map(attr => {
      if (attr.length > 0) {
        try {
          targetItem = targetItem[attr];
        } catch (e) {
          targetItem = false;
        }
      }
    });
    return (
      targetItem && (fpValue.splice ? fpValue.indexOf(targetItem) > -1 : targetItem === fpValue)
    );
  } else {
    return fpValue.splice ? fpValue.indexOf(profile[fpItem]) > -1 : profile[fpItem] === fpValue;
  }
};

//检查用户functionProfile,可为数组或单个值
React.Component.prototype.checkFunctionProfiles = (fpItem, fpValue, ifTenant) => {
  if (!fpItem || !fpValue) return false;
  //为数组时
  if (fpItem.splice) {
    if (fpItem.length !== fpValue.length || fpItem.length === 0) return false;
    let result = true;
    fpItem.map((item, index) => {
      result = result && checkFunctionProfile(item, fpValue[index], ifTenant);
    });
    return result;
  }
  //为单字符串时
  else {
    return checkFunctionProfile(fpItem, fpValue, ifTenant);
  }
};

//检查用户操作权限拥有任意之一
React.Component.prototype.hasAnyAuthorities = auth => {
  let user = app.getState().user.currentUser;
  let result = false;
  user.authorities &&
    auth.length >= 1 &&
    auth.map(authItem => {
      user.authorities.map(item => {
        if (authItem === item) result = true;
      });
    });
  return result;
};

// 格式化时间yyyy-MM-dd hh:mm:ss.S
Date.prototype.format = function (fmt) {
  let o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };

  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));

  for (let k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
  return fmt;
};

//根据传入的月数计算时间，可计算*月后/前的时间,month可为负数
Date.prototype.calcMonth = function (month) {
  let nowYear = this.getFullYear();
  let nowMonth = this.getMonth() + 1;
  let monthSum = nowMonth + month;
  let yearNumber = monthSum / 12;
  let targetYear = nowYear + Math.floor(yearNumber);
  if (yearNumber === 0) targetYear--;
  while (monthSum < 0) {
    monthSum += 12;
  }
  let targetMonth = monthSum === 0 ? 12 : monthSum % 12 === 0 ? 12 : monthSum % 12;
  let targetDate = this.getDate();
  let bigMonth = [1, 3, 5, 7, 8, 10, 12];
  if (targetMonth === 2 && targetDate > 28) {
    if (targetYear % 4 === 0) targetDate = 29;
    else targetDate = 28;
  }
  if (bigMonth.indexOf(targetMonth) === -1 && targetDate === 31) {
    targetDate = 30;
  }
  return new Date(`${targetYear}-${targetMonth}-${targetDate}`);
};

/**
 * 得到系统值列表
 * 1001 人员类型
 * 1002 职务
 * 1003 携程子账户
 * 1004 银行名称
 * 1005 国籍
 * 1006 证件类型
 * 1007 性别
 * 1008 员工级别
 * 1010 会计期间名称附加
 * 2001 版本状态
 * 2002 编制期段
 * 2003 布局位置
 * 2004 预算项目变动属性
 * 2005 预算控制方法
 * 2006 预算控制策略类型
 * 2007 预算控制策略范围
 * 2008 预算控制策略对象
 * 2009 预算控制策略方式
 * 2010 预算控制策略预算符号
 * 2011 控制期段
 * 2012 规则参数类型
 * 2013 取值方式
 * 2014 取值范围
 * 2015 规则参数类型_预算相关
 * 2016 规则参数类型_组织架构相关
 * 2017 规则参数类型_维度相关
 * 2018 预算业务类型
 * 2019 金额／数量
 * 2020 期间汇总标志
 * 2021 预算季度
 * 2022 预算控制消息
 * 2023 单据类别
 * 2024 重置频率
 * 2025 段值
 * 2026 日期格式
 * 2101 汇率方法
 * 2102 汇率标价方法
 * 2103 银行类型
 * 2104 现金交易事务类型
 * 2105 付款方式类型
 * 2106 单据类别
 * 2107 收款方类型
 * 2108 通用待付信息付款状态
 * 2109 付款状态
 * 2110 退款状态
 * 2111 支付日志操作类型
 * 2201 合同状态
 * 2202 合同大类
 * 2205 科目类型
 * 2206 报表类型
 * 2207 余额方向
 * 2208 来源事务
 * 2209 核算场景
 * 2210 核算要素取值方式
 * 2211 核算要素转换规则
 * 2212 交易判断规则
 * 2213 交易核算段取值方式
 *
 * @param code 值列表代码
 */
React.Component.prototype.getSystemValueList = code => {
  let url = '';
  if (Number(code) > 2000) url = '/api/custom/enumerations/template/by/type?type=';
  else url = '/api/custom/enumeration/system/by/type?systemCustomEnumerationType=';
  return httpFetch.get(`${config.baseUrl}${url}${code}`).then(res => {
    return new Promise(resolve => {
      if (res.data.splice) {
        let result = JSON.parse(JSON.stringify(res));
        result.data = { values: res.data };
        resolve(result);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * 将一个元素包装成雪碧图动画，雪碧图为垂直方向
 * @param dom  需要包装的dom
 * @param img  雪碧图资源
 * @param height  单个frame的高
 * @param width  单个frame的宽
 * @param total  总共帧数
 * @param duration 动画持续时间
 * @param hoverDom hover所需要的dom
 */
window.spriteAnimation = function (dom, img, height, width, total, duration = 500, hoverDom = dom) {
  dom.style.backgroundImage = `url('${img}')`;
  dom.style.backgroundSize = `${width}px`;
  dom.frames = total;
  hoverDom.onmouseenter = function () {
    let enterInterval = setInterval(() => {
      clearInterval(dom.leaveInterval);
      dom.enterInterval = enterInterval;
      dom.style.backgroundPosition = `0 ${dom.frames * height}px`;
      dom.frames--;
      if (dom.frames === 0) clearInterval(enterInterval);
    }, duration / total);
  };
  hoverDom.onmouseleave = function () {
    let leaveInterval = setInterval(() => {
      clearInterval(dom.enterInterval);
      dom.leaveInterval = leaveInterval;
      dom.frames++;
      dom.style.backgroundPosition = `0 ${dom.frames * height}px`;
      if (dom.frames === total) clearInterval(leaveInterval);
    }, duration / total);
  };
};

//公用接口
React.Component.prototype.service = {
  //获取货币
  getCurrencyList: userOid => {
    return httpFetch.get(
      `${config.baseUrl}/api/company/standard/currency/getAll/${
      userOid ? `?userOid=${userOid}` : ''
      }`
    );
  },
};

//公共函数:对象深拷贝
export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
let utilDeepCopy = (function () {
  let class2type = {};
  [
    'Null',
    'Undefined',
    'Number',
    'Boolean',
    'String',
    'Object',
    'Function',
    'Array',
    'RegExp',
    'Date',
  ].forEach(function (item) {
    class2type['[object ' + item + ']'] = item.toLowerCase();
  });
  function isType(obj, type) {
    return getType(obj) === type;
  }
  function getType(obj) {
    return class2type[Object.prototype.toString.call(obj)] || 'object';
  }
  return {
    isType: isType,
    getType: getType,
  };
})();

//深度copy
export function deepFullCopy(obj, deep = true) {
  //如果obj不是对象，那么直接返回值就可以了
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  //定义需要的局部变脸，根据obj的类型来调整target的类型
  let i,
    target = utilDeepCopy.isType(obj, 'array') ? [] : {},
    value,
    valueType;
  for (i in obj) {
    value = obj[i];
    valueType = utilDeepCopy.getType(value);
    //只有在明确执行深复制，并且当前的value是数组或对象的情况下才执行递归复制
    if (deep && (valueType === 'array' || valueType === 'object')) {
      target[i] = deepFullCopy(value);
    } else {
      target[i] = value;
    }
  }
  return target;
}
//对象列表，通过对象唯一属性，去掉重复的项目：conditionValue
export function uniquelizeArray(t, index) {
  const tmp = {},
    ret = [];
  for (let i = 0, j = t.length; i < j; i++) {
    if (!tmp[t[i][index]]) {
      tmp[t[i][index]] = 1;
      ret.push(t[i]);
    }
  }
  return ret;
}

//节流函数
//一般用户输入框
export function superThrottle(fn, delay, mustRunDelay) {
  let timer = null;
  let t_start;
  return function () {
    let context = this;
    let args = arguments;
    let t_curr = +new Date();
    clearTimeout(timer);
    if (!t_start) {
      t_start = t_curr;
    }
    if (t_curr - t_start >= mustRunDelay) {
      fn.apply(context, args);
      t_start = t_curr;
    } else {
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    }
  };
}

//检测空对象
export function isEmptyObj(obj) {
  let name;
  for (name in obj) {
    return false;
  }
  return true;
}
//从url中获取参数
//参数选填，不填就获取当前地址
//使用方式：var Request = new UrlSearch();
export function UrlSearch(url) {
  let name, value;
  let str = url ? url : window.location.href; //取得整个地址栏
  let num = str.indexOf('?');
  str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]
  let arr = str.split('&'); //各个参数放到数组里
  for (let i = 0; i < arr.length; i++) {
    num = arr[i].indexOf('=');
    if (num > 0) {
      name = arr[i].substring(0, num);
      value = arr[i].substr(num + 1);
      this[name] = value;
    }
  }
}

//验证是否是ip
export function isValidIP(ip) {
  let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  return reg.test(ip);
}

/**
 * 检测用户是否具有某种权限
 * @param authoritys  用户的所有权限 user.pageRoles
 * @param authority  是否具有这个权限 ROLE_TENANT_ADMIN
 * @return boolean
 */
export function hasAuthority(authoritys, authority) {
  for (let i = 0; i < authoritys.length; i++) {
    if (authoritys[i] === authority) {
      return true;
    }
  }
  return false;
}

/**
 * 超过一定限制的字符就截取
 * @param length 开始截取的长度
 * @param string 字符串
 * @return obj 返回的对象，包含源字符串与截取后的
 */
export function fitText(string, length) {
  const obj = {
    origin: string,
    text: false,
  };
  if (string === '' || string === null || string === undefined) {
    return obj;
  }
  if (string && string.length > length) {
    obj.text = string.substr(0, length);
  }
  return obj;
}

/**
 * 简化的国际化方法
 * @param id
 * @param values
 * @return {XML}
 */
export function messages(id, values = {}) {
  let result = app.getState().languages.languages[id];
  //#代表没找到
  if (result === undefined) {
    return '#';
  }
  //匹配 {*} 格式
  result = result.replace(/\{(.*?)\}/g, (target, $1) => {
    let replacement = false;
    //values内寻找是否有值，否则不替换
    Object.keys(values).map(key => {
      if (key === $1) replacement = values[key];
    });
    return replacement === undefined ? target : replacement;
  });
  return result;
}

/**
 * 简化的国际化方法
 * @param id
 * @param values
 * @return {XML}
 */
export function formatMessage(obj, values = {}) {
  if (!configureStore.store.getState)
    //如果没有store，初始化
    configureStore.reduxStore();
  let result = configureStore.store.getState().main.language.messages[obj.id];
  //#代表没找到
  if (result === undefined) {
    return '#';
  }
  //匹配 {*} 格式
  result = result.replace(/\{(.*?)\}/g, (target, $1) => {
    let replacement = false;
    //values内寻找是否有值，否则不替换
    Object.keys(values).map(key => {
      if (key === $1) replacement = values[key];
    });
    return replacement === undefined ? target : replacement;
  });
  return result;
}

/**
 * 产生随机 id
 * @param length 长度
 * @return obj 字符串
 */
export function randomString(length) {
  let id = '';
  let chars = 'ABCDEFGHiJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * 60));
  }
  return id;
}
//
/**
 * 根据语言代码获取语言名称
 * @param code 语言国际化代码，zh_cn,en等
 * @param languageList 多语言列表,后端返回的
 * @return name 字符串
 */
export function getLanguageName(code, languageList) {
  if (code) {
    let name = '';
    languageList.map(item => {
      if (code.toLowerCase() === item.code.toLowerCase()) {
        name = item.comments;
      }
    });
    return name;
  } else {
    return '简体中文';
  }
}

//获取浏览器名称与版本
//直接这样获取，并不是很准确
// let browser = navigator.appName
// let version = navigator.appVersion
// 针对主流浏览器，详细给出名称
export function getBrowserInfo() {
  let userAgent = window.navigator.userAgent; //取得浏览器的userAgent字符串
  let isOpera = userAgent.indexOf('Opera') > -1;
  let re = {
    name: window.navigator.appName,
    version: parseFloat(window.navigator.appVersion),
  };
  if (isOpera) {
    ////判断是否Opera浏览器
    re.name = 'Opera';
    return re;
  }
  if (userAgent.indexOf('Firefox') > -1) {
    //判断是否Firefox浏览器
    re.name = 'Firefox';
    return re;
  }
  if (userAgent.indexOf('Chrome') > -1) {
    //判断是否Chrome浏览器
    re.name = 'Chrome';
    return re;
  }
  if (userAgent.indexOf('Safari') > -1) {
    //判断是否Safari浏览器
    re.name = 'Safari';
    return re;
  }
  if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
    re.name = 'IE';
    return re;
  }
  return re;
}

//删除数组对象
export function removeArryItem(arr, obj) {
  let index = arr.indexOf(obj);
  if (~index) {
    arr.splice(index, 1);
  }
}

//金额变动
export function invoiceAmountChange(isChange, amount) {
  let _this = React.Component.prototype;
  if (isChange) {
    return (
      <span className="money-cell" style={{ color: '#FD9828' }}>
        {messages('common.change')} {_this.filterMoney(amount, 2, true)}
      </span>
    );
  } else {
    return _this.filterMoney(amount);
  }
}
//获取审批历史
export function getApprovelHistory(id) {
  return constants.approvelHistory.filter(item => item.id === id)[0] || {};
}

function renderExpandedRow(title, content) {
  return (
    <div>
      <span>{title}</span>
      {content && <span>:{content}</span>}
    </div>
  );
}
//处理列表标签
export function dealListTag(record, type) {
  let result = [];
  if (record.warningList) {
    let warningList = JSON.parse(record.warningList);
    let content = '';
    warningList.map(item => {
      if (item.showFlag) {
        content += item.title + '/';
      }
    });
    content &&
      result.push(
        renderExpandedRow(messages('common.label'), content.substr(0, content.length - 1))
      );
  }
  if (record.printFree) {
    result.push(renderExpandedRow(messages('common.print.free'), messages('common.print.require')));
  }
  if (record.noticeFlag) {
    result.push(
      renderExpandedRow(
        messages('finance.view.column.notice'),
        messages('finance.view.column.noticeContent')
      )
    );
  }
  if (result.length > 0) {
    return result;
  } else {
    return null;
  }
}
/*计算方法，防止浮点数*/
export function addCalculate(a, b) {
  let c, d, e;
  try {
    c = a.toString().split('.')[1].length;
  } catch (f) {
    c = 0;
  }
  try {
    d = b.toString().split('.')[1].length;
  } catch (f) {
    d = 0;
  }
  return (e = Math.pow(10, Math.max(c, d))), (mulCalculate(a, e) + mulCalculate(b, e)) / e;
}

export function subCalculate(a, b) {
  let c, d, e;
  try {
    c = a.toString().split('.')[1].length;
  } catch (f) {
    c = 0;
  }
  try {
    d = b.toString().split('.')[1].length;
  } catch (f) {
    d = 0;
  }
  return (e = Math.pow(10, Math.max(c, d))), (mulCalculate(a, e) - mulCalculate(b, e)) / e;
}

export function mulCalculate(a, b) {
  let c = 0,
    d = a.toString(),
    e = b.toString();
  try {
    c += d.split('.')[1].length;
  } catch (f) { }
  try {
    c += e.split('.')[1].length;
  } catch (f) { }
  return (Number(d.replace('.', '')) * Number(e.replace('.', ''))) / Math.pow(10, c);
}

export function divCalculate(a, b) {
  let c,
    d,
    e = 0,
    f = 0;
  try {
    e = a.toString().split('.')[1].length;
  } catch (g) { }
  try {
    f = b.toString().split('.')[1].length;
  } catch (g) { }
  return (
    (c = Number(a.toString().replace('.', ''))),
    (d = Number(b.toString().replace('.', ''))),
    mulCalculate(c / d, Math.pow(10, f - e))
  );
}
//获取URL问号后面参数
export function getQueryUrlParam(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var href = window.location.href;
  var r = href.substr(href.toString().indexOf('?') + 1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return '';
}
//处理筛选缓存数据
export function dealCache(searchForm, resultValues) {
  searchForm.map(search => {
    if (search.type === 'items') {
      search.items.map(item => {
        resultValues[`${item.id}Lable`] = resultValues[item.id];
        item.defaultValue = resultValues[`${item.id}Lable`];
      });
    } else {
      search.defaultValue = resultValues[`${search.id}`];
      if (resultValues[`${search.id}Expand`])
        search[`${search.id}Expand`] = resultValues[`${search.id}Expand`];
      if (resultValues[`${search.id}Option`]) search.options = resultValues[`${search.id}Option`];
    }
  });
  searchForm.expand = resultValues.expand;
}
