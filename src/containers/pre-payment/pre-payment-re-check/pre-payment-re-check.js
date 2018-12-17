import React from 'react'
import { connect } from 'dva'
import {Form, Tabs, message, Badge, Popover, InputNumber, Row, Col, Input} from 'antd'
const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute'
import prePaymentService from './pre-payment-re-check.service'
import config from 'config'

import SearchArea from 'widget/search-area'
import moment from 'moment'
import { routerRedux } from 'dva/router';
const Search = Input.Search;
import CustomTable from "components/Widget/custom-table";

class Payment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabValue: 'unapproved',
            loading1: false,
            loading2: false,
            status: {
                1001: { label: '编辑中', state: 'default' },
                1004: { label: '审批通过', state: 'success' },
                1002: { label: '审批中', state: 'processing' },
                1005: { label: '审批驳回', state: 'error' },
                1003: { label: '撤回', state: 'warning' }
            },
            searchForm1: [
/*
                { type: 'input', id: 'requisitionNumber', label: '单据编号' },
*/
                { colSpan: '6', type: 'select', id: 'paymentReqTypeId', label: '单据类型', getUrl: `${config.prePaymentUrl}/api/cash/pay/requisition/types//queryAll?setOfBookId=${this.props.company.setOfBooksId}`, options: [], method: "get", valueKey: "id", labelKey: "typeName" },
                {
                  type: 'list', listType: "bgtUser", options: [], id: 'employeeId', label: "申请人", labelKey: "fullName",
                  valueKey: "id", single: true, colSpan: '6',
                },
                { colSpan: '6',
                  type: 'items', id: 'dateRange', items: [
                        { type: 'date', id: 'submitDateFrom', label: "提交日期从" },
                        { type: 'date', id: 'submitDateTo', label: "提交日期至" }
                    ]
                },
                { colSpan: '6',
                  type: 'items', id: 'amountRange', items: [
                        { type: 'inputNumber', id: 'advancePaymentAmountFrom', label: "本币金额从" },
                        { type: 'inputNumber', id: 'advancePaymentAmountTo', label: "本币金额至" }
                    ]
                },
              {type: 'input', id: 'description', label: "备注", colSpan: '6',event:"description"},

            ],
            searchForm2: [
/*
                { type: 'input', id: 'requisitionNumber', label: '单据编号' },
*/
                { colSpan: '6',type: 'select', id: 'paymentReqTypeId', label: '单据类型', getUrl: `${config.prePaymentUrl}/api/cash/pay/requisition/types//queryAll?setOfBookId=${this.props.company.setOfBooksId}`, options: [], method: "get", valueKey: "id", labelKey: "typeName" },
                {colSpan: '6',
                  type: 'list', listType: "bgtUser", options: [], id: 'employeeId', label: "申请人", labelKey: "fullName",
                  valueKey: "id", single: true
                },
                {colSpan: '6',
                    type: 'items', id: 'dateRange', items: [
                        { type: 'date', id: 'submitDateFrom', label: "提交日期从" },
                        { type: 'date', id: 'submitDateTo', label: "提交日期至" }
                    ]
                },
                {colSpan: '6',
                    type: 'items', id: 'amountRange', items: [
                        { type: 'inputNumber', id: 'advancePaymentAmountFrom', label: "本币金额从" },
                        { type: 'inputNumber', id: 'advancePaymentAmountTo', label: "本币金额至" }
                    ]
                },
              {type: 'input', id: 'description', label: "备注", colSpan: '6',event:"description"},

            ],
            unApproveSearchParams: {},
            approveSearchParams: {},
            columns: [
                { title: '单据编号', dataIndex: 'requisitionNumber', width: 180,align: 'center',
                  render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>},
                { title: '单据类型', dataIndex: 'typeName',align: 'center',
                  render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>},
                { title: '申请人', dataIndex: 'createByName', width: 100,align:"center",
                  render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>},
                { title: '提交日期', dataIndex: 'submitDate',width:90,align:"center",
                  render: desc => <span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc ? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span> },
                // {title: '币种', dataIndex: 'currency'},
                { title: '本币金额', dataIndex: 'advancePaymentAmount', align: 'center',
                  render: desc => <span className="money-cell"><Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover></span>},
                // { title: '已核销金额', dataIndex: 'pppamount', render: this.filterMoney },
                {
                    title: '备注', dataIndex: 'description',align: 'center', render: (value) => {
                        return (
                            <Popover content={value}>{value}</Popover>
                        )
                    }
                },
                {
                    title: '状态', dataIndex: 'status',width:100, align: "center", render: (value, record) => {
                        return (
                            <Badge status={this.state.status[value].state} text={this.state.status[value].label} />
                        )
                    }
                }
            ],
            unapprovedData: [],
            approvedData: [],
            unapprovedPagination: {
            },
            approvedPagination: {
            },
            unapprovedPage: 0,
            unapprovedPageSize: 10,
            approvedPage: 0,
            approvedPageSize: 10,
            // PrePaymentDetail: menuRoute.getRouteItem('pre-payment-re-check-detail', 'key'), //合同详情
        }
    }

    componentWillMount() {

        console.log(window.location);
        this.setState({ tabValue: window.location.search.approved ? 'approved' : 'unapproved' });
        return new Promise((resolve, reject) => {
            this.getUnapprovedList(resolve, reject);
            this.getApprovedList(resolve, reject)
        }).catch(() => {
            message.error(this.$t("common.error"/*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/))
        });
    }

    getQueryString = (name) => {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    //获取未审批列表
    getUnapprovedList = (resolve, reject) => {
        const { unapprovedPage, unapprovedPageSize, unApproveSearchParams } = this.state;

        this.setState({ loading1: true });
        let params = { ...unApproveSearchParams, page: unapprovedPage, size: unapprovedPageSize, status: 1002 };

        prePaymentService.getPrePaymentList(params).then((res) => {

            if (res.status === 200) {
                this.setState({
                    unapprovedData: res.data || [],
                    loading1: false,
                    unapprovedPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: unapprovedPage + 1,
                        onChange: this.onUnapprovedChangePaper
                    }
                });
                resolve && resolve()
            }
        }).catch(() => {
            this.setState({ loading1: false });
            reject && reject()
        })
    };

    //获取审批列表
    getApprovedList = (resolve, reject) => {
        const { approvedPage, approvedPageSize, approveSearchParams } = this.state;
        this.setState({ loading2: true });
        let params = {
            ...approveSearchParams, page: approvedPage, size: approvedPageSize, status: 1004,
            checkBy: this.props.user.id
        };
        prePaymentService.getPrePaymentList(params).then((res) => {
            if (res.status === 200) {
                this.setState({
                    approvedData: res.data || [],
                    loading2: false,
                    approvedPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        onChange: this.onApprovedChangePaper
                    }
                });
                resolve && resolve()
            }
        }).catch(() => {
            this.setState({ loading2: false });
            reject && reject()
        })
    };

  /*  //未审批点击页码
    onUnapprovedChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ unapprovedPage: page - 1 }, () => {
                this.getUnapprovedList()
            })
        }
    };*/

    //审批点击页码
/*    onApprovedChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ approvedPage: page - 1 }, () => {
                this.getApprovedList()
            })
        }
    };*/

    //未审批搜索
    unapprovedSearch = (values) => {
      values.submitDateFrom && (values.submitDateFrom = values.submitDateFrom.format('YYYY-MM-DD'));
      values.submitDateTo && (values.submitDateTo = values.submitDateTo.format('YYYY-MM-DD'));
      values.status = 1002;
      values.employeeId && (values.employeeId = values.employeeId[0]);

        this.setState({ unApproveSearchParams: values }, () => {
            this.unApprovedtable.search(values)
        })
    };

    //审批搜索
    approvedSearch = (values) => {
        values.submitDateFrom && (values.submitDateFrom = values.submitDateFrom.format('YYYY-MM-DD'));
        values.submitDateTo && (values.submitDateTo = values.submitDateTo.format('YYYY-MM-DD'));
        values.status = 1004;
        values.employeeId && (values.employeeId = values.employeeId[0]);
        this.setState({ approveSearchParams: values }, () => {
          this.approvedtable.search(values)

          this.getApprovedList()
        })
    };

    //进入合同详情页
    handleRowClick = (record) => {
        this.props.dispatch(
            routerRedux.replace({
                pathname: `/pre-payment/pre-payment-recheck/pre-payment-detail/${record.id}`,
            })
        );
    };

    handleTabsChange = (key) => {
        this.setState({
            tabValue: key
        })
    };


  /**未审批根据单据编号查询 */
  onDocumentSearch = (value) => {
    this.setState({
      unApproveSearchParams: {...this.state.unApproveSearchParams,
        requisitionNumber:value,
        status:1002
      }
    }, () => {
      this.unApprovedtable&&this.unApprovedtable.search({...this.state.unApproveSearchParams, finished: 'false',})
    })
  }
  /**已审批根据单据编号查询 */
  onApprovedSearch = (value) => {
    this.setState({
      approveSearchParams: {...this.state.approveSearchParams,
        checkBy: this.props.user.id,
        status: 1004,
        requisitionNumber:value
      }
    }, () => {
      this.approvedtable&&this.approvedtable.search({...this.state.approveSearchParams, finished: 'true'})
    })
  }
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


  render() {

        const { tabValue, loading1, loading2, searchForm1, searchForm2, columns, unapprovedData, approvedData, unapprovedPagination, approvedPagination } = this.state;
        return (
            <div className="approve-contract">
                <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
                    <TabPane tab={this.$t("contract.unchecked")} key="unapproved">
                        {
                            tabValue === 'unapproved' &&
                            <div>
                                <SearchArea searchForm={searchForm1}
                                            maxLength={4}
                                    submitHandle={this.unapprovedSearch} />
                                <div className="table-header" style={{marginBottom: 12, marginTop: 12}}>
                                <Row>
                                  <Col span={18}></Col>
                                  <Col span={6}>
                                    <Search
                                      placeholder="请输入单据编号"
                                      onSearch={this.onDocumentSearch}
                                      onChange={this.changeApp}
                                      enterButton
                                    />
                                  </Col>
                                </Row>
                              </div>
                              <CustomTable
                                url={`${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/query?ifWorkflow=false`}
                                ref={ref => this.unApprovedtable = ref}
                                params={{status: 1002}}
                                columns={columns}
                                //tableKey="entityOID"
                                //filterData={this.filterData}
                                onClick={this.handleRowClick}
                              />
                            </div>
                        }
                    </TabPane>
                    <TabPane tab={this.$t("contract.checked")} key="approved">
                        {
                            tabValue === 'approved' &&
                            <div>
                                <SearchArea searchForm={searchForm2}
                                    maxLength={4}
                                    submitHandle={this.approvedSearch} />
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
                                url={`${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/query?ifWorkflow=false`}
                                ref={ref => this.approvedtable = ref}
                                params={{status: 1004}}
                                columns={columns}
                                //filterData={this.filterData}
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
        company: state.user.company
    }
}

const wrappedPayment = Form.create()(Payment);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPayment)
