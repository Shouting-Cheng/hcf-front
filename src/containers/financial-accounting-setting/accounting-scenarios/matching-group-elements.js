/**
 * created by jsq on 2018/1/2
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Badge, Icon, Popover} from 'antd'
import SlideFrame from 'components/slide-frame'
import NewUpdateMatchingGroup from 'containers/financial-accounting-setting/accounting-scenarios/new-update-matching-group'
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios.service';
import menuRoute from 'routes/menuRoute'
import 'styles/financial-accounting-setting/accounting-scenarios/matching-group-elements.scss'
import {formatMessage} from 'share/common'

class MatchingGroupElements extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      scenariosVisible: false,
      scenarios: {
        transactionSceneName: ""
      },
      data: [],
      lov:{
        visible: false
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
        {          /*优先级*/
          title: formatMessage({id:"accounting.priority"}), key: "priority", dataIndex: 'priority'
        },
        {          /*匹配组代码s*/
          title: formatMessage({id:"matching.group.code"}), key: "code", dataIndex: 'code'
        },
        {          /*匹配组名称*/
          title: formatMessage({id:"matching.group.name"}), key: "description", dataIndex: 'description',
          render: desc => <span>{desc ? <Popover placement="topLeft" content={desc}>{desc}</Popover> : '-'}</span>
        },
        {          /*核算要素*/
          title: formatMessage({id:"accounting.scenarios.elements"}), key: "eleCodes", dataIndex: 'eleCodes',
          render:(decode,record,index)=>{
            let eleCodes = "";
            record.lines.map(item=>{
              eleCodes += item.elementNature+ ","
            });
            eleCodes = eleCodes.substr(0,eleCodes.length-1);
            return <span>{eleCodes==="" ? "-":<Popover content={eleCodes}>{eleCodes} </Popover> } </span>
          }
        },
        {           /*状态*/
          title: formatMessage({id:"common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})} />
          )
        },
        {title: formatMessage({id:"common.operation"}), key: 'operation', width: '12%', render: (text, record, index) => (
          <span>
            <a href="#" onClick={(e) => this.handleUpdate(e, record,index)}>{formatMessage({id: "common.edit"})}</a>   {/*编辑*/}
            <span className="ant-divider" />
            <a href="#" onClick={(e) => this.handleLinkSubject(e, record,index)}>{formatMessage({id: "accounting.subjects.matching"})}</a>
          </span>)
        },
      ],
    };
  }

  handleLinkSubject = (e, record,index)=>{
    this.context.router.push(menuRoute.getRouteItem('accounting-scenarios', 'key').children.subjectMatchingSetting.url.replace(':id', this.props.params.id).replace(':groupId',record.id))
  };

  componentWillMount() {
    accountingService.getScenariosById({id:this.props.params.id}).then(response=>{
      this.setState({
        scenarios: response.data
      })
    },this.getList());
  }

  getList(){
    let params = {
      page: this.state.pagination.page,
      size: this.state.pagination.pageSize,
      mappingId: this.props.params.id
    };
    accountingService.getSobElement(params).then(response=>{
      let data = [];
      response.data.map(item=>{
        item.head.key = item.head.id;
        item.head.lines = item.lines;
        data.push(item.head)
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: data,
        pagination
      })
    })
  }

  handleCreate = ()=>{
    let lov = {
      title: formatMessage({id:"accounting.matching.group.new"}),
      visible: true,
      params: {
        sceneMappingId: this.props.params.id,
        scenarios: this.state.scenarios
      }
    };
    this.setState({
      lov
    })
  };

  handleUpdate = (e,record,index)=>{
    record.scenarios = this.state.scenarios;
    let lov = {
      title: formatMessage({id:"accounting.matching.group.update"}),
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
      },this.getList())
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

  handleBack = () => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-scenarios', 'key').url.replace(':setOfBooksId',this.props.params.setOfBooksId));
  };

  render(){
    const { loading, data, columns, searchForm, pagination, lov, dataVisible, scenariosVisible, scenarios } = this.state;
    return(
      <div className="accounting-scenarios">
        <div className="accounting-scenarios-head-tips">
          {formatMessage({id:"section.setOfBook"})}:
          &nbsp;<label>{this.state.scenarios.setOfBooksName}</label>
          &nbsp;&nbsp;&nbsp;&nbsp;{formatMessage({id:"accounting.scenarios"},{name:""})+`: ${this.state.scenarios.transactionSceneName}`}
        </div>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id:'common.total'},{total:`${pagination.total}`})}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.create'})}</Button>  {/*添加*/}
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
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}><Icon type="rollback" style={{marginRight:'5px'}}/>{formatMessage({id:"common.back"})}</a>
        <SlideFrame title= {lov.title}
                    show={lov.visible}
                    content={NewUpdateMatchingGroup}
                    afterClose={this.handleAfterClose}
                    onClose={()=>this.handleShowSlide(false)}
                    params={{...lov.params,visible:lov.visible}}/>
      </div>
    )
  }
}


MatchingGroupElements.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(MatchingGroupElements);
