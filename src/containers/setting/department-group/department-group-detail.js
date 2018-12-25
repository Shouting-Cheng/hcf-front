import React from 'react';
import { connect } from 'dva'

import config from 'config'

import { Form, Button, Select, Checkbox, Input, Switch, Icon, Alert, Tabs,message, Popconfirm } from 'antd'
import Table from 'widget/table'
import ListSelector from 'components/Widget/list-selector'
import BasicInfo from 'components/Widget/basic-info'
import 'styles/setting/department-group/department-group-detail.scss';
import deptGroupService from 'containers/setting/department-group/department-group.service'

import { routerRedux } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

class DepartmentGroupDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            batchDelete: true,
            buttonLoading: false,
            deptListSelector: false,  //控制部门选则弹框
            deptGroup: {},
            data: [],
            edit: false,
            selectedRowKeys: [],
            selectedEntityOids: [],   //已选择的列表项的Oids
            pagination: {
                current: 1,
                page: 0,
                total: 0,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
            },
            infoList: [
                { type: 'input', id: 'deptGroupCode', isRequired: true, disabled: true, label: this.$t({ id: 'setting.deptGroup.code' }) + " :" },
                { type: 'input', id: 'description', language: true, isRequired: true, disabled: false, label: this.$t({ id: 'setting.deptGroup.name' }) + " :" },
                { type: 'switch', id: 'enabled', label: this.$t({ id: 'common.column.status' }) + " :"/*状态*/ },
            ],
            deptSelectorItem: {
                title: this.$t({ id: 'setting.dept' }),
                url: `${config.baseUrl}/api/DepartmentGroup/selectDepartmentByGroupCodeAndDescription`,
                searchForm: [
                    { type: 'input', id: 'deptGroupCode', label: this.$t({ id: 'setting.deptCode' }), defaultValue: '' },
                    { type: 'input', id: 'description', label: this.$t({ id: 'setting.deptName' }), defaultValue: '' },
                ],
                columns: [
                    { title: this.$t({ id: 'setting.deptCode' }), dataIndex: 'custDeptNumber' },
                    { title: this.$t({ id: 'setting.deptName' }), dataIndex: 'name' }
                ],
                key: 'departmentId'
            },
            columns: [
                { title: this.$t({ id: 'setting.deptCode' }), key: 'custDeptNumber', dataIndex: 'custDeptNumber' },/*部门代码代码*/
                { title: this.$t({ id: 'setting.deptName' }), key: 'name', dataIndex: 'name' }, /*部门明称*/
                {
                    title: this.$t({ id: 'common.operation' }), key: 'operation', width: '15%', render: (text, record) => (
                        <span>
                            <Popconfirm onConfirm={(e) => this.deleteItem(e, record)} title={this.$t({ id: 'budget.are.you.sure.to.delete.rule' }, { controlRule: record.controlRuleName })}>{/* 你确定要删除organizationName吗 */}
                                <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>{this.$t({ id: 'common.delete' })}</a>
                            </Popconfirm>
                        </span>)
                },  //操作
            ],
        }
    }

    deleteItem = (e, record) => {
        this.setState({ loading: true });
        let param = [];
        typeof record === 'undefined' ? param = this.state.selectedEntityOids : param.push(record.departmentDetailId);
        console.log(param);
        deptGroupService.deleteDeptGroupById(param).then(response => {

            if (typeof record !== 'undefined') {
                message.success(this.$t({ id: 'common.delete.success' }, { name: record.name })); // name删除成功
            }
            this.setState({
                selectedRowKeys: [],
                selectedEntityOids: [],
                batchDelete: true
            }, this.getList());

        }).catch((e) => {
            if (e.response) {
                message.error(`${this.$t({ id: 'common.operate.filed' })},${e.response.data.message}`)
            }
        })
    };

    componentWillMount() {
        deptGroupService.getDeptGroupById(this.props.match.params.id).then((response) => {
            if (response.status === 200) {
                this.setState({
                    deptGroup: response.data
                })
            }
        });
        this.getList();
    }


    //保存所做的详情修改
    handleUpdate = (value) => {
      console.log(value)
        value.id = this.props.match.params.id;
        deptGroupService.addOrUpdateDeptGroup(value).then((response) => {
            if (response) {
                message.success(this.$t({ id: 'structure.saveSuccess' })); /*保存成功！*/
                this.setState({
                    deptGroup: response.data,
                    edit: true
                })
            }
        }).catch((e) => {
            if (e.response) {
                message.error(this.$t({ id: 'common.operate.filed' }), `${e.response.data.message}`)
            }
        })
    };

    //查询部门组详情
    getList() {
        let params = {};
        params.departmentGroupId = this.props.match.params.id;
        deptGroupService.getDeptGroupInfo(params).then((response) => {
            if (response.status === 200) {
                response.data.map((item) => {
                    item.key = item.departmentDetailId
                });
                let pagination = this.state.pagination;
                pagination.total = Number(response.headers['x-total-count']);
                this.setState({
                    loading: false,
                    data: response.data,
                    pagination
                }, () => {
                    this.refreshRowSelection()
                })
            }
        })
    }


    //控制是否编辑
    handleEdit = (flag) => {
        this.setState({ edit: flag })
    };

    //控制是否弹出部门列表
    showListSelector = (flag) => {
        this.setState({
            deptListSelector: flag
        })
    };

    //点击弹框ok，保存部门
    handleListOk = (result) => {
        let param = [];
        result.result.map((item) => {
            param.push({ departmentGroupId: this.props.match.params.id, departmentId: item.departmentId })
        });
        deptGroupService.addDept(param).then((response) => {
            if (response.status === 200) {
                this.setState({
                    loading: true,
                    deptListSelector: false
                }, this.getList)
            }
        });
    };

    //返回部门组
    handleBack = () => {
        // this.context.router.push(menuRoute.getMenuItemByAttr('department-group', 'key').url);

        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/department-group`,
            })
        );

    };

    //列表选择更改
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    //选择一行
    //选择逻辑：每一项设置selected属性，如果为true则为选中
    //同时维护selectedEntityOids列表，记录已选择的Oid，并每次分页、选择的时候根据该列表来刷新选择项
    onSelectRow = (record, selected) => {
        let temp = this.state.selectedEntityOids;
        if (selected)
            temp.push(record.departmentDetailId);
        else
            temp.delete(record.departmentDetailId);
        this.setState({
            selectedEntityOids: temp,
            batchDelete: temp.length > 0 ? false : true
        })
    };

    //全选
    onSelectAllRow = (selected) => {
        let temp = this.state.selectedEntityOids;
        if (selected) {
            this.state.data.map(item => {
                temp.addIfNotExist(item.departmentDetailId)
            })
        } else {
            this.state.data.map(item => {
                temp.delete(item.departmentDetailId)
            })
        }
        this.setState({
            selectedEntityOids: temp,
            batchDelete: temp.length > 0 ? false : true
        })
    };

    //换页后根据Oids刷新选择框
    refreshRowSelection() {
        let selectedRowKeys = [];
        this.state.selectedEntityOids.map(selectedEntityOid => {
            this.state.data.map((item, index) => {
                if (item.departmentDetailId === selectedEntityOid)
                    selectedRowKeys.push(index);
            })
        });
        this.setState({ selectedRowKeys });
    }

    //清空选择框
    clearRowSelection() {
        this.setState({ selectedEntityOids: [], selectedRowKeys: [] });
    }

    //分页点击
    onChangePager = (pagination, filters, sorter) => {
        let temp = this.state.pagination;
        temp.page = pagination.current - 1;
        temp.current = pagination.current;
        temp.pageSize = pagination.pageSize;
        this.setState({
            pagination: temp
        }, () => {
            this.getList();
        })
    };

    render() {
        const { edit, batchDelete, pagination, columns, data, infoList, deptGroup, deptSelectorItem, deptListSelector, selectedRowKeys } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            onSelect: this.onSelectRow,
            onSelectAll: this.onSelectAllRow
        };

        return (
            <div style={{ paddingBottom: 20 }} className="budget-item-detail">
                <BasicInfo
                    infoList={infoList}
                    infoData={deptGroup}
                    updateHandle={this.handleUpdate}
                    updateState={edit} />
                <div className="table-header">
                    <div className="table-header-title">{this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}</div>  {/*共搜索到*条数据*/}
                    <div className="table-header-buttons">
                        <Button type="primary" onClick={() => this.showListSelector(true)}>{this.$t({ id: 'common.add' })}</Button>  {/*添加公司*/}
                        <Button disabled={batchDelete} onClick={this.deleteItem}>{this.$t({ id: 'common.delete' })}</Button>
                    </div>
                </div>
                <Table
                    dataSource={data}
                    columns={columns}
                    onChange={this.onChangePager}
                    rowSelection={rowSelection}
                    pagination={pagination}
                    size="middle"
                    bordered />
                <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}><Icon type="rollback" style={{ marginRight: '5px' }} />{this.$t({ id: 'common.back' })}</a>

                <ListSelector type="company_item"
                    visible={deptListSelector}
                    onOk={this.handleListOk}
                    selectorItem={deptSelectorItem}
                    extraParams={{ departmentGroupId: this.props.match.params.id }}
                    onCancel={() => this.showListSelector(false)} />
            </div>)
    }
}

function mapStateToProps(state) {
    return {}
}

const WrappedDepartmentGroupDetail = Form.create()(DepartmentGroupDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedDepartmentGroupDetail);

