/**
 * Created by 13576 on 2017/11/25.
 */
import React from 'react';
import {connect} from 'react-redux';
import {Button, Form, Switch, Input, message, Icon, InputNumber, Select, Card, Row, Col, Badge} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import Chooser from 'components/chooser'
import baseService from 'share/base.service'
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service'
import {formatMessage} from 'share/common'

class LineModelChangeRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      loading: false,
      changeDataOptions: [],  //取值方式
      glSceneId: 1,
      compareWay: "",  //对比方式
      status: this.props.status,
      infoData: {},
      compareElementCode: [],
      changeDataFlag:false
    };
  }

  judgeChangeData = (value) =>{
    if(value == "08" || value == "09" || value == "10" || value == "11" || value == "12" ){
      return false;
    }else {
      return true;
    }
  }


  componentWillMount() {
    let params = this.props.params;
    this.getChangeRule();
    if (this.props.status != "NEW") {
      const infoData = this.props.params.changeData;
      const compareWay = this.props.params.changeData.compareElementCode ? "compareElement" : "compareData";
      let compareElementCode = [];
      let option = {
        key: infoData.compareElementCode,
        code: infoData.compareElementCode,
        description: infoData.compareElementName,
      }
      if (compareWay === "compareElement") {
        compareElementCode.push(option);
      }
      let changeDataFlag = this.judgeChangeData(infoData.changeRule);
      this.setState({
        changeDataFlag,
        infoData,
        glSceneId: this.props.params.glSceneId,
        compareWay,
        params: params,
        compareElementCode
      })
    } else {
      this.setState({
        changeDataFlag:false,
        infoData: {},
        glSceneId: this.props.params.glSceneId,
        compareWay: "compareData",
        params: params,
        compareElementCode: []
      })
    }
  }


  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.params) != "{}" && nextProps.params && nextProps.params.timestamp != this.props.params.timestamp) {
      let params = nextProps.params;
      if (this.props.status != "NEW") {
        const infoData = this.props.params.changeData;
        const compareWay = nextProps.params.changeData.compareElementCode ? "compareElement" : "compareData";
        let compareElementCode = [];
        if (compareWay === "compareElement") {
          if (infoData.compareElementCode) {
            compareElementCode = [{
              key: infoData.compareElementCode,
              code: infoData.compareElementCode,
              description: infoData.compareElementName,
            }]
          }
          this.props.form.setFieldsValue(compareElementCode);
        }
        let changeDataFlag = this.judgeChangeData(infoData.changeRule);
        this.setState({
          infoData,
          changeDataFlag,
          glSceneId: nextProps.params.glSceneId,
          compareWay,
          params: params,
          compareElementCode
        }, () => {
          if (compareWay === "compareElement") {
            this.setState({
              compareElementCode
            })
          }
        })
      } else {
        this.setState({
          infoData: {},
          changeDataFlag:false,
          glSceneId: this.props.params.glSceneId,
          compareWay: "compareData",
          params: params
        })
      }
    }
  }


  //获取取值方式
  getChangeRule() {
    baseService.getSystemValueList({type:2211}).then((res) => {
      let changeDataOptions = [];
      if (res.data) {
        changeDataOptions = res.data;
      }
      this.setState({
        changeDataOptions
      })

    }).catch((e) => {

    })
  }


  handleSave = (e) => {
    e.preventDefault();
    const {status, infoData} = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        let data = {
          ...values,
          "modelDataRuleId": this.props.params.record.id,
        }
        if (values.compareWay == "compareElement") {
          data.compareElementCode = values.compareElementCode[0].code
        }
        if (status === "NEW") {
          accountingService.addSourceLineModelChangeRules(data).then((res) => {
            message.success(formatMessage({id: "common.operate.success"}));
            this.setState({loading: false});
            this.props.upDataEvent(res.data);
            this.props.form.resetFields;
          }).catch((e) => {
            this.setState({loading: false})
            message.error(e.response.data.message);
          })
        } else {
          let valuesData = {
            ...data,
            id: infoData.id,
            versionNumber: infoData.versionNumber
          }
          if (values.compareWay == "compareElement") {
            valuesData.compareElementCode = values.compareElementCode[0].code
          }
          accountingService.upSourceLineModelChangRules(valuesData).then((res) => {
            message.success(formatMessage({id: "common.operate.success"}));
            this.setState({loading: false});
            this.props.upDataEvent(res.data);
            this.props.form.resetFields;
          }).catch((e) => {
            this.setState({loading: false})
            message.error(e.response.data.message);
          })

        }
      }
    })

  }


  //取消
  handleCancel = () => {
    const {status} = this.state
    if (status === "EDIT") {
      this.setState({
        status: "SHOW",
        show: true,
      })
    } else {
      this.props.form.resetFields();
      this.props.cancelHandle();
    }
  }

  editInfo = () => {
    const {compareElementCode, compareWay} = this.state;
    this.setState({
      show: false,
      status: "EDIT"
    }, () => {
      if (compareWay == "compareElement") {
        this.props.form.setFieldsValue({compareElementCode})
      }
    })
  }



  //当比较方式变化的时
  handleCompareWayChang = (value) => {
    this.setState({
      compareWay: value
    })
  }


  handleChangeRuleChange = (value) =>{
    let changeDataFlag = this.judgeChangeData(value);
    this.setState({changeDataFlag});
  }



  render() {
    const {getFieldDecorator} = this.props.form;
    const {changeDataOptions, compareWay, infoData, status, compareElementCode,changeDataFlag} = this.state
    const enabled = infoData.enabled;
    const isEdit = (status == "EDIT") ? true : false;
    const show = (status == "SHOW") ? true : false;
    const formItemLayout = {
      labelCol: {span: 24},
      wrapperCol: {span: 24},
    };

    const compareWayData = isEdit ? infoData.compareData ? "compareData" : "compareElement" : compareWay;


    let domRender;
    if (show) {
      domRender = (
        <div className="line-model-change-rules">
          <Card type="inner" title={`${formatMessage({id: "accounting.source.sequence"})} : ` + infoData.priority}
                extra={<a onClick={this.editInfo}>{formatMessage({id: 'common.edit'})}</a>}>
              <Row>
                <Col span={24}>
                  <span style={{marginLeft: "8px"}}>{`${formatMessage({id: "accounting.source.compare"})} :`}</span>
                  <span style={{marginLeft: "8px"}}><b>{infoData.changeRuleName}</b></span>{/*比较符号*/}
                  <span style={{marginLeft: "8px"}}>{infoData.compareElementCode ? formatMessage({id: "accounting.source.accountElementCode"}) : formatMessage({id: "accounting.source.stateValue"})}</span>{/*核算要素/固定值*/}
                  <span style={{marginLeft: "8px"}}><b>{infoData.compareElementCode ? infoData.compareElementName : infoData.compareData}</b></span>{/*核算要素名称/固定值*/}
                  {changeDataFlag?(<span> <span style={{marginLeft: "8px"}}>{`${formatMessage({id: "accounting.source.changeData"})} :`}</span>{/*转化值*/}
                    <span style={{marginLeft: "8px"}}><b>{infoData.changeData}</b></span>{/*值*/}</span>):""}
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <span style={{marginLeft: "8px"}}>{`${ formatMessage({id: "common.column.status"})} :`}</span>&nbsp;&nbsp;
                  <Badge status={enabled ? 'success' : 'error'} text={enabled ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})}/>
                </Col>
              </Row>
          </Card>
        </div>
      )
    } else {
      domRender = (
        <div className="line-model-change-rules">
          <div>
            <Form onSubmit={this.handleSave}>
              <Card type="inner" title={this.props.status === "NEW" ? "新建转换规则" : "编辑转换规则"}>
                <Row gutter={36}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({id: "accounting.source.sequence"})}>
                      {getFieldDecorator('priority', {
                        rules: [{
                          required: true,
                          message: formatMessage({id: "common.please.enter"})
                        }],
                        initialValue: isEdit ? infoData.priority : "",
                      })(
                        <InputNumber placeholder={formatMessage({id: "common.please.enter"})} disabled={isEdit} precision={0}/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout}
                              label={formatMessage({id: "common.column.status"})}>
                      {getFieldDecorator('enabled', {
                        valuePropName: 'checked',
                        initialValue: true
                      })(
                        <Switch checkedChildren={<Icon type="check"/>}
                                unCheckedChildren={<Icon type="cross"/>}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({id: "accounting.source.dataRules"})}>
                      {getFieldDecorator('changeRule', {
                        rules: [{
                          required: true,
                          message: formatMessage({id: "common.please.enter"})
                        }],
                        initialValue: isEdit ? infoData.changeRule : "",
                      })(
                        <Select placeholder={formatMessage({id: "common.please.enter"})} onSelect={this.handleChangeRuleChange}>
                          {changeDataOptions.map((item) => {
                            return (<Select.Option value={item.value}>{item.messageKey}</Select.Option>)
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={formatMessage({id: "accounting.source.compareWay"})}>
                      {getFieldDecorator('compareWay', {
                        rules: [{
                          required: true,
                          message: formatMessage({id: "common.please.enter"})
                        }],
                        initialValue: isEdit ? infoData.compareData ? "compareData" : "compareElement" : compareWay,
                      })(
                        <Select onSelect={this.handleCompareWayChang}>
                          <Option value={"compareData"}>{formatMessage({id: "accounting.source.compareData"})}</Option>
                          <Option
                            value={"compareElement"}>{formatMessage({id: "accounting.source.compareElementCode"})}</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  { compareWay === "compareData" ?
                    (<Col span={12}>
                        <FormItem {...formItemLayout} label={formatMessage({id: "accounting.source.compareData"})}>
                          {getFieldDecorator('compareData', {
                            rules: [{
                              required: true,
                              message: formatMessage({id: "common.please.enter"})
                            }],
                            initialValue: isEdit ? infoData.compareData : "",
                          })(
                            <Input placeholder={formatMessage({id: "common.please.enter"})}/>
                          )}
                        </FormItem>
                      </Col>
                    ) : ""}

                  { compareWay === "compareElement" ? (
                    <Col span={12}>
                      <FormItem {...formItemLayout}
                                label={formatMessage({id: "accounting.source.compareElementCode"})}>{/*对比核算要素*/}
                        {getFieldDecorator('compareElementCode', {
                          rules: [{
                            required: true,
                            message: formatMessage({id: "common.please.select"})
                          }],
                          initialValue: compareElementCode,
                        })(
                          <Chooser
                            placeholder={formatMessage({id: "common.please.select"})}
                            type="accounting_scene_elements"
                            single={true}
                            labelKey="description"
                            valueKey="code"
                            listExtraParams={{"transactionSceneId": this.props.params.glSceneId ? this.props.params.glSceneId : null, "displayAll": false, "enabled": true}}
                            onChange={this.handleAccountingChange}/>
                        )}
                      </FormItem>
                    </Col>) : ""}
                  { changeDataFlag?(
                    <Col span={12}>
                      <FormItem {...formItemLayout} label={formatMessage({id: "accounting.source.changeData"})}>
                        {getFieldDecorator('changeData', {
                          rules: [{
                            required: true,
                            message: formatMessage({id: "common.please.enter"})
                          }],
                          initialValue: isEdit ? infoData.changeData : "",
                        })(
                          <Input placeholder={formatMessage({id: "common.please.enter"})}/>
                        )}
                      </FormItem>
                    </Col>
                  ):""}
                </Row>
                <Row>
                  <Button type="primary" htmlType="submit" style={{marginLeft: "16px"}}
                          loading={this.state.loading}>{formatMessage({id: "common.save"})}</Button>
                  <Button onClick={this.handleCancel}
                          style={{marginLeft: "16px"}}>{formatMessage({id: "common.cancel"})}</Button>
                </Row>
              </Card>
            </Form>
          </div>

        </div>
      )
    }


    return (
      <div className="line-model-chang-rules">
        {domRender}
      </div>
    )
  }
}

LineModelChangeRules.propTypes = {
  params: React.PropTypes.object,  //传入的基础信息值
  status: React.PropTypes.string,// 状态(NEW,EDIT,SHOW)
  upDataEvent: React.PropTypes.func,
  cancelHandle: React.PropTypes.func, //取消
};

LineModelChangeRules.defaultProps = {
  status: "NEW",
};


const WrappedLineModelChangeRules = Form.create()(LineModelChangeRules);

function mapStateToProps() {
  return {}
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedLineModelChangeRules);
