/**
 * Created by zhouli on 18/4/25
 * Email li.zhou@huilianyi.com
 * 显示部门树:无状态，只是显示
 */
import React from 'react';

import { Tree, Icon } from 'antd';
const TreeNode = Tree.TreeNode;
import 'styles/components/template/select-depment-by-role/dep-tree.scss';
import PropTypes from 'prop-types';

class DepTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {}
  //渲染部门节点标题
  renderTreeNodesTitle = item => {
    return (
      <div>
        <Icon type="folder" /> &nbsp;<span className="org-dep-node-title">
          {`${item.name}${item.status != 101 && this.props.showEnable ? '(已停用)' : ''}`}
        </span>
      </div>
    );
  };
  //渲染部门节点
  renderTreeNodes = data => {
    return data.map(item => {
      if (
        item.childrenDepartment &&
        item.childrenDepartment.length &&
        item.childrenDepartment.length > 0
      ) {
        return (
          <TreeNode
            title={this.renderTreeNodesTitle(item)}
            key={item.departmentOid}
            dataRef={item}
            className="org-dep-node"
          >
            {this.renderTreeNodes(item.childrenDepartment)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          className="org-dep-node"
          title={this.renderTreeNodesTitle(item)}
          key={item.departmentOid}
          dataRef={item}
        />
      );
    });
  };

  render() {
    return (
      <div className="org-structure-role-tree">
        <Tree
          multiple={this.props.multiple}
          selectedKeys={this.props.selectedKeys}
          expandedKeys={this.props.expandedKeys}
          autoExpandParent={this.props.autoExpandParent}
          onSelect={this.props.onSelect}
          onExpand={this.props.onExpand}
        >
          {this.renderTreeNodes(this.props.treeData)}
        </Tree>
      </div>
    );
  }
}
DepTree.propTypes = {
  treeData: PropTypes.array.isRequired, //组织架构数据
  selectedKeys: PropTypes.array.isRequired, //被选择了的部门oid或者人oid
  expandedKeys: PropTypes.array.isRequired, //被展开了的部门
  autoExpandParent: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired, // 点击激活某一个部门
  onExpand: PropTypes.func.isRequired, // 点击展开某一个部门
  showEnable: PropTypes.bool, //是否显示禁用标识
};

DepTree.defaultProps = {};

export default DepTree;
