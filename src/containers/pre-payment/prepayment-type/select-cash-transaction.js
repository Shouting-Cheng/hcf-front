/**
 * Created By ZaraNengap on 2017/09/21
 */
import React from 'react';
import { connect } from 'dva'
import { Modal, message, Button, Input, Row, Col } from 'antd'
import Table from 'widget/table'
import httpFetch from 'share/httpFetch'
import SearchArea from 'widget/search-area'
import 'styles/pre-payment/my-pre-payment/select-contract.scss'
import config from 'config'
import PrePaymentTypeService from './pre-payment-type.service'
import PropTypes from 'prop-types'

class SelectContract extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            page: 0,
            pageSize: 10,
            pagination: {
                total: 0
            },
            selectedData: [],  //已经选择的数据项
            selectorItem: {},  //当前的选择器类型数据项, 包含url、searchForm、columns
            searchParams: {},  //搜索需要的参数
            rowSelection: {
                type: 'checkbox',
                selectedRowKeys: [],
                onChange: this.onSelectChange,
                onSelect: this.onSelectItem,
                onSelectAll: this.onSelectAll
            },
            searchForm: [
                { type: 'input', id: 'classCode', label: this.$t({ id: 'pre.payment.cash.transaction.class.code' }/*现金事务分类代码*/) },
                { type: 'input', id: 'description', label: this.$t({ id: 'pre.payment.cash.transaction.class.name' }/*现金事务分类名称*/) },
                {
                    type: 'select', id: 'range', label: '查看',defaultValue:'all',
                    options: [{ value: 'all', label: '全部' }, { value: 'selected', label: '已选' }, { value: 'notChoose', label: '未选' }],
                    labelKey: 'label', valueKey: 'value'
                }
            ],
            columns: [
                { title: this.$t({ id: 'pre.payment.cash.transaction.class.code' }/*现金事务分类代码*/), dataIndex: 'classCode' },
                { title: this.$t({ id: 'pre.payment.cash.transaction.class.name' }/*现金事务分类名称*/), dataIndex: 'description' },
            ],
        };
    }
    search = (params) => {
        this.setState({
            page: 0,
            searchParams: params,
            loading: true
        }, () => {
            this.getList();
        })
    };

    clear = () => {
        let searchParams = {};
        this.setState({
            page: 0,
            searchParams: searchParams
        }, () => {
            this.getList();
        })
    };

    //得到数据
    getList() {
        let selectorItem = this.state.selectorItem;
        let searchParams = Object.assign({}, this.state.searchParams, this.props.extraParams);
        let model = {
            setOfBookId: this.props.params.setOfBooksId,
            range: searchParams.range ? searchParams.range : 'all',
            transactionClassIdList: [],
            classCode: searchParams.classCode,
            description: searchParams.description,
            sobPayReqTypeId: this.props.params.sobPayReqTypeId
        }
        return PrePaymentTypeService.getCashTransaction(model).then((response) => {
            this.setState({
                data: response.data.records,
                loading: false,
                pagination: {
                    total: Number(response.data.total),
                    onChange: this.onChangePager,
                    current: this.state.page + 1
                }
            }, () => {
                this.refreshSelected();  //刷新当页选择器
            })
        }).catch(e => {
            message.error(this.$t({ id: 'pre.payment.getCashTransaction.error' }/*获取数据失败，请稍后重试或联系管理员*/));
            this.setState({ loading: false })
        });
    }

    onChangePager = (page) => {
        if (page - 1 !== this.state.page)
            this.setState({
                page: page - 1,
                loading: true
            }, () => {
                this.getList();
            })
    };

    /**
     * 判断this.props.type是否有变化，如果有变化则重新渲染页面
     * @param type
     */
    checkType(type) {
        let selectorItem = selectorData[type];
        if (selectorItem) {
            this.checkSelectorItem(selectorItem)
        }
    };

    checkSelectorItem(selectorItem) {
        let searchParams = {};
        selectorItem.searchForm.map(form => {
            searchParams[form.id] = form.defaultValue;  //遍历searchForm，取id组装成searchParams
        });
        this.setState({ selectorItem, searchParams }, () => {
            this.getList();
        })
    }

    /**
     * 每次父元素进行setState时调用的操作，判断nextProps内是否有type的变化
     * 如果selectedData有值则代表有默认值传入需要替换本地已选择数组，
     * 如果没有值则需要把本地已选择数组置空
     * @param nextProps 下一阶段的props
     */
    componentWillReceiveProps = (nextProps) => {

        if (nextProps.visible&&!this.props.visible) {
            this.setState({ page: 0 }, () => {
                this.getList();
            });
        }
        if(!nextProps.visible && this.props.visible){
          this.formRef&&this.formRef.setValues({classCode:'', description: '',range:'all'})
          this.setState({
            page: 0,
            searchParams: {
                range:'all'
            },
            loading: true
          },()=>{
              this.getList()
          })
        }
    };

    handleOk = () => {
        this.props.onOk({
            result: this.state.selectedData,
            type: this.props.type
        })
    };

    /**
     * 根据selectedData刷新当页selection
     */
    refreshSelected() {
        let { selectorItem, selectedData, data, rowSelection } = this.state;
        let nowSelectedRowKeys = [];

        this.props.selectedData.map(selected => {
            data.map(item => {
                if (item["id"] == selected)
                    nowSelectedRowKeys.push(item["id"])
            })
        });
        rowSelection.selectedRowKeys = nowSelectedRowKeys;
        this.setState({ rowSelection, selectedData: this.props.selectedData });
    };

    //选项改变时的回调，重置selection
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let { rowSelection } = this.state;
        rowSelection.selectedRowKeys = selectedRowKeys;
        this.setState({ rowSelection });
    };

    /**
     * 选择单个时的方法，遍历selectedData，根据是否选中进行插入或删除操作
     * @param record 被改变的项
     * @param selected 是否选中
     */
    onSelectItem = (record, selected) => {

        let { selectedData, selectorItem } = this.state;

        if (!selected) {
            selectedData.map((selected, index) => {
                if (selected == record["id"]) {
                    selectedData.splice(index, 1);
                }
            })
        } else {
            selectedData.push(record["id"]);
        }
        this.setState({ selectedData: selectedData });
    };

    //选择当页全部时的判断
    onSelectAll = (selected, selectedRows, changeRows) => {
        changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
    };
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
        const { visible, onCancel, afterClose } = this.props;
        const { data, pagination, loading, columns, selectorItem, selectedData, rowSelection, inputValue, searchForm } = this.state;
        return (
            <Modal title={this.$t({ id: 'pre.payment.choose.cash.transaction.class' })/*选择现金事务分类*/} visible={visible} onCancel={onCancel} afterClose={afterClose} width={800} onOk={this.handleOk} className="list-selector">
                {searchForm && searchForm.length > 0 ?
                  <SearchArea searchForm={searchForm}
                    wrappedComponentRef={(inst) => this.formRef = inst}
                    submitHandle={this.search}
                    clearHandle={this.clear} /> : null}
                <div className="table-header">
                    <div className="table-header-title">
                        {this.$t({ id: "common.total" }, { total: pagination.total })}
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
                <Table columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    bordered
                    rowSelection={this.state.rowSelection}
                    rowKey={record => record["id"]}
                    size="middle"
                    onRowClick={this.onTableRowClick} />
            </Modal>
        );
    }
}

SelectContract.propTypes = {
    visible: PropTypes.bool,  //对话框是否可见
    onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
    onCancel: PropTypes.func,  //点击取消后的回调
    afterClose: PropTypes.func,  //关闭后的回调
    type: PropTypes.string,  //选择类型
    selectedData: PropTypes.array,  //默认选择的值id数组
    extraParams: PropTypes.object,  //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
    selectorItem: PropTypes.object,  //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
    single: PropTypes.bool  //是否单选
};

SelectContract.defaultProps = {
    afterClose: () => { },
    extraParams: {},
    single: false
};

function mapStateToProps() {
    return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SelectContract);

