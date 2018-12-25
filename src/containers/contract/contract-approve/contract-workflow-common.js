import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import contractService from 'containers/contract/contract-approve/contract.service';
import {
  Form,
  Tabs,
  Tag,
  Button,
  Card,
  Row,
  Col,
  Spin,
  Timeline,
  message,
  Popover,
  Popconfirm,
  Icon,
  Breadcrumb,
} from 'antd';

const TabPane = Tabs.TabPane;

import moment from 'moment';
import SlideFrame from 'components/Widget/slide-frame';
import NewPayPlan from 'containers/contract/my-contract/new-pay-plan';
import 'styles/contract/my-contract/contract-detail.scss';

import DocumentBasicInfo from 'components/Widget/document-basic-info';
import CustomTable from 'components/Widget/custom-table';
import config from 'config';
import ApproveHistory from 'components/Widget/Template/approve-history-work-flow';
import PropTypes from 'prop-types';

class ContractWorkflowDetailCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: false,
      planLoading: false,
      documentParams: {},
      historyLoading: false,
      topTapValue: 'contractInfo',
      headerData: {},
      contractEdit: false, //合同是否可编辑
      contractStatus: {
        //CANCEL: {label: this.$t({id: "my.contract.state.cancel"}/*已取消*/), state: 'default'},
        //FINISH: {label: this.$t({id: "my.contract.state.finish"}/*已完成*/), state: 'success'},
        //GENERATE: {label: this.$t({id: "my.contract.state.generate"}/*编辑中*/), state: 'processing'},
        //HOLD: {label: this.$t({id: "my.contract.state.hold"}/*暂挂*/), state: 'warning'},
        //SUBMITTED: {label: this.$t({id: "my.contract.state.submitted"}/*审批中*/), state: 'processing'},
        //REJECTED: {label: this.$t({id: "my.contract.state.rejected"}/*已驳回*/), state: 'error'},
        //CONFIRM: {label: this.$t({id: "my.contract.state.confirm"}/*已通过*/), state: 'success'},
        //WITHDRAWAL: {label: this.$t({id: "my.contract.state.withdrawal"}/*已撤回*/), state: 'warning'},
        6002: {
          label: this.$t({ id: 'my.contract.state.cancel' } /*已取消*/),
          state: 'default',
        },
        6003: {
          label: this.$t({ id: 'my.contract.state.finish' } /*已完成*/),
          state: 'success',
        },
        1001: {
          label: this.$t({ id: 'my.contract.state.generate' } /*编辑中*/),
          state: 'processing',
        },
        6001: { label: this.$t({ id: 'my.contract.state.hold' } /*暂挂*/), state: 'warning' },
        1002: {
          label: this.$t({ id: 'my.contract.state.submitted' } /*审批中*/),
          state: 'processing',
        },
        1005: {
          label: this.$t({ id: 'my.contract.state.rejected' } /*已驳回*/),
          state: 'error',
        },
        1004: {
          label: this.$t({ id: 'my.contract.state.confirm' } /*已通过*/),
          state: 'success',
        },
        1003: {
          label: this.$t({ id: 'my.contract.state.withdrawal' } /*已撤回*/),
          state: 'warning',
        },
      },
      subTabsList: [
        { label: this.$t({ id: 'my.contract.detail' } /*详情*/), key: 'DETAIL' },
        { label: this.$t({ id: 'my.contract.payment.plan' } /*付款计划*/), key: 'PLAN' },
      ],
      columns: [
        {
          title: this.$t({ id: 'my.contract.currency' } /*币种*/),
          dataIndex: 'currency',
          align: 'center',
          width: 90,
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
          render: (desc, record) => this.filterMoney(record.functionAmount),
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
                  {record.partnerName}
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
              <Popover content={value} overlayStyle={{ maxWidth: 300 }}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      showSlideFrame: false,
      slideFrameTitle: '',
      record: {}, //资金计划行信息
      historyData: [], //历史信息
    };
  }

  componentWillMount() {
    this.getInfo();
    //this.getPayList()
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
          }
        );
      })
      .catch(e => {
        message.error(
          this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  };

  //获取资金计划
  getPayList = () => {
    const { page, pageSize } = this.state;
    this.setState({ planLoading: true });
    contractService
      .getPayPlan(page, pageSize, this.props.id)
      .then(res => {
        this.setState({
          data: res.data,
          planLoading: false,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            current: page + 1,
            onChange: this.onChangePaper,
          },
        });
      })
      .catch(() => {
        this.setState({ planLoading: false });
        message.error(this.$t({ id: 'my.contract.pay.plan.error' } /*付款计划获取失败*/));
      });
  };

  //获取合同历史
  getHistory = () => {
    this.setState({ historyLoading: true });
    contractService
      .getContractWorkflowHistory(
        this.state.headerData.documentType,
        this.state.headerData.documentOid
      )
      .then(res => {
        if (res.status === 200) {
          this.setState({
            historyLoading: false,
            historyData: res.data,
          });
        }
      })
      .catch(() => {
        this.setState({ historyLoading: false });
        message.error(
          this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  };

  //资金计划表格页码切换
  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getPayList();
      });
    }
  };

  //合同信息／合同历史 切换
  handleTabsChange = tab => {
    this.setState({ topTapValue: tab }, () => {
      this.state.topTapValue === 'contractHistory' && this.getHistory();
    });
  };

  //合同信息内容渲染格式
  renderList = (title, value) => {
    return (
      <div className="list-info">
        <span>{title}：</span>
        <span className="content">{value}</span>
      </div>
    );
  };

  //侧滑
  showSlide = flag => {
    this.setState({ showSlideFrame: flag });
  };

  //关闭侧滑
  handleCloseSlide = params => {
    this.setState(
      {
        showSlideFrame: false,
      },
      () => {
        if (params) {
          this.getPayList();
          this.getInfo();
        }
      }
    );
  };

  //添加资金计划行
  addItem = () => {
    this.setState(
      {
        record: {},
        slideFrameTitle: this.$t({ id: 'my.contract.new.pay.plan' } /*新增付款计划*/),
      },
      () => {
        this.showSlide(true);
      }
    );
  };

  //编辑资金计划行
  editItem = (e, record) => {
    e.preventDefault();
    this.setState({
      record,
      showSlideFrame: true,
      slideFrameTitle: this.$t({ id: 'my.contract.edit.pay.plan' } /*编辑付款计划*/),
    });
  };

  //删除资金计划行
  deleteItem = (e, record) => {
    e.preventDefault();
    this.setState({ planLoading: true });
    contractService
      .deletePayPlan(record.id)
      .then(() => {
        message.success(this.$t({ id: 'common.delete.success' }, { name: '' } /*{name} 删除成功*/));
        this.getPayList();
        this.getInfo();
      })
      .catch(e => {
        this.setState({ planLoading: false });
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  //撤回
  contractRecall = () => {
    if (this.state.headerData.formOid) {
      // 走工作流
      const { headerData } = this.state;
      let params = {
        entities: [
          {
            entityOid: headerData.documentOid,
            entityType: headerData.documentType,
          },
        ],
      };
      contractService
        .recallWorkflowContract(params)
        .then(res => {
          if (res.status === 200) {
            message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
            this.getInfo();
          }
        })
        .catch(e => {
          message.error(
            `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
          );
        });
    } else {
      contractService
        .recallContract(this.props.id)
        .then(res => {
          if (res.status === 200) {
            message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
            this.getInfo();
          }
        })
        .catch(e => {
          message.error(
            `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
          );
        });
    }
  };

  //暂挂
  contractHold = () => {
    contractService
      .holdContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  //取消暂挂
  contractCancelHold = () => {
    contractService
      .unHoldContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  //取消
  contractCancel = () => {
    contractService
      .cancelContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  //完成
  contractFinish = () => {
    contractService
      .finishContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  render() {
    const {
      btnVisible,
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
          style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',marginRight: 15,marginLeft: 15, marginTop: 20 }}
        >
          <div style={{ paddingTop: 0, marginTop: '-20px' }}>
            <DocumentBasicInfo params={documentParams} noHeader={true} />
          </div>
        </Card>
        <Spin spinning={detailLoading}>
          <div className="contract-info" style={{ margin: '0' }}>
            <Card
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',marginRight: 15,marginLeft: 15, marginTop: 20 }}
            >
              <div
                className="contract-info-header"
                style={{
                  borderBottom: '1px solid rgb(236, 236, 236)',
                  marginTop: '-20px',
                  marginLeft: '-10px',
                }}
              >
                <h3 style={{ display: 'inline', marginLeft: '20px', fontSize: '18px' }}>
                  {this.$t('my.create.contract.info')}
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
                <Col span={14} />
                <Col span={10} className="header-tips" style={{ textAlign: 'right' }}>
                  <Breadcrumb style={{ marginBottom: '10px' }}>
                    <Breadcrumb.Item>
                      <span style={{color:"rgba(0, 0, 0, 0.60)"}}>{this.$t('common.amount')}:</span>&nbsp;<span style={{ color: 'Green'}}>
                        {' '}
                      {headerData.currency}&nbsp;{this.filterMoney(headerData.amount)}
                      </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                      <span style={{color:"rgba(0, 0, 0, 0.60)"}}>{this.$t('acp.function.amount')}</span><span style={{ color: 'Green' }}>
                        {this.props.company.baseCurrency}&nbsp;{this.filterMoney(headerData.functionAmount)}
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
        <div style={{ margin: '0px 0 60px 0' }}>
          <Card
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              marginRight: 15,marginLeft: 15,
              marginTop: 20,
              marginBottom: 50,
            }}
          >
            <ApproveHistory loading={false} infoData={historyData} />
          </Card>
        </div>
      </div>
    );
  }
}

ContractWorkflowDetailCommon.propTypes = {
  id: PropTypes.any.isRequired, //显示数据
  isApprovePage: PropTypes.bool, //是否在审批页面
  getContractStatus: PropTypes.func, //确认合同信息状态
};

ContractWorkflowDetailCommon.defaultProps = {
  isApprovePage: false,
  getContractStatus: () => {},
};
function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}
const wrappedContractWorkflowDetailCommon = Form.create()(ContractWorkflowDetailCommon);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedContractWorkflowDetailCommon);
