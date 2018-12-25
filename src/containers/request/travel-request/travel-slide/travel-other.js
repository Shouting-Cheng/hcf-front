/**
 * Created by wangjiakun on 2018/3/19 0019.
 */
import React from 'react';
import { connect } from 'dva';

import { getApprovelHistory } from 'utils/extend';
import moment from 'moment';
import {
  Row,
  Col,
  Spin,
  Button,
  Radio,
  Select,
  Input,
  Form,
  DatePicker,
  Affix,
  Divider,
  Tabs,
  message,
} from 'antd';
const TextArea = Input.TextArea;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;

import travelService from 'containers/request/travel-request/travel.service';
import travelUtil from 'containers/request/travel-request/travelUtil';

class TravelOther extends React.Component {
  startDate = '';
  endDate = '';
  currentStartDate = '';

  constructor(props) {
    super(props);
    this.state = {
      params: {}, //接收父组件参数
      editing: false, //区分编辑页还是新建页。默认新建页
      isLoading: false, //提交时是否loading提示
      isOther: false, //交通类型是否为 其他
      isDouble: false, //往返
      cityToSearchResult: [], //目的地城市
      cityFromSearchResult: [], //出发地
      selectFromCity: {}, //选择的出发城市
      selectToCity: {}, //选择的目的城市
    };
  }

  componentWillMount() {
    this.setState({
      params: this.props.params,
    });
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.currentStartDate = travelUtil.getFormHeadValue(
      this.props.params.defaultValue,
      'start_date'
    );
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.endDate = travelUtil.getAfterDate(1, this.endDate);
  }

