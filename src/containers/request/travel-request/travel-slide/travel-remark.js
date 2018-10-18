/**
 * Created by wangjiakun on 2018/3/19 0019.
 */
import React from 'react';
import { connect } from 'dva';

import { getApprovelHistory } from 'utils/extend';
import { Input, Form, Button, Radio, Row, Col, Affix, message, Spin } from 'antd';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

import moment from 'moment';
import 'styles/request/travel-request/travel-type.scss';
import travelService from 'containers/request/travel-request/travel.service';
import travelUtil from 'containers/request/travel-request/travelUtil';

class TravelRemark extends React.Component {
  baseStartDate = '';
  baseEndDate = '';
  constructor(props) {
    super(props);
    this.state = {
      isInit: false, //是否初始化了
      isLoading: false,
      currentIndex: 0, //当前日期序号
      dates: [], //所有日期
      selectDate: '', //当前所选日期
      remarks: {}, //当前所选日期对应的备注数据
    };
  }

  componentWillMount() {
    this.updateDateFromForm();
    this.initRemark(); //初始化侧滑中的日期数据以及第一天对应的备注信息。
  }

  componentWillReceiveProps() {
    let tempRemark = travelUtil.isEmpty(this.props.params.editRemark);
    if (!tempRemark.isEmpty && !this.state.isInit) {
      this.initRemark(tempRemark);
    } else {
      this.updateDateFromForm();
    }
  }

  //更新时间
  updateDateFromForm = () => {
    let start = '';
    let end = '';
    start = moment(
      travelUtil.getFormHeadValue(this.props.params.defaultValue, 'start_date')
    ).format('YYYY-MM-DD+hh:mm:ss');
    end = moment(travelUtil.getFormHeadValue(this.props.params.defaultValue, 'end_date')).format(
      'YYYY-MM-DD+hh:mm:ss'
    );
    if (this.baseStartDate) {
      if (this.baseEndDate !== end || this.baseStartDate !== start) {
        this.baseEndDate = end;
        this.baseStartDate = start;
        this.initRemark();
      }
    } else {
      this.baseEndDate = end;
      this.baseStartDate = start;
    }
  };

