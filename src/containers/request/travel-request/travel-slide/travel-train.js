/**
 * Created by wangjiakun on 2018/3/16 0016.
 */
import React from 'react';
import { connect } from 'dva';

import { getApprovelHistory } from 'utils/extend';
import {
  Row,
  Col,
  Spin,
  Divider,
  Input,
  DatePicker,
  InputNumber,
  Form,
  Affix,
  Button,
  Card,
  Select,
  message,
} from 'antd';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const Option = Select.Option;

import moment from 'moment';
import travelService from 'containers/request/travel-request/travel.service';
import travelUtil from 'containers/request/travel-request/travelUtil';

class TravelTrain extends React.Component {
  supply = {};
  searchType = 'standard';
  startDate = '';
  endDate = '';

  constructor(props) {
    super(props);
    this.state = {
      params: {}, //接收父组件的参数
      editing: false, //是否是编辑状态页，默认是新建页
      formCtrl: {},
      supplies: [], //供应商数据
      currentIndex: 0, //当前供应商数组下标
      isLoading: false, //提交时是否loading提示
      cityFromSearchResult: [], //出发地
      cityToSearchResult: [], //目的地
      selectFromCity: {}, //选择的出发城市
      selectToCity: {}, //选择的目的城市
      isStandard: false, //是否走差旅标准,
    };
  }

  componentWillMount() {
    let tempMap = this.props.params['travelInfo']['customFormPropertyMap'];
    let obj = tempMap['application.property.control.fields.train']
      ? JSON.parse(tempMap['application.property.control.fields.train'])
      : travelUtil.getSetDataByTravelType('train');
    let isStandard = tempMap['ca.travel.applypolicy.enable']
      ? JSON.parse(tempMap['ca.travel.applypolicy.enable'])
      : false;
    this.setState({
      params: this.props.params,
      formCtrl: obj,
      isStandard: isStandard,
    });
    this.getSupplies(2002);
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.endDate = travelUtil.getAfterDate(1, this.endDate);
  }

  componentWillReceiveProps() {
    if (this.props.params.isResetTrain) {
      this.resetForm();
      delete this.props.params.isResetTrain;
      return;
    }
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.endDate = travelUtil.getAfterDate(1, this.endDate);
    let editData = travelUtil.isEmpty(this.props.params.editTrain);
    if (!editData.isEmpty && !this.state.editing) {
      let num = 0;
      this.state.supplies.map((m, index) => {
        if (m.supplierOid === editData.supplierOid) {
          num = index;
          this.supply = m;
        }
      });
      this.setState(
        {
          editing: true,
          currentIndex: num,
          selectFromCity: { vendorAlias: editData.fromCity, code: editData.fromCityCode },
          selectToCity: { vendorAlias: editData.toCity, code: editData.toCityCode },
        },
        () => {
          this.props.form.resetFields();
        }
      );
    }
  }

  disabledDate = current => {
    let boo = false;
    if (current < moment(this.startDate) || current >= moment(this.endDate)) {
      boo = true;
    }
    return current && boo;
  };

  cfo = travelUtil.createFormOption;

  //交换城市
  exchangeCity = () => {
    let fromCityItem = this.state.selectFromCity;
    let toCityItem = this.state.selectToCity;
    this.setState({
      selectToCity: fromCityItem,
      selectFromCity: toCityItem,
    });
    this.props.form.setFieldsValue({ fromCity: toCityItem.vendorAlias });
    this.props.form.setFieldsValue({ toCity: fromCityItem.vendorAlias });
  };

  //目的地城市搜索
  handleToCityChange = keyWord => {
    travelService
      .searchCitys(
        this.searchType,
        keyWord,
        'all',
        this.props.language.code === 'zh_cn' ? 'zh_cn' : 'en_us'
      )
      .then(res => {
        this.setState({
          cityToSearchResult: res.data,
          selectToCity: {},
        });
      });
  };

