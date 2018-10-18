import React from 'react';

import { connect } from 'dva';
import { Form, Input, InputNumber, Button, message, Modal } from 'antd';
import { deepCopy } from 'utils/extend';
import requestService from 'containers/request/request.service';
import errorMessage from 'share/errorMessage';
import Chooser from 'widget/chooser';
const FormItem = Form.Item;
import BankPicker from 'containers/financial-management/supplier-management/bank-picker';

class newVendorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showBankPicker: false, // 选择银行显示
      saving: false, // 保存
      formItemLayout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 9 },
      },
      currentVendor: {},
      customFields: [],
      bankInfo: {}, // 保存银行卡信息
    };
  }

  componentWillMount() {
    this.initCustomFields();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.newVendorVisible === this.props.newVendorVisible) return;
    if (!nextProps.newVendorVisible) {
      // this.setState({bankInfo: {}});
      this.props.form.resetFields();
      return !1;
    }
    this.setState({ saving: false, currentVendor: nextProps.currentVendor }, () =>
      this.props.form.resetFields()
    );
  }

  /**
   * 设置表单项
   * */
  initCustomFields = () => {
    let inputTest = this.$t('common.please.enter');
    this.setState({
      customFields: [
        {
          title: this.$t('request.edit.ven.vendorInfo'),
          options: [
            {
              id: 'vendorAccount',
              required: true,
              type: 'TEXT',
              placeholder: inputTest,
              name: this.$t('request.edit.ven.vendorAccount'),
            },
            //供应商类型字段
            {
              id: 'venderTypeId',
              required: true,
              type: 'vendor_type',
              placeholder: inputTest,
              name: this.$t('supplier.management.type'),
            },
            //供应商代码字段
            {
              id: 'venderCode',
              required: true,
              type: 'TEXT',
              placeholder: inputTest,
              name: this.$t('supplier.management.code'),
            },
          ],
        }, // 供应商开户名称
        {
          title: this.$t('request.edit.ven.vendorOpenBankInfo'),
          options: [
            {
              id: 'openBankName',
              required: true,
              type: 'bankSelect',
              placeholder: this.$t('common.please.select'),
              name: this.$t('request.edit.ven.openBankName'),
            }, // 开户银行
            {
              id: 'openBankNum',
              required: true,
              type: 'TEXT',
              placeholder: inputTest,
              name: this.$t('request.edit.ven.openBankNum'),
            }, // 开户银行联行号
            {
              id: 'openBankCity',
              required: true,
              type: 'TEXT',
              placeholder: inputTest,
              name: this.$t('request.edit.ven.openBankCity'),
            }, // 开户银行所在地
            {
              id: 'vendorReceiveName',
              required: true,
              type: 'TEXT',
              placeholder: inputTest,
              name: this.$t('request.edit.ven.vendorReceiveName'),
            }, // 供应商收款账号
          ],
        },
      ],
    });
  };
  // 保存数据
  handleSave = e => {
    e.preventDefault();
    e.stopPropagation();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { payeeInfo } = this.props;
        let result = {};
        if (!payeeInfo.id) {
          result = {
            venOperatorNumber: this.props.user.employeeID,
            venOperatorName: this.props.user.fullName,
            venNickname: values.vendorAccount,
            venderTypeId: values.venderTypeId[0].id,
            venderCode: values.venderCode,
            venType: 1001,
            source: 'BILL',
            venBankAccountBeans: [
              {
                venBankNumberName: values.vendorAccount,
                bankName: values.openBankName,
                bankAccount: values.vendorReceiveName,
                bankOpeningBank: values.openBankName,
                bankOpeningCity: values.openBankCity,
                primaryFlag: false,
                bankCode: values.openBankNum,
              },
            ],
          };
        } else {
          // 供应商是银行账户对象
          result = {
            source: 'BILL',
            primaryFlag: false,
            bankName: values.openBankName,
            venderTypeId: values.venderTypeId[0].id,
            venderCode: values.venderCode,
            bankAccount: values.vendorReceiveName,
            bankOpeningBank: values.openBankName,
            bankOpeningCity: values.openBankCity,
            bankCode: values.openBankNum,
            venInfoId: payeeInfo.id,
            venNickname: payeeInfo.venNickname,
            venOperatorName: payeeInfo.venOperatorName,
            venOperatorNumber: payeeInfo.venOperatorNumber,
            venBankNumberName: payeeInfo.venNickname,
            venType: 1001,
          };
        }
        this.setState({ saving: true });
        this.saveToServer(result)
          .then(res => {
            let data = res.data;
            if ('' + data.code !== '0000') {
              //校验失败
              message.error(data.msg);
            } else {
              message.success(this.$t('common.operate.success') /*操作成功*/);
              this.props.form.resetFields();
              this.setState({ bankInfo: {} });
              const onOk = this.props.onOk;
              let result = res.data;
              if (payeeInfo.id) {
                result = deepCopy(payeeInfo);
                // result.venBankAccountBeans = res.data.body;
                result.venBankAccountBeans = res.data;
              }
              onOk && onOk(result);
            }
          })
          .catch(err => {
            if (err.response) {
              errorMessage(err.response);
            }
          })
          .finally(() => {
            this.setState({ saving: false });
          });
      }
    });
  };
  // 保存信息至后台
  saveToServer = result => {
    return this.props.payeeInfo.id
      ? requestService.addNewAccount(result)
      : requestService.addData(result);
  };
  // 表单项
  getFormItem = customField => {
    const { formItemLayout } = this.state;
    const { payeeInfo } = this.props;
    const { getFieldDecorator } = this.props.form;
    const options = this.getOption(customField);
    customField.disabled = false;
    payeeInfo.id &&
      customField.id === 'vendorAccount' &&
      ((customField.disabled = true), (options.initialValue = payeeInfo.venNickname));
    //供应商类型：初始值
    if (payeeInfo.id && customField.id === 'venderTypeId') {
      customField.disabled = true;
      options.initialValue = [
        {
          id: payeeInfo.venderTypeId,
          name: payeeInfo.venderTypeName,
        },
      ];
    }
    //供应商代码：初始值
    payeeInfo.id &&
      customField.id === 'venderCode' &&
      ((customField.disabled = true), (options.initialValue = payeeInfo.venderCode));
    return (
      <FormItem label={customField.name} {...formItemLayout} key={customField.name}>
        {getFieldDecorator(customField.id, options)(this.getHtmlInput(customField))}
      </FormItem>
    );
  };
  // 表单配置项
  getOption = customField => {
    return {
      rules: [
        {
          required: customField.required,
          message: this.$t('common.name.is.required', { name: customField.name }),
        },
      ],
      initialValue: '',
      key: customField.id,
    };
  };
  getHtmlInput = customField => {
    let result = '';
    switch (customField.type) {
      case 'NUMBER':
        result = <InputNumber style={{ width: '100%' }} placeholder={customField.placeholder} />;
        break;
      case 'TEXT':
        result = (
          <Input
            disabled={customField.disabled}
            placeholder={customField.placeholder}
            onChange={this.handleNameChange}
          />
        );
        break;
      case 'vendor_type':
        return (
          <Chooser
            single={true}
            type="vendor_type"
            placeholder={this.$t('common.please.select')}
            labelKey="name"
            disabled={customField.disabled}
            onChange={this.handleVendorTypeChange}
            valueKey="id"
            listExtraParams={{}}
          />
        );
        break;
      case 'bankSelect':
        let bankBranchName = this.state.bankInfo.bankBranchName;
        //todo  @zhoutao
        //这个地方直接返回一个选择银行的chooser应该就可以，没必要专门再调一个bankPicker组件，感觉bankPicker组件多余
        return (
          <div onClick={this.showBank} className="ant-input">
            {bankBranchName ? (
              bankBranchName
            ) : (
              <span style={{ color: '#dcdcdc' }}>{customField.placeholder}</span>
            )}
          </div>
        );
        break;
      default:
        result = '';
        break;
    }
    return result;
  };
  // 显示选择银行框选择银行
  showBank = () => {
    this.setState({ showBankPicker: true });
  };
  // 银行选择
  handleChangeBank = value => {
    this.props.form.setFieldsValue({
      openBankName: value.bankBranchName,
      openBankNum: value.bankCode,
      openBankCity: `${value.province}${value.city}`,
    });
    this.setState({ bankInfo: value });
  };
  handleCancelBank = () => {
    this.setState({ showBankPicker: false });
  };
  //显示供应商类型选择框
  handleVendorTypeChange = value => {
    console.log(value);
  };

  // 取消
  onCancel = () => {
    this.setState({ bankInfo: {} });
    this.props.form.resetFields();
    this.props.onCancel();
  };
  handleNameChange = e => {
    if (e.target.value.length > 30) {
      Modal.error({
        title: this.$t('wait.for.save.tip'),
        content: (
          <div>
            <p>{this.$t('wait.for.save.ruleNameTip')}</p>
          </div>
        ),
      });
    }
  };
  render() {
    const { saving, showBankPicker, currentVendor, customFields } = this.state;
    return (
      <div>
        <Form onSubmit={this.handleSave}>
          {currentVendor &&
            customFields.map(item => (
              <div key={item.title}>
                <h3>{item.title}</h3>
                {item.options.map(option => <div key={option.id}>{this.getFormItem(option)}</div>)}
              </div>
            ))}
          {/*注：如需要对外业务，在联行号中输入相应银行的Swiftcode*/}
          <p style={{ color: '#999' }}>{this.$t('request.edit.ven.newSupplier.tip')}</p>
          {/*请正确的填写并核对所有信息，以便财务及时付款*/}
          <Form.Item>
            <p style={{ display: 'inline-block', width: '480px', color: '#999' }}>
              {this.$t('request.edit.ven.newSupplier.enterTip')}
            </p>
            <Button
              type="default"
              className="cancel-btn"
              onClick={this.onCancel}
              style={{ marginRight: '10px' }}
            >
              {/*取消*/}
              {this.$t('common.cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {/*确定*/}
              {this.$t('common.ok')}
            </Button>
          </Form.Item>
        </Form>
        <BankPicker
          visible={showBankPicker}
          onCancel={this.handleCancelBank}
          onChoose={record => this.handleChangeBank(record)}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.login.user,
  };
}

const wrappedEditRule = Form.create()(newVendorForm);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedEditRule);
