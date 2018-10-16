import {messages} from "share/common";
/**
 * 操作：改签
 * 适用：已通过 且 customFormPropertyMap['ticket.alert.disable']不为true 且机票状态为【已订票／已改签／改签审批驳回／改签审批驳回】 的 订票申请单
 * 获取 customFormPropertyMap 的接口：/api/custom/forms/
 */
import React from 'react'
import { connect } from 'react-redux'
import menuRoute from 'routes/menuRoute'
import { Form, Button, Modal, Radio, Input, Row, Col, Table, message, Popover } from 'antd'
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

import moment from 'moment'
import requestService from 'containers/request/request.service'
import 'styles/request/btns/booker-endorse-btn.scss'

class BookerEndorseBtn extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      travelOrders: [],
      isPersonalReason: false,
      isAdditionalRecord: false,
      columns: [
        {title: messages('request.detail.btn.endorse.passenger.name'/*乘机人*/), dataIndex: 'name', width: '20%', render: value =>
          value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'},
        {title: messages('request.detail.btn.endorse.begin.time'/*出发时间*/), dataIndex: 'beginDate', width: '20%', render: value =>
          value ? <Popover placement="topLeft" content={moment(value).format('YYYY-MM-DD HH:mm')}>{moment(value).format('YYYY-MM-DD HH:mm')}</Popover> : '-'},
        {title: messages('request.detail.btn.endorse.from.city'/*出发地*/), dataIndex: 'fromCity', width: '20%', render: value =>
          value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'},
        {title: messages('request.detail.btn.endorse.to.city'/*到达地*/), dataIndex: 'toCity', width: '20%', render: value =>
          value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'},
        {title: messages('request.detail.btn.endorse.travel.no'/*航班号*/), dataIndex: 'travelNo', width: '20%', render: value =>
          value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'}
      ],
      selectedRowKeys: [],
      selectedTravelOrderOID: [],
      applicationList: menuRoute.getRouteItem('request','key'), //申请单列表页
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.travelOrders.length && nextProps.info) {
      let travelOrders = [];
      (nextProps.info.travelOrders || []).map(item => {
        if (item.status === 1003 || item.status === 1005 || item.status === 1013 || item.status === 1014) {
          travelOrders.push(item)
        }
      });
      this.setState({ travelOrders })
    }
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
      isPersonalReason: false,
      isAdditionalRecord: false,
      selectedRowKeys: [],
      selectedTravelOrderOID: [],
    });
    this.props.form.resetFields()
  };

  //选中项发生变化的时的回调
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  };

  //选择/取消选择某行的回调
  handleSelectRow = (record, selected) => {
    let selectedTravelOrderOID = this.state.selectedTravelOrderOID;
    if (selected) {
      selectedTravelOrderOID.push(record.travelOrderOID)
    } else {
      selectedTravelOrderOID.delete(record.travelOrderOID)
    }
    this.setState({ selectedTravelOrderOID })
  };

  //选择/取消选择所有行的回调
  handleSelectAllRow = (selected, selectedRows, changeRows) => {
    let selectedTravelOrderOID = this.state.selectedTravelOrderOID;
    if(selected) {
      changeRows.map(item => {
        selectedTravelOrderOID.push(item.travelOrderOID)
      })
    } else {
      changeRows.map(item => {
        selectedTravelOrderOID.delete(item.travelOrderOID)
      })
    }
    this.setState({ selectedTravelOrderOID })
  };


  //改签
  handleEndorse = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (!this.state.selectedTravelOrderOID.length) {
          message.warning(messages('request.detail.btn.endorse.please.chose.ticket'/*请选择机票*/));
          return
        }
        values.skipWorkflow = values.isPersonalReason ? true : values.isAdditionalRecord ? false : values.skipWorkflow;
        values.travelOrderOIDs = this.state.selectedTravelOrderOID;
        values.applicationOID = this.props.info.applicationOID;
        requestService.submitEndorseApplication(values).then(() => {
          message.success(messages('common.operate.success'));
          this.setState({ modalVisible: false });
          this.context.router.push(this.state.applicationList.url)
        }).catch(e => {
          message.error(`${messages('common.operate.filed')}，${e.response.data.message}`)
        })
      }
    })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { modalVisible, travelOrders, isPersonalReason, isAdditionalRecord, columns, selectedRowKeys } = this.state;
    const { formType, info } = this.props;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 14, offset: 1 }
    };
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow
    };
    return (
      <div className="booker-endorse-btn request-btn">
        {/* status: 1003（已通过） */}
        {formType === 2003 && info.status === 1003 && !!travelOrders.length && (
          <Button type="primary" onClick={this.showModal}>{messages('request.detail.btn.endorse')/*改 签*/}</Button>
        )}

        <Modal title={messages('request.detail.btn.endorse')/*改 签*/}
               width={600}
               visible={modalVisible}
               wrapClassName="booker-endorse-modal"
               onOk={this.handleEndorse}
               onCancel={() => {this.setState({modalVisible: false})}}>
          <Form className="form-container">
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label={messages('request.detail.btn.endorse.reason')/*改签原因*/}>
                  {getFieldDecorator('isPersonalReason', {
                    initialValue: false
                  })(
                    <RadioGroup onChange={e => this.setState({isPersonalReason: e.target.value})}>
                      <Radio value={false}>{messages('request.detail.btn.endorse.reason.project')/*项目*/}</Radio>
                      <Radio value={true}>{messages('request.detail.btn.endorse.reason.person')/*个人*/}</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label={messages('request.detail.btn.endorse.is.additional.record')/*该申请为补录*/}>
                  {getFieldDecorator('isAdditionalRecord', {
                    initialValue: false
                  })(
                    <RadioGroup onChange={e => this.setState({isAdditionalRecord: e.target.value})}>
                      <Radio value={true}>{messages('request.detail.booker.yes')/*是*/}</Radio>
                      <Radio value={false}>{messages('request.detail.booker.no')/*否*/}</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label={messages('request.detail.btn.endorse.skip.approve')/*是否跳过审批*/}>
                  {getFieldDecorator('skipWorkflow', {
                    initialValue: false
                  })(
                    isPersonalReason ? <div>{messages('request.detail.btn.endorse.reason.person.no.approve')/*个人原因无需重新审批*/}</div> :
                      isAdditionalRecord ? <div>{messages('request.detail.btn.endorse.reason.project.must.approve')/*补录信息需强制重新审批*/}</div> :
                        <RadioGroup onChange={this.onRadioChange}>
                          <Radio value={true}>{messages('request.detail.booker.yes')/*是*/}</Radio>
                          <Radio value={false}>{messages('request.detail.booker.no')/*否*/}</Radio>
                        </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label='' colon={false}>
                  {getFieldDecorator('remark', {
                    rules: [{
                      max: 200,
                      message: messages('common.max.characters.length', {max: 200})
                    }],
                    initialValue: ''
                  })(
                    <TextArea rows={2} style={{resize:'none'}}
                              placeholder={messages('request.detail.btn.endorse.reason.input')/*请输入改签人员姓名、改签理由等*/}/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <div className="table-header">
              <div className="table-header-title">
                {messages('common.total1', {total: travelOrders.length})}
                <span> / </span>
                {messages('common.total.selected', {total: selectedRowKeys.length})}
              </div>
            </div>
            <Table rowKey='travelOrderOID'
                   columns={columns}
                   dataSource={travelOrders}
                   pagination={false}
                   rowSelection={rowSelection}
                   size="middle"
                   bordered/>
          </Form>
        </Modal>
      </div>
    )
  }
}

BookerEndorseBtn.propTypes = {
  formType: React.PropTypes.number.isRequired,
  info: React.PropTypes.object.isRequired,
};

BookerEndorseBtn.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return { }
}

const wrappedTravelUpdateBtn = Form.create()(BookerEndorseBtn);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedTravelUpdateBtn)