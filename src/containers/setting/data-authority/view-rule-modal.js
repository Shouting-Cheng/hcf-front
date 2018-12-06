import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Row, Col, Divider, Card, Form, Select, Input } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import BasicInfo from 'widget/basic-info';
import ListSelector from 'components/Widget/list-selector';
import LineAddTransferModal from 'containers/setting/data-authority/line-add-transfer-modal';
import DataAuthorityService from 'containers/setting/data-authority/data-authority.service';
import RuleDetailItem from 'containers/setting/data-authority/rule-detail-items';
import CustomTable from 'components/Widget/custom-table';
import config from 'config';

class ViewRuleModal extends React.Component {
    constructor(props) {
        super(props)
        this.targetKey = 0;
        this.state = {
            infoList: [
                {
                    //数据权限代码
                    type: 'input',
                    label: '数据权限代码',
                    id: 'dataAuthorityCode',
                    disabled: true
                },
                {
                    //数据权限名称
                    type: 'input',
                    label: '数据权限名称',
                    id: 'dataAuthorityName',
                    disabled: false
                },
                {
                    //描述
                    type: 'input',
                    label: '描述',
                    id: 'description',
                    disabled: false
                },
                {
                    //状态
                    type: 'switch',
                    label: '状态',
                    id: 'enabled'
                }

            ],
            infoData: {},
            renderSelectList: false,
            renderCompanyList: false,
            renderDepartmentList: false,
            renderEmplyeeList: false,
            show: true,
            tabListNoTitle: [
                {
                    key: 'SOB',
                    tab: '账套权限'
                },
                {
                    key: 'COMPANY',
                    tab: '公司权限'
                },
                {
                    key: 'UNIT',
                    tab: '部门权限'
                },
                {
                    key: 'EMPLOYEE',
                    tab: '员工权限'
                },

            ],
            activeKey: 'SOB',
            tenantVisible: false,
            tenantItem: {},
            companyVisible: false,
            empolyeeVisible: false,
            employeeItem: {},
            renderRuleInfo: undefined,
            renderNewChangeRules: [],
            dataType: {
                'SOB': { label: '账套' },
                'COMPANY': { label: '公司' },
                'UNIT': { label: '部门' },
                'EMPLOYEE': { label: '员工' },
            },
            editKey: '',
            renderNewChangeRules: [],
            ruleDetail: [],
            columns: [
                {
                    title: '账套代码',
                    dataIndex: 'valueKeyCode',
                },
                {
                    title: '账套名称',
                    dataIndex: 'valueKeyDesc',
                }
            ],
            dataTypeValue: ''

        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.visibel) {
            let { columns } = this.state;
            DataAuthorityService.getSingleDataAuthorityDetail(this.props.dataId, this.props.targetId).then(res => {
                if (res.data.dataAuthorityRules[0].dataAuthorityRuleDetails[0].dataScope === '1004') {
                    this.setState({
                        columns: [
                            {
                                title: '账套代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '账套名称',
                                dataIndex: 'valueKeyDesc',
                            },
                            {
                                title: '权限状态',
                                dataIndex: 'filtrateMethodDesc',
                            }
                        ],
                    })
                }
                this.setState({
                    infoData: res.data,
                    renderRuleInfo: res.data,
                    ruleDetail: res.data.dataAuthorityRules[0].dataAuthorityRuleDetails,
                    dataTypeValue: res.data.dataAuthorityRules[0].dataAuthorityRuleDetails[0].dataType,
                })
            })
        }

    }

    onCloseRuleModal = () => {
        this.props.closeRuleModal()
    }
    editRuleItem = () => {

    }
    /**选中手动选择 */
    handleChangeRuleChange = (value) => {
        if (value === '1004') {
            this.setState({
                renderSelectList: true
            })
        } else {
            this.setState({
                renderSelectList: false
            })
        }
    }
    handleChangeCompany = (value) => {
        if (value === '1004') {
            this.setState({
                renderCompanyList: true
            })
        } else {
            this.setState({
                renderCompanyList: false
            })
        }
    }
    handleChangeDepartment = (value) => {
        if (value === '1004') {
            this.setState({
                renderDepartmentList: true
            })
        } else {
            this.setState({
                renderDepartmentList: false
            })
        }
    }
    handleEmplyee = (value) => {
        if (value === '1004') {
            this.setState({
                renderEmplyeeList: true
            })
        } else {
            this.setState({
                renderEmplyeeList: false
            })
        }
    }
    /**编辑数据详情 */
    editRuleCard = (item) => {
        alert(item.id);
        this.setState({
            show: false
        })
    }

