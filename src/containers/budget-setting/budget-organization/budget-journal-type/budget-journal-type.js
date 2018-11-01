import React from 'react'
import { connect } from 'dva'

import { Table, Badge, Button } from 'antd'

import SearchArea from 'widget/search-area'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { routerRedux } from 'dva/router';

class BudgetJournalType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        {title: '预算日记账类型代码', dataIndex: 'journalTypeCode', width: '30%'},
        {title: '预算日记账类型名称', dataIndex: 'journalTypeName', width: '30%'},
        {title: '预算业务类型', dataIndex: 'businessTypeName', width: '25%'},
        {title: '关联表单', dataIndex: 'formName', width: '25%'},
        {title: '状态', dataIndex: 'enabled', width: '15%', render: enabled => <Badge status={enabled ? 'success' : 'error'} text={enabled ? '启用' : '禁用'} />}
      ],
      pagination: {
        total: 0
      },
      searchForm: [
        {type: 'input', id: 'journalTypeCode', label: '预算日记账类型代码'},
        {type: 'input', id: 'journalTypeName', label: '预算日记账类型名称'}
      ],
      searchParams: {
        journalTypeCode: '',
        journalTypeName: ''
      },
    };
  }

  componentWillMount(){
    this.getList();
  }

  getList(){
    let params = this.state.searchParams;
    let url = `${config.budgetUrl}/api/budget/journal/types/query?&page=${this.state.page}&size=${this.state.pageSize}&organizationId=${this.props.organization.id}`;
    for(let paramsName in params){
      url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
    }
    return httpFetch.get(url).then((response)=>{
      response.data.map((item)=>{
        item.key = item.id;
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
    });
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

  search = (result) => {
    console.log(result);
    this.setState({
      page: 0,
      searchParams: {
        journalTypeCode: result.journalTypeCode ? result.journalTypeCode : '',
        journalTypeName: result.journalTypeName ? result.journalTypeName : ''
      }
    }, ()=>{
      this.getList();
    })
  };

  clear = () => {
    this.setState({
      searchParams: {
        journalTypeCode: '',
        journalTypeName: ''
      }
    })
  };

  handleNew = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-journal-type/new-budget-journal-type/:setOfBooksId/:orgId'
          .replace(':orgId', this.props.organization.id)
          .replace(':setOfBooksId',this.props.setOfBooksId)
      })
    );
  };

  handleRowClick = (record) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-journal-type/budget-journal-type-detail/:setOfBooksId/:orgId/:id'
          .replace(':orgId', this.props.organization.id)
          .replace(':setOfBooksId',this.props.setOfBooksId)
          .replace(':id', record.id)
      })
    );
  };

  render(){
    const { searchForm, pagination, columns, data, loading } = this.state;
    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}/>
        <div className="table-header">
          <div className="table-header-title">共 {pagination.total} 条数据</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>新 建</Button>
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
  return {
    organization: state.budget.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetJournalType);
