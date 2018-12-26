import React from 'react';
import { Form, Button, message, Modal, Spin } from 'antd';
import { connect } from 'dva';
import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss';
import { routerRedux } from 'dva/router';

import service from "./service"

const confirm = Modal.confirm;

import Common from "./detail-common"



class ExpenseApplicationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dLoading: false,
      headerData: {},
      id: 0,
      getLoading: true
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  //获取费用申请单头 信息
  getInfo = () => {
    service.getApplicationDetail(this.props.match.params.id).then(res => {
      this.setState({ headerData: res.data, getLoading: false });
    }).catch(err => {
      console.error(err);
      message.error(err.response.data.message);
      this.setState({ getLoading: false });
    })
  };

  //提交
  onSubmit = () => {

  };

  //删除预付款单
  onDelete = () => {
    confirm({
      title: '删除',
      content: '确认删除该预付款单？',
      onOk: () => {
        this.setState({ dLoading: true });
      }
    });
  };
  //取消
  onCancel = () => {
    if (this.props.match.params.flag === 'prePayment' || this.props.match.params.flag === ':flag') {
      this.props.dispatch(
        routerRedux.push({
          pathname: `/pre-payment/my-pre-payment`,
        })
      );
    } else {
      // this.context.router.push(this.state.paymentDetail.url.replace(':id', this.props.params.flag).replace(':flag', 'me-pre-payment'));
      this.props.dispatch(
        routerRedux.push({
          pathname: `/financial-view/pre-payment-view`,
        })
      );
    }
  };

  render() {
    const { loading, dLoading, headerData, id, getLoading } = this.state;
    const newState = (
      <div>
        <Button
          type="primary"
          onClick={this.onSubmit}
          loading={loading}
          style={{ margin: '0 20px' }}
        >提 交</Button>
        <Button onClick={this.onDelete} loading={dLoading}>删 除</Button>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>返 回</Button>
      </div>
    );
    const otherState = (
      <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>返 回</Button>
    );
    return (
      <div style={{ paddingBottom: 100 }} className="pre-payment-detail">
        {getLoading ? <Spin /> : <Common headerData={headerData} contractEdit={true} id={id} />}
        <div
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
          }}
        >
          {headerData.status &&
            (headerData.status === 1001 || headerData.status === 1003 || headerData.status === 1005)
            ? newState
            : otherState}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps
)(Form.create()(ExpenseApplicationDetail));
