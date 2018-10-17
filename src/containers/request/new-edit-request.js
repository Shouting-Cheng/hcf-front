
import React from 'react'
import {connect} from 'dva'
import {getApprovelHistory } from 'utils/extend'
import {Form, Affix, Button, Spin, Icon, Modal, message, Popconfirm, Switch, Select, Row, Col, Progress, Tabs, Timeline} from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
import { routerRedux } from 'dva/router';
import moment from 'moment'
import TravelType from 'containers/request/travel-request/travel-type';
import  TravelElementType from 'containers/request/travel-request/travel-element-type';
import travelService from 'containers/request/travel-request/travel.service'
import travelUtil from 'containers/request/travel-request/travelUtil'
import RelatedApplication from 'containers/request/new-request/related-application'
import customField from 'share/customField'
import baseService from 'share/base.service'
import requestService from 'containers/request/request.service'
import TravelPreviousVersion from 'containers/request/travel-request/travel-previous-version'
import ExpectStopDate from 'containers/request/travel-request/expect-stop-date'
import ApproveHistory from 'widget/Template/approve-history'
import Chooser from 'widget/chooser'
import 'styles/request/new-request.scss'
import config from 'config'

import approveRequestService from 'containers/approve/request/request.service'
let newRequestThis;
let firstInitLoad;
class NewRequest extends React.Component {
  travelParams = {};//差旅申请单提交或保存的参数
  percentNum = 0;//进度条变化基数
  canGo = true;//是否可进入修改头部数据弹框提示操作
  isReplace = false;//是否替换参与人
  isSetCloseEnabled = false;//是否设置了停用日期
  closeDate = "";//预计停用日期
  isSubsidySave = false;//是否是因为要添加差补而要保存当前单据
  noChangePar = false;//是否改动申请人了且币种也变化了
  customFormFieldsOrigin = {};// 表单配置原始值。（每次获取都是最新配置值，不许改变）
  constructor(props) {
    super(props);
    newRequestThis=this;
    firstInitLoad=false;
    this.state = {
      loading: false,
      saveLoading: false, //保存按钮
      submitLoading: false, //提交按钮
      deleteLoading: false, //删除按钮
      info: {}, //申请单详情
      formInfo: {}, //表单详情
      formDefaultValue: [], //表单默认值
      formType: null,
      defaultValues: [],
      copyDefaultValues: [],
      subsidyCtrl: {
        flight: false,//是否显示飞机统一订票
        train: false,//。。。。火车统一订票
        hotel: false,//是否显示酒店统一订票
        isBudgetCheck: false,//是否进行预算校验
        selectPerson: [],//被选择的统一订票人（创建人+申请人+参与人）
        itineraryRequire: false,//提交时是否必须添加行程
      },//差旅申请单提交时检验控制量
      isShowModal: false,//是否显示统一订票弹框
      maxFlight: {},//最大机票数接口返回数据
      maxHotel: {},//最大房间数接口返回数据
      randomHotel:false,//随机生成酒店合住人
      isFlight: true,//是否使用飞机统一订票
      isTrain: true,//是否使用火车统一订票
      isHotel: true,//是否使用酒店统一订票
      percent: 0,//预算校验进度数值
      budgeting: false,//是否弹框提示预算校验进度
      totalBudget: 0,//差旅总金额
      total: 0,//差补总金额
      amount: 0,//预算明细总金额
      haveClear: false,//是否清空差补
      isHaveRoute: false,//是否有行程存在
      defaultRelativeApplication: undefined, //默认关联申请单
      referenceApplicationOID: '', //关联申请单OID
      approvalHistory: [], //审批历史
      isHaveSubsidyRules:false,//是否设置了差补规则
      subsidyRulesFieldOID:[],//设置了差补规则的fieldOID
      signEnable: false, //是否可以加签
      formIsChange:false,//表单是否已经改动且未保存
      currentCodeType:this.props.company.baseCurrency,//当前总金额币种
      isShowRangePicker: false, //是否展示日期连选
      travelElement:false,
      travelElementsList:[],
      travelItinerarys:[],
      manageType:false,
      dateChage: true,
      signCompanyOIDs:[],//加签人公司范围
    };
    this.state.copyDefaultValues.checkedChange = this.checkedChange;
    this.state.copyDefaultValues.expectStopDate = this.expectStopDate;
  };

  //formValueOID 编辑状态表单的key值设置

  /**
   * 预计停用日期的回调函数
   * @param isSet 是否设置了预计停用日期
   * @param closeDate 设置的具体日期
     */
  expectStopDate = (isSet, closeDate) =>{
    this.isSetCloseEnabled = isSet;
    this.closeDate = closeDate;
  }

  /**
   * 部分表单控件value值变化监听函数
   * @param field 表单项
   * @param value 控件value值（某一个对象的某一个属性值），
   * @param allValue 控件完整值（整个对象或者数组）
     */
  checkedChange = (field,value,allValue) => {
    let copy = this.state.copyDefaultValues;
    copy.map(res=>{
      if((res.messageKey === field.messageKey) && (res.fieldOID === field.fieldOID) && (field.messageKey === 'select_cost_center' || field.messageKey === 'select_department')){
        res.showName = allValue;
        res.value = value;
      }
    });
    this.setState({copyDefaultValues:copy});

    //申请人改变
    if (field.messageKey === 'applicant' && this.state.formType !== 2001) {
      // 单独处理
      this.isReplace = true;
      //参数中使用{value：data.value},而不是直接使用 data，是因为data是数组copyDefaultValue的一个项，当该项
      //被更新后，传入的值也就改变了，即会出现传入时是a,某一时刻就变成copyDefaultValue更新后的值b了
      this.soveApplicant({value}, {value: this.state.copyDefaultValues[0].value}, true);
      if (this.state.total > 0)
        this.clearSubsidy();
      //更新副本中的默认值
      this.updateCopyDefaultValue(0, {value});
    }
  };

  componentWillMount() {
    if (this.props.match.params.applicantOID && this.props.match.params.applicantOID !== ':applicantOID') {
      baseService.changeLoginInfo(this.props.match.params.applicantOID).then(() => {

      }).catch(() => {
        message.error(this.$t('login.error')); //呼，服务器出了点问题，请联系管理员或稍后再试:(
      });
    }
  }

// 获取间隔天数
 getDays = (day1, day2) => {
    let travelItinerarys = [];
  // 获取入参字符串形式日期的Date型日期
   let strArr = day1.split('-');
   let d1 = new Date(strArr[0], strArr[1] - 1, strArr[2]);
   let strArr2 = day2.split('-');
   let d2 = new Date(strArr2[0], strArr2[1] - 1, strArr2[2]);
  // 定义一天的毫秒数
   let dayMilliSeconds  = 1000*60*60*24;

  // 获取输入日期的毫秒数
   let d1Ms = d1.getTime();
   let d2Ms = d2.getTime();

  // 定义返回值
   let ret=[];

  // 对日期毫秒数进行循环比较，直到d1Ms 大于等于 d2Ms 时退出循环
  // 每次循环结束，给d1Ms 增加一天
  for (d1Ms; d1Ms <= d2Ms; d1Ms += dayMilliSeconds) {

    // 如果ret为空，则无需添加","作为分隔符
    if (!ret) {
      // 将给的毫秒数转换为Date日期
      let day = new Date(d1Ms);

      // 获取其年月日形式的字符串
      ret = moment(day).format('YYYY-MM-DD');
    } else {

      // 否则，给ret的每个字符日期间添加","作为分隔符
      let day = new Date(d1Ms);
      ret.push(moment(day).format('YYYY-MM-DD'));
      travelItinerarys.push({
        itineraryDate: moment(day).utc().format(),
        travelElements: [],
        travelItineraryTraffics:[]
      })
    }
  }

  //存入已经选好存在的时间段的行程
   travelItinerarys.map((item, index) => {
     //moment(item.itineraryDate).format('YYYY-MM-DD')
     this.state.travelItinerarys.map((oldItem, oldIndex) => {
       if (moment(item.itineraryDate).format('YYYY-MM-DD') === moment(oldItem.itineraryDate).format('YYYY-MM-DD')) {
         travelItinerarys[index] = this.state.travelItinerarys[oldIndex]
       }
     })
   });
  this.setState({
    dateChage:false,
    travelItinerarys:travelItinerarys
  },()=>{
    this.setState(({
      dateChage:true,
    }))
  });
  // alert(ret); // 或可换为return ret;
}


  //日期连选控件打开或者关闭的时候的回调
  checkedOk = (field,value) => {
    this.canGo = false;
    let formInfo = this.props.match.params.applicationOID ? this.state.info : this.state.formInfo;
    let copy = this.state.copyDefaultValues;
    let startDate = null;
    let endDate = null;
    setTimeout(()=>{
      //value为false表示关闭日期弹框
      if (!value && field.value) {
        startDate = field.value.split('\"')[1];
        endDate = field.value.split('\"')[3];
        if (field.enableTime) {
          startDate = moment(startDate).second(0).utc().format();
          endDate = moment(endDate).second(0).utc().format();
        } else {
          startDate = moment(startDate).format('YYYY-MM-DD');
          endDate = moment(endDate).format('YYYY-MM-DD');
        }

        if (this.isSetCloseEnabled) {
          this.closeDate = moment(endDate).add(this.closeDay, 'days');
        }

        //赋值到start_date,end_date控件
        if (this.props.match.params.applicationOID) {
          this.refreshRangeDate(formInfo.custFormValues, startDate, endDate);
          this.setState({
            info:formInfo
          }, () => {
            this.judgeDateChange(startDate, endDate);
          });
        } else {
          this.canGo = true;
          this.refreshRangeDate(copy, startDate, endDate);
          this.refreshRangeDate(formInfo.customFormFields, startDate, endDate);
          this.setState({
            formInfo:formInfo,
            copyDefaultValues:copy
          });
          this.getDays(startDate,endDate)
        }
      }
    },500);
  };

