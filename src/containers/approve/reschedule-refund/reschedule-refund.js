import {messages} from "share/common";
import React from 'react'
import menuRoute from 'routes/menuRoute'
import { connect } from 'react-redux'
import { Form, Tabs, Table } from 'antd'
const TabPane = Tabs.TabPane;

import moment from 'moment'
import SearchArea from 'components/search-area'
import approveRescheduleRefundService from 'containers/approve/reschedule-refund/reschedule-refund.service'


class ApproveRescheduleRefund extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tab: 'approving',
      searchForm: [
        {type: 'items', id: 'dateRange', items: [
          {type: 'date', id: 'beginDate', label: messages('finance.audit.startDate'/*日期从*/)},
          {type: 'date', id: 'endDate', label: messages('finance.audit.endDate'/*日期到*/)}
        ]}
      ],
      approvePendingSearchParams: {},
      approvedSearchParams: {},
      columns: [
        {title: messages('common.sequence'/*序号*/), dataIndex: 'index', render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page, width: '5%'},
        {title: messages('finance.view.search.applicant'/*申请人*/), dataIndex: 'applicantName'},
        {title: messages('request.detail.booker.type'/*类型*/), dataIndex: 'type', render: type => type === 1002 ? messages('check.center.reschedule'/*改签*/) : messages('check.center.refund'/*退票*/)},
        {title: messages('bookingManagement.businessCode'/*申请单号*/), dataIndex: 'businessCode'},
        {title: messages('price.review.reason'/*原因*/), dataIndex: 'isPersonalReasom', render: value => value ? messages('request.detail.booker.person'/*个人*/) : messages('request.detail.booker.project'/*项目*/)},
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      approveDetail: menuRoute.getRouteItem('reschedule-refund-detail','key'), //退改签审批详情页
    }
  }

  componentDidMount() {
    this.setState({ tab: this.props.location.query.tab || 'approving' }, () => {
      this.getList()
    })
  }

  getList = () => {
    const { tab, page, pageSize, approvePendingSearchParams, approvedSearchParams } = this.state;
    this.setState({ loading: true });
    approveRescheduleRefundService.getApproveRescheduleRefundtList(tab === 'approved', page, pageSize, tab === 'approved' ? approvedSearchParams : approvePendingSearchParams).then(res => {
      let data = [];
      res.data.map(item => {
        data.push(item.bookTask || {})
      });
      this.setState({
        loading: false,
        data,
        pagination: {
          total: Number(res.headers['x-total-count']) || 0,
          current: page + 1,
          onChange: this.onChangePaper
        }
      })
    })
  };

  onChangePaper = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList()
      })
    }
  };

  onTabChange = (tab) => {
    this.setState({
      tab,
      page: 0,
      pagination: { total: 0 }
    },() => {
      this.getList()
    })
  };

  search = (values) => {
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    this.setState({
      [this.state.tab === 'approving' ? 'approvePendingSearchParams' : 'approvedSearchParams']: values,
      page: 0,
      pagination: { total: 0 }
    },() => {
      this.getList()
    })
  };

  searchClear = () => {};

  handleRowClick = (record) => {
    let url = this.state.approveDetail.url.replace(':formOID', record.formOID).replace(':applicationOID', record.applicationOID).replace(':bookTaskOID', record.bookTaskOID);
    this.state.tab === 'approving' && (url += `?approving=true`);
    this.context.router.push(url)
  };

  render() {
    const { loading, tab, searchForm, columns, data, pagination } = this.state;
    return (
      <div className="approve-reschedule-refund">
        <Tabs activeKey={tab} onChange={this.onTabChange}>
          <TabPane tab={messages('approve.request.processing'/*待审批*/)} key='approving' />
          <TabPane tab={messages('approve.request.approved'/*已审批*/)} key='approved' />
        </Tabs>
        {tab === 'approving' && <SearchArea searchForm={searchForm}
                                                 submitHandle={this.search}
                                                 clearHandle={this.searchClear}/>}
        {tab === 'approved' && <SearchArea searchForm={searchForm}
                                           submitHandle={this.search}
                                           clearHandle={this.searchClear}/>}
        <div className="table-header">
          <div className="table-header-title">
            {messages('common.total',{total:pagination.total}/*共搜索到 {pagination.total} 条数据*/)}
          </div>
        </div>
        <Table rowKey={(record, index) => index}
               loading={loading}
               columns={columns}
               dataSource={data}
               pagination={pagination}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               bordered
               size="middle"
        />
      </div>
    )
  }
}

ApproveRescheduleRefund.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    state: state
  }
}

const wrappedApproveRescheduleRefund = Form.create()(ApproveRescheduleRefund);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedApproveRescheduleRefund)
