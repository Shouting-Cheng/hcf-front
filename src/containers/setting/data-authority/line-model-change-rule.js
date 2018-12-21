import React from 'react';
import { connect } from 'dva';
import { Button, Form, Switch, Input, message, Icon, InputNumber, Select, Modal, Card, Row, Col, Badge, Divider, Popconfirm, Spin } from 'antd';
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
            renderSobList: false,
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
            saveParams: [],
            saveRuleName: '',
            itemKey: 0,
            dataType: {
                'SOB': { label: '账套' },
                'COMPANY': { label: '公司' },
                'UNIT': { label: '部门' },
                'EMPLOYEE': { label: '员工' },
            },
            dataScopeDesc: {
                '1001': { label: '全部' },
                '1002': { label: '当前' },
                '1003': { label: '当前及下属' },
                '1004': { label: '手动选择' }
            },
            filtrateMethodDesc: {
                'INCLUDE': { label: '包含' },
                'EXCLUDE': { label: '排除' },
            },

            rulesParams: '',
            saveLoading: false,
            ruleId: '',
            deleted: undefined,
            versionNumber: undefined,
            createdBy: undefined,
            createdDate: undefined,
            lastUpdatedBy: undefined,
            lastUpdatedDate: undefined,
            getRulesArr: {},
            departMentVisible: false,
            sobValuesKeys: [],
            employeeKeys: [],
            companyItemsKeys: [],
            departMentItemsKeys: [],
            sobText: '添加账套',
            sobIcon: 'plus',
            companyText: '添加公司',
            departmentText: '添加部门',
            employeeText: '添加员工',
            companyIcon: 'plus',
            departmentIcon: 'plus',
            emplyeeIcon: 'plus',
            selectedTenantList: [],
            selectedEmployeeList: [],
            selectedTreeInfo: [],
            selectedCompanyTreeInfo:[],
            selectedDepTreeInfo:[]
        }
    }
    componentWillMount() {
        let params = this.props.params;
        if (params && JSON.stringify(params) !== '{}') {
            this.setState({
                ruleName: params.name,
                ruleDatail: params.ruleDatail,
                ruleId: params.ruleId,
                deleted: params.deleted,
                versionNumber: params.versionNumber,
                createdBy: params.createdBy,
                createdDate: params.createdDate,
                lastUpdatedBy: params.lastUpdatedBy,
                lastUpdatedDate: params.lastUpdatedDate,
                getRulesArr: params.getRulesArr
            })
        } else {
            this.setState({
                ruleId: this.props.newEditId ? this.props.newEditId : this.props.hasId,
                deleted: this.props.newDataPrams.deleted,
                versionNumber: this.props.newDataPrams.versionNumber,
                createdBy: this.props.newDataPrams.createdBy,
                createdDate: this.props.newDataPrams.createdDate,
                lastUpdatedBy: this.props.newDataPrams.lastUpdatedBy,
                lastUpdatedDate: this.props.newDataPrams.lastUpdatedDate,
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

    }

    /**删除的规则,如果是这条数据正在编辑取消，则回到原来没编辑的状态 */
    removeRule = (targeKey) => {
        let { isEditDelete } = this.state;
        if (isEditDelete) {
            this.setState({
                show: false,
                renderSobList: false,
                renderCompanyList: false,
                renderDepartmentList: false,
                renderEmplyeeList: false,
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
        this.setState({ saveLoading: true });
        let testRules = ['dataAuthorityCode', 'dataAuthorityName', 'enabled', 'description', `dataAuthorityRuleName-${targeKey}`, `dataScope1-${this.props.targeKey}`, `filtrateMethod1-${this.props.targeKey}`,
            `dataScope2-${this.props.targeKey}`, `filtrateMethod2-${this.props.targeKey}`, `dataScope3-${this.props.targeKey}`, `filtrateMethod3-${this.props.targeKey}`,
            `dataScope4-${this.props.targeKey}`, `filtrateMethod4-${this.props.targeKey}`
        ];
        let { ruleId, deleted, versionNumber, createdBy, createdDate, lastUpdatedBy, lastUpdatedDate, getRulesArr,
            dataScopeDesc, sobValuesKeys, employeeKeys, filtrateMethodDesc, companyItemsKeys, departMentItemsKeys } = this.state;
        this.props.form.validateFields(testRules, (err, values) => {
            if (!err) {
                let tenantId = this.props.tenantId;
                let params = {
                    id: ruleId ? ruleId : null,
                    i18n: null,
                    enabled: values.enabled,
                    tenantId: tenantId,
                    dataAuthorityCode: values.dataAuthorityCode,
                    dataAuthorityName: this.props.newDataPrams ? this.props.newDataPrams.dataAuthorityName : values.dataAuthorityName,
                    description: this.props.newDataPrams ? this.props.newDataPrams.description : values.description,
                    deleted: deleted,
                    versionNumber: versionNumber,
                    createdBy: createdBy,
                    createdDate: createdDate,
                    lastUpdatedBy: lastUpdatedBy,
                    lastUpdatedDate: lastUpdatedDate,
                    dataAuthorityRules: [
                        {
                            i18n: null,
                            dataAuthorityRuleName: values[`dataAuthorityRuleName-${targeKey}`],
                            dataAuthorityRuleDetails: [
                                {
                                    dataType: 'SOB',
                                    dataScopeDesc: dataScopeDesc[values[`dataScope1-${targeKey}`]].label,
                                    dataScope: values[`dataScope1-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod1-${targeKey}`] ? values[`filtrateMethod1-${targeKey}`] : null,
                                    filtrateMethodDesc: values[`filtrateMethod1-${targeKey}`] ? filtrateMethodDesc[values[`filtrateMethod1-${targeKey}`]].label : null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod1-${targeKey}`] ? sobValuesKeys : [],
                                    id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[0].id : null,
                                    deleted: getRulesArr.deleted,
                                    versionNumber: getRulesArr.versionNumber,
                                    createdBy: getRulesArr.createdBy,
                                    createdDate: getRulesArr.createdDate,
                                    lastUpdatedBy: getRulesArr.lastUpdatedBy,
                                    lastUpdatedDate: getRulesArr.lastUpdatedDate,
                                    dataAuthorityId: ruleId ? ruleId : null,
                                    dataAuthorityRuleId: getRulesArr.id
                                },
                                {
                                    dataType: 'COMPANY',
                                    dataScopeDesc: dataScopeDesc[values[`dataScope2-${targeKey}`]].label,
                                    dataScope: values[`dataScope2-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod2-${targeKey}`] ? values[`filtrateMethod2-${targeKey}`] : null,
                                    filtrateMethodDesc: values[`filtrateMethod2-${targeKey}`] ? filtrateMethodDesc[values[`filtrateMethod2-${targeKey}`]].label : null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod2-${targeKey}`] ? companyItemsKeys : [],
                                    id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[1].id : null,
                                    deleted: getRulesArr.deleted,
                                    versionNumber: getRulesArr.versionNumber,
                                    createdBy: getRulesArr.createdBy,
                                    createdDate: getRulesArr.createdDate,
                                    lastUpdatedBy: getRulesArr.lastUpdatedBy,
                                    lastUpdatedDate: getRulesArr.lastUpdatedDate,
                                    dataAuthorityId: ruleId ? ruleId : null,
                                    dataAuthorityRuleId: getRulesArr.id
                                },
                                {
                                    dataType: 'UNIT',
                                    dataScopeDesc: dataScopeDesc[values[`dataScope3-${targeKey}`]].label,
                                    dataScope: values[`dataScope3-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod3-${targeKey}`] ? values[`filtrateMethod3-${targeKey}`] : null,
                                    filtrateMethodDesc: values[`filtrateMethod3-${targeKey}`] ? filtrateMethodDesc[values[`filtrateMethod3-${targeKey}`]].label : null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod3-${targeKey}`] ? departMentItemsKeys : [],
                                    id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[2].id : null,
                                    deleted: getRulesArr.deleted,
                                    versionNumber: getRulesArr.versionNumber,
                                    createdBy: getRulesArr.createdBy,
                                    createdDate: getRulesArr.createdDate,
                                    lastUpdatedBy: getRulesArr.lastUpdatedBy,
                                    lastUpdatedDate: getRulesArr.lastUpdatedDate,
                                    dataAuthorityId: ruleId ? ruleId : null,
                                    dataAuthorityRuleId: getRulesArr.id
                                },
                                {
                                    dataType: 'EMPLOYEE',
                                    dataScopeDesc: dataScopeDesc[values[`dataScope4-${targeKey}`]].label,
                                    dataScope: values[`dataScope4-${targeKey}`],
                                    filtrateMethod: values[`filtrateMethod4-${targeKey}`] ? values[`filtrateMethod4-${targeKey}`] : null,
                                    filtrateMethodDesc: values[`filtrateMethod4-${targeKey}`] ? filtrateMethodDesc[values[`filtrateMethod4-${targeKey}`]].label : null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod4-${targeKey}`] ? employeeKeys : [],
                                    id: getRulesArr.dataAuthorityRuleDetails ? getRulesArr.dataAuthorityRuleDetails[3].id : null,
                                    deleted: getRulesArr.deleted,
                                    versionNumber: getRulesArr.versionNumber,
                                    createdBy: getRulesArr.createdBy,
                                    createdDate: getRulesArr.createdDate,
                                    lastUpdatedBy: getRulesArr.lastUpdatedBy,
                                    lastUpdatedDate: getRulesArr.lastUpdatedDate,
                                    dataAuthorityId: ruleId ? ruleId : null,
                                    dataAuthorityRuleId: getRulesArr.id
                                },
                            ],
                            id: getRulesArr.id,
                            deleted: getRulesArr.deleted,
                            versionNumber: getRulesArr.versionNumber,
                            createdBy: getRulesArr.createdBy,
                            createdDate: getRulesArr.createdDate,
                            lastUpdatedBy: getRulesArr.lastUpdatedBy,
                            lastUpdatedDate: getRulesArr.lastUpdatedDate,
                            dataAuthorityId: ruleId ? ruleId : null

                        }
                    ]
                }
                DataAuthorityService.saveDataAuthority(params).then(res => {
                    if (res.status === 200) {
                        this.setState({
                            ruleDatail: res.data.dataAuthorityRules[0].dataAuthorityRuleDetails,
                            ruleName: res.data.dataAuthorityRules[0].dataAuthorityRuleName,
                            getRulesArr: res.data.dataAuthorityRules[0],
                            saveLoading: false,
                            ruleId: res.data.id,
                            deleted: res.data.deleted,
                            versionNumber: res.data.versionNumber,
                            createdBy: res.data.createdBy,
                            createdDate: res.data.createdDate,
                            lastUpdatedBy: res.data.lastUpdatedBy,
                            lastUpdatedDate: res.data.lastUpdatedDate,
                        }, () => {
                            this.setState({
                                show: false
                            })
                        })
                    }
                    /**单个规则保存成功后返回dataAuthorityRules */
                    this.props.hadleHasSaveRules(res.data.dataAuthorityRules);

                })
                    .catch(e => {
                        this.setState({ saveLoading: false })
                        message.error(e.response.data.message)
                    })

            } else {
                this.setState({ saveLoading: false })
            }
        })
    }
    /**编辑单条规则 */
    editRuleItem = () => {
        let { ruleDatail } = this.state;
        console.log(ruleDatail)
        if (ruleDatail[0].dataScope === '1004') {
            let detaileValues0=ruleDatail[0].dataAuthorityRuleDetailValues;
            let ruleDetailValueDTOs0=ruleDatail[0].dataAuthorityRuleDetailValueDTOs;
            this.setState({
                renderSobList: true,
                sobText: `已选择${detaileValues0.length}个账套`,
                sobIcon: null,
                selectedTenantList: ruleDetailValueDTOs0,
                sobValuesKeys:detaileValues0
            })
        }
        if (ruleDatail[1].dataScope === '1004') {
            let detaileValues1=ruleDatail[1].dataAuthorityRuleDetailValues;
            let ruleDetailValueDTOs1=ruleDatail[1].dataAuthorityRuleDetailValueDTOs;
            this.setState({
                renderCompanyList: true,
                companyText: `已选择${detaileValues1.length}个公司`,
                companyIcon: null,
                selectedCompanyTreeInfo: ruleDetailValueDTOs1,
                companyItemsKeys:detaileValues1
            })
        }
        if (ruleDatail[2].dataScope === '1004') {
            let detaileValues2=ruleDatail[2].dataAuthorityRuleDetailValues;
            let ruleDetailValueDTOs2=ruleDatail[2].dataAuthorityRuleDetailValueDTOs;
            this.setState({
                renderDepartmentList: true,
                departmentText: `已选择${detaileValues2.length}个部门`,
                departmentIcon: null,
                selectedDepTreeInfo: ruleDetailValueDTOs2,
                departMentItemsKeys:detaileValues2

            })
        }
        if (ruleDatail[3].dataScope === '1004') {
            let detaileValues3=ruleDatail[3].dataAuthorityRuleDetailValues;
            let ruleDetailValueDTOs3=ruleDatail[3].dataAuthorityRuleDetailValueDTOs;
            this.setState({
                renderEmplyeeList: true,
                employeeText: `已选择${detaileValues3.length}个员工`,
                emplyeeIcon: null,
                selectedEmployeeList:ruleDetailValueDTOs3,
                employeeKeys:detaileValues3
            })
        }
        this.setState({
            show: true,
            isEditDelete: true
        }, () => {
            /**保存完成后再编辑 */
            this.props.hasSaveEdit(this.state.getRulesArr)
        })

    }
    /**选中手动选择 */
    handleChangeRuleChange = (value) => {
        if (value === '1004') {
            this.setState({
                renderSobList: true
            })
        } else {
            this.setState({
                renderSobList: false,
                selectedTenantList: [],
                sobText: '添加账套',
                sobIcon: 'plus',
            })
        }
    }
    handleChangeCompany = (value) => {
        if (value === '1004') {
            this.setState({
                renderCompanyList: true,
            })
        } else {
            this.setState({
                renderCompanyList: false,
                selectedCompanyTreeInfo: [],
                companyText: '添加公司',
                companyIcon: 'plus',
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
                renderDepartmentList: false,
                selectedDepTreeInfo: [],
                departmentText: '添加部门',
                departmentIcon: 'plus',
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
                renderEmplyeeList: false,
                selectedEmployeeList: [],
                employeeText: '添加员工',
                emplyeeIcon: 'plus',
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
        this.hasRefreshRules()
    }
    //添加账套
    addTenant = () => {
        const ruleId = this.props.params ? this.props.params.getRulesArr.id : '';
        const tenantItem = {
            title: '添加账套',
            url: `${config.authUrl}/api/data/authority/rule/detail/values/select?ruleId=${ruleId}&dataType=SOB`,
            searchForm: [
                { type: 'input', id: 'code', label: '账套代码', colSpan: 6 },
                { type: 'input', id: 'name', label: '账套名称', colSpan: 6 },
                {
                    type: 'select', id: 'scope', label: '查看', defaultValue: 'all', options: [
                        { value: 'all', label: '全部' },
                        { value: 'selected', label: '已选' },
                        { value: 'noChoose', label: '未选' },
                    ], colSpan: 6
                }
            ],
            columns: [
                { title: "账套代码", dataIndex: 'valueKeyCode', width: 150 },
                { title: "账套名称", dataIndex: 'valueKeyDesc' },

            ],
            key: 'valueKey'
        }
        this.setState({
            tenantVisible: true,
            tenantItem
        })
    }
    handleTenantListOk = (result) => {
        console.log(result)
        let resultArr = result.result;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            arr.push(resultArr[i].valueKey);
        }
        this.props.handleTenantListOk(arr)
        this.setState({
            tenantVisible: false,
            sobValuesKeys: arr,
            sobText: `已选择${resultArr.length}个账套`,
            sobIcon: null,
            selectedTenantList: result.result
        })
    }
    cancelTenantList = (flag) => {
        this.setState({
            tenantVisible: flag
        })
    }
    //添加员工
    addEmployee = () => {
        const ruleId = this.props.params ? this.props.params.getRulesArr.id : ''
        const employeeItem = {
            title: '添加员工',
            url: `${config.authUrl}/api/data/authority/rule/detail/values/select?ruleId=${ruleId}&dataType=EMPLOYEE`,
            searchForm: [
                { type: 'input', id: 'code', label: '员工代码', colSpan: 6 },
                { type: 'input', id: 'name', label: '员工名称', colSpan: 6 },
                {
                    type: 'select', id: 'scope', label: '查看', defaultValue: 'all', options: [
                        { value: 'all', label: '全部' },
                        { value: 'selected', label: '已选' },
                        { value: 'noChoose', label: '未选' },
                    ], colSpan: 6
                }
            ],
            columns: [
                { title: "员工代码", dataIndex: 'valueKeyCode', width: 150 },
                { title: "员工名称", dataIndex: 'valueKeyDesc' },
            ],
            key: 'valueKey'
        }
        this.setState({
            empolyeeVisible: true,
            employeeItem
        })
    }
    handleEmployeeListOk = (result) => {
        console.log(result)
        let resultArr = result.result;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            arr.push(resultArr[i].valueKey);
        }
        this.props.handleEmployeeListOk(arr)
        this.setState({
            empolyeeVisible: false,
            employeeKeys: arr,
            employeeText: `已选择${resultArr.length}个员工`,
            emplyeeIcon: null,
            selectedEmployeeList: result.result
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
            companyVisible: false,
            // selectedTreeInfo:[]
        })
    }
    //添加部门
    addDepartment = () => {
        this.setState({
            departMentVisible: true,
        })
    }
    cancelDepartMentList = () => {
        this.setState({
            departMentVisible: false,
            // selectedTreeInfo:[]
        })
    }
    //获取公司，部门选择的值
    transferCompanyList = (items) => {
        let resultArr = items;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            arr.push(resultArr[i].id);
        }
        this.props.handleCompanyListOk(arr)
        this.setState({
            companyItemsKeys: arr,
            companyVisible: false,
            companyText: `已选择${resultArr.length}个公司`,
            companyIcon: null,
            selectedCompanyTreeInfo: items
        })

    }
    transDePferList = (items) => {
        let resultArr = items;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            arr.push(resultArr[i].id);
        }
        this.props.handleDePListOk(arr)
        this.setState({
            departMentItemsKeys: arr,
            departMentVisible: false,
            departmentText: `已选择${resultArr.length}个部门`,
            departmentIcon: null,
            selectedDepTreeInfo: items
        })

    }
    /**详情编辑完成后返回侧滑框，页面刷新 */
    backRuleModal = () => {
        this.hasRefreshRules()
    }
    hasRefreshRules = () => {
        let { getRulesArr, ruleId } = this.state;
        DataAuthorityService.getSingleDataAuthorityDetail(ruleId, getRulesArr.id).then(res => {
            if (res.status === 200) {
                this.setState({
                    ruleDatail: res.data.dataAuthorityRules[0].dataAuthorityRuleDetails,
                    ruleName: res.data.dataAuthorityRules[0].dataAuthorityRuleName,
                    getRulesArr: res.data.dataAuthorityRules[0],
                    saveLoading: false,
                    ruleId: res.data.id,
                    deleted: res.data.deleted,
                    versionNumber: res.data.versionNumber,
                    createdBy: res.data.createdBy,
                    createdDate: res.data.createdDate,
                    lastUpdatedBy: res.data.lastUpdatedBy,
                    lastUpdatedDate: res.data.lastUpdatedDate,
                }, () => {
                    this.setState({
                        showRuleModal: false,
                    })
                })
            }

        })
    }
    render() {
        const { getFieldDecorator } = this.props;
        const { targeKey, show, renderSobList, renderCompanyList, renderDepartmentList, renderEmplyeeList, dataType, saveLoading, ruleName, departMentVisible, companyText, companyIcon, departmentIcon, emplyeeIcon, selectedTreeInfo,selectedCompanyTreeInfo,selectedDepTreeInfo,
            showRuleModal, tenantVisible, tenantItem, empolyeeVisible, employeeItem, companyVisible, isEditDelete, ruleDatail, getRulesArr, sobText, sobIcon, departmentText, employeeText, selectedTenantList, selectedEmployeeList } = this.state;
        const ruleFormLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 16, offset: 1 },
        }
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
                                    className='rule-item-name'
                                >
                                    {getFieldDecorator(`dataAuthorityRuleName-${this.props.targeKey}`, {
                                        rules: [{
                                            required: true, message: this.$t({ id: 'common.please.enter' })
                                        }],
                                        initialValue: ruleName || '',
                                    })(
                                        <Input className="input_title" placeholder='请输入规则名称' />
                                    )}

                                </FormItem>
                            </Col>
                            <Col span={8} style={{paddingLeft:60}}>
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
                                        rules: [],
                                        initialValue: ruleDatail.length ? ruleDatail[0].dataScope : '1001'
                                    })(
                                        <Select placeholder={this.$t({ id: "common.please.enter" })} onSelect={this.handleChangeRuleChange}>
                                            <Option value='1001'>全部</Option>
                                            <Option value='1002'>当前</Option>
                                            <Option value='1004'>手动选择</Option>
                                        </Select>
                                    )}

                                </FormItem>
                            </Col>
                            {renderSobList &&
                                <Col span={16} >
                                    <Row>
                                        <Col span={8} style={{ marginLeft: 10 }}>
                                            <FormItem
                                                {...ruleFormLayout}
                                                label=''
                                            >
                                                {getFieldDecorator(`filtrateMethod1-${this.props.targeKey}`, {
                                                    rules: [],
                                                    initialValue: (ruleDatail.length && ruleDatail[0].filtrateMethod) ? ruleDatail[0].filtrateMethod : 'INCLUDE'
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
                                                    <Button icon={sobIcon} onClick={this.addTenant}>{sobText}</Button>
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
                                        rules: [],
                                        initialValue: ruleDatail.length ? ruleDatail[1].dataScope : '1001'
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
                                                {getFieldDecorator(`filtrateMethod2-${this.props.targeKey}`, {
                                                    rules: [],
                                                    initialValue: (ruleDatail.length && ruleDatail[1].filtrateMethod) ? ruleDatail[1].filtrateMethod : 'INCLUDE'
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
                                                    <Button icon={companyIcon} onClick={this.addCompany}>{companyText}</Button>
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
                                        rules: [],
                                        initialValue: ruleDatail.length ? ruleDatail[2].dataScope : '1001'
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
                                                {getFieldDecorator(`filtrateMethod3-${this.props.targeKey}`, {
                                                    rules: [],
                                                    initialValue: (ruleDatail.length && ruleDatail[2].filtrateMethod) ? ruleDatail[2].filtrateMethod : 'INCLUDE'
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
                                                {getFieldDecorator('addDepartment')(
                                                    <Button icon={departmentIcon} onClick={this.addDepartment}>{departmentText}</Button>
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
                                        rules: [],
                                        initialValue: ruleDatail.length ? ruleDatail[3].dataScope : '1001'
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
                                                {getFieldDecorator(`filtrateMethod4-${this.props.targeKey}`, {
                                                    rules: [],
                                                    initialValue: (ruleDatail.length && ruleDatail[3].filtrateMethod) ? ruleDatail[3].filtrateMethod : 'INCLUDE'
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
                                                    <Button icon={emplyeeIcon} onClick={this.addEmployee}>{employeeText}</Button>
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

                    <Card title={ruleName || ''} style={{ marginTop: 25, background: '#f7f7f7' }}
                        extra={<span>
                            <a onClick={this.handleViewRule}>详情</a>
                            <a style={{ paddingLeft: 15 }} onClick={this.editRuleItem}>编辑</a>
                            <Popconfirm placement="top" title={'确认删除？'}
                                onConfirm={e => {
                                    e.preventDefault();
                                    this.removeEditRule(targeKey, isEditDelete);
                                }}
                                okText="确定"
                                cancelText="取消"
                            >
                                <a style={{ paddingLeft: 15 }} onClick={e => { e.preventDefault(); e.stopPropagation(); }}>删除</a>
                            </Popconfirm>
                            {/* <a style={{ paddingLeft: 15 }} onClick={() => this.removeEditRule(targeKey, isEditDelete)}>删除</a> */}
                        </span>}>
                        <Row>
                            {ruleDatail.map(item => (
                                <Col span={24}>
                                    <span>{dataType[item.dataType].label}:</span>
                                    {item.dataScope === '1004' ?
                                        <span>
                                            {item.filtrateMethodDesc}{`${item.dataAuthorityRuleDetailValues.length}个`}{dataType[item.dataType].label}
                                        </span> : <span>
                                            {item.dataScopeDesc}{dataType[item.dataType].label}
                                        </span>
                                    }
                                </Col>
                            ))}

                        </Row>
                    </Card>}
                <ViewRuleModal
                    visibel={showRuleModal}
                    closeRuleModal={this.closeRuleModal}
                    targetId={getRulesArr.id}
                    dataId={this.state.ruleId}
                    backRuleModal={this.backRuleModal}
                />
                <ListSelector
                    visible={tenantVisible}
                    selectorItem={tenantItem}
                    onOk={this.handleTenantListOk}
                    onCancel={() => this.cancelTenantList(false)}
                    showSelectTotal={true}
                    selectedData={selectedTenantList}
                />
                <ListSelector
                    visible={empolyeeVisible}
                    selectorItem={employeeItem}
                    onOk={this.handleEmployeeListOk}
                    onCancel={() => this.cancelEmployeeList(false)}
                    showSelectTotal={true}
                    selectedData={selectedEmployeeList}
                />
                <LineAddTransferModal
                    visible={companyVisible}
                    title='添加公司'
                    onCloseTransferModal={this.cancelCompanyList}
                    isAddCompany={true}
                    transferList={this.transferCompanyList}
                    selectedTreeInfo={selectedCompanyTreeInfo}
                />
                <LineAddTransferModal
                    visible={departMentVisible}
                    title='添加部门'
                    onCloseTransferModal={this.cancelDepartMentList}
                    isAddCompany={false}
                    transferList={this.transDePferList}
                    selectedTreeInfo={selectedDepTreeInfo}
                />

            </div>

        )
    }
}

export default LineModelChangeRulesSystem