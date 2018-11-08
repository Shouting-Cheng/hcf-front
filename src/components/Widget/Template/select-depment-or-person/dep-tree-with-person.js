/**
 * Created by zhouli on 18/1/30
 * Email li.zhou@huilianyi.com
 * 组织架构树显示到人
 */
import React from 'react';

import { Tree, Icon } from 'antd';
import PropTypes from 'prop-types';

const TreeNode = Tree.TreeNode;
import 'styles/components/template/select-depment-or-person/dep-tree-with-person.scss';
// 测试多部门账号uat
// 吴彪:13500000012  密码：a11111,uat
class DepTreeWithPerson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {}

  //渲染部门节点标题
  // 添加title属性并修改显示样式为标题超长省略号 修改人：陈行健 lavi.chen@huilianyi.com
  renderTreeNodesTitle = item => {
    if (item.type === 'DEP') {
      return (
        <div title={item.title}>
          <Icon type="folder" /> &nbsp;<span className="org-dep-node-title">{item.title}</span>
        </div>
      );
    } else {
      return (
        <div title={item.title}>
          <Icon type="user" /> &nbsp;<span className="org-dep-node-title">{item.title}</span>
        </div>
      );
    }
  };
  //渲染部门节点
  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            title={this.renderTreeNodesTitle(item)}
            key={item.key}
            dataRef={item}
            className="org-dep-node"
            isLeaf={item.isLeaf}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      if (this.props.emptyDepIsDisabled && item.type === 'DEP') {
        //如果是空部门，禁用
        return (
          <TreeNode
            className="org-dep-node"
            disabled
            title={this.renderTreeNodesTitle(item)}
            key={item.key}
            dataRef={item}
          />
        );
      } else {
        return (
          <TreeNode
            className="org-dep-node"
            disabled={item.nodeDisabled}
            title={this.renderTreeNodesTitle(item)}
            key={item.key}
            dataRef={item}
            isLeaf={item.isLeaf}
          />
        );
      }
    });
  };

  render() {
    return (
      <div className="org-structure-tree-with-person">
        <Tree
          multiple={this.props.multiple}
          selectedKeys={this.props.selectedKeys}
          expandedKeys={this.props.expandedKeys}
          autoExpandParent={this.props.autoExpandParent}
          onSelect={this.props.onSelect}
          onExpand={this.props.onExpand}
          loadData={this.props.loadData}
        >
          {this.renderTreeNodes(this.props.treeData)}
        </Tree>
      </div>
    );
  }
}

DepTreeWithPerson.propTypes = {
  emptyDepIsDisabled: PropTypes.bool.isRequired, //空部门是否禁用
  treeData: PropTypes.array.isRequired, //组织架构数据
  selectedKeys: PropTypes.array.isRequired, //被选择了的部门oid或者人oid
  expandedKeys: PropTypes.array.isRequired, //被展开了的部门
  autoExpandParent: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired, // 点击激活某一个部门
  onExpand: PropTypes.func.isRequired, // 点击展开某一个部门
};

DepTreeWithPerson.defaultProps = {
  emptyDepIsDisabled: false,
};

export default DepTreeWithPerson;
