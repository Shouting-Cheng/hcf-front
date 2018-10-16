import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import config from 'config'
import httpFetch from 'share/httpFetch'
import menuRoute from 'routes/menuRoute'
import { Form, Tabs, Affix, Button, Spin, Row, Col, Tag, Table, message, Timeline, Icon } from 'antd'
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

import moment from 'moment'
import ApproveBar from 'components/template/approve-bar'
import 'styles/request/jd-request-detail.scss'

class JDRequestDetail extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      canApprove: false,
      loading: false,
      passLoading: false,
      rejectLoading: false,
      reCallBtnLoading: false,
      tapValue: 'requestInfo',
      status: [
        {label: '编辑中', value: '10011000', state: 'processing'},
        {label: '已撤回', value: '10011001', state: 'warning'},
        {label: '已驳回', value: '10011002', state: 'error'},
        {label: '审核驳回', value: '10011003', state: 'error'},
        {label: '审批中', value: '10021000', state: 'processing'},
        {label: '已通过', value: '10031000', state: 'success'},
        {label: '审核通过', value: '1004', state: 'success'},
        {label: '已付款', value: '1005', state: 'success'},
        {label: '还款中', value: '1006', state: 'processing'},
        {label: '已还款', value: '1007', state: 'success'},
        {label: '付款中', value: '1008', state: 'processing'},
        {label: '已停用', value: '1009', state: 'default'}
      ],
      columns: [
        {title: '商品', dataIndex: 'name',render: (value, record) => (
          <div>
            <img src={record.imgPath} className="product-img"/>
            {value}
          </div>
        )},
        {title: '商品编号', dataIndex: 'skuId'},
        {title: '价格', dataIndex: 'amount', render: value => <span className="money-cell">{this.state.info.currencyCode} {this.renderMoney(value)}</span>},
        {title: '商品数量', dataIndex: 'count'}
      ],
      data: [],
      info: {}, //申请单详情
      approvalChain: {},  //审批链
      productInfo: {}, //商品详情
      approvalHistory: [], //审批历史
      applicationList: menuRoute.getRouteItem('request','key'), //申请单列表页
    }
  }

  componentWillMount() {
    this.getInfo()
  }

  getInfo = () => {
    this.setState({ loading: true });
    httpFetch.get(`${config.baseUrl}/api/jingdong/order/applications/my/get/${this.props.params.applicationOID}`).then(res => {
      if(res.status === 200) {
        this.setState({
          loading: false,
          info: res.data,
          approvalChain: res.data.approvalChain || {},
          data: res.data.jingDongOrderApplication.jingDongOrder.jingDongCommodities,
          productInfo: res.data.jingDongOrderApplication.jingDongOrder,
          approvalHistory: res.data.approvalHistorys
        })
      }
    })
  };

  //获取审批进度
  getApprovals = () => {};

  //申请单信息／审批进度切换
  handleTabsChange = (tab) => {
    this.setState({ tapValue: tab },() => {
      this.state.topTapValue === 'approvals' && this.getApprovals()
    })
  };

  //审批通过
  handleApprovePass = (values) => {
    this.setState({ passLoading: true });
    httpFetch.post(``).then(res => {
      if (res.status === 200) {
        this.setState({ passLoading: false });
        message.success(this.props.intl.formatMessage({id: "common.operate.success"}/*操作成功*/));
        this.goBack()
      }
    }).catch(e => {
      this.setState({ passLoading: false });
      message.error(`${this.props.intl.formatMessage({id:"common.operate.filed"}/*操作失败*/)}，${e.response.data.message}`)
    })
  };

  //审批驳回
  handleApproveReject = (values) => {
    this.setState({ rejectLoading: true });
    httpFetch.post(``).then(res => {
      if (res.status === 200) {
        this.setState({ rejectLoading: false });
        message.success(this.props.intl.formatMessage({id: "common.operate.success"}/*操作成功*/));
        this.goBack()
      }
    }).catch(e => {
      this.setState({ rejectLoading: false });
      message.error(`${this.props.intl.formatMessage({id:"common.operate.filed"}/*操作失败*/)}，${e.response.data.message}`)
    })
  };

  //撤回
  handleRecall = () => {
    let params = {
      entities:[{
        entityOID: this.state.approvalChain.entityOID,
        entityType: this.state.approvalChain.entityType
      }]
    };
    this.setState({ reCallBtnLoading: true });
    httpFetch.post(`${config.baseUrl}/api/approvals/withdraw`, params).then(res => {
      if(res.status === 200) {
        this.setState({ reCallBtnLoading: false });
        message.success(this.props.intl.formatMessage({id: "common.operate.success"}/*操作成功*/));
        this.goBack()
      }
    }).catch(e => {
      this.setState({ reCallBtnLoading: false });
      message.error(`${this.props.intl.formatMessage({id:"common.operate.filed"}/*操作失败*/)}，${e.response.data.message}`)
    })
  };

  //剩余付款时间
  getRemainingTime = (createDate) => {
    let remainMs = new Date().getTime() - new Date(createDate).getTime();
    let remainDay = 7 - Math.ceil(remainMs / (1000 * 3600 * 24));  // 计算剩余天数,向上取整
    let remainHour = 24 - Math.ceil(remainMs % (1000 * 3600 * 24) / (1000 * 3600));  // 计算除去天数之后剩余小时,向上取整
    if(remainDay < 0) {  //京东订单时间超时
      return <Tag color="#ff0000">订单超时</Tag>
    } else if(remainDay < 1) {
      return <Tag color="#ff9900">剩余付款时间：{remainHour}小时</Tag>
    } else if(remainDay >= 1) {
      return <Tag color="#ff9900">剩余付款时间：{remainDay}天{remainHour}小时</Tag>
    }
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString
  };

  goBack = () => {
    this.context.router.push(this.state.applicationList.url)
  };

  render() {
    const { loading, tapValue, status, columns, data, productInfo, canApprove, info, approvalHistory } = this.state;
    let applicant = info.applicant || {}; //申请人信息
    let requestInfo = (
      <Spin spinning={loading}>
        <div className="top-info">
          <Row className="row-container">
            <span className="top-info-name">{applicant.fullName}</span>
            <span className="detail-info">
              工号：{applicant.employeeID}
              <span className="ant-divider"/>
              部门：{}
              <span className="ant-divider"/>
              法人实体：{}
            </span>
            {!canApprove && <Button type="primary" className="top-info-btn" onClick={this.handleRecall}>撤 回</Button>}
          </Row>
          <Row className="row-container">
            <span className="detail-info detail-info-first">{info.formName}：{info.businessCode}</span>
            <span className="detail-info">提交日期：{moment(info.submittedDate).format('YYYY-MM-DD')}，由 {} 代提</span>
            <span className="detail-info">当前状态：{
              status.map(item => {
                if(item.value === String(info.status) || item.value === String(info.status * 10000 + info.rejectType)) {
                  return item.label
                }
              })
            }</span>
          </Row>
          <Row className="row-container">
            <h3 className="amount">总金额：{info.currencyCode} {this.renderMoney((productInfo.totalAmount || 0) + (productInfo.freight || 0))}</h3>
          </Row>
        </div>
      </Spin>
    );
    let approvals = (
      <Spin spinning={loading}>
        <div className="approvals">
          <Timeline>
            {approvalHistory.map(item => {
              return (
                <Timeline.Item color="green" dot={item.operation === 1001 ? <Icon type="upload" style={{color: '#ff9900'}} /> : ''}>
                  <Row>
                    <Col span={3}>{item.operation}</Col>
                    <Col span={4}>{item.operator.fullName} - {item.operator.employeeID}</Col>
                    <Col span={5}>{moment(item.createdDate).format('YYYY-MM-DD HH:mm:ss')}</Col>
                  </Row>
                </Timeline.Item>
              )
            })}
          </Timeline>
        </div>
      </Spin>
    );
    let detailContent = (
      <Spin spinning={loading}>
        <div className="tab-container top-tab-container">
          <h3 className="sub-header-title">申请单详情</h3>
        </div>
        <div className="tab-container">
          <h3 className="sub-header-title">订单信息</h3>
          <div className="table-header">
            <span className="order-num">订单号：{productInfo.orderNum}</span>
            {this.getRemainingTime(info.jingDongOrderApplication && info.jingDongOrderApplication.createdDate)}
          </div>
          <Table rowKey={(record, index)=> index}
                 columns={columns}
                 dataSource={data}
                 scroll={{x: true}}
                 pagination={false}
                 bordered
                 size="middle"/>
          <div className="amount-info">
            <Row>
              <Col span={3} className="amount">{info.currencyCode} {this.renderMoney(productInfo.totalAmount || 0)}</Col>
              <Col span={2} className="amount-title">商品总额：</Col>
            </Row>
            <Row>
              <Col span={3} className="amount">{info.currencyCode} {this.renderMoney(productInfo.freight || 0)}</Col>
              <Col span={2} className="amount-title">运费：</Col>
            </Row>
            <Row>
              <Col span={3} className="amount total">{info.currencyCode} {this.renderMoney((productInfo.totalAmount || 0) + (productInfo.freight || 0))}</Col>
              <Col span={2} className="amount-title total">总计金额：</Col>
            </Row>
          </div>
        </div>
      </Spin>
    );
    return (
      <div className="jd-request-detail background-transparent">
        <div className="tabs-info">
          <Tabs onChange={this.handleTabsChange}>
            <TabPane tab="申请单信息" key="requestInfo">{requestInfo}</TabPane>
            <TabPane tab="审批进度" key="approvals">{approvals}</TabPane>
          </Tabs>
        </div>
        {tapValue === 'requestInfo' && (
          <Tabs className="detail-tabs">
            <TabPane tab="详情" key="detail">{detailContent}</TabPane>
          </Tabs>
        )}
        {canApprove && (
          <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve">
            <Row>
              <Col span={18}>
                <ApproveBar handleApprovePass={this.handleApprovePass}
                            handleApproveReject={this.handleApproveReject}/>
              </Col>
              <Col span={4}>
                <Button onClick={this.goBack}>返回</Button>
              </Col>
            </Row>
          </Affix>
        )}
        {!canApprove && (
          <Affix offsetBottom={0} className="bottom-bar">
            <Button type="primary" className="back-btn" onClick={this.goBack}>返回</Button>
          </Affix>
        )}
      </div>
    )
  }
}

JDRequestDetail.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return { }
}

const wrappedJDRequestDetail = Form.create()(injectIntl(JDRequestDetail));

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedJDRequestDetail)
