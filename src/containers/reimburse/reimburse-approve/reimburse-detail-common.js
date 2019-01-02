import React from 'react'
import { Form, Tabs, Button, Menu, Radio, Dropdown, Row, Col, Spin, Timeline, message, Popover, Popconfirm, Icon, Select, Card } from 'antd'
const TabPane = Tabs.TabPane;
import Table from 'widget/table'
const RadioGroup = Radio.Group;
import moment from 'moment'
import SlideFrame from 'widget/slide-frame'

import 'styles/contract/my-contract/contract-detail.scss'
import CostDetail from "containers/reimburse/my-reimburse/cost-detail"
import PayInfo from "containers/reimburse/my-reimburse/pay-info"
import SelectCostType from "containers/reimburse/my-reimburse/select-cost-type"
import NewExpense from "containers/reimburse/my-reimburse/new-expense"
import DetailExpense from "containers/reimburse/my-reimburse/expense-detail"
import NewPayPlan from "containers/reimburse/my-reimburse/new-pay-plan"
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import ListSelector from 'containers/reimburse/my-reimburse/list-selector'
import ApproveHistory from "containers/reimburse/reimburse-review/approve-history-work-flow"
import DocumentBasicInfo from 'widget/Template/document-basic-info'
import PropTypes from 'prop-types'
class ContractDetailCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: false,
      planLoading: false,
      historyLoading: false,
      topTapValue: 'contractInfo',
      headerData: {},
      contractEdit: false, //合同是否可编辑
      contractStatus: {
        6002: { label: this.$t({ id: "my.contract.state.cancel" }/*已取消*/), state: 'default' },
        6003: { label: this.$t({ id: "my.contract.state.finish" }/*已完成*/), state: 'success' },
        1001: { label: this.$t({ id: "my.contract.state.generate" }/*编辑中*/), state: 'processing' },
        6001: { label: this.$t({ id: "my.contract.state.hold" }/*暂挂*/), state: 'warning' },
        1002: { label: this.$t({ id: "my.contract.state.submitted" }/*审批中*/), state: 'processing' },
        1005: { label: this.$t({ id: "my.contract.state.rejected" }/*已驳回*/), state: 'error' },
        1004: { label: this.$t({ id: "my.contract.state.confirm" }/*已通过*/), state: 'success' },
        1003: { label: this.$t({ id: "my.contract.state.withdrawal" }/*已撤回*/), state: 'warning' },
        2004: { label: "支付成功", state: 'success' },
        2002: { label: "审核通过", state: 'success' },
      },
      subTabsList: [
        { label: this.$t({ id: "my.contract.detail" }/*详情*/), key: 'DETAIL' }
      ],
      columns: [
        {
          title: this.$t({ id: "common.sequence" }/*序号*/), dataIndex: 'index',
          render: (value, record, index) => this.state.pageSize * this.state.page + index + 1
        },
        { title: this.$t({ id: "my.contract.currency" }/*币种*/), dataIndex: 'currency' },
        { title: this.$t({ id: "my.contract.plan.amount" }/*计划金额*/), dataIndex: 'amount', render: this.filterMoney },
        { title: this.$t({ id: "my.contract.partner.category" }/*合同方类型*/), dataIndex: 'partnerCategoryName' },
        { title: this.$t({ id: "my.contract.partner" }/*合同方*/), dataIndex: 'partnerName' },
        {
          title: this.$t({ id: "my.contract.plan.pay.date" }/*计划付款日期*/), dataIndex: 'dueDate',
          render: value => moment(value).format('YYYY-MM-DD')
        },
        {
          title: this.$t({ id: "common.remark" }/*备注*/), dataIndex: 'remark',
          render: value => {
            return (value ?
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>{value}</Popover> : '-'
            )
          }
        }
      ],
      data: [],
      isCopy: false,
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
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
      //   editReimburePage: menuRoute.getRouteItem('edit-reimburse', 'key'),
      flag: true,
      showInvoices: false,
      invoicesLoading: false,
      approveHistory: [],
      detailVisible: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.flag && nextProps.id) {
      this.setState({ flag: false, historyLoading: true });
      reimburseService.getDefaultApportion(nextProps.id).then(res => {
        this.setState({ defaultApportion: res.data });
      }).catch(err => {
        message.error("获取默认分摊信息失败！");
      });
    }
    if (nextProps.headerData.expenseReportOID && !this.props.headerData.expenseReportOID) {
      reimburseService.getReportsHistory(nextProps.headerData.expenseReportOID).then(res => {
        this.setState({ approveHistory: res.data, historyLoading: false });
      }).catch(err => {
        message.error("获取审批历史失败！");
      });
    }
  }

  //获取资金计划
  getPayList = (flag) => {
    this.setState({ payPlanVisible: false }, () => {
      if (flag) {
        this.setState({ isLoadPayData: !this.state.isLoadPayData });
      }
    })
  };

  //获取资金计划
  getCostList = (flag) => {
    this.setState({ visible: false, detailVisible: false }, () => {
      if (flag) {
        this.setState({ isLoadCostData: !this.state.isLoadCostData });
        this.getPayList(true);
        this.props.getInfo && this.props.getInfo();
      }
    })
  };

  //获取合同历史
  getHistory = () => {

    if (!this.state.headerData.documentOid) return;

    this.setState({ historyLoading: true });
    // console.log(this.state.headerData.documentOid);
    contractService.getContractHistory(this.state.headerData.documentOid).then(res => {
      if (res.status === 200) {
        this.setState({
          historyLoading: false,
          historyData: res.data
        })
      }
    }).catch(() => {
      this.setState({ historyLoading: false });
      message.error(this.$t({ id: "common.error" }/*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/))
    })
  };

  //合同信息／合同历史 切换
  handleTabsChange = (tab) => {
    this.setState({ topTapValue: tab }, () => {
      this.state.topTapValue === 'contractHistory' && this.getHistory()
    })
  };

  //合同信息内容渲染格式
  renderList = (title, value) => {
    return (
      <div className="list-info">
        <span>{title}：</span>
        <span className="content">{value}</span>
      </div>
    )
  };

  //取消
  contractCancel = () => {
    contractService.cancelContract(this.props.id).then(res => {
      if (res.status === 200) {
        message.success(this.$t({ id: "common.operate.success" }/*操作成功*/));
      }
    }).catch(e => {
      message.error(`${this.$t({ id: "common.operate.filed" }/*操作失败*/)}，${e.response.data.message}`);
    })
  };

  //新建费用按钮事件
  createCost = () => {
    this.setState({ visible: true, costRecord: {}, isCopy: false });
  }

  //新建付款行
  addPayPlan = () => {
    this.setState({ payPlanVisible: true, payRecord: {} });
  }

  //编辑付款行
  payEdit = (record) => {
    this.setState({ payPlanVisible: true, payRecord: record });
  }

  //编辑费用行
  costEdit = (record) => {
    this.setState({ visible: true, costRecord: record, isCopy: false });
  }

  //费用行详情
  costDetail = (record) => {
    this.setState({ detailVisible: true, costRecord: record });
  }

  //编辑报账单
  edit = () => {
    // let path = this.state.editReimburePage.url.replace(":id", this.props.headerData.id);
    // this.context.router.push(path);
  }

  //删除费用行
  deleteCost = (record) => {
    reimburseService.deleteCostDetail(record.id).then(res => {
      message.success("删除成功！");
      this.getCostList(true);
    }).catch(err => {
      message.error("删除失败！");
    })
  }

  //复制费用行
  costCopy = (record) => {
    this.setState({ visible: true, costRecord: record, isCopy: true });
  }

  //删除付款行
  deletePay = (record) => {
    reimburseService.deletePayDetail(record.id).then(res => {
      message.success("删除成功！");
      this.getPayList(true);
    }).catch(err => {
      message.error("删除失败！");
    })
  }

  //跳转到合同详情
  contractDetail = () => {
    let url = menuRoute.getRouteItem('contract-detail', 'key');
    window.open(url.url.replace(':id', this.props.headerData.contractHeaderId).replace(':from', "reimburse"), "_blank");
  }

  //选取报账单后
  handleListOk = (values) => {

    this.setState({ invoicesLoading: true });
    let data = {
      expenseReportId: this.props.id,
      invoices: []
    };

    values.result && values.result.map(item => {
      data.invoices.push(item.invoiceOID);
    });

    reimburseService.import(data).then(res => {
      message.success("导入费用成功！");
      this.setState({ showInvoices: false, invoicesLoading: false });
      this.getCostList(true);
    }).catch(res => {
      message.error("导入失败！");
    })
  }

  //撤回
  withdraw = () => {
    let params =
    {
      entities: [{
        entityOID: this.props.headerData.expenseReportOID,
        entityType: 801001
      }]
    };
    reimburseService.withdraw(params).then(res => {
      message.success("撤回成功！");
      this.onCancel();
    }).catch(err => {
      message.error("撤回失败：" + err.response.data.message);
    })
  }

  //取消
  onCancel = () => {
    this.context.router.push(this.state.myReimburse.url);
  };
  //获取备注
  getRemark = (headerData) => {
    if (!headerData.customFormValues) return "";
    var data = headerData.customFormValues.find(o => o.messageKey == "remark");
    if (data) {
      return data.value;
    } else {
      return "";
    }
  }
  render() {
    const { headerData } = this.props;
    const { detailLoading, showInvoices, isLoadCostData, isLoadPayData, writeoffShow, visible, planLoading, historyLoading, contractEdit, topTapValue, subTabsList, pagination, columns, data, showSlideFrame, contractStatus, record, slideFrameTitle, historyData, detailVisible } = this.state;
    const isEdit = headerData.reportStatus == 1001 || headerData.reportStatus == 1003 || headerData.reportStatus == 1005;
    let subContent = {};
    let list = [];
    headerData.customFormValues && headerData.customFormValues.map(o => {
      if (o.messageKey != "select_company" && o.messageKey != "select_department" && o.messageKey != "remark" && o.messageKey != "currency_code") {
        list.push({ label: o.fieldName, value: o.showValue });
      }
    });
    console.log(headerData)
    let headerInfo = {
      businessCode: headerData.businessCode,
      createdDate: headerData.reportDate,
      createByName: `${headerData.createByName}-${headerData.createByCode}`,
      formName: headerData.formName,
      statusCode: headerData.reportStatus,
      totalAmount: headerData.totalAmount,
      currencyCode: headerData.currencyCode,
      remark: this.getRemark(headerData),
      infoList: [
        { label: "申请人", value: `${headerData.applicationName}-${headerData.applicationCode}` },
        { label: "公司", value: headerData.companyName },
        { label: "部门", value: headerData.unitName },
        headerData.contractHeaderId ? { label: "合同", value: headerData.contractHeaderLineDTO.contractNumber, linkId: headerData.contractHeaderId } : null
      ],
      customList: list
    };
    subContent.DETAIL = (
      <div>

        <Card style={{ marginTop: 20, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }} title="费用明细">
          <Row style={{ margin: "20px 0" }}>
            <Col>
              <CostDetail costDetail={this.costDetail} deleteCost={this.deleteCost} costCopy={this.costCopy} costEdit={this.costEdit} flag={isLoadCostData} disabled={true} headerData={this.props.headerData}></CostDetail>
            </Col>
          </Row>
        </Card>

        <PayInfo
          ref="payInfo"
          flag={isLoadPayData}
          headerData={headerData}
          deletePay={this.deletePay}
          addPayPlan={this.addPayPlan}
          payEdit={this.payEdit}
          summaryView={headerData.summaryView || {}}
          writeOffOk={this.getCostList}
          disabled={true}
        >
        </PayInfo>
        <div style={{ marginTop: 20, marginBottom: 0, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}>
          <ApproveHistory loading={this.state.historyLoading} infoData={this.state.approveHistory}></ApproveHistory>
        </div>
      </div>
    );
    subContent.PLAN = (
      <div className="tab-container">
        <Spin spinning={planLoading}>
          <h3 className="sub-header-title">{this.$t({ id: "my.contract.payment.plan" }/*付款计划*/)}</h3>
          <div className="table-header">
            <div className="table-header-buttons">
              {contractEdit &&
                <Button type="primary" onClick={this.addItem}>{this.$t({ id: "common.add" }/*添加*/)}</Button>}
            </div>
            <div style={{ marginBottom: '10px' }}>
              {this.$t({ id: "common.total" }, { total: pagination.total }/*共搜索到 {total} 条数据*/)}
              <span className="ant-divider" />
              {this.$t({ id: "my.contract.amount" }/*合同金额*/)}: {headerData.currency} {this.filterMoney(headerData.amount)}
            </div>
          </div>
          <Table rowKey={record => record.id}
            columns={columns}
            dataSource={data}
            pagination={pagination}
            scroll={{ x: true, y: false }}
            bordered
            size="middle" />
        </Spin>
      </div>
    );

    return (
      <div className="contract-detail-common reimburse">
        <Spin spinning={false}>
          <Card style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}>
            <Tabs onChange={this.handleTabsChange}>
              <TabPane tab="报账单信息" key="contractInfo" style={{ border: 'none' }} >
                {/* {contractInfo} */}
                <DocumentBasicInfo params={headerInfo}>

                </DocumentBasicInfo>
              </TabPane>
            </Tabs>
          </Card>
          {topTapValue === 'contractInfo' &&
            // <Card>
            //   <Tabs className="detail-tabs">
            //     {subTabsList.map((item) => {
            //       return <TabPane tab={item.label} key={item.key}>{subContent[item.key]}</TabPane>
            //     })}
            //   </Tabs>
            // </Card>
            <div>
              {subContent['DETAIL']}
            </div>
          }
        </Spin>
        <SlideFrame title={slideFrameTitle}
          show={showSlideFrame}
          onClose={() => this.showSlide(false)}>
          <NewPayPlan
            close={this.handleCloseSlide}
            params={{
              id: this.props.id,
              currency: headerData.currency,
              partnerCategory: headerData.partnerCategory,
              companyId: headerData.companyId,
              partnerId: headerData.partnerId,
              partnerName: headerData.partnerName,
              record
            }} />
        </SlideFrame>

        <SlideFrame show={visible}
          title="新建费用"
          onClose={() => this.setState({ visible: false })}>
          <NewExpense
            close={this.getCostList}
            params={{
              visible: this.state.visible,
              record: this.state.costRecord,
              headerId: this.props.id,
              headerData: this.props.headerData,
              defaultApportion: this.state.defaultApportion,
              isCopy: this.state.isCopy
            }}
          />
        </SlideFrame>
        <SlideFrame show={detailVisible}
          title="费用详情"
          afterClose={() => this.setState({ detailVisible: false })}
          onClose={() => this.setState({ detailVisible: false })}>
          <DetailExpense
            close={this.getCostList}
            approve={true}
            params={{
              visible: this.state.detailVisible,
              record: this.state.costRecord,
              headerId: this.props.id,
              headerData: this.props.headerData,
              defaultApportion: this.state.defaultApportion,
              isCopy: this.state.isCopy,
              refresh: this.refresh
            }}
          />
        </SlideFrame>

        <SlideFrame show={this.state.payPlanVisible}
          title="新建付款信息"
          onClose={() => this.setState({ payPlanVisible: false })}>
          <NewPayPlan
            params={{ visible: this.state.payPlanVisible, record: this.state.payRecord, headerData: this.props.headerData }}
            close={this.getPayList}
          />
        </SlideFrame>

        <ListSelector
          single={false}
          visible={showInvoices}
          type="select_invoices"
          onCancel={() => { this.setState({ showInvoices: false }) }}
          onOk={this.handleListOk}
          saveLoading={this.state.invoicesLoading}
        />

      </div>
    )
  }
}

ContractDetailCommon.propTypes = {
  id: PropTypes.any.isRequired, //显示数据
  isApprovePage: PropTypes.bool, //是否在审批页面
  getContractStatus: PropTypes.func, //确认合同信息状态
};

ContractDetailCommon.defaultProps = {
  isApprovePage: false,
  getContractStatus: () => { }
};



const wrappedContractDetailCommon = Form.create()((ContractDetailCommon));

export default wrappedContractDetailCommon;
