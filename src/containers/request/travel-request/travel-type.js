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
  InputNumber,
  Spin,
  Input,
  message,
  Modal,
  Icon,
  DatePicker,
} from 'antd';
const Panel = Collapse.Panel;
const FormItem = Form.Item;
const TextArea = Input.TextArea;

import TravelPlane from 'containers/request/travel-request/travel-slide/travel-plane';
import TravelTrain from 'containers/request/travel-request/travel-slide/travel-train';
import TravelSubsidy from 'containers/request/travel-request/travel-slide/travel-subsidy';
import TravelRemark from 'containers/request/travel-request/travel-slide/travel-remark';
import TravelOther from 'containers/request/travel-request/travel-slide/travel-other';
import TravelHotel from 'containers/request/travel-request/travel-slide/travel-hotel';
import SlideFrame from 'widget/slide-frame';

import 'styles/request/travel-request/travel-type.scss';
import travelService from 'containers/request/travel-request/travel.service';
import travelUtil from 'containers/request/travel-request/travelUtil';
import baseService from 'share/base.service';
import moment from 'moment';

class TravelType extends React.Component {
  profile = {};
  changedNotSave = false; //修改了表单头部导致清空差补却未保存表单
  saveLock = false; //保存，提交，更新锁，防连续点击。
  constructor(props) {
    super(props);
    this.state = {
      isShowPlaneSlide: false,
      isShowTrainSlide: false,
      isShowSubsidySlide: false,
      isShowRemarkSlide: false,
      isShowOtherSlide: false,
      isShowHotelSlide: false,
      setInfo: {},
      itinerary: [],
      subsidyCopy: [], //差补数据的复制，用来批量更改时提交所用。
      startDate: '',
      subsidyItem: {}, //单项修改差补明细的项
      isCanChangeRate: false, //是否能修改汇率
      isChangeVersion: false, //是否是修改版本（已通过又更改操作的单子）
      amountProfile: 1001, //金额是否可修改配置 1001 不可修改  1002 可修改不可大于原金额 1003 可修改可大于原金额
      subCtrlObj: {
        //控制差补行程中的各种标记量
        isBatch: false, //是否批量更改
        isCanMore: false, //是否修改金额可以大于原金额。
        isSaveChange: false, //是否在保存批量更改。
        isEditSubsidyItem: false, //控制是否弹框修改某一项差补明细
      },
      isShowTip: false, //是否显示说明差补说明图标
      tipContent: '', //说明内容
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
    this.setState({
      setInfo: this.props.setInfo,
      startDate: start,
      isChangeVersion: this.props.infoDetail['sourceApplicationOid'] ? true : false,
      isShowTip: isShowTip,
      tipContent: tipContent,
    });
    this.refreshItinerary();
    baseService.getProfile().then(res => {
      this.profile = res.data;
      this.setState({
        isCanChangeRate: res.data['web.expense.rate.edit.disabled'],
        amountProfile: res.data['allowance.amount.modify'],
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.setInfo.clearSubsidy) {
      //清空差补要重新加载行程
      this.refreshItinerary();
      this.changedNotSave = true;
    } else if (nextProps.formIsChange && typeof nextProps.formIsChange === 'boolean') {
      this.changedNotSave = true;
    } else {
      if (this.changedNotSave) {
        this.changedNotSave = false;
        if (typeof nextProps.formIsChange === 'boolean') {
          this.showBaseSlide('subsidy');
        }
      }
    }
  }

  setClose = () => {
    this.setState({
      isShowTrainSlide: false,
      isShowPlaneSlide: false,
      isShowSubsidySlide: false,
      isShowRemarkSlide: false,
      isShowOtherSlide: false,
      isShowHotelSlide: false,
    });
  };

  /**
   * 打开侧滑
   * @param flag 标记打开哪一个侧滑
   */
  showBaseSlide = flag => {
    switch (flag) {
      case 'plane':
        this.setState({ isShowPlaneSlide: true, setInfo: this.props.setInfo });
        break;
      case 'train':
        this.setState({ isShowTrainSlide: true, setInfo: this.props.setInfo });
        break;
      case 'subsidy':
        if (this.changedNotSave) {
          Modal.confirm({
            title: this.$t('itinerary.form.tips') /*提示*/,
            content: this.$t('itinerary.type.add.subsidy.tip') /*'添加差补将自动保存当前单据?'*/,
            onOk: () => {
              this.props.beforeAddSubsidyToSave(true);
              this.changedNotSave = false;
            },
            onCancel: () => {},
          });
        } else {
          this.setState({ setInfo: this.props.setInfo, isShowSubsidySlide: true });
        }
        break;
      case 'remark':
        this.setState({ isShowRemarkSlide: true, setInfo: this.props.setInfo });
        break;
      case 'other':
        this.setState({ isShowOtherSlide: true, setInfo: this.props.setInfo });
        break;
      case 'hotel':
        this.setState({ isShowHotelSlide: true, setInfo: this.props.setInfo });
        break;
      default:
        this.setClose;
    }
  };

  /**
   * TODO
   * @param params
   * @param flag
   */
  afterBaseCloseSlide = (params, flag) => {
    this.refreshItinerary();
    let info = this.state.setInfo;
    switch (flag) {
      case 'plane':
        info.isResetPlane = true;
        this.setState({ isShowPlaneSlide: false, setInfo: info });
        break;
      case 'train':
        info.isResetTrain = true;
        this.setState({ isShowTrainSlide: false, setInfo: info });
        break;
      case 'subsidy':
        info.isResetSubsidy = true;
        this.setState({ isShowSubsidySlide: false, setInfo: info });
        break;
      case 'remark':
        info.isResetRemark = true;
        this.setState({ isShowRemarkSlide: false, setInfo: info });
        break;
      case 'other':
        info.isResetOther = true;
        this.setState({ isShowOtherSlide: false, setInfo: info });
        break;
      case 'hotel':
        info.isResetHotel = true;
        this.setState({ isShowHotelSlide: false, setInfo: info });
        break;
      default:
        this.setClose;
    }
  };

  //刷新行程记录
  refreshItinerary = display => {
    travelService
      .getItinerary(this.props.setInfo.oid)
      .then(res => {
        this.saveLock = false;
        if (res.data['SUBSIDIES'] && res.data['SUBSIDIES'].length > 0) {
          let sub = res.data['SUBSIDIES'];
          let total = 0;
          sub.map((a, index) => {
            a.isBatch = false;
            total = total + a.totalBaseCurrencyAmount;
            if (a.travelSubsidiesRequestItemDTOs) {
              a.travelSubsidiesRequestItemDTOs.map(b => {
                if (display && index === display.index && b === display.reqIndex) {
                  b.isDisplay = true;
                } else if (display && index === display.index) {
                  b.isDisplay = true;
                } else {
                  b.isDisplay = false;
                }
              });
            } else {
              sub.splice(index, 1);
            }
          });
          this.props.updateTotalBudget(total, false, true);
        } else if (
          (res.data['FLIGHT'] && res.data['FLIGHT'].length > 0) ||
          (res.data['TRAIN'] && res.data['TRAIN'].length > 0) ||
          (res.data['HOTEL'] && res.data['HOTEL'].length > 0) ||
          (res.data['OTHER'] && res.data['OTHER'].length > 0)
        ) {
          this.props.updateTotalBudget(0, false, true);
        } else if (res.data['REMARK'] && res.data['REMARK'].length > 0) {
          this.props.updateTotalBudget(0, false, true);
        } else {
          this.props.updateTotalBudget(0, false, false);
        }
        this.setState({
          itinerary: res.data,
          subsidyCopy:
            res.data['SUBSIDIES'] && res.data['SUBSIDIES'].length > 0 ? res.data['SUBSIDIES'] : [],
        });
        let setInfo = this.state.setInfo;
        if (res.data['HOTEL']) {
          setInfo.hotel = res.data['HOTEL'];
        } else {
          setInfo.hotel = [];
        }
        this.setState({ setInfo: setInfo });
      })
      .catch(err => {
        this.saveLock = false; //接口报错也要解锁
        message(
          this.$t('itinerary.operation.failed.tip') /*`操作失败:`*/ + err.response.data.message
        );
      });
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
      case this.$t('itinerary.plane.collapse.title') /*机票*/:
        info.editPlane = item;
        this.setState({ setInfo: info, isShowPlaneSlide: true });
        break;
      case this.$t('itinerary.train.collapse.title') /*火车*/:
        info.editTrain = item;
        this.setState({ setInfo: info, isShowTrainSlide: true });
        break;
      case this.$t('itinerary.remark.collapse.title') /*备注*/:
        info.editRemark = item;
        this.setState({ setInfo: info, isShowRemarkSlide: true });
        break;
      case this.$t('itinerary.other.collapse.title') /*其他*/:
        info.editOther = item;
        this.setState({ setInfo: info, isShowOtherSlide: true });
        break;
      case this.$t('itinerary.subsidy.collapse.title') /*差补*/:
        info.editSubsidy = item;
        this.setState({ setInfo: info, isShowSubsidySlide: true });
        break;
      case this.$t('itinerary.hotel.collapse.title') /*酒店*/:
        info.editHotel = item;
        this.setState({ setInfo: info, isShowHotelSlide: true });
        break;
      default:
        break;
    }
  };

  /**
   * 删除行程行
   * @param item 行程行对象
   * @param title 行程行折叠板标题
   */
  updateTravel = (item, title) => {
    let fromCity = item.fromCity;
    let fromCityCode = item.fromCityCode;
    item.fromCity = item.toCity;
    item.fromCityCode = item.toCityCode;
    item.toCity = fromCity;
    item.toCityCode = fromCityCode;
    item.endDate = null;
    item.itineraryType = 1001;
    switch (title) {
      case this.$t('itinerary.plane.collapse.title') /*机票*/:
        travelService
          .updatePlane(item)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.other.collapse.title') /*其他*/:
        travelService
          .updateOther(item)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      default:
        break;
    }
  };

  /**
   * 删除行程行
   * @param item 行程行对象
   * @param title 行程行折叠板标题
   */
  deleteTravel = (item, title, index) => {
    let itinerary = this.state.itinerary;
    switch (title) {
      case this.$t('itinerary.plane.collapse.title') /*机票*/:
        itinerary['FLIGHT'][index].loading = true;
        travelService
          .deletePlane(item.flightItineraryOid)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.train.collapse.title') /*火车*/:
        itinerary['TRAIN'][index].loading = true;
        travelService
          .deleteTrain(item.trainItineraryOid)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.remark.collapse.title') /*备注*/:
        itinerary['REMARK'][index].loading = true;
        travelService
          .deleteRemark(item.itineraryRemarkOid)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.other.collapse.title') /*其他*/:
        itinerary['OTHER'][index].loading = true;
        travelService
          .deleteOther(item.otherItineraryOid)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.hotel.collapse.title') /*酒店*/:
        itinerary['HOTEL'][index].loading = true;
        travelService
          .deleteHotel(item.hotelItineraryOid)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.subsidy.collapse.title') /*差补*/:
        itinerary['SUBSIDIES'][index].loading = true;
        travelService
          .deleteSubsidy(item.id)
          .then(res => {
            this.refreshItinerary();
            message.success(this.$t('itinerary.type.delete.tip') /*已删除*/);
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      default:
        break;
    }
    this.setState({ itinerary: itinerary });
  };

  //展开差补明细
  displayDetail = (index, reqIndex) => {
    let tempData = this.state.itinerary['SUBSIDIES'];
    let dis = false;
    if (reqIndex === 0 || reqIndex) {
      dis = tempData[index].travelSubsidiesRequestItemDTOs[reqIndex].isDisplay;
      tempData[index].travelSubsidiesRequestItemDTOs[reqIndex].isDisplay = !dis;
    } else {
      tempData[index].travelSubsidiesRequestItemDTOs.map(req => {
        req.isDisplay = true;
      });
    }
    let all = this.state.itinerary;
    all['SUBSIDIES'] = tempData;
    this.setState({ itinerary: all });
  };

  //点击批量修改回调函数
  toBatchChange = index => {
    let display = { index: index };
    let tempData = this.state.itinerary;
    let subData = tempData['SUBSIDIES'];
    let obj = this.state.subCtrlObj;
    switch (this.profile['allowance.amount.modify']) {
      case 1001:
        message.error(this.$t('itinerary.subsidy.batch.change.tip') /*不可修改*/);
        break;
      case 1002:
        subData[index].isBatch = !subData[index].isBatch;
        if (!subData[index].isBatch) {
          this.refreshItinerary();
        } else {
          this.displayDetail(index);
        }
        obj.isCanMore = false;
        this.setState({ subCtrlObj: obj });
        break;
      case 1003:
        subData[index].isBatch = !subData[index].isBatch;
        if (!subData[index].isBatch) {
          this.refreshItinerary();
        } else {
          this.displayDetail(index);
        }
        obj.isCanMore = true;
        this.setState({ subCtrlObj: obj });
        break;
      default:
        message.error(this.$t('itinerary.subsidy.batch.change.tip') /*不可修改*/);
        break;
    }
  };

  //批量修改是金额动态绑定到复制区subsidyCopy上，提交批量修改时使用。
  amountChange = (index, reqIndex, detIndex, indexOf, e) => {
    let tempData = this.state.subsidyCopy;
    tempData[index].travelSubsidiesRequestItemDTOs[reqIndex].travelSubsidiesItemMap[
      detIndex
    ].travelSubsidiesRequestItemDetailDTOs[indexOf].amount = e;
    this.setState({ subsidyCopy: tempData });
  };

  //批量或单项修改保存
  toSaveChange = index => {
    if (this.saveLock) {
      return;
    }
    let displayItem = { index: index };
    let isCanCommit = true;
    let saveParams = [];
    let tempData = this.state.subsidyCopy;
    if (index >= 0) {
      //大于等于零属于批量修改，否则为单项修改
      tempData[index].travelSubsidiesRequestItemDTOs.map(req => {
        req.travelSubsidiesItemMap.map(det => {
          det.travelSubsidiesRequestItemDetailDTOs.map(item => {
            saveParams.push(item);
          });
        });
      });
    } else {
      let detailItem = this.state.subsidyItem;
      if (detailItem.currencyRate > 0) {
        this.props.form.validateFieldsAndScroll((err, values) => {
          if (values.comment && values.comment.length === 101) {
            isCanCommit = false;
            message.error(this.$t('itinerary.remark.length.tooLong.tip') /*'备注长度超出'*/);
          }
          if (this.state.amountProfile === 1002 && values.amount > detailItem.baseAmount) {
            message.error('金额不可大于原金额');
            err = true;
          }
          if (!err) {
            values.currencyRate = detailItem.currencyRate;
            detailItem = Object.assign(detailItem, values);
            displayItem = {
              index: detailItem.displayItem.index,
              reqIndex: detailItem.displayItem.reqIndex,
            };
            delete detailItem.displayItem;
            delete detailItem.city;
            saveParams.push(detailItem);
          } else {
            isCanCommit = false;
          }
        });
      } else {
        message.error(this.$t('itinerary.subsidy.edit.modal.rateZero') /*汇率等于0*/);
        return;
      }
    }
    if (!isCanCommit) {
      return;
    }
    this.saveLock = true;
    let subCtrl = this.state.subCtrlObj;
    subCtrl.isSaveChange = true;
    this.setState({ subCtrlObj: subCtrl });
    travelService
      .updateSubsidyDetail(saveParams)
      .then(res => {
        message.success(this.$t('itinerary.update.tip') /*已更新*/);
        subCtrl.isSaveChange = false;
        this.setState({ subCtrlObj: subCtrl });
        this.refreshItinerary(displayItem); //刷新行程记录
        this.cancelEditSubsidyModal(); // 关闭弹框
      })
      .catch(er => {
        this.saveLock = false;
        this.cancelEditSubsidyModal(); // 关闭弹框
        message.error(
          this.$t('itinerary.operation.failed.tip') /*操作失败*/ + er.response.data.message
        );
        subCtrl.isSaveChange = false;
        this.setState({ subCtrlObj: subCtrl });
      });
  };

  //单项修改
  toEditSubsidyItem = (detailItem, cityName, displayItem) => {
    let obj = this.state.subCtrlObj;
    obj.isEditSubsidyItem = true;
    let detail = {
      travelSubsidiesDetailsOid: detailItem.travelSubsidiesDetailsOid,
      applicationOid: detailItem.applicationOid,
      expenseTypeOid: detailItem.expenseTypeOid,
      expenseTypeName: detailItem.expenseTypeName,
      userOid: detailItem.userOid,
      amount: detailItem.amount,
      currencyCode: detailItem.currencyCode,
      baseCurrencyAmount: detailItem.baseCurrencyAmount,
      status: detailItem.status,
      subsidiesDate: detailItem.subsidiesDate,
      currencyRate: detailItem.currencyRate,
      baseCurrencyRate: detailItem.baseCurrencyRate,
      comment: detailItem.comment,
      baseAmount: detailItem.baseAmount,
      lastModifiedDate: detailItem.lastModifiedDate,
      deleted: detailItem.deleted,
      areaCode: detailItem.areaCode,
      travelSubsidiesRequestID: detailItem.travelSubsidiesRequestID,
      city: cityName,
      displayItem: { index: displayItem.index, reqIndex: displayItem.reqIndex },
    };
    this.setState({
      subsidyItem: detail,
      subCtrlObj: obj,
    });
  };

  //单项修改时当前汇率变化回调
  currencyRateChange = value => {
    const { subsidyItem } = this.state;
    subsidyItem.currencyRate = value.target.value
      ? parseFloat(value.target.value).toFixed(4)
      : subsidyItem.currencyRate;
    subsidyItem.currencyRate = parseFloat(subsidyItem.currencyRate);
    this.setState({ subsidyItem });
  };

  //取消单项修改
  cancelEditSubsidyModal = () => {
    let obj = this.state.subCtrlObj;
    obj.isEditSubsidyItem = false;
    this.props.form.resetFields();
    this.setState({ subCtrlObj: obj });
  };

  /**
   * 清空备注行程行备注信息
   * @param res 备注行程行对象
   */
  clearRowRemark = (res, index) => {
    let itinerary = this.state.itinerary;
    itinerary['REMARK'][index].loading = true;
    travelService
      .clearRemark(res.itineraryRemarkOid)
      .then(data => {
        this.refreshItinerary();
        message.success(this.$t('itinerary.remark.clear.tip') /*清空成功*/);
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
    this.setState({ itinerary: itinerary });
  };

  //根据日期查询差补明细
  searchByDate = (e, index) => {
    if (!e) {
      this.refreshItinerary();
    } else {
      let date = moment(e).format('YYYY-MM-DD');
      let itinerary = this.state.itinerary;
      travelService
        .getSubsidyDetailByDate(date, itinerary['SUBSIDIES'][index].id)
        .then(res => {
          itinerary['SUBSIDIES'][index] = res.data;
          this.setState({ itinerary: itinerary });
        })
        .catch(err => {
          message.error(
            this.$t('itinerary.operation.failed.tip') /*操作失败*/ + err.response.data.message
          );
        });
    }
  };

  //隐藏
  isHiddenItem = (req, isDetail, dispalyItem) => {
    if (this.saveLock) {
      return;
    }
    let params = [];
    if (isDetail) {
      req.status = 1002;
      params.push(req);
    } else {
      req.travelSubsidiesItemMap.map(det => {
        det.travelSubsidiesRequestItemDetailDTOs.map(detail => {
          detail.status = 1002;
          params.push(detail);
        });
      });
    }
    this.saveLock = true; //加锁
    travelService
      .updateSubsidyDetail(params)
      .then(res => {
        this.refreshItinerary(dispalyItem); //刷新行程记录，并解锁
      })
      .catch(er => {
        this.saveLock = false; //放开锁
        message.error(
          this.$t('itinerary.operation.failed.tip') /*操作失败*/ + er.response.data.message
        );
      });
  };

  //取消隐藏
  isCancelHiddenItem = (req, isDetail, dispalyItem) => {
    if (this.saveLock) {
      return;
    }
    let params = [];
    if (isDetail) {
      req.status = 1001;
      params.push(req);
    } else {
      req.travelSubsidiesItemMap.map(det => {
        det.travelSubsidiesRequestItemDetailDTOs.map(detail => {
          detail.status = 1001;
          params.push(detail);
        });
      });
    }
    this.saveLock = true; //加锁
    travelService
      .updateSubsidyDetail(params)
      .then(res => {
        this.refreshItinerary(dispalyItem); //刷新行程记录，并解锁
      })
      .catch(er => {
        this.saveLock = false; //解锁
        message.error(
          this.$t('itinerary.operation.failed.tip') /*操作失败*/ + er.response.data.message
        );
      });
  };

  stopAndStart = (e, item, title, index) => {
    e.stopPropagation();
    let itinerary = this.state.itinerary;
    switch (title) {
      case this.$t('itinerary.plane.collapse.title') /*机票*/:
        itinerary['FLIGHT'][index].loading = true;
        travelService
          .stopPlane(!item.disabled, item.flightItineraryOid)
          .then(res => {
            //'恢复成功' : '停用成功'
            message.success(
              item.disabled
                ? this.$t('itinerary.disabled.success.tip')
                : this.$t('itinerary.recovered.success.tip')
            );
            this.refreshItinerary();
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.other.collapse.title') /*其他*/:
        itinerary['OTHER'][index].loading = true;
        travelService
          .stopOther(!item.disabled, item.otherItineraryOid)
          .then(res => {
            this.refreshItinerary();
            message.success(
              item.disabled
                ? this.$t('itinerary.disabled.success.tip')
                : this.$t('itinerary.recovered.success.tip')
            );
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.train.collapse.title') /*火车*/:
        itinerary['TRAIN'][index].loading = true;
        travelService
          .stopTrain(!item.disabled, item.trainItineraryOid)
          .then(res => {
            this.refreshItinerary();
            message.success(
              item.disabled
                ? this.$t('itinerary.disabled.success.tip')
                : this.$t('itinerary.recovered.success.tip')
            );
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      case this.$t('itinerary.hotel.collapse.title') /*酒店*/:
        itinerary['HOTEL'][index].loading = true;
        travelService
          .stopHotel(!item.disabled, item.hotelItineraryOid)
          .then(res => {
            this.refreshItinerary();
            message.success(
              item.disabled
                ? this.$t('itinerary.disabled.success.tip')
                : this.$t('itinerary.recovered.success.tip')
            );
          })
          .catch(err => {
            message.error(err.response.data.message);
          });
        break;
      default:
        break;
    }
    this.setState({ itinerary: itinerary });
  };

  cfo = travelUtil.createFormOption;

  showSubsidyTip = () => {
    Modal.info({
      title: this.$t('itinerary.subsidy.addition.title') /*添加差补说明*/,
      content: <div style={{ maxHeight: '200', overflow: 'auto' }}>{this.state.tipContent}</div>,
      onOk() {},
    });
  };

  render() {
    const {
      isChangeVersion,
      itinerary,
      subCtrlObj,
      subsidyItem,
      isCanChangeRate,
      amountProfile,
      startDate,
      isShowHotelSlide,
      isShowTrainSlide,
      isShowPlaneSlide,
      isShowSubsidySlide,
      isShowRemarkSlide,
      isShowOtherSlide,
      setInfo,
      isShowTip,
      tipContent,
    } = this.state;
    const mapInfo = setInfo['travelInfo']['customFormPropertyMap'];
    const flight = itinerary['FLIGHT'] ? itinerary['FLIGHT'] : [];
    const train = itinerary['TRAIN'] ? itinerary['TRAIN'] : [];
    const other = itinerary['OTHER'] ? itinerary['OTHER'] : [];
    const remark = itinerary['REMARK'] ? itinerary['REMARK'] : [];
    const hotel = itinerary['HOTEL'] ? itinerary['HOTEL'] : [];
    const subsidy = itinerary['SUBSIDIES'] ? itinerary['SUBSIDIES'] : [];
    const { getFieldDecorator } = this.props.form;
    const formItemLayoutM = {
      labelCol: { span: 4 },
      wrapperCol: { span: 6 },
    };
    const formItemLayoutL = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    const formItemLayoutS = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
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
            {mapInfo['hotel.itinerary.enable'] === 'true' && (
              <Button
                className="travel-type-btn"
                onClick={() => this.showBaseSlide('hotel')}
                type="dashed"
                icon="plus"
              >
                {this.$t('itinerary.add.hotelBtn') /*添加飞酒店*/}
              </Button>
            )}
            {mapInfo['travel.allowance.disabled'] !== 'true' && (
              <Button
                className="travel-type-btn"
                onClick={() => this.showBaseSlide('subsidy')}
                type="dashed"
                icon="plus"
              >
                {this.$t('itinerary.add.subsidyBtn') /*添加差补*/}
              </Button>
            )}
            {mapInfo['ca.travel.remark.disabled'] !== 'true' && (
              <Button
                className="travel-type-btn"
                onClick={() => this.showBaseSlide('remark')}
                type="dashed"
                icon="plus"
              >
                {this.$t('itinerary.add.remarkBtn') /*添加行程备注*/}
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
          </Col>
        </Row>
        <Row>
          <Col span={7} />
          <Col span={17}>
            <Collapse bordered={false} className="type-collapse">
              {travelUtil.getTravelRecord(
                this.$t('itinerary.plane.collapse.title') /*机票*/,
                flight,
                this.toEditRecord,
                this.deleteTravel,
                this.updateTravel,
                this.stopAndStart,
                startDate,
                isChangeVersion
              )}
              {travelUtil.getTravelRecord(
                this.$t('itinerary.train.collapse.title') /*火车*/,
                train,
                this.toEditRecord,
                this.deleteTravel,
                '',
                this.stopAndStart,
                startDate,
                isChangeVersion
              )}
              {travelUtil.getSubsidyRecord(
                this.$t('itinerary.subsidy.collapse.title'),
                subsidy,
                this.toEditRecord,
                this.deleteTravel,
                this.displayDetail,
                this.toBatchChange,
                this.amountChange,
                this.toSaveChange,
                this.toEditSubsidyItem,
                this.searchByDate,
                this.isHiddenItem,
                this.isCancelHiddenItem,
                subCtrlObj
              )}
              {travelUtil.getHotelRecord(
                this.$t('itinerary.hotel.collapse.title') /*酒店*/,
                hotel,
                this.toEditRecord,
                this.deleteTravel,
                this.stopAndStart,
                startDate,
                isChangeVersion
              )}
              {travelUtil.getTravelRecord(
                this.$t('itinerary.other.collapse.title') /*其他*/,
                other,
                this.toEditRecord,
                this.deleteTravel,
                this.updateTravel,
                this.stopAndStart,
                startDate,
                isChangeVersion
              )}
              {travelUtil.getRemarkRecord(
                this.$t('itinerary.remark.collapse.title') /*备注*/,
                remark,
                this.toEditRecord,
                this.deleteTravel,
                this.clearRowRemark,
                startDate
              )}
            </Collapse>
          </Col>
        </Row>
        {mapInfo['ca.travel.flight.disabled'] !== 'true' && (
          <SlideFrame
            title={this.$t('itinerary.plane.slide.title') /*飞机行程*/}
            content={TravelPlane}
            show={isShowPlaneSlide}
            onClose={this.setClose}
            params={setInfo}
            afterClose={pra => this.afterBaseCloseSlide(pra, 'plane')}
          />
        )}
        {mapInfo['ca.travel.train.disabled'] !== 'true' && (
          <SlideFrame
            title={this.$t('itinerary.train.slide.title') /*火车行程*/}
            content={TravelTrain}
            show={isShowTrainSlide}
            onClose={this.setClose}
            params={setInfo}
            afterClose={pra => this.afterBaseCloseSlide(pra, 'train')}
          />
        )}

        {mapInfo['travel.allowance.disabled'] !== 'true' && (
          <SlideFrame
            title={
              isShowTip ? (
                <span>
                  {this.$t('itinerary.subsidy.slide.title') /*添加差补*/}
                  <Icon
                    className="subsidy-tip-icon"
                    onClick={this.showSubsidyTip}
                    type="info-circle-o"
                  />
                </span>
              ) : (
                this.$t('itinerary.subsidy.slide.title')
              )
            }
            content={TravelSubsidy}
            show={isShowSubsidySlide}
            params={setInfo}
            onClose={this.setClose}
            afterClose={pra => this.afterBaseCloseSlide(pra, 'subsidy')}
          />
        )}

        {mapInfo['hotel.itinerary.enable'] === 'true' && (
          <SlideFrame
            title={this.$t('itinerary.hotel.slide.title') /*添加酒店*/}
            content={TravelHotel}
            show={isShowHotelSlide}
            onClose={this.setClose}
            params={setInfo}
            afterClose={pra => this.afterBaseCloseSlide(pra, 'hotel')}
          />
        )}

        {mapInfo['ca.travel.remark.disabled'] !== 'true' && (
          <SlideFrame
            title={this.$t('itinerary.remark.slide.title') /*添加备注*/}
            content={TravelRemark}
            show={isShowRemarkSlide}
            onClose={this.setClose}
            params={setInfo}
            afterClose={pra => this.afterBaseCloseSlide(pra, 'remark')}
          />
        )}

        {mapInfo['ca.travel.other.disabled'] !== 'true' && (
          <SlideFrame
            title={this.$t('itinerary.other.slide.title') /*其他行程*/}
            content={TravelOther}
            show={isShowOtherSlide}
            onClose={this.setClose}
            params={setInfo}
            afterClose={pra => this.afterBaseCloseSlide(pra, 'other')}
          />
        )}

        <div className="type-fotter" />
        <Modal
          title={this.$t('itinerary.subsidy.edit.modal.title') /*编辑差补*/}
          visible={subCtrlObj.isEditSubsidyItem}
          onOk={this.toSaveChange}
          onCancel={this.cancelEditSubsidyModal}
          okText={this.$t('itinerary.type.slide.and.modal.ok.btn') /*确定*/}
          cancelText={this.$t('itinerary.type.slide.and.modal.cancel.btn') /*取消*/}
          getContainer={() => document.getElementsByClassName('type-fotter')[0]}
          width={'50%'}
        >
          <Spin spinning={subCtrlObj.isSaveChange}>
            <Form>
              <Row style={{ marginBottom: 24 }}>
                <Col className="subsidy-modal-update" span={4}>
                  {this.$t('itinerary.subsidy.edit.modal.date') /*日期*/}:
                </Col>
                <Col span={8}>
                  <DatePicker
                    disabled={true}
                    value={
                      subsidyItem.subsidiesDate
                        ? moment(subsidyItem.subsidiesDate)
                        : moment(new Date())
                    }
                  />
                </Col>
                <Col className="subsidy-modal-update" span={4}>
                  {this.$t('itinerary.subsidy.edit.modal.city') /*城市*/}:
                </Col>
                <Col span={8}>{subsidyItem.city}</Col>
              </Row>
              <Row style={{ marginBottom: 24 }}>
                <Col className="subsidy-modal-update" span={4}>
                  {this.$t('itinerary.subsidy.edit.modal.type') /*类型*/}:
                </Col>
                <Col span={18}>{subsidyItem.expenseTypeName}</Col>
              </Row>
              <Row>
                <Col span={12}>
                  {
                    <FormItem
                      {...formItemLayoutS}
                      label={`${this.$t('itinerary.subsidy.edit.modal.amount') /*金额*/}(${
                        subsidyItem.currencyCode
                      })`}
                    >
                      {getFieldDecorator(
                        'amount',
                        this.cfo(
                          this.$t('itinerary.subsidy.edit.modal.amount'),
                          { type: 'number', value: subsidyItem.amount },
                          false
                        )
                      )(
                        <InputNumber
                          precision={2}
                          disabled={amountProfile > 1001 ? false : true}
                          min={0}
                        />
                      )}
                    </FormItem>
                  }
                </Col>
                <Col span={12}>
                  <FormItem
                    {...formItemLayoutS}
                    label={this.$t('itinerary.subsidy.edit.modal.original') /*原金额*/}
                  >
                    {getFieldDecorator(
                      'baseAmount',
                      this.cfo(
                        this.$t('itinerary.subsidy.edit.modal.original'),
                        { type: 'number', value: subsidyItem.baseAmount },
                        false
                      )
                    )(<InputNumber disabled={true} />)}
                  </FormItem>
                </Col>
              </Row>
              {
                <FormItem
                  {...formItemLayoutL}
                  label={this.$t('itinerary.subsidy.edit.modal.rate') /*汇率*/}
                >
                  {getFieldDecorator('currencyRate', {
                    rules: [
                      {
                        required: true,
                        message: this.$t(
                          'itinerary.subsidy.edit.modal.rate.tip'
                        ) /*汇率不为空且大于零*/,
                      },
                    ],
                    initialValue: subsidyItem.currencyRate,
                  })(
                    <Input
                      type="number"
                      disabled={!(!isCanChangeRate && subsidyItem.currencyCode != 'CNY')}
                      style={{ width: 90 }}
                      min={0}
                      onChange={this.currencyRateChange}
                    />
                  )}
                  {!isCanChangeRate &&
                    subsidyItem.currencyCode != 'CNY' && (
                      <span>
                        {` ${subsidyItem.baseCurrencyRate}
                        ${
                          subsidyItem.currencyRate - subsidyItem.baseCurrencyRate < 0
                            ? ' - '
                            : ' + '
                        }
                        ${(
                          (Math.abs(subsidyItem.currencyRate - subsidyItem.baseCurrencyRate) /
                            subsidyItem.baseCurrencyRate) *
                          100
                        ).toFixed(1)}%`}
                      </span>
                    )}
                </FormItem>
              }
              <FormItem
                {...formItemLayoutL}
                label={this.$t('itinerary.subsidy.edit.modal.remark') /*备注*/}
              >
                {getFieldDecorator(
                  'comment',
                  this.cfo(
                    this.$t('itinerary.subsidy.edit.modal.remark'),
                    { type: 'str', value: subsidyItem.comment, maxNum: 100 },
                    true
                  )
                )(
                  <TextArea
                    placeholder={
                      this.$t('itinerary.subsidy.edit.modal.placeholder') /*非必填,最多100个字符*/
                    }
                    autosize={{ minRows: 3, maxRows: 6 }}
                    maxLength={101}
                  />
                )}
              </FormItem>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}
const wrappedTravelType = Form.create()(TravelType);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelType);
