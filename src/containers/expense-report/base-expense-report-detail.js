/**
 * Created by zaranengap on 2018/02/08
 */
import React from 'react'
import {connect} from 'dva'

// import menuRoute from 'routes/menuRoute'
import 'styles/expense-report/base-expense-report-detail.scss'
import moment from 'moment'
import customField from 'share/customField'
import {Pie} from 'components/Charts';
import {
  Table,
  Tabs,
  Icon,
  Spin,
  Row,
  Col,
  Timeline,
  Button,
  Affix,
  message,
  Modal,
  Popconfirm,
  Alert,
  Radio,
  Popover,
  Tag
} from 'antd'
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
import ListSelector from 'widget/list-selector'
import RelativeExpenseReportDetail from 'containers/expense-report/relative-expense-report-detail'
import ApproveExpenseReportDetail from 'containers/expense-report/expense-report-approve/approve-expense-report-detail'
import AuditApplicationDetail from 'containers/financial-management/finance-audit/audit-application-detail'
import expenseReportService from 'containers/expense-report/expense-report.service'
import expenseService from 'containers/my-account/expense.service'
import baseService from 'share/base.service'
import NewExpense from 'containers/my-account/new-expense'
import NewExpenseReport from 'containers/expense-report/new-expense-report'
import SlideFrame from 'widget/slide-frame'
import {invoiceAmountChange, getApprovelHistory, removeArryItem, deepFullCopy, getQueryUrlParam} from 'utils/extend'
import loadingImg from 'images/expense-report/loading.png'
import auditingImg from 'images/expense-report/auditing.png'
import rejectImg from 'images/expense-report/reject.png'
import {ExternalExpenseImport} from 'widget/index'
import YingfuSelectApprove from 'containers/expense-report/template/yingfu-select-approve'
import constants from 'share/constants'
import {notification} from "antd/lib/index";
import confirmPaymentService from "containers/financial-management/confirm-payment/confirm-payment.service";
import ApproveHistory from 'widget/Template/approve-history'
import FileSaver from "file-saver";
import errorMessage from 'share/errorMessage';
import { routerRedux } from 'dva/router';

class ExpenseReportDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCategoryName: 'ALL',
      deleteRecords: [], // 删除中费用
      saving: false, // 是否正在保存
      deleting: false, // 是否正在删除
      withdrawing: false, // 是否正在撤回
      loading: true,
      noPrint: false,
      isWaitForAudit: false,//是否为待审核报销单
      frameParams: {},
      tabValue: 'info',
      tabs: [
        {key: 'info', name: this.$t("expense-report.info")/*报销单信息*/},
        {key: 'status', name: this.$t("expense-report.approve.status")/*审批进度*/}
      ],
      auditTabs: [
        {key: 'waitAudit', title: this.$t("expense-report.tab.waitAudit")/*待审核费用*/},
        {key: 'autoAudit', title: this.$t("expense-report.tab.autoAudit")/*自动审核费用*/}
      ],
      auditTabsValue: 'waitAudit',
      operateStatus: '',
      applicant: {},
      tab: 'info',
      expenseTab: 'expense',
      formType: '',
      form: {},
      info: {},
      haveAutoAudit: false,//是否有自动审核费用
      repaymentInfo: {}, //待还款金额信息
      approvalHistory: [],
      // applicationList: menuRoute.getRouteItem('expense-report'), //报销单列表页
      invoiceColumns: [
        {title: this.$t("common.sequence")/*序号*/, dataIndex: 'index', width: '5%'},
        {
          title: this.$t("common.expense.type")/*费用类型*/, dataIndex: 'expenseTypeName', render: expenseTypeName => (
            <Popover content={expenseTypeName}>{expenseTypeName}</Popover>
          )
        },
        {
          title: this.$t("common.date")/*日期*/,
          dataIndex: 'createdDate',
          render: createdDate => new Date(createdDate).format('yyyy-MM-dd')
        },
        {title: this.$t("common.currency")/*币种*/, dataIndex: 'invoiceCurrencyCode'},
        {
          title: this.$t("common.amount")/*金额*/,
          dataIndex: 'amount',
          render: (amount, record) => {
            let showText = invoiceAmountChange(record.amount !== record.originalAmount || record.actualCurrencyRate !== record.originalActualCurrencyRate, amount || record.amount)
            return (<Popover content={showText}>
              {showText}
            </Popover>)
          }
        },
        {
          title: this.$t("common.currency.rate")/*汇率*/,
          dataIndex: 'actualCurrencyRate',
          render: (value, record) => this.filterMoney(value || record.actualCurrencyRate, 4, true)
        },
        {
          title: this.$t("common.base.currency.amount")/*本位币金额*/,
          dataIndex: 'baseAmount',
          render: (value, record) => this.filterMoney(value || record.baseAmount, 2, false)
        },
        {
          title: this.$t("common.comment")/*备注*/, dataIndex: 'comment', render: text => (
            <Popover content={text || '-'}>{text || '-'}</Popover>
          )
        },
        {
          title: this.$t("common.attachments")/*附件*/,
          dataIndex: 'attachments',
          width: '5%',
          render: attachments => attachments.length
        },
        {
          title: this.$t("common.operation")/*操作*/, dataIndex: 'operate',
          render: this.renderExpenseOperate, width: '14%'
        },
      ],
      showExpenseReportInvoices: [],
      expenseReportInvoices: [],
      showImportExpense: false,
      expenseTypeOIDStr: '',
      showNewExpense: false,
      showNewExpenseReport: false,
      nowEditExpense: null,
      expenseSource: 'expenseType',
      showLoanModal: false,
      checkingText: '',
      showChecking: false,
      submitting: false,
      checkResult: [],
      showCheckResult: false,
      loanRequestList: [],
      isMultiCurrency: false,
      reimbursementAmount: 0,
      selectedLoanRequest: null,
      printLoading: false,
      pay: false,  //付款页面
      approve: false,  //审批页面
      audit: false,  //审核页面
      view: false,  //查看页面
      loanRefund: false,  //借还款页面
      readOnly: false,  //只可读
      businessCardEnabled: false,
      invoiceEnabled: false,
      expenseRowSelection: {
        type: this.props.profile['app.approval.reject.batch.disabled'] ? 'radio' : 'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectExpense,
      },
      directSubmitting: false,
      showExternalExpenseImportModal: false,
      showYingfuSelectApproveModal:false,
      selectAllLoading: false,
      travelSubsidy: null,
      travelSubsidyType: null,
      travelSubsidyUser: 'all',
      buttonRoleSwitch: this.checkPageRole('EXPENSEAUDIT', 2) && this.checkFunctionProfiles(['er.disabled'], [[false, undefined]]) && this.checkFunctionProfiles(['finance.audit.disabled'], [[false, undefined]]),
      costCenterItemsApportion: [],  //参与分摊的成本中心
      children: false,
      auditCapability: false,
      confirmLoading: false
    }
  }

  componentDidMount() {
    if (window.location.href.indexOf('approve-expense-report-detail') > -1) {
      this.setState({approve: true})
    }
    if (window.location.href.indexOf('finance-audit') > -1) {
      this.setState({audit: true})
    }
    if (window.location.href.indexOf('finance-view') > -1 || getQueryUrlParam('readOnly') == 'true') {
      this.setState({view: true})
    }
    if (window.location.href.indexOf('confirm-payment') > -1) {
      this.setState({pay: true})
    }
    if (window.location.href.indexOf('loan-and-refund') > -1) {
      this.setState({loanRefund: true})
    }
    this.getInfo();
  }

  handlePrintInvoice = (invoice) => {
    // 支付宝打印
    if (invoice.cardsignType === 'ALICARDSIGN') {
      this.downAlipayInvoice(invoice);
      return !1;
    }
    // 微信打印
    const {company} = this.props;
    expenseService.printInvoice(invoice, company.companyOID)
  };
  // 支付宝打印
  downAlipayInvoice = (invoice) => {
    let hide = message.loading(this.$t('importer.spanned.file'));
    expenseService.printAlipayInvoice(invoice).then(res => {
      let b = new Blob([res.data], {type: "application/pdf"});
      FileSaver.saveAs(b, `${this.$t('expense.invoice.type.alipay')}-${invoice.type}.pdf`);
      hide();
    }).catch(() => {
      /*下载失败，请重试*/
      message.error(this.$t('importer.download.error.info'));
      hide();
    });
  };
  renderExpenseOperate = (text, record, index) => {
    let print = true;
    const weatherPrint = record.invoiceLabels;
    weatherPrint && weatherPrint.map(label => {
      if (label.type === "INVOICE_FREE") {
        print = false;
      }
    });
    let isFinancial = ~window.location.pathname.indexOf('financial-management');
    //打印按钮 免贴票 员工、审批人都隐藏 财务显示
    return this.state.readOnly ? (
      <span>
        <a onClick={() => this.setState({
          showNewExpense: true,
          nowEditExpense: record
        })}>{this.$t('common.view')/*查看*/}{record.status === 1002 && `(${this.$t('constants.documentStatus.has.been.rejected')})`/*(已驳回)*/}</a>
        {record.digitalInvoice && (print || isFinancial) &&
        ((record.digitalInvoice.cardsignType === 'ALICARDSIGN' && record.digitalInvoice.pdfUrl) || record.digitalInvoice.cardsignType === 'APPCARDSIGN' || record.digitalInvoice.cardsignType === 'JSCARDSIGN') ?
          (<span>
            <span className="ant-divider"/>
            <a onClick={() => this.handlePrintInvoice(record.digitalInvoice)}>{this.$t('common.print')/*打印*/}</a>
        </span>) : ''}
      </span>
    ) : (
      <span>
        <a onClick={() => this.setState({
          showNewExpense: true,
          nowEditExpense: record
        })}>{this.$t('common.edit')/*编辑*/}</a>
        <span className="ant-divider"/>
        {record.digitalInvoice && print &&
        ((record.digitalInvoice.cardsignType === 'ALICARDSIGN' && record.digitalInvoice.pdfUrl) || record.digitalInvoice.cardsignType === 'APPCARDSIGN' || record.digitalInvoice.cardsignType === 'JSCARDSIGN') &&
        <span>
          <a onClick={() => this.handlePrintInvoice(record.digitalInvoice)}>{this.$t('common.print')/*打印*/}</a>
          <span className="ant-divider"/>
        </span>}
        {this.deletingRecord(record) ? (<span>
            <Button shape="circle" size="small" loading style={{border: 'none', background: 'transparent'}}/>
            <a>{this.$t('common.delete')/*删除*/}</a>
          </span>) : (
          <Popconfirm onConfirm={() => this.handleDeleteExpense(record)}
                      title={this.$t('common.confirm.delete')/*确定要删除吗*/}>
            <a onClick={e => {
              e.stopPropagation()
            }}>{this.$t('common.delete')/*删除*/}</a>
          </Popconfirm>
        )}
      </span>
    )
  };
  // 删除中的费用
  deletingRecord = (record) => {
    return this.state.deleteRecords.some(item => item === record.invoiceOID);
  };
  /**
   * 得到页面信息
   * @param baseOnly 是否只需要报销单详情
   */
  getInfo = (baseOnly) => {
    const {expenseReportOID, pageFrom} = this.props.match.params;
    let {auditCapability} = this.state;
    this.setState({loading: true});
    let noPrint = this.state.noPrint;
    let isWaitForAudit = this.state.isWaitForAudit;
    expenseReportService.getExpenseReportDetail(expenseReportOID).then(expenseReportRes => {
      noPrint = expenseReportRes.data.printFree;
      expenseReportRes.data.status === 1003 && (isWaitForAudit = true);
      if (window.location.href.indexOf('approve-expense-report-detail') > -1 && expenseReportRes.data.approvalChains && expenseReportRes.data.approvalChains.length > 0) {
        auditCapability = expenseReportRes.data.approvalChains[0].invoiceAllowUpdateType === 1
      }
      this.setState({ noPrint, isWaitForAudit, auditCapability});
      let expenseReportInvoices = [];
      let expenseReportInvoiceOIDs = [];
      let invoiceDatas = [];
      let {children} = this.state;
      if (pageFrom === 'my' && expenseReportRes.data.children && expenseReportRes.data.children.length > 0) {
        children = true;
        this.setState({children});
        expenseReportRes.data.children.map(item => {
          //拆单逻辑，拼接子单的通知回复
          item.approvalHistoryDTOs && item.approvalHistoryDTOs.map(history => {
            let operation = history.operation, printable = item.printable;
            if (operation >= 3001) {
              if ((!!printable && operation !== 4011) || (!printable && operation !== 3001)) {
                expenseReportRes.data.approvalHistoryDTOs.unshift(history)
              }
            }
          })
          //按照时间排序
          expenseReportRes.data.approvalHistoryDTOs.sort((last, next) => {
            return moment(last.createdDate).isBefore(next.createdDate) ? 1 : -1;
          })
          item.expenseReportInvoices && item.expenseReportInvoices.map((i, index) => {
            i.invoiceView.statusViewShow = (constants.invoiceChildrenStatus.filter
            (t => (t.id === 1001 && t.id === item.statusView && t.type === item.rejectType) || (t.id != 1001 && t.id === item.statusView))[0] || {name: messages('constants.invoiceChildrenStatus.default')/*'未知状态'*/}).name;
            i.invoiceView.statusView = item.statusView;
            i.invoiceView.splitType = item.splitName;
            i.invoiceView.splitName = (constants.expenseReportChildrenType.filter(t => t.id === item.splitName)[0] || {name: messages('constants.expenseReportChildrenType.default')/*'未知类型'*/}).name;
            if (index === 0) {
              i.invoiceView.splitTypeColSpan = item.expenseReportInvoices.length;
            }
            invoiceDatas.push(i);
          })
        })
      }
      else {
        invoiceDatas = expenseReportRes.data.expenseReportInvoices;
      }
      invoiceDatas && invoiceDatas.map(invoice => {
        invoice.invoiceView.status = invoice.status;
        invoice.invoiceView.rejectReason = invoice.rejectReason;
        expenseReportInvoices.push(invoice.invoiceView);
        if (invoice.status !== 1002)
          expenseReportInvoiceOIDs.push(invoice.invoiceOID);
      });
      if (this.props.profile['web.invoice.keep.consistent.with.expense']) {
        expenseReportRes.data.currencySame = true;
      }
      let isMultiCurrency = false;
      let costCenterItemsApportion = [];
      //查询是否多币种、初始化成本中心项
      expenseReportRes.data.custFormValues.map(field => {
        if (field.messageKey === 'currency_code' && field.value) {
          isMultiCurrency = field.value !== expenseReportRes.data.baseCurrency;
        }
        if (field.messageKey === 'select_cost_center') {
          costCenterItemsApportion.push({
            fieldName: field.fieldName,
            costCenterOID: JSON.parse(field.dataSource || '{}').costCenterOID,
            costCenterItemName: field.showValue,
            name: field.showValue,
            costCenterItemOID: field.value,
            required: field.required
          })
        }
        if (field.messageKey === 'select_department') {
          if (JSON.parse(field.fieldConstraint || '{}').isApportionItem) {
            costCenterItemsApportion.push({
              fieldName: field.fieldName,
              costCenterOID: '00000000-0000-0000-0000-000000000000',
              costCenterItemName: field.showValue,
              name: field.showValue,
              costCenterItemOID: field.value,
              required: field.required
            })
          }
        }
      });
      //查询费用是否可用于还款
      //接口优化，去除冗余接口，by-hyl-180827
      /*Promise.all([
        expenseReportService.checkExpense(expenseReportInvoiceOIDs), //检查费用警告
        expenseReportService.getTotalPersonalPaymentAmount(expenseReportInvoiceOIDs)  //个人支付金额
      ]).then(expenseRes => {*/
       /* let checkResult = expenseRes[0].data;
        checkResult.length > 0 && checkResult.map(result => {
          result.actionType !== 'OK' && expenseReportInvoices.map(invoice => {
            if (invoice.invoiceOID === result.invoiceOID) {
              invoice.checkResultStatus = result.actionType;
              invoice.checkResultMessage = result.message;
              return invoice;
            }
          })
        });*/
        let haveAutoAudit = false;
        expenseReportInvoices && expenseReportInvoices.map((item, index) => {
          if (item.autoAudit) {
            haveAutoAudit = true;
          }
        })
        this.setState({haveAutoAudit})
        this.setState({
          costCenterItemsApportion,
          loading: !baseOnly,
          info: expenseReportRes.data,
          approvalHistory: expenseReportRes.data.approvalHistoryDTOs,
          expenseReportInvoices,
          showExpenseReportInvoicesIncludeAllTab: expenseReportInvoices,
          showExpenseReportInvoices: this.filterAutoAuditInvoice(expenseReportInvoices),
          isMultiCurrency,
          expenseRowSelection: {
            type: this.props.profile['app.approval.reject.batch.disabled'] ? 'radio' : 'checkbox',
            selectedRowKeys: [],
            onChange: this.onSelectExpense,
            getCheckboxProps: record => ({
              disabled: record.status === 1002 || record.expenseTypeSubsidyType === 1
            })
          },
        }, () => {
          this.getRepaymentAmount();
          let expenseReportStatus = this.getStatus();
          //代替逻辑
          if (expenseReportStatus.operate === 'edit') {
            if (this.props.loginUser.userOID !== expenseReportRes.data.applicantOID) {
              baseService.changeLoginInfo(expenseReportRes.data.applicantOID);
            }
          }
          this.setState({readOnly: expenseReportStatus.operate !== 'edit' || this.state.approve || this.state.audit || this.state.view || this.state.pay || this.state.loanRefund},() => {
            this.getThirdInterface(baseOnly,expenseReportRes,expenseReportOID)
          });
        })
      });
   /* }).catch(err => {
      errorMessage(err.response)
    });*/
  };

  getThirdInterface = (baseOnly,expenseReportRes,expenseReportOID) => {
    const { readOnly } = this.state;
    !baseOnly && Promise.all([
      baseService.getFormDetail(expenseReportRes.data.formOID),  //表单详情
      baseService.getUserByOID(expenseReportRes.data.applicantOID),  //申请人详情
      // wcl 修改
      baseService.getBusinessCardConsumptionList('CMBC', false, this.props.loginUser.userOID, 0, 10), //是否有商务卡消费记录
      // 查询费用类型 添加关联申请单id applicationOID
      expenseService.getTitleList(this.props.company.companyOID),  //是否有发票查验抬头
      expenseReportService.getTravelSubsidy(expenseReportOID, expenseReportRes.data.applicantOID, 1),
      expenseService.getBusinessCardStatus(),  //商务卡权限
      !readOnly && baseService.getExpenseTypesByFormOID({
        formOID: expenseReportRes.data.formOID,
        userOID: expenseReportRes.data.applicantOID,
        applicationOID: expenseReportRes.data.applicationOID
      }),  //费用类型
    ]).then(res => {
      let formType = '';
      switch (res[0].data.formType) {
        case 3001:
          formType = 'daily';
          if (res[0].data.formCode === 'vendor_payment')
            formType = 'pay';
          break;
        case 3002:
          formType = 'travel';
          break;
        case 3003:
          formType = 'base';
          break;
      }
      let expenseTypeOIDStr = !readOnly ? res[6].data.expenseTypeOIDs.join(',') : '';
      this.setState({
        loading: false,
        formType,
        form: res[0].data,
        applicant: res[1].data,
        expenseTypeOIDStr,
        invoiceEnabled: res[3].data.length > 0,
        travelSubsidy: res[4].data.rows,
        businessCardEnabled: res[5].data.rows && res[2].data.success && res[2].data.rows.length > 0,
      })
    });
  };

  //获取待还款总金额
  getRepaymentAmount = () => {
    baseService.getRepaymentAmount(this.state.info.applicantOID, this.state.info.companyOID, [1005,1006]).then(resp => {
      if (resp.status === 200 && resp.data){
        this.setState({repaymentInfo: resp.data});
      }
    });
  };

  //报销单信息／审批进度切换
  handleTabsChange = (tab) => {
    this.setState({tabValue: tab})
  };

  //撤回
  handleWithdraw = () => {
    const {info} = this.state;
    confirm({
      title: this.$t('expense-report.withdraw.confirm'), //你确定要撤回吗？
      onOk: () => {
        this.setState({withdrawing: true});
        let params = {
          entities: [{
            entityOID: info.expenseReportOID,
            entityType: 1002
          }]
        };
        expenseReportService.withdraw(params).then(res => {
          if (res.data.failNum > 0) {
            if (res.data.failReason[info.expenseReportOID]) {
              message.error(`${this.$t("common.operate.filed")/*操作失败*/}，${res.data.failReason[info.expenseReportOID]}`)
            } else {
              message.error(this.$t("common.operate.filed")/*操作失败*/)
            }
            this.setState({withdrawing: false});
          }
          else {
            message.success(this.$t("common.operate.success")/*操作成功*/);
            this.goBack();
          }
        }).catch(e => {
          this.setState({withdrawing: false});
          message.error(`${this.$t( "common.operate.filed")/*操作失败*/}，${e.response.data.message}`)
        })
      },
      onCancel() {
      },
    });
  };

  //提交
  handleSubmit = () => {
    let {info, isMultiCurrency} = this.state;
    //初始化流程状态
    this.setState({isRunYingFuApproveFlow:false},() =>{
      if (info.expenseReportInvoices.length === 0) {
        message.error(this.$t('expense-report.add.expense.first')); //请先添加费用
      } else {
        this.setState({submitting: true});
        let addSign = [];
        if(info.countersignApproverNames){
          info.countersignApproverNames.map((item) => {
            addSign.push(item.fullName);
          });
        }
        let repeat = [];
        if(info.approvalHistoryDTOs){
          info.approvalHistoryDTOs.map((item) => {
            item.operation === 2001 && ~addSign.indexOf(item.operator.fullName) && (repeat.push(item.operator.fullName));
          })
        }
        let names = [...new Set(repeat)];
        if(names.length){
          Modal.confirm({
            title: `${names.join('、')} ${this.$t('approve.request.has.approved')/*已经审批通过，是否继续*/}？`,
            onOk: () => this.repaymentValid(),
            onCancel: () => {this.setState({submitting:false});}
          });
        }else {
          this.repaymentValid();
        }
      }
    });
  };
   //如果个人支付金额 > 0 而且配置了核销才能进行还款
   repaymentValid = () => {
    let { isMultiCurrency, info } = this.state;
    if (!this.props.profile['app.borrow.disabled'] &&
      (!isMultiCurrency || (isMultiCurrency && !this.props.profile['er.refund.foreign.disabled'])) &&
      info.personalPaymentAmount > 0) {
      this.selectLoanRequest();
    } else {
      this.handleCheckTravelStandard();
    }
  };
  //选择还款单
  selectLoanRequest = () => {
    let {applicant, info} = this.state;
    let venMasterId = '';
    info.custFormValues.map((item) => {
      item.messageKey === 'venMaster' && (venMasterId = item.value)
    });
    let expenseReportCompanyOID = this.props.company.companyOID;
    if (info.custFormValues && info.custFormValues.length > 0) {
      let expenseReportCompanyInfo = info.custFormValues.filter(item => item.messageKey === 'select_company')[0];
      if(expenseReportCompanyInfo && expenseReportCompanyInfo.value){
        expenseReportCompanyOID=expenseReportCompanyInfo.value
      }
    }
    expenseReportService.getLoanRequestList(applicant.userOID,info.currencyCode,venMasterId,expenseReportCompanyOID).then(loanListRes => {
      expenseReportService.getDefaultLoanRequest(info.applicationOID, applicant.userOID).then(defaultLoanRes => {
        let defaultLoanApplicationOID = defaultLoanRes.data || null;
        let loanRequestList = [];
        loanListRes.data.map(item => {
          //只需要待还款金额 > 0 且币种相同的还款呢
          if (item.writeoffArtificialDTO.stayWriteoffAmount > 0 && item.originCurrencyCode === info.currencyCode) {
            //强制默认借款单，列表内只有一个
            if (this.props.profile['ALL.ER.DefaultLoan.Forcible'] && defaultLoanApplicationOID) {
              if (item.applicationOID === defaultLoanApplicationOID)
                loanRequestList.push(item);
            } else {
                loanRequestList.push(item);
            }
          }
        });
        loanRequestList.map((item, index) => {
          item.index = index + 1;
        });
        if (loanRequestList.length > 0) {
          this.setState({showLoanModal: true, loanRequestList});
        } else {
          this.handleCheckTravelStandard();
        }
      })
    });
  };

  //检查差标
  handleCheckTravelStandard = () => {
    let {info, expenseReportInvoices} = this.state;
    if (this.props.profile['travel.standard.check.enabled']) {
      this.setState({
        showChecking: true,
        checkingText: this.$t('expense-report.checking.travel.standard')/*正在进行差标检查...*/
      });
      //差标检查
      expenseReportService.checkStandard(info).then(res => {
        this.setState({showChecking: false, checkingText: ''}, () => {
          let standardResult = res.data;
          if (standardResult.length === 0) {
            this.checkBudget();
          } else {
            let allOk = true;
            let rejectNum = 0;
            let warningNum = 0;
            standardResult.map(result => {
              allOk = allOk && result.actionType === 'OK';
              if (result.actionType === 'REJECT')
                rejectNum++;
              if (result.actionType === 'WARNING')
                warningNum++;
              expenseReportInvoices.map(invoice => {
                if (invoice.invoiceOID === result.invoiceOID) {
                  invoice.warningFlag = false;
                  invoice.rejectFlag = true;
                  invoice.rejectMesage = result.message;
                  result.actionType !== 'OK' && (invoice.checkResultStatus = result.actionType, invoice.checkResultMessage = result.message);
                }
              })
            });
            if (allOk) {
              this.checkBudget();
            } else {
              this.setState({expenseReportInvoices, showExpenseReportInvoices: expenseReportInvoices});
              if (rejectNum > 0) {
                this.setState({submitting: false});
                Modal.error({
                  title: this.$t('common.info'), //提示
                  content: this.$t('expense-report.expense.reject.and.warning', {rejectNum, warningNum}) //您有${rejectNum}条费用禁止提交，${warningNum}条费用预警
                })
              } else {
                Modal.confirm({
                  title: this.$t('common.info'), //提示
                  content: this.$t('expense-report.expense.warning', {warningNum}), //您有${warningNum}条费用预警，要继续吗
                  onOk: () => this.checkBudget(),
                  okText: this.$t('expense-report.continue.submit'),  //继续提交
                  cancelText: this.$t('expense-report.back.edit'),  //返回修改
                  onCancel: () => {this.setState({submitting: false});this.getInfo()}
                })
              }
            }
          }
        });
      }).catch(err => {
        this.setState({showChecking: false});
        this.submitError(err);
      })
    } else {
      this.checkBudget();
    }
  };

  //提交报销单错误统一处理
  submitError = (e) => {
    this.setState({submitting: false});
    let data = e.response.data;
    if (data.errorCode === '2001')
      message.error(this.$t('expense-report.empty.approve.chain')); //审批链为空
    else if (data.errorCode === '13001') {
      message.error(data.message);
    }
    else if (data.validationErrors && data.validationErrors.length > 0) {
      let errorMessage = data.validationErrors[0].message;
      message.error(errorMessage);
    } else {
      data.message ? message.error(data.message) : message.error(this.$t('common.operate.filed')/*操作失败*/);
    }
  };
  //预算检查
  checkBudget = () => {
    let {info} = this.state;
    if(this.checkYingfuApprove()){
      return;
    }
    this.setState({showChecking: true, checkingText: this.$t('common.submitting')});  //正在提交
    expenseReportService.submitOrCheckBudget(info).then(res => {
      this.setState({showChecking: false, checkingText: ''}, () => {
        // true代表可提交， false时提示错误信息
        if (!res.data.checkResultList || res.data.checkResultList.length === 0) {
          this.setState({submitting: false, showChecking: false, checkingText: ''});
          message.success(this.$t('common.operate.success'));  //操作成功
          this.goBack();
        } else {
          let budgetError = false;
          res.data.checkResultList.map(item => {
            budgetError = budgetError || item.type === 1;
          });
          this.setState({
            checkResult: res.data.checkResultList,
            showChecking: false,
            checkingText: '',
            showCheckResult: true,
            submitting: !budgetError
          })
        }
      });
    }).catch((err) => {
      this.setState({showChecking: false});
      this.submitError(err);
    })
  };
  //英孚审批流程执行
  checkYingfuApprove = () => {
    let {info, isRunYingFuApproveFlow} = this.state;
    if (isRunYingFuApproveFlow) {
      return false;
    }
    let yingFuApproveFlow = false;
    info.custFormValues && info.custFormValues.map(item => {
      if (item.messageKey === 'ying_fu_select_approver') {
        yingFuApproveFlow = true;
        this.setState({showYingfuSelectApproveModal: true, isRunYingFuApproveFlow: true});
      }
    })
    return yingFuApproveFlow;
  }
  //提交英孚审批
  submitYingfuApprove = (usersOID) => {
    let {info} = this.state;
    info.custFormValues && info.custFormValues.map(item => {
      if (item.messageKey === 'ying_fu_select_approver') {
        item.value = usersOID;
      }
    })
    this.setState({info}, () => {
      this.openYingfuSelectApprove(false);
      this.checkBudget();
    });
  }
  //英孚审批控制
  openYingfuSelectApprove = (flag) => {
    this.setState({showYingfuSelectApproveModal: flag, submitting: false});
  };

  //预算检查时忽略预警直接保存
  confirmSubmit = () => {
    let {info} = this.state;
    info.ignoreBudgetWarningFlag = true;
    this.setState({directSubmitting: true});
    expenseReportService.submitOrCheckBudget(info).then(res => {
      let budgetError = false;
      res.data.checkResultList && res.data.checkResultList.map(item => {
        budgetError = budgetError || item.type === 1;
      });
      if (budgetError) {
        this.setState({
          checkResult: res.data.checkResultList,
          showChecking: false,
          checkingText: '',
          showCheckResult: true,
          submitting: false
        })
        return;
      }
      else {
        this.setState({directSubmitting: false, showChecking: false,});
        message.success(this.$t('common.operate.success'));  //操作成功
        this.goBack();
      }
    }).catch((err) => {
      info.ignoreBudgetWarningFlag = false;
      this.setState({showChecking: false, directSubmitting: false, showCheckResult: false});
      this.submitError(err)
    })
  };

  //删除报销单
  handleDelete = () => {
    confirm({
      title: this.$t('common.confirm.delete'),  //你确定要删除吗
      content: this.$t('common.after.delete'),  //删除后无法恢复
      okType: 'danger',
      onOk: () => {
        this.setState({deleting: true});
        expenseReportService.deleteExpenseReport(this.props.match.params.expenseReportOID).then(res => {
          if (res.status === 200) {
            message.success(this.$t( "common.operate.success")/*操作成功*/);
            this.goBack()
          }
        }).catch(e => {
          this.setState({deleting: false});
          message.error(`${this.$t("common.operate.filed")/*操作失败*/}，${e.response.data.message}`)
        })
      },
      onCancel() {
      },
    });
  };

  goBack = () => {
    if (this.props.match.params.backType === 'history') {
      console.log(this.props)
      window.history.go(-1);
    } else {
      this.props.dispatch(
        routerRedux.push({
          pathname: `/expense-report`
        })
      )
    }

  };

  //得到审批状态
  getStatus = () => {
    const {info} = this.state;
    let status = constants.documentStatus;
    let result = {label: ''};
    status.map(item => {
      if (item.value === String(info.status) || item.value === String(info.status * 10000 + info.rejectType)) {
        result = item;
      }
    });
    return result;
  };

  handleCloseNewCreate = (refresh) => {
    this.setState({nowEditExpense: null, showNewExpense: false});
    if(refresh === true){
      this.getInfo(refresh);
    }
  };

  handleCloseNewReport = (refresh) => {
    this.setState({showNewExpenseReport: false});
    refresh && this.getInfo(true);
  };

  handleAfterClose = (refresh) => {
    refresh && this.getInfo(true);
  };

  handleSelectExpense = (data) => {
    const {expenseReportInvoices} = this.state;
    const {expenseReportOID} = this.props.match.params;
    let invoiceOIDs = [];
    if (data.result.length + expenseReportInvoices.length > 200) {
      message.error(this.$t('expense-report.expense.max')); //同一报销单内最多存在200个费用
      return;
    }
    if (data && data.result && data.result.length > 0) {
      data.result.map(invoice => {
        invoiceOIDs.push(invoice.invoiceOID)
      });
      expenseReportService.importExpense(expenseReportOID, invoiceOIDs).then(res => {
        this.setState({showImportExpense: false});
        message.success(this.$t('expense-report.expense.import.success'));  //费用导入成功
        this.getInfo(true);
      }).catch(err => {
        message.error(err.response.data.message);
      });
    }
  };

  handleSelectAllExpense = () => {
    const {applicant, info, expenseTypeOIDStr} = this.state;
    this.setState({selectAllLoading: true});
    expenseReportService.getAllExpenseByExpenseReport({
      invoiceStatus: 'INIT',
      applicantOID: applicant.userOID,
      expenseReportOID: info.expenseReportOID,
      expenseTypeOIDStr
    }).then(res => {
      this.setState({selectAllLoading: false});
      this.handleSelectExpense({result: res.data});
    })
  };

  handleDeleteExpense = (record) => {
    const {expenseReportOID} = this.props.match.params;
    const {deleteRecords} = this.state;
    deleteRecords.push(record.invoiceOID);
    this.setState({deleteRecords});
    expenseReportService.removeExpense(expenseReportOID, record.invoiceOID).then(res => {
      message.success(this.$t('expense-report.expense.delete.success'));  //费用删除成功
      removeArryItem(deleteRecords, record.invoiceOID);
      this.setState({deleteRecords});
      this.getInfo(true);
    })
  };

  handleSelectLoan = (selectedRowKeys, selectedRows) => {
    if (selectedRowKeys.length > 0) {
      this.setState({
        selectedLoanRequest: selectedRows[0],
        reimbursementAmount: selectedRows[0].writeoffArtificialDTO.stayWriteoffAmount
      })
    }
  };

  //直接提交
  handleDirectSubmit = () => {
    let {info, reimbursementAmount} = this.state;
    //逻辑去除
    /*  if (this.props.profile['All.ER.GreaterThanLoan'] && reimbursementAmount > info.personalPaymentBaseAmount) {
        message.error(this.$t('expense-report.select.loan.more.expenseAmount.help')); //报销单金额不能小于借款单金额
        return;
      }*/
    info.loanApplicationOID = null;
    this.setState({
      showLoanModal: false,
      info,
      selectedLoanRequest: null
    }, () => {
      this.handleCheckTravelStandard();
    });
  };

  //有借款单的提交
  handleSubmitWithLoan = () => {
    let {selectedLoanRequest, info, reimbursementAmount} = this.state;
    if (selectedLoanRequest) {
      if (this.props.profile['All.ER.GreaterThanLoan'] && reimbursementAmount > info.personalPaymentBaseAmount) {
        message.error(this.$t('expense-report.select.loan.more.expenseAmount.help')); //报销单金额不能小于借款单金额
        return;
      }
      info.loanApplicationOID = selectedLoanRequest.applicationOID;
      this.setState({info, showLoanModal: false}, () => {
        this.handleCheckTravelStandard();
      })
    } else {
      message.error(this.$t('expense-report.select.loan.or.submit')); //请先选择借款单，或者直接提交
    }
  };

  handleCancelLoan = () => {
    let {info} = this.state;
    info.loanApplicationOID = null;
    this.setState({
      submitting: false,
      showLoanModal: false,
      reimbursementAmount: 0,
      info,
      selectedLoanRequest: null
    });
  };

  handlePrint = () => {
    const {info} = this.state;
    this.setState({printLoading: true});
    baseService.printExpense(info.expenseReportOID).then(res => {
      this.setState({printLoading: false});
      window.open(res.data.link, "_blank")
    });
  };

  onSelectExpense = (selectedRowKeys, selectedRows) => {
    let {expenseRowSelection} = this.state;
    expenseRowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({expenseRowSelection});
  };

  renderExpandedRow = (type, index) => {
    return (
      <div
        className={`${type.level === 'WARN' ? 'warning-expanded-row' : (type.level === 'ERROR' ? 'error-expand-row' : '')}`}
        key={index}>
        <span>{type.name}</span>
        {type.toast && <span>:{type.toast}</span>}
      </div>
    )
  };

  renderExpandedSpan = (type) => {
    return (
      <span>{type.name}/</span>
    )
  };

  renderAllExpandedRow = (record) => {
    let result = [];
    let infoRes = [];
    let types = record.invoiceLabels || [];
    let lastIndex = -1;
    types.map((label, index) => {
      if (label.level !== 'INFO') {
        result.push(this.renderExpandedRow(label, index));
      } else {
        lastIndex = label.name;
        infoRes.push(this.renderExpandedSpan(label));
      }
    });
    let infoLength = infoRes.length;
    {
      infoLength > 0 && (infoRes[infoLength - 1] = <span>{lastIndex}</span>)
    }
    result.push(infoRes);
    /*后端说统一放标签处理*/
    /*   record.checkResultStatus && result.push(this.renderExpandedRow({
         level: record.checkResultStatus === 'WARNING' ? 'WARN' : 'ERROR',
         name: record.checkResultMessage
       }, result.length - 1));*/
    return result.length > 0 ? result : null;
  };

  renderClass = (record) => {
    let isWarn = false;
    record.invoiceLabels && record.invoiceLabels.map(label => {
      label.level === 'WARN' && (isWarn = true);
    });
    record.checkResultStatus && (isWarn = true);
    return ((record.invoiceLabels && record.invoiceLabels.length > 0) || record.checkResultStatus) ? (isWarn ? 'rejected-expense' : '') : 'row-expand-display-none';
  };

  //外部费用导入modal控制
  openExternalExpenseImport = (flag) => {
    this.setState({showExternalExpenseImportModal: flag});
  };

  //导入外部费用事件
  importExternalExpense = () => {
    this.openExternalExpenseImport(false);
    Modal.info({
      title: this.$t('expense-report.import.ex.expense.title'), //导入过程预计需要15分钟
      content: (
        <div>
          <p>{this.$t('expense-report.import.ex.expense.content1')/*在此期间请不要修改报销单*/}</p>
          <p>{this.$t('expense-report.import.ex.expense.content2')/*导入完成后,您会收到一封邮件通知,然后刷新报销单页面进行查看*/}</p>
        </div>
      ),
      onOk() {
      },
    });
  };
  handleSelectCategory = (category) => {
    let {expenseRowSelection} = this.state;
    let showExpenseReportInvoices = [];
    let showExpenseReportInvoicesIncludeAllTab=[];
    category.invoices.map(invoice => {
      invoice.invoiceView.status = invoice.status;
      invoice.invoiceView.rejectReason = invoice.rejectReason;
      showExpenseReportInvoices.push(invoice.invoiceView);
      showExpenseReportInvoicesIncludeAllTab.push(invoice.invoiceView)
    });
    expenseRowSelection.selectedRowKeys = [];
    showExpenseReportInvoices = this.filterAutoAuditInvoice(showExpenseReportInvoices);
    this.setState({showExpenseReportInvoices, showExpenseReportInvoicesIncludeAllTab, expenseRowSelection, currentCategoryName: category.categoryName})
  };

  //处理审核条件
  filterAutoAuditInvoice(invoices) {
    let {auditTabsValue, audit} = this.state;
    if (!audit) {
      return invoices;
    }
    let invoiceArray = [];
    invoices && invoices.map(item => {
      if (auditTabsValue === 'waitAudit' && !item.autoAudit) {
        invoiceArray.push(item);
      }
      if (auditTabsValue === 'autoAudit' && item.autoAudit) {
        invoiceArray.push(item);
      }
    })
    return invoiceArray
  }
  //处理筛选差补费用类型条件
  filterTravelSubsidyInvoice(invoices) {
    let {travelSubsidyType} = this.state;
    let invoiceArray = [];
    if (!travelSubsidyType) {
      return invoices;
    }
    invoices && invoices.map(item => {
      if (travelSubsidyType === 'travel' && item.expenseTypeSubsidyType === 1) {
        invoiceArray.push(item);
      }
      if (travelSubsidyType === 'normal' && item.expenseTypeSubsidyType !== 1) {
        invoiceArray.push(item);
      }
    })
    return invoiceArray
  }

  handleSelectAllCategory = () => {
    let {expenseRowSelection, expenseReportInvoices} = this.state;
    expenseRowSelection.selectedRowKeys = [];
    this.setState({
      showExpenseReportInvoices: this.filterAutoAuditInvoice(expenseReportInvoices),
      showExpenseReportInvoicesIncludeAllTab: deepFullCopy(expenseReportInvoices),
      expenseRowSelection,
      travelSubsidyType: null,
      travelSubsidyUser: 'all',
      currentCategoryName: 'ALL'
    })
  };

  handleChangeTravelSubsidyType = (e) => {
    let travelSubsidyType = e.target.value;
    let {expenseRowSelection, expenseReportInvoices} = this.state;
    expenseRowSelection.selectedRowKeys = [];
    let showExpenseReportInvoices = [];
    let showExpenseReportInvoicesIncludeAllTab = [];
    expenseReportInvoices.map(invoice => {
      travelSubsidyType === 'travel' && invoice.expenseTypeSubsidyType === 1 && showExpenseReportInvoices.push(invoice);
      travelSubsidyType === 'normal' && invoice.expenseTypeSubsidyType !== 1 && showExpenseReportInvoices.push(invoice);
    });
    showExpenseReportInvoicesIncludeAllTab = deepFullCopy(showExpenseReportInvoices);
    showExpenseReportInvoices = this.filterAutoAuditInvoice(showExpenseReportInvoices)
    this.setState({showExpenseReportInvoices, showExpenseReportInvoicesIncludeAllTab, expenseRowSelection, travelSubsidyType})
  };

  handleChangeTravelSubsidyUser = (e) => {
    let travelSubsidyUser = e.target.value;
    let {expenseRowSelection, expenseReportInvoices} = this.state;
    expenseRowSelection.selectedRowKeys = [];
    let showExpenseReportInvoices = [];
    let showExpenseReportInvoicesIncludeAllTab = [];
    if (travelSubsidyUser !== 'all') {
      expenseReportInvoices.map(invoice => {
        invoice.userOID === travelSubsidyUser && showExpenseReportInvoices.push(invoice);
      });
    } else {
      showExpenseReportInvoices = expenseReportInvoices;
    }
    showExpenseReportInvoicesIncludeAllTab = deepFullCopy(showExpenseReportInvoices);
    showExpenseReportInvoicesIncludeAllTab = this.filterTravelSubsidyInvoice(showExpenseReportInvoicesIncludeAllTab);
    showExpenseReportInvoices = this.filterAutoAuditInvoice(showExpenseReportInvoices);
    showExpenseReportInvoices = this.filterTravelSubsidyInvoice(showExpenseReportInvoices);
    this.setState({showExpenseReportInvoices, showExpenseReportInvoicesIncludeAllTab, expenseRowSelection, travelSubsidyUser})
  };
  // 点击保存
  handleSave = () => {
    let {info} = this.state;
    this.setState({saving: true});
    expenseReportService.saveExpenseReport(info).then(res => {
      this.setState({saving: false});
      message.success(this.$t('common.save.success', {name: ''}));
      this.goBack();
    })
      .catch(error => {
        this.setState({saving: false});
        message.error(error.response.data.message);
      })
  };
  //点击确认付款
  handleConfirmPay = () => {
    this.setState({submitting: true}, () => {
      let {info} = this.state;
      let params = {
        comment: null,
        endDate: null,
        entityOIDs: [info.expenseReportOID],
        entityType: 1001,
        excludedEntityOIDs: [],
        formOIDs: [],
        selectMode: 'default',
        startDate: null,
        status: 'pay_in_process',
        businessCode: info.businessCode,
        applicantOID: info.applicantOID
      }
      confirmPaymentService.confirmPayment('processing', params).then(() => {
        this.setState({submitting: false});
        notification.open({
          message: this.$t('confirm.payment.confirmSuccess'/*确认付款成功！*/),
          // description: `您有1笔单据确认付款成功:)`,
          description: this.$t('confirm.payment.confirmPaySuccess', {total: 1}/*`您有1笔单据确认付款成功:)`*/),
          icon: <Icon type="smile-circle" style={{color: '#108ee9'}}/>,
        });
        this.goBack()
      }).catch((e) => {
        this.setState({submitting: false});
        notification.open({
          message: this.$t('confirm.payment.payFailure'/*确认付款失败！*/),
          description: this.$t('common.error'/*可能是服务器出了点问题:(*/),
          icon: <Icon type="frown-circle" style={{color: '#e93652'}}/>,
        });
      })
    });

  };
  //处理审批节点
  dealApprovelNode = (history) => {
    if (history.operation == 2001 && (history.countersignType == 2 || history.countersignType == 1)) {
      return `${this.$t('constants.approvelHistory.sign')} `;
    }
    if (history.operation == 2001 && history.operationType === 1001) {
      return `${this.$t('constants.approvelHistory.auto')}`;
    }
  }
  //处理历史用户操作详情
  dealOperatDetail = (history) => {
    if (history.countersignType === 2) {
      return history.operationDetail && history.operationDetail.split(',').join(' —> ')
    }
    else {
      history.operationDetail;
    }
  }
  //处理审批人
  dealApprovelUser = () => {
    let {info} = this.state;
    let proxyUserInfo = "";
    /*代理审批逻辑*/
    info.approvalChains && info.approvalChains.map((chain, indexs) => {
      chain.proxyApprovers && chain.proxyApprovers.map((c, index) => {
        proxyUserInfo += `${c.fullName} ${c.employeeID} ${index != chain.proxyApprovers.length - 1 ? '& ' : ''}`
      })
      if (chain.proxyApprovers && chain.proxyApprovers.length) {
        proxyUserInfo += `(${this.$t('request.detail.on.behalf.approved',
          {name: chain.approverName, id: chain.approverEmployeeID}/*代理 {name} {id} 审批*/)})`;
      }
      if (!chain.proxyApprovers) {
        proxyUserInfo += `${chain.approverName} ${chain.approverEmployeeID}`;
      }
      if (indexs != (info.approvalChains.length - 1)) {
        proxyUserInfo += ` | `;
      }
    });
    if (!proxyUserInfo) proxyUserInfo = `${info.approvalChain.approverName} ${info.approvalChain.approverEmployeeID}`;
    return proxyUserInfo;
  }
  //提交费用处理英孚选人审批（定制化逻辑）
  handleYingFuSelectApprove(){

  };
  //处理拆单逻辑
  dealInvoiceColumnsRender = () => {
    let {invoiceColumns, info} = this.state;
    if (info && info.children && info.children.length > 0) {
      removeArryItem(invoiceColumns, invoiceColumns.filter(item => item.dataIndex === 'splitType')[0]);
      removeArryItem(invoiceColumns, invoiceColumns.filter(item => item.dataIndex === 'statusView')[0]);
      let expenseTypeColumn = {
        title: this.$t("common.invoice.type")/*'发票类型'*/,
        dataIndex: 'splitType',
        width: '8%',
        render: (value, row) => {
          const obj = {
            children: row.splitName,
            props: {},
          };
          //影响额外扩展行
        /*if (row.splitTypeColSpan) {
            obj.props.rowSpan = row.splitTypeColSpan;
          }
          else {
            obj.props.rowSpan = 0;
          }*/
          return obj;
        }
      };
      let statusColumn = {
        title: this.$t("common.column.status")/*状态*/, dataIndex: 'statusView', width: '8%', render: (value, row) => {
          const obj = {
            children: row.statusViewShow,
            props: {},
          };
       /*   if (row.splitTypeColSpan>0) {
            obj.props.rowSpan = row.splitTypeColSpan;
          }
          else {
            obj.props.rowSpan = 0;
          }*/
          return obj;
        }
      };
      invoiceColumns.unshift(expenseTypeColumn);
      invoiceColumns.push(statusColumn);
    }
    return invoiceColumns;
  };
  /*自动审核和待审核费用Tab切换*/
  auditTabsChange = (key) => {
    let { showExpenseReportInvoicesIncludeAllTab } = this.state;
    this.setState({
      auditTabsValue: key
    }, () => {
      let showExpenseReportInvoices = this.filterAutoAuditInvoice(showExpenseReportInvoicesIncludeAllTab);
      this.setState({showExpenseReportInvoices})
    })
  }

  //切换费用组件
  switchingInvoice = (index) => {
    let {showExpenseReportInvoices} = this.state;
    this.setState({
      nowEditExpense: showExpenseReportInvoices[index]
    })
  };
  render() {
    const {
      loading, info, approvalHistory, applicant, expenseTypeOIDStr,auditTabs,
      showNewExpense, nowEditExpense, expenseSource, showNewExpenseReport, form,
      auditCapability, children, showExpenseReportInvoices, showImportExpense,
      showLoanModal, checkingText, showChecking, submitting, showCheckResult, checkResult,
      loanRequestList, reimbursementAmount, selectedLoanRequest,
      readOnly, approve, audit, view, printLoading, businessCardEnabled, invoiceEnabled,
      expenseRowSelection, directSubmitting, noPrint, selectAllLoading, currentCategoryName,
      travelSubsidy, travelSubsidyType, travelSubsidyUser, buttonRoleSwitch, pay, loanRefund,
      costCenterItemsApportion, saving, haveAutoAudit, deleting, withdrawing, repaymentInfo, isWaitForAudit, tabValue, confirmLoading
    } = this.state;
    const {profile} = this.props;
    let custFormValues = info.custFormValues || []; //自定义表单
    let expenseReportStatus = info ? this.getStatus() : {};
    let warningList = info.warningList ? JSON.parse(info.warningList) : null;
    let requestInfo = (
      <Spin spinning={loading}>
        <div className="top-info">
          <Row className="row-container">
            {noPrint && <Alert message={this.$t('common.print.require')} type='info' showIcon/>}
            {warningList && (
              warningList.map((warning, index) => (
                <Alert message={`${warning.title} ${warning.message}`} banner
                       type={warning.type === 0 ? 'warning' : 'error'} key={index}/>
              ))
            )}
            <span className="top-info-name">{applicant.fullName}</span>
            <span className="detail-info">
              {(approve || audit || view) && !!repaymentInfo.debtAmount && repaymentInfo.debtAmount > 0 && (
                <span style={{color: '#0092da'}}>
                  {this.$t('common.total.pending.repayment'/*待还总额*/)}：{repaymentInfo.baseCurrency}&nbsp;{this.filterMoney(repaymentInfo.debtAmount)}&nbsp;
                  {/* <Icon type="right"/> */}&nbsp;&nbsp;
                </span>
              )}
              {this.$t('common.user.id')/*工号*/}：{applicant.employeeID}
              <span className="ant-divider"/>
              {this.$t('common.department')/*部门*/}：{this.checkFunctionProfiles('department.full.path.disabled', [true]) ? applicant.departmentName : applicant.departmentPath}
              <span className="ant-divider"/>{this.$t('common.user.company')/*员工公司*/}：{applicant.companyName}
              <span className="ant-divider"/>{this.$t('common.currency')/*币种*/}：{info.baseCurrency}
              <span
                className="ant-divider"/>{this.$t('expense-report.repayment.amount')/*还款金额*/}：{(info.status >= 1004 || !info.loanApplicationOID) ? `${info.currencyCode} ${this.filterMoney(info.reimbursementAmount, 2, true)}` : this.$t('expense-report.calculating.after.audit')/*审核通过后计算*/}
              {info.createdName != info.applicantName && <span
                className="ant-divider"/>}{info.createdName != info.applicantName && `${this.$t('expense-report.create.user')}：${info.createdName} ${moment(info.createdDate).format('YYYY-MM-DD')}`}
            </span>
          </Row>
          <Row className="row-container">
            <span
              className="detail-info detail-info-first">{info.formName}：{info.parentBusinessCode ? `${info.parentBusinessCode}-` : ''}{info.businessCode}</span>
            <span className="detail-info">
              {this.$t('common.submit.date')/*提交日期*/}：{info.lastSubmittedDate ? moment(info.lastSubmittedDate).format('YYYY-MM-DD') : moment(info.createdDate).format('YYYY-MM-DD')}
              {info.submittedBy && info.submittedBy !== applicant.userOID && `，${this.$t('expense-report.submitted.by', {name: info.submittedName})}`/*由 name 代提*/}
            </span>
            <span className="detail-info">{this.$t('common.column.status')/*状态*/}：{this.$t(expenseReportStatus.text)}</span>
          </Row>
          <RelativeExpenseReportDetail info={info}/>
          <Row className="row-container">
            <span
              className="amount">{this.$t('expense-report.amount')/*单据金额*/}：{info.currencyCode} {this.filterMoney(info.totalAmount)}&nbsp;&nbsp; {this.$t('expense-report.pay.amount')/*付款金额*/}：{info.baseCurrency} {this.filterMoney(info.baseCurrencyRealPayAmount || info.realPaymentBaseAmount)}</span>
            {/*业务暂时去除*/}
            {false && info.totalAmount > info.personalPaymentAmount && expenseReportStatus.operate !== 'edit' && <span
              className="personal-payment-amount">{this.$t('expense-report.personal.amount')/*个人支付*/}: {info.currencyCode} {this.filterMoney(info.personalPaymentAmount)}</span>}
            {false && info.totalAmount > info.personalPaymentAmount && expenseReportStatus.operate !== 'edit' && <span
              className="company-payment-amount">{this.$t('expense-report.company.amount')/*公司支付*/}: {info.currencyCode} {this.filterMoney(info.totalAmount - info.personalPaymentAmount)}</span>}
          </Row>
        </div>
      </Spin>
    );
    let detailContent = (
      <div className="tab-container">
        <h3 className="sub-header-title">
          {this.$t('expense-report.detail')/*报销单详情*/}
          {!loading && !readOnly && <a className="edit"
                                       onClick={() => this.setState({showNewExpenseReport: true})}>{this.$t('common.edit')/*编辑*/}</a>}
        </h3>
        {customField.renderFields(custFormValues, info, applicant)}
      </div>
    );
    let invoiceGroups = info.invoiceGroups || [];
    let showExpenseReportInvoiceSum = 0;
    let hasSelectedInvoice = expenseRowSelection.selectedRowKeys.length > 0;
    let showSelectedInvoiceNumber = hasSelectedInvoice ? expenseRowSelection.selectedRowKeys.length : showExpenseReportInvoices.length;
    //如果已有费用选择，则显示已选费用的数量及总数;否则显示所有费用的数量及总数
    showExpenseReportInvoices.map((invoice, index) => {
      invoice.index = index + 1;
      if (hasSelectedInvoice) {
        expenseRowSelection.selectedRowKeys.map(OID => {
          if (invoice.invoiceOID === OID) {
            showExpenseReportInvoiceSum += invoice.baseAmount;
          }
        })
      } else {
        showExpenseReportInvoiceSum += invoice.baseAmount;
      }
    });
    let expenseReportInvoicesContent = (
      <div className="detail-tabs">
        {!loading && !readOnly && (
          <div className="expense-import-area">
            {!profile['account.book.upsert.disabled'] && <Button type="primary"
                                                                 onClick={() => this.setState({showImportExpense: true})}>{this.$t('expense-report.account.import')/*账本导入*/}</Button>}
            {<Button onClick={() => this.setState({
              expenseSource: 'expenseType',
              showNewExpense: true
            })}>{this.$t('expense.new')/*新建费用*/}</Button>}
            {profile['expenseBatchImport.isOpen'] && <Button
              onClick={() => this.openExternalExpenseImport(true)}>{this.$t('expense-report.ex.expense.import')/*外部费用导入*/}</Button>}
            {businessCardEnabled && <Button onClick={() => this.setState({
              expenseSource: 'businessCard',
              showNewExpense: true
            })}>{this.$t('expense.import.business.card')/*导入商务卡费用*/}</Button>}
            {invoiceEnabled && <Button onClick={() => this.setState({
              expenseSource: 'invoice',
              showNewExpense: true
            })}>{this.$t('expense.check.invoice')/*发票查验*/}</Button>}
          </div>
        )}
        {/* 暂时隐藏费用统计标签*/}
        {/*<Tabs onChange={key => this.setState({expenseTab: key})} type="card">*/}
        {/*<TabPane tab={this.$t('expense-report.expense.statistics')} /*费用统计*!/ key="expense">*/}
        {!children &&
        <Row className="expense-percent-area" gutter={50}>
          <Col span={3}>
            {/* 全部费用 */}
            <div className="expense-percent-all expense-percent" style={{width:'60px'}}
                 onClick={this.handleSelectAllCategory}>
              <Pie
                color={currentCategoryName === 'ALL'? '' : '#bfd8ef'}
                height={60}
                subTitle={`${this.$t('expense.all.brief')}`}
                total={'100.00%'}
                percent={100}
              />
            </div>
          </Col>
          <Col span={21} style={{paddingLeft: '0px'}}>
            <div className="expense-percent-group">
              {invoiceGroups.map((category, index) => (
                <div className="expense-percent"  style={{width:'60px'}} key={index} onClick={() => this.handleSelectCategory(category)}>
                  <Pie
                    color={currentCategoryName === category.categoryName? '' : '#bfd8ef'}
                    height={60}
                    subTitle={category.categoryName}
                    total={category.proportion.toFixed(2) + '%'}
                    percent={category.proportion.toFixed(2)}
                  />
                </div>
              ))}
            </div>
          </Col>
        </Row>}
        {travelSubsidy && (
          <div className="expense-report-travel-subsidy">
            <RadioGroup value={travelSubsidyType} onChange={this.handleChangeTravelSubsidyType}>
              <Radio value="normal">{this.$t('expense-report.expense.type.normal')/*普通类型*/}</Radio>
              <Radio value="travel">{this.$t('expense-report.expense.type.travel.subsidy')/*差补类型*/}</Radio>
            </RadioGroup>
            <br/>
            {this.$t('expense-report.subsidy.city')/*补贴城市*/}: &nbsp;&nbsp;{travelSubsidy.areas.join(',')}
            <br/>
            {this.$t('expense-report.subsidy.employee')/*补贴人员*/}: &nbsp;&nbsp;
            <RadioGroup value={travelSubsidyUser} onChange={this.handleChangeTravelSubsidyUser}>
              <Radio value="all">{this.$t('common.all')/*全部*/}</Radio>
              {travelSubsidy.users.map(user => <Radio value={user.userOID}
                                                      key={user.userOID}>{user.fullName}</Radio>)}
            </RadioGroup>
            <br/>
            {travelSubsidyType === 'travel' && !readOnly &&
            <Button className="delete-btn" style={{marginTop: 5}}>{this.$t('common.delete.all')/*删除全部*/}</Button>}
          </div>
        )}
        {audit && haveAutoAudit && <Tabs type="card" onChange={this.auditTabsChange}>
          {auditTabs.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>}
        <div className="expense-table-title">
          {hasSelectedInvoice ? this.$t('common.has.selected')/*已选*/ : this.$t('common.number')/*数量*/}：&nbsp;
          <b>{showSelectedInvoiceNumber}&nbsp;<span className="ant-divider"/></b>&nbsp;
          {this.$t('common.total.amount')/*总金额*/}：&nbsp;
          <b>{info.baseCurrency} {this.filterMoney(showExpenseReportInvoiceSum)}</b>
        </div>
        <Table columns={this.dealInvoiceColumnsRender()}
               loading={loading}
               bordered
               rowKey="invoiceOID"
               dataSource={showExpenseReportInvoices}
               size="middle"
              //  onRow={(record) => ({
              //    onClick: () => this.setState({
              //      showNewExpense: true,
              //      nowEditExpense: record
              //    })
              //  })}
               expandedRowRender={this.renderAllExpandedRow}
               rowSelection={(approve && this.checkFunctionProfiles('app.approval.reject.batch.disabled', [undefined, false])) ? expenseRowSelection : undefined}
               rowClassName={this.renderClass}
               pagination={false}/>
        {/*</TabPane>*/}
        {/*<TabPane tab="人员统计" key="person">人员统计</TabPane>*/}
        {/*</Tabs>*/}
      </div>
    );
    //强管控时不允许提交报销单
    let budgetError = false;
    checkResult.map(item => {
      budgetError = budgetError || item.type === 1;
    });
    const loanRowSelection = {
      selectedRowKeys: selectedLoanRequest ? selectedLoanRequest.applicationOID : null,
      onChange: this.handleSelectLoan,
      type: 'radio'
    };
    let leftAmount = info.personalPaymentAmount - reimbursementAmount;
    leftAmount = leftAmount < 0 ? 0 : leftAmount;
    const {pageFrom} = this.props.match.params;
    return (
      <div className="base-expense-report-detail background-transparent">
        <div className="tabs-info">
          <Tabs onChange={this.handleTabsChange} type="card">
            <TabPane tab={this.$t('expense-report.info')/*报销单信息*/} key="requestInfo">{requestInfo}</TabPane>
            {approvalHistory && (
              <TabPane tab={this.$t('expense-report.approve.status')/*审批历史*/} key="approvals">
                <ApproveHistory businessCode={info.businessCode} isShowReply={pageFrom === 'my' && info.status === 1003} approvalChains={info.approvalChains} approvalHistory={approvalHistory} applicantInfo={applicant}/>
              </TabPane>
            )}
          </Tabs>
        </div>
        {tabValue !== 'approvals' && <div style={{margin: '0 -20px', overflowX: 'hidden'}}>
          <div className="detail-tabs detail-tabs-content">{detailContent}</div>
          <div>{expenseReportInvoicesContent}</div>
        </div>}
        <div style={{ marginTop: 60 }}/>
        { (!loading && approve  )&&
        <ApproveExpenseReportDetail info={info} selectedExpense={expenseRowSelection.selectedRowKeys}
                                    customFormPropertyMap={form.customFormPropertyMap}
                                    auditCapability={auditCapability}
                                    emitRefresh={() => this.getInfo(true)}/>}
        {audit && (buttonRoleSwitch ? <AuditApplicationDetail entityOID={info.expenseReportOID} status={info.status} entityType={1002} expenseOid={this.props.match.params.expenseReportOID} afterClose={this.handleAfterClose}/> :
          <Affix offsetBottom={0} className="bottom-bar">
            <Button onClick={this.handlePrint} type="primary" className="back-btn"
                    loading={printLoading}>{this.$t('common.print')/*打印*/}</Button>
            <Button className="back-btn" onClick={this.goBack}>{this.$t('common.back')/*返回*/}</Button>
          </Affix>)}
        {!audit && !approve && view && (
          <Affix offsetBottom={0} className="bottom-bar">
            <Button onClick={this.handlePrint} type="primary" className="back-btn"
                    loading={printLoading}>{this.$t('common.print')/*打印*/}</Button>
          </Affix>
        )}
        {pay && (
          <Affix offsetBottom={0} className="bottom-bar">
            { info.status === 1008 && this.checkFunctionProfiles('web.financial.approval.sure.ready.pay.disabled', [undefined, false]) && expenseReportStatus.state === 'processing' && this.checkPageRole('EXPENSEPAYMENT', 2) &&
            <Button type="primary" className="back-btn" onClick={this.handleConfirmPay}
                    loading={submitting}>{this.$t('confirm.payment.confirmPaid'/*确认已付款！*/)}</Button>}
            <Button className="back-btn" onClick={this.goBack}>{this.$t('common.back')/*返回*/}</Button>
          </Affix>
        )}
        {!audit && !approve && !view && !pay && !loanRefund && (
          <Affix  offsetBottom={0}
          style={{
            position: 'fixed',
            bottom: 0,
            marginLeft: '-35px',
            width: '100%',
            height: '50px',
            boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
            background: '#fff',
            lineHeight: '50px',
            zIndex: 1,
          }}>
            {expenseReportStatus.operate === 'edit' &&
            <Button type="primary" className="back-btn" style={{marginLeft:20}} onClick={this.handleSubmit}
                    loading={submitting}>{this.$t('common.submit')/*提交*/}</Button>}
            {expenseReportStatus.operate === 'edit' &&
            <Button className="back-btn delete-btn" style={{marginLeft:20}} loading={deleting}
                    onClick={this.handleDelete}>{this.$t('common.delete')/*删除*/}</Button>}
            {expenseReportStatus.operate === 'processing' && this.checkFunctionProfiles('er.opt.withdraw.disabled', [undefined, false]) &&  !(this.checkFunctionProfiles('bill.approved.withdraw', [true]) && info.withdrawFlag === 'N') &&
            <Button className="back-btn" style={{marginLeft:20}}onClick={this.handleWithdraw}
                    loading={withdrawing}>{this.$t('common.withdraw')/*撤回*/}</Button>}
            {info.printView === 1 &&
            <Button type="primary" className="back-btn"  style={{marginLeft:20}}onClick={this.handlePrint}
                    loading={printLoading}>{this.$t('common.print')/*打印*/}</Button>}
            {expenseReportStatus.operate === 'edit' && <Button className="back-btn" style={{marginLeft:20}} onClick={this.handleSave}
                                                               loading={saving}>{this.$t('common.save')/*保存*/}</Button>}
            <Button className="back-btn" style={{marginLeft:20}} onClick={this.goBack}>{this.$t('common.back')/*返回*/}</Button>
          </Affix>
        )}
        <ListSelector type="expense_report_invoice"
                      method="post"
                      visible={showImportExpense}
                      onCancel={() => this.setState({showImportExpense: false})}
                      onOk={this.handleSelectExpense}
                      extraParams={{
                        invoiceStatus: 'INIT',
                        applicantOID: applicant.userOID,
                        expenseReportOID: info.expenseReportOID,
                        currencyCode: this.checkFunctionProfiles('web.invoice.keep.consistent.with.expense', [true]) ? info.currencyCode : null,
                        expenseTypeOIDStr
                      }}
                      selectAll
                      onSelectAll={this.handleSelectAllExpense}
                      selectAllLoading={selectAllLoading}
        />
        {!loading && <SlideFrame show={showNewExpense}
                                 title={readOnly ? this.$t('expense.view')/*查看费用*/ : (nowEditExpense ? this.$t('expense.edit')/*编辑费用*/ : this.$t('expense.new')/*新建费用*/)}
                                 onClose={() => this.setState({showNewExpense: false, nowEditExpense: null})}
                                 hasFooter={false}
                                 width="800px">
                                 <NewExpense
                                 close={this.handleCloseNewCreate}
                                 params={
                                  {
                                    nowExpense: nowEditExpense,
                                    expenseReport: info,
                                    expenseSource,
                                    showExpenseReportInvoices,
                                    readOnly,
                                    approve,
                                    isWaitForAudit,
                                    audit,
                                    view,
                                    pay,
                                    auditCapability,
                                    slideFrameShowFlag: showNewExpense,
                                    businessCardEnabled,
                                    costCenterItemsApportion,
                                    user: applicant,
                                    switchingInvoice:this.switchingInvoice,
                                  }
                                }
                                 />
                                 </SlideFrame>}

        {!loading && expenseReportStatus.operate === 'edit' && <SlideFrame show={showNewExpenseReport}
                                                                           title={this.$t('expense-report.edit')/*编辑报销单*/}
                                                                           params={{expenseReport: info, formDetail: form}}
                                                                           onClose={() => this.setState({showNewExpenseReport: false})}>
                                                                           <NewExpenseReport
                                                                           close={this.handleCloseNewReport}
                                                                           params={{expenseReport: info, formDetail: form}}
                                                                           />
                                                                           </SlideFrame>
        }
        <Modal title={this.$t('common.repayment')/*还款*/} okText={this.$t('common.submit')/*提交*/}
               visible={showLoanModal} wrapClassName="loan-list-modal"
               onOk={this.handleSubmitWithLoan}
               width={800}
               onCancel={this.handleCancelLoan}>
          {!profile['web.report.expense.compulsory.repayment'] && (
            <Alert message={<a onClick={this.handleDirectSubmit}>{this.$t('expense-report.direct.submit')/*直接提交*/}</a>}
                   description={this.$t('expense-report.direct.submit.info')/*如果您无需还款，请点击此处直接提交报销单*/}
                   type="info"
                   showIcon/>
          )}
          <div className="personal-payment-amount">
            {this.$t('expense-report.personal.amount')/*个人支付*/}&nbsp;{info.currencyCode}{this.filterMoney(info.personalPaymentAmount)}
          </div>
          <div className="reimbursement-amount">
            {this.$t('common.repayment')/*还款*/}&nbsp;{info.currencyCode}{this.filterMoney(info.personalPaymentAmount - leftAmount)}&nbsp;&nbsp;
            {this.$t('common.remain')/*剩余*/}&nbsp;{info.currencyCode}{this.filterMoney(leftAmount)}
          </div>
          <div className="select-loan-title">{this.$t('expense-report.select.loan')/*选择借款单*/}</div>
          <Table size="small"
                 columns={[
                   {title: this.$t('common.sequence')/*序号*/, dataIndex: 'index', width: '10%'},
                   {
                     title: this.$t('expense-report.loan.date')/*借款日期*/,
                     dataIndex: 'submittedDate',
                     render: submittedDate => new Date(submittedDate).format('yyyy-MM-dd')
                   },
                   {
                     title: this.$t('expense-report.loan.document')/*借款单*/,
                     dataIndex: 'title',
                     width: '40%',
                     render: (value, record) => {
                       let content = `${record.formName}${record.title ? `-${record.title}` : ''}`;
                       return <Popover content={content}>{content}</Popover>
                     }
                   },
                   {
                     title: this.$t('expense-report.loan.repayment.amount')/*可还款金额*/,
                     dataIndex: 'writeoffArtificialDTO.stayWriteoffAmount',
                     render: this.filterMoney
                   }
                 ]}
                 dataSource={loanRequestList}
                 rowSelection={loanRowSelection}
                 rowKey="applicationOID"
                 pagination={false}
                 rowClassName="selectable-row"
                 onRow={(record) => {
                   return {
                     onClick: () => this.handleSelectLoan([record.applicationOID], [record])
                   };
                 }}
          />
        </Modal>

        <Modal visible={showChecking} maskClosable={false} footer={null} closable={false}
               wrapClassName="expense-report-checking">
          <img src={loadingImg} className="checking-img"/>
          <img src={auditingImg} className="checking-img-content"/>
          <div className="checking-divide"/>
          <div className="checking-title">{checkingText}</div>
          <div className="checking-content">{this.$t('common.waiting')/*请稍等...*/}</div>
        </Modal>

        <Modal title={this.$t('expense-report.check.result')/*检查结果*/} visible={showCheckResult} footer={null}
               onCancel={() => this.setState({showCheckResult: false, submitting: false})}
               wrapClassName="expense-report-check">
          {checkResult.map((item, index) => (
            <div className="check-result-item" key={index}>
              <div>{item.title}</div>
              <div
                className={`check-result-message ${item.type === 0 ? 'weak-control' : 'strong-control'}`}>{item.message}</div>
            </div>
          ))}
          <div className="check-result-button-area">
            <Button onClick={() => this.setState({
              showCheckResult: false,
              submitting: false
            })}>{this.$t('common.back')/*返回*/}</Button>
            {!budgetError && <Button type="primary"
                                     onClick={this.confirmSubmit}
                                     loading={directSubmitting}>{this.$t('expense-report.continue.submit')/*继续提交*/}</Button>}
          </div>
        </Modal>

        {/*外部费用导入视图*/}
        <ExternalExpenseImport
          visible={this.state.showExternalExpenseImportModal}
          title={this.$t('expense-report.ex.expense.import')/*外部费用导入*/}
          expenseReportOID={info.expenseReportOID}
          formOID={info.formOID}
          userOID={info.applicantOID}
          applicationOID={info.applicationOID}
          createTableShow={false}
          onOk={this.importExternalExpense}
          afterClose={() => this.openExternalExpenseImport(false)}
        />
        {info.expenseReportOID && this.state.showYingfuSelectApproveModal && <YingfuSelectApprove visible={this.state.showYingfuSelectApproveModal}
                                                                                                  expenseReport={info}
                                                                                                  onOk={this.submitYingfuApprove}
                                                                                                  afterClose={() => this.openYingfuSelectApprove(false)}
        />}

      </div>
    )
  }
}

// ExpenseReportDetail.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    profile: state.user.proFile,
    company: state.user.company,
    loginUser: state.user.currentUser
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseReportDetail);
