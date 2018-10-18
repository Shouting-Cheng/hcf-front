import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'dva';
import { Form } from 'antd';

import moment from 'moment';
import 'styles/request/travel-request/travel-date.scss';

class TravelDate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  //获取天数差
  getDifferDays = (sDate, eDate) => {
    sDate = new Date(new Date(sDate).format('yyyy-MM-dd'));
    eDate = new Date(new Date(eDate).format('yyyy-MM-dd'));
    return Math.abs(Math.floor((eDate - sDate) / 1000 / 60 / 60 / 24)) + 1;
  };

  render() {
    const { info } = this.props;
    let sDate = info.travelApplication && info.travelApplication.startDate;
    let eDate = info.travelApplication && info.travelApplication.endDate;
    return (
      <div className="travel-date">
        {this.$t('request.detail.travel.date.range') /*出差日期*/}：
        {moment(sDate).format('YYYY-MM-DD')} ～ {moment(eDate).format('YYYY-MM-DD')}，
        {this.$t('request.detail.travel.total.day', {
          day: this.getDifferDays(sDate, eDate) || 0,
        }) /*共 {day} 天*/}
      </div>
    );
  }
}

TravelDate.propTypes = {
  info: PropTypes.object,
};

TravelDate.defaultProps = {
  info: {},
};

function mapStateToProps() {
  return {};
}

const wrappedLoanRepayment = Form.create()(TravelDate);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedLoanRepayment);
