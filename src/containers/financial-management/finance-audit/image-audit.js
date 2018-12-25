import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  message,
  Button,
  Modal,
  Row,
  Col,
  Switch,
  Icon,
  Badge,
  Spin,
  Tooltip,
  Popover,
} from 'antd';
import financeAuditService from 'containers/financial-management/finance-audit/finance-audit.service';
import 'styles/financial-management/finance-audit/image-audit.scss';
class ImageAudit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invoices: [],
      nowInvoiceIndex: 0,
      nowAttachmentIndex: 0,
      totalAttachments: 0,
      checking: false,
    };
    this.moving = false; //图片移动状态
    this.startXY = {}; //图片移动前时记录xy值
  }

  componentWillReceiveProps(nextProps) {
    const { invoices, visible, defaultImage } = nextProps;
    //显示时初始化
    if (visible && !this.props.visible) {
      let result = [];
      let totalAttachments = 0;
      let nowInvoiceIndex = 0,
        nowAttachmentIndex = 0;
      invoices.map(invoice => {
        if (invoice.attachments && invoice.attachments.length > 0) {
          let target = invoice;
          let allChecked = true;
          target.attachments.map(attachment => {
            allChecked = allChecked && attachment.checked;
          });
          target.allChecked = allChecked;
          result.push(target);
          totalAttachments += target.attachments.length;
        }
      });
      result.map((invoice, invoiceIndex) => {
        invoice.attachments.map((attachment, attachmentIndex) => {
          if (defaultImage && defaultImage.attachmentOid === attachment.attachmentOid) {
            nowInvoiceIndex = invoiceIndex;
            nowAttachmentIndex = attachmentIndex;
          }
        });
      });
      this.setState({ invoices: result, totalAttachments, nowInvoiceIndex, nowAttachmentIndex });
    }
    //重置样式
    if (!visible && this.props.visible) {
      this.initialImageStyle();
    }
  }

  componentDidMount() {
    if (window.addEventListener) {
      window.addEventListener('keyup', this.handleKeyUp);
    } else {
      window.attachEvent('onkeyup', this.handleKeyUp);
    }
  }

  onMouseMove = e => {
    e.stopPropagation();
    if (this.moving) {
      let imageDom = ReactDOM.findDOMNode(this.refs.imageRef);
      //与记录值的偏移量
      let offsetX = e.clientX - this.startXY.X;
      let offsetY = e.clientY - this.startXY.Y;
      let originLeft = 0;
      let originTop = 0;
      let imageLeft = imageDom.style.left;
      let imageTop = imageDom.style.top;
      //取得原本left、top值
      if (imageLeft) {
        originLeft = Number(imageLeft.substr(0, imageLeft.indexOf('px')));
      }
      if (imageTop) {
        originTop = Number(imageTop.substr(0, imageTop.indexOf('px')));
      }
      imageDom.style.left = originLeft + offsetX + 'px';
      imageDom.style.top = originTop + offsetY + 'px';
      //设置后重制记录值
      this.startXY = { X: e.clientX, Y: e.clientY };
    }
  };

  onMouseUp = e => {
    e.stopPropagation();
    this.moving = false;
  };

  onMouseDown = e => {
    e.stopPropagation();
    this.startXY = { X: e.clientX, Y: e.clientY };
    this.moving = true;
  };

  componentWillUnmount() {
    if (window.addEventListener) {
      window.removeEventListener('keyup', this.handleKeyUp);
    } else {
      window.detachEvent('onkeyup', this.handleKeyUp);
    }
  }

  initialImageStyle = () => {
    let imageDom = ReactDOM.findDOMNode(this.refs.imageRef);
    imageDom.style.transform = '';
    imageDom.style.top = '0px';
    imageDom.style.left = '0px';
  };

  //键盘事件
  handleKeyUp = e => {
    let { nowAttachmentIndex, nowInvoiceIndex, invoices } = this.state;
    const { visible } = this.props;
    if (visible) {
      switch (e.keyCode) {
        //空格
        case 32: {
          this.handleCheckAttachment(
            !invoices[nowInvoiceIndex].attachments[nowAttachmentIndex].checked,
            nowInvoiceIndex,
            nowAttachmentIndex
          );
          break;
        }
        //⬅
        case 37: {
          if (nowAttachmentIndex !== 0) this.handleSelectAttachment(--nowAttachmentIndex);
          break;
        }
        //⬆
        case 38: {
          if (nowInvoiceIndex !== 0) this.handleSelectInvoice(--nowInvoiceIndex);
          break;
        }
        //➡
        case 39: {
          if (nowAttachmentIndex !== invoices[nowInvoiceIndex].attachments.length - 1)
            this.handleSelectAttachment(++nowAttachmentIndex);
          break;
        }
        //⬇
        case 40: {
          if (nowInvoiceIndex !== invoices.length - 1) this.handleSelectInvoice(++nowInvoiceIndex);
          break;
        }
      }
    }
  };

  //审核图片
  handleCheckAttachment = (checked, invoiceIndex, attachmentIndex) => {
    let { invoices, nowInvoiceIndex } = this.state;
    let { currentInvoices } = this.props;
    this.setState({ checking: true });
    financeAuditService
      .checkAttachment({
        attachmentOid: invoices[invoiceIndex].attachments[attachmentIndex].attachmentOid,
        checked,
        invoiceOid: invoices[invoiceIndex].invoiceOid,
      })
      .then(res => {
        invoices[invoiceIndex].attachments[attachmentIndex].checked = checked;
        currentInvoices &&
          currentInvoices.map(item => {
            if (item.invoiceOid === invoices[invoiceIndex].invoiceOid) {
              let target = item.invoiceView;
              target.attachments &&
                target.attachments.map(i => {
                  if (
                    i.attachmentOid ===
                    invoices[invoiceIndex].attachments[attachmentIndex].attachmentOid
                  ) {
                    i.checked = checked;
                  }
                });
            }
          });
        let allChecked = true;
        invoices[invoiceIndex].attachments.map(attachment => {
          allChecked = allChecked && attachment.checked;
        });
        invoices[invoiceIndex].allChecked = allChecked;
        this.setState({ invoices, checking: false, nowInvoiceIndex });
      });
  };

  handleSelectAttachment = index => {
    this.setState({ nowAttachmentIndex: index }, this.initialImageStyle);
  };

  handleSelectInvoice = index => {
    this.setState({ nowInvoiceIndex: index, nowAttachmentIndex: 0 }, this.initialImageStyle);
  };

  handleOperateImage = operate => {
    let imageDom = ReactDOM.findDOMNode(this.refs.imageRef);
    let transformStyle = imageDom.style.transform;
    let rotateZ = 0,
      scale = 1;
    //得到rotateZ值
    transformStyle.replace(/rotateZ\(((\d+)|(-\d+))deg\)/, (target, $1) => {
      rotateZ = Number($1);
      return target;
    });
    //得到scale值
    transformStyle.replace(/scale\(((\d+.\d+)|(\d+))\)/, (target, $1) => {
      scale = Number($1);
      return target;
    });
    switch (operate) {
      //放大，最大2
      case 'plus': {
        if (scale < 2) scale += 0.2;
        break;
      }
      //缩小，最小1
      case 'minus': {
        if (scale > 1) scale -= 0.2;
        break;
      }
      //向左旋转
      case 'left': {
        rotateZ -= 90;
        break;
      }
      //向又旋转
      case 'right': {
        rotateZ += 90;
        break;
      }
    }
    imageDom.style.transform = `rotateZ(${rotateZ}deg) scale(${scale})`;
  };

  render() {
    const {
      invoices,
      nowInvoiceIndex,
      nowAttachmentIndex,
      totalAttachments,
      checking,
    } = this.state;
    const { visible, afterClose, onCancel, isEnableCheck } = this.props;
    let nowInvoice = invoices[nowInvoiceIndex];
    let attachments = nowInvoice ? nowInvoice.attachments : [];
    let attachment = attachments.length > 0 ? attachments[nowAttachmentIndex] : {};
    let allCheckedNumber = 0;
    invoices.map(invoice => invoice.allChecked && allCheckedNumber++);
    const infoContent = (
      <div>
        <p>
          1.{this.$t('finance.audit.image.audit.info1') /*此模式下只显示该单据所有包含图片的费用*/}
        </p>
        <p>
          2.{this.$t(
            'finance.audit.image.audit.info2'
          ) /*键盘↔可切换图片，↕切换费用，按【空格】标记费用已核对/未核对*/}
        </p>
      </div>
    );
    return (
      <Modal
        className="image-audit"
        visible={visible}
        afterClose={afterClose}
        footer={null}
        onCancel={onCancel}
        width={1092}
        title={
          <span>
            {this.$t('finance.audit.image.audit') /*附件审核*/}&nbsp;{this.$t('common.total', {
              total: totalAttachments,
            }) /*共{totalAttachments}张*/}&nbsp;
            <Tooltip title={infoContent} placement="bottomLeft">
              <Icon type="info-circle" style={{ color: '#658FD6', cursor: 'pointer' }} />
            </Tooltip>
          </span>
        }
      >
        <Row className="image-audit-content">
          <Col span={8} className="invoice-list">
            <div className="invoice-count">
              {this.$t('finance.audit.wait.for.view') /*待核对费用*/}
              <span>
                {invoices.length - allCheckedNumber}
                {this.$t('finance.audit.wait.for.view.unit') /*笔*/}
              </span>
            </div>
            <div className="invoice-container">
              {invoices.map((invoice, index) => (
                <Row
                  key={invoice.invoiceOid}
                  className={`invoice-item ${nowInvoiceIndex === index && 'selected-invoice'}`}
                  onClick={() => this.handleSelectInvoice(index)}
                >
                  {invoice.allChecked &&
                    isEnableCheck && <Icon type="check-circle" className="selected-icon" />}
                  <Col span={8}>
                    <Popover content={new Date(invoice.createdDate).format('yyyy-MM-dd')}>
                      {new Date(invoice.createdDate).format('yyyy-MM-dd')}
                    </Popover>
                  </Col>
                  <Col span={8}>
                    <Popover content={invoice.expenseTypeName}>{invoice.expenseTypeName}</Popover>
                  </Col>
                  <Col span={4}>{invoice.invoiceCurrencyCode}</Col>
                  <Col span={4}>
                    <Popover content={this.filterMoney(invoice.amount)}>
                      {this.filterMoney(invoice.amount)}
                    </Popover>
                  </Col>
                </Row>
              ))}
            </div>
          </Col>
          <Col span={16} className="invoice-image">
            <Icon
              type="left"
              className="arrow arrow-left"
              onClick={() =>
                this.handleSelectAttachment(
                  nowAttachmentIndex === 0 ? attachments.length - 1 : nowAttachmentIndex - 1
                )
              }
            />
            <Icon
              type="right"
              className="arrow arrow-right"
              onClick={() =>
                this.handleSelectAttachment(
                  nowAttachmentIndex + 1 === attachments.length ? 0 : nowAttachmentIndex + 1
                )
              }
            />/>
            {nowInvoice && (
              <div>
                <div className="invoice-title">
                  <div className="attachment-status">
                    {checking ? (
                      <div>
                        <Spin />
                        <span className="attachment-status-description">
                          {this.$t('finance.audit.in.hand') /*处理中*/}
                        </span>
                      </div>
                    ) : (
                      isEnableCheck && (
                        <div>
                          <Switch
                            size="small"
                            checked={attachment.checked}
                            onChange={checked =>
                              this.handleCheckAttachment(
                                checked,
                                nowInvoiceIndex,
                                nowAttachmentIndex
                              )
                            }
                          />
                          <span className="attachment-status-description">
                            {attachment.checked
                              ? this.$t('finance.audit.checked') /*已核对*/
                              : this.$t('finance.audit.unchecked') /*未核对*/}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  {nowInvoice.expenseTypeName}&nbsp;&nbsp;
                  {nowInvoice.invoiceCurrencyCode}
                  {nowInvoice.amount.toFixed(2)}
                </div>
                <div className="attachment-area">
                  <img
                    src={attachment.fileURL}
                    ref="imageRef"
                    draggable={false}
                    onMouseDown={this.onMouseDown}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                  />
                </div>
                <div className="attachment-operate">
                  {nowAttachmentIndex + 1}/{attachments.length}
                  <div className="attachment-operate-icon">
                    <Icon type="plus" onClick={() => this.handleOperateImage('plus')} />
                    <Icon type="minus" onClick={() => this.handleOperateImage('minus')} />
                    <Icon type="swap-left" onClick={() => this.handleOperateImage('left')} />
                    <Icon type="swap-right" onClick={() => this.handleOperateImage('right')} />
                  </div>
                </div>
                <div className="attachment-list">
                  <div className="attachment-list-box">
                    {attachments.map((file, index) => (
                      <Badge
                        status={isEnableCheck ? (file.checked ? 'success' : 'error') : ''}
                        key={file.id}
                        count={0}
                        dot={isEnableCheck}
                        offset={[0, -10]}
                      >
                        <img
                          src={file.thumbnailUrl ? file.thumbnailUrl : file.fileURL}
                          className={`${index === nowAttachmentIndex && 'selected-attachment'}`}
                          onClick={() => this.handleSelectAttachment(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Modal>
    );
  }
}

ImageAudit.propTypes = {
  visible: PropTypes.bool.isRequired,
  invoices: PropTypes.array.isRequired,
  currentInvoices: PropTypes.array.isRequired,
  afterClose: PropTypes.func,
  onCancel: PropTypes.func,
  defaultImage: PropTypes.any,
  isEnableCheck: PropTypes.bool, //是否启用核对功能
};

ImageAudit.defaultProps = {
  visible: false,
  defaultImage: null,
  isEnableCheck: false,
};

ImageAudit.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ImageAudit);
