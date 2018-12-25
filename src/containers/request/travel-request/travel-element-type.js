/**
 * Created by wangjiakun on 2018/3/15 0015.
 */
import React from 'react';
import { connect } from 'dva';

import { getApprovelHistory } from 'utils/extend';
import {
  Row,
  Col,
  Button,
  Collapse,
  Form,
  Input,
  message,
  Icon,
  Tag,
  Avatar,
  Popconfirm,
  Divider,
} from 'antd';
const Panel = Collapse.Panel;

import TravelPlane from 'containers/request/travel-request/travel-slide/travel-plane';
import TravelTrain from 'containers/request/travel-request/travel-slide/travel-train';
import TravelOther from 'containers/request/travel-request/travel-slide/travel-other';
import TravelElement from 'containers/request/travel-request/travel-slide/travel-element'; //差旅要素

import SlideFrame from 'widget/slide-frame';

import 'styles/request/travel-request/travel-type.scss';
import travelService from 'containers/request/travel-request/travel.service';
import travelUtil from 'containers/request/travel-request/travelUtil';
import baseService from 'share/base.service';
import moment from 'moment';

class TravelElementType extends React.Component {
  profile = {};
  _isMounted;
  saveLock = false; //保存，提交，更新锁，防连续点击。
  constructor(props) {
    super(props);
    this.state = {
      isShowPlaneSlide: false,
      isShowTrainSlide: false,
      isShowSubsidySlide: false,
      isShowOtherSlide: false,
      isShowHotelSlide: false,
      isShowElementSlide: false,
      setInfo: {},
      itinerary: [],
      startDate: '',
      tipContent: '', //说明内容
      travelElement: false, //差旅要素,
      travelElementsList: [], //差旅要素列表
      loading: false,
      elementTitle: '',
    };
  }

  componentWillMount() {
    let start = travelUtil.getFormHeadValue(this.props.setInfo.defaultValue, 'start_date');
    let isShowTip = false;
    let tipContent = '';
    let isSetTipes = this.props.setInfo['travelInfo']['customFormPropertyMap'][
      'travel.subsidies.dimension'
    ]
      ? JSON.parse(
          this.props.setInfo['travelInfo']['customFormPropertyMap']['travel.subsidies.dimension']
        )
      : false;
    if (isSetTipes) {
      if (isSetTipes.withTips && isSetTipes.tips) {
        //显示tip  true
        isShowTip = true;
        //内容：isSetTipes.tips
        tipContent = isSetTipes.tips;
      }
    }
    this.getTravelElementsList(this.props.setInfo.formOid);
    this._isMounted = true;
    this.setState({
      setInfo: this.props.setInfo,
      travelElement: this.props.setInfo.travelElement,
      startDate: start,
      isChangeVersion: this.props.infoDetail['sourceApplicationOid'] ? true : false,
      isShowTip: isShowTip,
      tipContent: tipContent,
    });
    // this.refreshItinerary();
    baseService.getProfile().then(res => {
      this.profile = res.data;
      this.setState({
        isCanChangeRate: res.data['web.expense.rate.edit.disabled'],
        amountProfile: res.data['allowance.amount.modify'],
      });
    });
  }

  //
  componentWillReceiveProps(nextProps) {
    this.setState({
      setInfo: this.props.setInfo,
    });
  }

  //获取差旅要素
  getTravelElementsList = formOid => {
    travelService.getTravelElementsList(formOid).then(res => {
      if (res.data.length > 0) {
        this.setState({
          travelElementsList: res.data,
        });
      }
    });
  };

  setClose = err => {
    this.setState({
      isShowTrainSlide: false,
      isShowPlaneSlide: false,
      isShowSubsidySlide: false,
      isShowOtherSlide: false,
      isShowHotelSlide: false,
      isShowElementSlide: false,
    });
  };

