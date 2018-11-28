import React from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import { Button, Table, Badge, Divider, Form, Icon, message, Checkbox, Input, Modal, Alert, Switch, Popconfirm } from 'antd';
const FormItem = Form.Item;
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame'
import NewDataAuthority from 'containers/setting/data-authority/new-data-authority'
import config from 'config';
import DataAuthorityService from 'containers/setting/data-authority/data-authority.service'


class DataAuthority extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchForm: [
                { type: 'input', id: 'dataAuthorityCode', label: '数据权限代码', colSpan: 6 },
                { type: 'input', id: 'dataAuthorityName', label: '数据权限名称', colSpan: 6 },
            ],
            columns: [
                {
                    title: '数据权限代码',
                    dataIndex: 'dataAuthorityCode',
                },
                {
                    title: '数据权限名称',
                    dataIndex: 'dataAuthorityName',
                },
                {
                    title: '数据权限说明',
                    dataIndex: 'description',
                },
                {
                    title: '状态',
                    dataIndex: 'enabled',
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={enabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />)
                },
                {
                    title: this.$t("common.operation"),//"操作"
                    dataIndex: 'operate',
                    render: (text, record) => (
                        <span>
                            {/*编辑*/}
                            <a onClick={(e) => this.editItem(record)}>{this.$t("common.edit")}</a>
                            <Divider type="vertical" />
                            {/*删除*/}
                            <Popconfirm
                                placement="top"
                                title={'确认删除？'}
                                onConfirm={e => {
                                    e.preventDefault();
                                    this.deleteCost(record);
                                }}
                                okText="确定"
                                cancelText="取消"
                            >
                                <a onClick={e => { e.preventDefault(); e.stopPropagation(); }}>删除</a>
                            </Popconfirm>
                        </span>
                    )
                }

            ],

            searchParams: {},

            showSlideFrame: false,
            updateParams: {}

        }
    }
    // componentWillMount(){
    //     this.table.search(this.state.searchParams)
    // }
    /**搜索条件 */
    onSearch = (values) => {
        values.dataAuthorityCode = values.dataAuthorityCode ? values.dataAuthorityCode : undefined,
            values.dataAuthorityName = values.dataAuthorityName ? values.dataAuthorityName : undefined,
            this.setState({
                searchParams: values
            }, () => {
                this.table.search(this.state.searchParams)
            })
    };
    clear = () => {
        this.setState({ searchParams: {} })
    }
    /**新建数据权限 */
    newAuthority = () => {
        this.setState({
            updateParams:{},
            showSlideFrame: true
        },()=>{
            this.setState({ showSlideFrame: true })
        })
    }
    /**编辑数据权限 */
    editItem = (record) => {
        this.setState({
            updateParams: JSON.parse(JSON.stringify(record)),

        }, () => {
            this.setState({ showSlideFrame: true })
        })
    }
    /**删除数据权限 */
    deleteCost = (record) => {
        console.log(record);
        DataAuthorityService.deleteDataAuthority(record.id).then(res => {
            message.success("删除成功！");
            this.table.search(this.state.searchParams)
        }).catch(err => {
            message.error("删除失败！");
        })
    }

    handleCloseSlide = () => {
        this.setState({
            showSlideFrame: false
        }, () => {
            this.table.search(this.state.searchParams)
        })
    }
    render() {
        const { searchForm, columns, showSlideFrame, updateParams } = this.state;
        return (
            <div>
                <SearchArea
                    searchForm={searchForm}
                    submitHandle={this.onSearch}
                    clearHandle={this.clear}
                    maxLength={4}
                />
                <div style={{ marginTop: 30 }}>
                    <Button type="primary" onClick={this.newAuthority}>
                        {this.$t("common.create")/*新建*/}
                    </Button>
                </div>
                <div style={{ marginTop: 10 }}>
                    <CustomTable
                        columns={columns}
                        url={`${config.authUrl}/api/system/data/authority/query`}
                        ref={ref => this.table = ref}
                    />
                </div>
                <SlideFrame
                    title={JSON.stringify(updateParams) === "{}" ? '新建数据权限' : '编辑数据权限'}
                    show={showSlideFrame}
                    onClose={() => this.setState({ showSlideFrame: false })}
                >
                    <NewDataAuthority
                        close={this.handleCloseSlide}
                        params={{ ...updateParams }}
                    />

                </SlideFrame>
            </div>
        )
    }

}

function mapStateToProps(state) {

}

export default connect(mapStateToProps, null, null, { withRef: true })(DataAuthority);
