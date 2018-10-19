import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import menuRoute from 'routes/menuRoute'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { Form, Input, Switch, message, Icon, Button } from 'antd'
const FormItem = Form.Item;

import 'styles/budget-setting/budget-organization/budget-strategy/new-budget-strategy.scss'

class NewBudgetStrategy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      budgetOrganizationDetail:  menuRoute.getRouteItem('budget-organization-detail','key'),    //预算组织详情
      budgetStrategyDetail:  menuRoute.getRouteItem('budget-strategy-detail','key'),    //预算控制策略详情
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
            message.success(formatMessage({id: "common.create.success"}, {name: ""})/*新建成功*/);
            this.context.router.push(this.state.budgetStrategyDetail.url.replace(':id', this.props.params.id).replace(':strategyId', res.data.id).replace(":setOfBooksId",this.props.params.setOfBooksId));
          }
        }).catch((e)=>{
          this.setState({loading: false});
          if(e.response){
            message.error(`${formatMessage({id: "common.create.filed"}/*新建失败*/)}, ${e.response.data.message}`);
          }
        })
      }
    });
  };

  handleCancel = () => {
    this.context.router.push(this.state.budgetOrganizationDetail.url.replace(':id', this.props.params.id).replace(":setOfBooksId",this.props.params.setOfBooksId) + '?tab=STRATEGY');
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
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.strategy.code"}/*预算控制策略代码*/)} hasFeedback>
            {getFieldDecorator('controlStrategyCode', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"}/*请输入*/),
              }],
              initialValue: ''
            })(
              <Input placeholder={formatMessage({id: "common.please.enter"}/*请输入*/)} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.strategy.name"}/*预算控制策略名称*/)} hasFeedback>
            {getFieldDecorator('controlStrategyName', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"}/*请输入*/),
              }],
              initialValue: ''
            })(
              <Input placeholder={formatMessage({id: "common.please.enter"}/*请输入*/)} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "common.column.status"}/*状态*/)}>
            {getFieldDecorator('enabled', {
              initialValue: enabled
            })(
              <div>
                <Switch defaultChecked={true} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                <span className="enabled-type">
                  {enabled ? formatMessage({id: "common.status.enable"}/*启用*/) : formatMessage({id: "common.status.disable"}/*禁用*/)}
                </span>
              </div>
            )}
          </FormItem>
          <FormItem wrapperCol={{ offset: 7 }}>
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{formatMessage({id: "common.save"}/*保存*/)}</Button>
            <Button onClick={this.handleCancel} className="btn-cancel">{formatMessage({id: "common.cancel"}/*取消*/)}</Button>
          </FormItem>
        </Form>
      </div>
    )
  }

}

NewBudgetStrategy.contextTypes={
  router:React.PropTypes.object
};

function mapStateToProps() {
  return {}
}

const WrappedNewBudgetStrategy = Form.create()(NewBudgetStrategy);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetStrategy);