  //校验日期是否有变化，如果变化了是否弹窗提示删差补，只适用ranger_picker的情况
  judgeDateChange = (startDate, endDate) => {
    let formInfo = this.state.info;
    let isChange = false;//日期是否变化
    let isShowModal = false;//是否需要弹框提示
    if (this.props.match.params.applicationOID) {
      formInfo.custFormValues.map((item, index) => {
        if (item.messageKey === 'start_date' || item.messageKey === 'end_date') {
          let baseStartData = this.state.copyDefaultValues[index];
          if ( baseStartData && baseStartData.value !== item.value) {
            isChange = true;
            //增加旧差旅行程提示
            if(this.state.isHaveRoute || !this.state.manageType){
              isShowModal = true;
            }
          }
        }
      });
    }
    if (isShowModal) {
      let currentKey = 'virtual_range_picker';
      let isHaveSubsidy = this.state.total > 0;
      let fieldStr = this.$t('itinerary.form.component.range.picker')/*'出差往返日期'*/;
      let mesStr = this.$t('itinerary.form.change.about.travel.field.tip',{fieldName: fieldStr})/*'可能导致行程与出差日期不匹配'*/;
      this.baseModalShowForRangeDateChange(isHaveSubsidy ? this.$t('itinerary.form.change.about.subsidy.field.tip',{fieldName: fieldStr})/*'更改时间将清空已添加差补'*/ : '', mesStr, currentKey, startDate, endDate);
    } else {
      if (isChange) {
        let copy = this.state.copyDefaultValues;
        this.refreshRangeDate(copy, startDate, endDate);
        this.setState({
          formIsChange:true,
          copyDefaultValues:copy
        }, () => {
          this.canGo = true;
        });
      } else {
        this.canGo = true;
      }
      this.getDays(startDate,endDate)
    }
  };

  //连选日期变更后刷新date数据
  refreshRangeDate = (values, startDate, endDate) => {
    values.map(res=>{
      if(res.messageKey === 'start_date'){
        res.value = startDate;
      }
      if(res.messageKey === 'end_date'){
        res.value = endDate;
      }
    });
  };

  componentDidMount() {
    this.getFormInfo();
    this.isCounterSignEnable();

    let sub = this.state.subsidyCtrl;
    //是否进行预算校验
    //sub.isBudgetCheck = this.props.profile['travel.budget.check'];
    //是否必须添加行程
    //sub.itineraryRequire = this.props.profile['ta.itinerary.required'] ? this.props.profile['ta.itinerary.required'] : false;
    this.setState({subsidyCtrl: sub});
  };

  //检查差旅申请单配置的差补规则中影响差补的表单项
  checkedIsSetSubsidyRule = (res) =>{
    let maps = res.data.customFormPropertyMap;
    if(!maps){
      return;
    }
    let subsidyDimension = maps['travel.subsidies.dimension'] ? JSON.parse(maps['travel.subsidies.dimension']) : false;
    if(subsidyDimension){
      if(subsidyDimension.formFieldOIDs && subsidyDimension.formFieldOIDs.length > 0){
        this.setState({
          isHaveSubsidyRules:true,
          subsidyRulesFieldOID:subsidyDimension.formFieldOIDs
        })
      }
    }
  }

  /**
   * 监听差补规则中配置的影响差补的表单项
   * @param cust 表单项数组
   * @param isEditing 是否是编辑状态
     */
  subsidyRulesListener = (cust, isEditing) =>{
    if(this.state.isHaveSubsidyRules){
      cust.map((item, index) => {
        this.state.subsidyRulesFieldOID.map(oid =>{
          if (item.fieldOID === oid) {
            let baseStartData = this.state.copyDefaultValues[index];
            if ( isEditing && baseStartData && baseStartData.value !== item.value && this.canGo && this.state.total > 0) {
              if(this.state.isHaveRoute && this.state.total > 0){
                this.canGo = false;
                let currentKey = item.formValueOID;
                this.baseModalShow(this.$t('itinerary.form.change.about.subsidy.field.tip',{fieldName:item.fieldName})/*`更改${item.fieldName}将清空已添加差补`*/,'', baseStartData, currentKey, index, item, true);
              }else{
                this.updateCopyDefaultValue(index, item);
              }
            }
          }
        })
      })
    }
  }

  componentWillReceiveProps() {
    let isEditing = !!this.props.match.params.applicationOID;
    let values = this.props.form.getFieldsValue();
    let cust = [];
    let custFormValues = isEditing ? this.state.info.custFormValues : this.state.formInfo.customFormFields;
    if (this.state.formType === 2001) {
      if (custFormValues) {
        cust = this.getCustFormValues(values);
      }
      let amount = 0;
      this.subsidyRulesListener(cust, isEditing);
      cust.map((item, index) => {
        if (item.messageKey === "budget_detail") {
          amount = item.value ? JSON.parse(item.value).amount : 0;
          this.setState({
            amount: amount,
            totalBudget: this.state.total + amount
          });
        }
        if (item.messageKey === 'start_date') {
          let endDateValue = travelUtil.getFormHeadValue(cust,'end_date');
          item.endDate = endDateValue;
          let baseStartData = this.state.copyDefaultValues[index];
          if ( isEditing && baseStartData && baseStartData.value !== item.value && this.canGo) {
            if(this.state.isHaveRoute){
              this.canGo = false;
              let currentKey = item.formValueOID;
              let isHaveSubsidy = this.state.total > 0 ? true : false;
              let mesStr = this.$t('itinerary.form.change.about.travel.field.tip',{fieldName:item.fieldName})/*'可能导致行程与出差日期不匹配'*/;
              this.baseModalShow(isHaveSubsidy ? this.$t('itinerary.form.change.about.subsidy.field.tip',{fieldName:item.fieldName})/*'更改时间将清空已添加差补'*/ : '', mesStr, baseStartData, currentKey, index, item);
            }else{
              this.updateCopyDefaultValue(index, item);
            }
          }
        }
        if (item.messageKey === 'end_date') {
          let startDateValue = travelUtil.getFormHeadValue(cust,'start_date');
          item.startDate = startDateValue;
          let baseStartData = this.state.copyDefaultValues[index];
          if ( isEditing && baseStartData && baseStartData.value !== item.value && this.canGo) {
            if(this.state.isHaveRoute){
              this.canGo = false;
              let currentKey = item.formValueOID;
              let isHaveSubsidy = this.state.total > 0 ? true : false;
              let mesStr = this.$t('itinerary.form.change.about.travel.field.tip',{fieldName:item.fieldName})/*'可能导致行程与出差日期不匹配'*/;
              this.baseModalShow(isHaveSubsidy ? this.$t('itinerary.form.change.about.subsidy.field.tip',{fieldName:item.fieldName})/*'更改时间将清空已添加差补'*/ : '', mesStr, baseStartData, currentKey, index, item);
            }else{
              this.updateCopyDefaultValue(index, item);
            }
          }
        } else if (item.messageKey === 'select_participant') {//参与人员
          let baseStartData = this.state.copyDefaultValues[index];
          if ( isEditing && baseStartData && (baseStartData.value !== item.value) && this.canGo) {
            if(this.isReplace){
              this.updateCopyDefaultValue(index,item,true);
            }else{
              if(this.state.isHaveRoute && this.state.total > 0){
                this.canGo = false;
                let currentKey = item.formValueOID;
                this.baseModalShow(this.$t('itinerary.form.change.participant.tip')/*'更改参与人员将清空已添加差补'*/,'', baseStartData, currentKey, index, item);
              }else {
                this.updateCopyDefaultValue(index, item);
              }
            }
          }
        } else if (item.messageKey === 'applicant') {//申请人 改动
          let baseStartData = this.state.copyDefaultValues[index];
          if (baseStartData && baseStartData.value !== item.value && this.canGo) {
            this.canGo = false;
            let isInParticipant = false;//原申请人是否在参与人中
            let participant = travelUtil.getFormHeadValue(cust,'select_participant');//获取参与人数据
            if(participant){
              participant.map(p => {//遍历参与人看原申请人是否在其中
                if(baseStartData.value === p.userOID){
                  isInParticipant = true;
                }
              })
            }
            if(isInParticipant){//原申请人在参与人员中-->弹框提示
              let currentKey = isEditing ? item.formValueOID : item.fieldOID;
              let tipMessage = isEditing && this.state.total > 0 ? this.$t('itinerary.form.change.participant.tip')/*'更改参与人员将清空已添加差补'*/: '';
              this.baseModalShow(this.$t('request.edit.modal.application.change.info')/*'新的申请人将替换原参与人员中的默认数据'*/, tipMessage, baseStartData, currentKey, index, item);
            }else{//原申请人不在参与人员，中直接修改申请人
              this.updateCopyDefaultValue(index, item);
              this.soveApplicant(item, {value:baseStartData.value}, false);//根据申请人修改对应默认值
            }
           }
        }
      });
    }
  };

  //修改申请人
  handleApplicantChange = (field, applicantOID) => {
    this.setState({ loading: true });
    baseService.changeLoginInfo(applicantOID).then(() => {
      requestService.getFormValue(this.props.user.userOID, this.props.match.params.formOID).then(res => {
        this.setState({
          loading: false,
          formDefaultValue: res.data
        }, () => {
          this.props.form.resetFields()
        })
      })
    }).catch(() => {
      location.href = '/';
      message.error(this.$t('login.error')); //呼，服务器出了点问题，请联系管理员或稍后再试:(
    })
  };

  //差旅申请单申请人更改
  soveApplicant = (newField, data, isReplace) => {
    travelService.getPrincipalsInfo(newField.value).then(res=>{
      if(this.state.currentCodeType !== res.data.currencyCode){
        this.setState({currentCodeType:res.data.currencyCode});
        this.noChangePar = true;
      }else{
        this.noChangePar = false;
      }
    });
    let status = this.props.match.params.applicationOID ? 'edit' : 'create';
    let custFormValues = status === 'edit' ? this.state.info.custFormValues : this.state.formInfo.customFormFields;
    let formOID = status === 'edit' ? this.props.match.params.formOID : this.state.formInfo.formOID;
    travelUtil.setDefaultFormUtil(status, custFormValues, newField, formOID, data, this.executeCall, isReplace);
  };

  //更新复制默认值
  updateCopyDefaultValue = (index, newField, replace) =>{
    this.setState({formIsChange:true});
    let copy = this.state.copyDefaultValues;
    copy.map(res =>{
      if(res.messageKey === newField.messageKey){
        res.value =  newField.value;
      }
    });
    this.setState({copyDefaultValues: copy, formIsChange:true}, ()=> {
      this.canGo = true;
      replace && (this.isReplace = false);
    });
  }

