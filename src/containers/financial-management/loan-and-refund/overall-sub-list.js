
import React from 'react';
import menuRoute from 'routes/menuRoute';

import {dealCache, deepFullCopy, messages} from 'share/common';
import { Form, Table, Icon } from 'antd';

import moment from 'moment';
import SearchArea from 'components/search-area';
import loanAndRefundService from 'containers/financial-management/loan-and-refund/loan-and-refund.service';
import 'styles/financial-management/loan-and-refund/overall-sub-list.scss';
import {connect} from "react-redux";
import configureStore from "stores";
import {setOverallSubList} from "actions/cache";

let cacheSearchData={};

class OverallSubList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loanInfo: {},
      searchForm: [
        {type: 'items', id: 'dataRange', items: [
          {type: 'date', id: 'datestart', label: messages('finance.loan.refund.borrowSubmitFrom'/*借款提交日期从*/)},
          {type: 'date', id: 'dateend', label: messages('finance.loan.refund.borrowSubmitTo'/*借款提交日期至*/)}
        ]},
        {type: 'input', id: 'businessCode', label: messages('finance.loan.refund.borrowDocNo'/*借款单号*/)},
        {type: 'radio', id: 'repaymentStatus', label: messages('finance.loan.refund.borrow.status'/*借款状态*/),
          options: [
            {label: messages('finance.loan.refund.all'/*全部*/),value: '0'},
            {label: messages('finance.loan.refund.have.pay'/*已付款*/),value: '3'},
            {label: messages('finance.loan.refund.paying'/*还款中*/),value: '4'},
            {label: messages('finance.loan.refund.have.refund'/*已还款*/),value: '5'},
          ],
          defaultValue: '0'
        }
      ],
      searchParams: {},
      columns: [
        {title: messages('common.sequence'), dataIndex: 'index', width: '5%', render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page},
        {title: messages('finance.loan.refund.loan.date'/*借款日期*/), dataIndex: 'createdDate', render: value => moment(value).format('YYYY-MM-DD')},
        {title: messages('finance.loan.refund.borrowDocNo'/*借款单号*/), dataIndex: 'businessCode'},
        {title: messages('common.currency'), dataIndex: 'currencyCode', width: '10%'},
        {title: messages('finance.loan.refund.borrowAmount'/*借款总额*/), dataIndex: 'totalAmount', render: value =>
          <span className="money-cell">{this.renderMoney(value)}</span>},
        {title: messages('finance.loan.refund.duePayAmount'/*待还款总额*/), dataIndex: 'stayWriteoffAmount', render: value =>
          <span className="money-cell">{this.renderMoney(value)}</span>},
        {title: messages('common.column.status'), dataIndex: 'stage', width: '10%'},
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      loanAndRefundList: menuRoute.getRouteItem('loan-and-refund','key'), //列表页
      requestDetail: menuRoute.getRouteItem('loan-refund-detail','key'), //申请单详情页
    }
  }

  componentWillMount() {
    this.getEmployeeLoanInfo();
    this.getCache();
  }
  // 设置缓存
  setCache (result) {
    let {page} = this.state;
    result.page = page;
    cacheSearchData=result;
  }
  // 获取rudux缓存数据
  getCache () {
    let result=this.props.overallSubList;
    if(result&&JSON.stringify(result) !== "{}"){
      cacheSearchData=result;
      this.dealCache(result);
    }
    else{
      this.getList()
    }
  }
  // 缓存处理
  dealCache (result) {
    let {searchForm, page} = this.state;
    let defaultSearchForm = deepFullCopy(searchForm);
    if (result) {
      page = result.page;
      dealCache(defaultSearchForm, result);
      this.setState({ searchForm: defaultSearchForm, page}, () => {
        this.onSearch(result)
        configureStore.store.dispatch(setOverallSubList(null));
      })
    }
  }

  getEmployeeLoanInfo = () => {
    loanAndRefundService.getLoanInfoByEmployeeId(this.props.params.employeeId,this.props.params.currencyCode).then(res => {
      this.setState({loanInfo: res.data[0] || {}})
    })
  };

  getList = () => {
    const { page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    searchParams.currencyCode=this.props.params.currencyCode;
    loanAndRefundService.getLoanListByEmployeeId(page, pageSize, this.props.params.employeeId, searchParams).then(res => {
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

  //搜索
  onSearch = (value) => {
    this.setCache({...value});
    value.datestart && (value.datestart = moment(value.datestart).format('YYYY-MM-DD 00:00:00'));
    value.dateend && (value.dateend = moment(value.dateend).format('YYYY-MM-DD 23:59:59'));
    this.setState({ searchParams: value }, () => {
      this.getList()
    })
  };

  //清空
  onClear = () => {
    this.setState({ searchParams: {} }, () => {
      this.getList()
    })
  };

  //返回
  handleBack = () => {
    this.context.router.push(this.state.loanAndRefundList.url)
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString
  };

  handleRowClick = (record) => {
    configureStore.store.dispatch(setOverallSubList(cacheSearchData));
    this.context.router.push(this.state.requestDetail.url.replace(':formOID', record.formOid).replace(':applicationOID', record.oid));
  };

  render() {
    const { loading, loanInfo, searchForm, columns, data, pagination } = this.state;
    return (
      <div className="overall-sub-list">
        <div className="employee-loan-info">
          <div>
            {loanInfo.fullName}
            <span className="employee-info">{loanInfo.employeeId} - {loanInfo.departmentName} - {loanInfo.departmentPath}</span>
          </div>
          <div>
            <span className="loan-amount">
              {messages('finance.loan.refund.borrowAmount'/*借款总额*/)}：
              {loanInfo.currencyCode} {this.renderMoney(loanInfo.borrowingTotalAmount)}
            </span>
            {messages('finance.loan.refund.duePayAmount'/*待还款总额*/)}：
            <span className={loanInfo.stayWriteoffTotalAmoun === 0 ? 'color-999' : ''}>
              {loanInfo.currencyCode} {this.renderMoney(loanInfo.stayWriteoffTotalAmount)}
            </span>
          </div>
        </div>
        <SearchArea searchForm={searchForm}
                    isReturnLabel={true}
                    submitHandle={this.onSearch}
                    clearHandle={this.onClear}/>
        <div className="table-header">
          <div className="table-header-title">{messages('common.total', {total: pagination.total || 0})/*共 total 条数据*/}</div>
        </div>
        <Table rowKey={(record, index) => index}
               columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               onRow={record => ({ onClick: () => this.handleRowClick(record) })}
               size="middle"
               bordered/>
        <a onClick={this.handleBack}><Icon type="rollback" className="back-icon"/>{messages('common.back')}</a>
      </div>
    )
  }
}

OverallSubList.contextTypes = {
  router: React.PropTypes.object
};
function mapStateToProps(state) {
  return {
    overallSubList: state.cache.overallSubList,
  }
}
const WrappedOverallSubList = Form.create()(OverallSubList);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedOverallSubList);
