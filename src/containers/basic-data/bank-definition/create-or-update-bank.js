import React from 'react';
import { connect } from 'dva';

import { Button, Form, Input, Switch, Icon, Cascader, Select } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
import BSService from 'containers/basic-data/bank-definition/bank-definition.service';
import 'styles/basic-data/bank-definition/create-or-update-bank-definition.scss';

class CreateOrUpdateBank extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enable: true,
      bankTypeHelp: '',
      bank: {},
      isEditor: false,
      provinceCode: '',
      cityCode: '',
      country: [],
      countryData: [],
      countryDefaultValue: [],
      isChina: false,
    };
  }

  componentWillReceiveProps(nextprops) {
    let params = nextprops.params;
    this.setState({
      bank: params,
      country: params.countryCode,
      countryDefaultValue: [params.provinceCode, params.cityCode],
      countryData: params.countryData ? params.countryData : [],
    });
  }

  componentDidMount() {
    let params = this.props.params;
    this.setState({
      bank: params,
      country: params.countryCode,
      countryDefaultValue: [params.provinceCode, params.cityCode],
      countryData: params.countryData ? params.countryData : [],
    });
    //省市下拉列表，默认北京-朝阳
    const countryDefaultValue = ['CHN011000000', 'CHN011005000'];
    if (params.countryCode === 'CHN000000000') {
      this.setState({
        isChina: true,
      });
    } else {
      this.setState({
        isChina: false,
      });
    }
    //编辑
    if (typeof params.id !== 'undefined') {
      this.setState({
        bank: params,
        enable: params.enable,
        country: params.countryCode,
        countryDefaultValue: [params.provinceCode, params.cityCode],
        countryData: params.countryData ? params.countryData : [],
      });
    } else {
      this.setState({
        countryDefaultValue: countryDefaultValue,
        countryData: params.countryData ? params.countryData : [],
      });
    }
  }

  //上传之前，表单的值需要处理
  getRequestValue = values => {
    if (this.state.isChina) {
      values.countryCode = values.country;
      values.countryName = BSService.getCountryNameByCode(
        values.countryCode,
        this.state.countryData
      );
      if (values.openAccount.length > 0) {
        values.provinceCode = values.openAccount[0];
        values.province = BSService.getStateNameByCode(
          values.countryCode,
          values.provinceCode,
          this.state.countryData
        );
      }
      if (values.openAccount.length > 1) {
        values.cityCode = values.openAccount[1];
        values.city = BSService.getCityNameByCode(
          values.countryCode,
          values.provinceCode,
          values.cityCode,
          this.state.countryData
        );
      }
      values.openAccount = values.province + values.city;
      return values;
    } else {
      values.countryCode = values.country;
      values.countryName = BSService.getCountryNameByCode(
        values.countryCode,
        this.state.countryData
      );
      values.provinceCode = '';
      values.cityCode = '';
      values.province = '';
      values.city = '';
      return values;
    }
  };

  //创建自定义银行
  handleCreate = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = this.getRequestValue(values);
        this.setState({
          loading: true,
        });
        BSService.createSelfBank(params)
          .then(response => {
            this.props.form.resetFields();
            this.setState({
              loading: false,
            });
            this.props.onClose(true);
          })
          .catch(e => {
            this.setState({ loading: false });
          });
      }
    });
  };

  //更新自定义银行
  handleUpdate = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.id = this.state.bank.id;
        let params = this.getRequestValue(values);
        this.setState({
          loading: true,
        });
        BSService.updateSelfBank(params)
          .then(response => {
            this.props.form.resetFields();
            this.setState({
              loading: false,
            });
            this.props.onClose(true);
          })
          .catch(e => {
            this.setState({ loading: false });
          });
      }
    });
  };

  //国家省市
  onStateChange = (value, selectedOptions) => {
    
  };

  handleSubmit = e => {
    e.preventDefault();
    typeof this.state.bank.id === 'undefined' ? this.handleCreate() : this.handleUpdate();
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

  switchChange = () => {
    this.setState(prevState => ({
      enable: !prevState.enable,
    }));
  };

  //选择国家值
  handleCountryChange = value => {
    //选择国家时把开户地置空
    this.props.form.setFieldsValue({
      openAccount: ''
    });
    if (value === 'CHN000000000') {
      this.setState({
        isChina: true,
      });
    } else {
      this.setState({
        isChina: false,
      });
    }
  };
  //渲染国家的选项
  renderCountryOption = data => {
    return data.map(item => {
      return (
        <Option value={item.value} key={item.code}>
          {item.label}
        </Option>
      );
    });
  };

  //根据是否是中国，渲染开户地
  renderOpenAccountByChina = () => {
    const { getFieldDecorator } = this.props.form;
    const { bankTypeHelp, bank } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    var openAccountDom = '';
    if (this.state.isChina) {
      {
        /*省市:只有中国时才联动*/
      }
      openAccountDom = (
        <FormItem {...formItemLayout} label={this.$t('bank.openAccount')} help={bankTypeHelp}>
          {getFieldDecorator('openAccount', {
            initialValue: this.state.countryDefaultValue,
          })(
            <Cascader
              options={BSService.getCountryDataByCode('CHN000000000', this.state.countryData)}
              onChange={this.onStateChange}
              placeholder={this.$t('common.please.select')}
            />
          )}
        </FormItem>
      );
    } else {
      {
        /*开户地*/
      }
      openAccountDom = (
        <FormItem {...formItemLayout} label={this.$t('bank.openAccount')} help={bankTypeHelp}>
          {getFieldDecorator('openAccount', {
            initialValue: bank.openAccount,
          })(<Input placeholder={this.$t('common.please.enter')} />)}
        </FormItem>
      );
    }

    return openAccountDom;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { enable, loading, bankTypeHelp, bank, country, isEditor } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-bank-definition">
        {/*状态*/}
        <Form onSubmit={this.handleSubmit} onChange={this.handleFormChange}>
          <FormItem {...formItemLayout} label={this.$t('common.column.status')} colon={true}>
            {getFieldDecorator('enable', {
              initialValue: enable,
            })(
              <div>
                <Switch
                  defaultChecked={enable}
                  checked={enable}
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="cross" />}
                  onChange={this.switchChange}
                />
                <span
                  className="enabled-type"
                  style={{
                    marginLeft: 20,
                    width: 100,
                  }}
                >
                  {enable ? this.$t('common.status.enable') : this.$t('common.disabled')}
                </span>
              </div>
            )}
          </FormItem>
          {/*银行代码*/}
          <FormItem {...formItemLayout} label={this.$t('bank.bankCode')}>
            {getFieldDecorator('bankCode', {
              initialValue: bank.bankCode,
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
            })(
              <Input
                disabled={typeof bank.id === 'undefined' ? false : true}
                placeholder={this.$t('common.please.enter')}
              />
            )}
          </FormItem>
          {/*swiftCode*/}
          <FormItem {...formItemLayout} label="Swift Code">
            {getFieldDecorator('swiftCode', {
              initialValue: bank.swiftCode,
            })(<Input disabled={isEditor} placeholder={this.$t('common.please.enter')} />)}
          </FormItem>

          {/*银行名称*/}
          <FormItem {...formItemLayout} label={this.$t('bank.bankName')}>
            {getFieldDecorator('bankName', {
              initialValue: bank.bankName,
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
            })(<Input placeholder={this.$t('common.please.enter')} />)}
          </FormItem>

          {/*支行名称*/}
          <FormItem {...formItemLayout} label={this.$t('bank.bankBranchName')}>
            {getFieldDecorator('bankBranchName', {
              initialValue: bank.bankBranchName,
              rules: [
                {
                  required: true,
                  message: this.$t('common.please.enter'),
                },
              ],
            })(<Input placeholder={this.$t('common.please.enter')} />)}
          </FormItem>

          {/*国家*/}
          <FormItem {...formItemLayout} label={this.$t('bank.country')} help={bankTypeHelp}>
            {getFieldDecorator('country', {
              initialValue: this.state.country,
            })(
              <Select
                allowClear='true'
                className="select-country"
                showSearch
                placeholder={this.$t('common.please.select')}
                optionFilterProp="children"
                onChange={this.handleCountryChange}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {this.renderCountryOption(this.state.countryData)}
              </Select>
            )}
          </FormItem>

          {// 渲染开户地，中国是联动
          this.renderOpenAccountByChina()}

          {/*详情地址*/}
          <FormItem {...formItemLayout} label={this.$t('bank.detailAddress')} help={bankTypeHelp}>
            {getFieldDecorator('detailAddress', {
              initialValue: bank.detailAddress,
            })(<Input placeholder={this.$t('common.please.enter')} />)}
          </FormItem>
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
    organization: state.user.organization,
    company: state.user.company,
    language: state.languages,
  };
}

const WrappedCreateOrUpdateBank = Form.create()(CreateOrUpdateBank);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedCreateOrUpdateBank);
