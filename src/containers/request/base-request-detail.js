import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import constants from 'share/constants'
import {messages, getApprovelHistory} from 'share/common'
import { Form, Tabs, Affix, Spin, Row, message } from 'antd'
const TabPane = Tabs.TabPane;

import JDOrderInfo from 'containers/request/jd-request/jd-order-info'
import JDErrorAlert from 'containers/request/jd-request/jd-error-alert'
import BookerInfoAlert from 'containers/request/booker-request/booker-info-alert'
import BookerTicketInfo from 'containers/request/booker-request/ticket-info'
import RescheduleRefundInfo from 'containers/request/booker-request/reschedule-refund-info'
import LoanRepayment from 'containers/request/loan-request/loan-repayment'
import LoanRepaymentAmount from 'containers/request/loan-request/loan-repayment-amount'
import LoanRelatedApplication from 'containers/request/loan-request/loan-related-application'
import TravelInformation from 'containers/request/travel-request/travel-information'
import TravelInformationElement from 'containers/request/travel-request/travel-element-information'
import TravelDate from 'containers/request/travel-request/travel-date'
import TravelPreviousVersion from 'containers/request/travel-request/travel-previous-version'

import RecallBtn from 'containers/request/btns/recall-btn'
import GoBackBtn from 'containers/request/btns/go-back-btn'
import PrintBtn from 'containers/request/btns/print-btn'
import TravelUpdateBtn from 'containers/request/btns/travel-update-btn'
import ExpireBtn from 'containers/request/btns/expire-btn'
import RestartBtn from 'containers/request/btns/restart-btn'
import BookerRefundBtn from 'containers/request/btns/booker-refund-btn'
import BookerEndorseBtn from 'containers/request/btns/booker-endorse-btn'
import ApproveRequestBtn from 'containers/approve/request/approve-request-btn'
import RescheduleRefundBtn from 'containers/approve/reschedule-refund/reschedule-refund-btns'
import PriceReviewBtn from 'containers/approve/price-review/price-review-btn'
import AuditApplicationDetail from 'containers/financial-management/finance-audit/audit-application-detail'
import LoanAndRefundBack from 'containers/financial-management/loan-and-refund/loan-and-refund-back'
import SurePayBtn from 'containers/financial-management/confirm-payment/sure-pay-btn'

import ApproveHistory from 'components/template/approve-history'
import customField from 'share/customField'
import requestService from 'containers/request/request.service'
import baseService from 'share/base.service'
import approveRequestService from 'containers/approve/request/request.service'
import 'styles/request/base-request-detail.scss'

