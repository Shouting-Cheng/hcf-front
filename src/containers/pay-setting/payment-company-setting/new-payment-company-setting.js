import {messages} from "utils/utils";
/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react';
import {connect} from 'dva';

import {Button,Form,Switch, Input,message, Icon,Select,InputNumber} from 'antd';
const FormItem = Form.Item;
const Option =Select.Option;

import httpFetch from 'share/httpFetch';
import Chooser from  'widget/chooser';
import paymentCompanySettingService from './payment-company-setting.service'

class NewPaymentCompanySetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      isEnabled: true,
      isPut: false,
      loading: false,
      queryFlag:true,
      ducumentCategoryOptions: [],
      ducumentTypeOptions: [],
      setOfBooksOption: [],
      isNew: true,
      companyUpdateFlag: false
    };
  }

  componentWillMount() {
    this.getPaymentMethodCategory();
    this.getSetOfBooks();
  }


  componentDidMount () {
    if ( this.props.params.id) {
      this.setState({
        queryFlag:false,
        isNew: false,
      });
      let companyId = this.props.params.companyId[0].id;
      if (this.props.params.ducumentCategory === 'ACP_REQUISITION') {
        //付款
        this.getPaymentType(companyId);
      } else if (this.props.params.ducumentCategory === 'PUBLIC_REPORT') {
        //报账单
        this.getDocumentType(companyId);
      } else if (this.props.params.ducumentCategory === 'PREPAYMENT_REQUISITION') {
        //预付款
        this.getPrePaymentType(companyId, this.props.params.setOfBooksId);
      } else {
        let ducumentTypeOptions = [];
        this.setState({ ducumentTypeOptions });
      }

    }else{
      this.setState({
        queryFlag:true,
        isNew: true,
      });
    }
  }

  //获取账套
  getSetOfBooks(){
    let setOfBooksOption = [];
    paymentCompanySettingService.getSetOfBooksByTenant().then((res)=>{
        res.data.map(data =>{
          setOfBooksOption.push({"label":data.setOfBooksCode+" - "+data.setOfBooksName,"value":String(data.id)})
        })
        this.setState({
          setOfBooksOption
        })
      }
    )
  }


  getPaymentMethodCategory(){
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
          this.setState({loading: true});
          let toValue = {
            ...this.props.params,
            ...values,
            companyId:values["companyId"][0].id,
            paymentCompanyId:values["paymentCompanyId"][0].id,
            ducumentTypeId:values.ducumentTypeId?values.ducumentTypeId:"",
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
    this.props.onClose(false);
  };

  switchChange = () => {
    this.setState((prevState) => ({
      isEnabled: !prevState.isEnabled
    }))
  }
  /**
   * 获取对公报账单单据类型，根据公司id和是否启用
   */
  getDocumentType = (companyId) => {
    let ducumentTypeOptions = [];
    paymentCompanySettingService.getDocumentType(companyId).then(res => {
      res.data.map(item => {
        ducumentTypeOptions.push({ label: `${item.formName}`, value: item.formId });
      });
      this.setState({
        ducumentTypeOptions: ducumentTypeOptions
      });
    });
  }
  /**
   * 获取付款单单据类型，根据公司id和是否启用
   */
  getPaymentType = (companyId) => {
    let ducumentTypeOptions = [];
    paymentCompanySettingService.getPaymentType(companyId).then(res => {
      res.data.map(item => {
        ducumentTypeOptions.push({ label: `${item.description}`, value: item.id });
      });
      this.setState({
        ducumentTypeOptions: ducumentTypeOptions
      });
    });
  }
  /**
   * 获取预付款单单据类型，根据公司id和是否启用
   */
  getPrePaymentType = (companyId, setOfBookId) => {
    let ducumentTypeOptions = [];
    paymentCompanySettingService.getPrePaymentType(companyId, setOfBookId).then(res => {
      res.data.map(item => {
        ducumentTypeOptions.push({ label: `${item.typeName}`, value: item.id });
      });
      this.setState({
        ducumentTypeOptions: ducumentTypeOptions
      });
    });
  }
  /**
   * 公司变化事件
   */
  onCompanyIdChange = (value) => {
    if (this.state.companyUpdateFlag) {
      this.props.form.setFieldsValue({
        ducumentTypeId: ''
      });
      if (value[0]) {
        let companyId = value[0].id;
        let ducumentCategory = this.props.form.getFieldValue('ducumentCategory');
        if (ducumentCategory === 'ACP_REQUISITION') {
          //付款
          this.getPaymentType(companyId);
        } else if (ducumentCategory === 'PUBLIC_REPORT') {
          //报账单
          this.getDocumentType(companyId);
        } else if (ducumentCategory === 'PREPAYMENT_REQUISITION') {
          //预付款
          this.getPrePaymentType(companyId, this.props.params.setOfBooksId);
        } else {
          this.setState({ducumentTypeOptions: []});
        }
      } else {
        this.setState({
          ducumentTypeOptions: []
        });
      }
    }else{
      this.setState({
        companyUpdateFlag: true
      });
    }
  }
  /**
   * 单据类别变化事件
   */
  handleDucumentCategory = (value) => {
    this.props.form.setFieldsValue({
      ducumentTypeId: ''
    });
    if (this.props.form.getFieldValue('companyId')[0]) {
      let companyId = this.props.form.getFieldValue('companyId')[0].id;
      if (value === 'ACP_REQUISITION') {
        //付款
        this.getPaymentType(companyId);
      } else if (value === 'PUBLIC_REPORT') {
        //报账单
        this.getDocumentType(companyId);
      } else if (value === 'PREPAYMENT_REQUISITION') {
        //预付款
        this.getPrePaymentType(companyId, this.props.params.setOfBooksId);
      } else {
        this.setState({ducumentTypeOptions: []});
      }
    } else {
      this.setState({
        ducumentTypeOptions: []
      });
    }
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
                listExtraParams={{ "setOfBooksId": this.props.params.setOfBooksId, "isEnabled": true }}
                onChange={this.onCompanyIdChange}
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
              initialValue: this.props.params.ducumentTypeId,

            })(
              <Select disabled={!(JSON.stringify(this.props.form.getFieldValue('companyId')) !== '[]' && this.props.form.getFieldValue('ducumentCategory'))} placeholder={messages('common.please.select')} allowClear ={true}>
                {this.state.ducumentTypeOptions.map((option) => {
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
    company: state.user.company
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewPaymentCompanySetting);
