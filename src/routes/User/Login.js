/**
 * Created by zaranengap on 2017/7/3.
 */
import React from 'react';
import { connect } from 'dva';
import { Input, message, Tabs, Modal, Button, Spin, Row, Col } from 'antd';
const Search = Input.Search;
// import httpFetch from 'share/httpFetch'

import Parallax from 'parallax-js';
// import baseService from 'share/base.service'
// import errorMessage from 'share/errorMessage'
// import { redirect_by_url_for_mail_approve, sso_huilianyi, redirect_by_url_for_approval_route } from 'components/method/sso';
// import {UrlSearch,messages} from 'share/common';
import 'styles/login.less';
import config from 'config';
// import configureStore from 'stores'

import { messages, isUrl } from '../../utils/utils';

const TabPane = Tabs.TabPane;
import BG from 'images/login/BG.jpg';
import logo from 'images/login/logo.png';
import layer1 from 'images/login/layer01.png';
import layer2 from 'images/login/layer02.png';
import layer3 from 'images/login/layer03.png';
// import {setAuthToken} from "actions/main";
// import QrCode from 'qrcode.react';
// import StopAnnonuce from 'components/Template/stop-annonuce/stop-annonuce';
// import StopAnnounceService from 'components/Template/stop-annonuce/stop-annonuce.service';
// import LoginService from 'containers/login.service';
let requestTimer = false;
import moment from 'moment';
import StopAnnounceImage from 'images/stop-annonuce.png';
// import ShowPasswordRule from 'components/Template/show-password-rule/show-password-rule';
// import ResetPasswordService from "components/Template/reset-password/reset-password.service";

import request from '../../utils/request';
import axios from 'axios';
import { getPageQuery } from '../../utils/utils';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import fetch from '../../utils/fetch';
import { getMenuData } from '../../common/menu';
import zh_CN from '../../i18n/zh_CN/index';
import en_US from '../../i18n/en_US/index';

const dynamicWrapper = component => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    return props => {
      return createElement(component().default, {
        ...props,
      });
    };
  }
};

// let codeTime = 60;
//默认的密码规则
const DefaultRule = {
  isNeedLowercase: true,
  isNeedNumber: true,
  isNeedSpecialChar: false,
  isNeedUppercase: false,
  maxLength: 32,
  minLength: 6,
};

