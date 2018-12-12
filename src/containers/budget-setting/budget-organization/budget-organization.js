import React from 'react'
import { connect } from 'dva'
import { Table, Badge, Button, Popover, message } from 'antd';
import config from 'config'

import budgetOrganizationService from 'containers/budget-setting/budget-organization/budget-organnization.service'
import UpdateBudgetOrganization from 'containers/budget-setting/budget-organization/update-budget-organization'
import SearchArea from 'widget/search-area'
import SlideFrame from 'widget/slide-frame'
import { routerRedux } from 'dva/router';


class BudgetOrganization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        {title: this.$t({id:"budget.organization.code"}), dataIndex: 'organizationCode', width: '20%'},  //预算组织代码
        {title: this.$t({id:"budget.organization.name"}), dataIndex: 'organizationName', width: '30%',   //预算组织名称
          render: organizationName => (
            <Popover content={organizationName}>
              {organizationName}
            </Popover>)
        },
        {title: this.$t({id:"budget.organization.set.of.books"}), dataIndex: 'setOfBooksName', width: '20%'},  //账套
        {title: this.$t({id:"common.column.status"}), dataIndex: 'enabled', width: '15%',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})} />
          )}, //状态
        {title: this.$t({id:"common.operation"}), key: 'operation', width: '15%', render: (text, record) => (
          <span>
            <a href="#" onClick={(e) => this.editItem(e, record)}>{this.$t({id: "common.edit"})}</a>
            <span className="ant-divider" />
            <a onClick={e => this.parameterSetting(e, record)}>{this.$t({ id: 'budget.parameter.setting' })}</a>
          </span>)},  //操作
      ],
      pagination: {
        total: 0
      },
      searchForm: [
        {type: 'select', id: 'setOfBooksId', label: this.$t({id:"budget.organization.set.of.books"}), options: [],
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`, method: 'get', labelKey: 'setOfBooksCode', valueKey: 'id',
          renderOption: option => option.setOfBooksCode + '-' + option.setOfBooksName,
          getParams: {roleType: 'TENANT'}}, //账套
        {type: 'input', id: 'organizationCode', label: this.$t({id:"budget.organization.code"})},  //预算组织代码
        {type: 'input', id: 'organizationName', label: this.$t({id:"budget.organization.name"})}  //预算组织名称
      ],
      searchParams: {
        setOfBooksId: '',
        organizationCode: '',
        organizationName: ''
      },
      nowOrganization: {},
      showSlideFrame: false
    };
  }

  //参数设置
  parameterSetting = (e, record) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-parameter/budget-parameter-setting/:id'
          .replace(':id', record.id)
      })
    );
  };

  componentWillMount(){
    this.getList();
  }

  editItem = (e, record) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      nowOrganization: {...record},
      showSlideFrame: true
    })
  };

  //得到列表数据
  getList(){
    this.setState({ loading: true });
    let params = Object.assign({}, this.state.searchParams);
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.pageSize = this.state.pageSize;
    return budgetOrganizationService.getOrganizations(params).then((response)=>{
      response.data.map((item)=>{
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']) ? Number(response.headers['x-total-count']) : 0,
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    }).catch(e => {
      message.error(this.$t({id: 'common.error'}));
      this.setState({loading: false});
    });
  }

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };

  handleRowClick = (record) => {
    //将预算组织设置到redux
    this.props.dispatch({
      type: 'budget/setOrganization',
      organization: record,
    });
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
          .replace(':id', record.id).replace(":setOfBooksId",record.setOfBooksId)
      })
    );
  };

  search = (result) => {
    this.setState({
      page: 0,
      searchParams: {
        setOfBooksId: result.setOfBooksId ? result.setOfBooksId : '',
        organizationCode: result.organizationCode ? result.organizationCode : '',
        organizationName: result.organizationName ? result.organizationName : ''
      }
    }, ()=>{
      this.getList();
    })
  };

  clear = () => {
    this.setState({
      searchParams: {
        setOfBooksId: '',
        organizationCode: '',
        organizationName: ''
      }
    })
  };

  searchEventHandle = (event, value) => {
    console.log(event, value)
  };

  handleNew = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/new-budget-organization'
      })
    );
  };

  handleCloseSlide = (success) => {
    success && this.getList();
    this.setState({showSlideFrame : false});
  };

  render(){
    const { columns, data, loading,  pagination, searchForm, nowOrganization, showSlideFrame } = this.state;
    return (
      <div className="budget-organization">
        <h3 className="header-title">{this.$t({id:"menu.budget-organization"})}</h3> {/* 预算组织定义 */}
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}
          eventHandle={this.searchEventHandle}/>

        <div className="table-header">
          <div className="table-header-title">{this.$t({id:"common.total"}, {total: pagination.total ? pagination.total : '0'})}</div> {/* 共total条数据 */}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{this.$t({id:"common.create"})}</Button> {/* 新建 */}
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               bordered
               onRow={record => ({onClick: () => this.handleRowClick(record)})}
               size="middle"/>
        {/* 编辑预算组织 */}
        <SlideFrame title={this.$t({id:"budget.organization.edit"})}
                    show={showSlideFrame}
                    onClose={() => this.setState({showSlideFrame : false})}>
          <UpdateBudgetOrganization
            onClose={this.handleCloseSlide}
            params={nowOrganization}/>
        </SlideFrame>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetOrganization);
