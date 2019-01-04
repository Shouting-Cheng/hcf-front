import React from 'react';
import { connect } from 'react-redux';
import { Form, Switch, Icon, Input, Select, Button, Spin, Radio, Tooltip, message } from 'antd';
import PermissionsAllocation from 'widget/Template/permissions-allocation';
import CustomChooser from "components/Template/custom-chooser"

import baseService from 'share/base.service';
import service from "./service"

const FormItem = Form.Item;
const Option = Select.Option;

const type = {
  101: 'all',
  102: 'department',
  103: 'group',
};
const permissionsType = {
  all: '101',
  department: '102',
  group: '103'
};
class NewApplicationType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      loading: !!props.params.id,
      setOfBooks: [],
      formList: [],
      record: {}
    };
  }
  componentDidMount() {
    if (!this.props.params.id) {
      this.getFormList();
    }
    this.getInfoById();
  }

  //获取详情
  getInfoById = () => {
    if (this.props.params.id) {
      service.getInfoById(this.props.params.id).then(res => {

        let record = { ...res.data.applicationType };

        record.allFlag || (record.applicationType = {
          radioValue: record.allFlag,
          chooserValue: res.data.expenseTypeInfos.map(o => ({ id: o.expenseTypeId, name: o.expenseTypeName }))
        });

        record.applyEmployee != "101" && (record.userInfos = {
          type: type[record.applyEmployee],
          values: res.data.userInfos.map(o => ({ key: o.userTypeId, value: o.userTypeId, label: o.pathOrName }))
        });

        this.setState({ loading: false, record }, () => {
          this.getFormList(res.data.setOfBooksId);
        });
      }).catch(err => {
        message.error(err.response.data.message);
      })
    }
  }

  //获取可关联表单类型
  getFormList = (setOfBooksId = this.props.params.setOfBooksId) => {
    service.getFormList(setOfBooksId).then(res => {
      this.setState({ formList: res.data });
    }).catch(err => {
      message.error(err.response.data.message);
    })
  }

  //关联合同变化
  associateContractChange = (e) => {
    if (e.target.value) {
      this.props.form.setFieldsValue({ requireInput: true })
    } else {
      this.props.form.setFieldsValue({ requireInput: false })
    }
  }

  onCancel = () => {
    this.props.close && this.props.close();
  };

  handleSave = e => {
    e.preventDefault();

    let { record } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;

      if (!values.applicationType.radioValue && values.applicationType.chooserValue.length <= 0) {
        message.error("请至少选择一条申请类型！");
        return;
      }

      this.setState({ saveLoading: true });
      values.requireInput = values.associateContract ? values.requireInput : false;
      values.allFlag = values.applicationType.radioValue;
      values.applyEmployee = permissionsType[values.userInfos.type];

      let userInfos = values.userInfos.values.map(o => ({ userTypeId: o.value }));
      let expenseTypeInfos = values.applicationType.chooserValue.map(o => ({ expenseTypeId: o.id }));

      delete values.userInfos;
      delete values.applicationType;

      values = {
        applicationType: { ...values },
        userInfos,
        expenseTypeInfos
      };

      let method = service.addApplicationType;

      if (record.id) {
        method = service.updateApplicationType;
        values.applicationType = { id: record.id, versionNumber: record.record, ...values.applicationType };
      }

      method(values).then(res => {
        this.setState({ saveLoading: false });
        message.success(record.id ? "更新成功！" : "新增成功！");
        this.props.close && this.props.close(true);
      }).catch(err => {
        this.setState({ saveLoading: false });
        message.error(err.response.data.message);
      });

    });
  };

  //可用申请类型校验
  applicationTypeValidator = (rule, value, callback) => {
    if (value.radioValue || (!value.radioValue && value.chooserValue.length > 0)) {
      callback();
      return;
    }
    callback("请选择申请类型");
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { formList, saveLoading, record, loading } = this.state;
    const { params, setOfBooks } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10 }
    };

    return (
      <div>{loading ? <Spin /> :
        <Form onSubmit={this.handleSave}>
          <div className="common-item-title">
            {this.$t({ id: 'pre.payment.essential.information' }) /*基本信息*/}
          </div>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'pre.payment.setOfBookName' } /*账套*/)}
          >
            {getFieldDecorator('setOfBooksId', {
              rules: [{ required: true, message: "请输入" }],
              initialValue: record.id ? record.setOfBooksId : params.setOfBooksId
            })(
              <Select disabled>
                {setOfBooks.map(option => {
                  return <Option key={option.value}>{option.label}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="费用申请单类型代码">
            {getFieldDecorator('typeCode', {
              rules: [{ required: true, message: "请输入" }],
              initialValue: record.typeCode || ""
            })(
              <Input disabled={!!record.id} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="费用申请单类型名称">
            {getFieldDecorator('typeName', {
              rules: [{ required: true, message: "请输入" }],
              initialValue: record.typeName || ""
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={(<span>
              关联表单类型&nbsp;
              <Tooltip title="关联表单设计器中的单据类型，用来使用工作流">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>)}>
            {getFieldDecorator('formOid', {
              rules: [{ required: true, message: "请选择" }],
              initialValue: record.formOid || ""
            })(
              <Select allowClear>
                {formList.map(item => {
                  return <Option key={item.formOID}>{item.formName}</Option>;
                })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="状态">
            {getFieldDecorator('enabled', {
              rules: [{ required: true }],
              initialValue: record.id ? record.enabled : true,
              valuePropName: "checked"
            })(
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
            )}
          </FormItem>
          <div className="common-item-title">
            预算管控设置
          </div>
          <FormItem
            {...formItemLayout}
            colon={false}
            label={<span></span>}>
            {getFieldDecorator('budgetFlag', {
              initialValue: record.id ? record.budgetFlag : false
            })(
              <Radio.Group>
                <Radio value={true}>启用</Radio>
                <Radio value={false}>不启用</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <div className="common-item-title">
            申请类型设置
          </div>
          <FormItem
            {...formItemLayout}
            validateTrigger="onBlur"
            label="可用申请类型">
            {getFieldDecorator('applicationType', {
              initialValue: record.applicationType || { radioValue: true, chooserValue: [] }
            })(
              <CustomChooser params={{ setOfBooksId: record.id ? record.setOfBooksId : params.setOfBooksId }} type="application_type" valueKey="id" labelKey="name" />
            )}
          </FormItem>
          <div className="common-item-title">
            关联合同设置
          </div>
          <FormItem
            {...formItemLayout}
            colon={false}
            label={<span></span>}>
            {getFieldDecorator('associateContract', {
              initialValue: record.id ? record.associateContract : false
            })(
              <Radio.Group onChange={this.associateContractChange}>
                <Radio value={true}>可关联</Radio>
                <Radio value={false}>不可关联</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <div className="common-item-title">
            合同必输设置
          </div>
          <FormItem
            {...formItemLayout}
            colon={false}
            label={<span></span>}>
            {getFieldDecorator('requireInput', {
              initialValue: record.id ? record.requireInput : false
            })(
              <Radio.Group disabled={!this.props.form.getFieldValue("associateContract")}>
                <Radio value={true}>必输</Radio>
                <Radio value={false}>非必输</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <div className="common-item-title">
            权限设置
          </div>
          <FormItem
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            label="适用人员">
            {getFieldDecorator('userInfos', {
              initialValue: record.userInfos || { type: "all", values: [] }
            })(
              <PermissionsAllocation params={{ setOfBooksId: record.id ? record.setOfBooksId : params.setOfBooksId }} />
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={saveLoading}>
              {this.$t({ id: 'common.save' }) /* 保存 */}
            </Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' }) /* 取消 */}</Button>
          </div>
        </Form>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
  };
}
const WrappedNewPrePaymentType = Form.create()(NewApplicationType);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewPrePaymentType);
