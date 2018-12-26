import React from 'react'
import { connect } from 'dva'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { Form, Input, Row, Col, Select, Button, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import 'styles/budget-setting/budget-organization/budget-strategy/new-budget-strategy-detail.scss'
import * as routerRedux from "react-router-redux";

class NewBudgetStrategyDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      controlMethodNotice: '',
      controlMethodOptions: [],
      messageCodeOptions: [],
      controlMethodValue: '',
    }
  }

  componentWillMount(){
    this.getSystemValueList(2005).then(res => { //预算控制方法
      let controlMethodOptions = res.data.values;
      this.setState({ controlMethodOptions })
    });
    this.getSystemValueList(2022).then(res => { //预算控制消息
      let messageCodeOptions = res.data.values;
      this.setState({ messageCodeOptions })
    });
  }

  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.controlStrategyId = this.props.match.params.id;
        if (values.controlMethod !== 'NO_MESSAGE' && !values.messageCode) {
          message.error(this.$t({id: "budget.strategy.select.message"}/*请选择消息*/));
          return;
        }
        this.setState({loading: true});
        httpFetch.post(`${config.budgetUrl}/api/budget/control/strategy/details`, values).then((res)=>{
          if(res.status === 200){
            this.setState({loading: false});
            message.success(this.$t({id: 'common.create.success'},{name: ''}) /* 新建成功 */);
            this.handleCancel();
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t({id: 'common.create.filed'}) /* 新建失败 */}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  handleCancel = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-strategy/budget-strategy-detail/:setOfBooksId/:orgId/:id'
          .replace(':orgId', this.props.match.params.orgId)
          .replace(':setOfBooksId',this.props.match.params.setOfBooksId)
          .replace(':id', this.props.match.params.id)
      })
    );
  };

  handleMethodChange = (value) => {
    let controlMethodNotice = '';
    if(value === 'BLOCK') {
      controlMethodNotice = this.$t({id: "budget.strategy.notice.forbid.submit"}/*如果满足触发条件，当单据提交时，禁止提交*/);
    } else if(value === 'ALLOWED') {
      controlMethodNotice = this.$t({id: "budget.strategy.notice.show.notice"}/*如果满足触发条件，当单据提交时，进行提示*/);
    } else {
      controlMethodNotice = this.$t({id: "budget.strategy.notice.no.control"}/*不做任何控制*/);
      this.props.form.setFieldsValue({messageCode: null})
    }
    this.setState({ controlMethodNotice, controlMethodValue: value })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { controlMethodNotice, controlMethodOptions, messageCodeOptions, controlMethodValue } = this.state;
    return (
      <div className="new-budget-strategy-detail">
        <Form onSubmit={this.handleSave}>
          <Row>
            <Col span={7}>
              <FormItem label={this.$t({id: "common.sequence"}/*序号*/)}>
                {getFieldDecorator('detailSequence', {
                  rules: [{
                    required: true,
                    message: this.$t({id: "common.please.enter"}/*请输入*/)
                  }],
                  initialValue: ''
                })(
                  <Input placeholder={this.$t({id: "common.please.enter"}/*请输入*/)} />
                )}
              </FormItem>
            </Col>
            <Col span={7} offset={1}>
              <FormItem label={this.$t({id: "budget.strategy.rule.code"}/*规则代码*/)}>
                {getFieldDecorator('detailCode', {
                  rules: [{
                    required: true,
                    message: this.$t({id: "common.please.enter"}/*请输入*/)
                  }],
                  initialValue: ''
                })(
                  <Input placeholder={this.$t({id: "common.please.enter"}/*请输入*/)} />
                )}
              </FormItem>
            </Col>
            <Col span={7} offset={1}>
              <FormItem label={this.$t({id: "budget.strategy.control.strategy"}/*控制策略*/)} help={controlMethodNotice}>
                {getFieldDecorator('controlMethod', {
                  rules: [{
                    required: true,
                    message: this.$t({id: "common.please.enter"}/*请输入*/)
                  }]})(
                  <Select onChange={this.handleMethodChange} placeholder={this.$t({id: "common.please.enter"}/*请输入*/)}>
                    {controlMethodOptions.map((option)=>{
                      return <Option key={option.value}>{option.messageKey}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={7}>
              <FormItem label={this.$t({id: "budget.strategy.rule.name"}/*控制规则名称*/)}>
                {getFieldDecorator('detailName', {
                  rules: [{
                    required: true,
                    message: this.$t({id: "common.please.enter"}/*请输入*/)
                  }],
                  initialValue: ''
                })(
                  <Input placeholder={this.$t({id: "common.please.enter"}/*请输入*/)} />
                )}
              </FormItem>
            </Col>
            <Col span={7} offset={1}>
              <FormItem label={this.$t({id: "budget.strategy.message"}/*消息*/)}>
                {getFieldDecorator('messageCode', {
                  rules: [{
                    required: !(controlMethodValue === 'NO_MESSAGE'),
                    message: this.$t({id: "common.please.select"}/*请选择*/)
                  }]})(
                  <Select placeholder={this.$t({id: "common.please.select"}/*请选择*/)} disabled={controlMethodValue === 'NO_MESSAGE'}>
                    {messageCodeOptions && messageCodeOptions.map((option)=>{
                      return <Option key={option.value}>{option.messageKey}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={7} offset={1}>
              <FormItem label={this.$t({id: "budget.strategy.event"}/*事件*/)}>
                {getFieldDecorator('expWfEvent', {
                  initialValue: ''
                })(
                  <Input placeholder={this.$t({id: "common.please.enter"}/*请输入*/)} />
                )}
              </FormItem>
            </Col>
          </Row>
          <div>
            <Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({id: "common.save"}/*保存*/)}</Button>
            <Button className="btn-cancel" style={{marginLeft:15}} onClick={this.handleCancel}>{this.$t({id: "common.cancel"}/*取消*/)}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { }
}

const WrappedNewBudgetStrategyDetail = Form.create()(NewBudgetStrategyDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetStrategyDetail);

