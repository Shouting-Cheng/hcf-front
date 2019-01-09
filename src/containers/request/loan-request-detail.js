/**
 * Created by zaranengap on 2017/11/14
 */
import React  from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router"
import { injectIntl } from 'react-intl';
import httpFetch from 'share/httpFetch'
import config from 'config'
import 'styles/request/loan-request-detail.scss'
import moment from 'moment'
import SlideFrame from 'components/Widget/slide-frame'
import NewRepaymentFrame from 'containers/request/new-repayment-frame'
import RepaymentDetailFrame from 'containers/request/repayment-detail-frame'

import {  Tabs, Icon, Spin, Row, Col, Timeline, Button, Affix, Badge } from 'antd'
import Table from 'widget/table'
const TabPane = Tabs.TabPane;

class LoanRequestDetail extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      repaymentLoading: false,
      showSlideFrame: false,
      showRepaymentDetail: false,
      newParams: {},
      frameParams: {},
      tapValue: 'requestInfo',
      activeKey: 'detail',
      tabs: [
        {key: 'info', name: '申请单信息'},
        {key: 'status', name: '审批进度'}
      ],
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
        {title: '', dataIndex: 'd1'},
        {title: '费用类型', dataIndex: 'd2'},
        {title: '币种', dataIndex: 'd3'},
        {title: '金额', dataIndex: 'd4'},
        {title: '汇率', dataIndex: 'd5'},
        {title: '本币金额', dataIndex: 'd6'}
      ],
      data: [],
      repaymentColumns: [
        {title: '日期', dataIndex: 'createDate', render: value => moment(value).format('YYYY-MM-DD')},
        {title: '还款单号', dataIndex: 'businessCode'},
        {title: '还款方式', dataIndex: 'type', render: value => value === '0' ? '现金还款' : value === '1' ? '转账还款' : '报销单还款'},
        {title: '币种', dataIndex: 'curreny'},
        {title: '还款金额', dataIndex: 'repaymentValue', render: this.filterMoney},
        {title: '状态', dataIndex: 'status', render: value => value === '1001' ? <Badge text="还款中" status="warning"/> :
          value === '1002' ?  <Badge text="已还款" status="success"/> : <Badge text="被驳回" status="error"/>},
      ],
      repaymentData: [],
      form: {},
      applicant: {},
      tab: 'info',
      bottomLoading: true,
      fields: [],
      repaymentList: [],
      info: {},
      approvalHistory: [],
      //applicationList: menuRoute.getRouteItem('request','key'), //申请单列表页
    }
  }

  componentWillMount(){
    this.getInfo();
    this.getRepayment()
  }

  getInfo = () => {
    this.setState({ loading: true });
    httpFetch.get(`${config.baseUrl}/api/loan/application/${this.props.params.applicationOid}`).then(res => {
      this.setState({
        loading: false,
        info: res.data,
        approvalHistory: res.data.approvalHistorys,
        newParams: {
          currency: res.data.currencyCode,
          amount: res.data.writeoffArtificialDTO.stayWriteoffAmount
        }
      })
    })
  };

  //还款记录
  getRepayment = () => {
    this.setState({ repaymentLoading: true });
    httpFetch.get(`${config.baseUrl}/api/repayment/list?page=0&size=10&loanApplicationOid=${this.props.params.applicationOid}`).then(res => {
      this.setState({
        repaymentLoading: false,
        repaymentData: res.data
      })
    })
  };

  getApprovalStatus = () => {
    const { approvalHistorys } = this.state.form;
    approvalHistorys.map(history => {
      let operation = history.operation;
      if(operation === 1001){
        history.text = "提交";
        history.icon = "up-circle";
        history.color = "#4CA8BC"
      }
      if(operation === 1002){
        history.text = "撤回";
        history.icon = "down-circle";
        history.color = "#EBA945"
      }
      if(operation === 2001){
        history.text = "审批通过";
        history.icon = "check-circle";
        history.color = "#5EBD93"
      }
      if(operation === 2002){
        history.text = "审批驳回";
        history.icon = "close-circle";
        history.color = "#E57670"
      }
      if(operation === 3001){
        history.text = "审核通过";
        history.icon = "check-circle";
        history.color = "#5EBD93"
      }
      if(operation === 4000){
        history.text = "财务付款中";
        history.icon = "clock-circle";
        history.color = "#63B8EE"
      }
      if(operation === 4001){
        history.text = "财务付款";
        history.icon = "pay-circle";
        history.color = "#A191DA"
      }
      if(operation === 5005){
        history.text = "企业停用";
        history.icon = "minus-circle";
        history.color = "#E57670"
      }
    });
    this.setState({ approvalHistorys })
  };

  getFieldsValue = () => {
    const fields = [].concat(this.state.form.custFormValues);
    let count = 0;
    fields.map(field => {
      switch(field.messageKey){
        case 'select_corporation_entity':
          field.value && httpFetch.get(`${config.baseUrl}/api/my/company/receipted/invoice/${field.value}`).then(res => {
            field.text = res.data.companyName;
            ++count === fields.length && this.setState({ bottomLoading: false, fields });
          });
          break;
        case 'contact_bank_account':
          field.value && httpFetch.get(`${config.baseUrl}/api/contact/bank/account/${field.value}`).then(res => {
            field.text = res.data.bankAccountNo;
            ++count === fields.length && this.setState({ bottomLoading: false, fields });
          });
          break;
        case 'total_budget':
          field.text = this.filterMoney(field.value);
          ++count === fields.length && this.setState({ bottomLoading: false, fields });
          break;
        case 'date':
          field.text = new Date(field.value).format('yyyy-MM-dd');
          ++count === fields.length && this.setState({ bottomLoading: false, fields });
          break;
        case 'select_approver':
          field.value && httpFetch.get(`${config.baseUrl}/api/users/oids?userOids=${field.value}`).then(res => {
            field.text = res.data.length ? res.data[0].fullName : '';
            ++count === fields.length && this.setState({ bottomLoading: false, fields });
          });
          break;
        case 'select_cost_center':
          field.value && httpFetch.get(`${config.baseUrl}/api/dimension/item/${field.value}`).then(res => {
            field.text = res.data.dimensionItem.dimensionItemName;
            ++count === fields.length && this.setState({ bottomLoading: false, fields });
          });
          break;
        default:
          field.text = field.value;
          ++count === fields.length && this.setState({ bottomLoading: false, fields });
      }
    });
  };

  onChangeTabs = (key) => {
    this.setState({ tab: key })
  };

  //申请单信息／审批进度切换
  handleTabsChange = (tab) => {
    this.setState({ tapValue: tab },() => {
      this.state.topTapValue === 'approvals' && this.getApprovals()
    })
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString
  };

  showSlide = (flag) => {
    this.setState({ showSlideFrame: flag })
  };

  //去还款
  toRepayment = () => {
    this.setState({
      activeKey: 'repayment',
      showSlideFrame: true
    })
  };

  onDetailTabsChange = (value) => {
    this.setState({ activeKey: value })
  };

  showDetailSlide = (flag) => {
    this.setState({ showRepaymentDetail: flag })
  };

  handleCloseSlide = () => {};

  handleRowClick = (record) => {
    this.setState({
      showRepaymentDetail: true,
      frameParams: {id: record.repaymentOid}
    })
  };

  goBack = () => {
    //this.context.router.push(this.state.applicationList.url)
  };

  render(){
    const { loading, repaymentLoading, showSlideFrame, showRepaymentDetail, newParams, frameParams, tapValue, activeKey, status, columns, data, repaymentColumns, repaymentData, info, approvalHistory } = this.state;
    let applicant = info.applicant || {}; //申请人信息
    let writeoffInfo = info.writeoffArtificialDTO || {}; //还款信息
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
            <Button type="primary" className="top-info-btn" onClick={this.handleRecall}>撤 回</Button>
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
            <Icon type="link" className="link-icon"/>
            <a>申请单：{info.referenceApplication && info.referenceApplication.businessCode}</a>
          </Row>
          <Row className="row-container">
            <span className="amount">总金额：{info.currencyCode} {this.renderMoney(info.totalAmount || 0)}</span>
            {writeoffInfo.hasWriteoffAmount !== info.totalAmount && (
              <span>
                {writeoffInfo.hasWriteoffAmount ? `已还款：${this.renderMoney(writeoffInfo.hasWriteoffAmount)}` : ''}
                {writeoffInfo.hasWriteoffAmount ? <span className="ant-divider"/> : ''}
                {writeoffInfo.lockedWriteoffAmount ? <span style={{color: '#00a854'}}>还款中：{this.renderMoney(writeoffInfo.lockedWriteoffAmount)}</span> : ''}
                {writeoffInfo.lockedWriteoffAmount && writeoffInfo.stayWriteoffAmount ? <span className="ant-divider"/> : ''}
                {writeoffInfo.stayWriteoffAmount ? (
                  <span>
                    <span style={{color: '#108ee9', marginRight: 10}}>待还款：{this.renderMoney(writeoffInfo.stayWriteoffAmount)}</span>
                    <a onClick={this.toRepayment}>去还款 ></a>
                  </span>
                ) : ''}
              </span>
            )}
            {writeoffInfo.hasWriteoffAmount === info.totalAmount && (
              <span>
              <Icon type="check-circle-o" className="repayment-all-icon" />已全额还款
            </span>
            )}
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
                <Timeline.Item color="green">
                  <Row>
                    <Col span={3}>{}</Col>
                    <Col span={4}>{}</Col>
                    <Col span={5}>{}</Col>
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
        <div className="tab-container">
          <h3 className="sub-header-title">申请单详情</h3>
          <Table rowKey="id"
                 columns={columns}
                 dataSource={data}
                 pagination={false}
                 bordered
                 size="middle"/>
        </div>
      </Spin>
    );
    let repaymentContent = (
      <div className="tab-container">
        <h3 className="sub-header-title">还款记录</h3>
        <div className="table-header">
          <div className="table-header-buttons">
            {writeoffInfo.stayWriteoffAmount ? <Button type="primary" className="table-header-btn" onClick={() => this.showSlide(true)}>去还款</Button> : ''}
          </div>
        </div>
        <Table rowKey="id"
               columns={repaymentColumns}
               dataSource={repaymentData}
               loading={repaymentLoading}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               bordered
               size="middle"/>
      </div>
    );
    return(
      <div className="loan-request-detail background-transparent">
        <div className="tabs-info">
          <Tabs onChange={this.handleTabsChange}>
            <TabPane tab="申请单信息" key="requestInfo">{requestInfo}</TabPane>
            <TabPane tab="审批进度" key="approvals">{approvals}</TabPane>
          </Tabs>
        </div>
        {tapValue === 'requestInfo' && (
          <Tabs className="detail-tabs" activeKey={activeKey} onChange={this.onDetailTabsChange}>
            <TabPane tab="申请单详情" key="detail">{detailContent}</TabPane>
            <TabPane tab="还款记录" key="repayment">{repaymentContent}</TabPane>
          </Tabs>
        )}
        <SlideFrame title="新建还款"
                    show={showSlideFrame}
                    content={NewRepaymentFrame}
                    params={newParams}
                    afterClose={this.handleCloseSlide}
                    onClose={() => this.showSlide(false)}/>
        <SlideFrame title="还款详情"
                    show={showRepaymentDetail}
                    content={RepaymentDetailFrame}
                    params={frameParams}
                    afterClose={this.handleCloseSlide}
                    onClose={() => this.showDetailSlide(false)}/>
        <Affix offsetBottom={0} className="bottom-bar">
          <Button type="primary" className="back-btn" onClick={this.goBack}>返回</Button>
        </Affix>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(injectIntl(LoanRequestDetail));
