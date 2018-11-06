import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Spin,
  InputNumber,
  Modal,
  Checkbox,
  Row,
  Col,
  Select,
  Popover,
  Icon,
  Table,
  Popconfirm,
  message,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import moment from 'moment';
import baseService from 'share/base.service';
import requestService from 'containers/request/request.service';
import ExpenseTypeSelector from 'widget/Template/expense-type-selector';
import 'styles/request/new-request/expense-type-modal.scss';

class ExpenseTypeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: {},
      modalVisible: false,
      currencyFetching: false,
      rowIndex: undefined,
      currencyOptions: [],
      expenseChosenInfo: {}, //选中的费用类型信息
      canSubmit: false, //是否可以提交
      paymentType: 1001, //支付方式：1001（个人支付）、1002（公司支付）
      currencyCode: this.props.company.baseCurrency, //币种
      amount: null, //金额
      actualCurrencyRate: 1, //汇率
      companyCurrencyRate: 1, //企业汇率
      rateDeviation: 0.0, //汇率偏移
      expenseBudgetList: [],
      columns: [
        {
          title: '',
          dataIndex: 'id',
          width: '7%',
          render: (value, record) => <img src={record.expenseType.iconURL} style={{ width: 20 }} />,
        },
        {
          title: this.$t('request.edit.expense.type' /*费用类型*/),
          dataIndex: 'expenseType',
          render: value => <Popover content={value.name}>{value.name}</Popover>,
        },
        { title: this.$t('request.currency' /*币种*/), dataIndex: 'currencyCode', width: '8%' },
        {
          title: this.$t('request.amount' /*金额*/),
          dataIndex: 'amount',
          render: this.filterMoney,
        },
        {
          title: this.$t('request.edit.rate' /*汇率*/),
          dataIndex: 'actualCurrencyRate',
          render: (value, record) => {
            let rateDeviation =
              (
                (Math.abs(value - record.companyCurrencyRate) / record.companyCurrencyRate) *
                100
              ).toFixed(2) + '%';
            let content = (
              <div>
                <div>
                  {this.$t('request.edit.company.rate') /*企业汇率*/}：{record.companyCurrencyRate}
                </div>
                <div>
                  {this.$t('request.edit.rate.percentage') /*汇率差异*/}：{rateDeviation}
                </div>
              </div>
            );
            return value || 1;
          },
        },
        {
          title: this.$t('request.base.amount' /*本币金额*/),
          dataIndex: 'baseCurrencyAmount',
          render: value => this.filterMoney(value),
        },
        {
          title: this.$t('request.edit.pay.way' /*支付方式*/),
          dataIndex: 'paymentType',
          width: '12%',
          render: value =>
            value === 1001
              ? this.$t('request.edit.pay.by.myself' /*个人支付*/)
              : this.$t('request.edit.pay.by.company' /*公司支付*/),
        },
        {
          title: this.$t('common.operation'),
          dataIndex: 'expenseTypeOID',
          width: '9%',
          render: (value, record, index) => (
            <Popconfirm
              title={this.$t('common.confirm.delete')}
              onConfirm={e => this.deleteExpenseType(e, index)}
            >
              <a
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                {this.$t('common.delete')}
              </a>
            </Popconfirm>
          ),
        },
      ],
      warnExchangeRateTol: 10, //汇率容差警告值
      prohibitExchangeRateTol: 20, //汇率容差最大值
      applicationOID: null, //申请人OID
      baseCurrency: null, //申请人的本位币
    };
  }

  componentDidMount() {
    this.getCurrencyOptions();
    this.setState({
      value: this.props.value || {},
      expenseBudgetList: (this.props.value || {}).budgetDetail || [],
      baseCurrency: this.props.company.baseCurrency,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.baseCurrency && nextProps.company.baseCurrency !== this.state.baseCurrency) {
      this.setState({ baseCurrency: nextProps.company.baseCurrency }, () => {
        if (
          this.state.expenseBudgetList.length &&
          this.props.formDetail.currencyCode !== this.state.baseCurrency
        ) {
          message.info(
            this.$t('request.edit.budget.clear') /*申请人本位币变化，已清除添加的预算明细*/
          );
          this.setState({ value: {}, expenseBudgetList: [] });
          this.onChange(null);
        }
      });
    }
  }

  showExpenseModal = (flag, record = {}, index) => {
    this.setState({
      rowIndex: index,
      modalVisible: flag,
      amount: record.amount || 0,
      canSubmit: !!record.currencyCode,
      expenseChosenInfo: record,
      paymentType: record.paymentType || 1001,
      currencyCode: record.currencyCode || this.props.company.baseCurrency,
      currencyName: record.currencyName || this.props.company.baseCurrencyName,
      actualCurrencyRate: record.actualCurrencyRate || 1,
      companyCurrencyRate: record.companyCurrencyRate || 1,
    });
  };

  //选择费用类型
  handleSelectExpenseType = value => {
    const baseCurrency = this.props.company.baseCurrency;
    const { currencyCode, amount, actualCurrencyRate, prohibitExchangeRateTol } = this.state;
    let expenseChosenInfo = this.state.expenseChosenInfo;
    expenseChosenInfo.expenseType = value;
    this.setState({
      expenseChosenInfo,
      amount: value.id ? this.state.amount : 0,
      canSubmit:
        value.id &&
        amount &&
        (currencyCode === baseCurrency ||
          (currencyCode !== baseCurrency && actualCurrencyRate < prohibitExchangeRateTol)),
    });
  };

  //公司支付 or 个人支付
  handleCompanyPay = e => {
    this.setState({ paymentType: e.target.checked ? 1002 : 1001 });
  };

  //获取币种
  getCurrencyOptions = (open) => {
    if(open){
      (!this.state.currencyOptions.length || this.state.applicationOID !== this.props.user.userOID) &&
      this.service
        .getCurrencyList(this.props.formDetail.applicantOID || this.props.user.userOID)
        .then(res => {
          let currencyOptions = [];
          //过滤掉禁用的企业币种
          res.data.map(item => {
            item.enable && currencyOptions.push(item);
          });
          this.setState({
            currencyOptions,
            currencyFetching: false,
            applicationOID: this.props.user.userOID,
          });
        });
      this.getRateDeviation();
    }
  };

  //获取汇率
  getRate = () => {
    let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    requestService
      .getCurrencyRate(
        this.state.currencyCode,
        date,
        this.props.user.userOID,
        this.props.company.baseCurrency
      )
      .then(res => {
        this.setState({
          rateDeviation: 0,
          actualCurrencyRate: Number(res.data.rate).toFixed(4),
          companyCurrencyRate: Number(res.data.rate).toFixed(4),
        });
      });
  };

  //获取汇率容差
  getRateDeviation = () => {
    baseService.getRateDeviation(this.props.tenantId, this.props.company.setOfBooksId).then(res => {
      this.setState({
        warnExchangeRateTol: res.data.warnExchangeRateTol || 10,
        prohibitExchangeRateTol: res.data.prohibitExchangeRateTol || 20,
      });
    });
  };

  //选择币种
  handleCurrencyChange = value => {
    this.setState({ currencyCode: value }, () => {
      if (this.state.currencyCode !== this.props.company.baseCurrency) {
        this.getRate();
      }
    });
  };

  //修改金额
  handleAmountChange = value => {
    const baseCurrency = this.props.company.baseCurrency;
    const { currencyCode, rateDeviation, prohibitExchangeRateTol } = this.state;
    let canSubmit =
      value &&
      (currencyCode === baseCurrency ||
        (currencyCode !== baseCurrency && rateDeviation < prohibitExchangeRateTol));
    this.setState({
      amount: value,
      canSubmit,
    });
  };

  //修改汇率
  handleRateChange = value => {
    let rateDeviation = (
      (Math.abs(value - this.state.companyCurrencyRate) / this.state.companyCurrencyRate) *
      100
    ).toFixed(2);
    this.setState({
      actualCurrencyRate: value,
      rateDeviation,
      canSubmit: this.state.amount && rateDeviation < this.state.prohibitExchangeRateTol,
    });
  };

  //确定
  onOk = () => {
    let {
      rowIndex,
      expenseChosenInfo,
      paymentType,
      currencyCode,
      amount,
      actualCurrencyRate,
      companyCurrencyRate,
      expenseBudgetList,
      rateDeviation,
      warnExchangeRateTol,
      prohibitExchangeRateTol,
    } = this.state;
    let expenseType = {
      iconName: expenseChosenInfo.expenseType.iconName,
      name: expenseChosenInfo.expenseType.name,
      iconURL: expenseChosenInfo.expenseType.iconURL,
    };
    this.props.form.validateFieldsAndScroll(err => {
      if (!err) {
        let values = {
          expenseType,
          expenseTypeOID:
            expenseChosenInfo.expenseType.expenseTypeOID || expenseChosenInfo.expenseTypeOID,
          iconName: expenseChosenInfo.expenseType.iconName,
          iconURL: expenseChosenInfo.expenseType.iconURL,
          paymentType,
          currencyCode,
          amount,
          baseCurrencyAmount: amount * actualCurrencyRate,
          actualCurrencyRate: actualCurrencyRate || 1,
          companyCurrencyRate: companyCurrencyRate || 1,
          updateRate: true, // 汇率是否可以更新
          rateProhibit: false, // 汇率容差是否超出最大值
          rateWarning: false, // 汇率容差是否警告
          ratePercentage: rateDeviation,
        };
        if (rateDeviation >= prohibitExchangeRateTol) {
          values.rateProhibit = true;
          values.rateWarning = false;
        } else if (rateDeviation >= warnExchangeRateTol) {
          values.rateProhibit = false;
          values.rateWarning = true;
        } else {
          values.rateProhibit = false;
          values.rateWarning = false;
        }
        if (rowIndex || rowIndex === 0) {
          expenseBudgetList.map((item, index) => {
            index === rowIndex && (expenseBudgetList[index] = values);
          });
        } else {
          expenseBudgetList.push(values);
        }
        let value = this.state.value;
        if (expenseBudgetList.length) {
          let amount = 0;
          expenseBudgetList.map(item => {
            amount += item.amount * item.actualCurrencyRate;
          });
          value.budgetDetail = expenseBudgetList;
          value.amount = amount;
        } else {
          value = {};
        }
        this.setState({ value, expenseBudgetList }, () => {
          this.showExpenseModal(false);
          this.onChange(this.state.value);
        });
      }
    });
  };

  //删除
  deleteExpenseType = (e, index) => {
    //跪求别再改了
    e.stopPropagation();
    let expenseBudgetList = this.state.expenseBudgetList;
    expenseBudgetList.splice(index, 1);
    let value = this.state.value;
    if (expenseBudgetList.length) {
      let amount = 0;
      expenseBudgetList.map(item => {
        amount += item.amount * item.actualCurrencyRate;
      });
      value.budgetDetail = expenseBudgetList;
      value.amount = amount;
    } else {
      value = {};
    }
    this.setState({ value, expenseBudgetList }, () => {
      this.onChange(this.state.value.amount ? this.state.value : null);
    });
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { formDetail, company } = this.props;
    const {
      modalVisible,
      currencyFetching,
      currencyOptions,
      expenseChosenInfo,
      canSubmit,
      currencyCode,
      currencyName,
      companyCurrencyRate,
      actualCurrencyRate,
      expenseBudgetList,
      columns,
      rateDeviation,
      warnExchangeRateTol,
      prohibitExchangeRateTol,
    } = this.state;
    let amount = 0;
    expenseBudgetList.map(item => {
      amount += Number((item.amount * (item.actualCurrencyRate || 1)).toFixed(4));
    });
    return (
      <div className="expense-type-modal">
        {expenseBudgetList.length ? (
          <Table
            rowKey={(record, index) => index}
            columns={columns}
            dataSource={expenseBudgetList}
            pagination={false}
            style={{ width: '150%' }}
            onRow={(record, index) => ({
              onClick: () => this.showExpenseModal(true, record, index),
            })}
            footer={() => {
              return (
                <div style={{ textAlign: 'right', color: '#ff9900' }}>
                  {this.$t('request.edit.base.total.amount') /*本币总金额*/}：
                  <span style={{ fontSize: 20 }}>
                    {formDetail.currencyCode || company.baseCurrency} {this.filterMoney(amount)}
                  </span>
                </div>
              );
            }}
            bordered
            size="small"
          />
        ) : (
          ''
        )}

        <a onClick={() => this.showExpenseModal(true)}>
          <Icon type="plus-circle-o" className="add-budget-detail-icon" />
          {this.$t('request.edit.add.expense.and.amount') /*添加费用类型及金额*/}
        </a>

        <Modal
          title={this.$t('request.edit.add.expense.and.amount') /*添加费用类型及金额*/}
          wrapClassName="expense-type-modal"
          width={720}
          footer={
            <div>
              <Button onClick={() => this.showExpenseModal(false)}>
                {this.$t('common.cancel')}
              </Button>
              <Button type="primary" disabled={!canSubmit} onClick={this.onOk}>
                {this.$t('common.ok')}
              </Button>
            </div>
          }
          visible={modalVisible}
          onCancel={() => this.showExpenseModal(false)}
        >
          {expenseChosenInfo.expenseType &&
            expenseChosenInfo.expenseType.name && (
              <div className="expense-type-chosen">
                <div className="form-container">
                  <Row>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="item-title">
                          {this.$t('request.edit.chosen.type') /*已选类型*/}:{' '}
                        </Col>
                        <Col span={14} offset={1}>
                          <img src={expenseChosenInfo.expenseType.iconURL} className="icon-img" />
                          <Popover content={expenseChosenInfo.expenseType.name}>
                            <span className="icon-name">{expenseChosenInfo.expenseType.name}</span>
                          </Popover>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="item-title">
                          {this.$t('request.edit.pay.by.company' /*公司支付*/)}:{' '}
                        </Col>
                        <Col span={14} offset={1}>
                          <Checkbox
                            defaultChecked={expenseChosenInfo.paymentType === 1002}
                            onChange={this.handleCompanyPay}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row className="currency-row">
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="item-title required">
                          {this.$t('request.currency' /*币种*/)}:{' '}
                        </Col>
                        <Col span={14} offset={1}>
                          <Select
                            dropdownMatchSelectWidth={false}
                            style={{ width: '100%' }}
                            defaultValue={
                              currencyCode || formDetail.currencyCode
                            }
                            showSearch={true}
                            onDropdownVisibleChange={this.getCurrencyOptions}
                            onChange={this.handleCurrencyChange}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children
                                .toString()
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder={this.$t('common.please.select') /* 请选择 */}
                            >
                            {currencyOptions.map(item => {
                              return (
                                <Option key={item.currency} value={item.currency}>
                                  {item.currency}-{item.currencyName}
                                </Option>
                              );
                            })}
                          </Select>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="item-title required">
                          {this.$t('request.amount' /*金额*/)}:{' '}
                        </Col>
                        <Col span={14} offset={1}>
                          <InputNumber
                            size="small"
                            min={0}
                            precision={2}
                            step={0.01}
                            defaultValue={expenseChosenInfo.amount || undefined}
                            placeholder={this.$t('common.please.enter')}
                            style={{ width: '100%' }}
                            onChange={this.handleAmountChange}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  {currencyCode !== this.props.company.baseCurrency &&
                    this.props.formDetail.formType !== 2001 &&
                    this.props.formDetail.formType !== 2002 && (
                      <Row className="rate-row">
                        <Col span={12}>
                          <Row>
                            <Col span={8} className="item-title required">
                              {this.$t('request.edit.rate' /*汇率*/)}:{' '}
                            </Col>
                            <Col span={14} offset={1}>
                              <InputNumber
                                size="small"
                                min={0}
                                precision={4}
                                step={0.0001}
                                value={actualCurrencyRate || 0}
                                disabled={this.checkFunctionProfiles(
                                  'web.expense.rate.edit.disabled',
                                  true
                                )}
                                style={{ width: '100%' }}
                                onChange={this.handleRateChange}
                              />
                            </Col>
                          </Row>
                        </Col>
                        <Col span={12} className="company-rate">
                          {this.$t('request.edit.company.rate') /*企业汇率*/}:{' '}
                          <span>{companyCurrencyRate}</span>
                          {this.$t('request.edit.rate.diverge') /*偏离*/}:{' '}
                          <span
                            className={
                              rateDeviation >= prohibitExchangeRateTol
                                ? 'error'
                                : rateDeviation >= warnExchangeRateTol
                                  ? 'warning'
                                  : ''
                            }
                          >
                            {rateDeviation}%
                          </span>
                        </Col>
                      </Row>
                    )}
                </div>
              </div>
            )}
          <div className="expense-type-container">
            <ExpenseTypeSelector
              onSelect={this.handleSelectExpenseType}
              source="formV2"
              param={{
                formOID: this.props.formOID,
                createManually: true,
                setOfBooksId: this.props.formDetail.setOfBooksId,
              }}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

ExpenseTypeModal.propTypes = {
  formOID: PropTypes.string.isRequired, //表单OID
  formDetail: PropTypes.object.isRequired, //表单OID
  value: PropTypes.object,
  onChange: PropTypes.func, //进行选择后的回调
};

function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
    tenantId: state.user.company.tenantId,
  };
}

const wrappedExpenseTypeModal = Form.create()(ExpenseTypeModal);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedExpenseTypeModal);
