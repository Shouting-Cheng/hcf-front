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
                    children: [
                        {
                            title: 'parent 1-0',
                            key: '0-0-0',
                            // children: [
                            //     {
                            //         title: 'leaf',
                            //         key: '0-0-0-0',
                            //     },
                            //     {
                            //         title: 'leaf',
                            //         key: '0-0-0-1',
                            //     },
                            // ],
                        },
                    ],
                },
                {
                    title: 'parent 1-1',
                    key: '0-1',
                    children: [
                        {
                            title: 'parent 1-0',
                            key: '0-1-0',
                            // children: [
                            //     {
                            //         title: 'leaf',
                            //         key: '0-1-0-0',
                            //     },
                            //     {
                            //         title: 'leaf',
                            //         key: '0-1-0-1',
                            //     },
                            // ],
                        },
                    ],
                },


            ],
            selectTreeNode: [],
            selectedTreeInfo:'',
            changeBtn:false,
        }


    }
    componentWillMount(){
        this.setState({
            selectTreeNode:[]
        })
    }
    /**渲染树 */
    renderTreeNodes = (data) => {
        const { selectTreeNode,changeBtn } = this.state
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode
                        className="tree-select"
                        title={<span><span className={'left-title-w1'}>{item.title}</span>
                            {changeBtn?<a className='right-tree-title' onClick={(e) => this.cancelSelectAll(e, selectTreeNode)}>取消全选</a>:
                            <a className='right-tree-title' onClick={(e) => this.handleSelectAll(e, selectTreeNode)}>全选</a>}</span>}
                        key={item.key}
                        dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return <TreeNode title={<span className="left-title-w2">{item.title}</span>} key={item.key} />;
        })
    }
    onCloseTransferModal = () => {
        this.props.onCloseTransferModal()
    }
    /**全选 */
    handleSelectAll = (e, selectTreeNode) => {
        e.preventDefault();
        e.stopPropagation();
        const { treeData } = this.state;
        let selectTreeArr = [];
        for (let i = 0; i < selectTreeNode.length; i++) {
            selectTreeArr.push(treeData.filter(item => item.key === selectTreeNode[i])[0]);
        }
        console.log(selectTreeArr)
        let selectTreeKey = [];
        for (let j = 0; j < selectTreeArr.length; j++) {
            if (selectTreeArr[j] && selectTreeArr[j].children) {
                selectTreeKey.push(selectTreeArr[j].children[0].key);
                this.setState({
                    selectTreeNode: [...selectTreeNode, ...selectTreeKey]
                })
            }
        }

    }
    /**取消全选 */
    cancelSelectAll=()=>{
        
    }
    handleSelectTree = (selectedKeys, info) => {
        console.log(info)
        this.setState({
            selectTreeNode: selectedKeys,
            selectedTreeInfo:info,

        });
        if(selectedKeys&&info.selected===false){
            this.setState({
                changeBtn:true
            })
        }
    }
    onCheck = (checkedKeys, info) => {
        console.log('onCheck', checkedKeys, info);
    }

    render() {
        const { visible, title } = this.props;
        const { autoExpandParent, treeData, selectTreeNode } = this.state;
        return (
            <Modal
                visible={visible}
                title={title}
                width={800}
                destroyOnClose={true}
                onCancel={this.onCloseTransferModal}
            >
                <Row>
                    <Col span={12}>
                        <Card title="待选区">
                            <Search style={{ marginBottom: 8 }} placeholder="Search" />
                            <Tree
                                defaultExpandedKeys={['0-0-0', '0-0-1']}
                                selectedKeys={selectTreeNode}
                                onCheck={this.onCheck}
                                autoExpandParent={true}
                                multiple={true}
                                onSelect={this.handleSelectTree}
                            >
                                {this.renderTreeNodes(treeData)}
                            </Tree>
                        </Card>
                    </Col>
                    <Col span={10} offset={2}>
                        <Card title="已选择">
                            <Search style={{ marginBottom: 8 }} placeholder="请输入公司代码/名称" />

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