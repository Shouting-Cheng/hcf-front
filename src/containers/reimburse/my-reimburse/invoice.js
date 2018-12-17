import React, { Component } from "react"
import { Row, Col, Input, Select, InputNumber, DatePicker, Form, Modal, Button, Popover, } from 'antd'
import Table from 'widget/table'
import "styles/reimburse/invoice-info.scss"
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service'
import baseService from 'share/base.service'
import moment from "moment"
import 'styles/reimburse/invoice.scss'
const FormItem = Form.Item;

class InvoiceInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invoice: {
        feeWithoutTax: 200,
        vatInvoiceCurrencyCode: "CNY",
        tax: 300,
        fee: 400,
        type: "增值税专用发票",
        billingCode: "000000000",
        billingNo: "0958485",
        payee: "333",
        title: "444"
      },
      brief: true,
      columns: [{
        title: "货物或应税劳务、服务名称",
        dataIndex: 'goodsName',
        render: goodsName => goodsName || '-'
      }, {
        title: "规格型号",
        dataIndex: 'vehicleType',
        render: vehicleType => vehicleType || '-'
      }, {
        title: "单位", dataIndex: 'unit'
      }, {
        title: "数量", dataIndex: 'count'
      }, {
        title: "单价",
        dataIndex: 'unitPrice',
        render: unitPrice => (Number(unitPrice) / 100).toFixed(2)
      }, {
        title: "金额", dataIndex: 'amount', render: amount => (Number(amount) / 100).toFixed(2)
      }, {
        title: "税率", dataIndex: 'taxRate', render: taxRate => `${taxRate || 0}%`
      }, {
        title: "税额",
        dataIndex: 'taxPrice',
        render: taxPrice => (Number(taxPrice) / 100).toFixed(2)
      }]
    }
  }
  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  handleOk = () => {

  }

  handleCancel = () => {
    this.props.cancel && this.props.cancel();
  }

  handleEdit = () => {

  }

  renderDetail = (title, value, span = 12) => {
    let titleSpan = 8;
    return (
      <Col span={span} className="invoice-row">
        <Row>
          <Col span={titleSpan} className="invoice-title">{title}:</Col>
          <Col span={24 - titleSpan} className="invoice-detail">{value || '-'}</Col>
        </Row>
      </Col>
    )
  };

  render() {
    const { columns } = this.state;
    const { invoice } = this.props;
    return (
      <Modal title="发票信息"
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={false}
        width="60%"
        bodyStyle={{padding: 10}}
      >
        {this.state.brief ? (
          <div className="invoice-brief-mode">
            <Row>
              <Col span={6} className="invoice-brief-amount-area">
                {!false &&
                  <a onClick={() => this.setState({ brief: false })}>查看详情</a>}
                <Row className="invoice-brief-amount-detail" style={{ marginTop: false && 30 }}>
                  <Col span={14}>金额合计</Col><Col
                    span={10}>{(invoice.feeWithoutTax / 100).toFixed(2)}</Col>
                  <Col span={14}>币种</Col><Col
                    span={10}>{invoice.vatInvoiceCurrencyCode || 'CNY'}</Col>
                  <Col span={14}>税额合计</Col><Col
                    span={10}>{(invoice.tax / 100).toFixed(2)}</Col>
                  <Col span={14}>价税合计</Col><Col
                    span={10}>{(invoice.fee / 100).toFixed(2)}</Col>
                </Row>
              </Col>
              <Col span={18} className="invoice-brief-content-area" stlye={{float:"right"}}>
                <div className="invoice-type">
                  {invoice.type}
                  {
                    <Button icon="edit" type="primary" onClick={this.handleEdit}>修改</Button>}
                  {<Button icon="printer" type="primary"
                    onClick={this.handlePrint}>打印</Button>}
                </div>
                <Row className="invoice-brief-content" gutter={10}>
                  {
                    <Col span={12}>
                      <span className="title">开票日期：</span>&nbsp;
                  {(invoice.billingTime ? new Date(invoice.billingTime * 1000) : new Date()).format('yyyy-MM-dd')}
                    </Col>
                  }
                  <Col span={12}>
                    <span className="title">来源：</span>&nbsp;
                <Popover content={"手工录入"} overlayStyle={{ width: 200 }}>
                      {"手工录入"}
                    </Popover>
                  </Col>
                  <Col span={12}>
                    <span className="title">发票代码：</span>&nbsp;
                {invoice.billingCode}
                  </Col>
                  <Col span={12}>
                    <span className="title">发票号码：</span>&nbsp;
                {invoice.billingNo}
                  </Col>
                  <Col span={12}>
                    <span className="title">销售方：</span>&nbsp;
                <Popover content={invoice.payee} overlayStyle={{ width: 200 }}>
                      {invoice.payee}
                    </Popover>
                  </Col>
                  <Col span={12}>
                    <span className="title">购买方：</span>&nbsp;
                <Popover content={invoice.title} overlayStyle={{ width: 200 }}>
                      {invoice.title}
                    </Popover>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        ) : (
            <div className="invoice">
              {
                invoice.recepitLabel && invoice.recepitLabel.length > 0 && (<div className='tip-wrap'>
                  {/* 非普通标签单独一行显示*/}
                  {invoice.recepitLabel.filter(item => item.level !== 'INFO').map(item =>
                    <Alert
                      message={`${item.name} : ${item.description}`}
                      key={item.name}
                      type={item.level === 'ERROR' ? 'error' : 'info'}
                      showIcon />
                  )}
                  {/* 普通标签拼接成一行显示*/}
                  {invoice.recepitLabel.filter(item => item.level === 'INFO').length > 0 &&
                    (<Alert
                      message={invoice.recepitLabel.filter(item => item.level === 'INFO').map(item => item.name).join('/')}
                      type="info"
                      showIcon
                    />
                    )}
                </div>)
              }
              <div className="invoice-type">{invoice.type}</div>
              <div className="invoice-detail-area">
                <Row>
                  {this.renderDetail("开票日期", (invoice.billingTime ? new Date(invoice.billingTime * 1000) : new Date()).format('yyyy-MM-dd'))}
                  {this.renderDetail("发票代码", invoice.billingCode)}
                  {this.renderDetail("发票号码", invoice.billingNo)}
                  {this.renderDetail("机器编号", invoice.deviceNumber)}
                  {this.renderDetail("校验码", invoice.checkCode)}
                </Row>
                <Row className="invoice-row">
                  <Col span={4} className="invoice-title">价税合计:</Col>
                  <Col span={20} className="invoice-detail">
                    <b className="invoice-currency">{invoice.vatInvoiceCurrencyCode || 'CNY'}</b>
                    <b className="invoice-amount">{(invoice.fee / 100).toFixed(2)}</b>
                    (金额合计：{(invoice.feeWithoutTax / 100).toFixed(2)} 税额合计：{((invoice.tax || 0) / 100).toFixed(2)})
                  </Col>
                </Row>
                <Row>
                  <Col span={4} className="invoice-title">备注:</Col>
                  <Col span={20} className="invoice-detail">{invoice.remark || '-'}</Col>
                </Row>
                <Table size="small"
                  style={{ margin: '10px 0' }}
                  columns={columns}
                  dataSource={invoice.invoiceGoods}
                  rowKey={record => record.index}
                  pagination={false} />
                <Row>
                  {this.renderDetail("购买方", invoice.title, 24)}
                  {this.renderDetail("纳税人识别号", invoice.draweeNo, 24)}
                  {this.renderDetail("地址/电话", invoice.draweeAddressPhone, 24)}
                  {this.renderDetail("开户行/账户", invoice.draweeBankAccount, 24)}
                </Row>
                <hr style={{ borderColor: '#e8e8e8' }} />
                <Row>
                  {this.renderDetail("销售方", invoice.payee, 24)}
                  {this.renderDetail("纳税人识别号", invoice.payeeNo, 24)}
                  {this.renderDetail("地址/电话", invoice.payeeAddressPhone, 24)}
                  {this.renderDetail("开户行/账户", invoice.payeeBankAccount, 24)}
                </Row>
              </div>
              <div className="invoice-operate">
                <a onClick={() => this.setState({ brief: true })}>收起详情</a>
                <a onClick={this.handlePrint}>打印</a>
              </div>
            </div>
          )
        }

      </Modal>
    )
  }
}

export default Form.create()(InvoiceInfo)
//
