import React from 'react';
import config from 'config';
import httpFetch from 'share/httpFetch';
import {
  Form,
  Button,
  Input,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  message,
  Tag,
  Modal,
  Spin,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import SelectExpense from './select-expense';
import moment from 'moment';
import paymentRequisitionService from './paymentRequisitionService.service';
import ContractDetail from 'containers/reimburse/my-reimburse/reimburse-detail';
import ExpreportDetail from 'containers/reimburse/my-reimburse/reimburse-detail';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class NewPaymentRequisitionLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currencyList: [], //币种
      payWayTypeList: [], //付款方式
      params: {},
      showListSelector: false,
      expenseData: [], //选择的报账单行ID
      expenseValue: undefined, ///报账单LOV展示的值
      typeDeatilParams: null,
      detailId: undefined, //合同或者报账单ID
      showContractDetail: false, //合同详情
      lineData: {
        id: '',
        cshTransactionId: '', //来源待付ID
        refDocumentType: '', //关联单据类型
        refDocumentId: '', //关联单据头ID
        refDocumentLineId: '', //关联单据行ID，
        companyId: '', //机构ID
        partnerCategory: '', //收款对象
        partnerId: '', //收款对象ID
        cshTransactionClassId: '', //现金事务分类ID
        cshTransactionClassName: '', // 付款用途
        cashFlowItemId: '', //现金流量项ID
        exchangeRate: '', //汇率
        functionAmount: '', //本位币金额
        accountName: '', //银行户名
        accountNumber: '', //银行户名
        bankLocationCode: '', //分行代码
        bankLocationName: '', //分行名称
        provinceCode: '', //省份代码
        province: '', //省份名称
        cityCode: '', //城市代码
        cityName: '', //城市名称
        contractHeaderId: '', //关联合同ID
        paymentScheduleLineId: '', //资金计划行ID
        versionNumber: '',
        availableAmount: 0, //可支付金额
        freezeAmount: 0, //冻结总金额
        payeeName: '', //收款方
        contractNumber: '', //合同编号
        contractLineNumber: '', //付款计划序号
        contractDueDate: '', //付款计划日期
        cshTransactionTypeCode: '', //cshTransactionTypeCode
        refDocumentNumber: '', //报账单单号
        currency: '', //币种
      },
      headerData: {}, //单据头信息
      queryFlag: true,
      myPaymentRequisitionDetail:
        '/payment-requisition/my-payment-requisition/new-payment-requisition-detail/:id', //付款申请单详情
      employeeBankList: [],
      vendorBankList: [],
    };
  }
  componentWillMount() {
    this.getPayWayTypeList();
  }

  componentWillReceiveProps(nextProps) {
    const record = nextProps.match.params.record;
    this.setState({
      typeDeatilParams: nextProps.match.params.typeDeatilParams,
      headerData: nextProps.match.params.headerData,
    });
    this.setState(
      {
        lineData: {
          ...record,
        },
      },
      () => {
        let values = this.props.form.getFieldsValue();
        for (let name in values) {
          let result = {};
          if (name !== 'schedulePaymentDate') {
            result[name] = record[name];
          } else {
            name === 'schedulePaymentDate' && (result[name] = moment(record[name]));
          }
        }
        //this.props.form.resetFields();
      }
    );
    if (record.id && nextProps.match.params.flag && !this.props.match.params.flag) {
      //编辑
      paymentRequisitionService
        .queryLineByLineId(record.id)
        .then(res => {
          if (res.status === 200) {
            let data = res.data;
            let values = this.props.form.getFieldsValue();
            this.setState(
              {
                lineData: data,
                // queryFlag: false,
                expenseData: [
                  {
                    reportLineId: data.refDocumentLineId,
                  },
                ], //选择的报账单行ID
                expenseValue:
                  data.refDocumentNumber +
                  this.$t({ id: 'acp.payment.lienNumber' } /* 付款行：*/) +
                  data.scheduleLineNumber, ///报账单LOV展示的值
              },
              () => {
                for (let name in values) {
                  let result = {};
                  if (name !== 'schedulePaymentDate') {
                    result[name] = record[name];
                  } else {
                    name === 'schedulePaymentDate' && (result[name] = moment(record[name]));
                  }
                  this.props.form.setFieldsValue(result);
                }
              }
            );
            this.getBankList(data.partnerId, data.partnerCategory);
          }
        })
        .catch(e => {});
    }
  }
  //获取银行账号列表
  getBankList = (parterId, partnerCategory) => {
    if (partnerCategory === 'EMPLOYEE') {
      httpFetch
        .get(`${config.baseUrl}/api/contact/bank/account/user/id?userID=${parterId}`)
        .then(res => {
          this.setState({
            employeeBankList: res.data,
          });
        });
    } else {
      httpFetch.get(`${config.vendorUrl}/api/ven/bank?vendorInfoId=${parterId}`).then(res => {
        this.setState({
          vendorBankList: res.data.body,
        });
      });
    }
  };

  //获取币种列表
  getCurrencyList = () => {
    if (this.state.currencyList.length === 0) {
      httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll`).then(res => {
        this.setState({ currencyList: res.data });
      });
    }
  };

  onCancel = () => {
    this.props.close();
    this.props.form.resetFields();
  };

  handleListCancel = () => {
    this.setState({ showListSelector: false });
  };

  //保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { lineData, headerData } = this.state;
        if (lineData.availableAmount < values.amount) {
          message.error(
            this.$t({ id: 'acp.payment.amountError' } /* 本次申请金额大于可申请金额：*/)
          );
          return;
        }
        let acpRequisitionLine = { ...lineData, ...values };
        let acpRequisitionLineDTO = [];
        acpRequisitionLineDTO.push(acpRequisitionLine);
        let AcpRequisitionHeaderDTO = { ...headerData };
        AcpRequisitionHeaderDTO['paymentRequisitionLineDTO'] = acpRequisitionLineDTO;
        this.setState({ loading: true }, () => {
          paymentRequisitionService
            .saveFunc(AcpRequisitionHeaderDTO)
            .then(res => {
              if (res.status === 200) {
                this.props.close(true);
                message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
                this.setState({ loading: false });
              }
            })
            .catch(e => {
              this.setState({ loading: false });
              this.props.close(true);
              message.error(
                this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + e.response.data.message
              );
            });
        });
      }
    });
  };

  handle = values => {
    if (values && values.length) {
      this.setState({ accountName: values[0].bankNumberName, number: values[0].number });
    }
  };

  //获取付款方式类型
  getPayWayTypeList = () => {
    this.getSystemValueList(2105).then(res => {
      this.setState({ payWayTypeList: res.data.values });
    });
  };

  //合同返回
  onCloseContract = () => {
    this.setState({ showContractDetail: false });
  };
  //查看合同
  onViewContractDetail = id => {
    this.setState({ showContractDetail: true, detailId: id });
  };
  wrapClose = content => {
    let id = this.state.detailId;
    const newProps = {
      params: { id: id, refund: true },
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };
  //校验可支付
  checkAmount = (rule, value, callback) => {
    if (value && value > this.state.lineData.availableAmount) {
      callback(
        this.$t({ id: 'acp.payment.amountError' } /* 本次申请金额大于可申请金额：*/) +
          this.state.lineData.availableAmount
      );
    } else if (value <= 0) {
      callback(this.$t({ id: 'acp.amount.mustMoreThanZero' } /* 本次申请金额必须大于0!*/));
    } else {
      callback();
    }
  };
  //报账单返回
  onCloseExpreport = () => {
    this.setState({ showExpreportDetail: false });
  };

  detail = id => {
    this.setState({
      detailId: id,
      showExpreportDetail: true,
    });
  };

  //四舍五入 保留两位小数
  toDecimal2 = x => {
    let f = parseFloat(x);
    if (isNaN(f)) {
      return false;
    }
    f = Math.round(x * 100) / 100;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  };

  //金额失去焦点
  amountBlur = () => {
    let amount = this.props.form.getFieldValue('amount');
    let value = parseFloat(this.toDecimal2(amount));
    if (value > this.state.lineData.availableAmount) {
      value = this.state.lineData.availableAmount;
    }
    this.props.form.setFieldsValue({ amount: this.toDecimal2(value) });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      loading,
      currencyList,
      payWayTypeList,
      showListSelector,
      expenseData,
      expenseValue,
      typeDeatilParams,
      lineData,
      employeeBankList,
      vendorBankList,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 13, offset: 1 },
    };
    return (
      <div className="new-payment-requisition-line">
        <Form onSubmit={this.handleSave}>
          <div className="common-item-title">
            {this.$t({ id: 'acp.select.publicReport' } /* 请先选择报账单*/)}
          </div>
          <Row>
            <Col span={5} className="ant-form-item-label ant-form-item-required label-style">
              {this.$t({ id: 'acp.publicReport' } /* 报账单:*/)}{' '}
            </Col>
            <Col span={13} className="ant-col-offset-1">
              <FormItem>
                {getFieldDecorator('refDocumentNumber', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'acp.select.publicReport' } /* 请先选择报账单*/),
                    },
                  ],
                  initialValue: lineData.reportNumber,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={2} className="ant-col-offset-1">
              {lineData.refDocumentId === '' ? (
                ''
              ) : (
                <a
                  onClick={() => {
                    this.detail(lineData.refDocumentId);
                  }}
                >
                  {this.$t({ id: 'acp.view.detail' } /* 查看详情*/)}
                </a>
              )}
            </Col>
          </Row>
          <Row style={{ fontSize: '12px' }}>
            <Col span={6} className="ant-form-item-label" />
            <Col span={13} className="ant-col-offset-1" style={{ margin: '-20px 0px 10px 0px' }}>
              付款计划序号&nbsp;:&nbsp;&nbsp;{lineData.scheduleLineNumber}&nbsp;&nbsp;|&nbsp;&nbsp;付款计划日期&nbsp;&nbsp;:&nbsp;&nbsp;{moment(
                lineData.schedulePaymentDate
              ).format('YYYY-MM-DD')}
            </Col>
          </Row>
          <div className="common-item-title">{this.$t({ id: 'acp.detail' } /* 详情*/)}</div>
          <FormItem {...formItemLayout} label="收款方类型">
            <Input
              disabled
              value={
                lineData.partnerCategory !== ''
                  ? lineData.partnerCategory === 'EMPLOYEE'
                    ? this.$t({ id: 'acp.employee' } /*员工*/)
                    : this.$t({ id: 'acp.vendor' } /*供应商*/)
                  : ''
              }
            />
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'acp.partnerCategory' } /* 收款方*/)}>
            <Input disabled value={lineData.partnerName} />
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'acp.bank.number' } /*银行账号*/)}>
            {getFieldDecorator('accountNumber', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' } /*请选择*/),
                },
              ],
              initialValue: lineData.accountNumber,
            })(
              <Select>
                {lineData.partnerCategory === 'EMPLOYEE'
                  ? employeeBankList.map(item => {
                      return <Option key={item.bankCode}>{item.bankAccountNo}</Option>;
                    })
                  : vendorBankList.map(item => {
                      return <Option key={item.bankCode}>{item.bankAccount}</Option>;
                    })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'acp.accountName.detail' } /* 收款方户名*/)}
          >
            <Input disabled value={lineData.accountName === '' ? '-' : lineData.accountName} />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'acp.cshTransactionClassName' } /*付款用途*/)}
          >
            <Input
              disabled
              value={
                lineData.cshTransactionClassName !== '' ? lineData.cshTransactionClassName : '-'
              }
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'acp.paymentMethodType' } /*付款方式类型*/)}
          >
            {getFieldDecorator('paymentMethodCategory', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' } /*请选择*/),
                },
              ],
              initialValue: lineData.paymentMethod,
            })(
              <Select>
                {payWayTypeList.map(item => {
                  return <Option key={item.code}>{item.messageKey}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'acp.schedulePaymentDate' } /*计划付款日期*/)}
          >
            {getFieldDecorator('schedulePaymentDate', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' } /*请选择*/),
                },
              ],
              initialValue: moment(lineData.schedulePaymentDate),
            })(<DatePicker style={{ width: '100%' }} />)}
          </FormItem>
          <Row>
            <Col span={5} className="ant-form-item-label ant-form-item-required label-style">
              {this.$t({ id: 'acp.requisition.amount' } /*本次申请金额*/)}：{' '}
            </Col>
            <Col span={6} className="ant-col-offset-1">
              <FormItem>
                {getFieldDecorator('currencyCode', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.select' } /*请选择*/),
                    },
                  ],
                  initialValue: lineData.currency,
                })(
                  <Select disabled={true}>
                    {currencyList.map(item => {
                      return <Option key={item.currency}>{item.currencyName}</Option>;
                    })}
                  </Select>
                )}
                <div style={{ marginTop: '2px' }}>
                  {this.$t({ id: 'acp.delay.amount' } /*冻结总金额：*/)}
                  {lineData.currencyCode}
                  {this.filterMoney(lineData.freezeAmount)}
                </div>
              </FormItem>
            </Col>
            <Col span={7} style={{ marginLeft: 3 }}>
              <FormItem className="ant-col-offset-1">
                {getFieldDecorator('amount', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.enter' } /*请输入*/),
                    },
                    { validator: this.checkAmount },
                  ],
                  initialValue: lineData.availableAmount,
                })(
                  <InputNumber
                    onBlur={this.amountBlur}
                    placeholder={this.$t({ id: 'common.please.enter' } /*请输入*/)}
                    style={{ width: '100%' }}
                    step={0.01}
                    percision={2}
                  />
                )}
                <div style={{ marginTop: '2px' }}>
                  {this.$t({ id: 'acp.enabled.amount' } /*可申请金额：*/)}
                  {lineData.currencyCode}
                  {this.filterMoney(lineData.availableAmount)}
                </div>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={5} className="ant-form-item-label  label-style">
              关联合同
            </Col>
            <Col span={13} className="ant-col-offset-1">
              <FormItem>
                <Input disabled value={lineData.contractNumber ? lineData.contractNumber : '-'} />
              </FormItem>
            </Col>
            <Col span={2} className="ant-col-offset-1">
              {lineData.contractLineNumber === '' || lineData.contractLineNumber === null ? (
                ''
              ) : (
                <a
                  onClick={() => {
                    this.onViewContractDetail(lineData.contractHeaderId);
                  }}
                >
                  {this.$t({ id: 'acp.view.detail' } /*查看详情*/)}
                </a>
              )}
            </Col>
          </Row>
          <Row>
            <Col span={5} />
            <Col
              span={4}
              className="ant-col-offset-1"
              style={{ marginTop: '-20px', marginBottom: '20px' }}
            >
              {lineData.contractLineNumber === '' || lineData.contractLineNumber === null
                ? ''
                : this.$t({ id: 'acp.contract.lineNumber' } /*付款计划序号：*/) +
                  lineData.contractLineNumber}
            </Col>
            <Col
              span={8}
              className="ant-col-offset-1"
              style={{ marginTop: '-20px', marginBottom: '20px' }}
            >
              {lineData.contractDueDate === '' || lineData.contractDueDate === null
                ? ''
                : this.$t({ id: 'acp.contract.date' } /*付款计划日期：*/) +
                  lineData.contractDueDate}
            </Col>
          </Row>
          <FormItem {...formItemLayout} label={this.$t({ id: 'acp.remark' } /*备注*/)}>
            {getFieldDecorator('lineDescription', {
              initialValue: '',
            })(
              <TextArea
                autosize={{ minRows: 2 }}
                style={{ minWidth: '100%' }}
                placeholder={this.$t({ id: 'common.please.enter' } /*请输入*/)}
              />
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t({ id: 'common.save' } /*保存*/)}
            </Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' } /*取消*/)}</Button>
          </div>
        </Form>
        <Modal
          visible={this.state.showExpreportDetail}
          footer={[
            <Button key="back" size="large" onClick={this.onCloseExpreport}>
              {this.$t({ id: 'common.back' } /*返回*/)}
            </Button>,
          ]}
          width={1200}
          closable={false}
          destroyOnClose={true}
          onCancel={this.onCloseExpreport}
        >
          <div>{this.wrapClose(ExpreportDetail)}</div>
        </Modal>
        <Modal
          visible={this.state.showContractDetail}
          footer={[
            <Button key="back" size="large" onClick={this.onCloseContract}>
              {this.$t({ id: 'common.back' } /*返回*/)}
            </Button>,
          ]}
          width={1200}
          destroyOnClose={true}
          closable={false}
          onCancel={this.onCloseContract}
        >
          <div>{this.wrapClose(ContractDetail)}</div>
        </Modal>
      </div>
    );
  }
}

// React.Component.prototype.filterMoney = (money, fixed = 2) => {
//   let numberString = Number(money || 0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
//   numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
//   return {numberString};
// };


const wrappedNewPaymentRequisitionLine = Form.create()(NewPaymentRequisitionLine);

export default wrappedNewPaymentRequisitionLine;
