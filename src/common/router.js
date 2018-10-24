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
    '/dashboard': {
      component: dynamicWrapper(app, [], () => import('../containers/dashboard')),
      name: '仪表盘',
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
    //我的预付款
    '/pre-payment/my-pre-payment': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/me-pre-payment.js')
      ),
      name: 'prepayment',
    },
    //预付款复核
    '/pre-payment/pre-payment-recheck': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-re-check/pre-payment-re-check.js')
      ),
      name: 'prepayment-recheck',
    },
    //预付款复核详情
    '/pre-payment/pre-payment-recheck/pre-payment-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-re-check/pre-payment-re-check-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/pre-payment/pre-payment-recheck',
    },
    //新建预付款
    '/pre-payment/my-pre-payment/new-pre-payment/:id/:prePaymentTypeId/:formOid': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/new-pre-payment.js')
      ),
      name: 'new-prepayment',
      parent: '/pre-payment/my-pre-payment',
    },
    //预付款详情
    '/pre-payment/me-pre-payment/pre-payment-detail/:id/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/pre-payment-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/pre-payment/my-pre-payment',
    },
    '/my-reimburse': {
      component: dynamicWrapper(app, [], () => import('containers/reimburse/my-reimburse.js')),
      name: 'my-reimburse',
    },
    '/my-reimburse/reimburse-detail/:id': {
      component: dynamicWrapper(app, [], () => import('containers/reimburse/reimburse-detail.js')),
      name: 'reimburse-detail',
      parent: '/my-reimburse',
    },
    '/my-reimburse/edit-reimburse/:id': {
      component: dynamicWrapper(app, [], () => import('containers/reimburse/new-reimburse.js')),
      name: 'new-reimburse',
      parent: '/my-reimburse',
    },
    //新建报账单
    '/my-reimburse/new-reimburse/:formId/:formOID': {
      component: dynamicWrapper(app, [], () => import('containers/reimburse/new-reimburse.js')),
      name: 'new-reimburse',
      parent: '/my-reimburse',
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
    '/document-type-manage/contract-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-type/contract-type-define.js')
      ),
      name: 'contract-type',
    },
    //预付款类型
    '/document-type-manage/prepayment-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/prepayment-type/pre-payment-type.js')
      ),
      name: 'prepayment-type',
    },
    //预付款分配公司
    '/document-type-manage/prepayment-type/distribution-company/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/prepayment-type/distribution-company.js')
      ),
      name: '分配公司',
      parent: '/document-type-manage/prepayment-type',
    },
    '/approval-management/pre-payment-approve': {
      //预付款工作流审批
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-approve/pre-payment.js')
      ),
      name: 'pre-payment-approve',
    },
    '/approval-management/pre-payment-approve/pre-payment-approve-detail/:id/:entityOID/:status': {
      //预付款工作流审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-approve/pre-payment-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/approval-management/pre-payment-approve',
    },
    '/document-type-manage/contract-type/new-contract-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-type/new-contract-type.js')
      ),
      name: '合同类型创建/编辑',
      parent: '/document-type-manage/contract-type',
    },
    '/document-type-manage/contract-type/company-distribution/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-type/company-distribution.js')
      ),
      name: '合同类型分配公司',
      parent: '/document-type-manage/contract-type',
    },
    '/contract-manage/contract-recheck': {
      //合同复核
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract.js')
      ),
      name: 'contract-recheck',
    },
    '/contract-manage/contract-recheck/contract-detail/:id/:status': {
      //合同复核详情
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract-detail.js')
      ),
      name: 'contract-detail',
      parent: '/contract-manage/contract-recheck',
    },
    '/contract-manage/my-contract': {
      //我的合同
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/my-contract.js')
      ),
      name: 'my-contract',
    },
    '/approval-management/contract-approve': {
      //合同工作流审批
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract-workflow-approve.js')
      ),
      name: 'contract-approve',
    },
    '/approval-management/contract-approve/contract-workflow-approve-detail/:id/:entityOID/:entityType/:status': {
      //合同工作流审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract-workflow-approve-detail.js')
      ),
      name: 'contract-detail',
      parent: '/approval-management/contract-approve',
    },
    '/contract-manage/my-contract/new-contract/:contractTypeId': {
      //合同新建
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/new-contract.js')
      ),
      name: 'new-contract',
      parent: '/contract-manage/my-contract',
    },
    '/contract-manage/my-contract/edit-contract/:id/:contractTypeId': {
      //合同编辑
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/new-contract.js')
      ),
      name: 'edit-contract',
      parent: '/contract-manage/my-contract',
    },
    '/contract-manage/my-contract/contract-detail/:id': {
      //合同详情
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/contract-detail.js')
      ),
      name: 'contract-detail',
      parent: '/contract-manage/my-contract',
    },
    '/request': {
      //申请单
      component: dynamicWrapper(app, [], () => import('containers/request/request.js')),
      name: 'request',
    },
    '/request/jd-request-edit/:formOID/:applicationOID': {
      //京东申请单编辑页
      component: dynamicWrapper(app, [], () => import('containers/request/jd-request-edit')),
      name: 'jd-request-edit',
    },
    '/request/new-request/:formOID/:applicantOID': {
      //新建申请单
      component: dynamicWrapper(app, [], () => import('containers/request/new-edit-request')),
      name: 'new-request',
      parent: '/request',
    },
    '/request/request-edit/:formOID/:applicationOID': {
      //编辑申请单
      component: dynamicWrapper(app, [], () => import('containers/request/new-edit-request')),
      name: 'request-edit',
      parent: '/request',
    },
    '/request/request-detail/:formOID/:applicationOID/:pageFrom': {
      //申请单详情
      component: dynamicWrapper(app, [], () => import('containers/request/base-request-detail')),
      name: 'request-detail',
      parent: '/request',
    },
    '/payment-requisition/my-payment-requisition': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/payment-requisition.js')
      ),
      name: 'payment-requisition', // 付款申请单
    },
    '/payment-requisition/my-payment-requisition/new-payment-requisition/:id/:typeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/new-payment-requisition.js')
      ),
      name: '新建付款申请单',
      parent: '/payment-requisition/my-payment-requisition',
    },
    '/payment-requisition/my-payment-requisition/edit-payment-requisition/:id/:typeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/new-payment-requisition.js')
      ),
      name: '编辑付款申请单',
      parent: '/payment-requisition/my-payment-requisition',
    },
    '/payment-requisition/my-payment-requisition/payment-requisition-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/new-payment-requisition-detail.js')
      ),
      name: '付款申请单详情',
      parent: '/payment-requisition/my-payment-requisition',
    },
    '/job/job-actuator': {
      component: dynamicWrapper(app, [], () => import('containers/job/job-actuator.js')),
      name: 'job-actuator', // 执行器
    },
    '/job/job-info': {
      component: dynamicWrapper(app, [], () => import('containers/job/job-info.js')),
      name: 'job-info', // 任务详情
    },
    '/job/job-log': {
      component: dynamicWrapper(app, [], () => import('containers/job/job-log.js')),
      name: 'job-log', // 任务日志
    },

    '/document-type-manage/payment-requisition-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/type/acp-request-type.js')
      ),
      name: 'payment-requisition-type', // 付款申请单类型定义
    },
    '/document-type-manage/payment-requisition/acp-request-type/distribution-company/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/type/distribution-company.js')
      ),
      name: '付款申请单类型分配公司',
      parent: '/document-type-manage/payment-requisition-type',
    },
    // //报销单
    // '/expense-report': {
    //   component: dynamicWrapper(app, [], () => import('containers/expense-report/expense-report.js')),
    //   name: 'expense-report',
    // },
    '/document-type-manage/gl-work-order-type': {
      //核算工单类型定义
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-type/gl-work-order-type.js')
      ),
      name: 'gl-work-order-type',
    },
    '/document-type-manage/gl-work-order-type/new-gl-work-order-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-type/new-gl-work-order-type.js')
      ),
      name: '核算工单类型创建/编辑',
      parent: '/document-type-manage/gl-work-order-type',
    },
    '/document-type-manage/gl-work-order-type/company-distribution/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-type/distribution-company.js')
      ),
      name: '核算工单类型分配公司',
      parent: '/document-type-manage/gl-work-order-type',
    },
    //核算工单
    '/gl-work-order/my-gl-work-order': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/my-gl-work-order/my-gl-work-order.js')
      ),
      name: 'my-gl-work-order',
    },
    '/gl-work-order/my-gl-work-order/new-gl-work-order/:typeId/:formOid/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/my-gl-work-order/new-gl-work-order.js')
      ),
      name: 'new-gl-work-order',
      parent: '/gl-work-order/my-gl-work-order',
    },
    '/gl-work-order/my-gl-work-order/my-gl-work-order-detail/:id/:oid': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/my-gl-work-order/my-gl-work-order-detail.js')
      ),
      name: 'my-gl-work-order-detail',
      parent: '/gl-work-order/my-gl-work-order',
    },
    '/pay-setting/payment-method': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/payment-method/payment-method.js')
      ),
      name: 'payment-method', // 付款方式
    },
    '/pay-setting/cash-flow-item': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-flow-item/cash-flow-item.js')
      ),
      name: 'cash-flow-item', // 现金流量项
    },
    '/pay-setting/cash-transaction-class': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-transaction-class/cash-transaction-class.js')
      ),
      name: 'cash-transaction-class', // 现金事务分类
    },
    '/pay-setting/cash-transaction-class/new-cash-transaction-class/:setOfBooksId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-transaction-class/new-cash-transaction-class.js')
      ),
      name: '新建现金事务分类',
      parent: '/pay-setting/cash-transaction-class',
    },
    '/pay-setting/cash-transaction-class/cash-transaction-class-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-transaction-class/cash-transaction-class-detail.js')
      ),
      name: '现金事务分类详情',
      parent: '/pay-setting/cash-transaction-class',
    },
    '/pay-setting/company-account-setting': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/company-account-setting/company-account-setting.js')
      ),
      name: 'company-account-setting', // 公司账户设置
    },
    '/pay-setting/payment-company-setting': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/payment-company-setting/payment-company-setting.js')
      ),
      name: 'payment-company-setting', // 付款公司配置
    },
    '/pay-setting/company-account-setting/bank-account-detail/:companyBankId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/company-account-setting/bank-account-detail.js')
      ),
      name: '银行账户详情',
      parent: '/pay-setting/company-account-setting',
    },
    '/approval-management/gl-work-order-approval': {
      //核算工单审批
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-approval/gl-work-order-approval.js')
      ),
      name: 'gl-work-order-approval',
    },
    '/approval-management/gl-work-order-approval/gl-work-order-approval-detail/:id/:oid/:status': {
      //核算工单审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-approval/gl-work-order-approval-detail.js')
      ),
      name: '核算工单审批详情',
      parent: '/approval-management/gl-work-order-approval',
    },
    '/financial-management/csh-write-off-backlash': {
      //核销反冲
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/csh-write-off-backlash/csh-write-off-backlash')
      ),
      name: 'csh-write-off-backlash',
    },
    '/financial-management/supplier-maintain': {
      //财务管理-供应商维护
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/supplier-management.js')
      ),
      name: 'supplier-maintain',
    },
    '/financial-management/supplier-maintain/new-update-supplier': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/new-update-supplier.js')
      ),
      name: '供应商维护',
      parent: '/financial-management/supplier-maintain',
    },
    '/financial-management/supplier-maintain/supplier-bank-account/:id/:source': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/supplier-bank-account.js')
      ),
      name: '银行账号',
      parent: '/financial-management/supplier-maintain',
    },
    '/financial-management/supplier-maintain/delivery-company/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/supplier-company-delivery.js')
      ),
      name: '供应商分配公司',
      parent: '/financial-management/supplier-maintain',
    },
    '/admin-setting/form-list': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/form/form-list.js')
      ),
      name: '表单管理',
    },
    '/admin-setting/form-list/new-form/:formType/:booksID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/form/form-detail/form-detail.js')
      ),
      name: '新建表单',
      parent: '/admin-setting/form-list',
    },
    '/admin-setting/form-list/form-detail/:formOID/:booksID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/form/form-detail/form-detail.js')
      ),
      name: '表单详情',
      parent: '/admin-setting/form-list',
    },
    //供应商类型
    '/admin-setting/supplier-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/supplier-type/supplier-type')
      ),
      name: '供应商类型定义',
    },
    '/financial-management/finance-audit': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/finance-audit/finance-audit')
      ),
      name: 'finance-audit',
    },

    '/financial-accounting-setting/section-structure': {
      //科目段结构，
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/section-structure/section-structure')
      ),
      name: 'section-structure'
    },
    '/financial-accounting-setting/section-structure/section-setting/:id/:setOfBooksId': {
      //科目段设置
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/section-structure/section-setting')
      ),
      name: 'section-setting',
      parent: '/financial-accounting-setting/section-structure'
    },
    '/financial-accounting-setting/accounting-source-system': {
      //来源事务定义
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/accounting-source-system')
      ),
      name: 'source-affair-define'
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/:id/:sourceTransactionType': {
      //凭证模版
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/voucher-template')
      ),
      name: 'voucher-template',
      parent: '/financial-accounting-setting/accounting-source-system'
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-data-rules-system/:lineModelId/:id': {
      //取值规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/line-mode-data-rules')
      ),
      name: 'get-value-rule',
      parent: '/financial-accounting-setting/accounting-source-system'
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-judge-rules-system/:lineModelId/:id': {
      //判断规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/line-mode-judge-rules')
      ),
      name: 'judge-rules',
      parent: '/financial-accounting-setting/accounting-source-system'
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-rules-system/:lineModelId/:id': {
      //核算规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/line-mode-rules')
      ),
      name: 'account-rules',
      parent: '/financial-accounting-setting/accounting-source-system'
    },
    '/financial-accounting-setting/accounting-scenarios-system': {
      //核算场景定义
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system')
      ),
      name: 'accounting-scenarios-define',
    },
    "/financial-accounting-setting/accounting-scenarios-system/accounting-elements/:id": {
      //核算要素
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios-system/accounting-elements')
      ),
      name: 'account-element',
      parent: '/financial-accounting-setting/accounting-scenarios-system'
    },
    '/financial-accounting-setting/accounting-scenarios/:setOfBooksId': {
      //科目映射规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios')
      ),
      name: 'section-map-rule',
    },
    '/financial-accounting-setting/accounting-scenarios/matching-group-elements/:setOfBooksId/:id': {
      //匹配组
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios/matching-group-elements')
      ),
      name: 'match-group-element',
      parent: '/financial-accounting-setting/accounting-scenarios/:setOfBooksId'
    },
    '/financial-accounting-setting/accounting-scenarios/matching-group-elements/subject-matching-setting/:id/:groupId': {
      //科目匹配设置
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios/subject-matching-setting')
      ),
      name: 'subj-match-setting',
      parent: '/financial-accounting-setting/accounting-scenarios/:setOfBooksId'
    },
    '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId': {
      //来源事务凭证模板
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/accounting-source')
      ),
      name: 'voucher-model',
    },
    '/financial-accounting-setting/accounting-source/voucher-template-sob/:id': {
      //帐套级凭证模板
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/voucher-template')
      ),
      name: 'sob-voucher-model',
      parent: '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId'
    },
    '/financial-accounting-setting/accounting-source/voucher-template-sob/line-mode-data-rules/:id/:lineModelId': {
      //取值规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/line-mode-data-rules'),
      ),
      name: 'get-value-rule',
      parent: '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId'
    },
    '/admin-setting/expense-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/expense-type/expense-type.js')
      ),
      name: 'expense-type',
    },
    '/admin-setting/company-group': {
      //公司组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/company-group/company-group.js')
      ),
      name: 'company-group',
    },
    '/admin-setting/company-group/new-company-group/:companyGroupId': {
      //新建公司组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/company-group/new-company-group.js')
      ),
      name: 'new-company-group',
      parent: '/admin-setting/company-group',
    },
    '/admin-setting/company-group/company-group-detail/:id': {
      //公司组详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/company-group/company-group-detail.js')
      ),
      name: 'company-group-detail',
      parent: '/admin-setting/company-group',
    },
    '/pay/pay-workbench/:tab': {
      //付款工作台
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-workbench/pay-workbench.js')
      ),
      name: 'pay-workbench',
    },
    '/pay/pay-workbench/payment-detail/:tab/:subTab/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-workbench/payment-detail.js')
      ),
      name: '支付详情',
      parent: '/pay/pay-workbench/:tab',
    },
    //基础数据/银行定义
    '/basic-data/bank-definition': {
      component: dynamicWrapper(app, [], () =>
        import('containers/basic-data/bank-definition/bank-definition.js')
      ),
      name: '银行定义',
    },

    //预算日记本
    '/budget/budget-journal': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/budget-journal.js')
      ),
      name: 'budget-journal',
    },
    //新建预算日记账
    '/budget/budget-journal/new-budget-journal': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/new-budget-journal.js')
      ),
      name: '新建预算日记账',
      parent: '/budget/budget-journal',
    },
    //预算日记账详情
    '/budget/budget-journal/budget-journal-detail/:journalCode': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/budget-journal-detail.js')
      ),
      name: '预算日记账详情',
      parent: '/budget/budget-journal',
    },
    //预算日记账详情(已经提交过的)
    '/budget/budget-journal/budget-journal-detail-submit/:journalCode': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/budget-journal-detail-submit.js')
      ),
      name: '预算日记账详情(已提交)',
      parent: '/budget/budget-journal',
    },
    '/pay/pay-refund': {
      //付款退款
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-refund/pay-refund-query.js')
      ),
      name: 'pay-refund',
    },
    '/pay/pay-refund-check': {
      //付款退款复核
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-refund/pay-refund-check-query.js')
      ),
      name: 'pay-refund-check',
    },
    '/pay/pay-backlash/:tab': {
      //付款反冲
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/payment-backlash/pay-backlash.js')
      ),
      name: 'pay-backlash',
    },
    '/pay/pay-backlash-recheck/:tab': {
      //付款反冲复核
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/payment-backlash-recheck/pay-backlash-recheck.js')
      ),
      name: 'pay-backlash-recheck',
    },
    '/approval-management/approval-my-reimburse': {
      //报账单审批
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/reimburse-approve/my-reimburse.js')
      ),
      name: 'approval-my-reimburse',
    },
    '/approval-management/approval-my-reimburse': {
      //报账单审批
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/reimburse-approve/my-reimburse.js')
      ),
      name: 'approval-my-reimburse',
    },
    '/approval-management/approve-my-reimburse/approve-reimburse-detail/:id/:entityOID/:flag': {
      //报账单审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/reimburse-approve/reimburse-detail.js')
      ),
      name: 'approve-reimburse-detail',
    },
    //预算日记账复核
    '/budget/budget-journal-re-check': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal-re-check/budget-journal-re-check.js'),
      ),
      name: 'budget-journal-re-check',
    },

    //预算日记账复核详情
    '/budget/budget-journal-re-check/budget-journal-re-check-detail/:journalCode': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal-re-check/budget-journal-re-check-detail.js')
      ),
      name: '预算日记账复核详情',
      parent: '/budget/budget-journal-re-check',
    },
    '/admin-setting/department-group': {
      //部门组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/department-group/department-group.js')
      ),
      name: 'department-group',
    },
    '/admin-setting/department-group/new-department-group': {
      //新建部门组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/department-group/new-department-group.js')
      ),
      name: 'new-department-group',
      parent: '/admin-setting/department-group',
    },
    '/admin-setting/department-group/department-group-detail/:id': {
      //部门组详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/department-group/department-group-detail.js')
      ),
      name: 'department-group-detail',
      parent: '/admin-setting/department-group',
    },
    '/admin-setting/currency-setting': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/currency-setting/currency-setting.js')
      ),
      name: '币种设置',
    },
    '/admin-setting/currency-setting/currency-setting-add/:baseCurrency/:baseCurrencyName/:setOfBooksId/:tenantId/:enableAutoUpdate': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/currency-setting/currency-setting-add.js')
      ),
      name: '新增汇率',
      parent: '/admin-setting/currency-setting',
    },
    '/admin-setting/currency-setting/currency-setting-edit/:enableAutoUpdate/:currencyRateOid/:functionalCurrencyName/:functionalCurrencyCode/:setOfBooksId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/currency-setting/currency-setting-edit.js')
      ),
      name: '编辑汇率',
      parent:'/admin-setting/currency-setting'
    }
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
