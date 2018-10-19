import React from 'react'
import menuRoute from 'routes/menuRoute'
import config from 'config'
import { Form, Button, Table, message, Popover } from 'antd'

import occupancyService from 'containers/budget/budget-occupancy/budget-occupancy.service'
import moment from 'moment'
import SearchArea from 'components/search-area'

import { formatMessage } from "share/common"

class BudgetOccupancy extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searchParams: {},
      searchForm: [
        {type: 'input', id: 'batchNumber', label: formatMessage({id: "budget.occupancy.import.num"}/*导入批次号*/)},
        {type: 'select', id: 'employeeId', label: formatMessage({id: "budget.occupancy.create.people"}/*创建人*/), options: [],
          getUrl: `${config.budgetUrl}/api/budget/reserve/adjust/getEmployee`, method: 'get', labelKey: 'employeeName', valueKey: 'employeeId',
          renderOption: (data) => `${data.employeeName} - ${data.employeeId}`},
        {type: 'items', id: 'rangeDate', items: [
          {type: 'date', id: 'createdDateFrom', label: formatMessage({id: "budget.occupancy.create.date.from"}/*导入日期从*/)},
          {type: 'date', id: 'createdDateTo', label: formatMessage({id: "budget.occupancy.create.date.to"}/*导入日期至*/)}
        ]}
      ],
      columns: [
        {title: formatMessage({id: "budget.occupancy.import.num"}/*导入批次号*/), dataIndex: 'batchNumber'},
        {title: formatMessage({id: "budget.occupancy.explain"}/*说明*/), dataIndex: 'remark', width: '40%',
          render: value => <Popover content={value}>{value}</Popover>},
        {title: formatMessage({id: "budget.occupancy.create.people"}/*创建人*/), dataIndex: 'employeeName', render: (value, record) => value + ' - ' + record.createdBy},
        {title: formatMessage({id: "budget.occupancy.create.date"}/*导入日期*/), dataIndex: 'createdDate', render: value => moment(value).format('YYYY-MM-DD')},
        {title: formatMessage({id: "common.operation"}/*操作*/), dataIndex: 'id',
          render: (id, record) => <a onClick={() => this.checkDetail(record)}>{formatMessage({id: "budget.occupancy.check.details"}/*查看详情*/)}</a>},
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      newBudgetOccupancy:  menuRoute.getRouteItem('new-budget-occupancy','key'),    //新建预算占用调整
      importDetail:  menuRoute.getRouteItem('import-detail','key'),    //导入详情
    }
  }

  componentWillMount() {
    this.getList()
  }

  getList = () => {
    const { page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    occupancyService.getOccupancyList(page, pageSize, searchParams).then(res => {
      this.setState({
        loading: false,
        data: res.data,
        pagination: {
          total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
          onChange: this.onChangePager,
          current: page + 1
        }
      })
    }).catch(() => {
      this.setState({ loading: false });
      message.error(formatMessage({id: "common.error"}/*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/))
    })
  };

  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({ page: page - 1 }, ()=>{
        this.getList();
      })
  };

  search = (values) => {
    values.createdDateFrom && (values.createdDateFrom = moment(values.createdDateFrom).format('YYYY-MM-DD'));
    values.createdDateTo && (values.createdDateTo = moment(values.createdDateTo).format('YYYY-MM-DD'));
    this.setState({ searchParams: values },() => {
      this.getList()
    })
  };

  clear = () => {
    this.setState({ searchParams: {} })
  };

  //新建
  handleNew = () => {
    this.context.router.push(this.state.newBudgetOccupancy.url);
  };

  //查看详情
  checkDetail = (record) => {
    this.context.router.push(this.state.importDetail.url.replace(':id', record.id).replace(':batchNumber', record.batchNumber));
  };

  render() {
    const { loading, searchForm, pagination, columns, data } = this.state;
    return (
      <div className="budget-occupancy">
        <SearchArea searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}/>
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{formatMessage({id: "common.create"}/*新建*/)}</Button>
          </div>
          <div className="table-header-title">{formatMessage({id: "common.total"},{total:`${pagination.total || 0}`}/*共搜索到 {total} 条数据*/)}</div>
        </div>
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               bordered
               size="middle"/>
      </div>
    )
  }
}

BudgetOccupancy.contextTypes = {
  router: React.PropTypes.object
};

const wrappedBudgetOccupancy = Form.create()((BudgetOccupancy));

export default wrappedBudgetOccupancy;
