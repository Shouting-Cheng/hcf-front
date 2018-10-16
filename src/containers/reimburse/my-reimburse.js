import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Button,
  Table,
  Menu,
  Dropdown,
  Icon,
  Row,
  Col,
  Badge,
  Popconfirm,
  Popover,
  Input,
  message,
  Divider,
} from 'antd';
import config from 'config';
// import menuRoute from 'routes/menuRoute';
import httpFetch from 'share/httpFetch';
import moment from 'moment';

import 'styles/reimburse/reimburse.scss';
import SearchArea from './search-area';

import CustomTable from 'widget/custom-table';

const statusList = [
  { value: 1001, label: '编辑中' },
  { value: 1002, label: '审批中' },
  { value: 1003, label: '撤回' },
  { value: 1004, label: '审批通过' },
  { value: 1005, label: '审批驳回' },
  { value: 2002, label: '审核通过' },
  { value: 2001, label: '审核驳回' },
];

const Search = Input.Search;
class MyReimburse extends React.Component {
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
          type: 'select',
          id: 'formId',
          label: '单据类型',
          getUrl: `${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=105`,
          options: [],
          method: 'get',
          valueKey: 'formId',
          labelKey: 'formName',
          colSpan: 6,
        },
        {
          type: 'items',
          id: 'date',
          items: [
            { type: 'date', id: 'dateFrom', label: '申请日期从' },
            { type: 'date', id: 'dateTo', label: '申请日期至' },
          ],
          colSpan: 6,
        },
        {
          type: 'list',
          listType: 'select_authorization_user',
          options: [],
          id: 'applicationId',
          label: '申请人',
          labelKey: 'userName',
          valueKey: 'userId',
          single: true,
          colSpan: 6,
        },
        { type: 'select', id: 'status', label: '状态', options: statusList, colSpan: 6 },
        {
          type: 'select',
          key: 'currency',
          id: 'currencyCode',
          label: '币种',
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
          items: [
            { type: 'input', id: 'amountFrom', label: '金额从' },
            { type: 'input', id: 'amountTo', label: '金额至' },
          ],
        },
        {
          type: 'input',
          id: 'remark',
          colSpan: 12,
          label: '备注',
        },
      ],
      columns: [
        {
          /*单号*/
          title: this.$t('myReimburse.businessCode'),
          dataIndex: 'businessCode',
          width: 180,
          align: 'left',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*单据名称*/
          title: '单据类型',
          dataIndex: 'formName',
          width: 150,
          align: 'center',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*申请人*/
          title: this.$t('myReimburse.applicationName'),
          dataIndex: 'applicantName',
          width: 90,
          align: 'center',
        },
        {
          /*提交日期*/
          title: '申请日期',
          dataIndex: 'reportDate',
          width: 90,
          align: 'center',
          render: value => (
            <Popover content={value ? moment(value).format('YYYY-MM-DD') : ''}>
              {value ? moment(value).format('YYYY-MM-DD') : ''}
            </Popover>
          ),
        },
        {
          /*币种*/
          title: this.$t('myReimburse.currencyCode'),
          dataIndex: 'currencyCode',
          width: 80,
          align: 'center',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          /*金额*/
          title: this.$t('myReimburse.totalAmount'),
          dataIndex: 'totalAmount',
          width: 110,
          align: 'center',
          render: this.filterMoney,
        },
        {
          /*本币金额*/
          title: this.$t('myReimburse.functionalAmount'),
          dataIndex: 'functionalAmount',
          width: 110,
          align: 'center',
          render: this.filterMoney,
        },
        {
          /*事由*/
          title: this.$t('myReimburse.remark'),
          dataIndex: 'remark',
          align: 'center',
          render: recode => <Popover content={recode}>{recode}</Popover>,
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: 110,
          align: 'center',
          render: (value, record) => {
            return (
              <Badge
                status={this.state.status[value].state}
                text={this.state.status[value].label}
              />
            );
          },
        },
      ],
      data: [],
      menu: [],
      page: 0,
      pageSize: 10,
      loading: false,
      // newReimburePage: menuRoute.getRouteItem('new-reimburse', 'key'),
      // detailReimburePage: menuRoute.getRouteItem('reimburse-detail', 'key'),
      searchParams: {},
      total: 0,
    };
  }

  componentDidMount() {
    this.getList();
  }

  getForms = () => {
    const { checkboxListForm, menu } = this.state;

    httpFetch
      .get(`${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=105`)
      .then(res => {
        res.data.map(o => {
          menu.push({ key: o.formId, text: o.formName, formOID: o.formOID });
        });

        this.setState({ menu });
      })
      .catch(err => {
        message.error('网路错误！请稍后重试');
      });
  };

  //获取列表
  getList = () => {
    this.setState({ loading: true });

    let { searchParams, page, pageSize } = this.state;

    searchParams.dateFrom &&
      (searchParams.dateFrom = moment(searchParams.dateFrom).format('YYYY-MM-DD'));
    searchParams.dateTo && (searchParams.dateTo = moment(searchParams.dateTo).format('YYYY-MM-DD'));

    let params = { ...searchParams, allForm: false, page: page, size: pageSize };

    httpFetch
      .get(`${config.baseUrl}/api/expReportHeader/selectByInput`, params)
      .then(res => {
        this.setState({
          loading: false,
          data: res.data,
          total: res.data.length,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            current: page + 1,
            pageSize: pageSize,
            onChange: this.onChangePaper,
            showTotal: total => `共搜到 ${total} 条数据`,
          },
        });
      })
      .catch(err => {
        message.error('网路错误！请稍后重试');
      });
  };

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };

  search = e => {
    if (e.applicationId && e.applicationId.length) {
      e.applicationId = e.applicationId[0];
    }

    let params = { ...this.state.searchParams, ...e, allForm: false };

    params.dateFrom && (params.dateFrom = moment(params.dateFrom).format('YYYY-MM-DD'));
    params.dateTo && (params.dateTo = moment(params.dateTo).format('YYYY-MM-DD'));

    this.setState({ searchParams: params }, () => {
      this.refs.table.search(this.state.searchParams);
    });
  };

  searchNumber = e => {
    this.setState(
      { searchParams: { ...this.state.searchParams, businessCode: e, allForm: false } },
      () => {
        this.refs.table.search(this.state.searchParams);
      }
    );
  };
  componentWillMount() {
    this.getForms();
  }
  //跳转到新建页面
  newReimburseForm = value => {
    var formId = value.key;
    var formName = '';
    var formOID = '';
    for (var i of this.state.menu) {
      if (i.key === formId) {
        formName = i.text;
        formOID = i.formOID;
        break;
      }
    }
    //传递参数/:formOID/:formName
    // let path = this.state.newReimburePage.url.replace(/:\w+/g, function (a, b, c, d) {
    //   if (a === ":formId")
    //     return formId;
    //   if (a === ":formOID")
    //     return formOID;
    // })
    // this.context.router.push(path);
    this.props.dispatch(
      routerRedux.push({
        pathname: `/my-reimburse/new-reimburse/${formId}/${formOID}`,
      })
    );
  };

  //跳转到详情
  handleRowClick = recode => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/my-reimburse/reimburse-detail/${recode.expenseReportId}`,
      })
    );
  };

  render() {
    const { checkboxListForm, searchForm, pagination, loading, columns } = this.state;
    return (
      <div className="reimburse-container">
        <SearchArea searchForm={searchForm} submitHandle={this.search} maxLength={4} />
        <Row style={{ marginBottom: 10, marginTop: 10 }}>
          <Col span={18}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu onClick={this.newReimburseForm}>
                  {this.state.menu.map(function(value) {
                    return <Menu.Item key={value.key}>{value.text}</Menu.Item>;
                  })}
                </Menu>
              }
            >
              <Button type="primary">
                新建对公报账单<Icon type="down" />
              </Button>
            </Dropdown>
          </Col>
          <Col span={6}>
            <Search
              placeholder="请输入报账单单号"
              style={{ width: '100%' }}
              onSearch={this.searchNumber}
              enterButton
            />
          </Col>
        </Row>

        {/* <div style={{ marginBottom: 10 }}>
          <Dropdown trigger={['click']} overlay={<Menu onClick={this.newReimburseForm}>{this.state.menu.map(function (value) {
            return <Menu.Item key={value.key}>{value.text}</Menu.Item>
          })}</Menu>}>
            <Button type="primary">
              新建对公报账单<Icon type="down" />
            </Button>
          </Dropdown>
          <Search
            placeholder="请输入报账单单号"
            style={{ width: 240 }}
            onSearch={this.searchNumber}
            className="search-number"
            enterButton
          />
        </div> */}
        <CustomTable
          onClick={this.handleRowClick}
          ref="table"
          columns={columns}
          url={`${config.baseUrl}/api/expReportHeader/selectByInput`}
        />
      </div>
    );
  }
}
// MyReimburse.contextTypes = {
//   router: React.PropTypes.object
// }
function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(MyReimburse);
