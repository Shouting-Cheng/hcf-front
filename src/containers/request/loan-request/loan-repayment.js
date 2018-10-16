import {messages} from "share/common";
import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import menuRoute from 'routes/menuRoute'
import SlideFrame from 'components/slide-frame'
import { Form, Table, Badge, Button } from 'antd'

import requestService from 'containers/request/request.service'
import NewRepaymentFrame from 'containers/request/loan-request/new-repayment-frame'
import RepaymentDetailFrame from 'containers/request/loan-request/repayment-detail-frame'

class LoanRepayment extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      columns: [
        {title: messages('request.detail.loan.date'/*日期*/), dataIndex: 'createDate', render: value => moment(value).format('YYYY-MM-DD')},
        {title: messages('request.detail.loan.payment.code'/*还款单号*/), dataIndex: 'businessCode'},
        {title: messages('request.detail.loan.payment.method'/*还款方式*/), dataIndex: 'type', render:
            value => value === '0' ? messages('request.detail.loan.payment.cash'/*现金还款*/) :
              value === '1' ? messages('request.detail.loan.payment.transfer'/*转账还款*/) : messages('request.detail.loan.payment.expense'/*报销单还款*/)},
        {title: messages('request.detail.loan.currency'/*币种*/), dataIndex: 'curreny'},
        {title: messages('request.detail.loan.payment.amount'/*还款金额*/), dataIndex: 'actRepayAmount', render:
          (value, record) => this.filterMoney(value || record.repaymentValue)},
        {title: messages('common.column.status'), dataIndex: 'status', render: value =>
          value === '1001' ? <Badge text={messages('request.detail.loan.in.the.payment')/*还款中*/} status="processing"/> :
          value === '1002' ?  <Badge text={messages('request.detail.loan.has.been.payment')/*已还款*/} status="success"/> :
            <Badge text={messages('request.detail.loan.rejected')/*被驳回*/} status="error"/>},
        {title: messages('request.detail.loan.card.no'/*凭证编号*/), dataIndex: 'origDocumentSequence', render: value => value || '-'}
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {},
      showNewSlide: false,
      showDetailSlide: false,
      newParams: {},
      detailParams: {},
      expenseDetail: menuRoute.getRouteItem('expense-report-detail-view','key'), //报销单详情页
      buttonRoleSwitch:this.props.isOwner?true:this.checkPageRole('LOANBILLMANAGEMENT', 2) && this.checkFunctionProfiles(['er.disabled'], [[false, undefined]]) && this.checkFunctionProfiles(['finance.audit.disabled'], [[false, undefined]]), //按钮操作权限
    }
  }

  componentDidMount() {
    const { info, applicationOID, showNewSlide } = this.props;
    this.setState({
      showNewSlide: showNewSlide,
      newParams: {
        currency: info.currencyCode,
        amount: info.writeoffArtificialDTO && (info.writeoffArtificialDTO.stayWriteoffAmount || info.totalAmount),
        info: info,
        hasInit: false,
        loanRefund: this.props.loanRefund
      }
    });
    !this.state.data.length && this.getList(applicationOID)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showNewSlide: nextProps.showNewSlide,
      newParams: {
        currency: nextProps.info.currencyCode,
        amount: nextProps.info.writeoffArtificialDTO && (nextProps.info.writeoffArtificialDTO.stayWriteoffAmount || nextProps.info.totalAmount),
        info: nextProps.info,
        hasInit: false,
        loanRefund: this.props.loanRefund
      }
    });
  }

  getList = (OID) => {
    const { page, pageSize } = this.state;
    this.setState({ loading: true });
    requestService.getLoanRepayment(page, pageSize, OID).then(res => {
      this.setState({
        loading: false,
        data: res.data,
        pagination: {
          total: Number(res.headers['x-total-count']) || 0,
          current: page + 1,
          onChange: this.onChangePaper
        }
      })
    })
  };

  onChangePaper = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList(this.props.applicationOID)
      })
    }
  };

  showNewSlide = (flag) => {
    this.setState({
      newParams: {
        currency: this.props.info.currencyCode,
        amount: this.props.info.writeoffArtificialDTO && (this.props.info.writeoffArtificialDTO.stayWriteoffAmount || this.props.info.totalAmount),
        info: this.props.info,
        hasInit: false,
        loanRefund: this.props.loanRefund
      }
    },() => {this.setState({ showNewSlide: flag })})
  };

  showDetailSlide = (flag) => {
    this.setState({ showDetailSlide: flag })
  };

  handleRowClick = (record) => {
    if (record.type === '2') {  //type===2(报销单还款)
      window.open(this.state.expenseDetail.url.replace(':expenseReportOID', record.expenseReportOid))
    } else {
      let repaymentInfo = this.props.info.writeoffArtificialDTO || {}; //还款信息
      this.setState({
        showDetailSlide: true,
        detailParams: {
          oid: record.repaymentOid,
          loanRefund: this.props.loanRefund,
          hasInit: false
        }
      })
    }
  };

  handleCloseSlide = (params) => {
    this.setState({ showNewSlide: false, showDetailSlide: false }, () => {
      this.props.handleClose();
      if(params) {
        this.getList(this.props.applicationOID);
        this.props.handleSave()
      }
    })
  };

  handleNewFrameClose = () => {
    this.showNewSlide(false);
    this.props.handleClose()
  };

  render() {
    const { info } = this.props;
    const { loading, columns, data, pagination, showNewSlide, showDetailSlide, newParams, detailParams,buttonRoleSwitch } = this.state;
    let repaymentInfo = info.writeoffArtificialDTO || {}; //还款信息
    return (
      <div className="loan-repayment tab-container">
        <h3 className="sub-header-title">{messages('request.detail.repayment.history'/*还款记录*/)}</h3>
        <div className="table-header">
          <div className="table-header-buttons">
            {repaymentInfo.stayWriteoffAmount && buttonRoleSwitch?
              <Button type="primary" className="table-header-btn" onClick={() => this.showNewSlide(true)}>
                {messages('request.detail.loan.create.payment')/*新建还款*/}
              </Button> : ''}
          </div>
        </div>
        <Table rowKey="id"
               columns={columns}
               dataSource={data}
               loading={loading}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               pagination={pagination}
               bordered
               size="middle"/>
        <SlideFrame title={messages('request.detail.loan.create.payment')/*新建还款*/}
                    show={showNewSlide}
                    content={NewRepaymentFrame}
                    params={newParams}
                    afterClose={this.handleCloseSlide}
                    onClose={this.handleNewFrameClose}/>
        <SlideFrame title={messages('request.detail.loan.payment.detail')/*还款详情*/}
                    show={showDetailSlide}
                    content={RepaymentDetailFrame}
                    params={detailParams}
                    afterClose={this.handleCloseSlide}
                    onClose={() => this.showDetailSlide(false)}/>
      </div>
    )
  }
}

LoanRepayment.propTypes = {
  info: React.PropTypes.object,
  loanRefund: React.PropTypes.bool, //是否是借还款管理页面的详情
  showNewSlide: React.PropTypes.bool,
  applicationOID: React.PropTypes.string.isRequired,
  isOwner: React.PropTypes.bool,//是否为登录人控件，涉及权限
  handleSave: React.PropTypes.func,
  handleClose: React.PropTypes.func,
};

LoanRepayment.defaultProps={
  info: {},
  showNewSlide: false,
  isOwner: false,
  handleSave: () => {},
  handleClose: () => {},
};

function mapStateToProps() {
  return { }
}

const wrappedLoanRepayment = Form.create()(LoanRepayment);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedLoanRepayment)
