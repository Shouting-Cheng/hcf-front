/**
 * Created by 13576 on 2018/1/23.
 */
import React from 'react'
import { connect } from 'react-redux'
import { Button, Input, Switch, Select, Form, Icon, notification, Alert, Row, Col, message, InputNumber } from 'antd'
import baseService from 'share/base.service'
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service'
import 'styles/financial-accounting-setting/accounting-source/new-update-voucher-template.scss'
import Chooser from 'components/chooser'
import {formatMessage} from 'share/common'
const { Option } = Select;
const FormItem = Form.Item;


class DataRulesForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      showChangeRules: false,
      setOfBook: [],
      scenariosOption: [],
      dataRuleOption: [],
      sourceDataOption: [],
      section: {},
      isNew: true,
      sourceDataCode: null,
      dataRule: "FIXED_VALUE",
      sobJournalLineModelId: null,
      params: {},
      record: {},
      tableFieldValue: '',
      tableField: ''
    }
  }

  componentWillMount() {
    this.getDataRule();
    let params = this.props.params;
    if (params.timestamp) {
      this.getSourceData();
      if (params.isNew) {
        this.setState({
          record: {},
          dataRule: "NULL",
          isNew: true,
        }, () => {
        });
      } else if (params.isNew === false) {
        this.setState({
          record: params.record,
          dataRule: params.record.dataRule,
          isNew: false,
          tableFieldValue: params.record.tableField,
          tableField: this.getTableField(params.record)
        }, () => {
          let record = params.record;
          if (record.dataRule === "INTERFACE_DATA" || record.dataRule === "VALUE_OF_RULE" || record.dataRule === "VALUE_OF_API") {
            this.setState({
              sourceDataCode: params.record.sourceDataCode,
              changeRulesData: [],
            })
          } else if (params.record.dataRule === "VALUE_OF_MAPPING_GROUP") {
            this.setState({
              sourceDataCode: params.record.sourceDataCode,
            })
          } else {
            this.setState({
              changeRulesData: [],
            })
          }
        });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.params) != "{}" && nextProps.params.timestamp != this.props.params.timestamp) {
      this.props.form.resetFields();
      if (nextProps.params.isNew) {
        this.setState({
          record: {},
          dataRule: "NULL",
          isNew: true
        }, () => {
        });
      } else if (nextProps.params.isNew === false) {
        this.props.form.resetFields();
        this.setState({
          record: nextProps.params.record,
          dataRule: nextProps.params.record.dataRule,
          isNew: false,
          tableFieldValue: nextProps.params.record.tableField,
          tableField: this.getTableField(nextProps.params.record)
        }, () => {
          let record = nextProps.params.record;
          if (record.dataRule === "INTERFACE_DATA" || record.dataRule === "VALUE_OF_RULE" || record.dataRule === "VALUE_OF_API") {
            this.setState({
              sourceDataCode: nextProps.params.record.sourceDataCode,
              changeRulesData: [],
            })
          } else if (nextProps.params.record.dataRule === "VALUE_OF_MAPPING_GROUP") {
            this.setState({
              sourceDataCode: nextProps.params.record.sourceDataCode,
            })
          } else {
            this.setState({
              changeRulesData: [],
            })
          }
        });
      }
    }
  }
  //获取tableField的初始值
  getTableField = (record) => {
    let tableField = '';
    if (record.dataRule != "FIXED_VALUE") {
      tableField = [{
        description: record.tableFieldName,
        code: record.tableField,
        key: record.tableField
      }]
    } else {
      tableField = record.tableField;
    }
    return tableField;
  }


  //获取取值方式
  getDataRule() {
    baseService.getSystemValueList({ type: 2210 }).then((res) => {
      let dataRuleOption = [];
      if (res.data) {
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
    let { record, isNew } = this.state;
    e.preventDefault();
    this.setState({ loading: true, });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (values.dataRule === "INTERFACE_DATA" || values.dataRule === "VALUE_OF_MAPPING_GROUP" || values.dataRule === "VALUE_OF_RULE") {
          values.tableField = values.tableField[0].code;
        } else if (values.dataRule === "VALUE_OF_API") {
          values.tableField = values.tableFieldApi[0].code;
        } else if (values.dataRule == "FIXED_VALUE") {
          values.tableField = values.tableFieldValue;
        } else {
          values.tableField = null;
        }
        let data = {
          ...values,
          accountElementCode: values.accountElementCode[0].code,
          sobJournalLineModelId: this.props.params.lineModelId,
        }
        if (isNew) {
          //新建
          accountingService.addSourceLineModelDataRules(data).then((res) => {
            message.success(formatMessage({ id: "common.operate.success" }));
            this.setState({ loading: false });
            this.props.form.resetFields();
            this.props.upDataHandle(res.data);
          }).catch((e) => {
            this.setState({ loading: false });
            message.error(e.response.data.message);
          })

        } else {
          //编辑
          let editData = {
            id: record.id,
            versionNumber: record.versionNumber,
            ...data
          }
          accountingService.upSourceLineModelDataRules(editData).then((res) => {
            message.success(formatMessage({ id: "common.operate.success" }));
            this.setState({ loading: false });
            this.props.form.resetFields();
            this.props.upDataHandle(res.data);
          }).catch((e) => {
            this.setState({ loading: false });
            message.error(e.response.data.message);
          })

        }

      }
    })
  };

  onCancel = () => {
    const { status } = this.state
    if (status === "EDIT") {
      this.setState({
        status: "SHOW"
      })
    } else {
      this.props.upDataHandle({})
    }
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };


  //当取值方式变化的时候
  handleSelectDataRules = (value) => {
    let dataRule = this.state.dataRule;
    if (dataRule === "INTERFACE_DATA" || dataRule === "VALUE_OF_RULE" || dataRule === "VALUE_OF_API") {
      this.props.form.setFieldsValue({
        "sourceDataCode": "",
        tableField: []
      });
    } else {
      this.props.form.setFieldsValue({
        "sourceDataCode": "",
        tableField: ''
      });
    }
    this.setState({
      tableField: '',
      sourceDataCode:''
    });
    if (value === 'FIXED_VALUE') {
      this.setState({
        tableFieldValue: ''
      });
    }
    this.setState({
      dataRule: value
    });
    this.props.changeDataRule(value);
  }

  //当来源数据变化时
  handleSourceDataChange = (value) => {
    this.setState({
      sourceDataCode: value,
    })

    this.props.form.setFieldsValue({
      "tableField": [],
    })

  }

  //核素要素变化时
  changeAccoutElement = (value) => {
    let data = value[0];
    if (data) {
      this.props.form.setFieldsValue({
        elementNature: data.description
      })
    }



  }

  //来源字段变化时
  handleTableFieldChange = (value) => {
    if (this.state.dataRule === "VALUE_OF_RULE") {
      this.setState({
        showButton: true
      })
    }
  }

  //获取来源数据结构
  getSourceData() {
    let params = {}
    params.sourceTransactionType = this.props.params.journalLineModel.sourceTransactionCode;
    params.dataStructure = this.props.params.journalLineModel.dataStructureCode;
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    accountingService.getSourceTransactionDataValue(params).then((response) => {
      response.data.map(item => {
        item.key = item.id
      });
      this.setState({
        sourceDataOption: response.data
      })
    }).catch((e) => {
    })
  }

  //添加转换规则
  handleAddChangeRule = () => {
    //在添加转换规则前，要保存取值规则
    //显示添加转换规则
    this.setState({
      showChangeRules: true,
    })
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { dataRule, dataRuleOption, sourceDataOption, sourceDataCode, isNew, record, tableFieldValue, tableField } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    let sourceTransactionCode = this.props.params.journalLineModel.sourceTransactionCode;
    let accountElementCode = [];
    // let tableField = [];
    if (!isNew) {
      accountElementCode = [{
        description: record.elementNature,
        code: record.accountElementCode,
        key: record.accountElementCode

      }]
      // if (record.dataRule != "FIXED_VALUE") {
      //   tableField = [{
      //     description: record.tableFieldName,
      //     code: record.tableField,
      //     key: record.tableField
      //   }]
      // }
    }


    return (
      <div className="new-update-voucher-template">
        <Form onSubmit={this.handleSubmit} className="voucher-template-form">
          <FormItem {...formItemLayout}
            label={formatMessage({ id: "common.column.status" })} colon={true}>
            {getFieldDecorator('enabled', {
              valuePropName: "checked",
              initialValue: isNew ? true : record.enabled
            })(
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({ id: "accounting.source.accountElementCode" })}>{/*核算要素*/}
            {getFieldDecorator('accountElementCode', {
              rules: [{
                required: true,
                message: formatMessage({ id: "common.please.select" })
              }],
              initialValue: isNew ? [] : accountElementCode
            })(
              <Chooser
                placeholder={formatMessage({ id: "common.please.select" })}
                type="accounting_scene_data_elements"
                single={true}
                labelKey="code"
                valueKey="code"
                listExtraParams={{
                  "transactionSceneId": this.props.params.glSceneId ? this.props.params.glSceneId : null,
                  "displayAll": false,
                  "modelId": this.props.params.lineModelId ? this.props.params.lineModelId : null
                }}
                onChange={this.changeAccoutElement}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({ id: "accounting.source.elementNature" })}>{/*要素性质*/}
            {getFieldDecorator('elementNature', {
              initialValue: isNew ? "" : record.elementNature
            })(
              <Input disabled={true} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({ id: "accounting.source.dataRule" })}>{/*取值方式*/}
            {getFieldDecorator('dataRule', {
              rules: [{
                required: true,
                message: formatMessage({ id: "common.please.select" })
              }],
              initialValue: isNew ? "" : record.dataRule
            })(
              <Select className="input-disabled-color"
                placeholder={formatMessage({ id: "common.please.select" })} onSelect={this.handleSelectDataRules}>
                {
                  dataRuleOption.map((item) => <Option key={item.code}>{item.messageKey}</Option>)
                }
              </Select>
            )}
          </FormItem>
          {
            /*固定值*/
            dataRule === "FIXED_VALUE" ? (<div>
              <FormItem {...formItemLayout} label={formatMessage({ id: "accounting.source.stateValue" })}>{/*固定值*/}
                {getFieldDecorator('tableFieldValue', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: "common.please.enter" })
                  }],
                  initialValue: isNew ? "" : tableFieldValue
                })(
                  <Input />
                )}
              </FormItem>
            </div>) : ""
          }
          {
            /*取自来源表*/
            dataRule === "INTERFACE_DATA" || dataRule === "VALUE_OF_MAPPING_GROUP" || dataRule === "VALUE_OF_RULE" ? (
              <div>
                <FormItem {...formItemLayout} label={formatMessage({ id: "accounting.source.sourceDataCode" })}>{/*数据来源*/}
                  {getFieldDecorator('sourceDataCode', {
                    rules: [{
                      required: true,
                      message: formatMessage({ id: "common.please.select" })
                    }],
                    initialValue: isNew ? "" : sourceDataCode
                  })(
                    <Select className="input-disabled-color" placeholder={formatMessage({ id: "common.please.select" })}
                      onSelect={this.handleSourceDataChange}>
                      {
                        sourceDataOption.map((item) => <Option key={item.code}>{item.description}</Option>)
                      }
                    </Select>
                  )}
                </FormItem>
              </div>) : ""
          }
          {
            (dataRule === "INTERFACE_DATA" || dataRule === "VALUE_OF_MAPPING_GROUP" || dataRule === "VALUE_OF_RULE") && sourceDataCode ? (
              <FormItem {...formItemLayout} label={formatMessage({ id: "accounting.source.sourceDatafile" })}>
                {getFieldDecorator('tableField', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: "common.please.select" })
                  }],
                  initialValue: isNew ? [] : tableField
                })(
                  <Chooser
                    placeholder={formatMessage({ id: "common.please.select" })}
                    type="data-source-fields_dataRules"
                    single={true}
                    labelKey="description"
                    valueKey="code"
                    listExtraParams={{
                      "sourceTransactionType": sourceTransactionCode,
                      "dataStructure": this.state.sourceDataCode
                    }}
                    onChange={this.handleTableFieldChange}
                  />
                )}
              </FormItem>
            ) : ""
          }
          {
            /*取自API*/
            dataRule === "VALUE_OF_API" ? (<div>
              <FormItem {...formItemLayout} label={formatMessage({ id: "accounting.source.fromAPI" })}>{/*取自API*/}
                {getFieldDecorator('tableFieldApi', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: "accounting.source.selectSQL" })
                  }],
                  initialValue: isNew ? [] : tableField,
                })(
                  <Chooser
                    placeholder={formatMessage({ id: "common.please.select" })}
                    type="sqlAPI"
                    single={true}
                    labelKey="description"
                    valueKey="code"
                    listExtraParams={{}}
                    onChange={this.handleTableFieldChange}
                  />
                )}
              </FormItem>
            </div>) : ""
          }
          <div className="slide-footer">
            <Button type="primary" htmlType="submit"
              loading={this.state.loading}>{formatMessage({ id: "common.save" })}</Button>
            <Button onClick={this.onCancel}>{formatMessage({ id: "common.cancel" })}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
  }
}

DataRulesForm.propTypes = {
  params: React.PropTypes.object.isRequired,  //传入数据
  upDataHandle: React.PropTypes.func.isRequired,  //更新表单事件

};

DataRulesForm.defaultProps = {
  params: {},
  upDataHandle: () => { },

};

const WrappedDataRulesForm = Form.create()(DataRulesForm);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedDataRulesForm);
