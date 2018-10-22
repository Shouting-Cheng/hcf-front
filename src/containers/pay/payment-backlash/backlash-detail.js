import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import paymentService  from 'containers/pay/pay-workbench/pay-workbench.service'
import { Alert, Badge, Table, Card, Icon, Spin } from 'antd'
import { messages} from 'utils/utils'
import moment from 'moment'

class PaymentDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      billsColumns: [  //单据编号
        {title: messages('pay.refund.documentNumber'), dataIndex: 'documentCode', render: (number,record) => (<a onClick={()=>this.handleNum(record)}>{number}</a>)},
        {title: messages("pay.refund.documentTypeName"), dataIndex: 'documentTypeName'},
        {title: messages('common.currency'), dataIndex: 'currency'},
        {title: messages('pay.total.amount'), dataIndex: 'documentTotalAmount', render: this.filterMoney},
        {title: messages('common.applicant'), dataIndex: 'documentApplicant'}
      ],
      detailColumns: [//付款批次号
        {title: messages('pay.batch.number'), dataIndex: 'customerBatchNo'},
        {title: messages('pay.refund.billCode'), dataIndex: 'billcode'},//付款流水号
        {title: messages('common.currency'), dataIndex: 'currency'},
        {title: messages('pay.refund.amount'), dataIndex: 'payAmount', render: this.filterMoney},
        {title: messages("pay.way"), dataIndex: 'paymentTypeName'}
      ],
      financeColumns: [
        {title: messages('pay.abstract'), dataIndex: 'abstract', render:value => value || '-'},
        {title: messages('pay.company'), dataIndex: 'company', render:value => value || '-'},
        {title: messages('messages("chooser.data.costCenter")'), dataIndex: 'costCenter', render:value => value || '-'},
        {title: messages('pay.subject'), dataIndex: 'subject', render:value => value || '-'}
      ],
      offHistoryColumns: [
        {title: messages('common.sequence'), dataIndex: 'index', render: (value, record, index) => index + 1},
        {title: messages('pay.check.date'), dataIndex: 'writeOffDate', render: value => value ? moment(value).format('YYYY-MM-DD') : '-'},
        {title: messages('pay.refund.documentNumber'), dataIndex: 'documentCode', render:value => value || '-'},
        {title: messages('pay.checked.amount'), dataIndex: 'writeOffAmount', render: this.filterMoney},
        {title: messages('common.column.status'), dataIndex: 'status', render: status => <Badge text="" status={status ? 'success' : 'error'}/>},
      ],
      logColumns: [
        {title: messages('operate.log.operation.type'), dataIndex: 'operationTypeName'},//操作类型
        {title: messages('pay.operator'), dataIndex: 'operationMan'},
        {title: messages('pay.operation.time'), dataIndex: 'operationTime', render: value => moment(value).format('YYYY-MM-DD HH:mm:ss')},
        {title: messages('common.comment'), dataIndex: 'remark', width: '30%', render: value => value || '-'},
      ],
      payStatus: {
        W: {label: messages('pay.unpay'), state: 'default'},
        P: {label: messages('pay.paying'), state: 'processing'},
        S: {label: messages('pay.pay.success'), state: 'success'},
        F: {label: messages('pay.failed'), state: 'error'},
        R: {label: messages('pay.workbench.RePay'), state: 'warning'},
      },
      payStatusValue: '',
      billsData: [],
      detailData: [],
      financeData: [],
      offHistoryDate: [],
      logData: [],
      payWorkbench:  menuRoute.getRouteItem('pay-workbench','key'),    //付款工作台
      PayRequisitionDetail: "/pre-payment/me-pre-payment/pre-payment-detail/:id/prePayment", //预付款详情,
    };
  }

  handleNum = (params)=>{
    let path = this.state.PayRequisitionDetail.replace(':id', params.documentId);
    this.props.dispatch(
      routerRedux.push({
        pathname: path,
      })
    );
  };

  componentWillMount() {
    this.getInfo()
  }

  getInfo = () => {
    this.setState({loading: true});
    paymentService.getPayDetail(this.props.params.id).then(res => {
      if (res.status === 200) {
        this.setState({
          billsData: [res.data.payDocumentDTO],
          detailData: [res.data.payDetailDTO],
          financeData: [res.data.financialDTO],
          offHistoryDate: res.data.writeOffHistoryDTO,
          logData: res.data.operationDTO,
          payStatusValue: res.data.payStatus,
          loading: false
        })
      }
    })
  };

  handleBack = () => {
    this.context.router.replace(`${this.state.payWorkbench.url}?tab=${this.props.params.tab}&subTab=${this.props.params.subTab}`);
  };

  render(){
    const { loading, billsColumns, detailColumns, financeColumns, offHistoryColumns, logColumns, billsData, detailData, financeData, offHistoryDate, logData, payStatusValue, payStatus } = this.state;
    const gridLeftStyle = {
      width: '20%',
      textAlign: 'left',
      padding: '10px 8px'
    };
    const gridRightStyle = {
      width: '80%',
      textAlign: 'left',
      padding: '10px 8px'
    };
    return (
      <div className="payment-detail">
        <Spin spinning={loading}>
          {payStatusValue && <Alert message={<Badge text={payStatusValue ? payStatus[payStatusValue].label : ''}
                                                    status={payStatusValue ? payStatus[payStatusValue].state : 'default'}/>}
                                    type="info" className="top-result" />}
          <h3 className="header-title">{this.$t({id:"pay.workbench.detail.bills"})/*付款单据*/}</h3>
          <Table rowKey="documentCode"
                 columns={billsColumns}
                 dataSource={billsData}
                 pagination={false}
                 bordered
                 size="middle"/>
          <h3 className="header-title">{this.$t({id:"pay.workbench.detail.detail"})/*付款详情*/}</h3>
          <Table rowKey="draweeId"
                 columns={detailColumns}
                 dataSource={detailData}
                 pagination={false}
                 bordered
                 size="middle"/>
          {detailData[0] && (
            <div>
              <Card bordered={false}>
                <Card.Grid style={gridLeftStyle}>{messages('structure.description')}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].remark || '-'}</Card.Grid>
                <Card.Grid style={gridLeftStyle}>{messages('pay.pay.info')}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].draweeCompanyName} {detailData[0].draweeAccountName} {detailData[0].draweeAccountNumber}</Card.Grid>
                <Card.Grid style={gridLeftStyle}>{messages('pay.account.info')}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].currency} {detailData[0].exchangeRate}</Card.Grid>
                <Card.Grid style={gridLeftStyle}>{messages('pay.cashier')}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].draweeName}</Card.Grid>
              </Card>
              <Card bordered={false}>
                <Card.Grid style={gridLeftStyle}>{messages('pay.collection.type')}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].partnerCategoryName || '-'}</Card.Grid>
                <Card.Grid style={gridLeftStyle}>{messages('pay.collection.info')}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].payeeAccountName} {detailData[0].payeeAccountNumber}</Card.Grid>
              </Card>
            </div>
          )}
          <h3 className="header-title">{this.$t({id:"pay.workbench.detail.finance"})/*财务信息*/}</h3>
          <Table rowKey={(record, index) => index}
                 columns={financeColumns}
                 dataSource={financeData}
                 pagination={false}
                 bordered
                 size="middle"/>
          {/*借款单 或 预付款单*/}
          {billsData[0] && (billsData[0].documentTypeCode === 'PAYMENT_REQUISITION' || billsData[0].documentTypeCode === 'PREPAYMENT_REQUISITION') && (
            <div>
              <h3 className="header-title">核销历史</h3>
              <Table rowKey="id"
                     columns={offHistoryColumns}
                     dataSource={offHistoryDate}
                     pagination={false}
                     bordered
                     size="middle"/>
            </div>
          )}
          <h3 className="header-title">{this.$t({id:"pay.workbench.detail.log"})/*操作日志*/}</h3>
          <Table rowKey={(record, index) => index}
                 columns={logColumns}
                 dataSource={logData}
                 pagination={false}
                 style={{marginBottom:'50px'}}
                 expandedRowRender={record => <p>{record.bankMessage || messages("wait.for.billing.none")}</p>}
                 size="middle"/>
          <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}>
            <Icon type="rollback" style={{marginRight:'5px'}}/>{messages('common.back')}
          </a>
        </Spin>
      </div>
    )
  }

}

PaymentDetail.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(PaymentDetail);
