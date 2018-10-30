/**
 * Created by Allen on 2018/5/21.
 */
import React from 'react'
import { connect } from 'dva';
import { Form, Input, InputNumber, Button, message, Row, Col, Switch, Select } from 'antd'
import moment from 'moment'
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
import 'styles/financial-management/expense-reverse/edit-reverse-info.scss'

const FormItem = Form.Item;
const { TextArea } = Input;

class EditUnpaidInfo extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      saveLoading: false,
      isNew: false,
      record: "",
      contractInfo: {}
    }
  }

  componentDidMount(){
    let params = this.props.params;
    if (!params.lineFlag){
      this.props.form.resetFields();
    }

    if (params && params.lineFlag && params.record !== this.state.record){
      this.setState({
        record: params.record,
        contractInfo: params.record.dataDTO.contractHeaderId ? params.record.dataDTO.expensePaymentScheduleDTO.contractHeaderLineDTO : {}
      })
    }
  }

  componentWillReceiveProps(nextProps){
    let params = nextProps.params;
    if (!params.lineFlag){
      this.props.form.resetFields();
    }

    if (params && params.lineFlag && params.record !== this.state.record){
      this.setState({
        record: params.record,
        contractInfo: params.record.dataDTO.contractHeaderId ? params.record.dataDTO.expensePaymentScheduleDTO.contractHeaderLineDTO : {}
      })
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    const { record } = this.state;
    this.props.form.validateFieldsAndScroll((err,values) => {
      if (!err){
        record.adjustAmount = -(values.adjustAmount);
        record.description = values.description;
        this.setState({saveLoading: true});
        reverseService.updatePayLine(record).then(resp => {
          if (resp.status === 200){
            message.success(this.$t('common.save.success',{name:''}));
            this.setState({saveLoading: false});
            this.props.onClose(true);
          }
        }).catch(e => {
          this.setState({saveLoading: false});
          message.error(e.response.data ? e.response.data.message : this.$t('common.save.filed'));
        })
      }
    })
  };

  handleDelete = (e) => {
    e.preventDefault();
    reverseService.deletePayLine(this.state.record.id).then(resp => {
      if (resp.status === 200){
        message.success(this.$t('common.delete.success',{name:''}));
        this.props.onClose(true);
      }
    }).catch(e => {
      message.error(e.response.data ? e.response.data.message : this.$t('common.delete.failed'))
    })
  };

  onCancel = () => {
    this.props.onClose();
    this.props.form.resetFields();
  };

  render(){
    const {getFieldDecorator} = this.props.form;
    const { record, saveLoading, contractInfo } = this.state;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 10}
    };

    return(
      <div className="edit-unpaid-info">
        <Form onSubmit={this.handleSave} style={{marginTop: 20}}>
          <Row>
            <Col span={8} className="ant-form-item-label label-style">{this.$t('exp.reserve.money')}： </Col>
            <Col span={4} className="ant-col-4">
              <FormItem>
                {getFieldDecorator('currency', {
                  initialValue: record ? record.currencyCode : '',
                  rules: [{required: true}]
                })(
                  <Input disabled />
                  )}
              </FormItem>
            </Col>
            <Col span={6} style={{ marginLeft: 3 }}>
              <FormItem>
                {getFieldDecorator('ableReservedAmount', {
                  initialValue: record ? record.dataDTO.ableReservedAmount.toFixed(2) : '',
                  rules: [{required: true}]
                })(
                  <Input disabled style={{width: '99%'}}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8} className="ant-form-item-label label-style">{this.$t('expense.reverse.amount')}： </Col>
            <Col span={4} >
              <FormItem >
                {getFieldDecorator('currency', {
                  initialValue: record ? record.currencyCode : '',
                  rules: [{required: true}]
                })(
                  <Input disabled  />
                  )}
              </FormItem>
            </Col>
            <Col span={6} style={{ marginLeft: 3 }}>
              <FormItem >  {/*className="ant-col-offset-1"*/}
                {getFieldDecorator('adjustAmount', {
                  rules: [{
                    required: true,
                    message: this.$t('common.please.enter')
                  }],
                  initialValue: record ? 0-record.adjustAmount : ''
                })(
                  <InputNumber formatter={value => `-${value}`}
                               precision={2}
                               style={{width: '99%'}}
                              parser={value => value.replace('-', '')}
                              max={record ? record.dataDTO.ableReservedAmount: 0}
                              placeholder={this.$t('common.please.enter')} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8} className="ant-form-item-label label-style">{this.$t('pay.refund.partnerName')}： </Col>
            <Col span={4} > {/*className="ant-col-offset-1"*/}
              <FormItem>
                {getFieldDecorator('partnerCategoryName', {
                  initialValue: record ? record.dataDTO.partnerCategoryName : '',
                  rules: [{required: true}]
                })(
                  <Input disabled/>
                  )}
              </FormItem>
            </Col>
            <Col span={6} style={{ marginLeft: 3 }}>
              <FormItem >
                {getFieldDecorator('partnerName', {
                  rules: [{
                    required: true,
                    message: this.$t('common.please.enter')
                  }],
                  initialValue: record ? record.dataDTO.partnerName : ''
                })(
                  <Input disabled style={{width: '99%'}}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <FormItem {...formItemLayout} label={this.$t('exp.partner.account')}>
            {getFieldDecorator('accountNumber', {
              rules: [{required: true}],
              initialValue: record ? record.dataDTO.accountNumber : '-'
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('acp.accountName.detail')}>
            {getFieldDecorator('accountName', {
              rules: [{required: true}],
              initialValue: record ? record.dataDTO.accountName : '-'
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('acp.transaction.name')}>
            {getFieldDecorator('cshTransactionClassName', {
              rules: [{required: true}],
              initialValue:  record ? record.dataDTO.cshTransactionClassName : '-'
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('acp.payment.method')}>
            {getFieldDecorator('dataDTO.paymentMethodCategoryName', {
              rules: [{required: true}],
              initialValue:  record ? record.dataDTO.paymentMethodCategoryName : '-'
            })(
              <Input disabled />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('common.comment')}>
            {getFieldDecorator('description', {
              initialValue: record ? record.description : ''
            })(
              <TextArea placeholder={this.$t('common.please.enter')} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('exp.pay.delay')}>
            {getFieldDecorator('dataDTO.frozenFlag', {
              initialValue: record ? record.dataDTO.frozenFlag : false,
              valuePropName: 'checked'
            })(
              <Switch disabled/>
            )}
            <span style={{ marginLeft: 20 }}>{record && record.dataDTO.frozenFlag ? this.$t('exp.pay.delay') : this.$t('exp.pay.unDelay')}</span>
          </FormItem>
          <div>
            <div className="common-item-title">{this.$t('my.contract.info')}</div>

            <div style={{ marginBottom: '16px', marginLeft: '60px' }}>
              <Row gutter={8}>
                <Col span={5} className="ant-form-item-label">
                  {this.$t('acp.relation.contract')}:
                </Col>
                <Col span={15}>
                  <Input
                    disabled
                    value={!contractInfo.lineId ? '' : contractInfo.contractNumber}
                  />
                  <div style={{ marginTop: '8px' }}>
                    {!contractInfo.lineId ? null : `${acp.contract.lineNumber}${contractInfo.lineNumber} | ${acp.contract.date}${moment(contractInfo.dueDate).format("YYYY-MM-DD")}`}
                  </div>
                </Col>
                <Col span={4} style={{ textAlign: "left" }} className="ant-form-item-label">
                  {contractInfo.lineNumber && <a onClick={() => this.detail(contractInfo.headerId)}>{this.$t('expense.invoice.view.detail')}</a>}
                </Col>
              </Row>
            </div>
          </div>


          <div className="slide-footer">
            <Button type="primary" htmlType="submit" onClick={this.handleSave} loading={saveLoading}>{this.$t('common.save')}</Button>
            <Button onClick={this.onCancel} style={{marginLeft: 30}}>{this.$t('common.cancel')}</Button>
            <Button style={{background: 'red', color: '#fff', marginLeft: 30}} onClick={this.handleDelete}>{this.$t('common.delete')}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

// EditUnpaidInfo.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

const WrappedEditUnpaidInfo = Form.create()(EditUnpaidInfo);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedEditUnpaidInfo);


