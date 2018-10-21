import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import contractService from 'containers/contract/contract-approve/contract.service';
import {
  Form,
  Card,
  Tabs,
  Button,
  Row,
  Col,
  Spin,
  Table,
  Timeline,
  message,
  Popover,
  Popconfirm,
  Icon,
  Breadcrumb,
  Tag,
} from 'antd';
const TabPane = Tabs.TabPane;
import config from 'config';
import moment from 'moment';
import DocumentBasicInfo from 'components/Widget/document-basic-info';
import SlideFrame from 'components/Widget/slide-frame';
import NewPayPlan from 'containers/contract/my-contract/new-pay-plan';
import NewContractInfo from 'containers/contract/my-contract/new-contract-info';
import FormCard from 'containers/contract/my-contract/form-card';
import 'styles/contract/my-contract/contract-detail.scss';
import ApproveHistory from 'components/Widget/Template/approve-history-work-flow';
import CustomTable from 'components/Widget/custom-table';
import VoucherInfo from 'containers/reimburse/voucher-info';

class ContractDetailCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: true,
      planLoading: false,
      historyLoading: false,
      topTapValue: 'contractInfo',
      headerData: {},
      payPlanVisible: false,
      payInfo: {},
      approveHistory: [],
      prepaymentData: [], //关联的预付款单
      AccountData: [], //关联的报账单
      contractEdit: false, //合同是否可编辑
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
      columns: [
        {
          title: this.$t({ id: 'my.contract.currency' } /*币种*/),
          dataIndex: 'currency',
          align: 'center',
        },
        {
          title: this.$t({ id: 'request.amount' } /*金额*/),
          dataIndex: 'amount',
          align: 'center',
          render: desc => this.filterMoney(desc),
        },
        {
          title: this.$t({ id: 'request.base.amount' } /*本币金额*/),
          dataIndex: 'funcAmount',
          align: 'center',
          render: (desc, record) => this.filterMoney(record.amount),
        },
        {
          title: this.$t({ id: 'my.receivable' } /*收款方*/),
          dataIndex: 'partnerName',
          align: 'center',
          render: (value, record) => {
            return (
              <div>
                <Tag color="#000">
                  {record.partnerCategory == 'EMPLOYEE'
                    ? this.$t('acp.employee')
                    : this.$t('acp.vendor')}
                </Tag>
                <div style={{ whiteSpace: 'normal' }}>
                  {record.partnerCategory === 'EMPLOYEE'
                    ? record.partnerName + '-' + record.partnerId
                    : record.partnerName}
                </div>
              </div>
            );
          },
        },
        {
          title: this.$t({ id: 'my.contract.plan.pay.date' } /*计划付款日期*/),
          dataIndex: 'dueDate',
          align: 'center',
          render: value => (
            <Popover content={value ? moment(value).format('YYYY-MM-DD') : '-'}>
              {value ? moment(value).format('YYYY-MM-DD') : '-'}
            </Popover>
          ),
        },
        {
          title: this.$t({ id: 'common.remark' } /*备注*/),
          dataIndex: 'remark',
          align: 'center',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
      ],
      data: [],
      /* page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },*/
      showSlideFrame: false,
      slideFrameTitle: '',
      btnVisible: true,
      documentParams: {},
      record: {}, //资金计划行信息
      historyData: [], //历史信息
      //EditContract: menuRoute.getRouteItem('edit-contract', 'key'), //编辑合同
      data1: [],
      pagination1: {
        total: 0,
      },
      page1: 0,
      pageSize1: 10,
    };
  }

  componentDidMount() {
    this.getInfo();
    //this.getPayList();
    // this.getPayDetailByContractHeaderId()
  }

  //获取合同信息
  getInfo = () => {
    const { columns } = this.state;
    this.setState({ detailLoading: true });
    contractService
      .getContractHeaderInfo(this.props.id)
      .then(response => {
        if (
          response.data.status === 1001 ||
          response.data.status === 1003 ||
          response.data.status === 1005
        ) {
          //编辑中、已驳回、已撤回
          columns.splice(columns.length, 0, {
            title: this.$t({ id: 'common.operation' } /*操作*/),
            dataIndex: 'id',
            width: '10%',
            render: (text, record) => (
              <span>
                <a onClick={e => this.editItem(e, record)}>
                  {this.$t({ id: 'common.edit' } /*编辑*/)}
                </a>
                <span className="ant-divider" />
                <Popconfirm
                  title={this.$t({ id: 'common.confirm.delete' } /*确定要删除吗？*/)}
                  onConfirm={e => this.deleteItem(e, record)}
                >
                  <a>{this.$t({ id: 'common.delete' } /*删除*/)}</a>
                </Popconfirm>
              </span>
            ),
          });
        }
        let documentParams = {
          formName: response.data.contractTypeName,
          totalAmount: response.data.amount ? response.data.amount : 0,
          statusCode: response.data.status,
          remark: response.data.remark,
          businessCode: '12',
          currencyCode: response.data.currency,
          infoList: [
            { label: this.$t('my.contract.number'), value: response.data.contractNumber },
            {
              label: this.$t('common.applicant'),
              value:
                response.data.created &&
                response.data.created.fullName + '-' + response.data.created.employeeId,
            },
            { label: this.$t('my.contract.category'), value: response.data.contractCategoryName },
          ],
          attachments: response.data.attachments,
        };
        this.setState(
          {
            columns,
            documentParams,
            btnVisible: !response.data.contractName,
            headerData: response.data,
            detailLoading: false,
          },
          () => {
            this.getHistory(response.data.documentOid);
            this.props.getContractStatus(this.state.headerData.status);
            this.getPrepaymentHeadByContract();
            this.getAccountHeadByContract();
            //this.getPayDetailByContractHeaderId();
          }
        );
      })
      .catch(e => {
        message.error(
          this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  };

  getHistory = oid => {
    contractService.getContractHistory(oid).then(response => {
      this.setState({
        approveHistory: response.data,
      });
    });
  };

  //获取合同关联的预付款单
  getPrepaymentHeadByContract() {
    let headerData = this.state.headerData;
    contractService
      .getPrepaymentHeadByContractNumber(headerData.contractNumber)
      .then(res => {
        this.setState(
          {
            prepaymentData: res.data,
          },
          () => {}
        );
      })
      .catch(e => {
        if (e.response) message.error(response.data.message);
      });
  }
  //获取合同关联的报账单
  getAccountHeadByContract() {
    let { headerData } = this.state;
    contractService.getAccountHeadByContract(headerData.id).then(res => {
      this.setState({
        AccountData: res.data,
      });
    });
  }

  render() {
    const {
      btnVisible,
      approveHistory,
      payInfo,
      payPlanVisible,
      payPlanTitle,
      detailLoading,
      planLoading,
      documentParams,
      historyLoading,
      contractEdit,
      topTapValue,
      subTabsList,
      pagination,
      columns,
      data,
      showSlideFrame,
      headerData,
      contractStatus,
      record,
      slideFrameTitle,
      historyData,
      prepaymentData,
      AccountData,
    } = this.state;

    return (
      <div className="contract-detail" style={{}}>
        <Card
          style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', marginRight: 15,marginLeft: 15, marginTop: 20 }}
        >
          <div style={{ paddingTop: 0, marginTop: '-20px' }}>
            <DocumentBasicInfo params={documentParams} noHeader={true} />
          </div>
        </Card>
        <Spin spinning={detailLoading}>
          <div className="contract-info" style={{ margin: 0 }}>
            <Card
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', marginRight: 15,marginLeft: 15, marginTop: 20 }}
            >
              <div
                className="contract-info-header"
                style={{ borderBottom: '1px solid rgb(236, 236, 236)', marginTop: '-20px' }}
              >
                <h3 style={{ display: 'inline', marginLeft: '8px', fontSize: '18px' }}>
                  {this.$t('my.contract.info')}
                </h3>
              </div>
              <div style={{ marginLeft: 15 }}>
                <Row gutter={24} className="info-items">
                  <Col span={2} className="label-tips">
                    {this.$t('common.baseInfo')}:
                  </Col>

                  <Col span={2} offset={1} className="item-label">
                    {this.$t('my.contract.contractCompany')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span title={headerData.companyName}>{headerData.companyName}</span>
                  </Col>

                  <Col span={2} className="item-label">
                    {this.$t('acp.contract.name')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span title={headerData.contractName}>{headerData.contractName}</span>
                  </Col>

                  <Col span={2} className="item-label">
                    {this.$t('my.contract.signDate')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span
                      title={
                        headerData.contractName
                          ? headerData.signDate
                            ? moment(new Date(headerData.signDate)).format('YYYY-MM-DD')
                            : '-'
                          : ''
                      }
                    >
                      {headerData.contractName
                        ? headerData.signDate
                          ? moment(new Date(headerData.signDate)).format('YYYY-MM-DD')
                          : '-'
                        : ''}
                    </span>
                  </Col>
                </Row>
                <Row gutter={25} className="info-items">
                  <Col span={2} className="label-tips">
                    {this.$t('my.contract.party.info')}:
                  </Col>

                  <Col span={2} offset={1} className="item-label">
                    {this.$t('my.contract.partner.category')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span title={headerData.partnerCategoryName}>
                      {headerData.partnerCategoryName}
                    </span>
                  </Col>
                  <Col span={2} className="item-label">
                    {this.$t('my.contract.partner')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span title={headerData.partnerName}>{headerData.partnerName}</span>
                  </Col>
                </Row>
                <Row gutter={24} className="info-items">
                  <Col span={2} className="label-tips">
                    {this.$t('supplier.management.otherInfo')}:
                  </Col>

                  <Col span={2} offset={1} className="item-label">
                    {this.$t('my.contract.responsible.department')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span title={headerData.unitName}>
                      {headerData.contractName
                        ? headerData.unitName
                          ? headerData.unitName
                          : '-'
                        : ''}
                    </span>
                  </Col>

                  <Col span={2} className="item-label">
                    {this.$t('my.contract.responsible.person')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span title={headerData.employeeId}>
                      {headerData.contractName
                        ? headerData.employee
                          ? headerData.employee.fullName
                          : '-'
                        : ''}
                    </span>
                  </Col>
                  <Col span={2} className="item-label">
                    {this.$t('budget.controlRule.effectiveDate')}:
                  </Col>
                  <Col span={5} className="item-value">
                    <span
                      title={
                        headerData.contractName
                          ? (headerData.startDate
                              ? moment(new Date(headerData.startDate)).format('YYYY-MM-DD')
                              : '-') +
                            ' ~ ' +
                            (headerData.endDate
                              ? moment(new Date(headerData.endDate)).format('YYYY-MM-DD')
                              : '-')
                          : ''
                      }
                    >
                      {headerData.contractName
                        ? (headerData.startDate
                            ? moment(new Date(headerData.startDate)).format('YYYY-MM-DD')
                            : '-') +
                          ' ~ ' +
                          (headerData.endDate
                            ? moment(new Date(headerData.endDate)).format('YYYY-MM-DD')
                            : '-')
                        : ''}
                    </span>
                  </Col>
                </Row>
              </div>
            </Card>
          </div>
        </Spin>
        <Spin spinning={planLoading}>
          <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', marginRight: 15,marginLeft: 15,marginTop:10 }}>
            <div className="pay-info" style={{ marginTop: '0px' }}>
              <h3
                className="info-header-title"
                style={{
                  borderBottom: '1px solid #ececec',
                  fontSize: 18,
                  margin: '-20px -20px 20px -8px',
                }}
              >
                {this.$t('acp.payment.info')}
              </h3>
              <Row
                gutter={24}
                className="pay-info-header"
                style={
                  headerData.status === 6001 ||
                  headerData.status === 6003 ||
                  headerData.status === 6002 ||
                  headerData.status === 1002
                    ? { marginTop: -20 }
                    : {}
                }
              >
                <Col span={12} />
                <Col span={12} className="header-tips" style={{ textAlign: 'right' }}>
                  <Breadcrumb style={{ marginBottom: '10px' }}>
                    <Breadcrumb.Item>
                      <span style={{color:"rgba(0, 0, 0, 0.60)"}}>{this.$t('common.amount')}:</span>&nbsp;<span style={{ color: 'Green'}}>
                        {' '}
                      {headerData.currency}&nbsp;{this.filterMoney(headerData.amount)}
                      </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                      <span style={{color:"rgba(0, 0, 0, 0.60)"}}>{this.$t('acp.function.amount')}</span><span style={{ color: 'Green' }}>
                        {headerData.currency}&nbsp;{this.filterMoney(headerData.amount)}
                      </span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </Col>
              </Row>
              <CustomTable
                ref={ref => (this.table = ref)}
                url={`${config.contractUrl}/api/contract/line/herder/${this.props.id}`}
                showNumber={true}
                pagination={{ pageSize: 5 }}
                columns={columns}
              />
            </div>
          </Card>
        </Spin>
        <div>
          <Card
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              marginRight: 15,marginLeft: 15,
              marginTop: 20,
              marginBottom: 50,
            }}
          >
            <ApproveHistory loading={false} infoData={approveHistory} />
          </Card>
        </div>
      </div>
    );
  }
}

ContractDetailCommon.propTypes = {
  id: PropTypes.any.isRequired, //显示数据
  isApprovePage: PropTypes.bool, //是否在审批页面
  getContractStatus: PropTypes.func, //确认合同信息状态
};

ContractDetailCommon.defaultProps = {
  isApprovePage: false,
  getContractStatus: () => {},
};
const wrappedContractDetailCommon = Form.create()(ContractDetailCommon);
export default connect(
  null,
  null,
  null,
  { withRef: true }
)(wrappedContractDetailCommon);
