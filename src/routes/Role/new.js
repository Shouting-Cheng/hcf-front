import React from 'react';
import { Modal, Form, Select, Input, Icon, message } from 'antd';
import service from './service';
import icons from '../../assets/icons';

class NewMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ visible: nextProps.visible });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = { ...this.props.params, ...values };
        if (!values.id) {
          service.addRole(values).then(res => {
            message.success('保存成功！');
            this.setState({ visible: false });
            this.props.form.resetFields();
            this.props.onClose && this.props.onClose(true);
          });
        } else {
          service.updateRole(values).then(res => {
            message.success('修改成功！');
            this.setState({ visible: false });
            this.props.form.resetFields();
            this.props.onClose && this.props.onClose(true);
          });
        }
      }
    });
  };

  handleCancel = () => {
    this.props.onClose && this.props.onClose(true);
  };

  render() {
    const { params } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { visible } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
    };

    return (
      <Modal
        title="添加角色"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <Form.Item {...formItemLayout} label="代码">
            {getFieldDecorator('roleCode', {
              initialValue: params.roleCode,
              rules: [{ required: true, message: '请输入' }],
            })(<Input disabled={!!params.id} />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="名称">
            {getFieldDecorator('roleName', {
              initialValue: params.roleName,
              rules: [{ required: true, message: '请输入' }],
            })(<Input />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(NewMenu);
