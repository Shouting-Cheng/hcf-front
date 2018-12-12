
/**
 * Created by fudebao on 2017/12/05.
 */
import React from 'react'
import { connect } from 'dva';

import {  Badge, Button, Popover, message } from 'antd';
import Table from 'widget/table'
import httpFetch from 'share/httpFetch'
import SearchArea from 'components/Widget/search-area'
import SlideFrame from 'components/Widget/slide-frame'

import NewSupplierType from 'containers/setting/supplier-type/new-supplier-type'
import SupplierTypeService from 'containers/setting/supplier-type/supplier-type.service'

class SupplierType extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            page: 0,
            pageSize: 10,
            columns: [
                {
                  title: this.$t('supplier.type.code1'),
                  dataIndex: 'vendorTypeCode',
                  width: '20%',
                  align: 'center'
                },
                {
                  title: this.$t('supplier.type.name1'),
                  dataIndex: 'name',
                  align: 'center',
                  width: '30%',
                    render: accountSetDesc => (
                        <Popover content={accountSetDesc}>
                            {accountSetDesc}
                        </Popover>)
                },
                {
                    title: this.$t('common.column.status'), dataIndex: 'enabled', width: '15%',align: 'center',
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={enabled ? this.$t('common.status.enable') : this.$t('common.status.disable')} />
                    )
                }
            ],
            pagination: {
                total: 0
            },
            searchForm: [
                //供应商类型代码
                { type: 'input', id: 'code', label: this.$t('supplier.type.code1') },
                //供应商类型名称
                { type: 'input', id: 'name', label: this.$t('supplier.type.name1') }
            ],
            searchParams: {
                code: '',
                name: ''
            },
            updateParams: {},
            showSlideFrameNew: false,
        };
    }

    componentWillMount() {
        this.getList();
    }

    editItem = (record) => {
        this.setState({
            updateParams: record,
            showSlideFrameNew: true
        })
    };

    //得到列表数据
    getList() {
        this.setState({ loading: true });
        let params = this.state.searchParams;
        // let url = `${config.baseUrl}/api/ven/type/query?roleType=TENANT&page=${this.state.page}&size=${this.state.pageSize}`;
        // for (let paramsName in params) {
        //     url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
        // }
        SupplierTypeService.getSupplierList({ ...params, page: this.state.page, size: this.state.pageSize }).then((response) => {
            response.data.map((item) => {
                item.key = item.id;
            });
            this.setState({
                data: response.data,
                loading: false,
                pagination: {
                    total: Number(response.headers['x-total-count']) ? Number(response.headers['x-total-count']) : 0,
                    onChange: this.onChangePager,
                    current: this.state.page + 1
                }
            })
        });
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

    search = (result) => {
        this.setState({
            page: 0,
            searchParams: {
                code: result.code ? result.code : '',
                name: result.name ? result.name : ''
            }
        }, () => {
            this.getList();
        })
    };

    clear = () => {
        this.setState({
            searchParams: {
                code: '',
                name: ''
            }
        })
    };

    handleCloseNewSlide = (params) => {

        this.setState({
            showSlideFrameNew: false
        }, () => {
            if (params) {
                this.getList();
            }
        })
    };

    showSlideNew = (flag) => {
        this.setState({
            showSlideFrameNew: flag
        });
    };

    newItemShowSlide = () => {
        this.setState({
            updateParams: { record: {} },
        }, () => {
            this.showSlideNew(true)
        })
    }

    render() {

        const { columns, data, loading, pagination, searchForm, updateParams,
          showSlideFrame, showSlideFrameNew } = this.state;
        return (
            <div className="budget-organization">
                <h3 className="header-title">{this.$t('menu.supplier-type')}</h3>
                <SearchArea
                    searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                />
                <div className="table-header">
                    <div className="table-header-title">{this.$t('common.total', { total: pagination.total ? pagination.total : '0' })}</div> {/* 共total条数据 */}
                    {this.props.tenantMode && (<div className="table-header-buttons">
                        <Button type="primary" onClick={this.newItemShowSlide}>{this.$t('common.create')}</Button>
                    </div>)}
                </div>

                <Table columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    bordered
                    onRow={record => ({ onClick: () => { this.editItem(record) } })}
                    size="middle" />

                <SlideFrame title={updateParams.id ? this.$t("supplier.type.edit") : this.$t("supplier.type.new")}
                    show={showSlideFrameNew}
                    onClose={() => this.setState({ showSlideFrameNew: false })}>
                        <NewSupplierType onClose={this.handleCloseNewSlide} 
                        params={{...updateParams, visible: showSlideFrameNew}}></NewSupplierType>
                    </SlideFrame>
            </div>
        )
    }

}


function mapStateToProps(state) {
    return {
        tenantMode: true,
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(SupplierType);