  /**
   * 打开侧滑
   * @param flag 标记打开哪一个侧滑
   */
  showBaseSlide = (flag, item) => {
    let elementFormOid = '';
    switch (flag) {
      case 'plane':
        this.setState({ isShowPlaneSlide: true, setInfo: this.props.setInfo }, () => {
          this.setState({ isShowPlaneSlide: true });
        });
        break;
      case 'train':
        this.setState({ isShowTrainSlide: true, setInfo: this.props.setInfo }, () => {
          this.setState({ isShowTrainSlide: true });
        });
        break;
      case 'other':
        this.setState({ isShowOtherSlide: true, setInfo: this.props.setInfo }, () => {
          this.setState({ isShowOtherSlide: true });
        });
        break;
      case 'element':
        this.setState(
          {
            elementTitle: item.formName,
          },
          () => {
            elementFormOid = item.formOid;
            let setInfo = this.props.setInfo;
            setInfo.elementFormOid = elementFormOid;
            this.setState({ isShowElementSlide: true, setInfo: setInfo }, () => {
              this.setState({ isShowElementSlide: true });
            });
          }
        );
        break;
    }
  };

  tirmTravelElements = (arr, params) => {
    arr.map((itinerarys, mainIndex) => {
      if (
        moment(itinerarys.itineraryDate).format('YYYY.MM.DD') ===
        moment(params.startDate).format('YYYY.MM.DD')
      ) {
        if (itinerarys.travelItineraryTraffics) {
          itinerarys.travelItineraryTraffics.push(params);
        } else {
          itinerarys.travelItineraryTraffics = [];
          itinerarys.travelItineraryTraffics.push(params);
        }
      }
    });
    return arr;
  };

  /**
   * TODO
   * @param params
   * @param flag
   */
  afterBaseCloseSlide = (params, flag) => {
    if (!params) {
      this.setClose();
      return;
    }
    let info = this.state.setInfo;
    switch (flag) {
      case 'train':
      case 'plane':
      case 'other':
        if (params.oldDate) {
          info.travelItinerarys.map((mainitem, mainindex) => {
            if (
              moment(mainitem.itineraryDate).format('YYYY.MM.DD') ===
              moment(params.oldDate).format('YYYY.MM.DD')
            ) {
              mainitem.travelItineraryTraffics.map((item, index) => {
                if (
                  item.fromCityCode === params.fromCityCode &&
                  item.toCityCode === params.toCityCode &&
                  item.trafficType === params.trafficType
                ) {
                  mainitem.travelItineraryTraffics.splice(index, 1);
                }
              });
            }
          });
        }
        this.tirmTravelElements(info.travelItinerarys, params);
        this.setState({
          isShowPlaneSlide: false,
          isShowOtherSlide: false,
          isShowTrainSlide: false,
          setInfo: info,
        });
        break;
      case 'element':
        params.dateRange.map(data => {
          info.travelItinerarys.map((itinerarys, mainIndex) => {
            if (
              data === moment(info.travelItinerarys[mainIndex].itineraryDate).format('YYYY-MM-DD')
            ) {
              info.travelItinerarys[mainIndex].travelElements.push(params.customFormFields);
            }
          });
        });
        this.setState({ isShowElementSlide: false, setInfo: info });
        break;
    }
  };

  /**
   *行程行点击回调打开对应侧滑
   * @param item 被点击行的数据对象
   * @param title 被点击行的折叠板标题
   */
  toEditRecord = (item, title) => {
    if (item.loading) {
      return;
    }
    let info = this.state.setInfo;
    if (item.isExtend) {
      //是否为原行程，原行程不可修改
      message.error(this.$t('itinerary.type.original') /*原行程不可修改*/);
      return;
    }
    switch (title) {
      case 1001:
        info.editPlane = item;
        this.setState({ setInfo: info, isShowPlaneSlide: true }, () => {
          this.setState({ isShowPlaneSlide: true });
        });
        break;
      case 1002:
        info.editTrain = item;
        this.setState({ setInfo: info, isShowTrainSlide: true }, () => {
          this.setState({ isShowTrainSlide: true });
        });
        break;
      case 1003:
        info.editOther = item;
        this.setState({ setInfo: info, isShowOtherSlide: true }, () => {
          this.setState({ isShowOtherSlide: true });
        });
        break;
      default:
        break;
    }
  };

  //删除差旅要素
  dele = (type, mainIndex, index) => {
    let { setInfo } = this.state;
    if (type === 'traffic') {
      setInfo.travelItinerarys[mainIndex].travelItineraryTraffics.splice(index, 1);
      this.setState({
        setInfo,
      });
    } else {
      setInfo.travelItinerarys[mainIndex].travelElements.splice(index, 1);
      this.setState({
        setInfo,
      });
    }
    this.updateTravelItinerarys(setInfo.travelItinerarys);
  };

