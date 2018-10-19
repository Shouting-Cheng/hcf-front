import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import { Form, Input, Switch, Button, Icon, Checkbox, Alert, message } from 'antd'
const FormItem = Form.Item;
const { TextArea } = Input;
import httpFetch from 'share/httpFetch'
import config from 'config'

import 'styles/budget-setting/budget-organization/budget-scenarios/new-budget-scenarios.scss'

class NewBudgetScenarios extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      enabled: true,
      organizationName: '',
      loading: false
    };
  }

  componentDidMount(){
    this.setState({
      organizationName: this.props.params.organizationName
    })
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.params.flag&&!this.props.params.flag){
      this.setState({
        organizationName: nextProps.params.organizationName,
        enabled: true
      })
    }
  }

  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.organizationId = this.props.params.organizationId;
        if (values.defaultFlag && !values.enabled) {
          message.error(formatMessage({id: "budget.scenarios.default.must.be.enabled"}/*默认预算场景的状态必须为启用*/));
          return false;
        }
        this.setState({loading: true});
        httpFetch.post(`${config.budgetUrl}/api/budget/scenarios`, values).then((res)=>{
          this.setState({loading: false});
          if(res.status === 200){
            this.props.close(true);
            this.props.form.resetFields();
            message.success(formatMessage({id: "common.create.success"}, {name: ""})/*新建成功*/);
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${formatMessage({id: "common.create.filed"}/*新建失败*/)}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  onCancel = () =>{
    this.props.form.resetFields();
    this.props.close();
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { enabled, organizationName } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-budget-scenarios">
        <Alert message={formatMessage({id: "common.help"}/*帮助提示*/)}
               description={formatMessage({id: "budget.scenarios.help.info"}/*预算组织为当前用户所在账套下的生效的预算组织，同一账套下预算场景代码不允许重复，一个预算组织下允许多个预算场景同时生效。*/)}
               type="info"
               showIcon />
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.organization"}/*预算组织*/)}>
            {getFieldDecorator('organizationName', {
              rules: [{
                required: true
              }],
              initialValue: organizationName
            })(
              <Input disabled className="input-disabled-color"/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.scenarios.code"}/*预算场景代码*/)}>
            {getFieldDecorator('scenarioCode', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"}/*请输入*/)
              }],
              initialValue: ''
            })(
              <Input placeholder={formatMessage({id: "common.please.enter"}/*请输入*/)} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.scenarios.name"}/*预算场景名称*/)}>
            {getFieldDecorator('scenarioName', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"}/*请输入*/)
              }],
              initialValue: ''
            })(
              <Input placeholder={formatMessage({id: "common.please.enter"}/*请输入*/)} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "common.remark"}/*备注*/)}>
            {getFieldDecorator('description', {
              initialValue: ''
            })(
              <TextArea autosize={{minRows: 2}}
                        style={{minWidth:'100%'}}
                        placeholder={formatMessage({id: "common.please.enter"}/*请输入*/)}/>
            )}
          </FormItem>
          {
            this.props.params.flag &&
            <FormItem {...formItemLayout} label={formatMessage({id: "common.column.status"}/*状态*/)}>
              {getFieldDecorator('enabled', {
                initialValue: enabled
              })(
                <div>
                  <Switch defaultChecked={true} checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                  <span className="enabled-type">
                  { enabled ? formatMessage({id: "common.status.enable"}/*启用*/) : formatMessage({id: "common.status.disable"}/*禁用*/) }
                </span>
                </div>
              )}
            </FormItem>
          }
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.scenarios.is.default"}/*是否默认*/)}>
            {getFieldDecorator('defaultFlag', {
              initialValue: false,
              valuePropName:'checked'
            })(
              <Checkbox/>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{formatMessage({id: "common.save"}/*保存*/)}</Button>
            <Button onClick={this.onCancel}>{formatMessage({id: "common.cancel"}/*取消*/)}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

const WrappedNewBudgetScenarios = Form.create()(NewBudgetScenarios);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetScenarios);
