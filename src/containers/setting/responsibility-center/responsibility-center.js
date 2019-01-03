import React from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import { Button, Row, Col, Tabs } from 'antd';
import 'styles/setting/responsibility-center/responsibility-center.scss';
import CustomTable from 'components/Widget/custom-table';
import SlideFrame from 'widget/slide-frame';
import NewResponsibilityCenter from'containers/setting/responsibility-center/new-responsibility-cernter'
import NewResponsibilityCenterGroup from'containers/setting/responsibility-center/new-responsibility-cernter-group'
const TabPane = Tabs.TabPane;
class ResponsibilityCenter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cernterSearchForm: [
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
            ],
            cernterColumns: [
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
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: 'operate',
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
                },
                {
                    title: this.$t("common.operation"),//"操作",
                    dataIndex: 'operate',
                }
            ],
            selectedRowKeys: [],
            tabVal: 'cernter',
            showCernterSlideFrame:false,
            showGroupSlideFrame:false
        }
    }
    /**tabs切换事件 */
    onChangeTab = (key) => {
        this.setState({
            tabVal: key
        })
    }
    /**责任中心搜索，清空，表格操作，新建等功能 */
    searhCernter = () => {

    }
    clearCenter = () => {

    }
    //勾选责任中心，多选
    onSelectItem = (record, selected) => {
        console.log(selected)
    }
    //全选责任中心
    onSelectAll = (selected) => {

    }
    //新建责任中心
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
                                        // url={`${config.authUrl}/api/system/data/authority/query`}
                                        // ref={ref => this.table = ref}
                                        rowSelection={rowSelection}
                                    />
                                </div>
                            </div>
                        )}
                         <SlideFrame
                          title={'新建责任中心'}
                          show={showCernterSlideFrame}
                          onClose={() => this.setState({ showCernterSlideFrame: false })}
                         >
                            <NewResponsibilityCenter
                            
                            />
                         </SlideFrame>
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
                                        // url={`${config.authUrl}/api/system/data/authority/query`}
                                        // ref={ref => this.table = ref}

                                    />
                                </div>
                            </div>
                        )}
                         <SlideFrame
                          title={'新建责任中心组'}
                          show={showGroupSlideFrame}
                          onClose={() => this.setState({ showGroupSlideFrame: false })}
                         >
                            <NewResponsibilityCenterGroup
                            
                            />
                         </SlideFrame>

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