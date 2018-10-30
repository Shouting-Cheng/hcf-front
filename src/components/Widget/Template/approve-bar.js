import React from 'react';
import config from 'config';
import httpFetch from 'share/httpFetch';
import {
  Form,
  Row,
  Col,
  Popover,
  Input,
  Button,
  Tag,
  message,
  Spin,
  Dropdown,
  Menu,
  Icon,
  Alert,
  Checkbox,
} from 'antd';
const FormItem = Form.Item;
const { CheckableTag } = Tag;
import ListSelector from 'widget/list-selector';
import 'styles/components/template/approve-bar.scss';
import 'styles/reimburse/reimburse-common.scss';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import PropTypes from 'prop-types';

class ApproveBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tags: [],
      fastReplyEdit: false,
      inputVisible: false,
      inputValue: '',
      fastReplyChosen: [],
      inputError: false,
      errorMessage: '',
      showAdditionalSelector: false,
      additionalNames: [], //加签人的Name
      additionalItems: [],
      priceAuditor: false,
    };
  }

  componentWillMount() {
    this.getQuickTags();
  }

  //获取快捷回复内容
  getQuickTags = () => {
    this.setState({ loading: true });
    let url = '/api/quick/reply';
    if (this.props.audit) {
      url = `/api/dudit/quick/reply?userOid=${this.props.user.userOID}`;
    }
    httpFetch.get(`${config.baseUrl}${url}`).then(res => {
      if (res.status === 200) {
        let tags = this.props.audit ? res.data.rows : res.data;
        this.setState({ tags: tags, loading: false });
      }
    });
  };

  //显示新增快捷回复输入框
  showTagInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  //选择快捷回复
  onFastReplyChange = (checked, id) => {
    const { getFieldsValue, setFieldsValue } = this.props.form;
    let { tags, fastReplyChosen } = this.state;
    let fastReplyChosenValue = [];
    if (getFieldsValue().reason) {
      fastReplyChosenValue.push(getFieldsValue().reason);
      fastReplyChosenValue = fastReplyChosenValue[0].split('，');
    }
    tags.map(item => {
      if (item.id === id) {
        item.checked = true;
        fastReplyChosen.push(item);
        fastReplyChosenValue.push(item.reply);
      }
    });
    setFieldsValue({ reason: fastReplyChosenValue.join('，') });
    this.setState(
      {
        fastReplyChosen,
        inputError: fastReplyChosenValue.join('，').length > 200,
        errorMessage: this.$t('common.max.characters.length', { max: 200 }),
      },
      () => {
        this.reasonInput.focus();
      }
    );
  };

  //审批意见输入
  onReasonChange = e => {
    this.setState({
      inputError: e.target.value.length > 200,
      errorMessage: this.$t('common.max.characters.length', { max: 200 }),
    });
  };

  onInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  //确认新增的快捷回复
  handleInputConfirm = () => {
    const { inputValue } = this.state;
    if (inputValue && inputValue.trim() && inputValue.trim().length <= 200) {
      this.setState({ loading: true });
      let url = '/api/quick/reply';
      let param = { reply: inputValue.trim() };
      if (this.props.audit) {
        url = '/api/dudit/quick/reply';
        param = {
          reply: inputValue.trim(),
          tenantId: this.props.company.tenantId,
        };
      }
      httpFetch.post(`${config.baseUrl}${url}`, param).then(res => {
        if (res.status === 200) {
          this.setState({ inputVisible: false, inputValue: '' });
          this.getQuickTags();
          message.success(this.$t('common.operate.success') /*操作成功*/);
        }
      });
    } else {
      this.setState({ inputVisible: false });
    }
  };

  //删除快捷回复标签
  handleDeleteTag = (e, item) => {
    e.stopPropagation();
    this.setState({ loading: true });
    let url = '/api/quick/reply';
    let param = { quickReplyOIDs: item.quickReplyOID };
    if (this.props.audit) {
      url = '/api/dudit/quick/reply';
      param = { id: item.id };
    }
    httpFetch
      .delete(`${config.baseUrl}${url}?quickReplyOIDs=${item.quickReplyOID}`)
      .then(res => {
        let isSuccess = this.props.audit ? res.data.rows : true;
        if (res.status === 200 && isSuccess) {
          this.getQuickTags();
          message.success(this.$t('common.delete.success', { name: '' }));
        } else {
          this.setState({ loading: false });
          message.error(this.$t('common.operate.filed')); //操作失败
        }
      })
      .catch(e => {
        this.setState({ loading: false });
        message.success(`${this.$t('common.operate.filed')}，${e.response.data.message}`);
      });
  };

  handleFastReplyEdit = () => {
    let fastReplyEdit = this.state.fastReplyEdit;
    this.setState({ fastReplyEdit: !fastReplyEdit });
  };

  //审批通过
  handleApprovePass = () => {
    let values = this.props.form.getFieldsValue();
    if (values.reason && values.reason.length > 200) return;
    /**
     * handleApprovePass(通过原因，加签人，是否需要价格审核)
     */
    this.props.handleApprovePass(
      values.reason,
      this.state.additionalItems,
      this.state.priceAuditor
    );
  };

  //审批驳回
  handleApproveReject = () => {
    let values = this.props.form.getFieldsValue();
    if (values.reason && values.reason.length > 200) return;
    if (!values.reason || !values.reason.trim()) {
      this.setState({
        inputError: true,
        errorMessage: this.$t('approve-bar.please.enter.reject'),
      });
      if (this.state.additionalItems.length) {
        message.error(this.$t('approve-bar.please.enter.reject'));
      }
    } else {
      this.setState({ inputError: false });
      this.props.handleApproveReject(values.reason, this.state.additionalItems);
    }
  };

  //审核通知
  handleAuditNotice = () => {
    let values = this.props.form.getFieldsValue();
    if (values.reason && values.reason.length > 200) return;
    if (!values.reason || !values.reason.trim()) {
      this.setState({
        inputError: true,
        errorMessage: this.$t('approve-bar.please.enter.notice'),
      });
    } else {
      this.setState({ inputError: false });
      this.props.handleAuditNotice(values.reason);
    }
  };

  //返回
  goBack = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: this.props.backUrl,
      })
    );
  };

  //点击【更多】里的按钮
  handleClickMoreItem = item => {
    if (item.key === 'additional') {
      this.setState({ showAdditionalSelector: true });
    }
  };

  //选择加签人
  handleSelectAddition = rows => {
    let additionalNames = [];
    let additionalItems = [];
    rows.result.map(item => {
      additionalNames.push(item.fullName);
      additionalItems.push(item);
    });
    this.setState({
      additionalNames,
      additionalItems,
      showAdditionalSelector: false,
    });
  };

  handlePriceView = e => {
    this.setState({ priceAuditor: e.target.checked });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      audit,
      priceView,
      buttons,
      batchNumber,
      btnShowMode,
      width,
      style,
      invoiceNumber,
      moreButtons,
      customFormPropertyMap,
    } = this.props;
    const {
      loading,
      tags,
      fastReplyEdit,
      inputVisible,
      inputValue,
      inputError,
      errorMessage,
      showAdditionalSelector,
      additionalNames,
      additionalItems,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const fastReplyTitle = (
      <div className="fast-reply-title">
        {this.$t('approve-bar.quick.reply') /*快捷回复*/}
        {!fastReplyEdit && (
          <a className="edit" onClick={this.handleFastReplyEdit}>
            {this.$t('common.edit') /*编辑*/}
          </a>
        )}
        {fastReplyEdit && (
          <a className="edit" onClick={this.handleFastReplyEdit}>
            {this.$t('common.cancel') /*取消*/}
          </a>
        )}
      </div>
    );
    const fastReplyContent = (
      <div className="fast-reply">
        <Spin spinning={loading}>
          {tags.map(item => {
            let isEditItem = true;
            if (this.props.audit) {
              isEditItem = item.type !== 2001;
            }
            return (
              <CheckableTag
                key={item.id}
                className="fast-reply-tag"
                onChange={checked => this.onFastReplyChange(checked, item.id)}
              >
                {item.reply}
                {fastReplyEdit &&
                  isEditItem && (
                    <a className="delete-tag" onClick={e => this.handleDeleteTag(e, item)}>
                      &times;
                    </a>
                  )}
              </CheckableTag>
            );
          })}
          {!inputVisible &&
            !fastReplyEdit && (
              <Button
                size="small"
                type="dashed"
                className="add-new-btn"
                onClick={this.showTagInput}
              >
                + {this.$t('approve-bar.new.quick.reply') /*新增快速回复*/}
              </Button>
            )}
          {inputVisible && (
            <Input
              ref={input => (this.input = input)}
              type="text"
              size="small"
              className="fast-reply-input"
              value={inputValue}
              onChange={this.onInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
          )}
        </Spin>
      </div>
    );
    const barLayout = {
      lg: 12,
      md: 24,
      sm: 24,
      xs: 24,
    };
    let moreMenu = (
      <Menu onClick={this.handleClickMoreItem}>
        {moreButtons.map(type => {
          if (type === 'additional') {
            return (
              <Menu.Item key="additional">
                {this.$t('approve-bar.additional.sign') /*加签*/}
              </Menu.Item>
            );
          }
        })}
      </Menu>
    );
    let additionalMessage = (
      <Row>
        <Col span={21} className="info-col">
          {this.$t('approve-bar.additional.sign.content', {
            number: additionalNames.length,
          }) /*单据通过后加签生效，加签 {additionalNames.length} 人*/}：{additionalNames.join(', ')}
        </Col>
        <Col span={3} className="edit-col">
          <a
            onClick={() => {
              this.setState({ showAdditionalSelector: true });
            }}
          >
            {this.$t('common.edit')}
          </a>
        </Col>
      </Row>
    );
    return (
      <div className="approve-bar" style={{ width, ...style }}>
        <Row>
          <Col {...barLayout}>
            <Form layout={'inline'}>
              <FormItem
                label={
                  audit
                    ? this.$t('approve-bar.audit.suggest')
                    : this.$t('approve-bar.approve.suggest')
                }
                validateStatus={inputError ? 'error' : ''}
                help={inputError ? errorMessage : ''}
                className="approve-form"
              >
                <Popover
                  trigger="click"
                  title={fastReplyTitle}
                  content={fastReplyContent}
                  getPopupContainer={() => document.getElementsByClassName('approve-bar')[0]}
                  overlayStyle={{ width: '69%', maxHeight: '140px' }}
                >
                  {getFieldDecorator('reason')(
                    <Input
                      placeholder={this.$t('common.max.characters.length', { max: 200 })}
                      ref={node => (this.reasonInput = node)}
                      onChange={this.onReasonChange}
                    />
                  )}
                </Popover>
              </FormItem>
            </Form>
          </Col>
          <Col {...barLayout} className="approve-btn" style={{ paddingRight: '40px' }}>
            {buttons.indexOf('pass') > -1 && (
              <span>
                <Button
                  type="primary"
                  onClick={this.handleApprovePass}
                  loading={this.props.passLoading}
                  htmlType="submit"
                  className="pass-btn"
                >
                  {batchNumber > 0
                    ? this.$t('common.pass.number', { number: batchNumber })
                    : btnShowMode === 'all'
                      ? this.$t('common.pass.all')
                      : this.$t('common.pass')}
                </Button>
                {priceView && (
                  <Checkbox onChange={this.handlePriceView}>
                    {this.$t('approve-bar.price.audit') /*价格审核*/}
                  </Checkbox>
                )}
              </span>
            )}
            {buttons.indexOf('reject') > -1 && (
              <Button
                loading={this.props.rejectLoading}
                onClick={this.handleApproveReject}
                htmlType="submit"
                className="reject-btn"
              >
                {batchNumber > 0
                  ? this.$t('common.reject.number', { number: batchNumber })
                  : btnShowMode === 'all'
                    ? this.$t('common.reject.all')
                    : this.$t('common.reject')}
              </Button>
            )}
            {!!moreButtons.length && (
              <Dropdown overlay={moreMenu} placement="topCenter">
                <Button>
                  {this.$t('common.more')}
                  <Icon type="down" />
                </Button>
              </Dropdown>
            )}
            {/*通知*/}
            {audit &&
              buttons.indexOf('notice') > -1 && (
                <Button
                  loading={this.props.noticeLoading}
                  onClick={this.handleAuditNotice}
                  htmlType="submit"
                  type="primary"
                  className="notice-btn"
                >
                  {batchNumber > 0
                    ? this.$t('common.notice.number', { number: batchNumber })
                    : this.$t('common.notice')}
                </Button>
              )}
            {audit &&
              buttons.indexOf('print') > -1 && (
                <Button
                  loading={this.props.printLoading}
                  type="primary"
                  onClick={this.props.handleAuditPrint}
                >
                  {batchNumber > 0
                    ? this.$t('common.print.number', { number: batchNumber })
                    : this.$t('common.print')}
                </Button>
              )}
            {audit &&
              invoiceNumber > 0 && (
                <Button
                  className="back-btn"
                  htmlType="submit"
                  loading={this.props.checkLoading}
                  onClick={this.props.handleAuditCheck}
                >
                  {this.$t('common.invoiceNumber', { total: invoiceNumber })}
                </Button>
              )}
            {this.props.backUrl && (
              <Button className="back-btn" htmlType="submit" onClick={this.goBack}>
                {this.$t('common.back')}
              </Button>
            )}
          </Col>
        </Row>
        {additionalNames.length > 0 && (
          <Row className="additional-alert-info">
            <Col span={9} offset={3}>
              <Popover content={additionalNames.join(', ')}>
                <input style={{ position: 'absolute', top: '-9999vh', left: 0, zIndex: -1 }} />
                <Alert message={additionalMessage} type="info" />
              </Popover>
            </Col>
          </Row>
        )}

        {/*用于加签人员选择，可多选*/}
        <ListSelector
          visible={showAdditionalSelector}
          type="user"
          showDetail
          labelKey="fullName"
          selectedData={additionalItems}
          extraParams={{ roleType: 'TENANT' }}
          onOk={this.handleSelectAddition}
          showArrow={
            !customFormPropertyMap ||
            !customFormPropertyMap.countersignType ||
            customFormPropertyMap.countersignType !== '1'
          }
          onCancel={() => this.setState({ showAdditionalSelector: false })}
        />
      </div>
    );
  }
}

