import React from 'react';
import httpFetch from 'share/httpFetch';
import contractService from 'containers/contract/contract-approve/contract.service';
import { Form, Button, Input, Row, Col, Select, InputNumber, DatePicker, message } from 'antd';
import SelectReceivables from 'components/Widget/select-receivables-name-code';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

import Chooser from 'components/Widget/chooser';
import moment from 'moment';

class NewPayPlan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      headerData: {},
      record: {},
      searcherLov: {
        disabled: true,
      },
      contractCategoryValue: '',
      partnerCategoryOptions: [], //合同方类型选项
      venderOptions: [], //供应商选项,
      companyId: '',
      partnerId: '',
      partnerName: '',
      show: false,
    };
  }

  componentWillMount() {
    this.getSystemValueList(2107).then(res => {
      //合同方类型
      let partnerCategoryOptions = res.data.values || [];
      this.setState({ partnerCategoryOptions });
    });

    /* httpFetch.post(`${config.vendorUrl}/api/ven/info`, {}).then(res => {  //获取供应商列表
      res.status === 200 && this.setState({ venderOptions: res.data.body.body.venInfoBeans })
    }); */
  }
  componentDidMount() {
    this.setState({
      headerData: this.props.params.contractHead,
      searcherLov: {
        disabled: !this.props.params.contractHead.partnerCategory,
      },
      record: this.props.params.payInfo,
    });
  }
  /*
  componentWillReceiveProps(nextProps) {
    if (!this.props.params.flag && nextProps.params.flag) {
      this.setState({
        headerData: nextProps.params.contractHead,
        searcherLov: {
          disabled: !nextProps.params.contractHead.partnerCategory
        },
        record: nextProps.params.payInfo
      })
    }
    if (this.props.params.flag && !nextProps.params.flag) {
      this.props.form.resetFields()
    }
  }*/

  onCancel = () => {
    this.props.form.resetFields();
    this.setState({ record: {} });
    this.props.onClose();
  };

  //保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.headerId = this.state.headerData.id;

        values.dueDate = new Date(moment(values.dueDate).format('YYYY-MM-DD'));
        values.partnerId = values.partnerId.key;
        this.setState({ loading: true });
        contractService.newPayPlan(values).then(res => {
            if (res.status === 200) {
              this.props.onClose(true);
              message.success(this.$t({ id: 'common.save.success' }, { name: '' } /*保存成功*/));
              this.setState({ loading: false });
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(
              `${this.$t({ id: 'common.save.filed' } /*保存失败*/)}, ${e.response.data.message}`
            );
          });
      }
    });
  };

  //更新
  handleUpdate = e => {
    e.preventDefault();
    const { record } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.id = record.id;
        values.headerId = record.headerId;
        values.versionNumber = record.versionNumber;
        values.dueDate = new Date(moment(values.dueDate).format('YYYY-MM-DD'));
        values.partnerId = values.partnerId.key;
        this.setState({ loading: true });
        contractService.updatePayPlan(values).then(res => {
            if (res.status === 200) {
              this.props.onClose(true);
              message.success(this.$t({ id: 'common.save.success' }, { name: '' } /*保存成功*/));
              this.setState({ loading: false, record: {} });
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            if (e.response)
              message.error(
                `${this.$t({ id: 'common.save.filed' } /*保存失败*/)}, ${e.response.data.message}`
              );
          });
      }
    });
  };

  changePartnerCategory = value => {
    this.props.form.setFieldsValue({ partnerId: { key: '', label: '' } });
  };

  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback(this.$t('my.contract.amount.tips'));
  };

  //四舍五入 保留两位小数
  toDecimal2 = e => {
    let x = e.target.value;

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
    this.props.form.setFieldsValue({ amount: s });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      loading,
      headerData,
      record,
      searcherLov,
      partnerCategoryOptions,
      venderOptions,
      contractCategoryValue,
      companyId,
      partnerId,
      partnerName,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10 },
    };
    return (
      <div className="new-pay-plan" style={{ marginTop: 20 }}>
        <Form onSubmit={record.id ? this.handleUpdate : this.handleSave}>
          <Row>
            <Col span={8} className="ant-form-item-label label-style">
              {this.$t({ id: 'budget.occupancy.amount' } /*金额*/)}：{' '}
            </Col>
            <Col span={4}>
              <FormItem>
                {getFieldDecorator('currency', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.select' } /*请选择*/),
                    },
                  ],
                  initialValue: headerData.currency +"-"+ headerData.currencyName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={6} style={{ marginLeft: 3 }}>
              <FormItem className="ant-col-offset-1">
                {getFieldDecorator('amount', {
                  rules: [{ validator: this.checkPrice }],
                  initialValue: record.amount,
                })(
                  <InputNumber
                    onBlur={this.toDecimal2}
                    placeholder={this.$t({ id: 'common.please.enter' } /*请输入*/)}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'my.contract.partner.type' } /*合同方类型*/)}
          >
            {getFieldDecorator('partnerCategory', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' } /*请选择*/),
                },
              ],
              initialValue: record.id ? record.partnerCategory : headerData.partnerCategory,
            })(
              <Select
                placeholder={this.$t({ id: 'common.please.select' } /*请选择*/)}
                onChange={this.changePartnerCategory}
              >
                {partnerCategoryOptions.map(option => {
                  return <Option key={option.value}>{option.messageKey}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'pay.refund.partnerName' } /*收款方*/)}
          >
            {getFieldDecorator('partnerId', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' } /*请输入*/),
                },
                {
                  validator: (item, value, callback) => {
                    if (!value.key) {
                      callback(this.$t({ id: 'common.please.select' }));
                    }
                    callback();
                  },
                },
              ],
              initialValue: {
                key: record.id ? record.partnerId : headerData.partnerId,
                label: record.id ? record.partnerName : headerData.partnerName,
              },
            })(
              <SelectReceivables
                type={this.props.form.getFieldValue('partnerCategory')}
                disabled={!this.props.form.getFieldValue('partnerCategory')}
              />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'my.contract.plan.pay.date' } /*计划付款日期*/)}
          >
            {getFieldDecorator('dueDate', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' } /*请选择*/),
                },
              ],
              initialValue: record.id ? moment(record.dueDate) : null,
            })(<DatePicker style={{ width: '100%' }} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'common.remark' } /*备注*/)}>
            {getFieldDecorator('remark', {
              initialValue: record.remark,
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
      </div>
    );
  }
}

const wrappedNewPayPlan = Form.create()(NewPayPlan);

export default wrappedNewPayPlan;

{
  /*<Chooser type={contractCategoryValue === "EMPLOYEE" ? "contract_user" : "select_vendor"}
 valueKey="id"
 labelKey={contractCategoryValue === "EMPLOYEE" ? "fullName" : "venNickname"}
 single
 listExtraParams={{ companyId: companyId }}
 />*/
}
