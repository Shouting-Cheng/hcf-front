/**
 * 操作：退票
 * 适用：已通过 且 customFormPropertyMap['ticket.alert.disable']不为true 且机票状态为【已订票／已改签／退票审批驳回／改签审批驳回】 的 订票申请单
 * 获取 customFormPropertyMap 的接口：/api/custom/forms/
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Button, Modal, Radio, Input, Row, Col, Table, message, Popover } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;
import PropTypes from 'prop-types';

import moment from 'moment';
import requestService from 'containers/request/request.service';
import 'styles/request/btns/booker-refund-btn.scss';

class BookerRefundBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      travelOrders: [],
      isPersonalReason: false,
      isAdditionalRecord: false,
      columns: [
        {
          title: this.$t('request.detail.btn.endorse.passenger.name' /*乘机人*/),
          dataIndex: 'name',
          width: '20%',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
        {
          title: this.$t('request.detail.btn.endorse.begin.time' /*出发时间*/),
          dataIndex: 'beginDate',
          width: '20%',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={moment(value).format('YYYY-MM-DD HH:mm')}>
                {moment(value).format('YYYY-MM-DD HH:mm')}
              </Popover>
            ) : (
              '-'
            ),
        },
        {
          title: this.$t('request.detail.btn.endorse.from.city' /*出发地*/),
          dataIndex: 'fromCity',
          width: '20%',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
        {
          title: this.$t('request.detail.btn.endorse.to.city' /*到达地*/),
          dataIndex: 'toCity',
          width: '20%',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
        {
          title: this.$t('request.detail.btn.endorse.travel.no' /*航班号*/),
          dataIndex: 'travelNo',
          width: '20%',
          render: value =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              '-'
            ),
        },
      ],
      selectedRowKeys: [],
      selectedTravelOrderOID: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.travelOrders.length && nextProps.info) {
      let travelOrders = [];
      (nextProps.info.travelOrders || []).map(item => {
        if (
          item.status === 1003 ||
          item.status === 1005 ||
          item.status === 1013 ||
          item.status === 1014
        ) {
          travelOrders.push(item);
        }
      });
      this.setState({ travelOrders });
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
    this.props.form.resetFields();
  };

  //选中项发生变化的时的回调
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  //选择/取消选择某行的回调
  handleSelectRow = (record, selected) => {
    let selectedTravelOrderOID = this.state.selectedTravelOrderOID;
    if (selected) {
      selectedTravelOrderOID.push(record.travelOrderOID);
    } else {
      selectedTravelOrderOID.delete(record.travelOrderOID);
    }
    this.setState({ selectedTravelOrderOID });
  };

  //选择/取消选择所有行的回调
  handleSelectAllRow = (selected, selectedRows, changeRows) => {
    let selectedTravelOrderOID = this.state.selectedTravelOrderOID;
    if (selected) {
      changeRows.map(item => {
        selectedTravelOrderOID.push(item.travelOrderOID);
      });
    } else {
      changeRows.map(item => {
        selectedTravelOrderOID.delete(item.travelOrderOID);
      });
    }
    this.setState({ selectedTravelOrderOID });
  };

  //退票
  handleRefund = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (!this.state.selectedTravelOrderOID.length) {
          message.warning(this.$t('request.detail.btn.endorse.please.chose.ticket' /*请选择机票*/));
          return;
        }
        values.skipWorkflow = values.isPersonalReason
          ? true
          : values.isAdditionalRecord
            ? false
            : values.skipWorkflow;
        values.travelOrderOIDs = this.state.selectedTravelOrderOID;
        values.applicationOID = this.props.info.applicationOID;
        requestService
          .submitRefundApplication(values)
          .then(() => {
            message.success(this.$t('common.operate.success'));
            this.setState({ modalVisible: false });
            this.context.router.push(this.state.applicationList.url);
          })
          .catch(e => {
            message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      modalVisible,
      travelOrders,
      isPersonalReason,
      isAdditionalRecord,
      columns,
      selectedRowKeys,
    } = this.state;
    const { formType, info } = this.props;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow,
    };
    return (
      <div className="booker-refund-btn request-btn">
        {/* status: 1003（已通过） */}
        {formType === 2003 &&
          info.status === 1003 &&
          !!travelOrders.length && (
            <Button type="primary" onClick={this.showModal}>
              {this.$t('request.detail.btn.refund') /*退 票*/}
            </Button>
          )}

        <Modal
          title={this.$t('request.detail.btn.refund') /*退 票*/}
          width={600}
          visible={modalVisible}
          wrapClassName="booker-refund-modal"
          onOk={this.handleRefund}
          onCancel={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <Form className="form-container">
            <Row>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={this.$t('request.detail.booker.refund.reason' /*退票原因*/)}
                >
                  {getFieldDecorator('isPersonalReason', {
                    initialValue: false,
                  })(
                    <RadioGroup onChange={e => this.setState({ isPersonalReason: e.target.value })}>
                      <Radio value={false}>
                        {this.$t('request.detail.booker.project' /*项目*/)}
                      </Radio>
                      <Radio value={true}>{this.$t('request.detail.booker.person' /*个人*/)}</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={
                    this.$t('request.detail.btn.endorse.is.additional.record') /*该申请为补录*/
                  }
                >
                  {getFieldDecorator('isAdditionalRecord', {
                    initialValue: false,
                  })(
                    <RadioGroup
                      onChange={e => this.setState({ isAdditionalRecord: e.target.value })}
                    >
                      <Radio value={true}>{this.$t('request.detail.booker.yes') /*是*/}</Radio>
                      <Radio value={false}>{this.$t('request.detail.booker.no') /*否*/}</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={this.$t('request.detail.btn.endorse.skip.approve') /*是否跳过审批*/}
                >
                  {getFieldDecorator('skipWorkflow', {
                    initialValue: false,
                  })(
                    isPersonalReason ? (
                      <div>
                        {this.$t(
                          'request.detail.btn.endorse.reason.person.no.approve'
                        ) /*个人原因无需重新审批*/}
                      </div>
                    ) : isAdditionalRecord ? (
                      <div>
                        {this.$t(
                          'request.detail.btn.endorse.reason.project.must.approve'
                        ) /*补录信息需强制重新审批*/}
                      </div>
                    ) : (
                      <RadioGroup onChange={this.onRadioChange}>
                        <Radio value={true}>{this.$t('request.detail.booker.yes') /*是*/}</Radio>
                        <Radio value={false}>{this.$t('request.detail.booker.no') /*否*/}</Radio>
                      </RadioGroup>
                    )
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="" colon={false}>
                  {getFieldDecorator('comment', {
                    rules: [
                      {
                        max: 200,
                        message: this.$t('common.max.characters.length', { max: 200 }),
                      },
                    ],
                    initialValue: '',
                  })(
                    <TextArea
                      rows={2}
                      style={{ resize: 'none' }}
                      placeholder={
                        this.$t(
                          'request.detail.btn.refund.reason.input'
                        ) /*请输入退票人员姓名、退票理由等*/
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <div className="table-header">
              <div className="table-header-title">
                {this.$t('common.total1', { total: travelOrders.length })}
                <span> / </span>
                {this.$t('common.total.selected', { total: selectedRowKeys.length })}
              </div>
            </div>
            <Table
              rowKey="travelOrderOID"
              columns={columns}
              dataSource={travelOrders}
              pagination={false}
              rowSelection={rowSelection}
              size="middle"
              bordered
            />
          </Form>
        </Modal>
      </div>
    );
  }
}

BookerRefundBtn.propTypes = {
  formType: PropTypes.number.isRequired,
  info: PropTypes.object.isRequired,
};

function mapStateToProps() {
  return {};
}

const wrappedTravelUpdateBtn = Form.create()(BookerRefundBtn);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedTravelUpdateBtn);
