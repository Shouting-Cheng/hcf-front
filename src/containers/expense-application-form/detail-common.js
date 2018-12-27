import React from 'react';
import config from 'config';
import httpFetch from 'share/httpFetch';
import { Form, Icon, Tag, Button, Row, Col, Spin, Breadcrumb, message, Popover, Divider, Card } from 'antd';
import Table from 'widget/table'
import SlideFrame from 'widget/slide-frame';

import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import prePaymentService from 'containers/pre-payment/my-pre-payment/me-pre-payment.service';
import DocumentBasicInfo from 'components/Widget/Template/document-basic-info';
import moment from 'moment';
import PropTypes from 'prop-types';

import NewApplicationLine from "./new-application-line"

import service from "./service"

class PrePaymentCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planLoading: false,
      headerData: {},
      amountText: '',
      functionAmount: '',
      historyLoading: false, //控制审批历史记录是否loading
      columns: [{
        title: "序号",
        dataIndex: "number",
        align: "center",
        width: 90,
        render: (value, record, index) => (index + 1)
      }, {
        title: "申请类型",
        dataIndex: "expenseTypeName",
        align: "center",
        width: 150,
      }, {
        title: "申请金额",
        dataIndex: "amount",
        align: "center",
        width: 120,
        render: value => this.formatMoney(value)
      }, {
        title: "本位币金额",
        dataIndex: "functionalAmount",
        align: "center",
        width: 120,
        render: value => this.formatMoney(value)
      },
      {
        title: "备注",
        dataIndex: "remarks",
        align: "center"
      }],
      showSlideFrame: false,
      slideFrameTitle: '',
      record: {},
      approveHistory: [],
      id: '',
      companyId: '',
      flag: false,
      //传给单据信息组件的单据头数据参数
      headerInfo: {},
      backLoadding: false,
      lineInfo: {}
    };
  }


  componentDidMount() {

    const { headerData } = this.props;

    let headerInfo = {
      businessCode: headerData.documentNumber,
      createdDate: headerData.requisitionDate,
      formName: headerData.typeName,
      createByName: headerData.createdName,
      currencyCode: headerData.currency,
      totalAmount: headerData.totalFunctionAmount,
      statusCode: headerData.status,
      remark: headerData.remarks,
      infoList: [
        { label: '申请人', value: headerData.employeeName },
        { label: '公司', value: headerData.companyName },
        { label: '部门', value: headerData.departmentName },
      ],
      attachments: headerData.attachments,
    };

    this.setState({ headerInfo });


    this.getLineInfo();
  }


  //获取行数据
  getLineInfo = () => {
    const { headerData } = this.props;
    service.getApplicationLines(headerData.id).then(res => {
      let { headerInfo } = this.state;
      headerInfo.totalAmount = res.data.currencyAmount ? res.data.currencyAmount.amount : "0.00";
      this.setState({
        headerInfo,
        lineInfo: res.data
      })
    });
  }

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
        message.error('审批历史数据加载失败，请重试');
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
  handleCloseSlide = flag => {
    this.setState({ showSlideFrame: false }, () => {
      if (flag) {
        this.getLineInfo();
      }
    });
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
    const { lineInfo, functionAmount, columns, data, planLoading, pagination, slideFrameTitle, showSlideFrame, headerInfo, historyLoading, approveHistory, backLoadding } = this.state;
    const { headerData } = this.props;

    /**根据单据状态确定该显示什么按钮 */
    let status = null;
    if (headerData.status === 1001 || headerData.status === 1003 || headerData.status === 1005) {
      status = (
        <h3 className="header-title" style={{ textAlign: 'right', marginBottom: '10px' }}>
          <Button type="primary" onClick={this.edit}>
            编 辑
          </Button>
        </h3>
      );
    } else if (headerData.status === 1002 && this.props.flag) {
      status = (
        <h3 className="header-title" style={{ textAlign: 'right', marginBottom: '10px' }}>
          <Button loading={backLoadding} type="primary" onClick={this.back}>
            撤 回
          </Button>
        </h3>
      );
    } else {
      status = <h3 className="header-title" />;
    }

    return (
      <div className="pre-payment-common">
        <Card style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
          bodyStyle={{ padding: "24px 32px", paddingTop: 0 }} >
          <DocumentBasicInfo params={headerInfo}>{status}</DocumentBasicInfo>
        </Card>

        <Card style={{
          marginTop: 20,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
          title="申请信息"
        >
          <div className="table-header">
            <div className="table-header-buttons" style={{ float: 'left' }}>
              {(headerData.status === 1001 ||
                headerData.status === 1003 ||
                headerData.status === 1005) && (
                  <Button type="primary" onClick={this.addItem}>
                    新建申请信息
                  </Button>
                )}
            </div>
            {lineInfo.currencyAmount && (<div style={{ float: 'right' }}>
              <Breadcrumb style={{ marginBottom: '10px', lineHeight: "32px" }}>
                <Breadcrumb.Item>
                  申请金额:
                  <span style={{ color: 'green' }}>{" " + lineInfo.currencyAmount.currencyCode} {this.filterMoney(lineInfo.currencyAmount.amount)}</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  本币金额:<span style={{ color: 'green' }}>
                    {' ' + lineInfo.currencyAmount.currencyCode} {this.filterMoney(lineInfo.currencyAmount.functionalAmount)}
                  </span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>)}
          </div>
          <Table
            style={{ clear: 'both' }}
            rowKey={record => record.id}
            columns={columns}
            dataSource={lineInfo.lines || []}
            bordered
            loading={planLoading}
            size="middle"
            pagination={pagination}
            expandedRowRender={this.expandedRow}
          />
        </Card>

        <SlideFrame
          title={slideFrameTitle}
          show={showSlideFrame}
          onClose={() => this.showSlide(false)}
        >
          <NewApplicationLine
            close={this.handleCloseSlide}
            params={{}}
            headerData={this.props.headerData}
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
