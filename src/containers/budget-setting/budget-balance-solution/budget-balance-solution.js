import {messages} from "share/common";
import React, { Component } from 'react'
import { connect } from 'dva'
import menuRoute from 'routes/menuRoute'
import config from 'config'
import SearchArea from 'components/search-area'
import baseService from 'share/base.service'
import { Button, Table, Badge, Divider, message } from 'antd'
import { format } from 'util'
import budgetBalanceSolutionService from 'containers/budget-setting/budget-balance-solution/budget-balance-solution.service'

class BudgetBalanceSolution extends Component {
    /**
     * 构造函数
     */
    constructor(props) {
        super(props);
        this.state =
            {
                searchForm: [
                    {
                        type: 'select', id: 'setOfBooksId', label: messages('budget.balance.set.of.books'), options: [], isRequired: 'true',
                        labelKey: 'name', valueKey: 'id', defaultValue: Number(this.props.params.setOfBooksId) ? this.props.params.setOfBooksId : this.props.company.setOfBooksId,
                        event: 'SETOFBOOKSID'
                    },
                    { type: 'input', id: 'conditionCode', label: messages('budget.balance.condition.code') },
                    { type: 'input', id: 'conditionName', label: messages('budget.balance.condition.name') }
                ],
                setOfBooksId: Number(this.props.params.setOfBooksId) ? this.props.params.setOfBooksId : this.props.company.setOfBooksId,
                pagination: {
                    total: 0
                },
                columns: [
                    { title: messages('budget.balance.condition.code'), dataIndex: 'conditionCode', width: '25%' },
                    { title: messages('budget.balance.condition.name'), dataIndex: 'conditionName', width: '25%' },
                    {
                        title: messages('common.column.status'), dataIndex: 'enabled', width: '25%', render: (text) => {
                            return (
                                <Badge status={text ? 'success' : 'error'} text={text ? messages('common.status.enable') : messages('common.status.disable')}/>
                            )
                        }
                    },
                    {
                        title: messages('common.operation'), dataIndex: 'operation', width: '25%', render: (text, record, index) => {
                            return (
                                <div>
                                    <a onClick={e => this.onEditClick(e, record)}>{messages('common.edit')}</a>
                                    <Divider type='vertical' />
                                    <a onClick={e => this.onDeleteClick(e, record)}>{messages('common.delete')}</a>
                                </div>
                            )
                        }
                    }
                ],
                data: [],
                loading: true,
                //新建预算余额查询方案
                newBudgetBalanceSolution: menuRoute.getRouteItem('new-budget-balance-solution', 'key'),
                page: 0,
                pageSize: 10,
                searchParam: {
                    conditionCode: '',
                    conditionName: ''
                }
            };
    }
    /**
     * 点击编辑按钮
     */
    onEditClick = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        this.context.router.push(this.state.newBudgetBalanceSolution.url.replace(':setOfBooksId', this.state.setOfBooksId).replace(':id', record.id));
    }
    /**
     * 删除某一行数据
     */
    onDeleteClick = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        budgetBalanceSolutionService.deleteBudgetBalanceSolution(record.id).then(res => {
            if (res.status === 200) {
                message.success(messages('common.delete.success',{name:''}));
                this.getList();
            }
        }).catch(e => {
            if (e.response) {
                message.error(`${messages('common.operate.filed')}:${e.response.data.message}`);
            }
        });
    }
    /**
     * 生命周期函数constructor之后render之前加载
     */
    componentWillMount = () => {
        this.getCompanyList();
        this.getList();
    }
    /**
     * 获取预算余额查询方案list
     */
    getList = () => {
        let params = {
            page: this.state.page,
            size: this.state.pageSize,
            conditionCode: this.state.searchParam.conditionCode,
            conditionName: this.state.searchParam.conditionName
        };
        budgetBalanceSolutionService.getBudgetBalanceSolution(this.state.setOfBooksId, params).then(res => {
            this.setState({
                loading: false,
                data: res.data,
                pagination: {
                    total: Number(res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0),
                    onChange: this.onChangePaper,
                    current: this.state.page + 1
                }
            });
        });
    }
    /**
     * 切换分页
     */
    onChangePaper = (page) => {
        if (page - 1 !== this.state.page) {
            this.setState(
                {
                    page: page - 1,
                    loading: true,
                },
                () => {
                    this.getList();
                })
        }
    };
    /**
     * 获取账套列表
    */
    getCompanyList = () => {
        baseService.getSetOfBooksByTenant().then(res => {
            let list = [];
            res.data.map(item => {
                list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
            });
            let form = this.state.searchForm;
            form[0].options = list;
            this.setState({ searchForm: form });
        });
    }
    /**
     * 新建按钮
     */
    handleCreate = () => {
        this.context.router.push(this.state.newBudgetBalanceSolution.url.replace(':setOfBooksId', this.state.setOfBooksId));
    }
    /**
     * searchArea组件的事件
     */
    searchEventHandle = (event, value) => {
        if (event == 'SETOFBOOKSID') {
            this.setState({
                page: 0,
                setOfBooksId: value
            },
                () => {
                    this.getList();
                });
        }
    }
    /**
     * 查询按钮
     */
    searh = (values) => {
        this.setState({
            page: 0,
            searchParam: values
        },
            () => {
                this.getList();
            });
    }
    /**
     * 清空按钮
     */
    clear = () => {
        this.setState({
            page: 0,
            setOfBooksId: this.props.company.setOfBooksId
        },
            () => {
                this.getList();
            });
    }
    /**
     * 渲染函数
     */
    render() {

        const { searchForm, pagination, columns, data, loading } = this.state;
        return (
            <div>
                <SearchArea searchForm={searchForm}
                    eventHandle={this.searchEventHandle}
                    submitHandle={this.searh}
                    clearHandle={this.clear} />
                <div className='table-header'>
                    <div className='table-header-title'>
                        {messages('common.total', { total: Number(pagination.total) == 0 ? '0' : Number(pagination.total) })}
                    </div>
                    <div className='table-header-buttons'>
                        <Button type='primary' onClick={this.handleCreate}>{messages('common.create')}</Button>
                    </div>
                </div>
                <Table columns={columns}
                    loading={loading}
                    dataSource={data}
                    size='middle'
                    bordered
                    pagination={pagination}
                    rowKey={record => record['id']} />
            </div>
        )
    }

}
/**
 * router
 */
BudgetBalanceSolution.contextTypes = {
    router: React.PropTypes.object
};
/**
 * redux
 */
function mapStateToProps(state) {
    return {
        company: state.login.company
    }
}
export default connect(mapStateToProps, null, null, { withRef: true })(BudgetBalanceSolution);

