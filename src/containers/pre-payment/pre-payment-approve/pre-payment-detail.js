import React from 'react';
import config from 'config';
import httpFetch from 'share/httpFetch';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Affix, Button, message, Row, Card, Col } from 'antd';

import PrePaymentCommon from 'containers/pre-payment/my-pre-payment/pre-payment-common';
// import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss'
import 'styles/contract/my-contract/contract-detail.scss';

import ApproveBar from 'components/Widget/Template/approve-bar';
import prePaymentService from 'containers/pre-payment/my-pre-payment/me-pre-payment.service';

import approvePrePaymentService from 'containers/pre-payment/pre-payment-approve/pre-payment.service';

class PrePaymentDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dLoading: false,
      headerData: {},
      passLoading: false,
      rejectLoading: false,
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  //获取预付款头信息
  getInfo = () => {
    approvePrePaymentService
      .getHeadById(this.props.match.params.id)
      .then(res => {
        this.setState({
          headerData: res.data,
        });
      })
      .catch(() => {
        message.error('数据加载失败，请重试');
      });
  };

  //通过
  handleApprovePass = remark => {
    const { applicationOid, empOid, formOid, documentOid, id } = this.state.headerData;

    let model = {
      approvalTxt: remark,
      entities: [
        {
          entityOID: documentOid,
          entityType: 801003,
        },
      ],
      countersignApproverOIDs: [],
    };

    this.setState({ loading: true });

    approvePrePaymentService
      .approvePass(model)
      .then(res => {
        if (res.data.failNum === 0) {
          message.success('操作成功');
          this.setState({ loading: false });
          this.onCancel();
        } else {
          message.success('操作失败：' + JSON.stringify(res.data.failReason));
          this.setState({ loading: false });
        }
      })
      .catch(e => {
        this.setState({ loading: false });
        message.error(`操作失败，${e.response.data.message}`);
      });
  };

  //不通过
  handleApproveReject = remark => {
    const { applicationOid, empOid, formOid, documentOid, id } = this.state.headerData;
    let model = {
      approvalTxt: remark,
      entities: [
        {
          entityOID: documentOid,
          entityType: 801003,
        },
      ],
    };

    this.setState({ dLoading: true });

    approvePrePaymentService
      .approveReject(model)
      .then(res => {
        if (res.status === 200) {
          this.setState({ dLoading: false });
          this.onCancel();
          message.success('操作成功！');
        } else {
          this.setState({ dLoading: false });
          this.onCancel();
          message.error(`提交失败，${e.response.data.message}`);
        }
      })
      .catch(e => {
        this.setState({ dLoading: false });
        message.error(`提交失败，${e.response.data.message}`);
      });
  };

  //取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/approval-management/pre-payment-approve`,
      })
    );
  };

  render() {
    const { loading, dLoading, headerData, passLoading, rejectLoading } = this.state;
    const newState = (
      <div>
        <Button
          type="primary"
          onClick={this.onSubmit}
          loading={loading}
          style={{ margin: '0 20px' }}
        >
          提 交
        </Button>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>
          返 回
        </Button>
      </div>
    );

    const otherState = (
      <div>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>
          返 回
        </Button>
      </div>
    );

    return (
      <div
        className="contract-detail"
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', paddingBottom: 100 }}
      >
        <PrePaymentCommon
          flag={false}
          params={this.state.headerData}
          contractEdit={true}
          id={this.props.match.params.id}
        />
        {this.props.match.params.status === 'unapproved' ? (
          <div className="bottom-bar bottom-bar-approve">
            <ApproveBar
              passLoading={loading}
              style={{ paddingLeft: 20 }}
              backUrl={'/approval-management/pre-payment-approve'}
              rejectLoading={dLoading}
              handleApprovePass={this.handleApprovePass}
              handleApproveReject={this.handleApproveReject}
            />
          </div>
        ) : (
          <div className="bottom-bar bottom-bar-approve">
            <div style={{ lineHeight: '50px' }}>
              <Button loading={loading} onClick={this.onCancel} className="back-btn">
                {this.$t({ id: 'common.back' } /*返回*/)}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
const wrappedPrePaymentDetail = Form.create()(PrePaymentDetail);
export default connect(
  null,
  null,
  null,
  { withRef: true }
)(wrappedPrePaymentDetail);
