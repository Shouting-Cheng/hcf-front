import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin, Radio, Tooltip, Checkbox } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import baseService from 'share/base.service'
import expAdjustService from 'containers/expense-adjust/exp-adjust-type/exp-adjust-type.service'
import SelectExpenseType from 'containers/expense-adjust/exp-adjust-type/select-expense-type'
import SelectDimension from 'containers/expense-adjust/exp-adjust-type/select-dimension'
import PermissionsAllocation from 'widget/Template/permissions-allocation'

class NewExpAdjustType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            form: {},
            nowType: {},
            //账套列表
            setOfBooks: [],
            //账套中的租户id字段
            tenantId: this.props.company.tenantId,
            //关联表单类型列表
            requisitionList: [],
            //调整类型列表
            adjustTypeCategoryList: [{ value: '1001', label: this.$t('exp.adjust.exp.detail') }, { value: '1002', label: this.$t('exp.adjust.exp.add') }],
            //预算置灰勾选
            accountFlagDisabled: true,
            //可选费用类型
            allExpense: true,
            expenseIdList: [],
            showSelectExpenseType: false,
            //可选维度
            allDimension: true,
            dimensionIdList: [],
            showSelectDimension: false,
            //适用人员
            applyEmployee: '1001',
            departmentOrUserGroupIdList: [],
            permissions: {
                type: 'all',
                values: []
            }
        }
    }
    //render之前执行的生命周期函数
    componentDidMount() {
        this.getSetOfBooksList();
      const applyEmployeeType = {
        '1001': 'all',
        '1002': 'department',
        '1003': 'group'
      };

      if (this.props.params.expAdjustType.id) {
        expAdjustService.getExpenseAdjustTypeById(this.props.params.expAdjustType.id).then(res => {
          let temp = res.data.expenseAdjustType;
          this.setState({
              accountFlagDisabled: temp.adjustTypeCategory == '1001' ? false : true,
              nowType: temp,
              allExpense: temp.allExpense,
              allDimension: temp.allDimension,
              applyEmployee: temp.applyEmployee,
              expenseIdList: res.data.returnExpenseIdList ? res.data.returnExpenseIdList : [],
              dimensionIdList: res.data.returnDimensionIdList ? res.data.returnDimensionIdList : [],
              departmentOrUserGroupIdList: res.data.departmentOrUserGroupIdList ? res.data.departmentOrUserGroupIdList : [],
              form: { formOID: temp.formoid, formName: temp.formName, formType: temp.formType },
              permissions: {
                type: applyEmployeeType[temp.applyEmployee],
                values: res.data.departmentOrUserGroupList ? res.data.departmentOrUserGroupList.map(item => {
                  return {
                    label: item.pathOrName,
                    value: item.id,
                    key: item.id
                  }
                }) : []
              }
            },
            () => {
              this.getRequisitionList(this.state.nowType.setOfBooksId);
            }
          )
        });
      } else {
        this.setState({ nowType: this.props.params.expAdjustType });
      }
    }
    //组件接受props参数之前执行的生命周期函数
