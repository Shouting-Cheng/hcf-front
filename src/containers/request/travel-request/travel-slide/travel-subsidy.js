/**
 * Created by wangjiakun on 2018/3/19 0019.
 */
import React from 'react';
import { connect } from 'dva';

import { getApprovelHistory } from 'utils/extend';
import {
  Input,
  Form,
  DatePicker,
  Divider,
  Checkbox,
  message,
  Tabs,
  Row,
  Col,
  Affix,
  Spin,
  Modal,
  Button,
  Select,
} from 'antd';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const confirm = Modal.confirm;

import moment from 'moment';
import travelService from 'containers/request/travel-request/travel.service';
import travelUtil from 'containers/request/travel-request/travelUtil';
import baseService from 'share/base.service';

class TravelSubsidy extends React.Component {
  startDate = '';
  endDate = '';
  baseDays = 0; //如果没有携带默认值则显示最大天数。
  currentCity = { city: null, isChange: false };
  profile = {};
  baseStartDate = '';
  baseEndDate = '';

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false, //是否是编辑状态
      isLoading: false,
      days: 1, //区间天数
      productType: '1001',
      cityResult: [],
      params: {},
      formCtrl: {},
      standardEnable: false,
      isGetType: false, //是否在获取差补类型
      subsidyTypeData: [], //获取的对应城市的差补类型
      allSubsidyData: {}, //根据城市返回的差补类型的所有数据
    };
  }

  componentWillMount() {
    let tempMap = this.props.params['travelInfo']['customFormPropertyMap'];
    let isStandard = tempMap['ca.travel.applypolicy.enable']
      ? JSON.parse(tempMap['ca.travel.applypolicy.enable'])
      : false;
    let startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    let endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    let days = 0;
    if (startDate && endDate) {
      days = travelUtil.calculateDate(startDate, endDate);
      this.baseDays = days;
    }
    this.setState({
      params: this.props.params,
      standardEnable: isStandard,
      days: days,
    });
    baseService.getProfile().then(res => {
      this.profile = res.data;
    });
    this.setDate();
  }

  setDate = () => {
    this.baseStartDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.baseEndDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    let days = travelUtil.calculateDate(this.baseStartDate, this.baseEndDate);
    this.baseDays = days;
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.setState({ days: days });
  };

  componentWillReceiveProps() {
    if (this.props.params.isResetSubsidy) {
      this.resetForm();
      delete this.props.params.isResetSubsidy;
      return;
    }
    let editData = travelUtil.isEmpty(this.props.params.editSubsidy);
    if (!editData.isEmpty && !this.state.isEditing) {
      this.setState({ isEditing: true });
      this.currentCity.vendorAlias = editData.cityName;
      this.currentCity.code = editData.cityCode;
      this.setHavedCity(); //设置默认城市
      this.setState({ isGetType: true });
      let days = travelUtil.calculateDate(editData.startDate, editData.endDate);
      let values = {};
      values.applicationOid = this.props.params.oid;
      values.cityCode = editData.cityCode;
      values.cityName = editData.cityName;
      values.startDate = editData.startDate;
      this.endDate = moment(editData.endDate);
      this.startDate = moment(editData.startDate);
      values.id = editData.id;
      values.endDate = editData.endDate;
      travelService
        .requestSubsidyType(values)
        .then(res => {
          if (res.data.expenseTypes.length > 0) {
            res.data.expenseTypes.map(item => {
              item.isChecked = true;
            });
          }
          this.setState(
            {
              subsidyTypeData: res.data.expenseTypes.length > 0 ? res.data.expenseTypes : [],
              allSubsidyData: res.data,
              isGetType: false,
              isEditing: true,
              days: days,
            },
            () => {
              this.props.form.resetFields();
            }
          );
        })
        .catch(err => {
          message.error(err.response.data.message);
          this.setState({ isGetType: false });
        });
    } else {
      let tempStartDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
      let tempEndDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
      if (this.baseStartDate !== tempStartDate || this.baseEndDate !== tempEndDate) {
        //头部时间是否已经改变
        this.setDate(); //
      }
    }
  }

  cfo = travelUtil.createFormOption;

  //重置表单
  resetForm = () => {
    this.currentCity = { vendorAlias: null, isChange: false };
    this.props.form.resetFields();
    this.setDate();
    delete this.props.params.editSubsidy;
    this.setState({
      isLoading: false,
      isEditing: false,
      subsidyTypeData: [],
      cityResult: [],
      days: this.baseDays,
    });
  };

  //关闭清空所有设置
  closeSubsidy = () => {
    this.props.close();
  };

  //确定差补
  toSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (values.remark && values.remark.length === 201) {
        message.error(this.$t('itinerary.remark.length.tooLong.tip') /*'备注长度超出'*/);
        return;
      }
      if (!err) {
        if (!this.currentCity.code) {
          message.error(this.$t('itinerary.subsidy.slide.select.city.tip') /*'城市不匹配'*/);
          return;
        }
        values.cityCode = this.currentCity.code;
        values.cityName = this.currentCity.vendorAlias;
        // values.startDate = values.startDate.utc().format();// 设置开始日期
        // values.endDate = values.endDate.utc().format();//设置结束日期
        // wjk change 2018 08 01 传UTC格式，但后台需要的时分时间日期之间间隔必须是整天（两日期时间差必须是24小时整倍数）
        values.startDate =
          travelUtil.getAfterDate(-1, values.startDate.local().format('YYYY-MM-DD')) + 'T16:00Z';
        values.endDate =
          travelUtil.getAfterDate(-1, values.endDate.local().format('YYYY-MM-DD')) + 'T16:00Z';
        let expenseTypeOids = [];
        this.state.subsidyTypeData.map(item => {
          if (item.isChecked) {
            expenseTypeOids.push(item.expenseTypeOid);
          }
        });
        if (!expenseTypeOids.length) {
          if (this.state.subsidyTypeData.length) {
            message.error(
              this.$t('itinerary.subsidy.slide.select.expenseType.tip') /*请选择差补类型*/
            );
          } else {
            message.error(
              this.$t('itinerary.subsidy.slide.subsidy.noHave.tip') /*'当前城市无合适差补类型'*/
            );
          }
          return;
        }
        this.setState({ isLoading: true });
        values.expenseTypeOids = expenseTypeOids; //设置所添加差补类型的oid
        values.applicationOid = this.props.params.oid; //设置申请单oid
        values.travelSubsidiesRequestOid = this.state.allSubsidyData.travelSubsidiesRequestOid; //设置差补id
        values.id = this.state.allSubsidyData.id; //设置id
        values.status = this.state.allSubsidyData.status; //设置状态 1001:初始状态 ，1002:已确认，并生成明细
        values.deleted = this.state.allSubsidyData.deleted; // false or true 表示啥文档没写？
        if (!this.state.isEditing) {
          //不是编辑状态属于新建提交
          travelService
            .travelSubsidySubmit(values)
            .then(res => {
              message.success(this.$t('itinerary.save.tip') /*已保存*/);
              this.closeSubsidy();
            })
            .catch(err => {
              message.error(err.response.data.message);
              this.setState({ isLoading: false });
            });
        } else {
          travelService
            .updateSubsidy(values)
            .then(res => {
              message.success(this.$t('itinerary.update.tip') /*已更新*/);
              this.closeSubsidy();
            })
            .catch(err => {
              this.setState({ isLoading: false });
              message.error(
                this.$t('itinerary.operation.failed.tip') /*`操作失败:`*/ +
                  err.response.data.message
              );
            });
        }
      }
    });
  };

  //国际、国内选择
  selectProductType = activeKey => {
    this.setState({ productType: activeKey, cityResult: [] });
    this.currentCity.vendorAlias = null; //所选城市置空
    this.props.form.resetFields('cityName');
  };

  //城市搜索
  searchCityChange = keyWord => {
    this.currentCity.isChange = true;
    let country = this.state.productType === '1002' ? 'foreign' : 'China';
    travelService
      .searchCitys(
        'standard',
        keyWord,
        country,
      this.props.language.code === 'zh_cn' ? 'zh_cn' : 'en_us'
      )
      .then(res => {
        this.setState({
          cityResult: res.data,
        });
      });
  };

  // 选择 城市 -->获取差补类型
  getSubsidyType = (city, opt) => {
    this.currentCity.isChange = false;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (!this.currentCity.vendorAlias) {
          this.setState({ isGetType: true });
          values.applicationOid = this.props.params.oid;
          values.cityCode = opt.props['data-city'].code;
          values.cityName = opt.props['data-city'].vendorAlias;
          if (this.state.isEditing) {
            //如果是更新必填id
            values.id = this.props.params.editSubsidy.id;
          }
          this.currentCity = opt.props['data-city'];
          travelService
            .requestSubsidyType(values)
            .then(res => {
              if (res.data.expenseTypes.length > 0) {
                res.data.expenseTypes.map(item => {
                  item.isChecked = true;
                });
              }
              this.setState({
                subsidyTypeData: res.data.expenseTypes.length > 0 ? res.data.expenseTypes : [],
                allSubsidyData: res.data,
              });
              this.setState({ isGetType: false });
            })
            .catch(e => {
              this.setState({ isGetType: false });
              message.error(
                this.$t('itinerary.operation.failed.tip') /*`操作失败:`*/ + e.response.data.message
              );
            });
        } else if (
          this.state.subsidyTypeData &&
          this.currentCity.vendorAlias &&
          this.currentCity.code !== city
        ) {
          this.showConfirm(values, opt);
        }
      }
    });
  };

  onBlurCity = () => {
    if (this.currentCity.isChange) {
      //如果改动了却没有select 恢复原状态
      this.setHavedCity();
    }
  };

  setHavedCity = () => {
    if (!this.currentCity.vendorAlias) {
      //是否当前没有选择城市
      this.props.form.resetFields();
      return;
    }
    let citys = [this.currentCity];
    this.setState({ cityResult: citys });
    this.props.form.setFieldsValue({ cityName: citys[0].vendorAlias });
  };

  //选择差补类型
  selectSubsidyType = index => {
    let temp = this.state.subsidyTypeData;
    temp[index].isChecked = !temp[index].isChecked;
    this.setState({ subsidyTypeData: temp });
  };

  //时间改变重新计算日期区间天数
  startDateChange = e => {
    this.startDate = e;
    let days = 0;
    days = travelUtil.calculateDate(e, this.endDate);
    this.setState({ days: days });
  };

  //时间改变重新计算日期区间天数
  endDateChange = e => {
    this.endDate = e;
    let days = 0;
    days = travelUtil.calculateDate(this.startDate, e);
    this.setState({ days: days });
  };

  disabledDateStart = current => {
    let boo = false;
    let startDate = moment(
      travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date')
    );
    let endDate = travelUtil.getAfterDate(1, moment(this.endDate).format('YYYY-MM-DD'));
    if (
      current < moment(startDate, 'YYYYMMDD') ||
      current >= moment(endDate, 'YYYYMMDD hh:mm:ss')
    ) {
      boo = true;
    }
    return current && boo;
  };

  disabledDateEnd = current => {
    let boo = false;
    let endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    endDate = travelUtil.getAfterDate(1, moment(endDate).format('YYYY-MM-DD'));
    if (!(this.startDate instanceof moment)) {
      this.startDate = moment(this.startDate);
    }
    if (
      current < moment(this.startDate, 'YYYYMMDD') ||
      current >= moment(endDate, 'YYYYMMDD hh:mm:ss')
    ) {
      boo = true;
    }
    return current && boo;
  };

  render() {
    const { isLoading, days, cityResult, isGetType, subsidyTypeData } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayoutL = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const formItemLayoutM = {
      labelCol: { span: 4 },
      wrapperCol: { span: 6 },
    };
    const formItemLayoutS = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    let editData = travelUtil.isEmpty(this.props.params.editSubsidy);
    let isEmpty = editData.isEmpty;
    return (
      <div className="add-subsidy">
        <Spin spinning={isLoading}>
          <Form>
            <Tabs defaultAcitiveKey={'1001'} onChange={this.selectProductType}>
              <TabPane
                tab={this.$t('itinerary.subsidy.slide.mainland') /*"国内城市"*/}
                key={'1001'}
              />
              <TabPane
                tab={this.$t('itinerary.subsidy.slide.international') /*"国际城市"*/}
                key={'1002'}
              />
            </Tabs>
            <FormItem
              {...formItemLayoutM}
              label={this.$t('itinerary.subsidy.slide.city') /*"差补城市"*/}
            >
              {getFieldDecorator(
                'cityName',
                this.cfo(this.$t('itinerary.subsidy.slide.city'), {
                  type: 'str',
                  value: isEmpty ? '' : editData.cityName,
                })
              )(
                <Select
                  mode="combobox"
                  placeholder={this.$t('itinerary.public.slide.cityNamePlaceholder') /*城市名*/}
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  onBlur={this.onBlurCity}
                  onSelect={this.getSubsidyType}
                  optionLabelProp="title"
                  filterOption={false}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  onSearch={this.searchCityChange}
                >
                  {cityResult.map(city => {
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
            <Row>
              <Col span={12}>
                <FormItem
                  {...formItemLayoutS}
                  label={this.$t('itinerary.subsidy.slide.start.date') /*开始日期*/}
                >
                  {getFieldDecorator(
                    'startDate',
                    this.cfo(
                      this.$t('itinerary.subsidy.slide.start.date'),
                      {
                        type: 'moment',
                        value: isEmpty ? this.baseStartDate : editData.startDate,
                      },
                      false
                    )
                  )(
                    <DatePicker
                      style={{ width: '100%' }}
                      onChange={this.startDateChange}
                      disabledDate={this.disabledDateStart}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={2} className="subsidy-days">
                {this.$t('itinerary.subsidy.slide.days', { days: days }) /*`${days}天`*/}
              </Col>
              <Col span={10}>
                <FormItem
                  {...formItemLayoutS}
                  label={this.$t('itinerary.subsidy.slide.end.date') /*结束日期*/}
                >
                  {getFieldDecorator(
                    'endDate',
                    this.cfo(
                      this.$t('itinerary.subsidy.slide.end.date'),
                      {
                        type: 'moment',
                        value: isEmpty ? this.baseEndDate : editData.endDate,
                      },
                      false
                    )
                  )(
                    <DatePicker onChange={this.endDateChange} disabledDate={this.disabledDateEnd} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Divider />
            <FormItem
              label={this.$t('itinerary.subsidy.slide.expenseType') /*差补类型*/}
              {...formItemLayoutL}
            >
              <Spin spinning={isGetType}>
                {subsidyTypeData.length > 0 ? (
                  <Row>
                    {subsidyTypeData.map((item, index) => {
                      return (
                        <Col
                          span={5}
                          className="subsidy-type"
                          onClick={() => this.selectSubsidyType(index)}
                          key={item.iconName + index}
                        >
                          <img className="type-icon" src={item.iconURL} />
                          <span className="type-name">{item.name}</span>
                          <Checkbox checked={item.isChecked} className="type-checked" />
                        </Col>
                      );
                    })}
                  </Row>
                ) : (
                  this.$t('itinerary.subsidy.slide.subsidy.noHave.tip')
                ) /*'当前城市无合适差补类型'*/}
              </Spin>
            </FormItem>
            <Divider />
            <FormItem
              {...formItemLayoutL}
              label={this.$t('itinerary.public.slide.remark') /*备注*/}
            >
              {getFieldDecorator(
                'remark',
                this.cfo(
                  this.$t('itinerary.public.slide.remark'),
                  { type: 'str', value: editData.remark },
                  true
                )
              )(
                <TextArea
                  style={{ marginTop: 12 }}
                  autosize={{ minRows: 3, maxRows: 6 }}
                  maxLength={201}
                />
              )}
            </FormItem>
          </Form>
        </Spin>
        <Affix className="travel-affix" offsetBottom={0}>
          <Button type="primary" loading={isLoading} onClick={this.toSubmit}>
            {this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
          </Button>
          <Button className="travel-type-btn" onClick={this.closeSubsidy}>
            {this.$t('itinerary.type.slide.and.modal.cancel.btn') /*取消*/}
          </Button>
        </Affix>
      </div>
    );
  }

  showConfirm = (values, opt) => {
    confirm({
      title: this.$t('itinerary.form.tips') /*'提示?'*/,
      content: this.$t('itinerary.subsidy.slide.changeCity.tip') /*'更改城市将清空已添加的差补'*/,
      okText: this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/,
      cancelText: this.$t('itinerary.type.slide.and.modal.cancel.btn') /*取消*/,
      onOk: () => {
        this.currentCity = opt.props['data-city'];
        this.currentCity.isChange = false;
        this.setState({ isGetType: true });
        this.setHavedCity();
        values.applicationOid = this.props.params.oid;
        values.cityCode = opt.props['data-city'].code;
        values.cityName = opt.props['data-city'].vendorAlias;
        travelService
          .requestSubsidyType(values)
          .then(res => {
            if (res.data.expenseTypes.length > 0) {
              res.data.expenseTypes.map(item => {
                item.isChecked = true;
              });
            }
            this.setState({
              subsidyTypeData: res.data.expenseTypes.length > 0 ? res.data.expenseTypes : [],
              allSubsidyData: res.data,
            });
            this.setState({ isGetType: false });
          })
          .catch(e => {
            this.setState({ isGetType: false });
            message.error(
              this.$t('itinerary.operation.failed.tip') /*`操作失败:`*/ +
                `${e.response.data.message}`
            );
          });
      },
      onCancel: () => {
        this.setHavedCity();
      },
    });
  };
}

function mapStateToProps(state) {
  return { language: state.main.language };
}

const wrappedTravelSubsidy = Form.create()(TravelSubsidy);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelSubsidy);
