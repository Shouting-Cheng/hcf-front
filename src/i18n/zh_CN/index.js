import common from './common.json'
import menu from './menu.json';
import main from './main.json'
//管理员的控制面板
import dashboardAdmin from './dashboard-admin.json';
import budgetOrganization from './budget-setting/budget-organization/budget-organization.json'
import login from './login.json'
import budgetStructure from './budget-setting/budget-organization/budget-structure.json'
import budgetItemMap from './budget-setting/budget-organization/budget-item-map.json'
import budgetItem from './budget-setting/budget-organization/budget-item.json'
import budgetGroup from './budget-setting/budget-organization/budget-group.json'
import budgetControlRules from './budget-setting/budget-organization/budget-control-rules.json'
import payWorkbench from './pay/pay-workbench.json'
import budgetVersion from './budget-setting/budget-organization/budget-version.json'
import budgetItemType from './budget-setting/budget-organization/budget-item-type.json'
import budgetJournal from './budget-journal/budget-journal.json'
import agencySetting from './approve-setting/agency-setting.json'
import bankDefinition from './basic-data/bank-definition.json'
import securitySetting from './setting/security-setting.json'
import accountPeriodDefine from './finance-setting/account-period-define.json'
import accountPeriodControl from './finance-setting/account-period-control.json'
import companyMaintain from './enterprise-manage/company-maintain/company-maintain.json'
import financeAudit from './financial-management/finance-audit.json'
import financeView from './financial-management/finance-view.json'
import checkCostApplication from './financial-management/check-cost-application.json'
import loanAndRefund from './financial-management/loan-and-refund.json'
import confirmPayment from './financial-management/confirm-payment.json'
import paymentBatch from './financial-management/payment-batch.json'
import waitForBilling from './financial-management/for-billing.json'
import departmentGroup from './setting/department-group.json'
import companyGroup from './setting/company-group.json'
import announcementInformation from './setting/announcement-information.json'
import valueList from './setting/value-list.json'
import paymentMethod from './pay-setting/payment-method.json'
import paymentCompanySetting from './pay-setting/payment-company-setting.json'
import cashFlowItem from './pay-setting/cash-flow-item.json'
import cashTransactionClass from './pay-setting/cash-transaction-class.json'
import subjectSheet from './setting/subject-sheet.json'
import checkCenter from './financial-management/check-center.json'
import supplierManagement from './financial-management/supplier-management.json'
import sectionStructure from './financial-accounting-setting/section-structure.json'
import accountingSourceSystem from './financial-accounting-setting/accounting-scource-system.json'
import accountingSource from './financial-accounting-setting/accounting-source.json'
import accountingScenariosSystem from './financial-accounting-setting/accounting-scenarios-system.json'
import accountingScenarios from './financial-accounting-setting/accounting-scenarios.json'
import budgetScenarios from './budget-setting/budget-organization/budget-scenarios.json'
import budgetStrategy from './budget-setting/budget-organization/budget-strategy.json'
import budgetOccupancy from './budget/budget-occupancy.json'
import importer from './components/template/importer.json'
import myContract from './contract/my-contract.json'
import contract from './approve/contract.json'
import approveRequest from './approve/approve-request.json'
import priceReview from './approve/price-review.json'
import batchPrintInvoice from './financial-management/batch-print-invoice.json'
import bookingManagement from './booking-management/booking-management.json'
import upload from './components/upload.json'
import chooser from './components/chooser.json';
import imageUpload from './components/image-upload.json';
import listSelector from './components/list-selector.json';
import searchArea from './components/search-area.json';
import applicationTypeManagement from './finance-setting/application-type-management.json'
import travelStandard from './setting/travel-standard.json'
import subsidyRules from './setting/subsidy-rules.json';
import cityLevel from './setting/city-level.json'
import myReimburse from './reimburse/my-reimburse.json'
import personGroup from './setting/person-group.json';
import invoiceManagement from './setting/invoice-management.json';
import expenseReport from './expense-report/expense-report.json'
import expense from './my-account/expense.json'
import subApplication from './setting/sub-application.json'
//角色设置
import RoleSetting from './setting/role-setting/role-setting.json';
import RoleSettingReceipt from './setting/role-setting/receipt-role/receipt-role.json';
import RoleSettingFinance from './setting/role-setting/finance-role/finance-role.json';
import RoleSettingBooking from './setting/role-setting/booking-role/booking-role.json';
import RoleSettingAdmin from './setting/role-setting/admin-role/admin-role.json';
import RoleSettingData from './setting/role-setting/data-role/data-role.json';
// 操作日志
import OperationLog from './setting/operation-log/operation-log.json';
//用户协议
import UserAgreement from './setting/user-agreement/user-agreement.json';
//成本中心
import CostCenter from './setting/cost-center/cost-center.json';
import CostCenterDetail from './setting/cost-center/cost-center-detail.json';
import NewCostCenter from './setting/cost-center/new-cost-center.json';
//成本中心项
import CostCenterExtendFiled from './setting/cost-center/cost-center-extend-filed/cost-center-extend-filed.json';
import CostCenterItemDetail from './setting/cost-center/cost-center-item/cost-center-item-detail.json';
import NewCostCenterItem from './setting/cost-center/cost-center-item/new-cost-center-item.json';
//企业管理
import enterpriseManage from './enterprise-manage/enterprise-manage.json';
import OrgNewDep from './enterprise-manage/org-component/org-new-dep.json';
import OrgPersonInfo from './enterprise-manage/org-component/org-person-info.json';
import OrgRoles from './enterprise-manage/org-component/org-roles.json';
import OrgRolesList from './enterprise-manage/org-component/org-roles-list.json';
import OrgSearchList from './enterprise-manage/org-component/org-search-list.json';
import OrgTree from './enterprise-manage/org-component/org-tree.json';
//法人实体
import legalPerson from './enterprise-manage/legal-person/legal-person.json';
import newLegalPerson from './enterprise-manage/legal-person/new-legal-person.json';
import legalPersonDetail from './enterprise-manage/legal-person/legal-person-detail.json';
// 人员管理
import personManage from './enterprise-manage/person-manage/person-manage.json';
import personManageDetail from './enterprise-manage/person-manage/person-detail/person-detail.json';
// 人员管理人员详情界面组件
import personDetailBankCard from './enterprise-manage/person-manage/person-detail/person-detail-components/bank-card.json';
import personDetailBasicInfoExtend from './enterprise-manage/person-manage/person-detail/person-detail-components/basic-info-extend.json';
import personDetailBasicInfo from './enterprise-manage/person-manage/person-detail/person-detail-components/basic-info.json';
import personDetailSomeIdCard from './enterprise-manage/person-manage/person-detail/person-detail-components/some-id-card.json';
import personDetailVendorInfo from './enterprise-manage/person-manage/person-detail/person-detail-components/vendor-info.json';
//扩展字段
import extendField from './enterprise-manage/extend-field.json';
//停机公告
import stopAnnounce from './components/template/stop-announce/stop-announce.json';
//导出控件
import exportModal from './components/template/export-modal/export-modal.json';
//扩展字段组件
import extendFieldComponent from './components/template/extend-field-setting/extend-field.json';
//选择部门组件
import selectDepmentOrPerson from './components/template/select-depment-or-person/select-depment-or-person.json';
import orgSearchList from './components/template/select-depment-or-person/org-search-list.json';
import languageInput from './components/template/language-input/language-input.json';
import proxies from './components/template/proxies/proxies.json';
import resetPassword from './components/template/reset-password/reset-password.json';

