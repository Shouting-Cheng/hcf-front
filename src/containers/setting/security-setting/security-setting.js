import { messages } from "utils/utils";
/**
 * created by jsq on 2017/10/16
 */
//0416上线前重构
import React from 'react';
import { connect } from 'dva';

import { Button, Form, InputNumber, Checkbox, Radio, Row, Col, message } from 'antd';
import debounce from 'lodash.debounce';
import 'styles/setting/security-setting/security-setting.scss';
import SSService from 'containers/setting/security-setting/security-setting.service';
import BaseService from 'share/base.service';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;


class SecuritySetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      flag: true,
      enterpriseKey: false,
      selectedNoticeType: 0,
      createDataType: 1,
      securitySetting: {},
      ClientInfo: {
        clientId: "",
        clientSecret: ""
      },
      //passwordRule里面的元素顺序不能变
      passwordRule: [
        //小写字母
        { label: messages("security.lowerCase"), value: 'lowercase' },
        //大写字母
        { label: messages('security.upperCase'), value: 'uppercase' },
        //数字
        { label: messages('security.digital'), value: 'digital', disabled: true },
        //特殊字符
        { label: messages('security.specialCharacters'), value: 'specialCharacters' },
      ],
      noticeType: [
        //邮箱（邮箱将用于含附件消息如报销单电子件的推送）
        {
          label: messages("security.mail.tips"),
          value: '1001',
          disabled: true
        },
        //手机（海外手机不支持短消息推送）
        {
          label: messages("security.phone.tips"),
          value: '1002'
        },
      ],
      modifyPasswordByApi: [
        {
          label: messages("security.password.tips1"),//"允许员工通过接口修改密码"
          value: true,
        },
      ],
      modifyMoblieEmail: [
        //勾选后员工可以在App上修改邮箱
        {
          label: messages("security.email.modify"),
          value: "email",
        },
        //勾选后员工可以在App上修改/删除手机号
        {
          label: messages("security.phone.modify"),
          value: "mobile"
        },
      ]
    };
    this.handlePasswordRule = debounce(this.handlePasswordRule, 1000)
  }

  componentDidMount() {
    this.getCompanySecuritySetting();
    this.getClientInfo();
  }

  //获取安全设置数据
  getCompanySecuritySetting() {
    SSService.getCompanySecuritySetting(this.props.company.companyOid)
      .then((response) => {
        let selectedPasswordRule = [];
        let array = response.data.passwordRule.split("");
        for (let i = 0; i < array.length; i++) {
          if (array[i] === "1") {
            selectedPasswordRule.push(this.state.passwordRule[i].value)
          }
        }
        let noticeType = ["1001"];
        if (response.data.noticeType === 1003) {
          noticeType.push("1002");
        }
        let modifyMoblieEmail = [];
        if (response.data.enableMobileModify) {
          modifyMoblieEmail.push("mobile");
        }
        if (response.data.enableEmailModify) {
          modifyMoblieEmail.push("email");
        }

        let securitySetting = {
          passwordLengthMin: response.data.passwordLengthMin,
          passwordLengthMax: response.data.passwordLengthMax,
          passwordRule: response.data.passwordRule,
          selectedPasswordRule: selectedPasswordRule,
          passwordExpireDays: response.data.passwordExpireDays,
          passwordRepeatTimes: response.data.passwordRepeatTimes,
          passwordAttemptTimes: response.data.passwordAttemptTimes,
          autoUnlockDuration: response.data.autoUnlockDuration,
          dimissionDelayDays: response.data.dimissionDelayDays,
          noticeType: noticeType,
          defaultNoticeType: response.data.noticeType,

          defaultEnableMobileModify: response.data.enableMobileModify,
          defaultEnableEmailModify: response.data.enableEmailModify,
          modifyMoblieEmail: modifyMoblieEmail,

          createDataType: response.data.createDataType,
          companyOid: response.data.companyOid,
          name: response.data.name,
          taxId: response.data.taxId,
        };
        this.setState({
          flag: false,
          securitySetting
        })
      })
  }

  getClientInfo() {
    SSService.getClientInfo()
      .then((res) => {
        this.setState({
          ClientInfo: res.data
        })
      })
  }

  //处理选择密码规则
  handlePasswordRule = (checkedValue) => {
    let passwordRule = "";
    this.state.passwordRule.map((item) => {
      if (this.isInArray(checkedValue, item.value) || item.value === 'digital') {
        passwordRule += "1"
      } else {
        passwordRule += "0"
      }
    });
    let securitySetting = this.state.securitySetting;
    securitySetting.passwordRule = passwordRule;
    this.setState({
      securitySetting
    })
  };

  //处理选择通知类型
  handleNoticeType = (checkedValue) => {
    let flag = this.isInArray(checkedValue, 1002);
    let securitySetting = this.state.securitySetting;

    securitySetting.defaultNoticeType = flag ? 1003 : 1001;
    securitySetting.noticeType = checkedValue;
    this.setState({
      securitySetting
    })
  };
  //处理是否支持修改手机与邮箱
  handleModifyMoblieEmail = (checkedValue) => {
    let securitySetting = this.state.securitySetting;


    let mobile = this.isInArray(checkedValue, "mobile");
    let email = this.isInArray(checkedValue, "email");

    securitySetting.defaultEnableMobileModify = mobile;
    securitySetting.defaultEnableEmailModify = email;
    this.setState({
      securitySetting
    })
  };

  //处理创建类型
  handleDataType = (e) => {
    let securitySetting = this.state.securitySetting;
    securitySetting.createDataType = e.target.value;
    this.setState({
      securitySetting
    })
  };

  //判断某个元素是否在数组中
  isInArray(arr, val) {
    let testStr = ',' + arr.join(",") + ",";
    return testStr.indexOf("," + val + ",") != -1;
  }

  handleEnterpriseKey = (flag) => {
    this.setState({
      enterpriseKey: flag,
    })
  };

  handleInteger = (e, key) => {
    let value = {};
    value[key] = e.target.value === '' ? this.state.securitySetting[key] : parseInt(e.target.value.toString().split(".")[0]);
    this.props.form.setFieldsValue(value);
  };

  renderEnterpriseKey() {
    return (
      this.state.enterpriseKey ?
        <span className="security-setting-display">
          {this.state.ClientInfo.clientSecret}
          <Button style={{ marginLeft: 10 }}
            onClick={() => this.handleEnterpriseKey(false)}>
            {messages("security.hides")}
          </Button>
        </span>
        :
        <span className="security-setting-hide">
          <Button onClick={() => this.handleEnterpriseKey(true)}>
            {messages("security.view")}
          </Button>
        </span>
    )
  }

  handleSubmit = (e) => {
    const { securitySetting } = this.state;
    e.preventDefault();
    this.setState({
      loading: true
    });
    let value = {
      passwordLengthMin: typeof this.props.form.getFieldValue("passwordLengthMin") === "undefined" ? securitySetting.passwordLengthMin : parseInt(this.props.form.getFieldValue("passwordLengthMin")),
      passwordLengthMax: typeof this.props.form.getFieldValue("passwordLengthMax") === "undefined" ? securitySetting.passwordLengthMax : parseInt(this.props.form.getFieldValue("passwordLengthMax")),
      passwordRule: this.state.securitySetting.passwordRule,
      passwordExpireDays: typeof this.props.form.getFieldValue("passwordExpireDays") === "undefined" ? this.state.securitySetting.passwordExpireDays : this.props.form.getFieldValue("passwordExpireDays"),
      passwordAttemptTimes: typeof this.props.form.getFieldValue("passwordAttemptTimes") === "undefined" ? this.state.securitySetting.passwordAttemptTimes : this.props.form.getFieldValue("passwordAttemptTimes"),
      autoUnlockDuration: typeof this.props.form.getFieldValue("autoUnlockDuration") === "undefined" ? this.state.securitySetting.autoUnlockDuration : this.props.form.getFieldValue("autoUnlockDuration"),
      passwordRepeatTimes: typeof this.props.form.getFieldValue("passwordRepeatTimes") === "undefined" ? this.state.securitySetting.passwordRepeatTimes : this.props.form.getFieldValue("passwordRepeatTimes"),
      dimissionDelayDays: typeof this.props.form.getFieldValue("dimissionDelayDays") === "undefined" ? this.state.securitySetting.dimissionDelayDays : this.props.form.getFieldValue("dimissionDelayDays"),
      noticeType: this.state.securitySetting.defaultNoticeType,
      enableMobileModify: this.state.securitySetting.defaultEnableMobileModify,
      enableEmailModify: this.state.securitySetting.defaultEnableEmailModify,
      createDataType: this.state.securitySetting.createDataType,
      companyOid: this.state.securitySetting.companyOid,
      name: this.state.securitySetting.name,
      taxId: this.state.securitySetting.taxId
    };

    SSService.updateCompanySecuritySetting(value)
      .then((response) => {
        message.success(messages("common.operate.success"));
        //重置redux
        BaseService.getCompany();
        this.getCompanySecuritySetting()
        this.setState({
          loading: false
        })
      })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, flag, passwordRule, noticeType, securitySetting,
      modifyMoblieEmail } = this.state;
    const formItemLayout = {
      labelCol: { span: 3, offset: 1 },
      wrapperCol: { span: 24, offset: 2 },
    };
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div>
        {flag ? null :
          <div className="security-setting">
            <div id="3" className="security-setting-company">
              {/*企业id*/}
              {messages("security.enterprise.id")}： {this.state.ClientInfo.clientId}
            </div>
            <div className="security-setting-company">
              {/*企业密钥*/}
              {messages("security.enterprise.key")}：{this.renderEnterpriseKey()}
            </div>
            <hr className="security-setting-slid" />

            <Form onSubmit={this.handleSubmit}>
              {/*基础规则*/}
              <div className="security-setting-Rule">{messages("security.basic.rule")}</div>

              <FormItem  {...formItemLayout} className="security-setting-formItem">
                {/*密码长度*/}
                <span className="item-3">{messages("security.password.length")}</span>
                {getFieldDecorator('passwordLengthMin', {
                  initialValue: securitySetting.passwordLengthMin
                }
                )(
                  <InputNumber onBlur={(value) => this.handleInteger(value, 'passwordLengthMin')}
                    min={6}
                    max={securitySetting.passwordLengthMax}
                    disabled={!this.props.tenantMode}
                    placeholder={messages("common.please.enter")} />
                  )}
                <span>{messages("security.password.to")}</span>
                {getFieldDecorator('passwordLengthMax', {
                  initialValue: securitySetting.passwordLengthMax,
                })(
                  <InputNumber onBlur={(value) => this.handleInteger(value, 'passwordLengthMax')}
                    style={{ marginLeft: 5 }}
                    className="formItem-value"
                    disabled={!this.props.tenantMode}
                    min={securitySetting.passwordLengthMin}
                    max={32}
                    placeholder={messages("common.please.enter")} />
                  )}
                <span>{messages("security.password.tips")}</span>
              </FormItem>

              <FormItem {...formItemLayout}>
                {getFieldDecorator('passwordRule')(
                  <div className="security-setting-formItem">
                    {/*密码中必须包含*/}
                    <span className="item-2">{messages("security.password.rule")}</span>
                    <CheckboxGroup className="formItem-value-2"
                      onChange={this.handlePasswordRule}
                      disabled={!this.props.tenantMode}
                      defaultValue={securitySetting.selectedPasswordRule}
                      options={passwordRule} />
                  </div>
                )}
              </FormItem>

              <FormItem {...formItemLayout} className="security-setting-formItem">
                {/*密码有效期*/}
                <span className="item-3">{messages("security.password.time")}</span>
                {getFieldDecorator('passwordExpireDays', {
                  initialValue: securitySetting.passwordExpireDays,
                })(
                  <InputNumber onBlur={(value) => this.handleInteger(value, 'passwordExpireDays')}
                    className="formItem-value-passwordExpireDays"
                    min={0}
                    max={1095}
                    disabled={!this.props.tenantMode}
                    placeholder={messages("common.please.enter")} />
                  )}
                <span> {messages('security.day')}&nbsp;&nbsp;
                  <span className="inner-tips">{messages('security.day.tips')}</span>
                </span>
              </FormItem>

              <FormItem {...formItemLayout} className="security-setting-formItem">
                {/*历史密码检查*/}
                <span className="item-3">{messages("security.history.password")}</span>
                <span className="formItem-value-history">{messages("security.forbidden")}&nbsp;&nbsp;</span>
                {getFieldDecorator('passwordRepeatTimes', {
                  initialValue: securitySetting.passwordRepeatTimes,
                })(
                  <InputNumber onBlur={(value) => this.handleInteger(value, 'passwordRepeatTimes')}
                    min={0}
                    max={24}
                    disabled={!this.props.tenantMode}
                    placeholder={messages("common.please.enter")} />
                  )}
                <span>{messages("security.forbidden.tips")}</span>&nbsp;&nbsp;
                <span>
                  {<span className="inner-tips">{messages("security.forbidden.tips.inner")}</span>}
                </span>
              </FormItem>


              {/*密码重试次数*/}
              <FormItem {...formItemLayout} className="security-setting-formItem">
                <span className="item-3">{messages("security.passwordAttemptTimes")}</span>
                {getFieldDecorator('passwordAttemptTimes', {
                  initialValue: securitySetting.passwordAttemptTimes,
                })(
                  <InputNumber onBlur={(value) => this.handleInteger(value, 'passwordAttemptTimes')}
                    className="formItem-value-passwordExpireDays"
                    min={0}
                    max={10}
                    disabled={!this.props.tenantMode}
                    placeholder={messages("common.please.enter")} />
                  )}
                <span>
                  {messages("security.times")}
                  {/*次*/}
                </span>
              </FormItem>

              {/*自动解锁时间*/}
              <FormItem {...formItemLayout} className="security-setting-formItem">
                <span className="item-3"> {messages("security.autoUnlockDuration")}</span>
                {getFieldDecorator('autoUnlockDuration', {
                  initialValue: securitySetting.autoUnlockDuration,
                })(
                  <InputNumber onBlur={(value) => this.handleInteger(value, 'autoUnlockDuration')}
                    className="formItem-value-passwordExpireDays"
                    min={0}
                    max={10080}
                    disabled={!this.props.tenantMode}
                    placeholder={messages("common.please.enter")} />
                  )}
                <span>
                  {messages("security.Minutes")}
                  {/*分钟*/}
                </span>
              </FormItem>


              <hr className="security-setting-slid" />
              {/*其它规则*/}
              <div className="security-setting-Rule">
                {messages("security.other.rule")}
              </div>

              <FormItem {...formItemLayout}
                className="security-setting-formItem">
                {/*账号失效时间*/}
                <span className="item-5">{messages("security.account.time")}</span>
                <span className="formItem-value-max">{messages("security.departing.employees")}&nbsp;</span>
                {getFieldDecorator('dimissionDelayDays', {
                  initialValue: securitySetting.dimissionDelayDays
                })(
                  // <span className="formItem-label"></span>
                  <InputNumber onBlur={(value) => this.handleInteger(value, 'dimissionDelayDays')}
                    min={0}
                    max={180}
                    disabled={!this.props.tenantMode}
                    placeholder={messages("common.please.enter")} />
                  )}
                <span> {messages("security.departing.tips")}&nbsp;&nbsp;
                  <span>
                    <span className="inner-tips">
                      {messages("security.departing.tips.inner")}
                    </span>
                  </span>
                </span>
              </FormItem>

              {/*信息通知渠道*/}
              <FormItem {...formItemLayout}>
                {getFieldDecorator('noticeType')(
                  <div className="security-setting-formItem">
                    <span className="item-6">{messages("security.information.info")}</span>
                    <span className="formItem-value-info">
                      <CheckboxGroup options={noticeType}
                        disabled={!this.props.tenantMode}
                        onChange={this.handleNoticeType}
                        defaultValue={securitySetting.noticeType} />
                    </span>
                  </div>
                )}
              </FormItem>


              {/*员工是否可以修改*/}
              <FormItem {...formItemLayout}>
                {getFieldDecorator('modifyMoblieEmail')(
                  <div className="security-setting-formItem">
                    <span className="item-6">{messages("security.email.phone")}</span>
                    <span className="formItem-value-info">
                      <CheckboxGroup options={modifyMoblieEmail}
                        disabled={!this.props.tenantMode}
                        onChange={this.handleModifyMoblieEmail}
                        defaultValue={securitySetting.modifyMoblieEmail} />
                    </span>
                  </div>
                )}
              </FormItem>

              <FormItem {...formItemLayout}>
                {getFieldDecorator('createDataType')(
                  <div className="security-setting-formItem">
                    {/*员工和组织架构信息创建*/}
                    <span className="item-7">{messages("security.create.info")}</span>
                    <RadioGroup onChange={this.handleDataType}
                      defaultValue={securitySetting.createDataType}
                      className="formItem-value-group">
                      <Radio style={radioStyle}
                        disabled={!this.props.tenantMode}
                        value={1001}>
                        {messages("security.create.manually")}
                        <span className="inner-tips-manually">{messages("security.create.manually.inner")}</span>
                      </Radio>
                      <Radio style={radioStyle}
                        disabled={!this.props.tenantMode}
                        value={1002}>
                        {messages("security.interface")}
                      </Radio>
                      <span className="create-data-type"
                        style={{ marginLeft: this.props.language.local === 'zh_cn' ? 0 : 86 }}>

                      </span>
                    </RadioGroup>
                    <div className="formItem-value-group-tips">{messages("security.info.type")}</div>
                    <br />
                  </div>
                )
                }
              </FormItem>


              <FormItem wrapperCol={{ offset: 4 }}>
                <Row gutter={1}>
                  <Col span={3}><
                    Button type="primary"
                    size='large'
                    htmlType="submit"
                    disabled={!this.props.tenantMode}
                    loading={loading}>
                    {/*保存*/}
                    {messages('common.save')}
                  </Button>
                  </Col>
                </Row>
              </FormItem>

            </Form>

          </div>
        }
      </div>
    )
  }
}

/*
 * noticeType：绑定类型:1001-邮箱,1002-手机,1003-手机+邮箱(目前暂时没有1002,因为邮箱是必选)
 dimissionDelayDays：延迟离职天数
 passwordExpireDays：密码有效期
 passwordRule：密码规则:小写字母，大写字母，数字，特殊字符，包含为1，不包含为0
 passwordLengthMin：密码最小长度
 passwordLengthMax：密码最大长度
 passwordRepeatTimes：禁止使用前几次密码
 createDataType：1001 手工创建和excle导入 1002 接口导入
 * */


function mapStateToProps(state) {
  return {
    language: state.languages.languages,
    tenantMode: true,
    company: state.user.company
  }
}

const WrappedSecuritySetting = Form.create()(SecuritySetting);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedSecuritySetting);
