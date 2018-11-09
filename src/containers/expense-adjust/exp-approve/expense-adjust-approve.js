import React from 'react'
import { connect } from 'dva'
import {Form, Input, Tabs, Badge, Popover, Col, Row} from 'antd'
const TabPane = Tabs.TabPane;
import config from 'config'
import { routerRedux } from 'dva/router';
import SearchArea from 'widget/search-area'
import moment from 'moment'
import CustomTable from 'widget/custom-table'
const Search = Input.Search;

class ExpenseAdjustApprove extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabValue: 'unapproved',
            loading1: false,
            loading2: false,
            SearchForm1: [
              {
                type: 'select', options: [], id: 'expAdjustTypeId', label: this.$t('epx.adjust.receipt.type'), labelKey: "expAdjustTypeName", colSpan: 6, valueKey: "id",
                getUrl: `${config.baseUrl}/api/expense/adjust/types/queryExpenseAdjustType`,method: 'get',
                getParams: { "setOfBooksId": this.props.company.setOfBooksId, "userId": this.props.user.id, },
              },
              { type: 'select', id: 'adjustTypeCategory', label: this.$t('exp.adjust.type'), colSpan: 6,
                options: [
                  {label: this.$t('exp.adjust.exp.detail'), value: '1001' },
                  {label: this.$t('exp.adjust.exp.add'), value: '1002' }
                ],
              },
              {                                                                                   //申请人
                type: 'list', listType: "select_authorization_user", options: [], id: 'fullName', label: this.$t('exp.adjust.applier'), labelKey: "userName",
                valueKey: "userName", single: true, colSpan: 6
              },
                {
                    type: 'items', id: 'dateRange', colSpan: 6,items: [
                        { type: 'date', id: 'beginDate', label: this.$t({ id: "contract.search.date.from" }/*提交时间从*/) },
                        { type: 'date', id: 'endDate', label: this.$t({ id: "contract.search.date.to" }/*提交时间至*/) }
                    ]
                },
              {
                type: 'select', key: 'currency', id: 'currencyCode', label: this.$t('common.currency'), getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`, options: [], method: "get",
                labelKey: 'currency', valueKey: 'currency', colSpan: 6
              },
              {
                type: 'items', id: 'amount', colSpan: 6, items: [
                  { type: 'input', id: 'amountMin', label: this.$t('exp.money.from') },
                  { type: 'input', id: 'amountMax', label: this.$t('exp.money.to') }]
              },
              {
                type: "input", id: "description", label: this.$t('common.comment'), colSpan: 6,
              }
            ],
            SearchForm2: [
              {
                type: 'select', options: [], id: 'expAdjustTypeId', label: this.$t('epx.adjust.receipt.type'), labelKey: "expAdjustTypeName", colSpan: 6, valueKey: "id",
                getUrl: `${config.baseUrl}/api/expense/adjust/types/queryExpenseAdjustType`,method: 'get',
                getParams: { "setOfBooksId": this.props.company.setOfBooksId, "userId": this.props.user.id, },
              },
              { type: 'select', id: 'adjustTypeCategory', label: this.$t('exp.adjust.type'), colSpan: 6,
              options: [
                {label: this.$t('exp.adjust.exp.detail'), value: '1001' },
                {label: this.$t('exp.adjust.exp.add'), value: '1002' }
              ],
            },
            {
              type: 'list', listType: "select_authorization_user", options: [], id: 'fullName', label: this.$t('exp.adjust.applier'), labelKey: "userName",
              valueKey: "userName", single: true, colSpan: 6
            },
            {
              type: 'items', id: 'dateRange', colSpan: 6,items: [
                { type: 'date', id: 'beginDate', label: this.$t({ id: "contract.search.date.from" }/*提交时间从*/) },
                { type: 'date', id: 'endDate', label: this.$t({ id: "contract.search.date.to" }/*提交时间至*/) }
              ]
            },
            {
              type: 'select', key: 'currency', id: 'currencyCode', label: this.$t('common.currency'), getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`, options: [], method: "get",
              labelKey: 'currency', valueKey: 'currency', colSpan: 6
            },
            {
              type: 'items', id: 'amount', colSpan: 6, items: [
                { type: 'input', id: 'amountMin', label: this.$t('exp.money.from') },
                { type: 'input', id: 'amountMax', label: this.$t('exp.money.to') }]
            },
            {
              type: "input", id: "description", label: this.$t('common.comment'), colSpan: 6,
            }
          ],
            searchParams: {},
            columns: [//单据编号
                { title: this.$t('common.document.code'), dataIndex: 'businessCode', width: 180, align:'center',
                  render: (desc,record)=><span><Popover content={record.expenseAdjustApprovalView.businessCode}>{record.expenseAdjustApprovalView.businessCode? record.expenseAdjustApprovalView.businessCode : "-"}</Popover></span>
                },
                { title: this.$t('exp.receipt.type'), dataIndex: 'expAdjustTypeName', align:'center',
                  render: (desc,record)=><span><Popover content={record.expenseAdjustApprovalView.formName}>{record.expenseAdjustApprovalView.expAdjustTypeName? record.expenseAdjustApprovalView.expAdjustTypeName : ""}</Popover></span>
                },  //调整类型
                { title: this.$t('exp.adjust.type'), dataIndex: 'adjustTypeCategory', align:'center', width: 100,
                  render: (desc,record)=><span><Popover content={record.expenseAdjustApprovalView.adjustTypeCategory === '1001'? this.$t('exp.adjust.exp.detail'): this.$t('exp.adjust.exp.add')}>{record.expenseAdjustApprovalView.adjustTypeCategory === '1001'? this.$t('exp.adjust.exp.detail'): this.$t('exp.adjust.exp.add')}</Popover></span>
                },
                { title: this.$t('exp.adjust.applier'), dataIndex: 'applicantName', width: 100 , align: 'center',
                  render: (desc,record) =><Popover content={record.expenseAdjustApprovalView.applicantName && record.expenseAdjustApprovalView.applicantName}>
                    {record.expenseAdjustApprovalView.applicantName ? record.expenseAdjustApprovalView.applicantName : '-'}
                  </Popover>
                },  //提交日期
                { title: this.$t('common.submit.date'), dataIndex: 'lastSubmittedDate', align: 'center', width: 90,
                  render: (desc, record) => {
                    let value = record.expenseAdjustApprovalView.lastSubmittedDate;
                    return <Popover content={value && moment(value).format('YYYY-MM-DD')}>{value ? moment(value).format('YYYY-MM-DD') : '-'}</Popover>
                  }
                },
                { title: this.$t('common.currency'), dataIndex: 'currencyCode' ,align: 'center',width: '5%',
                  render:   (desc,record) => <Popover content={record.expenseAdjustApprovalView.currencyCode}>{record.expenseAdjustApprovalView.currencyCode || '-'}</Popover>

                },
                // {title: '币种', dataIndex: 'currency'},
                { title: this.$t('common.amount'), dataIndex: 'amount', align: 'center', width: 120,
                  render: (desc,record)=>{
                  return this.filterMoney(record.expenseAdjustApprovalView.totalAmount)}
                },
                {
                  title: this.$t('customField.base.amount')/*本币金额*/, dataIndex: 'functionalAmount', width: '15%',align:'center',
                  render: (value, record) => {
                    //return `${record.currencyCode}${record.originCurrencyTotalAmount}`;
                    return this.filterMoney(record.expenseAdjustApprovalView.functionalAmount)
                  }
                },
                 { title: this.$t('common.comment'), dataIndex: 'remark', align:'center',
                   render: (desc,record)=><span><Popover content={record.expenseAdjustApprovalView.description}>{record.expenseAdjustApprovalView.description||'-'}</Popover></span>
                 },
                {
                  title: this.$t('common.column.status'), dataIndex: 'status', width: 100, render: (value, record) => {
                    return (
                        <Badge status={this.$statusList[record.expenseAdjustApprovalView.status].state} text={this.$statusList[record.expenseAdjustApprovalView.status].label} />
                    )
                  }
                }
            ],
            unapprovedData: [],
            approvedData: [],
            unapprovedPagination: {
                total: 0
            },
            approvedPagination: {
                total: 0
            },
            unapprovedPage: 0,
            unapprovedPageSize: 10,
            approvedPage: 0,
            approvedPageSize: 10,
        }
    }

    componentDidMount() {
      //this.props.location.query.approved
      console.log(this.props)
      this.setState({ tabValue: false ? 'approved' : 'unapproved' });
    }

  handleSearch = (values) => {
      console.log(values)
      values.fullName = values.fullName&&values.fullName[0];
      values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
      values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
      this.setState({ searchParams: values }, () => {
          this.customTable.search({...values,finished: this.state.tabValue === 'approved'})
      })
  };

  handleTabsChange = (key)=>{
    this.setState({
      tabValue: key
    },()=>{
      this.customTable.search({finished: key === 'approved'})
    })
  };

    //进入详情页
    handleRowClick = (record, flag) => {
      let place = {
        pathname:'/approval-management/approve-expense-adjust/expense-adjust-approve-detail/:expenseAdjustTypeId/:id/:entityOID/:flag'
          .replace(':id', record.expenseAdjustApprovalView.expenseReportId)
          .replace(':expenseAdjustTypeId', record.expenseAdjustApprovalView.expAdjustTypeId)
          .replace(":entityOID", record.expenseAdjustApprovalView.expenseReportOID)
          .replace(":flag", this.state.tabValue)
          .replace(":entityType",record.entityType),
        state: {
          entityOID: record.entityOID,
          entityType: record.entityType
        }
      };
      this.props.dispatch(
        routerRedux.replace({
          pathname: place.pathname
        })
      )
    };

    renderContent(){
      return(<div>

      </div>)
    }
    
    render() {
        
        const { tabValue, loading1, loading2, SearchForm1, SearchForm2, columns, unapprovedData, approvedData, unapprovedPagination, approvedPagination } = this.state;
        return (
            <div className="approve-contract">
              <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
                <TabPane tab={this.$t({ id: "contract.unapproved" }/*未审批*/)} key="unapproved">
                 {
                   tabValue === 'unapproved'&&
                     <div>
                       <SearchArea
                         searchForm={SearchForm1}
                         maxLength={4}
                         clearHandle={()=>{}}
                         submitHandle={this.handleSearch} />
                       <Row gutter={24} style={{marginBottom: 12,marginTop:20}}>
                         <Col span={18}/>
                         <Col span={6}>
                           <Search
                             placeholder={this.$t('exp.input.number.tips')}
                             onSearch={e=>{this.customTable&&this.customTable.search({...this.state.searchParams,businessCode:e,finished: this.state.tabValue === 'approved'})}}
                             className="search-number"
                             enterButton
                           />
                         </Col>
                       </Row>
                       <CustomTable
                         ref={ref => this.customTable = ref}
                         columns={columns}
                         onClick={this.handleRowClick}
                         scroll={{ x: true, y: false }}
                         params={{finished: tabValue === 'approved'}}
                         url={`${config.baseUrl}/api/approvals/expense/adjust/filters`}
                       />
                     </div>
                 }
                </TabPane>
                <TabPane tab={this.$t({ id: "contract.approved" }/*已审批*/)} key="approved">
                  {
                    tabValue === 'approved'&&
                      <div>
                        <SearchArea
                          searchForm={SearchForm1}
                          maxLength={4}
                          clearHandle={()=>{}}
                          submitHandle={this.handleSearch} />
                        <Row gutter={24} style={{marginBottom: 12,marginTop:20}}>
                          <Col span={18}/>
                          <Col span={6}>
                            <Search
                              placeholder={this.$t('exp.input.number.tips')}
                              onSearch={e=>{this.customTable&&this.customTable.search({...this.state.searchParams,businessCode:e,finished: this.state.tabValue === 'approved'})}}
                              className="search-number"
                              enterButton
                            />
                          </Col>
                        </Row>
                        <CustomTable
                          ref={ref => this.customTable = ref}
                          columns={columns}
                          onClick={this.handleRowClick}
                          scroll={{ x: true, y: false }}
                          params={{finished: tabValue === 'approved'}}
                          url={`${config.baseUrl}/api/approvals/expense/adjust/filters`}
                        />
                      </div>
                  }
                </TabPane>
              </Tabs>

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company,
    }
}

const wrappedExpenseAdjustApprove = Form.create()((ExpenseAdjustApprove));

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedExpenseAdjustApprove)
