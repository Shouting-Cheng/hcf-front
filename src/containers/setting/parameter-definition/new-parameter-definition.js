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
import CustomAmount from "components/Widget/custom-amount";
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
    this.setState({
      paramCode: {
        parameterValueType: this.props.params.record.parameterValueType
      }
    },()=>{
      this.handleModule();
      this.handleParamCode();
    })
  }


  handleSave = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        this.setState({loading: true});
        const record = this.props.params.record;
        let method;
        let flag = !!this.props.params.record.id;
        console.log(this.props.params.record.id);
        values.parameterLevel = this.props.params.nowTab === '1' ? 'SOB' : 'COMPANY';
        values.tenantId = this.props.company.tenantId;
        values.setOfBooksId && (values.setOfBooksId = values.setOfBooksId.key);
        values.companyId && (values.companyId = values.companyId.key);
        console.log(values)
        console.log(this.props.params.company)
        if(flag){ //编辑
          method = parameterService.updateParameter;
          values.moduleCode = record.moduleCode;
          values.parameterId === record.parameterCode && (values.parameterId = record.parameterId);
          values.parameterValueId === record.parameterName && (values.parameterValueId = record.parameterValueId)
        }else {
          method = parameterService.newParameter;
          this.props.params.nowTab === '1' && (values.setOfBooksId = this.props.params.sob.value);
        }
        method(values).then(res=>{
          this.props.onClose(true);
          message.success(this.$t('common.save.success',{name:''}))
        }).catch(e=>{
          this.setState({loading: false});
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
      this.setState({paramCode:{}},()=>{
        this.props.form.setFieldsValue({
          parameterId: null,
          parameterName: null,
          parameterValueId: null,
          parameterValueDesc: null
        })
      });
    }
  };

  handleParamCode = ()=>{
    let parameterCode = this.props.form.getFieldValue('moduleCode');
    parameterCode === this.props.params.record.moduleName && (parameterCode = this.props.params.record.moduleCode);

    let params = {
      parameterLevel: this.props.params.nowTab === '1' ? 'SOB' : 'COMPANY',
      moduleCode: parameterCode
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
      this.props.form.setFieldsValue({parameterName: param.parameterName,parameterValueDesc: null})
    });
  };

  handleParamValue = () =>{
    let parameterId = this.props.form.getFieldValue('parameterId');
    parameterId === this.props.params.record.parameterCode && ( parameterId = this.props.params.record.parameterId);

    let params ={
      //parameterValueType: this.state.paramsOptions.find( item=> item.id === parameterId ).parameterValueType,
      parameterCode: this.state.paramsOptions.find(item=>item.id === parameterId).parameterCode,
    };
    parameterService.getParamValues(params).then(res=>{
      console.log(res)
      this.setState({
        paramValueOptions: res.data
      })
    })
  };

  handleParamValueChange = (value) =>{
    this.props.form.setFieldsValue({parameterValueDesc: this.state.paramValueOptions.find( item=> item.id.toString() === value.toString()).name})
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
    console.log(this.props.params.record)
    switch(paramCode.parameterValueType || this.props.params.record.parameterValueType){
      case 'API':{
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
        console.log(this.props.form.getFieldsValue('parameterId'))

        let parameterId = this.props.form.getFieldValue('parameterId');
        parameterId === this.props.params.record.parameterCode && ( parameterId = this.props.params.record.parameterId);

        let parameterCode = this.state.paramsOptions.find(item=>item.id === parameterId).parameterCode;

        let params = this.props.params.nowTab === '1' ?
          {
            parameterCode: parameterCode,
            parameterLevel: "COMPANY" ,
            setOfBooksId: this.props.company.id
          } :
          {
            parameterCode: parameterCode,
            parameterLevel: "COMPANY" ,
            companyId: this.props.company.id
          };

        return <Chooser
          single={true}
          showClear
          labelKey='code'
          valueKey='id'
          onChange={this.handleAPI}
          listExtraParams={params}
          selectorItem={selectorItem}
        />
      }
      case 'VALUE_LIST': {
        return <Select placeholder={this.$t("common.please.select")}
                        disabled={!this.props.form.getFieldValue('parameterId')}
                        onChange={this.handleParamValueChange}
                        onFocus={this.handleParamValue}>
          {paramValueOptions.map(item => {
            return <Option key={item.id}>{item.code}</Option>
          })}
        </Select>
      }
      case 'TEXT':{
        return <Input.TextArea placeholder={this.$t("common.please.enter")}/>
      }
      case 'NUMBER':{
        return <InputNumber placeholder={this.$t("common.please.enter")}/>
      }
      case 'DATE':{
        return <DatePicker/>
      }
      case 'DOUBLE':{
        return <CustomAmount/>
      }
    }

    return <Select placeholder={this.$t("common.please.select")} disabled/>
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const { record, sob, nowTab, company } = this.props.params;
    const { moduleOptions, paramsOptions, paramCode, statusOptions } = this.state;

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 0 },
    };

    let isVisible = {
      API: true,
      VALUE_LIST: true
    };

    return (
      <div className="new-parameter-definition" style={{paddingTop: 25}}>
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({id: "parameter.definition.model"})}>
            {getFieldDecorator('moduleCode', {
              initialValue: record.moduleName || '',
              rules: [{
                required: true,
                message: this.$t({id: "common.please.select"})
              }],
            })(
              <Select disabled={ nowTab === '0' || !record }
                      onChange={this.handleModuleChange}
                      placeholder={this.$t({id: "common.please.select"})}
                      onFocus={this.handleModule}>
                {moduleOptions.map(item=><Option key={item.moduleCode}>{item.moduleName}</Option>)}
              </Select>
            )}
          </FormItem>
          {
            nowTab === '1'&&
            <FormItem {...formItemLayout} label={this.$t({id: "workflow.set.of.books"})}>
              {getFieldDecorator('setOfBooksId',
                {
                  initialValue: sob,
                })(<Select labelInValue disabled/>)}
            </FormItem>
          }
          {
            nowTab === '2'&&
            <FormItem {...formItemLayout} label={this.$t({id: "exp.company"})}>
              {getFieldDecorator('companyId',
                {
                  initialValue: { key: company.id, label:company.name },
                })(<Select labelInValue disabled />)}
            </FormItem>
          }
          <FormItem {...formItemLayout} label={this.$t({id: "budget.parameterCode"})}>
            {getFieldDecorator('parameterId', {
              initialValue: record.parameterCode || '',
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
              initialValue: record.moduleName || '',
              //rules: [{required: true, message: this.$t({id: "common.please.enter"})}],
            })(<Input disabled placeholder={this.$t({id: "common.please.enter"})}/>)}

          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.balance.params.value"})}>
            {getFieldDecorator('parameterValueId', {
              initialValue: record.parameterValueType === 'DATE' ? moment(record.parameterValueId,'YYYY-MM-DD') : record.parameterValueId || '',
              //rules: [{required: true,}],
            })(
              this.renderParamValue()
            )}
          </FormItem>
          {  isVisible[paramCode.parameterValueType]&&
            <FormItem {...formItemLayout} label={this.$t({id: "chooser.data.description"})}>
              {getFieldDecorator('parameterValueDesc', {
                initialValue: record.parameterValueDesc
              })(<Input placeholder={this.$t({id: "common.please.enter"})}/>)}
            </FormItem>
          }
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
