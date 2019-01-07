/**
 * created by jsq on 2018/12/26
 */
import React from 'react'
import { connect } from 'dva'
import { Popover } from 'antd';
import SearchArea from 'widget/search-area';
import NewParameterDefinition from 'containers/setting/parameter-definition/new-parameter-definition'
import config from 'config';
import CustomTable from "widget/custom-table";
import SlideFrame from 'widget/slide-frame'

class ParameterDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: {},
      visible: false,
      tabs:[
        {
          key: '0', value: this.$t('parameter.definition.teat')
        },
        {
          key: '1', value: this.$t('parameter.definition.sob')
        },
        {
          key: '2', value: this.$t('parameter.definition.comp')
        },
      ],

      searchForm: [
        {
          type: 'select', id: 'moduleCode', label: this.$t({id: 'parameter.definition.model'}),
          options: [],
          labelKey: 'moduleName',
          valueKey: 'moduleCode',
          colSpan: 6,
          getUrl: `${config.baseUrl}/api/parameter/module`,
          method: 'get',
          event: 'MODULE'
        },
        {type: 'input', id: 'parameterCode',colSpan: 6, label: this.$t({id: 'budget.parameterCode'}) }, /*参数代码*/
        {type: 'input', id: 'parameterName',colSpan: 6, label: this.$t({id: 'budget.parameterName'}) }, /*参数名称*/
      ],
      columns: [
        {          /*模块*/
          title: this.$t({id:"parameter.definition.model"}), key: "moduleName", dataIndex: 'moduleName',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*参数代码*/
          title: this.$t({id:"budget.parameterCode"}), key: "parameterCode", dataIndex: 'parameterCode', align:'center',
        },
        {          /*参数名称*/
          title: this.$t({id:"budget.parameterName"}), key: "parameterName", dataIndex: 'parameterName', align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*参数层级*/
          title: this.$t({id:"parameter.level"}), key: "parameterHierarchy", dataIndex: 'parameterHierarchy', align:"center",
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*参数值*/
          title: this.$t({id:"budget.balance.params.value"}), key: "parameterValue", dataIndex: 'parameterValue', align:"center",
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {           /*描述*/
          title: this.$t({id:"chooser.data.description"}), key: "parameterValueDesc", dataIndex: 'parameterValueDesc',align:"center",
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {           /*操作*/
          title: this.$t({id:"common.operation" }),
          dataIndex: 'operation',
          align: 'center',
          render: (operation, record) => <a onClick={e=>this.handleEdit(e,record)} >{this.$t('common.edit')}</a>
        }
      ],
    }
  }

  handleEdit = (e,record)=>{
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      visible: true,
      record
    })
  };

  handleSearch = (values) =>{
    this.setState({
      searchParams: values
    }, ()=>{
      this.table.search({...values, parameterLevel: 'TENANT'});
    })
  };

  handleEvent = (event,value)=>{
    switch (event) {
      case 'MODULE': this.table.search({
        parameterLevel: 'TENANT',
        moduleCode: value
      });break;
    }
  };

  handleClose = (params) =>{
    this.setState({
      visible: false
    },()=>{
      params&&this.table.search({parameterLevel: 'TENANT'})
    })
  };

  render(){
    const {tabs, nowTab, visible, record, sob, searchForm, columns } = this.state;
    return (
      <div className="parameter-definition">
        <div className="content-sob" style={{marginTop: 15}}>
          <SearchArea eventHandle={this.handleEvent} searchForm={searchForm} maxLength={4} submitHandle={this.handleSearch}/>
          <div className="table-header" style={{marginTop: 15}}/>
          <CustomTable
            columns={columns}
            url={`${config.baseUrl}/api/parameter/setting/page/by/level/cond?parameterLevel=TENANT`}
            ref={ref => (this.table = ref)}
          />
        </div>)
        <SlideFrame
          title={this.$t('parameter.definition.teat')+ this.$t('parameter.definition')}
          show={visible}
          onClose={()=>this.setState({visible: false})}>
          <NewParameterDefinition
            params={{record: record,visible, sob, nowTab: '0' }}
            onClose={this.handleClose}
          />
        </SlideFrame>
      </div>
    )
  }

}


export default connect()(ParameterDefinition);
