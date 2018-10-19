/**
 *  crated by jsq on 2017/9/27
 */
import React from 'react';
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import budgetService from 'containers/budget-setting/budget-organization/budget-control-rules/budget-control-rulles.service'
import menuRoute from 'routes/menuRoute'

import { Form, Button, Select, Icon, Table, message, Popconfirm,  } from 'antd'

import 'styles/budget-setting/budget-organization/budget-control-rules/budget-control-rules-detail.scss';
import SlideFrame from 'components/slide-frame'
import NewBudgetRulesDetail from 'containers/budget-setting/budget-organization/budget-control-rules/new-budget-rules-detail'
import UpdateBudgetRulesDetail from 'containers/budget-setting/budget-organization/budget-control-rules/update-budget-rules-detail'

import BasicInfo from 'components/basic-info'

const FormItem = Form.Item;
const Option = Select.Option;

class BudgetControlRulesDetail extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      buttonLoading: false,
      data: [],
      edit: false,
      updateState: false,
      controlRule: {},
      strategyGroup:[],
      startValue: null,
      endValue: null,
      slideFrameTitle: "",
      showSlideFrameCreate: false,
      showSlideFrameUpdate: false,
      ruleDetail: {},
      pagination: {
        current:0,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      infoList: [
        {type: 'input', id: 'controlRuleCode', isRequired: true, disabled: true, label: formatMessage({id: 'budget.controlRuleCode'})+" :" /*业务规则代码*/},
        {type: 'input', id: 'controlRuleName', isRequired: true, label: formatMessage({id: 'budget.controlRuleName'})+" :" /*业务规则名称*/},
        {type: 'select', options: [],isRequired: true, id: 'strategyGroupName', label: formatMessage({id:"budget.strategy"})+" :"},
        {type: 'items', id: 'effectiveDate', infoLabel: formatMessage({id:"budget.controlRule.effectiveDate"})+":" ,  items: [
          {type: 'date', id: 'startDate', label: formatMessage({id:"budget.controlRule.effectiveDateFrom"})+" :", isRequired: true, event: 'DATE_FROM'},
          {type: 'date', id: 'endDate',  label: formatMessage({id:"budget.controlRule.effectiveDateTo"})+" :",isRequired: false, event:'DATE_TO'}
        ]},
        {type: 'input', id: 'priority', isRequired: true, disabled: true, label: formatMessage({id:"budget.controlRules.priority"}) /*优先级*/}
      ],
      columns: [
        {          /*规则参数类型*/
          title: formatMessage({id:"budget.ruleParameterType"}), key: "ruleParameterTypeDescription", dataIndex: 'ruleParameterTypeDescription',
          render: recode =>{
            return recode
          }
        },
        {          /*规则参数*/
          title: formatMessage({id:"budget.ruleParameter"}), key: "ruleParameterDescription", dataIndex: 'ruleParameterDescription'
        },
        {          /*取值方式*/
          title: formatMessage({id:"budget.filtrateMethod"}), key: "filtrateMethodDescription", dataIndex: 'filtrateMethodDescription'
        },
        {          /*取值范围*/
          title: formatMessage({id:"budget.summaryOrDetail"}), key: "summaryOrDetailDescription", dataIndex: 'summaryOrDetailDescription'
        },
        {          /*下限值*/
          title: formatMessage({id:"budget.parameterLowerLimit"}), key: "parameterLowerLimit", dataIndex: 'parameterLowerLimit'
        },
        {          /*上限值*/
          title: formatMessage({id:"budget.parameterUpperLimit"}), key: "parameterUpperLimit", dataIndex: 'parameterUpperLimit'
        },
        {          /*失效日期*/
          title: formatMessage({id:"budget.invalidDate"}), key: "invalidDate", dataIndex: 'invalidDate',
          render: description => (<span>{description === null ? "-" : description.substring(0,10)}</span>)
        },
        {title: formatMessage({id:"common.operation"}), key: 'operation', width: '8%', render: (text, record) => (
          <span>
            <Popconfirm onConfirm={(e) => this.deleteItem(e, record)} title={formatMessage({id:"budget.are.you.sure.to.delete.rule"}, {controlRule: record.controlRuleName})}>{/* 你确定要删除organizationName吗 */}
              <a href="#" onClick={(e) => {e.preventDefault();e.stopPropagation();}}>{formatMessage({id: "common.delete"})}</a>
            </Popconfirm>
          </span>)},  //操作
      ]
    }
  }

  deleteItem = (e, record) => {
    budgetService.deleteRuleDetail(record.id).then(response => {
      message.success(formatMessage({id:"common.delete.success"}, {name: record.organizationName})); // name删除成功
      this.getList();
    })
  };

  componentWillMount(){
    this.getList();
    //根据路径上的预算规则id查出完整数据
    budgetService.getRuleById(this.props.params.ruleId).then((response)=>{
      if(response.status === 200){
        let endDate = response.data.endDate === null ? "" : response.data.endDate.substring(0,10);
        response.data.effectiveDate = response.data.startDate.substring(0,10) + " ~ " +endDate;
       
        this.setState({
          controlRule: response.data,
          createParams: response.data
        })

      }
    });
    //加载页面时，获取启用的控制策略
    budgetService.getStrategy({organizationId:this.props.params.id,enabled:true}).then((response)=>{
      if(response.status === 200){
        let strategyGroup = [];
        response.data.map((item)=>{
          let strategy = {
            id: item.id,
            key: item.id,
            label: item.controlStrategyCode+" - "+item.controlStrategyName,
            value: item.controlStrategyName,
            title: item.controlStrategyName
          };
          strategyGroup.addIfNotExist(strategy)
        });
        let infoList = this.state.infoList;
        infoList[2].options = strategyGroup;
        this.setState({infoList,strategyGroup})
      }
    })
  }

  handleChange = (value,key)=>{
    switch(key){
      case 'DATE_FROM':
        this.setState({
          buttonLoading: new Date(value).getTime() > new Date(this.state.controlRule.endDate).getTime()
        });
        break;
      case 'DATE_TO':
        this.setState({
          buttonLoading: new Date(value).getTime() < new Date(this.state.controlRule.startDate).getTime()
        });
    }
  };

  //新建规则明细,左侧划出
  showSlideCreate = (flag) => {
    this.setState({
      showSlideFrameCreate: flag,
      showSlideFrameUpdate: false
    })
  };

  //编辑规则明细,左侧划出
  showSlideUpdate = (flag) => {
    this.setState({
      showSlideFrameUpdate: flag,
      showSlideFrameCreate: false
    })
  };

  handleEdit = (record) =>{
    this.setState({
      ruleDetail: record,
      showSlideFrameUpdate: true,
      showSlideFrameCreate: false
    })
  };

  handleCloseSlideCreate = (params) => {
    if(params) {
      this.setState({
        loading: true,
        showSlideFrameCreate: false
      });
      this.getList();
    }
  };

  handleCloseSlideUpdate = (changed)=>{
    if(changed)
      this.setState({
        showSlideFrameUpdate: false,
        loading: true
      },this.getList())
  };

  //保存编辑后的预算规则
  handleUpdate = (values)=>{
    let startTime = new Date(values.startDate);
    startTime.setHours(startTime.getHours()+8);
    let flag= true;
    if(values.endDate !== null){
      let endTime = new Date(values.endDate);
      endTime.setHours(endTime.getHours()+8);
      values.endDate = endTime;
    }

    values.organizationId = this.props.params.id;
    values.id = this.props.params.ruleId;
    values.versionNumber = this.state.controlRule.versionNumber;
    values.strategyGroupId = this.state.controlRule.strategyGroupId;
    values.enabled = this.state.controlRule.enabled;
    values.deleted = this.state.controlRule.deleted;
    values.createdBy = this.state.controlRule.createdBy;
    this.state.strategyGroup.map((item)=>{
      if(item.value === values.strategyGroupName){
        values.strategyGroupId = item.id;
      }
    });
    budgetService.updateRule(values).then((response)=>{
      if(response) {
        let endDate = response.data.endDate === null ? "" : response.data.endDate.substring(0,10);
        response.data.effectiveDate = response.data.startDate.substring(0,10) + " ~ " +endDate;
        this.state.strategyGroup.map((item)=>{
          if(item.id === response.data.strategyGroupId){
            response.data.strategyGroupName = item.value;
          }
        });
        message.success(formatMessage({id:"structure.saveSuccess"})); /*保存成功！*/
        this.setState({
          controlRule: response.data,
          updateState: true
        });
      }
    }).catch((e)=>{
      if(e.response){
        message.error(`${formatMessage({id:"common.operate.filed"})}, ${e.response.data.message}`);
      }
      this.setState({loading: false});
    })
    
  };

  //获取规则明细
  getList(){
    const {pagination} = this.state;
    budgetService.getRuleDetail({controlRuleId: this.props.params.ruleId,page:pagination.page,size:pagination.pageSize}).then((response)=>{
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


  //返回预算规则页面
  handleBack = () => {
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetOrganizationDetail.url.replace(':id', this.props.params.id).replace(":setOfBooksId",this.props.params.setOfBooksId)+ '?tab=RULE');
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
    const { loading, buttonLoading,slideFrameTitle, data, infoList, pagination, columns, showSlideFrameCreate,showSlideFrameUpdate, ruleDetail, controlRule, updateState } = this.state;
    return(
      <div className="budget-control-rules-detail">
        <BasicInfo
          infoList={infoList}
          loading={buttonLoading}
          infoData={controlRule}
          eventHandle={this.handleChange}
          updateHandle={this.handleUpdate}
          updateState={updateState}/>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button onClick={()=>this.showSlideCreate(true)} type="primary" >{formatMessage({id: 'common.create'})}</Button>  {/*新建*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          onRow={record => ({
            onClick: () => this.handleEdit(record)
          })}
          pagination={pagination}
          onChange={this.onChangePager}
          size="middle"
          bordered/>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{formatMessage({id:"common.back"})}</a>

        <SlideFrame title= {formatMessage({id: 'budget.createRulesDetail'})}
                    show={showSlideFrameCreate}
                    content={NewBudgetRulesDetail}
                    afterClose={this.handleCloseSlideCreate}
                    onClose={() => this.showSlideCreate(false)}
                    params={{ruleId:this.props.params.ruleId,visible: showSlideFrameCreate}}/>

        <SlideFrame title= {formatMessage({id: 'budget.editRulesDetail'})}
                    show={showSlideFrameUpdate}
                    content={UpdateBudgetRulesDetail}
                    afterClose={this.handleCloseSlideUpdate}
                    onClose={()=>this.showSlideUpdate(false)}
                    params={{...ruleDetail,visible: showSlideFrameUpdate}}/>
      </div>
    )
  }
}

BudgetControlRulesDetail.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

const WrappedBudgetControlRulesDetail = Form.create()(BudgetControlRulesDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedBudgetControlRulesDetail);
