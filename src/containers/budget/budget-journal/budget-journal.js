import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Popover,  Select, Tag, Badge, message } from 'antd';
import Table from 'widget/table'
import httpFetch from 'share/httpFetch';
import config from 'config';
import SearchArea from 'components/Widget/search-area.js';
import budgetJournalService from 'containers/budget/budget-journal/budget-journal.service';
import 'styles/budget/budget-journal/budget-journal.scss';
import Error from 'widget/error';

class BudgetJournal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      searchParams: {
        journalTypeId: '',
        journalCode: '',
        periodStrategy: '',
        status: '',
      },
      organization: {},
      pagination: {
        total: 0,
      },
      page: 0,
      pageSize: 10,
      showUpdateSlideFrame: false,
      showCreateSlideFrame: false,
      searchForm: [
        {
          type: 'select',
          id: 'journalTypeId',
          label: this.$t({ id: 'budgetJournal.journalTypeId' }),
          options: [],
          method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/journals/journalType/selectByInput`,
          getParams: { organizationId: this.props.organization.id },
          labelKey: 'journalTypeName',
          valueKey: 'id',
        },
        {
          type: 'input',
          id: 'journalCode',
          label: this.$t({ id: 'budgetJournal.journalCode' }) /*预算日记账编号*/,
        },
        {
          type: 'value_list',
          label: this.$t({ id: 'budgetJournal.periodStrategy' }),
          id: 'periodStrategy',
          options: [],
          valueListCode: 2002,
        },
        {
          type: 'value_list',
          label: this.$t({ id: 'budgetJournal.status' }),
          id: 'status',
          options: [],
          valueListCode: 2028,
        },
      ],

      columns: [
        {
          /*预算日记账编号*/
          title: this.$t({ id: 'budgetJournal.journalCode' }),
          key: 'journalCode',
          dataIndex: 'journalCode',
          width: '18%',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*预算日记账类型*/
          title: this.$t({ id: 'budgetJournal.journalTypeId' }),
          key: 'journalTypeName',
          dataIndex: 'journalTypeName',
          width: '16%',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*编制期段*/
          title: this.$t({ id: 'budgetJournal.periodStrategy' }),
          key: 'periodStrategyName',
          dataIndex: 'periodStrategyName',
          width: '8%',
        },
        {
          /*预算表*/
          title: '预算表',
          key: 'structureName',
          dataIndex: 'structureName',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*预算场景*/
          title: this.$t({ id: 'budgetJournal.scenarioId' }),
          key: 'scenario',
          dataIndex: 'scenario',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*预算版本*/
          title: this.$t({ id: 'budgetJournal.versionId' }),
          key: 'versionName',
          dataIndex: 'versionName',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*创建时间*/
          title: this.$t({ id: 'budgetJournal.createdDate' }),
          key: 'createdDate',
          dataIndex: 'createdDate',
          render: recode => (
            <Popover content={String(recode).substring(0, 10)}>
              {String(recode).substring(0, 10)}
            </Popover>
          ),
        },
        {
          /*状态*/
          title: this.$t({ id: 'budgetJournal.status' }),
          key: 'status',
          dataIndex: 'status',
          render(recode, text) {
            switch (recode) {
              case 1001: {
                return <Badge status="processing" text="编辑中" />;
              }
              case 1003: {
                return <Badge status="default" text="撤回" />;
              }
              case 1005: {
                return <Badge status="error" text="审批驳回" />;
              }
              case 1004: {
                return <Badge status="success" text="审批通过" />;
              }
              case 1002: {
                return <Badge status="warning" text="审批中" />;
              }
              case 5001: {
                return <Badge status="default" text="复核" />;
              }
              case 5002: {
                return <Badge status="default" text="反冲提交" />;
              }
              case 5003: {
                return <Badge status="default" text="反冲复核" />;
              }
            }
          },
        },
      ],
      // newBudgetJournalDetailPage: menuRoute.getRouteItem('new-budget-journal', 'key'),    //新建预算日记账的页面项
      // budgetJournalDetailPage: menuRoute.getRouteItem('budget-journal-detail', 'key'),    //预算日记账详情
      // budgetJournalDetailSubmit: menuRoute.getRouteItem('budget-journal-detail-submit', 'key'),
      selectedEntityOIDs: [], //已选择的列表项的OIDs
    };
  }

  componentDidMount() {
    if (JSON.stringify(this.props.organization) != '{}') {
      this.getList();
    }
  }

  //获取预算日记账数据
  getList() {
    this.setState({ loading: true });
    let params = Object.assign({}, this.state.searchParams);
    params.organizationId = this.props.organization.id;
    params.page = this.state.page;
    params.size = this.state.pageSize;
    budgetJournalService
      .getBudgetJournalHeader(params)
      .then(response => {
        this.setState({
          data: response.data,
          loading: false,
          pagination: {
            total: Number(response.headers['x-total-count'])
              ? Number(response.headers['x-total-count'])
              : 0,
            onChange: this.onChangePager,
            current: this.state.page + 1,
          },
        });
      })
      .catch(e => {
        message.error(e.response.data.message);
      });
  }

  //分页点击
  onChangePager = page => {
    if (page - 1 !== this.state.page)
      this.setState(
        {
          page: page - 1,
          loading: true,
        },
        () => {
          this.getList();
        }
      );
  };

  //点击搜搜索
  handleSearch = values => {
    this.setState(
      {
        searchParams: values,
      },
      () => {
        this.getList();
      }
    );
  };

  //新建
  handleCreate = () => {
    // let path = this.state.newBudgetJournalDetailPage.url;
    // this.context.router.push(path)
    this.props.dispatch(
      routerRedux.push({
        pathname: `/budget/budget-journal/new-budget-journal`,
      })
    );
  };

  //跳转到详情
  HandleRowClick = value => {
    const journalCode = value.id;
    if (value.status === 1001 || value.status === 1003 || value.status === 1005) {
      // let path = this.state.budgetJournalDetailPage.url.replace(":journalCode", journalCode);
      // this.context.router.push(path);
      this.props.dispatch(
        routerRedux.push({
          pathname: `/budget/budget-journal/budget-journal-detail/${journalCode}`,
        })
      );
    } else {
      // let path = this.state.budgetJournalDetailSubmit.url.replace(":journalCode", journalCode);
      // this.context.router.push(path);
      this.props.dispatch(
        routerRedux.push({
          pathname: `/budget/budget-journal/budget-journal-detail-submit/${journalCode}`,
        })
      );
    }
  };

  render() {
    const {
      loading,
      searchForm,
      data,
      selectedRowKeys,
      pagination,
      columns,
      batchCompany,
    } = this.state;
    const organization = this.props.organization;


    return organization && JSON.stringify(organization) != '{}' ? (
      <div className="budget-journal">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch} />
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
          size="middle"
          bordered
          rowKey={record => record.id}
          onRow={record => ({
            onClick: () => this.HandleRowClick(record),
          })}
        />
      </div>
    ) : (
        <Error
          text={this.$t('main.error.budget.organization')}
          title={this.$t('main.error.budget.organization.description')}
          skip="/budget-setting/budget-organization"
          buttonText={this.$t('main.error.set')}
          hasButton
        />
      );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    organization: state.user.organization || {},
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(BudgetJournal);
