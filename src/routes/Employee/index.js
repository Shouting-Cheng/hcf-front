import React from 'react';
import CustomTable from '../../components/Template/custom-table';
import { Divider, Tag, Button, message, Tooltip, Alert } from 'antd';
import moment from 'moment';
import service from './service';
// import NewRole from "./new"
import SelectRoles from './roles';
import { connect } from 'dva';
import SearchForm from '../../components/Template/search-form';

class Employee extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newShow: false,
      allocShow: false,
      userId: '',
      formItems: [
        {
          label: '账号',
          dataIndex: 'login',
          type: 'input',
        },
        {
          label: '姓名',
          dataIndex: 'fullName',
          type: 'input',
        },
        {
          label: '手机号',
          dataIndex: 'mobile',
          type: 'input',
        },
        {
          label: '邮箱',
          dataIndex: 'email',
          type: 'input',
        },
        {
          label: '公司',
          dataIndex: 'companyName',
          type: 'input',
        },
        {
          label: '部门',
          dataIndex: 'departmentName',
          type: 'input',
        },
      ],
      columns: [
        {
          title: '账号',
          dataIndex: 'login',
        },
        {
          title: '姓名',
          dataIndex: 'fullName',
          render: (value, record) => (
            <Tooltip title={record.roleList.map(o => o.roleName).join(' ')}>
              <Tag color="green">{value}</Tag>
            </Tooltip>
          ),
        },
        {
          title: '手机号',
          dataIndex: 'mobile',
        },
        {
          title: '邮箱',
          dataIndex: 'email',
        },
        {
          title: '公司',
          dataIndex: 'companyName',
          showTooltip: true,
          width: 160,
        },
        {
          title: '部门',
          dataIndex: 'departmentName',
          showTooltip: true,
          width: 160,
        },
        {
          title: '操作',
          dataIndex: 'option',
          align: 'center',
          width: 140,
          render: (value, record) => {
            return (
              <span>
                <a onClick={() => this.alloc(record)}>分配角色</a>
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
    this.setState({ allocShow: true, userId: record.id });
  };

  remove = record => {
    service.disableRole({ ...record, isEnabled: !record.isEnabled }).then(response => {
      this.table.reload();
      message.success('操作成功！');
    });
  };

  close = flag => {
    this.setState({ newShow: false, allocShow: false }, () => {
      flag && this.table.reload();
    });
  };

  search = values => {
    this.table.search(values);
  };

  render() {
    const { columns, newShow, allocShow, userId, formItems } = this.state;
    const { currentUser } = this.props;
    return (
      <div style={{ backgroundColor: '#fff', padding: 10, overflow: 'auto' }}>
        <Alert
          style={{ marginBottom: 10 }}
          closable
          message="操作后，刷新当前页面，或则重新登录才能生效！"
          type="info"
        />
        <SearchForm search={this.search} formItems={formItems} />
        <div style={{ padding: '24px 0' }}>
          <CustomTable
            ref={ref => (this.table = ref)}
            columns={columns}
            url={`/auth/api/userRole/query/userList?tenantId=${currentUser.tenantId}`}
          />
        </div>
        {/* <NewRole visible={newShow} onClose={this.close} /> */}
        <SelectRoles userId={userId} onCancel={this.close} visible={allocShow} />
      </div>
    );
  }
}

export default connect(({ user }) => ({
  currentUser: user.currentUser,
}))(Employee);
