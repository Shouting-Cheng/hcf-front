import React, { Component } from 'react';
import { Button, Input, Icon, Badge, Card, Row, Col, Modal, Popconfirm, message } from 'antd';
import CustomTable from 'widget/table';
import BasicInfo from 'widget/basic-info';
import ModalDimension from './modal-dimension';
import { messages } from 'utils/utils';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

const Search = Input.Search;

class DistributionDimension extends Component {
  constructor(props) {
    super(props);
    this.state = {
      infoData: {},
      infoList: [
        {
          type: 'input',
          id: 'code',
          isRequired: true,
          label: '维值组代码',
        },
        {
          type: 'input',
          id: 'name',
          isRequired: true,
          label: '维值组名称',
        },
        {
          type: 'switch',
          id: 'enable',
          isRequired: true,
          label: '状态',
        },
      ],
      data: [],
      columns: [
        {
          title: '维值代码',
          dataIndex: 'tableName',
          align: 'center',
        },
        {
          title: '维值名称',
          dataIndex: 'tableName1',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'tableName2',
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
    };
  }

  // 生命周期获取数据
  componentDidMount() {
    this.getList();
    setTimeout(() => {
      this.setState({
        infoData: {
          code: 'demo',
          name: 'demo',
          enable: false,
        }
      })
    }, 1500)
  }

  // 获取数据
  getList = () => {
    let data = [
      {
        id: 101,
        tableName: 'demo',
        tableName1: 'demo',
        tableName2: 'demo',
        tableName3: 'demo',
      },
      {
        id: 102,
        tableName: 'demo',
        tableName1: 'demo',
        tableName2: 'demo',
        tableName3: 'demo',
      },
      {
        id: 103,
        tableName: 'demo',
        tableName1: 'demo',
        tableName2: 'demo',
        tableName3: false,
      },
    ];
    this.setState({ data: data });
  };

  // 删除
  delete = id => {
  };

  // 批量删除
  batchDelete = () => {
    let selectedKey = this.state.selectedKey;
    if(selectedKey.length) {
    } else {
      message.warning('请选择你要删除的内容')
    }
  }

  // 搜索
  search = value => {
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
    e.preventDefault();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/admin-setting/dimension-definition/dimension-details/`,
      })
    );
  };

  // 弹出框取消
  onDimensionCancel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { infoList, infoData, columns, data, pagination, visible, loading } = this.state;
    const rowSelection = {
      onChange: this.selectChange,
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
          <Button onClick={this.batchDelete}>删除</Button>
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
        >
          <ModalDimension />
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
