/**
 *  created by jsq on 2017/9/21
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Table, Select, Popover, Badge, message } from 'antd';
import SearchArea from 'widget/search-area';
import "styles/budget-setting/budget-organization/budget-item/budget-item.scss"
import config from 'config'
import ListSelector from 'widget/list-selector'
import Importer from 'widget/Template/importer'
import budgetService from 'containers/budget-setting/budget-organization/budget-item/budget-item.service'
import { routerRedux } from 'dva/router';

class BudgetItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      companyListSelector: false,
      searchParams:{
        itemCode: "",
        itemName: "",
        itemCodeFrom: "",
        itemCodeTo: "",
        itemTypeCode: "",
      },
      selectedRowKeys: [],
      batchCompany: true,
      pagination: {
        current:0,
        page:0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      searchForm: [
        {type: 'input', id: 'itemCode', label: this.$t({id: 'budget.itemCode'}) }, /*预算项目代码*/
        {type: 'input', id: 'itemName', label: this.$t({id:"budget.itemName"}) },
        {type: 'select', id: 'itemTypeName',options:[], labelKey: 'itemTypeName',valueKey: 'id',
          label: this.$t({id: 'budget.itemType'}),  /*预算项目类型*/
          listExtraParams:{organizationId: this.props.id},
          getUrl: `${config.budgetUrl}/api/budget/itemType/query/all`, method: 'get', getParams: {organizationId: this.props.id}
        },
        {type: 'select', id: 'itemCodeFrom',
          label: this.$t({id: 'budget.itemCodeFrom'}),  /*预算项目代码从*/
          options: []
        },
        {type: 'select', id: 'itemCodeTo',
          label: this.$t({id: 'budget.itemCodeTo'}), /*预算项目代码至*/
          options: []
        },
      ],

      columns: [
        {          /*预算项目代码*/
          title: this.$t({id:"budget.itemCode"}), key: "itemCode", dataIndex: 'itemCode'
        },
        {          /*预算项目名称*/
          title: this.$t({id:"budget.itemName"}), key: "itemName", dataIndex: 'itemName',
          render: desc => <span>{desc ? <Popover placement="topLeft" content={desc}>{desc}</Popover> : '-'}</span>
        },
        {          /*预算项目类型*/
          title: this.$t({id:"budget.itemType"}), key: "itemTypeName", dataIndex: 'itemTypeName'
        },
        {          /*备注*/
          title: this.$t({id:"budget.itemDescription"}), key: "description", dataIndex: 'description', width: "10%",
          render: description => (
            <span>{description ? <Popover content={description}>{description} </Popover> : '-'} </span>)
        },
        {           /*状态*/
          title: this.$t({id:"common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})} />
          )
        }
      ],
      showImportFrame: false,
      selectedEntityOIDs: []    //已选择的列表项的OIDs
    };
  }

  componentWillMount(){
    const {searchForm} = this.state;
    this.getList();
    let itemCode = [];
    //查出所有预算项目，以方便预算项目的查询中可以选择
    budgetService.getItems({organizationId: this.props.id,enabled: true}).then((response)=>{
      response.data.map((item,index)=>{
        item.key = item.id;
        let budgetItem = {
          value: item.itemCode,
          label: item.itemCode+" ( "+item.itemName+" ) "
        };
        itemCode.push(budgetItem);
      });
    });
    searchForm[3].options = searchForm[4].options = itemCode;
    this.setState({searchForm})

  }

  //获取预算项目数据
  getList(){
    let params = Object.assign({}, this.state.searchParams);
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    params.organizationId = this.props.id;
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    budgetService.getItemsByOption(params).then((response)=>{
      response.data.map((item,index)=>{
        item.key = item.id;
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination
      },()=>{
        this.refreshRowSelection()
      })
    })
  }

  handleSearch = (values) =>{
    this.setState({
      loading: true,
      searchParams:{
        itemCode: values.itemCode,
        itemName: values.itemName,
        itemCodeFrom: values.itemCodeFrom,
        itemCodeTo: values.itemCodeTo,
        itemTypeId: typeof values.itemTypeName === "undefined" ? "" : values.itemTypeName,
      },
    },()=>{
      this.getList()
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
      batchCompany: temp.length>0 ? false : true
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
      batchCompany: temp.length>0 ? false : true
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

  //新建
  handleCreate = () =>{
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-item/new-budget-item/:setOfBooksId/:orgId'
          .replace(':orgId', this.props.organization.id)
          .replace(':setOfBooksId',this.props.setOfBooksId)
      })
    );
  };


  //控制是否弹出公司列表
  showListSelector = (flag) =>{
    this.setState({
      companyListSelector: flag
    })
  };

  //处理公司弹框点击ok
  handleListOk = (result) => {
    let companyIds = [];
    if(result.result.length>0){
      result.result.map((item)=>{
        companyIds.push(item.id)
      });
      let param = [];
      param.push({"companyIds": companyIds, "resourceIds": this.state.selectedEntityOIDs});
      budgetService.batchAddCompanyToItem(param).then((response)=>{
        message.success(`${this.$t({id:"common.operate.success"})}`);
        if(response.status === 200){
          this.setState({
            loading: true,
            batchCompany: true,
            companyListSelector: false
          },this.getList())
        }
      }).catch((e)=>{
        if(e.response){
          message.error(`${this.$t({id:"common.operate.filed"})},${e.response.data.message}`)
        }
      });
    }else
      this.showListSelector(false)
  };

  //点击行，进入该行详情页面
  handleRowClick = (record) =>{
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-item/budget-item-detail/:setOfBooksId/:orgId/:id'
          .replace(':orgId', this.props.id)
          .replace(':id', record.id)
          .replace(":setOfBooksId",this.props.setOfBooksId)
      })
    );
  };

  showImport = (flag) => {
    this.setState({ showImportFrame: flag })
  };

  //导入成功回调
  handleImportOk = () => {
    this.showImport(false);
    this.getList()
  };

  render(){
    const { loading, searchForm ,data, selectedRowKeys, pagination, columns, batchCompany, companyListSelector, showImportFrame } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow
    };
    return (
      <div className="budget-item">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.create'})}</Button>  {/*新 建*/}
            <Button type="primary" onClick={() => this.showImport(true)}>{this.$t({id: 'importer.import'})}</Button>  {/*导入*/}
            <Importer visible={showImportFrame}
                      title={this.$t({id:"item.itemUpload"})}
                      templateUrl={`${config.budgetUrl}/api/budget/items/export/template`}
                      uploadUrl={`${config.budgetUrl}/api/budget/items/import?orgId=${this.props.id}`}
                      errorUrl={`${config.budgetUrl}/api/budget/items/export/failed/data`}
                      fileName={this.$t({id:"item.itemUploadFile"})}
                      onOk={this.handleImportOk}
                      afterClose={() => this.showImport(false)}/>
            <Button onClick={()=>this.showListSelector(true)} disabled={batchCompany}>{this.$t({id:"budget.item.batchCompany"})}</Button>
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          rowSelection={rowSelection}
          onRow={record => ({
            onClick: () => this.handleRowClick(record)
          })}
          pagination={pagination}
          onChange={this.onChangePager}
          size="middle"
          bordered/>
        <ListSelector type="company"
                      visible={companyListSelector}
                      onOk={this.handleListOk}
                      extraParams={{setOfBooksId: this.props.company.setOfBooksId,enabled: true}}
                      onCancel={()=>this.showListSelector(false)}/>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization,
    company: state.user.company,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetItem);

