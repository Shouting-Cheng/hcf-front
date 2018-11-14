import React from 'react'
import { connect } from 'dva'
import { Table, Badge, Button } from 'antd';
import budgetGroupService from 'containers/budget-setting/budget-organization/budget-group/budget-group.service'
import { routerRedux } from 'dva/router';
import SearchArea from 'widget/search-area'

class BudgetGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        {title: this.$t('budgetGroup.code')/*'预算项目组代码'*/, dataIndex: 'itemGroupCode', width: '35%'},
        {title: this.$t('budgetGroup.name')/*'预算项目组名称'*/, dataIndex: 'itemGroupName', width: '50%'},
        {title: this.$t('common.column.status')/* 状态 */, dataIndex: 'enabled', width: '15%', render: enabled => <Badge status={enabled ? 'success' : 'error'} text={enabled ? this.$t('common.status.enable')/*启用*/ : this.$t('common.status.disable')/*禁用*/} />}
      ],
      pagination: {
        total: 0
      },
      searchForm: [
        {type: 'input', id: 'itemGroupCode', label: this.$t('budgetGroup.code')/*'预算项目组代码'*/,},
        {type: 'input', id: 'itemGroupName', label: this.$t('budgetGroup.name')/*'预算项目组名称'*/}
      ],
      searchParams: {
        groupCode: '',
        groupName: ''
      },
    };
  }

  componentWillMount(){
    this.getList();
  }

  getList(){
    this.setState({loading: true});
    let params = Object.assign({}, this.state.searchParams);
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.pageSize = this.state.pageSize;
    params.organizationId = this.props.id;
    return budgetGroupService.getOrganizationGroups(params).then(response => {
      response.data.map(item => {
        item.key = item.id
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    })
  }

  clear = () => {
    this.setState({
      searchParams: {
        groupCode: '',
        groupName: ''
      }
    })
  };

  search = (result) => {
    this.setState({
      page: 0,
      searchParams: {
        itemGroupCode: result.itemGroupCode ? result.itemGroupCode : '',
        itemGroupName: result.itemGroupName ? result.itemGroupName : ''
      }
    }, ()=>{
      this.getList();
    })
  };

  handleNew = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-group/new-budget-group/:setOfBooksId/:orgId'
          .replace(':orgId', this.props.id)
          .replace(':setOfBooksId',this.props.setOfBooksId)
      })
    );
  };

  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, ()=>{
        this.getList();
      })
  };

  handleRowClick = (record) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-group/budget-group-detail/:setOfBooksId/:orgId/:id'
          .replace(':orgId', this.props.organization.id)
          .replace(":setOfBooksId",this.props.setOfBooksId)
          .replace(':id', record.id)
      })
    );
  };

  render(){
    const { columns, data, loading,  pagination, searchForm } = this.state;
    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total1',{total:pagination.total})}{/*共 {pagination.total} 条数据*/}</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{this.$t('common.create')}{/*新建*/}</Button>
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               bordered
               onRow={record => ({onClick: () => this.handleRowClick(record)})}
               size="middle"/>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetGroup);
