import React from 'react'
import { connect } from 'dva'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { Form, Button, Radio, Select, Row, Col, InputNumber, Popover, Icon, message } from 'antd'
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;

class NewStrategyControlDetail extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      objectValue: '',
      rangeValue: '',
      mannerValue: '',
      operatorValue: '',
      valueValue: '',
      periodStrategyValue: '',
      updateParams: {},
      loading: false,
      controlObjectOptions: [], //控制对象
      rangeOptions: [], //比较
      mannerOptions: [], //方式
      operatorOptions: [], //运算符号(+,-,*,/)
      periodStrategyOptions: [], //控制期段
    };
  }
  componentWillMount(){
    this.getSystemValueList(2008).then(res => { //控制对象
      let controlObjectOptions = res.data.values;
      this.setState({ controlObjectOptions })
    });
    this.getSystemValueList(2007).then(res => { //比较
      let rangeOptions = res.data.values;
      this.setState({ rangeOptions })
    });
    this.getSystemValueList(2009).then(res => { //方式
      let mannerOptions = res.data.values;
      this.setState({ mannerOptions })
    });
    this.getSystemValueList(2010).then(res => { //运算符号(+,-,*,/)
      let operatorOptions = res.data.values;
      this.setState({ operatorOptions })
    });
    this.getSystemValueList(2011).then(res => { //控制期段
      let periodStrategyOptions = res.data.values;
      this.setState({ periodStrategyOptions })
    });
  }

  componentWillReceiveProps(nextProps){
    const params = nextProps.params;
    if (params.isNew && !params.newParams.controlStrategyDetailId) {  //新建
      params.newParams.controlStrategyDetailId = params.newParams.strategyControlId;
      this.props.form.resetFields();
      this.setState({
        updateParams: params.newParams,
        objectValue: '',
        rangeValue: '',
        mannerValue: '',
        operatorValue: '',
        valueValue: '',
        periodStrategyValue: ''
      })
    } else if(!params.isNew && params.newParams.id !== this.state.updateParams.id) {  //更新
      this.setState({
        updateParams: params.newParams,
        objectValue: params.newParams.object && params.newParams.object.value,
        rangeValue: params.newParams.range && params.newParams.range.value,
        mannerValue: params.newParams.manner && params.newParams.manner.value,
        operatorValue: params.newParams.operator && params.newParams.operator.value,
        valueValue: params.newParams.value,
        periodStrategyValue: this.handlePeriodStrategy(params.newParams.periodStrategy && params.newParams.periodStrategy.value)
      }, () => {
        let values = this.props.form.getFieldsValue();
        for(let name in values){
          let result = {};
          result[name] = params.newParams[name] ?
            params.newParams[name].value ? params.newParams[name].value : params.newParams[name] :
            params.newParams[name];
          result.organizationName = '10';
          this.props.form.setFieldsValue(result)
        }
      });
    }
  }
  onCancel = () =>{
    this.setState({ updateParams: {} });
    this.props.close();
  };
  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.controlStrategyDetailId = this.props.params.newParams.strategyControlId;
        values.value = Number(values.value).toFixed(4);
        values.manner === 'PERCENTAGE' && (values.operator = "MULTIPLY");
        httpFetch.post(`${config.budgetUrl}/api/budget/control/strategy/mp/conds`, values).then((res)=>{
          this.setState({loading: false});
          if(res.status === 200){
            this.setState({ updateParams: {} });
            this.props.close(true);
            message.success(this.$t({id: "common.save.success"}, {name: ""}/*保存成功*/));
          }
        }).catch((e)=>{
          this.setState({loading: false});
          message.error(`${this.$t({id: "common.save.filed"},/*保存失败*/)}, ${e.response.data.message}`);
        })
      }
    });
  };
  handleUpdate = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.id = this.state.updateParams.id;
        values.controlStrategyDetailId = this.props.params.strategyControlId;
        values.versionNumber = this.state.updateParams.versionNumber++;
        values.value = Number(values.value).toFixed(4);
        values.manner === 'PERCENTAGE' && (values.operator = "MULTIPLY");
        this.setState({loading: true});
        httpFetch.put(`${config.budgetUrl}/api/budget/control/strategy/mp/conds`, values).then((res)=>{
          if(res.status === 200){
            this.setState({loading: false});
            this.props.close(true);
            message.success(this.$t({id: "common.save.success"}, {name: ""}/*保存成功*/));
          }
        }).catch((e)=>{
          this.setState({ loading: false });
          message.error(`${this.$t({id: "common.save.filed"},/*保存失败*/)}, ${e.response.data.message}`);
        })
      }
    });
  };

  handlePeriodStrategy = (value) => {
    const config = {
      YEAR: this.$t({id: "budget.strategy.detail.config.year"}/*全年预算额*/),
      YTD: this.$t({id: "budget.strategy.detail.config.ytd"}/*年初至今预算额*/),
      YTQ: this.$t({id: "budget.strategy.detail.config.ytq"}/*年初至当季度预算额*/),
      RQB: this.$t({id: "budget.strategy.detail.config.rqb"}/*当月至后两个月共3个月合计预算额*/),
      QUARTER: this.$t({id: "budget.strategy.detail.config.quarter"}/*当季预算额*/),
      QTD: this.$t({id: "budget.strategy.detail.config.qtd"}/*季度初至今预算额*/),
      MONTH: this.$t({id: "budget.strategy.detail.config.month"}/*当月录入预算额*/)
    };
    this.setState({ periodStrategyValue: config[value] });
    return config[value]
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { objectValue, rangeValue, mannerValue, operatorValue, valueValue, periodStrategyValue, updateParams, loading, controlObjectOptions, rangeOptions, mannerOptions, operatorOptions, periodStrategyOptions } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const content = (
      <div style={{color:'#999'}}>
        <div style={{marginBottom:'10px'}}>{this.$t({id: "budget.strategy.detail.period.title"}/*控制策略控制期段即以何种方式对预算进行控制*/)}</div>
        <div>
          <span style={{color:'#666'}}>【{this.$t({id: "budget.strategy.detail.period.period"}/*期间*/)}】：</span>
          {this.$t({id: "budget.strategy.detail.period.content.period"}/*按当月录入预算额控制*/)}
          <br/>
          <span style={{color:'#666'}}>【{this.$t({id: "budget.strategy.detail.period.quarter"}/*季度*/)}】：</span>
          {this.$t({id: "budget.strategy.detail.period.content.quarter"}/*按当季预算额控制*/)}
          <br/>
          <span style={{color:'#666'}}>【{this.$t({id: "budget.strategy.detail.period.year"}/*年度*/)}】：</span>
          {this.$t({id: "budget.strategy.detail.period.content.year"}/*按全年预算额控制*/)}
          <br/>
          <span style={{color:'#666'}}>【{this.$t({id: "budget.strategy.detail.period.qtd"})/*季度至今*/}】：</span>
          {this.$t({id: "budget.strategy.detail.period.content.qtd"})/*按季度初至今预算额控制*/}
          <br/>
          <span style={{color:'#666'}}>【{this.$t({id: "budget.strategy.detail.period.ytd"}/*年度至今*/)}】：</span>
          {this.$t({id: "budget.strategy.detail.period.content.ytd"}/*按年初至今预算额控制*/)}
          <br/>
          <span style={{color:'#666'}}>【{this.$t({id: "budget.strategy.detail.period.rqb"}/*季度滚动*/)}】：</span>
          {this.$t({id: "budget.strategy.detail.period.content.rqb"}/*按当月至后两个月共3个月合计预算额控制*/)}
          <br/>
          <span style={{color:'#666'}}>【{this.$t({id: "budget.strategy.detail.period.ytq"}/*累计季度*/)}】：</span>
          {this.$t({id: "budget.strategy.detail.period.content.ytq"}/*按年初至当季度预算额控制*/)}
        </div>
      </div>
    );
    return (
      <div className="new-strategy-control-detail">
        <Form onSubmit={updateParams.id ? this.handleUpdate : this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.strategy.detail.type"}/*类型*/)} style={{margin:'24px 0'}}>
            {getFieldDecorator('organizationName', {
              initialValue: '10'
            })(
              <RadioGroup>
                <RadioButton value="10">{this.$t({id: "budget.strategy.detail.formula"}/*公式*/)}</RadioButton>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.strategy.detail.control.object"}/*控制对象*/)}>
            {getFieldDecorator('object', {
              rules: [{
                required: true,
                message: this.$t({id: 'common.please.select'})/*请选择*/
              }],
              initialValue: updateParams.object && updateParams.object.value
            })(
              <Select onChange={(value)=>{this.setState({ objectValue: value })}} placeholder={this.$t({id: 'common.please.select'})/*请选择*/}>
                {controlObjectOptions.map((option)=>{
                  return <Option key={option.value}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.strategy.detail.compare"}/*比较*/)}>
            {getFieldDecorator('range', {
              rules: [{
                required: true,
                message: this.$t({id: 'common.please.select'})/*请选择*/
              }],
              initialValue: updateParams.range && updateParams.range.value
            })(
              <Select onChange={(value)=>{this.setState({ rangeValue: value })}} placeholder={this.$t({id: 'common.please.select'})/*请选择*/}>
                {rangeOptions.map((option)=>{
                  return <Option key={option.value}>{option.messageKey}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <Row>
            <Col span={6} className="ant-form-item-label label-style">{this.$t({id: "budget.strategy.detail.manner"}/*方式*/)}： </Col>
            <Col span={5} className="ant-col-offset-1">
              <FormItem>
                {getFieldDecorator('manner', {
                  rules: [{
                    required: true,
                    message: this.$t({id: 'common.please.select'})/*请选择*/
                  }],
                  initialValue: updateParams.manner && updateParams.manner.value
                })(
                  <Select onChange={(value)=>{this.setState({ mannerValue: value })}} placeholder={this.$t({id: 'common.please.select'})/*请选择*/}>
                    {mannerOptions.map((option)=>{
                      return <Option key={option.value}>{option.messageKey}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            {mannerValue !== 'PERCENTAGE' && (
              <Col span={5} style={{marginLeft:5}}>
                <FormItem className="ant-col-offset-1">
                  {getFieldDecorator('operator', {
                    rules: [{
                      required: true,
                      message: this.$t({id: 'common.please.select'})/*请选择*/
                    }],
                    initialValue: updateParams.operator && updateParams.operator.value
                  })(
                    <Select onChange={(value)=>{this.setState({ operatorValue:value })}} placeholder={this.$t({id: 'common.please.select'})/*请选择*/}>
                      {operatorOptions.map((option)=>{
                        return <Option key={option.value}>{option.messageKey}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={3} style={{marginLeft:5}}>
              <FormItem className="ant-col-offset-1">
                {getFieldDecorator('value', {
                  rules: [{
                    required: true,
                    message: this.$t({id: "common.please.enter"}/*请输入*/)
                  }],
                  initialValue: updateParams.value
                })(
                  <InputNumber min={0}
                               placeholder={this.$t({id: "common.please.enter"}/*请输入*/)}
                               style={{width:'100%'}}
                               formatter={value => mannerValue !== 'PERCENTAGE' ? value : `${value}%`}
                               parser={value => mannerValue !== 'PERCENTAGE' ? value : value.replace('%', '')}
                               onChange={(value) => {this.setState({ valueValue:value })}}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={6} className="ant-form-item-label label-style">{this.$t({id: "budget.strategy.detail.control.period"}/*控制期段*/)}： </Col>
            <Col span={12} className="ant-col-offset-1">
              <FormItem>
                {getFieldDecorator('periodStrategy', {
                  rules: [{
                    required: true,
                    message: this.$t({id: 'common.please.select'})/*请选择*/
                  }],
                  initialValue: updateParams.periodStrategy && updateParams.periodStrategy.value
                })(
                  <Select onChange={this.handlePeriodStrategy} placeholder={this.$t({id: 'common.please.select'})/*请选择*/}>
                    {periodStrategyOptions.map((option)=>{
                      return <Option key={option.value}>{option.messageKey}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={2} className="ant-col-offset-1">
              <Popover placement="topLeft" content={content} title={this.$t({id: "budget.strategy.detail.budget.control.period"}/*预算控制期段*/)}>
                <Icon type="question-circle-o"
                      style={{fontSize:'18px',cursor:'pointer',color:'#49a9ee',position:'relative',top:'7px'}}/>
              </Popover>
            </Col>
          </Row>
          <FormItem {...formItemLayout} label={this.$t({id: "budget.strategy.detail.condition"}/*触发条件*/)}>
            {getFieldDecorator('scenarioName')(
              <div>
                {controlObjectOptions.map(option => {
                  return option.value === objectValue ? option.messageKey : ''
                })} {rangeOptions.map(option => {
                return option.value === rangeValue ? option.messageKey : ''
              })} {periodStrategyValue} {mannerValue === 'PERCENTAGE' ? '' : operatorOptions.map(option => {
                return option.value === operatorValue ? option.messageKey : ''
              })} {valueValue ? (mannerValue === 'PERCENTAGE' ? Number(valueValue).toFixed(4) + '%' : Number(valueValue).toFixed(4)) : ''}
              </div>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{this.$t({id: "common.save"}/*保存*/)}</Button>
            <Button onClick={this.onCancel}>{this.$t({id: "common.cancel"}/*取消*/)}</Button>
          </div>
        </Form>
      </div>
    )
  }
}
function mapStateToProps() {
  return {}
}
const WrappedNewStrategyControlDetail = Form.create()(NewStrategyControlDetail);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewStrategyControlDetail);
