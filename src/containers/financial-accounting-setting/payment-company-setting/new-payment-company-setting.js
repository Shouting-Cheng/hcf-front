import {messages} from "share/common";
/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react';
import {connect} from 'react-redux';

import {Button,Form,Switch, Input,message, Icon,Select,InputNumber} from 'antd';
const FormItem = Form.Item;
const Option =Select.Option;

import config from 'config';
import httpFetch from 'share/httpFetch';
import Chooser from  'components/chooser';
import paymentCompanySettingService from 'containers/pay-setting/payment-company-setting/payment-company-setting.service'
import 'styles/pay-setting/payment-company-setting/new-payment-company-setting.scss'

class NewPaymentCompanySetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      isEnabled: true,
      isPut: false,
      loading: false,
      ducumentCategoryOptions:[],
      ducumentTypeOptions:[],
      setOfBooksOption:[],
      isNew:true,
    };
  }

  componentWillMount() {
    this.getPaymentMethodCategory();
    this.getSetOfBooks();
    if(!this.props.params.isNew){
      this.setState({
        isNew:false,
      })
      this.getducumentType(this.props.params.ducumentCategory);
    }else {
      this.setState({
        isNew:true,
      })
    }
  }


  componentWillReceiveProps(nextProps){
    if(this.props.params != nextProps.params && !nextProps.params.isNew ){
      if(this.props.params.ducumentCategory != nextProps.params.ducumentCategory){
          this.getducumentType(nextProps.params.ducumentCategory);
        this.setState({
          isNew:false,
        })
      }
    }else if(this.props.params != nextProps.params && nextProps.params.isNew){
      this.setState({
        isNew:true,
      })
    }
  }

  //获取账套
  getSetOfBooks(){
    let setOfBooksOption = [];
    paymentCompanySettingService.getSetOfBooksByTenant().then((res)=>{
        res.data.map(data =>{
          setOfBooksOption.push({"label":data.setOfBooksCode+" - "+data.setOfBooksName,"value":String(data.id)})
        })
       console.log(setOfBooksOption);
        this.setState({
          setOfBooksOption
        })
      }
    )
  }


  getPaymentMethodCategory(){
    console.log("getPaymentMethodCategory");
    let ducumentCategoryOptions = [];
    this.getSystemValueList(2106).then(res => {
      res.data.values.map(data => {
        ducumentCategoryOptions.push({label: data.messageKey, value: data.code})
      });
      this.setState({
        ducumentCategoryOptions
      })
    });
  }


  //新建或者编辑
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if(JSON.stringify(this.props.params)==="{}"){
        this.setState({loading: true});
          let toValue = {
            ...values,
            companyId:values["companyId"][0].id,
            paymentCompanyId:values["paymentCompanyId"][0].id,

          }
          paymentCompanySettingService.addOrUpdataPaymentCompanySetting(toValue).then((res) => {
            this.setState({loading: false});
            this.props.form.resetFields();
            this.props.onClose(true);
            message.success(messages('common.operate.success'));
          }).catch((e) => {
            this.setState({loading: false});
            message.error(messages('common.save.filed')+e.response.data.message);
          })
      }else {
          console.log(values);
          this.setState({loading: true});
          console.log(this.props.params);
          let toValue = {
            ...this.props.params,
            ...values,
            companyId:values["companyId"][0].id,
            paymentCompanyId:values["paymentCompanyId"][0].id,
            ducumentType:values.ducumentType?values.ducumentType:"",
          }
          paymentCompanySettingService.addOrUpdataPaymentCompanySetting(toValue).then((res) => {
            this.setState({loading: false});
            this.props.form.resetFields();
            this.props.onClose(true);
            message.success(messages('common.operate.success'));
          }).catch((e) => {
            this.setState({loading: false});
            message.error(e.response.data.message);
          })
        }
      }
    });
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.onClose(false);
  };

  switchChange = () => {
    this.setState((prevState) => ({
      isEnabled: !prevState.isEnabled
    }))
  }

  handleDucumentCategory =(value)=>{
    console.log(value);
    this.props.form.setFieldsValue({
      ducumentTypeId:''
    })
    this.getducumentType(value);
  }

  //获取单据类别
  getducumentType(value){
    let ducumentTypeOptions = [];
    httpFetch.get(`${config.baseUrl}/api/expense/type/by/setOfBooks?setOfBooksId=${this.props.params.setOfBooksId}&roleType=${value}`).then((res)=>{
        const data =res.data;
        data.map(item =>{
          ducumentTypeOptions.push({label: item.name,value:String(item.id)})
        })
        this.setState({
            ducumentTypeOptions
          },()=>{}
        )
      }
    )
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {params, isEnabled, isPut} = this.state;
    const formItemLayout = {
      labelCol: {span: 6, offset: 1},
      wrapperCol: {span: 14, offset: 1},
    };
    let arry = new Array();
    return (

      <div className="new-payment-company-setting">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout}
                    label={messages('paymentCompanySetting.setOfBooks')}>
            {getFieldDecorator('setOfBooksId', {
              initialValue: this.props.params.setOfBooksId,
              rules: [
                {
                  required: true,
                  message: messages('common.please.select')
                },
              ],
            })(
              <Select placeholder={messages('common.please.select')} disabled={true}>
                {this.state.setOfBooksOption.map((option)=>{
                  return <Option value={option.value} lable={option.label} key={option.value}>{option.label}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}  label={messages('paymentCompanySetting.priorty')}
          >
            {getFieldDecorator('priorty', {
              rules: [{ required: true,   message: messages('common.please.enter') }],
              initialValue:this.props.params.priorty||''
            })(
              <InputNumber min={1} placeholder={messages('common.please.enter')} disabled={!this.state.isNew}/>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('paymentCompanySetting.company')}>
            {getFieldDecorator('companyId', {
              rules: [{ required: true, message: messages('common.please.select') }],
              initialValue:this.props.params.companyId||arry
            })(
              <Chooser
                type='company'
                labelKey='name'
                valueKey='id'
                single={true}
                listExtraParams={{"setOfBooksId":this.props.params.setOfBooksId,"isEnabled":true}}
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('paymentCompanySetting.ducumentCategory')}>
            {getFieldDecorator('ducumentCategory', {
              rules: [{ required: true,message: messages('common.please.select') }],
              initialValue:this.props.params.ducumentCategory||''
            })(
              <Select onSelect={this.handleDucumentCategory} placeholder={messages('common.please.select')}>
                {this.state.ducumentCategoryOptions.map((option)=>{
                  return <Option value={option.value} lable={option.label} key={option.value} >{option.label}</Option>
                })}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('paymentCompanySetting.ducumentType')} >
            {getFieldDecorator('ducumentTypeId', {
              initialValue:this.props.params.ducumentTypeId||"",
            })(
              <Select placeholder={messages('common.please.select')}>
                {this.state.ducumentTypeOptions.map((option)=>{
                  return <Option value={option.value} lable={option.label} key={option.value} >{option.label}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('paymentCompanySetting.paymentCompany')}>
            {getFieldDecorator('paymentCompanyId', {
              rules: [{ required: true,  message: messages('common.please.select') }],
              initialValue:this.props.params.paymentCompanyId||''
            })(
              <Chooser
                type='company'
                labelKey='name'
                valueKey='id'
                single={true}
                listExtraParams={{"setOfBooksId":this.props.params.setOfBooksId,"isEnabled":true}}
              />
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit"
                    loading={this.state.loading}>{messages('common.save')}</Button>
            <Button onClick={this.onCancel}>{messages('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    )
  }
}



const WrappedNewPaymentCompanySetting = Form.create()(NewPaymentCompanySetting);
function mapStateToProps(state) {
  return {
    company: state.login.company,
    tenantMode: state.main.tenantMode,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewPaymentCompanySetting);
