/**
 * Created by zaranengap on 2017/7/4.
 */
import React from 'react'
import { connect } from 'dva'
import { Row, Col, Card, Carousel, Tabs, DatePicker, Tag, Icon } from 'antd';
import 'styles/dashboard.scss'
import moment from "moment"
import userImage from "images/user1.png"
import FileSaver from 'file-saver';

import service from "./dashboard.service"


const TabPane = Tabs.TabPane;
const { MonthPicker } = DatePicker;

import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Guide,
  Shape,
  Facet,
  Util
} from "bizcharts";

import DataSet from "@antv/data-set";


class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      timerStr: "",
      height: 0,
      backList: [1, 2, 5, 6, 7, 8, 9, 0, 9],
      hello: "",
      chartsType: 1,    //1.饼状图   2.折线图
      timeType: 3,      //1.本月 2.本季 3.全年
      startTime: null,
      endTime: null,
      carousels: [],   //公告信息
      barData: [
        {
          year: "一月",
          sales: 38
        },
        {
          year: "二月",
          sales: 52
        },
        {
          year: "三月",
          sales: 61
        },
        {
          year: "四月",
          sales: 145
        },
        {
          year: "五月",
          sales: 48
        },
        {
          year: "六月",
          sales: 38
        },
        {
          year: "七月",
          sales: 30
        },
        {
          year: "八月",
          sales: 200
        },
        {
          year: "九月",
          sales: 100
        },
        {
          year: "十月",
          sales: 140
        },
        {
          year: "十一月",
          sales: 320
        },
        {
          year: "十二月",
          sales: 246
        }
      ],
      cols: {
        sales: {
          tickInterval: 40
        }
      }
    }
  }

  changeTimeType = (type) => {

    if (type == 1) {
      this.setState({ startTime: moment(moment().format("YYYY-MM")), endTime: moment(moment().format("YYYY-MM")) });
    } else if (type == 2) {

      let month = moment().month();

      let tmp = Math.ceil(month / 3);

      let year = moment().year();

      if (tmp == 1) {
        this.setState({ startTime: moment(year + "-" + "01"), endTime: moment(year + "-" + "03") });
      } else if (tmp == 2) {
        this.setState({ startTime: moment(year + "-" + "04"), endTime: moment(year + "-" + "06") });
      } else if (tmp == 3) {
        this.setState({ startTime: moment(year + "-" + "07"), endTime: moment(year + "-" + "09") });
      } else if (tmp == 4) {
        this.setState({ startTime: moment(year + "-" + "10"), endTime: moment(year + "-" + "12") });
      }
    } else if (type == 3) {
      let year = moment().year();
      this.setState({ startTime: moment(year + "-" + "01"), endTime: moment(year + "-" + "12") });
    }

    this.setState({ timeType: type });
  }

  componentDidMount() {

    this.getCurrentDate();
    this.getCarousels();

    let year = moment().year();
    this.setState({ startTime: moment(year + "-" + "01"), endTime: moment(year + "-" + "12") });
  }


  getCarousels = () => {
    service.getCarouselsByCompany(this.props.company.companyOID).then(res => {
      this.setState({ carousels: res.data });
    })
  }

  renderDate = () => {

    const { timeType, startTime, endTime } = this.state;

    return (
      <div>
        <span onClick={() => { this.changeTimeType(1) }} style={{ marginRight: 20, cursor: "pointer", color: timeType == 1 ? "#1890ff" : "#000" }}>本月</span>
        <span onClick={() => { this.changeTimeType(2) }} style={{ marginRight: 20, cursor: "pointer", color: timeType == 2 ? "#1890ff" : "#000" }}>本季</span>
        <span onClick={() => { this.changeTimeType(3) }} style={{ marginRight: 20, cursor: "pointer", color: timeType == 3 ? "#1890ff" : "#000" }}>全年</span>
        <MonthPicker
          style={{ marginRight: 20 }}
          placeholder="开始日期"
          value={startTime}
        />
        <MonthPicker placeholder="结束日期" value={endTime} />
      </div>
    )
  }

  downloadImage = () => {

    var ctx = document.querySelector(".data canvas");
    var dataURL = ctx.toDataURL("image/png", 1.0);

    FileSaver.saveAs(dataURL, "费用趋势.png");

  }

  //获取当前时间
  getCurrentDate() {

    let date = new Date();

    let hours = date.getHours();

    let hello = "";

    if (hours >= 6 && hours <= 11) {
      hello = "早上好";
    } else if (hours == 12) {
      hello = "中午好";
    } else if (hours > 12 && hours < 18) {
      hello = "下午好";
    } else {
      hello = "晚上好";
    }

    let time = moment(date).format("YYYY-MM-DD dddd");

    this.setState({ timerStr: time, hello });
  }


  renderBar = () => {
    return (
      <Chart height={360} padding={[60, 60, 60, 60]} data={this.state.barData} scale={this.state.cols} forceFit>
        <Axis name="year" />
        <Axis name="sales" />
        <Tooltip
          crosshairs={{
            type: "y"
          }}
        />
        <Geom type="interval" position="year*sales" />
      </Chart>
    )
  }

  renderLine = () => {

    const cols = {
      value: {
        min: 0
      },
      year: {
        range: [0, 1]
      }
    };

    const data = [
      {
        year: "1991",
        value: 3
      },
      {
        year: "1992",
        value: 4
      },
      {
        year: "1993",
        value: 3.5
      },
      {
        year: "1994",
        value: 5
      },
      {
        year: "1995",
        value: 4.9
      },
      {
        year: "1996",
        value: 6
      },
      {
        year: "1997",
        value: 7
      },
      {
        year: "1998",
        value: 9
      },
      {
        year: "1999",
        value: 13
      }
    ];

    return (
      <Chart height={360} padding={[60, 60, 60, 60]} data={data} scale={cols} forceFit>
        <Axis name="year" />
        <Axis name="value" />
        <Tooltip
          crosshairs={{
            type: "y"
          }}
        />
        <Geom type="line" position="year*value" size={2} />
        <Geom
          type="point"
          position="year*value"
          size={4}
          shape={"circle"}
          style={{
            stroke: "#fff",
            lineWidth: 1
          }}
        />
      </Chart>
    )
  }

  render() {

    const { timerStr, backList, hello, chartsType, carousels } = this.state;
    const { user, company } = this.props;

    const { DataView } = DataSet;
    const { Html } = Guide;

    const data = [
      {
        item: "申请单",
        count: 12,
        type: ""
      },
      {
        item: "报销单",
        count: 21
      },
      {
        item: "合同",
        count: 17
      },
      {
        item: "预付款",
        count: 13
      },
      {
        item: "报账单",
        count: 9
      }
    ];

    const dv = new DataView();

    dv.source(data).transform({
      type: "percent",
      field: "count",
      dimension: "item",
      as: "percent"
    });

    return (
      <div className="dashboard-container">
        <Row gutter={12}>
          <Col className="user-info" span={8}>
            <Card
              title="员工信息"
              extra={<span style={{ fontSize: 18 }}>{timerStr}</span>}
            >
              <div className="user-info-box">
                <img style={{ height: 120, width: 120, flex: "0 0 120px" }} src={userImage} />
                <div style={{ height: 180 }} className="user-info">
                  <div className="info-item"><span><Icon type="smile" theme="twoTone" style={{ marginRight: 6 }} />{hello}，{user.fullName}</span></div>
                  <div className="info-item"><span><Icon type="bank" theme="twoTone" style={{ marginRight: 6 }} />{user.companyName}</span></div>
                  <div className="info-item"><span><Icon type="project" theme="twoTone" style={{ marginRight: 6 }} />{user.departmentName}</span></div>
                  <div className="info-item"><Icon type="mail" theme="twoTone" style={{ marginRight: 6 }} /> {user.email}</div>
                  <div className="info-item"><Icon type="mobile" theme="twoTone" style={{ marginRight: 6 }} /> {user.mobile}</div>
                  <div className="info-item" style={{ color: "#888" }}>海纳百川，有容乃大</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Carousel autoplay>
              {carousels.map(item => {
                return (
                  <div style={{ textAlign: "center" }}>
                    <img src={item.attachmentDTO.thumbnailUrl} />
                    <div className="title">{item.title}</div>
                  </div>
                )
              })}
            </Carousel>
          </Col>
          <Col span={8}>
            <Card
              title="待审批的单据"
              extra={<span style={{ fontSize: 18 }}>共72笔</span>}
            >
              <Chart
                data={dv}
                height={160}
                padding={[30, 30, 30, 30]}
                forceFit
              >
                <Coord type={"theta"} innerRadius={0.6} />
                <Tooltip
                  showTitle={false}
                  itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
                />
                <Geom
                  type="intervalStack"
                  position="percent"
                  color="item"
                  tooltip={[
                    "item*percent",
                    (item, percent) => {
                      return {
                        name: item,
                        value: (percent * 100).toFixed(2) + "%"
                      };
                    }
                  ]}
                  style={{
                    lineWidth: 1,
                    stroke: "#fff"
                  }}
                >
                  <Label
                    content="count"
                    formatter={(val, item) => {
                      return item.point.item + ": " + val + "笔";
                    }}
                  />
                </Geom>
              </Chart>
            </Card>
          </Col>
        </Row>
        <Row className="disboard-bottom" style={{ marginTop: 12 }} gutter={12}>
          <Col className="data" span={16}>
            <Card
              title="个人报表"
              extra={this.renderDate()}
            >
              <Tabs defaultActiveKey="1">
                <TabPane tab="费用趋势" key="1">
                  <div style={{ padding: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <Icon onClick={() => { this.setState({ chartsType: 1 }) }} type="bar-chart" style={{ marginRight: 20, fontSize: 18, color: chartsType == 1 ? "#1890ff" : "#000", cursor: "pointer" }} />
                      <Icon onClick={() => { this.setState({ chartsType: 2 }) }} type="line-chart" style={{ fontSize: 18, cursor: "pointer", marginRight: 30, color: chartsType == 2 ? "#1890ff" : "#000" }} />
                      <span onClick={this.downloadImage} style={{ cursor: "pointer" }}>
                        <Icon type="download" style={{ fontSize: 18 }} />导出
                      </span>
                    </div>
                    <div id="bar-chat">
                      {chartsType == 1 ? this.renderBar() : this.renderLine()}
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="费用占比" key="2"></TabPane>
                <TabPane tab="付款状态" key="3"></TabPane>
              </Tabs>
            </Card>
          </Col>
          <Col className="tabs" span={8}>
            <Card
              title="我的单据"
              className="info-card"
            >
              <Tabs defaultActiveKey="1">
                <TabPane tab="被退回的单据(5)" key="1">
                  {backList.map((item, index) => {
                    return (
                      <Card
                        title={<span style={{ fontSize: 14 }}>APPGST1201811110019</span>}
                        extra={<span>2018-11-25</span>}
                        style={{ marginTop: 12 }}
                        key={index}
                      >
                        <Row>
                          <Col span={12}>费用申请单</Col>
                          <Col span={12} style={{ textAlign: "right", fontWeight: 600, fontSize: 16 }}>CNY 2000.00</Col>
                        </Row>
                        <Row style={{ marginTop: 16 }}>
                          <Col span={12}>差旅申请</Col>
                          <Col span={12} style={{ textAlign: "right" }}>
                            <Tag color="#f50">审批驳回</Tag>
                          </Col>
                        </Row>
                        <div style={{ textAlign: "right", marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee" }}>
                          驳回人：财务负责人-清浅
                    </div>
                      </Card>
                    )
                  })}
                </TabPane>
                <TabPane tab="未完成的单据(7)" key="2">
                  <Card
                    title={<span style={{ fontSize: 14 }}>APPGST1201811110019</span>}
                    extra={<span>2018-11-25</span>}
                    style={{ marginTop: 12 }}
                  >
                    <Row>
                      <Col span={12}>费用申请单</Col>
                      <Col span={12} style={{ textAlign: "right" }}>CNY 2000.00</Col>
                    </Row>
                    <Row style={{ marginTop: 16 }}>
                      <Col span={12}>差旅申请</Col>
                      <Col span={12} style={{ textAlign: "right" }}>
                        <Tag color="#f50">审批驳回</Tag>
                      </Col>
                    </Row>
                  </Card>
                  <Card
                    title={<span style={{ fontSize: 14 }}>APPGST1201811110019</span>}
                    extra={<span>2018-11-25</span>}
                    style={{ marginTop: 12 }}
                  >
                    <Row>
                      <Col span={12}>费用申请单</Col>
                      <Col span={12} style={{ textAlign: "right" }}>CNY 2000.00</Col>
                    </Row>
                    <Row style={{ marginTop: 16 }}>
                      <Col span={12}>差旅申请</Col>
                      <Col span={12} style={{ textAlign: "right" }}>
                        <Tag color="#f50">审批驳回</Tag>
                      </Col>
                    </Row>
                  </Card>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>)
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(Dashboard);