  baseModalShow = (mes, sage, data, currentKey, index, newField, isSubsidyRule) => {
    Modal.confirm({
      title: this.$t('itinerary.form.tips')/*'提示'*/,
      content: <div>
        <p>{mes}</p>
        <p>{sage}</p>
      </div>,
      okText: this.$t('itinerary.form.change.modal.alter')/*'更改'*/,
      cancelText: this.$t('itinerary.type.slide.and.modal.cancel.btn')/*'取消'*/,
      onOk: ()=> {
        if(data.messageKey === 'applicant'){//更改的是申请人    参与人要替换掉；成本中心，公司，部门都改默认值
          // 单独处理
          this.isReplace = true;
          //参数中使用{value：data.value},而不是直接使用 data，是因为data是数组copyDefaultValue的一个项，当该项
          //被更新后，传入的值也就改变了，即会出现传入时是a,某一时刻就变成copyDefaultValue更新后的值b了
          this.soveApplicant(newField, {value:data.value}, true);
        }
        if (this.state.total > 0)
          this.clearSubsidy();
        //更新副本中的默认值
        this.updateCopyDefaultValue(index,newField);
      },
      onCancel: ()=> {
        let setData = {};
        let defaultValues = this.state.defaultValues;
        let formInfo = this.state.formInfo;
        if(isSubsidyRule){
          setData[currentKey] = customField.getDefaultValue(data,data.initValue);
        }else{
          setData[currentKey] = travelUtil.changeValueUtil(data);
        }
        if(!!this.props.match.params.applicationOID){
          defaultValues[index].value = this.state.copyDefaultValues[index].value;
        }
        formInfo['customFormFields'][index].value = this.state.copyDefaultValues[index].value;
        this.props.form.setFieldsValue(setData);
        this.setState({
          defaultValues: defaultValues,
          formInfo:formInfo
        }, ()=> {
          this.canGo = true;
        });
      },
    });
  };

  baseModalShowForRangeDateChange = (mes, sage, currentKey, startDate, endDate) => {
    Modal.confirm({
      title: this.$t('itinerary.form.tips')/*'提示'*/,
      content: <div>
        <p>{mes}</p>
        <p>{sage}</p>
      </div>,
      okText: this.$t('itinerary.form.change.modal.alter')/*'更改'*/,
      cancelText: this.$t('itinerary.type.slide.and.modal.cancel.btn')/*'取消'*/,
      onOk: ()=> {
        if (this.state.total > 0)
          this.clearSubsidy();
        let copy = this.state.copyDefaultValues;
        this.refreshRangeDate(copy, startDate, endDate);
        this.getDays(startDate,endDate);
        this.setState({
          formIsChange:true,
          copyDefaultValues:copy
        }, () => {
          this.canGo = true;
        });
      },
      onCancel: ()=> {
        let copy = this.state.copyDefaultValues;
        let oldStartDate = null;
        let oldEndDate = null;
        let setData = {};
        copy.map(item => {
          if (item.messageKey === 'start_date') {
            oldStartDate = item.value;
          }
          if (item.messageKey === 'end_date') {
            oldEndDate = item.value;
          }
        });
        if (this.isSetCloseEnabled) {
          this.closeDate = moment(oldEndDate).add(this.closeDay, 'days');
        }
        let defaultValues = this.state.defaultValues;
        let formInfo = this.state.info;
        this.refreshRangeDate(formInfo.custFormValues, oldStartDate, oldEndDate);
        formInfo.custFormValues.map((custFormValue, index) =>{
          if (custFormValue.messageKey === 'range_picker') {
            custFormValue.showValue = [moment(oldStartDate), moment(oldEndDate)];
            defaultValues[index].showValue = [moment(oldStartDate), moment(oldEndDate)];
            setData[currentKey] = [moment(oldStartDate), moment(oldEndDate)];
          }
        });
        this.props.form.setFieldsValue(setData);
        this.setState({
          defaultValues: defaultValues,
          info:formInfo
        }, () => {
          this.canGo = true;
        });
      },
    });
  };

  //处理差旅单的日期连选
  //type 新建create 编辑edit
  processTravelDate = (applicationData, type) => {
    if (applicationData.formType === 2001) {
      let rangePicker = {
        messageKey: 'range_picker',
        fieldOID: travelUtil.generateUid(),
        fieldName: this.$t('itinerary.form.component.range.picker')/*'出差往返日期'*/,
        fieldType: 'TEXT',
        enableTime: false,
        defaultValueTime: [], //启用时间的默认值
        required: true,
        sequence: null,
        value: null
      }
      let hasStartEndDate = 0;
      let startDate = null;
      let endDate = null;
      let enableStartDateTime = false; //开始日期启用时间
      let enableEndDateTime = false; //结束日期启用时间
      if (type === 'create') {
        applicationData.customFormFields.map((field) => {
          if (field.messageKey === 'start_date') {
            rangePicker.sequence = field.sequence;
            enableStartDateTime = this.processEnableTime(field);
            rangePicker.defaultValueTime.push(this.processDefaultTime(field));
            hasStartEndDate++;
          }
          if (field.messageKey === 'end_date') {
            enableEndDateTime = this.processEnableTime(field);
            rangePicker.defaultValueTime.push(this.processDefaultTime(field));
            hasStartEndDate++;
          }
        });
        if (hasStartEndDate === 2) {
          if (enableStartDateTime && enableEndDateTime) {
            rangePicker.enableTime = true;
          }
          applicationData.customFormFields.push(rangePicker);
          this.setState({isShowRangePicker: true}, () => {
            this.processDisableTime(applicationData, type);
          });
        }
      }
      if (type === 'edit') {
        applicationData.custFormValues.map((field) => {
          if (field.messageKey === 'start_date') {
            rangePicker.sequence = field.sequence;
            startDate = field.value;
            enableStartDateTime = this.processEnableTime(field);
            hasStartEndDate++;
          }
          if (field.messageKey === 'end_date') {
            endDate = field.value;
            enableEndDateTime = this.processEnableTime(field);
            hasStartEndDate++;
          }
        });
        if (hasStartEndDate === 2) {
          if (enableStartDateTime && enableEndDateTime) {
            rangePicker.enableTime = true;
          }
          rangePicker.formValueOID = 'virtual_range_picker';
          rangePicker.showValue = [moment(startDate), moment(endDate)];
          applicationData.custFormValues.push(rangePicker);
          this.setState({isShowRangePicker: true}, () => {
            this.processDisableTime(applicationData, type);
          });
        }
      }
    }
  };

  //处理是否停用日期
  //type 新建create 编辑edit
  processDisableTime = (applicationData, type) => {
    //新建时的处理
    if (applicationData.customFormProperties.enabled === 1 && type === 'create') {  //是否和停用启用有关
      this.isSetCloseEnabled = true;
      this.closeDay = applicationData.customFormProperties.closeDay;
      let date = new Date();
      this.closeDate = moment(date).add(this.closeDay, 'days');
    }
    //编辑时的处理
    if (applicationData.closeEnabled && type === 'edit') {
      this.isSetCloseEnabled = true;
      this.closeDay = applicationData.customFormProperties.closeDay;
      if (applicationData.closeDate) {
        this.closeDate = moment(applicationData.closeDate);
      }
    }
  };

  //处理是否启用时间
  processEnableTime = (field) => {
    let enableTime = false;
    if (field.fieldConstraint && JSON.parse(field.fieldConstraint) && JSON.parse(field.fieldConstraint).enableTime) {
      enableTime = true;
    }
    return enableTime;
  };
  //处理启用时间默认值
  processDefaultTime = (field) => {
    let defaultTime = null;
    if (field.fieldConstraint && JSON.parse(field.fieldConstraint) && JSON.parse(field.fieldConstraint).defaultTime) {
      defaultTime = moment(moment(JSON.parse(field.fieldConstraint).defaultTime).format('HH:mm'), 'HH:mm');
    }
    return defaultTime;
  };

  //详情页设置申请人控件不可更改
  setApplicantDisable = (fields) =>{
    fields.map(item => {
      if (item.messageKey === 'applicant') {
        item.isReadOnly = true;
      }
    });
  };

  //获取表单配置
  getFormInfo = () => {
    this.setState({loading: true});
    requestService.getCustomForm(this.props.match.params.formOID).then(res => {
      this.customFormFieldsOrigin = JSON.parse(JSON.stringify(res.data));
      this.setApplicantDisable(res.data.customFormFields);
      res.data.customFormFields.sort((a, b) => a.sequence > b.sequence || -1);//wjk add 180523
      !this.props.match.params.applicationOID && this.copyDefaultCust(res,'create');
      this.checkedIsSetSubsidyRule(res);//wjk add 18 06 01
      this.setState({
        loading: !!this.props.match.params.applicationOID,
        formInfo: res.data,
        formType: res.data.formType,
        currentCodeTyp:this.props.company.baseCurrency,
        manageType:res.data.customFormProperties.manageType
      },() => {
        const { formType, formInfo } = this.state;
        if (this.props.match.params.applicationOID) {
          this.getInfo(formType)
        } else {
          this.getFormDefaultValue()
        }
      })
    })
  };

  //获取表单默认值
  getFormDefaultValue = () => {
    let userOID = this.props.user.userOID;
    if (this.props.match.params.applicantOID && this.props.match.params.applicantOID !== ':applicantOID') {
      userOID = this.props.match.params.applicantOID;
    }
    requestService.getFormValue(userOID, this.props.match.params.formOID).then(res => {
      this.setState({
        loading: false,
        formDefaultValue: res.data
      })
    })
  };

  executeCall = (currentUpdate, budgetDetailKey) => {
    currentUpdate.map(item => {
      this.props.form.setFieldsValue(item);
    });
    if(budgetDetailKey && this.noChangePar){
      this.props.form.setFieldsValue({[budgetDetailKey]:null});
    }
  };

  //获取申请单详情
  getInfo = () => {
    //formType：2001（差旅申请）、2002（费用申请）、2003（订票申请）、2004（京东申请）、2005（借款申请）
    const {applicationOID} = this.props.match.params;
    requestService.getRequestDetail(applicationOID).then(res => {
      //代提逻辑
      if (this.props.user.userOID !== res.data.applicantOID) {
        baseService.changeLoginInfo(res.data.applicantOID);
      }
      this.setApplicantDisable(res.data.custFormValues);
      //wjk add 排序只需拿到数据之后排一次，render函数中排序，会排序多次，同等优先级项排序结果会不同
      res.data.custFormValues.sort((a, b) => a.sequence > b.sequence || -1);
      this.setState({
        loading: false,
        info: res.data,
        approvalHistory: res.data.approvalHistorys || [],
        defaultValues: res.data.custFormValues,
        currentCodeType: res.data.currencyCode ? res.data.currencyCode : this.props.company.baseCurrency,
        referenceApplicationOID: res.data.referenceApplicationOID,
        travelItinerarys: res.data.travelApplication&&(res.data.travelApplication.travelItinerarys || []),
      });
      this.copyDefaultCust(res,'edit');//wjk add 备份默认值
    })
  };

  //判断是否可以加签
  isCounterSignEnable = () => {
    let params = {
      companyOID: this.props.company.companyOID,
      formOID: this.props.match.params.formOID,
      counterSignType: 'enableAddSignForSubmitter',
    };
    approveRequestService.postAddSignEnableScope(params).then(res =>{
      // this.setState({ signEnable: res.data });
      if (res.data.enabled) {
        //加签人范围
        this.setState(
          {
            signEnable: res.data.enabled,
            signCompanyOIDs: res.data.approvalAddSignScope.companyOIDs
          }, () => {
          });
      }
    })
  };

