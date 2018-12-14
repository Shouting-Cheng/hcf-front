import React, { Component } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
const FormItem = Form.Item;

import service from './service';

class NewParamsSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataTypeList: [],
      filterMethodList: [],
      saveLoading: false,
    };
  }

  componentDidMount() {
    this.getDataTypeList();
    this.getFilterMethodList();
  }

  // 获取参数类型列表
  getDataTypeList = () => {
    this.getSystemValueList(3101)
      .then(res => {
        this.setState({
          dataTypeList: res.data.values,
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  // 获取筛选方式列表
  getFilterMethodList = () => {
    this.getSystemValueList(3104)
      .then(res => {
        this.setState({
          filterMethodList: res.data.values,
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  // 提交
  handleSubmit = () => {
    let { form, modal, close } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        let handelMethods, tips, data;
        this.setState({ saveLoading: true });
        if (modal.id) {
          handelMethods = service.updateParamsSetting;
          tips = '修改成功！';
          data = Object.assign({}, modal, values);
        } else {
          handelMethods = service.addParamsSetting;
          tips = '新增成功！';
          data = values;
        }
        handelMethods(data)
          .then(res => {
            message.success(tips);
            this.setState({ saveLoading: false });
            close && close(true);
          })
          .catch(err => {
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      }
    });
  };

  // 取消
  handleCancel = () => {
    this.props.close && this.props.close();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { modal } = this.props;
    const { dataTypeList, filterMethodList, saveLoading } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 10,
      },
    };

    return (
      <div style={{ padding: '40px 0' }}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="表名称">
            {getFieldDecorator('tableName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: modal.tableName || '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="参数类型">
            {getFieldDecorator('dataType', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: modal.dataType || '',
            })(
              <Select>
                {dataTypeList.map(item => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.messageKey}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="筛选方式">
            {getFieldDecorator('filterMethod', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: modal.filterMethod || '',
            })(
              <Select>
                {filterMethodList.map(item => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.messageKey}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="关联条件">
            {getFieldDecorator('customSql', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: modal.customSql || '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="参数名称">
            {getFieldDecorator('columnName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: modal.columnName || '',
            })(<Input />)}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={saveLoading}>
              {this.$t('common.save')}
            </Button>
            <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create()(NewParamsSetting);
