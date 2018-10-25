import React from 'react'
import httpFetch from 'share/httpFetch';

import config from 'config'
import { connect } from 'dva'

import { Alert, Form, Switch, Icon, Input, Select, Button, Row, Col, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;


import budgetOrganizationService from 'containers/budget-setting/budget-organization/budget-organnization.service'
import 'styles/budget-setting/budget-organization/new-budget-organization.scss'

class UpdateBudgetParameterSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      statusOptions: [],
    };
  }



  componentWillMount() {
    if (this.props.params.parameterId) {
      this.getStatusOptions();
    }
    // this.setState({
    //   version: this.props.params,
    // })
  }
  getStatusOptions() {
    httpFetch.get(`${config.budgetUrl}/api/budget/parameterSettings/parameterValues/${this.props.params.parameterId}`).then(res => { //状态
      let statusOptions = res.data || [];
      this.setState({
        statusOptions
      })
    })
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        let params = {
          id: this.props.params.id,
          enabled: values.enabled,
          parameterCode: this.props.params.parameterCode,
          parameterValueCode: values.parameterValueCode,
          tenantId: this.props.params.tenantId,
          setOfBooksId: this.props.params.setOfBooksId,
          versionNumber: this.props.params.versionNumber
        };
        budgetOrganizationService.updateParameterSetting(params).then((res)=>{
          this.setState({loading: false});
          message.success(this.$t('common.save.success', {name: ''}));  //保存成功
          this.props.close(true);
        }).catch((e) => {
          if (e.response) {
            message.error(`${this.$t('common.save.filed')}, ${e.response.data.message}`);
          }
          this.setState({ loading: false });
        })
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { statusOptions } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div className="new-budget-organization">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({ id: 'budget.parameterCode' })/* 参数代码 */}>
            {getFieldDecorator('parameterCode', {
              rules: [{
                required: true
              }],
              initialValue: this.props.params.parameterCode
            })(
              <Input disabled />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'budget.parameterName' })/* 参数名称 */}>
            {getFieldDecorator('parameterName', {
              rules: [{
                required: true
              }],
              initialValue: this.props.params.parameterName
            })(
              <Input disabled />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'budget.parameterValueName' })/* 参数值名称 */}>
            {getFieldDecorator('parameterValueCode', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.enter' }),  //请输入
              }],
              initialValue: this.props.params.parameterValueCode
            })(
              <Select placeholder={this.$t({ id: "common.please.select" })}>
                {statusOptions.map((option) => {
                  return <Option key={option.parameterValueCode}>{option.parameterValueName}</Option>
                })}
              </Select>
              )}
          </FormItem>



          {/* 状态 */}
          {/* <FormItem {...formItemLayout} label={this.$t({id: 'common.column.status'})}>
           {getFieldDecorator('enabled', {
           initialValue: this.props.params.enabled,
           valuePropName: 'checked'
           })(
           <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/>
           )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})}
           </FormItem> */}
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({ id: 'common.save' })/* 保存 */}</Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })/* 取消 */}</Button>
          </div>
        </Form>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}
const WrappedUpdateBudgetParameterSetting = Form.create()(UpdateBudgetParameterSetting);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedUpdateBudgetParameterSetting);
