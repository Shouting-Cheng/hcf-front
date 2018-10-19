import React, { Component } from 'react'
import { DragLayer } from 'react-dnd'
import Widget from 'containers/setting/expense-type/new-expense-type/expense-type-custom/widget'

/**
 * 覆盖整个页面的drop源，当拖拽进入时显示对应的widget样式
 */
class FakeDropLayout extends Component {

  renderItem = (type, item) => {
    if(type)
      return <Widget widget={item} />
  };

  getItemStyles = (props) => {
    const { initialOffset, currentOffset } = props;
    //初始位置或偏移位置没有表示当前没有拖拽发生
    if (!initialOffset || !currentOffset) {
      return {
        display: 'none',
      }
    }
    //有拖拽发生时，指定对应的translate
    let { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;
    return {
      transform,
      WebkitTransform: transform,
    }
  };

  render() {
    const { item, itemType, isDragging } = this.props;
    if (!isDragging) {
      return null
    }
    const layerStyles = {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 100,
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    };
    return (
      <div style={layerStyles}>
        <div style={this.getItemStyles(this.props)}>
          {this.renderItem(itemType, item)}
        </div>
      </div>
    )
  }
}

FakeDropLayout.propTypes = {
  item: React.PropTypes.object,
  itemType: React.PropTypes.string,
  initialOffset: React.PropTypes.shape({
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
  }),
  currentOffset: React.PropTypes.shape({
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
  }),
  isDragging: React.PropTypes.bool.isRequired,
};

export default DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))(FakeDropLayout)
