import React from 'react';
import menuRoute from 'routes/menuRoute';
import contractService from 'containers/approve/contract/contract.service';
import {
  Form,
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
} from 'antd';
const TabPane = Tabs.TabPane;

import moment from 'moment';
import SlideFrame from 'components/slide-frame';
import NewPayPlan from 'containers/contract/my-contract/new-pay-plan';
import ApproveHistoryWorkFlow from 'containers/financial-management/reimburse-review/approve-history-work-flow';

import 'styles/contract/my-contract/contract-detail.scss';

import { formatMessage, messages } from 'share/common';
import DocumentBasicInfo from 'components/Template/document-basic-info';
import CustomTable from 'components/custom-table';
import config from 'config';
import ApproveHistory from 'components/Template/approve-history-work-flow';

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
        //CANCEL: {label: formatMessage({id: "my.contract.state.cancel"}/*已取消*/), state: 'default'},
        //FINISH: {label: formatMessage({id: "my.contract.state.finish"}/*已完成*/), state: 'success'},
        //GENERATE: {label: formatMessage({id: "my.contract.state.generate"}/*编辑中*/), state: 'processing'},
        //HOLD: {label: formatMessage({id: "my.contract.state.hold"}/*暂挂*/), state: 'warning'},
        //SUBMITTED: {label: formatMessage({id: "my.contract.state.submitted"}/*审批中*/), state: 'processing'},
        //REJECTED: {label: formatMessage({id: "my.contract.state.rejected"}/*已驳回*/), state: 'error'},
        //CONFIRM: {label: formatMessage({id: "my.contract.state.confirm"}/*已通过*/), state: 'success'},
        //WITHDRAWAL: {label: formatMessage({id: "my.contract.state.withdrawal"}/*已撤回*/), state: 'warning'},
        6002: {
          label: formatMessage({ id: 'my.contract.state.cancel' } /*已取消*/),
          state: 'default',
        },
        6003: {
          label: formatMessage({ id: 'my.contract.state.finish' } /*已完成*/),
          state: 'success',
        },
        1001: {
          label: formatMessage({ id: 'my.contract.state.generate' } /*编辑中*/),
          state: 'processing',
        },
        6001: { label: formatMessage({ id: 'my.contract.state.hold' } /*暂挂*/), state: 'warning' },
        1002: {
          label: formatMessage({ id: 'my.contract.state.submitted' } /*审批中*/),
          state: 'processing',
        },
        1005: {
          label: formatMessage({ id: 'my.contract.state.rejected' } /*已驳回*/),
          state: 'error',
        },
        1004: {
          label: formatMessage({ id: 'my.contract.state.confirm' } /*已通过*/),
          state: 'success',
        },
        1003: {
          label: formatMessage({ id: 'my.contract.state.withdrawal' } /*已撤回*/),
          state: 'warning',
        },
      },
      subTabsList: [
        { label: formatMessage({ id: 'my.contract.detail' } /*详情*/), key: 'DETAIL' },
        { label: formatMessage({ id: 'my.contract.payment.plan' } /*付款计划*/), key: 'PLAN' },
      ],
      columns: [
        {
          title: formatMessage({ id: 'my.contract.currency' } /*币种*/),
          dataIndex: 'currency',
          align: 'center',
        },
        {
          title: formatMessage({ id: 'my.contract.plan.amount' } /*计划金额*/),
          dataIndex: 'amount',
          align: 'center',
          render: this.filterMoney,
        },
        {
          title: formatMessage({ id: 'my.contract.partner.category' } /*合同方类型*/),
          align: 'center',
          dataIndex: 'partnerCategoryName',
        },
        {
          title: formatMessage({ id: 'my.contract.partner' } /*合同方*/),
          align: 'center',
          dataIndex: 'partnerName',
        },
        {
          title: formatMessage({ id: 'my.contract.plan.pay.date' } /*计划付款日期*/),
          align: 'center',
          dataIndex: 'dueDate',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: formatMessage({ id: 'common.remark' } /*备注*/),
          align: 'center',
          dataIndex: 'remark',
          render: value => {
            return value ? (
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>
                {value}
              </Popover>
            ) : (
              '-'
            );
          },
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
      EditContract: menuRoute.getRouteItem('edit-contract', 'key'), //编辑合同
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
            title: formatMessage({ id: 'common.operation' } /*操作*/),
            dataIndex: 'id',
            width: '10%',
            render: (text, record) => (
              <span>
                <a onClick={e => this.editItem(e, record)}>
                  {formatMessage({ id: 'common.edit' } /*编辑*/)}
                </a>
                <span className="ant-divider" />
                <Popconfirm
                  title={formatMessage({ id: 'common.confirm.delete' } /*确定要删除吗？*/)}
                  onConfirm={e => this.deleteItem(e, record)}
                >
                  <a>{formatMessage({ id: 'common.delete' } /*删除*/)}</a>
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
            { label: messages('my.contract.number'), value: response.data.contractNumber },
            {
              label: messages('common.applicant'),
              value:
                response.data.created &&
                response.data.created.fullName + '-' + response.data.created.employeeId,
            },
            { label: messages('my.contract.category'), value: response.data.contractCategoryName },
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
          formatMessage({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
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
        message.error(formatMessage({ id: 'my.contract.pay.plan.error' } /*付款计划获取失败*/));
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
          formatMessage({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
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

  //编辑
  edit = () => {
    this.context.router.push(this.state.EditContract.url.replace(':id', this.props.id));
  };

  //添加资金计划行
  addItem = () => {
    this.setState(
      {
        record: {},
        slideFrameTitle: formatMessage({ id: 'my.contract.new.pay.plan' } /*新增付款计划*/),
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
      slideFrameTitle: formatMessage({ id: 'my.contract.edit.pay.plan' } /*编辑付款计划*/),
    });
  };

  //删除资金计划行
  deleteItem = (e, record) => {
    e.preventDefault();
    this.setState({ planLoading: true });
    contractService
      .deletePayPlan(record.id)
      .then(() => {
        message.success(
          formatMessage({ id: 'common.delete.success' }, { name: '' } /*{name} 删除成功*/)
        );
        this.getPayList();
        this.getInfo();
      })
      .catch(e => {
        this.setState({ planLoading: false });
        message.error(
          `${formatMessage({ id: 'common.operate.filed' } /*操作失败*/)}，${
            e.response.data.message
          }`
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
            entityOID: headerData.documentOid,
            entityType: headerData.documentType,
          },
        ],
      };
      contractService
        .recallWorkflowContract(params)
        .then(res => {
          if (res.status === 200) {
            message.success(formatMessage({ id: 'common.operate.success' } /*操作成功*/));
            this.getInfo();
          }
        })
        .catch(e => {
          message.error(
            `${formatMessage({ id: 'common.operate.filed' } /*操作失败*/)}，${
              e.response.data.message
            }`
          );
        });
    } else {
      contractService
        .recallContract(this.props.id)
        .then(res => {
          if (res.status === 200) {
            message.success(formatMessage({ id: 'common.operate.success' } /*操作成功*/));
            this.getInfo();
          }
        })
        .catch(e => {
          message.error(
            `${formatMessage({ id: 'common.operate.filed' } /*操作失败*/)}，${
              e.response.data.message
            }`
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
          message.success(formatMessage({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${formatMessage({ id: 'common.operate.filed' } /*操作失败*/)}，${
            e.response.data.message
          }`
        );
      });
  };

  //取消暂挂
  contractCancelHold = () => {
    contractService
      .unHoldContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(formatMessage({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${formatMessage({ id: 'common.operate.filed' } /*操作失败*/)}，${
            e.response.data.message
          }`
        );
      });
  };

  //取消
  contractCancel = () => {
    contractService
      .cancelContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(formatMessage({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${formatMessage({ id: 'common.operate.filed' } /*操作失败*/)}，${
            e.response.data.message
          }`
        );
      });
  };

  //完成
  contractFinish = () => {
    contractService
      .finishContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(formatMessage({ id: 'common.operate.success' } /*操作成功*/));
          this.getInfo();
        }
      })
      .catch(e => {
        message.error(
          `${formatMessage({ id: 'common.operate.filed' } /*操作失败*/)}，${
            e.response.data.message
          }`
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
        <div className="document-basic-info" style={{}}>
          <DocumentBasicInfo params={documentParams} noHeader={true} />
        </div>
        <Spin spinning={detailLoading}>
          <div className="contract-info" style={{ margin: '40px 0 5px 0' }}>
            <div
              className="contract-info-header"
              style={{ borderBottom: '1px solid rgb(236, 236, 236)' }}
            >
              <h3 style={{ display: 'inline', marginLeft: '20px', fontSize: '18px' }}>
                {messages('my.create.contract.info')}
              </h3>
            </div>
            <div style={{ marginLeft: 15 }}>
              <Row gutter={24} className="info-items">
                <Col span={2} className="label-tips">
                  {messages('common.baseInfo')}:
                </Col>

                <Col span={2} offset={1} className="item-label">
                  {messages('my.contract.contractCompany')}:
                </Col>
                <Col span={5} className="item-value">
                  <span title={headerData.companyName}>{headerData.companyName}</span>
                </Col>

                <Col span={2} className="item-label">
                  {messages('acp.contract.name')}:
                </Col>
                <Col span={5} className="item-value">
                  <span title={headerData.contractName}>{headerData.contractName}</span>
                </Col>

                <Col span={2} className="item-label">
                  {messages('my.contract.signDate')}:
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
                  {messages('my.contract.party.info')}:
                </Col>

                <Col span={2} offset={1} className="item-label">
                  {messages('my.contract.partner.category')}:
                </Col>
                <Col span={5} className="item-value">
                  <span title={headerData.partnerCategoryName}>
                    {headerData.partnerCategoryName}
                  </span>
                </Col>
                <Col span={2} className="item-label">
                  {messages('my.contract.partner')}:
                </Col>
                <Col span={5} className="item-value">
                  <span title={headerData.partnerName}>{headerData.partnerName}</span>
                </Col>
              </Row>
              <Row gutter={24} className="info-items">
                <Col span={2} className="label-tips">
                  {messages('supplier.management.otherInfo')}:
                </Col>

                <Col span={2} offset={1} className="item-label">
                  {messages('my.contract.responsible.department')}:
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
                  {messages('my.contract.responsible.person')}:
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
                  {messages('budget.controlRule.effectiveDate')}:
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
          </div>
        </Spin>
        <Spin spinning={planLoading}>
          <div className="pay-info" style={{ marginLeft: 0 }}>
            <h3
              className="info-header-title"
              style={{
                borderBottom: '1px solid #ececec',
                fontSize: 18,
                padding: '20px 20px 10px',
                margin: '-20px -20px 20px',
              }}
            >
              {messages('acp.payment.info')}
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
              <Col span={18} />
              <Col span={6} className="header-tips" style={{ textAlign: 'right' }}>
                <Breadcrumb style={{ marginBottom: '10px' }}>
                  <Breadcrumb.Item>
                    {messages('common.amount')}:&nbsp;<span style={{ color: 'Green' }}>
                      {' '}
                      {headerData.currency}&nbsp;{this.filterMoney(headerData.amount)}
                    </span>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    {messages('acp.function.amount')}:<span style={{ color: 'Green' }}>
                      {' '}
                      {headerData.currency}&nbsp;{this.filterMoney(headerData.functionAmount)}
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
        </Spin>
        <div style={{ margin: '20px 0 60px 0' }}>
          <ApproveHistory loading={false} infoData={historyData} />
        </div>
      </div>
    );
  }
}

ContractWorkflowDetailCommon.propTypes = {
  id: React.PropTypes.any.isRequired, //显示数据
  isApprovePage: React.PropTypes.bool, //是否在审批页面
  getContractStatus: React.PropTypes.func, //确认合同信息状态
};

ContractWorkflowDetailCommon.defaultProps = {
  isApprovePage: false,
  getContractStatus: () => {},
};

ContractWorkflowDetailCommon.contextTypes = {
  router: React.PropTypes.object,
};

const wrappedContractWorkflowDetailCommon = Form.create()(ContractWorkflowDetailCommon);

export default wrappedContractWorkflowDetailCommon;