  componentWillReceiveProps() {
    if (this.props.params.isResetOther) {
      this.resetForm();
      delete this.props.params.isResetOther;
      return;
    }
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.endDate = travelUtil.getAfterDate(1, this.endDate);
    let editData = travelUtil.isEmpty(this.props.params.editOther);
    if (!editData.isEmpty && !this.state.editing) {
      //不为空且不再编辑状态
      let isD = editData.itineraryType == 1002 ? true : false;
      let isO = editData.trafficType == 1003 ? true : false;
      this.setState(
        {
          isDouble: isD,
          editing: true,
          isOther: isO,
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

  //交通类型选择
  trafficTypeHandle = value => {
    value === 1003 ? this.setState({ isOther: true }) : this.setState({ isOther: false });
  };

  //单程 or 往返选择
  itineraryTypeHandle = e => {
    let value = e.target.value;
    value === 1002 ? this.setState({ isDouble: true }) : this.setState({ isDouble: false });
    this.props.form.resetFields(['endDate']);
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

  //出发地搜索
  handleFromCityChange = keyWord => {
    let vendorType = 'standard';
    travelService
      .searchCitys(
        vendorType,
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

  //目的地搜索
  handleToCityChange = keyWord => {
    let vendorType = 'standard';
    travelService
      .searchCitys(
        vendorType,
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

  //提交
  toSubmit = e => {
    e.preventDefault();
    const { travelElement } = this.props.params;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (travelElement && !err) {
        if (this.state.editing) {
          values.oldDate = this.props.params.editOther.startDate;
        }
        values.type = 'traffics';
        values.trafficType = 1003;
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
          this.setState({ isLoading: true });
          if (values.trafficType === 1001) {
            values.trafficTypeName = this.$t('itinerary.other.slide.trafficType.car') /*汽车*/;
          }
          if (values.trafficType === 1002) {
            values.trafficTypeName = this.$t('itinerary.other.slide.trafficType.ship') /*轮船*/;
          }
          if (values.itineraryType === 1002 && startDate > endDate) {
            message.error(this.$t('itinerary.public.date.checked.tip') /*'返回日期早于出发日期'*/);
            return;
          }
          values.startDate = values.startDate.utc().format();
          values.endDate = values.itineraryType === 1002 ? values.endDate.utc().format() : null;
          if (!this.state.selectFromCity.vendorAlias) {
            message.error(
              this.$t('itinerary.public.fromCity.checked.tip') /*'出发城市不匹配或未点击选择'*/
            );
            this.setState({ isLoading: false });
            return;
          } else if (!this.state.selectToCity.vendorAlias) {
            message.error(
              this.$t('itinerary.public.toCity.checked.tip') /*'到达城市不匹配或未点击选择'*/
            );
            this.setState({ isLoading: false });
            return;
          } else {
            values.fromCityCode = this.state.selectFromCity.code;
            values.toCityCode = this.state.selectToCity.code;
            values.toCity = this.state.selectToCity.vendorAlias;
            values.fromCity = this.state.selectFromCity.vendorAlias;
          }
          if (!this.state.editing) {
            travelService
              .travelOtherSubmit(this.state.params.oid, [values])
              .then(res => {
                this.submitFinish(this.$t('itinerary.save.tip') /*'已保存'*/);
              })
              .catch(err => {
                message.error(err.message);
              });
          } else {
            values.otherItineraryOid = this.props.params.editOther.otherItineraryOid;
            values.applicationOid = this.state.params.oid;
            travelService.updateOther(values).then(res => {
              this.submitFinish(this.$t('itinerary.update.tip') /*已更新*/);
            });
          }
        }
      }
    });
  };

  submitFinish = res => {
    this.setState({ isLoading: false });
    message.success(res);
    this.props.form.resetFields();
    this.setClose();
  };

  startDateChange = e => {
    this.currentStartDate = e;
    let end = this.props.form.getFieldValue('endDate');
    if (e > end) {
      this.props.form.setFieldsValue({ endDate: e });
    }
  };

  //重置表单
  resetForm = () => {
    this.props.form.resetFields();
    this.currentStartDate = this.startDate;
    delete this.props.params.editOther;
    this.setState({ editing: false, isOther: false, isDouble: false });
  };

  //关闭侧滑
  setClose = () => {
    this.props.close();
  };

  render() {
    const { isLoading, isOther, isDouble, cityFromSearchResult, cityToSearchResult } = this.state;
    const { getFieldDecorator } = this.props.form;
    let editData = travelUtil.isEmpty(this.props.params.editOther);
    const { travelElement } = this.props.params;
    let isEmpty = editData.isEmpty;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const formItemLayoutCity = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    const textAreaLayout = {
      maxRows: 6,
      minRows: 2,
    };
    return (
      <div className="travel-other">
        <Spin spinning={isLoading}>
          <Form>
            {!travelElement && (
              <Row>
                <Col span={12}>
                  <FormItem
                    {...formItemLayoutCity}
                    key="trafficType"
                    label={this.$t('itinerary.other.slide.trafficType') /*交通类型*/}
                  >
                    {getFieldDecorator(
                      'trafficType',
                      this.cfo(this.$t('itinerary.other.slide.trafficType'), {
                        type: 'number',
                        value: editData.trafficType ? editData.trafficType : 1001,
                      })
                    )(
                      <Select onChange={this.trafficTypeHandle}>
                        <Option value={1001}>
                          {this.$t('itinerary.other.slide.trafficType.car') /*汽车*/}
                        </Option>
                        <Option value={1002}>
                          {this.$t('itinerary.other.slide.trafficType.ship') /*轮船*/}
                        </Option>
                        <Option value={1003}>
                          {this.$t('itinerary.other.slide.trafficType.other') /*其他*/}
                        </Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                {isOther && (
                  <Col span={8}>
                    <FormItem key="trafficTypeName">
                      {getFieldDecorator(
                        'trafficTypeName',
                        this.cfo(this.$t('itinerary.other.slide.trafficType'), {
                          type: 'str',
                          value: editData.trafficTypeName,
                        })
                      )(
                        <Input
                          placeholder={
                            this.$t('itinerary.public.slide.remarkPlaceholder') /*请输入*/
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
              </Row>
            )}
            {!travelElement && <Divider style={{ marginTop: 0 }} />}
            {!travelElement && (
              <FormItem
                {...formItemLayout}
                label={this.$t('itinerary.other.slide.itineraryType') /*行程类型*/}
              >
                {getFieldDecorator(
                  'itineraryType',
                  this.cfo(this.$t('itinerary.other.slide.itineraryType'), {
                    type: 'number',
                    value: editData.itineraryType ? editData.itineraryType : 1001,
                  })
                )(
                  <RadioGroup className="travel-type-radio" onChange={this.itineraryTypeHandle}>
                    <Radio value={1001}>{this.$t('itinerary.public.slide.oneWay') /*单程*/}</Radio>
                    <Radio value={1002}>
                      {this.$t('itinerary.public.slide.roundTrip') /*往返*/}
                    </Radio>
                  </RadioGroup>
                )}
              </FormItem>
            )}
            <FormItem>
              <Row>
                <Col span={12}>
                  <FormItem
                    {...formItemLayoutCity}
                    label={this.$t('itinerary.public.slide.departureCity') /*出发城市*/}
                  >
                    {getFieldDecorator(
                      'fromCity',
                      this.cfo(this.$t('itinerary.public.slide.departureCity'), {
                        type: 'str',
                        value: editData.fromCity,
                      })
                    )(
                      <Select
                        mode="combobox"
                        placeholder={
                          this.$t('itinerary.public.slide.cityNamePlaceholder') /*城市名*/
                        }
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        filterOption={false}
                        optionLabelProp="title"
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        onSelect={this.selectFromCity}
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
                      this.cfo(this.$t('itinerary.public.slide.arrivalCity'), {
                        type: 'str',
                        value: editData.toCity,
                      })
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
                        optionLabelProp="title"
                        getPopupContainer={triggerNode => triggerNode.parentNode}
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
                      this.cfo(this.$t('itinerary.public.slide.departure'), {
                        type: 'moment',
                        value: isEmpty ? this.startDate : editData.startDate,
                      })
                    )(
                      <DatePicker
                        onChange={this.startDateChange}
                        disabledDate={this.disabledDate}
                      />
                    )}
                  </FormItem>
                  {!travelElement && (
                    <FormItem
                      {...formItemLayoutCity}
                      label={this.$t('itinerary.public.slide.return') /*返回日期*/}
                    >
                      {getFieldDecorator(
                        'endDate',
                        this.cfo(
                          this.$t('itinerary.public.slide.return'),
                          {
                            type: 'moment',
                            value: !isEmpty && editData.endDate ? editData.endDate : this.startDate,
                          },
                          !isDouble
                        )
                      )(
                        <DatePicker
                          disabledDate={c =>
                            travelUtil.disabledDate(c, this.currentStartDate, this.endDate, 0)
                          }
                          disabled={!isDouble}
                        />
                      )}
                    </FormItem>
                  )}
                </Col>
              </Row>
            </FormItem>
            {!travelElement && (
              <FormItem
                {...formItemLayout}
                label={this.$t('itinerary.public.slide.remark') /*备注*/}
              >
                {getFieldDecorator(
                  'remark',
                  this.cfo('', { type: 'str', value: editData.remark }, true)
                )(<TextArea autosize={textAreaLayout} maxLength={201} />)}
              </FormItem>
            )}
          </Form>
        </Spin>
        <Affix className="travel-affix" offsetBottom={0}>
          <Button onClick={this.toSubmit} type="primary" loading={isLoading}>
            {this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
          </Button>
          <Button onClick={this.setClose} className="travel-type-btn">
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

const wrappedTravelOther = Form.create()(TravelOther);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelOther);
