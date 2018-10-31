import React from 'react'
import { connect } from 'dva';
import baseService from 'share/base.service'
import moment from 'moment' 
import {getApprovelHistory, mulCalculate, deepFullCopy} from 'utils/extend'
import { Alert, Form, Switch, Icon, Input, Select, Button, Row, Col, message, Card, Popover, InputNumber, DatePicker, Spin, Popconfirm, Tag, Table, Modal ,Timeline } from 'antd'
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import Chooser from 'components/Widget/chooser'
import Location from 'components/Widget/location'
import Invoice from 'containers/my-account/invoice'
import ExpenseApportion from 'containers/my-account/expense-apportion'
import 'styles/my-account/new-expense.scss'
import ExpenseTypeSelector from 'components/Widget/Template/expense-type-selector'
import CreateInvoice from 'containers/my-account/create-invoice'
import BusinessCardConsumption from 'components/Widget/Template/business-card-consumption-selector'
import FileUpload from 'components/Widget/file-upload'
import expenseService from 'containers/my-account/expense.service'
import invoiceImg from 'images/expense/invoice-info.png'
import invoiceImgEn from 'images/expense/invoice-info-en.png'
import ImageAudit from 'containers/financial-management/finance-audit/image-audit'
import Selector from 'components/Widget/selector'
import DateCombined from 'containers/my-account/date-combined'
import Animate from 'rc-animate';
import config from 'config'
import Searcher from 'components/Widget/searcher'
import {rejectPiwik} from "share/piwik";
const DivExpense = (props) => {
  const childrenProps = {...props};
  delete childrenProps.show;
  return <div {...childrenProps} />;
};

/**
 * props.params
 * @params nowExpense 费用详细
 * @params expenseSource 费用来源  expenseType-手工录入 invoice-发票录入 card-商务卡消费
 */
class NewExpense extends React.Component {
  constructor(props) {
    super(props);
    let expenseReportInfo = this.props.expenseReport || {};
    this.state = {
      businessCardConsumptions: [],
      nowBusinessCardConsumptionIndex: 0,
      expenseType: {},
      loading: false,
      saving: false,
      isNonVat: false,
      nowPage: 'type',  //type-费用类型选择、发票录入、商务卡消费选择页  form-费用表单页
      attachments: [],
      nowExpense: {},
      currencyList: [],
      nowCurrency: {
        rate: 1.0000,
        currencyCode: this.props.company.baseCurrency
      },
      baseCurrency: {
        currencyCode: expenseReportInfo.baseCurrency || this.props.company.baseCurrency
      },
      taxRates: [],
      invoiceTypes: [],
      invoiceAllTypes: [],
      testInvoiceTypes: [],
      typeSource: 'expenseType',  //expenseType invoice businessCard
      expenseApportion: [],
      readOnly: false,
      digitalInvoice: null,
      showImageAudit: false,
      companyOpenInvoice: false,  //公司是否开通票加加
      previewVisible: false,
      auditAmountEditing: false,
      savingAuditAmount: false,
      editingInvoice: false,
      savingInvoice: false,
      showExpenseDom: false,//费用dom切换，控制开关
      defaultAttachment: null,
      approvalHistory:[],
      fromExpense: false,
      invoiceFp:null,//单据FP
      invoiceCompany:null,//单据的公司
      attachmentChange: false,
      warnExchangeRateTol:10,//汇率容差警告值
      prohibitExchangeRateTol:20,//汇率容差禁止值
      mileageAllowanceExpenseColumns: [{
        title: this.$t('expense.mileage.depart.info')/*出发信息*/, dataIndex: 'start', render: (value, record) => this.renderMileageAllowanceExpenseOrder(value, record.departTime)
      }, {
        title: this.$t('expense.mileage.arrive.info')/*到达信息*/, dataIndex: 'end', render: (value, record) => this.renderMileageAllowanceExpenseOrder(value, record.arriveTime)
      }, {
        title: this.$t('expense.mileage')/*里程*/ + '(KM)', dataIndex: 'mileage', render: (value, record) => (
          <div>
            {this.$t('common.actual')/*实际*/}：{value}<br/>
            {this.$t('common.reference')/*参考*/}：{record.referenceMileage}
          </div>
        )
      }, {
        title: this.$t('common.matter')/*事由*/, dataIndex: 'remark'
      }],
      //单价模式
      unitPriceMode: false,
      recordTaxRateConfig: false,//补录税率配置，当查验返回R_2002，需要强制显示税率／税额／不含税金额控件。切换发票类型取消。
      recordTaxAmountConfig: false,//补录税率配置，税额合计特殊处理
      recordNonVATinclusiveAmountConfig: false,//补录税率配置,金额合计特殊处理
      receiptConfigList: [],//发票控件配置对象信息
      mileageMessageKey: ['mileage', 'unit.price', 'reference.price', 'reference.mileage', 'reference.currency', 'ER_KM']
    };
  }

  renderMileageAllowanceExpenseOrder = (value ,date) => (
    <div>
      {new Date(date).format('yyyy-MM-dd hh:mm:ss')}<br/>
      {value.place}
    </div>
  );

  onCancel = (refresh = false) => {
    this.props.form.resetFields();
    refresh = this.state.attachmentChange ? true : refresh;
    this.props.onClose(refresh);
  };

  //根据用户OID获取FP，用户不同用户操作同一页面。如财务操作用户费用页面，取员工FP
  getFpByUserOID(userOID) {
    let {invoiceFp,invoiceCompany} = this.state;
    baseService.getFpByUserOID(userOID).then(res => {
      invoiceFp = res.data;
      this.setState({invoiceFp})
    });
    baseService.getCompanyByUserOID(userOID).then(res => {
      invoiceCompany = res.data;
      this.setState({invoiceCompany})
    });
  }

  getCurrencyFromList = (currencyCode) => {
    let result = false;
    this.state.currencyList.map(item => {
      if(item.currency === currencyCode){
        item.currencyCode = item.currency;
        result = item;
      }
    });
    return result;
  };

  componentWillMount(){
    let userOID = this.props.user.userOID;
    if(this.props.params && this.props.params.audit){
      userOID = this.props.params.expenseReport.applicantOID;
      this.getFpByUserOID(userOID)
    };
    baseService.getAllCurrencyByLanguage('chineseName', userOID).then(res => {
      this.setState({currencyList: res.data.filter(item => item.enable) })
    });
    this.getRateDeviation();
    Promise.all([
      expenseService.getTitleListByEntity(userOID),
      expenseService.getInvoiceTypeList(),
      expenseService.getMileageMode()
    ]).then(res => {
      if(res[0].data.rows){
        expenseService.getTestInvoiceTypeList().then(testRes => {
          this.setState({
            testInvoiceTypes: testRes.data,
            invoiceTypes:res[1].data.rows,
            invoiceAllTypes:res[1].data,
            companyOpenInvoice: res[0].data.rows,
            unitPriceMode: res[2].data.mode === 9001
          });
        })
      } else {
        this.setState({ companyOpenInvoice: res[0].data.rows, invoiceTypes: res[1].data.rows,  unitPriceMode: res[2].data.mode === 9001});
      }
    });
    expenseService.getRateByInvoiceType('').then(res => {
      this.setState({ taxRates: res.data.sort((a, b) => a.taxRateValue > b.taxRateValue || -1) })
    });
    
  }

  componentDidMount(){
    if (this.props.params.slideFrameShowFlag === false){
      this.setState({
        nowPage: 'type',
        typeSource: '',
        nowExpense: {},
        recordTaxRateConfig: false,
        recordTaxAmountConfig: false,
        recordNonVATinclusiveAmountConfig: false,
        attachments: [],
        businessCardConsumptions: [],
        nowBusinessCardConsumptionIndex: 0,
        expenseType: {},
        digitalInvoice: null,
        auditAmountEditing: false,
        editingInvoice: false,
        readOnly: false
      });
      this.props.form.resetFields();
    }
    //更换费用录入类型时，重置界面到type
    if(this.props.params.expenseSource !== this.state.typeSource && !this.props.params.nowExpense){
      this.setState({
        typeSource: this.props.params.expenseSource,
        nowPage: 'type',
        digitalInvoice: null,
        businessCardConsumptions: [],
        nowBusinessCardConsumptionIndex: 0
      });
    }
    
    //费用改变时
    if(this.props.params.nowExpense && (!this.state.nowExpense || (this.state.nowExpense.invoiceOID !== this.props.params.nowExpense.invoiceOID))){
      let expenseDetail = this.props.params.nowExpense;
      expenseDetail.data && expenseDetail.data.sort((a, b) => a.sequence > b.sequence || -1);
      expenseDetail.preCreatedDate = expenseDetail.createdDate;
      let businessCardConsumptions = [], nowBusinessCardConsumptionIndex = 0;
      if(expenseDetail.bankTransactionID){
        businessCardConsumptions = [expenseDetail.bankTransactionDetail];
        nowBusinessCardConsumptionIndex = 0
      }
      let isNonVat = false;
      if(expenseDetail.digitalInvoice){
        expenseDetail.digitalInvoice.invoiceLabels = expenseDetail.invoiceLabels;
        let invoice = ['01','03','004','005','007','008','009','010'];
        invoice.map(item => {
          expenseDetail.digitalInvoice.invoiceTypeNo === item && (isNonVat = true);
        });
      }
      this.setState({
        readOnly: this.props.params.readOnly,
        nowPage: 'form',
        typeSource: '',
        nowExpense: expenseDetail,
        approvalHistory: expenseDetail.approvalOperates,
        attachments: expenseDetail.attachments,
        businessCardConsumptions,
        nowBusinessCardConsumptionIndex,
        expenseApportion: expenseDetail.expenseApportion,
        digitalInvoice: expenseDetail.digitalInvoice,
        isNonVat:isNonVat
      });
      baseService.getAllCurrencyByLanguage('chineseName', this.props.user.userOID).then(res => {
        this.setState({currencyList: res.data.filter(item => item.enable) },()=>{
          this.setState({
            nowCurrency: this.getCurrencyFromList(expenseDetail.currencyCode),
          });
        })
      });
      
      baseService.getExpenseTypeById(this.props.params.nowExpense.expenseTypeId).then(res => {
        //里程补贴的readonly是true，但是他是可以编辑的
        let readOnly = this.props.params.readOnly || (res.data.readonly && res.data.messageKey !== 'private.car.for.public');
        this.setState({
          expenseType: res.data,
          readOnly
        }, () => {
          this.getFieldEnumerationList();
          let value = {
            createdDate: moment(expenseDetail.createdDate),
            invoiceCurrencyCode: expenseDetail.invoiceCurrencyCode,
            amount: expenseDetail.amount,
            actualCurrencyRate: expenseDetail.actualCurrencyRate,
            payByCompany: expenseDetail.paymentType === 1002,
            comment: expenseDetail.comment || ''
          };
          if(res.data.pasteInvoiceNeeded && expenseDetail.vatInvoice &&
            expenseDetail.digitalInvoice && expenseDetail.digitalInvoice.cardsignType === 'HAND'){
            value.vatInvoice = expenseDetail.vatInvoice;
          }
          if(expenseDetail.bankTransactionID){
            value.businessCardRemark = expenseDetail.bankTransactionDetail.remark;
          }
          if(!this.props.profile['invoice.instead.disabled'])
            value.invoiceInstead = expenseDetail.invoiceInstead;
          //替票理由，如果不提票则不set对应值
          if(expenseDetail.invoiceInstead)
            value.invoiceInsteadReason = expenseDetail.invoiceInsteadReason || '';
          //遍历费用表单，将OID设置为表单id
          expenseDetail.data.map((field, index) => {
            if(field.showOnList && !(expenseDetail.paymentType === 1001 && field.messageKey == 'company.payment.type')){
              value[field.fieldOID] = this.getFieldValue(field.fieldType, field.value, field.showValue,field);
            }
          });
          !readOnly && this.props.form.setFieldsValue(value);
          //第三方费用只set发票相关
          if(!this.props.params.readOnly && (res.data.readonly && res.data.messageKey !== 'private.car.for.public')){
            let valueWillSet = {};
            if(res.data.pasteInvoiceNeeded && expenseDetail.vatInvoice &&
              expenseDetail.digitalInvoice && expenseDetail.digitalInvoice.cardsignType === 'HAND'){
              valueWillSet.vatInvoice = expenseDetail.vatInvoice;
            }
            if(!this.props.profile['invoice.instead.disabled'])
              valueWillSet.invoiceInstead = expenseDetail.invoiceInstead;
            if(expenseDetail.invoiceInstead)
              valueWillSet.invoiceInsteadReason = expenseDetail.invoiceInsteadReason || '';
            this.props.form.setFieldsValue(valueWillSet);
          }
        });
      });
    } else if(!this.props.params.nowExpense) {
      baseService.getAllCurrencyByLanguage('chineseName', this.props.user.userOID).then(res => {
        this.setState({currencyList: res.data.filter(item => item.enable) },()=>{
          this.setState({
            nowCurrency: this.getCurrencyFromList('CNY'),
          });
        })
      });
      rejectPiwik(`我的账本/新建账本`);
      //如果为新建，重置数据
      this.setState({nowPage: 'type', nowExpense: {}, attachments: [], expenseApportion: []});
      let currencyCode = this.props.params.expenseReport ? this.props.params.expenseReport.currencyCode : this.props.company.baseCurrency
      this.props.form.setFieldsValue({ invoiceCurrencyCode: currencyCode });
      this.handleChangeCurrency(currencyCode);
    }
  }

  componentWillReceiveProps(nextProps){
    let switchingInvoiceConfig = nextProps.nowExpense && this.props.params.nowExpense && nextProps.nowExpense.invoiceOID != this.props.params.nowExpense.invoiceOID;
    if(nextProps.slideFrameShowFlag === this.props.slideFrameShowFlag && !switchingInvoiceConfig){
      return;
    }
    else if (nextProps.slideFrameShowFlag === false || switchingInvoiceConfig){
      this.setState({
        nowPage: 'type',
        typeSource: '',
        nowExpense: {},
        recordTaxRateConfig: false,
        recordTaxAmountConfig: false,
        recordNonVATinclusiveAmountConfig: false,
        attachments: [],
        businessCardConsumptions: [],
        nowBusinessCardConsumptionIndex: 0,
        expenseType: {},
        digitalInvoice: null,
        auditAmountEditing: false,
        editingInvoice: false,
        readOnly: false
      });
      nextProps.form.resetFields();
    }
    //更换费用录入类型时，重置界面到type
    if(nextProps.expenseSource !== this.state.typeSource && !nextProps.nowExpense){
      this.setState({
        typeSource: nextProps.expenseSource,
        nowPage: 'type',
        digitalInvoice: null,
        businessCardConsumptions: [],
        nowBusinessCardConsumptionIndex: 0
      });
    }
    
    //费用改变时
    if(nextProps.nowExpense && (!this.state.nowExpense || (this.state.nowExpense.invoiceOID !== nextProps.nowExpense.invoiceOID))){
      let expenseDetail = nextProps.nowExpense;
      expenseDetail.data && expenseDetail.data.sort((a, b) => a.sequence > b.sequence || -1);
      expenseDetail.preCreatedDate = expenseDetail.createdDate;
      let businessCardConsumptions = [], nowBusinessCardConsumptionIndex = 0;
      if(expenseDetail.bankTransactionID){
        businessCardConsumptions = [expenseDetail.bankTransactionDetail];
        nowBusinessCardConsumptionIndex = 0
      }
      let isNonVat = false;
      if(expenseDetail.digitalInvoice){
        expenseDetail.digitalInvoice.invoiceLabels = expenseDetail.invoiceLabels;
        let invoice = ['01','03','004','005','007','008','009','010'];
        invoice.map(item => {
          expenseDetail.digitalInvoice.invoiceTypeNo === item && (isNonVat = true);
        });
      }
      this.setState({
        readOnly: nextProps.readOnly,
        nowPage: 'form',
        typeSource: '',
        nowCurrency: this.getCurrencyFromList(expenseDetail.currencyCode),
        nowExpense: expenseDetail,
        approvalHistory: expenseDetail.approvalOperates,
        attachments: expenseDetail.attachments,
        businessCardConsumptions,
        nowBusinessCardConsumptionIndex,
        expenseApportion: expenseDetail.expenseApportion,
        digitalInvoice: expenseDetail.digitalInvoice,
        isNonVat:isNonVat
      });
      baseService.getExpenseTypeById(nextProps.nowExpense.expenseTypeId).then(res => {
        //里程补贴的readonly是true，但是他是可以编辑的
        let readOnly = nextProps.readOnly || (res.data.readonly && res.data.messageKey !== 'private.car.for.public');
        this.setState({
          expenseType: res.data,
          readOnly
        }, () => {
          this.getFieldEnumerationList();
          let value = {
            createdDate: moment(expenseDetail.createdDate),
            invoiceCurrencyCode: expenseDetail.invoiceCurrencyCode,
            amount: expenseDetail.amount,
            actualCurrencyRate: expenseDetail.actualCurrencyRate,
            payByCompany: expenseDetail.paymentType === 1002,
            comment: expenseDetail.comment || ''
          };
          if(res.data.pasteInvoiceNeeded && expenseDetail.vatInvoice &&
            expenseDetail.digitalInvoice && expenseDetail.digitalInvoice.cardsignType === 'HAND'){
            value.vatInvoice = expenseDetail.vatInvoice;
          }
          if(expenseDetail.bankTransactionID){
            value.businessCardRemark = expenseDetail.bankTransactionDetail.remark;
          }
          if(!this.props.profile['invoice.instead.disabled'])
            value.invoiceInstead = expenseDetail.invoiceInstead;
          //替票理由，如果不提票则不set对应值
          if(expenseDetail.invoiceInstead)
            value.invoiceInsteadReason = expenseDetail.invoiceInsteadReason || '';
          //遍历费用表单，将OID设置为表单id
          expenseDetail.data.map((field, index) => {
            if(field.showOnList && !(expenseDetail.paymentType === 1001 && field.messageKey == 'company.payment.type')){
              value[field.fieldOID] = this.getFieldValue(field.fieldType, field.value, field.showValue,field);
            }
          });
          !readOnly && nextProps.form.setFieldsValue(value);
          //第三方费用只set发票相关
          if(!nextProps.readOnly && (res.data.readonly && res.data.messageKey !== 'private.car.for.public')){
            let valueWillSet = {};
            if(res.data.pasteInvoiceNeeded && expenseDetail.vatInvoice &&
              expenseDetail.digitalInvoice && expenseDetail.digitalInvoice.cardsignType === 'HAND'){
              valueWillSet.vatInvoice = expenseDetail.vatInvoice;
            }
            if(!this.props.profile['invoice.instead.disabled'])
              valueWillSet.invoiceInstead = expenseDetail.invoiceInstead;
            if(expenseDetail.invoiceInstead)
              valueWillSet.invoiceInsteadReason = expenseDetail.invoiceInsteadReason || '';
            nextProps.form.setFieldsValue(valueWillSet);
          }
        });
      });
    } else if(!nextProps.nowExpense) {
      rejectPiwik(`我的账本/新建账本`);
      //如果为新建，重置数据
      this.setState({nowPage: 'type', nowExpense: {}, attachments: [], expenseApportion: []});
      let currencyCode = nextProps.expenseReport ? nextProps.expenseReport.currencyCode : this.props.company.baseCurrency
      this.props.form.setFieldsValue({ invoiceCurrencyCode: currencyCode });
      this.handleChangeCurrency(currencyCode);
    }
  }
  /**
   * @description 是否有票
   * 1: 录入发票为true
   * 2： 有电子票 而且发票cardsignType 不为HAND
   * */
  hasInvoice = () => {
    const {digitalInvoice} = this.state;
    let isHandDigitalInvoice = digitalInvoice && digitalInvoice.cardsignType === 'HAND';
    let vatInvoice = this.props.form.getFieldValue('vatInvoice');
    if (vatInvoice) {
      return true;
    }
    if (digitalInvoice && !isHandDigitalInvoice) {
      return true;
    }
    return false;
  };

  isRequiredFile = () => {
    //attachmentRequired用于配置附件是否必填，0为不必填，1为始终必填，
    // 2为有发票时不必填 : 费用中有导入、扫入、录入发票或费用为无票时，附件不必填，
    // 3有发票电子原件不必填
    const {digitalInvoice, expenseType} = this.state;

    if (expenseType.attachmentRequired === 1) {
      return true;
    }
    if (expenseType.attachmentRequired === 2 && expenseType.pasteInvoiceNeeded && ! this.hasInvoice()) {
      return true;
    }
    if (expenseType.attachmentRequired === 3 && !(digitalInvoice && digitalInvoice.pdfUrl)) {
      return true;
    }
    return false;
  };
  handleChangeAmount= () =>{
    this.reRender();
  }
  //解决真实DOM延迟渲染问题
  reRender(){
    let {readOnly}=this.state;
    setTimeout(()=>this.setState({readOnly}),10)
  }
  getFieldEnumerationList = () => {
    const { expenseType, nowExpense } = this.state;
    let fieldsCount = 0;
    let fields = [];
    if(nowExpense && nowExpense.data){
      fields = nowExpense.data
    } else {
      fields = expenseType.fields;
    }
    let fieldLength = fields.length;
    fields.map((field, index) => {
      if(field.customEnumerationOID){
        baseService.getCustomEnumerationsByOID(field.customEnumerationOID).then(res => {
          field.list = res.data ? res.data : [];
          fieldsCount++;
          if(fieldsCount === fieldLength){
            fields.splice(index, 1, field);
            expenseType.fields = fields;
            if(nowExpense && nowExpense.data){
              nowExpense.data = fields;
              this.setState({ nowExpense, expenseType })
            }
            this.setState({ expenseType });
          }
        });
      } else {
        fieldsCount++;
        if(fieldsCount === fieldLength){
          fields.splice(index, 1, field);
          expenseType.fields = fields;
          if(nowExpense && nowExpense.data){
            nowExpense.data = fields;
            this.setState({ nowExpense, expenseType })
          }
          this.setState({ expenseType });
        }
      }
    })
  };

  /**
   * 保存前的费用检查
   * @param values  当页通过组件验证的表单项
   * @return {Promise}
   */
  validate = (values) => {
    let expenseReport = this.props.expenseReport;
    return new Promise((resolve, reject) => {
      const { expenseType, nowCurrency, attachments, nowExpense, digitalInvoice, invoiceTypes, unitPriceMode,
        businessCardConsumptions, nowBusinessCardConsumptionIndex, expenseApportion, editingInvoice } = this.state;
      const { profile } = this.props;
      // 错误数据
      let errorMessages = [];
      //初始化对象
      let target = nowExpense.invoiceOID ? JSON.parse(JSON.stringify(nowExpense)) : {
        attachments: attachments,
        invoiceStatus: 'INIT',
        readonly: false,
        recognized: false
      };
      target.currencyCode = nowCurrency.currencyCode;
      target.expenseTypeName = expenseType.name;
      target.expenseTypeOID = expenseType.expenseTypeOID;
      target.expenseTypeId = expenseType.id;
      target.expenseTypeIconName = expenseType.iconName;
      target.expenseTypeKey = expenseType.messageKey;
      if(!expenseType.id){
        // message.error(this.$t('expense.please.select.expense.type')/*请选择费用类型*/);
        /*请选择费用类型*/
        errorMessages.push(this.$t('expense.please.select.expense.type'));
      }
      if (businessCardConsumptions.length > 0) {
        let businessCard = businessCardConsumptions[nowBusinessCardConsumptionIndex];
        target.bankTransactionDetail = businessCard;
        target.bankTransactionID = businessCard.id;
        //商务卡配置以前是true或者false，现在改成1，2，3且做老数据兼容。
        if (profile['All.BusinessCardAmount.FeeAmount'] !== 1) {
          if (this.checkFunctionProfiles('All.BusinessCardAmount.FeeAmount', [true, 2, 'true']) && values.amount !== businessCard.oriCurAmt) {
            errorMessages.push(this.$t('expense.business.card.amount.equal')/*费用金额必须与商务卡消费金额一致*/);
          }
          if ((!profile['All.BusinessCardAmount.FeeAmount'] || profile['All.BusinessCardAmount.FeeAmount'] === 3) && values.amount > businessCard.oriCurAmt) {
            errorMessages.push(this.$t('expense.business.card.amount.less')/*费用金额必须小于等于商务卡消费金额*/);
          }
        }
      }
      let expenseInfo = nowExpense.invoiceOID ? nowExpense.data : expenseType.fields;
      let targetFields;
      if(expenseInfo){
        targetFields = JSON.parse(JSON.stringify(expenseInfo));
      }
      target.digitalInvoice = digitalInvoice;
      //将表单内容填入
      Object.keys(values).map(key => {
        let value = values[key];
        if(key === 'createdDate'){
          target.createdDate = value.utc().format();
        } else if(key === 'payByCompany'){
          target.paymentType = value ? 1002 : 1001;
        } else if(key === 'businessCardRemark'){
          target.bankTransactionDetail.remark = value;
        } else {
          target[key] = value;
        }

        //循环查找fields值填入
        targetFields && targetFields.map(field => {
          if(key === field.fieldOID && field.editable){
            if(field.fieldType === 'PARTICIPANTS')
              value = JSON.stringify(value);
            if(field.fieldType === 'PARTICIPANT'){
              if(value && value.length > 0){
                value = JSON.stringify({
                  enabled: true,
                  userOID: value[0].userOID
                })
              } else {
                value = JSON.stringify({enabled: false})
              }
            }
            // 地区需要做特殊处理
            if (field.fieldType === 'LOCATION') {
              value = value && value.key ? value.key : value;
            }

            field.value = value;
            field.i18n = null;
            if((field.list || field.fieldType === 'CUSTOM_ENUMERATION') && value && Array.isArray(value) && value.length>0){
              field.value = value[0].value;
              field.list.map(item => {
                if(item.value === value[0].value)
                  field.valueKey = item.messageKey;
              });
            }
            //如果有值列表，则删除值列表数组
            if(field.list)
              delete field.list;
            //删除上面添加的属性
            delete target[key];
            return field;
          }
        });
      });
      if (!profile['All.FeeAmount.AllowZero'] && !target.amount){
        errorMessages.push(this.$t('expense.amount.can.not.be.zero')/*金额不能为0*/);
      }
      //第三方费用修改金额
      let thirdEditAmount = !this.props.readOnly && expenseType.readonly && expenseType.isAmountEditable && expenseType.messageKey !== 'private.car.for.public';
      if(thirdEditAmount && !profile['All.FeeAmount.OrderAmount'] && nowExpense.orderAmount < target.amount){
        errorMessages.push(this.$t('expense.amount.must.less.than.origin')/*金额不能大于原始金额*/);
      }

      //当不提票时置理由为空，防止下次修改自动填上上次的值
      if(!target.invoiceInstead){
        target.invoiceInsteadReason = null;
      }
      if (!this.checkInvoiceRender('invoiceDate') && editingInvoice && digitalInvoice) {
        digitalInvoice.billingTime = null;
      }
      //录入发票未勾选时，要清空跟增值税专用发票相关属性的值，防止有值对费用造成干扰
      if(!target.vatInvoice){
        target.invoiceTypeNo = null;  //发票类型
        target.invoiceDate = null; //开票日期
        target.invoiceCode = null; // 发票代码
        target.invoiceNumber = null;   // 发票号码
        target.vatInvoiceCurrencyCode = null;  // 币种
        target.nonVATinclusiveAmount = null;   // 总金额
        target.taxRate = null; // 税率
        target.taxAmount = null;   // 税额合计
        target.priceTaxAmount = null;  // 价税总额
        target.checkCode = null;  // 校验码
      } else {
        if(target.invoiceDate){
          target.invoiceDate = moment(target.invoiceDate).format('YYYY-MM-DD');
        } else if (digitalInvoice && digitalInvoice.billingTime){
          target.invoiceDate = moment(new Date(digitalInvoice.billingTime * 1000)).format('YYYY-MM-DD');
        }
        if (!target.vatInvoiceCurrencyCode) {
          target.vatInvoiceCurrencyCode = target.invoiceCurrencyCode
        }

        if(target.invoiceTypeNo){
          target.receiptTypeNo = target.invoiceTypeNo;
        }
        invoiceTypes.map(item => {
          item.value === target.receiptTypeNo && ( target.receiptType = item.messageKey )
        });
      }
      if(target.vatInvoice || (digitalInvoice && digitalInvoice.cardsignType !== 'HAND')){
        let invoiceControl = profile['InvoiceControl.InvoiceAmount.FeeAmount.ALL.Equal'];
        let priceTaxAmount = !target.priceTaxAmount ? (digitalInvoice.fee / 100) : target.priceTaxAmount;

        // 手工录入的发票检测
        if (!values.nonVATinclusiveAmount && digitalInvoice && +digitalInvoice.fee < +digitalInvoice.feeWithoutTax && digitalInvoice.cardsignType === 'HAND') {
          // 税额合计不能大于价税合计
          errorMessages.push(this.$t('expense.amount.tax.must.less.than.amt.tip'));
        };
        if(invoiceControl === 0 || !invoiceControl){
          target.amount > priceTaxAmount &&
          errorMessages.push(this.$t('expense.amount.must.less.than.or.equal.to.invoice.price.and.tax.amount')/*费用金额必须小于等于发票的价税合计*/);
        } else if(invoiceControl === 2 || invoiceControl === true) {
          target.amount !== priceTaxAmount &&
          errorMessages.push(this.$t('expense.amount.must.equal.to.invoice.price.and.tax.amount')/*费用金额必须等于发票的价税合计*/);
        }
      }
      target.data = targetFields;
      target.data && target.data.map(item => {
        if(item.fieldType === 'DATETIME' || item.fieldType === 'DATE' || item.fieldType === 'MONTH')
          item.value = item.value ? moment(item.value).subtract(-8, 'hours').utc().format() : null;
        return item;
      });
      if(target.invoiceCode && target.invoiceCode !== ''){
        target.invoiceCode = target.invoiceCode.toUpperCase();
      }
      target.baseCurrency = this.props.company.baseCurrency;
      target.updateRate = profile['web.expense.rate.edit.disabled'] !== 'true'
        && profile['web.expense.rate.edit.disabled'] !== true;
      target.attachments = attachments;
      if(expenseType.apportionEnabled && expenseReport) {
        let targetApportion = [];
        let expenseApportionAmount = 0;
        let amountZeroTip = true;
        let itemNullTip = true;
        let personNullTip = true;
        let expenseApportionProportion=0;
        expenseApportion.map(apportion => {
          let tempApportion = JSON.parse(JSON.stringify(apportion));
          if (tempApportion.amount === 0 || tempApportion.proportion === 0) {
            amountZeroTip && errorMessages.push(this.$t('expense.apportion.amount.can.not.be.zero')/*费用分摊项金额与比例不能为0*/);
            amountZeroTip = false;
          }
          if (!tempApportion.costCenterItems || tempApportion.costCenterItems.length === 0) {
            itemNullTip && errorMessages.push(this.$t('expense.apportion.item.can.not.be.null')/*费用分摊项不能为空*/);
            itemNullTip = false;
          } else {
            let existCostCenterItems = false;
            tempApportion.costCenterItems.map(item => {
              if (item.required && !item.costCenterItemOID) {
                /*费用分摊项不能为空*/
                errorMessages.push(`${item.fieldName}:${this.$t('expense.apportion.item.can.not.be.null')}`);
                itemNullTip = false;
              }
              if (item.costCenterItemOID) {
                existCostCenterItems = true;
              }
            })
            if (!existCostCenterItems) {
              itemNullTip && errorMessages.push(this.$t('expense.apportion.item.can.not.be.null')/*费用分摊项不能为空*/);
              itemNullTip = false;
            }
          }
          if (!tempApportion.personName) {
            personNullTip && errorMessages.push(this.$t('expense.apportion.person.can.not.be.null')/*费用分摊相关人不能为空*/);
            personNullTip = false;
          }
          tempApportion.amount = (tempApportion.amount * 100).toFixed(2) / 100;
          if(tempApportion.proportion < 1 && tempApportion.proportion){
            if(tempApportion.proportion.toString().split('.')[1].length>4){
              tempApportion.proportion = parseFloat(tempApportion.proportion.toFixed(4));
            }
          }
          expenseApportionAmount += tempApportion.amount;
          expenseApportionProportion += mulCalculate(tempApportion.proportion, 10000);
          targetApportion.push(tempApportion);
        });
        //判断小数加有精度问题
        if (expenseApportionProportion !== 10000) {
          errorMessages.push(this.$t('expense.apportion.amount.must.be.equal.to.expense.proportion')/*分摊比率和需等于100%*/);
        }
        target.expenseApportion = targetApportion;
      }
      target.digitalInvoice = digitalInvoice;
      // zt 阶梯模式才有这些处理
      if(target.expenseTypeKey === 'private.car.for.public' && (!unitPriceMode || (unitPriceMode && nowExpense.mileageAllowanceExpenseDTO))){
        let allowanceControl = profile['All.FeeAllowance.equal'];
        //3不做校验
        let orderAmount = target.orderAmount;
        if(allowanceControl === 3){
        } else if(allowanceControl === 2 && orderAmount !== target.amount){
          errorMessages.push(this.$t('expense.amount.must.equal.to.allowance')/*费用金额必须等于补贴金额*/);
        } else if((!allowanceControl || allowanceControl === 1) && orderAmount < target.amount){
          errorMessages.push(this.$t('expense.amount.can.not.more.than.allowance')/*费用金额不能大于补贴金额*/) ;
        }
      }
      if (this.isRequiredFile() && attachments.length === 0) {
      // if((expenseType.attachmentRequired === 1 || (expenseType.attachmentRequired === 2 && (!target.vatInvoice || !target.withReceipt))) && attachments.length === 0){
        errorMessages.push(this.$t('expense.please.upload.attachments.for.auditing')/*请上传图片以便后续审核*/);
      }
      // 手输的发票 cardSigntype = HAND
      target.vatInvoice && (!digitalInvoice || (digitalInvoice && digitalInvoice.cardsignType === 'HAND' )) && (target.cardSignType = 'HAND');
      if (errorMessages.length > 0) {
        reject();
        errorMessages.length === 1 ? message.error(errorMessages) :
          message.error(errorMessages.map((item, index) => {
            return (<p style={{textAlign: 'left', margin: '5px 0 0'}}>{index + 1}: {item} </p>)
          }));
        return !1;
      }
      resolve(target);
    });
  };

