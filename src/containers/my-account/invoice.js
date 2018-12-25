import React from 'react'
import { connect } from 'dva';
import PropTypes from 'prop-types'
import {Row, Col,  Tag, Button, Popover, Icon, Alert} from 'antd'
import Table from 'widget/table'
import 'styles/my-account/invoice.scss'
import expenseService from 'containers/my-account/expense.service'
import FileSaver from "file-saver";
import {message} from "antd/lib/index";

class Invoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brief: true,
      isInvoiceFree: false,//免贴票标签是否显示
      invoiceFreePrint: true,//免贴票标签存在的情况下，打印按钮是否显示
      columns: [
        {
          title: this.$t('expense.invoice.goods.name')/*货物或应税劳务、服务名称*/,
          dataIndex: 'goodsName',
          render: goodsName => goodsName || '-'
        },
        {
          title: this.$t('expense.invoice.vehicle.type')/*规格型号*/,
          dataIndex: 'vehicleType',
          render: vehicleType => vehicleType || '-'
        },
        {
          title: this.$t('common.unit')/*单位*/, dataIndex: 'unit'
        },
        {
          title: this.$t('common.number')/*数量*/, dataIndex: 'count'
        },
        {
          title: this.$t('common.price')/*单价*/,
          dataIndex: 'unitPrice',
          render: unitPrice => (Number(unitPrice) / 100).toFixed(2)
        },
        {
          title: this.$t('common.amount')/*金额*/,
          dataIndex: 'amount',
          render: amount => amount && !isNaN(amount) ? (Number(amount) / 100).toFixed(2) : '-'
        },
        {
          title: this.$t('expense.invoice.tax.rate')/*税率*/, dataIndex: 'taxRate', render: taxRate => `${taxRate || 0}%`
        },
        {
          title: this.$t('common.tax')/*税额*/,
          dataIndex: 'taxPrice',
          render: taxPrice => taxPrice && !isNaN(taxPrice) ? (Number(taxPrice) / 100).toFixed(2) : '-'
        }
      ],
      travelColumns: [
        {
          title: this.$t('expense.date.project')/*项目名称*/,
          dataIndex: 'goodsName',
          width: '23%',
          render: goodsName => goodsName || '-'
        },
        {
          title: this.$t('expense.date.plateNumber')/*车牌号*/,
          dataIndex: 'plateNumber',
          width: '13%',
          render: plateNumber => plateNumber || '-'
        },
        {
          title: this.$t('expense.date.car.type')/*类型*/,
          dataIndex: 'carType',
          width: '8%',
          render: carType => carType || '-'
        },
        {
          title: this.$t('expense.date.pass.from')/*通行日期起*/,
          dataIndex: 'passDateFrom',
          width: '17%',
          render: passDateFrom => passDateFrom || '-'
        },
        {
          title: this.$t('expense.date.pass.to')/*通行日期至*/,
          dataIndex: 'passDateTo',
          width: '17%',
          render: passDateTo => passDateTo || '-'
        },
        {
          title: this.$t('common.amount')/*金额*/,
          dataIndex: 'amount',
          width: '8%',
          render: amount => (Number(amount) / 100).toFixed(2)
        },
        {
          title: this.$t('expense.invoice.tax.rate')/*税率*/,
          dataIndex: 'taxRate',
          width: '8%',
          render: (taxRate) => {
            let result = '';
            taxRate === '不征税' ? (result = taxRate) : (result = `${taxRate || 0}%`);
            return result
          }
        },
        {
          title: this.$t('common.tax')/*税额*/,
          dataIndex: 'taxPrice',
          width: '8%',
          render: taxPrice => (Number(taxPrice) / 100).toFixed(2)
        }
      ]
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const {isInvoiceFree, invoiceFreePrint} = this.state;
    this.changeProps(this.props.invoice, isInvoiceFree, invoiceFreePrint);
  }

  componentWillReceiveProps(nextProps) {
    nextProps.invoice !== null && this.changeProps(nextProps.invoice, false, true);
  }

  changeProps = (invoiceData, isInvoiceFree, invoiceFreePrint) => {
    let isFinancial = window.location.pathname.indexOf('financial-management') > -1;
    invoiceData.invoiceLabels && invoiceData.invoiceLabels.map(label => {
      if (label.type === 'INVOICE_FREE') {
        isInvoiceFree = true;
        !isFinancial && (invoiceFreePrint = false);
      }
    });
    invoiceData.invoiceGoods && invoiceData.invoiceGoods.map((goods, index) => {
      goods.index = index;
    });
    this.setState({isInvoiceFree, invoiceFreePrint});
  };

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
  // 显示标签信息
  showMessage = (item) => {
    if (!item.name) {
      return item.toast;
    }
    if (!item.toast) {
      return item.name;
    }
    return `${item.name} : ${item.toast}`;
  };
  handlePrint = () => {
    const {invoice, company} = this.props;
    // 支付宝打印
    if (invoice.cardsignType === 'ALICARDSIGN') {
      this.downAlipayInvoice();
      return !1
    }
    // 微信打印
    expenseService.printInvoice(invoice, company.companyOid)
  };
  // 支付宝打印
  downAlipayInvoice = () => {
    const {invoice} = this.props;
    let hide = message.loading(this.$t('importer.spanned.file'));
    expenseService.printAlipayInvoice(invoice).then(res => {
      let b = new Blob([res.data], {type: "application/pdf"});
      FileSaver.saveAs(b, `${this.$t('expense.invoice.type.alipay')}-${invoice.type}.pdf`);
      hide();
    }).catch(() => {
      /*下载失败，请重试*/
      message.error(this.$t('importer.download.error.info'));
      hide();
    });
  };

  render() {
    const {invoice, disabledEdit, handleEdit, profile, canExpense} = this.props;
    const {columns, brief, isInvoiceFree, invoiceFreePrint} = this.state;
    let invoiceScans=['PJJCARDSIGN','DXCARDSIGN','HXCARDSIGN'];
    let electronicFlag = invoice.cardsignType === 'APPCARDSIGN' || invoice.cardsignType === 'JSCARDSIGN';
    let invoiceScanFlag = ~invoiceScans.indexOf(invoice.cardsignType);
    let alipayFlag = invoice.cardsignType === 'ALICARDSIGN';
    let handFlag = invoice.cardsignType === 'HAND';
    let tags = [];
    isInvoiceFree && tags.push({text: this.$t( 'common.invoice.free'), color: 'blue'});
    let from = null;
    electronicFlag && (from = `${this.$t('expense.invoice.type.wechat')/*微信*/}    ${this.$t('expense.invoice.check.code')/*校验码*/}：${invoice.checkCode}`);
    invoiceScanFlag && (from = this.$t(`expense.invoice.type.${invoice.cardsignType}`)/*票加加*/);
    alipayFlag && (from = this.$t('expense.invoice.type.alipay')/*支付宝*/);
    handFlag && (from = this.$t('expense.invoice.type.manually')/*手工录入*/);
    return (brief && !canExpense) ? (
      <div className="invoice-brief-mode">
        <Row>
          <Col span={6} className="invoice-brief-amount-area">
            {!electronicFlag &&
            <a onClick={() => this.setState({brief: false})}>{this.$t('expense.invoice.view.detail')/*查看详情*/}</a>}
            <Row className="invoice-brief-amount-detail" style={{marginTop: electronicFlag && 30}}>
              <Col span={14}>{this.$t('expense.invoice.amount.without.tax')/*金额合计*/}</Col>
              <Col span={10}>{(typeof invoice.feeWithoutTax === 'number') ? (invoice.feeWithoutTax / 100).toFixed(2) : '-'}</Col>
              <Col span={14}>{this.$t('common.currency')/*币种*/}</Col>
              <Col span={10}>{invoice.vatInvoiceCurrencyCode || 'CNY'}</Col>
              <Col span={14}>{this.$t('expense.invoice.tax')/*税额合计*/}</Col>
              <Col span={10}>{(typeof invoice.tax === 'number') ? (invoice.tax / 100).toFixed(2) : '-'}</Col>
              <Col span={14}>{this.$t('expense.invoice.price.and.tax')/*价税合计*/}</Col>
              <Col span={10}>{(invoice.fee / 100).toFixed(2)}</Col>
            </Row>
          </Col>
          <Col span={18} className="invoice-brief-content-area">
            <div className="invoice-type">
              {invoice.type}
              {handFlag && !disabledEdit &&
              <Button icon="edit" type="primary" onClick={handleEdit}>{this.$t('common.update')/*修改*/}</Button>}
              {invoiceFreePrint && (electronicFlag || (alipayFlag && invoice.pdfUrl)) && <Button icon="printer" type="primary"
                                                             onClick={this.handlePrint}>{this.$t('common.print')/*打印*/}</Button>}
            </div>
            <Row className="invoice-brief-content" gutter={10}>

              {(!handFlag || profile['InvoiceControl.InvD.All.display']) && (
                <Col span={12}>
                  <span className="title">{this.$t('expense.invoice.date')/*开票日期*/}：</span>&nbsp;
                  {invoice.billingTime ? new Date(invoice.billingTime * 1000).format('yyyy-MM-dd') : ''}
                </Col>
              )}
              <Col span={12}>
                <span className="title">{this.$t('common.from')/*来源*/}：</span>&nbsp;
                <Popover content={from} overlayStyle={{width: 200}}>
                  {from}
                </Popover>
              </Col>
              <Col span={12}>
                <span className="title">{this.$t('expense.invoice.code')/*发票代码*/}：</span>&nbsp;
                {invoice.billingCode}
              </Col>
              <Col span={12}>
                <span className="title">{this.$t('expense.invoice.number')/*发票号码*/}：</span>&nbsp;
                {invoice.billingNo}
              </Col>
              <Col span={12}>
                <span className="title">{this.$t('expense.invoice.seller')/*销售方*/}：</span>&nbsp;
                <Popover content={invoice.payee} overlayStyle={{width: 200}}>
                  {invoice.payee}
                </Popover>
              </Col>
              <Col span={12}>
                <span className="title">{this.$t('expense.invoice.buyer')/*购买方*/}：</span>&nbsp;
                <Popover content={invoice.title} overlayStyle={{width: 200}}>
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
                message={this.showMessage(item)}
                key={item.name}
                type={item.level === 'ERROR' ? 'error' : 'info'}
                showIcon/>
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
            {(!handFlag || profile['InvoiceControl.InvD.All.display']) && this.renderDetail(this.$t('expense.invoice.date')/*开票日期*/, (invoice.billingTime ? new Date(invoice.billingTime * 1000) : new Date()).format('yyyy-MM-dd'))}
            {this.renderDetail(this.$t('expense.invoice.code')/*发票代码*/, invoice.billingCode)}
            {this.renderDetail(this.$t('expense.invoice.number')/*发票号码*/, invoice.billingNo)}
            {this.renderDetail(this.$t('expense.invoice.device.number')/*机器编号*/, invoice.deviceNumber)}
            {this.renderDetail(this.$t('expense.invoice.check.code')/*校验码*/, invoice.checkCode)}
          </Row>
          <Row className="invoice-row">
            <Col span={4} className="invoice-title">{this.$t('expense.invoice.price.and.tax')/*价税合计*/}:</Col>
            <Col span={20} className="invoice-detail">
              <b className="invoice-currency">{invoice.vatInvoiceCurrencyCode || 'CNY'}</b>
              <b className="invoice-amount">{(invoice.fee / 100).toFixed(2)}</b>
              ({this.$t('expense.invoice.amount.without.tax')/*金额合计*/}：{typeof invoice.feeWithoutTax === 'number' ? (invoice.feeWithoutTax / 100).toFixed(2) : '-'} {this.$t('expense.invoice.tax')/*税额合计*/}：{typeof invoice.tax === 'number' ? ((invoice.tax) / 100).toFixed(2) : '-'})
            </Col>
          </Row>
          <Row>
            <Col span={4} className="invoice-title">{this.$t('common.remark')/*备注*/}:</Col>
            <Col span={20} className="invoice-detail">{invoice.remark || '-'}</Col>
          </Row>
          <Table size="small"
                 style={{margin: '10px 0'}}
                 columns={columns}
                 dataSource={invoice.invoiceGoods}
                 rowKey={record => record.index}
                 pagination={false}/>
          <Row>
            {this.renderDetail(this.$t('expense.invoice.buyer')/*购买方*/, invoice.title, 24)}
            {this.renderDetail(this.$t('expense.invoice.tax.payer.identity.number')/*纳税人识别号*/, invoice.draweeNo, 24)}
            {this.renderDetail(this.$t('expense.invoice.address.phone')/*地址/电话*/, invoice.draweeAddressPhone, 24)}
            {this.renderDetail(this.$t('expense.invoice.opening.bank.account')/*开户行/账户*/, invoice.draweeBankAccount, 24)}
          </Row>
          <hr style={{borderColor: '#e8e8e8'}}/>
          <Row>
            {this.renderDetail(this.$t('expense.invoice.seller')/*销售方*/, invoice.payee, 24)}
            {this.renderDetail(this.$t('expense.invoice.tax.payer.identity.number')/*纳税人识别号*/, invoice.payeeNo, 24)}
            {this.renderDetail(this.$t('expense.invoice.address.phone')/*地址/电话*/, invoice.payeeAddressPhone, 24)}
            {this.renderDetail(this.$t('expense.invoice.opening.bank.account')/*开户行/账户*/, invoice.payeeBankAccount, 24)}
          </Row>
        </div>
        <div className="invoice-operate">
          {!canExpense && <a onClick={() => this.setState({brief: true})}>{this.$t('expense.invoice.retract.detail')/*收起详情*/}</a>}
          {invoiceFreePrint && electronicFlag && <a onClick={this.handlePrint}>{this.$t('common.print')/*打印*/}</a>}
        </div>
      </div>
    )
  }
}

Invoice.propTypes = {
  invoice: PropTypes.object.isRequired, // 费用数据
  disabledEdit: PropTypes.bool, // 是否可编辑
  handleEdit: PropTypes.func // 编辑回调
};

function mapStateToProps(state) {
  return {
    company: state.login.company,
    profile: state.login.profile
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(Invoice);
