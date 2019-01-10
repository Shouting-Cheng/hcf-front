import React from 'react';
import { Modal, message, Button, Popconfirm, Select, Divider, DatePicker } from 'antd';
import service from './service';
import SearchArea from '../../components/Widget/search-area';
import Table from 'widget/table';
import moment from 'moment';

const Option = Select.Option;

class SelectRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [],
      roleName: [],
      dataAuthority: [],
      columns: [
        {
          title: '角色名称',
          dataIndex: 'roleName',
          align: 'center',
          render: (value, record, index) => {
            if (record.status) {
              return (
                <Select
                  defaultValue={{ key: record.roleId || '' }}
                  style={{ width: '90%' }}
                  onChange={(value) => this.rolChange(value, index)}
                  labelInValue
                >
                  {this.state.roleName.map(item => {
                    return (
                      <Option key={item.id}>
                        {item.roleName}
                      </Option>
                    );
                  })}
                </Select>
              );
            } else {
              return value;
            }
          },
        },
        {
          title: '数据权限名称',
          dataIndex: 'dataAuthorityName',
          align: 'center',
          render: (value, record, index) => {
            if (record.status) {
              return (
                <Select
                  defaultValue={{ key: record.dataAuthorityId || '' }}
                  style={{ width: '90%' }}
                  onChange={(value) => this.dataAuthorityChange(value, index)}
                  labelInValue
                >
                  {this.state.dataAuthority.map(item => {
                    return (
                      <Option key={item.id}>
                        {item.dataAuthorityName}
                      </Option>
                    );
                  })}
                </Select>
              );
            } else {
              return value;
            }
          },
        },
        {
          title: '有效日期',
          dataIndex: 'validDateFrom',
          align: 'center',
          width: '250px',
          render: (value, record, index) => {
            let validDateTo = record.validDateTo;
            if (record.status) {
              return (
                <>
                  <DatePicker
                    defaultValue={value ? moment(value) : null}
                    onChange={date => this.timeBeginChange(date, index)}
                    placeholder="有效日期从"
                    style={{ width: '48%', float: 'left' }}
                  />
                  <DatePicker
                    defaultValue={validDateTo ? moment(validDateTo) : null}
                    onChange={date => this.timeEndChange(date, index)}
                    placeholder="有效日期至"
                    style={{ width: '48%', float: 'right' }}
                  />
                </>
              );
            } else {
              if (value) {
                if (validDateTo) {
                  return (
                    moment(value).format('YYYY-MM-DD') +
                    ' ~ ' +
                    moment(validDateTo).format('YYYY-MM-DD')
                  );
                } else {
                  return moment(value).format('YYYY-MM-DD') + '~';
                }
              }
            }
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          width: '120px',
          render: (value, record, index) => {
            if (record.status) {
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
                  <a
                    onClick={() => {
                      this.edit(record, index);
                    }}
                  >
                    编辑
                  </a>
                  <Divider type="vertical" />
                  <Popconfirm
                    title="你确定要删除？"
                    onConfirm={() => this.delete(record.id, index)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
          },
        },
      ],
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
          id: 'dataAuthorityName',
          colSpan: 7,
        },
        {
          label: '有效日期从',
          type: 'date',
          id: 'validDateFrom',
          colSpan: 5,
          placeholder: '有效日期从',
        },
        {
          label: '有效日期至',
          type: 'date',
          id: 'validDateTo',
          colSpan: 5,
          placeholder: '有效日期至',
        },
      ],
      dataCache: [],
      pagination: {},
      total: 10,
      userId: this.props.userId,
    };
  }

  componentDidMount() {
    this.getList();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.setState({ userId: nextProps.userId }, this.getList);
    } else if (!nextProps.visible && this.props.visible) {
      this.searchForm && this.searchForm.handleReset();
    }
  }

  // 获取数据
  getList = values => {
    const { userId } = this.state;
    let params = { userId, ...values };
    this.setState({ loading: true });
    this.getSelectData();
    service
      .getRolesDistribute(params)
      .then(res => {
        this.setState({ dataSource: res.data, loading: false });
      })
      .catch(err => {
        message.error(err.response.data.message);
        this.setState({ loading: false })
      });
  };

  // 角色 数据权限 下拉框的数据
  getSelectData = () => {
    service
      .getAllRoles()
      .then(res => {
        this.setState({ roleName: res.data });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });

    service
      .getDataAuthority()
      .then(res => {
        this.setState({ dataAuthority: res.data });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  //模态框底部确定 取消
  handleOk = () => {
    if(this.state.dataCache.join('')) {
      message.warning('你还有未保存的修改');
    } else {
      this.props.onCancel && this.props.onCancel();
    }
  };

  //模态框底部取消
  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  // 搜索
  search = values => {
    let params = {
      ...values,
      validDateFrom: values.validDateFrom.format(),
      validDateTo: values.validDateTo.format(),
    }
    this.getList(params);
  };

  // 编辑
  edit = (record, index) => {
    const { dataSource, dataCache } = this.state;
    record.status = 'edit';
    record.needCache = true;
    dataCache[index] = record;
    this.setState({ dataSource, dataCache });
  };

  //新增一行
  newRow = () => {
    const { dataSource, dataCache, userId } = this.state;
    const empty = { status: 'new', id: new Date().getTime(), userId };
    dataCache[dataSource.length] = empty;
    dataSource.push(empty);
    this.getSelectData();
    this.setState({ dataSource, dataCache });
  };

  //编辑时的取消
  cancel = (record, index) => {
    const { dataSource, dataCache } = this.state;
    const flag = record.needCache;
    record.status = false;
    if (flag) {
      dataCache[index] = '';
    } else {
      dataSource.splice(index, 1);
      dataCache.splice(index, 1);
    }
    this.setState({ dataSource, dataCache });
  };

  // 删除
  delete = (id, index) => {
    const { dataCache, dataSource } = this.state;
    service
      .deleteRolesAuthority(id)
      .then(() => {
        dataSource.splice(index, 1);
        dataCache.splice(index, 1);
        this.setState({ dataSource, dataCache }, () => {
          message.success('删除成功');
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  // 保存全部
  saveAll = () => {
    const { dataCache } = this.state;
    if(dataCache.join('')) {
      let newData = [], editData = [];
      dataCache.forEach(item => {
        switch(item.status) {
          case 'new':
            newData.push(item); break;
          case 'edit':
            editData.push(item); break;
        }
      })
      newData.length && service.batchSaveRolesAuthority(newData).then(res => {
        console.log(res.data);
      })
      editData.length && service.batchUpdateRolesAuthority(editData).then(res => {
        console.log(res.data);
      })
    } else {
      message.warning('没有需要保存的数据');
    }
  };

  // 保存一行
  saveRow = index => {
    const { dataCache, dataSource } = this.state;
    const data = { ...dataCache[index] };
    let saveMethod;
    if (data.status === 'new') {
      saveMethod = service.saveRolesAuthority;
      delete data.id;
    } else if (data.status === 'edit') {
      saveMethod = service.updateRolesAuthority;
    }
    delete data.status;
    saveMethod && saveMethod(data)
      .then(res => {
        dataSource[index] = { ...dataCache[index], ...res.data, status: false };
        dataCache[index] = '';
        this.setState({ dataSource, dataCache });
        message.success('保存成功');
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  // 角色下拉框改变 回调
  rolChange = (value, index) => {
    const { dataCache } = this.state;
    dataCache[index].roleId = value.key;
    dataCache[index].roleName = value.label.split('-')[1];
  };

  // 数据权限改变 回调
  dataAuthorityChange = (value, index) => {
    const { dataCache } = this.state;
    dataCache[index].dataAuthorityId = value.key;
    dataCache[index].dataAuthorityName = value.label.split('-')[1];
  };

  //选择日期从 的回调
  timeBeginChange = (date, index) => {
    const { dataCache } = this.state;
    dataCache[index].validDateFrom = date.format();
  };

  //选择日期至 的回调
  timeEndChange = (date, index) => {
    const { dataCache } = this.state;
    dataCache[index].validDateTo = date.format();
  };

  render() {
    const { searchForm, dataSource, dataCache, columns, loading, pagination } = this.state;
    const { visible } = this.props;

    return (
      <Modal
        title="分配权限"
        visible={visible}
        onOk={this.handleOk}
        width={800}
        onCancel={this.handleOk}
        className="list-selector"
      >
        <SearchArea
          onRef={ref => (this.searchForm = ref)}
          searchForm={searchForm}
          submitHandle={this.search}
          clearText="重置"
        />
        <div style={{ margin: '16px 0' }}>
          <Button type="primary" onClick={this.newRow}>
            添加
          </Button>
          <Button
            style={{ marginLeft: '15px' }}
            onClick={this.saveAll}
            type={dataCache.join('') ? 'primary' : ''}
          >
            保存
          </Button>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          bordered
          size="middle"
          loading={loading}
          pagination={pagination}
        />
      </Modal>
    );
  }
}

export default SelectRoles;
