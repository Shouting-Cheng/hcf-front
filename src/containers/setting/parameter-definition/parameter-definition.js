/**
 * created by jsq on 2018/12/26
 */
import React from 'react'
import { connect } from 'dva'
import {Button, Badge, notification, Popover, Tabs, Divider, Popconfirm} from 'antd';
import { routerRedux } from 'dva/router';
import Table from 'widget/table'
import SearchArea from 'widget/search-area';
import NewParameterDefinition from 'containers/setting/parameter-definition/new-parameter-definition'
const TabPane = Tabs.TabPane;
import config from 'config';
import CustomTable from "widget/custom-table";
import parameterService from 'containers/setting/parameter-definition/parameter-definition.service'
import SlideFrame from 'widget/slide-frame'
import sobService from 'containers/finance-setting/set-of-books/set-of-books.service'
import paramsService from 'containers/setting/parameter-definition/parameter-definition.service'

class ParameterDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [{id:1}],
      searchParams: {},
      record: {},
      sobOptions:[],
      sob:{},
      visible: false,
      nowTab: 0,
      tabs:[
        {
          key: 0, value: this.$t('parameter.definition.teat')
        },
        {
          key: 1, value: this.$t('parameter.definition.sob')
        },
        {
          key: 2, value: this.$t('parameter.definition.comp')
        },
      ],
      searchForm: [
        {
          type: 'select', id: 'structureCode', label: this.$t({id: 'parameter.definition.model'}),
          options: [],
          labelKey: 'itemTypeName',
          valueKey: 'id',
          colSpan: 6,
          listExtraParams: { organizationId: this.props.id },
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          getParams: { roleType:'TENANT' },
        },
        {type: 'input', id: 'structureCode1',colSpan: 6, label: this.$t({id: 'budget.parameterCode'}) }, /*参数代码*/
        {type: 'input', id: 'structureName',colSpan: 6, label: this.$t({id: 'budget.parameterName'}) }, /*参数名称*/
      ],
      columns: [
        {          /*模块*/
          title: this.$t({id:"parameter.definition.model"}), key: "structureCodeg", dataIndex: 'structureCode',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*参数代码*/
          title: this.$t({id:"budget.parameterCode"}), key: "structureName", dataIndex: 'structureName', align:'center',
        },
        {          /*参数名称*/
          title: this.$t({id:"budget.parameterName"}), key: "structureName1", dataIndex: 'structureName', align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*参数层级*/
          title: this.$t({id:"parameter.level"}), key: "periodStrategy", dataIndex: 'periodStrategy', align:"center",
        },
        {          /*参数值*/
          title: this.$t({id:"budget.balance.params.value"}), key: "value", dataIndex: 'periodStrategy', align:"center",
        },
        {           /*描述*/
          title: this.$t({id:"chooser.data.description"}), key: "description", dataIndex: 'description',align:"center",
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {           /*操作*/
          title: this.$t({id:"common.operation" }),
          dataIndex: 'operation',
          align: 'center',
          render: (operation, record, index) => {
            return (
              <div>
                <a onClick={e=>this.handleEdit(e,record)} >{this.$t('common.edit')}</a>
                {
                  this.state.nowTab.toString() !== '0' &&
                    <span>
                      <Divider type="vertical" />
                      <Popconfirm title={this.$t('configuration.detail.tip.delete')} onConfirm={e => this.deleteItem(e, record)}>
                        <a>{this.$t('common.delete')}</a>
                      </Popconfirm>
                    </span>
                }

              </div>
            );
          }
        }
      ],
    }
  }
  componentDidMount(){
    //this.getList();
    let params = {
      roleType: 'TENANT',
      enabled: true
    };
    sobService.getTenantAllSob(params).then(res=>{
      let {sob, sobOptions} = this.state;
      res.data.map(item=>{
        sobOptions.push({value: item.id, label: item.setOfBooksName});
        item.id===this.props.company.setOfBooksId&&(sob={key: item.id, label: item.setOfBooksName,...item});
        item.id===this.props.company.setOfBooksId&&console.log(item)
      });
      this.setState({sob,sobOptions})
    });
  }

  handleEdit = (e,record)=>{
    e.preventDefault();
    e.stopPropagation();
    console.log(record)
    this.setState({
      visible: true,
      record
    })
  };


  handleSearch = (values) =>{
    console.log(values)
    values.setOfBooksId&&values.setOfBooksId===this.props.company.setOfBooksName&&(values.setOfBooksId=this.props.company.setOfBooksId);
    this.setState({

    }, ()=>{
      //this.getList();
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

 handleAdd = () =>{
   this.setState({visible: true})
 };

  //点击行，进入该行详情页面
  handleRowClick = (record, index, event) =>{
    console.log(this.props)
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-structure/budget-structure-detail/orgId/:setOfBooksId/:id'
          .replace(':orgId', this.props.organization.id)
          .replace(":setOfBooksId",this.props.setOfBooksId)
          .replace(':id', record.id)
      })
    );
  };

  handleClose = (params) =>{
    console.log(params)
    this.setState({
      visible: false
    })
  };

  renderContent(){
    const { searchForm, loading, data, columns, nowTab } = this.state;

    return(<div style={{marginTop: 15}}>
      <SearchArea searchForm={searchForm} maxLength={4} submitHandle={this.handleSearch}/>
      <div className="table-header" style={{marginTop: 15}}>
        {
          nowTab.toString()!=='0'&&
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleAdd}>{this.$t({id: 'common.add'})}</Button>  {/*添加*/}
          </div>
        }
      </div>
      <CustomTable
        columns={columns}
        url={`${config.baseUrl}/api/parameter/moduleCode`}
        ref={ref => (this.table = ref)}
      />
    </div>)
  }

  handleTab = (key)=>{
    let {searchForm, columns, searchParams,sob, sobOptions} = this.state;

    switch(key){
      case '0':{
        if(columns.length === 8){
          searchForm.splice(0,1);
          columns.splice(0,1);
          searchParams = {}
        }
        break;
      }
      case '1': {
        searchParams = {
          setOfBooksId: this.props.company.setOfBooksId
        };
        console.log(sobOptions)
        searchForm.splice(0,columns.length === 7 ? 0 : 1,{
          type: 'select', id: 'structureCode123', label: this.$t({id: 'form.setting.set.of.books'}),
          options: sobOptions,
          labelKey: 'setOfBooksName',
          valueKey: 'id',
          entity: true,
          colSpan: 6,
          defaultValue: {key:sob.id, label: sob.setOfBooksCode+'-'+sob.setOfBooksName},
          renderOption: option=> option.setOfBooksCode+'-'+option.setOfBooksName,
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          getParams: { roleType:'TENANT',enabled: true },
        });
        columns.splice(0,columns.length === 7 ? 0 : 1,{
          title: this.$t({id:"form.setting.set.of.books"}), key: "sob", dataIndex: 'structureCode',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        });
        break;
      }
      case '2': {
        searchForm.splice(0,columns.length === 7 ? 0 : 1,{
          type: 'list', id: 'structureCode', label: this.$t({id: 'exp.company'}),
          listType: 'company',
          options: [],
          labelKey: 'itemTypeName',
          valueKey: 'id',
          colSpan: 6,
          single: true,
          listExtraParams: { roleType:'TENANT',enabled: true},
          //getUrl: `${config.baseUrl}/api/company/dto/by/tenant`,
        });
        columns.splice(0,columns.length === 7 ? 0 : 1,{
          title: this.$t({id:"exp.company"}), key: "com", dataIndex: 'structureCode',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        });
        break;
      }
    }

    this.setState({searchForm,nowTab: key, sob})
  };

  render(){
    const {tabs, nowTab, visible, record, sob, } = this.state;
    return (
      <div className="parameter-definition">
        <Tabs onChange={this.handleTab} type='card'>
          {tabs.map(item=><TabPane tab={item.value} key={item.key}>{this.renderContent()}</TabPane>)}
        </Tabs>
        <SlideFrame
          title={tabs[nowTab].value+ this.$t('parameter.definition')}
          show={visible}
          onClose={()=>this.setState({visible: false})}>
          <NewParameterDefinition
            params={{...record,visible, sob, nowTab }}
            onClose={this.handleClose}
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

export default connect(mapStateToProps, null, null, { withRef: true })(ParameterDefinition);
