import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/setting/menu': {
      component: dynamicWrapper(app, [], () => import('../routes/Menu/index')),
    },
    '/setting/role': {
      component: dynamicWrapper(app, [], () => import('../routes/Role/index')),
    },
    '/setting/employee': {
      component: dynamicWrapper(app, [], () => import('../routes/Employee/index')),
    },
    '/setting/language/language-modules/:langType': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/module-list')),
      name: '模块列表',
      parent: '/setting/language',
    },
    '/setting/language/language-setting/:moduleId': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/setting')),
      name: '语言列表',
      parent: '/setting/language/language-modules/:langType',
    },
    '/setting/language/other-language-setting/:langType/:moduleId': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/other-language-setting')),
      name: '语言列表',
      parent: '/setting/language/language-modules/:langType',
    },
    '/setting/language': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/index')),
    },
    // "/view/:id": {
    //   component: dynamicWrapper(app, [], () => import('../routes/View/index')),
    // },
    '/setting/component-manager': {
      component: dynamicWrapper(app, ['chart'], () => import('../routes/component-manager/index')),
    },
    '/setting/interface': {
      component: dynamicWrapper(app, [], () => import('../routes/Interface/index')),
    },
    '/setting/modules': {
      component: dynamicWrapper(app, ['chart'], () => import('../routes/Modules/index')),
    },
    '/setting/priview': {
      component: dynamicWrapper(app, ['chart'], () =>
        import('../routes/component-manager/priview')
      ),
      name: '预览',
    },
    '/result/success': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    },
    '/result/fail': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },
    '/pre-payment/my-pre-payment': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/me-pre-payment.js')
      ),
      name: 'prepayment',
    },
    '/pre-payment/pre-payment-recheck': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-re-check/pre-payment-re-check.js')
      ),
      name: 'prepayment-recheck',
    },
    '/pre-payment/pre-payment-recheck/pre-payment-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-re-check/pre-payment-re-check-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/pre-payment/pre-payment-recheck',
    },
    '/pre-payment/my-pre-payment/new-pre-payment/:id/:prePaymentTypeId/:formOid': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/new-pre-payment.js')
      ),
      name: 'new-prepayment',
      parent: '/pre-payment/my-pre-payment',
    },
    '/pre-payment/me-pre-payment/pre-payment-detail/:id/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/pre-payment-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/pre-payment/my-pre-payment',
    },
    '/expense-adjust/my-expense-adjust': {
      component: dynamicWrapper(app, [], () => import('containers/expense-adjust/expense-adjust')),
      name: 'my-expense-adjust1',
    },
    '/expense-adjust/my-expense-adjust/new-expense-adjust/:expenseAdjustTypeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/new-expense-adjust')
      ),
      name: 'new-expense-adjust',
      parent: '/expense-adjust/my-expense-adjust',
    },
    '/expense-adjust/my-expense-adjust/expense-adjust-detail/:id/:expenseAdjustTypeId/:type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/expense-adjust-detail')
      ),
      name: 'expense-adjust-detail',
      parent: '/expense-adjust/my-expense-adjust',
    },

    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id

    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
