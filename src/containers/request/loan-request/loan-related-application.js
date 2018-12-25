import React from 'react';
import { connect } from 'dva';
import { Form, Icon } from 'antd';
import PropTypes from 'prop-types';

class LoanRelatedApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //requestDetail: menuRoute.getRouteItem('request-detail', 'key'), //申请单详情页
    };
  }

  toRelatedApplication = () => {
    let reference = this.props.info.referenceApplication;
    window.open(
      this.state.requestDetail.url
        .replace(':formOid', reference.formOid)
        .replace(':applicationOid', reference.applicationOid) + '?from=request'
    );
  };

  render() {
    const { info } = this.props;
    return (
      <div className="loan-related-application">
        {info.referenceApplication &&
          info.referenceApplication.businessCode && (
            <div className="row-container">
              <Icon type="link" className="link-icon" />
              <a onClick={this.toRelatedApplication}>
                {this.$t('request.detail.request') /*申请单*/}：{
                  info.referenceApplication.businessCode
                }
              </a>
            </div>
          )}
      </div>
    );
  }
}

LoanRelatedApplication.propTypes = {
  info: PropTypes.object,
};

LoanRelatedApplication.defaultProps = {
  info: {},
};

function mapStateToProps() {
  return {};
}

const wrappedLoanRelatedApplication = Form.create()(LoanRelatedApplication);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedLoanRelatedApplication);
