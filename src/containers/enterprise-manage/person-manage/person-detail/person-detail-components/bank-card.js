/**
 * Created by zhouli on 18/3/8
 * Email li.zhou@huilianyi.com
 */
//银行卡信息
import React from 'react';

import 'styles/enterprise-manage/person-manage/person-detail/person-detail-components/bank-card.scss';
import PDService from 'containers/enterprise-manage/person-manage/person-detail/person-detail.service';
import Chooser from 'components/Widget/chooser';
import PropTypes from 'prop-types';
import {
  Button,
  Switch,
  Modal,
  Row,
  message,
  Icon,
  Input,
  Form,
  Checkbox,
  Tooltip,
  Popconfirm,
} from 'antd';

const FormItem = Form.Item;

class PersonBankCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalKey: 0, //每次都需要变化，才能导致模态框每次渲染
      loading: false,
      data: [],
      showCreatModel: false, //弹窗是否显示
      card: {}, //当前编辑或新增的银行卡
      primaryStatus: false, //初始时默认状态
      isChangePrimary: false, //复选框选择的默认值
    };
  }

  componentDidMount() {
    // this.setState({ card: this.props.cardInfo });
    let param =  {...this.props.cardInfo};
    console.log(param)
    this.setState({ card: param,});
  }

  componentWillReceiveProps(nextProps) {
    // this.setState({ card: nextProps.cardInfo });
    /*console.log(nextProps)
    console.log(this.state.showCreatModel)
    debugger
    this.setState({
      card: nextProps.cardInfo,
      //isChangePrimary: nextProps.cardInfo.isPrimary
    });*/
  }

  //显示添加银行卡模态框
  showAddCardModel = () => {
    let modalKey = this.state.modalKey;
    modalKey++;
    const { card } = this.state;
    card.contactBankAccountOid = null;
    card.bankAccountNo = null;
    card.bankAccountName = null;

    card.bankName = null;
    card.branchName = null;
    card.accountLocation = null;
    card.primary = null;

    card.enabled = null;
    card.bankCode = null;
    console.log(this.props)
    this.setState(
      {
        modalKey,
        primaryStatus: this.props.count===0,
        isChangePrimary: this.props.count===0,
        showCreatModel: true,
        card, //当前编辑或新增的银行卡
      },
      () => {
        console.log(this.state.card);
      }
    );
  };
  // 编辑角色
  editCard = (e, record) => {
    let {card} = this.state;
    let modalKey = this.state.modalKey;
    modalKey++;
    this.setState({
      modalKey,
      primaryStatus: card.primary,
      isChangePrimary: card.primary,
      showCreatModel: true,
    });
  };
  //去添加银行卡
  addCard = e => {
    //如果没有这个，页面会刷新
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (!this.state.card.bankCode) {
          //请选择银行名称
          message.warning(this.$t('common.please.select') + this.$t('pdc.bank.card.bank.name'));
          return;
        }
        //let card = Object.assign(this.state.card);
        let card = { ...this.state.card, ...values };
        this.createUpdateCard(card);
      } else {
        this.setState({ loading: false });
      }
    });
  };
  cancelCard = () => {
    // 在这里重置一下，主要是为了清除模态框之前的状态，
    // 比如有校验字段，当取消再次弹窗的时候，校验提示还会显示出来
    this.props.form.resetFields();
    this.props.createCardOver();
    this.setState({
      showCreatModel: false,
    });
  };
  createUpdateCard = card => {
    this.setState({ loading: true });
    if (card.contactBankAccountOid) {
      PDService.updateBankCard(card)
        .then(res => {
          this.props.createCardOver();
          this.setState({
            showCreatModel: false,
            loading: false,
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.createCardOver();
        });
    } else {
      PDService.creatBankCard(card)
        .then(res => {
          //当新增了卡片需要传到父组件，重新刷新组件
          this.props.createCardOver();
          this.setState({
            showCreatModel: false,
            loading: false,
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.createCardOver();
        });
    }
  };
  //监听表单值
  handleFormChange = e => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };

  //银行开户名
  bankAccountNameChange = e => {
    let card = this.state.card;
    card.bankAccountName = e.target.value;
    this.setState({
      loading: false,
      card,
    });
  };
  //银行账号
  bankAccountNoChange = e => {
    let card = this.state.card;
    card.bankAccountNo = e.target.value;
    this.setState({
      loading: false,
      card,
    });
  };
  //开户地
  accountLocationChange = e => {
    let card = this.state.card;
    card.accountLocation = e.target.value;
    this.setState({
      loading: false,
      card,
    });
  };
  //银行
  handleBankCodeChange = e => {
    let card = this.state.card;
    if (e.length > 0) {
      card.bankCode = e[0].bankCode;
      card.branchName = e[0].bankBranchName;
      card.bankName = e[0].bankName;
    } else {
      card.bankCode = '';
      card.branchName = '';
      card.bankName = '';
    }
    this.setState({
      loading: false,
      card,
    });
  };
  //状态
  switchCardStatusChange = e => {
    let card = this.state.card;
    card.enabled = e;
    this.setState({
      loading: false,
      card,
    });
  };

  // 是否默认
  handleCardDefaultChange = e => {
    let card = this.state.card;
    card.primary = e.target.checked;
    this.setState({
      isChangePrimary: e.target.checked,
      loading: false,
      card,
    });
  };

  renderCard(card) {
    if (this.props.isEmpty) {
      return (
        <div className="card-add">
          <div className="card-add-icon-wrap" onClick={this.showAddCardModel}>
            <Icon type="plus" className="add-icon" />
          </div>
        </div>
      );
    } else {
      let cardName = 'card';
      if (!card.enabled) {
        cardName = 'disabled-card';
      }
      return (
        <div className={cardName}>
          <div className="card-top">
            <div className="f-left user-name">{card.bankAccountName}</div>
            <div className="f-right status">
              {/*? "启用中" : "未启用"*/}
              {card.enabled ? this.$t('pdc.bank.card.enable') : this.$t('pdc.bank.card.disable')}
            </div>
            <div className="f-right is-default">
              {/*? "默认" : ""*/}
              {card.primary ? this.$t('pdc.id.card.default') : ''}
            </div>

            <div className="clear" />
          </div>

          <div className="card-number">
            {/*//显示加密的*/}
            {card.originalBankAccountNo}
          </div>

          <div className="card-middle1">
            <div className="f-left bank-title">
              {/*开户银行：*/}
              {this.$t('pdc.bank.card.bank')}：
            </div>
            <div className="f-left bank-title-text">{card.branchName}</div>
            <div className="clear" />
          </div>

          <div className="card-middle2">
            <div className="f-left bank-address">
              {/*开户地：*/}
              {this.$t('pdc.bank.card.address')}：
            </div>
            <div className="f-left bank-address-text">{card.accountLocation}</div>
            <div className="clear" />
          </div>

          <div className="card-bottom">
            {this.props.isShowEditBtn ? (
              <div className="f-right bank-edit" onClick={this.editCard}>
                <Icon type="edit" className="info-circle" />
                <span>
                  {/*编辑*/}
                  {this.$t('common.edit')}
                </span>
              </div>
            ) : (
              <span />
            )}
            <div className="clear" />
          </div>
        </div>
      );
    }
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const { card, loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="person-bank-card-wrap">
        {this.renderCard(card)}
        <Modal
          key={this.state.modalKey}
          closable
          width={600}
          className="create-update-modal person-bank-card-wrap-modal"
          // ? '编辑银行卡信息' : '新增银行卡信息'
          title={
            card.contactBankAccountOid
              ? this.$t('pdc.bank.card.edit.bank.card')
              : this.$t('pdc.bank.card.new')
          }
          visible={this.state.showCreatModel}
          footer={null}
          onCancel={this.cancelCard}
          destroyOnClose={true}
        >
          <Form onSubmit={this.addCard} onChange={this.handleFormChange}>
            <FormItem
              {...formItemLayout}
              label={this.$t('pdc.bank.card.bank.account.name')} //银行开户名
            >
              {getFieldDecorator('bankAccountName', {
                initialValue: card.bankAccountName,
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.enter'),
                  },
                  {
                    max: 30,
                    message: this.$t('pdc.bank.card.reg1'), //"不能超过30个字符"
                  },
                  {
                    message: this.$t('pdc.bank.card.reg4'), //"只能输入字母，汉字，斜杠，点",
                    validator: (rule, value, cb) => {
                      if (value === null || value === undefined || value === '') {
                        cb();
                        return;
                      }
                      let regExp = /^[a-z\.\u4e00-\u9fa5\\\/]+$/i;
                      //去掉空格
                      value = value.replace(/ /g, '');
                      if (value.length <= 30 && regExp.test(value)) {
                        cb();
                      } else {
                        cb(false);
                      }
                    },
                  },
                ],
              })(
                <div>
                  <Input
                    onChange={this.bankAccountNameChange}
                    defaultValue={card.bankAccountName}
                    placeholder={this.$t('common.please.enter')}
                  />
                </div>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={this.$t('pdc.bank.card.bank.num')} //银行卡号
            >
              {getFieldDecorator('bankAccountNo', {
                initialValue: card.bankAccountNo,
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.enter'),
                  },
                  {
                    message: this.$t('pdc.bank.card.reg2'), //"只能是数字与-",
                    validator: (rule, value, cb) => {
                      if (value === null || value === undefined || value === '') {
                        cb();
                        return;
                      }
                      let regExp = /^[0-9\- ]+$/i;
                      //去掉空格
                      value = value.replace(/ /g, '');
                      if (value.length <= 30 && regExp.test(value)) {
                        cb();
                      } else {
                        cb(false);
                      }
                    },
                  },
                  {
                    max: 30,
                    message: this.$t('pdc.bank.card.reg1'), //"不能超过30个字符"
                  },
                ],
              })(
                <div>
                  <Input
                    onChange={this.bankAccountNoChange}
                    defaultValue={card.bankAccountNo}
                    placeholder={this.$t('common.please.enter')}
                  />
                </div>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={this.$t('pdc.bank.card.address')} //开户地
            >
              {getFieldDecorator('accountLocation', {
                initialValue: card.accountLocation,
                rules: [
                  {
                    max: 100,
                    message: this.$t('pdc.bank.card.reg3'), //"不能超过100个字符"
                  },
                ],
              })(
                <div>
                  <Input
                    onChange={this.accountLocationChange}
                    defaultValue={card.accountLocation}
                    placeholder={this.$t('common.please.enter')}
                  />
                </div>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={
                <span>
                  <span className="required-red">*&nbsp;</span>
                  <span>{this.$t('pdc.bank.card.bank.name')}</span>
                </span>
              } //银行名称
            >
              <div>
                <Chooser
                  single={true}
                  type="select_bank"
                  value={
                    card.bankCode
                      ? [
                          {
                            bankBranchName: card.branchName,
                            bankCode: card.bankCode,
                            bankName: card.bankName,
                          },
                        ]
                      : []
                  }
                  placeholder={this.$t('common.please.select')}
                  labelKey="bankBranchName"
                  onChange={this.handleBankCodeChange}
                  valueKey="bankCode"
                  listExtraParams={{}}
                />
              </div>
            </FormItem>
            {/*<FormItem {...formItemLayout}*/}
            {/*label={this.$t("pdc.bank.card.bank.name")}//银行名称*/}
            {/*>*/}
            {/*{getFieldDecorator('branchName', {*/}
            {/*initialValue: card.bankCode ? [*/}
            {/*{*/}
            {/*bankBranchName: card.branchName,*/}
            {/*bankCode: card.bankCode,*/}
            {/*}*/}
            {/*] : [],*/}
            {/*rules: [*/}
            {/*{*/}
            {/*required: true,*/}
            {/*message: this.$t("common.please.select")*/}
            {/*},*/}
            {/*],*/}
            {/*})(*/}
            {/*<div>*/}
            {/*<Chooser single={true}*/}
            {/*type="select_bank"*/}
            {/*value={ card.bankCode ? [*/}
            {/*{*/}
            {/*bankBranchName: card.branchName,*/}
            {/*bankCode: card.bankCode,*/}
            {/*}*/}
            {/*] : []}*/}
            {/*placeholder={this.$t("common.please.select")}*/}
            {/*labelKey="bankBranchName"*/}
            {/*onChange={this.handleBankCodeChange}*/}
            {/*valueKey="bankCode"*/}
            {/*listExtraParams={{}}/>*/}
            {/*</div>*/}
            {/*)}*/}
            {/*</FormItem>*/}

            {/*状态*/}
            <FormItem {...formItemLayout} label={this.$t('common.column.status')} colon={true}>
              {getFieldDecorator('enabled', {
                initialValue: card.enabled,
              })(
                <div>
                  <Switch
                    defaultChecked={card.enabled}
                    checked={card.enabled}
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                    onChange={this.switchCardStatusChange}
                  />
                  <span
                    className="enabled-type"
                    style={{
                      marginLeft: 20,
                      width: 100,
                    }}
                  >
                    {card.enabled ? this.$t('common.status.enable') : this.$t('common.disabled')}
                  </span>
                </div>
              )}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label={this.$t('pdc.bank.card.set.default')} //设为默认
            >
              {getFieldDecorator('primary', {
                initialValue: card.primary,
              })(
                <div>
                  <Checkbox
                    defaultChecked={card.primary}
                    checked={card.primary}
                    onChange={this.handleCardDefaultChange}
                  >
                    {/*是（只能有一个默认）*/}
                    {this.$t('pdc.bank.card.is.set.default')}
                  </Checkbox>
                </div>
              )}
            </FormItem>

            <div className="role-list-from-footer">
              <Button onClick={this.cancelCard}>{this.$t('common.cancel')}</Button>
              &nbsp;&nbsp;&nbsp;
              {
                console.log(this.state.isChangePrimary)
              }
              {console.log(this.state.primaryStatus)}
              {console.log(this.state.card)}
              {//当初始时为默认时, 则不提示替换
              this.state.primaryStatus ? (
                <Button type="primary" htmlType="submit" loading={loading}>
                  {this.$t('common.save')}
                </Button>
              ) : //当复选框选择为默认时, 则提示替换
              this.state.isChangePrimary ? (
                <Popconfirm
                  onConfirm={this.addCard}
                  title={this.$t('pdc.bank.card.confirmReplace')}
                >
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {this.$t('common.save')}
                  </Button>
                </Popconfirm>
              ) : (
                <Button type="primary" htmlType="submit" loading={loading}>
                  {this.$t('common.save')}
                </Button>
              )}
            </div>
          </Form>
        </Modal>
      </div>
    );
  }
}

PersonBankCard.propTypes = {
  createCardOver: PropTypes.func, //创建银行卡后
  cardInfo: PropTypes.object, //银行卡对象
  isEmpty: PropTypes.bool, // 是否是空的
  disabled: PropTypes.bool, // 是否是启用的
  isShowEditBtn: PropTypes.bool, // 是否显示编辑按钮
};
PersonBankCard.defaultProps = {
  isShowEditBtn: true,
};
const WrappedPersonBankCard = Form.create()(PersonBankCard);
export default WrappedPersonBankCard;
