import React from 'react';
import { connect } from 'dva';
import config from 'config';
import SearchArea from 'widget/search-area';
import { Button, Row, Col, Tabs, Popconfirm, Badge, Divider,message } from 'antd';
import 'styles/setting/responsibility-center/responsibility-center.scss';
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame';
import NewResponsibilityCenter from 'containers/setting/responsibility-center/new-responsibility-cernter';
import NewResponsibilityCenterGroup from 'containers/setting/responsibility-center/new-responsibility-cernter-group';
import ResponsibilityService from 'containers/setting/responsibility-center/responsibility-service'
import ListSelector from 'components/Widget/list-selector';
const TabPane = Tabs.TabPane;
class ResponsibilityCenter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cernterSearchForm: [
                {
                    type: 'select', id: 'setOfBooksId', label: '账套', options: [], isRequired: true, colSpan: '6',
                    getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
                    getParams: { roleType: 'TENANT' },
                    allowClear: false,
                    method: 'get', labelKey: 'setOfBooksName', valueKey: 'id',
                    event: 'SETOFBOOKSID',
                    defaultValue: `${props.company.setOfBooksId}-${props.company.setOfBooksName} `,
                    renderOption: data => `${data.setOfBooksCode} - ${data.setOfBooksName}`
                },
                { type: 'input', id: 'responsibilityCenterCode', label: '责任中心代码', colSpan: '6', },
                { type: 'input', id: 'responsibilityCenterName', label: '责任中心名称', colSpan: '6', },
                {
                    type: 'select', id: 'enabled', label: '状态', options: [
                        { value: true, label: '启用' },
                        { value: false, label: '禁用' },
                    ], colSpan: '6',
                }
            ],
            groupSearchForm: [
                {
                    type: 'select', id: 'setOfBooksId', label: '账套', options: [], isRequired: true, colSpan: '6',
                    getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
                    getParams: { roleType: 'TENANT' },
                    allowClear: false,
                    method: 'get', labelKey: 'setOfBooksName', valueKey: 'id',
                    event: 'SETOFBOOKSID',
                    defaultValue: `${props.company.setOfBooksId}-${props.company.setOfBooksName} `,
                    renderOption: data => `${data.setOfBooksCode} - ${data.setOfBooksName}`
                },
                { type: 'input', id: 'groupCode', label: '责任中心代码', colSpan: '6', },
                { type: 'input', id: 'groupName', label: '责任中心名称', colSpan: '6', },
                {
                    type: 'select', id: 'enabled', label: '状态', options: [
                        { value: true, label: '启用' },
                        { value: false, label: '禁用' },
                    ], colSpan: '6',
                }
            ],
            cernterColumns: [
                {
                    title: '责任中心代码',
                    dataIndex: 'responsibilityCenterCode',
                },
                {
                    title: '责任中心名称',
                    dataIndex: 'responsibilityCenterName',
                },
                {
                    title: '状态',
                    dataIndex: 'enabled',
                    render: (record) => (
                        <Badge
                            status={record ? 'success' : 'error'}
                            text={record ? this.$t('common.status.enable') : this.$t('common.status.disable')}
                        />
                    )
                },
                {
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: 'operate',
                    render: (text, record) => (
                        <span>
                            {/*编辑*/}
                            <a onClick={(e) => this.editCenterItem(record)}>{this.$t("common.edit")}</a>
                            <Divider type="vertical" />
                            {/*公司分配*/}
                            <a onClick={(e)=>this.assignCompany(record)}>公司分配</a>
                        </span>
                    )
                }
            ],
            groupColumns: [
                {
                    title: '责任中心组代码',
                    dataIndex: 'groupCode',
                },
                {
                    title: '责任中心组名称',
                    dataIndex: 'groupName',
                },
                {
                    title: '状态',
                    dataIndex: 'enabled',
                    render: (record) => (
                        <Badge
                            status={record ? 'success' : 'error'}
                            text={record ? this.$t('common.status.enable') : this.$t('common.status.disable')}
                        />
                    )
                },
                {
                    title: '添加责任中心',
                    dataIndex: 'addResponsibility',
                    render: (text, record) => (
                        <span>
                            {/**添加责任中心 */}
                            <a onClick={(e)=>this.addResponsibilityCenter(record)}>添加责任中心</a>
                        </span>
                    )
                },
                {
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: 'operate',
                    render: (text, record) => (
                        <span>
                            {/*编辑*/}
                            <a onClick={(e)=>this.editGroupItem(record)}>{this.$t("common.edit")}</a>
                            <Divider type="vertical" />
                            {/*删除*/}
                            <Popconfirm
                                placement="top"
                                title={'确认删除？'}
                                onConfirm={e => {
                                    e.preventDefault();
                                    this.deleteGroupCost(record);
                                }}
                                okText="确定"
                                cancelText="取消"
                            >
                                <a>删除</a>
                            </Popconfirm>
                        </span>
                    )
                }
            ],
            selectedRowKeys: [],
            tabVal: 'cernter',
            showCernterSlideFrame: false,
            showGroupSlideFrame: false,
            setOfBooksId: props.company.setOfBooksId,
            searchParams: {},
            searchGropParam:{},
            isNew: false,
            centerParams: {},
            centerVisible:false,
            centerItem:{},
            addCenterItem:{},
            //添加责任中心显示模态框
            addCenterVisible:false,
            // 批量分配公司按钮显示模态框
            companyButVisible:false
        }
    }

    /**tabs切换事件 */
    onChangeTab = (key) => {
        this.setState({
            tabVal: key
        })
    }
    /**责任中心搜索，清空，表格操作，新建等功能 */
    searhCernter = (values) => {
            values.setOfBooksId=values.setOfBooksId?values.setOfBooksId:this.props.company.setOfBooksId;
            values.responsibilityCenterCode = values.responsibilityCenterCode ? values.responsibilityCenterCode : undefined,
            values.responsibilityCenterName = values.responsibilityCenterName ? values.responsibilityCenterName : undefined,
            values.enabled = values.enabled ? values.enabled : undefined,
            this.setState({
                searchParams: values
            }, () => {
                this.centerTable.search(this.state.searchParams)
            })
    }
    clearCenter = () => {
        this.setState({
            searchParams: {}
        })
    }
    //编辑责任心中单条数据
    editCenterItem = (record) => {
        this.setState({
            isNew: false,
            centerParams: JSON.parse(JSON.stringify(record)),
        }, () => {
            this.setState({ showCernterSlideFrame: true })
        })
    }
    //删除责任中心数据
    assignCompany=(record)=>{
        const centerItem = {
            title: '公司分配',
            url:`${config.baseUrl}/api/responsibilityCenter/company/assign/query?responsibilityCenterId=${record.id}`,
            searchForm: [
                {
                    type: 'select', id: 'setOfBooksId', label: '账套', options: [], isRequired: true, colSpan: '6',
                    defaultValue: this.props.company.setOfBooksId,
                },
                { type: 'input', id: 'responsibilityCenterCode', label: '责任中心代码', colSpan: '6',defaultValue: record.responsibilityCenterCode, },
                { type: 'input', id: 'responsibilityCenterName', label: '责任中心名称', colSpan: '6', defaultValue: record.responsibilityCenterName,},
                {
                    type: 'select', id: 'enabled', label: '状态', options: [
                        { value: true, label: '启用' },
                        { value: false, label: '禁用' },
                    ], colSpan: '6',
                }
            ],
            columns: [
                { title: "公司代码", dataIndex: 'companyCode' },
                { title: "公司名称", dataIndex: 'companyName' },
                { title: "公司类型", dataIndex: 'companyType' },
                { title: "启用", dataIndex: 'enabled' },

            ],
            key: 'id'
        }
        this.setState({
            centerVisible: true,
            centerItem
        })
    }
    cancelAssignCompany=(flag)=>{
        this.setState({
            centerVisible: flag
        })
    }
    // 添加责任中心按钮（gs）
    addResponsibility=(flag)=>{
      this.setState({
        addCenterVisible: flag
    })
    }
    addResponsibilityCenter=(record)=>{
      const {setOfBooksId} = this.state;
      const addCenterItem = {
        title: '添加责任中心',
        url:`${config.baseUrl}/api/responsibilityCenter/query?setOfBooksId=${setOfBooksId}`,
        searchForm: [
            { type: 'input', id: 'responsibilityCenterName', label: '责任中心', colSpan: '8',defaultValue: record.responsibilityCenterCode, },
            {
                type: 'select', id: 'enabled', label: '状态', options: [
                    { value: true, label: '启用' },
                    { value: false, label: '禁用' },
                ], colSpan: '8',
            },
            { type: 'input', id: 'responsibilityCenterName', label: '查看', colSpan: '8', defaultValue: record.responsibilityCenterName,},

        ],
        columns: [
            { title: "责任中心代码", dataIndex: 'responsibilityCenterCode' },
            { title: "责任中心名称", dataIndex: 'responsibilityCenterName' },
            { title: "状态", dataIndex: 'enabled' },

        ],
        key: 'id'
    }
    this.setState({
        addCenterVisible: true,
        addCenterItem
    })
    }
    handleAddCenter=(value)=>{

    }

    //勾选责任中心，多选
    onSelectItem = (record, selected) => {
        console.log(selected)
    }
    //全选责任中心
    onSelectAll = (selected) => {

    }
    //新建责任中心
    addCenter = () => {
        this.setState({
            centerParams: {},
            isNew: true
        }, () => {
            this.setState({ showCernterSlideFrame: true })
        })
    }
    handleCloseCenterSlide = () => {
        this.setState({ showCernterSlideFrame: false }, () => {
            this.centerTable.search(this.state.searchParams)
        })
    }
    /**责任中心组搜索，清空，表格操作，新建等功能 */
    searhGroup = (values) => {
        values.setOfBooksId=values.setOfBooksId?values.setOfBooksId:this.props.company.setOfBooksId;
        values.groupCode = values.groupCode ? values.groupCode : undefined;
        values.groupName = values.groupName ? values.groupName : undefined;
        values.enabled = values.enabled ? values.enabled : undefined;
        this.setState({
            searchGropParam: values
        }, () => {
            this.groupTable.search(this.state.searchGropParam)
        })

    }
    clearGroup = () => {
        this.setState({
            searchGropParam: {}
        })
    }
    //新建责任中心组
    addCenterGroup = () => {
        this.setState({
            searchGropParam: {},
            isNew: true
        }, () => {
            this.setState({ showGroupSlideFrame: true })
        })
    }
    //编辑责任中心组
    editGroupItem=(record)=>{
        this.setState({
            isNew: false,
            searchGropParam: JSON.parse(JSON.stringify(record)),
        }, () => {
            this.setState({ showGroupSlideFrame: true })
        })
    }
    handleCloseGroupSlide=()=>{
        this.setState({ showGroupSlideFrame: false }, () => {
            this.groupTable.search(this.state.searchGropParam)
        })
    }
    //删除责任中心组
    deleteGroupCost=(record)=>{
        ResponsibilityService.deleteResponsibilityGroup(record.id).then(res=>{
            message.success("删除成功！");
            this.groupTable.search(this.state.searchGropParam)
        }).catch(err => {
            message.error("删除失败！");
        })
    }
    // 批量分配公司按钮
  //   addButCompany=()=>{
  //     this.setState({companyButVisible: true});
  //   }
  //   onCompanyOk = value => {
  //     const params = [];
  //     value.result.map( item => {
  //         params.push({
  //            companyId: item.id,
  //            companyCode: item.companyCode,
  //            enabled: item.enabled,
  //            dimensionItemId: this.state.dimensionItemId
  //         });
  //     });
  //     dimensionValueService
  //       .addNewCompanyData(params)
  //       .then(res => {
  //           message.success('分配成功');
  //           this.getCompanyData();
  //           this.setState({
  //             companyVisible: false,
  //             selectedRowKeys: []
  //           });
  //       })
  //       .catch(err => {
  //           this.setState({
  //             companyVisible: false,
  //             selectedRowKeys: []
  //           });
  //           message.error(err.response.data.message);
  //       })
  // }
    render() {
        const { cernterSearchForm, cernterColumns, selectedRowKeys, isNew, centerParams, tabVal, groupSearchForm, groupColumns, showCernterSlideFrame, showGroupSlideFrame, setOfBooksId,
        searchGropParam,centerVisible,centerItem,addCenterVisible,addCenterItem,companyButVisible
        } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onSelect: this.onSelectItem,
            onSelectAll: this.onSelectAll
        };
        return (
            <div>
                <Tabs defaultActiveKey={tabVal} onChange={this.onChangeTab}>
                    <TabPane
                        tab='责任中心'
                        key='cernter'
                    >
                        {tabVal === 'cernter' && (
                            <div>
                                <SearchArea
                                    searchForm={cernterSearchForm}
                                    submitHandle={this.searhCernter}
                                    clearHandle={this.clearCenter}
                                    maxLength={4}
                                />
                                <div className='btnMargin'>
                                    <Button type="primary" onClick={this.addCenter}>新建</Button>
                                    <Button type="primary" onClick={this.addButCompany}>批量分配公司</Button>
                                    <Button type="primary">导入</Button>
                                    <Button type="primary">导出</Button>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <CustomTable
                                        columns={cernterColumns}
                                        url={`${config.baseUrl}/api/responsibilityCenter/query`}
                                        params={{ setOfBooksId: setOfBooksId }}
                                        ref={ref => this.centerTable = ref}
                                        rowSelection={rowSelection}
                                    />
                                </div>
                            </div>
                        )}
                        <SlideFrame
                            title={isNew ? '新建责任中心' : '编辑责任中心'}
                            show={showCernterSlideFrame}
                            onClose={() => this.setState({ showCernterSlideFrame: false })}
                        >
                            <NewResponsibilityCenter
                                params={centerParams}
                                close={this.handleCloseCenterSlide}
                            />
                        </SlideFrame>
                        <ListSelector
                            visible={centerVisible}
                            selectorItem={centerItem}
                            // onOk={this.handleTenantListOk}
                            onCancel={() => this.cancelAssignCompany(false)}
                            showSelectTotal={true}
                        />
                        {/* 添加责任中心 */}
                         <ListSelector
                            visible={addCenterVisible}
                            selectorItem={addCenterItem}
                            onOk={this.handleAddCenter}
                            onCancel={() => this.addResponsibility(false)}
                            showSelectTotal={true}
                            single={false}
                        />
                    </TabPane>
                    <TabPane tab='责任中心组' key='cernterGroup'>
                        {tabVal === 'cernterGroup' && (
                            <div>
                                <SearchArea
                                    searchForm={groupSearchForm}
                                    submitHandle={this.searhGroup}
                                    clearHandle={this.clearGroup}
                                    maxLength={4}
                                />
                                <div className='btnMargin'>
                                    <Button type="primary" onClick={this.addCenterGroup}>新建</Button>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <CustomTable
                                        columns={groupColumns}
                                        url={`${config.baseUrl}/api/responsibilityCenter/group/query`}
                                        params={{ setOfBooksId: setOfBooksId }}
                                        ref={ref => this.groupTable = ref}

                                    />
                                </div>
                            </div>
                        )}
                        <SlideFrame
                            title={isNew?'新建责任中心组':'编辑责任中心组'}
                            show={showGroupSlideFrame}
                            onClose={() => this.setState({ showGroupSlideFrame: false })}
                        >
                            <NewResponsibilityCenterGroup
                             params={searchGropParam}
                             close={this.handleCloseGroupSlide}
                            />
                        </SlideFrame>

                    </TabPane>
                </Tabs>
                {/* <ListSelector
                  visible={companyButVisible}
                  onCancel={this.onCompanyCancel}
                  onOk={this.onCompanyOk}
                  selectorItem={selectorItem}
                  extraParams={{dimensionItemId}}
                  single={false}
                  showSelectTotal={true}
               /> */}
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        user: state.user.currentUser,
        company: state.user.company
    };
}
export default connect(mapStateToProps, null, null, { withRef: true })(ResponsibilityCenter);
