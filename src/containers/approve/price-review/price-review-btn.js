import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Form, Button, message } from 'antd';

import ApproveBar from 'widget/Template/approve-bar';
import priceService from 'containers/approve/price-review/price-review.service';

class PriceReviewBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passLoading: false,
      rejectLoading: false,
      priceReviewList: menuRoute.getRouteItem('price-review', 'key'),
    };
  }

  //审核操作
  handleReview = (type, comment) => {
    let params = {
      applicationOid: this.props.applicationOid,
      flag: type === 'pass', //true 通过，false 驳回
      comment,
    };
    this.setState({
      passLoading: type === 'pass',
      rejectLoading: type === 'reject',
    });
    priceService
      .priceReviewPassOrReject(params)
      .then(() => {
        message.success('操作成功');
        this.goBack('approving');
      })
      .catch(() => {
        this.setState({
          passLoading: false,
          rejectLoading: false,
        });
      });
  };

  //返回
  goBack = type => {
    this.context.router.push(this.state.priceReviewList.url + `?tab=${type}`);
  };

  render() {
    const { passLoading, rejectLoading, priceReviewList } = this.state;
    return (
      <div className="price-review-btn">
        {this.props.approving ? (
          <ApproveBar
            backUrl={priceReviewList.url}
            passLoading={passLoading}
            rejectLoading={rejectLoading}
            handleApprovePass={value => this.handleReview('pass', value)}
            handleApproveReject={value => this.handleReview('reject', value)}
          />
        ) : (
          <Button type="primary" onClick={() => this.goBack('approved')}>
            {this.$t('common.back') /*返回*/}
          </Button>
        )}
      </div>
    );
  }
}

PriceReviewBtn.propTypes = {
  approving: PropTypes.bool,
  applicationOid: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    user: state.login.user,
  };
}

const wrappedRefundBtns = Form.create()(PriceReviewBtn);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedRefundBtns);
