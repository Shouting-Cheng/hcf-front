import React from 'react';
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import { Form, Select, Breadcrumb, Tag, Divider, Input, DatePicker, Tabs, Button, Menu, Radio, Dropdown, Row, Col, Spin, Table, Timeline, message, Popover, Popconfirm, Icon } from 'antd'
import config from 'config';
const TabPane = Tabs.TabPane;

import 'styles/reimburse/reimburse.scss';
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import moment, { now } from "moment"
const FormItem = Form.Item;
const Option = Select.Option;
const CheckableTag = Tag.CheckableTag;
const { TextArea } = Input;

class AccountingInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                { title: "序号", align: "center", dataIndex: "index", key: "index", width: 60, render: (value, record, index) => index + 1 },
                {
                    title: "行说明", width: 100, dataIndex: "lineDescription", key: "lineDescription", render: (value) => {
                        return <Popover content={value}>{value}</Popover>
                    }
                },
                {
                    title: "凭证日期", align: "center", width: 100, dataIndex: "accountingDate", key: "accountingDate",
                    render: value => moment(value).format('YYYY-MM-DD')
                },
                {
                    title: "公司", width: 100, dataIndex: "companyName", key: "companyName", render: (value) => {
                        return <Popover content={value}>{value}</Popover>
                    }
                },
                {
                    title: "责任中心", align: "center", width: 100, dataIndex: "costCenterName", key: "costCenterName", render: (value) => {
                        return <Popover content={value}>{value}</Popover>
                    }
                },
                {
                    title: "科目", align: "center", width: 100, dataIndex: "accountCode", key: "accountCode", render: (value) => {
                        return <Popover content={value}>{value}</Popover>
                    }
                },
                {
                    title: "币种", align: "center", width: 100, dataIndex: "currencyCode", key: "currencyCode"
                },
                { title: "原币借方", width: 100, dataIndex: 'enteredAmountDr', render: this.filterMoney },
                { title: "原币贷方", width: 100, dataIndex: 'enteredAmountCr', render: this.filterMoney },
                { title: "本币借方", width: 100, dataIndex: 'functionalAmountDr', render: this.filterMoney },
                { title: "本币贷方", width: 100, dataIndex: 'functionalAmountCr', render: this.filterMoney }
            ],
            loading: false,
            createLoading: false,
            loading2: false,
            unApproveSearchParams: {},
            approveSearchParams: {},
            unapprovedData: [],
            approvedData: [],
            unapprovedPagination: {
                total: 0,
                page: 0,
                pageSize: 10
            },
            approvedPagination: {
                total: 0,
                page: 0,
                pageSize: 10
            },
            headerData: {},
            tabValue: 'expenseAccounting',
            x: 0,
            record: {},
            dateFormat: 'YYYY/MM/DD'
        };
    }
    //根据租户 动态获取科目段值
    getAccountingSegment = () => {
        reimburseService.getAccountingSegment(this.state.headerData.setOfBooksId).then(res => {
            let columns = this.state.columns;
            res.data.map(c => {
                columns.push({ title: c.segmentName, dataIndex: c.segmentClassField, key: c.segmentClassField });
            });
            this.setState({ columns, x: 1200 + (res.data.length) * 100 });
        });
    }

    /*componentDidMount(){
      this.setState({
        headerData: this.props.headerData
       }, () => {
        //获取科目段动态列
        this.getAccountingSegment();
        this.getUnApprovedList();
        this.getApprovedList();
      });
    }*/
    componentWillReceiveProps(nextProps) {
        if (nextProps.headerData.id && !this.props.headerData.id) {
            this.setState({
                headerData: nextProps.headerData
            }, () => {
                //获取科目段动态列
                this.getAccountingSegment();
                this.getUnApprovedList();
                this.getApprovedList();
            });
        }
    }
    componentWillMount() {
        this.setState({ loading: true, loading2: true });
    }

    getApprovedList = () => {
        this.setState({ loading: true, loading2: true });
        const { approvedPagination } = this.state;
        let params = {};
        params.tenantId = this.state.headerData.tenantId;
        params.sourceTransactionType = 'CSH_WRITE_OFF';
        params.transactionNumber = this.state.headerData.businessCode;
        params.page = this.state.approvedPagination.page;
        params.size = this.state.approvedPagination.pageSize;
        reimburseService.getAccountingInfoByNumber(params).then(res => {
            if (res.status === 200) {
                this.setState({
                    approvedData: res.data,
                    approvedPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: approvedPagination.page + 1,
                        pageSize: 10,
                        onChange: this.onApprovedChangePaper
                    },
                    loading: false,
                    loading2: false,
                    createLoading: false
                });
            }
        }).catch(() => {
            this.setState({ loading2: false });
        })
    }

    getUnApprovedList = () => {
        this.setState({ loading: true, loading2: true });
        const { unapprovedPagination } = this.state;
        let params = {};
        params.tenantId = this.state.headerData.tenantId;
        params.sourceTransactionType = 'EXP_REPORT';
        params.transactionNumber = this.state.headerData.businessCode;
        params.page = this.state.unapprovedPagination.page;
        params.size = this.state.unapprovedPagination.pageSize;
        reimburseService.getAccountingInfoByNumber(params).then(res => {
            if (res.status === 200) {
                this.setState({
                    unapprovedData: res.data,
                    unapprovedPagination: {
                        total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                        current: unapprovedPagination.page + 1,
                        pageSize: 10,
                        onChange: this.onUnApprovedChangePaper
                    },
                    loading: false,
                    loading2: false,
                    createLoading: false
                });
            }
        }).catch(() => {
            this.setState({ loading: false, loading2: false });
        })
    }

    onApprovedChangePaper = (page) => {
        if (page - 1 !== this.state.approvedPagination.page) {
            this.setState({ approvedPagination: { page: page - 1, pageSize: 10 } }, () => {
                this.getApprovedList()
            })
        }
    }
    onUnApprovedChangePaper = (page) => {
        if (page - 1 !== this.state.unapprovedPagination.page) {
            this.setState({ unapprovedPagination: { page: page - 1, pageSize: 10 } }, () => {
                this.getUnApprovedList()
            })
        }
    }
    // 创建凭证
    createAccounting = (e) => {
        this.setState({ createLoading: true });
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let accountDate = values['accountingDate'].format('YYYY-MM-DD');
                reimburseService.createAccounting(this.state.headerData.id, accountDate).then(res => {
                    this.getUnApprovedList();
                    this.getApprovedList();
                }).catch(err => {
                    message.error("创建凭证失败：" + err.res.data.message);
                })
            } else {
                this.setState({ createLoading: false });
            }
        });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading, columns, dateFormat, x, tabValue, loading2, unapprovedData, approvedData, unapprovedPagination, approvedPagination } = this.state;
        const { summaryView, headerData } = this.props;
        return (
            <div className="tab-container reimburse-container">
                 <Row>
                   <Form onSubmit={this.createAccounting} style={{height:40}}>
                     <Row align={"right"}>
                       <Col style={{ textAlign: "left",width: "110px",marginTop:3 }} span={1}>
                                <span>
                                    {this.state.headerData.auditFlag ?
                                      <Button type="primary" htmlType="submit" disabled loading={this.props.loading}>凭证日期</Button>
                                      :
                                      <Button type="primary" htmlType="submit" loading={this.state.createLoading}>创建凭证</Button>
                                    }
                                </span>
                       </Col>
                       <Col style={{ textAlign: "left"}} span={3}>
                         <FormItem width="100px">
                           {this.state.headerData.auditFlag ? getFieldDecorator('accountingDate', {
                               rules: [{
                                 required: true,
                                 message: this.$t({ id: "common.please.enter" })
                               }],
                               initialValue: moment(this.state.headerData.lastModifiedDate, dateFormat)
                             })(
                             <DatePicker disabled />
                             ) :
                             getFieldDecorator('accountingDate', {
                               rules: [{
                                 required: true,
                                 message: this.$t({ id: "common.please.enter" })
                               }],
                               initialValue: moment(new Date(), dateFormat)
                             })(
                               <DatePicker />
                             )
                           }
                         </FormItem>
                       </Col>
                     </Row>
                   </Form>
                 </Row>
                 <Row>
                    <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange} style={{ paddingTop: 0,marginTop:-24}} >
                        <TabPane tab="费用凭证" key="expenseAccounting" style={{ marginTop: "-20px",overflow:"visible"  }}>
                            <div className="table-header">
                                <div className="table-header-title">
                                    {this.$t({ id: "common.total" }, { total: unapprovedPagination.total ? unapprovedPagination.total : "0" }/*共搜索到 {total} 条数据*/)}
                                </div>
                            </div>
                            <Table rowKey={record => record.id}
                                columns={columns} dataSource={unapprovedData} pagination={unapprovedPagination}
                                loading={loading}
                                scroll={{ x: true, y: false }}
                                bordered
                                size="middle" />
                        </TabPane>
                        <TabPane tab="核销凭证" key="writeOffAccounting" style={{ marginTop: "-20px" ,overflow:"visible" }}>
                            <div className="table-header">
                                <div className="table-header-title">
                                    {this.$t({ id: "common.total" }, { total: approvedPagination.total ? approvedPagination.total : "0" }/*共搜索到 {total} 条数据*/)}
                                </div>
                            </div>
                            <Table rowKey={record => record.id}
                                columns={columns}
                                dataSource={approvedData} pagination={approvedPagination} loading={loading2}
                                scroll={{ x: true, y: false }}
                                bordered
                                size="middle" />
                        </TabPane>
                    </Tabs>
                </Row>
            </div>
        )
    }
}

const WrappedAccountingInfo = Form.create()(AccountingInfo);
function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedAccountingInfo);