  //出发城市搜索
  handleFromCityChange = keyWord => {
    travelService
      .searchCitys(
        this.searchType,
        keyWord,
        'all',
        this.props.language.code === 'zh_cn' ? 'zh_cn' : 'en_us'
      )
      .then(res => {
        this.setState({
          cityFromSearchResult: res.data,
          selectFromCity: {},
        });
      });
  };

  //选择出发城市
  selectFromCity = (cityName, opt) => {
    this.setState({ selectFromCity: opt.props['data-city'] });
  };

  //选择到达城市
  selectToCity = (cityName, opt) => {
    this.setState({ selectToCity: opt.props['data-city'] });
  };

  //提交
  toSubmit = e => {
    e.preventDefault();
    const { travelElement } = this.props.params;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (travelElement && !err) {
        if (this.state.editing) {
          values.oldDate = this.props.params.editTrain.startDate;
        }
        values.trafficType = 1002;
        values.startDate = values.startDate.utc().format();
        values.fromCityCode = this.state.selectFromCity.code;
        values.toCityCode = this.state.selectToCity.code;
        values.toCity = this.state.selectToCity.vendorAlias;
        values.fromCity = this.state.selectFromCity.vendorAlias;
        this.props.close(values);
      } else {
        if (values.remark && values.remark.length === 201) {
          message.error(this.$t('itinerary.remark.length.tooLong.tip') /*'备注长度超出'*/);
          return;
        }
        if (!err) {
          values.supplierOid = this.supply.supplierOid ? this.supply.supplierOid : null;
          values.startDate = values.startDate.utc().format();
          if (this.state.formCtrl.fromCity.required && !this.state.selectFromCity.vendorAlias) {
            message.error(
              this.$t('itinerary.public.fromCity.checked.tip') /*'出发城市不匹配或未点击选择'*/
            );
            return;
          } else if (this.state.formCtrl.toCity.required && !this.state.selectToCity.vendorAlias) {
            message.error(
              this.$t('itinerary.public.toCity.checked.tip') /*'到达城市不匹配或未点击选择'*/
            );
            return;
          } else {
            values.fromCityCode = this.state.selectFromCity.code;
            values.toCityCode = this.state.selectToCity.code;
            values.toCity = this.state.selectToCity.vendorAlias;
            values.fromCity = this.state.selectFromCity.vendorAlias;
          }
          this.setState({ isLoading: true });
          if (!this.state.editing) {
            travelService
              .travelTrainSubmit(this.state.params.oid, [values])
              .then(res => {
                this.submitFinish(this.$t('itinerary.save.tip') /*已保存*/);
              })
              .catch(err => {
                message.error(err.response.data.message);
                this.setState({ isLoading: false });
              });
          } else {
            values.trainItineraryOid = this.props.params.editTrain.trainItineraryOid;
            travelService
              .updateTrain(values)
              .then(res => {
                this.submitFinish(this.$t('itinerary.update.tip') /*'已更新'*/);
              })
              .catch(err => {
                message.error(err.response.data.message);
                this.setState({ isLoading: false });
              });
          }
        }
      }
    });
  };

  submitFinish = res => {
    this.setState({ isLoading: false });
    this.closeTrainSlide();
    this.props.form.resetFields();
    message.success(res);
  };

  //清空已选城市数据type fromCity出发城市 toCity到达城市
  clearCityData = type => {
    if (type === 'fromCity') {
      this.setState({
        cityFromSearchResult: [],
        selectFromCity: {},
      });
      this.props.form.resetFields(type);
    }
    if (type === 'toCity') {
      this.setState({
        cityToSearchResult: [],
        selectToCity: {},
      });
      this.props.form.resetFields(type);
    }
  };

  //选择供应商
  selectSupply = index => {
    this.supply = this.state.supplies[index];
    //这里火车行程没有国际，所以不用额外处理国内，国际的tab
    if (this.state.selectFromCity.code) {
      travelService
        .isCityInVendor(
          travelUtil.getSearchType(this.supply.serviceName, 2002),
          this.state.selectFromCity.code
        )
        .then(res => {
          if (res.data && res.data.alias) {
            //this.state.selectFromCity上的vendorType这个字段是上一个供应商，现在没有用到这个字段，需要注意
            this.setState({
              cityFromSearchResult: [this.state.selectFromCity],
            });
          } else {
            this.clearCityData('fromCity');
          }
        })
        .catch(err => {
          this.clearCityData('fromCity');
        });
    } else {
      this.clearCityData('fromCity');
    }
    if (this.state.selectToCity.code) {
      travelService
        .isCityInVendor(
          travelUtil.getSearchType(this.supply.serviceName, 2002),
          this.state.selectToCity.code
        )
        .then(res => {
          if (res.data && res.data.alias) {
            //this.state.selectToCity上的vendorType这个字段是上一个供应商，现在没有用到这个字段，需要注意
            this.setState({
              cityToSearchResult: [this.state.selectToCity],
            });
          } else {
            this.clearCityData('toCity');
          }
        })
        .catch(err => {
          this.clearCityData('toCity');
        });
    } else {
      this.clearCityData('toCity');
    }
    //cityFromSearchResult:[], cityToSearchResult:[]这还不能直接置空，不然已选中的在select中匹配不上
    this.setState({ currentIndex: index, supplyId: this.supply.serviceName });
    this.searchType = travelUtil.getSearchType(this.supply.serviceName, 2002);
  };

  //获取供应商数据
  getSupplies = type => {
    travelService
      .travelSuppliers(type)
      .then(res => {
        if (res['data']['2002']) {
          this.setState({ supplies: res['data']['2002'] }, () => {
            this.supply = this.state.supplies.length > 0 ? this.state.supplies[0] : {}; //设置默认供应商为第一个
            this.searchType = travelUtil.getSearchType(this.supply.serviceName, 2002);
          });
        }
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  //重置表单
  resetForm = () => {
    this.props.form.resetFields();
    delete this.props.params.editTrain;
    this.setState({
      editing: false,
    });
  };

  //关闭侧滑
  closeTrainSlide = () => {
    this.props.close();
  };

  render() {
    const {
      formCtrl,
      supplies,
      currentIndex,
      isLoading,
      cityFromSearchResult,
      cityToSearchResult,
      isStandard,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    let editData = travelUtil.isEmpty(this.props.params.editTrain);
    const { travelElement } = this.props.params;
    const formLayout = {
      maxRows: 6,
      minRows: 2,
    };
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const formItemLayoutCity = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };

    return (
      <div className="travel-train">
        <Spin spinning={isLoading}>
          <Form>
            {!travelElement && (
              <FormItem
                {...formItemLayout}
                label={this.$t('itinerary.public.slide.supplier') /*供应商*/}
              >
                <Row className="supplyRow">
                  {supplies.map((sup, index) => {
                    return (
                      <Col
                        key={sup.supplyId}
                        span={5}
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
            )}
            {!travelElement && <Divider />}
            <FormItem className="travel-margin-zero">
              <Row>
                <Col span={12}>
                  <FormItem
                    {...formItemLayoutCity}
                    label={this.$t('itinerary.public.slide.departureCity') /*出发城市*/}
                  >
                    {getFieldDecorator(
                      'fromCity',
                      this.cfo(
                        this.$t('itinerary.public.slide.departureCity') /*出发城市*/,
                        { type: 'str', value: editData.fromCity },
                        !travelElement ? !formCtrl.fromCity.required : false
                      )
                    )(
                      <Select
                        mode="combobox"
                        placeholder={
                          this.$t('itinerary.public.slide.cityNamePlaceholder') /*城市名*/
                        }
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        onSelect={this.selectFromCity}
                        filterOption={false}
                        optionLabelProp="title"
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        onSearch={this.handleFromCityChange}
                      >
                        {cityFromSearchResult.map((city, index) => {
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
                  <FormItem
                    {...formItemLayoutCity}
                    label={this.$t('itinerary.public.slide.arrivalCity') /*到达城市*/}
                  >
                    {getFieldDecorator(
                      'toCity',
                      this.cfo(
                        this.$t('itinerary.public.slide.arrivalCity') /*到达城市*/,
                        { type: 'str', value: editData.toCity },
                        !travelElement ? !formCtrl.toCity.required : false
                      )
                    )(
                      <Select
                        mode="combobox"
                        placeholder={
                          this.$t('itinerary.public.slide.cityNamePlaceholder') /*城市名*/
                        }
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        onSelect={this.selectToCity}
                        filterOption={false}
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        optionLabelProp="title"
                        onSearch={this.handleToCityChange}
                      >
                        {cityToSearchResult.map((city, index) => {
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

                <div className="line-top" />
                <Button
                  className={
                    this.props.language.code === 'zh_cn' ? 'exchange-city' : 'exchange-city-en'
                  }
                  onClick={this.exchangeCity}
                >
                  {this.$t('itinerary.plane.slide.swap') /*换*/}
                </Button>
                <div className="line-bottom" />

                <Col span={12}>
                  <FormItem
                    {...formItemLayoutCity}
                    label={this.$t('itinerary.public.slide.departure') /*出发日期*/}
                  >
                    {getFieldDecorator(
                      'startDate',
                      this.cfo(this.$t('itinerary.public.slide.departure') /*出发日期*/, {
                        type: 'moment',
                        value: editData.isEmpty ? this.startDate : editData.startDate,
                      })
                    )(<DatePicker disabledDate={this.disabledDate} />)}
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            {!travelElement &&
              (formCtrl.ticketPrice.show || formCtrl.seatClass.show) && (
                <FormItem className="train-seat">
                  <Row>
                    {formCtrl.ticketPrice.show && (
                      <Col span={12}>
                        <FormItem
                          {...formItemLayoutCity}
                          label={this.$t('itinerary.public.slide.train.price') /*价格*/}
                        >
                          {getFieldDecorator(
                            'ticketPrice',
                            this.cfo(
                              this.$t('itinerary.public.slide.train.price'),
                              { type: 'number', value: editData.ticketPrice },
                              !formCtrl.ticketPrice.required
                            )
                          )(<InputNumber min={0} className="train-price" />)}
                        </FormItem>
                      </Col>
                    )}
                    {!isStandard &&
                      formCtrl.seatClass.show && (
                        <Col span={12}>
                          <FormItem
                            {...formItemLayoutCity}
                            label={this.$t('itinerary.public.slide.train.class') /*坐席*/}
                          >
                            {getFieldDecorator(
                              'seatClass',
                              this.cfo(
                                this.$t('itinerary.public.slide.train.class') /*坐席*/,
                                {
                                  type: 'str',
                                  value: editData.isEmpty ? '硬座' : editData.seatClass,
                                },
                                !formCtrl.seatClass.required
                              )
                            )(
                              <Select>
                                {travelUtil.getSeatClass('train').map((dis, index) => {
                                  return (
                                    <Option value={dis} key={dis}>
                                      {dis}
                                    </Option>
                                  );
                                })}
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                      )}
                  </Row>
                </FormItem>
              )}

            {!travelElement && (
              <FormItem
                {...formItemLayout}
                label={this.$t('itinerary.public.slide.remark') /*备注*/}
              >
                {getFieldDecorator(
                  'remark',
                  this.cfo('', { type: 'str', value: editData.remark }, true)
                )(<TextArea autosize={formLayout} maxLength={201} />)}
              </FormItem>
            )}
          </Form>
        </Spin>
        <Affix className="travel-affix" offsetBottom={0}>
          <Button type="primary" loading={isLoading} onClick={this.toSubmit}>
            {this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
          </Button>
          <Button className="travel-type-btn" onClick={this.closeTrainSlide}>
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

const wrappedTravelTrain = Form.create()(TravelTrain);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelTrain);
