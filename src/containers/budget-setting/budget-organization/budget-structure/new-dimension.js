import React from 'react'
import { connect } from 'dva'
import config from 'config'
import { Form, Input, Row, Col, Switch, Button, Icon, Checkbox, Alert, message, Select, InputNumber } from 'antd'
import Chooser from 'widget/chooser'
import budgetService from 'containers/budget-setting/budget-organization/budget-structure/budget-structure.service'
import 'styles/budget-setting/budget-organization/budget-structure/new-dimension.scss'

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;


class NewDimension extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      enabled: true,
      showSelectDimension: false,
      layoutPosition:[], //值列表：布局位置
      extraParams: {},
      loading: false,
      dimensionCode: [],
      defaultDimension: [],
      dimensionValue:{},
      dimensionSelectorItem:{
        title: this.$t({id:"structure.selectDim"}),
        url: `${config.budgetUrl}/api/budget/structure/assign/layouts/queryNotSaveDimension`,
        searchForm: [
          {type: 'input', id: 'dimensionCode', label: this.$t({id:"structure.dimensionCode"})},
          {type: 'input', id: 'dimensionName', label: this.$t({id:"structure.dimensionName"})},
        ],
        columns: [
          {title: this.$t({id:"structure.dimensionCode"}), dataIndex: 'dimensionCode'},
          {title: this.$t({id:"structure.dimensionName"}), dataIndex: 'dimensionName'},
        ],
        key: 'dimensionId'
      },
      selectorItem:{
        title: this.$t({id:'structure.selectDefaultDim'}),
        url: `${config.baseUrl}/api/costcenter/items`,
        searchForm: [
          {type: 'input', id: 'code', label: this.$t({id:'structure.dimensionValueCode'})},
          {type: 'input', id: 'name', label: this.$t({id:'structure.dimensionValueName'})},
        ],
        columns: [
          {title: this.$t({id:'structure.dimensionValueCode'}), dataIndex: 'code'},
          {title: this.$t({id:'structure.dimensionValueName'}), dataIndex: 'name'},
        ],
        key: 'id'
      },
    };
  }

  componentWillMount(){
    //获取布局位置的值列表
    this.getSystemValueList(2003).then((response)=>{
      let layoutPosition = [];
      response.data.values.map((item)=>{
        let option = {
          id: item.code,
          value: item.messageKey
        };
        layoutPosition.push(option);
      });
      this.setState({
        layoutPosition: layoutPosition,
        dimensionCode: []
      })
    });
  }

  handleSave = (e) =>{
    const { defaultDimension} = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.dimensionId = values.dimensionCode[0].dimensionId;
        values.structureId = this.props.params.id;
        if(defaultDimension.length>0){
          values.defaultDimValueId = defaultDimension[0].id;
        }

        budgetService.structureAssignDimension(values).then((res)=>{
          this.setState({loading: false});
          if(res.status == 200){
            this.props.onClose(true);
            this.onCancel();
            message.success(`${this.$t({id:"common.save.success"},{name: ''})}`);
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t({id:"common.save.filed"})}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  onCancel = () =>{
    this.props.form.resetFields();
    this.props.form.setFieldsValue({"dimensionCode":[]});
    this.setState({
      defaultDimension: [],
      dimensionCode: []
    });
    this.props.onClose();
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  handleDimensionCode = (value)=>{
    if(value.length>0){
      this.setState({
        dimensionCode: value,
        dimensionValue:{},
        defaultDimension: []
      });
    }
  };

  handleDimensionValue = (value)=>{
    this.setState({
      defaultDimension:value
    })
  };

  //没有选择维度时，提示
  validateValue = ()=>{
    let dimensionValue = {
      help: this.$t({id:"structure.validateDimension"}),  /*请先选择维度代码*/
      validateStatus: 'warning'
    };
    this.setState({
      dimensionValue
    })
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const {dimensionValue, dimensionSelectorItem, enabled, dimensionCode, defaultDimension, layoutPosition, selectorItem } = this.state;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const options = layoutPosition.map((item)=><Option key={item.id}>{item.value}</Option>);
    return (
      <div className="new-budget-scenarios">
        <Form onSubmit={this.handleSave}>
          <Row gutter={18}>
            <Col span={18}>
              <FormItem {...formItemLayout}
                        label={this.$t({id:"common.column.status"})} colon={true}>
                {getFieldDecorator('enabled', {
                  valuePropName:"defaultChecked",
                  initialValue:enabled
                })(
                  <div>
                    <Switch defaultChecked={enabled}  checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                    <span className="enabled-type" style={{marginLeft:20,width:100}}>{ enabled ? this.$t({id:"common.status.enable"}) : this.$t({id:"common.disabled"}) }</span>
                  </div>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={18}>                                          {/* 维度代码*/}
              <FormItem {...formItemLayout} label={this.$t({id: "structure.dimensionCode"})} colon={true}>
                {getFieldDecorator('dimensionCode', {
                  rules: [{
                    required: true, message: this.$t({id:"common.please.select"})
                  },{
                    validator:(item,value,callback)=>{
                      callback();
                    }
                  }
                  ],
                })(
                  <Chooser
                    placeholder={ this.$t({id:"common.please.enter"}) }
                    type={"select_dimension"}
                    single={true}
                    labelKey="dimensionCode"
                    valueKey="dimensionId"
                    selectorItem={dimensionSelectorItem}
                    listExtraParams={{structureId: this.props.params.id, setOfBooksId: this.props.organization.setOfBooksId}}
                    onChange={this.handleDimensionCode}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={18}>                  {/* 维度名称*/}
              <FormItem {...formItemLayout} label={this.$t({id:"structure.dimensionName"})} colon={true} >
                {getFieldDecorator('dimensionName', {
                  initialValue: dimensionCode.length>0 ? dimensionCode[0].dimensionName : null,
                })(
                  <Input disabled/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={18}>                             {/* 布局位置*/}
              <FormItem {...formItemLayout} label={this.$t({id:"structure.layoutPosition"})} colon={true}>
                {getFieldDecorator('layoutPosition', {
                  initialValue: "DOCUMENTS_LINE",
                  rules: [{
                    required: true, message:this.$t({id:"common.please.select"})
                  }],
                })(
                  <Select disabled  placeholder={this.$t({id:"common.please.select"})}>
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={18}>                        {/* 布局顺序*/}
              <FormItem {...formItemLayout} label={this.$t({id:"structure.layoutPriority"})} colon={true}>
                {getFieldDecorator('layoutPriority', {
                  rules: [
                    {
                      required: true, message: this.$t({id:"common.please.enter"})
                    },
                    {
                      validator:(item,value,callback)=>{
                        callback()
                      }
                    }],
                })(
                  <InputNumber placeholder={this.$t({id:"common.please.enter"})}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={18}>                          {/* 默认维值代码*/}
              <FormItem {...formItemLayout} label={this.$t({id:"structure.defaultDimValueCode"})} colon={true}
                        help={dimensionValue.help}
                        validateStatus={dimensionValue.validateStatus}>
                {getFieldDecorator('defaultDimensionCode', {
                  rules: [
                    {
                      validator:(item,value,callback)=>{
                        callback()
                      }
                    }],
                })(
                  <div>
                    {
                      typeof this.props.form.getFieldValue("dimensionCode") === 'undefined' ?
                        <Input onFocus={this.validateValue} placeholder={this.$t({id:"common.please.select"})}/>
                        :
                        <Chooser
                          placeholder={this.$t({id:"common.please.select"})}
                          type={"select_dimensionValue"}
                          single={true}
                          labelKey="code"
                          valueKey="id"
                          selectorItem={selectorItem}
                          listExtraParams={{costCenterId: dimensionCode.length>0? dimensionCode[0].dimensionId : null}}
                          onChange={this.handleDimensionValue}/>
                    }
                  </div>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={18}>
            <Col span={18}>
             <FormItem {...formItemLayout} label={this.$t({id:'structure.defaultDimValueCode'})} >
              {getFieldDecorator('defaultDimValueCode', {
                initialValue: defaultDimension.length>0 ? defaultDimension[0].name : null
              })(
                <Input disabled/>
              )}
             </FormItem>
            </Col>
          </Row>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit"  loading={this.state.loading}>{this.$t({id:"common.save"})}</Button>
            <Button onClick={this.onCancel}>{this.$t({id:"common.cancel"})}</Button>
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

const WrappedNewDimension = Form.create()(NewDimension);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewDimension);
