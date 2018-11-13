import React from 'react'
import { connect } from 'dva'

import { Alert, Form, Switch, Icon, Input, Select, Button, Row, Col, message, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
import { routerRedux } from 'dva/router';
import budgetOrganizationService from 'containers/budget-setting/budget-organization/budget-organnization.service'
import baseService from 'share/base.service'
import 'styles/budget-setting/budget-organization/new-budget-organization.scss'

class NewBudgetOrganization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
          message.success(this.$t({id: 'common.create.success'}, {name: values.organizationName}));  //新建成功
          this.props.dispatch({
            type: 'budget/setOrganization',
            organization: res.data,
          });
          this.props.dispatch(
            routerRedux.push({
              pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
                .replace(':id', res.data.id)
                .replace(":setOfBooksId",res.data.setOfBooksId)
            })
          );
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t("common.create.filed")/*新建失败*/}, ${e.response.data.message}`);
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
          message={this.$t({id: 'common.help'})/*提示信息*/}
          description={this.$t({id: 'budget.organization.new.info'})/*同一账套下只能有一个生效的预算组织代码，且同一租户下预算组织代码不允许重复。保存后不可修改。*/}
          type="info"
          showIcon
        />
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({id: 'budget.organization.set.of.books'})/* 账套 */}>
            {getFieldDecorator('setOfBooksId', {
              rules: [{
                required: true,
                message: this.$t({id: 'common.please.select'})  //请选择
              }]
            })(
              <Select placeholder={this.$t({id: 'common.please.select'})/* 请选择 */}  notFoundContent={<Spin size="small" />}>
                {setOfBooks.map((option)=>{
                  return <Option key={option.id}>{option.setOfBooksCode+'-'+option.setOfBooksName}</Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: 'budget.organization.code'})/* 预算组织代码 */}>
            {getFieldDecorator('organizationCode', {
              rules: [{
                required: true,
                message: this.$t({id: 'common.please.enter'}),  //请输入
              }],
              initialValue: ''
            })(
              <Input placeholder={this.$t({id: 'common.please.enter'})/* 请输入 */}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: 'budget.organization.name'})/* 预算组织名称 */}>
            {getFieldDecorator('organizationName', {
              rules: [{
                required: true,
                message: this.$t({id: 'common.please.enter'}),  //请输入
              }],
              initialValue: ''
            })(
              <Input placeholder={this.$t({id: 'common.please.enter'})/* 请输入 */}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: 'common.column.status'})/* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: true
            })(
              <Switch defaultChecked={true} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}/>
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})}
          </FormItem>
          <FormItem wrapperCol={{ offset: 7 }}>
            <Row gutter={1}>
              <Col span={3}><Button type="primary" htmlType="submit" loading={this.state.loading}>{this.$t({id: 'common.save'})/* 保存 */}</Button></Col>
              <Col span={3}><Button onClick={() => {
                this.props.dispatch(
                routerRedux.push({
                  pathname: '/budget-setting/budget-organization'
                })
              );}}>{this.$t({id: 'common.cancel'})/* 取消 */}</Button></Col>
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


const WrappedNewBudgetOrganization = Form.create()(NewBudgetOrganization);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetOrganization);
