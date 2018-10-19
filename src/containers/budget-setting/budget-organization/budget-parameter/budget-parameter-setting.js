/**
 * created by jsq on 2017/9/18
 */
import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import { Button, Table, Badge, notification, Popover  } from 'antd';
import SearchArea from 'components/search-area';
import httpFetch from 'share/httpFetch';
import config from 'config'

//import menuRoute from 'share/menuRoute'
import menuRoute from 'routes/menuRoute'
import SlideFrame from 'components/slide-frame'
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
        {type: 'input', id: 'parameterCode', label: formatMessage({id: 'budget.parameterCode'}) }, /*参数代码*/
        {type: 'input', id: 'parameterName', label: formatMessage({id: 'budget.parameterName'}) }, /*参数名称*/
      ],
      columns: [
        {          /*参数代码*/
          title: formatMessage({id:"budget.parameterCode"}), key: "parameterCode", dataIndex: 'parameterCode'
        },
        {          /*参数名称*/
          title: formatMessage({id:"budget.parameterName"}), key: "parameterName", dataIndex: 'parameterName'
        },
        {          /*参数值代码*/
          title: formatMessage({id:"budget.parameterValueCode"}), key: "parameterValueCode", dataIndex: 'parameterValueCode'

        },
        {          /*参数值名称*/
          title: formatMessage({id:"budget.parameterValueName"}), key: "parameterValueName", dataIndex: 'parameterValueName'

        },
        {title: formatMessage({id:"common.operation"}), key: 'operation', width: '15%', render: (text, record) => (
          <span>
              <a href="#" onClick={(e) => this.editItem(e, record)}>{formatMessage({id: "common.edit"})}</a>
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
    httpFetch.get(`${config.budgetUrl}/api/budget/organizations/${this.props.params.id}`).then((response)=>{
      this.setState({
        organization: response.data
      })
    });
    this.getList();
  }

  //获取预算表数据
  getList(){
    let params = this.state.searchParams;
    let url = `${config.budgetUrl}/api/budget/parameterSettings/dto/query?organizationId=${this.props.params.id}&page=${this.state.pagination.page}&size=${this.state.pagination.pageSize}`;
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
        description: formatMessage({id:"structure.validateCreate"})  /*请维护当前账套下的预算组织*/
      })
    }
  };

  //点击行，进入该行详情页面
  handleRowClick = (record, index, event) =>{
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetStructureDetail.url.replace(':id', this.props.id).replace(':structureId', record.id));
  };

  render(){
    const { searchForm, loading, data, columns, pagination, nowOrganization, showSlideFrame} = this.state;
    return (
      <div className="budget-structure">
        <h3 className="header-title">{this.state.organization.organizationName}</h3>
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            {/* <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.create'})}</Button>  新 建 */}
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
        {/* 编辑参数设置 */}
        <SlideFrame title={formatMessage({id:"budget.parameter.setting.edit"})}
                    show={showSlideFrame}
                    content={UpdateBudgetOrganization}
                    afterClose={this.handleCloseSlide}
                    onClose={() => this.setState({showSlideFrame : false})}
                    params={nowOrganization}/>
      </div>
    )
  }

}

BudgetParameterSetting.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetParameterSetting);
