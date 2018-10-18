import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import contractService from 'containers/contract/contract-approve/contract.service';
import { Form, Affix, Button, Row, Col, message } from 'antd';

import ContractDetailCommon from 'containers/contract/contract-approve/contract-detail-common';
import ApproveBar from 'components/Widget/Template/approve-bar';

class ContractDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passLoading: false,
      rejectLoading: false,
      isConfirm: this.props.params, //合同审批是否通过
      //contract: menuRoute.getRouteItem('approve-contract', 'key'),    //合同
    };
  }

  //获取合同状态
  getStatus = params => {
    this.setState({
      isConfirm: params === 1004 || params === 6001 || params === 6002 || params === 6003,
    });
  };

  //审批通过
  handleApprovePass = values => {
    this.setState({ passLoading: true });
    contractService
      .contractApprovePass(this.props.match.params.id, values || '')
      .then(res => {
        if (res.status === 200) {
          this.setState({ passLoading: false });
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.goBack();
        }
      })
      .catch(e => {
        this.setState({ passLoading: false });
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  //审批驳回
  handleApproveReject = values => {
    this.setState({ rejectLoading: true });
    contractService
      .contractApproveReject(this.props.match.params.id, values)
      .then(res => {
        if (res.status === 200) {
          this.setState({ rejectLoading: false });
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.goBack();
        }
      })
      .catch(e => {
        this.setState({ rejectLoading: false });
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  //返回
  goBack = () => {
    //this.context.router.push(this.state.contract.url);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/contract-manage/contract-recheck`,
      })
    );
  };

  render() {
    const { isConfirm, passLoading, rejectLoading } = this.state;
    return (
      <div className="contract-detail" style={{ margin: '-12px -14px' }}>
        <ContractDetailCommon
          id={this.props.match.params.id}
          isApprovePage={true}
          getContractStatus={this.getStatus}
        />
        {!isConfirm && (
          <Affix
            offsetBottom={0}
            className="bottom-bar bottom-bar-approve"
            style={{ paddingLeft: 15 }}
          >
            <Row>
              <Col span={21}>
                <ApproveBar
                  passLoading={passLoading}
                  style={{ paddingLeft: 40 }}
                  backUrl={'/contract-manage/contract-recheck'}
                  rejectLoading={rejectLoading}
                  handleApprovePass={this.handleApprovePass}
                  handleApproveReject={this.handleApproveReject}
                />
              </Col>
            </Row>
          </Affix>
        )}
        {isConfirm && (
          <Affix offsetBottom={0} className="bottom-bar">
            <Button style={{ marginLeft: 80 }} onClick={this.goBack} className="back-btn">
              {this.$t({ id: 'common.back' } /*返回*/)}
            </Button>
          </Affix>
        )}
      </div>
    );
  }
}

const wrappedContractDetail = Form.create()(ContractDetail);
export default connect(
  null,
  null,
  null,
  { withRef: true }
)(wrappedContractDetail);
