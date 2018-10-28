import React, { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, List, Form, Input, Button, Table, Select, Switch, message, Radio } from 'antd'
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
import budgetBalanceSolutionService from 'containers/budget-setting/budget-balance-solution/budget-balance-solution.service'
import ListSelector from 'components/list-selector'
import baseService from 'share/base.service'
import menuRoute from 'routes/menuRoute'
import PermissionsAllocation from 'components/template/permissions-allocation'
import { messages } from 'share/common'
class NewBudgetBalanceSolution extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //账套id
            setOfBooksId: this.props.params.setOfBooksId,
            //参数类型值列表
            parameterTypeList: [],
            //预算相关，参数值列表
            budgetRefParameterList: [],
            //组织架构相关，参数值列表
            orgRefParameterList: [],
            //维度相关，参数值列表
            dimensionRefParameterList: [],
            //参数值列表
            queryScopeList: [{ code: '1001', messageKey: messages('common.all') }, { code: '1002', messageKey: messages('budget.balance.select') }],
            //弹窗返回值
            solutionParameterList: [],
            //是否显示弹框
            listSelectorVisible: false,
            //显示弹窗类型
            listSelectorType: '',
            //显示弹框需要的参数
            listSelectorExtraParams: {},
            //弹框已选择的数据集合
            listSelectorSelectedData: [],
            //当前预算组织id
            organizationId: '',
            //当前行的key（index）
            recordKey: '',
            //控制versionNumber
            versionNumber: '',
            columns: [
                {
                    title: messages('budget.balance.params.type'), dataIndex: 'parameterType', width: '25%',
                    render: (text, record) => {
                        return (
                            <div>
                                <Select defaultValue={text} value={text} onChange={(value) => this.onParameterTypeChange(value, record)}>
                                    {
                                        this.state.parameterTypeList.map(item => {
                                            return <Option key={item.code}>{item.messageKey}</Option>
                                        })
                                    }
                                </Select>
                            </div>
                        )
                    }
                },
                {
                    title: messages('budget.balance.params'), dataIndex: 'parameterCode', width: '25%', render: (text, record) => {
                        return (
                            <div>
                                <Select defaultValue={text} value={text} onChange={(value) => this.onParameterCodeChange(value, record)} >
                                    {
                                        /**根据参数类型的值判断，参数的值列表应该使用那一个 */
                                        record.parameterType === 'BGT_RULE_PARAMETER_BUDGET' ?
                                            this.state.budgetRefParameterList.map(item => {
                                                return <Option key={item.code}>{item.messageKey}</Option>
                                            }) :
                                            (record.parameterType === 'BGT_RULE_PARAMETER_ORG' ?
                                                this.state.orgRefParameterList.map(item => {
                                                    return <Option key={item.code}>{item.messageKey}</Option>
                                                }) :
                                                (record.parameterType === 'BGT_RULE_PARAMETER_DIM' ?
                                                    this.state.dimensionRefParameterList.map(item => {
                                                        return <Option key={item.id}>{item.name}</Option>
                                                    }) : null
                                                )
                                            )
                                    }
                                </Select>
                            </div>
                        )
                    }
                },
                {
                    title: messages('budget.balance.params.value'), dataIndex: 'queryScope', width: '40%', render: (text, record) => {
                        return (
                            <div>
                                <Select defaultValue={text} value={text} onChange={(value) => this.onQueryScopeChange(value, record)} disabled={record.parameterCode ? false : true} style={{ width: '50%' }}>
                                    {record.queryScopeList.map(item => {
                                        return <Option key={item.code}>{item.messageKey}</Option>
                                    })}
                                </Select>
                                &nbsp;<span>&nbsp;</span>&nbsp;
                                <Input value={messages('budget.balance.select.data', {total : record.solutionParameterList.length})} onClick={(e) => this.onListSelectorOk(e, record)} disabled={(record.parameterCode && (record.queryScope === '1002')) ? false : true} style={{ width: '45%' }} />
                            </div>
                        )
                    }
                },
                {
                    title: messages('common.operation'), dataIndex: 'operator', render: (value, record) => {
                        return (
                            <a onClick={(e) => { this.onRecordDelete(e, record) }}>{messages('common.delete')}</a>
                        )
                    }
                }
            ],
            data: [],
            loading: false,
            //控制visibleUserScope
            visibleUserScope: 1001,
            //人员权限弹窗是否显示
            releaseIdsVisible: false,
            //人员权限弹窗类型
            releaseIdsType: '',
            //人员权限弹窗参数
            releaseIdsExtraParams: {},
            //人员权限弹窗已选择数据
            releaseIdsSelectedData: [],
            //人员权限弹窗选择数据
            releaseIdsList: [],
            //控制table的key
            count: 0,
            pagination: {
                hideOnSinglePage: true
            },
            //保存之后，方案代码不能修改
            conditionCodeDisabled: false,
            tableLoading: true
        };
    }
    /**
     * 点击删除时触发的事件
     */
    onRecordDelete = (e, record) => {
        let { data } = this.state;
        data.map((item, index) => {
            if (item.key === record.key) {
                data.splice(index, 1);
            }
        });
        //重新设置所有行的key
        for (let i = 0; i < data.length; i++) {
            data[i].key = i;
        }
        this.setState({
            data
        });
    }
    /**
    * 添加按钮触发的onClick事件
     */
    onAddClick = () => {
        let { count, data } = this.state;
        if (data.length === 0) {
            count = 0;
        } else {
            count = data[data.length - 1].key + 1;
        }
        let newData = {
            key: count,
            parameterType: '',
            parameterCode: '',
            queryScope: '1002',
            solutionParameterList: [],
            queryScopeList: [{ code: '1001', messageKey: messages('common.all') }, { code: '1002', messageKey: messages('budget.balance.select') }]
        };
        this.setState({ data: [...data, newData], count });
    }
    /**
     * 当参数后面的那个弹框点击时
     */
    onListSelectorOk = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        //参数的值的变化，引发弹窗类型和弹窗参数的变化
        let { listSelectorExtraParams, listSelectorType, listSelectorSelectedData } = this.state;

        switch (record.parameterCode) {
            /**公司 */
            case "COMPANY":
                listSelectorType = 'company';
                listSelectorExtraParams = { setOfBooksId: this.props.params.setOfBooksId };
                break;
            /**"公司组" */
            case "COMPANY_GROUP":
                listSelectorType = 'company_group';
                listSelectorExtraParams = {};
                break;
            /**"部门" */
            case "UNIT":
                listSelectorType = 'budget_department';
                listSelectorExtraParams = { deptCode: '', name: '' };
                break;
            /**"部门组" */
            case "UNIT_GROUP":
                listSelectorType = 'department_group';
                listSelectorExtraParams = { deptGroupCode: '', description: '' };
                break;
            /**"员工" */
            case "EMPLOYEE":
                listSelectorType = 'bgtUser';
                listSelectorExtraParams = { roleType: 'TENANT' };
                break;
            /**"员工组" */
            case "EMPLOYEE_GROUP":
                listSelectorType = 'user_group';
                listSelectorExtraParams = { roleType: 'TENANT' };
                break;
            /**"预算项目类型" */
            case "BUDGET_ITEM_TYPE":
                listSelectorType = 'budget_item_type';
                listSelectorExtraParams = { organizationId: this.state.organizationId };
                break;
            /**"预算项目组" */
            case "BUDGET_ITEM_GROUP":
                listSelectorType = 'budget_item_group';
                listSelectorExtraParams = { organizationId: this.state.organizationId };
                break;
            /**"预算项目" */
            case "BUDGET_ITEM":
                listSelectorType = 'budget_item';
                listSelectorExtraParams = { organizationId: this.state.organizationId };
                break;
            /**"币种" */
            case "CURRENCY":
                listSelectorType = 'currency_budget';
                listSelectorExtraParams = { enable: true, setOfBooksId: this.props.company.setOfBooksId, tenantId: this.props.company.tenantId }
                break;
            default:
                listSelectorType = '';
                listSelectorExtraParams = {};
        }

        if (record.parameterType == "BGT_RULE_PARAMETER_DIM") {
            listSelectorType = 'cost_center_item_by_id';
            listSelectorExtraParams = {
                costCenterId: record.parameterCode,
                allFlag: true
            };
        }

        this.setState({
            listSelectorExtraParams,
            listSelectorType,
            listSelectorVisible: true,
            listSelectorSelectedData: record.solutionParameterList,
            recordKey: record.key
        });
    }
    /**
     * 当参数类型的值发生变化时，触发的事件
     */
    onParameterTypeChange = (value, record) => {
        let { data } = this.state;
        //把变化的值保存到data中
        //参数类型的变化，会导致参数重新置空
        data[record.key].parameterType = value;
        data[record.key].parameterCode = '';
        data[record.key].queryScope = '1002';
        data[record.key].solutionParameterList = [];
        this.setState({
            data,
            listSelectorType: '',
            listSelectorExtraParams: {},
            listSelectorSelectedData: []
        });
    }
    /**
     * 参数的值对参数值的值的影响
     */
    paramCodeChangeQueryScope = (value, record) => {
        let { queryScopeList, data } = this.state;
        if (value === 'COMPANY') {
            record.queryScopeList.length = 2;
            record.queryScopeList.push({ code: '1003', messageKey: messages('budget.balance.current.company') });
        }
        if (value === 'UNIT') {
            record.queryScopeList.length = 2;
            record.queryScopeList.push({ code: '1003', messageKey: messages('budget.balance.current.department') });
        }
        if (value === 'EMPLOYEE') {
            record.queryScopeList.length = 2;
            record.queryScopeList.push({ code: '1003', messageKey: messages('budget.balance.current.user') });
        }
        if (['COMPANY', 'UNIT', 'EMPLOYEE'].indexOf(value) === -1) {
            record.queryScopeList.length = 2;
        }
        data[record.key] = record;
        this.setState({
            data
        });
    }
    /**
     * 当参数的值发生变化时，触发的事件
     */
    onParameterCodeChange = (value, record) => {

        let { data } = this.state;
        this.paramCodeChangeQueryScope(value, record);
        //把变化的数据保存到data中
        data[record.key].parameterCode = value;
        data[record.key].queryScope = '1002';
        data[record.key].solutionParameterList = [];
        this.setState({
            data
        });
    }
    /**
     * 当参数值的值发生变化时，触发的事件
     */
    onQueryScopeChange = (value, record) => {
        let { data } = this.state;
        data[record.key].queryScope = value;
        data[record.key].solutionParameterList = [];
        this.setState({
            data
        });
    }
    /**
     * constructor之後render之前执行的生命周期函数
     */
    componentWillMount = () => {
        this.getParameterTypes();
        this.getBudgetRefParameters();
        this.getOrgRefParameters();
        this.getDimensionRefParameters();
        this.getOrganization();

        //点击编辑的时候
        if (Number(this.props.params.id)) {

            budgetBalanceSolutionService.getBudgetBalanceSolutionById(this.props.params.id).then(res => {
                //设置values里面的值
                this.props.form.setFieldsValue({
                    conditionCode: res.data.conditionCode,
                    conditionName: res.data.conditionName,
                  enabled: res.data.enabled
                });
                //设置人员权限相关的数据
                let nowReleaseIdsList = [];
                if (res.data.releaseIds) {
                    res.data.releaseIds.map(item => {
                        if (res.data.visibleUserScope === 1003) {
                            nowReleaseIdsList.push({ key: item, departmentId: item });
                        } else {
                            nowReleaseIdsList.push({ key: item, id: item });
                        }
                    });
                }
                this.setState({
                    versionNumber: res.data.versionNumber,
                    visibleUserScope: res.data.visibleUserScope,
                    releaseIdsList: nowReleaseIdsList
                });
                //设置data里面的值
                let nowData = [];
                let { count } = this.state;
                //对行数据遍历
                res.data.solutionLineList.map(record => {
                    let nowsolutionParameterList = [];
                    if (record.solutionParameterList) {
                        record.solutionParameterList.map(item => {
                            //参数的值为预算项目类型时
                            if (record.parameterCode === 'BUDGET_ITEM_TYPE') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //参数的值为预算项目组时
                            if (record.parameterCode === 'BUDGET_ITEM_GROUP') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //参数的值为预算项目时
                            if (record.parameterCode === 'BUDGET_ITEM') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //参数的值为币种时
                            if (record.parameterCode === 'CURRENCY') {
                                nowsolutionParameterList.push({ currencyCode: item.parameterValueCode, key: item.parameterValueCode });
                            }
                            //参数的值为公司时
                            if (record.parameterCode === 'COMPANY') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //参数的值为公司组时
                            if (record.parameterCode === 'COMPANY_GROUP') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //参数的值为部门时
                            if (record.parameterCode === 'UNIT') {
                                nowsolutionParameterList.push({ departmentId: item.parameterValueId, key: item.parameterValueId })
                            }
                            //参数的值为部门组时
                            if (record.parameterCode === 'UNIT_GROUP') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //参数的值为员工时
                            if (record.parameterCode === 'EMPLOYEE') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //参数的值为员工组时
                            if (record.parameterCode === 'EMPLOYEE_GROUP') {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                            //维度相关的参数的值时
                            if (record.parameterType == "BGT_RULE_PARAMETER_DIM") {
                                nowsolutionParameterList.push({ id: item.parameterValueId, key: item.parameterValueId });
                            }
                        });
                    }
                    //queryScopeList
                    let nowQueryScopeList = [{ code: '1001', messageKey: messages('common.all') }, { code: '1002', messageKey: messages('budget.balance.select') }];
                    if (record.parameterCode === 'COMPANY') {
                        nowQueryScopeList.length = 2;
                        nowQueryScopeList.push({ code: '1003', messageKey: messages('budget.balance.current.company') });
                    }
                    if (record.parameterCode === 'UNIT') {
                        nowQueryScopeList.length = 2;
                        nowQueryScopeList.push({ code: '1003', messageKey: messages('budget.balance.current.department') });
                    }
                    if (record.parameterCode === 'EMPLOYEE') {
                        nowQueryScopeList.length = 2;
                        nowQueryScopeList.push({ code: '1003', messageKey: messages('budget.balance.current.user') });
                    }
                    if (['COMPANY', 'UNIT', 'EMPLOYEE'].indexOf(record.parameterCode) === -1) {
                        nowQueryScopeList.length = 2;
                    }
                    nowData.push({
                        key: count++,
                        parameterType: record.parameterType,
                        parameterCode: record.parameterCode,
                        queryScope: record.queryScope.toString(),
                        solutionParameterList: nowsolutionParameterList,
                        queryScopeList: nowQueryScopeList
                    });
                });
                this.setState({ data: nowData, count: count, tableLoading: false });
                this.setState({ conditionCodeDisabled: true });
            }).catch(e => {
                if (e.response) {
                    message.error(messages('common.operate.filed'));
                }
            });
        } else {
            this.setState({
                tableLoading: false
            });
        }
    }
    /**
     * 获取组织架构相关信息
     */
    getOrganization = () => {
        budgetBalanceSolutionService.getOrganization(this.props.params.setOfBooksId).then(res => {
            this.setState({
                organizationId: res.data[0].id
            });
        });
    }
    /**
     * 获取参数类型
     */
    getParameterTypes = () => {
        let parameterTypeList = [];
        budgetBalanceSolutionService.getParameterTypes().then(res => {
            parameterTypeList = res.data;
            this.setState({
                parameterTypeList: parameterTypeList
            });
        });
    }
    /**
     * 当参数类型是预算相关时，获取参数的接口
     */
    getBudgetRefParameters = () => {
        budgetBalanceSolutionService.getBudgetRefParameters().then(res => {
            let { budgetRefParameterList } = this.state;
            res.data.map(item => {
                if (item.common === true && item.code !== "BUDGET_SCENARIO" && item.code !== "BUDGET_VERSION") {
                    budgetRefParameterList.push(item);
                }
            });
            this.setState({
                budgetRefParameterList
            });
        });
    }
    /**
     * 当参数类型是组织架构相关时，获取参数的接口
     */
    getOrgRefParameters = () => {
        budgetBalanceSolutionService.getOrgRefParameters().then(res => {
            this.setState({
                orgRefParameterList: res.data
            });
        });
    }
    /**
     * 当参数类型为维度相关时，获取参数的接口
     */
    getDimensionRefParameters = () => {
        budgetBalanceSolutionService.getDimensionRefParameters(this.props.params.setOfBooksId).then(res => {
            this.setState({
                dimensionRefParameterList: res.data
            });
        });
    }
    /**
     * 保存函数
     * 保存的时候，需要过滤一下data，将solutionParameterList只保留key数据，传递给后台
     */
    onFormSubmit = (e) => {
        e.preventDefault();
        this.setState({ loading: true });
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { data, releaseIdsList, versionNumber, visibleUserScope } = this.state;
                let params = {};
                let nowReleaseIds = [];
                params.setOfBooksId = this.props.params.setOfBooksId ? this.props.params.setOfBooksId : '';
                params.conditionCode = values.conditionCode;
                params.conditionName = values.conditionName;
                params.enabled = values.enabled;
                /**后面注意一下 */
                params.id = Number(this.props.params.id) ? this.props.params.id : '';
                //版本控制
                params.versionNumber = versionNumber;
                //人员权限
                params.visibleUserScope = visibleUserScope;

                releaseIdsList.map(item => {
                    nowReleaseIds.push(item.key);
                });
                params.releaseIds = nowReleaseIds;
                //当radio值不为全部人员，校验数据至少有一条
                if (params.visibleUserScope !== 1001 && params.releaseIds.length == 0) {
                    message.warning(messages('budget.balance.permission.error.select'));
                    this.setState({ loading: false });
                    return;
                }
                /**行数据集合 */
                params.solutionLineList = [];
                //增加标记位
                let sign = true;
                /**校验行数据最少为一条 */
                if (data.length < 1) {
                    let sign = false;
                    message.error(messages('budget.balance.please.add.at.least.one.dimension'));
                    this.setState({ loading: false });
                    return;
                }
                //获取数组中所有的parameterCode
                let dataParameter = [];
                data.map(dataRecord => {
                    dataParameter.push(dataRecord.parameterCode);
                });

                for (let i = 0; i < dataParameter.length; i++) {
                    if (dataParameter.indexOf(dataParameter[i], i + 1) !== -1) {
                        sign = false;
                        message.error(messages('budget.balance.same.params.cannot.add.twice'));
                        this.setState({ loading: false });
                        return;
                    }
                }
                data.map(record => {
                    if (record.queryScope === '1002' && record.parameterCode && record.solutionParameterList.length === 0) {
                        sign = false;
                        message.error(messages('budget.balance.please.select.at.least.one.value'));
                        this.setState({ loading: false });
                        return;
                    }
                    if (!record.parameterType) {
                        sign = false;
                        message.error(messages('budget.balance.please.select.params.type'));
                        this.setState({ loading: false });
                        return;
                    }
                    if (!record.parameterCode) {
                        sign = false;
                        message.error(messages('budget.balance.please.select.params'));
                        this.setState({ loading: false });
                        return;
                    }
                    let saveSolutionParameterList = [];
                    //弹窗选择数据
                    record.solutionParameterList.map(item => {
                        //如果参数是币种，那么取code传递给后台
                        if (record.parameterCode === 'CURRENCY') {
                            saveSolutionParameterList.push({ parameterValueCode: item.key });
                        } else {
                            saveSolutionParameterList.push({ parameterValueId: item.key });
                        }
                    });
                    params.solutionLineList.push({
                        parameterType: record.parameterType,
                        parameterCode: record.parameterCode,
                        queryScope: record.queryScope,
                        solutionParameterList: saveSolutionParameterList
                    });
                });
                if (sign) {
                    budgetBalanceSolutionService.saveBgtBalanceSolution(params).then(res => {
                        if (res.status === 200) {
                            this.setState({ loading: false, conditionCodeDisabled: true });
                            message.success(messages('common.operate.success'));
                            this.onNewBgtBalSolutionCancel();
                        }
                    }).catch(e => {
                        if (e.response) {
                            this.setState({ loading: false });
                            message.error(`${messages('common.operate.filed')}:${e.response.data.message}`);
                        }
                    });
                } else {
                    this.setState({ loading: false });
                }
            } else {
                this.setState({ loading: false });
            }
        });
    }
    /**
     * 关闭弹窗
     */
    onListSelectCancel = () => {
        this.setState({
            listSelectorVisible: false
        });
    }
    /**
     * 弹窗保存事件
     */
    handleListSelectorOk = (values) => {
        let { data } = this.state;
        data[this.state.recordKey].solutionParameterList = values.result;
        this.setState({
            data: data,
            listSelectorVisible: false
        });
    }
    /**
     * 点击取消按钮触发的事件
     */
    onNewBgtBalSolutionCancel = () => {
        this.context.router.push(menuRoute.getRouteItem('budget-balance-solution', 'key').url.replace(':setOfBooksId', this.props.params.setOfBooksId));
    }
    /**
     * visibleUserScope变化事件
     */
    onVisibleUserScopeChange = (e) => {
        this.setState({
            visibleUserScope: e.target.value,
            releaseIdsList: []
        })
    }
    /**
     * 人员权限弹窗点击事件
     */
    onReleaseIdsClick = (e) => {
        e.preventDefault();
        let { visibleUserScope, releaseIdsList, releaseIdsType, releaseIdsExtraParams, releaseIdsSelectedData } = this.state;
        switch (visibleUserScope) {
            //部门
            case 1003:
                releaseIdsType = 'budget_department';
                releaseIdsExtraParams = { deptCode: '', name: '' };
                break;
            //人员组
            case 1004:
                releaseIdsType = 'user_group';
                releaseIdsExtraParams = { roleType: 'TENANT' };
                break;
            //公司
            case 1002:
                releaseIdsType = 'company';
                releaseIdsExtraParams = { setOfBooksId: this.props.params.setOfBooksId };
                break;
            //人员
            case 1005:
                releaseIdsType = 'bgtUser';
                releaseIdsExtraParams = { roleType: 'TENANT' };
                break;
            default:
                releaseIdsType = '';
                releaseIdsExtraParams = {};
        }
        this.setState({
            releaseIdsVisible: true,
            releaseIdsType,
            releaseIdsExtraParams,
            releaseIdsSelectedData: releaseIdsList
        });
    }
    /**
     * 人员权限弹窗取消事件
     */
    onReaseIdsCancel = () => {
        this.setState({
            releaseIdsVisible: false
        });
    }
    /**
     * 人员权限弹窗确认事件
     */
    handleReleaseIdsOk = (values) => {

        let { releaseIdsList } = this.state;
        releaseIdsList = values.result;
        this.setState({
            releaseIdsList,
            releaseIdsVisible: false
        });
    }
    /**
     * 渲染函数
     */
    render() {
        const { getFieldDecorator } = this.props.form;
        const { visibleUserScope,
            columns,
            data,
            loading,
            listSelectorVisible,
            listSelectorType,
            listSelectorExtraParams,
            listSelectorSelectedData,
            releaseIdsVisible,
            releaseIdsType,
            releaseIdsExtraParams,
            releaseIdsSelectedData,
            releaseIdsList,
            pagination,
            conditionCodeDisabled,
            tableLoading
        } = this.state;
        const formItemLayout = {
            labelCol: { span: 7 }
        };
        return (
            <div>
                <Form onSubmit={this.onFormSubmit}>
                    <List bordered='true' size='small' split>
                        <div className="common-item-title" style={{ borderBottom: '1px solid #D0D0D0' }}>{messages('common.baseInfo')}</div>
                        <Row gutter={16} type="flex" justify="space-around" align="top">
                            <Col span={6}>
                                <FormItem {...formItemLayout} label={messages('budget.balance.condition.code')}>
                                    {
                                        getFieldDecorator('conditionCode', {
                                            rules: [{
                                                required: true,
                                                message: messages('common.please.enter')
                                            }]
                                        })
                                            (
                                            <Input disabled={conditionCodeDisabled} placeholder={messages('common.please.enter')} />
                                            )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem {...formItemLayout} label={messages('budget.balance.condition.name')}>
                                    {
                                        getFieldDecorator('conditionName', {
                                            rules: [{
                                                required: true,
                                                message: messages('common.please.enter')
                                            }]
                                        })
                                            (
                                            <Input placeholder={messages('common.please.enter')} />
                                            )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={6} >
                                <FormItem {...formItemLayout} label={messages('common.column.status')}  >
                                    {
                                        getFieldDecorator('enabled', {
                                            rules: [{
                                                required: true
                                            }],
                                            initialValue: true,
                                            valuePropName: 'checked'
                                        })
                                            (
                                            <Switch />
                                            )
                                    }
                                </FormItem>
                            </Col>
                        </Row>
                    </List>
                    <div className='table-header-buttons' style={{ marginBottom: '5px', marginTop: '10px' }}>
                        <Button onClick={this.onAddClick}>{messages('common.add')}</Button>
                    </div>

                    <div className='common-item-title' style={{ marginTop: '10px', marginBottom: '0px', borderTop: '1px solid #D0D0D0', borderRight: '1px solid #D0D0D0', borderLeft: '1px solid #D0D0D0' }}>
                      {messages('budget.balance.search.dimension')}
                    </div>
                    <Table columns={columns}
                        bordered
                        size='middle'
                        dataSource={data}
                        rowKey={data.key}
                        pagination={false}
                        loading={tableLoading}
                    />
                    <List bordered size='middle' style={{ marginBottom: '50px' }}>
                        <div className="common-item-title" style={{ borderBottom: '1px solid #D0D0D0' }}>{messages('budget.balance.permission')}</div>
                        <Row>
                            <Col span={23} push={1}>
                                <RadioGroup value={visibleUserScope} onChange={this.onVisibleUserScopeChange}>
                                    <Radio value={1001}>{messages('common.all.user')}</Radio>
                                    <Radio value={1002}>{messages('common.add.by.company')}</Radio>
                                    <Radio value={1003}>{messages('common.add.by.department')}</Radio>
                                    <Radio value={1004}>{messages('common.add.by.user.group')}</Radio>
                                    <Radio value={1005}>{messages('common.add.by.user')}</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} push={1} style={{ marginTop: '10px', marginBottom: '30px' }}>
                                <Input onClick={this.onReleaseIdsClick} disabled={visibleUserScope === 1001 ? true : false} value={visibleUserScope === 1001 ? messages('common.all.user') : messages('budget.balance.select.data', {total: releaseIdsList.length})} />
                            </Col>
                        </Row>
                    </List>
                    <div className="slide-footer" style={{ backgroundColor: 'white' }}>
                        <Button type="primary" htmlType="submit" loading={this.state.loading}>{messages('common.save')}</Button>
                        <Button onClick={this.onNewBgtBalSolutionCancel}>{messages('common.cancel')}</Button>
                    </div>
                </Form>
                {/**行上面的弹窗*/}
                <ListSelector visible={listSelectorVisible}
                    onCancel={this.onListSelectCancel}
                    type={listSelectorType}
                    extraParams={listSelectorExtraParams}
                    selectedData={[...listSelectorSelectedData]}
                    onOk={this.handleListSelectorOk}
                />
                {/**人员权限上的弹窗*/}
                <ListSelector visible={releaseIdsVisible}
                    onCancel={this.onReaseIdsCancel}
                    type={releaseIdsType}
                    extraParams={releaseIdsExtraParams}
                    selectedData={[...releaseIdsSelectedData]}
                    onOk={this.handleReleaseIdsOk} />
            </div>
        )
    }
}
/**
 * router
 */
NewBudgetBalanceSolution.contextTypes = {
    router: React.PropTypes.object
};
/**
 * redux
 */
function mapStateToProps(state) {
    return {
        company: state.login.company
    }
};
const WrappedNewBudgetBalanceSolution = Form.create()(NewBudgetBalanceSolution);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetBalanceSolution);