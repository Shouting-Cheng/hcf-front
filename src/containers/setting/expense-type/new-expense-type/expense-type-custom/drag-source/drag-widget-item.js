import React from 'react'
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'

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

  render() {
    const { widget } = this.props;
    const { isDragging, connectDragSource } = this.props;
    return connectDragSource(
      <div className="widget-list-item">{widget.name}</div>
    )
  }
}

DragWidgetItem.propTypes = {
  widget: React.PropTypes.object,
  connectDragSource: React.PropTypes.func.isRequired,  //自动注入
  connectDragPreview: React.PropTypes.func.isRequired,  //自动注入
  isDragging: React.PropTypes.bool.isRequired
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
