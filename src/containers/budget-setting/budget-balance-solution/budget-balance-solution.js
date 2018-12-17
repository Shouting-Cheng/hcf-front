import React, { Component } from 'react'
import { connect } from 'dva'
import SearchArea from 'widget/search-area'
import baseService from 'share/base.service'
import { Button,  Badge, Divider, message } from 'antd'
import Table from 'widget/table'
import budgetBalanceSolutionService from 'containers/budget-setting/budget-balance-solution/budget-balance-solution.service'
import { routerRedux } from 'dva/router';

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
                        type: 'select', id: 'setOfBooksId', label: this.$t('budget.balance.set.of.books'), options: [], isRequired: 'true',
                        labelKey: 'name', valueKey: 'id', defaultValue: Number(this.props.match.params.setOfBooksId) ? this.props.match.params.setOfBooksId : this.props.company.setOfBooksId,
                        event: 'SETOFBOOKSID'
                    },
                    { type: 'input', id: 'conditionCode', label: this.$t('budget.balance.condition.code') },
                    { type: 'input', id: 'conditionName', label: this.$t('budget.balance.condition.name') }
                ],
                setOfBooksId: Number(this.props.match.params.setOfBooksId) ? this.props.match.params.setOfBooksId : this.props.company.setOfBooksId,
                pagination: {
                    total: 0
                },
                columns: [
                    { title: this.$t('budget.balance.condition.code'), dataIndex: 'conditionCode', width: '25%' },
                    { title: this.$t('budget.balance.condition.name'), dataIndex: 'conditionName', width: '25%' },
                    {
                        title: this.$t('common.column.status'), dataIndex: 'enabled', width: '25%', render: (text) => {
                            return (
                                <Badge status={text ? 'success' : 'error'} text={text ? this.$t('common.status.enable') : this.$t('common.status.disable')}/>
                            )
                        }
                    },
                    {
                        title: this.$t('common.operation'), dataIndex: 'operation', width: '25%', render: (text, record, index) => {
                            return (
                                <div>
                                    <a onClick={e => this.onEditClick(e, record)}>{this.$t('common.edit')}</a>
                                    <Divider type='vertical' />
                                    <a onClick={e => this.onDeleteClick(e, record)}>{this.$t('common.delete')}</a>
                                </div>
                            )
                        }
                    }
                ],
                data: [],
                loading: true,
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
      this.props.dispatch(
        routerRedux.replace({
          pathname: '/budget-setting/budget-balance-solution/new-budget-balance-solution/:setOfBooksId/:id'
            .replace(':setOfBooksId', this.state.setOfBooksId)
            .replace(':id', record.id)
        })
      );
    }
    /**
     * 删除某一行数据
     */
    onDeleteClick = (e, record) => {
        e.preventDefault();
        e.stopPropagation();
        budgetBalanceSolutionService.deleteBudgetBalanceSolution(record.id).then(res => {
            if (res.status === 200) {
                message.success(this.$t('common.delete.success',{name:''}));
                this.getList();
            }
        }).catch(e => {
            if (e.response) {
                message.error(`${this.$t('common.operate.filed')}:${e.response.data.message}`);
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
      this.props.dispatch(
        routerRedux.replace({
          pathname: '/budget-setting/budget-balance-solution/new-budget-balance-solution/:setOfBooksId/:id'
            .replace(':setOfBooksId', this.state.setOfBooksId)
        })
      );
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
                        {this.$t('common.total', { total: Number(pagination.total) == 0 ? '0' : Number(pagination.total) })}
                    </div>
                    <div className='table-header-buttons'>
                        <Button type='primary' onClick={this.handleCreate}>{this.$t('common.create')}</Button>
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
 * redux
 */
function mapStateToProps(state) {
    return {
        company: state.user.company
    }
}
export default connect(mapStateToProps, null, null, { withRef: true })(BudgetBalanceSolution);

