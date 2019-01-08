import React from 'react';
import { Modal, message, Button, Popconfirm, Select, Divider, DatePicker } from 'antd';
import service from './service';
import SearchArea from '../../components/Widget/search-area';
import Table from 'widget/table'

const Option = Select.Option;

class SelectRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [],
      roleName: ['abc', 123],
      permissions: ['demo', 'demo2'],
      columns: [
        {
          title: '角色名称',
          dataIndex: 'roleCode',
          align: 'center',
          render: (value, record, index) => {
            if(record.status) {
              return (
                <Select
                 defaultValue={value}
                 style={{ width: '90%' }}
                 onChange={(value) => this.rolChange(value, index)}
                >
                  {
                    this.state.roleName.map((item, index) => {
                      return <Option value={item} key={index}>{item}</Option>
                    })
                  }
                </Select>
              );
            } else {
              return value;
            }
          }
        },
        {
          title: '数据权限名称',
          dataIndex: 'roleName',
          align: 'center',
          render: (value, record, index) => {
            if(record.status) {
              return (
                <Select
                 defaultValue={value}
                 style={{ width: "90%" }}
                 onChange={(value) => this.permissionsChange(value, index)}
                >
                  {
                    this.state.permissions.map((item, index) => {
                      return <Option value={item} key={index}>{item}</Option>
                    })
                  }
                </Select>
              );
            } else {
              return value;
            }
          }
        },
        {
          title: '有效日期',
          dataIndex: 'time',
          align: 'center',
          width: '250px',
          render: (value, record, index) => {
            if(record.status) {
              return (
                <>
                  <DatePicker
                    onChange={(date, dateString) => this.timeBeginChange(dateString, index)}
                    placeholder="有效日期从"
                    style={{ width: "48%", float: "left" }}
                  />
                  <DatePicker
                    onChange={(date, dateString) => this.timeEndChange(dateString, index)}
                    placeholder="有效日期至"
                    style={{ width: "48%", float: "right" }}
                  />
                </>
              )
            } else {
              return value;
            }
          }
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          width: '120px',
          render: (value, record, index) => {
            if(record.status) {
              return (
                <span>
                  <a onClick={() => this.saveRow(index)}>保存</a>
                  <Divider type="vertical" />
                  <a onClick={() => this.cancel(record, index)}>取消</a>
                </span>
              );
            } else {
              return (
                <span>
                  <a onClick={() => {this.edit(record, index)}}>编辑</a>
                  <Divider type="vertical" />
                  <Popconfirm
                    title="你确定要删除？"
                    onConfirm={() => this.delete(record.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
          }
        }
      ],
      selectedRowKeys: [],
      dataSource: [],
      defaultIds: [],
      loading: false,
      searchForm: [
        {
          label: '角色名称',
          type: 'input',
          id: 'roleName',
          colSpan: 7,
        },
        {
          label: '数据权限名称',
          type: 'input',
          id: 'roleName2',
          colSpan: 7,
        },
        {
          label: '有效日期从',
          type: 'date',
          id: 'time',
          colSpan: 5,
          placeholder:'有效日期从'
        },
        {
          label: '有效日期至',
          type: 'date',
          id: 'time2',
          colSpan: 5,
          placeholder:'有效日期至'
        },
      ],
      editingKeys: [],
      dataCache: [],
    };
  }

  componentDidMount() {
    this.getList();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      let params = { userId: nextProps.userId, queryFlag: 'ASSIGNED' };
      this.getList();
      service.getRoles(params).then(res => {
        let ids = res.map(item => item.id);
        this.setState({ selectedRowKeys: ids, defaultIds: ids });
      });
    } else if (!nextProps.visible && this.props.visible) {
      this.searchForm && this.searchForm.resetFields();
    }
  }

  getList = values => {
    let params = { userId: this.props.userId, queryFlag: 'ALL', ...values };
    this.setState({ loading: true });
    service.getRoles(params).then(res => {
      this.setState({ dataSource: res, loading: false });
    });
  };

  //模态框底部确定
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

  //模态框底部取消
  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  // 搜索
  search = values => {
    this.getList(values || {});
  };

  // 编辑
  edit = (record, index) => {
    const { dataSource, dataCache } = this.state;
    record.status = true;
    record.needCache = true;
    dataCache[index] = record;
    this.setState({ dataSource, dataCache });
  }

  //新增一行
  newRow = () => {
    const { dataSource, dataCache } = this.state;
    const id = new Date().getTime();
    const index = dataSource.length;
    const empty = { status: true, id };
    dataSource.push(empty);
    dataCache[index] = empty;
    this.setState({ dataSource, dataCache });

  }

  //取消
  cancel = (record, index) => {
    const { dataSource, dataCache } = this.state;
    const flag = record.needCache;
    record.status = false;
    if(!flag) {
      dataSource.splice(index, 1);
    }
    dataCache.splice(index, 1);
    this.setState({ dataSource, dataCache });
  }

  // 删除
  delete = (id) => {
    console.log(id);
  }

  // 保存全部
  saveAll = () => {
    const { dataCache } = this.state;
    console.log(dataCache)
  }

  // 保存一行
  saveRow = (index) => {
    const { dataCache } = this.state;
    console.log(dataCache[index]);
  }

  // 角色下拉框改变 回调
  rolChange = (value, index) => {
    const { dataCache } = this.state;
    dataCache[index].roleCode = value;
  }

  // 数据权限改变 回调
  permissionsChange = (value, index) => {
    const { dataCache } = this.state;
    dataCache[index].roleName = value;
  }

  //选择日期从 的回调
  timeBeginChange = (dateString, index) => {
    const { dataCache } = this.state;
    dataCache[index].timeBegin = dateString;
  }

  //选择日期至 的回调
  timeEndChange = (dateString, index) => {
    const { dataCache } = this.state;
    dataCache[index].timeEnd = dateString;
  }

  render() {
    const { searchForm, dataSource, dataCache, columns, loading } = this.state;
    const { visible } = this.props;

    return (
      <Modal
        title="选择角色"
        visible={visible}
        onOk={this.handleOk}
        width={800}
        onCancel={this.handleCancel}
        className="list-selector"
      >
        <SearchArea searchForm={searchForm} submitHandle={this.search} clearText="重置" />
        <div style={{ margin: '16px 0' }} >
          <Button type="primary" onClick={this.newRow}>添加</Button>
          <Button style={{ marginLeft: '15px' }} onClick={this.saveAll} type={dataCache.join('') ? 'primary' : ''}>保存</Button>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          bordered
          size="middle"
          loading={loading}
        />
      </Modal>
    );
  }
}

export default SelectRoles;
