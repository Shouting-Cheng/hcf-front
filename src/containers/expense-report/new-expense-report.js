
import React from 'react'
import { connect } from 'dva'
// import menuRoute from 'routes/menuRoute'
import baseService from 'share/base.service'
import { Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin, Modal } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
import 'styles/expense-report/new-expense-report.scss'
import customField from 'share/customField'
import Chooser from 'widget/chooser'
import expenseReportService from 'containers/expense-report/expense-report.service'
import { deepCopy } from 'utils/extend'
import {rejectPiwik} from "share/piwik";
import PropTypes from 'prop-types';
import { routerRedux } from 'dva/router';
const defaultCustomMessageKeys=['select_department','select_approver','remark','select_company','select_corporation_entity','title'];
let isClearStatus=false;
let newExpenseReportThis;
let firstInitLoad;
//3002 3003
class NewExpenseReport extends React.Component{
  constructor(props) {
    super(props);
    newExpenseReportThis=this;
    firstInitLoad=false;
    this.state = {
      loading: true,
      submitting: false,
      change:false,
      formDetail: {},
    //   expenseReportList: menuRoute.getRouteItem('expense-report'),
      formDefaultValue: [], //表单默认值
      approvalAddSignScope: [], //加签人列表
    }
  }
  //处理代理单据逻辑
  dealProxies(usersOid){
    baseService.changeLoginInfo(usersOid).then(() => {
    }).catch(err => {
      location.href = '/';
      message.error(this.$t('login.error')); //呼，服务器出了点问题，请联系管理员或稍后再试:(
    });
  };
  componentWillMount(){
    isClearStatus=false;
    console.log(this.props)
    this.isCounterSignEnable(this.props.params?this.props.params.formDetail.formOid:this.props.match.params.formId);
    // if(this.props.match.params.formId && this.props.match.params.userOid && this.props.match.params.userOid!=':userOid'){
    //   this.dealProxies(this.props.match.params.userOid);
    // }
    if(this.props.params){
      rejectPiwik(`报销单/创建报销单/${this.props.params.formDetail.formName}`);
      this.setState({formDetail: this.props.params.formDetail, loading: false})
    }
    if(this.props.match){
     // this.dealProxies(this.props.match.params.userOid);
      this.setState({ loading: true });
      baseService.getFormDetail(this.props.match.params.formId).then(res => {
        rejectPiwik(`报销单/创建报销单/${res.data.formName}`);
        this.setState({ formDetail: res.data }, this.getFormDefaultValue)
      })
    }
    // if(this.props.match.params.formDetail){
    //   rejectPiwik(`报销单/创建报销单/${this.props.match.params.formDetail.formName}`);
    //   this.setState({formDetail: this.props.match.params.formDetail, loading: false})
    // } else {
    //   this.setState({ loading: true });
    //   baseService.getFormDetail(this.props.match.params.formId).then(res => {
    //     rejectPiwik(`报销单/创建报销单/${res.data.formName}`);
    //     this.setState({ formDetail: res.data }, this.getFormDefaultValue)
    //   })
    // }
  }

