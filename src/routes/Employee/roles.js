import React from 'react';
import { Modal, message, Table } from 'antd';
import service from './service';
import SearchForm from '../../components/Template/search-form';

class SelectRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: [],
      columns: [
        {
          title: '代码',
          dataIndex: 'roleCode',
          width: 200,
        },
        {
          title: '名称',
          dataIndex: 'roleName',
        },
      ],
      selectedRowKeys: [],
      dataSource: [],
      defaultIds: [],
      loading: false,
      formItems: [
        { label: '代码', dataIndex: 'roleCode' },
        { label: '名称', dataIndex: 'roleName' },
      ],
    };
  }

  handleOk = () => {
    let defaultIds = this.state.defaultIds;
    let selectedRowKeys = this.state.selectedRowKeys;
    let ids = [];

    defaultIds.map(id => {
      let index = selectedRowKeys.indexOf(id);
      if (index < 0) {
        ids.push({
          roleId: id,
          flag: 1002,
        });
      } else {
        selectedRowKeys.splice(index, 1);
      }
    });

    selectedRowKeys.map(id => {
      ids.push({
        roleId: id,
        flag: 1001,
      });
    });

    let result = {
      userId: this.props.userId,
      assignRoleList: ids,
    };

    service.assignRoles(result).then(res => {
      message.success('分配成功！');
      this.props.onCancel && this.props.onCancel(true);
    });
  };

  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  componentDidMount() {
    this.getList();
  }

  search = values => {
    this.getList(values || {});
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      let params = { userId: nextProps.userId, queryFlag: 'ASSIGNED' };

      service.getRoles(params).then(res => {
        let ids = res.map(item => item.id);
        this.setState({ dataSource: res, selectedRowKeys: ids, defaultIds: ids });
      });
    }
  }

  getList = values => {
    let params = { userId: this.props.userId, queryFlag: 'ALL', ...values };
    this.setState({ loading: true });
    service.getRoles(params).then(res => {
      this.setState({ dataSource: res, loading: false });
    });
  };

  getChildren = (group, result, level) => {
    result.map(item => {
      item.children = group[item.id];
      item.level = level;
      item.title = item.menuName;
      item.key = item.id;
      this.getChildren(group, item.children || [], level + 1);
    });
  };

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  render() {
    const { checkedKeys, dataSource, columns, selectedRowKeys, formItems, loading } = this.state;
    const { visible } = this.props;

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys,
    };

    return (
      <Modal
        title="选择角色"
        visible={visible}
        onOk={this.handleOk}
        width={800}
        onCancel={this.handleCancel}
      >
        <SearchForm search={this.search} formItems={formItems} />
        <div style={{ margin: '16px 0' }} />
        <Table
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          bordered
          size="middle"
          scroll={{ y: 300 }}
          rowSelection={rowSelection}
          loading={loading}
        />
      </Modal>
    );
  }
}

export default SelectRoles;
