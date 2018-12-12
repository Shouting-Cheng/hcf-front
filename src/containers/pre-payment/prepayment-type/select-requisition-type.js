import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal,  message, Button, Input, Row, Col } from 'antd'
import Table from 'widget/table'
import httpFetch from 'share/httpFetch'
import SearchArea from 'widget/search-area'
import config from 'config'
import prePaymentTypeService from './pre-payment-type.service'
import PropTypes from 'prop-types'

class SelectRequisitionType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            pagination: { total: 0 },
            searchParams: {},
            searchForm: [
                { type: 'input', id: 'companyName', label: this.$t({ id: 'pre.payment.requisition.type.companyName' }/*公司*/) },
                { type: 'input', id: 'formName', label: this.$t({ id: 'pre.payment.requisition.type.name' }/*申请单类型名称*/) },
                {
                    type: 'select', id: 'range', label: '查看',defaultValue:'all',
                    options: [{ value: 'all', label: '全部' }, { value: 'selected', label: '已选' }, { value: 'notChoose', label: '未选' }],
                    labelKey: 'label', valueKey: 'value'
                }
            ],
            columns: [
                { title: this.$t({ id: 'pre.payment.requisition.type.companyName' }/*公司*/), dataIndex: 'companyName' },
                { title: this.$t({ id: 'pre.payment.requisition.type.name' }/*申请单类型名称*/), dataIndex: 'formName' }
            ],
            data: [],
            rowSelection: {
                type: 'checkbox',
                selectedRowKeys: [],
                onChange: this.onChangeSelect,
                onSelect: this.onSelectItem,
                onSelectAll: this.onSelectAll
            },
            selectedData: [],
            page: 0,
            pageSize: 10
        };
    }
    //选项中发生变化时回调
    onChangeSelect = (selectedRowKeys, selectedRows) => {
        let { rowSelection } = this.state;
        rowSelection.selectedRowKeys = selectedRowKeys;
        this.setState({ rowSelection });
    }
    //用户手动选择/取消选择某列的回调
    onSelectItem = (record, selected, selectedRows) => {
        let { selectedData } = this.state;
        if (!selected) {
            selectedData.map((item, index) => {
                if (item == record['id']) {
                    selectedData.splice(index, 1);
                }
            });
        } else {
            selectedData.push(record['id']);
        }
        this.setState({ selectedData: selectedData });
    }
    //用户手动选择/取消选择所有列的回调
    onSelectAll = (selected, selectedRows, changeRows) => {
        changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
    }
    //获取申请类型数据
    getList = () => {
        let searchParams = Object.assign({}, this.state.searchParams, this.props.extraParams);
        let params = {
            setOfBookId: this.props.params.setOfBookId,
            range: searchParams.range ? searchParams.range : 'all',
            idList: [],
            page: this.state.page,
            size: this.state.pageSize,
            companyName: searchParams.companyName,
            formName: searchParams.formName,
            payRequisitionTypeId: this.props.params.payRequisitionTypeId
        };
        prePaymentTypeService.getRequisitionType(params).then(res => {
            this.setState({
                loading: false,
                data: res.data,
                pagination: {
                    total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
                    onChange: this.onChangePager,
                    current: this.state.page + 1
                }
            },
                () => {
                    this.refreshSelected();
                });
        });
    };
    refreshSelected = () => {
        let { selectedData, data, rowSelection } = this.state;
        let nowselectedRowKeys = [];
        this.props.selectedData.map(item => {
            data.map(record => {
                if (item == record['id']) {
                    nowselectedRowKeys.push(record['id']);
                }
            });
        });
        rowSelection.selectedRowKeys = nowselectedRowKeys;
        this.setState({ rowSelection, selectedData: this.props.selectedData });
    }
    componentWillReceiveProps = (nextProps) => {
        if (nextProps.visible) {
            this.formRef&&this.formRef.setValues({classCode:'', description: '',range:'all'})
            this.setState({
                page: 0,
                searchParams: {
                    range:'all'
                },
                loading: true
            }, () => {
                this.getList();
            })
        }
    }
    //分页点击
    onChangePager = (page) => {
        if (page - 1 !== this.state.page)
            this.setState({
                page: page - 1,
                loading: true
            }, () => {
                this.getList();
            })
    };
    //搜索
    search = (params) => {
        console.log(this.state.searchForm)
        this.setState({
            loading: true,
            page: 0,
            searchParams: params
        },
            () => {
                this.getList();
            })
    };
    clear = () => {
        this.setState({
            page: 0,
            loading: true,
            searchParams: {}
        },
            () => {
                this.getList();
            });
    };
    handleOk = () => {
        this.props.onOk({ record: this.state.selectedData, type: this.props.type });
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
    render() {
        const { visible, onCancel } = this.props;
        const { loading, pagination, searchForm, columns, rowSelection, selectedData, data } = this.state;
        return (
            <Modal title={this.$t({ id: 'pre.payment.choose.requisition.type' }/*选择申请类型*/)} visible={visible} onOk={this.handleOk} width={800} className='list-selector' onCancel={onCancel}>
                {searchForm && searchForm.length ?
                    <SearchArea searchForm={searchForm}
                        wrappedComponentRef={(inst) => this.formRef = inst}
                        submitHandle={this.search}
                        clearHandle={this.clear} /> :
                    null}
                <div className='table-header'>
                    <div className='table-header-title'>
                        {this.$t({ id: 'common.total' }, { total: pagination.total })}
                        {this.state.searchParams.range === 'all' || !this.state.searchParams.range
                            ?
                            <div style={{ display: 'inline' }}>
                                &nbsp;&nbsp;<span>/</span>&nbsp;&nbsp;
                        {this.$t({ id: 'common.total.selected' }, { total: selectedData.length ? selectedData.length : '0' })}
                            </div>
                            :
                            null
                        }
                    </div>
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={record => record['id']}
                    pagination={pagination}
                    loading={loading}
                    bordered
                    size='middle'
                    rowSelection={rowSelection}
                    onRowClick={this.onTableRowClick} />
            </Modal>
        )
    }
}
SelectRequisitionType.propTypes = {
    visible: PropTypes.bool,
    extraParams: PropTypes.object,
    selectedData: PropTypes.array,
    onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
    onCancel: PropTypes.func,  //点击取消后的回调
    type: PropTypes.string
}
SelectRequisitionType.defaultProps = {
    extraParams: {}
}
function mapStateToProps() {
    return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(SelectRequisitionType);
