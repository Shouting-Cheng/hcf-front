/**
 * 操作：更改
 * 适用：已通过 且 customFormPropertyMap['application.change.enable']为true 的 差旅申请单
 * 获取 customFormPropertyMap 的接口：/api/custom/forms/
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, message } from 'antd';

import requestService from 'containers/request/request.service';
import PropTypes from 'prop-types';

class TravelUpdateBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  //判断是否可以更改
  judgeEnable = () => {
    this.setState({ loading: true });
    requestService.judgeEnableChange(this.props.info.applicationOid).then(res => {
      if (res.data.success) {
        this.handleUpload();
      } else {
        this.setState({ loading: false });
        message.warning(res.data.message);
      }
    });
  };

  //更改
  handleUpload = () => {
    const { formOid, applicationOid } = this.props.info;
    let info = this.props.info;
    info.applicationOid = '';
    requestService
      .handleApplicationUpload(applicationOid, info)
      .then(res => {
        this.context.router.replace(
          this.state.requestEdit.url
            .replace(':formOid', formOid)
            .replace(':applicationOid', res.data.applicationOid)
        );
      })
      .catch(e => {
        this.setState({ loading: false });
        message.warning(e.response.data.message);
      });
  };

  render() {
    const { loading } = this.state;
    const { formType, info, updateEnable } = this.props;
    return (
      <div className="travel-update-btn request-btn">
        {/* status: 1003（已通过）、1011（已更改） */}
        {formType === 2001 &&
          info.status === 1003 &&
          updateEnable === 'true' && (
            <Button type="primary" loading={loading} onClick={this.judgeEnable}>
              {this.$t('request.detail.btn.modify') /*更 改*/}
            </Button>
          )}
      </div>
    );
  }
}

TravelUpdateBtn.propTypes = {
  formType: PropTypes.number.isRequired,
  info: PropTypes.object.isRequired,
  updateEnable: PropTypes.string,
};

function mapStateToProps() {
  return {};
}

const wrappedTravelUpdateBtn = Form.create()(TravelUpdateBtn);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelUpdateBtn);
