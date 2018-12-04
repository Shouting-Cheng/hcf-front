import React, { Component } from 'react';
import { Table, Badge, Tooltip } from 'antd';

import httpFetch from 'share/httpFetch';

import moment from 'moment';
import columnTemplate from '../../column-template/index';

class CustomTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      columns: [],
      url: '',
      pagination: {
        total: 0,
        showTotal: this.showTotal,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSize: 10,
        current: 1,
        onChange: this.indexChange,
        onShowSizeChange: this.sizeChange,
        pageSizeOptions: ['10', '20', '30', '40'],
      },
      loading: false,
      page: 0,
      size: 10,
      searchParams: {},
    };
  }

  componentDidMount() {
    if (this.props.getRef) {
      this.props.getRef(this);
    }

    if (this.props.url.indexOf('/') >= 0) {
      this.setState({ url: this.props.url }, this.getList);
    } else {
      httpFetch.get('/auth/api/interface/query/' + this.props.url).then(res => {
        this.setState({ url: res.data.reqUrl }, this.getList);
      });
    }

    // this.getList();

    const { columns = [] } = this.props;

    let tableColumns = [];

    columns.map(item => {
      if (item.template) {
        let templateStr = String(item.template).split('.');
        item.render = columnTemplate[templateStr[0]][templateStr[1]];
      } else {
        if (item.typeCode === 'date') {
          item.render = (value, record, index) => {
            if (!value) return '-';
            return <span>{moment(value).format('YYYY-MM-DD')}</span>;
          };
          item.width = item.width || 110;
          item.align = item.align || 'center';
        } else if (item.typeCode === 'money') {
          item.render = (value, record, index) => {
            return <span>{this.filterMoney(value)}</span>;
          };
          item.width = item.width || 110;
          item.align = item.align || 'center';
        } else if (item.typeCode === 'currency') {
          item.render = (value, record, index) => {
            return <span>{value}</span>;
          };
          item.width = item.width || 110;
          item.align = item.align || 'center';
        } else if (item.typeCode === 'name') {
          item.render = (value, record, index) => {
            return <span>{value}</span>;
          };
          item.width = item.width || 100;
          item.align = item.align || 'center';
        } else if (item.typeCode === 'progress') {
          item.render = (value, record, index) => {
            return (
              <Badge status={this.$statusList[value].state} text={this.$statusList[value].label} />
            );
          };
          item.width = item.width || 120;
          item.align = item.align || 'center';
        } else {
          if (item.showTooltip) {
            item.render = (value, record, index) => {
              return <Tooltip title={value}>{value}</Tooltip>;
            };
          }
        }
      }

      tableColumns.push(item);
    });

    this.setState({ columns: tableColumns });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url !== this.props.url) {
      this.getList();
    }
  }

  search = params => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    this.setState({ page: 0, pagination, searchParams: params }, () => {
      this.getList();
    });
  };

  reload = () => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    this.setState({ page: 0, pagination, searchParams: {} }, this.getList);
  };

  test = params => {
    console.log(params);
    console.log('hello world!');
  };

  getList = () => {
    if (!this.state.url) return;

    this.setState({ loading: true });
    const { page, size, searchParams } = this.state;

    httpFetch.get(this.state.url, { page: page, size: size, ...searchParams }).then(res => {
      let pagination = {
        ...this.state.pagination,
        total: Number(res.headers['x-total-count']) || 0,
      };

      this.setState({ dataSource: res.data, loading: false, pagination });
    });
  };

  indexChange = (page, size) => {
    let pagination = this.state.pagination;
    pagination.current = page;
    this.setState({ page: page - 1, pagination }, this.getList);
  };

  sizeChange = (page, size) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    pagination.pageSize = size;
    this.setState({ page: 0, size: size, pagination }, this.getList);
  };

  showTotal = (total, range) => {
    return `共有 ${total} 条数据`;
  };

  render() {
    const { dataSource, pagination, loading, columns } = this.state;

    return (
      <Table
        rowKey={record => record.id}
        loading={loading}
        dataSource={dataSource}
        columns={columns || []}
        pagination={pagination}
        size="middle"
        bordered
        onRow={record => {
          return {
            onClick: () => {
              this.props.onRowClick && this.props.onRowClick(record);
            },
          };
        }}
      />
    );
  }
}

export default CustomTable;
