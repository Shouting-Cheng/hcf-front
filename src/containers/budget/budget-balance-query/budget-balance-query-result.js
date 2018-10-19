import { messages } from "share/common";
import React from 'react'
import { connect } from 'react-redux'

import Exporter from 'containers/budget/budget-balance/exporter'

import 'styles/budget/budget-balance/budget-balance-result.scss'
import { Table, Row, Col, Form, message, Button, Popover } from 'antd'
const FormItem = Form.Item;

import httpFetch from 'share/httpFetch'
import config from 'config'
import SlideFrame from 'components/slide-frame'
import BudgetBalanceAmountDetail from 'containers/budget/budget-balance/budget-balance-amount-detail'
import menuRoute from 'routes/menuRoute'

class BudgetBalanceResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      budgetBalancePage: menuRoute.getRouteItem('budget-balance-query', 'key'),
      data: [],
      pagination: {
        total: 0
      },
      hasInitial: false,
      dimensionColumns: [],
      columns: [
        {title: messages('budget.balance.company'), dataIndex: 'companyName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.company.group'), dataIndex: 'companyGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.department'), dataIndex: 'unitName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.department.group'), dataIndex: 'unitGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.user'), dataIndex: 'employeeName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.user.group'), dataIndex: 'employeeGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.item.type'), dataIndex: 'itemTypeName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.item'), dataIndex: 'itemName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.item.group'), dataIndex: 'itemGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('budget.balance.year'), dataIndex: 'periodYear'},
        {title: messages('budget.balance.season'), dataIndex: 'periodQuarter'},
        {title: messages('budget.balance.period'), dataIndex: 'periodName', render: record => <Popover content={record}>{record}</Popover>},
        {title: messages('common.currency'), dataIndex: 'currency'},
        {title: messages('budget.balance.budget.amt'), dataIndex: 'bgtAmount', render: (bgtAmount, record) => <a onClick={() => this.showSlideFrame(record, 'J')}>{this.filterMoney(bgtAmount)}</a>},
        {title: messages('budget.balance.budget.rsv'), dataIndex: 'expReserveAmount', render: (expReserveAmount, record) =>  <a onClick={() => this.showSlideFrame(record, 'R')}>{this.filterMoney(expReserveAmount)}</a>},
        {title: messages('budget.balance.budget.usd'), dataIndex: 'expUsedAmount', render: (expUsedAmount, record) => <a onClick={() => this.showSlideFrame(record, 'U')}>{this.filterMoney(expUsedAmount)}</a>},
        {title: messages('budget.balance.budget.avb'), dataIndex: 'expAvailableAmount', render: expAvailableAmount => this.filterMoney(expAvailableAmount)},
        {title: messages('budget.balance.schedule'), dataIndex: 'schedule', render: schedule => (schedule * 100).toFixed(3) + '%'}
      ],
      scrollx: 150,
      condition: {
        companyNumber: 0,
        version: '',
        type: '',
        budgetStructure: '',
        budgetScenarios: ''
      },
      total: [],
      menuText: {
        totalNumber: messages('budget.balance.data.amount'),
        bgtAmount: `${messages('budget.balance.total') }${messages('budget.balance.budget.amt')}`,
        expReserveAmount: `${messages('budget.balance.total') }${messages('budget.balance.budget.rsv')}`,
        expUsedAmount: `${messages('budget.balance.total') }${messages('budget.balance.budget.usd')}`,
        expAvailableAmount: `${messages('budget.balance.total') }${messages('budget.balance.budget.avb')}`
      },
      page: 0,
      pageSize: 10,
      showSlideFrameFlag: false,
      slideFrameParam: {},
      titleMap: {
        J: `${messages('budget.balance.budget.amt')}${messages('budget.balance.detail')}`,
        R: `${messages('budget.balance.budget.rsv')}${messages('budget.balance.detail')}`,
        U: `${messages('budget.balance.budget.usd')}${messages('budget.balance.detail')}`
      },
      showExporterFlag: false
    };
  }

  componentWillMount(){
    httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/header/${this.props.params.id}`).then(res => {
      let companyNumber = 0;
      res.data.queryLineList.map(item => {
        if(item.parameterCode === 'COMPANY')
          companyNumber = item.allFlag ? messages('common.all') : messages('common.total1', {total: item.queryParameterList.length});
      });
      this.setState({
        condition: {
          companyNumber: companyNumber,
          version: res.data.versionName,
          type: res.data.amountQuarterFlagName,
          budgetStructure: res.data.structureName,
          budgetScenarios: res.data.scenarioName
        }
      })
    });
    this.getList();
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1
      }, () => {
        this.getList();
      })
  };

  getList = () => {
    this.setState({loading: true});
    return httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/results/${this.props.params.id}?page=${this.state.page}&size=${this.state.pageSize}`).then(res => {
      let data = [], total = [];
      if(res.data){
        data = res.data.queryResultList.map((item, index) => {
          item.key = this.state.page * this.state.pageSize + index;
          item.schedule = item.bgtAmount === 0 ? 0 : (item.expReserveAmount + item.expUsedAmount) / item.bgtAmount;
          return item;
        });
        total = res.data.queryResultCurrencyList;
        let { dimensionColumns } = this.state;
        if(res.data.dimensionFiledMap && dimensionColumns.length === 0){
          let dimensionColumnsTemp = [];
          let dimensionFiledMap = res.data.dimensionFiledMap;
          Object.keys(dimensionFiledMap).map(dimensionIndex => {
            dimensionColumnsTemp.push({
              title: dimensionFiledMap[dimensionIndex],
              dataIndex: `dimension${dimensionIndex}Name`,
              index: dimensionIndex,
              render: record => <Popover content={record}>{record}</Popover>
            })
          });
          this.setState({ dimensionColumns: dimensionColumnsTemp });
        }
      }
      this.setState({
        loading: false,
        data,
        total,
        pagination: {
          total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    }).catch(e => {
      message.error(e.response.data.message);
      this.setState({
        loading: false
      })
    })
  };

  showSlideFrame = (record, type) => {
    this.setState({
      showSlideFrameFlag: true,
      slideFrameParam: {
        dimensionColumns: this.state.dimensionColumns,
        type: type,
        data: record,
        title: this.state.titleMap[type]
      }
    })
  };

  renderMoney = (number, fixed) => {
    return <span className={number >= 0 ? 'green' : 'red'}>{this.filterMoney(number, fixed)}</span>
  };

  renderTotal = () => {
    return this.state.total.map((item, outerIndex) => {
      return (
        <div className="currency-item" key={outerIndex}>
          {item.currency}
          {Object.keys(item).map((itemName, index) => {
            return itemName === 'currency' ? null : (
              <span className="currency-item-child" key={index}>
                <span className="ant-divider" />
                {this.state.menuText[itemName]} ：
                {itemName === 'totalNumber' ? item[itemName] : this.renderMoney(item[itemName])}
              </span>
            )
          })}
        </div>
      )
    })
  };

  render(){
    const {
      columns, data, condition, loading, showSlideFrameFlag, slideFrameParam,
      budgetBalancePage, pagination, dimensionColumns, showExporterFlag, scrollx
    } = this.state;

    return (
      <div className="budget-balance-result">
        <h3 className="header-title">{messages('budget.balance.search.result')}</h3>
        <div className="header-info">
          <div className="header-info-title">{messages('budget.balance.search.condition')}</div>
          <div className="header-info-content">
            <Row gutter={40}>
              <Col span={8} className="info-block">
                <div className="info-title">{messages('budget.balance.company')}:</div>
                <div className="info-content">{condition.companyNumber}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{messages('budget.balance.budget.version')}:</div>
                <div className="info-content">{condition.version}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{messages('budget.balance.money.or.number')}:</div>
                <div className="info-content">{condition.type}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{messages('budget.balance.budget.structure')}:</div>
                <div className="info-content">{condition.budgetStructure}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{messages('budget.balance.budget.scenarios')}:</div>
                <div className="info-content">{condition.budgetScenarios}</div>
              </Col>
            </Row>
          </div>
        </div>


        <div className="table-header">
          <div className="table-header-title">{messages('common.total', {total: pagination.total ? pagination.total : '0'})}</div> {/* 共total条数据 */}
        </div>
        {this.renderTotal()}
        <Table columns={columns.concat(dimensionColumns)}
               dataSource={data}
               loading={loading}
               pagination={pagination}
               size="middle"
               bordered
               rowKey="key"
               scroll={{ x: `${scrollx + dimensionColumns.length * 10}%` }}/>
        <SlideFrame content={BudgetBalanceAmountDetail}
                    show={showSlideFrameFlag}
                    onClose={() => this.setState({ showSlideFrameFlag: false })}
                    params={slideFrameParam}
                    title={slideFrameParam.title} width="70%"/>

        <div className="footer-operate">
          <Button type="primary" onClick={() => {this.context.router.push(budgetBalancePage.url)}}>{messages('budget.balance.modify.params')}</Button>
          <Button onClick={this.getList} style={{ marginLeft: 10}}>{messages('budget.balance.search.again')}</Button>
          <Button style={{ marginLeft: 10}} onClick={() => this.setState({ showExporterFlag: true })}>{messages('budget.balance.export.CVS')}</Button>
        </div>

        <Exporter visible={showExporterFlag}
                  columns={columns}
                  dimensionColumns={dimensionColumns}
                  conditionId={this.props.params.id}
                  onCancel={() => this.setState({ showExporterFlag: false })}
                  afterClose={() => {this.setState({ showExporterFlag: false })}}/>

      </div>
    )
  }

}

BudgetBalanceResult.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetBalanceResult);
