/**
 * Created by 13576 on 2017/12/4.
 */
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
  Steps,
  Modal,
  Tag,
  Icon,
  Spin,
} from 'antd';
const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;
const { TextArea } = Input;
import ListSelector from 'widget/list-selector';
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service';
import SelectContract from './select-contract';
import Chooser from './chooser';
import moment from 'moment';
import Header from 'antd/lib/calendar/Header';
import mePrePaymentService from './me-pre-payment.service';

import SelectReceivables from 'widget/select-receivables';
import {connect} from "dva/index";
class NewPrePaymentDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currency: null,
      partnerCategoryOptions: [],
      currencyList: [],
      payWayTypeList: [],
      showListSelector: false,
      contractValue: [],
      amount: '',
      availableAmount: '',
      lineNumber: '',
      dueDate: '',
      accountName: '',
      number: '',
      paymentRequisitionHeaderId: '',
      contract: {},
      paymentReqTypeId: '',
      params: {},
      contractParams: {},
      partnerInfo: {},
      flag: false,
      newParams: {},
      bankInfos: [],
      bankBranchCode: '',
      bankBranchName: '',
      remark: '',
      selectedData: [],
      partnerdSelectedData: [],
      fetching: false,
    };
  }
  componentWillMount() {
    this.getCurrencyList();
    this.getPayWayTypeList();
  }

  componentDidMount() {
    this.setState(
      {
        paymentRequisitionHeaderId: this.props.params.id,
        paymentReqTypeId: this.props.params.paymentReqTypeId,
        params: this.props.params.record,
        newParams: this.props.params,
        accountName: this.props.params.record.accountName,
        number: this.props.params.record.accountNumber,
        lineNumber: this.props.params.record.contractLineNumber,
        flag: true,
        dueDate: this.props.params.record.dueDate,
        remark: this.props.params.remark,
        partnerInfo: this.props.params.record.id
          ? {
            isEmp: this.props.params.record.partnerCategory != 'VENDER',
            code: this.props.params.record.partnerCode,
            name: this.props.params.record.partnerName,
            id: this.props.params.record.partnerId,
            partnerCategory: this.props.params.record.partnerCategory,
          }
          : {},
        contractValue: this.props.params.record.contractLineId
          ? [
            {
              key: this.props.params.record.contractLineId,
              label: this.props.params.record.contractNumber,
              value: this.props.params.record,
            },
          ]
          : [],
        selectedData: this.props.params.record.contractLineId
          ? [this.props.params.record.contractLineId]
          : [],
        contract: {
          lineNumber: this.props.params.record.contractLineNumber,
          contractLineId: this.props.params.record.contractLineId,
          contractNumber: this.props.params.record.contractNumber,
          contractId: this.props.params.record.contractId,
        },
      },
      () => {
        if (this.state.params.id) {
          this.getReceivables(
            this.props.params.record.partnerId,
            this.props.params.record.partnerCategory
          );
        }
        this.getCashTransactionList();
      }
    );
  }

  //获取现金事务
  getCashTransactionList = () => {
    //如果存在就不需要再获取了
    if (this.state.partnerCategoryOptions && this.state.partnerCategoryOptions.length) {
      return;
    }
    httpFetch
      .get(
      `${config.prePaymentUrl}/api/cash/pay/requisition/types/queryTransactionClassByTypeId/${
      this.state.paymentReqTypeId
      }`
      )
      .then(res => {
        this.setState({ partnerCategoryOptions: res.data });
      });
  };
  //获取币种列表
  getCurrencyList = () => {
    httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll`).then(res => {
      this.setState({ currencyList: res.data });
    });
  };
  //获取付款方式类型
  getPayWayTypeList = () => {
    this.getSystemValueList(2105).then(res => {
      this.setState({ payWayTypeList: res.data.values });
    });
  };
  onCancel = () => {
    this.props.onClose && this.props.onClose();
  };
  handleListCancel = () => {
    this.setState({
      showListSelector: false,
      contractParams: {},
    });
  };
  handleListOk = result => {
    if (result.result.length) {
      let value = [];
      result.result.map(item => {
        value.push({
          key: item.contractLineId,
          label: item.contractNumber,
          value: item,
        });
      });
      this.setState({
        showListSelector: false,
        contractValue: value,
        lineNumber: result.result[0].lineNumber,
        dueDate: moment(result.result[0].dueDate).format('YYYY-MM-DD'),
        contract: result.result[0],
        selectedData: [result.result[0].contractLineId],
      });
    }
  };
  //保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = { ...this.state.params, ...values };
        values.paymentRequisitionHeaderId = this.state.paymentRequisitionHeaderId;
        if (values.application && values.application.length) {
          values.refDocumentId = values.application[0].id;
        }
        values.partnerId = values.partnerd.key;
        values.partnerName = values.partnerd.label;
        values.contractLineNumber = this.state.contract.lineNumber
          ? this.state.contract.lineNumber
          : '';
        values.contractLineId = this.state.contract.contractLineId;
        values.contractNumber = this.state.contract.contractNumber;
        values.contractId = this.state.contract.contractId;
        values.bankBranchCode = this.state.bankBranchCode;
        values.bankBranchName = this.state.bankBranchName;
        values.paymentMethodCategory = this.state.params.paymentMethodCode;
        values.isEnabled = true;
        values.currency = values.currency && values.currency.key;
        delete values.application;
        delete values.partnerd;
        let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/insertOrUpdateLine`;
        this.setState({ loading: true });
        httpFetch
          .post(url, [values])
          .then(res => {
            if (res.status === 200) {
              this.props.onClose && this.props.onClose(true);
              message.success('保存成功');
              this.setState({ loading: false });
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(`保存失败, ${e.response.data.message}`);
          });
      }
    });
  };
  detail = id => {
    let url = menuRoute.getRouteItem('contract-detail', 'key');
    window.open(url.url.replace(':id', id).replace(':from', 'pre-payment'), '_blank');
  };
  clickContractSelect = (open) => {
    if (!open) return;
    if (!this.props.form.getFieldValue('currency')) {
      message.warning('请先选择币种');
      return;
    }
    let partner = this.props.form.getFieldValue('partnerd');
    if (JSON.stringify(partner) === '[]' || partner.key === '') {
      message.warning('请先选择收款方！');
      return;
    }
    this.refs.contractSelect.blur();
    let model = {
      companyId: this.state.newParams.companyId,
      partnerCategory: this.props.form.getFieldValue('partnerCategory'),
      partnerId: partner.key,
      documentType: 'PREPAYMENT_REQUISITION',
      currency: this.props.form.getFieldValue('currency'),
    };
    this.setState({
      showListSelector: true,
      contractParams: model,
    });
  };
  //收款方类型变化事件
  onPartnerCategory = value => {
    this.props.form.setFieldsValue({ partnerd: [] });
    this.props.form.setFieldsValue({ accountNumber: '', accountName: '' });
    this.setState({
      selectedData: [],
      accountNumber: '',
      accountName: '',
      bankInfos: [],
      partnerInfo: {},
      contractValue: [],
      contract: {},
    });
  };
  //获取收款方数据
  getPartnerd = (value, partnerCategory) => {
    let type = partnerCategory === 'EMPLOYEE' ? 1001 : 1002;
    mePrePaymentService
      .getPartnerd(value, type)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            partnerdSelectedData: res.data,
          });
        }
      })
      .catch(e => {
        console.log(`获取收款方数据失败：${e.response.data}`);
      });
  };
  //收款方变化事件

  handle = record => {
    this.props.form.setFieldsValue({ accountNumber: '' });
    this.props.form.setFieldsValue({ accountName: '' });
    if (record) {
      let payeeCategory = this.props.form.getFieldValue('partnerCategory');
      let accountList = [];
      if (payeeCategory === 'EMPLOYEE') {
        reimburseService.getAccountByUserId(record.key).then(res => {
          res.data &&
            res.data.map(item => {
              if (item.enable) {
                if (item.isPrimary) {
                  this.props.form.setFieldsValue({ accountNumber: item.bankAccountNo });
                  this.props.form.setFieldsValue({ accountName: item.bankAccountName });
                  this.setState({
                    bankLocationName: item.bankName,
                    bankLocationCode: item.bankCode,
                    accountNumber: item.bankAccountNo,
                    accountName: item.bankAccountName,
                  });
                }
                accountList.push({
                  bankAccountNo: item.bankAccountNo,
                  accountName: item.bankAccountName,
                  bankName: item.bankName,
                  bankCode: item.bankCode,
                });
              }
            });
          accountList.length === 0 &&
            message.warning('该收款方没有银行信息，请先维护改收款方下银行信息！');
          this.setState({
            selectedData: [],
            contractValue: [],
            payeeId: record.key,
            payeeName: record.label,
            bankInfos: accountList,
          });
        });
      } else if (payeeCategory === 'VENDER') {
        reimburseService.getAccountByVendorId(record.key).then(res => {
          res.data.body &&
            res.data.body.map(item => {
              if (item.primaryFlag) {
                this.props.form.setFieldsValue({ accountNumber: item.bankAccount });
                this.props.form.setFieldsValue({ accountName: item.venBankNumberName });
                this.setState({
                  bankLocationName: item.bankName,
                  bankLocationCode: item.bankCode,
                  accountNumber: item.bankAccountNo,
                  accountName: item.bankAccountName,
                });
              }
              accountList.push({
                bankAccountNo: item.bankAccount,
                accountName: item.venBankNumberName,
                bankName: item.bankName,
                bankCode: item.bankCode,
              });
            });
          accountList.length === 0 &&
            message.warning('该收款方没有银行信息，请先维护改收款方下银行信息！');
          this.setState({
            selectedData: [],
            contractValue: [],
            payeeId: record.key,
            payeeName: record.label,
            bankInfos: accountList,
          });
        });
      }
    }
  };

  //获取收款方
  getReceivables = (value, payeeCategory) => {
    if (!value) return;
    console.log(value);
    let accountList = [];
    if (payeeCategory == 'EMPLOYEE') {
      reimburseService.getAccountByUserId(value).then(res => {
        res.data &&
          res.data.map(item => {
            if (item.enable) {
              accountList.push({
                bankAccountNo: item.bankAccountNo,
                accountName: item.bankAccountName,
                bankName: item.bankName,
                bankCode: item.bankCode,
              });
            }
          });
        accountList.length === 0 &&
          message.warning('该收款方没有银行信息，请先维护改收款方下银行信息！');
        this.setState({ bankInfos: accountList });
      });
    } else if (payeeCategory == 'VENDER') {
      reimburseService.getAccountByVendorId(value).then(res => {
        res.data.body &&
          res.data.body.map(item => {
            accountList.push({
              bankAccountNo: item.bankAccount,
              accountName: item.venBankNumberName,
              bankName: item.bankName,
              bankCode: item.bankCode,
            });
          });
        accountList.length === 0 &&
          message.warning('该收款方没有银行信息，请先维护改收款方下银行信息！');
        this.setState({ bankInfos: accountList });
      });
    }
  };
  accountNumberChange = value => {
    let bankInfo = this.state.bankInfos.find(o => o.bankAccountNo == value);
    this.props.form.setFieldsValue({
      accountName: bankInfo.accountName,
    });
    this.setState({
      accountName: bankInfo.accountName,
      bankBranchCode: bankInfo.bankCode,
      bankBranchName: bankInfo.bankName,
    });
  };
  //币种改变清掉申请单和合同
  currencyChange = () => {
    this.props.form.setFieldsValue({ application: [] });
    this.setState({
      contractValue: [],
      contract: {},
      selectedData: [],
    });
  };
  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('金额不能小于等于0！');
  };
  //收款方select搜索
  onPartnerdSelectSearch = value => {
    if (!value) {
      this.setState({ partnerdSelectedData: [] });
      return;
    }
    this.setState({ fetching: true });
    let type = this.props.form.getFieldValue('partnerCategory') === 'EMPLOYEE' ? 1001 : 1002;
    mePrePaymentService.getPartnerd(value, type).then(res => {
      this.setState({
        partnerdSelectedData: res.data,
        fetching: false,
      });
    });
  };
  /**
   * 鼠标移出事件
   */
  onAmountMouseMove = e => {
    let amount = this.props.form.getFieldValue('amount');
    this.props.form.setFieldsValue({ amount: this.filterMoney(amount, 2, true).replace(/,/g, '') });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      fetching,
      partnerdSelectedData,
      bankInfos,
      loading,
      params,
      accountName,
      number,
      contract,
      contractValue,
      dueDate,
      lineNumber,
      availableAmount,
      amount,
      currency,
      showListSelector,
      partnerCategoryOptions,
      currencyList,
      payWayTypeList,
      contractParams,
      partnerInfo,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div className="new-pay-plan">
        <Form onSubmit={this.handleSave}>
          <div className="common-item-title">基本信息</div>
          <FormItem {...formItemLayout} label="预付款类型">
            {getFieldDecorator('cshTransactionClassId', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: params.id ? params.cshTransactionClassId.toString() : '',
            })(
              <Select placeholder="请选择">
                {partnerCategoryOptions.map(option => {
                  return <Option key={option.id}>{option.description}</Option>;
                })}
              </Select>
              )}
          </FormItem>
          <Row gutter={8}>
            <Col span={8} className="ant-form-item-label label-style">
              预付款金额：
            </Col>
            <Col span={5} className="ant-col-offset-1">
              <FormItem>
                {getFieldDecorator('currency', {
                  rules: [
                    {
                      required: true,
                      message: '请选择币种',
                    },
                  ],
                  initialValue:{key: params.id ? params.currency : this.props.company.baseCurrency,label:params.id ? params.currency+"-"+params.currencyName : this.props.company.baseCurrency+"-"+this.props.company.baseCurrencyName},
                })(
                  <Select onChange={this.currencyChange} labelInValue>
                    {currencyList.map(item => {
                      return <Option key={item.currency}>{item.currency}-{item.currencyName}</Option>;
                    })}
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col span={5}>
              <FormItem className="ant-col-offset-1">
                {getFieldDecorator('amount', {
                  rules: [{ validator: this.checkPrice }],
                  initialValue: params.id
                    ? Number(this.filterMoney(params.amount, 2, true).replace(/,/g, ''))
                    : '',
                })(
                  <InputNumber
                    placeholder="请输入"
                    style={{ width: '100%' }}
                    onBlur={this.onAmountMouseMove}
                  />
                  )}
              </FormItem>
            </Col>
          </Row>
          <FormItem {...formItemLayout} label="收款方类型">
            {getFieldDecorator('partnerCategory', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: params.id ? params.partnerCategory : 'EMPLOYEE',
            })(
              <Select onChange={this.onPartnerCategory}>
                <Option value="EMPLOYEE">员工</Option>
                <Option value="VENDER">供应商</Option>
              </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="收款方">
            {getFieldDecorator('partnerd', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: params.id
                ? { key: partnerInfo.code, label: partnerInfo.name }
                : { key: '', label: '' },
            })(
              <SelectReceivables
                onChange={this.handle}
                type={this.props.form.getFieldValue('partnerCategory')}
                disabled={!this.props.form.getFieldValue('partnerCategory')}
              />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="收款方银行账户">
            {getFieldDecorator('accountNumber', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: number,
            })(
              <Select onChange={this.accountNumberChange}>
                {bankInfos.map(item => {
                  return (
                    <Option key={item.bankAccountNo} value={item.bankAccountNo}>
                      {item.bankAccountNo}
                    </Option>
                  );
                })}
              </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="收款方户名">
            {getFieldDecorator('accountName', {
              rules: [
                {
                  required: false,
                  message: '请输入',
                },
              ],
              initialValue: accountName,
            })(<Input disabled />)}
          </FormItem>
          <FormItem {...formItemLayout} label="关联申请">
            {getFieldDecorator('application', {
              rules: [
                {
                  required: params.isApply,
                  message: '请选择',
                },
              ],
              initialValue:
                params.id && params.isApply
                  ? [{ businessCode: params.refDocumentCode, id: params.refDocumentId }]
                  : [],
            })(
              <Chooser
                placeholder={this.$t('common.please.select')}
                type="select_application_reimburse"
                labelKey="businessCode"
                valueKey="id"
                single={true}
                disabled={!params.isApply}
                listExtraParams={{
                  prepaymentTypeId: this.state.paymentReqTypeId,
                  prepaymentRequisitionHeaderId: this.state.paymentRequisitionHeaderId,
                  companyId: this.state.newParams.companyId,
                  unitId: this.props.params.headerData.unitId,
                  applicantId: this.props.params.headerData.createdBy,
                  currencyCode: this.props.form.getFieldValue('currency').key,
                }}
              />
              )}
            {/* <a style={{ position: 'absolute', marginLeft: '21vw', marginTop: -40, left: '102%', top: '1%', whiteSpace: 'nowrap' }}>查看详情</a> */}
          </FormItem>
          <FormItem {...formItemLayout} label="付款方式类型">
            {getFieldDecorator('paymentMethodCategory', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: params.payMethodsType,
            })(<Input disabled />)}
          </FormItem>
          <FormItem {...formItemLayout} label="计划付款日期">
            {getFieldDecorator('requisitionPaymentDate', {
              initialValue: (params.id && params.requisitionPaymentDate) ? moment(params.requisitionPaymentDate) : moment(new Date()),
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
            })(<DatePicker style={{ width: '100%' }} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: params.id ? params.description : this.state.remark,
            })(<Input.TextArea placeholder="请输入" />)}
          </FormItem>
          <div className="common-item-title">合同信息</div>
          <div style={{ marginBottom: '16px', marginLeft: '60px' }}>
            <Row gutter={8}>
              <Col span={4} className="ant-form-item-label">
                关联合同:
              </Col>
              <Col span={16}>
                <Select allowClear
                  ref="contractSelect"
                  value={contractValue}
                  labelInValue
                  dropdownStyle={{ display: 'none' }}
                  onDropdownVisibleChange={this.clickContractSelect}
                />
                <div style={{ marginTop: '8px' }}>
                  {contractValue.length == 0
                    ? '注：根据收款方选择合同'
                    : `付款计划序号：${lineNumber} | 付款计划日期：${moment(dueDate).format(
                      'YYYY-MM-DD'
                    )}`}
                </div>
              </Col>
             {/* <Col span={4} style={{ textAlign: 'left' }} className="ant-form-item-label">
                {contractValue.length > 0 && (
                  <a onClick={() => this.detail(contract.contractId)}>查看详情</a>
                )}
              </Col>*/}
            </Row>
          </div>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button onClick={this.onCancel}>取消</Button>
          </div>
        </Form>
        <SelectContract
          visible={showListSelector}
          onCancel={this.handleListCancel}
          onOk={this.handleListOk}
          single={true}
          params={{ ...contractParams }}
          selectedData={this.state.selectedData}
        />
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}
const wrappedNewPrePaymentDetail = Form.create()(NewPrePaymentDetail);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewPrePaymentDetail);

