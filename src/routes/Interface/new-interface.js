import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

const FormItem = Form.Item;

import service from './interface.service';

class NewInterface extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
    };
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ confirmLoading: true });
        service.add({ ...values, moduleId: this.props.moduleId }).then(res => {
          this.setState({ confirmLoading: false });
          message.success('添加成功！');
          this.props.onOk && this.props.onOk(values);
        });
      }
    });
  };

  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  render() {
    const { confirmLoading } = this.state;
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <Modal
        title="添加接口"
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        width={600}
        confirmLoading={confirmLoading}
      >
        <Form>
          <FormItem {...formItemLayout} label="名称">
            {getFieldDecorator('interfaceName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="url">
            {getFieldDecorator('reqUrl', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="请求方式">
            {getFieldDecorator('requestMethod', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: 'get',
            })(
              <Select style={{ width: 120 }}>
                <Select.Option value="get">GET</Select.Option>
                <Select.Option value="post">POST</Select.Option>
                <Select.Option value="put">PUT</Select.Option>
                <Select.Option value="delete">DELETE</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="请求协议">
            {getFieldDecorator('requestProtocol', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: 'http',
            })(
              <Select>
                <Select.Option value="http">HTTP</Select.Option>
                <Select.Option value="https">HTTPS</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="请求格式">
            {getFieldDecorator('requestFormat', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: 'application/json',
            })(
              <Select style={{ width: 200 }}>
                <Select.Option value="application/json">application/json</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="响应格式">
            {getFieldDecorator('responseFormat', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: 'application/json',
            })(
              <Select style={{ width: 200 }}>
                <Select.Option value="application/json">application/json</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('remark', {
              rules: [
                {
                  required: false,
                  message: '请输入',
                },
              ],
              initialValue: '',
            })(<Input.TextArea autosize={{ minRows: 3, maxRows: 6 }} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(NewInterface);