  /**
   * 备份默认值，做修改参照基准
   * @param res
   * @param status 表单状态 edit create
     */
  copyDefaultCust = (res, status) => {
    let dev = [];
    dev.checkedChange = this.checkedChange;//设置监听
    dev.expectStopDate = this.expectStopDate;//设置监听
    dev.applicationData = res.data;//差旅、费用申请单需要根据配置设置预计停用日期
    //添加更改状态单子不可编辑 部门，成本中心，申请人，参与人
    if(res.data.sourceApplicationOID){
      res.data.custFormValues = travelUtil.setDisabledValues(res.data.custFormValues);
    }
    if(!this.props.match.params.applicationOID && status === 'create'){
      res.data.customFormFields.map(m => {
        dev.push({
          value: m.value,
          messageKey: m.messageKey,
          fieldOID: m.fieldOID,
          fieldName:m.fieldName,
          required:m.required,
          formType:this.state.formType,
          showName:{name:m.showValue},
          dataSource:m.dataSource
        });
      });
      this.setState({copyDefaultValues: dev});
    }else if(status === 'edit'){
      res.data.custFormValues.map(m => {
        dev.push({
          value: m.value,
          messageKey: m.messageKey,
          formValueOID: m.formValueOID,
          fieldOID: m.fieldOID,
          fieldName:m.fieldName,
          required:m.required,
          formType:this.state.formType,
          showName:{name:m.showValue},
          initValue:{value:m.value,name:m.showValue},
          showValue:m.showValue,
          dataSource:m.dataSource
        });
      });
      this.setState({copyDefaultValues: dev});
    }
  };

  //获取保存、提交申请单时的custFormValues
  getCustFormValues = (values) => {
    let custFormValues = this.props.match.params.applicationOID ? this.state.info.custFormValues : this.state.formInfo.customFormFields;
    custFormValues.map(item=> {
      Object.keys(values).map(key => {
        if (key === item.fieldOID || key === item.formValueOID) {
          item = customField.formatFormValue(item, values[key]);
        }
      })
    });
    return custFormValues
  };

  //保存／提交前处理单据数据
  processValues = (params) => {
    //新建的时候的特殊处理
    if (!this.props.match.params.applicationOID) {
      params.remark = ''; //新建时要把表单带出的remark清空，这不是单据的remark
    }
  }

  //提交前检查组合控件的表单值验证,异步方法
  submitSaveValidateCombinationForm(){
    let customFormFields = this.props.match.params.applicationOID ? this.state.info.custFormValues : this.state.formInfo.customFormFields;
    let isHaveValidate=false;
    let needValidateForms = ['venMasterSwitch', 'linkage_switch'];
    customFormFields && customFormFields.map(item=>{
      if(~needValidateForms.indexOf(item.messageKey)){
        let info=this.props.form.getFieldValue(!isEdit ? item.fieldOID : item.formValueOID);
        if(info){
          info.callBackSubmit=!info.callBackSubmit;
          this.props.form.setFieldsValue({[!isEdit ? item.fieldOID : item.formValueOID]:info})
          isHaveValidate=true;
        }
      }
    });
    return isHaveValidate;
  }
  //组合表单验证结果
  combinationFormValidateResult(){
    let customFormFields = this.props.match.params.applicationOID ? this.state.info.custFormValues : this.state.formInfo.customFormFields;
    let isPassValid=true;
    let needValidateForms = ['venMasterSwitch', 'linkage_switch'];
    customFormFields && customFormFields.map(item=>{
      if(~needValidateForms.indexOf(item.messageKey)){
        let info=this.props.form.getFieldValue(!isEdit ? item.fieldOID : item.formValueOID);
        if(info){
          isPassValid= !isPassValid || info.isPassValid;
        }
      }
    });
    return isPassValid;
  }

