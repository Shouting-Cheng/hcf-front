
import React, { Component } from 'react'
import { Form, Input, Button, message, Select } from 'antd'
const FormItem = Form.Item;

import service from './service.js'

class FormToAddOrEditData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataTypeLists: [],
      filterMethodLists: [],
      saveLoading: false,
      userOrNot: false
    }
  }

  //组件载入时获取参数类型,筛选方式
  componentDidMount() {
    this.getDataTypeLists();
    this.getFilterMethodLists();
  }

  //获取参数类型
  getDataTypeLists = () => {
    this.getSystemValueList(3101)
      .then(res => {
        this.setState({
          dataTypeLists: res.data.values
        })
      })
      .catch(err => {
        message.error(err.response.data.message)
      })
  }

  //获取筛选方式
  getFilterMethodLists = () => {
    this.getSystemValueList(3104)
      .then(res => {
        this.setState({
          filterMethodLists: res.data.values
        })
      })
      .catch(err => {
        message.error(err.response.data.message)
      })
  }

  //提交
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      if (err) {
        this.setState({ useOrNot: true })
        return
      };
      this.setState({ saveLoading: true });
      if (!this.props.params.id) {
        service.addParamsData(value)
          .then(res => {
            message.success('新增成功', 3);
            this.setState({ saveLoading: false }, () => {
              this.props.close(true);
            });
          })
          .catch(err => {
            message.error(`失败：${err.response.data.message}`, 5);
            this.setState({ saveLoading: false }, () => {
              this.props.close();
            });
          });
      } else {
        value = { ...value, id: this.props.params.id };
        service.editParamsData(value)
          .then(res => {
            message.success('编辑成功');
            this.setState({ saveLoading: false }, () => {
              this.props.close(true);
            });
          })
          .catch(err => {
            message.error(`失败：${err.response.data.message}`);
            this.setState({ saveLoading: false }, () => {
              this.props.close();
            });
          })
      }
    })
  }

  //解禁确认按钮
  liftBan = () => {
    this.setState({ useOrNot: false });
  }

  //取消
  handleCancel = () => {
    this.props.close();
  }

  render() {
    const { dataTypeLists, filterMethodLists, saveLoading, useOrNot } = this.state;
    const { getFieldProps } = this.props.form;

    //定义表单验证
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10 },
    }

    const nameProp = getFieldProps('tableName', {
      validate: [{
        rules: [
          { required: true, message: '必填项' }
        ],
        trigger: 'onBlur',
      }],
      initialValue: this.props.params.tableName || ''
    });

    const typeProp = getFieldProps('dataType', {
      validate: [{
        rules: [
          { required: true, message: '必选项' }
        ],
        trigger: 'onBlur',
      }],
      initialValue: this.props.params.dataType || ''
    });

    const methodProp = getFieldProps('filterMethod', {
      validate: [{
        rules: [
          { required: true, message: '必选项' }
        ],
        trigger: 'onBlur',
      }],
      initialValue: this.props.params.filterMethod || ''
    });

    const customSqlProp = getFieldProps('customSql', {
      validate: [{
        rules: [
          { required: true, message: '必填项' }
        ],
        trigger: 'onBlur',
      }],
      initialValue: this.props.params.customSql || ''
    });

    const columnNameProp = getFieldProps('columnName', {
      validate: [{
        rules: [
          { required: true, message: '必填项' }
        ],
        trigger: 'onBlur',
      }],
      initialValue: this.props.params.columnName || ''
    });

    return (
      <div style={{ padding: '60px 0' }}>
        <Form>
          <FormItem
            {...formItemLayout}
            label='表名称'
            hasFeedback
          >
            <Input id='tableName' {...nameProp} placeholder='请输入' onFocus={this.liftBan} />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='参数类型'
          >
            <Select {...typeProp} onFocus={this.liftBan} placeholder='请选择'>
              {
                dataTypeLists.map(item => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.messageKey}
                    </Select.Option>
                  )
                })
              }
            </Select>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='筛选方式'
          >
            <Select {...methodProp} onFocus={this.liftBan} placeholder='请选择'>
              {
                filterMethodLists.map(item => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.messageKey}
                    </Select.Option>
                  )
                })
              }
            </Select>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='关联条件'
            hasFeedback
          >
            <Input.TextArea
              id='customSql'
              {...customSqlProp}
              placeholder='请输入'
              onFocus={this.liftBan} />
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='参数名称'
            hasFeedback
          >
            <Input id='columnName' {...columnNameProp} placeholder='请输入' onFocus={this.liftBan} />
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

export default Form.create()(FormToAddOrEditData);
