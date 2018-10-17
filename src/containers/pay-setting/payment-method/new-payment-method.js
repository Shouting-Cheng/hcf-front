/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react';
import { connect } from 'dva';

import { Button, Form, Switch, Input, message, Icon, Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import paymentMethodService from './payment-method.service';

class NewPaymentMethod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      enabled: true,
      isPut: false,
      loading: false,
      paymentMethodCategoryOptions: [],
      searchFrom: [
        { id: 'enabled' },
        { id: 'paymentMethodCategory' },
        { id: 'paymentMethodCode' },
        { id: 'description' },
      ],
    };
  }

  componentWillMount() {
    this.getPaymentMethodCategory();
  }

  getPaymentMethodCategory() {
    let paymentMethodCategoryOptions = [];
    this.getSystemValueList(2105).then(res => {
      res.data.values.map(data => {
        paymentMethodCategoryOptions.push({
          label: data.messageKey,
          value: data.code,
          key: data.code,
        });
      });
      this.setState({
        paymentMethodCategoryOptions,
      });
    });
  }

  //新建或者修改
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if (JSON.stringify(this.props.params.updateParams) === '{}') {
          let toValue = {
            id: '',
            versionNumber: 1,
            ...this.props.params.updateParams,
            ...values,
          };
          paymentMethodService
            .addOrUpDataPaymentType(toValue)
            .then(res => {
              this.setState({ loading: false });
              this.props.form.resetFields();
              this.props.onClose(true);
              message.success(this.$t('common.operate.success'));
            })
            .catch(e => {
              this.setState({ loading: false });

              message.error(this.$t('common.save.filed') + `${e.response.data.message}`);
            });
        } else {
          let toValue = {
            ...this.props.params.updateParams,
            ...values,
          };
          paymentMethodService
            .addOrUpDataPaymentType(toValue)
            .then(res => {
              this.setState({ loading: false });
              this.props.form.resetFields();
              this.props.onClose(true);
              message.success(this.$t('common.operate.success'));
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(this.$t('common.save.filed') + `${e.response.data.message}`);
            });
        }
      }
    });
  };

  onCancel = () => {
    this.props.onClose(false);
  };

  switchChange = value => {
    this.setState({ enabled: value });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { params, enabled, isPut } = this.state;
    const formItemLayout = {
      labelCol: { span: 6, offset: 1 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-payment-method">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t('paymentMethod.isEnabled')}>
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue:
                JSON.stringify(this.props.params.updateParams) === '{}'
                  ? true
                  : this.props.params.updateParams.enabled,
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
                onChange={this.switchChange}
                disabled={
                  this.props.params.updateParams.createType === 'USER' ||
                  JSON.stringify(this.props.params.updateParams) === '{}'
                    ? false
                    : true
                }
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('paymentMethod.paymentMethodCategory')}>
            {getFieldDecorator('paymentMethodCategory', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
              initialValue: this.props.params.updateParams.paymentMethodCategory || '',
            })(
              <Select
                disabled={JSON.stringify(this.props.params.updateParams) === '{}' ? false : true}
                placeholder={this.$t('common.please.select')}
              >
                {this.state.paymentMethodCategoryOptions.map(option => {
                  return (
                    <Option value={option.value} key={option.label}>
                      {option.label}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('paymentMethod.paymentMethodCode')}>
            {getFieldDecorator('paymentMethodCode', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
              initialValue: this.props.params.updateParams.paymentMethodCode || '',
            })(
              <Input
                placeholder={this.$t('common.please.enter')}
                disabled={JSON.stringify(this.props.params.updateParams) === '{}' ? false : true}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('paymentMethod.description')}>
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
              initialValue: this.props.params.updateParams.description || '',
            })(
              <Input
                placeholder={this.$t({ id: 'common.please.enter' })}
                disabled={
                  this.props.params.updateParams.createType === 'USER' ||
                  JSON.stringify(this.props.params.updateParams) === '{}'
                    ? false
                    : true
                }
              />
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>
              {this.$t('common.save')}
            </Button>
            <Button onClick={this.onCancel}>{this.$t('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

const WrappedPaymentMethod = Form.create()(NewPaymentMethod);
function mapStateToProps() {
  return {};
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedPaymentMethod);
