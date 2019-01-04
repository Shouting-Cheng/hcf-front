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
      searchForm: [
        {
          type: 'select', id: 'structureCode123', label: this.$t({id: 'form.setting.set.of.books'}),
          options: [],
          labelKey: 'setOfBooksName',
          valueKey: 'id',
          entity: true,
          colSpan: 6,
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          getParams: { roleType:'TENANT',enabled: true },
        },
        {
          type: 'select', id: 'structureCode', label: this.$t({id: 'parameter.definition.model'}),
          options: [],
          labelKey: 'moduleName',
          valueKey: 'moduleCode',
          colSpan: 6,
          getUrl: `${config.baseUrl}/api/parameter/module`,
          method: 'get',
          //getParams: { roleType:'TENANT' },
        },
        {type: 'input', id: 'structureCode1',colSpan: 6, label: this.$t({id: 'budget.parameterCode'}) }, /*参数代码*/
        {type: 'input', id: 'structureName',colSpan: 6, label: this.$t({id: 'budget.parameterName'}) }, /*参数名称*/
      ],
      columns: [
        {
          title: this.$t({id:"form.setting.set.of.books"}), key: "sob", dataIndex: 'structureCode1',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*模块*/
          title: this.$t({id:"parameter.definition.model"}), key: "structureCodeg", dataIndex: 'structureCode2',align:'center',
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
  componentWillMount(){
    //this.getList();
    let params = {
      roleType: 'TENANT',
      enabled: true
    };
    sobService.getTenantAllSob(params).then(res=>{
      let {sob, sobOptions,searchForm} = this.state;
      res.data.map(item=>{
        sobOptions.push({value: item.id, label: item.setOfBooksCode+'-'+item.setOfBooksName,});
        item.id===this.props.company.setOfBooksId&&(sob={key: item.id, label: item.setOfBooksName,...item});
        item.id===this.props.company.setOfBooksId&&console.log(item)
      });
      searchForm[0].options = sobOptions;
      searchForm[0].defaultValue = {key:sob.setOfBooksId, label: sob.setOfBooksCode+'-'+sob.setOfBooksName};
      this.setState({sob,sobOptions,searchForm})
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
    },()=>{
      params&&this.table.search({parameterLevel: this.state.parameterLevel[this.state.nowTab]})
    })
  };


  render(){
    const {tabs, nowTab, visible, record, sob, searchForm,columns} = this.state;
    return (
      (<div className={`content-${nowTab}`} style={{marginTop: 15}}>
        <SearchArea searchForm={ searchForm} maxLength={4} submitHandle={this.handleSearch}/>
        <div className="table-header" style={{marginTop: 15}}>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleAdd}>{this.$t({id: 'common.add'})}</Button>  {/*添加*/}
          </div>

        </div>
        <CustomTable
          columns={columns}
          url={`${config.baseUrl}/api/parameter/setting/page/by/level/cond?parameterLevel=SOB`}
          ref={ref => (this.table = ref)}
        />
      </div>)
    )
  }

}

function mapStateToProps(state) {
  return {
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ParameterDefinition);
