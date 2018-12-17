import React, { Component } from 'react';
import { Button, Table, Divider, Popconfirm, message } from 'antd';
import SearchArea from 'widget/search-area';
import SlideFrame from 'widget/slide-frame';
import NewParamsSetting from './new-params-setting';
import service from './service';

class DemoGc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        {
          type: 'input',
          id: 'tableName',
          placeholder: '请输入',
          label: '表名称',
          colSpan: 6,
        },
        {
          type: 'value_list',
          id: 'dataType',
          placeholder: '请选择',
          label: '参数类型',
          valueListCode: 3101,
          options: [],
          colSpan: 6,
        },
        {
          type: 'value_list',
          id: 'filterMethod',
          placeholder: '请选择',
          label: '筛选方式',
          valueListCode: 3104,
          options: [],
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'columnName',
          placeholder: '请输入',
          label: '参数名称',
          colSpan: 6,
        },
      ],
      columns: [
        {
          title: '表名称',
          dataIndex: 'tableName',
          align: 'center',
        },
        {
          title: '参数类型',
          dataIndex: 'dataType',
          align: 'center',
        },
        {
          title: '筛选方式',
          dataIndex: 'filterMethod',
          align: 'center',
        },
        {
          title: '关联条件',
          dataIndex: 'customSql',
          align: 'center',
        },
        {
          title: '参数名称',
          dataIndex: 'columnName',
          align: 'center',
        },
        {
          title: '操作',
          dataIndex: 'id',
          align: 'center',
          render: (value, record, index) => {
            return (
              <span>
                <a onClick={() => this.edit(record)}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm
                  title="确定删除？"
                  onConfirm={() => this.delete(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          },
        },
      ],
      data: [],
      loading: false,
      searchParams: {},
      pagination: {},
      size: 10,
      page: 0,
      visible: false,
      modal: {},
    };
  }

  componentDidMount() {
    this.getList();
  }

  // 获取列表数据
  getList = () => {
    let { searchParams, size, page, pagination } = this.state;
    this.setState({ loading: true });
    service
      .getParamsSettingList({ ...searchParams, size, page })
      .then(res => {
        let total = Number(res.headers['x-total-count']);
        this.setState({
          data: res.data,
          loading: false,
          pagination: { ...pagination, total },
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
        this.setState({ loading: false });
      });
  };

  // 查找
  search = values => {
    Object.keys(values).map(key => {
      if (!values[key]) {
        delete values[key];
      }
    });
    this.setState(
      {
        searchParams: values,
        page: 0,
        pagination: { current: 1 },
      },
      () => {
        this.getList();
      }
    );
  };

  // 点击新增按钮
  create = () => {
    this.setState({
      visible: true,
    });
  };

  // 编辑
  edit = data => {
    this.setState({
      modal: JSON.parse(JSON.stringify(data)),
      visible: true,
    });
  };

  // 删除
  delete = id => {
    service
      .deleteParamsSetting(id)
      .then(res => {
        let { size, page, pagination } = this.state;
        let { total, current } = pagination;
        if (Math.ceil(total / size) === current) {
          if (Number.isInteger((total - 1) / size)) {
            page -= 1;
            current -= 1;
          }
        }
        message.success('删除成功！');
        this.setState({ page, pagination: { current } }, () => {
          this.getList();
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  // 改变页码时的回调
  handleTableChange = pagination => {
    this.setState(
      {
        size: pagination.pageSize || 10,
        page: pagination.current - 1,
        pagination,
      },
      () => {
        this.getList();
      }
    );
  };

  // 关闭侧拉框的回调
  close = flag => {
    this.setState({ visible: false, modal: {} }, () => {
      if (flag) {
        this.getList();
      }
    });
  };

  render() {
    const { searchForm, columns, data, loading, pagination, modal, visible } = this.state;

    return (
      <div className="demo-gc">
        <SearchArea searchForm={searchForm} submitHandle={this.search} />
        <Button style={{ margin: '20px 0' }} type="primary" onClick={this.create}>
          新建
        </Button>
        <Table
          rowKey={record => record.id}
          columns={columns}
          dataSource={data}
          bordered
          size="middle"
          onChange={this.handleTableChange}
          loading={loading}
          pagination={pagination}
        />
        <SlideFrame
          title={modal.id ? '编辑参数配置' : '新增参数配置'}
          show={visible}
          onClose={() => {
            this.setState({
              visible: false,
              modal: {},
            });
          }}
        >
          <NewParamsSetting modal={modal} close={this.close} />
        </SlideFrame>
      </div>
    );
  }
}

export default DemoGc;
