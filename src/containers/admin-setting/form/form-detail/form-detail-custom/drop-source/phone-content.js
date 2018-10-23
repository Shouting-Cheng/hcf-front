import React from 'react'
import { Icon } from 'antd'
import { DropTarget } from 'react-dnd'
import ListSort from 'widget/list-sort'
import Widget from 'widget/Template/widget/widget'
import DropWidgetItem from 'containers/admin-setting/form/form-detail/form-detail-custom/drop-source/drop-widget-item'
import PropTypes from 'prop-types'
/**
 * 手机内部dropTarget
 */
class PhoneContent extends React.Component{
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

  handleDelete = (index) => {
    this.props.onDelete(index);
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

  renderDragList = () => {
    const { connectDropTarget, widgetList, nowSelectedIndex, isOver, formDescriptionWidget } = this.props;
    const { hoverIndex } = this.state;
    if(this.props.dragEnabled){
      return (
        <div>
          <ListSort
            dragClassName="drag-widget-item"
            onChange={this.handleSort}
          >
            {widgetList.map((widget, index) =>
              <div key={widget.counterFlag} className={`list-sort-widget ${isOver && (hoverIndex - 1) === index && 'hover'}`}>
                <DropWidgetItem widget={widget}
                                index={index}
                                onHover={this.handleHover}
                                className={nowSelectedIndex === index ? 'selected' : ''}
                                onClick={(e) => this.handleClick(e, index, widget)}/>
                {(widget.fieldName==='部门'||widget.fieldName==='公司'||widget.fieldName==='币种'||widget.fieldName==='备注')?undefined:this.renderDeleteIcon(index)}
              </div>)}
          </ListSort>
        </div>
      )
    }else {
      return (
        <div>
          {widgetList.map((widget, index) =>
            <div key={widget.counterFlag} className={`list-sort-widget ${isOver && (hoverIndex - 1) === index && 'hover'}`}>
              <DropWidgetItem widget={widget}
                              index={index}
                              onHover={this.handleHover}
                              className={nowSelectedIndex === index ? 'selected' : ''}
                              onClick={(e) => this.handleClick(e, index, widget)}/>
              {(widget.fieldName==='部门'||widget.fieldName==='公司'||widget.fieldName==='币种'||widget.fieldName==='备注')?undefined:this.renderDeleteIcon(index)}
            </div>)}
        </div>
      )
    }
  }
  renderDeleteIcon = (index) => {
    const {widgetList, nowSelectedIndex} = this.props;
    if(this.props.deleteEnabled){
      return (
        <div>
          {nowSelectedIndex === index && !widgetList[nowSelectedIndex].readonly && (
            <div className="widget-delete" onClick={() => this.props.onDelete(index)}>
              <Icon type="delete" />
            </div>
          )}
        </div>
      )
    }else {
      <div></div>
    }
  }
  render() {
    const { connectDropTarget, widgetList, nowSelectedIndex, isOver, formDescriptionWidget } = this.props;
    const { hoverIndex } = this.state;
    return connectDropTarget(
      <div className="phone-content">
        <div className="form-description-widget">
          <Widget className={nowSelectedIndex === -1 ? 'selected' : ''}
                  onClick={(e) => this.handleClick(e, -1, formDescriptionWidget)}
                  widget={formDescriptionWidget}/>
        </div>
        {hoverIndex === 0 && isOver && <div className="insert-line"/>}
        {this.renderDragList()}
      </div>
    )
  }
}

PhoneContent.propTypes = {
  formDescriptionWidget: PropTypes.object,  //编辑中的表单自动增加的第一个description控件类型，不可删除不可拖动
  connectDropTarget: PropTypes.func.isRequired,
  widgetList: PropTypes.array,  //组件列表，key值为上层定义的counterFlag
  onDrop:PropTypes.func,
  nowSelectedIndex: PropTypes.number,
  onSelect: PropTypes.func,
  onSort: PropTypes.func,
  onDelete: PropTypes.func,
  isOver:PropTypes.bool.isRequired,
  deleteEnabled: PropTypes.bool,//是否可以删除
  dragEnabled: PropTypes.bool,//是否可以拖拽
};
PhoneContent.defaultProps = {
  deleteEnabled: true,//默认可以删除
  dragEnabled: true,//默认可以拖拽
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
  }))(PhoneContent)
