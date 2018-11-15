import React from 'react'
import { connect } from 'dva';

import { Form, Input, Select, Button, InputNumber, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import LanguageInput from 'components/Widget/Template/language-input/language-input'
import periodDefineService from 'containers/finance-setting/account-period-define/account-period-define.service'

class NewAccountPeriod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      periodAdditionalFlags: [],
      loading: false,
      periodSetName: [], //会计期名称国际化
      period: {},
    };
  }

  componentWillMount(){
    this.setState({ 
      period: JSON.parse(JSON.stringify(this.props.params.period)),
    })
    this.getSystemValueList(1010).then(res => {
      this.setState({ periodAdditionalFlags: res.data.values || [] })
    })
  }

  componentDidMount(){
    if (!this.props.params.hasInit) {
      this.props.params.hasInit = true;
      this.props.form.resetFields()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.params.hasInit) {
      nextProps.params.hasInit = true;
      this.props.form.resetFields()
    }
  }

  handlePeriodSetNameChange = (value, i18n) => {
    this.setState({ periodSetName: i18n })
  };

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { period } = this.props.params;
        values.i18n = {};
        values.i18n.periodSetName = this.state.periodSetName;
        if (period) { //编辑
          values.id = period.id;
          values.deleted = period.deleted;
          values.enabled = period.enabled;
        }
        this.setState({loading: true});
        periodDefineService[period ? 'updatePeriodDefine' : 'newPeriodDefine'](values).then(() => {
          this.setState({loading: false});
          message.success(this.$t('common.save.success', {name:""}));
          this.props.onClose(true);
        }).catch(e => {
          this.setState({loading: false});
          message.error(`${this.$t('common.save.filed')}, ${e.response.data.message}`);
        })
      }
    })
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const {period, loading, periodAdditionalFlags } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-budget-organization">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t('account.period.define.code')/*会计期代码*/}>
            {getFieldDecorator('periodSetCode', {
              rules: [{
                required: true,
                message: this.$t('common.please.enter')
              }, {
                max: 36,
                message: this.$t('common.max.characters.length', {max: 36})
              }, {
                pattern: '^[a-zA-Z0-9_]{1,}$',
                message: this.$t('account.period.define.only.input') //只能输入字母,数字和下划线
              }],
              initialValue: period ? period.periodSetCode : ''
            })(
              <Input disabled={!!period} placeholder={this.$t('common.please.enter')}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('account.period.define.rule.total-period')/*期间总数*/}>
            {getFieldDecorator('totalPeriodNum', {
              rules: [{
                required: true,
                message: this.$t('common.please.enter')
              }],
              initialValue: period ? period.totalPeriodNum : 12
            })(
              <InputNumber precision={0} disabled={!!period} min={12} max={20} onChange={() => {}} placeholder={this.$t('common.please.enter')}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('account.period.define.name')/*会计期名称*/}>
            {getFieldDecorator('periodSetName', {
              rules: [{
                required: true,
                message: this.$t('common.please.enter')
              }, {
                max: 100,
                message: this.$t('common.max.characters.length', {max: 100})
              }],
              initialValue: period ? period.periodSetName : ''
            })(
              <LanguageInput name={period && period.periodSetName}
                             i18nName={period && period.i18n.periodSetName}
                             isEdit={period && period.i18n.periodSetName}
                             nameChange={this.handlePeriodSetNameChange}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('account.period.define.rule.addition-name')/*名称附加*/}>
            {getFieldDecorator('periodAdditionalFlag', {
              rules: [{
                required: true,
                message: this.$t('common.please.select')
              }],
              initialValue: period ? period.periodAdditionalFlag : ''
            })(
              <Select placeholder={this.$t('common.please.select')}>
                {periodAdditionalFlags.map((option)=>{
                  return <Option key={option.value} value={option.value}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{this.$t('common.save')}</Button>
            <Button onClick={() => {this.props.onClose()}}>{this.$t('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {}
}

const WrappedNewAccountPeriod = Form.create()(NewAccountPeriod);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewAccountPeriod);
