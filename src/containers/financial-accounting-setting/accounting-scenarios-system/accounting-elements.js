/**
 * created by jsq on 2017/12/28
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Table, Badge, Input, Icon, Popover} from 'antd'
import SlideFrame from 'widget/slide-frame'
import NewUpdateAccountingElements from 'containers/financial-accounting-setting/accounting-scenarios-system/new-update-accounting-elements'
import 'styles/financial-accounting-setting/accounting-scenarios-system/accounting-elements.scss'
import debounce from 'lodash.debounce';
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system.service';
import { routerRedux } from 'dva/router';

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
          title: this.$t({id:"accounting.elements.code"}), key: "accountElementCode", dataIndex: 'accountElementCode'
        },
        {          /*核算要素名称*/
          title: this.$t({id:"accounting.elements.name"}), key: "accountElementName", dataIndex: 'accountElementName'
        },
        {          /*核算要素性质*/
          title: this.$t({id:"accounting.elements.nature"}), key: "elementNature", dataIndex: 'elementNature',
          render: description => (
            <span>{description ? <Popover content={description}>{description} </Popover> : '-'} </span>)

        },
        {          /*匹配组字段*/
          title: this.$t({id:"accounting.matching.group.field"}), key: "mappingGroupName", dataIndex: 'mappingGroupName',
          render: description => <span>{description ? description: '-'} </span>
        },
        {           /**/
          title: this.$t({id:"common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})} />
          )
        },
        {title: this.$t({id:"common.operation"}), key: 'operation', width: '8%', render: (text, record, index) => (
          <span>
            <a onClick={(e) => this.handleUpdate(e, record,index)}>{this.$t({id: "common.edit"})}</a>   {/*编辑*/}
          </span>)
        },
      ],
    };
    this.handleParam = debounce(this.handleParam,1000)
  }

  componentWillMount() {
    //根据id查出核算场景
    accountingService.getSysScenariosById(this.props.match.params.id).then(response=>{
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
    params.transactionSceneId = this.props.match.params.id;
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
      title: this.$t({id:"accounting.elements.add"}),
      visible: true,
      params: {transactionSceneId: this.props.match.params.id}
    };
    this.setState({
      lov
    })
  };

  handleUpdate = (e,record,index)=>{
    record.transactionSceneId = this.props.match.params.id;
    let lov = {
      title: this.$t({id:"accounting.elements.update"}),
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
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-scenarios-system'
      })
    )
  };


  render(){
    const { loading, data, columns, pagination, lov, dataVisible , scenarios} = this.state;
    return(
      <div className="accounting-elements" style={{paddingBottom:20}}>
        <div className="accounting-elements-header">
          <h2>{this.$t({id:"accounting.scenarios"},{name: scenarios.glSceneCode+ "-"+scenarios.glSceneName})}</h2>
        </div>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.add'})}</Button>  {/*添加*/}
            <Search
              className="table-header-search"
              placeholder={this.$t({id:"accounting.placeholder.tips"})}
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
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{this.$t({id:"common.back"})}</a>

        <SlideFrame title= {lov.title}
                    show={lov.visible}
                    onClose={()=>this.handleShowSlide(false)}>
          <NewUpdateAccountingElements
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
