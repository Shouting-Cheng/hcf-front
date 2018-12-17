import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal,  message, Button, Input, Row, Col } from 'antd'
import Table from 'widget/table'
import SearchArea from 'widget/search-area'
import expAdjustService from 'containers/expense-adjust/exp-adjust-type/exp-adjust-type.service'
import PropTypes from 'prop-types';

class SelectExpenseType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchForm: [
              { type: 'input', id: 'code', label: this.$t({ id: 'adjust.expense.type.code' }/*费用类型代码*/) },
              { type: 'input', id: 'name', label: this.$t({ id: 'adjust.expense.type.name' }/*费用类型名称*/) },
              { type: 'select', id: 'range', label: this.$t('common.view'),defaultValue: 'all',
                options:[
                  {label: this.$t('common.all'), value: 'all'},
                  {label: this.$t('common.has.selected'), value: 'selected' },
                  {label: this.$t('adjust.not.selected'), value: 'notChoose' },
                ]
              }
            ],
            searchParams: {
              range: 'all'
            },
            columns: [
                {
                    title: this.$t({ id: 'adjust.expense.type.icon' }/*图标*/), dataIndex: 'iconUrl', render: (value, record) => {
                        return <img width='20' height='20' src={record.iconUrl} />
                    }, width: 100
                },
                { title: this.$t({ id: 'adjust.expense.type.code' }/*费用类型代码*/), dataIndex: 'code' },
                { title: this.$t({ id: 'adjust.expense.type.name' }/*费用类型名称*/), dataIndex: 'name' }
            ],
            pagination: { total: 0 },
            //已经选择的数据项
            selectedData: [],
            data: [],
            loading: true,
            rowSelection: {
                type: 'checkbox',
                selectedRowKeys: [],
                onChange: this.onSelectChange,
                onSelect: this.onSelectItem,
                onSelectAll: this.onSelectAll
            },
            page: 0,
            pageSize: 10
        }
    }
    //选项改变时的回调，改变selection
    onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys);
        console.log(selectedRows);
        let { rowSelection } = this.state;
        rowSelection.selectedRowKeys = selectedRowKeys;
        this.setState({ rowSelection });
    }
    /**
     * 选择单个时的方法，遍历selectedData，根据是否选中进行插入或删除操作
     * @param record 被改变的项
     * @param selected 是否选中
     */
    onSelectItem = (record, selected) => {
        console.log(record['id']);
        let { selectedData } = this.state;
        if (!selected) {
            selectedData.map((selected, index) => {
                if (selected == record['id']) {
                    selectedData.splice(index, 1);
                }
            })
        } else {
            selectedData.push(record['id']);
        }
        this.setState({ selectedData });
    }
    //选择当页全部时的判断
    onSelectAll = (selected, selectedRows, changeRows) => {
        changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
    }
    //获取数据
    getList = () => {
        let searchParams = Object.assign({}, this.state.searchParams, this.props.extraParams);
        console.log(searchParams)
        let model = {
            setOfBooksId: this.props.params.setOfBooksId,
            ...searchParams,
            id: this.props.params.id,
            page: this.state.page,
            size: this.state.pageSize,
            documentType: 801006,
            typeFlag : 1
        };
        model.range = model.range ||'all';
        return expAdjustService.getExpenseType(model).then(res => {
            this.setState({
                data: res.data,
                loading: false,
                pagination: {
                    total: Number(res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0),
                    onChange: this.onChangePager,
                    current: this.state.page + 1
                }
            },
                () => {
                    this.refreshSelected();  //刷新当页选择器
                }
            );
        }).catch(e => {
            message.error(this.$t({id:'adjust.getExpenseTypeData.error'}/*获取数据失败，请稍后重试或联系管理员*/));
            this.setState({ loading: false })
        });
    };
    onChangePager = (page) => {
        if (page - 1 !== this.state.page)
            this.setState({
                page: page - 1,
                loading: true
            }, () => {
                this.getList();
            })
    };
    //根据当前selectedData刷新selection
    refreshSelected = () => {
        let { selectedData, data, rowSelection } = this.state;
        let nowSelectedRowKeys = [];
        this.props.selectedData.map(selected => {
            data.map(item => {
                if (item['id'] == selected) {
                    nowSelectedRowKeys.push(item['id']);
                }
            })
        });
        rowSelection.selectedRowKeys = nowSelectedRowKeys;
        this.setState({ rowSelection, selectedData: this.props.selectedData });
    };
    /**
   * 每次父元素进行setState时调用的操作，判断nextProps内是否有type的变化
   * 如果selectedData有值则代表有默认值传入需要替换本地已选择数组，
   * 如果没有值则需要把本地已选择数组置空
   * @param nextProps 下一阶段的props
   */
    componentWillReceiveProps = (nextProps) => {
        if (nextProps.visible) {
            this.formRef&&this.formRef.setValues({code:'',name:'',range: 'all'})
            this.setState({ page: 0  }, () => {
                this.getList();
            });
        }else {
          let {searchForm, searchParams} = this.state;
          searchForm[2].defaultValue = 'all';
          searchParams.range = 'all';
          this.setState({searchForm})
        }
    };
    //点击搜索按钮事件
    search = (params) => {
        this.setState({
            page: 0,
            searchParams: params,
            loading: true
        },
            () => {
                this.getList();
            })
    }
    //点击清空按钮
    clear = () => {
        let searchParams = {
          range: 'all'
        };
        this.setState({
            page: 0,
            searchParams: searchParams
        }, () => {
            this.getList();
        })
    };
    handleOk = () => {
        this.props.onOk({
            result: this.state.selectedData,
            type: this.props.type
        })
    }
    //Table组件的行点击事件
    onTableRowClick = (record, index) => {
        let { selectedData, rowSelection } = this.state;
        let count = 0;
        selectedData.map((selected, indexx) => {
            if (selected == record['id']) {
                count++;
                selectedData.splice(indexx, 1);
                rowSelection.selectedRowKeys.map((selectedRowKey, indexxx) => {
                    if (selected == selectedRowKey) {
                        rowSelection.selectedRowKeys.splice(indexxx, 1);
                    }
                });
            }
        });
        if (count == 0) {
            selectedData.push(record['id']);
            rowSelection.selectedRowKeys.push(record['id']);
        }
        this.setState({ selectedData: selectedData, rowSelection: rowSelection });
    }
    //每个Component都有的渲染函数
    render() {
        const { visible, onCancel } = this.props;
        const { searchForm, pagination, selectedData, data, loading, rowSelection, columns } = this.state;
        return (
            <Modal title={this.$t({id:'adjust.choose.expense.type'})/*选择费用类型*/} visible={visible} width={800} onOk={this.handleOk} onCancel={onCancel} className='list-selector'>
                {searchForm && searchForm.length > 0
                    ?
                    <SearchArea searchForm={searchForm}
                        submitHandle={this.search}
                        wrappedComponentRef={(inst) => this.formRef = inst}
                        clearHandle={this.clear}>

                    </SearchArea>
                    :
                    null}
                <div className='table-header'>
                    <div className='table-header-title'>
                        {this.$t({ id: 'common.total' }, { total: Number(pagination.total) })}
                        &nbsp;<span>/</span>&nbsp;
                    {this.$t({ id: 'common.total.selected' }, { total: selectedData.length == 0 ? '0' : selectedData.length })}
                    </div>
                </div>
                <Table columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    bordered
                    rowSelection={rowSelection}
                    rowKey={record => record['id']}
                    size='middle'
                    onRow={record => ({ onClick: () => this.onTableRowClick(record) })}
                />
            </Modal>
        )
    }
}
SelectExpenseType.propTypes = {
    visible: PropTypes.bool,
    extraParams: PropTypes.object,
    selectedData: PropTypes.array,
    onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
    onCancel: PropTypes.func,  //点击取消后的回调
    type: PropTypes.string
}
SelectExpenseType.defaultProps = {
    extraParams: {}
}
function mapStateToProps() {
    return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(SelectExpenseType);
