/**
 * created by jsq on 2017/9/28
 */
import React from 'react'
import { connect } from 'dva'
import { Form, Input, Switch, Button, Icon, Row, Col, Alert, message, DatePicker, Select } from 'antd'
import budgetService from 'containers/budget-setting/budget-organization/budget-control-rules/budget-control-rulles.service'
import Selput from 'widget/selput'
import selectorData from 'share/chooserData'

import "styles/budget-setting/budget-organization/budget-control-rules/new-budget-rules-detail.scss"
const FormItem = Form.Item;
const Option = Select.Option;

class NewBudgetRulesDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ruleId: null,
      enabled: true,
      loading: false,
      ruleParameterTypeArray: [], //值列表：规则参数类型
      filtrateMethodArray: [],    //值列表：取值方式
      summaryOrDetailArray: [],   //值列表：取值范围
      ruleParamsArray: [],        //规则参数值列表
      paramValueMap: {},
      ruleParamDetail: {},
      validateStatusMap: {},
      helpMap: {},
      lov: {
        disabled: true
      },
      selectedData: {},
    };
  }

  componentWillMount() {
    let organizationIdParams = { organizationId: this.props.params.orgId, enabled: true };
    let userSelectorItem = {...selectorData['user']};
    userSelectorItem.key = 'employeeID';
    let itemSelectorItem = {...selectorData['budget_item']};
    itemSelectorItem.searchForm[1].getUrl=itemSelectorItem.searchForm[1].getUrl.replace(':organizationId',this.props.params.orgId);
    itemSelectorItem.searchForm[2].getUrl=itemSelectorItem.searchForm[2].getUrl.replace(':organizationId',this.props.params.orgId);
    let paramValueMap = {
      'BUDGET_ITEM_TYPE': {
        listType: 'budget_item_type',
        labelKey: 'id',
        valueKey: 'itemTypeName',
        codeKey: 'itemTypeCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },

      'BUDGET_ITEM_GROUP': {
        listType: 'budget_item_group',
        labelKey: 'id',
        valueKey: 'itemGroupName',
        codeKey: 'itemGroupCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'BUDGET_ITEM': {
        listType: 'budget_item',
        labelKey: 'id',
        valueKey: 'itemName',
        codeKey: 'itemCode',
        listExtraParams: organizationIdParams,
        selectorItem: itemSelectorItem
      },
      'CURRENCY': {
        listType: 'currency_budget',
        labelKey: 'currencyName',
        valueKey: 'currencyCode',
        codeKey: 'currencyCode',
        listExtraParams: {
          enable: true,
          setOfBooksId: this.props.organization.setOfBooksId,
          tenantId: this.props.organization.tenantId
        },
        selectorItem: undefined
      },
      'COMPANY': {
        listType: 'company',
        labelKey: 'id',
        valueKey: 'name',
        codeKey: 'companyCode',
        listExtraParams: { setOfBooksId: this.props.organization.setOfBooksId, enable: true },
        selectorItem: undefined
      },
      'COMPANY_GROUP': {
        listType: 'company_group',
        labelKey: 'id',
        valueKey: 'companyGroupName',
        codeKey: 'companyGroupCode',
        listExtraParams: { enabled: true, setOfBooksId: this.props.organization.setOfBooksId },
        selectorItem: undefined
      },
      'UNIT': {
        listType: 'department',
        labelKey: 'id',
        valueKey: 'custDeptNumber',
        codeKey: 'custDeptNumber',
        listExtraParams: { setOfBooksId: this.props.organization.setOfBooksId, enable: true },
        selectorItem: undefined
      },
      'UNIT_GROUP': {
        listType: 'department_group',
        labelKey: 'id',
        valueKey: 'description',
        codeKey: 'deptGroupCode',
        listExtraParams: { setOfBooksId: this.props.organization.setOfBooksId, enable: true },
        selectorItem: undefined
      },
      'EMPLOYEE': {
        listType: 'user',
        labelKey: 'fullName',
        valueKey: 'employeeID',
        codeKey: 'employeeID',
        listExtraParams: { roleType: 'TENANT', setOfBooksId: this.props.organization.setOfBooksId, enable: true, status: 1001 },
        selectorItem: userSelectorItem
      },
      'EMPLOYEE_GROUP': {
        listType: 'user_group',
        labelKey: 'name',
        valueKey: 'id',
        codeKey: 'code',
        listExtraParams: { setOfBooksId: this.props.organization.setOfBooksId, enable: true },
        selectorItem: undefined
      },
      'BUDGET_SCENARIO': {
        listType: 'budget_scenarios',
        labelKey: 'scenarioName',
        valueKey: 'id',
        codeKey: 'scenarioCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'BUDGET_VERSION': {
        listType: 'budget_versions',
        labelKey: 'versionName',
        valueKey: 'id',
        codeKey: 'versionCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'BUDGET_STRUCTURE': {
        listType: 'budget_structure',
        labelKey: 'structureName',
        valueKey: 'id',
        codeKey: 'structureCode',
        listExtraParams: organizationIdParams,
        selectorItem: undefined
      },
      'YEAR': {
        listType: 'year',
        labelKey: 'year',
        codeKey: 'year',
        listExtraParams: { setOfBooksId: this.props.organization.setOfBooksId },
        selectorItem: undefined
      },
      'QUARTER': {
        listType: 'quarter',
        labelKey: 'messageKey',
        valueKey: 'id',
        codeKey: 'code',
        listExtraParams: { type: 2021 },
        selectorItem: undefined
      },
      'MONTH': {
        listType: 'period',
        labelKey: 'periodName',
        valueKey: 'id',
        codeKey: 'periodName',
        listExtraParams: { setOfBooksId: this.props.organization.setOfBooksId },
        selectorItem: undefined
      },
    };
    this.getValueList(2014, this.state.summaryOrDetailArray);
    this.setState({
      ruleDetail: this.props.params,
      paramValueMap: paramValueMap
    });
  }
  /**
   * 获取值列表
   * @param code :值列表代码
   * @param name :值列表名称
   */
  getValueList(code, name) {
    name.splice(0, name.length);
    this.getSystemValueList(code).then((response) => {
      response.data.values.map((item) => {
        let option = {
          key: item.code,
          id: item.code,
          value: item.messageKey
        };
        name.addIfNotExist(option);
      });
      this.setState({
        name
      })
    });
    return
  }

  //获取成本中心
  getCostCenter(array) {
    let params = { setOfBooksId: this.props.organization.setOfBooksId, };
    budgetService.getCostCenter(params).then((response) => {
      response.data.map((item) => {
        let option = {
          id: item.code + "+" + item.costCenterOID + "+" + item.id,
          value: item.name,
        };
        array.addIfNotExist(option);
        this.setState({
          array
        })
      });
    })
  }

  /*componentWillReceiveProps(nextprops) {

    if(nextprops.params.visible&&!this.props.params.visible){
      this.setState({
        ruleId: nextprops.params,
        organizationId: this.props.organization.id
      })
    }
    if(!nextprops.params.visible&&this.props.params.visible){
      this.setState({
        ruleParameterTypeArray: [],
        ruleParamsArray: [],
        validateStatusMap: {},
        helpMap: {},
        loading: false,
        lov: {disabled: true}
      },()=>{
        this.props.form.resetFields()
      })
    }
  }*/

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true,});
        values.controlRuleId = this.props.params.ruleId;
        let str = values.ruleParameter.split("+");
        values.ruleParameter = str[0];
        values.ruleParameterOID = str[1];
        budgetService.addRuleDetail(values).then((res) => {
          this.setState({
            loading: false,
            filtrateMethodHelp: '',
            summaryOrDetailHelp: ''
          });
          if (res.status == 200) {
            this.props.onClose(true);
            message.success(`${this.$t({ id: "common.save.success" }, { name: "" })}`);
            let { validateStatusMap, helpMap } = this.state;
            validateStatusMap = {};
            helpMap = {};
            this.setState({
              loading: false,
              validateStatusMap,
              helpMap
            });
            this.props.form.resetFields();
          }
        }).catch((e) => {
          if (e.response) {
            message.error(`${this.$t({ id: "common.save.failed" })}, ${e.response.data.message}`);
            this.setState({ loading: false });
          }
        })
      }
    });
  };

  onCancel = () => {
    this.props.form.resetFields();
    this.setState({
      ruleParameterTypeArray: [],
      ruleParamsArray: [],
      validateStatusMap: {},
      helpMap: {},
      loading: false,
      lov: {
        disabled: true
      }
    });
    this.detail = {};
    this.props.onClose();
  };

  //选择规则参数
  handleSelectParam = (value) => {
    let ruleParameterType = this.props.form.getFieldValue("ruleParameterType");
    //没有选择规则参数类型，提示：请先选择规则参数类型
    if (typeof ruleParameterType === 'undefined') {
      let { validateStatusMap, helpMap } = this.state;
      validateStatusMap.ruleParameter = "warning";
      helpMap.ruleParameter = "请先选择规则参数类型";
      this.setState({
        validateStatusMap,
        helpMap
      })
    }
  };


  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, selectedData, lov, paramValueMap, validateStatusMap, helpMap, ruleParameterTypeArray, filtrateMethodArray, summaryOrDetailArray, ruleParamsArray } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };

    return (
      <div className="new-budget-control-rules-detail">
        <Form onSubmit={this.handleSubmit}>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'budget.ruleParameterType' })  /*规则参数类型*/}
                        validateStatus={validateStatusMap.ruleParameterType}
                        help={helpMap.ruleParameterType}>
                {getFieldDecorator('ruleParameterType', {
                  rules: [{
                    required: true,
                    message: this.$t({ id: "common.please.select" })
                  },
                    {
                      validator: (item, value, callback) => {
                        if (typeof value !== 'undefined') {
                          validateStatusMap.ruleParameter = "";
                          helpMap.ruleParameter = "";
                          validateStatusMap.ruleParameterType = "";
                          helpMap.ruleParameterType = "";

                          lov.type = value;
                          lov.disabled = true;
                          this.setState({
                            loading: false,
                            lov,
                            validateStatusMap,
                            helpMap,
                          });
                          let ruleParameterCode;
                          switch (value) {
                            case 'BGT_RULE_PARAMETER_BUDGET': ruleParameterCode = 2015; break;
                            case 'BGT_RULE_PARAMETER_ORG': ruleParameterCode = 2016; break;
                            case 'BGT_RULE_PARAMETER_DIM': ruleParameterCode = 2017; break
                          }
                          if (ruleParameterCode === 2017) {
                            ruleParamsArray.splice(0, ruleParamsArray.length);
                            this.getCostCenter(ruleParamsArray);
                          }
                          else {
                            this.getValueList(ruleParameterCode, ruleParamsArray);
                          }
                          //规则参数类型修改后，规则参数，上限值，下限值自动清空
                          this.props.form.setFieldsValue({ "ruleParameter": "", "parameterLowerLimit": "", "parameterUpperLimit": "" });
                          callback();
                        } else {
                          validateStatusMap.ruleParameterType = "error";
                          helpMap.ruleParameterType = this.$t({ id: "common.please.select" });
                          this.setState({ validateStatusMap, helpMap })
                        }
                      }
                    }
                  ]
                })(
                  <Select
                    className="input-disabled-color" placeholder={this.$t({ id: "common.please.select" })}
                    onFocus={() => this.getValueList(2012, ruleParameterTypeArray)}>
                    {
                      ruleParameterTypeArray.map((item) => <Option key={item.id}>{item.value}</Option>)
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'budget.ruleParameter' })  /*规则参数*/}
                validateStatus={validateStatusMap.ruleParameter}
                help={helpMap.ruleParameter}>
                {getFieldDecorator('ruleParameter', {
                  rules: [{
                    required: true,
                  },
                    {
                      validator: (item, value, callback) => {
                        if (typeof value === 'undefined' || value==='') {
                          validateStatusMap.ruleParameter = "error";
                          helpMap.ruleParameter = this.$t({ id: "common.please.select" })
                        } else {
                          let temp = {};
                          if (lov.type === 'BGT_RULE_PARAMETER_DIM') {
                            temp = {
                              type: 'BGT_RULE_PARAMETER_DIM',
                              listType: 'cost_center_item_by_id',
                              listExtraParams: { costCenterId: value.split("+")[2] },
                              codeKey: 'code'
                            }
                          } else {
                            temp = paramValueMap[value]
                          }
                          temp&&(temp.disabled = false);
                          validateStatusMap.ruleParameter = "";
                          helpMap.ruleParameter = "";
                          validateStatusMap.parameterLowerLimit = "";
                          validateStatusMap.parameterUpperLimit = "";
                          helpMap.parameterLowerLimit = "";
                          helpMap.parameterUpperLimit = "";
                          this.setState({
                            lov: temp,
                            loading: false
                          });
                          //规则参数修改后，上限值，下限值自动清空
                          this.props.form.setFieldsValue({ "parameterLowerLimit": "", "parameterUpperLimit": "" });
                          callback();
                        }
                      }
                    }
                  ]
                })(
                  <Select
                    onFocus={this.handleSelectParam}
                    className="input-disabled-color" placeholder={this.$t({ id: "common.please.select" })}>
                    {
                      ruleParamsArray.map((item) => <Option key={item.id}>{item.value}</Option>)
                    }
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout}
                        label={this.$t({ id: 'budget.filtrateMethod' })  /*取值方式*/}
                        validateStatus={validateStatusMap.filtrateMethod}
                        help={helpMap.filtrateMethod}>
                {getFieldDecorator('filtrateMethod', {
                  rules: [{
                    required: true,
                    message: this.$t({ id: "common.please.select" })
                  },
                    {
                      validator: (item, value, callback) => {
                        helpMap.filtrateMethod = value === "INCLUDE" ? this.$t({id:'budget.filtrateMethodHelp.contain'}) /*值范围为闭区间，包含左右边界值*/
                          : value === "EXCLUDE" ? this.$t({id:'budget.filtrateMethodHelp.exclude'}) : this.$t({id:'common.please.select'}),/*值范围为开区间，不包含左右边界值*/
                          validateStatusMap.filtrateMethod = typeof value === 'undefined' ? "error" : "";
                        this.setState({
                          helpMap,
                          loading: false,
                          validateStatusMap
                        });
                        callback();
                      }
                    }]
                })(
                  <Select
                    placeholder={this.$t({ id: "common.please.select" })}
                    onFocus={() => this.getValueList(2013, filtrateMethodArray)}
                    Control periodControl period       >
                    {filtrateMethodArray.map((item) => <Option key={item.id}>{item.value}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout}
                        label={this.$t({ id: 'budget.summaryOrDetail' })  /*取值范围*/}
                        validateStatus={validateStatusMap.summaryOrDetail}
                        help={helpMap.summaryOrDetail}>
                {getFieldDecorator('summaryOrDetail', {
                  initialValue: "DETAIL",
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: "common.please.select" })
                    },
                    {
                      validator: (item, value, callback) => {
                        validateStatusMap.summaryOrDetail = "";
                        helpMap.summaryOrDetail = "";
                        callback();
                      }
                    }
                  ]
                })(
                  <Select
                    disabled
                    placeholder={this.$t({ id: "common.please.select" })}
                  >
                    {summaryOrDetailArray.map((item) => <Option key={item.id}>{item.value}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'budget.parameterLowerLimit' })  /*下限值*/}
                        validateStatus={validateStatusMap.parameterLowerLimit}
                        help={helpMap.parameterLowerLimit}>
                {getFieldDecorator('parameterLowerLimit',
                  {
                    rules: [
                      {
                        required: true,
                        message: this.$t({ id: "common.please.select" })
                      },
                      {
                        validator: (item, value, callback) => {
                          if (typeof value === 'undefined'|| value==='') {
                            validateStatusMap.parameterLowerLimit = "error";
                            helpMap.parameterLowerLimit = this.$t({ id: "common.please.select" })
                          }else {
                            validateStatusMap.parameterLowerLimit = "";
                            helpMap.parameterLowerLimit = '';
                          }
                          callback();
                        }
                      }
                    ]
                  })(
                  <Selput type={lov&&lov.listType}
                          valueKey={lov&&lov.codeKey}
                          selectorItem={lov.selectorItem}
                          listExtraParams={lov&&lov.listExtraParams}
                          disabled={lov&&lov.disabled}
                          onChange={() => { }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'budget.parameterUpperLimit' })  /*上限值*/}
                        validateStatus={validateStatusMap.parameterUpperLimit}
                        help={helpMap.parameterUpperLimit}>
                {getFieldDecorator('parameterUpperLimit', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: "common.please.select" })
                    },
                    {
                      validator: (item, value, callback) => {
                        if (typeof value === 'undefined'||value==='') {
                          validateStatusMap.parameterUpperLimit = "error";
                          helpMap.parameterUpperLimit = this.$t({ id: "common.please.select" })
                        }else {
                          validateStatusMap.parameterUpperLimit = "";
                          helpMap.parameterUpperLimit = '';
                        }
                        callback();
                      }
                    }
                  ]
                })(
                  <Selput type={lov.listType}
                          valueKey={lov.codeKey}
                          listExtraParams={lov.listExtraParams}
                          disabled={lov.disabled}
                          selectorItem={lov.selectorItem}
                          onChange={() => { }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'budget.invalidDate' })  /*失效日期*/}>
                {getFieldDecorator('invalidDate')(
                  <DatePicker placeholder={this.$t({ id: "common.please.enter" })} />
                )}
              </FormItem>
            </Col>
          </Row>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{this.$t({ id: "common.save" })}</Button>
            <Button onClick={this.onCancel}>{this.$t({ id: "common.cancel" })}</Button>
            <input ref="blur" style={{ position: 'absolute', top: '-100vh' }} />
          </div>
        </Form>
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {
    organization: state.budget.organization,
    company: state.user.company,
  }
}

const WrappedNewBudgetRulesDetail = Form.create()(NewBudgetRulesDetail);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetRulesDetail);
