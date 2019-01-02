/**
 * Created by 付德宝 on 2017/12/5.
 */
import React from 'react';
import config from 'config';
import httpFetch from 'share/httpFetch';
// import menuRoute from 'routes/menuRoute'
import { Form, Icon, Tag, Tabs, Button, Row, Col, Spin, Breadcrumb, Timeline, message, Popover, Popconfirm, Divider, Card, Drawer, } from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
import SlideFrame from 'widget/slide-frame';
import NewPrePaymentDetail from 'containers/pre-payment/my-pre-payment/new-pre-payment-detail';
// import 'styles/contract/my-contract/contract-detail.scss'
// import 'styles/reimburse/reimburse-common.scss'
import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import ApproveHistory from 'containers/pre-payment/my-pre-payment/approve-history-work-flow';
import prePaymentService from 'containers/pre-payment/my-pre-payment/me-pre-payment.service';
import DocumentBasicInfo from 'widget/Template/document-basic-info';
import moment from 'moment';
import PropTypes from 'prop-types';

class PrePaymentCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planLoading: false,
      headerData: {},
      amountText: '',
      functionAmount: '',
      historyLoading: false, //控制审批历史记录是否loading
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          align: 'center',
          width: 50,
          render: (value, record, index) => index + this.state.indexAdd + 1,
        },
        {
          title: '预付款金额',
          dataIndex: 'amount',
          width: 120,
          align: 'center',
          render: (value, record) => {
            return (
              <span className="money-cell">
                {record.currency + '  ' + record.amount.toFixed(2)}
              </span>
            );
          },
        },
        {
          title: '预付款类型',
          width: 110,
          dataIndex: 'cshTransactionClassName',
          align: 'center',
          render: cshTransactionClassName => {
            return <Popover content={cshTransactionClassName}>{cshTransactionClassName}</Popover>;
          },
        },
        {
          title: '收款对象',
          width: 80,
          dataIndex: 'currency',
          align: 'center',
          render: (value, record) => {
            return (
              <div>
                <Tag color="#000">{record.partnerCategory == 'EMPLOYEE' ? '员工' : '供应商'}</Tag>
                <div style={{ whiteSpace: 'normal' }}>{record.partnerName}</div>
              </div>
            );
          },
        },
        {
          title: '收款账户',
          width: 210,
          align: 'center',
          dataIndex: 'partnerId',
          render: (value, record) => {
            return (
              <div>
                <div>户名：{record.accountName}</div>
                <div>账户：{record.accountNumber}</div>
              </div>
            );
          },
        },
        {
          title: '付款属性',
          align: 'center',
          dataIndex: 'refDocumentCode',
          width: 200,
          render: (value, record) => {
            return (
              <Popover
                content={
                  <div style={{ whiteSpace: 'normal' }}>
                    <div>
                      计划付款日期：{record.requisitionPaymentDate
                        ? moment(record.requisitionPaymentDate).format('YYYY-MM-DD')
                        : ''}
                    </div>
                    <div>付款方式类型：{record.paymentMethodName}</div>
                  </div>
                }
              >
                <div style={{ whiteSpace: 'normal' }}>
                  <div>
                    计划付款日期：{record.requisitionPaymentDate
                      ? moment(record.requisitionPaymentDate).format('YYYY-MM-DD')
                      : ''}
                  </div>
                  <div>付款方式类型：{record.paymentMethodName}</div>
                </div>
              </Popover>
            );
          },
        },
        {
          title: '备注',
          dataIndex: 'description',
          align: 'center',
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
      pagination: {
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
      },
      pageSize: 5,
      page: 0,
      indexAdd: 0, //index增量，用于控制序号显示
      showSlideFrame: false,
      slideFrameTitle: '',
      record: {},
      approveHistory: [],
      id: '',
      companyId: '',
      flag: false,
      // NewContract: menuRoute.getRouteItem('new-contract', 'key'), //新建合同
      // EditPayRequisition: menuRoute.getRouteItem('edit-pre-payment', 'key'), //新建预付款
      // ContractDetail: menuRoute.getRouteItem('contract-detail', 'key'), //合同详情
      // myPrePayment: menuRoute.getRouteItem('me-pre-payment', 'key'),
      //传给单据信息组件的单据头数据参数
      headerInfo: {},
      backLoadding: false,
    };
  }
  /**
   * 生命周期函数，重新渲染
   */

  /*componentDidMount(){
    const { columns } = this.state;
    if ((this.props.params.status === 1001 || this.props.params.status === 1003 || this.props.params.status === 1005) && columns[columns.length-1].dataIndex !="id") {
      columns.splice(columns.length, 0, {
        title: '操作', dataIndex: 'id', width: 100, align: "center",
        render: (text, record) => (
          <span>
            <a onClick={(e) => this.editItem(e, record)}>编辑</a>
            <span className="ant-divider" />
            <Popconfirm title="确认删除吗？" onConfirm={(e) => this.deleteItem(e, record)}><a>删除</a></Popconfirm>
          </span>
        )
      })
    }
    if (this.props.params.id) {
      this.setState({
        headerData: this.props.params
      }, () => {
        this.getApproveHistory();
        this.getList();
        this.getAmountByHeadId();
      });
    }
  }*/

  componentWillReceiveProps(nextProps) {
    const { columns } = this.state;
    if (
      nextProps.params.status === 1001 ||
      nextProps.params.status === 1003 ||
      nextProps.params.status === 1005
    ) {
      columns.splice(columns.length, 0, {
        title: '操作',
        dataIndex: 'id',
        width: 100,
        align: 'center',
        render: (text, record) => (
          <span>
            <a onClick={e => this.editItem(e, record)}>编辑</a>
            <span className="ant-divider" />
            <Popconfirm title="确认删除吗？" onConfirm={e => this.deleteItem(e, record)}>
              <a>删除</a>
            </Popconfirm>
          </span>
        ),
      });
    }
    if (nextProps.params.id) {
      this.setState(
        {
          headerData: nextProps.params,
        },
        () => {
          this.getApproveHistory();
          this.getList();
          this.getAmountByHeadId();
        }
      );
    }
  }
  /**
   * 获取预付款头信息
   */
  getInfo = () => {
    prePaymentService
      .getHeadById(this.props.params.id)
      .then(res => {
        this.setState({
          headerData: res.data,
        });
      })
      .catch(e => {
        message.error('预付款单据信息数据加载失败，请重试');
      });
  };
  /**
   * 获取审批历史数据
   */
  getApproveHistory = () => {
    this.setState({
      historyLoading: true,
    });
    let oid = this.state.headerData.documentOid ? this.state.headerData.documentOid : '';
    prePaymentService
      .getApproveHistoryWorkflow(oid)
      .then(res => {
        this.setState({ historyLoading: false, approveHistory: res.data });
      })
      .catch(error => {
        console.log(error);
        message.error('审批历史数据加载失败，请重试');
        this.setState({ historyLoading: false });
      });
  };
  //跳转到合同详情
  toContractDetail = contractId => {
    let url = this.state.ContractDetail.url
      .replace(':id', contractId)
      .replace(':from', 'pre-payment');
    window.open(url, '_blank');
  };
  //获取单据总金额
  getAmountByHeadId = () => {
    prePaymentService
      .getAmountByHeadId(this.props.id)
      .then(res => {
        //每次获取单据总金额时判断当前headerInfo是否有数据，没有的话就从headerData里面获取，有的话就直接更新它的总金额
        let { headerData, headerInfo } = this.state;
        if (!headerInfo.businessCode) {
          headerInfo = {
            businessCode: headerData.requisitionNumber,
            createdDate: headerData.requisitionDate,
            formName: headerData.typeName,
            createByName: headerData.createByName + "-" + headerData.createdByCode,
            currencyCode: headerData.currency,
            totalAmount: res.data.totalFunctionAmount,
            statusCode: headerData.status,
            remark: headerData.description,
            infoList: [
              { label: '申请人', value: headerData.employeeName + "-" + headerData.employeeCode },
              { label: '公司', value: headerData.companyName },
              { label: '部门', value: headerData.path },
            ],
            attachments: headerData.attachments,
          };
        } else {
          headerInfo.totalAmount = res.data.totalFunctionAmount;
        }
        this.setState({
          amount: res.data.CNY,
        });
        let temp = '';
        for (let key in res.data) {
          if (key != 'totalFunctionAmount') {
            temp += ` ${key} ${this.filterMoney(res.data[key], 2, true)} `;
          }
        }
        this.setState({
          amountText: temp,
          functionAmount: res.data.totalFunctionAmount,
          headerInfo,
        });
      })
      .catch(e => {
        console.log(e);
        message.error('单据金额数据加载失败，请重试');
        this.setState({ historyLoading: false });
      });
  };
  /**
   * 获取行数据
   */
  getList = () => {
    const { page, pageSize } = this.state;
    this.setState({ planLoading: true });
    let params = {
      headId: this.props.id,
      size: pageSize,
      page: page,
    };
    prePaymentService
      .getLineByHeadId(params)
      .then(res => {
        let headerData = this.state.headerData;
        // let columns = this.state.columns;
        // console.log
        // if (!(headerData.status === 1001 || headerData.status === 1003 || headerData.status === 1005)) {
        //   columns.splice(columns.length - 1, 1);
        // }
        this.setState({
          data: res.data,
          planLoading: false,
          indexAdd: page * pageSize,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            current: page + 1,
            onChange: this.onChangePaper,
            onShowSizeChange: this.onShowSizeChange,
            pageSize: pageSize,
            showTotal: (total, range) =>
              this.$t('common.show.total', {
                range0: `${range[0]}`,
                range1: `${range[1]}`,
                total: total,
              }),
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '30', '40'],
          },
          // columns
        });
      })
      .catch(e => {
        console.log(e);
        message.error('付款信息数据加载失败，请重试');
        this.setState({ historyLoading: false });
      });
  };

  onChangePaper = page => {
    let pagination = this.state.pagination;
    pagination.current = page;
    this.setState({ page: page - 1, pagination }, this.getList);
  };

  /**
   * 切换每页显示的条数
   */
  onShowSizeChange = (current, pageSize) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    pagination.pageSize = pageSize;
    this.setState(
      {
        page: 0,
        pageSize: pageSize,
        pagination,
      },
      () => {
        this.getList();
      }
    );
  };
  //侧滑
  showSlide = flag => {
    this.setState({ showSlideFrame: flag, flag: flag });
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
  //关闭侧滑
  handleCloseSlide = params => {
    this.setState(
      {
        showSlideFrame: false,
        flag: false,
      },
      () => {
        if (params) {
          this.getList();
          this.getInfo();
          this.getAmountByHeadId();
        }
      }
    );
  };
  //编辑
  edit = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/pre-payment/my-pre-payment/edit-pre-payment/${this.props.id}/${0}/${0}`,
      })
    );
  };
  //取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/pre-payment/my-pre-payment`,
      })
    );
  };
  //撤销
  back = () => {
    const { applicationOid, empOid, formOid, documentOid, id } = this.state.headerData;
    this.setState({ backLoadding: true });
    let model = {
      entities: [
        {
          entityOID: documentOid,
          entityType: 801003,
        },
      ],
    };
    if (!formOid) {
      prePaymentService
        .back(id, this.props.user.id)
        .then(res => {
          if (res.status === 200) {
            message.success('撤回成功！');
            this.onCancel();
            this.setState({ backLoadding: false });
          }
        })
        .catch(e => {
          message.error(`撤回失败，${e.response.data.message}`);
          this.setState({ backLoadding: false });
        });
    } else {
      prePaymentService
        .backFromWorkflow(model)
        .then(res => {
          if (res.status === 200) {
            message.success('撤回成功！');
            this.onCancel();
            this.setState({ backLoadding: false });
          }
        })
        .catch(e => {
          message.error(`撤回失败，${e.response.data.message}`);
          this.setState({ backLoadding: false });
        });
    }
  };
  //添加预付款行信息
  addItem = () => {
    this.setState({
      record: {
        payMethodsType: this.state.headerData.paymentMethod,
        isApply: this.state.headerData.ifApplication,
        paymentMethodCode: this.state.headerData.paymentMethodCode,
      },
      slideFrameTitle: '新增付款计划',
      id: this.props.id,
      companyId: this.state.headerData.companyId,
      paymentReqTypeId: this.state.headerData.paymentReqTypeId,
      flag: true,
      showSlideFrame: true,
    });
  };
  //编辑预付款行信息
  editItem = (e, record) => {
    e.preventDefault();
    this.setState({
      record: {
        ...record,
        payMethodsType: this.state.headerData.paymentMethod,
        isApply: this.state.headerData.ifApplication,
        paymentMethodCode: this.state.headerData.paymentMethodCode,
      },
      slideFrameTitle: '编辑付款计划',
      id: this.props.id,
      companyId: this.state.headerData.companyId,
      paymentReqTypeId: this.state.headerData.paymentReqTypeId,
      flag: true,
      showSlideFrame: true,
    });
  };
  //删除预付款行信息
  deleteItem = (e, record) => {
    e.preventDefault();
    let url = `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/deleteLineById?lineId=${
      record.id
      }`;
    this.setState({ planLoading: true });
    httpFetch
      .delete(url)
      .then(() => {
        message.success(`删除成功`);
        this.getList();
        this.getInfo();
        this.getAmountByHeadId();
      })
      .catch(e => {
        this.setState({ planLoading: false });
        message.error(`删除失败，${e.response.data.message}`);
      });
  };
  /**
   * 扩展行
   */
  expandedRow = record => {
    return (
      <div>
        <Row>
          <Col span={2}>
            <span style={{ float: 'right' }}>金额属性</span>
          </Col>
          <Col span={6} offset={1}>
            汇率日期：
          </Col>
          <Col span={6}>汇率：{record.exchangeRate}</Col>
          <Col span={5}>
            {' '}
            本币金额：{record.currency}&nbsp; {this.filterMoney(record.functionAmount, 2, true)}
          </Col>
        </Row>

        {record.contractName ? (
          <div>
            <Divider />
            <Row>
              <Col span={2}>
                <span style={{ float: 'right' }}>关联合同</span>
              </Col>
              <Col span={6} offset={1}>
                <span>合同名称：{record.contractName}</span>
              </Col>
              <Col span={6}>
                <span>合同编号：</span>
                <a>{record.contractNumber ? record.contractNumber : '-'}</a>
              </Col>
              <Col span={4}>计划付款行行号：{record.contractLineNumber}</Col>
              <Col span={5}> 计划付款日期：{moment(record.dueDate).format('YYYY-MM-DD')}</Col>
            </Row>
          </div>
        ) : null}

        {record.refDocumentCode ? (
          <div>
            <Divider />
            <Row>
              <Col span={2}>
                <span style={{ float: 'right' }}>关联申请单</span>
              </Col>
              <Col span={6} offset={1} className="over-range">
                <span>申请单编号：</span>
                <a>{record.refDocumentCode}</a>
              </Col>
              <Col span={6}>
                申请单金额：{record.currency}&nbsp;{this.filterMoney(
                  record.refDocumentTotalAmount,
                  2,
                  true
                )}
              </Col>
            </Row>
          </div>
        ) : null}
        {Number(record.returnAmount) === 0 && Number(record.payAmount) === 0 ? null : (
          <div>
            <Divider />
            <Row>
              <Col span={2}>
                <span style={{ float: 'right' }}>付款日志</span>
              </Col>
              <Col span={6} offset={1}>
                已付款总金额：{record.currency}&nbsp;{this.filterMoney(record.payAmount, 2, true)}
              </Col>
              <Col span={6}>
                退款总金额：{record.currency}&nbsp;{this.filterMoney(record.returnAmount, 2, true)}
              </Col>
            </Row>
          </div>
        )}

        {record.reportWriteOffDTOS
          ? record.reportWriteOffDTOS.map((item, index) => {
            if (index === 0) {
              return (
                <div>
                  <Divider />
                  <Row>
                    <Col span={2}>
                      <span style={{ float: 'right' }}>被核销历史</span>
                    </Col>
                    <Col span={6} offset={1} className="over-range">
                      <span>报账单编号：{item.reportNumber}</span>
                      <a>{item.reportNumber}</a>
                    </Col>
                    <Col span={6}>
                      被核销金额：{record.currency}&nbsp;{this.filterMoney(
                        item.writeOffAmount,
                        2,
                        true
                      )}
                    </Col>
                    <Col span={5}>交易日期：{moment(item.tranDate).format('YYYY-MM-DD')}</Col>
                    <Col span={4}>
                      核销状态：{item.reportStatus === 'p' ? '核销中' : '核销完成'}
                    </Col>
                  </Row>
                </div>
              );
            } else {
              return (
                <div>
                  <Divider />
                  <Row>
                    <Col span={2}>
                      <span style={{ float: 'right' }} />
                    </Col>
                    <Col span={6} offset={1} className="over-range">
                      <Popover content={<span>报账单编号：{item.reportNumber}</span>}>
                        报账单编号：{item.reportNumber}
                      </Popover>
                    </Col>
                    <Col span={6}>
                      被核销金额：{record.currency}&nbsp;{this.filterMoney(
                        item.writeOffAmount,
                        2,
                        true
                      )}
                    </Col>
                    <Col span={5}>交易日期：{moment(item.tranDate).format('YYYY-MM-DD')}</Col>
                    <Col span={4}>
                      核销状态：{item.reportStatus === 'p' ? '核销中' : '核销完成'}
                    </Col>
                  </Row>
                </div>
              );
            }
          })
          : null}
      </div>
    );
  };
  /**
   * 渲染函数
   */
  render() {
    const { headerData, record } = this.state;
    //付款信息
    const { amountText, functionAmount, columns, data, planLoading, pagination } = this.state;
    //侧滑
    const { slideFrameTitle, showSlideFrame } = this.state;
    //单据信息
    const { headerInfo } = this.state;
    //审批历史
    const { historyLoading, approveHistory, backLoadding } = this.state;

    /**根据单据状态确定该显示什么按钮 */
    let status = null;
    if (headerData.status === 1001 || headerData.status === 1003 || headerData.status === 1005) {
      status = (
        <h3 className="header-title" style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={this.edit}>
            编 辑
          </Button>
        </h3>
      );
    } else if (headerData.status === 1002 && this.props.flag) {
      status = (
        <h3 className="header-title" style={{ textAlign: 'right' }}>
          <Button loading={backLoadding} type="primary" onClick={this.back}>
            撤 回
          </Button>
        </h3>
      );
    } else {
      status = <h3 className="header-title" />;
    }
    let subContent = {};
    subContent = (
      <div>
        <Spin spinning={false}>
          <Card
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', marginRight: 15, marginLeft: 15 }}
          >
            <Tabs defaultActiveKey="1" onChange={this.tabChange} forceRender>
              <TabPane tab="单据信息" key="1">
                <DocumentBasicInfo params={headerInfo}>{status}</DocumentBasicInfo>
              </TabPane>
              {/* <TabPane tab="凭证信息" key="2">
              </TabPane> */}
            </Tabs>
          </Card>
          <Card
            style={{
              marginTop: 20,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              marginRight: 15,
              marginLeft: 15,
            }}
            title="付款信息"
          >
            <div className="table-header">
              <div className="table-header-buttons" style={{ float: 'left' }}>
                {(headerData.status === 1001 ||
                  headerData.status === 1003 ||
                  headerData.status === 1005) && (
                    <Button type="primary" onClick={this.addItem}>
                      新建付款信息
                  </Button>
                  )}
              </div>
              {amountText !== '' ? (
                <div style={{ float: 'right' }}>
                  <Breadcrumb style={{ marginBottom: '10px' }}>
                    <Breadcrumb.Item>
                      金额:<span style={{ color: 'Green' }}>{amountText}</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                      本币金额:<span style={{ color: 'Green' }}>
                        {' '}
                        {this.props.company.baseCurrency} {this.filterMoney(functionAmount)}
                      </span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>
              ) : null}
            </div>
            <Table
              style={{ clear: 'both' }}
              rowKey={record => record.id}
              columns={columns}
              dataSource={data}
              bordered
              loading={planLoading}
              size="middle"
              pagination={pagination}
              expandedRowRender={this.expandedRow}
            />
          </Card>
          <div
            style={{
              marginTop: 20,
              marginRight: 15,
              marginLeft: 15,
              marginBottom: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <ApproveHistory loading={historyLoading} infoData={approveHistory} />
          </div>
        </Spin>
      </div>
    );
    return (
      <div className="pre-payment-common">
        {subContent}
        <SlideFrame
          title={slideFrameTitle}
          show={showSlideFrame}
          onClose={() => this.showSlide(false)}
        >
          <NewPrePaymentDetail
            onClose={this.handleCloseSlide}
            params={{
              id: this.state.id,
              paymentReqTypeId: this.state.paymentReqTypeId,
              companyId: this.state.companyId,
              flag: this.state.flag,
              remark: this.state.headerData.description,
              record,
              headerData: this.state.headerData,
            }}
          />
        </SlideFrame>
      </div>
    );
  }
}

PrePaymentCommon.propTypes = {
  id: PropTypes.any.isRequired, //显示数据
  flag: PropTypes.bool, //是否显示审批历史
};

PrePaymentCommon.defaultProps = {
  flag: true,
};

const wrappedPrePaymentCommon = Form.create()(PrePaymentCommon);
function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedPrePaymentCommon);