@connect(({ login, languages, loading }) => ({
  login,
  languages,
  // submitting: loading.effects['login/login'],
}))
export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rule: DefaultRule,
      showResetPasswordStep1: false,
      showResetPasswordStep2: false,
      loading: false,
      username: '',
      password: '',
      loginType: '',
      client_name: '',
      qcodeValue: null,
      qcodeIsExpired: false,
      scanSuccess: false,

      accountWayLogin: true, //账号登录
      companyWayLogin: false, //公司登录
      companyWayLoginStep: 1, //公司登录第一步
      UUID: null,
      isRightPerson: true, //默认是白名单的人

      login: true, //登录模块
      phoneEmail: false, //输入手机号邮箱模块
      confirmCode: false, //输入验证码模块
      newPassword: false, //输入新密码模块
      type: 'phone', //输入是手机号还是邮箱
      phoneNum: null, //输入的手机号或邮箱地址
      phoneCode: null, //获得的验证码
      firstPassword: null, //第一次输入的新密码
      secondPassword: null, //第二次输入的新密码
      codeTime: 60, //验证码倒数的时间
      copyInterval: null,
      resetThenLogin: false, //点击完确认新密码页面渲染出的登录模块

      title: '', //停机公告：
      content: <div />, //停机公告：
      effectiveDate: '', //停机公告：
      endTime: '', //停机公告：
      visible: false, //停机公告：
      remindFlag: 1, //停机公告：
      announceType: 200, //停机公告：
      isShowedModal: false, //针对停机预告，与维护公告，只展示一次，就不展示了
    };
  }

  $t = id => {
    const {
      languages: { languages },
    } = this.props;

    let result = languages[id];
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

  //直接进入新中控，还是老中控
  //是可以配置的，主要是配置api/tenant/getById接口的返回的字段enableNewControl
  goMainPage = () => {
    if (config.appEnv === 'dist') {
      this.context.router.push(menuRoute.indexUrl);
    } else {
      this.context.router.push(menuRoute.indexUrl);
    }
  };

  // componentWillMount() {
  //   let Request = new UrlSearch(); //实例化
  //   if (Request.mailApprove) {
  //     this.mailApprove(Request);
  //   } else if (Request.approval_route &&
  //     Request.loginType === "authorizationCode" &&
  //     Request.authorizationCode) {
  //     //这种 url 直接通过 authorizationCode 登录，跳转对应页面 task8792；
  //     // {
  //     //   "grant_type":"password",
  //     //   "username":"{authorizationCode}",
  //     //   "loginType":"authorizationCode"
  //     // }
  //     this.setState({
  //       username: Request.authorizationCode,
  //       password: Request.authorizationCode,
  //       loginType: Request.loginType,
  //       client_name: "",
  //     }, () => {
  //       this.login()
  //     })
  //   } else {
  //     if (Request.loginType && Request.code) {
  //       // 另一种企业单点直登录
  //       this.setState({
  //         loginType: Request.loginType,
  //         password: Request.code,
  //         username: Request.code,
  //         client_name: "",
  //       }, () => {
  //         this.login();
  //       })
  //     } else {
  //       this.anyWayLogin(Request);
  //     }
  //   }
  // }

  //邮件审批
  mailApprove = Request => {
    if (localStorage.getItem('hly.token')) {
      //有token的情况
      redirect_by_url_for_mail_approve();
    } else {
      //没有登录需要进行单点登录
      sso_huilianyi(
        data => {
          // sso_huilianyi内部有重定向判断，如果有重定向到其他页面，下面的逻辑不会执行
          baseService.getInfo().then(() => {
            this.setState({ loading: false });
            this.goMainPage();
          });
        },
        err => {
          console.log(err);
          //单点登录，用code登录失败
          message.error(messages('login.error')); //呼，服务器出了点问题，请联系管理员或稍后再试:(
        }
      );
    }
  };

  //各种方式的登录，单点登录，普通登录，单点值登录
  anyWayLogin = Request => {
    if (localStorage.getItem('hly.token')) {
      configureStore.store.dispatch(setAuthToken(JSON.parse(localStorage.getItem('hly.token'))));
      this.setState({ loading: true });
      baseService
        .getInfo()
        .then(() => {
          this.setState({ loading: false });
          this.goMainPage();
        })
        .catch(e => {
          this.setState({ loading: false });
          console.log(e);
          errorMessage(e, messages('login.error'));
        });
    } else {
      //上线的时候记得注释回来
      // this.getQcode();
      //询问哪一种登录方式
      httpFetch
        .loginDecide()
        .then(res => {
          let loginType = res.data;
          if (loginType.loginType === 'sso') {
            //单点直登录
            this.setState({
              loginType: 'sso',
              client_name: '',
            });
            //单点登录
            if (Request.logout_sso) {
            } else {
              //单点登录
              //todo
              //隐藏登录页
              sso_huilianyi(
                data => {
                  baseService.getInfo().then(() => {
                    this.setState({ loading: false });
                    this.goMainPage();
                  });
                },
                err => {
                  console.log(e);
                  //单点登录，用code登录失败
                  message.error(messages('login.error')); //呼，服务器出了点问题，请联系管理员或稍后再试:(
                }
              );
            }
          } else if (loginType.loginType === 'ssoDirect') {
            if (loginType.clientName === 'talefull') {
              //这又是另一种特殊的登录方式
              //截取url当做用户名，截取indate当做密码
              this.setState(
                {
                  username: Request.url,
                  password: Request.indate,
                  loginType: 'ssoDirect',
                  client_name: loginType.clientName,
                },
                () => {
                  this.login();
                }
              );
            } else {
              //单点直登录
              this.setState({
                loginType: 'ssoDirect',
                client_name: loginType.clientName,
              });
            }
          } else {
            //普通登录
            this.setState({
              loginType: '',
              client_name: '',
            });
          }
        })
        .catch(err => {
          //普通登录
          this.setState({
            loginType: '',
            client_name: '',
          });
        });
    }
  };

  componentWillMount() {
    let langType = window.localStorage.getItem('langType') || 'zh_CN';

    if (langType == 'zh_CN') {
      this.props.dispatch({
        type: 'languages/selectLanguage',
        payload: { languages: zh_CN, local: 'zh_CN' },
      });
    } else {
      this.props.dispatch({
        type: 'languages/selectLanguage',
        payload: { languages: en_US, local: 'en_US' },
      });
    }
  }

  componentDidMount() {
    let scene = document.getElementById('scene');
    let parallaxInstance = new Parallax(scene, {
      calibrateX: true,
    });
  }

  inputUsernameHandler = evt => {
    this.setState({
      username: evt.target.value,
      loading: false,
    });
  };

  inputPasswordHandler = evt => {
    this.setState({
      password: evt.target.value,
      loading: false,
    });
  };

  delLoginErr = err => {
    //这个地方要前端一个一个处理，
    //后端说是登录太复杂，情况太多，
    // 对于其他接口，后端给什么错误信息，前端就提示什么错误信息
    let em = err.response.data.error_description;
    //需要添加的提示
    if (err.response.data) {
      if (em === 'User account has expired') {
        // 账号已过期
        message.error(messages('login.has.expired'));
        return;
      }
      if (em === 'user.not.activated') {
        // 您的账号尚未激活, 请使用手机客户端进行激活
        message.error(messages('login.user.not.activated'));
        return;
      }
      if (em === 'Bad credentials') {
        // 密码错误
        message.error(messages('login.Bad.credentials'));
        return;
      }
      if (em === 'email.not.bind') {
        // 邮箱号未绑定
        message.error(messages('login.email.not.bind'));
        return;
      }
      if (em === 'mobile.not.bind') {
        // 手机号未绑定
        message.error(messages('login.mobile.not.bind'));
        return;
      }
      if (em === 'user.not.found') {
        // 用户不存在
        message.error(messages('login.user.not.found'));
        return;
      }
      if (em === 'user.is.locked') {
        // 账号已锁定，请找回密码
        message.error(messages('login.user.is.locked'));
        return;
      }
      if (em === 'related.multi.user') {
        // 该账号关联多个未知用户
        message.error(messages('login.related.multi.user'));
        return;
      }
      if (em === 'user.password.expired') {
        // 密码已过期,请找回密码
        message.error(messages('login.user.password.expired'));
        return;
      }
      if (em === 'user.was.leaved') {
        // 用户已离职
        message.error(messages('login.user.was.leaved'));
        return;
      }
      if (em === 'User is disabled') {
        //单点登录场景
        // 用户未激活
        message.error(messages('login.user.was.disabled'));
        return;
      }
      if (em === 'corp.user.invalid') {
        //单点登录场景
        // 用户名或密码错误
        message.error(messages('login.user.corp.user.invalid'));
        return;
      }
      if (em === 'corp.connection.fail') {
        //单点登录场景
        // 企业登录连接失败
        message.error(messages('login.user.corp.connection.fail'));
        return;
      } else {
        console.log(e);
        //呼，服务器出了点问题，请联系管理员或稍后再试:(
        message.error(messages('login.error'));
      }
    } else {
      message.error(messages('login.error')); //呼，服务器出了点问题，请联系管理员或稍后再试:(
    }
  };

  loginBeforeCheckMachine = () => {
    let username = this.state.username;
    if (this.state.companyWayLogin) {
      if (this.state.username.split('/').length > 1) {
        //截取账号
        username = this.state.username.split('/')[1];
      } else {
        username = this.state.username;
      }
    } else {
      username = this.state.username;
    }
    this.setState({ loading: true });
    httpFetch
      .login(username, this.state.password, this.state.loginType, this.state.client_name)
      .then(() => {
        this.setState({ loading: false });
        //getInfo里面有掉很多接口，有一个接口错误就卡死在登录页面，没有提示
        //这边添加一些错误提示
        baseService
          .getInfo()
          .then(() => {
            // ---下面是邮件审批的逻辑start---
            let Request = new UrlSearch(); //实例化
            if (Request.origin_url_for_mail_approve) {
              redirect_by_url_for_mail_approve();
              return;
              // ---上面是邮件审批的逻辑end---
            } else if (
              Request.approval_route &&
              Request.loginType === 'authorizationCode' &&
              Request.authorizationCode
            ) {
              redirect_by_url_for_approval_route();
              return;
            }

            this.goMainPage();
          })
          .catch(err => {
            //这里出来这几个接口的错误，其中有一个接口错误，错误就会过来
            // this.getCompany(),
            // this.getProfile(),
            // this.getCompanyConfiguration(),
            // this.getIsOldCompany(),
            // this.getLanguageList()
            errorMessage(err.response);
            this.setState({ loading: false });
          });
      })
      .catch(err => {
        this.setState({ loading: false });
        this.delLoginErr(err);
      });
  };

  getStopAnnounce = () => {
    //停机公告之后，同步调用运维公告
    let account = this.state.username;
    StopAnnounceService.getOperationAnnouncements(null, null, account, null)
      .then(res => {
        let data = res.data;
        if (data && data.title) {
          this.setInitStateModal(data);
        } else {
          this.setInitState();
        }
      })
      .catch(() => {
        this.setInitState();
      });
  };
  setInitState = () => {
    this.setState(
      {
        title: '',
        content: <div />,
        effectiveDate: '',
        endTime: '',
        visible: false,
        remindFlag: 1,
        announceType: 200,
      },
      () => {
        this.loginBeforeCheckMachine();
      }
    );
  };
  //显示模态框，针对预告与维护公告类型，需要记录状态
  setInitStateModal = data => {
    let visible = false;
    if (data.type === 100) {
      //如果是停机，弹窗显示，不用记录isShowedModal
      visible = true;
      this.state.isShowedModal = false;
    } else {
      if (this.state.isShowedModal) {
        //如果已经提示过，就不要提示了
        visible = false;
      } else {
        visible = true;
      }
      //记录模态框已经提示
      this.state.isShowedModal = true;
    }
    this.setState({
      title: data.title,
      content: data.content,
      effectiveDate: moment(data.effectiveDate).format('YYYY-MM-DD HH:mm'),
      endTime: moment(data.endTime).format('YYYY-MM-DD HH:mm'),
      visible: visible,
      remindFlag: data.remindFlag,
      announceType: data.type,
    });
  };

  //登录之前是否是白名单的用户
  getIsWhiteList = login => {
    StopAnnounceService.getIsWhiteList(login)
      .then(res => {
        let data = res.data;
        if (data.result === 'false') {
          this.setState(
            {
              isRightPerson: false,
            },
            () => {
              this.getStopAnnounce();
            }
          );
        } else {
          this.setState(
            {
              isRightPerson: true,
            },
            () => {
              //是白名单用户，运行进入
              this.loginBeforeCheckMachine();
            }
          );
        }
      })
      .catch(err => {
        //白名单发送错误，尝试让用户登录
        this.setState(
          {
            isRightPerson: true,
          },
          () => {
            //接口错误，只能让用户进入
            this.loginBeforeCheckMachine();
          }
        );
      });
  };

  login = (err, values) => {
    const { type, username, password } = this.state;

    const { dispatch } = this.props;

    this.setState({ loading: true });

    let data = {
      scope: 'read write',
      grant_type: 'password',
      username: username,
      password: password,
    };

    const formData = new FormData();

    Object.keys(data).map(key => {
      formData.append(key, data[key]);
    });

    axios({
      url: '/auth/oauth/token',
      method: 'POST',
      headers: {
        'x-helios-client': 'web',
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization:
          'Basic QXJ0ZW1pc1dlYjpuTENud2RJaGl6V2J5a0h5dVpNNlRwUURkN0t3SzlJWERLOExHc2E3U09X',
      },
      data: formData,
    }).then(res => {
      window.localStorage.setItem('token', res.data.access_token);

      Promise.all([this.getMenuList(), this.getUser()]).then(() => {
        this.redirect();
      });
    });
  };

  getMenuList = () => {
    const { routerData, dispatch } = this.props;

    return new Promise((resolve, reject) => {
      fetch.get('/auth/api/userRole/query/user/menuList').then(response => {
        let result = response || [];
        let group = {};

        result.map(item => {
          if (group[item.parentMenuId]) {
            group[String(item.parentMenuId)].push(item);
          } else {
            group[String(item.parentMenuId)] = [item];
          }
        });

        result = result.filter(o => o.parentMenuId == 0);

        this.getChildren(group, result, 1, routerData);

        result = this.formatter(result);

        let menus = getMenuData();

        dispatch({
          type: 'menu/setMenu',
          payload: { menuList: [...menus, ...result], routerData },
        });

        resolve();

        //this.redirect();
      });
    });
  };

  getChildren = (group, result, level, routerData, parent = {}) => {
    result.map(item => {
      item.children = group[item.id];
      item.level = level;
      item.name = item.menuName;
      item.icon = level > 1 ? '' : item.menuIcon;

      if (item.fromSource == 'FILE') {
        item.path = item.menuUrl;
      } else {
        if (!parent.path) {
          item.path = '/view/' + item.id;
        } else {
          item.path = parent.path + '/' + item.id;
        }
        if (!item.children || !item.children.length) {
          routerData[(parent.path || '/view') + '/:id'] = {
            name: item.name,
            component: dynamicWrapper(() => import('../../routes/View/index')),
            level: level,
          };
        }
      }

      this.getChildren(group, item.children || [], level + 1, routerData, item);
    });
  };

  redirect = () => {
    const { dispatch } = this.props;
    const urlParams = new URL(window.location.href);
    const params = getPageQuery();

    let { redirect } = params;

    if (redirect) {
      const redirectUrlParams = new URL(redirect);
      if (redirectUrlParams.origin === urlParams.origin) {
        redirect = redirect.substr(urlParams.origin.length);
        if (redirect.startsWith('/#')) {
          redirect = redirect.substr(2);
        }
      } else {
        window.location.href = redirect;
        return;
      }
    }

    this.setState({ submitting: false });

    if (redirect && redirect.indexOf('/user/login') >= 0) {
      redirect = '/dashboard';
    }

    dispatch(
      routerRedux.replace({
        pathname: redirect || '/dashboard',
      })
    );
  };

  getUser = () => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      let result = await fetch.get('/api/account');

      dispatch({
        type: 'user/saveCurrentUser',
        payload: result,
      });

      await this.getCompany();
      await this.getLanguage(result);
      await this.getLanguageType();

      resolve();
    });
  };

  getCompany = () => {
    const { dispatch } = this.props;

    return new Promise(async (resolve, reject) => {
      let result = await fetch.get('/api/my/companies');

      dispatch({
        type: 'user/saveCompany',
        payload: result,
      });

      resolve();
    });
  };

  getLanguage = user => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      let local = user.language;

      fetch
        .get('/auth/api/frontKey/query/keyword?lang=' + local || 'zh_CN', { page: 0, size: 99999 })
        .then(res => {
          let languages = {};

          res.map(item => {
            languages[item.keyCode] = item.descriptions;
          });

          if (!local) {
            window.localStorage.setItem('local', 'zh_CN');
            local = 'zh_CN';
          } else {
            window.localStorage.setItem('local', local);
          }

          if (local == 'zh_CN') {
            languages = { ...languages, ...zh_CN };
          } else {
            languages = { ...languages, ...en_US };
          }

          dispatch({
            type: 'languages/selectLanguage',
            payload: { languages: languages, local: local },
          });

          resolve();
        });
    });
  };

  getLanguageType = () => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      fetch.get('/auth/api/language/query').then(res => {
        dispatch({
          type: 'languages/setLanguageType',
          payload: { languageType: res },
        });

        resolve();
      });
    });
  };

  formatter = (data, parentPath = '/', parentAuthority) => {
    return data.map(item => {
      let { path } = item;
      if (!isUrl(path)) {
        path = parentPath + item.path;
      }
      const result = {
        ...item,
        path,
        authority: item.authority || parentAuthority,
      };
      if (item.children) {
        result.children = this.formatter(
          item.children,
          `${parentPath}${item.path}/`,
          item.authority
        );
      }
      return result;
    });
  };

  //点击忘记密码
  forgetPassword = () => {
    this.setState({
      phoneEmail: true,
    });
    // location.href = location.origin + '/old/#/forgetPassword';
  };
  loginWayChange = key => {
    requestTimer = false;
    if ('qcode' === key) {
      this.getQcode();
    }
  };
  getQcode = () => {
    this.setState({
      qcodeIsExpired: false,
      scanSuccess: false,
    });
    httpFetch
      .getQcode()
      .then(res => {
        let Request = new UrlSearch(res.data.link); //实例化
        this.setState(
          {
            qcodeValue: res.data.link,
            UUID: Request.UUID,
          },
          () => {
            requestTimer = true;
            this.requestIsScan(Request.UUID);
          }
        );
      })
      .catch(() => {
        // 获取二维码错误
        message.error(messages('login.qcode.loading.qcode.err'));
      });
  };

  //二维码已经过期
  renderQcodeIsExpired = () => {
    if (this.state.qcodeIsExpired) {
      return (
        <div>
          <div className="qcode-middle-tips">
            {/*二维码已经过期*/}
            {messages('login.qcode.expired')}
          </div>
          <div className="qcode-middle-btn">
            <Button type="primary" size="small" onClick={this.getQcode}>
              {/*重新获取*/}
              {messages('login.qcode.refresh')}
            </Button>
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  };

  //扫描成功
  renderScanSuccess = () => {
    if (this.state.scanSuccess) {
      return (
        <div className="qcode-bottom-tips">
          {/*二维码扫描成功*/}
          {messages('login.qcode.scan.success')}
        </div>
      );
    } else {
      return <div />;
    }
  };
  //渲染二维码
  renderQcodeValue = () => {
    let className = 'qcode-img-wrap';
    if (this.state.qcodeIsExpired) {
      className = 'qcode-img-wrap qcode-img-wrap-expired';
    } else {
      className = 'qcode-img-wrap';
    }
    if (this.state.qcodeValue) {
      return (
        <div className={className}>
          <QrCode value={this.state.qcodeValue} renderAs={'svg'} fgColor={'#000000'} size={220} />
        </div>
      );
    } else {
      return (
        <div>
          {/*正在加载二维码...*/}
          {messages('login.qcode.loading.qcode')}
        </div>
      );
    }
  };
  //
  renderQcodeValueText = () => {
    if (this.state.qcodeValue && !this.state.scanSuccess) {
      return (
        <div className="qcode-bottom-tips">
          {/*请使用汇联易APP扫描登录*/}
          {messages('login.qcode.please.scan')}
        </div>
      );
    } else {
      return <div />;
    }
  };

  //轮询是否已经扫描
  requestIsScan = uuid => {
    let that = this;
    if (requestTimer) {
      httpFetch
        .getQcodeAuthorization(uuid)
        .then(res => {
          that.requestIsScan(this.state.UUID);
          if (res.data) {
            that.setState({
              qcodeIsExpired: false,
              scanSuccess: false,
            });
            if (res.data.status === 'INITIAL') {
            }
            if (res.data.status === 'WAITING') {
              //用户扫描了，未确认
              that.setState({
                scanSuccess: true,
              });
            }
            if (res.data.status === 'LOGGED') {
              //登录成功
              // let expiredAt = new Date();
              // let token = {
              //   access_token: res.data.accessToken.access_token,
              //   expires_in: res.data.accessToken.expires_in,
              //   refresh_token: res.data.accessToken.refresh_token
              // };
              // expiredAt.setSeconds(expiredAt.getSeconds() + token.expires_in);
              // token.expires_at = expiredAt.getTime();
              // configureStore.store.dispatch(setAuthToken(token));
              // localStorage.setItem('hly.token', JSON.stringify(token));
              // window.location.href = "/";
              //后端改逻辑，用下面这种方式进行登录，之前是直接获取token
              that.setState(
                {
                  username: res.data.userOID,
                  loginType: 'app',
                  password: '', //密码说是可以不传
                },
                () => {
                  that.login();
                }
              );
            }
          } else {
            that.setState({
              qcodeIsExpired: true,
            });
            requestTimer = false;
          }
        })
        .catch(() => {
          that.setState({
            qcodeIsExpired: true,
          });
          requestTimer = false;
        });
    }
  };
  switchCompanyLogin = () => {
    this.setState({
      accountWayLogin: false, //账号登录
      companyWayLogin: true, //公司登录
      companyWayLoginStep: 1, //公司登录第一步
    });
  };
  switchAccountLogin = () => {
    this.setState({
      accountWayLogin: true, //账号登录
      companyWayLogin: false, //公司登录
      companyWayLoginStep: 1, //公司登录第一步
    });
  };

  companyNextStep = () => {
    let Request = new UrlSearch(); //实例化

    let username = this.state.username;
    var redirect_url = window.location.href + '?loginType=sso';

    httpFetch
      .loginDecideV2(username, redirect_url)
      .then(res => {
        //返回结果实例
        // {
        //     "loginUrl": "xxxxxxxxxx",//直接跳转
        //     "loginType":"sso/ssoDirect",
        //     "loginClient":"handdir"
        // }
        let loginType = res.data;

        if (loginType.message && loginType.message.length > 0) {
          message.warn(loginType.message);
        }

        if (loginType.code) {
          //如果有错误，才有这个字段，否则没有这个字段
          // 详情见 bug 15533
          return;
        }

        if (loginType.loginType === 'sso' && loginType.loginUrl) {
          //关键是这种方式，需要直接跳转URL
          window.location.href = loginType.loginUrl;
        } else if (loginType.loginType === 'ssoDirect') {
          if (loginType.clientName === 'talefull') {
            //这又是另一种特殊的登录方式
            //截取url当做用户名，截取indate当做密码
            this.setState(
              {
                username: Request.url,
                password: Request.indate,
                loginType: 'ssoDirect',
                client_name: loginType.clientName,
              },
              () => {
                this.login();
              }
            );
          } else {
            //单点直登录
            this.setState({
              loginType: 'ssoDirect',
              client_name: loginType.clientName,
              companyWayLoginStep: 2, //公司登录第er步
            });
          }
        } else {
          //普通登录
          this.setState({
            loginType: '',
            client_name: '',
            companyWayLoginStep: 2, //公司登录第er步
          });
        }
      })
      .catch(err => {});
  };

  renderAccountWayLoginEnter = () => {
    if (this.state.accountWayLogin) {
      return this.renderAccountWayLogin();
    } else {
      return this.renderCompanyWayLogin();
    }
  };

  renderAccountWayLogin = () => {
    const { phoneNum } = this.state;
    return (
      <div>
        <Input
          size="large"
          placeholder={this.$t('login.username')} //用户名
          onChange={this.inputUsernameHandler}
        />
        <br />
        <Input
          size="large"
          type="password"
          placeholder={this.$t('login.password')} //密码
          onChange={this.inputPasswordHandler}
          onPressEnter={this.login}
        />
        <br />
        <div>
          <div className="f-left company-login" onClick={this.switchCompanyLogin}>
            {/*企业登录*/}
            {this.$t('login.user.company.login')}
          </div>
          <div className="f-right forget-password" onClick={this.findPassword}>
            {this.$t('login.forget')}
          </div>
          <div className="clear" />
        </div>
        <br />
        <Button type="primary" size="large" onClick={this.login} loading={this.state.loading}>
          {/*登录*/}
          {this.$t('login.login')}
        </Button>
      </div>
    );
  };
  //渲染企业登录
  renderCompanyWayLogin = () => {
    if (this.state.companyWayLoginStep === 1) {
      return <div>{this.renderCompanyWayLoginStep1()}</div>;
    } else {
      return <div>{this.renderCompanyWayLoginStep2()}</div>;
    }
  };

  //渲染企业登录：第一步
  renderCompanyWayLoginStep1 = () => {
    return (
      <div>
        <Input
          className="company-login-tip-inp"
          size="large"
          placeholder={messages('login.user.company.login.tip')} //格式：code/account或者邮箱
          onChange={this.inputUsernameHandler}
        />
        <div>
          <div className="f-left company-login" onClick={this.switchAccountLogin}>
            {/*普通登录*/}
            {messages('login.user.account.login')}
          </div>
          <div className="clear" />
        </div>
        <br />
        <Button
          type="primary"
          size="large"
          loading={this.state.loading}
          onClick={this.companyNextStep}
        >
          {/*下一步*/}
          {messages('login.user.next.step')}
        </Button>
      </div>
    );
  };
  //渲染企业登录：第二步
  renderCompanyWayLoginStep2 = () => {
    return (
      <div>
        <div>
          <Input
            size="large"
            type="password"
            placeholder={messages('login.password')} //密码
            onChange={this.inputPasswordHandler}
            onPressEnter={this.login}
          />
          <div>
            <div className="f-left company-login" onClick={this.switchAccountLogin}>
              {/*普通登录*/}
              {messages('login.user.account.login')}
            </div>
            <div className="clear" />
          </div>
          <br />
          <Button type="primary" size="large" onClick={this.login} loading={this.state.loading}>
            {/*登录*/}
            {messages('login.login')}
          </Button>
        </div>
      </div>
    );
  };
  //点击弹窗关闭按钮
  handleCancel = () => {
    this.setState({
      visible: false,
    });
    this.gotoRightPageByType();
  };
  //点击知道了按钮
  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.gotoRightPageByType();
  };

  //根据公告类型，去相应的页面
  gotoRightPageByType = () => {
    //根据公告类型，去相应的页面
    if (this.state.announceType === 100) {
      //停机类型
      //如果不是白名单的人去登录页
      if (!this.state.isRightPerson && this.state.remindFlag === 2) {
        //正在停机
      } else {
        //停机预告
        this.loginBeforeCheckMachine();
      }
    } else {
      //运维类型
      //停留当前页
      //不要考虑remindFlag==2
      this.loginBeforeCheckMachine();
    }
  };

  //渲染账号登陆
  renderAccountLogin = () => {
    const { login } = this.state;
    if (login) {
      return (
        <div>
          <div className="account-class-wrap">{this.renderAccountWayLoginEnter()}</div>

          <div className="message">
            <div className="no-account">{messages('login.no.account')}</div>
            <div className="phone-number">400-829-7878</div>
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  };
  //渲染二维码登陆与账号登陆
  //这个函数请保留，不要动，二维码登陆下次上线
  renderAccountAndQcodeLogin = () => {
    return (
      <Tabs defaultActiveKey="qcode" size="large" onChange={this.loginWayChange}>
        <TabPane
          tab={messages('login.qcode.qlogin')} //二维码登录
          key="qcode"
          className="qcode-class"
        >
          <div className="qcode-class-wrap">
            {this.renderQcodeValue()}
            {this.renderQcodeIsExpired()}
            {this.renderQcodeValueText()}
            {this.renderScanSuccess()}
          </div>
        </TabPane>
        <TabPane
          tab={messages('login.qcode.account.login')} //账号登录
          key="account"
          className="account-class"
        >
          <div className="account-class-wrap">{this.renderAccountWayLoginEnter()}</div>

          <div className="message">
            <div className="no-account">{messages('login.no.account')}</div>
            <div className="phone-number">400-829-7878</div>
          </div>
        </TabPane>
      </Tabs>
    );
  };

  //找回密码时 点击下一步和确认新密码时
  findPassword = () => {
    this.setState({
      login: false,
      phoneEmail: true,
      confirmCode: false,
      newPassword: false,
      resetThenLogin: false,
    });
  };

  //找回密码时请输入手机号、邮箱这一步
  inputPhoneEmail = () => {
    const { phoneEmail } = this.state;
    if (phoneEmail) {
      return (
        <div>
          <div className="find-password">
            {/*找回密码*/}
            {messages('login.forget')}
          </div>
          <br />
          <Input
            size="large"
            placeholder={messages('login.phone.email')} ///*'请输入手机号/邮箱'*/
            onChange={this.inputPhoneEmailChange}
          />
          <Button
            type="primary"
            size="large"
            loading={this.state.loading}
            onClick={this.inputPhoneEmailNext}
          >
            {/*下一步*/}
            {messages('my.contract.next')}
          </Button>
          <br />
          <div className="back-login" onClick={this.backLogin}>
            {/*返回登录*/}
            <a>{messages('login.back.login')}</a>
          </div>
          <div className="message">
            <div className="no-account">{messages('login.no.account')}</div>
            <div className="phone-number">400-829-7878</div>
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  };

  backLogin = () => {
    clearInterval(this.state.copyInterval);
    this.setState({
      login: true,
      phoneEmail: false,
      confirmCode: false,
      newPassword: false,
    });
  };
  //输入手机号或者邮箱时
  inputPhoneEmailChange = e => {
    this.setState({
      phoneNum: e.target.value,
      loading: false,
    });
  };

  //输完手机号点击下一步
  inputPhoneEmailNext = () => {
    this.setState({
      loading: true,
    });
    const { phoneNum, confirmCode, login } = this.state;
    let phoneReg = new RegExp('^1[0-9]{10}$');
    let emailReg = new RegExp(
      "^[a-z0-9!#$%&'*+\\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$"
    );
    if (phoneReg.test(phoneNum)) {
      LoginService.getConfirmCode(phoneNum, 'phone').then(res => {
        if (res.status === 200) {
          this.setState(
            {
              phoneEmail: false,
              confirmCode: true,
              loading: false,
              type: messages('login.little.phone'), //手机
              codeTime: 60,
            },
            () => {
              let copyInterval = setInterval(() => {
                let codeTime = this.state.codeTime;
                if (codeTime > 0) {
                  codeTime--;
                  this.setState({
                    codeTime,
                    copyInterval: copyInterval,
                  });
                }
                if (codeTime <= 0) {
                  clearInterval(copyInterval);
                }
              }, 1000);
            }
          );
        }
      });
    } else if (emailReg.test(phoneNum)) {
      LoginService.getConfirmCode(phoneNum, 'email').then(res => {
        if (res.status === 200) {
          this.setState(
            {
              phoneEmail: false,
              loading: false,
              confirmCode: true,
              type: messages('login.little.email'), //邮箱
              codeTime: 60,
            },
            () => {
              let copyInterval = setInterval(() => {
                let codeTime = this.state.codeTime;
                if (codeTime > 0) {
                  codeTime--;
                  this.setState({
                    codeTime,
                    copyInterval: copyInterval,
                  });
                }
                if (codeTime <= 0) {
                  clearInterval(copyInterval);
                }
              }, 1000);
            }
          );
        }
      });
    } else {
      message.error(messages('login.correct.phone.email')); /*'请输入正确的手机号或邮箱地址'*/
    }
  };

  //输入验证码这一步
  enterConfirmCode = () => {
    const { confirmCode, codeTime, type, phoneNum } = this.state;
    if (confirmCode) {
      return (
        <div>
          <div className="find-password">
            {/*'找回密码'*/}
            {messages('login.forget')}
          </div>
          <br />
          <div
            dangerouslySetInnerHTML={{
              __html: messages('login.sent.confirm.code', { phoneNum: phoneNum, type: type }),
            }}
            style={{ textAlign: 'left' }}
          />
          <Row>
            <Col span={17}>
              <Input
                size="large"
                style={{ width: 220 }}
                placeholder={messages('login.enter.confirm.code')} ///*'请输入验证码'*/
                onChange={this.enterConfirmCodeChange}
              />
            </Col>
            <Col span={7}>
              <div style={{ width: 90, height: 40, background: 'white' }}>
                {codeTime === 0 ? (
                  <span
                    style={{ display: 'inline-block', marginTop: 10, cursor: 'pointer' }}
                    onClick={this.inputPhoneEmailNext}
                  >
                    {messages('login.receive.again')}
                  </span>
                ) : (
                  <span style={{ display: 'inline-block', marginTop: 10 }}>{codeTime}&nbsp;S</span>
                )}
              </div>
            </Col>
          </Row>
          <Button
            type="primary"
            size="large"
            loading={this.state.loading}
            onClick={this.enterConfirmCodeNext}
          >
            {/*下一步*/}
            {messages('my.contract.next')}
          </Button>
          <div className="back-login" onClick={this.backLogin}>
            {/*返回登录*/}
            <a>{messages('login.back.login')}</a>
          </div>
          <div className="message">
            <div className="no-account">{messages('login.no.account')}</div>
            <div className="phone-number">400-829-7878</div>
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  };

  //输入验证码时
  enterConfirmCodeChange = e => {
    this.setState({
      phoneCode: e.target.value,
    });
  };

  //输完验证码点击下一步
  enterConfirmCodeNext = () => {
    this.setState({
      loading: true,
    });
    const { phoneNum, phoneCode } = this.state;
    LoginService.judgeConfirmCode(phoneNum, phoneCode)
      .then(res => {
        this.setState({
          confirmCode: false,
          newPassword: true,
          loading: false,
        });
        LoginService.getPasswordRule(phoneNum)
          .then(res => {
            clearInterval(this.state.copyInterval);
            this.setState({
              rule: res.data,
              loading: false,
            });
          })
          .catch(res => {
            this.setState({
              loading: false,
            });
          });
      })
      .catch(res => {
        this.setState({
          loading: false,
        });
      });
  };

  //输入新密码这一步
  enterNewPassword = () => {
    const { newPassword } = this.state;
    if (newPassword) {
      return (
        <div>
          <div className="find-password">
            {/*找回密码*/}
            {messages('login.forget')}
          </div>
          <br />
          <div className="find-password-note">
            <ShowPasswordRule rule={this.state.rule} />
            {/*请输入您的新密码(6-20位的数字英文组合,字母区分大小写)*/}
          </div>
          <Input
            size="large"
            type="password"
            placeholder={messages('login.enter.first.password')} ///*请输入新密码*/
            onChange={this.enterNewPasswordChange}
          />
          <br />
          <Input
            size="large"
            type="password"
            placeholder={messages('login.enter.second.password')} ///*再次输入新密码*/
            onChange={this.confirmNewPasswordChange}
          />
          <br />
          <Button type="primary" size="large" onClick={this.confirmNewPassword}>
            {/*确认新密码*/}
            {messages('reset-password.confirm.password')}
          </Button>
          <br />
          <div className="back-login" onClick={this.backLogin}>
            {/*返回登录*/}
            <a>{messages('login.back.login')}</a>
          </div>
          <div className="message">
            <div className="no-account">{messages('login.no.account')}</div>
            <div className="phone-number">400-829-7878</div>
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  };

  resetThenLogin = () => {
    const { resetThenLogin, phoneNum } = this.state;
    if (resetThenLogin) {
      return (
        <div>
          <Input
            defaultValue={phoneNum}
            size="large"
            placeholder={messages('login.username')} //用户名
            onChange={this.inputUsernameHandler}
          />
          <br />
          <Input
            size="large"
            type="password"
            placeholder={messages('login.password')} //密码
            onChange={this.inputPasswordHandler}
            onPressEnter={this.login}
          />
          <br />
          <div>
            <div className="f-left company-login" onClick={this.switchCompanyLogin}>
              {/*企业登录*/}
              {messages('login.user.company.login')}
            </div>
            <div className="f-right forget-password" onClick={this.findPassword}>
              {messages('login.forget')}
            </div>
            <div className="clear" />
          </div>
          <br />
          <Button type="primary" size="large" onClick={this.login} loading={this.state.loading}>
            {/*登录*/}
            {messages('login.login')}
          </Button>
        </div>
      );
    } else {
      return <div />;
    }
  };
  //点击确认新密码
  confirmNewPassword = () => {
    this.setState({
      loading: true,
    });
    const { phoneNum, phoneCode, firstPassword, secondPassword } = this.state;
    if (firstPassword !== secondPassword) {
      message.error(messages('login.different.password') /*两次输入密码不相同*/);
    } else {
      if (ResetPasswordService.regPasswordByRule(secondPassword, this.state.rule)) {
        LoginService.confirmNewPassword(phoneNum, phoneCode, secondPassword).then(res => {
          if (res.status === 200) {
            this.setState({
              loading: false,
              newPassword: false,
              resetThenLogin: true,
              username: phoneNum,
            });
          }
        });
      }
    }
  };

  //第一次输入新密码时
  enterNewPasswordChange = e => {
    this.setState({
      firstPassword: e.target.value,
    });
  };

  //再次输入新密码时
  confirmNewPasswordChange = e => {
    this.setState({
      secondPassword: e.target.value,
    });
  };

  render() {
    return (
      <div className="login">
        <img src={BG} className="background-img" />
        <div className="login-area">
          <div className="login-logo-text">
            {/*汇联易管理系统*/}
            {this.$t('login.helios.management.system')}
          </div>

          {this.renderAccountLogin()}
          {/* {this.inputPhoneEmail()}
          {this.enterConfirmCode()}
          {this.enterNewPassword()}
          {this.resetThenLogin()} */}
          {/*渲染二维码登陆与账号登陆*/}
          {/*这个函数请保留，不要动，二维码登陆下次上线*/}
          {/*{this.renderAccountAndQcodeLogin()}*/}
        </div>
        <div id="scene">
          <img src={logo} className="img-logo" />
          <div data-depth="0.2">
            <img src={layer1} />
          </div>
          <div data-depth="0.4">
            <img src={layer2} />
          </div>
          <div data-depth="0.6">
            <img src={layer3} />
          </div>
        </div>
        <div className="description">
          <div className="description-title">{messages('login.redefine')}</div>
          <div className="description-content">
            {messages('login.slogan1')}
            {/* {this.props.language.locale === 'en' ? (<br />) : null} */}
            {messages('login.slogan2')}
          </div>
        </div>
        <div className="footer">CopyRight 汇联易 | 沪ICP备16047366号</div>
        {/* <StopAnnonuce></StopAnnonuce> */}

        <div className="stop-annonuce-modal-wrap" />
        <Modal
          width={748}
          getContainer={() => {
            return document.getElementsByClassName('stop-annonuce-modal-wrap')[0];
          }}
          className="stop-annonuce-modal-wrap-modal"
          title={null}
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <div className="stop-annonuce">
            <div className="f-left image-wrap">
              <img src={StopAnnounceImage} />
            </div>
            <div className="f-right right-content">
              <div className="title">{this.state.title}</div>
              <div className="content">
                <div>
                  {' '}
                  {this.state.effectiveDate} &nbsp; {messages('stop-announce.to')} &nbsp;{' '}
                  {this.state.endTime}
                </div>
                <div dangerouslySetInnerHTML={{ __html: this.state.content }} />
              </div>
              <div className="btn-wrap">
                <Button type="primary" size="large" onClick={this.handleOk}>
                  {/*好的，我知道了*/}
                  {messages('stop-announce.ok')}
                </Button>
              </div>
            </div>
            <div className="clear" />
          </div>
        </Modal>
      </div>
    );
  }
}

// Login.contextTypes = {
//   router: React.PropTypes.object
// };

// function mapStateToProps(state) {
//   return {
//     language: state.main.language,
//     tenant: state.login.tenant
//   }
// }

// export default Login;
