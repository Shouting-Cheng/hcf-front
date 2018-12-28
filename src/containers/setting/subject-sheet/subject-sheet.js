import React from 'react';
import { connect } from 'dva';
import config from 'config';
import { Badge, Button, Popover, message } from 'antd';
import Table from 'widget/table'
import httpFetch from 'share/httpFetch';
import SearchArea from 'components/Widget/search-area'
import SlideFrame from 'components/Widget/slide-frame'
import NewSubjectSheet from 'containers/setting/subject-sheet/new-subject-sheet';

import { routerRedux } from 'dva/router';

class SubjectSheet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            pagination: {
                page: 0,
                total: 0,
                pageSize: 10,
            },
            columns: [
                {
                    title: this.$t({ id: "subject.sheet.code" }),
                    dataIndex: 'accountSetCode',
                    width: '20%'
                },
                {
                    title: this.$t({ id: "subject.sheet.describe" }),
                    dataIndex: 'accountSetDesc',
                    width: '30%',
                    render: accountSetDesc => (
                        <Popover content={accountSetDesc}>
                            {accountSetDesc}
                        </Popover>)
                },
                {
                    title: this.$t({ id: 'common.column.status' }),
                    dataIndex: 'enabled',
                    width: '6%',
                    align: "center",
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={enabled ? this.$t({ id: 'common.status.enable' }) : this.$t({ id: 'common.status.disable' })} />
                    )
                },
                {
                    title: this.$t({ id: 'common.operation' })/*操作*/,
                    dataIndex: 'operation',
                    width: '10%',
                    key: "id",
                    align: "center",
                    render: (text, record) => (
                        <div>
                            <span>
                                <a onClick={(e) => this.editItem(record)}>
                                    {/*编辑*/}
                                    {this.$t({ id: 'common.edit' })}
                                </a>
                                <span className="ant-divider" />
                                <a style={{ marginRight: 10 }} onClick={(e) => this.handleRowClick(e, record)}>
                                    {/*查看详情*/}
                                    {this.$t({ id: 'org.person.detail' })}
                                </a>
                            </span>
                        </div>)
                }
            ],

            searchForm: [
                //科目表代码
                {
                    type: 'input', id: 'accountSetCode',
                    label: this.$t({ id: 'subject.sheet.code' })
                },
                ////科目表描述
                {
                    type: 'input', id: 'accountSetDesc',
                    label: this.$t({ id: 'subject.sheet.describe' })
                }
            ],
            searchParams: {
                accountSetCode: '',
                accountSetDesc: ''
            },
            updateParams: {},
            showSlideFrame: false,
            showSlideFrameNew: false,
            // SubjectSheetDetail: menuRoute.getRouteItem('subject-sheet-detail', 'key'),
            // SubjectSheetDetail : this.props.dispatch(
            //     routerRedux.push({
            //       pathname: `/admin-setting/subject-sheet/subject-sheet-detail`,
            //     })
            //   )
        };
    }

    componentWillMount() {
        let _pagination = this.getBeforePage();
        let pagination = this.state.pagination;
        pagination.page = _pagination.page;
        pagination.current = _pagination.page + 1;
        this.setState({
            pagination,
        }, () => {
            this.clearBeforePage();
            this.getList();
        })
    }

    editItem = (record) => {
        this.setState({
            updateParams: JSON.parse(JSON.stringify(record)),
            showSlideFrame: true
        }, () => {
            this.showSlideNew(true);
        })

    };

    //得到列表数据
    getList() {
        this.setState({ loading: true });
        let pagination = this.state.pagination;
        let params = this.state.searchParams;
        let url = `${config.baseUrl}/api/account/set/query?&page=${pagination.page}&size=${pagination.pageSize}`;
        for (let paramsName in params) {
            url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
        }
        return httpFetch.get(url).then((response) => {
            response.data.map((item) => {
                item.key = item.id;
            });
            pagination.total = Number(response.headers['x-total-count']);
            this.setState({
                data: response.data,
                loading: false,
                pagination
            })
        });
    }

    //分页点击
    onChangePager = (p, filters, sorter) => {
        let pagination = this.state.pagination;
        pagination.page = p.current - 1;
        pagination.current = p.current;
        this.setState({
            pagination
        }, () => {
            this.getList();
        })
    };
    //跳转到详情
    handleRowClick = (e, value) => {
        this.setBeforePage(this.state.pagination);
        // let path = this.state.SubjectSheetDetail.url.replace(":accountSetId", value.id);
        // this.context.router.push(path);

        this.props.dispatch(
            routerRedux.push({
              pathname: `/admin-setting/subject-sheet/subject-sheet-detail/${value.id}`,
            })
          );
    };

    search = (result) => {
        let pagination = this.state.pagination;
        pagination.page = 0;
        pagination.current = 1;
        this.setState({
            pagination,
            searchParams: {
                accountSetCode: result.accountSetCode ? result.accountSetCode : '',
                accountSetDesc: result.accountSetDesc ? result.accountSetDesc : ''
            }
        }, () => {
            this.getList();
        })
    };

    clear = () => {
        this.setState({
            searchParams: {
                accountSetCode: '',
                accountSetDesc: ''
            }
        })
    };

    searchEventHandle = (event, value) => {
        //console.log(event, value)
    };

    handleCloseNewSlide = (params) => {
        if (params) {
            this.getList();
        }
        this.setState({
            showSlideFrameNew: false
        })
    };

    showSlideNew = (flag) => {
        this.setState({
            showSlideFrameNew: flag
        })
    };

    newItemShowSlide = () => {
        this.setState({
            updateParams: {},
        }, () => {
            this.showSlideNew(true)
        })
    }

    render() {

        const { columns, data, loading, pagination, searchForm, updateParams,
            showSlideFrameNew } = this.state;
        return (
            <div className="budget-organization">
                <h3 className="header-title">
                    {/*预算组织定义*/}
                    {this.$t({ id: 'menu.subject-sheet' })}
                </h3>
                <SearchArea
                    searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                    eventHandle={this.searchEventHandle} />

                <div className="table-header">
                    <div className="table-header-title">
                        {this.$t({ id: 'common.total' }, { total: pagination.total ? pagination.total : '0' })}
                    </div>
                    {/* 共total条数据 */}
                    <div className="table-header-buttons">
                        <Button type="primary"
                            onClick={this.newItemShowSlide}>
                            {/*新建*/}
                            {this.$t({ id: 'common.create' })}</Button>
                    </div>
                </div>
                <Table columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    onChange={this.onChangePager}
                    loading={loading}
                    bordered
                    size="middle" />
                {/* 编辑科目表 */}
                {/*新建科目表:编辑科目表*/}
                {/* <SlideFrame
                    title={JSON.stringify(updateParams) === "{}" ? this.$t({ id: 'subject.sheet.new' }) : this.$t({ id: 'subject.sheet.edit' })}
                    show={showSlideFrameNew}
                    content={NewSubjectSheet}
                    afterClose={this.handleCloseNewSlide}
                    onClose={() => this.setState({ showSlideFrameNew: false })}
                    params={{ ...updateParams, visible: showSlideFrameNew }} /> */}

                <SlideFrame
                    title = {JSON.stringify(updateParams) === "{}" ? this.$t({ id: 'subject.sheet.new' }) : this.$t({ id: 'subject.sheet.edit' })}
                    show = {showSlideFrameNew}
                    onClose = {()=>this.setState({showSlideFrameNew:false})}>
                    <NewSubjectSheet
                        close = {this.handleCloseNewSlide}
                        params = {{
                            ...updateParams,
                            visible:showSlideFrameNew
                        }
                        }/>
                </SlideFrame>

            </div>
        )
    }

}

function mapStateToProps() {
    return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SubjectSheet);
