import React from 'react';
import { connect } from 'dva';
<<<<<<< HEAD
import config from 'config';
import SearchArea from 'widget/search-area';
import { Button, Row, Col, Tabs, Popconfirm, Badge, Divider } from 'antd';
import 'styles/setting/responsibility-center/responsibility-center.scss';
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame';
import NewResponsibilityCenter from 'containers/setting/responsibility-center/new-responsibility-cernter'
import NewResponsibilityCenterGroup from 'containers/setting/responsibility-center/new-responsibility-cernter-group'
=======
import SearchArea from 'widget/search-area';
import { Button, Row, Col, Tabs } from 'antd';
import 'styles/setting/responsibility-center/responsibility-center.scss';
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame';
import NewResponsibilityCenter from'containers/setting/responsibility-center/new-responsibility-cernter'
import NewResponsibilityCenterGroup from'containers/setting/responsibility-center/new-responsibility-cernter-group'
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
const TabPane = Tabs.TabPane;
class ResponsibilityCenter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cernterSearchForm: [
<<<<<<< HEAD
                {
                    type: 'select', id: 'setOfBooksId', label: '账套', options: [], isRequired: true, colSpan: '6',
                    getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
                    getParams: { roleType: 'TENANT' },
                    allowClear: false,
                    method: 'get', labelKey: 'setOfBooksName', valueKey: 'id',
                    event: 'SETOFBOOKSID',
                    // defaultValue: `${props.company.setOfBooksId}-${props.company.setOfBooksName} `,
                    renderOption: data => `${data.setOfBooksCode} - ${data.setOfBooksName}`
                },
                { type: 'input', id: 'resiponsibilityCenterCode', label: '责任中心代码', colSpan: '6', },
                { type: 'input', id: 'resiponsibilityCenterName', label: '责任中心名称', colSpan: '6', },
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
                    // defaultValue: `${props.company.setOfBooksId}-${props.company.setOfBooksName} `,
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
=======
                { type: 'select', id: 'setOfBooksId', label: '账套', options: [], isRequired: 'true', colSpan: '6', },
                { type: 'input', id: 'responsibilityCode', label: '责任中心代码', colSpan: '6', },
                { type: 'input', id: 'responsibilityName', label: '责任中心名称', colSpan: '6', },
                { type: 'select', id: 'status', label: '状态', options: [], colSpan: '6', }
            ],
            groupSearchForm: [
                { type: 'select', id: 'setOfBooksId', label: '账套', options: [], isRequired: 'true', colSpan: '6', },
                { type: 'input', id: 'responsibilityCode', label: '责任中心代码', colSpan: '6', },
                { type: 'input', id: 'responsibilityName', label: '责任中心名称', colSpan: '6', },
                { type: 'select', id: 'status', label: '状态', options: [], colSpan: '6', }
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
            ],
            cernterColumns: [
                {
                    title: '责任中心代码',
<<<<<<< HEAD
                    dataIndex: 'resiponsibilityCenterCode',
                },
                {
                    title: '责任中心名称',
                    dataIndex: 'resiponsibilityCenterName',
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
=======
                    dataIndex: 'responsibilityCode',
                },
                {
                    title: '责任中心名称',
                    dataIndex: 'responsibilityName',
                },
                {
                    title: '状态',
                    dataIndex: 'status',
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
                },
                {
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: 'operate',
<<<<<<< HEAD
                    render: (text, record) => (
                        <span>
                            {/*编辑*/}
                            <a onClick={(e) => this.editCenterItem(record)}>{this.$t("common.edit")}</a>
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
                                <a>删除</a>
                            </Popconfirm>
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
                },
                {
                    title: '添加责任中心',
                    dataIndex: 'addResponsibility',
                    render: (text, record) => (
                        <span>
                            {/**添加责任中心 */}
                            <a>添加责任中心</a>
                        </span>
                    )
=======
                }
            ],
            groupColumns:[
                {
                    title: '责任中心代码',
                    dataIndex: 'responsibilityCode',
                },
                {
                    title: '责任中心名称',
                    dataIndex: 'responsibilityName',
                },
                {
                    title: '状态',
                    dataIndex: 'status',
                },
                {
                    title:'添加责任中心',
                    dataIndex:'addResponsibility'
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
                },
                {
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: 'operate',
<<<<<<< HEAD
                    render: (text, record) => (
                        <span>
                            {/*编辑*/}
                            <a>{this.$t("common.edit")}</a>
                            <Divider type="vertical" />
                            {/*删除*/}
                            <Popconfirm
                                placement="top"
                                title={'确认删除？'}
                                onConfirm={e => {
                                    e.preventDefault();
                                    // this.deleteCost(record);
                                }}
                                okText="确定"
                                cancelText="取消"
                            >
                                <a>删除</a>
                            </Popconfirm>
                        </span>
                    )
=======
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
                }
            ],
            selectedRowKeys: [],
            tabVal: 'cernter',
<<<<<<< HEAD
            showCernterSlideFrame: false,
            showGroupSlideFrame: false,
            setOfBooksId: props.company.setOfBooksId,
            searchParams: {},
            isNew: false,
            centerParams: {}
        }
    }

