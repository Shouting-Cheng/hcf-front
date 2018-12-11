/**
 * Created by 13576 on 2017/12/4.
 */
import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Table,
  message,
  Badge,
  Popover,
  Dropdown,
  Menu,
  Row,
  Col,
  Icon,
  Input,
  InputNumber
} from 'antd';
import config from 'config';
import ListSelector from 'widget/list-selector';
import { routerRedux } from 'dva/router';
import debounce from 'lodash.debounce';
import CustomTable from 'widget/custom-table';
import moment from 'moment';
import SearchArea from 'widget/search-area';

import expenseAdjustService from 'containers/expense-adjust/expense-adjust/expense-adjust.service';

const Search = Input.Search;

class ExpenseAdjust extends React.Component {
  constructor(props) {
    super(props);
    const statusList = [
      { value: 1001, label: this.$t('common.editing') },
      { value: 1002, label: this.$t('common.approving') },
      { value: 1003, label: this.$t('common.withdraw') },
      { value: 1004, label: this.$t('common.approve.pass') },
      { value: 1005, label: this.$t('common.approve.rejected') },
    ];
    const status = {
      1001: { label: this.$t('common.editing'), state: 'default' },
      1004: { label: this.$t('common.approve.pass'), state: 'success' },
      1002: { label: this.$t('common.approving'), state: 'processing' },
      1005: { label: this.$t('common.approve.rejected'), state: 'error' },
      1003: { label: this.$t('common.withdraw'), state: 'warning' },
    };
    this.state = {
      loading: false,
      visible: false,
      setOfBooksId: null,
      expenseType: [],

      searchForm: [
        {
          type: 'select',
          options: [],
          id: 'expAdjustTypeId',
          label: this.$t('epx.adjust.receipt.type'),
          labelKey: 'expAdjustTypeName',
          colSpan: 6,
          valueKey: 'id',
          getUrl: `${config.expenseUrl}/api/expense/adjust/types/document/query`,
          method: 'get',
          getParams: { setOfBooksId: this.props.company.setOfBooksId},
        },
        {
          type: 'items',
          id: 'dateRange',
          colSpan: 6,
          items: [
            //申请日期从
            { type: 'date', id: 'dateTimeFrom', label: this.$t('epx.adjust.apply.dateFrom') },
            { type: 'date', id: 'dateTimeTo', label: this.$t('exp.adjust.apply.dateTo') },
          ], //申请日期至
        },
        {
          type: 'list',
          listType: 'select_authorization_user',
          options: [],
          id: 'employeeId',
          label: this.$t('exp.adjust.applier'),
          labelKey: 'userName',
          valueKey: 'userId',
          single: true,
          colSpan: 6,
        },
        {
          type: 'select',
          id: 'status',
          label: this.$t('common.column.status'),
          options: statusList,
          colSpan: 6,
        },
        {
          type: 'select',
          id: 'adjustTypeCategory',
          label: this.$t('exp.adjust.type'),
          colSpan: 6,
          options: [
            { label: this.$t('exp.adjust.exp.detail'), value: '1001' },
            { label: this.$t('exp.adjust.exp.add'), value: '1002' },
          ],
        },
        {
          type: 'select',
          key: 'currency',
          id: 'currencyCode',
          label: this.$t('common.currency'),
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          options: [],
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: 6,
        },
        {
          type: 'items',
          id: 'amount',
          colSpan: 6,
          items: [
            //金额从
            { type: 'inputNumber', min: true, id: 'amountMin', label: this.$t('exp.money.from') },
            { type: 'inputNumber', min: true, id: 'amountMax', label: this.$t('exp.money.to') },
          ], //金额至
        },
        {
          type: 'input',
          id: 'description',
          label: this.$t('common.remark'),
          colSpan: 6,
        },
      ],
      columns: [
        {
          //单据编号
          title: this.$t('common.document.code'),
          dataIndex: 'documentNumber',
          width: 150,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          //单据类型
          title: this.$t('exp.receipt.type'),
          dataIndex: 'typeName',
          align: 'center',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('exp.adjust.type'),
          dataIndex: 'adjustTypeCategory',
          align: 'center',
          width: 100,
          render: desc => (
            <span>
              <Popover
                content={
                  desc === '1001' ? this.$t('exp.adjust.exp.detail') : this.$t('exp.adjust.exp.add')
                }
              >
                {desc === '1001' ? this.$t('exp.adjust.exp.detail') : this.$t('exp.adjust.exp.add')}
              </Popover>
            </span>
          ),
        },
        {
          title: this.$t('exp.adjust.applier'),
          dataIndex: 'employeeName',
          width: 90,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          //申请日期
          title: this.$t('exp.adjust.apply.date'),
          dataIndex: 'adjustDate',
          width: 100,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={moment(desc).format('YYYY-MM-DD')}>
                {desc ? moment(desc).format('YYYY-MM-DD') : '-'}
              </Popover>
            </span>
          ),
        },
        {
          //币种
          title: this.$t('common.currency'),
          dataIndex: 'currencyCode',
          align: 'center',
          width: 80,
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('common.amount'),
          dataIndex: 'totalAmount',
          width: 110,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('request.base.amount'),
          dataIndex: 'functionalAmount',
          width: 110,
          align: 'center',
          render: desc => (
            <span>
              <Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('common.comment'),
          dataIndex: 'description',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('common.column.status'),
          dataIndex: 'status',
          align: 'center',
          width: 100,
          render: (value, record) => {
            return <Badge status={status[value].state} text={status[value].label} />;
          },
        },
      ],
      data: [],
      pagination: {
        current: 0,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      searchParams: {},
    };
    this.searchNumber = debounce(this.searchNumber, 500);
  }

  componentDidMount() {
    //this.getList();
    //this.refs.abc.search();
    this.getExpenseType();
  }

  getExpenseType = () => {
    let params = {
      userId: this.props.user.id,
      setOfBooksId: this.props.company.setOfBooksId,
      enabled: true,
    };
    expenseAdjustService.getExpenseTypes(params).then(response => {
      this.setState({ expenseType: response.data });
    });
  };

  searchNumber = e => {
    this.setState(
      {
        searchParams: { ...this.state.searchParams, documentNumber: e },
      },
      () => {
        this.customTable.search({ ...this.state.searchParams, documentNumber: e });
      }
    );
  };

  handleListOk = value => {
    const result = value.result;
    let formOid = 0;
    if (result[0].formOid) {
      formOid = result[0].formOid;
    }

    this.showListSelector(false);
  };

  showListSelector = value => {
    this.setState({
      visible: value,
    });
  };

  //搜索
  search = values => {
    values.dateTimeFrom && (values.dateTimeFrom = moment(values.dateTimeFrom).format('YYYY-MM-DD'));
    values.dateTimeTo && (values.dateTimeTo = moment(values.dateTimeTo).format('YYYY-MM-DD'));
    if (values.employeeId && values.employeeId[0]){
      values.employeeId = values.employeeId[0]
    }
    this.setState({ ...this.state.searchParams, ...values }, () => {
      this.customTable.search({ ...this.state.searchParams, ...values });
    });
  };

  //新建
  handleCreate = e => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/expense-adjust/my-expense-adjust/new-expense-adjust/:id/:expenseAdjustTypeId'
          .replace(':expenseAdjustTypeId', e.key)
          .replace(':id','new')
      })
    );
  };

  rowClick = record => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/expense-adjust/my-expense-adjust/expense-adjust-detail/:id/:expenseAdjustTypeId/:type'
          .replace(':expenseAdjustTypeId', record.expAdjustTypeId)
          .replace(':id', record.id)
          .replace(':type', record.adjustTypeCategory),
      })
    );
  };
  // 清除
  clearFunction = () => {
    this.setState({ searchParams: {} });
  };

  render() {
    const { visible, loading, searchForm, columns, data, pagination, expenseType } = this.state;
    return (
      <div className="pre-payment-container">
        <SearchArea
          searchForm={searchForm}
          maxLength={4}
          clearHandle={this.clearFunction}
          submitHandle={this.search}
        />
        <div className="divider" />
        <div className="table-header">
          <div className="table-header-buttons">
            <Row>
              <Col id="expense-adjust-drop" style={{position : "relative"}} span={18}>
                <Dropdown getPopupContainer={ () => document.getElementById('expense-adjust-drop')}
                  trigger={['click']}
                  overlay={
                    <Menu onClick={this.handleCreate}>
                      {expenseType.map(item => (
                        <Menu.Item key={item.id}>{item.name}</Menu.Item>
                      ))}
                    </Menu>
                  }
                >
                  <Button type="primary">
                    {this.$t('menu.new-expense-adjust')}
                    <Icon type="down" />
                  </Button>
                </Dropdown>
              </Col>
              <Col span={6}>
                <Search
                  placeholder={this.$t('exp.input.number.tips')}
                  onSearch={this.searchNumber}
                  className="search-number"
                  enterButton
                />
              </Col>
            </Row>
          </div>
        </div>
        <CustomTable
          ref={ref => (this.customTable = ref)}
          columns={columns}
          url={`${config.expenseUrl}/api/expense/adjust/headers/query/dto`}
          onClick={this.rowClick}
        />
        <ListSelector
          type="expense-adjust-type"
          visible={visible}
          single={true}
          onOk={this.handleListOk}
          extraParams={{
            setOfBooksId: this.props.company.setOfBooksId,
            userId: this.props.user.id,
            enabled: true,
          }}
          onCancel={() => this.showListSelector(false)}
        />
      </div>
    );
  }
}

const wrappedExpenseAdjust = Form.create()(ExpenseAdjust);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    languages: state.languages,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedExpenseAdjust);
