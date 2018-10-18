import { messages } from 'share/common';
import React from 'react';
import { connect } from 'react-redux';
import { Modal, message, Form, Input, InputNumber, Select, notification, Icon } from 'antd';
const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
import Chooser from 'components/chooser';
import confirmPaymentService from 'containers/financial-management/confirm-payment/confirm-payment.service';
import baseService from 'share/base.service';
import config from 'config';

//选择付款账户
class CompanyBankSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currencyList: [],
      paymentChequeNoDisable: true,
      selectorItem: {
        title: messages('payment.batch.company.bankAccount'),
        url: `${config.baseUrl}/api/companyBankAuth/get/own/info/${this.props.user.userOID}`,
        searchForm: [],
        columns: [
          { title: messages('payment.batch.company.accountName'), dataIndex: 'bankAccountName' },
          { title: messages('payment.batch.company.account'), dataIndex: 'bankAccountNumber' },
          { title: messages('payment.batch.company.bankName'), dataIndex: 'bankName' },
        ],
        key: 'companyBank.bankAccountNumber',
      },
    };
  }

  componentWillMount() {
    this.getSystemValueList(2105).then(res => {
      this.setState({
        paymentTypeMethods: {
          fetched: true,
          data: res.data.values,
        },
      });
    });
    baseService.getAllCurrencyByLanguage().then(res => {
      this.setState({ currencyList: res.data });
    });
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let account = values.paymentBankAccount[0];
        let result = {
          ...this.props.data,
          paymentBankAccount: account.bankAccountNumber,
          paymentBankCity: account.city,
          paymentCurrency: values.paymentCurrency,
          paymentExchangeRate: values.paymentExchangeRate,
          paymentName: account.bankAccountName,
          paymentOpeningBank: account.bankName,
          paymentOperatorNumber: account.bankCode,
          paymentRemark: values.paymentRemark,
          paymentType: values.paymentType[0].description,
          paymentCode: values.paymentType[0].paymentMethodCode,
          paymentCategory: values.paymentType[0].paymentMethodCategory,
          paymentChequeNo: values.paymentChequeNo,
        };
        this.setState({ loading: true });
        confirmPaymentService
          .confirmPayment(this.props.data.status, result)
          .then(res => {
            this.setState({ loading: false });
            this.props.onOk();
          })
          .catch(e => {
            this.setState({ loading: false });
            if (e.response.data && e.response.data.message) {
              notification.open({
                message: messages('payment.batch.company.bankName'),
                description: e.response.data.message,
                icon: <Icon type="frown-circle" style={{ color: '#e93652' }} />,
              });
              return;
            }
            if (e.name === 'SyntaxError') this.props.onOk();
            else
              notification.open({
                message: messages('confirm.payment.payFailure'),
                description: messages('common.error'),
                icon: <Icon type="frown-circle" style={{ color: '#e93652' }} />,
              });
          });
      }
    });
  };

  handleChangeAccount = result => {
    const { currencyList } = this.state;
    let companyBank = result.length > 0 ? result[0] : null;
    if (companyBank) {
      let targetCurrencyCode = companyBank.currencyCode;
      let rate = 1;
      currencyList.map(item => {
        if (item.currency === targetCurrencyCode) rate = item.rate;
      });
      this.props.form.setFieldsValue({
        paymentCurrency: targetCurrencyCode,
        paymentExchangeRate: rate,
      });
    }
  };

  paymentTypeCallback = valueList => {
    if (valueList && valueList[0].paymentMethodCode === 'PAY_IN_CHEQUE') {
      this.setState({ paymentChequeNoDisable: false });
    } else {
      this.props.form.setFieldsValue({ paymentChequeNo: null });
      this.setState({ paymentChequeNoDisable: true });
    }
  };

  componentWillReceiveProps(nextProps) {}

  render() {
    const { loading, paymentChequeNoDisable, selectorItem } = this.state;
    const { visible, onCancel } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <Modal
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleOk}
        title={messages('payment.batch.company.paySure')}
        confirmLoading={loading}
      >
        <Form>
          <FormItem {...formItemLayout} label={messages('payment.batch.search.account')}>
            {getFieldDecorator('paymentBankAccount', {
              rules: [
                {
                  required: true,
                  message: messages('common.name.is.required', {
                    name: messages('payment.batch.search.account'),
                  }),
                },
              ],
            })(
              <Chooser
                listExtraParams={{
                  setOfBooksId: this.props.company.setOfBooksId,
                  userOID: this.props.user.userOID,
                }}
                valueKey="bankAccountNumber"
                selectorItem={selectorItem}
                labelKey="bankAccountName"
                single
                onChange={this.handleChangeAccount}
              />
            )}
          </FormItem>
        </Form>
        <Form>
          <FormItem {...formItemLayout} label={messages('payment.batch.company.curry')}>
            {getFieldDecorator('paymentCurrency')(<Input disabled />)}
          </FormItem>
        </Form>
        <Form>
          <FormItem {...formItemLayout} label={messages('payment.batch.company.payWay')}>
            {getFieldDecorator('paymentType', {
              rules: [
                {
                  required: true,
                  message: messages('common.name.is.required', {
                    name: messages('payment.batch.company.payWay'),
                  }),
                },
              ],
            })(
              <Chooser
                type="payment_type"
                single
                labelKey="description"
                onChange={this.paymentTypeCallback}
                valueKey="paymentMethodCode"
              />
            )}
          </FormItem>
        </Form>
        <Form>
          <FormItem {...formItemLayout} label={messages('payment.batch.company.rate')}>
            {getFieldDecorator('paymentExchangeRate')(<Input disabled />)}
          </FormItem>
        </Form>
        <Form>
          <FormItem {...formItemLayout} label={messages('payment.batch.company.paymentChequeNo')}>
            {getFieldDecorator('paymentChequeNo', {
              rules: [
                {
                  required: !paymentChequeNoDisable,
                  message: messages('common.name.is.required', {
                    name: messages('payment.batch.company.paymentChequeNo'),
                  }),
                },
              ],
            })(
              <InputNumber
                style={{ width: '100%' }}
                precision={0}
                step={0}
                maxLength={8}
                disabled={paymentChequeNoDisable}
              />
            )}
          </FormItem>
        </Form>
        <Form>
          <FormItem {...formItemLayout} label={messages('payment.batch.company.remark')}>
            {getFieldDecorator('paymentRemark')(<TextArea maxLength={200} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

CompanyBankSelector.propTypes = {
  visible: React.PropTypes.bool,
  onCancel: React.PropTypes.func,
  onOk: React.PropTypes.func,
  afterClose: React.PropTypes.func,
  data: React.PropTypes.object,
};

CompanyBankSelector.defaultProps = {
  onOk: () => {},
  onCancel: () => {},
  afterClose: () => {},
};

function mapStateToProps(state) {
  return {
    company: state.login.company,
    user: state.login.user,
  };
}

const WrappedCompanyBankSelector = Form.create()(CompanyBankSelector);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedCompanyBankSelector);
