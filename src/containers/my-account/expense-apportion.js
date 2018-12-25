
import React from 'react'
import { connect } from 'dva';
import {  Input, InputNumber, Form, Select, Spin, Icon, Row, Col} from 'antd'
import Table from 'widget/table'
const Option = Select.Option; 
const FormItem = Form.Item;
import PropTypes from 'prop-types';
const InputGroup = Input.Group;
import Chooser from 'components/Widget/chooser'
import 'styles/my-account/expense-apportion.scss'
import expenseReportService from 'containers/expense-report/expense-report.service'
import chooserData from 'share/chooserData'
import {removeArryItem} from "utils/extend";
import config from 'config';
import Importer from 'components/Widget/Template/importer';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer'
import { List as VList } from 'react-virtualized/dist/commonjs/List'
import ReactHeight from 'react-height'

class ExpenseApportion extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      heights : [],
      costCenterOid: '00000000-0000-0000-0000-000000000000',
      columns: [{
        title: this.$t('expense.apportion.amount')/*分摊金额*/,
        dataIndex: 'amount',
        width: 100,
        render: (text, record, index) => this.renderColumns(record, 'amount', index)
      }, {
        title: this.$t('expense.apportion.proportion')/*分摊比例*/,
        dataIndex: 'proportion',
        width: 100,
        render: (text, record, index) => this.renderColumns(record, 'proportion', index)
      }, {
        title:  this.$t('expense.apportion.payee')/*收款人*/,
        dataIndex: 'personName',
        width: 100,
        render: (text, record, index) => this.renderColumns(record, 'personName', index)
      }, {
        title: this.$t('common.operation')/*操作*/,
        dataIndex: 'operate',
        width: 100,
        render: (text, record, index) => this.renderColumns(record, 'operate', index)
      }],
      expenseApportion: [],
      defaultExpenseApportion: null,
      users: [],
      scrollX: 400,
      init: false,
      showImportFrame: false,
      tabKey: null
    };
  }

  componentDidMount(){
    if(this.props.readOnly){
      let { columns, scrollX } = this.state;
      columns.pop();
      scrollX -= 100;
      this.setState({ columns, scrollX })
    }
    this.handelColumns();
    this.initExpenseApportion(this.props, () =>  this.initColumns(this.props));
  }

  //列处理
  handelColumns() {
    let { columns, scrollX } = this.state;
    if (this.props.profile['all.total.amount.apportionment']) {
      removeArryItem(columns, columns.filter(item => item.dataIndex === 'personName')[0]);
      scrollX -= 200;
    }
    this.setState({columns, scrollX});
  }

  componentWillReceiveProps(nextProps){
    this.initExpenseApportion(nextProps);
  }

  initColumns = (nextProps) => {
    const { readOnly, costCenterItemsApportion } = nextProps;
    let { columns, scrollX } = this.state;
    //成本中心
    let costCenterColums = {
      title: '分摊项'/*分摊项*/,
      dataIndex: 'costCenterRender',
      width: 300,
      render: (text, record, index) => this.renderColumns(record, 'costCenterRender', index)
    };
    costCenterItemsApportion.length > 0 && (columns.splice(0,0,costCenterColums),scrollX += 300);
    //非只读模式下添加操作列
    let hasOperate = false;
    columns.map(item => {
      hasOperate = hasOperate || item.dataIndex === 'operate';
    });
    if(!readOnly && !hasOperate){
      columns.push({
        title: this.$t('common.operation')/*操作*/,
        dataIndex: 'operate',
        width: 100,
        render: (text, record, index) => this.renderColumns(record, 'operate', index)
      });
      scrollX += 100;
    } else if(readOnly && hasOperate){
      columns.pop();
      scrollX -= 100;
    }
    this.setState({ columns, scrollX });
  };

  initExpenseApportion = (props, afterSetState = () => {}) => {
    const { amount, value, onChange } = props;
    let { defaultExpenseApportion, loading } = this.state;
    if(!value || value.length === 0){
      let expenseReportOid = props.expenseReportOid;
      let expenseTypeId = props.expenseTypeId;
      if(expenseReportOid && expenseTypeId && !defaultExpenseApportion && !loading){
        this.setState({ loading: true });
        expenseReportService.getDefaultApportionment(expenseReportOid, expenseTypeId).then(res => {
          res.data[0].amount = amount * res.data[0].proportion;
          this.setState({ defaultExpenseApportion: res.data[0], loading: false, expenseApportion: res.data }, () => {afterSetState();onChange(res.data)})
        })
      } else if(!loading) {
        defaultExpenseApportion.amount = defaultExpenseApportion.proportion * amount;
        this.setState({ expenseApportion: [defaultExpenseApportion] }, () => {afterSetState();onChange([defaultExpenseApportion])});
      }
    } else {
      let expenseApportion = [];
      value.map((item, index) => {
        item.index = index;
        if(this.props.amount !=amount){
          item.amount = amount * item.proportion;
        }
        expenseApportion.push(item);
      });
      this.setState({ expenseApportion, defaultExpenseApportion: expenseApportion[0]}, () => {afterSetState()});
    }
  };

  handleChangeCostCenter = (result, index, costCenterIndex) => {
    if (result) {
      if (result.length === 0) {
        result[0] = {};
      }
      let {expenseApportion} = this.state;
      let costCenterItems = expenseApportion[index].costCenterItems[costCenterIndex];
      if (costCenterItems) {
        if (costCenterItems.costCenterOid === '00000000-0000-0000-0000-000000000000') {
          result[0].costCenterItemOid = result[0].departmentOid;
        }
        costCenterItems.costCenterItemOid = result[0].costCenterItemOid;
        costCenterItems.costCenterItemName = result[0].name;
        costCenterItems.name = result[0].name;
        expenseApportion[index].costCenterItems[costCenterIndex] = costCenterItems;
        this.props.onChange(expenseApportion);
      }
    }
  };

  handleChangeAmount = (result, index) => {
    if(typeof result === 'number' && !isNaN(result)){
      let { expenseApportion } = this.state;
      const { amount } = this.props;
      expenseApportion[index].amount = result;
      expenseApportion[index].proportion = result / amount;
      this.props.onChange(expenseApportion);
    }
  };

  handleChangeProportion = (result, index) => {
    if(typeof result === 'number' && !isNaN(result)){
      let { expenseApportion } = this.state;
      const { amount } = this.props;
      expenseApportion[index].proportion = result / 100;
      expenseApportion[index].amount =  result / 100 * amount;
      this.props.onChange(expenseApportion);
    }
  };

  handleChangePerson = (result, index) => {
    if(result){
      let { expenseApportion } = this.state;
      expenseApportion[index].relevantPerson = result[0].userOid;
      expenseApportion[index].personName = result[0].fullName;
      this.props.onChange(expenseApportion);
    }
  };

  renderColumns = (record, attr, index) => {
    if(record.index){
      index=record.index;
    }
    const {readOnly, costCenterItemsApportion, amountIsNegativeNumber} = this.props;
    const { defaultExpenseApportion } = this.state;
    let isEditable = defaultExpenseApportion && defaultExpenseApportion.isEditable;
    switch(attr){
      case 'costCenterRender':
        let html = (
          <div className={'department'}>
            {
              costCenterItemsApportion.map((costCenterItem, costCenterIndex) => {
                let isHaveItem = false;
                let costCenterItemIndex;
                record.costCenterItems && record.costCenterItems.map((item, indexCostCenterItems) => {
                  if (item.costCenterOid === costCenterItem.costCenterOid) {
                    isHaveItem = true;
                    costCenterItemIndex=indexCostCenterItems;
                  }
                })
                if (isHaveItem) {
                  let isDepartment = (costCenterItem.costCenterOid === '00000000-0000-0000-0000-000000000000');
                  let card = (<InputGroup style={{margin: '5px 0px', display: 'block',height: 'auto', overflow: 'auto'}}>
                  <Input defaultValue={`${costCenterItem.fieldName}:`} style={{ width: '30%',borderRight: '0px' }} disabled={true}/>
                    {
                      this.departmentCostCenterItem(record, index, costCenterItem, costCenterItemIndex, isDepartment)
                    }
                  </InputGroup>);
                  return card;
                }

              })
            }
          </div>
        );
        return html;
      case 'amount':
        return readOnly ? record.amount.toFixed(2) :
          <InputNumber style={{width: '100%',marginRight:0}}
                       onChange={(value) => this.handleChangeAmount(value, index)}
                       value={record.amount}
                       precision={2}
                       step={0.01}
                       min={amountIsNegativeNumber ? undefined : 0}
                       max={amountIsNegativeNumber ? 0 : undefined}
                       formatter={value => (typeof value === 'number' && !isNaN(value)) ? Number(value.toFixed(2)) : value}/>;
      case 'proportion':
        return readOnly ? `${(record.proportion * 100).toFixed(2)}%` :
          <InputNumber min={0}
                       className="expense-proportion-symbol"
                       precision={2}
                       max={100}
                       onChange={(value) => this.handleChangeProportion(value, index)}
                       step={0.01}
                       value={record.proportion * 100}
                       formatter={value => (typeof value === 'number' && !isNaN(value)) ? Number(value.toFixed(2)) : value}
          />;
      case 'personName':
        let user = [{
          fullName: record.personName,
          userOid: record.relevantPerson
        }];
        return (readOnly || !isEditable) ? user[0].fullName : <Chooser type="user"
                                                      value={user}
                                                      valueKey="userOid"
                                                      labelKey="fullName"
                                                      listExtraParams={{roleType: 'TENANT'}}
                                                      single
                                                      onChange={(value) => this.handleChangePerson(value, index)}/>
      case 'operate':
        let { expenseApportion } = this.state;
        return isEditable ? (
          <div>
            <a onClick={() => this.handleCopyExpenseApportion(record)}>{this.$t('common.copy')/*复制*/}</a>
            {expenseApportion.length > 1 && <a onClick={() => this.handleRemoveExpenseApportion(index)} style={{ marginLeft: 5 }}>{this.$t('common.delete')/*删除*/}</a>}
          </div>
        ) : (<div>
          {expenseApportion.length > 1 && <a onClick={() => this.handleRemoveExpenseApportion(index)}>{this.$t('common.delete')/*删除*/}</a>}
        </div>);
      default:
        return null;
    }
  };

  departmentCostCenterItem(record, index, constraint, costCenterIndex, isDepartment){
    const { profile, readOnly, expenseTypeId, user } = this.props;
    const { defaultExpenseApportion } = this.state;
    let isEditable = defaultExpenseApportion && defaultExpenseApportion.isEditable;
    let departmentItem,costCenterItems = null;
    if(isDepartment) {
      let departmentValue = {};
      record.costCenterItems.map(item => {
        if (item.costCenterOid === constraint.costCenterOid) {
          departmentValue = item;
        }
      })
      departmentValue.departmentOid = departmentValue.costCenterItemOid;
      departmentValue.name = departmentValue.costCenterItemName;
      departmentItem = (readOnly || !isEditable) ?
        <Input defaultValue={departmentValue.costCenterItemName ? departmentValue.costCenterItemName : ''} style={{borderLeft: '0px',width: '70%' }} disabled={true}/> :
        <Chooser type='department'
                 valueKey="departmentOid"
                 labelKey="name"
                 className='department-select'
                 single
                 showClear={true}
                 onChange={department => this.handleChangeCostCenter(department, index, costCenterIndex)}
                 value={departmentValue.costCenterItemOid ? [departmentValue] : []}
                 listExtraParams={{leafEnable: profile['department.leaf.selection.required']}}/>;
    } else {
      let chooserItem = JSON.parse(JSON.stringify(chooserData['expense_cost_center_item']));
      chooserItem.key = 'costCenterItemOid';
      chooserItem.url = `${config.baseUrl}/api/my/cost/center/items?costCenterOid=${constraint.costCenterOid}&expenseTypeId=${expenseTypeId}&userOid=${user.userOid}`;
      let value = {};
      record.costCenterItems.map(item => {
        if (item.costCenterOid === constraint.costCenterOid) {
          value = item;
        }
      })
      value.name = value.costCenterItemName;
      costCenterItems = (readOnly || !isEditable) ?
        <Input defaultValue={value.costCenterItemName ? value.costCenterItemName : ''} style={{borderLeft: '0px',width: '70%' }} disabled={true}/> :
        <Chooser selectorItem={chooserItem}
                 valueKey="costCenterItemOid"
                 labelKey="name"
                 single
                 showClear={true}
                 onChange={costCenterItem => this.handleChangeCostCenter(costCenterItem, index, costCenterIndex)}
                 value={value.costCenterItemOid ? [value] : []}/>;
    }
    return isDepartment ? departmentItem : costCenterItems;
  }

  handleNewExpenseApportion = () => {
    let { expenseApportion, defaultExpenseApportion } = this.state;
    let defaultExpense = JSON.parse(JSON.stringify(defaultExpenseApportion));
    defaultExpense.amount = 0;
    defaultExpense.proportion = 0;
    defaultExpense.defaultApportion = false;
    defaultExpense.costCenterItems.map(item => {
      item.costCenterItemOid = null;
      item.departmentOid = null;
      item.costCenterItemName = null;
    });
    defaultExpense.apportionmentOid = null;
    expenseApportion.push(defaultExpense);
    this.props.onChange(expenseApportion);
  };

  handleRemoveExpenseApportion = (index) => {
    let { expenseApportion } = this.state;
    if(index === 0){
      expenseApportion[1].defaultApportion = true;
      this.setState({ defaultExpenseApportion: expenseApportion[1] })
    }
    expenseApportion.splice(index, 1);
    this.props.onChange(expenseApportion);
  };

  handleCopyExpenseApportion = (record) => {
    let { expenseApportion } = this.state;
    let target = JSON.parse(JSON.stringify(record));
    target.amount = 0;
    target.proportion = 0;
    target.apportionmentOid = null;
    target.defaultApportion = false;
    target.apportionmentOid=null;
    expenseApportion.push(target);
    this.props.onChange(expenseApportion);
  };
  //导入成功回调
  handleImportOk = () => {
    this.showImport(false);
  };
  //导入分摊Modal控制
  showImport = (flag) => {
    this.setState({ showImportFrame: flag })
  };
  //切换上传模板上传模块
  switchUpload = () => {
    this.setState({
      tabKey: "UPDATE"
    }, this.setState({tabKey: null}))
  }
  //处理导入回调
  handelImportCallBack = (result) => {
    let resultData = {};
    if (result.success) {
      let { expenseApportion } = this.state;
      let {amount,invoiceOid} = this.props;
      if(result.result.length>0){
        result.result.map((item)=>{
          item.proportion=item.amount/amount;
          item.expenseOid=invoiceOid;
          expenseApportion.push(item);
        })
        this.props.onChange(expenseApportion);
      }
      let resultDom = (<div>{this.$t('importer.import.success', {total: result.result.length})/*导入成功：{total}条*/}</div>)
      resultData.resultDom = resultDom;
      resultData.result = true;
    }
    else {
      let errorColumns = [{
        title: this.$t('importer.line.number')/*行号*/,
        dataIndex: 'rowNum',
        width: '13%'
      }, {title: this.$t('importer.error.message')/*错误信息*/, dataIndex: 'errorMessage'}];
      let errorDom = (<div>
        <div>{this.$t('importer.import.allFail', {total: result.result.length})/*导入失败：{total}条*/}
          {(
            <a style={{fontSize: 14, marginLeft: 10}} onClick={()=>this.switchUpload(true)}>（{this.$t('importer.again.import')/*请修改相应数据后，重新导入*/}）</a>
          )}
        </div>
        <div>
          <Table rowKey={record => record.index}
                 columns={errorColumns}
                 dataSource={result.result}
                 pagination={false}
                 scroll={{x: false, y: 170}}
                 bordered
                 size="small"/>
        </div>
      </div>);
      resultData.resultDom = errorDom;
      resultData.result = false;
    }
    return resultData
  }
  handleHeightReady = (height, index) => {
    const heights = [...this.state.heights]
    heights.push({
      index,
      height
    })
    this.setState({
      heights
    }, this.VListRef.recomputeRowHeights(index))
  }
  render() {
    const { loading, columns, expenseApportion, defaultExpenseApportion, scrollX, showImportFrame,tabKey } = this.state;
    const { readOnly, expenseReportOid, expenseTypeId } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    let tableHeight = 400;
    let rowHeight = 38.5;
    if (expenseApportion && expenseApportion.length > 0) {
      let costCenterItems = expenseApportion[0].costCenterItems;
      if (costCenterItems && costCenterItems.length > 0) {
        rowHeight = costCenterItems.length * rowHeight;
      }
      tableHeight = (rowHeight + 16) * expenseApportion.length;
      tableHeight = tableHeight > 400 ? 400 : tableHeight
    }
    rowHeight += 16;
    const renderItem = ({index, key, style}) => {
      return (
        <div key={key} style={style}>
          <ReactHeight
            onHeightReady={height => {
              this.handleHeightReady(height, index)
            }}
          >
            <Table columns={columns}
                   dataSource={[expenseApportion[index]]}
                   bordered
                   showHeader={false}
                   size="small"
                   rowKey="index"
                   scroll={{x: scrollX, y: 380}}
                   pagination={false}/>
          </ReactHeight>
        </div>
      )
    }
    return (
      <div className="expense-apportion">
        <FormItem {...formItemLayout} label={this.$t('expense.apportion')/*费用分摊*/} style={{ marginBottom: 12 }}/>
        { loading ? <Spin/> : (
          <div>
            <div>
              <div className="expense-apportion-table-header">
                <Table columns={columns}
                       dataSource={[]}
                       bordered
                       size="small"
                       rowClassName={this.setClassName}
                       rowKey="index"
                       scroll={{x: scrollX, y: 0}}
                       pagination={false}/>
              </div>
              <div style={{height: tableHeight}}>
                <AutoSizer>
                  {({width, height}) => (
                    <VList
                      ref={ref => this.VListRef = ref}
                      width={width}
                      height={height}
                      overscanRowCount={10}
                      scrollToAlignment={'start'}
                      rowCount={expenseApportion.length}
                      rowHeight={rowHeight}
                      rowRenderer={renderItem}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
          {/*  <Table columns={columns}
                   dataSource={expenseApportion}
                   bordered
                   showHeader={false}
                   size="small"
                   rowKey="index"
                   scroll={{ x: scrollX, y: 400 }}
                   pagination={false}/>*/}
            {!readOnly && (defaultExpenseApportion && defaultExpenseApportion.isEditable) && <div style={{display:'flex'}}>
              <div className="new-expense-apportion" onClick={this.handleNewExpenseApportion}><Icon
                type="plus"/>{this.$t('expense.apportion.new')/*新建分摊*/}</div>
              <div className="new-expense-apportion" onClick={()=>this.showImport(true)}><Icon
                type="plus"/>{this.$t('expense.apportion.import')/*导入分摊*/}</div>
            </div>}
          </div>
        )}
        <Importer visible={showImportFrame}
                  templateUrl={`${config.baseUrl}/api/apportion/template?expenseReportOid=${expenseReportOid}`}
                  uploadUrl={`${config.baseUrl}/api/apportion/import?expenseReportOid=${expenseReportOid}&expenseTypeID=${expenseTypeId}`}
                  accept={'.csv'}
                  downFileExtension={'.csv'}
                  isImporterResultDom={true}
                  tabKey={tabKey}
                  downFileName={this.$t('expense.apportion.templateFileName')/*分摊模板文件*/}
                  callBackResult={(result)=>this.handelImportCallBack(result)}
                  fileName={this.$t('expense.apportion.csvSheet')/*CSV电子表格*/}
                  onOk={this.handleImportOk}
                  afterClose={() => this.showImport(false)}/>
      </div>
    )
  }

}

ExpenseApportion.propTypes = {
  value: PropTypes.array,
  amount: PropTypes.number,
  expenseReportOid: PropTypes.string,
  expenseTypeId: PropTypes.any,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  amountIsNegativeNumber: PropTypes.bool,//分摊金额是否为负数模式
  costCenterItemsApportion: PropTypes.array,
  userOid: PropTypes.string
};

ExpenseApportion.defaultProps = {
  costCenterItemsApportion: []
};

function mapStateToProps(state) {
  return {
    company: state.user.company,
    profile: state.user.profile,
    user: state.user.currentUser,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseApportion);
