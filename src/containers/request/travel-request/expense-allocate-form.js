
/**
 * Created by wangjiakun on 2018/4/23 0023.
 */
import React from 'react';
import { connect } from 'react-redux';

import { messages, getApprovelHistory } from 'share/common';
import {Table, message, InputNumber, Form, Popconfirm} from 'antd';
const FormItem = Form.Item;

import config from 'config'
import travelUtil from 'containers/request/travel-request/travelUtil'
import chooserData from 'share/chooserData'
import Chooser from 'components/chooser'

class ExpenseAllocateForm extends React.Component{
  value = [];//承载兼容老版本格式的分摊数据；
  isInitColumn = false;//是否已经初始化过表格列（列的数量是不确定的，需要动态初始化）
  count = 0;//部门和成本中心值变化次数，大于2时为用值。
  constructor(props){
    super(props);
    this.state = {
      custFormValue:[],//来自表单的表单配置项的值,主要用来设置分摊的默认项
      values:[],//编辑状态的分摊所有数据
      columns: [],
      isShowAddBtn:false,//是否显示新增分摊按钮
    }
  };

  componentWillReceiveProps(nextProps){
    nextProps.copyValue.map((res, index) =>{
      if(res.messageKey === 'select_department' || res.messageKey === 'select_cost_center'){
        this.setState({isShowAddBtn:true});
        if(this.state.custFormValue.length>0){
          if(this.state.custFormValue[index].value !== res.value){
            this.setCustFormValue(nextProps);
            return;
          }
        }else{
          let allocate = travelUtil.getFormHeadValue(nextProps.copyValue, 'exp_allocate');
          let department = travelUtil.getFormHeadValue(nextProps.copyValue, 'select_department');
          let cost_center = travelUtil.getFormHeadValue(nextProps.copyValue, 'select_cost_center');
          if(allocate.length > 0){
            if(department && cost_center){
              this.setCustFormValue(nextProps, true);
            }
          }else{
            this.setCustFormValue(nextProps);
          }
          return;
        }
      }
    });
  };

  componentDidMount(){
    let value = this.props.value ? this.props.value : [];
    if(value.length !== 0 ){
      //分摊信息有值，则通过分摊信息值初始化表格列
      this.value = value;
      this.initColumn(this.value);
    }
  };

  //分摊比例变化监听函数
  scaleChange = (value,index) =>{
    if(this.judgeIsSBCCase(value)){
      message.error(messages('itinerary.form.component.allocation.input.tip')/*'请切换输入法半角'*/);
      this.updateTable(this.value);
      return;
    }
    let surplus = this.value[0].scale - (value - this.value[index].scale);
    let formatSurplus = parseFloat(surplus.toFixed(2));
    if(formatSurplus >= 0.00){
      this.value[0].scale = formatSurplus;
      this.value[index].scale = value;
    }else{
      message.error(messages('itinerary.form.component.allocation.error.tip')/*'分摊比例不正确'*/);
    }
    this.updateTable(this.value);
  };

  //是否是全角格式字符
  judgeIsSBCCase = (str) =>{
    str = str + '';
    let sbcCase = str.match(/[\uff00-\uffff]/g);
    return sbcCase;
}

  /**
   * 表格中部门和成本中心变化监听
   * @param v 部门和成本中心控件返回值
   * @param index 行下标（第几行）
   * @param count 原分摊信息列下标（第几列）
   */
  departmentChange = (v, index ,count, type) =>{
    this.value[index].costCenterItems[count].name = v[0] ? v[0].name : undefined;
    this.value[index].costCenterItems[count].costCenterOID = v[0] ? v[0][type] : undefined;
    this.value[index].hashStr = "";
    this.value[index].costCenterItems.map((item , num) =>{
      if(item.costCenterOID){
        this.value[index].hashStr = this.value[index].hashStr + item.costCenterOID;
      }
    });
    this.updateTable(this.value);
  };

  /**
   * 复制所有表单的配置项数据
   * @param nextProps 表单配置项改变后的值
   * @param isEdit 是否是编辑状态（编辑状态下分摊信息不回为空）
     */
  setCustFormValue = (nextProps, isEdit) => {
    let values = [];
    nextProps.copyValue.map(res =>{
      let showName = undefined;
      if(isEdit){
        showName = {name:res.showValue};
      }else {
        showName = res.showName;
      }
      values.push({
        messageKey:res.messageKey,
        value:res.value,
        showName:res.showName,
        fieldName:res.fieldName,
        required:res.required,
        dataSource:res.dataSource
      });
    })
    this.setState({custFormValue:values}, this.setValueDefaultItem);
  };

