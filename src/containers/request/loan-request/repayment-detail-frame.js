import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Alert,
  Button,
  Spin,
  Row,
  Col,
  Modal,
  InputNumber,
  message,
  Input,
  Timeline,
  Icon,
} from 'antd';
const TextArea = Input.TextArea;

import moment from 'moment';
import ImageUpload from 'widget/image-upload';
import loanAndRefundService from 'containers/financial-management/loan-and-refund/loan-and-refund.service';
import 'styles/request/loan-request/repayment-detail-frame.scss';

class RepaymentDetailFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      oid: null,
      info: {},
      confirmAmountModalVisible: false, //确认还款金额弹框
      notReceivedModalVisible: false, //未收到弹框
      modalLoading: false, //弹框确认按钮loading
      repaymentAmount: 0, //财务确认还款金额
      notReceivedReason: '未收到款项', //未收到内容
      buttonRoleSwitch:
        this.checkPageRole('REPAYMENTSLIPMANAGEMENT', 2) &&
        this.checkFunctionProfiles(['er.disabled'], [[false, undefined]]) &&
        this.checkFunctionProfiles(['finance.audit.disabled'], [[false, undefined]]), //按钮操作权限
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.params.hasInit && nextProps.params.oid) {
      nextProps.params.hasInit = true;
      this.setState(
        {
          oid: nextProps.params.oid,
          info: {},
        },
        () => {
          this.getInfo();
        }
      );
    }
  }

  getInfo = () => {
    this.setState({ loading: true });
    loanAndRefundService.getRefundInfo(this.state.oid).then(res => {
      this.setState({
        loading: false,
        info: res.data,
        repaymentAmount: Number(res.data.repaymentValue),
      });
    });
  };

  //获取还款历史状态
  getRefundStatus = operation => {
    let history = {};
    if (operation === 5000) {
      history.text = this.$t('request.detail.loan.transfer.repayment.submit'); //转账还款提交
      history.icon = 'up-circle-o';
      history.color = '#4CA8BC';
    }
    if (operation === 5001) {
      history.text = this.$t('request.detail.loan.cash.repayment.submit'); //现金还款提交
      history.icon = 'up-circle-o';
      history.color = '#4CA8BC';
    }
    if (operation === 5002) {
      history.text = this.$t('request.detail.loan.finance.gathering.pass'); //财务收款通过
      history.icon = 'check-circle-o';
      history.color = '#5EBD93';
    }
    if (operation === 5003) {
      history.text = this.$t('request.detail.loan.finance.gathering.reject'); //财务收款驳回
      history.icon = 'close-circle-o';
      history.color = '#E57670';
    }
    if (operation === 1002) {
      history.text = this.$t('request.detail.loan.finance.withdraw.payment'); //财务撤回还款
      history.icon = 'close-circle-o';
      history.color = '#E57670';
    }
    return history;
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

  handleCancel = () => {
    this.props.close();
  };

  renderInfo = (title, info) => {
    return (
      <div className="render-info">
        <div className="title">{title}</div>
        <div className="info">{info}</div>
      </div>
    );
  };

  //财务确认是否收到款
  handleConfirm = value => {
    const repaymentAmount = this.state.repaymentAmount;
    if (value === 'PASS' && !repaymentAmount) {
      message.error(this.$t('request.detail.loan.please.input.payment.amount' /*请输入还款金额*/));
    } else {
      let params = {
        repaymentOid: this.state.oid,
        reason: value === 'PASS' ? null : this.state.notReceivedReason,
        currencyCode: this.state.info.curreny,
        repaymentAmount,
        result: value,
      };
      this.setState({ modalLoading: true });
      loanAndRefundService
        .confirmReceipt(params)
        .then(() => {
          this.setState({
            modalLoading: false,
            confirmAmountModalVisible: false,
            notReceivedModalVisible: false,
          });
          this.props.close(true);
          message.success(this.$t('common.operate.success'));
        })
        .catch(e => {
          this.setState({ modalLoading: false });
          message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
        });
    }
  };

  //财务确认撤回弹框
  showConfirm = () => {
    Modal.confirm({
      title: this.$t('request.detail.loan.confirm.withdraw.payment' /*确认撤回还款*/),
      content: this.$t(
        'request.detail.loan.notification.staff.after.delete.record' /*将删除该条还款记录，并通知员工*/
      ),
      okText: this.$t('request.detail.loan.delete.and.notification.staff' /*删除并通知员工*/),
      cancelText: this.$t('common.back'),
      iconType: 'exclamation-circle',
      onOk: this.handleCallBack,
    });
  };

  //撤回
  handleCallBack = () => {
    let params = {
      reason: this.$t('request.detail.loan.finance.withdraw.payment' /*财务撤回还款*/),
      repaymentOid: this.state.oid,
    };
    loanAndRefundService.callBackRefund(params).then(() => {
      message.success(this.$t('common.operate.success'));
      this.handleCancel();
      this.props.close(true);
    });
  };

  //财务确认收款金额
  handleConfirmAmount = () => {
    this.setState({ confirmAmountModalVisible: true }, () => {
      this.setState({ repaymentAmount: Number(this.state.info.repaymentValue) });
    });
  };

  render() {
    const {
      loading,
      info,
      confirmAmountModalVisible,
      modalLoading,
      repaymentAmount,
      notReceivedModalVisible,
      buttonRoleSwitch,
    } = this.state;
    let actRepayAmount = info.actRepayAmount || info.repaymentValue;
    let alertContent = (
      <div className="alert-content-warn">
        {info.status === '1001' && (
          <div>{this.$t('request.detail.loan.wait.finance.confirm') /*等待财务确认*/}…</div>
        )}
        {info.status === '1002' && (
          <div>
            {moment(info.updateDate || info.createDate).format('YYYY-MM-DD HH:mm')}{' '}
            {info.financeName}-{info.financeID}{' '}
            {info.isFinance
              ? this.$t('request.detail.loan.create.payment.record' /*创建还款记录*/)
              : this.$t('request.detail.loan.confirm.receipt' /*确认收款*/)}
          </div>
        )}
        {info.status === '1003' && (
          <div>
            {moment(info.writeoffDetail[0].createdDate).format('YYYY-MM-DD HH:mm')}{' '}
            {info.writeoffDetail[0].title}
          </div>
        )}
        <div>
          {this.$t('request.detail.loan.date' /*日期*/)}：{moment(info.createDate).format(
            'YYYY-MM-DD'
          )}
          <span className="ant-divider" />
          {this.$t('request.detail.loan.payment.code' /*还款单号*/)}：{info.businessCode}
          <span className="ant-divider" />
          {this.$t('request.detail.loan.payment.method' /*还款方式*/)}：{info.type === '0'
            ? this.$t('request.detail.loan.payment.cash' /*现金还款*/)
            : info.type === '1'
              ? this.$t('request.detail.loan.payment.transfer' /*转账还款*/)
              : this.$t('request.detail.loan.payment.expense' /*报销单还款*/)}
          <span className="ant-divider" />
          {this.$t('request.detail.status' /*当前状态*/)}：{info.status === '1001'
            ? this.$t('request.detail.loan.in.the.payment' /*还款中*/)
            : info.status === '1002'
              ? this.$t('request.detail.loan.has.been.payment' /*已还款*/)
              : this.$t('request.detail.loan.rejected' /*被驳回*/)}
        </div>
      </div>
    );
    return (
      <div className="repayment-detail-frame">
        {info.status && (
          <Alert
            message={
              info.status === '1001'
                ? this.$t('request.detail.loan.in.the.payment' /*还款中*/)
                : info.status === '1002'
                  ? `${this.$t('request.detail.loan.payment.amount' /*还款金额*/)}：${
                      info.curreny
                    } ${this.renderMoney(actRepayAmount)}`
                  : this.$t('request.detail.loan.rejected' /*被驳回*/)
            }
            description={alertContent}
            type={info.status === '1001' ? 'warning' : info.status === '1002' ? 'success' : 'error'}
            className="alert-info"
            showIcon
          />
        )}
        <Spin spinning={loading}>
          {info.type !== '0' && (
            <div className="refund-info">
              <Row>
                <Col span={12}>
                  <h4>{this.$t('request.detail.loan.payer.info') /*还款方信息*/}</h4>
                </Col>
                <Col span={11} offset={1}>
                  <h4>{this.$t('request.detail.loan.receiver.info') /*收款方信息*/}</h4>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  {this.renderInfo(
                    this.$t('request.detail.loan.account.name' /*开户名*/),
                    info.payAccountName
                  )}
                </Col>
                <Col span={11} offset={1}>
                  {this.renderInfo(
                    this.$t('request.detail.loan.account.name' /*开户名*/),
                    info.acceptAccountName
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  {this.renderInfo(
                    this.$t('request.detail.loan.account.number' /*开户账号*/),
                    info.payAccount
                  )}
                </Col>
                <Col span={11} offset={1}>
                  {this.renderInfo(
                    this.$t('request.detail.loan.account.number' /*开户账号*/),
                    info.acceptAccount
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  {this.renderInfo(
                    this.$t('request.detail.loan.account.bank' /*开户银行*/),
                    info.payBankName
                  )}
                </Col>
                <Col span={11} offset={1}>
                  {this.renderInfo(
                    this.$t('request.detail.loan.account.bank' /*开户银行*/),
                    info.acceptBankName
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  {this.renderInfo(
                    this.$t('request.detail.loan.payment.amount' /*还款金额*/),
                    (info.curreny || '') + ' ' + this.renderMoney(info.repaymentValue)
                  )}
                </Col>
              </Row>
              {info.status === '1002' && (
                <Row className="confirm-amount">
                  <Col span={12}>
                    {this.renderInfo(
                      this.$t('request.detail.loan.confirm.payment.amount' /*确认还款金额*/),
                      (info.curreny || '') + ' ' + this.renderMoney(actRepayAmount)
                    )}
                  </Col>
                </Row>
              )}
              <Row>
                {info.repayAttchment && (
                  <ImageUpload
                    defaultFileList={info.repayAttchment}
                    attachmentType="INVOICE_IMAGES"
                    disabled
                  />
                )}
              </Row>
            </div>
          )}
          {info.isFinance && (
            <div className="remark-info">
              <h4>{this.$t('common.remark')}：</h4>
              <div>{info.remark || '-'}</div>
            </div>
          )}
          <div className="approvals refund-history">
            <h4>{this.$t('request.detail.loan.payment.history') /*还款历史*/}</h4>
            <Timeline>
              {info.approvalHistoryDTOs &&
                info.approvalHistoryDTOs.map(item => {
                  return (
                    <Timeline.Item
                      key={item.id}
                      dot={
                        <Icon
                          type={this.getRefundStatus(item.operation).icon}
                          style={{ color: this.getRefundStatus(item.operation).color }}
                        />
                      }
                    >
                      <Row>
                        <Col span={7}>{moment(item.createdDate).format('YYYY-MM-DD HH:mm')}</Col>
                        <Col span={7} className="operation-type">
                          {this.getRefundStatus(item.operation).text}
                        </Col>
                        <Col span={10} className="operation-name">
                          {item.operator.fullName + ' ' + item.operator.employeeID}
                        </Col>
                      </Row>
                      <Row style={{ color: item.operation === 5003 ? '#E57670' : '#666' }}>
                        {item.operationDetail}
                      </Row>
                    </Timeline.Item>
                  );
                })}
            </Timeline>
          </div>
        </Spin>

        {this.props.params.loanRefund && info.status === '1001' && buttonRoleSwitch ? (
          <div className="slide-footer">
            <Button type="primary" onClick={this.handleConfirmAmount}>
              {this.$t('request.detail.loan.confirm.receipt') /*确认收款*/}
            </Button>
            <Button onClick={() => this.setState({ notReceivedModalVisible: true })}>
              {this.$t('request.detail.loan.no.receipt') /*未收到*/}
            </Button>
          </div>
        ) : info.isFinance && info.status === '1002' && buttonRoleSwitch ? (
          <div className="slide-footer">
            <Button onClick={this.showConfirm}>
              {this.$t('request.detail.loan.cancel.payment') /*撤销还款*/}
            </Button>
            <Button onClick={this.handleCancel}>
              {this.$t('request.detail.loan.close') /*关闭*/}
            </Button>
          </div>
        ) : (
          <div className="slide-footer">
            <Button onClick={this.handleCancel}>
              {this.$t('request.detail.loan.close') /*关闭*/}
            </Button>
          </div>
        )}

        <Modal
          visible={confirmAmountModalVisible}
          confirmLoading={modalLoading}
          onOk={() => this.handleConfirm('PASS')}
          onCancel={() => this.setState({ confirmAmountModalVisible: false })}
          okText={this.$t('request.detail.loan.confirm.and.notification.staff') /*确认并通知员工*/}
          title={this.$t('request.detail.loan.confirm.payment.amount' /*确认还款金额*/)}
        >
          <div>
            {!this.props.profile['finance.modify.repayment.money.disabled'] && (
              <div>
                {this.$t(
                  'request.detail.loan.update.amount.notice'
                ) /*如实际还款和申请不符，可在下方修改金额*/}
              </div>
            )}
            {this.$t('request.detail.loan.amount1') /*金额*/}
            {info.curreny ? `（${info.curreny}）` : ''}：
            <InputNumber
              min={0}
              max={Number(Number(info.repaymentValue).toFixed(2))}
              value={repaymentAmount}
              disabled={this.props.profile['finance.modify.repayment.money.disabled']}
              onChange={value => this.setState({ repaymentAmount: value })}
              style={{ width: '60%', marginTop: 20 }}
            />
          </div>
        </Modal>

        <Modal
          visible={notReceivedModalVisible}
          confirmLoading={modalLoading}
          onOk={() => this.handleConfirm('REJECT')}
          onCancel={() => this.setState({ notReceivedModalVisible: false })}
          okText={this.$t('request.detail.loan.confirm.and.notification.staff') /*确认并通知员工*/}
          title={this.$t('request.detail.loan.input.content') /*输入内容*/}
        >
          <div>
            <TextArea
              rows={3}
              placeholder={
                this.$t('request.detail.loan.default.content') /*如不输入，默认理由：未收到款项*/
              }
              style={{ resize: 'none' }}
              onChange={e => this.setState({ notReceivedReason: e.target.value })}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
  };
}

const wrappedRepaymentDetailFrame = Form.create()(RepaymentDetailFrame);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedRepaymentDetailFrame);
