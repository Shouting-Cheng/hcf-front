import React from 'react'
import { connect } from 'dva'
import { Form, Switch, Icon, Input, Select, Button, Row, Col, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import budgetGroupService from 'containers/budget-setting/budget-organization/budget-group/budget-group.service'

class NewBudgetGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budgetGroupDetail: menuRoute.getRouteItem('budget-group-detail','key'),    //项目组详情的页面项
      budgetOrganization: menuRoute.getRouteItem('budget-organization-detail', 'key'),  //预算组织详情的页面项
      loading: false
    };
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.organizationId =  this.props.organization.id;
        this.setState({loading: true});
        budgetGroupService.addOrganizationGroup(values).then((res)=>{
          this.setState({loading: false});
          message.success(`${this.$t({id:'budget.setting.item.group'})}${this.$t({id:'common.create.success'}, {name: "res.data.itemGroupName"})}`);/*项目组新建成功*/
          this.context.router.replace(this.state.budgetGroupDetail.url.replace(":id", this.props.organization.id).replace(":groupId", res.data.id));
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t({id:"common.create.filed"}/*新建失败*/)}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  render(){
    const { loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div onSubmit={this.handleSave}>
        <h3 className="header-title">{this.$t({id:'budgetGroup.new'})}{/*新建预算项目组*/}</h3>
        <div className="common-top-area">
          <Form>
            <Row gutter={40}>
              <Col span={8}>
                <FormItem label={this.$t({id:'budget.organization'})/*预算组织*/}>
                  {getFieldDecorator("organizationName", {
                    initialValue: this.props.organization.organizationName
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={this.$t({id:'budgetGroup.code'})/*'预算项目组代码'*/}>
                  {getFieldDecorator("itemGroupCode", {
                    rules: [{
                      required: true,
                      message: this.$t({id: 'common.please.enter'}),  //请输入
                    }],
                    initialValue: ''
                  })(
                    <Input placeholder={this.$t({id:'common.please.enter'})/*请输入*/}/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={this.$t({id:'budgetGroup.name'})/*'预算项目组名称'*/}>
                  {getFieldDecorator("itemGroupName", {
                    rules: [{
                      required: true,
                      message: this.$t({id: 'common.please.enter'}),  //请输入
                    }],
                    initialValue: ''
                  })(
                    <Input placeholder={this.$t({id:'common.please.enter'})/*请输入*/}/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem label="状态">
                  {getFieldDecorator('enabled', {
                    initialValue: true,
                    valuePropName: 'checked'
                  })(
                    <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/>
                  )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Button htmlType="submit" type="primary" loading={loading}>{this.$t({id:'common.save'}) /* 保存 */}</Button>
                <Button style={{ marginLeft: 8 }} onClick={() => {this.context.router.push(this.state.budgetOrganization.url.replace(":id", this.props.organization.id) + '?tab=GROUP');}}>{this.$t({id:'common.cancel'})/*取消*/}</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}


const WrappedNewBudgetGroup = Form.create()(NewBudgetGroup);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetGroup);
