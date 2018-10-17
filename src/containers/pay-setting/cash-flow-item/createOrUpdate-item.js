/**
 * created by zk on 2017/11/22
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Switch, Icon, Select, message } from 'antd';
import debounce from 'lodash.debounce';
import cashFlowItemService from './cash-flow-item.service';
import baseService from 'share/base.service';
import { messages } from 'utils/utils';

const FormItem = Form.Item;
const Option = Select.Option;

class CreateOrUpdateItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      defaultStatus: true,
      statusCode: this.$t({ id: 'common.enabled' }),
      enabled: true,
      item: {},
      isEditor: false,
      setOfBooksOption: [],
      setOfBooksId: '',
    };
    this.validateCashFlowItemCode = debounce(this.validateCashFlowItemCode, 1000);
  }

  componentDidMount() {
    if (this.props.params.item) {
      this.setState({
        item: this.props.params.item,
        isEditor: JSON.stringify(this.props.params.item) == '{}' ? false : true,
        defaultStatus:
          JSON.stringify(this.props.params.item) == '{}' ? true : this.props.params.item.enabled,
        enabled: JSON.stringify(this.props.params) == '{}' ? true : this.props.params.enabled,
        setOfBooksId: this.props.params.searchParams.setOfBookId,
      });
    }
    this.getSetOfBooks();
  }

  //获取账套
  getSetOfBooks() {
    let setOfBooksOption = [];
    baseService.getSetOfBooksByTenant().then(res => {
      res.data.map(data => {
        setOfBooksOption.push({
          label: data.setOfBooksCode + ' - ' + data.setOfBooksName,
          value: String(data.id),
        });
      });
      this.setState({
        setOfBooksOption,
      });
    });
  }

  /**
   * 验证现金流量项（数字/字母）代码,不可重复,代码只能包含字母、数字，特殊字符，否则清空
   * @param item 输入项
   * @param value 输入的值
   */
  validateCashFlowItemCode = (item, value, callback) => {
    if (item.field === 'flowCode') {
      // let re = /^[a-z || A-Z]+$/;
      let re = /[^\u4e00-\u9fa5]+$/;
      if (!re.test(value)) {
        this.props.form.setFieldsValue({ flowCode: '' });
      }
    }
    callback();
  };

  handleCreate = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        cashFlowItemService
          .addCashFlowItem(values)
          .then(response => {
            message.success(this.$t({ id: 'common.create.success' }, { name: values.description }));
            this.setState({
              loading: false,
            });
            this.props.form.resetFields();
            this.props.onClose(true);
          })
          .catch(e => {
            if (e.response) {
              message.error(this.$t({ id: 'common.save.filed' }) + `,${e.response.data.message}`);
            }
            this.setState({ loading: false });
          });
      }
    });
  };

  handleUpdate = () => {
    let updateValues = this.props.form.getFieldsValue();
    let values = this.state.item;
    values.enabled = updateValues.enabled;
    values.setOfBookId = updateValues.setOfBooksId;
    values.flowCode = updateValues.flowCode;
    values.description = updateValues.description;
    if (values.description === '') {
      return;
    }
    cashFlowItemService
      .updateCashFlowItem(values)
      .then(response => {
        if (response.status === 200) {
          message.success(this.$t({ id: 'common.save.success' }, { name: values.description }));
          this.setState({
            loading: false,
          });
          this.props.form.resetFields();
          this.props.onClose(true);
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(this.$t({ id: 'common.save.filed' }) + `,${e.response.data.message}`);
        }
        this.setState({ loading: false });
      });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.setState({
      loading: true,
    });
    this.state.isEditor ? this.handleUpdate() : this.handleCreate();
  };

  onCancel = () => {
    this.props.form.resetFields();
    this.props.onClose(false);
  };

  handleFormChange = () => {
    this.setState({
      loading: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const { defaultStatus, loading, setOfBooksId, setOfBooksOption, item, isEditor } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };

    console.log(this.state.defaultStatus);

    return (
      <div className="new-cash-flow-item">
        <Form onSubmit={this.handleSubmit} onChange={this.handleFormChange}>
          <FormItem {...formItemLayout} label={this.$t({ id: 'common.column.status' }) + ' :'}>
            {getFieldDecorator('enabled', {
              initialValue: defaultStatus,
              valuePropName: 'checked',
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
                onChange={value => {
                  this.setState({
                    flag: 'y',
                    enabled: value,
                  });
                }}
              />
            )}&nbsp;&nbsp;&nbsp;&nbsp;
            {this.props.form.getFieldValue('enabled')
              ? messages('common.enabled')
              : messages('common.disabled')}
          </FormItem>
          {/* <span className="enabled-type" style={{ marginLeft: 25, width: 100 }}>{(this.state.flag === 'y' ? this.state.enabled : defaultStatus) ? "启用" : "禁用"}</span> */}
          <FormItem {...formItemLayout} label={this.$t({ id: 'cash.flow.item.setOfBooksName' })}>
            {getFieldDecorator('setOfBookId', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: setOfBooksId,
            })(
              <Select
                placeholder={this.$t({ id: 'common.please.select' }) /* 请选择 */}
                /*disabled={!this.props.tenantMode || isEditor}*/ disabled
              >
                {setOfBooksOption.map(option => {
                  return <Option key={option.value}>{option.label}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'cash.flow.item.flowCode' })}
            /*validateStatus={this.state.flowCodeLStringStatus}
            help={this.state.flowCodeStringHelp}*/
          >
            {getFieldDecorator('flowCode', {
              initialValue: item.flowCode || '',
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }),
                },
                {
                  validator: (item, value, callback) =>
                    this.validateCashFlowItemCode(item, value, callback),
                },
              ],
            })(<Input disabled={isEditor} placeholder={this.$t({ id: 'common.please.enter' })} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'cash.flow.item.description' })}>
            {getFieldDecorator('description', {
              initialValue: item.description || '',
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }),
                },
              ],
            })(<Input placeholder={this.$t({ id: 'common.please.enter' })} />)}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t({ id: 'common.save' })}
            </Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}
const WrappedCreateOrUpdateItem = Form.create()(CreateOrUpdateItem);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedCreateOrUpdateItem);
