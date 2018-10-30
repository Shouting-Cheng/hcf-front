import React from 'react'
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Tabs, Table, message, Badge, Input,Row, Col, Popover } from 'antd'
const TabPane = Tabs.TabPane;
import config from 'config'
const Search = Input.Search;
import SearchArea from 'components/Widget/search-area'
import moment from 'moment'
import CustomTable from "components/Widget/custom-table";
import budgetJournalService from 'containers/approve/budget-journal-check/budget-journal-check.service'


class BudgetJournalCheck extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 'unapproved',
      searchForm: [
          {
            type: 'list', listType: "bgtUserOID", options: [],
            id: 'userOID', label: this.$t({id:'pay.refund.employeeName'}), labelKey: "fullName", valueKey: "userOID",colSpan: 6,single:true,
            listExtraParams:{setOfBooksId: this.props.company.setOfBooksId}
          },
          {
            type: 'select', id: 'journalTypeId', label: this.$t('budgetJournal.journalTypeId'), options: [], method: 'get',/*预算日记账类型*/
            getUrl: `${config.budgetUrl}/api/budget/journals/journalType/selectByInput`, getParams: { organizationId: this.props.organization.id },
            labelKey: 'journalTypeName', valueKey: 'id'
          },
          {
            type: 'items', id: 'createdDate', items: [
              { type: 'date', id: 'beginDate', label: this.$t('role.set.finance.submit.date.from') },/*提交日期从*/
              { type: 'date', id: 'endDate', label: this.$t('role.set.finance.submit.date.to') }/*提交日期至*/
            ]
          }
        ],
      searchParams: {},
      columns: [
        { title: this.$t('budgetJournal.sequenceNumber'), dataIndex: 'index', width: '7%',align: 'center', render: (value, record, index) => index + 1 },/*序号*/
        {
          title: this.$t('budgetJournal.journalCode'), dataIndex: 'journalCode',width: '15%',
          render:  (desc,record) => (
            <Popover content={record.budgetJournalApprovalView.journalCode}>
              {record.budgetJournalApprovalView.journalCode}
            </Popover>)
        },/*预算日记账编号*/
        {
          title: this.$t('budgetJournal.journalTypeId.name'), dataIndex: 'journalTypeName',width: '15%',
          render:  (desc,record) => (
            <Popover content={record.budgetJournalApprovalView.journalTypeName}>
              {record.budgetJournalApprovalView.journalTypeName}
            </Popover>)
        },
        {
          title: this.$t('budgetJournal.employeeId'), dataIndex: 'applicantName',align: 'center',width: '9%',/*申请人*/
          render: (desc,record) => (
            <Popover content={record.budgetJournalApprovalView.applicantName}>
              {record.budgetJournalApprovalView.applicantName}
            </Popover>)
        },
        { title: this.$t({ id: "role.set.finance.submit.date" }/*创建时间*/), align: 'center',width: '9%', dataIndex: 'submittedDate',
          render: (desc,record) => moment(record.budgetJournalApprovalView.submittedDate).format('YYYY-MM-DD')
        },
        {
          title: this.$t('adjust.formName'), dataIndex: 'formName',width: '20%',
          render:  (desc,record) => (
            <Popover content={record.budgetJournalApprovalView.formName}>
              {record.budgetJournalApprovalView.formName}
            </Popover>)
        },/*类型*/
        { title: this.$t('budgetJournal.currency'), dataIndex: 'currencyCode',width: '7%',align: 'center',
        render: (desc,record)=> record.budgetJournalApprovalView.currencyCode},
        {
          title: this.$t('budgetJournal.amount'), dataIndex: 'totalBudget',align: 'right',
          render: (desc,record) => (
            <Popover content={record.budgetJournalApprovalView.totalBudget}>
              {record.budgetJournalApprovalView.totalBudget}
            </Popover>)
        },/*金额*/
        {
          title: this.$t({ id: "common.column.status" }/*状态*/), align: 'center', dataIndex: 'status',
          render: (value,record )=> <Badge status={this.$statusList[record.budgetJournalApprovalView.status].state} text={this.$statusList[record.budgetJournalApprovalView.status].label} />
        },/*状态*/
      ],
      journalData: [],
    };
  }

  //未审批搜索
  handleSearch = (values) => {
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    if(this.state.tabValue === 'approved'){
      values.finished = true;
    }else{
      values.finished = false;
    }
    this.setState({searchParams: values});
    this.table.search(values);
  };

  handleTabsChange = (key)=>{
    this.setState({tabValue: key},()=>{
      if(key === 'approved'){
        this.setState({
          searchParams: { ...this.state.searchParams, finished: true }
        }, () => {
          this.table.search({ ...this.state.searchParams, finished: true });
        });
      }else{
        this.setState({
          searchParams: { ...this.state.searchParams, finished: false }
        }, () => {
          this.table.search({ ...this.state.searchParams, finished: false });
        });
      }
    })
  };

  //进入日记账详情页
  handleRowClick = (value, flag) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/approval-management/budget-journal-check/budget-journal-check-detail/${value.budgetJournalApprovalView.id}/${value.budgetJournalApprovalView.journalCode}/${this.state.tabValue}`
      })
    );
  };

  searchNumber = (e) => {
    const {searchParams} = this.state;
    this.setState({
      searchParams: { ...this.state.searchParams, businessCode: e }
    }, () => {
      this.table.search({ ...this.state.searchParams, businessCode: e });
    });
  };

  renderContent = ()=>{
    const {searchForm, tabValue, columns } = this.state;

    return (<div>
      <SearchArea searchForm={searchForm}
                  clearHandle={()=>{}}
                  maxLength={3}
                  submitHandle={this.handleSearch} />
      <div className='divider'/>
      <div className="table-header" style={{marginBottom: '5px'}}>
        <Row>
          <Col span={18}/>
          <Col span={6}>
            <Search
              placeholder={this.$t({id:'budget.please.input.journal.number'})}
              onSearch={this.searchNumber}
              enterButton
            />
          </Col>
        </Row>
      </div>
      <CustomTable
        onClick={this.handleRowClick}
        url={`${config.baseUrl}/api/approvals/budget/journal/filters`}
        ref={ref=>this.table = ref}
        params={{finished: tabValue==='approved'}}
        columns={columns}/>
    </div>)
  };

  render() {
    const { tabValue} = this.state;
    return (
      <div className="pre-payment-container">
        <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
          <TabPane tab={this.$t({ id: "contract.unapproved" }/*未审批*/)} key="unapproved"/>
          <TabPane tab={this.$t({ id: "contract.approved" }/*已审批*/)} key="approved"/>
        </Tabs>
        {this.renderContent()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    organization: state.user.organization
  }
}


export default connect(mapStateToProps, null, null, { withRef: true })(BudgetJournalCheck);
