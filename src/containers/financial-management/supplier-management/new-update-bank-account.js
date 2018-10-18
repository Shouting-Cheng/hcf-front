import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Button,
  Table,
  Badge,
  Input,
  Switch,
  Select,
  Form,
  Row,
  Col,
  Icon,
  Cascader,
  message,
  notification,
} from 'antd';
import vendorService from 'containers/financial-management/supplier-management/vendorService';
import 'styles/financial-management/supplier-management/new-update-bank-account.scss';
import Chooser from 'components/Widget/chooser';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import debounce from 'lodash.debounce';

class NewUpdateBankAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      isMainAccount: true,
      firstRender: true,
      bankInfo: {},
      bank: [],
      country: [],
      address: [],
    };
    this.validateAccount = debounce(this.validateAccount, 1000);
  }

  componentWillMount() {
    let params = this.props.params;
    if (JSON.stringify(params) !== '{}') {
      //编辑
      this.props.form.setFieldsValue({ venBankAccountBeans: params.bankName });
      params.bankDefaultName = [{ bankCode: params.bankCode, bankBranchName: params.bankName }];
      this.setState({
        bankInfo: params,
        enabled: params.venType === 1001 ? true : false,
        isMainAccount: params.primaryFlag,
      });
    } else {
      notification.close('section');
      this.setState({ loading: false });
      this.props.form.resetFields();
    }
  }

  /*
  componentWillReceiveProps(nextProps) {
    let params = nextProps.params;
    if (JSON.stringify(params) === '{}') {
      this.props.form.resetFields();
      notification.close('section');
      this.setState({
        enabled: true,
        isMainAccount: true
      })
    }
  }
*/

  statusChange = () => {
    this.setState(prevState => ({
      enabled: !prevState.enabled,
    }));
  };

  mainAccountChange = () => {
    this.setState(prevState => ({
      isMainAccount: !prevState.isMainAccount,
    }));
  };

  handleNotification = values => {
    notification.close('section');
    values.constraintFlag = 'go';
    let method = null;
    if (typeof this.state.bankInfo.id !== 'undefined') {
      values.id = this.state.bankInfo.id;
      method = vendorService.updateBankCardInfo(values);
    } else {
      method = vendorService.addBankCardInfo(values);
    }
    method
      .then(response => {
        if (response.data.code === '0000') {
          this.props.form.resetFields();
          this.setState({ loading: false });
          this.props.close(true);
        } else {
          message.warning(`保存失败,${respone.data.msg}`);
          this.setState({ loading: false });
          return;
        }
      })
      .catch(e => {
        if (e.response) {
          if (typeof this.state.bankInfo.id === 'undefined')
            message.error(
              `${this.$t('common.save.filed')}, ${
                !!e.response.data.message ? e.response.data.message : e.response.data.errorCode
              }`
            );
          else
            message.error(
              `${this.$t('common.operate.filed')}, ${
                !!e.response.data.message ? e.response.data.message : e.response.data.errorCode
              }`
            );
          this.setState({ loading: false });
        }
      });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        values.venInfoId = this.props.params.vendorId;
        values.bankCode = values.venBankAccountBeans[0].bankCode;
        values.bankName = values.venBankAccountBeans[0].bankBranchName;
        values.companyOid = this.props.company.companyOID;
        values.venType = values.enabled ? 1001 : 1002;
        values.venOperatorNumber = this.props.user.employeeID;
        values.venOperatorName = this.props.user.fullName;

        let method = null;
        if (typeof this.state.bankInfo.id !== 'undefined') {
          //编辑
          values.id = this.state.bankInfo.id;
          method = vendorService.updateBankCardInfo(values);
        } else {
          method = vendorService.addBankCardInfo(values);
        }
        method
          .then(response => {
            if (response.data.constraintFlag === 'false') {
              //弹框出提示
              notification.open({
                message: (
                  <span>
                    {this.$t('supplier.vendor')}
                    <span style={{ color: '#2292dd' }}>{response.data.venInfoName}</span>
                    {this.$t('vendor.notification.left')}
                    <span style={{ color: '#2292dd' }}>{response.data.mesBankName}</span>
                    {this.$t('vendor.notification.bank')}
                    <span style={{ color: '#2292dd' }}>{response.data.mesVenBankNumberName}</span>
                  </span>
                ),
                description: (
                  <span>
                    {this.$t('vendor.notification.right')}
                    <span style={{ color: '#2292dd' }}>{response.data.mesVenBankNumberName}</span>
                    {this.$t('vendor.notification.right.tips')}
                  </span>
                ),
                icon: <Icon type="exclamation-circle" style={{ color: '#faad14' }} />,
                duration: 0,
                key: 'section',
                btn: (
                  <div>
                    <Button
                      size="small"
                      onClick={() => {
                        this.setState({ loading: false });
                        notification.close('section');
                      }}
                    >
                      {this.$t('common.cancel')}
                    </Button>
                    <Button
                      type="primary"
                      style={{ marginLeft: 10 }}
                      size="small"
                      onClick={() => this.handleNotification(response.data)}
                    >
                      {this.$t('section.continue')}
                    </Button>
                  </div>
                ),
              });
            } else {
              if (response.data.code === '0000') {
                if (typeof this.state.bankInfo.id === 'undefined') {
                  message.success(this.$t('structure.saveSuccess')); /*保存成功！*/
                } else {
                  message.success(`${this.$t('common.operate.success')}`);
                }
                this.props.form.resetFields();
                this.setState({
                  loading: false,
                  enabled: true,
                  isMainAccount: true,
                });
                this.props.close(true);
              } else {
                message.warning(`${this.$t(`common.save.filed`)},${response.data.msg}`);
                this.setState({ loading: false });
                return;
              }
            }
          })
          .catch(e => {
            if (e.response) {
              if (typeof this.state.bankInfo.id === 'undefined')
                message.error(
                  `${this.$t('common.save.filed')}, ${
                    !!e.response.data.message ? e.response.data.message : e.response.data.errorCode
                  }`
                );
              else
                message.error(
                  `${this.$t('common.operate.filed')}, ${
                    !!e.response.data.message ? e.response.data.message : e.response.data.errorCode
                  }`
                );
              this.setState({ loading: false });
            }
          });
      }
    });
  };

  //切换银行
  handleBankChange = value => {
    if (typeof value[0].id !== 'undefined') {
      let bankInfo = this.state.bankInfo;
      bankInfo.country = bankInfo.countryCode;
      this.setState({ bankInfo });
      this.props.form.setFieldsValue({
        country: value[0].countryName,
        bankAddress: value[0].province + value[0].city,
      });
    }
  };

  onCancel = () => {
    this.props.onClose(false);
    this.props.form.resetFields();
    notification.close('section');
    this.setState({ loading: false });
  };

  validateAccount = (item, value, callback) => {
    let str = /^([1-9]{1})(\d{14}|\d{15}|\d{16}|\d{17}|\d{18})$/;
    this.setState({
      validateAccount: !str.test(value),
    });
    callback();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      loading,
      enabled,
      isMainAccount,
      validateAccount,
      bank,
      bankInfo,
      country,
      address,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 0 },
    };
    return (
      <div className="new-update-bank-account">
        <Form onSubmit={this.handleSubmit}>
          <div className="basic-title">{this.$t('supplier.management.basicInfo')}</div>
          <Row gutter={24} className="new-update-bank-account-formItem1">
            <Col offset={4} span={7}>
              <FormItem {...formItemLayout} label={this.$t('common.column.status')} colon={true}>
                {getFieldDecorator('enabled', {
                  valuePropName: 'checked',
                  initialValue: enabled,
                })(
                  <div>
                    <Switch
                      checked={enabled}
                      checkedChildren={<Icon type="check" />}
                      unCheckedChildren={<Icon type="cross" />}
                      onChange={this.statusChange}
                    />
                    <span className="enabled-type" style={{ marginLeft: 20, width: 100 }}>
                      {enabled ? this.$t('common.status.enable') : this.$t('common.disabled')}
                    </span>
                  </div>
                )}
              </FormItem>
            </Col>
            <Col span={8} offset={1}>
              <FormItem {...formItemLayout} label={this.$t('supplier.main.account')} colon={true}>
                {getFieldDecorator('primaryFlag', {
                  valuePropName: 'checked',
                  initialValue: isMainAccount,
                })(
                  <div>
                    <Switch
                      checked={isMainAccount}
                      checkedChildren={<Icon type="check" />}
                      unCheckedChildren={<Icon type="cross" />}
                      onChange={this.mainAccountChange}
                    />
                    <span className="enabled-type" style={{ marginLeft: 20, width: 100 }}>
                      {isMainAccount ? this.$t('supplier.bank.yes') : this.$t('supplier.bank.no')}
                    </span>
                  </div>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={22}>
            <Col span={22}>
              <FormItem {...formItemLayout} label={this.$t('bank.bankName')} colon={true}>
                {getFieldDecorator('venBankAccountBeans', {
                  initialValue: bankInfo.bankDefaultName,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.select'),
                    },
                  ],
                })(
                  <Chooser
                    type="select_bank_supplier"
                    single={true}
                    labelKey="bankBranchName"
                    placeholder={this.$t('common.please.select')}
                    valueKey="id"
                    listExtraParams={{ isAll: true }}
                    onChange={this.handleBankChange}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={22}>
            <Col span={22}>
              <FormItem
                {...formItemLayout}
                label={this.$t('supplier.management.bank.accountName')}
                colon={true}
              >
                {getFieldDecorator('venBankNumberName', {
                  initialValue: bankInfo.venBankNumberName,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={22}>
            <Col span={22}>
              <FormItem
                {...formItemLayout}
                validateStatus={validateAccount ? 'error' : null}
                help={validateAccount ? this.$t('supplier.account.tips') : ''}
                label={this.$t('supplier.bank.account')}
                colon={true}
              >
                {getFieldDecorator('bankAccount', {
                  initialValue: bankInfo.bankAccount,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                    {
                      validator: (item, value, callback) =>
                        this.validateAccount(item, value, callback),
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={22}>
            <Col span={22}>
              <FormItem {...formItemLayout} label={this.$t('bank.country')} colon={true}>
                {getFieldDecorator('country', {
                  initialValue: bankInfo.country,
                })(
                  <Select
                    disabled
                    allowClear
                    showSearch
                    onChange={this.countryChange}
                    placeholder={this.$t('common.please.select')}
                  >
                    {country.map(item => <Option value={item.key}>{item.label}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={22}>
            <Col span={22}>
              <FormItem {...formItemLayout} label={this.$t('bank.address')} colon={true}>
                {getFieldDecorator('bankAddress', {
                  initialValue: bankInfo.bankAddress,
                })(<Select disabled placeholder={this.$t('common.please.select')} />)}
              </FormItem>
            </Col>
          </Row>

          <Row gutter={22}>
            <Col span={22}>
              <FormItem
                {...formItemLayout}
                label={this.$t('supplier.management.remark')}
                colon={true}
              >
                {getFieldDecorator('notes', {
                  initialValue: bankInfo.notes,
                })(<TextArea placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
          </Row>
          <div className="bank-account-tips">
            {this.$t('bank.account.tips.left')}
            {this.$t('bank.account.tips.center')}
            {this.$t('common.add')}
          </div>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t('common.save')}
            </Button>
            <Button onClick={this.onCancel}>{this.$t('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    language: state.languages.languages,
    company: state.user.company,
    user: state.user.currentUser,
  };
}
const WrappedNewUpdateBankAccount = Form.create()(NewUpdateBankAccount);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewUpdateBankAccount);
