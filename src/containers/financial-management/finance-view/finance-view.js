
import React from 'react'

import {connect} from 'react-redux'
import { Form, Button, Table, message, Badge, Popover } from 'antd'
import moment from 'moment'
import config from 'config'
import FileSaver from 'file-saver'
// import menuRoute from 'routes/menuRoute'
import constants from 'share/constants'
import SearchArea from 'widget/search-area'
import financeViewService from 'containers/financial-management/finance-view/finance-view.service'
import requestService from 'containers/request/request.service'
import 'styles/financial-management/finance-view.scss'
import CostCenterSearchForm from 'widget/Template/cost-center-search-form/cost-center-search-form'

class FinanceView extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      exportLoading: false,
      status: [
        {label: this.$t('my.contract.state.generate'/*编辑中*/), value: '10011000', state: 'processing'},
        {label: this.$t('my.contract.state.withdrawal'/*已撤回*/), value: '10011001', state: 'warning'},
        {label: this.$t('finance.view.search.reject'/*已驳回*/), value: '10011002', state: 'error'},
        {label: this.$t('finance.view.search.auditReject'/*审核驳回*/), value: '10011003', state: 'error'},
        {label: this.$t('finance.view.search.ticketReject'/*开票驳回*/), value: '10011004', state: 'error'},
        {label: this.$t('finance.view.search.submitted'/*审批中*/),value: '10021000', state: 'processing'},
        {label: this.$t('finance.view.search.pass'/*已通过*/),value: '10031000', state: 'success'},
        {label: this.$t('finance.view.search.auditPass'/*审核通过*/), value: '1004', state: 'success'},
        {label: this.$t('finance.view.search.payed'/*已付款*/),value: '1005', state: 'success'},
        {label: this.$t('finance.view.search.refund'/*还款中*/),value: '1006', state: 'processing'},
        {label: this.$t('finance.view.search.repaid'/*已还款*/),value: '1007', state: 'success'},
        {label: this.$t('finance.view.search.paying'/*付款中*/),value: '1008', state: 'processing'},
        {label: this.$t('supplier.management.disuse'/*已停用*/),value: '1009', state: 'default'}
      ],
      searchForm: [
        {type: 'combobox', id: 'userOID', label: this.$t('finance.view.search.application'),
          placeholder: this.$t('common.please.enter') + this.$t('finance.view.search.application'),
          options: [], searchUrl: `${config.baseUrl}/api/search/users/all`,
          method: 'get', searchKey: 'keyword', labelKey: 'fullName', valueKey: 'userOID',renderOption: option => (`${option.employeeID}-${option.fullName}${(option.status != 1001 ? '(已离职)' : '')}`)}, //申请人姓名/工号
        {type: 'combobox', id: 'businessCode', label: this.$t('finance.view.search.businessCode'),
          placeholder: this.$t('common.please.enter') + this.$t('finance.view.search.businessCode'),
          options: [], searchUrl: `${config.baseUrl}/api/expense/report/loanApplication/search`, method: 'get',
          searchKey: 'keyword', getParams: {type: '10021008'}, labelKey: '_self', valueKey: '_self'}, //父单/子单/借款单号
        {type: 'items', id: 'dateRange', items: [
          {type: 'date', id: 'beginDate', label: this.$t('finance.view.search.dateFrom'),defaultValue:moment().subtract(1, 'month')}, //提交日期从
          {type: 'date', id: 'endDate', label: this.$t('finance.view.search.dateTo'),defaultValue:moment()} //提交日期至
        ]},
        {type:'items',id:'approvalDateRange',items:[
          {type:'date',id:'approvalStartDate',label:this.$t('finance.view.search.approvalDateFrom')},//审批日期从
          {type:'date',id:'approvalEndDate',label:this.$t('finance.view.search.approvalDateTo')}//审批日期至
        ]},
        {type:'items',id:'auditedApprovalDateRange',items:[
          {type:'date',id:'auditedApprovalStartDate',label:this.$t('finance.view.search.auditedDateFrom')},//审核日期从
          {type:'date',id:'auditedApprovalEndDate',label:this.$t('finance.view.search.auditedDateTo')}//审批日期至
        ]},
        {
          type: 'multiple',
          id: 'legalEntity',
          label: this.$t('finance.audit.legalEntity'/*法人实体*/),
          options: [],
          getUrl: `${config.baseUrl}/api/finance/role/legalEntity/query?page=0&size=100`,
          method: 'get',
          labelKey: 'entityName',
          valueKey: 'companyReceiptedOID',
          listKey: "rows"
        },
        {
          type: 'list', id: 'departmentOIDs', label: this.$t('request.detail.department.name'/*部门*/),
          listType: 'department', labelKey: 'name', valueKey: 'departmentOid'
        },
        {
          type: 'select',
          id: 'autoAudit',
          label: this.$t('finance.view.column.autoAudit')/*自动审核通过*/,
          options: [
            {label: this.$t('finance.view.column.all')/*全部*/, value: null},
            {label: this.$t('common.yes')/*是*/, value: true},
            {label: this.$t('common.no')/*否*/, value: false}]
        },
        {type: 'checkbox', id: 'status', label: this.$t('common.column.status'), colSpan: 24, options: [ //状态
          {label: this.$t('finance.view.search.submitted'), value: 'submitted'}, //审批中
          {label: this.$t('finance.view.search.pass'), value: 'approval_pass'},  //已通过
          {label: this.$t('finance.view.search.reject'), value: 'approval_reject'}, //已驳回
          {label: this.$t('finance.view.search.auditPass'), value: 'audit_pass'}, //审核通过
          {label: this.$t('finance.view.search.auditReject'), value: 'audit_reject'}, //审核驳回
          {label: this.$t('finance.view.search.paying'), value: 'payment_in_process'}, //付款中
          {label: this.$t('finance.view.search.payed'), value: 'finance_loan'}, //已付款
          {label: this.$t('finance.view.search.refund'), value: 'paid_in_process'}, //还款中
          {label: this.$t('finance.view.search.repaid'), value: 'paid_finish'}, //已还款
        ]},
      ],
      checkboxListForm: [
        {id: 'formOIDs', items: [
          {label: this.$t('finance.view.search.reimbursement'/*报销单*/), key: 'expense', options: []},
          {label: this.$t('finance.view.search.borrowingDocument'/*借款单*/), key: 'loan', options: []}
        ]}
      ],
      searchParams: {},
      columns: [
        {title: this.$t('common.sequence'), dataIndex: 'index', width: '7%', render: (text, record, index) => (this.state.page * 10 + index + 1)},  //序号
        {title: this.$t('finance.view.search.jobNumber'/*工号*/), dataIndex: 'employeeID'},
        {title: this.$t('finance.view.search.applicant'/*申请人*/), dataIndex: 'applicant'},
        {title: this.$t('finance.view.search.submitDate'/*提交日期*/), dataIndex: 'lastSubmittedDate', render: (date, record) =>
          date ? moment(date).format('YYYY-MM-DD') : moment(record.createDate).format('YYYY-MM-DD'), sorter: true},
        {title: this.$t('finance.view.search.documentType'/*单据类型*/), dataIndex: 'formName', render: value => <Popover content={value}>{value}</Popover>, sorter: true},
        {title: this.$t('finance.view.search.documentNo'/*单号*/), dataIndex: 'businessCode', render: (value, record) => (
          <Popover content={record.parentBusinessCode ? `${record.parentBusinessCode} - ${value}` : value}>
            {record.parentBusinessCode ? `${record.parentBusinessCode} - ${value}` : value}
          </Popover>
        ), sorter: true},
        {title: this.$t('finance.view.search.currency'/*币种*/), dataIndex: 'currencyCode', width: '7%'},
        {title: this.$t('finance.view.search.totalAmount'/*总金额*/), dataIndex: 'totalAmount', render: this.renderMoney, sorter: true},
        // 凭证编号
        {title: this.$t('finance.audit.journalNo'), dataIndex: 'origDocumentSequence', width: '7%', render: value => <Popover content={value}>{value}</Popover>},
        {title: this.$t('common.column.status'), dataIndex: 'status', width: this.props.language.local === 'zh_cn' ? '8%' : '13%', render: (value, record) => {
          let applicationType = '';
          (+record.entityType === 1001) && (applicationType = 2005);//申请单下的applicationType是2005
          return (
            <Badge text={constants.getTextByValue(String(value + '' + record.rejectType), 'documentStatus') ||
                          constants.getTextByValue(String(value + '' + applicationType), 'documentStatus') ||
                            constants.getTextByValue(String(value), 'documentStatus')}
                   status={constants.getTextByValue(String(value + '' + record.rejectType), 'documentStatus', 'state') ||
                            constants.getTextByValue(String(value + '' + applicationType), 'documentStatus', 'state') ||
                              constants.getTextByValue(String(value), 'documentStatus', 'state')} />
          )
        }},
        //状态
        {title: this.$t('common.operation'), dataIndex: 'operation', width: this.props.language.local === 'zh_cn' ? '7%' : '10%', render: (value, record) =>
            <a onClick={event => this.print(record, event)}>{this.$t('finance.view.search.print')}</a>}
      ],
      data: [],
      pagination: {
        total: 0
      },
      sort: '',
      pageSize: 10,
      page: 0,
      haveLoan: true,    //搜索单据包含借款单
      haveExpense: true, //搜索单据包含报销单
    //   expenseDetailView: menuRoute.getRouteItem('expense-report-detail-view', 'key'),
    //   loanDetailView: menuRoute.getRouteItem('loan-request-detail-view', 'key'),
    }
  }

  componentWillMount() {
    let params = [
      {factorCode:"COMPANY",factorValue: this.props.user.companyId},
      {factorCode:"SET_OF_BOOKS",factorValue: this.props.company.setOfBooksId}
    ];
    requestService.searchPrintFree(this.props.user.tenantId, params).then(res => {
      if(res.data.rows[0].hitValue === 'Y'){
        let search = this.state.searchForm;
        search.push({
          type: 'select',
          id: 'printFree',
          label: this.$t('finance.view.column.weatherPrint')/*报销单是否免打印*/,
          options:[
            {label: this.$t('finance.view.column.all')/*全部*/,value: null},
            {label: this.$t('finance.view.column.printFree')/*免打印*/,value: true},
            {label: this.$t('finance.view.column.noPrintFree')/*非免打印*/,value: false}]
        });
        let length = search.length;
        let temp = search[length-1];
        search[length-1] = search[length-2];
        search[length-2] = temp;
        this.setState({searchForm:search});
      }
    })
  }

  componentDidMount() {
    this.getForms();
    this.getList(true)
  }
