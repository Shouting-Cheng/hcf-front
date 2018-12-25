import React, { Component } from "react"

import httpFetch from 'share/httpFetch'
import Table from "widget/table"
import { Popover, message } from "antd"


class CustomTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      tableColumns: [],
      pagination: {
        total: 0,
        showTotal: (total, range) => this.$t("common.show.total", { range0: `${range[0]}`, range1: `${range[1]}`, total: total }),
        showSizeChanger: true,
        showQuickJumper: true,
        pageSize: 10,
        current: 1,
        onChange: this.indexChange,
        onShowSizeChange: this.sizeChange,
        pageSizeOptions: ['5', '10', '20', '30', '40'],
        ...props.pagination
      },
      loading: false,
      page: 0,
      size: props.pagination ? props.pagination.pageSize : 10,
      params: {},
      sortColumn: {
        title: this.$t('common.sequence'), dataIndex: "sort", width: 90, align: "center", render: (value, record, index) => {
          return <span>{this.state.page * this.state.size + index + 1}</span>
        }
      }
    }
  }

  componentDidMount() {
    const params = this.props.params || {};

    this.props.columns && this.props.columns.map(item => {
      if (item.tooltips) {
        item.render = value => <Popover content={value}>
          {value}
        </Popover>
      }
    })

    let tableColumns = [...this.props.columns];
    if (this.props.showNumber) {
      tableColumns = [sortColumn, ...this.props.columns]
    }

    this.setState({ params, tableColumns }, () => {
      this.getList();
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url !== this.props.url) {
      this.getList(nextProps.url);
    }
  }

  //搜索
  search = (params) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    this.setState({ page: 0, pagination, params }, this.getList);
  };

  //重新加载数据
  reload = () => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    this.setState({ page: 0, pagination, params: {} }, this.getList);
  };

  getList = (url) => {
    if (!this.props.url) return;

    this.setState({ loading: true });
    const { page, size, params } = this.state;

    let searchParams = { page: page, size: size, ...this.props.params, ...params };
    let { methodType, dataKey } = this.props;
    url = url || this.props.url;
    if (methodType && methodType === 'post') {
      let reg = /\?+/;
      if (reg.test(url)) {
        url = `${url}&page=${page}&size=${size}`;
      } else {
        url = `${url}?page=${page}&size=${size}`;
      }
      for (let name in searchParams) {
        url += `&${name}=${searchParams[name]}`
      }
    }
    httpFetch[methodType || 'get'](url, searchParams).then(res => {
      let pagination = {
        ...this.state.pagination,
        total: Number(res.headers["x-total-count"]) || 0
      };
      let data = dataKey ? res.data.dataKey : res.data;
      if (this.props.filterData) {
        data = this.props.filterData(data);
      }

      this.setState({ dataSource: data, loading: false, pagination }, () => {
        this.props.onLoadData && this.props.onLoadData(res.data, pagination)
      });
    }).catch(err => {
      message.error(err.response.data.message);
    });
  }

  indexChange = (page, size) => {
    let pagination = this.state.pagination;
    pagination.current = page;
    this.setState({ page: page - 1, pagination }, this.getList);
  }

  sizeChange = (page, size) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    pagination.pageSize = size;
    this.setState({ page: 0, size: size, pagination }, this.getList);
  }

  render() {
    const { dataSource, pagination, loading, tableColumns } = this.state;
    const { onClick, tableKey } = this.props;

    return (
      <Table
        rowKey={record => record[tableKey || 'id']}
        loading={loading}
        dataSource={dataSource}
        columns={tableColumns || []}
        pagination={pagination.total ? pagination : false}
        size="middle"
        bordered
        onRow={(record) => {
          return {
            onClick: () => { (onClick && onClick(record)) }
          }
        }}
      />
    )
  }
}

export default CustomTable
