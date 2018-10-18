import {messages} from "share/common";
/**
 * Created by zhouli on 18/3/8
 * Email li.zhou@huilianyi.com
 */
//各种证件信息
import React from 'react';

import 'styles/enterprise-manage/person-manage/person-detail/person-detail-components/some-id-card.scss';
import PDService from 'containers/enterprise-manage/person-manage/person-detail/person-detail.service';
import moment from 'moment';

import {
  DatePicker, Select,
  Button, Switch, Modal,
  Icon, Input, Form, Checkbox, Tooltip
} from 'antd';

const Option = Select.Option;
const FormItem = Form.Item;
const firstNameRuleEn = [
  {required: true, message: messages("common.please.enter")},
  {
    max: 30,
    message: messages("pdc.id.card.nomore.30")//"不能超过30个字符"
  },
]
const firstNameRule = [
  {
    max: 30,
    message: messages("pdc.id.card.nomore.30")//"不能超过30个字符"
  },
]

class PersonSomeIdCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalKey: 0,//每次都需要变化，才能导致模态框每次渲染
      loading: false,
      data: [],
      showCreatModel: false,//弹窗是否显示
      card: {},//当前编辑或新增的证件
      cardTypeList: [],//证件类型
      nationalityList: [],//国籍
      firstNameRule: firstNameRule,
    }
  }

  componentDidMount() {
    this.setState({
      card: this.props.cardInfo,
    });
    //证件
    // 国籍：1005
    // 证件类型：1006
    this.getSystemValueList(1005).then(res => {
      this.setState({
        nationalityList: res.data.values
      })
    });
    this.getSystemValueList(1006).then(res => {
      this.setState({
        cardTypeList: res.data.values
      })
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      card: nextProps.cardInfo,
    });
  }

  //显示添加证件模态框
  showAddCardModel = () => {
    let modalKey = this.state.modalKey;
    modalKey++;
    let card = Object.assign(this.state.card, {
      firstName: "",
      lastName: "",
    })
    this.setState({
      modalKey,
      showCreatModel: true,
      card,
    })
  };
  editCard = (e, record) => {
    let modalKey = this.state.modalKey;
    modalKey++;
    this.setState({
      modalKey,
      showCreatModel: true,
    })
  };
  //去添加卡
  addCard = (e) => {
    //如果没有这个，页面会刷新
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let card = Object.assign(this.state.card, {
          firstName: values.firstName,
          lastName: values.lastName,
          cardNo: values.cardNo,
        })
        this.createUpdateCard(card);
      }
    })
  };
  cancelCard = () => {
    // 在这里重置一下，主要是为了清除模态框之前的状态，
    // 比如有校验字段，当取消再次弹窗的时候，校验提示还会显示出来
    this.props.form.resetFields();
    this.props.createCardOver();
    this.setState({
      showCreatModel: false,
    })
  };
  createUpdateCard = (card) => {
    this.setState({
      loading: true,
    })
    if (card.contactCardOID) {
      PDService.updateContactCard(card)
        .then((res) => {
          this.props.createCardOver();
          this.setState({
            showCreatModel: false,
            loading: false,
          })
        })
        .catch((err) => {
          this.props.createCardOver();
        })
    } else {
      PDService.creatContactCard(card)
        .then((res) => {
          this.props.createCardOver();
          this.setState({
            showCreatModel: false,
            loading: false,
          })
        })
        .catch((err) => {
          this.props.createCardOver();
        })
    }
    this.setState({loading: false})
  }
  //监听表单值
  handleFormChange = (e) => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      })
    }
  };
  lastNameChange = (e) => {
    let value = e.target.value;
    let card = this.state.card;
    card.lastName = value;
    if (this._isEnglishName(value)) {
      this.setState({
        card,
        firstNameRule: firstNameRuleEn
      })
    } else {
      this.setState({
        card,
        firstNameRule: firstNameRule
      })
    }
  }
  firstNameChange = (e) => {
    let value = this.state.card.lastName;
    if (this._isEnglishName(value)) {
      this.setState({
        firstNameRule: firstNameRuleEn
      })
    } else {
      this.setState({
        firstNameRule: firstNameRule
      })
    }
  }
  //是不是英文名
  //是就返回true,否则返回false
  _isEnglishName = (lastName) => {
    let regChar = /[a-z0-9]/i; // 验证字母与数字
    if (lastName === "" || lastName === undefined || lastName === null) {
      return false;
    }
    if (regChar.test(lastName)) {
      return true;
    } else {
      return false;
    }
  }

  handleNationalityChange = (e) => {
    //国籍
    let card = this.state.card;
    card.nationalityCode = e;
    this.setState({
      loading: false,
      card
    })
  }
  //渲染国籍选项
  renderNationalityOption = (data) => {
    if (data && data.length) {
      return data.map((item) => {
        return <Option value={item.value} key={item.value}>{item.messageKey}</Option>
      })
    } else {
      return (null)
    }
  };

  //证件类型
  handleCardTypeChange = (e) => {
    let card = this.state.card;
    card.cardType = e;
    if (this.state.loading) {
      this.setState({
        loading: false,
        card
      })
    }
  }
  //过期时间
  handleCardTimeChange = (e) => {
    let card = this.state.card;
    card.cardExpiredTime = e.format();
    if (this.state.loading) {
      this.setState({
        loading: false,
        card
      })
    }
  }
  //状态
  switchCardStatusChange = (e) => {
    let card = this.state.card;
    card.enable = e;
    this.setState({
      loading: false,
      card
    })
  };
  //默认
  handleCardDefaultChange = (e) => {
    let card = this.state.card;
    card.isDefault = e.target.checked;
    this.setState({
      loading: false,
      card
    })
  };

  //渲染证件类型
  renderCardTypeOption = (data) => {
    if (data && data.length) {
      return data.map((item) => {
        return <Option value={item.value} key={item.code}>{item.messageKey}</Option>
      })
    } else {
      return (null)
    }
  };

  renderCard(card) {
    if (this.props.isEmpty) {
      return (
        <div className="card-add">
          <div className="card-add-icon-wrap" onClick={this.showAddCardModel}>
            <Icon type="plus" className="add-icon"/>
          </div>
        </div>
      )
    } else {
      let cardName = 'card';
      if (!card.enable) {
        cardName = 'disabled-card';
      }
      return (
        <div className={cardName}>
          <div className="card-top">
            <div className="f-left user-name">
              {/*中文的firstName可能没有*/}
              {
                card.firstName ? card.lastName + card.firstName : card.lastName
              }
            </div>
            <div className="f-right status">
              {/*? "启用中" : "已禁用"*/}
              {card.enable ? messages("pdc.id.card.enable") : messages("pdc.id.card.disable")}
            </div>
            <div className="f-right is-default">
              {/*? "默认" : ""*/}
              {card.isDefault ? messages("pdc.id.card.default") : ""}
            </div>

            <div className="clear"></div>
          </div>

          <div className="card-number">
            {
              card.cardNo
            }
          </div>

          <div className="card-middle1">
            <div className="f-left bank-title">
              {/*证件类型：*/}
              {messages("pdc.id.card.card.type")}：
            </div>
            <div className="f-left bank-title-text">{card.cardTypeName}</div>
            <div className="clear"></div>
          </div>

          <div className="card-middle1">
            <div className="f-left bank-title">
              {/*证件过期时间：*/}
              {messages("pdc.id.card.card.expire")}：
            </div>
            <div className="f-left bank-title-text">
              {card.cardExpiredTime ? moment(card.cardExpiredTime).format('YYYY-MM-DD') : ""}
            </div>
            <div className="clear"></div>
          </div>

          <div className="card-middle2">
            <div className="f-left bank-address">
              {/*国籍：*/}
              {messages("pdc.id.card.contry")}：
            </div>
            <div className="f-left bank-address-text">
              {card.nationality}
            </div>
            <div className="clear"></div>
          </div>

          <div className="card-bottom">
            {
              this.props.isShowEditBtn ? <div className="f-right bank-edit" onClick={this.editCard}>
                <Icon type="edit" className="info-circle"/>
                <span>
                {/*编辑*/}
                  {messages("common.edit")}
              </span>
              </div> : <span></span>
            }
            <div className="clear"></div>
          </div>

        </div>
      )
    }
  }

  render() {
    let nameTips = (
      <div>
        <p>{messages("pdc.id.card.name.tips0")}</p>
        <p>{messages("pdc.id.card.name.tips00")}</p>
        <p>{messages("pdc.id.card.name.tips1")}</p>
        <p>{messages("pdc.id.card.name.tips11")}</p>
        <p>{messages("pdc.id.card.name.tips2")}</p>
        <p>{messages("pdc.id.card.name.tips22")}</p>
      </div>
    );

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14, offset: 1},
    };
    const {card, loading} = this.state;
    //遇到一个坑
    //这个模态框与证件卡片无法绑定
    //打印的card字段明明改变，但是模态框的类容没有跟着card字段显示
    // 这是官网的解释：
    // <Modal /> 组件有标准的 React 生命周期，关闭后状态不会自动清空。
    // 如果希望每次打开都是新内容，需要自行手动清空旧的状态。或者打开时给 Modal 设置一个全新的 key， React 会渲染出一个全新的对话框。
    // <Modal key={this.state.newKey} visible={this.state.visible} />
    const {getFieldDecorator} = this.props.form;
    return (
      <div className="person-some-id-card">
        {this.renderCard(card)}
        <Modal
          key={this.state.modalKey}
          closable
          width={600}
          className="create-update-modal"
          //? '编辑证件信息' : '新增证件信息'
          title={card.contactCardOID ? messages("pdc.id.card.edit.card") : messages("pdc.id.card.new.card")}
          visible={this.state.showCreatModel}
          footer={null}
          onCancel={this.cancelCard}
          destroyOnClose={true}
        >
          <Form onSubmit={this.addCard} onChange={this.handleFormChange}>
            <FormItem {...formItemLayout}
                      label={messages("pdc.id.card.last.name")}//姓
            >
              {getFieldDecorator('lastName', {
                initialValue: card.lastName,
                rules: [
                  {
                    required: true,
                    message: messages('common.please.enter')
                  },
                  {
                    max: 30,
                    message: messages("pdc.id.card.nomore.30")//"不能超过30个字符"
                  },
                ],
              })(
                //input加一层div，就不会initialValue干扰了，每次都会重新根据card设定值进行渲染了；
                //这种情况，除了input,需要在onChange的回调里面设置变化的值,不然再最后的value获取不到
                <div className="input-tips-wrap"  key={this.state.modalKey}>
                  <Input
                    key={this.state.modalKey}
                    className="input-target"
                    onChange={this.lastNameChange}
                    defaultValue={card.lastName}
                    placeholder={messages('common.please.enter')}/>
                  &nbsp;&nbsp;&nbsp;
                  <span className="tips-wrap">
                    <Tooltip title={nameTips}>
                    {/*中文名可以不填写，直接写在姓里面*/}
                      <Icon type="question-circle"/>
                    </Tooltip>
                  </span>
                </div>
              )}
            </FormItem>

            {/*如果是英文名这个才必须填写*/}
            <FormItem {...formItemLayout}
                      label={messages("pdc.id.card.first.name")}//名
            >
              {getFieldDecorator('firstName', {
                initialValue: card.firstName,
                rules: this.state.firstNameRule
              })(
                //input加一层div，就不会initialValue干扰了，每次都会重新根据card设定值进行渲染了；
                //这种情况，除了input,需要在onChange的回调里面设置变化的值,不然再最后的value获取不到
                <div className="input-tips-wrap"  key={this.state.modalKey}>
                  <Input
                    key={this.state.modalKey}
                    className="input-target"
                    defaultValue={card.firstName}
                    onChange={this.firstNameChange}
                    placeholder={messages('common.please.enter')}/>
                  &nbsp;&nbsp;&nbsp;
                  <span className="tips-wrap">
                    <Tooltip title={nameTips}>
                      <Icon type="question-circle"/>
                      {/*英文名必须填写*/}
                    </Tooltip>
                  </span>
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout}
                      label={messages("pdc.id.card.contry")}//国籍
            >
              {getFieldDecorator('nationality', {
                initialValue: card.nationality,
                rules: [],
              })(
                <div>
                  <Select
                    defaultValue={card.nationality}
                    className="select-nationality"
                    showSearch
                    placeholder={messages('common.please.select')}
                    onChange={this.handleNationalityChange}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {
                      this.renderNationalityOption(this.state.nationalityList)
                    }
                  </Select>
                </div>
              )}
            </FormItem>

            <FormItem {...formItemLayout}
                      label={messages("pdc.id.card.card.type")}//证件类型
            >
              {getFieldDecorator('cardType', {
                initialValue: card.cardTypeName,
                rules: [
                  {
                    required: true,
                    message: messages('common.please.enter')
                  },
                ],
              })(
                <Select
                  defaultValue={card.cardTypeName}
                  className="select-cardType"
                  showSearch
                  placeholder={messages('common.please.select')}
                  onChange={this.handleCardTypeChange}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {
                    this.renderCardTypeOption(this.state.cardTypeList)
                  }
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout}
                      label={messages("pdc.id.card.card.number")}//证件号
            >
              {getFieldDecorator('cardNo', {
                initialValue: card.originalCardNo,
                rules: [
                  {
                    max: 30,
                    message: messages("pdc.id.card.nomore.30")//"不能超过30个字符"
                  },
                ],
              })(
                //input加一层div，就不会initialValue干扰了，每次都会重新根据card设定值进行渲染了；
                //这种情况，除了input,需要在onChange的回调里面设置变化的值,不然再最后的value获取不到
                <div>
                  <Input
                    defaultValue={card.originalCardNo}
                    placeholder={messages('common.please.enter')}/>
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout}
                      label={messages("pdc.id.card.card.expire")}//证件到期时间
            >
              {getFieldDecorator('cardExpiredTime', {
                initialValue: card.cardExpiredTime ? moment(card.cardExpiredTime) : "",
                rules: [],
              })(
                <div>
                  <DatePicker
                    defaultValue={card.cardExpiredTime ? moment(card.cardExpiredTime) : ""}
                    format={'YYYY-MM-DD'}
                    onChange={this.handleCardTimeChange}/>
                </div>
              )}
            </FormItem>


            {/*状态*/}
            <FormItem {...formItemLayout}
                      label={messages('common.column.status')}
                      colon={true}>
              {getFieldDecorator('enable', {
                initialValue: card.enable
              })(
                <div>
                  <Switch
                    defaultChecked={card.enable}
                    checked={card.enable}
                    checkedChildren={<Icon type="check"/>}
                    unCheckedChildren={<Icon type="cross"/>}
                    onChange={this.switchCardStatusChange}/>
                  <span className="enabled-type" style={{
                    marginLeft: 20,
                    width: 100
                  }}>
                    {card.enable ? messages('common.status.enable') : messages('common.disabled')}
                    </span>
                </div>
              )}
            </FormItem>

            {/*是否默认*/}
            <FormItem {...formItemLayout}
                      label={messages("pdc.id.card.is.set.default.title")}//设为默认
            >
              {getFieldDecorator('isDefault', {
                initialValue: card.isDefault
              })(
                <div>
                  <Checkbox
                    defaultChecked={card.isDefault}
                    checked={card.isDefault}
                    onChange={this.handleCardDefaultChange}
                  >
                    {/*是（只能有一个默认）*/}
                    {messages("pdc.id.card.is.set.default")}
                  </Checkbox>
                </div>
              )}
            </FormItem>

            <div className="role-list-from-footer">
              <Button onClick={this.cancelCard}>
                {messages('common.cancel')}
              </Button>
              &nbsp;&nbsp;&nbsp;
              <Button type="primary"
                      htmlType="submit"
                      loading={loading}>
                {messages('common.save')}
              </Button>
            </div>
          </Form>

        </Modal>
      </div>
    )
  }
}

PersonSomeIdCard.propTypes = {
  createCardOver: React.PropTypes.func,//创建银行卡后
  cardInfo: React.PropTypes.object,//证件对象
  isEmpty: React.PropTypes.bool,// 是否是空的
  disabled: React.PropTypes.bool,// 是否是启用的
  isShowEditBtn: React.PropTypes.bool,// 是否显示编辑按钮
};
PersonSomeIdCard.defaultProps = {
  isShowEditBtn: true
};
const WrappedPersonSomeIdCard = Form.create()(PersonSomeIdCard);
export default WrappedPersonSomeIdCard;
