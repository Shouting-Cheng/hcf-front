import React from 'react';
import { Modal, Form, Input, Select, message, Row, Col, Spin, Card, Divider } from 'antd';

const FormItem = Form.Item;

import service from './interface.service';

class InterfaceDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
      data: {},
      loading: true,
    };
  }

  componentDidMount() {
    service.getInterfaceById(this.props.id).then(res => {
      let data = this.props.form.getFieldsValue();
      Object.keys(data).map(key => {
        this.props.form.setFieldsValue({ [key]: res[key] });
        this.setState({ loading: false });
      });
      this.setState({ data: res });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({ loading: true });
      service.getInterfaceById(nextProps.id).then(res => {
        let data = this.props.form.getFieldsValue();
        Object.keys(data).map(key => {
          this.props.form.setFieldsValue({ [key]: res[key] });
        });
        this.setState({ loading: false });
      });
    }
  }

  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  update = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        service.update({ ...this.state.data, ...values }).then(res => {
          message.success('更新成功！');
          service.getInterfaceById(this.props.id).then(res => {
            let data = this.props.form.getFieldsValue();
            Object.keys(data).map(key => {
              this.props.form.setFieldsValue({ [key]: res[key] });
              this.setState({ loading: false });
            });
            this.setState({ data: res });
          });
        });
      }
    });
  };

  test = () => {
    this.props.test && this.props.test();
  };

  render() {
    const { confirmLoading, loading } = this.state;
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };

    return (
      <Spin spinning={loading}>
        <Card
          hoverable
          title="基本属性"
          extra={
            <span>
              <a onClick={this.test}>测试</a>
              <Divider type="vertical" />
              <a onClick={this.delete}>删除</a>
              <Divider type="vertical" />
              <a onClick={this.update}>更新</a>
            </span>
          }
        >
          <Form>
            <Row>
              <Col span={20}>
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
                <Row>
                  <Col span={12}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="请求方式">
                      {getFieldDecorator('requestMethod', {
                        rules: [
                          {
                            required: true,
                            message: '请输入',
                          },
                        ],
                        initialValue: 'get',
                      })(
                        <Select>
                          <Select.Option value="get">GET</Select.Option>
                          <Select.Option value="post">POST</Select.Option>
                          <Select.Option value="put">PUT</Select.Option>
                          <Select.Option value="delete">DELETE</Select.Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="请求协议">
                      {getFieldDecorator('requestProtocol', {
                        rules: [
                          {
                            required: true,
                            message: '请输入',
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
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="请求格式">
                      {getFieldDecorator('requestFormat', {
                        rules: [
                          {
                            required: true,
                            message: '请选择',
                          },
                        ],
                        initialValue: 'application/json',
                      })(
                        <Select>
                          <Select.Option value="application/json">application/json</Select.Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label="响应格式">
                      {getFieldDecorator('responseFormat', {
                        rules: [
                          {
                            required: true,
                            message: '请选择',
                          },
                        ],
                        initialValue: 'application/json',
                      })(
                        <Select>
                          <Select.Option value="application/json">application/json</Select.Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
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
              </Col>
            </Row>
          </Form>
        </Card>
      </Spin>
    );
  }
}

export default Form.create()(InterfaceDetail);
