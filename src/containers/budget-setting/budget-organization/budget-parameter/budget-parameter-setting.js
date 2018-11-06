/**
 * created by jsq on 2017/9/18
 */
import React from 'react'
import { connect } from 'dva'
import {Button, Table, Badge, notification, Popover, Icon} from 'antd';
import SearchArea from 'widget/search-area';
import httpFetch from 'share/httpFetch';
import config from 'config'
import { routerRedux } from 'dva/router';

//import menuRoute from 'share/menuRoute'
import SlideFrame from 'widget/slide-frame'
import 'styles/budget-setting/budget-organization/budget-structure/budget-structure.scss';
import UpdateBudgetOrganization from 'containers/budget-setting/budget-organization/budget-parameter/update-budget-parameter-setting'

class BudgetParameterSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      organization:{},
      searchParams: {
        parameterCode: "",
        parameterName: ""
      },
      pagination: {
        current: 1,
        page: 0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      searchForm: [
        {type: 'input', id: 'parameterCode', label: this.$t({id: 'budget.parameterCode'}) }, /*参数代码*/
        {type: 'input', id: 'parameterName', label: this.$t({id: 'budget.parameterName'}) }, /*参数名称*/
      ],
      columns: [
        {          /*参数代码*/
          title: this.$t({id:"budget.parameterCode"}), key: "parameterCode", dataIndex: 'parameterCode'
        },
        {          /*参数名称*/
          title: this.$t({id:"budget.parameterName"}), key: "parameterName", dataIndex: 'parameterName'
        },
        {          /*参数值代码*/
          title: this.$t({id:"budget.parameterValueCode"}), key: "parameterValueCode", dataIndex: 'parameterValueCode'

        },
        {          /*参数值名称*/
          title: this.$t({id:"budget.parameterValueName"}), key: "parameterValueName", dataIndex: 'parameterValueName'

        },
        {title: this.$t({id:"common.operation"}), key: 'operation', width: '15%', render: (text, record) => (
          <span>
              <a onClick={(e) => this.editItem(e, record)}>{this.$t({id: "common.edit"})}</a>
             </span>)}
      ],
      nowOrganization: {},
      showSlideFrame: false
    }
  }
  handleCloseSlide = (success) => {
    success && this.getList();
    this.setState({showSlideFrame : false});
  };
  //编辑
  editItem = (e, record) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      nowOrganization: record,
      showSlideFrame: true
    })
  };
  componentWillMount(){
    //查出当前预算组织数据
    httpFetch.get(`${config.budgetUrl}/api/budget/organizations/${this.props.match.params.id}`).then((response)=>{
      this.setState({
        organization: response.data
      })
    });
    this.getList();
  }

  //获取预算表数据
  getList(){
    let params = this.state.searchParams;
    let url = `${config.budgetUrl}/api/budget/parameterSettings/dto/query?organizationId=${this.props.match.params.id}&page=${this.state.pagination.page}&size=${this.state.pagination.pageSize}`;
    for(let paramsName in params){
      url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
    }
    this.setState({loading: true});
    httpFetch.get(url).then((response)=>{
      response.data.map((item,index)=>{
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        pagination: {
          total: Number(response.headers['x-total-count']),
          current: this.state.pagination.current,
          page: this.state.pagination.page,
          pageSize:this.state.pagination.pageSize,
          showSizeChanger:true,
          showQuickJumper:true,
        },
        loading: false
      })
    })
  };

  handleSearch = (values) =>{
    let searchParams = {
      parameterName: values.parameterName,
      parameterCode: values.parameterCode
    };
    this.setState({
      searchParams:searchParams,
      loading: true,
      page: 1
    }, ()=>{
      this.getList();
    })
  };

  handleBack = () =>{
    this.props.dispatch(routerRedux.replace({
      pathname: '/budget-setting/budget-organization'
    }))
  };
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

  handleCreate = () =>{

    if(this.state.organization.enabled) {
      this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.newBudgetStructure.url.replace(':id', this.props.id));
    }else{
      notification["error"]({
        description: this.$t({id:"structure.validateCreate"})  /*请维护当前账套下的预算组织*/
      })
    }
  };

/*  //点击行，进入该行详情页面
  handleRowClick = (record, index, event) =>{
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetStructureDetail.url.replace(':id', this.props.id).replace(':structureId', record.id));
  };*/

  render(){
    const { searchForm, loading, data, columns, pagination, nowOrganization, showSlideFrame} = this.state;
    return (
      <div className="budget-structure" style={{paddingBottom: 20}}>
        <h3 className="header-title">{this.state.organization.organizationName}</h3>
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            {/* <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.create'})}</Button>  新 建 */}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          onChange={this.onChangePager}
          // onRow={record => ({
          //   onClick: () => this.handleRowClick(record)
          // })}
          size="middle"
          bordered/>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{this.$t({id:"common.back"})}</a>
        {/* 编辑参数设置 */}
        <SlideFrame title={this.$t({id:"budget.parameter.setting.edit"})}
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



function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetParameterSetting);
