/**
 * created by jsq on 2017/12/28
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Input, Switch, Form, Icon, Select, notification, message,Row, Col } from 'antd'
import 'styles/financial-accounting-setting/accounting-scenarios-system/new-update-accounting-elements.scss'
import Chooser from 'widget/chooser'
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system.service';
const FormItem = Form.Item;
const Option = Select.Option;

class NewUpdateScenariosSystem extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      visible: true,
      firstRender: true,
      transactionSceneId: null,
      matchGroup: [],
      accountElementCode:[],
      elements: {},
      section: {}
    }
  }

  componentDidMount(){
    let params = {...{},...this.props.params};
    this.setState({
      elements: params,
      enabled: typeof params.enabled === 'undefined' ? true : params.enabled,
      accountElementCode: typeof params.accountElementCode === 'undefined' ? [] : [{code: params.accountElementCode}]
    });
    if(params.id){
      this.props.form.setFieldsValue({accountElementName: params.accountElementName})
    }
  }

  componentWillMount() {
    let params = this.props.params;
    if(typeof params.id!=='undefined'){
      this.setState({
        enabled: params.enabled,
        transactionSceneId: params.transactionSceneId,
        accountElementCode: params.accountElementCode
      },this.handleGroup)
    }
  }

  componentDidMount(){

    this.setState({
      transactionSceneId: this.props.params.transactionSceneId,
      elements: this.props.params,
      accountElementCode: this.props.params.id ? [{code: this.props.params.accountElementCode}] :[]
    },()=>
      this.props.form.setFieldsValue({accountElementName: this.props.params.accountElementName}))
  }

  /*componentWillReceiveProps(nextprops){
    let params = {...{},...nextprops.params};
    if(JSON.stringify(params)==='{}'){
        this.props.form.resetFields();
        this.setState({
          loading: false,
          firstRender: true,
          enabled: true
        })
      }
    if(typeof nextprops.transactionSceneId !== 'undefined')
      if(this.state.firstRender){
        this.props.form.setFieldsValue({accountElementName: params.accountElementName});
        this.setState({
          transactionSceneId: nextprops.transactionSceneId,
          elements: params,
          firstRender: false
        });
      }
    if(nextprops.params.versionNumber !== this.state.elements.versionNumber){
      let params = this.props.params;
      this.setState({
        elements: nextprops.params,
        accountElementCode: [{code: params.accountElementCode}]
      })
    }
    if(!nextprops.params.visible&&this.props.params.visible){
      this.props.form.resetFields();
      this.setState({
        loading: false,
        firstRender: true,
        enabled: true
      })
    }
  }*/

  handleSubmit = (e)=> {
    e.preventDefault();
    this.setState({
     loading: true,
     });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err){
        values.transactionSceneId = this.state.transactionSceneId;
        values.accountElementCode = values.accountElementCode[0].code;
        if(!values.mappingGroupCode)
          values.mappingGroupCode = "";
        let method = null;
        if(typeof this.state.elements.id === 'undefined'){
          method = accountingService.addSysAccountingElements([values])
        }else {
          values.id = this.state.elements.id;
          values.versionNumber = this.state.elements.versionNumber;
          method = accountingService.updateSysAccountingElements([values])
        }
        method.then(response=>{
          if(typeof this.state.elements.id === 'undefined' )
            message.success(`${this.$t({id: "common.save.success"},{name:""})}`);
          else
            message.success(`${this.$t({id:"common.operate.success"})}`);
          this.setState({loading: false});
          this.props.form.resetFields();
          this.props.onClose(true);
        }).catch(e=>{
          if(e.response){
            if(typeof this.state.scenarios.id === 'undefined' )
              message.error(`${this.$t({id: "common.save.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            else
              message.error(`${this.$t({id: "common.operate.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            this.setState({loading: false})
          }
        })
      }
    })
  };

  onCancel = ()=>{
    this.props.form.resetFields();
    this.props.onClose(false)
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  handleElement = (value)=>{
    if(typeof value !== 'undefined'&& value.length>0){
      value[0].description&&this.props.form.setFieldsValue({accountElementName: value[0].description})
    }
  };

  handleGroup = () =>{
    //获取匹配组字段
    let params = {};
    accountingService.getMatchGroupField(params).then(response=>{
      let matchGroup = [];
      response.data.map(item=>{
        let option = {
          key: item.code,
          label: item.name
        };
        matchGroup.push(option)
      });
      this.setState({matchGroup})
    })
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { loading, enabled, elements, matchGroup } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return(
      <div className="new-update-accounting-elements">
        <Form onSubmit={this.handleSubmit} className="accounting-elements-form">
          <Row gutter={20}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:'accounting.scenarios.elements'})  /*核算要素*/}>
              {getFieldDecorator('accountElementCode', {
                initialValue: this.state.accountElementCode,
                rules: [{
                  required: true,
                  message: this.$t({id: "common.please.select"})
                }]
                })(
                <Chooser placeholder={this.$t({id:"common.please.select"})}
                    type='accounting_elements'
                    valueKey="code"
                    labelKey="code"
                    single={true}
                    listExtraParams={{transactionSceneId: this.state.transactionSceneId}}
                    onChange={this.handleElement}
                />
             )}
             </FormItem>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={20}>
             <FormItem {...formItemLayout} label={this.$t({id:'accounting.elements.name'})  /*核算要素名称*/}>
            {getFieldDecorator('accountElementName',{
              initialValue: elements.accountElementName
            })(
              <Input disabled/>
            )}
          </FormItem>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={20}>
             <FormItem {...formItemLayout} label={this.$t({id:'accounting.elements.nature'})  /*核算要素性质*/}>
            {getFieldDecorator('elementNature', {
              initialValue: elements.elementNature,
              rules: [{
                required: true,
                message: this.$t({id: "common.please.enter"})
              }]
            })(
              <Input placeholder={this.$t({id:"common.please.enter"})}/>
            )}
          </FormItem>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:'accounting.matching.group.field'})  /*匹配组字段*/}>
              {getFieldDecorator('mappingGroupCode',{
                initialValue: elements.mappingGroupCode
              })(
                <Select onFocus={this.handleGroup} allowClear placeholder={this.$t({id:"common.please.select"})}>
                  {matchGroup.map(item=><Option key={item.key}>{item.label}</Option>)}
                </Select>
              )}
            </FormItem>
            </Col>
          </Row>
          {
            this.props.params.visible&&
            <FormItem
              labelCol={{span: 5}}
              wrapperCol={{span: 14, offset: 1}}
              label={this.$t({id:"common.column.status"})} colon={true}>
              {getFieldDecorator('enabled', {
                valuePropName:"checked",
                initialValue: enabled
              })(
                <div>
                  <Switch defaultChecked={enabled}  checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                  <span className="enabled-type" style={{marginLeft:20,width:100}}>{ enabled ? this.$t({id:"common.status.enable"}) : this.$t({id:"common.disabled"}) }</span>
                </div>)}
            </FormItem>
          }
          <div className="slide-footer">
            <Button type="primary" htmlType="submit"  loading={this.state.loading}>{this.$t({id:"common.save"})}</Button>
            <Button onClick={this.onCancel}>{this.$t({id:"common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}

const WrappedNewUpdateScenariosSystem = Form.create()(NewUpdateScenariosSystem);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateScenariosSystem);
