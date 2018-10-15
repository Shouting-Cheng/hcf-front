import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import PropTypes from 'prop-types';

class ViewDetailsModal extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { visible, onCancel, content, title } = this.props;
    return (
      <Modal
        bodyStyle={{ background: '#F0F2F5' }}
        title={title}
        closable
        width="80%"
        visible={visible}
        onCancel={onCancel}
        footer={null}
      >
        {content}
      </Modal>
    );
  }
}
/**
 * PropTypes
 */
ViewDetailsModal.propTypes = {
  visible: PropTypes.bool, //对话框是否可见
  onCancel: PropTypes.func, //点击取消后的回调
  content: PropTypes.object, //对话框包含的组件
  title: PropTypes.string,
};
/**
 * router
 */

/**
 * redux
 */
function mapStateToProps(state) {
  return {
    company: state.login.company,
    user: state.login.user,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ViewDetailsModal);
