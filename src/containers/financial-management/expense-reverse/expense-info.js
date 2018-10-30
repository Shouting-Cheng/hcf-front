import React from 'react'
import { connect } from 'dva';
import baseService from 'share/base.service'
import moment from 'moment'

import { Alert, Form, Switch, Icon, Input, Select, Button, Row, Col, message, Card, Popover, InputNumber, DatePicker, Spin, Popconfirm, Affix } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
// import Location from 'components/Widget/location';
import 'styles/my-account/new-expense.scss'
// import ExpenseTypeSelector from 'components/template/expense-type-selector'
import Chooser from "components/Widget/chooser";

import InvoiceInfo from 'containers/reimburse/my-reimburse/invoice-detail'
import ShareDetail from 'containers/financial-management/expense-reverse/share-detail'
import ShareForm from 'containers/reimburse/my-reimburse/share-form'
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'

class ExpenseInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      businessCardConsumptions: [],
      nowBusinessCardConsumptionIndex: 0,
      expenseType: {},
      loading: false,
      saving: false,
      nowPage: 'type',  //type-费用类型选择、发票录入、商务卡消费选择页  form-费用表单页
      attachments: [],
      nowExpense: {},
      currencyList: [],
      nowCurrency: {},
      isShowInvoice: false,
      shareVisible: false,
      shareData: [],
      isCreateByApplication: false,
      currentRate: "",
      applicationData: [],
      typeSource: 'expenseType',  //expenseType invoice businessCard,
      saveLoading: false,
      shareModel: {},
      visible: false,
      headerData: {},
      editModel: {},
      oldInfo: {},
      defaultApportion: {},
      againLoading: false,
      copyLoading: false,
      applicationList: [],
      attachmentOID: [],
      isRefreshShareTabel: false,
      shareParams: {
        defaultApportion: {}
      },
      invoiceData: {},
      isCalculation: true   //是否需要计算费用金额
    };
  }

  onCancel = () => {
    this.props.onClose();
    this.resetForm();
  };

  getCurrencyFromList = (currencyCode) => {
    let result = false;
    this.state.currencyList.map(item => {
      if (item.currency === currencyCode) {
        result = item;
      }
    });
    return result;
  };

  // componentWillMount() {
  //   baseService.getCurrencyList().then(res => {
  //     this.setState({ currencyList: res.data })
  //   })
  // }

  componentDidMount(){
    let params = this.props.params;
    //关闭重置表单数据
    // if (this.props.params.visible) {
      this.resetForm();
    // }

    // //显示并且是新建
    // if (params.visible && !this.props.params.visible && !params.record.id) {

    //   let shareParams = { relatedApplication: params.headerData.relatedApplication, defaultApportion: params.defaultApportion };
    //   // this.refs.invoice.resetForm();
    //   this.setState({ isCopy: false, defaultApportion: params.defaultApportion, headerData: params.headerData, isShowInvoice: false, editModel: {}, expenseType: {}, nowPage: 'type', shareParams }, () => {
    //     if (this.state.headerData.relatedApplication === false) {
    //       this.setDefaultApplication();
    //     }
    //   });
    // }
    //显示并且是编辑
    //params.visible && !this.props.params.visible &&
    if (params.headerData.documentHeader.documentId) {
      let shareParams = { defaultApportion: params.defaultApportion };
      this.setState({ oldInfo: this.props.params.record, nowPage: 'form',  defaultApportion: params.defaultApportion, headerData: params.headerData, isShowInvoice: params.isShowInvoice, loading: true, shareParams }, () => {
        reimburseService.getCostDetail(params.record.sourceReportLineId).then(res => {
          if (this.state.isShowInvoice) {
            this.setState({ invoiceData: res.data, currentRate: res.data.taxRate, isCalculation: !(res.data.receiptTypeNo == "10" || res.data.receiptTypeNo == "04") });
          }
          let attachments = res.data.attachments.map(o => {
            return {
              ...o,
              uid: o.attachmentOID,
              name: o.fileName
            };
          });
          this.setState({
            editModel: res.data,
            loading: false,
            shareData: res.data.expenseApportionDTOList,
            fileList: attachments,
            expenseType:
              {
                name: res.data.expenseTypeName,
                iconURL: res.data.expenseTypeIconURL,
                id: res.data.expenseTypeId,
                expenseTypeOID: res.data.expenseTypeOID
              }
          }, () => {
            this.setShareTableData();
          })
        })
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    let params = nextProps.params;
    //关闭重置表单数据
    if (!params.visible && this.props.params.visible) {
      this.resetForm();
    }

    // //显示并且是新建
    // if (params.visible && !this.props.params.visible && !params.record.id) {

    //   let shareParams = { relatedApplication: params.headerData.relatedApplication, defaultApportion: params.defaultApportion };
    //   // this.refs.invoice.resetForm();
    //   this.setState({ isCopy: false, defaultApportion: params.defaultApportion, headerData: params.headerData, isShowInvoice: false, editModel: {}, expenseType: {}, nowPage: 'type', shareParams }, () => {
    //     if (this.state.headerData.relatedApplication === false) {
    //       this.setDefaultApplication();
    //     }
    //   });
    // }
    //显示并且是编辑
    if (params.visible && !this.props.params.visible && params.headerData.documentHeader.documentId) {
      let shareParams = { defaultApportion: params.defaultApportion };
      this.setState({ oldInfo: nextProps.params.record, nowPage: 'form',  defaultApportion: params.defaultApportion, headerData: params.headerData, isShowInvoice: params.isShowInvoice, loading: true, shareParams }, () => {
        reimburseService.getCostDetail(params.record.sourceReportLineId).then(res => {
          if (this.state.isShowInvoice) {
            this.setState({ invoiceData: res.data, currentRate: res.data.taxRate, isCalculation: !(res.data.receiptTypeNo == "10" || res.data.receiptTypeNo == "04") });
          }
          let attachments = res.data.attachments.map(o => {
            return {
              ...o,
              uid: o.attachmentOID,
              name: o.fileName
            };
          });
          this.setState({
            editModel: res.data,
            loading: false,
            shareData: res.data.expenseApportionDTOList,
            fileList: attachments,
            expenseType:
              {
                name: res.data.expenseTypeName,
                iconURL: res.data.expenseTypeIconURL,
                id: res.data.expenseTypeId,
                expenseTypeOID: res.data.expenseTypeOID
              }
          }, () => {
            this.setShareTableData();
          })
        })
      });
    }
  }

  //重置表单
  resetForm = () => {
    if (this.state.isShowInvoice) {
      this.refs.invoice.resetFields();
    }
    this.props.form.resetFields();
    this.setState({ applicationData: [], shareData: [], isShowInvoice: false, editModel: {}, expenseType: {}, nowPage: 'type', currentRate: "", isRefreshShareTabel: !this.state.isRefreshShareTabel, invoiceData: {} });
  };

  //编辑时设置分摊行
  setShareTableData = () => {

    let shareData = [];
    let applicationData = [];
    let defaultApportion = this.state.defaultApportion;

    this.state.editModel.expenseApportionDTOList && this.state.editModel.expenseApportionDTOList.map((o, index) => {

      let data = {
        companyName: o.companyName,
        departmentName: o.departmentName
      };

      let obj = {
        company: {
          id: o.companyId,
          name: o.companyName
        },
        department: {
          departmentId: o.departmentId,
          name: o.departmentName
        }
      };

      defaultApportion.costCenterItems && defaultApportion.costCenterItems.map((item, i) => {
        data[item.costCenterOID] = o.costCenterItems[i].costCenterItemName;
        obj[item.costCenterOID] = {
          key: o.costCenterItems[i].costCenterItemId,
          label: o.costCenterItems[i].costCenterItemName
        }
      });

      data.defaultApportion = o.defaultApportion;
      obj.defaultApportion = o.defaultApportion;

      data.cost = o.amount;
      obj.cost = o.amount;

      data.rowKey = index + 1;
      obj.rowKey = index + 1;

      data.applicationId = o.sourceDocumentLineId;
      obj.applicationId = o.sourceDocumentLineId;

      data.applicationCode = o.sourceDocumentCode;
      obj.applicationCode = o.sourceDocumentCode;


      if (o.sourceDocumentLineId) {
        data.isCreateByApplication = true;
        obj.isCreateByApplication = true;

      } else {
        data.isCreateByApplication = false;
        obj.isCreateByApplication = false;
      }

      shareData.push(data);
      applicationData.push(obj);

    });
    this.setState({ shareData, applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel });

  };

  //获取默认分摊行
  setDefaultApplication = () => {

    let shareData = [];
    let applicationData = [];
    let defaultApportion = this.state.defaultApportion;

    let data = {
      companyName: defaultApportion.companyName,
      departmentName: defaultApportion.departmentName
    };
    let obj = {
      company: {
        id: defaultApportion.companyId,
        name: defaultApportion.companyName
      },
      department: {
        departmentId: defaultApportion.departmentId,
        name: defaultApportion.departmentName
      }
    };
    defaultApportion.costCenterItems && defaultApportion.costCenterItems.map(o => {
      data[o.costCenterOID] = o.costCenterItemName;
      obj[o.costCenterOID] = {
        key: o.costCenterItemId,
        label: o.costCenterItemName
      }
    });
    data.defaultApportion = true;
    obj.defaultApportion = true;
    data.rowKey = 1;
    obj.rowKey = 1;
    shareData.push(data);
    applicationData.push(obj);
    this.setState({ shareData, applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel });

  };


  //提交
  handleSave = (e) => {

    e.preventDefault();

    this.setState({ saveLoading: true });
    this.save(() => {
      message.success(this.$t('common.save.success',{name:''}));
      this.props.close(true);
      this.setState({ saveLoading: false });
    })
  };

  handleSelectExpenseType = ()=>{
  };

  //录入发票事件
  isInputInvoiceChange = (value) => {
    if (!value) {
      this.refs.invoice.resetFields();
    }
    this.props.form.setFieldsValue({ actualAmount: "", amount: "" })
    this.setState({ isShowInvoice: value, currentRate: "" });
  };

  //新建分摊按钮事件
  newShare = (value) => {
    this.setState({ shareVisible: true, isCreateByApplication: value, shareModel: {} });
  };

  //编辑分摊
  editShare = (index) => {
    this.setState({ shareVisible: true, isCreateByApplication: this.state.applicationData[index].isCreateByApplication, shareModel: this.state.applicationData[index] });
  };

  //设置默认分摊行金额
  setDefaultAmount = (value, flag) => {

    //关联申请单不需要计算默认分摊行金额
    if (this.state.headerData.relatedApplication === true) return;

    if (!flag) {
      value = this.props.form.getFieldValue("actualAmount");
    }

    let shareData = this.state.shareData;
    let applicationData = this.state.applicationData;

    if (shareData && shareData.length) {

      let amount = 0;

      shareData.map(o => {
        if (!o.defaultApportion) {
          amount += parseFloat(o.cost);
        }
      });

      let data = shareData[0];
      let temp = applicationData[0];

      value = parseFloat(value);

      if (value || value === 0) {
        data.cost = value - amount;
        data.cost = this.toDecimal2(data.cost);
      }
      else {
        data.cost = "";
      }
      temp.cost = data.cost;


      this.setState({ shareData, applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel })
    }
  };

  //添加分摊
  shareOk = (values, isNew) => {

    let shareData = this.state.shareData;
    let applicationData = this.state.applicationData;
    let data = {};

    for (let key in values) {
      if (values[key] && values[key].label) {
        data[key] = values[key].label;
      }
    }
    data = {
      ...data,
      companyName: values.company.length ? values.company[0].name : "",
      departmentName: values.department.length ? values.department[0].name : "",
      cost: this.toDecimal2(values.cost),
      isCreateByApplication: values.isCreateByApplication,
      applicationId: values.applicationId,
      defaultApportion: values.defaultApportion,
      applicationCode: values.applicationCode,
    };

    if (isNew) {
      data.isCreateByApplication = this.state.isCreateByApplication;
      data.rowKey = 1;
      if (shareData.length) {
        data.rowKey = shareData[shareData.length - 1].rowKey + 1;
      }
      values.isCreateByApplication = this.state.isCreateByApplication;
      values.rowKey = data.rowKey;

      shareData.push(data);
      values.company = values.company[0];
      values.department = values.department[0];
      applicationData.push(values);
    }
    else {
      data.rowKey = values.rowKey;
      shareData[values.rowKey - 1] = data;
      values.company = values.company[0];
      values.department = values.department[0];
      applicationData[values.rowKey - 1] = values;
    }

    this.setState({ shareData, applicationData, shareVisible: false, isRefreshShareTabel: !this.state.isRefreshShareTabel }, () => {
      this.setDefaultAmount();
    });
  }

  //删除分摊
  deleteShare = (index) => {
    let shareData = this.state.shareData;
    let applicationData = this.state.applicationData;
    shareData.splice(index, 1);
    applicationData.splice(index, 1);
    this.setState({ shareData, applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel }, () => {
      this.setDefaultAmount();
    });
  };

  //报账金额改变
  amountChange = (value) => {
    this.setDefaultAmount(value, true);
  };

  //发票价税合计改变
  invoiceAmountChange = (value, rate, isCalculation) => {

    this.setState({ isCalculation: isCalculation });

    if (!isCalculation || (!rate && rate !== 0)) {
      this.props.form.setFieldsValue({ amount: value });
      this.props.form.setFieldsValue({ actualAmount: value });
      this.setDefaultAmount(value, true);
      return;
    }
    this.props.form.setFieldsValue({ amount: value });

    let result = "";

    if (value && (rate || rate === 0)) {
      result = value / (1 + rate);
      result = this.toDecimal2(result);
    }

    this.props.form.setFieldsValue({ actualAmount: result });

    this.setDefaultAmount(result, true);
  };

  //税率改变
  invoiceRateChange = (rate, isCalculation) => {
    this.setState({ currentRate: rate, isCalculation: isCalculation });
    this.props.form.setFieldsValue({ amount: "", actualAmount: "" });
    this.setDefaultAmount("", true);
  };

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
  };

  //上传附件
  handleUpload = (values) => {
    this.setState({ attachmentOID: values });
  };

  //检查金额
  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('金额不能小于等于0！');
  };



  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { oldInfo, nowPage, expenseType, loading, shareData, saving, attachments, currencyList, nowCurrency,
      businessCardConsumptions, nowBusinessCardConsumptionIndex, shareVisible, isCreateByApplication, saveLoading, editModel, fileList, invoiceData } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 17 },
    };
    return (
      <div className="new-expense">
        <Form onSubmit={this.handleSave}>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('common.expense.type')}>
                {getFieldDecorator('expenseTypeId', {
                  initialValue: oldInfo.id ? [{ id: oldInfo.expenseType.id, name: oldInfo.expenseType.name }] : [] })(
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
            <FormItem {...formItemLayout} label={this.$t('common.happened.date')}>
              {getFieldDecorator('createTime', {
                initialValue: editModel.id ? moment(editModel.createTime) : moment(),
                rules: [{ message: this.$t('common.please.enter') , required: true }]
              })(
                <DatePicker disabled format="YYYY-MM-DD" style={{width: '100%'}} />
              )}
            </FormItem>
          </Col>
        </Row>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('expense.enter.invoice')}>
              {getFieldDecorator('vatInvoice', {
                valuePropName: 'checked',
                initialValue: this.state.isShowInvoice
              })(
                <Switch disabled onChange={this.isInputInvoiceChange} />
              )}
            </FormItem>
            </Col>
          </Row>
          {
            this.state.isShowInvoice && <InvoiceInfo onAmountChange={this.invoiceAmountChange} onRateChange={this.invoiceRateChange} headerData={this.state.headerData} params={invoiceData} ref="invoice"></InvoiceInfo>
          }
          <Row gutter={24}>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('exp.reu.amount')/*报账金额*/}>
                {getFieldDecorator('amount', {
                  initialValue: editModel.id ? editModel.amount : "",
                  rules: [{ validator: this.checkPrice }]
                })(
                  <InputNumber disabled step={0.01} style={{ width: '100%' }} percision={2} />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label={this.$t('exp.expense.amount')/*费用金额*/}>
                {getFieldDecorator('actualAmount', {
                  initialValue: editModel.id ? editModel.actualAmount : ""
                })(
                  <InputNumber disabled onChange={this.amountChange} step={0.01} style={{ width: '100%' }} percision={2} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <FormItem  labelCol={{ span: 3 }}
                       wrapperCol={{ span: 20 }} label={this.$t("common.attachments")} style={{marginLeft: -4}} >
              {
                editModel.attachments && editModel.attachments.map((item, index) => {
                  return (
                    <div key={index} >
                      <a onClick={() => this.download(item)}>
                        <Icon type="paper-clip" style={{ marginRight: 5 }} />{item.fileName}
                      </a>
                    </div>
                  )
                })
              }
            </FormItem>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <FormItem  labelCol={{ span: 3 }}
                         wrapperCol={{ span: 20 }}
                        label={this.$t("common.comment")}
                        style={{marginLeft: -5}}>
                {getFieldDecorator('comment', {
                  initialValue: editModel.id ? editModel.comment : ""
                })(
                  <TextArea disabled rows={4} style={{ width: '100%'}} />
                )}
              </FormItem>
            </Col>

          </Row>
          <ShareDetail isRefresh={this.state.isRefreshShareTabel} mode={true} edit={this.editShare} deleteShare={this.deleteShare} params={this.state.shareParams} data={shareData}></ShareDetail>
        </Form>
        <ShareForm
          handleCancel={() => { this.setState({ shareVisible: false }) }}
          handleOk={this.shareOk}
          visible={shareVisible}
          defaultApportion={this.state.defaultApportion}
          typeList={this.state.defaultApportion.costCenterItems}
          flag={isCreateByApplication}
          model={this.state.shareModel}
          applicationList={this.state.applicationList}
          headerData={this.state.headerData}
          type={this.state.expenseType.id}
        >
        </ShareForm>
      </div>)
  }

}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    companyConfiguration: state.user.companyConfiguration,
    profile: state.user.profile
  }
}

const WrappedExpenseInfo = Form.create()(ExpenseInfo);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedExpenseInfo);
