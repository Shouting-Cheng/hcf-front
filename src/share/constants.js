import { messages } from 'utils/utils';
/**
 * 存储常量值
 */
export default {
  getTextByValue(value, type, attr = 'text') {
    let result = '';
    this[type] &&
      this[type].map(item => {
        if (item.value + '' === value + '') if (value === '1001') console.log(item[attr]);
        result = item[attr];
      });
    return result;
  },
  apportionInvoiceType: ['01', '03', '004', '005', '007', '008', '009', '010'],
  documentType: [
    {
      value: 3001,
      text: messages('documentType.expense.report'), //日常报销单
    },
    //   {
    //   value: 2001,
    //   text: messages('email.notification.travel.request')  //差旅申请单
    // }, {
    //   value: 2002,
    //   text: messages('email.notification.special.expense.request') //费用申请单
    // },
    {
      value: 2005,
      text: messages('documentType.loan.request'), //借款
    },
    {
      value: 801008,
      text: '核算工单',
    },
    {
      value: 801001,
      text: '对公报账单',
    },
    {
      value: 801002,
      text: '预算日记账',
    },
    {
      value: 801003,
      text: '预付款单',
    },
    {
      value: 801004,
      text: '合同',
    },
    {
      value: 801005,
      text: '付款申请单',
    },
    {
      value: 801006,
      text: '费用调整单',
    },
    {
      value: 2003,
      text: '订票申请单',
    },
    {
      value: 2004,
      text: '京东申请单',
    },
    {
      value: 2001,
      text: '差旅申请单',
    },
    {
      value: 2002,
      text: '费用申请单',
    },
  ],
  documentTypeForShow: [
    {
      value: 3001,
      text: messages('documentType.expense.report'), //报销单
    },
    {
      value: 3002,
      text: messages('documentType.expense.report'), //报销单
    },
    {
      value: 3003,
      text: messages('documentType.expense.report'), //报销单
    },
    // {
    //   value: 2001,
    //   text: messages('documentType.travel.request')  //差旅
    // }, {
    //   value: 2002,
    //   text: messages('documentType.expense.request') //费用
    // }, {
    //   value: 2003,
    //   text: messages('documentType.book.request') //订票
    // }, {
    //   value: 2004,
    //   text: messages('documentType.jd.request') //京东
    // }, {
    //   value: 2005,
    //   text: messages('documentType.loan.request') //借款
    // },
    {
      value: 801008,
      text: '核算工单',
    },
    {
      value: 801001,
      text: '对公报账单',
    },
    {
      value: 801002,
      text: '预算日记账',
    },
    {
      value: 801003,
      text: '预付款单',
    },
    {
      value: 801004,
      text: '合同',
    },
    {
      value: 801005,
      text: '付款申请单',
    },
    {
      value: 801006,
      text: '费用调整单',
    },
    {
      value: 2003,
      text: '订单票申请单',
    },
    {
      value: 2004,
      text: '京东申请单',
    },
    {
      value: 2001,
      text: '差旅申请单',
    },
    {
      value: 2002,
      text: '费用申请单',
    },
  ],
  visibleUserScope: [
    {
      value: 1001,
      code: 'all',
      text: messages('visibleUserScope.all'), //所有
    },
    {
      value: 1002,
      code: 'group',
      text: messages('visibleUserScope.user.group'), //人员组
    },
    {
      value: 1003,
      code: 'department',
      text: messages('visibleUserScope.department'), //部门员工
    },
    {
      value: 1004,
      code: 'request',
      text: messages('visibleUserScope.same.as.request'), //和关联的申请单范围一致
    },
  ],
  visibleExpenseTypeScope: [
    {
      value: 1001,
      code: 'all',
      text: messages('visibleExpenseTypeScope.all'), //所有类型
    },
    {
      value: 1002,
      code: 'part',
      text: messages('visibleExpenseTypeScope.part'), //部分类型
    },
    {
      value: 1003,
      code: 'application1',
      text: messages('visibleExpenseTypeScope.application1'), //和关联的申请单据范围一致
    },
    {
      value: 1004,
      code: 'application2',
      text: messages('visibleExpenseTypeScope.application2'), //和关联的申请表单范围一致
    },
  ],
  visibleCompanyScope: [
    {
      value: 1,
      text: messages('visibleCompanyScope.all'), //全部适用
    },
    {
      value: 2,
      text: messages('visibleCompanyScope.part'), //部分适用
    },
  ],
  CurrencyCode: {
    USD: '$',
    CNY: '¥',
    EUR: '€',
    JPY: 'J¥',
    SGD: 'S$',
    KRW: '₩',
    GBP: '£',
    CAD: 'CAN$',
    TWD: 'NT$',
    HKD: 'HK$',
    AUD: 'A$',
    CHF: 'Fr',
    MYR: 'M.＄',
    ZAR: 'R',
    THB: '฿',
    SEK: 'kr',
    KES: 'K.Sh',
    DKK: 'kr',
    CLP: 'P',
    PHP: '₱',
    MXN: '$',
    AED: 'د.إ',
    INR: '₨',
    RUB: 'руб',
    BRL: 'R$',
    NZD: 'NZ$',
  },
  MESSAGE_KEY: {
    costCenter: 'select_cost_center', // 成本中心
    currencyCode: 'currency_code', // 币种
    title: 'title', // 事由
    number: 'number', // 数字
    remark: 'remark', // 备注
    department: 'select_department', // 部门
    approver: 'select_approver', // 审批人
    writeoff: 'writeoff_flag', // 核销
    startDate: 'start_date', // 开始日期
    endDate: 'end_date', // 结束日期
    bookingPerson: 'select_special_booking_person', // 订票专员
    budgetDetail: 'budget_detail', // 预算明细
    supplier: 'select_supplier', // 选择供应商
    participant: 'select_participant', // 参与人
    totalBudget: 'total_budget', // 总预算
    destination: 'destination', // 目的地
    airTicketSupplier: 'select_air_ticket_supplier', // 机票供应商
    outParticipantNum: 'out_participant_num', // 外部参与人员数量
    outParticipantName: 'out_participant_name', //外部参与人员姓名
    selectCorporationEntity: 'select_corporation_entity', // 法人实体
    selectCompany: 'select_company', // 公司
    linkageSwitch: 'linkage_switch', // 联动开关
    textArea: 'text_area', // 多行输入框
    attachment: 'attachment', // 附件
    contactBankAccount: 'contact_bank_account', // 银行卡关联
    date: 'date', // 日期
    applicant: 'applicant', // 申请人
    selectBox: 'select_box', // 选择框
    custList: 'cust_list', //值列表
    time: 'time', // 时间
    switch: 'switch', // 开关
    venMaster: 'venMaster', //收款单位/个人
    yfAudit: 'ying_fu_select_approver', //英孚选择审批人控件
    selectUser: 'select_user', //选择用户
    substitutionInvoice: 'substitution_invoice', //替票
    image: 'image', //图片
    vatInvoice: 'vat_invoice', //收款单位/个人
    apportion: 'exp_allocate', //费用分摊
    dateTime: 'dateTime', //日期时间
    venMasterSwitch: 'venMasterSwitch', //是否对供应商支付
    employeeExpand: 'employee_expand', // 个人信息扩展字段
    payee: 'payee', //付款控件
    externalParticipantName: 'external_participant_name', //乘机人姓名
  },
  expenseStatus: [
    {
      label: messages('constants.documentStatus.editing'),
      value: '10011000',
      state: 'processing',
      operate: 'edit',
    }, //编辑中 rejectType= 1001,1000
    {
      label: messages('constants.documentStatus.has.withdrawn'),
      value: '10011001',
      state: 'warning',
      operate: 'edit',
    }, // 已撤回 rejectType === 1001
    {
      label: messages('constants.documentStatus.auditing'),
      value: '1002',
      state: 'processing',
      operate: 'processing',
    }, //审批中
    {
      label: messages('constants.documentStatus.has.been.rejected'),
      value: '10011002',
      state: 'error',
      operate: 'edit',
    }, //已驳回 rejectType === 1002
    {
      label: messages('constants.documentStatus.yet.pass'),
      value: '1003',
      state: 'success',
      operate: 'finish',
    }, //已通过
    {
      label: messages('constants.documentStatus.audit.pass'),
      value: '1004',
      state: 'success',
      operate: 'finish',
    }, //审核通过
    {
      label: messages('constants.documentStatus.invoice.pass'),
      value: '1007',
      state: 'success',
      operate: 'billing',
    }, //开票通过
    {
      label: messages('constants.documentStatus.audit.rejected'),
      value: '10011003',
      state: 'error',
      operate: 'edit',
    }, //审核驳回 rejectType === 1003
    {
      label: messages('constants.documentStatus.invoice.rejected'),
      value: '10011004',
      state: 'error',
      operate: 'edit',
    }, //开票驳回 rejectType === 1004
    {
      label: messages('constants.documentStatus.yet.pay'),
      value: '1005',
      state: 'success',
      operate: 'pay',
    }, //已付款
    {
      label: messages('constants.documentStatus.paying'),
      value: '1008',
      state: 'processing',
      operate: 'pay',
    }, //付款中
  ],
  documentStatus: [
    {
      text: messages('constants.documentStatus.all'),
      value: '10011002100310041005100610071008',
      operate: '',
    }, //全部
    {
      text: messages('constants.documentStatus.editing'),
      value: '1001',
      state: 'processing',
      operate: 'edit',
    }, //编辑中
    {
      text: messages('constants.documentStatus.has.withdrawn'),
      value: '10011001',
      state: 'warning',
      operate: 'edit',
    }, //已撤回 rejectType === 1001
    {
      text: messages('constants.documentStatus.has.been.rejected'),
      value: '10011002',
      state: 'error',
      operate: 'edit',
    }, //已驳回 rejectType === 1002
    {
      text: messages('constants.documentStatus.audit.rejected'),
      value: '10011003',
      state: 'error',
      operate: 'edit',
    }, //审核驳回 rejectType === 1003
    {
      text: messages('constants.documentStatus.invoice.rejected'),
      value: '10011004',
      state: 'error',
      operate: 'edit',
    }, //开票驳回 rejectType === 1004
    {
      text: messages('constants.documentStatus.auditing'),
      value: '1002',
      state: 'processing',
      operate: 'processing',
    }, //审批中
    {
      text: messages('constants.documentStatus.yet.pass'),
      value: '1003',
      state: 'success',
      operate: 'finish',
    }, //已通过
    {
      text: messages('constants.documentStatus.audit.pass'),
      value: '1004',
      state: 'success',
      operate: 'finish',
    }, //审核通过
    {
      text: messages('constants.documentStatus.yet.pay'),
      value: '1005',
      state: 'success',
      operate: 'pay',
    }, //已付款
    {
      text: messages('constants.documentStatus.repaying'),
      value: '1006',
      state: 'processing',
      operate: 'processing',
    }, //还款中
    {
      text: messages('constants.documentStatus.invoice.pass'),
      value: '1007',
      state: 'success',
      operate: 'billing',
    }, //开票通过
    {
      text: messages('constants.documentStatus.yet.repayment'),
      value: '10072005',
      state: 'success',
      operate: 'finish',
    }, //已还款 applicationType === 2005
    {
      text: messages('constants.documentStatus.paying'),
      value: '1008',
      state: 'processing',
      operate: 'pay',
    }, //付款中
    {
      text: messages('constants.documentStatus.yet.disable'),
      value: '1009',
      state: 'default',
      operate: '',
    }, //已停用
    {
      text: messages('constants.documentStatus.updated'),
      value: '1011',
      state: 'default',
      operate: '',
    }, //已更改
  ],
  paymentMethodCategory: [
    {
      value: 'ONLINE_PAYMENT',
      text: messages('constants.paymentMethodCategory.online') /*线上*/,
    },
    {
      value: 'OFFLINE_PAYMENT',
      text: messages('constants.paymentMethodCategory.offline') /*线下*/,
    },
    {
      value: 'EBANK_PAYMENT',
      text: messages('constants.paymentMethodCategory.landingFile') /*落地文件*/,
    },
  ],
  expenseReportChildrenType: [
    {
      id: 'er.split.receipt',
      name: messages('constants.expenseReportChildrenType.receipt') /*'贴票费用'*/,
    },
    {
      id: 'er.split.ctrip',
      name: messages('constants.expenseReportChildrenType.ctrip') /*'携程金额'*/,
    },
    {
      id: 'er.split.didi',
      name: messages('constants.expenseReportChildrenType.didi') /*'滴滴出行'*/,
    },
    {
      id: 'er.split.changguan',
      name: messages('constants.expenseReportChildrenType.changguan') /*'场馆金额'*/,
    },
    {
      id: 'er.split.huafei',
      name: messages('constants.expenseReportChildrenType.huafei') /*'话费金额'*/,
    },
    {
      id: 'er.split.youka',
      name: messages('constants.expenseReportChildrenType.youka') /*'油卡金额'*/,
    },
    {
      id: 'er.split.default',
      name: messages('constants.expenseReportChildrenType.default') /*'类型未知'*/,
    },
  ],
  invoiceChildrenStatus: [
    //驳回逻辑
    { id: 1001, type: 1001, name: messages('constants.documentStatus.has.withdrawn') /*'已撤回'*/ },
    { id: 1001, type: 1002, name: messages('my.contract.state.rejected') /*'已驳回'*/ },
    {
      id: 1001,
      type: 1003,
      name: messages('constants.approvelHistory.auditReject') /*'审核驳回'*/,
    },
    {
      id: 1001,
      type: 1004,
      name: messages('constants.approvelHistory.invoiceFail') /*'开票驳回'*/,
    },
    { id: 1002, type: 1000, name: messages('constants.documentStatus.auditing') /*'审批中'*/ },
    { id: 1003, type: 1000, name: messages('constants.documentStatus.yet.pass') /*'已通过'*/ },
    { id: 1004, type: 1000, name: messages('constants.documentStatus.audit.pass') /*'审核通过'*/ },
    { id: 1005, type: 1000, name: messages('constants.documentStatus.yet.pay') /*'已付款'*/ },
    { id: 1006, type: 1000, name: messages('constants.approvelHistory.repayments') /*'还款中'*/ },
    {
      id: 1007,
      type: 1000,
      name: messages('constants.documentStatus.invoice.pass') /*'开票通过'*/,
    },
    { id: 1008, type: 1000, name: messages('constants.documentStatus.paying') /*'付款中'*/ },
  ],
  approvelHistory: [
    {
      id: 1,
      text: messages('constants.approvelHistory.submit') /*"提交"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 2,
      text: messages('constants.approvelHistory.withdraw') /*"撤回"*/,
      icon: 'down-circle-o',
      color: '#EBA945',
    },
    {
      id: 3,
      text: messages('constants.approvelHistory.submitTicket') /*"提交贴票"*/,
      icon: 'down-circle-o',
      color: '#EBA945',
    },
    {
      id: 11,
      text: messages('constants.approvelHistory.approvePass') /*"审批通过"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 12,
      text: messages('constants.approvelHistory.approveReject') /*"审批驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 21,
      text: messages('constants.approvelHistory.ticketPass') /*"贴票通过"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 22,
      text: messages('constants.approvelHistory.ticketReject') /*"贴票驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 31,
      text: messages('constants.approvelHistory.auditPass') /*"审核通过"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 32,
      text: messages('constants.approvelHistory.auditReject') /*"审核驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 1001,
      text: messages('constants.approvelHistory.submit') /*"提交"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 1002,
      text: messages('constants.approvelHistory.withdraw') /*"撤回"*/,
      icon: 'down-circle-o',
      color: '#EBA945',
    },
    {
      id: 1003,
      text: messages('constants.approvelHistory.applicationChange') /*"申请单更改"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 2001,
      text: messages('constants.approvelHistory.approvePass') /*"审批通过"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 2002,
      text: messages('constants.approvelHistory.approveReject') /*"审批驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 2003,
      text: messages('constants.approvelHistory.singleReject') /*"﻿单笔驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 3001,
      text: messages('constants.approvelHistory.auditPass') /*"审核通过"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 3002,
      text: messages('constants.approvelHistory.auditReject') /*"审核驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 3003,
      text: messages('constants.approvelHistory.auditReceive') /*"财务已收单"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 3004,
      text: messages('constants.approvelHistory.auditPretest') /*"财务预检"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 3005,
      text: messages('constants.approvelHistory.mailSuccess') /*"退回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 3006,
      text: messages('constants.approvelHistory.auditNotice') /*"财务通知"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 3007,
      text: messages('constants.approvelHistory.receive') /*"寄单成功"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 4000,
      text: messages('constants.approvelHistory.auditPaying') /*"财务付款中"*/,
      icon: 'clock-circle-o',
      color: '#63B8EE',
    },
    {
      id: 4001,
      text: messages('constants.approvelHistory.auditPay') /*"财务付款"*/,
      icon: 'pay-circle-o',
      color: '#A191DA',
    },
    {
      id: 4002,
      text: messages('constants.approvelHistory.billingFail') /*"﻿付款失败"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 4011,
      text: messages('constants.approvelHistory.auditBilling') /*"财务已开票"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 4012,
      text: messages('constants.approvelHistory.invoiceFail') /*"开票驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 5000,
      text: messages('constants.approvelHistory.transferAccountRepaymentSubmit') /*"转账还款提交"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 5001,
      text: messages('constants.approvelHistory.cashRepaySubmit') /*"现金还款提交"*/,
      icon: 'check-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 5002,
      text: messages('constants.approvelHistory.auditReceivablesThrough') /*"财务收款通过"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 5003,
      text: messages('constants.approvelHistory.auditDismissal') /*"财务收款驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 5004,
      text: messages('constants.approvelHistory.repayments') /*"还款中"*/,
      icon: 'clock-circle-o',
      color: '#63B8EE',
    },
    {
      id: 5005,
      text: messages('constants.approvelHistory.companyBlockUp') /*"企业停用"*/,
      icon: 'minus-circle-o',
      color: '#E57670',
    },
    {
      id: 5006,
      text: messages('constants.approvelHistory.blockUp') /*"停用申请"*/,
      icon: 'minus-circle-o',
      color: '#E57670',
    },
    {
      id: 5007,
      text: messages('constants.approvelHistory.againEnable') /*"重新启用"*/,
      icon: 'up-circle-o',
      color: '#63B8EE',
    },
    {
      id: 5009,
      text: messages('constants.approvelHistory.sign') /*"加签"*/,
      icon: null,
      color: null,
    },
    {
      id: 6001,
      text: messages('constants.approvelHistory.bookingLaunch') /*"订票专员发起机票信息确认"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 6002,
      text: messages('constants.approvelHistory.userConfirm') /*"用户确认信息合适"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 6003,
      text: messages('constants.approvelHistory.userTicketDiscomfort') /*"用户确认机票不合适"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 6004,
      text: messages(
        'constants.approvelHistory.bookingPriceApprove'
      ) /*"订票专员发起机票价格审核"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 6005,
      text: messages('constants.approvelHistory.priceApprovePass') /*"价格审核通过"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 6006,
      text: messages('constants.approvelHistory.priceApproveReject') /*"价格审核驳回"*/,
      icon: 'close-circle-o',
      color: '#E57670',
    },
    {
      id: 6007,
      text: messages('constants.approvelHistory.launchChangeSign') /*"发起改签"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 6008,
      text: messages('constants.approvelHistory.launchReturn') /*"发起退票"*/,
      icon: 'up-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 6009,
      text: messages('constants.approvelHistory.finishSign') /*"完成改签"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 6010,
      text: messages('constants.approvelHistory.finishReturn') /*"完成退票"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 6011,
      text: messages('constants.approvelHistory.finishApply') /*"完成订票"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 6012,
      text: messages('constants.approvelHistory.priceApprove') /*"审批通过需要价格审核"*/,
      icon: 'pay-circle-o',
      color: '#4CA8BC',
    },
    {
      id: 7001,
      text: messages('constants.approvelHistory.amountEdit') /*"核定金额修改"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 7002,
      text: messages('constants.approvelHistory.rateEdit') /*"核定汇率修改"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 7003,
      text: messages('constants.approvelHistory.amountAndRateEdit') /*"核定金额和汇率修改"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 8001,
      text: messages('constants.approvelHistory.replay') /*"员工回复"*/,
      icon: 'check-circle-o',
      color: '#5EBD93',
    },
    {
      id: 8002,
      text: messages('constants.approvelHistory.addAttachment') /*附件上传*/,
      icon: 'check-circle-o',
      color: '5EBD93',
    },
    {
      id: 8003,
      text: messages('constants.approvelHistory.deleteAttachment') /*附件删除*/,
      icon: 'check-circle-o',
      color: '5EBD93',
    },
  ],
  modifyRecord: [
    //财务角色修改记录
    { value: 101, text: messages('constants.modifyRecord.create.role') }, //创建角色
    { value: 102, text: messages('constants.modifyRecord.modify.basic.info') }, //修改了基本信息
    { value: 103, text: messages('constants.modifyRecord.modify.user.assignment') }, //修改了人员分配
    { value: 104, text: messages('constants.modifyRecord.modify.organization.auth') }, //修改了组织权限
    { value: 105, text: messages('constants.modifyRecord.modify.page.auth') }, //修改了页面权限
  ],
  bookerType: [
    //订票类型
    { value: 1001, text: messages('constants.bookerType.order') }, //订票
    { value: 1002, text: messages('constants.bookerType.change') }, //改签
    { value: 1003, text: messages('constants.bookerType.refund') }, //退票
  ],
  ticketStatus: [
    //机票状态
    { value: 1001, text: messages('constants.ticketStatus.waitPriceOrder') }, //待订票
    { value: 1002, text: messages('constants.ticketStatus.refunded') }, //已退票
    { value: 1003, text: messages('constants.ticketStatus.endorsed') }, //已改签
    { value: 1004, text: messages('constants.ticketStatus.deleted') }, //已删除
    { value: 1005, text: messages('constants.ticketStatus.booked') }, //已订票
    { value: 1006, text: messages('constants.ticketStatus.waitRefund') }, //待退票
    { value: 1007, text: messages('constants.ticketStatus.waitEndorse') }, //待改签
    { value: 1008, text: messages('constants.ticketStatus.waitPriceReview') }, //等待价格审核
    { value: 1009, text: messages('constants.ticketStatus.priceReviewPass') }, //价格审核完成
    { value: 1010, text: messages('constants.ticketStatus.priceReviewReject') }, //价格审核驳回
    { value: 1011, text: messages('constants.ticketStatus.goRefundApproval') }, //发起退票审批
    { value: 1012, text: messages('constants.ticketStatus.goEndorseApproval') }, //发起改签审批
    { value: 1013, text: messages('constants.ticketStatus.refundApprovalReject') }, //退票审批驳回
    { value: 1014, text: messages('constants.ticketStatus.endorseApprovalReject') }, //改签审批驳回
  ],
  ticketConfirmStatus: [
    //机票进度确认状态
    { value: 1000, text: messages('constants.ticketConfirmStatus.initialState') }, //初始状态
    { value: 1001, text: messages('constants.ticketConfirmStatus.waitConfirmation') }, //等待信息确认
    { value: 1002, text: messages('constants.ticketConfirmStatus.informationConfirmed') }, //信息已确认
    { value: 1003, text: messages('constants.ticketConfirmStatus.inappropriateInformation') }, //信息不合适
  ],
  ticketPriceStatus: [
    //票价审核状态
    { value: 1001, text: messages('constants.ticketPriceStatus.initialState') }, //申请
    { value: 1005, text: messages('constants.ticketPriceStatus.waitPriceReview') }, //等待价格审核
    { value: 1006, text: messages('constants.ticketPriceStatus.priceReviewPass') }, //价格审核完成
    { value: 1007, text: messages('constants.ticketPriceStatus.priceReviewReject') }, //价格审核驳回
  ],
  symbolFilter: [
    //审批条件类型
    { value: 9001, text: '<' },
    { value: 9002, text: '≤' },
    { value: 9003, text: '<' },
    { value: 9004, text: '≤' },
    { value: 9005, text: '=' },
    { value: 9006, text: '!=' },
    { value: 9007, text: messages('constants.bookerType.contain') }, //包含
    { value: 9008, text: messages('constants.bookerType.notContain') }, //不包含
    { value: 9009, text: messages('constants.bookerType.contain') }, //包含
    { value: 9010, text: messages('constants.bookerType.notContain') }, //不包含
    { value: 9011, text: messages('constants.bookerType.range') }, //范围
    { value: 9012, text: messages('constants.bookerType.yes') }, //是
    { value: 9013, text: messages('constants.bookerType.no') }, //否
    { value: 9015, text: messages('constants.bookerType.blank') }, //为空
    { value: 9016, text: messages('constants.bookerType.notBlank') }, //不为空
  ],
  cashName: [
    { value: 'USD', text: messages('constants.cashName.USD') }, //美元
    { value: 'CNY', text: messages('constants.cashName.CNY') }, //人民币
    { value: 'JPY', text: messages('constants.cashName.JPY') }, //日元
    { value: 'SGD', text: messages('constants.cashName.SGD') }, //新加坡元
    { value: 'KRW', text: messages('constants.cashName.KRW') }, //韩元
    { value: 'EUR', text: messages('constants.cashName.EUR') }, //欧元
    { value: 'GBP', text: messages('constants.cashName.GBP') }, //英镑
    { value: 'CAD', text: messages('constants.cashName.CAD') }, //加元
    { value: 'AUD', text: messages('constants.cashName.AUD') }, //澳币
    { value: 'HKD', text: messages('constants.cashName.HKD') }, //港元
    { value: 'SUR', text: messages('constants.cashName.SUR') }, //俄罗斯卢布
    { value: 'CHF', text: messages('constants.cashName.CHF') }, //瑞士法郎
    { value: 'MYR', text: messages('constants.cashName.MYR') }, //马来西亚令吉
    { value: 'ZAR', text: messages('constants.cashName.ZAR') }, //南非兰得
    { value: 'THB', text: messages('constants.cashName.THB') }, //泰铢
    { value: 'SEK', text: messages('constants.cashName.SEK') }, //瑞典克朗
    { value: 'KES', text: messages('constants.cashName.KES') }, //肯尼亚先令
    { value: 'DKK', text: messages('constants.cashName.DKK') }, //丹麦克朗
    { value: 'CLP', text: messages('constants.cashName.CLP') }, //智利比索
    { value: 'PHP', text: messages('constants.cashName.PHP') }, //菲律宾比索
    { value: 'MXN', text: messages('constants.cashName.MXN') }, //墨西哥比索
    { value: 'AED', text: messages('constants.cashName.AED') }, //阿联酋迪尔汗
    { value: 'INR', text: messages('constants.cashName.INR') }, //印度卢比
    { value: 'RUB', text: messages('constants.cashName.RUB') }, //俄罗斯卢布
    { value: 'BRL', text: messages('constants.cashName.BRL') }, //巴西雷亚尔
    { value: 'NZD', text: messages('constants.cashName.NZD') }, //纽西兰元
    { value: 'BGN', text: messages('constants.cashName.BGN') }, //保加利亚列瓦
    { value: 'BIF', text: messages('constants.cashName.BIF') }, //布隆迪法郎
  ],
  autoAuditType: [
    //财务自动审核类型
    { value: 1001, text: '发票标签' },
    { value: 1002, text: '电子发票原件' },
    { value: 2001, text: '费用标签' },
    { value: 2002, text: '附件' },
    { value: 2003, text: '费用类型' },
    { value: 2004, text: '费用金额' },
    { value: 3001, text: '收款方类型' },
    { value: 4001, text: '单据标签' },
    { value: 4002, text: '附件' },
    { value: 4003, text: '单据类型' },
    { value: 4004, text: '单据金额' },
  ],
  autoAuditRelative: [
    //自动审核相关类型
    { value: 1000, text: '发票相关' },
    { value: 2000, text: '费用相关' },
    { value: 3000, text: '付款相关' },
    { value: 4000, text: '单据相关' },
  ],
  /*
  * 第三方OA 统一跳转 新中控，路由配置,后来重新整理，根据 messageType 来跳转对应url
  * 元素字段说明
  * name 路由名字，暂时对逻辑没有影响
  * messageType 消息类型，根据此判断跳转哪一个路由
  * requireParams 跳转路由需要的参数，一个或者多个，需要替换路由中对应的参数
  * targetUrl 需要跳转的路由
  * */
  unifiedJumpConfig: [
    {
      name: '我的报销单详情',
      messageType: [
        'EXPENSE_REPORT_REJECT',
        'EXPENSE_REPORT_PASS',
        'EXPENSE_REPORT_AUDIT_NOTICE',
        'REVEIEWED_AMOUNT',
        'EXPENSE_REPORT_AUDIT_PASS',
        'EXPENSE_REPORT_AUDIT_REJECT',
        'EXPENSE_REPORT_PAY_FAILED',
      ],
      requireParams: ['referenceId'],
      targetUrl: '/main/expense-report/expense-report-detail/:referenceId/my',
    },
    {
      name: '报销单待审批',
      messageType: ['EXPENSE_REPORT_APPROVAL'],
      requireParams: ['referenceId', 'approverOID'],
      targetUrl:
        '/main/approve/approve-expense-report/approve-expense-report-detail/:referenceId?approvePending=true&approverOID=:approverOID',
    },
    {
      name: '我的账本',
      messageType: [
        'EXPENSE_REPORT_INVOICE_AUDIT_REJECT',
        'EXPENSE_REPORT_INVOICE_REJECT',
        'INVOICE_REJECT',
      ],
      requireParams: [],
      targetUrl: '/main/my-account',
    },
    {
      name: '申请单审批，待审批详情页面',
      messageType: [
        'TRAVEL_APPLICATION_APPROVAL',
        'EXPENSE_APPLICATION_APPROVAL',
        'LOAN_APPLICATION_APPROVAL',
      ],
      requireParams: ['formOID', 'referenceId', 'approverOID'],
      targetUrl:
        '/main/approve/approve-request/approve-request-detail/:formOID/:referenceId?approving=true&approverOID=:approverOID',
    },
    {
      name: '申请单审批通过，借款单审核，待审核详情页面',
      messageType: ['TRAVEL_APPLICATION_PASS', 'EXPENSE_APPLICATION_PASS', 'LOAN_APPLICATION_PASS'],
      requireParams: ['formOID', 'referenceId'],
      targetUrl: '/main/request/request-detail/:formOID/:referenceId/my',
    },
    {
      name: '申请单审批驳回',
      messageType: [
        'TRAVEL_APPLICATION_REJECT',
        'EXPENSE_APPLICATION_REJECT',
        'LOAN_APPLICATION_REJECT',
      ],
      requireParams: ['formOID', 'referenceId'],
      targetUrl: '/main/request/request-edit/:formOID/:referenceId',
    },
    {
      name: '借款单审核通知',
      messageType: ['LOAN_APPLICATION_AUDIT_NOTICE'],
      requireParams: ['formOID', 'referenceId'],
      targetUrl: '/main/request/request-detail/:formOID/:referenceId/my',
    },
    {
      name: '申请单只读',
      messageType: ['APPLICATION_READONLY'],
      requireParams: ['formOID', 'referenceId'],
      targetUrl: '/main/request/request-detail/:formOID/:referenceId/my?readOnly=true',
    },
    {
      name: '报销单只读',
      messageType: ['EXPENSE_REPORT_READONLY'],
      requireParams: ['referenceId'],
      targetUrl: '/main/expense-report/expense-report-detail/:referenceId/my?readOnly=true',
    },
  ],
};
