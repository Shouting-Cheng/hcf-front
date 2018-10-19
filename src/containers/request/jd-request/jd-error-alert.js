import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'dva';
import { Form, Alert } from 'antd';

class JDErrorAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOutTime: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    nextProps.info.jingDongOrderApplication &&
      this.getRemainingTime(nextProps.info.jingDongOrderApplication.createdDate);
  }

  //剩余付款时间
  getRemainingTime = createDate => {
    let remainMs = new Date().getTime() - new Date(createDate).getTime();
    let remainDay = 7 - Math.ceil(remainMs / (1000 * 3600 * 24)); // 计算剩余天数,向上取整
    if (remainDay < 0 && !this.state.isOutTime) {
      this.setState({ isOutTime: true });
    }
  };

  render() {
    const { isOutTime } = this.state;
    return (
      <div className="jd-error-alert">
        {isOutTime && (
          <Alert
            message={
              this.$t(
                'request.detail.jd.error.message'
              ) /*该京东订单已超时，如需购买商品，请重新提交订单*/
            }
            type="error"
            showIcon
          />
        )}
      </div>
    );
  }
}

JDErrorAlert.propTypes = {
  info: PropTypes.object,
};

JDErrorAlert.defaultProps = {
  info: {},
};

function mapStateToProps() {
  return {};
}

const wrappedJDErrorAlert = Form.create()(JDErrorAlert);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedJDErrorAlert);
