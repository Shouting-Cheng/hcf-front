
import React, { Component } from 'react';
import { Form, Input, Button, message, Switch} from 'antd';
import dimensionValueService from './dimension-value-service';

const FormItem = Form.Item;
class AddCompanyForm extends Component {
    constructor(props) {
       super(props);
       this.state = {
         saveLoading: false,
       }
    }

    //提交
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err,value) => {
         if(err) return;
         this.setState({saveLoading: true});
         let params = {...value,dimensionItemId: this.props.itemId}
         dimensionValueService
           .addNewCompanyData([params])
           .then(res => {
              message.success('success:新增公司成功');
              this.setState({saveLoading: false},() => {
                  this.props.close(true);
              });
           })
           .catch(err => {
              this.setState({saveLoading: false});
              message.error(err.response.data.message);
           })
      });
    }

    //取消
    handleCancel = () => {
      this.props.close();
    }

    render() {
      const { saveLoading } = this.state;
      const { getFieldDecorator } = this.props.form;
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
            <FormItem {...formItemLayout} label="公司代码">
              {getFieldDecorator('companyCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入',
                  },
                ],
                initialValue: this.props.form.companyCode || '',
              })(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label="公司Id">
              {getFieldDecorator('companyId', {
                rules: [
                  {
                    required: true,
                    message: '请输入',
                  },
                ],
                initialValue: this.props.form.companyId || '',
              })(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label="状态">
              {getFieldDecorator('enabled', {
                valuePropName: 'checked',
                initialValue: this.props.params.id ? this.props.params.enabled : true,
              })(<Switch />)}
              <span style={{paddingLeft: "10px"}}>
                {this.props.form.getFieldValue('enabled') ? '启用' : '禁用'}
              </span>
            </FormItem>
            <div className="slide-footer">
              <Button
                type="primary"
                htmlType="submit"
                loading={saveLoading}
                onClick={this.handleSubmit} >
                {this.$t('common.save')}
              </Button>
              <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
            </div>
          </Form>
        </div>
      )
    }
}
export default Form.create()(AddCompanyForm);