class BaseRequestDetail extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tapValue: 'requestInfo',
      subTabValue: 'detail',
      formOID: '',
      formType: '',
      formInfo: {},
      repaymentInfo: {}, //待还款金额信息
      showNewRepaymentSlide: false,
      info: {}, //申请单详情
      approvalChain: {},  //审批链
      approvalHistory: [], //审批历史
      approve: false, //审批页面
      showApproveBottom: false, //是否显示底部审批／驳回等按钮
      audit: false,  //审核页面
      view: false,  //查看页面
      loanRefund: false,  //借还款页面
      rescheduleRefund: false, //退改签页面
      price: false, //价格审核页面
      confirmPay: false, //确认付款页面
      readOnly: false,   //只可读
      payProcess:location.search.indexOf('pay_in_process')>-1,
      manageType: null,
      buttonRoleSwitch:this.checkPageRole('EXPENSEAUDIT', 2) && this.checkFunctionProfiles(['er.disabled'], [[false, undefined]]) && this.checkFunctionProfiles(['finance.audit.disabled'], [[false, undefined]]) //按钮操作权限
    }
  }

  componentDidMount() {
    this.setState({
      formOID: this.props.params.formOID,
      approve: this.props.location.pathname.indexOf('approve-request-detail') > -1,
      audit: this.props.location.pathname.indexOf('loan-request-detail-audit') > -1,
      view: this.props.location.pathname.indexOf('finance-view') > -1,
      loanRefund: this.props.location.pathname.indexOf('loan-refund-detail') > -1,
      rescheduleRefund: this.props.location.pathname.indexOf('reschedule-refund-detail') > -1,
      price: this.props.location.pathname.indexOf('price-review-detail') > -1,
      confirmPay: this.props.location.pathname.indexOf('confirm-payment') > -1,
    },() => {
      const { approve, audit, view, loanRefund, rescheduleRefund, price, confirmPay } = this.state;
      this.setState({
        readOnly: approve || audit || view || loanRefund || rescheduleRefund || price || confirmPay || this.props.location.query.readOnly,
      });
      this.getFormType(this.state.formOID)
    })
  }

  getFormType = (formOID) => {
    this.setState({ loading: true });
    requestService.getFormType(formOID).then(res => {
      this.setState({
        formType: res.data.formType,
        formInfo: res.data,
        manageType:res.data.customFormProperties.manageType
      },() => {
        this.getInfo(this.state.formType)
      });
    }).catch(e => {
      this.setState({loading: false});
      let error = e.response.data;
      if (error.validationErrors && error.validationErrors.length) {
        message.error(error.validationErrors[0].message)
      } else {
        message.error(error.message)
      }
    })
  };

  getInfo = () => {
    //formType：2001（差旅申请）、2002（费用申请）、2003（订票申请）、2004（京东申请）、2005（借款申请）
    const { applicationOID, bookTaskOID } = this.props.params;
    let getType = this.state.rescheduleRefund ? 'getBookerTaskRequestDetail' : 'getRequestDetail';
    this.setState({ loading: true });
    requestService[getType](applicationOID, bookTaskOID).then(res => {
      this.setState({
        loading: false,
        info: this.state.rescheduleRefund ? res.data.applicationDTO : res.data,
        approvalHistory: this.state.rescheduleRefund ? res.data.approvalHistoryDTOs : res.data.approvalHistorys
      },() => {
        this.getRepaymentAmount(this.state.formType);
        if (this.state.approve) {
          let info = this.state.info;
          this.setState({showApproveBottom: this.showApproveButton(info.approvalChain, info.approvalChains, this.props.user.userOID, info.status)});
        }
      })
    }).catch(e => {
      this.setState({loading: false});
      let error = e.response.data;
      if (error.validationErrors && error.validationErrors.length) {
        message.error(error.validationErrors[0].message)
      } else {
        message.error(error.message)
      }
    })
  };

  //判断是否显示底部审批／驳回等按钮
  showApproveButton = (approvalChain, approvalChains, currentUserId, status) => {
    let showBottom = false;
    if(status!==1002){
      return;
    }
    if(approvalChain){
      if(approvalChain.approverOID == currentUserId){
        showBottom = true;
      }
    }
    if(approvalChains){
      approvalChains.forEach((approver) => {
        if(approver.approverOID == currentUserId){
          showBottom = true;
        }else{
          if(approver.proxyApproverOIDs){
            approver.proxyApproverOIDs.forEach((proxyApprover) => {
              if(proxyApprover == currentUserId){
                showBottom = true;
              }
            })
          }
        }
      })
    }
    return showBottom;
  };

  //如果是借款单，获取待还款总金额
  getRepaymentAmount = (formType) => {
    if (formType === 2005) {
      baseService.getRepaymentAmount(this.state.info.applicantOID, this.state.info.companyOID, [1005,1006]).then(resp => {
        if (resp.status === 200 && resp.data){
          this.setState({repaymentInfo: resp.data});
        }
      });
    }
  };

  //申请单信息／审批进度 切换
  handleTabsChange = (tab) => {
    this.setState({ tapValue: tab })
  };

  //申请单详情／还款进度 切换
  handleSubTabsChange = (value) => {
    this.setState({ subTabValue: value })
  };

  //借款申请单 - 新建还款
  toRepayment = () => {
    this.setState({
      subTabValue: 'repayment',
      showNewRepaymentSlide: true
    })
  };

  //借款申请单 - 新建还款
  handleRepaymentSave = () => {
    this.setState({ showNewRepaymentSlide: false },() => {
      this.getInfo()
    })
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString
  };

  render() {
    const { approving, isPreVersion, latestApplicationOID, from } = this.props.location.query;
    const { payProcess, loading, tapValue, subTabValue, formType, formInfo, showNewRepaymentSlide, info, approvalHistory,
      approve, audit, view, loanRefund, rescheduleRefund, price, readOnly , buttonRoleSwitch, repaymentInfo, confirmPay, showApproveBottom } = this.state;
    let applicant = info.applicant || {}; //申请人信息
    let custFormValues = info.custFormValues || []; //自定义表单
    custFormValues.sort((a, b) => a.sequence > b.sequence || -1);
    let rescheduleRefundInfoShow = false; //是否显示退改签信息
    if (formType === 2003) {
      (info.travelOperationRecords || []).map(item => {
        //type：1002（改签）、1003（退票）
        (item.type === 1002 || item.type === 1003) && (rescheduleRefundInfoShow = true)
      })
    }
    let renderCloseDate = null; //（预计）停用日期
    if (info.status === 1003) { //已通过状态停用时间都是获取个人的停用时间
      if (info.applicationParticipant && info.applicationParticipant.closeDate) {
        if (info.applicationParticipant.closed === 1) { //当前单据对于当前操作人是已停用状态
          renderCloseDate = (
            <span className="detail-info">
              {messages('itinerary.form.component.expire.date')/*停用日期*/}：
              {moment(info.applicationParticipant.closeDate).format('YYYY-MM-DD')}
            </span>
          )
        } else {
          //在对于人员未关闭时是否显示停用日期以是否有个人的停用日期为准，停用日期一直获取的为个人的停用日期
          renderCloseDate = (
            <span className="detail-info">
              {messages('itinerary.form.component.stop.date')/*预计停用日期*/}：
              {moment(info.applicationParticipant.closeDate).format('YYYY-MM-DD')}
            </span>
          )
        }
      }
    } else { //不是已通过状态时，停用时间都是获取的是单据的停用时间，根据单子的属性
      if (info.closeEnabled && info.closeDate) {
        renderCloseDate = (
          <span className="detail-info">
            {messages('itinerary.form.component.stop.date')/*预计停用日期*/}：
            {moment(info.closeDate).format('YYYY-MM-DD')}
          </span>
        )
      }
    }
    let requestInfo = (
      <Spin spinning={loading}>
        <div className="top-info">
          {formType === 2004 && <JDErrorAlert info={info}/>}
          {formType === 2003 && !readOnly && <BookerInfoAlert info={info}/>}
          <Row className="row-container">
            <span className="top-info-name">{applicant.fullName}</span>
            <span className="detail-info">
              {(approve || audit || view) && !!repaymentInfo.debtAmount && repaymentInfo.debtAmount > 0 && (
                <span style={{color: '#0092da'}}>
                  {messages('common.total.pending.repayment'/*待还总额*/)}：{repaymentInfo.baseCurrency}&nbsp;{this.renderMoney(repaymentInfo.debtAmount || 0)}&nbsp;
                  {/* <Icon type="right"/> */}&nbsp;&nbsp;
                </span>
              )}
              {messages('request.detail.employee.id'/*工号*/)}：{applicant.employeeID}
              <span className="ant-divider"/>
              {messages('request.detail.department.name'/*部门*/)}：{applicant.departmentName || '-'}
              <span className="ant-divider"/>
              {messages('common.user.company')/*员工公司*/}：{applicant.companyName || '-'}
            </span>
          </Row>
          <Row className="row-container">
            <span className="detail-info detail-info-first">{info.formName}：{info.businessCode}</span>
            <span className="detail-info">
              {messages('request.detail.submit.date'/*提交日期*/)}：{moment(info.submittedDate).format('YYYY-MM-DD')}
              {info.submittedBy && applicant.userOID !== info.submittedBy &&
                `，${messages('request.detail.submit.by.name', {name: info.submittedName}/*由 {name} 代提*/)}`}
            </span>
            {renderCloseDate}
            <span className="detail-info">{messages('request.detail.status'/*当前状态*/)}：
              {(info.closed || (info.applicationParticipant && info.applicationParticipant.closed === 1)) ?
                messages('constants.documentStatus.yet.disable'/*已停用*/) : (
                  constants.getTextByValue(String(info.status + '' + info.type), 'documentStatus') ||
                  constants.getTextByValue(String(info.status + '' + info.rejectType), 'documentStatus') ||
                  constants.getTextByValue(String(info.status), 'documentStatus')
                )
              }
            </span>
            <TravelPreviousVersion info={info} isPreVersion={isPreVersion}/>
          </Row>
          {formType === 2005 && <LoanRelatedApplication info={info}/>}
          <Row className="row-container">
            {formType !== 2005 && (
              <span className="amount">
                {messages('request.detail.total.amount'/*总金额*/)}：{info.currencyCode} {this.renderMoney(info.totalAmount || 0)}
              </span>
            )}
            {formType === 2001 && <TravelDate info={info}/>}
            {(formType === 2005 && (!readOnly || loanRefund)) && <LoanRepaymentAmount info={info} handleToRepayment={this.toRepayment} isOwner={this.props.params.pageFrom === 'my'}/>}
          </Row>
        </div>
      </Spin>
    );
    let detailContent = (
      <Spin spinning={loading}>
        <div className="tab-container">
          <h3 className="sub-header-title">{messages('request.detail.request.detail'/*申请单详情*/)}</h3>
          {customField.renderFields(custFormValues, info, applicant)}
        </div>
        {formType === 2004 && <JDOrderInfo info={info}/>}
      </Spin>
    );
    return (
      <div className="base-request-detail background-transparent">
        <div className="tabs-info">
          <Tabs type="card" activeKey={tapValue} onChange={this.handleTabsChange}>
            <TabPane tab={messages('request.detail.request.info')/*申请单信息*/} key="requestInfo">{requestInfo}</TabPane>
            <TabPane tab={messages('request.detail.approve.history'/*审批历史*/)} key="approvals">
              <ApproveHistory approvalChains={info.approvalChains} isShowReply={this.props.params.pageFrom === 'my' && info.status === 1003} businessCode={info.businessCode} approvalHistory={approvalHistory} applicantInfo={applicant}/>
            </TabPane>
          </Tabs>
        </div>
        {tapValue === 'requestInfo' && (
          <Tabs className="detail-tabs" activeKey={subTabValue} onChange={this.handleSubTabsChange}>
            <TabPane tab={messages('request.detail.request.detail'/*申请单详情*/)} key="detail">{detailContent}</TabPane>
            {(formType === 2005 && (!readOnly || loanRefund)) && (info.status === 1005 || info.status === 1006 || info.status === 1007) && (
              <TabPane tab={messages('request.detail.repayment.history'/*还款记录*/)} key="repayment">
                <LoanRepayment info={info}
                               isOwner={this.props.params.pageFrom === 'my'}
                               loanRefund={loanRefund}
                               showNewSlide={showNewRepaymentSlide}
                               applicationOID={this.props.params.applicationOID}
                               handleSave={this.handleRepaymentSave}
                               handleClose={() => {this.setState({ showNewRepaymentSlide: false })}}/>
              </TabPane>
            )}
            {formType === 2001 && this.state.manageType &&(
              <TabPane tab={messages('request.detail.travel.info'/*行程信息*/)} key="travelInfo">
                <TravelInformation applicationOID={this.props.params.applicationOID}
                                   info={info}
                                   customFormPropertyMap={formInfo.customFormPropertyMap}
                                   controlFields={JSON.parse(formInfo.customFormProperties.controlFields || '{}')}
                                   isPreVersion={isPreVersion === 'true'}
                                   latestApplicationOID={latestApplicationOID}/>
              </TabPane>
            )}
            {formType === 2001 && !this.state.manageType &&(
              <TabPane tab={messages('request.detail.travel.info'/*行程信息*/)} key="travelInfo">
                <TravelInformationElement applicationOID={this.props.params.applicationOID}
                                   info={info}
                                   customFormPropertyMap={formInfo.customFormPropertyMap}
                                          isPreVersion={isPreVersion === 'true'}
                                   latestApplicationOID={latestApplicationOID}/>
              </TabPane>
            )}
            {formType === 2003 && rescheduleRefundInfoShow && (
              <TabPane tab={messages('request.detail.reschedule.refund'/*退改签信息*/)} key="rescheduleRefundInfo">
                <RescheduleRefundInfo info={info}/>
              </TabPane>
            )}
            {formType === 2003 && (info.travelOrders || []).length > 0 && (
              <TabPane tab={messages('request.detail.ticket.info'/*机票信息*/)} key="bookerTicketInfo">
                <BookerTicketInfo info={info}
                                  afterBoardConfirm={() => {this.getInfo(formType)}}/>
              </TabPane>
            )}
          </Tabs>
        )}
        {audit && (buttonRoleSwitch ?
            <AuditApplicationDetail status={info.status} entityOID={this.props.params.applicationOID} entityType={1001}/> :
            <Affix offsetBottom={0} className='bottom-bar'><GoBackBtn backType={this.props.params.backType}/></Affix>
        )}
        {(!readOnly || approve || rescheduleRefund || price || loanRefund || payProcess || confirmPay || view) && (
          <Affix offsetBottom={0} className={`bottom-bar ${((approve && approving && showApproveBottom) || (!approve && approving)) ? 'bottom-bar-approve' : ''}`}>
            {!readOnly && <RecallBtn info={info}/>}
            {(!readOnly || view) && <PrintBtn info={info} printFlag={view}/>}
            {!readOnly && (
              <TravelUpdateBtn formType={Number(formType)} info={info}
                               updateEnable={formInfo.customFormPropertyMap && formInfo.customFormPropertyMap['application.change.enable']}/>
            )}
            {!readOnly && <ExpireBtn formType={Number(formType)} info={info}/>}
            {!readOnly && <RestartBtn formType={Number(formType)} info={info}/>}
            {!readOnly && <BookerRefundBtn formType={Number(formType)} info={info}/>}
            {!readOnly && <BookerEndorseBtn formType={Number(formType)} info={info}/>}
            {!readOnly && !payProcess &&
              (from !== 'expense' && from !== 'request') &&  //从报销单／申请单进来的关联申请单，因为是新开tab，不需要返回按钮
              <GoBackBtn backType={this.props.params.backType}/>}

            {confirmPay && <SurePayBtn applicantInfo={info} backType={this.props.params.backType} onlyBack={!payProcess}/>}
            {loanRefund && <LoanAndRefundBack tab={this.props.location.query.tab} info={info}/>}
            {approve && <ApproveRequestBtn formType={Number(formType)} info={info} approving={!!approving && showApproveBottom} formInfo={formInfo}/>}
            {rescheduleRefund && <RescheduleRefundBtn approving={!!approving} bookTaskOID={this.props.params.bookTaskOID}/>}
            {price && <PriceReviewBtn approving={!!approving} applicationOID={this.props.params.applicationOID}/>}
          </Affix>
        )}
        {(readOnly && !approve && !rescheduleRefund && !price && !loanRefund && !payProcess && !confirmPay && !view && !audit) && (
          <Affix offsetBottom={0} className='bottom-bar'>
            <GoBackBtn/>
          </Affix>
        )}
      </div>
    )
  }
}

/**
 * this.props.location.query
 * {
 *    approving: 审批中（申请单审批、退改签审批）
 *    isPreVersion: 判断是否为差旅申请单最新版的上一版
 *    latestApplicationOID: 最新版本的差旅申请单OID
 *    from: 来自于哪个页面 （expense 报销单 request 申请单）
 * }
 */

BaseRequestDetail.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    user: state.login.user
  }
}

const wrappedBaseRequestDetail = Form.create()(BaseRequestDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedBaseRequestDetail)