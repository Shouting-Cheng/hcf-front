import React from 'react';

import { Form, Switch } from 'antd';
import Chooser from 'widget/chooser';
import { connect } from 'dva';
import NewVenMaster from 'containers/request/new-request/new-ven-master';
import PropTypes from 'prop-types';

import customField from 'share/customField';

import 'styles/components/template/combination-custom-form/combination-custom-form.scss';

const FormItem = Form.Item;

class IsVenMaster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    this.setState(
      {
        value: this.props.value,
        enabled: this.props.value.enabled,
        callBackSubmit: this.props.value.callBackSubmit,
        formValidStatus: this.props.value.callBackSubmit,
        fieldContent: JSON.parse(this.props.value.fieldContent),
      },
      () => {}
    );
  }

  componentWillReceiveProps(nextProps) {
    let { callBackSubmit } = this.state;
    if (
      nextProps.value.callBackSubmit != this.props.value.callBackSubmit ||
      nextProps.value.callBackSubmit != callBackSubmit
    ) {
      callBackSubmit = nextProps.value.callBackSubmit;
      this.setState({ callBackSubmit });
      this.formValidate(nextProps, nextProps.value.callBackSubmit);
    }
  }

  formValidate = (nextProps, callBackSubmit) => {
    let value = this.state.value;
    if (value) {
      this.props.form.validateFieldsAndScroll(err => {
        if (!err) {
          nextProps.value.isPassValid = true;
          value.isPassValid = true;
          this.onChange(this.state.value);
        } else {
          nextProps.value.isPassValid = false;
          value.isPassValid = false;
          this.onChange(this.state.value);
        }
      });
    }
  };

  handleChange = enabled => {
    let value = this.state.value;
    value.enabled = enabled;
    this.setState({ enabled, value }, () => {
      this.onChange(this.state.value);
    });
  };
  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };
  handleContentChange = (content, record) => {
    let { value, fieldContent, enabled } = this.state;
    let id;
    if (enabled) {
      id = 'venMaster';
    } else {
      id = 'contact_bank_account';
    }
    fieldContent.map(item => {
      if (item.messageKey === id) {
        item.value = content;
      }
      if (item.messageKey === 'contact_bank_account') {
        if (record) {
          item.showValue = `{"bankAccountNo":"${record.bankAccountNo}","branchName":"${
            record.branchName
          }","bankCode":"${record.bankCode}","bankAccountName":"${record.bankAccountName}"}`;
        }
      }
    });
    value.fieldContent = JSON.stringify(fieldContent);
    this.setState({ fieldContent, value }, () => {
      this.onChange(this.state.value);
    });
  };
  dealMessageFieldContent = (messageKey, fieldContent = this.state.fieldContent) => {
    let fieldContentTmp = {};
    if (fieldContent && fieldContent.length > 0) {
      fieldContent.map(item => {
        if (item.messageKey === messageKey) {
          fieldContentTmp = item;
        }
      });
    }
    return fieldContentTmp;
  };

  render() {
    const { enabled, fieldContent } = this.state;
    const { getFieldDecorator } = this.props.form;
    return fieldContent ? (
      <div className="is-ven-master">
        <Switch checked={enabled} onChange={this.handleChange} />
        {enabled ? (
          <FormItem
            label={this.dealMessageFieldContent('venMaster').fieldName}
            key={this.dealMessageFieldContent('venMaster').messageKey}
          >
            {getFieldDecorator(this.dealMessageFieldContent('venMaster').sequence, {
              rules: [
                {
                  required: this.dealMessageFieldContent('venMaster').required,
                  message: this.$t('common.can.not.be.empty', {
                    name: this.dealMessageFieldContent('venMaster').fieldName,
                  }),
                },
              ],
              initialValue: this.dealMessageFieldContent('venMaster').value,
            })(<NewVenMaster onChange={this.handleContentChange} />)}
          </FormItem>
        ) : (
          <FormItem
            label={this.dealMessageFieldContent('contact_bank_account').fieldName}
            key={this.dealMessageFieldContent('contact_bank_account').messageKey}
          >
            {getFieldDecorator(this.dealMessageFieldContent('contact_bank_account').sequence, {
              rules: [
                {
                  required: this.dealMessageFieldContent('contact_bank_account').required,
                  message: this.$t('common.can.not.be.empty', {
                    name: this.dealMessageFieldContent('contact_bank_account').fieldName,
                  }),
                },
              ],
              initialValue: this.dealMessageFieldContent('contact_bank_account').value
                ? [
                    {
                      bankAccountNo:
                        this.dealMessageFieldContent('contact_bank_account').showValue &&
                        customField.isJson(
                          this.dealMessageFieldContent('contact_bank_account').showValue
                        )
                          ? JSON.parse(
                              this.dealMessageFieldContent('contact_bank_account').showValue
                            ).bankAccountNo
                          : this.dealMessageFieldContent('contact_bank_account').showValue,
                      contactBankAccountOid: this.dealMessageFieldContent('contact_bank_account')
                        .value,
                    },
                  ]
                : undefined,
            })(
              <Chooser
                type="bank_card"
                valueKey="contactBankAccountOid"
                labelKey="bankAccountNo"
                onlyNeed="contactBankAccountOid"
                onChange={this.handleContentChange}
                listExtraParams={{ userOid: this.props.user.userOid }}
                single
              />
            )}
          </FormItem>
        )}
      </div>
    ) : (
      <div />
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.login.user,
  };
}

IsVenMaster.propTypes = {
  value: PropTypes.object,
};

IsVenMaster.defaultProps = {
  value: {},
};

const wrappedNewVenMaster = Form.create()(IsVenMaster);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewVenMaster);
