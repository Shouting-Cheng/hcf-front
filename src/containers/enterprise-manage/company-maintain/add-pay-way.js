import {messages} from "share/common";
/**
 * Created by fudebao on 2017/12/05.
 */























//这个我们汇联易这边没有用
//先不动
//麻烦最初写这个文件的开发者，在上面备注一下，这个页面是干什么的
//如果没有用，就删除了





















import React from 'react';
import { connect } from 'react-redux';

import { Button, Form, Switch, Input, message, Icon, Select, Radio, DatePicker } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import Chooser from 'components/chooser'

import config from 'config';
import httpFetch from 'share/httpFetch';
import moment from 'moment';

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
      disabled: true
      // isDisabled: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ params: nextProps.params });
    this.getPayWayTypeList();

    if (nextProps.params.id) {
      this.getPayWayList(nextProps.params.paymentMethodCategory);
      this.setState({ disabled: false });
    }
  }

  //获取付款方式类型
  getPayWayTypeList = () => {
    this.getSystemValueList(2105).then(res => {

      this.setState({ payWayTypeList: res.data.values });
    })
  }

  //获取付款方式
  getPayWayList = (paymentType) => {
    httpFetch.get(`${config.payUrl}/api/cash/payment/method/selectByPaymentType?paymentType=${paymentType}`).then(res => {
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

        httpFetch.post(`${config.baseUrl}/api/comapnyBankPayment/insertOrUpdate`, temp).then((res) => {
          this.setState({ loading: false });
          this.props.form.resetFields();
          this.props.close(true);
          message.success(messages('common.operate.success'));
        }).catch((e) => {
          this.setState({ loading: false });

          message.error(messages('common.save.filed') + `${e.response.data.message}`);
        })
      }
    });
  }

  onCancel = () => {
    this.props.close();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    
    const { params, companyTypeList, setOfBooksNameList, legalEntityList, companyLevelList, parentCompanyList, dateFormat, payWayTypeList, payWayList, disabled } = this.state;
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
              <Select onChange={this.typeChange} placeholder={messages('common.please.select')}>
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
    company: state.login.company,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewSubjectSheet);
