import React from 'react'
import config from 'config'
import httpFetch from 'share/httpFetch'

import { Form, Button, Input, Row, Icon, Col, Select, InputNumber, DatePicker, message, Alert, Switch, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const InputGroup = Input.Group;

import Chooser from 'components/chooser'
import ListSelector from "components/list-selector"
import moment from 'moment'

import Verification from "containers/reimburse/verification"
import reimburseService from 'containers/reimburse/reimburse.service'
import SelectContract from "containers/pre-payment/my-pre-payment/select-contract"
import { formatMessage } from 'share/common'
import SelectReceivables from "components/select-receivables"

class NewPayPlan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currency: null,
      contractCategoryValue: '',
      partnerCategoryOptions: [], //合同方类型选项
      venderOptions: [], //供应商选项,
      companyId: "",
      partnerId: "",
      partnerName: "",
      receivables: [],
      value: "",
      accountList: [],
      payWayTypeList: [],
      bankLocationCode: "",
      bankLocationName: "",
      flag: false,
      payeeId: "",
      payeeName: "",
      showSelectContract: false,
      contractParams: {},
      contractInfo: {},
      saveLoading: false,
      headerData: {},
      cashTransactionClassList: [],
      model: {},
      isNew: true,
      fetching: false,
      selectedData: [],
      showPayee: false
    }
  }

  componentWillReceiveProps(nextProps) {

    let record = nextProps.params.record;
    //关闭
    if (!nextProps.params.visible && this.props.params.visible) {
      this.setState({ contractInfo: {}, contractParams: {}, value: "", payeeId: "", bankLocationCode: "", bankLocationName: "", model: {}, selectedData: [], receivables: [], payeeName: "" })
    }

    //显示
    if (nextProps.params.visible && !this.props.params.visible) {
      //编辑
      if (record.id) {

        this.setState({
          model: record,
          isNew: false,
          headerData: nextProps.params.headerData,
          payeeId: record.payeeId,
          payeeName: record.partnerName,
          value: record.partnerName,
          bankLocationCode: record.bankLocationCode,
          bankLocationName: record.bankLocationName,
          selectedData: record.contractHeaderId ? [record.contractHeaderLineDTO.lineId] : [],
          contractInfo: record.contractHeaderId ? {
            contractId: record.contractHeaderId,
            contractLineId: record.contractHeaderLineDTO.lineId,
            lineNumber: record.contractHeaderLineDTO.lineNumber,
            contractLineAmount: record.contractLineAmount,
            dueDate: record.contractHeaderLineDTO.dueDate,
            contractNumber: record.contractHeaderLineDTO.contractNumber,
          } : {}
        }, () => {
          this.props.form.setFieldsValue({ payeeCategory: record.payeeCategory });
          this.getReceivables(record.payeeId, record.payeeCategory);
          this.queryCashTransactionClassForForm();
        });
      }
      else {
        this.setState({ isNew: true, headerData: nextProps.params.headerData }, () => {
          const { headerData } = this.state;
          if (headerData.multipleReceivables === false) {

            this.setState({ payeeId: headerData.defaultPaymentInfo.partnerId, payeeName: headerData.defaultPaymentInfo.partnerName });

          }
          this.queryCashTransactionClassForForm();
        });
      }
      this.getPayWayTypeList();
    }
  }

  //获取付款方式类型
  getPayWayTypeList = () => {
    this.getSystemValueList(2105).then(res => {
      this.setState({ payWayTypeList: res.data.values });
    })
  }

  //获取付款用途
  queryCashTransactionClassForForm = () => {
    reimburseService.queryCashTransactionClassForForm(this.state.headerData.formOid).then(res => {
      this.setState({ cashTransactionClassList: res.data });
    }).catch(err => {
      message.error("获取付款用途列表失败！");
    })
  }

  onCancel = () => {
    this.props.close();
  };

  //保存
  handleSave = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {

      if (!err) {
        this.setState({ saveLoading: true });
        let contractInfo = this.state.contractInfo;
        let { headerData } = this.props.params;
        values.id = this.state.model.id;
        values.schedulePaymentDate && (values.schedulePaymentDate = values.schedulePaymentDate.format("YYYY-MM-DD"));
        values.expReportHeaderId = headerData.id;
        values.bankLocationCode = this.state.bankLocationCode;
        values.bankLocationName = this.state.bankLocationName;
        values.companyId = headerData.companyId;
        values.payeeCategory = values.payeeCategory;
        values.payeeId = this.state.payeeId;
        values.exchangeRate = 1; //todo
        values.functionalAmount = values.amount; //todo

        if (contractInfo.contractId) {
          values.contractHeaderId = contractInfo.contractId;
          values.contractLineId = contractInfo.contractLineId;
          values.contractLineAmount = contractInfo.availableAmount;
        }

        reimburseService.newPayLine(values).then(res => {
          message.success("操作成功！");
          this.setState({ saveLoading: false });
          this.props.close(true);
        }).catch(err => {
          message.error("操作失败：" + err.response.data.message);
          this.setState({ saveLoading: false });
          this.props.close();
        })
      }
    })
  };

  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('金额不能小于等于0！');
  }


  //搜索
  receivablesSerarch = (value) => {

    if (!value) {
      this.setState({ receivables: [] });
      return;
    };

    let type = 1003;
    let payeeCategory = this.props.form.getFieldValue("payeeCategory");

    if (payeeCategory == "EMPLOYEE") {
      type = 1001;
    }
    else if (payeeCategory == "VENDER") {
      type = 1002;
    }

    this.setState({ fetching: true });

    reimburseService.getReceivables(value, type).then(res => {
      this.setState({ receivables: res.data, value, accountList: [], fetching: false })
    })

  }

  //获取收款方
  getReceivables = (value, payeeCategory) => {
    if (!value) return;
    console.log(value);
    let accountList = [];
    if (payeeCategory == "EMPLOYEE") {
      reimburseService.getAccountByUserId(value).then(res => {
        res.data && res.data.map(item => {
          if (item.enable) {
            accountList.push({ bankAccountNo: item.bankAccountNo, accountName: item.bankAccountName, bankName: item.bankName, bankCode: item.bankCode });
          }
        })
        this.setState({ accountList });
      })
    }
    else if (payeeCategory == "VENDER") {
      reimburseService.getAccountByVendorId(value).then(res => {

        res.data.body && res.data.body.map(item => {
          accountList.push({ bankAccountNo: item.bankAccount, accountName: item.venBankNumberName, bankName: item.bankName, bankCode: item.bankCode });
        })

        this.setState({ accountList });
      })
    }
  }

  onSelect = (record) => {

    this.props.form.setFieldsValue({ accountNumber: "" });
    this.props.form.setFieldsValue({ accountName: "" });

    if (record) {

      let payeeCategory = this.props.form.getFieldValue("payeeCategory");
      let accountList = [];
      if (payeeCategory == "EMPLOYEE") {
        reimburseService.getAccountByUserId(record.key).then(res => {
          res.data && res.data.map(item => {
            if (item.enable) {
              if (item.isPrimary) {
                this.props.form.setFieldsValue({ accountNumber: item.bankAccountNo });
                this.props.form.setFieldsValue({ accountName: item.bankAccountName });
                this.setState({ bankLocationName: item.bankName, bankLocationCode: item.bankCode });
              }
              accountList.push({ bankAccountNo: item.bankAccountNo, accountName: item.bankAccountName, bankName: item.bankName, bankCode: item.bankCode });
            }
          })
          this.setState({ payeeId: record.key, payeeName: record.label, accountList });
        })
      }
      else if (payeeCategory == "VENDER") {
        reimburseService.getAccountByVendorId(record.key).then(res => {

          res.data.body && res.data.body.map(item => {
            if (item.primaryFlag) {
              this.props.form.setFieldsValue({ accountNumber: item.bankAccount });
              this.props.form.setFieldsValue({ accountName: item.venBankNumberName });
              this.setState({ bankLocationName: item.bankName, bankLocationCode: item.bankCode });
            }
            accountList.push({ bankAccountNo: item.bankAccount, accountName: item.venBankNumberName, bankName: item.bankName, bankCode: item.bankCode });
          })
          this.setState({ payeeId: record.key, payeeName: record.label, accountList });
        })
      }
    }
  }

  //银行账户选取改变
  accountNumberChange = (value) => {

    let data = this.state.accountList.find(o => o.bankAccountNo == value);

    if (data) {
      this.props.form.setFieldsValue({ accountName: data.accountName });
      this.setState({ bankLocationName: data.bankName, bankLocationCode: data.bankCode });
    } else {
      this.props.form.setFieldsValue({ accountName: "" });
    }
  }

  //选定合同后
  handleListOk = (values) => {
    this.setState({ contractInfo: values.result[0], showSelectContract: false, contractParams: {}, selectedData: [values.result[0].contractLineId] });
  }

  //显示选择合同
  showSelectContract = () => {

    if (!this.state.payeeId) {
      message.warning("请先选择收款方！");
      return;
    }

    this.refs.contractSelect.blur();

    let model = {
      companyId: this.props.params.headerData.companyId,
      partnerCategory: this.props.form.getFieldValue("payeeCategory"),
      partnerId: this.state.payeeId,
      documentType: "PUBLIC_REPORT",
      currency: this.state.headerData.defaultPaymentInfo.currency,
    }

    if (this.state.headerData.relatedContract) {
      model.contractHeaderId = this.state.headerData.contractHeaderId;
    }

    this.setState({ showSelectContract: true, contractParams: model });
  }

  //四舍五入 保留两位小数
  toDecimal2 = (x) => {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return false;
    }
    var f = Math.round(x * 100) / 100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  }

  checkCost = () => {
    let cost = this.props.form.getFieldValue("amount");
    cost = this.toDecimal2(cost);
    this.props.form.setFieldsValue({ amount: cost });
  }

  //格式化金额
  formatMoney = (x) => {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return "0.00";
    }
    var f = Math.round(x * 100) / 100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  }

  //付款方类型改变清掉已经选择的收款方
  payeeCategoryChange = () => {
    //this.props.form.setFieldsValue({ payeeId: {} });
    this.setState({ payeeId: "", payeeName: "", bankLocationName: "", bankLocationCode: "", accountList: [], contractInfo: {} });
    this.props.form.setFieldsValue({ accountNumber: "" });
    this.props.form.setFieldsValue({ accountName: "", payeeId: { key: "", label: "" } });

  }

  //显示选取收款方列表
  showPayee = () => {
    this.setState({ showPayee: true });
  }

  //获取收款方code
  getPayeeCategoryCode = (payeeCategory) => {
    let type = 1003;
    if (payeeCategory == "EMPLOYEE") {
      type = 1001;
    }
    else if (payeeCategory == "VENDER") {
      type = 1002;
    }
    return type;
  }

  //选取收款方后
  // payeeHandleListOk = (value) => {
  //   let data = value.result[0];
  //   this.props.form.setFieldsValue({ accountNumber: "" });
  //   this.props.form.setFieldsValue({ accountName: "" });
  //   this.props.form.setFieldsValue({ payeeId: { key: data.id, label: data.name } });

  //   data.bankInfos && data.bankInfos.map(o => {
  //     if (o.primary) {
  //       this.props.form.setFieldsValue({ accountNumber: o.number });
  //       this.props.form.setFieldsValue({ accountName: o.bankNumberName });
  //       this.setState({ bankLocationName: o.bankName, bankLocationCode: o.bankCode });
  //     }
  //   });


  //   this.setState({ value: data.name, accountList: data.bankInfos, payeeId: data.id, payeeName: data.name, showPayee: false });
  // }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, isNew, model, headerData, cashTransactionClassList, showSelectContract, contractParams, payWayTypeList, receivables, accountList, currency, partnerCategoryOptions, venderOptions, contractCategoryValue, companyId, partnerId, partnerName, contractInfo, showPayee } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };

    return (
      <div className="new-pay-plan">
        <Row>
          <Col span={20} offset={2} style={{ marginTop: -20, marginBottom: 20 }}>
            <Alert
              message={`报账总金额: ${headerData.summaryView && (`${headerData.currencyCode}  ${this.formatMoney(headerData.summaryView.lineTotalAmount)}`)}
                 /  付款总金额: ${headerData.summaryView && (`${headerData.currencyCode}  ${this.formatMoney(headerData.summaryView.paymentLineTotalAmount)}`)}
                 /  核销总金额: ${headerData.summaryView && this.formatMoney(headerData.summaryView.writeOffAmount)}`} type="info" />
          </Col>
        </Row>

        {this.props.params.visible && <Form onSubmit={this.handleSave}>
          <Row>
            <Col span={8} className="ant-form-item-label label-style">付款金额： </Col>
            <Col span={4} className="ant-col-offset-1">
              <FormItem>
                {getFieldDecorator('currency', {
                  initialValue: isNew ? headerData.currencyCode : model.currency
                })(
                  <Input disabled />
                  )}
              </FormItem>
            </Col>
            <Col span={6} style={{ marginLeft: 3 }}>
              <FormItem className="ant-col-offset-1">
                {getFieldDecorator('amount', {
                  initialValue: isNew ? "" : model.amount,
                  rules: [{ validator: this.checkPrice }]
                })(
                  <InputNumber step="0.01" precision={2} onBlur={this.checkCost} placeholder={formatMessage({ id: "common.please.enter" }/*请输入*/)} style={{ width: '100%' }} />
                  )}
              </FormItem>
            </Col>
          </Row>
          {/* <Row>
            <Col style={{ marginBottom: 24 }} span={10} offset={9}>
              <Button icon="plus">核销预付款</Button>
            </Col>
          </Row> */}

          <FormItem {...formItemLayout} label="收款方类型">
            {getFieldDecorator('payeeCategory', {
              rules: [{ message: "请选择", required: true }],
              initialValue: model.payeeCategory || headerData.payeeCategory == "EMPLOYEE_VENDER" ? "EMPLOYEE" : headerData.payeeCategory
            })(
              headerData.payeeCategory == "EMPLOYEE" ?
                (
                  <Select disabled>
                    <Select.Option key={"EMPLOYEE"} value={"EMPLOYEE"}>员工</Select.Option>
                  </Select>
                ) : headerData.payeeCategory == "VENDER" ? (
                  <Select disabled>
                    <Select.Option key={"VENDER"} value={"VENDER"}>供应商</Select.Option>
                  </Select>) : (
                    <Select disabled={headerData.multipleReceivables === false} onChange={this.payeeCategoryChange}>
                      <Select.Option key={"EMPLOYEE"} value={"EMPLOYEE"}>员工</Select.Option>
                      <Select.Option key={"VENDER"} value={"VENDER"}>供应商</Select.Option>
                    </Select>
                  )
              )}
          </FormItem>

          <FormItem {...formItemLayout} label="收款方">
            {
              getFieldDecorator('payeeId', {
                initialValue: { key: this.state.payeeId, label: this.state.payeeName },
                rules: [{ message: "请输入", required: true }]
              })(
                <SelectReceivables type={this.props.form.getFieldValue("payeeCategory")} onChange={this.onSelect}></SelectReceivables>
                )
            }
          </FormItem>

          <FormItem {...formItemLayout} label="收款方银行账号">
            {getFieldDecorator('accountNumber', {
              rules: [{ message: "请输入", required: true }],
              initialValue: isNew ? (headerData.multipleReceivables === false ? headerData.defaultPaymentInfo.accountNumber : "") : model.accountNumber
            })(
              <Select disabled={headerData.multipleReceivables === false} onChange={this.accountNumberChange}>
                {
                  accountList.map(o => {
                    return (
                      <Select.Option key={o.bankAccountNo} value={o.bankAccountNo}>{o.bankAccountNo}</Select.Option>
                    )
                  })
                }
              </Select>
              )}
          </FormItem>

          <FormItem {...formItemLayout} label="收款方户名">
            {getFieldDecorator('accountName', {
              initialValue: isNew ? (headerData.multipleReceivables === false ? headerData.defaultPaymentInfo.accountName : "") : model.accountName,
              rules: [{ message: "请输入", required: true }]
            })(
              <Input disabled />
              )}
          </FormItem>

          <FormItem {...formItemLayout} label="付款用途">
            {getFieldDecorator('cshTransactionClassId', {
              initialValue: isNew ? "" : model.cshTransactionClassId,
              rules: [{ message: "请输入", required: true }]
            })(
              <Select>
                {
                  cashTransactionClassList.map(o => {
                    return (
                      <Option key={o.id} value={o.id}>{o.description}</Option>
                    )
                  })
                }
              </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="付款方式类型">
            {getFieldDecorator('paymentMethod', {
              initialValue: isNew ? (headerData.defaultPaymentInfo ? headerData.defaultPaymentInfo.paymentMethod : "") : model.paymentMethod,
              rules: [{ message: "请输入", required: true }]
            })(
              <Select disabled>
                {
                  payWayTypeList.map(o => {
                    return (
                      <Option key={o.value}>{o.messageKey}</Option>
                    )
                  })
                }
              </Select>
              )}
          </FormItem>
          {/* <FormItem {...formItemLayout} label="合同付款计划">
            <Select
              ref="contractSelect"
              onFocus={this.showSelectContract}
              defaultValue={isNew ? "" : this.state.contractInfo.contractLineId} value={this.state.contractInfo.contractLineId} >
            </Select>
          </FormItem> */}
          <FormItem {...formItemLayout} label={formatMessage({ id: "my.contract.plan.pay.date" }/*计划付款日期*/)}>
            {getFieldDecorator('schedulePaymentDate', {
              rules: [{
                required: true,
                message: formatMessage({ id: 'common.please.select' }/*请选择*/)
              }],
              initialValue: isNew ? moment(new Date(), "YYYY-MM-DD") : moment(new Date(model.schedulePaymentDate), "YYYY-MM-DD")
            })(
              <DatePicker style={{ width: '100%' }} />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('description', {
              initialValue: isNew ? "" : model.description
            })(
              <TextArea autosize={{ minRows: 2 }}
                style={{ minWidth: '100%' }}
                placeholder={formatMessage({ id: "common.please.enter" }/*请输入*/)} />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="延后支付">
            {getFieldDecorator('frozenFlag', {
              initialValue: isNew ? false : model.frozenFlag,
              valuePropName: "checked"
            })(
              <Switch></Switch>
              )}
          </FormItem>

          {(headerData.relatedContract || headerData.relatedContractLine) && <div>
            <div className="common-item-title">合同信息</div>

            <div style={{ marginBottom: '16px', marginLeft: '60px' }}>
              <Row gutter={8}>
                <Col span={4} className="ant-form-item-label">
                  关联合同:
                </Col>
                <Col span={16}>
                  <Select
                    ref="contractSelect"
                    onFocus={this.showSelectContract}
                    defaultValue={isNew ? "" : (contractInfo.contractLineId ? contractInfo.contractNumber : "")} value={(contractInfo.contractLineId ? contractInfo.contractNumber : "")}
                    dropdownStyle={{ display: 'none' }}
                  >
                  </Select>
                  <div style={{ marginTop: '8px' }}>
                    {!contractInfo.contractLineId ? "注：根据收款方选择合同" : `付款计划序号：${contractInfo.lineNumber} | 付款计划日期：${moment(contractInfo.dueDate).format("YYYY-MM-DD")}`}
                  </div>
                </Col>
                <Col span={4} style={{ textAlign: "left" }} className="ant-form-item-label">
                  {contractInfo.lineNumber && <a onClick={() => this.detail(contract.contractId)}>查看详情</a>}
                </Col>
              </Row>
            </div>
          </div>}

          <div className="slide-footer">
            <Button loading={this.state.saveLoading} type="primary" htmlType="submit">{formatMessage({ id: "common.save" }/*保存*/)}</Button>
            <Button onClick={this.onCancel}>{formatMessage({ id: "common.cancel" }/*取消*/)}</Button>
          </div>
        </Form>}

        <SelectContract visible={showSelectContract}
          onCancel={() => { this.setState({ showSelectContract: false, contractParams: {} }) }}
          onOk={this.handleListOk}
          single={true}
          params={contractParams}
          selectedData={this.state.selectedData}
        />

        <ListSelector
          single={true}
          visible={showPayee}
          type="select_payee"
          labelKey="name"
          valueKey="id"
          onCancel={() => { this.setState({ showPayee: false }) }}
          onOk={this.payeeHandleListOk}
          extraParams={{ empFlag: this.getPayeeCategoryCode(this.props.form.getFieldValue("payeeCategory")), name: "", pageFlag: true }}
          selectedData={this.state.payeeId ? [{ id: this.state.payeeId, name: this.state.payeeName }] : [{ key: "", label: "" }]}>
        </ListSelector>
      </div>
    )
  }
}

const wrappedNewPayPlan = Form.create()(NewPayPlan);

export default wrappedNewPayPlan;
