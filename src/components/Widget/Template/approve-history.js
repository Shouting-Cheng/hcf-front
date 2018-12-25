import React from 'react';

import { getApprovelHistory } from 'utils/extend';
import { Form, Icon, Timeline, Row, Col, Tag, Modal, Button, Input } from 'antd';
const { TextArea } = Input;
const FormItem = Form.Item;
import expenseReportService from 'containers/expense-report/expense-report.service';

import moment from 'moment';
import 'styles/components/template/approve-history.scss';
import { connect } from 'dva';
import { message } from 'antd/lib/index';
import PropTypes from 'prop-types';

class ApproveHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputVisible: false,
      loading: false,
      forReplyInfo: {},
    };
  }
  //财务答复
  handleInputConfirm = () => {
    let { forReplyInfo } = this.state;
    let { user, approvalHistory, businessCode } = this.props;
    let values = this.props.form.getFieldsValue();
    if (values.reply) {
      if (values.reply.trim() && values.reply.trim().length <= 80) {
        let params = {
          billOid: forReplyInfo.entityOid,
          businessCode: businessCode,
          toUserOid: forReplyInfo.operatorOid,
          fromUserOid: user.userOid,
          type: forReplyInfo.entityType,
          remark: values.reply.trim(),
        };
        this.setState({ loading: true });
        expenseReportService
          .replyComment(params)
          .then(res => {
            this.setState({ loading: false, inputVisible: false });
            let replyInfo = {
              createdDate: new Date(),
              operation: 8001,
              operationDetail: values.reply.trim(),
              operator: {
                fullName: user.fullName,
                employeeID: user.employeeID,
              },
            };
            approvalHistory.unshift(replyInfo);
            this.setState({ loading: false, inputVisible: false });
            message.success(this.$t('common.operate.success') /*操作成功*/);
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(this.$t('common.operate.filed'));
          });
      } else {
        message.error(this.$t('common.max.characters.length', { max: 80 }));
      }
    } else {
      message.error(this.$t('common.please.input'));
    }
  };

  render() {
    const { approvalChains, approvalHistory, applicantInfo, isShowReply } = this.props;
    const { loading, inputVisible } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="approve-history">
        <Timeline>
          {approvalChains &&
            approvalChains.length && (
              <Timeline.Item>
                <Row>
                  <Col span={3}>
                    {moment(approvalChains[0].lastModifiedDate).format('YYYY-MM-DD HH:mm')}
                  </Col>
                  <Col span={3} className="operation-type">
                    {this.$t('request.detail.await.approval.by' /*等待审批*/)}
                  </Col>
                  <Col span={17} className="operation-name">
                    {approvalChains.map((chain, index) => {
                      return chain.proxyApprovers && chain.proxyApprovers.length ? (
                        <div key={index} style={{ float: 'left' }}>
                          {chain.proxyApprovers.map((proxy, i) => {
                            return (
                              <span key={i}>
                                {proxy.fullName} {proxy.employeeID}
                                {i < chain.proxyApprovers.length - 1 && (
                                  <span style={{ color: '#000' }}> & </span>
                                )}
                              </span>
                            );
                          })}
                          &nbsp;({this.$t('request.detail.on.behalf.approved', {
                            name: chain.approverName,
                            id: chain.approverEmployeeID,
                          })})
                          {index < approvalChains.length - 1 && (
                            <span style={{ color: '#000' }}>&nbsp;|&nbsp;</span>
                          )}
                        </div>
                      ) : (
                        <div key={index} style={{ float: 'left' }}>
                          {chain.approverName} {chain.approverEmployeeID}
                          {index < approvalChains.length - 1 && (
                            <span style={{ color: '#000' }}>&nbsp;|&nbsp;</span>
                          )}
                        </div>
                      );
                    })}
                  </Col>
                </Row>
              </Timeline.Item>
            )}
          {approvalHistory &&
            approvalHistory.map(item => {
              return (
                <Timeline.Item
                  key={item.id}
                  dot={
                    item.operation === 5009 ? (
                      <div className="timeline-icon-my">
                        <div>{this.$t('request.detail.me' /*我的*/)}</div>
                      </div>
                    ) : (
                      <Icon
                        type={getApprovelHistory(item.operation).icon}
                        style={{ color: getApprovelHistory(item.operation).color }}
                      />
                    )
                  }
                >
                  <Row>
                    <Col span={3}>{moment(item.createdDate).format('YYYY-MM-DD HH:mm')}</Col>
                    {/*审批通过有三种情况：审批通过、自审批通过、加签 审批通过*/}
                    {item.operation === 2001 && (
                      <Col span={3} className="operation-type">
                        {item.operationType === 1001 &&
                          this.$t('request.detail.self.approve') /*自审批通过*/}
                        {item.operationType !== 1001 && (
                          <span>
                            {(item.countersignType === 1 || item.countersignType === 2) &&
                              ` ${this.$t('constants.approvelHistory.sign') /*加签*/} `}
                            {this.$t(getApprovelHistory(item.operation).text)}
                          </span>
                        )}
                      </Col>
                    )}
                    {item.operation !== 2001 && (
                      <Col span={3} className="operation-type">
                        {this.$t(getApprovelHistory(item.operation).text)}
                      </Col>
                    )}
                    <Col span={17} className="operation-name">
                      {/*流程人员信息*/}
                      {item.role ? `${item.role} ${<span className="ant-divider" />} ` : ''}{' '}
                      {item.operator ? `${item.operator.fullName} ${item.operator.employeeID}` : ''}
                      {/*代理审批*/}
                      {item.chainApprover &&
                        item.chainApprover.fullName &&
                        (item.operation === 2001 || item.operation === 2002) &&
                        item.operator.employeeID !== item.chainApprover.employeeID &&
                        ` (${this.$t(
                          'request.detail.on.behalf.approved',
                          {
                            name: item.chainApprover.fullName,
                            id: item.chainApprover.employeeID,
                          } /*代理 name id 审批*/
                        )})`}
                      {/*代理制单*/}
                      {item.operation === 1001 &&
                        applicantInfo.userOid &&
                        applicantInfo.userOid !== item.operator.userOid &&
                        ` (${this.$t('request.detail.agent') /*代理*/} ${applicantInfo.fullName} ${
                          applicantInfo.employeeID
                        })`}
                    </Col>
                  </Row>
                  <Row
                    style={{
                      color:
                        item.operation === 2003 ||
                        item.operation === 2002 ||
                        item.operation === 3002
                          ? '#E57670'
                          : '#666',
                      wordWrap: 'break-word',
                    }}
                  >
                    <Col span={3}>
                      {!!item.apportionmentFlag && (
                        <Tag color="blue">
                          {this.$t('constants.approvelHistory.sharingApproval') /*分摊审批*/}
                        </Tag>
                      )}
                    </Col>
                    <Col span={21}>
                      <Row>
                        {item.operation !== 5009
                          ? item.operationDetail
                          : item.countersignType === 2
                            ? item.operationDetail.split(', ').map((detail, index) => {
                                if (index < item.operationDetail.split(', ').length - 1) {
                                  return (
                                    <span key={index}>
                                      {detail} <Icon type="arrow-right" />{' '}
                                    </span>
                                  );
                                } else {
                                  return detail;
                                }
                              })
                            : item.operationDetail}
                        {/*财务通知回复*/}
                        {item.operation === 3006 && isShowReply ? (
                          <span>
                            <br />
                            <a
                              onClick={() => {
                                this.setState({ inputVisible: true, forReplyInfo: item });
                              }}
                            >
                              {this.$t('finance.audit.reply')}
                              {/*回复*/}
                            </a>
                          </span>
                        ) : (
                          ''
                        )}
                      </Row>
                      <Row>
                        {(item.operation === 7001 ||
                          item.operation === 7002 ||
                          item.operation === 7003) &&
                          item.remark}
                      </Row>
                    </Col>
                  </Row>
                </Timeline.Item>
              );
            })}
        </Timeline>
        {/*员工答复弹框MODAL*/}
        <Modal
          title={this.$t('finance.audit.reply') /*回复*/}
          visible={inputVisible}
          onCancel={() => {
            this.setState({ inputVisible: false });
          }}
          maskClosable={false}
          destroyOnClose={true}
          footer={[
            <Button
              key="back"
              onClick={() => {
                this.setState({ inputVisible: false });
              }}
            >
              {this.$t('common.cancel') /*取消*/}
            </Button>,
            <Button
              key="submit"
              htmlType="submit"
              type="primary"
              loading={loading}
              onClick={this.handleInputConfirm}
            >
              {this.$t('common.ok') /*确定*/}
            </Button>,
          ]}
        >
          <Form>
            <FormItem>
              {getFieldDecorator('reply', {
                initialValue: '',
              })(
                <TextArea
                  placeholder={this.$t('common.max.characters.length', { max: 80 })}
                  rows={6}
                  style={{ resize: 'none' }}
                />
              )}
              <div style={{ textAlign: 'right' }}>
                {this.props.form.getFieldValue('reply').trim().length} / 80
              </div>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

ApproveHistory.propTypes = {
  approvalChains: PropTypes.array, //审批链
  approvalHistory: PropTypes.array, //审批历史
  applicantInfo: PropTypes.object, //申请人信息
  businessCode: PropTypes.string, //单号,用于员工答复
  isShowReply: PropTypes.bool, //是否显示回复，单据查看的视角不同
};

ApproveHistory.defaultProps = {
  approvalChains: [],
  approvalHistory: [],
  applicantInfo: {},
  isShowReply: false,
};

function mapStateToProps(state) {
  return {
    user: state.login.user,
  };
}
const WrappedApproveHistory = Form.create()(ApproveHistory);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedApproveHistory);
