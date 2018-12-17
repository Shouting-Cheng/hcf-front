/**
 * Created by zhouli on 18/3/13
 * Email li.zhou@huilianyi.com
 */
//成本中心详情
import React from 'react';
import { connect } from 'dva';
import { Button, Input, message, Icon, Tooltip, Tabs, Badge } from 'antd';
import Table from 'widget/table'
import VlService from 'containers/setting/value-list/value-list.service';
import CCService from 'containers/setting/cost-center/cost-center.service';
import BasicInfo from 'widget/basic-info';
import 'styles/setting/cost-center/cost-center-item/cost-center-item-detail.scss';
import { fitText, deepCopy } from 'utils/extend';
import { SelectDepOrPerson } from 'widget/index';

import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;
class CostCenterItemDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            nowStatus: 'PERSONADD',//当前的tab
            data: [],
            dataDep: [],//管联的部门数据
            costCenterItemUserName: "",//输入搜索成本中心项人员名称与工号
            costCenterItemDepName: "",//输入搜索成本中心项 部门名称与编码
            //tabs标题
            tabs: [
                { key: 'PERSONADD', name: this.$t("person.group.personAdd") }, /*按人员添加*/
                { key: 'DEPARTMENT', name: this.$t("cost.center.item.detail.batchadd.dep") }, /*按部门添加(含子部门)*/
            ],
            columns: [
                {
                    //工号
                    title: this.$t("cost.center.item.detail.employeeID"),
                    dataIndex: "employeeID",
                    width: '15%'
                },
                {
                    //姓名
                    title: this.$t("cost.center.item.detail.fullName"),
                    dataIndex: "fullName",
                    width: '15%'
                },
                {
                    //部门
                    title: this.$t("cost.center.item.detail.dep"),
                    dataIndex: "departmentName",
                    width: '25%'
                },
                {
                    //职位
                    title: this.$t("cost.center.item.detail.title"),
                    dataIndex: "title",
                    width: '15%'
                },
            ],
            columnsDep: [
                {
                    //部门编码
                    title: this.$t("cost.center.item.detail.departmentCode"),
                    dataIndex: "departmentCode",
                    width: '15%'
                },
                {
                    //部门名称
                    title: this.$t("cost.center.item.detail.departmentName"),
                    dataIndex: "departmentName",
                },
                {
                    //状态
                    title: this.$t("cost.center.item.detail.isEnabled"),
                    dataIndex: "isEnabled",
                    width: '25%',
                    render: isEnabled => (
                        <Badge status={isEnabled ? 'success' : 'error'}
                            text={isEnabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />)
                },

            ],//关联的部门表格
            pagination: {
                total: 0,
                page: 0,
                pageSize: 10,
            },
            //基本信息中有扩展字段，这个扩展字段是动态的，需要请求详情完毕之后，才能确认，
            //这里先确定固定的字段
            infoList: [
                {
                    //名称
                    type: 'input',
                    label: this.$t("cost.center.item.detail.name"),
                    id: 'name',
                    disabled: true
                },
                {
                    //编码
                    type: 'input',
                    label: this.$t("cost.center.item.detail.code"),
                    id: 'code',
                    disabled: true
                },
                {
                    //序号
                    type: 'input',
                    label: this.$t("cost.center.detail.index"),
                    id: 'sequenceNumber',
                    disabled: true
                },
                {
                    //经理
                    type: 'input',
                    label: this.$t("cost.center.item.detail.manager"),
                    id: 'managerFullName',
                    disabled: true
                },
                {
                    //状态
                    type: 'switch',
                    label: this.$t("cost.center.item.detail.status"),
                    id: 'enabled'
                },
                {
                    //主要部门
                    type: 'input',
                    label: this.$t("cost.center.item.detail.main"),
                    id: 'primaryDepartmentName',
                    disabled: true
                },
                {
                    //从属部门
                    type: 'input',
                    label: this.$t("cost.center.item.detail.sec"),
                    id: '_secondaryDepartmentNames',
                    disabled: true
                },
                {
                    //全员可见
                    type: 'switch',
                    label: this.$t("cost.center.item.detail.showall"),
                    id: 'publicFlag',
                    disabled: true
                },
            ],
            infoData: {},
            // CostCenterDetail: menuRoute.getRouteItem('cost-center-detail', 'key'),//成本中心详情
            // newCostCenterItem: menuRoute.getRouteItem('new-cost-center-item'),
        };
    }

    componentWillMount() {
        let columns = this.state.columns;
        let columnsDep = this.state.columnsDep;
        if (this.props.tenantMode) {
            let operation = {
                title: this.$t("common.operation"),//"操作",
                dataIndex: "id",
                render: (text, record) => (
                    <span>
                        <a onClick={(e) => this.removeUserFromCostCenterItemAssociation(e, record)}>
                            {/*删除*/}
                            {this.$t("common.delete")}
                        </a>
                    </span>
                )
            }
            let operationDep = {
                title: this.$t("common.operation"),//"操作",
                dataIndex: "id",
                render: (text, record) => (
                    <span>
                        <a onClick={(e) => this.removeDepFromCostCenterItemAssociation(e, record)}>
                            {/*删除*/}
                            {this.$t("common.delete")}
                        </a>
                    </span>
                )
            }
            columns.push(operation);
            columnsDep.push(operationDep);
        }
    }
    componentDidMount() {
        this.getCostCenterItemDetail();
    }

    getCostCenterItemDetail() {
        CCService.getCostCenterItemDetail(this.props.match.params.itemId)
            .then(res => {
                let data = res.data;
                this.setSecondaryDepartmentNames(data)
            })
    }

    //由于需要显示顶部信息，要对主要部门，从属部门，
    //扩展字段进行处理
    setSecondaryDepartmentNames = (data) => {
        data._secondaryDepartmentNames = "";
        if (data.secondaryDepartmentIds && data.secondaryDepartmentIds.length > 0) {
            let i = 0;
            for (let id in data.secondaryDepartmentNames) {
                if (i > 0) {
                    data._secondaryDepartmentNames += "、";
                }
                i++
                data._secondaryDepartmentNames += data.secondaryDepartmentNames[id];
            }
        }
        this.setState({ infoData: data }, () => {
            this.getList(this.state.nowStatus);
            //后端比较坑
            //这个地方不能直接显示value，与人员信息扩展字段一样，需要去根据value查询message
            //-----------------这个需要后端优化 不需要前端查询，后端直接给出messageKey   start------------------
            if (this.state.infoData.customFormValues && this.state.infoData.customFormValues.length > 0) {
                this.getPersonDetailEnumerationList();
            }
            //-----------------这个需要后端优化 不需要前端查询，后端直接给出messageKey   ------------------
        })
    }
    //获取扩展字段中的值列表
    getPersonDetailEnumerationList = () => {
        let infoData = this.state.infoData;
        let customFormValues = infoData.customFormValues;
        for (let i = 0; i < customFormValues.length; i++) {
            if (customFormValues[i].messageKey === "cust_list") {
                let dataSource = JSON.parse(customFormValues[i].dataSource);
                if (dataSource && dataSource.customEnumerationOID) {
                    VlService.getValueListInfo(dataSource.customEnumerationOID)
                        .then((res) => {
                            this.setPersonDetailEnumerationList(res.data, customFormValues[i])
                        })
                        .catch((err) => {
                        })
                }
            }
        }
    }

    //设置扩展字段中的值列表
    //把值列表挂在对应字段上
    setPersonDetailEnumerationList = (customEnumerationList, filed) => {
        let infoData = deepCopy(this.state.infoData);
        let customFormValues = infoData.customFormValues;
        for (let i = 0; i < customFormValues.length; i++) {
            if (customFormValues[i].fieldOID === filed.fieldOID) {
                customFormValues[i].customEnumerationList = customEnumerationList;
                //每设置一次，都需要更新一下
                //后端可能返回的是值列表值对应的code（value），不是messageKey，需要找一下
                //参见bug13014
                this.setState({
                    infoData: infoData
                }, () => {
                    console.log(infoData)
                })
            }
        }
    }
    //根据key获取对应的列表
    getList = (key) => {
        if (key === "PERSONADD") {
            this.getUserList();
        } else if (key === "DEPARTMENT") {
            this.getDepartmentList();
        }
    };
    //获取管理的部门列表
    getDepartmentList = () => {
        this.setState({ loading: true });
        let pagination = this.state.pagination;
        let params = {
            page: pagination.page,
            size: pagination.pageSize,
            keyword: this.state.costCenterItemDepName,
        }
        CCService.getCostcenteritemDepartmentList(this.state.infoData.id, params)
            .then((response) => {
                console.log(response.data)
                response.data.map((item) => {
                    item.key = item.id;
                });
                pagination.total = Number(response.headers['x-total-count']);
                pagination.current = params.page + 1;
                this.setState({
                    dataDep: response.data,
                    loading: false,
                    pagination
                })
            });
    }
    //得到列表数据
    getUserList() {
        this.setState({ loading: true });
        let pagination = this.state.pagination;
        let params = {
            page: pagination.page,
            size: pagination.pageSize,
            keyword: this.state.costCenterItemUserName,
        }
        CCService.getCostCenterItemUsers(params, this.props.match.params.itemId)
            .then((response) => {
                response.data.map((item) => {
                    item.key = item.id;
                });
                pagination.total = Number(response.headers['x-total-count']);
                pagination.current = params.page + 1;
                this.setState({
                    data: response.data,
                    loading: false,
                    pagination
                })
            });
    }
    // -----非编辑状态---start
    //渲染非编辑状态
    renderNoEditing = () => {
        let infoData = this.state.infoData;
        let values = infoData.customFormValues ? infoData.customFormValues : [];

        let dom = [];
        for (let i = 0; i < values.length; i++) {
            dom.push(this.renderContentByMessageKey(values[i]))
        }
        return (
            <div className="info-item-wrap">
                {
                    dom
                }
                <div className="clear"></div>
            </div>
        )
    };
    renderContentByMessageKey = (field) => {
        let messageKey = field.messageKey;
        //值列表
        switch (messageKey) {
            case "cust_list": {
                return this.renderFiled_cust_list(field);
                break;
            }
        }
    }
    //渲染字段的内容，根据情况进行截取，鼠标浮动有提示
    renderNoEditingText = (text) => {
        let _text = fitText(text, 16);
        if (_text.text) {
            return (
                <Tooltip title={_text.origin}>
                    <span>{_text.text}</span>
                </Tooltip>
            )
        } else {
            return (
                text
            )
        }
    }
    //渲染字段的内容，根据情况进行截取，鼠标浮动有提示
    renderFiled_cust_list = (field) => {
        let messageKey = field.messageKey;
        //后端可能返回的是值列表值对应的code（value），不是messageKey，需要找一下
        //参见bug13014
        if (messageKey === "cust_list" &&
            field.customEnumerationList &&
            field.customEnumerationList.values &&
            field.customEnumerationList.values.length &&
            field.customEnumerationList.values.length > 0) {
            let customEnumerationList = field.customEnumerationList.values;
            for (let i = 0; i < customEnumerationList.length; i++) {
                if (field.value === customEnumerationList[i].value) {
                    field.value = customEnumerationList[i].messageKey;
                }
            }
        }
        return (
            <div className="info-item f-left" key={field.fieldOID}>
                <div className="info-item-title">{field.fieldName}</div>
                <div className="info-item-text">
                    {
                        this.renderNoEditingText(field.value)
                    }
                </div>
            </div>
        )
    }

    // -----非编辑状态---end
    //分页点击
    onChangePager = (pagination, filters, sorter) => {
        this.setState({
            pagination: {
                page: pagination.current - 1,
                pageSize: pagination.pageSize
            }
        }, () => {
            this.getUserList();
        })
    };

    //批量添加人员
    costCenterItemAssociateUsersDTO = (arr) => {
        if (arr.length < 1) {
            //请选择人员
            message.warn(this.$t("cost.center.item.detail.please.select"));
            return;
        }
        let userOIDs = [];
        arr.map((item) => {
            userOIDs.push(item.userOID);
        })
        let params = {
            userOIDs: userOIDs,
            costCenterItemOIDs: [this.props.match.params.itemId],
            selectMode: "default",
            costCenterOID: this.props.match.params.id
        }
        CCService.costCenterItemAssociateUsersDTO(params)
            .then((res) => {
                //操作成功
                message.success(this.$t("cost.center.item.detail.success"));
                this.getUserList();
            })
    }

    //批量添加部门
    costCenterItemAssociateDepsDTO = (arr) => {
        if (arr.length < 1) {
            //请选择人员
            message.warn(this.$t("cost.center.item.detail.please.select"));
            return;
        }
        console.log(arr)
        // {"id":部门id,"custDeptNumber":部门编码}
        let params = {
            "costCenterItemId": this.state.infoData.id,
            "departmentDTOs": arr
        }
        CCService.asDepartmentToCostcenteritem(params)
            .then((res) => {
                //操作成功
                message.success(this.$t("cost.center.item.detail.success"));
                this.getDepartmentList();
            })
    }

    //删除人
    removeUserFromCostCenterItemAssociation = (e, record) => {
        CCService.removeUserFromCostCenterItemAssociation(record.userOID, this.props.match.params.itemId)
            .then(res => {
                //操作成功
                this.getUserList();
                message.success(this.$t("cost.center.item.detail.success"))
            })
    }

    //删除部门
    removeDepFromCostCenterItemAssociation = (e, record) => {
        CCService.delDepartmentToCostcenteritem(record.id)
            .then(res => {
                //操作成功
                this.getDepartmentList();
                message.success(this.$t("cost.center.item.detail.success"))
            })
    }

    //返回成本中心
    backToCostCenterDetail = () => {
        // this.context.router.push(this.state.CostCenterDetail.url.replace(':id', this.props.match.params.id));
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/cost-center-detail/${this.props.match.params.id}/${this.props.match.params.setOfBooksId}`,
            })
        );
    }
    //搜索成本中心项的人
    emitEmptyForUser = () => {
        this.userNameInput.focus();
        this.setState({ costCenterItemUserName: '' }, () => {
            this.onChangeCostCenterItemUserName();
        });
    }
    //搜索成本中心项的部门
    emitEmptyForDep = () => {
        this.DepNameInput.focus();
        this.setState({ costCenterItemDepName: '' }, () => {
            this.onChangeCostCenterItemDepName();
        });
    }
    //搜索成本中心项的人
    onChangeCostCenterItemUserName = (e) => {
        let costCenterItemUserName = "";
        if (e) {
            costCenterItemUserName = e.target.value;
        }
        this.setState({
            costCenterItemUserName: costCenterItemUserName,
            loading: true
        }, () => {
            //搜索
            this.getUserList();
        });
    }

    //搜索成本中心项的部门
    onChangeCostCenterItemDepName = (e) => {
        let costCenterItemDepName = "";
        if (e) {
            costCenterItemDepName = e.target.value;
        }
        this.setState({
            costCenterItemDepName: costCenterItemDepName,
            loading: true
        }, () => {
            //搜索
            this.getDepartmentList();
        });
    }

    //渲染部门或者人员选择组件
    renderDepComponents = (key) => {
        if (key === "PERSONADD") {
            return <div>
                {/*批量添加员工*/}
                <SelectDepOrPerson
                    buttonDisabled={!this.props.tenantMode}
                    buttonType={"primary"}
                    title={this.$t("cost.center.item.detail.batchadd")}
                    onlyPerson={true}
                    onConfirm={this.costCenterItemAssociateUsersDTO} />
            </div>
        } else if (key === "DEPARTMENT") {
            return <div>
                {/*添加部门(含子部门)*/}
                <SelectDepOrPerson
                    buttonDisabled={!this.props.tenantMode}
                    buttonType={"primary"}
                    title={this.$t("cost.center.item.detail.batchadd.dep1")}
                    onlyDep={true}
                    onConfirm={this.costCenterItemAssociateDepsDTO} />
            </div>
        }
    }
    //渲染Tabs
    renderTabs = () => {
        const { columns, columnsDep, dataDep, data, loading, pagination, tabs } = this.state;
        const suffix = this.state.costCenterItemUserName ? <Icon type="close-circle" onClick={this.emitEmptyForUser} /> : null;
        const suffixDep = this.state.costCenterItemDepName ? <Icon type="close-circle" onClick={this.emitEmptyForDep} /> : null;
        return (
            tabs.map(tab => {
                if (tab.key === 'PERSONADD') {
                    return <TabPane tab={tab.name} key={tab.key}>
                        <div>
                            <div className="table-header">
                                <div className="table-header-buttons">
                                    <div className="f-left total-title">
                                        {this.$t("common.total", { total: pagination.total })}
                                    </div>
                                    {/* 共total条数据 */}
                                    <div className="table-header-inp f-right">
                                        {/*输入姓名或/工号*/}
                                        <Input
                                            className='cost-center-item-user-name-search'
                                            key={'costCenterItemUserName-search'}
                                            placeholder={this.$t("cost.center.item.detail.inp1")}
                                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            suffix={suffix}
                                            value={this.state.costCenterItemUserName}
                                            onChange={this.onChangeCostCenterItemUserName}
                                            ref={node => this.userNameInput = node}
                                        />
                                    </div>
                                    <div className="clear" ></div>

                                </div>
                            </div>
                            <Table columns={columns}
                                dataSource={data}
                                pagination={pagination}
                                loading={loading}
                                onChange={this.onChangePager}
                                rowKey="id"
                                bordered
                                size="middle" />
                        </div>

                    </TabPane>
                } else if (tab.key === 'DEPARTMENT') {
                    return <TabPane tab={tab.name} key={tab.key}>
                        <div>
                            <div className="table-header">
                                <div className="table-header-buttons">
                                    <div className="f-left total-title">
                                        {this.$t("common.total", { total: pagination.total })}
                                    </div>
                                    {/* 共total条数据 */}
                                    <div className="table-header-inp f-right">
                                        {/*输入部门名称/编码*/}
                                        <Input
                                            className='cost-center-item-user-name-search'
                                            key={'costCenterItemDepName-search'}
                                            placeholder={this.$t("cost.center.item.detail.batchadd.dep2")}
                                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            suffix={suffixDep}
                                            value={this.state.costCenterItemDepName}
                                            onChange={this.onChangeCostCenterItemDepName}
                                            ref={node => this.DepNameInput = node}
                                        />
                                    </div>
                                    <div className="clear" ></div>

                                </div>
                            </div>
                            <Table columns={columnsDep}
                                dataSource={dataDep}
                                pagination={pagination}
                                loading={loading}
                                onChange={this.onChangePager}
                                rowKey="id"
                                bordered
                                size="middle" />
                        </div>


                    </TabPane>
                }

            })
        )
    }
    //点击
    onChangeTabs = (key) => {
        let pagination = this.state.pagination;
        pagination.page = 0;
        pagination.total = 0;
        this.setState({
            nowStatus: key,
            loading: true,
            pagination,
        }, () => {
            this.getList(key);
        })
    };

    render() {
        const { infoList, infoData, nowStatus } = this.state;
        return (
            <div className="cost-center-item-detail">
                <BasicInfo infoList={infoList}
                    infoData={infoData}
                    isHideEditBtn={true}
                />

                <div className="cost-center-extend">
                    <div className="cost-center-extend-title">
                        {/*扩展字段*/}
                        {
                            this.$t("cost.center.item.detail.extend")
                        }
                    </div>
                    {
                        this.renderNoEditing()
                    }
                </div>
                <p></p>
                {infoData.public ? <div></div> : this.renderDepComponents(nowStatus)}
                {infoData.public ? <div></div> : <Tabs onChange={this.onChangeTabs} style={{ marginTop: 20 }}>
                    {this.renderTabs()}
                </Tabs>}

                <a className="back" onClick={this.backToCostCenterDetail}>
                    <Icon type="rollback" style={{ marginRight: '5px' }} />
                    {/*返回*/}
                    {this.$t('common.back')}
                </a>
            </div>
        )
    }

}

function mapStateToProps(state) {
    return {
        profile: state.user.profile,
        user: state.user.currentUser,
        company: state.user.company,
        tenantMode: true,
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CostCenterItemDetail);
