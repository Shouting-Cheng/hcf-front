/**
 *  created by jsq on 2017/9/21
 */
import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import { Button, Form, Select,Input, Col, Row, Switch, message, Icon } from 'antd';
import budgetService from 'containers/budget-setting/budget-organization/budget-item/budget-item.service'
import menuRoute from 'routes/menuRoute'
import ListSelector from 'components/list-selector'
import "styles/budget-setting/budget-organization/budget-item/new-budget-item.scss"
const FormItem = Form.Item;
const Option = Select.Option;

class NewBudgetItem extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      organization: {},
      showItemType: false ,
      variationAttribute:[],
      listSelectedData: [],
      statusCode: formatMessage({id:"common.status.enable"}),  /*启用*/
    };
  }
  componentWillMount(){
    typeof this.props.organization.organizationName === "undefined" ?
      budgetService.getOrganizationById(this.props.params.id).then((response) =>{
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
            message.success(formatMessage({id:"structure.saveSuccess"})); /*保存成功！*/
            response.data.organizationName = values.organizationName;
            this.setState({loading: false});
            this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetItemDetail.url.replace(':id', this.props.params.id).replace(':itemId',response.data.id));
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${formatMessage({id:"common.save.filed"})}, ${e.response.data.message}`);
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

  handleListOk = (result) => {
    let values = [];
    result.result.map(item => {
      values.push({
        key: item.id,
        label: item.itemTypeName,
        value: item,
      })
    });
    let value = {};
    value["itemTypeName"] = values;
    this.props.form.setFieldsValue(value);
    this.showList(false)
  };

  handleCancel = (e) =>{
    e.preventDefault();
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetOrganizationDetail.url.replace(':id', this.props.params.id)+  '? tab=ITEM');
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { loading, organization, statusCode, showItemType, variationAttribute, listSelectedData} = this.state;

    const options = variationAttribute.map((item)=><Option key={item.id}>{item.value}</Option>)
    return (
      <div className="new-budget-item">
        <div className="budget-item-form">
          <Form onSubmit={this.handleSave} className="budget-structure-form">
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.organization"})}  /*{/!*预算组织*!/}*/
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
                  label={formatMessage({id:"budget.itemCode"})} /* {/!*预算项目代码*!/}*/
                  colon={true}>
                  {getFieldDecorator('itemCode', {
                    rules:[
                      {required:true,message:formatMessage({id:"common.please.enter"})},
                    ]
                  })(
                    <Input placeholder={formatMessage({id:"common.please.enter"})}
                    />)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.itemName"})} /* {/!*预算项目名称*!/}*/
                  colon={true}>
                  {getFieldDecorator('itemName', {
                    rules:[
                      {required:true,message:formatMessage({id:"common.please.enter"})},
                    ]
                  })(
                    <Input placeholder={formatMessage({id:"common.please.enter"})}
                    />)
                  }
                </FormItem>
              </Col>
            </Row>
            <Row gutter={60}>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.itemType"}) /*预算项目类型*/}
                  colon={true}>
                  {getFieldDecorator('itemTypeName', {
                    rules:[
                      {required:true,message:formatMessage({id:"common.please.select"})},/* {/!*请输入*!/}*/
                    ],
                  })(
                    <Select
                      labelInValue
                      onFocus={this.handleFocus}
                      placeholder={formatMessage({id:"common.please.select"})} />) /*请输入*/
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.itemDescription"}) /*预算项目描述*/}
                  colon={true}>
                  {getFieldDecorator('description', {
                    rules:[
                    ]
                  })(
                    <Input placeholder={formatMessage({id:"common.please.enter"})}
                    />)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"common.status"},{status:statusCode})} /* {/!*状态*!/}*/
                  colon={false}>
                  {getFieldDecorator("enabled", {
                    initialValue: true,
                    valuePropName: 'checked',
                    rules:[
                      {
                        validator: (item,value,callback)=>{
                          this.setState({
                            statusCode: value ? formatMessage({id:"common.status.enable"}) /*启用*/
                              : formatMessage({id:"common.disabled"}) /*禁用*/
                          })
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
            <Button type="primary" loading={loading} htmlType="submit">{formatMessage({id:"common.save"}) /*保存*/}</Button>
            <Button  onClick={this.handleCancel} style={{ marginLeft: 8 }}> {formatMessage({id:"common.cancel"}) /*取消*/}</Button>
            <input ref="blur" style={{ position: 'absolute', top: '-100vh' }}/> {/* 隐藏的input标签，用来取消list控件的focus事件  */}
          </Form>
        </div>
        <ListSelector
          single={true}
          visible={showItemType}
          type="budget_item_type"
          onCancel={()=>this.showList(false)}
          onOk={this.handleListOk}
          selectedData={listSelectedData}
          extraParams={{organizationId: this.props.params.id,enabled: true}}/>
      </div>
    )
  }
}
NewBudgetItem.contextTypes = {
  router: React.PropTypes.object
};
function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}
const WrappedNewBudgetItem = Form.create()(NewBudgetItem);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetItem);
