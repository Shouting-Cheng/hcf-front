import React from 'react'
import { connect } from 'dva'

import { Button, Table, Badge, notification, Popover, Popconfirm, message } from 'antd';
import SearchArea from 'components/Widget/search-area';
import 'styles/setting/department-group/department-group.scss';
import deptGroupService from 'containers/setting/department-group/department-group.service'

import { routerRedux } from 'dva/router';

class DepartmentGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            searchParams: {
                deptGroupCode: "",
                description: ""
            },
            pagination: {
                current: 1,
                page: 0,
                total: 0,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
            },
            searchForm: [
                { type: 'input', id: 'deptGroupCode', label: this.$t({ id: 'setting.deptGroup.code' }) }, /*部门组代码*/
                { type: 'input', id: 'description', label: this.$t({ id: 'setting.deptGroup.name' }) }, /*部门组名称*/
            ],
            columns: [
                {          /*部门组代码*/
                    title: this.$t({ id: 'setting.deptGroup.code' }), key: "deptGroupCode", dataIndex: 'deptGroupCode'
                },
                {          /*部门组名称*/
                    title: this.$t({ id: 'setting.deptGroup.name' }), key: "description", dataIndex: 'description'
                },

                {           /*状态*/
                    title: this.$t({ id: 'common.column.status' }),
                    key: 'status',
                    width: '10%',
                    dataIndex: 'enabled',
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={enabled ? this.$t({ id: 'common.status.enable' }) : this.$t({ id: 'common.status.disable' })} />
                    )
                }
            ],
        }
    }

    componentWillMount() {
        this.getList();
    }

    //获取部门组数据
    getList() {
        this.setState({ loading: true });
        const { searchParams, pagination } = this.state;
        let params = Object.assign({}, this.state.searchParams);
        params.page = pagination.page;
        params.size = pagination.pageSize;
        deptGroupService.getDeptGroupByOptions(params).then((response) => {
            response.data.map((item, index) => {
                item.key = item.id;
            });
            let pagination = this.state.pagination;
            pagination.total = Number(response.headers['x-total-count']);
            this.setState({
                data: response.data,
                pagination,
                loading: false
            })
        })
    };

    handleSearch = (values) => {
        let searchParams = {
            deptGroupCode: !values.deptGroupCode ? "" : values.deptGroupCode,
            description: !values.description ? "" : values.description
        };
        let pagination = this.state.pagination;
        pagination.page = 0;
        pagination.pageSize = 10;
        pagination.current = 1;
        this.setState({
            searchParams,
            pagination,
            loading: true,
            page: 1
        }, () => {
            this.getList();
        })
    };

    //分页点击
    onChangePager = (pagination, filters, sorter) => {
        this.setState({
            pagination: {
                current: pagination.current,
                page: pagination.current - 1,
                pageSize: pagination.pageSize,
                total: pagination.total
            }
        }, () => {
            this.getList();
        })
    };

    //新建部门组
    handleCreate = () => {
        // this.context.router.push(menuRoute.getMenuItemByAttr('department-group', 'key').children.newDepartmentGroup.url);

        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/department-group/new-department-group`,
            })
        );

    };

    //点击行，进入该行详情页面
    handleRowClick = (record, index, event) => {
        // this.context.router.push(menuRoute.getMenuItemByAttr('department-group', 'key').children.departmentGroupDetail.url.replace(':id',record.id));

        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/department-group/department-group-detail/${record.id}`,
            })
        );

    };

    render() {

        const { searchForm, loading, data, columns, pagination } = this.state;
        return (
            <div className="budget-structure">
                <SearchArea searchForm={searchForm} submitHandle={this.handleSearch} clearHandle={() => { }} />
                <div className="table-header">
                    <div className="table-header-title">{this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}</div>  {/*共搜索到*条数据*/}
                    <div className="table-header-buttons">
                        <Button type="primary" onClick={this.handleCreate}>{this.$t({ id: 'common.create' })}</Button>  {/*新 建*/}
                    </div>
                </div>
                <Table
                    loading={loading}
                    dataSource={data}
                    columns={columns}
                    pagination={pagination}
                    onChange={this.onChangePager}
                    onRow={record => ({
                        onClick: () => this.handleRowClick(record)
                    })}
                    size="middle"
                    bordered />
            </div>
        )
    }

}

function mapStateToProps(state) {
    return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(DepartmentGroup);
