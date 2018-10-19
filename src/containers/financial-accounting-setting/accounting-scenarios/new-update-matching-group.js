/**
 * created by jsq on 2018/01/02
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Table, Badge, Form, Input, Switch, Icon, InputNumber, message} from 'antd'
import SlideFrame from 'components/slide-frame'
import NewUpdateScenariosSystem from 'containers/financial-accounting-setting/accounting-scenarios-system/new-update-scenarios-system'
import accountingService from 'containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios.service';
import config from 'config'
import menuRoute from 'routes/menuRoute'
import 'styles/financial-accounting-setting/accounting-scenarios/new-update-matching-group.scss'
import {formatMessage} from 'share/common'

const FormItem = Form.Item;

class NewUpdateMatchingGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      btnLoading: false,
      firstRender: true,
      data: [],
      selectedRowKeys: [],
      matchGroup: {},
      sceneMappingId: null,
      scenarios:{},
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      columns: [
        {          /*核算要素*/
          title: formatMessage({id:"accounting.scenarios.elements"}), key: "accountElementCode", dataIndex: 'accountElementCode'
        },
        {          /*要素性质*/
          title: formatMessage({id:"accounting.matching.elements.nature"}), key: "elementNature", dataIndex: 'elementNature'
        },
        {           /*匹配字段*/
          title: formatMessage({id:"accounting.match.field"}),key: 'mappingGroupCode', dataIndex: 'mappingGroupCode',
        },
      ],
      selectedEntityOIDs: []    //已选择的列表项的OIDs
    };
  }

  handleLinkElement = (e, record,index)=>{
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-scenarios-system', 'key').children.accountingElements.url.replace(':id', record.id))
  };

  componentWillMount(){
    if(this.props.params.id){
      let selectedEntityOIDs = [];
      let selectedRowKeys = [];
      if(typeof this.props.params.lines !== 'undefined'){
        this.props.params.lines.map(item=>{
          selectedEntityOIDs.push(item)
        })
      }
      this.setState({
        matchGroup:this.props.params,
        enabled: this.props.params.enabled,
        firstRender: false,
        selectedEntityOIDs
      },this.getList);
    }else{
      this.setState({selectedEntityOIDs: [],firstRender: true})
    }
  }


  componentWillReceiveProps(nextprops){
    if(nextprops.params.visible&&!this.props.params.visible){
      this.setState({
        firstRender: false,
        matchGroup: nextprops.params,
        enabled: true,
      },this.getList);
    }

    if(!nextprops.params.visible&&this.props.params.visible){
      this.setState({
        firstRender: true,
        loading: false,
        enabled: true,
        selectedEntityOIDs: [],
        selectedRowKeys:[]
      });
      this.props.form.resetFields();
    }
  }

  //获取核算要素   可选核算要素为在核算场景定义中已启用且配置了【匹配组字段】的所有核算要素。
  getList(){
    let params = {
      transactionSceneId: this.state.matchGroup.scenarios.transactionSceneId
    };

    if(typeof this.state.matchGroup.id === 'undefined'){
      params.page = this.state.pagination.page;
      params.size = this.state.pagination.pageSize;
    }
    accountingService.getElementsGroupNotNull(params).then(response=>{
      let data = [];
      response.data.map((item)=> {
        item.key = item.id;
        //点击页码时，之前选择的数据还是要勾选
        this.state.selectedEntityOIDs.map(option => {
          if (typeof this.state.matchGroup.id !== 'undefined') {
            if (item.id == option.sceneElementId) {
              data.push(item)
            }
          }
        });
      });
      let pagination = this.state.pagination;
      pagination.total = typeof this.state.matchGroup.id === 'undefined' ? Number(response.headers['x-total-count']) : data.length;
      this.setState({
        loading: false,
        data: typeof this.state.matchGroup.id !== 'undefined' ||data.length>0 ? data : response.data,
        pagination
      })
    })
  }

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

  handleSave = (e)=>{
    e.preventDefault();
    this.setState({btnLoading: true,});
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let flag = !!this.state.matchGroup.id;
        values.sceneMappingId = flag ? this.state.matchGroup.scenarios.id : this.props.params.sceneMappingId;
        values.transactionSceneId = flag ?  this.state.matchGroup.scenarios.transactionSceneId : this.props.params.scenarios.transactionSceneId;
        values.transactionSceneCode = flag ? this.state.matchGroup.scenarios.transactionSceneCode :this.props.scenarios.transactionSceneCode;
        if(typeof this.state.matchGroup.id !== 'undefined'){
          values.id = this.state.matchGroup.id;
          values.versionNumber = this.state.matchGroup.versionNumber
        }
        let line = [];
        let selectedRowKeys = this.state.selectedRowKeys;
        let selectedEntityOIDs = this.state.selectedEntityOIDs;
        selectedEntityOIDs.map(item=>{
          let option = {
            mappingGrpHdId: this.state.matchGroup.id,
            elementNature: item.elementNature,
            layoutPriority: values.priority,
          };
          if(!item.sceneElementId){
            //新增
            option.sceneElementId = item.id;
            option.sceneElementCode = item.accountElementCode
          }
          line.push(option)
        });
        let params = {
          head: values,
          lines: typeof this.state.matchGroup.id === 'undefined' ? line : []
        };
        accountingService.addOrUpdateSobElements(params).then(response=>{
          if(typeof this.state.matchGroup.id === 'undefined')
            message.success(`${formatMessage({id: "common.save.success"},{name:""})}`);
          else
            message.success(`${formatMessage({id:"common.operate.success"})}`);
          this.props.form.resetFields();
          this.setState({loading: false,btnLoading: false});
          this.props.close(true);
        }).catch(e=>{
          if(e.response){
            if(typeof this.state.scenarios.id === 'undefined' )
              message.error(`${formatMessage({id: "common.save.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            else
              message.error(`${formatMessage({id: "common.operate.filed"})}, ${!!e.response.data.message ? e.response.data.message : e.response.data.errorCode}`);
            this.setState({loading: false,btnLoading: false})
          }
        });
      }
    })
  };

  handleCancel = ()=>{
    this.props.close(false)
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  //列表选择更改
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys});
  };

  //选择一行
  //选择逻辑：每一项设置selected属性，如果为true则为选中
  //同时维护selectedEntityOIDs列表，记录已选择的OID，并每次分页、选择的时候根据该列表来刷新选择项
  onSelectRow = (record, selected) => {
    let selectedEntityOIDs = this.state.selectedEntityOIDs;
    let selectedRowKeys = this.state.selectedRowKeys;
    if(selected){
      selectedEntityOIDs.push(record);
      selectedRowKeys.push(record.id)
    }else {
      selectedRowKeys.delete(record.id);
      selectedEntityOIDs.map(item=>{
        if(record.id === item.id){
          selectedEntityOIDs.delete(item)
        }
      })
    }
    this.setState({
      selectedEntityOIDs,
      selectedRowKeys
    })
  };

  //全选
  onSelectAllRow = (selected) => {
    let selectedEntityOIDs = this.state.selectedEntityOIDs;

    this.state.data.map(item=>{
      let flag = true;
      selectedEntityOIDs.map(children=>{
        if(item.id === children.id){
          flag = false;
        }
      });
      selected && flag&& selectedEntityOIDs.push(item);
      !selected && !flag && selectedEntityOIDs.delete(item)
    });
    this.setState({
      selectedEntityOIDs,
    })
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { loading, btnLoading,data, columns, matchGroup, pagination, enabled, selectedRowKeys, } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 0 },
    };
    const rowSelection = typeof matchGroup.id !== 'undefined' ? null :
      {
        selectedRowKeys,
        onChange: this.onSelectChange,
        onSelect: this.onSelectRow,
        onSelectAll: this.onSelectAllRow
      };

    return(
      <div className="new-update-matching-group">
        <div className="matching-group-form">
          <div className="matching-group-circle">1</div>
          <span className="matching-group-form-tips">{formatMessage({id:"matching.group.basicInfo"})}</span>
          <Form onChange={()=>this.setState({btnLoading:false})}>
            <FormItem {...formItemLayout} label={formatMessage({id:'matching.group.code'})  /*匹配组代码*/}>
              {getFieldDecorator('code', {
                initialValue: matchGroup.code,
                rules: [{
                  required: true,
                  message: formatMessage({id: "common.please.enter"})
                }]
              })(
                <Input disabled={typeof matchGroup.id === 'undefined' ? false : true} placeholder={formatMessage({id:"common.please.enter"})}/>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={formatMessage({id:'matching.group.name'})  /*匹配组名称*/}>
              {getFieldDecorator('description', {
                initialValue: matchGroup.description,
                rules: [{
                  required: true,
                  message: formatMessage({id: "common.please.enter"})
                }]
              })(
                <Input placeholder={formatMessage({id:"common.please.enter"})}/>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={formatMessage({id:'accounting.priority'})  /*优先级*/}>
              {getFieldDecorator('priority', {
                initialValue: matchGroup.priority,
                rules: [{
                  required: true,
                  message: formatMessage({id: "common.please.enter"})
                }]
              })(
                <InputNumber disabled={typeof matchGroup.id === 'undefined' ? false : true} placeholder={formatMessage({id:"common.please.enter"})}/>
              )}
            </FormItem>
            {
              this.props.params.visible&&
              <FormItem {...formItemLayout}
                        label={formatMessage({id:"common.column.status"})} colon={true}>
                {getFieldDecorator('enabled', {
                  valuePropName:"checked",
                  initialValue: enabled
                })(
                  <div>
                    <Switch defaultChecked={enabled}  checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                    <span className="enabled-type" style={{marginLeft:20,width:100}}>{ enabled ? formatMessage({id:"common.status.enable"}) : formatMessage({id:"common.disabled"}) }</span>
                  </div>)}
              </FormItem>
            }
            <div className="section-structure-header">
              {formatMessage({id:"account.scenario.match.tips"})}
            </div>
          </Form>
          <div className="matching-group-circle">2</div>
          <span className="matching-group-form-tips">{formatMessage({id:"accounting.scenarios.elements"})}</span>
          <span className="matching-group-form-label">{formatMessage({id:"accounting.scenarios.elements.select"})}</span>
        </div>
        {
          typeof this.state.matchGroup.id !== 'undefined' ? null :
            <div className="accounting-matching-table-head">
              <Icon type="info-circle" style={{color: '#1890ff'}} className="head-icon"/>
              {formatMessage({id: "accounting.total"}, {total: pagination.total}) + formatMessage({id: "accounting.selected"}, {count: this.state.selectedEntityOIDs.length})}
              <a className="info-clear" onClick={() => {
                this.setState({selectedEntityOIDs: [], selectedRowKeys: []})
              }}>{formatMessage({id: "common.clear"})}</a>
            </div>
        }
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={this.onChangePager}
          bordered
          size="middle"/>

        <div className="slide-footer">
          <Button type="primary" onClick={this.handleSave}  loading={btnLoading}>{formatMessage({id:"common.save"})}</Button>
          <Button onClick={this.handleCancel}>{formatMessage({id:"common.cancel"})}</Button>
        </div>
      </div>
    )
  }
}


NewUpdateMatchingGroup.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}
const WrappedNewUpdateMatchingGroup = Form.create()(NewUpdateMatchingGroup);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateMatchingGroup);
