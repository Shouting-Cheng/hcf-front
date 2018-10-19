import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import { Form, Input, Switch, Button, Icon, Checkbox, Alert, message } from 'antd'
const FormItem = Form.Item;
const { TextArea } = Input;
import httpFetch from 'share/httpFetch'
import config from 'config'

import 'styles/budget-setting/budget-organization/budget-scenarios/update-budget-scenarios.scss'

class UpdateBudgetScenarios extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      enabled: true,
      loading: false
    };
  }

  componentWillMount(){
    this.setState({
      params: this.props.params,
      enabled: this.props.params.enabled
    })
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.params.flag&&!this.props.params.flag) {
      this.setState({
        params: nextProps.params,
        enabled: nextProps.params.enabled
      })
    }
  }

  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.defaultFlag = (values.defaultFlag === null ? false : values.defaultFlag);
        if (values.defaultFlag && !values.enabled) {
          message.error(formatMessage({id: "budget.scenarios.default.must.be.enabled"}/*默认预算场景的状态必须为启用*/));
          return;
        }
        values.organizationId = this.state.params.organizationId;
        values.id = this.state.params.id;
        values.versionNumber = this.state.params.versionNumber++;
        this.setState({loading: true});
        httpFetch.put(`${config.budgetUrl}/api/budget/scenarios`, values).then((res)=>{
          this.setState({loading: false});
          if(res.status === 200){
            this.props.close(true);
            message.success(formatMessage({id: "common.save.success"}, {name: ""}/*保存成功*/));
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${formatMessage({id: "common.save.filed"},/*保存失败*/)}, ${e.response.data.message}`);
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
    const { params, enabled, loading } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="update-budget-scenarios">
        <Alert message={formatMessage({id: "common.help"}/*帮助提示*/)}
               description={formatMessage({id: "budget.scenarios.help.info"}/*预算组织为当前用户所在账套下的生效的预算组织，同一账套下预算场景代码不允许重复，一个预算组织下允许多个预算场景同时生效。*/)}
               type="info" showIcon />
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.organization"}/*预算组织*/)}>
            {getFieldDecorator('organizationName', {
              rules: [{
                required: true
              }],
              initialValue: params.organizationName
            })(
              <Input disabled className="input-disabled-color"/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.scenarios.code"}/*预算场景代码*/)}>
            {getFieldDecorator('scenarioCode', {
              rules: [{
                required: true
              }],
              initialValue: params.scenarioCode
            })(
              <Input disabled className="input-disabled-color"/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.scenarios.name"}/*预算场景名称*/)}>
            {getFieldDecorator('scenarioName', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"}/*请输入*/)
              }],
              initialValue: params.scenarioName
            })(
              <Input placeholder={formatMessage({id: "common.please.enter"}/*请输入*/)} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "common.remark"}/*备注*/)}>
            {getFieldDecorator('description', {
              initialValue: params.description
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
                  <Switch defaultChecked={params.enabled}
                          checkedChildren={<Icon type="check"/>}
                          unCheckedChildren={<Icon type="cross" />}
                          onChange={this.switchChange}/>
                  <span className="enabled-type">
                  { enabled ? formatMessage({id: "common.status.enable"}/*启用*/) : formatMessage({id: "common.status.disable"}/*禁用*/) }
                </span>
                </div>
              )}
            </FormItem>
          }
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.scenarios.is.default"}/*是否默认*/)}>
            {getFieldDecorator('defaultFlag', {
              initialValue: params.defaultFlag,
              valuePropName:'checked'
            })(
              <Checkbox defaultChecked={params.defaultFlag}/>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{formatMessage({id: "common.save"}/*保存*/)}</Button>
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

const WrappedUpdateBudgetScenarios = Form.create()(UpdateBudgetScenarios);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedUpdateBudgetScenarios);
