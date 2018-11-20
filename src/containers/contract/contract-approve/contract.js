import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Tabs,
  Table,
  message,
  Badge,
  Col,
  Dropdown,
  Menu,
  Button,
  Icon,
  Row,
  Input,
  InputNumber,
  Popover,
  Tag,
} from 'antd';
const TabPane = Tabs.TabPane;
import { routerRedux } from 'dva/router';
import contractService from 'containers/contract/contract-approve/contract.service';
import config from 'config';
import SearchArea from 'components/Widget/search-area';
import moment from 'moment';

import CustomTable from 'components/Widget/custom-table';
const Search = Input.Search;

class Contract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 'unapproved',
      loading1: false,
      loading2: false,
      contractStatus: {
        6002: { label: this.$t({ id: 'my.contract.state.cancel' } /*已取消*/), state: 'default' },
        6003: { label: this.$t({ id: 'my.contract.state.finish' } /*已完成*/), state: 'success' },
        1001: {
          label: this.$t({ id: 'my.contract.state.generate' } /*编辑中*/),
          state: 'processing',
        },
        6001: { label: this.$t({ id: 'my.contract.state.hold' } /*暂挂*/), state: 'warning' },
        1002: {
          label: this.$t({ id: 'my.contract.state.submitted' } /*审批中*/),
          state: 'processing',
        },
        1005: { label: this.$t({ id: 'my.contract.state.rejected' } /*已驳回*/), state: 'error' },
        1004: { label: this.$t({ id: 'my.contract.state.confirm' } /*已通过*/), state: 'success' },
        1003: {
          label: this.$t({ id: 'my.contract.state.withdrawal' } /*已撤回*/),
          state: 'warning',
        },
      },
      SearchForm1: [
        {
          type: 'input',
          colSpan: 6,
          id: 'contractName',
          label: this.$t({ id: 'my.contract.name' } /*合同名称*/),
          event: "contractName"
        },
        {
          type: 'select',
          colSpan: '6',
          id: 'contractTypeId',
          label: this.$t({ id: 'my.contract.type' }) /*合同类型*/,
          getUrl: `${config.contractUrl}/api/contract/type/contract/type/by/company`,
          method: 'get',
          options: [],
          searchKey: 'contractTypeName',
          getParams: { companyId: this.props.company.id },
          labelKey: 'contractTypeName',
          valueKey: 'id',
          placeholder: this.$t({ id: 'common.please.enter' } /*请输入*/),
          event: "contractTypeId"
        },
        {
          type: 'list',
          listType: 'bgtUser',
          options: [],
          id: 'createdBy',
          label: this.$t({ id: 'common.applicant' }),
          labelKey: 'fullName',
          valueKey: 'id',
          colSpan: 6,
          single: true,
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          event: "createdBy"
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'dateRange',
          items: [
            {
              type: 'date',
              id: 'submittedDateFrom',
              label: this.$t({ id: 'contract.search.submit.date.from' } /*提交日期从*/),
              event: "submittedDateFrom"
            },
            {
              type: 'date',
              id: 'submittedDateTo',
              label: this.$t({ id: 'contract.search.submit.date.to' } /*提交日期至*/),
              event: "submittedDateTo"
            },
          ],
        },
        {
          type: 'select',
          id: 'currency',
          label: this.$t({ id: 'expense.reverse.currency.code' } /*币种*/),
          options: [],
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: 6,
          event: "currency"
        },
        {
          type: 'items',
          colSpan: 6,
          id: 'amountRange',
          items: [
            {
              type: 'inputNumber',
              id: 'amountFrom',
              label: this.$t({ id: 'my.contract.amount.from' } /*合同金额从*/),
              event: "amountFrom"
            },
            {
              type: 'inputNumber',
              id: 'amountTo',
              label: this.$t({ id: 'my.contract.amount.to' } /*合同金额至*/),
              event: "amountTo"
            },
          ],
        },
        {
          type: 'input',
          colSpan: 6,
          id: 'remark',
          label: this.$t({ id: 'common.comment' } /*备注*/),
          event: "remark"
        },
      ],
      columns: [
        {
          title: this.$t({ id: 'my.contract.number' } /*合同编号*/),
          dataIndex: 'contractNumber',
          width: 200,
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.name' } /*合同名称*/),
          dataIndex: 'contractName',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.type' } /*合同类型*/),
          dataIndex: 'contractTypeName',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'contract.createdBy' } /*申请人*/),
          dataIndex: 'created',
          width: 130,
          align: 'center',
          render: value => value && value.fullName,
        },
        {
          title: this.$t({ id: 'common.submit.date' } /*提交时间*/),
          dataIndex: 'submittedDate',
          width: 100,
          align: 'center',
          render: value => (value ? moment(value).format('YYYY-MM-DD') : '-'),
        },
        {
          title: this.$t({ id: 'my.contract.currency' } /*币种*/),
          dataIndex: 'currency',
          align: 'center',
          width: 50,
        },
        {
          title: this.$t({ id: 'my.contract.amount' } /*金额*/),
          dataIndex: 'amount',
          align: 'center',
          render: desc => this.filterMoney(desc),
        },
        {
          title: this.$t({ id: 'common.comment' }),
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'common.column.status' } /*状态*/),
          dataIndex: 'status',
          align: 'center',
          width: 100,
          render: value => (
            <Badge
              status={this.state.contractStatus[value].state}
              text={this.state.contractStatus[value].label}
            />
          ),
        },
      ],
      SearchForm2: [
        {
          type: 'input',
          id: 'contractName',
          colSpan: 6,
          label: this.$t({ id: 'my.contract.name' } /*合同编号*/),
        },
        {
          type: 'input',
          id: 'keyword',
          colSpan: 6,
          label: this.$t({ id: 'contract.search.name.createdBy' } /*申请人姓名/工号*/),
        },
        // {type: 'combobox', id: 'contractTypeId', label: this.$t({id: "my.contract.type"}/*合同类型*/),
        //   searchUrl: `${config.contractUrl}/api/contract/type/contract/type/by/company`, method: 'get', options: [],
        //   searchKey: 'contractTypeName', getParams: {companyId: this.props.company.id}, labelKey: 'id', valueKey: 'id',
        //   placeholder: this.$t({id: "common.please.enter"}/*请输入*/)},
        {
          type: 'select',
          id: 'contractTypeId',
          colSpan: 6,
          label: this.$t({ id: 'my.contract.type' }),
          getUrl: `${config.contractUrl}/api/contract/type/query/all`,
          options: [],
          method: 'get',
          valueKey: 'id',
          labelKey: 'contractTypeName',
          getParams: { setOfBooksId: this.props.company.setOfBooksId },
        },
        {
          type: 'items',
          colSpan: 6,
          id: 'dateRange',
          items: [
            {
              type: 'date',
              id: 'submittedDateFrom',
              label: this.$t({ id: 'contract.search.submit.date.from' } /*提交日期从*/),
            },
            {
              type: 'date',
              id: 'submittedDateTo',
              label: this.$t({ id: 'contract.search.submit.date.to' } /*提交日期至*/),
            },
          ],
        },
      ],
      url: `${config.contractUrl}/api/contract/header/confirm/query`,
      unApproveSearchParams: {},
      approveSearchParams: {},
      columns2: [
        {
          title: this.$t({ id: 'my.contract.number' } /*合同编号*/),
          dataIndex: 'contractNumber',
          width: 200,
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.name' } /*合同名称*/),
          dataIndex: 'contractName',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.type' } /*合同类型*/),
          dataIndex: 'contractTypeName',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : ''}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'contract.createdBy' } /*申请人*/),
          dataIndex: 'created',
          width: 130,
          align: 'center',
          render: value => value && value.fullName + ' - ' + value.employeeId,
        },
        {
          title: this.$t({ id: 'common.submit.date' } /*提交时间*/),
          dataIndex: 'submittedDate',
          width: 100,
          align: 'center',
          render: value => (value ? moment(value).format('YYYY-MM-DD') : '-'),
        },
        {
          title: this.$t({ id: 'my.contract.currency' } /*币种*/),
          dataIndex: 'currency',
          align: 'center',
          width: 50,
        },
        {
          title: this.$t({ id: 'my.contract.amount' } /*合同金额*/),
          dataIndex: 'amount',
          align: 'right',
          render: desc => this.filterMoney(desc),
        },
        {
          title: this.$t({ id: 'common.comment' }),
          key: 'remark',
          dataIndex: 'remark',
          align: 'left',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t({ id: 'common.column.status' } /*状态*/),
          dataIndex: 'status',
          align: 'center',
          width: 100,
          render: value => (
            <Badge
              status={this.state.contractStatus[value].state}
              text={this.state.contractStatus[value].label}
            />
          ),
        },
      ],
      unapprovedData: [],
      approvedData: [],
      unapprovedPagination: {
        total: 0,
      },
      approvedPagination: {
        total: 0,
      },
      unapprovedPage: 0,
      unapprovedPageSize: 10,
      approvedPage: 0,
      approvedPageSize: 10,
      //contractDetail: menuRoute.getRouteItem('approve-contract-detail', 'key'), //合同详情
    };
  }

  /*
    //获取审批列表
    getApprovedList = (resolve, reject) => {
      const { approvedPage, approvedPageSize, approveSearchParams } = this.state;
      this.setState({ loading2: true });
      contractService.getApprovedContractList(approvedPage, approvedPageSize, { ...approveSearchParams, checkBy: this.props.user.id }).then((res) => {
        if (res.status === 200) {
          this.setState({
            approvedData: res.data || [],
            loading2: false,
            approvedPagination: {
              total: Number(res.headers['x-total-count']) || 0,
              current: approvedPage + 1,
              onChange: this.onApprovedChangePaper
            }
          });
          resolve && resolve()
        }
      }).catch(() => {
        this.setState({ loading2: false });
        reject && reject()
      })
    };
  */

  //审批点击页码
  onApprovedChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ approvedPage: page - 1 }, () => {
        this.getApprovedList();
      });
    }
  };

  //未审批搜索
  unapprovedSearch = values => {
    values.submittedDateFrom &&
      (values.submittedDateFrom = moment(values.submittedDateFrom).format('YYYY-MM-DD'));
    values.submittedDateTo &&
      (values.submittedDateTo = moment(values.submittedDateTo).format('YYYY-MM-DD'));
    //处理查询条件为弹出框时返回的数组问题
    if (values.createdBy && values.createdBy[0]) {
      values.createdBy = values.createdBy[0];
    }
    this.setState({ unApproveSearchParams: values, approveSearchParams: values }, () => {
      this.customTable.search(this.state.unApproveSearchParams);
    });
  };

  //审批搜索
  approvedSearch = values => {
    values.submittedDateFrom &&
      (values.submittedDateFrom = moment(values.submittedDateFrom).format('YYYY-MM-DD'));
    values.submittedDateTo &&
      (values.submittedDateTo = moment(values.submittedDateTo).format('YYYY-MM-DD'));
    //处理查询条件为弹出框时返回的数组问题
    if (values.createdBy && values.createdBy[0]) {
      values.createdBy = values.createdBy[0];
    }
    this.setState({ approveSearchParams: values, unApproveSearchParams: values }, () => {
      this.customTable2.search(this.state.approveSearchParams);
    });
  };

  //进入合同详情页
  handleRowClick = record => {
    //this.context.router.push(this.state.contractDetail.url.replace(':id', record.id).replace(':status', this.state.tabValue))
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/contract-manage/contract-recheck/contract-detail/${record.id}/${
          this.state.tabValue
          }`,
      })
    );
  };

  handleTabsChange = key => {
    this.setState({
      tabValue: key,
    });
  };
  eventHandle = (type, value) => {
    let { unApproveSearchParams, approveSearchParams } = this.state;
    switch (type) {
      case 'contractName': {
        unApproveSearchParams.contractName = value;
        approveSearchParams.contractName = value;
        break;
      }
      case 'contractTypeId': {
        unApproveSearchParams.contractTypeId = value;
        approveSearchParams.contractTypeId = value;
        break;
      }
      case 'createdBy': {
        if (value && value[0]) {
          unApproveSearchParams.createdBy = value[0].id;
          approveSearchParams.createdBy = value[0].id;
        } else {
          unApproveSearchParams.createdBy = '';
          approveSearchParams.createdBy = '';
        }
        break;
      }
      case 'submittedDateFrom': {
        if (value) {
          unApproveSearchParams.submittedDateFrom = moment(value).format('YYYY-MM-DD');
          approveSearchParams.submittedDateFrom = moment(value).format('YYYY-MM-DD');
        } else {
          unApproveSearchParams.submittedDateFrom = '';
          approveSearchParams.submittedDateFrom = '';
        }
        break;
      }
      case 'submittedDateTo': {
        if (value) {
          unApproveSearchParams.submittedDateTo = moment(value).format('YYYY-MM-DD');
          approveSearchParams.submittedDateTo = moment(value).format('YYYY-MM-DD');
        } else {
          unApproveSearchParams.submittedDateTo = '';
          approveSearchParams.submittedDateTo = '';
        }
        break;
      }
      case 'currency': {
        unApproveSearchParams.currency = value;
        approveSearchParams.currency = value;
        break;
      }
      case 'amountFrom': {
        unApproveSearchParams.amountFrom = value;
        approveSearchParams.amountFrom = value;
        break;
      }
      case 'amountTo': {
        unApproveSearchParams.amountTo = value;
        approveSearchParams.amountTo = value;
        break;
      }
      case 'remark': {
        unApproveSearchParams.remark = value;
        approveSearchParams.remark = value;
        break;
      }
        this.setState({ unApproveSearchParams, approveSearchParams });
    }
  }

  searchNumber = e => {
    let { unApproveSearchParams, approveSearchParams } = this.state;
    unApproveSearchParams.contractNumber = e;
    approveSearchParams.contractNumber = e;
    this.setState({ unApproveSearchParams, approveSearchParams }, () => {
      if (this.state.tabValue === 'unapproved') {
        this.customTable.search({ ...this.state.unApproveSearchParams });
      } else {
        this.customTable.search({ ...this.state.approveSearchParams });
      }
    }
    );
  };

  change = (e) => {
    let { unApproveSearchParams, approveSearchParams } = this.state;
    if (e && e.target && e.target.value) {
      unApproveSearchParams.contractNumber = e.target.value;
      approveSearchParams.contractNumber = e.target.value;
    } else {
      unApproveSearchParams.contractNumber = '';
      approveSearchParams.contractNumber = '';
    }
    this.setState({ unApproveSearchParams, approveSearchParams });
  }
  //点击重置的事件，清空值为初始值
  handleReset = () => {
    this.clearSearchAreaSelectData();
    this.props.clearHandle && this.props.clearHandle();
    this.setState({ unApproveSearchParams: {}, approveSearchParams: {} })

  };

  //清除searchArea选择数据
  clearSearchAreaSelectData = () => {
    this.props.form.resetFields();
    this.state.checkboxListForm && this.state.checkboxListForm.map(list => {
      if (!list.single) {
        list.items.map(item => {
          item.checked = []
        })
      }
    });
  }

  renderContent() {
    const {
      tabValue,
      url,
      searchParams,
      loading1,
      loading2,
      SearchForm1,
      SearchForm2,
      columns,
      columns2,
      unapprovedData,
      approvedData,
      unapprovedPagination,
      approvedPagination,
    } = this.state;
    if (tabValue === 'unapproved') {
      return (
        <div>
          <SearchArea
            searchForm={SearchForm1}
            maxLength={4}
            eventHandle={this.eventHandle}
            clearHandle={this.handleReset}
            submitHandle={this.unapprovedSearch}
          />
          <Row gutter={24} style={{ marginBottom: 12, marginTop: 12 }}>
            <Col span={18} />
            <Col span={6}>
              <Search
                placeholder={this.$t({ id: 'my.please.input.number' })}
                onSearch={this.searchNumber}
                onChange={this.change}
                className="search-number"
                enterButton
              />
            </Col>
          </Row>
          <CustomTable
            ref={ref => (this.customTable = ref)}
            columns={columns}
            onClick={this.handleRowClick}
            url={`${config.contractUrl}/api/contract/header/confirm/query`}
          />
        </div>
      );
    } else {
      return (
        <div>
          <SearchArea
            searchForm={SearchForm1}
            clearHandle={() => { }}
            eventHandle={this.eventHandle}
            maxLength={4}
            submitHandle={this.approvedSearch}
          />
          <Row gutter={24} style={{ marginBottom: 12, marginTop: 12 }}>
            <Col span={18} />
            <Col span={6}>
              <Search
                placeholder={this.$t({ id: 'my.please.input.number' })}
                onSearch={e =>
                  this.customTable2 &&
                  this.customTable2.search({ ...searchParams, contractNumber: e })
                }
                className="search-number"
                enterButton
              />
            </Col>
          </Row>
          <CustomTable
            ref={ref => (this.customTable2 = ref)}
            columns={columns2}
            onClick={this.handleRowClick}
            url={`${config.contractUrl}/api/contract/header/confirmEd/query`}
          />
        </div>
      );
    }
  }

  render() {
    const {
      tabValue,
      url,
      loading1,
      loading2,
      SearchForm1,
      SearchForm2,
      columns,
      columns2,
      unapprovedData,
      approvedData,
      unapprovedPagination,
      approvedPagination,
    } = this.state;
    return (
      <div className="approve-contract">
        <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
          <TabPane tab={this.$t({ id: 'contract.unchecked' } /*未复核*/)} key="unapproved" />
          <TabPane tab={this.$t({ id: 'contract.checked' } /*已复核*/)} key="approved" />
        </Tabs>
        {this.renderContent()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}

const wrappedContract = Form.create()(Contract);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedContract);
