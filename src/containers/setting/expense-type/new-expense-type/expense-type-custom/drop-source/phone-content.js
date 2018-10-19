import React from 'react'
import { DropTarget } from 'react-dnd'
import { Icon } from 'antd'
import ListSort from 'components/list-sort'
import 'styles/components/template/drag-widget-page/widget-item.scss'
import DropWidgetItem from 'containers/setting/expense-type/new-expense-type/expense-type-custom/drop-source/drop-widget-item'
import { messages } from 'share/common'

/**
 * 手机内部dropTarget
 */
class PhoneContent extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      lastHoverIndex: -2,  //上次拖拽的index值，与hoverIndex比较优化
      hoverIndex: -1,  //有拖拽发生时的index值，若为-1则代表没有组件拖拽在内部
    }
  }

  handleClick = (e, index, widget) => {
    this.props.onSelect(index, widget);
  };

  handleSort = (result) => {
    this.props.onSort(result)
  };

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
    //如果为-1，则代表列表为空或者拖拽地没有widget组件，代表在列表最后
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

  renderWidget = () => {
    const { widgetList, nowSelectedIndex, isOver, disabled } = this.props;
    const { hoverIndex } = this.state;
    return widgetList.map((widget, index) =>
      <div key={widget.counterFlag} className={`list-sort-widget ${isOver && (hoverIndex - 1) === index && 'hover'}`}>
        <DropWidgetItem widget={widget}
                        index={index}
                        onHover={this.handleHover}
                        className={nowSelectedIndex === index ? 'selected' : ''}
                        onClick={(e) => this.handleClick(e, index, widget)}/>
        {!disabled && nowSelectedIndex === index && !widgetList[nowSelectedIndex].readonly && (
          <div className="widget-delete" onClick={() => this.props.onDelete(index)}>
            <Icon type="delete" />
          </div>
        )}
      </div>)
  };

  render() {
    const { connectDropTarget, isOver, disabled } = this.props;
    const { hoverIndex } = this.state;
    return connectDropTarget(
      <div className="phone-content">
        <div className="widget-item default-item">
          <div className="widget-select">
            <div className="widget-title">{messages('expense.type.occurrence.date')}</div>
            <div className="widget-content">{new Date().format('yyyy-MM-dd')}<Icon type="right" /></div>
          </div>
        </div>
        <div className="widget-item default-item">
          <div className="widget-budget">
            <div className="widget-title">
              {messages('common.amount')}
              <div className="widget-budget-amount"><b>CNY</b>0.00</div>
            </div>
            <div className="widget-content">
              {messages('common.expense.type')}
              <div className="plus-icon"><Icon type="plus" /></div>
            </div>
          </div>
        </div>
        {hoverIndex === 0 && isOver && <div className="insert-line"/>}
        {disabled ? this.renderWidget() : (
          <div style={{ position: 'relative' }}>
            <ListSort
              dragClassName="drag-widget-item"
              onChange={this.handleSort}
            >
              {this.renderWidget()}
            </ListSort>
          </div>
        )}
        <div className="widget-item default-item">
          <div className="widget-attachment">
            <div className="widget-title">
              {messages('common.attachments')}
              <div className="widget-attachment-count">{messages('expense.type.attachments.max')}</div>
            </div>
            <div className="widget-content">
              <div className="widget-attachment-pic">
                <Icon type="file-add" />
              </div>
            </div>
          </div>
        </div>
        <div className="widget-item default-item">
          <div className="widget-text-area">
            <div className="widget-title">{messages("common.comment")}</div>
            <div className="widget-content">
              {messages('common.please.enter')}
              <div className="widget-text-area-count">0/200</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

PhoneContent.propTypes = {
  connectDropTarget: React.PropTypes.func.isRequired,
  widgetList: React.PropTypes.array,  //组件列表，key值为上层定义的counterFlag
  onDrop: React.PropTypes.func,
  nowSelectedIndex: React.PropTypes.number,
  onSelect: React.PropTypes.func,
  onSort: React.PropTypes.func,
  onDelete: React.PropTypes.func,
  isOver: React.PropTypes.bool.isRequired,
  disabled: React.PropTypes.bool
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
