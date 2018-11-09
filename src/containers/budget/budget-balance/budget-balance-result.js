import React from 'react'
import { connect } from 'dva'

import Exporter from 'containers/budget/budget-balance/exporter'

import 'styles/budget/budget-balance/budget-balance-result.scss'
import { Table, Row, Col, Form, message, Button, Popover } from 'antd'
const FormItem = Form.Item;

import httpFetch from 'share/httpFetch'
import config from 'config'
import SlideFrame from 'widget/slide-frame'
import BudgetBalanceAmountDetail from 'containers/budget/budget-balance/budget-balance-amount-detail'
import { routerRedux } from 'dva/router';

class BudgetBalanceResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      pagination: {
        total: 0
      },
      hasInitial: false,
      dimensionColumns: [],
      columns: [
        {title: this.$t('budget.balance.company'), dataIndex: 'companyName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.company.group'), dataIndex: 'companyGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.department'), dataIndex: 'unitName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.department.group'), dataIndex: 'unitGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.user'), dataIndex: 'employeeName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.user.group'), dataIndex: 'employeeGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.item.type'), dataIndex: 'itemTypeName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.item'), dataIndex: 'itemName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.item.group'), dataIndex: 'itemGroupName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('budget.balance.year'), dataIndex: 'periodYear'},
        {title: this.$t('budget.balance.season'), dataIndex: 'periodQuarter'},
        {title: this.$t('budget.balance.period'), dataIndex: 'periodName', render: record => <Popover content={record}>{record}</Popover>},
        {title: this.$t('common.currency'), dataIndex: 'currency'},
        {title: this.$t('budget.balance.budget.amt'), dataIndex: 'bgtAmount', render: (bgtAmount, record) => <a onClick={() => this.showSlideFrame(record, 'J')}>{this.filterMoney(bgtAmount)}</a>},
        {title: this.$t('budget.balance.budget.rsv'), dataIndex: 'expReserveAmount', render: (expReserveAmount, record) =>  <a onClick={() => this.showSlideFrame(record, 'R')}>{this.filterMoney(expReserveAmount)}</a>},
        {title: this.$t('budget.balance.budget.usd'), dataIndex: 'expUsedAmount', render: (expUsedAmount, record) => <a onClick={() => this.showSlideFrame(record, 'U')}>{this.filterMoney(expUsedAmount)}</a>},
        {title: this.$t('budget.balance.budget.avb'), dataIndex: 'expAvailableAmount', render: expAvailableAmount => this.filterMoney(expAvailableAmount)},
        {title: this.$t('budget.balance.schedule'), dataIndex: 'schedule', render: schedule => (schedule * 100).toFixed(3) + '%'}
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
        totalNumber: this.$t('budget.balance.data.amount'),
        bgtAmount: `${this.$t('budget.balance.total')}${this.$t('budget.balance.budget.amt')}`,
        expReserveAmount: `${this.$t('budget.balance.total')}${this.$t('budget.balance.budget.rsv')}`,
        expUsedAmount: `${this.$t('budget.balance.total')}${this.$t('budget.balance.budget.usd')}`,
        expAvailableAmount: `${this.$t('budget.balance.total')}${this.$t('budget.balance.budget.avb')}`
      },
      page: 0,
      pageSize: 10,
      showSlideFrameFlag: false,
      slideFrameParam: {},
      titleMap: {
        J: `${this.$t('budget.balance.budget.amt')}${this.$t('budget.balance.detail')}`,
        R: `${this.$t('budget.balance.budget.rsv')}${this.$t('budget.balance.detail')}`,
        U: `${this.$t('budget.balance.budget.usd')}${this.$t('budget.balance.detail')}`
      },
      showExporterFlag: false
    };
  }

  componentWillMount(){
    httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/header/${this.props.match.params.id}`).then(res => {
      let companyNumber = 0;
      res.data.queryLineList.map(item => {
        if(item.parameterCode === 'COMPANY')
          companyNumber = item.allFlag ? this.$t('common.all') : this.$t('common.total1', {total: item.queryParameterList.length});
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
    return httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/results/${this.props.match.params.id}?page=${this.state.page}&size=${this.state.pageSize}`).then(res => {
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
        <h3 className="header-title">{this.$t('budget.balance.search.result')}</h3>
        <div className="header-info">
          <div className="header-info-title">{this.$t('budget.balance.search.condition')}</div>
          <div className="header-info-content">
            <Row gutter={40}>
              <Col span={8} className="info-block">
                <div className="info-title">{this.$t('budget.balance.company')}:</div>
                <div className="info-content">{condition.companyNumber}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{this.$t('budget.balance.budget.version')}:</div>
                <div className="info-content">{condition.version}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{this.$t('budget.balance.money.or.number')}:</div>
                <div className="info-content">{condition.type}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{this.$t('budget.balance.budget.structure')}:</div>
                <div className="info-content">{condition.budgetStructure}</div>
              </Col>
              <Col span={8} className="info-block">
                <div className="info-title">{this.$t('budget.balance.budget.scenarios')}:</div>
                <div className="info-content">{condition.budgetScenarios}</div>
              </Col>
            </Row>
          </div>
        </div>


        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total', {total: pagination.total ? pagination.total : '0'})}</div> {/* 共total条数据 */}
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
        <SlideFrame title={slideFrameParam.title} width="70%"
                    show={showSlideFrameFlag}
                    onClose={() => this.setState({ showSlideFrameFlag: false })}>
          <BudgetBalanceAmountDetail
                    params={slideFrameParam}/>
        </SlideFrame>

        <div className="footer-operate">
          <Button type="primary" onClick={() => {
            this.props.dispatch(
              routerRedux.replace({
                pathname: '/budget/budget-balance'
              })
            );
          }}>{this.$t('budget.balance.modify.params')}</Button>
          <Button onClick={this.getList} style={{ marginLeft: 10}}>{this.$t('budget.balance.search.again')}</Button>
          <Button style={{ marginLeft: 10}} onClick={() => this.setState({ showExporterFlag: true })}>{this.$t('budget.balance.export.CVS')}</Button>
        </div>

        <Exporter visible={showExporterFlag}
                  columns={columns}
                  dimensionColumns={dimensionColumns}
                  conditionId={this.props.match.params.id}
                  onCancel={() => this.setState({ showExporterFlag: false })}
                  afterClose={() => {this.setState({ showExporterFlag: false })}}/>

      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetBalanceResult);
