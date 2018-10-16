import React from 'react';
import { connect } from 'react-redux';
import { Form, Tabs, Table, message, Badge, Input, Row, Col, Popover } from 'antd';
const TabPane = Tabs.TabPane;
import menuRoute from 'routes/menuRoute';
import config from 'config';
const Search = Input.Search;
import SearchArea from 'components/search-area';
import moment from 'moment';
import { formatMessage, messages } from 'share/common';
import CustomTable from 'components/custom-table';

class ContractWorkflowApprove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 'unapproved',
      searchForm: [
        {
          type: 'input',
          colSpan: '6',
          id: 'name',
          label: formatMessage({ id: 'my.contract.name' } /*合同名称*/),
        },
        {
          type: 'select',
          colSpan: '6',
          id: 'contractTypeId',
          label: formatMessage({ id: 'my.contract.type' }) /*合同类型*/,
          getUrl: `${config.contractUrl}/api/contract/type/contract/type/by/company`,
          method: 'get',
          options: [],
          searchKey: 'contractTypeName',
          getParams: { companyId: this.props.company.id },
          labelKey: 'contractTypeName',
          valueKey: 'id',
          placeholder: formatMessage({ id: 'common.please.enter' } /*请输入*/),
        },
        {
          type: 'list',
          listType: 'bgtUserOID',
          options: [],
          id: 'userOID',
          label: formatMessage({ id: 'pay.refund.employeeName' }),
          labelKey: 'fullName',
          valueKey: 'userOID',
          colSpan: 6,
          single: true,
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'dateRange',
          items: [
            {
              type: 'date',
              id: 'beginDate',
              label: formatMessage({ id: 'contract.search.date.from' } /*提交时间从*/),
            },
            {
              type: 'date',
              id: 'endDate',
              label: formatMessage({ id: 'contract.search.date.to' } /*提交时间至*/),
            },
          ],
        },
        {
          type: 'select',
          id: 'currencyCode',
          label: formatMessage({ id: 'expense.reverse.currency.code' } /*币种*/),
          options: [],
          getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`,
          method: 'get',
          labelKey: 'currency',
          valueKey: 'currency',
          colSpan: 6,
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'noWritedAmount',
          items: [
            {
              type: 'input',
              id: 'amountFrom',
              label: messages('my.contract.amount.from'),
              placeholder: messages('exp.money.from'),
            },
            {
              type: 'input',
              id: 'amountTo',
              label: messages('my.contract.amount.to'),
              placeholder: messages('exp.money.to'),
            },
          ],
        },
        {
          type: 'input',
          colSpan: 6,
          id: 'description',
          label: formatMessage({ id: 'common.comment' } /*备注*/),
        },
      ],
      searchParams: {},
      columns: [
        {
          title: formatMessage({ id: 'my.contract.number' } /*合同编号*/),
          align: 'center',
          width: 180,
          dataIndex: 'contractNumber',
          render: (desc, record) => record.contractApprovalView.contractNumber,
        },
        {
          title: formatMessage({ id: 'my.contract.name' } /*合同名称*/),
          dataIndex: 'contractName',
          align: 'center',
          render: (desc, record) => (
            <Popover content={record.contractApprovalView.contractName}>
              {record.contractApprovalView.contractName}
            </Popover>
          ),
        },
        {
          title: formatMessage({ id: 'my.contract.type' } /*合同类型*/),
          dataIndex: 'contractTypeName',
          align: 'center',
          render: (desc, record) => (
            <Popover content={record.contractApprovalView.contractTypeName}>
              {record.contractApprovalView.contractTypeName}
            </Popover>
          ),
        },
        {
          title: formatMessage({ id: 'contract.createdBy' } /*申请人*/),
          align: 'center',
          width: 100,
          dataIndex: 'applicantName',
          render: (desc, record) => (
            <Popover content={record.contractApprovalView.applicantName}>
              {record.contractApprovalView.applicantName}
            </Popover>
          ),
        },
        {
          title: formatMessage({ id: 'contract.sign.date' } /*提交时间*/),
          align: 'center',
          width: 90,
          dataIndex: 'submittedDate',
          render: (desc, record) =>
            moment(record.contractApprovalView.submittedDate).format('YYYY-MM-DD'),
        },
        {
          title: formatMessage({ id: 'my.contract.currency' } /*币种*/),
          align: 'center',
          width: 80,
          dataIndex: 'currency',
          render: (desc, record) => record.contractApprovalView.currencyCode,
        },
        {
          title: formatMessage({ id: 'my.contract.amount' } /*金额*/),
          align: 'center',
          dataIndex: 'totalAmount',
          render: (desc, record) => this.filterMoney(record.contractApprovalView.totalAmount),
        },
        // { title: formatMessage({ id: "my.contract.company" }/*公司*/), dataIndex: 'companyName' },
        // { title: formatMessage({ id: "my.contract.signDate" }/*签署时间*/), align: 'center', dataIndex: 'signDate', render: signDate => moment(signDate).format('YYYY-MM-DD') },
        // { title: formatMessage({ id: "contract.form.nane" }/*表单类型名称*/), dataIndex: 'formName' },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
          render: (value, record) => (
            <Popover content={record.contractApprovalView.remark}>
              {record.contractApprovalView.remark}
            </Popover>
          ),
        },
        {
          title: formatMessage({ id: 'common.column.status' } /*状态*/),
          align: 'center',
          width: 90,
          dataIndex: 'status',
          render: (value, record) => (
            <Badge
              status={this.$statusList[record.contractApprovalView.status].state}
              text={this.$statusList[record.contractApprovalView.status].label}
            />
          ),
        },
      ],

      contractWorkflowDetail: menuRoute.getRouteItem('approve-workflow-contract-detail', 'key'), //合同详情
    };
  }

  //未审批搜索
  handleSearch = values => {
    values.beginDate && (values.beginDate = moment(values.beginDate).format('YYYY-MM-DD'));
    values.endDate && (values.endDate = moment(values.endDate).format('YYYY-MM-DD'));
    if (this.state.tabValue === 'approved') {
      values.finished = true;
    } else {
      values.finished = false;
    }
    this.setState({ searchParams: values });
    this.table.search(values);
  };

  handleTabsChange = key => {
    this.setState({ tabValue: key }, () => {
      if (key === 'approved') {
        this.setState(
          {
            searchParams: { ...this.state.searchParams, finished: true },
          },
          () => {
            this.table.search({ ...this.state.searchParams, finished: true });
          }
        );
      } else {
        this.setState(
          {
            searchParams: { ...this.state.searchParams, finished: false },
          },
          () => {
            this.table.search({ ...this.state.searchParams, finished: false });
          }
        );
      }
    });
  };

  //进入合同详情页
  handleRowClick = (record, flag) => {
    console.log(record);
    let url = this.state.contractWorkflowDetail.url.replace(
      ':id',
      record.contractApprovalView.contractId
    );
    url = url
      .replace(':entityOID', record.entityOID)
      .replace(':entityType', record.entityType)
      .replace(':status', this.state.tabValue);
    this.context.router.push(url);
  };

  searchNumber = e => {
    const { searchParams } = this.state;
    this.setState(
      {
        searchParams: { ...this.state.searchParams, contractNumber: e },
      },
      () => {
        this.table.search({ ...this.state.searchParams, contractNumber: e });
      }
    );
  };

  renderContent = () => {
    const { searchForm, tabValue, columns } = this.state;

    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          clearHandle={() => {}}
          maxLength={4}
          submitHandle={this.handleSearch}
        />
        <div className="divider" />
        <div className="table-header" style={{ marginBottom: '5px' }}>
          <Row>
            <Col span={18} />
            <Col span={6}>
              <Search
                placeholder={formatMessage({ id: 'my.please.input.number' })}
                onSearch={this.searchNumber}
                enterButton
              />
            </Col>
          </Row>
        </div>
        <CustomTable
          onClick={this.handleRowClick}
          url={`${config.baseUrl}/api/approvals/contract/report/filters`}
          ref={ref => (this.table = ref)}
          params={{ finished: tabValue === 'approved' }}
          columns={columns}
        />
      </div>
    );
  };

  render() {
    const { tabValue } = this.state;
    return (
      <div className="pre-payment-container">
        <Tabs defaultActiveKey={tabValue} onChange={this.handleTabsChange}>
          <TabPane tab={formatMessage({ id: 'contract.unapproved' } /*未审批*/)} key="unapproved" />
          <TabPane tab={formatMessage({ id: 'contract.approved' } /*已审批*/)} key="approved" />
        </Tabs>
        {this.renderContent()}
      </div>
    );
  }
}

ContractWorkflowApprove.contextTypes = {
  router: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    company: state.login.company,
  };
}

const wrappedContractWorkflowApprove = Form.create()(ContractWorkflowApprove);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedContractWorkflowApprove);
