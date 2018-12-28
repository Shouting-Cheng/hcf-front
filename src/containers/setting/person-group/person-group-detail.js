/**
 * Created by zhouli on 18/1/17
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';
import { Input, Button, Icon, Tabs, message, Modal, Popconfirm } from 'antd';
import Table from 'widget/table'
import 'styles/setting/person-group/person-group-detail.scss';
import ListSelector from 'components/Widget/list-selector.js';
//顶部信息
import BasicInfo from 'widget/basic-info';
//公共函数
// import { deepCopy, uniquelizeArray } from 'share/common';
//规则添加组件
import RuleInfo from 'containers/setting/person-group/rule-info';
//需要在这个里面去配置弹窗类型
import chooserData from 'share/chooserData';
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
import PGService from 'containers/setting/person-group/person-group.service';

import { routerRedux } from 'dva/router';
import { deepCopy, uniquelizeArray } from 'utils/extend';

class PersonGroupDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updateParams: {},
            updateState: false,
            saving: false,
            loading: true,
            edit: false, //顶部的信息是否正在编辑
            infoData: {}, //顶部的基本信息
            infoList: [
                //顶部基本信息字段
                {
                    type: 'input',
                    id: 'code',
                    isRequired: true,
                    disabled: true,
                    label: this.$t({ id: 'person.group.code' }) + ' :',
                } /*人员组代码*/,
                {
                    type: 'input',
                    id: 'name',
                    isRequired: true,
                    label: this.$t({ id: 'person.group.name' }) + ' :',
                } /*人员组名称*/,
                {
                    type: 'input',
                    id: 'comment',
                    isRequired: true,
                    label: this.$t({ id: 'person.group.desc' }) + ' :',
                } /*描述*/,
                {
                    type: 'switch',
                    id: 'enabled',
                    label: this.$t({ id: 'common.column.status' }) + ' :',
                } /*状态*/,
            ],
            //tabs标题
            tabs: [
                { key: 'PERSONADD', name: this.$t({ id: 'person.group.personAdd' }) } /*按人员添加*/,
                //本次上线不要这个
                { key: 'RULEADD', name: this.$t({ id: 'person.group.ruleAdd' }) } /*按照条件添加*/,
            ],
            //两个tab
            tabsData: {
                RULEADD: {},
                PERSONADD: {
                    columns: [
                        {
                            /*姓名*/
                            title: this.$t({ id: 'person.group.rule.name' }),
                            key: 'fullName',
                            dataIndex: 'fullName',
                            width: '16%',
                        },
                        {
                            /*工号*/
                            title: this.$t({ id: 'person.group.rule.employeeID' }),
                            key: 'employeeID',
                            dataIndex: 'employeeID',
                            width: '8%',
                        },
                        {
                            /*部门*/
                            title: this.$t({ id: 'person.group.rule.dep1' }),
                            key: 'department',
                            dataIndex: 'department',
                            width: '10%',
                            render: department => (department ? department.name : ''),
                        },
                        {
                            //操作
                            title: this.$t({ id: 'common.operation' }),
                            key: 'operation',
                            width: '15%',
                            render: (text, record) => (
                                <span>
                                    <Popconfirm
                                        onConfirm={e => this.deleteUserFromGroup(e, record)}
                                        title={this.$t(
                                            { id: 'common.confirm.delete' },
                                            { controlRule: record.controlRuleName }
                                        )}
                                    >
                                        {/* 你确定要删除organizationName吗 */}
                                        <a
                                            href="#"
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            {this.$t({ id: 'common.delete' })}
                                        </a>
                                    </Popconfirm>
                                </span>
                            ),
                        },
                    ],
                },
            },
            personTableData: [], //人员表格数据
            pagination: {
                total: 0,
            },
            keywordUserName: '', //搜索人员规则组下面的人
            page: 0,
            pageSize: 10,
            nowStatus: 'PERSONADD',
            conditionViewDTOS: [], //规则组数据
            defaultConditionViewDTO: {
                isEditing: true, //正在编辑的标志
                conditionDetails: [
                    {
                        conditionProperty: 'Department',
                        conditionLogic: 'I',
                        enabled: true,
                        conditionValues: [],
                    },
                    {
                        conditionProperty: 'EmployeeRank',
                        conditionLogic: 'I',
                        enabled: true,
                        conditionValues: [],
                    },
                    {
                        conditionProperty: 'EmployeeDuty',
                        conditionLogic: 'I',
                        enabled: true,
                        conditionValues: [],
                    },
                    {
                        conditionProperty: 'EmployeeType',
                        conditionLogic: 'I',
                        enabled: true,
                        conditionValues: [],
                    },
                ],
            }, //默认的一个规则，新增的时候，直接调用这个
            conditionCloneForCancel: false, //点击编辑时，拷贝一份取消的时候用,一旦取消设置为false
            //点击添加条件中的项目弹窗
            extraParams: {
                //弹窗额外的参数
                excludeList: [],
                systemCustomEnumerationType: '', // systemCustomEnumerationType 代表类型，1001 type,1002 duty , 1008 级别
                status: '',
            },
            selectorItem: chooserData['personTypeModel'], //弹窗显示配置
            showListSelector: false, //弹窗是否显示
            userGroupOid: '', //人员组oid
            userGroupId: ''
        };
        // 正在编辑条件
        this.editingRule = {
            name: '', // 正在编辑条件里面项目名称：Department，EmployeeRank，EmployeeDuty，EmployeeType；其中user代表添加员工
            index: '', // 正在编辑条件序号
            itemIndex: '', // 正在编辑条件里面项目序号
        };
    }

    componentDidMount() {
        this.setState({
            userGroupOid: this.props.match.params.id,
        });
        this.getGroupDetail();
        //加载人员组下面的人
        this.getList(this.state.nowStatus);
    }

    deleteUserFromGroup = (e, record) => {
        let param = {
            userGroupOid: this.state.userGroupOid,
            userOids: [record.userOid],
        };
        PGService.deletePersonGroupPerson(param).then(() => {
            this.getList(this.state.nowStatus);
        });
    };
    getGroupDetail = () => {
        //根据路径上的oid,查出该条完整数据
        PGService.getPersonGroupDetail(this.props.match.params.id).then(response => {
            //根据code控制是否可以禁用
            let infoList = this.state.infoList;
            let infoData = response.data;
            infoList[0].disabled = !!infoData.code;
            this.setState({
                infoData,
                infoList,
                conditionViewDTOS: response.data.conditionViewDTOS,
                userGroupId: response.data.id
            });
        });
    };

    getList = key => {
        if (key === 'PERSONADD') {
            let params = {
                page: this.state.page,
                size: this.state.pageSize,
                keyword: this.state.keywordUserName,
            };
            PGService.getPersonGroupPersons(this.props.match.params.id, params)
                .then(response => {
                    response.data.map((item, index) => {
                        item.key = item.id ? item.id : index;
                    });
                    this.setState({
                        personTableData: response.data,
                        loading: false,
                        pagination: {
                            total: Number(response.headers['x-total-count']),
                            onChange: this.onChangePager,
                            current: this.state.page + 1,
                        },
                    });
                })
                .catch(err => {
                    this.setState({
                        loading: false,
                    });
                });
        }
    };

    onChangePager = page => {
        if (page - 1 !== this.state.page)
            this.setState(
                {
                    page: page - 1,
                    loading: true,
                },
                () => {
                    this.getList(this.state.nowStatus);
                }
            );
    };
    /**
     * 选择是否包含
     * @param index    条件的序号
     * @param value    是否包含的标志
     * @param name     标题：部门、级别、类型、职务
     * @param i        条件中项目对应的序号
     */
    logicSelectChangeHandle = (index, value, name, i) => {
        this.state.conditionViewDTOS[index].conditionDetails[i].conditionLogic = value;
    };

    /**
     * 是否启用
     * @param index    条件的序号
     * @param value    是否包含的标志
     * @param name     标题：部门、级别、类型、职务
     * @param i        条件中项目对应的序号
     */
    onCheckboxChangeHandle = (index, i, value) => {
        const { conditionViewDTOS } = this.state;
        conditionViewDTOS[index].conditionDetails[i].enabled = value;
        this.setState({
            conditionViewDTOS,
        });
    };
    /**
     * 移除一个条件项目
     * @param index    条件的序号
     * @param name     标题：部门、级别、类型、职务
     * @param valueIndex    移除的目标对象的序号
     * @param i        条件中项目对应的序号
     */
    removeTagByNameHandle = (index, name, valueIndex, i) => {
        const { conditionViewDTOS } = this.state;
        const list = conditionViewDTOS[index].conditionDetails[i].conditionValues;
        // list[valueIndex].deleted = true;
        list.splice(valueIndex, 1);
        this.setState({ conditionViewDTOS });
    };
    //分为新增条件与修改条件
    confirmRuleHandle = i => {
        const { conditionViewDTOS, infoData } = this.state;
        if (this._checkCoditionIsEmpty(conditionViewDTOS[i])) {
            let pureCondition = this._deleteEmptyCondition(conditionViewDTOS[i]);
            if (!pureCondition.conditionSeq) {
                //新增
                PGService.createPersonGroupRule(infoData.id, pureCondition)
                    .then(res => {
                        conditionViewDTOS[i] = res.data;
                        this.setState({
                            conditionViewDTOS,
                            loading: false,
                        });
                    })
                    .catch(() => {
                        this.setState({
                            loading: false,
                        });
                    });
            } else {
                //修改
                PGService.UpdatePersonGroupRule(infoData.id, pureCondition)
                    .then(res => {
                        conditionViewDTOS[i] = res.data;
                        this.setState({
                            conditionViewDTOS,
                            loading: false,
                        });
                    })
                    .catch(err => {
                        this.setState({
                            loading: false,
                        });
                    });
            }
        } else {
            // 请至少添加一个条件项目
            message.warning('请至少添加一个条件项目');
        }
    };

    //检测是否有正在编辑的规则
    checkHasEditing = () => {
        const { conditionViewDTOS } = this.state;
        for (let i = 0; i < conditionViewDTOS.length; i++) {
            if (conditionViewDTOS[i].isEditing === true) {
                return true;
            }
        }
        return false;
    };

    //检查条件是不是空的
    _checkCoditionIsEmpty(condition) {
        for (var i = 0; i < condition.conditionDetails.length; i++) {
            if (condition.conditionDetails[i].conditionValues.length > 0) {
                return true;
            }
        }
        return false;
    }

    //上传的时候，把条件项为空的属性，删
    _deleteEmptyCondition(Condition) {
        let condition = deepCopy(Condition);
        let n = [];
        for (let i = 0; i < condition.conditionDetails.length; i++) {
            if (
                condition.conditionDetails[i].conditionValues.length > 0 ||
                condition.conditionDetails[i].id
            ) {
                if (condition.conditionDetails[i].enabled === undefined) {
                    condition.conditionDetails[i].enabled = false;
                }
                condition.conditionDetails[i].conditionValues = this._removeDeletedValue(
                    condition.conditionDetails[i].conditionValues
                );
                n.push(condition.conditionDetails[i]);
            }
        }
        condition.conditionDetails = n;
        return condition;
    }
    _removeDeletedValue(conditionValues) {
        let n = [];
        if (conditionValues.length && conditionValues.length > 0) {
            for (let i = 0; i < conditionValues.length; i++) {
                if (!conditionValues[i].deleted) {
                    n.push(conditionValues[i]);
                }
            }
        }
        return n;
    }

    /**
     * 显示弹窗添加条件中项目
     * @param index    条件的序号
     * @param name    标题：部门、级别、类型、职务
     * @param i    条件中项目对应的序号
     */
    showConditionSelectorHandle = (index, name, itemIndex) => {
        this.editingRule.index = index;
        this.editingRule.itemIndex = itemIndex;
        this.editingRule.name = name;
        const { extraParams, conditionViewDTOS } = this.state;
        const list =
            conditionViewDTOS[this.editingRule.index].conditionDetails[this.editingRule.itemIndex]
                .conditionValues;
        extraParams.excludeList = this._getExcludeList(list);
        if (name === 'EmployeeDuty') {
            let selectorItem = chooserData['personDutyModel'];
            extraParams.systemCustomEnumerationType = '1002';
            extraParams.status = null;
            this.setState({
                selectorItem: selectorItem,
                extraParams: extraParams,
            });
        } else if (name === 'EmployeeType') {
            let selectorItem = chooserData['personTypeModel'];
            extraParams.systemCustomEnumerationType = '1001';
            extraParams.status = null;
            this.setState({
                selectorItem: selectorItem,
                extraParams: extraParams,
            });
        } else if (name === 'EmployeeRank') {
            let selectorItem = chooserData['personRankModel'];
            extraParams.systemCustomEnumerationType = '1008';
            extraParams.status = null;
            this.setState({
                selectorItem: selectorItem,
                extraParams: extraParams,
            });
        } else if (name === 'Department') {
            let selectorItem = chooserData['department'];
            extraParams.systemCustomEnumerationType = '';
            extraParams.status = null;
            this.setState({
                selectorItem: selectorItem,
                extraParams: extraParams,
            });
        }
        this.setState({ showListSelector: true });
    };
    //处理条件添加弹框点击ok,添加值
    handleListOk = result => {
        const arr = result.result;
        if (this.editingRule.name === 'Department') {
            this._afterSelectDepartment(arr);
        } else if (
            this.editingRule.name === 'EmployeeDuty' ||
            this.editingRule.name === 'EmployeeRank' ||
            this.editingRule.name === 'EmployeeType'
        ) {
            this._setConditionDetailsArr(arr);
        } else {
            this.addUserToGroup(arr);
        }
        //关闭弹窗
        this.handleCancel();
    };

    addUserToGroup(arr) {
        const users = [];
        arr.map(function (item) {
            users.push(item.userOid);
        });
        let param = {
            userGroupOid: this.state.userGroupOid,
            userOids: users,
        };
        PGService.addPersonGroupPerson(param).then(() => {
            this.getList(this.state.nowStatus);
        });
    }

    //通过条件项目名字与新增的条件项目，设置条件项目
    //只适用于值列表
    _setConditionDetailsArr(arr) {
        const { conditionViewDTOS } = this.state;
        const cArr = [];
        for (let i = 0; i < arr.length; i++) {
            const item = {
                conditionValue: arr[i].value,
                description: arr[i].messageKey,
            };
            cArr.push(item);
        }
        const allCondition = conditionViewDTOS[this.editingRule.index].conditionDetails[
            this.editingRule.itemIndex
        ].conditionValues.concat(cArr);
        conditionViewDTOS[this.editingRule.index].conditionDetails[
            this.editingRule.itemIndex
        ].conditionValues = uniquelizeArray(allCondition, 'conditionValue');
    }

    //通过条件项目名字与新增的条件项目，设置条件项目
    //只适用于部门
    _afterSelectDepartment(arr) {
        const { conditionViewDTOS } = this.state;
        const cArr = [];
        for (let i = 0; i < arr.length; i++) {
            const item = {
                //"conditionValue": arr[i].deptId, // msl  2018年9月30日15:03:00 这里貌似是 departmentId 而不是 deptId
                conditionValue: arr[i].departmentId,
                description: arr[i].name,
            };
            cArr.push(item);
        }
        const allCondition = conditionViewDTOS[this.editingRule.index].conditionDetails[
            this.editingRule.itemIndex
        ].conditionValues.concat(cArr);
        conditionViewDTOS[this.editingRule.index].conditionDetails[
            this.editingRule.itemIndex
        ].conditionValues = uniquelizeArray(allCondition, 'conditionValue');
    }

    //排除这些已经选择的条件项
    _getExcludeList(list) {
        const arr = [];
        if (list && list.length && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                arr.push(list[i].conditionValue);
            }
        }
        return arr;
    }

    //点击编辑
    editRuleHandle = i => {
        const { conditionViewDTOS } = this.state;
        //这里只做单个编辑，因为有取消操作，每一个编辑状态的条件都需要保存一份数据
        if (this.checkHasEditing()) {
            Modal.warning({
                //提示
                title: this.$t({ id: 'person.group.detail.editing' }),
                //请先保存正在编辑的条件
                content: this.$t({ id: 'person.group.detail.editing.tip' }),
            });
        } else {
            let conditionCloneForCancel = deepCopy(conditionViewDTOS[i]);
            conditionViewDTOS[i].isEditing = true;
            this.setState({
                conditionViewDTOS,
                conditionCloneForCancel,
            });
        }
    };

    //点击取消编辑
    cancelRuleHandle = i => {
        const { conditionCloneForCancel, conditionViewDTOS } = this.state;
        if (!conditionCloneForCancel) {
            //如果是新增
            conditionViewDTOS.splice(i, 1);
        } else {
            conditionViewDTOS[i] = conditionCloneForCancel;
            this.state.conditionCloneForCancel = false;
        }
        const _this = this;
        confirm({
            //提示
            title: this.$t({ id: 'person.group.detail.editing' }),
            content: this.$t({ id: 'common.confirm.cancel' }),
            onOk() {
                //把克隆的数据重新渲染
                _this.setState({
                    conditionViewDTOS,
                });
            },
            onCancel() { },
        });
    };
    deleteRuleHandle = i => {
        const { conditionViewDTOS, infoData } = this.state;

        const _this = this;
        confirm({
            //提示
            title: this.$t({ id: 'person.group.detail.editing' }),
            content: this.$t({ id: 'common.confirm.delete' }),
            onOk() {
                //删除
                PGService.deletePersonGroupRule(infoData.id, conditionViewDTOS[i].conditionSeq)
                    .then(res => {
                        _this.setState({ loading: false });
                        conditionViewDTOS.splice(i, 1);
                        _this.setState({
                            loading: false,
                            conditionViewDTOS,
                        });
                    })
                    .catch(e => {
                        _this.setState({ loading: false });
                    });
            },
            onCancel() { },
        });
    };
    //渲染规则条件
    renderConditon = condition => {
        const domConditon = [];
        for (let i = 0; i < condition.length; i++) {
            domConditon.push(
                <RuleInfo
                    key={i}
                    index={i}
                    condition={condition[i]}
                    confirmHandle={this.confirmRuleHandle}
                    cancelHandle={this.cancelRuleHandle}
                    editHandle={this.editRuleHandle}
                    removeTagByNameHandle={this.removeTagByNameHandle}
                    logicSelectChangeHandle={this.logicSelectChangeHandle}
                    onCheckboxChangeHandle={this.onCheckboxChangeHandle}
                    showConditionSelectorHandle={this.showConditionSelectorHandle}
                    deleteHandle={this.deleteRuleHandle}
                />
            );
        }
        return domConditon;
    };

    //添加条件
    addConditon = () => {
        //这里只做单个编辑，因为有取消操作，每一个编辑状态的条件都需要保存一份数据
        if (this.checkHasEditing()) {
            Modal.warning({
                //提示
                title: this.$t({ id: 'person.group.detail.editing' }),
                //请先保存正在编辑的条件
                content: this.$t({ id: 'person.group.detail.editing.tip' }),
            });
        } else {
            const { defaultConditionViewDTO, conditionViewDTOS } = this.state;
            conditionViewDTOS.push(deepCopy(defaultConditionViewDTO));
            this.setState({
                defaultConditionViewDTO,
            });
        }
    };
    //搜索成本中心项的人
    emitEmptyForDep = () => {
        this.userNameInput.focus();
        this.setState({ keywordUserName: '' }, () => {
            this.onChangeUserName();
        });
    };
    //搜索成本中心项的人
    onChangeUserName = e => {
        let keywordUserName = '';
        if (e) {
            keywordUserName = e.target.value;
        }
        this.setState(
            {
                keywordUserName: keywordUserName,
                loading: true,
                page: 0,
            },
            () => {
                //搜索
                this.getList(this.state.nowStatus);
            }
        );
    };
    //渲染Tabs
    renderTabs = () => {
        const {
      tabsData,
            loading,
            pagination,
            nowStatus,
            personTableData,
            conditionViewDTOS,
    } = this.state;
        return this.state.tabs.map(tab => {
            if (tab.key === 'PERSONADD') {
                return (
                    <TabPane tab={tab.name} key={tab.key}>
                        <div className="table-header">{this.renderButton()}</div>
                        <Table
                            columns={tabsData[nowStatus].columns}
                            dataSource={personTableData}
                            pagination={pagination}
                            loading={loading}
                            bordered
                            size="middle"
                            rowKey={reCode => {
                                return reCode.userOid;
                            }}
                        />
                    </TabPane>
                );
            } else if (tab.key === 'RULEADD') {
                return (
                    <TabPane tab={tab.name} key={tab.key}>
                        <div className="condition-rule-wrap">
                            <div className="condition-rule-icon-tips">
                                <Icon type="info-circle" style={{ color: '#1890ff' }} />
                                <span className="tips-text">
                                    {/*单个条件内为且的关系，多个条件间为或的关系*/}
                                    {this.$t({ id: 'person.group.detail.rule.tip' })}
                                </span>
                            </div>
                            {this.renderConditon(conditionViewDTOS)}
                            <div className="rule-add-btn" onClick={e => this.addConditon(e)}>
                                {/*添加条件 +*/}
                                {this.$t({ id: 'person.group.detail.add.rule' })}
                            </div>
                        </div>
                    </TabPane>
                );
            }
        });
    };

    //点击
    onChangeTabs = key => {
        this.setState(
            {
                nowStatus: key,
                loading: true,
                personTableData: [],
                pagination: {
                    total: 0,
                },
                page: 0,
            },
            () => {
                this.getList(key);
            }
        );
    };

    //添加人员
    handleNew = () => {
        this.editingRule.name = 'user';
        let selectorItem = chooserData['user'];
        this.setState({
            selectorItem: selectorItem,
            extraParams: {
                //弹窗额外的参数
                excludeList: [],
                systemCustomEnumerationType: '', // systemCustomEnumerationType 代表类型，1001 type,1002 duty , 1008 级别
                status: '1001',
                userGroupId: this.state.userGroupId
            },
        });
        this.setState({ showListSelector: true });
    };

    //渲染按钮
    //按人员添加
    renderButton = () => {
        const suffix = this.state.keywordUserName ? (
            <Icon type="close-circle" onClick={this.emitEmptyForDep} />
        ) : null;
        const { saving, pagination } = this.state;

        if (this.state.nowStatus === 'PERSONADD') {
            return (
                <div>
                    <div className="table-header-title">
                        {this.$t(
                            { id: 'common.total' },
                            { total: `${pagination.total || 0}` }
                        ) /*共搜索到 {total} 条数据*/}
                    </div>
                    <div className="table-header-buttons">
                        <div className="f-left">
                            <Button type="primary" onClick={this.handleNew} loading={saving}>
                                {/*添加*/}
                                {this.$t({ id: 'common.add' })}
                            </Button>
                        </div>
                        <div className="table-header-inp f-right">
                            {/*输入姓名或/工号*/}
                            <Input
                                className="rule-user-name-search"
                                key={'rule-UserName-search'}
                                placeholder={this.$t({ id: 'cost.center.item.detail.inp1' })}
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                suffix={suffix}
                                value={this.state.keywordUserName}
                                onChange={this.onChangeUserName}
                                ref={node => (this.userNameInput = node)}
                            />
                        </div>
                        <div className="clear" />
                    </div>
                </div>
            );
        }
    };
    //顶部信息：保存所做的详情修改
    handleUpdate = value => {
        const { infoData } = this.state;
        value.id = infoData.id;
        value.userGroupOid = infoData.userGroupOid;
        PGService.UpdatePersonGroup(value).then(response => {
            this.setState({
                infoData: response.data,
                edit: true,
            });
        });
    };
    //顶部信息：控制是否编辑
    handleEdit = flag => {
        this.setState({ edit: flag });
    };
    //控制是否弹出条件添加弹窗
    handleCancel = () => {
        this.setState({ showListSelector: false, saving: false });
    };
    handleBack = () => {
        // this.context.router.push(menuRoute.getMenuItemByAttr('person-group', 'key').url);
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/person-group`,
            })
        );
    };
    render() {
        const { edit, infoList, infoData, extraParams, selectorItem, showListSelector } = this.state;
        return (
            <div style={{ paddingBottom: 20 }} className="person-group-detail">
                <BasicInfo
                    infoList={infoList}
                    infoData={infoData}
                    isHideEditBtn={true}
                    updateHandle={this.handleUpdate}
                    updateState={edit}
                />
                <Tabs onChange={this.onChangeTabs} style={{ marginTop: 20 }}>
                    {this.renderTabs()}
                </Tabs>
                <ListSelector
                    visible={showListSelector}
                    onOk={this.handleListOk}
                    onCancel={this.handleCancel}
                    extraParams={extraParams}
                    selectorItem={selectorItem}
                />
                <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
                    <Icon type="rollback" style={{ marginRight: '5px' }} />
                    {/*返回*/}
                    {this.$t({ id: 'common.back' })}
                </a>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        company: state.user.company,
    };
}
export default connect(
    mapStateToProps,
    null,
    null,
    { withRef: true }
)(PersonGroupDetail);
