import React from 'react'
import { connect } from 'react-redux'
import { Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin, Radio, Tooltip } from 'antd'
import httpFetch from 'share/httpFetch'
import config from 'config'
import Chooser from 'widget/chooser'
import SelectDepartment from './select-department'
import SelectEmployeeGroup from 'widget/Template/select-employee-group'
import PermissionsAllocation from 'widget/Template/permissions-allocation'
import SelectCashTransaction from './select-cash-transaction.js'
import PrePaymentTypeService from './pre-payment-type.service'
import baseService from 'share/base.service'
import SelectRequisitionType from './select-requisition-type'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const type = {
  "BASIS_01": "all",
  "BASIS_02": "department",
  "BASIS_03": "group"
}
const permissionsType = {
  "all": "BASIS_01",
  "department": "BASIS_02",
  "group": "BASIS_03"
}
class NewPrePaymentType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: [],
      nowType: {},
      setOfBooks: [],
      showSelectEmployeeGroup: false,
      allType: "",
      allClass: true,
      needApply: false,
      transactionClassList: [],
      showSelectCashTransaction: false,
      applicationFormBasis: "",
      showSelectDepartment: false,
      employeeList: [],
      selectEmployeeText: "",
      applyEmployee: "BASIS_01",
      requisitionList: [],
      //可关联申请类型
      requisitionTypeIdList: [],
      form: {},
      permissions: {
        type: "all",
        values: []
      },
      showSelectRequisitionType: false
    };
  }
  componentDidMount() {
    this.getSystemValueList(2105).then(res => {
      this.setState({ options: res.data.values });
    });

    if (this.props.params.prePaymentType.id) {
      PrePaymentTypeService.getPrePaymentTypeById(this.props.params.prePaymentType.id).then(res => {
        let temp = res.data.cashPayRequisitionType;
        this.setState({
          nowType: temp,
          allType: temp.allType,
          allClass: temp.allClass,
          needApply: temp.needApply,
          applyEmployee: temp.applyEmployee,
          applicationFormBasis: temp.applicationFormBasis,
          transactionClassList: res.data.transactionClassIdList ? res.data.transactionClassIdList : [],
          employeeList: res.data.departmentOrUserGroupIdList ? res.data.departmentOrUserGroupIdList : [],
          requisitionTypeIdList: res.data.requisitionTypeIdList ? res.data.requisitionTypeIdList : [],
          form: { formOID: temp.formOid, formName: temp.formName, formType: temp.formType },
          permissions: {
            type: type[temp.applyEmployee], values: res.data.departmentOrUserGroupList ? res.data.departmentOrUserGroupList.map(item => {
              return {
                label: item.name,
                key: item.id,
                value: item.id
              }
            }) : []
          }
        }, () => {
          this.setSelectEmployeeText();
          this.getRequisitionList(this.state.nowType.setOfBookId);
        })
      })
    } else {
      this.setSelectEmployeeText();
      this.getRequisitionList(this.state.nowType.setOfBookId);
    }

    this.getSetOfBookList();
  }

  onFormFocus = () => {
    if (!(this.state.requisitionList && this.state.requisitionList.length)) {
      this.getRequisitionList(this.state.nowType.setOfBookId);
    }
  }

  getRequisitionList = (setOfBookId) => {
    PrePaymentTypeService.getRequisitionList(setOfBookId).then(res => {
      this.setState({ requisitionList: res.data });
    })
  }

  //获取账套列表
  getSetOfBookList = () => {
    baseService.getSetOfBooksByTenant().then(res => {
      let list = [];
      res.data.map(item => {
        list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
      })
      this.setState({ setOfBooks: list });
    })
  }

  onCancel = () => {
    this.props.close();
    // this.props.form.resetFields();
    // this.setState({
    //   needApply:false,
    //   applicationFormBasis: "",
    //   allType: "",
    //   requisitionTypeIdList: [],
    //   allClass: true,
    //   transactionClassList: []
    // });
  };

  handleSave = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {

      if (!err) {

        values.needApply = this.state.needApply;

        values = {
          ...this.state.nowType,
          ...values
        };

        if (!values.needApply) {
          values.allType = null;
          values.applicationFormBasis = null;
        }
        else {
          values.allType = this.state.allType;
          values.applicationFormBasis = this.state.applicationFormBasis;
        }

        values.allClass = this.state.allClass;
        values.applyEmployee = permissionsType[values.selectEmployeeList.type];

        let form = this.state.requisitionList.find(o => o.formOID == values.formOID);

        if (form) {
          values.formOid = form.formOID;
          values.formName = form.formName;
          values.formType = form.formType;
        }
        else {
          values.formOid = undefined;
          values.formName = undefined;
          values.formType = undefined;
        }

        delete values.form;
        delete values.formOID;

        if (values.id) {
          delete values.typeCode;
        }

        if (!this.state.allClass && !this.state.transactionClassList.length) {
          message.warning(this.$t({ id: 'pre.payment.transactionClassList.warn' }/*请选择至少一个现金事务分类*/));
          return;
        }

        if (values.applyEmployee == "BASIS_02" && !values.selectEmployeeList.values.length) {
          message.warning(this.$t({ id: 'pre.payment.selectDepartmentList.warn' }/*请选择至少一个部门*/));
          return;
        } else if (values.applyEmployee == "BASIS_03" && !values.selectEmployeeList.values.length) {
          message.warning(this.$t({ id: 'pre.payment.selectEmployeeList.warn' }/*请选择至少一个人员组*/));
          return;
        }
        if (this.state.allType == 'BASIS_02' && !this.state.requisitionTypeIdList.length) {
          message.warning(this.$t({ id: 'pre.payment.requisitionTypeIdList.warn' }/*请选择至少一个可关联申请类型*/));
          return;
        }

        let params = {
          cashPayRequisitionType: values,
          requisitionTypeIdList: this.state.allType == "BASIS_02" ? this.state.requisitionTypeIdList : [],
          transactionClassIdList: this.state.allClass ? [] : this.state.transactionClassList,
          departmentOrUserGroupIdList: values.applyEmployee != "BASIS_01" ? values.selectEmployeeList.values.map(o => o.value) : []
        };

        this.setState({ loading: true });
        // PrePaymentTypeService.updatePrePaymentType(this.state.nowType.id,params).then((res) => {
        httpFetch[this.state.nowType.id ? "put" : "post"](`${config.prePaymentUrl}/api/cash/pay/requisition/types`, params).then((res) => {
          this.setState({ loading: false });
          message.success(this.$t({ id: 'common.save.success' }, { name: values.typeName }));  //保存成功
          this.props.close(true);

          // this.setState({ nowType: {}, needApply: false, applicationFormBasis: "" });
          // this.props.form.resetFields();
        }).catch((e) => {
          if (e.response) {
            message.error(this.$t({ id: 'pre.payment.save.fail' }/*保存失败*/) + `${e.response.data.message}`);
          }
          this.setState({ loading: false });
        })
      }
    });
  };

  handleListOk = (values) => {
    let text = '';
    if (this.state.applyEmployee == "BASIS_02") {
      text = `已选择${values.checkedKeys.length}个部门`;
    }
    else if (this.state.applyEmployee == "BASIS_03") {
      text = `已选择${values.checkedKeys.length}个人员组`;
    }
    this.setState({ showSelectEmployeeGroup: false, showSelectDepartment: false, employeeList: values.checkedKeys, selectEmployeeText: text });
  }

  setSelectEmployeeText = () => {
    let text = '';
    if (this.state.applyEmployee == "BASIS_02") {
      text = `已选择${this.state.employeeList.length}个部门`;
    }
    else if (this.state.applyEmployee == "BASIS_03") {
      text = `已选择${this.state.employeeList.length}个人员组`;
    }
    this.setState({ selectEmployeeText: text });
  }

  onSelectCashTransactionOk = (values) => {
    this.setState({ showSelectCashTransaction: false, transactionClassList: values.result });
  }

  handleListCancel = () => {
    this.setState({ showSelectEmployeeGroup: false, showSelectDepartment: false, showSelectCashTransaction: false });
  }

  showSelectEmployeeGroup = () => {
    this.refs.selectEmployeeGroup.blur();
    if (this.state.applyEmployee == "BASIS_03") {
      this.setState({ showSelectEmployeeGroup: true });
    }
    else if (this.state.applyEmployee == "BASIS_02") {
      this.setState({ showSelectDepartment: true });
    }
  }

  showSelectCashTransaction = () => {
    this.refs.selectCashTransaction.blur();

    let value = this.props.form.getFieldValue("setOfBookId");

    let model = { ...this.state.nowType };

    model.setOfBookId = value;

    this.setState({ showSelectCashTransaction: true, nowType: model });
  }

  onAllTypeChange = (e) => {
    this.setState({ allType: e.target.value, requisitionTypeIdList: [] });
    // console.log(this.state.allType + '.....onAllTypeChange');
  }

  onAllClassChange = (e) => {

    this.setState({ allClass: e.target.value, transactionClassList: [] });
  }

  onApplyEmployee = (e) => {
    this.setState({ applyEmployee: e.target.value, employeeList: [] }, () => {
      this.setSelectEmployeeText();
    });
  }

  onApplicationFormBasisChange = (e) => {
    this.setState({ applicationFormBasis: e.target.value });
  }

  onAllClassListChange = (values) => {
    this.setState({ transactionClassList: values });
  }

  onNeedApply = (e) => {

    let allType = e.target.value ? "BASIS_01" : "";

    this.setState({ needApply: e.target.value, allType, applicationFormBasis: "" });
    if (e.target.value) {
      this.setState({ applicationFormBasis: "BASIS_01" });
    }
  };

  showSelectRequisitionType = (flag) => {
    this.refs.SelectRequisitionType.blur();
    let model = { ...this.state.nowType };
    model.setOfBookId = this.props.form.getFieldValue('setOfBookId');
    this.setState({ showSelectRequisitionType: flag, nowType: model });
  }

  onSelectReqTypeCancel = () => {
    this.setState({ showSelectRequisitionType: false });
  }
  onSelectReqTypeOk = (values) => {
    this.setState({ showSelectRequisitionType: false, requisitionTypeIdList: values.record });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      nowType,
      options,
      setOfBooks,
      showSelectEmployeeGroup,
      allClass,
      allType,
      transactionClassList,
      needApply,
      showSelectCashTransaction,
      applicationFormBasis,
      applyEmployee,
      showSelectDepartment,
      selectEmployeeText,
      requisitionList,
      showSelectRequisitionType,
      requisitionTypeIdList
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div>
        <Form onSubmit={this.handleSave}>
          <div className="common-item-title">{this.$t({ id: 'pre.payment.essential.information' })/*基本信息*/}</div>
          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.setOfBookName' }/*账套*/)}>
            {getFieldDecorator('setOfBookId', {
              rules: [{
                required: true
              }],
              initialValue: nowType.setOfBookId
            })(
              <Select disabled placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */}
                notFoundContent={<Spin size="small" />} >
                {setOfBooks.map((option) => {
                  return <Option key={option.value}>{option.label}</Option>
                })}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.typeCode' }/*预付款单类型代码*/)}>
            {getFieldDecorator('typeCode', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.enter' }),  //请输入
              }],
              initialValue: nowType.typeCode
            })(
              <Input disabled={!!nowType.id} placeholder={this.$t({ id: 'common.please.enter' })/* 请输入 */} />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.typeName' }/*预付款单类型名称*/)}>
            {getFieldDecorator('typeName', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.enter' }),  //请输入
              }],
              initialValue: nowType.typeName
            })(
              <Input placeholder={this.$t({ id: 'common.please.enter' })/* 请输入 */} />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={(
            <span>
              {this.$t({ id: 'pre.payment.formName' }/*关联表单类型*/)}&nbsp;
              <Tooltip title="关联表单设计器中的单据类型，用来使用工作流。">
                <Icon type="info-circle-o" />
              </Tooltip>
            </span>
          )}>
            {getFieldDecorator('formOID', {
              rules: [{
                required: false
              }],
              initialValue: nowType.formOid
            })(
              <Select allowClear onFocus={this.onFormFocus}>
                {
                  requisitionList.map(item => {
                    return <Option key={item.formOID}>{item.formName}</Option>
                  })
                }
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={this.$t({ id: 'common.column.status' })/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: !nowType.id ? true : nowType.enabled,
              valuePropName: 'checked'
            })(
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? this.$t({ id: "common.status.enable" }) : this.$t({ id: "common.status.disable" })}
          </FormItem>

          <div className="common-item-title">{this.$t({ id: 'pre.payment.paymentMethodCategoryName' }/*付款方式类型*/)}</div>
          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.paymentMethodCategoryName' }/*付款方式类型*/)}>
            {getFieldDecorator('paymentMethodCategory', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.select' }),  //请选择
              }],
              initialValue: nowType.paymentMethodCategory
            })(
              <Select placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */}>
                {options.map(option => {
                  return <Option key={option.value}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>

          <div className="common-item-title">{this.$t({ id: 'pre.payment.association.requisition.set' })/* 关联申请设置 */}</div>
          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.whether.associate.requisition' })/* 是否关联申请 */}>
            <RadioGroup value={needApply} onChange={this.onNeedApply}>
              <RadioButton value={true}>{this.$t({ id: 'pre.payment.requisition.associate' })/* 关联 */}</RadioButton>
              <RadioButton value={false}>{this.$t({ id: 'pre.payment.requisition.unassociate' })/* 不关联 */}</RadioButton>
            </RadioGroup>
          </FormItem>

          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.association.basis' })/* 关联依据 */}>
            <RadioGroup value={applicationFormBasis} disabled={!needApply} onChange={this.onApplicationFormBasisChange}>
              <Radio style={radioStyle} value="BASIS_01">预付款单头公司+头部门=申请单头公司+头部门</Radio>
              <Radio style={radioStyle} value="BASIS_02">预付款单头申请人=申请单头申请人</Radio>
            </RadioGroup>
          </FormItem>

          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.requisition.type.choose' })/* 可关联申请类型 */}>
            <div>
              <RadioGroup value={allType} disabled={!needApply} onChange={this.onAllTypeChange}>
                <Radio value="BASIS_01">{this.$t({ id: 'pre.payment.all.types' })/* 全部类型 */}</Radio>
                <Radio value="BASIS_02">{this.$t({ id: 'pre.payment.partial.types' })/* 部分类型 */}</Radio>
              </RadioGroup>

              <Select ref='SelectRequisitionType' onFocus={() => this.showSelectRequisitionType(true)} disabled={!needApply || allType == 'BASIS_01'} value={(allType == 'BASIS_02') ? this.$t({ id: 'pre.payment.requisition.type.selected' }, { total: `${requisitionTypeIdList.length}` }/* 已选择了多少个类型 */) : this.$t({ id: 'pre.payment.all.types' }/* 全部类型 */)} placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */}>
              </Select>
            </div>
          </FormItem>

          <div className="common-item-title">{this.$t({ id: 'pre.payment.cash.transaction.class.set' })/* 现金事务分类设置 */}</div>
          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.available.cash.transaction.class' })/* 可用现金事务分类 */}>
            <div>
              <RadioGroup value={allClass} onChange={this.onAllClassChange}>
                <Radio value={true}>{this.$t({ id: 'pre.payment.all.types' })/* 全部类型 */}</Radio>
                <Radio value={false}>{this.$t({ id: 'pre.payment.partial.types' })/* 部分类型 */}</Radio>
              </RadioGroup>

              <Select ref="selectCashTransaction" onFocus={this.showSelectCashTransaction} onChange={this.onAllClassListChange} disabled={allClass} value={allClass ? this.$t({ id: 'pre.payment.all.types' })/* 全部类型 */ : this.$t({ id: 'pre.payment.requisition.type.selected' }, { total: `${transactionClassList.length}` }/* 已选择了多少个类型 */)} placeholder={this.$t({ id: 'common.please.select' })/* 请选择 */}>
              </Select>
            </div>
          </FormItem>

          <div className="common-item-title">{this.$t({ id: 'pre.payment.authority.set' })/* 权限设置 */}</div>

          <FormItem {...formItemLayout} label={this.$t({ id: 'pre.payment.applicable.personnel' })/* 适用人员 */}>
            {getFieldDecorator('selectEmployeeList', {
              initialValue: this.state.permissions
            })(
              <PermissionsAllocation params={{ setOfBooksId: nowType.setOfBookId }} ></PermissionsAllocation>
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({ id: 'common.save' })/* 保存 */}</Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })/* 取消 */}</Button>
          </div>
        </Form>

        <SelectCashTransaction visible={showSelectCashTransaction}
          onCancel={this.handleListCancel}
          onOk={this.onSelectCashTransactionOk}
          single={true}
          params={{ setOfBooksId: nowType.setOfBookId, sobPayReqTypeId: nowType.id }}
          selectedData={[...transactionClassList]}
        />

        <SelectRequisitionType visible={showSelectRequisitionType}
          params={{ setOfBookId: nowType.setOfBookId, payRequisitionTypeId: nowType.id }}
          onCancel={this.onSelectReqTypeCancel}
          onOk={this.onSelectReqTypeOk}
          selectedData={[...requisitionTypeIdList]} />

      </div >
    )
  }

}

function mapStateToProps(state) {
  return {
    company: state.login.company
  }
}
const WrappedNewPrePaymentType = Form.create()(NewPrePaymentType);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewPrePaymentType);
