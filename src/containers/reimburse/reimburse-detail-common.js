import React from 'react';
import menuRoute from 'routes/menuRoute';
import {
  Form,
  Tabs,
  Button,
  Menu,
  Radio,
  Dropdown,
  Row,
  Col,
  Spin,
  Table,
  Timeline,
  message,
  Popover,
  Popconfirm,
  Icon,
  Select,
} from 'antd';
const TabPane = Tabs.TabPane;

const RadioGroup = Radio.Group;
import moment from 'moment';
import SlideFrame from 'components/slide-frame';
import 'styles/reimburse/reimburse-common.scss';
import 'styles/contract/my-contract/contract-detail.scss';
import CostDetail from 'containers/reimburse/cost-detail';
import PayInfo from 'containers/reimburse/pay-info';
import SelectCostType from 'containers/reimburse/select-cost-type';
import NewExpense from 'containers/reimburse/new-expense';
import DetailExpense from 'containers/reimburse/expense-detail';
import NewPayPlan from 'containers/reimburse/new-pay-plan';
import reimburseService from 'containers/reimburse/reimburse.service';
import ListSelector from 'containers/reimburse/list-selector';
import ApproveHistory from 'components/Template/approve-history-work-flow';
import Invoice from 'containers/reimburse/invoice';
import DocumentBasicInfo from 'components/Template/document-basic-info';
import VoucherInfo from 'containers/reimburse/voucher-info';
import { formatMessage } from 'share/common';

class ContractDetailCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: false,
      planLoading: false,
      topTapValue: 'contractInfo',
      headerData: {},
      contractEdit: false, //合同是否可编辑
      contractStatus: {
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
        2004: { label: '支付成功', state: 'success' },
        2003: { label: '支付中', state: 'processing' },
        2002: { label: '审核通过', state: 'success' },
      },
      subTabsList: [{ label: formatMessage({ id: 'my.contract.detail' } /*详情*/), key: 'DETAIL' }],
      infoList: {
        title: '报账单',
        headItems: [
          { label: '单据编号', key: 'expAdjustHeaderNumber' },
          {
            label: '申请日期',
            key: 'adjustDate',
            render: item => moment(new Date(item)).format('YYYY-MM-DD'),
          },
          { label: '创建人', key: 'employeeName' },
        ],
        items: [
          { label: '申请人', key: 'employeeName' },
          { label: '公司', key: 'companyName' },
          { label: '部门', key: 'unitName' },
          { label: '调整类型', key: 'expAdjustTypeName' },
          { label: '备注', key: 'description' },
          { label: '附件信息', key: '6', isInline: true },
        ],
      },
      columns: [
        {
          title: formatMessage({ id: 'common.sequence' } /*序号*/),
          dataIndex: 'index',
          render: (value, record, index) => this.state.pageSize * this.state.page + index + 1,
        },
        { title: formatMessage({ id: 'my.contract.currency' } /*币种*/), dataIndex: 'currency' },
        {
          title: formatMessage({ id: 'my.contract.plan.amount' } /*计划金额*/),
          dataIndex: 'amount',
          render: this.filterMoney,
        },
        {
          title: formatMessage({ id: 'my.contract.partner.category' } /*合同方类型*/),
          dataIndex: 'partnerCategoryName',
        },
        {
          title: formatMessage({ id: 'my.contract.partner' } /*合同方*/),
          dataIndex: 'partnerName',
        },
        {
          title: formatMessage({ id: 'my.contract.plan.pay.date' } /*计划付款日期*/),
          dataIndex: 'dueDate',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: formatMessage({ id: 'common.remark' } /*备注*/),
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
      isCopy: false,
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      visible: false,
      writeoffShow: false,
      payPlanVisible: false,
      showSlideFrame: false,
      isLoadPayData: false,
      isLoadCostData: false,
      slideFrameTitle: '',
      costRecord: {},
      payRecord: {},
      record: {}, //资金计划行信息
      historyData: [], //历史信息
      defaultApportion: {},
      editReimburePage: menuRoute.getRouteItem('edit-reimburse', 'key'),
      myReimburse: menuRoute.getRouteItem('my-reimburse', 'key'), //我的报账单
      flag: true,
      showInvoices: false,
      invoicesLoading: false,
      approveHistory: [],
      historyLoading: false,
      detailVisible: false,
      showInvoiceDetail: false,
      invoiceData: {},
      remburseInfo: {},
      tabIndex: '1',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.headerData != this.props.headerData) {
      this.setDocumentInfo(nextProps);
    }

    if (this.state.flag && nextProps.id) {
      this.setState({ flag: false }, () => {
        reimburseService
          .getDefaultApportion(nextProps.id)
          .then(res => {
            this.setState({ defaultApportion: res.data });
          })
          .catch(err => {
            message.error('获取默认分摊信息失败！');
          });
      });
    }

    if (nextProps.headerData.expenseReportOID && !this.props.headerData.expenseReportOID) {
      this.setState({ historyLoading: true });
      reimburseService
        .getReportsHistory(nextProps.headerData.expenseReportOID)
        .then(res => {
          this.setState({ approveHistory: res.data, historyLoading: false });
        })
        .catch(err => {
          message.error('获取审批历史失败！');
        });
    }
  }

  setDocumentInfo = nextProps => {
    let list = [];
    nextProps.headerData.customFormValues &&
      nextProps.headerData.customFormValues.map(o => {
        if (
          o.messageKey != 'select_company' &&
          o.messageKey != 'select_department' &&
          o.messageKey != 'remark' &&
          o.messageKey != 'currency_code'
        ) {
          list.push({ label: o.fieldName, value: o.showValue });
        }
      });
    this.setState({
      remburseInfo: {
        businessCode: nextProps.headerData.businessCode,
        createdDate: nextProps.headerData.reportDate,
        formName: nextProps.headerData.formName,
        createByName: nextProps.headerData.createByName,
        totalAmount: nextProps.headerData.totalAmount,
        statusCode: nextProps.headerData.reportStatus,
        currencyCode: nextProps.headerData.currencyCode,
        remark: this.getRemark(nextProps.headerData),
        infoList: [
          { label: '申请人', value: nextProps.headerData.applicationName },
          { label: '公司', value: nextProps.headerData.createByCompanyName },
          { label: '部门', value: nextProps.headerData.createByUnitName },
          nextProps.headerData.contractHeaderId
            ? {
                label: '合同',
                value: nextProps.headerData.contractHeaderLineDTO.contractNumber,
                linkId: nextProps.headerData.contractHeaderId,
              }
            : null,
        ],
        customList: list,
      },
    });
  };

  //获取付款列表
  getPayList = flag => {
    this.setState({ payPlanVisible: false }, () => {
      if (flag) {
        this.setState({ isLoadPayData: !this.state.isLoadPayData });
        this.props.getInfo && this.props.getInfo();
      }
    });
  };

  //获取费用列表
  getCostList = flag => {
    this.setState({ visible: false }, () => {
      if (flag) {
        this.setState({ isLoadCostData: !this.state.isLoadCostData });
        this.getPayList(true);
        this.props.getInfo && this.props.getInfo();
      }
    });
  };

  //刷新数据
  refresh = () => {
    this.setState({ isLoadCostData: !this.state.isLoadCostData });
    this.getPayList(true);
    this.props.getInfo && this.props.getInfo();
  };

  renderList = (title, value) => {
    return (
      <Row
        style={{ fontSize: '12px', lineHeight: '32px', overflow: 'hidden' }}
        className="list-info"
      >
        <Col span={8}>
          <Row>
            <Col
              style={{
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              span={20}
            >
              <span title={title}>{title}</span>
            </Col>
            <Col span={4} style={{ textAlign: 'center' }}>
              :
            </Col>
          </Row>
        </Col>
        <Col
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          span={16}
        >
          <span title={title} className="content">
            {value}
          </span>
        </Col>
      </Row>
    );
  };

  //取消
  contractCancel = () => {
    contractService
      .cancelContract(this.props.id)
      .then(res => {
        if (res.status === 200) {
          message.success(formatMessage({ id: 'common.operate.success' } /*操作成功*/));
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

  //新建费用按钮事件
  createCost = () => {
    this.setState({ visible: true, costRecord: {}, isCopy: false });
  };

  //新建付款行
  addPayPlan = () => {
    this.setState({ payPlanVisible: true, payRecord: {} });
  };

  //编辑付款行
  payEdit = record => {
    this.setState({ payPlanVisible: true, payRecord: record });
  };

  //编辑费用行
  costEdit = record => {
    this.setState({ visible: true, costRecord: record, isCopy: false });
  };

  //费用行详情
  costDetail = record => {
    this.setState({ detailVisible: true, costRecord: record });
  };

  //编辑报账单
  edit = () => {
    let path = this.state.editReimburePage.url.replace(':id', this.props.headerData.id);
    this.context.router.push(path);
  };

  //删除费用行
  deleteCost = record => {
    reimburseService
      .deleteCostDetail(record.id)
      .then(res => {
        message.success('删除成功！');
        this.getCostList(true);
      })
      .catch(err => {
        message.error('删除失败！');
      });
  };

  //复制费用行
  costCopy = record => {
    this.setState({ visible: true, costRecord: record, isCopy: true });
  };

  //删除付款行
  deletePay = record => {
    reimburseService
      .deletePayDetail(record.id)
      .then(res => {
        message.success('删除成功！');
        this.getPayList(true);
      })
      .catch(err => {
        message.error('删除失败！');
      });
  };

  //跳转到合同详情
  contractDetail = () => {
    let url = menuRoute.getRouteItem('contract-detail', 'key');
    window.open(
      url.url.replace(':id', this.props.headerData.contractHeaderId).replace(':from', 'reimburse'),
      '_blank'
    );
  };

  //选取报账单后
  handleListOk = values => {
    this.setState({ invoicesLoading: true });
    let data = {
      expenseReportId: this.props.id,
      invoices: [],
    };

    values.result &&
      values.result.map(item => {
        data.invoices.push(item.invoiceOID);
      });

    reimburseService
      .import(data)
      .then(res => {
        message.success('导入费用成功！');
        this.setState({ showInvoices: false, invoicesLoading: false });
        this.getCostList(true);
      })
      .catch(res => {
        message.error('导入失败！');
      });
  };

  //撤回
  withdraw = () => {
    let params = {
      entities: [
        {
          entityOID: this.props.headerData.expenseReportOID,
          entityType: 801001,
        },
      ],
    };
    reimburseService
      .withdraw(params)
      .then(res => {
        message.success('撤回成功！');
        this.onCancel();
      })
      .catch(err => {
        message.error('撤回失败：' + err.response.data.message);
      });
  };

  //获得备注
  getRemark = headerData => {
    if (!headerData.customFormValues) return '';
    var data = headerData.customFormValues.find(o => o.messageKey == 'remark');
    if (data) {
      return data.value;
    } else {
      return '';
    }
  };

  //取消
  onCancel = () => {
    this.context.router.push(this.state.myReimburse.url);
  };

  //显示发票
  showInvoiceDetail = record => {
    this.setState({ showInvoiceDetail: true, invoiceData: record.digitalInvoice });
  };

  //切换tab
  tabChange = value => {
    this.setState({ tabIndex: value });
  };

  render() {
    const { headerData } = this.props;
    const {
      detailLoading,
      showInvoices,
      isLoadCostData,
      isLoadPayData,
      writeoffShow,
      visible,
      planLoading,
      historyLoading,
      contractEdit,
      topTapValue,
      subTabsList,
      pagination,
      columns,
      data,
      showSlideFrame,
      contractStatus,
      record,
      slideFrameTitle,
      historyData,
      detailVisible,
    } = this.state;
    let isEdit = null;
    if (
      headerData.reportStatus == 1001 ||
      headerData.reportStatus == 1003 ||
      headerData.reportStatus == 1005
    ) {
      isEdit = true;
    } else if (
      headerData.reportStatus == 1002 ||
      headerData.reportStatus == 1004 ||
      headerData.reportStatus == 2002 ||
      headerData.reportStatus == 2004
    ) {
      isEdit = false;
    }

    let subContent = {};
    subContent.DETAIL = (
      <div>
        <div className="tab-container" style={{ marginBottom: 20 }}>
          <h3 style={{ padding: '0 0 10px', margin: 0 }} className="sub-header-title">
            费用信息
          </h3>
          <div style={{ lineHeight: '32px', height: '32px' }} className="table-header">
            {isEdit && (
              <div style={{ float: 'left' }} className="buttonGroup">
                <Button onClick={this.createCost} type="primary">
                  新建费用
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ showInvoices: true });
                  }}
                  style={{ marginLeft: 12 }}
                >
                  导入费用
                </Button>
                {/* <Button style={{ marginLeft: 12 }}>录入发票</Button> */}
              </div>
            )}
            <div style={{ float: 'right' }}>
              <span>
                金额总计：<span style={{ color: 'green' }}>
                  {this.props.headerData.currencyCode}{' '}
                  {this.filterMoney(this.props.headerData.totalAmount)}
                </span>
              </span>
            </div>
          </div>
          <CostDetail
            showInvoiceDetail={this.showInvoiceDetail}
            costDetail={this.costDetail}
            disabled={isEdit === false}
            deleteCost={this.deleteCost}
            costCopy={this.costCopy}
            costEdit={this.costEdit}
            flag={isLoadCostData}
            headerData={this.props.headerData}
          />
        </div>

        <PayInfo
          ref="payInfo"
          flag={isLoadPayData}
          headerData={headerData}
          deletePay={this.deletePay}
          addPayPlan={this.addPayPlan}
          payEdit={this.payEdit}
          summaryView={headerData.summaryView || {}}
          writeOffOk={this.getPayList}
          disabled={isEdit === false}
        />
        <div style={{ padding: '0', paddingBottom: 70 }}>
          <ApproveHistory loading={false} infoData={this.state.approveHistory} />
        </div>
      </div>
    );
    return (
      <div className="contract-detail-common reimburse">
        <div
          className="top-info"
          style={{ padding: '24px 20px 20px 20px', backgroundColor: '#fff' }}
        >
          <Tabs forceRender defaultActiveKey="1" onChange={this.tabChange}>
            <TabPane tab="单据信息" key="1">
              <DocumentBasicInfo params={this.state.remburseInfo} values={{}}>
                {isEdit && (
                  <Button type="primary" onClick={this.edit}>
                    编辑
                  </Button>
                )}
                {headerData.reportStatus === 1002 && (
                  <Button type="primary" onClick={this.withdraw}>
                    撤回
                  </Button>
                )}
              </DocumentBasicInfo>
            </TabPane>
            {this.props.headerData.reportStatus === 1006 && (
              <TabPane tab="凭证信息" key="2">
                <VoucherInfo voucherParams={this.props.headerData} />
              </TabPane>
            )}
          </Tabs>
        </div>

        <div style={{ display: this.state.tabIndex == '1' ? 'block' : 'none' }}>
          {subContent['DETAIL']}
        </div>

        <SlideFrame
          title={slideFrameTitle}
          show={showSlideFrame}
          content={NewPayPlan}
          params={{
            id: this.props.id,
            currency: headerData.currency,
            partnerCategory: headerData.partnerCategory,
            companyId: headerData.companyId,
            partnerId: headerData.partnerId,
            partnerName: headerData.partnerName,
            record,
          }}
          onClose={() => this.showSlide(false)}
          afterClose={this.handleCloseSlide}
        />

        <SlideFrame
          show={visible}
          title="新建费用"
          width="900px"
          params={{
            visible: this.state.visible,
            record: this.state.costRecord,
            headerId: this.props.id,
            headerData: this.props.headerData,
            defaultApportion: this.state.defaultApportion,
            isCopy: this.state.isCopy,
            refresh: this.refresh,
          }}
          content={NewExpense}
          onClose={() => this.setState({ visible: false })}
          afterClose={this.getCostList}
        />

        <SlideFrame
          show={detailVisible}
          title="费用详情"
          params={{
            visible: this.state.detailVisible,
            record: this.state.costRecord,
            headerId: this.props.id,
            headerData: this.props.headerData,
            defaultApportion: this.state.defaultApportion,
            isCopy: this.state.isCopy,
            refresh: this.refresh,
          }}
          content={DetailExpense}
          width="800px"
          onClose={() => this.setState({ detailVisible: false })}
          afterClose={this.getCostList}
        />

        <SlideFrame
          show={this.state.payPlanVisible}
          title={this.state.payRecord.id ? '编辑付款信息' : '新建付款信息'}
          params={{
            visible: this.state.payPlanVisible,
            record: this.state.payRecord,
            headerData: this.props.headerData,
          }}
          content={NewPayPlan}
          onClose={() => this.setState({ payPlanVisible: false })}
          afterClose={this.getPayList}
        />

        <ListSelector
          single={false}
          visible={showInvoices}
          type="select_invoices"
          onCancel={() => {
            this.setState({ showInvoices: false });
          }}
          onOk={this.handleListOk}
          extraParams={{ headerId: this.props.headerData.id }}
          saveLoading={this.state.invoicesLoading}
        />
        <Invoice
          cancel={() => {
            this.setState({ showInvoiceDetail: false });
          }}
          invoice={this.state.invoiceData || {}}
          visible={this.state.showInvoiceDetail}
        />
      </div>
    );
  }
}

ContractDetailCommon.propTypes = {
  id: React.PropTypes.any.isRequired, //显示数据
  isApprovePage: React.PropTypes.bool, //是否在审批页面
  getContractStatus: React.PropTypes.func, //确认合同信息状态
};

ContractDetailCommon.defaultProps = {
  isApprovePage: false,
  getContractStatus: () => {},
};

ContractDetailCommon.contextTypes = {
  router: React.PropTypes.object,
};

const wrappedContractDetailCommon = Form.create()(ContractDetailCommon);

export default wrappedContractDetailCommon;
