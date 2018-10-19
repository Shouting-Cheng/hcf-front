import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import { Button, Table, Badge, Popover, message } from 'antd'
import httpFetch from 'share/httpFetch'
import config from 'config'

import SearchArea from 'components/search-area'
import SlideFrame from 'components/slide-frame'
import NewBudgetScenarios from 'containers/budget-setting/budget-organization/budget-scenarios/new-budget-scenarios'
import UpdateBudgetScenarios from 'containers/budget-setting/budget-organization/budget-scenarios/update-budget-scenarios'

class BudgetScenarios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationInfo: {},
      newParams: {},
      updateParams: {},
      searchForm: [
        {type: 'input', id: 'scenarioCode', label: formatMessage({id: "budget.scenarios.code"}/*预算场景代码*/)},
        {type: 'input', id: 'scenarioName', label: formatMessage({id: "budget.scenarios.name"}/*预算场景名称*/)}
      ],
      searchParams: {
        scenarioCode: "",
        scenarioName: ""
      },
      loading: true,
      columns: [
        {title: formatMessage({id: "budget.scenarios.code"}/*预算场景代码*/), dataIndex: 'scenarioCode', key: 'scenarioCode'},
        {title: formatMessage({id: "budget.scenarios.name"}/*预算场景名称*/), dataIndex: 'scenarioName', key: 'scenarioName',
          render: desc => <Popover placement="topLeft" content={desc}>{desc}</Popover>},
        {title: formatMessage({id: "common.remark"}/*备注*/), dataIndex: 'description', key: 'description',
          render: desc => desc ? <Popover placement="topLeft" content={desc}>{desc}</Popover> : '-'},
        {title: formatMessage({id: "budget.scenarios.default"}/*默认场景*/), dataIndex: 'defaultFlag', key: 'defaultFlag', width: '10%' ,
          render: defaultFlag => defaultFlag ? 'Y' : '-'},
        {title: formatMessage({id: "common.column.status"}/*状态*/), dataIndex: 'enabled', key: 'enabled', width: '10%', render: enabled =>
          <Badge status={enabled ? 'success' : 'error'}
                 text={enabled ? formatMessage({id: "common.status.enable"}/*启用*/) : formatMessage({id: "common.status.disable"}/*禁用*/)} />}
      ],
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      data: [],
      showSlideFrame: false,
      showUpdateSlideFrame: false,
    }
  }

  componentWillMount(){
    this.setState({
      organizationInfo: this.props.organization,
      newParams: {
        organizationName: this.props.organization.organizationName,
        organizationId: this.props.organization.id
      }
    }, () => {
      this.getList();
    })
  }

  getList(){
    let { page, pageSize, organizationInfo, searchParams } = this.state;
    let url = `${config.budgetUrl}/api/budget/scenarios/query?page=${page}&size=${pageSize}&organizationId=${organizationInfo.id}`;
    for(let paramsName in searchParams){
      url += searchParams[paramsName] ? `&${paramsName}=${searchParams[paramsName]}` : '';
    }
    this.setState({ loading: true });
    organizationInfo.id && httpFetch.get(url).then(res => {
      if (res.status === 200) {
        res.data.map((item, index) => {
          item.index = this.state.page * this.state.pageSize + index + 1;
          item.key = item.index;
        });
        this.setState({
          data: res.data,
          loading: false,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            onChange: this.onChangePager,
            current: page + 1
          }
        })
      }
    }).catch(()=>{
      this.setState({ loading: false });
      message.error(formatMessage({id: "common.error"}/*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/))
    })
  }

  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({
        page: page - 1
      }, ()=>{
        this.getList();
      })
  };

  //搜索
  search = (result) => {
    let searchParams = {
      scenarioCode: result.scenarioCode,
      scenarioName: result.scenarioName
    };
    this.setState({
      searchParams:searchParams,
      page: 0,
      pagination: {
        current: 1
      }
    }, ()=>{
      this.getList();
    })
  };

  //清空搜索区域
  clear = () => {
    this.setState({searchParams: {
      scenarioCode: "",
      scenarioName: ""
    }})
  };

  showSlide = (flag) => {
    this.setState({
      showSlideFrame: flag
    })
  };

  showUpdateSlide = (flag) => {
    this.setState({
      showUpdateSlideFrame: flag
    })
  };

  handleCloseSlide = (params) => {
    this.setState({
      showSlideFrame: false
    },() => {
      params && this.getList()
    })
  };
  handleCloseUpdateSlide = (params) => {
    this.setState({
      showUpdateSlideFrame: false
    },() => {
      params && this.getList()
    })
  };

  handleRowClick = (record) => {
    record.organizationName = this.state.organizationInfo.organizationName;
    record.organizationId = this.state.organizationInfo.id;
    this.setState({
      updateParams: record
    }, () => {
      this.showUpdateSlide(true)
    })
  };

  render(){
    const { searchForm, columns, pagination, loading, data, showSlideFrame, showUpdateSlideFrame, updateParams, newParams } = this.state;
    return (
      <div className="budget-scenarios">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}
          eventHandle={this.searchEventHandle}/>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id: "common.total"},{total:`${pagination.total || 0}`}/*共搜索到 {total} 条数据*/)}</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={() => this.showSlide(true)}>{formatMessage({id: "common.create"}/*新建*/)}</Button>
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               bordered
               size="middle"/>

        <SlideFrame title={formatMessage({id: "budget.scenarios.new"}/*新建预算场景*/)}
                    show={showSlideFrame}
                    content={NewBudgetScenarios}
                    afterClose={this.handleCloseSlide}
                    onClose={() => this.showSlide(false)}
                    params={{...newParams,flag: showSlideFrame}}/>
        <SlideFrame title={formatMessage({id: "budget.scenarios.edit"}/*编辑预算场景*/)}
                    show={showUpdateSlideFrame}
                    content={UpdateBudgetScenarios}
                    afterClose={this.handleCloseUpdateSlide}
                    onClose={() => this.showUpdateSlide(false)}
                    params={{...updateParams,flag: showUpdateSlideFrame}}/>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetScenarios);
