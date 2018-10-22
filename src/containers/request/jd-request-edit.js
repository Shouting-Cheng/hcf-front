import React from 'react';
import { connect } from 'dva';
import { Form, Input, Table, Row, Col, Tag, Affix, Button, Alert, message, Spin } from 'antd';
const FormItem = Form.Item;
const TextArea = Input.TextArea;

import Chooser from 'widget/chooser';
import requestService from 'containers/request/request.service';
import 'styles/request/jd-request-edit.scss';

class JDRequestEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      saveLoading: false,
      submitLoading: false,
      deleteLoading: false,
      isOutTime: false, //订单超时
      info: {},
      productInfo: {},
      columns: [
        {
          title: this.$t('request.detail.jd.product' /*商品*/),
          dataIndex: 'name',
          render: (value, record) => (
            <div>
              <img src={record.imgPath} className="product-img" />
              {value}
            </div>
          ),
        },
        { title: this.$t('request.detail.jd.product.no' /*商品编号*/), dataIndex: 'skuId' },
        {
          title: this.$t('request.detail.jd.price' /*价格*/),
          dataIndex: 'amount',
          render: value => (
            <span className="money-cell">
              {this.state.info.currencyCode} {this.renderMoney(value)}
            </span>
          ),
        },
        { title: this.$t('request.detail.jd.product.num' /*商品数量*/), dataIndex: 'count' },
      ],
      data: [],
      applicationList: menuRoute.getRouteItem('request', 'key'), //申请单列表页
      requestDetail: menuRoute.getRouteItem('request-detail', 'key'), //申请单详情页
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    this.setState({ loading: true });
    requestService.getRequestDetail(this.props.params.applicationOID).then(res => {
      if (res.status === 200) {
        this.setState(
          {
            loading: false,
            info: res.data,
            data: res.data.jingDongOrderApplication.jingDongOrder.jingDongCommodities,
            productInfo: res.data.jingDongOrderApplication.jingDongOrder,
          },
          () => {
            this.getRemainingTimeIsOver(this.state.info.jingDongOrderApplication.createdDate);
          }
        );
      }
    });
  };

  //保存 提交
  handleSave = type => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let info = this.state.info;
        info.custFormValues &&
          info.custFormValues.map(item => {
            if (item.messageKey === 'title') {
              item.value = values.title;
            }
            if (item.messageKey === 'remark') {
              item.value = values.remark;
            }
            if (item.messageKey === 'select_approver') {
              item.value = values['select_approver'].join(':');
            }
          });
        this.setState(
          {
            info,
            saveLoading: type === 'save',
            submitLoading: type === 'submit',
          },
          () => {
            requestService[type === 'save' ? 'saveJDRequest' : 'submitJDRequest'](this.state.info)
              .then(() => {
                this.setState({ saveLoading: false, submitLoading: false });
                message.success(
                  type === 'save'
                    ? this.$t('common.save.success', { name: '' })
                    : this.$t('common.operate.success')
                );
                this.handleCancel();
              })
              .catch(() => {
                this.setState({ saveLoading: false, submitLoading: false });
              });
          }
        );
      }
    });
  };

  //剩余付款时间
  getRemainingTime = createDate => {
    let remainMs = new Date().getTime() - new Date(createDate).getTime();
    let remainDay = 7 - Math.ceil(remainMs / (1000 * 3600 * 24)); // 计算剩余天数,向上取整
    let remainHour = 24 - Math.ceil((remainMs % (1000 * 3600 * 24)) / (1000 * 3600)); // 计算除去天数之后剩余小时,向上取整
    if (remainDay < 0) {
      //京东订单时间超时
      return <Tag color="#ff0000">{this.$t('request.detail.jd.order.timeout') /*订单超时*/}</Tag>;
    } else if (remainDay < 1) {
      return (
        <Tag color="#ff9900">
          {this.$t('request.detail.jd.remind.time', {
            hour: remainHour,
          }) /*剩余付款时间：{hour}小时*/}
        </Tag>
      );
    } else if (remainDay >= 1) {
      return (
        <Tag color="#ff9900">
          {this.$t('request.detail.jd.remind.day', {
            day: remainDay,
            hour: remainHour,
          }) /*剩余付款时间：{day}天{hour}小时*/}
        </Tag>
      );
    }
  };

  //是否超时
  getRemainingTimeIsOver = createDate => {
    let remainMs = new Date().getTime() - new Date(createDate).getTime();
    let remainDay = 7 - Math.ceil(remainMs / (1000 * 3600 * 24)); // 计算剩余天数,向上取整
    if (remainDay < 0 && !this.state.isOutTime) {
      this.setState({ isOutTime: true });
    }
  };

  //格式化money
  renderMoney = value => {
    let numberString = Number(value || 0)
      .toFixed(2)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += numberString.indexOf('.') > -1 ? '' : '.00';
    return numberString;
  };

  //返回
  handleCancel = () => {
    this.context.router.push(this.state.applicationList.url);
  };

  //删除
  handleDelete = () => {
    this.setState({ deleteLoading: true });
    requestService
      .deleteRequest(this.props.params.applicationOID)
      .then(() => {
        this.setState({ deleteLoading: false });
        message.success(this.$t('common.operate.success'));
      })
      .catch(e => {
        this.setState({ deleteLoading: false });
        message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      loading,
      saveLoading,
      submitLoading,
      deleteLoading,
      isOutTime,
      info,
      productInfo,
      columns,
      data,
    } = this.state;
    let approveValue = [];
    info.custFormValues &&
      info.custFormValues.map(item => {
        if (item.messageKey === 'select_approver') {
          item.showValue &&
            item.showValue.split(',').map((name, index) => {
              approveValue.push({ fullName: name, userOID: item.value.split(':')[index] });
            });
        }
      });
    return (
      <div className="jd-request-edit">
        <Spin spinning={loading}>
          {isOutTime && (
            <Alert
              message={
                this.$t(
                  'request.detail.jd.error.message'
                ) /*该京东订单已超时，如需购买商品，请重新提交订单*/
              }
              type="error"
              showIcon
            />
          )}
          <Form style={{ width: '35%' }}>
            <FormItem label={this.$t('request.detail.jd.reason') /*事由*/}>
              {getFieldDecorator('title', {
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.enter'),
                  },
                  {
                    max: 50,
                    message: this.$t('common.max.characters.length', { max: 50 }),
                  },
                ],
                initialValue: info.title,
              })(
                <TextArea
                  autosize={{ minRows: 2 }}
                  disabled={isOutTime}
                  style={{ resize: 'none' }}
                  placeholder={this.$t('common.max.characters.length', { max: 50 })}
                />
              )}
            </FormItem>
            <FormItem label={this.$t('request.detail.jd.remark') /*备注*/}>
              {getFieldDecorator('remark', {
                rules: [
                  {
                    max: 200,
                    message: this.$t('common.max.characters.length', { max: 200 }),
                  },
                ],
                initialValue: info.remark,
              })(
                <TextArea
                  autosize={{ minRows: 2 }}
                  disabled={isOutTime}
                  style={{ resize: 'none' }}
                  placeholder={this.$t('common.max.characters.length', { max: 200 })}
                />
              )}
            </FormItem>
            <FormItem label={this.$t('request.detail.jd.approve.person') /*审批人*/}>
              {getFieldDecorator('select_approver', {
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.select'),
                  },
                ],
                initialValue: approveValue,
              })(
                <Chooser
                  type="user"
                  valueKey="userOID"
                  labelKey="fullName"
                  onlyNeed="userOID"
                  newline
                />
              )}
            </FormItem>
          </Form>
          <div className="table-header">
            <span className="order-num">
              {this.$t('request.detail.jd.order.no') /*订单号*/}：{productInfo.orderNum}
            </span>
            {this.getRemainingTime(
              info.jingDongOrderApplication && info.jingDongOrderApplication.createdDate
            )}
          </div>
          <Table
            rowKey="skuId"
            columns={columns}
            dataSource={data}
            scroll={{ x: true }}
            pagination={false}
            bordered
            size="middle"
          />
          <div className="amount-info">
            <Row>
              <Col span={3} className="amount">
                CNY {this.renderMoney(productInfo.totalAmount || 0)}
              </Col>
              <Col span={2} className="amount-title">
                {this.$t('request.detail.jd.product.amount') /*商品总额*/}：
              </Col>
            </Row>
            <Row>
              <Col span={3} className="amount">
                CNY {this.renderMoney(productInfo.freight || 0)}
              </Col>
              <Col span={2} className="amount-title">
                {this.$t('request.detail.jd.freight') /*运费*/}：
              </Col>
            </Row>
            <Row>
              <Col span={3} className="amount total">
                CNY {this.renderMoney((productInfo.totalAmount || 0) + (productInfo.freight || 0))}
              </Col>
              <Col span={2} className="amount-title total">
                {this.$t('request.detail.jd.total.amount') /*总计金额*/}：
              </Col>
            </Row>
          </div>
          <Affix offsetBottom={0} className="bottom-bar">
            {!isOutTime && (
              <Button
                type="primary"
                loading={submitLoading}
                onClick={() => this.handleSave('submit')}
              >
                {this.$t('common.submit')}
              </Button>
            )}
            {!isOutTime && (
              <Button loading={saveLoading} onClick={() => this.handleSave('save')}>
                {this.$t('common.save')}
              </Button>
            )}
            <Button onClick={this.handleCancel}>{this.$t('common.back')}</Button>
            <Button className="delete-btn" loading={deleteLoading} onClick={this.handleDelete}>
              {this.$t('common.delete')}
            </Button>
          </Affix>
        </Spin>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

const wrappedJDRequestEdit = Form.create()(JDRequestEdit);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedJDRequestEdit);
