import React from 'react';
import { connect } from 'dva';
import { Button, Form, Switch, Input, message, Icon, InputNumber, Select, Modal, Card, Row, Col, Badge, Divider } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import 'styles/setting/data-authority/data-authority.scss';
import ViewRuleModal from 'containers/setting/data-authority/view-rule-modal';
import LineAddTransferModal from 'containers/setting/data-authority/line-add-transfer-modal';
import ListSelector from 'components/Widget/list-selector';
import config from 'config';

class LineModelChangeRulesSystem extends React.Component {
    constructor() {
        super();
        this.state = {
            targeKey: '',
            show: true,
            renderSelectList: false,
            renderCompanyList: false,
            renderDepartmentList: false,
            renderEmplyeeList: false,
            showRuleModal: false,
            tenantVisible: false,
            tenantItem: {},
            empolyeeVisible: false,
            employeeItem: {},
            companyVisible: false,
            isEditDelete: false,
        }
    }
    componentWillMount() {
        console.log()
        this.setState({
            targeKey: this.props.targeKey
        });
        if (this.props.isEditRule) {
            this.setState({ show: false })
        } else {
            this.setState({ show: true })
        }
    }
     /**删除的规则,如果是这条数据正在编辑取消，则回到原来没编辑的状态 */
    removeRule = (targeKey) => {
        let { isEditDelete } = this.state;
        if (isEditDelete) {
            this.setState({
                show: false
            })
        } else {
            this.props.cancelHandle(targeKey)
        }

    }
   
