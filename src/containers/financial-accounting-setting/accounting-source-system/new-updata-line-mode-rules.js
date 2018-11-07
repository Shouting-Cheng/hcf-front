/**
 * Created by 13576 on 2018/1/14.
 */
import React from 'react'
import {connect} from 'dva'
import {Button, Input, Switch, Select, Form, Icon, notification, Alert, Row, Col, message} from 'antd'
import baseService from 'share/base.service'
import accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import 'styles/financial-accounting-setting/accounting-source-system/new-update-voucher-template.scss'
import Chooser from 'widget/chooser'
const FormItem = Form.Item;
const Option = Select.Option;

class NewUpdateLineModeRulesSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      setOfBook: [],
      scenariosElementsOption: [],
      accountElementData:[],
      journalFieldOption: [],
      dataRuleOption: [],
      // segementOption: [],
      section: {},
      isNew: true,
      record: {},
      dataRule: "NUll",
    }
  }

  componentWillMount() {
    this.getDataRule();
    if (this.props.params.isNew == true) {
      //新建
      this.setState({
        isNew: true,
        record: {},
        dataRule: "NULL"
      }, () => {
      })
    } else if (this.props.params.isNew == false) {
      //编辑
      let data = this.props.params.record;
      let valueData = [];
      if (data.dataRule === "ACCOUNT_ELEMENT" || data.dataRule === "ACCOUNT_ELEMENT_MAP") {
        let dataValue = {
          description: data.elementName,
          code: data.data,
          key: data.data,
        }
        valueData.push(dataValue);
      }
      let dataRule = data.dataRule;
      this.setState({
        isNew: false,
        record: data,
        dataRule,
      }, () => {
        this.setState({
          accountElementData:valueData
        })
      })
    }
  }


  componentWillReceiveProps(nextProps) {
  }

  //获取科目段值
  // getSegement(params) {
  //   console.log(params);
  //   let setOfBooksId = this.props.params.setOfBooksId ? this.props.params.setOfBooksId : this.props.company.setOfBooksId;
  //   accountingService.getSegmentBySetOfBooksId(setOfBooksId,params.lineModelId).then((res) => {
  //     let segementOption = [];
  //     let data = res.data;
  //     data.map((item)=>{
  //       if(item.enabled){
  //         segementOption.push(item)
  //       }
  //     })
  //     if(params.isNew == false){
  //       let dataValue = {
  //         id:params.record.segmentId,
  //         segmentName:params.record.segmentName
  //       }
  //       console.log(dataValue)
  //       segementOption.push(dataValue);
  //       console.log(segementOption);
  //     }
  //     this.setState({
  //       segementOption
  //     })
  //   }).catch((e) => {
  //     message.error(e.response.data.message)
  //   })
  //
  // }


  //获取取值方式
  getDataRule() {
    baseService.getSystemValueList({type:2213}).then((res) => {
      let dataRuleOption =[];
      if(res.data){
        dataRuleOption = res.data;
      }
      this.setState({
        dataRuleOption
      })
    }).catch((e) => {
      message.error(e.response.data.message)
    })
  }

  handleNotification = () => {
    notification.close('section')
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({loading: true});
    let {record, isNew} = this.state;
    this.setState({
      loading: true,
    });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let dataValue = {
          "enabled": values.enabled,
          "journalLineModelId": this.props.params.lineModelId,
          "journalFieldCode": values.journalFieldCode[0].code,
          "dataRule": values.dataRule,
        }
        // dataValue.segmentId = values.segmentId ? values.segmentId : "";
        if (values.dataRule === "FIXED_VALUE") {
          dataValue.data = values.fixedValue;
        } else if (values.dataRule === "ACCOUNT_ELEMENT" || values.dataRule ==="ACCOUNT_ELEMENT_MAP") {
          dataValue.data = values.data[0].code;
        }

        if (isNew) {
          //新建
          accountingService.addSystemSourceLineModelRules(dataValue).then((res) => {
            message.success(this.$t({id: "common.operate.success"}));
            this.setState({loading: false});
            this.props.onClose(true);
            this.props.form.resetFields();
          }).catch((e) => {
            this.setState({loading: false});
            message.error(e.response.data.message)
          })
        }
        else {
          //编辑
          let editData = {
            ...dataValue,
            id: record.id,
            versionNumber: record.versionNumber,
          }
          // editData.segmentId = values.segmentId ? values.segmentId : "";
          if (editData.dataRule != 'ACCOUNT_ELEMENT' && editData.dataRule != "ACCOUNT_ELEMENT_MAP" && editData.dataRule != "FIXED_VALUE") {
            editData.data = "";
          }
          accountingService.upSystemSourceLineModelRules(editData).then((res) => {
            message.success(this.$t({id: "common.operate.success"}));
            this.setState({loading: false});
            this.props.onClose(true);
            this.props.form.resetFields();
          }).catch((e) => {
            this.setState({loading: false});
            message.error(e.response.data.message);
          })
        }
      }
    })
  };

  onCancel = () => {
    this.props.onClose(false)
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  //当取值方式变化的时候
  handleSelectDataRules = (value) => {
    let dataRule = this.state.dataRule;
    if(value==='FIXED_VALUE'&&dataRule!=='FIXED_VALUE'){
      this.setState({
        fixedValue: ''
      })
    }
    if (dataRule == 'ACCOUNT_ELEMENT' || dataRule ==="ACCOUNT_ELEMENT_MAP") {
      this.props.form.setFieldsValue({data: []})
    } else {
      this.props.form.setFieldsValue({data: ""})
    }
    this.setState({
      dataRule: value
    })
  };


  render() {
    const {getFieldDecorator} = this.props.form;
    const {dataRule, dataRuleOption, isNew, record,accountElementData} = this.state;
    const journalFieldCode = [];
    if (!isNew) {
      let journalFieldCodeValue = {
        description: record.journalFieldName,
        code: record.journalFieldCode,
        key: record.journalFieldCode
      }
      journalFieldCode.push(journalFieldCodeValue);
    }
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14, offset: 1},
    };

    return (
      <div className="new-update-voucher-template">
{/*
        <Alert message={this.$t({id: "accounting.source.voucher.headTips"})} type="warning"/>
*/}
        {accountElementData.key}
        <Form onSubmit={this.handleSubmit} className="voucher-template-form">
          <FormItem {...formItemLayout} label={this.$t({id:"accounting.source.journalFieldCode"})}>{/*核算分录段*/}
            {getFieldDecorator('journalFieldCode', {
              rules: [{
                required: true,
                message: this.$t({id: "common.please.select"})
              }],
              initialValue: journalFieldCode
            })(
              <Chooser
                placeholder={this.$t({id: "common.please.select"})}
                type="accounting_journalField_system"
                single={true}
                labelKey="description"
                valueKey="code"
                listExtraParams={{"journalLineModelId": this.props.params.lineModelId}}
                onChange={() => {}}
                disabled={!isNew}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "accounting.source.dataRule"})}>{/*取值方式*/}
            {getFieldDecorator('dataRule', {
              rules: [{
                required: true,
                message: this.$t({id: "common.please.select"})
              }],
              initialValue: isNew ? "" : dataRule
            })(
              <Select className="input-disabled-color" placeholder={ this.$t({id: "common.please.select"})}
                      onSelect={this.handleSelectDataRules}>
                {
                  dataRuleOption.map((item) => <Option key={item.code}>{item.messageKey}</Option>)
                }
              </Select>
            )}
          </FormItem>
          {
            dataRule === "FIXED_VALUE" ? (
              <FormItem {...formItemLayout} label={this.$t({id:"accounting.source.data"})}>{/*值*/}
                {getFieldDecorator('fixedValue', {
                  rules: [{
                    required: true,
                    message: this.$t({id: "common.please.enter"})
                  }],
                  //initialValue: isNew ? "" : record.data?record.data:""
                  initialValue: isNew ? "" : record.elementName
                })(
                  <Input className="input-disabled-color" placeholder={this.$t({id:"accounting.source.stateData"})}/>
                )}
              </FormItem>
            ) : ""
          }
          {dataRule === "ACCOUNT_ELEMENT_MAP"?(
            <FormItem {...formItemLayout}  label={this.$t({id:"accounting.source.data"})}>{/*值*/}
              {getFieldDecorator('data', {
                rules: [{
                  required: true,
                  message: this.$t({id: "common.please.enter"})
                }],
                initialValue: isNew ? [] : accountElementData
              })(
                <Chooser
                  placeholder={this.$t({id: "common.please.select"})}
                  type="accounting_scene_elements"
                  single={true}
                  labelKey="description"
                  valueKey="code"
                  listExtraParams={{
                    "transactionSceneId": this.props.params.glSceneId ? this.props.params.glSceneId : 1,
                    "displayAll": true,
                    "enabled": true
                  }}/>
              )}
            </FormItem>):" "}
          {
             dataRule === "ACCOUNT_ELEMENT"? (
              <FormItem {...formItemLayout}  label={this.$t({id:"accounting.source.data"})}>{/*值*/}
                {getFieldDecorator('data', {
                  rules: [{
                    required: true,
                    message: this.$t({id: "common.please.enter"})
                  }],
                  initialValue: isNew ? [] : accountElementData
                })(
                  <Chooser
                    placeholder={this.$t({id: "common.please.select"})}
                    type="accounting_scene_elements"
                    single={true}
                    labelKey="description"
                    valueKey="code"
                    listExtraParams={{
                      "transactionSceneId": this.props.params.glSceneId ? this.props.params.glSceneId : 1,
                      "displayAll": true,
                      "enabled": true
                    }}/>
                )}
              </FormItem>) : ""
          }
          {/*<FormItem {...formItemLayout} label={this.$t({id: "accounting.source.segment"})}>/!*科目段值*!/*/}
            {/*{getFieldDecorator('segmentId', {*/}
              {/*initialValue: isNew ? "" : record.segmentId ? record.segmentId : ""*/}
            {/*})(*/}
              {/*<Select className="input-disabled-color" placeholder={ this.$t({id: "common.please.select"})}*/}
                      {/*allowClear={true}>*/}
                {/*{*/}
                  {/*segementOption.map((item) => <Option key={item.id}>{item.segmentName}</Option>)*/}
                {/*}*/}
              {/*</Select>*/}
            {/*)}*/}
          {/*</FormItem>*/}
          <FormItem {...formItemLayout}
                    label={this.$t({id: "common.column.status"})} colon={true}>
            {getFieldDecorator('enabled', {
              valuePropName: "checked",
              initialValue: isNew ? true : record.enabled
            })(
              <Switch checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross"/>}/>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit"
                    loading={this.state.loading}>{this.$t({id: "common.save"})}</Button>
            <Button onClick={this.onCancel}>{this.$t({id: "common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}

const WrappedNewUpdateLineModeRules = Form.create()(NewUpdateLineModeRulesSystem);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateLineModeRules);
