import {messages} from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import paymentService  from './pay-workbench.service'
import { Alert, Badge, Card, Icon, Spin, Button, Modal } from 'antd';
import Table from 'widget/table'
import PaymentRequisitionDetail from 'containers/payment-requisition/new-payment-requisition-detail' //付款申请单
import PublicReport from 'containers/reimburse/my-reimburse/reimburse-detail' // 对公报账单
import PrepaymentDetail from 'containers/pre-payment/my-pre-payment/pre-payment-detail'
import moment from 'moment'
import 'styles/pay/pay-workbench/payment-detail.scss'
import PropTypes from 'prop-types';



class PaymentDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showDetail:false,
      detailFlag:'',
      detailId:undefined,
      billsColumns: [  //单据编号
        {title: messages('pay.workbench.receiptNumber'), dataIndex: 'documentCode', render: (number,record) => (<a onClick={()=>this.handleNum(record)}>{number}</a>)},
        {title: messages('pay.workbench.receiptType'), dataIndex: 'documentTypeName'},//单据类型
        {title: messages('common.currency'), dataIndex: 'currency'},//币种
        {title: messages('pay.total.amount'), dataIndex: 'documentTotalAmount', render: this.filterMoney}, //单据总金额
        {title: messages('common.applicant'), dataIndex: 'documentApplicant'}  //申请人
      ],
      detailColumns: [//付款批次号
        {title: messages('pay.batch.number'), dataIndex: 'customerBatchNo'},
        {title: messages('pay.refund.billCode'), dataIndex: 'billcode'},
        {title: messages('common.currency'), dataIndex: 'currency'},
        {title: messages('pay.refund.amount'), dataIndex: 'payAmount', render: this.filterMoney},
        {title: messages('payment.batch.company.payWay'), dataIndex: 'paymentTypeName'}
      ],
      financeColumns: [
        {title: messages('pay.abstract'), dataIndex: 'abstract', render:value => value || '-'},
        {title: messages('pay.company'), dataIndex: 'company', render:value => value || '-'},
        {title: messages("chooser.data.costCenter"), dataIndex: 'costCenter', render:value => value || '-'},
        {title: messages('accounting.subject'), dataIndex: 'subject', render:value => value || '-'}
      ],
      offHistoryColumns: [
        {title: messages('common.sequence'), dataIndex: 'index', render: (value, record, index) => index + 1},
        {title: messages('pay.check.date'), dataIndex: 'writeOffDate', render: value => value ? moment(value).format('YYYY-MM-DD') : '-'},
        {title: messages('pay.refund.documentNumber'), dataIndex: 'documentCode', render:value => value || '-'},
        {title: messages('pay.checked.amount'), dataIndex: 'writeOffAmount', render: this.filterMoney},
        {title: messages('common.column.status'), dataIndex: 'status', render: status => <Badge text="" status={status ? 'success' : 'error'}/>},
      ],
      logColumns: [//操作类型
        {title: messages('operate.log.operation.type'), dataIndex: 'operationTypeName'},
        {title: messages('pay.operator'), dataIndex: 'operationMan'},
        {title: messages('pay.operation.time'), dataIndex: 'operationTime', render: value => moment(value).format('YYYY-MM-DD HH:mm:ss')},
        {title: messages('common.comment'), dataIndex: 'remark', width: '30%', render: value => value || '-'},
      ],
      payStatus: {  //待支付
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
      payWorkbench:  "/pay/pay-workbench",    //付款工作台
      id:null
    };
  }

  handleNum = (params)=>{
    this.setState({
      showDetail:true,
      detailId: params.documentId,
      detailFlag: params.documentCategory
    })
  };

  componentWillMount() {
    this.getInfo();
  }

  /*componentWillReceiveProps(nextProps){
    if(nextProps.params.flag&&!this.props.match.params.flag){
      this.getInfo(nextProps.params.id)
    }
  }*/

  getInfo = (id) => {
    let detailId ;
    if (this.props.params && this.props.params.refund){
      detailId = this.props.params.id;
    }else{
      detailId = this.props.match.params.id
    }
    this.setState({loading: true});
    paymentService.getPayDetail(id||detailId).then(res => {
      if (res.status === 200) {
        this.setState({
          billsData: [res.data.payDocumentDTO],
          detailData: [res.data.payDetailDTO],
          financeData: [res.data.financialDTO],
          offHistoryDate: res.data.writeOffHistoryDTO,
          logData: res.data.operationDTO,
          payStatusValue: res.data.payStatus,
          loading: false,
          id: detailId
        })
      }
    })
  };

  handleBack = () => {
    let url = `${this.state.payWorkbench}/${this.props.match.params.tab}`;
    this.props.dispatch(
      routerRedux.replace({
          pathname: url
        }
      )
    );
  };
  //弹出框关闭
  onClose =() =>{
    this.setState({
      showDetail:false
    })
  };

  wrapClose = (content) =>{
    let id = this.state.detailId;
    const newProps = {
      params: {id : id, refund : true}
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };

  render(){

    const { detailFlag,showDetail,loading, billsColumns, detailColumns, financeColumns, offHistoryColumns, logColumns, billsData, detailData, financeData, offHistoryDate, logData, payStatusValue, payStatus, id } = this.state;
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
      <div className="payment-detail" style={{paddingBottom: 20}}>
        <Spin spinning={loading}>
          {payStatusValue && <Alert message={<Badge text={payStatusValue ? payStatus[payStatusValue].label : ''}
                                                    status={payStatusValue ? payStatus[payStatusValue].state : 'default'}/>}
                                    type="info" className="top-result" />}
          <h3 className="header-title">{messages('pay.workbench.detail.bills')/*付款单据*/}</h3>
          <Table rowKey="documentCode"
                 columns={billsColumns}
                 dataSource={billsData}
                 pagination={false}
                 bordered
                 size="middle"/>
          <h3 className="header-title">{messages('pay.workbench.detail.detail')/*付款详情*/}</h3>
          <Table rowKey="draweeId"
                 columns={detailColumns}
                 dataSource={detailData}
                 pagination={false}
                 bordered
                 size="middle"/>
          {detailData[0] && (
            <div>
              <Card bordered={false}>
                <Card.Grid style={gridLeftStyle}>{messages("person.group.desc")}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].remark || '-'}</Card.Grid>
                <Card.Grid style={gridLeftStyle}>{messages('pay.pay.info')}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{detailData[0].draweeCompanyName} {detailData[0].draweeAccountName} {detailData[0].draweeAccountNumber}</Card.Grid>
                <Card.Grid style={gridLeftStyle}>{messages("pay.account.info")}：</Card.Grid>
                <Card.Grid style={gridRightStyle}>{messages('common.currency')+': '+detailData[0].currency} &nbsp;&nbsp;{messages('common.currency.rate')+': '+detailData[0].exchangeRate}</Card.Grid>
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
          <h3 className="header-title">{messages('pay.workbench.detail.finance')/*财务信息*/}</h3>
          <Table rowKey={(record, index) => index}
                 columns={financeColumns}
                 dataSource={financeData}
                 pagination={false}
                 bordered
                 size="middle"/>
          {/*借款单 或 预付款单*/}
          {billsData[0] && (billsData[0].documentTypeCode === 'PAYMENT_REQUISITION' || billsData[0].documentTypeCode === 'PREPAYMENT_REQUISITION') && (
            <div>
              <h3 className="header-title">{messages('pay.checked.history')}</h3>
              <Table rowKey="id"
                     columns={offHistoryColumns}
                     dataSource={offHistoryDate}
                     pagination={false}
                     bordered
                     size="middle"/>
            </div>
          )}
          <h3 className="header-title">{messages('pay.workbench.detail.log')/*操作日志*/}</h3>
          <Table rowKey={(record, index) => index}
                 columns={logColumns}
                 dataSource={logData}
                 pagination={false}
                 style={{marginBottom:'50px'}}
                 expandedRowRender={record => <p>{record.bankMessage || messages('wait.for.billing.none')}</p>}
                 size="middle"/>
            {this.props.params && this.props.params.refund  ?'':<a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}>
            <Icon type="rollback" style={{marginRight:'5px'}}/>{messages('common.back')/*返回*/}
          </a>}
        </Spin>

        <Modal visible={showDetail}
               footer={[
                 <Button key="back"  onClick={this.onClose}>{this.$t({id:"common.back"}/*返回*/)}</Button>
               ]}
               width={1200}
               destroyOnClose={true}
               closable={false}
               onCancel={this.onClose}>
          <div >
            { detailFlag === 'PAYDETAIL'? this.wrapClose(PayDetail) :
              detailFlag === 'ACP_REQUISITION'? this.wrapClose(PaymentRequisitionDetail) :
                detailFlag === 'PUBLIC_REPORT' ? this.wrapClose(PublicReport) : this.wrapClose(PrepaymentDetail) }
          </div>
        </Modal>
      </div>
    )
  }

}


function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(PaymentDetail);
