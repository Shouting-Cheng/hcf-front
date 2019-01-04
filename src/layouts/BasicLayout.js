import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message, Spin, Tabs } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import config from 'config';
import { routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';

import SiderMenu from '../components/SiderMenu';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import logo from '../assets/logo.png';
import fetch from '../utils/fetch';

import zh_CN from '../i18n/zh_CN/index';
import en_US from '../i18n/en_US/index';

import { isUrl } from '../utils/utils';

import 'styles/common.scss';


const TabPane = Tabs.TabPane;
const { Content, Header } = Layout;
const { check } = Authorized;

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
    selectKey: '',
    error: false,
    errorContent: {},
    menuList: []
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

    if (!window.sessionStorage.getItem("token")) {
      this.props.dispatch({
        type: 'login/logout'
      })
    }

    //如果刷新重新请求所有信息
    if (JSON.stringify(this.props.currentUser) == '{}') {
      this.getALlInfo();
    }

    let path = window.location.hash.replace('#', '');

    let panes = this.state.panes;

    if (path != '/dashboard') {
      let dashboard = this.getContent('/dashboard');
      if (dashboard) {
        panes.push(dashboard);
      }
    }

    let component = this.getContent();

    if (component) {
      let index = panes.findIndex(o => o.routeKey == component.routeKey);

      if (index >= 0) {
        this.setState({ activeKey: path, selectKey: path });
      } else {
        panes.push(component);
        this.setState({
          panes,
          activeKey: component.routeKey,
          selectKey: component.parent || component.pathname,
        });
      }
    } else {
      this.setState({ panes });
    }
  }

  componentWillReceiveProps(nextProps) {

    let panes = this.state.panes;
    let path = window.location.hash.replace('#', '');

    if (path == '/') {
      this.props.dispatch(
        routerRedux.push({
          pathname: '/dashboard',
        })
      );
      return;
    }

    if (panes.findIndex(o => o.routeKey == '/dashboard') < 0) {
      let dashboard = this.getContent('/dashboard');
      if (dashboard) {
        panes.push(dashboard);
        this.setState({
          panes,
          activeKey: dashboard.routeKey,
          selectKey: dashboard.parent || dashboard.pathname,
        });
      }
    }

    let component = this.getContent();

    if (!component) return;

    let index = panes.findIndex(o => o.routeKey == component.routeKey);

    if (index >= 0) {
      this.setState({
        activeKey: component.routeKey,
        selectKey: component.parent || component.pathname,
      });

      return;
    }

    if (!this.state.activeKey || !panes.length) {
      panes.push(component);
      this.setState({
        panes,
        activeKey: component.routeKey,
        selectKey: component.parent || component.pathname,
      });
      return;
    }

    //即将跳转的页面是已经打开的页面的父页面
    index = panes.findIndex(item => item.parent == component.routeKey);

    if (index >= 0) {
      panes[index] = component;
      this.setState({
        panes,
        activeKey: component.routeKey,
        selectKey: component.parent || component.pathname,
      });
      return;
    }

    index = panes.findIndex(o => o.routeKey == this.state.activeKey);

    //三种情况  不会打开新tab页
    //1.即将跳转的页面是功能页，并且它的父页面是当前页面
    //2.即将跳转的页面是功能页, 并且当前页面也是功能页面，并且当前页面和即将跳转的页面同属于一个菜单
    //3.即将跳转的页面是当前页面的父页面，一般页面的返回按钮
    if (
      (component.parent &&
        (component.parent == panes[index].parent || component.parent == panes[index].routeKey)) ||
      panes[index].parent == component.routeKey
    ) {
      panes[index] = component;
    } else {
      panes.push(component);
    }

    this.setState({
      panes,
      activeKey: component.routeKey,
      selectKey: component.parent || component.pathname,
    });
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
      fetch.get('/api/userRole/query/user/menuList').then(response => {

        let result = JSON.parse(JSON.stringify(response || []));
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

      });
    });
  };

  getChildren = (group, result, level, routerData, parent = {}) => {
    result.map(item => {
      item.children = group[item.id];
      item.level = level;
      item.name = item.menuName;
      item.icon = level > 1 ? '' : item.menuIcon;
      item.parentKey = parent.path;

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
      let result = await fetch.get('/api/account');
      dispatch({
        type: 'user/saveCurrentUser',
        payload: result,
      });
      await this.getCompany();
      await this.getLanguage(result);
      // await this.getLanguageType();
      await this.getLanguageList();
      await this.getProfile();
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
  getProfile = () => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      fetch
        .get(`/api/function/profiles?roleType=TENANT`)
        .then(result => {
          dispatch({
            type: 'user/saveProfile',
            payload: result,
          });
          resolve();
        })
        .catch(e => {
          resolve();
        });
    });
  };

  getOrganizationBySetOfBooksId = id => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      fetch
        .get(`${config.budgetUrl}/api/budget/organizations/default/${id}`)
        .then(result => {
          dispatch({
            type: 'user/saveOrganization',
            payload: result,
          });
          resolve();
        })
        .catch(e => {
          resolve();
        });
    });
  };

  getLanguage = user => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      let local = user.language;

      fetch
        .get('/api/frontKey/query/keyword?lang=' + local || 'zh_cn', { page: 0, size: 99999 })
        .then(res => {
          let languages = {};

          res.map(item => {
            languages[item.keyCode] = item.descriptions;
          });

          if (!local) {
            window.localStorage.setItem('local', 'zh_cn');
            local = 'zh_cn';
          } else {
            window.localStorage.setItem('local', local);
          }

          if (local == 'zh_cn') {
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
      fetch.get('/api/language/query').then(res => {
        dispatch({
          type: 'languages/setLanguageType',
          payload: { languageType: res },
        });
        resolve();
      });
    });
  };

  getLanguageList = () => {
    const { dispatch } = this.props;
    return new Promise(async (resolve, reject) => {
      fetch.post(`${config.baseUrl}/api/lov/language/zh_cn`).then(res => {
        dispatch({
          type: 'languages/setLanguageType',
          payload: { languageType: res },
        });
        resolve();
      });
    });
  }

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

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '融智汇';
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = routerData[key];
      }
    });
    if (currRouterData && currRouterData.name) {
      title = `${this.$t(currRouterData.name)} - 融智汇`;
    }
    return title;
  }

  getBaseRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');

    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      const { routerData } = this.props;
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

  getContent = path => {
    const { menu } = this.props;

    path = path || window.location.hash.replace('#', '');
    let routeKey = '';
    let query = {};

    const routers = Object.keys(menu.routerData);

    for (let i = 0, len = routers.length; i < len; i++) {
      let params = [];
      let routePath = routers[i];

      if (routePath === '/') continue;

      if (routePath.indexOf('/:') >= 0) {
        params = routePath.split('/:');
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
        parent: menu.routerData[routeKey].parent,
      };
    }

    return null;
  };

  onChange = activeKey => {
    // console.log(activeKey);

    let path = this.state.panes.find(o => o.routeKey == activeKey).pathname;

    this.props.dispatch(routerRedux.push({
      pathname: path
    }));

    this.setState({ activeKey });
  };

  onEdit = (targetKey, action) => {
    if (action === 'remove') {
      this.remove(targetKey);
    }
  };

  remove = targetKey => {
    // if (targetKey == "/dashboard") return;

    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.routeKey === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.routeKey !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].routeKey;
    }

    this.setState({ panes, activeKey }, () => {
      let path = this.state.panes.find(o => o.routeKey == this.state.activeKey).pathname;

      this.props.dispatch(routerRedux.push({
        pathname: path
      }));
    });
  };

  render() {
    const {
      currentUser,
      collapsed,
      fetchingNotices,
      notices,
      location,
      menu,
    } = this.props;

    const { isMobile: mb, loading, panes, selectKey, menuList } = this.state;

    const layout = (
      <Layout>
        <SiderMenu
          logo={logo}
          Authorized={Authorized}
          menuData={menu.menuList}
          collapsed={collapsed}
          location={location}
          isMobile={mb}
          onCollapse={this.handleMenuCollapse}
          activeKey={selectKey}
          menuList={menuList}
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
          <Content style={{ margin: '10px 10px 0' }}>
            {!loading && (
              <Tabs
                hideAdd
                onChange={this.onChange}
                activeKey={this.state.activeKey}
                type="editable-card"
                onEdit={this.onEdit}
                tabBarGutter={2}
              >
                {panes.map((pane, index) => (
                  <TabPane
                    closable={pane.routeKey != '/dashboard'}
                    forceRender={false}
                    tab={this.$t(pane.name)}
                    key={pane.routeKey}
                  >
                    <div
                      style={{ padding: '12px 14px', paddingBottom: 0, backgroundColor: '#fff' }}
                    >
                      {React.createElement(pane.component, pane.params)}
                    </div>
                  </TabPane>
                ))}
              </Tabs>
            )}
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
  organization: user.organization,
}))(BasicLayout);
