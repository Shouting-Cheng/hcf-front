import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Row, Col, Divider, Card, Form, Select, Input, Spin,message } from 'antd';
import BasicInfo from 'widget/basic-info';
import ListSelector from 'components/Widget/list-selector';
import LineAddTransferModal from 'containers/setting/data-authority/line-add-transfer-modal';
import DataAuthorityService from 'containers/setting/data-authority/data-authority.service';
import CustomTable from 'components/Widget/custom-table';
import config from 'config';
const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;

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
            renderRuleInfo: undefined,
            renderNewChangeRules: [],
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
            dataTypeValue: '',
            loading: true,
            keyWord: '',
            ruleName: '',
            ruleDatail: [],
            renderSobList: false,
            getRulesArr: [],
            tenantVisible: false,
            tenantItem: {},
            sobText: '添加账套',
            sobIcon: 'plus',
            companyIcon: 'plus',
            companyText: '添加公司',
            companyVisible: false,
            companyItemsKeys: [],
            departmentIcon: 'plus',
            departmentText: '添加部门',
            departMentVisible: false,
            departMentItemsKeys: [],
            emplyeeIcon: 'plus',
            empolyeeVisible:false,
            employeeItem:{},
            employeeKeys:[],
            employeeText:'添加员工',
            ruleId:'',
            deleted: undefined,
            versionNumber: undefined,
            createdBy: undefined,
            createdDate: undefined,
            lastUpdatedBy: undefined,
            lastUpdatedDate: undefined,
            sobValuesKeys:[],
            renderRuleInfo:{},
            selectedTenantList:[],
            selectedEmployeeList:[],
            selectedTreeInfo:[],
            selectedCompanyTreeInfo:[],
            selectedDepTreeInfo:[]
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.visibel) {
            DataAuthorityService.getSingleDataAuthorityDetail(this.props.dataId, this.props.targetId).then(res => {
                if (res.status === 200) {
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
                        loading: false,
                        infoData: res.data,
                        renderRuleInfo: res.data,
                        ruleDetail: res.data.dataAuthorityRules[0].dataAuthorityRuleDetails,
                        dataTypeValue: res.data.dataAuthorityRules[0].dataAuthorityRuleDetails[0].dataType,
                        activeKey: 'SOB',
                        ruleName: res.data.dataAuthorityRules[0].dataAuthorityRuleName,
                        ruleDatail: res.data.dataAuthorityRules[0].dataAuthorityRuleDetails,
                        getRulesArr: res.data.dataAuthorityRules[0],
                        ruleId:res.data.id,
                        deleted: res.data.deleted,
                        versionNumber: res.data.versionNumber,
                        createdBy: res.data.createdBy,
                        createdDate: res.data.createdDate,
                        lastUpdatedBy: res.data.lastUpdatedBy,
                        lastUpdatedDate: res.data.lastUpdatedDate,
                    })
                }

            })
        }

    }

    onCloseRuleModal = () => {
        this.props.closeRuleModal()
    }
    onBackRuleModal = () => {
        this.props.backRuleModal()
    }
    removeRule = () => {
        this.setState({
            show: true
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
                renderSelectList: false,
                selectedTenantList: [],
                sobText: '添加账套',
                sobIcon: 'plus',
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
                selectedEmployeeList:[],
                employeeText: '添加员工',
                emplyeeIcon: 'plus',
            })
        }
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
    handleTenantListOk = (result) => {
        let resultArr = result.result;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            arr.push(resultArr[i].valueKey);
        }
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
    /**按照账套代码/名称查询 */
    onSobDetailSearch = (value) => {
        this.setState({
            keyWord: value
        }, () => {
            this.sobTable.search()
        })

    }
    /**按照公司代码/名称查询 */
    onCompanyDetailSearch = (value) => {
        this.setState({
            keyWord: value
        }, () => {
            this.companyTable.search()
        })
    }
    /**按照部门代码/名称查询 */
    onUnitDetailSearch = (value) => {
        this.setState({
            keyWord: value
        }, () => {
            this.unitTable.search()
        })
    }
    /**按照员工代码/名称查询 */
    onEmployeeDetailSearch = (value) => {
        this.setState({
            keyWord: value
        }, () => {
            this.employeeTable.search()
        })
    }
    /**详情页面权限规则编辑 */
    editRuleItem = () => {
        let { ruleDatail } = this.state;
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
        if(ruleDatail[1].dataScope==='1004'){
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
        if(ruleDatail[2].dataScope==='1004'){
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
        if(ruleDatail[3].dataScope==='1004'){
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
            show: false
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
                renderSobList: false
            })
        }
    }
    //添加账套
    addTenant = () => {
        const ruleId = this.state.getRulesArr.id;
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
    //添加公司
    addCompany = () => {
        this.setState({
            companyVisible: true,
        })
    }
    cancelCompanyList = () => {
        this.setState({
            companyVisible: false,
        })
    }
    //获取公司，部门选择的值
    transferCompanyList = (items) => {
        let resultArr = items;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            if(resultArr[i].valueKey){
                arr.push(resultArr[i].valueKey);
            }else{
                arr.push(resultArr[i].id);
            }
           
        }
        this.setState({
            companyItemsKeys: arr,
            companyVisible: false,
            companyText: `已选择${resultArr.length}个公司`,
            companyIcon: null,
            selectedCompanyTreeInfo: items
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
        })
    }
    transDePferList = (items) => {
        let resultArr = items;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            if(resultArr[i].valueKey){
                arr.push(resultArr[i].valueKey);
            }else{
                arr.push(resultArr[i].id);
            }
           
        }
        this.setState({
            departMentItemsKeys: arr,
            departMentVisible: false,
            departmentText: `已选择${resultArr.length}个部门`,
            departmentIcon: null,
            selectedDepTreeInfo: items
        })

    }
    //添加员工
    addEmployee = () => {
        const ruleId = this.state.getRulesArr.id;
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
            employeeItem,
        })
    }
    handleEmployeeListOk = (result) => {
        let resultArr = result.result;
        let arr = [];
        for (let i = 0; i < resultArr.length; i++) {
            arr.push(resultArr[i].valueKey);
        }
        this.setState({
            empolyeeVisible: false,
            employeeKeys: arr,
            employeeText: `已选择${resultArr.length}个员工`,
            emplyeeIcon: null,
            selectedEmployeeList:result.result
        })
    }
    cancelEmployeeList = () => {
        this.setState({
            empolyeeVisible: false
        })
    }
     /**保存单条规则 */
     saveRuleItem = (e) => {
        e.preventDefault();
        let tenantId = this.props.company.tenantId;
        this.props.form.validateFields((err, values) => {
            let { ruleId, deleted, versionNumber, createdBy, createdDate, lastUpdatedBy, lastUpdatedDate, getRulesArr,
                dataScopeDesc, sobValuesKeys, employeeKeys, filtrateMethodDesc, companyItemsKeys, departMentItemsKeys,renderRuleInfo } = this.state;
            if(!err){
                let params = {
                    id: ruleId ? ruleId : null,
                    i18n: null,
                    enabled: renderRuleInfo.enabled,
                    tenantId:tenantId,
                    dataAuthorityCode: renderRuleInfo.dataAuthorityCode,
                    dataAuthorityName:renderRuleInfo.dataAuthorityName,
                    description:renderRuleInfo.description,
                    deleted: deleted,
                    versionNumber: versionNumber,
                    createdBy: createdBy,
                    createdDate: createdDate,
                    lastUpdatedBy: lastUpdatedBy,
                    lastUpdatedDate: lastUpdatedDate,
                    dataAuthorityRules:[
                        {
                            i18n: null,
                            dataAuthorityRuleName: values[`dataAuthorityRuleName`],
                            dataAuthorityRuleDetails:[
                                {
                                    dataType: 'SOB',
                                    dataScopeDesc: dataScopeDesc[values[`dataScope1`]].label,
                                    dataScope: values[`dataScope1`],
                                    filtrateMethod: values[`filtrateMethod1`] ? values[`filtrateMethod1`] : null,
                                    filtrateMethodDesc: values[`filtrateMethod1`]?filtrateMethodDesc[values[`filtrateMethod1`]].label:null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod1`] ? sobValuesKeys : [],
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
                                    dataScopeDesc: dataScopeDesc[values[`dataScope2`]].label,
                                    dataScope: values[`dataScope2`],
                                    filtrateMethod: values[`filtrateMethod2`] ? values[`filtrateMethod2`] : null,
                                    filtrateMethodDesc:values[`filtrateMethod2`]?filtrateMethodDesc[values[`filtrateMethod2`]].label:null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod2`] ? companyItemsKeys : [],
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
                                    dataScopeDesc: dataScopeDesc[values[`dataScope3`]].label,
                                    dataScope: values[`dataScope3`],
                                    filtrateMethod: values[`filtrateMethod3`] ? values[`filtrateMethod3`] : null,
                                    filtrateMethodDesc: values[`filtrateMethod3`]?filtrateMethodDesc[values[`filtrateMethod3`]].label:null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod3`] ? departMentItemsKeys : [],
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
                                    dataScopeDesc: dataScopeDesc[values[`dataScope4`]].label,
                                    dataScope: values[`dataScope4`],
                                    filtrateMethod: values[`filtrateMethod4`] ? values[`filtrateMethod4`] : null,
                                    filtrateMethodDesc:values[`filtrateMethod4`]? filtrateMethodDesc[values[`filtrateMethod4`]].label:null,
                                    dataAuthorityRuleDetailValues: values[`filtrateMethod4`] ? employeeKeys : [],
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
                            ruleId: res.data.id,
                            deleted: res.data.deleted,
                            versionNumber: res.data.versionNumber,
                            createdBy: res.data.createdBy,
                            createdDate: res.data.createdDate,
                            lastUpdatedBy: res.data.lastUpdatedBy,
                            lastUpdatedDate: res.data.lastUpdatedDate,
                        },()=>{
                            this.refresh(this.state.ruleDatail)
                            this.setState({
                                show: true
                            })
                        })
                    }
                }) .catch(e => {
                    message.error(e.response.data.message)
                })
            }
        })

    }
    render() {
        const { visibel } = this.props;
        const { infoList, infoData, dataTypeValue, loading, activeKey, tenantItem, renderRuleInfo, dataType, sobText,
            ruleDetail, tabListNoTitle, tenantVisible, keyWord, columns, show, ruleName, ruleDatail, departmentIcon,
            sobIcon, renderSobList, companyIcon, companyVisible, renderCompanyList, companyText, renderDepartmentList,
            departmentText, departMentVisible, renderEmplyeeList, emplyeeIcon,empolyeeVisible,employeeItem,employeeText,
            selectedTenantList,selectedEmployeeList,selectedDepTreeInfo,selectedCompanyTreeInfo
        } = this.state;
        const contentListNoTitle = {
            SOB:
                <div>
                    <Row>
                        <Col span={18}>
                            {ruleDetail.length ? ruleDetail[0].dataScopeDesc : null}{ruleDetail.length ? dataType[ruleDetail[0].dataType].label : null}
                        </Col>
                        <Col span={6}>
                            <Search
                                placeholder="请输入账套代码/名称"
                                onSearch={this.onSobDetailSearch}
                                enterButton
                            />
                        </Col>
                    </Row>

                    <div style={{ marginTop: 20 }}>
                        <CustomTable
                            columns={columns}
                            url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue ? dataTypeValue : 'SOB'}&keyWord=${keyWord}`}
                            ref={ref => this.sobTable = ref}
                        />
                    </div>
                </div>,
            COMPANY:
                <div>
                    <Row>
                        <Col span={18}>
                            {ruleDetail.length ? ruleDetail[1].dataScopeDesc : null}{ruleDetail.length ? dataType[ruleDetail[1].dataType].label : null}
                        </Col>
                        <Col span={6}>
                            <Search
                                placeholder="请输入公司代码/名称"
                                onSearch={this.onCompanyDetailSearch}
                                enterButton
                            />
                        </Col>
                    </Row>

                    <div style={{ marginTop: 20 }}>
                        <CustomTable
                            columns={columns}
                            url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue}&keyWord=${keyWord}`}
                            ref={ref => this.companyTable = ref}
                        />
                    </div>
                </div>,
            UNIT: <div>
                <Row>
                    <Col span={18}>
                        {ruleDetail.length ? ruleDetail[2].dataScopeDesc : null}{ruleDetail.length ? dataType[ruleDetail[2].dataType].label : null}
                    </Col>
                    <Col span={6}>
                        <Search
                            placeholder="请输入部门代码/名称"
                            onSearch={this.onUnitDetailSearch}
                            enterButton
                        />
                    </Col>
                </Row>

                <div style={{ marginTop: 20 }}>
                    <CustomTable
                        columns={columns}
                        url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue}&keyWord=${keyWord}`}
                        ref={ref => this.unitTable = ref}
                    />
                </div>
            </div>,
            EMPLOYEE: <div>
                <Row>
                    <Col span={18}>
                        {ruleDetail.length ? ruleDetail[3].dataScopeDesc : null}{ruleDetail.length ? dataType[ruleDetail[3].dataType].label : null}
                    </Col>
                    <Col span={6}>
                        <Search
                            placeholder="请输入员工代码/名称"
                            onSearch={this.onEmployeeDetailSearch}
                            enterButton
                        />
                    </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                    <CustomTable
                        columns={columns}
                        url={`${config.authUrl}/api/data/authority/rule/detail/values?ruleId=${this.props.targetId}&dataType=${dataTypeValue}&keyWord=${keyWord}`}
                        ref={ref => this.employeeTable = ref}
                    />
                </div>
            </div>
        };
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const ruleFormLayout = {
            labelCol: { span: 6, offset: 1 },
            wrapperCol: { span: 16, offset: 1 },
        }
        return (
            <Modal
                visible={visibel}
                footer={[
                    <Button key="back" onClick={this.onBackRuleModal}>
                        {this.$t({ id: 'common.ok' } /* 返回*/)}
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

                    <Spin spinning={loading} style={{ marginTop: 24 }}>
                        <div className='add-rule-form'>
                            {show &&
                                <Card title={ruleName || ''} style={{ marginTop: 25, background: '#f7f7f7' }}
                                    extra={<span>
                                        <a style={{ paddingLeft: 15 }} onClick={this.editRuleItem}>编辑</a>
                                    </span>}
                                >
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

                                </Card>
                            }
                            {!show && <div className='add-rule-form' >
                                <Card style={{ background: '#f7f7f7', marginTop: 25 }}>
                                    <Form>
                                        <Row>
                                            <Col span={22} className="rule-form-title">
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label=''
                                                    className='rule-item-name'
                                                >
                                                    {getFieldDecorator(`dataAuthorityRuleName`, {
                                                        rules: [{
                                                            required: true, message: this.$t({ id: 'common.please.enter' })
                                                        }],
                                                        initialValue: ruleName || '',
                                                    })(
                                                        <Input className="input_title" placeholder='请输入规则名称' />
                                                    )}

                                                </FormItem>
                                            </Col>
                                            <Col span={2}>
                                                <a type='primary'  onClick={(e) => this.saveRuleItem(e)}>{this.$t({ id: 'common.save' })} </a>
                                                <a style={{ marginLeft: 10 }} onClick={this.removeRule}>{this.$t({ id: 'common.cancel' })}</a>
                                            </Col>
                                        </Row>
                                        <Divider style={{ marginTop: '-50px' }}></Divider>
                                        <Row className="rule-form-item">
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='账套'
                                                >
                                                    {getFieldDecorator(`dataScope1`, {
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
                                                <Col span={10} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod1`, {
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
                                                        <Col span={4} style={{ marginLeft: '-25px' }}>
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
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='公司'
                                                >
                                                    {getFieldDecorator(`dataScope2`, {
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
                                                <Col span={10} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod2`, {
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
                                                        <Col span={4} style={{ marginLeft: '-25px' }}>
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
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='部门'
                                                >
                                                    {getFieldDecorator(`dataScope3`, {
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
                                                <Col span={10} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod3`, {
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
                                                        <Col span={4} style={{ marginLeft: '-25px' }}>
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
                                            <Col span={4}>
                                                <FormItem
                                                    {...ruleFormLayout}
                                                    label='员工'
                                                >
                                                    {getFieldDecorator(`dataScope4`, {
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
                                                <Col span={10} >
                                                    <Row>
                                                        <Col span={6} style={{ marginLeft: 10 }}>
                                                            <FormItem
                                                                {...ruleFormLayout}
                                                                label=''
                                                            >
                                                                {getFieldDecorator(`filtrateMethod4`, {
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
                                                        <Col span={4} style={{ marginLeft: '-25px' }}>
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
                                    </Form>
                                </Card>

                            </div>}
                        </div>
                    </Spin>

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
                        selectedData={selectedTenantList}
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
                    <ListSelector
                        visible={empolyeeVisible}
                        selectorItem={employeeItem}
                        onOk={this.handleEmployeeListOk}
                        onCancel={() => this.cancelEmployeeList(false)}
                        showSelectTotal={true}
                        selectedData={selectedEmployeeList}
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