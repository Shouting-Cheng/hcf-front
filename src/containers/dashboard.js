import { messages } from "utils/utils";
/**
 * Created by zaranengap on 2017/7/4.
 */
import React from 'react'
import { connect } from 'dva'
import { Row, Col, Card, Icon, Carousel, DatePicker, message } from 'antd';
import { Bar, WaterWave } from 'components/Charts';
const { MonthPicker } = DatePicker;
import 'styles/dashboard.scss'
import httpFetch from 'share/httpFetch'
import config from 'config'
import recentImg from 'images/dashboard/recent.png'
import recentBlankImg from 'images/dashboard/recent-blank.png'
import dashboardService from 'containers/dashboard.service'
import myAccountImg from 'images/dashboard/my-account.png'
import businessCardImg from 'images/dashboard/business-card.png'
import approveImg from 'images/dashboard/approve.png'
import editingImg from 'images/dashboard/editing.png'
import constants from 'share/constants'
// import menuRoute from 'routes/menuRoute'
// import expenseService from 'containers/my-account/expense.service'

class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      businessCardEnabled: false,
      imgBasicHeight: 712,
      imgBasicWidth: 1242,
      carousels: [],
      imgStyle: [],
      cardHeight: 150,
      recentList: ['记一笔', '休假申请单', '报销单', '安全设置'],
      waitForVerify: {
        sum: 55,
        data: [
          { x: "TOP1", y: 1111 }, { x: "TOP2", y: 1021 }, { x: "TOP3", y: 750 }, { x: "TOP4", y: 600 }, { x: "TOP5", y: 578 },
          { x: "TOP6", y: 570 }, { x: "TOP7", y: 500 }, { x: "TOP8", y: 500 }, { x: "TOP9", y: 480 }, { x: "TOP10", y: 300 }
        ]
      },
      loanAndRepayment: {
        date: '2018-03',
        loan: {
          sum: 10,
          amount: 4191.11,
          data: [
            { amount: 1000 }, { amount: 800 }, { amount: 800 }, { amount: 600 }, { amount: 600 }
          ]
        },
        repayment: {
          sum: 12,
          amount: 3200.22
        }
      },
      waitForSubmit: {
        expenseNumber: 0,
        totalAmount: 0
      },
      businessCard: {
        expenseNumber: 0,
        totalAmount: 0
      },
      waitForApproveNum: 0,
      pendSubmitList: {
        page: 1,
        size: 10,
        sum: 0,
        total: 0,
        loading: false,
        data: []
      }
    };
  }

  componentWillMount() {
    this.getAccountBookData();
    this.getBusinessCardData();
    this.getWaitForApproveNum();
    this.getPendSubmitList();
    // expenseService.getBusinessCardStatus().then(res => {
    //   this.setState({ businessCardEnabled: res.data.rows })
    // });
  }

  getAccountBookData = () => {
    dashboardService.getAccountBook().then(res => {
      this.setState({ waitForSubmit: res.data })
    })
  };

  getBusinessCardData = () => {
    dashboardService.getBusinessCard().then(res => {
      this.setState({ businessCard: res.data })
    })
  };

  getWaitForApproveNum = () => {
    dashboardService.getWaitForApproveNum().then(res => {
      this.setState({ waitForApproveNum: res.data })
    })
  };

  getPendSubmitList = () => {
    const { pendSubmitList } = this.state;
    pendSubmitList.loading = true;
    this.setState({ pendSubmitList });
    dashboardService.getPendSubmitList(pendSubmitList.page, pendSubmitList.size).then(res => {
      pendSubmitList.loading = false;
      if (res.data.entityPlainList.length === 0 && pendSubmitList.data.length !== 0) {
        message.error('没有更多数据了');
      } else {
        pendSubmitList.data = pendSubmitList.data.concat(res.data.entityPlainList);
        pendSubmitList.sum = res.data.sum;
        pendSubmitList.page++;
        pendSubmitList.total = res.data.total;
      }
      this.setState({ pendSubmitList });
    })
  };

  componentDidMount() {
    // const { imgBasicHeight, imgBasicWidth } = this.state;
    // let percent = imgBasicHeight / imgBasicWidth;  //图片长宽比
    // let cardWidth = (document.getElementsByClassName('helios-content')[0].clientWidth - 60) / 3;  //内容区域每张Card宽度
    // let cardHeight = cardWidth * percent;  //每张Card高度
    // this.setState({ cardHeight });
    // dashboardService.getCarouselsByCompany(this.props.user.companyOID).then(res => {
    //   if(res.data.length > 0){
    //     res.data.map((item, index) => {
    //       //预加载图片获得图片尺寸，并根据比例调整显示高宽
    //       let img = new Image();
    //       img.src = item.attachmentDTO.fileURL;
    //       img.onload = () => {
    //         let { height, width } = img;  //图片尺寸
    //         if(height + width > 1){
    //           let { imgStyle } = this.state;
    //           if(height / width < percent){  //需固定高度并且平移x居中图片
    //             let targetWidth = cardHeight * width / height;
    //             imgStyle[index] = { height: cardHeight, width: targetWidth, left: - (targetWidth - cardWidth) / 2 };
    //           }
    //           if(height / width > percent){  //需固定宽度与底部
    //             let targetHeight = cardWidth * height / width;
    //             imgStyle[index] = { width: cardWidth, height: targetHeight,bottom:0 };
    //           }
    //           this.setState({ imgStyle });
    //         }
    //       };
    //     });
    //   }
    //   this.setState({ carousels: res.data })
    // })
  }

  handleChangeLoanMonth = () => {

  };

  // 鼠标横向滚动交互
  onwheel = (event) => {
    let divContainer = this.refs.divContainer;
    let step = 50;
    if (event.deltaX < 0 || event.deltaX > 0) {
      //保留触摸横向滚动
      return
    } else {
      event.preventDefault();
      if (event.deltaY < 0 && event.deltaX == 0) {
        divContainer.scrollLeft -= step;
      } else {
        divContainer.scrollLeft += step;
      }
    }
  }
  goDocumentDetail = (item) => {
    let url;
    if (Number(item.formType) < 3000) {
      url = menuRoute.getRouteItem('request-edit').url.replace(':formOID', item.formOID).replace(':applicationOID', item.entityOID);
    } else {
      url = menuRoute.getRouteItem('expense-report-detail').url.replace(':expenseReportOID', item.entityOID);
    }
    this.context.router.push(url)
  };

  render() {
    const {
      carousels, cardHeight, imgStyle, recentList, businessCardEnabled,
      waitForVerify, loanAndRepayment, waitForSubmit, businessCard, waitForApproveNum, pendSubmitList
    } = this.state;
    const cardStyle = { height: cardHeight };
    let recentItemHeight = (cardHeight - 70) / 4;
    const recentItemStyle = { height: recentItemHeight, lineHeight: recentItemHeight + 'px' };
    return (
      <div className="dashboard" style={{backgroundColor: "#F0F2F5", padding: 20}}>
       
        <Row gutter={10} type="flex" align="top">
          {/*<Col span={8}>*/}
          {/*<Card style={cardStyle}>*/}
          {/*<div className="card-title">Hi, 这里是最新消息<a className="all-message">全部消息</a></div>*/}
          {/*<div className="card-content">*/}
          {/*</div>*/}
          {/*</Card>*/}
          {/*</Col>*/}
          {/*<Col span={8}>*/}
          {/*<Card className="carousels" style={cardStyle} >*/}
          {/*{carousels.length > 0 ? <Carousel style={cardStyle}>*/}
          {/*{carousels.map((item, index) => {*/}
          {/*return (*/}
          {/*<div className="carousel" key={item.id} >*/}
          {/*<img src={item.attachmentDTO.fileURL} style={imgStyle[index]}/>*/}
          {/*<div className="carousel-title" style={{ top: `${cardHeight - 40}` }}>{item.title}</div>*/}
          {/*</div>*/}
          {/*)*/}
          {/*})}*/}
          {/*</Carousel> : null}*/}
          {/*</Card>*/}
          {/*</Col>*/}
          {/*<Col span={8}>*/}
          {/*<Card style={cardStyle}>*/}
          {/*<div className="card-title">最近使用</div>*/}
          {/*<div className="card-content">*/}
          {/*{recentList.map((item, index) => <div className="recent-item" style={recentItemStyle} key={index}>{item}</div>)}*/}
          {/*<img className="recent-img" src={recentList.length === 0 ? recentBlankImg : recentImg}/>*/}
          {/*</div>*/}
          {/*</Card>*/}
          {/*</Col>*/}

          {/*<Col span={12}>*/}
          {/*<Card className="chart-card">*/}
          {/*<div className="card-title">*/}
          {/*待审核单据<br/>*/}
          {/*<span>{waitForVerify.sum}</span>笔*/}
          {/*</div>*/}
          {/*<div className="card-content">*/}
          {/*<Bar*/}
          {/*height={200}*/}
          {/*data={waitForVerify.data}*/}
          {/*/>*/}
          {/*</div>*/}
          {/*</Card>*/}
          {/*</Col>*/}

          {/*<Col span={12}>*/}
          {/*<Card className="chart-card loan-card">*/}
          {/*<div className="card-title">*/}
          {/*借还款管理*/}
          {/*</div>*/}
          {/*<MonthPicker onChange={this.handleChangeLoanMonth}/>*/}
          {/*<div className="card-content">*/}
          {/*<Row gutter={20}>*/}
          {/*<Col span={8}>*/}
          {/*<div className="water-wave-container">*/}
          {/*<WaterWave*/}
          {/*height={160}*/}
          {/*title="差额统计"*/}
          {/*percent={34}*/}
          {/*/>*/}
          {/*</div>*/}
          {/*</Col>*/}
          {/*<Col span={8} className="loan-content">*/}
          {/*<div style={{marginTop: 30}}><span>借款单：</span>{loanAndRepayment.loan.sum}笔</div>*/}
          {/*<div><span>还款单：</span>{loanAndRepayment.repayment.sum}笔</div>*/}
          {/*<div style={{marginTop: 25  }}><span>借款金额：</span>{loanAndRepayment.loan.amount}</div>*/}
          {/*<div><span>还款金额：</span>{loanAndRepayment.repayment.amount}</div>*/}
          {/*</Col>*/}
          {/*<Col span={8} className="loan-content">*/}
          {/*<div className="loan-title">借款单金额TOP10</div>*/}
          {/*{loanAndRepayment.loan.data.map((loan, index) => (*/}
          {/*<Row key={index}>*/}
          {/*<Col span={12} className="loan-top-title">TOP{index + 1}</Col>*/}
          {/*<Col style={{textAlign: 'right'}} span={12}>{this.filterMoney(loan.amount)}</Col>*/}
          {/*</Row>*/}
          {/*))}*/}
          {/*</Col>*/}
          {/*</Row>*/}
          {/*</div>*/}
          {/*</Card>*/}
          {/*</Col>*/}

          <Col span={8}>
            <Card>
              <div className="card-title">
                {messages('main.bill')/*账单*/}
              </div>
              <div className="card-content">
                <div className="amount-card">
                  <img src={myAccountImg} />
                  <div className="amount-title"><b>{waitForSubmit.expenseNumber}</b>{messages('main.wait.for.submit')/*笔待报销费用*/}</div>
                  <div className="amount-detail">{this.filterMoney(waitForSubmit.totalAmount)}</div>
                </div>
              </div>
            </Card>
          </Col>

          {businessCardEnabled && (
            <Col span={8}>
              <Card>
                <div className="card-title">
                  {messages('main.business.card')/*商务卡*/}
                </div>
                <div className="card-content">
                  <div className="amount-card">
                    <img src={businessCardImg} />
                    <div className="amount-title"><b>{businessCard.expenseNumber}</b>{messages('main.business.card.record')/*笔待处理商务卡费用*/}</div>
                    <div className="amount-detail">{this.filterMoney(businessCard.totalAmount)}</div>
                  </div>
                </div>
              </Card>
            </Col>
          )}

          <Col span={8}>
            <Card>
              <div className="card-title">
                {messages('main.approve')/*审批*/}
              </div>
              <div className="card-content">
                <div className="amount-card">
                  <img src={approveImg} />
                  <div className="amount-title" style={{ height: 60, lineHeight: '60px' }}><b>{waitForApproveNum}</b>{messages('main.wait.for.approve')/*笔待审批单据*/}</div>
                </div>
              </div>
            </Card>
          </Col>

          <Col span={24}>
            <Card className="document-card">
              <div className="card-title">
                待提报单据
              </div>
              <div className="card-content" onWheel={this.onwheel} ref="divContainer">
                {pendSubmitList.data.map(item => (
                  <div className="application-item" key={item.entityOID} onClick={() => this.goDocumentDetail(item)}>
                    <div className="application-date">{new Date(item.lastModifiedDate).format('yyyy-MM-dd')}</div>
                    <div className="application-form-name">{item.formName}</div>
                    <div className="application-amount">{item.currencyCode}&nbsp;{this.filterMoney(item.totalAmount)}</div>
                    <div className="application-business-code">{item.businessCode}</div>
                    <div className="application-operate">
                      <img src={editingImg} />{constants.getTextByValue(Number(item.status + '' + item.rejectType), 'documentStatus')}</div>
                  </div>
                ))}
                <div className="document-icon" onClick={this.getPendSubmitList}>
                  <Icon type={pendSubmitList.loading ? 'loading' : 'forward'} />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.login.user
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(Dashboard);
