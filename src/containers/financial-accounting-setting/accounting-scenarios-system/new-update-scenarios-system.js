/**
 * created by jsq on 2017/12/27
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Input, Switch, Form, Icon,message } from 'antd'
import httpFetch from 'share/httpFetch';
import config from 'config'
import 'styles/financial-accounting-setting/accounting-scenarios-system/new-update-scenarios-system.scss'
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system.service';
import {formatMessage} from 'share/common'
const FormItem = Form.Item;

class NewUpdateScenariosSystem extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      firstRender: true,
      loading: false,
      enabled: true,
      scenarios: {},
      section: {}
    }
  }

  componentWillMount(){
    this.setState({
      scenarios: this.props.params,
      enabled: typeof this.props.params.enabled === 'undefined' ? true : this.props.params.enabled
    })
  }
  componentWillReceiveProps(nextProps){
    let params = nextProps.params;

    if(this.props.params.visible&&!nextProps.params.visible){
      this.props.form.resetFields();
      this.setState({
        loading: false,
        enabled: true,
        firstRender: true
      })
    }
  }

  handleSubmit = (e)=> {
    e.preventDefault();
    this.setState({loading: true,});
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err){
        let method = null;
        if(typeof this.state.scenarios.id === 'undefined'){
          method = accountingService.addAccountingScenarios([values])
        }else {
          values.versionNumber = this.state.scenarios.versionNumber;
          values.id = this.state.scenarios.id;
          method = accountingService.updateAccountingScenarios([values])
        }
       method.then(response=>{
         if(typeof this.state.scenarios.id === 'undefined' )
          message.success(`${formatMessage({id: "common.save.success"},{name:""})}`);
         else
           message.success(`${formatMessage({id:"common.operate.success"})}`);
          this.props.form.resetFields();
          this.props.close(true);
        }).catch(e=>{
          if(e.response){
            if(typeof this.state.scenarios.id === 'undefined' )
              message.error(`${formatMessage({id: "common.save.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            else
              message.error(`${formatMessage({id: "common.operate.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            this.setState({loading:false})
          }
        })
      }
    })
  };

  onCancel = ()=>{
    this.props.form.resetFields();
    this.setState({loading: false});
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
      <div className="new-update-scenarios-system">
        <Form onSubmit={this.handleSubmit} className="accounting-source-form">
          <FormItem {...formItemLayout} label={formatMessage({id:'accounting.scenarios.code'})  /*核算场景代码*/}>
            {getFieldDecorator('glSceneCode', {
              initialValue: scenarios.glSceneCode,
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }]
            })(
             <Input disabled={typeof scenarios.id === 'undefined' ? false : true} placeholder={formatMessage({id:"common.please.enter"})}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id:'accounting.scenarios.name'})  /*核算场景名称*/}>
            {getFieldDecorator('glSceneName', {
              initialValue: scenarios.glSceneName,
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }]
            })(
              <Input placeholder={formatMessage({id:"common.please.enter"})}/>
            )}
          </FormItem>
          {
            this.props.params.visible&&
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
          }
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

const WrappedNewUpdateScenariosSystem = Form.create()(NewUpdateScenariosSystem);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateScenariosSystem);