    removeEditRule = (targeKey) => {
        this.props.canceEditHandle(targeKey)
    }
    /**保存单条规则 */
    saveRuleItem = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values);
                this.setState({
                    show: false,
                    isEditDelete: true

                })
            }
        })
    }
    /**编辑单条规则 */
    editRuleItem = () => {
        this.setState({
            show: true,
            isEditDelete: true
        })
    }
    /**选中手动选择 */
    handleChangeRuleChange = (value) => {
        if (value === 'handleSelect') {
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
        if (value === 'handleSelect') {
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
        if (value === 'handleSelect') {
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
        if (value === 'handleSelect') {
            this.setState({
                renderEmplyeeList: true
            })
        } else {
            this.setState({
                renderEmplyeeList: false
            })
        }
    }
    /**查看数据权限详情 */
    handleViewRule = () => {
        this.setState({
            showRuleModal: true
        })
    }
    closeRuleModal = () => {
        this.setState({
            showRuleModal: false
        })
    }
    //添加账套
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
        this.setState({
            tenantVisible: false
        })
    }
    cancelTenantList = (flag) => {
        this.setState({
            tenantVisible: flag
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
    //添加公司
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
    render() {
        const { getFieldDecorator } = this.props.form;
        const { targeKey, show, renderSelectList, renderCompanyList, renderDepartmentList, renderEmplyeeList,
            showRuleModal, tenantVisible, tenantItem, empolyeeVisible, employeeItem, companyVisible, isEditDelete, isEditBtn } = this.state;
        const ruleFormLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 16, offset: 1 },
        }
        const cardTitle = (
            <span className="rule-form-item">
                <FormItem
                    {...ruleFormLayout}
                    label=' '
                >
                    {getFieldDecorator('ruleName', {
                        rules: [{
                            required: true,
                            message: this.$t({ id: 'common.please.enter' }),
                        }],
                    })(
                        <Input placeholder="请输入规则名称" />
                    )}

                </FormItem>
            </span>
        )
        return (
            <div className='add-rule-form'>
                {show &&
                    <Form onSubmit={this.saveRuleItem}>
                        <Card
                            title={cardTitle}
                            style={{ background: '#f7f7f7', marginTop: 25 }}
                            extra={<span><Button type='primary' htmlType="submit">{this.$t({ id: 'common.save' })} </Button>
                                <Button style={{ marginLeft: 10 }} onClick={() => this.removeRule(targeKey)}>{this.$t({ id: 'common.cancel' })}</Button>
                            </span>
                            }
                        >
                            <Row className="rule-form-item">
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='账套'
                                    >
                                        {getFieldDecorator('tenantId', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeRuleChange}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderSelectList &&
                                    <Col span={16} >
                                        <Row>
                                            <Col span={8} style={{ marginLeft: 10 }}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label=''
                                                >
                                                    {getFieldDecorator('range', { initialValue: 'include' })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                            <Option value='include'>包含</Option>
                                                            <Option value='exclude'>排除</Option>
                                                        </Select>
                                                    )}

                                                </FormItem>
                                            </Col>
                                            <Col span={6} style={{marginLeft:'-25px'}}>
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
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='公司'
                                    >
                                        {getFieldDecorator('company', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeCompany}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='currentBranch'>当前及下属</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderCompanyList &&
                                    <Col span={16} >
                                        <Row>
                                            <Col span={8} style={{ marginLeft: 10 }}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label=''
                                                >
                                                    {getFieldDecorator('range', { initialValue: 'include' })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                            <Option value='include'>包含</Option>
                                                            <Option value='exclude'>排除</Option>
                                                        </Select>
                                                    )}

                                                </FormItem>
                                            </Col>
                                            <Col span={6} style={{marginLeft:'-25px'}}>
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
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='部门'
                                    >
                                        {getFieldDecorator('department', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeDepartment}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='currentBranch'>当前及下属</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderDepartmentList &&
                                    <Col span={16} >
                                        <Row>
                                            <Col span={8} style={{ marginLeft: 10 }}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label=''
                                                >
                                                    {getFieldDecorator('range', { initialValue: 'include' })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                            <Option value='include'>包含</Option>
                                                            <Option value='exclude'>排除</Option>
                                                        </Select>
                                                    )}

                                                </FormItem>
                                            </Col>
                                            <Col span={6} style={{marginLeft:'-25px'}}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label=''
                                                >
                                                    {getFieldDecorator('addTenant')(
                                                        <Button icon="plus">添加账套</Button>
                                                    )}

                                                </FormItem>
                                            </Col>
                                        </Row>

                                    </Col>
                                }
                            </Row>
                            <Row className="rule-form-item">
                                <Col span={8}>
                                    <FormItem
                                        {...ruleFormLayout}
                                        label='员工'
                                    >
                                        {getFieldDecorator('employee', { initialValue: 'all' })(
                                            <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleEmplyee}>
                                                <Option value='all'>全部</Option>
                                                <Option value='current'>当前</Option>
                                                <Option value='currentBranch'>当前及下属</Option>
                                                <Option value='handleSelect'>手动选择</Option>
                                            </Select>
                                        )}

                                    </FormItem>
                                </Col>
                                {renderEmplyeeList &&
                                    <Col span={16} >
                                        <Row>
                                            <Col span={8} style={{ marginLeft: 10 }}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label=''
                                                >
                                                    {getFieldDecorator('range', { initialValue: 'include' })(
                                                        <Select placeholder={this.$t({ id: "common.please.enter" })} >
                                                            <Option value='include'>包含</Option>
                                                            <Option value='exclude'>排除</Option>
                                                        </Select>
                                                    )}

                                                </FormItem>
                                            </Col>
                                            <Col span={6} style={{marginLeft:'-25px'}}>
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
                        </Card>
                    </Form>}
                {!show &&
                    <Card title='数据权限组1' style={{ marginTop: 25, background: '#f7f7f7' }}
                        extra={<span>
                            <a onClick={this.handleViewRule}>查看</a>
                            <a style={{ paddingLeft: 15 }} onClick={this.editRuleItem}>编辑</a>
                            <a style={{ paddingLeft: 15 }} onClick={() => this.removeEditRule(targeKey, isEditDelete)}>删除</a>
                        </span>}>
                        <Row>
                            <Col span={24}>
                                <span>账套：</span>
                                <span>全部账套</span>
                            </Col>
                            <Col span={24}>
                                <span>公司：</span>
                                <span>当前公司</span>
                            </Col>
                            <Col span={24}>
                                <span>部门：</span>
                                <span>当前及下属部门</span>
                            </Col>
                            <Col span={24}>
                                <span>员工：</span>
                                <span>排除5个员工</span>
                            </Col>
                        </Row>
                    </Card>}
                <ViewRuleModal
                    visibel={showRuleModal}
                    closeRuleModal={this.closeRuleModal}
                />
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

        )
    }
}

const WrappedLineModelChangeRules = Form.create()(LineModelChangeRulesSystem);
function mapStateToProps() {
    return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedLineModelChangeRules);