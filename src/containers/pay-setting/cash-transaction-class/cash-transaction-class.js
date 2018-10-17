/**
 * created by zk on 2017/11/22
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Badge, notification, Popover, Popconfirm, message } from 'antd';

import SearchArea from 'widget/search-area.js';
import cashTransactionClassService from './cash-transaction-class.service';
import baseService from 'share/base.service';
import { routerRedux } from 'dva/router';

class CashTransactionClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        { title: this.$t({ id: 'cash.transaction.class.type' }), dataIndex: 'typeName' }, //现金事务类型
        { title: this.$t({ id: 'cash.transaction.class.code' }), dataIndex: 'classCode' }, //现金事务代码
        { title: this.$t({ id: 'cash.transaction.class.description' }), dataIndex: 'description' }, //现金事务名称
        {
          title: this.$t({ id: 'common.column.status' }),
          dataIndex: 'enabled',
          render: enabled => (
            <Badge
              status={enabled ? 'success' : 'error'}
              text={
                enabled
                  ? this.$t({ id: 'common.status.enable' })
                  : this.$t({ id: 'common.status.disable' })
              }
            />
          ),
        }, //状态
      ],
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      cashTransactionClassDetailPage:
        '/pay-setting/cash-transaction-class/cash-transaction-class-detail/:id', //现金事物定义详情的页面项
      newCashTransactionClass:
        '/pay-setting/cash-transaction-class/new-cash-transaction-class/:setOfBooksId', //新建现金事务的页面项
      searchParams: {
        setOfBookId: '',
        typeCode: '',
        classCode: '',
        description: '',
      },
      searchForm: [
        // {type: 'select', id: 'setOfBookId', label: `* ${this.$t({id:"cash.transaction.class.setOfBooks"})}`, options: [],
        //   getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`, method: 'get', labelKey: 'setOfBooksName', valueKey: 'id', getParams: {roleType: 'TENANT'}}, //账套
        {
          type: 'select',
          colSpan: 6,
          id: 'setOfBookId',
          label: this.$t({ id: 'cash.transaction.class.setOfBooksName' }),
          options: [],
          defaultValue: '',
          isRequired: true,
          labelKey: 'setOfBooksCode',
          valueKey: 'setOfBooksId',
          event: 'setOfBooksId',
        },
        {
          type: 'value_list',
          colSpan: 6,
          id: 'typeCode',
          label: this.$t({ id: 'cash.transaction.class.type' }),
          options: [],
          valueListCode: 2104,
        } /*现金事务类型代码*/,
        {
          type: 'input',
          colSpan: 6,
          id: 'classCode',
          label: this.$t({ id: 'cash.transaction.class.code' }),
        } /*现金事务分类代码*/,
        {
          type: 'input',
          colSpan: 6,
          id: 'description',
          label: this.$t({ id: 'cash.transaction.class.description' }),
        } /*现金事务分类名称*/,
      ],
      nowClass: {},
      showSlideFrame: false,
    };
  }

  componentWillMount() {
    baseService.getSetOfBooksByTenant().then(res => {
      let searchForm = this.state.searchForm;
      let searchParams = this.state.searchParams;
      searchForm[0].defaultValue = this.props.company.setOfBooksId;
      const options = [];
      res.data.map(item => {
        options.push({
          label: item.setOfBooksCode + ' - ' + item.setOfBooksName,
          value: String(item.id),
        });
      });
      searchForm[0].options = options;
      searchParams.setOfBookId = this.props.company.setOfBooksId;
      this.setState({ searchForm, searchParams }, () => {
        this.getList();
      });
    });
  }

  editItem = (e, record) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      nowClass: record,
      showSlideFrame: true,
    });
  };

  //得到列表数据
  getList() {
    this.setState({ loading: true });
    // let params = this.state.searchParams;
    let params = {};
    params.setOfBookId = this.state.searchParams.setOfBookId;
    if (this.state.searchParams.typeCode) {
      params.typeCode = this.state.searchParams.typeCode;
    }
    if (this.state.searchParams.classCode) {
      params.classCode = this.state.searchParams.classCode;
    }
    if (this.state.searchParams.description) {
      params.description = this.state.searchParams.description;
    }
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    cashTransactionClassService.getCashTransactionClass(params).then(response => {
      response.data.map(item => {
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count'])
            ? Number(response.headers['x-total-count'])
            : 0,
          onChange: this.onChangePager,
          current: params.page + 1,
          pageSizeOptions: ['10', '20', '30', '40'],
          showSizeChanger: true,
          onShowSizeChange: this.onChangePageSize,
          showQuickJumper: true,
          showTotal: (total, range) =>
            this.$t(
              { id: 'common.show.total' },
              { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
            ),
        },
      });
    });
  }

  //获取选择的账套
  searchEventHandle = (e, value) => {
    if (e === 'setOfBooksId') {
      this.setState({ searchParams: { setOfBookId: value } }, () => {
        if (value) {
          this.getList();
        } else {
          this.setState({
            data: [],
            pagination: {
              current: 1,
              page: 0,
              total: 0,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            },
          });
        }
      });
    }
  };
  //每页多少条
  onChangePageSize = (page, pageSize) => {
    if (page - 1 !== this.state.page || pageSize !== this.state.pageSize) {
      this.setState({ page: page - 1, pageSize: pageSize, loading: true }, () => {
        this.getList();
      });
    }
  };
  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: {
          current: pagination.current,
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
        },
      },
      () => {
        this.getList();
      }
    );
  };

  handleRowClick = record => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.cashTransactionClassDetailPage.replace(':id', record.id),
      })
    );
  };

  search = result => {
    this.setState(
      {
        page: 0,
        searchParams: {
          setOfBookId: result.setOfBookId ? result.setOfBookId : '',
          typeCode: result.typeCode ? result.typeCode : '',
          classCode: result.classCode ? result.classCode : '',
          description: result.description ? result.description : '',
        },
      },
      () => {
        this.getList();
      }
    );
  };

  clearEventHandle = () => {
    this.setState(
      {
        searchParams: {
          setOfBookId: this.props.company.setOfBooksId,
        },
      },
      () => {
        this.getList();
      }
    );
  };

  handleNew = () => {
    if (this.state.searchParams.setOfBookId) {
      this.props.dispatch(
        routerRedux.push({
          pathname: this.state.newCashTransactionClass.replace(
            ':setOfBooksId',
            this.state.searchParams.setOfBookId
          ),
        })
      );
    } else {
      message.warning(this.$t({ id: 'cash.transaction.class.select.sob' }));
    }
  };

  handleCloseSlide = success => {
    success && this.getList();
    this.setState({ showSlideFrame: false });
  };

  render() {
    const { loading, data, searchForm, pagination, columns, showSlideFrame, nowClass } = this.state;

    return (
      <div className="cash-transaction-class">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          eventHandle={this.searchEventHandle}
          maxLength={4}
          clearHandle={this.clearEventHandle}
        />
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>
              {this.$t({ id: 'common.create' })}
            </Button>{' '}
            {/*新建*/}
          </div>
        </div>
        <Table
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={this.onChangePager}
          columns={columns}
          onRow={record => ({
            onClick: () => this.handleRowClick(record),
          })}
          size="middle"
          bordered
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(CashTransactionClass);
