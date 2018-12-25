/**
 * Created by zaranengap on 2017/7/4.
 */
import React from 'react'
import { connect } from 'react-redux'
import { Tabs,  Button, notification, Icon, Popover  } from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
import httpFetch from 'share/httpFetch'
import config from 'config'
import SearchArea from 'components/search-area'
import 'styles/financial-payment/confirm-payment.scss'
import CompanyBankSelector from 'containers/financial-management/confirm-payment/company-bank-selector'
import confirmPaymentService from 'containers/financial-management/confirm-payment/confirm-payment.service'
import financeViewService from 'containers/financial-management/finance-view/finance-view.service'
import menuRoute from "../../../routes/menuRoute";
import {messages, invoiceAmountChange, dealCache, deepFullCopy} from 'share/common';
import {Dropdown,Menu} from 'antd';
import Importer from 'components/template/importer';
import moment from 'moment'
let cacheSearchData={};
let defaultSearchForm=[];
let defaultCheckboxListForm={};
let ifClearRowSelect=true;

class ConfirmPayment extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        {
          type: 'radio',
          id: 'type',
          label: messages('finance.view.search.documentType'/*单据名称*/),
          options: [
            {label: messages('finance.view.search.reimbursement'/*报销单*/), value: 'INVOICE'},
            {label: messages('finance.view.search.borrowingDocument'/*借款单*/), value: 'BORROW'}],
          event: 'CHANGE_TYPE',
          defaultValue: 'INVOICE'
        },
        {
          type: 'items',
          id: 'dateRange',
          items: [
            {type: 'date', id: 'dateFrom', label: messages('finance.audit.startDate'/*日期从*/),defaultValue:moment().subtract(3, 'month')},
            {type: 'date', id: 'dateTo', label: messages('finance.audit.endDate'/*日期到*/),defaultValue:moment()}
          ]
        },
        {
          type: 'combobox', id: 'formID', label: messages('finance.view.search.documentNo'/*单号*/),
          placeholder: messages('common.please.enter') + messages('finance.view.search.documentNo'),
          options: [],
          searchUrl: `${config.baseUrl}/api/expense/report/search`,
          method: 'get',
          searchKey: 'keyword', getParams: {status: 'prending_pay'}, labelKey: '_self', valueKey: '_self'
        },
        {
          type: 'combobox',
          id: 'user',
          label: messages('finance.audit.employee'/*员工*/),
          placeholder: messages('common.please.enter') + messages('confirm.payment.nameNo'), // 请输入姓名／工号
          options: [],
          searchUrl: `${config.baseUrl}/api/search/users/all`,
          method: 'get',
          searchKey: 'keyword',
          labelKey: 'fullName',
          valueKey: 'userOid',
          renderOption: option => (`${option.employeeID}-${option.fullName}${(option.status != 1001 ? '(已离职)' : '')}`)
        },
        {
          type: 'multiple',
          id: 'legalEntity',
          label: messages('finance.audit.legalEntity'/*法人实体*/),
          options: [],
          getUrl: `${config.baseUrl}/api/v2/my/company/receipted/invoices?page=0&size=100`,
          method: 'get',
          labelKey: 'companyName',
          valueKey: 'companyReceiptedOid'
        }
      ],
      checkboxListForm:{
        id: 'formOids',
        items: [],
        defaultValue: []
      },
      expenseForms:[],
      loanForms:[],
      columns: [
        {title: messages('finance.audit.serialNo'/*序号*/), dataIndex: 'index', width: '5%'},
        {title: messages('finance.view.search.applicant'/*申请人*/), dataIndex: 'applicantName', width: '10%'},
        {title: messages('finance.view.search.jobNumber')/*工号*/, dataIndex: "employeeID", width: '7%'},
        {title: messages('finance.view.search.submitDate'/*提交日期*/), dataIndex: 'submittedDate', width: '10%', render: date => new Date(date).format('yyyy-MM-dd'), sorter: true},
        {title: messages('finance.view.search.documentType'/*单据名称*/), dataIndex: 'formName', width: '13%', render: formName => (
          <Popover content={formName}>
            {formName}
          </Popover>
        ), sorter: true},
        {title: messages('finance.audit.reimbursement'/*报销单号*/) , dataIndex: 'childBusinessCode', width: '15%', render: (text, record, index) => {
          let showText = !record.parentBusinessCode && record.businessCode ||
            record.parentBusinessCode !== record.childBusinessCode && (record.parentBusinessCode + '-' + record.childBusinessCode) ||
            record.childBusinessCode;
          return (
            <Popover content={showText}>
              {showText}
            </Popover>
          )
        }, sorter: true},
        {title: messages('finance.view.search.currency'/*币种*/), dataIndex: 'currencyCode', width: '5%'},
        {title: messages('finance.view.search.totalAmount'/*总金额*/), dataIndex: 'totalAmount',width: '10%',
          render: (totalAmount, record) => {
            let showText = invoiceAmountChange(record.reviewedFlag, totalAmount);
            return (<Popover content={showText}>
              {showText}
            </Popover>)}, sorter: true},
        {title: (
          <Popover content={messages('finance.audit.payCurrency'/*支付币种*/)} overlayStyle={{ width: 100 }}>
            {messages('finance.audit.payCurrency'/*支付币种*/)}
          </Popover>
        ), dataIndex: 'baseCurrency', key: 'realCurrencyCode', width: '7%'},
        {title: messages('finance.audit.duePay'/*待支付金额*/), dataIndex: 'baseCurrencyRealPaymentAmount', render: this.filterMoney, width: '10%', sorter: true},
        {title:  (
            <Popover content={messages('finance.audit.journalNo'/*凭证编号*/)} overlayStyle={{ width: 100 }}>
              {messages('finance.audit.journalNo'/*凭证编号*/)}
            </Popover>
          ), width: '8%',dataIndex: 'origDocumentSequence', render: origDocumentSequence => (
          <Popover content={origDocumentSequence}>
            {origDocumentSequence}
          </Popover>
        )}
      ],
      borrowColumns: [
        {title: messages('finance.audit.serialNo'/*序号*/), dataIndex: "index", width: '5%'},
        {title: messages('finance.view.search.applicant'/*申请人*/), dataIndex: "applicantName", width: '10%'},
        {title: messages('finance.view.search.jobNumber')/*工号*/, dataIndex: "employeeID", width: '10%'},
        {title: messages('finance.view.search.submitDate'/*提交日期*/), dataIndex: "submittedDate", width: '10%', render: date => new Date(date).format('yyyy-MM-dd')},
        {
          title: messages('finance.view.search.documentType'/*单据名称*/), dataIndex: 'formName', width: '15%', render: formName => (
          <Popover content={formName}>
            {formName}
          </Popover>
        )
        },
        {title: messages('bookingManagement.businessCode'/*申请单号*/), dataIndex: 'businessCode', width: '15%'},
        {title: messages('finance.view.search.currency'/*币种*/), dataIndex: "currencyCode", width: '5%', render: text => text || this.props.companyConfiguration.currencyCode},
        {title: messages('finance.audit.duePay'/*待支付金额*/), dataIndex: "paymentAmount", width: '15%', render: this.filterMoney, sorter: true},
        {title: messages('finance.audit.journalNo'/*凭证编号*/), dataIndex: 'origDocumentSequence',width: '15%'}
      ],
      status: 'prending_pay',   //当前状态
      searchParams: {
        applicantOid: "",
        businessCode: "",
        corporationOids: [],
        endDate: null,
        startDate: null,
        status: "prending_pay"
      },
      data: [],    //列表值
      page: 0,
      pageSize: 10,
      loading: true,
      tabs: [
        {key: 'prending_pay', name:messages('confirm.payment.dueConfirm'/*待确认*/)},
        {key: 'pay_in_process', name:messages('confirm.payment.duePay'/*待付款*/)},
        {key: 'pay_finished', name:messages('finance.view.search.payed'/*已付款*/)}],
      nowType: 'INVOICE',
      pagination: {
        total: 0,
      },
      selectedDataOids: [], //已选择的列表项
      selectedDataItems: [],
      selectedDataNum:0,
      allSelectedStatus:false,
      rowSelection: {
        selectedRowKeys: [],
        onChange: this.onSelectChange,
        onSelect: this.onSelectItem,
        onSelectAll: this.onSelectAll
      },
      showCompanyBank: false,
      confirmLoading: false,
      expenseDetailRuter:menuRoute.getRouteItem('expense-report-detail-payment'),
      loadDetailRuter:menuRoute.getRouteItem('loan-request-detail-payment'),
      showOfferImportModal:false,
      dropDownSelectedKeys:"1",
      sort: '',
      buttonRoleSwitch:this.checkPageRole('EXPENSEPAYMENT', 2)
    };
  }

  //渲染Tab头
  renderTabs(){
    return (
      this.state.tabs.map(tab => {
        let returnObject = tab.key === 'pay_finished' ? <TabPane tab={`${tab.name}`} key={tab.key}/> :
          <TabPane tab={tab.name} key={tab.key}/>;
        return returnObject;
      })
    )
  }

  componentWillMount(){
    // let countResult = {};
    // this.state.tabs.map(item => {
    //   countResult[item.key] = {
    //     expenseReportCount: 0,
    //     loanApplicationCount: 0
    //   }
    // });
    this.getCache();
    // this.setState({count: countResult});
    // this.getCount();
    this.getCheckboxListForm();

  }
  //表单头处理
  tableHeaderDeal=() =>{
    let {columns,borrowColumns}=this.state;
    columns.filter(item=>item.dataIndex==="baseCurrencyRealPaymentAmount")[0].title=this.state.status==='pay_finished'?messages('finance.audit.finishPay'/*已支付金额*/):messages('finance.audit.duePay'/*待支付金额*/);
    borrowColumns.filter(item=>item.dataIndex==="paymentAmount")[0].title=this.state.status==='pay_finished'?messages('finance.audit.finishPay'/*已支付金额*/):messages('finance.audit.duePay'/*待支付金额*/);
    this.setState({columns:columns,borrowColumns:borrowColumns});
  }
  //Tab点击事件
  onChangeTabs = (key) => {
    let temp = this.state.searchParams;
    temp.status = key;
    key !== 'pay_finished' ? '' : this.payFinish();
    this.setState({
      loading: true,
      searchParams: temp,
      page: 0,
      status: key
    },()=>{
      this.handleData();
      this.tableHeaderDeal();
      this.clearRowSelection();
      this.child.handleSearch();
    });
  };

  //得到对应单据列表数据
  getList(firstRequest){
    const{ searchParams } = this.state;
    if(firstRequest){
      searchParams.startDate = moment().subtract(3, 'month').format('YYYY-MM-DD HH:mm:ss');
      searchParams.endDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    return httpFetch.post(`${config.baseUrl}/api/${this.state.nowType === 'INVOICE' ? 'v2/expense/reports' : 'loan/application'}/finance/admin/search?page=${this.state.page}&size=${this.state.pageSize}&sort=${this.state.sort}`,
      searchParams).then((response)=>{
      response.data.map((item, index)=>{
        item.index = this.state.page * this.state.pageSize + index + 1;
      });
      this.setState({
        data: response.data,
        loading: false,
        current: this.state.page + 1,
        pagination: {
          total: Number(response.headers['x-total-count']),
          current: this.state.page + 1
        }
      }, ()=>{
        this.refreshRowSelection()
      })
    })
  }

  //得到单据数量
  // getCount(){
  //   let result = {};
  //   let fetchArray = [];
  //   this.state.tabs.map(type => {
  //     type.key !== 'pay_finished' && (fetchArray.push(httpFetch.get(`${config.baseUrl}/api/finance/statistics/by/staus?status=${type.key}`).then(response => {
  //       result[type.key] = {
  //         expenseReportCount: response.data.expenseReportCount,
  //         loanApplicationCount: response.data.loanApplicationCount
  //       }
  //     })));
  //   });
  //   return Promise.all(fetchArray).then(()=>{
  //     this.setState({count: result});
  //     // this.refreshSearchCount(result[this.state.status].expenseReportCount, result[this.state.status].loanApplicationCount);
  //   })
  // }

  //刷新单据数量（搜索区域和分页）
  // refreshSearchCount(expenseReportCount, loanApplicationCount) {
  //   let temp = this.state.searchForm;
  //   let options = [
  //     {
  //       label: messages('finance.view.search.reimbursement'/*报销单*/) + (messages('finance.audit.totalNo', {total: expenseReportCount})/*共{expenseReportCount}笔*/),
  //       value: 'INVOICE'
  //     },
  //     {
  //       label: messages('finance.view.search.borrowingDocument'/*借款单*/) + (messages('finance.audit.totalNo', {total: loanApplicationCount})/*共{loanApplicationCount}笔*/),
  //       value: 'BORROW'
  //     }];
  //   defaultSearchForm[0].options=options;
  //   temp[0].options = options;
  //   this.setState({
  //     searchForm: temp
  //   });
  // }

  payFinish() {
    let temp = this.state.searchForm;
    let options = [
      {
        label: messages('finance.view.search.reimbursement'/*报销单*/),
        value: 'INVOICE'
      },
      {
        label: messages('finance.view.search.borrowingDocument'/*借款单*/),
        value: 'BORROW'
      }];
    defaultSearchForm[0].options=options;
    temp[0].options = options;
    this.setState({
      searchForm: temp
    });
  }

  //获取表单类型
  getCheckboxListForm(){
    let { checkboxListForm } =this.state;
    financeViewService.getExpenseTypeList().then(res => {
      let expenseForms=[];
      res.data.map(item => {
        expenseForms.push({label: item.formName, value: item.formOid})
      });
      if(this.state.nowType === 'INVOICE')
      checkboxListForm.items= [{label: messages('finance.audit.formType'/*表单类型*/), key: 'form', options:  expenseForms , checked: checkboxListForm.defaultValue}]
      this.setState({ expenseForms, checkboxListForm })
    });
    financeViewService.getLoanTypeList().then(res => {
      let loanForms=[];
      res.data.map(item => {
        loanForms.push({label: item.formName, value: item.formOid})
      });
      if(this.state.nowType !== 'INVOICE')
        checkboxListForm.items= [{label: messages('finance.audit.formType'/*表单类型*/), key: 'form', options:  loanForms , checked: checkboxListForm.defaultValue}]
      this.setState({ loanForms })
    });

  };

  //搜索
  search = (result) => {
    this.setCache(result);
    result.dateFromTrans = result.dateFrom ? result.dateFrom.format('YYYY-MM-DD 00:00:00') : undefined;
    result.dateToTrans = result.dateTo ? result.dateTo.format('YYYY-MM-DD 23:59:59') : undefined;
    let searchParams = {
      applicantOid: result.user,
      businessCode: result.formID,
      corporationOids: result.legalEntity,
      endDate: result.dateToTrans,
      startDate: result.dateFromTrans,
      status: this.state.status,
      formOids: result.formOids
    };
    this.setState({
      searchParams: searchParams,
      loading: true,
      page: result.page?result.page:0,
    }, () => {
      if(ifClearRowSelect){this.clearRowSelection()};
      ifClearRowSelect=true;
      this.getList();
    })
  };
  //子组件this
  onRef = (ref) =>{
    this.child=ref;
  }
  //存储筛选数据缓存
  setCache(result){
    let {status,page} = this.state;
    result.tabsStatus = status;
    result.page = page;
    cacheSearchData=result;
  }
  //获取筛选数据缓存
  getCache(){
    let result=this.props.financePayment;
    if(result&&JSON.stringify(result) !== "{}"){
      cacheSearchData=result;
      this.dealCache(result);
    }
    else{
      defaultSearchForm=deepFullCopy(this.state.searchForm)
      defaultCheckboxListForm=deepFullCopy(this.state.checkboxListForm)
      this.getList(true)
    }

  };
  //处理筛选缓存数据
  dealCache(result) {
    let {status, searchForm, nowType, page, checkboxListForm} = this.state;
    defaultSearchForm=deepFullCopy(searchForm);
    defaultCheckboxListForm=deepFullCopy(checkboxListForm)
    if (result) {
      status = result.tabsStatus;
      nowType = result.type;
      page = result.page;
      checkboxListForm.defaultValue=result['formOidsLable'] || [];
      checkboxListForm.formOidsExpand=result['formOidsExpand'];
      dealCache(searchForm, result);
      this.setState({status, nowType, searchForm, page}, () => {
        this.search(result);
        this.tableHeaderDeal();
        this.props.dispatch({
          type: 'cache/setFinancePayment',
          financePayment: null
        });
      })
    }
  }

  //清空搜索区域
  clear = () => {
    cacheSearchData = {};
    let forms=['dateRange'];
    defaultSearchForm.map(item=>{
      if(~forms.indexOf(item.id)){
        item.items.map(dateItem => {
          dateItem.defaultValue = null;
        });
      }
    });
    this.setState({
      searchForm:defaultSearchForm,
      searchParams: {
        applicantOid: "",
        businessCode: "",
        corporationOids: [],
        endDate: null,
        startDate: null,
        status: this.state.status
      }, nowType: 'INVOICE', dropDownSelectedKeys: '1'
    }, () => {
      this.handleData();
      this.getList();
      this.tableHeaderDeal();
    })
  };
  //渲染处理数据源
  handleData = () => {
    let { nowType, checkboxListForm, expenseForms, loanForms,status,searchForm} = this.state;
    if(checkboxListForm.items[0]){
      checkboxListForm.items[0].options=(nowType === 'INVOICE' ? expenseForms : loanForms);
    }
    searchForm.map(item=>{
      if(item.id==='formID'){
        let url = config.baseUrl;
        if (nowType === 'INVOICE') {
          url += `/api/expense/report/search`;
        } else {
          url += `/api/loan/application/search`
        }
        item.searchUrl = url;
        item.getParams = {status: status};
      }
    })
    this.setState({checkboxListForm,searchForm})
  }

  //搜索区域点击事件
  searchEventHandle = (event, value, valuesTmp) => {
    switch(event){
      case 'CHANGE_TYPE': {
        if(value === this.state.nowType)
          return;
        let { checkboxListForm, expenseForms, loanForms } = this.state;
        checkboxListForm.items = [{label: messages('finance.audit.formType'/*表单类型*/), key: 'form', options: value === 'INVOICE' ? expenseForms : loanForms, checked: []}];
        this.setState({page: 0,dropDownSelectedKeys:'1', nowType: value, loading: true}, ()=>{
          this.clearRowSelection();
          this.handleData();
          valuesTmp.type=value;
          valuesTmp.typeLable=value;
          this.search(valuesTmp);
        });
        break;
      }
    }
  };

  //跳转单据详情
  handleRowClick = (record) =>{
    const { nowType, status, expenseDetailRuter, loadDetailRuter } = this.state;
    let url = '';
    if(nowType === 'INVOICE')
      url = expenseDetailRuter.url.replace(':expenseReportOid', record.expenseReportOid).replace(':backType','history');
    else
      url = loadDetailRuter.url.replace(':formOid', record.formOid).replace(':applicationOid', record.applicationOid).replace(':backType','history');
    status === 'prending_pay' && (url += `?prending_pay=true`);
    status === 'pay_in_process' && (url += `?pay_in_process=true`);
    this.props.dispatch({
      type: 'cache/setFinancePayment',
      financePayment: cacheSearchData
    });
    this.context.router.push(url);
  }

  //列表选择更改
  onSelectChange = (selectedRowKeys) => {
    let { rowSelection } = this.state;
    rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({ rowSelection });
  };

  /**
   * 选择单个时的方法，遍历selectedData，根据是否选中进行插入或删除操作
   * @param record 被改变的项
   * @param selected 是否选中
   */
  onSelectItem = (record, selected) => {
    let { selectedDataOids,dropDownSelectedKeys,selectedDataNum,rowSelection,selectedDataItems } = this.state;
    if(dropDownSelectedKeys !== '1'){
        if(!selected){
          selectedDataOids.push(record.expenseReportOid||record.applicationOid);
          selectedDataItems.push(record);
          selectedDataNum-=1;
        } else {
          selectedDataOids.map((selected, index) => {
            if(selected === (record.expenseReportOid||record.applicationOid)){
              selectedDataOids.splice(index, 1);
            }
          })
          selectedDataItems.map((selected, index) => {
            if(record.expenseReportOid ? selected.expenseReportOid === record.expenseReportOid : selected.applicationOid === record.expenseReportOid){
              selectedDataItems.splice(index, 1);
            }
          });
          selectedDataNum+=1;
        }
      }
    else{
        if(!selected){
          selectedDataOids.map((selected, index) => {
            if(selected === (record.expenseReportOid||record.applicationOid)){
              selectedDataOids.splice(index, 1);
              selectedDataNum-=1;
            }
          })
          selectedDataItems.map((selected, index) => {
            if(record.expenseReportOid ? selected.expenseReportOid === record.expenseReportOid : selected.applicationOid === record.expenseReportOid){
              selectedDataItems.splice(index, 1);
            }
          });
        } else {
          selectedDataOids.push(record.expenseReportOid||record.applicationOid);
          selectedDataItems.push(record);
          selectedDataNum+=1;
        }
    }
    this.setState({ selectedDataOids, selectedDataNum:selectedDataNum, rowSelection:rowSelection, selectedDataItems});
  };

  //选择当页全部时的判断
  onSelectAll = (selected, selectedRows, changeRows) => {
    let {data,dropDownSelectedKeys,selectedDataNum,selectedDataOids,selectedDataItems} = this.state;
    if(dropDownSelectedKeys !== '1'){
      if(!selected){
        changeRows.map(item => {
          selectedDataOids.addIfNotExist(item.expenseReportOid||item.applicationOid);
          selectedDataItems.addIfNotExist(item);
        });
        selectedDataNum=selectedDataNum-changeRows.length;
      } else {
        changeRows.map(item => {
          selectedDataOids.delete(item.expenseReportOid||item.applicationOid);
          selectedDataItems.delete(item);
        });
        selectedDataNum=selectedDataNum+changeRows.length;
      }
    }
    else{
      if(!selected){
        changeRows.map(item => {
          selectedDataOids.delete(item.expenseReportOid||item.applicationOid);
          selectedDataItems.delete(item);
        });

      } else {
        selectedRows.map(item => {
          selectedDataOids.addIfNotExist(item.expenseReportOid||item.applicationOid);
          selectedDataItems.addIfNotExist(item);
        });
      }
      selectedDataNum=selectedDataOids.length;
    }
    this.setState({selectedDataNum:selectedDataNum,selectedDataOids:selectedDataOids,selectedDataItems});
  };

  renderExpandedRow = (title, content) => {
    return (
      <div>
        <span>{title}</span>:
        <span>{content}</span>
      </div>
    )
  };

  renderAllExpandedRow = (record) =>{
    let result = [];
    if(record.warningList){
      let warningList=JSON.parse(record.warningList);
      let content = '';
      warningList.map(item => {
        if (item.showFlag) {
          content += item.title + '/'
        }
      });
      content && result.push(this.renderExpandedRow(messages('common.label'), content.substr(0, content.length - 1)));
    }
    if(record.printFree){
      result.push(this.renderExpandedRow(messages('common.print.free'), messages('common.print.require')));
    }
    if(result.length>0){
      return result;
    }else{
      return null;
    }
  };


  //换页后根据Oids刷新选择框
  refreshRowSelection(){
    let { selectedDataOids, data, rowSelection ,dropDownSelectedKeys,allSelectedStatus} = this.state;
    let nowSelectedRowKeys = [];
    if(dropDownSelectedKeys !== '1'){
        data.map(item => {
          rowSelection.selectedRowKeys.addIfNotExist(item.expenseReportOid||item.applicationOid);
        });
        selectedDataOids.map(selected => {
          rowSelection.selectedRowKeys.delete(selected);
        });
    }
    else{
      selectedDataOids.map(selected => {
        data.map(item => {
          if(selected === item.expenseReportOid || selected === item.applicationOid)
            nowSelectedRowKeys.push(item.expenseReportOid||item.applicationOid)
        })
      });
      rowSelection.selectedRowKeys = nowSelectedRowKeys;
    }

    this.setState({ rowSelection });
  }
  //全选当页或全选全部
  renderDropDown(){
    return (
      <Menu onClick={this.dropDownChange}	>
        <Menu.Item key="1">{messages('confirm.payment.choosePage'/*全选当页*/)}</Menu.Item>
        <Menu.Item key="2">{messages('confirm.payment.chooseAll'/*全选全部*/)}</Menu.Item>
      </Menu>
    )
  };

  //全选菜单更改
  dropDownChange = (item) => {
    let {rowSelection, dropDownSelectedKeys, data, selectedDataItems} = this.state;
    if (dropDownSelectedKeys === item.key) {
      return;
    }
    rowSelection.selectedRowKeys = [];
    selectedDataItems = [];
    let selectedDataNum=0;
    if(item.key !== '1'){
      selectedDataNum = this.state.pagination.total;
      rowSelection.selectedRowKeys = this.getSelectOid(data);
      selectedDataItems = this.getSelectItem(data);
    };
    this.setState({selectedDataOids: [], selectedDataItems, selectedDataNum:selectedDataNum, dropDownSelectedKeys: item.key, rowSelection: rowSelection});
  };
  //分页时将单据都push到tempoOid,用于判断分页时单据是否为选中状态
  getSelectOid=(data)=>{
    var tempOid = [];
    tempOid = data.map(item => {
      return item.expenseReportOid || item.applicationOid;
    });
    return tempOid;
  };

  getSelectItem = (data) => {
    var tempItem = [];
    tempItem = data.map(item => {
      return item;
    });
    return tempItem;
  };

  //清空选择框
  clearRowSelection(){
    let { rowSelection } = this.state;
    rowSelection.selectedRowKeys = [];
    this.setState({rowSelection:rowSelection,selectedDataNum:0,selectedDataOids:[], selectedDataItems : [],dropDownSelectedKeys:'1'});
  }

  //提交成功
  confirmSuccess(){
    notification.open({
      message: messages('confirm.payment.confirmSuccess'/*确认付款成功！*/),
      // description: `您有${this.state.selectedDataNum}笔单据确认付款成功:)`,
      description: messages(this.state.status==='prending_pay'?'confirm.payment.paySuccess':'confirm.payment.confirmPaySuccess',{total:this.state.selectedDataNum}/*确认付款成功！*/),// `您有${this.state.selectedDataNum}笔单据确认付款成功:)`,
      icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />,
    });
    let {rowSelection,selectedDataNum}=this.state;
    rowSelection.selectedRowKeys=[];
    this.setState({loading: true});
    this.setState({rowSelection:rowSelection,selectedDataNum:0,selectedDataOids:[], selectedDataItems : [],dropDownSelectedKeys:'1'},()=>{
      // this.getCount();
      this.clearRowSelection();
      this.getList();
    });
  }

  getSubmitData = () => {
    let selectedEntityOids = [];
    let excludedEntityOids = [];
    let { selectedDataOids, searchParams }=this.state;
    let pageType='current_page';
    let entityType=1001;
    /*当页全选和全部全选*/
    if(this.state.dropDownSelectedKeys==='1'){
      selectedEntityOids=selectedDataOids;
    }
    else{
      excludedEntityOids=selectedDataOids;
      pageType='all_page';
    }
    if(this.state.nowType!='INVOICE')
    {
      entityType=1002;
    }
    return {
      businessCode: searchParams.businessCode ? searchParams.businessCode : null,
      comment: null,
      corporationOids: searchParams.corporationOids ? searchParams.corporationOids : [],
      endDate: searchParams.endDate ? searchParams.endDate : null,
      entityOids: selectedEntityOids,
      entityType: entityType,
      excludedEntityOids: excludedEntityOids,
      formOids: searchParams.formOids ? searchParams.formOids : [],
      selectMode: pageType,
      startDate: searchParams.startDate ? searchParams.startDate : null,
      status: this.state.status,
      applicantOid: searchParams.applicantOid ? searchParams.applicantOid : null
    }
  };

  //提交
  submit = () => {
    confirmPaymentService.confirmPayment(this.state.status, this.getSubmitData()).then(()=>{
      this.setState({confirmLoading: false});
      this.confirmSuccess();
    }).catch((e)=>{
      this.setState({confirmLoading: false});
      if(e.response.data.errorCode){
        notification.open({
          message: messages('confirm.payment.payFailure'/*确认付款失败！*/),
          description: e.response.data.message,
          icon: <Icon type="frown-circle" style={{ color: '#e93652' }} />,
        });
      }
      else{
        if(e.name === 'SyntaxError')
          this.confirmSuccess();
        else
          notification.open({
            message: messages('confirm.payment.payFailure'/*确认付款失败！*/),
            description: messages('common.error'/*可能是服务器出了点问题:(*/),
            icon: <Icon type="frown-circle" style={{ color: '#e93652' }} />,
          });
      }
    })
  };

  //点击确认付款
  handleConfirm = () => {
    this.setState({confirmLoading: true});
    if(this.state.status === 'prending_pay' && this.checkFunctionProfiles('pay.choice.banknum', true)){
      this.setState({ showCompanyBank: true })
    } else {
      this.submit();
    }
  };

  //导入报盘文件
  openOfferImport = (flag) =>{
    this.setState({showOfferImportModal:flag})
  };

  importOfferFile = () =>{
    this.openOfferImport(false);
    // this.getCount();
    this.getList();
  };

  cancelOfferImport = () =>{
    this.setState({showOfferImportModal:false})
  };

  handleConfirmBank = () => {
    this.setState({ showCompanyBank: false, confirmLoading: false })
    this.confirmSuccess();
  };
  handleTableChange = (pagination, filters, sorter) => {
    let page =  pagination.current;
    let sort = '';
    if(sorter.order){
      sort = `${sorter.columnKey},${sorter.order === 'ascend' ? 'ASC' : 'DESC'}`
    }
    this.setState({
      page: page - 1,
      loading: true,
      sort
    }, ()=>{
      ifClearRowSelect=false;
      this.child.handleSearch();
    })
  };

  render(){
    const { nowType,searchForm, buttonRoleSwitch,checkboxListForm, columns,borrowColumns, data, loading, pagination, selectedDataNum,status, confirmLoading, rowSelection, showCompanyBank,dropDownSelectedKeys, selectedDataItems} = this.state;
    let totalObject = {};
    selectedDataItems.map(item => {
      totalObject[item.currencyCode] ? totalObject[item.currencyCode] += parseFloat(this.filterMoney(item.totalAmount || item.paymentAmount,2,true).replace(',','')) : totalObject[item.currencyCode] = parseFloat(this.filterMoney(item.totalAmount || item.paymentAmount,2,true).replace(',',''));
    });
    return (
      <div className="confirm-payment">
        <Tabs onChange={this.onChangeTabs} defaultActiveKey={status}>
          {this.renderTabs()}
        </Tabs>
        <SearchArea
          onRef={this.onRef}
          searchForm={searchForm}
          checkboxListForm={[checkboxListForm]}
          submitHandle={this.search}
          clearHandle={this.clear}
          isReturnLabel={true}
          eventHandle={this.searchEventHandle}/>
        <div className="divider"/>
        <div className="table-header">
          <div className="table-header-title">
            {messages('common.total1',{total:pagination.total}/*共 {pagination.total} 条数据*/)}
            {status !== 'pay_finished' &&
              <span>/{messages('common.total.selected', {total: selectedDataNum}/*已选{selectedDataNum}条*/)}</span>
            }
            {
              selectedDataNum > 0 && dropDownSelectedKeys === '1' &&
              <span className="show-money">
                ,{messages('check.center.total.amt'/*合计金额*/)}&nbsp;&nbsp;
                {
                  Object.keys(totalObject).map(item => {
                    return <span className="money-style">{item}{this.filterMoney(totalObject[item],2,true)}&nbsp;&nbsp;</span>
                  })
                }
              </span>
            }
          </div>
          <div className="table-header-buttons">
            {
              status !== 'pay_finished' && buttonRoleSwitch &&
              <Dropdown overlay={this.renderDropDown()} placement="bottomCenter">
                <Button>{dropDownSelectedKeys === '1' && messages('confirm.payment.choosePage'/*全选当页！*/) || messages('confirm.payment.chooseAll'/*全选全部！*/)}</Button>
              </Dropdown>
            }
            { (status !== 'pay_finished' && buttonRoleSwitch &&
              this.checkFunctionProfiles(['web.financial.approval.sure.pay.disabled'], [[false, undefined]]))
              && <Button type="primary" onClick={this.handleConfirm} disabled={selectedDataNum === 0}
                      loading={confirmLoading}>{status === 'pay_in_process' ? messages('confirm.payment.confirmPaid'/*确认已付款！*/)  : messages('confirm.payment.confirmPay'/*确认付款！*/) }</Button>
            }
            { status  === 'pay_in_process' && buttonRoleSwitch &&
            this.checkFunctionProfiles(['web.financial.approval.import.offer.disabled'], [[false, undefined]]) && <Button onClick={()=>this.openOfferImport(true)}>{messages('confirm.payment.importOffer'/*导入报盘文件！*/)}</Button>}
          </div>
        </div>
        <Table columns={nowType === 'INVOICE'&& columns || borrowColumns}
               dataSource={data}
               rowSelection={(status !== 'pay_finished' && buttonRoleSwitch) ? rowSelection : undefined}
               pagination={pagination}
               loading={loading}
               bordered
               onRow={record =>({onClick: ()=> this.handleRowClick(record)})}
               onChange={this.handleTableChange}
               expandedRowRender = { this.renderAllExpandedRow }
               rowClassName = {record => record.printFree ||  record.warningList ? '' :'finance-payment-reject' }
               rowKey={nowType === 'INVOICE' ? 'expenseReportOid' : 'applicationOid'}
               size="middle"/>

        <Importer
          visible={this.state.showOfferImportModal}
          title={messages('confirm.payment.exportOffer'/*报盘导入！*/)}
          uploadUrl={`${config.baseUrl}/api/reimbursement/batch/pay/finished/confirm/by/nacha`}
          createTableShow={false}
          multiple={true}
          listentSwitch={true}
          onOk={this.importOfferFile}
          afterClose={() => this.openOfferImport(false)}
        />

        <CompanyBankSelector visible={showCompanyBank}
                             data={this.getSubmitData()}
                             onOk={this.handleConfirmBank}
                             onCancel={() => this.setState({ showCompanyBank: false, confirmLoading: false })}/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
    companyConfiguration: state.login.companyConfiguration,
    financePayment: state.cache.financePayment,
  }
}
ConfirmPayment.contextTypes = {
  router: React.PropTypes.object
};

export default connect(mapStateToProps, null, null, { withRef: true })(ConfirmPayment);
