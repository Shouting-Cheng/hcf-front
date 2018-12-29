import { messages } from 'share/common';
/**
 * Created by fudebao on 2017/12/05.
 */

//这个我们融智汇这边没有用
//先不动
//麻烦最初写这个文件的开发者，在上面备注一下，这个页面是干什么的
//如果没有用，就删除了

import React from 'react';
import { connect } from 'react-redux';

import { Button, Form, Switch, Input, message, Icon, Select, Radio, DatePicker } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import Chooser from 'components/chooser';

import config from 'config';
import httpFetch from 'share/httpFetch';
import moment from 'moment';

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
      // isDisabled: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params) {
      this.setState({ params: nextProps.params });
    }
  }

  //编辑保存
  handleSave = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });

        values.authorizeCompanyId = values.authorizeCompanyId[0].id;
        values.authorizeEmployeeId = values.authorizeEmployeeId[0].userOid;
        values.authorizeDepartmentId = values.authorizeDepartmentId[0].id;

        values.bankAccountId = this.state.params.companyBankId;

        delete values.authorizeCompanyName;
        delete values.authorizeDepartmentName;
        delete values.authorizeEmployeeName;

        let toValue = {
          ...this.state.params,
          ...values,
        };
        httpFetch
          .post(`${config.baseUrl}/api/companyBankAuth/insertOrUpdate`, toValue)
          .then(res => {
            this.setState({ loading: false });
            this.props.form.resetFields();
            this.props.close(true);
            message.success(messages('common.operate.success'));
          })
          .catch(e => {
            this.setState({ loading: false });

            message.error(messages('common.save.filed') + `${e.response.data.message}`);
          });
      }
    });
  };

  onCancel = () => {
    this.props.close();
  };

  companyChange = value => {
    let info = value[0];

    this.props.form.setFieldsValue({ authorizeCompanyName: info.name });

    this.setState({ extraParams: { ...this.state.extraParams, companyId: info.id } });
  };

  deptChange = value => {
    let info = value[0];

    this.props.form.setFieldsValue({ authorizeDepartmentName: info.name });

    this.setState({ extraParams: { ...this.state.extraParams, departmentId: info.id } });
  };

  employeeChange = value => {
    let info = value[0];

    this.props.form.setFieldsValue({
      authorizeEmployeeName: info.userName,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      params,
      companyTypeList,
      setOfBooksNameList,
      legalEntityList,
      companyLevelList,
      parentCompanyList,
      dateFormat,
      extraParams,
      disable,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 6, offset: 1 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-payment-method">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={messages('company.startDateActive')}>
            {getFieldDecorator('authorizeDateFrom', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: moment(
                params.authorizeDateFrom ? params.authorizeDateFrom : new Date(),
                dateFormat
              ),
            })(<DatePicker />)}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('company.endDateActive')}>
            {getFieldDecorator('authorizeDateTo', {
              rules: [
                {
                  required: false,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: moment(
                params.authorizeDateTo ? params.authorizeDateTo : new Date(),
                dateFormat
              ),
            })(<DatePicker />)}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('common.column.status')}>
            {getFieldDecorator('enabled', {
              initialValue: params.id ? params.isEnabled : true,
            })(
              <Switch
                defaultChecked={this.props.form.getFieldValue('enabled') ? true : false}
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
              />
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled')
              ? messages('common.status.enable')
              : messages('common.status.disable')}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.companyCode')}>
            {getFieldDecorator('authorizeCompanyId', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: params.companyId
                ? [{ id: params.companyId, code: params.companyCode }]
                : [],
            })(
              <Chooser
                placeholder={messages('common.please.select')}
                type="available_company"
                labelKey="name"
                valueKey="id"
                single={true}
                onChange={this.companyChange}
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.companyName')}>
            {getFieldDecorator('authorizeCompanyName', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: params.companyId ? params.companyName : '',
            })(<Input disabled />)}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.departmentCode')}>
            {getFieldDecorator('authorizeDepartmentId', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: params.departmentCode
                ? [{ id: params.departmentId, code: params.departmentCode }]
                : [],
            })(
              <Chooser
                placeholder={messages('common.please.select')}
                type="journal_line_department"
                labelKey="name"
                valueKey="id"
                single={true}
                onChange={this.deptChange}
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.departmentName')}>
            {getFieldDecorator('authorizeDepartmentName', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: params.departmentCode ? params.departmentName : '',
            })(<Input disabled />)}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.employeeCode')}>
            {getFieldDecorator('authorizeEmployeeId', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: params.employeeOid
                ? [{ userOID: params.employeeOid, userCode: params.employee }]
                : [],
            })(
              <Chooser
                placeholder={messages('common.please.select')}
                type="select_authorization_user"
                onChange={this.employeeChange}
                labelKey="userCode"
                valueKey="userOID"
                single={true}
                listExtraParams={extraParams}
                disabled={
                  !(
                    this.props.form.getFieldValue('authorizeDepartmentId') &&
                    this.props.form.getFieldValue('authorizeDepartmentId').length &&
                    this.props.form.getFieldValue('authorizeCompanyId') &&
                    this.props.form.getFieldValue('authorizeCompanyId').length
                  )
                }
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={messages('authorization.employeeName')}>
            {getFieldDecorator('authorizeEmployeeName', {
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter'),
                },
              ],
              initialValue: params.employeeOid ? params.employeeName : '',
            })(<Input disabled />)}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>
              {messages('common.save')}
            </Button>
            <Button onClick={this.onCancel}>{messages('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

const WrappedAddAuthorization = Form.create()(AddAuthorization);

function mapStateToProps(state) {
  return {
    company: state.login.company,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedAddAuthorization);
