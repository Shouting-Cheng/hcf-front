import {messages} from "share/common";
/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react';
import {connect} from 'react-redux';

import {Button,Form,Switch, Input,message, Icon,Select} from 'antd';
const FormItem = Form.Item;
const Option =Select.Option;
import paymentMethodService from 'containers/pay-setting/payment-method/payment-method.service'
import 'styles/pay-setting/payment-method/new-payment-method.scss'

class NewPaymentMethod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      isEnabled: true,
      isPut: false,
      loading: false,
      paymentMethodCategoryOptions:[],
      searchFrom:[
        {id:"isEnabled"},
        {id:"paymentMethodCategory"},
        {id:"paymentMethodCode"},
        {id:"description"}
      ]
    };
  }

  componentWillMount() {
    let params = this.props.params;
    if(params && JSON.stringify(params) != "{}"){
      this.setState({
        isEnabled:params.isEnabled
      },()=>{
      })
    }else {
      this.setState({
        isEnabled:true,
      })
    }

    this.getPaymentMethodCategory();
  }

  getPaymentMethodCategory(){
    let paymentMethodCategoryOptions = [];
    this.getSystemValueList(2105).then(res => {
      res.data.values.map(data => {
        paymentMethodCategoryOptions.push({label: data.messageKey, value: data.code,key:data.code})
      });
      this.setState({
        paymentMethodCategoryOptions
      })
    });
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.params && JSON.stringify(nextProps.params) != "{}" && this.props.params != nextProps.params) {
      this.setState({
        isEnabled:nextProps.params.isEnabled
      },()=>{})
    }
    else if((nextProps.params && JSON.stringify(nextProps.params) == "{}" && this.props.params != nextProps.params)){
      this.setState({
        isEnabled:true
      },()=>{})
    }
  }



  //新建或者修改
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        if (JSON.stringify(this.props.params) === "{}") {
          let toValue = {
            id: "",
            versionNumber: 1,
            ...this.props.params,
            ...values,
          }
          console.log(this.state.isEnabled);
          paymentMethodService.addOrUpDataPaymentType(toValue).then((res) => {
            this.setState({loading: false});
            this.props.form.resetFields();
            this.props.onClose(true);
            message.success(messages('common.operate.success'));
          }).catch((e) => {
            this.setState({loading: false});

            message.error(messages('common.save.filed')+`${e.response.data.message}`);
          })
        }else {
          let toValue ={
            ...this.props.params,
            ...values,
          }
          paymentMethodService.addOrUpDataPaymentType(toValue).then((res) => {
            this.setState({loading: false});
            this.props.form.resetFields();
            this.props.onClose(true);
            message.success(messages('common.operate.success'));
          }).catch((e) => {
            this.setState({loading: false});
            message.error(messages('common.save.filed')+`${e.response.data.message}`);
          })

        }
      }
    });
  }

  onCancel = () => {
    this.props.onClose();
  };

  switchChange = (value) => {
    console.log(value);
   this.setState({isEnabled:value})
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {params, isEnabled, isPut} = this.state;
    const formItemLayout = {
      labelCol: {span: 6, offset: 1},
      wrapperCol: {span: 14, offset: 1},
    };
    return (


      <div className="new-payment-method">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout}
                    label={messages('paymentMethod.isEnabled')}>
            {getFieldDecorator('isEnabled', {
              valuePropName: 'checked',
              initialValue: this.state.isEnabled
            })(
                <Switch  checkedChildren={<Icon type="check"/>}
                        unCheckedChildren={<Icon type="cross" />}
                        onChange={this.switchChange}
                />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('paymentMethod.paymentMethodCategory')}>
            {getFieldDecorator('paymentMethodCategory', {
              rules: [{
                required: true,
                message: messages('common.please.enter')
              }],
              initialValue:this.props.params.paymentMethodCategory||''
            })(
              <Select disabled={JSON.stringify(this.props.params) === "{}"?false:true} placeholder={messages('common.please.select')}>
                {this.state.paymentMethodCategoryOptions.map((option)=>{
                  return <Option value={option.value} lable={option.label} >{option.label}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('paymentMethod.paymentMethodCode')}>
            {getFieldDecorator('paymentMethodCode', {
              rules: [{
                required: true,
                message: messages('common.please.enter')
              }],
              initialValue:this.props.params.paymentMethodCode||''
            })(
              <Input placeholder={messages('common.please.enter')} disabled={JSON.stringify(this.props.params) === "{}"?false:true}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('paymentMethod.description')}>
            {getFieldDecorator('description', {
              rules: [{
                required: true,
                message: messages('common.please.enter')
              }],
              initialValue:this.props.params.description||''
            })(
              <Input placeholder={messages('common.please.enter')}/>
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



const WrappedPaymentMethod = Form.create()(NewPaymentMethod);
function mapStateToProps() {
  return {

  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedPaymentMethod);
