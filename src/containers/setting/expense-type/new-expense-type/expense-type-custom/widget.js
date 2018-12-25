import React from 'react'
import { Icon, Switch, Row, Col } from 'antd'
import 'styles/components/template/drag-widget-page/widget-item.scss'
import { messages } from 'utils/utils'
import PropTypes from 'prop-types';

/**
 * 费用组件类型
 */
class Widget extends React.Component{
  constructor(props) {
    super(props);
  }

  renderWidget = (widget) => {
    switch(widget.fieldType){
      case 'TEXT':
      case 'LONG':
      case 'DOUBLE':
      case 'POSITIVE_INTEGER':
        if(widget.customEnumerationOid){
          return (
            <div className="widget-input widget-select">
              <div className="widget-title">{widget.name}</div>
              <div className="widget-content">{messages("common.please.select")}<Icon type="right" /></div>
            </div>
          )
        } else if(widget.messageKey === 'dateCombined'){
          return (
            <div className="widget-date-range">
              <div className="date-line"/>
              <Row>
                <div className="date-icon">
                  <Icon type="calendar" />
                </div>
                <Col span={12}>{messages('expense.type.start.date')}</Col>
                <Col span={12}>{messages('expense.type.end.date')}</Col>
              </Row>
            </div>
          )
        } else {
          return (
            <div className="widget-input widget-select">
              <div className="widget-title">{widget.name}</div>
              <div className="widget-content">{messages("common.please.enter")}</div>
            </div>
          )
        }
      case 'CUSTOM_ENUMERATION':
      case 'DATETIME':
      case 'DATE':
      case 'GPS':
      case 'LOCATION':
      case 'MONTH':
        return (
          <div className="widget-select">
            <div className="widget-title">{widget.name}</div>
            <div className="widget-content">{messages("common.please.select")}<Icon type="right" /></div>
          </div>
        );
      case 'BOOLEAN':
        return (
          <div className="widget-switch">
            <div className="widget-title">{widget.name}<Switch defaultChecked/></div>
          </div>
        );
      case 'PARTICIPANTS':
      case 'PARTICIPANT':
        return (
          <div className="widget-user">
            <div className="widget-title">
              {widget.name}
              <div className="widget-user-count">{messages('expense.type.total.person')}<b>1</b></div>
            </div>
            <div className="widget-content">
              <div className="widget-user-item">
                <div className="plus-border">
                  <Icon type="plus" />
                </div>
                <div className="widget-user-add">
                  {messages("common.add")}
                </div>
              </div>
            </div>
          </div>
        );
      case 'START_DATE_AND_END_DATE':
        return (
          <div className="widget-date-range">
            <div className="date-line"/>
            <Row>
              <div className="date-icon">
                <Icon type="calendar" />
              </div>
              <Col span={12}>{messages('expense.type.start.date')}</Col>
              <Col span={12}>{messages('expense.type.end.date')}</Col>
            </Row>
          </div>
        );
      default:
        return widget.name
    }
  };

  render() {
    const { widget, width, className } = this.props;
    return (
      <div className={`widget-item ${className}`} style={{ width }}>
        {this.renderWidget(widget)}
      </div>
    )
  }
}

Widget.propTypes = {
  widget: PropTypes.object,
  width: PropTypes.any,
  className: PropTypes.string
};

export default Widget
