import {messages} from "share/common";
import React from 'react'
import { connect } from 'react-redux'
import { Form, Alert } from 'antd'

class BookerInfoAlert extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      info: {},
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ info: nextProps.info })
  }

  render() {
    const { info } = this.state;
    return (
      <div className="booker-info-alert" style={{marginBottom:10}}>
        {info.status === 1002 && <Alert message={messages('request.detail.booker.toast1')/*审批通过后将显示订票专员为您预订的机票*/} type="info" showIcon />}
        {info.status === 1003 && (!info.travelOrders || (info.travelOrders && !info.travelOrders.length)) &&
          <Alert message={messages('request.detail.booker.toast1')/*等待订票专员为您订票*/} type="info" showIcon />}
      </div>
    )
  }
}

BookerInfoAlert.propTypes = {
  info: React.PropTypes.object
};

BookerInfoAlert.defaultProps={
  info: {}
};

function mapStateToProps() {
  return { }
}

const wrappedBookerInfoAlert = Form.create()(BookerInfoAlert);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedBookerInfoAlert)
