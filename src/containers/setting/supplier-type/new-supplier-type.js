/**
 * Created by fudebao on 2017/12/05.
 */
import React from 'react';
import { connect } from 'react-redux';

import { Button, Form, Switch, Input, message, Icon, Select, Radio } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import config from 'config';
import httpFetch from 'share/httpFetch';
import SupplierTypeService from 'containers/setting/supplier-type/supplier-type.service';

class NewSupplierType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      loading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.params.visible && this.props.params.visible) {
      this.props.form.resetFields();
    }
  }

  //新建或编辑
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if (!this.props.params.id) {
          let toValue = {
            ...this.props.params,
            ...values,
          };
          SupplierTypeService.addSupplierType(toValue)
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
            ...this.props.params,
            ...values,
          };
          SupplierTypeService.updateSupplierType(toValue)
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
    this.props.form.resetFields();
    this.props.onClose();
  };
  //监听表单值
  handleFormChange = e => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { params } = this.state;
    const formItemLayout = {
      labelCol: { span: 6, offset: 1 },
      wrapperCol: { span: 14, offset: 1 },
    };

    return (
      <div className="new-payment-method">
        <Form onSubmit={this.handleSave} onChange={this.handleFormChange}>
          <FormItem {...formItemLayout} label={this.$t('supplier.type.code1')}>
            {getFieldDecorator('vendorTypeCode', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
              initialValue: this.props.params.vendorTypeCode || '',
            })(
              <Input
                disabled={typeof this.props.params.id !== 'undefined' ? true : false}
                placeholder={this.$t('common.please.enter')}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('supplier.type.name1')}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
              initialValue: this.props.params.name || '',
            })(<Input placeholder={this.$t('common.please.enter')} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('common.column.status')}>
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: this.props.params.id ? this.props.params.enabled : true,
            })(
              <Switch
                checked={this.props.params.id ? this.props.form.getFieldValue('enabled') : true}
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
              />
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled')
              ? this.$t('common.status.enable')
              : this.$t('common.status.disable')}
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

const WrappedNewSupplierType = Form.create()(NewSupplierType);
function mapStateToProps(state) {
  return {};
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewSupplierType);
