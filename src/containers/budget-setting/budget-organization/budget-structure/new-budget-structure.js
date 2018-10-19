/**
 *  createc by jsq on 2017/9/19
 */
import React from 'react';
import { Button, Form, Select,Input, Col, Row, Switch, message, Icon} from 'antd';
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import budgetService from 'containers/budget-setting/budget-organization/budget-structure/budget-structure.service'
import 'styles/budget-setting/budget-organization/budget-structure/new-budget-structure.scss';
import menuRoute from 'routes/menuRoute'
import debounce from 'lodash.debounce';

const FormItem = Form.Item;
const Option = Select.Option;

class NewBudgetStructure extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      statusCode: formatMessage({id:"common.enabled"}),  /*启用*/
      organization:{},
      periodStrategy: []  //值列表：编制期段
    };
    this.validateStructureCode = debounce(this.validateStructureCode,1000)
  }

  componentWillMount(){
    //获取编制期段
    this.getSystemValueList(2002).then((response)=>{
      let periodStrategy = [];
      response.data.values.map((item)=>{
        let option = {
          id: item.code,
          value: item.messageKey
        };
        periodStrategy.push(option);
      });
      this.setState({
        periodStrategy: periodStrategy
      })
    });
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

  //新建预算表
  handleSave = (e) =>{
    e.preventDefault();
    this.setState({
      loading: true,
    });

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.organizationId = this.state.organization.id;
        budgetService.addStructure(values).then((response)=>{
          if(response) {
            message.success(formatMessage({id:"structure.saveSuccess"})); /*保存成功！*/
            response.data.organizationName = values.organizationName;
            this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetStructureDetail.url.replace(':id', this.props.params.id).replace(':structureId',response.data.id).replace(":setOfBooksId",this.props.params.setOfBooksId));
            this.setState({loading:false})
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${formatMessage({id:"common.save.filed"})}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  //点击取消，返回预算组织详情
  handleCancel = (e) =>{
    e.preventDefault();
    this.context.router.push(menuRoute.getMenuItemByAttr('budget-organization', 'key').children.budgetOrganizationDetail.url.replace(':id', this.props.params.id).replace(":setOfBooksId",this.props.params.setOfBooksId)+ '?tab=STRUCTURE');
  };

  validateStructureCode = (item,value,callback)=>{
    let params = {
      organizationId: this.props.params.id,
      structureCode: value
    };
    budgetService.getAllStructures(params).then((response)=>{
      let flag = false;
      if(response.data.length > 0 ){
        response.data.map((item)=>{
          if(item.structureCode === value) {
            flag = true;
          }
        })
      }
      flag >0 ? callback(formatMessage({id:"budget.structureCode.exist"})) : callback();

    });
  };

  handleChange = ()=>{
    if(this.state.loading){
      this.setState({
        loading: false
      })
    }
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { statusCode, organization, loading, periodStrategy } = this.state;

    const options = periodStrategy.map((item)=><Option key={item.id}>{item.value}</Option>)
    return(
      <div className="new-budget-structure">
        <div className="budget-structure-header">
          <Form onSubmit={this.handleSave} onChange={this.handleChange}>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.organization"})}  /*{/!*预算组织*!/}*/
                  colon={true}>
                  {getFieldDecorator('organizationName', {
                    initialValue: organization.organizationName,
                    rules:[
                      { required:true }
                    ]
                  })(
                    <Input disabled/>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.structureCode"})} /* {/!*预算表代码*!/}*/
                  colon={true}>
                  {getFieldDecorator('structureCode', {
                    rules:[
                      {required:true,message:formatMessage({id:"common.please.enter"})},
                      {
                        validator:(item,value,callback)=>this.validateStructureCode(item,value,callback)
                      }
                    ]
                  })(
                    <Input placeholder={formatMessage({id:"common.please.enter"})}
                    />)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.structureName"})} /* {/!*预算表名称*!/}*/
                  colon={true}>
                  {getFieldDecorator('structureName', {
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
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.periodStrategy"})}  /*{/!*编制期段*!/}*/
                  colon={true}>
                  {getFieldDecorator('periodStrategy', {
                    rules:[
                      {required:true,message:formatMessage({id:"common.please.enter"})},/* {/!*请输入*!/}*/
                    ],
                  })(
                    <Select placeholder={formatMessage({id:"common.please.select"})}  /* {/!*请选择*!/}*/>
                      {options}
                    </Select>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={formatMessage({id:"budget.structureDescription"})} /* {/!*备注*!/}*/
                  colon={true}>
                  {getFieldDecorator('description')(
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
                            statusCode: value ? formatMessage({id:"common.enabled"}) /*启用*/
                              : formatMessage({id:"common.disabled"}) /*禁用*/
                          })
                          callback();
                        }
                      }
                    ],
                  })
                  (<Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross"/>}/>)
                  }
                </FormItem>
              </Col>
            </Row>
            <Button type="primary" loading={loading} htmlType="submit">{formatMessage({id:"common.save"}) /*保存*/}</Button>
            <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}> {formatMessage({id:"common.cancel"}) /*取消*/}</Button>
          </Form>
        </div>
      </div>
    )
  }
}

NewBudgetStructure.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}



const WrappedNewBudgetStructure = Form.create()(NewBudgetStructure);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetStructure);
