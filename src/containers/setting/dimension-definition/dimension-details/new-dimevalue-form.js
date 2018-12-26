
import React, { Component } from 'react';
import { Form, Input, Button, message, Switch, Radio} from 'antd'
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import PermissionsAllocation from 'widget/Template/permissions-allocation';

class ValueForm extends Component {
   constructor(props) {
      super(props);
      this.state = {
        saveLoading: false,
        useOrNot: false,
        applyEmployee: '1001',
        departmentOrUserGroupIdList: [],
        permissions: {
            type: 'all',
            values: []
        },
        nowType: {},
      };
   }

  //解禁确认按钮
  liftBan = () => {
    this.setState({ useOrNot: false });
  }

  //取消
  handleCancel = () => {
    this.props.close();
  }

  //保存
  handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err,value) => {
         if(err) {
           this.setState({useOrNot: true});
           return
         }
          //维值代码不允许重复

         console.log(value);
         this.props.close();
      })
  }

   //选择人员或者员工组使用公共组件，监听onChange事件
  onPermissionChange = (values) => {
      let nowApplyEmployee = '';
      let nowDepartOrUserIdList = [];
      if (values.type == 'all') {
          nowApplyEmployee = '1001';
      } else if (values.type == 'department') {
          nowApplyEmployee = '1002';
      } else if (values.type == 'group') {
          nowApplyEmployee = '1003';
      }
      values.values.map(value => {
          nowDepartOrUserIdList.push(value['value']);
      });
      this.setState({
          applyEmployee: nowApplyEmployee,
          departmentOrUserGroupIdList: nowDepartOrUserIdList
      });
  };

  render() {
      const {saveLoading,
             useOrNot,
             permissions,
             departmentOrUserGroupIdList,
             applyEmployee,nowType} = this.state;
      const {getFieldProps,getFieldDecorator} = this.props.form;
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 10 },
      }

      //表单校验
      const codeProp = getFieldProps('dimensionItemCode', {
        validate: [{
          rules: [
            { required: true, message: '必填项' }
          ],
          trigger: 'onBlur',
        }],
        initialValue: this.props.params.dimensionItemCode || ''
      });
      const nameProp = getFieldProps('dimensionItemName', {
        validate: [{
          rules: [
            { required: true, message: '必填项' }
          ],
          trigger: 'onBlur',
        }],
        initialValue: this.props.params.dimensionItemName || ''
      });

      return (
        <div style={{paddingTop: '20px'}}>
          <Form>
            <div className='common-item-title'>基本数据</div>
            <FormItem
              {...formItemLayout}
              label='维值代码'
              hasFeedback
            >
              <Input
                {...codeProp}
                placeholder='请输入'
                onFocus={this.liftBan}
                disabled={this.props.params.id ? true : false} />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='维值名称'
              hasFeedback
            >
              <Input {...nameProp} placeholder='请输入' onFocus={this.liftBan} />
            </FormItem>
            <FormItem
                {...formItemLayout}
                label='状态'
            >
                 {getFieldDecorator('enabled', {
                  initialValue: this.props.params.id ? this.props.params.enabled : true,
                  valuePropName: 'checked',
                })(<Switch />)}
                <span style={{paddingLeft: '20px'}}>
                  {this.props.form.getFieldValue('enabled') ? '启用' : '禁用'}
                </span>
            </FormItem>
            <div className='common-item-title'>权限设置</div>
            <FormItem
                {...formItemLayout}
                label='适用人员'
            >
              {getFieldDecorator('departmentOrUserGroupIdList', {
                  initialValue: permissions
              })
                  (
                  <PermissionsAllocation
                    // params={{setOfBooksId: nowType.setOfBooksId}}
                    onChange={this.onPermissionChange}>
                  </PermissionsAllocation>
                  )}
            </FormItem>
          </Form>
          <div className="slide-footer">
            <Button
              type="primary"
              htmlType="submit"
              loading={saveLoading}
              disabled={useOrNot}
              onClick={this.handleSubmit}>
              {this.$t('common.save')}
            </Button>
            <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
          </div>
        </div>
      )
   }
}

export default Form.create()(ValueForm);
