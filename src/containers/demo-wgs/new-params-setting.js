import React, { Component } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import 'styles/setting/params-setting/params-setting.scss';
const FormItem = Form.Item;

import service from './service';

class NewDemoBuilt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      paramsTypeList: [],
      filterMethodList: [],
    };
  }
  // 生命周期
  componentDidMount() {
    // debugger;
    // console.log(this.props.params);
    this.getTableType();
    // debugger;
    this.getFilterMethodList();
  }
  // 获取参数类型
  getTableType = () => {
    this.getSystemValueList(3101)
      .then(res => {
        console.log(res);
        this.setState({
          paramsTypeList: res.data.values,
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };
  //获取筛选方式
  getFilterMethodList = () => {
    this.getSystemValueList(3104)
      .then(res => {
        console.log(res);
        this.setState({
          filterMethodList: res.data.values,
        });
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };
  //保存&&编辑
  handleSubmit = () => {
    let { params } = this.props;
    this.props.form.validateFields((err, values, record) => {
      let data = Object.assign({}, params, values);

      if (err) return;
      this.setState({
        saveLoading: true,
      });
      if (!params.id) {
        service
          .addParamsSetting(values)
          .then(res => {
            message.success('新增成功！');
            this.setState({ saveLoading: false });
            this.props.close && this.props.close(true);
          })
          .catch(err => {
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      } else {
        service
          .editParamsSetting(data)
          .then(res => {
            message.success('编辑成功！');
            this.setState({ saveLoading: false });
            this.props.close && this.props.close(true);
          })
          .catch(err => {
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      }
    });
  };
  hasErrors(fieldsError) {
    const { isFieldTouched } = this.props.form;
    let flag =
      isFieldTouched('dataType') &&
      isFieldTouched('customSql') &&
      isFieldTouched('tableName') &&
      isFieldTouched('columnName');
      console.log(fieldsError,'field');
    // let flag = Object.keys(fieldsError).every(field=>isFieldTouched(field));
    // console.log(flag);
    return Object.keys(fieldsError).some(field => {fieldsError[field]}) || !flag;
  }
  //取消
  handleCancel = () => {
    this.props.close && this.props.close();
  };

  render() {
    const { getFieldDecorator, getFieldsError, isFieldsTouched } = this.props.form;
    const { saveLoading, paramsTypeList, filterMethodList } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 12,
      },
    };
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label="表名称">
            {getFieldDecorator('tableName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: this.props.params.tableName || '',
            })(<Input type="number" placeholder="请输入阿拉伯数字    " />)}
          </FormItem>

          <FormItem {...formItemLayout} label="参数类型" hasFeedback>
            {getFieldDecorator('dataType', {
              rules: [{ required: true, message: '请选择' }],
              initialValue: this.props.params.dataType || '',
            })(
              <Select placeholder="请选择">
                {paramsTypeList.map(item => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.messageKey}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="筛选方式" validateStatus="success">
            {getFieldDecorator('filterMethod', {
              initialValue: this.props.params.dataType || '',
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
              initialValue: this.props.params.customSql || '',
            })(<Input placeholder="请选择" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="参数名称">
            {getFieldDecorator('columnName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: this.props.params.columnName || '',
            })(<Input />)}
          </FormItem>
          <div className="footer-button">
            <Button
              className="btn"
              type="primary"
              htmlType="submit"
              loading={saveLoading}
              disabled={this.hasErrors(getFieldsError())}
            >
              {' '}
              {this.$t('common.save')}
            </Button>
            <Button className="btn" onClick={this.handleCancel}>
              {this.$t('common.cancel')}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create()(NewDemoBuilt);
