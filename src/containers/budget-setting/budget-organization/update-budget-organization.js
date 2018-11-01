import React from 'react'
import { connect } from 'dva'

import { Alert, Form, Switch, Icon, Input, Select, Button, Row, Col, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import  budgetService  from 'containers/budget-setting/budget-organization/budget-organnization.service'
import 'styles/budget-setting/budget-organization/new-budget-organization.scss'

class UpdateBudgetOrganization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
    
  };

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        let params = {
          id: this.props.params.id,
          enabled: values.enabled,
          organizationCode: this.props.params.organizationCode,
          organizationName: values.organizationName,
          tenantId: this.props.params.tenantId,
          setOfBooksId: this.props.params.setOfBooksId,
          versionNumber: this.props.params.versionNumber
        };
        budgetService.updateOrganization(params).then((res)=>{
          this.setState({loading: false});
          message.success(this.$t({id: 'common.save.success'}, {name: values.organizationName}));  //保存成功
          this.props.onClose(true);
        }).catch((e)=>{
          if(e.response){
            message.error(`保存失败, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const {} = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div className="new-budget-organization">
        <Alert
          message={this.$t({id: 'common.help'})/*提示信息*/}
          description={this.$t({id: 'budget.organization.new.info'})/*同一账套下只能有一个生效的预算组织代码，且同一租户下预算组织代码不允许重复。保存后不可修改。*/}
          type="info"
          showIcon
        />
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({id: 'budget.organization.set.of.books'})/* 账套 */}>
            {getFieldDecorator('setOfBooksName', {
              rules: [{
                required: true
              }],
              initialValue: this.props.params.setOfBooksName
            })(
              <Select disabled/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: 'budget.organization.code'})/* 预算组织代码 */}>
            {getFieldDecorator('organizationCode', {
              rules: [{
                required: true
              }],
              initialValue: this.props.params.organizationCode
            })(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: 'budget.organization.name'})/* 预算组织名称 */}>
            {getFieldDecorator('organizationName', {
              rules: [{
                required: true,
                message: this.$t({id: 'common.please.enter'}),  //请输入
              }],
              initialValue: this.props.params.organizationName
            })(
              <Input placeholder={this.$t({id: 'common.please.enter'})/* 请输入 */}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: 'common.column.status'})/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: this.props.params.enabled,
              valuePropName: 'checked'
            })(
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/>
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({id: 'common.save'})/* 保存 */}</Button>
            <Button onClick={this.onCancel}>{this.$t({id: 'common.cancel'})/* 取消 */}</Button>
          </div>
        </Form>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}
const WrappedUpdateBudgetOrganization = Form.create()(UpdateBudgetOrganization);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedUpdateBudgetOrganization);
