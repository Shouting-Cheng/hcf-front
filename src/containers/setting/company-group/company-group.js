import React from 'react';
import { connect } from 'dva';

import { Button, Table, Badge, notification, Popover, Popconfirm, message } from 'antd';
import companyGroupService from 'containers/setting/company-group/company-group.service';
import config from 'config';

import 'styles/setting/company-group/company-group.scss';

import { routerRedux } from 'dva/router';

import SearchArea from 'widget/search-area';

class CompanyGroup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: [],
      searchParams: {
        setOfBooksId: '', //this.props.company.setOfBooksId,
        companyGroupCode: '',
        companyGroupName: '',
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      searchForm: [
        {
          type: 'select',
          id: 'setOfBooksId',
          label: this.$t({ id: 'setting.set.of.book' } /*账套*/),
          options: [],
          renderOption: option => {
            return option.setOfBooksCode + '-' + option.setOfBooksName;
          },
          //defaultValue: this.props.company.setOfBooksName,
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          labelKey: 'setOfBooksCode',
          valueKey: 'id',
          getParams: { roleType: 'TENANT' },
        },
        {
          type: 'input',
          id: 'companyGroupCode',
          label: this.$t({ id: 'setting.companyGroupCode' }),
        } /*公司组代码*/,
        {
          type: 'input',
          id: 'companyGroupName',
          label: this.$t({ id: 'setting.companyGroupName' }),
        } /*公司组名称*/,
      ],
      columns: [
        {
          /*公司组代码*/
          title: this.$t({ id: 'setting.companyGroupCode' }),
          key: 'companyGroupCode',
          dataIndex: 'companyGroupCode',
        },
        {
          /*公司组名称*/
          title: this.$t({ id: 'setting.companyGroupName' }),
          key: 'companyGroupName',
          dataIndex: 'companyGroupName',
        },
        {
          /*账套*/
          title: this.$t({ id: 'setting.set.of.book' }),
          key: 'setOfBooksName',
          dataIndex: 'setOfBooksName',
        },

        {
          /*状态*/
          title: this.$t({ id: 'common.column.status' }),
          key: 'status',
          width: '10%',
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
        },
        {
          title: this.$t({ id: 'common.operation' }),
          key: 'operation',
          width: '15%',
          render: (text, record) => (
            <span>
              <Popconfirm
                onConfirm={e => this.deleteItem(e, record)}
                title={this.$t(
                  { id: 'budget.are.you.sure.to.delete.rule' },
                  { controlRule: record.controlRuleName }
                )}
              >
                {/* 你确定要删除organizationName吗 */}
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {this.$t({ id: 'common.delete' })}
                </a>
              </Popconfirm>
            </span>
          ),
        }, //操作
      ],
    };
  }

  deleteItem = (e, record) => {
    this.setState({ loading: true });
    companyGroupService.deleteCompanyGroupById(record.id).then(response => {
      message.success(this.$t({ id: 'common.delete.success' }, { name: record.companyGroupName })); // name删除成功
      this.setState(
        {
          loading: false,
        },
        this.getList
      );
    });
  };

  componentWillMount() {
    this.getList();
  }

  //获取公司组数据
  getList() {
    let params = this.state.searchParams;
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    companyGroupService.getCompanyGroupByOptions(params).then(response => {
      response.data.map((item, index) => {
        item.key = item.id;
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        data: response.data,
        pagination,
        loading: false,
      });
    });
  }

  handleSearch = values => {
    let searchParams = {};
    let pagination = this.state.pagination;
    pagination.page = 0;
    pagination.pageSize = 10;
    pagination.current = 1;
    for (let key in values) {
      searchParams[key] = typeof values[key] !== 'undefined' ? values[key] : '';
    }
    this.setState(
      {
        searchParams,
        pagination,
        loading: true,
      },
      () => {
        this.getList();
      }
    );
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

  //新建公司组
  handleCreate = () => {
    // this.context.router.push(menuRoute.getRouteItem('new-company-group').url.replace(':companyGroupId', 'NEW'));
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/company-group/new-company-group/'NEW'`,
      })
    );
  };

  //点击行，进入该行详情页面
  handleRowClick = (record, index, event) => {
    // this.context.router.push(menuRoute.getMenuItemByAttr('company-group', 'key').children.companyGroupDetail.url.replace(':id',record.id));
    // this.props.dispatch(
    //     routerRedux.push({
    //         pathname: `/admin-setting/company-group/company-group-detail/`,
    //     })
    // );
  };

  render() {
    const { searchForm, loading, data, columns, pagination } = this.state;
    return (
      <div className="budget-structure">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.handleSearch}
          clearHandle={() => {}}
        />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}
          </div>{' '}
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>
              {this.$t({ id: 'common.create' })}
            </Button>{' '}
            {/*新 建*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          onChange={this.onChangePager}
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
)(CompanyGroup);
