import React from 'react';
import { Input, Table, message, Badge, Button, Row, Col, Popover } from 'antd';
import { connect } from 'dva'
import SearchArea from 'components/Widget/search-area';
import config from 'config';
import moment from 'moment';
import PublicReimburseReportService from 'containers/financial-view/public-reimburse-report/public-reimburse-report.service';
import ListSelector from 'components/Widget/list-selector'
import ExcelExporter from 'components/Widget/excel-exporter.js'
import FileSaver from 'file-saver';
const Search = Input.Search;

// import { Button } from 'antd/lib/radio';
class PublicReimburseReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            backlashFlagList: [
                { value: 1, label: "未反冲" },
                { value: 2, label: "部分反冲" },
                { value: 3, label: "已反冲" },
            ],
            status: {
                1001: { label: '编辑中', state: 'default' },
                1004: { label: '审批通过', state: 'success' },
                1002: { label: '审批中', state: 'processing' },
                1005: { label: '审批驳回', state: 'error' },
                1003: { label: '撤回', state: 'warning' },
                0: { label: '未知', state: 'warning' },
                2002: { label: '审核通过', state: 'success' },
                2001: { label: '审核驳回', state: 'error' },
            },
            reverseStatus: {
                1001: { label: '编辑中', state: 'default' },
                1004: { label: '审核通过', state: 'success' },
                1002: { label: '审核中', state: 'processing' },
                1005: { label: '审核驳回', state: 'error' },
                1003: { label: '撤回', state: 'warning' },
            },
            applicationType: {
                1001: { label: '费用申请' },
                1002: { label: '差旅申请' },
                1003: { label: '订票申请' },
                1004: { label: '京东订单申请' },
                2005: { label: '借款申请' },
                4100: { label: '汉得flyback' }
            },
            operationTypeList: {
                payment: { label: '付款' },
                reserved: { label: '反冲' },
                refund: { label: '退票' },
                return: { label: '退款' }
            },
            searchForm: [
                {
                    type: 'select', label: '单据公司', id: 'companyId', getUrl: `${config.baseUrl}/api/company/by/condition`,
                    getParams: { setOfBooksId: this.props.company.setOfBooksId }, method: 'get', options: [], colSpan: '6', valueKey: "id", labelKey: "name"
                },
                { type: 'select', id: 'documentTypeId', label: '单据类型', getUrl: `${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=105`, options: [], method: 'get', valueKey: "formId", labelKey: "formName", colSpan: 6 },
                {
                    type: 'list', listType: 'user', options: [], id: 'applyId', label: '申请人', labelKey: 'fullName', valueKey: "id", single: true, colSpan: 6,
                    listExtraParams: { "setOfBooksId": this.props.company.setOfBooksId }
                },
                {
                    type: 'select', id: 'status', label: '状态', options: [
                        { value: 1001, label: this.$t({ id: 'public.reimberse.report.status.generate' }/*编辑中*/) },
                        { value: 1002, label: this.$t({ id: 'public.reimberse.report.status.submitted' }/*审批中*/) },
                        { value: 1003, label: this.$t({ id: 'public.reimberse.report.status.reject' }/*撤回*/) },
                        { value: 1004, label: "审批通过" },
                        { value: 1005, label: "审批驳回" },
                        { value: 2002, label: "审核通过" },
                        { value: 2001, label: "审核驳回" }
                    ], colSpan: 6
                },
                {
                    type: 'list', listType: 'department', id: 'unitId', label: '单据部门', options: [], labelKey: 'name', valueKey: 'departmentId', single: true, colSpan: 6,
                    listExtraParams: { "tenantId": this.props.user.tenantId }
                },
                {
                    type: 'items', id: 'applyDateRange', items: [
                        { type: 'date', id: 'applyDateFrom', label: '申请日期从' },
                        { type: 'date', id: 'applyDateTo', label: '申请日期至' },
                    ], colSpan: 6
                },
                {
                    type: 'select', key: 'currency', id: 'currency', label: "币种", getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`, options: [], method: "get",
                    labelKey: 'currency', valueKey: 'currency', colSpan: 6
                },
                {
                    type: 'items', id: 'amount', items: [
                        { type: 'input', id: 'amountFrom', label: '金额从' },
                        { type: 'input', id: 'amountTo', label: '金额至' },
                    ], colSpan: 6
                },
                {
                    type: 'items', id: 'paidAmount', items: [
                        { type: 'input', id: 'paidAmountFrom', label: '已付金额从' },
                        { type: 'input', id: 'paidAmountTo', label: '已付金额至' },
                    ], colSpan: 6
                },
                {
                    type: 'select', id: 'backlashFlag', label: '反冲状态', options: [
                        { value: 1, label: "未反冲" },
                        { value: 2, label: "部分反冲" },
                        { value: 3, label: "已反冲" },
                    ], colSpan: 6
                },
                {
                    type: 'items', id: 'checkDateRange', items: [
                        { type: 'date', id: 'checkDateFrom', label: '审核日期从' },
                        { type: 'date', id: 'checkDateTo', label: '审核日期至' },
                    ], colSpan: 6
                },
                {
                    type: 'input', id: 'remark', label: '备注', colSpan: 6
                }
            ],
            columns: [
                /*单据编号 */
                { title: '单据编号', dataIndex: 'businessCode', render: recode => { return (<a><Popover content={recode}>{recode ? recode : '-'}</Popover></a>) }, width: 110 },
                /*单据公司 */
                { title: '单据公司', dataIndex: 'companyName', width: 100, render: recode => (<span><Popover content={recode}>{recode ? recode : '-'}</Popover></span>) },
                /**单据部门 */
                { title: '单据部门', dataIndex: 'unitName', width: 100, render: recode => (<span><Popover content={recode}>{recode ? recode : '-'}</Popover></span>) },
                /**单据类型 */
                { title: '单据类型', dataIndex: 'formName', render: recode => (<span><Popover content={recode}>{recode ? recode : '-'}</Popover></span>) },
                /**申请人 */
                { title: '申请人', dataIndex: 'applicationName', width: 110, render: recode => (<span><Popover content={recode}>{recode ? recode : '-'}</Popover></span>) },
                /** 申请日期*/
                {
                    title: '申请日期', dataIndex: 'reportDate', render: recode => {
                        return (<Popover content={moment(recode).format("YYYY-MM-DD")}>{recode ? moment(recode).format("YYYY-MM-DD") : ""}</Popover>)
                    }, width: 110
                },
                /**币种 */
                { title: '币种', dataIndex: 'currencyCode', width: 90, render: recode => (<span><Popover content={recode}>{recode ? recode : '-'}</Popover></span>) },
                /**金额 */
                {
                    title: '金额', dataIndex: 'totalAmount', render: recode => <span><Popover content={this.filterMoney(recode, 2)}>{this.filterMoney(recode, 2)}</Popover></span>,
                    width: 110
                },
                /**已付金额 */
                {
                    title: '已付金额', dataIndex: 'paidAmount', render: recode => <span><Popover content={this.filterMoney(recode, 2)}>{this.filterMoney(recode, 2)}</Popover></span>,
                    width: 110
                },
                /**已核销金额 */
                {
                    title: '已核销金额', dataIndex: 'writeOffAmount ', render: recode => <span><Popover content={this.filterMoney(recode, 2)}>{this.filterMoney(recode, 2)}</Popover></span>,
                    width: 110
                },
                /**反冲标志 */
                {
                    title: '反冲标志', dataIndex: 'reversedFlag', render: (value, recode) => {
                        return (this.state.backlashFlagList.map(items => { return recode = items.value === value ? items.label : '' }))
                    }, width: 90
                },
                /**备注 */
                { title: '备注', dataIndex: 'remark', render: recode => <span><Popover content={recode}>{recode ? recode : '-'}</Popover></span> },
                /**状态 */
                {
                    title: '状态', dataIndex: 'reportStatus', render: (value, recode) => {
                        return (<Badge status={this.state.status[value].state} text={this.state.status[value].label} />)
                    },
                    width: 100

                },
                /**审核日期 */
                {
                    title: '审核日期', dataIndex: 'auditDate', render: recode => <span><Popover content={moment(recode).format("YYYY-MM-DD")}>{recode ? moment(recode).format("YYYY-MM-DD") : "-"}</Popover></span>,
                    width: 110
                },
                /**查看信息 */
                {
                    title: '查看信息', dataIndex: 'viewInfo', render: (text, record, index) => {
                        return (
                            <span>
                                <a href='#' onClick={(e) => this.applyReport(e, record, index)}>申请单</a>
                                <span className="ant-divider" />
                                <a href='#' onClick={(e) => this.paymentDetail(e, record, index)}>支付明细</a>
                                <span className="ant-divider" />
                                <a href='#' onClick={(e) => this.reverseReport(e, record, index)}>费用反冲单</a>
                            </span>
                        )
                    }
                }


            ],
            searchParams: {},
            page: 0,
            pageSize: 10,
            loading: false,
            publicReimburseData: [],
            pagination: {
                total: 0
            },
            reportVisible: false,
            sourceId: 0,
            extraParams: {},
            selectorItem: {},
            excelFlag: false,
            buttonLoading: false,
            exportParams: {},
            /**导出对公报账单字段 */
            exportColumns: [
                { "title": "单据编号", "dataIndex": "businessCode" },
                { "title": "单据公司", "dataIndex": "companyName" },
                { "title": "单据部门", "dataIndex": "unitName" },
                { "title": "单据类型", "dataIndex": "formName" },
                { "title": "申请人", "dataIndex": "applicationName" },
                { "title": "创建人", "dataIndex": "createByName" },
                { "title": "申请日期", "dataIndex": "stringSubmitDate" },
                { "title": "币种", "dataIndex": "currencyCode" },
                { "title": "金额", "dataIndex": "totalAmount" },
                { "title": "汇率", "dataIndex": "rate" },
                { "title": "本币金额", "dataIndex": "functionalAmount" },
                { "title": "已付金额", "dataIndex": "paidAmount" },
                { "title": "已核销金额", "dataIndex": "writeOffAmount" },
                { "title": "已反冲金额", "dataIndex": "backlashAmount" },
                { "title": "状态", "dataIndex": "reportStatusName" },
                { "title": "审核日期", "dataIndex": "stringAuditDate" },
                { "title": "反冲状态", "dataIndex": "reversedStatus" },
                { "title": "备注", "dataIndex": "remark" },
            ]
        }
    }
    componentDidMount() {
        this.getList();

    }
    //获取搜索数据
    handelSearch = (values) => {
        values.applyDateFrom = values.applyDateFrom ? moment(values.applyDateFrom).format('YYYY-MM-DD') : undefined;
        values.applyDateTo = values.applyDateTo ? moment(values.applyDateTo).format('YYYY-MM-DD') : undefined;
        values.checkDateFrom = values.checkDateFrom ? moment(values.checkDateFrom).format('YYYY-MM-DD') : undefined;
        values.checkDateTo = values.checkDateTo ? moment(values.checkDateTo).format('YYYY-MM-DD') : undefined
        this.setState({ searchParams: {...values} }, () => {
            this.getList()
        });
        // this.setState({ searchParams: {...values,...this.state.searchParams}}, () => {
        //     this.getList()
        // });

    }
    //清除查询条件
    clear = () => {
        this.setState({ searchParams: {} })
    }
    /**
     * 获取数据源
     */
    getList = () => {
        const { searchParams, page, pageSize } = this.state;
        const param = {
            ...searchParams,
            documentCode: searchParams.documentCode ? searchParams.documentCode : null
        }
        let setOfBooksId = this.props.company.setOfBooksId;
        this.setState({ loading: true });
        PublicReimburseReportService.getReimburseReport(param, page, pageSize, setOfBooksId).then(res => {
            if (res.status === 200) {
                this.setState({
                    loading: false,
                    publicReimburseData: res.data || [],
                    pagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: page + 1,
                        onChange: this.onChangeCheckedPage,
                        onShowSizeChange: this.onShowSizeChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: () => {
                            return `共有 ${Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0} 条数据`
                        }
                    },
                    exportParams: searchParams
                })
            }
        }).catch(e => {
            this.setState({ loading: false })
            message.error(`获取数据失败:${e.response.data.message}`);
        })
    }
    //表格翻页
    onChangeCheckedPage = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState({
                page: page - 1,
            }, () => {
                this.getList()
            })
        }

    }
    //切换每页显示的条数
    onShowSizeChange = (current, pageSize) => {
        this.setState({
            page: current - 1,
            pageSize
        }, () => {
            this.getList()
        })

    }
    //申请单
    applyReport = (e, record, index) => {
        e.preventDefault();
        debugger;
        console.log(this.state.applicationType);
        const applySelectorItem = {
            title: '关联的申请单',
            url: `${config.baseUrl}/api/expReportHeader/get/release/by/reportId`,
            searchForm: [
                { type: 'input', id: 'businessCode', label: '报账单单号', disabled: true, defaultValue: record.businessCode, colSpan: 6 },
                { type: 'input', id: 'formName', label: '报账单类型', disabled: true, defaultValue: record.formName, colSpan: 6 },
                { type: 'input', id: 'releaseCode', label: "申请单单号", colSpan: 6 },
                { type: 'input', id: 'expenseTypeName', label: "费用类型", colSpan: 6 },

            ],
            columns: [
                { title: "申请单单号", dataIndex: 'applicationCode', render: (recode) => { return (<a>{recode}</a>) }, width: 150 },
                { title: "申请单类型", dataIndex: 'applicationTypeNum', render: (value, record) => { return (value && (<span>{this.state.applicationType[value].label}</span>)) } },
                { title: "费用类型", dataIndex: 'expenseType' },
                { title: "申请人", dataIndex: 'applicant' },
                { title: "申请日期", dataIndex: 'applicationDate', render: value => { return (value ? moment(value).format("YYYY-MM-DD") : "") } },
                { title: "币种", dataIndex: 'currency' },
                { title: "金额", dataIndex: 'amount', render: this.filterMoney },
                { title: "关联金额", dataIndex: 'releaseAmount', render: this.filterMoney },
                { title: "备注", dataIndex: 'remark' },
            ],
            key: 'id'
        }
        this.setState({
            reportVisible: true,
            sourceId: record.id,
            selectorItem: applySelectorItem,
            extraParams: {
                sourceId: record.id
            }
        })
    }
    //控制弹框是否显示
    showListSelector = (flag) => {
        this.setState({
            reportVisible: flag
        })
    }
    //申请单弹出框确定事件
    handleListOk = () => {
        this.setState({ reportVisible: false })
    }
    //支付明细
    paymentDetail = (e, record, index) => {
        e.preventDefault();
        const paymentSelectorItem = {
            title: '支付明细',
            url: `${config.payUrl}/api/cash/transaction/details//getDeatilByPublicHeaderId`,
            searchForm: [
                { type: 'input', id: 'businessCode', label: '报账单单号', disabled: true, defaultValue: record.businessCode, colSpan: 6 },
                { type: 'input', id: 'formName', label: '报账单类型', disabled: true, defaultValue: record.formName, colSpan: 6 },
                { type: 'input', id: 'totalAmount', label: '报账单金额', disabled: true, defaultValue: Number(record.totalAmount || 0).toFixed(2).toString(), colSpan: 6 },
                { type: 'input', id: 'billCode', label: "付款流水号", colSpan: 6 },
            ],
            columns: [
                { title: "付款流水号", dataIndex: 'billcode', render: (recode) => { return (<a><Popover content={recode}>{recode}</Popover></a>) } },
                { title: "操作类型", dataIndex: 'operationType', render: (recode) => (recode && (this.state.operationTypeList[recode].label)) },
                {
                    title: "付款方账户", dataIndex: 'draweeAccount', render: (value, recode) => {
                        return (<div><div>户名:{recode.draweeAccountName}</div><div>账号:{recode.draweeAccountNumber}</div></div>)
                    }
                },
                { title: "付款日期", dataIndex: 'scheduleDate', render: value => { return (value ? moment(value).format("YYYY-MM-DD") : "") } },
                { title: "币种", dataIndex: 'currency' },
                { title: "付款金额", dataIndex: 'amount', render: this.filterMoney },
                {
                    title: "收款方账户", dataIndex: 'payeeAccount', render: (value, recode) => {
                        return (<div><div>户名:{recode.payeeAccountName}</div><div>账号:{recode.payeeAccountNumber}</div></div>)
                    }
                },
                {
                    title: "收款方", dataIndex: 'partnerCategoryName', render: (value, recode) => {
                        return (
                            <div>
                                <div>{recode.partnerCategoryName}</div>
                                <div>{recode.partnerName}</div>
                            </div>
                        )
                    }
                },
                {
                    title: "付款人", dataIndex: 'draweeId', render: (value, recode) => {
                        return (
                            <div>
                                <div>{recode.draweeId}</div>
                                <div>{recode.draweeName}</div>
                            </div>
                        )
                    }
                },
            ],
            key: 'id'

        }
        this.setState({
            reportVisible: true,
            sourceId: record.id,
            selectorItem: paymentSelectorItem,
            extraParams: {
                headerId: record.id
            }
        })
    }
    //费用反冲单
    reverseReport = (e, record, index) => {
        e.preventDefault();
        const reverseSelectorItem = {
            title: '费用反冲单',
            url: `${config.baseUrl}/api/report/reverse/get/reverse/by/source/id`,
            searchForm: [
                { type: 'input', id: 'businessCode', label: '报账单单号', disabled: true, defaultValue: record.businessCode, colSpan: 6 },
                { type: 'input', id: 'formName', label: '报账单类型', disabled: true, defaultValue: record.formName, colSpan: 6 },
                { type: 'input', id: 'totalAmount', label: '报账单金额', disabled: true, defaultValue: Number(record.totalAmount || 0).toFixed(2).toString(), colSpan: 6 },
                { type: 'input', id: 'reverseCode', label: "费用反冲单编号", colSpan: 6 },
            ],
            columns: [
                { title: "费用反冲单编号", dataIndex: 'reportReverseNumber', render: (recode) => { return (<a>{recode}</a>) } },
                { title: "申请人", dataIndex: 'employeeName' },
                { title: "反冲日期", dataIndex: 'reverseDate', render: value => value ? moment(value).format("YYYY-MM-DD") : "" },
                { title: "币种", dataIndex: 'currencyCode' },
                { title: "反冲金额", dataIndex: 'amount', render: this.filterMoney },
                { title: "备注", dataIndex: 'description' },
                {
                    title: "状态", dataIndex: 'status', render: (value, recode) => {
                        return (value && (<Badge status={this.state.reverseStatus[value].state} text={this.state.reverseStatus[value].label} />))
                    }
                },
            ],
            key: 'id'
        }
        this.setState({
            reportVisible: true,
            sourceId: record.id,
            selectorItem: reverseSelectorItem,
            extraParams: {
                sourceId: record.id
            }
        })
    }
    //导出对公报账单
    exportReport = () => {
        this.setState({ excelFlag: true })
    }
    export = (result) => {
        let setOfBooksId = this.props.company.setOfBooksId;
        const { exportParams } = this.state;
        this.setState({
            buttonLoading: true
        });
        let hide = message.loading('正在生成文件，请等待......');
        PublicReimburseReportService.exportExcel(result, setOfBooksId, exportParams).then(res => {
            if (res.status === 200) {
                message.success('操作成功');
                let fileName = res.headers['content-disposition'].split("filename=")[1];
                let f = new Blob([res.data]);
                FileSaver.saveAs(f, decodeURIComponent(fileName))
                this.setState({
                    buttonLoading: false
                });
                hide();
            }
        }).catch(e => {
            message.error("下载失败，请重试!");
            this.setState({
                buttonLoading: false
            });
            hide();
        })
    }
    onCancel = () => {
        this.setState({ excelFlag: false })
    }
    //根据单据编号进行查询
    onDocumentSearch = (value) => {
        this.setState({ searchParams: {...this.state.searchParams, documentCode: value } },
            () => {
                this.getList();
            });

    }
    render() {
        const { searchForm, statusPram, loading, publicReimburseData, columns, pagination, reportVisible, selectorItem, extraParams, excelFlag, exportColumns } = this.state;
        return (
            <div>
                <SearchArea
                    searchForm={searchForm}
                    submitHandle={this.handelSearch}
                    // eventHandle={this.searchEventHandle}
                    clearHandle={this.clear}
                    maxLength={4}
                />
                <div className='divider'></div>
                <div className="table-header">
                    <Row>
                        <Col span={18}>
                            <Button type="primary" onClick={this.exportReport} loading={this.state.buttonLoading}>导出对公报账单</Button>
                        </Col>
                        <Col span={6}>
                            <Search
                                placeholder="请输入单据编号"
                                onSearch={this.onDocumentSearch}
                                enterButton
                            />
                        </Col>
                    </Row>

                </div>
                <Table
                    rowKey={record => record.id}
                    bordered
                    loading={loading}
                    columns={columns}
                    dataSource={publicReimburseData}
                    size='middle'
                    scroll={{ x: 2000, y: false }}
                    pagination={pagination}
                    style={{ marginTop: 15 }}
                />
                <ListSelector
                    selectorItem={selectorItem}
                    visible={reportVisible}
                    onOk={this.handleListOk}
                    onCancel={() => this.showListSelector(false)}
                    extraParams={extraParams}
                    hideRowSelect={true}
                    hideFooter={true}
                    modalWidth={"70%"}
                    showDetail={true}
                    showSelectTotal={true}
                    showRowClick={true}
                />
                <ExcelExporter
                    visible={excelFlag}
                    onOk={this.export}
                    columns={exportColumns}
                    fileName={"对公报账单"}
                    onCancel={this.onCancel}
                    excelItem={"EXP_REPORT_FINANCIAL_QUERY"}

                />
            </div>
        )
    }
};


PublicReimburseReport.propTypes = {


}
PublicReimburseReport.defaultProps = {

}
function mapStateToProps(state) {
    return {
        company: state.user.company,
        tenantMode: true,
        user: state.user.currentUser,

    }

}

export default connect(mapStateToProps, null, null, { withRef: true })(PublicReimburseReport)
