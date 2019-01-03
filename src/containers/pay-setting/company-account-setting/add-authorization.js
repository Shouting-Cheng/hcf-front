import {messages} from "utils/utils";
/**
 * Created by fudebao on 2017/12/05.
 */
import React from 'react';
import { connect } from 'dva';

import { Button, Form, Switch, Input, message, Icon, Select, Radio, DatePicker } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import Chooser from 'widget/chooser'

import config from 'config';
import httpFetch from 'share/httpFetch';
import moment from 'moment';
import companyAccountSettingService from './company-account-setting.service'

class AddAuthorization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      loading: false,
      companyTypeList: [],
      setOfBooksNameList: [],
      legalEntityList: [],
      companyLevelList: [],
      parentCompanyList: [],
      dateFormat: 'YYYY/MM/DD',
      extraParams: {},
      disable: true,
      startValue: "",
      endValue: "",
      queryFlag:true
      // isDisabled: false
    };
  }

  componentDidMount () {
    this.setState({
      params: this.props.params.record,
      queryFlag:false,
      extraParams: { companyId: this.props.params.record.companyId, departmentId: this.props.params.record.departmentId }
    })
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }


  onStartChange = (value) => {
    this.onChange('startValue', value);
  }

  onEndChange = (value) => {
    this.onChange('endValue', value);
  }

  //编辑保存
  handleSave = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {

        this.setState({ loading: true });

        values.authorizeDateFrom = new Date(values.authorizeDateFrom.format('YYYY-MM-DD'));
        values.authorizeDateTo && (values.authorizeDateTo = new Date(values.authorizeDateTo.format('YYYY-MM-DD')));

        values.authorizeCompanyId = values.authorizeCompanyId[0].id;
        if (values.authorizeEmployeeId[0]) {
          values.authorizeEmployeeId = values.authorizeEmployeeId[0].userOid;
        } else {
          values.authorizeEmployeeId = null;
        }
        if (values.authorizeDepartmentId[0]) {
          values.authorizeDepartmentId = values.authorizeDepartmentId[0].departmentId;
        } else {
          values.authorizeDepartmentId = null;
        }

        values.bankAccountId = this.state.params.companyBankId;

        delete values.authorizeCompanyName;
        delete values.authorizeDepartmentName;
        delete values.authorizeEmployeeName;

        let toValue = {
          ...this.state.params,
          ...values,
        }

        if (toValue.authorizeDepartmentId == null) {
          toValue.authFlag = 1001;
        }
        else {
          if (!toValue.authorizeEmployeeId) {
            toValue.authFlag = 1002;
          }
          else {
            toValue.authFlag = 1003;
          }
        }

        // httpFetch.post(`${config.baseUrl}/api/companyBankAuth/insertOrUpdate`, toValue).then((res) => {
        companyAccountSettingService.saveAuthorization(toValue).then((res) => {
          this.setState({ loading: false });
          this.props.form.resetFields();
          this.props.onClose(true);
          message.success(messages('common.operate.success'));
        }).catch((e) => {
          this.setState({ loading: false });

          message.error(messages('common.save.filed') + `${e.response.data.message}`);
        })
      }
    });
  }

  onCancel = () => {
    this.props.onClose();
  };

  companyChange = (value) => {

    let info = value[0];

    if (info) {
      if (info.name) {
        this.props.form.setFieldsValue({ authorizeCompanyName: info.name, authorizeEmployeeId: [], authorizeEmployeeName: "" });
        this.setState({ extraParams: { ...this.state.extraParams, companyId: info.id } });
      }
    }
  }

  deptChange = (value) => {

    let info = value[0];

    if (info) {

      if (info.name) {
        this.props.form.setFieldsValue({ authorizeDepartmentName: info.name });
        this.setState({ extraParams: { ...this.state.extraParams, departmentId: info.departmentId } });

        this.props.form.setFieldsValue({ authorizeEmployeeId: [], authorizeEmployeeName: "" });
      }

    }

  }

  employeeChange = (value) => {
    let info = value[0];
    if (info) {
      if (info.userName) {
        this.props.form.setFieldsValue({
          authorizeEmployeeName: info.userName
        })
      }
    }
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { params, companyTypeList, setOfBooksNameList, legalEntityList, companyLevelList, parentCompanyList, dateFormat, extraParams, disable } = this.state;
    const formItemLayout = {
      labelCol: { span: 6, offset: 1 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      this.props.params.flag && <div className="new-payment-method">
        <Form onSubmit={this.handleSave}>

          <FormItem {...formItemLayout} label={messages('company.startDateActive')}>
            {getFieldDecorator('authorizeDateFrom', {
              rules: [{
                required: true,
                message: messages('common.please.enter')
              }],
              initialValue: params.authorizeDateFrom ? moment(params.authorizeDateFrom, dateFormat) : null
            })(
              <DatePicker onChange={this.onStartChange} disabledDate={this.disabledStartDate} />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('company.endDateActive')}>
            {getFieldDecorator('authorizeDateTo', {
              rules: [{
                required: false,
                message: messages('common.please.enter')
              }],
              initialValue: params.authorizeDateTo ? moment(params.authorizeDateTo, dateFormat) : null
            })(
              <DatePicker onChange={this.onEndChange} disabledDate={this.disabledEndDate} />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('common.column.status')}>
            {getFieldDecorator('enabled', {
              initialValue: params.id ? params.enabled : true
            })(
              <Switch checked={this.props.form.getFieldValue('enabled') ? true : false} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? messages('common.status.enable') : messages('common.status.disable')}
          </FormItem>


          <FormItem {...formItemLayout} label={messages('authorization.companyCode')}>
            {getFieldDecorator('authorizeCompanyId', {
              rules: [{
                required: true,
                message: messages('common.please.enter')
              }],
              initialValue: params.company || new Array()
            })(
              <Chooser placeholder={messages('common.please.select')}
                type="select_companies"
                listExtraParams={{enabled:true}}
                labelKey="companyCode"
                valueKey="id"
                single={true}
                onChange={this.companyChange} />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.companyName')}>
            {getFieldDecorator('authorizeCompanyName', {
              rules: [{
                required: true,
                message: messages('common.please.enter')
              }],
              initialValue: params.companyId ? params.companyName : ""
            })(
              <Input disabled />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.departmentCode')}>
            {getFieldDecorator('authorizeDepartmentId', {
              // rules: [{
              //   required: true,
              //   message: messages('common.please.enter')
              // }],
              initialValue: params.departmentCode ? [{ id: params.departmentId, code: params.departmentCode,departmentId: params.departmentId,departmentCode:params.departmentCode}] : []
            })(
              < Chooser placeholder={messages('common.please.select')}
                type="department"
                labelKey="departmentCode"
                valueKey="departmentId"
                single={true}
                onChange={this.deptChange}
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.departmentName')}>
            {getFieldDecorator('authorizeDepartmentName', {
              // rules: [{
              //   required: true,
              //   message: messages('common.please.enter')
              // }],
              initialValue: params.departmentCode ? params.departmentName : ""
            })(
              <Input disabled />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.employeeCode')}>
            {getFieldDecorator('authorizeEmployeeId', {
              // rules: [{
              //   required: true,
              //   message: messages('common.please.enter')
              // }],
              initialValue: params.authorizeEmployeeId ? [{ userOid: params.authorizeEmployeeId, userCode: params.employeeCode }] : []
            })(
              <Chooser placeholder={messages('common.please.select')}
                type="select_authorization_user"
                onChange={this.employeeChange}
                labelKey="userCode"
                valueKey="userOid"
                single={true}
                listExtraParams={extraParams}
                disabled={!(this.props.form.getFieldValue('authorizeDepartmentId') && this.props.form.getFieldValue('authorizeDepartmentId').length && this.props.form.getFieldValue('authorizeCompanyId') && this.props.form.getFieldValue('authorizeCompanyId').length)}
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.employeeName')}>
            {getFieldDecorator('authorizeEmployeeName', {
              // rules: [{
              //   required: true,
              //   message: messages('common.please.enter')
              // }],
              initialValue: params.authorizeEmployeeId ? params.employeeName : ""
            })(
              <Input disabled />
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit"
              loading={this.state.loading}>{messages('common.save')}</Button>
            <Button onClick={this.onCancel}>{messages('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

const WrappedAddAuthorization = Form.create()(AddAuthorization);

function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedAddAuthorization);
