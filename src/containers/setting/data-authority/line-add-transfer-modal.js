import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Input, Row, Col, Tag, Icon, Card, Tree, List, Spin } from 'antd';
import PropTypes from 'prop-types';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
import DataAuthorityService from 'containers/setting/data-authority/data-authority.service';

class LineAddTransferModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autoExpandParent: true,
            treeData: [],
            // treeData: [
            //     {
            //         title: 'parentId 1',
            //         id: '0-0',
            //         parentId: null,
            //         details: [
            //             {
            //                 title: 'parentId 1-0',
            //                 id: '0-0-0',
            //                 parentId: "0-0",
            //                 details: [
            //                     {
            //                         title: 'leaf',
            //                         id: '0-0-0-0',
            //                         parentId: "0-0-0",
            //                     },
            //                     {
            //                         title: 'leaf',
            //                         id: '0-0-0-1',
            //                         parentId: "0-0-0"
            //                     },
            //                 ],
            //             },
            //         ],
            //     },
            //     {
            //         title: 'parentId 1-1',
            //         id: 1234,
            //         parentId: null,
            //         details: [
            //             // {
            //             //     title: 'parentId 1-1',
            //             //     id: '0-1-0',
            //             //     parentId: "0-1",
            //             //     details: [
            //             //         {
            //             //             title: 'leaf',
            //             //             id: '0-1-0-0',
            //             //             parentId: "0-1-0"
            //             //         },
            //             //         {
            //             //             title: 'leaf',
            //             //             id: '0-1-0-1',
            //             //             parentId: "0-1-0"
            //             //         },
            //             //     ],
            //             // },
            //         ],
            //     },


            // ],

            newTreeData: [
                { title: 'parentId 1', key: '0-0', parentId: 0 },
                { title: 'parentId 1-0', key: '0-0-0', parentId: "0-0" },
                { title: 'leaf', key: '0-0-0-0', parentId: "0-0-0" },
                { title: 'leaf', key: '0-0-0-1', parentId: "0-0-0" },
                { title: 'parentId 1', key: '0-1', parentId: 0 },
                { title: 'parentId 1-1', key: '0-1-0', parentId: "0-1" },
                { title: 'leaf', key: '0-1-0-0', parentId: "0-1-0" },
                { title: 'leaf', key: '0-1-0-1', parentId: "0-1-0" },
            ],
            selectTreeNodes: [],
            selectedTreeInfo: [],
            changeBtn: false,
            selectTreeArr: [],
            renderChildren: false,
            showRenderItem: false,
            singleclick: false,
            isShowTreeNode: false,
            searchListInfo: [],
            rightList: [],
            treeLoading:true
        }


    }
    componentWillMount() {
        // DataAuthorityService.getTenantCompany(undefined).then(res => {
        //     console.log(res.data)
        //     this.setState({
        //         treeData: res.data
        //     })
        // })
        this.setState({
            isShowTreeNode: true,
        })
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            DataAuthorityService.getTenantCompany(undefined).then(res => {
                console.log(res.data);
                if(res.status===200){
                    this.setState({
                        treeLoading:false,
                        treeData: res.data
                    })
                }
                
            })
        }
        const { treeData } = this.state;
        for (let i = 0; i < treeData.length; i++) {
            let item = treeData[i];
            item.isSelectAll = false;
            if (item.details) {
                for (let j = 0; j < item.details.length; j++) {
                    item.details[j].isSelectAll = false
                }
            }
        }
        this.setState({
            selectTreeNodes: [],
            selectedTreeInfo: [],
            treeData
        })
    }
    /**
     * 取消弹窗
     */
    onCloseTransferModal = () => {
        this.props.onCloseTransferModal();
    }
    /**渲染树 */
    renderTreeNodes = (data) => {
        const { selectTreeNode, changeBtn } = this.state
        return data.map((item) => {
            if (item.details) {
                return (
                    <TreeNode
                        className="tree-select"
                        title={<span><span className={'left-title-w1'}>{item.code}-{item.name}</span>
                            {item.isSelectAll ? <a className='right-tree-title' onClick={(e) => this.cancelSelectAll(e, selectTreeNode, item)}>取消全选</a> :
                                <a className='right-tree-title' onClick={(e) => this.handleSelectAll(e, selectTreeNode, item)}>全选</a>}</span>
                        }
                        key={item.id}
                        dataRef={item}>
                        {this.renderTreeNodes(item.details)}
                    </TreeNode>
                )
            }
            return <TreeNode dataRef={item} title={<span className="left-title-w2">{item.code}-{item.name}</span>} key={item.id} />;
        })
    }
    /**选中树节点的每个元素 */
    treeNodeSelect = (selectedKeys, info) => {
        console.log(info)
        let selectedTreeInfo = this.state.selectedTreeInfo;
        let rightList = this.state.rightList;
        if (info.selected) {
            if (!selectedTreeInfo.find(o => o.id == info.node.props.dataRef.id)) {
                selectedTreeInfo.push(info.node.props.dataRef);
            }
            rightList.push(info.node.props.dataRef);
            this.setState({ rightList })
        } else {

            let parentId = info.node.props.dataRef.parentId;

            let temp = this.getItemById(this.state.treeData, info.node.props.dataRef.id);
            temp.isSelectAll = false;

            while (parentId) {
                let obj = this.getItemById(this.state.treeData, parentId);
                obj.isSelectAll = false;
                parentId = obj.parentId;
            }
            selectedTreeInfo.splice(selectedTreeInfo.findIndex(o => o.id == info.node.props.dataRef.id), 1);
        }

        this.setState({ selectTreeNodes: selectedKeys, selectedTreeInfo });


    }
    getItemById = (data = [], id) => {
        for (let i = 0, len = data.length; i < len; i++) {
            let item = data[i];
            if (item.id == id) {
                return item;
            } else {
                let result = this.getItemById(item.details, id);
                if (result) {
                    return result;
                }
            }
        }
    }
    /**父节点点击全选后子节点也全部选择 */
    selectAllChildren = (data = [], selectedKeys = []) => {
        for (let i = 0, len = data.length; i < len; i++) {
            let item = data[i];
            item.isSelectAll = true;
            selectedKeys.push(item);
            this.selectAllChildren(item.details, selectedKeys);
        }
    }

    /**点击全选按钮事件 */
    handleSelectAll = (e, selectTreeNode, item) => {
        e.preventDefault();
        e.stopPropagation();
        let { treeData, selectTreeNodes, rightList } = this.state;

        let selectedKeys = [];

        let obj = this.getItemById(treeData, item.id);
        let selectedTreeInfo = this.state.selectedTreeInfo;

        selectedKeys.push(item);

        this.selectAllChildren(obj.details, selectedKeys);

        obj.isSelectAll = true;

        selectedKeys.map(item => {
            let index = selectTreeNodes.indexOf(item.id);
            if (index < 0) {
                selectTreeNodes.push(item.id);
            }

            if (!selectedTreeInfo.find(o => o.id == item.id)) {
                selectedTreeInfo.push(item);
                rightList.push(item);
            }
        })
        this.setState({ treeData, selectTreeNodes: [...selectTreeNodes], selectedTreeInfo, rightList });

        // this.alreadySelectLists(treeData, this.state.selectTreeNodes)

    }


    /**取消全选以及子项 */
    cancelSelectAllChildren = (data = [], selectedKeys = []) => {
        for (let i = 0, len = data.length; i < len; i++) {
            let item = data[i];
            item.isSelectAll = false;
            selectedKeys.push(item);
            this.cancelSelectAllChildren(item.details, selectedKeys);
        }
    }

    /**取消全选 */
    cancelSelectAll = (e, selectTreeNode, item) => {

        e.preventDefault();
        e.stopPropagation();

        let { treeData, selectedTreeInfo } = this.state;

        let parentId = item.parentId;

        while (parentId) {
            let obj = this.getItemById(treeData, parentId);
            obj.isSelectAll = false;
            parentId = obj.parentId;
        }

        let selectedKeys = [];

        let obj = this.getItemById(treeData, item.id);

        selectedKeys.push(item);

        this.cancelSelectAllChildren(obj.details, selectedKeys);

        obj.isSelectAll = false;

        selectedKeys.map(item => {

            let index = selectedTreeInfo.findIndex(o => o.id == item.id);

            if (index >= 0) {
                selectedTreeInfo.splice(index, 1);
            }

        })

        this.setState({ treeData, selectTreeNodes: [...selectedTreeInfo.map(o => o.id)], selectedTreeInfo });

    }
    /**删除右边数据 */
    deleteListItem = (listItem) => {
        const { selectedTreeInfo, treeData } = this.state;
        const rightSlectList = selectedTreeInfo.filter(item => item.id !== listItem.id);

        let parentId = listItem.parentId;

        let temp = this.getItemById(treeData, listItem.id);
        temp.isSelectAll = false;

        while (parentId) {
            let obj = this.getItemById(treeData, parentId);
            obj.isSelectAll = false;
            parentId = obj.parentId;
        }

        this.setState({
            selectTreeNodes: rightSlectList.map(o => o.id),
            selectedTreeInfo: rightSlectList,
            treeData
        })
    }
    ok = () => {

    }
    /** 
     * 单个点击树节点右边渲染已选项
    */
    renderItems = (selectedTreeInfo) => {
        return selectedTreeInfo.map((item) => {
            return <Row key={item.id} style={{ marginTop: 5 }}>
                <Col span={22} style={{ fontSize: 14 }}>{item.code}-{item.name}</Col>
                <Col span={2} onClick={(e) => { this.deleteListItem(item) }} style={{ cursor: 'pointer' }}><Icon type="close" /></Col>
            </Row>;
        })

    }
    /** 
     * 
     * 左边待选区按照搜索条件查询
     * */
    onTreeSelecSearch = (value) => {
        this.setState({
            isShowTreeNode: false,
            searchListInfo: this.state.newTreeData
        });
    }
    /**
     * 点击查询出来的单个条件
     */
    clickList = (list) => {
        const { treeData, selectedTreeInfo } = this.state;
        this.setState({
            isShowTreeNode: true,
            selectTreeNodes: [list.key],
            selectedTreeInfo: [list]
        });
    }
    /**
     * 右边已选区按照搜索条件查询
     */
    onTreeInfoSearch = (value) => {
        let { rightList, selectedTreeInfo } = this.state;
        console.log(value)
        if (value === '') {
            console.log(rightList);
            this.setState({ selectedTreeInfo: rightList })
        } else {
            const { selectedTreeInfo } = this.state;
            const searchList = selectedTreeInfo.filter(item => item.code || item.name === value);
            this.setState({ selectedTreeInfo: searchList });
        }
    }
    render() {
        const { visible, title } = this.props;
        const { autoExpandParent, treeData,treeLoading, selectTreeNodes, selectedTreeInfo, renderChildren, singleclick, isShowTreeNode, searchListInfo } = this.state;
        return (
            <Modal
                visible={visible}
                title={title}
                width={800}
                destroyOnClose={true}
                onCancel={this.onCloseTransferModal}
                onOk={this.ok}
            >
                <Row>
                    <Col span={12}>
                        <Card title="待选区">
                            <Search
                                style={{ marginBottom: 8 }}
                                enterButton
                                placeholder="请输入公司代码/名称"
                                onSearch={this.onTreeSelecSearch}
                            />
                            <div className='treeStyle'>
                                {isShowTreeNode ?
                                    <Spin spinning={treeLoading}>
                                        <Tree
                                            defaultExpandedKeys={['0-0-0', '0-0-1']}
                                            selectedKeys={selectTreeNodes}
                                            autoExpandParent={true}
                                            multiple={true}
                                            onSelect={this.treeNodeSelect}
                                        >
                                            {this.renderTreeNodes(treeData)}
                                        </Tree>
                                    </Spin>
                                    : searchListInfo.map(list => (
                                        <Row key={list.key} style={{ marginTop: 5 }}>
                                            <Col onClick={(e) => this.clickList(list)}>{list.title}</Col>
                                        </Row>
                                    ))
                                }
                            </div>


                        </Card>
                    </Col>
                    <Col span={10} offset={2}>
                        <Card title="已选择">
                            <Search
                                style={{ marginBottom: 8 }}
                                placeholder="请输入公司代码/名称"
                                enterButton
                                onSearch={this.onTreeInfoSearch}
                            />
                            <div>{this.renderItems(selectedTreeInfo)}</div>
                        </Card>
                    </Col>
                </Row>

            </Modal>
        )
    }
}
LineAddTransferModal.PropTypes = {
    visible: PropTypes.bool,  //对话框是否可见
    title: PropTypes.string,//对话框标题
}
function mapStateToProps() {
    return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(LineAddTransferModal);