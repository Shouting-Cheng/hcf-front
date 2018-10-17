import { messages} from "utils/utils";
/**
 * Created by fudebao on 2017/12/05.
 */
import React from 'react';
import { connect } from 'dva';

import { Button, Form, Switch, Input, message, Icon, Select, Radio, DatePicker } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;


import companyAccountSettingService from './company-account-setting.service'


class AddPayWay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      loading: false,
      companyTypeList: [],
      setOfBooksNameList: [],
      legalEntityList: [],
      companyLevelList: [],
      parentCompanyList: [],
      dateFormat: 'YYYY/MM/DD',
      payWayTypeList: [],
      payWayList: [],
      disabled: false,
      flag: true,
      queryFlag:true,
      typeDisable:false
      // isDisabled: false
    };
  }

  componentDidMount (){
    if (this.props.params.record.paymentMethodCategory) {
      this.setState({
        params: this.props.params.record,
        disabled: false,
        typeDisable: true,
        queryFlag: false,
      }, () => {
        this.getPayWayList(this.props.params.record.paymentMethodCategory);

      });
    }else{
      this.setState({
        params: this.props.params.record
      })
    }
  }
  componentWillMount() {
    this.getPayWayTypeList();
  }
  //获取付款方式类型
  getPayWayTypeList = () => {
    this.getSystemValueList(2105).then(res => {
      this.setState({ payWayTypeList: res.data.values });

    })
  }

  //获取付款方式
  getPayWayList = (type) => {
    let params = this.state.params;
    // httpFetch.get(`${config.payUrl}/api/cash/payment/method/get/payment/by/bankId/and/code?companyBankId=${params.companyBankId}&type=${type}${params.id ? "&companyPaymentId=" + params.id : ""}${params.id ? "&paymentMethodId=" + params.paymentMethodId : ""}`).then(res => {
    let temp1 = params.id ? "&companyPaymentId=" + params.id : "";
    let temp2 = params.id ? "&paymentMethodId=" + params.paymentMethodId : "";
    // let url = `${config.payUrl}/api/cash/payment/method/get/payment/by/bankId/and/code?companyBankId=${params.companyBankId}&type=${type}${params.id ? "&companyPaymentId=" + params.id : ""}${params.id ? "&paymentMethodId=" + params.paymentMethodId : ""}`;
    companyAccountSettingService.getPayWayList(params.companyBankId,type,temp1,temp2).then(res => {
      this.setState({ payWayList: res.data });
    })
  }

  //付款类型改变时触发
  typeChange = (value) => {

    value ? this.setState({ disabled: false }) : this.setState({ disabled: true });

    this.props.form.setFieldsValue({
      paymentMethodId: []
    });

    this.getPayWayList(value);
  }

  //编辑保存
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });

        let temp = [];

        if (this.state.params.id) {
          temp.push({ id: this.state.params.id, paymentMethodId: values.paymentMethodId, bankAccountId: this.state.params.companyBankId });
        }
        else {
          values.paymentMethodId.map(o => {
            temp.push({ paymentMethodId: o, bankAccountId: this.state.params.companyBankId });
          })
        }

        // httpFetch.post(`${config.baseUrl}/api/comapnyBankPayment/insertOrUpdate`, temp).then((res) => {
        companyAccountSettingService.savePayWay(temp).then((res) => {
          this.setState({ loading: false });
          this.props.form.resetFields();
          this.props.onClose(true);
          message.success(messages('common.operate.success'));
        }).catch((e) => {
          this.setState({ loading: false });

          message.error(messages('common.save.filed') + `${e.response.data.message} `);
        })
      }
    });
  }

  onCancel = () => {
    this.props.onClose();
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const { params, companyTypeList, setOfBooksNameList, legalEntityList, companyLevelList, parentCompanyList, dateFormat, payWayTypeList, payWayList, disabled,typeDisable } = this.state;
    const formItemLayout = {
      labelCol: { span: 6, offset: 1 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
        <div className="new-payment-method">
          <Form onSubmit={this.handleSave}>
            <FormItem {...formItemLayout} label={messages('pay.way.type')}>
              {getFieldDecorator('payWayType', {
                rules: [{
                  required: true,
                  message: messages('common.please.enter')
                }],
                initialValue: params.id ? params.paymentMethodCategory : ""
              })(
                  <Select disabled={typeDisable} onChange={this.typeChange} placeholder={messages('common.please.select')}>
                    {payWayTypeList.map(option => {
                      return <Option key={option.code}>{option.messageKey}</Option>
                    })}
                  </Select>)}
            </FormItem>

            <FormItem {...formItemLayout} label={messages('pay.way')}>
              {getFieldDecorator('paymentMethodId', {
                rules: [{
                  required: true,
                  message: messages('common.please.enter')
                }],
                initialValue: params.id ? params.paymentMethodId : []
              })(
                  <Select disabled={disabled} mode={params.id ? "" : "multiple"} placeholder={messages('common.please.select')}>
                    {payWayList.map(option => {
                      return <Option key={option.id}>{option.description}</Option>
                    })}
                  </Select>)}
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



const WrappedNewSubjectSheet = Form.create()(AddPayWay);
function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewSubjectSheet);
