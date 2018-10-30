/**
 * Created by Allen on 2018/5/9.
 */
import React from 'react';
import { connect } from 'dva';
import { Select, Modal, Divider, Button, Table, message, Popover, Popconfirm, Row, Col, Badge } from 'antd'
import 'styles/reimburse/reimburse.scss';
import SearchArea from 'components/Widget/search-area';
import {messages} from 'utils/utils';
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
import ApprotionInfo from 'containers/reimburse/my-reimburse/approtion-info'
import AttachmentInformation from 'containers/financial-management/expense-reverse/attachment-information'
import moment from "moment"
import config from 'config';

const invoiceOperationTypeList = [
  {key: messages({id:'exp.blue.invalid'}), value: 'DELETE'},  //蓝票作废
  {key: messages({id:'exp.red.invoice.reserve'}), value: 'BACK_LASE'},  //红票反冲
  {key: messages({id:'exp.invoice.outTime'}), value: 'OVERDUE'},  //发票过期
  {key: messages({id:'exp.needless.operation'}), value: 'NO_TICKET'}  //无需操作
];


class ExpenseReverseInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { title: this.$t({id:'common.sequence'}), align: "center", dataIndex: "index", key: "index", width: 60,
          render: (value, record, index) => index + 1
        },
        {
          title: this.$t({id:'common.expense.type'}), dataIndex: 'expenseType', width: 80,
          render: desc =>
            <span>
              <Popover content={desc ? desc.name : '-'}>{desc ? desc.name : '-'}</Popover>
            </span>
        },
        {        //发生日期
          title: this.$t({id:'common.happened.date'}), dataIndex: 'createdDate', width: 110,
          render: desc =>
            <span>
              <Popover content={moment(desc).format('YYYY-MM-DD')}>{desc ? moment(desc).format('YYYY-MM-DD') : '-'}</Popover>
            </span>
        },
        {     //反冲金额
          title: this.$t({id:'expense.reverse.amount'}), dataIndex: 'amount', width: 100, align: 'center',
          render: this.filterMoney
        },
        {    //反冲本币金额
          title: this.$t({id:'exp.reserve.baseCurrency.amount'}), dataIndex: 'functionAmount', width: 120, align: 'center',
          render: this.filterMoney
        },
        {     //反冲备注
          title: this.$t({id:'exp.reserve.remark'}), dataIndex: 'description',
          render: desc =>
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
        },
        {       //发票操作类型
          title: this.$t({id:'exp.invoice.operation.type'}), dataIndex: 'invoiceOperationType', width: 140, align: 'center',
          render: (value,record) => {
            return (
              <div>
                {value === 'DELETE' && <span>{this.$t({id:'exp.blue.invalid'})}</span>}
                {value === 'NO_TICKET' && <span>{this.$t({id:'exp.needless.operation'})}</span>}
                {value === 'OVERDUE' && <span>{this.$t({id:'exp.invoice.outTime'})}</span>}
                {value === 'BACK_LASE' && <a onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.showInvoiceDetail(record)
                }}>{this.$t({id:'exp.red.invoice.reserve'})}</a>}
              </div>
            )
          }
        },
        {
          title: this.$t({id:'exp.dir.info'}), dataIndex: 'checkInfo', width: 160, align: 'center', render: (value, record) => {
            return (
              <div>
                  {record.vatInvoice && <Divider type="vertical"></Divider>}
                              <a onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  this.showApprotion(record.sourceReportLineId)
                }}>{this.$t({id:'exp.detail.info'})}</a>
                <Divider type="vertical"></Divider>
                <a onClick={() => this.checkOldExpense(record)}>{this.$t({id:'exp.old.expense.detail'})}</a>
              </div>
            )
          }
        },
      ],
      modalColumns: [
        { title: this.$t({id:'common.sequence'}), align: "center", dataIndex: "index", key: "index", width: 60,
          render: (value, record, index) => index + 1
        },
        {
          title: this.$t({id:'common.expense.type'}), dataIndex: 'expenseTypeName', key: 'expenseTypeName', width: 100
        },
        {title: this.$t({id:'common.happened.date'}), dataIndex: 'createdDate', key:'createdDate', width: 110, render: desc =>
          <span>{moment(desc).format('YYYY-MM-DD')}</span>
        },
        {
          title: this.$t({id:'common.amount'}), dataIndex: 'actualAmount', key: 'actualAmount', width: 90, render: this.filterMoney
        },
        {
          title: this.$t({id:'common.base.currency.amount'}), dataIndex: 'baseAmount', key: 'baseAmount' ,width: 100, render: this.filterMoney
        },
        {
          title: this.$t({id:"common.comment"}), dataIndex: 'comment', key:'comment'
        },
        {
          title: this.$t({id:'exp.dir.info'}), dataIndex: 'checkInfo',render: (value, record) => {
            return (
              <div>
                  {record.vatInvoice && <a onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this.showInvoiceDetail(record)
                                }}>{this.$t({id:'exp.invoice.info'})}</a>}
                  {record.vatInvoice && <Divider type="vertical"></Divider>}
                              <a onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  this.showApprotion(record.id)
                }}>{this.$t({id:'exp.detail.info'})}</a>
                 <Divider type="vertical"></Divider>
                <a onClick={e=>{
                  e.preventDefault();
                  e.stopPropagation();
                  this.showAttInfo(record.id)
                }}>{this.$t({id:'common.attachments'})}</a>
              </div>
            )
          }
        }
      ],
      searchForm: [
        {
          type: 'list',
          id: 'expenseType',
          label: this.$t({id:'common.expense.type'}),  //费用类型
          getUrl: `${config.baseUrl}/api/expense/adjust/types/getExpenseType`,
          //getUrl: '',
          selectorItem:{
            title: this.$t({ id: "itemMap.expenseType" }),
            url: `${config.baseUrl}/api/v2/custom/forms/fa94050f-3fba-475a-ae04-8a4291efd957/selected/expense/types`,
            searchForm: [
              { type: 'input', id: 'name', label: this.$t({ id: "itemMap.expenseTypeName" }) },
            ],
            columns: [
              {
                title: this.$t({ id: "itemMap.icon" }), dataIndex: 'iconURL',
                render: (value) => {
                  return <img src={value} height="20" width="20" />
                }
              },
              { title: this.$t({ id: "itemMap.expenseTypeName" }), dataIndex: 'name' },
              {
                title: this.$t({ id: "common.column.status" }), dataIndex: 'enable',
                render: isEnabled => (
                  <Badge status={isEnabled ? 'success' : 'error'}
                         text={isEnabled ? this.$t({ id: "common.status.enable" }) : this.$t({ id: "common.status.disable" })} />
                )
              },
            ],
            listKey: 'expenseTypes',
            key: 'id'
          },
          listExtraParams:{ setOfBooksId: "937515627984846850" },
          single: true,
          itemMap: true,
          labelKey:'name',
          valueKey:'id'
        },
        /*{
          type: 'datePicker',
          id: 'createDate',
          label: '发生日期',
        },*/
        {
          type: 'items',
          id: 'applyDate',
          items: [                                      //发生日期从
            { type: 'date', id: 'applyDateFrom', label: this.$t({id:'exp.happen.date.from'}),event: 'DATE_FROM'},
            { type: 'date', id: 'applyDateTo', label: this.$t({id:'exp.happen.date.to'}),event:'DATE_TO' }
          ],
        },
        {
          type: 'items',
          id: 'amountRange',
          items: [
            { type: 'input', id: 'amountFrom', label: this.$t({id:'pay.refund.amountFrom'}) },
           { type: 'input', id: 'amountTo', label: this.$t({id:'pay.refund.amountTo'}) }
          ]
        }
      ],
      searchParams: {},
      data: [],
      lineData: [],
      selectedRowKeys: [],  //选中的项
      loading: false,
      addLoading: false,
      showAttInfo: false,
      showApprotionOut: false,
      pagination: {},
      page: 0,
      pageSize: 10,
      linePage: 0,
      linePageSize: 10,
      linePagination: {},
      headerData: {},
      amountData: {},
      previewVisible: false,
      newExpenseVisible: false,
      showApprotion: false,  //分摊信息
      model: {},
      flag: true,
      record: {},
      lineDtos: []
    };
  }

  componentDidMount(){
    if (this.state.flag != this.props.flag) {
      let columns = this.state.columns;
      if(this.props.headerData.reverseHeader.status ===1001 || this.props.headerData.reverseHeader.status === 1003 || this.props.headerData.reverseHeader.status ===1005){
        columns.push({
            title: this.$t({id:'common.operation'}), dataIndex: "id", key: "id", width: 120, align: "center", render: (value, record) => {
              return (
                <div>
                  <a onClick={() => { this.handleEdit(record) }}>{this.$t({id:'common.edit'})}</a>
                  <Divider type="vertical"></Divider>
                  <Popconfirm placement="top" title={this.$t({id:'configuration.detail.tip.delete'})} onConfirm={() => { this.handleDelete(record) }} okText={this.$t({id:'common.ok'})} cancelText={this.$t({id:'common.cancel'})}>
                    <a>{this.$t({id:'common.delete'})}</a>
                  </Popconfirm>
                </div>
              )}
          })
      }
      this.setState({
        id: this.props.headerData.reverseHeader.id,
        headerData: this.props.headerData,
        flag: this.props.flag,
        page: 0
      }, () => {
        this.getList() ;
        this.getAmount();
        this.getInfo();
      });
    }

    // if (nextProps.headerData.reverseHeader && !this.state.id) {
    //   this.setState({ id: nextProps.headerData.reverseHeader.id, page: 0 }, () => {
    //     this.getList();
    //     this.getAmount();
    //   })
    // }
    //
    if (this.props.disabled && this.state.columns.length === 10) {
      let columns = this.state.columns;
      columns.splice(columns.length - 1, 1);
      this.setState({ columns });
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if (this.state.flag != nextProps.flag) {
      let columns = this.state.columns;
      if(nextProps.headerData.reverseHeader.status ===1001 || nextProps.headerData.reverseHeader.status === 1003 || nextProps.headerData.reverseHeader.status ===1005){
        columns.push({
            title: this.$t({id:'common.operation'}), dataIndex: "id", key: "id", width: 120, align: "center", render: (value, record) => {
              return (
                <div>
                  <a onClick={() => { this.handleEdit(record) }}>{this.$t({id:'common.edit'})}</a>
                  <Divider type="vertical"></Divider>
                  <Popconfirm placement="top" title={this.$t({id:'configuration.detail.tip.delete'})} onConfirm={() => { this.handleDelete(record) }} okText={this.$t({id:'common.ok'})} cancelText={this.$t({id:'common.cancel'})}>
                    <a>{this.$t({id:'common.delete'})}</a>
                  </Popconfirm>
                </div>
              )}
          })
      }
      this.setState({
        id: nextProps.headerData.reverseHeader.id,
        headerData: nextProps.headerData,
        flag: nextProps.flag,
        page: 0
      }, () => {
        this.getList() ;
        this.getAmount();
        this.getInfo();
      });
    }

    // if (nextProps.headerData.reverseHeader && !this.state.id) {
    //   this.setState({ id: nextProps.headerData.reverseHeader.id, page: 0 }, () => {
    //     this.getList();
    //     this.getAmount();
    //   })
    // }
    //
    if (nextProps.disabled && this.state.columns.length === 10) {
      let columns = this.state.columns;
      columns.splice(columns.length - 1, 1);
      this.setState({ columns });
    }
  }

  //编辑
  handleEdit = (record) => {
    this.props.editReverseInfo && this.props.editReverseInfo(record);
  };

  //查看原费用
  checkOldExpense = (record) => {
    this.props.checkReverseInfo && this.props.checkReverseInfo(record);
  };

  //删除费用行
  handleDelete = (record) => {
    reverseService.deleteReverseLine(record.id).then(resp => {
      if (resp.status === 200){
        message.success(this.$t({id:'common.delete.success'},{name:''}));
        this.props.query();
        this.getList() ;
        this.getAmount();
      }
    }).catch(e => {
      message.error(e.response.data ? e.response.data.message : this.$t({id:'common.delete.failed'}))
    })
  };

  //获取数据列表
  getList = () => {
    const { id, page, pageSize } = this.state;
    this.setState({ loading: true });
    reverseService.getReverseLine(id,page,pageSize).then(resp => {
      if (resp.status === 200){
        this.setState({
          data: resp.data,
          loading: false,
          pagination: {
            current: this.state.page + 1,
            total: Number(resp.headers['x-total-count']),
            onChange: this.onChangePager
          }
        })
      }
    }).catch(e => {
      this.setState({loading: false});
      message.error(e.response.data.message)
    })
  };

     //获取报账单头信息
  getInfo = () => {
    reimburseService.getReimburseDetailById(this.state.headerData.documentHeader.documentId).then(res => {    let expenseTypeList = [];
      if (res.data.summaryView && res.data.summaryView.expenseTypeList) {
        expenseTypeList = res.data.summaryView.expenseTypeList;
      }
      this.setState({
        headerData: res.data,
        expenseTypeList
      });
    });
  };

  //获取费用反冲行的金额信息
  getAmount(){
    const { id } = this.state;
    reverseService.queryAmount(id).then(resp => {
      if (resp.status === 200){
        this.setState({amountData: resp.data})
      }
    }).catch(e => {
      message.error(e.response.data.message)
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
        this.getReverseLineList()
      })
    }
  };

  showInvoiceDetail = (record) => {
    this.props.showInvoiceDetail && this.props.showInvoiceDetail(record);
  };

  //显示附件
  showAttInfo = (id) =>{
    this.setState({sourceReportLineId:id,showAttInfo:true})
  };

  //显示分摊行
  showApprotion = (id) => {
    this.setState({ invoiceId: id, showApprotionOut: true });
  };

   //图片预览
  preview = (record) => {
    this.setState({ previewVisible: true, previewImage: record.thumbnailUrl })
  } ;

  //表格展开的渲染内容
  expandedRowRender = (record) => {
    return (
      <Row>
          <Col style={{ textAlign: 'center' }} span={4}><h3>附件信息：</h3></Col>
          <Col span={20}>
              <Row>
                  {record.attachmentList.map(item => {
                      return (
                          <Col span={6}>
                              <a onClick={() => { this.preview(item) }}>{item.fileName}</a>
                          </Col>
                      )
                  })}
              </Row>
          </Col>
      </Row>
  )
  };

  addItem = () => {
    this.setState({ newExpenseVisible: true },() => {
      this.getReverseLineList();
    });
  };

  /*
    新增modal内容
  */

  getReverseLineList(){
    const { linePage, linePageSize, id, searchParams } = this.state;
    this.setState({loading: true});
    let params = {
      ...searchParams,
      headerId: id,
      selectIds: []
    };
    reverseService.getExpenseLine(linePage, linePageSize, params).then(resp => {
      if (resp.status === 200){
        this.setState({
          loading: false,
          lineData: resp.data,
          linePagination: {
            current: this.state.linePage + 1,
            total: Number(resp.headers['x-total-count']),
            onChange: this.onChangeLinePager
          }
        });
      }
    }).catch((e) => {
      this.setState({loading: false});
      if(e.response)
        message.error(e.response.data.message);
    })
  };

  onChangeLinePager = (page) => {
    if (page - 1 !== this.state.linePage) {
      this.setState({ linePage: page - 1 }, () => {
        this.getReverseLineList()
      })
    }
  };

  handleSearch = (result) => {
    result.dateFrom = result.applyDateFrom ? result.applyDateFrom.format('YYYY-MM-DD') : undefined;
    result.dateTo = result.applyDateTo ? result.applyDateTo.format('YYYY-MM-DD') : undefined;
    let searchParams = {
      expenseTypeId: result.expenseType&&result.expenseType[0],
      dateFrom: result.dateFrom,
      dateTo: result.dateTo,
      amountFrom: result.amountFrom,
      amountTo: result.amountTo
    };
    this.setState({
      searchParams,
      linePage: 0
    }, () => {
      this.getReverseLineList();
    })
  };

  handleClear = () => {
    this.setState({ searchParams: {} });
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

  handleSave = () => {
    const { id, lineDtos } = this.state;
    if (lineDtos.length === 0){
      message.error(this.$t({id:'exp.add.tips'}));
      return false;
    }
    let params  = {
      lineDtos: lineDtos,
      reverseInvoice: {}
    };
    this.setState({addLoading: true,selectedRowKeys:[]});
    reverseService.saveExpenseLine(id,params).then(resp => {
      if (resp.status === 200){
        message.success(this.$t({id:'common.save.success'},{name:''}));
        this.setState({
          addLoading: false,
          newExpenseVisible: false
        }, () => {
          this.props.query();
          this.getAmount();
          this.getList();
        });

      }
    }).catch(e => {
      this.setState({addLoading: false});
      if(e.response)
        message.error( e.response.data.message);
    })
  };

  render() {
    const { loading, addLoading, data, columns, searchForm, amountData, previewVisible, previewImage, newExpenseVisible, lineData, linePagination, modalColumns, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className="tab-container reimburse-container">
        <h3 style={{ padding: "0 0 10px", margin: 0 }} className="sub-header-title">{this.$t({id:'exp.expense.reserve.info'})}</h3>
        <div className="table-header" style={{height: '32px', lineHeight: '32px' }}>
          {!this.props.disabled && <div className="table-header-buttons" style=
            {{ float: "left" }}>
            <Button type="primary" onClick={this.addItem}>{this.$t({id:'exp.add.expense'})}</Button>
          </div>}
          <div style={{ float: "right" }}>
              <span>
                {this.$t({id:'exp.expense.baseCurrency.amount'})}：<span style={{ color: "green" }}>{amountData.totalFunctionAmount}
                </span>
              </span>
          </div>
          <div style={{ float: "right", marginRight: '20px' }}>
              <span>
                {this.$t({id:'exp.reserve.amount.total'})}:<span style={{ color: "green" }}>{amountData.totalAmount}
                </span>
              </span>
          </div>
        </div>
        <Table rowKey={record => record.id}
              columns={columns}
              dataSource={data}
              loading={loading}
              scroll={{ x: true, y: false }}
              bordered
              pagination={this.state.pagination}
              expandedRowRender={this.expandedRowRender}
          size="middle" />
        <Modal visible={previewVisible} footer={null}
              onCancel={() => { this.setState({ previewVisible: false }) }}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>

        <Modal visible={newExpenseVisible} title={this.$t({id:'exp.add.expense'})} onOk={this.handleSave}
          onCancel={() => this.setState({ newExpenseVisible: false })}
          footer={[
            <Button key="submit" type="primary"
              loading={addLoading} style={{ margin: '0 20px' }} onClick={this.handleSave}>
              {this.$t({id: 'common.ok'}/*确定*/)}
            </Button>,
            <Button key="back" onClick={() => this.setState({ newExpenseVisible: false })}>
              {this.$t({id: 'common.back'}/*返回*/)}
            </Button>
          ]}
          width="70%"
        >
            <SearchArea
                searchForm={searchForm}
                submitHandle={this.handleSearch}
                clearHandle={this.handleClear}/>
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
              loading={loading}
              scroll={{ x: true, y: false }}
              bordered
              rowSelection={rowSelection}
              pagination={linePagination}
              size="middle" />
          <ApprotionInfo mode="negative" close={() => { this.setState({ showApprotion: false }) }} headerData={this.state.headerData} visible={this.state.showApprotion} id={this.state.invoiceId}    z-index={1001} ></ApprotionInfo>
          <AttachmentInformation sourceReportLineId={this.state.sourceReportLineId} visible={this.state.showAttInfo} close={()=>{this.setState({showAttInfo: false})}}/>
        </Modal>
        <ApprotionInfo mode="negative"  close={() => { this.setState({ showApprotionOut: false }) }} headerData={this.state.headerData} visible={this.state.showApprotionOut} id={this.state.invoiceId}    z-index={1001} ></ApprotionInfo>
      </div>
    )
  }
}

// ExpenseReverseInfo.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseReverseInfo);
