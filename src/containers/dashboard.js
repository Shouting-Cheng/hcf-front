/**
 * Created by zaranengap on 2017/7/4.
 */
import React from 'react'
import { connect } from 'dva'
import { Row, Col, Card, Carousel, Tabs, DatePicker, Tag, Icon, message, Modal } from 'antd';
import 'styles/dashboard.scss'
import moment from "moment"
import userImage from "images/user1.png"
import FileSaver from 'file-saver';

import service from "./dashboard.service"
// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入柱状图
import 'echarts/lib/chart/pie';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/theme/macarons'


const TabPane = Tabs.TabPane;
const { MonthPicker } = DatePicker;

import {
  Chart,
  Geom,
  Axis,
  Tooltip,
} from "bizcharts";

import DataSet from "@antv/data-set";


class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      timerStr: "",
      height: 0,
      backList: [],
      hello: "",
      chartsType: 1,    //1.饼状图   2.折线图
      timeType: 3,      //1.本月 2.本季 3.全年
      startTime: null,
      endTime: null,
      carousels: [],   //公告信息
      unApprovals: [],
      totol: 0,
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
      },
      doingList: []
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
    this.getUnApprovals();
    this.getBackDocument();


    let year = moment().year();
    this.setState({ startTime: moment(year + "-" + "01"), endTime: moment(year + "-" + "12") });
  }

  //渲染待审批单据
  renderPie = (data = []) => {
    var dom = document.getElementById("pie");
    var myChart = echarts.init(dom, "macarons");

    let option = {

      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c}笔 ({d}%)"
      },
      color: [
        '#1890FF',
        '#13C2C2',
        '#2FC25B',
        '#FACC14',
        '#F04864',
        '#8543E0',
        '#3436C7',
        '#223273'],
      series: [
        {
          type: 'pie',
          radius: ['40%', '60%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: '{b}: {c}笔'
          },
          data: data.map(o => ({
            name: o.name,
            value: o.count
          }))
        }
      ]
    };

    myChart.setOption(option, true);
  }

  getDoingDocument = () => {
    service.getDoingDocument().then(res => {
      this.setState({ doingList: res.data });
    }).catch(err => {
      message.error("获取数据失败,请稍后重试！");
    })
  }

  getBackDocument = () => {
    service.getBackDocument().then(res => {
      this.setState({ backList: res.data });
      this.getDoingDocument();
    }).catch(err => {
      message.error("获取数据失败,请稍后重试！");
      this.getDoingDocument();
    })
  }


  getUnApprovals = () => {
    service.getUnApprovals().then(res => {
      this.setState({ total: res.data.totalCount, unApprovals: res.data.approvalDashboardDetailDTOList });
      this.renderPie(res.data.approvalDashboardDetailDTOList);
    }).catch(err => {
      message.error("获取待审批列表失败,请稍后重试！");
    })
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

  goCarouselDetail = (item) => {
    if (!!item.carouselOID) {
      if (item.outLinkUrl) {
        window.open(item.outLinkUrl, '_blank');
      }
      else {
        service.getCatouselsContent(item.carouselOID).then((res) => {
          if (res.status === 200) {
            item.content = res.data.content;
            item.localDate = moment(res.data.createdDate).format('YYYY-MM-DD');
            Modal.info({
              title: item.title,
              content: (
                <div className="carousel-modal">
                  <p>{item.localDate}</p>
                  <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
                </div>
              )
            });
          }
        });
      }
    }
  };

  render() {

    const { timerStr, backList, hello, chartsType, carousels, total, unApprovals, doingList } = this.state;
    const { user } = this.props;

    const { DataView } = DataSet;

    const dv = new DataView();

    dv.source(unApprovals).transform({
      type: "percent",
      field: "count",
      dimension: "name",
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
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            {(carousels && !!carousels.length) ? (
              <Carousel arrows autoplay>
                {carousels.map(item => {
                  return (
                    <div onClick={() => this.goCarouselDetail(item)} key={item.id} style={{ textAlign: "center" }}>
                      <img src={item.attachmentDTO.thumbnailUrl} />
                      <div className="title">{item.title}</div>
                    </div>
                  )
                })}
              </Carousel>
            ) : (
                <div style={{ height: 260, fontSize: 18, lineHeight: "260px", textAlign: "center", backgroundColor: "#fff" }}>
                  暂无公告信息
              </div>
              )}
          </Col>
          <Col span={8}>
            <Card
              title="待审批的单据"
              extra={<span style={{ fontSize: 18 }}>共{total}笔</span>}
            >
              <div id="pie" style={{ width: "100%", height: 160 }}></div>
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
                <TabPane tab="费用占比" key="2">

                </TabPane>
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
                <TabPane forceRender key="1" tab={`被退回的单据(${backList.length})`}>
                  {backList.map((item, index) => {
                    return (
                      <Card
                        title={<span style={{ fontSize: 14 }}>{item.code}</span>}
                        extra={<span>{item.createdTime}</span>}
                        style={{ marginTop: 12 }}
                        key={item.id}
                      >
                        <Row>
                          <Col span={12}>{item.name}</Col>
                          <Col span={12} style={{ textAlign: "right", fontWeight: 600, fontSize: 16 }}>{item.currency} {this.filterMoney(item.amount, 2, true)}</Col>
                        </Row>
                        <Row style={{ marginTop: 16 }}>
                          <Col style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} span={14}>{item.remark}</Col>
                          <Col span={10} style={{ textAlign: "right" }}>
                            <Tag color={this.$statusList[item.statusCode].color}>{this.$statusList[item.statusCode].label}</Tag>
                          </Col>
                        </Row>
                        <div style={{ textAlign: "right", marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee" }}>
                          驳回人：{item.nodeName}-{item.rejecterName}
                        </div>
                      </Card>
                    )
                  })}
                </TabPane>
                <TabPane forceRender key="2" tab={`未完成的单据(${doingList.length})`}>
                  <div style={{ height: "100%", overflowY: "auto" }}>
                    {doingList.map((item, index) => {
                      return (
                        <Card
                          title={<span style={{ fontSize: 14 }}>{item.code}</span>}
                          extra={<span>{item.createdTime}</span>}
                          style={{ marginTop: 12 }}
                          key={item.id}
                        >
                          <Row>
                            <Col span={12}>{item.name}</Col>
                            <Col span={12} style={{ textAlign: "right", fontWeight: 600, fontSize: 16 }}>{item.currency} {this.filterMoney(item.amount, 2, true)}</Col>
                          </Row>
                          <Row style={{ marginTop: 16 }}>
                            <Col style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} span={14}>{item.remark}</Col>
                            <Col span={10} style={{ textAlign: "right" }}>
                              <Tag color={this.$statusList[item.statusCode].color}>{this.$statusList[item.statusCode].label}</Tag>
                            </Col>
                          </Row>
                          <div style={{ textAlign: "right", marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee" }}>
                            申请人：{item.nodeName}-{item.rejecterName}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
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
