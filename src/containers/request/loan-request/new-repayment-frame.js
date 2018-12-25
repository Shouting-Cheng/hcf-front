import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select, Spin, Row, Col, InputNumber, message } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

import loanAndRefundService from 'containers/financial-management/loan-and-refund/loan-and-refund.service';
import LPService from 'containers/enterprise-manage/legal-person/legal-person.service';
import ImageUpload from 'widget/image-upload';
import Chooser from 'widget/chooser';
import 'styles/request/loan-request/new-repayment-frame.scss';

class NewPaymentFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      accountFetching: false,
      accountOptions: [],
      acceptAccountName: undefined,
      acceptAccount: undefined,
      acceptBankName: undefined,
      repayAttchment: [],
      repayAttchmentImages: [],
      currency: null,
      amount: 0,
      isEditBankInfo: true,
      info: {},
      myBankInfo: {},
      loanRefund: false,
      paymentType: 'cash', //付款方式
    };
  }

  componentDidMount() {
    this.getAcceptAccount();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.params.hasInit) {
      nextProps.params.hasInit = true;
      this.setState(
        {
          currency: nextProps.params.info ? nextProps.params.info.originCurrencyCode : '', //原币种
          amount: nextProps.params.amount,
          info: nextProps.params.info || {},
          loanRefund: nextProps.params.loanRefund,
          paymentType: this.props.profile['finance.cash.repaymemt.disabled'] ? 'card' : 'cash',
          acceptAccount: this.state.accountOptions[0] && this.state.accountOptions[0].cardNumber,
          acceptBankName: this.state.accountOptions[0] && this.state.accountOptions[0].accountBank,
          repayAttchment: [],
          repayAttchmentImages: [],
        },
        () => {
          !this.state.myBankInfo.bankAccountNo && this.getBankInfo();
          this.props.form.resetFields();
        }
      );
    }
  }

  //获取还款用户的默认账户信息
  getBankInfo = () => {
    let { info, isEditBankInfo } = this.state;
    this.state.info.applicant &&
      loanAndRefundService
        .getAccountBankInfo(info.applicationOid, info.applicant.userOid)
        .then(res => {
          res.data.map(item => {
            if (item.isPrimary) {
              isEditBankInfo = !!item.userOid;
              this.setState({ myBankInfo: item || {}, isEditBankInfo });
            }
          });
        });
  };

  handlePaymentTypeChange = value => {
    this.setState({ paymentType: value }, () => {
      const { myBankInfo, info, accountOptions } = this.state;
      this.props.form.setFieldsValue({
        payAccountName: myBankInfo.bankAccountName || info.applicant.fullName,
        payAccount: myBankInfo.bankAccountNo,
        payBankName: myBankInfo.bankCode
          ? [{ bankCode: myBankInfo.bankCode, bankBranchName: myBankInfo.branchName }]
          : undefined,
        remark: undefined,
        acceptAccountName: accountOptions[0].companyName,
        acceptAccount: accountOptions[0].cardNumber,
        acceptBankName: accountOptions[0].accountBank,
      });
    });
  };

  //获取收款方信息
  getAcceptAccount = () => {
    this.setState({ accountFetching: true });
    LPService.getLegalList({ page: 0, size: 100 })
      .then(res => {
        this.setState({
          accountFetching: false,
          accountOptions: res.data,
          acceptAccount: res.data[0].cardNumber,
          acceptBankName: res.data[0].accountBank,
        });
      })
      .catch(() => {
        this.setState({ accountFetching: false });
      });
  };

  onChangeAcceptAccount = id => {
    this.state.accountOptions.map(item => {
      if (item.id === id) {
        this.setState(
          {
            acceptAccountName: item.companyName,
            acceptAccount: item.cardNumber,
            acceptBankName: item.accountBank,
          },
          () => {
            this.props.form.setFieldsValue({
              acceptAccountName: this.state.acceptAccountName,
              acceptAccount: this.state.acceptAccount,
              acceptBankName: this.state.acceptBankName,
            });
          }
        );
      }
    });
  };

  //获取上传图片的OId
  getUploadImageOId = values => {
    let repayAttchment = [];
    values.map(item => {
      repayAttchment.push({ attachmentOid: item.attachmentOid });
    });
    this.setState({ repayAttchment, repayAttchmentImages: values });
  };

  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { info, repayAttchment, paymentType, loanRefund } = this.state;
        values.loanApplicationOid = info.applicationOid;
        values.repayAttchment = repayAttchment;
        loanRefund && (values.isFinance = true);
        values.payBankName && (values.payBankName = values.payBankName[0].bankBranchName);
        values.paymentType === 'card' &&
          (values.acceptAccountName =
            this.state.acceptAccountName || this.state.accountOptions[0].companyName);
        this.setState({ loading: true });
        let method = loanRefund && paymentType === 'cash' ? 'cashRepayment' : 'cardRepayment';
        loanAndRefundService[method](values)
          .then(() => {
            this.setState({ loading: false });
            message.success(this.$t('common.operate.success'));
            this.props.close(true);
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
          });
      }
    });
  };

  handleCancel = () => {
    this.props.close();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      loading,
      accountFetching,
      accountOptions,
      acceptAccount,
      acceptBankName,
      currency,
      amount,
      info,
      paymentType,
      loanRefund,
      myBankInfo,
      isEditBankInfo,
      repayAttchmentImages,
    } = this.state;
    let applicant = info.applicant || {}; //申请人信息
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-repayment-frame">
        <Form onSubmit={this.handleSave}>
          <h4 className="title">{this.$t('request.detail.loan.payer.info') /*还款方信息*/}</h4>
          {loanRefund && (
            <div>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.loan.all.name') /*姓名*/}
                style={{ marginBottom: 20 }}
              >
                <div>{applicant.fullName}</div>
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.department.name' /*部门*/)}
              >
                <div>{info.departmentName || '-'}</div>
              </FormItem>
            </div>
          )}
          <Row>
            <Col span={6} className="form-define-title required">
              {this.$t('request.detail.loan.payment.amount' /*还款金额*/)}：
            </Col>
            <Col span={3} offset={1}>
              <FormItem>
                {getFieldDecorator('curreny', {
                  initialValue: currency,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={5}>
              <FormItem>
                {getFieldDecorator('repaymentValue', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                    {
                      pattern: /[1-9]/,
                      message: this.$t(
                        'request.detail.loan.pay.amount.greater.than.0' /*还款金额要大于 0*/
                      ),
                    },
                  ],
                  initialValue: amount,
                })(
                  <InputNumber
                    min={0}
                    max={amount}
                    precision={2}
                    className="input-number"
                    disabled={
                      !loanRefund && this.props.profile['ca.opt.didi.refund.amount.disabled']
                    }
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          {loanRefund && (
            <FormItem
              {...formItemLayout}
              label={this.$t('request.detail.loan.payment.method' /*还款方式*/)}
            >
              {getFieldDecorator('paymentType', {
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.enter'),
                  },
                ],
                initialValue: paymentType,
              })(
                <Select onChange={this.handlePaymentTypeChange}>
                  {!this.props.profile['finance.cash.repaymemt.disabled'] && (
                    <Option key="cash">
                      {this.$t('request.detail.loan.payment.cash' /*现金还款*/)}
                    </Option>
                  )}
                  <Option key="card">
                    {this.$t('request.detail.loan.payment.transfer' /*转账还款*/)}
                  </Option>
                </Select>
              )}
            </FormItem>
          )}
          {(!loanRefund || paymentType === 'card') && (
            <div>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.loan.account.name') /*开户名*/}
              >
                {getFieldDecorator('payAccountName', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                  initialValue: myBankInfo.bankAccountName || applicant.fullName,
                })(
                  <Input disabled={!isEditBankInfo} placeholder={this.$t('common.please.enter')} />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.loan.account.number') /*开户账号*/}
              >
                {getFieldDecorator('payAccount', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                  initialValue: myBankInfo.bankAccountNo,
                })(
                  <Input disabled={!isEditBankInfo} placeholder={this.$t('common.please.enter')} />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.loan.account.bank') /*开户银行*/}
                className="pay-bank-container"
              >
                {getFieldDecorator('payBankName', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.select'),
                    },
                  ],
                  initialValue: myBankInfo.bankCode
                    ? [
                        {
                          bankCode: myBankInfo.bankCode || '',
                          bankBranchName: myBankInfo.branchName,
                        },
                      ]
                    : undefined,
                })(
                  <Chooser
                    single={true}
                    type="select_bank"
                    placeholder={this.$t('common.please.select')}
                    labelKey="bankBranchName"
                    valueKey="bankCode"
                  />
                )}
              </FormItem>
            </div>
          )}
          {!loanRefund && (
            <FormItem
              {...formItemLayout}
              label={`${this.$t('request.detail.loan.image') /*流水转账凭证*/}（${this.$t(
                'common.max.image.length',
                { max: 3 }
              )}）`}
            >
              {getFieldDecorator('repayAttchment', {
                rules: [
                  {
                    required: !this.props.profile['ca.opt.didi.refund.upload.disabled'],
                    message: this.$t('common.please.select'),
                  },
                ],
                initialValue: [],
              })(
                <ImageUpload
                  attachmentType="REPAYMENT_IMAGES"
                  defaultFileList={repayAttchmentImages}
                  isShowDefault
                  maxNum={3}
                  onChange={this.getUploadImageOId}
                />
              )}
            </FormItem>
          )}
          {loanRefund && (
            <FormItem {...formItemLayout} label={this.$t('common.remark')}>
              {getFieldDecorator('remark', {
                rules: [
                  {
                    max: 200,
                    message: this.$t('common.max.characters.length', { max: 200 }),
                  },
                ],
              })(
                <TextArea
                  placeholder={this.$t('common.max.characters.length', { max: 200 })}
                  rows={3}
                  style={{ resize: 'none' }}
                />
              )}
            </FormItem>
          )}
          {(!loanRefund || paymentType === 'card') && (
            <div>
              <h4 className="title">
                {this.$t('request.detail.loan.receiver.info') /*收款方信息*/}
                <span>
                  {' '}
                  {this.$t('request.detail.loan.receiver.notice') /*请按以下收款方账号打款*/}
                </span>
              </h4>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.loan.account.name') /*开户名*/}
                className="accept-account-container"
              >
                {getFieldDecorator('acceptAccountName', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.select'),
                    },
                  ],
                  initialValue: accountOptions[0] && accountOptions[0].companyName,
                })(
                  <Select
                    placeholder={this.$t('common.please.select')}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    getPopupContainer={() =>
                      document.getElementsByClassName('accept-account-container')[0]
                    }
                    onChange={this.onChangeAcceptAccount}
                    notFoundContent={
                      accountFetching ? (
                        <Spin size="small" />
                      ) : (
                        this.$t('request.detail.loan.no.result' /*无匹配结果*/)
                      )
                    }
                  >
                    {accountOptions.map(option => {
                      return <Option key={option.id}>{option.companyName}</Option>;
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.loan.account.number') /*开户账号*/}
              >
                {getFieldDecorator('acceptAccount', {
                  initialValue: acceptAccount,
                })(<Input disabled />)}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={this.$t('request.detail.loan.account.bank') /*开户银行*/}
              >
                {getFieldDecorator('acceptBankName', {
                  initialValue: acceptBankName,
                })(<Input disabled />)}
              </FormItem>
            </div>
          )}
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {loanRefund
                ? this.$t('request.detail.loan.confirm' /*确认*/)
                : this.$t('request.detail.loan.notification.finance' /*通知财务已还款*/)}
            </Button>
            <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
  };
}

const wrappedNewPaymentFrame = Form.create()(NewPaymentFrame);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewPaymentFrame);
