import React from 'react';
import { Divider, Tag, message } from 'antd';
import httpFetch from '../../utils/fetch';
import './component-list.less';
import moment from 'moment';
import Table from 'widget/table'
class ComponentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      expandedRowKeys: [],
      columns: [
        { title: '名称', dataIndex: 'componentName' },
        {
          title: '类型',
          dataIndex: 'componentType',
          render: value => {
            return (
              <Tag color={value === 1 ? 'blue' : 'green'}>{value === 1 ? '组件' : '页面'}</Tag>
            );
          },
        },
      ],
    };
  }

  componentDidMount() {
    httpFetch.get('/api/component/query?enabled=true&page=0&size=9999').then(res => {
      this.setState({ data: res, loading: false });
    });
  }

  expand = (expand, record) => {
    if (expand && !record.versions) {
      httpFetch
        .get(
          `/api/componentVersion/query?componentId=${record.id}&enabled=true&page=0&size=9999`
        )
        .then(res => {
          let data = this.state.data;
          let model = data.find(o => o.id == record.id);

          res = res.map(item => {
            return {
              ...record,
              ...item,
              componentId: record.id,
              componentVersionNumber: record.versionNumber
            };
          });

          model.versions = res;

          this.setState({ data });
        });
    }
  };

  //编辑
  edit = (record, status) => {
    this.props.onEdit({
      ...record,
      status,
    });
  };

  delete = id => {
    httpFetch.delete('/api/componentVersion/delete/' + id).then(res => {
      message.success('删除成功！');
      this.setState({ loading: true });
      httpFetch.get('/api/component/query?enabled=true&page=0&size=9999').then(res => {
        this.setState({ data: res, loading: false, expandedRowKeys: [] });
      });
    });
  };

  expandedRowRender = record => {
    let columns = [
      {
        title: '序号',
        dataIndex: 'id',
        width: 90,
        align: 'center',
        render: (value, record, index) => index + 1,
      },
      { title: '备注', dataIndex: 'remark', align: 'center' },
      {
        title: '创建日期',
        dataIndex: 'createdDate',
        align: 'center',
        render: value => {
          return moment(value).format('YYYY-MM-DD hh:mm:ss');
        },
      },
      {
        title: '操作',
        width: 180,
        align: 'center',
        dataIndex: 'index',
        render: (value, record) => {
          return (
            <div>
              <a onClick={() => this.edit(record, 'edit')}>编辑</a>
              <Divider type="vertical" />
              <a onClick={() => this.edit(record, 'copy')}>复制</a>
              <Divider type="vertical" />
              <a onClick={() => this.delete(record.id)}>删除</a>
            </div>
          );
        },
      },
    ];

    return (
      <Table size="small" columns={columns} dataSource={record.versions || []} pagination={false} rowKey="id" />
    );
  };

  expandedRowsChange = expandedRowKeys => {
    this.setState({ expandedRowKeys });
  };

  render() {
    const { columns, data, loading, expandedRowKeys } = this.state;
    return (
      <Table
        className="components-table-nested"
        loading={loading}
        dataSource={data}
        columns={columns}
        expandedRowRender={this.expandedRowRender}
        pagination={false}
        onExpand={this.expand}
        rowKey="id"
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={this.expandedRowsChange}
        size="small"
      />
    );
  }
}

export default ComponentList;
