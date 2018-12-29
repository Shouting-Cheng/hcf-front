/**
 * Created by zaranengap on 2017/7/4.
 * 显示系统值列表与自定义值列表
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Badge, message } from 'antd';
import Table from 'widget/table';

import valueListService from 'containers/setting/value-list/value-list.service';
import 'styles/setting/value-list/value-list.scss';
import { messages } from 'utils/utils';
import { routerRedux } from 'dva/router';
import SearchArea from 'widget/search-area';


class ValueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonFlag: false,
      loading: false,
      data: [],
      searchParams: {},
      typeFlag: {
        CUSTOM: '用户定义值列表',
        INIT: '初始化值列表',
        SYSTEM: '系统级值列表',
      },
      status: 'CUSTOM',
      columns: [
        {
          title: messages('common.sequence'/*序号*/),
          dataIndex: 'index',
        },
        {
          title: messages('value.list.code'/*值列表代码*/),
          dataIndex: 'code',
        },
        {
          title: messages('value.list.information'/*值列表名称*/),
          dataIndex: 'name',
        },
        {
          title: messages('value.list.type'/*值列表类型*/),
          dataIndex: 'typeFlag',
          render: value => this.state.typeFlag[value],
        },
        {
          title: messages('common.column.status'/*状态*/),
          dataIndex: 'enabled',
          render: enabled =>
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? messages('common.status.enable') : messages('common.status.disable')}/>,
        },
      ],
      searchForm: [
        {
          type: 'input',
          id: 'code',
          label: messages('value.list.code'/*值列表代码*/),
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'name',
          label: messages('value.list.information'/*值列表名称*/),
          colSpan: 6,
        },
        {
          type: 'select',
          id: 'typeFlag',
          label: messages('value.list.type'/*值列表类型*/),
          colSpan: '6',
          options: [
            { value: 'CUSTOM', label: '用户定义值列表' },
            { value: 'INIT', label: '初始化值列表' },
            { value: 'SYSTEM', label: '系统级值列表' },
          ],
        }, // 状态
      ],
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },
      showListSelector: false,
    };
  }

  componentDidMount() {
    //记住页面
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState({
      pagination,
    }, () => {
      this.clearBeforePage();
      this.getList();
    });
  }

  //得到值列表数据
  getList() {
    const { pagination, searchParams } = this.state;
    this.setState({ loading: true });
    valueListService.getValueListList(pagination.page, pagination.pageSize, searchParams)
    .then(res => {
      res.data.map((item, index) => {
        item.index = pagination.page * pagination.pageSize + index + 1;
        item.key = item.index;
      });
      pagination.total = Number(res.headers['x-total-count']) || 0;
      this.setState({
        data: res.data,
        loading: false,
        pagination: {
          ...pagination,
          onChange: this.onChangePager,
          onShowSizeChange: this.onShowSizeChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            this.$t(
              'common.show.total',
              { range0: `${range[0]}`, range1: `${range[1]}`, total: total },
            ),
        },
      });
    }).catch(() => {
      this.setState({ loading: false });
      message.error(
        this.$t('common.error'  /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/),
      );
    });
    ;
  }

  //改变每页显示的条数
  onShowSizeChange = (current, pageSize) => {
    let pagination = this.state.pagination;
    pagination.page = current - 1;
    pagination.pageSize = pageSize;
    this.setState({
      pagination,
    }, () => {
      this.getList();
    });
  };

  //分页点击
  onChangePager = (p) => {
    let pagination = this.state.pagination;
    pagination.page = p.current - 1;
    pagination.current = p.current;
    this.setState({
      pagination,
    }, () => {
      this.getList();
    });
  };


  handleRowClick = (record) => {
    this.setBeforePage(this.state.pagination);

    this.props.dispatch(routerRedux.push({
      pathname: `/admin-setting/value-list-detail/${record.codeOid}/${record.id}/:tab`.replace(':tab', this.state.status),
    }));

  };

  goValueListPage = () => {
    this.props.dispatch(routerRedux.push({
      pathname: '/admin-setting/new-value-list/:tab'.replace(':tab', this.state.status),
    }));
  };

  search = values => {
    let pagination = this.state.pagination;
    this.setState({
      searchParams: { ...this.state.searchParams, ...values },
      pagination: { ...pagination, current: 0 },
    }, () => {
      this.getList();
    });
  };

  // 清除
  clearFunction = () => {
    this.setState({ searchParams: {} });
  };

  render() {
    const {
      columns, data, loading, pagination, searchParams, searchForm,
    } = this.state;
    return (
      <div style={{ paddingBottom: 20 }} className="value-list">
        <SearchArea
          maxLength={4}
          searchParams={searchParams}
          submitHandle={this.search}
          clearHandle={this.clearFunction}
          searchForm={searchForm}
        />
        <div className="table-header">
          <div className="table-header-buttons" style={{ paddingTop: 15 }}>
            <Button type="primary" onClick={this.goValueListPage} style={{ marginRight: 15 }}>
              {/*新增值列表*/}
              {messages('value.list.new')}
            </Button>
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               onChange={this.onChangePager}
               loading={loading}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record),
               })}
               rowKey={record => record.id}
               bordered
               size="middle"/>


      </div>
    );
  }
}


function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps, null, null, { withRef: true })(ValueList);