  //更新差旅要素
  updateTravelItinerarys = travelItinerarys => {
    this.props.updateTravelItinerarys(travelItinerarys);
  };

  render() {
    const {
      itinerary,
      startDate,
      isShowTrainSlide,
      isShowPlaneSlide,
      isShowOtherSlide,
      setInfo,
      travelElement,
      isShowElementSlide,
      travelElementsList,
      elementTitle,
    } = this.state;
    // const { setInfo } = this.props;
    const mapInfo = setInfo['travelInfo']['customFormPropertyMap'];
    const flight = itinerary['FLIGHT'] ? itinerary['FLIGHT'] : [];
    const train = itinerary['TRAIN'] ? itinerary['TRAIN'] : [];
    const other = itinerary['OTHER'] ? itinerary['OTHER'] : [];
    setInfo.travelElement = travelElement;
    return (
      <div className="travel-type-select" style={{ width: '90%', paddingBottom: 6 }}>
        <Row className="travel-type-info">
          <Col className="travel-info-form" span={9}>
            {this.$t('itinerary.form.travel.info.name') /*行程信息*/}：
          </Col>
          <Col span={14} style={{ paddingLeft: '2%' }}>
            {this.$t('itinerary.form.travel.info.content') /*点击下方按钮,完善你的行程信息*/}
          </Col>
        </Row>
        <Row>
          <Col span={6} />
          <Col className="travel-type" span={17}>
            {mapInfo['ca.travel.flight.disabled'] !== 'true' && (
              <Button
                className="travel-type-btn"
                type="dashed"
                icon="plus"
                onClick={() => this.showBaseSlide('plane')}
              >
                {this.$t('itinerary.add.planeBtn') /*添加飞机行程*/}
              </Button>
            )}
            {mapInfo['ca.travel.train.disabled'] !== 'true' && (
              <Button
                className="travel-type-btn"
                onClick={() => this.showBaseSlide('train')}
                type="dashed"
                icon="plus"
              >
                {this.$t('itinerary.add.trainBtn') /*添加火车行程*/}
              </Button>
            )}
            {mapInfo['ca.travel.other.disabled'] !== 'true' && (
              <Button
                className="travel-type-btn"
                onClick={() => this.showBaseSlide('other')}
                type="dashed"
                icon="plus"
              >
                {this.$t('itinerary.add.otherBtn') /*添加其他交通*/}
              </Button>
            )}
            {travelElementsList &&
              travelElementsList.length > 0 &&
              travelElementsList.map(item => {
                return (
                  <Button
                    className="travel-type-btn"
                    type="dashed"
                    icon="plus"
                    onClick={() => this.showBaseSlide('element', item)}
                    key={item.formOid}
                  >
                    {item.formName}
                  </Button>
                );
              })}
          </Col>
        </Row>
        <Row>
          <Col span={7} />
          <Col span={17}>
            <Collapse bordered={false} className="type-collapse">
              {setInfo.travelItinerarys.length > 0 &&
                setInfo.travelItinerarys.map((item, mainIndex) => {
                  let date =
                    moment(item.itineraryDate).format('YYYY.MM.DD') +
                    ' ' +
                    travelUtil.getWeed(new Date(item.itineraryDate).getDay());
                  let showTraffics =
                    item.travelItineraryTraffics && item.travelItineraryTraffics.length > 0;
                  let showElement = item.travelElements && item.travelElements.length > 0;
                  let header = (
                    <span>
                      <img style={{ marginTop: -4 }} />
                      &nbsp;<Tag color="#108ee9">
                        {this.$t('itinerary.record.public.days.tag', {
                          days: mainIndex + 1,
                        }) /*第{day}天*/}
                      </Tag>
                      {date}
                    </span>
                  );
                  let option =
                    item.travelItineraryTraffics.length === 0 && item.travelElements.length === 0;
                  return (
                    <Panel
                      header={header}
                      className="type-plane"
                      showArrow={!option}
                      disabled={option}
                      key={item.itineraryOid ? item.itineraryOid : mainIndex + '-main'}
                    >
                      {showTraffics &&
                        item.travelItineraryTraffics.map((element, index) => {
                          let imgUrl = '';
                          switch (element.trafficType) {
                            case 1001:
                              imgUrl = require('images/travel/icon-plane.png');
                              break;
                            case 1002:
                              imgUrl = require('images/travel/icon-train.png');
                              break;
                            case 1003:
                              imgUrl = require('images/travel/icon-other.png');
                              break;
                            default:
                              break;
                          }
                          element.startDate = item.itineraryDate;
                          return (
                            <Row
                              type="flex"
                              className="type-line-box"
                              onClick={() => this.toEditRecord(element, element.trafficType)}
                              key={element.trafficOid ? element.trafficOid : index + '=trafficOid'}
                            >
                              <Col span={1}>
                                <Avatar size="small" src={imgUrl} />
                              </Col>
                              <Col span={22}>
                                {element.fromCity}-{element.toCity}
                              </Col>
                              <Col span={1}>
                                <Popconfirm
                                  title={
                                    this.$t(
                                      'itinerary.record.public.delete.tip'
                                    ) /*"你确定删除这行内容吗?"*/
                                  }
                                  onConfirm={() => this.dele('traffic', mainIndex, index)}
                                  okText={this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
                                  cancelText={
                                    this.$t('itinerary.type.slide.and.modal.cancel.btn') /*取消*/
                                  }
                                >
                                  <Icon
                                    type="close-circle"
                                    onClick={e => {
                                      e.stopPropagation();
                                    }}
                                  />
                                </Popconfirm>
                              </Col>
                            </Row>
                          );
                        })}
                      {showElement && showTraffics && <Divider />}
                      {showElement && (
                        <div>
                          {item.travelElements.map((element, index) => {
                            element.startDate = item.itineraryDate;
                            return (
                              <Row className="type-line-box" type="flex" align="middle" key={index}>
                                <Col span={23}>
                                  {element.map(e => {
                                    return (
                                      <div
                                        style={{ padding: '5px 0' }}
                                        key={e.fieldOid ? e.fieldOid : index + '-fieldOid'}
                                      >
                                        {e.fieldName}:{e.showValue}
                                      </div>
                                    );
                                  })}
                                </Col>
                                <Col span={1}>
                                  <Popconfirm
                                    title={
                                      this.$t(
                                        'itinerary.record.public.delete.tip'
                                      ) /*"你确定删除这行内容吗?"*/
                                    }
                                    onConfirm={() => this.dele('element', mainIndex, index)}
                                    okText={
                                      this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/
                                    }
                                    cancelText={
                                      this.$t('itinerary.type.slide.and.modal.cancel.btn') /*取消*/
                                    }
                                  >
                                    <Icon
                                      type="close-circle"
                                      onClick={e => {
                                        e.stopPropagation();
                                      }}
                                    />
                                  </Popconfirm>
                                </Col>
                              </Row>
                            );
                          })}
                        </div>
                      )}
                    </Panel>
                  );
                })}
            </Collapse>
          </Col>
        </Row>
        {mapInfo['ca.travel.flight.disabled'] !== 'true' &&
          isShowPlaneSlide && (
            <SlideFrame
              title={this.$t('itinerary.plane.slide.title') /*飞机行程*/}
              content={TravelPlane}
              show={isShowPlaneSlide}
              onClose={this.setClose}
              params={setInfo}
              afterClose={pra => this.afterBaseCloseSlide(pra, 'plane')}
            />
          )}
        {mapInfo['ca.travel.train.disabled'] !== 'true' &&
          isShowTrainSlide && (
            <SlideFrame
              title={this.$t('itinerary.train.slide.title') /*火车行程*/}
              content={TravelTrain}
              show={isShowTrainSlide}
              onClose={this.setClose}
              params={setInfo}
              afterClose={pra => this.afterBaseCloseSlide(pra, 'train')}
            />
          )}
        {mapInfo['ca.travel.other.disabled'] !== 'true' &&
          isShowOtherSlide && (
            <SlideFrame
              title={this.$t('itinerary.other.slide.title') /*其他行程*/}
              content={TravelOther}
              show={isShowOtherSlide}
              onClose={this.setClose}
              params={setInfo}
              afterClose={pra => this.afterBaseCloseSlide(pra, 'other')}
            />
          )}
        {travelElement &&
          isShowElementSlide && (
            <SlideFrame
              title={elementTitle}
              content={TravelElement}
              show={isShowElementSlide}
              onClose={this.setClose}
              params={setInfo}
              afterClose={pra => this.afterBaseCloseSlide(pra, 'element')}
            />
          )}

        <div className="type-fotter" />
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}
const wrappedTravelElementType = Form.create()(TravelElementType);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelElementType);
