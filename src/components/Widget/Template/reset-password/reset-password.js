/**
 * Created by zhouli on 18/6/20
 * Email li.zhou@huilianyi.com
 */

import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Modal, Button, Form, Icon, Input, Checkbox } from 'antd';

import ResetPasswordService from 'components/Template/reset-password/reset-password.service';
import PasswordRule from 'components/Template/reset-password/password-rule';
import 'styles/components/template/reset-password/reset-password.scss';
const FormItem = Form.Item;
//默认的密码规则
const DefaultRule = {
  isNeedLowercase: true,
  isNeedNumber: true,
  isNeedSpecialChar: false,
  isNeedUppercase: false,
  maxLength: 32,
  minLength: 6,
};

class ResetPasswordModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      confirmDirty: false,
      rule: DefaultRule,
    };
  }

  componentWillMount() { }

  componentDidMount() {
    let mobile_or_email = this.props.user.email || this.props.user.mobile;
    ResetPasswordService.getPasswordRule(mobile_or_email)
      .then(res => {
        this.setState({
          rule: res.data,
        });
      })
      .catch(err => { });
    //必须是resetPassword为ture且isAccountLogin是用账号登陆的
    if (this.props.user.resetPassword && sessionStorage.getItem('isAccountLogin')) {
      this.setState({
        visible: true,
      });
    }
  }

  //点击弹窗关闭按钮
  handleCancel = () => {
    this.setState({
      visible: false,
    });
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (ResetPasswordService.regPasswordByRule(values.newPassword, this.state.rule)) {
          let params = {
            newPassword: values.newPassword,
          };
          ResetPasswordService.resetPassword(params)
            .then(res => {
              this.setState({
                visible: false,
              });
              if (this.props.onConfirm) {
                this.props.onConfirm();
              }
            })
            .catch(err => {
              console.log(err);
            });
        }
      }
    });
  };
  //
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newPassword')) {
      // 两次密码不一致
      callback(this.$t('reset-password.password.not.equal'));
    } else {
      callback();
    }
  };
  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirmNewPassword'], { force: true });
    }
    callback();
  };
  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({
      confirmDirty: this.state.confirmDirty || !!value,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="reset-password-wrap">
        <div className="reset-password-modal-wrap" />
        <Modal
          width={450}
          closable={false}
          maskClosable={false}
          keyboard={false}
          getContainer={() => {
            return document.getElementsByClassName('reset-password-modal-wrap')[0];
          }}
          className="reset-password-modal-wrap-modal"
          title={this.$t('reset-password.reset.password')} //重置密码
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <div className="reset-password">
            <div className="condition-rule-icon-tips">
              <Icon type="info-circle" style={{ color: '#1890ff' }} />
              <span className="tips-text">
                {/*为了您的账户安全，首次登录时请重新设置登录密码*/}
                {this.$t('reset-password.new.passwordtip1')}
              </span>
            </div>

            <PasswordRule rule={this.state.rule} />

            <Form onSubmit={this.handleSubmit}>
              <FormItem
                label={this.$t('reset-password.new.password')} //新密码
              >
                {getFieldDecorator('newPassword', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('reset-password.new.passwordtip'), //'请输入新密码',
                    },
                    {
                      validator: this.validateToNextPassword,
                    },
                  ],
                })(<Input type="password" />)}
              </FormItem>
              <FormItem
                label={this.$t('reset-password.confirm.password')} //确认新密码
              >
                {getFieldDecorator('confirmNewPassword', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('reset-password.confirm.passwordtips'), //'请确认新密码',
                    },
                    {
                      validator: this.compareToFirstPassword,
                    },
                  ],
                })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
              </FormItem>

              <FormItem>
                {/*<Button onClick={this.handleCancel}>*/}
                {/*/!*取消*!/*/}
                {/*{this.$t("common.cancel")}*/}
                {/*</Button>*/}
                {/*&nbsp; &nbsp; &nbsp;*/}
                <Button type="primary" htmlType="submit">
                  {/*确定*/}
                  {this.$t('common.ok')}
                </Button>
              </FormItem>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}

ResetPasswordModal.propTypes = {
  onConfirm: PropTypes.func, // 点击确认之后的回调：返回结果
  onCancel: PropTypes.func, //点击取消的时候
};

ResetPasswordModal.defaultProps = {};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: state.main.tenantMode,
    company: state.login.company,
  };
}

const WrappedResetPasswordModal = Form.create()(ResetPasswordModal);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedResetPasswordModal);
