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
      priceUnit: "",
      entryMode: false,
      types: [],
      budgetItemName: ""
      // expenseTypePage: menuRoute.getRouteItem('expense-type'),
      // expenseTypeDetailPage: menuRoute.getRouteItem('expense-type-detail')
    }
  }

  componentDidMount() {
    if (!this.props.expenseType) {
      if (!this.props.expenseTypeSetOfBooks.id) {
        this.goBack();
      } else {
        expenseTypeService.getExpenseTypeCategory(this.props.expenseTypeSetOfBooks.id).then(res => {
          this.setState({ expenseTypeCategory: res.data });
        });
      }
    } else {
      expenseTypeService.getExpenseTypeCategory(this.props.expenseType.setOfBooksId).then(res => {
        this.setState({ expenseTypeCategory: res.data, budgetItemName: this.props.expenseType.budgetItemName });
        this.setFieldsByExpenseType(this.props);
      });

      this.typeCategoryChange(this.props.expenseType.typeCategoryId);

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
        iconURL: expenseType.iconUrl,
        iconName: expenseType.iconName
      },
      nameI18n: expenseType.i18n.name,
      name: expenseType.name,
      apportionEnabled: expenseType.apportionEnabled,
      valid: Number(expenseType.valid),
      subsidyType: expenseType.subsidyType,
      entryMode: expenseType.entryMode,
      budgetItemName: expenseType.budgetItemName,
      priceUnit: expenseType.priceUnit,
      attachmentFlag: expenseType.attachmentFlag + ""

    }, () => {
      valueWillSet.pasteInvoiceNeeded = Number(valueWillSet.pasteInvoiceNeeded);
      valueWillSet.valid = Number(valueWillSet.valid);
      valueWillSet.attachmentFlag = expenseType.attachmentFlag + "";
      valueWillSet.sourceTypeId = { label: expenseType.sourceTypeName, key: valueWillSet.sourceTypeId };
      valueWillSet.attachmentFlag === 'null'&& (valueWillSet.attachmentFlag = '');
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
        values.typeFlag = 1;
        values.sourceTypeId = values.sourceTypeId && values.sourceTypeId.key;
        values.priceUnit = this.state.priceUnit;
        values.entryMode = this.state.entryMode;
        values.setOfBooksId = this.props.expenseTypeSetOfBooks.id;
        values.iconUrl = icon.iconURL;
        values.iconName = icon.iconName;

        if (this.props.expenseType) {
          values.id = this.props.expenseType.id;
          this.setState({ saving: true });
          expenseTypeService.editExpenseType(values).then(res => {
            this.setState({ saving: false });
            this.props.onSave();
            message.success("更新成功！");
          }).catch(error => {
            this.setState({ saving: false });
            message.error(error.response.data.message);
          })
        } else {
          this.setState({ saving: true });
          expenseTypeService.saveExpenseType(values).then(res => {
            this.setState({ saving: false });
            this.props.dispatch(routerRedux.push({
              pathname: "/admin-setting/expense-type-detail/" + res.data.id
            }));
          }).catch(error => {
            this.setState({ saving: false });
            message.error(error.response.data.message);
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

  entryModeChange = (value) => {
    if (value) {
      this.setState({ priceUnit: "day", entryMode: value });
    } else {
      this.setState({ priceUnit: "", entryMode: value });
    }
  }

  typeCategoryChange = (value) => {
    expenseTypeService.getTypes(value).then(res => {
      this.setState({
        types: res.data,
        sourceTypeId: ""
      });
    }).catch(err => {
      message.error(err.response.data.message);
    })
  };

  sourceTypeChange = (value) => {
    if (value) {
      let model = this.state.types.find(o => o.id == value.key);

      this.setState({
        budgetItemName: model.budgetItemName
      });
    }
  };


  render() {
    const { getFieldDecorator } = this.props.form;
    const { icon, showIconSelectorFlag, expenseTypeCategory, apportionEnabled, valid, saving, name, nameI18n, subsidyType, types } = this.state;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8, offset: 1 },
    };
    const { expenseType, expenseTypeSetOfBooks, tenantMode } = this.props;
    return (
      <Form className="expense-type-base" onSubmit={this.handleSave}>
        <FormItem {...formItemLayout} label={messages('setting.set.of.book')} required>
          <Input disabled value={expenseTypeSetOfBooks.setOfBooksName} />
        </FormItem>
        <FormItem {...formItemLayout} label={messages('图标')} required>
          <img src={icon.iconURL || defaultExpenseTypeIcon} className="expense-type-icon"
            onClick={() => { tenantMode && this.setState({ showIconSelectorFlag: true }) }} />
        </FormItem>
        <FormItem {...formItemLayout} label={messages('费用类型代码')}>
          {getFieldDecorator('code', {
            rules: [{
              required: true,
              message: messages('common.please.enter')
            }]
          })(
            <Input disabled={!!expenseType} />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('费用类型名称')}>
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
        <FormItem {...formItemLayout} label={messages('common.column.status')}>
          {getFieldDecorator('enabled', {
            valuePropName: 'checked',
            initialValue: true
          })(
            <Switch />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('分类名称')}>
          {getFieldDecorator('typeCategoryId', {
            rules: [{
              required: true,
              message: messages('common.please.select')
            }]
          })(
            <Select onChange={this.typeCategoryChange} style={{ width: 400 }} disabled={!tenantMode}>
              {expenseTypeCategory.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('申请类型')}>
          {getFieldDecorator('sourceTypeId', {
          })(
            <Select labelInValue={true} allowClear onChange={this.sourceTypeChange} disabled={!this.props.form.getFieldValue("typeCategoryId")} style={{ width: 400 }}>
              {types.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
            </Select>
          )}
        </FormItem>
        {this.props.form.getFieldValue("sourceTypeId") && (<FormItem {...formItemLayout} label={messages('预算项目')}>
          <Input value={this.state.budgetItemName} disabled style={{ width: 400 }} />
        </FormItem>)}
        <FormItem {...formItemLayout} label={messages('金额录入模式')}>
          {getFieldDecorator('entryMode', {
            initialValue: 0
          })(
            <Row gutter={20}>
              <Col span={16}>
                <Select value={this.state.entryMode} allowClear style={{ width: '100%' }} onChange={this.entryModeChange}>
                  <Option value={false}>总金额</Option>
                  <Option value={true}>单价*数量</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Select value={this.state.priceUnit} style={{ width: '100%' }} disabled={!this.state.entryMode} onChange={value => this.setState({ priceUnit: value })}>
                  <Option value="day">天</Option>
                  <Option value="week">周</Option>
                  <Option value="month">月</Option>
                  <Option value="person">人</Option>
                  <Option value="ge">个</Option>
                  <Option value="time">次</Option>
                </Select>
              </Col>
            </Row>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={messages('附件')}>
          {getFieldDecorator('attachmentFlag', {

          })(
            <Select allowClear style={{ width: 400 }}>
              <Option value="1">始终必填</Option>
              <Option value="2">始终不必填</Option>
              <Option value="3">仅有发票原件时不必填</Option>
              <Option value="4">有发票时不必填</Option>
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} wrapperCol={{ offset: 5 }}>
          <Button type="primary" htmlType="submit" loading={saving}>{messages('common.save')}</Button>
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
