import React from 'react'
import { connect } from 'dva'
import { Form, Table, Tabs } from 'antd'
const TabPane = Tabs.TabPane;

import moment from 'moment'
import SearchArea from 'widget/search-area'
import priceReviewService from 'containers/approve/price-review/price-review.service'


class PriceReview extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tab: 'approving',
      searchForm: [
        {type: 'items', id: 'dateRange', items: [
          {type: 'date', id: 'startDate', label: messages('finance.audit.startDate'/*日期从*/)},
          {type: 'date', id: 'endDate', label: messages('finance.audit.endDate'/*日期到*/)}
        ]}
      ],
      searchParams: {},
      columns: [
        {title: messages('common.sequence'/*序号*/), dataIndex: 'index', render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page, width: '5%'},
        {title: messages('price.review.name'/*申请人*/), dataIndex: 'name'},
        {title: messages('price.review.submit.date'/*提交时间*/), dataIndex: 'lastModifiedDate', render: (value, record) => moment(value || record.createdDate).format('YYYY-MM-DD')},
        {title: messages('price.review.type'/*类型*/), dataIndex: 'type', render: type =>
          type === 1001 ? messages('price.review.type.book'/*订票*/) :
            type === 1002 ? messages('check.center.reschedule'/*改签*/) :
              messages('check.center.refund'/*退票*/)},
        {title: messages('finance.view.search.documentNo'/*单号*/), dataIndex: 'businessCode'},
        {title: messages('price.review.reason'/*原因*/), dataIndex: 'reason', render: value => value || '-'},
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      reviewDetail: menuRoute.getRouteItem('price-review-detail','key'), //价格审核详情页
    }
  }

  componentDidMount() {
    this.setState({ tab: this.props.location.query.tab || 'approving' }, () => {
      this.getList()
    })
  }

  getList = () => {
    const { tab, page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    priceReviewService.getPriceReviewList(page, pageSize, tab === 'approving' ? 1005 : 1006, searchParams).then(res => {
      this.setState({
        loading: false,
        data: res.data,
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
    this.formRef.setValues({
      startDate: '',
      endDate: ''
    });
    this.setState({
      tab,
      searchParams: {},
      page: 0,
      pagination: { total: 0 }
    },() => {
      this.getList()
    })
  };

  search = (values) => {
    values.startDate && (values.startDate = moment(values.startDate).format('YYYY-MM-DD 00:00:00'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD 23:59:59'));
    this.setState({
      searchParams: values,
      page: 0,
      pagination: { total: 0 }
    },() => {
      this.getList()
    })
  };

  handleRowClick = (record) => {
    let url = this.state.reviewDetail.url.replace(':formOID', record.formOID).replace(':applicationOID', record.applicationOID);
    this.state.tab === 'approving' && (url += `?approving=true`);
    this.context.router.push(url)
  };

  render() {
    const { loading, tab, columns, data, pagination, searchForm } = this.state;
    return (
      <div className="price-review">
        <Tabs activeKey={tab} onChange={this.onTabChange}>
          <TabPane tab={messages('price.review.dueAudit'/*待审核*/)} key='approving' />
          <TabPane tab={messages('price.review.audited'/*已审核*/)}  key='approved' />
        </Tabs>
        <SearchArea searchForm={searchForm}
                    wrappedComponentRef={(inst) => this.formRef = inst}
                    submitHandle={this.search}
                    clearHandle={() => {}}/>
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
               size="middle"/>
      </div>
    )
  }
}

PriceReview.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return { }
}

const wrappedPriceReview = Form.create()(PriceReview);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPriceReview)
