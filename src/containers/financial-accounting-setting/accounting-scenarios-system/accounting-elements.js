/**
 * created by jsq on 2017/12/28
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Badge, Input, Icon, Popover} from 'antd'
import SlideFrame from 'components/slide-frame'
import NewUpdateAccountingElements from 'containers/financial-accounting-setting/accounting-scenarios-system/new-update-accounting-elements'
import httpFetch from 'share/httpFetch';
import config from 'config'
import menuRoute from 'routes/menuRoute'
import 'styles/financial-accounting-setting/accounting-scenarios-system/accounting-elements.scss'
import debounce from 'lodash.debounce';
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system.service';
import {formatMessage} from 'share/common'

const Search = Input.Search;

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
      searchParams:{
        input: ''
      },
      scenarios:{
        glSceneCode: "",
        glSceneName: ""
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      columns: [
        {          /*核算要素代码*/
          title: formatMessage({id:"accounting.elements.code"}), key: "accountElementCode", dataIndex: 'accountElementCode'
        },
        {          /*核算要素名称*/
          title: formatMessage({id:"accounting.elements.name"}), key: "accountElementName", dataIndex: 'accountElementName'
        },
        {          /*核算要素性质*/
          title: formatMessage({id:"accounting.elements.nature"}), key: "elementNature", dataIndex: 'elementNature',
          render: description => (
            <span>{description ? <Popover content={description}>{description} </Popover> : '-'} </span>)

        },
        {          /*匹配组字段*/
          title: formatMessage({id:"accounting.matching.group.field"}), key: "mappingGroupName", dataIndex: 'mappingGroupName',
          render: description => <span>{description ? description: '-'} </span>
        },
        {           /**/
          title: formatMessage({id:"common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})} />
          )
        },
        {title: formatMessage({id:"common.operation"}), key: 'operation', width: '8%', render: (text, record, index) => (
          <span>
            <a href="#" onClick={(e) => this.handleUpdate(e, record,index)}>{formatMessage({id: "common.edit"})}</a>   {/*编辑*/}
          </span>)
        },
      ],
    };
    this.handleParam = debounce(this.handleParam,1000)
  }

  componentWillMount() {
    //根据id查出核算场景
    accountingService.getSysScenariosById(this.props.params.id).then(response=>{
      this.setState({
        scenarios: response.data
      })
    },this.getList());
  }

  getList(){
    this.setState({loading: true});
    let params = Object.assign({}, this.state.searchParams);
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.transactionSceneId = this.props.params.id;
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    accountingService.getElement(params).then(response=>{
      response.data.map(item=>{
        item.key = item.id;
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination,
      })
    })
  }

  handleSearch = (e)=>{
    this.handleParam(e.target.value);
  };

  handleParam = (value)=>{
    let searchParams = this.state.searchParams;
    searchParams.input = value;
    this.setState({
      searchParams
    },this.getList);
  };

  handleCreate = ()=>{
    let lov = {
      title: formatMessage({id:"accounting.elements.add"}),
      visible: true,
      params: {transactionSceneId: this.props.params.id}
    };
    this.setState({
      lov
    })
  };

  handleUpdate = (e,record,index)=>{
    record.transactionSceneId = this.props.params.id;
    let lov = {
      title: formatMessage({id:"accounting.elements.update"}),
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
      this.setState({
        loading: true
      },this.getList)
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

  handleBack = () => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-scenarios-system', 'key').url);
  };


  render(){
    const { loading, data, columns, pagination, lov, dataVisible , scenarios} = this.state;
    return(
      <div className="accounting-elements">
        <div className="accounting-elements-header">
          <h2>{formatMessage({id:"accounting.scenarios"},{name: scenarios.glSceneCode+ "-"+scenarios.glSceneName})}</h2>
        </div>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.add'})}</Button>  {/*添加*/}
            <Search
              className="table-header-search"
              placeholder={formatMessage({id:"accounting.placeholder.tips"})}
              onChange={e=>this.handleSearch(e)}
              style={{ width: 300 }}
            />
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
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{formatMessage({id:"common.back"})}</a>

        <SlideFrame title= {lov.title}
                    show={lov.visible}
                    content={NewUpdateAccountingElements}
                    afterClose={this.handleAfterClose}
                    onClose={()=>this.handleShowSlide(false)}
                    params={{...lov.params,visible: lov.visible}}/>
      </div>
    )
  }
}


AccountingScenariosSystem.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingScenariosSystem);
