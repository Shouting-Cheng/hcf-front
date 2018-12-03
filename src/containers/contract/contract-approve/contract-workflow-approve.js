import React from 'react';
import { connect } from 'dva';
import { Form, Tabs, Table, message,InputNumber, Badge, Input, Row, Col, Popover } from 'antd';
const TabPane = Tabs.TabPane;
import { routerRedux } from 'dva/router';
import config from 'config';
const Search = Input.Search;
import SearchArea from 'components/Widget/search-area';
import moment from 'moment';
import CustomTable from 'components/Widget/custom-table';

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
          label: this.$t({ id: 'my.contract.name' } /*合同名称*/),
          event:"name"
        },
        {
          type: 'select',
          colSpan: '6',
          id: 'contractTypeId',
          label: this.$t({ id: 'my.contract.type' }) /*合同类型*/,
          getUrl: `${config.contractUrl}/api/contract/type/query/all`,
          method: 'get',
          options: [],
          searchKey: 'contractTypeName',
          getParams: { setOfBooksId: this.props.company.setOfBooksId },
          labelKey: 'contractTypeName',
          valueKey: 'id',
          placeholder: this.$t({ id: 'common.please.enter' } /*请输入*/),
          event:"contractTypeId"
        },
        {
          type: 'list',
          listType: 'bgtUserOID',
          options: [],
          id: 'userOID',
          label: this.$t({ id: 'pay.refund.employeeName' }),
          labelKey: 'fullName',
          valueKey: 'userOID',
          colSpan: 6,
          single: true,
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          event:"userOID"
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'dateRange',
          items: [
            {
              type: 'date',
              id: 'beginDate',
              label: this.$t({ id: 'contract.search.submit.date.from' } /*提交时间从*/),
              event:"beginDate"
            },
            {
              type: 'date',
              id: 'endDate',
              label: this.$t({ id: 'contract.search.submit.date.to' } /*提交时间至*/),
              event:"endDate"
            },
          ],
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
          event:"currency",
          colSpan: 6,
        },
        {
          type: 'items',
          colSpan: '6',
          id: 'noWritedAmount',
          items: [
            {
              type: 'inputNumber',
              id: 'amountFrom',
              label: this.$t('my.contract.amount.from'),
              placeholder: this.$t('exp.money.from'),
              event:"amountFrom",
            },
            {
              type: 'inputNumber',
              id: 'amountTo',
              label: this.$t('my.contract.amount.to'),
              placeholder: this.$t('exp.money.to'),
              event:"amountTo",
            },
          ],
        },
        {
          type: 'input',
          colSpan: 6,
          id: 'description',
          label: this.$t({ id: 'common.comment' } /*备注*/),
          event:"description",
        },
      ],
      searchParams: {},
      columns: [
        {
          title: this.$t({ id: 'my.contract.number' } /*合同编号*/),
          align: 'center',
          width: 180,
          dataIndex: 'contractNumber',
          render: (desc, record) => record.contractApprovalView.contractNumber,
        },
        {
          title: this.$t({ id: 'my.contract.name' } /*合同名称*/),
          dataIndex: 'contractName',
          align: 'center',
          render: (desc, record) => (
            <Popover content={record.contractApprovalView.contractName}>
              {record.contractApprovalView.contractName}
            </Popover>
          ),
        },
        {
          title: this.$t({ id: 'my.contract.type' } /*合同类型*/),
          dataIndex: 'contractTypeName',
          align: 'center',
          render: (desc, record) => (
            <Popover content={record.contractApprovalView.contractTypeName}>
              {record.contractApprovalView.contractTypeName}
            </Popover>
          ),
        },
        {
          title: this.$t({ id: 'contract.createdBy' } /*申请人*/),
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
          title: this.$t({ id: 'common.submit.date' } /*提交时间*/),
          align: 'center',
          width: 120,
          dataIndex: 'submittedDate',
          render: (desc, record) =>
            moment(record.contractApprovalView.submittedDate).format('YYYY-MM-DD'),
        },
        {
          title: this.$t({ id: 'my.contract.currency' } /*币种*/),
          align: 'center',
          width: 80,
          dataIndex: 'currency',
          render: (desc, record) => record.contractApprovalView.currencyCode,
        },
        {
          title: this.$t({ id: 'my.contract.amount' } /*金额*/),
          align: 'center',
          dataIndex: 'totalAmount',
          render: (desc, record) => this.filterMoney(record.contractApprovalView.totalAmount),
        },
        // { title: this.$t({ id: "my.contract.company" }/*公司*/), dataIndex: 'companyName' },
        // { title: this.$t({ id: "my.contract.signDate" }/*签署时间*/), align: 'center', dataIndex: 'signDate', render: signDate => moment(signDate).format('YYYY-MM-DD') },
        // { title: this.$t({ id: "contract.form.nane" }/*表单类型名称*/), dataIndex: 'formName' },
        {
          title: this.$t('common.remark'),
          dataIndex: 'remark',
          align: 'center',
          render: (value, record) => (
            <Popover content={record.contractApprovalView.remark}>
              {record.contractApprovalView.remark}
            </Popover>
          ),
        },
        {
          title: this.$t({ id: 'common.column.status' } /*状态*/),
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

      //contractWorkflowDetail: menuRoute.getRouteItem('approve-workflow-contract-detail', 'key'), //合同详情
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
    if(values.userOID && values.userOID[0]){
      values.userOID = values.userOID[0];
    }
    //处理查询条件为弹出框时返回的数组问题
    if(values.createdBy && values.createdBy[0]){
      values.createdBy = values.createdBy[0];
    }
    this.setState({searchParams:{ ...this.state.searchParams,...values} },()=>{
      this.table.search({ ...this.state.searchParams,...values });
    });
  };
//点击重置的事件，清空值为初始值
  handleReset = () => {
    this.clearSearchAreaSelectData();
    this.props.clearHandle && this.props.clearHandle();
    this.setState({searchParams:{}});

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
    /* let url = this.state.contractWorkflowDetail.url.replace(
      ':id',
      record.contractApprovalView.contractId
    );
    url = url
      .replace(':entityOID', record.entityOID)
      .replace(':entityType', record.entityType)
      .replace(':status', this.state.tabValue);
    this.context.router.push(url);*/
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/approval-management/contract-approve/contract-workflow-approve-detail/${
          record.contractApprovalView.contractId
        }/${record.entityOID}/${record.entityType}/${this.state.tabValue}`,
      })
    );
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

  change = (e) =>{
    if(e && e.target && e.target.value){
      const { searchParams } = this.state;
      searchParams.contractNumber = e.target.value;
      this.setState({
        searchParams,
      });
    }else{
      const { searchParams } = this.state;
      searchParams.contractNumber = '';
      this.setState({
        searchParams,
      });
    }
  }

  eventHandle = (type, value) => {
    let searchForm = this.state.searchForm;
    const { searchParams } = this.state;
    switch (type) {
      case 'name': {
        searchParams.name = value;
        break;
      }
      case 'contractTypeId': {
        if(value[0].id){
          searchParams.contractTypeId = value[0].id;
        }else{
          searchParams.contractTypeId = '';
        }
        break;
      }
      case 'userOID': {
        if(value[0].userOID){
          searchParams.userOID =  value[0].userOID;
        }else{
          searchParams.userOID =  '';
        }
        break;
      }
      case 'beginDate': {
        if(value){
          searchParams.beginDate = moment(value).format('YYYY-MM-DD')
        }else{
          searchParams.beginDate = '';
        }
        break;
      }
      case 'endDate': {
        if(value){
          searchParams.endDate = moment(value).format('YYYY-MM-DD')
        }else{
          searchParams.endDate = '';
        }
        break;
      }
      case 'currency': {
        searchParams.currency = value;
        break;
      }
      case 'amountFrom': {
        searchParams.amountFrom = value;
        break;
      }
      case 'amountTo': {
        searchParams.amountTo = value;
        break;
      }
      case 'description': {
        searchParams.description = value;
        break;
      }
    }
    this.setState({ searchParams });
  };
  renderContent = () => {
    const { searchForm, tabValue, columns } = this.state;

    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          clearHandle={() => {}}
          maxLength={4}
          eventHandle={this.eventHandle}
          submitHandle={this.handleSearch}
        />
        <div className="table-header" style={{ marginBottom: 12, marginTop: 12 }}>
          <Row>
            <Col span={18} />
            <Col span={6}>
              <Search
                placeholder={this.$t({ id: 'my.please.input.number' })}
                onSearch={this.searchNumber}
                onChange={this.change}
                clearHandle={this.handleReset}
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
          <TabPane tab={this.$t({ id: 'contract.unapproved' } /*未审批*/)} key="unapproved" />
          <TabPane tab={this.$t({ id: 'contract.approved' } /*已审批*/)} key="approved" />
        </Tabs>
        {this.renderContent()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

const wrappedContractWorkflowApprove = Form.create()(ContractWorkflowApprove);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedContractWorkflowApprove);
