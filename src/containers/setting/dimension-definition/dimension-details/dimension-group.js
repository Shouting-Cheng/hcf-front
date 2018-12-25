import React, { Component } from 'react';
import { Button, Input, Badge, Divider, Popconfirm } from 'antd';
import CustomTable from 'widget/table';
import SlideFrame from 'widget/slide-frame';
import NewDimensionGroup from './new-dimension-group';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

const Search = Input.Search;

class DimensionGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: '维值组代码',
          dataIndex: 'tableName',
          align: 'center',
        },
        {
          title: '维值组名称',
          dataIndex: 'tableName1',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'switch',
          align: 'center',
          render: (value, record, index) => {
            return <Badge status={value ? 'success' : 'error'} text={value ? '启用' : '禁用'} />;
          },
        },
        {
          title: '操作',
          align: 'center',
          render: (value, record, index) => (
            <div>
              <a onClick={(e) => this.edit(e, record)}>编辑</a>
              <Divider type="vertical" />
              <a onClick={(e) => this.distribution(e, record.id)}>分配子维值</a>
              <Divider type="vertical" />
              <Popconfirm
                title="你确定删除？"
                onConfirm={() => this.delete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            </div>
          ),
        },
      ],
      data: [],
      pagination: {
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
        pageSize: 10,
        current: 1,
        showTotal: total => `共有${total}条数据`,
        onChange: this.indexChange,
        onShowSizeChange: this.sizeChange,
      },
      page: 0,
      size: 10,
      visible: false,
      loading: false,
      model: {},
    }
  }

  // 跳转到分配子维值
  distribution = (e, id) => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/admin-setting/dimension-definition/dimension-details/${id}`,
      })
    );
  }

  componentDidMount() {
    this.getList();
  }

  // 获取数据
  getList = () => {
    let data = [
      {
        id: 120,
        tableName: '000',
        tableName1: '111',
        switch: false,
      }
    ];
    this.setState({ data: data });
  }

  // 编辑
  edit = (e, record) => {
    e.preventDefault();
    this.setState({
      visible: true,
      model: JSON.parse(JSON.stringify(record))
    })
  }

  // 删除
  delete = (id) => {
    console.log(id);
  }

  // 搜索
  search = (value) => {
    console.log(value)
  }

  // 关闭侧拉框的回调
  close = flag => {
    this.setState({ visible: false, model: {} }, () => {
      if (flag) {
        // this.getList();
      }
    });
  };

  // 跳转到某页
  indexChange = (page, size) => {
    let pagination = this.state.pagination;
    pagination.current = page;
    this.setState({ page: page - 1, pagination }, this.getList);
  };

  // 改变pagesize
  sizeChange = (current, size) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    pagination.pageSize = size;
    this.setState({ page: 0, size: size, pagination }, this.getList);
  };

  render() {
    const { data, columns, pagination, model, visible, loading } = this.state;
    const rowSelection = {

    }

    return (
      <div>
        <div style={{ margin: '40px 0 10px 0' }}>
          <Button
            type="primary"
            style={{ marginRight: '15px' }}
            onClick={() => {
              this.setState({ visible: true });
            }}
          >
            新建维值组
          </Button>
          <Button>删除</Button>
          <Search
            placeholder="请输入维值组代码"
            onSearch={this.search}
            style={{ width: '300px', float: 'right' }}
          />
        </div>
        <CustomTable
          rowKey={record => record['id']}
          dataSource={data}
          columns={columns}
          rowSelection={rowSelection}
          pagination={pagination}
          loading={loading}
        />

        <SlideFrame
          title={model.id ? '编辑维值组' : '新建维值组'}
          show={visible}
          onClose={() => {
            this.setState({
              visible: false,
              model: {},
            });
          }}
        >
          <NewDimensionGroup model={model} close={this.close} />
        </SlideFrame>
      </div>
    )
  }
}

export default connect(
  null,
  null,
)(DimensionGroup);
