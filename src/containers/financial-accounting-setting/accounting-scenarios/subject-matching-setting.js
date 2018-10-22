/**
 * created by jsq on 2018/01/02
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Badge, Popconfirm, Icon, Popover, message, Spin} from 'antd'
import SlideFrame from 'components/slide-frame'
import NewUpdateSubjectMapping from 'containers/financial-accounting-setting/accounting-scenarios/new-update-subject-mapping'
import SearchArea from 'components/search-area';
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios.service';
import config from 'config'
import menuRoute from 'routes/menuRoute'
import 'styles/financial-accounting-setting/accounting-scenarios/subject-matching-setting.scss'
import {formatMessage} from 'share/common'

class subjectsMatchingSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isDelete: true,
      searchFlag: false,
      loadingForm: true,
      data: [],
      matchGroup:{
        sceneName: ""
      },
      lov:{
        visible: false,
        params:{}
      },
      selectedRowKeys: [],
      searchParams: {
        headId: this.props.params.groupId,
        tenantId: this.props.company.tenantId,
        companyId: this.props.company.id
      },
      paramsBody: [],
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      searchForm: [],
      columns: [
        {          /*科目代码*/
          title: formatMessage({id:"accounting.subject.code"}), key: "accountCode", dataIndex: 'accountCode', width:"%8"
        },
        {          /*科目名称*/
          title: formatMessage({id:"accounting.subject.name"}), key: "accountName", dataIndex: 'accountName',
          render: desc => <span>{desc ? <Popover placement="topLeft" content={desc}>{desc}</Popover> : '-'}</span>
        },
      ],
      operate:[
        {title: formatMessage({id:"common.operation"}), key: 'operation', width: '12%', render: (text, record, index) => (
          <span>
            <a href="#" onClick={(e) => this.handleUpdate(e, record,index)}>{formatMessage({id: "common.edit"})}</a>   {/*编辑*/}
            <span className="ant-divider" />
             <Popconfirm onConfirm={(e) => this.deleteItem(e, record,index)} title={formatMessage({id:"budget.are.you.sure.to.delete.rule"}, {controlRule: record.controlRuleName})}>{/* 你确定要删除organizationName吗 */}
               <a href="#" style={{marginLeft: 12}}>{ formatMessage({id: "common.delete"})}</a>
              </Popconfirm>
          </span>)
        },
      ],
      selectedEntityOIDs: []    //已选择的列表项的OIDs
    };
  }

  deleteItem = (e, record,index)=>{
    accountingService.batchDeleteSection([record.id]).then(response=>{
      message.success(`${formatMessage({id:"common.operate.success"})}`);
      this.getList();
    }).catch((e)=>{
      if(e.response){
        message.error(`${formatMessage({id:"common.operate.filed"})},${e.response.data.message}`)
      }
    })
  };

  componentDidMount() {
    accountingService.getMatchGroupById({headId: this.props.params.groupId}).then(response=>{
      let searchForm = [];
      let columns = this.state.columns;
      let column = [];
      let searchParams = this.state.searchParams;
      searchParams.sceneId = response.data.sceneId;
      searchParams.setOfBooksId = response.data.setOfBooksId;
      response.data.lines.map(item=>{
        let option = null;
        if(item.isSystem){
           option = {
            type: 'select', id:item.elementId, label:item.elementNature,
            labelKey: 'name',valueKey: 'id',
            options:[],
            getUrl: `${config.accountingUrl}/api/general/match/group/filed/values`,
            method: 'get',
            getParams: {
              groupCode: item.groupCode,
              tenantId: this.props.company.tenantId,
              setOfBooksId: response.data.setOfBooksId
            }
          }
        }else {
            option = {
            type: 'list', id:item.elementId, label:item.elementNature,
            labelKey: 'name',valueKey: 'id', single: true,
            selectorItem: {
              id: item.elementId,
              title: item.elementNature,
              url:`${config.accountingUrl}/api/general/match/group/filed/values`,
              searchForm: [
                {type: 'input', id: 'valueCode', label: formatMessage({id:"account.code"},{name: item.elementNature})},
                {type: 'input', id: 'valueDesc', label: formatMessage({id:"account.name"},{name: item.elementNature})}
              ],
              columns: [
                {title: formatMessage({id:"account.code"},{name: item.elementNature}), dataIndex: 'code'},
                {title: formatMessage({id:"account.name"},{name: item.elementNature}), dataIndex: 'name'},
              ],
              key: 'id'
            },
            listExtraParams: {
              groupCode: item.groupCode,
              tenantId: this.props.company.tenantId,
              setOfBooksId: response.data.setOfBooksId
            },
          };
        }
        let col = {
          title: item.elementNature, key: item.elementCode, dataIndex:item.elementId, width: '16%'
        };
        searchForm.push(option);
        column.push(col);
      });
      columns = columns.concat(column).concat(this.state.operate);
      this.setState({
        searchForm,
        columns,
        loadingForm: false,
        searchFlag: response.data.lines.length === 0 ? false : true,
        matchGroup: response.data
      },this.getList)
    })
  }

  getList(){
    this.setState({loading: true});
    let params = this.state.searchParams;
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    let paramsBody = [];
    this.state.paramsBody.map(item=>{
      !(item.elementValue instanceof Array) && (paramsBody.push(item))
    });
    accountingService.getSectionMatchByOptions(params,paramsBody).then(response=>{
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      response.data.map(item=>{
        item.key = item.id;
        if(item.lineInfo !==null){
          item.lineInfo.map(children=>{
            item[children.elementId] = children.elementName;
          })
        }
      });
      this.setState({
        loading: false,
        data: response.data,
        pagination
      })
    })
  }

  handleSearch = (params)=>{
    let paramsBody = [];
    for(let paramsName in params){
      if(!!params[paramsName]){
        let option = {};
        option.groupCode = paramsName;
        option.elementValue = params[paramsName].length>0 ? params[paramsName][0] : params[paramsName];
        paramsBody.push(option)
      }
    }
    this.setState({paramsBody},this.getList);
  };

  handleCreate = ()=>{
    let lov = {
      title: formatMessage({id:"accounting.subject.mapping.add"}),
      visible: true,
      params: this.state.matchGroup,
    };
    this.setState({
      lov
    })
  };

  handleUpdate = (e,record,index)=>{
    let lov = {
      title: formatMessage({id:"accounting.subject.mapping.update"}),
      visible: true,
      params: {matchGroup: this.state.matchGroup, sectionMatch:record}
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
      this.setState({loading: true},this.getList())
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
    this.setState({
      scenariosVisible: false
    })
  };

  //列表选择更改
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  //选择一行
  //选择逻辑：每一项设置selected属性，如果为true则为选中
  //同时维护selectedEntityOIDs列表，记录已选择的OID，并每次分页、选择的时候根据该列表来刷新选择项
  onSelectRow = (record, selected) => {
    let temp = this.state.selectedEntityOIDs;
    if(selected)
      temp.push(record.id);
    else
      temp.delete(record.id);
    this.setState({
      selectedEntityOIDs: temp,
      isDelete: temp.length>0 ? false : true
    })
  };

  //全选
  onSelectAllRow = (selected) => {
    let temp = this.state.selectedEntityOIDs;
    if(selected){
      this.state.data.map(item => {
        temp.addIfNotExist(item.id)
      })
    } else {
      this.state.data.map(item => {
        temp.delete(item.id)
      })
    }
    this.setState({
      selectedEntityOIDs: temp,
      isDelete: temp.length>0 ? false : true
    })
  };

  //换页后根据OIDs刷新选择框
  refreshRowSelection(){
    let selectedRowKeys = [];
    this.state.selectedEntityOIDs.map(selectedEntityOID => {
      this.state.data.map((item, index) => {
        if(item.id === selectedEntityOID)
          selectedRowKeys.push(index);
      })
    });
    this.setState({ selectedRowKeys });
  }

  //清空选择框
  clearRowSelection(){
    this.setState({selectedEntityOIDs: [],selectedRowKeys: []});
  }

  handleDelete = ()=>{
    accountingService.batchDeleteSection(this.state.selectedRowKeys).then(response=>{
      message.success(`${formatMessage({id:"common.operate.success"})}`);
      this.getList();
    }).catch((e)=>{
      if(e.response){
        message.error(`${formatMessage({id:"common.operate.filed"})},${e.response.data.message}`)
      }
    })
  };

  handleBack = () => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-scenarios', 'key').children.matchingGroupElements.url.replace(':id',this.props.params.id).replace(":setOfBooksId",this.state.matchGroup.setOfBooksId));
  };

  render(){
    const { loading, data, columns, searchForm, pagination, lov, dataVisible, selectedRowKeys, isDelete, selectedEntityOIDs, matchGroup, searchFlag } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow
    };
    return(
      <div className="subject-matching-setting">
        <Spin spinning={this.state.loadingForm} style={{overflow: 'hidden'}}>
          <div className="subject-matching-setting-head-tips">
          <span>
            {formatMessage({id:"section.setOfBook"})}: {matchGroup.setOfBooksName}
          </span>
          <span style={{marginLeft:10}}>
            {formatMessage({id:"accounting.scenarios"},{name:""})+`:  ${matchGroup.sceneName}`}
          </span>
          <span style={{marginLeft:10}}>
            {formatMessage({id:"accounting.subject.setting"},{name: matchGroup.headName})}
          </span>
        </div>
          {searchFlag ? <SearchArea searchForm={searchForm} clearHandle={()=>{}} submitHandle={this.handleSearch}/> : null}
        </Spin>
        {/*<div className="accounting-subject-setting-tips">{formatMessage({id:"accounting.subject.tips"})}</div>*/}
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id:'common.total'},{total:`${pagination.total}`})} / {formatMessage({id:'common.total.selected'},{total:selectedEntityOIDs.length})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" disabled={!searchFlag &&data.length>0} onClick={this.handleCreate}>{formatMessage({id: 'common.add'})}</Button>  {/*添加*/}
            <Popconfirm onConfirm={this.handleDelete} title={formatMessage({id:"budget.are.you.sure.to.delete.rule"}, {controlRule: ""})}>{/* 你确定要删除organizationName吗 */}
              <Button disabled={isDelete}>{formatMessage({id:"common.delete"})}</Button>
            </Popconfirm>
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          rowSelection={rowSelection}
          rowKey={record => record.id}
          onChange={this.onChangePager}
          bordered
          size="middle"/>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{formatMessage({id:"common.back"})}</a>
        <SlideFrame title= {lov.title}
                    show={lov.visible}
                    content={NewUpdateSubjectMapping}
                    afterClose={this.handleAfterClose}
                    onClose={()=>this.handleShowSlide(false)}
                    params={lov.params}/>
      </div>
    )
  }
}


subjectsMatchingSetting.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    company: state.login.company,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(subjectsMatchingSetting);

