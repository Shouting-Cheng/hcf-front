import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import {messages} from "share/common";
import { Form, Switch, Icon, Input, Select, Button, Row, Col, message } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import httpFetch from 'share/httpFetch'
import menuRoute from 'routes/menuRoute'
import config from 'config'

class NewBudgetJournalType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budgetJournalTypeDetailPage: menuRoute.getRouteItem('budget-journal-type-detail','key'),    //项目组详情的页面项
      budgetOrganization: menuRoute.getRouteItem('budget-organization-detail', 'key'),  //预算组织详情的页面项
      loading: false,
      businessTypeOptions: [],
      linkForm:[]
    };
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.organizationId = this.props.organization.id;
        values.form0id = values.form.split("?")[0];
        values.formType = values.form.split("?")[1];
        values.formName = values.form.split("?")[2];
        httpFetch.post(`${config.budgetUrl}/api/budget/journal/types`, values).then((res)=>{
          this.setState({loading: false});
          message.success(`预算日记账${res.data.journalTypeName}新建成功`);
          this.context.router.replace(this.state.budgetJournalTypeDetailPage.url.replace(":typeId", res.data.id));
        }).catch((e)=>{
          console.log(e)
          message.error(`${formatMessage({id: "common.save.filed"})},同一预算组织下的预算日记账类型代码不能重复!`);
          this.setState({loading: false});
        })
      }
    });
  };

  componentWillMount(){
    this.getSystemValueList(2018).then(res => {
      this.setState({ businessTypeOptions: res.data.values })
    });
  }
  onFormFocus = () => {
      this.fetchFormList();
  }
  fetchFormList = () => {
    let setOfBooksId = this.props.params.setOfBooksId;
    if(!setOfBooksId){
      setOfBooksId = 0;
    }
    httpFetch.get(`${config.baseUrl}/api/custom/forms/setOfBooks/my/available/all?formTypeId=801002&setOfBooksId=${setOfBooksId}`).then(res => {
      this.setState({linkForm:res.data})
    })
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    return (
      <div onSubmit={this.handleSave}>
        <h3 className="header-title">新建预算日记账类型</h3>
        <div className="common-top-area">
          <Form>
            <Row gutter={40}>
              <Col span={8}>
                <FormItem label="预算组织">
                  {getFieldDecorator("organizationName", {
                    initialValue: this.props.organization.organizationName
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="预算日记账类型代码">
                  {getFieldDecorator("journalTypeCode", {
                    rules: [{
                      required: true,
                      message: formatMessage({id: 'common.please.enter'}),  //请输入
                    }],
                    initialValue: ''
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="预算日记账类型名称">
                  {getFieldDecorator("journalTypeName", {
                    rules: [{
                      required: true,
                      message: formatMessage({id: 'common.please.enter'}),  //请输入
                    }],
                    initialValue: ''
                  })(
                    <Input placeholder="请输入"/>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="预算业务类型">
                  {getFieldDecorator("businessType", {
                    rules: [{
                      required: true,
                      message: formatMessage({id: 'common.please.select'}),  //请选择
                    }],
                    initialValue: ''
                  })(
                    <Select placeholder="请选择">
                      {this.state.businessTypeOptions.map((option)=>{
                        return <Option key={option.code}>{option.messageKey}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="关联表单">
                  {getFieldDecorator("form", {
                    rules: [{
                      required: false,
                      message: formatMessage({id: 'common.please.select'}),  //请选择
                    }],
                    initialValue: ''
                  })(
                    <Select allowClear onFocus={this.onFormFocus} placeholder={ messages("common.please.select")}>
                      {this.state.linkForm.map((option)=>{
                        return <Option key={option.formOID+'?'+option.formType+'?'+option.formName}>{option.formName}</Option>
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem label="状态">
                  {getFieldDecorator('enabled', {
                    initialValue: true
                  })(
                    <Switch defaultChecked={true} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Button htmlType="submit" type="primary">保存</Button>
                <Button style={{ marginLeft: 8 }} onClick={() => {this.context.router.push(this.state.budgetOrganization.url.replace(":id", this.props.organization.id).replace(":setOfBooksId",this.props.params.setOfBooksId) + '?tab=JOURNAL_TYPE');}}>取消</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

NewBudgetJournalType.contextTypes = {
  router: React.PropTypes.object
};

const WrappedNewBudgetJournalType = Form.create()(NewBudgetJournalType);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetJournalType);
