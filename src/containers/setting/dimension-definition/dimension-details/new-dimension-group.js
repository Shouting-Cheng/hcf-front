import React, { Component } from 'react';
import { Form, Input, Switch, Button, message, } from 'antd';
const FormItem = Form.Item;

class NewDimensionGroup extends Component {
  constructor(props) {
    super(props);
     this.state = {
      saveLoading: false,
     }
  }

  // 提交
  handleSubmit = (e) => {
    const { form, close } = this.props;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!err) {
        console.log(values)

      }
    })
  }

  // 取消
  handleCancel = () => {
    this.props.close && this.props.close();
  }

  render() {
    const { saveLoading } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { model } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 10,
      },
    };

    return (
      <div style={{marginTop: '50px'}}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="维值组代码">
            {getFieldDecorator('tableName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: model.tableName || '',
            })(<Input disabled={model.id ? true : false} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="维值组名称">
            {getFieldDecorator('tableName2', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: model.tableName1 || '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="状态">
            {getFieldDecorator('switch', {
              valuePropName: 'checked',
              initialValue: model.switch ? Boolean(model.switch) : true,
            })(<Switch />)}
            <span style={{paddingLeft: "10px"}}>
              {this.props.form.getFieldValue('switch') ? '启用' : '禁用'}
            </span>
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={saveLoading}>
              {this.$t('common.save')}
            </Button>
            <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

export default Form.create()(NewDimensionGroup);
