import React from 'react'
import { DropTarget } from 'react-dnd'
import { findDOMNode } from 'react-dom'
import Widget from 'containers/setting/workflow/widget/widget'
import PropTypes from 'prop-types';

/**
 * phone-content内的组件，把该组件包装成dropTarget时就能得到拖入新控件时hover的index
 * 因为React-DnD只能包装基础dom，所以将widget组件单独写在外面，这里引入用div包装
 */
class DropWidgetItem extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    const { connectDropTarget, width, onClick, className, widget } = this.props;
    return connectDropTarget(
      <div onClick={onClick} style={{ width }}>
        <Widget className={className} widget={Object.assign({}, widget)} deleteHandle={this.props.deleteHandle}/>
      </div>

    )
  }
}

DropWidgetItem.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  widget: PropTypes.object,
  width: PropTypes.any,  //组件宽度，默认100%
  onClick: PropTypes.func,
  className: PropTypes.string,  //内部组件的className
  index: PropTypes.number,  //包装后的标记列表顺序，当有新控件hover时返回顺序
  deleteHandle: PropTypes.func,
};

export default DropTarget(
  'widget-item',
  {
    //hover时得到对应的index返回给上级
    hover(props, monitor, component) {
      //以组件高度的50%进行计算，少于一般则放在上方，否则放在下方
      const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
      //组件高度的50%
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      //指针在组件内部的y值
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      props.onHover(props.index + Number(hoverClientY > hoverMiddleY));
    }
  },
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget()
  }))(DropWidgetItem)
