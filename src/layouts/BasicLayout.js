import React, { Fragment, createElement } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message, Spin, Tabs } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import logo from '../assets/logo.png';
import fetch from '../utils/fetch';
import View from '../routes/View/index';

import zh_CN from "../i18n/zh_CN/index"
import en_US from "../i18n/en_US/index"

import { isUrl } from '../utils/utils';

import 'styles/common.scss'

const TabPane = Tabs.TabPane;
const { Content, Header, Footer } = Layout;
const { AuthorizedRoute, check } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData, routerData) => {
  const result = {};
  const childResult = {};
  for (const i of menuData) {
    if (!routerData[i.path]) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  }
  return Object.assign({}, routerData, result, childResult);
};

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

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

class BasicLayout extends React.Component {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  state = {
    isMobile,
    menus: [],
    routers: [],
    loading: false,
    path: '',
    panes: [],
    activeKey: '',

  };

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(getMenuData(), routerData),
    };
  }

  async componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });

    //如果刷新重新请求所有信息
    if (JSON.stringify(this.props.currentUser) == '{}') {
      this.getALlInfo();
    }

    let panes = this.state.panes;
    let component = this.getContent();

    if (component) {
      let index = panes.findIndex(o => o.routeKey == component.routeKey);

      if (index >= 0) {
      } else {
        panes.push(component);
      }
    }

    this.setState({ panes });
  }

  componentWillReceiveProps(nextProps) {
    // this.getContent();
    let panes = this.state.panes;
    let path = window.location.hash.replace('#', '');

    let index = panes.findIndex(o => o.pathname == path);

    if (index >= 0) {
      this.setState({ activeKey: path });
      return;
    }

    let component = this.getContent();

    if (component) {
      panes.push(component);
      this.setState({ panes, activeKey: component.pathname });
    }
  }

  getALlInfo = () => {
    const { dispatch, routerData } = this.props;

    this.setState({ loading: true });

    Promise.all([this.getMenuList(), this.getUser()]).then(() => {
      this.setState({ loading: false });
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
            component: dynamicWrapper(() => import('../routes/View/index')),
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
    dispatch(
      routerRedux.replace({
        pathname: redirect || '/',
      })
    );
  };

  getUser = () => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      let result = await fetch.get('/api/api/account');
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
      let result = await fetch.get('/api/api/my/companies');

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

      fetch.get('/auth/api/frontKey/query/keyword?lang=' + local || 'zh_CN').then(res => {
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

        if (local == "zh_CN") {
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
        result.children = this.formatter(item.children, `${parentPath}${item.path}/`, item.authority);
      }
      return result;
    });
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '汉得融晶';
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = routerData[key];
      }
    });
    if (currRouterData && currRouterData.name) {
      title = `${currRouterData.name} - 汉得融晶`;
    }
    return title;
  }

  getBaseRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');

    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      const { routerData } = this.props;
      // get the first authorized route path in routerData
      const authorizedPath = Object.keys(routerData).find(
        item => check(routerData[item].authority, item) && item !== '/'
      );
      return authorizedPath;
    }
    return redirect;
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  handleNoticeClear = type => {
    message.success(`清空了${type}`);
    const { dispatch } = this.props;
    dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };

  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'triggerError') {
      dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  handleNoticeVisibleChange = visible => {
    const { dispatch } = this.props;
    if (visible) {
      dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  getContent = pane => {
    const { menu } = this.props;

    let path = window.location.hash.replace('#', '');
    let routeKey = '';
    let query = {};

    const routers = Object.keys(menu.routerData);

    for (let i = 0, len = routers.length; i < len; i++) {
      let params = [];
      let routePath = routers[i];

      if (routePath === "/") continue;

      if (routePath.indexOf("/:") >= 0) {
        params = routePath.split("/:");
        routePath = params.shift();
      }

      if (path !== routePath) {
        if (path.indexOf(routePath) === 0) {
          let tmp = path.substr(routePath.length);
          let values = tmp.split('/').filter(item => item != '');
          if (params.length === values.length) {
            params.map((item, index) => {
              query[item] = values[index];
            });
            routeKey = routers[i];
            break;
          }
        }
      } else {
        routeKey = routers[i];
        break;
      }
    }

    if (menu.routerData[routeKey]) {
      let match = { params: query };
      return {
        routeKey,
        component: menu.routerData[routeKey].component,
        params: { match },
        name: menu.routerData[routeKey].name,
        pathname: path,
      };
    }

    return null;
  };

  onChange = activeKey => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    if (action === 'remove') {
      this.remove(targetKey);
    }
  };

  remove = targetKey => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.pathname === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.pathname !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].pathname;
    }
    this.setState({ panes, activeKey });
  };

  render() {
    const {
      currentUser,
      collapsed,
      fetchingNotices,
      notices,
      routerData,
      match,
      location,
      menu,
    } = this.props;

    const { isMobile: mb, menus, loading, panes } = this.state;
    const bashRedirect = this.getBaseRedirect();
    const layout = (
      <Layout>
        <SiderMenu
          logo={logo}
          // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
          // If you do not have the Authorized parameter
          // you will be forced to jump to the 403 interface without permission
          Authorized={Authorized}
          menuData={menu.menuList}
          collapsed={collapsed}
          location={location}
          isMobile={mb}
          onCollapse={this.handleMenuCollapse}
        />
        <Layout>
          <Header style={{ padding: 0 }}>
            <GlobalHeader
              logo={logo}
              currentUser={currentUser}
              fetchingNotices={fetchingNotices}
              notices={notices}
              collapsed={collapsed}
              isMobile={mb}
              onNoticeClear={this.handleNoticeClear}
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
            />
          </Header>
          <Content style={{ margin: '10px 10px 0', height: '100%' }}>
            {/* {!loading && (
              <Switch>
                {redirectData.map(item => (
                  <Redirect key={item.from} exact from={item.from} to={item.to} />
                ))}
                {getRoutes(match.path, menu.routerData).map(item => (
                  <Route path={item.path} key={item.key} render={item.component} />
                ))}
                <Redirect exact from="/" to={bashRedirect} />
                <Route render={NotFound} />
              </Switch>
            )} */}

            <Tabs
              hideAdd
              onChange={this.onChange}
              activeKey={this.state.activeKey}
              type="editable-card"
              onEdit={this.onEdit}
              tabBarGutter={2}
            // style={{ backgroundColor: '#fff', margin: '-10px -10px 0' }}
            >
              {panes.map((pane, index) => (
                <TabPane forceRender={false} tab={this.$t(pane.name)} key={pane.pathname}>
                  <div style={{ padding: '12px 14px', backgroundColor: "#fff" }}>
                    {React.createElement(pane.component, pane.params)}
                  </div>
                </TabPane>
              ))}
            </Tabs>

            {/* {menu.routerData[path] && React.createElement(menu.routerData[path].component, {})} */}
          </Content>
          {/* <Footer style={{ padding: 0 }}>
            <GlobalFooter
              links={[
                {
                  key: 'Pro 首页',
                  title: 'Pro 首页',
                  href: 'http://pro.ant.design',
                  blankTarget: true,
                },
                {
                  key: 'github',
                  title: <Icon type="github" />,
                  href: 'https://github.com/ant-design/ant-design-pro',
                  blankTarget: true,
                },
                {
                  key: 'Ant Design',
                  title: 'Ant Design',
                  href: 'http://ant.design',
                  blankTarget: true,
                },
              ]}
              copyright={
                <Fragment>
                  Copyright <Icon type="copyright" /> 2018 蚂蚁金服体验技术部出品
                </Fragment>
              }
            />
          </Footer> */}
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <Spin spinning={loading} size="large">
          <ContainerQuery query={query}>
            {params => <div className={classNames(params)}>{layout}</div>}
          </ContainerQuery>
        </Spin>
      </DocumentTitle>
    );
  }
}

export default connect(({ user, global = {}, loading, languages, menu }) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
  languages: languages,
  menu: menu,
}))(BasicLayout);
