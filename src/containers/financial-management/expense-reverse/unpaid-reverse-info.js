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
        { title: this.$t('common.sequence'), align: "center", dataIndex: "index", key: "index", width: 60,
        render: (value, record, index) => index + 1
        },
        {   //反冲付款金额
          title: this.$t({id:'exp.reserve.pay.amount'}), dataIndex: 'adjustAmount', width: 110, align: 'center',
          render: this.filterMoney
        },  //收款对象
        { title: this.$t('exp.receivables'), align: "center", dataIndex: "partnerCode",
          render: (value,record) => {
            return (<div>
              <Tag color="#000">{record.dataDTO.partnerCategoryName}</Tag>
              <div style={{ whiteSpace: "normal" }}>
                {record.dataDTO.partnerName}-{record.dataDTO.partnerCode}
              </div>
            </div>)
          }
        },
        {   //收款账户
          title: this.$t('acp.accountName'), dataIndex: 'accountNumber',
          render: (value,record) => {
            return (
              <Popover content={<div>
                <div>{this.$t('acp.account.name')}：{record.dataDTO ? record.dataDTO.accountName : '-'}</div>
                <div>{this.$t('acp.account')}：{record.dataDTO ? record.dataDTO.accountNumber: '-'}</div>
              </div>}>
                <div >
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t('acp.account.name')}：{record.dataDTO ? record.dataDTO.accountName : '-'}</div>
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>this.$t('acp.account')}：{record.dataDTO ? record.dataDTO.accountNumber: '-'}</div>
                </div>
              </Popover>
            )
          }
        },
        {    //付款属性
          title: this.$t('exp.pay.attribute'), dataIndex: 'payAttr', width: 180,
          render: (value, record) => {
            return (
              <Popover content={<div>
                <div>{this.$t('pay.way.type')}：{record.dataDTO ? record.dataDTO.paymentMethodCategoryName : '-'}</div>
                <div>{this.$t('acp.transaction.name')}：{record.dataDTO ? record.dataDTO.cshTransactionClassName: '-'}</div>
              </div>}>
                <div>
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t('pay.way.type')}：{record.dataDTO ? record.dataDTO.paymentMethodCategoryName : '-'}</div>
                  <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t('acp.transaction.name')}：{record.dataDTO ? record.dataDTO.cshTransactionClassName: '-'}</div>
                </div>
              </Popover>
            )
          }
        },
        {
          title: this.$t('common.comment'), dataIndex: 'description',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          title: this.$t('common.operation'), dataIndex: "id", key: "id", width: 100, align: "center", render: (value, record) => {
          return (
            <div>
              <a onClick={() => { this.handleEdit(record) }}>{this.$t('common.edit')}</a>
              <Divider type="vertical"></Divider>
              <Popconfirm placement="top" title={this.$t('configuration.detail.tip.delete')} onConfirm={() => { this.handleDelete(record) }} okText={this.$t('common.ok')} cancelText={this.$t('common.cancel')}>
                <a>{this.$t('common.delete')}</a>
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
          items: [
          {type: 'value_list', id: 'partnerCategory', label: this.$t({id: "pay.workbench.type"}/*类型*/), valueListCode: 2107, options: [], event: 'code'},
          {type: 'list', id: 'partnerId', label: this.$t({id: "pay.workbench.payee"}/*收款方*/), options: [], listType: 'bgtUser', single: true,event: 'PARTNER',
            method: 'get', listExtraParams: {setOfBooksId: this.props.company.setOfBooksId}, valueKey: 'id',labelKey: "id", disabled: true,
            getUrl: `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName?&page=0&size=9999&name=&empFlag=1002&pageFlag=true`},
          ]
        },
        {
          type: 'items',
          id: 'amountRange',
          label: this.$t('exp.reserve.money'),  //可反冲金额
          items: [
            { type: 'input', id: 'amountFrom', label: this.$t('pay.refund.amountFrom') },
            { type: 'input', id: 'amountTo', label: this.$t('pay.refund.amountTo') }
          ],
        },
      ],
      modalColumns: [
        {title: this.$t('exp.receivables'), dataIndex: 'partnerName', width: 160, align: 'center',
          render: (value,record) => {
            return (<div>
              <Tag color="#000">{record.partnerCategoryName}</Tag>
              <div style={{ whiteSpace: "normal" }}>{record.partnerName}</div>
            </div>)
          }
        },
        {title: this.$t('acp.transaction.name'), dataIndex: 'cshTransactionClassName', width: 110,
          render: desc =>
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
        },
        {
          title: this.$t('xp.pay.line.remark'), dataIndex: 'expensePaymentScheduleDTO.description',
          render:desc =>
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
        },
        {title: this.$t('exp.reserve.money'), dataIndex: 'ableReservedAmount', width: 110,
          render: this.filterMoney
        },
        {title: this.$t('expense.reverse.amount'), dataIndex: 'adjustAmount', width: 100,
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
        {
          title: this.$t('exp.reserve.remark'), dataIndex: 'description',
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

  componentWillReceiveProps(nextProps) {
    if (this.state.flag != nextProps.flag) {
      const { columns }=this.state;
      if(nextProps.headerData.reverseHeader.status===1002)
        columns.splice(-1,1);
      this.setState({ columns,flag: nextProps.flag,id: nextProps.reverseId, page: 0, changeList: [] }, () => {
        this.getList() ;
      });
    }

    // if (nextProps.headerData.reverseHeader && !this.state.id) {
    //   this.setState({ id: nextProps.headerData.reverseHeader.id, page: 0 }, () => {
    //     this.getList();
    //     this.getAmount();
    //   })
    // }
    //
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
        message.success(this.$t('common.delete.success',{name:''}));
        this.getList() ;
      }
    }).catch(e => {
      message.error(e.response.data ? e.response.data.message : this.$t('common.delete.failed'))
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
            size: 5,
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
      this.formRef._reactInternalInstance._renderedComponent._instance.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
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
                  this.formRef._reactInternalInstance._renderedComponent._instance.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
                } else if (value === 'VENDER') { //供应商
                  item.type = 'select';
                  item.labelKey = 'name';
                  partnerId = undefined;
                  //item.listExtraParams ={pageFlag: true};
                  this.formRef._reactInternalInstance._renderedComponent._instance.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
                  // this.formRef._reactInternalInstance._renderedComponent._instance.setValues({ partnerId: '' })
                }
              }
              else {
                item.disabled = true;
                item.type === 'list' && this.formRef._reactInternalInstance._renderedComponent._instance.setValues({ partnerId: [] })
                item.type === 'select' && this.formRef._reactInternalInstance._renderedComponent._instance.setValues({ partnerId: '' })
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
            onChange: this.onChangeLinePager,
          }
        })
      }
    }).catch((e) => {
      this.setState({payDataLoading: false});
      message.error(e.response.data ? e.response.data.message : this.$t('exp.get.unPay.failed'));
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
      message.error(this.$t('exp.add.pay.line.tips'));
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
        message.success(this.$t('common.save.success',{name:''}));
        this.setState({saveLoading: false, newPayVisible: false, lineData: [], changeList: [], linePage: 0});
        this.getList();
      }
    }).catch(e => {
      this.setState({saveLoading: false});
      message.error(e.response.data ? e.response.data.message : this.$t('wait.for.save.addFail'));
    })
  };

  handleBack = () => {
    this.setState({
      newPayVisible: false,
      changeList: [],
      lineData: [],
      linePage: 0
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
                <span>{this.$t('cp.relation.contract')}</span>
              </Col>
              <Col span={20} offset={1}>
                <span>{this.$t('my.contract.name')}：</span>
                <span style={{ marginRight: 20 }}>{contractHeaderLineDTO.contractName ? contractHeaderLineDTO.contractName : "_"}</span>
                <span>{this.$t('my.contract.number')}：</span>
                <a onClick={() => { this.toContract(contractHeaderLineDTO.headerId) }} style={{ marginRight: 20 }}>{contractHeaderLineDTO.contractNumber ? contractHeaderLineDTO.contractNumber : "_"}</a>
                <span>{this.$t('importer.line.number')}：</span>
                <span style={{ marginRight: 20 }}>{contractHeaderLineDTO.lineNumber ? contractHeaderLineDTO.lineNumber : "_"}</span>
                <span>{this.$t("my.contract.plan.pay.date")}：</span>
                <span>{schedulePaymentDate ? moment(schedulePaymentDate).format('YYYY-MM-DD') : "-"}</span>
              </Col>
          </Row>
          <Divider />
        </div>)
        }
        <Row>
          <Col style={{ textAlign: "right" }} span={2}>
            <span>{this.$t('exp.old.pay.line')}</span>
          </Col>
          <Col span={20} offset={1}>
            <span style={{ marginRight: 30 }}>{record.frozenFlag ? this.$t('exp.delay.pay') : this.$t('exp.unDelay.pay')}</span>
            <span>{this.$t('pay.workbench.amount')}：</span>
            <span style={{ marginRight: 30 }}>{record.dataDTO.amount.toFixed(2)}</span>
            <span>{this.$t('acp.payment.amount')}：</span>
            <span style={{ marginRight: 30 }}>{record.dataDTO.paidAmount.toFixed(2)}</span>
            <span>{this.$t('acp.return.amount')}：</span>
            <span style={{ marginRight: 30 }}>{record.dataDTO.returnAmount.toFixed(2)}</span>
            <span>{this.$t('exp.check.amount.total')}：</span>
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
            <span>{this.$t('acp.accountName')}</span>
          </Col>
          <Col span={20} offset={1}>
            <span>{this.$t('acp.account.name')}：</span>
            <span style={{ marginRight: 30 }}>{record.accountName}</span>
            <span>{this.$t('acp.account')}：</span>
            <span style={{ marginRight: 30 }}>{record.accountNumber}</span>
          </Col>
        </Row>
        <Divider />
        {contractHeaderLineDTO.lineNumber && (<div>
            <Row>
              <Col style={{ textAlign: "right" }} span={2}>
                <span>{this.$t('acp.relation.contract')}</span>
              </Col>
              <Col span={20} offset={1}>
                <span>{this.$t('acp.contract.name')}：</span>
                <span style={{ marginRight: 30 }}>{contractHeaderLineDTO.contractName ? contractHeaderLineDTO.contractName : "_"}</span>
                <span>{this.$t('acp.contract.number')}：</span>
                <a onClick={() => { this.toContract(contractHeaderLineDTO.headerId) }} style={{ marginRight: 30 }}>{contractHeaderLineDTO.contractNumber ? contractHeaderLineDTO.contractNumber : "_"}</a>
                <span>{this.$t('exp.plane.pay.line.num')}：</span>
                <span style={{ marginRight: 30 }}>{contractHeaderLineDTO.lineNumber ? contractHeaderLineDTO.lineNumber : "_"}</span>
              </Col>
            </Row>
            <Divider />
          </div>)
        }
        <Row>
          <Col style={{ textAlign: "right" }} span={2}>
            <span>{this.$t('exp.pay.delay')}</span>
          </Col>
          <Col span={20} offset={1}>
            <span>{this.$t('pay.workbench.amount')}：</span>
            <span style={{ marginRight: 30 }}>{record.amount}</span>
            <span>{this.$t('acp.payment.amount')}：</span>
            <span style={{ marginRight: 30 }}>{record.paidAmount}</span>
            <span>{this.$t('acp.return.amount')}：</span>
            <span style={{ marginRight: 30 }}>{record.returnAmount}</span>
            <span>{this.$t('exp.check.amount.total')}：</span>
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
        <h3 style={{ padding: "0 0 10px", margin: 0 }} className="sub-header-title">{this.$t('exp.unPay.reserve.info')}</h3>
        <Row gutter={24}>
          <Col span={18} className="table-header-buttons">
            {!this.props.disabled && <Button type="primary" onClick={this.addItem}>{this.$t('exp.add.pay')}</Button>}
          </Col>
          <Col span={6}>
            {this.$t('exp.reserve.pay.total')} <span style={{color:"green"}}>{totalAmount}</span>
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

        <Modal visible={newPayVisible} title={this.$t('exp.add.reserve.pay.info')} onOk={this.handleSave}
          onCancel={() => this.setState({ newPayVisible: false })}
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