import budgetBalance from './budget/budget-balance.json'
import myAgency from './my-agency/my-agency.json';
import mileageSubsidy from './setting/mileage-subsidy.json'
import mileageSubsidyExpense from './mileage-subsidy-expense/mileage-subsidy-expense.json'
import newMileageCost from './mileage-subsidy-expense/new-mileage-cost.json'
import callbackSetting from './setting/callback-setting.json'
import overView from './supplier-management/overview.json'
import supplierDetail from './supplier-management/supplier-detail.json'
import expenseReserve from './financial-management/expense-reserve.json'
import enableService from './supplier-management/enable-service.json'

import ExpAdjustType from './receipt-type-setting/exp-adjust-type.json'

import constants from './constants.json'
import widget from './components/template/widget/widget.json'


import setOfBooks from './finance-setting/set-of-books.json'
import borrowingLimitControl from './finance-setting/borrowing-limit-control.json'
import companyAccountSetting from './pay-setting/company-account-setting.json';
import invitePersonModal from './enterprise-manage/person-manage/person-manage-components/invite.person.modal.json';
import importErrInfo from './components/template/import-err-info.json';
import chooseData from './chooserData.json';
import searcherData from './searcherData.json';
import request from './request/request.json'
import requestDetail from './request/request-detail.json'
import PrePaymentType from './receipt-type-setting/pre-payment-type.json'
import contractType from './receipt-type-setting/contract-type.json'
//wjk add 差旅行程 18 06 02
import travelRequest from './request/travel-request/travel-request.json'
import budgetParameter from './budget-setting/budget-organization/budget-parameter.json';
//选择人员组组件
import selectEmployeeGroup from './components/template/select-employee-group.json'
// 配置中心
import configurationCenter from './setting/configure-center/configure-center.json'
// 配置项详情
import configurationDetail from './setting/configure-center/configure-detail.json'
//审批条
import approveBar from './components/template/approve-bar.json'
//扫码
import scan from './financial-management/scan.json'
//编码规则
import codingRule from './setting/code-rule/coding-rule.json'
import codingRuleValue from './setting/code-rule/coding-rule-value.json'
import customField from './customField.json'
import borrowAndReturn from './borrow-and-return/borrow-and-return.json'
//单据提醒关联
import beepTimer from './setting/beep-timer/beep-timer.json'
//币种设置
import currencySetting from './setting/currency-setting/currency-setting.json'
//表单管理
import formSetting from './setting/form/form-setting.json'
//公司级别定义
import companyLevelDefine from './setting/company-level-define/company-level-define.json'

