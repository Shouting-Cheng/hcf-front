
import React from 'react';
import { connect } from 'dva';

import { Alert,  Checkbox, message, Button, Form, Divider} from 'antd';
import Table from 'widget/table'
const FormItem = Form.Item;
import formService from 'containers/setting/form/form.service'
import 'styles/setting/form/form-detail.scss'
// import menuRoute from "routes/menuRoute";
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router';


class TravelItinerarySetting extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      columns: [
        { title: this.$t("form.setting.travel.function.name")/*功能名称*/, dataIndex: 'name'},
        { title: this.$t("form.setting.travel.is.display")/*是否显示*/, dataIndex: 'show'},
        { title: this.$t("form.setting.travel.is.fill.in")/*是否必填*/, dataIndex: 'required'}
      ],
      data: [],
      controlFieldsFlight: {},
      controlFieldsHotel: {},
      manageType: {},
      controlFieldsTrain: {},
      costCenterCustom: {},
      disabled: true,
      isTicketShow: '',//是否显示机票行程
      isHotelShow: '',//是否显示酒店
      isTrainShow: '',//是否显示火车
      otherTransport: '',//是否显示其他交通
      travelAllowances: '',//是否显示差旅补贴
      travelDeactivatedate: '',// 没用的两个参数，接口调用的时候要用
      travelRemark: '',//页面里没用的两个参数，接口调用的时候要用
      isEditing: false,//是否点击编辑
    //   formManagement: menuRoute.getRouteItem('form-list', 'key'),//点击返回跳转到的页面
    }
  }
  componentWillMount(){
    this.initProperty();
  }
  //处于编辑状态时切换tab相当于点击取消编辑
  componentWillReceiveProps(nextProps) {
    if(nextProps.params.activeKey !== this.props.params.activeKey){
      this.state.isEditing && this.cancelEditing();
    }
  }
  //点击编辑
  editClicked = () => {
    this.setState({
      isEditing: true,
      disabled: false,
    }, () => {
      this.initTable()
    })
  }
  //点击取消编辑
  cancelEditing = () => {
    this.initProperty('cancelEdit');
  }

  //初始化property，以及取消修改的时候还原数据
  //type为cancelEdit操作取消修改的特殊逻辑
  initProperty = (type) => {
    const {propertyList} = this.props;
    const {formOid} = this.props.params;
    let isTicketShow0 = true,
      isHotelShow0 = false,
      isTrainShow0 = true,
      otherTransport0 = true,
      travelAllowances0 = true,
      travelDeactivatedate0 = false,
      travelRemark0 = true;
    propertyList.map(item => {
      if(item.propertyName === 'ca.travel.flight.disabled') {
        isTicketShow0 = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'hotel.itinerary.enable'){
        isHotelShow0 = (item.propertyValue === 'true' || item.propertyValue === true) ? true : false;
      }
      if(item.propertyName === 'ca.travel.train.disabled'){
        isTrainShow0 = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'ca.travel.other.disabled'){
        otherTransport0 = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'travel.allowance.disabled'){
        travelAllowances0 = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
      if(item.propertyName === 'ca.travel.deactivatedate.enabled'){
        travelDeactivatedate0 = (item.propertyValue === 'true' || item.propertyValue === true) ? true : false;
      }
      if(item.propertyName === 'ca.travel.remark.disabled'){
        travelRemark0 = (item.propertyValue === 'true' || item.propertyValue === true) ? false : true;
      }
    });
    if (type === 'cancelEdit') {
      this.setState({
        isEditing: false,
        disabled: true
      });
    }
    this.setState({
      isTicketShow: JSON.parse(JSON.stringify(isTicketShow0)),
      isHotelShow: JSON.parse(JSON.stringify(isHotelShow0)),
      isTrainShow: JSON.parse(JSON.stringify(isTrainShow0)),
      otherTransport: JSON.parse(JSON.stringify(otherTransport0)),
      travelAllowances: JSON.parse(JSON.stringify(travelAllowances0)),
      travelDeactivatedate: JSON.parse(JSON.stringify(travelDeactivatedate0)),
      travelRemark: JSON.parse(JSON.stringify(travelRemark0)),
      controlFieldsFlight: JSON.parse(JSON.stringify(this.props.data.controlFieldsFlight)),
      controlFieldsHotel: JSON.parse(JSON.stringify(this.props.data.controlFieldsHotel)),
      manageType: JSON.parse(JSON.stringify(this.props.data.manageType)),
      controlFieldsTrain: JSON.parse(JSON.stringify(this.props.data.controlFieldsTrain)),
      costCenterCustom: JSON.parse(JSON.stringify(this.props.data.costCenterCustom)),
    }, () => {
      this.initTable(type);
    });
  };

  //渲染表格内容
  initTable = (type) => {
    const {controlFieldsFlight, controlFieldsHotel, controlFieldsTrain, disabled,
            isTicketShow, isHotelShow, isTrainShow, otherTransport, travelAllowances} = this.state;
    const {getFieldDecorator} = this.props.form;
    if(type && type === 'cancelEdit'){
      this.props.form.resetFields();
    }
    let initTableData = [
      {
        name: this.$t("form.setting.travel.flight.ticket")/*机票行程*/,
        key: 'ticket',
        show:
          <FormItem>
            {getFieldDecorator('ticket', {
              rules: [{
                   required: false,
              }],
              valuePropName: 'checked',
              initialValue: isTicketShow
            })(
              <Checkbox disabled={disabled} onChange={(e)=>this.otherCheckboxChange(e, 'ticket', 'isTicketShow')}/>
            )}
          </FormItem>,
        required: '',
        children: [
          {
            name: this.$t("itinerary.public.slide.departureCity")/*出发城市*/,
            key: 'fromCities' ,
            show:
              <FormItem>
                {getFieldDecorator('fromCitiesS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.fromCities.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem>
                {getFieldDecorator('fromCitiesR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.fromCities.required
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'fromCitiesR', 'fromCities', 'required')}/>
                )}
              </FormItem>,
          },
          {
            name: this.$t("check.center.reachCity")/*到达城市*/,
            key: 'toCities' ,
            show:
              <FormItem>
                {getFieldDecorator('toCitiesS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.toCities.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem>
                {getFieldDecorator('toCitiesR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.toCities.required
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'toCitiesR', 'toCities', 'required')}/>
                )}
              </FormItem>,
             },
          {
            name: this.$t("itinerary.public.slide.departure")/*出发日期*/,
            key: 'departBeginDate' ,
            show:
              <FormItem>
                {getFieldDecorator('departBeginDateS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.departBeginDate.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem>
                {getFieldDecorator('departBeginDateR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.departBeginDate.required
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
             },
          {
            name: this.$t("form.setting.travel.back.tracking.date")/*返程日期*/,
            key: 'returnEndDate' ,
            show:
            <FormItem>
              {getFieldDecorator('returnEndDateS', {
                rules: [{
                     required: false,
                }],
                valuePropName: 'checked',
                initialValue: controlFieldsFlight.returnEndDate.show
              })(
                <Checkbox disabled />
              )}
            </FormItem>,
              required:
            <FormItem>
              {getFieldDecorator('returnEndDateR', {
                rules: [{
                     required: false,
                }],
                valuePropName: 'checked',
                initialValue: controlFieldsFlight.returnEndDate.required
              })(
                <Checkbox disabled />
              )}
            </FormItem>,
           },
          {
            name: this.$t("form.setting.travel.set.out.begin")/*出发开始时间*/,
            key: 'takeOffBeginTime' ,
            show:
              <FormItem>
                {getFieldDecorator('takeOffBeginTimeS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.takeOffBeginTime.show
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'takeOffBeginTimeS', 'takeOffBeginTime', 'show')}/>
                )}
              </FormItem>,
            required:
              <FormItem>
                {getFieldDecorator('takeOffBeginTimeR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.takeOffBeginTime.required
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'takeOffBeginTimeR', 'takeOffBeginTime', 'required')}/>
                )}
              </FormItem>,
           },
          {
            name: this.$t("form.setting.travel.set.out.end")/*出发结束时间*/,
            key: 'takeOffEndTime' ,
            show:
              <FormItem >
                {getFieldDecorator('takeOffEndTimeS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.takeOffEndTime.show
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'takeOffEndTimeS', 'takeOffEndTime', 'show')}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('takeOffEndTimeR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.takeOffEndTime.required
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'takeOffEndTimeR', 'takeOffEndTime', 'required')}/>
                )}
              </FormItem>,
          },
          {
            name: this.$t("form.setting.travel.arrival.begin")/*到达开始时间*/,
            key: 'arrivalBeginTime' ,
            show:
              <FormItem >
                {getFieldDecorator('arrivalBeginTimeS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.arrivalBeginTime.show
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'arrivalBeginTimeS', 'arrivalBeginTime', 'show')}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('arrivalBeginTimeR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.arrivalBeginTime.required
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'arrivalBeginTimeR', 'arrivalBeginTime', 'required')}/>
                )}
              </FormItem>,
           },
          {
            name: this.$t("form.setting.travel.arrival.end")/*到达结束时间*/,
            key: 'arrivalEndTime' ,
            show:
              <FormItem >
                {getFieldDecorator('arrivalEndTimeS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.arrivalEndTime.show
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'arrivalEndTimeS', 'arrivalEndTime', 'show')}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('arrivalEndTimeR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.arrivalEndTime.required
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'arrivalEndTimeR', 'arrivalEndTime', 'required')}/>
                )}
              </FormItem>,
          },
          {
            name: this.$t("request.detail.jd.price")/*价格*/,
            key: 'ticketPrice' ,
            show:
              <FormItem >
                {getFieldDecorator('ticketPriceS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.ticketPrice.show
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'ticketPriceS', 'ticketPrice', 'show')}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('ticketPriceR', {
                  rules: [{
                    required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.ticketPrice.required
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'ticketPriceR', 'ticketPrice', 'required')}/>
                )}
              </FormItem>,
          },
          {
            name: this.$t("travel.policy.disco")/*折扣*/,
            key: 'discount' ,
            show:
              <FormItem >
                {getFieldDecorator('discountS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.discount.show
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'discountS', 'discount', 'show')}/>
                )}
              </FormItem>,
            required:''
          },
          {
            name: this.$t("travel.policy.cabin")/*舱等*/,
            key: 'seatClass' ,
            show:
              <FormItem >
                {getFieldDecorator('seatClassS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsFlight.seatClass.show
                })(
                  <Checkbox disabled={disabled} onChange={(e)=>this.onFlightCheckboxChange(e, 'seatClassS', 'seatClass', 'show')}/>
                )}
              </FormItem>,
            required:'',
            },
          {
            name: this.$t("common.comment")/*备注*/,
            key: 'ticketNote' ,
            show:
              <FormItem >
                {getFieldDecorator('ticketNote', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: true
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:'',
            },
        ]
      },
      {
        name: this.$t("form.setting.travel.hotel.march")/*酒店行程*/,
        key: 'hotel' ,
        show:
          <FormItem >
            {getFieldDecorator('hotel', {
              rules: [{
                   required: false,
              }],
              valuePropName: 'checked',
              initialValue: isHotelShow
            })(
              <Checkbox disabled={disabled} onChange={(e)=>this.otherCheckboxChange(e, 'hotel', 'isHotelShow')}/>
            )}
          </FormItem>,
        required:'',
        children: [
          {
            name: this.$t("itinerary.subsidy.edit.modal.city")/*城市*/,
            key: 'cityHotel' ,
            show:
              <FormItem >
                {getFieldDecorator('cityHotelS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.city.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('cityHotelR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.city.required
                })(
                  <Checkbox disabled={disabled} onChange={(e) => this.onHotelCheckboxChange(e, 'cityHotelR','city', 'required')}/>
                )}
              </FormItem>,
            },
          {
            name: this.$t("form.setting.travel.rooms.number")/*房间数量*/,
            key: 'roomNumberHotel' ,
            show:
              <FormItem >
                {getFieldDecorator('roomNumberHotelS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.roomNumber.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('roomNumberHotelR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.roomNumber.required
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            },
          {
            name: this.$t("form.setting.supplier.max.price")/*单价上限*/,
            key: 'maxPriceHotel' ,
            show:
              <FormItem >
                {getFieldDecorator('maxPriceHotelS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.maxPrice.show
                })(
                  <Checkbox disabled={disabled} onChange={(e) => this.onHotelCheckboxChange(e, 'maxPriceHotelS','maxPrice', 'show')}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('maxPriceHotelR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.maxPrice.required
                })(
                  <Checkbox disabled={disabled} onChange={(e) => this.onHotelCheckboxChange(e, 'maxPriceHotelR','maxPrice', 'required')}/>
                )}
              </FormItem>,
            },
          {
            name: this.$t("form.setting.supplier.min.price")/*单价下限*/,
            key: 'minPriceHotel' ,
            show:
              <FormItem >
                {getFieldDecorator('minPriceHotelS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.minPrice.show
                })(
                  <Checkbox disabled={disabled} onChange={(e) => this.onHotelCheckboxChange(e, 'minPriceHotelS','minPrice', 'show')}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('minPriceHotelR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.minPrice.required
                })(
                  <Checkbox disabled={disabled} onChange={(e) => this.onHotelCheckboxChange(e, 'minPriceHotelR','minPrice', 'required')}/>
                )}
              </FormItem>,
          },
          {
            name: this.$t("itinerary.hotel.slide.check.in")/*入住日期*/,
            key: 'fromDateHotel' ,
            show:
              <FormItem >
                {getFieldDecorator('fromDateHotelS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.fromDate.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('fromDateHotelR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.fromDate.required
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
          },
          {
            name: this.$t("expense.date.combined.check.out")/*离店日期*/,
            key: 'leaveDateHotel' ,
            show:
              <FormItem >
                {getFieldDecorator('leaveDateHotelR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.leaveDate.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('leaveDateHotelR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsHotel.leaveDate.required
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            },
          {
            name: this.$t("common.comment")/*备注*/,
            key: 'hotelNote' ,
            show:
              <FormItem >
                {getFieldDecorator('hotelNote', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: true
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:'',
            },
        ]
      },
      {
        name: this.$t("itinerary.train.slide.title")/*火车行程*/,
        key: 'train' ,
        show:
          <FormItem >
            {getFieldDecorator('train', {
              rules: [{
                   required: false,
              }],
              valuePropName: 'checked',
              initialValue: isTrainShow
            })(
              <Checkbox disabled={disabled} onChange={(e)=>this.otherCheckboxChange(e, 'train', 'isTrainShow')}/>
            )}
          </FormItem>,
        required:'',
        children: [
          {
            name: this.$t("itinerary.public.slide.departureCity")/*出发城市*/,
            key: 'fromCityTrain' ,
            show:
              <FormItem>
                {getFieldDecorator('fromCityTrainS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.fromCity.show
                })(
                  <Checkbox disabled/>
                )}
              </FormItem>,
            required:
              <FormItem>
                {getFieldDecorator('fromCityTrainR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.fromCity.required
                })(
                  <Checkbox disabled={disabled} onChange={(e) => {this.onTrainCheckboxChange(e, 'fromCityTrainR', 'fromCity', 'required')}}/>
                )}
              </FormItem>,
            },
          {
            name: this.$t("check.center.reachCity")/*到达城市*/,
            key: 'toCityTrain' ,
            show:
              <FormItem>
                {getFieldDecorator('toCityTrainS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.toCity.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem>
                {getFieldDecorator('toCityTrainR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.toCity.required
                })(
                  <Checkbox disabled={disabled} onChange={(e) => {this.onTrainCheckboxChange(e, 'toCityTrainR', 'toCity', 'required')}}/>
                )}
              </FormItem>,
            },
          {
            name: this.$t("itinerary.public.slide.departure")/*出发日期*/,
            key: 'departBeginDateTrain' ,
            show:
              <FormItem>
                {getFieldDecorator('departBeginDateTrainS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.departBeginDate.show
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:
              <FormItem>
                {getFieldDecorator('departBeginDateTrainR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.departBeginDate.required
                })(
                  <Checkbox disabled/>
                )}
              </FormItem>,
            },
          {
            name: this.$t("request.detail.jd.price")/*价格*/,
            key: 'ticketPriceTrain' ,
            show:
              <FormItem>
                {getFieldDecorator('ticketPriceTrainS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.ticketPrice.show
                })(
                  <Checkbox disabled={disabled} onChange={(e) => {this.onTrainCheckboxChange(e, 'ticketPriceTrainS', 'ticketPrice', 'show')}}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('ticketPriceTrainR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.ticketPrice.required
                })(
                  <Checkbox disabled={disabled} onChange={(e) => {this.onTrainCheckboxChange(e, 'ticketPriceTrainR', 'ticketPrice', 'required')}}/>
                )}
              </FormItem>,
            },
          {
            name: this.$t("travel.policy.class")/*座席*/,
            key: 'seatClassTrain' ,
            show:
              <FormItem >
                {getFieldDecorator('seatClassTrainS', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.seatClass.show
                })(
                  <Checkbox disabled={disabled} onChange={(e) => {this.onTrainCheckboxChange(e, 'seatClassTrainS', 'seatClass', 'show')}}/>
                )}
              </FormItem>,
            required:
              <FormItem >
                {getFieldDecorator('seatClassTrainR', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: controlFieldsTrain.seatClass.required
                })(
                  <Checkbox disabled={disabled} onChange={(e) => {this.onTrainCheckboxChange(e, 'seatClassTrainR', 'seatClass', 'required')}}/>
                )}
              </FormItem>,
          },
          {
            name: this.$t("common.comment")/*备注*/,
            key: 'trainNote' ,
            show:
              <FormItem >
                {getFieldDecorator('trainNote', {
                  rules: [{
                       required: false,
                  }],
                  valuePropName: 'checked',
                  initialValue: true
                })(
                  <Checkbox disabled />
                )}
              </FormItem>,
            required:'',
          },
        ]
      },
      {
        name: this.$t("request.detail.travel.other.traffic")/*其他交通*/,
        key: 'otherTransport',
        show:
          <FormItem >
            {getFieldDecorator('otherTransport', {
              rules: [{
                   required: false,
              }],
              valuePropName: 'checked',
              initialValue: otherTransport
            })(
              <Checkbox disabled={disabled} onChange={(e)=>this.otherCheckboxChange(e, 'otherTransport', 'otherTransport')}/>
            )}
          </FormItem>,
        required:''
      },
      {
        name: this.$t("form.setting.travel.allowance")/*差旅补贴*/,
        key: 'travelAllowances',
        show:
          <FormItem >
            {getFieldDecorator('travelAllowances', {
              rules: [{
                   required: false,
              }],
              valuePropName: 'checked',
              initialValue: travelAllowances
            })(
              <Checkbox disabled={disabled} onChange={(e)=>this.otherCheckboxChange(e, 'travelAllowances', 'travelAllowances')}/>
            )}
          </FormItem>,
        required: '',
      },
      {
        name: this.$t("common.comment")/*备注*/,
        key: 'note',
        show:
          <FormItem >
            {getFieldDecorator('note', {
              rules: [{
                   required: false,
              }],
              valuePropName: 'checked',
              initialValue: true
            })(
              <Checkbox disabled />
            )}
          </FormItem>,
        required: '',
      },
    ]
    this.setState({
      data: initTableData,
    })
  }
