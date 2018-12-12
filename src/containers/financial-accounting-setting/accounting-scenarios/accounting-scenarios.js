/**
 * created by jsq on 2017/12/27
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Badge, message} from 'antd'
import Table from 'widget/table'
import SlideFrame from 'widget/slide-frame'
import NewUpdateScenariosSystem from 'containers/financial-accounting-setting/accounting-scenarios/new-update-accounting-scenarios'
import SearchArea from 'widget/search-area';
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios.service';
import 'styles/financial-accounting-setting/accounting-scenarios/accounting-scenarios.scss'
import ListSelector from 'widget/list-selector'
import baseService from 'share/base.service'
import { routerRedux } from 'dva/router';

class AccountingScenarios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      scenariosVisible: false,
      data: [],
      lov:{
        visible: false
      },
      searchParams:{
        setOfBooksId: this.props.company.setOfBooksId,
        transactionSceneCode: "",
        transactionSceneName: ""
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      searchForm: [
        { type: 'select', id: 'setOfBooksId', label: this.$t({id: 'section.setOfBook'}), options:[],labelKey: 'setOfBooksName',valueKey: 'id',
          defaultValue: this.props.company.setOfBooksId,
          //getUrl:`${config.baseUrl}/api/setOfBooks/by/tenant`, method: 'get', getParams: {roleType: 'TENANT'},
          event: 'SOB',
          isRequired: true
        },
        {                                                                        //核算场景代码
          type: 'input', id: 'transactionSceneCode', label: this.$t({id: 'accounting.scenarios.code'})
        },
        {                                                                        //核算场景名称
          type: 'input', id: 'transactionSceneName', label: this.$t({id: 'accounting.scenarios.name'})
        },
      ],
      columns: [
        {          /*账套*/
          title: this.$t({id:"section.setOfBook"}), key: "setOfBooksName", dataIndex: 'setOfBooksName'
        },
        {          /*核算场景代码*/
          title: this.$t({id:"accounting.scenarios.code"}), key: "transactionSceneCode", dataIndex: 'transactionSceneCode'
        },
        {          /*核算场景名称*/
          title: this.$t({id:"accounting.scenarios.name"}), key: "transactionSceneName", dataIndex: 'transactionSceneName'
        },
        {           /*状态*/
          title: this.$t({id:"common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})} />
          )
        },
        {title: this.$t({id:"common.operation"}), key: 'operation', width: '12%', render: (text, record, index) => (
          <span>
            <a onClick={(e) => this.handleUpdate(e, record,index)}>{this.$t({id: "common.edit"})}</a>   {/*编辑*/}
            <span className="ant-divider" />
            <a onClick={(e) => this.handleLinkConfig(e, record,index)}>{this.$t({id: "accounting.configuration.set"})}</a>
          </span>)
        },
      ],
    };
  }

  handleLinkConfig = (e, record,index)=>{
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-scenarios/matching-group-elements/:setOfBooksId/:id'
        .replace(':id',record.id).replace(':setOfBooksId',record.setOfBooksId)
      })
    );
  };

  componentDidMount() {
    this.getSetOfBookList();
    let searchParams = this.state.searchParams;
    if(this.props.match.params.setOfBooksId&&this.props.match.params.setOfBooksId!==":setOfBooksId"){
      let searchForm = this.state.searchForm;
      searchForm[0].defaultValue = this.props.match.params.setOfBooksId;
      searchParams.setOfBooksId = this.props.match.params.setOfBooksId;
    }
    this.setState({
      searchParams
    },this.getList)
  }

  handleEvent =(event,value)=>{
    switch (event) {
      case 'SOB':
        let searchParams = this.state.searchParams;
        searchParams.setOfBooksId = value;
        this.setState({searchParams},this.getList);break;
    }
  };

  //获取账套列表
  getSetOfBookList = () => {
    baseService.getSetOfBooksByTenant().then(res => {
      let list = [];
      res.data.map(item => {
        list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
      });
      let form = this.state.searchForm;
      form[0].options = list;
      this.setState({ searchForm: form });
    })
  };

  getList(){
    this.setState({loading: true});
    let params = this.state.searchParams;
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    accountingService.getScenariosSob(params).then(response=>{
      response.data.map(item=>{
        item.key = item.id;
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination
      })
    })
  }

  handleSearch = (params)=>{
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    if(params.setOfBooksId === this.props.company.setOfBooksName){
      params.setOfBooksId = this.props.company.setOfBooksId;
    }
    this.setState({
      searchParams: params
    },this.getList)
  };

  handleCreate = ()=>{
    let lov = {
      title: this.$t({id:"accounting.scenarios.new"}),
      visible: true,
      params: {}
    };
    this.setState({
      lov
    })
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
        visible: false
      }
    });
    if(params){
      this.setState({loading: true});
      this.getList()
    }
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

  handleListOk = (result) => {
    let values = [];
    result.result.map(item=>{
      let options = {};
      options.transactionSceneId = item.id;
      options.setOfBooksId = this.state.searchParams.setOfBooksId;
      options.transactionSceneCode = item.glSceneCode;
      options.transactionSceneName = item.glSceneName;
      values.push(options)
    });
    this.setState({
      scenariosVisible: false,
      loading: true,
    });
    accountingService.addOrUpdateScenarios(values).then(response=>{
      message.success(this.$t({id:"common.operate.success"}));
      this.getList();
    }).catch(e=>{
      if(e.response){
        message.error(`${this.$t({id:"common.operate.filed"})}, ${e.response.data.message}`);
      }
    })
  };

  render(){
    const { loading, data, columns, searchForm, pagination, lov, dataVisible, scenariosVisible } = this.state;
    return(
      <div className="accounting-scenarios-system">
        <SearchArea searchForm={searchForm} eventHandle={this.handleEvent} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={()=>this.setState({scenariosVisible: true})}>{this.$t({id: 'common.add'})}</Button>  {/*添加*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          rowKey={record => record.id}
          onChange={this.onChangePager}
          bordered
          size="middle"/>
        <ListSelector type="accounting_scenarios"
                      visible={scenariosVisible}
                      onOk={this.handleListOk}
                      extraParams={{setOfBooksId: this.state.searchParams.setOfBooksId}}
                      onCancel={()=>this.setState({scenariosVisible: false})}/>
        <SlideFrame title= {lov.title}
                    show={lov.visible}
                    onClose={()=>this.handleShowSlide(false)}>
          <NewUpdateScenariosSystem
            onClose={this.handleAfterClose}
            params={lov.params}/>
        </SlideFrame>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingScenarios);
