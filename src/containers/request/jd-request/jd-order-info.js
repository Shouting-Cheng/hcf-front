import PropTypes from 'prop-types';
import React from 'react'
import { connect } from 'dva'
import { Form, Table, Row, Col, Tag } from 'antd'

class JDOrderInfo extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      info: {},
      productInfo: {},
      columns: [
        {title: this.$t('request.detail.jd.product'/*商品*/), dataIndex: 'name',render: (value, record) => (
          <div>
            <img src={record.imgPath} className="product-img"/>
            {value}
          </div>
        )},
        {title: this.$t('request.detail.jd.product.no'/*商品编号*/), dataIndex: 'skuId'},
        {title: this.$t('request.detail.jd.price'/*价格*/), dataIndex: 'amount', render: value =>
          <span className="money-cell">{this.state.info.currencyCode} {this.renderMoney(value)}</span>},
        {title: this.$t('request.detail.jd.product.num'/*商品数量*/), dataIndex: 'count'}
      ],
      data: [],
    }
  }

  componentWillMount() {
    this.props.info.applicant && this.setState({
      info: this.props.info,
      productInfo: this.props.info.jingDongOrderApplication.jingDongOrder,
      data: this.props.info.jingDongOrderApplication.jingDongOrder.jingDongCommodities
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      info: nextProps.info,
      productInfo: nextProps.info.jingDongOrderApplication.jingDongOrder,
      data: nextProps.info.jingDongOrderApplication.jingDongOrder.jingDongCommodities
    })
  }

  //剩余付款时间
  getRemainingTime = (createDate) => {
    let remainMs = new Date().getTime() - new Date(createDate).getTime();
    let remainDay = 7 - Math.ceil(remainMs / (1000 * 3600 * 24));  // 计算剩余天数,向上取整
    let remainHour = 24 - Math.ceil(remainMs % (1000 * 3600 * 24) / (1000 * 3600));  // 计算除去天数之后剩余小时,向上取整
    if(remainDay < 0){  //京东订单时间超时
      return <Tag color="#ff0000">{this.$t('request.detail.jd.order.timeout')/*订单超时*/}</Tag>
    } else if(remainDay < 1){
      return <Tag color="#ff9900">{this.$t('request.detail.jd.remind.time', {hour: remainHour})/*剩余付款时间：{hour}小时*/}</Tag>
    } else if(remainDay >= 1) {
      return <Tag color="#ff9900">{this.$t('request.detail.jd.remind.day', {day: remainDay, hour: remainHour})/*剩余付款时间：{day}天{hour}小时*/}</Tag>
    }
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return numberString
  };

  render() {
    const { info, productInfo, columns, data } = this.state;
    return (
      <div className="jd-order-info tab-container">
        <h3 className="sub-header-title">{this.$t('request.detail.jd.order.info')/*订单信息*/}</h3>
        <div className="table-header">
          <span className="order-num">{this.$t('request.detail.jd.order.no')/*订单号*/}：{productInfo.orderNum}</span>
          {info.jingDongOrderApplication && this.getRemainingTime(info.jingDongOrderApplication.createdDate)}
        </div>
        <Table rowKey={(record, index) => index}
               columns={columns}
               dataSource={data}
               scroll={{x: true}}
               pagination={false}
               bordered
               size="middle"/>
        <div className="amount-info">
          <Row>
            <Col span={3} className="amount">{info.currencyCode} {this.renderMoney(productInfo.totalAmount || 0)}</Col>
            <Col span={2} className="amount-title">{this.$t('request.detail.jd.product.amount')/*商品总额*/}：</Col>
          </Row>
          <Row>
            <Col span={3} className="amount">{info.currencyCode} {this.renderMoney(productInfo.freight || 0)}</Col>
            <Col span={2} className="amount-title">{this.$t('request.detail.jd.freight')/*运费*/}：</Col>
          </Row>
          <Row>
            <Col span={3} className="amount total">{info.currencyCode} {this.renderMoney((productInfo.totalAmount || 0) + (productInfo.freight || 0))}</Col>
            <Col span={2} className="amount-title total">{this.$t('request.detail.jd.total.amount')/*总计金额*/}：</Col>
          </Row>
        </div>
      </div>
    )
  }
}

JDOrderInfo.propTypes = {
  info: PropTypes.object
};

JDOrderInfo.defaultProps={
  info: {}
};

function mapStateToProps() {
  return { }
}

const wrappedJDOrderInfo = Form.create()(JDOrderInfo);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedJDOrderInfo)
