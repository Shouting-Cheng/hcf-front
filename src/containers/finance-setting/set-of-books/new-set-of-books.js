import React from 'react'
import { connect } from 'react-redux'


import { Alert, Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import httpFetch from 'share/httpFetch'
import config from 'config'
import baseService from 'share/base.service'
import LanguageInput from 'components/Widget/Template/language-input/language-input'

class NewSetOfBooks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currencyFetched: false,
      accountSetOptions: [],
      currencyOptions: [],
      periodSetOptions: [],
      setOfBooksName: [],

    };
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  handleSetOfBooksNameChange = (value, i18n) => {
    this.setState({ setOfBooksName: i18n })
  };
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        let params = {};
        let method;
        values.i18n = {};
        values.i18n.setOfBooksName = this.state.setOfBooksName;
        params = Object.assign(params, values);
        if(this.props.params.setOfBooksId){
          method = 'put';
          params.id = this.props.params.setOfBooksId;
          params.accountSetId = this.props.params.accountSetId;
        }
        else {
          method = 'post'
        }
        httpFetch[method](`${config.baseUrl}/api/setOfBooks`, params).then((res)=>{
          this.setState({loading: false});
          message.success(this.$t('common.save.success', {name: values.setOfBooksName}));  //保存成功
          this.props.form.resetFields();
          this.props.onClose(true);
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t("common.save.filed")}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  getAccountSetOptions = () => {
    this.state.accountSetOptions.length === 0 && httpFetch.get(`${config.baseUrl}/api/account/set/query`).then(res => {
      this.setState({ accountSetOptions: res.data })
    })
  };

  getCurrencyList = () => {
      this.state.currencyOptions.length === 0 && baseService.getCurrencyList('',this.props.language.local).then(res => {
      this.setState({ currencyOptions: res.data.rows, currencyFetched: true })
    })
  };

  getPeriodSetOptions = () => {
    this.state.periodSetOptions.length === 0 && httpFetch.get(`${config.baseUrl}/api/periodset`).then(res => {
      this.setState({ periodSetOptions: res.data })
    })
  };

  render(){

    const { getFieldDecorator } = this.props.form;
    const { params } = this.props;
    const { accountSetOptions, currencyOptions, periodSetOptions, loading, currencyFetched } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div>
        <Alert
          message={this.$t('common.help')/*提示信息*/}
          description={this.$t("set-of-books.new.alert")}
          type="info"
          showIcon
        />
        <Form onSubmit={this.handleSave} style={{marginTop: 30}}>
          <FormItem {...formItemLayout} label={this.$t("set-of-books.code")}>
            {getFieldDecorator('setOfBooksCode', {
              rules: [{
                required: true,
                pattern: /^[0-9A-Za-z_]{0,36}$/,
                message: this.$t("set-of-books.code-validate")
              }],
              initialValue: params.setOfBooksCode
            })(
              <Input disabled={!!params.setOfBooksId}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t("set-of-books.period.set.code")}>
            {getFieldDecorator('periodSetCode', {
              rules: [{
                required: true,
                message: this.$t('common.please.select')
              }],
              initialValue: params.periodSetCode
            })(
              <Select  onFocus={this.getPeriodSetOptions} disabled={!!params.setOfBooksId}>
                {periodSetOptions.map(item => {
                  return <Option value={item.periodSetCode} key={item.id}>{item.periodSetCode}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t("set-of-books.name")}>
            {getFieldDecorator('setOfBooksName', {
              rules: [{
                required: true,
                max: 100,
                message: this.$t("set-of-books.name-validate")
              }],
              initialValue: params.setOfBooksName
            })(
              <LanguageInput name={params.setOfBooksName || null}
                             i18nName={params.i18n && params.i18n.setOfBooksName}
                             isEdit={params.i18n && params.i18n.setOfBooksName}
                             nameChange={this.handleSetOfBooksNameChange}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t("set-of-books.account.set.code")}>
            {getFieldDecorator('accountSetId', {
              rules: [{
                required: true,
                message: this.$t('common.please.select')
              }],
              initialValue: params.accountSetCode
            })(
              <Select  onFocus={this.getAccountSetOptions} disabled={!!params.setOfBooksId}>
                {accountSetOptions.map(item => {
                  return <Option value={item.id} key={item.id}>{item.accountSetCode}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t("set-of-books.base.currency")}>
            {getFieldDecorator('functionalCurrencyCode', {
              rules: [{
                required: true,
                message: this.$t('common.please.select')
              }],
              initialValue: params.functionalCurrencyCode
            })(
              <Select  onFocus={this.getCurrencyList}
                       disabled={!!params.setOfBooksId}
                       notFoundContent={currencyFetched ? this.$t('my.contract.no.result') : <Spin size="small" />}
                       showSearch={true}
                       optionFilterProp="children"
                       filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {currencyOptions.map(item => {
                  return <Option value={item.currencyCode} key={item.currencyCode}>{item.currencyCode}{this.props.language.local === 'zh_Cn' ? ` ${item.currencyName}` : ''}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t('common.column.status')/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: params.isEnabled !== undefined ? params.enabled : false,
              valuePropName: 'checked'
            })(
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{this.$t('common.save')/* 保存 */}</Button>
            <Button onClick={this.onCancel}>{this.$t('common.cancel')/* 取消 */}</Button>
          </div>
        </Form>
      </div>
    )
  }

}

function mapStateToProps(state) {
  // console.log(state.languages)
  return { language:state.languages  };
}
const WrappedNewSetOfBooks = Form.create()(NewSetOfBooks);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewSetOfBooks);
