import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import constants from 'share/constants';
import { getApprovelHistory } from 'utils/extend';
import { Form, Tabs, Affix, Spin, Row, message,Col } from 'antd';
const TabPane = Tabs.TabPane;

import JDOrderInfo from 'containers/request/jd-request/jd-order-info';
import JDErrorAlert from 'containers/request/jd-request/jd-error-alert';
import BookerInfoAlert from 'containers/request/booker-request/booker-info-alert';
import BookerTicketInfo from 'containers/request/booker-request/ticket-info';
import RescheduleRefundInfo from 'containers/request/booker-request/reschedule-refund-info';
import LoanRepayment from 'containers/request/loan-request/loan-repayment';
import LoanRepaymentAmount from 'containers/request/loan-request/loan-repayment-amount';
import LoanRelatedApplication from 'containers/request/loan-request/loan-related-application';
import TravelInformation from 'containers/request/travel-request/travel-information';
import TravelInformationElement from 'containers/request/travel-request/travel-element-information';
import TravelDate from 'containers/request/travel-request/travel-date';
import TravelPreviousVersion from 'containers/request/travel-request/travel-previous-version';

import RecallBtn from 'containers/request/btns/recall-btn';
import GoBackBtn from 'containers/request/btns/go-back-btn';
import PrintBtn from 'containers/request/btns/print-btn';
import TravelUpdateBtn from 'containers/request/btns/travel-update-btn';
import ExpireBtn from 'containers/request/btns/expire-btn';
import RestartBtn from 'containers/request/btns/restart-btn';
import BookerRefundBtn from 'containers/request/btns/booker-refund-btn';
import BookerEndorseBtn from 'containers/request/btns/booker-endorse-btn';
import ApproveRequestBtn from 'containers/approve/request/approve-request-btn';
import RescheduleRefundBtn from 'containers/approve/reschedule-refund/reschedule-refund-btns';
import PriceReviewBtn from 'containers/approve/price-review/price-review-btn';
import AuditApplicationDetail from 'containers/financial-management/finance-audit/audit-application-detail';
import LoanAndRefundBack from 'containers/financial-management/loan-and-refund/loan-and-refund-back';
import SurePayBtn from 'containers/financial-management/confirm-payment/sure-pay-btn';
import ApproveHistory from 'widget/Template/approve-history';
import customField from 'share/customField';
import requestService from 'containers/request/request.service';
import baseService from 'share/base.service';
import approveRequestService from 'containers/approve/request/request.service';
import 'styles/request/base-request-detail.scss';
import 'styles/components/template/approve-bar.scss';
import 'styles/reimburse/reimburse-common.scss';

