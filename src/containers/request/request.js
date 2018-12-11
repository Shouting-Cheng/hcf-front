import React from 'react';
import { connect } from 'dva';
import constants from 'share/constants';
import { dealCache } from 'utils/extend';
import {
  Form,
  Table,
  Button,
  Badge,
  Input,
  Popover,
  Dropdown,
  Icon,
  Menu,
  message,
  Modal,
  Select,
} from 'antd';
import SearchArea from 'widget/search-area';
const Search = Input.Search;
const FormItem = Form.Item;
const Option = Select.Option;
import { routerRedux } from 'dva/router';

import requestService from 'containers/request/request.service';
import debounce from 'lodash.debounce';
import moment from 'moment';
import 'styles/request/request.scss';

class ApplicationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestTypes: [], //申请单类型
      checkboxListForm: [
        {
          id: 'status',
          single: true,
          items: [
            {
              label: this.$t('request.status' /*状态*/),
              key: 'statusWithReject',
              checked: ['10011002100310041005100610071008'],
              options: [
                {
                  label: this.$t('request.all' /*全部*/),
                  value: '10011002100310041005100610071008',
                },
                {
                  label: this.$t('constants.documentStatus.editing' /*编辑中*/),
                  value: '10011000',
                  state: 'processing',
                },
                {
                  label: this.$t('constants.documentStatus.has.withdrawn' /*已撤回*/),
                  value: '10011001',
                  state: 'warning',
                },
                {
                  label: this.$t('constants.documentStatus.has.been.rejected' /*已驳回*/),
                  value: '10011002',
                  state: 'error',
                },
                {
                  label: this.$t('constants.documentStatus.audit.rejected' /*审核驳回*/),
                  value: '10011003',
                  state: 'error',
                },
                {
                  label: this.$t('constants.documentStatus.auditing' /*审批中*/),
                  value: '10021000',
                  state: 'processing',
                },
                {
                  label: this.$t('constants.documentStatus.yet.pass' /*已通过*/),
                  value: '10031000',
                  state: 'success',
                },
                {
                  label: this.$t('constants.documentStatus.audit.pass' /*审核通过*/),
                  value: '1004',
                  state: 'success',
                },
                {
                  label: this.$t('constants.documentStatus.yet.pay' /*已付款*/),
                  value: '1005',
                  state: 'success',
                },
                {
                  label: this.$t('constants.documentStatus.repaying' /*还款中*/),
                  value: '1006',
                  state: 'processing',
                },
                {
                  label: this.$t('constants.documentStatus.yet.repayment' /*已还款*/),
                  value: '1007',
                  state: 'success',
                },
                {
                  label: this.$t('constants.documentStatus.paying' /*付款中*/),
                  value: '1008',
                  state: 'processing',
                },
                {
                  label: this.$t('constants.documentStatus.yet.disable' /*已停用*/),
                  value: '1009',
                  state: 'default',
                },
              ],
            },
          ],
        },
        {
          id: 'formOID',
          single: true,
          items: [
            {
              label: this.$t('request.bill.name' /*单据名称*/),
              key: 'formOID',
              options: [{ label: this.$t('request.all' /*全部*/), value: 'all' }],
              checked: ['all'],
            },
          ],
        },
      ],
      searchForm: [
        {
          type: 'items',
          id: 'dateRange',
          items: [
            {
              type: 'date',
              id: 'startDate',
              label: this.$t('request.start.date' /*起始日期*/),
              event: 'startDate',
            },
            {
              type: 'date',
              id: 'endDate',
              label: this.$t('request.end.date' /*结束日期*/),
              event: 'endDate',
            },
          ],
        },
        {
          type: 'input',
          label: this.$t('request.applicant' /*申请人*/),
          id: 'keyword',
          event: 'keyword',
        },
      ],
      searchParams: { status: '10011002100310041005100610071008' },
      columns: [
        {
          title: this.$t('common.sequence'),
          dataIndex: 'index',
          align: 'center',
          render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page,
          width: '6%',
        },
        {
          title: this.$t('request.create.date' /*创建日期*/),
          align: 'center',
          dataIndex: 'createdDate',
          width: '90',
          render: (value, record) => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: this.$t('request.applicant' /*申请人*/),
          dataIndex: 'applicantName',
          width: '100',
        },
        {
          title: this.$t('request.bill.name' /*单据名称*/),
          dataIndex: 'formName',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
        {
          title: this.$t('request.reason' /*事由*/),
          dataIndex: 'title',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
        { title: this.$t('request.bill.number' /*单号*/), dataIndex: 'businessCode', width: '180' },
        {
          title: this.$t('request.currency' /*币种*/),
          dataIndex: 'originCurrencyCode',
          align: 'center',
          width: '60',
        },
        {
          title: this.$t('request.amount' /*金额*/),
          dataIndex: 'originCurrencyTotalAmount',
          render: this.filterMoney,
        },
        {
          title: this.$t('request.base.amount' /*本币金额*/),
          dataIndex: 'totalAmount',
          render: value =>
            value ? this.filterMoney(value) : <span className="money-cell">-</span>,
        },
        {
          title: this.$t('common.column.status'),
          dataIndex: 'status',
          width: this.props.local === 'zh_cn' ? '80' : '90',
          render: (value, record) => {
            let applicationType = 2005; //申请单
            let text;
            let status;
            if (
              record.closed ||
              (record.applicationParticipant && record.applicationParticipant.closed === 1)
            ) {
              text = this.$t('constants.documentStatus.yet.disable' /*已停用*/);
              status = 'default';
            } else {
              text =
                constants.getTextByValue(String(value + '' + applicationType), 'documentStatus') ||
                constants.getTextByValue(
                  String(value + '' + record.rejectType),
                  'documentStatus'
                ) ||
                constants.getTextByValue(String(value), 'documentStatus');
              status =
                constants.getTextByValue(
                  String(value + '' + applicationType),
                  'documentStatus',
                  'state'
                ) ||
                constants.getTextByValue(
                  String(value + '' + record.rejectType),
                  'documentStatus',
                  'state'
                ) ||
                constants.getTextByValue(String(value), 'documentStatus', 'state');
            }
            return <Badge text={text} status={status} />;
          },
        },
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      cacheSearchData: {}, //缓存筛选的数据
      proxyVisible: false, //代提申请单modal
      applicantList: [], //代理的申请人列表
      proxyApplicantOID: null,
      proxyFormList: [], //代理的表单列表
      proxyFormOID: null,
      isShowProxy: false, //是否有代理关系
    };
    this.handleSearch = debounce(this.handleSearch, 250);
  }

  componentWillMount() {
    this.setShowProxy();
  }

  componentDidMount() {
    this.getForms();
  }

  //处理是否展示代提
  setShowProxy = () => {
    requestService.isShowProxy(101).then(res => {
      if (res.data) {
        this.getApplicantList();
        this.setState({
          isShowProxy: true,
        });
      }
    });
  };

  //获取我的制单的被代理人
  getApplicantList = () => {
    requestService.getProxyApplicantList(101).then(res => {
      if (res.data && res.data.length) {
        this.setState({
          applicantList: res.data,
        });
      }
    });
  };

  //存储筛选数据缓存
  setCache = result => {
    const { page } = this.state;
    result.page = page;
    this.setState({ cacheSearchData: result });
  };

  //获取筛选数据缓存
  getCache = () => {
    let result = this.props.request;
    let { checkboxListForm } = this.state;
    if (result && JSON.stringify(result) !== '{}') {
      checkboxListForm.map((item, index) => {
        checkboxListForm[index].items[0].checked = [result[item.id]] || [];
      });
      this.setState({ cacheSearchData: result, checkboxListForm }, () => {
        this.dealCache(result);
      });
    } else {
      this.getList();
    }
  };

  //处理筛选缓存数据
  dealCache = result => {
    const { searchForm } = this.state;
    if (result) {
      dealCache(searchForm, result);
      this.setState(
        {
          page: result.page,
        },
        () => {
          this.search(result);
          this.props.dispatch({
            type: 'cache/request',
            payload: { request: null },
          });
        }
      );
    }
  };

  //获取单据列表
  getForms = () => {
    let checkboxListForm = this.state.checkboxListForm;
    //formType：101（申请单）、102（报销单）、103（全部）
    requestService.getMyDocumentType(101).then(res => {
      let options = [{ label: this.$t('request.all' /*全部*/), value: 'all' }];
      res.data.map(item => {
        options.push({ label: item.formName, value: item.formOID });
      });
      checkboxListForm.map(form => {
        if (form.id === 'formOID') {
          form.items.map(item => {
            item.key === 'formOID' && (item.options = options);
          });
        }
      });
      this.setState({ checkboxListForm, requestTypes: res.data }, () => {
        this.getCache();
      });
    });
  };

  getList = () => {
    let { page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    for (let name in searchParams) !searchParams[name] && delete searchParams[name];
    requestService
      .getRequestList(page, pageSize, searchParams)
      .then(res => {
        this.setState({
          loading: false,
          data: res.data,
          pagination: {
            total: Number(res.headers['x-total-count']) || 0,
            current: page + 1,
            onChange: this.onChangePaper,
          },
        });
      })
      .catch(() => {
        this.setState({ loading: false });
        message.error(this.$t('common.error1'));
      });
  };

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.setCache(this.state.searchParams);
        this.getList();
      });
    }
  };

  search = values => {
    this.setCache({ ...values });
    let { searchParams } = this.state;
    values.formOID === 'all' && (values.formOID = '');
    values.startDate && (values.startDate = moment(values.startDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    this.setState(
      {
        searchParams: { ...searchParams, ...values },
        page: 0,
        pagination: {
          total: 0,
        },
      },
      () => {
        this.getList();
      }
    );
  };

  clear = () => {
    this.setCache({});
    this.setState(
      {
        cacheSearchData: {},
        searchParams: { status: '10011002100310041005100610071008' },
        page: 0,
        pagination: { total: 0 },
      },
      () => {
        this.getList();
      }
    );
  };

  handleSearch = value => {
    let { searchParams } = this.state;
    searchParams.businessCode = value;
    this.setState(
      {
        searchParams,
        page: 0,
        pagination: {
          total: 0,
        },
      },
      () => {
        this.getList();
      }
    );
  };

  change = e => {
    const { searchParams } = this.state;
    if (e && e.target && e.target.value) {
      searchParams.businessCode = e.target.value;
    } else {
      searchParams.businessCode = '';
    }
    this.setState({ searchParams });
    this.setCache({ searchParams });
  };

  eventHandle2 = (type, value) => {
    let searchForm = this.state.searchForm;
    const { searchParams } = this.state;
    switch (type) {
      case 'startDate': {
        value && (searchParams.startDate = moment(value).format('YYYY-MM-DD'));
      }
      case 'endDate': {
        value && (searchParams.endDate = moment(value).format('YYYY-MM-DD'));
        break;
      }
      case 'keyword':
        {
          searchParams.keyword = value;
          break;
        }
        this.setState({ searchParams });
        this.setCache({ searchParams });
    }
  };
  expandedRowRender = record => {
    let expandedFlag = false;
    if (
      record.warning ||
      record.rejectType === 1002 ||
      record.rejectType === 1003 ||
      (record.participantClosed ||
        record.closed ||
        (record.applicationParticipant && record.applicationParticipant.closed)) ||
      (record.referenceExpenseReportsCode && record.referenceExpenseReportsCode.length)
    ) {
      expandedFlag = true;
    }
    return expandedFlag ? (
      <div className="expanded-row">
        {!!record.warning && (
          <div>
            {this.$t('request.over.budget') /*超预算*/}：{JSON.parse(record.warning).message}
          </div>
        )}
        {record.rejectType === 1002 && (
          <div>
            {this.$t('request.approve.reject') /*审批驳回*/}：{record.rejectReason}
          </div>
        )}
        {record.rejectType === 1003 && (
          <div>
            {this.$t('request.audit.reject') /*审核驳回*/}：{record.rejectReason}
          </div>
        )}
        {!!(
          record.participantClosed ||
          record.closed ||
          (record.applicationParticipant && record.applicationParticipant.closed)
        ) && <div>{this.$t('request.bill.disabled') /*停用：该单据已停用*/}</div>}
        {!!(record.referenceExpenseReportsCode && record.referenceExpenseReportsCode.length) && (
          <div style={{ whiteSpace: 'normal' }}>
            {this.$t('request.referred') /*已关联*/}：{this.$t('request.expense.report') /*报销单*/}&nbsp;{record.referenceExpenseReportsCode.join(
              ', '
            )}
          </div>
        )}
      </div>
    ) : null;
  };

  handleRowClick = record => {
    this.props.dispatch({
      type: 'cache/request',
      payload: { request: this.state.cacheSearchData },
    });
    //formType：2001（差旅申请）、2002（费用申请）、2003（订票申请）、2004（京东申请）、2005（借款申请）
    if (record.status === 1001) {
      //编辑页面
      if (
        record.formType === 2001 ||
        record.formType === 2002 ||
        record.formType === 2003 ||
        record.formType === 2005
      ) {
        this.props.dispatch(
          routerRedux.push({
            pathname: '/request/request-edit/:formOID/:applicationOID'
              .replace(':formOID', record.formOID)
              .replace(':applicationOID', record.applicationOID),
          })
        );
      }
      if (record.formType === 2004) {
        this.props.dispatch(
          routerRedux.push({
            pathname: '/request/jd-request-edit/:formOID/:applicationOID'
              .replace(':formOID', record.formOID)
              .replace(':applicationOID', record.applicationOID),
          })
        );
      }
    } else {
      this.props.dispatch(
        routerRedux.push({
          pathname: '/request/request-detail/:formOID/:applicationOID/:pageFrom'
            .replace(':formOID', record.formOID)
            .replace(':applicationOID', record.applicationOID)
            .replace(':pageFrom', 'my'),
        })
      );
    }
  };

  //新建申请单
  handleNewRequest = e => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/request/new-request/:formOID/:applicantOID'.replace(':formOID', e.key),
      })
    );
  };

  //弹出代提申请单modal
  showProxyModal = () => {
    this.setState({
      proxyVisible: true,
    });
  };

  //代提申请单modal
  closeProxyModal = () => {
    this.setState({
      proxyVisible: false,
      proxyApplicantOID: null,
      proxyFormOID: null,
    });
  };

  //新建代提的申请单
  handleNewRequestProxy = () => {
    let redirect_url = this.state.newRequest.url
      .replace(':formOID', this.state.proxyFormOID)
      .replace(':applicantOID', this.state.proxyApplicantOID);
    this.context.router.push(redirect_url);
  };

  handleSelectApplicant = value => {
    this.setState({
      proxyApplicantOID: value,
      proxyFormOID: '',
    });
    this.getProxyFormList(value);
  };

  //获取申请人可代理的单据列表
  getProxyFormList = userOID => {
    requestService.getMyDocumentType(101, userOID).then(res => {
      if (res.data && res.data.length) {
        this.setState({
          proxyFormList: res.data,
        });
      }
    });
  };

  handleSelectForm = (value, e) => {
    this.setState({
      proxyFormOID: value,
    });
  };

  render() {
    const {
      loading,
      requestTypes,
      checkboxListForm,
      searchForm,
      columns,
      data,
      pagination,
    } = this.state;
    const {
      proxyVisible,
      applicantList,
      proxyApplicantOID,
      proxyFormList,
      proxyFormOID,
      isShowProxy,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const menu = (
      <Menu onClick={this.handleNewRequest} style={{ maxHeight: 250, overflow: 'auto' }}>
        {requestTypes.map(item => {
          return <Menu.Item key={item.formOID}>{item.formName}</Menu.Item>;
        })}
      </Menu>
    );
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div className="application-list">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          eventHandle={this.eventHandle2}
          clearHandle={this.clear}
          checkboxListForm={checkboxListForm}
        />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: pagination.total || 0 }) /*共搜索到 {total} 条数据*/}
          </div>
          <div className="table-header-buttons">
            <div id="request-drop" style={{position : "relative"}}>
            <Dropdown getPopupContainer={ () => document.getElementById('request-drop')} overlay={menu}>
              <Button type="primary">
                {this.$t('request.create') /*新建申请单*/} <Icon type="down" />
              </Button>
            </Dropdown>
            </div>
            {isShowProxy && (
              <Button onClick={() => this.showProxyModal()}>
                {this.$t('request.proxy') /*代提申请单*/}
              </Button>
            )}
            <Search
              className="input-search"
              placeholder={this.$t('request.input.request.number') /*输入申请单号*/}
              onSearch={this.handleSearch}
              onChange={this.change}
              enterButton
            />
          </div>
        </div>
        <Table
          rowKey="applicationOID"
          columns={columns}
          dataSource={data}
          pagination={pagination}
          expandedRowRender={record => this.expandedRowRender(record)}
          rowClassName={record =>
            record.warning ||
            record.rejectType === 1002 ||
            record.rejectType === 1003 ||
            (record.referenceExpenseReportsCode && record.referenceExpenseReportsCode.length) ||
            (record.applicationParticipant && record.applicationParticipant.closed) ||
            (record.participantClosed || record.closed)
              ? ''
              : 'row-expand-display-none'
          }
          onRow={record => ({ onClick: () => this.handleRowClick(record) })}
          loading={loading}
          bordered
          size="middle"
        />
        <Modal
          title={this.$t('request.proxy') /*代提申请单*/}
          visible={proxyVisible}
          onCancel={this.closeProxyModal}
          maskClosable={false}
          destroyOnClose={true}
          footer={[
            <Button key="back" onClick={this.closeProxyModal}>
              {this.$t('common.cancel') /*取消*/}
            </Button>,
            <Button
              key="submit"
              type="primary"
              disabled={!proxyApplicantOID || !proxyFormOID}
              onClick={this.handleNewRequestProxy}
            >
              {this.$t('common.ok') /*确定*/}
            </Button>,
          ]}
        >
          <Form>
            <FormItem {...formItemLayout} label={this.$t('request.applicant') /*申请人*/}>
              <Select
                showSearch
                placeholder={this.$t('common.please.select') /*请选择*/}
                onChange={this.handleSelectApplicant}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {applicantList.map(item => (
                  <Option value={item.userOID} key={item.userOID}>{`${item.fullName}  ${
                    item.employeeID
                  }`}</Option>
                ))}
              </Select>
            </FormItem>
            {!!proxyApplicantOID && (
              <FormItem {...formItemLayout} label={this.$t('request.bill.name') /*单据名称*/}>
                <Select
                  showSearch
                  placeholder={this.$t('common.please.select') /*请选择*/}
                  value={proxyFormOID ? proxyFormOID : undefined}
                  onChange={this.handleSelectForm}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {proxyFormList.map(item => (
                    <Option value={item.formOID} key={item.formOID}>
                      {item.formName}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            )}
          </Form>
        </Modal>
      </div>
    );
  }
}

/*ApplicationList.contextTypes = {
  router: React.PropTypes.object
};*/

function mapStateToProps(state) {
  return {
    language: state.languages,
    request: state.cache.request,
  };
}

const wrappedApplicationList = Form.create()(ApplicationList);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedApplicationList);
