import {getQueryUrlParam} from "utils/extend";
import React from 'react'
import { connect } from 'dva'
import { Affix, message, Button, Modal } from 'antd'
import ApproveExpenseReportService from 'containers/expense-report/expense-report-approve/approve-expense-report.service'
import ApproveBar from 'widget/Template/approve-bar'
import financeAuditService from "containers/financial-management/finance-audit/finance-audit.service";
import baseService from "share/base.service";
import expenseReportService from "containers/expense-report/expense-report.service";
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router';

class ApproveExpenseReportDetail extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      passLoading: false,
      rejectLoading: false,
      noticeLoading: false,
      printLoading: false,
      checkLoading: false,
      // approveExpenseReportList: menuRoute.getRouteItem('approve-expense-report'),
      showAdditional: false,
      invoiceNumber: 0,//查验的发票数量
      invoice: [],//查验的发票数组信息
      companyOids: [], //加签人列表
    }
  }

  componentDidMount(){
    //判断是否可以加签
    ApproveExpenseReportService.isCounterSignEnable(this.props.company.companyOid, this.props.info.formOid, 'enableAddSign').then(res =>{
      this.setState({ showAdditional: res.data.enabled, companyOids: res.data.approvalAddSignScope.companyOids })
    })
    this.props.auditCapability && expenseReportService.checkInvoice(this.props.info.expenseReportOid).then(res => {
      this.setState({
        invoiceNumber:res.data.length,
        invoice: res.data,
      })
    });
  }

  //返回
  goBack = () => {
    // this.context.router.push(this.state.approveExpenseReportList.url + `?tab=${location.search.indexOf('approvePending') > -1 ? 'approvePending' : 'approved'}`)
    this.props.dispatch(
      routerRedux.push({
        pathname: `/approval-management/approve-expense-report`
      })
    ) 
  };

  hasRepeatApproveTip = (value, additionalItems) => {
    const { info } = this.props;
    let additionalOids = [];
    let additionalHaveApprovedNames = [];  //加签人中已审批的用户名
    additionalItems.map(item => {
      additionalOids.push(item.userOid)
    });
    let preApproveOids = [];
    info.approvalHistoryDTOs.map(item => {
      item.operation === 2001 && (preApproveOids.push(item.operatorOid))
    });
    additionalOids.map((Oid, index) => {
      if (preApproveOids.indexOf(Oid) > -1) {
        additionalHaveApprovedNames.push(additionalItems[index].fullName)
      }
    });
    if (additionalHaveApprovedNames.length) {
      Modal.confirm({
        title: `${additionalHaveApprovedNames.join('、')} 已经审批通过，是否继续？`,
        onOk: () => this.handleApprovePass(value, additionalOids)
      });
    } else {
      this.handleApprovePass(value, additionalOids)
    }
  };

  //审批通过
  handleApprovePass = (value, additionalOids) => {
    const { info } = this.props;
    let params = {
      approvalTxt: value,
      entities: [{
        approverOid: info.approvalChain.approverOid,
        entityOid: info.expenseReportOid,
        entityType: 1002,
        countersignApproverOids: additionalOids
      }]
    };
    this.setState({ passLoading: true });
    ApproveExpenseReportService.handleExpenseReportApprovePass(params).then(res => {
      if (res.data.failNum === 0) {
        message.success(this.$t('common.operate.success'));
        this.setState({ passLoading: false });
        this.goBack()
      } else {
        this.setState({ passLoading: false });
        message.error(`${this.$t('common.operate.filed')}，${res.data.failReason[info.expenseReportOid]}`)
      }
    }).catch(e => {
      this.setState({ passLoading: false });
      message.error(`操作失败，${e.response.data.message}`)
    })
  };

  //审批驳回
  handleApproveReject = (value, additionalItems, direct) => {
    let additionalOids = [];
    additionalItems.map(item => {
      additionalOids.push(item.userOid)
    });
    const { info, selectedExpense } = this.props;
    let params = {
      approvalTxt: value,
      entities: [{
        approverOid: info.approvalChain.approverOid,
        entityOid: info.expenseReportOid,
        entityType: 1002,
      }]
    };
    additionalOids && (params.entities[0].countersignApproverOids = additionalOids);
    this.setState({ rejectLoading: true });
    if(selectedExpense.length > 0 && !direct){
      params = {
        approvalTxt: value,
        expenseOid: info.expenseReportOid,
        invoiceOids: selectedExpense
      };
      let allReject = true;
      info.expenseReportInvoices.map(invoice => {
        allReject = allReject && (selectedExpense.indexOf(invoice.invoiceOid) > -1 || invoice.status === 1002);
      });
      if(allReject){
        Modal.confirm({
          content: '驳回所有费用将直接驳回报销单，你确定驳回吗？',
          onOk: () => {
            this.handleService(ApproveExpenseReportService.batchRejectInvoice, params, true)
          }
        });
      } else {
        this.handleService(ApproveExpenseReportService.batchRejectInvoice, params, false)
      }
    } else {
      this.handleService(ApproveExpenseReportService.handleExpenseReportApproveReject, params, true, true)
    }
  };

  handleService = (service, params, goBack, isHandleService = false) => {
    service(params).then(res => {
      if (res.status === 200) {
        if(isHandleService){
          message.error(`${this.$t('common.operate.filed')}，${res.data.failReason[this.props.info.expenseReportOid]}`)
        }else {
          message.success('操作成功');
        }
        this.setState({ rejectLoading: false });
        if(goBack){
          this.goBack();
        } else {
          this.props.emitRefresh();
        }
      }
    }).catch(e => {
      this.setState({ rejectLoading: false });
      message.error(`操作失败，${e.response.data.message}`)
    })
  };
  //通知
  handleAuditNotice = (value) => {
    const { info } = this.props;
    let params = {
      entityOid:info.expenseReportOid,
      entityType:1002,
      notice: value
    };
    this.setState({ noticeLoading: true });
    financeAuditService.noticeApplication(params).then(res => {
      if (res.status === 200) {
        message.success(this.$t("common.operate.success")/*操作成功*/);
        this.setState({ noticeLoading: false });
        this.goBack()
      }
    }).catch(e => {
      this.setState({ noticeLoading: false });
      message.error(this.$t("common.operate.filed")/*操作失败*/)
    })
  };
  //打印
  handlePrint = () => {
    const {info} = this.props;
    this.setState({printLoading: true});
    baseService.printExpense(info.expenseReportOid).then(res => {
      this.setState({printLoading: false});
      window.open(res.data.link, "_blank")
    });
  };
  //审核查验
  handleAuditCheck = () => {
    const invoice = this.state.invoice;
    this.setState({ checkLoading: true });
    expenseReportService.recheckInvoice(invoice).then(res => {
      if (res.data.failedCount === 0) {
        this.setState({invoiceNumber: 0, invoice: []});
        message.success(this.$t('expense.date.invoice.verified')/*发票查验成功*/);
      } else {
        this.setState({invoiceNumber: res.data.failedCount, invoice: res.data.failedList});
        message.warn(this.$t('expense.date.fail.info')/*有查验失败的发票信息*/);

      };
      if (res.data.successList.length > 0) {
        this.props.emitRefresh();
      }
      this.setState({ checkLoading: false });
    });
  };

  render() {
    const { approveExpenseReportList, passLoading ,rejectLoading, showAdditional, noticeLoading, printLoading, checkLoading, invoiceNumber, companyOids } = this.state;
    const { profile }=this.props;
    let moreButtons = [];
    showAdditional && moreButtons.push('additional');
    const { selectedExpense, customFormPropertyMap, auditCapability,info } = this.props;
    invoiceNumber > 0 && moreButtons.push('auditCheck');
    let approvalChains = [];
    if (info.approvalChains && info.approvalChains.length > 0) {
      info.approvalChains.map(item => {
        approvalChains.push(item.approverOid)
      })
    }
    return  info.status === 1002 && ~approvalChains.indexOf(info.approvalChain.approverOid)  ? (
      <Affix style={{paddingLeft : 20}} offsetBottom={0} className="bottom-bar bottom-bar-approve">
        <ApproveBar backUrl={'/approval-management/approve-expense-report'}
                    passLoading={passLoading}
                    moreButtons={moreButtons}
                    rejectLoading={rejectLoading}
                    signCompanyOids={companyOids}
                    customFormPropertyMap={customFormPropertyMap}
                    handleApprovePass={this.hasRepeatApproveTip}
                    handleApproveReject={this.handleApproveReject}
                    handleAuditNotice={this.handleAuditNotice}
                    handleAuditPrint={this.handlePrint}
                    handleAuditCheck={this.handleAuditCheck}
                    noticeLoading={noticeLoading}
                    printLoading={printLoading}
                    checkLoading={checkLoading}
                    invoiceNumber={invoiceNumber}
                    batchNumber={selectedExpense.length}
                    auditCapability={auditCapability}
                    btnShowMode="all"
                    buttons={selectedExpense.length > 0 ? ['reject'] : undefined}/>
      </Affix>
    ) : (
      <Affix offsetBottom={0} className="bottom-bar">
        <Button className="back-btn" onClick={this.goBack}>{this.$t('common.back')/*返回*/}</Button>
      </Affix>
    )
  }
}

ApproveExpenseReportDetail.propTypes = {
  info:PropTypes.object,
  selectedExpense: PropTypes.array,
  emitRefresh: PropTypes.func,
  auditCapability:PropTypes.bool//具体审核能力，因审批流复杂性，让部分审批的单子具备审核能力
};

ApproveExpenseReportDetail.defaultProps={
  info: {},
  selectedExpense: [],
  auditCapability: false
};

// ApproveExpenseReportDetail.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    profile: state.user.profile
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ApproveExpenseReportDetail)