class BaseRequestDetail extends React.Component {
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
      approvalChain: {}, //审批链
      approvalHistory: [], //审批历史
      approve: false, //审批页面
      showApproveBottom: false, //是否显示底部审批／驳回等按钮
      audit: false, //审核页面
      view: false, //查看页面
      loanRefund: false, //借还款页面
      rescheduleRefund: false, //退改签页面
      price: false, //价格审核页面
      confirmPay: false, //确认付款页面
      readOnly: false, //只可读
      payProcess: location.search.indexOf('pay_in_process') > -1,
      manageType: null,
      buttonRoleSwitch:
        this.checkPageRole('EXPENSEAUDIT', 2) &&
        this.checkFunctionProfiles(['er.disabled'], [[false, undefined]]) &&
        this.checkFunctionProfiles(['finance.audit.disabled'], [[false, undefined]]), //按钮操作权限
    };
  }

  componentDidMount() {
    console.log(this.props)
    this.setState(
      {
        formOID: this.props.match.params.formOID,
        approve: this.props.match.params.pageFrom === 'approved' || this.props.match.params.pageFrom === 'approving',
        /*approve: this.props.location.pathname.indexOf('approve-request-detail') > -1,
      audit: this.props.location.pathname.indexOf('loan-request-detail-audit') > -1,
      view: this.props.location.pathname.indexOf('finance-view') > -1,
      loanRefund: this.props.location.pathname.indexOf('loan-refund-detail') > -1,
      rescheduleRefund: this.props.location.pathname.indexOf('reschedule-refund-detail') > -1,
      price: this.props.location.pathname.indexOf('price-review-detail') > -1,
      confirmPay: this.props.location.pathname.indexOf('confirm-payment') > -1,*/
      },
      () => {
        const {
          approve,
          audit,
          view,
          loanRefund,
          rescheduleRefund,
          price,
          confirmPay,
        } = this.state;
        this.setState({
          readOnly:
            approve ||
            audit ||
            view ||
            loanRefund ||
            rescheduleRefund ||
            price ||
            confirmPay ||
            this.props.readOnly,
        });
        this.getFormType(this.state.formOID);
      }
    );
  }

  getFormType = formOID => {
    this.setState({ loading: true });
    requestService
      .getFormType(formOID)
      .then(res => {
        console.log(
          res
        )
        this.setState(
          {
            formType: res.data.formType,
            formInfo: res.data,
            manageType: res.data.customFormProperties.manageType,
          },
          () => {
            this.getInfo(this.state.formType);
          }
        );
      })
      .catch(e => {
        this.setState({ loading: false });
        let error = e.response.data;
        if (error.validationErrors && error.validationErrors.length) {
          message.error(error.validationErrors[0].message);
        } else {
          message.error(error.message);
        }
      });
  };

  getInfo = () => {
    //formType：2001（差旅申请）、2002（费用申请）、2003（订票申请）、2004（京东申请）、2005（借款申请）
    const { applicationOID, bookTaskOID } = this.props.match.params;
    let getType = this.state.rescheduleRefund ? 'getBookerTaskRequestDetail' : 'getRequestDetail';
    this.setState({ loading: true });
    requestService[getType](applicationOID, bookTaskOID)
      .then(res => {
        this.setState(
          {
            loading: false,
            info: this.state.rescheduleRefund ? res.data.applicationDTO : res.data,
            approvalHistory: this.state.rescheduleRefund
              ? res.data.approvalHistoryDTOs
              : res.data.approvalHistorys,
          },
          () => {
            //this.getRepaymentAmount(this.state.formType);
            if (this.state.approve) {
              let info = this.state.info;
              this.setState({
                showApproveBottom: this.showApproveButton(
                  info.approvalChain,
                  info.approvalChains,
                  this.props.user.userOID,
                  info.status
                ),
              });
            }
          }
        );
      })
      .catch(e => {
        this.setState({ loading: false });
        let error = e.response.data;
        if (error.validationErrors && error.validationErrors.length) {
          message.error(error.validationErrors[0].message);
        } else {
          message.error(error.message);
        }
      });
  };

  //判断是否显示底部审批／驳回等按钮
  showApproveButton = (approvalChain, approvalChains, currentUserId, status) => {
    let showBottom = false;
    if (status !== 1002) {
      return;
    }
    if (approvalChain) {
      if (approvalChain.approverOID == currentUserId) {
        showBottom = true;
      }
    }
    if (approvalChains) {
      approvalChains.forEach(approver => {
        if (approver.approverOID == currentUserId) {
          showBottom = true;
        } else {
          if (approver.proxyApproverOIDs) {
            approver.proxyApproverOIDs.forEach(proxyApprover => {
              if (proxyApprover == currentUserId) {
                showBottom = true;
              }
            });
          }
        }
      });
    }
    return showBottom;
  };

  //如果是借款单，获取待还款总金额
  getRepaymentAmount = formType => {
    if (formType === 2005) {
      baseService
        .getRepaymentAmount(this.state.info.applicantOID, this.state.info.companyOID, [1005, 1006])
        .then(resp => {
          if (resp.status === 200 && resp.data) {
            this.setState({ repaymentInfo: resp.data });
          }
        });
    }
  };

  //申请单信息／审批进度 切换
  handleTabsChange = tab => {
    this.setState({ tapValue: tab });
  };

  //申请单详情／还款进度 切换
  handleSubTabsChange = value => {
    this.setState({ subTabValue: value });
  };

  //借款申请单 - 新建还款
  toRepayment = () => {
    this.setState({
      subTabValue: 'repayment',
      showNewRepaymentSlide: true,
    });
  };

  //借款申请单 - 新建还款
  handleRepaymentSave = () => {
    this.setState({ showNewRepaymentSlide: false }, () => {
      this.getInfo();
    });
  };

  //格式化money
  renderMoney = value => {
    let numberString = Number(value || 0)
      .toFixed(2)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += numberString.indexOf('.') > -1 ? '' : '.00';
    return numberString;
  };

  render() {
    const { isPreVersion, latestApplicationOID, from } = this.props;
    let approving = this.props.match.params.pageFrom === 'approving';
    const {
      payProcess,
      loading,
      tapValue,
      subTabValue,
      formType,
      formInfo,
      showNewRepaymentSlide,
      info,
      approvalHistory,
      approve,
      audit,
      view,
      loanRefund,
      rescheduleRefund,
      price,
      readOnly,
      buttonRoleSwitch,
      repaymentInfo,
      confirmPay,
      showApproveBottom,
    } = this.state;
    let applicant = info.applicant || {}; //申请人信息
    let custFormValues = info.custFormValues || []; //自定义表单
    custFormValues.sort((a, b) => a.sequence > b.sequence || -1);
    let rescheduleRefundInfoShow = false; //是否显示退改签信息
    if (formType === 2003) {
      (info.travelOperationRecords || []).map(item => {
        //type：1002（改签）、1003（退票）
        (item.type === 1002 || item.type === 1003) && (rescheduleRefundInfoShow = true);
      });
    }
    let renderCloseDate = null; //（预计）停用日期
    if (info.status === 1003) {
      //已通过状态停用时间都是获取个人的停用时间
      if (info.applicationParticipant && info.applicationParticipant.closeDate) {
        if (info.applicationParticipant.closed === 1) {
          //当前单据对于当前操作人是已停用状态
          renderCloseDate = (
            <span className="detail-info">
              {this.$t('itinerary.form.component.expire.date') /*停用日期*/}：
              {moment(info.applicationParticipant.closeDate).format('YYYY-MM-DD')}
            </span>
          );
        } else {
          //在对于人员未关闭时是否显示停用日期以是否有个人的停用日期为准，停用日期一直获取的为个人的停用日期
          renderCloseDate = (
            <span className="detail-info">
              {this.$t('itinerary.form.component.stop.date') /*预计停用日期*/}：
              {moment(info.applicationParticipant.closeDate).format('YYYY-MM-DD')}
            </span>
          );
        }
      }
    } else {
      //不是已通过状态时，停用时间都是获取的是单据的停用时间，根据单子的属性
      if (info.closeEnabled && info.closeDate) {
        renderCloseDate = (
          <span className="detail-info">
            {this.$t('itinerary.form.component.stop.date') /*预计停用日期*/}：
            {moment(info.closeDate).format('YYYY-MM-DD')}
          </span>
        );
      }
    }
    let requestInfo = (
      <Spin spinning={loading}>
        <div className="top-info">
          {formType === 2004 && <JDErrorAlert info={info} />}
          {formType === 2003 && !readOnly && <BookerInfoAlert info={info} />}
          <Row className="row-container">
            <span className="top-info-name">{applicant.fullName}</span>
            <span className="detail-info">
              {(approve || audit || view) &&
                !!repaymentInfo.debtAmount &&
                repaymentInfo.debtAmount > 0 && (
                  <span style={{ color: '#0092da' }}>
                    {this.$t('common.total.pending.repayment' /*待还总额*/)}：{
                      repaymentInfo.baseCurrency
                    }&nbsp;{this.renderMoney(repaymentInfo.debtAmount || 0)}&nbsp;
                    {/* <Icon type="right"/> */}&nbsp;&nbsp;
                  </span>
                )}
              {this.$t('request.detail.employee.id' /*工号*/)}：{applicant.employeeID}
              <span className="ant-divider" />
              {this.$t('request.detail.department.name' /*部门*/)}：{applicant.departmentName ||
                '-'}
              <span className="ant-divider" />
              {this.$t('common.user.company') /*员工公司*/}：{applicant.companyName || '-'}
            </span>
          </Row>
          <Row className="row-container">
            <span className="detail-info detail-info-first">
              {info.formName}：{info.businessCode}
            </span>
            <span className="detail-info">
              {this.$t('request.detail.submit.date' /*提交日期*/)}：{moment(
                info.submittedDate
              ).format('YYYY-MM-DD')}
              {info.submittedBy &&
                applicant.userOID !== info.submittedBy &&
                `，${this.$t(
                  'request.detail.submit.by.name',
                  { name: info.submittedName } /*由 {name} 代提*/
                )}`}
            </span>
            {renderCloseDate}
            <span className="detail-info">
              {this.$t('request.detail.status' /*当前状态*/)}：
              {info.closed ||
              (info.applicationParticipant && info.applicationParticipant.closed === 1)
                ? this.$t('constants.documentStatus.yet.disable' /*已停用*/)
                : constants.getTextByValue(
                    String(info.status + '' + info.type),
                    'documentStatus'
                  ) ||
                  constants.getTextByValue(
                    String(info.status + '' + info.rejectType),
                    'documentStatus'
                  ) ||
                  constants.getTextByValue(String(info.status), 'documentStatus')}
            </span>
            <TravelPreviousVersion info={info} isPreVersion={isPreVersion} />
          </Row>
          {formType === 2005 && <LoanRelatedApplication info={info} />}
          <Row className="row-container">
            {formType !== 2005 && (
              <span className="amount">
                {this.$t('request.detail.total.amount' /*总金额*/)}：{info.currencyCode}{' '}
                {this.renderMoney(info.totalAmount || 0)}
              </span>
            )}
            {formType === 2001 && <TravelDate info={info} />}
            {formType === 2005 &&
              (!readOnly || loanRefund) && (
                <LoanRepaymentAmount
                  info={info}
                  handleToRepayment={this.toRepayment}
                  isOwner={this.props.match.params.pageFrom === 'my'}
                />
              )}
          </Row>
        </div>
      </Spin>
    );
    let detailContent = (
      <Spin spinning={loading}>
        <div className="tab-container">
          <h3 className="sub-header-title">
            {this.$t('request.detail.request.detail' /*申请单详情*/)}
          </h3>
          {customField.renderFields(custFormValues, info, applicant)}
        </div>
        {formType === 2004 && <JDOrderInfo info={info} />}
      </Spin>
    );


    //撤回是否显示
    let recallVisible = true;
    if (
      this.checkFunctionProfiles('ca.opt.withdraw.disabled', [true]) ||
      (this.checkFunctionProfiles('ca.opt.withdraw.disabled', [false]) &&
        this.checkFunctionProfiles('bill.approved.withdraw', [true]) &&
        info.withdrawFlag === 'N')
    ) {
      recallVisible = false;
    }

    //
    let backMargin;

    //撤回
    info.status === 1002 && info.rejectType === 1000 && recallVisible && (backMargin = -210);
    //打印
    info.printButtonDisplay && (backMargin = -40);
    console.log(backMargin)
    console.log(info.printButtonDisplay)
    return (
      <div className="base-request-detail" >
        <div className="tabs-info">
          <Tabs type="card" activeKey={tapValue} onChange={this.handleTabsChange}>
            <TabPane tab={this.$t('request.detail.request.info') /*申请单信息*/} key="requestInfo">
              {requestInfo}
            </TabPane>
            <TabPane tab={this.$t('request.detail.approve.history' /*审批历史*/)} key="approvals" style={{marginTop: 20}}>
              <ApproveHistory
                approvalChains={info.approvalChains}
                isShowReply={this.props.match.params.pageFrom === 'my' && info.status === 1003}
                businessCode={info.businessCode}
                approvalHistory={approvalHistory}
                applicantInfo={applicant}
              />
            </TabPane>
          </Tabs>
        </div>
        {tapValue === 'requestInfo' && (
          <Tabs className="detail-tabs" activeKey={subTabValue} onChange={this.handleSubTabsChange}>
            <TabPane tab={this.$t('request.detail.request.detail' /*申请单详情*/)} key="detail">
              {detailContent}
            </TabPane>
            {formType === 2005 &&
              (!readOnly || loanRefund) &&
              (info.status === 1005 || info.status === 1006 || info.status === 1007) && (
                <TabPane
                  tab={this.$t('request.detail.repayment.history' /*还款记录*/)}
                  key="repayment"
                >
                  <LoanRepayment
                    info={info}
                    isOwner={this.props.match.params.pageFrom === 'my'}
                    loanRefund={loanRefund}
                    showNewSlide={showNewRepaymentSlide}
                    applicationOID={this.props.match.params.applicationOID}
                    handleSave={this.handleRepaymentSave}
                    handleClose={() => {
                      this.setState({ showNewRepaymentSlide: false });
                    }}
                  />
                </TabPane>
              )}
            {formType === 2001 &&
              this.state.manageType && (
                <TabPane tab={this.$t('request.detail.travel.info' /*行程信息*/)} key="travelInfo">
                  <TravelInformation
                    applicationOID={this.props.match.params.applicationOID}
                    info={info}
                    customFormPropertyMap={formInfo.customFormPropertyMap}
                    controlFields={JSON.parse(formInfo.customFormProperties.controlFields || '{}')}
                    isPreVersion={isPreVersion === 'true'}
                    latestApplicationOID={latestApplicationOID}
                  />
                </TabPane>
              )}
            {formType === 2001 &&
              !this.state.manageType && (
                <TabPane tab={this.$t('request.detail.travel.info' /*行程信息*/)} key="travelInfo">
                  <TravelInformationElement
                    applicationOID={this.props.match.params.applicationOID}
                    info={info}
                    customFormPropertyMap={formInfo.customFormPropertyMap}
                    isPreVersion={isPreVersion === 'true'}
                    latestApplicationOID={latestApplicationOID}
                  />
                </TabPane>
              )}
            {formType === 2003 &&
              rescheduleRefundInfoShow && (
                <TabPane
                  tab={this.$t('request.detail.reschedule.refund' /*退改签信息*/)}
                  key="rescheduleRefundInfo"
                >
                  <RescheduleRefundInfo info={info} />
                </TabPane>
              )}
            {formType === 2003 &&
              (info.travelOrders || []).length > 0 && (
                <TabPane
                  tab={this.$t('request.detail.ticket.info' /*机票信息*/)}
                  key="bookerTicketInfo"
                >
                  <BookerTicketInfo
                    info={info}
                    afterBoardConfirm={() => {
                      this.getInfo(formType);
                    }}
                  />
                </TabPane>
              )}
          </Tabs>
        )}
        {audit &&
          (buttonRoleSwitch ? (
            <AuditApplicationDetail
              status={info.status}
              entityOID={this.props.match.params.applicationOID}
              entityType={1001}
            />
          ) : (
            <Affix offsetBottom={0} className="bottom-bar">
              <Col span={2} style={{
                marginLeft: backMargin
              }}>
              <GoBackBtn backType={this.props.match.params.pageFrom} />
              </Col>
            </Affix>
          ))}
        {(!readOnly ||
          approve ||
          rescheduleRefund ||
          price ||
          loanRefund ||
          payProcess ||
          confirmPay ||
          view) && (
          <Affix
            offsetBottom={0}
            style={{
              position: 'fixed',
              bottom: 0,
              marginLeft: '-25px',
              width: '100%',
              height: '50px',
              boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
              background: '#fff',
              lineHeight: '50px',
              zIndex: 1,
            }}
          >
            <Row gutter={24}>
              {info.status === 1002 &&
              info.rejectType === 1000 &&
              recallVisible &&<Col span={2} style={{marginLeft: 20}}> <RecallBtn info={info} /></Col>}
              {(!readOnly || view) && <Col span={2} style={{marginLeft: 20}}><PrintBtn info={info} printFlag={view} /></Col>}
            {!readOnly && (
              <TravelUpdateBtn
                backType={this.props.match.params.pageFrom}
                formType={Number(formType)}
                info={info}
                updateEnable={
                  formInfo.customFormPropertyMap &&
                  formInfo.customFormPropertyMap['application.change.enable']
                }
              />
            )}
            {!readOnly && <ExpireBtn formType={Number(formType)} info={info} />}
            {!readOnly && <RestartBtn formType={Number(formType)} info={info} />}
            {!readOnly && <BookerRefundBtn formType={Number(formType)} info={info} />}
            {!readOnly && <BookerEndorseBtn formType={Number(formType)} info={info} />}
            {!readOnly &&
            !payProcess &&
            (from !== 'expense' && from !== 'request') && ( //从报销单／申请单进来的关联申请单，因为是新开tab，不需要返回按钮
              <Col span={2} style={{
                marginLeft: backMargin
              }}>
                <GoBackBtn backType={this.props.match.params.pageFrom} />
              </Col>
              )}

            {confirmPay && (
              <SurePayBtn
                applicantInfo={info}
                backType={this.props.match.params.backType}
                onlyBack={!payProcess}
              />
            )}
            {loanRefund && <LoanAndRefundBack tab={this.props.location.query.tab} info={info} />}
            {approve && (
              <ApproveRequestBtn
                formType={Number(formType)}
                info={info}
                approving={!!approving && showApproveBottom}
                formInfo={formInfo}
              />
            )}
            {rescheduleRefund && (
              <RescheduleRefundBtn
                approving={!!approving}
                bookTaskOID={this.props.match.params.bookTaskOID}
              />
            )}
            {price && (
              <PriceReviewBtn
                approving={!!approving}
                applicationOID={this.props.match.params.applicationOID}
              />
            )}
            </Row>
          </Affix>
        )}
        {readOnly &&
          !approve &&
          !rescheduleRefund &&
          !price &&
          !loanRefund &&
          !payProcess &&
          !confirmPay &&
          !view &&
          !audit && (
            <Affix offsetBottom={0} className="bottom-bar">
              <Col span={2} style={{
                marginLeft: backMargin
              }}>
              <GoBackBtn backType={this.props.match.params.pageFrom}/>
              </Col>
            </Affix>
          )}
      </div>
    );
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

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
  };
}

const wrappedBaseRequestDetail = Form.create()(BaseRequestDetail);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedBaseRequestDetail);