  /**
   * 点击保存
   */
  handleSave = () => {
    let {receiptConfigList,} = this.state;
    this.props.form.getFieldValue('invoiceTypeNo') && receiptConfigList && receiptConfigList.map(item => {
      if (item.value !== '10') {
        this.props.form.validateFields([item.valueCode], {force: true});
      }
    })
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.validate(values).then(expense => {
          let expenseReport = this.props.expenseReport;
          if (expenseReport) {
            expense.expenseReportOID = expenseReport.expenseReportOID;
          }
          // v3 前端验证之后直接调用后台保存接口
          this.saveExpense(expense);
        })
      }
    })
  };
  /**
   * @description 后台返回错误信息处理
   * @param item 错误字段
   * */
  showErrorMessage = (item) => {
    if (!item.title || !item.message) {
      return item.title || item.message
    }
    return `${item.title}:${item.message}`
  };
  /**
   * 保存费用
   * @param expense 费用对象
   */
  saveExpense = (expense) => {
    rejectPiwik(`我的账本/保存费用/${expense.expenseTypeName}`);
    this.setState({saving: true});
    if(!expense.ownerOID){
      expense.ownerOID = this.props.user.userOID;
    }
    expenseService.saveExpense(expense).then(res => {
      this.setState({saving: false});
      // 需补填税率
      if (res.data.code === 'R_2002') {
        // 请补录税率
        message.error(this.$t('expense.enter.tax.rate'))
        this.setState({recordTaxRateConfig: true,recordTaxAmountConfig:true,recordNonVATinclusiveAmountConfig:true});
        return !1;
      }
      // 保存失败 错误信息处理
      if (res.data.code !== '0000') {
        let errorList = res.data.rows.errorList;
        if (errorList.length > 0) {
          errorList.length === 1 ? message.error(this.showErrorMessage(errorList[0])) :
            message.error(errorList.map((item, index) => {
              return (<p style={{textAlign: 'left', margin: '5px 0 0'}}>{index + 1} {this.showErrorMessage(item)} </p>)
            }));
        }
        return !1;
      }
      // 正常保存
      let {businessCardConsumptions, nowBusinessCardConsumptionIndex} = this.state;
      message.success(this.$t('common.save.success', {name: ''}));
      //如果是商务卡导入
      if(businessCardConsumptions.length > 0){
        nowBusinessCardConsumptionIndex++;
        //商务卡池中还有卡，继续导入
        if(nowBusinessCardConsumptionIndex !== businessCardConsumptions.length){
          this.setState({
            nowBusinessCardConsumptionIndex,
            nowPage: 'form',
            nowExpense: {},
            attachments: [],
            nowCurrency: {
              rate: 1.0000,
              currencyCode: this.props.company.baseCurrency
            },
            expenseType: {}
          }, () => {
            this.props.form.resetFields();
            this.setValuesByBusinessCard();
          });
        } else {
          this.onCancel(true);
        }
      } else {
        this.onCancel(true);
      }
    }).catch(e => {
      rejectPiwik(`我的账本/保存费用失败/${e.response.data.message}`);
      this.setState({ saving: false });
      message.error(e.response.data.message)
    });
  };

  /**
   * 切换费用类型
   * @param expenseType
   */
  handleSelectExpenseType = (expenseType) => {
    rejectPiwik(`我的账本/切换费用类型`);
    const { businessCardConsumptions, nowExpense } = this.state;
    this.setState({ loading: true, nowPage: 'form' });
    baseService.getExpenseTypeById(expenseType.id).then(res => {
      res.data.fields.sort((a, b) => a.sequence > b.sequence || -1);
      let willSet = {
        expenseType: res.data,
        loading: false,
        nowPage: 'form'
      };
      if(nowExpense.invoiceOID){
        nowExpense.data = res.data.fields;
        willSet.nowExpense = nowExpense;
      }
      this.setState(willSet, () => {
        //如果有商务卡，则自动填充金额和币种
        if(businessCardConsumptions.length > 0){
          this.setValuesByBusinessCard();
        }
        this.getFieldEnumerationList();
      });
    })
  };

  // 修改里程
  handleChangeMileage = (mileage) => {
    const { unitPriceMode } = this.state;
    const { getFieldValue } = this.props.form;
    let unitPrice = 0;
    if(unitPriceMode && !isNaN(mileage)){
      const priceFile = this.state.nowExpense.data.filter(field => field.messageKey === 'unit.price')[0];
      priceFile && (unitPrice = getFieldValue(priceFile.fieldOID));
      this.props.form.setFieldsValue({ amount: unitPrice * mileage });
    }
  };
  // 修改里程单价
  handleChangeUnitPrice = (unitPrice) => {
    const { unitPriceMode } = this.state;
    const { getFieldValue } = this.props.form;
    let mileageVal = 0;
    if (unitPriceMode && !isNaN(unitPrice)) {
      const mileageFile = this.state.nowExpense.data.filter(field => field.messageKey === 'ER_KM')[0];
      mileageFile && (mileageVal = getFieldValue(mileageFile.fieldOID));
      this.props.form.setFieldsValue({ amount: mileageVal * unitPrice });
    }
  };
  /**
   * 渲染表单项
   * @param field
   * @return {XML}
   */
  switchField = (field) => {
    switch(field.fieldType){
      case 'POSITIVE_INTEGER':
        return <InputNumber style={{width: '100%'}} precision={0} disabled={!field.editable} min={1}/>;
      case 'LONG':
        return <InputNumber style={{width: '100%'}} precision={0} disabled={!field.editable}/>;
      case 'DOUBLE':
        // 里程
        if(field.messageKey === 'ER_KM'){
          return <InputNumber style={{width: '100%'}} disabled={!field.editable} onChange={this.handleChangeMileage}/>
        }
        // 单价模式里程补贴单价由fp控制
        if (this.state.unitPriceMode && field.messageKey === 'unit.price') {
          return <InputNumber style={{width: '100%'}} disabled={this.checkFunctionProfiles('unit.price.modify.enable', [false, undefined])} onChange={this.handleChangeUnitPrice}/>;
        }
        return <InputNumber style={{width: '100%'}} disabled={!field.editable || field.messageKey === 'unit.price'}/>;
      case 'TEXT':
        if(field.customEnumerationOID){
          return field.list ? (
            <Searcher single={true}
                      method={'get'}
                      searcherItem={{
                        title: this.$t('expense.enter.value.type')/*值列表*/,
                        url: `${config.baseUrl}/api/custom/enumerations/${field.customEnumerationOID}/items/by/user`,
                        key: 'value'
                      }}
                      listExtraParams={{
                        keyword: '',
                        page: 0,
                        size: 30
                      }}
                      isNeedToPage={true}
                      labelKey={'messageKey'}/>
          ) : <Spin />
        } else {
          if(field.messageKey === 'dateCombined'){
            return <DateCombined disabled={!field.editable}/>
          }
          return <Input disabled={!field.editable}/>
        }
      case 'CUSTOM_ENUMERATION':
        return field.list ? (
          <Searcher single={true}
                    method={'get'}
                    searcherItem={{
                      title: this.$t('expense.enter.value.type')/*值列表*/,
                      url: `${config.baseUrl}/api/custom/enumerations/${field.customEnumerationOID}/items/by/user`,
                      key: 'value'
                    }}
                    listExtraParams={{
                      keyword: '',
                      page: 0,
                      size: 30
                    }}
                    isNeedToPage={true}
                    labelKey={'messageKey'}/>
        ) : <Spin />
      case 'START_DATE_AND_END_DATE':
        return <DateCombined disabled={!field.editable}/>;
      case 'DATE':
        return <DatePicker disabled={!field.editable} getCalendarContainer={this.getPopupContainer}/>;
      case 'MONTH':
        return <MonthPicker disabled={!field.editable}/>;
      case 'DATETIME':
        return <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" disabled={!field.editable} getCalendarContainer={this.getPopupContainer}/>;
      case 'GPS':
        return <Location disabled={!field.editable}/>;
      case 'LOCATION':
        return <Selector type='city'
                         params={{vendorType : 'standard', language: this.props.language.local}}
                         disabled={!field.editable}/>;
      case 'PARTICIPANTS':
        return <Chooser disabled={!field.editable}
                        type="participants"
                        newline
                        labelKey="fullName"
                        valueKey="userOID"
                        listExtraParams={{formOID: ''}}/>;
      case 'PARTICIPANT':
        return <Chooser disabled={!field.editable}
                        type="user"
                        single
                        labelKey="fullName"
                        valueKey="userOID"/>
    }
  };

  /**
   * 图片上传成功
   * @param response
   */
  uploadSuccess = (response) => {
    this.setState({ attachments: response }, { attachmentChange : true });
  };

  /**
   * 币种改变时设置币种
   * @param value
   */
  handleChangeCurrency = (value) => {
    if(value){
      let nowCurrency = this.getCurrencyFromList(value);
      this.setState({ nowCurrency },() => {
        const {nowCurrency} = this.state;
        let {nowExpense,nowPage} =this.state;
        this.props.form.setFieldsValue({'actualCurrencyRate': nowCurrency.rate});
        if (nowExpense) {
          nowExpense.companyCurrencyRate = nowCurrency.rate;
          if (nowPage === 'form') {
            nowExpense.originalActualCurrencyRate = nowCurrency.rate;
            nowExpense.actualCurrencyRate = nowCurrency.rate;
          }
        }
      })
    }
  };

  /**
   * 更改发票类型时重拿税率
   */
  handleChangeInvoiceType = (type) => {
    let {companyOpenInvoice,invoiceCompany,digitalInvoice} = this.state;
    let {company,user} = this.props;
    let invoiceTypeNo=this.props.form.getFieldValue('invoiceTypeNo');
    if (type === invoiceTypeNo) {
      return;
    }
    let companyTmp = company;
    if (invoiceCompany && invoiceCompany.id) {
      companyTmp = invoiceCompany;
    }
    type && expenseService.getReceiptDisplay(companyOpenInvoice, type, companyTmp.tenantId, companyTmp.setOfBooksId, companyTmp.id).then(res => {
      if (res.data && res.data.rows && res.data.rows.length > 0 && res.data.rows[0].hitValue) {
        let receiptConfigList = JSON.parse(res.data.rows[0].hitValue);
        this.setState({
          receiptConfigList
        },()=>{
          ((digitalInvoice && invoiceTypeNo) || !digitalInvoice) && this.checkInvoiceRender('taxRate') && type && expenseService.getRateByInvoiceType(type).then(res => {
            let taxRates = res.data.sort((a, b) => a.taxRateValue > b.taxRateValue || -1);
            this.setState({taxRates}, () => {
              this.props.form.resetFields(['taxRate', 'taxAmount', 'nonVATinclusiveAmount']);
              taxRates.map(rate => {
                if (rate.defaultValue) {
                  this.props.form.setFieldsValue({taxRate: rate.taxRateValue});
                  this.handleChangeTaxRate(rate.taxRateValue);
                }
              });
            })
          })
          this.setInvoiceData(false);
          //非初始化时，费用类型切换需要关闭强制补录税率开关
          if (invoiceTypeNo) {
            receiptConfigList && receiptConfigList.map(item => {
              if (item.value === '20') {
                this.props.form.validateFields([item.valueCode], {force: true});
              }
            })
            this.setState({
              recordTaxRateConfig: false,
              recordTaxAmountConfig: false,
              recordNonVATinclusiveAmountConfig: false,
            })
          }
        })
      }
    }).catch(e => {
      this.setState({
        receiptConfigList: []
      }, () => {
        this.setInvoiceData(false);
        //非初始化时，费用类型切换需要关闭强制补录税率开关
        if (invoiceTypeNo) {
          this.setState({
            recordTaxRateConfig: false,
            recordTaxAmountConfig: false,
            recordNonVATinclusiveAmountConfig:false,
          })
        }
      })
    });
  };
  /**
   * 价税合计改变修改税额、不含税金额
   */
  handleChangePriceTaxAmount = (amount) => {
    const {getFieldsValue, setFieldsValue, getFieldValue} = this.props.form;
    let taxRate = getFieldValue('taxRate');
    if (Number(taxRate) >= 0) {
      if (typeof amount !== 'number') {
        amount = 0;
      }
      let nonVATinclusiveAmount = Number((amount / (1 + taxRate)).toFixed(2));
      let taxAmount = Number((amount - nonVATinclusiveAmount).toFixed(2));
      if (getFieldsValue().hasOwnProperty('nonVATinclusiveAmount')) {
        setFieldsValue({nonVATinclusiveAmount})
      }
      if (getFieldsValue().hasOwnProperty('taxAmount')) {
        setFieldsValue({taxAmount})
      }
    }
  };

  /**
   * 税率改变时修改税额、不含税金额
   * @param value
   */
  handleChangeTaxRate = (value) => {
    const {getFieldsValue, setFieldsValue, getFieldValue} = this.props.form;
    let amount = getFieldValue('priceTaxAmount');
    let nonVATinclusiveAmount
    if (getFieldsValue().hasOwnProperty('nonVATinclusiveAmount')) {
      nonVATinclusiveAmount = getFieldValue('nonVATinclusiveAmount');
    }
    if (Number(amount) >= 0) {
      let nonVATinclusiveAmount = Number((amount / (1 + value)).toFixed(2));
      let taxAmount = Number((amount - nonVATinclusiveAmount).toFixed(2));
      if (getFieldsValue().hasOwnProperty('nonVATinclusiveAmount')) {
        setFieldsValue({nonVATinclusiveAmount})
      }
      if (getFieldsValue().hasOwnProperty('taxAmount')) {
        setFieldsValue({taxAmount})
      }
    } else if (nonVATinclusiveAmount) {
      let priceTaxAmount = Number(+nonVATinclusiveAmount * (1 + value)).toFixed(2);
      let taxAmount = Number((priceTaxAmount - nonVATinclusiveAmount).toFixed(2));
      if (getFieldsValue().hasOwnProperty('priceTaxAmount')) {
        setFieldsValue({priceTaxAmount})
      }
      if (getFieldsValue().hasOwnProperty('taxAmount')) {
        setFieldsValue({taxAmount})
      }
      setFieldsValue({nonVATinclusiveAmount})
    }
  };

  /**
   * 税额改变时修不含税金额
   * @param value
   */
  handleChangeTaxAmount = (value) => {
    const {getFieldsValue, setFieldsValue, getFieldValue} = this.props.form;
    let amount = getFieldValue('priceTaxAmount');
    //避免金额合计控件不显示，强行计算
    if (!getFieldsValue().hasOwnProperty('nonVATinclusiveAmount')) {
      return;
    }
    let nonVATinclusiveAmount = amount - value;
    if(isNaN(nonVATinclusiveAmount)){
      setFieldsValue({ nonVATinclusiveAmount: amount });
    } else {
      setFieldsValue({ nonVATinclusiveAmount });
    }
  };

  /**
   * 不含税金额改变时修改税额
   * @param value
   */
  handleChangeNonVATinclusiveAmount = (value) => {
    const {getFieldsValue, setFieldsValue, getFieldValue} = this.props.form;
    let amount = getFieldValue('priceTaxAmount');
    let taxAmount = amount - value;
    if (!getFieldsValue().hasOwnProperty('taxAmount')) {
      return;
    }
    if(isNaN(taxAmount)){
      setFieldsValue({ taxAmount: amount });
    } else {
      setFieldsValue({ taxAmount });
    }
  };
  /**
   * @description
   *
   * 先录入发票之后如果发票可以生成费用并且不需要录入税率的话则用卡片显示发票信息
   * 发票可以生成费用 但是需要录入税率 使用form表单显示费用信息
   * */
  handleCreateInvoice = (invoice) => {
    let editingInvoice = false;
    let {nowExpense}=this.state;
    //重置发票相关流程
    let transInvoice = () => {
      this.setState({nowPage: 'form', digitalInvoice: invoice, editingInvoice: editingInvoice}, () => {
        if (editingInvoice) {
          this.setInvoiceData(true,true);
        }
        if (invoice.fee) {
          this.props.form.setFieldsValue({
            amount: invoice.fee / 100
          });
        }
        if (invoice.resultCode === 'R_2002') {
          this.setState({recordTaxRateConfig: true,recordTaxAmountConfig:true,recordNonVATinclusiveAmountConfig:true})
        }
      })
    }
    // 可以生成费用 但是需要补填税率
    if (invoice.resultCode !== 'R_0000') {
      invoice.cardsignType = 'HAND';
      editingInvoice = true;
      this.props.form.setFieldsValue({vatInvoice: true});
    };
    if (this.props.params.audit || this.props.params.auditCapability) {
      invoice.invoiceOID = this.state.nowExpense.invoiceOID;
      if (!invoice.vatInvoiceCurrencyCode) {
        invoice.vatInvoiceCurrencyCode = nowExpense.invoiceCurrencyCode;
      }
      expenseService.financialAuditInvoice(invoice).then(res => {
        let errorList = res.data.rows.errorList;
        let warningInfo = [];
        if (res.data.code === '0000') {
          message.success(this.$t('common.save.success', {name: ''}));
          this.onCancel(true);
        }
        else {
          let skip=false;
          errorList && errorList.map(item => {
            if(item.code === 'R_2002'){
              skip=true;
            }
            warningInfo.push(`${item.title}${item.title ? ':' : ''}${item.message}`);
          })
          message.error(warningInfo.join('/'));
          if(skip){
            transInvoice();
          };
        }
      }).catch(e => {
        if (e.response && e.response.data && e.response.data.message) {
          message.error(e.response.data.message);
        }
        else {
          message.error(this.$t('common.operate.filed'))  //操作失败
        }
        transInvoice();
      })
      this.setState({editingInvoice: false});
    }
    else {
      transInvoice();
    }

  };

  handleSelectBusinessCardConsumptions = (result) => {
    this.setState({ businessCardConsumptions: result, nowPage: 'form', nowBusinessCardConsumptionIndex: 0, fromExpense: false },
      this.setValuesByBusinessCard)
  };

  handleCancelBusinessCardConsumptions = () => {
    const { fromExpense } = this.state;
    fromExpense ? this.setState({ nowPage: 'form', typeSource: '', fromExpense: false }) : this.onCancel();
  };

  handleSaveBusinessCardRemark = (e) => {
    const { businessCardConsumptions, nowBusinessCardConsumptionIndex  } = this.state;
    let id = businessCardConsumptions[nowBusinessCardConsumptionIndex].id;
    expenseService.updateBusinessCardRemark(id, e.target.value).then(() => {
      message.success(this.$t("common.operate.success")/*操作成功*/)
    })
  };

  //根据商务卡设置费用属性
  setValuesByBusinessCard = () => {
    const { businessCardConsumptions, nowBusinessCardConsumptionIndex, expenseType } = this.state;
    if(expenseType.readonly && expenseType.messageKey !== 'private.car.for.public'){
      return ;
    }
    let target = businessCardConsumptions[nowBusinessCardConsumptionIndex];
    this.props.form.setFieldsValue({
      amount: target.posCurAmt,
      invoiceCurrencyCode: target.posCurCod,
      payByCompany: true,
      createdDate: moment(target.trsDate),
      comment: target.remark
    });
    this.handleChangeCurrency(target.posCurCod);
  };

  renderExpenseSourceArea = () => {
    const {typeSource, currencyList, expenseType, digitalInvoice, readOnly, fromExpense} = this.state;
    let expenseReport = this.props.expenseReport;
    let expenseTypeFilter = () => true;
    if ((digitalInvoice && !readOnly)) {
      expenseTypeFilter = expenseType => expenseType.pasteInvoiceNeeded;
    }
    let param;
    if(expenseReport){
      param = {
        formOID : expenseReport.formOID,
        setOfBooksId: expenseReport.setOfBooksId,
        userOID: this.props.user.userOID,
        createManually: true
      };
      if(expenseReport.applicationOID !== this.props.user.userOID)
        param.applicationOID = expenseReport.applicationOID;
    } else {
      param = this.props.company.companyOID
    }
    switch(typeSource){
      case 'expenseType':
        return <ExpenseTypeSelector onSelect={this.handleSelectExpenseType}
                                    source={expenseReport ? 'form' : 'company'}
                                    value={expenseType}
                                    param={param}
                                    filter={expenseTypeFilter}/>;
      case 'invoice':
        return <CreateInvoice onCreate={this.handleCreateInvoice}
                              currencyList={currencyList}
                              createType={this.props.params.audit ? 2 : 1}
                              fromExpense={fromExpense}
                              onBack={() => this.setState({ nowPage: 'form', typeSource: '', fromExpense: false })}
                              digitalInvoice={digitalInvoice}/>;
      case 'businessCard':
        return <BusinessCardConsumption onSelect={this.handleSelectBusinessCardConsumptions}
                                        onCancel={this.handleCancelBusinessCardConsumptions}/>;
    }
  };

  /**
   * 商务卡消费类型
   * @param trsCod 消费code
   * @return {*}
   */
  getConsumptionType = (trsCod) => {
    switch(trsCod){
      case '00':
        return '一般消费';
      case '01':
        return '预借现金';
      case '12':
        return '预借现金退货';
      case '20':
        return '一般消费退货';
      case '60':
        return '还款及费用';
    }
  };

  deleteBusinessCardConsumption = () => {
    let { nowBusinessCardConsumptionIndex, businessCardConsumptions } = this.state;
    if(nowBusinessCardConsumptionIndex + 1 === businessCardConsumptions.length){
      this.onCancel();
    } else {
      this.props.form.resetFields();
      this.setState({ nowBusinessCardConsumptionIndex: nowBusinessCardConsumptionIndex + 1, expenseType: {} }, this.setValuesByBusinessCard);
    }
  };

  /**
   * 表单控件默认值
   * @param type  field类型
   * @param value  field值
   * @param name  field值的对应名称
   */
  getFieldValue = (type, value, name, field) => {
    const { nowExpense } = this.state;
    //后端自定义字段日期，UTC是假的UTC,显示的时候特殊处理
    if (value && (field && field.messageKey === 'dateCombined' || type === 'START_DATE_AND_END_DATE')) {
      return value.replace(/T[0-9:-]{8}Z/img, 'T12:00:00Z');
    }
    if(type === 'DATETIME' || type === 'DATE')
      return value ? moment(value) : null;
    if(type === 'PARTICIPANTS'){
      let { user } = this.props;
      return value ? JSON.parse(value) :[user];
    }
    if(type === 'PARTICIPANT'){
      if(name){
        let participant = JSON.parse(name);
        if(participant.enabled){
          return [{fullName: participant.fullName, userOID: participant.userOID}]
        } else {
          return [];
        }
      } else {
        return [];
      }
    }
    if(type === 'LOCATION'){
      return value ? {label: name, key: value} : null;
    }
    if(type === 'MONTH'){
      if(nowExpense.invoiceOID){
        return value ? moment(value) : null;
      } else {
        return value ? moment(value) : moment(new Date());
      }
    }
    if (type === 'CUSTOM_ENUMERATION') {
      if (field.customEnumerationOID && field.value && field.value !== '') {
        value = [{
          value: field.value,
          messageKey: field.showValue,
        }];
        return value;
      } else {
        return value;
      }
    }
    if(type !== 'TEXT' || (!field && type === 'TEXT')){
      return value;
    }else{
      if(field){
        if (field.customEnumerationOID && field.value && field.value !== '') {
          value = [{
              value: field.value,
              messageKey: field.showValue,
          }];
          return value;
        }else{
          return value;
        }
      }else {
        return value;
      }
    }
  };

  /**
   * 只读模式下显示值
   * @param type  field类型
   * @param value  field showValue值
   * @param messageKey  field messageKey值
   */
  getFieldName = (type, value, messageKey) => {
    if(type === 'TEXT' && messageKey === 'dateCombined'){
      if(value && JSON.parse(value)){
        let result = JSON.parse(value);
        return `${new Date(result.startDate).format('yyyy-MM-dd')} ～ ${new Date(result.endDate).format('yyyy-MM-dd')}`
      } else {
        return '-';
      }
    }
    if(type === 'DATE')
      return value ? new Date(value).format('yyyy-MM-dd') : '-';
    if(type === 'MONTH')
      return value ? new Date(value).format('yyyy-MM') : '-';
    if(type === 'DATETIME')
      return value ? new Date(value).format('yyyy-MM-dd hh:mm:ss') : '-';
    if(type === 'GPS')
      return value ? JSON.parse(value).address : '-';
    if(type === 'PARTICIPANT')
      return value ? (JSON.parse(value).fullName || '-') : '-';
    if(type === 'PARTICIPANTS') {
      if(value && JSON.parse(value).length > 0){
        let result = [];
        JSON.parse(value).map(participant => result.push(participant.fullName));
        return result.join(',')
      } else {
        return '-'
      }
    }
    else
      return value || '-';
  };

  //费用分摊变化时
  handleChangeExpenseApportion = (expenseApportion) => {
    this.setState({ expenseApportion })
  };
  //附件是否为图片
  isImage = (file) => {
    let sections = (file.response ? file.response.fileName : file.fileName).split('.');
    let extension = sections[sections.length - 1];
    let imageExtension = ['png', 'gif', 'jpg', 'jpeg', 'bmp'];
    return imageExtension.has(extension);
  };
  handleImageAudit = (attachment) => {
    const {audit, view, pay, auditCapability} = this.props.params;
    if (this.isImage(attachment)) {
      if (audit || view || pay || auditCapability) {
        this.setState({showImageAudit: true, defaultAttachment: attachment})
      } else {
        this.setState({previewVisible: true, defaultAttachment: attachment})
      }
    }
    else {
      window.open(attachment.response ? attachment.response.fileURL : attachment.fileURL, '_blank')
    }
  };
  //数据处理，筛选有图片附件的费用
  handleHaveImageInvoices = (invoices) =>{
    let imgInvoices=[];
    let tmpInvoices=invoices?deepFullCopy(invoices):null;
    tmpInvoices && tmpInvoices.map(invoice=>{
      let item=invoice.invoiceView;
      if(item&&item.attachments){
        let haveImg=false;
        item.imgAttachment=[];
        item.attachments.map(i=>{
          if(this.isImage(i)){
            haveImg=true;
            item.imgAttachment.push(i);
          }
        })
        if(haveImg){
          item.attachments=item.imgAttachment;
          imgInvoices.push(item);
        }
      }
    })
    return imgInvoices;
  }

  formatTime = (trxTim) => {
    return `${trxTim.substr(0,2)}:${trxTim.substr(2,2)}:${trxTim.substr(4,2)}`
  };

  handleEditAuditAmount = () => {
    const { nowExpense } = this.state;
    this.setState({auditAmountEditing : true} , () => {
      this.props.form.setFieldsValue({
        amount: nowExpense.amount,
        actualCurrencyRate: nowExpense.actualCurrencyRate,
        originalApprovedNonVat: (nowExpense.originalApprovedNonVat != null ? nowExpense.originalApprovedNonVat : nowExpense.amount),
        originalApprovedVat: (nowExpense.originalApprovedVat ? nowExpense.originalApprovedVat : 0)
      })
    });
  };

  handleSaveAuditAmount = () => {
    const { nowExpense, isNonVat } = this.state;
    let amountIsNotChangeBig = this.props.profile['finance.change.big.amount'] ? false : true;
    this.props.form.validateFieldsAndScroll((err, values) => {
      let expenseReport = this.props.expenseReport;
      if(!err){
        if (!this.props.profile['All.FeeAmount.AllowZero'] && values.amount === 0) {
          message.error(this.$t('expense.audited.amount.can.not.be.zero')/*核定金额不能为0*/);
          return;
        }
        if(amountIsNotChangeBig && values.amount > nowExpense.originalAmount)
        {
          message.error(this.$t('expense.audited.amount.can.not.be.more.than.origin.amount')/*核定金额不能大于原金额*/);
          return ;
        }
        if(values.actualCurrencyRate > nowExpense.originalActualCurrencyRate)
        {
          message.error(this.$t('expense.audited.rate.can.not.be.more.than.origin.rate')/*核定汇率不能大于原汇率*/);
          return ;
        }
        if(!values.originalApprovedNonVat && isNonVat && !this.props.profile['All.FeeAmount.AllowZero'])
        {
          message.error(this.$t('expense.origin.approve.more.than.zero')/*原币金额不能为空*/);
          return ;
        }
        if(values.originalApprovedNonVat && isNonVat)
        {
          if(values.originalApprovedNonVat > values.amount){
            message.error(this.$t('expense.origin.approve.large')/*原币金额不能大于原金额*/);
            return ;
          }
        }
        if(nowExpense.digitalInvoice && nowExpense.digitalInvoice.fee && values.amount > nowExpense.digitalInvoice.fee/100){
          message.error(this.$t('expense.amount.must.less.than.or.equal.to.invoice.price.and.tax.amount')/*原币金额不能大于原金额*/);
          return ;
        }
        let params = {
          actualCurrencyRate: values.actualCurrencyRate || nowExpense.actualCurrencyRate,
          amount: values.amount,
          originalApprovedNonVat: values.originalApprovedNonVat,
          originalApprovedVat: values.originalApprovedVat,
          originalActualCurrencyRate: nowExpense.originalActualCurrencyRate,
          originalAmount: nowExpense.originalAmount,
          invoiceOID: nowExpense.invoiceOID,
          expenseReportOID: expenseReport.expenseReportOID
        };
        this.setState({ savingAuditAmount: true });
        expenseService.editAuditAmount(params).then(res => {
          this.setState({ savingAuditAmount: false });
          message.success(this.$t('common.operate.success'));
          this.onCancel(true);
        }).catch(e => {
          this.setState({ savingAuditAmount: false });
          message.error(this.$t('common.operate.filed'));
        })
      }
    })
  };

  handleSaveInvoice = () => {
    let {invoiceFp} = this.state;
    //验证的form表单项，因为费用里面公用了一个Form,会带有其它项
    let invoiceFormItems = ["nonVATinclusiveAmount", "taxAmount", "priceTaxAmount", "vatInvoiceCurrencyCode", "taxRate", "invoiceDate", "invoiceNumber", "invoiceCode", "invoiceTypeNo","checkCode"];
    //用于始终跟着单据走的FP场景
    let invoiceUserFp = invoiceFp ? invoiceFp : this.props.profile;
    let {receiptConfigList,} = this.state;
    this.props.form.getFieldValue('invoiceTypeNo') && receiptConfigList && receiptConfigList.map(item => {
      if (item.value !== '10') {
        this.props.form.validateFields([item.valueCode], {force: true});
      }
    })
    this.props.form.validateFieldsAndScroll((err, values) => {
      let isError=false;
      err && invoiceFormItems.map(item=>{
        if(err[item]){
          isError=true;
        }
      });
      if(!isError){
        this.setState({ savingInvoice: true });
        let { nowExpense, invoiceTypes } = this.state;
        let target = {};
        target.cardsignType = 'HAND';
        target.invoiceOID = nowExpense.invoiceOID;
        target.billingNo = values.invoiceNumber;
        if(nowExpense.digitalInvoice && nowExpense.digitalInvoice.id){
          target.id = nowExpense.digitalInvoice.id;
        }
        target.billingCode = values.invoiceCode ? values.invoiceCode.toUpperCase() : values.invoiceCode;
        target.checkCode = values.checkCode;
        let invoiceControl = invoiceUserFp['InvoiceControl.InvoiceAmount.FeeAmount.ALL.Equal'];
        if((invoiceControl === 0 || !invoiceControl) && values.priceTaxAmount < nowExpense.amount){
          message.error(this.$t('expense.amount.must.less.than.or.equal.to.invoice.price.and.tax.amount')/*费用金额必须小于等于发票的价税合计*/)
          && this.setState({ savingInvoice: false });
        } else if((invoiceControl === 2 || invoiceControl === true) && values.priceTaxAmount !== nowExpense.amount){
          message.error(this.$t('expense.amount.must.equal.to.invoice.price.and.tax.amount')/*费用金额必须等于发票的价税合计*/)
          && this.setState({ savingInvoice: false });
        } else {
          Object.assign(target, values);
          if(values.invoiceDate){
            target.billingTime = (new Date(values.invoiceDate).getTime()/1000).toFixed(0);
          }
          target.receiptTypeNo = target.invoiceTypeNo;
          if(target.nonVATinclusiveAmount){
            target.feeWithoutTax=mulCalculate(target.nonVATinclusiveAmount,100);
          }
          else{
            target.feeWithoutTax=target.nonVATinclusiveAmount;
          }
          if(target.taxAmount){
            target.tax=mulCalculate(target.taxAmount,100);
          }
          else{
            target.tax=target.taxAmount;
          }
          if(target.priceTaxAmount){
            target.fee=mulCalculate(target.priceTaxAmount,100);
          }else{
            target.fee=target.priceTaxAmount;
          }
          invoiceTypes.map(item => {
            item.value === target.receiptTypeNo && ( target.receiptType = item.messageKey )
          });
          if (!target.vatInvoiceCurrencyCode) {
            target.vatInvoiceCurrencyCode = nowExpense.invoiceCurrencyCode;
          }
          expenseService.financialAuditInvoice(target).then(res => {
            this.setState({ savingInvoice: false });
            let errorList=res.data.rows.errorList;
            let warningInfo=[];
            if(res.data.code==='0000'){
              message.success(this.$t('common.save.success', {name: ''}));
              this.onCancel(true);
            }
            else{
              errorList && errorList.map(item => {
                if (item.code === 'R_2002') {
                  this.setState({
                    recordTaxRateConfig: true,
                    recordTaxAmountConfig: true,
                    recordNonVATinclusiveAmountConfig: true
                  })
                }
                warningInfo.push(`${item.title}${item.message ? ':' : ''}${item.message}`);
              })
              message.error(warningInfo.join('/'));
            }
          }).catch(e => {
            if(e.response && e.response.data && e.response.data.message){
              message.error(e.response.data.message);
            }
            else{
              message.error(this.$t('common.operate.filed'))  //操作失败
            }
            this.setState({ savingInvoice: false });
          })
        }
      }
    })
  };

    /*
  * updateInvoiceType:不更新费用类型
  * isCoverFormItem 是否覆盖已经编写发票控件值
  * */
  setInvoiceData = (updateInvoiceType = true, isCoverFormItem = false) => {
    const {nowExpense, digitalInvoice, auditAmountEditing} = this.state;
    let target = {};
    if (digitalInvoice) {
      if (updateInvoiceType) {
        this.handleChangeInvoiceType(digitalInvoice.invoiceTypeNo);
        target.invoiceTypeNo = digitalInvoice.invoiceTypeNo;
      }
      if (digitalInvoice.billingTime)
        target.invoiceDate = moment(digitalInvoice.billingTime ? new Date(digitalInvoice.billingTime * 1000) : new Date());
      target.invoiceCode = digitalInvoice.billingCode;
      target.invoiceNumber = digitalInvoice.billingNo;
      target.vatInvoiceCurrencyCode = digitalInvoice.vatInvoiceCurrencyCode || 'CNY';
      target.taxRate = nowExpense.taxRate;
      if (target.taxRate != undefined && target.taxRate != null) {
        this.setState({recordTaxRateConfig: true})
      }else{
        this.setState({recordTaxRateConfig: false})
      }
      if (digitalInvoice.feeWithoutTax != undefined && digitalInvoice.feeWithoutTax != null) {
        target.nonVATinclusiveAmount = digitalInvoice.feeWithoutTax / 100;
        this.setState({recordNonVATinclusiveAmountConfig: true})
      }
      else{
        this.setState({recordNonVATinclusiveAmountConfig: false})
      }
      if (digitalInvoice.tax !=undefined &&  digitalInvoice.tax != null) {
        target.taxAmount = digitalInvoice.tax / 100;
        this.setState({recordTaxAmountConfig: true})
      }else{
        this.setState({recordTaxAmountConfig: false})
      }
      if (digitalInvoice.fee != undefined && digitalInvoice.fee != null) {
        target.priceTaxAmount = digitalInvoice.fee / 100;
      }
      target.checkCode = digitalInvoice.checkCode;
    } else {
      if (!nowExpense.invoiceOID || auditAmountEditing) {
        target.priceTaxAmount = this.props.form.getFieldValue('amount');
        target.vatInvoiceCurrencyCode = this.props.form.getFieldValue('invoiceCurrencyCode');
      } else {
        target.priceTaxAmount = nowExpense.amount;
        target.vatInvoiceCurrencyCode = nowExpense.invoiceCurrencyCode;
      }
      target.invoiceDate = moment(new Date());
    }
    target = this.editFormItemExit(this.props.form.getFieldsValue(), target, isCoverFormItem);
    this.props.form.setFieldsValue(target);
  };
  //修改存在的FormItem项,isCoverFormItem是否覆盖form项
  editFormItemExit(formItems, inits,isCoverFormItem=false) {
    let exitVar = {}
    if (formItems && inits) {
      Object.keys(inits).map(item => {
        if (formItems.hasOwnProperty(item)) {
          if ((!isCoverFormItem && !formItems[item]) || isCoverFormItem) {
            if (inits[item] != undefined && inits[item] != null) {
              exitVar[item] = inits[item];
            }
          }
        }
      })
    }
    return exitVar;
  }
  //校验发票显示：1(default)、必填：2
  checkInvoiceRender = (itemName, type = 1) => {
    let {receiptConfigList, nowExpense, recordTaxRateConfig, recordNonVATinclusiveAmountConfig, recordTaxAmountConfig} = this.state;
    let showAttr = true;
    let requiredAttr = false;
    if (receiptConfigList && receiptConfigList.length > 0) {
      receiptConfigList.map(item => {
        if (item.valueCode === itemName) {
          showAttr = item.value === '10' ? false : true;
          requiredAttr = item.value === '30' ? true : false;
        }
      })
    }
    if (type === 1 && nowExpense && nowExpense.invoiceOID && !showAttr) {
      if (!(recordTaxRateConfig && itemName === 'taxRate') && !(recordNonVATinclusiveAmountConfig && itemName === 'nonVATinclusiveAmount') && !(recordTaxAmountConfig && itemName === 'taxAmount')) {
        nowExpense[itemName] = null;
      }
    }
    return type === 1 ? showAttr : requiredAttr;
  }
  renderInvoiceArea = () => {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const {profile, audit, auditCapability} = this.props;
    const { currencyList, taxRates, invoiceTypes, savingInvoice,
      companyOpenInvoice, testInvoiceTypes,recordTaxRateConfig,recordTaxAmountConfig, recordNonVATinclusiveAmountConfig} = this.state;
    const {invoiceFp } = this.state;
    let invoiceUserFp = invoiceFp ? invoiceFp : profile;
    let currencyEditable = invoiceUserFp['InvoiceControl.InvoiceCurrency.ALL.Editable'];
    let priceTaxAmountValue = getFieldValue('priceTaxAmount');
    let invoiceDate = "invoiceDate"; //开票日期
    let invoiceCode = "invoiceCode"; // 发票代码
    let invoiceNumber = "invoiceNumber";   // 发票号码
    let vatInvoiceCurrencyCode = "vatInvoiceCurrencyCode";  // 币种
    let nonVATinclusiveAmount = "nonVATinclusiveAmount";   // 总金额
    let taxRate = "taxRate"; // 税率
    let taxAmount = "taxAmount";   // 税额合计
    //let priceTaxAmount = "priceTaxAmount";  // 价税总额
    let checkCode = "checkCode";  // 校验码
    let invoiceTypeNoValue = getFieldValue('invoiceTypeNo');
    return (
      <div className="vat-invoice-area">
        <Popover content={<img style={{width: '70vw'}}
                               src={this.props.language.local === 'zh_CN' ? invoiceImg : invoiceImgEn}/>}
                 placement="bottomRight">
          <div className="invoice-info">{this.$t('expense.invoice.enter.info')/*发票填写说明*/}</div>
        </Popover>
        {companyOpenInvoice && <div className="test-info">
          {/*当发票类型为 {type}时，请选择*/}
          {this.$t('expense.invoice.checked.text', {type: testInvoiceTypes.map(type => type.invoiceTypeName).join(' , ')})}
          <a onClick={() => this.setState({nowPage: 'type', typeSource: 'invoice', fromExpense: true})}>
            {/*发票查验*/}
            {this.$t('expense.invoice.checked')}
          </a>
        </div>}
        <Row gutter={20} type="flex" align="top">
          <Col span={24}>
            <FormItem label={this.$t('expense.invoice.type')/*发票类型*/}>
              {getFieldDecorator('invoiceTypeNo', {
                rules: [{
                  required: true,
                  message: this.$t("common.please.select")
                }]
              })(
                <Select dropdownMatchSelectWidth={false}
                        onChange={this.handleChangeInvoiceType}
                        getPopupContainer={this.getPopupContainer}
                        placeholder={this.$t('common.please.select')/* 请选择 */}>
                  {invoiceTypes.map(item => {
                    return <Option key={item.value} value={item.value}>{item.messageKey}</Option>
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          { invoiceTypeNoValue ? <Row gutter={20} type="flex" align="top">{this.checkInvoiceRender(invoiceCode) &&
          <Col span={this.checkInvoiceRender(invoiceDate) ? 24 : 12}>
            <FormItem label={this.$t('expense.invoice.code')/*发票代码*/}>
              {getFieldDecorator(invoiceCode, {
                rules: [{
                  required: this.checkInvoiceRender(invoiceCode, 2),
                  message: `${this.$t("common.please.enter")}`,
                }, {
                  validator: (rule, value, callback) => {
                    if (value && value.length !== 10 && value.length !== 12)
                      callback(this.$t("expense.invoice.code.help")/*请输入10或12位数字*/);
                    else
                      callback();
                  }
                }]
              })(
                <Input placeholder={this.$t("expense.invoice.code.help")/*请输入10或12位数字*/}/>
              )}
            </FormItem>
          </Col>}
            {this.checkInvoiceRender(invoiceNumber) && <Col span={12}>
              <FormItem label={this.$t('expense.invoice.number')/*发票号码*/}>
                {getFieldDecorator(invoiceNumber, {
                  rules: [{
                    required: this.checkInvoiceRender(invoiceNumber, 2),
                    message: this.$t("common.please.enter")
                  }, {
                    len: 8,
                    message: this.$t("common.must.characters.length", {length: 8})
                  }]
                })(
                  <Input placeholder={this.$t("expense.invoice.number.help")/*请输入8位数字*/}/>
                )}
              </FormItem>
            </Col>}
            {this.checkInvoiceRender(invoiceDate) && (
              <Col span={12}>
                <FormItem label={this.$t('expense.invoice.date')/*开票日期*/}>
                  {getFieldDecorator(invoiceDate, {
                    rules: [{
                      required: this.checkInvoiceRender(invoiceDate, 2),
                      message: this.$t("common.please.enter")
                    }]
                  })(
                    <DatePicker placeholder={this.$t('common.please.select')} allowClear={false}
                                getCalendarContainer={this.getPopupContainer}/>
                  )}
                </FormItem>
              </Col>
            )}

            { (recordTaxRateConfig || this.checkInvoiceRender(taxRate)) && <Col span={12}>
              <FormItem label={this.$t('expense.invoice.tax.rate')/*税率*/}>
                {getFieldDecorator(taxRate, {
                  rules: [{
                    required: (recordTaxRateConfig || this.checkInvoiceRender(taxRate, 2)),
                    message: this.$t("common.please.select")
                  }]
                })(
                  <Select placeholder={this.$t('common.please.select')}
                          getPopupContainer={this.getPopupContainer}
                          onChange={this.handleChangeTaxRate}>
                    {taxRates.map(tax => {
                      return <Option value={tax.taxRateValue} key={tax.taxRateValue}>{tax.taxRateKey}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>}

            {this.checkInvoiceRender(vatInvoiceCurrencyCode) && <Col span={12}>
              <FormItem label={this.$t("common.currency")/*币种*/}>
                {getFieldDecorator(vatInvoiceCurrencyCode, {
                    rules: [
                      {required: this.checkInvoiceRender(vatInvoiceCurrencyCode, 2),}
                    ]
                  }
                )(
                  <Select dropdownMatchSelectWidth={false}
                          showSearch={true}
                          optionFilterProp="children"
                          filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          placeholder={this.$t('common.please.select')/* 请选择 */}
                          getPopupContainer={this.getPopupContainer}
                          disabled={currencyEditable}>
                    {currencyList.map(item => {
                      return <Option
                        key={item.currency} value={item.currency}>{item.currency}{this.props.language.local === 'zh_CN' ? ` ${item.currencyName}` : ''}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>}
            <Col span={12}>
              <FormItem label={this.$t('expense.invoice.price.and.tax')/*价税合计*/}>
                {getFieldDecorator('priceTaxAmount', {
                  rules: [{
                    required: true,
                    message: this.$t("common.please.enter")
                  }]
                })(
                  <InputNumber style={{width: '100%'}} placeholder={this.$t("common.please.enter")}
                               precision={2} step={0.01} min={0}
                               onChange={this.handleChangePriceTaxAmount}/>
                )}
              </FormItem>
            </Col>
            {(recordTaxAmountConfig || this.checkInvoiceRender(taxAmount)) && <Col span={12}>
              <FormItem label={this.$t('expense.invoice.tax')/*税额合计*/}>
                {getFieldDecorator(taxAmount, {
                  rules: [{
                    required: recordTaxAmountConfig || this.checkInvoiceRender(taxAmount, 2),
                    validator: (rule, value, callback) => {
                      if (value > priceTaxAmountValue)
                      // '税额合计不能大于价税合计'
                        callback(this.$t('expense.amount.tax.must.less.than.amt.tip'));
                      else{
                        if ((recordTaxAmountConfig || this.checkInvoiceRender(taxAmount, 2)) && (value === undefined || value === null)) {
                          callback(this.$t("common.please.enter"))
                        }
                        else{
                          callback()
                        }
                      }
                    },
                  }]
                })(
                  <InputNumber style={{width: '100%'}} placeholder={this.$t('common.please.enter')}
                               precision={2} step={0.01} min={0}
                               onChange={this.handleChangeTaxAmount}/>
                )}
              </FormItem>
            </Col>}
            {(recordNonVATinclusiveAmountConfig||this.checkInvoiceRender(nonVATinclusiveAmount)) && <Col span={12}>
              <FormItem label={this.$t('expense.invoice.amount.without.tax')/*金额合计*/}>
                {getFieldDecorator(nonVATinclusiveAmount, {
                  rules: [{
                    required: recordNonVATinclusiveAmountConfig || this.checkInvoiceRender(nonVATinclusiveAmount, 2),
                    validator: (rule, value, callback) => {
                      if (value > priceTaxAmountValue)
                      // 金额合计不能大于价税合计
                        callback(this.$t('expense.amount.price.must.less.than.amt.tip'));
                      else{
                        if ((recordNonVATinclusiveAmountConfig || this.checkInvoiceRender(nonVATinclusiveAmount, 2)) && (value === undefined || value === null)) {
                          callback(this.$t("common.please.enter"))
                        }
                        else{
                          callback()
                        }
                      }
                    }
                  }]
                })(
                  <InputNumber style={{width: '100%'}} placeholder={this.$t('expense.invoice.amount.help')/*请输入不含税金额*/}
                               precision={2} step={0.01} min={0}
                               onChange={this.handleChangeNonVATinclusiveAmount}/>
                )}
              </FormItem>
            </Col>}
            {this.checkInvoiceRender(checkCode) && (
              <Col span={12}>
                <FormItem label={this.$t('expense.invoice.check.code')/*校验码*/}>
                  {getFieldDecorator(checkCode, {
                    rules: [{
                      required: this.checkInvoiceRender(checkCode, 2),
                      message: this.$t('expense.invoice.check.code.help')
                    }, {
                      len: 6,
                      message: this.$t('expense.invoice.check.code.help')
                    }]
                  })(
                    <Input placeholder={this.$t('expense.invoice.check.code.help')/*请输入校验码后6位*/} maxLength="6"/>
                  )}
                </FormItem>
              </Col>
            )}
            {(audit || auditCapability) && (
              <Col span={24} style={{margin: '10px 0 20px', textAlign: 'right'}}>
                <FormItem>
                  <Button type="primary" style={{marginRight: 8}} onClick={this.handleSaveInvoice}
                          loading={savingInvoice}>{this.$t("common.save")}</Button>
                  <Button onClick={() => this.setState({editingInvoice: false})}>{this.$t("common.cancel")}</Button>
                </FormItem>
              </Col>
            )}</Row>:<div></div>}
        </Row>
      </div>
    )
  };

  handleEditInvoice = () => {
    this.props.form.setFieldsValue({vatInvoice: true});
    this.setState({ editingInvoice: true}, this.setInvoiceData);
  };

  handleChangeVatInvoice = (checked) => {
    this.setState({ editingInvoice: checked }, () => {
      const { digitalInvoice } = this.state;
      if(checked && ((digitalInvoice && digitalInvoice.cardsignType === 'HAND') || !digitalInvoice)){
        this.setInvoiceData();
      }
    });
  };

  handleToTalMoneyChange = (e) => {
    const { nowExpense,isNonVat } = this.state;
    if(isNonVat){
      let originalApprovedNonVat = nowExpense.taxRate ? e/(1+nowExpense.taxRate) : (e*100)/(100+parseFloat(nowExpense.digitalInvoice.invoiceGoods[0].taxRate));
      originalApprovedNonVat = originalApprovedNonVat.toFixed(2);
      let originalApprovedVat = (e - originalApprovedNonVat).toFixed(2);
      this.props.form.setFieldsValue({ originalApprovedVat : originalApprovedVat, originalApprovedNonVat : originalApprovedNonVat });
      !e && this.props.form.setFieldsValue({ originalApprovedVat : 0.00, originalApprovedNonVat : 0.00 });
    };
    this.reRender();
  };
  // 标签显示信息
  showMessage = (item) => {
    if (!item.name) {
      return item.toast;
    }
    if (!item.toast) {
      return item.name;
    }
    return `${item.name} : ${item.toast}`;
  };
  changeOriginalApprovedNonVat = (e) => {
    const {nowExpense} = this.state;
    if (typeof(e) == "number") {
      if (!this.props.profile['All.FeeAmount.AllowZero'] && !e) {
        message.error(this.$t('expense.origin.approve.enter')/*请输入原币金额*/);
        this.props.form.setFieldsValue({originalApprovedVat: 0.00});
      }
      else {
        let originalApprovedVat = (nowExpense.amount - e).toFixed(2);
        this.props.form.setFieldsValue({originalApprovedVat: originalApprovedVat});
      }
    }
  };

  //补贴类型费用计算总金额
  getAmount = (e,isNumber = false) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    let result = 0;
    if(isNumber){
      if(e >= 0){
        let unitPrice = Number(getFieldValue('unitPrice'));
        if(unitPrice){
          result = (Number(e) * unitPrice).toFixed(2);
          setFieldsValue({amount:result});
        }else {
          setFieldsValue({amount:0});
        }
      }else{
        message.error('请输入数量');
      }
    }else {
      if(e >= 0){
        let number = Number(getFieldValue('number'));
        if(number){
          result = (Number(e) * number).toFixed(2);
          setFieldsValue({amount:result});
        }else{
          setFieldsValue({amount:0});
        }
      }else{
        message.error('请输入单价');
      }
    }
  };

  renderInvoiceEditingArea = () => {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12, offset: 1 }
    };
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { profile, audit } = this.props;
    const { expenseType, nowExpense, readOnly, digitalInvoice, invoiceFp } = this.state;
    let invoiceUserFp = invoiceFp ? invoiceFp : profile;
    let pasteInvoiceNeeded = expenseType.pasteInvoiceNeeded;
    let thirdWithReceipt = nowExpense.withReceipt;
    let hasInvoiceInstead = !profile['invoice.instead.disabled'] && (readOnly ? thirdWithReceipt : pasteInvoiceNeeded);
    let invoiceInsteadText = profile['invoice.instead.comments'] ? this.$t('expense.is.remark')/*是否备注*/ : this.$t('expense.is.instead.invoice')/*是否替票*/;
    let invoiceInsteadReasonText = profile['invoice.instead.comments'] ? this.$t('expense.remark.reason')/*备注理由*/ : this.$t('expense.instead.invoice.reason')/*替票理由*/;
    let isHandDigitalInvoice = digitalInvoice && digitalInvoice.cardsignType === 'HAND';
    let invoiceInstead = hasInvoiceInstead && ((readOnly && this.props.readOnly) ? nowExpense.invoiceInstead : getFieldValue('invoiceInstead'));
    let isDiDi = expenseType.messageKey === 'expense.type.didi';
    let thirdEditInvoice = !this.props.readOnly && expenseType.readonly && !isDiDi && thirdWithReceipt;
    return (
      <div>
        {hasInvoiceInstead && (
          <FormItem {...formItemLayout} label={invoiceInsteadText}>
            {getFieldDecorator('invoiceInstead', {
              valuePropName: 'checked',
              initialValue: false
            })(
              <Switch onChange={checked => !checked && this.props.form.setFieldsValue({invoiceInsteadReason: ''})}/>
            )}
          </FormItem>
        )}

        {hasInvoiceInstead && invoiceInstead && (
          <FormItem {...formItemLayout} label={invoiceInsteadReasonText}>
            {getFieldDecorator('invoiceInsteadReason')(
              <Input maxLength="100" disabled={!invoiceInstead}/>
            )}
          </FormItem>
        )}

        {((pasteInvoiceNeeded && (digitalInvoice ? isHandDigitalInvoice : true))) && !invoiceUserFp['account.book.VAT.special.invoice.disabled'] && (
          <FormItem {...formItemLayout} label={this.$t('expense.enter.invoice')/*录入发票*/}>
            {getFieldDecorator('vatInvoice', {
              valuePropName: 'checked',
              initialValue: !!digitalInvoice
            })(
              <Switch onChange={this.handleChangeVatInvoice}
                      disabled={(digitalInvoice && digitalInvoice.cardsignType !== 'HAND') ||
                      (expenseType.readonly && !thirdEditInvoice) ||
                      (audit && digitalInvoice && digitalInvoice.cardsignType !== 'HAND')}/>
            )}
          </FormItem>
        )}
      </div>
    );
  };

  deleteAttachment = (attachmentId) => {
    const { nowExpense, attachments } = this.state;
    //附件必填且是最后一个附件
    let required = this.isRequiredFile();
    if(required && attachments.length === 1){
      message.error(this.$t('expense.fileUpload.delete')/*当前页面须至少上传1个附件，请上传其他附件后再删除*/);
      return false;
    }else{
      baseService.attachmentDelete(nowExpense.invoiceOID, attachmentId);
      this.setState({ attachmentChange : true });
      return true;
    }
  };

  setResults = (result,info) => {
    result.push(info.file.response.attachmentDTO);
  }

  getPopupContainer = () => {
    return this.refs.expenseFormBox
  };
  // 里程补贴渲染
  renderMileageForm = () => {
    const {getFieldDecorator} = this.props.form;
    const {expenseType, readOnly} = this.state;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 12, offset: 1}
    };
    // 参考币种
    let referenceCurrencyFile = expenseType.fields.filter(field => field.messageKey === 'reference.currency')[0] || {};
    // 单价 file
    let priceFile = expenseType.fields.filter(field => field.messageKey === 'unit.price')[0] || {};
    // 参考单价 file
    let referentPriceFile = expenseType.fields.filter(field => field.messageKey === 'reference.price')[0] || {};
    // 参考单价文案 需兼容老数据 不存在参考币种或参考单价值时不显示提示文案
    let currencyValue = this.getFieldValue(referenceCurrencyFile.fieldType, referenceCurrencyFile.value, referenceCurrencyFile.showValue);
    let referentPriceFileValue = this.getFieldValue(referentPriceFile.fieldType, referentPriceFile.value, referentPriceFile.showValue);
    let referentPriceFileText = currencyValue && referentPriceFileValue ? `${referentPriceFile.name}: ${currencyValue} ${referentPriceFileValue}` : null;
    // 里程 file
    let mileageFile = expenseType.fields.filter(field => field.messageKey === 'ER_KM')[0] || {};
    // 参考里程 file
    let referenceMileageFile = expenseType.fields.filter(field => field.messageKey === 'reference.mileage')[0] || {};
    // 参考里程文案 需兼容老数据 不存在参考里程值时不显示提示文案
    let referenceMileageFileValue = this.getFieldValue(referenceMileageFile.fieldType, referenceMileageFile.value, referenceMileageFile.showValue);
    let referenceMileageFileText = referenceMileageFileValue ? `${referenceMileageFile.name}: ${referenceMileageFileValue} KM` : null;
    // 单价 里程
    let renderFiles = [{...priceFile, text: referentPriceFileText}, {...mileageFile, text: referenceMileageFileText}];

    return readOnly ? (
      <div>
        {
          renderFiles.map(renderFile =>
            <FormItem {...formItemLayout} label={renderFile.name} key={`${renderFile.fieldOID}`}>
              <Col span={3}>
                <FormItem style={{margin: '0'}}>
                  {this.getFieldValue(renderFile.fieldType, renderFile.value, renderFile.showValue,renderFile)}
                </FormItem>
              </Col>
              <Col span={1}/>
              {renderFile.text && <Col style={{color: '#D2A98C', fontSize: '12px'}} span={12}>
                {renderFile.text}
              </Col>}
            </FormItem>
          )
        }
      </div>
    ) : (
      <div>
        {renderFiles.map(renderFile =>
          <FormItem {...formItemLayout} label={renderFile.name} key={`${renderFile.fieldOID}`}>
            <Col span={10}>
              <FormItem>
                {getFieldDecorator(`${renderFile.fieldOID}`, {
                  rules: [{
                    required: renderFile.required,
                    message: this.$t('common.name.is.required', {name: renderFile.name})
                  }],
                  initialValue: this.getFieldValue(renderFile.fieldType, renderFile.value, renderFile.showValue,renderFile)
                })(
                  this.switchField(renderFile)
                )}
              </FormItem>
            </Col>
            <Col span={1}></Col>
            {renderFile.text &&  <Col span={12}>
              <Alert
                message={renderFile.text}
                key={renderFile.fieldOID}
                type={'warning'}/>
            </Col>}
          </FormItem>
        )}
      </div>
    )
  };
  //获取汇率容差
  getRateDeviation = () => {
    baseService.getRateDeviation(this.props.company.tenantId, this.props.company.setOfBooksId).then(res => {
      this.setState({
        warnExchangeRateTol: res.data.warnExchangeRateTol || 10,
        prohibitExchangeRateTol: res.data.prohibitExchangeRateTol || 20
      })
    })
  };
  render(){
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { profile,isWaitForAudit, view, pay, auditCapability, showExpenseReportInvoices } = this.props;
    const { nowPage, expenseType, loading, saving, attachments, currencyList, nowCurrency, baseCurrency, nowExpense, readOnly, showImageAudit,
      businessCardConsumptions, nowBusinessCardConsumptionIndex, expenseApportion, digitalInvoice, defaultAttachment, unitPriceMode, mileageMessageKey,
      auditAmountEditing, savingAuditAmount, editingInvoice, mileageAllowanceExpenseColumns, approvalHistory, isNonVat , invoiceFp, prohibitExchangeRateTol, warnExchangeRateTol,showExpenseDom,
    } = this.state;
    //用于始终跟着单据走的FP场景
    let invoiceUserFp = invoiceFp ? invoiceFp : profile;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12, offset: 1 }
    };
    const { audit, businessCardEnabled, costCenterItemsApportion, expenseReport, user, approve } = this.props;
    let userOID = user.userOID;
    if(expenseReport){
      userOID = expenseReport.applicationOID;
    }
    //差补费用类型金额修改配置：默认是
    let amountEditConfigSubsidyType;
    switch (invoiceUserFp['allowance.amount.modify']) {
      case 1001:
        amountEditConfigSubsidyType = 1;//差补费用类型金额不可编辑
        break;
      case 1002:
        amountEditConfigSubsidyType = 0;//差补费用类型金额不可改大
        break;
      case 1003:
        amountEditConfigSubsidyType = 2;//差补费用类型金额正常修改
        break;
      default:
        amountEditConfigSubsidyType = 1;
    }
    //是否为差补费用类型
    let isSubsidyType = nowExpense.expenseTypeSubsidyType === 1 ? true : false;
    let amount = readOnly && !auditAmountEditing ? nowExpense.amount : Number(getFieldValue('amount'));
    let actualCurrencyRate = readOnly && !auditAmountEditing ? nowExpense.actualCurrencyRate : getFieldValue('actualCurrencyRate');
    let isBaseCurrency = baseCurrency.currencyCode === nowCurrency.currencyCode;
    let showRateDescription = !isNaN(amount) && (amount >0 || amount >0)&& !isBaseCurrency;
    let rateDescription = `${this.$t('expense.company.rate')/*企业汇率*/}：`;
    let rateDeviation=0;
    if(showRateDescription){
      rateDeviation=(Math.abs(actualCurrencyRate - nowCurrency.rate) / nowCurrency.rate * 100).toFixed(1);
      rateDescription += nowCurrency.rate.toFixed(4);
      rateDescription += actualCurrencyRate > nowCurrency.rate ? ' + ' : ' - ';
      rateDescription += rateDeviation + `%，${this.$t('common.base.currency.amount')/*本位币金额*/}：`;
      rateDescription += (actualCurrencyRate * amount).toFixed(2);
    }
    let pasteInvoiceNeeded = expenseType.pasteInvoiceNeeded;
    let thirdWithReceipt = nowExpense.withReceipt;
    let hasInvoiceInstead = !profile['invoice.instead.disabled'] && (readOnly ? thirdWithReceipt : pasteInvoiceNeeded);
    let invoiceInsteadText = profile['invoice.instead.comments'] ? this.$t('expense.is.remark')/*是否备注*/ : this.$t('expense.is.instead.invoice')/*是否替票*/;
    let invoiceInsteadReasonText = profile['invoice.instead.comments'] ? this.$t('expense.remark.reason')/*备注理由*/ : this.$t('expense.instead.invoice.reason')/*替票理由*/;
    let invoiceInstead = hasInvoiceInstead && ((readOnly && this.props.readOnly) ? nowExpense.invoiceInstead : getFieldValue('invoiceInstead'));
    let vatInvoice = (readOnly && this.props.readOnly) ? nowExpense.vatInvoice : getFieldValue('vatInvoice');
    let isHandDigitalInvoice = digitalInvoice && digitalInvoice.cardsignType === 'HAND';
    let hasExpenseApportion = readOnly ? (nowExpense.apportionUsed && expenseReport) : (expenseType.apportionEnabled && expenseReport);
    const nowBusinessCardConsumption = businessCardConsumptions[nowBusinessCardConsumptionIndex];
    let prendingAuditOperateAuth = expenseReport && (expenseReport.status === 1003 || expenseReport.status === 1002) && !nowExpense.valid && ((audit && ~location.search.indexOf('prending_audit')) || auditCapability) && this.checkPageRole('EXPENSEAUDIT', 2) &&
      !(profile['er.disabled'] || profile['finance.audit.disabled']);
    let hasEditedAmount = nowExpense.amount !== nowExpense.originalAmount ||
      (nowExpense.actualCurrencyRate && nowExpense.actualCurrencyRate !== nowExpense.originalActualCurrencyRate);
    let mileageAllowanceExpenseDTO = nowExpense.mileageAllowanceExpenseDTO;
    let thirdEditAmount = !this.props.readOnly && expenseType.readonly && expenseType.isAmountEditable;
    let thirdEditField = !this.props.readOnly && expenseType.readonly;
    let amountIsNegativeNumber = nowExpense.orderAmount < 0 ? true : false;
    //第三方费用滴滴不可编辑发票,但是他的withReceipt是true
    let isDiDi = expenseType.messageKey === 'expense.type.didi';
    let thirdEditInvoice = !this.props.readOnly && expenseType.readonly && !isDiDi && thirdWithReceipt;
    let currencyCodeDisabled = isSubsidyType || expenseType.messageKey === 'private.car.for.public' ||
      (expenseReport && expenseReport.currencyCode !== this.props.company.baseCurrency) ||
      (expenseReport && expenseReport.currencyCode === this.props.company.baseCurrency && this.checkFunctionProfiles('web.invoice.keep.consistent.with.expense', [true]));
    //审批历史记录
    let approvals = (
      <Spin spinning={loading}>
        <div className="approvals" style={{marginLeft:10}} >
          {approvalHistory && approvalHistory.length>0 &&<Tag color="blue-inverse" style={{marginBottom:20,fontSize:14,cursor:'default'}}>{this.$t('expense.approval.history')/*审批历史*/}</Tag>}
          <Timeline>
            {approvalHistory && approvalHistory.map(item => {
              return (
                <Timeline.Item key={item.id} dot={<Icon type={getApprovelHistory(item.operate).icon} style={{color: getApprovelHistory(item.operate).color}}/>}>
                  <Row>
                    <Col span={5}>{moment(item.createdDate).format('YYYY-MM-DD HH:mm')}</Col>
                    <Col span={4} className="operation-type">{getApprovelHistory(item.operate).text || '-'}</Col>
                    <Col span={5} className="operation-name">{item.role ? `${item.role} ${<span className="ant-divider"/>} ` : ''} {item.operator.fullName+' '+(item.operator.employeeID?item.operator.employeeID:'')}</Col>
                    <Col span={7} className="operation-remark" style={{color:'red'}}>{item.operateDetail}</Col>
                  </Row>
                </Timeline.Item>
              )
            })}
          </Timeline>
        </div>
      </Spin>
    );
    let invoiceSettingArea = (
      <div>
        {hasInvoiceInstead && (
          <FormItem {...formItemLayout} label={invoiceInsteadText}>
            {nowExpense.invoiceInstead ? this.$t('common.yes') : this.$t('common.no')}
          </FormItem>
        )}

        {invoiceInstead && (
          <FormItem {...formItemLayout} label={invoiceInsteadReasonText}>
            {nowExpense.invoiceInsteadReason}
          </FormItem>
        )}

        {thirdWithReceipt && (digitalInvoice ? isHandDigitalInvoice : true) && !invoiceUserFp['account.book.VAT.special.invoice.disabled'] &&  (
          <FormItem {...formItemLayout} label={this.$t('expense.enter.invoice')/*录入发票*/} onChange={checked => this.setState({ editingInvoice: checked })}>
            {nowExpense.vatInvoice ? this.$t('common.yes') : this.$t('common.no')}
            { !digitalInvoice && prendingAuditOperateAuth && (<div style={{fontSize:12}}><Icon type="edit" /> <a onClick={this.handleEditInvoice}>{this.$t('expense.invoice.edit')/*修改发票*/}</a></div>)}
          </FormItem>
        )}
      </div>
    );
    let originNonVat = (nowExpense.originalApprovedNonVat!=null ? this.filterMoney(nowExpense.originalApprovedNonVat) : this.filterMoney(nowExpense.originalAmount));
    let originVat = (nowExpense.originalApprovedVat ? this.filterMoney(nowExpense.originalApprovedVat) : 0.00);
    let invoiceSiteIndex=0;
    let lastInvoiceIndex,nextInvoiceIndex;
    let ifAssignmentCurrentInvoice=false;
    //获取上一条，下一条费用位置。
    showExpenseReportInvoices && showExpenseReportInvoices.map((item, index) => {
      if (item.invoiceOID == nowExpense.invoiceOID) {
        invoiceSiteIndex = index;
        ifAssignmentCurrentInvoice = true;
      }
      else {
        if (!ifAssignmentCurrentInvoice) {
          lastInvoiceIndex = index;
        }
        if (ifAssignmentCurrentInvoice && (index - 1 === invoiceSiteIndex)) {
          nextInvoiceIndex = index;
        }
      }
    })
    return (
      <Animate
        showProp="show"
        transitionName="expense-fade">
        <DivExpense show={showExpenseDom}>
          <div className="new-expense">
            <div className={`expense-container page-${nowPage}`}>
              <Row gutter={30}>
                <Col className="expense-type" span={12}>
                  <div className="expense-type-box">
                    {this.renderExpenseSourceArea()}
                  </div>
                </Col>
                <Col span={12} className="expense-form">
                  <div className="expense-form-box" style={{position: 'relative'}} ref="expenseFormBox">
                    {
                      nowExpense && nowExpense.invoiceLabels && nowExpense.invoiceLabels.length > 0 && (
                        <div className='tip-wrap'>
                          {nowExpense.invoiceLabels.filter(item => item.level !== 'INFO').map(item =>
                            <Alert
                              message={this.showMessage(item)}
                              key={item.name}
                              type={item.level === 'ERROR' ? 'error' : 'info'}
                              showIcon/>
                          )}
                          {nowExpense.invoiceLabels.filter(item => item.level === 'INFO').length > 0 &&
                          (<Alert
                              message={nowExpense.invoiceLabels.filter(item => item.level === 'INFO').map(item => item.name).join('/')}
                              type="info"
                              showIcon/>
                          )}
                        </div>)
                    }
                    <Form onSubmit={this.handleSave}>
                      <Spin spinning={loading}>
                        {/* 卡片显示录入发票信息 */}
                        {digitalInvoice && (isHandDigitalInvoice ? vatInvoice : true) && !editingInvoice && (
                          <Invoice invoice={digitalInvoice}
                                   disabledEdit={
                                     readOnly &&
                                     !thirdEditInvoice &&
                                     !(audit || auditCapability)
                                   }
                                   handleEdit={this.handleEditInvoice}/>
                        )}
                        <div className="expense-type-container">
                          {businessCardConsumptions.length > 0 && (
                            <div className="business-card">
                              <Row>
                                <Col span={6} className="card-amount-area">
                                <span
                                  className="card-name">{this.$t('expense.business.card.consumption')/*商务卡消费*/}</span><br/>
                                  <span
                                    className="card-currency">{this.$t('expense.account.amount')/*入账金额*/}</span><br/>
                                  <span
                                    className="card-amount">{nowBusinessCardConsumption.posCurCod}&nbsp;{nowBusinessCardConsumption.posCurAmt.toFixed(2)}</span><br/>
                                  <span
                                    className="card-origin-amount">{this.$t('expense.transaction.amount')/*交易金额*/}&nbsp;{nowBusinessCardConsumption.oriCurCod}&nbsp;{nowBusinessCardConsumption.oriCurAmt.toFixed(2)}</span>
                                </Col>
                                <Col span={18} className="card-detail-area">
                                  <div className="card-acp">
                                    {nowBusinessCardConsumption.acpName}
                                  </div>
                                  {!nowExpense.invoiceOID && (
                                    <Popconfirm title={this.$t('expense.cancel.import.info')/*取消导入后，该记录将回到商务卡消费*/}
                                                onConfirm={this.deleteBusinessCardConsumption}>
                                      <a>{this.$t('expense.cancel.import')/*取消导入*/}</a>
                                    </Popconfirm>
                                  )}
                                  <Row className="card-detail" gutter={10}>
                                    <Col span={12}>
                                      <span>{this.$t('expense.transaction.date')/*交易时间*/}：</span>&nbsp;
                                      {nowBusinessCardConsumption.trsDate}&nbsp;{this.formatTime(nowBusinessCardConsumption.trxTim)}
                                    </Col>
                                    <Col span={12}>
                                      <span>{this.$t('expense.bill.month')/*账单月*/}：</span>&nbsp;
                                      {nowBusinessCardConsumption.bilMon}</Col>
                                    <Col span={12}>
                                      <span>{this.$t('expense.transaction.card')/*交易卡号*/}：</span>&nbsp;
                                      {nowBusinessCardConsumption.bankName}尾号&nbsp;{(nowBusinessCardConsumption.crdNum + '0').slice(-5, -1)}
                                    </Col>
                                    <Col span={12}>
                                      <span>{this.$t('expense.transaction.type')/*交易类型*/}：</span>
                                      {this.getConsumptionType(nowBusinessCardConsumption.trsCod)}</Col>
                                    {readOnly && (
                                      <Col span={24}>
                                        <span>{this.$t('common.remark')/*备注*/}：</span>
                                        {nowBusinessCardConsumption.remark}
                                      </Col>
                                    )}
                                  </Row>
                                  {!readOnly && getFieldDecorator('businessCardRemark', {
                                    initialValue: nowBusinessCardConsumption.remark || ''
                                  })(
                                    <Input
                                      placeholder={this.$t('expense.please.enter.remark.not.required')/*请输入备注，非必填*/}
                                      maxLength="200" onBlur={this.handleSaveBusinessCardRemark}/>
                                  )}
                                </Col>
                              </Row>
                            </div>
                          )}

                          {!this.props.readOnly && businessCardEnabled && businessCardConsumptions.length === 0 && (
                            <div className="add-business-card" onClick={() => this.setState({
                              nowPage: 'type',
                              typeSource: 'businessCard',
                              fromExpense: true
                            })}>
                              <Icon type="plus"/>{this.$t('expense.add.business.card')/*新增商务卡*/}
                            </div>
                          )}

                          {readOnly ? (
                            <div className="expense-read-only">
                              <FormItem {...formItemLayout}
                                        label={<img className="expense-type-img" src={expenseType.iconURL}/>}
                                        colon={false} className="expense-read-only-base">
                                <div className="expense-type-name">{expenseType.name}</div>
                                <div className="expense-type-amount">
                                  {thirdEditField ? getFieldDecorator('createdDate', {
                                    initialValue: moment(nowExpense.createdDate),
                                    rules: [{
                                      required: true,
                                      message: this.$t("common.please.select")
                                    }]
                                  })(
                                    <DatePicker format="YYYY-MM-DD" allowClear={false}
                                                getCalendarContainer={this.getPopupContainer}/>
                                  ) : new Date(nowExpense.createdDate).format('yyyy-MM-dd')}
                                  <br/>
                                  <b>{thirdEditAmount ? getFieldDecorator('invoiceCurrencyCode', {
                                    rules: [{
                                      required: true,
                                      message: this.$t("common.please.select")
                                    }],
                                    initialValue: nowExpense.invoiceCurrencyCode
                                  })(
                                    <Select dropdownMatchSelectWidth={false}
                                            style={{width: '50%'}}
                                            getPopupContainer={this.getPopupContainer}
                                            onChange={this.handleChangeCurrency}
                                            disabled={expenseType.messageKey === 'private.car.for.public'}
                                            placeholder={this.$t('common.please.select')/* 请选择 */}>
                                      {currencyList.map(item => {
                                        return <Option
                                          key={item.currency} value={item.currency}>{item.currency}{this.props.language.local === 'zh_CN' ? ` ${item.currencyName}` : ''}</Option>
                                      })}
                                    </Select>
                                  ) : nowExpense.invoiceCurrencyCode}
                                    &nbsp;&nbsp;
                                    {(auditAmountEditing || thirdEditAmount) ? getFieldDecorator('amount', {
                                      initialValue: nowExpense.amount,
                                      rules: [{
                                        required: true,
                                        message: this.$t("common.please.enter")
                                      }]
                                    })(
                                      <InputNumber precision={2} min={amountIsNegativeNumber ? undefined : 0}
                                                   max={amountIsNegativeNumber ? 0 : undefined}
                                                   style={{width: '40%', marginTop: 6}}
                                                   onChange={this.handleToTalMoneyChange}/>
                                    ) : this.filterMoney(nowExpense.amount)}
                                  </b>
                                  {!auditAmountEditing && prendingAuditOperateAuth &&
                                  <a className="audit-edit-link"
                                     onClick={this.handleEditAuditAmount}>{this.$t('expense.audited.amount')/*核定金额*/}</a>
                                  }
                                </div>
                                {showRateDescription && !isBaseCurrency && !auditAmountEditing && (
                                  <div className="expense-rate-description">
                                    {this.$t('expense.actual.rate')/*实际汇率*/}: {actualCurrencyRate.toFixed(4)} <br/>
                                    {rateDescription}
                                  </div>
                                )}
                                {auditAmountEditing && isNonVat && (
                                  <div>
                                    <Row style={{marginTop: '10px'}}>
                                      <span style={{float: 'left'}}>{this.$t('expense.origin.approve.amount')}:</span>
                                      <Col span={10} style={{marginLeft: '10px'}}>
                                        {getFieldDecorator('originalApprovedNonVat')(
                                          <InputNumber style={{width: '100%'}} step={0.01} precision={2}
                                                       min={amountIsNegativeNumber ? undefined : 0}
                                                       max={amountIsNegativeNumber ? 0 : undefined}
                                                       onChange={this.changeOriginalApprovedNonVat}/>
                                        )}
                                      </Col>
                                    </Row>
                                    <Row style={{marginTop: '10px'}}>
                                      <span style={{float: 'left'}}>{this.$t('expense.origin.approve.rate')}:</span>
                                      <Col span={10} style={{marginLeft: '10px'}}>
                                        {getFieldDecorator('originalApprovedVat')(
                                          <InputNumber style={{width: '100%'}} step={0.01} precision={2}
                                                       min={amountIsNegativeNumber ? undefined : 0}
                                                       max={amountIsNegativeNumber ? 0 : undefined} disabled={true}/>
                                        )}
                                      </Col>
                                    </Row>
                                  </div>
                                )}

                                {auditAmountEditing && !isBaseCurrency && (
                                  <Row style={{marginTop: '10px'}}>
                                    <span style={{float: 'left'}}>{this.$t('common.currency.rate')}:</span>
                                    <Col span={10} style={{marginLeft: '10px'}}>
                                      {getFieldDecorator('actualCurrencyRate')(
                                        <InputNumber style={{width: '100%'}} step={0.0001} precision={4} min={0}/>
                                      )}
                                    </Col>
                                    <div>
                                      <br/>
                                      <Alert message={rateDescription}
                                             type={rateDeviation > prohibitExchangeRateTol ? "error" : rateDeviation > warnExchangeRateTol ? "warning" : "info"}
                                             showIcon className="rate-description"/>
                                    </div>
                                  </Row>
                                )}
                                {(hasEditedAmount || auditAmountEditing) && (
                                  <Tag>
                                    {this.$t('expense.origin.amount')/*原金额*/}：{this.filterMoney(nowExpense.originalAmount)}&nbsp;&nbsp;
                                    {showRateDescription && !isBaseCurrency && `${this.$t('expense.origin.rate')/*原汇率*/}：${this.filterMoney(nowExpense.originalActualCurrencyRate, 4, true)}`}
                                  </Tag>
                                )}
                                {digitalInvoice && (
                                  <Tag>
                                    {this.$t('expense.origin.approve.amount')/*原币金额*/}：{originNonVat} &nbsp;&nbsp;
                                    {this.$t('expense.origin.approve.rate')/*原税税额*/}：{originVat}
                                  </Tag>
                                )}
                                {auditAmountEditing && (
                                  <div>
                                    <Button type="primary" style={{marginRight: 8}} onClick={this.handleSaveAuditAmount}
                                            loading={savingAuditAmount}>{this.$t('common.save')}</Button>
                                    <Button
                                      onClick={() => this.setState({auditAmountEditing: false})}>{this.$t('common.cancel')}</Button>
                                  </div>
                                )}
                              </FormItem>
                              {/* 里程补贴显示*/}
                              {expenseType.messageKey === 'private.car.for.public' && unitPriceMode && !nowExpense.mileageAllowanceExpenseDTO && this.renderMileageForm()}

                              {this.checkFunctionProfiles('web.invoice.pay.by.company.disabled', [false, undefined]) &&
                              <FormItem {...formItemLayout} label={this.$t('expense.company.pay')/*公司支付*/}>
                                {nowExpense.paymentType === 1002 ? this.$t('common.yes') : this.$t('common.no')}
                              </FormItem>}
                              {nowExpense.data && nowExpense.data.map(field => this.checkFunctionProfiles(['fweb.invoice.pay.by.company.disabled'], [[false, undefined]]) && field.showOnList && nowExpense.paymentType === 1002 && field.messageKey === 'company.payment.type' && (
                                <FormItem {...formItemLayout} label={field.name} key={`${field.fieldOID}`}>
                                  {thirdEditField && field.editable ? getFieldDecorator(`${field.fieldOID}`, {
                                    initialValue: this.getFieldValue(field.fieldType, field.value, field.showValue, field),
                                    rules: [{
                                      required: field.required,
                                      message: ' '
                                    }]
                                  })(
                                    this.switchField(field)
                                  ) : this.getFieldName(field.fieldType, field.showValue, field.messageKey)}
                                </FormItem>
                              ))}

                              {thirdEditInvoice ? this.renderInvoiceEditingArea() : (isDiDi ? null : invoiceSettingArea)}

                              {editingInvoice && this.renderInvoiceArea()}

                              {nowExpense.data && nowExpense.data.map(field => field.showOnList && field.messageKey !== 'company.payment.type' && (!unitPriceMode || (!nowExpense.mileageAllowanceExpenseDTO && unitPriceMode && !(~mileageMessageKey.indexOf(field.messageKey)))) && (
                                <FormItem {...formItemLayout} label={field.name} key={`${field.fieldOID}`}>
                                  {thirdEditField && field.editable ? getFieldDecorator(`${field.fieldOID}`, {
                                    initialValue: this.getFieldValue(field.fieldType, field.value, field.showValue, field),
                                    rules: [{
                                      required: field.required,
                                      message: ' '
                                    }]
                                  })(
                                    this.switchField(field)
                                  ) : this.getFieldName(field.fieldType, field.showValue, field.messageKey)}
                                </FormItem>
                              ))}

                              {hasExpenseApportion && (amount > 0 || amount < 0) &&
                              <ExpenseApportion value={expenseApportion}
                                                amount={amount}
                                                amountIsNegativeNumber={amountIsNegativeNumber}
                                                readOnly={readOnly && !thirdEditField}
                                                expenseReportOID={expenseReport.expenseReportOID}
                                                formOID={expenseReport.formOID}
                                                invoiceOID={nowExpense.invoiceOID}
                                                expenseTypeId={expenseType.id}
                                                userOID={userOID}
                                                costCenterItemsApportion={costCenterItemsApportion}
                                                onChange={this.handleChangeExpenseApportion}/>}

                              {(audit || view || pay || auditCapability) ? (
                                <FormItem {...formItemLayout} label={this.$t("common.attachments")/*附件*/}
                                          style={{marginBottom: 12}}
                                          required={this.isRequiredFile()}>
                                  <FileUpload defaultFileList={attachments}
                                              data={{
                                                attachmentType: "INVOICE_IMAGES",
                                                invoiceOid: nowExpense.invoiceOID
                                              }}
                                              attachmentType="INVOICE_IMAGES" onChange={this.uploadSuccess}
                                              fileSize={10}
                                              isPreViewCallBack={true}
                                              handlePreViewCallBack={(file) => this.handleImageAudit(file)}
                                              isShowDefault showMaxNum
                                              handleDelete={this.deleteAttachment} setResult={this.setResults}
                                              disabled={!((audit && isWaitForAudit) || auditCapability)}
                                              uploadUrl={`${config.baseUrl}/api/finance/upload/attachment`}/>
                                </FormItem>
                              ) : (
                                thirdEditField ? (
                                  <FormItem {...formItemLayout} label={this.$t("common.attachments")/*附件*/}
                                            help={this.$t('common.max.upload.attachment', {max: 9})/*最多上传9张图片*/}
                                            style={{marginBottom: 12}}
                                            required={this.isRequiredFile()}>
                                    <FileUpload defaultFileList={attachments} attachmentType="INVOICE_IMAGES"
                                                onChange={this.uploadSuccess} isShowDefault/>
                                  </FormItem>
                                ) : (
                                  <FormItem {...formItemLayout} label={this.$t("common.attachments")/*附件*/}>
                                    {attachments && attachments.length > 0 ? (
                                      <FileUpload defaultFileList={attachments} attachmentType="INVOICE_IMAGES"
                                                  isShowDefault disabled/>
                                    ) : '-'}
                                  </FormItem>
                                ))}

                              {thirdEditField ? (
                                <FormItem {...formItemLayout} label={this.$t('common.remark')/*备注*/}>
                                  {getFieldDecorator('comment', {
                                    initialValue: nowExpense.comment,
                                    rules: [{
                                      required: expenseType.titleRequired,
                                      message: `${this.$t("common.please.enter")}`
                                    }]
                                  })(
                                    <TextArea rows={4} style={{width: '100%'}}
                                              maxLength="200"
                                              placeholder={`${this.$t("common.please.enter")},${this.$t("common.max.characters.length", {max: 200})}`}/>
                                  )}
                                </FormItem>
                              ) : (
                                <FormItem {...formItemLayout} label={this.$t('common.remark')/*备注*/}>
                                  {nowExpense.comment || '-'}
                                </FormItem>
                              )}

                            </div>
                          ) : (
                            <div>
                              {/* 费用类型 */}
                              <FormItem {...formItemLayout} label={this.$t("common.expense.type")/*费用类型*/} required>
                                {expenseType.id ? (
                                    <Card className='expense-card'
                                          onClick={() => !isSubsidyType && expenseType.messageKey !== 'private.car.for.public' && this.setState({
                                            nowPage: 'type',
                                            typeSource: 'expenseType'
                                          })}>
                                      <img src={expenseType.iconURL}/>
                                      <Popover content={expenseType.name} overlayStyle={{maxWidth: 300}}
                                               placement="bottom">
                                        <div className="expense-name">{expenseType.name}</div>
                                      </Popover>
                                    </Card>
                                  ) :
                                  <Icon type="question-circle"
                                        style={{color: '#BFBFBF', fontSize: 40, cursor: 'pointer'}}
                                        onClick={() => {
                                          this.setState({nowPage: 'type', typeSource: 'expenseType'})
                                        }}/>}
                              </FormItem>

                              {/* 发生日期 */}
                              <FormItem {...formItemLayout} label={this.$t('common.happened.date')/*发生日期*/} required>
                                {getFieldDecorator('createdDate', {
                                  rules: [{
                                    required: true,
                                    message: this.$t("common.please.select")
                                  }],
                                  initialValue: digitalInvoice ? (digitalInvoice.billingTime ? moment(new Date(digitalInvoice.billingTime * 1000)) : moment(new Date())) : moment(new Date())
                                })(
                                  <DatePicker format="YYYY-MM-DD" disabled={isSubsidyType} allowClear={false}
                                              getCalendarContainer={this.getPopupContainer} style={{ width: '100%' }}/>
                                )}
                              </FormItem>
                              {/* 金额 */}
                              <FormItem {...formItemLayout} label={this.$t("common.amount")/*金额*/} required>
                                <Col span={10}>
                                  <FormItem>
                                    {getFieldDecorator('invoiceCurrencyCode', {
                                      rules: [{
                                        required: true,
                                        message: this.$t("common.please.select")
                                      }],
                                      initialValue: this.props.company.baseCurrency
                                    })(
                                      <Select dropdownMatchSelectWidth={false}
                                              onChange={this.handleChangeCurrency}
                                              disabled={currencyCodeDisabled || expenseType.valid}
                                              showSearch={true}
                                              optionFilterProp="children"
                                              filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                              getPopupContainer={this.getPopupContainer}
                                              placeholder={this.$t('common.please.select')/* 请选择 */}>
                                        {currencyList.map(item => {
                                          return <Option
                                            key={item.currency} value={item.currency}>{item.currency}{this.props.language.local === 'zh_CN' ? ` ${item.currencyName}` : ''}</Option>
                                        })}
                                      </Select>
                                    )}
                                  </FormItem>
                                </Col>
                                <Col span={1}/>
                                <Col span={13}>
                                  <FormItem>
                                    {getFieldDecorator('amount', {
                                      rules: [{
                                        required: true,
                                        message: this.$t("common.please.enter")
                                      }]
                                    })(
                                      <InputNumber style={{width: '100%'}} precision={2}
                                                   min={amountIsNegativeNumber ? undefined : 0} step={0.01}
                                                   max={amountIsNegativeNumber ? 0 : (isSubsidyType && amountEditConfigSubsidyType === 0) ? nowExpense.orderAmount : undefined}
                                                   onChange={this.handleChangeAmount}
                                                   placeholder={this.$t("common.please.enter")}
                                                   disabled={(expenseType.messageKey === 'private.car.for.public' && unitPriceMode) || (isSubsidyType && amountEditConfigSubsidyType === 1) || expenseType.valid}/>
                                    )}
                                  </FormItem>
                                </Col>
                              </FormItem>
                              {
                                expenseType.valid &&
                                <FormItem {...formItemLayout} label={this.$t("common.number")/*数量*/} required>
                                  <Col span={10}>
                                    <FormItem>
                                      {getFieldDecorator('number', {
                                        initialValue: nowExpense.number,
                                        rules: [{
                                          required: true,
                                          message: this.$t("common.please.select")
                                        }],
                                      })(
                                        <InputNumber style={{width: '100%'}} precision={2} min={0} step={1}
                                                     onChange={(e) => this.getAmount(e, true)}
                                                     placeholder={this.$t("common.please.enter")}/>
                                      )}
                                    </FormItem>
                                  </Col>
                                </FormItem>
                              }
                              {
                                expenseType.valid &&
                                <FormItem {...formItemLayout}
                                          label={`${this.$t("common.price")}${expenseType.unit ? `/${this.$t(`expense.invoice.unit.${expenseType.unit}`)}` : ''}`/*单价*/}
                                          required>
                                  <Col span={10}>
                                    <FormItem>
                                      {getFieldDecorator('unitPrice', {
                                        initialValue: nowExpense.unitPrice,
                                        rules: [{
                                          required: true,
                                          message: this.$t("common.please.select")
                                        }],
                                      })(
                                        <InputNumber style={{width: '100%'}} precision={2} min={0} step={0.01}
                                                     onChange={e => this.getAmount(e)}
                                                     placeholder={this.$t("common.please.enter")}/>
                                      )}
                                    </FormItem>
                                  </Col>
                                </FormItem>
                              }
                              {/* 里程补贴显示*/}
                              {expenseType.messageKey === 'private.car.for.public' && unitPriceMode && !nowExpense.mileageAllowanceExpenseDTO && this.renderMileageForm()}
                              {/*汇率*/}
                              {!isBaseCurrency &&
                              <FormItem {...formItemLayout} label={this.$t("common.currency.rate")/*汇率*/}>
                                <Col span={10}>
                                  <FormItem>
                                    {getFieldDecorator('actualCurrencyRate', {
                                      initialValue: 1.0000
                                    })(
                                      <InputNumber style={{width: '100%'}} step={0.0001} precision={4}
                                                   disabled={isBaseCurrency || this.checkFunctionProfiles('web.expense.rate.edit.disabled', [true, 'true'])}/>
                                    )}
                                  </FormItem>
                                </Col>
                                {showRateDescription && (
                                  <div>
                                    <br/>
                                    <Alert message={rateDescription}
                                           type={rateDeviation > prohibitExchangeRateTol ? "error" : rateDeviation > warnExchangeRateTol ? "warning" : "info"}
                                           showIcon className="rate-description"/>
                                  </div>
                                )}
                              </FormItem>}
                              {this.checkFunctionProfiles('web.invoice.pay.by.company.disabled', [false, undefined]) &&
                              <FormItem {...formItemLayout} label={this.$t('expense.company.pay')/*公司支付*/}>
                                {getFieldDecorator('payByCompany', {
                                  valuePropName: 'checked',
                                  initialValue: false
                                })(
                                  <Switch/>
                                )}
                              </FormItem>}
                              {expenseType.fields ? expenseType.fields.map(field => this.checkFunctionProfiles(['fweb.invoice.pay.by.company.disabled'], [[false, undefined]]) && field.showOnList && getFieldValue('payByCompany') && field.messageKey === 'company.payment.type' && (
                                <FormItem {...formItemLayout} label={field.name} key={`${field.fieldOID}`}>
                                  {getFieldDecorator(`${field.fieldOID}`, {
                                    initialValue: this.getFieldValue(field.fieldType, field.value, field.showValue, field),
                                    rules: [{
                                      required: field.required,
                                      message: ' '
                                    }]
                                  })(
                                    this.switchField(field)
                                  )}
                                </FormItem>
                              )) : null}

                              {/* 费用编辑按钮 */}
                              {this.renderInvoiceEditingArea()}

                              {/*录入发票表单*/}
                              {(vatInvoice && (editingInvoice || !digitalInvoice)) ? this.renderInvoiceArea() : ''}

                              {expenseType.fields ? expenseType.fields.map(field => field.showOnList && field.messageKey !== 'company.payment.type' && (!unitPriceMode || (!nowExpense.mileageAllowanceExpenseDTO && unitPriceMode && !(~mileageMessageKey.indexOf(field.messageKey)))) && (
                                <FormItem {...formItemLayout} label={field.name} key={`${field.fieldOID}`}>
                                  {getFieldDecorator(`${field.fieldOID}`, {
                                    initialValue: this.getFieldValue(field.fieldType, field.defaultValueKey, field.showValue, field),
                                    rules: [{
                                      required: field.required,
                                      message: ' '
                                    }]
                                  })(
                                    this.switchField(field)
                                  )}
                                </FormItem>
                              )) : null}
                              {hasExpenseApportion && (amount > 0 || amount < 0) &&
                              <ExpenseApportion value={expenseApportion}
                                                amount={amount}
                                                amountIsNegativeNumber={amountIsNegativeNumber}
                                                readOnly={readOnly}
                                                expenseReportOID={expenseReport.expenseReportOID}
                                                formOID={expenseReport.formOID}
                                                invoiceOID={nowExpense.invoiceOID}
                                                expenseTypeId={expenseType.id}
                                                userOID={userOID}
                                                costCenterItemsApportion={costCenterItemsApportion}
                                                onChange={this.handleChangeExpenseApportion}/>}
                              <FormItem {...formItemLayout} label={this.$t("common.attachments")/*附件*/}
                                        style={{marginBottom: 12}}
                                        required={this.isRequiredFile()}>
                                <FileUpload defaultFileList={attachments} attachmentType="INVOICE_IMAGES"
                                            onChange={this.uploadSuccess} isShowDefault maxNum={9} showMaxNum
                                            fileSize={10}/>
                              </FormItem>

                              <FormItem {...formItemLayout} label={this.$t('common.remark'/*备注*/)}>
                                {getFieldDecorator('comment', {
                                  initialValue: '',
                                  rules: [{
                                    required: expenseType.titleRequired,
                                    message: `${this.$t("common.please.enter")}`
                                  }]
                                })(
                                  <TextArea rows={4} style={{width: '100%'}}
                                            maxLength="200"
                                            placeholder={`${this.$t("common.please.enter")},${this.$t("common.max.characters.length", {max: 200})}`}/>
                                )}
                              </FormItem>
                            </div>
                          )}
                          {/* 里程字段 */}
                          {mileageAllowanceExpenseDTO && (
                            <div className="expense-mileage-allowance">
                              <FormItem {...formItemLayout} label={this.$t('expense.total.mileage')/*累计里程*/}>
                                {mileageAllowanceExpenseDTO.mileage}KM
                                <span className="reference-mileage">
                              {this.$t('expense.reference.mileage')/*参考里程*/}：&nbsp;{mileageAllowanceExpenseDTO.referenceMileage}KM
                              </span>
                              </FormItem>
                              <FormItem {...formItemLayout} label={this.$t('expense.total.allowance')/*补贴总额*/}>
                                {mileageAllowanceExpenseDTO.currency}&nbsp;&nbsp;{mileageAllowanceExpenseDTO.referenceAmount.toFixed(2)}
                                <Popover placement="top" overlayStyle={{width: 400}} content={
                                  <Table
                                    columns={[{
                                      title: this.$t('expense.mileage')/*里程*/, dataIndex: 'startUnit',
                                      render: (startUnit, record) => `${startUnit}${record.endUnit === -1 ? this.$t('expense.mileage.over')/*以上*/ : ('~' + record.endUnit)}`
                                    }, {
                                      title: `${this.$t('common.price')/*单价*/}/KM ${mileageAllowanceExpenseDTO.currency}`,
                                      dataIndex: 'unitPrice'
                                    }, {
                                      title: this.$t('common.amount')/*金额*/, dataIndex: 'amount'
                                    }]}
                                    dataSource={mileageAllowanceExpenseDTO.steps}
                                    rowKey="startUnit"
                                    pagination={false}
                                    size="small"/>}>
                                  <a
                                    style={{marginLeft: 10}}>{this.$t('expense.mileage.view.amount.detail')/*查看计价明细*/}</a>
                                </Popover>
                              </FormItem>
                              <FormItem {...formItemLayout} label={this.$t('expense.mileage.detail')/*里程明细*/}
                                        style={{marginBottom: 12}}/>
                              <Table size="small"
                                     columns={mileageAllowanceExpenseColumns}
                                     dataSource={mileageAllowanceExpenseDTO.mileageAllowanceOrders}
                                     rowKey="id"
                                     onRow={record => ({
                                       onClick: () => Modal.info({
                                         className: 'expense-mileage-allowance-order',
                                         title: this.$t('expense.total.mileage')/*里程明细*/,
                                         content: (
                                           <div className="order-content">
                                             <Row gutter={20}>
                                               <Col span={8}>{this.$t('expense.mileage.depart.time')/*上车时间*/}</Col>
                                               <Col
                                                 span={16}>{moment(record.departTime).utc().format('YYYY-MM-DD HH:mm:ss')}</Col>
                                               <Col span={8}>{this.$t('expense.mileage.depart.place')/*上车地点*/}</Col>
                                               <Col span={16}>{record.start.place}</Col>
                                               <Col span={8}>{this.$t('expense.mileage.arrive.time')/*下车时间*/}</Col>
                                               <Col
                                                 span={16}>{moment(record.arriveTime).utc().format('YYYY-MM-DD HH:mm:ss')}</Col>
                                               <Col span={8}>{this.$t('expense.mileage.arrive.place')/*下车地点*/}</Col>
                                               <Col span={16}>{record.end.place}</Col>
                                               <Col span={8}>{this.$t('expense.actual.mileage')/*实际里程*/}</Col>
                                               <Col span={16}>{record.mileage}</Col>
                                               <Col span={8}>{this.$t('expense.reference.mileage')/*参考里程*/}</Col>
                                               <Col span={16}>{record.referenceMileage}</Col>
                                               <Col span={8}>{this.$t('common.remark')/*备注*/}</Col>
                                               <Col span={16}>{record.remark}</Col>
                                             </Row>
                                           </div>
                                         ),
                                         iconType: "environment"
                                       })
                                     })}
                                     pagination={false}
                                     style={{marginBottom: 24}}/>
                            </div>
                          )}
                        </div>
                      </Spin>
                      {approvals}
                    </Form>
                  </div>
                </Col>
              </Row>
            </div>
            {/* 低部提交按钮*/}
            {nowPage === 'form' && (
              <div className="footer-operate">
                {(!readOnly || thirdEditAmount || thirdEditField) &&
                <Button type="primary" disabled={rateDeviation > prohibitExchangeRateTol} onClick={this.handleSave}
                        loading={saving}>{this.$t("common.save")}</Button>}
                <Button onClick={this.onCancel}>{this.$t(readOnly ? "common.back" : "common.cancel")}</Button>
                {expenseReport && nowExpense.invoiceOID && readOnly && <div className="footer-page">
                  <Button type="primary" disabled={typeof lastInvoiceIndex !== 'number'}
                          onClick={() => this.setState({showExpenseDom: !showExpenseDom}, () => {
                            this.props.params.switchingInvoice(lastInvoiceIndex)
                          })}>
                    <Icon type="left"/>{/*上一条*/}{this.$t("common.last.one")}
                  </Button>
                  <Button type="primary" disabled={typeof nextInvoiceIndex !== 'number'}
                          onClick={() => this.setState({showExpenseDom: !showExpenseDom}, () => {
                            this.props.params.switchingInvoice(nextInvoiceIndex)
                          })}>
                    <Icon type="right"/>{/*下一条*/}{this.$t("common.next.one")}
                  </Button>
                </div>}
              </div>
            )}
            {(audit || view || pay || auditCapability) && expenseReport.expenseReportInvoices && (
              <ImageAudit visible={showImageAudit}
                          defaultImage={defaultAttachment}
                          isEnableCheck={(audit && isWaitForAudit) || auditCapability}
                          onCancel={() => this.setState({showImageAudit: false})}
                          currentInvoices={expenseReport.expenseReportInvoices}
                          invoices={this.handleHaveImageInvoices(expenseReport.expenseReportInvoices)}/>
            )}
          </div>
        </DivExpense>
      </Animate>
    )
  }

}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    //companyConfiguration: state.user.companyConfiguration,
    profile: state.user.proFile,
    user: state.user.currentUser,
    language: state.languages
  }
}

const WrappedNewExpense = Form.create()(NewExpense);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewExpense);