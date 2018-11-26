import React from 'react';
import { connect } from 'dva';
import { Form, Input, Switch, Button, Icon, Select, message, Spin, Tooltip, Radio } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import config from 'config';
import httpFetch from 'share/httpFetch';

import contractService from 'containers/contract/contract-type/contract-type-define.service';
import SelectEmployeeGroup from 'widget/Template/select-employee-group';
import 'styles/contract/contract-type/new-contract-type.scss';
import PermissionsAllocation from 'widget/Template/permissions-allocation';

class NewContractType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fetching: false,
      enabled: true,
      setOfBooksOptions: [],
      setOfBooksName: '',
      contractCategory: [],
      data: {},
      formTypeOptions: [],
      radioValue: 'all',
      showSelectEmployeeGroup: false,
      chosenEmployeeIDs: [],
      editTag: false,
      //适用人员
      applyEmployee: 'BASIS_01',
      departmentOrUserGroupIdList: [],
      permissions: {
        type: 'all',
        values: [],
      },
    };
  }

  componentWillMount() {
    this.getSystemValueList(2202).then(res => {
      //合同大类
      let contractCategory = res.data.values;
      this.setState({ contractCategory, enabled: true });
    });
    httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`).then(res => {
      let setOfBooksId = this.state.data.setOfBooksId || this.props.params.setOfBooksId;
      if (this.props.params.record.id) {
        //编辑时，从record中取值
        setOfBooksId = this.props.params.record.setOfBooksId;
      }
      res.data.map(item => {
        if (item.id === setOfBooksId) {
          //账套
          this.setState({
            setOfBooksOptions: res.data,
            setOfBooksName: item.setOfBooksCode + '-' + item.setOfBooksName,
          });
        }
      });
    });
    //this.getFormType()
  }

  componentDidMount() {
    const applyEmployeeType = {
      BASIS_01: 'all',
      BASIS_02: 'department',
      BASIS_03: 'group',
    };
    //编辑
    if (this.props.params.record.id) {
      contractService
        .getContractTypeInfo(this.props.params.setOfBooksId, this.props.params.record.id)
        .then(res => {
          let temp = res.data;
          this.setState({
            data: temp,
            applyEmployee: temp.applyEmployee,
            departmentOrUserGroupIdList: res.data.departmentOrUserGroupIdList
              ? res.data.departmentOrUserGroupIdList
              : [],
            permissions: {
              type: applyEmployeeType[temp.applyEmployee],
              values: res.data.departmentOrUserGroupList
                ? res.data.departmentOrUserGroupList.map(item => {
                    return {
                      label: item.pathOrName,
                      value: item.id,
                      key: item.id,
                    };
                  })
                : [],
            },
          });
        });
    }
  }

  onFormFocus = () => {
    this.getFormType();
  };
  //获取关联表单类型
  getFormType = () => {
    //if(this.state.formTypeOptions.length) return;
    this.setState({ fetching: true });
    let setOfBooksId = this.state.data.setOfBooksId || this.props.params.setOfBooksId;
    if (!setOfBooksId) {
      setOfBooksId = 0;
    }
    httpFetch
      .get(
        `${
          config.baseUrl
        }/api/custom/forms/setOfBooks/my/available/all?formTypeId=801004&setOfBooksId=${setOfBooksId}`
      )
      .then(res => {
        this.setState({ formTypeOptions: res.data, fetching: false });
      });
  };

  //状态改变
  switchChange = status => {
    this.setState({ enabled: status });
  };

  //修改适用人员
  onRadioChange = e => {
    this.setState({ radioValue: e.target.value });
  };

  handleShowModal = () => {
    this.refs.chooserBlur.focus();
    this.setState({
      showSelectEmployeeGroup: this.state.radioValue === 'byGroup',
    });
  };

  handleSelectEmployeeCancel = () => {
    this.setState({ showSelectEmployeeGroup: false });
  };

  handleSelectEmployeeOk = values => {
    let IDs = [];
    values.checkedKeys.map(item => {
      IDs.push(item.value);
    });
    this.setState({ chosenEmployeeIDs: IDs });
    this.handleSelectEmployeeCancel();
  };

  //新建保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        //values.enabled = this.state.enabled;
        this.state.formTypeOptions.map(item => {
          if (item.formOID === values.formOid) {
            values.formName = item.formName;
            values.formType = item.formType;
          }
        });
        values.setOfBooksId = values.setOfBooksId.key;
        //适用人员
        values.applyEmployee = this.state.applyEmployee;
        if (
          this.state.applyEmployee == 'BASIS_02' &&
          !this.state.departmentOrUserGroupIdList.length
        ) {
          message.warning(this.$t('adjust.departmentGroupIdList.warn' /*请至少选择一个部门*/));
          return;
        }
        if (
          this.state.applyEmployee == 'BASIS_03' &&
          !this.state.departmentOrUserGroupIdList.length
        ) {
          message.warning(this.$t('adjust.userGroupIdList.warn' /*请至少选择一个员工组*/));
          return;
        }
        delete values.departmentOrUserGroupIdList;
        values.departmentOrUserGroupIdList =
          this.state.applyEmployee == 'BASIS_01' ? [] : this.state.departmentOrUserGroupIdList;
        let params = [];
        params.push(values);
        this.setState({ loading: true });
        contractService
          .newContractType(values.setOfBooksId, params)
          .then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success(this.$t('common.save.success', { name: '' }));
              this.props.onClose(true);
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(`${this.$t('common.save.filed')}，${e.response.data.message}`);
          });
      }
    });
  };

  //更新保存
  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        //values.enabled = this.state.enabled;
        values.setOfBooksId = values.setOfBooksId.key;
        values.id = this.state.data.id;
        values.versionNumber = this.state.data.versionNumber;
        values.deleted = false;
        values.createdBy = this.state.data.createdBy;
        if (values.formOid === this.state.data.formName) {
          values.formName = this.state.data.formName;
          values.formOid = this.state.data.formOid;
          values.formType = this.state.data.formType;
        }
        this.state.formTypeOptions.map(item => {
          if (item.formOID === values.formOid) {
            values.formName = item.formName;
            values.formType = item.formType;
          }
        });
        //适用人员
        values.applyEmployee = this.state.applyEmployee;
        if (
          this.state.applyEmployee == 'BASIS_02' &&
          !this.state.departmentOrUserGroupIdList.length
        ) {
          message.warning(this.$t('adjust.departmentGroupIdList.warn' /*请至少选择一个部门*/));
          return;
        }
        if (
          this.state.applyEmployee == 'BASIS_03' &&
          !this.state.departmentOrUserGroupIdList.length
        ) {
          message.warning(this.$t('adjust.userGroupIdList.warn' /*请至少选择一个员工组*/));
          return;
        }
        delete values.departmentOrUserGroupIdList;
        values.departmentOrUserGroupIdList =
          this.state.applyEmployee == 'BASIS_01' ? [] : this.state.departmentOrUserGroupIdList;

        let params = [];
        params.push(values);

        this.setState({ loading: true });
        contractService
          .updateContractType(values.setOfBooksId, params)
          .then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success(this.$t('common.save.success', { name: '' }));
              this.props.onClose(true);
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(`${this.$t('common.save.filed')}，${e.response.data.message}`);
          });
      }
    });
  };

  //选择人员或者员工组使用公共组件，监听onChange事件
  onPermissionChange = values => {
    let nowApplyEmployee = '';
    let nowDepartOrUserIdList = [];
    if (values.type == 'all') {
      nowApplyEmployee = 'BASIS_01';
    } else if (values.type == 'department') {
      nowApplyEmployee = 'BASIS_02';
    } else if (values.type == 'group') {
      nowApplyEmployee = 'BASIS_03';
    }
    values.values.map(value => {
      nowDepartOrUserIdList.push(value['value']);
    });
    this.setState({
      applyEmployee: nowApplyEmployee,
      departmentOrUserGroupIdList: nowDepartOrUserIdList,
    });
  };
  //取消
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      loading,
      setOfBooksOptions,
      contractCategory,
      permissions,
      departmentOrUserGroupIdList,
      applyEmployee,
      data,
      formTypeOptions,
      fetching,
      radioValue,
      showSelectEmployeeGroup,
      chosenEmployeeIDs,
      enabled,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    const form_label = (
      <span>
        {this.$t('adjust.formName' /**关联表单类型*/)}
        <Tooltip title={this.$t('contract.re.tips')} overlayStyle={{ width: 220 }}>
          <Icon type="info-circle-o" style={{ margin: '0 3px' }} />
        </Tooltip>
      </span>
    );
    return (
      <div className="new-contract-type">
        <div className="common-item-title">
          {this.$t('pre.payment.essential.information') /*基本信息*/}
        </div>
        <Form onSubmit={data.id ? this.handleUpdate : this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t('adjust.setOfBooks')}>
            {getFieldDecorator('setOfBooksId', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.select'),
                },
              ],
              initialValue: {
                key: this.state.data.setOfBooksId || this.props.params.setOfBooksId,
                label: this.state.setOfBooksName,
              },
            })(
              <Select disabled labelInValue>
                {setOfBooksOptions.map(option => {
                  return (
                    <Option key={option.setOfBooksId} value={option.setOfBooksId}>
                      {option.setOfBooksCode} - {option.setOfBooksName}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('my.contract.category')}>
            {getFieldDecorator('contractCategory', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.select'),
                },
              ],
              initialValue: data.contractCategory,
            })(
              <Select placeholder={this.$t('common.please.select')} disabled={!!data.id}>
                {contractCategory.map(option => {
                  return (
                    <Option key={option.value} value={option.value}>
                      {option.messageKey}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('contract.type.code')}>
            {getFieldDecorator('contractTypeCode', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.select'),
                },
              ],
              initialValue: data.contractTypeCode,
            })(<Input placeholder={this.$t('common.please.select')} disabled={!!data.id} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('contract.type.name')}>
            {getFieldDecorator('contractTypeName', {
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.select'),
                },
              ],
              initialValue: data.contractTypeName,
            })(<Input placeholder={this.$t('common.please.select')} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={form_label}>
            {getFieldDecorator('formOid', {
              initialValue: data.formName,
            })(
              <Select
                allowClear
                onFocus={this.onFormFocus}
                placeholder={this.$t('common.please.select')}
                notFoundContent={
                  fetching ? <Spin size="small" /> : this.$t('my.contract.no.result')
                }
              >
                {formTypeOptions.map(option => {
                  return (
                    <Option key={option.formOID} value={option.formOID}>
                      {option.formName}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('common.column.status')}>
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: !data.id ? true : data.enabled,
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
                onChange={this.switchChange}
              />
            )}
          </FormItem>
          <div className="common-item-title">
            {this.$t('adjust.authority.set' /*付款方式类型*/)}
          </div>
          <FormItem {...formItemLayout} label={this.$t('adjust.applicable.personnel') /*适用人员*/}>
            {getFieldDecorator('departmentOrUserGroupIdList', {
              initialValue: permissions,
            })(
              <PermissionsAllocation
                params={{ setOfBooksId: data.setOfBooksId }}
                onChange={this.onPermissionChange}
              />
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t('common.save')}
            </Button>
            <Button onClick={this.handleCancel}>{this.$t('common.cancel')}</Button>
          </div>
        </Form>
        {
          <SelectEmployeeGroup
            visible={showSelectEmployeeGroup}
            onCancel={this.handleSelectEmployeeCancel}
            onOk={this.handleSelectEmployeeOk}
            selectedData={chosenEmployeeIDs}
          />
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    main: state.main,
  };
}

const wrappedNewContractType = Form.create()(NewContractType);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewContractType);