//获取表单
  getForms = () => {
    let checkboxListForm = this.state.checkboxListForm;
    financeViewService.getExpenseTypeList().then(res => {
      let options = [];
      res.data.map(list => {
        options.push({label: list.formName, value: list.formOID})
      });
      checkboxListForm[0].items.map(item => {
        item.key === 'expense' && (item.options = options)
      })
    });
    financeViewService.getLoanTypeList().then(res => {
      let options = [];
      res.data.map(list => {
        options.push({label: list.formName, value: list.formOID})
      });
      checkboxListForm[0].items.map(item => {
        item.key === 'loan' && (item.options = options)
      })
    });
    this.setState({ checkboxListForm })
  };
  getList = (firstRequest) => {
    const { page, pageSize, searchParams, sort } = this.state;
    if (firstRequest) {
      searchParams.beginDate = moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss');
      searchParams.endDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    this.setState({ loading: true });
    if(sort) {
      searchParams.sorts = {
        property: sort.split(',')[0],
        direction: sort.split(',')[1]
      };
    }
    financeViewService.getFinanceViewList(page, pageSize, searchParams).then(res => {
      if (res.status === 200) {
        this.setState({
          loading: false,
          data: res.data,
          pagination: {
            total: Number(res.headers['x-total-count']),
            pageSize: this.state.pageSize
          }
        })
      }
    }).catch((e) => {
      this.setState({ loading: false });
      message.error(e.response.data.message);
    })
  };
  search = (result) => {
    let {searchParams}=this.state;
    // result.entityType = '10021008';
    result.beginDate && (result.beginDate = moment(result.beginDate).format('YYYY-MM-DD 00:00:00'));
    result.endDate && (result.endDate = moment(result.endDate).format('YYYY-MM-DD 23:59:59'));
    result.approvalStartDate && (result.approvalStartDate = moment(result.approvalStartDate).format('YYYY-MM-DD 00:00:00'));
    result.approvalEndDate && (result.approvalEndDate = moment(result.approvalEndDate).format('YYYY-MM-DD 23:59:59'));
    result.auditedApprovalStartDate && (result.auditedApprovalStartDate = moment(result.auditedApprovalStartDate).format('YYYY-MM-DD 00:00:00'));
    result.auditedApprovalEndDate && (result.auditedApprovalEndDate = moment(result.auditedApprovalEndDate).format('YYYY-MM-DD 23:59:59'));
    result.printFree === 'null' && (delete result.printFree);
    result.searchCorporations=result.legalEntity ? result.legalEntity :[];
    result.searchCostCenterCommands = searchParams.searchCostCenterCommands;
    result.departmentOID = result.departmentOIDs ? result.departmentOIDs : [];
    this.setState({
      searchParams: result,
      page: 0,
      pagination: {
        current: 1
      }
    }, ()=>{
      this.getList();
    })
  };

  clear = () => {
    this.handleSearchData();
    this.setState({ searchParams: {} })
  };
  handleSearchData = () => {
    let {searchForm} =this.state;
    let dateRange=searchForm.filter(item => item.id === 'dateRange')[0];
    dateRange.items[0].defaultValue=null;
    dateRange.items[1].defaultValue=null;
    this.setState({searchForm})
  }

  //顶部横条checkbox搜索框处理事件
  handleCheckbox = (id, checked) => {
    let searchForm = this.state.searchForm;
    let haveLoan = true;
    let haveExpense = true;
    checked.map(list => {
      if (list.key === 'loan') {
        haveLoan = list.checked ? !!list.checked.length : false
      }
      if (list.key === 'expense') {
        haveExpense = list.checked ? !!list.checked.length : false
      }
    });
    if(haveLoan !== this.state.haveLoan || haveExpense !== this.state.haveExpense) {
      this.formRef.setValues({
        status: ''
      })
    }
    searchForm.map(item => {
      item.id === 'status' && item.options.map(option => {
        if (option.value === 'paid_in_process' || option.value === 'paid_finish') {
          option.disabled = (!haveLoan && haveExpense)
        }
      })
    });
    this.setState({ haveLoan, haveExpense })
  };

  //导出事件
  handleExport = () => {
    const { searchParams } = this.state;
    this.setState({ exportLoading: true });
    financeViewService.exportFinanceList(searchParams).then(res => {
      if (res.status === 200) {
        let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        FileSaver.saveAs(b, this.$t('finance.view.search.exportDocument'/*单据导出*/));
        this.setState({ exportLoading: false });
        message.success(this.$t('finance.view.search.exportSuccess'/*导出成功*/))
      }
    }).catch(e => {
      this.setState({ exportLoading: false });
      let blob = new Blob([e.response.data]);
      let reader = new FileReader();
      reader.readAsText(blob);
      reader.addEventListener("loadend", () => {
        let result = reader.result;
        if (result && typeof result === 'string') {
          result = JSON.parse(result);
          if (result.message) {
            message.error(`${this.$t('finance.view.search.exportFailure')}，${result.message}`)
          } else{
            message.error(`${this.$t('finance.view.search.exportFailure')}，${result.message}`)
          }
        }
      });
      reader.addEventListener('error', () => {
        message.error(this.$t('finance.view.search.exportFailure'))
      })
    })
  };

  handleRowClick = (record) => {
    // entityType：1001（申请单）、1002（报销单）
    if (record.entityType === 1002) {
    //   window.open(this.state.expenseDetailView.url.replace(':expenseReportOID', record.entityOID))
    } else {
    //   window.open(this.state.loanDetailView.url.replace(':formOID', record.formOID).replace(':applicationOID', record.entityOID))
    }
  };

  //打印
  print = (record,event) => {
    event.preventDefault();
    event.stopPropagation();
    event.cancelBubble = true;
    if (record.entityType === 1002) {
      financeViewService.printExpenseReport(record.entityOID).then(res => {
        window.open(res.data.fileURL, '_blank');
      })
    } else {
      requestService.printLoanApplication(record.entityOID).then(res => {
        window.open(res.data.link, '_blank')
      })
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    let page =  pagination.current;
    let sort = '';
    if(sorter.order){
      sort = `${sorter.columnKey},${sorter.order === 'ascend' ? 'ASC' : 'DESC'}`
    }
    this.setState({
      page: page - 1,
      sort
    }, ()=>{
      this.getList();
    })
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return <span className="money-cell">{numberString}</span>
  };

  renderExpandedRow = (title, content) => {
    return (
      <div>
        <span>{title}</span>
        {content && <span>:{content}</span>}
      </div>
    )
  };

  renderAllExpandedRow = (record) =>{
    let result = [];
    if(record.printFree){
      result.push(this.renderExpandedRow(this.$t('common.print.free'), this.$t('common.print.require')));
    }
    if(result.length>0){
      return result;
    }else{
      return null;
    }
  };

  changeCostCenter = (value) => {
    let searchParams = this.state.searchParams;
    searchParams.searchCostCenterCommands = value;
    this.setState({searchParams})
  };
  render() {
    const { loading, exportLoading, searchForm, checkboxListForm, columns, data, pagination, searchParams } = this.state;
    return (
      <div className="finance-view">
        <SearchArea searchForm={searchForm}
                    checkboxListForm={checkboxListForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                    isExtraFields={true}
                    extraFields={[
                      <div>
                        <div style={{lineHeight: '28px'}}>
                          {/*成本中心*/}
                          {this.$t('finance.audit.cost.center')}
                        </div>
                        <CostCenterSearchForm title={this.$t('finance.audit.cost.center')}
                                              value={searchParams.searchCostCenterCommands}
                                              onChange={this.changeCostCenter}/>
                      </div>
                    ]}
                    checkboxChange={this.handleCheckbox}
                    wrappedComponentRef={(inst) => this.formRef = inst}
        />
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleExport} loading={exportLoading}>{this.$t('finance.view.search.exportSearchData')}</Button>
            {/*导出搜索数据*/}
          </div>
          <div className="table-header-title">{this.$t('common.total',{total: pagination.total || 0})}</div>
          {/*共多少条数据*/}
        </div>
        <Table rowKey={record => record.entityOID}
               columns={columns}
               dataSource={data}
               loading={loading}
               pagination={pagination}
               onChange={this.handleTableChange}
               onRow={record => ({onClick: () => {this.handleRowClick(record)}})}
               expandedRowRender = {this.renderAllExpandedRow}
               rowClassName = {record => record.printFree ? '' :'finance-view-reject'}
               bordered
               size="middle"/>
      </div>
    )
  }
}

// FinanceView.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
    language: state.languages
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(FinanceView);
