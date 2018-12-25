import React from 'react';
import CustomTable from '../../components/Template/custom-table';
import { Divider, Tag, Button, message, Alert } from 'antd';
import moment from 'moment';
import service from './service';
import NewRole from './new';
import SelectMenus from './menus';
import { connect } from 'dva';
import SearchForm from '../../components/Template/search-form';

class Role extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newShow: false,
      allocShow: false,
      roleId: '',
      record: {},
      formItems: [
        {
          label: '代码',
          dataIndex: 'roleCode',
          type: 'input',
        },
        {
          label: '名称',
          dataIndex: 'roleName',
          type: 'input',
        },
      ],
      columns: [
        {
          title: '代码',
          dataIndex: 'roleCode',
        },
        {
          title: '名称',
          dataIndex: 'roleName',
        },
        {
          title: '创建日期',
          dataIndex: 'createdDate',
          width: 120,
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '状态',
          dataIndex: 'enabled',
          width: 120,
          render: value => (!value ? <Tag color="red">禁用</Tag> : <Tag color="green">启用</Tag>),
        },
        {
          title: '操作',
          dataIndex: 'option',
          align: 'center',
          width: 190,
          render: (value, record) => {
            return (
              <span>
                <a onClick={() => this.alloc(record)}>分配菜单</a>
                <Divider type="vertical" />
                <a onClick={() => this.edit(record)}>编辑</a>
                <Divider type="vertical" />
                <a onClick={() => this.remove(record)}>{record.enabled ? '禁用' : '启用'}</a>
              </span>
            );
          },
        },
      ],
    };
  }

  add = () => {
    this.setState({ newShow: true });
  };

  alloc = record => {
    this.setState({ allocShow: true, roleId: record.id });
  };

  remove = record => {
    service.disableRole({ ...record, enabled: !record.enabled }).then(response => {
      this.table.reload();
      message.success('操作成功！');
    });
  };

  edit = record => {
    this.setState({ record: { ...record }, newShow: true });
  };

  close = flag => {
    this.setState({ newShow: false, record: {} }, () => {
      flag && this.table.reload();
    });
  };

  search = values => {
    this.table.search(values);
  };

  render() {
    const { columns, newShow, allocShow, roleId, formItems, record } = this.state;
    return (
      <div style={{ backgroundColor: '#fff', padding: 10, overflow: 'auto' }}>
        <Alert
          style={{ marginBottom: 10 }}
          closable
          message="操作后，刷新当前页面，或者重新登录才能生效！"
          type="info"
        />
        <SearchForm formItems={formItems} search={this.search} />
        <Button style={{ margin: '10px 0' }} onClick={this.add} type="primary">
          添加
        </Button>
        <CustomTable
          ref={ref => (this.table = ref)}
          columns={columns}
          url={'/auth/api/role/query/tenant?tenantId=' + this.props.currentUser.tenantId}
        />
        <NewRole params={record} visible={newShow} onClose={this.close} />
        <SelectMenus
          roleId={roleId}
          onCancel={() => {
            this.setState({ allocShow: false });
          }}
          visible={allocShow}
        />
      </div>
    );
  }
}
export default connect(({ user }) => ({
  currentUser: user.currentUser,
}))(Role);
