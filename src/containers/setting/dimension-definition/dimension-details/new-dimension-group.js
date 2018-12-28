import React, { Component } from 'react';
import { Form, Input, Switch, Button, message, } from 'antd';
import service from './dimension-group-service';
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
    const { form, close, dimensionId, model } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if(!err) {
        this.setState({ saveLoading: true });
        let data, mess, handelMethods;
        if (model.id) {
          mess = '修改维值组信息成功';
          handelMethods = service.updateDimensionGroup;
          data = { id: model.id, ...values, dimensionId };
        } else {
          mess = '新建维值组信息成功';
          handelMethods = service.saveDimensionGroup;
          data = { ...values, dimensionId };
        }
        handelMethods(data).then((res) => {
          message.success(mess);
          this.setState({ saveLoading: false });
          close && close(true);
        }).catch((err) => {
          message.error(err.response.data.message);
          this.setState({ saveLoading: false });
        })
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
      <div style={{ marginTop: '50px' }}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="维值组代码">
            {getFieldDecorator('dimensionItemGroupCode', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: model.dimensionItemGroupCode || '',
            })(<Input disabled={model.id ? true : false} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="维值组名称">
            {getFieldDecorator('dimensionItemGroupName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: model.dimensionItemGroupName || '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="状态">
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: model.id ? model.enabled : true,
            })(<Switch />)}
            <span style={{ paddingLeft: "10px" }}>
              {this.props.form.getFieldValue('enabled') ? '启用' : '禁用'}
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
