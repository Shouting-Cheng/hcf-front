import React from 'react'
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'

import manApprovalImg from 'images/setting/workflow/man-approval.svg'
import knowImg from 'images/setting/workflow/know.svg'
import aiApprovalImg from 'images/setting/workflow/aiapproval.svg'
import mailImg from 'images/setting/workflow/mail.png'
import endImg from 'images/setting/workflow/end.png'
import auditImg from 'images/setting/workflow/audit.png'
import PropTypes from 'prop-types';

/**
 * 页面左侧列表内可拖拽组件块
 */
class DragWidgetItem extends React.Component{
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    //链接拖拽的预览图片，用官方api给定一个空图片
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true,
    })
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

  render() {
    const { widget } = this.props;
    const { isDragging, connectDragSource } = this.props;
    return connectDragSource(
      <div className="widget-list-item">
        <img src={this.getImageUrl(widget.type)}/>
        <div>{widget.name}</div>
      </div>
    )
  }
}

DragWidgetItem.propTypes = {
  widget: PropTypes.object,
  connectDragSource: PropTypes.func.isRequired,  //自动注入
  connectDragPreview: PropTypes.func.isRequired,  //自动注入
  isDragging: PropTypes.bool.isRequired
};

export default DragSource(
  'widget-item',
  {
    beginDrag(props) {
      return props.widget
    },
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }))(DragWidgetItem)
