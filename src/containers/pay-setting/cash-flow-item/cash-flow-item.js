/**
 * created by zk on 2017/11/22
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Badge, message } from 'antd';

import SearchArea from 'widget/search-area.js';
import cashFlowItemService from './cash-flow-item.service';
import baseService from 'share/base.service';
import SlideFrame from 'widget/slide-frame';
import CreateOrUpdateItem from './createOrUpdate-item';

class CashFlowItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      showSlideFrame: false,
      nowItem: {},
      slideFrameTitle: '',
      searchParams: {
        setOfBookId: '',
        flowCode: '',
        description: '',
      },
      newParams: {},
      searchForm: [
        // {type: 'select', id: 'setOfBookId', label: `* ${this.props.intl.this.$t({id:"cash.transaction.class.setOfBooks"})}`, options: [],
        //   getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`, method: 'get', labelKey: 'setOfBooksName', valueKey: 'id', getParams: {roleType: 'TENANT'}}, //账套
        // {type: 'input',disabled: true, id: 'setOfBookId', defaultValue:this.props.company.setOfBooksName, label: `${this.props.intl.this.$t({id:"cash.transaction.class.setOfBooks"})}`,},
        {
          type: 'select',
          id: 'setOfBookId',
          label: this.$t({ id: 'cash.flow.item.setOfBooksName' }),
          options: [],
          defaultValue: '',
          isRequired: true,
          labelKey: 'setOfBooksCode',
          valueKey: 'setOfBooksId',
          event: 'setOfBooksId',
        },
        {
          type: 'input',
          id: 'flowCode',
          label: this.$t({ id: 'cash.flow.item.flowCode' }),
        } /*现金流量项代码*/,
        {
          type: 'input',
          id: 'description',
          label: this.$t({ id: 'cash.flow.item.description' }),
        } /*现金流量项名称*/,
      ],
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      columns: [
        {
          /*现金流量项代码*/
          title: this.$t({ id: 'cash.flow.item.flowCode' }),
          key: 'flowCode',
          dataIndex: 'flowCode',
        },
        {
          /*现金流量项名称*/
          title: this.$t({ id: 'cash.flow.item.description' }),
          key: 'description',
          dataIndex: 'description',
        },
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

  handleCreate = () => {
    if (this.state.searchParams.setOfBookId) {
      let searchParams = this.state.searchParams;
      this.setState({
        showSlideFrame: true,
        slideFrameTitle: this.$t({ id: 'cash.flow.item.createItem' }), //新建现金流量项
        nowItem: {
          item: {},
          searchParams: searchParams,
        },
      });
    } else {
      message.warning(this.$t({ id: 'cash.transaction.class.select.sob' }));
    }
  };

  //获取账套下的数据
  getList() {
    this.setState({ loading: true });
    let params = {};
    params.setOfBookId = this.state.searchParams.setOfBookId;
    if (this.state.searchParams.flowCode) {
      params.flowCode = this.state.searchParams.flowCode;
    }
    if (this.state.searchParams.description) {
      params.description = this.state.searchParams.description;
    }
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    cashFlowItemService.getCashFlowItem(params).then(response => {
      if (response.status === 200) {
        response.data.map(item => {
          item.key = item.id;
        });
        this.setState({
          loading: false,
          data: response.data,
          pagination: {
            total: Number(response.headers['x-total-count']),
            current: this.state.pagination.current,
            page: this.state.pagination.page,
            pageSize: this.state.pagination.pageSize,
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
      }
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

  handleSearch = values => {
    let searchParams = {
      setOfBookId: values.setOfBookId,
      flowCode: values.flowCode,
      description: values.description,
    };
    this.setState(
      {
        searchParams: searchParams,
        loading: true,
        pagination: {
          current: 1,
          page: 0,
          pageSize: this.state.pagination.pageSize,
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

  handleCloseSlide = params => {
    this.setState({
      showSlideFrame: false,
    });
    if (params) {
      this.getList();
    }
  };
  //每页多少条
  onChangePageSize = (page, pageSize) => {
    if (page - 1 !== this.state.page || pageSize !== this.state.pageSize) {
      this.setState({ page: page - 1, pageSize: pageSize }, () => {
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
    let searchParams = this.state.searchParams;
    this.setState({
      nowItem: {
        item: record,
        searchParams: searchParams,
      },
      showSlideFrame: true,
      slideFrameTitle: this.$t({ id: 'cash.flow.item.editorItem' }) /*编辑现金流量项*/,
    });
  };

  handleClose = params => {
    this.setState(
      {
        showSlideFrame: false,
      },
      () => {
        params && this.getList();
      }
    );
  };
  render() {
    const {
      loading,
      data,
      searchForm,
      pagination,
      columns,
      showSlideFrame,
      nowItem,
      slideFrameTitle,
    } = this.state;

    return (
      <div className="cash-flow-item">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.handleSearch}
          eventHandle={this.searchEventHandle}
          clearHandle={this.clearEventHandle}
        />
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>
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
          bordered
          onRow={record => ({
            onClick: () => this.handleRowClick(record),
          })}
          size="middle"
        />
        <SlideFrame
          title={slideFrameTitle}
          show={showSlideFrame}
          afterClose={this.handleCloseSlide}
          onClose={() => this.setState({ showSlideFrame: false })}
        >
          <CreateOrUpdateItem
            onClose={e => this.handleClose(e)}
            params={{ ...nowItem, flag: showSlideFrame }}
          />
        </SlideFrame>
      </div>
    );
  }
}

// CashFlowItem.contextTypes = {
//   router: React.PropTypes.object
// };

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
)(CashFlowItem);
