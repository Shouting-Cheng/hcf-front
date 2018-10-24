import React from 'react';
import { connect } from 'dva';
import { Form, Tabs, Table, message, Badge, Popover, Row, Col, Input } from 'antd';
const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute'
import config from 'config';

import SearchArea from 'widget/search-area';
import moment from 'moment';
import { routerRedux } from 'dva/router';

// import approveReimburseService from "containers/approve/reimburse/reimburse.service"

import CustomTable from 'widget/custom-table';
const Search = Input.Search;

class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 'unapproved',
      loading1: false,
      loading2: false,
      status: {
        1001: { label: '编辑中', state: 'default' },
        1004: { label: '审批通过', state: 'success' },
        1002: { label: '审批中', state: 'processing' },
        1005: { label: '审批驳回', state: 'error' },
        1003: { label: '撤回', state: 'warning' },
        2002: { label: '审核通过', state: 'success' },
        2004: { label: '支付成功', state: 'success' },
        2003: { label: '支付中', state: 'processing' },
      },
      SearchForm1: [
        {
          type: 'select',
          id: 'formOID',
          label: '单据类型',
          getUrl: `${config.baseUrl}/api/custom/forms/company/my/available/all?formType=105`,
          options: [],
          method: 'get',
          valueKey: 'formOID',
          labelKey: 'formName',
          colSpan: '6',
        },
        // { type: 'input', id: 'businessCode', label: "单据编号" /*预付款编号*/,colSpan:'6' },
        { type: 'input', id: 'fullName', label: '申请人', colSpan: '6' },
        {
          type: 'items',
          id: 'dateRange',
          items: [
            { type: 'date', id: 'beginDate', label: '提交日期从' },
            { type: 'date', id: 'endDate', label: '提交日期至' },
          ],
          colSpan: '6',
        },
        {
          type: 'items',
          id: 'amountRange',
          items: [
            { type: 'input', id: 'amountFrom', label: '金额从' },
            { type: 'input', id: 'amountTo', label: '金额至' },
          ],
          colSpan: '6',
        },
        {
          type: 'select',
          key: 'currency',
          id: 'currencyCode',
          label: '币种',
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          options: [],
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: '6',
        },
        { type: 'input', id: 'description', label: '备注', colSpan: '6' },
      ],
      SearchForm2: [
        {
          type: 'select',
          id: 'formOID',
          label: '单据类型',
          getUrl: `${config.baseUrl}/api/custom/forms/company/my/available/all?formType=105`,
          options: [],
          method: 'get',
          valueKey: 'formOID',
          labelKey: 'formName',
          colSpan: '6',
        },
        // { type: 'input', id: 'businessCode', label: "单据编号" /*预付款编号*/,colSpan:'6' },
        { type: 'input', id: 'fullName', label: '申请人', colSpan: '6' },
        {
          type: 'items',
          id: 'dateRange',
          items: [
            { type: 'date', id: 'beginDate', label: '提交日期从' },
            { type: 'date', id: 'endDate', label: '提交日期至' },
          ],
          colSpan: '6',
        },
        {
          type: 'items',
          id: 'amountRange',
          items: [
            { type: 'input', id: 'amountFrom', label: '金额从' },
            { type: 'input', id: 'amountTo', label: '金额至' },
          ],
          colSpan: '6',
        },
        {
          type: 'select',
          key: 'currency',
          id: 'currencyCode',
          label: '币种',
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          options: [],
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: '6',
        },
        { type: 'input', id: 'description', label: '备注', colSpan: '6' },
      ],
      unApproveSearchParams: {},
      approveSearchParams: {},
      columns: [
        { title: '单据编号', dataIndex: 'businessCode', width: 180, align: 'center' },
        { title: '单据类型', dataIndex: 'formName', align: 'left' },
        { title: '申请人', dataIndex: 'applicantName', width: 100, align: 'center' },
        {
          title: '提交日期',
          dataIndex: 'lastSubmittedDate',
          width: 90,
          align: 'center',
          render: (value, record) => moment(value).format('YYYY-MM-DD'),
        },
        { title: '币种', dataIndex: 'currencyCode', width: 80, align: 'center' },
        { title: '金额', dataIndex: 'totalAmount', render: this.filterMoney },
        { title: '本币金额', dataIndex: 'functionalAmount', render: this.filterMoney },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (desc, record) => <Popover content={desc}>{desc || '-'}</Popover>,
        },
        // { title: '已核销金额', dataIndex: 'pppamount', render: this.filterMoney },
        {
          title: '状态',
          dataIndex: 'status',
          width: 90,
          align: 'center',
          render: (value, record) => {
            return (
              <Badge status={this.$statusList[value].state} text={this.$statusList[value].label} />
            );
          },
        },
      ],
      // columns: [
      //     { title: this.$t({ id: "common.sequence" }/*序号*/), dataIndex: 'index', render: (value, record, index) => index + 1 },
      //     { title: this.$t({ id: "contract.createdBy" }/*申请人*/), dataIndex: 'applicantCode', render: (value, record) => record.applicantName + ' - ' + value },
      //     { title: this.$t({ id: "contract.sign.date" }/*提交时间*/), dataIndex: 'requisitionDate', render: value => moment(value).format('YYYY-MM-DD') },
      //     { title: "预付款类型", dataIndex: 'typeName' },
      //     { title: "预付款单号", dataIndex: 'prepaymentCode' },
      //     // { title: this.$t({ id: "my.contract.currency" }/*币种*/), dataIndex: 'currency' },
      //     { title: this.$t({ id: "contract.amount" }/*金额*/), dataIndex: 'totalAmount', render: this.filterMoney },
      //     {
      //         title: this.$t({ id: "common.column.status" }/*状态*/), dataIndex: 'status', render: (value, record) =>
      //             <Badge status={this.state.status[value].state} text={this.state.status[value].label} />
      //     },
      // ],
      unapprovedData: [],
      approvedData: [],
      unapprovedPagination: {
        total: 0,
      },
      approvedPagination: {
        total: 0,
      },
      unapprovedPage: 0,
      unapprovedPageSize: 10,
      approvedPage: 0,
      approvedPageSize: 10,
      // reimburseDetail: menuRoute.getRouteItem('approve-reimburse-detail', 'key'), //合同详情
    };
  }

  componentWillMount() {
    // this.setState({ tabValue: this.props.location.query.approved ? 'approved' : 'unapproved' });
    this.setState({ tabValue: 'unapproved' });
  }

  //未审批搜索
  unapprovedSearch = values => {
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    this.setState({ unApproveSearchParams: values }, () => {
      //this.getUnapprovedList();
      this.unApprovedtable.search({
        ...values,
        ...this.state.unApproveSearchParams,
        finished: 'false',
      });
    });
  };

  //审批搜索
  approvedSearch = values => {
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    this.setState({ approveSearchParams: values }, () => {
      this.approvedTable.search({ ...values, ...this.state.approveSearchParams, finished: 'true' });
    });
  };

  //进入详情页
  handleRowClick = record => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/approval-management/approve-my-reimburse/approve-reimburse-detail/${
          record.expenseReportId
        }/${record.entityOID}/${this.state.tabValue}`,
      })
    );
  };

  filterData = data => {
    return data.map(item => {
      return { ...item.publicExpenseReportApprovalView, entityOID: item.entityOID };
    });
  };
  /**未审批根据单据编号查询 */
  onDocumentSearch = value => {
    this.setState(
      {
        unApproveSearchParams: { businessCode: value },
      },
      () => {
        this.unApprovedtable.search({ ...this.state.unApproveSearchParams, finished: 'false' });
      }
    );
  };
  /**已审批根据单据编号查询 */
  onApprovedSearch = value => {
    this.setState(
      {
        approveSearchParams: { businessCode: value },
      },
      () => {
        this.approvedTable.search({ ...this.state.approveSearchParams, finished: 'true' });
      }
    );
  };
  handleTabsChange = key => {
    this.setState({
      tabValue: key,
    });
  };

  render() {
    const {
      tabValue,
      loading1,
      loading2,
      SearchForm1,
      SearchForm2,
      columns,
      unapprovedData,
      approvedData,
      unapprovedPagination,
      approvedPagination,
    } = this.state;
    return (
      <div className="approve-contract">
        <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
          <TabPane tab={this.$t({ id: 'contract.unapproved' } /*未审批*/)} key="unapproved">
            {tabValue === 'unapproved' && (
              <div>
                <SearchArea
                  searchForm={SearchForm1}
                  submitHandle={this.unapprovedSearch}
                  maxLength={4}
                />
                <div className="divider" />
                <div className="table-header">
                  <Row>
                    <Col span={18} />
                    <Col span={6}>
                      <Search
                        placeholder="请输入单据编号"
                        onSearch={this.onDocumentSearch}
                        enterButton
                      />
                    </Col>
                  </Row>
                </div>
                <div className="table-header" />
                <CustomTable
                  url={`${config.baseUrl}/api/approvals/public/exp/report/filters`}
                  ref={ref => (this.unApprovedtable = ref)}
                  params={{ finished: 'false' }}
                  columns={columns}
                  filterData={this.filterData}
                  tableKey="entityOID"
                  onClick={this.handleRowClick}
                />
              </div>
            )}
          </TabPane>
          <TabPane tab={this.$t({ id: 'contract.approved' } /*已审批*/)} key="approved">
            {tabValue === 'approved' && (
              <div>
                <SearchArea
                  searchForm={SearchForm2}
                  submitHandle={this.approvedSearch}
                  maxLength={4}
                />
                <div className="divider" />
                <div className="table-header">
                  <Row>
                    <Col span={18} />
                    <Col span={6}>
                      <Search
                        placeholder="请输入单据编号"
                        onSearch={this.onApprovedSearch}
                        enterButton
                      />
                    </Col>
                  </Row>
                </div>
                <div className="table-header" />
                <CustomTable
                  url={`${config.baseUrl}/api/approvals/public/exp/report/filters`}
                  ref={ref => (this.approvedTable = ref)}
                  params={{ finished: 'true' }}
                  columns={columns}
                  filterData={this.filterData}
                  tableKey="entityOID"
                  onClick={this.handleRowClick}
                />
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.currentUser,
    company: state.user.company,
  };
}

const wrappedPayment = Form.create()(Payment);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedPayment);
