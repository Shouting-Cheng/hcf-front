import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Form,
  Input,
  Switch,
  Button,
  DatePicker,
  Icon,
  Select,
  message,
  Spin,
  Tooltip,
  Radio,
} from 'antd';
const FormItem = Form.Item;
import config from 'config';
const Option = Select.Option;
const RadioGroup = Radio.Group;
import moment from 'moment';
import contractService from 'containers/contract/contract-approve/contract.service';
import SelectEmployeeGroup from 'components/Widget/Template/select-employee-group';
import 'styles/contract/contract-type/new-contract-type.scss';
import Chooser from 'components/Widget/chooser';
import SelectReceivablesNameCode from 'components/Widget/select-receivables-name-code';

class NewContractType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fetching: false,
      enabled: true,
      employeeDisabled: true,
      startValue: null,
      endValue: null,
      setOfBooksOptions: [],
      contractCategory: [],
      partner: {
        disabled: true,
      },
      headerData: {},
      partnerCategoryOptions: [],
      formTypeOptions: [],
      radioValue: 'all',
      showSelectEmployeeGroup: false,
      chosenEmployeeIDs: [],
      editTag: false,
    };
  }
  componentDidMount() {
    let headerData = { ...this.props.params.contractHead };
    let partner = this.state.partner;
    headerData.partnerId = { value: headerData.partnerId, label: headerData.partnerName };
    this.props.form.setFieldsValue({
      partnerCategory: {
        key: headerData.partnerCategory || 'VENDER',
        label: headerData.partnerCategoryName || this.$t('itinerary.public.slide.supplier'),
      },
    });
    this.setState({
      headerData,
      employeeDisabled: headerData.unitId ? false : true,
    });
  }

  getContractType = () => {
    this.getSystemValueList(2107).then(res => {
      //合同方类型
      let partnerCategoryOptions = res.data.values || [];
      this.setState({ partnerCategoryOptions });
    });
  };

  //新建保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      console.log(values);
      if (!err) {
        this.setState({ loading: true });
        values.id = this.state.headerData.id;
        values.versionNumber = this.state.headerData.versionNumber;
        values.contractTypeId = this.state.headerData.contractTypeId;
        //values.signDate = values.signDate && values.signDate.format("YYYY-MM-DD");
        //values.startDate = values.startDate && values.startDate.format('YYYY-MM-DD');
        //values.endDate = values.endDate && values.endDate.format('YYYY-MM-DD');
        if (!values.startDate) {
          values.startDate = '';
        }
        if (!values.endDate) {
          values.endDate = '';
        }
        values.companyId = this.state.headerData.companyId;
        values.unitId = values.unitId && values.unitId[0] && values.unitId[0].departmentId;
        if (!values.unitId) {
          values.unitId = '';
        }
        values.partnerCategory = values.partnerCategory.key;
        values.partnerId = values.partnerId.key;
        values.employeeId =
          values.employeeId && values.employeeId[0] && values.employeeId[0].userId;
        if (!values.employeeId) {
          values.employeeId = '';
        }
        values.contractCategory = this.state.headerData.contractCategory;
        values.remark = this.state.headerData.remark;
        let method = null;
        let flag = false;
        if (this.state.headerData.id) {
          method = contractService.updateEditInfoContractHeader;
          values.id = this.state.headerData.id;
          flag = true;
        } else {
          method = contractService.addContractInfo;
        }
        method(values)
          .then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success(this.$t({ id: 'common.save.success' }, { name: '' } /*保存成功*/));
              this.props.onClose(true);
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(
              `${this.$t({ id: 'common.save.filed' } /*保存失败*/)}，${e.response.data.message}`
            );
          });
      }
    });
  };

  handleDateChange = (value, key) => {
    this.setState({ [key]: value });
  };

  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  getPartnerName = () => {};

  getPerson = () => {};

  /*handlePartnerCategory = (value) =>{
    console.log(value)
    console.log(this.props.form.getFieldValue('partnerCategory'))
    if(value){
      const partner = this.state.partner;
      partner.disabled = false;
      if(value.key === 'EMPLOYEE'){
        console.log(21231231232131)
        partner.listType = 'contract_user';
        partner.valueKey = 'id';
        partner.labelKey = 'fullName';
        partner.url = `${config.baseUrl}/api/select/user/by/name/or/code/and/company`;
        partner.listExtraParams = {companyId: this.state.headerData.companyId}
      }
      if(value.key === 'VENDER'){
        partner.listType = 'department'
      }
      this.setState({partner})
    }
  };*/

  handleDept = value => {
    if (value && value.length && value[0].departmentId) {
      const headerData = this.state.headerData;
      headerData.unitId = value;
      this.props.form.setFieldsValue({ unitId: value });
      this.setState({ headerData, employeeDisabled: false });
    }
  };

  //取消
  handleCancel = () => {
    let partner = this.state.partner;
    partner.disabled = true;
    this.setState(
      {
        employeeDisabled: true,
        headerData: {},
        partner,
      },
      () => {
        this.props.onClose();
      }
    );
  };

  handlePartnerCategory = value => {
    if (value && value.key) {
      this.props.form.setFieldsValue({ partnerId: { key: '', label: '' } });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      loading,
      headerData,
      partner,
      employeeDisabled,
      partnerCategoryOptions,
      startValue,
      endValue,
      partnerCategory,
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

    return (
      <div className="new-contract-type">
        <div className="common-item-title">
          {this.$t({ id: 'pre.payment.essential.information' }) /*基本信息*/}
        </div>
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t('my.contract.contractCompany')}>
            {getFieldDecorator('companyId', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: headerData.companyName,
            })(<Input disabled />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('my.contract.name')}>
            {getFieldDecorator('contractName', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }),
                },
              ],
              initialValue: headerData.contractName,
            })(<Input placeholder={this.$t({ id: 'common.please.enter' })} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('my.contract.signDate')}>
            {getFieldDecorator('signDate', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }),
                },
              ],
              initialValue: headerData.contractName ? moment(headerData.signDate) : null,
            })(
              <DatePicker
                style={{ width: '100%' }}
                placeholder={this.$t({ id: 'common.please.enter' })}
              />
            )}
          </FormItem>

          <div className="common-item-title">{this.$t('my.contract.party.info')}</div>
          <FormItem {...formItemLayout} label={this.$t('my.contract.partner.category')}>
            {getFieldDecorator('partnerCategory', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }),
                },
                {
                  validator: (item, value, callback) => {
                    if (!value.key) {
                      callback(this.$t({ id: 'common.please.select' }));
                    }
                    callback();
                  },
                },
              ],
              initialValue: {
                key: headerData.partnerCategory || '"VENDER"',
                label: headerData.partnerCategoryName,
              },
            })(
              <Select
                labelInValue
                onChange={this.handlePartnerCategory}
                onFocus={partnerCategoryOptions.length === 0 ? this.getContractType : () => {}}
                placeholder={this.$t({ id: 'common.please.select' })}
              >
                {partnerCategoryOptions.map(item => (
                  <Option key={item.code}>{item.messageKey}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          {this.props.params.flag && (
            <FormItem {...formItemLayout} label={this.$t('my.contract.partner.name')}>
              {getFieldDecorator('partnerId', {
                rules: [
                  {
                    required: true,
                    message: this.$t({ id: 'common.please.enter' }),
                  },
                  {
                    validator: (item, value, callback) => {
                      if (!value.key) {
                        callback(this.$t({ id: 'common.please.select' }));
                      }
                      callback();
                    },
                  },
                ],
                initialValue: {
                  key: headerData.partnerId ? headerData.partnerId.value : '',
                  label: headerData.partnerId ? headerData.partnerName : '',
                },
              })(
                <SelectReceivablesNameCode
                  type={
                    this.props.form.getFieldValue('partnerCategory')
                      ? this.props.form.getFieldValue('partnerCategory').key
                      : ''
                  }
                />
              )}
            </FormItem>
          )}

          <div className="common-item-title">{this.$t('supplier.management.otherInfo')}</div>
          <FormItem {...formItemLayout} label={this.$t('my.contract.responsible.department')}>
            {getFieldDecorator('unitId', {
              initialValue: headerData.unitId
                ? [{ departmentId: headerData.unitId, name: headerData.unitName }]
                : null,
            })(
              <Chooser
                type="contract_department"
                onChange={this.handleDept}
                valueKey="departmentId"
                single={true}
                placeholder={this.$t({ id: 'common.please.select' })}
                labelKey="name"
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('my.contract.responsible.person')}>
            {getFieldDecorator('employeeId', {
              initialValue:
                headerData.contractName && headerData.employee
                  ? [
                      {
                        userId: headerData.employeeId,
                        userName: headerData.employee ? headerData.employee.fullName : null,
                      },
                    ]
                  : null,
            })(
              <Chooser
                type="select_authorization_user"
                disabled={headerData.unitId ? false : employeeDisabled}
                onSearch={this.getPerson}
                single={true}
                valueKey="userId"
                placeholder={this.$t({ id: 'common.please.select' })}
                labelKey="userName"
                listExtraParams={{
                  departmentId: headerData.unitId && headerData.unitId[0].departmentId,
                }}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('my.limit.time')}>
            {getFieldDecorator('startDate', {
              initialValue:
                headerData.contractName && headerData.startDate
                  ? moment(headerData.startDate)
                  : startValue,
            })(
              <DatePicker
                disabledDate={this.disabledStartDate}
                style={{ width: '47%' }}
                placeholder={this.$t('my.date.from')}
                onChange={value => this.handleDateChange(value, 'startValue')}
              />
            )}
            {getFieldDecorator('endDate', {
              initialValue:
                headerData.contractName && headerData.endDate
                  ? moment(headerData.endDate)
                  : endValue,
            })(
              <DatePicker
                disabledDate={this.disabledEndDate}
                style={{ width: '47%', marginLeft: '6%' }}
                placeholder={this.$t('my.date.to')}
                onChange={value => this.handleDateChange(value, 'endValue')}
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
        <SelectEmployeeGroup
          visible={showSelectEmployeeGroup}
          onCancel={this.handleSelectEmployeeCancel}
          onOk={this.handleSelectEmployeeOk}
          selectedData={chosenEmployeeIDs}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

const wrappedNewContractType = Form.create()(NewContractType);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewContractType);
