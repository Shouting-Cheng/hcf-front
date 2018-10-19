/**
 * created by jsq on 2017/12/27
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Input, Switch, Form, Icon,message, Select } from 'antd'
import httpFetch from 'share/httpFetch';
import config from 'config'
import 'styles/financial-accounting-setting/accounting-scenarios-system/new-update-scenarios-system.scss'
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios.service';
const FormItem = Form.Item;
import {formatMessage} from 'share/common'

class NewUpdateAccountingScenarios extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      scenarios: {},
      section: {}
    }
  }

  componentWillMount(){
    this.setState({
      scenarios: this.props.params,
      enabled: this.props.params.enabled
    })
  }

  componentWillReceiveProps(nextprops){
    if(nextprops.params.versionNumber!==this.props.params.versionNumber){
      this.setState({scenarios:nextprops.params})
    }
  }

  handleSubmit = (e)=> {
    e.preventDefault();
    this.setState({loading: true,});
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err){
        values.id = this.state.scenarios.id;
        values.versionNumber = this.state.scenarios.versionNumber;
        values.setOfBooksId = this.state.scenarios.setOfBooksId;
        accountingService.addOrUpdateScenarios([values]).then(response=>{
          message.success(`${formatMessage({id:"common.operate.success"})}`);
          this.props.form.resetFields();
          this.props.close(true);
        }).catch(e=>{
          if(e.response){
            if(typeof this.state.scenarios.id === 'undefined' )
              message.error(`${formatMessage({id: "common.operate.filed"})}, ${e.response.data.message}`);
          }
        })
      }
    })
  };

  onCancel = ()=>{
    this.props.form.resetFields();
    this.props.close(false)
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { loading, scenarios, enabled } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };

    return(
      <div className="new-update-accounting-source">
        <Form onSubmit={this.handleSubmit} className="accounting-source-form">
          <FormItem {...formItemLayout} label={formatMessage({id:'section.setOfBook'})  /*账套*/}>
            {getFieldDecorator('setOfBooksId', {
              initialValue: scenarios.setOfBooksName,
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }]
            })(
              <Select disabled={true} placeholder={formatMessage({id:"common.please.select"})}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id:'accounting.scenarios.code'})  /*核算场景代码*/}>
            {getFieldDecorator('transactionSceneCode', {
              initialValue: scenarios.transactionSceneCode,
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }]
            })(
              <Input disabled={true} placeholder={formatMessage({id:"common.please.enter"})}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id:'accounting.scenarios.name'})  /*核算场景名称*/}>
            {getFieldDecorator('transactionSceneName', {
              initialValue: scenarios.transactionSceneName,
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }]
            })(
              <Input disabled={true} placeholder={formatMessage({id:"common.please.enter"})}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout}
                    label={formatMessage({id:"common.column.status"})} colon={true}>
            {getFieldDecorator('enabled', {
              valuePropName:"checked",
              initialValue: enabled
            })(
              <div>
                <Switch defaultChecked={enabled}  checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                <span className="enabled-type" style={{marginLeft:20,width:100}}>{ enabled ? formatMessage({id:"common.status.enable"}) : formatMessage({id:"common.disabled"}) }</span>
              </div>)}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit"  loading={loading}>{formatMessage({id:"common.save"})}</Button>
            <Button onClick={this.onCancel}>{formatMessage({id:"common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
  }
}

const WrappedNewUpdateAccountingScenarios = Form.create()(NewUpdateAccountingScenarios);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateAccountingScenarios);