=======
            showCernterSlideFrame:false,
            showGroupSlideFrame:false
        }
    }
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
    /**tabs切换事件 */
    onChangeTab = (key) => {
        this.setState({
            tabVal: key
        })
    }
    /**责任中心搜索，清空，表格操作，新建等功能 */
<<<<<<< HEAD
    searhCernter = (values) => {
        values.resiponsibilityCenterCode = values.resiponsibilityCenterCode ? values.resiponsibilityCenterCode : undefined,
            values.resiponsibilityCenterName = values.resiponsibilityCenterName ? values.resiponsibilityCenterName : undefined,
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
    //删除责任心中单条数据
    editCenterItem = (record) => {
        this.setState({
            isNew: false,
            centerParams: JSON.parse(JSON.stringify(record)),
        }, () => {
            this.setState({ showCernterSlideFrame: true })
        })
=======
    searhCernter = () => {

    }
    clearCenter = () => {

>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
    }
    //勾选责任中心，多选
    onSelectItem = (record, selected) => {
        console.log(selected)
    }
    //全选责任中心
    onSelectAll = (selected) => {

    }
    //新建责任中心
<<<<<<< HEAD
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
    searhGroup = () => {

    }
    clearGroup = () => {

    }
    //新建责任中心组
    addCenterGroup = () => {
        this.setState({
            showGroupSlideFrame: true
        })
    }
    render() {
        const { cernterSearchForm, cernterColumns, selectedRowKeys, isNew, centerParams, tabVal, groupSearchForm, groupColumns, showCernterSlideFrame, showGroupSlideFrame, setOfBooksId } = this.state;
=======
    addCenter=()=>{
        this.setState({
            showCernterSlideFrame:true
        })
    }
    /**责任中心组搜索，清空，表格操作，新建等功能 */
    searhGroup=()=>{

    }
    clearGroup=()=>{

    }
    //新建责任中心组
    addCenterGroup=()=>{
        this.setState({
            showGroupSlideFrame:true
        })
    }
    render() {
        const { cernterSearchForm, cernterColumns, selectedRowKeys, tabVal, groupSearchForm,groupColumns,showCernterSlideFrame,showGroupSlideFrame } = this.state;
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
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
                                    <Button type="primary">批量分配公司</Button>
                                    <Button type="primary">导入</Button>
                                    <Button type="primary">导出</Button>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <CustomTable
                                        columns={cernterColumns}
<<<<<<< HEAD
                                        url={`${config.baseUrl}/api/resiponsibilitycenter/query`}
                                        params={{ setOfBooksId: setOfBooksId }}
                                        ref={ref => this.centerTable = ref}
=======
                                        // url={`${config.authUrl}/api/system/data/authority/query`}
                                        // ref={ref => this.table = ref}
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
                                        rowSelection={rowSelection}
                                    />
                                </div>
                            </div>
                        )}
<<<<<<< HEAD
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
=======
                         <SlideFrame
                          title={'新建责任中心'}
                          show={showCernterSlideFrame}
                          onClose={() => this.setState({ showCernterSlideFrame: false })}
                         >
                            <NewResponsibilityCenter
                            
                            />
                         </SlideFrame>
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
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
<<<<<<< HEAD
                                <div className='btnMargin'>
=======
                                 <div className='btnMargin'>
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604
                                    <Button type="primary" onClick={this.addCenterGroup}>新建</Button>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <CustomTable
                                        columns={groupColumns}
<<<<<<< HEAD
                                        url={`${config.baseUrl}/api/resiponsibilitycenter/group/query`}
                                        params={{ setOfBooksId: setOfBooksId }}
                                    // ref={ref => this.table = ref}
=======
                                        // url={`${config.authUrl}/api/system/data/authority/query`}
                                        // ref={ref => this.table = ref}
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604

                                    />
                                </div>
                            </div>
                        )}
<<<<<<< HEAD
                        <SlideFrame
                            title={'新建责任中心组'}
                            show={showGroupSlideFrame}
                            onClose={() => this.setState({ showGroupSlideFrame: false })}
                        >
                            <NewResponsibilityCenterGroup

                            />
                        </SlideFrame>
=======
                         <SlideFrame
                          title={'新建责任中心组'}
                          show={showGroupSlideFrame}
                          onClose={() => this.setState({ showGroupSlideFrame: false })}
                         >
                            <NewResponsibilityCenterGroup
                            
                            />
                         </SlideFrame>
>>>>>>> 1ad68f87ea29ed7c4fd94e81ed3185b10065e604

                    </TabPane>
                </Tabs>

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