/*    componentWillReceiveProps(nextProps) {
        const applyEmployeeType = {
            '1001': 'all',
            '1002': 'department',
            '1003': 'group'
        };
        if (!nextProps.params.flag && this.props.params.flag) {
            this.props.form.resetFields();
            this.setState({
                allExpense: true,
                allDimension: true,
                applyEmployee: '1001',
                permissions: {
                    type: 'all',
                    values: []
                }
            });
        }
        if (nextProps.params.flag && !this.props.params.flag && nextProps.params.expAdjustType.id) {
            expAdjustService.getExpenseAdjustTypeById(nextProps.params.expAdjustType.id).then(res => {
                let temp = res.data.expenseAdjustType;
                this.setState({
                    accountFlagDisabled: temp.adjustTypeCategory == '1001' ? false : true,
                    nowType: temp,
                    allExpense: temp.allExpense,
                    allDimension: temp.allDimension,
                    applyEmployee: temp.applyEmployee,
                    expenseIdList: res.data.returnExpenseIdList ? res.data.returnExpenseIdList : [],
                    dimensionIdList: res.data.returnDimensionIdList ? res.data.returnDimensionIdList : [],
                    departmentOrUserGroupIdList: res.data.departmentOrUserGroupIdList ? res.data.departmentOrUserGroupIdList : [],
                    form: { formOID: temp.formoid, formName: temp.formName, formType: temp.formType },
                    permissions: {
                        type: applyEmployeeType[temp.applyEmployee],
                        values: res.data.departmentOrUserGroupList ? res.data.departmentOrUserGroupList.map(item => {
                            return {
                                label: item.pathOrName,
                                value: item.id,
                                key: item.id
                            }
                        }) : []
                    }
                },
                    () => {
                        this.getRequisitionList(this.state.nowType.setOfBooksId);
                    }
                )
            });
        } else {
            this.setState({ nowType: nextProps.params.expAdjustType });
        }
    }*/
    //获取账套列表
    getSetOfBooksList = () => {
        baseService.getSetOfBooksByTenant().then((res) => {
            let list = [];
            res.data.map(item => {
                list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
            });
            this.setState({ setOfBooks: list });
        })
    }
    //focus关联表单类型事件
    onFormFocus = () => {
        if (!(this.state.requisitionList && this.state.requisitionList.length)) {
            this.getRequisitionList(this.state.nowType.setOfBooksId);
        }
    }
    //获取关联表单类型列表
    getRequisitionList = (setOfBooksId) => {
        return expAdjustService.getRequisitionList(setOfBooksId).then(res => {
            this.setState({ requisitionList: res.data });
        })
    };
    //调整类型变化事件影像预算变化
    onAdjustTypeChange = (values) => {
        if (values == '1001') {
            this.props.form.setFieldsValue({ accountFlag: true });
            this.setState({ accountFlagDisabled: false });
        } else if (values == '1002') {
            this.props.form.setFieldsValue({ accountFlag: false });
            this.setState({ accountFlagDisabled: true })
        }


    }
    //可选费用类型全部or部分变化事件
    onExpenseTypeChange = (e) => {
        this.setState({ allExpense: e.target.value, expenseIdList: [] })
    }
    //可选维度全部or部分变化事件
    onDimensionChange = (e) => {
        this.setState({ allDimension: e.target.value, dimensionIdList: [] })
    }
    //点击保存触发的事件
    handleSave = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values = {
                    ...this.state.nowType,
                    ...values
                };

                //租户id
                values.tenantId = this.state.tenantId;
                //关联表单类型
                let form = this.state.requisitionList.find(o => o.formOID === values.formOid);
                if (form) {
                    values.formOid = form.formOID;
                    values.formName = form.formName;
                    values.formType = form.formType;
                } else {
                    values.formOid = undefined;
                    values.formName = undefined;
                    values.formType = undefined;
                }
                //可选费用类型
                values.allExpense = this.state.allExpense;
                //可选维度
                values.allDimension = this.state.allDimension;
                //适用人员
                values.applyEmployee = this.state.applyEmployee;
                if (!this.state.allExpense && !this.state.expenseIdList.length) {
                    message.warning(this.$t({ id: 'adjust.expenseIdList.warn' }/*请至少选择一个费用类型*/));
                    return;
                }
                if (!this.state.allDimension && !this.state.dimensionIdList.length) {
                    message.warning(this.$t({ id: 'adjust.dimensionIdList.warn' }/*请至少选择一个维度*/));
                    return;
                }
                if (this.state.applyEmployee == '1002' && !this.state.departmentOrUserGroupIdList.length) {
                    message.warning(this.$t({ id: 'adjust.departmentGroupIdList.warn' }/*请至少选择一个部门*/));
                    return;
                }
                if (this.state.applyEmployee == '1003' && !this.state.departmentOrUserGroupIdList.length) {
                    message.warning(this.$t({ id: 'adjust.userGroupIdList.warn' }/*请至少选择一个员工组*/));
                    return;
                }
                delete values.departmentOrUserGroupIdList;
                let params = {
                    expenseAdjustType: values,
                    expenseIdList: this.state.allExpense ? [] : this.state.expenseIdList,
                    dimensionIdList: this.state.allDimension ? [] : this.state.dimensionIdList,
                    departmentOrUserGroupIdList: this.state.applyEmployee == '1001' ? [] : this.state.departmentOrUserGroupIdList
                }
                this.setState({ loading: true });
                // httpFetch[this.state.nowType.id ? 'put' : 'post'](`${config.expAdjustUrl}/api/expense/adjust/types`, params).then(res => {
                expAdjustService.saveExpAdjustTypeLineData(this.state.nowType.id ? 'put' : 'post', params).then(res => {
                    this.setState({ loading: false });
                    message.success(this.$t({ id: 'common.save.success' }, { name: values.expAdjustTypeName }));
                    this.props.onClose(true);
                }).catch((e) => {
                    if (e.response) {
                        message.error(this.$t({ id: 'adjust.save.fail' }/*保存失败*/) + `${e.response.data.message}`);
                    }
                    this.setState({ loading: false });
                })
            }
        });

    };
    //显示费用类型显示页面
    showSelectExpenseType = (open) => {
      if (open) {
        this.refs.SelectExpenseType.blur();
        let setOfBooksId = this.props.form.getFieldValue('setOfBooksId');
        let model = { ...this.state.nowType };
        model.setOfBooksId = setOfBooksId;
        this.setState({ showSelectExpenseType: true, nowType: model });
      }
    };
    //费用类型弹框确定按钮事件
    onSelectExpenseTypeOk = (values) => {
        this.setState({ showSelectExpenseType: false, expenseIdList: values.result });
    };
    //费用类型弹框取消按钮事件
    onSelectExpenseCancel = () => {
        this.setState({ showSelectExpenseType: false });
    };
    //显示维度选择窗口
    showSelectDimension = (open) => {
      if (open) {
        this.refs.SelectDimension.blur();
        let setOfBooksId = this.props.form.getFieldValue('setOfBooksId');
        let model = { ...this.state.nowType };
        model.setOfBooksId = setOfBooksId;
        this.setState({ showSelectDimension: true, nowType: model });
      }
    };
    //选择维度弹框取消按钮事件
    onSelectDimensionCancel = () => {
        this.setState({ showSelectDimension: false });
    };
    //选择维度弹框确定时间
    onSelectDimensionOk = (values) => {
        this.setState({ showSelectDimension: false, dimensionIdList: values.result });
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
    //取消（保存旁边的按钮）
    onSliderFormCancel = () => {
        this.props.onClose();
    }
    //render渲染事件
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 10, offset: 1 }
        };
        const { nowType,
            setOfBooks,
            requisitionList,
            adjustTypeCategoryList,
            accountFlagDisabled,
            allExpense,
            expenseIdList,
            allDimension,
            applyEmployee,
            dimensionIdList,
            departmentOrUserGroupIdList,
            showSelectExpenseType,
            showSelectDimension,
            permissions } = this.state;
        return (
            <div>
                <Form onSubmit={this.handleSave}>
                    <div className="common-item-title">{this.$t({ id: 'adjust.essential.information' })/*基本信息*/}</div>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.setOfBooks' }/*账套*/)}>
                        {getFieldDecorator('setOfBooksId', {
                            rules: [{ required: true }],
                            initialValue: nowType.setOfBooksId
                        })
                            (<Select disabled placeholder={this.$t({ id: 'common.please.select' })}
                                notFoundContent={<Spin size="small"></Spin>}>
                                {setOfBooks.map((option) => {
                                    return <Option key={option.value}>{option.label}</Option>
                                })}
                            </Select>)
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.expAdjustTypeCode' }/**单据类型代码*/)}>
                        {getFieldDecorator('expAdjustTypeCode', {
                            rules: [{
                                required: true,
                                message: this.$t({ id: 'common.please.enter' })
                            }],
                            initialValue: nowType.expAdjustTypeCode
                        })
                            (<Input disabled={Boolean(nowType.id)} placeholder={this.$t({ id: 'common.please.enter' })} />)
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.expAdjustTypeName' }/**单据类型名称*/)}>
                        {getFieldDecorator('expAdjustTypeName', {
                            rules: [{
                                required: true,
                                message: this.$t({ id: 'common.please.enter' })
                            }],
                            initialValue: nowType.expAdjustTypeName
                        })
                            (<Input placeholder={this.$t({ id: 'common.please.enter' })} />)
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.formName' }/**关联表单类型*/)}>
                        {getFieldDecorator('formOid', {
                            rules: [{
                                required: true,
                                message: this.$t({ id: 'common.please.select' })
                            }],
                            initialValue: nowType.formOid
                        })
                            (<Select allowClear onFocus={requisitionList.length===0 ? this.onFormFocus : ()=>{}} placeholder={this.$t({ id: 'common.please.select' })}>
                                {
                                    requisitionList.map(item => {
                                        return <Option key={item.formOID}>{item.formName}</Option>
                                    })
                                }
                            </Select>)
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.enabled' })/*状态*/}>
                    {getFieldDecorator('enabled', {
                      initialValue: !nowType.id ? true : nowType.enabled,
                      valuePropName: 'checked'
                    })
                    (<Switch checkedChildren={<Icon type='check' />} unCheckedChildren={<Icon type='cross' />}></Switch>)
                    }&nbsp;&nbsp;&nbsp;
                    {this.props.form.getFieldValue('enabled') ? this.$t({ id: 'common.status.enable' }) : this.$t({ id: 'common.status.disable' })}
                  </FormItem>
                    <div className="common-item-title">{this.$t({ id: 'adjust.expense.adjust.set' })/*费用调整设置*/}</div>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.adjustTypeCategory' }/**调整类型*/)}>
                        {getFieldDecorator('adjustTypeCategory', {
                            rules: [{
                                required: true,
                                message: this.$t({ id: 'common.please.select' })
                            }],
                            initialValue: nowType.adjustTypeCategory
                        })
                            (<Select placeholder={this.$t({ id: 'common.please.select' })} onChange={this.onAdjustTypeChange}>
                                {
                                    adjustTypeCategoryList.map(item => {
                                        return <Option key={item.value}>{item.label}</Option>
                                    })
                                }
                            </Select>)
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.budgetFlag' }/**预算管控*/)}>
                        {getFieldDecorator('budgetFlag', {
                            initialValue: !nowType.id ? true : nowType.budgetFlag,
                            valuePropName: 'checked'
                        })
                            (<Checkbox></Checkbox>)
                        }
                    </FormItem>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.accountFlag' }/**核算*/)}>
                        {getFieldDecorator('accountFlag', {
                            valuePropName: "checked",
                            initialValue: !nowType.id ? false : nowType.accountFlag
                        })
                            (<Checkbox disabled={accountFlagDisabled}></Checkbox>)
                        }
                    </FormItem>
                    <div className="common-item-title">{this.$t({ id: 'adjust.expense.type.set' })/*费用类型设置*/}</div>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.optional.expense.type' })/*可选费用类型*/}>
                        <div>
                            <RadioGroup value={allExpense} onChange={this.onExpenseTypeChange}>
                                <Radio value={true}>{this.$t({ id: 'adjust.all.type' })/*全部类型*/}</Radio>
                                <Radio value={false}>{this.$t({ id: 'adjust.partial.type' })/*部分类型*/}</Radio>
                            </RadioGroup>
                            <Select ref='SelectExpenseType' onDropdownVisibleChange={this.showSelectExpenseType} placeholder={this.$t({ id: 'common.please.select' })} disabled={allExpense} value={allExpense ? this.$t({ id: 'adjust.all.type' }/*全部类型*/) : this.$t({ id: 'adjust.expense.type.selected' }, { total: `${expenseIdList.length}` }/*已选择了多少个类型*/)}></Select>
                        </div>
                    </FormItem>
                    <div className="common-item-title">{this.$t({ id: 'adjust.dimension.set' })/*维度设置*/}</div>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.optional.dimension' })/*可选维度*/}>
                        <div>
                            <RadioGroup value={allDimension} onChange={this.onDimensionChange}>
                                <Radio value={true}>{this.$t({ id: 'adjust.all.dimension' })/*全部维度*/}</Radio>
                                <Radio value={false}>{this.$t({ id: 'adjust.partial.dimension' })/*部分维度*/}</Radio>
                            </RadioGroup>
                            <Select ref='SelectDimension' onDropdownVisibleChange={this.showSelectDimension} placeholder={this.$t({ id: 'common.please.select' })} disabled={allDimension} value={allDimension ? this.$t({ id: 'adjust.all.dimension' }/*全部维度*/) : this.$t({ id: 'adjust.dimension.selected' }, { total: `${dimensionIdList.length}` }/*已选择了个维度*/)}></Select>
                        </div>
                    </FormItem>
                    <div className="common-item-title">{this.$t({ id: 'adjust.authority.set' })/*权限设置*/}</div>
                    <FormItem {...formItemLayout} label={this.$t({ id: 'adjust.applicable.personnel' })/*适用人员*/}>
                        {getFieldDecorator('departmentOrUserGroupIdList', {
                            initialValue: permissions
                        })
                            (
                            <PermissionsAllocation params={{ setOfBooksId: nowType.setOfBooksId }} onChange={this.onPermissionChange}></PermissionsAllocation>
                            )}
                    </FormItem>
                    <div className="slide-footer">
                        <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({ id: 'common.save' })}</Button>
                        <Button onClick={this.onSliderFormCancel}>{this.$t({ id: 'common.cancel' })}</Button>
                    </div>
                </Form>
                <SelectExpenseType visible={showSelectExpenseType}
                    params={{ setOfBooksId: nowType.setOfBooksId,id:nowType.id }}
                    selectedData={[...expenseIdList]}
                    onOk={this.onSelectExpenseTypeOk}
                    onCancel={this.onSelectExpenseCancel} />
                <SelectDimension visible={showSelectDimension}
                    onCancel={this.onSelectDimensionCancel}
                    params={{ setOfBooksId: nowType.setOfBooksId,id: nowType.id }}
                    selectedData={[...dimensionIdList]}
                    onOk={this.onSelectDimensionOk} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        company: state.user.company
    }
}
const WrappedNewExpAdjustType = Form.create()(NewExpAdjustType);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewExpAdjustType);
