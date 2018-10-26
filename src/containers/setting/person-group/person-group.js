/**
 * Created by zhouli on 18/1/17
 * Email li.zhou@huilianyi.com
 */
import React from 'react';

import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import { Button, Table, Badge } from 'antd';
import SearchArea from 'widget/search-area.js';
import 'styles/setting/person-group/person-group.scss';
import PGService from 'containers/setting/person-group/person-group.service';


class PersonGroup extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            searchParams: {
                personGroupName: ""
            },
            pagination: {
                page: 0,
                total: 0,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
            },
            searchForm: [
                /*人员组名称*/
                { type: 'input', id: 'personGroupName', defaultValue: "", label: this.$t({ id: 'setting.personGroupName' }) },
            ],
            columns: [
                {
                    /*人员组代码*/
                    title: this.$t({ id: 'person.group.code' }), key: "code", dataIndex: 'code'
                },
                {
                    /*人员组名称*/
                    title: this.$t({ id: 'person.group.name' }), key: "name", dataIndex: 'name'
                },
                {
                    /*描述*/
                    title: this.$t({ id: 'person.group.desc' }), key: "comment", dataIndex: 'comment'
                },
                {
                    /*状态*/
                    title: this.$t({ id: 'common.column.status' }),
                    key: 'status',
                    width: '10%',
                    dataIndex: 'enabled',
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={
                                enabled ? this.$t({ id: 'common.status.enable' }) : this.$t({ id: 'common.status.disable' })
                            } />
                    )
                },
                {
                    title: this.$t({ id: 'common.operation' }),//"操作",
                    dataIndex: "id",
                    key: "id",
                    render: (text, record) => (
                        <span>
                            <a onClick={(e) => this.editItemUserGroup(record)}>
                                {/*编辑*/}
                                {this.$t({ id: 'common.edit' })}
                            </a>
                            &nbsp;&nbsp;&nbsp;
              <a onClick={(e) => this.handleRowClick(record)}>
                                {/*详情*/}
                                {this.$t({ id: 'common.detail' })}
                            </a>
                        </span>)
                }
            ],
        };
    }

    componentDidMount() {
        this.getList();
    }

    //获取人员组数据
    getList() {
        let searchParams = this.state.searchParams;
        let pagination = this.state.pagination;

        let params = {
            name: searchParams.personGroupName,
            page: this.state.pagination.page,
            size: this.state.pagination.pageSize
        }
        PGService.getPersonGroupList(params)
            .then((data) => {
                pagination.total = data.total;
                this.setState({
                    data: data.data,
                    pagination: pagination,
                    loading: false
                })
            })
            .catch((err) => {
                this.setState({
                    loading: false
                })
            });
    };

    // 点击搜索
    handleSearch = (values) => {
        this.setState({
            searchParams: values,
            loading: true,
        }, () => {
            this.getList();
        })
    };

    // 分页点击
    onChangePager = (pagination) => {
        this.setState({
            pagination: {
                page: pagination.current - 1,
                pageSize: pagination.pageSize,
                total: pagination.total
            }
        }, () => {
            this.getList();
        })
    };

    // 点击行，进入该行详情页面
    handleRowClick = (record) => {
        // this.context.router.push(menuRoute.getMenuItemByAttr('person-group', 'key')
        //     .children.personGroupDetail.url.replace(':id', record.userGroupOID));

        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/person-group/person-group-detail/${record.userGroupOID}`,
            })
        );
    };
    // 新建人员组
    handleCreate = () => {
        // this.context.router.push(menuRoute.getMenuItemByAttr('person-group', 'key').children.newPersonGroup.url);

        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/person-group/new-person-group`,
            })
        );
    };
    //编辑人员组
    editItemUserGroup = (record) => {
        // this.context.router.push(menuRoute.getMenuItemByAttr('person-group', 'key')
        //     .children.editPersonGroup.url.replace(':id', record.userGroupOID));

        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/person-group/edit-person-group/${record.userGroupOID}`,
            })
        );
    };

    render() {

        const { searchForm, loading, data, columns, pagination } = this.state;
        return (
            <div className="budget-structure">
                <SearchArea searchForm={searchForm} submitHandle={this.handleSearch} />
                <div className="table-header">
                    <div className="table-header-title">
                        {this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}
                    </div>
                    <div className="table-header-buttons">
                        {/*新建*/}
                        <Button type="primary" onClick={this.handleCreate}>
                            {this.$t({ id: 'common.create' })}
                        </Button>
                    </div>
                </div>
                <Table
                    rowKey={record => record.id}
                    loading={loading}
                    dataSource={data}
                    columns={columns}
                    pagination={pagination}
                    onChange={this.onChangePager}
                    size="middle"
                    bordered />
            </div>
        );
    }
}

export default connect()(PersonGroup);
