import React from 'react'
import { connect } from 'dva'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { Form, Input, Switch, message, Icon, Button } from 'antd'
const FormItem = Form.Item;

import 'styles/budget-setting/budget-organization/budget-strategy/new-budget-strategy.scss'
import * as routerRedux from "react-router-redux";

class NewBudgetStrategy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
    };
  }

  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.organizationId = this.props.params.id;
        httpFetch.post(`${config.budgetUrl}/api/budget/control/strategies`, values).then((res)=>{
          if(res.status === 200){
            this.setState({loading: false});
            message.success(this.$t({id: "common.create.success"}, {name: ""})/*新建成功*/);
            this.props.dispatch(
              routerRedux.replace({
                pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-strategy/budget-strategy-detail/:setOfBooksId/:orgId/:id'
                  .replace(':orgId', this.props.organization.id)
                  .replace(':setOfBooksId',this.props.setOfBooksId)
                  .replace(':id', res.data.id)
              })
            );
          }
        }).catch((e)=>{
          this.setState({loading: false});
          if(e.response){
            message.error(`${this.$t({id: "common.create.filed"}/*新建失败*/)}, ${e.response.data.message}`);
          }
        })
      }
    });
  };

  handleCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
          .replace(':id', this.props.match.params.orgId)
          .replace(":setOfBooksId",this.props.match.params.setOfBooksId)
          .replace(':tab','STRATEGY')
      })
    );
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { enabled } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-budget-strategy">
        <Form onSubmit={this.handleSave} style={{width:'55%',margin:'0 auto'}}>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.strategy.code"}/*预算控制策略代码*/)} hasFeedback>
            {getFieldDecorator('controlStrategyCode', {
              rules: [{
                required: true,
                message: this.$t({id: "common.please.enter"}/*请输入*/),
              }],
              initialValue: ''
            })(
              <Input placeholder={this.$t({id: "common.please.enter"}/*请输入*/)} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.strategy.name"}/*预算控制策略名称*/)} hasFeedback>
            {getFieldDecorator('controlStrategyName', {
              rules: [{
                required: true,
                message: this.$t({id: "common.please.enter"}/*请输入*/),
              }],
              initialValue: ''
            })(
              <Input placeholder={this.$t({id: "common.please.enter"}/*请输入*/)} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "common.column.status"}/*状态*/)}>
            {getFieldDecorator('enabled', {
              initialValue: enabled
            })(
              <div>
                <Switch defaultChecked={true} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                <span className="enabled-type">
                  {enabled ? this.$t({id: "common.status.enable"}/*启用*/) : this.$t({id: "common.status.disable"}/*禁用*/)}
                </span>
              </div>
            )}
          </FormItem>
          <FormItem wrapperCol={{ offset: 7 }}>
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({id: "common.save"}/*保存*/)}</Button>
            <Button onClick={this.handleCancel} style={{marginLeft: 20}} className="btn-cancel">{this.$t({id: "common.cancel"}/*取消*/)}</Button>
          </FormItem>
        </Form>
      </div>
    )
  }

}


function mapStateToProps() {
  return {}
}

const WrappedNewBudgetStrategy = Form.create()(NewBudgetStrategy);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetStrategy);

