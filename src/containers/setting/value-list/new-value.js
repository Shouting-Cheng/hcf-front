//0516重构，新增值列表项，编辑值列表项，包括自定义与系统值列表项
import React from 'react';
import { connect } from 'dva';
import { messages } from 'utils/utils';
import { deepCopy } from 'utils/extend';
import { Form, Input, Switch, Button, Icon, message } from 'antd';

const FormItem = Form.Item;
import { LanguageInput } from 'widget/index';
import { SelectDepOrPerson } from 'widget/index';
import valueListService from 'containers/setting/value-list/value-list.service';
import 'styles/setting/value-list/new-value.scss';
//默认的值列表项
const defaultVauleItem = {
  code: '',
  value: '',
  name: '',
  i18n: {},
  common: true,
  codeId: null,
  id: '',
};

class ValueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tableLoading: false,
      deleteLoading: false,
      id: null,
      //编辑时的信息
      record: defaultVauleItem,
      typeFlag: '',
    };
  }

  componentDidMount() {
    if (this.props.params.record) {
      //编辑
      //这个地方不能用传入的数据，需要请求后端的，因为有多语言对象
      this.getValue(this.props.params.record.id);
      this.setState({
        typeFlag: this.props.params.typeFlag,
      });
    } else if (!this.props.params.record) {
      //新建
      this.setState({
        record: deepCopy(defaultVauleItem),
      });
    }
  }


  getValue(id) {
    valueListService.getValue(id).then(res => {
      let data = res.data;
      if (data.i18n) {
      } else {
        data.i18n = {};
      }
      this.setState(
        {
          record: data,
        },
        () => {
          this.props.form.resetFields();
        },
      );
    });
  }


  validateMessageKeyLengthErr = messageKey => {
    if (messageKey === null || messageKey === undefined || messageKey === '') {
      // 请填写名称
      message.warn(messages('value.list.name.input'));
      return true;
    }
    if (messageKey && messageKey.length && messageKey.length > 100) {
      //名称最多输入100个字符
      message.warn(messages('value.list.name.max.100'));
      return true;
    }
  };

  handleSave = e => {
    e.preventDefault();
    if (this.validateMessageKeyLengthErr(this.state.record.name)) {
      return;
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.codeId = this.props.params.codeId;
        //多语言
        values.i18n = this.state.record.i18n;
        values.name = this.state.record.name;

        if (this.state.record.id !== null && this.state.record.id !== undefined && this.state.record.id !== '') {
          values.id = this.state.record.id;
          this.updateValue(values);
        } else {
          values.id = null;
          this.newValue(values);
        }
      }
    });
  };

  //新增
  newValue(value) {
    this.setState({ loading: true });
    valueListService
    .newValue(value)
    .then(res => {
      if (res.status === 200) {
        message.success(messages('common.save.success', { name: '' }));
        this.setState({ loading: false });
        this.props.close(true);
      }
    })
    .catch(e => {
      this.setState({ loading: false });
    });
  }

  //更新
  updateValue(value) {
    this.setState({ loading: true });
    valueListService
    .updateValue(value)
    .then(res => {
      if (res.status === 200) {
        message.success(messages('common.save.success', { name: '' }));
        this.setState({ loading: false });
        this.props.close(true);
      }
    })
    .catch(e => {
      this.setState({ loading: false });
    });
  }

  onCancel = () => {
    this.props.close();
  };


  //名称：自定义值列表项多语言
  i18nNameChange = (name, i18nName) => {
    this.state.record.name = name;
    this.state.record.i18n.name = i18nName;
  };


  render() {
    const { getFieldDecorator, getFieldsValue } = this.props.form;
    const {
      loading,

      record,

      typeFlag,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };

    return (
      <div className="new-value">
        <Form onSubmit={this.handleSave}>
          <div className="common-item-title">{messages('value.list.basic.info' /*基本信息*/)}</div>

          <FormItem {...formItemLayout} label={messages('value.list.value.name' /*值名称*/)}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: record ? record.name : '',
            })(
              <div>
                <LanguageInput
                  disabled={typeFlag === 'SYSTEM'}
                  name={record ? record.name : ''}
                  i18nName={
                    record && record.i18n && record.i18n.name ? record.i18n.name : null
                  }
                  isEdit={record && record.id}
                  nameChange={this.i18nNameChange}
                />
              </div>,
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('value.list.value.code' /*编码*/)}>
            {getFieldDecorator('value', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
                {
                  max: 100,
                  message: messages('value.list.input.max.100' /*最多输入100个字符*/),
                },
                //值列表项直接使用后端提示
                //   {
                //   pattern: '^[a-zA-Z0-9]{1,}$',
                //   message: messages('value.list.input.only.letter.and.num'/*只能输入大小写字母和数字*/)
                // }
              ],
              initialValue: record ? record.value : '',
            })(<Input placeholder={messages('common.please.enter')} disabled={!!record.id}/>)}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('common.remark')}>
            {getFieldDecorator('remark', {
              rules: [
                {
                  max: 200,
                  message: messages('value.list.input.max.200' /*最多输入200个字符*/),
                },
              ],
              initialValue: record ? record.remark : '',
            })(<Input placeholder={messages('value.list.input.max.200' /*最多输入200个字符*/)}/>)}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('common.column.status')}>
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: record ? record.enabled : true,
            })(
              <Switch
                disabled={typeFlag === 'SYSTEM'}
                checkedChildren={<Icon type="check"/>}
                unCheckedChildren={<Icon type="cross"/>}
              />,
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {messages('common.save')}
            </Button>
            <Button onClick={this.onCancel}>{messages('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const WrappedValueList = Form.create()(ValueList);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true },
)(WrappedValueList);
