/**
 * Created by 14306 on 2018/12/26.
 */
import React from 'react'
import {connect} from 'dva'
import moment from 'moment'
import {Form, Input, Switch, Button, Col, Row, Select, DatePicker, Alert, notification, Icon, message} from 'antd'
import parameterService from 'containers/setting/parameter-definition/parameter-definition.service'

import 'styles/budget-setting/budget-organization/budget-versions/new-budget-versions.scss'

const FormItem = Form.Item;

class NewParameterDefinition extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      versionCodeError: false,
      statusError: false,
      newData: [],
      version: {},
      statusOptions:[],
      checkoutCodeData: [],
      loading: false,
    };
  }

  componentDidMount() {
    console.log(this.props)
  }


  componentWillReceiveProps = (nextProps) => {
  }

  //检查处理提交数据
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        let value = this.props.form.getFieldsValue();
        this.setState({loading: true});
        if (!this.state.statusError) {
          const dataValue = value['versionDate']
          const toleValues = {
            ...value,
            'versionDate': value['versionDate'] ? value['versionDate'].format('YYYY-MM-DD') : '',
            'organizationId': this.props.organization.id
          }
          typeof this.state.version.id ==='undefined' ? this.saveData(toleValues) : this.updateVersion(toleValues);
        }
      }
    })
  };

  handleParamCode = (value)=>{

  };


  onCancel =()=>{
    this.props.form.resetFields()
    this.props.onClose();
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    const {params} = this.props
    console.log(this.props)
    const versionCodeError = false;
    const {version,statusOptions} = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 0 },
    };
    return (
      <div className="new-parameter-definition" style={{paddingTop: 25}}>
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({id: "parameter.definition.model"})}>
            {getFieldDecorator('organizationName',
              {
                initialValue: '',
                rules: [
                  {required: true,}
                ],
              })(<Input disabled/>)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.parameterCode"})}>
            {getFieldDecorator('versionCode', {
              initialValue: version.versionCode,
              rules: [{required: true, message: this.$t({id: "common.please.enter"})},]
            })(
              <Select onSelect={this.handleParamCode}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.parameterName"})}>
            {getFieldDecorator('versionName', {
              initialValue: version.versionName,
              rules: [{required: true, message: this.$t({id: "common.please.enter"})}],
            })(<Input disabled />)}

          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.balance.params.value"})}>
            {getFieldDecorator('status', {
              //initialValue: typeof version.id === 'undefined' ? "NEW" : '',
              rules: [{required: true,}],
            })(
              <Select placeholder={this.$t({id: "common.please.select"})}>
                {[].map((option) => {
                  return <Option key={option.value}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "chooser.data.description"})}>
            {getFieldDecorator('description', {
              initialValue: version.description
            })(<Input />)}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({id: "common.save"})}</Button>
            <Button onClick={this.onCancel}>{this.$t({id: "common.cancel"})}</Button>
          </div>
        </Form>
      </div>

    )
  }

}

const WrappedNewParameterDefinition = Form.create()(NewParameterDefinition);

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewParameterDefinition);
