import React from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import { Button, Table, Badge, Form, Icon, message, Checkbox, Input, Modal, Alert, Switch } from 'antd';
const FormItem = Form.Item;
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame'
import NewDataAuthority from 'containers/setting/data-authority/new-data-authority'
import config from 'config';


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
                    dateIndex: 'dataAuthorityCode',
                },
                {
                    title: '数据权限名称',
                    dateIndex: 'dataAuthorityName',
                },
                {
                    title: '数据权限说明',
                    dateIndex: 'description',
                },
                {
                    title: '数据权限说明',
                    dateIndex: 'description',
                },
                {
                    title: '状态',
                    dateIndex: 'enabled',
                },
                {
                    title: this.$t("common.operation"),//"操作"
                    dataIndex: 'operate',
                    render: (text, record) => (
                        <span>
                            {/*编辑*/}
                            <a>{this.$t("common.edit")}</a> &nbsp;&nbsp;&nbsp;
                             {/*详情*/}
                            <a>{this.$t("common.detail")}</a>
                        </span>
                    )
                }

            ],
            searchParams: {},
            isNew: false,
            showSlideFrame: false

        }
    }
    componentDidMount(){
        this.table.search(this.state.searchParams)
    }
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
            isNew: true,
            showSlideFrame: true
        })
    }
    handleCloseSlide = () => {
        this.setState({
            showSlideFrame: false
        },()=>{
            this.table.search(this.state.searchParams)
        })
    }
    render() {
        const { searchForm, columns, isNew, showSlideFrame } = this.state;
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
                    title={isNew ? '新建数据权限' : '编辑数据权限'}
                    show={showSlideFrame}
                    onClose={() => this.setState({ showSlideFrame: false })}
                >
                    <NewDataAuthority
                        close={this.handleCloseSlide}
                    />

                </SlideFrame>
            </div>
        )
    }

}

function mapStateToProps(state) {

}

export default connect(mapStateToProps, null, null, { withRef: true })(DataAuthority);
