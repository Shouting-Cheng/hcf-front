import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import { routerRedux } from 'dva/router';
import SearchArea from 'components/Widget/search-area';
import baseService from 'share/base.service';
import { Button, Table, Badge, Divider, message, Tabs, Input, Row, Col, Popover } from 'antd';
import expReportReverseCheckService from 'containers/financial-management/exp-report-reverse-check/exp-report-reverse-check.service';
import moment from 'moment';
const TabPane = Tabs.TabPane;
import CustomTable from 'components/Widget/custom-table';
const Search = Input.Search;
class ExpReportReverseCheck extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      tabVal: 'unChecked',
      reserveStatus: {
        6002: { label: '已取消', state: 'default' },
        6003: { label: '已完成', state: 'success' },
        1001: { label: '编辑中', state: 'processing' },
        6001: { label: '暂挂', state: 'warning' },
        1002: { label: '审核中', state: 'processing' },
        1005: { label: '已驳回', state: 'error' },
        1004: { label: '审核通过', state: 'success' },
        1003: { label: '已撤回', state: 'warning' },
      },
      searchForm1: [
        // { type: 'input', id: 'reportReverseNumber', label: this.$t({ id: 'expense.reverse.check.number' }/*费用反冲单编号*/), colSpan: "6" },
        {
          type: 'input',
          id: 'sourceDocumentCode',
          label: this.$t({ id: 'expense.reverse.check.source.number' } /*原单据编号*/),
          colSpan: '6',
        },
        {
          type: 'items',
          items: [
            {
              type: 'date',
              id: 'reverseDateFrom',
              label: this.$t({ id: 'expense.reverse.date.from' } /*反冲日期从*/),
            },
            {
              type: 'date',
              id: 'reverseDateTo',
              label: this.$t({ id: 'expense.reverse.date.to' } /*反冲日期至*/),
            },
          ],
          colSpan: '6',
        },
        {
          type: 'list',
          id: 'applyId',
          label: this.$t({ id: 'expense.reverse.apply.name' } /*申请人*/),
          listType: 'bgtUser',
          valueKey: 'id',
          labelKey: 'fullName',
          single: true,
          colSpan: '6',
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
        },
        {
          type: 'select',
          id: 'currencyCode',
          label: this.$t({ id: 'expense.reverse.currency.code' } /*币种*/),
          options: [],
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: 6,
        },
        // {
        //     type: 'list', listType: 'baseCurrency', id: 'currencyCode', label: this.$t({ id: 'expense.reverse.currency.code' }/*币种*/), options: [],
        //     labelKey: 'currencyCode', valueKey: 'currencyCode', colSpan: '6'
        // },
        {
          type: 'items',
          items: [
            {
              type: 'input',
              id: 'reverseAmountFrom',
              label: this.$t({ id: 'expense.reverse.amount.from' } /*反冲金额从*/),
            },
            {
              type: 'input',
              id: 'reverseAmountTo',
              label: this.$t({ id: 'expense.reverse.amount.to' } /*反冲金额至*/),
            },
          ],
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'description',
          label: this.$t({ id: 'expense.reverse.remark' }),
          colSpan: '6',
        },
        // {
        //     type: 'select', id: 'businessClass', label: '原报销类型', options: [{ value: 'PUBLIC_REPORT', label: '对公报账单' }, { value: 'USER_REPORT', label: '员工报销单' }],
        //     labelKey: 'label', valueKey: 'value', event: 'BUSINESSCLASS'
        // },
        // {
        //     type: 'select', id: 'sourceDocumentTypeId', label: '原单据类型',
        //     labelKey: 'formName', valueKey: 'formId',
        //     options: [],
        //     getUrl: ``,
        //     method: 'get'
        // },
        // { type: 'input', id: 'sourceDocumentCode', label: '原单据编号' },
        // {
        //     type: 'items',
        //     items:
        //         [
        //             { type: 'date', id: 'reverseDateFrom', label: '冲销日期从' },
        //             { type: 'date', id: 'reverseDateTo', label: '冲销日期至' }
        //         ]
        // },
        // {
        //     type: 'items',
        //     items:
        //         [
        //             { type: 'input', id: 'reverseAmountFrom', label: '冲销金额从' },
        //             { type: 'input', id: 'reverseAmountTo', label: '冲销金额至' }
        //         ]
        // },
        // { type: 'list', id: 'applyId', label: '申请人', listType: 'user', valueKey: 'id', labelKey: 'fullName', single: true }
      ],
      searchForm2: [
        // { type: 'input', id: 'reportReverseNumber', label: this.$t({ id: 'expense.reverse.check.number' }/*费用反冲单编号*/), colSpan: "6" },
        {
          type: 'input',
          id: 'sourceDocumentCode',
          label: this.$t({ id: 'expense.reverse.check.source.number' } /*原单据编号*/),
          colSpan: '6',
        },
        {
          type: 'items',
          items: [
            {
              type: 'date',
              event: 'DATA_FROM',
              id: 'reverseDateFrom',
              label: this.$t({ id: 'expense.reverse.date.from' } /*反冲日期从*/),
            },
            {
              type: 'date',
              id: 'reverseDateTo',
              label: this.$t({ id: 'expense.reverse.date.to' } /*反冲日期至*/),
            },
          ],
          colSpan: '6',
        },
        {
          type: 'list',
          id: 'applyId',
          label: this.$t({ id: 'expense.reverse.apply.name' } /*申请人*/),
          listType: 'bgtUser',
          valueKey: 'id',
          labelKey: 'fullName',
          single: true,
          colSpan: '6',
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
        },
        {
          type: 'select',
          id: 'currencyCode',
          label: this.$t({ id: 'expense.reverse.currency.code' } /*币种*/),
          options: [],
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: 6,
        },
        {
          type: 'items',
          items: [
            {
              type: 'input',
              id: 'reverseAmountFrom',
              label: this.$t({ id: 'expense.reverse.amount.from' } /*反冲金额从*/),
            },
            {
              type: 'input',
              id: 'reverseAmountTo',
              label: this.$t({ id: 'expense.reverse.amount.to' } /*反冲金额至*/),
            },
          ],
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'description',
          label: this.$t({ id: 'expense.reverse.remark' }),
          colSpan: '6',
        },
      ],
      columns: [
        {
          title: this.$t({ id: 'expense.reverse.check.number' } /*费用反冲单编号*/),
          dataIndex: 'reportReverseNumber',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'expense.reverse.check.source.number' } /*原单据编号*/),
          dataIndex: 'sourceReportHeaderCode',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'expense.reverse.apply.name' } /*申请人*/),
          dataIndex: 'employeeName',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'expense.reverse.reverse.date' } /*反冲日期*/),
          dataIndex: 'reverseDate',
          render: recode => {
            return (
              <span>
                <Popover content={moment(recode).format('YYYY-MM-DD')}>
                  {recode ? moment(recode).format('YYYY-MM-DD') : '-'}
                </Popover>
              </span>
            );
          },
        },
        {
          title: this.$t({ id: 'expense.reverse.currency.code' } /*币种*/),
          dataIndex: 'currencyCode',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'expense.reverse.amount' } /*反冲金额*/),
          dataIndex: 'amount',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={this.filterMoney(recode, 2)}>{this.filterMoney(recode, 2)}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'expense.reverse.remark' } /*备注*/),
          dataIndex: 'description',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'expense.reverse.status' } /*状态*/),
          dataIndex: 'status',
          render: value => {
            return (
              <Badge
                status={this.state.reserveStatus[value].state}
                text={this.state.reserveStatus[value].label}
              />
            );
          },
        },
      ],
      loading: true,
      checkedLoading: true,
      searchParam: {},
      checkedParam: {},
      page: 0,
      checkedPage: 0,
      pageSize: 10,
      checkedPageSize: 10,
      checkedPagination: {
        total: 0,
      },
      data: [],
      pagination: {
        total: 0,
      },
      checkedData: [],
      // expReportReverseCheckDetail: menuRoute.getRouteItem('exp-report-reverse-check-detail', 'key'),
      // expReportReverseCheck: menuRoute.getRouteItem('exp-report-reverse-check', 'key'),
      expReportReverseCheckDetail: `/financial-management/exp-report-reverse-check/exp-report-reverse-check-detail/`,
      expReportReverseCheck: `/financial-management/exp-report-reverse-check`,
      unCheckTotal: 0,
      checkedTotal: 0,
    };
  }
  /**
   * 生命周期函数，构造之后渲染之前
   */
  componentWillMount() {
    const tab = this.props.match.params.tab;
    this.setState({
      tabVal: tab === undefined || tab === 'unChecked' ? 'unChecked' : 'checked',
    });
  }
  componentDidMount() {
    expReportReverseCheckService.getList().then(res => {
      this.setState({
        unCheckTotal: Number(res.headers['x-total-count']) || 0,
      });
    });
    expReportReverseCheckService.getCheckedList().then(res => {
      this.setState({
        checkedTotal: Number(res.headers['x-total-count']) || 0,
      });
    });
  }
  /**
   * 未审核搜索按钮
   */
  search = param => {
    param.reverseDateFrom = param.reverseDateFrom
      ? param.reverseDateFrom.format('YYYY-MM-DD')
      : undefined;
    param.reverseDateTo = param.reverseDateTo
      ? param.reverseDateTo.format('YYYY-MM-DD')
      : undefined;
    this.setState(
      {
        loading: true,
        page: 0,
        searchParam: param,
        unCheckTotal: this.refs.table.state.pagination.total,
      },
      () => {
        this.refs.table.search(this.state.searchParam);
      }
    );
  };
  /**
   * 清空按钮
   */
  clear = () => {
    this.setState(
      {
        loading: true,
        page: 0,
        searchParam: {},
      },
      () => {
        this.refs.table.search(this.state.searchParam);
      }
    );
  };

  clear2 = () => {
    this.setState(
      {
        loading: true,
        page: 0,
        checkedParam: {},
      },
      () => {
        this.refs.checkedTable.search(this.state.checkedParam);
      }
    );
  };
  /**
   * Table行点击事件
   */
  onRowClick = record => {
    //this.context.router.push(this.state.expReportReverseCheckDetail.url.replace(':id', record.id).replace(':tab',this.state.tabVal));
    this.props.dispatch(
      routerRedux.replace({
        pathname: this.state.expReportReverseCheckDetail + `${record.id}/${this.state.tabVal}`,
      })
    );
  };
  /**
   * search-area事件处理
   */
  searchEventHandle = (event, value) => {
    let { searchForm } = this.state;
    if (event === 'DATA_FROM') {
      let checkedParam = this.state.checkedParam;
      checkedParam.reverseDateFrom = value && value.format('YYYY-MM-DD');
      this.setState({ checkedParam });
    } else if (event === 'BUSINESSCLASS') {
      if (value === 'PUBLIC_REPORT') {
        searchForm[2].options = [];
        searchForm[2].getUrl = `${
          config.baseUrl
        }/api/custom/forms/company/my/available/all/?formType=105`;
      } else if (value === 'USER_REPORT') {
        searchForm[2].getUrl = ``;
        searchForm[2].options = [];
      } else if (value === null) {
        searchForm[2].getUrl = ``;
        searchForm[2].options = [];
      }
      this.formRef._reactInternalInstance._renderedComponent._instance.setValues({
        sourceDocumentTypeId: { label: '', value: '************' },
      });
      this.setState({
        searchForm,
      });
    }
  };
  /********************************************* */
  /**
   * 已审核搜索按钮
   */
  checkedSearch = param => {
    param.reverseDateFrom = param.reverseDateFrom
      ? param.reverseDateFrom.format('YYYY-MM-DD')
      : undefined;
    param.reverseDateTo = param.reverseDateTo
      ? param.reverseDateTo.format('YYYY-MM-DD')
      : undefined;
    param.applyId = param.applyId && param.applyId.length && param.applyId[0];
    let checkedParam = {
      ...this.state.checkedParam,
      ...param,
    };
    this.setState(
      {
        checkedParam,
        checkedLoading: true,
        checkedPage: 0,
        checkedTotal: this.refs.checkedTable.state.pagination.total,
      },
      () => {
        this.refs.checkedTable.search(this.state.checkedParam);
      }
    );
  };
  //tab切换
  onChangeTab = key => {
    this.setState({ tabVal: key }, () => {
      //this.context.router.replace(`${this.state.expReportReverseCheck.url}?tab=${this.state.tabVal}`);
      this.props.dispatch(
        routerRedux.push({
          pathname: `${this.state.expReportReverseCheck}?tab=${this.state.tabVal}`,
        })
      );
    });
  };
  //按费用反冲单查询
  onDocumentSearch = value => {
    const tab = this.state.tabVal;
    if (tab === 'unChecked' || tab === undefined) {
      this.setState(
        { searchParam: { ...this.state.searchParam, reportReverseNumber: value } },
        () => {
          this.refs.table.search(this.state.searchParam);
        }
      );
    } else if (tab === 'checked' || tab === undefined) {
      this.setState(
        { checkedParam: { ...this.state.checkedParam, reportReverseNumber: value } },
        () => {
          this.refs.checkedTable.search(this.state.checkedParam);
        }
      );
    }
  };
  onLoadData = (data, pagination) => {
    this.setState({
      unCheckTotal: pagination.total,
    });
  };
  onCheckedLoadData = (data, pagination) => {
    this.setState({
      checkedTotal: pagination.total,
    });
  };
  /**
   * 渲染函数
   */
  render() {
    const {
      searchForm1,
      searchForm2,
      columns,
      loading,
      checkedLoading,
      data,
      pagination,
      checkedPagination,
      unCheckTabData,
      checkedData,
      tabVal,
      unCheckTotal,
      checkedTotal,
    } = this.state;
    return (
      <div>
        <Tabs defaultActiveKey={tabVal} onChange={this.onChangeTab}>
          <TabPane
            tab={this.$t({ id: 'expense.reverse.check.unChecked' }, { total: unCheckTotal })}
            key="unChecked"
          >
            {tabVal === 'unChecked' && (
              <div>
                <SearchArea
                  searchForm={searchForm1}
                  eventHandle={this.searchEventHandle}
                  submitHandle={this.search}
                  clearHandle={this.clear}
                  wrappedComponentRef={inst => (this.formRef = inst)}
                  maxLength={4}
                />
                <div className="divider" />
                <Row style={{ marginBottom: '20px' }}>
                  <Col span={18} />
                  <Col span={6} style={{ float: 'right' }}>
                    <Search
                      placeholder="请输入费用反冲单编号"
                      onSearch={this.onDocumentSearch}
                      enterButton
                    />
                  </Col>
                </Row>
                {/* <div className='table-header'>
                            <div className='table-header-title'>
                                {this.$t({ id: 'common.total' }, { total: Number(pagination.total) == 0 ? '0' : Number(pagination.total) })}
                            </div>
                        </div> */}
                <CustomTable
                  ref="table"
                  columns={columns}
                  url={`${config.baseUrl}/api/report/reverse/get/reverse/by/own?reverseStatus=1002`}
                  style={{ marginTop: '20px' }}
                  onClick={this.onRowClick}
                  onLoadData={this.onLoadData}
                />
              </div>
            )}
          </TabPane>
          <TabPane
            tab={this.$t({ id: 'expense.reverse.check.checked' }, { total: checkedTotal })}
            key="checked"
          >
            {tabVal === 'checked' && (
              <div>
                <SearchArea
                  searchForm={searchForm2}
                  eventHandle={this.searchEventHandle}
                  submitHandle={this.checkedSearch}
                  //wrappedComponentRef={(inst) => this.formRef2 = inst}
                  clearHandle={this.clear2}
                  maxLength={4}
                />
                {/* <div className='table-header'>
                            <div className='table-header-title'>
                                {this.$t({ id: 'common.total' }, { total: Number(checkedPagination.total) == 0 ? '0' : Number(checkedPagination.total) })}
                            </div>
                        </div> */}
                <div className="divider" />
                <Row style={{ marginBottom: '20px' }}>
                  <Col span={18} />
                  <Col span={6} style={{ float: 'right' }}>
                    <Search
                      placeholder="请输入费用反冲单编号"
                      onSearch={this.onDocumentSearch}
                      enterButton
                    />
                  </Col>
                </Row>
                <CustomTable
                  ref="checkedTable"
                  columns={columns}
                  url={`${config.baseUrl}/api/report/reverse/get/reverse/by/own?reverseStatus=1004`}
                  onClick={this.onRowClick}
                  onLoadData={this.onCheckedLoadData}
                />
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

/**。
 * redux
 */
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
)(ExpReportReverseCheck);
