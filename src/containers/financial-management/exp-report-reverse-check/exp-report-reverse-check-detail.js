import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import expReportReverseCheckService from 'containers/financial-management/exp-report-reverse-check/exp-report-reverse-check.service';
import {
  Tabs,
  Affix,
  Card,
  Row,
  Col,
  Input,
  Button,
  message,
  DatePicker,
  Popover,
  Spin,
  Divider,
} from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
import moment from 'moment';
import ApproveHistory from 'components/Widget/Template/approve-history-work-flow';
import 'styles/reimburse/reimburse-common.scss';
import 'styles/contract/my-contract/contract-detail.scss';
import ApproveBar from 'components/Widget/Template/approve-bar';
class ExpReportReverseCheckDetail extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      //父界面路由
      expReportReverseCheck: `/financial-management/exp-report-reverse-check`,
      //基本信息字段
      basicInfo: {
        reportReverseNumber: '单据编号:',
        reverseDate: '反冲日期:',
        createdByName: '申请人:',
        sourceReportHeaderCode: '原单据编号:',
        status: '状态',
        amount: '反冲金额',
        description: '备注',
      },
      //基本信息实际的行，布局
      basicInfoList: [],
      //基本信息的loading
      basicLoading: true,
      //审批历史的loading
      historyLoading: true,
      //审批历史data
      historyData: [],
      //审批意见
      remark: '',
      //凭证日期
      credenceDate: new Date().format('yyyy-MM-dd'),
      //凭证-页
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      //凭证loading
      credenceLoading: true,
      //凭证信息data
      credenceData: [],
      //凭证信息行
      columns: [
        {
          title: this.$t({ id: 'detail.description' } /*说明*/),
          dataIndex: 'description',
          width: '150',
          render: text => {
            return <Popover content={text}>{text} </Popover>;
          },
        },
        {
          title: this.$t({ id: 'detail.voucher.date' } /*凭证日期*/),
          dataIndex: 'accountingDate',
          width: '100',
          render: text => {
            return <span>{moment(text).format('YYYY-MM-DD')}</span>;
          },
        },
        {
          title: this.$t({ id: 'detail.company' } /*公司*/),
          dataIndex: 'companyName',
          width: '150',
          render: text => {
            return <Popover content={text}>{text}</Popover>;
          },
        },
        {
          title: this.$t({ id: 'detail.costCenter.name' } /*责任中心*/),
          dataIndex: 'costCenterName',
          width: '100',
        },
        {
          title: this.$t({ id: 'detail.account.code' } /*科目*/),
          dataIndex: 'accountCode',
          width: '100',
        },
        {
          title: this.$t({ id: 'detail.currency.code' } /*币种*/),
          dataIndex: 'currencyCode',
          width: '100',
        },
        {
          title: this.$t({ id: 'detail.entered.amountDr' } /*原币借方*/),
          dataIndex: 'enteredAmountDr',
          width: '100',
          render: this.filterMoney,
        },
        {
          title: this.$t({ id: 'detail.entered.amountCr' } /*原币贷方*/),
          dataIndex: 'enteredAmountCr',
          width: '100',
          render: this.filterMoney,
        },
        {
          title: this.$t({ id: 'detail.functional.amountDr' } /*本币借方*/),
          dataIndex: 'functionalAmountDr',
          width: '100',
          render: this.filterMoney,
        },
        {
          title: this.$t({ id: 'detail.functional.amountCr' } /*本币贷方*/),
          dataIndex: 'functionalAmountCr',
          width: '100',
          render: this.filterMoney,
        },
        {
          title: this.$t({ id: 'detail.segment1' } /*科目段1*/),
          dataIndex: 'segment1',
          width: '100',
        },
        {
          title: this.$t({ id: 'detail.segment2' } /*科目段2*/),
          dataIndex: 'segment2',
          width: '100',
        },
        {
          title: this.$t({ id: 'detail.segment2' } /*科目段3*/),
          dataIndex: 'segment3',
          width: '100',
        },
      ],
      //基础信息-s
      headerData: {},
      //基础信息loading-s
      detailLoading: false,
      //反冲状态-s
      reserveStatus: {
        6002: { label: this.$t({ id: 'my.contract.state.cancel' } /*已取消*/), state: 'default' },
        6003: { label: this.$t({ id: 'my.contract.state.finish' } /*已完成*/), state: 'success' },
        1001: {
          label: this.$t({ id: 'my.contract.state.generate' } /*编辑中*/),
          state: 'processing',
        },
        6001: { label: this.$t({ id: 'my.contract.state.hold' } /*暂挂*/), state: 'warning' },
        1002: {
          label: this.$t({ id: 'detail.reverse.status.checkIng' } /*审核中*/),
          state: 'processing',
        },
        1005: { label: this.$t({ id: 'my.contract.state.rejected' } /*已驳回*/), state: 'error' },
        1004: {
          label: this.$t({ id: 'detail.reverse.status.checked' } /*已审核*/),
          state: 'success',
        },
        1003: {
          label: this.$t({ id: 'my.contract.state.withdrawal' } /*已撤回*/),
          state: 'warning',
        },
      },
      //反冲审批是否通过
      isConfirm: true,
      isCredence: true,
      btnDisabled: true,
      passLoading: false,
      rejectLoading: false,
    };
  }
  /**
   * 生命周期函数，constructor之后render之前
   */
  componentWillMount = () => {
    this.getBasicInfo();
    this.getHistory();
    this.setState({ credenceLoading: false });
    this.getCredence();
  };
  /**
   * 获取审批历史
   */
  getHistory = () => {
    expReportReverseCheckService
      .getHistory(this.props.match.params.id)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            historyData: res.data,
            historyLoading: false,
          });
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(
            this.$t(
              { id: 'detail.history.fail' },
              { fail: e.response.data.message } /*获取审批历史失败*/
            )
          );
          // message.error(`查询审批历史失败：${e.response.data.message}`);
          this.setState({
            historyLoading: false,
          });
        }
      });
  };
  /**
   * 获取基本信息数据
   */
  getBasicInfo = (resolve, reject) => {
    // let { basicInfo } = this.state;
    // let basicInfoList = [];
    this.setState({ detailLoading: true });
    expReportReverseCheckService
      .getBasicInfo(this.props.match.params.id)
      .then(res => {
        if (res.status === 200) {
          this.setState(
            {
              basicLoading: false,
              // basicInfoList,
              detailLoading: false,
              headerData: res.data.reverseHeader,
              isConfirm: res.data.reverseHeader.status === 1002,
            },
            () => {
              if (!this.state.isConfirm) {
                this.getCredence();
              }
            }
          );
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(
            this.$t(
              { id: 'detail.getBasicInfo.fail' },
              { fail: e.response.data.message } /*获取基础信息失败*/
            )
          );
          this.setState({ basicLoading: false });
        }
      });
  };
  /**
   * 返回按钮点击事件
   */
  onBackClick = e => {
    let urlParam = this.props.match.params.tab;
    this.props.dispatch(
      routerRedux.replace({
        pathname: this.state.expReportReverseCheck + `?tab=${urlParam}`,
      })
    );
  };
  /**
   * 审批意见change事件
   */
  onRemarkChange = e => {
    e.preventDefault();
    this.setState({
      remark: e.target.value,
    });
  };
  /**
   * 通过
   */
  handleApprovePass = remark => {
    this.setState({ passLoading: true });
    let id = this.props.match.params.id;
    let status = 1004;
    let userId = this.props.user.id;
    expReportReverseCheckService
      .reportReverseUpdateStatus(id, remark, status, userId)
      .then(res => {
        if (res.status === 200) {
          this.setState({ passLoading: false });
          this.onBackClick();
          message.success(this.$t({ id: 'detail.adopt.success' } /*审核通过成功*/));
        }
      })
      .catch(e => {
        if (e.response) {
          this.setState({ passLoading: false });
          message.error(
            this.$t(
              { id: 'detail.onPass.fail' },
              { fail: e.response.data.errorCode } /*通过操作失败*/
            )
          );
        }
      });
  };
  /**
   * 驳回
   */
  handleApproveReject = remark => {
    this.setState({ rejectLoading: true });
    let id = this.props.match.params.id;
    let userId = this.props.user.id;
    let status = 1005;
    expReportReverseCheckService
      .reportReverseUpdateStatus(id, remark, status, userId)
      .then(res => {
        if (res.status === 200) {
          this.setState({ rejectLoading: false });
          this.onBackClick();
          message.success(this.$t({ id: 'detail.reject.success' } /*驳回成功*/));
        }
      })
      .catch(e => {
        if (e.response) {
          this.setState({ rejectLoading: false });
          message.error(
            this.$t(
              { id: 'detail.onReject.fail' },
              { fail: e.response.data.message } /*驳回操作失败*/
            )
          );
        }
      });
  };
  /**
   * 创建凭证日期变化函数
   */
  onDateChange = (e, value) => {
    this.setState({
      credenceDate: value,
    });
  };
  /**
   * 创建凭证
   */
  onCreateCredenceClick = e => {
    this.setState({
      credenceLoading: true,
    });
    let reverseHeaderId = this.props.match.params.id;
    let credenceDate = this.state.credenceDate;
    expReportReverseCheckService
      .createCredence(reverseHeaderId, credenceDate)
      .then(res => {
        if (res.status === 200) {
          if (res.data === 'SUCCESS') {
            message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
            this.getCredence();
            this.setState({ isCredence: false });
          } else {
            message.warning(res.data);
            this.setState({
              credenceLoading: false,
              isCredence: false,
            });
          }
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(
            `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
          );
          this.setState({ credenceLoading: false });
        }
      });
  };
  /**
   * 获取凭证
   */
  getCredence = () => {
    let tenantId = this.props.company.tenantId;
    let transactionHeaderId = this.props.match.params.id;
    let page = this.state.page;
    let size = this.state.pageSize;
    expReportReverseCheckService
      .getCredence(tenantId, transactionHeaderId, page, size)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            credenceData: res.data,
            credenceLoading: false,
            pagination: {
              total: Number(
                res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0
              ),
              onChange: this.onChangePaper,
              current: this.state.page + 1,
              onShowSizeChange: this.onShowSizeChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: () => {
                return this.$t(
                  { id: 'detail.credence.pagination.total' },
                  {
                    total: Number(
                      res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0
                    ) /*查询凭证总条数*/,
                  }
                );
              },
            },
          });
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(
            this.$t(
              { id: 'detail.getCrendence.fail' },
              { fail: e.response.data.message } /*查询凭证信息失败*/
            )
          );
          //message.error(`查询凭证信息失败:${e.response.data.message}`);
          this.setState({ credenceLoading: false });
        }
      });
  };
  /**
   * 切换分页
   */
  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState(
        {
          page: page - 1,
          loading: true,
        },
        () => {
          this.getList();
        }
      );
    }
  };
  /**
   * 切换每页显示的条数-s
   */
  onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        credenceLoading: true,
        page: current - 1,
        pageSize,
      },
      () => {
        this.getCredence();
      }
    );
  };
  /**
   * 数据格式渲染-s
   */
  renderList = (title, value, hasColor) => {
    if (hasColor) {
      return (
        <div className="list-info">
          <span>{title}：</span>
          <span className="content" style={{ color: '#1E90FF' }}>
            {value}
          </span>
        </div>
      );
    } else {
      return (
        <div className="list-info">
          <span>{title}：</span>
          <span className="content">{value}</span>
        </div>
      );
    }
  };
  /**
   * 渲染函数
   */
  render() {
    const {
      basicInfoList,
      basicLoading,
      historyLoading,
      historyData,
      remark,
      pagination,
      credenceLoading,
      credenceData,
      columns,
      isConfirm,
      btnDisabled,
      passLoading,
      rejectLoading,
    } = this.state;
    //state初始化-s
    const { detailLoading, headerData, reserveStatus } = this.state;
    let reverseDetailInfo = (
      <div>
        <Spin spinning={detailLoading}>
          <h3 className="header-title" style={{ marginTop: '10px' }}>
            {this.$t({ id: 'detail.expense.reverse' } /*费用反冲单*/)}
          </h3>
          <Row>
            <Col span={18}>
              <Row>
                <Col span={6}>
                  {this.renderList(
                    this.$t({ id: 'detail.document.number' } /*单据编号*/),
                    headerData.reportReverseNumber,
                    true
                  )}
                </Col>
                <Col span={6}>
                  {this.renderList(
                    this.$t({ id: 'detail.reverse.date' } /*反冲日期*/),
                    moment(headerData.createdDate).format('YYYY-MM-DD'),
                    false
                  )}
                </Col>
                <Col span={6}>
                  {this.renderList(
                    this.$t({ id: 'detail.apply.id' } /*申请人*/),
                    headerData.createdByName + '-' + headerData.createdBy,
                    false
                  )}
                </Col>
                <Col span={6}>
                  {this.renderList(
                    this.$t({ id: 'detail.source.report.number' } /*原单据编号*/),
                    headerData.sourceReportHeaderCode,
                    true
                  )}
                </Col>
              </Row>
              <Row>
                <Col span={6}>
                  {this.renderList(
                    this.$t({ id: 'detail.remark' } /*备注*/),
                    headerData.remark,
                    false
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <div style={{ float: 'right' }}>
                <div className="amount-title">
                  {this.$t({ id: 'detail.reverse.amount' } /*反冲金额*/)}
                </div>
                <div className="amount-content">
                  {headerData.currencyCode} {this.filterMoney(headerData.amount)}
                </div>
              </div>
              <div style={{ float: 'right', marginRight: '50px' }}>
                <div className="status-title">
                  {this.$t({ id: 'detail.reverse.status' } /*状态*/)}
                </div>
                <div className="status-content">
                  {reserveStatus[headerData.status] ? reserveStatus[headerData.status].label : ''}
                </div>
              </div>
            </Col>
          </Row>
        </Spin>
      </div>
    );
    //凭证信息`
    let creditDetailInfo = (
      <div>
        <Spin spinning={detailLoading}>
          <h3>{this.$t({ id: 'detail.voucher.info' })}</h3>
          <Divider />
          {isConfirm && (
            <Row gutter="16" type="flex" justif="start">
              <Col span={3}>
                <Button onClick={this.onCreateCredenceClick} type="primary">
                  {this.$t({ id: 'detail.create.voucher' } /*创建凭证*/)}
                </Button>
              </Col>
              <Col span={4}>
                <DatePicker
                  onChange={this.onDateChange}
                  defaultValue={moment(new Date(), 'yyyy-MM-dd')}
                />
              </Col>
            </Row>
          )}
          <Row style={{ marginTop: '20px' }}>
            <Col>
              <Table
                columns={columns}
                bordered
                size="middle"
                pagination={pagination}
                loading={credenceLoading}
                rowKey={record => record.id}
                dataSource={credenceData}
                scroll={{ x: 1500 }}
              />
            </Col>
          </Row>
        </Spin>
      </div>
    );

    return (
      <div className="contract-detail">
        <div className="contract-detail-common" style={{ paddingLeft: '20px' }}>
          <div className="top-info">
            {reverseDetailInfo}
            <div className="divider" />
            {creditDetailInfo}
            <div className="divider" />
            <Row gutter={24}>
              <Col span={24} style={{ paddingTop: '20px', marginBottom: '40px' }}>
                <ApproveHistory loading={historyLoading} infoData={historyData} />
              </Col>
            </Row>
            {!isConfirm && (
              <Affix offsetBottom={0} className="bottom-bar">
                <Button onClick={this.onBackClick}>
                  {this.$t({ id: 'detail.approve.back' } /*返回*/)}
                </Button>
              </Affix>
            )}
            {isConfirm && (
              <Affix
                offsetBottom={0}
                className="bottom-bar bottom-bar-approve"
                style={{ paddingRight: '200px' }}
              >
                <ApproveBar
                  passLoading={passLoading}
                  rejectLoading={rejectLoading}
                  handleApprovePass={this.handleApprovePass}
                  handleApproveReject={this.handleApproveReject}
                  isCredence={this.state.isCredence}
                  backUrl={`${this.state.expReportReverseCheck}?tab=${this.props.match.params.tab}`}
                />
              </Affix>
            )}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * redux
 */
function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ExpReportReverseCheckDetail);
