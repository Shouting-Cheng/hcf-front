import React from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import PropTypes from 'prop-types';

import 'styles/request/travel-request/travel-previous-version.scss';

class TravelPreviousVersion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  toPreviousVersion = () => {
    const { info } = this.props;
    window.open(
      this.state.requestDetail.url
        .replace(':formOID', info.formOID)
        .replace(':applicationOID', info.sourceApplicationOID) +
        `?readOnly=true&isPreVersion=true&latestApplicationOID=${info.applicationOID}`
    );
  };

  render() {
    const { info, isPreVersion } = this.props;
    return (
      <div className="travel-previous-version">
        {info.version > 0 && !isPreVersion && <a onClick={this.toPreviousVersion}>查看上一版本</a>}
      </div>
    );
  }
}

TravelPreviousVersion.propTypes = {
  info: PropTypes.object,
  isPreVersion: PropTypes.string,
};

function mapStateToProps() {
  return {};
}

const wrappedLoanRepayment = Form.create()(TravelPreviousVersion);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedLoanRepayment);
