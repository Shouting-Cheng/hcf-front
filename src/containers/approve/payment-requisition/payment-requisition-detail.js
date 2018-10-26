/**
 * Created by seripin on 2018/1/25.
 */
import React from 'react'
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment'
import { Form, Tag, Tabs, Button, Row, Col, Spin, Breadcrumb, Table, Badge, message, Popover, Popconfirm, Affix, Divider, Modal } from 'antd'
const TabPane = Tabs.TabPane;
import paymentRequisitionService from 'containers/payment-requisition/paymentRequisitionService.service'
import ApproveBar from 'widget/Template/approve-bar'
import ExpreportDetail from 'containers/reimburse/my-reimburse/reimburse-detail1' // todo
import ContractDetail from 'containers/contract/my-contract/contract-detail'
import ApproveHistory from "containers/payment-requisition/approve-history-work-flow"
import DocumentBasicInfo from 'widget/document-basic-info'

class PaymentRequisitionDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageLoading: false,
            loading: false,
            dLoading: false,
            isNew: true,
            headerData: {
                paymentRequisitionNumberDTO: []
            },
            historyLoading: false,
            approveHistory: [],
            record: {},
            detailId: undefined,//合同或者报账单ID
            columns: [
                { title: '序号', dataIndex: 'index', align: "center", width: '7%', render: (value, record, index) => (index + 1) },
                {
                    title: '申请金额', dataIndex: 'amount', width: 120,
                    render: (value, record) => {
                        return (
                            <div>
                                <div style={{ textAlign: "left", width: '20%' }}>{record.currencyCode}&nbsp;&nbsp;{this.filterMoney(record.amount)}</div>
                                {/* <div style={{ whiteSpace: "normal" }}>{this.filterMoney(record.amount)}</div> */}
                            </div>
                        )
                    }
                },
                {
                    title: '收款对象', dataIndex: 'currency', width: 120, render: (value, record) => {
                        return (
                            <div>
                                <div><Tag color="#000">{record.partnerCategory == "EMPLOYEE" ? "员工" : "供应商"}</Tag></div>
                                <div>{record.partnerName}</div>
                            </div>
                        );
                    }
                },
                {
                    title: "收款账户", dataIndex: 'accountName', width: 180,
                    render: (value, record) => {
                        return (
                            <Popover content={
                                <div>
                                    <div>{this.$t({ id: "acp.account" }/*账户：*/)}{record.accountNumber}</div>
                                    <div>{this.$t({ id: "acp.account.name" }/*户名*/)}{value}</div>
                                </div>
                            }>
                                <div>
                                    <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t({ id: "acp.account" }/*账户：*/)}{record.accountNumber}</div>
                                    <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{this.$t({ id: "acp.account.name" }/*户名*/)}{value}</div>
                                </div>
                            </Popover>

                        )
                    }
                },
                {
                    title: '付款属性', dataIndex: 'cshTransactionClassName', width: 160,
                    render: (value, record) => {
                        return (
                            <Popover content={
                                <div>
                                    <div>付款方式类型：{record.paymentMethodCategoryName}</div>
                                    <div>付款用途：{value}</div>
                                </div>
                            }>
                                <div>
                                    <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>付款方式类型：{record.paymentMethodCategoryName}</div>
                                    <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>付款用途：{value}</div>
                                </div>
                            </Popover>
                        )
                    }
                },
                { title: '计划付款日期', dataIndex: 'schedulePaymentDate', render: value => moment(value).format('YYYY-MM-DD') },
                {
                    title: "备注", dataIndex: "description", key: "description",
                    render: (value, record) => {
                        return (
                            <span>{record.lineDescription}</span>
                        )
                    }
                },
            ],
            pagination: {
                total: 0
            },
            pageSize: 5,
            page: 0,
            myPaymentRequisition: '/approval-management/approve-payment-requisition',    //审批界面
            showExpreportDetail: false,//报账单详情
            showContractDetail: false,//合同详情
            headerInfo:{}
        }
    }

    componentWillMount() {
        this.getList();
        this.getLogs();
    }

    getList = () => {
        this.setState({ pageLoading: true });
        const { page,pageSize } = this.state;
        paymentRequisitionService.queryDetailById(this.props.match.params.id).then(res => {
            if (res.status == 200) {
                let {headerInfo}=this.state;
                if(!headerInfo.businessCode){
                    headerInfo={
                        businessCode:res.data.requisitionNumber,
                        createdDate: res.data.requisitionDate,
                        formName: res.data.acpReqTypeName,
                        createByName: res.data.createdName,
                        totalAmount: res.data.functionAmount,
                        statusCode: res.data.status,
                        remark: res.data.description,
                        currencyCode: 'CNY',
                        infoList:[
                            { label: "申请人", value: res.data.createdName },
                            { label: "公司", value: res.data.companyName },
                            { label: "部门", value: res.data.unitName }
                        ]
                    }
                }else{
                    headerInfo.totalAmount = res.data.functionAmount;
                }
                this.setState({
                    headerData: res.data,
                    pageLoading: false,
                    pagination: {
                        total: res.data.paymentRequisitionLineDTO.length,
                        current: page + 1,
                        pageSize: pageSize,
                        onChange: this.onChangePaper,
                        onShowSizeChange: this.onShowSizeChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total }),
                        pageSizeOptions: ['5','10', '20', '30', '40'],
                    },
                    headerInfo:headerInfo
                });
            }
        }).catch(() => {
            this.setState({
                pageLoading: false
            });
        })
    };
    //翻页
    onChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({ page: page - 1 }, () => {
                this.getList()
            })
        }
    }
    //改变每页显示条数
    onShowSizeChange = (current, pageSize) => {
        this.setState({
            page: current - 1,
            pageSize:pageSize
        }, () => {
            this.getList()
        })
    }
    getLogs = () => {
        this.setState({
            historyLoading: true,
        });
        paymentRequisitionService.getLogs(this.props.match.params.entityOID).then(res => {
            if (res.status == 200) {
                this.setState({
                    approveHistory: res.data,
                    historyLoading: false
                });
            }
        }).catch(e => {
            this.setState({
                historyLoading: false
            });
        })
    };
    renderList = (title, value) => {
        return (
            <Row className="list-info">
                <Col span={6}>{title}：</Col>
                <Col className="content" span={18}>{value}</Col>
            </Row>
        )
    };

    // 扩展行
    expandedRowRender = (record) => {
        return (
            <div>
                <Row>
                    <Col span={2}>
                        <span style={{ float: 'right' }}>{this.$t({ id: 'acp.amount.attribute' }/*金额属性*/)}</span>
                    </Col>
                    <Col span={6} offset={1}>
                        汇率日期：
                    </Col>
                    <Col span={6}>
                        汇率：{record.exchangeRate}
                    </Col>
                    <Col span={5}>
                        本币金额：{record.currencyCode}&nbsp; {this.filterMoney(record.functionAmount, 2, true)}
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col style={{ textAlign: "right" }} span={2}>
                        <span>{this.$t({ id: "acp.relation.document" }/*关联单据*/)}</span>
                    </Col>
                    <Col span={6} offset={1}>
                        <span >{this.$t({ id: "acp.public.document" }/*报账单*/)}：</span>
                        <a onClick={() => { this.onViewExpreportDetail(record.refDocumentId) }}>{record.refDocumentNumber ? record.refDocumentNumber : "-"}</a>
                    </Col>
                    <Col span={6} >{this.$t({ id: 'acp.delay.amount' }/*延迟支付金额*/)}{record.currencyCode} {this.filterMoney(record.freezeAmount, 2, true)}</Col>
                    <Col span={5} >
                        <span>{this.$t({ id: "acp.enabled.amount" }/*可申请金额*/)}{record.currencyCode} {this.filterMoney(record.availableAmount, 2, true)}</span>
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={2} >
                        <span style={{ float: 'right' }}>{this.$t({ id: "acp.relation.contract" }/*关联合同：*/)}</span>
                        {/* <a onClick={() => { this.onViewContractDetail(record.contractHeaderId) }}>{record.contractNumber ? record.contractNumber : "-"}</a> */}
                    </Col>
                    <Col span={6} offset={1}>
                        <span>{this.$t({ id: "acp.contract.name" }/*合同名称*/)}：{record.contractName}</span>
                    </Col>
                    <Col span={6}>
                        <span>{this.$t({ id: 'acp.contract.number' }/*合同编号*/)}：</span>
                        <a onClick={() => { this.onViewContractDetail(record.contractHeaderId) }}>{record.contractNumber ? record.contractNumber : "-"}</a>
                    </Col>
                    <Col span={4}>
                        <span>{this.$t({ id: "acp.contract.lineNumber" }/*付款计划序号：*/)}</span>
                        <span >{record.contractLineNumber ? record.contractLineNumber : "-"}</span>
                    </Col>
                    <Col span={5}>
                        <span>{this.$t({ id: 'acp.schedulePaymentDate' }/*计划付款日期*/)}：</span>
                        <span>{record.contractDueDate ? record.contractDueDate : '-'}</span>
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={2}>
                        <span style={{ float: 'right' }}>{this.$t({ id: 'acp.payment.log' }/*付款日志*/)}</span>
                    </Col>
                    <Col span={6} offset={1}>
                        <span>{this.$t({ id: 'acp.payment.amount' }/*已付款总金额*/)}： {record.currencyCode}&nbsp;{this.filterMoney(record.payAmount, 2, true)}</span>
                    </Col>
                    <Col span={6}>
                        <span>{this.$t({ id: 'acp.return.amount' }/*退款总金额*/)}： {record.currencyCode}&nbsp;{this.filterMoney(record.returnAmount, 2, true)}</span>
                    </Col>
                </Row>
            </div>
        );
    };


    //返回
    onCancel = () => {
      this.props.dispatch(
        routerRedux.push({
          pathname: this.state.myPaymentRequisition,
        })
      );
    };

    wrapClose = (content) => {
        let id = this.state.detailId;
        const newProps = {
            params: { id: id, refund: true }
        };
        return React.createElement(content, Object.assign({}, newProps.params, newProps));
    };

    //合同返回
    onCloseContract = () => {
        this.setState({ showContractDetail: false })
    };
    //报账单返回
    onCloseExpreport = () => {
        this.setState({ showExpreportDetail: false })
    };
    //查看合同
    onViewContractDetail = (id) => {
        this.setState({ showContractDetail: true, detailId: id })
    };
    //查看报账单
    onViewExpreportDetail = (id) => {
        this.setState({ showExpreportDetail: true, detailId: id })
    };

    //驳回
    handleApproveReject = (remark) => {
        let entityOID = this.props.match.params.entityOID;
        let model = {
            "approvalTxt": remark,
            "entities": [
                {
                    "entityOID": entityOID,
                    "entityType": 801005
                }]
        };

        this.setState({ dLoading: true, loading: true });

        paymentRequisitionService.rejectFunction(model).then(res => {
            if (res.status === 200 && res.data.failNum === 0) {
                this.setState({ dLoading: false, loading: false });
                this.onCancel();
                message.success("操作成功！");
            } else {
                this.setState({ dLoading: false, loading: false });
                message.error(`驳回失败!` + res.data.failReason[entityOID]);
            }
        }).catch(e => {
            this.setState({ dLoading: false, loading: false });
            message.error(`驳回失败，${e.response.data.message}`)
        })
    };

    //审批通过
    handleApprovePass = (remark) => {
        let entityOID = this.props.match.params.entityOID;
        let model = {
            approvalTxt: remark,
            entities: [
                {
                    entityOID: entityOID,
                    entityType: 801005
                }],
            countersignApproverOIDs: []
        };

        this.setState({ dLoading: true, loading: true });

        paymentRequisitionService.passFunction(model).then(res => {
            if (res.status === 200 && res.data.failNum === 0) {
                this.setState({ dLoading: false, loading: false });
                this.onCancel();
                message.success("操作成功！");
            } else {
                this.setState({ dLoading: false, loading: false });
                message.error(`审核失败!` + res.data.failReason[entityOID]);
            }
        }).catch(e => {
            this.setState({ dLoading: false, loading: false });
            message.error(`审核失败，${e.response.data.message}`)
        })
    };
    render() {
        const { dLoading, loading, headerData, pageLoading, columns, pagination,headerInfo } = this.state;
        const tableTitle1 = (
            <span>
                {headerData.paymentRequisitionNumberDTO.map((item, index) => {
                    return (
                        <div key={index} style={{ display: 'inline-block' }}>
                            {item.currencyCode === 'EUR' ? <span>&nbsp;&nbsp;</span> : <span>{this.$t({ id: "acp.amount" }/*金额：*/)}</span>}
                            <span style={{ color: 'Green' }}>{item.currencyCode} {this.filterMoney(item.amount)}</span>
                        </div>
                    )
                })}
            </span>
        );
        const tableTitle2 = (
            <span>
                {headerData.paymentRequisitionNumberDTO.length > 0 &&
                    <div style={{ display: 'inline-block' }}>
                        {this.$t({ id: "acp.function.amount" }/* 本币金额：*/)}
                        <span style={{ color: 'Green' }}>CNY {this.filterMoney(headerData.functionAmount)}</span>
                    </div>}
            </span>
        )
        let detailInfo = (
            <Spin spinning={pageLoading}>
                <h3 className="header-title">{headerData.acpReqTypeName}</h3>
                <Row>
                    <Col span={6}>
                        {this.renderList(this.$t({ id: "acp.createdBy" }/* 创建人*/), headerData.createdName)}
                        {this.renderList(this.$t({ id: "acp.createdDate" }/* 创建日期*/), moment(headerData.createdDate).format('YYYY-MM-DD'))}
                    </Col>
                    <Col span={6}>
                        {this.renderList(this.$t({ id: "acp.requisitionNumber" }/* 单据日期*/), headerData.requisitionNumber)}
                    </Col>
                    <Col span={12}>
                        <div style={{ float: 'right' }}>
                            <div className="amount-title">{this.$t({ id: "acp.table.amount" }/* 总金额*/)}</div>
                            <div className="amount-content">CNY&nbsp;{this.filterMoney(headerData.functionAmount)}</div>
                        </div>
                        <div style={{ float: 'right', marginRight: '50px' }}>
                            <div className="status-title">{this.$t({ id: "acp.status" }/* 状态*/)}</div>
                            <div className="status-content">{this.RenderStatus(headerData.status)}</div>
                        </div>
                    </Col>
                </Row>
            </Spin>
        );
        let subContent = (
            <div>
                <Spin spinning={false}>
                    <div className="tab-container" style={{ marginBottom: 16 }}>
                        <h3 className="sub-header-title">{this.$t({ id: "acp.payment.info" }/* 付款信息*/)}</h3>
                        <div className="table-header">
                            <div style={{ float: 'right' }}>
                                <Breadcrumb style={{ marginBottom: '10px' }}>
                                    <Breadcrumb.Item> {tableTitle1}</Breadcrumb.Item>
                                    <Breadcrumb.Item> {tableTitle2}</Breadcrumb.Item>
                                </Breadcrumb>
                            </div>
                        </div>
                        <Table rowKey={record => record.id}
                            style={{ clear: 'both' }}
                            columns={columns}
                            expandedRowRender={this.expandedRowRender}
                            dataSource={headerData.paymentRequisitionLineDTO}
                            bordered
                            loading={pageLoading}
                            pagination={pagination}
                            size="middle" />
                    </div>
                    <div style={{ padding: 20, paddingBottom: 70 }}>
                        <ApproveHistory loading={this.state.historyLoading} infoData={this.state.approveHistory}></ApproveHistory>
                    </div>
                </Spin>
            </div>
        );
        return (
            <div className="payment-requisition background-transparent">
                <div className="new-payment-requisition-detail">
                    <div className="top-info">
                        <Tabs onChange={this.handleTabsChange}>
                            <TabPane tab={this.$t({ id: "acp.document.info" }/* 单据信息*/)} key="detailInfo">
                                <DocumentBasicInfo params={headerInfo}>

                                </DocumentBasicInfo>
                            </TabPane>
                        </Tabs>
                    </div>
                    <Tabs onChange={this.handleTabsChange} className="detail-tabs">
                        <TabPane tab={this.$t({ id: "acp.basic.info" })} key="basicInfo">{subContent}</TabPane>
                    </Tabs>
                    <Modal visible={this.state.showExpreportDetail}
                        footer={[
                            <Button key="back" size="large" onClick={this.onCloseExpreport}>{this.$t({ id: "common.back" }/* 返回*/)}</Button>
                        ]}
                        width={1200}
                        closable={false}
                        destroyOnClose={true}
                        onCancel={this.onCloseExpreport}>
                        <div >
                            {this.wrapClose(ExpreportDetail)}
                        </div>
                    </Modal>

                    <Modal visible={this.state.showContractDetail}
                        footer={[
                            <Button key="back" size="large" onClick={this.onCloseContract}>{this.$t({ id: "common.back" }/* 返回*/)}</Button>
                        ]}
                        destroyOnClose={true}
                        width={1200}
                        closable={false}
                        onCancel={this.onCloseContract}>
                        <div >
                            {this.wrapClose(ContractDetail)}
                        </div>
                    </Modal>
                </div>
                <div>
                    {(this.props.match.params.flag === "true") ?
                        <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve">
                            <Row>
                                <Col span={18}>
                                    <ApproveBar passLoading={loading}
                                        style={{ paddingLeft: 20 }}
                                        backUrl={this.state.myPaymentRequisition}
                                        rejectLoading={dLoading}
                                        handleApprovePass={this.handleApprovePass}
                                        handleApproveReject={this.handleApproveReject} />
                                </Col>
                            </Row>
                        </Affix> :
                        <Affix offsetBottom={0} className="bottom-bar">
                            <Button loading={loading} onClick={this.onCancel} className="back-btn">{this.$t({ id: "common.back" }/*返回*/)}</Button>
                        </Affix>
                    }
                </div>
            </div>
        )
    }
}



React.Component.prototype.RenderStatus = (status) => {
    let pamentRequisitionStatus = {
        1001: { label: '编辑中', state: 'default' },
        1002: { label: '审批中', state: 'processing' },
        1003: { label: '已撤回', state: 'warning' },
        1004: { label: '审批通过', state: 'success' },
        1005: { label: '审批驳回', state: 'error' },
        6001: { label: '暂挂', state: 'warning' },
        6002: { label: '已取消', state: 'default' },
        6003: { label: '已完成', state: 'success' }
    };
    return status != undefined ? <Badge status={pamentRequisitionStatus[status].state} text={pamentRequisitionStatus[status].label} /> : <p />;
};



const wrappedPaymentRequisitionDetail = Form.create()(PaymentRequisitionDetail);


function mapStateToProps(state) {
    return {
        company: state.user.company,
        user: state.user.currentUser
    }
}
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPaymentRequisitionDetail);
