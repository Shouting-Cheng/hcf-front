import React from 'react';
import { Modal, Form, Select, Input, Icon, message } from 'antd';
import service from './service';
import icons from '../../assets/icons';
import { connect } from 'react-redux';

@connect(({ languages }) => ({ languages }))
class NewMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      languageKeys: [],
      loading: false,
    };
  }

  componentDidMount() {
    service.getLanguageKeys(this.props.languages.local).then(res => {
      this.setState({ languageKeys: res });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      if (nextProps.model && nextProps.model.id) {
        let data = this.props.form.getFieldsValue();
        Object.keys(data).map(key => {
          this.props.form.setFieldsValue({ [key]: String(nextProps.model[key] || '') });
        });
      }
    }

    if (nextProps.languages.local !== this.props.languages.local) {
      service.getLanguageKeys(nextProps.languages.local).then(res => {
        this.setState({ languageKeys: res });
      });
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if (this.props.model && this.props.model.id) {
          values = { ...this.props.model, ...values };
          service
            .updateMenu(values)
            .then(res => {
              message.success('编辑成功！');
              this.props.form.resetFields();
              this.props.onClose && this.props.onClose();
              this.setState({ loading: false });
            })
            .catch(() => {
              this.setState({ loading: false });
            });
        } else {
          values = { ...values, seqNumber: 0, parentMenuId: this.props.parentId };
          service
            .addMenu(values)
            .then(res => {
              message.success('保存成功！');
              this.props.form.resetFields();
              this.props.onClose && this.props.onClose();
              this.setState({ loading: false });
            })
            .catch(() => {
              this.setState({ loading: false });
            });
        }
      }
    });
  };

  handleCancel = () => {
    this.props.onClose && this.props.onClose();
    this.props.form.resetFields();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible } = this.props;
    const { languageKeys, loading } = this.state;

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
        title="添加菜单"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        confirmLoading={loading}
      >
        <Form>
          <Form.Item {...formItemLayout} label="代码">
            {getFieldDecorator('menuCode', {
              rules: [{ required: true, message: '请输入' }],
            })(<Input disabled={!!this.props.model.menuCode} />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="名称">
            {getFieldDecorator('menuName', {
              rules: [{ required: true, message: '请选择' }],
            })(
              <Select optionLabelProp="value">
                {languageKeys.map(item => (
                  <Select.Option key={item.id} value={item.keyCode}>
                    <span style={{ fontWeight: 800 }}>{item.keyCode}</span>
                    <span>-</span>
                    <span>{item.descriptions}</span>
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="类型">
            {getFieldDecorator('menuTypeEnum', {
              initialValue: '1001',
              rules: [{ required: true, message: '请选择' }],
            })(
              <Select>
                <Select.Option value="1001">目录</Select.Option>
                <Select.Option value="1000">功能</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="来源">
            {getFieldDecorator('fromSource', {
              initialValue: 'DB',
              rules: [{ required: true, message: '请选择' }],
            })(
              <Select>
                <Select.Option value="DB">数据库</Select.Option>
                <Select.Option value="FILE">本地文件</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="路由">
            {getFieldDecorator('menuUrl', {
              rules: [{ required: true, message: '请输入' }],
            })(<Input />)}
          </Form.Item>
          {this.props.form.getFieldValue('menuTypeEnum') == '1001' && (
            <Form.Item {...formItemLayout} label="图标">
              {getFieldDecorator('menuIcon')(
                <Select allowClear optionLabelProp="value">
                  {icons.map(item => {
                    return (
                      <Select.Option key={item} value={item}>
                        <Icon type={item} />
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(NewMenu);
