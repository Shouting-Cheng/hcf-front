import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'

import codingRuleService from './coding-rule.service'
import { Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import { routerRedux } from 'dva/router';

class NewCodingRule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      resetFrequenceOptions: [],
      // codingRuleValue: menuRoute.getRouteItem('coding-rule-value'),
      // codingRule: menuRoute.getRouteItem('coding-rule')
    };
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        values.codingRuleObjectId = this.props.match.params.id;
        codingRuleService.addCodingRule(values).then((res) => {
          this.setState({ loading: false });
          message.success(messages('common.create.success', { name: '' }));  //新建成功

          this.props.dispatch(routerRedux.push({
            pathname: "/admin-setting/coding-rule-value/" + this.props.match.params.id + "/" + res.data.id
          }));

        }).catch((e) => {
          if (e.response) {
            message.error(`${messages('common.create.filed')/*新建失败*/}, ${e.response.data.message}`);
          }
          this.setState({ loading: false });
        })
      }
    });
  };

  componentWillMount() {
    this.getSystemValueList(2024).then(res => {
      console.log(res)
      this.setState({ resetFrequenceOptions: res.data.values })
    });
  }

  cancel = () => {
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/coding-rule/" + this.props.match.params.id
    }))
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const { resetFrequenceOptions, loading, codingRule } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div>
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={messages('code.rule.code')/*编码规则代码*/}>
            {getFieldDecorator('codingRuleCode', {
              rules: [{
                required: true,
                message: messages('common.please.enter')  //请输入
              }]
            })(
              <Input placeholder={messages('common.please.enter')/* 请输入 */} />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('code.rule.name')/*编码规则名称*/}>
            {getFieldDecorator('codingRuleName', {
              rules: [{
                required: true,
                message: messages('common.please.enter')  //请输入
              }]
            })(
              <Input placeholder={messages('common.please.enter')/* 请输入 */} />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('code.rule.reset.frequency')/*重置频率*/}>
            {getFieldDecorator('resetFrequence', {
              rules: [{
                required: true,
                message: messages('common.please.select')  //请选择
              }]
            })(
              <Select placeholder={messages('common.please.select')/* 请选择 */} notFoundContent={<Spin size="small" />}>
                {resetFrequenceOptions.map((option) => {
                  return <Option key={option.value}>{option.name}</Option>
                })}
              </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('code.rule.remark')/*备注*/}>
            {getFieldDecorator('remark')(
              <Input placeholder={messages('common.please.enter')/* 请输入 */} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('common.column.status')/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: false,
              valuePropName: 'checked'
            })(
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />
              )}
          </FormItem>
          <FormItem wrapperCol={{ offset: 7 }}>
            <Row gutter={1}>
              <Col span={3}><Button type="primary" htmlType="submit" loading={loading}>{messages('common.save')/* 保存 */}</Button></Col>
              <Col span={3}><Button onClick={this.cancel}>{messages('common.cancel')/* 取消 */}</Button></Col>
            </Row>
          </FormItem>
        </Form>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}

const WrappedNewCodingRule = Form.create()(NewCodingRule);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewCodingRule);
