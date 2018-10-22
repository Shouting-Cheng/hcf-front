
import React from 'react';
import { connect } from 'dva';

import { Alert, Divider, Radio, Switch, Select, Form, InputNumber, Row, Col, Button, message, Input, Spin} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
import 'styles/setting/form/form-detail.scss'
// import menuRoute from "routes/menuRoute";
import formService from 'containers/admin-setting/form/form.service'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router';

class SupplierManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isEditing: false,//是否点击编辑
      cancelEditing: false,//是否点击取消编辑
    //   formManagement: menuRoute.getRouteItem('form-list', 'key'),
      controlFieldsFlight: {},//机票包含的字段
      controlFieldsHotel: {},//酒店包含的字段
      manageType: this.props.data.manageType,//行程管控模式
      controlFieldsTrain: {},//火车包含的字段
      costCenterCustom: {},//自定义字段
      expiryDateControl: {},//有效期管控
      options: [],//第二个select的option
      fields3Options: [],//所有的第三个select里的值
      fields1ThrOptions : [],//costCenter1的第3个select
      fields2ThrOptions : [],//costCenter2的第3个select
      fields3ThrOptions : [],//costCenter3的第3个select
      fields4ThrOptions : [],//costCenter4的第3个select
      fields5ThrOptions : [],//costCenter5的第3个select
      disabled: true,
      cost1FirSelDisabled: true,//costCenter1的第1个select
      cost2FirSelDisabled: true,//costCenter2的第1个select
      cost3FirSelDisabled: true,//costCenter3的第1个select
      cost4FirSelDisabled: true,//costCenter4的第1个select
      cost5FirSelDisabled: true,//costCenter5的第11个select
      cost1ThirdSelDisabled: true,//costCenter1的第三个select
      cost2ThirdSelDisabled: true,//costCenter2的第三个select
      cost3ThirdSelDisabled: true,//costCenter3的第三个select
      cost4ThirdSelDisabled: true,//costCenter4的第三个select
      cost5ThirdSelDisabled: true,//costCenter5的第三个select
      cost1ShowInputSel: '',//为ture显示sel,false显示input
      cost2ShowInputSel: '',//为ture显示sel,false显示input
      cost3ShowInputSel: '',//为ture显示sel,false显示input
      cost4ShowInputSel: '',//为ture显示sel,false显示input
      cost5ShowInputSel: '',//为ture显示sel,false显示input
      copys: [],//cost1-5ShowInputSel的深拷贝们，取消编辑时要用
    }
  }

  componentWillMount() {
    const {propertyList, data} = this.props;
    const {formOID} = this.props.params;
    propertyList.map(item => {
      if(item.propertyName === 'ca.travel.deactivatedate.enabled') {
        this.setState({
          expiryDateControl: item,
        })
      }
    })
    formService.getSupplierOptions(formOID).then(res => {
      if (res.status ===  200) {
        this.setState({
          options: res.data,
        }, () => {
          this.initThrOption();
        });
      }
    })
    for( let son in data){
      if(son === 'manageType'){
        continue;
      }
      if (son === 'controlFieldsFlight') {
        this.initFlightConfigurationKey(data[son]);
        //初始化机票火车相关的浮动天数
        this.initFloatDays(data[son], 'flight');
      }
      if (son === 'controlFieldsTrain') {
        //初始化机票火车相关的浮动天数
        this.initFloatDays(data[son], 'train');
      }
        if(son !== 'costCenterCustom'){
          for (let grandson in data[son]) {
            if(grandson === 'preBookingDays'){
              continue;
            }
             if(data[son][grandson].hasOwnProperty('enable')) {
               if(!data[son][grandson].hasOwnProperty('required')) {
                data[son][grandson]['required'] = data[son][grandson]['enable'];
              }
               if(!data[son][grandson].hasOwnProperty('show')) {
                data[son][grandson]['show'] = data[son][grandson]['enable'];
              }
               if(!data[son][grandson].hasOwnProperty('control')) {
                data[son][grandson]['control'] = data[son][grandson]['enable'];
              }
            } else {
               if(!data[son][grandson].hasOwnProperty('required')) {
                data[son][grandson] = {required: false}
              }
               if(!data[son][grandson].hasOwnProperty('show')) {
                 data[son][grandson]['show'] = false
              }
               if(!data[son][grandson].hasOwnProperty('control')) {
                 data[son][grandson]['control'] = false
              }
               if(data[son][grandson].hasOwnProperty('required') ||  data[son][grandson].hasOwnProperty('show') ||  data[son][grandson].hasOwnProperty('control')) {
                data[son][grandson]['enable'] =  data[son][grandson]['control'] &&  data[son][grandson]['required'] &&  data[son][grandson]['show'];
              }
            }
          }
        }else{
          for(let i = 1; i < 6; i++){
            if(!data[son].hasOwnProperty(`costCenter${i}`)){
              data[son][`costCenter${i}`] = {
                enabled:false,
                index:null,
                type:null,
                value:null,
                valueScope:null,
              }
              }else{
              for (let costGrandson in data[son]){
                if(!data[son][costGrandson].hasOwnProperty('enabled')){
                  data[son][costGrandson]['enabled'] = false
                }
                if(!data[son][costGrandson].hasOwnProperty('index')){
                  data[son][costGrandson]['index'] = null
                }
                if(!data[son][costGrandson].hasOwnProperty('type')){
                  data[son][costGrandson]['type'] = null
                }
                if(!data[son][costGrandson].hasOwnProperty('value')){
                  data[son][costGrandson]['value'] = null
                }if(!data[son][costGrandson].hasOwnProperty('valueScope')){
                  data[son][costGrandson]['valueScope'] = null
                }
              }
            }
          }
        }
    }
    this.setState({
      data,
      controlFieldsFlight:data.controlFieldsFlight,
      controlFieldsHotel:data.controlFieldsHotel,
      controlFieldsTrain:data.controlFieldsTrain,
      costCenterCustom:data.costCenterCustom,
    }, () => {
      let cost = []
      for(let i=1; i<6;i++){
        cost[i] = '';
        if(this.state.costCenterCustom[`costCenter${i}`]['type'] === 1001){
          cost[i] = false;
        }else if(!this.state.costCenterCustom[`costCenter${i}`]['type']){
          cost[i] = '';
        }else{
          cost[i] = true;
          this.setState({
            [`cost${i}ThirdSelDisabled`]: !cost[i]
          })
        }
        this.setState({
          [`cost${i}ShowInputSel`]: cost[i]
        })
      }
    })
  };

  //处于编辑状态时切换tab相当于点击取消编辑
  componentWillReceiveProps(nextProps) {
    if(nextProps.params.activeKey !== this.props.params.activeKey){
      this.state.isEditing && this.cancelEditing();
    }
  };

  //初始化第三个选择框
  initThrOption = () => {
    const {data} = this.props;
    const {options} = this.state;
    let key = '';
    for (key in data.costCenterCustom) {
      if (data.costCenterCustom[key].type !== 1001) {
        switch (key) {
          case 'costCenter1':this.setState({
            fields1ThrOptions: this.getTrdOption(data.costCenterCustom[key].type)
          });
            break;
          case 'costCenter2':this.setState({
            fields2ThrOptions: this.getTrdOption(data.costCenterCustom[key].type)
          });
            break;
          case 'costCenter3':this.setState({
            fields3ThrOptions: this.getTrdOption(data.costCenterCustom[key].type)
          });
            break;
          case 'costCenter4':this.setState({
            fields4ThrOptions: this.getTrdOption(data.costCenterCustom[key].type)
          });
            break;
          case 'costCenter5':this.setState({
            fields5ThrOptions: this.getTrdOption(data.costCenterCustom[key].type)
          });
            break;
        }
      }
    }
  };

  //获取相应type的valueType的list取值范围
  getTrdOption = (type) => {
    const {options} = this.state;
    let key = '';
    let list = [];
    options.map(item => {
      if (type === item.type) {
        list = JSON.parse(JSON.stringify(item.valueTypes));
      }
    });
    return list;
  };

  //初始化机票配置key是否缺少，如果缺少则补上
  initFlightConfigurationKey = (controlFieldsFlight) => {
    let key = '';
    let isHasPreBookingDays = false;
    let isHasInternationalPassengerList = false;
    for (key in controlFieldsFlight) {
      if (key === 'preBookingDays') {
        isHasPreBookingDays = true;
      }
      if (key === 'internationalPassengerList') {
        isHasInternationalPassengerList = true;
      }
    }
    if (!isHasPreBookingDays) {
      controlFieldsFlight.preBookingDays = 0;
    }
    if (!isHasInternationalPassengerList) {
      controlFieldsFlight.internationalPassengerList = {enable: false, control: false};
    }
  };

  //type flight机票 train火车 hotel酒店
  initFloatDays = (controlFields, type) =>{
    this.initFloatDaysNum();
    if (type === 'flight') {
      if (controlFields.hasOwnProperty('departBeginDate')) {
        controlFields['departBeginDate'].floatDays = this.initFloatDaysNum('start', false, controlFields['departBeginDate'].floatDays, controlFields['departBeginDate'].internationalFloatDays);
        controlFields['departBeginDate'].internationalFloatDays = this.initFloatDaysNum('start', true, controlFields['departBeginDate'].floatDays, controlFields['departBeginDate'].internationalFloatDays);
      }
      if (controlFields.hasOwnProperty('returnEndDate')) {
        controlFields['returnEndDate'].floatDays = this.initFloatDaysNum('end', false, controlFields['returnEndDate'].floatDays, controlFields['returnEndDate'].internationalFloatDays);
        controlFields['returnEndDate'].internationalFloatDays = this.initFloatDaysNum('end', true, controlFields['returnEndDate'].floatDays, controlFields['returnEndDate'].internationalFloatDays);
      }
    }
    if (type === 'train') {
      if (controlFields.hasOwnProperty('departBeginDate')) {
        controlFields['departBeginDate'].floatDays = this.initFloatDaysNum('start', false, controlFields['departBeginDate'].floatDays);
      }
    }
  };

  //初始化机票／火车浮动天数
  /**
   *
   * @param type 'start' 开始日期相关的浮动天数 'end' 结束日期相关的浮动天数
   * @param isInter true 国际的浮动天数 false 国内的浮动天数或者就是单纯的浮动天数（火车浮动天数不分国内国际）
   * @param floatDays  国内的浮动天数或者就是单纯的浮动天数 int类型，没有就是undefined或者null
   * @param interFloatDays  国际的浮动天数 int类型，没有就是undefined或者null
   */
  initFloatDaysNum = (type, isInter, floatDays, interFloatDays) => {
    const {profile} = this.props;
    let startDaysInProfile = null;
    let endDaysInProfile = null;
    if (profile['approval.start.float.days'] || profile['approval.start.float.days'] === 0) {
      startDaysInProfile = profile['approval.start.float.days'];
    }
    if (profile['approval.end.float.days'] || profile['approval.end.float.days'] === 0) {
      endDaysInProfile = profile['approval.end.float.days'];
    }

    let days = 4;
    if (type === 'start' && startDaysInProfile !== null) {
      days = startDaysInProfile;
    }
    if (type === 'end' && endDaysInProfile !== null) {
      days = endDaysInProfile;
    }
    if (!isInter && floatDays !== null && floatDays !== undefined) {
      days = floatDays;
    }
    if (isInter) {
      if (floatDays !== null && floatDays !== undefined) {
        days = floatDays;
      }
      if (interFloatDays !== null && interFloatDays !== undefined) {
        days = interFloatDays;
      }
    }
    return days;
  };

  //点击编辑
  editClicked = () => {
    const {costCenterCustom, copys } = this.state
    for(let i = 1; i < 6; i++){
      copys[i] = JSON.parse(JSON.stringify(this.state[`cost${i}ShowInputSel`]))
    }
    this.setState({
      copys,
    })
    this.setState({
      isEditing: true,
      cancelEditing: false,
      disabled: false,
      cost1FirSelDisabled: !costCenterCustom.costCenter1.enabled,
      cost2FirSelDisabled: !costCenterCustom.costCenter2.enabled,
      cost3FirSelDisabled: !costCenterCustom.costCenter3.enabled,
      cost4FirSelDisabled: !costCenterCustom.costCenter4.enabled,
      cost5FirSelDisabled: !costCenterCustom.costCenter5.enabled,
    })
  };

  //取消编辑
  cancelEditing = () => {
    const {copys} = this.state;
    for(let i = 1; i < 6; i++){
      this.setState({
        [`cost${i}ShowInputSel`]: copys[i]
      })
    }
    this.setState({
      cancelEditing: true,
      isEditing: false,
      disabled: true
    }, () => {
      this.props.form.resetFields()
    })
  };

  //切换switch时
  switchChange = (e, key) => {
    switch (key) {
      case 'costCenter1':this.setState({
        cost1FirSelDisabled: !e,
        cost1ThirdSelDisabled: !e
      });
        break;
      case 'costCenter2':this.setState({
        cost2FirSelDisabled: !e,
        cost2ThirdSelDisabled: !e
      });
        break;
      case 'costCenter3':this.setState({
        cost3FirSelDisabled: !e,
        cost3ThirdSelDisabled: !e
      });
        break;
      case 'costCenter4':this.setState({
        cost4FirSelDisabled: !e,
        cost4ThirdSelDisabled: !e
      });
        break;
      case 'costCenter5':this.setState({
        cost5FirSelDisabled: !e,
        cost5ThirdSelDisabled: !e
      });
        break;
    }
  }
  //选择formItem的costCenter1Fields1的option时；选择第一个select
  handleCenter1Fields1Change = (value, option,key) => {
    if(value){
      //切换第一个select要清空value
      let costCenterCustom = this.state.costCenterCustom;
      costCenterCustom[key].value = null;
      this.setState({
        costCenterCustom: costCenterCustom
      });
      if(value === '固定值'){
        switch (key) {
          case 'costCenter1':this.setState({
            cost1ShowInputSel: false
          });
            break;
          case 'costCenter2':this.setState({
            cost2ShowInputSel: false
          });
            break;
          case 'costCenter3':this.setState({
            cost3ShowInputSel: false
          });
            break;
          case 'costCenter4':this.setState({
            cost4ShowInputSel: false
          });
            break;
          case 'costCenter5':this.setState({
            cost5ShowInputSel: false
          });
            break;
        }
      }else{
        switch (key) {
          case 'costCenter1':
            // this.props.form.resetFields('costCenter1Fields2')
            // this.props.form.resetFields('costCenter1Fields3')
            this.props.form.setFieldsValue({'costCenter1Fields2': ''})
            this.props.form.setFieldsValue({'costCenter1Fields3': ''})

            this.setState({
            cost1ShowInputSel: true
          });
            break;
          case 'costCenter2':
            this.props.form.setFieldsValue({'costCenter2Fields2': ''})
            this.props.form.setFieldsValue({'costCenter2Fields3': ''})
            this.setState({
            cost2ShowInputSel: true
          });
            break;
          case 'costCenter3':
            this.props.form.setFieldsValue({'costCenter3Fields2': ''})
            this.props.form.setFieldsValue({'costCenter3Fields3': ''})
            this.setState({
            cost3ShowInputSel: true
          });
            break;
          case 'costCenter4':
            this.props.form.setFieldsValue({'costCenter4Fields2': ''})
            this.props.form.setFieldsValue({'costCenter4Fields3': ''})
            this.setState({
            cost4ShowInputSel: true
          });
            break;
          case 'costCenter5':
            this.props.form.setFieldsValue({'costCenter5Fields2': ''})
            this.props.form.setFieldsValue({'costCenter5Fields3': ''})
            this.setState({
            cost5ShowInputSel: true
          });
            break;
        }
      }
    }

  }
  //选择第二个select
  handleCenter1Fields2Change = (value, option, key) => {
    const {options} = this.state;
    if(value){
      this.setState({
        cost1ThirdSelDisabled: false,
      })
      options.map((item, index) => {
        if(item.show === value){
          switch (key) {
            case 'costCenter1':this.setState({
              fields1ThrOptions: item.valueTypes
            });
              break;
            case 'costCenter2':this.setState({
              fields2ThrOptions: item.valueTypes
            });
              break;
            case 'costCenter3':this.setState({
              fields3ThrOptions: item.valueTypes
            });
              break;
            case 'costCenter4':this.setState({
              fields4ThrOptions: item.valueTypes
            });
              break;
            case 'costCenter5':this.setState({
              fields5ThrOptions: item.valueTypes
            });
              break;
          }
        }
      })
      switch (key) {
        case 'costCenter1':
          this.props.form.setFieldsValue({'costCenter1Fields3': ''})
          this.setState({
          cost1ThirdSelDisabled: false
        });
          break;
        case 'costCenter2':
          this.props.form.setFieldsValue({'costCenter2Fields3': ''})
          this.setState({
          cost2ThirdSelDisabled: false
        });
          break;
        case 'costCenter3':
          this.props.form.setFieldsValue({'costCenter3Fields3': ''})
          this.setState({
          cost3ThirdSelDisabled: false
        });
          break;
        case 'costCenter4':
          this.props.form.setFieldsValue({'costCenter4Fields3': ''})
          this.setState({
          cost4ThirdSelDisabled: false
        });
          break;
        case 'costCenter5':
          this.props.form.setFieldsValue({'costCenter5Fields3': ''})
          this.setState({
          cost5ThirdSelDisabled: false
        });
          break;
      }
    }
  }
  //初始化页面时5个自定义字段里的每组的第1个select显示的值
  initSelect1Value = (key) => {
    const {costCenterCustom} = this.state;
    for (let keyName in costCenterCustom){
      if(keyName === key){
        if(!costCenterCustom[keyName]['type']){
          return ''
        }else if(costCenterCustom[keyName]['type'] === 1001){
          return this.$t("accounting.source.stateValue")/*固定值*/
        }else{
          return this.$t("form.setting.supplier.system.filed")/*系统字段*/
        }
      }
    }
  }
  //初始化页面时5个自定义字段里的每组的第2个select显示的值
  initSelect2Value = (key) => {
    const {costCenterCustom, options} = this.state;
    for (let keyName in costCenterCustom){
      if(keyName === key) {
        if(costCenterCustom[key]['index'] !== '' && costCenterCustom[key]['index'] !== null && options[costCenterCustom[key]['index']]){
          return options[costCenterCustom[key]['index']].show
        }else{
          return ;
        }
      }
    }
  }
  //初始化页面时5个自定义字段里的每组的第3个select显示的值
  initSelect3Value = (key) => {
    const {costCenterCustom, options} = this.state;
    let param;
    for (let keyName in costCenterCustom){
      if(keyName === key) {
        if(costCenterCustom[key]['index'] && options[costCenterCustom[key]['index']]){
          options[costCenterCustom[key]['index']]['valueTypes'].map(item => {
              if(costCenterCustom[key]['valueScope'] === item.viewValue){
                param = item.viewName
              }
            }
          )
        } else{
          param =  '';
        }
      }
    }
    return param;
  }
