/**
 *  created by jsq on 2017/9/20
 */
import React from 'react';
import { connect } from 'dva'
import budgetService from 'containers/budget-setting/budget-organization/budget-structure/budget-structure.service'

import { Form, Button, Select, Input, Switch, Icon, Badge, Tabs, Checkbox, Table, message, Popover  } from 'antd'
import { routerRedux } from 'dva/router';
import 'styles/budget-setting/budget-organization/budget-structure/budget-structure-detail.scss';
import SlideFrame from "widget/slide-frame";
import NewDimension from 'containers/budget-setting/budget-organization/budget-structure/new-dimension'
import UpdateDimension from 'containers/budget-setting/budget-organization/budget-structure/update-dimension'
import ListSelector from 'widget/list-selector'
import BasicInfo from 'widget/basic-info'

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Search = Input.Search;

let periodStrategy = [];

class BudgetStructureDetail extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      loading: true,
      //添加公司弹框
      lov: {
        type: 'company_structure', //lov类型
        visible: false,  //控制是否弹出

      },
      updateState: false,
      structure:{},
      dimension: {},
      showSlideFrame: false,
      showSlideFrameUpdate: false,
      statusCode: this.$t({id:"common.status.enable"}) /*启用*/,
      total:0,
      data:[],
      pagination: {
        current: 1,
        page: 0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      label:"",
      columns:[],
      infoList: [
        {type: 'input', id: 'organizationName',isRequired: true, disabled: true, label: this.$t({id: 'budget.organization'})+" :" /*预算组织*/},
        {type: 'input', id: 'structureCode',isRequired: true, disabled: true, label: this.$t({id: 'budget.structureCode'})+" :" /*预算表代码*/},
        {type: 'input', id: 'structureName' ,isRequired: true, label: this.$t({id: 'budget.structureName'}) +" :"/*预算表名称*/},
        {type: 'select',options: periodStrategy , isRequired: true, id: 'periodStrategy', label: this.$t({id: 'budget.periodStrategy'}) +" :"/*编制期段*/},
        {type: 'input', id: 'description', label: this.$t({id: 'budget.structureDescription'}) +" :"/*预算表描述*/},
        {type: 'switch', id: 'enabled', label: this.$t({id: 'common.column.status'}) +" :"/*状态*/},
      ],
      columnGroup:{
        company: [
          {                        /*公司代码*/
            title:this.$t({id:"structure.companyCode"}), key: "companyCode", dataIndex: 'companyCode'
          },
          {                        /*公司名称*/
            title:this.$t({id:"structure.companyName"}), key: "companyName", dataIndex: 'companyName'
          },
          {                        /*公司类型*/
            title:this.$t({id:"structure.companyType"}), key: "companyTypeName", dataIndex: 'companyTypeName',
            render:recode=> <span>{recode ? recode : '-'}</span>
          },
          {                        /*启用*/
            title:this.$t({id:"structure.enablement"}), key: "doneRegisterLead", dataIndex: 'doneRegisterLead',width:'10%',
            render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)} checked={record.enabled}/>
          },
        ],
        dimension: [
          {                        /*维度代码*/
            title:this.$t({id:"structure.dimensionCode"}), key: "dimensionCode", dataIndex: 'dimensionCode'
          },
          {                        /*维度名称*/
            title:this.$t({id:"structure.dimensionName"}), key: "dimensionName", dataIndex: 'dimensionName',
            render: record => (
              <span>{record ? <Popover content={record}>{record} </Popover> : '-'} </span>)
          },
          {                        /*布局位置*/
            title:this.$t({id:"structure.layoutPosition"}), key: "layoutPositionName", dataIndex: 'layoutPositionName'
          },
          {                        /*布局顺序*/
            title:this.$t({id:"structure.layoutPriority"}), key: "layoutPriority", dataIndex: 'layoutPriority'
          },
          {                        /*默认维值代码*/
            title:this.$t({id:"structure.defaultDimValueCode"}), key: "defaultDimValueCode", dataIndex: 'defaultDimValueCode',
            render:recode=> <span>{recode ? recode : '-'}</span>
          },
          {                        /*默认维值名称*/
            title:this.$t({id:"structure.defaultDimValueName"}), key: "defaultDimValueName", dataIndex: 'defaultDimValueName',
            render: record => (
              <span>{record ? <Popover content={record}>{record} </Popover> : '-'} </span>)
          },
          {title: this.$t({id:"common.column.status"}), dataIndex: 'enabled', width: '15%',
            render: enabled => (
              <Badge status={enabled ? 'success' : 'error'}
                     text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.disabled"})} />
            )}, //状态
        ]
      },
      tabs: [
        {key: 'dimension', name: this.$t({id:"structure.dimensionDistribute"})}, /*维度分配*/
        {key: 'company', name: this.$t({id:"structure.companyDistribute"})}  /*公司分配*/
      ],
    };
  }
  //改变启用状态
  onChangeEnabled = (e, record) => {
    this.setState({loading: true});
    record.enabled = e.target.checked;
    budgetService.updateStructureAssignCompany(record).then(() => {
      this.getList()
    })
  };

  componentWillMount(){

    //获取编制期段
    this.getSystemValueList(2002).then((response)=>{
      response.data.values.map((item)=>{
        let options = {
          label:item.messageKey, value:item.code
        };
        periodStrategy.addIfNotExist(options)
      });
    });

    //获取某预算表某行的数据
    budgetService.getStructureById(this.props.match.params.id).then((response)=> {
      let periodStrategy = {label:response.data.periodStrategyName,value:response.data.periodStrategy};
      response.data.periodStrategy = periodStrategy;
      if(response.status === 200){
        this.setState({
          columns: this.state.columnGroup.dimension,
          structure: response.data
        });
        let infoList = this.state.infoList;
        infoList[3].disabled = response.data.usedFlag;
      }
    });
    this.getList();
  }

  //保存所做的修改
  handleUpdate = (value) => {
    value.id = this.state.structure.id;
    value.versionNumber = this.state.structure.versionNumber;
    value.organizationId = this.state.structure.organizationId;
    budgetService.updateStructures(value).then((response)=>{
      if(response.status === 200) {
        let structure = response.data;
        structure.organizationName = this.state.structure.organizationName;
        message.success(this.$t({id: "structure.saveSuccess"})); /*保存成功！*/
        structure.periodStrategy = {label:response.data.periodStrategyName, value:response.data.periodStrategy}
        this.setState({
            structure: structure,
            updateState: true
          },
          this.getList()
        );
      }
    }).catch((e)=>{
      if(e.response){
        message.error(`${this.$t({id:"common.operate.filed"})}, ${e.response.data.message}`);
      }
    })
  };

  renderTabs(){
    return (
      this.state.tabs.map(tab => {
        return <TabPane tab={tab.name} key={tab.key}/>
      })
    )
  }

  //Tabs点击
  onChangeTabs = (key) => {
    let columnGroup = this.state.columnGroup;
    let pagination = this.state.pagination
    pagination.page = 0;
    pagination.pageSize = 10;
    this.setState({
      loading: true,
      pagination,
      data: [],
      label: key,
      columns: key === 'company' ? columnGroup.company : columnGroup.dimension
    },()=>{
      this.getList()
    });
  };

  handleCreate = (e) =>{
    this.state.label ==="company" ? this.showListSelector(true) : this.showSlide(true)
  };

  getList = ()=>{
    const { pagination } = this.state;
    let params = {
      structureId: this.props.match.params.id,
      page: pagination.page,
      size: pagination.pageSize
    };
    if(this.state.label === "company"){
      budgetService.getCompanyAssignedStructure(params).then((response)=>{
        if(response.status === 200) {
          response.data.map((item)=>{
            item.key = item.id
          });
          let pagination = this.state.pagination;
          pagination.total = Number(response.headers['x-total-count']);
          this.setState({
            loading: false,
            data: response.data,
            pagination
          })
        }
      })
    }else {
      budgetService.getDimensionAssignedStructure(params).then((response)=>{
        if(response.status === 200){
          response.data.map((item)=>{
            item.key = item.id
          });
          let pagination = this.state.pagination;
          pagination.total = Number(response.headers['x-total-count']);
          this.setState({
            loading: false,
            data: response.data,
            pagination
          })
        }
      })
    }
  };


  //控制新建维度侧滑
  showSlide = (flag) => {
    this.setState({
      showSlideFrame: flag
    })
  };

  //处理关闭新建侧滑维度页面
  handleCloseSlide = (params) => {
    this.setState({
      showSlideFrame: false,
      loading: typeof params === 'undefined' ? false : true
    });
    if(params) {
      this.getList();
    }
  };

  //点击行，进入维度编辑页面
  handleRowClick = (record, index, event) =>{
    if(this.state.label !== 'company'){
      let defaultDimensionCode = [];
      let defaultDimensionValue = [];
      defaultDimensionCode.push({ dimensionId: record.dimensionId, dimensionCode: record.dimensionCode,key: record.dimensionId});
      record.defaultDimValueId&&defaultDimensionValue.push({ defaultDimValueId: record.defaultDimValueId, defaultDimValueCode: record.defaultDimValueCode,key: record.defaultDimValueId});
      record.usedFlag = this.state.structure.usedFlag;
      record.defaultDimensionCode = defaultDimensionCode;
      record.defaultDimensionValue = defaultDimensionValue;
      this.setState({
        showSlideFrameUpdate: true,
        dimension:record
      })
    }
  };

  showSlideUpdate = (flag)=>{
    this.setState({
      showSlideFrameUpdate: flag
    })
  };

  //关闭新建侧滑维度页面
  handleCloseSlideUpdate = (params) => {
    this.setState({
      showSlideFrameUpdate: false,
      loading: typeof params === 'undefined' ? false : true
    });
    if(params) {
      this.getList();
    }
  };

  //控制是否弹出公司列表
  showListSelector = (flag) =>{
    let lov = this.state.lov;
    lov.visible = flag;
    this.setState({lov})
  };

  //处理公司弹框点击ok,分配公司
  handleListOk = (result) => {
    let company = [];
    result.result.map((item)=>{
      company.push({companyCode: item.companyCode,companyId:item.id,structureId:this.props.match.params.id,enabled:item.enabled})
    });
    budgetService.structureAssignCompany(company).then((response)=>{
      if(response.status === 200) {
        this.showListSelector(false);
        this.setState({
            data: response.data,
          },
          this.getList()
        );
      }
    }).catch((e)=>{
      if(e.response){
        message.error(`${this.$t({id:"common.operate.filed"})}, ${e.response.data.message}`);
      }
      this.setState({loading: false});
    });
  };

  //返回预算表页面
  handleBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
          .replace(':id', this.props.match.params.orgId)
          .replace(":setOfBooksId",this.props.match.params.setOfBooksId)
          .replace(':tab','STRUCTURE')
      })
    );
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
    const { getFieldDecorator } = this.props.form;
    const { infoList, dimension, updateState, structure, loading, showSlideFrameUpdate, data, columns, pagination, label, showSlideFrame, lov} = this.state;

    return(
      <div className="budget-structure-detail">
        <BasicInfo
          infoList={infoList}
          infoData={structure}
          updateHandle={this.handleUpdate}
          updateState={updateState}/>
        <div className="structure-detail-distribution">
          <Tabs onChange={this.onChangeTabs}>
            {this.renderTabs()}
          </Tabs>
        </div>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" disabled={label === 'company' ? false : structure.usedFlag } onClick={this.handleCreate}>{label === 'company'? this.$t({id:'structure.addCompany'}) :
              this.$t({id: 'common.create'})}</Button>  {/*新建*/}
          </div>
        </div>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          onRow={record => ({
            onClick: () => this.handleRowClick(record)
          })}
          onChange={this.onChangePager}
          pagination={pagination}
          size="middle"
          bordered/>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{this.$t({id:"common.back"})}</a>

        <SlideFrame title={this.$t({id:"structure.newDimension"})}
                    show={showSlideFrame}
                    content={NewDimension}
                    afterClose={this.handleCloseSlide}
                    onClose={() => this.showSlide(false)}
                    params={structure}/>
        <SlideFrame title={this.$t({id:"structure.updateDimension"})}
                    show={showSlideFrameUpdate}
                    content={UpdateDimension}
                    afterClose={this.handleCloseSlideUpdate}
                    onClose={() => this.showSlideUpdate(false)}
                    params={{...dimension,flag: showSlideFrameUpdate}}/>

        <ListSelector type={lov.type}
                      visible={lov.visible}
                      extraParams={{"structureId": structure.id}}
                      onOk={this.handleListOk}
                      onCancel={()=>this.showListSelector(false)}/>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

const WrappedBudgetStructureDetail = Form.create()(BudgetStructureDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedBudgetStructureDetail);
