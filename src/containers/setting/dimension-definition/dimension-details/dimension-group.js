import React, { Component } from 'react';
import { Button, Input, Badge, Divider, Popconfirm, message } from 'antd';
import CustomTable from 'widget/table';
import SlideFrame from 'widget/slide-frame';
import NewDimensionGroup from './new-dimension-group';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import service from './dimension-group-service';

const Search = Input.Search;

class DimensionGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: '维值组代码',
          dataIndex: 'dimensionItemGroupCode',
          align: 'center',
        },
        {
          title: '维值组名称',
          dataIndex: 'dimensionItemGroupName',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'enabled',
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
                title={record.hasChildren ? this.state.title1 : this.state.title2}
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
      dimensionId: this.props.dimensionId,
      selectedKey: [],
      searchParams: {},
      title1: '该维值组下存在维值，是否确定删除？',
      title2: '你确定要删除？',
      tipsKey: false,
    }
  }

  // 跳转到分配子维值
  distribution = (e, id) => {
    e.preventDefault();
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/dimension-definition/distribution-dimension-value/${this.state.dimensionId}/${id}`,
      })
    );
  }

  componentDidMount() {
    this.getList();
  }

  // 获取数据
  getList = () => {
    let { dimensionId, page, size, searchParams, pagination } = this.state;
    this.setState({ loading: true });
    let params = { dimensionId,  page, size, ...searchParams };
    service.getDimensionGroup(params).then((res) => {
      let total = Number(res.headers['x-total-count']);
      this.setState({ data: res.data, loading: false, pagination: { ...pagination, total } });
    }).catch((err) => {
      message.error(err.response.data.message);
    })

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
    service.deleteDimensionGroup(id).then((res) => {
      message.success('删除成功');
      this.mySetState();
    }).catch((err) => {
      message.error(err.response.data.message);
    })
  }

  // 批量删除
  batchDelete = () => {
    let ids = this.state.selectedKey;
    if(ids.length) {
      service.batchDeleteDimensionGroup(ids).then((res) => {
        this.mySetState();
        message.success('删除成功');
      }).catch((err) => {
        message.error(err.response.data.message);
      })
    } else {
      message.warning('请选择你要删除的内容')
    }
  }

  // 表格选择
  selectChange = (key, row) => {
    let tipsKey;
    row.some((item) => {
      if(item.hasChildren) {
        tipsKey = true;
        return true;
      } else {
        tipsKey = false;
        return false;
      }
    })
    this.setState({ selectedKey: key, tipsKey });
  };

  // 搜索
  search = (value) => {
    this.mySetState({ searchParams: { dimensionItemGroupCode: value } })
  }

  // 设置state
  mySetState = (params) => {
    let pagination = this.state.pagination;
    this.setState({ page: 0, pagination: { ...pagination, current: 1 }, ...params }, this.getList)
  }

  // 关闭侧拉框的回调
  close = flag => {
    this.setState({ visible: false, model: {} }, () => {
      if (flag) {
        this.getList();
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
    const {
      data, columns, pagination, model, visible, loading, dimensionId, tipsKey, title1, title2
    } = this.state;
    const rowSelection = {
      onChange: this.selectChange,
    };

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
          <Popconfirm
            title={tipsKey ? title1 : title2}
            onConfirm={this.batchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button>删除</Button>
          </Popconfirm>
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
          <NewDimensionGroup model={model} close={this.close} dimensionId={dimensionId} />
        </SlideFrame>
      </div>
    )
  }
}

export default connect()(DimensionGroup);
