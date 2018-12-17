/**
 * Created by Allen on 2018/5/16.
 */
import React from 'react';
import { connect } from 'dva';
import { Tag, Divider, Button, Row, Col, Spin,  Modal, message, Popover, Popconfirm, Input, InputNumber } from 'antd'
import Table from 'widget/table'
import SearchArea from 'components/Widget/search-area';
import 'styles/reimburse/reimburse.scss';
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
import moment from "moment"
import config from "config";

class UnpaidReverseInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],  //选中的项
      columns: [
        { title: this.$t({ id: "common.sequence" }/*序号*/), align: "center", dataIndex: "index", key: "index", width: 60,
          render: (value, record, index) => index + 1
        },
        {   //反冲付款金额
          title: this.$t({id:'exp.reserve.pay.amount'}), dataIndex: 'adjustAmount', width: 110, align: 'center',
          render: this.filterMoney
        },       //"收款对象"
        { title: this.$t({id:'exp.receivables'}), align: "center", dataIndex: "partnerCode",
          render: (value,record) => {
            return (<div>
              <Tag color="#000">{record.dataDTO.partnerCategoryName}</Tag>
              <div style={{ whiteSpace: "normal" }}>
                {record.dataDTO.partnerName}-{record.dataDTO.partnerCode}
              </div>
            </div>)
          }
        },
        {       //收款账户
          title: this.$t({id:'acp.accountName'}), dataIndex: 'accountNumber',width: 300,
          render: (value,record) => {
            return (
              <Popover content={<div>
                <div>{this.$t({ id: "acp.account" }/*账户：*/)}：{record.dataDTO ? record.dataDTO.accountName : '-'}</div>
                <div>{this.$t({ id: "acp.account.name" }/*户名*/)}：{record.dataDTO ? record.dataDTO.accountNumber: '-'}</div>
              </div>}>
                <div >
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t({ id: "acp.account" }/*账户：*/)}：{record.dataDTO ? record.dataDTO.accountName : '-'}</div>
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t({ id: "acp.account.name" }/*户名*/)}：{record.dataDTO ? record.dataDTO.accountNumber: '-'}</div>
                </div>
              </Popover>
            )
          }
        },
        {      //付款属性
          title: this.$t({id:'exp.pay.attribute'}), dataIndex: 'payAttr', width: 200,
          render: (value, record) => {
            return (
              <Popover content={<div>
                <div>{this.$t({ id: 'adjust.authority.set' }/*付款方式类型*/)}：{record.dataDTO ? record.dataDTO.paymentMethodCategoryName : '-'}</div>
                <div>{this.$t({ id: "acp.cshTransactionClassName" }/*付款用途*/)}：{record.dataDTO ? record.dataDTO.cshTransactionClassName: '-'}</div>
              </div>}>
                <div>
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t({ id: 'adjust.authority.set' }/*付款方式类型*/)}：{record.dataDTO ? record.dataDTO.paymentMethodCategoryName : '-'}</div>
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t({ id: "acp.cshTransactionClassName" }/*付款用途*/)}：{record.dataDTO ? record.dataDTO.cshTransactionClassName: '-'}</div>
                </div>
              </Popover>
            )
          }
        },
        {
          title: this.$t({id:'common.comment'}), dataIndex: 'description',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          title: this.$t({id:'common.operation'}), dataIndex: "id", key: "id", width: 100, align: "center", render: (value, record) => {
          return (
            <div>
              <a onClick={() => { this.handleEdit(record) }}>{this.$t({id:'common.edit'})}</a>
              <Divider type="vertical"></Divider>
              <Popconfirm placement="top" title={this.$t({id:'configuration.detail.tip.delete'})} onConfirm={() => { this.handleDelete(record) }} okText={this.$t({id:'common.ok'})} cancelText={this.$t({id:'common.cancel'})}>
                <a>{this.$t({id:'common.delete'})}</a>
              </Popconfirm>
            </div>
          )
        }
        }
      ],
      searchForm: [
        {
          type: 'items',
          id: 'partner',
          colSpan: '6',
          items: [
            {type: 'value_list', id: 'partnerCategory', label: this.$t({id: "pay.workbench.type"}/*类型*/), valueListCode: 2107, options: [], event: 'code'},
            {type: 'list', id: 'partnerId', label: this.$t({id: "my.receivable"}/*收款方*/), options: [], listType: 'bgtUser', single: true,event: 'PARTNER',
              method: 'get', listExtraParams: {setOfBooksId: this.props.company.setOfBooksId}, valueKey: 'id',labelKey: "id", disabled: true,
              getUrl: `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName?&page=0&size=9999&name=&empFlag=1002`},
          ]
        },
        {
          type: 'items',
          id: 'amountRange',
          colSpan: '6',
          items: [
            { type: 'input', id: 'amountFrom', label: this.$t({id: "pay.refund.amountFrom"}/*金额从*/) },
            { type: 'input', id: 'amountTo', label: this.$t({id: "pay.refund.amountTo"}/*金额至*/) }
          ],
        },
      ],
      modalColumns: [ //收款对象
        {title: this.$t({id:'exp.receivables'}), dataIndex: 'partnerName', width: 160, align: 'center',
          render: (value,record) => {
            return (<div>
              <Tag color="#000">{record.partnerCategoryName}</Tag>
              <div style={{ whiteSpace: "normal" }}>{record.partnerName}</div>
            </div>)
          }
        },   //付款用途
        {title: this.$t({id:"acp.transaction.name"}/*付款用途：*/), dataIndex: 'cshTransactionClassName', width: 110,align:'center',
          render: desc =>
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
        },
        {       //原付款行备注
          title: this.$t({id:'exp.pay.line.remark'}), dataIndex: 'expensePaymentScheduleDTO.description',align:'center',
          render:desc =>
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
        },   //可反冲金额
        {title: this.$t({id:'exp.reserve.money'}), dataIndex: 'ableReservedAmount', width: 110,align:'center',
          render: this.filterMoney
        },    //反冲金额
        {title: this.$t({id:'expense.reverse.amount'}), dataIndex: 'adjustAmount', width: 100,align:'center',
          render: (value,record,index) => {
            return (
              <InputNumber defaultValue={record.adjustAmount ? record.adjustAmount : ''}
                           onChange={value => this.changeAdjustAmount(value, index, record)}
                           onBlur={e => this.onBlur(e,index,record)}
                           formatter={value => `-${value}`}
                           parser={value => value.replace('-', '')}
                           max={record.ableReservedAmount}
                           min={0}

              />
            )
          }
        },
        {    //反冲备注
          title: this.$t({id:'exp.reserve.remark'}), dataIndex: 'description', align:'center',
          render: (value,record,index) => {
            return (
              <Input defaultValue={record.description ? record.description : ''}
                     onChange={e => this.changeRemark(e, index, record)}></Input>
            )
          }
        }
      ],
      data: [],
      loading: false,
      payDataLoading: false,
      searchParams: {},
      pagination: {},
      linePagination: {},
      linePage: 0,
      linePageSize: 5,
      page: 0,
      pageSize: 10,
      headerData: {},
      changeList: [],  //改变过值的数组
      amountData: {
        amountMap: [],
        taxAmountMap: []
      },
      visible: false,
      model: {},
      flag: true,
      record: {},
      totalAmount: 0,  //反冲付款总金额
      partnerId: undefined,
    };
  }

  componentDidMount(){
    if (this.state.flag != this.props.flag) {
      const { columns }=this.state;
      if(this.props.headerData.reverseHeader.status===1002)
        columns.splice(-1,1);
      this.setState({ columns,flag: this.props.flag,id: this.props.id, page: 0, changeList: [] }, () => {
        this.getList() ;
      });
    }

    if (this.props.disabled && this.state.columns.length === 9) {
      let columns = this.state.columns;
      columns.splice(columns.length - 1, 1);
      this.setState({ columns });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.flag != nextProps.flag) {
      const { columns }=this.state;
      if(nextProps.headerData.reverseHeader.status===1002)
        columns.splice(-1,1);
      this.setState({ columns,flag: nextProps.flag,id: nextProps.id, page: 0, changeList: [] }, () => {
        this.getList() ;
      });
    }

    if (nextProps.disabled && this.state.columns.length === 9) {
      let columns = this.state.columns;
      columns.splice(columns.length - 1, 1);
      this.setState({ columns });
    }
  }

  //编辑
  handleEdit = (record) => {
    this.props.editUnpaidInfo && this.props.editUnpaidInfo(record);
  };

  //删除费用反冲支付行
  handleDelete = (record) => {
    reverseService.deletePayLine(record.id).then(resp => {
      if (resp.status === 200){
        message.success('删除成功');
        this.getList() ;
      }
    }).catch(e => {
      message.error(e.response.data ? e.response.data.message : '删除失败')
    })
  };

  //获取数据列表
  getList = () => {
    const { id, page, pageSize } = this.state;
    this.setState({ loading: true });
    reverseService.getReversePayLine(id,page,pageSize).then(resp => {
      if (resp.status === 200){
        this.setState({
          data: resp.data,
          totalAmount: resp.headers['amount-info'],
          loading: false,
          pagination: {
            showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total }),
            showSizeChanger: true,
            showQuickJumper: true,
            pageSize: 5,
            current: this.state.page + 1,
            total: Number(resp.headers['x-total-count']),
            onChange: this.onChangePager,
            pageSizeOptions: ['5','10', '20', '30', '40'],
          }
        })
      }
    }).catch(e => {
      this.setState({loading: false});
      message.error(e.response.data.message)
    })
  };

  eventHandle = (type, value) => {
    let searchForm = this.state.searchForm;
    let partnerId = this.state.partnerId;
    if (type === 'code') {
      this.formRef.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
      searchForm.map(row => {
        if (row.id === 'partner') {
          row.items.map(item => {
            if (item.id === 'partnerId') {
              item.disabled = false;
              if (value) {
                if (value === 'EMPLOYEE') { //员工
                  item.type = 'list';
                  item.labelKey = 'fullName';
                  partnerId = undefined;
                  this.formRef.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
                } else if (value === 'VENDER') { //供应商
                  item.type = 'select';
                  item.labelKey = 'name';
                  partnerId = undefined;
                  this.formRef.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
                  // this.formRef._reactInternalInstance._renderedComponent._instance.setValues({ partnerId: '' })
                }
              }
              else {
                item.disabled = true;
                item.type === 'list' && this.formRef.setValues({ partnerId: [] });
                item.type === 'select' && this.formRef.setValues({ partnerId: '' })
              }
            }
          })
        }
      });
    }
    if (type === 'PARTNER'){
      searchForm.map(item=>{
        if(item.id === 'partner'&& item.items[1].type === 'select'){
          partnerId = value;
        }
      });
    }
    this.setState({ searchForm:searchForm,partnerId })
  };

  getUpaidLineList(){
    const { linePage, linePageSize, id, changeList, searchParams } = this.state;
    this.setState({ payDataLoading: true });
    let params = {
      id: id,
      page: linePage,
      size: linePageSize,
      ...searchParams
    };
    reverseService.getUpaidLineList(params).then(resp => {
      if (resp.status === 200){
        let lineData = resp.data;
        lineData.map(item =>{
          let target = changeList.find(o => o.id === item.id);
          if (target){
            item.adjustAmount = target.adjustAmount;
            item.description = target.description;
          }
        });
        this.setState({
          payDataLoading: false,
          lineData: lineData,
          linePagination: {
            current: this.state.linePage + 1,
            pageSize: 5,
            total: Number(resp.headers['x-total-count']),
            onChange: this.onChangeLinePager
          }
        })
      }
    }).catch((e) => {
      this.setState({payDataLoading: false});
      message.error(e.response.data ? e.response.data.message : this.$t({id:'exp.get.unPay.failed'}));
    })
  }

  onChangePager = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList()
      })
    }
  };

  onChangeLinePager = (page) => {
    if (page - 1 !== this.state.linePage) {
      this.setState({ linePage: page - 1 }, () => {
        this.getUpaidLineList()
      })
    }
  };

  addItem = () => {
    this.setState({
      newPayVisible: true,
      changeList: []
    }, () => {
      this.getUpaidLineList();
    })
  };

  handleSearch = (result) => {
    if(!!this.state.partnerId){
      result.partnerId=this.state.partnerId;
    }else {
      result.partnerId && result.partnerId.length>0 && (result.partnerId = result.partnerId[0].id)
    }
    this.setState({
      page: 0,
      searchParams: result
    }, () => {
      this.getUpaidLineList();
    })
  };

  handleClear = () => {
    this.eventHandle('code', null);
    this.setState({
      partnerId: undefined,
      searchParams: {}
    })
  };

  //输入框改变调整金额
  changeAdjustAmount = (value, index) => {
    let lineData = this.state.lineData;
    lineData[index].adjustAmount = value;
    let changeList = this.state.changeList;
    let target = changeList.find(item => lineData[index].id === item.id);
    if (target) {
      target.adjustAmount = value;
    } else {
      changeList.push(lineData[index])
    }
    this.setState({ lineData, changeList })
  };

  changeRemark = (e, index) => {
    let lineData = this.state.lineData;
    lineData[index].description = e.target.value;
    this.setState({lineData})
  };

  onBlur(e,index,record){
    let changeList = this.state.changeList;
    if (!record.adjustAmount) {
      changeList.splice(index,1)
    }
    this.setState({ changeList });
  };

  handleSave = () => {
    const {changeList, id } = this.state;
    let paramsArray = [];
    if (changeList.length === 0) {
      message.error(this.$t({id:'exp.add.pay.line.tips'}));  //请填写所要添加付款行的反冲金额
      return false;
    }
    changeList.map(item => {
      paramsArray.push({
        tenantId: this.props.user.tenantId,
        setOfBooksId: this.props.company.setOfBooksId,
        expReverseHeaderId: id,
        currencyCode: item.currency,
        rate: item.exchangeRate,
        amount: item.amount,
        functionAmount: item.exchangeRate * item.amount,
        companyId: item.paymentCompanyId,
        description: item.description,
        sourceTransactionDateId: item.id,
        adjustAmount: -(item.adjustAmount ? item.adjustAmount : item.ableReservedAmount)
      })
    });
    let params = paramsArray;
    this.setState({saveLoading: true});
    reverseService.createPayLine(params).then(resp => {
      if (resp.status === 200){
        message.success(this.$t({id:'common.save.success'},{name:''}));
        this.setState({saveLoading: false, newPayVisible: false, lineData: [], changeList: [], linePage: 0});
        this.getList();
      }
    }).catch(e => {
      this.setState({saveLoading: false});
      message.error(e.response.data ? e.response.data.message : this.$t({id:'wait.for.save.addFail'}));
    })
  };

  handleBack = () => {
    this.setState({
      newPayVisible: false,
      changeList: [],
      lineData: [],
      linePage: 0
    },()=>{
      this.handleClear();
      this.formRef.handleReset();
    })
  };

  expandedRowRender = (record) => {
    let { contractHeaderLineDTO, schedulePaymentDate } = record.dataDTO.expensePaymentScheduleDTO;
    contractHeaderLineDTO = contractHeaderLineDTO ? contractHeaderLineDTO : {};
    return (
      <div>
        {contractHeaderLineDTO.lineNumber && (<div>
          <Row>
            <Col style={{ textAlign: "right" }} span={2}>
              <span>{this.$t({id:"acp.relation.contract"}/*关联合同：*/)}</span>
            </Col>
            <Col span={20} offset={1}>
              <span>{this.$t({ id: "my.contract.name" }/*合同名称*/)}：</span>
              <span style={{ marginRight: 20 }}>{contractHeaderLineDTO.contractName ? contractHeaderLineDTO.contractName : "_"}</span>
              <span>{this.$t({ id: "my.contract.number" }/*合同编号*/)}：</span>
              <a onClick={() => { this.toContract(contractHeaderLineDTO.headerId) }} style={{ marginRight: 20 }}>{contractHeaderLineDTO.contractNumber ? contractHeaderLineDTO.contractNumber : "_"}</a>
              <span>{this.$t({id:'importer.line.number'})}：</span>
              <span style={{ marginRight: 20 }}>{contractHeaderLineDTO.lineNumber ? contractHeaderLineDTO.lineNumber : "_"}</span>
              <span>{this.$t({ id: "my.contract.plan.pay.date" }/*计划付款日期*/)}：</span>
              <span>{schedulePaymentDate ? moment(schedulePaymentDate).format('YYYY-MM-DD') : "-"}</span>
            </Col>
          </Row>
          <Divider />
        </div>)
        }
        <Row>
          <Col style={{ textAlign: "right" }} span={2}>
            <span>{this.$t({id:'exp.old.pay.line'})}</span>
          </Col>
          <Col span={20} offset={1}>
            <span style={{ marginRight: 30 }}>{this.$t({id: record.frozenFlag ? 'exp.delay.pay' : 'exp.unDelay.pay'})}</span>
            <span>{this.$t({id:'common.total.amount'})}：</span>
            <span style={{ marginRight: 30 }}>{record.dataDTO.amount.toFixed(2)}</span>
            <span>{this.$t({id:'acp.payment.amount'})}：</span>
            <span style={{ marginRight: 30 }}>{record.dataDTO.paidAmount.toFixed(2)}</span>
            <span>{this.$t({id:'acp.return.amount'})}：</span>
            <span style={{ marginRight: 30 }}>{record.dataDTO.returnAmount.toFixed(2)}</span>
            <span>{this.$t({id:'exp.check.amount.total'})}：</span>
            <span style={{ marginRight: 30 }}>{record.dataDTO.writeOffTotalAmount.toFixed(2)}</span>
          </Col>
        </Row>
      </div>
    )
  };

  lineExpandedRowRender = (record) => {
    let { contractHeaderLineDTO } = record.expensePaymentScheduleDTO;
    return (
      <div>
        <Row>
          <Col style={{ textAlign: 'right' }} span={2}>
            <span>{this.$t({id:'acp.accountName'})}</span>
          </Col>
          <Col span={20} offset={1}>
            <span>{this.$t({ id: "acp.account.name" }/*户名*/)}：</span>
            <span style={{ marginRight: 30 }}>{record.accountName}</span>
            <span>{this.$t({ id: "acp.account" }/*账户：*/)}：</span>
            <span style={{ marginRight: 30 }}>{record.accountNumber}</span>
          </Col>
        </Row>
        <Divider />
        {contractHeaderLineDTO.lineNumber && (<div>
          <Row>
            <Col style={{ textAlign: "right" }} span={2}>
              <span>{this.$t({id:"acp.relation.contract"}/*关联合同：*/)}</span>
            </Col>
            <Col span={20} offset={1}>
              <span>{this.$t({ id: "my.contract.name" }/*合同名称*/)}：</span>
              <span style={{ marginRight: 30 }}>{contractHeaderLineDTO.contractName ? contractHeaderLineDTO.contractName : "_"}</span>
              <span>{this.$t({ id: "my.contract.number" }/*合同编号*/)}：</span>
              <a onClick={() => { this.toContract(contractHeaderLineDTO.headerId) }} style={{ marginRight: 30 }}>{contractHeaderLineDTO.contractNumber ? contractHeaderLineDTO.contractNumber : "_"}</a>
              <span>{this.$t({id:'exp.plane.pay.line.num'})}：</span>
              <span style={{ marginRight: 30 }}>{contractHeaderLineDTO.lineNumber ? contractHeaderLineDTO.lineNumber : "_"}</span>
            </Col>
          </Row>
          <Divider />
        </div>)
        }
        <Row>
          <Col style={{ textAlign: "right" }} span={2}>
            <span>{this.$t({id:'exp.pay.delay'})}</span>
          </Col>
          <Col span={20} offset={1}>
            <span>{this.$t({id: "common.total.amount"}/* 总金额*/)}：</span>
            <span style={{ marginRight: 30 }}>{record.amount}</span>
            <span>{this.$t({ id: 'acp.payment.amount' }/*已付款总金额*/)}：</span>
            <span style={{ marginRight: 30 }}>{record.paidAmount}</span>
            <span>{this.$t({ id: 'acp.return.amount' }/*退款总金额*/)}：</span>
            <span style={{ marginRight: 30 }}>{record.returnAmount}</span>
            <span>{this.$t({id:'exp.check.amount.total'})}：</span>
            <span style={{ marginRight: 30 }}>{record.writeOffTotalAmount}</span>
          </Col>
        </Row>
      </div>
    )
  };

  onSelectChange = (selectedRowKeys) => {
    const { lineData } = this.state;
    let amount = 0;
    let lineDtos = [];
    selectedRowKeys.map(selectItem => {
      lineData.map(item => {
        if (item.id === selectItem){
          amount += item.actualAmount ;
          if (item.digitalInvoice && item.digitalInvoice.invoiceTypeNo === '01'){
            lineDtos.push({id: selectItem, invoiceOperationType: 'DELETE'})
          } else{
            lineDtos.push({id: selectItem, invoiceOperationType: 'NO_TICKET'})
          }
        }
      })
    });
    this.setState({ lineDtos, amount, selectedRowKeys });
  };


  render() {
    const { loading, data, columns, pagination, newPayVisible, saveLoading, searchForm, modalColumns, lineData, payDataLoading, linePagination, totalAmount,selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className="tab-container reimburse-container">
        <h3 style={{ padding: "0 0 10px", margin: 0 }} className="sub-header-title">{this.$t({id:'exp.unPay.reserve.info'})}</h3>
        <Row gutter={24} className="table-header">
          <Col span={18} className="table-header-buttons">
            {!this.props.disabled && <Button type="primary" onClick={this.addItem}>{this.$t({id:'exp.add.pay'})}</Button>}
          </Col>
          <Col span={6} style={{textAlign: 'right',paddingRight: 0, paddingTop: 15}}>
            <span>{this.$t({id:'exp.reserve.pay.total'})} <span style={{color:"green"}}>{totalAmount}</span></span>
          </Col>
        </Row>
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={data}
               loading={loading}
               scroll={{x: true, y: false}}
               pagination={pagination}
               expandedRowRender={this.expandedRowRender}
               size="middle" />

        <Modal visible={newPayVisible} title={this.$t({id:'exp.add.reserve.pay.info'})} onOk={this.handleSave}
               onCancel={this.handleBack}
               footer={[
                 <Button key="submit" type="primary"
                         loading={saveLoading} style={{ margin: '0 20px' }} onClick={this.handleSave}>
                   {this.$t({id: 'common.ok'}/*确定*/)}
                 </Button>,
                 <Button key="back"
                         onClick={this.handleBack}>
                   {this.$t({id: 'common.back'}/*返回*/)}
                 </Button>
               ]}
               width="70%">
          <SearchArea
            searchForm={searchForm}
            submitHandle={this.handleSearch}
            clearHandle={this.handleClear}
            maxLength={4}
            eventHandle={this.eventHandle}
            wrappedComponentRef={(inst) => this.formRef = inst} />
          <div className="table-header">
            <div className="table-header-title">
              {this.$t({id: "common.total"}, {total: linePagination.total})}{/* 共 total 条数据 */}
              &nbsp;<span>/</span>&nbsp;
              {this.$t({id: "common.total.selected"}, {total: selectedRowKeys.length === 0 ? '0' : selectedRowKeys.length})}{/* 已选 total 条 */}
            </div>
          </div>
          <Table rowKey={record => record.id}
                 columns={modalColumns}
                 dataSource={lineData}
                 loading={payDataLoading}
                 scroll={{ x: true, y: false }}
                 bordered
                 pagination={linePagination}
                 expandedRowRender={this.lineExpandedRowRender}
                 size="middle" />
        </Modal>

      </div>
    )
  }
}

// UnpaidReverseInfo.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(UnpaidReverseInfo);
