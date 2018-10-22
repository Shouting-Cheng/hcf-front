/**
 * created by jsq on 2017/12/27
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Table, Badge} from 'antd'
import SlideFrame from 'widget/slide-frame'
import NewUpdateScenariosSystem from 'containers/financial-accounting-setting/accounting-scenarios-system/new-update-scenarios-system'
import SearchArea from 'widget/search-area';
import 'styles/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system.scss'
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system.service';
import { routerRedux } from 'dva/router';

class AccountingScenariosSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataVisible: false,
      data: [],
      lov:{
        visible: false
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      searchParams:{
        glSceneCode: "",
        glSceneName: ""
      },
      searchForm: [
        {                                                                        //核算场景代码
          type: 'input', id: 'glSceneCode', label: this.$t({id: 'accounting.scenarios.code'})
        },
        {                                                                        //核算场景名称
          type: 'input', id: 'glSceneName', label: this.$t({id: 'accounting.scenarios.name'})
        },
      ],
      columns: [
        {          /*核算场景代码*/
          title: this.$t({id:"accounting.scenarios.code"}), key: "glSceneCode", dataIndex: 'glSceneCode'
        },
        {          /*核算场景名称*/
          title: this.$t({id:"accounting.scenarios.name"}), key: "glSceneName", dataIndex: 'glSceneName'
        },
        {           /*状态*/
          title: this.$t({id:"common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={ enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})} />
          )
        },
        {title: this.$t({id:"accounting.scenarios.elements"}), key: 'elements', width: '10%', render: (text, record, index) => (
          <span>
            <a onClick={(e) => this.handleLinkElement(e, record,index)}>{this.$t({id: "accounting.scenarios.elements"})}</a>   {/*编辑*/}
          </span>)
        },
        {title: this.$t({id:"common.operation"}), key: 'operation', width: '8%', render: (text, record, index) => (
          <span>
            <a onClick={(e) => this.handleUpdate(e, record,index)}>{this.$t({id: "common.edit"})}</a>   {/*编辑*/}
          </span>)
        },
      ],
    };
  }

  handleLinkElement = (e, record,index)=>{
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-scenarios-system/accounting-elements/:id'
          .replace(':id', record.id)
      })
    )
  };

  componentWillMount() {
    this.getList();
  }

  getList(){
    this.setState({loading: true});
    let params = this.state.searchParams;
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    accountingService.getAccountingScenarios(params).then(response=>{
      response.data.map(item=>{
        item.key = item.id;
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination,
        searchParams: {
          glSceneCode: "",
          glSceneName: ""
        }
      })
    })
  }

  handleSearch = (params)=>{
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    this.setState({
      searchParams: params
    },this.getList);
  };

  handleCreate = ()=>{
    let lov = {
      title: this.$t({id:"accounting.scenarios.new"}),
      visible: true,
      params: {flag: true}
    };
    this.setState({
      lov
    });
  };

  handleUpdate = (e,record,index)=>{
    let lov = {
      title: this.$t({id:"accounting.scenarios.update"}),
      visible: true,
      params: record
    };
    this.setState({
      lov
    })
  };

  handleAfterClose = (params)=>{
    this.setState({
      lov:{
        visible: false,
        loading: params,
      }
    },()=>{
      if(params){
        this.getList()
      }
    })
  };

  handleShowSlide = ()=>{
    this.setState({
      lov:{
        visible: false
      }
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

  render(){
    const { loading, data, columns, searchForm, pagination, lov, dataVisible } = this.state;
    return(
      <div className="accounting-scenarios-system">
        {/*<div className="accounting-scenarios-head-tips">
          {this.$t({id:"accounting.scenarios.system.tips"})}
        </div>*/}
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
          pagination={pagination}
          onChange={this.onChangePager}
          bordered
          size="middle"/>
        <SlideFrame title= {lov.title}
                    show={lov.visible}
                    onClose={()=>this.handleShowSlide(false)}>
            <NewUpdateScenariosSystem
              onClose={this.handleAfterClose}
              params={{...lov.params,visible: lov.visible}}/>
        </SlideFrame>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingScenariosSystem);
