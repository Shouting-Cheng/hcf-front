import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import config from 'config'
import httpFetch from 'share/httpFetch'
import { Form, Alert, Button, Spin, Row, Col } from 'antd'

import moment from 'moment'
import 'styles/request/repayment-detail-frame.scss'

class RepaymentDetailFrame extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      id: null,
      info: {},
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ id: nextProps.params.id },() => {
      this.getInfo()
    })
  }

  getInfo = () => {
    this.setState({ loading: true });
    httpFetch.get(`${config.baseUrl}/api/repayment/detail/${this.state.id}`).then(res => {
      this.setState({ loading: false, info: res.data })
    })
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString
  };

  handleCancel = () => {
    this.props.close();
  };

  renderInfo = (title, info) => {
    return (
      <div className="render-info">
        <div className="title">{title}</div>
        <div>{info}</div>
      </div>
    )
  };

  render() {
    const { loading, info } = this.state;
    let alertContent = (
      <div className="alert-content-warn">
        {info.status === '1001' && <div>等待财务确认…</div>}
        {info.status === '1002' &&
        <div>{moment(info.writeoffDetail[0].createdDate).format('YYYY-MM-DD HH:mm:ss')} {} 确认还款 {this.renderMoney(info.repaymentValue)}</div>}
        {info.status === '1003' && <div>{moment(info.writeoffDetail[0].createdDate).format('YYYY-MM-DD HH:mm:ss')} {info.writeoffDetail[0].title}</div>}
        <div>
          日期：{moment(info.createDate).format('YYYY-MM-DD')}，由 {} 代提
          <span className="ant-divider"/>
          还款单号：{info.businessCode}
          <span className="ant-divider"/>
          还款方式：{info.type === '0' ? '现金还款' : info.type === '1' ? '转账还款' : '报销单还款'}
          <span className="ant-divider"/>
          当前状态：{info.status === '1001' ? '还款中' : info.status === '1002' ? '已还款' : '被驳回'}
        </div>
      </div>
    );
    return(
      <div className="repayment-detail-frame">
        {info.status && (
          <Alert message={info.status === '1001' ? '还款中' : info.status === '1002' ? `还款金额：${info.curreny} ${this.renderMoney(info.repaymentValue)}` : '被驳回'}
                 description={alertContent}
                 type={info.status === '1001' ? 'warning' : info.status === '1002' ? 'success' : 'error'}
                 showIcon/>
        )}
        <Spin spinning={loading}>
          <Row style={{width:'70%', margin:'30px auto'}}>
            <Col span={15}>
              <h3>还款方信息</h3>
              {this.renderInfo('开户名', info.payAccountName)}
              {this.renderInfo('开户账号', info.payAccount)}
              {this.renderInfo('开户银行', info.payBankName)}
              {this.renderInfo('还款金额', (info.curreny || '') + ' ' + this.renderMoney(info.repaymentValue))}
            </Col>
            <Col span={9}>
              <h3>收款方信息</h3>
              {this.renderInfo('开户名', info.acceptAccountName)}
              {this.renderInfo('开户账号', info.acceptAccount)}
              {this.renderInfo('开户银行', info.acceptBankName)}
            </Col>
          </Row>
          <Row style={{width:'70%', margin:'0 auto'}}>
            {info.repayAttchment && (
              info.repayAttchment.map(item => {
                return <img src={item.fileURL} className="repay-img"/>
              })
            )}
          </Row>
        </Spin>
        <div className="slide-footer">
          <Button onClick={this.handleCancel}>关闭</Button>
        </div>
      </div>
    )
  }
}

function mapStateToProps() {
  return {}
}

const wrappedRepaymentDetailFrame = Form.create()(injectIntl(RepaymentDetailFrame));

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedRepaymentDetailFrame)
