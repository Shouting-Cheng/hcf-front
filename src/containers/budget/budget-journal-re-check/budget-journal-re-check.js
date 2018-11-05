/**
 * Created by 13576 on 2017/10/20.
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Popover, Table, Select, Tag, Badge } from 'antd';
import httpFetch from 'share/httpFetch';
import config from 'config';
import SearchArea from 'widget/search-area.js';
import budgetJournalService from 'containers/budget/budget-journal-re-check/budget-journal-re-check.service';



class BudgetJournalReCheck extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      searchParams: {
        journalCode: '',
        journalTypeId: '',
        periodStrategy: '',
        versionId: '',
        structureId: '',
        scenarioId: '',
        empId: '',
        createDate: '',
      },
      params: {
        journalCode: '',
        journalTypeId: '',
        periodStrategy: '',
        versionId: '',
        structureId: '',
        scenarioId: '',
        createDate: '',
      },
      pagination: {
        current: 0,
        page: 0,
        total: 0,
        pageSize: 10,
      },

      searchForm: [
        {
          type: 'input', id: 'journalCode',
          label: this.$t({ id: 'budgetJournal.journalCode' }), /*预算日记账编号*/
        },
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
          type: 'value_list',
          label: this.$t({ id: 'budgetJournal.periodStrategy' }),
          id: 'periodStrategy',
          options: [],
          valueListCode: 2002,
        },
        {
          type: 'select',
          id: 'versionId',
          label: this.$t({ id: 'budgetJournal.versionId' }),
          options: [],
          method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/versions/queryAll`,
          getParams: { organizationId: this.props.organization.id },
          labelKey: 'versionName',
          valueKey: 'id',
        },
        {
          type: 'select',
          id: 'structureId',
          label: this.$t({ id: 'budgetJournal.structureId' }),
          options: [],
          method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/structures/queryAll`,
          getParams: { organizationId: this.props.organization.id },
          labelKey: 'structureName',
          valueKey: 'id',
        },
        {
          type: 'select',
          id: 'scenarioId',
          label: this.$t({ id: 'budgetJournal.scenarioId' }),
          options: [],
          method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/scenarios/queryAll`,
          getParams: { organizationId: this.props.organization.id },
          labelKey: 'scenarioName',
          valueKey: 'id',
        },
        {
          type: 'select',
          id: 'empId',
          label: this.$t({ id: 'budgetJournal.employeeId' }),
          options: [],
          method: 'get',
          getUrl: `${config.budgetUrl}/api/budget/journals/selectCheckedEmp`,
          getParams: {},
          labelKey: 'empName',
          valueKey: 'empOid',
        },
        { type: 'date', id: 'createDate', label: this.$t({ id: 'budgetJournal.submitDate' }) },
      ],

      columns: [
        {
          /*预算日记账编号*/
          title: this.$t({ id: 'budgetJournal.journalCode' }),
          key: 'journalCode',
          dataIndex: 'journalCode',
          width: '18%',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>),
        },
        {
          /*预算日记账类型*/
          title: this.$t({ id: 'budgetJournal.journalTypeId' }),
          key: 'journalTypeName',
          dataIndex: 'journalTypeName',
          width: '12%',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>),
        },
        {
          /*编制期段*/
          title: this.$t({ id: 'budgetJournal.periodStrategy' }),
          key: 'periodStrategyName',
          dataIndex: 'periodStrategyName',
        },
        {
          /*预算表*/
          title: this.$t({ id: 'budgetJournal.structureId' }), key: 'structureName', dataIndex: 'structureName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>),
        },
        {
          /*预算场景*/
          title: this.$t({ id: 'budgetJournal.scenarioId' }), key: 'scenario', dataIndex: 'scenario',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>),
        },
        {
          /*预算版本*/
          title: this.$t({ id: 'budgetJournal.versionId' }), key: 'versionName', dataIndex: 'versionName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>),
        },
        {
          /*申请人*/
          title: this.$t({ id: 'budgetJournal.employeeId' }), key: 'employeeName', dataIndex: 'employeeName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>),
        },
        {
          /*创建时间*/
          title: this.$t({ id: 'budgetJournal.submitDate' }), key: 'submitDate', dataIndex: 'submitDate',
          render: recode => (
            <Popover content={recode}>
              {String(recode).substring(0, 10)}
            </Popover>),
        },
        {
          /*状态*/
          title: this.$t({ id: 'budgetJournal.status' }), key: 'status', dataIndex: 'status',
          render(recode, text) {
            return text.statusName;
            /*  console.log(recode)
              switch (recode) {
                case 'NEW': { return <Badge status="processing" text={text.statusName} /> }
                case 'SUBMIT': { return <Badge status="default" text={text.statusName} /> }
                case 'SUBMIT_RETURN': { return <Badge status="default" text={text.statusName} /> }
                case 'REJECT': { return <Badge status="error" text={text.statusName} /> }
                case 'CHECKED': { return < Badge status="warning" text={text.statusName} /> }
                case 'CHECKING': { return <Badge status="warning" text={text.statusName} /> }
                case 'POSTED': { return <Badge status="success" text={text.statusName} /> }
                case 'BACKLASH_SUBMIT': { return <Badge status="default" text={text.statusName} /> }
                case 'BACKLASH_CHECKED': { return <Badge status="default" text={text.statusName} /> }
              }*/
          },
        },
      ],
      selectedEntityOIDs: [],    //已选择的列表项的OIDs
    };
  }

  componentWillMount() {
    this.getList();
  }


  //获取复核
  getList() {
    this.setState({ loading: true });
    let params = Object.assign({}, this.state.searchParams);
    params.organizationId = this.props.organization.id;
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    budgetJournalService.getBudgetJournalReCheckHeader(params).then((response) => {
      this.setState({
        loading: false,
        data: response.data,
        pagination: {
          total: Number(response.headers['x-total-count']) ? Number(response.headers['x-total-count']) : 0,
          onChange: this.onChangePager,
          current: this.state.page + 1,
        },
      }, () => {

      });
    });
  }

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true,
      }, () => {
        this.getList();
      });
  };

  //点击搜搜索
  handleSearch = (values) => {
    const valuesData = {
      ...this.state.params,
      ...values,
      //empId: va
      'createDate': values['createDate'] ? values['createDate'].format('YYYY-MM-DD') : '',
    };
    this.setState({
      searchParams: valuesData,
    }, () => {
      this.getList();
    });
  };

  //新建
  handleCreate = () => {
    this.props.dispatch(routerRedux.push({ pathname: `/budget/budget-journal/new-budget-journal` }));
  };

  //跳转到详情
  HandleRowClick = (value) => {

    const journalCode = value.id;

    this.props.dispatch(routerRedux.push({ pathname: `/budget/budget-journal-re-check/budget-journal-re-check-detail/${journalCode}`}));
    //budgetJournalDetailSubmit

  };

  render() {
    const { loading, searchForm, data, selectedRowKeys, pagination, columns, batchCompany } = this.state;
    const { organization } = this.props.organization;
    return (
      <div className="budget-journal">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div
            className="table-header-title">{this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}</div>
          {/*共搜索到*条数据*/}
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          size="middle"
          bordered
          onRow={record => ({
            onClick: () => this.HandleRowClick(record),
          })}
          rowKey={record => record.id}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    organization: state.user.organization
  };
}

export default connect(mapStateToProps, null, null, { withRef: true })((BudgetJournalReCheck));
