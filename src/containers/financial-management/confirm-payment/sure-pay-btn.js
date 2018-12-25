/**
 * 操作：确认付款
 * 适用：
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Icon } from 'antd';
import { notification } from 'antd/lib/index';
import confirmPaymentService from './confirm-payment.service';

class SurePayBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      applicationList: menuRoute.getRouteItem('request', 'key'), //申请单列表页
    };
  }
  //点击确认付款
  handleConfirmPay = () => {
    this.setState({ loading: true }, () => {
      let { applicantInfo } = this.props;
      let params = {
        comment: null,
        endDate: null,
        entityOids: [applicantInfo.applicationOid],
        entityType: 1002,
        excludedEntityOids: [],
        formOids: [],
        selectMode: 'default',
        startDate: null,
        status: 'pay_in_process',
        businessCode: applicantInfo.businessCode,
        applicantOid: applicantInfo.applicantOid,
      };
      confirmPaymentService
        .confirmPayment('processing', params)
        .then(() => {
          this.setState({ submitting: false });
          notification.open({
            message: this.$t('confirm.payment.confirmSuccess' /*确认付款成功！*/),
            // description: `您有1笔单据确认付款成功:)`,
            description: this.$t(
              'confirm.payment.confirmPaySuccess',
              { total: 1 } /*`您有1笔单据确认付款成功:)`*/
            ),
            icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />,
          });
          this.goBack();
        })
        .catch(e => {
          this.setState({ submitting: false });
          notification.open({
            message: this.$t('confirm.payment.payFailure' /*确认付款失败！*/),
            description: this.$t('common.error' /*可能是服务器出了点问题:(*/),
            icon: <Icon type="frown-circle" style={{ color: '#e93652' }} />,
          });
        });
    });
  };
  //返回
  goBack = () => {
    if (this.props.backType === 'history') {
      window.history.go(-1);
    } else {
      this.context.router.push(this.state.applicationList.url);
    }
  };

  render() {
    const { loading } = this.state;
    return (
      <div className="go-back-btn">
        {!this.props.onlyBack && (
          <Button
            type="primary"
            className="back-btn"
            onClick={this.handleConfirmPay}
            style={{ marginRight: 20 }}
            loading={loading}
          >
            {this.$t('confirm.payment.confirmPaid' /*确认已付款！*/)}
          </Button>
        )}
        <Button onClick={this.goBack}>{this.$t('common.back')}</Button>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

const wrappedGoBackBtn = Form.create()(SurePayBtn);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedGoBackBtn);
