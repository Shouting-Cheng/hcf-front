/**
 *  created by jsq on 2017/9/27
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Form, Select,Input, Col, Row, Switch, message, Icon, DatePicker, InputNumber  } from 'antd';
import budgetService from 'containers/budget-setting/budget-organization/budget-control-rules/budget-control-rulles.service'
import debounce from 'lodash.debounce';

import "styles/budget-setting/budget-organization/budget-control-rules/new-budget-control-rules.scss"

const FormItem = Form.Item;
const Option = Select.Option;

class NewBudgetControlRules extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      strategyGroup: [],
      startValue: null,
      endValue: null,
    };
    this.validateRuleCode = debounce(this.validateRuleCode,1000)
  }

  componentWillMount(){
    //加载页面时，获取启用的控制策略
    budgetService.getStrategy({organizationId: this.props.organization.id, enabled: true }).then((response)=>{
      if(response.status === 200){
        let strategyGroup = [];
        response.data.map((item)=>{
          let strategy = {
            id: item.id,
            key: item.controlStrategyCode,
            value: item.controlStrategyCode+" - "+item.controlStrategyName,
            title: item.controlStrategyName
          };
          strategyGroup.push(strategy);
        });
        this.setState({
          strategyGroup: strategyGroup
        })
      }
    })
  }

  //处理开始时间
  handleDisabledStartDate = (startValue) =>{

    if(!this.state.endValue || !startValue){
      return false
    }
    return startValue.valueOf() > this.state.endValue.valueOf();
  };

  HandleStartChange = (value) =>{
    this.onChange("startValue",value)
  };

  HandleEndChange = (value) =>{
    this.onChange("endValue",value)
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  handleDisabledEndDate = (endValue) =>{
    if (!this.state.startValue || !endValue) {
      return false;
    }
    return endValue.valueOf() <= this.state.startValue.valueOf();
  };

  //新建预算规则
  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.organizationId = this.props.organization.id;
        values.strategyGroupId = values.controlStrategy.key;
        budgetService.addRule(values).then((response)=>{
          if(response.status === 200) {
            message.success(this.$t({id:"structure.saveSuccess"})); /*保存成功！*/
            this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.
            budgetControlRulesDetail.url.replace(':id', this.props.params.id).replace(':ruleId', response.data.id).replace(":setOfBooksId",this.props.params.setOfBooksId));
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t({id:"common.save.filed"})}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    })
  };

  handleCancel = (e) =>{
    e.preventDefault();
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetOrganizationDetail.url.replace(':id', this.props.params.id).replace(":setOfBooksId",this.props.params.setOfBooksId)+ '?tab=RULE');
  };

  validateRuleCode = (item,value,callback)=>{
    budgetService.getRuleByOptions({organizationId: this.props.params.id,controlRuleCode: value}).then((response)=>{
      let flag = false;
      if(response.data.length > 0 ){
        response.data.map((item)=>{
          if(item.structureCode === value) {
            flag = true;
          }
        })
      }
      flag >0 ? callback(this.$t({id:"budget.rule.code.exist"})) : callback();
    });
  };

  handleSelect=()=>{
    let value = this.props.form.getFieldValue("controlStrategy");
    if(typeof value !== 'undefined'){
      let controlStrategy = {
        key: value.key,
        label: value.title,
        title: value.title
      };
      this.props.form.setFieldsValue({"controlStrategy": controlStrategy})
    }
  };


  render(){
    const { getFieldDecorator } = this.props.form;
    const { strategyGroup, startValue, endValue} = this.state;
    return(
      <div className="new-budget-control-rules">
        <div className="budget-control-rules-form">
          <Form onSubmit={this.handleSave} className="budget-control-rules-form">
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={ this.$t({id:"budget.controlRuleCode"}) /*业务规则代码*/}
                  colon={true}>
                  {getFieldDecorator('controlRuleCode', {
                    rules:[
                      {required:true,message: this.$t({id:"common.please.enter"})},
                      {
                        validator:(item,value,callback)=>this.validateRuleCode(item,value,callback)
                      }
                    ]
                  })(
                    <Input placeholder={ this.$t({id:"common.please.enter"})}/>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={ this.$t({id:"budget.controlRuleName"}) /*控制规则名称*/}
                  colon={true}>
                  {getFieldDecorator('controlRuleName', {
                    rules:[
                      {required:true,message: this.$t({id:"common.please.enter"})},
                    ]
                  })(
                    <Input placeholder={ this.$t({id:"common.please.enter"})}/>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label= {this.$t({id:"budget.strategy"})}
                  colon={true}>
                  {getFieldDecorator('controlStrategy', {
                    rules:[
                      {required:true,message: this.$t({id:"common.please.enter"})},
                    ]
                  })(
                    <Select
                      labelInValue
                      onBlur={this.handleSelect}
                      placeholder={ this.$t({id:"common.please.select"})}>
                      {strategyGroup.map((item)=><Option key={item.id} value={item.id}  title={item.title}>{item.value}</Option>)}
                    </Select>)
                  }
                </FormItem>
              </Col>
            </Row>
            <Row gutter={60}>
              <Col span={8}>
                <Col span={11}>
                  <FormItem
                    label={this.$t({id:"budget.controlRule.effectiveDateFrom"}) /*有效日期*/}
                    colon={true}>
                    {getFieldDecorator('startDate', {
                      rules:[
                        {required:true,message:this.$t({id:"common.please.enter"})},
                        {
                          validator:(item,value,callback)=>{
                            if(value === "undefined" || value === ""){
                              callback();
                              return
                            }
                            callback();
                          }
                        }
                      ]
                    })(
                      <DatePicker
                        placeholder={this.$t({id:"budget.controlRule.startDate"})}
                        setFieldsValue={startValue}
                        onChange={this.HandleStartChange}
                        disabledDate={this.handleDisabledStartDate}/>)
                    }
                  </FormItem>
                </Col>
                <Col span={11} offset={2}>
                  <FormItem
                    label={this.$t({id:"budget.controlRule.effectiveDateTo"}) /*有效日期*/}
                    colon={false}>
                    {getFieldDecorator('endDate', {
                      rules:[
                        {
                          validator:(item,value,callback)=>{
                            if(value === "undefined" || value === ""){
                              callback(messages('operate.log.time.tip2'/*请选择结束时间*/));
                              return
                            }
                            callback()
                          }
                        }
                      ]
                    })(
                      <DatePicker
                        placeholder={this.$t({id:"budget.controlRule.endDate"})}
                        setFieldsValue={endValue}
                        onChange={this.HandleEndChange}
                        disabledDate={this.handleDisabledEndDate}/>)
                    }
                  </FormItem>
                </Col>
              </Col>
              <Col span={6}>
                <FormItem
                  label={this.$t({id:"budget.controlRules.priority"}) /*优先级*/}
                  colon={true}>
                  {getFieldDecorator('priority', {
                    rules:[
                      {required:true,message:this.$t({id:"common.please.enter"})},
                      {
                        validator:(item,value,callback)=>{
                          if(value === "undefined" || value === ""){
                            callback();
                            return
                          }
                          callback();
                        }
                      }
                    ]
                  })(
                    <InputNumber  placeholder={this.$t({id:"common.please.enter"})}/>)
                  }
                </FormItem>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit">{this.$t({id:"common.save"}) /*保存*/}</Button>
            <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}> {this.$t({id:"common.cancel"}) /*取消*/}</Button>
          </Form>
        </div>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    organization: state.user.organization
  }
}

const WrappedNewBudgetControlRules = Form.create()(NewBudgetControlRules);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetControlRules);
