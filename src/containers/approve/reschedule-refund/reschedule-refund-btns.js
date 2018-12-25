import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Form, Button, message } from 'antd';

import ApproveBar from 'widget/Template/approve-bar';
import requestService from 'containers/approve/request/request.service';

class RescheduleRefundBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passLoading: false,
      rejectLoading: false,
      rescheduleRefundList: menuRoute.getRouteItem('reschedule-refund', 'key'),
    };
  }

  //返回
  goBack = () => {
    this.context.router.push(this.state.rescheduleRefundList.url);
  };

  //审批通过
  handleApprovePass = value => {
    let params = {
      approvalTxt: value,
      entities: [
        {
          entityOid: this.props.bookTaskOid,
          entityType: 2002, //订票任务
        },
      ],
    };
    this.setState({ passLoading: true });
    requestService
      .handleRequestApprovePass(params)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t('common.operate.success'));
          this.setState({ passLoading: false });
          this.goBack();
        }
      })
      .catch(e => {
        this.setState({ passLoading: false });
        message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
      });
  };

  //审批驳回
  handleApproveReject = value => {
    let params = {
      approvalTxt: value,
      entities: [
        {
          entityOid: this.props.bookTaskOid,
          entityType: 2002, //订票任务
        },
      ],
    };
    this.setState({ rejectLoading: true });
    requestService
      .handleRequestApproveReject(params)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t('common.operate.success'));
          this.setState({ rejectLoading: false });
          this.goBack();
        }
      })
      .catch(e => {
        this.setState({ rejectLoading: false });
        message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
      });
  };

  render() {
    const { passLoading, rejectLoading, rescheduleRefundList } = this.state;
    return (
      <div className="reschedule-refund-btn">
        {this.props.approving ? (
          <ApproveBar
            backUrl={rescheduleRefundList.url}
            passLoading={passLoading}
            rejectLoading={rejectLoading}
            handleApprovePass={this.handleApprovePass}
            handleApproveReject={this.handleApproveReject}
          />
        ) : (
          <Button type="primary" className="back-btn" onClick={this.goBack}>
            {this.$t('common.back')}
          </Button>
        )}
      </div>
    );
  }
}

RescheduleRefundBtn.propTypes = {
  approving: PropTypes.bool,
  bookTaskOid: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    user: state.login.user,
  };
}

const wrappedRescheduleRefundBtn = Form.create()(RescheduleRefundBtn);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedRescheduleRefundBtn);
