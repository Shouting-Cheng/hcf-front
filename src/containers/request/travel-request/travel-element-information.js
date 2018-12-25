import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Collapse, Tag, Spin, Row, Col, Avatar, Divider } from 'antd';
const Panel = Collapse.Panel;
import 'styles/request/travel-request/travel-type.scss';
import 'styles/request/travel-request/travel-information-element.scss';
import travelUtil from 'containers/request/travel-request/travelUtil';

class TravelInformationElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  render() {
    const { loading } = this.state;
    const { info } = this.props;
    return (
      <div className="travel-information-element tab-container">
        <h3 className="sub-header-title">{this.$t('request.detail.travel.info') /*行程信息*/}</h3>
        <Spin spinning={loading}>
          <Collapse>
            {info.travelApplication.travelItinerarys.length > 0 &&
              info.travelApplication.travelItinerarys.map((item, mainIndex) => {
                let date =
                  moment(item.itineraryDate).format('YYYY.MM.DD') +
                  ' ' +
                  travelUtil.getWeed(new Date(item.itineraryDate).getDay());
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
                let showTraffics =
                  item.travelItineraryTraffics && item.travelItineraryTraffics.length > 0;
                let showElement = item.travelElements && item.travelElements.length > 0;
                let option =
                  item.travelItineraryTraffics.length === 0 && item.travelElements.length === 0;
                return (
                  <Panel
                    header={header}
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
                            className="element-item"
                            key={element.trafficOid ? element.trafficOid : index + '=trafficOid'}
                          >
                            <Col span={1}>
                              <Avatar size="small" src={imgUrl} />
                            </Col>
                            <Col span={22}>
                              {element.fromCity}-{element.toCity}
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
                            <Row type="flex" className="element-item" align="middle" key={index}>
                              <Col span={23}>
                                {element.map(e => {
                                  return (
                                    <div
                                      className="value-item"
                                      key={e.fieldOid ? e.fieldOid : index + '-fieldOid'}
                                    >
                                      {e.fieldName}:{e.showValue}
                                    </div>
                                  );
                                })}
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
        </Spin>
      </div>
    );
  }
}

TravelInformationElement.propTypes = {
  applicationOid: PropTypes.string,
  latestApplicationOid: PropTypes.string,
  info: PropTypes.object,
  customFormPropertyMap: PropTypes.object,
  controlFields: PropTypes.object,
  isPreVersion: PropTypes.bool, //是否为最新版本的上一版本
};

function mapStateToProps(state) {
  return {
    company: state.login.company,
    profile: state.login.profile,
    language: state.main.language,
  };
}

const wrappedTravelInformationElement = Form.create()(TravelInformationElement);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelInformationElement);