//点击机票的CheckBox
  onFlightCheckboxChange = (e,key,prop,boolean) => {
   const {controlFieldsFlight} = this.state;
   controlFieldsFlight[prop][boolean] = !this.props.form.getFieldValue(key);
   this.setState({
        controlFieldsFlight,
   },()=>{
     this.initTable();
   });
  }

  //点击酒店的CheckBox
  onHotelCheckboxChange = (e, key, prop, boolean) => {
    const {controlFieldsHotel} = this.state;
    controlFieldsHotel[prop][boolean] = !this.props.form.getFieldValue(key);
    this.setState({
      controlFieldsHotel,
    },()=>{
      this.initTable();
    });
  }
  //点击火车的CheckBox
  onTrainCheckboxChange = (e, key, prop, boolean) => {
    const {controlFieldsTrain} = this.state;
    controlFieldsTrain[prop][boolean] = !this.props.form.getFieldValue(key);
    this.setState({
      controlFieldsTrain,
    },()=>{
      this.initTable();
    });
  }
  // 点击机票火车酒店，其他交通，差旅补贴补贴是否显示的CheckBox
  otherCheckboxChange = (e,key,state) => {
    this.setState({
      [state]: !this.props.form.getFieldValue(key)
      },()=>{
      this.initTable();
    });
  }
  //点击保存时调用的函数
   saveTravelForm = () => {
    const {formOid} = this.props.params;
    const {controlFieldsFlight, controlFieldsHotel, controlFieldsTrain, costCenterCustom, manageType,
      isTicketShow, isHotelShow, isTrainShow, otherTransport, travelAllowances,
      travelDeactivatedate, travelRemark} = this.state
      this.props.form.validateFieldsAndScroll((err,values) => {
       if (!err) {
         //提交前处理数据
         let flightField = JSON.parse(JSON.stringify(controlFieldsFlight));
         let trainField = JSON.parse(JSON.stringify(controlFieldsTrain));
         let hotelField = JSON.parse(JSON.stringify(controlFieldsHotel));
         this.processConfig(flightField);
         this.processConfig(trainField);
         this.processConfig(hotelField);
         let params = {
           controlFieldsFlight: JSON.stringify(flightField),
           controlFieldsHotel: JSON.stringify(hotelField),
           controlFieldsTrain: JSON.stringify(trainField),
           costCenterCustom: JSON.stringify(costCenterCustom),
           manageType: JSON.stringify(manageType),
           'ca.travel.flight.disabled': !isTicketShow,
           'hotel.itinerary.enable': isHotelShow,
           'ca.travel.train.disabled': !isTrainShow,
           'ca.travel.other.disabled': !otherTransport,
           'travel.allowance.disabled': !travelAllowances,
           'ca.travel.deactivatedate.enabled': travelDeactivatedate,
           'ca.travel.remark.disabled': !travelRemark,
         }
         formService.saveSupplierForm(formOid, params).then(res => {
           if (res.status === 200) {
             message.success(this.$t("invoice.management.save.success")/*保存成功*/);
             this.setState({
               disabled: true,
               isEditing: false,
             })
             this.props.saveHandle(true)
           } else {
             message.error(this.$t("bookingManagement.save.fail")/*保存失败*/)
           }
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

  render(){
    const {columns, data, isEditing} = this.state;
    return(
      <div className='form-setting-travel'>
        <div className='travel-alert'>
          <Alert
            message={this.$t("common.help")/*帮助提示*/}
            description={this.$t("form.setting.travel.info.to.supplier")/*下方的设置决定了供应商如何对差旅行程管控，若启用相应功能后，汉得融晶会将相应信息传递给供应商*/}
            type="info"
            showIcon/>
        </div>
        <Form hideRequiredMark={true}>
        <Table rowKey='key' dataSource={data} columns={columns} bordered/>
        </Form>
        <div className='form-setting-buttons'>
          {isEditing ?
            <div>
              <Button type='primary' className='buttons-save' onClick={this.saveTravelForm}>{this.$t("common.save")/*保存*/}</Button>
              <Button type='primary' className='buttons-cancelEdit' onClick={this.cancelEditing}>{this.$t("form.setting.huilianyi.cancel.edit")/*取消编辑*/}</Button>
              <Button type='default'
              onClick={() => {
                this.props.dispatch(
                  routerRedux.push({
                      pathname: `/setting/form-list`,
                  })
                )
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
                      pathname: `/setting/form-list`,
                  })
              );
              }}
              >{this.$t("common.back")/*返回*/}</Button>
            </div>
          }

        </div>
      </div>
    )
  }
}

TravelItinerarySetting.contextTypes = {
  router: PropTypes.object
};
function mapStateToProps(state) {
  return {}
}
const wrappedNewContract = Form.create()(TravelItinerarySetting);
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewContract);
