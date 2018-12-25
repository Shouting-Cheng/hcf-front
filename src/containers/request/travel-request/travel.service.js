/**
 * Created by wangjiakun on 2018/3/20 0020.
 */
import config from 'config';
import httpFetch from 'share/httpFetch';
import app from '../../../index';
//import configureStore from 'stores';

export default {
  searchCitys(vendorType, keyWord, country, language) {
    let head = {
      language: language ? language : 'zh_cn',
      country: country ? country : 'all',
    };
    if (head.language === 'zh_cn' && head.country === 'China') {
      head.country = '中国';
    }
    if (head.language === 'en_us') {
      head.language = 'en_us';
    }
    return httpFetch.get(
      `${
      config.localUrl
      }/api/location/search?keyWord=${keyWord}&vendorType=${vendorType}&country=${head.country}&size=10`
    );
  },

  /**
   *其他行程提交
   * @param appOid
   */
  travelOtherSubmit(appOid, params) {
    return httpFetch.post(
      `${config.baseUrl}/api/travel/other/itinerary?applicationOid=${appOid}`,
      params
    );
  },

  /**
   *火车行程提交
   * @param appOid
   */
  travelTrainSubmit(appOid, params) {
    return httpFetch.post(
      `${config.baseUrl}/api/travel/train/itinerary?applicationOid=${appOid}`,
      params
    );
  },

  /**
   *飞机行程提交
   * @param appOid
   */
  travelPlaneSubmit(appOid, params) {
    return httpFetch.post(
      `${config.baseUrl}/api/travel/flight/itinerary?applicationOid=${appOid}`,
      params
    );
  },

  /**
   *酒店行程提交
   * @param appOid
   */
  travelHotelSubmit(appOid, params) {
    return httpFetch.post(
      `${config.baseUrl}/api/travel/hotel/itinerary?applicationOid=${appOid}`,
      params
    );
  },

  /**
   * 差补行程提交
   * @param params
   * @returns {AxiosPromise|*}
   */
  travelSubsidySubmit(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/subsidies/request/details`, params);
  },

  /**
   * 根据时间获取差补明细
   * @param date 时间
   * @param id 差补行程明细的id
   * @returns {*}
   */
  getSubsidyDetailByDate(date, id) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/subsidies/request?endDate=${date}+23:59:59&id=${id}&startDate=${date}+00:00:00`
    );
  },

  /**
   *获取已添加行程
   * @param appOid
   */
  getItinerary(appOid) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/applications/itinerarys?applicationOid=${appOid}&itineraryShowDetails=true&withItemDetail=true&withRequestDetail=true`
    );
  },

  /**
   * 获取行程供应商
   * @param type 2001（飞机） 2002（火车）
   * @returns {*}
   */
  travelSuppliers(type) {
    return httpFetch.get(`${config.baseUrl}/api/suppliers/${type}`);
  },

  /**
   * 获取日期段
   * @param oid 申请单id
   * @param start 起始日期
   * @param end  终止日期
   * @returns {*}
   */
  getDates(oid, start, end) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/remark/itinerary/generate?applicationOid=${oid}&endDate=${end}&startDate=${start}`
    );
  },

  /**
   * 根据日期获取该日期的备注信息
   * @param oid
   * @param date 当前日期
   * @returns {*}
   */
  getRemarksByDate(oid, date) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/applications/itinerarys?applicationOid=${oid}&itineraryShowDetails=true&remarkDate=${date}`
    );
  },

  /**
   * 添加备注提交
   * @param oid 申请单id
   * @param params 参数
   * @returns {AxiosPromise|*}
   */
  remarkSubmit(oid, params) {
    return httpFetch.post(
      `${config.baseUrl}/api/travel/itinerary/remark?applicationOid=${oid}`,
      params
    );
  },

  /**
   * 清空备注
   * @param remarkId 被清空备注行的id
   * @returns {*}
   */
  clearRemark(remarkId) {
    return httpFetch.delete(
      `${config.baseUrl}/api/travel/remark/itinerary/clear?remarkItineraryOid=${remarkId}`
    );
  },

  /**
   * 删除备注
   * @param remarkId 被删除备注的id
   * @returns {*}
   */
  deleteRemark(remarkId) {
    return httpFetch.delete(
      `${config.baseUrl}/api/travel/remark/itinerary?remarkItineraryOid=${remarkId}`
    );
  },

  /**
   * 删除飞机行程
   * @param flightItineraryOid  飞机行程id
   * @returns {*}
   */
  deletePlane(flightItineraryOid) {
    return httpFetch.delete(
      `${config.baseUrl}/api/travel/flight/itinerary?flightItineraryOid=${flightItineraryOid}`
    );
  },

  /**
   * 删除火车行程
   * @param trainItineraryOid  火车行程id
   * @returns {*}
   */
  deleteTrain(trainItineraryOid) {
    return httpFetch.delete(
      `${config.baseUrl}/api/travel/train/itinerary?trainItineraryOid=${trainItineraryOid}`
    );
  },

  /**
   * 删除其他行程
   * @param otherItineraryOid  其他行程id
   * @returns {*}
   */
  deleteOther(otherItineraryOid) {
    return httpFetch.delete(
      `${config.baseUrl}/api/travel/other/itinerary?otherItineraryOid=${otherItineraryOid}`
    );
  },

  /**
   * 删除酒店行程
   * @param otherItineraryOid  酒店行程id
   * @returns {*}
   */
  deleteHotel(hotelItineraryOid) {
    return httpFetch.delete(
      `${config.baseUrl}/api/travel/hotel/itinerary?hotelItineraryOid=${hotelItineraryOid}`
    );
  },

  /**
   * 删除差补行程
   * @param id  差补id
   * @returns {*}
   */
  deleteSubsidy(id) {
    return httpFetch.delete(`${config.baseUrl}/api/travel/subsidies/request?id=${id}`);
  },

  /**
   * 更新差补明细（包含单项修改汇率，金额，备注；批量修改金额；隐藏和取消隐藏）
   * @param params
   * @returns {AxiosPromise}
   */
  updateSubsidyDetail(params) {
    return httpFetch.put(`${config.baseUrl}/api/travel/subsidies/detail`, params);
  },

  /**
   * 更新飞机行程
   * @param params 飞机行程参数
   * @returns {AxiosPromise}
   */
  updatePlane(params) {
    return httpFetch.put(`${config.baseUrl}/api/travel/flight/itinerary`, params);
  },

  /**
   * 更新火车行程
   * @param params  火车行程参数
   * @returns {AxiosPromise}
   */
  updateTrain(params) {
    return httpFetch.put(`${config.baseUrl}/api/travel/train/itinerary`, params);
  },

  /**
   * 更新酒店行程
   * @param params  酒店行程参数
   * @returns {AxiosPromise}
   */
  updateHotel(params) {
    return httpFetch.put(`${config.baseUrl}/api/travel/hotel/itinerary`, params);
  },

  /**
   * 更新其他行程
   * @param params 其他行程参数
   * @returns {AxiosPromise}
   */
  updateOther(params) {
    return httpFetch.put(`${config.baseUrl}/api/travel/other/itinerary`, params);
  },

  /**
   * 更新差补行程
   * @param params
   * @returns {AxiosPromise|*}
   */
  updateSubsidy(params) {
    // return httpFetch.put(`${config.baseUrl}/api/travel/subsidies/request/details`,params);
    return httpFetch.post(`${config.baseUrl}/api/travel/subsidies/request/details`, params);
  },

  /**
   * 获取最大房间数
   * @param outNum 外部参与人数量
   * @param select_participant 内部参与人数组
   * @returns {AxiosPromise|*}
   */
  getMaxRoom(outNum, select_participant) {
    let participant = [];
    outNum = outNum ? outNum : 0;
    select_participant.map(item => {
      participant.push(item.participantOid);
    });
    return httpFetch.post(
      `${
      config.baseUrl
      }/api/travel/application/hotel/room/share?externalParticipantNumber=${outNum}`,
      participant
    );
  },

  /**
   * 获取最大机票数
   * @param applicationOid
   * @returns {*}
   */
  getMaxFlight(applicationOid) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/application/itinerary/ctrip/exist?applicationOid=${applicationOid}`
    );
  },

  /**
   * 获取差补类型
   * @param params 获取差补类型所需参数
   * @returns {AxiosPromise|*}
   */
  requestSubsidyType(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/subsidies/request`, params);
  },

  /**
   * 删除申请单下所有差补
   * @param applicationOid
   * @returns {*}
   */
  deleteAllSubsidy(applicationOid) {
    return httpFetch.delete(
      `${
      config.baseUrl
      }/api/travel/subsidies/request/applicationOid?applicationOid=${applicationOid}`
    );
  },

  /**
   * 差旅保存，提交时权限验证
   * @param params 参数
   */
  travelValidate(params, language, formInfo) {
    let isHaveApplicant = false;
    let urlParams = `formOid=${params.formOid}`; //必填
    let participantsOid = ''; //参与人oids 必填
    let proposerOid = ''; //申请人oid
    let departOid = ''; //部门oid
    let costCentreOid = ''; //成本中心oids
    let isSetCostCenter = false; // 成本中心是否设置的是非必填
    let editEnable = false; // 非任意值
    formInfo.customFormFields.map(item => {
      if (item.messageKey === 'select_participant') {
        editEnable = item.fieldContent ? JSON.parse(item.fieldContent).editable : true;
      }
    });
    params.custFormValues.map(res => {
      switch (res.messageKey) {
        case 'select_department':
          departOid = departOid + (res.value ? `&departmentOid=${res.value}` : '');
          break;
        case 'select_participant':
          let parts = JSON.parse(res.value ? res.value : '[]');
          parts.map(item => {
            participantsOid = participantsOid + `&participantsOid=${item.participantOid}`;
          });
          break;
        case 'applicant':
          proposerOid = res.value ? `&proposerOid=${res.value}` : '';
          isHaveApplicant = true;
          break;
        case 'select_cost_center':
          if (!res.required) {
            isSetCostCenter = true;
          }
          costCentreOid = costCentreOid + (res.value ? `&costCentreOid=${res.value}` : '');
          break;
        default:
          break;
      }
    });
    if (!isHaveApplicant) {
      let user = app.getState().user.currentUser;
      proposerOid = `&proposerOid=${user.userOid}`;
    }
    if (!editEnable) {
      // 如果配置了是参与人同申请人，则不再检验参与人权限
      let promise = new Promise((resolve, reject) => {
        resolve({ data: [] });
      });
      return promise;
    }
    if (!participantsOid) {
      let promise = new Promise((resolve, reject) => {
        reject({
          response: {
            data: {
              message:
                language.code === 'en'
                  ? 'Please add External or participant.'
                  : '请添加参与人或外部参与人',
            },
          },
        });
      });
      return promise;
    }
    urlParams = urlParams + participantsOid + proposerOid + departOid + costCentreOid;
    return httpFetch.get(`${config.baseUrl}/api/application/participant?${urlParams}`);
  },

  /**
   * 差旅申请单进行预算校验
   * @param params
   * @returns {AxiosPromise|*}
   */
  travelBudgetChecked(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/applications/checkbudget`, params);
  },

  /**
   * 保存差旅申请单
   * @param params 申请单参数
   * @returns {AxiosPromise|*}
   */
  saveTravelRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/applications/draft`, params);
  },

  /**
   * 提交差旅申请单
   * @param params
   * @returns {AxiosPromise|*}
   */
  submitTravelRequest(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/applications/submit`, params);
  },

  /**
   * 获取成本中心默认值
   * @param applicationOid 申请人oid
   * @param costCenterOid  成本中心oid；新建时，如果配置了成本中心项，则会在customFormFields中的成本中心项中有DataSource，
   *                        costCenterOid就在里面。如果没有dataSource说明配置有错
   * @returns {*} 返回数据data中costCenterItemOid字段为获取成本具体中心的oid.
   */
  getDefaultCostCenter(applicationOid, costCenterOid) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/bills/default/cost/center/item?applicantOid=${applicationOid}&costCenterOid=${costCenterOid}`
    );
  },

  /**
   * 获取成本中心默认值详情
   * @param costCenterItemOid 默认成本中心oid
   * @returns {*}
   */
  getDefaultCostCenterItem(costCenterItemOid) {
    return httpFetch.get(`${config.baseUrl}/api/cost/center/item/${costCenterItemOid}`);
  },

  /**
   * 停用和恢复机票行程
   * @param disable 值为TRUE代表停用，false为恢复
   * @param id  行程id
   * @returns {*}
   */
  stopPlane(disable, id) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/flight/itinerary/disable?disable=${disable}&flightItineraryOid=${id}`
    );
  },

  /**
   * 停用和恢复火车行程
   * @param disable 值为TRUE代表停用，false为恢复
   * @param id  行程id
   * @returns {*}
   */
  stopTrain(disable, id) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/train/itinerary/disable?disable=${disable}&trainItineraryOid=${id}`
    );
  },

  /**
   * 停用和恢复酒店行程
   * @param disable 值为TRUE代表停用，false为恢复
   * @param id  行程id
   * @returns {*}
   */
  stopHotel(disable, id) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/hotel/itinerary/disable?disable=${disable}&hotelItineraryOid=${id}`
    );
  },

  /**
   * 停用和恢复其他行程
   * @param disable 值为TRUE代表停用，false为恢复
   * @param id  行程id
   * @returns {*}
   */
  stopOther(disable, id) {
    return httpFetch.get(
      `${
      config.baseUrl
      }/api/travel/other/itinerary/disable?disable=${disable}&otherItineraryOid=${id}`
    );
  },

  /**
   * 获取申请人列表
   * @param formOid 表单id
   * @returns {*}
   */
  getPrincipals(formOid) {
    return httpFetch.get(`${config.baseUrl}/api/bill/proxy/my/principals/${formOid}`);
  },

  /**
   * 获取申请人信息
   * @param userId 申请人ID
   * @returns {*}
   */
  getPrincipalsInfo(userId) {
    return httpFetch.get(`${config.baseUrl}/api/company/configurations/user?userOid=${userId}`);
  },

  /**
   *
   * @param params
   */
  randomCreateHotelPeople(params) {
    return httpFetch.post(`${config.baseUrl}/api/travel/application/random/booking/clerk`, params);
  },

  //获取差旅要素
  getTravelElementsList(formOid) {
    return httpFetch.get(`${config.baseUrl}/api/custom/forms/travel/elements/${formOid}`);
  },

  getCostItem(costItemOid) {
    return httpFetch.get(`${config.baseUrl}/api/cost/center/item/${costItemOid}`);
  },
};
