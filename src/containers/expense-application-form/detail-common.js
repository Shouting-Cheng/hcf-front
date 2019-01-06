import React from 'react';
import { connect } from 'dva';
import { Form, Button, Row, Col, Breadcrumb, message, Divider, Card } from 'antd';
import Table from 'widget/table'
import SlideFrame from 'widget/slide-frame';
import { routerRedux } from 'dva/router';
import DocumentBasicInfo from 'components/Widget/Template/document-basic-info';
import moment from 'moment';
import PropTypes from 'prop-types';
import NewApplicationLine from "./new-application-line"
import ApproveHistory from 'containers/pre-payment/my-pre-payment/approve-history-work-flow';
import service from "./service"

import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss';


class PrePaymentCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lineLoading: false,
      historyLoading: false, //控制审批历史记录是否loading
      columns: [{
        title: "序号",
        dataIndex: "number",
        align: "center",
        width: 90,
        render: (value, record, index) => ((this.state.pagination.current - 1) * this.state.pagination.pageSize + index + 1)
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
      }, {
        title: "备注",
        dataIndex: "remarks",
        align: "center"
      }, {
        title: "操作",
        dataIndex: "options",
        width: 120,
        align: "center",
        render: (value, record) =>
          (<span>
            <a onClick={() => this.editItem(record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.deleteLine(record)}>删除</a>
          </span>)
      }],
      showSlideFrame: false,
      slideFrameTitle: '',
      record: {},
      approveHistory: [],
      headerInfo: {},
      backLoadding: false,
      lineInfo: {},
      pagination: {
        current: 1,
        showSizeChanger: true,
        pageSize: 5,
        pageSizeOptions: ["5", "10", "20", "50", "100"],
        showTotal: total => `共${total}条数据`
      }
    };
  }


  componentDidMount() {

    const { headerData } = this.props;
    let headerInfo = {
      businessCode: headerData.documentNumber,
      createdDate: headerData.requisitionDate,
      formName: headerData.typeName,
      createByName: headerData.createdName,
      currencyCode: headerData.currencyCode,
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

    if (headerData.associateContract) {
      headerInfo.infoList.push({ label: '关联合同', value: headerData.contractNumber, linkId: headerData.contractHeaderId });
    }

    let { columns } = this.state;
    if (headerData.status === 1002) {
      columns.splice(columns.length - 1, 1);
    }

    this.setState({ headerInfo, columns }, () => {
      this.getLineInfo();
    });

    this.getApproveHistory();
  }

  //获取行数据
  getLineInfo = () => {
    const { headerData } = this.props;
    const { pagination: { pageSize, current }, pagination } = this.state;
    this.setState({ lineLoading: true });
    service.getApplicationLines(headerData.id, { size: pageSize, page: current - 1 }).then(res => {
      let { headerInfo } = this.state;
      headerInfo.totalAmount = res.data.currencyAmount ? res.data.currencyAmount.amount : "0.00";
      this.setState({
        headerInfo,
        lineInfo: res.data,
        lineLoading: false,
        pagination: { ...pagination, total: Number(res.headers["x-total-count"]) }
      })
    }).catch(err => {
      message.error(err.response.data.message);
    })
  }

  //获取审批历史数据
  getApproveHistory = () => {
    this.setState({ historyLoading: true });
    service.getHistory(this.props.headerData.applicationOid).then(res => {
      this.setState({ approveHistory: res.data, historyLoading: false });
    }).catch(err => {
      message.error(err.response.data.message);
      this.setState({ historyLoading: false });
    })
  };

  //删除行数据
  deleteLine = ({ id }) => {
    service.deleteLine(id).then(res => {
      message.success("删除成功！");
      let { pagination } = this.state;
      pagination.current = 1;
      this.setState({ pagination }, () => {
        this.getLineInfo();
      })
    }).catch(err => {
      message.error(err.response.data.message);
    })
  }

  //侧滑
  showSlide = flag => {
    this.setState({ showSlideFrame: flag, record: {} });
  };

  //关闭侧滑
  handleCloseSlide = flag => {
    let { pagination } = this.state;
    this.setState({ showSlideFrame: false, record: {}, }, () => {
      if (flag) {
        pagination.current = 1;
        this.setState({ pagination }, this.getLineInfo)
      }
    });
  };

  //编辑
  edit = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/expense-application/edit-expense-application/` + this.props.headerData.id,
      })
    );
  };

  //取消
  onCancel = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: "/expense-application"
      })
    );
  };

  //撤销
  back = () => {
    let params = {
      entities: [{
        entityOID: this.props.headerData.documentOid,
        entityType: 801009,
      }]
    };
    this.setState({ backLoadding: true });
    service.withdraw(params).then(res => {
      this.setState({ backLoadding: false });
      message.success("撤回成功！");
      this.onCancel();
    }).catch(err => {
      this.setState({ backLoadding: false });
      message.error(err.response.data.message);
    })
  };

  //添加行信息
  addItem = () => {
    this.setState({ showSlideFrame: true, slideFrameTitle: "新建申请单行" });
  };

  //编辑行信息
  editItem = (record) => {
    this.setState({ record }, () => {
      this.setState({ showSlideFrame: true, slideFrameTitle: "编辑申请单行" });
    });
  };

  //扩展行
  expandedRow = record => {
    if (record.currencyCode == this.props.company.baseCurrency) return null;
    return (<div>
      <Row>
        <Col span={2}>
          <span style={{ float: 'right' }}>金额属性</span>
        </Col>
        <Col span={6} offset={1}>
          汇率日期：{moment(record.exchangeDate).format("YYYY-MM-DD")}
        </Col>
        <Col span={6}>汇率：{record.exchangeRate}</Col>
      </Row>
    </div>);
  };

  tableChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.getLineInfo();
    });
  }

  render() {
    const { lineInfo, columns, record, lineLoading, pagination, slideFrameTitle, showSlideFrame, headerInfo, historyLoading, approveHistory, backLoadding } = this.state;
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
                    {' ' + this.props.company.baseCurrency} {this.filterMoney(lineInfo.currencyAmount.functionalAmount)}
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
            loading={lineLoading}
            size="middle"
            pagination={pagination}
            expandedRowRender={this.expandedRow}
            onChange={this.tableChange}
          />
        </Card>

        <div
          style={{
            marginTop: 20,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <ApproveHistory loading={historyLoading} infoData={approveHistory} />
        </div>

        <SlideFrame
          title={slideFrameTitle}
          show={showSlideFrame}
          onClose={() => this.showSlide(false)}
        >
          <NewApplicationLine
            close={this.handleCloseSlide}
            params={{}}
            headerData={this.props.headerData}
            lineId={record.id}
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
