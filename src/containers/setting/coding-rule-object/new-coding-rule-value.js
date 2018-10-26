import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'

import codingRuleService from './coding-rule.service'
import { Form, Switch, InputNumber, Input, Select, Button, message, Spin, Icon } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
class NewCodingRuleValue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      paramsNameOptions: [],
      dataFormatOptions: []
    };
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.codingRuleId = this.props.params.codingRuleId;
        if (this.props.params.nowCodingRuleValue) {
          values.id = this.props.params.nowCodingRuleValue.id;
          values.versionNumber = this.props.params.nowCodingRuleValue.versionNumber;
        }
        this.setState({ loading: true });
        let method = this.props.params.nowCodingRuleValue ? 'updateCodingRuleValue' : 'addCodingRuleValue';
        codingRuleService[method](values).then((res) => {
          this.setState({ loading: false });
          message.success(messages('common.create.success', { name: '' }));  //新建成功
          this.props.close(true);
          this.props.form.resetFields();
        }).catch((e) => {
          if (e.response) {
            message.error(`${messages('common.create.filed')/*新建失败*/}, ${e.response.data.message}`);
          }
          this.setState({ loading: false });
        })
      }
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.nowCodingRuleValue === this.props.nowCodingRuleValue) {
      return;
    } else {
      if (!nextProps.nowCodingRuleValue) {
        this.props.form.resetFields();
      }
    }
  }

  componentWillMount() {
    this.getSystemValueList(2025).then(res => {
      this.setState({ paramsNameOptions: res.data.values })
    });
    this.getSystemValueList(2026).then(res => {
      this.setState({ dataFormatOptions: res.data.values })
    });
  }

  handleCancel = () => {
    this.props.form.resetFields();
    this.props.close();
  };

  renderItems = () => {

    const { getFieldDecorator } = this.props.form;
    const { dataFormatOptions } = this.state;
    let segmentType = this.props.form.getFieldValue('segmentType');
    let result;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    switch (segmentType) {
      case '10':
        result = (
          <FormItem {...formItemLayout} label={messages('code.rule.value.fixed.character')/*固定字符*/}>
            {getFieldDecorator('segmentValue', {
              rules: [{
                required: true,
                pattern: /^[A-Za-z]+$/,
                message: messages('code.rule.value.required.and.only.in.english') //必输且只能输入英文
              }],
              initialValue: this.props.params.nowCodingRuleValue ? this.props.params.nowCodingRuleValue.segmentValue : ''
            })(
              <Input />
              )}
          </FormItem>
        );
        break;
      case '20':
        result = (
          <FormItem {...formItemLayout} label={messages('code.rule.value.date.format')/*日期格式*/}>
            {getFieldDecorator('dateFormat', {
              rules: [{
                required: true,
                message: messages('common.please.select')  //请输入
              }],
              initialValue: this.props.params.nowCodingRuleValue ? this.props.params.nowCodingRuleValue.dateFormat : null
            })(
              <Select placeholder={messages('common.please.select')/* 请选择 */} notFoundContent={<Spin size="small" />}>
                {dataFormatOptions.map((option) => {
                  return <Option key={option.code}>{option.messageKey}</Option>
                })}
              </Select>
              )}
          </FormItem>
        );
        break;
      case '30':
        result = null;
        break;
      case '40':
        result = null;
        break;
      case '50':
        result = (
          <div>
            <FormItem {...formItemLayout} label={messages('code.rule.value.digit')/*位数*/}>
              {getFieldDecorator('length', {
                rules: [{
                  required: true,
                  message: messages('common.please.enter')  //请输入
                }],
                initialValue: this.props.params.nowCodingRuleValue ? this.props.params.nowCodingRuleValue.length : 4
              })(
                <InputNumber min={1} />
                )}
            </FormItem>
            <FormItem {...formItemLayout} label={messages('code.rule.value.step.length')/*步长*/}>
              {getFieldDecorator('incremental', {
                rules: [{
                  required: true,
                  message: messages('common.please.enter')  //请输入
                }],
                initialValue: this.props.params.nowCodingRuleValue ? this.props.params.nowCodingRuleValue.incremental : 1
              })(
                <InputNumber min={1} />
                )}
            </FormItem>
            <FormItem {...formItemLayout} label={messages('code.rule.value.start.value')/*开始值*/}>
              {getFieldDecorator('startValue', {
                rules: [{
                  required: true,
                  message: messages('common.please.enter')  //请输入
                }],
                initialValue: this.props.params.nowCodingRuleValue ? this.props.params.nowCodingRuleValue.startValue : 1
              })(
                <InputNumber min={1} />
                )}
            </FormItem>
          </div>
        );
        break;
      default:
        result = null;
    }
    return result;
  };

  render() {

    const { getFieldDecorator } = this.props.form;
    const { loading, paramsNameOptions } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div>
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={messages('code.rule.value.sequence.number')/*顺序号*/}>
            {getFieldDecorator('sequence', {
              rules: [{
                required: true,
                message: messages('common.please.enter')  //请输入
              }],
              initialValue: this.props.params.nowCodingRuleValue ? this.props.params.nowCodingRuleValue.sequence : this.props.params.nowSequence
            })(
              <InputNumber min={1} />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('code.rule.value.parameter.name')/*参数名称*/}>
            {getFieldDecorator('segmentType', {
              rules: [{
                required: true,
                message: messages('common.please.select')  //请选择
              }],
              initialValue: this.props.params.nowCodingRuleValue ? this.props.params.nowCodingRuleValue.segmentType : ''
            })(
              <Select placeholder={messages('common.please.select')/* 请选择 */} notFoundContent={<Spin size="small" />}>
                {paramsNameOptions.map((option) => {
                  return <Option key={option.code}>{option.messageKey}</Option>
                })}
              </Select>
              )}
          </FormItem>
          {this.renderItems()}
          <FormItem {...formItemLayout} label={messages('common.column.status')/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: this.props.params.nowCodingRuleValue ? !!this.props.params.nowCodingRuleValue.enabled : true,
              valuePropName: 'checked'
            })(
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />
              )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{messages('common.save')/* 保存 */}</Button>
            <Button onClick={this.handleCancel}>{messages('common.cancel')/* 取消 */}</Button>
          </div>
        </Form>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}

const WrappedNewCodingRuleValue = Form.create()(NewCodingRuleValue);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewCodingRuleValue);
