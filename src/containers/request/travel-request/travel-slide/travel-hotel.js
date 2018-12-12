/**
 * Created by wangjiakun on 2018/4/4 0004.
 */
import React from 'react';
import { connect } from 'dva';

import { getApprovelHistory } from 'utils/extend';
import {
  Input,
  InputNumber,
  Form,
  Tabs,
  Button,
  Spin,
  Radio,
  Card,
  Row,
  Col,
  message,
  DatePicker,
  Affix,
  Select,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;
const TabPane = Tabs.TabPane;

import moment from 'moment';
import travelService from 'containers/request/travel-request/travel.service';
import travelUtil from 'containers/request/travel-request/travelUtil';

class TravelHotel extends React.Component {
  supply = {};
  searchType = 'standard';
  startDate = '';
  endDate = '';
  baseStartDate = '';
  baseEndDate = '';
  dateArray = []; //盛放已选过的酒店日期
  out_participant_num = 0; //外部参与人数
  select_participant = []; //参与人
  constructor(props) {
    super(props);
    this.state = {
      params: {}, //接收父组件带来的参数
      editing: false, //区分编辑页还是新建页
      formCtrl: {}, //
      standardEnable: false, //是否走差旅标准
      supplies: [], //所有供应商
      currentIndex: 0, //当前供应商数组的下标
      supplyId: '', //当前供应商serviceName
      productType: 1001, //
      defaultDate: '' + moment(travelUtil.getDefaultDate(1)).format('YYYY-MM-DD'),
      isLoading: false, //提交是否loading提示
      citySearchResult: [], //城市搜索结果
      maxRoom: 1, //最大房间数
      minPrice: 0, //最小价格
      selectCity: {}, //选择的住宿城市
      nights: 0, //住宿晚间数
    };
  }

  //初始化编辑数据
  componentWillReceiveProps() {
    let hotelRecord = [];
    if (this.props.params.isResetHotel) {
      this.resetForm();
      delete this.props.params.isResetHotel;
      return;
    }
    let editData = travelUtil.isEmpty(this.props.params.editHotel);
    let TAG = editData.isEmpty;
    if (!TAG) {
      if (!this.state.editing) {
        let num = 0;
        let supId = 0;
        this.state.supplies.map((item, index) => {
          if (item.supplierOID == editData.supplierOID) {
            num = index;
            supId = item.supplierServiceName;
            this.supply = item;
          }
        });
        this.updateMaxRoom(); //更新最大房间数
        let night = travelUtil.calculateDate(editData.fromDate, editData.leaveDate) - 1;
        this.setState(
          {
            editing: true,
            currentIndex: num,
            supplyId: supId,
            nights: night,
            selectCity: editData.cityName
              ? { code: editData.cityCode, vendorAlias: editData.cityName }
              : {},
          },
          () => {
            this.props.form.resetFields();
          }
        );
      }
      this.props.params.hotel.map(h => {
        if (h.hotelItineraryOID !== editData.hotelItineraryOID) {
          hotelRecord.push(h);
        }
      });
      this.dateArray = travelUtil.hotelDateArray(hotelRecord);
    } else {
      if (this.props.params.hotel) {
        this.dateArray = travelUtil.hotelDateArray(this.props.params.hotel);
      }
      let tempStartDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
      let tempEndDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
      let outNum = travelUtil.getFormHeadValue(
        this.props.params.defaultValue,
        'out_participant_num'
      );
      let select_participant = [];
      select_participant = travelUtil.getFormHeadValue(
        this.props.params.defaultValue,
        'select_participant'
      );
      if (
        this.baseStartDate !== tempStartDate ||
        this.baseEndDate !== tempEndDate ||
        this.out_participant_num !== outNum ||
        this.select_participant !== JSON.stringify(select_participant)
      ) {
        //头部时间、参与人、外部参与人数是否已经改变
        this.setThisDate();
        this.updateMaxRoom(); //更新最大房间数
      }
    }
    this.setState({ minPrice: this.props.form.getFieldValue('minPrice') });
  }

  //设置日期
  setThisDate = () => {
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.baseStartDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.baseEndDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.out_participant_num = travelUtil.getFormHeadValue(
      this.props.params.defaultValue,
      'out_participant_num'
    );
    this.select_participant = JSON.stringify(
      travelUtil.getFormHeadValue(this.props.params.defaultValue, 'select_participant')
    );
  };

  componentWillMount() {
    this.getSupplies();
    let tempMap = this.props.params['travelInfo']['customFormPropertyMap'];
    let obj = tempMap['application.property.control.fields.hotel']
      ? JSON.parse(tempMap['application.property.control.fields.hotel'])
      : travelUtil.getSetDataByTravelType('hotel');
    let isStandard = tempMap['ca.travel.applypolicy.enable']
      ? JSON.parse(tempMap['ca.travel.applypolicy.enable'])
      : false;
    this.updateMaxRoom();
    this.setThisDate();
    let night = travelUtil.calculateDate(this.baseStartDate, this.baseEndDate) - 1;
    this.setState({
      params: this.props.params,
      formCtrl: obj,
      standardEnable: isStandard,
      nights: night,
    });
  }

  //时间改变重新计算日期区间天数
  startDateChange = e => {
    this.startDate = e;
    let days = 0;
    days = travelUtil.calculateDate(e, this.endDate);
    this.setState({ nights: days - 1 });
  };

  //时间改变重新计算日期区间天数
  endDateChange = e => {
    this.endDate = e;
    let days = 0;
    days = travelUtil.calculateDate(this.startDate, e);
    this.setState({ nights: days - 1 });
  };

  updateMaxRoom = () => {
    let outNum = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'out_participant_num');
    let select_participant = [];
    select_participant = travelUtil.getFormHeadValue(
      this.props.params.defaultValue,
      'select_participant'
    );
    travelService
      .getMaxRoom(outNum, select_participant)
      .then(res => {
        this.setState({
          maxRoom: res.data.maxRoomNumber,
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  cfo = travelUtil.createFormOption;

  // 城市搜索
  searchCityChange = keyWord => {
    let country = this.state.productType === 1002 ? 'foreign' : 'China';
    travelService
      .searchCitys(
        this.searchType,
        keyWord,
        country,
      this.props.language.code === 'zh_cn' ? 'zh_cn' : 'en_us'
      )
      .then(res => {
        this.setState({
          citySearchResult: res.data,
          selectCity: {},
        });
      });
  };

  //清空已选城市数据
  clearCityData = () => {
    this.setState({
      citySearchResult: [],
      selectCity: {},
    });
    this.props.form.resetFields('cityName');
  };

  //选择供应商
  selectSupply = index => {
    this.supply = this.state.supplies[index];
    if (
      this.supply.serviceName !== 'supplyCtripService' &&
      this.supply.serviceName !== 'vendorCtripService' &&
      this.supply.serviceName !== 'other'
    ) {
      this.setState({ productType: 1001 });
    }
    if (this.state.selectCity.code) {
      travelService
        .isCityInVendor(
          travelUtil.getSearchType(this.supply.serviceName, 2003),
          this.state.selectCity.code
        )
        .then(res => {
          if (res.data && res.data.alias) {
            //this.state.selectCity上的vendorType这个字段是上一个供应商，现在没有用到这个字段，需要注意
            this.setState({
              citySearchResult: [this.state.selectCity],
            });
          } else {
            this.clearCityData();
          }
        })
        .catch(err => {
          this.clearCityData();
        });
    } else {
      this.clearCityData();
    }
    //citySearchResult:[]这还不能直接置空，不然已选中的在select中匹配不上
    this.setState({ currentIndex: index, supplyId: this.supply.serviceName });
    this.searchType = travelUtil.getSearchType(this.supply.serviceName, 2003);
  };

  //提交
  toSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (values.remark && values.remark.length === 201) {
        message.error(this.$t('itinerary.remark.length.tooLong.tip') /*'备注长度超出'*/);
        return;
      }
      if (!err) {
        values.supplierOID = this.supply.supplierOID ? this.supply.supplierOID : null;
        values.fromDate = values.fromDate.utc().format();
        values.leaveDate = values.leaveDate.utc().format();
        if (values.fromDate > values.leaveDate) {
          message.error(
            this.$t('itinerary.hotel.slide.in.more.out.tip') /*'退房日期不能小于入住日期'*/
          );
          return;
        }
        if (values.fromDate === values.leaveDate) {
          message.error(
            this.$t('itinerary.hotel.slide.in.same.out.tip') /*'退房日期不能等于入住日期'*/
          );
          return;
        }
        if (this.state.formCtrl.city.required && !this.state.selectCity.code) {
          message.error(this.$t('itinerary.hotel.slide.city.tip') /*'城市不匹配或未点击选择'*/);
          return;
        }
        values.cityCode = this.state.selectCity.code ? this.state.selectCity.code : null;
        values.cityName = this.state.selectCity.code ? this.state.selectCity.vendorAlias : null;
        //wjk add 18 05 22 判断是否跨选日期
        let isReapeatDate = travelUtil.hotelIsRepeatDate(values, this.dateArray);
        if (isReapeatDate.isRepeat) {
          message.error(
            this.$t('itinerary.hotel.slide.reserved.tip', {
              dateStr: isReapeatDate.dateStr,
            }) /*`${isReapeatDate.dateStr}已预订`*/
          );
          return;
        }
        this.setState({ isLoading: true });
        if (!this.state.editing) {
          travelService
            .travelHotelSubmit(this.state.params.oid, [values])
            .then(res => {
              this.submitFinish(this.$t('itinerary.save.tip') /*已保存*/);
            })
            .catch(err => {
              message.error(err.response.data.message);
              this.setState({ isLoading: false });
            });
        } else {
          values.applicationOID = this.state.params.oid;
          values.hotelItineraryOID = this.props.params.editHotel.hotelItineraryOID;
          travelService
            .updateHotel(values)
            .then(res => {
              this.submitFinish(this.$t('itinerary.update.tip') /*已更新*/);
            })
            .catch(err => {
              message.error(err.response.data.message);
              this.setState({ isLoading: false });
            });
        }
      }
    });
  };

  //提交成功提示
  submitFinish = mes => {
    this.setState({ isLoading: false });
    message.success(mes);
    this.props.form.resetFields();
    this.closeSlide();
  };

  //获取供应商数据
  getSupplies = () => {
    travelService
      .travelSuppliers(2003)
      .then(res => {
        if (res['data']['2003']) {
          this.setState({ supplies: res['data']['2003'] }, () => {
            this.supply = this.state.supplies.length > 0 ? this.state.supplies[0] : {};
            this.searchType = travelUtil.getSearchType(this.supply.serviceName, 2003);
          });
        }
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  //国际、国内
  selectProductType = activeKey => {
    this.setState({ productType: parseInt(activeKey), citySearchResult: [] });
    this.props.form.resetFields('cityName');
  };

  //重置表单
  resetForm = () => {
    this.props.form.resetFields();
    delete this.props.params.editHotel;
    let night = travelUtil.calculateDate(this.baseStartDate, this.baseEndDate) - 1;
    this.setState({
      editing: false,
      nights: night,
    });
  };

  // 关闭侧滑
  closeSlide = () => {
    this.props.close();
  };

  selectCity = (cityName, opt) => {
    this.setState({ selectCity: opt.props['data-city'] });
  };

  disabledDateStart = current => {
    let floatLeaveDay = this.state.formCtrl.leaveDate.floatDays + 1;
    let floatStartDay = -this.state.formCtrl.fromDate.floatDays;
    return travelUtil.disabledDate(
      current,
      moment(this.baseStartDate),
      this.baseEndDate,
      floatLeaveDay,
      floatStartDay,
      this.dateArray
    );
  };

  disabledDateEnd = current => {
    let floatLeaveDay = this.state.formCtrl.leaveDate.floatDays + 1;
    let floatStartDay = -this.state.formCtrl.fromDate.floatDays;
    return travelUtil.disabledDate(
      current,
      this.baseStartDate,
      this.baseEndDate,
      floatLeaveDay,
      floatStartDay,
      this.dateArray
    );
  };

  render() {
    const {
      formCtrl,
      maxRoom,
      minPrice,
      standardEnable,
      supplies,
      defaultDate,
      supplyId,
      currentIndex,
      isLoading,
      citySearchResult,
      nights,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    let editData = travelUtil.isEmpty(this.props.params.editHotel);
    let TAG = editData.isEmpty;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 12 },
    };
    const formSupplyLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const formLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    return (
      <div className="travel-hotel">
        <Spin spinning={isLoading}>
          <Form>
            <FormItem
              {...formSupplyLayout}
              label={this.$t('itinerary.public.slide.supplier') /*供应商*/}
            >
              <Row className="supplyRow">
                {supplies.map((sup, index) => {
                  return (
                    <Col
                      key={sup.supplyId}
                      span={4}
                      className="supply"
                      onClick={() => this.selectSupply(index)}
                    >
                      <Card
                        hoverable
                        className={index == currentIndex ? 'card-on' : 'card-off'}
                        cover={<img src={sup.vendorIcon.path} />}
                      >
                        <span className="card-name">{sup.name}</span>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </FormItem>
            <Tabs
              className="plane-tabs"
              defaultActiveKey={!TAG ? editData.productType : '1001'}
              onChange={this.selectProductType}
            >
              <TabPane tab={this.$t('itinerary.hotel.slide.mainland') /*"国内"*/} key={'1001'} />
              {supplyId !== 'supplyMeiYaService' || supplyId !== 'supplyMeiYaTrainService' ? (
                <TabPane
                  tab={this.$t('itinerary.hotel.slide.international') /*"国际"*/}
                  key={'1002'}
                />
              ) : null}
            </Tabs>
            <Row>
              {(formCtrl.city.enable || formCtrl.city.show) && (
                <Col span={12}>
                  <FormItem
                    {...formLayout}
                    label={this.$t('itinerary.hotel.slide.checkIn.city') /*入住城市*/}
                  >
                    {getFieldDecorator(
                      'cityName',
                      this.cfo(
                        this.$t('itinerary.hotel.slide.checkIn.city'),
                        { type: 'str', value: editData.cityName },
                        !formCtrl.city.required
                      )
                    )(
                      <Select
                        mode="combobox"
                        placeholder={
                          this.$t('itinerary.public.slide.cityNamePlaceholder') /*城市名*/
                        }
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        filterOption={false}
                        onSelect={this.selectCity}
                        optionLabelProp="title"
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        onSearch={this.searchCityChange}
                      >
                        {citySearchResult.map((city, index) => {
                          return (
                            <Option data-city={city} key={city.code} title={city.vendorAlias}>
                              {city.vendorAlias + '  '}
                              <span style={{ color: '#ccc' }}>({city.country})</span>
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )}
              {(formCtrl.roomNumber.enable || formCtrl.roomNumber.show) && (
                <Col span={12}>
                  <FormItem
                    {...formLayout}
                    label={this.$t('itinerary.hotel.slide.max.room') /*最大房间数*/}
                  >
                    {getFieldDecorator(
                      'roomNumber',
                      this.cfo(
                        this.$t('itinerary.hotel.slide.max.room'),
                        { type: 'number', value: maxRoom },
                        !formCtrl.roomNumber.required
                      )
                    )(<InputNumber disabled={true} className="plane-price" />)}
                  </FormItem>
                </Col>
              )}
            </Row>

            <Row>
              {(formCtrl.fromDate.enable || formCtrl.fromDate.show) && (
                <Col span={12}>
                  <FormItem
                    {...formLayout}
                    label={this.$t('itinerary.hotel.slide.check.in') /*入住日期*/}
                  >
                    {getFieldDecorator(
                      'fromDate',
                      this.cfo(
                        this.$t('itinerary.hotel.slide.check.in'),
                        {
                          type: 'moment',
                          value: editData.isEmpty ? this.baseStartDate : editData.fromDate,
                        },
                        !formCtrl.fromDate.required
                      )
                    )(
                      <DatePicker
                        onChange={this.startDateChange}
                        disabledDate={this.disabledDateStart}
                      />
                    )}
                  </FormItem>
                </Col>
              )}
              <Col span={2} className="night">
                {this.$t('itinerary.hotel.slide.night', { nights: nights }) /*晚*/}
              </Col>
              {(formCtrl.leaveDate.enable || formCtrl.leaveDate.show) && (
                <Col span={10}>
                  <FormItem
                    {...formLayout}
                    label={this.$t('itinerary.hotel.slide.check.out') /*退房日期*/}
                  >
                    {getFieldDecorator(
                      'leaveDate',
                      this.cfo(
                        this.$t('itinerary.hotel.slide.check.out'),
                        {
                          type: 'moment',
                          value: editData.isEmpty ? this.baseEndDate : editData.leaveDate,
                        },
                        !formCtrl.leaveDate.required
                      )
                    )(
                      <DatePicker
                        onChange={this.endDateChange}
                        disabledDate={this.disabledDateEnd}
                      />
                    )}
                  </FormItem>
                </Col>
              )}
            </Row>

            {!standardEnable && (
              <Row>
                {formCtrl.minPrice.show && (
                  <Col span={12}>
                    <FormItem
                      {...formLayout}
                      label={this.$t('itinerary.hotel.slide.min.price') /*最小价格*/}
                    >
                      {getFieldDecorator(
                        'minPrice',
                        this.cfo(
                          this.$t('itinerary.hotel.slide.min.price'),
                          { type: 'number', value: editData.minPrice },
                          !formCtrl.minPrice.required
                        )
                      )(<InputNumber min={0} />)}
                    </FormItem>
                  </Col>
                )}
                {formCtrl.maxPrice.show && (
                  <Col span={12}>
                    <FormItem
                      {...formLayout}
                      label={this.$t('itinerary.hotel.slide.max.price') /*最大价格*/}
                    >
                      {getFieldDecorator(
                        'maxPrice',
                        this.cfo(
                          this.$t('itinerary.hotel.slide.max.price'),
                          { type: 'number', value: editData.maxPrice },
                          !formCtrl.maxPrice.required
                        )
                      )(<InputNumber min={minPrice} className="maxPrice" />)}
                    </FormItem>
                  </Col>
                )}
              </Row>
            )}

            <FormItem
              label={this.$t('itinerary.public.slide.remark') /*备注*/}
              {...formSupplyLayout}
            >
              {getFieldDecorator(
                'remark',
                this.cfo(
                  this.$t('itinerary.public.slide.remark'),
                  { type: 'str', value: editData.remark },
                  true
                )
              )(<TextArea maxLength={201} />)}
            </FormItem>
          </Form>
        </Spin>
        <Affix className="travel-affix" offsetBottom={0}>
          <Button onClick={this.toSubmit} type="primary" loading={isLoading}>
            {this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
          </Button>
          <Button className="travel-type-btn" onClick={this.closeSlide}>
            {this.$t('itinerary.type.slide.and.modal.cancel.btn') /*取消*/}
          </Button>
        </Affix>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { language: state.main.language };
}

const wrappedTravelHotel = Form.create()(TravelHotel);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelHotel);
