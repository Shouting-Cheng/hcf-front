import React from 'react';
import { connect } from 'dva';
import { Form, Button } from 'antd';

class LoanAndRefundBack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loanRefundList: menuRoute.getRouteItem('loan-and-refund', 'key'), //借还款列表页
      overallList: menuRoute.getRouteItem('overall-sub-list', 'key'), //全局查看列表页
    };
  }

  //返回
  goBack = () => {
    if (this.props.tab) {
      this.context.router.push(this.state.loanRefundList.url + `?tab=${this.props.tab}`);
    } else {
      this.context.router.push(
        this.state.overallList.url
          .replace(':employeeId', this.props.info.applicant.employeeID)
          .replace(':currencyCode', this.props.info.originCurrencyCode)
      );
    }
  };

  render() {
    return (
      <div className="loan-and-refund-back">
        <Button type="primary" onClick={this.goBack}>
          {this.$t('common.back')}
        </Button>
      </div>
    );
  }
}
function mapStateToProps() {
  return {};
}

const wrappedGoBackBtn = Form.create()(LoanAndRefundBack);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedGoBackBtn);
