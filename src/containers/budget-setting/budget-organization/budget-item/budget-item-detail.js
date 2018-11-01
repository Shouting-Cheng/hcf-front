/**
 *  created by jsq on 2017/9/22
 */
import React from 'react';
import { connect } from 'dva'
import { Form, Button, Select, Row, Col, Input, Switch, Icon, Badge, Tabs, Table, message, Checkbox   } from 'antd'
import budgetService from 'containers/budget-setting/budget-organization/budget-item/budget-item.service'
import ListSelector from 'widget/list-selector'
import BasicInfo from 'widget/basic-info'
import 'styles/budget-setting/budget-organization/budget-item/budget-item-detail.scss';
import * as routerRedux from "react-router-redux";

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

class BudgetItemDetail extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      buttonLoading: false,
      companyListSelector: false,  //控制公司选则弹框
      budgetItem:{},
      data: [],
      edit: false,
      visible: false,
      pagination: {
        current: 1,
        page: 0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      infoList: [
        {type: 'input', id: 'organizationName', isRequired: true, disabled: true, label: this.$t({id: 'budget.organization'})+" :" /*预算组织*/},
        {type: 'input', id: 'itemCode', isRequired: true, disabled: true, label: this.$t({id: 'budget.itemCode'})+" :" /*预算项目代码*/},
        {type: 'input', id: 'itemName', isRequired:true, label: this.$t({id: 'budget.itemName'}) +" :"/*预算项目名称*/},
        {type: 'select',options: [] , id: 'itemTypeName', required:true, disabled: true, label:this.$t({id: 'budget.itemType'}) +" :",  },
        {type: 'input', id: 'description', label: this.$t({id: 'budget.itemDescription'}) +" :"/*预算项目描述*/},
        {type: 'switch', id: 'enabled', label: this.$t({id: 'common.column.status'}) +" :"/*状态*/},
      ],

      columns: [
        {title: this.$t({id:'structure.companyCode'}), key: 'companyCode', dataIndex: 'companyCode'},/*公司代码*/
        {title: this.$t({id:'structure.companyName'}), key: 'companyName', dataIndex: 'companyName'}, /*公司明称*/
        {title: this.$t({id:'structure.companyType'}), key: 'companyTypeName', dataIndex: 'companyTypeName', /*公司类型*/
          render: desc => <span>{desc ? desc : '-'}</span>
        },
        {                        /*启用*/
          title:this.$t({id:"common.status.enable"}), key: "doneRegisterLead", dataIndex: 'doneRegisterLead',width:'10%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)} checked={record.enabled}/>
        },
      ],
    }
  }

  //改变启用状态
  onChangeEnabled = (e, record) => {
    this.setState({loading: true});
    record.enabled = e.target.checked;
    budgetService.updateItemAssignedCompany(record).then((response) => {
      this.getList()
    })
  };

  componentWillMount(){
    //根据路径上的id,查出该条预算项目完整数据
    budgetService.getItemById(this.props.match.params.id).then((response)=>{
      if(response.status === 200){
        const  infoList= this.state.infoList;
        infoList[3].defaultValue = response.data.itemTypeName;
        this.setState({
          infoList,
          budgetItem: response.data
        })
      }
    });
    this.getList();
  }


  //保存所做的详情修改
  handleUpdate = (value) => {
    value.organizationId = this.state.budgetItem.organizationId;
    value.id = this.state.budgetItem.id;
    value.versionNumber = this.state.budgetItem.versionNumber;
    budgetService.updateItem(value).then((response)=>{
      if(response) {
        response.data.organizationName = this.state.budgetItem.organizationName;
        response.data.itemTypeName = value.itemTypeName;
        message.success(this.$t({id:"structure.saveSuccess"})); /*保存成功！*/
        this.setState({
          budgetItem: response.data,
          edit: true
        })
      }
    }).catch(e=>{
      console.log(e)
    })
  };

  //查询已经分配过的公司
  getList(){
    const {pagination} = this.state;
    budgetService.itemAssignedCompany({itemId:this.props.match.params.id,page:pagination.page,size:pagination.pageSize}).then((response)=>{
      response.data.map((item)=>{
        item.key= item.id
      });
      if(response.status === 200){
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


  //控制是否编辑
  handleEdit = (flag) => {
    this.setState({edit: flag})
  };

  //控制是否弹出公司列表
  showListSelector = (flag) =>{
    this.setState({
      companyListSelector: flag
    })
  };

  //处理公司弹框点击ok,分配公司
  handleListOk = (result) => {
    if(result.result.length>0){
      let companyIds = [];
      let resourceIds = [];
      resourceIds.push(this.props.match.params.id);
      result.result.map((item)=>{
        companyIds.push(item.id)
      });
      let param = [];
      param.push({"companyIds": companyIds, "resourceIds": resourceIds});
      budgetService.batchAddCompanyToItem(param).then((response)=>{
        if(response.status === 200){
          message.success(`${this.$t({id:"common.operate.success"})}`);
          this.setState({
            loading: true,
            companyListSelector: false,
          },this.getList())
        }
      }).catch((e)=>{
        if(e.response){
          message.error(`${this.$t({id:"common.operate.filed"})},${e.response.data.message}`)
        }
      });
    }else
      this.showListSelector(false);
  };

  //返回预算项目
  handleBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
          .replace(':id', this.props.match.params.orgId)
          .replace(":setOfBooksId",this.props.match.params.setOfBooksId)
          .replace(':tab','ITEM')
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
    const { loading,edit, pagination, columns, data, visible, infoList, budgetItem, companyListSelector} = this.state;
    return(
      <div className="budget-item-detail">
        <BasicInfo
          infoList={infoList}
          infoData={budgetItem}
          updateHandle={this.handleUpdate}
          updateState={edit}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={()=>this.showListSelector(true)}>{this.$t({id: 'structure.addCompany'})}</Button>  {/*添加公司*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          onChange={this.onChangePager}
          size="middle"
          bordered/>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{this.$t({id:"common.back"})}</a>
        <ListSelector type="company_item"
                      visible={companyListSelector}
                      onOk={this.handleListOk}
                      extraParams={{itemId: this.props.match.params.id}}
                      onCancel={()=>this.showListSelector(false)}/>
      </div>)
  }
}


function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

const WrappedBudgetItemDetail = Form.create()(BudgetItemDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedBudgetItemDetail);