  //设置分摊信息的默认值
  setValueDefaultItem = () =>{
    let defaultItem = {
      entityType:1001,
      scale:this.value[0] ? this.value[0].scale : 100,
      defaultApportion:true,
      costCenterItems:[],
    };
    this.state.custFormValue.map(item =>{
      let centerItem = {
        messageKey:item.messageKey,
        type:1,
        fieldName:item.fieldName,
        required:item.required,
        selected:null,
        costCenterOID:item.value,
      }
      if(item.messageKey === 'select_department'){
        centerItem.name = item.showName ? item.showName.name : null;
        defaultItem.costCenterItems.push(centerItem);
      }else if(item.messageKey === 'select_cost_center'){
        centerItem.name = item.showName ? item.showName.name : null;
        centerItem.type = 0;
        centerItem.costCenter = JSON.parse(item.dataSource ? item.dataSource : '{}').costCenterOID;
        defaultItem.costCenterItems.push(centerItem);
      }
    });
    if(this.value.length > 0 && defaultItem.costCenterItems[0].name){
      //判断是否需要重新排序和替换
      let isSortAndReplace = travelUtil.allocateColumnIsSort(this.value, defaultItem);
      if(isSortAndReplace.isSort){//是否需要排序
        defaultItem = travelUtil.allocateColumnSort(this.value, defaultItem);//重新排序
        isSortAndReplace = travelUtil.allocateColumnIsSort(this.value, defaultItem);
        if(isSortAndReplace.canReplace){//是否需要替换
          this.value.splice(0, 1, defaultItem);
        }
      }else if(isSortAndReplace.canReplace){//是否需要替换
        this.value.splice(0, 1, defaultItem);
      }
    }else if(!this.value || this.value.length === 0){
      this.value.push(defaultItem);
    }else{
      this.value.splice(0, 1, defaultItem);
    }
    if(this.isInitColumn){
      this.updateTable(this.value);
    }else{
      this.initColumn(this.value);
    }
  };

  //初始化分摊的表格列
  initColumn = (value) =>{
    this.isInitColumn = true;
    const { columns } = this.state;
    let values = [];
    value.map((item, index) => {
      let tableItem = {
        scale:item.scale,
        defaultApportion:item.defaultApportion,
      }
      item.costCenterItems.map((cost, count) =>{
        tableItem['type' + count] = cost.type;
        tableItem['name' + count] = cost.name;
        tableItem['costCenterOID' + count] = cost.costCenterOID;
        if(cost.type === 0) tableItem['costCenter' + count] = cost.costCenter;
        if(item.defaultApportion){
          columns.push({
            title: cost.fieldName,
            dataIndex: 'name' + count,
            key:cost.fieldName,
            render: (value, record, index) => this.renderColumn(value, record, index, cost.type, count)})
        }
      });
      values.push(tableItem);
    });
    columns.push({
      title:messages('itinerary.form.component.allocation.scale')/* '分摊比列(%)'*/,
      key:'scale',
      dataIndex: 'scale',
      render: (value, record, index) => this.renderScale(value, record, index)
    }),
      columns.push({title: messages('itinerary.form.component.allocation.operation')/*操作*/, key:'operation', dataIndex: 'operation', render: (value, record, index) =>
        index===0 ? '---':<Popconfirm title={messages('itinerary.form.component.allocation.delete.tip')/*'确认删除?'*/} onConfirm={(e) => this.deleteAllocate(index)}>
          <a onClick={(e) => {e.stopPropagation()}}>{messages('itinerary.type.slide.and.modal.delete.btn')/*删除*/}</a>
        </Popconfirm>
      });
    this.setState({values:values,columns});
  };

  /**
   * 生成分摊比例列
   * @param nowValue
   * @param record 行信息
   * @param index  行下标
   * @returns {XML}
     */
  renderScale = (nowValue, record, index) =>{
    return (<InputNumber
      disabled={index===0}
      min={0}
      max={100}
      precision={2}
      formatter={value => `${value}%`}
      parser={value => value.replace('%', '')}
      value={record.scale}
      onChange={(v)=>this.scaleChange(v, index)}
      defaultValue={record.scale}/>)
  };

