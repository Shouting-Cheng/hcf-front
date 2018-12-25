import PropTypes from 'prop-types';
/**
 * 联动开关
 * 目前只有输入框、下拉框两种
 */
import React from 'react';
import config from 'config';
import { connect } from 'dva';
import { Form, Switch, Input, InputNumber } from 'antd';
const FormItem = Form.Item;

import Selector from 'widget/selector';
import 'styles/request/new-request/new-linkage-switch.scss';

class NewLinkageSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: {},
      enabled: false,
      fieldContent: null,
    };
  }

  componentDidMount() {
    this.setState({
      value: this.props.value,
      enabled: this.props.value.enabled,
      callBackSubmit: this.props.value.callBackSubmit,
      fieldContent: JSON.parse(this.props.value.fieldContent),
    });
  }

  componentWillReceiveProps(nextProps) {
    let { callBackSubmit } = this.state;
    if (
      nextProps.value.callBackSubmit != this.props.value.callBackSubmit ||
      nextProps.value.callBackSubmit != callBackSubmit
    ) {
      callBackSubmit = nextProps.value.callBackSubmit;
      this.setState({ callBackSubmit });
      this.formValidate(nextProps, nextProps.value.callBackSubmit);
    }
  }

  formValidate = (nextProps, callBackSubmit) => {
    let value = this.state.value;
    if (value) {
      this.props.form.validateFieldsAndScroll(err => {
        if (!err) {
          nextProps.value.isPassValid = true;
          value.isPassValid = true;
          this.onChange(this.state.value);
        } else {
          nextProps.value.isPassValid = false;
          value.isPassValid = false;
          this.onChange(this.state.value);
        }
      });
    }
  };

  handleChange = enabled => {
    let value = this.state.value;
    value.enabled = enabled;
    let fieldContent = this.state.fieldContent;
    // 开关关闭后清空数据
    if (!enabled) {
      Object.keys(fieldContent).map(key => {
        fieldContent[key].value = null;
      });
    }
    this.setState({ enabled, value, fieldContent }, () => {
      this.onChange(this.state.value);
    });
  };

  handleContentChange = (content, id) => {
    let value = this.state.value;
    let fieldContent = this.state.fieldContent;
    Object.keys(fieldContent).map(key => {
      if (fieldContent[key].id === id) {
        fieldContent[key].value = content;
      }
    });
    value.fieldContent = JSON.stringify(fieldContent);
    this.setState({ fieldContent, value }, () => {
      this.onChange(this.state.value);
    });
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { enabled, fieldContent } = this.state;
    return (
      <div className="new-linkage-switch">
        <Switch checked={enabled} onChange={this.handleChange} />
        {enabled &&
          fieldContent &&
          fieldContent.map((item, index) => {
            let selectorItem = {
              url: `${config.baseUrl}/api/custom/enumerations/${item.customEnumerationOid}`,
              label: record => record.messageKey,
              key: 'value',
              listKey: 'values',
            };
            let content;
            switch (item.fieldType) {
              case 'TEXT':
                item.id = item.id || `TEXT_${index}`;
                content = (
                  <Input
                    placeholder={item.promptInfo}
                    onChange={e => this.handleContentChange(e.target.value, item.id)}
                  />
                );
                break;
              case 'CUSTOM_ENUMERATION':
                item.id = item.id || `CUSTOM_ENUMERATION_${index}`;
                content = (
                  <Selector
                    selectorItem={selectorItem}
                    placeholder={item.promptInfo}
                    onChange={value => this.handleContentChange(value, item.id)}
                  />
                );
                break;
              //以下是为了兼容老数据
              case 'LONG':
                item.id = `LONG_${index}`;
                content = <InputNumber min={0} precision={0} style={{ width: '100%' }} />;
                break;
              case 'DOUBLE':
                item.id = `DOUBLE_${index}`;
                content = <InputNumber min={0} precision={2} style={{ width: '100%' }} />;
                break;
              default:
                item.id = `DEFAULT_${index}`;
                content = (
                  <Input
                    placeholder={item.promptInfo}
                    onChange={e => this.handleContentChange(e.target.value, item.id)}
                  />
                );
            }
            let option = {
              rules: [
                {
                  required: item.required,
                  message: this.$t('common.can.not.be.empty', { name: item.fieldName }),
                },
              ],
              initialValue:
                item.fieldType === 'CUSTOM_ENUMERATION'
                  ? item.value
                    ? { label: item.name, key: item.value }
                    : undefined
                  : item.value,
            };
            let noMaxLimitFields = ['CUSTOM_ENUMERATION', 'LONG', 'DOUBLE'];

            if (!~noMaxLimitFields.indexOf(item.fieldType)) {
              option.rules.push({
                max: 50,
                message: this.$t('common.max.characters.length', { max: 50 }),
              });
            }
            return (
              <FormItem label={item.fieldName} key={item.id}>
                {getFieldDecorator(item.id, option)(content)}
              </FormItem>
            );
          })}
      </div>
    );
  }
}

NewLinkageSwitch.propTypes = {
  value: PropTypes.object,
};

NewLinkageSwitch.defaultProps = {
  value: {},
};

function mapStateToProps() {
  return {};
}

const wrappedNewLinkageSwitch = Form.create()(NewLinkageSwitch);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewLinkageSwitch);
