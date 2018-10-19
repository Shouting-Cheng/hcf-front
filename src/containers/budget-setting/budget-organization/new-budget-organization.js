import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'

import { Alert, Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;

import menuRoute from 'routes/menuRoute'
import budgetOrganizationService from 'containers/budget-setting/budget-organization/budget-organnization.service'
import baseService from 'share/base.service'
import 'styles/budget-setting/budget-organization/new-budget-organization.scss'

class NewBudgetOrganization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      budgetOrganization: menuRoute.getRouteItem('budget-organization','key'),    //组织定义的页面项
      loading: false,
      setOfBooks: [],
    };
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        budgetOrganizationService.addOrganization(values).then((res)=>{
          this.setState({loading: false});
          message.success(formatMessage({id: 'common.create.success'}, {name: values.organizationName}));  //新建成功
          this.context.router.replace(this.state.budgetOrganization.url);
        }).catch((e)=>{
          if(e.response){
            message.error(`${messages("common.create.filed")/*新建失败*/}, ${e.response.data.message}`);
          } else {
            console.log(e)
          }
          this.setState({loading: false});
        })
      }
    });
  };

  componentWillMount(){
    baseService.getSetOfBooksByTenant().then(res => {
      this.setState({ setOfBooks: res.data })
    })
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    const { setOfBooks, budgetOrganization } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 10, offset: 1 },
    };
    return (
      <div className="new-budget-organization">
        <Alert
          message={formatMessage({id: 'common.help'})/*提示信息*/}
          description={formatMessage({id: 'budget.organization.new.info'})/*同一账套下只能有一个生效的预算组织代码，且同一租户下预算组织代码不允许重复。保存后不可修改。*/}
          type="info"
          showIcon
        />
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={formatMessage({id: 'budget.organization.set.of.books'})/* 账套 */}>
            {getFieldDecorator('setOfBooksId', {
              rules: [{
                required: true,
                message: formatMessage({id: 'common.please.select'})  //请选择
              }]
            })(
              <Select placeholder={formatMessage({id: 'common.please.select'})/* 请选择 */}  notFoundContent={<Spin size="small" />}>
                {setOfBooks.map((option)=>{
                  return <Option key={option.id}>{option.setOfBooksCode}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: 'budget.organization.code'})/* 预算组织代码 */}>
            {getFieldDecorator('organizationCode', {
              rules: [{
                required: true,
                message: formatMessage({id: 'common.please.enter'}),  //请输入
              }],
              initialValue: ''
            })(
              <Input placeholder={formatMessage({id: 'common.please.enter'})/* 请输入 */}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: 'budget.organization.name'})/* 预算组织名称 */}>
            {getFieldDecorator('organizationName', {
              rules: [{
                required: true,
                message: formatMessage({id: 'common.please.enter'}),  //请输入
              }],
              initialValue: ''
            })(
              <Input placeholder={formatMessage({id: 'common.please.enter'})/* 请输入 */}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: 'common.column.status'})/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: true
            })(
              <Switch defaultChecked={true} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/>
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})}
          </FormItem>
          <FormItem wrapperCol={{ offset: 7 }}>
            <Row gutter={1}>
              <Col span={3}><Button type="primary" htmlType="submit" loading={this.state.loading}>{formatMessage({id: 'common.save'})/* 保存 */}</Button></Col>
              <Col span={3}><Button onClick={() => {this.context.router.replace(budgetOrganization.url);}}>{formatMessage({id: 'common.cancel'})/* 取消 */}</Button></Col>
            </Row>
          </FormItem>
        </Form>
      </div>
    )
  }

}

function mapStateToProps() {
  return {}
}

NewBudgetOrganization.contextTypes = {
  router: React.PropTypes.object
};

const WrappedNewBudgetOrganization = Form.create()(NewBudgetOrganization);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetOrganization);
