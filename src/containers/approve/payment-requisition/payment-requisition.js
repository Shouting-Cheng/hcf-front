import React from 'react'
import { Form, Tabs, Table, message, Badge, Popover, Input, Row, Col } from 'antd'
const TabPane = Tabs.TabPane;
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import config from 'config'

import SearchArea from 'widget/search-area'
import moment from 'moment'
const Search = Input.Search;

import paymentRequisitionService from 'containers/payment-requisition/paymentRequisitionService.service'

class PaymentRequisitionApprove extends React.Component {
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
            SearchForm1: [
                { type: 'select', colSpan: "6", id: 'typeId', label: '单据类型', options: [], getUrl: `${config.payUrl}/api/acp/request/type/query/${this.props.company.setOfBooksId}/${this.props.company.id}`, method: 'get', labelKey: 'description', valueKey: 'id', },
                {
                    type: 'list', listType: "bgtUserOID", options: [],
                    id: 'userOID', label: this.$t({id:'pay.refund.employeeName'}), labelKey: "fullName", valueKey: "userOID",colSpan: 6,single:true,
                    listExtraParams:{setOfBooksId: this.props.company.setOfBooksId}
                },
                {
                    type: 'items', id: 'dateRange', items: [
                        { type: 'date', id: 'beginDate', label: this.$t({ id: "contract.search.date.from" }/*提交时间从*/) },
                        { type: 'date', id: 'endDate', label: this.$t({ id: "contract.search.date.to" }/*提交时间至*/) }
                    ],
                    colSpan: '6'
                },
                {
                    type: 'items', id: 'amountRange', items: [
                        { type: 'input', id: 'amountFrom', label: '本币金额从' },
                        { type: 'input', id: 'amountTo', label: '本币金额至' },
                    ], colSpan: '6'
                },
                { type: 'input', id: 'description', label: "备注", colSpan: '6' },


            ],
            SearchForm2: [
                { type: 'select', colSpan: "6", id: 'typeId', label: '单据类型', options: [], getUrl: `${config.payUrl}/api/acp/request/type/query/${this.props.company.setOfBooksId}/${this.props.company.id}`, method: 'get', labelKey: 'description', valueKey: 'id', },
                {
                    type: 'list', listType: "bgtUserOID", options: [],
                    id: 'userOID', label: this.$t({id:'pay.refund.employeeName'}), labelKey: "fullName", valueKey: "userOID",colSpan: 6,single:true,
                    listExtraParams:{setOfBooksId: this.props.company.setOfBooksId}
                },
                {
                    type: 'items', id: 'dateRange', items: [
                        { type: 'date', id: 'beginDate', label: this.$t({ id: "contract.search.date.from" }/*提交时间从*/) },
                        { type: 'date', id: 'endDate', label: this.$t({ id: "contract.search.date.to" }/*提交时间至*/) }
                    ],
                    colSpan: '6'
                },
                {
                    type: 'items', id: 'amountRange', items: [
                        { type: 'input', id: 'amountFrom', label: '本币金额从' },
                        { type: 'input', id: 'amountTo', label: '本币金额至' },
                    ], colSpan: '6'
                },
                { type: 'input', id: 'description', label: "备注", colSpan: '6' },
            ],
            unApproveSearchParams: {},
            approveSearchParams: {},
            columns: [
                { title: '序号', dataIndex: 'id', render: (value, record, index) => index + 1, width: 50, align: "center" },
                { title: '单据编号', dataIndex: 'acpPaymentCode', width: 200,render:(value)=>{
                    return(
                        <Popover content={value}>{value}</Popover>
                    )
                } },
                { title: '单据类型', dataIndex: 'typeName',render:(value)=>{
                    return(
                        <Popover content={value}>{value}</Popover>
                    )
                } },
                { title: '申请人', dataIndex: 'applicantName', width: 100 },
                { title: '提交日期', dataIndex: 'stringSubmitDate', width: 90,align: "center", render: (value) => moment(value).format('YYYY-MM-DD') },
                // {title: '币种', dataIndex: 'currency'},
                { title: '本币金额', dataIndex: 'totalAmount', render: this.filterMoney },
                // { title: '已核销金额', dataIndex: 'pppamount', render: this.filterMoney },
                {
                    title: '备注', dataIndex: 'description', render: (value) => {
                        return (
                            <Popover content={value}>{value}</Popover>
                        )
                    }
                },
                {
                    title: '状态', dataIndex: 'status', align: "center", width: 100,render: (value, record) => {
                        return (
                            <Badge status={this.state.status[value].state} text={this.state.status[value].label} />
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
            paymentRequisitionDetail: '/approval-management/approve-payment-requisition/payment-requisition-detail/:id/:entityOID/:flag', //
        }
    }

    componentWillMount() {
        return new Promise((resolve, reject) => {
            this.getUnapprovedList(resolve, reject);
            this.getApprovedList(resolve, reject)
        }).catch(() => {
            message.error(this.$t({ id: "common.error" }/*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/))
        });
    }

    //获取未审批列表
    getUnapprovedList = (resolve, reject) => {

        const { unapprovedPage, unapprovedPageSize, unApproveSearchParams } = this.state;

        this.setState({ loading1: true });

        let params = {
            ...unApproveSearchParams,
            businessCode: unApproveSearchParams.businessCode ?unApproveSearchParams.businessCode:null,
            page: unapprovedPage, size: unapprovedPageSize, finished: false
        };

        paymentRequisitionService.getPaymentList(params).then((res) => {

            if (res.status === 200) {
                this.setState({
                    unapprovedData: res.data.map(item => {
                        return {
                            ...item.acpPaymentApprovalView,
                            entityOID: item.entityOID
                        }
                    }) || [],
                    loading1: false,
                    unapprovedPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: unapprovedPage + 1,
                        onChange: this.onUnapprovedChangePaper,
                        onShowSizeChange: this.onShowSizeChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total }),
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
            ...approveSearchParams,
            businessCode:approveSearchParams.businessCode?approveSearchParams.businessCode:null,
            page: approvedPage,
            size: approvedPageSize,
            finished: true
        };
        paymentRequisitionService.getPaymentList(params).then((res) => {
            if (res.status === 200) {
                this.setState({
                    approvedData: res.data.map(item => {
                        return {
                            ...item.acpPaymentApprovalView,
                            entityOID: item.entityOID
                        }
                    }) || [],
                    loading2: false,
                    approvedPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: approvedPage + 1,
                        onChange: this.onApprovedChangePaper,
                        onShowSizeChange: this.onShowApprovedSizeChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total }),
                    }
                });
                resolve && resolve()
            }
        }).catch(() => {
            this.setState({ loading2: false });
            reject && reject()
        })
    };

    //未审批点击页码
    onUnapprovedChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ unapprovedPage: page - 1 }, () => {
                this.getUnapprovedList()
            })
        }
    };
    //未审批改变每页显示的条数
    onShowSizeChange = (current, pageSize) => {
        this.setState({ unapprovedPage: current - 1, pageSize }, () => {
            this.getUnapprovedList()
        })
    }
    //审批点击页码
    onApprovedChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ approvedPage: page - 1 }, () => {
                this.getApprovedList()
            })
        }
    };
    //已审批改变每页显示的条数
    onShowApprovedSizeChange = (current, pageSize) => {
        this.setState({ approvedPage: current - 1, pageSize }, () => {
            this.getApprovedList()
        })
    }
    //未审批搜索
    unapprovedSearch = (values) => {
        values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
        values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
        this.setState({ unApproveSearchParams: {...this.state.unApproveSearchParams,...values }}, () => {
            this.getUnapprovedList()
        })
    };

    //审批搜索
    approvedSearch = (values) => {
        values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
        values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
        this.setState({ approveSearchParams: {...this.state.approveSearchParams,...values }}, () => {
            this.getApprovedList()
        })
    };

    //进入详情页
    handleRowClick = (record, flag) => {
      let path = this.state.paymentRequisitionDetail.replace(':id', record.id).replace(":entityOID", record.entityOID).replace(":flag", flag);
      this.props.dispatch(
        routerRedux.push({
          pathname: path,
        })
      );
    };

    clearUnApproveHandle = () => {
        this.setState({
            unApproveSearchParams:{}
        })
    };
    clearApproveHandle = () => {
        this.setState({
            approveSearchParams:{}
        })
    };
    //按照付款申请单单号查询
    onDocumentSearch = (value) => {
        this.setState({ unApproveSearchParams: { businessCode: value } }, () => {
            this.getUnapprovedList()
        })
    }
    onApprovedSearch = (value) => {
        this.setState({ approveSearchParams: { businessCode: value } }, () => {
            this.getApprovedList()
        })
    }
    handleTabsChange = (key)=>{
        this.setState({
          tabValue: key
        })
      };
    render() {
        const { tabValue, loading1, loading2, SearchForm1, SearchForm2, columns, unapprovedData, approvedData, unapprovedPagination, approvedPagination } = this.state;
        return (
            <div className="approve-contract">
                <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
                    <TabPane tab="未审批" key="unapproved">
                    {
                            tabValue === 'unapproved' &&
                           <div>
                        <SearchArea searchForm={SearchForm1}
                            submitHandle={this.unapprovedSearch}
                            clearHandle={this.clearUnApproveHandle}
                            maxLength={4}
                        />
                        <div className='divider'></div>
                        <div className="table-header">
                            <Row>
                                <Col span={18}></Col>
                                <Col span={6}>
                                    <Search
                                        placeholder="请输入付款申请单单号"
                                        onSearch={this.onDocumentSearch}
                                        enterButton
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="table-header"></div>
                        <Table rowKey={record => record.id}
                            columns={columns} dataSource={unapprovedData} pagination={unapprovedPagination}
                            loading={loading1}
                            onRow={record => ({
                                onClick: () => this.handleRowClick(record, "true")
                            })}
                            // scroll={{ x: true, y: false }}
                            bordered
                            size="middle" />
                            </div>
                    }
                    </TabPane>
                    <TabPane tab="已审批" key="approved">
                    {
                        tabValue === 'approved' &&
                        <div>
                                 <SearchArea searchForm={SearchForm2}
                            submitHandle={this.approvedSearch}
                            clearHandle={this.clearApproveHandle}
                            maxLength={4}
                        />
                        <div className='divider'></div>
                        <div className="table-header">
                            <Row>
                                <Col span={18}></Col>
                                <Col span={6}>
                                    <Search
                                        placeholder="请输入付款申请单单号"
                                        onSearch={this.onApprovedSearch}
                                        enterButton
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="table-header"></div>
                        <Table rowKey={record => record.id}
                            columns={columns}
                            dataSource={approvedData} pagination={approvedPagination} loading={loading2}
                            onRow={record => ({
                                onClick: () => this.handleRowClick(record, "false")
                            })}
                            // scroll={{ x: true, y: false }}
                            bordered
                            size="middle" />
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

const wrappedPaymentRequisitionApprove = Form.create()(PaymentRequisitionApprove);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPaymentRequisitionApprove)