  //获取表单默认值
  getFormDefaultValue = (userOid=this.props.user.userOid,type) => {
    expenseReportService.getFormValue(userOid, this.props.match.params.formId).then(res => {
      this.setState({
        loading: false,
        formDefaultValue: res.data
      },()=>{
        if(type===1){
          this.dealFormReset();
        }
      })
    })
  };
  //处理select选择框为数组对象时单独重置，全部重置不生效
  dealFormReset(){
    let {formDetail, formDefaultValue}=this.state;
    let customFormFields = formDetail.customFormFields || [];
    let fieldOids=[];
    let noChangeMessageKey=[];
    customFormFields.map(item => {
      item.value = null;
      formDefaultValue && formDefaultValue.map(i=>{
        if(item.fieldOid === i.fieldOid){
          item.value=i.value;
        }
        if(this.props.form.getFieldsValue()[i.fieldOid] === i.value){
          noChangeMessageKey.push(i.fieldOid);
        }
      })
      if(item.fieldOid && !~noChangeMessageKey.indexOf(item.fieldOid)){
        fieldOids.push(item.fieldOid)
      }
    })
    this.props.form.resetFields(fieldOids);
  }
  //自定组件，关联组件处理逻辑(相关人),Type：1.创建2.编辑
  dealRelactiveFormRender(item, change, field, customFormFields, type = 1) {
    let interactive = ['select_department', 'select_cost_center'];
    if (item.fieldOid && item.fieldOid === field.fieldOid && !change && ~interactive.indexOf(field.messageKey)) {
      let isInitStatus = true;
      let value = this.props.form.getFieldValue(item.fieldOid);
      if (!value && field.value) {
        isInitStatus = false;
      }
      if (item.value && !field.value && isInitStatus && type === 1) {
        field.value = item.value;
      }
      if (value != field.value && (type === 1?true:isClearStatus)) {
        customFormFields.map(item => {
          if (item.messageKey === 'select_participant') {
            item.clearDefault = true;
            if(type !== 1){
              item.value = null;
            }else{
              field.value =null;
            }
            this.props.form.resetFields(item.fieldOid);

          }
        })
      }
      if (type === 1) {
        field.value = value;
      }
      else {
        if(value){
          isClearStatus=true;
        }
        if(isClearStatus){
          field.value = value;
        }else{
          if(value){
            field.value = value;
          }
        }
      }
    }
  };
  // 获取滚动元素相对元素对象
  getPopupContainer = () => {
    return this.refs.newExpenseReport;
  };
  renderFormItem(){
    const { getFieldDecorator } = this.props.form;
    const { formDetail, formDefaultValue,change} = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    let customFormFields = formDetail.customFormFields || [];
    let expenseReport = this.props.params?this.props.params.expenseReport:null;
    if(expenseReport){
      customFormFields = expenseReport.custFormValues || customFormFields;
      formDetail.customFormFields=customFormFields;
    }
    customFormFields.length > 0 && customFormFields.sort((a, b) => a.sequence > b.sequence || -1);
    return customFormFields.map(field => {
      let switchMessageKey=['switch','writeoff_flag'];
      let option = {
        valuePropName: ~switchMessageKey.indexOf(field.messageKey) ? 'checked' : 'value',
        rules: []
      };
      let fieldNameHelp='';
      //表单默认值
      let fieldDefaultValue = {};
      formDefaultValue.map(item => {
        item.fieldOid === field.fieldOid && (fieldDefaultValue = item)
        //this.dealRelactiveFormRender(item, change, field, customFormFields)
      });
      if(expenseReport){
        /*expenseReport.custFormValues.map(item =>{
          this.dealRelactiveFormRender(item, change, field, expenseReport.custFormValues,2);
        })*/
        option.initialValue = customField.getInitialValue(field);
      }
      else {
        if(!change)option.initialValue = customField.getDefaultValue(field, fieldDefaultValue);
        if(change) {
          option.initialValue = customField.getDefaultValue(field, ~defaultCustomMessageKeys.indexOf(field.messageKey) ? {} : fieldDefaultValue);
        }
      }
      if(field.required){
        option.rules.push({
          required: field.required,
          message: this.$t('common.name.is.required', {name: field.fieldName})  //${field.fieldName}必填
        })
      }
      if(field.messageKey === 'remark' || field.messageKey === 'text_area'){

      }
      if (field.messageKey === 'employee_expand' && !(field.fieldContent && (JSON.parse(field.fieldContent) || {}).messageKey === 'cust_list')) {
        option.rules.push({
          max: 200,
          message: this.$t('common.max.characters.length', {max: 200})
        })
      }
      if(field.messageKey === 'title' || field.messageKey === 'input'){
        option.rules.push({
          max: 50,
          message: this.$t('common.max.characters.length', {max: 50})
        })
      }
      //编辑模式不能修改申请人
      if (field.messageKey === 'applicant' && this.props.match.params.expenseReport) {
        field.isReadOnly = true;
      }
      if (field.messageKey === 'number') {
        if(field.fieldContent&&JSON.parse(field.fieldContent)){
          let fieldContentObject=JSON.parse(field.fieldContent);
          fieldNameHelp=fieldContentObject.unit?`(${fieldContentObject.unit})`:'';
        }
      }
      return field.fieldOid && field.messageKey!='ying_fu_select_approver' && (
        <FormItem {...formItemLayout} label={`${field.fieldName}${fieldNameHelp}`} key={field.fieldOid} >
          {getFieldDecorator(field.fieldOid, option)(
            customField.renderForm({field, fieldDefaultValue, formDetail, copyValue: null, type:2, getPopupContainer: this.getPopupContainer })
          )}
        </FormItem>
      )
    })
  }
  formItemChange(value){
    let {formDetail}=this.state;
    let customFormFields = formDetail.customFormFields || [];
    customFormFields.map(item =>{
      //参与人部门权限控件
      if ((item.messageKey === 'select_department' || item.messageKey === 'select_cost_center') && value && Object.prototype.toString.call(value) === '[object Object]' && item.fieldOid in value) {
        item.value=value[item.fieldOid];
        customFormFields.map(i =>{
          if(i.messageKey === 'select_participant'){
            setTimeout(()=>{
              firstInitLoad=true;
            },200);
            if(firstInitLoad){
              i.clearDefault = true;
            }
            let fieldContent=i.fieldContent?JSON.parse(i.fieldContent):{editable:true};
            if (!i.isReadOnly && fieldContent.editable) {
              this.props.form.resetFields(i.fieldOid);
            }
          }
        });
      }
      //收款人银行关联控件
      if (item.messageKey === 'payee' && value && Object.prototype.toString.call(value) === '[object Object]' &&  item.fieldOid in value && value[item.fieldOid] &&  typeof value[item.fieldOid] == 'object') {
        item.value = value[item.fieldOid]['key'];
        customFormFields.map(i => {
          if (i.messageKey === 'contact_bank_account') {
            let param = {
              userOid: value[item.fieldOid]['key'],
              page: 0,
              size: 20
            };
            let bank = {
              [i.fieldOid]: [{
                bankAccountNo: null,
                contactBankAccountOid: null
              }]
            };
            baseService.getUserBanks(param).then(res => {
              let data = res.data;
              if (data && data.length > 0) {
                data.map(item => {
                  if (item.isPrimary) {
                    bank = {
                      [i.fieldOid]: [{
                        bankAccountNo: item.bankAccountNo,
                        contactBankAccountOid: item.contactBankAccountOid
                      }]
                    };
                  }
                })
              }
              this.props.form.setFieldsValue(bank);
            }).catch(e => {
              this.props.form.setFieldsValue(bank);
            })
          }
        });
      }
    })
  }
  //提交前检查组合控件的表单值验证,异步方法
  submitSaveValidateCombinationForm(){
    let {formDetail}=this.state;
    let customFormFields = formDetail.customFormFields || [];
    let isHaveValidate=false;
    let needValidateForms = ['venMasterSwitch', 'linkage_switch'];
    customFormFields.map(item=>{
      if(~needValidateForms.indexOf(item.messageKey)){
        let info=this.props.form.getFieldValue(item.fieldOid);
        if(info){
          info.callBackSubmit=!info.callBackSubmit;
          this.props.form.setFieldsValue({[item.fieldOid]:info});
          isHaveValidate=true;
        }
      }
    });
    return isHaveValidate;
  }
  //组合表单验证结果
  combinationFormValidateResult(){
    let {formDetail}=this.state;
    let customFormFields = formDetail.customFormFields || [];
    let isPassValid=true;
    let needValidateForms = ['venMasterSwitch', 'linkage_switch'];
    customFormFields.map(item=>{
      if(~needValidateForms.indexOf(item.messageKey)){
        let info=this.props.form.getFieldValue(item.fieldOid);
        isPassValid= !isPassValid || info.isPassValid;
      }
    });
    return isPassValid;
  }
  handleSave = (e) => {
    e.preventDefault();
    if(this.submitSaveValidateCombinationForm()){
      //组合子表单验证信息传递需要时间
      setTimeout(this.delayHandleSave,10)
    }
    else{
      this.delayHandleSave();
    }
  };
  delayHandleSave=()=>{
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!this.combinationFormValidateResult()){
        return;
      }
      let expenseReport = this.props.params?this.props.params.expenseReport:null;
      const { formDetail } = this.state;
      let target = JSON.parse(JSON.stringify(expenseReport || formDetail));
      if(this.checkFunctionProfiles('web.invoice.keep.consistent.with.expense', [true])){
        target.currencySame=true;
      }else{
        target.currencySame=false;
      }
      if(values.application){
        target.applicationOid = values.application[0].applicationOid;
      }
      let customFormFields = formDetail.customFormFields || [];
      if(expenseReport) {
        customFormFields = expenseReport.custFormValues || [];
      }
      else{
        target.remark=null;
      }
      if (!err) {
        let custFormValues = [];
        Object.keys(values).map(key => {
          customFormFields.map(field => {
            if(key === field.fieldOid){
              custFormValues.push(customField.formatFormValue(field, values[key]));
            }
          })
        });
        target.countersignApproverOids = this.props.form.getFieldsValue().addSign;
        target.custFormValues = custFormValues;
        this.setState({ submitting: true });
        expenseReportService.saveExpenseReport(target).then(res => {
          this.setState({ submitting: false });
          message.success(this.$t('common.save.success', {name: ''}));
          if(expenseReport){
            this.props.close(true);
          } else {
            this.props.dispatch(
              routerRedux.push({
                pathname: `/expense-report/expense-report-detail/${res.data.expenseReportOid}/my`
              })
            )  
          }
        })
          .catch(error => {
            this.setState({ submitting: false });
            message.error(error.response.data.message);
          })
      }else{
        let costCenterFalse = false;
        Object.keys(values).map(key => {
          customFormFields.map(fields => {
            if(fields.messageKey === 'select_cost_center' && fields.isReadOnly){
              if(key === fields.fieldOid){
                if(!values[key]){
                  costCenterFalse = true;
                }
              }
            }
          })
        });
        if(costCenterFalse){
          message.error(this.$t('common.error')/*请联系管理员*/);
        }
      }
    })
  }
  //是否可以审批加签
  isCounterSignEnable = (formOid) => {
    expenseReportService.isCounterSignEnable(this.props.company.companyOid, formOid, 'enableAddSignForSubmitter').then(res => {
      this.setState({
        signEnable: res.data.enabled,
        approvalAddSignScope: res.data.approvalAddSignScope.companyOids
      })
    })
  };
  handleChangeApplication = (result) => {
    const {formDetail, loading} = this.state;
    if (loading) return;
    this.setState({loading:true,change:true});
    //处理申请单自定义表单值带入报销单自定义表单值
    if (result && result.length > 0) {
      expenseReportService.getApplicationInfo(result[0].applicationOid, true).then((res) => {
        this.setState({loading:false},()=>{
          let applicationFieldDefaultValues = res.data.custFormValues;
          let customFormFields = formDetail.customFormFields || [];
          let updateFormsOId={};
          customFormFields.map(field => {
            applicationFieldDefaultValues.map(item => {
              if (item.messageKey === field.messageKey && ~defaultCustomMessageKeys.indexOf(field.messageKey)) {
                let applicationDefaultCustom=item;
                applicationDefaultCustom.name = applicationDefaultCustom.showValue;
                let defaultValue = customField.getDefaultValue(field, applicationDefaultCustom);
                updateFormsOId[field.fieldOid]=defaultValue;
                defaultValue&&this.props.form.setFieldsValue({[field.fieldOid]: defaultValue})
              }
            })
          });
        });
      })
    }
  };
  //返回
  goBack = () => {
    let expenseReport = this.props.params?this.props.params.expenseReport:null;
    if(expenseReport) {
      this.props.close();
    } else{
    this.props.dispatch(
        routerRedux.push({
          pathname: `/expense-report`
        })
      )  
    }
  };
  render() {
    const { loading, formDetail, submitting, signEnable, approvalAddSignScope } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    let expenseReport = this.props.params?this.props.params.expenseReport:null;
    let signPerson = [];
    expenseReport && expenseReport.countersignApproverNames && expenseReport.countersignApproverNames.map(item => {
      signPerson.push({userOid: item.userOid, fullName: item.fullName})
    });
    let companyDTOS = approvalAddSignScope.length ? approvalAddSignScope : null;
    return (
      <div className="new-expense-report" ref='newExpenseReport' style={{position: 'relative'}}>
        <div style={{fontSize:18}}>{formDetail.formName}</div>
        <div style={{marginLeft:'30%',marginBottom:20}}>{customField.instructionsTag(formDetail.customFormPropertyMap)}</div>
        <Form onSubmit={this.handleSave} >
          { (!expenseReport && (formDetail.formType === 3002 || formDetail.formType === 3003)) &&  (
            <FormItem {...formItemLayout} label={this.$t('expense-report.association.request')/*关联申请单*/}>
              {getFieldDecorator('application', {
                rules: [{
                  required: true,
                  message: this.$t('common.name.is.required', {name: this.$t('expense-report.association.request')/*关联申请单*/})
                }]
              })(
                <Chooser type="my_request"
                         listExtraParams={{ formOid: this.props.match?this.props.match.params.formId:null, userOid:this.props.user.userOid }}
                         labelKey="title"
                         valueKey="applicationOid"
                         single
                         onChange={this.handleChangeApplication}/>
              )}
            </FormItem>
          )}
          {loading ? <Spin/> : this.renderFormItem()}
          {signEnable && (
            <FormItem {...formItemLayout} label={this.$t('customField.special.signer')/*"加签人"*/} key="addSign">
              {getFieldDecorator('addSign', {
                initialValue: signPerson
              })(
                <Chooser type="user"
                         valueKey="userOid"
                         labelKey="fullName"
                         onlyNeed="userOid"
                         listExtraParams={{corporationOid: companyDTOS,roleType: 'TENANT'}}
                         showArrow={formDetail.customFormPropertyMap && formDetail.customFormPropertyMap.countersignType === '2'}
                         newline/>
              )}
            </FormItem>
          )}
          <FormItem wrapperCol={{ offset: 7 }}>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
              {expenseReport ? this.$t('common.save')/*保存*/ : this.$t('common.create')/*新建*/}
            </Button>
            <Button onClick={this.goBack}>{this.$t('common.cancel')/*取消*/}</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}

// NewExpenseReport.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

NewExpenseReport.propTypes = {
  expenseReport: PropTypes.object
};

const WrappedNewExpenseReport = Form.create({
  onValuesChange(props, values) {
    newExpenseReportThis.formItemChange(values);
  },
})(NewExpenseReport);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewExpenseReport)
