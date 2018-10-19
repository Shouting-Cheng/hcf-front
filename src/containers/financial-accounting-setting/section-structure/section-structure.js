/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Table, Badge, Popover, message} from 'antd'
import SlideFrame from 'widget/slide-frame'
import NewUpdateSectionStructure from 'containers/financial-accounting-setting/section-structure/new-update-section-structure'
import SearchArea from 'widget/search-area';
import accountingService from 'containers/financial-accounting-setting/section-structure/section-structure.service';
import 'styles/financial-accounting-setting/section-structure/section-structure.scss'
import baseService from 'share/base.service'
import { routerRedux } from 'dva/router';

class SectionStructure extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      data: [],
      lov:{
        visible: false
      },
      searchParams:{
        tenantId: this.props.company.tenantId
      },
      pagination: {
        current: 1,
        page: 0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      searchForm: [                                                             //账套
        { type: 'select', id: 'setOfBooksId', label: this.$t({id: 'section.setOfBook'}), options:[],labelKey: 'setOfBooksName',valueKey: 'id',
          //defaultValue: this.props.company.setOfBooksId,
          //getUrl:`${config.baseUrl}/api/setOfBooks/by/tenant`, method: 'get', getParams: {roleType: 'TENANT'},
          event: "SOB",
          //isRequired: true
        },
        {                                                                        //科目段结构代码
          type: 'input', id: 'segmentSetCode', label: this.$t({id: 'section.structure.code'})
        },
        {                                                                        //科目段结构名称
          type: 'input', id: 'segmentSetName', label: this.$t({id: 'section.structure.name'}),
        }
      ],
      columns:[
        {          /*账套*/
          title: this.$t({id:"section.setOfBook"}), key: "setOfBooksName", dataIndex: 'setOfBooksName'
        },
        {          /*科目段结构代码*/
          title: this.$t({id:"section.structure.code"}), key: "segmentSetCode", dataIndex: 'segmentSetCode'
        },
        {          /*科目段结构名称*/
          title: this.$t({id:"section.structure.name"}), key: "segmentSetName", dataIndex: 'segmentSetName',
          render: description => (
            <span>{description ? <Popover content={description}>{description} </Popover> : '-'} </span>)
        },
        {
          /*状态*/
          title: this.$t({id: "common.column.status"}), key: "enabled", dataIndex: 'enabled', width: '8%',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})} />
          )
        },
        {          /*操作*/
          title: this.$t({id:"common.operation"}), key: "operate", dataIndex: 'operate',width:'14%',
          render: (text, record, index) => (
            <span>
            <a href="#" onClick={(e) => this.handleUpdate(e, record,index)}>{this.$t({id: "common.edit"})}</a>
            <span className="ant-divider" />
            <a href="#" onClick={(e) => this.handleLinkSetting(e, record,index)}>{this.$t({id: "section.setting"})}</a>
          </span>)
        },
      ]
    }
  };

  handleLinkSetting = (e,record)=>{
    this.props.dispatch(
      routerRedux.push({
        pathname: '/financial-accounting-setting/section-structure/section-setting/:id/:setOfBooksId'
          .replace(':id', record.id).replace(':setOfBooksId',record.setOfBooksId)
      })
    )
  };

  eventHandle=(event,value)=>{
    if(event === 'SOB'){
      let searchParams = this.state.searchParams;
      searchParams.setOfBooksId = value;
      this.setState({searchParams},this.getList)
    }
  };

  componentWillMount() {
    this.getSetOfBookList();
    this.setState({
    },this.getList)
  }

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
    let params = Object.assign({}, this.state.searchParams);
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.tenantId = this.props.company.tenantId;
    params.page = this.state.page;
    params.size = this.state.pageSize;
    accountingService.getSectionStructuresByOptions(params).then(response=>{
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
  };

  handleSearch = (params)=>{
    let searchParams = this.state.searchParams;
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    searchParams = {
      ...searchParams,
      ...params
    }
    this.setState({
      searchParams,
    },this.getList)
  };

  handleClear =()=>{
    /*let searchParams={
      setOfBooksId: this.props.company.setOfBooksId,
    };*/
    this.setState({
      searchParams:{}
    },this.getList)
  };

  handleCreate = ()=>{
   if(this.state.searchParams.setOfBooksId===null){
     message.warning(this.$t({id:"section.structure.sob.tips"}))
   }else {
     let lov = {
       title: this.$t({id:"section.structure.new"}),
       visible: true,
       params: {setOfBooksId: this.state.searchParams.setOfBooksId}
     };
     this.setState({
       lov
     })
   }
  };

  handleUpdate = (e,record,index)=>{
    let lov = {
      title: this.$t({id:"section.structure.update"}),
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

  render(){
    const { loading, data, columns, searchForm, pagination, lov } = this.state;
    return(
      <div className="section-structure">
        <div className="section-structure-header">
          {this.$t({id:"section.structure.header"})}
        </div>
        <SearchArea searchForm={searchForm} eventHandle={this.eventHandle} submitHandle={this.handleSearch} clearHandle={this.handleClear}/>
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
          <NewUpdateSectionStructure
            params={{...lov.params,visible: lov.visible}}
            onClose={this.handleAfterClose}
          />
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

export default connect(mapStateToProps, null, null, { withRef: true })(SectionStructure);