ApproveBar.propTypes = {
  handleApprovePass: PropTypes.func, //审批通过方法
  handleApproveReject: PropTypes.func, //审批驳回方法
  handleAuditNotice: PropTypes.func, //审核通知方法
  handleAuditPrint: PropTypes.func, //审核打印方法
  handleAuditCheck: PropTypes.func, //重新查验发票方法
  passLoading: PropTypes.bool, //审批通过按钮loading
  rejectLoading: PropTypes.bool, //审批通过按钮loading
  noticeLoading: PropTypes.bool, //审核通知按钮loading
  printLoading: PropTypes.bool, //审核打印按钮loading
  checkLoading: PropTypes.bool, //查验发票按钮loading
  backUrl: PropTypes.string, //点击"返回"按钮跳转到的页面
  audit: PropTypes.bool, //是否为审核
  batchNumber: PropTypes.number, //批量数量
  buttons: PropTypes.array, //显示的按钮，不传则都显示
  btnShowMode: PropTypes.string, //通过／驳回按钮的显示文案，不传的时候显示'通过'，'驳回'，如果传'all'，则显示'全部通过'，'全部驳回'
  priceView: PropTypes.bool, //是否需要加价格审核
  width: PropTypes.any, //宽度
  moreButtons: PropTypes.array, //"更多"里需要显示的按钮，不传则都不显示: additional(加签)
  invoiceNumber: PropTypes.number, //为查验的发票数量
};

ApproveBar.defaultProps = {
  handleApprovePass: () => {},
  handleApproveReject: () => {},
  handleAuditNotice: () => {},
  handleAuditPrint: () => {},
  handleAuditCheck: () => {},
  passLoading: false,
  rejectLoading: false,
  noticeLoading: false,
  printLoading: false,
  audit: false,
  checkLoading: false,
  batchNumber: 0,
  btnShowMode: '',
  invoiceNumber: 0,
  buttons: ['pass', 'reject', 'notice', 'print'],
  priceView: false,
  width: '',
  moreButtons: [],
};

const wrappedApproveBar = Form.create(mapStateToProps)(ApproveBar);

function mapStateToProps(state) {
  return {
    user: state.login.user,
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedApproveBar);
