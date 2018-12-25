
import React from 'react'
import { connect } from 'dva'
import moment from 'moment'
// import menuRoute from 'routes/menuRoute'
import { Row, Icon } from 'antd'
import PropTypes from 'prop-types';
class RelativeExpenseReportDetail extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
    //   requestDetail: menuRoute.getRouteItem('request-detail'),
    //   loanRequestDetailPayment: menuRoute.getRouteItem('loan-refund-detail')
    }
  }

  handleGoApplication = () => {
    const { info } = this.props;
    // window.open(this.state.requestDetail.url.replace(':formOid', info.applicationFormOid).replace(':applicationOid', info.applicationOid) + '?from=expense');
  };
  handleGoLoanApplication = () => {
    const { info } = this.props;
    // window.open(this.state.loanRequestDetailPayment.url.replace(':formOid', info.loanApplicationFormOid).replace(':applicationOid',info.loanApplicationOid));
  };


  render() {
    const { info } = this.props;
    info.travelStartDate && (info.travelStartDate = moment(info.travelStartDate).format('YYYY-MM-DD'));
    info.travelEndDate && (info.travelEndDate = moment(info.travelEndDate).format('YYYY-MM-DD'));
    let application=info.applicationBusinessCode ?  (
      <Row className="row-container">
        <Icon type="link" className="link-icon"/>
        <a onClick={this.handleGoApplication}>{this.$t('request.detail.request')/*申请单*/}：{info.applicationBusinessCode}</a>
        {info.travelStartDate && info.travelEndDate && <span style={{marginLeft:'10px',color:'#666'}}>{this.$t('request.detail.roundTrip')}：{info.travelStartDate} ~ {info.travelEndDate}</span>}
      </Row>
    ) : null;
    let loanApplication=info.loanApplicationBusinessCode ?  (
      <span style={{marginRight:20}}>
        <Icon type="link" className="link-icon"/>
        <a onClick={this.handleGoLoanApplication}>{this.$t('request.detail.borrowingRequestNotes')/*借款申请单*/}：{info.loanApplicationBusinessCode}</a>
      </span>
    ) : null;
    return <Row className="row-container">{application}{loanApplication}</Row>
  }
}

RelativeExpenseReportDetail.propTypes = {
  info:PropTypes.object
};

RelativeExpenseReportDetail.defaultProps={
  info: {}
};

// RelativeExpenseReportDetail.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps() {
  return { }
}

export default connect(mapStateToProps, null, null, { withRef: true })(RelativeExpenseReportDetail)
