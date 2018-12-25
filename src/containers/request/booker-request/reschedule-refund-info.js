import PropTypes from 'prop-types';
/**
 * 订票申请单 退改签信息
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Card, Row, Col } from 'antd';

import moment from 'moment';
import 'styles/request/booker-request/reschedule-refund-info.scss';

class RescheduleRefundInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rescheduleList: [],
      refundList: [],
    };
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    let rescheduleList = [];
    let refundList = [];
    // type：1002（改签）、1003（退票）
    this.props.info.travelOperationRecords.map(item => {
      if (item.type === 1002) {
        rescheduleList.push(item);
      } else if (item.type === 1003) {
        refundList.push(item);
      }
    });
    this.setState({ rescheduleList, refundList });
  };

  renderInfo = (label, value) => {
    let col_span_title = this.props.language.code === 'zh_cn' ? 6 : 9;
    let col_span_content = this.props.language.code === 'zh_cn' ? 18 : 15;
    return (
      <Row>
        <Col span={col_span_title}>{label}：</Col>
        <Col span={col_span_content}>{value}</Col>
      </Row>
    );
  };

  render() {
    const { rescheduleList, refundList } = this.state;
    const locale = this.props.language.locale;
    return (
      <div className="reschedule-refund-info tab-container">
        <h3 className="sub-header-title">
          {this.$t('request.detail.reschedule.refund' /*退改签信息*/)}
        </h3>
        {rescheduleList.map((item, index) => {
          return (
            <Card
              key={index}
              className={this.props.language.locale === 'en' ? 'card-style-en' : ''}
            >
              <Row>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.type' /*类型*/),
                    this.$t(
                      'request.detail.booker.reschedule.number',
                      { number: item.operationOrderNumber } /*改签 {number} 张*/
                    )
                  )}
                </Col>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.request.date' /*申请时间*/),
                    moment(item.lastModifiedDate).format('YYYY-MM-DD HH:mm')
                  )}
                </Col>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.applicant' /*申请人*/),
                    item.name
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.is.additional.record' /*是否补录*/),
                    item.isAdditionalRecord
                      ? this.$t('request.detail.booker.yes' /*是*/)
                      : this.$t('request.detail.booker.no' /*否*/)
                  )}
                </Col>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.is.need.approval' /*是否需审批*/),
                    item.skipWorkflow
                      ? this.$t('request.detail.booker.no' /*否*/)
                      : this.$t('request.detail.booker.yes' /*是*/)
                  )}
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={locale === 'zh' ? 6 : 9} className="line-height-18">
                      {this.$t('request.detail.booker.endorse.reason' /*改签原因*/)}：
                    </Col>
                    <Col span={locale === 'zh' ? 18 : 15}>
                      {item.isPersonalReason
                        ? this.$t('request.detail.booker.person' /*个人*/)
                        : this.$t('request.detail.booker.project' /*项目*/)}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={locale === 'zh' ? 2 : 3} className="line-height-18">
                  {this.$t('request.detail.booker.endorse.remark') /*改签备注*/}：
                </Col>
                <Col span={locale === 'zh' ? 22 : 21}>{item.endorseRemark || '-'}</Col>
              </Row>
              {!item.skipWorkflow && (
                <Row>
                  {item.approvalStatus === 1001 ? (
                    <span style={{ color: 'red' }}>{item.rejectReason}</span>
                  ) : item.approvalStatus === 1002 ? (
                    this.$t('request.detail.booker.processing' /*审批中*/)
                  ) : (
                    this.$t('request.detail.booker.passed' /*已通过*/)
                  )}
                </Row>
              )}
            </Card>
          );
        })}
        {refundList.map(item => {
          return (
            <Card key={item.travelOperationRecordOid}>
              <Row>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.type' /*类型*/),
                    this.$t(
                      'request.detail.booker.refund.number',
                      { number: item.operationOrderNumber } /*退票 {number} 张*/
                    )
                  )}
                </Col>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.request.date' /*申请时间*/),
                    moment(item.lastModifiedDate).format('YYYY-MM-DD HH:mm')
                  )}
                </Col>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.applicant' /*申请人*/),
                    item.name
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.is.additional.record' /*是否补录*/),
                    item.isAdditionalRecord
                      ? this.$t('request.detail.booker.yes' /*是*/)
                      : this.$t('request.detail.booker.no' /*否*/)
                  )}
                </Col>
                <Col span={8}>
                  {this.renderInfo(
                    this.$t('request.detail.booker.is.need.approval' /*是否需审批*/),
                    item.skipWorkflow
                      ? this.$t('request.detail.booker.no' /*否*/)
                      : this.$t('request.detail.booker.yes' /*是*/)
                  )}
                </Col>
                <Col span={8}>
                  <Row>
                    <Col span={locale === 'zh' ? 6 : 9}>
                      {this.$t('request.detail.booker.refund.reason' /*退票原因*/)}：
                    </Col>
                    <Col span={locale === 'zh' ? 18 : 15}>
                      {item.isPersonalReason
                        ? this.$t('request.detail.booker.person' /*个人*/)
                        : this.$t('request.detail.booker.project' /*项目*/)}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={locale === 'zh' ? 2 : 3}>
                  {this.$t('request.detail.booker.refund.remark') /*退票备注*/}：
                </Col>
                <Col span={locale === 'zh' ? 22 : 21}>{item.refundRemark || '-'}</Col>
              </Row>
              {!item.skipWorkflow && (
                <Row>
                  {item.approvalStatus === 1001 ? (
                    <span style={{ color: 'red' }}>{item.rejectReason}</span>
                  ) : item.approvalStatus === 1002 ? (
                    this.$t('request.detail.booker.processing' /*审批中*/)
                  ) : (
                    this.$t('request.detail.booker.passed' /*已通过*/)
                  )}
                </Row>
              )}
            </Card>
          );
        })}
      </div>
    );
  }
}

RescheduleRefundInfo.propTypes = {
  info: PropTypes.object,
};

RescheduleRefundInfo.defaultProps = {
  info: {},
};

function mapStateToProps(state) {
  return {
    language: state.main.language,
  };
}

const wrappedRescheduleRefundInfo = Form.create()(RescheduleRefundInfo);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedRescheduleRefundInfo);
