import PropTypes from 'prop-types';
import React from 'react'
import { connect } from 'dva'
import moment from 'moment'
import trafficLineImg from 'images/request/travel/traffic_line.png'
import emptyAvatarImg from 'images/request/travel/empty.avatar.jpg'
import planeImg from 'images/request/travel/plane.png'
import trainImg from 'images/request/travel/train.png'
import hotelImg from 'images/request/travel/hotel.png'
import otherImg from 'images/request/travel/other.png'
import remarkImg from 'images/request/travel/remark.png'
import subsidyImg from 'images/request/travel/subsidy.png'
import disabledImg from 'images/request/travel/disabled.png'
import disabledEnImg from 'images/request/travel/disabled-en.png'
import { Form, Collapse, Tag, Spin, Row, Col, Tooltip, Icon } from 'antd'
const Panel = Collapse.Panel;

import requestService from 'containers/request/request.service'
import 'styles/request/travel-request/travel-information.scss'

class TravelInformation extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      itinerary: [], //行程
      subsidyVersion: 2, //差补版本（第二版、第三版）
    }
  }

  componentDidMount() {
    this.getSubsidyVersion()
  }

  getItinerary = () => {
    //FLIGHT(机票)、TRAIN(火车)、SUBSIDIES(差补)、REMARK(行程备注)、OTHER(其他交通)、HOTEL(酒店)
    const { applicationOID, latestApplicationOID } = this.props;
    requestService[latestApplicationOID ? 'getLastItineraryByApplicationOID' : 'getItineraryByApplicationOID'](applicationOID, latestApplicationOID).then(res => {
      if (this.state.subsidyVersion === 2) {
        const info = this.props.info;
        res.data.SUBSIDIES = JSON.parse((info.travelApplication && info.travelApplication.travelSubsidies) || '[]');
      }
      let itinerary = {};
      Object.keys(res.data).map(key => {
        if (key !== 'REMARK') {
          itinerary[key] = res.data[key]
        }
      });
      res.data['REMARK'] && (itinerary['REMARK'] = res.data['REMARK']);
      this.setState({
        loading: false,
        itinerary
      })
    })
  };

  //获取差补的版本
  getSubsidyVersion = () => {
    this.setState({ loading: true });
    this.setState({ subsidyVersion: (this.props.info.travelApplication && this.props.info.travelApplication.travelSubsidies) ? 2 : 3 },() => {
      this.getItinerary()
    })
  };

  //获取星期几
  getWeed = (value) => {
    switch(value) {
      case 0:
        return this.$t('request.detail.booker.sun');
      case 1:
        return this.$t('request.detail.booker.mon');
      case 2:
        return this.$t('request.detail.booker.tues');
      case 3:
        return this.$t('request.detail.booker.wed');
      case 4:
        return this.$t('request.detail.booker.thur');
      case 5:
        return this.$t('request.detail.booker.fri');
      case 6:
        return this.$t('request.detail.booker.sat');
    }
  };

  //获取天数差
  getDifferDays = (sDate, eDate) => {
    sDate = new Date(new Date(sDate).format('yyyy-MM-dd'));
    eDate = new Date(new Date(eDate).format('yyyy-MM-dd'));
    return Math.abs(Math.floor((eDate - sDate)/1000/60/60/24)) + 1
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString
  };

  //展示差补详情列表
  handleSubsidyItemShow = (travelSubsidiesRequestOID, itemIndex, showItem) => {
    let itinerary = this.state.itinerary;
    itinerary['SUBSIDIES'].map(item => {
      if (item.travelSubsidiesRequestOID === travelSubsidiesRequestOID) {
        item.travelSubsidiesRequestItemDTOs[itemIndex].showItem = showItem
      }
    });
    this.setState({ itinerary })
  };

  renderItineraryItem = (key, item) => {
    const { customFormPropertyMap, controlFields, info, isPreVersion, language } = this.props;
    const { subsidyVersion } = this.state;
    let header = '';
    let itemContent = null;
    let sDate = info.travelApplication.startDate;
    switch(key) {
      case 'FLIGHT':
        header = (
          <Row className="itinerary-header">
            <Col span={5}><img src={planeImg}/>{this.$t('request.detail.travel.flight')/*机票*/}</Col>
            {info.travelApplication && info.travelApplication.uniformBooking && info.travelApplication.bookingClerkName && (
              <Col span={10}>{this.$t('request.detail.travel.booker.ticket.by', {name: info.travelApplication.bookingClerkName})/*由 {name} 统一订机票*/}</Col>
            )}
          </Row>
        );
        if (item) {
          let details = [];
          let time = '';
          if (customFormPropertyMap['ca.travel.applypolicy.enable'] === 'false' || !customFormPropertyMap['ca.travel.applypolicy.enable']) {
            controlFields.discount.show && details.push(item.discount ?
              `${item.discount}${this.$t('request.detail.travel.discount')/*折*/}` :
              this.$t('request.detail.travel.all.discount'/*所有折扣*/));
            controlFields.seatClass.show && details.push(item.seatClass ? item.seatClass : this.$t('request.detail.travel.all.class'/*所有舱位*/));
          }
          controlFields.ticketPrice.show && details.push(item.ticketPrice ?
            `${this.props.company.baseCurrency} ${this.renderMoney(item.ticketPrice)}` :
            this.$t('request.detail.travel.no.limit'/*不限制*/));
          if (controlFields.takeOffBeginTime.show && controlFields.takeOffEndTime.show) {
            time = `${this.$t('request.detail.booker.departure.time')/*起飞时间*/}：
            ${item.takeOffBeginTime ? 
              `${item.takeOffBeginTime} ～ ${item.takeOffEndTime || this.$t('request.detail.travel.no.restriction'/*无限制*/)}` : 
              this.$t('request.detail.travel.all.time'/*全部时间段*/)}`;
          }
          itemContent = (
            <div className="flight">
              {(info.version > 0 || isPreVersion) && item.disabled && (
                <img src={language.code === 'zh_CN' ? disabledImg : disabledEnImg} className="disabled-img"/>
              )}
              <div>
                {(info.version > 0 || isPreVersion) && (
                  <Tag color={item.isExtend ? '#f5832b' : '#4cc648'}>
                    {item.isExtend ? this.$t('request.detail.travel.previous'/*原*/) : this.$t('request.detail.travel.latest'/*新*/)}
                  </Tag>
                )}
                <Tag color="#1890ff">{this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate, item.startDate)})/*第 {day} 天*/}</Tag>
                <span className="date">{new Date(item.startDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.startDate).getDay())}</span>
                {item.supplierName && <div className="supplier"><span>{item.supplierName}</span> <img src={item.supplierIconUrl}/></div>}
              </div>
              <Row className="location">
                <Col span={10}>
                  <span className="from">{item.fromCity}</span>
                  <img src={trafficLineImg}/>
                  <span className="to">{item.toCity}</span>
                </Col>
                {item.approvalNum && <Col span={10}>{this.$t('request.detail.travel.itinerary.number')/*行程单号*/}：{item.approvalNum}</Col>}
              </Row>
              {(item.supplierServiceName === 'vendorCtripService' || item.supplierServiceName === 'supplyCtripService') && (//只有在携程机票下才有可能显示
                <Row>
                  <Col span={10}>
                    {details.map((detail, index) => {
                      if (index !== details.length - 1) {
                        return <span key={index}>{detail}<span className="ant-divider"/></span>
                      } else {
                        return detail
                      }
                    })}
                  </Col>
                  <Col span={10}>{time}</Col>
                </Row>
              )}
              {item.remark && <div className="remark">{this.$t('common.remark')}：{item.remark}</div>}
            </div>
          )
        }
        break;
      case 'TRAIN':
        header = (
          <Row className="itinerary-header">
            <Col span={5}><img src={trainImg}/>{this.$t('request.detail.travel.train')/*火车*/}</Col>
            {info.travelApplication && info.travelApplication.trainUniformBooking && info.travelApplication.trainBookingClerkName && (
              <Col span={10}>{this.$t('request.detail.travel.booker.train.by', {name: info.travelApplication.trainBookingClerkName})/*由 {name} 统一订火车票*/}</Col>
            )}
          </Row>
        );
        if (item) {
          let details = [];
          controlFields.seatClass.show && details.push(item.seatClass ? item.seatClass : this.$t('request.detail.travel.no.limit'/*不限制*/));
          controlFields.ticketPrice.show && details.push(item.ticketPrice ? `${this.props.company.baseCurrency} ${this.renderMoney(item.ticketPrice)}` :
            this.$t('request.detail.travel.no.limit'/*不限制*/));
          itemContent = (
            <div className="train">
              {(info.version > 0 || isPreVersion) && item.disabled && (
                <img src={language.code === 'zh_cn' ? disabledImg : disabledEnImg} className="disabled-img"/>
              )}
              <div>
                {(info.version > 0 || isPreVersion) && (
                  <Tag color={item.isExtend ? '#f5832b' : '#4cc648'}>
                    {item.isExtend ? this.$t('request.detail.travel.previous'/*原*/) : this.$t('request.detail.travel.latest'/*新*/)}
                  </Tag>
                )}
                <Tag color="#1890ff">{this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate, item.startDate)})/*第 {day} 天*/}</Tag>
                <span className="date">{new Date(item.startDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.startDate).getDay())}</span>
                {item.supplierName && <div className="supplier"><span>{item.supplierName}</span> <img src={item.supplierIconUrl}/></div>}
              </div>
              <Row className="location">
                <Col span={10}>
                  <span className="from">{item.fromCity}</span>
                  <img src={trafficLineImg}/>
                  <span className="to">{item.toCity}</span>
                </Col>
                {item.approvalNum && <Col span={10}>{this.$t('request.detail.travel.itinerary.number')/*行程单号*/}：{item.approvalNum}</Col>}
              </Row>
              <div>
                {details.map((detail, index) => {
                  if (index !== details.length - 1) {
                    return <span key={index}>{detail}<span className="ant-divider"/></span>
                  } else {
                    return detail
                  }
                })}
              </div>
              {item.remark && <div className="remark">{this.$t('common.remark')}：{item.remark}</div>}
            </div>
          )
        }
        break;
      case 'SUBSIDIES':
        header = (
          <Row className="itinerary-header">
            <Col span={5}><img src={subsidyImg}/>{this.$t('request.detail.travel.allowance')/*差补*/}</Col>
          </Row>
        );
        if (item && subsidyVersion === 2) {
          itemContent = (
            <div className="subsidy">
              {(info.version > 0 || isPreVersion) && item.disabled && (
                <img src={language.code === 'zh_cn' ? disabledImg : disabledEnImg} className="disabled-img"/>
              )}
              <div>
                <Tag color="#1890ff">
                  { this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate, item.startDate)})/*第 {day} 天*/}
                  {' ～ '}
                  {this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate ,item.endDate)})/*第 {day} 天*/}
                </Tag>
                <span className="date">
                  {new Date(item.startDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.startDate).getDay())} ～ {new Date(item.endDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.endDate).getDay())}
                </span>
              </div>
              <Row className="location">
                <Col span={10}>{this.$t('request.detail.travel.destination')/*目的地*/}：<span className="from">{item.cityName || '-'}</span></Col>
                <Col span={10}>{this.$t('request.detail.total.amount')/*总金额*/}：
                  <span className="amount">{this.props.company.baseCurrency} {this.renderMoney(item.totalAmount || 0)}</span>
                </Col>
              </Row>
              {item.expenseType && item.expenseType.length ? (
                item.expenseType.map(expense => {
                  return (
                    <div key={expense.expenseTypeOID} className="expense-item">
                      <div>
                        {expense.expenseTypeName} {this.props.company.baseCurrency} {expense.amount}{this.$t('request.detail.travel.people.day')/*/人/天*/},
                        {expense.usernames.length}{this.$t('request.detail.travel.people')/*人*/},
                        {this.$t('request.detail.travel.total.day', {day: this.getDifferDays(item.startDate, item.endDate)})/*共{day}天*/}
                      </div>
                      <div>{expense.usernames.join(', ')}</div>
                    </div>
                  )
                })
              ) : <div>{this.$t('request.detail.travel.city.no.allowance')/*该城市无差补*/}</div>}
              {item.remark && <div className="remark">{this.$t('common.remark')}：{item.remark}</div>}
            </div>
          )
        } else if (item && subsidyVersion === 3) {
          let otherCurrency = [];
          itemContent = (
            <div className="subsidy">
              {(info.version > 0 || isPreVersion) && item.disabled && (
                <img src={language.code === 'zh_cn' ? disabledImg : disabledEnImg} className="disabled-img"/>
              )}
              <div>
                <Tag color="#1890ff">
                  {this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate, item.startDate)})/*第 {day} 天*/}
                  {' ～ '}
                  {this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate ,item.endDate)})/*第 {day} 天*/}
                </Tag>
                <span className="date">
                  {new Date(item.startDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.startDate).getDay())} ～ {new Date(item.endDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.endDate).getDay())}
                </span>
              </div>
              <div className="location-and-amount">
                {item.cityName} {item.baseCurrency} {this.renderMoney(item.totalBaseCurrencyAmount)}
                <span className="other-currency">
                  {Object.keys(item.currencyCodeAmountMap || {}).length > 1 && Object.keys(item.currencyCodeAmountMap).map(currency => {
                    otherCurrency.push(`${currency} ${item.currencyCodeAmountMap[currency]}`)
                  })}
                  {otherCurrency.join(' + ')}
                </span>
              </div>
              {item.remark && <div className="remark">{this.$t('common.remark')}：{item.remark}</div>}
              {(item.travelSubsidiesRequestItemDTOs || []).map((subsidy, itemIndex) => {
                let expenseTypeAmount = [];
                let subsidyItemIndex = 0;
                let subCurrency = [];
                Object.keys(subsidy.currencyCodeAmountMap || {}).map(currency => {
                  subCurrency.push(`${currency} ${subsidy.currencyCodeAmountMap[currency]}`)
                });
                return (
                  <div className="user-subsidy-items" key={itemIndex}>
                    <Row className="title-show">
                      <Col span={5} className="avatar-info">
                        <Row>
                          <Col span={5}><img src={subsidy.avatar || emptyAvatarImg} className="avatar-img"/></Col>
                          <Col span={19} style={{wordWrap:'break-word'}}>{subsidy.fullName}</Col>
                        </Row>
                      </Col>
                      <Col span={17} className="user-total-info">
                        {subCurrency.length && <Tooltip placement="top" title={subCurrency.join(' + ')}>{subCurrency.join(' + ')}</Tooltip>}
                        <div>{subsidy.baseCurrencyCode} {this.renderMoney(subsidy.baseCurrencyAmount)}</div>
                        <div className="expense-type-amount">
                          {Object.keys(subsidy.expenseTypeAmountMap || {}).map(key => {
                            expenseTypeAmount.push(`${key}: ${this.renderMoney(subsidy.expenseTypeAmountMap[key])}`)
                          })}
                          <Tooltip placement="top" title={expenseTypeAmount.join('，')}>{expenseTypeAmount.join('，')}</Tooltip>
                        </div>
                      </Col>
                      <Col span={2} className="up-down-icon">
                        <Icon type={subsidy.showItem ? 'up-circle-o' : 'down-circle-o'}
                              onClick={() => this.handleSubsidyItemShow(item.travelSubsidiesRequestOID, itemIndex, !subsidy.showItem)}/>
                      </Col>
                    </Row>
                    {subsidy.showItem && subsidy.travelSubsidiesItemMap.map(subsidiesItem => {
                      return subsidiesItem.travelSubsidiesRequestItemDetailDTOs.map(subsidyItem => {
                        subsidyItemIndex ++;
                        return (
                          <div className={`subsidy-item ${subsidyItemIndex % 2 ? 'subsidy-item-bg' : ''}`} key={subsidyItem.travelSubsidiesDetailsOID}>
                            <Row>
                              <Col span={3}>{moment(subsidiesItem.subsidiesDate).format('YYYY-MM-DD')}</Col>
                              <Col span={13}>
                                <Tooltip placement="topLeft" title={subsidyItem.expenseTypeName}>
                                  <span className="expense-type-name">{subsidyItem.expenseTypeName}</span>
                                </Tooltip>
                                {(subsidy.duplicateSubsidiesOIDs || []).map(duplicateOID => {
                                  if (duplicateOID === subsidyItem.travelSubsidiesDetailsOID) {
                                    return <Tag color="#bababa" style={{verticalAlign:'top'}}>{this.$t('request.detail.travel.repeat')/*重复*/}</Tag>
                                  }
                                })}
                                <div>
                                  {this.$t('request.detail.travel.enterprise.rate')/*企业汇率*/}：{Number(subsidyItem.baseCurrencyRate).toFixed(4)}
                                  {subsidyItem.currencyRate - subsidyItem.baseCurrencyRate >= 0 ? ' + ' : ' - '}
                                  {(subsidyItem.currencyRate - subsidyItem.baseCurrencyRate).toFixed(4) * 100}%
                                  ，{this.$t('request.detail.travel.original.amount')/*原金额*/}：{this.renderMoney(subsidyItem.baseAmount)}
                                </div>
                              </Col>
                              <Col span={2}>{Number(subsidyItem.currencyRate).toFixed(4)}</Col>
                              <Col span={2}>{subsidyItem.currencyCode}</Col>
                              <Col span={4}>{this.renderMoney(subsidyItem.amount)}</Col>
                            </Row>
                            <Row>
                              <Col span={21} offset={3}>{subsidyItem.comment}</Col>
                            </Row>
                          </div>
                        )
                      })
                    })}
                  </div>
                )
              })}
            </div>
          )
        }
        break;
      case 'REMARK':
        header = (
          <Row className="itinerary-header">
            <Col span={5}><img src={remarkImg}/>{this.$t('request.detail.travel.itinerary.remark')/*行程备注*/}</Col>
          </Row>
        );
        if (item) {
          let hasRemark = false;
          item.remark && (hasRemark = true);
          Object.keys(item.itineraryDetails || {}).map(key => {
            item.itineraryDetails[key][0].remark && (hasRemark = true)
          });
          hasRemark && (itemContent = (
            <div className="travel-remark">
              {(info.version > 0 || isPreVersion) && item.disabled && (
                <img src={language.code === 'zh_cn' ? disabledImg : disabledEnImg} className="disabled-img"/>
              )}
              <div>
                <Tag color="#1890ff">{this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate, item.remarkDate)})/*第 {day} 天*/}</Tag>
                <span className="date">{new Date(item.remarkDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.remarkDate).getDay())}</span>
              </div>
              <div className="remark">
                <div>{item.remark}</div>
                {Object.keys(item.itineraryDetails || {}).map((key, index) => {
                  let remark_title = '';
                  switch(key) {
                    case 'FLIGHT':
                      remark_title = this.$t('request.detail.travel.flight'); //机票
                      break;
                    case 'TRAIN':
                      remark_title = this.$t('request.detail.travel.train'); //火车
                      break;
                    case 'SUBSIDIES':
                      remark_title =  this.$t('request.detail.travel.allowance'); //差补
                      break;
                    case 'HOTEL':
                      remark_title =  this.$t('request.detail.travel.hotel'); //酒店
                      break;
                    case 'OTHER':
                      remark_title = this.$t('request.detail.travel.other.traffic'); //其他交通
                      break;
                  }
                  if (item.itineraryDetails[key][0].remark) {
                    return (
                      <Row key={index}>
                        <Col span={2} className="itinerary-type">{remark_title}</Col>
                        <Col span={3}>
                          <span>{item.itineraryDetails[key][0].fromCity || item.itineraryDetails[key][0].cityName}</span>
                          {item.itineraryDetails[key][0].toCity && ' - '}
                          <span>{item.itineraryDetails[key][0].toCity}</span>
                        </Col>
                        <Col span={19}>{item.itineraryDetails[key][0].remark}</Col>
                      </Row>
                    )
                  }
                })}
              </div>
            </div>
          ));
        }
        break;
      case 'HOTEL':
        header = (
          <Row className="itinerary-header">
            <Col span={5}><img src={hotelImg}/>{this.$t('request.detail.travel.hotel')/*酒店*/}</Col>
            {info.travelApplication && info.travelApplication.hotelUniformBooking && info.travelApplication.hotelBookingClerkName && (
              <Col span={10}>{this.$t('request.detail.travel.booker.hotel.by', {name: info.travelApplication.hotelBookingClerkName})/*由 {name} 统一订酒店*/}</Col>
            )}
          </Row>
        );
        item && (itemContent = (
          <div className="hotel">
            {(info.version > 0 || isPreVersion) && item.disabled && (
              <img src={language.code === 'zh_cn' ? disabledImg : disabledEnImg} className="disabled-img"/>
            )}
            <div>
              {(info.version > 0 || isPreVersion) && (
                <Tag color={item.isExtend ? '#f5832b' : '#4cc648'}>
                  {item.isExtend ? this.$t('request.detail.travel.previous'/*原*/) : this.$t('request.detail.travel.latest'/*新*/)}
                </Tag>
              )}
              <Tag color="#1890ff">
                {this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate, item.fromDate)})/*第 {day} 天*/}
                {' ～ '}
                {this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate ,item.leaveDate)})/*第 {day} 天*/}
              </Tag>
              <span className="date">
                {new Date(item.fromDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.fromDate).getDay())} ～ {new Date(item.leaveDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.leaveDate).getDay())}
              </span>
              <span className="day-and-night">
                {this.$t('request.detail.travel.day', {day: this.getDifferDays(item.fromDate, item.leaveDate)})/*{day}天*/}
                {this.$t('request.detail.travel.night', {night: this.getDifferDays(item.fromDate, item.leaveDate) - 1})/*{night}晚*/}
              </span>
              {item.supplierName && <div className="supplier"><span>{item.supplierName}</span> <img src={item.supplierIconUrl}/></div>}
            </div>
            <Row className="location">
              <Col span={10}>{this.$t('request.detail.travel.destination')/*目的地*/}：{item.cityName ? <span className="from">{item.cityName}</span> : '-'}</Col>
              {item.approvalNumber && <Col span={10}>{this.$t('request.detail.travel.itinerary.number')/*行程单号*/}：{item.approvalNumber}</Col>}
            </Row>
            <div>
              {item.roomNumber}{this.$t('request.detail.travel.room')/*间*/}
              <span className="ant-divider"/>
              {this.props.company.baseCurrency} {item.minPrice ? this.renderMoney(item.minPrice) : this.$t('request.detail.travel.no.restriction'/*无限制*/)}
              {item.maxPrice ? ` -- ${this.renderMoney(item.maxPrice)}` :
                item.minPrice ? ` -- ${this.$t('request.detail.travel.no.restriction'/*无限制*/)}` : ''}
              {` / `}{this.$t('request.detail.travel.night', {night: ''})/*晚*/}
            </div>
            {item.remark && <div className="remark">{this.$t('common.remark')}：{item.remark}</div>}
          </div>
        ));
        break;
      case 'OTHER':
        header = (
          <Row className="itinerary-header">
            <Col span={5}><img src={otherImg}/>{this.$t('request.detail.travel.other.traffic')/*其他交通*/}</Col>
          </Row>
        );
        item && (itemContent = (
          <div className="other">
            {(info.version > 0 || isPreVersion) && item.disabled && (
              <img src={language.code === 'zh_cn' ? disabledImg : disabledEnImg} className="disabled-img"/>
            )}
            <div>
              {(info.version > 0 || isPreVersion) && (
                <Tag color={item.isExtend ? '#f5832b' : '#4cc648'}>
                  {item.isExtend ? this.$t('request.detail.travel.previous'/*原*/) : this.$t('request.detail.travel.latest'/*新*/)}
                </Tag>
              )}
              <Tag color="#1890ff">
                {this.$t('request.detail.travel.day.number', {day: this.getDifferDays(sDate, item.startDate)})/*第 {day} 天*/}
              </Tag>
              <span className="date">{new Date(item.startDate).format('yyyy.MM.dd')} {this.getWeed(new Date(item.startDate).getDay())}</span>
              {item.supplierName && <div className="supplier"><span>{item.supplierName}</span> <img src={item.supplierIconUrl}/></div>}
            </div>
            <div className="location">
              <span className="traffic-type">{item.trafficTypeName}</span>
              <span className="from">{item.fromCity}</span>
              <img src={trafficLineImg}/>
              <span className="to">{item.toCity}</span>
            </div>
            {item.remark && <div className="remark">{this.$t('common.remark')}：{item.remark}</div>}
          </div>
        ));
        break;
      default:
        header = ''
    }
    return item ? itemContent : header
  };

  render() {
    const { loading, itinerary } = this.state;
    return (
      <div className="travel-information tab-container">
        <h3 className="sub-header-title">{this.$t('request.detail.travel.info')/*行程信息*/}</h3>
        <Spin spinning={loading}>
          {Object.keys(itinerary || {}).map(key => {
            itinerary[key] = itinerary[key] || [];
            let itemInfo = (
              <Collapse key={key}>
                <Panel header={this.renderItineraryItem(key)}>
                  {itinerary[key].map((item, index) => {
                    if (item) {
                      return <div className="container" key={index}>{this.renderItineraryItem(key, item)}</div>
                    }
                  })}
                </Panel>
              </Collapse>
            );
            if (itinerary[key].length) {
              if (key === 'REMARK') {
                let hasRemark = false;
                itinerary[key].map(item => {
                  item.remark && (hasRemark = true);
                  Object.keys(item.itineraryDetails || {}).map(type => {
                    item.itineraryDetails[type][0].remark && (hasRemark = true)
                  })
                });
                if (hasRemark) return itemInfo
              } else {
                return itemInfo
              }
            }
          })}
        </Spin>
      </div>
    )
  }
}

TravelInformation.propTypes = {
  applicationOID: PropTypes.string,
  latestApplicationOID: PropTypes.string,
  info: PropTypes.object,
  customFormPropertyMap: PropTypes.object,
  controlFields: PropTypes.object,
  isPreVersion: PropTypes.bool, //是否为最新版本的上一版本
};

function mapStateToProps(state) {
  console.log(state)
  return {
    company: state.user.company,
    //profile: state.login.profile,
    language: state.languages,
  }
}

const wrappedLoanRepayment = Form.create()(TravelInformation);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedLoanRepayment)
