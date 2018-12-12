import React from 'react'
import { Form, Tabs, Button,Card, Menu, Affix,Radio, Dropdown, Row, Col, Spin, Timeline, message, Popover, Popconfirm, Icon, Select } from 'antd'
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
import moment from 'moment'
import SlideFrame from 'components/Widget/slide-frame'
import 'styles/reimburse/reimburse-common.scss'
import 'styles/contract/my-contract/contract-detail.scss'
import AccountingInfo from "containers/reimburse/reimburse-review/accounting-info"
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import ListSelector from 'containers/reimburse/my-reimburse/list-selector'
import ApproveHistory from "containers/reimburse/reimburse-review/approve-history-work-flow"
import {routerRedux} from "dva/router";
import PropTypes from 'prop-types';
import {connect} from "dva/index";

class ReimburseReviewDetailCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: false,
      planLoading: false,
      topTapValue: 'contractInfo',
      headerData: {},
      contractEdit: false, //合同是否可编辑
      contractStatus: {
        6002: { label: this.$t({ id: "my.contract.state.cancel" }/*已取消*/), state: 'default' },
        6003: { label: this.$t({ id: "my.contract.state.finish" }/*已完成*/), state: 'success' },
        1001: { label: this.$t({ id: "my.contract.state.generate" }/*编辑中*/), state: 'processing' },
        6001: { label: this.$t({ id: "my.contract.state.hold" }/*暂挂*/), state: 'warning' },
        1002: { label: this.$t({ id: "my.contract.state.submitted" }/*审批中*/), state: 'processing' },
        1005: { label: this.$t({ id: "my.contract.state.rejected" }/*已驳回*/), state: 'error' },
        1004: { label: this.$t({ id: "my.contract.state.confirm" }/*已通过*/), state: 'success' },
        1003: { label: this.$t({ id: "my.contract.state.withdrawal" }/*已撤回*/), state: 'warning' },
      },
      subTabsList: [
        { label: '详情', key: 'DETAIL' }
      ],
      columns: [
        {
          title: this.$t({ id: "common.sequence" }/*序号*/), dataIndex: 'index',
          render: (value, record, index) => this.state.pageSize * this.state.page + index + 1
        },
        { title: this.$t({ id: "my.contract.currency" }/*币种*/), dataIndex: 'currency' },
        { title: this.$t({ id: "my.contract.plan.amount" }/*计划金额*/), dataIndex: 'amount', render: this.filterMoney },
        { title: this.$t({ id: "my.contract.partner.category" }/*合同方类型*/), dataIndex: 'partnerCategoryName' },
        { title: this.$t({ id: "my.contract.partner" }/*合同方*/), dataIndex: 'partnerName' },
        {
          title: this.$t({ id: "my.contract.plan.pay.date" }/*计划付款日期*/), dataIndex: 'dueDate',
          render: value => moment(value).format('YYYY-MM-DD')
        },
        {
          title: this.$t({ id: "common.remark" }/*备注*/), dataIndex: 'remark',
          render: value => {
            return (value ?
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>{value}</Popover> : '-'
            )
          }
        }
      ],
      data: [],
      isCopy: false,
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      visible: false,
      writeoffShow: false,
      payPlanVisible: false,
      showSlideFrame: false,
      isLoadPayData: false,
      isLoadCostData: false,
      slideFrameTitle: '',
      record: {}, //资金计划行信息
      historyData: [], //历史信息
      defaultApportion: {},
      //editReimburePage: menuRoute.getRouteItem('approve-reimburse-detail', 'key'),
      flag: true,
      showInvoices: false,
      invoicesLoading: false,
      approveHistory: [],
      historyLoading: false
    }
  }

 componentWillReceiveProps(nextProps) {
    if (this.state.flag && nextProps.id) {
      this.setState({ flag: false }, () => {
        reimburseService.getDefaultApportion(nextProps.id).then(res => {
          this.setState({ defaultApportion: res.data });
        }).catch(err => {
          message.error("获取默认分摊信息失败！");
        });
      });
    }

    if (nextProps.headerData.expenseReportOID && !this.props.headerData.expenseReportOID) {
      this.setState({ historyLoading: true });
      reimburseService.getReportsHistory(nextProps.headerData.expenseReportOID).then(res => {
        this.setState({ approveHistory: res.data, historyLoading: false });
      }).catch(err => {
        message.error("获取审批历史失败！");
      });
    }
  }

  //合同信息内容渲染格式
  renderList = (title, value) => {
    if(title === '单据编号'){
      return (
        <div className="list-info">
          <span>{title}：</span>
          <span className="content"><a onClick={this.reimburseDetail()}>{value}</a></span>
        </div>
      )
    }else{
      return (
        <div className="list-info">
          <span>{title}：</span>
          <span className="content">{value}</span>
        </div>
      )
    }

  };

  //跳转到合同详情
  contractDetail = () => {
    //let url = menuRoute.getRouteItem('contract-detail', 'key');

    //window.open(url.url.replace(':id', this.props.headerData.contractHeaderId).replace(':from', "reimburse"), "_blank");
  }

  //跳转到报账单详情
  reimburseDetail = (headerData) => {
    //let url = this.state.editReimburePage.url.replace(":id", headerData.id).replace(":entityOID", headerData.expenseReportOID).replace(":flag", false);
    //window.open(url, "_blank");
  }

  //选取报账单后
  handleListOk = (values) => {
    console.log(values);

    this.setState({ invoicesLoading: true });
    let data = {
      expenseReportId: this.props.id,
      invoices: []
    };

    values.result && values.result.map(item => {
      data.invoices.push(item.invoiceOID);
    });
    /* reimburseService.import(data).then(res => {
      message.success("导入费用成功！");
      this.setState({ showInvoices: false, invoicesLoading: false });
      this.getCostList(true);
    }).catch(res => {
      message.error("导入失败！");
    }) */
  }

  //取消
  onCancel = () => {
    //this.context.router.push(this.state.myReimburse.url);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/reimburse-review`,
      })
    );
  };

  render() {
    const { headerData } = this.props;
    const { detailLoading, showInvoices, isLoadCostData, isLoadPayData, writeoffShow, visible, planLoading, historyLoading, contractEdit, topTapValue, subTabsList, pagination, columns, data, showSlideFrame, contractStatus, record, slideFrameTitle, historyData } = this.state;
    let isEdit = null;
    if (headerData.reportStatus == 1001 || headerData.reportStatus == 1003 || headerData.reportStatus == 1005) {
      isEdit = true;
    }
    let contractInfo = (
      <Spin spinning={detailLoading}>
        <Card
          style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',borderBottom: '1px solid rgb(236, 236, 236)', marginRight: 15, marginLeft: 15, marginTop: 20}}>
          <div style={{paddingTop: 0, marginTop: '-20px'}}>
            <h3 className="header-title" style={{borderBottom: '1px solid #ececec',height:46,marginTop:10}}>
              {headerData.formName}
            </h3>
        <Row>
          <Col span={15}>
            <Row>
              <Col span={8}>
                <div className="list-info">
                  <span>{this.$t({ id: "my.contract.create.person" })}：</span>
                  <span className="content">{headerData.applicationName + "-" + headerData.applicationId}</span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-info">
                  <span>{"公司"}：</span>
                  <span className="content">{headerData.companyName}</span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-info">
                  <span>{"部门"}：</span>
                  <span className="content">{headerData.unitName}</span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={16}>
                <div className="list-info">
                  <span>{"单据编号"}：</span>
                  <span className="content">
                  <a onClick={()=>{this.reimburseDetail(headerData)}}>{headerData.businessCode}</a></span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-info">
                  <span>{this.$t({ id: "my.contract.create.date" }/*创建日期*/)}：</span>
                  <span className="content">{moment(headerData.createdDate).format('YYYY-MM-DD')}</span>
                </div>
              </Col>
            </Row>
          </Col>
          <Col span={9}>

            <div style={{ float: 'right' }}>

              <div className="amount-title">金额</div>
              <div className="amount-content">{headerData.currencyCode} {this.filterMoney(headerData.totalAmount)}</div>
            </div>
            <div style={{ float: 'right', marginRight: '50px' }}>
              <div className="status-title">{this.$t({ id: "common.column.status" }/*状态*/)}</div>
              <div className="status-content">{contractStatus[headerData.reportStatus] ? contractStatus[headerData.reportStatus].label : ''}</div>
            </div>
          </Col>
        </Row>
        {
          headerData.relatedContract && (
            <Row>
              <Col span={24}>
                <span>合同：</span>
                <a onClick={this.contractDetail}>{headerData.contractHeaderLineDTO.contractNumber}</a>
                <span style={{ marginLeft: 10 }}>总金额：{headerData.currencyCode} {headerData.contractHeaderLineDTO.contractAmount}</span>
              </Col>
            </Row>
          )
        }
          </div>
        </Card>
      </Spin>
    );
    let subContent = {};
    subContent.DETAIL = (
      <div>
        <AccountingInfo
          ref="AccountingInfo"
          flag={isLoadPayData}
          headerData={headerData}
          summaryView={headerData.summaryView || {}}
          disabled={isEdit === false}
        >
        </AccountingInfo>
        <Card
          style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', marginRight: 0,marginLeft:0, marginTop: 20 }}>
          <div style={{ paddingTop: 10, paddingBottom: 70, marginBottom: 25 }}>
            <ApproveHistory loading={false} infoData={this.state.approveHistory}></ApproveHistory>
          </div>
        </Card>
      </div>
    );
    subContent.PLAN = (
      <div className="tab-container">
        <Spin spinning={planLoading}>
          <h3 className="sub-header-title">{this.$t({ id: "my.contract.payment.plan" }/*付款计划*/)}</h3>
          <div className="table-header">
            <div className="table-header-buttons">
              {contractEdit &&
                <Button type="primary" onClick={this.addItem}>{this.$t({ id: "common.add" }/*添加*/)}</Button>}
            </div>
            <div style={{ marginBottom: '10px' }}>
              {this.$t({ id: "common.total" }, { total: pagination.total }/*共搜索到 {total} 条数据*/)}
              <span className="ant-divider" />
              {this.$t({ id: "my.contract.amount" }/*合同金额*/)}: {headerData.currency} {this.filterMoney(headerData.amount)}
            </div>
          </div>
          <Table rowKey={record => record.id}
            columns={columns}
            dataSource={data}
            pagination={pagination}
            scroll={{ x: true, y: false }}
            bordered
            size="middle" />
        </Spin>
      </div>
    );

    return (
      <div className="contract-detail-common reimburse">
        <div className="top-info" style={{ margin:'-46px -22px 0px -22px'}}>
          {contractInfo}
        </div>
        <div style={{ margin: '10px 12px' }}>
          {subContent['DETAIL']}
          <ListSelector
            single={false}
            visible={showInvoices}
            type="select_invoices"
            onCancel={() => { this.setState({ showInvoices: false }) }}
            onOk={this.handleListOk}
            saveLoading={this.state.invoicesLoading}
          />
        </div>
      </div>
    )
  }
}

ReimburseReviewDetailCommon.propTypes = {
  id: PropTypes.any.isRequired, //显示数据
  isApprovePage: PropTypes.bool, //是否在审批页面
  getContractStatus: PropTypes.func, //确认合同信息状态
};

ReimburseReviewDetailCommon.defaultProps = {
  isApprovePage: false,
  getContractStatus: () => { }
};

const wrappedReimburseReviewDetailCommon = Form.create()(ReimburseReviewDetailCommon);

export default connect(
  null,
  null,
  null,
  { withRef: true }
)(wrappedReimburseReviewDetailCommon);
