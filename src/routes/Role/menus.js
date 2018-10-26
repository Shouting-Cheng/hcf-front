import React from 'react';
import { Tree, Modal, message, Spin } from 'antd';
import service from './service';

class SelectMenus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: [],
      treeData: [],
      defaultIds: [],
      checkedIds: [],
      data: [],
      loading: false,
      saveLoading: false,
    };
  }

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode dataRef={item} {...item} />;
    });
  };

  onCheck = (checkedKeys, e) => {
    let checkedIds = [];

    e.checkedNodes.map(node => {
      checkedIds.push(node.props.dataRef);
    });

    this.setState({ checkedKeys, checkedIds });
  };

  handleOk = () => {
    let defaultIds = this.state.defaultIds;
    let checkedKeys = this.state.checkedKeys;
    let checkedIds = this.state.checkedIds;
    let result = [];

    this.setState({ saveLoading: true });

    defaultIds.map(id => {
      let index = checkedIds.findIndex(o => o.id == id);
      let record = this.state.data.find(o => o.id == id);

      if (index < 0) {
        result.push({
          ...record,
          flag: 1002,
        });
      } else {
        checkedIds.splice(index, 1);
      }
    });

    checkedIds.map(item => {
      // let record = this.state.data.find(o => o.id == item.id);
      result.push({
        id: item.id,
        parentId: item.parentId,
        code: item.code,
        name: item.name,
        type: item.type,
        flag: 1001,
      });
    });
    service
      .assignMenus({ roleId: this.props.roleId, assignMenuButtonList: result })
      .then(res => {
        message.success('分配成功！');
        this.setState({ saveLoading: false });
        this.props.onCancel && this.props.onCancel();
      })
      .catch(err => {
        this.setState({ saveLoading: false });
      });
  };

  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  componentDidMount() {
    this.getList();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.setState({ loading: true });
      service.getMenusByRoleId(nextProps.roleId).then(res => {
        let ids = res.map(item => String(item));
        this.setState({ defaultIds: ids, checkedIds: ids, checkedKeys: ids, loading: false });
      });
    }
  }

  getList = () => {
    service.getMenus().then(res => {
      let result = JSON.parse(JSON.stringify(res)) || [];
      let group = {};

      result.map(item => {
        if (group[item.parentId]) {
          group[String(item.parentId)].push(item);
        } else {
          group[String(item.parentId)] = [item];
        }
      });

      result = result.filter(o => o.parentId == 0);

      this.getChildren(group, result, 1);

      this.setState({ treeData: result, data: res });
    });
  };

  getChildren = (group, result, level) => {
    result.map(item => {
      item.children = group[item.id];
      item.level = level;
      item.title = this.$t(item.name);
      item.key = item.id;
      this.getChildren(group, item.children || [], level + 1);
    });
  };

  render() {
    const { checkedKeys, treeData, loading, saveLoading } = this.state;
    const { visible } = this.props;

    return (
      <Modal
        confirmLoading={saveLoading}
        title="选择菜单"
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        bodyStyle={{ height: "60vh", overflow: "auto" }}
      >
        <Spin spinning={loading}>
          <Tree checkable autoExpandParent onCheck={this.onCheck} checkedKeys={checkedKeys}>
            {this.renderTreeNodes(treeData)}
          </Tree>
        </Spin>
      </Modal>
    );
  }
}

export default SelectMenus;
