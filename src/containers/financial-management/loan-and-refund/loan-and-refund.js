import React from 'react';
import menuRoute from 'routes/menuRoute';

import { connect } from 'react-redux';
import { dealCache, deepFullCopy, messages } from 'share/common';
import { Form, Tabs,  message } from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;

import moment from 'moment';
import SearchArea from 'components/search-area';
import SlideFrame from 'components/slide-frame';
import RepaymentDetailFrame from 'containers/request/loan-request/repayment-detail-frame';
import loanAndRefundService from 'containers/financial-management/loan-and-refund/loan-and-refund.service';
import 'styles/financial-management/loan-and-refund/loan-and-refund.scss';

let cacheSearchData = {};

class LoanAndRefund extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tab: 'all',
      showRefundDetail: false,
      globalSearchForm: [
        {
          type: 'input',
          id: 'fullName',
          label: messages('finance.view.search.applicant' /*申请人*/),
        },
        {
          type: 'input',
          id: 'employeeId',
          label: messages('finance.view.search.jobNumber' /*工号*/),
        },
        {
          type: 'radio',
          id: 'repaymentStatus',
          label: messages('finance.loan.refund.refundState' /*还款状态*/),
          options: [
            { label: messages('finance.loan.refund.all' /*全部*/), value: '0' },
            { label: messages('finance.loan.refund.balance' /*有欠款*/), value: '1' },
            { label: messages('finance.loan.refund.refundYet' /*已还款*/), value: '2' },
          ],
          defaultValue: '0',
        },
      ],
      refundSearchForm: [
        {
          type: 'items',
          id: 'dataRange',
          items: [
            {
              type: 'date',
              id: 'datestart',
              label: messages('finance.loan.refund.refundSubmitFrom' /*还款提交日期从*/),
            },
            {
              type: 'date',
              id: 'dateend',
              label: messages('finance.loan.refund.refundSubmitTo' /*还款提交日期至*/),
            },
          ],
        },
        {
          type: 'input',
          id: 'fullName',
          label: messages('finance.view.search.applicant' /*申请人*/),
        },
        {
          type: 'input',
          id: 'employeeId',
          label: messages('finance.view.search.jobNumber' /*工号*/),
        },
        {
          type: 'input',
          id: 'repaymentId',
          label: messages('finance.loan.refund.refundDocNo' /*还款单号*/),
        },
        {
          type: 'input',
          id: 'loanId',
          label: messages('finance.loan.refund.borrowDocNo' /*借款单号*/),
        },
      ],
      loanSearchForm: [
        {
          type: 'items',
          id: 'dataRange',
          items: [
            {
              type: 'date',
              id: 'datestart',
              label: messages('finance.loan.refund.borrowSubmitFrom' /*借款提交日期从*/),
            },
            {
              type: 'date',
              id: 'dateend',
              label: messages('finance.loan.refund.borrowSubmitTo' /*借款提交日期至*/),
            },
          ],
        },
        {
          type: 'input',
          id: 'fullName',
          label: messages('finance.view.search.applicant' /*申请人*/),
        },
        {
          type: 'input',
          id: 'employeeId',
          label: messages('finance.view.search.jobNumber' /*工号*/),
        },
        {
          type: 'input',
          id: 'loanId',
          label: messages('finance.loan.refund.borrowDocNo' /*借款单号*/),
        },
      ],
      searchParams: {},
      globalColumns: [
        {
          title: messages('common.sequence' /*序号*/),
          dataIndex: 'index',
          width: '5%',
          render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page,
        },
        { title: messages('finance.view.search.jobNumber' /*工号*/), dataIndex: 'employeeId' },
        { title: messages('finance.view.search.applicant' /*申请人*/), dataIndex: 'fullName' },
        { title: messages('finance.loan.refund.department' /*部门*/), dataIndex: 'departmentName' },
        {
          title: messages('finance.view.search.currency' /*币种*/),
          dataIndex: 'currencyCode',
          width: '10%',
        },
        {
          title: messages('finance.loan.refund.borrowAmount' /*借款总额*/),
          dataIndex: 'borrowingTotalAmount',
          render: this.renderMoney,
        },
        {
          title: messages('finance.loan.refund.duePayAmount' /*待还款总额*/),
          dataIndex: 'stayWriteoffTotalAmount',
          render: this.renderMoney,
        },
      ],
      refundColumns: [
        {
          title: messages('common.sequence' /*序号*/),
          dataIndex: 'index',
          width: '5%',
          render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page,
        },
        { title: messages('finance.view.search.jobNumber' /*工号*/), dataIndex: 'employeeId' },
        { title: messages('finance.view.search.applicant' /*申请人*/), dataIndex: 'fullName' },
        {
          title: messages('finance.loan.refund.refundSubmitDate' /*还款提交日期*/),
          dataIndex: 'createdDate',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        { title: messages('finance.loan.refund.department' /*部门*/), dataIndex: 'departmentName' },
        {
          title: messages('finance.loan.refund.refundDocNo' /*还款单号*/),
          dataIndex: 'repaymentBusinessCode',
        },
        {
          title: messages('finance.loan.refund.borrowDocNo' /*借款单号*/),
          dataIndex: 'loanBusinessCode',
        },
        {
          title: messages('finance.view.search.currency' /*币种*/),
          dataIndex: 'currencyCode',
          width: '10%',
        },
        {
          title: messages('finance.loan.refund.refundMoney' /*还款金额*/),
          dataIndex: 'repaymentValue',
          render: this.renderMoney,
        },
        {
          title: messages('finance.view.search.operation' /*操作*/),
          dataIndex: 'oid',
          render: (value, record) => (
            <a onClick={() => this.confirmRefund(value, record)}>
              {record.expenseReportOid || !this.checkPageRole('REPAYMENTSLIPMANAGEMENT', 2)
                ? messages('common.detail' /*详情*/)
                : messages('finance.loan.refund.confirmReceipt' /*确认收款*/)}
            </a>
          ),
        },
      ],
      loanColumns: [
        {
          title: messages('common.sequence' /*序号*/),
          dataIndex: 'index',
          width: '5%',
          render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page,
        },
        { title: messages('finance.view.search.jobNumber' /*工号*/), dataIndex: 'employeeId' },
        { title: messages('finance.view.search.applicant' /*申请人*/), dataIndex: 'fullName' },
        {
          title: messages('finance.loan.refund.borrowSubmitDate' /*借款提交日期*/),
          dataIndex: 'createdDate',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        { title: messages('finance.loan.refund.department' /*部门*/), dataIndex: 'departmentName' },
        {
          title: messages('finance.loan.refund.borrowDocNo' /*借款单号*/),
          dataIndex: 'businessCode',
        },
        {
          title: messages('finance.view.search.currency' /*币种*/),
          dataIndex: 'currencyCode',
          width: '10%',
        },
        {
          title: messages('request.detail.loan.amount' /*借款金额*/),
          dataIndex: 'borrowingTotalAmount',
          render: this.renderMoney,
        },
        {
          title: messages('finance.loan.refund.duePayMoney' /*待还款金额*/),
          dataIndex: 'stayWriteoffAmount',
          render: this.renderMoney,
        },
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      refundDetailParams: {}, //还款单管理侧滑参数
      overallSubList: menuRoute.getRouteItem('overall-sub-list', 'key'), //全局查看列表页
      requestDetail: menuRoute.getRouteItem('loan-refund-detail', 'key'), //申请单详情页
      expenseDetailView: menuRoute.getRouteItem('loan-refund-detail-expense', 'key'), //费用申请单详情
    };
  }

  componentDidMount() {
    this.setState({ tab: this.props.location.query.tab || 'all' }, () => {
      this.getCache();
    });
  }
  //存储筛选数据缓存
  setCache(result) {
    let { tab, page } = this.state;
    result.tab = tab;
    result.page = page;
    cacheSearchData = result;
  }
  //获取筛选数据缓存
  getCache() {
    let result = this.props.loanAndRefund;
    if (result && JSON.stringify(result) !== '{}') {
      cacheSearchData = result;
      this.dealCache(result);
    } else {
      this.getList();
    }
  }
  //处理筛选缓存数据
  dealCache(result) {
    let { globalSearchForm, refundSearchForm, loanSearchForm, tab, page } = this.state;
    if (result) {
      tab = result.tab;
      page = result.page;
      let searchForm =
        tab === 'all' ? globalSearchForm : tab === 'refund' ? refundSearchForm : loanSearchForm;
      let searchFormKey =
        tab === 'all'
          ? 'globalSearchForm'
          : tab === 'refund'
            ? 'refundSearchForm'
            : 'loanSearchForm';
      let defaultSearchForm = deepFullCopy(searchForm);
      dealCache(defaultSearchForm, result);
      this.setState({ tab, [searchFormKey]: defaultSearchForm, page }, () => {
        this.onSearch(result);
        this.props.dispatch({
          type: 'cache/serOverallSubList',
          overallSubList: null
        });
      });
    }
  }
  onChangeTabs = tab => {
    this.setState(
      {
        tab,
        searchParams: {},
        page: 0,
        pagination: {
          total: 0,
        },
      },
      () => {
        this.formRef &&
          this.formRef.setValues({
            fullName: '',
            employeeId: '',
            loanId: '',
            repaymentId: '',
            repaymentStatus: '0',
            datestart: '',
            dateend: '',
          });
        this.setCache({});
        this.getList();
      }
    );
  };

  getList = () => {
    const { tab, page, pageSize, searchParams } = this.state;
    let method =
      tab === 'all' ? 'getGlobalList' : tab === 'refund' ? 'getRefundList' : 'getLoanList';
    this.setState({ loading: true });
    loanAndRefundService[method](page, pageSize, searchParams)
      .then(res => {
        this.setState({
          loading: false,
          data: res.data,
          pagination: {
            total: Number(res.headers['x-total-count']) || 0,
            current: page + 1,
            onChange: this.onChangePaper,
          },
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          data: [],
          pagination: {
            total: 0,
          },
        });
        message.error(messages('common.error1'));
      });
  };

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };

  onSearch = values => {
    this.setCache({ ...values });
    values.datestart && (values.datestart = moment(values.datestart).format('YYYY-MM-DD 00:00:00'));
    values.dateend && (values.dateend = moment(values.dateend).format('YYYY-MM-DD 23:59:59'));
    this.setState(
      {
        searchParams: values,
        page: 0,
        pagination: {
          total: 0,
        },
      },
      () => {
        this.getList();
      }
    );
  };

  onClear = () => {
    this.setCache({});
    this.setState({ searchParams: {} }, () => {
      this.getList();
    });
  };

  //还款单管理侧滑
  showRefundDetailSlide = flag => {
    this.setState({ showRefundDetail: flag });
  };

  //关闭确认收款侧滑
  handleRefundAfterClose = value => {
    this.setState({ showRefundDetail: false }, () => {
      value && this.getList();
    });
  };

  //确认收款
  confirmRefund = (oid, record) => {
    if (record.expenseReportOid) {
      window.open(
        this.state.expenseDetailView.url.replace(':expenseReportOid', record.expenseReportOid)
      );
    } else {
      this.setState({ refundDetailParams: { oid, loanRefund: 'true' } }, () => {
        this.showRefundDetailSlide(true);
      });
    }
  };

  //格式化money
  renderMoney = value => {
    let numberString = Number(value || 0)
      .toFixed(2)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += numberString.indexOf('.') > -1 ? '' : '.00';
    return <span className="money-cell">{numberString}</span>;
  };

  //进入全局查看详情
  handleOverallRowClick = record => {
    this.props.dispatch({
      type: 'cache/serOverallSubList',
      overallSubList: cacheSearchData
    });
    this.context.router.push(
      this.state.overallSubList.url
        .replace(':employeeId', record.employeeId)
        .replace(':currencyCode', record.currencyCode)
    );
  };

  //借款单管理详情
  handleLoanRowClick = record => {
    this.props.dispatch({
      type: 'cache/serOverallSubList',
      overallSubList: cacheSearchData
    });
    this.context.router.push(
      this.state.requestDetail.url
        .replace(':formOid', record.formOid)
        .replace(':applicationOid', record.oid) + '?tab=loan'
    );
  };

  render() {
    const {
      loading,
      tab,
      showRefundDetail,
      globalSearchForm,
      refundSearchForm,
      loanSearchForm,
      globalColumns,
      refundColumns,
      loanColumns,
      data,
      pagination,
      refundDetailParams,
    } = this.state;

    return (
      <div className="loan-and-refund">
        <Tabs activeKey={tab} onChange={this.onChangeTabs}>
          {this.checkPageShowRole('LOANGLOBALVIEW') && (
            <TabPane
              tab={messages('finance.loan.refund.moneyGlobalCheck' /*借还款全局查看*/)}
              key="all"
            />
          )}
          {this.checkPageShowRole('REPAYMENTSLIPMANAGEMENT') && (
            <TabPane tab={messages('finance.loan.refund.refundDocs' /*还款单管理*/)} key="refund" />
          )}
          {this.checkPageShowRole('LOANBILLMANAGEMENT') && (
            <TabPane tab={messages('finance.loan.refund.borrowDocs' /*借款单管理*/)} key="loan" />
          )}
        </Tabs>

        <SearchArea
          searchForm={
            tab === 'all' ? globalSearchForm : tab === 'refund' ? refundSearchForm : loanSearchForm
          }
          wrappedComponentRef={inst => (this.formRef = inst)}
          submitHandle={this.onSearch}
          isReturnLabel={true}
          clearHandle={this.onClear}
        />
        <div className="table-header">
          <div className="table-header-title">
            {messages('common.total', { total: pagination.total || 0 }) /*共 total 条数据*/}
          </div>
        </div>
        <Table
          rowKey={(record, index) => index}
          columns={tab === 'all' ? globalColumns : tab === 'refund' ? refundColumns : loanColumns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onRow={
            tab === 'all'
              ? record => ({ onClick: () => this.handleOverallRowClick(record) })
              : tab === 'loan'
                ? record => ({ onClick: () => this.handleLoanRowClick(record) })
                : ''
          }
          bordered
          size="middle"
        />

        <SlideFrame
          title={messages('finance.loan.refund.refundDetails' /*还款单详情*/)}
          show={showRefundDetail}
          content={RepaymentDetailFrame}
          params={refundDetailParams}
          onClose={() => this.showRefundDetailSlide(false)}
          afterClose={this.handleRefundAfterClose}
        />
      </div>
    );
  }
}

LoanAndRefund.contextTypes = {
  router: React.PropTypes.object,
};
function mapStateToProps(state) {
  return {
    loanAndRefund: state.cache.loanAndRefund,
  };
}
const WrappedLoanAndRefund = Form.create()(LoanAndRefund);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedLoanAndRefund);
