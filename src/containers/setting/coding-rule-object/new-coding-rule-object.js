import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'

import codingRuleService from './coding-rule.service'
import { routerRedux } from 'dva/router';


import { Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
// import menuRoute from 'routes/menuRoute'
import Chooser from 'widget/chooser'
class NewCodingRuleObject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      documentCategoryOptions: [],
      // codingRuleObject: menuRoute.getRouteItem('coding-rule-object', 'key'),
      // codingRule: menuRoute.getRouteItem('coding-rule', 'key')
    };
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if (values.company && values.company.length > 0)
          values.companyCode = values.company[0].companyCode;
        codingRuleService.addCodingRuleObject(values).then((res) => {
          this.setState({ loading: false });
          message.success(messages('common.create.success', { name: '' }));  //新建成功

          this.props.dispatch(routerRedux.push({
            pathname: "/admin-setting/coding-rule/" + res.data.id
          }))

          // this.context.router.push(this.state.codingRule.url.replace(':id', res.data.id));
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
    this.getSystemValueList(2023).then(res => {
      this.setState({ documentCategoryOptions: res.data.values })
    });
  }

  cancel = () => {
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/coding-rule-object"
    }))
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const { documentCategoryOptions, loading, codingRuleObject } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div>
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={messages('code.rule.document.type')/*单据类型'*/}>
            {getFieldDecorator('documentTypeCode', {
              rules: [{
                required: true,
                message: messages('common.please.select')  //请选择
              }]
            })(
              <Select placeholder={messages('common.please.select')/* 请选择 */} notFoundContent={<Spin size="small" />}>
                {documentCategoryOptions.map(option => {
                  return <Option key={option.value}>{option.name}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('code.rule.apply.company')/*应用公司*/}>
            {getFieldDecorator('company')(
              <Chooser single={true} type="enabled_company" labelKey="name" valueKey="companyCode" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('common.column.status')/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: true,
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

function mapStateToProps(state) {
  return {
  }
}

const WrappedNewCodingRuleObject = Form.create()(NewCodingRuleObject);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewCodingRuleObject);
