/**
 * created by jsq on 2017/9/26
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Table} from 'antd'
import SearchArea from 'widget/search-area';
import budgetService from 'containers/budget-setting/budget-organization/budget-control-rules/budget-control-rulles.service'
import config from 'config'

class BudgetControlRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      searchParams: {
        controlRuleCodeFrom: "",
        controlRuleCodeTo: "",
        priority: "",
      },
      pagination: {
        current:0,
        page:0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      searchForm: [
        /*控制规则从*/
        { type: 'select', id: 'controlRuleCodeFrom', label:this.$t({id: 'budget.controlRulesFrom'}), options:[],labelKey: 'controlRuleName',valueKey: 'controlRuleCode',
          getUrl:`${config.budgetUrl}/api/budget/control/rules/query/all`, method: 'get', getParams: {organizationId: this.props.id},
        },
        /*控制规则到*/
        { type: 'select', id: 'controlRuleCodeTo', label: this.$t({id: 'budget.controlRulesTo'}), options: [],labelKey: 'controlRuleName',valueKey: 'controlRuleCode',
          getUrl:`${config.budgetUrl}/api/budget/control/rules/query/all`, method: 'get', getParams: {organizationId: this.props.id},
        },
        /*优先级*/
        { type: 'select', id: 'priority', label: this.$t({id: 'budget.controlRules.priority'}), options: [],labelKey: 'priority',valueKey: 'priority',
          getUrl:`${config.budgetUrl}/api/budget/control/rules/query/all`, method: 'get', getParams: {organizationId: this.props.id},
        }
      ],
      columns: [
        {          /*优先级*/
          title: this.$t({id:"budget.controlRules.priority"}), key: "priority", dataIndex: 'priority'
        },
        {          /*控制规则代码*/
          title: this.$t({id:"budget.controlRuleCode"}), key: "controlRuleCode", dataIndex: 'controlRuleCode'
        },
        {          /*控制规则名称*/
          title: this.$t({id:"budget.controlRuleName"}), key: "controlRuleName", dataIndex: 'controlRuleName'
        },
        {          /*控制策略*/
          title: this.$t('budget.strategy.control.strategy')/*控制策略*/, key: "strategyGroupName", dataIndex: 'strategyGroupName'
        },
        {
          /*有效日期*/
          title: this.$t({id: "budget.controlRule.effectiveDate"}),
          key: "effectiveDate",
          dataIndex: 'effectiveDate',
          render: (recode, record) => {
            let endDate = record.endDate === null ? "" : record.endDate.substring(0,10);
            return record.startDate.substring(0,10)+" ~ "+endDate
          }
        },
      ]
    }
    ;
  }

  componentWillMount(){
    this.getList();
  }

  handleSearch = (values) =>{
    let searchParams = {
      controlRuleCodeFrom: values.controlRuleCodeFrom,
      controlRuleCodeTo: values.controlRuleCodeTo,
      priority: values.priority
    };

    this.setState({
      searchParams:searchParams,
      loading: true,
      page: 1
    }, ()=>{
      this.getList();
    })
  };

  //获取控制规则数据
  getList(){
    let params = Object.assign({}, this.state.searchParams);
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.organizationId = this.props.id;
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    budgetService.getRuleByOptions(params).then((response)=>{
      if(response.status === 200){
        response.data.map((item)=>{
          item.key = item.id;
        });
        this.setState({
          loading: false,
          data: response.data,
          pagination: {
            page: this.state.pagination.page,
            current: this.state.pagination.current,
            pageSize:this.state.pagination.pageSize,
            showSizeChanger:true,
            showQuickJumper:true,
            total: Number(response.headers['x-total-count']),
          }
        },()=>{
          //this.refreshRowSelection()
        })
      }
    })
  }

  //分页点击
  onChangePager = (pagination,filters, sorter) =>{
    let temp = this.state.pagination;
    temp.page = pagination.current-1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, ()=>{
      this.getList();
    })
  };

  //新建
  handleCreate = () =>{
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.newBudgetControlRules.url.replace(':id', this.props.id).replace(":setOfBooksId",this.props.setOfBooksId));
  };

//点击行，进入该行详情页面
  handleRowClick = (record, index, event) =>{
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetControlRulesDetail.url.replace(':id', this.props.id).replace(':ruleId', record.id).replace(":setOfBooksId",this.props.setOfBooksId));
  };

  render(){
    const { searchForm, loading, columns, pagination, data} = this.state;
    return (
      <div className="budget-control-rule">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.create'})}</Button>  {/*新 建*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          onRow={record => ({
            onClick: () => this.handleRowClick(record)
          })}
          pagination={pagination}
          onChange={this.onChangePager}
          size="middle"
          bordered/>
      </div>
    )
  }
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetControlRules);
