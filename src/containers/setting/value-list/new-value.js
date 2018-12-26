//0516重构，新增值列表项，编辑值列表项，包括自定义与系统值列表项
import React from 'react';
import { connect } from 'dva';
import { messages } from 'utils/utils';
import { deepCopy } from 'utils/extend';
import { Form, Input, Switch, Button, Icon, message } from 'antd';
import Table from 'widget/table'

const FormItem = Form.Item;
import { LanguageInput } from 'widget/index';
import ListSelector from 'widget/list-selector';
import { SelectDepOrPerson } from 'widget/index';
import valueListService from 'containers/setting/value-list/value-list.service';
import 'styles/setting/value-list/new-value.scss';
//默认的值列表项
const defaultVauleItem = {
  code: '',
  value: '',
  messageKey: '',
  i18n: {},
  common: true,
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
      common: true, //全员可见
      customEnumerationItemOid: '',
      columns: [
        {
          title: messages('common.sequence' /*序号*/),
          dataIndex: 'id',
          render: (value, record, index) => index + 1 + this.state.pageSize * this.state.page,
        },
        {
          title: messages('value.list.employee.id' /*工号*/),
          dataIndex: 'employeeID',
        },
        {
          title: messages('value.list.employee.name' /*姓名*/),
          dataIndex: 'fullName',
        },
        {
          title: messages('value.list.employee.legal.entity' /*法人实体*/),
          dataIndex: 'corporationName',
          render: value => value || '-',
        },
        {
          title: messages('value.list.employee.department' /*部门*/),
          dataIndex: 'department',
          render: value => value.name || '-',
        },
        {
          title: messages('value.list.employee.title' /*职务*/),
          dataIndex: 'title',
          render: value => value || '-',
        },
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: { total: 0 },
      userOids: [],
      deleteUserOids: [],
      showListSelector: false,
      isCustom: "", //是否为系统初始化的值
    };
  }

  componentDidMount() {
    if (this.props.params.record) {
      //编辑
      //这个地方不能用传入的数据，需要请求后端的，因为有多语言对象
      this.getValue(this.props.params.record.customEnumerationItemOid);
      this.setState({
        isCustom: this.props.params.isCustom,
      });
    } else if (!this.props.params.record) {
      //新建
      this.setState({
        record: deepCopy(defaultVauleItem),
        common: true,
        customEnumerationItemOid: '',
        data: [],
        deleteUserOids: [],
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.params.record && !nextProps.params.hasInit) {
    //   //编辑
    //   //这个地方不能用传入的数据，需要请求后端的，因为有多语言对象
    //   this.getValue(nextProps.params.record.customEnumerationItemOid);
    //   nextProps.params.hasInit = true;
    //   this.setState({
    //     systemInit: nextProps.params.systemInit
    //   })
    // } else if (!nextProps.params.record && !nextProps.params.hasInit) { //新建
    //   nextProps.params.hasInit = true;
    //   this.setState({
    //     record: deepCopy(defaultVauleItem),
    //     common: true,
    //     customEnumerationItemOid: "",
    //     data: [],
    //     deleteUserOids: []
    //   }, () => {
    //     this.props.form.resetFields()
    //   })
    // }
  }

  getValue(customEnumerationItemOid) {
    valueListService.getValue(customEnumerationItemOid).then(res => {
      let data = res.data;
      if (data.i18n) {
      } else {
        data.i18n = {};
      }
      this.setState(
        {
          record: data,
          common: data.common,
          customEnumerationItemOid: customEnumerationItemOid,
          deleteUserOids: [],
        },
        () => {
          this.props.form.resetFields();
        }
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
    if (this.validateMessageKeyLengthErr(this.state.record.messageKey)) {
      return;
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.common = !!values.common;
        const { customEnumerationItemOid } = this.state;
        values.customEnumerationOid = this.props.params.customEnumerationOid;
        values.userOids = this.state.userOids;
        //多语言
        values.i18n = this.state.record.i18n;
        values.messageKey = this.state.record.messageKey;
        if (customEnumerationItemOid) {
          //更新
          values.customEnumerationItemOid = customEnumerationItemOid;
          values.id = this.state.id || this.state.record.id;
        }
        if (customEnumerationItemOid) {
          this.updateValue(values);
        } else {
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



  //选择/取消选择某行的回调
  handleSelectRow = (record, selected) => {
    let deleteUserOids = this.state.deleteUserOids;
    if (selected) {
      deleteUserOids.push(record.userOid);
    } else {
      deleteUserOids.delete(record.userOid);
    }
    this.setState({ deleteUserOids });
  };

  //选择/取消选择所有行的回调
  handleSelectAllRow = (selected, selectedRows, changeRows) => {
    let deleteUserOids = this.state.deleteUserOids;
    if (selected) {
      changeRows.map(item => {
        deleteUserOids.push(item.userOid);
      });
    } else {
      changeRows.map(item => {
        deleteUserOids.delete(item.userOid);
      });
    }
    this.setState({ deleteUserOids });
  };

  showListSelector = flag => {
    this.setState({ showListSelector: flag });
  };
  //名称：自定义值列表项多语言
  i18nNameChange = (name, i18nName) => {
    this.state.record.messageKey = name;
    this.state.record.i18n.messageKey = i18nName;
  };
  moveInPerson = res => {
    let userOids = [];
    res.personList.map(item => {
      userOids.push(item.userOid);
    });
    this.addEmployee(userOids);
  };

  render() {
    const { getFieldDecorator, getFieldsValue } = this.props.form;
    const {
      loading,
      tableLoading,
      deleteLoading,
      columns,
      data,
      common,
      pagination,
      record,
      deleteUserOids,
      showListSelector,
      customEnumerationItemOid,
      isCustom,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const rowSelection = {
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow,
    };
    return (
      <div className="new-value">
        <Form onSubmit={this.handleSave}>
          <div className="common-item-title">{messages('value.list.basic.info' /*基本信息*/)}</div>

          <FormItem {...formItemLayout} label={messages('value.list.value.name' /*值名称*/)}>
            {getFieldDecorator('messageKey', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: record ? record.messageKey : '',
            })(
              <div>
                <LanguageInput
                  //disabled={!!record.id}
                  name={record ? record.messageKey : ''}
                  i18nName={
                    record && record.i18n && record.i18n.messageKey ? record.i18n.messageKey : null
                  }
                  isEdit={record && record.id}
                  nameChange={this.i18nNameChange}
                />
              </div>
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
            })(<Input placeholder={messages('common.please.enter')} disabled={!!record.id} />)}
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
            })(<Input placeholder={messages('value.list.input.max.200' /*最多输入200个字符*/)} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={messages('common.column.status')}>
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: record ? record.enabled : true,
            })(
              <Switch
                disabled={isCustom === 'SYSTEM'}
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
              />
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
  { withRef: true }
)(WrappedValueList);
