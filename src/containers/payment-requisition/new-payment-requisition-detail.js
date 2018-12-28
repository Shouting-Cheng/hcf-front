/**
 * Created by seripin on 2018/1/25.
 */
import React from 'react';
import moment from 'moment';
import {
  Form,
  Tag,
  Tabs,
  Button,
  Row,
  Col,
  Spin,
  Breadcrumb,
  message,
  Popover,
  Popconfirm,
  Affix,
  Divider,
  Modal,
  Card,
} from 'antd';
import Table from 'widget/table';
const TabPane = Tabs.TabPane;
import paymentRequisitionService from './paymentRequisitionService.service';
import NewPaymentRequisitionLine from './new-payment-requisition-line';
import AddPaymentRequsition from './add-payment-requisition';
import SlideFrame from 'widget/slide-frame';
import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss';
import httpFetch from 'share/httpFetch';
import config from 'config';
import ExpreportDetail from 'containers/reimburse/my-reimburse/reimburse-detail';
import ContractDetail from 'containers/contract/my-contract/contract-detail';
//import ApproveHistory from './approve-history-work-flow';
import ApproveHistory from 'containers/pre-payment/my-pre-payment/approve-history-work-flow';
import DocumentBasicInfo from 'widget/Template/document-basic-info';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss';

class NewPaymentRequisitionDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: false,
      loading: false,
      dLoading: false,
      isNew: true,
      headerData: {
        paymentRequisitionNumberDTO: [],
      },
      showSlideFrame: false, //右侧滑窗
      addShowSlideFrame: false, //新增滑窗
      slideFrameTitle: '', //右侧滑窗标题
      record: {},
      detailId: undefined, //合同或者报账单ID
      columns: [
        {
          title: this.$t('acp.index' /*序号*/),
          dataIndex: 'index',
          align: 'center',
          width: 60,
          render: (value, record, index) =>
            index + 1 + (this.state.pagination.current - 1) * this.state.pagination.pageSize,
        },
        {
          title: this.$t('acp.requisition.amount' /*本次申请金额*/),
          dataIndex: 'amount',
          width: 120,
          render: (value, record) => {
            return (
              <div>
                <div style={{ textAlign: 'left', width: '20%' }}>
                  {record.currencyCode}&nbsp;&nbsp;{this.filterMoney(record.amount, 2)}
                </div>
              </div>
            );
          },
        },
        {
          title: this.$t('acp.partnerCategory' /*收款方*/),
          dataIndex: 'partnerCategory',
          width: 120,
          render: (value, record) => {
            return (
              <div>
                <div>
                  <Tag color="#000">
                    {record.partnerCategory === 'EMPLOYEE'
                      ? this.$t('acp.employee' /*员工*/)
                      : this.$t('acp.vendor' /*供应商*/)}
                  </Tag>
                </div>
                <div>{record.partnerName}</div>
              </div>
            );
          },
        },
        {
          title: this.$t('acp.accountName' /*收款账号*/),
          dataIndex: 'accountName',
          width: 180,
          render: (value, record) => {
            return (
              <Popover
                content={
                  <div>
                    <div>
                      {this.$t('acp.account' /*账户：*/)}
                      {record.accountNumber}
                    </div>
                    <div>
                      {this.$t('acp.account.name' /*户名*/)}
                      {value}
                    </div>
                  </div>
                }
              >
                <div>
                  <div
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                  >
                    {this.$t('acp.account' /*账户：*/)}
                    {record.accountNumber}
                  </div>
                  <div
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                  >
                    {this.$t('acp.account.name' /*户名*/)}
                    {value}
                  </div>
                </div>
              </Popover>
            );
          },
        },
        {
          title: '付款属性',
          dataIndex: 'cshTransactionClassName',
          width: 160,
          render: (value, record) => {
            return (
              <Popover
                content={
                  <div>
                    <div>付款方式类型：{record.paymentMethodCategoryName}</div>
                    <div>付款用途：{value}</div>
                  </div>
                }
              >
                <div>
                  <div
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                  >
                    付款方式类型：{record.paymentMethodCategoryName}
                  </div>
                  <div
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                  >
                    付款用途：{value}
                  </div>
                </div>
              </Popover>
            );
          },
        },
        {
          title: this.$t('acp.schedulePaymentDate' /*计划付款日期*/),
          dataIndex: 'schedulePaymentDate',
          render: value => moment(value).format('YYYY-MM-DD'),
        },
        {
          title: '备注',
          dataIndex: 'description',
          key: 'description',
          render: (value, record) => {
            return <span>{record.lineDescription}</span>;
          },
        },
        {
          title: this.$t('acp.operator' /*操作*/),
          dataIndex: 'id',
          render: (text, record) => (
            <span>
              <a onClick={e => this.editItem(e, record)}>{this.$t('common.edit' /*编辑*/)}</a>
              <span className="ant-divider" />
              <Popconfirm
                title={this.$t('common.confirm.delete' /*确定要删除吗？*/)}
                onConfirm={e => this.deleteItem(e, record)}
              >
                <a>{this.$t('common.delete' /*删除*/)}</a>
              </Popconfirm>
            </span>
          ),
        },
      ],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 5,
      },
      pageSize: 5,
      page: 0,
      typeDeatilParams: {
        applicationId: null,
        allType: null,
        formTypes: null,
      },
      myPaymentRequisition: '/payment-requisition/my-payment-requisition', //我的付款申请单
      editPaymentRequisition:
        '/payment-requisition/my-payment-requisition/edit-payment-requisition/:id/:typeId', //新建付款申请单
      showExpreportDetail: false, //报账单详情
      showContractDetail: false, //合同详情
      historyLoading: false,
      approveHistory: [],
      headerInfo: {},
      isAdd: false,
    };
  }

  componentWillMount() {
    this.getList();
  }

  getTypeDetail = () => {
    httpFetch
      .get(`${config.payUrl}/api/acp/request/type/query/${this.state.headerData.acpReqTypeId}`)
      .then(res => {
        let relatedType = res.data.paymentRequisitionTypes.relatedType;
        if (relatedType === 'BASIS_01') {
          this.setState({
            typeDeatilParams: {
              applicationId: this.state.headerData.employeeId,
              allType: true,
              formTypes: [],
            },
          });
        } else {
          let formTypes = [];
          res.data.paymentRequisitionTypesToRelateds.map(item => {
            formTypes.push(item.typeId);
          });
          this.setState({
            typeDeatilParams: {
              applicationId: this.state.headerData.employeeId,
              allType: false,
              formTypes: formTypes,
            },
          });
        }
      });
  };
  getList = () => {
    let paramsId;
    if (this.props.params && this.props.params.refund) {
      paramsId = this.props.params.id;
    } else {
      paramsId = this.props.match.params.id;
    }
    this.setState({ pageLoading: true });
    paymentRequisitionService
      .queryDetailById(paramsId)
      .then(res => {
        if (res.status == 200) {
          let columns = this.state.columns;
          if (!(res.data.status === 1001 || res.data.status === 1003 || res.data.status === 1005)) {
            columns.splice(columns.length - 1, 1);
          }
          if (!(res.data.status === 1001)) {
            this.getLogs(res.data.documentOid);
          }
          let { headerInfo } = this.state;
          if (!headerInfo.businessCode) {
            headerInfo = {
              businessCode: res.data.requisitionNumber,
              createdDate: res.data.requisitionDate,
              formName: res.data.acpReqTypeName,
              createByName: res.data.createdName,
              totalAmount: res.data.functionAmount,
              statusCode: res.data.status,
              remark: res.data.description,
              currencyCode: 'CNY',
              infoList: [
                { label: '申请人', value: res.data.createdName },
                { label: '公司', value: res.data.companyName },
                { label: '部门', value: res.data.unitName },
              ],
              attachments: res.data.attachments,
            };
          } else {
            headerInfo.totalAmount = res.data.functionAmount;
          }
          this.setState(
            {
              headerData: res.data,
              pageLoading: false,
              pagination: {
                total: res.data.paymentRequisitionLineDTO.length,
                current: 1,
                pageSize: 5,
                onChange: this.onChangePaper,
                onShowSizeChange: this.onShowSizeChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  this.$t(
                    { id: 'common.show.total' },
                    {
                      range0: `${range[0]}`,
                      range1: `${range[1]}`,
                      total: total,
                    }
                  ),
                pageSizeOptions: ['5', '10', '20', '30', '40'],
              },
              columns: columns,
              headerInfo,
            },
            () => {
              if (
                this.state.typeDeatilParams.applicationId === null &&
                (res.data.status === 1001 || res.data.status === 1003 || res.data.status === 1005)
              ) {
                this.getTypeDetail();
              }
            }
          );
        }
      })
      .catch(e => {
        this.setState({
          pageLoading: false,
        });
        message.error(this.$t('common.error' /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/));
      });
  };
  getLogs = documentOid => {
    this.setState({
      historyLoading: true,
    });
    paymentRequisitionService
      .getLogs(documentOid)
      .then(res => {
        if (res.status == 200) {
          this.setState({
            approveHistory: res.data,
            historyLoading: false,
          });
        }
      })
      .catch(e => {
        this.setState({
          historyLoading: false,
        });
        message.error(this.$t('common.error' /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/));
      });
  };
  //翻页
  onChangePaper = page => {
    const pagination = this.state.pagination;
    if (page !== this.state.pagination.current) {
      this.setState({
        pagination: {
          ...pagination,
          current: page,
        },
      });
    }
  };

  //改变每页显示条数
  onShowSizeChange = (current, pageSize) => {
    const pagination = this.state.pagination;
    this.setState({
      pagination: {
        ...pagination,
        current: current,
        pageSize: pageSize,
      },
    });
  };
  renderList = (title, value) => {
    return (
      <Row className="list-info">
        <Col span={6}>{title}：</Col>
        <Col className="content" span={18}>
          {value}
        </Col>
      </Row>
    );
  };
  // 编辑头信息
  edit = () => {
    let path = this.state.editPaymentRequisition.replace(':id', this.state.headerData.id);
    path = path.replace(':typeId', this.state.headerData.acpReqTypeId);
    this.props.dispatch(
      routerRedux.push({
        pathname: path,
      })
    );
  };
  // 新增行信息
  addItem = () => {
    this.setState(
      {
        record: {},
        slideFrameTitle: this.$t('acp.new.payment' /*新增付款信息*/),
        isAdd: true,
      },
      () => {
        this.addShowSlide(true);
      }
    );
  };

  // 侧滑
  showSlide = flag => {
    this.setState({ showSlideFrame: flag, flag: false });
  };
  //新增侧滑框
  addShowSlide = flag => {
    this.setState({ addShowSlideFrame: flag, flag: false });
  };
  //新增侧滑框关闭
  addCloseFunc = e => {
    this.addShowSlide(false);
    e && this.getList();
  };
  // 侧滑关闭
  closeFunc = e => {
    this.showSlide(false);
    e && this.getList();
  };
  //新增侧滑框完全关闭
  addHandleCloseSlide = flag => {
    this.addShowSlide(false);
    flag && this.getList();
  };
  // 侧滑完全关闭后回调
  handleCloseSlide = flag => {
    this.showSlide(false);
    flag && this.getList();
  };
  //
  firstSlideHide = flag => {
    this.showSlide(false);
  };

  // 付款行编辑
  editItem = (e, record) => {
    e.preventDefault();
    this.setState({
      record,
      showSlideFrame: true,
      slideFrameTitle: this.$t('acp.edit.payment' /*编辑付款信息*/),
      isAdd: false,
    });
  };

  // 扩展行
  expandedRowRender = record => {
    debugger;
    return (
      <div>
        <Row>
          <Col span={2}>
            <span style={{ float: 'right' }}>{this.$t('acp.amount.attribute' /*金额属性*/)}</span>
          </Col>
          <Col span={6} offset={1}>
            {this.$t('acp.rate.date' /*汇率日期*/)}：
          </Col>
          <Col span={6}>
            {this.$t('acp.rate' /*汇率*/)}：{record.exchangeRate}
          </Col>
          <Col span={5}>
            本币金额：{record.currencyCode}&nbsp; {this.filterMoney(record.functionAmount, 2, true)}
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={2}>
            <span style={{ float: 'right' }}>{this.$t('acp.relation.document' /*关联单据*/)}</span>
          </Col>
          <Col span={6} offset={1}>
            <span>{this.$t('acp.public.document' /*报账单*/)}：</span>
            <a
              onClick={() => {
                this.onViewExpreportDetail(record.refDocumentId);
              }}
            >
              {record.refDocumentNumber ? record.refDocumentNumber : '-'}
            </a>
          </Col>
          <Col span={6}>
            {this.$t('acp.delay.amount' /*延迟支付金额*/)}
            {this.filterMoney(record.freezeAmount, 2, true)}
          </Col>
          <Col span={5}>
            <span>
              {this.$t('acp.enabled.amount' /*可申请金额*/)}
              {this.filterMoney(record.availableAmount, 2, true)}
            </span>
          </Col>
        </Row>

        {record.contractHeaderId && (
          <div>
            <Divider />
            <Row>
              <Col span={2}>
                <span style={{ float: 'right' }}>
                  {this.$t('acp.relation.contract' /*关联合同：*/)}
                </span>
                {/* <a onClick={() => { this.onViewContractDetail(record.contractHeaderId) }}>{record.contractNumber ? record.contractNumber : "-"}</a> */}
              </Col>
              <Col span={6} offset={1}>
                <span>
                  {this.$t('acp.contract.name' /*合同名称*/)}：{record.contractName}
                </span>
              </Col>
              <Col span={6}>
                <span>{this.$t('acp.contract.number' /*合同编号*/)}：</span>
                <a
                  onClick={() => {
                    this.onViewContractDetail(record.contractHeaderId);
                  }}
                >
                  {record.contractNumber ? record.contractNumber : '-'}
                </a>
              </Col>
              <Col span={5}>
                <span>{this.$t('acp.contract.lineNumber' /*付款计划序号：*/)}</span>
                <span>{record.contractLineNumber ? record.contractLineNumber : '-'}</span>
              </Col>
              <Col span={4}>
                <span>{this.$t('acp.schedulePaymentDate' /*计划付款日期*/)}：</span>
                <span>{record.contractDueDate ? record.contractDueDate : '-'}</span>
              </Col>
            </Row>
          </div>
        )}
        {record.payAmount !== 0 &&
          record.payAmount !== null && (
            <div>
              <Divider />
              <Row>
                <Col span={2}>
                  <span style={{ float: 'right' }}>{this.$t('acp.payment.log' /*付款日志*/)}</span>
                </Col>
                <Col span={6} offset={1}>
                  <span>
                    {this.$t('acp.payment.amount' /*已付款总金额*/)}： {record.currencyCode}&nbsp;{this.filterMoney(
                      record.payAmount,
                      2,
                      true
                    )}
                  </span>
                </Col>
                <Col span={6}>
                  <span>
                    {this.$t('acp.return.amount' /*退款总金额*/)}： {record.currencyCode}&nbsp;{this.filterMoney(
                      record.returnAmount,
                      2,
                      true
                    )}
                  </span>
                </Col>
              </Row>
            </div>
          )}
      </div>
    );
  };

  // 删除行
  deleteItem = (e, record) => {
    paymentRequisitionService
      .deleteLineFunc(record.id)
      .then(res => {
        if (res.status === 200) {
          message.info(this.$t('common.delete.success' /*删除成功*/, { name: '' }));
          this.getList();
        }
      })
      .catch(e => {
        message.error(this.$t('common.operate.filed' /*操作失败*/) + e.response.data.message);
      });
  };
  // 提交
  onSubmit = () => {
    this.setState({ loading: true, dLoading: true, pageLoading: true });
    const { headerData } = this.state;
    if (headerData.paymentRequisitionLineDTO.length === 0) {
      message.warn(this.$t('acp.line.data.isNull' /*付款申请单行信息不能为空！*/));
      this.setState({ loading: false, dLoading: false, pageLoading: false });
      return;
    } else {
      // let params = {
      //   applicantOID: headerData.applicantOid,
      //   userOID: this.props.user.userOID,
      //   formOID: headerData.formOid,
      //   entityOID: headerData.documentOid,
      //   entityType: 801005,
      //   countersignApproverOIDs: null,
      // };
      console.log(headerData)
      let workFlowDocumentRef = {
        applicantOid: headerData.applicantOid,
        userOid: this.props.user.userOid,
        formOid: headerData.formOid,
        documentOid: headerData.documentOid,
        documentCategory: 801005,
        countersignApproverOIDs: null,
        documentNumber: headerData.requisitionNumber,
        remark: headerData.description,
        companyId: headerData.companyId,
        unitOid: headerData.unitOid,
        amount: headerData.functionAmount,
        currencyCode: headerData.currency,
        documentTypeId: headerData.acpReqTypeId,
        applicantDate: headerData.createdDate,
        documentId: headerData.id
      };
      paymentRequisitionService
        .submitHeader(workFlowDocumentRef)
        .then(res => {
          if (res.status === 200) {
            this.setState({ loading: false, dLoading: false, pageLoading: false });
            message.success(this.$t('common.operate.success' /*操作成功*/));
            this.onCancel();
          }
        })
        .catch(e => {
          this.setState({ loading: false, dLoading: false, pageLoading: false });
          message.error(
            this.$t('common.operate.filed' /*操作失败*/) + ',' + e.response.data.message
          );
        });
    }
  };
  // 删除
  onDelete = () => {
    this.setState({ dLoading: true, loading: true });
    paymentRequisitionService
      .deleteFunc(this.state.headerData.id)
      .then(res => {
        if (res.status === 200) {
          this.setState({ dLoading: false, loading: false });
          message.success(this.$t('common.delete.success' /*删除成功*/, { name: '' }));
          this.onCancel();
        }
      })
      .catch(e => {
        this.setState({ dLoading: false, loading: false });
        message.error(this.$t('common.operate.filed' /*操作失败*/) + e.response.data.message);
      });
  };
  // 返回
  onCancel = () => {
    this.props.dispatch(routerRedux.push({ pathname: this.state.myPaymentRequisition }));
  };

  wrapClose = content => {
    let id = this.state.detailId;
    const newProps = {
      params: { id: id, refund: true },
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };

  // 合同返回
  onCloseContract = () => {
    this.setState({ showContractDetail: false });
  };
  // 报账单返回
  onCloseExpreport = () => {
    this.setState({ showExpreportDetail: false });
  };
  // 查看合同
  onViewContractDetail = id => {
    this.setState({ showContractDetail: true, detailId: id });
  };
  // 查看报账单
  onViewExpreportDetail = id => {
    this.setState({ showExpreportDetail: true, detailId: id });
  };
  // 撤回
  returnFunction = () => {
    this.setState({ loading: true, dLoading: true, pageLoading: true });
    const { headerData } = this.state;
    let entityOid = headerData.documentOid;
    let params = {
      entities: [
        {
          entityOid: entityOid,
          entityType: 801005,
        },
      ],
    };
    paymentRequisitionService
      .returnFunction(params)
      .then(res => {
        if (res.status === 200 && res.data.failNum === 0) {
          this.setState({ dLoading: false, loading: false, pageLoading: false });
          this.onCancel();
          message.success(this.$t('common.operate.success' /*操作成功*/));
        } else {
          this.setState({ dLoading: false, loading: false, pageLoading: false });
          message.error(
            this.$t('common.operate.filed' /*操作失败*/) +
            ',' +
            res.data.failReason[entityOid]
          );
        }
      })
      .catch(e => {
        this.setState({ dLoading: false, loading: false, pageLoading: false });
        message.error(this.$t('common.operate.filed' /*操作失败*/) + ',' + e.response.data.message);
      });
  };
  //关闭添加付款第一个侧滑框
  // hideSlide=()=>{
  //     this.showSlide(false)
  // }

  render() {
    const {
      dLoading,
      loading,
      headerData,
      pageLoading,
      columns,
      pagination,
      addShowSlideFrame,
      showSlideFrame,
      slideFrameTitle,
      record,
      typeDeatilParams,
      isAdd,
    } = this.state;
    const { headerInfo } = this.state;
    /**根据单据状态确定该显示什么按钮 */
    let status = null;
    if (headerData.status === 1001 || headerData.status === 1003 || headerData.status === 1005) {
      status = (
        <h3 className="header-title" style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={this.edit} loading={loading}>
            {this.$t('common.edit' /* 编辑 */)}
          </Button>
        </h3>
      );
    } else if (headerData.status === 1002) {
      status = (
        <h3>
          <Button type="primary" onClick={this.returnFunction} loading={loading}>
            {this.$t('acp.return' /* 撤回 */)}
          </Button>
        </h3>
      );
    } else {
      status = <h3 className="header-title" />;
    }
    const tableTitle = (
      <span>
        {headerData.paymentRequisitionNumberDTO.length === 0 ? (
          <div style={{ display: 'inline-block' }}>
            <span>{this.$t({ id: 'acp.amount' } /*金额：*/)}</span>
            <span className="num-style" style={{ color: 'green' }}>
              CNY0.00
            </span>
          </div>
        ) : (
            headerData.paymentRequisitionNumberDTO.map((item, index) => {
              return (
                <div key={index} style={{ display: 'inline-block' }}>
                  {item.currencyCode === 'EUR' ? (
                    <span>&nbsp;&nbsp;</span>
                  ) : (
                      <span>{this.$t({ id: 'acp.amount' } /*金额：*/)}</span>
                    )}
                  <span className="num-style" style={{ color: 'green' }}>
                    {item.currencyCode} {this.filterMoney(item.amount)}
                  </span>
                </div>
              );
            })
          )}
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;{this.$t({ id: 'acp.function.amount' } /* 本币金额：*/)}
          <span className="num-style" style={{ color: 'green' }}>
            CNY{this.filterMoney(headerData.functionAmount)}
          </span>
        </span>
      </span>
    );

    let subContent = (
      <div>
        <Card
          style={{ marginTop: 20, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
          title="付款信息"
        >
          <div className="table-header">
            <div className="table-header-buttons" style={{ float: 'left' }}>
              {(headerData.status === 1001 ||
                headerData.status === 1003 ||
                headerData.status === 1005) && (
                  <Button type="primary" onClick={this.addItem} loading={loading}>
                    {this.$t({ id: 'acp.add.payment.info' } /* 添加*/)}
                  </Button>
                )}
            </div>
            <div style={{ float: 'right' }}>
              <Breadcrumb style={{ marginBottom: '10px' }}>
                <Breadcrumb.Item>{tableTitle}</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
          <Table
            style={{ clear: 'both' }}
            rowKey={record => record.id}
            columns={columns}
            expandedRowRender={this.expandedRowRender}
            dataSource={headerData.paymentRequisitionLineDTO}
            bordered
            pagination={pagination}
            loading={pageLoading}
            size="middle"
          />
        </Card>
        <div style={{ marginTop: 20, marginBottom: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
          {!(headerData.status === 1001) && (
            <ApproveHistory
              loading={this.state.historyLoading}
              infoData={this.state.approveHistory}
            />
          )}
        </div>
      </div>
    );
    const newState = (
      <div>
        <Button
          type="primary"
          onClick={this.onSubmit}
          loading={loading}
          style={{ margin: '0 20px' }}
        >
          {this.$t({ id: 'acp.submit' } /* 提交*/)}
        </Button>
        <Button onClick={this.onDelete} loading={dLoading}>
          {this.$t({ id: 'common.delete' } /* 删除*/)}
        </Button>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel} loading={loading}>
          {this.$t({ id: 'common.back' } /* 返回*/)}
        </Button>
      </div>
    );

    const otherState = (
      <div>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel} loading={loading}>
          {this.$t({ id: 'common.back' } /* 返回*/)}
        </Button>
      </div>
    );
    //添加付款信息侧滑
    return (
      <div style={{ paddingBottom: 100 }} className="pre-payment-common">
        <Spin spinning={false}>
          <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
            <Tabs defaultActiveKey="1" onChange={this.tabChange} forceRender>
              <TabPane tab={this.$t({ id: 'acp.document.info' } /* 单据信息*/)} key="detailInfo">
                <DocumentBasicInfo params={headerInfo}>{status}</DocumentBasicInfo>
              </TabPane>
            </Tabs>
          </Card>
          <div>{subContent}</div>
          {this.props.params && this.props.params.refund ? (
            ''
          ) : (
              <Affix
                offsetBottom={0}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  marginLeft: '-35px',
                  width: '100%',
                  height: '50px',
                  boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
                  background: '#fff',
                  lineHeight: '50px',
                  zIndex: 1,
                }}
              >
                {headerData.status &&
                  (headerData.status === 1001 ||
                    headerData.status === 1003 ||
                    headerData.status === 1005)
                  ? newState
                  : otherState}
              </Affix>
            )}
          <SlideFrame
            title={slideFrameTitle}
            show={addShowSlideFrame}
            onClose={this.addCloseFunc}
            afterClose={this.addHandleCloseSlide}
            width="800px"
            hasFooter={false}
          >
            <AddPaymentRequsition
              params={{
                id: this.props.id,
                headerData: headerData,
                record,
                typeDeatilParams,
                flag: addShowSlideFrame,
              }}
              onClose={e => {
                this.addCloseFunc(e);
              }}
            />
          </SlideFrame>
          <SlideFrame
            title={slideFrameTitle}
            show={showSlideFrame}
            afterClose={this.handleCloseSlide}
            width="800px"
            onClose={e => {
              this.closeFunc(false);
            }}
            hasFooter={false}
          >
            <NewPaymentRequisitionLine
              params={{
                id: this.props.id,
                headerData: headerData,
                record,
                typeDeatilParams,
                flag: showSlideFrame,
              }}
              onClose={e => {
                this.closeFunc(e);
              }}
            />
          </SlideFrame>
          <Modal
            visible={this.state.showExpreportDetail}
            footer={[
              <Button key="back" onClick={this.onCloseExpreport}>
                {this.$t({ id: 'common.back' } /* 返回*/)}
              </Button>,
            ]}
            width={1200}
            closable={false}
            destroyOnClose={true}
            onCancel={this.onCloseExpreport}
          >
            <div>{this.wrapClose(ExpreportDetail)}</div>
          </Modal>

          <Modal
            visible={this.state.showContractDetail}
            footer={[
              <Button key="back" onClick={this.onCloseContract}>
                {this.$t({ id: 'common.back' } /* 返回*/)}
              </Button>
            ]}
            width={1200}
            destroyOnClose={true}
            closable={false}
            onCancel={this.onCloseContract}
          >
            <div>{this.wrapClose(ContractDetail)}</div>
          </Modal>
        </Spin>
      </div>
    );
  }
}

const wrappedNewPaymentRequisitionDetail = Form.create()(NewPaymentRequisitionDetail);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    languages: state.languages,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewPaymentRequisitionDetail);
