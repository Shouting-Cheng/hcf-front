import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Menu, Dropdown, Icon, Row, Col, Input, message, Badge } from 'antd';
import config from 'config';
import moment from 'moment';

import SearchArea from 'widget/search-area';
import CustomTable from 'widget/custom-table';

import service from "./service"

const Search = Input.Search;

const statusList = [
  { value: 1001, label: '编辑中' },
  { value: 1002, label: '审批中' },
  { value: 1003, label: '撤回' },
  { value: 1004, label: '审批通过' },
  { value: 1005, label: '审批驳回' }
];

class ExpenseApplicationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pagination: {
        total: 0,
      },
      status: {
        1001: { label: '编辑中', state: 'default' },
        1004: { label: '审批通过', state: 'success' },
        1002: { label: '审批中', state: 'processing' },
        1005: { label: '审批驳回', state: 'error' },
        1003: { label: '撤回', state: 'warning' },
        0: { label: '未知', state: 'warning' },
        2004: { label: '支付成功', state: 'success' },
        2003: { label: '支付中', state: 'processing' },
        2002: { label: '审核通过', state: 'success' },
        2001: { label: '审核驳回', state: 'error' },
      },
      searchForm: [
        {
          type: 'select', id: 'typeId', label: '单据类型', options: [], colSpan: 6,
        }, {
          type: 'items', id: 'date', items: [
            { type: 'date', id: 'dateFrom', label: '申请日期从' },
            { type: 'date', id: 'dateTo', label: '申请日期至' },
          ],
          colSpan: 6,
        }, {
          type: 'list', listType: 'select_authorization_user', options: [], id: 'employeeId',
          label: '申请人',
          labelKey: 'userName',
          valueKey: 'userId',
          single: true,
          colSpan: 6,
          defaultValue: [{ userName: props.user.fullName, userId: props.user.id }],
          disabled: true
        },
        { type: 'select', id: 'status', label: '状态', options: statusList, colSpan: 6 },
        {
          type: 'select',
          key: 'currency',
          id: 'currencyCode',
          label: '币种',
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAllCurrency`,
          getParams: { setOfBooksId: this.props.company.setOfBooksId },
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
            { type: 'input', id: 'amountFrom', label: '金额从' },
            { type: 'input', id: 'amountTo', label: '金额至' },
          ],
        },
        {
          type: 'input',
          id: 'remarks',
          colSpan: 12,
          label: '备注',
        },
      ],
      columns: [{
        title: "单号",
        dataIndex: "documentNumber",
        align: "center",
        width: 150,
        tooltips: true
      }, {
        title: "单据类型",
        dataIndex: "typeName",
        align: "center",
        width: 150,
        tooltips: true
      }, {
        title: "申请人",
        dataIndex: "employeeName",
        align: "center",
        width: 100,
      }, {
        title: "申请日期",
        dataIndex: "requisitionDate",
        align: "center",
        width: 120,
        render: value => moment(value).format("YYYY-MM-DD")
      }, {
        title: "币种",
        dataIndex: "currencyCode",
        align: "center",
        width: 90,
      }, {
        title: "金额",
        dataIndex: "amount",
        align: "center",
        width: 150,
        render: value => this.formatMoney(value)
      }, {
        title: "本币金额",
        dataIndex: "functionalAmount",
        align: "center",
        width: 150,
        render: value => this.formatMoney(value)
      }, {
        title: "备注",
        dataIndex: "remarks",
        align: "center",
        tooltips: true
      }, {
        title: "状态",
        dataIndex: "status",
        align: "center",
        width: 110,
        render: value => <Badge
          status={this.state.status[value].state}
          text={this.state.status[value].label}
        />
      }],
      searchParams: {},
      menus: []
    };
  }

  componentDidMount() {
    this.getApplicationTypeList();
  }

  //获取申请单类型
  getApplicationTypeList = () => {
    let searchForm = this.state.searchForm;
    service.getApplicationTypeList({ setOfBooksId: this.props.company.setOfBooksId, enabled: true }).then(res => {
      searchForm[0].options = res.data.map(o => ({ value: o.id, label: o.typeName }));
      this.setState({ menus: res.data, searchForm });
    }).catch(err => {
      message.error(err.reponse.data.message);
    })
  };

  //获取列表
  getList = () => {
    let { searchParams } = this.state;

    searchParams.dateFrom && (searchParams.dateFrom = moment(searchParams.dateFrom).format('YYYY-MM-DD'));
    searchParams.dateTo && (searchParams.dateTo = moment(searchParams.dateTo).format('YYYY-MM-DD'));

    this.table.search(searchParams);
  };

  //搜索
  search = values => {
    this.setState({ searchParams: { ...this.state.searchParams, ...values } }, () => {
      this.getList();
    })
  };

  //单号搜索
  searchNumber = value => {
    this.setState({ searchParams: { ...this.state.searchParams, documentNumber: value } }, () => {
      this.getList();
    })
  };

  //清除
  clear = () => {
    this.setState({ searchParams: { documentNumber: this.state.searchParams.documentNumber } }, () => {
      this.getList();
    })
  }

  //跳转到新建页面
  newReimburseForm = value => {
    this.props.dispatch(routerRedux.push({
      pathname: '/expense-application/new-expense-application/' + value.key
    }));
  };

  //跳转到详情
  handleRowClick = recode => {
    this.props.dispatch(routerRedux.push({
      pathname: '/expense-application/expense-application-detail/' + recode.id
    }));
  };

  render() {
    const { searchForm, columns, menus } = this.state;

    const menusUi = (
      <Menu onClick={this.newReimburseForm}>
        {menus.map(item => {
          return <Menu.Item key={item.id}>{item.typeName}</Menu.Item>;
        })}
      </Menu>
    );

    return (
      <div className="reimburse-container">
        <SearchArea searchForm={searchForm} submitHandle={this.search} maxLength={4} clearHandle={this.clear} />
        <Row style={{ marginBottom: 10, marginTop: 10 }}>
          <Col id="application-form-drop" style={{ position: 'relative' }} span={18}>
            <Dropdown
              getPopupContainer={() => document.getElementById('application-form-drop')}
              trigger={['click']}
              overlay={menusUi}
            >
              <Button type="primary">
                新建费用申请单<Icon type="down" />
              </Button>
            </Dropdown>
          </Col>
          <Col span={6}>
            <Search
              placeholder="请输入申请单单号"
              style={{ width: '100%' }}
              onSearch={this.searchNumber}
              enterButton
            />
          </Col>
        </Row>
        <CustomTable
          onClick={this.handleRowClick}
          ref={ref => this.table = ref}
          columns={columns}
          url={`${config.expenseUrl}/api/expense/application/header/query/condition`}
          params={{ employeeId: this.props.user.id }}
          onRowClick={this.handleRowClick}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser
  };
}

export default connect(
  mapStateToProps
)(ExpenseApplicationForm);
