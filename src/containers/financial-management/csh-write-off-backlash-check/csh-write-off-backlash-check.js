import React, { Component } from 'react'
import { connect } from 'dva'
import config from 'config'
import SearchArea from 'components/Widget/search-area'
import baseService from 'share/base.service'
import moment from 'moment'
import { Button, Table, Badge, Divider, message, Tabs, Card, DatePicker, Row, Col, Affix, Input, Popover, Form } from 'antd'
const TabPane = Tabs.TabPane;
import { format } from 'util'
import cshWriteOffBacklashCheckService from './csh-write-off-backlash-check.service'
import 'styles/financial-management/csh-write-off-backlash-check.scss'
import EditViewUpload from 'components/Widget/Template/edit-view-upload'

class CshWriteOffBacklashCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            /**
             * 待复核
             */
            columns1: [
                {
                    title: '报账单编号',
                    dataIndex: 'documentNumber', width: '120', align: 'center',
                    render: (documentNumber) => {
                        return (
                            <Popover content={documentNumber}>
                                <span>{documentNumber}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '核销反冲日期',
                    dataIndex: 'writeOffDate', width: '130', align: 'center',
                    render: (writeOffDate, record, index) => {
                        return (
                            moment(writeOffDate).format('YYYY-MM-DD')
                        )
                    }
                },
                {
                    title: '申请人',
                    dataIndex: 'documentApplicantName', width: '60', align: 'center'
                },
                {
                    title: '被核销单据编号',
                    dataIndex: 'sourceDocumentNumber', width: '130', align: 'center',
                    render: (sourceDocumentNumber) => {
                        return (
                            <Popover content={sourceDocumentNumber}>
                                <span>{sourceDocumentNumber}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '付款流水号',
                    dataIndex: 'billCode', width: '140', align: 'center',
                    render: (billCode) => {
                        return (
                            <Popover content={billCode}>
                                <span>{billCode}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '核销金额',
                    dataIndex: 'writeOffAmount', width: '120', align: 'center',
                    render: (writeOffAmount, record, index) => {
                        return (
                            <span>{record.currency}&nbsp;{this.filterMoney(writeOffAmount, 2, true)}</span>
                        )
                    }
                },
                {
                    title: '本次核销反冲额',
                    dataIndex: 'reversedAmount', width: '130', align: 'center',
                    render: (reversedAmount, record, index) => {
                        return (
                            <span>{record.currency}&nbsp;{this.filterMoney(reversedAmount, 2, true)}</span>
                        )
                    }
                },
                {
                    title: '备注',
                    dataIndex: 'remark', width: '90', align: 'center',
                    render: (remark, record, index) => {
                        return (
                            <Popover content={remark}>
                                <span>{remark}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '附件',
                    dataIndex: 'attachments', width: '50', align: 'center',
                    render: (attachments, record, index) => {
                        return (
                            <a onClick={(e) => this.onAttachmentClick(e, record, index)}>
                                <span>{attachments.length}</span>
                            </a>
                        )
                    }
                },
                {
                    title: '反冲发起人',
                    dataIndex: 'createdName', align: 'center'
                }
            ],
            searchForm1: [
                { type: 'input', id: 'documentNumber', label: '报账单编号', colSpan: '6' },
                { type: 'list', colSpan: '6', id: 'createdBy', label: '反冲发起人', listType: 'user', valueKey: 'id', labelKey: 'fullName', single: true },
                { type: 'input', colSpan: '6', id: 'sourceDocumentNumber', label: '被核销单据编号' },
                { type: 'input', colSpan: '6', id: 'billCode', label: '付款流水号' },
                {
                    type: 'items',
                    colSpan: '6',
                    items:
                        [
                            { type: 'date', id: 'createdDateFrom', label: '核销反冲日期从' },
                            { type: 'date', id: 'createdDateTo', label: '核销反冲日期至' }
                        ]
                },
                {
                    type: 'items',
                    colSpan: '6',
                    items:
                        [
                            { type: 'input', id: 'writeOffAmountFrom', label: '核销金额从' },
                            { type: 'input', id: 'writeOffAmountTo', label: '核销金额至' }
                        ]
                },
                {
                    type: 'items',
                    colSpan: '6',
                    items:
                        [
                            { type: 'input', id: 'writeOffReverseAmountFrom', label: '本次核销反冲额' },
                            { type: 'input', id: 'writeOffReverseAmountTo', label: ':' }
                        ]
                },
                { type: 'list', listExtraParams: { setOfBooksId: this.props.company.setOfBooksId }, colSpan: '6', id: 'applicantId', label: '申请人', listType: 'bgtUser', valueKey: 'id', labelKey: 'fullName', single: true }
            ],
            data1: [],
            pagination1: {
                showSizeChanger: true,
                showQuickJumper: true,
                current: 1,
                total: 0
            },
            loading1: true,
            page1: 0,
            pageSize1: 10,
            searchParam1: {},
            /**
             * 已复核
             */
            columns2: [
                {
                    title: '报账单编号',
                    dataIndex: 'documentNumber', width: '150', align: 'center',
                    render: (documentNumber) => {
                        return (
                            <Popover content={documentNumber}>
                                <span>{documentNumber}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '核销反冲日期',
                    dataIndex: 'writeOffDate', align: 'center',
                    render: (writeOffDate, record, index) => {
                        return (
                            moment(writeOffDate).format('YYYY-MM-DD')
                        )
                    }
                },
                {
                    title: '申请人',
                    dataIndex: 'documentApplicantName', align: 'center'
                },
                {
                    title: '被核销单据编号',
                    dataIndex: 'sourceDocumentNumber', width: '150', align: 'center',
                    render: (sourceDocumentNumber) => {
                        return (
                            <Popover content={sourceDocumentNumber}>
                                <span>{sourceDocumentNumber}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '付款流水号',
                    dataIndex: 'billCode', width: '150', align: 'center',
                    render: (billCode) => {
                        return (
                            <Popover content={billCode}>
                                <span>{billCode}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '核销金额',
                    dataIndex: 'writeOffAmount', align: 'center',
                    render: (writeOffAmount, record, index) => {
                        return (
                            <span>{record.currency}&nbsp;{this.filterMoney(writeOffAmount, 2, true)}</span>
                        )
                    }
                },
                {
                    title: '本次核销反冲金额',
                    dataIndex: 'reversedAmount', align: 'center',
                    render: (reversedAmount, record, index) => {
                        return (
                            <span>{record.currency}&nbsp;{this.filterMoney(reversedAmount, 2, true)}</span>
                        )
                    }
                },
                {
                    title: '备注',
                    dataIndex: 'remark', align: 'center',
                    render: (remark, record, index) => {
                        return (
                            <Popover content={remark}>
                                <span>{remark}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '附件',
                    dataIndex: 'attachments', width: '50', align: 'center',
                    render: (attachments, record, index) => {
                        return (
                            <a onClick={(e) => this.onAttachmentClick(e, record, index)}>
                                <span>{attachments.length}</span>
                            </a>
                        )
                    }
                },
                {
                    title: '反冲发起人',
                    dataIndex: 'createdName', align: 'center'
                },
                {
                    title: '复核人',
                    dataIndex: 'approvalName', align: 'center'
                },
                {
                    title: '复核意见',
                    dataIndex: 'approvalOpinions', align: 'center',
                    render: (approvalOpinions) => {
                        return (
                            <Popover content={approvalOpinions}>
                                <span>{approvalOpinions}</span>
                            </Popover>
                        )
                    }
                },
                {
                    title: '复核状态',
                    dataIndex: 'statusDescription', align: 'center'
                }
            ],
            searchForm2: [
                { type: 'input', id: 'documentNumber', label: '报账单编号', colSpan: '6' },
                { type: 'list', colSpan: '6', id: 'createdBy', label: '反冲发起人', listType: 'user', valueKey: 'id', labelKey: 'fullName', single: true },
                { type: 'input', colSpan: '6', id: 'sourceDocumentNumber', label: '被核销单据编号' },
                { type: 'input', colSpan: '6', id: 'billCode', label: '付款流水号' },
                {
                    type: 'items',
                    colSpan: '6',
                    items:
                        [
                            { type: 'date', id: 'createdDateFrom', label: '核销反冲日期从' },
                            { type: 'date', id: 'createdDateTo', label: '核销反冲日期至' }
                        ]
                },
                {
                    type: 'items',
                    colSpan: '6',
                    items:
                        [
                            { type: 'input', id: 'writeOffAmountFrom', label: '核销金额从' },
                            { type: 'input', id: 'writeOffAmountTo', label: '核销金额至' }
                        ]
                },
                {
                    type: 'items',
                    colSpan: '6',
                    items:
                        [
                            { type: 'input', id: 'writeOffReverseAmountFrom', label: '本次核销反冲额' },
                            { type: 'input', id: 'writeOffReverseAmountTo', label: ':' }
                        ]
                },
                { type: 'list', listExtraParams: { setOfBooksId: this.props.company.setOfBooksId }, colSpan: '6', id: 'applicantId', label: '申请人', listType: 'bgtUser', valueKey: 'id', labelKey: 'fullName', single: true },
                { type: 'list', colSpan: '6', id: 'approvalId', label: '复核人', listType: 'user', valueKey: 'id', labelKey: 'fullName', single: true }
            ],
            data2: [],
            pagination2: {
                showSizeChanger: true,
                showQuickJumper: true,
                current: 1,
                total: 0
            },
            loading2: true,
            page2: 0,
            pageSize2: 10,
            searchParam2: {},
            /**
             * 凭证信息
             */
            columns3: [
                {
                    title: '序号', dataIndex: 'seq', width: '50', align: 'center',
                    render: (seq, record, index) => {
                        return (
                            <span>{index + 1}</span>
                        )
                    }
                },
                {
                    title: '备注', dataIndex: 'description', width: '100', align: 'center',
                    render: text => {
                        return (<Popover content={text}>{text} </Popover>)
                    }
                },
                {
                    title: '凭证日期', dataIndex: 'accountingDate', width: '100', align: 'center',
                    render: text => {
                        return (<span>{moment(text).format('YYYY-MM-DD')}</span>)
                    }
                },
                {
                    title: '公司', dataIndex: 'companyName', width: '150', align: 'center',
                    render: text => {
                        return (<Popover content={text}>{text}</Popover>)
                    }
                },
                { title: '责任中心', dataIndex: 'costCenterName', align: 'center', width: '100' },
                {
                    title: '科目', dataIndex: 'accountCode', width: '150', align: 'center',
                    render: (accountCode) => {
                        return (
                            <Popover content={accountCode}>
                                <span>{accountCode}</span>
                            </Popover>
                        )
                    }
                },
                { title: '币种', dataIndex: 'currencyCode', align: 'center', width: '50' },
                {
                    title: '原币借方', dataIndex: 'enteredAmountDr', align: 'center', width: '100',
                    render: (enteredAmountDr) => {
                        return (
                            <span>{this.filterMoney(enteredAmountDr, 2)}</span>
                        )
                    }
                },
                {
                    title: '原币贷方', dataIndex: 'enteredAmountCr', align: 'center', width: '100',
                    render: (enteredAmountCr) => {
                        return (
                            <span>{this.filterMoney(enteredAmountCr, 2)}</span>
                        )
                    }
                },
                {
                    title: '本币借方', dataIndex: 'functionalAmountDr', align: 'center', width: '100',
                    render: (functionalAmountDr) => {
                        return (
                            <span>{this.filterMoney(functionalAmountDr, 2)}</span>
                        )
                    }
                },
                {
                    title: '本币贷方', dataIndex: 'functionalAmountCr', align: 'center', width: '100',
                    render: (functionalAmountCr) => {
                        return (
                            <span>{this.filterMoney(functionalAmountCr, 2)}</span>
                        )
                    }
                }
            ],
            data3: [],
            loading3: false,
            column3Width: 1100,
            //创建凭证所需,当前鼠标所点击的核销反冲记录行
            nowRecord: {},
            //反冲日期
            accountDate: moment(new Date()),
            //是否核算
            whetherAccout: false,
            /**
             * 审批意见
             */
            opinion: '',
            /**
             * 控制点击表格某一行的颜色变化
             */
            rowColorIndex: -1,
            /**
             * 附件
             */
            //附件弹窗是否显示
            attachmentVisible: false,
            //点击附件所在行
            nowAttachmentRecord: [],
            /**
             * tabs面板控制
             */
            tabs:
                [
                    { key: 'backlashRechecking', name: '待复核' }, //待复核
                    { key: 'backlashRechecked', name: '已复核' }  //已经复核
                ],
            nowStatus: 'backlashRechecking'
        };
    }
    /**
     * 附件
     */
    onAttachmentClick = (e, record, index) => {
        e.preventDefault();
        this.setState({
            attachmentVisible: true,
            nowAttachmentRecord: record
        });
    }
    /**
     * 生命周期函数
     */
    componentWillMount = () => {
        this.getWriteOffRecheckReserveDetail();
        this.getWriteOffRecheckedReserveDetail();
        this.judgeAccounting();
        this.getSegments();
    }
    /**
     * 账套级的科目段
     * 开哥说 账套下每条数据的科目段都是一样的哈哈哈
     */
    getSegments = () => {
        let setOfBooksId = this.props.company.setOfBooksId;
        cshWriteOffBacklashCheckService.getSegments(setOfBooksId).then(res => {
            if (res.status === 200) {
                //根据当前账套的科目段，把这几个科目段拼接到凭证表上面
                //拼接一个科目段的对象，可以用来拼接到表格数据源data3上面
                let { columns3, column3Width } = this.state;
                res.data.map(item => {
                    columns3.push({ title: item.segmentName, dataIndex: item.segmentClassField, align: 'center' });
                    column3Width += 100;
                });
                this.setState({
                    columns3,
                    column3Width
                });
            }
        }).catch(e => {
            console.log(e);
        });
    }
    /**
     * 是否核算
     */
    judgeAccounting = () => {
        cshWriteOffBacklashCheckService.judgeAccounting().then(res => {
            if (res.status === 200) {
                this.setState({
                    whetherAccout: res.data
                });
            }
        }).catch(e => {
            console.log(`获取是否核算失败：${e.response}`);
        });
    }
    /**
     * 获取鼠标定位数据对应的凭证--获取凭证
     * id:核销反冲id,待核销反冲页面的id--核销id，其他页面的id--核销反冲id
     */
    getCredence = (id) => {
        if (!id) {
            this.setState({ data3: [] });
            return;
        }
        let tenantId = this.props.company.tenantId;
        let transactionHeaderId = id;
        cshWriteOffBacklashCheckService.getCredence(tenantId, transactionHeaderId).then(res => {
            if (res.status === 200) {
                this.setState({
                    data3: res.data,
                    loading3: false
                });
            }
        }).catch(e => {
            if (e.response) {
                console.log(`获取凭证失败：${e.response.data}`);
                this.setState({
                    loading3: false
                });
            }
        });
    }
    /**
     * 点击某一行数据获取凭证
     */
    onTableRowClick = (e, record, index) => {
        this.setState({
            loading3: true,
            nowRecord: record,
            rowColorIndex: index
        });
        let id = record.id;
        this.getCredence(id);
    }
    /**************************************************************待复核 */
    /**
     * 获取待复核反冲核销记录
     */
    getWriteOffRecheckReserveDetail = () => {
        let { searchParam1 } = this.state;
        let params = {
            page: this.state.page1,
            size: this.state.pageSize1
        };
        if (searchParam1.documentNumber) {
            params.documentNumber = searchParam1.documentNumber;
        }
        if (searchParam1.applicantId) {
            params.applicantId = searchParam1.applicantId;
        }
        if (searchParam1.sourceDocumentNumber) {
            params.sourceDocumentNumber = searchParam1.sourceDocumentNumber;
        }
        if (searchParam1.billCode) {
            params.billCode = searchParam1.billCode;
        }
        if (searchParam1.createdDateFrom) {
            params.createdDateFrom = moment(searchParam1.createdDateFrom).format('YYYY-MM-DD');
        }
        if (searchParam1.createdDateTo) {
            params.createdDateTo = moment(searchParam1.createdDateTo).format('YYYY-MM-DD');
        }
        if (searchParam1.writeOffAmountFrom) {
            params.writeOffAmountFrom = searchParam1.writeOffAmountFrom;
        }
        if (searchParam1.writeOffAmountTo) {
            params.writeOffAmountTo = searchParam1.writeOffAmountTo;
        }
        if (searchParam1.writeOffReverseAmountFrom) {
            params.writeOffReverseAmountFrom = searchParam1.writeOffReverseAmountFrom;
        }
        if (searchParam1.writeOffReverseAmountTo) {
            params.writeOffReverseAmountTo = searchParam1.writeOffReverseAmountTo;
        }
        if (searchParam1.createdBy) {
            params.createdBy = searchParam1.createdBy;
        }
        cshWriteOffBacklashCheckService.getWriteOffRecheckReserveDetail(params).then(res => {
            if (res.status === 200) {
                this.setState({
                    loading1: false,
                    data1: res.data,
                    pagination1: {
                        total: Number(res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0),
                        onChange: this.onChangePaper1,
                        onShowSizeChange: this.onShowSizeChange1,
                        current: this.state.page1 + 1,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total })
                    }
                });
            }
        }).catch(e => {
            if (e.response) {
                message.error(`获取待复核反冲核销记录失败：${e.response.data.message}`);
            }
        })
    }
    /**
    * 待复核核销反冲的切换分页
    */
    onChangePaper1 = (page) => {
        if (page - 1 !== this.state.page1) {
            this.setState(
                {
                    page1: page - 1,
                    loading1: true,
                    rowColorIndex: -1
                },
                () => {
                    this.getWriteOffRecheckReserveDetail();
                    this.getCredence();
                });
        }
    }
    /**
     * 切换每页显示的条数
     */
    onShowSizeChange1 = (current, pageSize) => {
        this.setState({
            loading1: true,
            page1: current - 1,
            pageSize1: pageSize
        }, () => {
            this.getWriteOffRecheckReserveDetail();
        });
    }
    /**
     * 反冲日期变化事件
     */
    onAccountDateChange = (value) => {
        this.setState({
            accountDate: value
        });
    }
    /**
     * 创建凭证按钮触发的事件
     */
    onCreateCredenceClick = () => {
        if (!this.state.accountDate) {
            message.error('请输入反冲日期');
            return;
        }
        if (!this.state.nowRecord.id) {
            message.warning('请选择一条待复核数据');
            return;
        }
        this.setState({
            loading3: true
        });
        let { nowRecord } = this.state;
        let documentType = nowRecord.documentType;
        let documentHeaderId = nowRecord.documentHeaderId;
        let documentLineIds = [nowRecord.documentLineId];
        let tenantId = this.props.company.tenantId;
        let operatorId = this.props.user.id;
        let accountDate = this.state.accountDate;
        cshWriteOffBacklashCheckService.createCredence(documentType, documentHeaderId, documentLineIds, tenantId, operatorId, accountDate).then(res => {
            if (res.status === 200) {
                if (res.data === 'SUCCESS') {
                    message.success('创建凭证成功')
                    this.getCredence(nowRecord.id);
                } else if (res.data === 'NO_WRITE_OFF_DATA') {
                    message.warning('无核销数据');
                    this.setState({
                        loading3: false
                    });
                } else if (res.data === 'NO_NEED_ACCOUNT') {
                    message.warning('无需核算');
                    this.setState({
                        loading3: false
                    });
                }
            }
        }).catch(e => {
            if (e.response) {
                message.error(`创建凭证失败：${e.response.data.message}`);
                this.setState({
                    loading3: false
                });
            }
        })
    }
    /**
     * 审批意见变化事件
     */
    onOpinionChange = (e) => {
        this.setState({
            opinion: e.target.value
        });
    }
    /**
     * 审批通过和审批驳回
     */
    onPassClick = (e, operationType) => {
        if (!this.state.nowRecord.id) {
            message.warning('请选择一条待复核数据');
            return;
        }
        if (operationType === '-1' && !this.state.opinion) {
            message.warning('请输入审批意见');
            return;
        }
        let { nowRecord, opinion } = this.state;
        let id = nowRecord.id;
        cshWriteOffBacklashCheckService.reverseUpdateStatus(id, operationType, opinion).then(res => {
            if (res.status === 200) {
                message.success('操作成功');
                this.getWriteOffRecheckReserveDetail();
                this.getCredence();
                this.getWriteOffRecheckedReserveDetail();
                //当审批操作成功，清空复核意见
                this.setState({
                    opinion: ''
                });
                //清空当前数据
                this.setState({
                    nowRecord: {},
                    rowColorIndex: -1
                });
            }
        }).catch(e => {
            if (e.response) {
                message.error(`操作失败：${e.response.data.message}`);
            }
        });
    }
    /**
     * 待核销反冲搜索按钮
     */
    search1 = (param) => {
        this.setState({
            loading1: true,
            page1: 0,
            searchParam1: param
        }, () => {
            this.getWriteOffRecheckReserveDetail();
            this.getCredence();
        });
    }
    /**
     * 待核销反冲清空按钮
     */
    clear1 = () => {
        this.setState({
            loading1: true,
            page1: 0,
            searchParam1: {}
        }, () => {
            this.getWriteOffRecheckReserveDetail()
            this.getCredence();
        });
    }
    /**************************************************************已复核 */
    /**
     * 获取已复核核销反冲记录
     */
    getWriteOffRecheckedReserveDetail = () => {
        let params = {
            page: this.state.page2,
            size: this.state.pageSize2
        };
        let { searchParam2 } = this.state;
        if (searchParam2.documentNumber) {
            params.documentNumber = searchParam2.documentNumber;
        }
        if (searchParam2.applicantId) {
            params.applicantId = searchParam2.applicantId;
        }
        if (searchParam2.sourceDocumentNumber) {
            params.sourceDocumentNumber = searchParam2.sourceDocumentNumber;
        }
        if (searchParam2.billCode) {
            params.billCode = searchParam2.billCode;
        }
        if (searchParam2.createdDateFrom) {
            params.createdDateFrom = moment(searchParam2.createdDateFrom).format('YYYY-MM-DD');
        }
        if (searchParam2.createdDateTo) {
            params.createdDateTo = moment(searchParam2.createdDateTo).format('YYYY-MM-DD');
        }
        if (searchParam2.writeOffAmountFrom) {
            params.writeOffAmountFrom = searchParam2.writeOffAmountFrom;
        }
        if (searchParam2.writeOffAmountTo) {
            params.writeOffAmountTo = searchParam2.writeOffAmountTo;
        }
        if (searchParam2.writeOffReverseAmountFrom) {
            params.writeOffReverseAmountFrom = searchParam2.writeOffReverseAmountFrom;
        }
        if (searchParam2.writeOffReverseAmountTo) {
            params.writeOffReverseAmountTo = searchParam2.writeOffReverseAmountTo;
        }
        if (searchParam2.createdBy) {
            params.createdBy = searchParam2.createdBy;
        }
        if (searchParam2.approvalId) {
            params.approvalId = searchParam2.approvalId;
        }
        cshWriteOffBacklashCheckService.getWriteOffRecheckedReserveDetail(params).then(res => {
            if (res.status === 200) {
                this.setState({
                    data2: res.data,
                    loading2: false,
                    pagination2: {
                        total: Number(res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0),
                        onChange: this.onChangePaper2,
                        onShowSizeChange: this.onShowSizeChange2,
                        current: this.state.page2 + 1,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total })
                    }
                })
            }
        }).catch(e => {
            if (e.response) {
                message.error(`获取已复核核销反冲记录失败：${e.response.data.message}`);
            }
        });
    }
    /**
     * 已核销反冲搜索按钮
     */
    search2 = (param) => {
        this.setState({
            loading2: true,
            page2: 0,
            searchParam2: param
        }, () => {
            this.getWriteOffRecheckedReserveDetail();
            this.getCredence();
        });
    }
    /**
     * 已核销反冲清空按钮
     */
    clear2 = () => {
        this.setState({
            loading2: true,
            page2: 0,
            searchParam2: {}
        }, () => {
            this.getWriteOffRecheckedReserveDetail();
            this.getCredence();
        });
    }
    /**
     * 已复核切换页面事件
     */
    onChangePaper2 = (page) => {
        if (page - 1 !== this.state.page2) {
            this.setState(
                {
                    page2: page - 1,
                    loading2: true,
                    rowColorIndex: -1
                },
                () => {
                    this.getWriteOffRecheckedReserveDetail();
                    this.getCredence();
                });
        }
    }
    /**
     * 切换每页显示的条数
     */
    onShowSizeChange2 = (current, pageSize) => {
        this.setState({
            loading2: true,
            page2: current - 1,
            pageSize2: pageSize
        }, () => {
            this.getWriteOffRecheckedReserveDetail();
        });
    }
    /**
     * 面板切换事件
     */
    onChangeTabs = (key) => {
        if (key === 'backlashRechecking') {
            this.clear1();
        } else {
            this.clear2();
        }
        this.getCredence();
        this.setState({
            nowRecord: {},
            rowColorIndex: -1
        });

    };
    renderContent = () => {
        //待复核
        const { columns1, searchForm1, data1, pagination1, loading1 } = this.state;
        //已复核
        const { columns2, searchForm2, data2, pagination2, loading2 } = this.state;
        //凭证信息
        const { columns3, data3, loading3, accountDate, nowRecord, whetherAccout, column3Width } = this.state;
        //审批意见
        let { opinion } = this.state;
        //控制表格被点击行的颜色变化
        let { rowColorIndex } = this.state;
        let content = null;
        switch (this.state.nowStatus) {
            case 'backlashRechecking':
                content = <div>
                    <SearchArea
                        key='1'
                        searchForm={searchForm1}
                        submitHandle={this.search1}
                        clearHandle={this.clear1}
                        wrappedComponentRef={(inst) => this.formRef = inst}
                        maxLength={4} />
                    <div className='divider'></div>
                    <Table
                        rowClassName={(record, index) => rowColorIndex === index ? 'row-backgroundcolor' : ''}
                        rowKey={record => record.id}
                        columns={columns1}
                        dataSource={data1}
                        pagination={pagination1}
                        loading={loading1}
                        bordered
                        size='middle'
                        expandedRowRender={record => {
                            return (
                                <div>
                                    <Row gutter={24} type='flex' justify='start' style={{ marginLeft: '-9px', borderBottom: '1px solid #D0D0D0', paddingBottom: '8px' }}>
                                        <Col span={3} style={{ textAlign: 'right' }}> 报销单付款行</Col>
                                        <Col span={2}>
                                            {record.cashWriteOffReserveExpReport.currency}&nbsp;
                                                {record.cashWriteOffReserveExpReport.amount}
                                        </Col>
                                        <Col span={3} className='over-range'>
                                            <Popover content={<span> 收款方：{record.cashWriteOffReserveExpReport.payeeName}</span>}>
                                                收款方：{record.cashWriteOffReserveExpReport.payeeName}
                                            </Popover>
                                        </Col>
                                        <Col span={5} offset={1}>计划付款日期：{moment(record.cashWriteOffReserveExpReport.schedulePaymentDate).format('YYYY-MM-DD')}</Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}</span>}>
                                                关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}
                                            </Popover>
                                        </Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>备注：{record.cashWriteOffReserveExpReport.description}</span>}>
                                                备注：{record.cashWriteOffReserveExpReport.description}
                                            </Popover>
                                        </Col>
                                    </Row>
                                    <Row gutter={24} type='flex' justify='start' style={{ paddingTop: '8px', marginLeft: '-9px' }}>
                                        <Col span={3} style={{ textAlign: 'right' }}> 被核销单据行</Col>
                                        <Col span={2}>
                                            {record.cashWriteOffReservePrepaymentRequisition.currency}&nbsp;
                                                {record.cashWriteOffReservePrepaymentRequisition.amount}
                                        </Col>
                                        <Col span={3} className='over-range'>
                                            <Popover content={<span>收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}</span>}>
                                                收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}
                                            </Popover>
                                        </Col>
                                        <Col span={5} offset={1}>计划付款日期：{moment(record.cashWriteOffReservePrepaymentRequisition.requisitionPaymentDate).format('YYYY-MM-DD')}</Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>关联合同：{record.cashWriteOffReservePrepaymentRequisition.contractNumber}</span>}>
                                                关联合同：{record.cashWriteOffReservePrepaymentRequisition.contractNumber}
                                            </Popover>
                                        </Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>备注：{record.cashWriteOffReservePrepaymentRequisition.description}</span>}>
                                                备注：{record.cashWriteOffReservePrepaymentRequisition.description}
                                            </Popover>
                                        </Col>
                                    </Row>
                                </div>
                            )
                        }}
                        onRow={(record, index) => {
                            return {
                                onClick: (e) => this.onTableRowClick(e, record, index)
                            }
                        }}
                    />
                    <div style={{ marginBottom: '10px' }}></div>
                    <Card>
                        <Row gutter={24} type='flex' justify='start'>
                            <Col span={3}>
                                {/* 当whetherAccout为true 并且 isAccount不为Y时 按钮置灰 */}
                                <Button disabled={!whetherAccout || !nowRecord.id} type='primary' onClick={this.onCreateCredenceClick}>创建凭证</Button>
                            </Col>
                            <Col span={18}>
                                <span style={{ color: 'red' }}>*</span>
                                <span>反冲日期</span>
                                <DatePicker style={{ marginLeft: '10px' }} onChange={this.onAccountDateChange} value={accountDate} />
                            </Col>
                            {/* <Col span={2} style={{ color: '#1E90FF' }}>{nowRecord.documentNumber}</Col> */}
                            <Col span={24} style={{ marginTop: '10px' }}>
                                <Table
                                    rowKey={record => record.id}
                                    columns={columns3}
                                    dataSource={data3}
                                    loading={loading3}
                                    bordered
                                    size='middle'
                                    scroll={{ x: column3Width }}
                                    pagination={false} />
                            </Col>
                        </Row>
                    </Card>
                    <div style={{ marginBottom: '60px' }}></div>
                    <Affix className='bottom-bar' offsetBottom='0'>
                        <Row gutter={12} type='flex' justify='start' >
                            <Col offset={1}><label>复核意见：</label></Col>
                            <Col span={11} ><Input placeholder='请输入，最多200个字符' value={opinion} onChange={this.onOpinionChange} /></Col>
                            <Col span={1.5} ><Button type='primary' onClick={(e) => this.onPassClick(e, '1')}>通过</Button></Col>
                            <Col span={1.5} ><Button onClick={(e) => this.onPassClick(e, '-1')} style={{ background: '#F00000', color: 'white' }} type='danger'>驳回</Button></Col>
                        </Row>
                    </Affix>
                </div>;
                break;
            case 'backlashRechecked':
                content = <div>
                    <SearchArea
                        key='2'
                        searchForm={searchForm2}
                        submitHandle={this.search2}
                        clearHandle={this.clear2}
                        wrappedComponentRef={(inst) => this.formRef = inst}
                        maxLength={4} />
                    <div className='divider'></div>
                    <Table
                        rowClassName={(record, index) => rowColorIndex === index ? 'row-backgroundcolor' : ''}
                        scroll={{ x: 1600 }}
                        columns={columns2}
                        dataSource={data2}
                        pagination={pagination2}
                        loading={loading2}
                        bordered
                        size='middle'
                        rowKey={record => record.id}
                        expandedRowRender={record => {
                            return (
                                <div>
                                    <Row gutter={24} type='flex' justify='start' style={{ marginLeft: '-9px', borderBottom: '1px solid #D0D0D0', paddingBottom: '8px' }}>
                                        <Col span={3} style={{ textAlign: 'right' }}> 报销单付款行</Col>
                                        <Col span={2}>
                                            {record.cashWriteOffReserveExpReport.currency}&nbsp;
                                                {record.cashWriteOffReserveExpReport.amount}
                                        </Col>
                                        <Col span={3} className='over-range'>
                                            <Popover content={<span>收款方：{record.cashWriteOffReserveExpReport.payeeName}</span>}>
                                                收款方：{record.cashWriteOffReserveExpReport.payeeName}
                                            </Popover>
                                        </Col>
                                        <Col span={5} offset={1}>计划付款日期：{moment(record.cashWriteOffReserveExpReport.schedulePaymentDate).format('YYYY-MM-DD')}</Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}</span>}>
                                                关联合同：{record.cashWriteOffReserveExpReport.contractHeaderNumber}
                                            </Popover>
                                        </Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>备注：{record.cashWriteOffReserveExpReport.description}</span>}>
                                                备注：{record.cashWriteOffReserveExpReport.description}
                                            </Popover>
                                        </Col>
                                    </Row>
                                    <Row gutter={24} type='flex' justify='start' style={{ paddingTop: '8px', marginLeft: '-9px' }}>
                                        <Col span={3} style={{ textAlign: 'right' }}> 被核销单据行</Col>
                                        <Col span={2}>
                                            {record.cashWriteOffReservePrepaymentRequisition.currency}&nbsp;
                                                {record.cashWriteOffReservePrepaymentRequisition.amount}
                                        </Col>
                                        <Col span={3} className='over-range'>
                                            <Popover content={<span> 收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}</span>}>
                                                收款方：{record.cashWriteOffReservePrepaymentRequisition.partnerName}
                                            </Popover>
                                        </Col>
                                        <Col span={5} offset={1}>计划付款日期：{moment(record.cashWriteOffReservePrepaymentRequisition.requisitionPaymentDate).format('YYYY-MM-DD')}</Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>关联合同：{record.cashWriteOffReservePrepaymentRequisition.contractNumber}</span>}>
                                                关联合同：{record.cashWriteOffReservePrepaymentRequisition.contractNumber}
                                            </Popover>
                                        </Col>
                                        <Col span={5} className='over-range'>
                                            <Popover content={<span>备注：{record.cashWriteOffReservePrepaymentRequisition.description}</span>}>
                                                备注：{record.cashWriteOffReservePrepaymentRequisition.description}
                                            </Popover>
                                        </Col>
                                    </Row>
                                </div>
                            )
                        }}
                        onRow={(record, index) => {
                            return {
                                onClick: (e) => this.onTableRowClick(e, record, index)
                            }
                        }}
                    />
                    <div style={{ marginBottom: '10px' }}></div>
                    <Card>
                        <Row gutter={24} type='flex' justify='start'>
                            <Col span={21}>
                                <span>反冲日期</span>
                                <DatePicker disabled style={{ marginLeft: '10px' }} value={nowRecord.writeOffDate ? moment(nowRecord.writeOffDate, 'YYYY-MM-DD') : ''} />
                            </Col>
                            {/* <Col span={2} style={{ color: '#1E90FF' }}>{nowRecord.documentNumber}</Col> */}
                            <Col span={24} style={{ marginTop: '10px' }}></Col>
                        </Row>
                        <Table
                            rowKey={record => record.id}
                            columns={columns3}
                            dataSource={data3}
                            loading={loading3}
                            bordered
                            size='middle'
                            scroll={{ x: 1500 }}
                            pagination={false} />
                    </Card>
                </div>;
                break;
        }
        return content;
    };
    /**
     * 渲染函数
     */
    render() {
        //附件
        let { attachmentVisible, nowAttachmentRecord } = this.state;
        //面板
        const { tabs, nowStatus } = this.state;
        return (
            <div style={{paddingBottom : 20}}>
                <Tabs onChange={this.onChangeTabs} defaultActiveKey={nowStatus}>
                    {
                        tabs.map(tab => {
                            return <TabPane tab={tab.name} key={tab.key} />
                        })
                    }
                </Tabs>
                {this.renderContent()}
                {/* 附件弹窗 */}
                <EditViewUpload
                    visible={attachmentVisible}
                    onCancel={() => { this.setState({ attachmentVisible: false }) }}
                    attachmentType='CASH_WRITE_OFF'
                    multiple={false}
                    // 控制附件是否可编辑
                    disabled={true}
                    showUploadList={true}
                    defaultFileList={nowAttachmentRecord.attachments} />
            </div>
        )
    }
}

/**
 * redux
 */
function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company,
    }
}
export default connect(mapStateToProps, null, null, { withRef: true })(CshWriteOffBacklashCheck)
