import React from 'react'
import { Icon } from 'antd'
import { DropTarget } from 'react-dnd'
import ListSort from 'widget/list-sort'
import DropWidgetItem from 'containers/setting/workflow/drop-source/drop-widget-item'

import endImg from 'images/setting/workflow/end.png'
import PropTypes from 'prop-types';

/**
 * 手机内部dropTarget
 */
class NodeContent extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      lastHoverIndex: -2,  //上次拖拽的index值，与hoverIndex比较判断，用于减少页面渲染
      hoverIndex: -1,  //有拖拽发生时的index值，若为-1则代表没有组件拖拽在内部
    }
  }

  handleClick = (e, index, widget) => {
    this.props.onSelect(index, widget);
  };

  handleSort = (result) => {
    this.props.onSort(result);
  };

  /**
   * 拖拽在内部控件上方时检查
   * @param hoverIndex 拖拽的组件正好在第hoverIndex个控件上方
   */
  handleHover = (hoverIndex) => {
    let { lastHoverIndex } = this.state;
    //如果跟上次一样，则不刷新视图
    if(hoverIndex !== lastHoverIndex)
      this.setState({ hoverIndex, lastHoverIndex: hoverIndex })
  };

  /**
   * widget-item 拖拽在组件上方时检查调用
   */
  checkHoverIndex = () => {
    let { hoverIndex, lastHoverIndex } = this.state;
    let { widgetList } = this.props;
    let result = -1;
    //如果为-1，则代表列表为空或者拖拽处没有widget组件，代表在列表最后
    if(hoverIndex === -1){
      result = widgetList.length;
    } else {
      //否则就是对应的序列值
      result = hoverIndex
    }
    //如果跟上次一样，则不刷新视图
    if(hoverIndex !== lastHoverIndex)
      this.setState({ hoverIndex: result, lastHoverIndex: result });
  };

  handleDelete = (params,index)=>{
    this.setState({
      hoverIndex: this.state.hoverIndex-1

    })
    this.props.onDelete(params)
  };

  renderList = () => {
    const { widgetList, nowSelectedIndex, isOver } = this.props;
    const { hoverIndex } = this.state;
    return widgetList.map((widget, index) =>
      <div key={widget.counterFlag} className={`list-sort-widget ${isOver && (hoverIndex - 1) === index && 'hover'}`}>
        <DropWidgetItem widget={widget}
                        index={index}
                        onHover={this.handleHover}
                        className={nowSelectedIndex === index ? 'selected' : ''}
                        onClick={e => this.handleClick(e, index, widget)}
                        deleteHandle={(index,params)=>this.handleDelete(index,params)}
        />
        <Icon type="arrow-down" className="down-icon"/>
      </div>
    )
  };

  renderDragList = () => {
    const { saving } = this.props;
    return (
      <div className="node-content-list">
        {saving ? <div>{this.renderList()}</div> : (
          <ListSort dragClassName="drag-widget-item" onChange={this.handleSort}>
            {this.renderList()}
          </ListSort>
        )}
      </div>
    )
  };

  render() {
    const { connectDropTarget, isOver, endNodeSelected, endNodeWidget } = this.props;
    const { hoverIndex } = this.state;
    return connectDropTarget(
      <div className="phone-content">
        {hoverIndex === 0 && isOver && <div className="insert-line"/>}
        {this.renderDragList()}
        <div className={`widget-list-item end-node ${endNodeSelected ? 'selected' : ''}`}
             onClick={() => {this.props.onSelect(-1, endNodeWidget)}}>
          <img src={endImg}/>
          <div>{this.$t('workflow.detail.node.finish')/*结束*/}</div>
        </div>
      </div>
    )
  }
}

NodeContent.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  widgetList: PropTypes.array,  //组件列表，key值为上层定义的counterFlag
  onDrop: PropTypes.func,
  nowSelectedIndex: PropTypes.number,
  onSelect: PropTypes.func,
  onSort: PropTypes.func,
  onDelete: PropTypes.func,
  isOver: PropTypes.bool.isRequired,
  endNodeSelected: PropTypes.bool, //是否选中了结束节点
  endNodeWidget: PropTypes.object, //结束节点widget
  saving: PropTypes.bool
};

export default DropTarget(
  'widget-item',
  {
    drop(props, monitor, component) {
      props.onDrop(monitor.getItem(), component.state.hoverIndex);
      component.setState({ hoverIndex: -1 });
    },
    hover(props, monitor, component) {
      component.checkHoverIndex();
    }
  },
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }))(NodeContent)
