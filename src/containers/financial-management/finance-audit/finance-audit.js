
import React from 'react'
import { connect } from 'dva'


import {  Button, Tabs, Popover } from 'antd'
import Table from 'widget/table'

const TabPane = Tabs.TabPane;
import { routerRedux } from 'dva/router';

import httpFetch from 'share/httpFetch'
import config from 'config'
import 'styles/financial-management/finance-audit/audit.scss'
import SearchArea from 'widget/search-area'
import { invoiceAmountChange, dealCache, removeArryItem, deepFullCopy } from "utils/extend";
import { message, Modal } from "antd/lib/index";
import ReconnectingWebSocket from "reconnectingwebsocket";
let cacheSearchData = {};
let defaultSearchForm = [];
let defaultCheckboxListForm = {};

class FinanceAudit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: 0,
      pageSize: 10,
      data: [],
      hasConfirm: false,
      expenseDetailAudit: '/financial-management/finance-audit/expense-report-detail-audit/:expenseReportOid/:backType',
      loanDetailAudit: '/financial-management/finance-audit/loan-request-detail-audit/:formOid/:applicationOid/:backType',
      scanAudit: '/financial-management/finance-audit/scan-audit',
      scanGunAudit: '/financial-management/finance-audit/scan-gun-audi',
      pagination: {
        total: 0
      },
      invoiceColumns: [
        { title: this.$t('finance.audit.serialNo'/*序号*/), dataIndex: "index", width: '5%' },
        { title: this.$t('finance.view.search.jobNumber')/*工号*/, dataIndex: "employeeID", width: '10%' },
        { title: this.$t('finance.view.search.applicant'/*申请人*/), dataIndex: "applicantName", width: '10%' },
        { title: this.$t('finance.view.search.submitDate'/*提交日期*/), dataIndex: "submittedDate", width: '10%', render: date => new Date(date).format('yyyy-MM-dd'), sorter: true },
        {
          title: this.$t('finance.view.search.documentType'/*单据名称*/), dataIndex: 'formName', width: '10%', render: formName => (
            <Popover content={formName}>
              {formName}
            </Popover>
          ), sorter: true
        },
        {
          title: this.$t('finance.audit.reimbursement'/*报销单号*/), dataIndex: 'childBusinessCode', width: '15%', render: (text, record, index) => {
            let showText = !record.parentBusinessCode && record.businessCode ||
              record.parentBusinessCode !== record.childBusinessCode && (record.parentBusinessCode + '-' + record.childBusinessCode) ||
              record.childBusinessCode;
            return (
              <Popover content={showText}>
                {showText}
              </Popover>
            )
          }, sorter: true
        },
        { title: this.$t('finance.view.search.currency'/*币种*/), dataIndex: "currencyCode", width: '10%' },
        {
          title: this.$t('finance.view.search.totalAmount'/*总金额*/), dataIndex: "totalAmount", width: '10%',
          render: (totalAmount, record) => {
            let showText = invoiceAmountChange(record.reviewedFlag, totalAmount);
            return (<Popover content={showText}>
              {showText}
            </Popover>)
          },
          sorter: true
        },
        {
          title: (
            <Popover content={this.$t('finance.audit.payCurrency'/*支付币种*/)} overlayStyle={{ width: 100 }}>
              {this.$t('finance.audit.payCurrency'/*支付币种*/)}
            </Popover>
          ), dataIndex: "baseCurrency", width: '10%'
        },
        { title: this.$t('finance.audit.duePay'/*待支付金额*/), dataIndex: "baseCurrencyRealPaymentAmount", width: '10%', render: this.duePay, sorter: true },
      ],
      borrowColumns: [
        { title: this.$t('finance.audit.serialNo'/*序号*/), dataIndex: "index", width: '5%' },
        { title: this.$t('finance.view.search.jobNumber')/*工号*/, dataIndex: "employeeID", width: '10%' },
        { title: this.$t('finance.view.search.applicant'/*申请人*/), dataIndex: "applicantName", width: '10%' },
        { title: this.$t('finance.view.search.submitDate'/*提交日期*/), dataIndex: "submittedDate", width: '10%', render: date => new Date(date).format('yyyy-MM-dd') },
        {
          title: this.$t('finance.view.search.documentType'/*单据名称*/), dataIndex: 'formName', width: '15%', render: formName => (
            <Popover content={formName}>
              {formName}
            </Popover>
          )
        },
        { title: this.$t('bookingManagement.businessCode'/*申请单号*/), dataIndex: 'businessCode', width: '15%' },
        { title: this.$t('finance.view.search.currency'/*币种*/), dataIndex: "currencyCode", width: '10%', render: text => text || this.props.company.baseCurrency },
        { title: this.$t('finance.audit.duePay'/*待支付金额*/), dataIndex: "paymentAmount", width: '10%', render: this.duePay },
      ],
      nowType: 'INVOICE',
      status: 'prending_audit',   //当前状态
      tabs: [
        { key: 'prending_audit', name: this.$t('finance.audit.dueAudit'/*待审核*/) },
        { key: 'audit_pass', name: this.$t('finance.audit.audited'/*已审核*/) }],
      searchParams: {
        applicantOid: null,
        businessCode: null,
        corporationOids: [],
        endDate: null,
        startDate: null
      },
      searchForm: [
        {
          type: 'radio',
          id: 'type',
          label: this.$t('finance.view.search.documentType'/*单据名称*/),
          options: [
            { label: this.$t('finance.view.search.reimbursement'/*报销单*/), value: 'INVOICE' },
            { label: this.$t('finance.view.search.borrowingDocument'/*借款单*/), value: 'BORROW' }],
          event: 'CHANGE_TYPE',
          defaultValue: 'INVOICE'
        },
        {
          type: 'items',
          id: 'dateRange',
          items: [
            { type: 'date', id: 'dateFrom', label: this.$t('finance.view.search.dateFrom') }, //提交日期从
            { type: 'date', id: 'dateTo', label: this.$t('finance.view.search.dateTo') } //提交日期至
          ]
        },
        {
          type: 'items',
          id: 'approvalDateRange',
          items: [
            { type: 'date', id: 'approvalStartDate', label: this.$t('finance.view.search.approvalDateFrom') }, //审批日期从
            { type: 'date', id: 'approvalEndDate', label: this.$t('finance.view.search.approvalDateTo') } //审批日期至
          ]
        },
        {
          type: 'combobox', id: 'formID', label: this.$t('finance.view.search.documentNo'/*单号*/),
          placeholder: this.$t('common.please.enter') + this.$t('finance.view.search.documentNo'),
          options: [],
          searchUrl: `${config.baseUrl}/api/expense/report/search`,
          method: 'get',
          searchKey: 'keyword', getParams: { status: 'prending_audit' }, labelKey: '_self', valueKey: '_self'
        },
        {
          type: 'combobox',
          id: 'user',
          label: this.$t('finance.audit.employee'/*员工*/),
          placeholder: this.$t('common.please.enter') + this.$t('finance.view.search.application'/*请输入姓名／工号*/),
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
          label: this.$t('finance.audit.legalEntity'/*法人实体*/),
          options: [],
          getUrl: `${config.baseUrl}/api/v2/my/company/receipted/invoices?page=0&size=100`,
          method: 'get',
          labelKey: 'companyName',
          valueKey: 'companyReceiptedOid'
        }
      ],
      printFreeForm: {
        type: 'select',
        id: 'printFree',
        label: this.$t('finance.audit.weatherPrint')/*是否免打印*/,
        options: [
          { label: this.$t('finance.audit.all')/*全部*/, value: 'null' },
          { label: this.$t('finance.audit.printFree')/*免打印*/, value: 'true' },
          { label: this.$t('finance.audit.noPrintFree')/*非免打印*/, value: 'false' }]
      },
      expenseForms: [],
      loanForms: [],
      checkboxListForm: { id: 'formOids', items: [] },
      sort: '',
      isPrintFreeSearch: false,
    };
    this.connector = null;
    this.data = [];
  }
  componentWillMount() {
    if (this.connector)
      this.connector.close();
    this.openWebSocket();
    let params = [
      { factorCode: "COMPANY", factorValue: this.props.user.companyId },
      { factorCode: "SET_OF_BOOKS", factorValue: this.props.company.setOfBooksId }
    ];
    httpFetch.post(`${config.baseUrl}/config/api/config/hit/EXPENSE_REPORT_PRINT_FREE?tenantId=${this.props.user.tenantId}`, params).then(res => {
      if (res.data.rows[0].hitValue === 'Y') {
        let search = this.state.searchForm;
        defaultSearchForm.push(JSON.parse(JSON.stringify(this.state.printFreeForm)))
        this.state.printFreeForm.defaultValue = cacheSearchData['printFreeLable'];
        if (this.state.nowType === 'INVOICE') search.push(this.state.printFreeForm);
        this.setState({ searchForm: search, isPrintFreeSearch: true });
      }
    });
    // let countResult = {};
    // this.state.tabs.map(item => {
    //   countResult[item.key] = {
    //     expenseReportCount: 0,
    //     loanApplicationCount: 0
    //   }
    // });
    this.setState({
      //this.props.location.query.tab
      status: undefined || 'prending_audit'
    }, () => {
      this.getCache();
      // this.getCount();
      this.getForms();
    })
  }
  componentWillUnmount = () => {
    if (this.connector)
      this.connector.close();
  };

  //webSocket读图审核开始
  openWebSocket = () => {
    let url = `${config.wsUrl}/ws/scancode?scanMode=REVIEW`;
    this.connector = new ReconnectingWebSocket(url);
    this.connector.onopen = this.onOpen;
    this.connector.onerror = this.onError;
    this.connector.onmessage = this.onMessage;
    this.connector.onclose = this.onClose;
  };

  onOpen = () => {
    let body = {
      userOid: this.props.user.userOid,
      token: sessionStorage.getItem('token')
    };
    let dict = {
      command: 'AUTH',
      body: JSON.stringify(body)
    };
    let dataSend = JSON.stringify(dict) + '\0';
    this.connector.send(dataSend);
  };

  onError = (error) => {
    this.setState({ connectStatus: false })
  };

  onMessage = (message) => {
    this.data.push(message.data);
    this.analyseData();
  };

  onClose = () => {
    if (this.state.connectStatus)
      this.setState({ connectStatus: false });
  };

  analyseData = () => {
    let lastReceive = this.data.pop();
    let end = '\0';
    if (lastReceive.indexOf(end) === -1) {
      this.data.push(lastReceive);
      return;
    }
    let temp = lastReceive.split(end);
    let expense = JSON.parse(this.data.join('') + temp[0]);
    if (temp[1] !== '') {
      this.data = [];
      this.data.push(temp[1]);
    }
    if (expense.command === 'ERROR') {
      if (this.state.hasConfirm)
        return;
      this.setState({ hasConfirm: true });
      Modal.confirm({
        title: 'Oops',
        content: expense.body,
        okText: this.$t('finance.audit.reconnect')/*重连*/,
        cancelText: this.$t('common.cancel')/*取消*/,
        onOk: () => {
          this.setState({ hasConfirm: false });
        },
        onCancel: () => {
          this.setState({ hasConfirm: false });
          this.data = [];
          this.connector.close();
        }
      })
    }
    expense.body = JSON.parse(expense.body);

    if (!expense.body || !expense.body.type || !expense.body.content) return;
    if (expense.command !== 'MESSAGE') return;
    let content = expense.body.content.split(':');
    if ('AUTH_SUCCESS' === expense.body.type) {
      this.setState({ connectStatus: true });
    } else if ('EXPENSE_REPORT_REVIEW' === expense.body.type) {
      let { status, expenseDetailAudit } = this.state;
      let url = expenseDetailAudit.replace(':expenseReportOid', content[0]).replace(':backType', 'history');
      url += `?prending_audit=true`;
      this.props.dispatch({
        type: 'cache/setFinanceAudit',
        payload: cacheSearchData,
      });
      this.props.dispatch(
        routerRedux.push({ pathname: url })
      )
    }
  };
  //webSocket读图审核结束
  //得到单据数量
  // getCount() {
  //   let result = {};
  //   let fetchArray = [];
  //   this.state.tabs.map(type => {
  //     fetchArray.push(httpFetch.get(`${config.baseUrl}/api/finance/statistics/by/staus?status=${type.key}`).then(response => {
  //       result[type.key] = {
  //         expenseReportCount: response.data.expenseReportCount,
  //         loanApplicationCount: response.data.loanApplicationCount
  //       }
  //     }));
  //   });
  //   return Promise.all(fetchArray).then(() => {
  //     this.setState({count: result});
  //     this.refreshSearchCount(result[this.state.status].expenseReportCount, result[this.state.status].loanApplicationCount);
  //   })
  // }

  duePay = (record) => {
    let number = this.filterMoney;
    return (<Popover content={number(record)}>{number(record)}</Popover>)
  }

  //刷新单据数量（搜索区域和分页）
  // refreshSearchCount(expenseReportCount, loanApplicationCount) {
  //   let temp = this.state.searchForm;
  //   let options= [
  //     {label: this.$t('finance.view.search.reimbursement'/*报销单*/)+(this.$t('finance.audit.totalNo',{total:expenseReportCount})/*共{expenseReportCount}笔*/), value: 'INVOICE'},
  //     {label: this.$t('finance.view.search.borrowingDocument'/*借款单*/)+(this.$t('finance.audit.totalNo',{total:loanApplicationCount})/*共{loanApplicationCount}笔*/), value: 'BORROW'}];
  //   temp[0].options =options;
  //   defaultSearchForm[0].options=options;
  //   this.setState({
  //     searchForm: temp,
  //   });
  // }

  getList = () => {
    this.setState({ loading: true });
    let temp = this.state.searchParams;
    temp.status = this.state.status;
    httpFetch.post(`${config.baseUrl}/api/${this.state.nowType === 'INVOICE' ? 'v2/expense/reports' : 'loan/application'}/finance/admin/search?page=${this.state.page}&size=${this.state.pageSize}&sort=${this.state.sort}`, temp).then(res => {
      let data = res.data.map((item, index) => {
        item.index = this.state.page * this.state.pageSize + index + 1;
        return item;
      });
      this.setState({
        loading: false,
        data,
        pagination: {
          total: Number(res.headers['x-total-count']),
          current: this.state.page + 1
        }
      });
    })
  };

  getForms = () => {
    let { checkboxListForm } = this.state;
    Promise.all([
      httpFetch.get(`${config.baseUrl}/api/custom/forms/company/expense/report/all?enabledFlag=2`),
      httpFetch.get(`${config.baseUrl}/api/custom/forms/company/loan/application/all?enabledFlag=2`)
    ]).then(res => {
      let expenseForms = [];
      let loanForms = [];
      res[0].data.map(item => {
        expenseForms.push({ label: item.formName, value: item.formOid })
      });
      res[1].data.map(item => {
        loanForms.push({ label: item.formName, value: item.formOid })
      });
      checkboxListForm.items = [{ label: this.$t('finance.audit.formType'/*表单类型*/), key: 'form', options: this.state.nowType === 'INVOICE' ? expenseForms : loanForms, checked: checkboxListForm.defaultValue }];
      defaultCheckboxListForm.items = [{ label: this.$t('finance.audit.formType'/*表单类型*/), key: 'form', options: this.state.nowType === 'INVOICE' ? expenseForms : loanForms, checked: checkboxListForm.defaultValue }];
      this.setState({ expenseForms, loanForms, checkboxListForm })
    })
  };

  handleClickSwitch = () => {
    this.props.dispatch(
      routerRedux.push({ pathname: '/financial-management/finance-audit/scan-audit' })
    );
  };

  handleClickSwitchGun = () => {
    this.props.dispatch(
      routerRedux.push({ pathname: '/financial-management/finance-audit/scan-gun-audit' })
    );
  };

  //渲染Tab头
  renderTabs() {
    return (
      this.state.tabs.map(tab => {
        // let typeCount = this.state.count[tab.key];
        return <TabPane tab={`${tab.name}`}
          key={tab.key} />
      })
    )
  }

  //渲染处理数据源
  handleData = () => {
    let { invoiceColumns, borrowColumns, status, isPrintFreeSearch, nowType, printFreeForm, searchForm, checkboxListForm, expenseForms, loanForms } = this.state;
    if (checkboxListForm.items[0]) {
      checkboxListForm.items[0].options = (nowType === 'INVOICE' ? expenseForms : loanForms);
    }
    searchForm.map(item => {
      if (item.id === 'formID') {
        let url = config.baseUrl;
        if (nowType === 'INVOICE') {
          url += `/api/expense/report/search`;
        } else {
          url += `/api/loan/application/search`
        }
        item.searchUrl = url;
        item.getParams = { status: status };
      }
    });
    removeArryItem(searchForm, searchForm.filter(item => item.id === 'printFree')[0]);
    if (isPrintFreeSearch && nowType === 'INVOICE') {
      searchForm.push(printFreeForm);
    }
    if (status === 'audit_pass') {
      if (invoiceColumns[invoiceColumns.length - 1].dataIndex != "origDocumentSequence")
        invoiceColumns.push({
          title: this.$t('finance.audit.journalNo'/*凭证编号*/),
          dataIndex: "origDocumentSequence",
          width: '9%'
        });
      if (borrowColumns[borrowColumns.length - 1].dataIndex != "origDocumentSequence")
        borrowColumns.push({
          title: this.$t('finance.audit.journalNo'/*凭证编号*/),
          dataIndex: "origDocumentSequence",
          width: '9%'
        });
    } else {
      removeArryItem(invoiceColumns, invoiceColumns.filter(item => item.dataIndex === 'origDocumentSequence')[0]);
      removeArryItem(borrowColumns, borrowColumns.filter(item => item.dataIndex === 'origDocumentSequence')[0]);
    }
    this.setState({ invoiceColumns, borrowColumns });
  };
  //Tab点击事件
  onChangeTabs = (key) => {
    let temp = this.state.searchParams;
    temp.status = key;
    // this.refreshSearchCount(this.state.count[key].expenseReportCount, this.state.count[key].loanApplicationCount);
    this.setState({
      loading: true,
      page: 0,
      status: key
    }, () => {
      this.handleData();
      this.child.handleSearch();
    });
  };

  search = (result) => {
    this.setCache(result);
    result.dateFromTrans = result.dateFrom ? result.dateFrom.format('YYYY-MM-DD 00:00:00') : undefined;
    result.dateToTrans = result.dateTo ? result.dateTo.format('YYYY-MM-DD 23:59:59') : undefined;
    result.approvalStartDateTrans = result.approvalStartDate ? result.approvalStartDate.format('YYYY-MM-DD 00:00:00') : undefined;
    result.approvalEndDateTrans = result.approvalEndDate ? result.approvalEndDate.format('YYYY-MM-DD 23:59:59') : undefined;
    let searchParams = {
      applicantOid: result.user,
      businessCode: result.formID,
      corporationOids: result.legalEntity,
      endDate: result.dateToTrans,
      startDate: result.dateFromTrans,
      formOids: result.formOids,
      approvalStartDate: result.approvalStartDateTrans,
      approvalEndDate: result.approvalEndDateTrans,
      printFree: result.printFree
    };
    this.setState({
      searchParams: searchParams,
      loading: true,
      page: result.page ? result.page : 0
    }, () => {
      this.getList();
    })
  };

  //子组件this
  onRef = (ref) => {
    this.child = ref;
  };
  //存储筛选数据缓存
  setCache(result) {
    let { status, page } = this.state;
    result.tabsStatus = status;
    result.page = page;
    cacheSearchData = result;
  }
  //获取筛选数据缓存
  getCache() {
    let result = this.props.financeAudit;
    if (result && JSON.stringify(result) !== "{}") {
      cacheSearchData = result;
      this.dealCache(result);
    }
    else {
      defaultSearchForm = deepFullCopy(this.state.searchForm)
      defaultCheckboxListForm = deepFullCopy(this.state.checkboxListForm)
      this.getList()
    }

  };
  //处理筛选缓存数据
  dealCache(result) {
    let { status, searchForm, nowType, page, checkboxListForm } = this.state;
    defaultSearchForm = deepFullCopy(searchForm);
    defaultCheckboxListForm = deepFullCopy(checkboxListForm);
    if (result) {
      status = result.tabsStatus;
      nowType = result.type;
      page = result.page;
      checkboxListForm.defaultValue = result['formOidsLable'] || [];
      checkboxListForm.formOidsExpand = result['formOidsExpand'];
      dealCache(searchForm, result);
      this.setState({ status, nowType, searchForm, page }, () => {
        this.handleData();
        this.search(result);
        configureStore.store.dispatch(setFinanceAudit(null));
      })
    }
  }

  clear = () => {
    cacheSearchData = {};
    this.setState({
      page: 0,
      searchForm: defaultSearchForm,
      nowType: 'INVOICE',
      searchParams: {
        applicantOid: "",
        businessCode: "",
        corporationOids: [],
        endDate: null,
        startDate: null
      }
    }, () => { this.handleData(); this.getList(); });
  };

  searchEventHandle = (event, value, valuesTmp) => {
    switch (event) {
      case 'CHANGE_TYPE': {
        if (value === this.state.nowType)
          return;
        let { checkboxListForm, expenseForms, loanForms } = this.state;
        checkboxListForm.items = [{ label: this.$t('finance.audit.formType'/*表单类型*/), key: 'form', options: value === 'INVOICE' ? expenseForms : loanForms, checked: [] }];
        this.setState({ checkboxListForm });
        this.setState({ page: 0, nowType: value, loading: true }, () => {
          valuesTmp.type = value;
          valuesTmp.typeLable = value;
          this.handleData();
          this.search(valuesTmp);
        });
        break;
      }
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    let page = pagination.current;
    let sort = '';
    if (sorter.order) {
      sort = `${sorter.columnKey},${sorter.order === 'ascend' ? 'ASC' : 'DESC'}`
    }
    this.setState({
      page: page - 1,
      loading: true,
      sort
    }, () => {
      this.child.handleSearch();
    })
  };

  handleRowClick = (record) => {
    const { nowType, status, expenseDetailAudit, loanDetailAudit } = this.state;
    let url = '';

    if (nowType === 'INVOICE')
      url = expenseDetailAudit.replace(':expenseReportOid', record.expenseReportOid).replace(':backType', 'history');
    else
      url = loanDetailAudit.replace(':formOid', record.formOid).replace(':applicationOid', record.applicationOid).replace(':backType', 'history');
    status === 'prending_audit' && (url += `?prending_audit=true`);
    this.props.dispatch({
      type: 'cache/setFinanceAudit',
      payload: cacheSearchData,
    });
    this.props.dispatch(
      routerRedux.push({ pathname: url })
    )
  };

  renderExpandedRow = (title, content) => {
    return (
      <div>
        <span>{title}</span>
        {content && <span>:{content}</span>}
      </div>
    )
  };

  renderAllExpandedRow = (record) => {
    let result = [];
    if (record.warningList) {
      let warningList = JSON.parse(record.warningList);
      let content = '';
      warningList.map(item => {
        if (item.showFlag) {
          content += item.title + '/'
        }
      });
      content && result.push(this.renderExpandedRow(this.$t('common.label'), content.substr(0, content.length - 1)));
    }
    if (record.printFree) {
      result.push(this.renderExpandedRow(this.$t('common.print.free'), this.$t('common.print.require')));
    }
    if (record.noticeFlag) {
      result.push(this.renderExpandedRow(this.$t('finance.view.column.notice'), this.$t('finance.view.column.noticeContent')));
    }
    if (result.length > 0) {
      return result;
    } else {
      return null;
    }
  };

  render() {
    const { data, loading, invoiceColumns, borrowColumns, pagination, searchForm, nowType, checkboxListForm, status } = this.state;

    return (
      <div className="finance-audit">
        {
          this.checkFunctionProfiles(['finance.scan.disabled'], [[false, undefined]]) &&
          this.checkPageRole('EXPENSEAUDIT', 2) &&
          <Button type="primary" icon="scan" onClick={this.handleClickSwitch} style={{ marginRight: 10 }}>{this.$t('finance.audit.sweepQRcode'/*扫码审核*/)}</Button>
        }
        {
          this.checkFunctionProfiles('document.review.enable', [true]) &&
          this.checkPageRole('EXPENSEAUDIT', 2) &&
          <Button type="primary" icon="qrcode" onClick={this.handleClickSwitchGun}>{this.$t('finance.audit.sweepGun'/*扫码枪审核*/)}</Button>
        }
        <Tabs onChange={this.onChangeTabs} activeKey={status}>
          {this.renderTabs()}
        </Tabs>
        <SearchArea onRef={this.onRef}
          searchForm={searchForm}
          checkboxListForm={[checkboxListForm]}
          submitHandle={this.search}
          clearHandle={this.clear}
          isReturnLabel={true}
          eventHandle={this.searchEventHandle} />
        <div className="divider" />
        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total', { total: pagination.total })}</div>
          {/* 共total条数据 */}
        </div>
        <Table columns={nowType === 'INVOICE' ? invoiceColumns : borrowColumns}
          dataSource={data}
          bordered
          pagination={pagination}
          onChange={this.handleTableChange}
          onRow={record => ({ onClick: () => this.handleRowClick(record) })}
          loading={loading}
          expandedRowRender={this.renderAllExpandedRow}
          rowClassName={record => (record.printFree || record.noticeFlag || record.warningList) ? '' : 'finance-audit-reject'}
          size="middle"
          rowKey={nowType === 'INVOICE' ? 'expenseReportOid' : 'applicationOid'} />
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    //companyConfiguration: state.login.companyConfiguration,
    profile: state.user.proFile,
    company: state.user.company,
    user: state.user.currentUser,
    financeAudit: state.cache.financeAudit,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(FinanceAudit);
