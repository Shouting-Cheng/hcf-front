/**
 * created by jsq on 2017/12/27
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Badge, message} from 'antd'
import SlideFrame from 'components/slide-frame'
import NewUpdateScenariosSystem from 'containers/financial-accounting-setting/accounting-scenarios/new-update-accounting-scenarios'
import SearchArea from 'components/search-area';
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios.service';
import config from 'config'
import menuRoute from 'routes/menuRoute'
import 'styles/financial-accounting-setting/accounting-scenarios/accounting-scenarios.scss'
import ListSelector from 'components/list-selector'
import baseService from 'share/base.service'
import {formatMessage} from 'share/common'

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
        { type: 'select', id: 'setOfBooksId', label: formatMessage({id: 'section.setOfBook'}), options:[],labelKey: 'setOfBooksName',valueKey: 'id',
          defaultValue: this.props.company.setOfBooksId,
          //getUrl:`${config.baseUrl}/api/setOfBooks/by/tenant`, method: 'get', getParams: {roleType: 'TENANT'},
          event: 'SOB',
          isRequired: true
        },
        {                                                                        //核算场景代码
          type: 'input', id: 'transactionSceneCode', label: formatMessage({id: 'accounting.scenarios.code'})
        },
        {                                                                        //核算场景名称
          type: 'input', id: 'transactionSceneName', label: formatMessage({id: 'accounting.scenarios.name'})
        },
      ],
      columns: [
        {          /*账套*/
          title: formatMessage({id:"section.setOfBook"}), key: "setOfBooksName", dataIndex: 'setOfBooksName'
        },
        {          /*核算场景代码*/
          title: formatMessage({id:"accounting.scenarios.code"}), key: "transactionSceneCode", dataIndex: 'transactionSceneCode'
        },
        {          /*核算场景名称*/
          title: formatMessage({id:"accounting.scenarios.name"}), key: "transactionSceneName", dataIndex: 'transactionSceneName'
        },
        {           /*状态*/
          title: formatMessage({id:"common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})} />
          )
        },
        {title: formatMessage({id:"common.operation"}), key: 'operation', width: '12%', render: (text, record, index) => (
          <span>
            <a href="#" onClick={(e) => this.handleUpdate(e, record,index)}>{formatMessage({id: "common.edit"})}</a>   {/*编辑*/}
            <span className="ant-divider" />
            <a href="#" onClick={(e) => this.handleLinkConfig(e, record,index)}>{formatMessage({id: "accounting.configuration.set"})}</a>
          </span>)
        },
      ],
    };
  }

  handleLinkConfig = (e, record,index)=>{
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-scenarios', 'key').children.matchingGroupElements.url
      .replace(':id',record.id).replace(':setOfBooksId',record.setOfBooksId))
  };

  componentWillMount() {
    this.getSetOfBookList();
    let searchParams = this.state.searchParams;
    if(this.props.params.setOfBooksId!==":setOfBooksId"){
      let searchForm = this.state.searchForm;
      searchForm[0].defaultValue = this.props.params.setOfBooksId;
      searchParams.setOfBooksId = this.props.params.setOfBooksId;
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
      title: formatMessage({id:"accounting.scenarios.new"}),
      visible: true,
      params: {}
    };
    this.setState({
      lov
    })
  };

  handleUpdate = (e,record,index)=>{
    let lov = {
      title: formatMessage({id:"accounting.scenarios.update"}),
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
      message.success(formatMessage({id:"common.operate.success"}));
      this.getList();
    }).catch(e=>{
      if(e.response){
        message.error(`${formatMessage({id:"common.operate.filed"})}, ${e.response.data.message}`);
      }
    })
  };

  render(){
    const { loading, data, columns, searchForm, pagination, lov, dataVisible, scenariosVisible } = this.state;
    return(
      <div className="accounting-scenarios-system">
        <SearchArea searchForm={searchForm} eventHandle={this.handleEvent} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={()=>this.setState({scenariosVisible: true})}>{formatMessage({id: 'common.add'})}</Button>  {/*添加*/}
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
                    content={NewUpdateScenariosSystem}
                    afterClose={this.handleAfterClose}
                    onClose={()=>this.handleShowSlide(false)}
                    params={lov.params}/>
      </div>
    )
  }
}


AccountingScenarios.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    company: state.login.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingScenarios);
