import React from 'react';
import { connect } from 'dva';
import { Button, Form, Switch, Input, message, Icon, InputNumber, Select, Modal, Card, Row, Col, Badge, Divider } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import 'styles/setting/data-authority/data-authority.scss';
import ViewRuleModal from 'containers/setting/data-authority/view-rule-modal';
import LineAddTransferModal from 'containers/setting/data-authority/line-add-transfer-modal';
import ListSelector from 'components/Widget/list-selector';
import DataAuthorityService from 'containers/setting/data-authority/data-authority.service';
import config from 'config';

class LineModelChangeRulesSystem extends React.Component {
    constructor() {
        super();
        this.itemKey = 0;
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
            ruleDatail: [],
            saveParams:[],
            saveRuleName:'',
            itemKey: 0,
            dataScope: {
                1001: { label: '全部' },
                1002: { label: '当前' },
                1003: { label: '当前及下属' },
                1004: { label: '手工选择' },
            },
            rulesParams:'',
            saveLoading:false
        }
    }
    componentWillMount() {
        let params = this.props.params;
        if (params && JSON.stringify(params) !== '{}') {
            this.setState({
                ruleName:params.name,
                ruleDatail:params.ruleDatail
            })
        }
        this.setState({
            targeKey: this.props.targeKey
        });
        if (this.props.isEditRule) {
            this.setState({ show: false })
        } else {
            this.setState({ show: true })
        }
        // DataAuthorityService.getDataAuthorityType().then(res=>{
        //     console.log(res)
        // })
        // DataAuthorityService.getDataAuthorityRange().then(res=>{
        //     console.log(res)
        // })
        // DataAuthorityService.getDataAuthorityWay().then(res=>{
        //     console.log(res)
        // })
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
    saveRuleItem = (e, targeKey) => {
        e.preventDefault();
        this.setState({saveLoading:true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let tenantId = this.props.tenantId;
                let params = {
                    id:this.props.editKey?this.props.editKey:null,
                    i18n: null,
                    enabled: values.enabled,
                    tenantId: tenantId,
                    dataAuthorityCode: values.dataAuthorityCode,
                    dataAuthorityName: values.dataAuthorityName,
                    description: values.description,
                    dataAuthorityRules: [
                        {
                            i18n: null,
                            dataAuthorityRuleName: values[`dataAuthorityRuleName-${targeKey}`],
                            dataAuthorityRuleDetails: [
                                {
                                    dataType: 'SOB',
                                    dataScope: values[`dataScope1-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod1-${targeKey}`] ? values[`filtrateMethod1-${targeKey}`] : undefined,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod1-${targeKey}`] ? [
                                        {
                                            "valueKey": "1"
                                        }
                                    ] : undefined
                                },
                                {
                                    dataType: 'COMPANY',
                                    dataScope: values[`dataScope2-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod2-${targeKey}`] ? values[`filtrateMethod2-${targeKey}`] : undefined,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod2-${targeKey}`] ? [
                                        {
                                            "valueKey": "1"
                                        }
                                    ] : undefined
                                },
                                {
                                    dataType: 'UNIT',
                                    dataScope: values[`dataScope3-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod3-${targeKey}`] ? values[`filtrateMethod3-${targeKey}`] : undefined,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod3-${targeKey}`] ? [
                                        {
                                            "valueKey": "1"
                                        }
                                    ] : undefined
                                },
                                {
                                    dataType: 'EMPLOYEE',
                                    dataScope: values[`dataScope4-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod4-${targeKey}`] ? values[`filtrateMethod4-${targeKey}`] : undefined,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod4-${targeKey}`] ? [
                                        {
                                            "valueKey": "1"
                                        }
                                    ] : undefined
                                },
                            ]
                        }
                    ]
                }
                DataAuthorityService.saveDataAuthority(params).then(res => {
                    console.log(res.data);
                    if(res.status===200){
                        this.setState({
                            ruleDatail:res.data.dataAuthorityRules[0].dataAuthorityRuleDetails,
                            ruleName:res.data.dataAuthorityRules[0].dataAuthorityRuleName,
                            saveLoading:false,
                        },()=>{
                            this.setState({
                                show: false,
                                isEditDelete: true,
                            })

                        })
                    }
                }).catch(res=>{
                    this.setState({saveLoading:false})
                    message.error('同一权限下，规则名称不能重复！')
                })

            }else{
                this.setState({saveLoading:false})
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
        const { getFieldDecorator } = this.props;
        const { targeKey, show, renderSelectList, renderCompanyList, renderDepartmentList, renderEmplyeeList, dataScope,saveLoading,ruleName,
            showRuleModal, tenantVisible, tenantItem, empolyeeVisible, employeeItem, companyVisible, isEditDelete, ruleDatail } = this.state;
        const ruleFormLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 16, offset: 1 },
        }
        // const cardTitle = (
        //     <span className="rule-form-title">
        //         <Input className="input_title" placeholder='请输入规则名称' />
        //     </span>
        // )
        return (
            <div className='add-rule-form'>
                {show &&
                    <Card
                        style={{ background: '#f7f7f7', marginTop: 25 }}
                    >
                        <Row>
                            <Col span={16} className="rule-form-title">
                                <FormItem
                                    {...ruleFormLayout}
                                    label=''
                                >
                                    {getFieldDecorator(`dataAuthorityRuleName-${this.props.targeKey}`, {
                                        rules: [{
                                            required: true, message: this.$t({ id: 'common.please.enter' })
                                        }],
                                        initialValue: ruleName||'',
                                    })(
                                        <Input className="input_title" placeholder='请输入规则名称' />
                                    )}

                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <Button type='primary' loading={saveLoading} onClick={(e) => this.saveRuleItem(e, this.props.targeKey)}>{this.$t({ id: 'common.save' })} </Button>
                                <Button style={{ marginLeft: 10 }} onClick={() => this.removeRule(targeKey)}>{this.$t({ id: 'common.cancel' })}</Button>
                            </Col>
                        </Row>
                        <Divider style={{ marginTop: '-50px' }}></Divider>
                        <Row className="rule-form-item">
                            <Col span={8}>
                                <FormItem
                                    {...ruleFormLayout}
                                    label='账套'
                                >
                                    {getFieldDecorator(`dataScope1-${this.props.targeKey}`, {
                                        initialValue: ruleDatail.length?ruleDatail[0].dataScope:'1001'
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
                                        <Col span={8} style={{ marginLeft: 10 }}>
                                            <FormItem
                                                {...ruleFormLayout}
                                                label=''
                                            >
                                                {getFieldDecorator(`filtrateMethod1-${this.props.targeKey}`, { initialValue: 'INCLUDE' })(
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
                            <Col span={8}>
                                <FormItem
                                    {...ruleFormLayout}
                                    label='公司'
                                >
                                    {getFieldDecorator(`dataScope2-${this.props.targeKey}`, {
                                        initialValue:  ruleDatail.length?ruleDatail[1].dataScope:'1001'
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
                                        <Col span={8} style={{ marginLeft: 10 }}>
                                            <FormItem
                                                {...ruleFormLayout}
                                                label=''
                                            >
                                                {getFieldDecorator(`filtrateMethod2-${this.props.targeKey}`, { initialValue: 'INCLUDE' })(
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
                            <Col span={8}>
                                <FormItem
                                    {...ruleFormLayout}
                                    label='部门'
                                >
                                    {getFieldDecorator(`dataScope3-${this.props.targeKey}`, {
                                        initialValue:  ruleDatail.length?ruleDatail[2].dataScope:'1001'
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
                                        <Col span={8} style={{ marginLeft: 10 }}>
                                            <FormItem
                                                {...ruleFormLayout}
                                                label=''
                                            >
                                                {getFieldDecorator(`filtrateMethod3-${this.props.targeKey}`, { initialValue: 'INCLUDE' })(
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
                                    {getFieldDecorator(`dataScope4-${this.props.targeKey}`, {
                                        initialValue:  ruleDatail.length?ruleDatail[3].dataScope:'1001'
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
                                        <Col span={8} style={{ marginLeft: 10 }}>
                                            <FormItem
                                                {...ruleFormLayout}
                                                label=''
                                            >
                                                {getFieldDecorator(`filtrateMethod4-${this.props.targeKey}`, { initialValue: 'INCLUDE' })(
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
                    </Card>
                }
                {!show &&
                    <Card title={ruleName||''} style={{ marginTop: 25, background: '#f7f7f7' }}
                        extra={<span>
                            <a onClick={this.handleViewRule}>查看</a>
                            <a style={{ paddingLeft: 15 }} onClick={this.editRuleItem}>编辑</a>
                            <a style={{ paddingLeft: 15 }} onClick={() => this.removeEditRule(targeKey, isEditDelete)}>删除</a>
                        </span>}>
                        <Row>
                            <Col span={24}>
                                <span>账套：</span>
                                <span>{dataScope[ruleDatail[0].dataScope].label}</span>
                            </Col>
                            <Col span={24}>
                                <span>公司：</span>
                                <span>{dataScope[ruleDatail[1].dataScope].label}</span>
                            </Col>
                            <Col span={24}>
                                <span>部门：</span>
                                <span>{dataScope[ruleDatail[2].dataScope].label}</span>
                            </Col>
                            <Col span={24}>
                                <span>员工：</span>
                                <span>{dataScope[ruleDatail[3].dataScope].label}</span>
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

export default LineModelChangeRulesSystem