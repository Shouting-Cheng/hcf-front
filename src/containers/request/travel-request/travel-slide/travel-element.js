import React from 'react';
import { connect } from 'dva';
import config from 'config';
import { getApprovelHistory, deepFullCopy } from 'utils/extend';
import { Input, Spin, Form, Button, DatePicker, Affix, Row, message, Col, TreeSelect } from 'antd';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
import moment from 'moment';
import travelUtil from 'containers/request/travel-request/travelUtil';
import requestService from 'containers/request/request.service';
import Selector from 'widget/selector';
import Chooser from 'widget/chooser';
const TreeNode = TreeSelect.TreeNode;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
class TravelElement extends React.Component {
  supply = {};
  startDate = '';
  endDate = '';
  currentStartDate = '';
  test = {};
  dateArr = [];
  constructor(props) {
    super(props);
    this.state = {
      params: {}, //接收父组件带来的参数
      editing: false, //区分编辑页还是新建页
      formCtrl: {}, //
      standardEnable: false, //是否走差旅标准
      supplies: [], //所有供应商
      currentIndex: 0, //当前供应商数组的下标
      supplyId: '', //当前供应商的serviceName
      productType: 1001, //机票类型 默认国内机票1001 ；1002为国际机票
      defaultDate: '' + moment(travelUtil.getDefaultDate(1)).format('YYYY-MM-DD'),
      isLoading: true, //提交是否loading提示
      isDouble: false, //是否是返程
      cityFromSearchResult: [], //出发城市搜索结果
      cityToSearchResult: [], //目的城市搜索结果
      selectFromCity: {}, //选择的出发城市
      selectToCity: {}, //选择的目的城市
      travelElementCustomField: {},
      formDefaultValue: [],
      nowValue: {},
      startDate: travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date'),
      endDate: travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date'),
      dateRange: [],
    };
  }

  componentWillMount() {
    // this.getSupplies();
    this.getFormInfo();
    let tempMap = this.props.params['travelInfo']['customFormPropertyMap'];
    let obj = tempMap['application.property.control.fields']
      ? JSON.parse(tempMap['application.property.control.fields'])
      : travelUtil.getSetDataByTravelType('flight');
    let isStandard = tempMap['ca.travel.applypolicy.enable']
      ? JSON.parse(tempMap['ca.travel.applypolicy.enable'])
      : false;
    this.setState({
      params: this.props.params,
      formCtrl: obj,
      standardEnable: isStandard,
    });
    // this.getFormDefaultValue(this.props.params.elementFormOid);
    this.currentStartDate = travelUtil.getFormHeadValue(
      this.props.params.defaultValue,
      'start_date'
    );
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.setState({
      startDate: travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date'),
      endDate: this.endDate,
    });
    this.dateArr = travelUtil.getDays(this.startDate, this.endDate);
  }

  CFO = travelUtil.createFormOption;

  //获取表单配置
  getFormInfo = () => {
    requestService.getCustomForm(this.props.params.elementFormOid).then(res => {
      this.setState(
        {
          travelElementCustomField: res.data,
          isLoading: false,
        },
        () => {}
      );
    });
  };

  //提交
  toSubmit = e => {
    if (this.state.dateRange.length == 0) {
      message.error(this.$t('itinerary.form.select.time') /*请选择时间*/);
      return;
    }
    e.preventDefault();
    const { travelElementCustomField } = this.state;
    let params = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        Object.keys(values).map(key => {
          travelElementCustomField.customFormFields.map(field => {
            if (key === field.fieldOid) {
              if (Array.isArray(values[key])) {
                field.value = values[key][0].costCenterItemOid;
                field.showValue = values[key][0].name;
              } else if (travelUtil.isObj(values[key])) {
                field.value = values[key].costCenterItemOid;
                field.showValue = values[key].name;
              } else {
                field.value = values[key];
                field.showValue = values[key];
              }
            }
          });
        });
        params = {
          dateRange: this.state.dateRange,
          customFormFields: travelElementCustomField.customFormFields,
        };
        this.props.close(params);
      }
    });
  };

  onChange = value => {
    if (value[0] === '0') {
      this.setState({ dateRange: this.dateArr });
    } else {
      this.setState({ dateRange: value });
    }
  };

  // 关闭侧滑
  closeSlide = isOk => {
    this.props.close(null);
  };

  //初始化编辑数据
  componentWillReceiveProps() {
    if (this.props.params.isResetPlane) {
      this.resetForm();
      delete this.props.params.isResetPlane;
      return;
    }
    this.startDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date');
    this.endDate = travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date');
    this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    this.endDate = travelUtil.getAfterDate(0, this.endDate);
    let editData = travelUtil.isEmpty(this.props.params.editPlane);
    let TAG = editData.isEmpty;
    if (!TAG) {
      if (!this.state.editing) {
        let num = 0;
        let supId = 0;
        let isD = false;
        this.state.supplies.map((item, index) => {
          if (item.supplierOid === editData.supplierOid) {
            num = index;
            supId = item.serviceName;
            this.supply = item;
          }
        });
        isD = editData.itineraryType === 1002 ? true : false;
        this.setState(
          {
            editing: true,
            currentIndex: num,
            supplyId: supId,
            isDouble: isD,
            productType: editData.productType ? editData.productType : 1001,
            selectFromCity: { code: editData.fromCityCode, vendorAlias: editData.fromCity },
            selectToCity: { code: editData.toCityCode, vendorAlias: editData.toCity },
          },
          () => {
            this.props.form.resetFields();
          }
        );
      }
    }
  }

  disabledDateStart = current => {
    let boo = false;
    if (current < moment(this.startDate) || current > moment(this.endDate)) {
      boo = true;
    }
    return current && boo;
  };

  onChangeDate = dates => {
    if (dates.length === 2) {
      this.setState({
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  render() {
    const { isLoading, travelElementCustomField } = this.state;
    const { getFieldDecorator } = this.props.form;
    let editData = travelUtil.isEmpty(this.props.params.editPlane);
    let TAG = editData.isEmpty;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    let dateArr = [];
    this.dateArr.map(item => {
      dateArr.push({ title: item, value: item, key: item });
    });
    const treeData = [
      {
        title: this.$t('common.all'),
        value: '0',
        key: '0',
        children: dateArr,
      },
    ];
    const tProps = {
      treeData,
      value: this.state.dateRange,
      onChange: this.onChange,
      treeCheckable: true,
      treeDefaultExpandAll: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: this.$t('itinerary.form.select.time') /*请选择时间*/,
      style: {
        width: 300,
      },
    };
    const dateFormat = 'YYYY-MM-DD';
    return (
      <div className="travel-plane">
        <Spin spinning={isLoading}>
          <Form>
            <Row type="flex" align="middle" style={{ marginBottom: '25px' }}>
              <Col
                span={8}
                style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: '14px', textAlign: 'right' }}
              >
                <span style={{ color: '#f5222d' }}>*</span>
                {this.$t('itinerary.form.select.time') /*请选择时间*/}：
              </Col>
              <Col span={16}>
                <TreeSelect {...tProps} />
              </Col>
            </Row>
            {!isLoading &&
              travelElementCustomField.customFormFields &&
              travelElementCustomField.customFormFields.map(item => {
                let selectorItem = {
                  url: `${config.baseUrl}/api/my/cost/center/items/${item.dataSource &&
                    JSON.parse(item.dataSource || '{}').costCenterOid}?page=0&size=1000`,
                  label: 'name',
                  key: 'costCenterItemOid',
                  offlineSearchMode: true,
                };
                let chooseItem = {
                  title: item.fieldName,
                  url: `${config.baseUrl}/api/my/cost/center/items/${item.dataSource &&
                    JSON.parse(item.dataSource || '{}').costCenterOid}`,
                  searchForm: [
                    {
                      type: 'input',
                      id: 'name',
                      label: item.fieldName,
                    },
                  ],
                  columns: [
                    {
                      title: item.fieldName,
                      dataIndex: 'name',
                    },
                  ],
                  key: 'costCenterItemOid',
                };
                return (
                  <FormItem {...formItemLayout} label={item.fieldName} key={item.fieldOid}>
                    {getFieldDecorator(item.fieldOid, {
                      rules: [
                        {
                          required: item.required,
                          message:
                            item.messageKey !== 'input' && item.messageKey !== ''
                              ? this.$t('common.please.select') + item.fieldName
                              : this.$t('common.please.input') + item.fieldName,
                        },
                      ],
                    })(
                      item.messageKey !== 'input' && item.messageKey !== '' ? (
                        item.fieldCode === 'cust_customer' ? (
                          <Chooser
                            selectorItem={chooseItem}
                            valueKey={'code'}
                            labelKey={'name'}
                            single={true}
                          />
                        ) : (
                          <Selector
                            selectorItem={selectorItem}
                            placeholder={this.$t('common.please.select') /* 请选择 */}
                            showSearch={true}
                            entity
                            key={item.formOid}
                          />
                        )
                      ) : (
                        <Input placeholder={this.$t('common.please.input') /* 请输入 */} />
                      )
                    )}
                  </FormItem>
                );
              })}
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
  return {
    language: state.main.language,
    user: state.login.user,
  };
}

const wrappedTravelElement = Form.create()(TravelElement);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelElement);