//邮件打印通知
import emailNotification from './setting/email-notification/email-notification.json'
//审批流
import workflow from './setting/workflow/workflow.json'


import expReportReverseCheck from './financial-management/exp-report-reverse-check.json'
import expReportReverseCheckDetail from './financial-management/exp-report-reverse-check-detail.json'
import publicReimburseReport from './financial-view/public-reimburse-report.json'
import AccountingView from './financial-view/accounting-view.json'
import paymentRequisition from './payment-requisition/payment-requisition.json'
import job from './job/job.json'
import payRefund from './pay/pay-refund.json'
import payBacklash from './pay/pay-backlash.json'
//报表分配
// import dataCenterReport from './data-center/report/report.json';
// import dataCenterTravelReport from './data-center/report/travel-report/travel-report.json';
// import dataCenterTravelReportSet from './data-center/report/travel-report/travel-report-setting.json';
import dataCenterReport from './data-center/report/report.json';
import dataCenterTravelReport from './data-center/report/travel-report/travel-report.json';

//费用类型
import expenseType from './setting/expense-type.json'
import budgetSetting from './budget-setting/budget-setting.json'
//成本中心组
import costCenterGroup from './setting/cost-center-group/cost-center-group.json'

import cshWriteOffBacklash from './financial-management/csh-write-off-backlash.json'

// 供应商类型
import supplierType from './setting/supplier-type/supplier-type.json'
import expenseAdjust from './expense-adjust/expense-adjust.json'

