/**
 * Created by 14306 on 2018/12/26.
 */
import React from 'react'
import {connect} from 'dva'
import moment from 'moment'
import {
  Form,
  Input,
  Switch,
  Button,
  Col,
  Row,
  Select,
  DatePicker,
  Alert,
  notification,
  Icon,
  message,
  InputNumber
} from 'antd'
import parameterService from 'containers/setting/parameter-definition/parameter-definition.service'
import config from 'config';

import 'styles/budget-setting/budget-organization/budget-versions/new-budget-versions.scss'
import Chooser from "components/Widget/chooser";
const Option = Select.Option;
const FormItem = Form.Item;

class NewParameterDefinition extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      versionCodeError: false,
      statusError: false,
      newData: [],
      moduleOptions:[],
      paramsOptions:[],
      paramCode:{},
      paramValueOptions: [],
      version: {},
      statusOptions:[],
      checkoutCodeData: [],
      loading: false,
    };
  }

  componentDidMount() {
    console.log(this.props)

  }


  componentWillReceiveProps = (nextProps) => {
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        this.setState({loading: true});
        console.log(values)
        values.setOfBooksId&&(values.setOfBooksId = values.setOfBooksId.id);
        values.parameterLevel = this.props.params.nowTab.toString() === '1' ? 'SOB' : 'COMPANY';
        values.tenantId = this.props.company.tenantId;
        parameterService.newParameter(values).then(res=>{
          this.props.onClose(true);
          message.success(this.$t('common.save.success',{name:''}))
        }).catch(e=>{
          message.error(this.$t('common.save.filed'))
        })
      }
    })
  };

  handleModule = ()=>{
    this.state.moduleOptions.length===0&&parameterService.getModule().then(res=>{
      this.setState({
        moduleOptions: res.data
      })
    })
  };

  //模块代码改变时，重置相关值
  handleModuleChange = (value) =>{
    if(value){
      this.props.form.setFieldsValue({
        parameterId: '',
        parameterName: '',
        parameterValueId: '',
        parameterValueDesc: ''
      })
    }
  };

  handleParamCode = ()=>{
    let params = {
      parameterLevel: this.props.params.nowTab.toString() === '1' ? 'SOB' : 'COMPANY',
      moduleCode: this.props.form.getFieldValue('moduleCode')
    };
    parameterService.getParamByModuleCode(params).then(res=>{
      this.setState({
        paramsOptions: res.data
      })
    })

  };

  handleParamChange = (value) =>{
    let param = this.state.paramsOptions.find(item=>item.id === value);
    this.setState({paramCode: param},()=>{
      this.props.form.setFieldsValue({parameterName: param.parameterName})
    });
  };

  handleParamValue = () =>{
    let params ={
      parameterValueType: this.state.paramsOptions.find(item=>item.id === this.props.form.getFieldValue('parameterId')).parameterValueType,
      parameterCode: this.state.paramsOptions.find(item=>item.id === this.props.form.getFieldValue('parameterId')).parameterCode,
    };
    parameterService.getParamValues(params).then(res=>{
      console.log(res)
      this.setState({
        paramValueOptions: res.data
      })
    })

  };

  onCancel =()=>{
    this.props.form.resetFields();
    this.props.onClose();
  };

  handleAPI = (value)=>{
    console.log(value)
  };

  //根据所选参数代码渲染不同参数值框
  renderParamValue(){
    const { paramCode, paramValueOptions} = this.state;
    console.log(paramCode)

    if(paramCode.api){
      let selectorItem = {
        title:  '参数值',//this.$t('chooser.data.company' /*选择公司*/),
        url: `${config.baseUrl}${paramCode.api}`,
        searchForm: [
          {
            type: 'input',
            id: 'code',
            label: this.$t('common.code'),
          },
          { type: 'input', id: 'name', label: this.$t('common.name') },
        ],
        columns: [
          { title: this.$t('common.code'), dataIndex: 'code' },
          { title: this.$t('common.name'), dataIndex: 'name' },
        ],
        key: 'id',
      };
      return <Chooser
        single={true}
        showClear
        labelKey='code'
        valueKey='id'
        onChange={this.handleAPI}
        selectorItem={selectorItem}
      />
    }

    return (<Select placeholder={this.$t("common.please.select")}
                    disabled={!this.props.form.getFieldValue('parameterId')}
                    onFocus={this.handleParamValue}>
      {paramValueOptions.map(item => {
        return <Option key={item.parameterValue}>{item.parameterValueDesc}</Option>
      })}
    </Select>)
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {record, sob, nowTab} = this.props.params;
    console.log(this.props.params)
    const versionCodeError = false;
    const {moduleOptions, paramsOptions, paramValueOptions, version,statusOptions} = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 0 },
    };
    return (
      <div className="new-parameter-definition" style={{paddingTop: 25}}>
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({id: "parameter.definition.model"})}>
            {getFieldDecorator('moduleCode', {
              //initialValue: typeof version.id === 'undefined' ? "NEW" : '',
              rules: [{
                required: true,
                message: this.$t({id: "common.please.select"})
              }],
            })(
              <Select disabled={ nowTab.toString() === '0' || !!record }
                      onChange={this.handleModuleChange}
                      placeholder={this.$t({id: "common.please.select"})}
                      onFocus={this.handleModule}>
                {moduleOptions.map(item=><Option key={item.moduleCode}>{item.moduleName}</Option>)}
              </Select>
            )}
          </FormItem>
          {
            nowTab.toString() === '1'&&
            <FormItem {...formItemLayout} label={this.$t({id: "workflow.set.of.books"})}>
              {getFieldDecorator('setOfBooksId',
                {
                  initialValue: sob,
                })(<Select labelInValue disabled/>)}
            </FormItem>
          }
          {
            nowTab.toString() === '2'&&
            <FormItem {...formItemLayout} label={this.$t({id: "exp.company"})}>
              {getFieldDecorator('companyId',
                {
                  initialValue: sob,
                })(<Select labelInValue disabled />)}
            </FormItem>
          }
          <FormItem {...formItemLayout} label={this.$t({id: "budget.parameterCode"})}>
            {getFieldDecorator('parameterId', {
              //initialValue: version.versionCode,
              rules: [{required: true, message: this.$t({id: "common.please.enter"})},]
            })(
              <Select disabled={!this.props.form.getFieldValue('moduleCode')}
                      placeholder={this.$t({id: "common.please.select"})}
                      onChange={this.handleParamChange}
                      onFocus={this.handleParamCode}
              >
                {paramsOptions.map(item=><Option key={item.id}>{item.parameterCode}</Option>)}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.parameterName"})}>
            {getFieldDecorator('parameterName', {
              initialValue: version.versionName,
              //rules: [{required: true, message: this.$t({id: "common.please.enter"})}],
            })(<Input disabled placeholder={this.$t({id: "common.please.enter"})}/>)}

          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.balance.params.value"})}>
            {getFieldDecorator('parameterValueId', {
              //initialValue: typeof version.id === 'undefined' ? "NEW" : '',
              //rules: [{required: true,}],
            })(
              this.renderParamValue()
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "chooser.data.description"})}>
            {getFieldDecorator('parameterValueDesc', {
              //initialValue: version.description
            })(<Input placeholder={this.$t({id: "common.please.enter"})}/>)}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({id: "common.save"})}</Button>
            <Button onClick={this.onCancel}>{this.$t({id: "common.cancel"})}</Button>
          </div>
        </Form>
      </div>

    )
  }

}

const WrappedNewParameterDefinition = Form.create()(NewParameterDefinition);

function mapStateToProps(state) {
  return {
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewParameterDefinition);
