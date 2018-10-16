import React from 'react';
import { Form, Button, Input, Select, Radio, message, InputNumber } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
import jobService from './job.service';
import { connect } from 'dva';

class JobActuatorDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryFlag: true,
      record: {},
      loading: false,
      selectValue: 0,
    };
  }

  componentDidMount() {
    const record = this.props.params.record;
    this.setState({
      record: record,
      queryFlag: false,
      selectValue: record.addressType,
    });
    let values = this.props.form.getFieldsValue();
    for (let name in values) {
      let result = {};
      result[name] = record[name];
      this.props.form.setFieldsValue(result);
    }
  }

  onChange = e => {
    this.setState({
      selectValue: e.target.value,
    });
    if (e.target.value === 0) {
      let result = {};
      result['addressList'] = this.state.record.addressList;
      this.props.form.setFieldsValue(result);
    }
  };
  // 取消
  onCancel = () => {
    this.props.onClose && this.props.onClose();
  };
  // 保存
  handleSave = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if (!this.state.record.id) {
          let param = { ...values };
          jobService
            .saveActuator(param)
            .then(res => {
              if (res.data.code === 200) {
                this.props.onClose(true);
                message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
                this.setState({ loading: false });
              } else {
                this.setState({ loading: false });
                message.error(
                  this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + res.data.msg
                );
              }
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(
                this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + e.response.data.message
              );
            });
        } else {
          let param = { ...values, id: this.state.record.id };
          jobService
            .updateActuator(param)
            .then(res => {
              if (res.data.code === 200) {
                this.props.onClose(true);
                message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
                this.setState({ loading: false });
              } else {
                this.setState({ loading: false });
                message.error(
                  this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + res.data.msg
                );
              }
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(
                this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + e.response.data.message
              );
            });
        }
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { record, loading, selectValue } = this.state;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 13, offset: 1 },
    };
    return (
      <div className="new-payment-requisition-line">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.appName' } /*代码*/)}>
            {getFieldDecorator('appName', {
              rules: [
                {
                  required: true,
                  min: 4,
                  max: 64,
                },
              ],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.appTitle' } /*名称*/)}>
            {getFieldDecorator('title', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.sort' } /*排序*/)}>
            {getFieldDecorator('order', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' } /*请输入*/),
                },
              ],
              initialValue: '',
            })(
              <InputNumber
                placeholder={this.$t({ id: 'common.please.enter' } /*请输入*/)}
                style={{ width: '100%' }}
                step={1}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.initType' } /*注册方式*/)}>
            {getFieldDecorator('addressType', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' } /*请选择*/),
                },
              ],
              initialValue: '',
            })(
              <RadioGroup onChange={this.onChange}>
                <Radio value={0}>{this.$t({ id: 'job.initType.auto' } /*自动*/)}</Radio>
                <Radio value={1}>{this.$t({ id: 'job.initType.manual' } /*手工*/)}</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.address' } /*机器地址*/)}>
            {getFieldDecorator('addressList', {
              rules: [
                {
                  required: selectValue !== 0,
                  message: this.$t({ id: 'common.please.enter' } /*请输入*/),
                },
              ],
              initialValue: '',
            })(<TextArea disabled={selectValue === 0} autosize={{ minRows: 2, maxRows: 6 }} />)}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t({ id: 'common.save' } /*保存*/)}
            </Button>
            <Button onClick={this.onCancel} loading={loading}>
              {this.$t({ id: 'common.cancel' } /*取消*/)}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {};
}
const wrappedJobActuatorDetail = Form.create()(JobActuatorDetail);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedJobActuatorDetail);
