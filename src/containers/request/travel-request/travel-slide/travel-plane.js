
/**
 * Created by wangjiakun on 2018/3/14 0014.
 */
import React from 'react';
import {connect} from 'react-redux';

import { messages, getApprovelHistory } from 'share/common';
import {
  Input,
  InputNumber,
  Spin,
  Form,
  Tabs,
  Button,
  TimePicker,
  Radio,
  Card,
  Row,
  Col,
  message,
  DatePicker,
  Affix,
  Select
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;
const TabPane = Tabs.TabPane;

import moment from 'moment';
import travelService from 'containers/request/travel-request/travel.service'
import travelUtil from 'containers/request/travel-request/travelUtil'

class TravelPlane extends React.Component {

  supply = {};
  searchType = "standard";
  startDate = "";
  endDate = "";
  currentStartDate = "";

  constructor(props) {
    super(props);
    this.state = {
      params: {},//接收父组件带来的参数
      editing: false,//区分编辑页还是新建页
      formCtrl: {},//
      standardEnable: false,//是否走差旅标准
      supplies: [],//所有供应商
      currentIndex: 0,//当前供应商数组的下标
      supplyId: '',//当前供应商的serviceName
      productType: 1001,//机票类型 默认国内机票1001 ；1002为国际机票
      defaultDate: "" + moment(travelUtil.getDefaultDate(1)).format('YYYY-MM-DD'),
      isLoading: false,//提交是否loading提示
      isDouble: false,//是否是返程
      cityFromSearchResult: [],//出发城市搜索结果
      cityToSearchResult: [],//目的城市搜索结果
      selectFromCity:{},//选择的出发城市
      selectToCity:{},//选择的目的城市
      discounts: [messages('itinerary.public.select.all')/*所有*/, 1, 2, 3, 4, 5, 6, 7, 8, 9],//折扣
    }
  };

  componentWillMount() {
    this.getSupplies();
    let tempMap = this.props.params['travelInfo']['customFormPropertyMap'];
    let obj = tempMap['application.property.control.fields'] ? JSON.parse(tempMap['application.property.control.fields']) : travelUtil.getSetDataByTravelType('flight');
    let isStandard = tempMap['ca.travel.applypolicy.enable'] ? JSON.parse(tempMap['ca.travel.applypolicy.enable']) : false;
    this.setState({
      params: this.props.params,
      formCtrl: obj,
      standardEnable: isStandard
    });
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.currentStartDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.endDate = travelUtil.getAfterDate(1, this.endDate);
  };

  CFO = travelUtil.createFormOption;

  //目的地搜索
  handleToCityChange = (keyWord) => {
    let country = this.state.productType === 1002 ? 'all' : 'China';
    travelService.searchCitys(this.searchType, keyWord,country,this.props.language.code === 'zh_CN' ? 'zh_CN' : 'en_US').then(res => {
      this.setState({
        cityToSearchResult: res.data,
        selectToCity:{},
      })
    })
  };

  //选择出发城市
  selectFromCity = (cityName, opt) => {
    this.setState({selectFromCity: opt.props['data-city']});
  };

  //选择到达城市
  selectToCity = (cityName, opt) => {
    this.setState({selectToCity: opt.props['data-city']});
  };

  // 出发地搜索
  handleFromCityChange = (keyWord) => {
    let country = this.state.productType === 1002 ? 'all' : 'China';
    travelService.searchCitys(this.searchType, keyWord,country,this.props.language.code === 'zh_CN' ? 'zh_CN' : 'en_US').then(res => {
      this.setState({
        cityFromSearchResult: res.data,
        selectFromCity:{},
      })
    })
  };

  //单程 or 往返选择
  itineraryTypeHandle = (e) => {
    let value = e.target.value;
    value === 1002 ? this.setState({isDouble: true}) : this.setState({isDouble: false});
    this.props.form.resetFields(['endDate']);
    this.props.form.resetFields(['arrivalBeginTime']);
    this.props.form.resetFields(['arrivalEndTime']);
  };

  //交换城市
  exchangeCity = () => {
    let fromCityItem = this.state.selectFromCity;
    let toCityItem = this.state.selectToCity;
    this.setState({
      selectToCity: fromCityItem,
      selectFromCity: toCityItem
    });
    this.props.form.setFieldsValue({'fromCity': toCityItem.vendorAlias});
    this.props.form.setFieldsValue({'toCity': fromCityItem.vendorAlias});
  };

  //清空已选城市数据type fromCity出发城市 toCity到达城市
  clearCityData = (type) => {
    if (type === 'fromCity') {
      this.setState({
        cityFromSearchResult: [],
        selectFromCity:{}
      });
      this.props.form.resetFields(type);
    }
    if (type === 'toCity') {
      this.setState({
        cityToSearchResult: [],
        selectToCity:{}
      });
      this.props.form.resetFields(type);
    }
  };

  //选择供应商
  selectSupply = (index) => {
    this.supply = this.state.supplies[index];
    if (this.supply.serviceName !== 'supplyCtripService' && this.supply.serviceName !== 'vendorCtripService' && this.supply.serviceName !== 'other') {
      this.setState({productType: 1001});
    }
    if (this.state.selectFromCity.code) {
      travelService.isCityInVendor(travelUtil.getSearchType(this.supply.serviceName,2001), this.state.selectFromCity.code).then(res => {
        if(res.data && res.data.alias){
          //this.state.selectFromCity上的vendorType这个字段是上一个供应商，现在没有用到这个字段，需要注意
          this.setState({
            cityFromSearchResult: [this.state.selectFromCity]
          });
        } else {
          this.clearCityData('fromCity');
        }
      }).catch(err=>{
        this.clearCityData('fromCity');
      });
    } else {
      this.clearCityData('fromCity');
    }
    if (this.state.selectToCity.code) {
      travelService.isCityInVendor(travelUtil.getSearchType(this.supply.serviceName,2001), this.state.selectToCity.code).then(res => {
        if(res.data && res.data.alias){
          //this.state.selectToCity上的vendorType这个字段是上一个供应商，现在没有用到这个字段，需要注意
          this.setState({
            cityToSearchResult: [this.state.selectToCity]
          });
        } else {
          this.clearCityData('toCity');
        }
      }).catch(err=>{
        this.clearCityData('toCity');
      });
    } else {
      this.clearCityData('toCity');
    }
    //cityFromSearchResult:[], cityToSearchResult:[]这还不能直接置空，不然已选中的在select中匹配不上
    this.setState({currentIndex: index, supplyId: this.supply.serviceName});
    this.searchType = travelUtil.getSearchType(this.supply.serviceName,2001);
  };

  //提交
  toSubmit = (e) => {
    e.preventDefault();
    const {travelElement} =this.props.params;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(travelElement&&!err){
        if(this.state.editing){
          values.oldDate = this.props.params.editPlane.startDate;
        }
        values.type = 'traffics';
        values.trafficType = 1001;
        values.startDate = values.startDate.utc().format();
        values.fromCityCode = this.state.selectFromCity.code;
        values.toCityCode = this.state.selectToCity.code;
        values.toCity = this.state.selectToCity.vendorAlias;
        values.fromCity = this.state.selectFromCity.vendorAlias;
        this.props.close(values);
      }else {
      if(values.remark && values.remark.length === 201){
        message.error(messages('itinerary.remark.length.tooLong.tip')/*'备注长度超出'*/);
        return;
      }
      if (!err) {
        values.supplierOID = this.supply.supplierOID ? this.supply.supplierOID : null;
        let takeOffBeginTime = moment(this.props.form.getFieldValue('takeOffBeginTime')).format(`HH:mm`);
        let takeOffEndTime = moment(this.props.form.getFieldValue('takeOffEndTime')).format(`HH:mm`);
        let arrivalBeginTime = moment(this.props.form.getFieldValue('arrivalBeginTime')).format(`HH:mm`);
        let arrivalEndTime = moment(this.props.form.getFieldValue('arrivalEndTime')).format(`HH:mm`);

        values.startDate = values.startDate.utc().format();
        values.endDate = values.itineraryType === 1002 ? values.endDate.utc().format() : null;
        if(values.itineraryType === 1002 && values.startDate > values.endDate){
          message.error(messages('itinerary.public.date.checked.tip')/*返回日期早于出发日期*/);
          return;
        }
        values.discount = values.discount === messages('itinerary.public.select.all')/*所有*/ ? "" : values.discount;
        values.takeOffBeginTime = takeOffBeginTime;
        values.takeOffEndTime = takeOffEndTime;
        values.arrivalBeginTime = values.itineraryType === 1002 ? arrivalBeginTime : null;
        values.arrivalEndTime = values.itineraryType === 1002 ? arrivalEndTime : null;

        if(this.state.formCtrl.fromCities.required && !this.state.selectFromCity.vendorAlias){
          message.error(messages('itinerary.public.fromCity.checked.tip')/*出发城市不匹配或未点击选择*/);
          return ;
        } else if(this.state.formCtrl.toCities.required && !this.state.selectToCity.vendorAlias){
          message.error(messages('itinerary.public.toCity.checked.tip')/*到达城市不匹配或未点击选择*/);
          return ;
        }else {
          values.fromCityCode = this.state.selectFromCity.code;
          values.toCityCode = this.state.selectToCity.code;
          values.toCity = this.state.selectToCity.vendorAlias;
          values.fromCity = this.state.selectFromCity.vendorAlias;
        }
        values.productType = this.state.productType;
        this.setState({isLoading: true});
        if (!this.state.editing) {
          travelService.travelPlaneSubmit(this.state.params.oid, [values]).then(res => {
            this.submitFinish(messages('itinerary.save.tip')/*已保存*/);
          }).catch(err=> {
            message.error(err.response.data.message);
            this.setState({isLoading: false});
          });
        } else {
          values.applicationOID = this.state.params.oid;
          values.flightItineraryOID = this.props.params.editPlane.flightItineraryOID;
          travelService.updatePlane(values).then(res => {
            this.submitFinish(messages('itinerary.update.tip')/*已更新*/)
          }).catch(err=> {
            message.error(err.response.data.message);
            this.setState({isLoading: false});
          })
          }
        }
      }
    })
  };

  //提交成功提示
  submitFinish = (mes) => {
    this.setState({isLoading: false});
    message.success(mes);
    this.props.form.resetFields();
    this.closeSlide({isOk: true});
  };

  //获取供应商数据
  getSupplies = () => {
    travelService.travelSuppliers(2001).then(res => {
      if (res['data']['2001']) {
        this.setState({
          supplies: res['data']['2001'],
          supplyId:res['data']['2001'].length > 0 ? res['data']['2001'][0].serviceName : "",
        },() => {
          this.supply = this.state.supplies.length > 0 ? this.state.supplies[0] : {};
          this.searchType = travelUtil.getSearchType(this.supply.serviceName,2001);
        });
      }
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  //选择机票类型-国际1002、国内1001
  selectProductType = (activeKey)=> {
    this.setState({productType: parseInt(activeKey)});
  };

  resetForm = () =>{
    this.props.form.resetFields();
    this.currentStartDate = this.startDate;
    delete this.props.params.editPlane;
    this.setState({
      editing: false,
      isDouble:false,
    });
  }

  // 关闭侧滑
  closeSlide = (isOk) => {
    this.props.close(isOk);
  };

  disabledDateStart = (current) => {
    let boo = false;
    if (current < moment(this.startDate) || current >= moment(this.endDate)) {
      boo = true;
    }
    return current && boo;
  };

  startDateChange = (e) => {
    this.currentStartDate = e;
    let end = this.props.form.getFieldValue('endDate');
    if(e > end){
      this.props.form.setFieldsValue({endDate:e});
    }
  }

  //初始化编辑数据
  componentWillReceiveProps() {
    if(this.props.params.isResetPlane){
      this.resetForm();
      delete this.props.params.isResetPlane;
      return;
    }
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.endDate = travelUtil.getAfterDate(1, this.endDate);
    let editData = travelUtil.isEmpty(this.props.params.editPlane);
    let TAG = editData.isEmpty;
    if (!TAG) {
      if (!this.state.editing) {
        let num = 0;
        let supId = 0;
        let isD = false;
        this.state.supplies.map((item, index) => {
          if (item.supplierOID === editData.supplierOID) {
            num = index;
            supId = item.serviceName;
            this.supply = item;
          }
        });
        isD = editData.itineraryType === 1002 ? true : false;
        this.setState({
          editing: true,
          currentIndex: num,
          supplyId: supId,
          isDouble: isD,
          productType:editData.productType ? editData.productType : 1001,
          selectFromCity: {code: editData.fromCityCode, vendorAlias: editData.fromCity},
          selectToCity: {code: editData.toCityCode, vendorAlias: editData.toCity},
        },()=>{
          this.props.form.resetFields();
        })
      }
    }
  };

  render() {
    const {formCtrl, standardEnable, supplies, defaultDate, supplyId, isDouble, currentIndex, isLoading, cityFromSearchResult, cityToSearchResult, discounts} = this.state;
    const {getFieldDecorator} = this.props.form;
    let editData = travelUtil.isEmpty(this.props.params.editPlane);
    const {travelElement} =this.props.params;
    let TAG = editData.isEmpty;
    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 18}
    }
    const formItemLayoutCity = {
      labelCol: {span: 8},
      wrapperCol: {span: 12}
    }
    const formItemLayoutTime = {
      labelCol: {span: 10},
      wrapperCol: {span: 12}
    }
    const textAreaLayout = {
      maxRows: 6,
      minRows: 2
    }
    return (
      <div className="travel-plane">
        <Spin spinning={isLoading}>
          <Form>
            {!travelElement &&<FormItem {...formItemLayout} label={messages('itinerary.public.slide.supplier')/*供应商*/}>
              <Row className="supplyRow">
                {
                  supplies.map((sup, index)=> {
                    return (
                      <Col key={sup.supplyId + index} span={4} className="supply" onClick={()=>this.selectSupply(index)}>
                        <Card hoverable
                              className={index==currentIndex?'card-on':'card-off'}
                              cover={<img src={sup.vendorIcon.path}/>}>
                          <span className="card-name">{sup.name}</span>
                        </Card>
                      </Col>
                    )
                  })
                }
              </Row>
            </FormItem>
            }
            {!travelElement && <Tabs className="plane-tabs" defaultActiveKey={!TAG ? editData.productType + '' : '1001'}
                                     onChange={this.selectProductType}>
              <TabPane tab={messages('itinerary.plane.slide.mainland')/*国内机票*/} key={'1001'}></TabPane>
              {
                supplyId === 'supplyCtripService' || supplyId === 'vendorCtripService' || supplyId === 'other' ? (<TabPane tab={messages('itinerary.plane.slide.international')/*国际机票*/} key={'1002'}></TabPane>) : null
              }
            </Tabs>
            }
            {!travelElement &&<FormItem {...formItemLayout} label={messages('itinerary.plane.slide.VoyageType')/*行程类型*/}>
              {getFieldDecorator('itineraryType', this.CFO(messages('itinerary.plane.slide.VoyageType'), {type: 'number', value: editData.itineraryType ? editData.itineraryType : 1001}))(
                <RadioGroup className="travel-type-radio" onChange={this.itineraryTypeHandle}>
                  <Radio value={1001}>{messages('itinerary.public.slide.oneWay')/*单程*/}</Radio>
                  <Radio value={1002}>{messages('itinerary.public.slide.roundTrip')/*往返*/}</Radio>
                </RadioGroup>
              )}</FormItem>}
            <FormItem className="plane-city-margin">
              <Row>
                <Col span={12}>
                  <FormItem {...formItemLayoutCity} label={messages('itinerary.public.slide.departureCity')/*出发城市*/}>
                    {getFieldDecorator('fromCity', this.CFO(messages('itinerary.public.slide.departureCity'), {type: 'str', value: editData.fromCity},!travelElement ? !formCtrl.fromCities.required : false)
                    )
                    (
                      <Select
                        mode="combobox"
                        placeholder={messages('itinerary.public.slide.cityNamePlaceholder')/*城市名*/}
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        onSelect={this.selectFromCity}
                        filterOption={false}
                        optionLabelProp="title"
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        onSearch={this.handleFromCityChange}>
                        { cityFromSearchResult.map((city, index) => {
                          return (<Option data-city={city} key={city.code} title={city.vendorAlias}>
                            {city.vendorAlias}&nbsp;&nbsp;<span style={{color:'#ccc'}}>({city.country})</span>
                          </Option>);
                        })}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayoutCity} label={messages('itinerary.public.slide.arrivalCity')/*到达城市*/}>
                    {getFieldDecorator('toCity', this.CFO(messages('itinerary.public.slide.arrivalCity'), {type: 'str', value: editData.toCity},!travelElement ? !formCtrl.toCities.required: false))(<Select
                      mode="combobox"
                      placeholder={messages('itinerary.public.slide.cityNamePlaceholder')/*城市名*/}
                      defaultActiveFirstOption={false}
                      showArrow={false}
                      onSelect={this.selectToCity}
                      filterOption={false}
                      optionLabelProp="title"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      onSearch={this.handleToCityChange}>
                      { cityToSearchResult.map((city, index) => {
                        return (<Option data-city={city} key={city.code} title={city.vendorAlias}>
                          {city.vendorAlias}&nbsp;&nbsp;<span style={{color:'#ccc'}}>({city.country})</span>
                        </Option>);
                      })}
                    </Select>)}
                  </FormItem>
                </Col>

                <div className="line-top"></div>
                <Button className={this.props.language.code === 'zh_cn' ? "exchange-city" : "exchange-city-en"} onClick={this.exchangeCity}>{messages('itinerary.plane.slide.swap')/*换*/}</Button>
                <div className="line-bottom"></div>

                <Col span={12}>
                  <FormItem {...formItemLayoutCity} label={messages('itinerary.public.slide.departure')/*出发日期*/}>
                    {getFieldDecorator('startDate', this.CFO(messages('itinerary.public.slide.departure'), {
                        type: 'moment',
                        value: TAG ? this.startDate : editData.startDate,
                      }
                    ))
                    (<DatePicker onChange={this.startDateChange} disabledDate={this.disabledDateStart} format="YYYY-MM-DD"/>)}
                  </FormItem>
                  {!travelElement &&<FormItem {...formItemLayoutCity} label={messages('itinerary.public.slide.return')/*返回日期*/}>
                    {getFieldDecorator('endDate', this.CFO(messages('itinerary.public.slide.return'), {
                      type: 'moment',
                      value: !TAG && editData.endDate ? editData.endDate : this.startDate,
                    }, !isDouble))
                    (<DatePicker disabledDate={(c)=>travelUtil.disabledDate(c, this.currentStartDate, this.endDate,0)} disabled={!isDouble}/>)}
                  </FormItem>}
                </Col>
              </Row>
            </FormItem>
            {
              (formCtrl.takeOffBeginTime.show || formCtrl.takeOffEndTime.show) &&
              (supplyId === 'supplyCtripService' || supplyId === 'vendorCtripService')
              &&!travelElement && <FormItem>
                <Row>
                  <Col span={10}>
                    <FormItem {...formItemLayoutTime} label={messages('itinerary.plane.slide.leaveOn')/*出发起飞时间*/}>
                      {getFieldDecorator('takeOffBeginTime', this.CFO('', {
                        type: 'moment',
                        value: editData.takeOffBeginTime,
                        format: 'HH:mm'
                      }, !formCtrl.takeOffBeginTime.required))
                      (<TimePicker format={'HH:mm'}></TimePicker>)}
                    </FormItem>
                  </Col>
                  <Col span={2}>{messages('itinerary.plane.slide.to')/*至*/}</Col>
                  <Col span={10} className="plane-time">
                    <FormItem {...formItemLayoutTime}>
                      {getFieldDecorator('takeOffEndTime', this.CFO('', {
                        type: 'moment',
                        format: 'HH:mm',
                        value: editData.takeOffEndTime
                      }, !formCtrl.takeOffEndTime.required))
                      (<TimePicker format={'HH:mm'}></TimePicker>)}
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
            }

            {
              (formCtrl.arrivalBeginTime.show || formCtrl.arrivalEndTime.show) &&
              (supplyId === 'supplyCtripService' || supplyId === 'vendorCtripService')
              && !travelElement &&<FormItem>
                <Row>
                  <Col span={10}>
                    <FormItem {...formItemLayoutTime} label={messages('itinerary.plane.slide.returnOn')/*返回起飞时间*/}>
                      {getFieldDecorator('arrivalBeginTime', this.CFO('', {
                        type: 'moment',
                        format: 'HH:mm',
                        value: editData.arrivalBeginTime
                      }, !(isDouble && formCtrl.arrivalBeginTime.required)))
                      (<TimePicker disabled={!isDouble} disabledMinutes={()=>{return [1,2,3]}}
                                   format={'HH:mm'}></TimePicker>)}
                    </FormItem>
                  </Col>
                  <Col span={2}>{messages('itinerary.plane.slide.to')/*至*/}</Col>
                  <Col span={10} className="plane-time">
                    <FormItem {...formItemLayoutTime}>
                      {getFieldDecorator('arrivalEndTime', this.CFO('', {
                        type: 'moment',
                        format: 'HH:mm',
                        value: editData.arrivalEndTime
                      },  !(isDouble && formCtrl.arrivalEndTime.required)))
                      (<TimePicker disabled={!isDouble} format={'HH:mm'}></TimePicker>)}
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
            }

            {
              (formCtrl.ticketPrice.show || formCtrl.discount.show) &&
              (supplyId === 'supplyCtripService' || supplyId === 'vendorCtripService')
              && !travelElement &&<FormItem>
                <Row>
                  <Col span={12}>
                    <FormItem  {...formItemLayoutCity} label={messages('itinerary.public.slide.price')/*机票价格*/}>
                      {getFieldDecorator('ticketPrice', this.CFO('', {
                        type: 'number',
                        value: editData.ticketPrice
                      }, !formCtrl.ticketPrice.required))
                      (<InputNumber min={0} className="plane-price"/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    {
                      !standardEnable && <FormItem {...formItemLayoutCity} label={messages('itinerary.plane.slide.discount')/*折扣*/}>
                        {getFieldDecorator('discount', this.CFO(messages('itinerary.plane.slide.discount'), {
                          type: 'number',
                          value: editData.discount ? editData.discount :
                            this.props.language.code === 'zh_cn' ? '所有' : 'All'
                        }, !formCtrl.discount.required))
                        (<Select>
                          {
                            discounts.map((dis, index)=> {
                              return <Option value={dis} key={dis}>{dis}</Option>
                            })
                          }
                        </Select>)}
                      </FormItem>
                    }
                  </Col>
                </Row>
              </FormItem>
            }

            {
              !travelElement && formCtrl.seatClass.show && (supplyId === 'supplyCtripService' || supplyId === 'vendorCtripService') && !standardEnable &&
              <FormItem className="plane-seat-margin">
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayoutCity} label={messages('itinerary.public.slide.class')/*舱等*/}>
                      {getFieldDecorator('seatClass', this.CFO(messages('itinerary.public.slide.class'), {
                        type: 'str',
                        value: editData.seatClass ? editData.seatClass :
                          this.props.language.code === 'zh_cn' ? '经济舱' : 'Economy class'
                      }, !formCtrl.seatClass.required))(
                        <Select>
                          {travelUtil.getSeatClass(this.props.language.code === 'zh_cn' ? 'plane' : 'plane_en').map((seat, index)=> {
                            return <Option value={seat} key={seat}>{seat}</Option>
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
            }

            {!travelElement &&<FormItem {...formItemLayout} label={messages('itinerary.public.slide.remark')/*备注*/}
                                          className={( (formCtrl.ticketPrice.show || formCtrl.discount.show) && (supplyId === 'supplyCtripService' || supplyId === 'vendorCtripService')) ? 'plane-margin-top':''}>
              {getFieldDecorator('remark', this.CFO('', {type: 'str', value: editData.remark}, true))(<TextArea
                maxLength={201} placeholder={messages('itinerary.public.slide.remarkPlaceholder')/*请输入*/} autosize={textAreaLayout}></TextArea>)}
            </FormItem>}
          </Form>
        </Spin>
        <Affix className="travel-affix" offsetBottom={0}>
          <Button onClick={this.toSubmit} type="primary" loading={isLoading}>{messages('itinerary.type.slide.and.modal.ok.btn')/*确定*/}</Button>
          <Button className="travel-type-btn" onClick={this.closeSlide}>{messages('itinerary.type.slide.and.modal.cancel.btn')/*取消*/}</Button>
        </Affix>
      </div>
    )
  }


}

function mapStateToProps(state) {
  return { language: state.main.language };
}

const wrappedTravelPlane = Form.create()(TravelPlane);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedTravelPlane);
