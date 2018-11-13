//0516重构，新增值列表项，编辑值列表项，包括自定义与系统值列表项
import React from 'react';
import { connect } from 'dva';
import { messages } from 'utils/utils';
import { deepCopy } from 'utils/extend';
import { Form, Input, Switch, Button, Icon, Table, message } from 'antd';

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
      customEnumerationItemOID: '',
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
      userOIDs: [],
      deleteUserOIDs: [],
      showListSelector: false,
      systemInit: null, //是否为系统初始化的值
    };
  }

  componentDidMount() {
    if (this.props.params.record) {
      //编辑
      //这个地方不能用传入的数据，需要请求后端的，因为有多语言对象
      this.getValue(this.props.params.record.customEnumerationItemOID);
      this.setState({
        systemInit: this.props.params.systemInit,
      });
    } else if (!this.props.params.record) {
      //新建
      this.setState({
        record: deepCopy(defaultVauleItem),
        common: true,
        customEnumerationItemOID: '',
        data: [],
        deleteUserOIDs: [],
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.params.record && !nextProps.params.hasInit) {
    //   //编辑
    //   //这个地方不能用传入的数据，需要请求后端的，因为有多语言对象
    //   this.getValue(nextProps.params.record.customEnumerationItemOID);
    //   nextProps.params.hasInit = true;
    //   this.setState({
    //     systemInit: nextProps.params.systemInit
    //   })
    // } else if (!nextProps.params.record && !nextProps.params.hasInit) { //新建
    //   nextProps.params.hasInit = true;
    //   this.setState({
    //     record: deepCopy(defaultVauleItem),
    //     common: true,
    //     customEnumerationItemOID: "",
    //     data: [],
    //     deleteUserOIDs: []
    //   }, () => {
    //     this.props.form.resetFields()
    //   })
    // }
  }

  getValue(customEnumerationItemOID) {
    valueListService.getValue(customEnumerationItemOID).then(res => {
      let data = res.data;
      if (data.i18n) {
      } else {
        data.i18n = {};
      }
      this.setState(
        {
          record: data,
          common: data.common,
          customEnumerationItemOID: customEnumerationItemOID,
          deleteUserOIDs: [],
        },
        () => {
          this.props.form.resetFields();
          this.getList();
        }
      );
    });
  }

  //获取员工列表
  getList = () => {
    const { page, pageSize, customEnumerationItemOID } = this.state;
    this.setState({ tableLoading: true });
    valueListService
      .getEmployeeList(page, pageSize, customEnumerationItemOID)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            data: res.data,
            tableLoading: false,
            pagination: {
              total: Number(res.headers['x-total-count']),
              current: this.state.page + 1,
              onChange: this.onChangePager,
            },
          });
        }
      })
      .catch(() => {
        this.setState({ tableLoading: false });
      });
  };

  onChangePager = page => {
    if (page - 1 !== this.state.page)
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
  };
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
        const { customEnumerationItemOID } = this.state;
        values.customEnumerationOID = this.props.params.customEnumerationOID;
        values.userOIDs = this.state.userOIDs;
        //多语言
        values.i18n = this.state.record.i18n;
        values.messageKey = this.state.record.messageKey;
        if (customEnumerationItemOID) {
          //更新
          values.customEnumerationItemOID = customEnumerationItemOID;
          values.id = this.state.id || this.state.record.id;
        }
        if (customEnumerationItemOID) {
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
  //全员是否可见修改
  handleRightChange = checked => {
    this.setState({ common: checked, deleteUserOIDs: [] });
  };

  //添加员工
  addEmployee = userOIDs => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      values.customEnumerationOID = this.props.params.customEnumerationOID;
      values.userOIDs = userOIDs;
      const { customEnumerationItemOID } = this.state;
      if (!customEnumerationItemOID) {
        //新建值内容时首次添加员工
        valueListService.newAddEmployees(values).then(res => {
          if (res.status === 200) {
            message.success(messages('common.operate.success'));
            this.setState(
              {
                id: res.data.id,
                showListSelector: false,
                customEnumerationItemOID: res.data.customEnumerationItemOID,
              },
              () => {
                this.getList();
              }
            );
          }
        });
      } else {
        //新建值内容时非首次添加员工 或 编辑内容时添加员工
        values.customEnumerationItemOID = customEnumerationItemOID;
        valueListService.updateAddEmployees(values).then(res => {
          if (res.status === 200) {
            message.success(messages('common.operate.success'));
            this.setState(
              {
                showListSelector: false,
              },
              () => {
                this.getList();
              }
            );
          }
        });
      }
    });
  };

  //按条件添加员工
  addEmployeesByCondition = values => {
    let userOIDs = [];
    values.result.map(item => {
      userOIDs.push(item.userOID);
    });
    this.addEmployee(userOIDs);
  };

  //删除员工
  deleteEmployees = () => {
    let params = {
      userOIDs: this.state.deleteUserOIDs,
      customEnumerationItemOID: this.state.customEnumerationItemOID,
    };
    this.setState({ deleteLoading: true });
    valueListService
      .deleteEmployees(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({ deleteLoading: false, deleteUserOIDs: [] });
          this.getList();
          message.success(messages('common.delete.success', { name: '' }));
        }
      })
      .catch(e => {
        this.setState({ deleteLoading: false });
      });
  };

  //选择/取消选择某行的回调
  handleSelectRow = (record, selected) => {
    let deleteUserOIDs = this.state.deleteUserOIDs;
    if (selected) {
      deleteUserOIDs.push(record.userOID);
    } else {
      deleteUserOIDs.delete(record.userOID);
    }
    this.setState({ deleteUserOIDs });
  };

  //选择/取消选择所有行的回调
  handleSelectAllRow = (selected, selectedRows, changeRows) => {
    let deleteUserOIDs = this.state.deleteUserOIDs;
    if (selected) {
      changeRows.map(item => {
        deleteUserOIDs.push(item.userOID);
      });
    } else {
      changeRows.map(item => {
        deleteUserOIDs.delete(item.userOID);
      });
    }
    this.setState({ deleteUserOIDs });
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
    let userOIDs = [];
    res.personList.map(item => {
      userOIDs.push(item.userOID);
    });
    this.addEmployee(userOIDs);
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
      deleteUserOIDs,
      showListSelector,
      customEnumerationItemOID,
      systemInit,
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
                  disabled={!!record.id}
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

          <FormItem {...formItemLayout} label={'序号'}>
            {getFieldDecorator('sequenceNumber', {
              initialValue: record ? record.sequenceNumber : '',
              rules: [
                {
                  message: messages('new.cost.center.item.index_tip1'),
                  validator: (rule, value, cb) => {
                    if (value === null || value === undefined || value === '') {
                      cb();
                      return;
                    }
                    //去掉空格
                    value = value.replace(/ /g, '');
                    if (value.split('.').length > 1) {
                      cb(false);
                    } else {
                      cb();
                    }
                  },
                },
              ],
            })(<Input placeholder={messages('common.please.enter')} />)}
            <div className="form-index-tips">
              {/*序号之间尽量保持一定的步长，便于后续调整，如首位10，间隔10*/}
              {messages('new.cost.center.item.index_tip')}
            </div>
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
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
              />
            )}
          </FormItem>
          {this.props.params.isCustom === 'CUSTOM' && (
            <div>
              <div className="common-item-title">{messages('value.list.limit' /*数据权限*/)}</div>
              <FormItem
                {...formItemLayout}
                label={messages('value.list.limit.all.see' /*全员可见*/)}
              >
                {getFieldDecorator('common', {
                  valuePropName: 'checked',
                  initialValue: record ? record.common : true,
                })(
                  <Switch
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                    onChange={this.handleRightChange}
                  />
                )}
              </FormItem>
              {!common && (
                <div>
                  <div className="table-header">
                    <div className="table-header-buttons">
                      <div className="f-left">
                        <SelectDepOrPerson
                          buttonType={'primary'}
                          buttonDisabled={!getFieldsValue().messageKey || !getFieldsValue().value}
                          title={messages(
                            'value.list.add.employee.by.organization' /*按组织添加员工*/
                          )}
                          onlyPerson={true}
                          personResList={['userOID']}
                          onConfirm={this.moveInPerson}
                        />
                      </div>
                      <Button
                        type="primary"
                        disabled={!getFieldsValue().messageKey || !getFieldsValue().value}
                        onClick={() => this.showListSelector(true)}
                      >
                        {messages('value.list.add.employee.by.limit' /*按条件添加员工*/)}
                      </Button>
                      <Button
                        type="primary"
                        disabled={!deleteUserOIDs.length}
                        loading={deleteLoading}
                        onClick={this.deleteEmployees}
                      >
                        {messages('common.delete')}
                      </Button>
                      <div className="tip">
                        {/*填写【值名称】及【编码】后才可添加员工*/}
                        {messages('value.list.add.employee.notice')}
                      </div>
                    </div>
                  </div>
                  <Table
                    rowKey="userOID"
                    dataSource={data}
                    columns={columns}
                    loading={tableLoading}
                    pagination={pagination}
                    scroll={{ x: true }}
                    rowSelection={rowSelection}
                    bordered
                    size="middle"
                  />
                </div>
              )}
            </div>
          )}
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {messages('common.save')}
            </Button>
            <Button onClick={this.onCancel}>{messages('common.cancel')}</Button>
          </div>
        </Form>

        <ListSelector
          visible={showListSelector}
          onCancel={() => this.showListSelector(false)}
          type="add_employee"
          extraParams={{ customEnumerationItemOID: customEnumerationItemOID }}
          onOk={this.addEmployeesByCondition}
        />
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
