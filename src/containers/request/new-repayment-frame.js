import React from 'react'
import { connect } from 'dva';
import { injectIntl } from 'react-intl'
import config from 'config'
import httpFetch from 'share/httpFetch'
import { Form, Input, Button, Select, Spin, Row, Col, InputNumber, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import ImageUpload from 'components/Widget/image-upload'
import 'styles/request/new-repayment-frame.scss'

class NewPaymentFrame extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      bankFetching: false,
      accountFetching: false,
      bankOptions: [],
      accountOptions: [],
      acceptAccount: undefined,
      acceptBankName: undefined,
      repayAttchment: [],
      currency: null,
      amount: 0,
      info: {}
    }
  }

  componentWillMount() {
    this.getPayAccount();
    this.getAcceptAccount()
  }

  componentWillReceiveProps(nextProps) {
    if(!this.state.amount) {
      this.setState({
        currency: nextProps.params.currency,
        amount: nextProps.params.amount,
        info: nextProps.params.info
      },() => {
        this.props.form.resetFields();
        this.props.form.setFieldsValue({
          repaymentValue: this.state.amount,
          payAccountName: this.state.info.applicant.fullName
        })
      })
    }
  }

  //获取付款方信息
  getPayAccount = () => {
    httpFetch.get(`${config.baseUrl}/api/repayment/bank/list?page=0&size=9999`).then(res => {
      this.setState({
        bankOptions: res.data
      })
    })
  };

  //获取收款方信息
  getAcceptAccount = () => {
    this.setState({ accountFetching: true });
    //isAll为boolean型，true的话拿到包含启用和非启用的法人实体，false或者不传就是拿到所有启用的法人实体
    httpFetch.get(`${config.baseUrl}/api/v2/my/company/receipted/invoices?isAll=true&page=0&size=100`).then(res => {
      this.setState({
        accountFetching: false,
        accountOptions: res.data,
        acceptAccount: res.data[0].cardNumber,
        acceptBankName: res.data[0].accountBank
      });
    }).catch(() => {
      this.setState({ accountFetching: false })
    })
  };

  onChangeAcceptAccount = (id) => {
    this.state.accountOptions.map(item => {
      if(item.id === id) {
        this.setState({
          acceptAccount: item.cardNumber,
          acceptBankName: item.accountBank
        })
      }
    })
  };

  //获取上传图片的OId
  getUploadImageOId = (values) => {
    let repayAttchment = [];
    values.map(item => {
      repayAttchment.push({attachmentOid: item.attachmentOid})
    });
    this.setState({ repayAttchment })
  };

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        values.loanApplicationOid = this.state.info.applicationOid;
        values.repayAttchment = this.state.repayAttchment;
        this.setState({ loading: true });
        httpFetch.post(`${config.baseUrl}/api/repayment/submit`, values).then(() => {
          this.setState({ loading: false });
          message.success('操作成功');
          this.props.close(true)
        }).catch(e => {
          this.setState({ loading: false });
          message.success(`操作失败，${e.response.data.message}`)
        })
      }
    })
  };

  handleCancel = () => {
    this.props.close()
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, bankFetching, accountFetching, bankOptions, accountOptions, acceptAccount, acceptBankName, currency, amount } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 }
    };
    return (
      <div className="new-repayment-frame">
        <Form onSubmit={this.handleSave}>
          <h4 className="title">还款方信息</h4>
          <FormItem {...formItemLayout} label="开户名">
            {getFieldDecorator('payAccountName', {
              rules: [{
                required: true,
                message: '请输入'
              }]
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="开户账号">
            {getFieldDecorator('payAccount', {
              rules: [{
                required: true,
                message: '请输入'
              }]
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="开户银行">
            {getFieldDecorator('payBankName', {
              rules: [{
                required: true,
                message: '请选择'
              }]
            })(
              <Select placeholder="请选择" notFoundContent={bankFetching ? <Spin size="small" /> : '无匹配结果'}>
                {bankOptions.map(option => {
                  return <Option key={option.id}>{option.bankBranchName}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <Row>
            <Col span={6} className="form-define-title required">还款金额：</Col>
            <Col span={3} offset={1}><Input value={currency} disabled/></Col>
            <Col span={5}>
              <FormItem>
                {getFieldDecorator('repaymentValue', {
                  rules: [{
                    required: true,
                    message: '请输入'
                  }, {
                    pattern: /[1-9]/,
                    message: '还款金额要大于 0'
                  }]
                })(
                  <InputNumber min={0} max={amount} precision={2} style={{marginLeft:10, width:'100%'}}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={6} className="form-define-title">图片（最多3张）：</Col>
            <Col span={17} offset={1}><ImageUpload attachmentType="REPAYMENT_IMAGES" onChange={this.getUploadImageOId}/></Col>
          </Row>
          <h4 className="title">收款方信息 <span>请按以下收款方账号打款</span></h4>
          <FormItem {...formItemLayout} label="开户名">
            {getFieldDecorator('acceptAccountName', {
              initialValue: accountOptions[0] && accountOptions[0].companyName
            })(
              <Select placeholder="请选择"
                      onChange={this.onChangeAcceptAccount}
                      notFoundContent={accountFetching ? <Spin size="small" /> : '无匹配结果'}>
                {accountOptions.map(option => {
                  return <Option key={option.id}>{option.companyName}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="开户账号">
            {getFieldDecorator('acceptAccount', {
              initialValue: acceptAccount
            })(
              <Select placeholder="请选择" disabled>
                {bankOptions.map(option => {
                  return <Option key={option.id}>{option.name}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="开户银行">
            {getFieldDecorator('acceptBankName', {
              initialValue: acceptBankName
            })(
              <Select placeholder="请选择" disabled>
                {bankOptions.map(option => {
                  return <Option key={option.id}>{option.name}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>通知财务已还款</Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps() {
  return {}
}

const wrappedNewPaymentFrame = Form.create()(injectIntl(NewPaymentFrame));

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewPaymentFrame)