  /**
   * 初始化方法，有参数时为点击记录进入，携带点击日期，根据日期重新初始化
   * @param tempRemark 携带具体日期的记录对象editRemark，从trave-type传来
   */
  initRemark = tempRemark => {
    let currentItem = null;
    let currentNum = 0;
    travelService
      .getDates(this.props.params.oid, this.baseStartDate, this.baseEndDate)
      .then(res => {
        res.data.map((i, index) => {
          if (tempRemark && i.remarkDate == tempRemark.remarkDate) {
            currentItem = i;
            currentNum = index;
          }
        });
        this.getRemarks(currentItem ? currentItem : res.data[0]);
        this.setState({
          isInit: true,
          dates: res.data,
          currentIndex: currentNum,
          selectDate: currentItem ? currentItem : res.data[0],
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  /**
   * 根据日期获取备注信息
   * @param date
   * @param index
   */
  getRemarks = (date, index) => {
    let formatDate = moment(date.remarkDate).format('YYYY-MM-DD+hh:mm:ss');
    this.setState({ selectDate: date, currentIndex: index });
    this.props.form.resetFields();
    travelService
      .getRemarksByDate(this.props.params.oid, formatDate)
      .then(res => {
        this.setState({
          remarks: res.data,
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  //提交
  toSubmit = () => {
    this.state.dates.map(item => {
      if (item.remark && item.remark.length === 201) {
        message.error(this.$t('itinerary.remark.length.tooLong.tip') /*'备注长度超出'*/);
        return;
      }
    });
    this.setState({ isLoading: true });
    travelService
      .remarkSubmit(this.props.params.oid, this.state.dates)
      .then(res => {
        this.setClose();
        this.setState({ isLoading: false });
        message.success(this.$t('itinerary.remark.add.success') /*'添加成功'*/);
      })
      .catch(err => {
        message.error(err.response.data.message);
        this.setState({ isLoading: false });
      });
  };

  //关闭侧滑
  setClose = () => {
    this.props.close();
    delete this.props.params.editRemark;
    this.setState({
      isInit: false,
    });
  };

  //
  changeRemark = e => {
    let value = e.target.value;
    this.state.dates[this.state.currentIndex].remark = value;
  };

  //清空textArea中的备注信息
  clearRemark = () => {
    let arr = this.state.dates;
    let num = this.state.currentIndex;
    arr[num].remark = '';
    this.props.form.resetFields();
    this.setState({ dates: arr });
  };

  render() {
    const { isLoading, dates, remarks, selectDate, currentIndex } = this.state;
    const { getFieldDecorator } = this.props.form;
    let imgs = this.createImgRow(selectDate);
    let record = this.createRecord(remarks);
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 9 },
    };
    return (
      <div className="travel-remark">
        <Spin spinning={isLoading}>
          <Row>
            <Col span={6}>
              <div className="remark-date-box">
                <div className="date-title">{this.$t('itinerary.remark.slide.date') /*日期*/}</div>
                <RadioGroup defaultValue={0}>
                  {dates.map((date, index) => {
                    let types = JSON.parse(date.itineraryType);
                    types = types ? types : [];
                    return (
                      <RadioButton
                        key={date.remarkDate}
                        checked={index == currentIndex}
                        onClick={() => this.getRemarks(date, index)}
                        className={types.length > 0 || date.remark ? 'date-item-on' : 'date-item'}
                        value={index}
                      >
                        {moment(date.remarkDate).format(
                          this.props.language.code === 'zh_cn' ? 'MM月DD日' : 'MMMM DD'
                        ) + `   D${index + 1}`}
                      </RadioButton>
                    );
                  })}
                </RadioGroup>
              </div>
            </Col>
            <Col span={17}>
              <div className="remark-record-box">
                {imgs}
                {record}
              </div>
              <div className="remark-textarea">
                <span>{this.$t('itinerary.remark.slide.supplementary.remarks') /*补充备注*/}</span>
                <Button className="btn-clear" onClick={this.clearRemark}>
                  {this.$t('itinerary.remark.slide.clear') /*清空*/}
                </Button>
              </div>
              <Form>
                <FormItem>
                  {getFieldDecorator(
                    'text-remark',
                    travelUtil.createFormOption('', { type: 'str', value: selectDate.remark }, true)
                  )(
                    <TextArea
                      className="remark-text-value"
                      onChange={this.changeRemark}
                      maxLength={201}
                    />
                  )}
                </FormItem>
              </Form>
            </Col>
          </Row>
        </Spin>
        <Affix className="travel-affix">
          <Button type="primary" loading={isLoading} onClick={this.toSubmit}>
            {this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
          </Button>
          <Button className="travel-type-btn" onClick={this.setClose}>
            {this.$t('itinerary.type.slide.and.modal.cancel.btn') /*取消*/}
          </Button>
        </Affix>
      </div>
    );
  }

  /**
   * 生成带有行程类型图标的行
   * @param selectDate 所选当前日期
   * @returns {XML}
   */
  createImgRow = selectDate => {
    let isEmpty = travelUtil.isEmpty(selectDate);
    if (isEmpty.isEmpty) {
      return;
    }
    let sle_types = [];
    sle_types = JSON.parse(selectDate.itineraryType) ? JSON.parse(selectDate.itineraryType) : [];
    let sle_dateStr = `${moment(selectDate.remarkDate).format(
      this.props.language.code === 'zh_cn' ? 'MM月DD日' : 'MMMM DD'
    )}  ${travelUtil.getWeed(new Date(selectDate.remarkDate).getDay())}`;
    return (
      <Row className="row-title">
        <Col span={7}>{sle_dateStr}</Col>
        {sle_types.map(item => {
          return (
            <Col key={item} span={2} className="col-img">
              <img src={travelUtil.setItineraryTypeImg(item)} />
            </Col>
          );
        })}
      </Row>
    );
  };

  /**
   * 生成备注记录信息
   * @param remarks
   * @returns {XML}
   */
  createRecord = remarks => {
    let divs = [];
    for (let rem in remarks) {
      remarks[rem].map((item, index) => {
        if (item.remark) {
          let div = (
            <div key={item.remark + index}>
              <Row className="row-city">
                <Col span={10} className="city-col">
                  <img src={travelUtil.setItineraryTypeImg(rem)} />
                  <span className="city-margin">
                    {item.fromCity ? item.fromCity : item.cityName}
                  </span>-
                  <span>{item.toCity}</span>
                </Col>
              </Row>
              <Row className="row-remark">
                <Col span={20}>{item.remark}</Col>
              </Row>
            </div>
          );
          divs.push(div);
        }
      });
    }
    return (
      <div>
        {divs.map(item => {
          return item;
        })}
      </div>
    );
  };
}

function mapStateToProps(state) {
  return { language: state.main.language };
}

const wrappedTravelRemark = Form.create()(TravelRemark);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelRemark);
