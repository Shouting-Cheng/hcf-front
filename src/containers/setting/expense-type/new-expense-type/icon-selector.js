import React from 'react'
import { connect } from 'dva'
import { Modal, message, Button, Input, Row, Col, Tag, Icon, Spin } from 'antd'
import 'styles/setting/expense-type/new-expense-type/icon-selector.scss'
import ExpenseTypeService from 'containers/setting/expense-type/expense-type.service'
import { messages } from 'utils/utils'
import PropTypes from 'prop-types';


class IconSelector extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      fetched: false,
      iconList: [],
      selectedIcon: null
    }
  }

  componentWillMount(){
    ExpenseTypeService.getIconList().then(res => {
      this.setState({iconList: res.data, fetched: true})
    })
  }

  render() {
    const { iconList, fetched } = this.state;
    const { visible, onCancel, afterClose, onOk } = this.props;
    return (
      <Modal
        title={messages('expense.type.select.icon')}
        visible={visible}
        onCancel={onCancel}
        afterClose={afterClose}
        footer={null}
        className="icon-selector">
        <div className="icon-container">
          {!fetched && <Spin/>}
          {iconList.map((icon, index) => <img src={icon.iconURL} key={index} onClick={() => onOk(icon)}/>)}
        </div>
      </Modal>
    )
  }
}

IconSelector.propTypes = {
  visible: PropTypes.bool,  //对话框是否可见
  onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel: PropTypes.func,  //点击取消后的回调
  afterClose: PropTypes.func,  //关闭后的回调
  selectedData: PropTypes.string  //默认选择的值id
};

IconSelector.defaultProps = {
  afterClose: () => {}
};

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(IconSelector)