  //保存&提交前验证custFormValues
  custFormValuesValidate = (custFormValues) => {
    let isOk = true;
    //校验开始日期是否小于结束日期
    let startDateValue = null;
    let endDateValue = null;
    custFormValues.map(item => {
      if (item.messageKey === 'start_date') {
        startDateValue = item.value;
      }
      if (item.messageKey === 'end_date') {
        endDateValue = item.value;
      }
    });
    if (startDateValue && endDateValue && moment(startDateValue).isAfter(endDateValue)) {
      message.error(this.$t('request.detail.travel.dateError'));//开始时间不能晚于结束时间
      isOk = false;
    }
    return isOk;
  };
  //保存
  handleSave = () => {
    if (this.submitSaveValidateCombinationForm()) {
      //组合子表单验证信息传递需要时间
      setTimeout(this.delayHandleSave, 10)
    }
    else {
      this.delayHandleSave();
    }
  };
  //处理保存
  delayHandleSave = () =>{
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!this.combinationFormValidateResult()){
        return;
      }
      if (!err) {
        //formType：2001（差旅申请）、2002（费用申请）、2003（订票申请）、2004（京东申请）、2005（借款申请）
        const { info, formInfo, formType, referenceApplicationOID,travelItinerarys } = this.state;
        let params = this.props.match.params.applicationOID ? JSON.parse(JSON.stringify(info)) : JSON.parse(JSON.stringify(formInfo));
        params.custFormValues = this.getCustFormValues(values, true);
        if(!this.custFormValuesValidate(params.custFormValues)){
          return;
        }
        params.applicant = null;
        params.referenceApplicationOID = referenceApplicationOID;
        params.countersignApproverOIDs = this.props.form.getFieldsValue().addSign;
        this.processValues(params);

        this.setState({saveLoading: true});
        if (formType === 2001) {// wjk add 18 04 16 差旅保存分支
          this.toSaveTravelRequest(params, 'save');
          return;
        }
        let getType =
          formType === 2002 ? 'saveExpenseRequest' :
            formType === 2003 ? 'saveBookerRequest' :
              formType === 2005 ? 'saveLoanRequest' : '';
        requestService[getType](params).then(() => {
          this.setState({saveLoading: false});
          message.success(this.$t('common.save.success', {name: ''}));
          this.goBack()
        }).catch(e => {
          this.setState({saveLoading: false});
          let error = e.response.data;
          if (error.validationErrors && error.validationErrors.length) {
            message.error(`${this.$t('common.save.filed')}，${error.validationErrors[0].message}`)
          } else {
            message.error(`${this.$t('common.save.filed')}，${error.message}`)
          }
        })
      }
    });
  }

  /**
   * 差旅申请单保存/提交
   * @param params 对象  提交、保存的参数
   * @param type 字符串 区分保存还是提交类型 ‘save’or ‘submit’
   */
  toSaveTravelRequest = (params, type) => {
    let partiOid = "";
    let indexOf = 0;
    let formVs = params.custFormValues;
    let currentStatus = this.props.match.params.applicationOID ? 'edit' : 'create';
    let isCanSubmit = travelUtil.customFormChecked(formVs);
    if(!isCanSubmit){
      this.setState({loading: false, saveLoading: false, submitLoading: false});
      return;
    }
    formVs.map((cus, index) => {//通过messageKey拿到对应表单的key，applicationOID存在为编辑状态
      if (cus.messageKey === "select_participant") {
        partiOid = this.props.match.params.applicationOID ? cus.formValueOID : cus.fieldOID;
        indexOf = index;
      }
    });
    if(this.isSetCloseEnabled){//设置自动停用日期
      params.closeEnabled = 1;
      params.closeDate = this.closeDate;
    }
    let isSetSelectParticipant = false;//是否配置了参与人字段，如果配置了需要校验
    params.custFormValues.map(item =>{
      if(item.messageKey === 'select_participant'){
        isSetSelectParticipant = true;
      }
    });
    if(isSetSelectParticipant){
      this.setState({loading: true});
      travelService.travelValidate(params,this.props.language,this.customFormFieldsOrigin).then(res => {//参与人权限校验
        let partis = this.props.form.getFieldValue(partiOid);
        let showName = "";
        res.data.map(item => {
          if (item.errorDetail) {
            showName = `${showName} ${item.fullName}`;
          }
        });
        if (showName) {
          //弹框提示是否删除不在权限内的参与人
          if(this.state.info.sourceApplicationOID){
            this.setState({saveLoading: false, loading: false, submitLoading: false});
            Modal.warn({
              title: this.$t('itinerary.form.tips')/*'提示'*/,
              content: <div>
                <p>{this.$t('itinerary.form.submit.power.noChange.tip',{names:showName})/*{showName}不符合数据权限，请检查或联系系统管理员*/}</p>
              </div>,
              okText: this.$t('itinerary.type.slide.and.modal.cancel.btn')/*'取消'*/,
            });
          }else{
            Modal.confirm({
              title: this.$t('itinerary.form.tips')/*'提示'*/,
              content: <div>
                <p>{this.$t('itinerary.form.submit.power.tip',{names:showName})/*{showName}不在可选人员范围内。是否删除以上人员？*/}</p>
                { this.state.total>0 && <p style={{fontSize:12}}>{this.$t('itinerary.form.submit.power.clear.tip')/**更改参与人将清空差补，您要重新添加差补**/}</p>}
              </div>,
              okText: this.$t('common.delete')/*删除*/,
              cancelText: this.$t('itinerary.type.slide.and.modal.cancel.btn')/*'取消'*/,
              onOk: ()=> this.deletePartis(res, partis, params, type, currentStatus),
              onCancel: () => {this.setState({saveLoading: false, loading: false, submitLoading: false});}
            });
          }
        } else {
          this.travelParams = params;
          this.cancelDelPartis(params, type, currentStatus);//如果参与人员都符合权限，不弹框默认走取消弹框函数。
        }
      }).catch(err => {
        this.setState({saveLoading: false, loading: false, submitLoading: false});
        let error = err.response.data;
        if (error.validationErrors && error.validationErrors.length) {
          if(error.validationErrors[0].externalPropertyName){
            switch (error.validationErrors[0].externalPropertyName) {
              case '2010': //申请人为空
                message.error(this.$t('itinerary.form.submit.applicant.null'));
                break;
              case '2011': //部门为空
                message.error(this.$t('itinerary.form.submit.department.null'));
                break;
              case '2012': //成本中心为空
                message.error(this.$t('itinerary.form.submit.constCenter.null'));
                break;
              default: message.error(this.$t('finance.view.search.errorAdmin'));
            }
          }
        } else {
          message.error(`${this.$t('common.save.filed')}，${error.message}`)
        }
      })
    }else{
      this.travelParams = params;
      this.cancelDelPartis(params, type, currentStatus);
    }
  };

  //进度条数值控制器
  percentPlus = ()=> {
    this.percentNum = this.percentNum + 9;
    this.setState({percent: this.percentNum});
    if (this.percentNum <= 99) {
      setTimeout(this.percentPlus, 10);
    }
  };

  /**
   * 保存和提交的流程
   * @param params 保存和提交的结构体数值
   * @param type   区分保存(save)还是提交(submit)动作
   * @param status 区分是新建（create）还是编辑（edit）
   */
  cancelDelPartis = (params, type, status) => {
    this.setState({loading: true});
    if (type === 'save') {//保存走这里
      if (status === 'create') {
        params.travelApplication = {};
        //设置行程管控
        params.travelApplication.manageType = params['customFormPropertyMap']['application.property.manage.type'];
      }
      if (this.state.travelItinerarys.length > 0) {
        params.travelApplication.travelItinerarys = [];
        params.travelApplication.travelItinerarys = this.state.travelItinerarys;
      }
      params.travelApplication.totalBudget = this.state.totalBudget;
      params.applicant = null;
      travelService.saveTravelRequest(params).then(res => {
        this.setState({loading: false, saveLoading: false});
        this.props.match.params.applicationOID = res.data.applicationOID;
        message.success(this.$t('itinerary.save.tip')/*'已保存'*/);
        if (status === 'create') {
          requestService.getRequestDetail(res.data.applicationOID).then(res => {
            this.setApplicantDisable(res.data.custFormValues);
            res.data.custFormValues.sort((a, b) => a.sequence > b.sequence || -1);
            res.data.custFormValues.map(item =>{
              if(item.messageKey === 'select_participant' && item.value){
                let arr = [];
                JSON.parse(item.value).map(detail =>{
                  let newItem = {
                    userOID:detail.userOID,
                    fullName:detail.fullName,
                    participantOID:detail.participantOID
                  };
                  arr.push(newItem);
                });
                item.value = JSON.stringify(arr);
              }
            })
            this.copyDefaultCust(res,'edit');
            this.setState({
              info: res.data,
              travelItinerarys:res.data.travelApplication.travelItinerarys,
              defaultValues: res.data.custFormValues,
            },()=>{
              this.setState({formIsChange:'false'});
            });
          })
        } else if(this.isSubsidySave){
          this.isSubsidySave = false;
          this.setState({formIsChange:false});
        }else{
          this.goBack();
        }
      }).catch(err => {
        this.setState({loading: false, saveLoading: false});
        message.error(this.$t('itinerary.operation.failed.tip')/*`操作失败:`*/  + `${err.response.data.message}`);
      });
    } else {//提交走这里：
      if (status === 'create') {
        message.error(this.$t('itinerary.form.submit.check.isSave.tip')/*'请先保存!'*/);
        this.setState({submitLoading: false, loading: false});
        return;
        /*下面注释三行不可删除，以后需求可能会不保存直接操作提交，如果这样只需删除上面三行，并取消注释*/
        // params.travelApplication = {};
        //设置行程管控
        // params.travelApplication.manageType = params['customFormPropertyMap']['application.property.manage.type'];
      }
      //提交时校验行程是否必须添加
      if(type === 'submit' && this.state.subsidyCtrl.itineraryRequire && !this.state.isHaveRoute){
        message.warn(this.$t('itinerary.form.submit.check.add.itinerary.tip')/*'请添加行程'*/);
        this.setState({submitLoading: false, loading: false});
        return;
      }
      params.applicant = null;
      params.travelApplication.totalBudget = this.state.totalBudget;
      if (this.state.subsidyCtrl.isBudgetCheck) {//是否需要预算校验
        this.setState({loading: true, submitLoading: true, percent: 0, budgeting: true});
        //开始校验
        this.percentPlus();
        travelService.travelBudgetChecked(params).then(c => {
          this.setState({percent: 100, budgeting: false});
          if (c.data) {
            if(status === 'create'){
              this.executeTravelSubmit();
            }else {
              this.checkedItinerary(params)
            }
          } else {
            Modal.confirm({
              title: this.$t('itinerary.form.submit.check.budget.title')/*'超预算'*/,
              content: <div>{c.data}</div>,
              okText: this.$t('itinerary.form.submit.check.budget.commit')/*'继续提交'*/,
              cancelText: this.$t('itinerary.form.submit.check.budget.back')/*'返回修改'*/,
              onOk: ()=> {
                this.checkedItinerary(params)
              },
              onCancel: ()=> {
                this.percentNum = 0;
                this.setState({submitLoading: false, loading: false});
              },
            })
          }
        }).catch(err => {
          this.setState({percent: 100,budgeting: false,loading: false, submitLoading: false});
          message.error(this.$t('itinerary.form.submit.budgeting.result.tip')/*`校验失败:`*/ + `${err.response.data.message}`)
        })
      } else {
        //检查行程中有哪几种，是否弹框统一订票
        if(status === 'create'){
          this.executeTravelSubmit();
        }else{
          this.checkedItinerary(params);
        }
      }
    }
  };

  //检查行程数据，是否需要显示统一订票等操作
  checkedItinerary = (params) => {
    travelService.getItinerary(this.props.match.params.applicationOID).then(res => {
      let it = res.data;
      let sub = this.state.subsidyCtrl;
      if (it['FLIGHT'] && it['FLIGHT'].length > 0) {
        sub.flight = true;
        //获取最大机票数
        travelService.getMaxFlight(this.props.match.params.applicationOID).then(f => {
          this.setState({maxFlight: f.data});
        })
      }
      if (it['HOTEL'] && it['HOTEL'].length > 0) {
        sub.hotel = true;
        let outNum = travelUtil.getFormHeadValue(params.custFormValues, 'out_participant_num');
        this.setState({randomHotel:true});
        //获取最大房间数
        travelService.getMaxRoom(outNum, travelUtil.getFormHeadValue(params.custFormValues, 'select_participant')).then(h=> {
          this.setState({maxHotel: h.data,randomHotel:false});
          it['HOTEL'].map(room => {
            if (room.roomNumber !== h.data.maxRoomNumber) {
              room.roomNumber = h.data.maxRoomNumber;
              travelService.updateHotel(room);//最大房间数与当前参与人配备的最大房间数不一样则更新。
            }
          })
        }).catch(err=>{
          message.error(err.response.data.message);
          this.setState({randomHotel:false});
        })
      }
      if (it['TRAIN'] && it['TRAIN'].length > 0) {
        sub.train = true;
      }
      sub.isShowModal = sub.flight || sub.train || sub.hotel ? true : false;

      //处理统一订票默认值
      if (this.state.formInfo && this.state.formInfo.customFormPropertyMap && !this.state.info.sourceApplicationOID) {
        let maps = this.state.formInfo.customFormPropertyMap;
        let isBookingPreference = true; //是否优先统一订票
        if (maps['ca.travel.bookingpreference'] === 'Consolidated') {
          isBookingPreference = true;
        }
        if (maps['ca.travel.bookingpreference'] === 'Individual') {
          isBookingPreference = false;
        }
        if (sub.flight) {
          if (isBookingPreference) {
            this.state.info.travelApplication.uniformBooking = true;
            this.state.isFlight = true;
          } else {
            this.state.info.travelApplication.uniformBooking = false;
            this.state.isFlight = false;
          }
        }
        if (sub.train) {
          if (isBookingPreference) {
            this.state.info.travelApplication.trainUniformBooking = true;
            this.state.isTrain = true;
          } else {
            this.state.info.travelApplication.trainUniformBooking = false;
            this.state.isTrain = false;
          }
        }
        if (sub.hotel) {
          if (isBookingPreference) {
            this.state.info.travelApplication.hotelUniformBooking = true;
            this.state.isHotel = true;
          } else {
            this.state.info.travelApplication.hotelUniformBooking = false;
            this.state.isHotel = false;
          }
        }
        this.setState({
          info: this.state.info,
          isFlight: this.state.isFlight,
          isTrain: this.state.isTrain,
          isHotel: this.state.isHotel,
        });
      }

      sub.selectPerson.push({name: params.createdName, oid: params.createdBy});//添加创建人
      travelUtil.getFormHeadValue(params.custFormValues, 'select_participant').map(v => {
        sub.selectPerson.push({name: v.fullName, oid: v.participantOID});//添加参与人
      });
      let applicant = travelUtil.getFormHeadValue(params.custFormValues, 'applicant');
      if (applicant) {//配置申请人存在
        travelService.getPrincipals(params.formOID).then(res =>{
          res.data.map(item =>{
            if(applicant.value === item.userOID){
              applicant = {name: item.fullName, oid: applicant.value};
            }
          });
          sub.selectPerson.unshift(applicant);//添加申请人
          this.setState({subsidyCtrl: sub});
        })
      } else {
        applicant = {name: params.applicantName, oid: params.applicantOID};
        sub.selectPerson.unshift(applicant);//添加申请人
        this.setState({subsidyCtrl: sub});
      }
      if (!sub.isShowModal) {//没有统一订票
        this.goSubmitTravel(true);
      }
    });
  };

  //删除不在权限内的参与人
  deletePartis = (res, partis, params, type, status) => {
    res.data.map(item => {
      if (item.errorDetail) {
        partis.map((p, ind) => {
          if (p.userOID === item.userOID) {
            partis.splice(ind, 1);
          }
        })
      }
    });
    if (this.state.total > 0)
      this.clearSubsidy();
    this.setState({
      saveLoading: false,
      submitLoading: false,
      loading: false,
    })
  };

  //清空差补
  clearSubsidy = () => {
    this.setState({haveClear:true});
    travelService.deleteAllSubsidy(this.props.match.params.applicationOID).then(res => {
      message.success(this.$t('itinerary.form.submit.clear.subsidy.tip')/*'已清空差补'*/);
      this.setState({total: 0, haveClear: true, totalBudget: this.state.amount});
    }).catch(err => {
      message.error(err);
    })
  };

  /**
   * 处理统一订票字段
   * @param boo 布尔值，是否不需要操作统一订票字段
   */
  goSubmitTravel = (boo) => {
    const {maxHotel} = this.state;
    if (boo) {//不需要处理统一订票字段直接提交
      this.executeTravelSubmit();
    } else {//需要处理统一订票字段，处理以后提交
      if (this.state.isFlight) {
        this.travelParams.travelApplication.uniformBooking = true;
        this.travelParams.travelApplication.bookingClerkOID = this.props.form.getFieldValue('bookingClerkOID');
      } else {
        this.travelParams.travelApplication.uniformBooking = false;
      }
      if (this.state.isHotel) {
        this.travelParams.travelApplication.hotelUniformBooking = true;
        this.travelParams.travelApplication.hotelBookingClerkOID = this.props.form.getFieldValue('hotelBookingClerkOID');
      } else {//非同一定酒店 需设置合租人信息
        this.travelParams.travelApplication.hotelUniformBooking = false;
        let man = this.props.form.getFieldValue('travelHotelBookingMaleClerks');
        let women = this.props.form.getFieldValue('travelHotelBookingFemaleClerks');
        if(man && man.length === maxHotel.maleRoomNumber){
          this.travelParams.travelApplication.travelHotelBookingMaleClerks = man;
        }else if(maxHotel.maleRoomNumber && maxHotel.maleRoomNumber > 0){
          message.error(this.$t('itinerary.form.submit.noBooking.hotelMale.tip',{peo:maxHotel.maleRoomNumber}));
          return;
        }
        if(women && women.length === maxHotel.femaleRoomNumber){
          this.travelParams.travelApplication.travelHotelBookingFemaleClerks = women;
        }else if(maxHotel.femaleRoomNumber && maxHotel.femaleRoomNumber > 0){
          message.error(this.$t('itinerary.form.submit.noBooking.hotelFemale.tip',{peo:maxHotel.femaleRoomNumber}));
          return;
        }
      }
      if (this.state.isTrain) {
        this.travelParams.travelApplication.trainUniformBooking = true;
        this.travelParams.travelApplication.trainBookingClerkOID = this.props.form.getFieldValue('trainBookingClerkOID');
      } else {
        this.travelParams.travelApplication.trainUniformBooking = false;
      }
      let subsidyCtrl = this.state.subsidyCtrl;
      subsidyCtrl.isShowModal = false;
      this.setState({subsidyCtrl: subsidyCtrl});
      this.executeTravelSubmit();
    }
  };

  //提交时加签人校验
  judgeSubmitSign = (params) => {
    let duplicateNameList = [];
    let duplicateOIDList = [];//去重逻辑
    let duplicateName = '';
    if (params.countersignApproverOIDs && params.countersignApproverOIDs.length && params.approvalHistorys && params.approvalHistorys.length) {
      params.approvalHistorys.map(history =>{
        if (history.operation === 2001 && history.operator
          && params.countersignApproverOIDs.indexOf(history.operator.userOID) !== -1
          && history.operator.fullName && duplicateOIDList.indexOf(history.operator.userOID) === -1) {
          duplicateNameList.push(history.operator.fullName);
          duplicateOIDList.push(history.operator.userOID);
        }
      });
    }
    duplicateName = duplicateNameList.join(', ');
    return duplicateName;
  };

  //提交差旅申请单
  doExecuteTravelSubmit = () => {
    //增加旧差旅行程
    if (this.state.travelItinerarys.length > 0) {
      this.travelParams.travelApplication.travelItinerarys = [];
      this.travelParams.travelApplication.travelItinerarys = this.state.travelItinerarys;
    }
    travelService.submitTravelRequest(this.travelParams).then(res => {
      this.setState({loading: false, submitLoading: false});
      message.success(this.$t('itinerary.form.submit.success.tip')/*"提交成功"*/);
      this.goBack();
    }).catch(err => {
      this.setState({loading: false, submitLoading: false});
      message.error(this.$t('itinerary.operation.failed.tip')/*`操作失败:`*/ + err.response.data.message);
    });
  };

  //统一订票modal阶段 取消提交返回界面
  cancelSubmit = () => {
    let subsidyCtrl = this.state.subsidyCtrl;
    subsidyCtrl.isShowModal = false;
    this.setState({
      subsidyCtrl: subsidyCtrl,
      loading: false,
      submitLoading: false,
    });
  };

  //是否统一订票开关
  onChangeSwitch = (type) => {
    let info = this.state.info;
    switch (type) {
      case 'flight':
        if(info.travelApplication.hasOwnProperty("uniformBooking")){
          info.travelApplication.uniformBooking = !info.travelApplication.uniformBooking;
        }
        this.setState({isFlight: !this.state.isFlight,info:info});
        break;
      case 'train':
        if(info.travelApplication.hasOwnProperty("trainUniformBooking")){
          info.travelApplication.trainUniformBooking = !info.travelApplication.trainUniformBooking;
        }
        this.setState({isTrain: !this.state.isTrain,info:info});
        break;
      case 'hotel':
        if(info.travelApplication.hasOwnProperty("hotelUniformBooking")){
          info.travelApplication.hotelUniformBooking = !info.travelApplication.hotelUniformBooking;
        }
        this.setState({isHotel: !this.state.isHotel,info:info});
        break;
    }
  };

  //提交
  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = this.props.match.params.applicationOID ? this.state.info : this.state.formInfo;
        params.custFormValues = this.getCustFormValues(values);
        params.referenceApplicationOID = this.state.referenceApplicationOID;
        params.countersignApproverOIDs = this.props.form.getFieldsValue().addSign;
        this.processValues(params);

        this.setState({submitLoading: true});
        let formType = this.state.formType;    //formType：2001（差旅申请）、2002（费用申请）、2003（订票申请）、2004（京东申请）、2005（借款申请）
        if (formType === 2001) {//wjk add 18 04 16 差旅提交分支
          this.toSaveTravelRequest(params, 'submit');
          return;
        }
        let getType =
          formType === 2001 ? '' :
            formType === 2002 ? 'submitExpenseRequest' :
              formType === 2003 ? 'submitBookerRequest' :
                formType === 2004 ? '' : 'submitLoanRequest';
        requestService[getType](params).then(() => {
          this.setState({submitLoading: false});
          message.success(this.$t('common.operate.success'));
          this.goBack()
        }).catch(e => {
          this.setState({submitLoading: false});
          message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`)
        })
      }
    });
  };

  /**
   * 根据差补总额，更新总金额
   * @param total number 差补总额
   * @param isClear Boolean 是否清空差补
   * @param isRoute Boolean 是否有行程存在
   */
  updateTotalBudget = (total, isClear, isRoute) => {
    this.setState({
      total: total,
      haveClear: isClear,
      totalBudget: this.state.amount + total,
      isHaveRoute:isRoute
    })
  };

  beforeAddSubsidyToSave = (boo) => {
    if(boo){
      this.isSubsidySave = true;
      this.handleSave();
    }
  }

  //删除
  handleDelete = () => {
    this.setState({deleteLoading: true});
    requestService.deleteRequest(this.props.match.params.applicationOID).then(res => {
      this.setState({deleteLoading: false});
      message.success(this.$t('common.delete.success', {name: ''}));
      this.goBack()
    }).catch(e => {
      this.setState({deleteLoading: false});
      message.error(this.$t('common.operate.filed'))
    })
  };
  //返回
  goBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/request'
      })
    )
  };
  formItemChange(value){
    let {formInfo,defaultValues}=this.state;
    let custForm=this.props.match.params.applicationOID ? defaultValues || [] : formInfo.customFormFields || [];
    let id = this.props.match.params.applicationOID ? 'formValueOID' : 'fieldOID';
    custForm.map(item =>{
      //参与人部门权限控件
      //差旅单参与人权限校验不走这里，在提交处校验
      if ((item.messageKey === 'select_department' || item.messageKey === 'select_cost_center') && value && Object.prototype.toString.call(value) === '[object Object]' && item[id] in value && this.state.formType !== 2001) {
        item.value=value[item[id]];
        custForm.map(i =>{
          if(i.messageKey === 'select_participant'){
            setTimeout(()=>{
              firstInitLoad=true;
            },200);
            if(firstInitLoad){
              i.clearDefault = true;
            }
            let fieldContent = i.fieldContent ? JSON.parse(i.fieldContent) : {editable: true};
            if (!i.isReadOnly && fieldContent.editable) {
              this.props.form.resetFields(i[id]);
            }
          }
        });
      }
      //收款人银行关联控件
      if (item.messageKey === 'payee' && value && Object.prototype.toString.call(value) === '[object Object]' && item.fieldOID in value && value[item.fieldOID] &&  typeof value[item.fieldOID] == 'object') {
        item.value = value[item.fieldOID]['key'];
        custForm.map(i => {
          if (i.messageKey === 'contact_bank_account') {
            let param = {
              userOID: value[item.fieldOID]['key'],
              page: 0,
              size: 20
            };
            let bank = {
              [i.fieldOID]: [{
                bankAccountNo: null,
                contactBankAccountOID: null
              }]
            };
            baseService.getUserBanks(param).then(res => {
              let data = res.data;
              if (data && data.length > 0) {
                data.map(item => {
                  if (item.isPrimary) {
                    bank = {
                      [i.fieldOID]: [{
                        bankAccountNo: item.bankAccountNo,
                        contactBankAccountOID: item.contactBankAccountOID
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

  createHotelPeople = () => {
    this.setState({randomHotel:true});
    travelService.randomCreateHotelPeople(this.state.maxHotel).then(res => {
      this.props.form.setFieldsValue({'travelHotelBookingMaleClerks':res.data.maleUserOIDs});
      this.props.form.setFieldsValue({'travelHotelBookingFemaleClerks':res.data.femaleUserOIDs});
      this.setState({randomHotel:false});
    }).catch(err => {
      message.error(err.response.data.message);
      this.setState({randomHotel:false});
    })
  }

  render() {
    //const { isPreVersion } = this.props.location.query;
    const { getFieldDecorator } = this.props.form;
    const { subsidyCtrl, loading, formInfo, formDefaultValue, defaultValues, saveLoading, deleteLoading, submitLoading, approvalHistory, signEnable, isShowRangePicker, travelItinerarys, dateChage, signCompanyOIDs } = this.state;
    const { maxHotel, randomHotel, copyDefaultValues, isFlight, isTrain, isHotel, info, formType, total, amount, totalBudget, percent, budgeting, haveClear, formIsChange, currentCodeType} = this.state;
    const customFormFields = formInfo.customFormFields || [];
    // customFormFields.sort((a, b) => a.sequence > b.sequence || -1);//wjk 注释
    // defaultValues.sort((a, b) => a.sequence > b.sequence || -1);//wjk 注释，初始化地方排序了
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14, offset: 1},
    };
    const formItemLayoutModal = {
      labelCol: {span: 8},
      wrapperCol: {span: 14, offset: 1},
    };
    let signPerson = [];
    info.countersignApproverNames && info.countersignApproverNames.map(item => {
      signPerson.push({userOID: item.userOID, fullName: item.fullName})
    });
    let formDetailValues=formInfo;
    if(this.props.match.params.applicationOID ){
      formDetailValues.currencyCode = info.currencyCode;
      formDetailValues.applicantOID = info.applicant && info.applicant.userOID;
      formDetailValues.customFormFields=defaultValues;
    }
    let chooserItem ={
      title: this.$t("chooser.data.selectPerson"),//选择人员
      url: `${config.baseUrl}/api/users/v3/search`,
      searchForm: [
        {
          type: 'input', id: 'keyword',
          label: this.$t("chooser.data.employeeID.fullName.mobile")//员工工号、姓名、手机号
        },
      ],
      columns: [
        {
          title:  this.$t("chooser.data.employeeID"),//工号
          dataIndex: 'employeeID', width: '10%'
        },
        {
          title: this.$t("chooser.data.fullName"),//姓名
          dataIndex: 'fullName', width: '25%'
        },
        {
          title: this.$t("chooser.data.mobile"),//手机号
          dataIndex: 'mobile', width: '25%'
        },
        {
          title: this.$t("chooser.data.dep"),//部门名称
          dataIndex: 'departmentName', width: '20%', render: value => value || '-'
        },
        {
          title: this.$t("chooser.data.duty"),//职务
          dataIndex: 'title', width: '20%', render: value => value || '-'
        },
      ],
      key: 'userOID'
    };
    if(signCompanyOIDs.length>0){
      chooserItem.url = `${config.baseUrl}/api/users/v3/search?corporationOID=${signCompanyOIDs}`;
    }
    let requestInfo = (
      <div>
        <h3 className="header-title">{formInfo.formName}</h3>
        <Form className="form-container">
          {
            info.sourceApplicationOID && <FormItem {...formItemLayout} label={<span><Icon type="exclamation-circle-o" />&nbsp;{this.$t('itinerary.form.versionNum')/*版本号*/}</span>}>
              {info.version + 1}<TravelPreviousVersion info={info} isPreVersion={isPreVersion}/>
            </FormItem>
          }
          <div style={{margin: '0 0 20px 30%'}}>{customField.instructionsTag(formInfo.customFormPropertyMap)}</div>
          <ExpectStopDate copyValue={copyDefaultValues} callFun={(boo,date)=>this.expectStopDate(boo,date)}/>
          {this.props.match.params.applicationOID ? (
            defaultValues.map((field, index) => {
              //label
              let label = field.fieldName;
              if (field.messageKey === 'number') {
                label = `${field.fieldName}${JSON.parse(field.fieldContent || '{}').unit && `(${JSON.parse(field.fieldContent || '{}').unit})`}`
              }

              //rules
              let maxLength = (field.messageKey === 'remark' || field.messageKey === 'textArea' || field.messageKey === 'text_area') ? 200 :
                (field.messageKey === 'title' || field.messageKey === 'input' ? 50 : undefined);
              let rules = [{
                required: field.required,
                message: this.$t('common.can.not.be.empty', {name: field.fieldName})
              }];
              maxLength && rules.push({
                max: maxLength,
                message: this.$t('common.max.characters.length', {max: maxLength})
              });
              (field.messageKey === 'out_participant_name' || field.messageKey === 'external_participant_name') && rules.push({
                validator: (rule, value, callback) => {
                  let emptyItem = '';
                  value && value.map(item => {
                    if (!item.name) {
                      emptyItem = this.$t('customField.name'/*姓名*/);
                      return
                    }
                    if (!item.certificateNo) {
                      emptyItem = this.$t('customField.id.number'/*证件号*/)
                    }
                  });
                  if (!emptyItem) {
                    callback();
                    return
                  }
                  callback(this.$t('common.can.not.be.empty', {name: emptyItem}))
                }
              });

              return (
                <div key={index}>
                  {index === 0 && field.messageKey !== 'applicant' && (
                    <RelatedApplication formOID={this.props.match.params.formOID}
                                        formInfo={formInfo}
                                        applicantOID={this.props.user.userOID}
                                        applicationOID={this.props.match.params.applicationOID}
                                        info={info}
                                        changeHandle={(value) => {this.setState({referenceApplicationOID: value[0].applicationOID})}}/>
                  )}
                  <FormItem {...formItemLayout} label={label} key={field.formValueOID}>
                    {((field.messageKey === 'total_budget' && formType != 2005) || field.messageKey === 'average_budget') && <span>{this.props.company.baseCurrency}</span>}
                    {getFieldDecorator(field.formValueOID, {
                      rules,
                      valuePropName: field.messageKey === 'switch' ? 'checked' : 'value',
                      initialValue: customField.getInitialValue(field)
                    })(
                      // customField.renderForm(field, null, customFormFields, copyDefaultValues)
                      customField.renderForm({field, formDetail: formDetailValues, copyValue: copyDefaultValues})
                    )}
                  </FormItem>
                  {/*关联申请单在申请人下面*/}
                  {index === 0 && field.messageKey === 'applicant' && (
                    <RelatedApplication formOID={this.props.match.params.formOID}
                                        formInfo={formInfo}
                                        applicantOID={this.props.user.userOID}
                                        applicationOID={this.props.match.params.applicationOID}
                                        info={info}
                                        changeHandle={(value) => {this.setState({referenceApplicationOID: value[0].applicationOID})}}/>
                  )}
                </div>
              )
            })
          ) : (
            customFormFields.map((field, index) => {
              //label
              let label = field.fieldName;
              if (field.messageKey === 'number') {
                label = `${field.fieldName}${JSON.parse(field.fieldContent || '{}').unit && `(${JSON.parse(field.fieldContent || '{}').unit})`}`
              }

              //rules
              let maxLength = (field.messageKey === 'remark' || field.messageKey === 'textArea' || field.messageKey === 'text_area') ? 200 :
                (field.messageKey === 'title' || field.messageKey === 'input' ? 50 : undefined);
              let rules = [{
                required: field.required,
                message: this.$t('common.can.not.be.empty', {name: field.fieldName})
              }];
              maxLength && rules.push({
                max: maxLength,
                message: this.$t('common.max.characters.length', {max: maxLength})
              });
              (field.messageKey === 'out_participant_name' || field.messageKey === 'external_participant_name') && rules.push({
                validator: (rule, value, callback) => {
                  let emptyItem = '';
                  value && value.map(item => {
                    if (!item.name) {
                      emptyItem = this.$t('customField.name'/*姓名*/);
                      return
                    }
                    if ((JSON.parse(field.fieldContent || '{}').isContainCard || field.messageKey === 'out_participant_name') && !item.certificateNo) {
                      emptyItem = this.$t('customField.id.number'/*证件号*/)
                    }
                  });
                  if (!emptyItem) {
                    callback();
                    return
                  }
                  callback(this.$t('common.can.not.be.empty', {name: emptyItem}))
                }
              });

              //initialValue
              let fieldDefaultValue = {};
              formDefaultValue.map(item => {
                item.fieldOID === field.fieldOID && (fieldDefaultValue = item)
              });

              return (
                <div key={index}>
                  {index === 0 && field.messageKey !== 'applicant' && (
                    <RelatedApplication formOID={this.props.match.params.formOID}
                                        formInfo={formInfo}
                                        applicantOID={this.props.user.userOID}
                                        applicationOID={this.props.match.params.applicationOID}
                                        changeHandle={(value) => {this.setState({referenceApplicationOID: value[0].applicationOID})}}/>
                  )}
                  <FormItem {...formItemLayout} label={label} key={field.fieldOID}>
                    {((field.messageKey === 'total_budget' && formType != 2005) || field.messageKey === 'average_budget') && <span>{this.props.company.baseCurrency}</span>}
                    {getFieldDecorator(field.fieldOID, {
                      rules,
                      valuePropName: field.messageKey === 'switch' ? 'checked' : 'value',
                      initialValue: customField.getDefaultValue(field, fieldDefaultValue)
                    })(
                      // customField.renderForm(field, fieldDefaultValue,customFormFields , copyDefaultValues)
                      customField.renderForm({field,fieldDefaultValue, formDetail: formInfo, copyValue: copyDefaultValues})
                    )}
                  </FormItem>
                  {/*关联申请单在申请人下面*/}
                  {index === 0 && field.messageKey === 'applicant' && (
                    <RelatedApplication formOID={this.props.match.params.formOID}
                                        formInfo={formInfo}
                                        applicantOID={this.props.user.userOID}
                                        applicationOID={this.props.match.params.applicationOID}
                                        changeHandle={(value) => {this.setState({referenceApplicationOID: value[0].applicationOID})}}/>
                  )}
                </div>
              )
            })
          )}
          {signEnable && (
            <FormItem {...formItemLayout} label={this.$t('customField.special.signer')} key="addSign">
              {getFieldDecorator('addSign', {
                initialValue: signPerson
              })(
                <Chooser selectorItem={chooserItem}
                         valueKey="userOID"
                         labelKey="fullName"
                         onlyNeed="userOID"
                         listExtraParams={{roleType: 'TENANT'}}
                         showArrow={formInfo.customFormPropertyMap && formInfo.customFormPropertyMap.countersignType === '2'}
                         newline/>
              )}
            </FormItem>
          )}
        </Form>
        {formType === 2001 && this.state.manageType &&
        formInfo.customFormPropertyMap && this.props.match.params.applicationOID && defaultValues.length > 0 &&
        <TravelType updateTotalBudget={(total, clear, isHaveRoute,isRepeatSubsidy) => this.updateTotalBudget(total, clear, isHaveRoute,isRepeatSubsidy)}
                    beforeAddSubsidyToSave = {(boo) => this.beforeAddSubsidyToSave(boo)}
                    infoDetail = {info}
                    formIsChange = {formIsChange}
                    setInfo={
                      {
                        oid:this.props.match.params.applicationOID,
                        travelInfo:formInfo,
                        defaultValue:defaultValues,
                        clearSubsidy:haveClear,
                        formOID:  this.props.match.params.formOID
                      }
                    }/>}

        { formType === 2001 && !this.state.manageType && dateChage  && this.props.match.params.applicationOID && !loading &&
                <TravelElementType updateTotalBudget={(total, clear, isHaveRoute,isRepeatSubsidy) => this.updateTotalBudget(total, clear, isHaveRoute,isRepeatSubsidy)}
                                   beforeAddSubsidyToSave = {(boo) => this.beforeAddSubsidyToSave(boo)}
                                   updateTravelItinerarys = {travelItinerarys => this.setState({travelItinerarys:travelItinerarys})}
                                   infoDetail = {info}
                                   formIsChange = {formIsChange}
                                   setInfo={
                                     {
                                       oid:this.props.match.params.applicationOID,
                                       travelInfo:formInfo,
                                       defaultValue:defaultValues,
                                       clearSubsidy:haveClear,
                                       formOID:  this.props.match.params.formOID,
                                       travelElement:!this.state.manageType,
                                       travelItinerarys
                                     }
                                   }/>}

      </div>
    );
    return (
      <div className="new-request">
        <Spin spinning={loading}>
          { !! approvalHistory.length && !loading && (
            <Tabs type="card">
              <TabPane tab={this.$t('request.detail.request.info')/*申请单信息*/} key="requestInfo">{requestInfo}</TabPane>
              <TabPane tab={this.$t('request.detail.approve.history'/*审批历史*/)} key="approvals">
                <ApproveHistory approvalChains={info.approvalChains} isShowReply={false} businessCode={info.businessCode} approvalHistory={approvalHistory} applicantInfo={info.applicant || {}}/>
              </TabPane>
            </Tabs>
          )}
          { !approvalHistory.length && requestInfo}
        </Spin>

        <Affix offsetBottom={0} className="bottom-bar">
          <Button type="primary" onClick={this.handleSubmit} loading={submitLoading}>{this.$t('common.submit')}</Button>
          <Button onClick={this.handleSave} loading={saveLoading}>{this.$t('common.save')}</Button>
          <Button onClick={this.goBack}>{this.$t('common.back')}</Button>
          {
            formType === 2001 && <Row className="total-budget">
              <span className="total">{this.$t('itinerary.form.travel.info.total')/*总金额*/}:{currentCodeType}&nbsp;{ React.Component.prototype.filterMoney(totalBudget) } </span>
              <span className="budget">{this.$t('itinerary.form.travel.info.fee.total')/*费用总金额*/}:{ React.Component.prototype.filterMoney(amount) }
                + {this.$t('itinerary.form.travel.info.subsidy.total')/*差补总金额*/}:{ React.Component.prototype.filterMoney(total) }</span>
            </Row>
          }
          {this.props.match.params.applicationOID && (
            <Popconfirm title={this.$t('common.confirm.delete')} placement="topRight" onConfirm={this.handleDelete}>
              <Button className="delete-btn" loading={deleteLoading}>{this.$t('common.delete')}</Button>
            </Popconfirm>
          )}
        </Affix>
        <Modal title={this.$t('itinerary.form.submit.booking.title')}/*"统一订票"*/
               visible={subsidyCtrl.isShowModal}
               onOk={() => this.goSubmitTravel(false)}
               onCancel={this.cancelSubmit}
               width={'50%'}
               okText={this.$t('itinerary.type.slide.and.modal.ok.btn')/*"确定"*/}
               cancelText={this.$t('itinerary.type.slide.and.modal.back.btn')}/*"返回"*/
        >
          <Form>
            {
              subsidyCtrl.flight && <Row>
                <Col span={6} style={{marginTop:9}}>
                  <span>{this.$t('itinerary.form.submit.booking.flight.title')/*统一订机票*/}：</span>
                </Col>
                <Col span={4} style={{marginTop:7}}>
                  <Switch disabled={info.sourceApplicationOID ? true : false}
                          checked={info.travelApplication.hasOwnProperty("uniformBooking") ? info.travelApplication.uniformBooking : isFlight}
                          size="small"
                          onChange={() => this.onChangeSwitch('flight')}/>
                </Col>
                <Col span={14} style={{marginTop:isFlight ? 0 : 8}}>
                  {
                    (info.travelApplication.hasOwnProperty("uniformBooking") ? info.travelApplication.uniformBooking : isFlight)
                      ? <FormItem {...formItemLayoutModal} label={this.$t('itinerary.form.submit.booking.flight.peo')/*机票订票人*/}>
                        {getFieldDecorator('bookingClerkOID', {
                          initialValue: info.travelApplication.bookingClerkOID ? info.travelApplication.bookingClerkOID : subsidyCtrl.selectPerson[0] ? subsidyCtrl.selectPerson[0].oid : ""
                        })(
                          <Select disabled={info.sourceApplicationOID ? true : false}>
                            {
                              subsidyCtrl.selectPerson.map(p => {
                                return (
                                  <Option opt={p} key={p.oid}>{p.name}</Option>
                                )
                              })
                            }
                          </Select>
                        )}
                      </FormItem>
                      : <span>
                        {this.$t('itinerary.form.submit.noBooking.tip',{peo:info.createdName})/*参与人各自订票，外部参与人由{` ${info.createdName} `}代订*/}
                        </span>
                  }
                </Col>
              </Row>
            }
            {
              subsidyCtrl.train && <Row>
                <Col span={6} style={{marginTop:9}}>
                  <span>{this.$t('itinerary.form.submit.booking.train.title')/*统一订火车票*/}：</span>
                </Col>
                <Col span={4} style={{marginTop:7}}>
                  <Switch disabled={info.sourceApplicationOID ? true : false}
                          checked={info.travelApplication.hasOwnProperty("trainUniformBooking") ? info.travelApplication.trainUniformBooking : isTrain}
                          size="small"
                          onChange={() => this.onChangeSwitch('train')}/>
                </Col>
                <Col span={14} style={{marginTop:isTrain ? 0 : 8}}>
                  {
                    (info.travelApplication.hasOwnProperty("trainUniformBooking") ? info.travelApplication.trainUniformBooking :isTrain)
                      ? <FormItem {...formItemLayoutModal} label={this.$t('itinerary.form.submit.booking.train.peo')/*火车订票人*/}>
                      {getFieldDecorator('trainBookingClerkOID', {
                        initialValue: info.travelApplication.trainBookingClerkOID ? info.travelApplication.trainBookingClerkOID : subsidyCtrl.selectPerson[0] ? subsidyCtrl.selectPerson[0].oid : ""
                      })(
                        <Select disabled={info.sourceApplicationOID ? true : false}>
                          {
                            subsidyCtrl.selectPerson.map(p=> {
                              return (
                                <Option opt={p} key={p.oid}>{p.name}</Option>
                              )
                            })
                          }
                        </Select>
                      )}
                    </FormItem>
                      : <span>
                    {this.$t('itinerary.form.submit.noBooking.tip',{peo:info.createdName})/*参与人各自订票，外部参与人由{` ${info.createdName} `}代订*/}
                  </span>
                  }
                </Col>
              </Row>
            }
            {
              subsidyCtrl.hotel && <Row>
                <Col span={6} style={{marginTop:9}}>
                  <span>{this.$t('itinerary.form.submit.booking.hotel.title')/*统一订酒店*/}：</span>
                </Col>
                <Col span={4} style={{marginTop:7}}>
                  <Switch disabled={info.sourceApplicationOID ? true : false}
                          checked={info.travelApplication.hasOwnProperty("hotelUniformBooking") ? info.travelApplication.hotelUniformBooking : isHotel}
                          size="small"
                          onChange={() => this.onChangeSwitch('hotel')}/>
                </Col>
                <Col span={14} style={{marginTop:isHotel ? 0 : 8}}>
                  {
                    (info.travelApplication.hasOwnProperty("hotelUniformBooking") ? info.travelApplication.hotelUniformBooking : isHotel) ? <FormItem {...formItemLayoutModal} label={this.$t('itinerary.form.submit.booking.hotel.peo')/*酒店预订人*/}>
                      {getFieldDecorator('hotelBookingClerkOID', {
                        initialValue: info.travelApplication.hotelBookingClerkOID ? info.travelApplication.hotelBookingClerkOID : subsidyCtrl.selectPerson[0] ? subsidyCtrl.selectPerson[0].oid : ""
                      })(
                        <Select disabled={info.sourceApplicationOID ? true : false}>
                          {
                            subsidyCtrl.selectPerson.map(p=> {
                              return (
                                <Option opt={p} key={p.oid}>{p.name}</Option>
                              )
                            })
                          }
                        </Select>
                      )}
                    </FormItem>
                      :(<div>
                        <p>{this.$t('itinerary.form.submit.noBooking.hotel.tip',{peo:info.createdName})/*请选择合住房间的预订人，非合住人员各自订票，外部参与人由 {info.createdName} 预订*/}</p>
                        { (maxHotel.maleRoomNumber > 0 || maxHotel.femaleRoomNumber > 0) &&
                          <FormItem {...formItemLayoutModal} label={this.$t('itinerary.form.submit.noBooking.hotel.randomBtn.label')/*'合住房间预订人'*/}>
                            {getFieldDecorator('randomHotelPeopleBtn')(
                              <Button type='primary' loading={randomHotel} ghost disabled={info.sourceApplicationOID ? true : false} onClick={this.createHotelPeople}>{this.$t('itinerary.form.submit.noBooking.hotel.randomBtn.name')/*随机*/}</Button>
                            )}
                          </FormItem>
                        }
                       {
                         (maxHotel.maleRoomNumber > 0) && <FormItem {...formItemLayoutModal} label={this.$t('itinerary.form.submit.noBooking.hotel.male')/*'男士'*/}>
                            {getFieldDecorator('travelHotelBookingMaleClerks', {
                              initialValue: (info.travelApplication.travelHotelBookingMaleClerks && info.sourceApplicationOID) ? info.travelApplication.travelHotelBookingMaleClerks : []
                            })(
                              <Select disabled={info.sourceApplicationOID ? true : false}
                                      mode="multiple"
                                      optionFilterProp="children"
                              >
                                {
                                  maxHotel.maleUsers.map(p=> {
                                    return (
                                      <Option opt={p} key={p.userOID}>{p.fullName}</Option>
                                    )
                                  })
                                }
                              </Select>
                            )}
                          </FormItem>
                        }
                        {
                          (maxHotel.femaleRoomNumber > 0) && <FormItem {...formItemLayoutModal} label={this.$t('itinerary.form.submit.noBooking.hotel.female')/*'女士'*/}>
                            {getFieldDecorator('travelHotelBookingFemaleClerks', {
                              initialValue: (info.travelApplication.travelHotelBookingFemaleClerks && info.sourceApplicationOID) ? info.travelApplication.travelHotelBookingFemaleClerks : []
                            })(
                              <Select disabled={info.sourceApplicationOID ? true : false}
                                      mode="multiple"
                                      optionFilterProp="children"
                              >
                                {
                                  maxHotel.femaleUsers.map(p=> {
                                    return (
                                      <Option opt={p} key={p.userOID}>{p.fullName}</Option>
                                    )
                                  })
                                }
                              </Select>
                            )}
                          </FormItem>
                        }

                      </div>)
                  }
                </Col>
              </Row>
            }
          </Form>
        </Modal>
        <Modal title={this.$t('itinerary.form.submit.budgeting.title')/*"预算校验"*/}
               visible={budgeting}
        >
          <Progress percent={percent} status="active"/>
          <p>{this.$t('itinerary.form.submit.budgeting.content')/*正在校验...*/}</p>
        </Modal>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
    language: state.languages,
    //profile: state.login.profile
  }
}

const wrappedNewRequest = Form.create(
  {
    onValuesChange(props, values) {
      newRequestThis.formItemChange(values);
    },
  }
)(NewRequest);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewRequest)
