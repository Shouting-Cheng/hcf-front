/**
 * Created by Allen on 2018/5/11.
 */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Input, InputNumber, DatePicker, Affix, Select, Button, message, Row, Col, Spin, Checkbox  } from 'antd'
import moment from 'moment'
import Upload from 'components/Widget/upload-button'
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
import ShareInfo from 'containers/financial-management/expense-reverse/share-info'
import 'styles/financial-management/expense-reverse/edit-reverse-info.scss'
import config from 'config'
import {messages} from 'utils/utils'
import Chooser from "components/Widget/chooser";
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

const invoiceOperationTypeList = [
  {key: messages('exp.blue.invalid'), value: 'DELETE'},  //蓝票作废
  {key: messages('exp.red.invoice.reserve'), value: 'BACK_LASE'},  //红票反冲
  {key: messages('exp.invoice.outTime'), value: 'OVERDUE'},   //发票过期
  {key: messages('exp.needless.operation'), value: 'NO_TICKET'}   //无需操作
];

class EditReverseInfo extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      isNew: false,
      fileList:[],
      attachmentOID: [],
      isRefreshShareTabel:false,
      approtionData: [],
      record: {
        expenseReverseInvoice: {
          invoiceCode: '',
          invoiceNumber: ''
        }
      }
    }
  }

  componentDidMount(){
    let params = this.props.params;
    if (!params.lineFlag){
      this.setState({invoiceOperationType: 'NO_TICKET', isNew: false});
      this.props.form.resetFields();
    }
    if (params.lineFlag && !this.state.isNew && params.id && this.props.params.record !== this.state.record){
      let shareParams = { relatedApplication: params.headerData.relatedApplication, defaultApportion: params.defaultApportion };
      this.setState({
        shareParams,
        id: this.props.params.id,
        isNew: this.props.params.lineFlag
      }, () => {
        this.getInfo()
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    let params = nextProps.params;
    if (!params.lineFlag){
      this.setState({invoiceOperationType: 'NO_TICKET', isNew: false});
      this.props.form.resetFields();
    }
    if (params.lineFlag && !this.state.isNew && params.id && nextProps.params.record !== this.state.record){
      let shareParams = { relatedApplication: params.headerData.relatedApplication, defaultApportion: params.defaultApportion };
      this.setState({
        shareParams,
        id: nextProps.params.id,
        isNew: nextProps.params.lineFlag
      }, () => {
        this.getInfo()
      })
    }
  }

  //根据传过来的id获取冲销单行信息
  getInfo(){
    const { id } = this.state;
    this.setState({loading: true});
    reverseService.getReverseExpenseInfo(id).then(resp => {
      let attachments = resp.data.attachmentList.map(o => {
        return {
          ...o,
          uid: o.attachmentOID,
          name: o.fileName
        };
      });
      if (resp.status === 200){
        this.setState({
          record: resp.data,
          fileList: attachments,
          attachmentOID: resp.data.attachmentList.map(o => o.attachmentOID),
          loading: false,
          invoiceOperationType: resp.data.invoiceOperationType,
          applicationData: resp.data.expenseApportionDTOList
        });
      }
    }).catch((e) => {
      this.setState({loading: false});
      if(e.response)
      message.error(e.response.data ? e.response.data : this.$t( 'common.error'))
    })
  }

  //上传附件
  handleUpload = (values) => {
    this.setState({ attachmentOID: values});
  };

  handleSelectExpenseType = (value)=>{
  };

  handleSave = (e) => {
    e.preventDefault();
    const { record, invoiceOperationType } = this.state;
    this.props.form.validateFieldsAndScroll((err,values) => {
      if (!err){
        let params = {
          id: this.state.id,
          invoiceType: this.state.record.invoiceType,
          description: values.description,
          amount: values.amount,
          exculedTaxAmount: record.exculedTaxAmount,
          taxAmount: values.taxAmount,
          invoiceOperationType: invoiceOperationType
        };
        let bodyParams;
        if (this.state.invoiceOperationType === 'BACK_LASE'){
          bodyParams = {
            reverseInvoice: {
              invoiceCode: values.invoiceCode,
              invoiceNumber:values.invoiceNumber,
              invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
              invoiceAmount: values.invoiceAmount,
              taxRate: values.expenseReverseInvoice.taxRate,
              taxAmount: values.expenseReverseInvoice.taxAmount,
              exculedTaxAmount: values.expenseReverseInvoice.exculedTaxAmount,
              estateFlag: record.estateFlag ? record.estateFlag : false,
              reverseLineId: this.state.id,
            },
            attachmentOids: this.state.attachmentOID
          }
        } else {
          bodyParams = {
            reverseInvoice: {},
            attachmentOids: this.state.attachmentOID
          };
        }
        this.setState({saveLoading: true});
        reverseService.updataReverseLine(params,bodyParams).then(resp => {
          if (resp.status === 200){
            message.success(this.$t('common.save.success',{name: ''}/*保存成功(*/));
            this.setState({saveLoading: false});
            this.props.onClose(true);
          }
        }).catch(e => {
          this.setState({saveLoading: false});
          message.error(e.response.data ? e.response.data.message : this.$t('common.save.filed'/*保存失败(*/));
        })
      }
    })
  };

  handleDelete = (e) => {
    e.preventDefault();
    reverseService.deleteReverseLine(this.state.id).then(resp => {
      if (resp.status === 200){
        message.success(this.$t('expense.reverse.deleteSuccess',{name: ""}/*删除成功(*/));
        this.props.close(true);
      }
    }).catch(e => {
      message.error(e.response.data ? e.response.data.message : this.$t( 'adjust.delete.fail'/*删除失败(*/))
    })
  };

  changeOperationType = (value) => {
    this.setState({invoiceOperationType: value});
  };

  onCancel = () => {
    this.props.onClose();
    this.props.form.resetFields();
  };

  render(){
    const {getFieldDecorator} = this.props.form;
    const { loading, record, saveLoading, invoiceOperationType, applicationData, fileList } = this.state;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 17,}
    };
    const redTicketLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 16, offset: 1}
    };
    return(
      <div className="edit-reverse-info">
        <Form onSubmit={this.handleSave}>
            <Row gutter={24}>
            {/*<Col className="expense-type" span={12}>
               <ExpenseTypeSelector onSelect={this.handleSelectExpenseType}
               source="company"
               param={this.props.company.companyOID} />
            </Col>*/}
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('travel.policy.feeType' /*费用类型(*/)}>
                {getFieldDecorator('expenseTypeId', {
                  initialValue: record.expenseTypeId ? [{ id: record.expenseType.id, name: record.expenseType.name }] : [] })(
                  <Chooser
                    onChange={(value) => this.handleSelectExpenseType(value)}
                    labelKey='name'
                    valueKey='id'
                    selectorItem={this.state.expenseTypeItem}
                    listExtraParams={{ setOfBooksId: "937515627984846850" }}
                    itemMap={true}
                    single={true}
                    disabled />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('common.happened.date'/*发生日期(*/)}>
                {getFieldDecorator('createDate', { initialValue: record ? moment(record.expenseDate) : moment() })(
                  <DatePicker style={{width: '94%'}} format="YYYY-MM-DD" disabled /> )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('exp.invoice.operation')}>
                {getFieldDecorator('invoiceOperationType', { rules: [{ required: true, message: this.$t( 'common.please.select') }], initialValue: record ? record.invoiceOperationType : '' })(
                  <Select style={{width: '100%'}} disabled={record.invoiceType !=='01' } onChange={this.changeOperationType}>
                    {invoiceOperationTypeList.map(item => {
                      return <Option value={item.value} key={item.value}>{item.key}</Option>
                    })}
                  </Select> )}
              </FormItem>
            </Col>
          </Row>
          {invoiceOperationType === 'BACK_LASE' && (
            <div className="red-ticket-information">
              <Row className="red-ticket-row">
                <Col span={11}>
                  <FormItem label={this.$t("common.invoice.type")}>
                    {getFieldDecorator('invoiceType', {
                      rules: [{
                        required: true,
                        message: this.$t( 'common.please.enter')
                      }],
                      initialValue: this.$t('exp.special.ticket')
                    })(
                      <Input placeholder={this.$t( 'common.please.enter')} disabled/>
                    )}
                  </FormItem>
                </Col>
                <Col span={11} offset={2}>
                  <FormItem label={this.$t('expense.invoice.date')}>
                    {getFieldDecorator('invoiceDate', {
                      rules: [{
                        required: true,
                        message: this.$t('common.please.enter')
                      }],
                      initialValue: record.expenseReverseInvoice ? moment(record.expenseReverseInvoice.createdDate): moment(record.digitalInvoice.createdDate)
                    })(
                      <DatePicker format="YYYY-MM-DD"  />
                    )}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label={this.$t('expense.invoice.code')}>
                    {getFieldDecorator('invoiceCode', {
                      rules: [{
                        required: true,
                        message: this.$t('common.please.enter')
                      }],
                      initialValue: record.expenseReverseInvoice ? record.expenseReverseInvoice.invoiceCode : record.digitalInvoice.billingCode
                    })(
                      <Input placeholder={this.$t('common.please.enter')} />
                    )}
                  </FormItem>
                </Col>
                <Col span={11} offset={2}>
                  <FormItem label={this.$t('expense.invoice.number')}>
                    {getFieldDecorator('invoiceNumber', {
                      rules: [{
                        required: true,
                        message: this.$t( 'common.please.enter')
                      }],
                      initialValue: record.expenseReverseInvoice ? record.expenseReverseInvoice.invoiceNumber : record.digitalInvoice.billingNo
                    })(
                      <Input placeholder={this.$t( 'common.please.enter')} />
                    )}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label={this.$t('expense.invoice.price.and.tax')}>
                    <Row>
                      <Col span={10}>
                        <FormItem>
                          {getFieldDecorator('expenseReverseInvoice.vatInvoiceCurrencyCode', {
                            initialValue: record.expenseReverseInvoice ? record.currencyCode : record.currencyCode
                          })(
                            <Input disabled />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={12} offset={1}>
                        <FormItem>
                          {getFieldDecorator('invoiceAmount', {
                            initialValue: record.expenseReverseInvoice ? record.amount.toFixed(2) : record.amount.toFixed(2)
                          })(
                            <Input disabled />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </FormItem>
                </Col>
                <Col span={11} offset={2}>
                  <FormItem label={this.$t('common.tax')}>
                    <Row>
                      <Col span={10}>
                        <FormItem>
                          {getFieldDecorator('expenseReverseInvoice.taxRate', {
                            initialValue: record.expenseReverseInvoice ? record.expenseReverseInvoice.taxRate.toFixed(2) : record.taxRate.toFixed(2)
                          })(
                            <Input disabled />
                          )}
                        </FormItem>
                      </Col>
                      <Col span={12} offset={1}>
                        <FormItem>
                          {getFieldDecorator('expenseReverseInvoice.taxAmount', {
                            initialValue: record.expenseReverseInvoice ? record.expenseReverseInvoice.taxAmount.toFixed(2) : record.taxAmount.toFixed(2)
                          })(
                            <Input disabled />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label={this.$t('expense.invoice.amount.without.tax')}>
                    {getFieldDecorator('expenseReverseInvoice.exculedTaxAmount', {
                      initialValue: record.expenseReverseInvoice ? record.expenseReverseInvoice.exculedTaxAmount.toFixed(2) : record.exculedTaxAmount.toFixed(2)
                    })(
                      <Input disabled />
                    )}
                  </FormItem>
                </Col>
                <Col span={11} offset={2}>
                  <FormItem label={this.$t('exp.Instalment')}>
                    {getFieldDecorator('expenseReverseInvoice.installmentFlag', {
                      initialValue: record.expenseReverseInvoice ? record.expenseReverseInvoice.installmentFlag : record.digitalInvoice.installmentFlag
                    })(
                      <Checkbox disabled/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </div>
          )}

          <Row gutter={24}>
            <Col span={12} >
              <FormItem {...formItemLayout} label={this.$t('expense.reverse.amount')}>
                {getFieldDecorator('amount', { rules: [{ required: true, message: this.$t('common.please.enter') }], initialValue: record.amount ? record.amount : '-' })(
                  <InputNumber step={0.2} precision={2} disabled style={{width: '100%'}} /> )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('exp.reserve.tax')}>
                {getFieldDecorator('taxAmount', { rules: [{ required: true, message: this.$t('common.please.enter') }], initialValue: typeof record.taxAmount !== 'undefined' ? record.taxAmount : '-' })(
                  <InputNumber step={0.2}  precision={2} disabled  style={{width: '93%'}}/> )}
              </FormItem>
            </Col>
          </Row>
          {/*!this.props.params.visible &&*/}
          { this.props.params.visible &&
            <FormItem
              style={{marginLeft:-4}}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 20,}}
              label={this.$t('common.attachments')}>
              {
                getFieldDecorator("attachmentOID")(
                  <Upload attachmentType="EXP_REVERSE"
                          uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                          fileNum={9}
                          className="jsq"
                          style={{marginLeft: 10, marginTop: -8}}
                          uploadHandle={this.handleUpload}
                          defaultFileList={fileList}
                          defaultOIDs={[]} />
                )}
            </FormItem>
          }

          <FormItem
            style={{marginLeft: -4}}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 20 }} label={this.$t('exp.reserve.remark')}>
            {getFieldDecorator('description', {
              initialValue: record ? record.description : ''
            })(
              <TextArea placeholder={this.$t( 'common.please.enter')} style={{marginLeft:-2, width: '99.5%'}}/> )}
          </FormItem>
         {/* <FormItem labelCol={{ span: 3 }}
                    wrapperCol={{ span: 20, offset: 1 }} label="分摊费用">
            <div>
            </div>
          </FormItem>*/}
          <ShareInfo handleOk={this.getShareData} isRefresh={this.state.isRefreshShareTabel}  params={this.state.shareParams} data={applicationData}></ShareInfo>

          <Affix style={{ textAlign: "center", width: '98%', left: 35 }} offsetBottom={0} className="bottom-bar">
            <Button type="primary" htmlType="submit" loading={saveLoading}>
              保存</Button>
            <Button style={{marginLeft: 40}} onClick={this.onCancel}>取消</Button>
{/*
            <Button style={{background: 'red', color: '#fff', marginLeft: '40px'}} onClick={this.handleDelete}>删除</Button>
*/}
          </Affix>
        </Form>
      </div>
    )
  }
}

// EditReverseInfo.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {}
}

const WrappedEditReverseInfo = Form.create()(EditReverseInfo);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedEditReverseInfo);