  /**
   * 生成部门列和成本中心列
   * @param value
   * @param record 行信息，包含该表格该行的所有字段信息
   * @param index  行下标
   * @param type   类型，取值0为成本中心，取值1为部门
   * @param count  列下标
   * @returns {XML}
   */
  renderColumn = (value, record, index, type, count) =>{
    if(type===1){//部门
      let defaultValue = [{name: record['name' + count], departmentOid: record['costCenterOID' + count]}];
      return (
        <Chooser type='department'
                 valueKey="departmentOid"
                 labelKey="name"
                 onChange={(v)=>this.departmentChange(v, index, count,'departmentOid')}
                 value={record['name' + count] ? defaultValue : null}
                 disabled={record.defaultApportion ? true : false}
                 single/>
      )
    }else{//成本中心
      let defaultValue = JSON.parse(JSON.stringify([{name: record['name' + count], costCenterItemOID: record['costCenterOID' + count]}]));
      const chooserItem = JSON.parse(JSON.stringify(chooserData['cost_center_item']));
      chooserItem.url = `${config.baseUrl}/api/my/cost/center/items/${record['costCenter'+JSON.stringify(count)]}`;
      return (
        <Chooser selectorItem={chooserItem}
                 valueKey="costCenterItemOID"
                 labelKey="name"
                 onChange={(v)=>this.departmentChange(v, index, count, 'costCenterItemOID')}
                 value={record['name' + count] ? defaultValue : null}
                 disabled={record.defaultApportion ? true : false}
                 single/>
      )
    }
  };

  //新增分摊
  addNewAllocate = () =>{
    if(this.value[0].scale <= 0){
      message.error(messages('itinerary.form.component.allocation.noEnough.tip')/*'分摊比例不足'*/);
      return;
    }
    let value = this.value;
    let isEmpty = false;//是否有空行
    let isColumnRepeat = false;//列值是否有重复
    //开始新增 如果value为空，则根据表单传过来的custFormValue中配置的成本中心和部门新增
    if(value.length){
      isEmpty = travelUtil.allocateColumnIsEmpty(value);
      if(!isEmpty.isCanAdd){
        message.error(isEmpty.reason);
        return;
      }
      isColumnRepeat = travelUtil.allocateColumnIsRepeat(value);
      if(isColumnRepeat.isRepeat){
        message.error(isColumnRepeat.reason);
        return;
      }
      let newItem = {
        entityType:value[0].entityType,
        scale:0,
        defaultApportion:false,
        costCenterItems:[],
        hashStr:''
      }
      value[0].costCenterItems.map(cost=>{
        let costItem = {
          type:cost.type,
          fieldName:cost.fieldName,
          required:cost.required,
          selected:null,
          name:undefined,
          costCenterOID:undefined
        }
        if(cost.type === 0){
          costItem.costCenter = cost.costCenter;
        }
        newItem.costCenterItems.push(costItem);
      });
      value.push(newItem);//新增完成
    }
    this.updateTable(value);
  };

  //删除分摊行
  deleteAllocate = (index) =>{
    const { values } = this.state;
    values.splice(index, 1);
    this.value[0].scale = this.value[0].scale + this.value[index].scale;
    this.value.splice(index, 1);
    this.updateTable(this.value);
  };

  //更新表格
  updateTable = (value) =>{
    let values = [];
    value.map((item,index) => {
      let tableItem = {
        scale:item.scale,
        defaultApportion:item.defaultApportion,
      }
      item.costCenterItems.map((cost, count) =>{
        tableItem['type' + count] = cost.type;
        tableItem['name' + count] = cost.name;
        tableItem['costCenterOID' + count] = cost.costCenterOID;
        if(cost.type === 0) tableItem['costCenter' + count] = cost.costCenter;
      });
      values.push(tableItem);
    });
    this.onChange(this.value);
    this.setState({values:values});
  };

  onChange = (changeValue) =>{
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changeValue);
    }
  };

  render(){
    const { values, columns, isShowAddBtn} = this.state;
    return (
      <div>
        <Table rowKey={(record, index) => index}
               columns={columns}
               dataSource={values}
               pagination={false}
               style={{width:'150%'}}
               bordered
               size="small"/>
        {
          isShowAddBtn && <a onClick={()=>this.addNewAllocate()}>{messages('itinerary.form.component.allocation.new')/*+新增分摊*/}</a>
        }
      </div>
    )
  };
}

ExpenseAllocateForm.propTypes = {
  copyValue:React.PropTypes.array,
  value:React.PropTypes.array,
  onChange: React.PropTypes.func,
}

function mapStateToProps(state) {
  return {};
}
const wrappedExpenseAllocateForm = Form.create()(ExpenseAllocateForm);
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedExpenseAllocateForm);


