// 为了0416迭代上线，重构此文件
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Switch, Icon, Input, Select, Button, Row, Col, message } from 'antd';
import Chooser from 'components/Widget/chooser';
import config from 'config';
import companyMaintainService from 'containers/enterprise-manage/company-maintain/company-maintain.service';
import Selector from 'components/Widget/selector';

const FormItem = Form.Item;
import { deepCopy } from 'utils/extend';
// import configureStore from 'stores';
class WrappedNewBankAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,

      bankObj: {
        bank: [], //这个字段只是用来显示，可以不传给后端，
        bankName: '',

        countryCode: '', //银行国家code：根据银行来显示
        country: '', //国家名称：根据银行来显示
        accountOpening: '', //开户地：根据银行来显示
        accountOpeningAddress: '', //银行详细地址：根据银行来显示
        swiftCode: '', //开户支行Swift：：根据银行来显示

        bankAccountName: '', //银行账户名称
        bankAccountNumber: '', //银行账户账号
        accountCode: '', //账户账号
        currencyCode: '', //币种
        remark: '', //备注
        enabled: true, //状态
      },
      //币种下拉单
      selectListCurrencyCode: {
        url: config.baseUrl + '/api/company/standard/currency/getAll/companyOID?',
        label: record => record.currency + '-' + record.currencyName,
        key: 'currency',
      },
      bankCode: '',
      bankInfo: {},
    };
  }

  componentDidMount() {
    if (this.props.match.params.flag === 'create') {
    } else {
      //更新
      companyMaintainService.getCompanyBankInfoById(this.props.match.params.flag).then(res => {
        let bankObj = deepCopy(res.data);

        let _bank = deepCopy(res.data);
        // countryName要注意接口的坑，前端上传的时候与解析的时候，要转换
        // openAccount要注意接口的坑，前端上传的时候与解析的时候，要转换
        bankObj.bank = [
          {
            bankCode: _bank.bankCode,
            bankBranchName: _bank.bankBranchName,
            bankName: _bank.bankName,
            city: _bank.city,
            cityCode: _bank.cityCode,
            province: _bank.province,
            provinceCode: _bank.provinceCode,
            countryCode: _bank.countryCode,
            countryName: _bank.country,
            country: _bank.country,
            bankAddress: _bank.accountOpeningAddress,
            accountOpeningAddress: _bank.accountOpeningAddress,
            detailAddress: _bank.accountOpeningAddress,
            swiftCode: _bank.swiftCode,
            openAccount: _bank.bankAddress,
          },
        ];
        this.setState({ bankObj });
      });
    }
  }

  //保存新建公司
  handleSave = e => {
    e.preventDefault();
    let { bankObj } = this.state;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.companyId = this.props.match.params.companyId;
        values.bankCode = values.bank[0].bankCode;
        values.bankBranchName = values.bank[0].bankBranchName;
        values.bankKey = values.bank[0].bankCode;
        values.bankName = values.bank[0].bankName;
        values.city = values.bank[0].city;
        values.cityCode = values.bank[0].cityCode;
        values.province = values.bank[0].province;
        values.provinceCode = values.bank[0].provinceCode;
        values.countryCode = values.bank[0].countryCode;
        if (bankObj.id) {
          //编辑时，传id
          values.id = bankObj.id;
        }
        this.addOrUpdateBankAccount(values);
      }
    });
  };

  //更新或者创建银行账户
  addOrUpdateBankAccount = bankAccount => {
    //todo
    //这个接口一定要重构，一来是抛错信息，二来是前端只需要传银行代码
    //还有改为创建是post,编辑是put,现在都是post
    this.setState({ loading: true });
    companyMaintainService.addOrUpdateBankAccount(bankAccount).then(res => {
      this.setState({ loading: false });
      //保存成功或者更新成功
      message.success(this.$t('common.operate.success'));
      this.setState({ loading: false });
      // this.context.router.goBack();
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/enterprise-manage/company-maintain/company-maintain-detail/${
            this.props.match.params.companyOId
          }/${this.props.match.params.companyId}`,
        })
      );
    })
    .catch(err => {
      this.setState({ loading: false });
    });
  };

  //取消就直接返回
  handleCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/enterprise-manage/company-maintain/company-maintain-detail/${
          this.props.match.params.companyOId
        }/${this.props.match.params.companyId}`,
      })
    );
  };

  //银行
  //todo
  //期望后端只需要前端传一个银行代码就可以了
  handleBankCodeChange = e => {
    //选择银行之后，国家，开户地，银行详细地址，swiftCode显示出来
    let bankObj = this.state.bankObj;
    if (e.length > 0) {
      let bank = e[0];
      bankObj.countryCode = bank.countryCode;
      bankObj.country = bank.countryName;
      bankObj.bankAddress = bank.openAccount; //注意字段不一样
      bankObj.accountOpeningAddress = bank.detailAddress;
      bankObj.swiftCode = bank.swiftCode;
    } else {
      bankObj.countryCode = '';
      bankObj.country = '';
      bankObj.bankAddress = '';
      bankObj.accountOpeningAddress = '';
    }
    this.setState({
      loading: false,
      bankObj,
    });
  };
  //监听表单值
  handleChange = e => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { bankObj, loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    let params = {
      language: 'chineseName',
      companyOID: this.props.match.params.companyOId,
      // userOID: configureStore.store.getState().login.user.userOID,
    };
    return (
      <Form
        className="ant-advanced-search-form"
        onSubmit={this.handleSave}
        onChange={this.handleChange}
      >
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.bankName')} //银行名称
              colon={true}
            >
              {getFieldDecorator('bank', {
                initialValue: bankObj.bank,
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.select'),
                  },
                ],
              })(
                <Chooser
                  single={true}
                  type="select_bank"
                  //value={bankObj.bank}
                  placeholder={this.$t('common.please.select')}
                  labelKey="bankBranchName"
                  onChange={this.handleBankCodeChange}
                  valueKey="bankCode"
                  listExtraParams={{}}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.country')} /* 国家*/
              colon={true}
            >
              {getFieldDecorator('country', {
                initialValue: bankObj.country,
                rules: [],
              })(
                <Input
                  disabled={true}
                  //value={bankObj.country}
                  placeholder={this.$t('company.maintain.bank.account.genrateByBankName')}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.opening')} /* 开户地*/
              colon={true}
            >
              {getFieldDecorator('bankAddress', {
                initialValue: bankObj.bankAddress,
              })(
                <Input
                  disabled={true}
                  //value={bankObj.bankAddress}
                  placeholder={this.$t('company.maintain.bank.account.genrateByBankName')}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.bankAddress')} /* 银行详细地址*/
              colon={true}
            >
              {getFieldDecorator('accountOpeningAddress', {
                initialValue: bankObj.accountOpeningAddress,
                rules: [],
              })(
                <Input
                  disabled={true}
                  //value={bankObj.accountOpeningAddress}
                  placeholder={this.$t('company.maintain.bank.account.genrateByBankName')}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.swiftCode')} /* 开户支行Swift Code*/
              colon={true}
            >
              {getFieldDecorator('swiftCode', {
                initialValue: bankObj.swiftCode,
                rules: [],
              })(
                <Input
                  disabled={true}
                  //value={bankObj.swiftCode}
                  placeholder={this.$t('company.maintain.bank.account.genrateByBankName')}
                />
              )}
            </FormItem>
          </Col>

          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.bankAccountNumber')} //银行账户账号
              colon={true}
            >
              {getFieldDecorator('bankAccountNumber', {
                initialValue: bankObj.bankAccountNumber,
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.enter'),
                  },
                  {
                    message: this.$t('pdc.bank.card.reg2'), //"只能是数字与-",
                    validator: (rule, value, cb) => {
                      if (value === null || value === undefined || value === '') {
                        cb();
                        return;
                      }
                      let regExp = /^[0-9\- ]+$/i;
                      //去掉空格
                      value = value.replace(/ /g, '');
                      if (value.length <= 30 && regExp.test(value)) {
                        cb();
                      } else {
                        cb(false);
                      }
                    },
                  },
                  {
                    max: 30,
                    message: this.$t('company.maintain.new.tips0'), //"不能超过30个字符"
                  },
                ],
              })(<Input placeholder={this.$t('common.please.enter')} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.bankAccountName')} /* 银行账户名称*/
              colon={true}
            >
              {getFieldDecorator('bankAccountName', {
                initialValue: bankObj.bankAccountName,
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.enter'),
                  },
                  {
                    max: 30,
                    message: this.$t('company.maintain.new.tips0'), //"不能超过30个字符"
                  },
                ],
              })(<Input placeholder={this.$t('common.please.enter')} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.accountCode1')} /* 账户代码*/
              colon={true}
            >
              {getFieldDecorator('accountCode', {
                initialValue: bankObj.accountCode,
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.enter'),
                  },
                  {
                    max: 35,
                    message: this.$t('company.maintain.new.tips1'), //"不能超过35个字符"
                  },
                  {
                    message: this.$t('company.maintain.new.tips2'), //只能输入数字与字母
                    validator: (rule, value, cb) => {
                      if (value === null || value === undefined || value === '') {
                        cb();
                        return;
                      }
                      let regExp = /^[a-z0-9]+$/i;
                      //去掉空格
                      value = value.replace(/ /g, '');
                      if (value.length <= 35 && regExp.test(value)) {
                        cb();
                      } else {
                        cb(false);
                      }
                    },
                  },
                ],
              })(<Input placeholder={this.$t('common.please.enter')} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.currencyCode')} //币种
              colon={true}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: bankObj.currencyCode,
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.select'),
                  },
                ],
              })(
                <Selector
                  selectorItem={this.state.selectListCurrencyCode}
                  params={params}
                  filter={item => item.enable}
                  showSearch={true}
                  placeholder={this.$t('common.please.select')}
                  allowClear={false}
                />

                // <Selector
                // placeholder={this.$t("common.please.select")}
                //   selectorItem={this.state.selectListCurrencyCode}/>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              label={this.$t('company.maintain.bank.account.remark')} /* 备注*/
              colon={true}
            >
              {getFieldDecorator('remark', {
                initialValue: bankObj.remark,
                rules: [
                  {
                    max: 100,
                    message: this.$t('company.maintain.new.tips3'), //"不能超过100个字符"
                  },
                ],
              })(<Input placeholder={this.$t('common.please.enter')} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={this.$t('company.maintain.bank.account.state')} /* 状态*/ colon={true}>
              {getFieldDecorator('enabled', {
                initialValue: bankObj.enabled,
                valuePropName: 'checked',
              })(
                <Switch
                  defaultChecked={bankObj.enabled}
                  //checked={bankObj.enabled}
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="cross" />}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <div>
          <Button type="primary" loading={loading} htmlType="submit">
            {this.$t('common.save') /*保存*/}
          </Button>
          <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
            {this.$t('common.cancel') /*取消*/}
          </Button>
        </div>
      </Form>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
  };
}

const NewBankAccount = Form.create()(WrappedNewBankAccount);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(NewBankAccount);
