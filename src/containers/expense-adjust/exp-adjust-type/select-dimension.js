import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal,  message, Button, Input, Row, Col } from 'antd'
import Table from 'widget/table'
import SearchArea from 'widget/search-area'
import expAdjustService from 'containers/expense-adjust/exp-adjust-type/exp-adjust-type.service'
import PropTypes from 'prop-types';

class SelectDimension extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchForm: [
              { type: 'input', id: 'code', label: this.$t({ id: 'adjust.dimension.code' }/*维度代码*/) },
              { type: 'input', id: 'name', label: this.$t({ id: 'adjust.dimension.name' }/*维度名称*/) },
            ],
          searchParams: {
            range: 'all'
          },
            columns: [
                { title: this.$t({ id: 'adjust.dimension.code' }/*维度代码*/), dataIndex: 'code' },
                { title: this.$t({ id: 'adjust.dimension.name' }/*维度名称*/), dataIndex: 'name' }
            ],
            selectedData: [],
            pagination: { total: 0 },
            loading: true,
            data: [],
            rowSelection: {
                type: 'checkbox',
                selectedRowKeys: [],
                onChange: this.onSelectChange,
                onSelect: this.onSelectItem,
                onSelectAll: this.onSelectAll
            },
            page: 0,
            size: 10
        }
    }
    //选项改变时的回调，改变selection
    onSelectChange = (selectedRowKeys, selectedRows) => {
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
        let { selectedData } = this.state;
        if (!selected) {
            selectedData.map((selected, index) => {
                if (record['id'] == selected) {
                    selectedData.splice(index, 1);
                }
            });
        } else {
            selectedData.push(record['id']);
        }
        this.setState({ selectedData });
    }
    //全选操作
    onSelectAll = (selected, selectedRows, changeRows) => {
        changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
    }
    //生命周期函数，组件更新时接收到新的props之前执行的
    componentWillReceiveProps = (nextProps) => {
      if (nextProps.visible) {
        this.formRef&&this.formRef.setValues({code:'',name:'',range: 'all'});
        this.setState({ page: 0  }, () => {
          this.getList();
        });
      }else {
        let {searchForm, searchParams} = this.state;
        this.setState({searchForm})
      }
    };
    //调用接口，获取数据
    getList = () => {
        let params = {
            page: this.state.page,
            size: this.state.pageSize,
            setOfBooksId: this.props.params.setOfBooksId,
            code: this.state.searchParams.code,
            name: this.state.searchParams.name
        };
        return expAdjustService.getDimension(params).then(res => {
            this.setState({
                loading: false,
                data: res.data,
                pagination: {
                    total: Number(res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0),
                    onChange: this.onChangePager,
                    current: this.state.page + 1
                }
            },
                () => {
                    this.refreshSelected();
                })
        }).catch(e => {
            message.error(this.$t({ id: 'adjust.getExpenseTypeData.error' }/*获取数据失败，请稍后重试或联系管理员*/));
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
    //获取维度数据的时候，把已经选择过得数据带过来
    refreshSelected = () => {
        const { selectedData, data, rowSelection } = this.state;
        let nowSeletedRowKeys = [];
        this.props.selectedData.map(selected => {
            data.map(item => {
                if (selected == item['id']) {
                    nowSeletedRowKeys.push(item['id']);
                }
            })
        });
        rowSelection.selectedRowKeys = nowSeletedRowKeys;
        this.setState({ rowSelection, selectedData: this.props.selectedData });
    }
    //搜索按钮触发的事件
    search = (params) => {
        this.setState({
            page: 0,
            searchParams: params,
            loading: true
        },
            () => {
                this.getList();
            });
    }
    //清空按钮触发的事件
    clear = () => {
        this.setState({
            page: 0,
            loading: true,
            searchParams: { range: 'all'}
        },
            () => {
                this.getList();
            })
    }
    //确定按钮触发的事件
    handleOk = () => {
        this.props.onOk({
            result: this.state.selectedData,
            type: this.props.type
        })
    }
    //表格的行点击事件
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
    //每个Component组件都有一个render函数，每一个render函数都有一个return
    render() {
        const { visible, onCancel } = this.props;
        const { searchForm, selectedData, pagination, loading, columns, data, rowSelection } = this.state;
        return (
            <Modal title={this.$t({ id: 'adjust.choose.dimension' })/*选择维度*/} visible={visible} onCancel={onCancel} onOk={this.handleOk} width={800} className='list-selector'>
                {searchForm && searchForm.length > 0 ?
                    <SearchArea searchForm={searchForm}
                        submitHandle={this.search}
                        wrappedComponentRef={(inst) => this.formRef = inst}
                        clearHandle={this.clear} /> :
                    null}
                <div className="table-header">
                    <div className="table-header-title">
                        {this.$t({ id: 'common.total' }, { total: pagination.total })}
                        &nbsp;<span>/</span>&nbsp;
                        {this.$t({ id: 'common.total.selected' }, { total: selectedData.length == 0 ? '0' : selectedData.length })}
                    </div>
                </div>
                <Table columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={pagination}
                    rowKey={record => record['id']}
                    bordered
                    size='middle'
                    rowSelection={rowSelection}
                    onRowClick={this.onTableRowClick}
                />
            </Modal>
        )
    }
}

SelectDimension.propTypes = {
    visible: PropTypes.bool,
    extraParams: PropTypes.object,
    selectedData: PropTypes.array,
    onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
    onCancel: PropTypes.func,  //点击取消后的回调
    type: PropTypes.string
}
SelectDimension.defaultProps = {
    extraParams: {}
}
function mapStateToProps() {
    return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(SelectDimension);
