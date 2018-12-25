/**
 * Created by wangjiakun on 2018/3/22 0022.
 */
import React from 'react';
import {
  Row,
  Col,
  Collapse,
  Spin,
  Icon,
  Popconfirm,
  Button,
  DatePicker,
  InputNumber,
  Tooltip,
  message,
  Tag,
} from 'antd';
import moment from 'moment';
import { getApprovelHistory } from 'utils/extend';
import { messages } from 'utils/utils';
import travelService from 'containers/request/travel-request/travel.service';
import requestService from 'containers/request/request.service';
import customField from 'share/customField';
import baseService from 'share/base.service';
const Panel = Collapse.Panel;
const disabledImgZH = require('images/travel/disabled.png');
const disabledImgEN = require('images/travel/disabled-en.png');
const traffic_line = require('images/request/travel/traffic_line.png');

export default {
  /**
   * 根据所选供应商配置搜索接口
   * @param serviceName 供应商名字
   * @param category 行程类型
   * @returns {*}
   */
  getSearchType(serviceName, category) {
    switch (serviceName) {
      case 'supplyCtripService': //携程1
        switch (category) {
          case 2001:
            return 'ctrip_air';
          case 2002:
            return 'ctrip_train';
          case 2003:
            return 'ctrip_hotel';
          default:
            return 'standard';
        }
      case 'vendorCtripService': //携程2
        switch (category) {
          case 2001:
            return 'ctrip_air';
          case 2002:
            return 'ctrip_train';
          case 2003:
            return 'ctrip_hotel';
          default:
            return 'standard';
        }
      case 'supplyCtShoService': //中旅
        return 'ctsho_air';
      case 'supplyMeiYaService': //美亚
        switch (category) {
          case 2001:
            return 'meiya_air';
          case 2002:
            return 'ctrip_train';
          case 2003:
            return 'meiya_hotel';
          default:
            return 'standard';
        }
      case 'supplyMeiYaTrainService': //美亚
        switch (category) {
          case 2001:
            return 'meiya_air';
          case 2002:
            return 'ctrip_train';
          case 2003:
            return 'meiya_hotel';
          default:
            return 'standard';
        }
      case 'supplyBaoKuService': //宝库
        return 'baoku_air';
      case 'vendorBaoKuService': //宝库
        return 'baoku_air';
      default:
        return 'standard';
    }
  },

  /**
   *
   * @param args
   * @returns {{rules: *[], initialValue: null}}
   */
  createFormOption(...args) {
    let option = {
      rules: [
        {
          required: !args[2],
          message: !args[2]
            ? messages('itinerary.form.rule.isEmpty.tip', { formKey: args[0] })
            : messages('itinerary.form.rule.textArea.tip', {
                maxNum: args[1].maxNum ? args[1].maxNum : 200,
              }),
        },
      ],
    };

    if (args[1] && args[1].value && args[1].type) {
      switch (args[1].type) {
        case 'moment':
          option.initialValue = moment(args[1].value, args[1].format);
          break;
        default:
          if (args[1].type === 'str') {
            option.rules[0].max = args[1].maxNum ? args[1].maxNum : 200;
          }
          option.initialValue = args[1].value;
      }
    } else if (args[1] && args[1].type) {
      switch (args[1].type) {
        case 'str':
          option.rules[0].max = args[1].maxNum ? args[1].maxNum : 200;
          option.initialValue = '';
          break;
        case 'obj':
          option.initialValue = {};
          break;
        case 'number':
          option.initialValue = 0;
          break;
        case 'moment':
          option.initialValue = moment(new Date(), args[1].format);
          break;
      }
    }
    return option;
  },

  /**
   * 生成当前日期之后的某一天日期
   * @param afterDays 当前日期之后的天数 如当天为2018-03-22 afterDay值为3 返回的日期则为 2018-03-25
   * @returns {Date}
   */
  getDefaultDate(afterDays) {
    let date = new Date(); // it's today
    let oneDayTime = afterDays * 24 * 60 * 60 * 1000; // ms
    let newDate = new Date(date.getTime() + oneDayTime);
    return newDate;
  },

  /**
   * 生成某日期之后的某一天日期
   * @param afterDays 当前日期之后的天数
   * @param dateStr 日期字符串
   * @returns {Date}
   */
  getAfterDate(afterDays, dateStr, type) {
    let date = new Date(dateStr); // it's today
    let oneDayTime = afterDays * 24 * 60 * 60 * 1000; // ms
    let newDate = new Date(date.getTime() + oneDayTime);
    if (type === 'utc') {
      return moment(newDate)
        .utc()
        .format();
    }
    return moment(newDate).format('YYYY-MM-DD');
  },

  /**
   * 提供仓等数据
   * @param type
   * @returns {*}
   */
  getSeatClass(type) {
    let train = [
      '硬座',
      '软座',
      '特等座',
      '一等座',
      '二等座',
      '高级软包上',
      '高级软包下',
      '商务座',
      '硬卧',
      '软卧',
      '动卧',
      '高级软卧',
      '一等软座',
      '二等软座',
      '一人软包',
      '高级动卧',
    ];

    let train_en = [
      'Hard Seat',
      'Soft Seat',
      'Premier Class',
      'First Class',
      'Second Class',
      'Deluxe Sleeper(Up)',
      'Deluxe Sleeper(Down)',
      'Business Class',
      'Hard Sleeper',
      'Soft Sleeper',
      'MU Sleeper',
      'Deluxe Sleeper',
      '1st Soft Class',
      '2nd Soft Class',
      'Soft Coach',
      'MU Deluxe Sleeper',
    ];

    let plane = ['超级经济舱', '经济舱', '公务舱', '头等舱'];
    let plane_en = ['Super economy class', 'Economy class', 'Business class', 'First class'];
    switch (type) {
      case 'train':
        return train;
      case 'train':
        return train_en;
      case 'plane':
        return plane;
      case 'plane_en':
        return plane_en;
      default:
        return [];
    }
  },

  /**
   * 判断是否可用，不可用返回一个对象其属性isEmpty=false
   * @param obj  被判断的对象
   * @returns {*}
   */
  isEmpty(obj) {
    if (obj == undefined || obj == '' || obj == null) {
      return { isEmpty: true };
    } else {
      obj.isEmpty = false;
      return obj;
    }
  },

  /**
   * 生成行程记录折叠板；包含 其他、火车、机票行程
   * @param title 行程标题
   * @param datas 行程记录
   * @param click 进入编辑点击事件回调
   * @param dele  删除回调函数
   * @param start  起始时间，用来计算第几天的基准
   * @param update  更新回调，行程为往返类型时，删除单个操作实际动作是更新操作
   * @param stopAndStart  恢复和停用回调，原行程具有恢复和停用两种操作，而没有了编辑操作
   * @param isChangeVersion  是否是更改操作而来的单子
   * @returns {XML}
   */
  getTravelRecord(title, datas, click, dele, update, stopAndStart, start, isChangeVersion) {
    if (
      datas.length > 0 &&
      (title === messages('itinerary.other.collapse.title') /*其他*/ ||
      title === messages('itinerary.train.collapse.title') /*火车*/ ||
        title === messages('itinerary.plane.collapse.title')) /*机票*/
    ) {
      let titleImgUrl = this.setItineraryTypeImg(title);
      let isOther = title === messages('itinerary.other.collapse.title') /*其他*/;
      return (
        <Panel
          header={
            <span>
              <img style={{ marginTop: -4 }} src={titleImgUrl} />&nbsp;{title}
            </span>
          }
          className="type-plane"
        >
          {datas.map((res, index) => {
            // let date = moment(res.startDate).format('YYYY.MM.DD') + " " + moment(res.startDate).format('dddd');
            let date =
              moment(res.startDate).format('YYYY.MM.DD') +
              ' ' +
              this.getWeed(new Date(res.startDate).getDay());
            let day = this.calculateDate(start, res.startDate);
            let isGoBack = title !== messages('itinerary.train.collapse.title'); //是否具有往返行程类型，火车没有往返类型
            if (isGoBack) {
              isGoBack = res.itineraryType === 1002 ? true : false;
            }
            return (
              <div
                key={title + index}
                className="type-line-box"
                disabled={!res.loading}
                onClick={() => click(res, title)}
              >
                <Row>
                  <Col span={8}>
                    <Tag color="#108ee9">
                      {messages('itinerary.record.public.days.tag', { days: day }) /*第{day}天*/}
                    </Tag>
                    {date}
                  </Col>
                  <Col span={10} className="type-supply">
                    {res.approvalNum
                      ? messages('request.detail.travel.itinerary.number') /*行程单号*/ +
                        `:${res.approvalNum}`
                      : ''}
                  </Col>
                  <Col span={6} className="type-supply">
                    {res.supplierName && <img src={res.supplierIconUrl} />}
                    {res.supplierName}
                  </Col>
                </Row>
                {res.isExtend &&
                  res.disabled && (
                    <img
                      className="stop-img"
                      src={
                        messages('itinerary.record.public.disabled.img') === 'EN'
                          ? disabledImgEN
                          : disabledImgZH
                      }
                    />
                  )}
                {isChangeVersion && (
                  <Tag color={res.isExtend ? 'orange' : 'green'}>
                    {res.isExtend
                      ? messages('request.detail.travel.previous') /*原*/
                      : messages('request.detail.travel.latest') /*新*/}
                  </Tag>
                )}
                <Row>
                  <Col span={16} className="type-city-city">
                    <Row>
                      {isOther && <Col span={4}>{res.trafficTypeName}</Col>}
                      <Col span={6} style={{ textAlign: 'right', marginRight: 6 }}>
                        <span>{res.fromCity}</span>
                      </Col>
                      <Col span={4}>
                        <span>
                          <img style={{ width: '100%' }} src={traffic_line} />
                        </span>
                      </Col>
                      <Col span={9} style={{ marginLeft: 6 }}>
                        <span>{res.toCity}</span>
                      </Col>
                    </Row>
                  </Col>
                  <Col
                    span={8}
                    className={res.isExtend ? 'type-stop' : 'type-city-city type-img-delete'}
                  >
                    {res.isExtend ? (
                      <Button
                        size="small"
                        loading={res.loading}
                        type="primary"
                        onClick={e => stopAndStart(e, res, title, index)}
                      >
                        {res.disabled
                          ? messages('request.detail.btn.restart') /*重新启用*/
                          : messages('request.detail.btn.expire') /*停用*/}
                      </Button>
                    ) : isGoBack ? (
                      !res.loading ? (
                        <Popconfirm
                          title={
                            messages('itinerary.record.public.delete.tip') /*"该行程为往返行程"*/
                          }
                          onConfirm={() => dele(res, title, index)}
                          onCancel={() => update(res, title, index)}
                          okText={
                            messages('itinerary.record.public.delete.round') /*"删除往返行程"*/
                          }
                          cancelText={
                            messages('itinerary.record.public.delete.single') /*"仅删除该行程"*/
                          }
                        >
                          <Icon
                            type="close-circle"
                            onClick={e => {
                              e.stopPropagation();
                            }}
                          />
                        </Popconfirm>
                      ) : (
                        <Button shape="circle" loading />
                      )
                    ) : res.loading ? (
                      <Button shape="circle" loading />
                    ) : (
                      <Popconfirm
                        title={
                          messages('itinerary.record.public.delete.tip') /*"你确定删除这行内容吗?"*/
                        }
                        onConfirm={() => dele(res, title, index)}
                        okText={messages('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
                        cancelText={messages('itinerary.type.slide.and.modal.cancel.btn') /*取消*/}
                      >
                        <Icon
                          type="close-circle"
                          onClick={e => {
                            e.stopPropagation();
                          }}
                        />
                      </Popconfirm>
                    )}
                  </Col>
                </Row>
              </div>
            );
          })}
        </Panel>
      );
    }
  },

  //同上，仅包含备注行程，clear方法为清空备注
  getRemarkRecord(title, datas, click, dele, clear, start) {
    if (datas.length > 0 && title === messages('itinerary.remark.collapse.title')) {
      let isGo = false;
      datas.map(map => {
        if (map.remark || map.itineraryShowDetails.length > 0) isGo = true;
      });
      if (isGo) {
        let titleImgUrl = this.setItineraryTypeImg(title);
        return (
          <Panel
            header={
              <span>
                <img style={{ marginTop: -4 }} src={titleImgUrl} />&nbsp;{title}
              </span>
            }
            className="type-plane"
          >
            {datas.map((res, index) => {
              if (res.itineraryShowDetails.length > 0 || res.remark) {
                // let date = `${moment(res.remarkDate).format('MM.DD')} ${moment(res.remarkDate).format('dddd')}`;
                let date = `${moment(res.remarkDate).format('MM.DD')} ${this.getWeed(
                  new Date(res.remarkDate).getDay()
                )}`;
                let types = res.itineraryType ? JSON.parse(res.itineraryType) : [];
                let day = this.calculateDate(start, res.remarkDate);
                return (
                  <div
                    key={title + index}
                    className="type-line-box"
                    onClick={() => click(res, title)}
                  >
                    <Row className="remark-title">
                      <Col span={6}>
                        <Tag color="#108ee9">
                          {messages('itinerary.record.public.days.tag', {
                            days: day,
                          }) /*第{day}天*/}
                        </Tag>
                        {date}
                      </Col>
                      {types.map(item => {
                        let imgUrl = this.setItineraryTypeImg(item);
                        return (
                          <Col span={1} key={imgUrl}>
                            <img src={imgUrl} />
                          </Col>
                        );
                      })}
                    </Row>
                    {res.remark && (
                      <Row className="remark-item">
                        <Col span={16}>{res.remark}</Col>
                        <Col span={8} className="remark-clear">
                          {res.itineraryShowDetails.length > 0 ? (
                            res.loading ? (
                              <Button shape="circle" loading />
                            ) : (
                              <Popconfirm
                                title={
                                  messages(
                                    'itinerary.record.clear.remark.tip'
                                  ) /*"确定清空该行程备注吗"*/
                                }
                                onConfirm={() => clear(res, index)}
                                okText={messages('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
                                cancleText={
                                  messages('itinerary.type.slide.and.modal.cancel.btn') /*取消*/
                                }
                              >
                                <span
                                  onClick={e => {
                                    e.stopPropagation();
                                  }}
                                >
                                  {messages('itinerary.remark.slide.clear') /*清空*/}
                                </span>
                              </Popconfirm>
                            )
                          ) : res.loading ? (
                            <Button shape="circle" loading />
                          ) : (
                            <Popconfirm
                              title={
                                messages(
                                  'itinerary.record.public.delete.tip'
                                ) /*"你确定删除这行内容吗?"*/
                              }
                              onConfirm={() => dele(res, title, index)}
                              okText={messages('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
                              cancelText={
                                messages('itinerary.type.slide.and.modal.cancel.btn') /*取消*/
                              }
                            >
                              <Icon
                                type="close-circle"
                                onClick={e => {
                                  e.stopPropagation();
                                }}
                              />
                            </Popconfirm>
                          )}
                        </Col>
                      </Row>
                    )}
                    {res.itineraryShowDetails.map((detail, remarkIndex) => {
                      return (
                        <Row className="remark-item" key={title + index + remarkIndex}>
                          <Col span={6} className="item-font">
                            <img src={this.setItineraryTypeImg(detail.travelItineraryType)} />
                            <span style={{ marginLeft: 4 }}>{detail.fromCity}</span>
                            <span>{detail.toCity ? '-' + detail.toCity : ''}</span>
                          </Col>
                          <Col span={12}>{detail.remark}</Col>
                        </Row>
                      );
                    })}
                  </div>
                );
              }
            })}
          </Panel>
        );
      }
    }
  },

  //同上，仅包含酒店行程
  getHotelRecord(title, datas, click, dele, stopAndStart, start, isChangeVersion) {
    if (datas.length > 0 && title === messages('itinerary.hotel.collapse.title')) {
      let titleImgUrl = this.setItineraryTypeImg(title);
      return (
        <Panel
          header={
            <span>
              <img style={{ marginTop: -4 }} src={titleImgUrl} />&nbsp;{title}
            </span>
          }
          className="type-plane"
        >
          {datas.map((res, index) => {
            // let dateF = moment(res.fromDate).format('YYYY.MM.DD') + " " + moment(res.fromDate).format('dddd');
            let dateF =
              moment(res.fromDate).format('YYYY.MM.DD') + ' ' + moment(res.fromDate).format('dddd');
            let dateL =
              moment(res.leaveDate).format('YYYY.MM.DD') +
              ' ' +
              moment(res.leaveDate).format('dddd');
            // let dateL = moment(res.leaveDate).format('YYYY.MM.DD') + " " + moment(res.leaveDate).format('dddd');
            let startF = this.calculateDate(start, res.fromDate);
            let endL = this.calculateDate(start, res.leaveDate);
            // let night = endL - startF;// wjk 注释2018 0802， 酒店有浮动天数
            let night = this.calculateDate(res.fromDate, res.leaveDate) - 1;
            return (
              <div key={title + index} className="type-line-box" onClick={() => click(res, title)}>
                <Row>
                  <Col span={6}>
                    <Tag color="#108ee9">
                      {messages('itinerary.record.public.days.tag', {
                        days: startF,
                      }) /*第{startF}天*/}
                    </Tag>~
                    <Tag color="#108ee9">
                      {messages('itinerary.record.public.days.tag', { days: endL }) /*第{endL}天*/}
                    </Tag>
                  </Col>
                  <Col span={11}>{`${dateF}~${dateL}`}</Col>
                  <Col span={3}>{`${messages('itinerary.hotel.slide.night', {
                    nights: night,
                  })}`}</Col>
                  <Col span={3} className="type-supply">
                    {res.supplierName && <img src={res.supplierIconUrl} />}
                    {res.supplierName}
                  </Col>
                </Row>
                {res.isExtend &&
                  res.disabled && (
                    <img
                      className="stop-img"
                      src={
                        messages('itinerary.record.public.disabled.img') === 'EN'
                          ? disabledImgEN
                          : disabledImgZH
                      }
                    />
                  )}
                {isChangeVersion && (
                  <Tag color={res.isExtend ? 'orange' : 'green'}>
                    {res.isExtend
                      ? messages('request.detail.travel.previous') /*原*/
                      : messages('request.detail.travel.latest') /*新*/}
                  </Tag>
                )}
                <Row>
                  <Col span={12} className="type-city-city">
                    {messages('request.detail.travel.destination') /*目的地*/}：
                    {res.cityName && <span>{`${res.cityName}`}</span>}
                  </Col>
                  <Col
                    span={12}
                    className={res.isExtend ? 'type-stop' : 'type-city-city type-img-delete'}
                  >
                    {res.isExtend ? (
                      <Button
                        size="small"
                        type="primary"
                        loading={res.loading}
                        onClick={e => stopAndStart(e, res, title, index)}
                      >
                        {res.disabled
                          ? messages('request.detail.btn.restart') /*重新启用*/
                          : messages('request.detail.btn.expire') /*停用*/}
                      </Button>
                    ) : res.loading ? (
                      <Button shape="circle" loading />
                    ) : (
                      <Popconfirm
                        title={
                          messages('itinerary.record.public.delete.tip') /*"你确定删除这行内容吗?"*/
                        }
                        onConfirm={() => dele(res, title, index)}
                        okText={messages('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
                        cancelText={messages('itinerary.type.slide.and.modal.cancel.btn') /*取消*/}
                      >
                        <Icon
                          type="close-circle"
                          onClick={e => {
                            e.stopPropagation();
                          }}
                        />
                      </Popconfirm>
                    )}
                  </Col>
                </Row>
              </div>
            );
          })}
        </Panel>
      );
    }
  },

  /**
   * 限制日历的结束日期
   * @param current 当前日历日期
   * @param endDate 该日期之前的日期可选
   * @returns {*|boolean}
   */
  disabledDateStart(current, endDate) {
    let boo = false;
    let end = '';
    if (endDate) {
      end = this.getAfterDate(1, endDate, 'utc');
      if (current >= moment(end, 'YYYYMMDD hh:mm:ss')) boo = true;
    }
    return current && boo;
  },

  /**
   * 限制日历的开始日期
   * @param current 当前日历日期
   * @param startDate 该日期之后日期可选
   * @returns {*|boolean}
   */
  disabledDateEnd(current, startDate) {
    let boo = false;
    if (startDate && current < moment(startDate, 'YYYYMMDD hh:mm:ss')) boo = true;
    return current && boo;
  },

  /**
   * 限制日期选择范围
   * @param current datePiceker的日期
   * @param start 设置的起始日期
   * @param end  设置的终止日期
   * @param days  终止日期往后延长天数
   * @returns {*|boolean}
   */
  disabledDate(current, start, end, floatEnd, floatStart, dateArray) {
    let boo = false;
    end = this.getAfterDate(floatEnd, end, 'utc');
    if (floatStart) {
      start = this.getAfterDate(floatStart, start, 'utc');
    }
    if (current < moment(start, 'YYYYMMDD') || current >= moment(end, 'YYYYMMDD hh:mm:ss')) {
      boo = true;
    }
    if (dateArray && dateArray.length > 0) {
      dateArray.map(dateStr => {
        if (current && current.format('YYYY-MM-DD') === dateStr) {
          boo = true;
        }
      });
    }
    return current && boo;
  },

  /**
   * 差补行程记录折叠板
   * @param title 行程标题
   * @param datas 行程记录
   * @param click 进入编辑点击事件回调
   * @param dele  删除回调
   * @param displayDetail 展开明细回调
   * @param toBatchChange 批量更改回调
   * @param amountChange  金额变动监听回调
   * @param toSaveChange  批量或单项修改保存回调
   * @param toEditSubsidyItem  单项修改回调
   * @param searchByDate  根据日期查询差补明细回调
   * @param isHiddenItem  隐藏回调
   * @param isCancelHiddenItem  取消隐藏回调
   * @param subCtrlObj  页面控制量
   * @returns {XML}
   */
  getSubsidyRecord(
    title,
    datas,
    click,
    dele,
    displayDetail,
    toBatchChange,
    amountChange,
    toSaveChange,
    toEditSubsidyItem,
    searchByDate,
    isHiddenItem,
    isCancelHiddenItem,
    subCtrlObj
  ) {
    if (datas.length > 0) {
      let titleImgUrl = this.setItineraryTypeImg(title);
      return (
        <Panel
          header={
            <span>
              <img style={{ marginTop: -4 }} src={titleImgUrl} />&nbsp;{title}
            </span>
          }
          className="type-plane"
        >
          {datas.map((res, index) => {
            let startDate = moment(res.startDate).format('YYYY-MM-DD');
            let endDate = moment(res.endDate).format('YYYY-MM-DD');
            let isShowDatePicker = startDate != endDate;
            let total = res.baseCurrency + ' ' + res.totalBaseCurrencyAmount.toFixed(2) + '  ';
            let currentCodeMap = '';
            let codeNum = 0; //币种数；如果仅有一种币种且为本位币，则不显示后面的币种连加（currentMap）
            let codeStr = ''; //第一种币种
            for (let key in res.currencyCodeAmountMap) {
              currentCodeMap = currentCodeMap + key + res.currencyCodeAmountMap[key] + ' + ';
              codeNum++;
              if (codeNum === 1) {
                codeStr = key;
              }
            }
            currentCodeMap = currentCodeMap.substr(0, currentCodeMap.length - 2);
            if (codeNum === 1 && codeStr === res.baseCurrency) {
              currentCodeMap = '';
            }
            let remark = res.remark
              ? `${messages('itinerary.public.slide.remark') /*备注*/}：${res.remark}`
              : '';
            let requestDTOs = res.travelSubsidiesRequestItemDTOs;
            return (
              <div key={title + index} className="subsidy-record-css">
                <div className="subsidy-line-box" onClick={() => click(res, title)}>
                  <Row className="set-font">
                    {`${startDate}~${endDate}`}
                    <span style={{ marginLeft: 6, fontWeight: 'bold' }}>{res.cityName}</span>
                  </Row>
                  <Row>
                    <Col span={20}>
                      <span className="total">{total}</span>
                      <span className="currentMap">{currentCodeMap}</span>
                    </Col>
                    <Col span={4} className="type-img-delete">
                      {res.loading ? (
                        <Button shape="circle" loading />
                      ) : (
                        <Popconfirm
                          title={
                            messages(
                              'itinerary.record.public.delete.tip'
                            ) /*"你确定删除这行内容吗?"*/
                          }
                          onConfirm={() => dele(res, title, index)}
                          okText={messages('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
                          cancelText={
                            messages('itinerary.type.slide.and.modal.cancel.btn') /*取消*/
                          }
                        >
                          <Icon
                            type="close-circle"
                            onClick={e => {
                              e.stopPropagation();
                            }}
                          />
                        </Popconfirm>
                      )}
                    </Col>
                  </Row>
                  <Row className="set-font">{remark}</Row>
                </div>
                <div>
                  <Row>
                    <Col span={12}>
                      {!res.isBatch &&
                        isShowDatePicker && (
                          <DatePicker
                            disabledDate={c =>
                              this.disabledDate(c, moment(res.startDate), moment(res.endDate), 1)
                            }
                            onChange={e => searchByDate(e, index)}
                          />
                        )}
                    </Col>
                    <Col span={12} className="save-cancel">
                      {res.isBatch ? (
                        <div>
                          <Button onClick={() => toBatchChange(index)}>
                            {messages('itinerary.type.slide.and.modal.cancel.btn') /*取消*/}
                          </Button>
                          <Button
                            loading={subCtrlObj.isSaveChange}
                            onClick={() => toSaveChange(index)}
                          >
                            {messages('itinerary.type.slide.and.modal.save.btn') /*保存*/}
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => toBatchChange(index)}>
                          {messages('itinerary.record.subsidy.batch.change.btn') /*批量更改*/}
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
                {requestDTOs.map((req, reqIndex) => {
                  let displayItem = { index: index, reqIndex: reqIndex };
                  let currentCodeMapChiled = '';
                  let codeTypeCount = 0;
                  let firstCodeType = '';
                  let isShowCurrentCodeMapChiled = true;
                  for (let key in req.currencyCodeAmountMap) {
                    currentCodeMapChiled =
                      currentCodeMapChiled + key + req.currencyCodeAmountMap[key] + ' + ';
                    codeTypeCount++;
                    if (codeTypeCount === 1) {
                      firstCodeType = key;
                    }
                  }
                  if (codeTypeCount === 1 && firstCodeType === req.baseCurrencyCode) {
                    isShowCurrentCodeMapChiled = false;
                  }
                  currentCodeMapChiled = currentCodeMapChiled.substr(
                    0,
                    currentCodeMapChiled.length - 2
                  );
                  let totalChiled = req.baseCurrencyCode + ' ' + req.baseCurrencyAmount.toFixed(2);
                  let expenseTypeAmountMapChiled = '';
                  for (let key in req.expenseTypeAmountMap) {
                    expenseTypeAmountMapChiled =
                      expenseTypeAmountMapChiled +
                      key +
                      req.expenseTypeAmountMap[key].toFixed(2) +
                      ' + ';
                  }
                  expenseTypeAmountMapChiled = expenseTypeAmountMapChiled.substr(
                    0,
                    expenseTypeAmountMapChiled.length - 2
                  );
                  let detailMaps = req.travelSubsidiesItemMap; //travelSubsidiesRequestItemDTOs.travelSubsidiesItemMap
                  let relativeRepeat = req.duplicateSubsidiesOids ? req.duplicateSubsidiesOids : [];
                  return (
                    <div className="second-box" key={title + index + reqIndex}>
                      {req.status == 1002 && (
                        <div className="to-hiden">
                          <span>
                            {messages(
                              'itinerary.record.subsidy.hiddenAll.btn'
                            ) /*!隐藏该员工该行程下的所有差补，提交后将自动删除隐藏的差补*/}
                          </span>
                          <span onClick={() => isCancelHiddenItem(req, false)}>
                            {messages('itinerary.record.subsidy.cancel.hidden.btn') /*取消隐藏*/}
                            <img src={require('images/travel/subsidy-hide.png')} />
                          </span>
                        </div>
                      )}
                      <Row className="row-child">
                        <Col span={6}>
                          <img
                            className="user-icon"
                            src={
                              req.avatar ? req.avatar : require('images/travel/empty.avatar.jpg')
                            }
                          />
                          <span>{req.fullName}</span>
                        </Col>
                        <Col span={10}>
                          {isShowCurrentCodeMapChiled && (
                            <Tooltip title={currentCodeMapChiled} placement="top">
                              <Row className="child-map">{currentCodeMapChiled}</Row>
                            </Tooltip>
                          )}
                          <Row className="child-map">{totalChiled}</Row>
                          <Tooltip placement="top" title={expenseTypeAmountMapChiled}>
                            <Row className="child-map">{expenseTypeAmountMapChiled}</Row>
                          </Tooltip>
                        </Col>
                        <Col span={4} className="display-icon">
                          <Icon
                            type={req.isDisplay ? 'down-circle-o' : 'right-circle-o'}
                            onClick={() => displayDetail(index, reqIndex)}
                          />
                        </Col>
                        <Col span={4} className="display-icon">
                          {!res.isBatch && (
                            <img
                              onClick={() => isHiddenItem(req, false)}
                              src={require('images/travel/subsidy-show.png')}
                            />
                          )}
                        </Col>
                      </Row>
                      {req.isDisplay &&
                        detailMaps.map((det, detIndex) => {
                          /* TODO 需要一个控制显示的量 */
                          return det.travelSubsidiesRequestItemDetailDTOs.map((detail, indexOf) => {
                            let date = moment(detail.subsidiesDate).format('MM-DD');
                            let rateMount =
                              messages('request.detail.travel.enterprise.rate') /*企业汇率*/ + ': ';
                            let isRepeat = false;
                            relativeRepeat.map(repeat => {
                              //检验是否重复
                              if (detail.travelSubsidiesDetailsOid == repeat) {
                                isRepeat = true;
                              }
                            });
                            let calculateChar = ' + ';
                            if (detail.currencyRate - detail.baseCurrencyRate < 0) {
                              calculateChar = ' - ';
                            }
                            let tempRate =
                              (Math.abs(detail.currencyRate - detail.baseCurrencyRate) /
                                detail.baseCurrencyRate) *
                              100;
                            rateMount =
                              rateMount +
                              detail.baseCurrencyRate.toFixed(4) +
                              calculateChar +
                              tempRate.toFixed(1) +
                              `% , ${
                                messages('request.detail.travel.original.amount') /*原金额*/
                              }: ` +
                              detail.baseAmount.toFixed(2);
                            return (
                              <div
                                className="subsidy-detail"
                                key={detail.travelSubsidiesDetailsOid}
                              >
                                {detail.status == 1002 && (
                                  <div className="to-hiden">
                                    <span>
                                      {messages(
                                        'itinerary.record.subsidy.hiddenSingle.btn'
                                      ) /*!隐藏的差补在提交后将自动删除*/}
                                    </span>
                                    <span
                                      onClick={() => isCancelHiddenItem(detail, true, displayItem)}
                                    >
                                      {messages(
                                        'itinerary.record.subsidy.cancel.hidden.btn'
                                      ) /*取消隐藏*/}
                                      <img src={require('images/travel/subsidy-hide.png')} />
                                    </span>
                                  </div>
                                )}
                                <Spin spinning={subCtrlObj.isSaveChange}>
                                  <Row>
                                    <Col span={3}>{date}</Col>
                                    <Col span={10} className="child-map-detail">
                                      {isRepeat && (
                                        <Tag color="#f50">
                                          {messages('request.detail.travel.repeat') /*重复*/}
                                        </Tag>
                                      )}
                                      {detail.expenseTypeName}
                                    </Col>
                                    <Col span={2} className="text-center">
                                      {detail.currencyRate.toFixed(4)}
                                    </Col>
                                    <Col span={2} className="text-center">
                                      {detail.currencyCode}
                                    </Col>
                                    {res.isBatch ? (
                                      <Col span={5}>
                                        {subCtrlObj.isCanMore ? (
                                          <InputNumber
                                            onChange={e =>
                                              amountChange(index, reqIndex, detIndex, indexOf, e)
                                            }
                                            min={0}
                                            defaultValue={detail.amount}
                                          />
                                        ) : (
                                          <InputNumber
                                            min={0}
                                            onChange={e =>
                                              amountChange(index, reqIndex, detIndex, indexOf, e)
                                            }
                                            max={detail.baseAmount}
                                            defaultValue={detail.amount}
                                          />
                                        )}
                                      </Col>
                                    ) : (
                                      <Col span={2} className="text-center">
                                        {detail.amount.toFixed(2)}
                                      </Col>
                                    )}
                                    {!res.isBatch && (
                                      <Col span={2} className="display-icon-eye-edit text-center">
                                        <img
                                          className="img-edit"
                                          onClick={() =>
                                            toEditSubsidyItem(detail, res.cityName, displayItem)
                                          }
                                          src={require('images/travel/subsidy-edit.png')}
                                        />
                                      </Col>
                                    )}
                                    {!res.isBatch && (
                                      <Col span={3} className="display-icon-eye-edit text-center">
                                        <img
                                          className="img-eye"
                                          onClick={() => isHiddenItem(detail, true, displayItem)}
                                          src={require('images/travel/subsidy-show.png')}
                                        />
                                      </Col>
                                    )}
                                  </Row>
                                  <Row style={{ marginTop: 6 }}>
                                    <Col span={3} />
                                    <Col span={19}>{rateMount}</Col>
                                  </Row>
                                  {detail.comment && (
                                    <Row style={{ marginTop: 6 }}>
                                      <Col span={3} />
                                      <Col span={19} style={{ wordBreak: 'break-all' }}>
                                        {messages('itinerary.public.slide.remark') /*备注*/ +
                                          '：' +
                                          detail.comment}
                                      </Col>
                                    </Row>
                                  )}
                                </Spin>
                              </div>
                            );
                          });
                        })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Panel>
      );
    }
  },

  /**
   * 设置行程类型的图标路径
   * @param typeNum 行程类号码
   * @returns {*}
   */
  setItineraryTypeImg(typeNum) {
    let imgUrl = null;
    switch (typeNum) {
      case 'FLIGHT':
        imgUrl = require('images/travel/icon-plane.png');
        break;
      case 'TRAIN':
        imgUrl = require('images/travel/icon-train.png');
        break;
      case 'HOTEL':
        imgUrl = require('images/travel/hotel.png');
        break;
      case 'OTHER':
        imgUrl = require('images/travel/icon-other.png');
        break;
      case 'SUBSIDY':
        imgUrl = require('images/travel/subsidy.png');
        break;
      default:
        break;
    }
    if (imgUrl) {
      return imgUrl;
    }
    switch (typeNum) {
      case 1001:
        imgUrl = require('images/travel/icon-plane.png');
        break;
      case 1002:
        imgUrl = require('images/travel/icon-train.png');
        break;
      case 1003:
        imgUrl = require('images/travel/hotel.png');
        break;
      case 1004:
        imgUrl = require('images/travel/icon-other.png');
        break;
      case 1006:
        imgUrl = require('images/travel/subsidy.png');
        break;
      default:
        break;
    }
    switch (typeNum) {
      case '酒店':
        imgUrl = require('images/request/travel/hotel.png');
        break;
      case 'Hotel':
        imgUrl = require('images/request/travel/hotel.png');
        break;
      case '机票':
        imgUrl = require('images/request/travel/plane.png');
        break;
      case 'Ticket':
        imgUrl = require('images/request/travel/plane.png');
        break;
      case '火车':
        imgUrl = require('images/request/travel/train.png');
        break;
      case 'Train':
        imgUrl = require('images/request/travel/train.png');
        break;
      case '差补':
        imgUrl = require('images/request/travel/subsidy.png');
        break;
      case 'Subsidy':
        imgUrl = require('images/request/travel/subsidy.png');
        break;
      case '其他':
        imgUrl = require('images/request/travel/other.png');
        break;
      case 'Other traffic':
        imgUrl = require('images/request/travel/other.png');
        break;
      case '备注':
        imgUrl = require('images/request/travel/remark.png');
        break;
      case 'Itinerary remark':
        imgUrl = require('images/request/travel/remark.png');
        break;
      default:
        break;
    }
    return imgUrl;
  },

  /**
   * 根据messageKey获取对应的值
   * @param values custFormValues数组
   * @param messageKey 每个项中的messageKey
   * @returns {*}
   */
  getFormHeadValue(values, messageKey) {
    let value = false;
    let itemValue = false;
    values.map(item => {
      if (item.messageKey === messageKey) {
        value = item.value;
        itemValue = item;
      }
    });
    switch (messageKey) {
      case 'start_date':
        return value;
      case 'end_date':
        return value;
      case 'select_participant': //参与人
        return value ? JSON.parse(value) : [];
      case 'out_participant_num': //外部参与人数量
        return value ? JSON.parse(value) : 0;
      case 'applicant': //申请人
        return itemValue;
      case 'select_cost_center': //成本中心
        return itemValue;
      case 'exp_allocate': //费用分摊
        return value ? JSON.parse(value ? value : '[]') : [];
      case 'select_department': //部门
        return value;
      default:
        return value;
    }
  },

  /**
   * 设置表单中的一些字段值不可编辑（该操作目前只存在已通过差旅申请单点击更改操作回到编辑状态的单子）
   * @param values 表单详情（目前确定部门，成本中心，参与人和申请人）
   * @returns {*}
   */
  setDisabledValues(values) {
    values.map(item => {
      switch (item.messageKey) {
        case 'select_participant':
          item.isReadOnly = true;
          break;
        case 'select_cost_center':
          item.fieldConstraint = JSON.stringify({ valueReadonly: true });
          break;
        case 'applicant':
          item.isReadOnly = true;
          break;
        case 'select_department':
          item.fieldConstraint = JSON.stringify({ valueReadonly: true });
          break;
        case 'out_participant_num':
          item.isReadOnly = true;
          break;
      }
    });
    return values;
  },

  /**
   * 根据某天计算该天之后的n天日期
   * @param baseDate 参照日期
   * @param relativeDate 相对参照日期之后的天数 整数且大于0
   * @returns {number}
   */
  calculateDate(baseDate, relativeDate) {
    let days = 0;
    if (baseDate && relativeDate) {
      let base = moment(baseDate).format('YYYY-MM-DD');
      let relative = moment(relativeDate).format('YYYY-MM-DD');
      let newBase = new Date(base);
      let newRelative = new Date(relative);
      let newBaseTime = newBase.getTime();
      let newRelativeTime = newRelative.getTime();
      if (newRelativeTime > newBaseTime) {
        days = (newRelativeTime - newBaseTime) / (24 * 60 * 60 * 1000);
      }
    }
    return days + 1;
  },

  /**
   *根据申请人变动设置默认值
   * @param status       当前单子状态 eidt 编辑，create 新建
   * @param custValues   表单配置项数据
   * @param newValue     新申请人信息
   * @param formOid      表单Oid
   * @param base         原申请人信息
   * @param executeCall  回调函数
   * @param isReplace  是否替换参与人
   */
  setDefaultFormUtil(status, custValues, newValue, formOid, base, executeCall, isReplace) {
    let budgetDetailKey = false;
    let count = 0;
    let currentUpdate = []; //现在需要更新的默认值 [{formkey:value},...]格式
    custValues.map(item => {
      if (item.messageKey === 'budget_detail' && item.value) {
        budgetDetailKey = status === 'edit' ? item.formValueOid : item.fieldOid;
      }
    });
    baseService
      .changeLoginInfo(newValue.value)
      .then(() => {
        requestService.getFormValue(newValue.value, formOid).then(res => {
          if (res.data && res.data.length > 0) {
            res.data.map(item => {
              custValues.map(field => {
                if (field.fieldOid === item.fieldOid && field.value !== item.value) {
                  let key = status === 'edit' ? field.formValueOid : field.fieldOid;
                  let setUpdateItem = {};
                  setUpdateItem[key] = customField.getDefaultValue(field, item);
                  if (setUpdateItem[key]) currentUpdate.push(setUpdateItem);
                }
              });
            });
            count++;
            if (count === 2) {
              executeCall(currentUpdate, budgetDetailKey);
            }
          }
        });
      })
      .catch(() => {
        message.error(messages('login.error')); //呼，服务器出了点问题，请联系管理员或稍后再试:(
      });
    if (isReplace) {
      travelService.getPrincipals(formOid).then(res => {
        let tempReuqestPeople = ''; //新申请人临时变量
        let newJoinPeople = []; //参与人
        let isNewValueHave = false; //是否新的申请人也在参与人之内
        let key = ''; //表单设置值的标志
        let updateItem = {};
        res.data.map(item => {
          if (newValue.value === item.userOid) {
            tempReuqestPeople = item;
          }
        });
        custValues.map(field => {
          if (field.messageKey === 'select_participant') {
            //参与人员
            key = status === 'edit' ? field.formValueOid : field.fieldOid;
            JSON.parse(field.value || '[]').map(v => {
              //遍历参与人员
              if (v.userOid !== base.value) {
                //参与人员的oid是否不等于原申请人oid
                newJoinPeople.push({ userOid: v.userOid, fullName: v.fullName });
              }
              if (v.userOid === newValue.value) {
                //是否新的申请人也在参与人之内
                isNewValueHave = true; //新的申请人也在参与人之内
              }
            });
          }
        });
        if (!isNewValueHave) {
          //新的申请人不在参与人之内，新的申请人要替换掉原来参与人中与原申请人相同的人
          newJoinPeople.push({
            userOid: tempReuqestPeople.userOid,
            fullName: tempReuqestPeople.fullName,
          });
        }
        if (newJoinPeople.length > 0) {
          updateItem[key] = newJoinPeople;
          currentUpdate.push(updateItem);
        }
        count++;
        if (count === 2) {
          executeCall(currentUpdate, budgetDetailKey);
        }
      });
    } else {
      count++;
    }
  },

  /**
   * 设置被修改字段的值的结构（用来设置表单的显示值）
   * @param field 被修改的值
   * @returns {*}
   */
  changeValueUtil(field) {
    let values = [];
    switch (field.messageKey) {
      case 'select_participant': //参与人
        JSON.parse(field.value || '[]').map(item => {
          values.push({ userOid: item.userOid, fullName: item.fullName });
        });
        return values;
      case 'start_date': //开始日期
        return field.value ? moment(field.value) : undefined;
      case 'end_date': //结束日期
        return field.value ? moment(field.value) : undefined;
      case 'applicant': //申请人 ps：这个有些奇怪，可能是key值的影响
        return { label: field.showValue, key: field.value };
      default:
        return undefined;
    }
  },

  /**
   *分摊数据行校验
   * @param value
   * @returns {{isRepeat: boolean, reason: string}}
   */
  allocateColumnIsRepeat(value) {
    let result = {
      isRepeat: false,
      reason: '',
    };
    for (let i = 0; i < value.length - 1; i++) {
      for (let j = i + 1; j < value.length; j++) {
        if (value[i].hashStr === value[j].hashStr) {
          result.isRepeat = true;
          result.reason = messages('itinerary.form.component.allocation.rowSame.tip', {
            x: i + 1,
            y: j + 1,
          }) /*`第${i+1}行与第${j+1}行分摊元素相同`*/;
          return result;
        }
      }
    }
    return result;
  },

  /**
   *分摊数据列校验，规则：
   * 1.分摊比例列除第一行外必须大于0
   * 2.每行中至少有一个列有值
   * 3.每行中必填列必须有值
   * @param value 分摊信息
   * @returns {boolean}
   */
  allocateColumnIsEmpty(value) {
    let returnItem = {
      isCanAdd: false, //是否可添加新分摊
      reason: '', //不可添加的原因
    };
    for (let i = 1; i < value.length; i++) {
      let have = 0;
      let columnName = '';
      value[i].costCenterItems.map(item => {
        if (item.name) {
          have++;
        } else if (item.required) {
          columnName = columnName + item.fieldName + '、';
        }
      });
      if (have) {
        // 添加了
        if (columnName) {
          //存在必填却未添加的列
          columnName = columnName.substr(0, columnName.length - 1);
          returnItem.reason = messages('itinerary.form.component.allocation.column.tip', {
            y: columnName,
          }) /*`${columnName}列必填`*/;
          return returnItem;
        }
      } else {
        returnItem.reason = messages('itinerary.form.component.allocation.rowInfo.tip', {
          x: i + 1,
        }) /*`第${i+1}行分摊信息不完整`*/;
        return returnItem;
      }
      if (value[i].scale === 0) {
        if (i !== 0) {
          returnItem.reason = messages('itinerary.form.component.allocation.row.tip', {
            x: i + 1,
          }) /*`第${i+1}行分摊比例应大于0`*/;
          return returnItem;
        } else {
          returnItem.reason = messages(
            'itinerary.form.component.allocation.noEnough.tip'
          ) /*`已无分摊比例`*/;
          return returnItem;
        }
      }
    }
    returnItem.isCanAdd = true;
    return returnItem;
  },

  /**
   *校验分摊数据是否需要重新排序
   * （表单配置项部门成本中心出现的顺序影响已有分摊信息的列的顺序）
   * @param value         分摊数据
   * @param defaultItem   需要设置的默认行数据
   * @returns {{canReplace: boolean, isSort: boolean}}
   */
  allocateColumnIsSort(value, defaultItem) {
    let isSort = {
      canReplace: false,
      isSort: false,
    };
    value[0].costCenterItems.map((item, of) => {
      if (item.fieldName === defaultItem.costCenterItems[of].fieldName) {
        //顺序是否与初始化后的列顺序相同
        if (item.name !== defaultItem.costCenterItems[of].name) {
          isSort.canReplace = true;
        }
      } else {
        isSort.isSort = true;
      }
    });
    return isSort;
  },

  /**
   *对分摊数据进行排序
   * @param value 分摊数据
   * @param defaultItem 需要设置的默认数据行（默认数据行与上次保存数据顺序不一致）
   * @returns {*}
   */
  allocateColumnSort(value, defaultItem) {
    let isSort = {
      canReplace: false,
      isSort: false,
    };
    for (let i = 0; i < value[0].costCenterItems.length; i++) {
      let tempName = value[0].costCenterItems[i].fieldName;
      for (let j = 0; j < defaultItem.costCenterItems.length; j++) {
        if (tempName === defaultItem.costCenterItems[j].fieldName) {
          if (i === j) {
            break;
          } else {
            let tempItem = defaultItem.costCenterItems[i];
            defaultItem.costCenterItems[i] = defaultItem.costCenterItems[j];
            defaultItem.costCenterItems[j] = tempItem;
            break;
          }
        }
      }
    }
    return defaultItem;
  },

  /**
   *表单保存或者提交时分摊信息的校验
   * @param values  表单配置项数据
   * @returns {boolean}
   */
  customFormChecked(values) {
    let canSubmit = true; //是否可以提交
    let allocate = this.getFormHeadValue(values, 'exp_allocate');
    if (!allocate) {
      return canSubmit;
    }
    let isEmpty = this.allocateColumnIsEmpty(allocate); //是否有空行
    if (!isEmpty.isCanAdd) {
      canSubmit = false;
      message.error(isEmpty.reason);
      return canSubmit;
    }
    let isRepeat = this.allocateColumnIsRepeat(allocate); //是否有重复列
    if (isRepeat.isRepeat) {
      canSubmit = false;
      message.error(isRepeat.reason);
      return canSubmit;
    }
    return canSubmit;
  },

  /**
   *根据已添加酒店行程生成已添加酒店的日期
   * @param hotelArray 酒店行程数据
   * @returns {Array}  格式：['2018-09-23','2018-09-24'...]
   */
  hotelDateArray(hotelArray) {
    let dates = [];
    hotelArray.map(item => {
      let length = this.calculateDate(item.fromDate, item.leaveDate);
      for (let i = 0; i < length - 1; i++) {
        dates.push(this.getAfterDate(i, item.fromDate));
      }
    });
    return dates;
  },

  /**
   *校验新添加酒店日期段内日期是否与已添加的酒店日期重复
   * @param value 新添酒店行程数据
   * @param dateArray 已添加酒店日期数据
   * @returns {{isRepeat: boolean, dateStr: string}}
   */
  hotelIsRepeatDate(value, dateArray) {
    let isRepeat = {
      isRepeat: false,
      dateStr: '',
    };
    let dates = this.hotelDateArray([value]);
    dates.map((date, index) => {
      dateArray.map(item => {
        if (item === date) {
          isRepeat.isRepeat = true;
          isRepeat.dateStr = date;
          return isRepeat;
        }
      });
    });
    return isRepeat;
  },

  //获取星期几
  getWeed(value) {
    switch (value) {
      case 0:
        return messages('request.detail.booker.sun');
      case 1:
        return messages('request.detail.booker.mon');
      case 2:
        return messages('request.detail.booker.tues');
      case 3:
        return messages('request.detail.booker.wed');
      case 4:
        return messages('request.detail.booker.thur');
      case 5:
        return messages('request.detail.booker.fri');
      case 6:
        return messages('request.detail.booker.sat');
    }
  },

  /**
   * 根据类型返回需要的对应的行程配置默认数据
   * @param type  行程类型
   * @returns {*}
   */
  getSetDataByTravelType(type) {
    let data = {
      train: {
        fromCity: {
          enable: true,
          show: true,
          required: true,
          control: true,
        },
        toCity: {
          enable: true,
          show: true,
          required: true,
          control: true,
        },
        ticketPrice: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
        seatClass: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
      },
      flight: {
        fromCities: {
          enable: false,
          show: true,
          required: true,
          control: true,
        },
        toCities: {
          enable: false,
          show: true,
          required: true,
          control: true,
        },
        discount: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
        ticketPrice: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
        seatClass: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
        takeOffBeginTime: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
        takeOffEndTime: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
        arrivalBeginTime: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
        arrivalEndTime: {
          enable: false,
          show: false,
          required: false,
          control: false,
        },
      },
      hotel: {
        city: {
          enable: false,
          show: true,
          required: true,
          control: false,
        },
        maxPrice: {
          enable: false,
          show: false,
          required: false,
          control: true,
        },
        minPrice: {
          enable: false,
          show: false,
          required: false,
          control: true,
        },
        fromDate: {
          enable: true,
          floatDays: 1,
          show: true,
          required: true,
          control: true,
        },
        leaveDate: {
          enable: true,
          floatDays: 1,
          show: true,
          required: true,
          control: true,
        },
        roomNumber: {
          enable: true,
          show: true,
          required: true,
          control: true,
        },
      },
    };
    switch (type) {
      case 'train':
        return data.train;
      case 'flight':
        return data.flight;
      case 'hotel':
        return data.hotel;
    }
  },

  //获取开始时间-结束时间的日期数组
  getDays(day1, day2) {
    // 获取入参字符串形式日期的Date型日期
    let strArr = day1.split('-');
    let d1 = new Date(strArr[0], strArr[1] - 1, strArr[2]);
    let strArr2 = day2.split('-');
    let d2 = new Date(strArr2[0], strArr2[1] - 1, strArr2[2]);
    // 定义一天的毫秒数
    let dayMilliSeconds = 1000 * 60 * 60 * 24;
    // 获取输入日期的毫秒数
    let d1Ms = d1.getTime();
    let d2Ms = d2.getTime();
    // 定义返回值
    let ret = [];
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
      }
    }
    return ret;
    // alert(ret); // 或可换为return ret;
  },

  isObj(o) {
    //是否对象
    return Object.prototype.toString.call(o).slice(8, -1) === 'Object';
  },
};
