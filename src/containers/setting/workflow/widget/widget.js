import React from 'react'
import { connect } from 'dva'
import { Icon, Popconfirm, message } from 'antd'
import PropTypes from 'prop-types';

import manApprovalImg from 'images/setting/workflow/man-approval.svg'
import knowImg from 'images/setting/workflow/know.svg'
import aiApprovalImg from 'images/setting/workflow/aiapproval.svg'
import mailImg from 'images/setting/workflow/mail.png'
import endImg from 'images/setting/workflow/end.png'
import auditImg from 'images/setting/workflow/audit.png'

import workflowService from 'containers/setting/workflow/workflow.service'
import 'styles/setting/workflow/widget/widget.scss'

class Widget extends React.Component{
  constructor(props) {
    super(props);
  }

  getImageUrl = (type) => {
    switch(type) {
      case 1001:
        return manApprovalImg;
      case 1002:
        return knowImg;
      case 1003:
        return aiApprovalImg;
      case 1004:
        return mailImg;
      case 1005:
        return endImg;
      case 1006:
        return auditImg;
    }
  };

  //删除节点
  handleDelete = (e, widget) => {
    this.props.deleteHandle();
    workflowService.deleteApprovalNode(widget.ruleApprovalNodeOID).then(() => {
      message.success(this.$t('common.delete.success', {name: ''}));
      this.props.deleteHandle(true)
    })
  };

  renderWidget = (widget) => {
    return (
      <div className={`widget-list-item ${this.props.className}`}>
        <div className="top-cover"/>
        <Popconfirm onConfirm={e => this.handleDelete(e, widget)} title={this.$t('workflow.detail.confirm.delete.node')/*是否确认删除该节点？*/}>
          <Icon type="close-circle" className="delete-icon" onClick={e => {e.preventDefault();e.stopPropagation()}}/>
        </Popconfirm>
        <img src={this.getImageUrl(widget.type)}/>
        <div>{widget.remark || widget.name}</div>
      </div>
    )
  };

  render() {
    const { widget, width, onClick } = this.props;
    return (
      <div className='workflow-widget' style={{ width }} onClick={onClick}>
        {this.renderWidget(widget)}
      </div>
    )
  }
}

Widget.propTypes = {
  onClick: PropTypes.func,
  widget: PropTypes.object,
  width: PropTypes.any,
  className: PropTypes.string,
  deleteHandle: PropTypes.func,
};

Widget.defaultProps = {
  className: '',
  onClick: () => {},
  deleteHandle: () => {},
};

function mapStateToProps(state) {
  return {
    language: state.languages
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(Widget)