//点击保存
  onSaveClick = () => {
    const {propertyList} = this.props;
    const {formOID} = this.props.params;
    const {options, fields3Options, expiryDateControl,
      fields1ThrOptions, fields2ThrOptions, fields3ThrOptions, fields4ThrOptions, fields5ThrOptions,
      controlFieldsFlight, controlFieldsHotel, controlFieldsTrain, costCenterCustom} = this.state;
    let travelFlight = true,
      hotelItinerary = false,
      travelTrain = true,
      travelOther = true,
      travelAllowances = true,
      travelRemark = true;
    let error = false;
    propertyList.map(item => {
      if(item.propertyName === 'ca.travel.flight.disabled') {
        travelFlight = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'hotel.itinerary.enable'){
        hotelItinerary = (item.propertyValue === 'true' || item.propertyValue === true) ? true : false;
      }
      if(item.propertyName === 'ca.travel.train.disabled'){
        travelTrain = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'ca.travel.other.disabled'){
        travelOther = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'travel.allowance.disabled'){
        travelAllowances = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'ca.travel.remark.disabled'){
        travelRemark = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
    })
    this.props.form.validateFieldsAndScroll((err,values) => {
      if (!err) {
        const {controlFieldsFlight, controlFieldsHotel, controlFieldsTrain, costCenterCustom} = this.state;
        expiryDateControl.propertyValue = values.expiryDateControl;
        this.setState({
          manageType : values.manageType === this.$t("form.setting.supplier.merge.travel")/*合并行程*/ ? 1001 : 1002
        })
        if(values.costCenter1Fields1 === this.$t("accounting.source.stateValue")/*固定值*/){
          costCenterCustom.costCenter1.type = 1001
          costCenterCustom.costCenter1.value = values.costCenter1Input
        }
        if(values.costCenter2Fields1 === this.$t("accounting.source.stateValue")/*固定值*/){
          costCenterCustom.costCenter2.type = 1001
          costCenterCustom.costCenter2.value = values.costCenter2Input
        }
        if(values.costCenter3Fields1 === this.$t("accounting.source.stateValue")/*固定值*/){
          costCenterCustom.costCenter3.type = 1001
          costCenterCustom.costCenter3.value = values.costCenter3Input
        }
        if(values.costCenter4Fields1 === this.$t("accounting.source.stateValue")/*固定值*/){
          costCenterCustom.costCenter4.type = 1001
          costCenterCustom.costCenter4.value = values.costCenter4Input
        }
        if(values.costCenter5Fields1 === this.$t("accounting.source.stateValue")/*固定值*/){
          costCenterCustom.costCenter5.type = 1001
          costCenterCustom.costCenter5.value = values.costCenter5Input
        }
        values.costCenter1Fields2 && options.map((item, index) => {
          if(item.show === values.costCenter1Fields2){
            costCenterCustom.costCenter1.index = index;
            costCenterCustom.costCenter1.type = item.type;
            costCenterCustom.costCenter1.value = item.value;
          }
        })
        values.costCenter2Fields2 && options.map((item, index) => {
          if(item.show === values.costCenter2Fields2){
            costCenterCustom.costCenter2.index = index;
            costCenterCustom.costCenter2.type = item.type;
            costCenterCustom.costCenter2.value = item.value;
          }
        })
        values.costCenter3Fields2 && options.map((item, index) => {
          if(item.show === values.costCenter3Fields2){
            costCenterCustom.costCenter3.index = index;
            costCenterCustom.costCenter3.type = item.type;
            costCenterCustom.costCenter3.value = item.value;
          }
        })
        values.costCenter4Fields2 && options.map((item, index) => {
          if(item.show === values.costCenter4Fields2){
            costCenterCustom.costCenter4.index = index;
            costCenterCustom.costCenter4.type = item.type;
            costCenterCustom.costCenter4.value = item.value;
          }
        })
        values.costCenter5Fields2 && options.map((item, index) => {
          if(item.show === values.costCenter5Fields2){
            costCenterCustom.costCenter5.index = index;
            costCenterCustom.costCenter5.type = item.type;
            costCenterCustom.costCenter5.value = item.value;
          }
        })
        values.costCenter1Fields3 && fields1ThrOptions.map(item => {
          if(item.viewName === values.costCenter1Fields3){
            costCenterCustom.costCenter1.valueScope = item.viewValue;
          }
        })
        values.costCenter2Fields3 && fields2ThrOptions.map(item => {
          if(item.viewName === values.costCenter2Fields3){
            costCenterCustom.costCenter2.valueScope = item.viewValue;
          }
        })
        values.costCenter3Fields3 && fields3ThrOptions.map(item => {
          if(item.viewName === values.costCenter3Fields3){
            costCenterCustom.costCenter3.valueScope = item.viewValue;
          }
        })
        values.costCenter4Fields3 && fields4ThrOptions.map(item => {
          if(item.viewName === values.costCenter4Fields3){
            costCenterCustom.costCenter4.valueScope = item.viewValue;
          }
        })
        values.costCenter5Fields3 && fields5ThrOptions.map(item => {
          if(item.viewName === values.costCenter5Fields3){
            costCenterCustom.costCenter5.valueScope = item.viewValue;
          }
        })
        for(let keyName1 in values){
          if(typeof(values[keyName1]) === "object"){
            for(let keyName2 in values[keyName1]){
              if(keyName2 !== 'preBookingDays'){
                if(!this.state[keyName1][keyName2]){
                  this.state[keyName1][keyName2] = ''
                }
                Object.assign(this.state[keyName1][keyName2], values[keyName1][keyName2])
              }else{
                this.state.controlFieldsFlight.preBookingDays = values.controlFieldsFlight.preBookingDays
              }
            }
          }
        }
        for(let keyFlight in controlFieldsFlight) {
          if (keyFlight !== 'preBookingDays') {
            controlFieldsFlight[keyFlight]['enable'] = controlFieldsFlight['show'] || controlFieldsFlight['required'] || controlFieldsFlight['control']
          }
        }
        for(let keyHotel in controlFieldsHotel){
          controlFieldsHotel[keyHotel]['enable'] = controlFieldsHotel['show'] || controlFieldsHotel['required'] || controlFieldsHotel['control']
        }
        for(let keyTrain in controlFieldsTrain){
          controlFieldsTrain[keyTrain]['enable'] = controlFieldsTrain['show'] || controlFieldsTrain['required'] || controlFieldsTrain['control']
        }
        for(let key in costCenterCustom){
          if(costCenterCustom[key]['enabled'] === true){
            if(costCenterCustom[key]['type'] === null){
              message.error(this.$t('extend.field.name.no.empty'))
              error = true;
            }else{
              if(costCenterCustom[key]['type'] === 1001){
                costCenterCustom[key]['index'] = null;
                costCenterCustom[key]['valueScope'] = null;
                if(costCenterCustom[key]['value'] === null){
                  message.error(this.$t('extend.field.name.no.empty'))
                  error = true;
                }
              }else{
                if(costCenterCustom[key]['index'] === null || costCenterCustom[key]['valueScope'] === null){
                  message.error(this.$t('extend.field.name.no.empty'))
                  error = true;
                }
                if (costCenterCustom[key]['valueScope']) {
                  switch (key) {
                    case 'costCenter1':
                      if (!values.costCenter1Fields3) {
                        message.error(this.$t('extend.field.name.no.empty'));
                        error = true;
                      }
                      break;
                    case 'costCenter2':
                      if (!values.costCenter2Fields3) {
                        message.error(this.$t('extend.field.name.no.empty'));
                        error = true;
                      }
                      break;
                    case 'costCenter3':
                      if (!values.costCenter3Fields3) {
                        message.error(this.$t('extend.field.name.no.empty'));
                        error = true;
                      }
                      break;
                    case 'costCenter4':
                      if (!values.costCenter4Fields3) {
                        message.error(this.$t('extend.field.name.no.empty'));
                        error = true;
                      }
                      break;
                    case 'costCenter5':
                      if (!values.costCenter5Fields3) {
                        message.error(this.$t('extend.field.name.no.empty'));
                        error = true;
                      }
                      break;
                  }
                }
              }
            }
          }else if(costCenterCustom[key]['enabled'] === false){
            //都禁用了还校验个什么东西，置空就行了
            costCenterCustom[key].type = null;
            costCenterCustom[key].value = null;
            costCenterCustom[key].valueScope = null;
            costCenterCustom[key].index = null;
          }
        }
        !error &&  this.setState({
          controlFieldsFlight,
          controlFieldsHotel,
          controlFieldsTrain,
          costCenterCustom
        }, () => {
          //提交前处理数据
          let flightField = JSON.parse(JSON.stringify(this.state.controlFieldsFlight));
          let trainField = JSON.parse(JSON.stringify(this.state.controlFieldsTrain));
          let hotelField = JSON.parse(JSON.stringify(this.state.controlFieldsHotel));
          this.processConfig(flightField);
          this.processConfig(trainField);
          this.processConfig(hotelField);
          let params = {
            controlFieldsFlight: JSON.stringify(flightField),
            controlFieldsHotel: JSON.stringify(hotelField),
            controlFieldsTrain: JSON.stringify(trainField),
            costCenterCustom: JSON.stringify(this.state.costCenterCustom),
            manageType: values.manageType === this.$t("form.setting.supplier.merge.travel")/*合并行程*/ ? 1001 : 1002,
            'ca.travel.flight.disabled': !travelFlight,
            'hotel.itinerary.enable': hotelItinerary,
            'ca.travel.train.disabled': !travelTrain,
            'ca.travel.other.disabled': !travelOther,
            'travel.allowance.disabled': !travelAllowances,
            'ca.travel.deactivatedate.enabled': expiryDateControl.propertyValue,
            'ca.travel.remark.disabled': !travelRemark,
          }
          formService.saveSupplierForm(formOID, params).then(res => {
            if(res.status ===  200) {
              message.success(this.$t("invoice.management.save.success")/*保存成功*/);
              this.props.saveHandle(true)
            }else{
              message.error(this.$t("bookingManagement.save.fail")/*保存失败*/)
            }
            this.setState({
              disabled: true,
              isEditing: false,
            })
          })
        })
      }
    })
  }

  //提交前处理数据，维护enable字段
  processConfig = (fields) => {
    let key = '';
    for (key in fields) {
      if (key !== 'preBookingDays') {
        //有一个为false时enable字段就为false
        if (fields[key].control && fields[key].show && fields[key].required) {
          fields[key].enable = true;
        } else {
          fields[key].enable = false;
        }
      }
    }
    if (fields.hasOwnProperty('departEndDate')) {
      fields['departEndDate'].enable = fields['departBeginDate'].enable;
      fields['departEndDate'].show = fields['departBeginDate'].show;
      fields['departEndDate'].required = fields['departBeginDate'].required;
      fields['departEndDate'].control = fields['departBeginDate'].control;
    }
    if (fields.hasOwnProperty('returnBeginDate')) {
      fields['returnBeginDate'].enable = fields['returnEndDate'].enable;
      fields['returnBeginDate'].show = fields['returnEndDate'].show;
      fields['returnBeginDate'].required = fields['returnEndDate'].required;
      fields['returnBeginDate'].control = fields['returnEndDate'].control;
    }
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    const {loading, disabled, controlFieldsFlight, controlFieldsHotel, controlFieldsTrain, manageType,
      expiryDateControl, options,isEditing, fields3Options,costCenterCustom,
      fields1ThrOptions,fields2ThrOptions,fields3ThrOptions,fields4ThrOptions,fields5ThrOptions,
      cost1ShowInputSel, cost2ShowInputSel, cost3ShowInputSel, cost4ShowInputSel,cost5ShowInputSel,
      cost1FirSelDisabled, cost2FirSelDisabled, cost3FirSelDisabled, cost4FirSelDisabled, cost5FirSelDisabled,
      cost1ThirdSelDisabled, cost2ThirdSelDisabled, cost3ThirdSelDisabled, cost4ThirdSelDisabled,
      cost5ThirdSelDisabled,} = this.state;
    return (
      options && options.length ?
        <Spin spinning={loading}>
          <div className='form-setting-supplier'>
            <div className='supplier-alert'>
              <Alert
                message={this.$t("common.help")/*帮助提示*/}
                description={this.$t("form.setting.travel.info.to.supplier")/*下方的设置决定了供应商如何对差旅行程管控，若启用相应功能后，汇联易会将相应信息传递给供应商*/}
                type="info"
                showIcon/>
            </div>
            <Form hideRequiredMark={true}>
              <div className='supplier-global'>
                <span className='supplier-module-title'>{this.$t("form.setting.supplier.global")/*全局*/}</span>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.travel.control.mode")/*行程管控模式*/}>
                    <Divider dashed/>
                    {getFieldDecorator('manageType', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: manageType === 1001 ? this.$t("form.setting.supplier.merge.travel")/*合并行程*/ : this.$t("form.setting.supplier.independent.travel")/*独立行程*/
                    })(
                      <RadioGroup disabled={disabled} >
                        <Radio value={this.$t("form.setting.supplier.independent.travel")/*独立行程*/}>{this.$t("form.setting.supplier.independent.travel")/*独立行程*/}</Radio>
                        <Radio value={this.$t("form.setting.supplier.merge.travel")/*合并行程*/} checked=''>{this.$t("form.setting.supplier.merge.travel")/*合并行程*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <div className='supplier-remarks'>
                    <Row>
                      <Col span={1}>{this.$t("common.remark")/*备注*/}</Col>
                      <Col span={20}>
                        <div>
                          {/*合并行程为携程和中旅特有，若其他供应商设置为合并行程，视为采用独立行程模式。*/}
                          {this.$t("form.setting.supplier.independent.mode")/*修改成功*/}
                        </div>
                        <div>
                          {/*[独立行程]严格按照每一段行程的出发城市和到达城市进行管控。*/}
                          {this.$t("form.setting.supplier.merge.rules")/*修改成功*/}
                        </div>
                        <div>
                          {/*[合并行程]按申请单中出发城市和达到城市的合集进行管控。*/}
                          {this.$t("form.setting.supplier.independent.rules")/*修改成功*/}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.validity.control")/*有效期管控*/}>
                    <Divider dashed/>
                    {getFieldDecorator('expiryDateControl', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: expiryDateControl.propertyValue === 'true' || expiryDateControl.propertyValue === true ? true : false
                    })(
                      <RadioGroup disabled={disabled} >
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <div className='supplier-remarks'>
                    {this.$t("form.setting.supplier.remark.xiecheng")/*备注：携程特有。*/}
                  </div>
                </div>
                <div className='supplier-module-switch'>
                  <FormItem label={this.$t("form.setting.supplier.cost.center1")/*成本中心1*/}>
                    {getFieldDecorator('costCenterCustom.costCenter1.enabled', {
                      rules: [{
                        required: false,
                      }],
                      valuePropName: 'checked',
                      initialValue: costCenterCustom.costCenter1.enabled
                    })(
                      <Switch onChange={(e) => this.switchChange(e, 'costCenter1')} disabled={disabled}/>
                    )}
                  </FormItem>
                  <Divider dashed />
                  <div className='costCenter-selects'>
                    <div className='costCenter-one-select'>
                      <FormItem>
                        {getFieldDecorator('costCenter1Fields1', {
                          rules: [{
                            required: false
                          }],
                          initialValue: this.initSelect1Value('costCenter1'),
                        })(
                          <Select style={{width:  250}}
                                  placeholder={this.$t("common.please.select")/*请选择*/}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  disabled={disabled || cost1FirSelDisabled}
                                  onSelect={(value,option,key) => this.handleCenter1Fields1Change(value,option,'costCenter1')}>
                            <Option value={this.$t("accounting.source.stateValue")/*固定值*/}>{this.$t("accounting.source.stateValue")/*固定值*/}</Option>
                            <Option value={this.$t("form.setting.supplier.system.filed")/*系统字段*/}>{this.$t("form.setting.supplier.system.filed")/*系统字段*/}</Option>
                          </Select>
                        )}
                      </FormItem>
                    </div>
                    {
                      cost1ShowInputSel &&
                      <div className='costCenter-two-selects' >
                        <div className='costCenter-first-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter1Fields2', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect2Value('costCenter1'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost1FirSelDisabled}
                                      onSelect={(value, option, key) => this.handleCenter1Fields2Change(value, option, 'costCenter1')}>
                                {options.map((item, index) => {
                                  return item.valueTypes && <Option value={item.show} key={index}>{item.show}</Option>
                                })}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                        <div className='costCenter-second-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter1Fields3', {
                              rules: [{
                                required: false/*字段名称不能为空*/
                              }],
                              initialValue: this.initSelect3Value('costCenter1'),
                            })(
                              <Select style={{width:  250}}
                                      disabled={disabled || cost1FirSelDisabled || cost1ThirdSelDisabled}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}>
                                {fields1ThrOptions && fields1ThrOptions.map((item, index) => {
                                    return <Option value={item.viewName} key={index}>{item.viewName}</Option>
                                  }
                                )}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                      </div>
                    }
                    { cost1ShowInputSel === false &&
                    <div className='costCenterInput'>
                      <FormItem>
                        {getFieldDecorator('costCenterCustom.costCenter1.value', {
                          rules: [{
                            required: false
                          }],
                          initialValue: costCenterCustom.costCenter1.value,
                        })(
                          <Input style={{width:  250}}
                                 placeholder={this.$t("common.please.enter")/*请输入固定值*/}
                                 disabled={disabled || cost1FirSelDisabled}/>
                        )}
                      </FormItem>
                    </div>
                    }
                  </div>
                  <div className='supplier-remarks'>
                    {this.$t("form.setting.supplier.remark.meiya")/*备注：携程及美亚特有。*/}
                  </div>
                </div>
                <div className='supplier-module-switch'>
                  <FormItem label={this.$t("form.setting.supplier.cost.center2")/*成本中心2*/}>
                    {getFieldDecorator('costCenterCustom.costCenter2.enabled', {
                      rules: [{
                        required: false,
                      }],
                      valuePropName: 'checked',
                      initialValue: costCenterCustom.costCenter2.enabled
                    })(
                      <Switch onChange={(e) => this.switchChange(e, 'costCenter2')} disabled={disabled}/>
                    )}
                  </FormItem>
                  <Divider dashed />
                  <div className='costCenter-selects'>
                    <div className='costCenter-one-select'>
                      <FormItem>
                        {getFieldDecorator('costCenter2Fields1', {
                          rules: [{
                            required: false
                          }],
                          initialValue: this.initSelect1Value('costCenter2'),
                        })(
                          <Select style={{width:  250}}
                                  placeholder={this.$t("common.please.select")/*请选择*/}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  disabled={disabled || cost2FirSelDisabled}
                                  onSelect={(value,option) => this.handleCenter1Fields1Change(value,option,'costCenter2')}>
                            <Option value={this.$t("accounting.source.stateValue")/*固定值*/}>{this.$t("accounting.source.stateValue")/*固定值*/}</Option>
                            <Option value={this.$t("form.setting.supplier.system.filed")/*系统字段*/}>{this.$t("form.setting.supplier.system.filed")/*系统字段*/}</Option>
                          </Select>
                        )}
                      </FormItem>
                    </div>
                    {
                      cost2ShowInputSel &&
                      <div className='costCenter-two-selects'>
                        <div className='costCenter-first-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter2Fields2', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect2Value('costCenter2'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost2FirSelDisabled}
                                      onSelect={(value, option) => this.handleCenter1Fields2Change(value, option, 'costCenter2')}>
                                {options.map((item, index) => {
                                  return item.valueTypes && <Option value={item.show} key={index}>{item.show}</Option>
                                })}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                        <div className='costCenter-second-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter2Fields3', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect3Value('costCenter2'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost2FirSelDisabled || cost2ThirdSelDisabled}>
                                {fields2ThrOptions && fields2ThrOptions.map((item, index) => {
                                    return <Option value={item.viewName} key={index}>{item.viewName}</Option>
                                  }
                                )}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                      </div>
                    }
                    { cost2ShowInputSel === false &&
                    <div className='costCenterInput'>
                      <FormItem>
                        {getFieldDecorator('costCenterCustom.costCenter2.value', {
                          rules: [{
                            required: false
                          }],
                          initialValue: costCenterCustom.costCenter2.value,
                        })(
                          <Input style={{width:  250}}
                                 placeholder={this.$t("common.please.enter")/*请输入固定值*/}
                                 disabled={disabled || cost2FirSelDisabled}/>
                        )}
                      </FormItem>
                    </div>
                    }
                  </div>
                  <div className='supplier-remarks'>
                    {this.$t("form.setting.supplier.remark.xiecheng")/*备注：携程特有。*/}
                  </div>
                </div>
                <div className='supplier-module-switch'>
                  <FormItem label={this.$t("form.setting.supplier.cost.center3")/*成本中心3*/}>
                    {getFieldDecorator('costCenterCustom.costCenter3.enabled', {
                      rules: [{
                        required: false,
                      }],
                      valuePropName: 'checked',
                      initialValue: costCenterCustom.costCenter3.enabled
                    })(
                      <Switch  onChange={(e) => this.switchChange(e, 'costCenter3')} disabled={disabled}/>
                    )}
                  </FormItem>
                  <Divider dashed />
                  <div className='costCenter-selects'>
                    <div className='costCenter-one-select'>
                      <FormItem>
                        {getFieldDecorator('costCenter3Fields1', {
                          rules: [{
                            required: false
                          }],
                          initialValue: this.initSelect1Value('costCenter3'),
                        })(
                          <Select style={{width:  250}}
                                  placeholder={this.$t("common.please.select")/*请选择*/}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  disabled={disabled || cost3FirSelDisabled }
                                  onSelect={(value,option) => this.handleCenter1Fields1Change(value,option,'costCenter3')}>
                            <Option value={this.$t("accounting.source.stateValue")/*固定值*/}>{this.$t("accounting.source.stateValue")/*固定值*/}</Option>
                            <Option value={this.$t("form.setting.supplier.system.filed")/*系统字段*/}>{this.$t("form.setting.supplier.system.filed")/*系统字段*/}</Option>
                          </Select>
                        )}
                      </FormItem>
                    </div>
                    {
                      cost3ShowInputSel &&
                      <div className='costCenter-two-selects'>
                        <div className='costCenter-first-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter3Fields2', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect2Value('costCenter3'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost3FirSelDisabled}
                                      onSelect={(value, option) => this.handleCenter1Fields2Change(value, option, 'costCenter3')}>
                                {options.map((item, index) => {
                                  return item.valueTypes && <Option value={item.show} key={index}>{item.show}</Option>
                                })}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                        <div className='costCenter-second-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter3Fields3', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect3Value('costCenter3'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost3FirSelDisabled || cost3ThirdSelDisabled}>
                                {fields3ThrOptions && fields3ThrOptions.map((item, index) => {
                                    return <Option value={item.viewName} key={index}>{item.viewName}</Option>
                                  }
                                )}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                      </div>
                    }
                    { cost3ShowInputSel === false &&
                    <div className='costCenterInput'>
                      <FormItem>
                        {getFieldDecorator('costCenterCustom.costCenter3.value', {
                          rules: [{
                            required: false
                          }],
                          initialValue: costCenterCustom.costCenter3.value,
                        })(
                          <Input style={{width:  250}}
                                 placeholder={this.$t("common.please.enter")/*请输入固定值*/}
                                 disabled={disabled || cost3FirSelDisabled}/>
                        )}
                      </FormItem>
                    </div>
                    }
                  </div>
                  <div className='supplier-remarks'>
                    {this.$t("form.setting.supplier.remark.xiecheng")/*备注：携程特有。*/}
                  </div>
                </div>
                <div className='supplier-module-switch'>
                  <FormItem label={this.$t("form.setting.supplier.custom.field1")/*自定义字段1*/}>
                    {getFieldDecorator('costCenterCustom.costCenter4.enabled', {
                      rules: [{
                        required: false,
                      }],
                      valuePropName: 'checked',
                      initialValue: costCenterCustom.costCenter4.enabled
                    })(
                      <Switch onChange={(e) => this.switchChange(e, 'costCenter4')} disabled={disabled}/>
                    )}
                  </FormItem>
                  <Divider dashed />
                  <div className='costCenter-selects'>
                    <div className='costCenter-one-select'>
                      <FormItem>
                        {getFieldDecorator('costCenter4Fields1', {
                          rules: [{
                            required: false
                          }],
                          initialValue: this.initSelect1Value('costCenter4'),
                        })(
                          <Select style={{width:  250}}
                                  placeholder={this.$t("common.please.select")/*请选择*/}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  disabled={disabled || cost4FirSelDisabled}
                                  onSelect={(value,option) => this.handleCenter1Fields1Change(value,option,'costCenter4')}>
                            <Option value={this.$t("accounting.source.stateValue")/*固定值*/}>{this.$t("accounting.source.stateValue")/*固定值*/}</Option>
                            <Option value={this.$t("form.setting.supplier.system.filed")/*系统字段*/}>{this.$t("form.setting.supplier.system.filed")/*系统字段*/}</Option>
                          </Select>
                        )}
                      </FormItem>
                    </div>
                    {
                      cost4ShowInputSel &&
                      <div className='costCenter-two-selects'>
                        <div className='costCenter-first-select'>
                          <FormItem >
                            {getFieldDecorator('costCenter4Fields2', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect2Value('costCenter4'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost4FirSelDisabled}
                                      onSelect={(value, option, key) => this.handleCenter1Fields2Change(value, option, 'costCenter4')}>
                                {options.map((item, index) => {
                                  return item.valueTypes && <Option value={item.show} key={index}>{item.show}</Option>
                                })}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                        <div className='costCenter-second-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter4Fields3', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect3Value('costCenter4'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost4FirSelDisabled || cost4ThirdSelDisabled}>
                                {fields4ThrOptions && fields4ThrOptions.map((item, index) => {
                                    return <Option value={item.viewName} key={index}>{item.viewName}</Option>
                                  }
                                )}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                      </div>
                    }
                    { cost4ShowInputSel === false &&
                    <div className='costCenterInput'>
                      <FormItem>
                        {getFieldDecorator('costCenterCustom.costCenter4.value', {
                          rules: [{
                            required: false
                          }],
                          initialValue: costCenterCustom.costCenter4.value,
                        })(
                          <Input style={{width:  250}}
                                 placeholder={this.$t("common.please.enter")/*请输入固定值*/}
                                 disabled={disabled || cost4FirSelDisabled}/>
                        )}
                      </FormItem>
                    </div>
                    }
                  </div>
                  <div className='supplier-remarks'>
                    {this.$t("form.setting.supplier.remark.xiecheng")/*备注：携程特有。*/}
                  </div>
                </div>
                <div className='supplier-module-switch'>
                  <FormItem label={this.$t("form.setting.supplier.custom.field2")/*自定义字段2*/}>
                    {getFieldDecorator('costCenterCustom.costCenter5.enabled', {
                      rules: [{
                        required: false,
                      }],
                      valuePropName: 'checked',
                      initialValue: costCenterCustom.costCenter5.enabled
                    })(
                      <Switch onChange={(e, key) => this.switchChange(e, 'costCenter5')} disabled={disabled}/>
                    )}
                  </FormItem>
                  <Divider dashed />
                  <div className='costCenter-selects'>
                    <div className='costCenter-one-select'>
                      <FormItem>
                        {getFieldDecorator('costCenter5Fields1', {
                          rules: [{
                            required: false
                          }],
                          initialValue: this.initSelect1Value('costCenter5'),
                        })(
                          <Select style={{width:  250}}
                                  placeholder={this.$t("common.please.select")/*请选择*/}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  disabled={disabled || cost5FirSelDisabled}
                                  onSelect={(value,option,key) => this.handleCenter1Fields1Change(value,option,'costCenter5')}>
                            <Option value={this.$t("accounting.source.stateValue")/*固定值*/}>{this.$t("accounting.source.stateValue")/*固定值*/}</Option>
                            <Option value={this.$t("form.setting.supplier.system.filed")/*系统字段*/}>{this.$t("form.setting.supplier.system.filed")/*系统字段*/}</Option>
                          </Select>
                        )}
                      </FormItem>
                    </div>
                    {
                      cost5ShowInputSel &&
                      <div className='costCenter-two-selects'>
                        <div className='costCenter-first-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter5Fields2', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect2Value('costCenter5'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost5FirSelDisabled}
                                      onSelect={(value, option, key) => this.handleCenter1Fields2Change(value, option, 'costCenter5')}>
                                {options.map((item, index) => {
                                  return item.valueTypes && <Option value={item.show} key={index}>{item.show}</Option>
                                })}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                        <div className='costCenter-second-select'>
                          <FormItem>
                            {getFieldDecorator('costCenter5Fields3', {
                              rules: [{
                                required: false
                              }],
                              initialValue: this.initSelect3Value('costCenter5'),
                            })(
                              <Select style={{width:  250}}
                                      placeholder={this.$t("common.please.select")/*请选择*/}
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      disabled={disabled || cost5FirSelDisabled ||  cost5ThirdSelDisabled}>
                                {fields5ThrOptions && fields5ThrOptions.map((item, index) => {
                                    return <Option value={item.viewName} key={index}>{item.viewName}</Option>
                                  }
                                )}
                              </Select>
                            )}
                          </FormItem>
                        </div>
                      </div>
                    }
                    { cost5ShowInputSel === false &&
                    <div className='costCenterInput'>
                      <FormItem>
                        {getFieldDecorator('costCenterCustom.costCenter5.value', {
                          rules: [{
                            required: false
                          }],
                          initialValue: costCenterCustom.costCenter4.value,
                        })(
                          <Input style={{width: 250}}
                                 placeholder={this.$t("common.please.enter")/*请输入固定值*/}
                                 disabled={disabled || cost5FirSelDisabled}/>
                        )}
                      </FormItem>
                    </div>
                    }
                  </div>
                  <div className='supplier-remarks'>
                    {this.$t("form.setting.supplier.remark.xiecheng")/*备注：携程特有。*/}
                  </div>
                </div>
              </div>
              <div className='supplierFlight-ticket'>
                <span className='supplier-module-title'>{this.$t("travel.policy.ticket")/*机票*/}</span>
                <div className='supplier-module'>
                  <FormItem label={this.$t("itinerary.public.slide.departureCity")/*出发城市*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.fromCities.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsFlight.fromCities.control,
                    })(
                      <RadioGroup name='fromCities' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("check.center.reachCity")/*到达城市*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.toCities.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsFlight.toCities.control,
                    })(
                      <RadioGroup name='toCities' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("itinerary.public.slide.departure")/*出发日期*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.departBeginDate.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsFlight.departBeginDate.control,
                    })(
                      <RadioGroup name='departBeginDate' disabled={disabled} >
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <div className='supplier-remarks'>
                    {/*备注：通过设置浮动天数，可允许员工提前或延后出发。*/}
                    {this.$t("form.setting.supplier.flost.days.delay")/*修改成功*/}
                  </div>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.domestic.ticket.depart")/*国内机票出发日期-浮动天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.departBeginDate.floatDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsFlight.departBeginDate.floatDays,
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        &nbsp;{this.$t("security.day")/*天*/}
                      </InputNumber>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.international.ticket")/*国际机票出发日期-浮动天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.departBeginDate.internationalFloatDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsFlight.departBeginDate.internationalFloatDays,
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        &nbsp;{this.$t("security.day")/*天*/}
                      </InputNumber>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.travel.back.tracking.date")/*返程日期*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.returnEndDate.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsFlight.returnEndDate.control,
                    })(
                      <RadioGroup name='returnEndDate' disabled={disabled} >
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <div className='supplier-remarks'>
                    {/*备注：通过设置浮动天数，可允许员工提前或延后出发。*/}
                    {this.$t("form.setting.supplier.flost.days.delay")/*修改成功*/}
                  </div>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.domestic.ticket.tracking")/*国内机票返程日期-浮动天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.returnEndDate.floatDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsFlight.returnEndDate.floatDays,
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        &nbsp;{this.$t("security.day")/*天*/}
                      </InputNumber>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.international.ticket")/*国际机票出发日期-浮动天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.returnEndDate.internationalFloatDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsFlight.returnEndDate.internationalFloatDays,
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        &nbsp;{this.$t("security.day")/*天*/}
                      </InputNumber>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.pre-booking.days")/*提前预订天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.preBookingDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsFlight.preBookingDays
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        &nbsp;{this.$t("security.day")/*天*/}
                      </InputNumber>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.travel.set.out.begin")/*出发开始时间*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.takeOffBeginTime.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsFlight.takeOffBeginTime.control,
                    })(
                      <RadioGroup name='takeOffBeginTime' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.travel.set.out.end")/*出发结束时间*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.takeOffEndTime.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.takeOffEndTime.control,
                    })(
                      <RadioGroup name='takeOffEndTime' disabled={disabled} >
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.travel.arrival.begin")/*到达开始时间*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.arrivalBeginTime.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.arrivalBeginTime.control,
                    })(
                      <RadioGroup name='arrivalBeginTime' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.travel.arrival.end")/*到达结束时间*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.arrivalEndTime.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.arrivalEndTime.control,
                    })(
                      <RadioGroup name='arrivalEndTime' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.domestic.name")/*国内出行人姓名*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.passengerList.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.passengerList.control,
                    })(
                      <RadioGroup name='passengerList' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.international.name")/*国际出行人姓名*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.internationalPassengerList.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.internationalPassengerList.control,
                    })(
                      <RadioGroup name='internationalPassengerList' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.traveler.numbers")/*出行人数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.travelerCount.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.travelerCount.control,
                    })(
                      <RadioGroup name='travelerCount' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("travel.policy.disco")/*折扣*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.discount.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.discount.control,
                    })(
                      <RadioGroup name='discount' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("request.detail.jd.price")/*价格*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.ticketPrice.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.ticketPrice.control,
                    })(
                      <RadioGroup name='ticketPrice' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <Divider dashed/>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("travel.policy.cabin")/*舱等*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsFlight.seatClass.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue:  controlFieldsFlight.seatClass.control,
                    })(
                      <RadioGroup name='seatClass' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
              </div>
              <div className='supplier-hotel'>
                <span className='supplier-module-title'>{this.$t("travel.policy.hotel")/*酒店*/}</span>
                <div className='supplier-module'>
                  <FormItem label={this.$t("itinerary.subsidy.edit.modal.city")/*城市*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.city.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsHotel.city.control,
                    })(
                      <RadioGroup name='cityHotel' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.traveler.name")/*出行人姓名*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.passenger.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsHotel.passenger.control,
                    })(
                      <RadioGroup name='passengerHotel' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.travel.rooms.number")/*房间数量*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.roomNumber.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsHotel.roomNumber.control,
                    })(
                      <RadioGroup name='roomNumberHotel' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.max.price")/*单价上限*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.maxPrice.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsHotel.maxPrice.control,
                    })(
                      <RadioGroup name='maxPriceHotel' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.min.price")/*单价下限*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.minPrice.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsHotel.minPrice.control,
                    })(
                      <RadioGroup name='minPriceHotel' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("itinerary.hotel.slide.check.in")/*入住日期*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.fromDate.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsHotel.fromDate.control,
                    })(
                      <RadioGroup name='fromDateHotel' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.check-in.date")/*入住日期-浮动天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.fromDate.floatDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsHotel.fromDate.floatDays,
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        {this.$t("security.day")/*天*/}&nbsp;
                      </InputNumber>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("expense.date.combined.check.out")/*离店日期*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.leaveDate.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsHotel.leaveDate.control,
                    })(
                      <RadioGroup name='leaveDateHotel' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.check-out.date")/*离店日期-浮动天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsHotel.leaveDate.floatDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsHotel.leaveDate.floatDays,
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        &nbsp;{this.$t("security.day")/*天*/}
                      </InputNumber>
                    )}
                  </FormItem>
                </div>
              </div>
              <div className='supplier-train'>
                <span className='supplier-module-title'>{this.$t("travel.policy.train")/*火车*/}</span>
                <div className='supplier-module'>
                  <FormItem label={this.$t("itinerary.public.slide.departureCity")/*出发城市*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsTrain.fromCity.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsTrain.fromCity.control,
                    })(
                      <RadioGroup name='fromCityTrain' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("check.center.reachCity")/*到达城市*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsTrain.toCity.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsTrain.toCity.control,
                    })(
                      <RadioGroup name='toCityTrain' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("itinerary.public.slide.departure")/*出发日期*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsTrain.departBeginDate.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsTrain.departBeginDate.control,
                    })(
                      <RadioGroup name='departBeginDateTrain' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                  <div className='supplier-remarks'>
                    {/*备注：通过设置浮动天数，可允许员工提前或延后出发。*/}
                    {this.$t("form.setting.supplier.flost.days.delay")/*修改成功*/}
                  </div>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.set.out.date")/*出发日期-浮动天数*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsTrain.departBeginDate.floatDays', {
                      rules: [{
                        required: false,
                      }],
                      initialValue: controlFieldsTrain.departBeginDate.floatDays,
                    })(
                      <InputNumber size='small' min={0} precision={0} disabled={disabled}>
                        &nbsp;{this.$t("security.day")/*天*/}
                      </InputNumber>
                    )}
                  </FormItem>
                  <div className='supplier-remarks'>
                    {/*备注：通过设置浮动天数，可允许员工提前或延后出发。*/}
                    {this.$t("form.setting.supplier.flost.days.delay")/*修改成功*/}
                  </div>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("form.setting.supplier.traveler.name")/*出行人姓名*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsTrain.passengerList.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsTrain.passengerList.control,
                    })(
                      <RadioGroup name='passengerListTrain' disabled={disabled} >
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("request.detail.jd.price")/*价格*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsTrain.ticketPrice.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsTrain.ticketPrice.control,
                    })(
                      <RadioGroup name='ticketPriceTrain' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
                <div className='supplier-module'>
                  <FormItem label={this.$t("travel.policy.class")/*座席*/}>
                    <Divider dashed/>
                    {getFieldDecorator('controlFieldsTrain.seatClass.control', {
                      rules: [{
                        required: true,
                        message: this.$t("common.please.select")/*请选择*/
                      }],
                      initialValue: controlFieldsTrain.seatClass.control,
                    })(
                      <RadioGroup name='seatClassTrain' disabled={disabled}>
                        <Radio value={true}>{this.$t("common.yes")/*是*/}</Radio>
                        <Radio value={false}>{this.$t("common.no")/*否*/}</Radio>
                      </RadioGroup>
                    )}
                  </FormItem>
                </div>
              </div>
            </Form>
            <div className='form-setting-buttons'>
              {isEditing ?
                <div>
                  <Button type='primary' className='buttons-save' onClick={this.onSaveClick}>{this.$t("common.save")/*保存*/}</Button>
                  <Button type='primary' className='buttons-cancelEdit' onClick={this.cancelEditing}>{this.$t("form.setting.huilianyi.cancel.edit")/*取消编辑*/}</Button>
                  <Button type='default' 
                  onClick={() => {
                    this.props.dispatch(
                      routerRedux.push({
                          pathname: `/admin-setting/form-list`,
                      })
                  );
                  }}
                  >{this.$t("common.back")/*返回*/}</Button>
                </div>
                :
                <div>
                  <Button type='primary' className='buttons-edit' onClick={this.editClicked}>{this.$t("common.edit")/*编辑*/}</Button>
                  <Button type='default'
                   onClick={() => {
                    this.props.dispatch(
                      routerRedux.push({
                          pathname: `/admin-setting/form-list`,
                      })
                  );
                  }}
                  >{this.$t("common.back")/*返回*/}</Button>
                </div>
              }

            </div>
          </div>
        </Spin>
        :
        <div></div>
    )
  }
}
SupplierManagement.contextTypes = {
  router: PropTypes.object
};
function mapStateToProps(state) {
  return {
    profile: "01ffe44c-2f0a-453e-b4e2-33ee6664624a"
  }
}
const wrappedNewContract = Form.create()(SupplierManagement);
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewContract);
