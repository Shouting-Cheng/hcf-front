import React from 'react'
import { connect } from 'dva'

import httpFetch from 'share/httpFetch'
import debounce from 'lodash.debounce'
import config from 'config'
import { Table, Button, Input, Popover, message, Icon } from 'antd'
const Search = Input.Search;

import BasicInfo from 'widget/basic-info'

import 'styles/budget-setting/budget-organization/budget-strategy/budget-strategy-detail.scss'

class BudgetStrategyDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      infoList: [
        {type: 'input', id: 'controlStrategyCode', label: this.$t({id: "budget.strategy.code"}/*预算控制策略代码*/), isRequired: true, disabled: true},
        {type: 'input', id: 'controlStrategyName', label: this.$t({id: "budget.strategy.name"}/*预算控制策略名称*/), isRequired: true},
        {type: 'switch', id: 'enabled', label: this.$t({id: "common.column.status"}/*状态*/)}
      ],
      infoData: {},
      updateState: false,
      baseInfoLoading: false,
      columns: [
        {title: this.$t({id: "common.sequence"}/*序号*/), dataIndex: "detailSequence", key: "detailSequence", width: '7%'},
        {title: this.$t({id: "budget.strategy.rule.code"}/*规则代码*/), dataIndex: "detailCode", key: "detailCode"},
        {title: this.$t({id: "budget.strategy.control.strategy"}/*控制策略*/), dataIndex: "controlMethod", key: "controlMethod",
          render: method => <span>{method.label}</span>},
        {title: this.$t({id: "budget.strategy.rule.name"}/*控制规则名称*/), dataIndex: "detailName", key: "detailName",
          render: desc => <Popover placement="topLeft" content={desc}>{desc}</Popover>},
        {title: this.$t({id: "budget.strategy.message"}/*消息*/), dataIndex: "messageCode", key: "messageCode",
          render: (message, record) => (record.controlMethod.value === 'NO_MESSAGE' ? <span>-</span> :
            <Popover placement="topLeft" content={message ? message.label : '-'}>{message ? message.label : '-'}</Popover> )},
        {title: this.$t({id: "budget.strategy.event"}/*事件*/), dataIndex: "expWfEvent", key: "expWfEvent",
          render: event => <span>{event ? event : '-'}</span>}
      ],
      data: [],
      pagination: {
        total: 0
      },
      pageSize: 10,
      page: 0,
      keyWords: '',
      newBudgetStrategyDetail:  menuRoute.getRouteItem('new-budget-strategy-detail','key'),    //新建控制策略详情
      strategyControlDetail:  menuRoute.getRouteItem('strategy-control-detail','key'),    //策略明细
      budgetStrategyDetail:  menuRoute.getRouteItem('budget-strategy-detail','key'),    //预算控制策略详情
      budgetOrganizationDetail:  menuRoute.getRouteItem('budget-organization-detail','key'),    //预算组织详情
    };
    this.handleSearch = debounce(this.handleSearch, 250);
  }

  componentWillMount() {
    if(this.props.organization.id && this.props.params.strategyId){
      this.context.router.replace(this.state.budgetStrategyDetail.url.replace(':id', this.props.organization.id).replace(':strategyId', this.props.params.strategyId).replace(":setOfBooksId",this.props.params.setOfBooksId));
      this.getBasicInfo();
      this.getList();
    }
  }

  getBasicInfo() {
    httpFetch.get(`${config.budgetUrl}/api/budget/control/strategies/${this.props.strategyId || this.props.params.strategyId}`).then((res) => {
      if(res.status === 200) {
        this.setState({ infoData: res.data })
      }
    }).catch((e) => {

    })
  }

  getList() {
    let url = `${config.budgetUrl}/api/budget/control/strategy/details/query?size=${this.state.pageSize}&page=${this.state.page}&controlStrategyId=${this.props.strategyId || this.props.params.strategyId}&organizationId=${this.props.params.id}`;
    url += this.state.keyWords ? `&keyWords=${this.state.keyWords}` : '';
    this.setState({ loading: true });
    httpFetch.get(url).then((res) => {
      if (res.status === 200) {
        this.setState({
          data: res.data,
          loading: false,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            onChange: this.onChangePager,
            current: this.state.page + 1
          }
        })
      }
    }).catch((e) => {

    })
  }

  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, ()=>{
        this.getList();
      })
  };

  handleNew = () => {
    this.context.router.push(this.state.newBudgetStrategyDetail.url.replace(':id', this.props.params.id).replace(':strategyId', this.props.params.strategyId).replace(":setOfBooksId",this.props.params.setOfBooksId));
  };

  handleRowClick = (record) => {
    this.context.router.push(this.state.strategyControlDetail.url.replace(':id', this.props.params.id).replace(':strategyId', this.props.params.strategyId).replace(':strategyControlId', record.id).replace(":setOfBooksId",this.props.params.setOfBooksId));
  };

  handleSearch= (value) => {
    this.setState({
      page: 0,
      keyWords: value,
      pagination: {
        current: 1
      }
    }, () => {
      this.getList();
    })
  };

  //更新基本信息
  handleUpdate = (params) => {
    params.id = this.props.strategyId;
    params.versionNumber = this.state.infoData.versionNumber;
    if(!params.controlStrategyCode || !params.controlStrategyName) return;
    this.setState({ baseInfoLoading: true }, () => {
      httpFetch.put(`${config.budgetUrl}/api/budget/control/strategies`, params).then((res) => {
        if(res.status === 200) {
          message.success(this.$t({id: "common.save.success"}, {name: ""}/*保存成功*/));
          this.getBasicInfo();
          this.setState({ updateState: true, baseInfoLoading: false },() => {
            this.setState({ updateState: false })
          })
        }
      }).catch((e) => {
        this.setState({ updateState: false, baseInfoLoading: false });
        message.error(`${this.$t({id: "common.save.filed"},/*保存失败*/)}, ${e.response.data.message}`);
      })
    });
  };

  //返回到预算组织详情页
  handleBack = () => {
    this.context.router.push(this.state.budgetOrganizationDetail.url.replace(':id', this.props.params.id).replace(":setOfBooksId",this.props.params.setOfBooksId) + '?tab=STRATEGY');
  };

  render(){
    const { infoList, infoData, columns, data, loading, pagination, updateState, baseInfoLoading } = this.state;
    return (
      <div className="budget-strategy-detail">
        <BasicInfo infoList={infoList}
                   infoData={infoData}
                   updateHandle={this.handleUpdate}
                   updateState={updateState}
                   loading={baseInfoLoading}/>
        <div className="table-header">
          <div className="table-header-title">
            <h5>{this.$t({id: "budget.strategy.detail"}/*策略明细*/)}</h5>
            {this.$t({id: "common.total"},{total:`${pagination.total || 0}`}/*共搜索到 {total} 条数据*/)}
          </div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{this.$t({id: "common.create"}/*新建*/)}</Button>
            <Search className="input-search"
                    placeholder={this.$t({id: "budget.strategy.input.name.code"}/*请输入策略明细名称/代码*/)}
                    onChange={(e) => this.handleSearch(e.target.value)} />
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               rowKey={record => record.id}
               loading={loading}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               bordered
               size="middle"/>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}>
          <Icon type="rollback" style={{marginRight:'5px'}}/>
          {this.$t({id: "common.back"}/*返回*/)}
        </a>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization,
    strategyId: state.budget.strategyId
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetStrategyDetail);
