import React, { Component } from 'react';
import { Button, Input, Icon, Badge, Modal, Popconfirm, message } from 'antd';
import CustomTable from 'widget/table';
import BasicInfo from 'widget/basic-info';
import ModalDimension from './modal-dimension';
import { messages } from 'utils/utils';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import service from './dimension-group-service';

const Search = Input.Search;

class DistributionDimension extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoData: {},
      infoList: [
        {
          type: 'input',
          id: 'dimensionItemGroupCode',
          isRequired: true,
          label: '维值组代码',
        },
        {
          type: 'input',
          id: 'dimensionItemGroupName',
          isRequired: true,
          label: '维值组名称',
        },
        {
          type: 'switch',
          id: 'enabled',
          isRequired: true,
          label: '状态',
        },
      ],
      data: [],
      columns: [
        {
          title: '维值代码',
          dataIndex: 'dimensionItemCode',
          align: 'center',
        },
        {
          title: '维值名称',
          dataIndex: 'dimensionItemName',
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
          dataIndex: 'tableName3',
          align: 'center',
          render: (value, record, index) => (
            <Popconfirm
              title="你确定删除？"
              onConfirm={() => this.delete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a>删除</a>
            </Popconfirm>
          ),
        },
      ],
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
      selectedKey: [],
      loading: false,
      dimensionItemGroupId: this.props.match.params.id,
      searchParams: {},
      dimensionItemIds: [],
      confirmLoading: false,
    };
  }

  // 生命周期获取数据
  componentDidMount() {
    this.getList();
    this.getDimensionGroup();
  }

  // 维值组详情
  getDimensionGroup = () => {
    const id = this.state.dimensionItemGroupId;
    service.getDimensionGroupDetail(id).then(res => {
      this.setState({ infoData: res.data });
    }).catch(err => {
      message.error(err.response.data.message);
    })
  }

  // 获取数据
  getList = () => {
    let { dimensionItemGroupId, page, size, searchParams, pagination } = this.state;
    let params = { dimensionItemGroupId, page, size, ...searchParams };
    this.setState({ loading: true });
    service.getDimensionItem(params).then((res) => {
      let total = Number(res.headers['x-total-count']);
      this.setState({ data: res.data, loading: false, pagination: { ...pagination, total }, selectedKey: [] });
    })
  };

  // 删除
  delete = id => {
    let { dimensionItemGroupId } = this.state;
    service.deleteDimensionItem(dimensionItemGroupId, id).then(() => {
      message.success('删除成功');
      this.mySetState();
    }).catch(err => {
      message.error(err.response.data.message);
    })
  };

  // 批量删除
  batchDelete = () => {
    let { selectedKey, dimensionItemGroupId } = this.state;
    if(selectedKey.length) {
      service.batchDeleteDimensionItem(dimensionItemGroupId, selectedKey).then(() => {
        message.success('批量删除成功');
        this.mySetState();
      }).catch(err => {
        message.error(err.response.data.message);
      })
    } else {
      message.warning('请选择你要删除的内容')
    }
  }

  // 搜索
  search = value => {
    this.mySetState({ searchParams: { dimensionItemCode: value }});
  }

  // 设置state
  mySetState = (params) => {
    let pagination = this.state.pagination;
    this.setState({ page: 0, pagination: { ...pagination, current: 1 }, ...params }, this.getList)
  }

  // 表格选择
  selectChange = key => {
    this.setState({ selectedKey: key });
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

  //返回
  onBackClick = e => {
    let dimensionId = this.props.match.params.dimensionId;
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/admin-setting/dimension-definition/dimension-details/${dimensionId}`,
      })
    );
  };

  // 弹出框取消
  onDimensionCancel = () => {
    this.setState({ visible: false });
  };

  // 分配子维值
  onDimensionOk = () => {
    let { dimensionItemIds, dimensionItemGroupId } = this.state;
    if(dimensionItemIds.length) {
      this.setState({ confirmLoading: true });
      service.distributeDimensionItem(dimensionItemGroupId, dimensionItemIds).then(() => {
        message.success('分配子维值成功');
        this.setState({ visible: false, confirmLoading: false })
        this.getList();
      }).catch(err => {
        message.error(err.response.data.message);
        this.setState({ confirmLoading: false });
      })
    } else {
      message.warning('请选择要分配的值');
    }
  }

  // 获取模态框选择的维值
  getModalDimensionItem = (ids) => {
    this.setState({ dimensionItemIds: ids });
  }

  render() {
    const {
      infoList, infoData, columns, data, pagination, visible, loading, dimensionItemGroupId, confirmLoading, selectedKey
    } = this.state;
    const rowSelection = {
      onChange: this.selectChange,
      selectedRowKeys: selectedKey,
    };

    return (
      <div>
        <BasicInfo
          infoList={infoList}
          infoData={infoData}
          isHideEditBtn={true}
        />
        <div style={{ margin: '40px 0 10px 0' }}>
          <Button
            type="primary"
            style={{ marginRight: '15px' }}
            onClick={() => {
              this.setState({ visible: true });
            }}
          >
            分配子维值
          </Button>
          <Popconfirm
            title="你确定删除？"
            onConfirm={this.batchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button>删除</Button>
          </Popconfirm>
          <Search
            placeholder="请输入维值代码"
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
          onChange={this.pageChange}
          loading={loading}
        />
        <p style={{ marginBottom: '20px' }}>
          <a onClick={this.onBackClick}>
            <Icon type="rollback" />返回
          </a>
        </p>
        <Modal
          title="分配子维值"
          visible={visible}
          onCancel={this.onDimensionCancel}
          width={800}
          onOk={this.onDimensionOk}
          destroyOnClose={true}
          confirmLoading={confirmLoading}
        >
          <ModalDimension ids={this.getModalDimensionItem} groupId={dimensionItemGroupId} />
        </Modal>
      </div>
    );
  }
}

export default connect(
  null,
  null,
  null,
  { withRef: true }
)(DistributionDimension);
