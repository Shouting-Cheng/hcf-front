import React from 'react'
import {connect} from 'dva';
import {Form, Tabs, Table, message, Badge, Popover, Row, Col, Input,InputNumber} from 'antd'

const TabPane = Tabs.TabPane;
import {routerRedux} from "dva/router";
import config from 'config'

import SearchArea from 'components/Widget/search-area'
import moment from 'moment'

import approvePrePaymentService from "containers/pre-payment/pre-payment-approve/pre-payment.service"

import CustomTable from "components/Widget/custom-table";

const Search = Input.Search;

class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 'unapproved',
      loading1: false,
      loading2: false,
      status: {
        1001: {label: '编辑中', state: 'default'},
        1004: {label: '审批通过', state: 'success'},
        1002: {label: '审批中', state: 'processing'},
        1005: {label: '审批驳回', state: 'error'},
        1003: {label: '撤回', state: 'warning'}
      },
      SearchForm1: [
        {
          type: 'select',
          id: 'typeId',
          label: '单据类型',
          getUrl: `${config.prePaymentUrl}/api/cash/pay/requisition/types//queryAll?setOfBookId=${this.props.company.setOfBooksId}`,
          options: [],
          method: "get",
          valueKey: "id",
          labelKey: "typeName",
          colSpan: '6',
          event:"typeId"
        },
        // { type: 'input', id: 'businessCode', label: "单据编号" /*预付款编号*/ },
        {
          type: 'list',
          listType: "bgtUser",
          options: [],
          id: 'userOid',
          label: this.$t({id: 'common.applicant'}),
          labelKey: "fullName",
          valueKey: "userOID",
          colSpan: 6,
          single: true,
          listExtraParams: {setOfBooksId: this.props.company.setOfBooksId},
          event:"userOid"
        },
        {
          type: 'items', id: 'dateRange', items: [
            {type: 'date', id: 'beginDate', label: '提交日期从', event:"beginDate"},
            {type: 'date', id: 'endDate', label: '提交日期至', event:"endDate"}
          ], colSpan: '6'
        },
        {
          type: 'items', id: 'amountRange', items: [
            {type: 'inputNumber', id: 'amountFrom', label: '本币金额从', event:"amountFrom"},
            {type: 'inputNumber', id: 'amountTo', label: '本币金额至', event:"amountTo"},
          ], colSpan: '6'
        },
        {type: 'input', id: 'description', label: "备注", colSpan: '6',event:"description"},

      ],
      SearchForm2: [
        {
          type: 'select',
          id: 'typeId',
          label: '单据类型',
          getUrl: `${config.prePaymentUrl}/api/cash/pay/requisition/types//queryAll?setOfBookId=${this.props.company.setOfBooksId}`,
          options: [],
          method: "get",
          valueKey: "id",
          labelKey: "typeName",
          colSpan: '6'
        },
        // { type: 'input', id: 'businessCode', label: "单据编号" /*预付款编号*/ },
        {
          type: 'list',
          listType: "bgtUser",
          options: [],
          id: 'userOid',
          label: this.$t({id: 'common.applicant'}),
          labelKey: "fullName",
          valueKey: "userOID",
          colSpan: 6,
          single: true,
          listExtraParams: {setOfBooksId: this.props.company.setOfBooksId}
        },
        {
          type: 'items', id: 'dateRange', items: [
            {type: 'date', id: 'beginDate', label: '提交日期从'},
            {type: 'date', id: 'endDate', label: '提交日期至'}
          ], colSpan: '6'
        },
        {
          type: 'items', id: 'amountRange', items: [
            {type: 'input', id: 'amountFrom', label: '本币金额从'},
            {type: 'input', id: 'amountTo', label: '本币金额至'},
          ], colSpan: '6'
        },
        {type: 'input', id: 'description', label: "备注", colSpan: '6'},
      ],
      unApproveSearchParams: {},
      approveSearchParams: {},
      columns: [
        {title: '单据编号', dataIndex: 'prepaymentCode', width: 180},
        {title: '单据类型', dataIndex: 'typeName'},
        {title: '申请人', dataIndex: 'applicantName', width: 100},
        {
          title: '提交日期',
          dataIndex: 'stringSubmitDate',
          width: 90,
          render: (value) => moment(value).format('YYYY-MM-DD')
        },
        // {title: '币种', dataIndex: 'currency'},
        {title: '本币金额', dataIndex: 'totalAmount', render: this.filterMoney},
        // { title: '已核销金额', dataIndex: 'pppamount', render: this.filterMoney },
        {
          title: '备注', dataIndex: 'description', render: (value) => {
            return (
              <Popover content={value}>{value}</Popover>
            )
          }
        },
        {
          title: '状态', dataIndex: 'status', width: 100, render: (value, record) => {
            return (
              <Badge status={this.state.status[value].state} text={this.state.status[value].label}/>
            )
          }
        }
      ],
      // columns: [
      //     { title: this.$t({ id: "common.sequence" }/*序号*/), dataIndex: 'index', render: (value, record, index) => index + 1 },
      //     { title: this.$t({ id: "contract.createdBy" }/*申请人*/), dataIndex: 'applicantCode', render: (value, record) => record.applicantName + ' - ' + value },
      //     { title: this.$t({ id: "contract.sign.date" }/*提交时间*/), dataIndex: 'requisitionDate', render: value => moment(value).format('YYYY-MM-DD') },
      //     { title: "预付款类型", dataIndex: 'typeName' },
      //     { title: "预付款单号", dataIndex: 'prepaymentCode' },
      //     // { title: this.$t({ id: "my.contract.currency" }/*币种*/), dataIndex: 'currency' },
      //     { title: this.$t({ id: "contract.amount" }/*金额*/), dataIndex: 'totalAmount', render: this.filterMoney },
      //     {
      //         title: this.$t({ id: "common.column.status" }/*状态*/), dataIndex: 'status', render: (value, record) =>
      //             <Badge status={this.state.status[value].state} text={this.state.status[value].label} />
      //     },
      // ],
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
      //PrePaymentDetail: menuRoute.getRouteItem('approve-pre-payment-detail', 'key'), //详情
    }
  }

  componentWillMount() {
    this.setState({tabValue: 'unapproved'});
  }

  eventHandle = (type, value) => {
    const {unApproveSearchParams} = this.state;
    switch (type) {
      case 'beginDate': {
        if(value){
          unApproveSearchParams.beginDate = moment(value).format('YYYY-MM-DD');
        }else{
          unApproveSearchParams.beginDate = '';
        }
        break;
      }
      case 'endDate': {
        if(value){
          unApproveSearchParams.endDate = moment(value).format('YYYY-MM-DD');
        }else{
          unApproveSearchParams.endDate = '';
        }
        break;
      }
      case 'userOid': {
        if(value && value[0]){
          unApproveSearchParams.userOid = value[0].userOID;
        }else{
          unApproveSearchParams.userOid = '';
        }
        break;
      }
      default:
        unApproveSearchParams[type] = value;
        break;
    }
    this.setState(unApproveSearchParams);
  }
  eventHandleApp = (type, value) => {
    const {approveSearchParams} = this.state;
    switch (type) {
      case 'beginDate': {
        if(value){
          approveSearchParams.beginDate = moment(value).format('YYYY-MM-DD');
        }else{
          approveSearchParams.beginDate = '';
        }
        break;
      }
      case 'endDate': {
        if(value){
          approveSearchParams.endDate = moment(value).format('YYYY-MM-DD');
        }else{
          approveSearchParams.endDate = '';
        }
        break;
      }
      case 'userOid': {
        if(value && value[0]){
          approveSearchParams.userOid = value[0].userOID;
        }else{
          approveSearchParams.userOid = '';
        }
        break;
      }
      default:
        approveSearchParams[type] = value;
        break;
    }
    this.setState(approveSearchParams);
  }
  //未审批搜索
  unapprovedSearch = (values) => {
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    if(values.userOid && values.userOid[0]){
      values.userOid = values.userOid[0];
    }
    this.setState({...this.state.unApproveSearchParams,...values}, () => {
      this.unApprovedtable.search({...this.state.unApproveSearchParams,...values, finished: 'false'})
    })
  };

  //审批搜索
  approvedSearch = (values) => {
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    if(values.userOid && values.userOid[0]){
      values.userOid = values.userOid[0];
    }
    this.setState({...this.state.approveSearchParams,...values}, () => {
      this.approvedtable.search({...this.state.approveSearchParams,...values, finished: 'true'})
    })
  };

  changeApp = (e) =>{
    let {approveSearchParams} = this.state;
    if(e && e.target && e.target.value){
      approveSearchParams.businessCode = e.target.value;
    }else{
      approveSearchParams.businessCode = '';
    }
    this.setState({approveSearchParams});
  }

  change = (e) =>{
    let {unApproveSearchParams} = this.state;
    if(e && e.target && e.target.value){
      unApproveSearchParams.businessCode = e.target.value;
    }else{
      unApproveSearchParams.businessCode = '';
    }
    this.setState({unApproveSearchParams});
  }

  //进入预付款情页
  handleRowClick = (record) => {
    //this.context.router.push(this.state.PrePaymentDetail.url.replace(':id', record.id).replace(":entityOID", record.entityOID).replace(":flag", this.state.tabValue))
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/approval-management/pre-payment-approve/pre-payment-approve-detail/${record.id}/${record.entityOID}/${this.state.tabValue}`,
      })
    );
  };
  filterData = (data) => {
    return data.map(item => {
      return {...item.prepaymentApprovalView, entityOID: item.entityOID}
    });
  }
  /**未审批根据单据编号查询 */
  onDocumentSearch = (value) => {
    this.setState({
      unApproveSearchParams: {...this.state.unApproveSearchParams,businessCode: value}
    }, () => {
      this.unApprovedtable.search({...this.state.unApproveSearchParams, finished: 'false'})
    })
  }
  /**已审批根据单据编号查询 */
  onApprovedSearch = (value) => {
    this.setState({
      approveSearchParams: {...this.state.approveSearchParams,businessCode: value}
    }, () => {
      this.approvedtable.search({...this.state.approveSearchParams, finished: 'true'})
    })
  }
  handleTabsChange = (key) => {
    this.setState({
      tabValue: key,
      approveSearchParams:{},
      unApproveSearchParams:{}
    })
  };

  render() {
    const {tabValue, loading1, loading2, SearchForm1, SearchForm2, columns, unapprovedData, approvedData, unapprovedPagination, approvedPagination} = this.state;
    return (
      <div className="approve-contract">
        <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
          <TabPane tab={this.$t({id: "contract.unapproved"}/*未审批*/)} key="unapproved">
            {
              tabValue === 'unapproved' &&
              <div>
                <SearchArea searchForm={SearchForm1}
                            submitHandle={this.unapprovedSearch}
                            eventHandle={this.eventHandle}
                            maxLength={4}
                />
                <div className="table-header" style={{marginBottom: 12, marginTop: 12}}>
                  <Row>
                    <Col span={18}></Col>
                    <Col span={6}>
                      <Search
                        placeholder="请输入单据编号"
                        onSearch={this.onDocumentSearch}
                        onChange={this.change}
                        enterButton
                      />
                    </Col>
                  </Row>
                </div>
                <div className="table-header"></div>
                <CustomTable
                  url={`${config.baseUrl}/api/approvals/prepayment/filters`}
                  ref={ref => this.unApprovedtable = ref}
                  params={{finished: 'false'}}
                  columns={columns}
                  tableKey="entityOID"
                  filterData={this.filterData}
                  onClick={this.handleRowClick}
                />
              </div>
            }
          </TabPane>
          <TabPane tab={this.$t({id: "contract.approved"}/*已审批*/)} key="approved">
            {
              tabValue === 'approved' &&
              <div>
                <SearchArea searchForm={SearchForm1}
                            submitHandle={this.approvedSearch}
                            eventHandle={this.eventHandleApp}
                            maxLength={4}
                />
                <div className="table-header" style={{marginBottom: 12, marginTop: 12}}>
                  <Row>
                    <Col span={18}></Col>
                    <Col span={6}>
                      <Search
                        placeholder="请输入单据编号"
                        onSearch={this.onApprovedSearch}
                        onChange={this.changeApp}
                        enterButton
                      />
                    </Col>
                  </Row>
                </div>
                <div className="table-header"></div>
                <CustomTable
                  url={`${config.baseUrl}/api/approvals/prepayment/filters`}
                  ref={ref => this.approvedtable = ref}
                  params={{finished: 'true'}}
                  columns={columns}
                  tableKey="entityOID"
                  filterData={this.filterData}
                  onClick={this.handleRowClick}
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
    organization: state.user.organization
  }
}

const wrappedPayment = Form.create()((Payment));

export default connect(mapStateToProps, null, null, {withRef: true})(wrappedPayment)
