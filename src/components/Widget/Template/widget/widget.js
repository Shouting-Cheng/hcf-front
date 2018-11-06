import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Icon, Switch } from 'antd';
import 'styles/components/template/drag-widget-page/widget-item.scss';
// todo
// 组件的使用示例
// 国际化
/**
 * 组件类型
 */
class Widget extends React.Component {
  constructor(props) {
    super(props);
  }

  renderWidget = widget => {
    switch (widget.messageKey) {
      case 'input':
      case 'number':
      case 'contact_bank_account':
      case 'destination':
      case 'select_special_booking_person':
      case 'total_budget':
      case 'external_participant_name':
      case 'out_participant_num':
        return (
          <div className="widget-input">
            <div className="widget-title">{this.getFieldName(widget)}</div>
            <div className="widget-content">
              {widget.promptInfo || this.$t('common.please.enter')}
            </div>
          </div>
        );
      case 'text_area':
      case 'remark':
        return (
          <div className="widget-text-area">
            <div className="widget-title">{this.getFieldName(widget)}</div>
            <div className="widget-content">
              {widget.promptInfo || this.$t('common.please.enter')}
              <div className="widget-text-area-count">0/200</div>
            </div>
          </div>
        );
      case 'title':
        return (
          <div className="widget-text-area">
            <div className="widget-title">{this.getFieldName(widget)}</div>
            <div className="widget-content">
              {widget.promptInfo || this.$t('common.please.enter')}
              <div className="widget-text-area-count">0/50</div>
            </div>
          </div>
        );
      case 'select_box':
      case 'cust_list':
      case 'currency_code':
      case 'time':
      case 'select_cost_center':
      case 'select_department':
      case 'select_corporation_entity':
      case 'common.date':
      case 'dateTime':
      case 'date':
      case 'employee_expand':
      case 'select_company':
      case 'venMaster':
      case 'select_air_ticket_supplier':
      case 'payee':
      case 'start_date':
      case 'end_date':
        return (
          <div className="widget-select">
            <div className="widget-title">{this.getFieldName(widget)}</div>
            <div className="widget-content">
              {widget.promptInfo || this.$t('common.please.select')}
              <Icon type="right" />
            </div>
          </div>
        );
      case 'attachment':
      case 'image':
        return (
          <div className="widget-attachment">
            <div className="widget-title">
              {this.getFieldName(widget)}
              {widget.constraintRule && (
                <div className="widget-attachment-count">
                  {this.$t('widget.field.max.picture', {
                    num: JSON.parse(widget.constraintRule.replace(/\\/g,"")).maxNumber,
                  }) /*最多可上传张图片*/}
                </div>
              )}
            </div>
            <div className="widget-content">
              <div className="widget-attachment-pic">
                <Icon type="file-add" />
              </div>
            </div>
          </div>
        );
      case 'switch':
      case 'writeoff_flag':
        return (
          <div className="widget-switch">
            <div className="widget-title">
              {this.getFieldName(widget)}
              <Switch defaultChecked />
            </div>
          </div>
        );
      case 'select_user':
      case 'select_participant':
        return (
          <div className="widget-user">
            <div className="widget-title">
              {this.getFieldName(widget)}
              <div className="widget-user-count">
                {this.$t('widget.field.total.num') /*总人数*/}
                <b>1</b>
              </div>
            </div>
            <div className="widget-content">
              <div className="widget-user-item">
                <div className="plus-border">
                  <Icon type="plus" />
                </div>
                <div className="widget-user-add">{widget.promptInfo || this.$t('common.add')}</div>
              </div>
            </div>
          </div>
        );
      case 'linkage_switch':
        let childField = widget.fieldContent ? JSON.parse(widget.fieldContent) : [];
        return (
          <div className="widget-switch">
            <div className="widget-title">
              {this.getFieldName(widget)}
              <Switch defaultChecked />
            </div>
            <div className="widget-content">
              {childField.map((field, index) => {
                return (
                  <div key={index}>
                    <div className="field-title">{field.fieldName}</div>
                    <div
                      className={`field-input ${index !== childField.length - 1 && 'has-border'}`}
                    >
                      {field.promptInfo ||
                        this.$t(`common.please.${field.fieldType === 'TEXT' ? 'enter' : 'select'}`)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'exp_allocate':
        return (
          <div className="widget-allocate">
            <div className="widget-title">
              {this.getFieldName(widget)}
              <Icon type="right" />
            </div>
          </div>
        );
      case 'budget_detail':
        return (
          <div className="widget-budget">
            <div className="widget-title">
              {this.getFieldName(widget)}
              <div className="widget-budget-amount">
                {this.$t('widget.field.total.amount') /*总计*/}
                <b>CNY</b>0.00
              </div>
            </div>
            <div className="widget-content">
              {widget.promptInfo || this.$t('widget.field.add.expense.type') /*添加类型及金额*/}
              <div className="plus-icon">
                <Icon type="plus" />
              </div>
            </div>
          </div>
        );
      case 'form.description':
        return (
          <div className="widget-description">
            <div className="widget-title">
              <span>{widget.title}</span>
              <div>{widget.enable ? this.$t('common.enabled') : this.$t('common.disabled')}</div>
            </div>
          </div>
        );
      default:
        return widget.fieldName;
    }
  };

  getFieldName = widget => {
    let result = widget.fieldName || widget.name;
    widget.customFormFieldI18nDTOS &&
      widget.customFormFieldI18nDTOS.map(i18nDTO => {
        if (i18nDTO.language.toLowerCase() === this.props.language.code) result = i18nDTO.fieldName;
      });
    return result;
  };

  render() {
    const { widget, width, className, onClick } = this.props;
    return (
      <div className={`widget-item ${className}`} style={{ width }} onClick={onClick}>
        {this.renderWidget(widget)}
      </div>
    );
  }
}

Widget.propTypes = {
  onClick: PropTypes.func,
  widget: PropTypes.object,
  width: PropTypes.any,
  className: PropTypes.string,
};

Widget.defaultProps = {
  className: '',
  onClick: () => {},
};

function mapStateToProps(state) {
  return {
    language: state.languages.languages,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(Widget);