const i18nList = [
  main,
  chooser,
  imageUpload,
  listSelector,
  searchArea,
  chooseData,
  searcherData,
  dashboardAdmin,
  enterpriseManage,//企业管理
  OrgNewDep,//组织架构组件
  OrgPersonInfo,//组织架构组件
  OrgRoles,//组织架构组件
  OrgRolesList,//组织架构组件
  OrgSearchList,//组织架构组件
  OrgTree,//组织架构组件
  selectDepmentOrPerson,//选人组件
  orgSearchList,//选人搜索子组件
  languageInput,//多语言组件
  resetPassword,//重置密码
  proxies,//代理组件

  RoleSetting,//角色设置
  RoleSettingReceipt,//角色设置:收单
  RoleSettingFinance,//角色设置:财务
  RoleSettingBooking,//角色设置:订票
  RoleSettingAdmin,//角色设置:管理员
  RoleSettingData, 
  OperationLog,//操作日志
  UserAgreement,//用户协议
  legalPerson,//法人实体列表
  newLegalPerson,//新增编辑法人实体
  legalPersonDetail,//法人实体详情
  extendField,//人员信息扩展字段页面
  stopAnnounce,//停机公告
  exportModal,//导出控件
  extendFieldComponent,//扩展字段组件
  CostCenter,//成本中心
  CostCenterDetail,//成本中心详情
  NewCostCenter,//新增成本中心
  CostCenterExtendFiled,//成本中心扩展字段
  CostCenterItemDetail,//成本中心项
  NewCostCenterItem,//新增成本中心项
  personManage,//员工管理
  invitePersonModal,//邀请员工组件
  importErrInfo,//导入时显示错误信息的组件
  personManageDetail,//人员信息详情界面
  personDetailBankCard,//人员信息详情界面-银行卡组件
  personDetailBasicInfoExtend,//人员信息详情界面-扩展字段组件
  personDetailBasicInfo,//人员信息详情界面-基本信息组件
  personDetailSomeIdCard,//人员信息详情界面-证件信息组件
  personDetailVendorInfo,//人员信息详情界面-供应商组件
  common,  // 公用
  login,  // 登录及主界面
  menu,  // 菜单
  budgetOrganization, // 预算组织
  budgetStructure,  // 预算表
  budgetItem,  // 预算项目
  budgetGroup, //预算组
  budgetControlRules, // 预算控制规则
  payWorkbench, // 付款工作台
  budgetVersion, // 预算版本
  budgetItemType, // 预算项目类型
  budgetJournal,  // 预算日记账
  bankDefinition, // 银行定义
  agencySetting, // 代理设置
  securitySetting, // 安全设置
  accountPeriodDefine, // 会计期间定义
  accountPeriodControl, // 会计期间控制
  companyMaintain,     // 公司维护
  financeView, // 单据查看
  checkCostApplication,//费用申请单查看
  paymentBatch, //付款批次
  waitForBilling,//待开票
  departmentGroup, // 部门组
  personGroup,//人员组
  companyGroup, //公司组
  paymentMethod,  // 付款方式定义
  paymentCompanySetting, // 付款公司配置
  cashFlowItem,  // 现金流量项
  cashTransactionClass,   // 现金事物
  subjectSheet,    // 科目表
  checkCenter,    // 对账中心
  announcementInformation,  // 公告信息
  valueList,               //值列表
  budgetItemMap,            // 项目映射
  supplierManagement,       // 供应商管理
  sectionStructure,       //科目段结构
  accountingSourceSystem, //来源事物-系统级
  accountingSource,       //来源事物-账套级
  accountingScenariosSystem, //核算场景系统级
  accountingScenarios,     //核算场景账套级
  budgetScenarios, //预算场景
  budgetStrategy, //预算控制策略
  budgetOccupancy, //预算占用调整
  importer, //导入组件
  myContract, //合同-我的合同
  contract, //审批-合同
  batchPrintInvoice,       //批量打印电子票
  upload, //上传组件
  applicationTypeManagement, //申请类型管理
  travelStandard, //差旅标准
  subsidyRules, //差补规则
  cityLevel, //城市级别
  myReimburse, //我的对账
  bookingManagement, //订票管理
  budgetBalance, //预算余额
  myAgency, //我的代理
  mileageSubsidy,//里程补贴
  mileageSubsidyExpense,//里程补贴费用
  newMileageCost,//新建里程补贴费用
  bookingManagement,//订票管理
  callbackSetting, //回调设置
  overView, //供应商管理dashboard
  supplierDetail, //供应商管理详情
  enableService, //启用供应商服务
  invoiceManagement, //发票管理
  constants,  //常量值
  widget,  //控件
  setOfBooks,  //账套
  borrowingLimitControl, //借款金额上限控制
  companyAccountSetting,//公司账户设置
  requestDetail, //申请单详情
  travelRequest, //差旅行程 wjk add 18 06 02
  request, //申请单列表
  budgetParameter,  //预算参数
  financeAudit, //财务审核详情
  loanAndRefund,//借还款管理
  confirmPayment,//确认还款
  approveRequest,//申请单审批
  priceReview,//价格审核
  selectEmployeeGroup,//选择人员组组件
  configurationCenter, // 配置中心
  configurationDetail,  //配置项详情
  expenseReport,  //报销单
  expense,  //我的账本
  approveBar,  //审批条
  scan,  //扫码
  codingRule,  //编码规则
  beepTimer, //单据提醒管理
  codingRuleValue, //编码规则值
  subApplication, //子应用管理
  customField,  //自定义表单
  borrowAndReturn, //借款及还款
  currencySetting,//币种设置
  formSetting,//表单管理
  companyLevelDefine,//公司级别定义
  ExpAdjustType, //费用调整单类型定义
  PrePaymentType, //预付款单类型定义
  expReportReverseCheck,
  expReportReverseCheckDetail,
  cshWriteOffBacklash, //核销反冲
  publicReimburseReport, //对公报账单
  AccountingView,  //会计分录查询
  paymentRequisition, //付款申请单
  job,  // 调度中心
  payRefund, //付款退款,
  payBacklash, //付款复核
  supplierType,//供应商类型
  expenseAdjust, //费用调整单
  expenseReserve, //费用反冲
  contractType, //合同类型定义
  dataCenterReport,
  dataCenterTravelReport,
  // dataCenterTravelReportSet,
  workflow, //审批流
  expenseType,  //费用类型
  budgetSetting,
  costCenterGroup,//成本中心组
];

let result = {};

i18nList.map((i18n) => {
  result = Object.assign(result, i18n);
});

export default result;
