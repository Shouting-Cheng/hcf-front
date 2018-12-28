import React, { Component, createElement } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import request from '../../utils/request';
import axios from 'axios';
import { getPageQuery } from '../../utils/utils';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import fetch from '../../utils/fetch';
import { getMenuData } from '../../common/menu';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

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

@connect(({ login, loading }) => ({
  login,
  // submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
    submitting: false,
  };

  onTabChange = type => {
    this.setState({ type });
  };

  componentDidMount() {
  }

  handleSubmit = (err, values) => {
    const { type } = this.state;
    const { dispatch } = this.props;
    if (!err) {
      this.setState({ submitting: true });

      let data = {
        scope: 'read write',
        grant_type: 'password',
        username: values.userName,
        password: values.password,
      };

      const formData = new FormData();

      Object.keys(data).map(key => {
        formData.append(key, data[key]);
      });

      axios({
        url: '/oauth/token',
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
        window.sessionStorage.setItem('token', res.data.access_token);

        Promise.all([this.getMenuList(), this.getUser()]).then(() => {
          this.redirect();
        });
      });
    }
  };

  getMenuList = () => {
    const { routerData, dispatch } = this.props;

    return new Promise((resolve, reject) => {
      fetch.get('/api/userRole/query/user/menuList').then(response => {
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

      if (!parent.path) {
        item.path = '/view/' + item.id;
      } else {
        item.path = parent.path + '/' + item.id;
      }
      // item.path = "/view/" + item.parentMenuId + "/" + item.id;
      // item.component = View;
      if (!item.children || !item.children.length) {
        routerData[(parent.path || '/view') + '/:id'] = {
          name: item.name,
          component: dynamicWrapper(() => import('../../routes/View/index')),
          level: level,
        };
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


    if (redirect.indexOf('/user/login') >= 0) {
      redirect = '/';
    }

    dispatch(
      routerRedux.replace({
        pathname: redirect || '/',
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

      await this.getLanguage(result);
      await this.getLanguageType();

      resolve();
    });
  };

  getLanguage = user => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      let local = user.language;

      fetch.get('/api/frontKey/query/keyword?lang=' + local || 'zh_CN', { page: 0, size: 99999 }).then(res => {
        let languages = {};

        res.map(item => {
          languages[item.keyCode] = item.descriptions;
        });

        if (!local) {
          window.localStorage.setItem('local', 'zh_CN');
          local = 'zh_CN';
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
      fetch.get('/api/language/query').then(res => {
        dispatch({
          type: 'languages/setLanguageType',
          payload: { languageType: res },
        });

        resolve();
      });
    });
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login } = this.props;
    const { type, autoLogin, submitting } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <Tab key="account" tab="账户密码登录">
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage('账户或密码错误（admin/888888）')}
            <UserName name="userName" placeholder="13321010000" />
            <Password name="password" placeholder="hly123" />
          </Tab>
          <Tab key="mobile" tab="手机号登录">
            {login.status === 'error' &&
              login.type === 'mobile' &&
              !submitting &&
              this.renderMessage('验证码错误')}
            <Mobile name="mobile" />
            <Captcha name="captcha" />
          </Tab>
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              自动登录
            </Checkbox>
            <a style={{ float: 'right' }} href="">
              忘记密码
            </a>
          </div>
          <Submit loading={submitting}>登录</Submit>
          <div className={styles.other}>
            其他登录方式
            <Icon className={styles.icon} type="alipay-circle" />
            <Icon className={styles.icon} type="taobao-circle" />
            <Icon className={styles.icon} type="weibo-circle" />
            <Link className={styles.register} to="/user/register">
              注册账户
            </Link>
          </div>
        </Login>
      </div>
    );
  }
}
