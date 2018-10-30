import React from 'react'
import { connect } from 'dva'


import { Table, Popconfirm, Button } from 'antd'
import httpFetch from 'share/httpFetch'
import config from 'config'

class BudgetBalanceCondition extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: [],
      page: 0,
      size: 10,
      pagination: {
        total: 0,
      },
      columns: [
        {title: this.$t('budget.balance.condition.code'), dataIndex: 'conditionCode', width: '35%'},
        {title: this.$t('budget.balance.condition.name'), dataIndex: 'conditionName', width: '35%'},
        {title: this.$t('budget.balance.operate'), dataIndex: 'operation', width: '30%', render: (text, record) => (
          <span>
            <a href="#" onClick={(e) => this.useCondition(e, record)}>{this.$t('budget.balance.use.condition')/*使用方案*/}</a>
            <span className="ant-divider" />
            <Popconfirm onConfirm={(e) => this.deleteCondition(e, record)} title={this.$t('budget.balance.are.you.sure.to.delete.this.data')/*你确定要删除吗？*/}>
              <a href="#" onClick={(e) => {e.preventDefault();e.stopPropagation();}}>{this.$t('common.delete')}</a>
            </Popconfirm>
          </span>)}
      ]
    };
  }

  componentDidMount(){
    this.getList();
  };

  getList = () => {
    const { page, size } = this.state;
    this.setState({ loading: true });
    return httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/header/list/solution`, {page, size}).then(res => {
      this.setState({ data: res.data, loading: false,  pagination: {
        total: Number(res.headers['x-total-count']),
        onChange: this.onChangePager,
        current: this.state.page + 1
      } })
    })
  };

  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({page: page - 1,}, this.getList)
  };

  useCondition = (e, record) => {
    this.setState({ loading: true });
    httpFetch.get(`${config.budgetUrl}/api/budget/balance/query/header/${record.id}`).then(res => {
      this.setState({ loading: false });
      this.props.close(res.data);
    })
  };

  deleteCondition = (e, record) => {
    this.setState({ loading: true });
    httpFetch.delete(`${config.budgetUrl}/api/budget/balance/query/header/${record.id}`).then(res => {
      this.setState({ loading: false });
      this.getList();
    })
  };

  onCancel = () => {
    this.props.close();
  };

  render(){
    const { columns, data, loading, pagination } = this.state;
    
    return (
      <div>
        <Table columns={columns}
               loading={loading}
               dataSource={data}
               size="middle"
               pagination={pagination}
               bordered rowKey="id"/>
        <div className="slide-footer">
          <Button type="primary" onClick={this.getList} loading={loading}>{this.$t('budget.balance.refresh.list')}</Button>
        </div>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetBalanceCondition);
