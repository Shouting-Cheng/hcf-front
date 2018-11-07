/**
 * Created by zhouli on 18/3/13
 * Email li.zhou@huilianyi.com
 */
//成本中心
//根据账套查询列表
import React from 'react';
import { connect } from 'dva';

import { Table, Button, Badge, Popover, Switch, Icon } from 'antd';
import CCService from 'containers/setting/cost-center/cost-center.service';
import SearchArea from 'widget/search-area';
import 'styles/setting/cost-center/cost-center.scss';

import BaseService from 'share/base.service';
import { routerRedux } from 'dva/router';

class CostCenter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            visible: false,
            columns: [
                {
                    //成本中心名称
                    title: this.$t("cost.center.title"),
                    dataIndex: "name",
                    width: '40%',
                    render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
                },
                {
                    //编码
                    title: this.$t("cost.center.code"),
                    dataIndex: "code",
                    width: '20%',
                    render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
                },
                {
                    //状态
                    title: this.$t("cost.center.status"),
                    dataIndex: 'enabled',
                    width: '20%',
                    render: enabled => (
                        <Badge status={enabled ? 'success' : 'error'}
                            text={enabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />)
                },
                {
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: "id",
                    render: (text, record) => (
                        <span>
                            <a onClick={(e) => this.editCostCenter(e, record)}>
                                {/*编辑*/}
                                {this.$t("common.edit")}
                            </a>
                            &nbsp;&nbsp;&nbsp;
              <a onClick={(e) => this.detailCostCenter(e, record)}>
                                {/*详情*/}
                                {this.$t("common.detail")}
                            </a>
                        </span>)
                }
            ],
            pagination: {
                total: 0,
                page: 0,
                pageSize: 25,//成本中心最多20个，我这边一次性加载
            },
            searchForm: [
                {
                    type: 'select',
                    id: 'setOfBook',
                    label: this.$t("setting.set.of.book"),
                    options: [],
                    defaultValue: "",
                    //这个选项是外面传入，就不许下面参数
                    // getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
                    // method: 'get',
                    labelKey: 'setOfBooksCode',
                    valueKey: 'id',
                    event: "setOfBooksCodeChange",
                },
            ],
            searchParams: {
                setOfBook: this.props.match.params.setOfBooksId==="0"?this.props.company.setOfBooksId:this.props.match.params.setOfBooksId
            },
            //   CostCenterExtendFiled: menuRoute.getRouteItem('cost-center-extend-filed', 'key'),//成本中心扩展字段
            //   newCostCenter: menuRoute.getRouteItem('new-cost-center', 'key'),//新增成本中心
            //   CostCenterDetail: menuRoute.getRouteItem('cost-center-detail', 'key'),//成本中心详情
            //   OrgStruture: menuRoute.getRouteItem('org-structure', 'key'),//企业组织架构
            depIsCostCenter: false,//部门是否是成本中心
            // setOfBooksId: this.props.match.params.setOfBooksId==="0"?this.props.company.setOfBooksId:this.props.match.params.setOfBooksId,//初始化页面时从接口获取的2个字段，掉接口要用
        };
    }

    // componentDidMount() {
    //     this.getTenantAllSob();
    //     this.setState({
    //         // depIsCostCenter: this.props.companyConfiguration.configuration.ui.showDepartmentSelector.applications
    //     })
    // }
    componentWillMount(){
        this.getTenantAllSob();
        console.log(this.props)
    }

    getTenantAllSob() {
        //给一个初始值
        const { searchForm, searchParams } = this.state;
        //下面针对账套下拉单进行处理
        let setOfBookSelecter = searchForm[0];
        CCService.getTenantAllSob()
            .then(res => {
                let options = res.data;
                let defaultValue = '';
                options.map((item, index) => {
                    if (index === 0) {
                        defaultValue = item.id;
                    }
                    item.label = item.setOfBooksName;
                    item.value = item.id;
                })
                setOfBookSelecter.options = options;
                setOfBookSelecter.defaultValue = defaultValue;
                searchParams.setOfBook = defaultValue;
                this.setState({
                    searchForm,
                    searchParams
                }, () => {
                    this.getList();
                })
            })
    }

    //得到列表数据
    getList() {
        this.setState({ loading: true });
        const { searchParams, pagination } = this.state;
        let params = {
            page: pagination.page,
            size: pagination.pageSize,
            setOfBooksId: searchParams.setOfBook,
        }
        CCService.getCostCenterBySobId(params).then((response) => {
            response.data.map((item) => {
                item.key = item.id;
            });
            pagination.total = response.total;
            pagination.current = params.page + 1;
            this.setState({
                data: response.data,
                loading: false,
                pagination
            })
        });
    }

    //新增成本中心
    handleNew = () => {
        // this.context.router.push(this.state.newCostCenter.url.replace(':id', "NEW"));
        let {searchParams}=this.state;
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/new-cost-center/NEW/${searchParams.setOfBook}`,
            })
        );
    };

    //编辑成本中心
    editCostCenter(e, record) {
        // this.context.router.push(this.state.newCostCenter.url.replace(':id', record.costCenterOID));
        let {searchParams}=this.state;
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/new-cost-center/${record.costCenterOID}/${searchParams.setOfBook}`,
            })
        );
    }

    //成本中心详情
    detailCostCenter(e, record) {
        // this.context.router.push(this.state.CostCenterDetail.url.replace(':id', record.costCenterOID));
        let {searchParams}=this.state;
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/cost-center-detail/${record.costCenterOID}/${searchParams.setOfBook}`,
            })
        );
    }

    //分页点击
    onChangePager = (pagination, filters, sorter) => {
        this.setState({
            pagination: {
                page: pagination.current - 1,
                pageSize: pagination.pageSize
            }
        }, () => {
            this.getList();
        })
    };
    //员工信息，工号，电话等关键字是及时搜索
    eventSearchAreaHandle = (e, item) => {
        let searchParams = this.state.searchParams;
        let pagination = this.state.pagination;
        pagination.page = 0;
        searchParams.setOfBook = item;
        this.setState({
            pagination,
            searchParams
        }, () => {
            this.getList()
        })
    }
    //点击搜索
    search = (result) => {
        let pagination = this.state.pagination;
        pagination.page = 0;
        pagination.current = 1;
        pagination.total = 0;
        this.setState({
            pagination,
            searchParams: Object.assign(this.state.searchParams, result)
        }, () => {
            this.getList();
        })
    };
    clear = () => {
        this.setState({
            searchParams: {
                setOfBook: ''
            }
        })
    };
    // CostCenterExtendFiled
    handleCostCenterExtendFiled = () => {
        // this.context.router.push(this.state.CostCenterExtendFiled.url);
        this.props.dispatch(
            routerRedux.push({
                pathname: `/admin-setting/cost-center/cost-center-extend-filed`,
            })
        );
    };
    //去组织架构页面
    goStructure = () => {
        this.context.router.push(this.state.OrgStruture.url);
        this.props.dispatch(
            routerRedux.push({
                pathname: `/enterprise-manage/org-structure`,
            })
        );
    }
    //禁用部门：成本中心
    disabledDepCostCenter = () => {
        CCService.toggleDepartment(false)
            .then((res) => {
                this.setState({
                    depIsCostCenter: res.data.configuration.ui.showDepartmentSelector.applications
                })
                //重置redux
                BaseService.getCompanyConfiguration();
            })
    }
    //启用部门：成本中心
    enabledDepCostCenter = () => {
        CCService.toggleDepartment(true)
            .then((res) => {
                this.setState({
                    depIsCostCenter: res.data.configuration.ui.showDepartmentSelector.applications
                })
                //重置redux
                BaseService.getCompanyConfiguration();
            })
    }

    render() {
        const { columns, data, loading, pagination, searchForm } = this.state;
        return (
            <div className="cost-center">
                <SearchArea
                    eventHandle={this.eventSearchAreaHandle}
                    isHideOkText={true}
                    isHideClearText={true}
                    searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear} />
                <div className="table-header">
                    <div className="cost-center-dep-wrap">
                        <div className="cost-center-dep">
                            <Icon type="info-circle" style={{ color: '#1890ff' }} />&nbsp;&nbsp;
              {/*部门：*/}
                            {
                                this.$t("cost.center.dep")
                            }:
              {
                                // 启用中:禁用中
                                this.state.depIsCostCenter ? <span>{this.$t("cost.center.enabled")}&nbsp;&nbsp;</span> :
                                    <span>{this.$t("cost.center.disabled")}&nbsp;&nbsp;</span>
                            }
                            {
                                this.state.depIsCostCenter ?
                                    <span className="cost-center-btn" onClick={this.disabledDepCostCenter}>
                                        {/*设为禁用*/}
                                        {
                                            this.$t("cost.center.sdisabled")
                                        }
                                    </span> :
                                    <span className="cost-center-btn" onClick={this.enabledDepCostCenter}>
                                        {/*设为启用*/}
                                        {
                                            this.$t("cost.center.senabled")
                                        }
                                    </span>
                            }
                            <span className="cost-center-gray">
                                {/*（部门为企业默认成本中心，部门维护请前往*/}
                                {
                                    this.$t("cost.center.goto")
                                }
                            </span>
                            <span className="cost-center-btn"
                                onClick={this.goStructure}>&nbsp;{
                                    // 企业管理-组织架构
                                    this.$t("cost.center.enterprise.org")
                                }&nbsp;</span>
                            <span className="cost-center-gray">
                                {/*）页面*/}
                                {
                                    this.$t("cost.center.page")
                                }
                            </span>
                        </div>
                    </div>

                    <div className="table-header-title">{this.$t("common.total", { total: pagination.total })}</div>
                    {/* 共total条数据 */}
                    <div className="table-header-buttons">
                        <Button type="primary" disabled={!this.props.tenantMode} onClick={this.handleNew}>
                            {/*新建*/}
                            {this.$t("common.create")}
                        </Button>
                        <Button type="primary" disabled={!this.props.tenantMode} onClick={this.handleCostCenterExtendFiled}>
                            {/*成本中心项扩展字段*/}
                            {this.$t("cost.center.extend.field")}
                        </Button>
                    </div>
                </div>
                <Table columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    rowKey="id"
                    bordered
                    onChange={this.onChangePager}
                    size="middle" />
            </div>
        )
    }

}

function mapStateToProps(state) {
    return {
        profile: state.user.profile,
        user: state.user.currentUser,
        tenantMode: true,
        company: state.user.company,
        companyConfiguration: state.user.companyConfiguration,
    }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CostCenter);


