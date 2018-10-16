import {messages} from "share/common";
/**
 * 订票申请单 机票信息
 */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Card, Row, Col, Tag, Button, Modal, Radio, Input, message, Icon } from 'antd'
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

import moment from 'moment'
import requestService from 'containers/request/request.service'
import 'styles/request/booker-request/booker-ticket-info.scss'

class BookerTicketInfo extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      travelOrders: [],
      modalVisible: false,
      infoIsRight: true, //信息反馈是否合适
      travelOrderOID: '', //信息反馈的travelOrderOID
    }
  }

  componentDidMount() {
    this.setState({ travelOrders: this.props.info.travelOrders })
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.info.travelOrders) !== JSON.stringify(this.state.travelOrders)) {
      this.setState({ travelOrders: nextProps.info.travelOrders })
    }
  }

  //获取星期几
  getWeed = (value) => {
    switch(value) {
      case 0:
        return messages('request.detail.booker.sun');
      case 1:
        return messages('request.detail.booker.mon');
      case 2:
        return messages('request.detail.booker.tues');
      case 3:
        return messages('request.detail.booker.wed');
      case 4:
        return messages('request.detail.booker.thur');
      case 5:
        return messages('request.detail.booker.fri');
      case 6:
        return messages('request.detail.booker.sat');
    }
  };

  getTicketStatus = (status) => {
    switch(status) {
      case 1001:
        return messages('request.detail.booker.issuing'); //待订票
      case 1002:
        return messages('request.detail.booker.refunded'); //已退票
      case 1003:
        return messages('request.detail.booker.endorsed'); //已改签
      case 1004:
        return messages('request.detail.booker.deleted'); //已删除
      case 1005:
        return messages('request.detail.booker.booked'); //已订票
      case 1006:
        return messages('request.detail.booker.wait.refund'); //待退票
      case 1007:
        return messages('request.detail.booker.wait.endorse'); //待改签
      case 1008:
        return messages('request.detail.booker.wait.price.review'); //等待价格审核
      case 1009:
        return messages('request.detail.booker.price.review.pass'); //价格审核完成
      case 1010:
        return messages('request.detail.booker.price.review.reject'); //价格审核驳回
      case 1011:
        return messages('request.detail.booker.go.refund'); //发起退票申请
      case 1012:
        return messages('request.detail.booker.go.endorse'); //发起改签申请
      case 1013:
        return messages('request.detail.booker.refund.reject'); //退票审批驳回
      case 1014:
        return messages('request.detail.booker.endorse.reject'); //改签审批驳回
      default:
        return messages('request.detail.booker.unknown') //未知
    }
  };

  renderInfo = (label, value) => {
    return (
      <Row>
        <Col span={6}>{label}：</Col>
        <Col span={18}>{value}</Col>
      </Row>
    )
  };

  handleInfoConfirm = (travelOrderOID) => {
    this.setState({
      modalVisible: true,
      infoIsRight: true,
      travelOrderOID
    });
    this.props.form.resetFields()
  };

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        requestService.handleBoardingConfirmation(this.props.info.applicationOID, value.comment, value.flag, this.state.travelOrderOID).then(() => {
          message.success(messages('common.operate.success'));
          this.setState({ modalVisible: false });
          this.props.afterBoardConfirm()
        }).catch(e => {
          message.error(`${messages('common.operate.filed')}，${e.response.data.message}`)
        })
      }
    })
  };

  onRadioChange = (e) => {
    this.setState({ infoIsRight: e.target.value })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { travelOrders, modalVisible, infoIsRight } = this.state;
    return (
      <div className="booker-ticket-info tab-container">
        <h3 className="sub-header-title">{messages('request.detail.ticket.info'/*机票信息*/)}
          <span> {moment(this.props.info.lastModifiedDate).format('YYYY-MM-DD HH:mm')} {messages('request.detail.booker.update')/*更新*/}</span>
        </h3>
        {travelOrders.map((item, index) => {
          return (
            <Card key={index} className={item.status === 1002 ? 'ticket-disabled' : ''}>
              <h3 className="title">
                {moment(item.travelDate).format('MM.DD')} {this.getWeed(new Date(item.travelDate).getDay())} —— {item.name}
                <Tag color={item.status === 1002 ? '#bababa' : '#108ee9'} className="status-tag">{this.getTicketStatus(item.status)}</Tag>
                {item.confirmStatus === 1001 && item.status !== 1002 && item.status !== 1004 && item.status !== 1005 && (
                  <Button type="primary"
                          className="boarding-confirmation-btn"
                          onClick={() => {this.handleInfoConfirm(item.travelOrderOID)}}>
                    {messages('request.detail.booker.ticket.feedback')/*机票信息反馈*/}
                  </Button>
                )}
              </h3>
              <Row>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.departure.time'/*起飞时间*/), moment(item.beginDate).format('HH:mm'))}</Col>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.arrive.time'/*到达时间*/), moment(item.arriveDate).format('HH:mm'))}</Col>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.flight'/*航班号*/), item.travelNo)}</Col>
              </Row>
              <Row>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.departure.airport'/*出发机场*/), item.fromAirport)}</Col>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.arrive.airport'/*到达机场*/), item.toAirport)}</Col>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.seatClass'/*舱位*/), item.bunk)}</Col>
              </Row>
              <Row>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.ticket.price'/*机票价格*/), item.price.toFixed(2))}</Col>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.tax.price'/*税费*/), item.taxationPrice.toFixed(2))}</Col>
                <Col span={8}>{this.renderInfo(messages('request.detail.booker.total.price'/*价格合计*/), item.finalPrice.toFixed(2))}</Col>
              </Row>
              {(item.confirmStatus === 1002 || item.confirmStatus === 1003) && (
                <Row className="confirm-info-row">
                  <span>{item.confirmStatus === 1002 ? <Icon type="check-circle-o" className="info-checked"/> :
                    <Icon type="info-circle-o" className="info-not-checked"/>}</span>
                  <span>{moment(item.lastModifiedDate || item.createdDate).format('MM-DD HH:mm')}</span>
                  <span>#{item.name}#</span>
                  <span>{item.confirmStatus === 1002 ? messages('request.detail.booker.confirm.info'/*确认机票信息*/) :
                    `${messages('request.detail.booker.feedback.unsuitable')/*反馈机票信息不合适*/}: ${item.confirmRemark}`}</span>
                </Row>
              )}
            </Card>
          )
        })}

        <Modal title={messages('request.detail.booker.ticket.feedback')/*机票信息反馈*/}
               visible={modalVisible}
               onOk={this.handleOk}
               onCancel={() => {this.setState({modalVisible: false})}}>
          <Form className="form-container">
            <FormItem label={messages('request.detail.booker.info.is.suitable'/*信息是否合适*/)}>
              {getFieldDecorator('flag', {
                rules:[{
                  required: true,
                  message: messages('common.please.select')
                }],
                initialValue: undefined
              })(
                <RadioGroup onChange={this.onRadioChange}>
                  <Radio value={true}>{messages('request.detail.booker.suitable')/*合适*/}</Radio>
                  <Radio value={false}>{messages('request.detail.booker.unsuitable')/*不合适*/}</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {!infoIsRight && (
              <FormItem label={messages('request.detail.booker.unsuitable.reason')/*信息不合适原因*/}>
                {getFieldDecorator('comment', {
                  rules:[{
                    required: true,
                    message: messages('common.please.enter')
                  }, {
                    max: 200,
                    message: messages('common.max.characters.length', {max: 200})
                  }],
                  initialValue: undefined
                })(
                  <TextArea rows={3}
                            style={{resize: 'none'}}/>
                )}
              </FormItem>
            )}
          </Form>
        </Modal>
      </div>
    )
  }
}

BookerTicketInfo.propTypes = {
  info: React.PropTypes.object,
  afterBoardConfirm: React.PropTypes.func
};

function mapStateToProps() {
  return { }
}

const wrappedBookerTicketInfo = Form.create()(BookerTicketInfo);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedBookerTicketInfo)