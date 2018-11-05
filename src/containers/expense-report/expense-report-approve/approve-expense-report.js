
import React from 'react'
// import menuRoute from 'routes/menuRoute'
import { connect } from 'dva'

import { Form, Tabs, Badge, Popover, Table, Affix, message, Tooltip, Button } from 'antd'
const TabPane = Tabs.TabPane;

import moment from 'moment'
import SearchArea from 'widget/search-area'
import ApproveBar from 'widget/Template/approve-bar'
import baseService from 'share/base.service'
import approveExpenseReportService from 'containers/expense-report/expense-report-approve/approve-expense-report.service'
import 'styles/approve/request/request.scss'
import 'styles/approve/expense-report/approve-expense-report.scss'
import {dealListTag, dealCache, deepFullCopy} from "utils/extend";
// import configureStore from "stores";
// import {setApproveExpenseReport} from "cache";
import constants from "share/constants";
import { routerRedux } from 'dva/router';

let cacheSearchData={};

class ExpenseReportApprove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      passLoading: false,
      rejectLoading: false,
      tab: 'approvePending',
      approvePendingCheckboxList: [{
        id: 'formOIDs',
        items: [{label: this.$t('myReimburse.documentName'/*单据名称*/), key: 'formOID', options: [], checkAllOption: true}]
      }],
      approvedCheckboxList: [{
        id: 'formOIDs',
        items: [{label: this.$t('myReimburse.documentName'/*单据名称*/), key: 'formOID', options: [], checkAllOption: true}]
      }],
      searchForm: [
        {type: 'input', id: 'businessCode', label: this.$t('finance.view.search.documentNo'/*单号*/)},
        {type: 'list', id: 'applicantOIDs', label: this.$t('finance.view.search.applicant'/*申请人*/), listType: 'user', labelKey: 'fullName', valueKey: 'userOID',listExtraParams:{roleType: 'TENANT'}},
        {type: 'list', id: 'departmentOIDs', label: this.$t('request.detail.department.name'/*部门*/), listType: 'department', labelKey: 'name', valueKey: 'departmentOid', single: true},
        {type: 'items', id: 'priceRange', items: [
          {type: 'inputNumber', id: 'minAmount', label: this.$t("approve.request.moneyFrom")/*金额从*/},
          {type: 'inputNumber', id: 'maxAmount', label: this.$t("approve.request.moneyTo")/*金额至*/}
        ]},
        {type: 'items', id: 'dateRange', items: [
          {type: 'date', id: 'beginDate', label: this.$t('finance.audit.startDate'/*日期从*/)},
          {type: 'date', id: 'endDate', label: this.$t('finance.audit.endDate'/*日期到*/)}
        ]}
      ],
      approvePendingSearchParams: {},
      approvedSearchParams: {},
      status: constants.expenseStatus, // 报销单状态值
      columns: [
        {title: this.$t('common.sequence'/*序号*/), dataIndex: 'index', render: (value, record, index) => {
          return `${index + 1 + this.state.pageSize * (this.state.pagination.current-1)}${record.proxyInfo ? `(${this.$t('common.proxy')})` : ''}`
          }, width: '8%'},
        {title: this.$t('finance.view.search.jobNumber'/*工号*/), dataIndex: 'employeeID', render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : ''},
        {title: this.$t('finance.view.search.applicant'/*申请人*/), dataIndex: 'applicantName', render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'},
        {title: this.$t('finance.view.search.submitDate'/*提交日期*/), dataIndex: 'submittedDate', render: (value,record) => {
            let result = value ? moment(value).format('YYYY-MM-DD') : moment(record.lastSubmittedDate).format('YYYY-MM-DD');
            return result;
          }},
        {title: this.$t('myReimburse.documentName'/*单据名称*/), dataIndex: 'formName', render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'},
        {title: this.$t('finance.view.search.documentNo'/*单号*/), dataIndex: 'businessCode', render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'},
        {title: this.$t('approve.request.matter'/*事由*/), dataIndex: 'title', render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'},
        {title: this.$t('finance.view.search.currency'/*币种*/), dataIndex: 'currencyCode', width: '6%'},
        {title: this.$t('borrowing.limit.control.amount'/*金额*/), dataIndex: 'totalAmount', sorter: true, render: this.filterMoney},
        {title: this.$t('common.column.status'/*状态*/), dataIndex: 'status', width: '8%', render: (value, record) => {
          let result = null;
          this.state.status.map(item => {
            if(item.value === String(value) || item.value === String(value * 10000 + record.rejectType)) {
              result = <Badge text={this.$t(item.label)} status={item.state} />
            }
          })
          return result;
        }}
      ],
      sort: '',
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
        current: 1
      },
      batchEnabled: false, //是否有批量审批
      selectedDataOids: [], //选中的单据OID
      selectedDataNum: 0,
      // approveExpenseReportDetail: menuRoute.getRouteItem('approve-expense-report-detail','key'), //报销单审批详情页
      rowSelection: {
        selectedRowKeys: [],
        onChange: this.onSelectChange,
        onSelect: this.onSelectRow,
        onSelectAll: this.onSelectAllRow
      }
    }
  }

  componentWillMount() {
    this.getProfile();
    this.setState({ tab: 'approvePending' }, () => {
      this.getForms();
      this.getCache();
    })
  }

  //获取配置文件，用于判断是否需要批量审批
  getProfile = () => {
    baseService.getProfile().then(res => {
      this.setState({ batchEnabled: res.data['all.Approval.batch.Enable'] })
    })
  };

  getForms = () => {
    ['approvePending', 'approved'].map(tab => {
      let checkboxList = this.state[tab === 'approvePending' ? 'approvePendingCheckboxList' : 'approvedCheckboxList'];
      approveExpenseReportService.getDocumentType(tab === 'approved').then(res => {
        let options = [];
        Object.keys(res.data).map(key => {
          options.push({label: key, value: res.data[key][0]})
        });
        checkboxList.map(form => {
          if (form.id === 'formOIDs') {
            form.items.map(item => {
              item.key === 'formOID' && (item.options = options);
              item.checked = form.defaultValue;
            })
          }
        });
        this.setState({
          [tab === 'approvePending' ? 'approvePendingCheckboxList' : 'approvedCheckboxList']: checkboxList
        })
      })
    })
  };

  getList = () => {
    const { tab, page, pageSize, approvePendingSearchParams, approvedSearchParams, sort } = this.state;
    if (sort && tab === 'approved') {
      approvedSearchParams.sort = sort;
    }
    if (sort && tab !== 'approved') {
      approvePendingSearchParams.sort = sort;
    }
    this.setCache(tab === 'approvePending' ? approvePendingSearchParams : approvedSearchParams);
    this.setState({ loading: true });
    approveExpenseReportService.getApproveExpenseReportList(tab === 'approved', page, pageSize, tab === 'approved' ? approvedSearchParams : approvePendingSearchParams).then(res => {
      let data = [];
      res.data.map(item => {
        item.expenseReport.entityOID = item.entityOID;
        item.expenseReport.approverOID = item.approverOID;
        item.expenseReport.entityType = item.entityType;
        data.push(item.expenseReport || {})
      });
      this.setState({
        loading: false,
        data,
        pagination: {
          total: Number(res.headers['x-total-count']) || 0,
          current: page + 1,
          onChange: this.onChangePaper
        }
      },() => this.refreshRowSelection())
    })
  };

  onChangePaper = (page) => {
    this.setState({page: page - 1}, () => {
      this.setCache(cacheSearchData);
      //this.getList();
    })
  };

  onTabChange = (tab) => {
    this.setState({
      tab,
      page: 0,
      pagination: { total: 0 , current:1}
    },() => {
      this.dealCache({tab, page: 0});
    })
  };
//存储筛选数据缓存
  setCache(result){
    let {tab,page} = this.state;
    result.tab = tab;
    result.page = page;
    cacheSearchData=result;
  }
  //获取筛选数据缓存
  getCache(){
    let result=this.props.approveExpenseReport;
    if(result&&JSON.stringify(result) !== "{}"){
      cacheSearchData=result;
      this.dealCache(result);
    }
    else{
      let defaultSearchForm=deepFullCopy(this.state.searchForm)
      this.getList();
      this.setState({defaultSearchForm})
    }

  };
  //处理筛选缓存数据
  dealCache(result) {
    let {tab, searchForm, page, approvePendingCheckboxList, approvedCheckboxList} = this.state;
    let defaultSearchForm=deepFullCopy(searchForm);
    if (result) {
      tab = result.tab;
      page = result.page;
      let checkboxListFormKey = tab === 'approvePending'? 'approvePendingCheckboxList': 'approvedCheckboxList';
      let checkboxListForm = tab === 'approvePending'? approvePendingCheckboxList : approvedCheckboxList;
      checkboxListForm[0].defaultValue=result['formOIDsLable'] || [];
      checkboxListForm[0].formOIDsExpand=result['formOIDsExpand'];
      dealCache(searchForm, result);
      this.setState({tab, defaultSearchForm,searchForm, page, [checkboxListFormKey]: checkboxListForm}, () => {
        this.search(result);
        // configureStore.store.dispatch(setApproveExpenseReport(null));
      })
    }
  }
  search = (values) => {
    this.setCache({...values});
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    this.setState({
      [this.state.tab === 'approvePending' ? 'approvePendingSearchParams' : 'approvedSearchParams']: values,
      page: values.page?values.page:0,
      pagination: { total: 0,current:1 }
    },() => {
      this.getList()
    })
  };

  searchClear = () => {
    let {defaultSearchForm}=this.state;
    this.setState({
      page:0,
      searchForm:deepFullCopy(defaultSearchForm),
      approvedSearchParams: {},
      approvePendingSearchParams:{}
    },()=>{
      this.getList();
    })
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
    });
  };

  handleRowClick = (record) => {
    // configureStore.store.dispatch(setApproveExpenseReport(cacheSearchData));
    // let url = this.state.approveExpenseReportDetail.url.replace(':expenseReportOID', record.entityOID);
    // this.state.tab === 'approvePending' && (url += `?approvePending=true&approverOID=${record.approverOID}`);
    // this.context.router.push(url);
    // this.props.dispatch(
    //   routerRedux.push({
    //     pathname: `/approval-management/approve-expense-report/approve-expense-report-detail/${record.entityOID}/?`
    //   })
    // )  
    if(this.state.tab === 'approvePending'){
      this.props.dispatch(
        routerRedux.push({
          pathname: `/approval-management/approve-expense-report/approve-expense-report-detail/${record.entityOID}/${record.approverOID}`
        })
      )
    }else{
      this.props.dispatch(
        routerRedux.push({
          pathname: `/approval-management/approve-expense-report/approve-expense-report-detail/${record.entityOID}/${null}`
        })
      )
    }
  };

  //列表选择更改
  onSelectChange = (selectedRowKeys) => {
    let { rowSelection } = this.state;
    rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({ rowSelection });
  };

  //选择一行
  //选择逻辑：每一项设置selected属性，如果为true则为选中
  onSelectRow = (record, selected) => {
    let {selectedDataOids, selectedDataNum, rowSelection} = this.state;
    let item = {
      approverOID: record.approverOID,
      entityOID: record.entityOID,
      entityType: record.entityType
    };
    if(!selected){
      selectedDataOids.map((select, index) => {
        if( select.entityOID === record.entityOID ){
          selectedDataOids.splice(index, 1);
          selectedDataNum-=1;
        }
      })
    } else {
      selectedDataOids.push(item);
      selectedDataNum+=1;
    }
    this.setState({ selectedDataOids ,selectedDataNum:selectedDataNum,rowSelection:rowSelection});
  };

  //全选
  onSelectAllRow = (selected, selectedRows, changeRows) => {
    let {selectedDataNum,selectedDataOids} = this.state;
    if(!selected){
      changeRows.map(record => {
        selectedDataOids.map((select, index) => {
          if( select.entityOID === record.entityOID ){
            selectedDataOids.splice(index, 1);
            selectedDataNum-=1;
          }
        })
      });
    } else {
      selectedRows.map(item => {
        let itemId = {
          approverOID: item.approverOID,
          entityOID: item.entityOID,
          entityType: item.entityType
        };
        let isContainer = false;
        selectedDataOids.map(select => {
          if( select.entityOID === itemId.entityOID ){
            isContainer = true;
          }
        });
        !isContainer && (selectedDataOids.push(itemId),selectedDataNum+=1);
      });
    }
    this.setState({selectedDataNum:selectedDataNum,selectedDataOids:selectedDataOids});
  };

  //审批操作
  handleApprove = (value, type) => {
    let entities = [];
    this.state.selectedDataOids.map(item => {
      entities.push(item)
    });
    let params = {
      entities,
      approvalTxt: value
    };
    this.setState({[type === 'pass' ? 'passLoading' : 'rejectLoading']: true});
    approveExpenseReportService[type === 'pass' ? 'handleExpenseReportApprovePass' : 'handleExpenseReportApproveReject'](params).then(res => {
      message.success(this.$t('approve.request.successNum',{total:res.data.successNum}/*成功处理 ${res.data.successNum} 笔单据*/)+
        this.$t('approve.request.failNum',{total:res.data.failNum}/*失败 ${res.data.failNum} 笔单据*/));
      this.setState({ passLoading: false, rejectLoading: false });
      this.state.rowSelection.selectedRowKeys = [];
      this.setState({
        tab: 'approvePending',
        page: 0,
        pagination: { total: 0,current:1 },
        selectedDataOids: [],
      },() => {
        this.getList()
      })
    }).catch((e) => {
      message.error(e.response.data.message);
      this.setState({ passLoading: false, rejectLoading: false });
    })
  };

  refreshRowSelection(){
    let { selectedDataOids, data, rowSelection, allSelectedStatus } = this.state;
    let nowSelectedRowKeys = [];
    selectedDataOids.map(selected => {
      data.map((item,index) => {
        if(selected.entityOID === item.entityOID)
          nowSelectedRowKeys.push(index);
      })
    });
    rowSelection.selectedRowKeys = nowSelectedRowKeys;
    this.setState({ rowSelection });
  }

  render() {
    const { loading, tab, searchForm, approvePendingCheckboxList, approvedCheckboxList, columns, data, pagination, batchEnabled, passLoading, rejectLoading, selectedDataNum, rowSelection } = this.state;
    return (
      <div className={`approve-request approve-expense-report ${selectedDataNum && tab === 'approvePending' ? 'bottom-100' : ''}`}>
        <Tabs activeKey={tab} onChange={this.onTabChange}>
          <TabPane tab={this.$t('request.detail.await.approval.by'/*待审批*/)} key='approvePending' />
          <TabPane tab={this.$t('contract.approved'/*已审批*/)} key='approved' />
        </Tabs>
        {tab === 'approvePending' && <SearchArea searchForm={searchForm}
                                                 checkboxListForm={approvePendingCheckboxList}
                                                 submitHandle={this.search}
                                                 isReturnLabel={true}
                                                 clearHandle={this.searchClear}/>}
        {tab === 'approved' && <SearchArea searchForm={searchForm}
                                           checkboxListForm={approvedCheckboxList}
                                           submitHandle={this.search}
                                           isReturnLabel={true}
                                           clearHandle={this.searchClear}/>}
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total',{total:pagination.total}/*共搜索到 {pagination.total} 条数据*/)} |
            {tab === 'approvePending' && this.$t('common.total.selected',{total: selectedDataNum})}
            {/*已选 ${selectedRowKeys.length} 条*/}
          </div>
        </div>
        <Table
               loading={loading}
               columns={columns}
               bordered
               dataSource={data}
               pagination={pagination}
               onChange={this.handleTableChange}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               rowSelection={tab === 'approvePending' && batchEnabled ? rowSelection : null}
               expandedRowRender = { dealListTag }
               rowClassName = {record => record.warningList  ? '' :'approve-expense-report-tag' }
               size="middle"/>
        <Affix offsetBottom={0} className={`bottom-bar-approve ${selectedDataNum && tab === 'approvePending' ? 'show' : 'hide'}`}>
          <ApproveBar passLoading={passLoading}
                      rejectLoading={rejectLoading}
                      handleApprovePass={value => this.handleApprove(value, 'pass')}
                      handleApproveReject={value => this.handleApprove(value, 'reject')}/>
        </Affix>
      </div>
    )
  }
}

// ExpenseReportApprove.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    profile: state.user.profile,
    approveExpenseReport: state.cache.approveExpenseReport
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseReportApprove)

