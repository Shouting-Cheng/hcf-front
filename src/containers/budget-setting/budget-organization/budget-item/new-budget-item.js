/**
 *  created by jsq on 2017/9/21
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Form, Select,Input, Col, Row, Switch, message, Icon } from 'antd';
import budgetService from 'containers/budget-setting/budget-organization/budget-item/budget-item.service'
import ListSelector from 'widget/list-selector'
import "styles/budget-setting/budget-organization/budget-item/new-budget-item.scss"
const FormItem = Form.Item;
const Option = Select.Option;
import { routerRedux } from 'dva/router';
import Chooser from "../../../../components/Widget/chooser";

class NewBudgetItem extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      organization: {},
      showItemType: false ,
      variationAttribute:[],
      listSelectedData: [],
      statusCode: this.$t({id:"common.status.enable"}),  /*启用*/
    };
  }
  componentWillMount(){
    !this.props.organization.id ?
      budgetService.getOrganizationById(this.props.match.params.orgId).then((response) =>{
        this.setState({
          organization: response.data,
        })
      })
      :
      this.setState({
        organization: this.props.organization,
      })
  }
  //新建预算项目
  handleSave = (e) =>{
    this.setState({loading: false});
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.organizationId = this.state.organization.id;
        values.itemTypeId = values.itemTypeName[0].key;
        budgetService.addItem(values).then((response)=>{
          if(response) {
            message.success(this.$t({id:"structure.saveSuccess"})); /*保存成功！*/
            response.data.organizationName = values.organizationName;
            this.setState({loading: false});
            this.props.dispatch(
              routerRedux.replace({
                pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-item/budget-item-detail/:setOfBooksId/:orgId/:id'
                  .replace(':orgId', this.props.match.params.orgId)
                  .replace(':id', response.data.id)
                  .replace(":setOfBooksId",this.props.match.params.setOfBooksId)
              })
            );          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t({id:"common.save.filed"})}, ${e.response.data.message}`);
            this.setState({loading: false});
          }
        })
      }
    });
  };

  handleFocus = () => {
    this.refs.blur.focus();
    this.showList(true)
  };

  showList = (flag) => {
    let listSelectedData = [];
    let values = this.props.form.getFieldValue("itemTypeName");
    if (values && values.length > 0) {
      values.map(value => {
        listSelectedData.push(value.value)
      });
    }
    this.setState({
      showItemType: flag,
      listSelectedData
    })
  };

  handleListOk = (values) => {
    //console.log(values)
  };

  handleCancel = (e) =>{
    e.preventDefault();
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
          .replace(':id', this.props.match.params.orgId)
          .replace(":setOfBooksId",this.props.match.params.setOfBooksId)
          .replace(':tab','ITEM')
      })
    );
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { loading, organization, statusCode, showItemType, variationAttribute, listSelectedData} = this.state;
    const options = variationAttribute.map((item)=><Option key={item.id}>{item.value}</Option>);
    return (
      <div className="new-budget-item">
        <div className="budget-item-form">
          <Form onSubmit={this.handleSave} className="budget-structure-form">
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={this.$t({id:"budget.organization"})}  /*{/!*预算组织*!/}*/
                  colon={true}>
                  {getFieldDecorator('organizationName', {
                    initialValue: organization.organizationName,
                  })(
                    <Input disabled/>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={this.$t({id:"budget.itemCode"})} /* {/!*预算项目代码*!/}*/
                  colon={true}>
                  {getFieldDecorator('itemCode', {
                    rules:[
                      {required:true,message:this.$t({id:"common.please.enter"})},
                    ]
                  })(
                    <Input placeholder={this.$t({id:"common.please.enter"})}
                    />)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={this.$t({id:"budget.itemName"})} /* {/!*预算项目名称*!/}*/
                  colon={true}>
                  {getFieldDecorator('itemName', {
                    rules:[
                      {required:true,message:this.$t({id:"common.please.enter"})},
                    ]
                  })(
                    <Input placeholder={this.$t({id:"common.please.enter"})}
                    />)
                  }
                </FormItem>
              </Col>
            </Row>
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={this.$t({id:"budget.itemType"}) /*预算项目类型*/}
                  colon={true}>
                  {getFieldDecorator('itemTypeName', {
                    rules:[
                      {required:true,message:this.$t({id:"common.please.select"})},/* {/!*请输入*!/}*/
                    ],
                  })(
                    <Chooser
                      single={true}
                      visible={showItemType}
                      type="budget_item_type"
                      labelKey='itemTypeName'
                      valueKey='id'
                      onChange={this.handleListOk}
                      listExtraParams={{organizationId: this.props.match.params.orgId,enabled: true}}
                      //onFocus={this.handleFocus}
                      placeholder={this.$t({id:"common.please.select"})} />) /*请输入*/
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={this.$t({id:"budget.itemDescription"}) /*预算项目描述*/}
                  colon={true}>
                  {getFieldDecorator('description', {
                    rules:[
                    ]
                  })(
                    <Input placeholder={this.$t({id:"common.please.enter"})}
                    />)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={this.$t({id:"common.status"},{status:statusCode})} /* {/!*状态*!/}*/
                  colon={false}>
                  {getFieldDecorator("enabled", {
                    initialValue: true,
                    valuePropName: 'checked',
                    rules:[
                      {
                        validator: (item,value,callback)=>{
                          this.setState({
                            statusCode: value ? this.$t({id:"common.status.enable"}) /*启用*/
                              : this.$t({id:"common.disabled"}) /*禁用*/
                          });
                          callback();
                        }
                      }
                    ],
                  })
                  (<Switch  checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross"/>}/>)
                  }
                </FormItem>
              </Col>
            </Row>
            <Button type="primary" loading={loading} htmlType="submit">{this.$t({id:"common.save"}) /*保存*/}</Button>
            <Button  onClick={this.handleCancel} style={{ marginLeft: 8 }}> {this.$t({id:"common.cancel"}) /*取消*/}</Button>
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
const WrappedNewBudgetItem = Form.create()(NewBudgetItem);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetItem);
