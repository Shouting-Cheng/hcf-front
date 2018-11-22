import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Input, Row, Col, Tag, Icon, Card, Tree, List } from 'antd';
import PropTypes from 'prop-types';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;

class LineAddTransferModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autoExpandParent: true,
            treeData: [
                {
                    title: 'parent 1',
                    key: '0-0',
                    parent: 0,
                    children: [
                        {
                            title: 'parent 1-0',
                            key: '0-0-0',
                            parent: "0-0",
                            children: [
                                {
                                    title: 'leaf',
                                    key: '0-0-0-0',
                                    parent: "0-0-0",
                                },
                                {
                                    title: 'leaf',
                                    key: '0-0-0-1',
                                    parent: "0-0-0"
                                },
                            ],
                        },
                    ],
                },
                {
                    title: 'parent 1-1',
                    key: '0-1',
                    parent: 0,
                    children: [
                        {
                            title: 'parent 1-1',
                            key: '0-1-0',
                            parent: "0-1",
                            children: [
                                {
                                    title: 'leaf',
                                    key: '0-1-0-0',
                                    parent: "0-1-0"
                                },
                                {
                                    title: 'leaf',
                                    key: '0-1-0-1',
                                    parent: "0-1-0"
                                },
                            ],
                        },
                    ],
                },


            ],
            newTreeData: [
                { title: 'parent 1', key: '0-0', parent: 0 },
                { title: 'parent 1-0', key: '0-0-0', parent: "0-0" },
                { title: 'leaf', key: '0-0-0-0', parent: "0-0-0" },
                { title: 'leaf', key: '0-0-0-1', parent: "0-0-0" },
                { title: 'parent 1', key: '0-1', parent: 0 },
                { title: 'parent 1-1', key: '0-1-0', parent: "0-1" },
                { title: 'leaf', key: '0-1-0-0', parent: "0-1-0" },
                { title: 'leaf', key: '0-1-0-1', parent: "0-1-0" },
            ],
            selectTreeNodes: [],
            selectedTreeInfo: [],
            changeBtn: false,
            selectTreeArr: [],
            renderChildren: false,
            showRenderItem: false,
            singleclick: false,
            isShowTreeNode: false,
            searchListInfo: []
        }


    }
    componentWillMount() {
        this.setState({
            isShowTreeNode: true
        })
    }
    /**
     * 取消弹窗
     */
    onCloseTransferModal = () => {
        this.props.onCloseTransferModal()
    }
    /**渲染树 */
    renderTreeNodes = (data) => {
        const { selectTreeNode, changeBtn } = this.state
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode
                        className="tree-select"
                        title={<span><span className={'left-title-w1'}>{item.title}</span>
                            {item.isSelectAll ? <a className='right-tree-title' onClick={(e) => this.cancelSelectAll(e, selectTreeNode, item)}>取消全选</a> :
                                <a className='right-tree-title' onClick={(e) => this.handleSelectAll(e, selectTreeNode, item)}>全选</a>}</span>
                        }
                        key={item.key}
                        dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return <TreeNode dataRef={item} title={<span className="left-title-w2">{item.title}</span>} key={item.key} />;
        })
    }
    /**选中树节点的每个元素 */
    treeNodeSelect = (selectedKeys, info) => {

        let selectedTreeInfo = this.state.selectedTreeInfo;
        if (info.selected) {
            if (!selectedTreeInfo.find(o => o.key == info.node.props.dataRef.key)) {
                selectedTreeInfo.push(info.node.props.dataRef);
            }
        } else {

            let parent = info.node.props.dataRef.parent;

            let temp = this.getItemById(this.state.treeData, info.node.props.dataRef.key);
            temp.isSelectAll = false;

            while (parent) {
                let obj = this.getItemById(this.state.treeData, parent);
                obj.isSelectAll = false;
                parent = obj.parent;
            }
            selectedTreeInfo.splice(selectedTreeInfo.findIndex(o => o.key == info.node.props.dataRef.key), 1);
        }

        this.setState({ selectTreeNodes: selectedKeys, selectedTreeInfo });


    }
    getItemById = (data = [], id) => {
        for (let i = 0, len = data.length; i < len; i++) {
            let item = data[i];
            if (item.key == id) {
                return item;
            } else {
                let result = this.getItemById(item.children, id);
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
            this.selectAllChildren(item.children, selectedKeys);
        }
    }

    /**点击全选按钮事件 */
    handleSelectAll = (e, selectTreeNode, item) => {
        e.preventDefault();
        e.stopPropagation();
        let { treeData, selectTreeNodes } = this.state;

        let selectedKeys = [];

        let obj = this.getItemById(treeData, item.key);
        let selectedTreeInfo = this.state.selectedTreeInfo;

        selectedKeys.push(item);

        this.selectAllChildren(obj.children, selectedKeys);

        obj.isSelectAll = true;

        selectedKeys.map(item => {
            let index = selectTreeNodes.indexOf(item.key);
            if (index < 0) {
                selectTreeNodes.push(item.key);
            }

            if (!selectedTreeInfo.find(o => o.key == item.key)) {
                selectedTreeInfo.push(item);
            }
        })
        this.setState({ treeData, selectTreeNodes: [...selectTreeNodes], selectedTreeInfo });

        // this.alreadySelectLists(treeData, this.state.selectTreeNodes)

    }


    /**取消全选以及子项 */
    cancelSelectAllChildren = (data = [], selectedKeys = []) => {
        for (let i = 0, len = data.length; i < len; i++) {
            let item = data[i];
            item.isSelectAll = false;
            selectedKeys.push(item);
            this.cancelSelectAllChildren(item.children, selectedKeys);
        }
    }

    /**取消全选 */
    cancelSelectAll = (e, selectTreeNode, item) => {

        e.preventDefault();
        e.stopPropagation();

        let { treeData, selectedTreeInfo } = this.state;

        let parent = item.parent;

        while (parent) {
            let obj = this.getItemById(treeData, parent);
            obj.isSelectAll = false;
            parent = obj.parent;
        }

        let selectedKeys = [];

        let obj = this.getItemById(treeData, item.key);

        selectedKeys.push(item);

        this.cancelSelectAllChildren(obj.children, selectedKeys);

        obj.isSelectAll = false;

        selectedKeys.map(item => {

            let index = selectedTreeInfo.findIndex(o => o.key == item.key);

            if (index >= 0) {
                selectedTreeInfo.splice(index, 1);
            }

        })

        this.setState({ treeData, selectTreeNodes: [...selectedTreeInfo.map(o => o.key)], selectedTreeInfo });

    }
    /***渲染已选择区数据 */
    alreadySelectLists = (data, selectedKeys) => {
        let selectTreeArr = this.filterSlectArr(data, selectedKeys);
        this.setState({
            selectedTreeInfo: selectTreeArr
        });
    }
    filterSlectArr = (data, selectedKeys) => {
        let selectTreeArr = [];
        for (let i = 0; i < selectedKeys.length; i++) {
            selectTreeArr.push(data.filter(item => item.key === selectedKeys[i])[0]);
            for (let j = 0; j < data.length; j++) {
                selectTreeArr.push(data[j].children.filter(item => item.key === selectedKeys[i])[0]);
            }
        }
        for (var i = 0; i < selectTreeArr.length; i++) {
            if (selectTreeArr[i] == undefined) {
                selectTreeArr.splice(i, 1);
                i = i - 1;
            }
        }
        return selectTreeArr
    }
    /**删除右边数据 */
    deleteListItem = (listItem) => {
        const { selectedTreeInfo, treeData } = this.state;
        const rightSlectList = selectedTreeInfo.filter(item => item.key !== listItem.key);

        let parent = listItem.parent;

        let temp = this.getItemById(treeData, listItem.key);
        temp.isSelectAll = false;

        while (parent) {
            let obj = this.getItemById(treeData, parent);
            obj.isSelectAll = false;
            parent = obj.parent;
        }

        this.setState({
            selectTreeNodes: rightSlectList.map(o => o.key),
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
            return <Row key={item.key} style={{ marginTop: 5 }}>
                <Col span={22} style={{ fontSize: 14 }}>{item.title}</Col>
                <Col span={2} onClick={(e) => { this.deleteListItem(item) }} style={{ cursor: 'pointer' }}><Icon type="close" /></Col>
            </Row>;
        })

    }
    /** 
     * 
     * 左边待选区按照搜索条件查询
     * */
    onTreeSelecSearch = (value) => {
        console.log(value);
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
        const { selectedTreeInfo } = this.state;
        const searchList = selectedTreeInfo.filter(item => item.title === value);
        this.setState({ selectedTreeInfo: searchList })

    }
    render() {
        const { visible, title } = this.props;
        const { autoExpandParent, treeData, selectTreeNodes, selectedTreeInfo, renderChildren, singleclick, isShowTreeNode, searchListInfo } = this.state;
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
                            {isShowTreeNode ?
                                <Tree
                                    defaultExpandedKeys={['0-0-0', '0-0-1']}
                                    selectedKeys={selectTreeNodes}
                                    autoExpandParent={true}
                                    multiple={true}
                                    onSelect={this.treeNodeSelect}
                                >
                                    {this.renderTreeNodes(treeData)}
                                </Tree> : searchListInfo.map(list => (
                                    <Row key={list.key} style={{ marginTop: 5 }}>
                                        <Col onClick={(e) => this.clickList(list)}>{list.title}</Col>
                                    </Row>
                                ))
                            }

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