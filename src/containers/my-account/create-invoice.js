import React from 'react'
import { connect } from 'dva';
import PropTypes from 'prop-types'
import { Spin, Input, DatePicker, Row, Col, Icon, Popover, Steps, Form, Select, InputNumber, Button, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const Step = Steps.Step;
import moment from 'moment';
import Invoice from 'containers/my-account/invoice';
import 'styles/my-account/create-invoice.scss';
import expenseService from 'containers/my-account/expense.service';

import invoiceImg from 'images/expense/invoice-info.png';
import invoiceImgEn from 'images/expense/invoice-info-en.png';
import {rejectPiwik} from "share/piwik";

class CreateInvoice extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      checking: false,
      invoice: {},
      warning: "",
      invoiceTypes: {
        fetched: false,
        data: []
      },
      canSubmit: true
    };
  }

  handleFocusInvoiceType = () => {
    let { invoiceTypes } = this.state;
    if(!invoiceTypes.fetched){
      expenseService.getTestInvoiceTypeList().then(res => {
        this.setState({
          invoiceTypes: {
            fetched: true,
            data: res.data
          }
        })
      })
    }
  };

  componentDidMount(){
    // let code = "01,04,3100171320,11111111,,20180531,111111";
    // this.testInvoice(code);
  }
  // 查验发票
  testInvoice = (code) => {
    rejectPiwik(`我的账本/查验发票`);
    expenseService.testInvoice(code).then(res => {
      this.setState({checking: false});
      let data = res.data;
      // 逻辑修改 200成功就跳转生成费用查看发票
      let errorList = data.errorList;
      errorList.forEach(item => {
        item.name = item.title;
        item.toast = item.message;
      });
      let invoice = data.invoiceInfo;
      invoice.recepitLabel = errorList;
      invoice.resultCode = data.resultCode;
      this.setState({
        invoice: invoice,
        currentStep: 1,
        canSubmit: data.canCreateExpense === 'Y' ? true : false
      })
    }).catch(e => {
      message.error(e.response.data.message);
      this.setState({ checking: false });
    });
  };
  //提交
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err,values) => {
      if(!err){
        let { invoiceTypeNo, invoiceCode, invoiceNumber, invoiceAmount, invoiceDate, checkCode } = values;
        invoiceAmount = invoiceAmount ? parseFloat(invoiceAmount).toFixed(2) : '';
        checkCode = checkCode || '';
        invoiceDate = invoiceDate.format('YYYYMMDD');
        invoiceCode = invoiceCode.toUpperCase();
        let code = `02,${invoiceTypeNo},${invoiceCode},${invoiceNumber},${invoiceAmount},${invoiceDate},${checkCode}`;
        this.setState({ checking: true });
        this.testInvoice(code);
      }
    })
  };

  render() {
    const { currentStep, invoiceTypes, checking, invoice, canSubmit } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { onCreate, fromExpense, onBack, createType } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    let invoiceTypeNo = getFieldValue('invoiceTypeNo');
    return (
      <div className="create-invoice">
        <Steps current={currentStep} progressDot>
          <Step title={this.$t('expense.enter.invoice')/*录入发票*/} />
          <Step title={this.$t(createType === 1 ? 'expense.create' : 'expense.invoice.create')/*生成费用/生成发票*/}/>
        </Steps>
        {
          currentStep === 0 ? (
            <div style={{ marginTop: 24 }}>
              <Form className="create-invoice" onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label={this.$t('expense.invoice.type')/*发票类型*/} onSubmit={this.handleSubmit}>
                  {getFieldDecorator('invoiceTypeNo', {
                    rules: [{
                      required: true,
                      message: this.$t('common.please.select')
                    }]
                  })(
                    <Select dropdownMatchSelectWidth={false}
                            onFocus={this.handleFocusInvoiceType}
                            placeholder={this.$t('common.please.select')/* 请选择 */}
                            notFoundContent={ invoiceTypes.fetched ? null : <Spin/> }>
                      {invoiceTypes.data.map(item => {
                        return <Option key={item.invoiceTypeNo} value={item.invoiceTypeNo}>{item.invoiceTypeName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
                <FormItem  {...formItemLayout}label={this.$t('expense.invoice.date')/*开票日期*/}>
                  {getFieldDecorator('invoiceDate', {
                    rules: [{
                      required: true,
                      message: this.$t('common.please.select')
                    }]
                  })(
                    <DatePicker disabledDate={current => current && (current.isAfter(moment().subtract(0, 'days')))}
                                placeholder={this.$t('common.please.select')}/>
                  )}
                </FormItem>
                <FormItem  {...formItemLayout} label={this.$t('expense.invoice.code')/*发票代码*/}>
                  {getFieldDecorator('invoiceCode', {
                    rules: [{
                      required: true,
                      message: this.$t('common.please.enter')
                    }, {
                      message: this.$t("common.must.characters.length", {length: '10/12'}),
                      validator: (rule, value, callback) => {
                        if(!value || (value.length !== 10 && value.length !== 12))
                          callback(true);
                        else
                          callback();
                      }
                    }]
                  })(
                    <Input maxLength="12" placeholder={this.$t('expense.invoice.code.help') /* 请输入10或12位数字*/}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label={this.$t('expense.invoice.number')/*发票号码*/}>
                  {getFieldDecorator('invoiceNumber', {
                    rules: [{
                      required: true,
                      message: this.$t('common.please.enter')
                    }, {
                      len: 8,
                      message: this.$t("common.must.characters.length", {length: 8})
                    }]
                  })(
                    <Input maxLength="8" placeholder={this.$t('expense.invoice.number.help') /* 请输入8位数字*/}/>
                  )}
                </FormItem>
                {(invoiceTypeNo === '04' || invoiceTypeNo === '10' || invoiceTypeNo === '11') && (
                  <FormItem {...formItemLayout} label={this.$t('expense.invoice.check.code')/*校验码*/}>
                    {getFieldDecorator('checkCode', {
                      rules: [{
                        required: true,
                        message: this.$t('expense.invoice.check.code.help')
                      }, {
                        len: 6,
                        message: this.$t('expense.invoice.check.code.help')
                      }]
                    })(
                      <Input placeholder={this.$t('expense.invoice.check.code.help')/*请输入校验码后6位*/} maxLength="6"/>
                    )}
                  </FormItem>
                )}
                {(invoiceTypeNo === '01' || invoiceTypeNo === '03') && (
                  <FormItem {...formItemLayout} label={this.$t('expense.invoice.amount')/*发票金额*/}>
                    {getFieldDecorator('invoiceAmount', {
                      rules: [{
                        required: true,
                        message: this.$t('common.please.enter')
                      }]
                    })(
                      <InputNumber placeholder={this.$t('expense.invoice.amount.help') /*请输入不含税金额*/} style={{width: '100%'}} precision={2} min={0} step={0.01}/>
                    )}
                  </FormItem>
                )}
                <Row>
                  <Col span={9}/>
                  <Col span={9}>
                    <Button type="primary" loading={checking} htmlType="submit">{this.$t('common.ok')/*确定*/}</Button>
                    {fromExpense && <Button onClick={onBack} style={{ marginLeft: 8 }}>{this.$t('common.back')/*返回*/}</Button>}
                  </Col>
                  <Col span={5}>
                    <Popover content={<img style={{width: '70vw'}}
                      src={this.props.language.local === 'zh_cn' ? invoiceImg : invoiceImgEn}/>}
                             placement="bottomRight">
                      <div className="invoice-info">{this.$t('expense.invoice.enter.info')/*发票填写说明*/}</div>
                    </Popover>
                  </Col>
                </Row>
              </Form>
            </div>
          ) : (
            <div style={{paddingTop: 20}}>
              <Invoice invoice={invoice} canExpense={true}/>
              {canSubmit && <div style={{ textAlign: 'center' , marginBottom: 30}}>
                <a onClick={() => onCreate(invoice)} style={{ fontSize: 16 }}>{this.$t(createType===1?'expense.create':'common.save')/*生成费用*/}&nbsp;&nbsp;<Icon type="right-circle-o" /></a>
              </div>}
              {!canSubmit && <div style={{ textAlign: 'center' , marginBottom: 30}}>
                <a onClick={() => this.setState({currentStep: 0})} style={{ fontSize: 16 }}><Icon type="left-circle-o" />&nbsp;&nbsp;{this.$t('common.back')/*返回*/}</a>
              </div>}
            </div>
          )
        }
      </div>
    )
  }
}

CreateInvoice.propTypes = {
  onCreate: PropTypes.func,
  fromExpense: PropTypes.bool,
  onBack: PropTypes.func,
  createType: PropTypes.number,
  digitalInvoice: PropTypes.any
};

CreateInvoice.defaultProps ={
  createType: 1,//1.是员工//2是财务
};

function mapStateToProps(state) {
  return {
    company: state.user.company,
    language: state.languages
  }
}

const WrappedCreateInvoice = Form.create()(CreateInvoice);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedCreateInvoice);
