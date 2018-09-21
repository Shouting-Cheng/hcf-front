import React, { Component } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Table,
  Icon,
  Divider,
  Popconfirm,
  Tag,
  Alert,
} from 'antd';
import service from './service';
import moment from 'moment';
import NewMenu from './new';
import { messages } from '../../utils/utils';

class LanguageManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menus: [],
      addShow: false,
      loading: false,
      menuId: 0,
      model: {},
      columns: [
        {
          title: '图标',
          dataIndex: 'menuIcon',
          render: value => <Icon type={value} />,
        },
        {
          title: '代码',
          dataIndex: 'menuCode',
        },
        {
          title: '名称',
          dataIndex: 'menuName',
          render: value => this.$t(value),
        },
        {
          title: '类型',
          dataIndex: 'menuTypeEnum',
          render: value =>
            value == 1001 ? <Tag color="blue">目录</Tag> : <Tag color="green">功能</Tag>,
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
          width: 180,
          render: (value, record) => {
            return (
              <span>
                {record.menuTypeEnum == 1001 && (
                  <span>
                    <a onClick={() => this.add(record)}>添加</a>
                    <Divider type="vertical" />
                  </span>
                )}
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

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    this.setState({ loading: true });
    service.getMenus().then(res => {
      let result = res || [];
      let group = {};

      result.map(item => {
        if (group[item.parentMenuId]) {
          group[String(item.parentMenuId)].push(item);
        } else {
          group[String(item.parentMenuId)] = [item];
        }
      });

      result = result.filter(o => o.parentMenuId == 0);

      this.getChildren(group, result, 1);

      this.setState({ menus: result, loading: false });
    });
  };

  getChildren = (group, result, level) => {
    result.map(item => {
      item.children = group[item.id];
      item.level = level;
      this.getChildren(group, item.children || [], level + 1);
    });
  };

  handleClick = record => {
    this.context.router.push('/main/language-manager/language-setting/' + record.id);
  };

  add = (record = {}) => {
    this.setState({ addShow: true, menuId: record.id || 0 });
  };

  edit = record => {
    this.setState({ addShow: true, model: record });
  };

  remove = record => {
    service.updateMenu({ ...record, enabled: !record.enabled }).then(response => {
      this.getList();
      message.success('操作成功！');
    });
  };

  handleClose = () => {
    this.setState({ addShow: false, model: {} }, () => {
      this.getList();
    });
  };

  render() {
    const { columns, addShow, menus, loading, menuId, model } = this.state;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
    };

    return (
      <div style={{ backgroundColor: '#fff', padding: 10, overflow: 'auto' }}>
        <Alert
          closable
          message="添加完菜单后，用户刷新当前页面，或则重新登录才能生效！"
          type="info"
        />
        <Button onClick={this.add} style={{ margin: '10px 0' }} type="primary">
          添加根菜单
        </Button>
        <Table
          columns={columns}
          dataSource={menus}
          pagination={false}
          bordered
          loading={loading}
          rowKey="id"
        />
        <NewMenu model={model} visible={addShow} parentId={menuId} onClose={this.handleClose} />
      </div>
    );
  }
}

export default Form.create()(LanguageManager);
