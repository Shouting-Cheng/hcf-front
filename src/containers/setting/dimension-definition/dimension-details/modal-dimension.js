import React, { Component } from 'react';
import { Badge } from 'antd';
import SearchArea from 'widget/search-area';
import CustomTable from 'widget/table';

import service from './dimension-group-service';

class ModalDimension extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        {
          type: 'input',
          id: 'dimensionItemCode',
          placeholder: '请输入',
          label: '维值代码',
          colSpan: 8,
        },
        {
          type: 'input',
          id: 'dimensionItemName',
          placeholder: '请输入',
          label: '维值名称',
          colSpan: 8,
        },
        {
          type: 'value_list',
          id: 'enabled',
          placeholder: '请选择',
          label: '状态',
          colSpan: 8,
          options: [
            { label: '启用', value: true },
            { label: '禁用', value: false },
          ]
        }
      ],
      modalColumns: [
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
      ],
      modalData: [],
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
      loading: false,
      searchParams: {},
      dimensionItemGroupId: this.props.groupId,
    }
  }

  // 生命周期获取数据
  componentDidMount() {
    this.getList();
  }

  // 获取数据
  getList = () => {
    let { dimensionItemGroupId, page, size, searchParams, pagination } = this.state;
    let params = { dimensionItemGroupId, page, size, ...searchParams };
    this.setState({ loading: true });
    service.getDistributeDimensionItem(params).then(res => {
      let total = Number(res.headers['x-total-count']);
      this.setState({ modalData: res.data, loading: false, pagination: { ...pagination, total } });
    })
  }

  // 搜索
  modalSearch = (value) => {
    let pagination = this.state.pagination;
    this.setState({ searchParams: value, page: 0, pagination: { ...pagination, current: 1 } }, this.getList)
  }

  // 表格选择
  selectChange = (keys) => {
    this.props.ids && this.props.ids(keys);
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
    const { searchForm, modalData, modalColumns, pagination, loading } = this.state;
    const rowSelection = {
      onChange: this.selectChange
    }

    return (
      <div>
        <SearchArea searchForm={searchForm} submitHandle={this.modalSearch} />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: pagination.total || modalData.length })}{/* 共 total 条数据 */}
          </div>
        </div>
        <CustomTable
          rowKey={record => record['id']}
          dataSource={modalData}
          columns={modalColumns}
          rowSelection={rowSelection}
          pagination={pagination}
          loading={loading}
        />
      </div>
    )
  }
}

export default ModalDimension;
