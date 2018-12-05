import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Row, Col, Divider, Card, Form, Select, Input } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import BasicInfo from 'widget/basic-info';
import ListSelector from 'components/Widget/list-selector';
import LineAddTransferModal from 'containers/setting/data-authority/line-add-transfer-modal';
import DataAuthorityService from 'containers/setting/data-authority/data-authority.service';
import config from 'config';

class ViewRuleModal extends React.Component {
    constructor(props) {
        super(props)
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
                    key: 'tenantPermission',
                    tab: '账套权限'
                },
                {
                    key: 'companyPermission',
                    tab: '公司权限'
                },
                {
                    key: 'departmentPermission',
                    tab: '部门权限'
                },
                {
                    key: 'empolyeePermission',
                    tab: '员工权限'
                },

            ],
            noTitleKey: 'tenantPermission',
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


        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.visibel) {
            DataAuthorityService.getDataAuthorityDetail(this.props.targeKey).then(res => {
                console.log(res);
                this.setState({
                    infoData: res.data,
                    renderRuleInfo: res.data
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
        console.log(item.id)
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
        console.log(key, type);
        this.setState({ [type]: key });
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
    render() {
        const { visibel } = this.props;
        const { infoList, infoData, renderSelectList, renderCompanyList, noTitleKey, tenantItem, companyVisible, renderRuleInfo, dataType,
            renderDepartmentList, renderEmplyeeList, show, tabListNoTitle, tenantVisible, empolyeeVisible, employeeItem } = this.state;
        const { getFieldDecorator } = this.props.form;
        const ruleFormLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 16, offset: 1 },
        }
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
                    {renderRuleInfo ? renderRuleInfo.dataAuthorityRules.map((item) => (
                        <Form>
                            <Card key={item.id} title={show ? item.dataAuthorityRuleName :
                                <span className="rule-form-title">
                                    <FormItem
                                        {...ruleFormLayout}
                                        label=' '
                                    >
                                        {getFieldDecorator(`dataAuthorityRuleName-${item.id}`, {
                                            rules: [{
                                                required: true,
                                                message: this.$t({ id: 'common.please.enter' }),
                                            }],
                                            initialValue: item.dataAuthorityRuleName || '',
                                        })(
                                            <Input className="input_title" placeholder='请输入规则名称' />
                                        )}

                                    </FormItem>
                                </span>
                            } style={{ marginTop: 25, background: '#f7f7f7' }}
                                extra={show ? <a onClick={()=>this.editRuleCard(item)}>编辑</a> : <span>
                                    <a onClick={this.saveRuleCard}>保存</a>
                                    <a onClick={this.canceleRuleCard} style={{ marginLeft: 10 }}>取消</a></span>}>
                                {show &&
                                    <Row>
                                        {item.dataAuthorityRuleDetails.map(rule => (
                                            <Col span={24}>
                                                <span>{dataType[rule.dataType].label}:</span>
                                                {rule.dataScopeDesc === '手工选择' ?
                                                    <span>
                                                        {rule.filtrateMethodDesc}
                                                    </span> : <span>
                                                        {rule.dataScopeDesc}{dataType[rule.dataType].label}
                                                    </span>
                                                }
                                            </Col>
                                        ))}

                                    </Row>
                                }
                                {!show &&
                                    <div className='add-rule-form'>
                                        <Row className="rule-form-item">
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='账套'
                                                >
                                                    {getFieldDecorator(`dataScope1-${item.id}`, {
                                                        rules: [],
                                                        initialValue: item.dataAuthorityRuleDetails.length ? item.dataAuthorityRuleDetails[0].dataScope : '1001'
                                                    })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeRuleChange}>
                                                            <Option value='1001'>全部</Option>
                                                            <Option value='1002'>当前</Option>
                                                            <Option value='1004'>手动选择</Option>
                                                        </Select>
                                                    )}

                                                </FormItem>
                                            </Col>
                                            {renderSelectList &&
                                                <Col span={16} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod1-${item.id}`, {
                                                                    rules: [],
                                                                    initialValue: item.dataAuthorityRuleDetails[0].filtrateMethod ? item.dataAuthorityRuleDetails[0].filtrateMethod : 'INCLUDE'
                                                                })(
                                                                    <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                                        <Option value='INCLUDE'>包含</Option>
                                                                        <Option value='EXCLUDE'>排除</Option>
                                                                    </Select>
                                                                )}

                                                            </FormItem>
                                                        </Col>
                                                        <Col span={6} style={{ marginLeft: '-25px' }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator('addTenant')(
                                                                    <Button icon="plus" onClick={this.addTenant}>添加账套</Button>
                                                                )}

                                                            </FormItem>
                                                        </Col>
                                                    </Row>

                                                </Col>
                                            }
                                        </Row>
                                        <Row className="rule-form-item">
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='公司'
                                                >
                                                    {getFieldDecorator(`dataScope2-${item.id}`, {
                                                        rules: [],
                                                        initialValue: item.dataAuthorityRuleDetails.length ? item.dataAuthorityRuleDetails[1].dataScope : '1001'
                                                    })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeCompany}>
                                                            <Option value='1001'>全部</Option>
                                                            <Option value='1002'>当前</Option>
                                                            <Option value='1003'>当前及下属</Option>
                                                            <Option value='1004'>手动选择</Option>
                                                        </Select>
                                                    )}

                                                </FormItem>
                                            </Col>
                                            {renderCompanyList &&
                                                <Col span={16} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod2-${item.id}`, {
                                                                    rules: [],
                                                                    initialValue: item.dataAuthorityRuleDetails[1].filtrateMethod ? item.dataAuthorityRuleDetails[1].filtrateMethod : 'INCLUDE'
                                                                })(
                                                                    <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                                        <Option value='INCLUDE'>包含</Option>
                                                                        <Option value='EXCLUDE'>排除</Option>
                                                                    </Select>
                                                                )}
                                                            </FormItem>
                                                        </Col>
                                                        <Col span={6} style={{ marginLeft: '-25px' }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator('addCompany')(
                                                                    <Button icon="plus" onClick={this.addCompany}>添加公司</Button>
                                                                )}

                                                            </FormItem>
                                                        </Col>
                                                    </Row>

                                                </Col>
                                            }
                                        </Row>
                                        <Row className="rule-form-item">
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='部门'
                                                >
                                                    {getFieldDecorator(`dataScope3-${item.id}`, {
                                                        rules: [],
                                                        initialValue: item.dataAuthorityRuleDetails.length ? item.dataAuthorityRuleDetails[2].dataScope : '1001'
                                                    })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeDepartment}>
                                                            <Option value='1001'>全部</Option>
                                                            <Option value='1002'>当前</Option>
                                                            <Option value='1003'>当前及下属</Option>
                                                            <Option value='1004'>手动选择</Option>
                                                        </Select>
                                                    )}

                                                </FormItem>
                                            </Col>
                                            {renderDepartmentList &&
                                                <Col span={16} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod3-${item.id}`, {
                                                                    rules: [],
                                                                    initialValue: item.dataAuthorityRuleDetails[2].filtrateMethod ? item.dataAuthorityRuleDetails[2].filtrateMethod : 'INCLUDE'
                                                                })(
                                                                    <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                                        <Option value='INCLUDE'>包含</Option>
                                                                        <Option value='EXCLUDE'>排除</Option>
                                                                    </Select>
                                                                )}

                                                            </FormItem>
                                                        </Col>
                                                        <Col span={6} style={{ marginLeft: '-25px' }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator('addTenant')(
                                                                    <Button icon="plus">添加部门</Button>
                                                                )}

                                                            </FormItem>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            }
                                        </Row>
                                        <Row className="rule-form-item">
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='员工'
                                                >
                                                    {getFieldDecorator(`dataScope4-${item.id}`, {
                                                        rules: [],
                                                        initialValue: item.dataAuthorityRuleDetails.length ? item.dataAuthorityRuleDetails[3].dataScope : '1001'
                                                    })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleEmplyee}>
                                                            <Option value='1001'>全部</Option>
                                                            <Option value='1002'>当前</Option>
                                                            <Option value='1004'>手动选择</Option>
                                                        </Select>
                                                    )}


                                                </FormItem>
                                            </Col>
                                            {renderEmplyeeList &&
                                                <Col span={16} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod4-${item.id}`, {
                                                                    rules: [],
                                                                    initialValue: item.dataAuthorityRuleDetails[3].filtrateMethod ? item.dataAuthorityRuleDetails[3].filtrateMethod : 'INCLUDE'
                                                                })(
                                                                    <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                                        <Option value='INCLUDE'>包含</Option>
                                                                        <Option value='EXCLUDE'>排除</Option>
                                                                    </Select>
                                                                )}

                                                            </FormItem>
                                                        </Col>
                                                        <Col span={6} style={{ marginLeft: '-25px' }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator('addEmpolyee')(
                                                                    <Button icon="plus" onClick={this.addEmployee}>添加员工</Button>
                                                                )}

                                                            </FormItem>
                                                        </Col>
                                                    </Row>

                                                </Col>
                                            }
                                        </Row>
                                    </div>
                                }

                            </Card>

                        </Form>
                    )) : null}

                    <Card
                        tabList={tabListNoTitle}
                        activeTabKey={noTitleKey}
                        onTabChange={(key) => { this.onTabChange(key, 'noTitleKey'); }}
                        style={{ marginTop: 25, background: '#f7f7f7', width: '100%' }}
                        className='rule-ant-card'
                    >

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