    /**保存数据规则 */
    saveRuleCard = () => {
        this.setState({
            show: true
        })
    }
    /**取消保存数据规则 */
    canceleRuleCard = () => {
        this.setState({
            show: true
        })
    }
    onTabChange = (key, type) => {
        this.setState({
            [type]: key,
            dataTypeValue: key
        });
        const { ruleDetail, columns } = this.state;
        if (key === 'SOB') {
            if (ruleDetail[0].dataScope === '1004') {
                this.setState({
                    columns: [
                        {
                            title: '账套代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '账套名称',
                            dataIndex: 'valueKeyDesc',
                        },
                        {
                            title: '权限状态',
                            dataIndex: 'filtrateMethodDesc',
                        }
                    ],
                })
            } else {
                this.setState({
                    columns: [
                        {
                            title: '账套代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '账套名称',
                            dataIndex: 'valueKeyDesc',
                        }
                    ]
                })
            }
        }
        if (key === 'COMPANY') {
            if (ruleDetail[1].dataScope === '1004') {
                this.setState({
                    columns: [
                        {
                            title: '公司代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '公司名称',
                            dataIndex: 'valueKeyDesc',
                        },
                        {
                            title: '权限状态',
                            dataIndex: 'filtrateMethodDesc',
                        }
                    ],
                })
            } else {
                this.setState({
                    columns: [
                        {
                            title: '公司代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '公司名称',
                            dataIndex: 'valueKeyDesc',
                        }
                    ]
                })
            }

        }
        if (key === 'UNIT') {
            if (ruleDetail[2].dataScope === '1004') {
                this.setState({
                    columns: [
                        {
                            title: '部门代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '部门名称',
                            dataIndex: 'valueKeyDesc',
                        },
                        {
                            title: '权限状态',
                            dataIndex: 'filtrateMethodDesc',
                        }
                    ],
                })
            } else {
                this.setState({
                    columns: [
                        {
                            title: '部门代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '部门名称',
                            dataIndex: 'valueKeyDesc',
                        }
                    ]
                })
            }

        }
        if (key === 'EMPLOYEE') {
            if (ruleDetail[3].dataScope === '1004') {
                this.setState({
                    columns: [
                        {
                            title: '员工代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '员工名称',
                            dataIndex: 'valueKeyDesc',
                        },
                        {
                            title: '权限状态',
                            dataIndex: 'filtrateMethodDesc',
                        }
                    ],
                })
            } else {
                this.setState({
                    columns: [
                        {
                            title: '员工代码',
                            dataIndex: 'valueKeyCode',
                        },
                        {
                            title: '员工名称',
                            dataIndex: 'valueKeyDesc',
                        }
                    ]
                })
            }

        }
    }
    /**添加账套 */
    addTenant = () => {
        const tenantItem = {
            title: '添加账套',
            url: `${config.baseUrl}/api/expReportHeader/get/release/by/reportId`,
            searchForm: [
                { type: 'input', id: 'businessCode', label: '账套代码', colSpan: 6 },
                { type: 'input', id: 'formName', label: '账套名称', colSpan: 6 },
            ],
            columns: [
                { title: "申请单单号", dataIndex: 'applicationCode', width: 150 },
                { title: "申请单类型", dataIndex: 'applicationTypeNum' },
                { title: "费用类型", dataIndex: 'expenseType' },
                { title: "申请人", dataIndex: 'applicant' },
                { title: "申请日期", dataIndex: 'applicationDate' },
                { title: "币种", dataIndex: 'currency' },
                { title: "金额", dataIndex: 'amount' },
                { title: "关联金额", dataIndex: 'releaseAmount' },
                { title: "备注", dataIndex: 'remark' },
            ],
            key: 'id'
        }
        this.setState({
            tenantVisible: true,
            tenantItem
        })
    }
    handleTenantListOk = () => {

    }
    cancelTenantList = (flag) => {
        this.setState({
            tenantVisible: flag
        })
    }
    /** 添加公司*/
    addCompany = () => {
        this.setState({
            companyVisible: true,
        })
    }
    cancelCompanyList = () => {
        this.setState({
            companyVisible: false
        })
    }
    //添加员工
    addEmployee = () => {
        const employeeItem = {
            title: '添加员工',
            url: `${config.baseUrl}/api/expReportHeader/get/release/by/reportId`,
            searchForm: [
                { type: 'input', id: 'businessCode', label: '账套代码', colSpan: 6 },
                { type: 'input', id: 'formName', label: '账套名称', colSpan: 6 },
            ],
            columns: [
                { title: "申请单单号", dataIndex: 'applicationCode', width: 150 },
                { title: "申请单类型", dataIndex: 'applicationTypeNum' },
                { title: "费用类型", dataIndex: 'expenseType' },
                { title: "申请人", dataIndex: 'applicant' },
                { title: "申请日期", dataIndex: 'applicationDate' },
                { title: "币种", dataIndex: 'currency' },
                { title: "金额", dataIndex: 'amount' },
                { title: "关联金额", dataIndex: 'releaseAmount' },
                { title: "备注", dataIndex: 'remark' },
            ],
            key: 'id'
        }
        this.setState({
            empolyeeVisible: true,
            employeeItem
        })
    }
    handleEmployeeListOk = () => {
        this.setState({
            empolyeeVisible: false
        })
    }
    cancelEmployeeList = () => {
        this.setState({
            empolyeeVisible: false
        })
    }
    handleRenderLists = () => {

    }
    /**刷新表格 */
    refresh = (ruleDatail) => {
        this.setState({ ruleDetail: ruleDatail }, () => {
            let { dataTypeValue, ruleDetail } = this.state;
            if (dataTypeValue === 'SOB') {
                if (ruleDetail[0].dataScope === '1004') {
                    this.setState({
                        columns: [
                            {
                                title: '账套代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '账套名称',
                                dataIndex: 'valueKeyDesc',
                            },
                            {
                                title: '权限状态',
                                dataIndex: 'filtrateMethodDesc',
                            }
                        ],
                    })
                } else {
                    this.setState({
                        columns: [
                            {
                                title: '账套代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '账套名称',
                                dataIndex: 'valueKeyDesc',
                            }
                        ]
                    })
                }
                this.sobTable.search()
            }
            if (dataTypeValue === 'COMPANY') {
                if (ruleDetail[1].dataScope === '1004') {
                    this.setState({
                        columns: [
                            {
                                title: '公司代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '公司名称',
                                dataIndex: 'valueKeyDesc',
                            },
                            {
                                title: '权限状态',
                                dataIndex: 'filtrateMethodDesc',
                            }
                        ],
                    })
                } else {
                    this.setState({
                        columns: [
                            {
                                title: '公司代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '公司名称',
                                dataIndex: 'valueKeyDesc',
                            }
                        ]
                    })
                }
                this.companyTable.search()
            }
            if (dataTypeValue === 'UNIT') {
                if (ruleDetail[2].dataScope === '1004') {
                    this.setState({
                        columns: [
                            {
                                title: '部门代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '部门名称',
                                dataIndex: 'valueKeyDesc',
                            },
                            {
                                title: '权限状态',
                                dataIndex: 'filtrateMethodDesc',
                            }
                        ],
                    })
                } else {
                    this.setState({
                        columns: [
                            {
                                title: '部门代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '部门名称',
                                dataIndex: 'valueKeyDesc',
                            }
                        ]
                    })
                }

                this.unitTable.search()
            }
            if (dataTypeValue === 'EMPLOYEE') {
                if (ruleDetail[3].dataScope === '1004') {
                    this.setState({
                        columns: [
                            {
                                title: '员工代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '员工名称',
                                dataIndex: 'valueKeyDesc',
                            },
                            {
                                title: '权限状态',
                                dataIndex: 'filtrateMethodDesc',
                            }
                        ],
                    })
                } else {
                    this.setState({
                        columns: [
                            {
                                title: '员工代码',
                                dataIndex: 'valueKeyCode',
                            },
                            {
                                title: '员工名称',
                                dataIndex: 'valueKeyDesc',
                            }
                        ]
                    })
                }
                this.employeeTable.search()
            }

        })

    }
    render() {
        const { visibel } = this.props;
        const { infoList, infoData, dataTypeValue, renderCompanyList, activeKey, tenantItem, companyVisible, renderRuleInfo, dataType,
            ruleDetail, tabListNoTitle, tenantVisible, empolyeeVisible, employeeItem, renderNewChangeRules, columns } = this.state;
        console.log(ruleDetail)
        const contentListNoTitle = {
            SOB:
                <div>
                    {ruleDetail.length ? ruleDetail[0].dataScopeDesc : null}
                    <div style={{ marginTop: 20 }}>
                        <CustomTable
                            columns={columns}
                            url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue ? dataTypeValue : 'SOB'}`}
                            ref={ref => this.sobTable = ref}
                        />
                    </div>
                </div>,
            COMPANY:
                <div>
                    {ruleDetail.length ? ruleDetail[1].dataScopeDesc : null}
                    <div style={{ marginTop: 20 }}>
                        <CustomTable
                            columns={columns}
                            url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue}`}
                            ref={ref => this.companyTable = ref}
                        />
                    </div>
                </div>,
            UNIT: <div>
                {ruleDetail.length ? ruleDetail[2].dataScopeDesc : null}
                <div style={{ marginTop: 20 }}>
                    <CustomTable
                        columns={columns}
                        url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue}`}
                        ref={ref => this.unitTable = ref}
                    />
                </div>
            </div>,
            EMPLOYEE: <div>
                {ruleDetail.length ? ruleDetail[3].dataScopeDesc : null}
                <div style={{ marginTop: 20 }}>
                    <CustomTable
                        columns={columns}
                        url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue}`}
                        ref={ref => this.employeeTable = ref}
                    />
                </div>
            </div>
        };
        return (
            <Modal
                visible={visibel}
                footer={[
                    <Button key="back" onClick={this.onCloseRuleModal}>
                        {this.$t({ id: 'common.back' } /* 返回*/)}
                    </Button>,
                ]}
                width={1200}
                destroyOnClose={true}
                closable={false}
                onCancel={this.onCloseRuleModal}
            >
                <div>
                    <BasicInfo
                        infoList={infoList}
                        isHideEditBtn={true}
                        infoData={infoData}
                        colSpan={6}
                    />

                    <div style={{ marginTop: 24 }}>
                        {renderRuleInfo ? renderRuleInfo.dataAuthorityRules.map(Item => (
                            <RuleDetailItem
                                key={Item.id}
                                params={{
                                    name: Item.dataAuthorityRuleName,
                                    ruleDatail: Item.dataAuthorityRuleDetails,
                                    getRulesArr: Item,
                                    deleted: renderRuleInfo.deleted,
                                    versionNumber: renderRuleInfo.versionNumber,
                                    createdBy: renderRuleInfo.createdBy,
                                    createdDate: renderRuleInfo.createdDate,
                                    lastUpdatedBy: renderRuleInfo.lastUpdatedBy,
                                    lastUpdatedDate: renderRuleInfo.lastUpdatedDate,
                                    ruleId: renderRuleInfo.id,
                                    renderRuleInfo: renderRuleInfo

                                }}
                                refresh={this.refresh}
                            />
                        )) : null}
                    </div>

                    <Card
                        tabList={tabListNoTitle}
                        activeTabKey={activeKey}
                        onTabChange={(key) => { this.onTabChange(key, 'activeKey'); }}
                        style={{ marginTop: 25, width: '100%' }}
                        className='rule-ant-card'
                    >
                        {contentListNoTitle[this.state.activeKey]}
                    </Card>
                    <ListSelector
                        visible={tenantVisible}
                        selectorItem={tenantItem}
                        onOk={this.handleTenantListOk}
                        onCancel={() => this.cancelTenantList(false)}
                        showSelectTotal={true}
                    />
                    <ListSelector
                        visible={empolyeeVisible}
                        selectorItem={employeeItem}
                        onOk={this.handleEmployeeListOk}
                        onCancel={() => this.cancelEmployeeList(false)}
                        showSelectTotal={true}
                    />
                    <LineAddTransferModal
                        visible={companyVisible}
                        title='添加公司'
                        onCloseTransferModal={this.cancelCompanyList}
                    />

                </div>
            </Modal>
        )

    }

}

const WrappedLineModelChangeRules = Form.create()(ViewRuleModal);

function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company
    };
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedLineModelChangeRules);