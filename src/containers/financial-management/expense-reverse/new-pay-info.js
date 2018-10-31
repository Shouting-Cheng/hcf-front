/**
 * Created by Allen on 2018/5/17.
 */
/**
 * Created by Allen on 2018/5/9.
 */
import React from 'react';
import { connect } from 'dva';
import { Table, Button, message, Alert, Popover, InputNumber, Tag, Row, Col, Divider } from 'antd';
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'


class NewPayInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],   //表格数据
      selectedRowKeys: [],  //选中的项
      changeList: [],  //改变过值的数组
      selectList: [],  //选中的数组
      lineDtos: [],
      loading: false,
      addLoading: false,
      amount: 0,
      page: 0,
      pageSize: 5,
      pagination: {
        total: 0
      },
      columns: [  //收款对象
        {title: this.$t('exp.receivables'), dataIndex: 'partnerName', width: 100,
          render: (value,record) => {
            return (<div>
              <Tag color="#000">{record.payeeCategory == "EMPLOYEE" ? this.$t('acp.employee'/*员工*/) : this.$t('acp.vendor'/*供应商*/)}</Tag>
              <div style={{ whiteSpace: "normal" }}>{record.partnerName}</div>
            </div>)
          }
        },
        {title: this.$t('acp.accountName'), dataIndex: 'accountNumber',
          render: (value,record) => {
            return (
              <Popover content={<div>
                <div>{this.$t('acp.account.name')}：{record.accountName}</div>
                <div>{this.$t('acp.account')}：{record.accountNumber}</div>
              </div>}>
                <div >
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t('acp.account.name')}：{record.accountName}</div>
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t('acp.account')}：{record.accountNumber}</div>
                </div>
              </Popover>
            )
          }
        },
        {title: this.$t('acp.transaction.name'), dataIndex: 'cshTransactionClassName', width: 90,
          render: desc =>
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
        },
        {title: this.$t('pay.workbench.amount'), dataIndex: 'amount', width: 90,
          render: (value,record) =>
            <span>
              <Popover content={<span>{record.currency}{record.amount}</span>}>
                {record.amount ? <span>{record.currency}{record.amount}</span> : '-'}
              </Popover>
            </span>
        },  //可调整金额
        {title: this.$t('exp.can.adjust.amount'), dataIndex: 'ableReservedAmount', width: 110,
          render: (value,record) =>
            <span>
              <Popover content={<span>{record.currency}{record.ableReservedAmount}</span>}>
                {record.ableReservedAmount ? <span>{record.currency}{record.ableReservedAmount}</span> : '-'}
              </Popover>
            </span>
        },  //调整金额
        {title: this.$t('exp.adjust.amount'), dataIndex: 'adjustAmount',
          render: (value,record,index) => {
            return (
              <InputNumber defaultValue={record.adjustAmount ? record.adjustAmount : record.ableReservedAmount}
                           onChange={value => this.changeAdjustAmount(value,index,record)}
                           formatter={value => `-${value}`}
                           parser={value => value.replace('-', '')}
                           max={record.ableReservedAmount}
                           min={0}
              />
            )
          }
        }
      ]
    }
  }

  componentDidMount(){
    if (!this.props.params.lineFlag){
      this.setState({selectedRowKeys: [], changeList: [], amount: 0, selectList: [],page: 0})
    }

    if (this.props.params.lineFlag && this.props.params.reverseId && this.props.params.listType === 'unpaidLine'){
      this.setState({
        reverseId: this.props.params.reverseId,
        selectedRowKeys: []
      },() => {
        this.getUpaidLineList()
      })
    }
  }

  componentWillReceiveProps(nextProps){
    if (!nextProps.params.lineFlag){
      this.setState({selectedRowKeys: [], changeList: [], amount: 0, selectList: [],page: 0})
    }

    if (nextProps.params.lineFlag && nextProps.params.reverseId && nextProps.params.listType === 'unpaidLine'){
      this.setState({
        reverseId: nextProps.params.reverseId,
        selectedRowKeys: []
      },() => {
        this.getUpaidLineList()
      })
    }
  }

  getUpaidLineList(){
    const { page, pageSize, reverseId, changeList } = this.state;
    this.setState({loading: true});
    reverseService.getUpaidLineList(reverseId,page,pageSize).then(resp => {
      if (resp.status === 200){
        let data = resp.data;
        data.map(item =>{
          let target = changeList.find(o => o.id === item.id);
          if (target){
            item.adjustAmount = target.adjustAmount;
          }
        });
        this.setState({
          loading: false,
          data: data,
          pagination: {
            current: this.state.page + 1,
            pageSize: 5,
            total: Number(resp.headers['x-total-count']),
            onChange: this.onChangePager
          }
        })
      }
    }).catch((e) => {
      this.setState({loading: false});
      message.error(e.response.data ? e.response.data.message : this.$t('exp.get.unPay.failed'));
    })
  }

  //输入框改变调整金额
  changeAdjustAmount = (value,index) => {
    let data = this.state.data;
    data[index].adjustAmount = value;
    let changeList = this.state.changeList;
    let target = changeList.find(item => data[index].id === item.id);
    if (target){
      target.adjustAmount = value
    } else {
      changeList.push(data[index])
    }
    this.setState({data,changeList})
  };

  onSelectAllChange = (selected, selectedRows, changeRows) => {
    let { selectList, amount, selectedRowKeys } = this.state;
    if(selected) {
      selectedRowKeys =  selectedRowKeys.concat(changeRows.map(o=>{
        amount += o.amount;
        return o.id;
      }));
      selectList = selectList.concat(changeRows.map(o => {
        return o;
      }))
    } else {
      changeRows.map(o => {
        selectedRowKeys.splice(selectedRowKeys.findIndex(item => item === o.id),1);
        selectList.splice(selectList.findIndex(item => item ===o),1);
        amount -= o.amount;
      })
    }
    this.setState({selectedRowKeys, amount, selectList});
  };

  onSelectChange = (record, selected, selectedRows) => {
    const { data } = this.state;
    let { selectList, amount, selectedRowKeys } = this.state;
    if(selected) {
      selectedRowKeys.push(record.id);
      selectList.push(record);
      amount += record.amount;
    }
    else {
      selectedRowKeys.splice(selectedRowKeys.findIndex(o=>o === record.id),1);
      selectList.splice(selectList.findIndex(o=>o.id === record.id),1);
      amount -= record.amount;
    }
    this.setState({selectedRowKeys,selectList, amount});
  };

  //新建保存
  handleSave = () => {
    const { selectedRowKeys, data, reverseId, selectList } = this.state;
    let paramsArray = [];
    if (selectedRowKeys.length === 0){
      message.error(this.$t('exp.add.tips')); //请选择添加项
      return false;
    }
    selectList.map(item => {
      paramsArray.push({
        tenantId: this.props.user.tenantId,
        setOfBooksId: this.props.company.setOfBooksId,
        expReverseHeaderId: reverseId,
        currencyCode: item.currency,
        rate: item.exchangeRate,
        amount: item.amount,
        functionAmount: item.exchangeRate * item.amount,
        companyId: item.paymentCompanyId,
        description:"1111111111",
        sourceTransactionDateId: item.id,
        adjustAmount: -(item.adjustAmount ? item.adjustAmount : item.ableReservedAmount)
      })
    });
    let params  = paramsArray;
    this.setState({addLoading: true});
    reverseService.createPayLine(params).then(resp => {
      if (resp.status === 200){
        this.setState({addLoading: false});
        message.success(this.$t('common.save.success',{name:''}));
        this.props.onClose(true)
      }
    }).catch(e => {
      this.setState({addLoading: false});
      message.error(e.response.data ? e.response.data.message : this.$t('wait.for.save.addFail'));
    })
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getUpaidLineList()
      })
    }
  };

  onCancel = () => {
    this.props.onClose();
  };

  expandedRowRender = (record) => {
    const { expensePaymentScheduleDTO, frozenFlag } = record;
    let contractHeaderLineDTO = null;
    contractHeaderLineDTO = expensePaymentScheduleDTO.contractHeaderLineDTO ? expensePaymentScheduleDTO.contractHeaderLineDTO : {};
    return (
      <div>
        <Row>
          <Col style={{ textAlign: "right" }} span={2}>
            <span>{this.$t('exp.isDelay')}</span>
          </Col>
          <Col span={20} offset={1}>
            {this.$t(frozenFlag ? 'exp.delay' : 'exp.unDelay')}
          </Col>
        </Row>
        <Divider/>
        {contractHeaderLineDTO.lineNumber && <Row>
          <Col style={{ textAlign: "right" }} span={2}>
            <span>{this.$t('acp.relation.contract')}:</span>
          </Col>
          <Col span={20} offset={1}>
            <span>{this.$t('exp.contract.number')}：</span>
            <a onClick={() => { this.toContract(contractHeaderLineDTO.headerId) }} style={{ marginRight: 20 }}>{contractHeaderLineDTO.contractNumber ? contractHeaderLineDTO.contractNumber : "_"}</a>
            <span>this.$t('importer.line.number')：</span>
            <span style={{ marginRight: 20 }}>{contractHeaderLineDTO.lineNumber ? contractHeaderLineDTO.lineNumber : "_"}</span>
            <span>{this.$t('my.contract.name')}：</span>
            <span style={{ marginRight: 20 }}>{contractHeaderLineDTO.contractName ? contractHeaderLineDTO.contractName : "_"}</span>
            <span>{this.$t('common.amount')}：</span>
            <span>{contractHeaderLineDTO.lineAmount ? contractHeaderLineDTO.lineAmount : "_"}</span>
          </Col>
        </Row>}
      </div>
    )
  };

  render() {
    const { columns, data, loading, selectedRowKeys, amount, addLoading, pagination } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onSelect: this.onSelectChange,
      onSelectAll: this.onSelectAllChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div className="container reimburse">
        <div className="table-header" style={{display: 'inline-flex',margin: '0 0 16px'}}>
          <p style={{}}>{this.$t('common.total1',{total: pagination.total})}，</p>
          { hasSelected &&
          <Alert type="info" showIcon
                 message={<div>
                   {this.$t('org.has-select')} &nbsp;&nbsp; <span style={{color: '#1890ff'}}>{selectedRowKeys.length}</span>&nbsp;{this.$t('exp.number.expense')},{this.$t('request.detail.total.amount')}&nbsp;&nbsp;<span style={{color: '#1890ff'}}>{amount}</span>
                 </div>}
          />
          }
        </div>
        <Table dataSource={data}
               loading={loading}
               columns={columns}
               pagination={pagination}
               rowKey={record => record.id }
               rowSelection={rowSelection}
               expandedRowRender={this.expandedRowRender}
        />
        <div className="slide-footer">
          <Button type="primary" htmlType="submit" onClick={this.handleSave} loading={addLoading}>
            {this.$t('common.add')}</Button>
          <Button onClick={this.onCancel}>{this.$t('common.cancel')}</Button>
        </div>
      </div>
    )
  }
}
// NewPayInfo.contextTypes = {
//   router: React.PropTypes.object
// };


function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(NewPayInfo);
