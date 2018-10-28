import { messages } from "utils/utils";
import { deepCopy } from "utils/extend";
import React from 'react'
import { connect } from 'dva'
import { Button, Form, Switch, Input, Row, Col, message, Spin, Select } from 'antd'
const Option = Select.Option;
const FormItem = Form.Item;
import defaultExpenseTypeIcon from 'images/expense/default-expense-type.png'
import 'styles/setting/expense-type/new-expense-type/expense-type-base.scss'
import baseService from 'share/base.service'
import IconSelector from 'containers/setting/expense-type/new-expense-type/icon-selector'
import expenseTypeService from 'containers/setting/expense-type/expense-type.service'
// import menuRoute from 'routes/menuRoute'
import { LanguageInput } from 'widget/index';
import PropTypes from 'prop-types';
import { routerRedux } from 'dva/router';



class ExpenseTypeBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showIconSelectorFlag: false,
      expenseTypeCategory: [],
      name: '',
      nameI18n: [],
      icon: {
        iconURL: '',
        iconName: ''
      },
      apportionEnabled: false,
      valid: 0,
      subsidyType: 0,
      saving: false,
      // expenseTypePage: menuRoute.getRouteItem('expense-type'),
      // expenseTypeDetailPage: menuRoute.getRouteItem('expense-type-detail')
    }
  }

  componentDidMount() {
    if (!this.props.expenseType) {
      if (!this.props.expenseTypeSetOfBooks.id) {
        this.goBack();
      } else {
        Promise.all([
          baseService.getExpenseTypeCategory(this.props.expenseTypeSetOfBooks.id),
          expenseTypeService.getExpenseTypeCode(this.props.expenseTypeSetOfBooks.id)
        ]).then(res => {
          this.setState({ expenseTypeCategory: res[0].data });
          this.props.form.setFieldsValue({ code: res[1].data.rows });
        });
      }
    } else {
      baseService.getExpenseTypeCategory(this.props.expenseType.setOfBooksId).then(res => {
        this.setState({ expenseTypeCategory: res.data });
        this.setFieldsByExpenseType(this.props);
      });
    }
  }

  goBack = () => {

    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/expense-type"
    }))

    // this.context.router.push(this.state.expenseTypePage.url)
  };

  setFieldsByExpenseType = (props) => {
    const { expenseType } = props;
    let valueWillSet = this.props.form.getFieldsValue();
    Object.keys(valueWillSet).map(key => {
      valueWillSet[key] = expenseType[key];
    });
    this.setState({
      icon: {
        iconURL: expenseType.iconURL,
        iconName: expenseType.iconName
      },
      nameI18n: expenseType.i18n.name,
      name: expenseType.name,
      apportionEnabled: expenseType.apportionEnabled,
      valid: Number(expenseType.valid),
      subsidyType: expenseType.subsidyType
    }, () => {
      valueWillSet.pasteInvoiceNeeded = Number(valueWillSet.pasteInvoiceNeeded);
      valueWillSet.valid = Number(valueWillSet.valid);
      this.props.form.setFieldsValue(valueWillSet)
    })
  };

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { icon, nameI18n, expenseTypeDetailPage } = this.state;
        if (icon.iconURL === '') {
          message.error(messages('expense.type.please.select.icon'));
          return;
        }
        values.pasteInvoiceNeeded = Boolean(values.pasteInvoiceNeeded);
        values.valid = Boolean(values.valid);
        values.iconURL = icon.iconURL;
        values.iconName = icon.iconName;
        values.crossCheckStatus = 0;
        values.setOfBooksId = this.props.expenseTypeSetOfBooks.id;
        if (!values.apportionmentDataScope) {
          values.apportionmentDataScope = 0;
        }
        if (!values.pushType) {
          values.pushType = 'PERSONAL_PAY'
        }
        if (!values.isAmountEditable && values.isAmountEditable !== false) {
          values.isAmountEditable = true;
        }
        values.i18n = {
          name: nameI18n
        };
        this.setState({ saving: true });
        if (this.props.expenseType) {
          let temp = deepCopy(this.props.expenseType);
          if (temp.supplierType !== 0 && temp.supplierType !== 15) {
            values.pasteInvoiceNeeded = temp.pasteInvoiceNeeded;
          }
          let target = Object.assign({}, temp, values);
          expenseTypeService.saveExpenseType(target).then(res => {
            this.setState({ saving: false });
            message.success(messages('common.operate.success'));
            this.props.onSave();
          }).catch(e => {
            this.setState({ saving: false });
          })
        } else {
          values.sequence = 0;
          expenseTypeService.saveExpenseType(values).then(res => {
            this.setState({ saving: false });
            message.success(messages('common.operate.success'));

            this.props.dispatch(routerRedux.push({
              pathname: "/admin-setting/expense-type-detail/" + res.data.rows.id
            }))

            this.props.onSave('custom', res.data.rows.id);
          }).catch(e => {
            this.setState({ saving: false });
            if (e && e.response && e.response.data) {
              let data = e.response.data;
              if (data.validationErrors.length > 0) {
                data.validationErrors.map(error => {
                  if (error.externalPropertyName === 'code unique')
                    message.error(messages('expense.type.code.exist'))
                });
              }
            }
          })
        }
      }
    })
  };

  handleSelectIcon = (target) => {
    const { icon } = this.state;
    icon.iconURL = target.iconURL;
    icon.iconName = target.iconName;
    this.setState({ showIconSelectorFlag: false, icon });
  };

  handleChangeI18n = (name, nameI18n) => {
    this.setState({ name, nameI18n })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { icon, showIconSelectorFlag, expenseTypeCategory, apportionEnabled, valid, saving, name, nameI18n, subsidyType } = this.state;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8, offset: 1 },
    };
    const { expenseType, expenseTypeSetOfBooks, tenantMode } = this.props;
    return (
      <Form className="expense-type-base" onSubmit={this.handleSave}>
        <FormItem {...formItemLayout} label={messages('common.column.status')}>
          {getFieldDecorator('enabled', {
            valuePropName: 'checked',
            initialValue: true
          })(
            <Switch />
            )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('expense.type.select.icon')} required>
          <img src={icon.iconURL || defaultExpenseTypeIcon} className="expense-type-icon"
            onClick={() => { tenantMode && this.setState({ showIconSelectorFlag: true }) }} />
        </FormItem>
        <FormItem {...formItemLayout} label={messages('expense.type.name')}>
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              message: messages('common.please.enter')
            }]
          })(
            <LanguageInput name={name}
              i18nName={nameI18n}
              nameChange={this.handleChangeI18n}
              isEdit={!!expenseType}
              inpRule={[{
                length: 30,
                language: "zh_cn"
              }, {
                length: 30,
                language: "en"
              }]}
              disabled={!tenantMode} />
            )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('expense.type.code')}>
          {getFieldDecorator('code', {
            rules: [{
              required: true,
              message: messages('common.please.enter')
            }, {
              message: messages('expense.type.cannot.enter.space'),
              validator: (rule, value, cb) => {
                if (value === null || value === undefined || value === "") {
                  cb();
                  return;
                }
                if (!value.match(' ')) {
                  cb();
                } else {
                  cb(false);
                }
              }
            }, {
              message: messages('expense.type.cannot.enter.chinese'),
              validator: (rule, value, cb) => {
                if (value === null || value === undefined || value === "") {
                  cb();
                  return;
                }
                if (!/[\u4E00-\u9FA5]/i.test(value)) {
                  cb();
                } else {
                  cb(false);
                }
              }
            }]
          })(
            <Input maxLength="20" placeholder={messages('expense.type.please.enter.less.20')} disabled={!!expenseType} />
            )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('setting.set.of.book')} required>
          <Input disabled value={expenseTypeSetOfBooks.setOfBooksName} />
        </FormItem>
        <FormItem {...formItemLayout} label={messages('expense.type.group')}>
          {getFieldDecorator('expenseTypeCategoryId', {
            rules: [{
              required: true,
              message: messages('common.please.select')
            }]
          })(
            <Select style={{ width: '100%' }} disabled={!tenantMode}>
              {expenseTypeCategory.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
            </Select>
            )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('expense.type.allowance.type')}>
          {getFieldDecorator('subsidyType', {
            initialValue: 0
          })(
            <Select style={{ width: '100%' }} disabled={!!expenseType} onChange={value => this.setState({ subsidyType: value })}>
              <Option value={0}>{messages('expense.type.non.allowance')}</Option>
              <Option value={1}>{messages('expense.type.allowance')}</Option>
              {/*<Option value={2}>{messages('expense.type.daily.allowance')}</Option>*/}
            </Select>
            )}
        </FormItem>
        {expenseType && expenseType.supplierType > 0 && expenseType.supplierType !== 15 /*里程补贴不显示*/ && (
          <FormItem {...formItemLayout} label={messages('expense.type.push.setting')}>
            {getFieldDecorator('pushType', {
              initialValue: expenseType.pushType
            })(
              <Select style={{ width: '100%' }} disabled={!tenantMode}>
                <Option value="PERSONAL_PAY">{messages('expense.type.push.setting.personal')}</Option>
                <Option value="COMPANY_PAY">{messages('expense.type.push.setting.company')}</Option>
                <Option value="ALL">{messages('expense.type.push.setting.personal.company')}</Option>
              </Select>
              )}
          </FormItem>
        )}
        {(!expenseType || expenseType.supplierType === 0 || expenseType.supplierType === 15 /*里程补贴显示*/) && (
          <FormItem {...formItemLayout} label={messages('expense.type.is.with.invoice')}>
            {getFieldDecorator('pasteInvoiceNeeded', {
              initialValue: expenseType ? Number(expenseType.pasteInvoiceNeeded) : 1
            })(
              <Select optionLabelProp="title" style={{ width: '100%' }} disabled={!tenantMode}>
                <Option value={1} title={messages('expense.type.with.invoice')}>
                  {messages('expense.type.with.invoice')}<br />
                  <span style={{ color: '#ccc' }}>{messages('expense.type.with.invoice.description')}</span>
                </Option>
                <Option value={0} title=
                  {messages('expense.type.without.invoice')}>
                  {messages('expense.type.without.invoice')}<br />
                  <span style={{ color: '#ccc' }}>{messages('expense.type.without.invoice.description')}</span>
                </Option>
              </Select>
              )}
          </FormItem>
        )}
        <hr style={{ borderColor: '#fff', marginBottom: 24 }} />
        <FormItem {...formItemLayout} label={messages('expense.type.amount.enter.mode')}>
          <Row gutter={20}>
            <Col span={18}>
              {getFieldDecorator('valid', {
                initialValue: 0
              })(
                <Select style={{ width: '100%' }}
                  onChange={value => this.setState({ valid: value })}
                  disabled={!tenantMode || (expenseType && expenseType.supplierType > 0)}>
                  <Option value={0}>{messages('expense.type.amount.enter.mode.total')}</Option>
                  <Option value={1}>{messages('expense.type.amount.enter.mode.price')}</Option>
                </Select>
                )}
            </Col>
            {valid === 1 && (
              <Col span={6}>
                {getFieldDecorator('unit', {
                  initialValue: (expenseType && expenseType.unit) ? expenseType.unit : "day"
                })(
                  <Select style={{ width: '100%' }} disabled={!tenantMode}>
                    <Option value="day">{messages('expense.type.unit.day')}</Option>
                    <Option value="weak">{messages('expense.type.unit.week')}</Option>
                    <Option value="month">{messages('expense.type.unit.month')}</Option>
                    <Option value="person">{messages('expense.type.unit.person')}</Option>
                    <Option value="unit">{messages('expense.type.unit.unit')}</Option>
                    <Option value="th">{messages('expense.type.unit.th')}</Option>
                  </Select>
                  )}
              </Col>
            )}
          </Row>
        </FormItem>
        {expenseType && expenseType.supplierType > 0 && (expenseType.supplierType !== 15 /*里程补贴不显示*/) && (
          <FormItem {...formItemLayout} label={messages('expense.type.amount.editable')}>
            {getFieldDecorator('isAmountEditable', {
              valuePropName: 'checked',
              initialValue: expenseType ? expenseType.isAmountEditable : true
            })(
              <Switch disabled={!tenantMode} />
              )}
          </FormItem>
        )}
        <FormItem {...formItemLayout} label={messages('expense.type.allocation')}>
          {getFieldDecorator('apportionEnabled', {
            valuePropName: 'checked',
            initialValue: false
          })(
            <Switch onChange={value => this.setState({ apportionEnabled: value })} disabled={!tenantMode} />
            )}
        </FormItem>
        {apportionEnabled && (
          <FormItem {...formItemLayout} label={messages('expense.type.allocation.scope')}>
            {getFieldDecorator('apportionmentDataScope', {
              initialValue: expenseType ? expenseType.apportionmentDataScope : 0
            })(
              <Select style={{ width: '100%' }} disabled={!tenantMode}>
                <Option value={0}>{messages('expense.type.allocation.set.of.books')}</Option>
                <Option value={1}>{messages('expense.type.allocation.scope.user')}</Option>
              </Select>
              )}
          </FormItem>
        )}
        <FormItem {...formItemLayout} label={messages('common.attachments')}>
          {getFieldDecorator('attachmentRequired', {
            initialValue: 0
          })(
            <Select optionLabelProp="title" style={{ width: '100%' }} disabled={!tenantMode}>
              <Option value={1} title={messages('expense.type.attachments.1')}>{messages('expense.type.attachments.1')}</Option>
              <Option value={0} title={messages('expense.type.attachments.0')}>{messages('expense.type.attachments.0')}</Option>
              <Option value={3} title={messages('expense.type.attachments.3')}>{messages('expense.type.attachments.3')}<br /><span style={{ color: '#ccc' }}>{messages('expense.type.attachments.3.1')}</span></Option>
              <Option value={2} title={messages('expense.type.attachments.2')}>{messages('expense.type.attachments.2')}<br /><span
                style={{ color: '#ccc', whiteSpace: 'normal' }}>
                {messages('expense.type.attachments.2.1')}</span></Option>
            </Select>
            )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('expense.type.reason.required')}>
          {getFieldDecorator('titleRequired', {
            valuePropName: 'checked',
            initialValue: false
          })(
            <Switch disabled={!tenantMode} />
            )}
        </FormItem>
        <FormItem {...formItemLayout} wrapperCol={{ offset: 5 }}>
          <Button type="primary" htmlType="submit" loading={saving}>{messages('common.save')}</Button>
          <Button style={{ marginLeft: 8 }} onClick={this.goBack}>{messages('common.back')}</Button>
        </FormItem>
        <IconSelector visible={showIconSelectorFlag}
          onOk={this.handleSelectIcon}
          onCancel={() => this.setState({ showIconSelectorFlag: false })} />
      </Form>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    language: state.languages.languages,
    expenseTypeSetOfBooks: state.setting.expenseTypeSetOfBooks,
    tenantMode: true
  }
}

ExpenseTypeBase.propTypes = {
  expenseType: PropTypes.object,
  onSave: PropTypes.func
};

const WrappedExpenseTypeBase = Form.create()(ExpenseTypeBase);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedExpenseTypeBase)
