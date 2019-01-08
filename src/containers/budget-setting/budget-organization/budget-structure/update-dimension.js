import React from 'react'
import { connect } from 'dva'
import config from 'config'
import { Form, Input, Switch, Button, Icon, Checkbox, message, Select, InputNumber, Row, Col } from 'antd'

import Chooser from 'widget/chooser'
import budgetService from 'containers/budget-setting/budget-organization/budget-structure/budget-structure.service'
import 'styles/budget-setting/budget-organization/budget-structure/new-dimension.scss'

const FormItem = Form.Item;
const { TextArea } = Input;

class NewDimension extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      enabled: true,
      dimension:{},
      layoutPosition:[],
      extraParams: {},
      loading: false,
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
        url: `${config.baseUrl}/api/dimension/item/page/by/cond`,
        searchForm: [
          {type: 'input', id: 'dimensionItemCode', label: this.$t({id:'structure.dimensionValueCode'})},
          {type: 'input', id: 'dimensionItemName', label: this.$t({id:'structure.dimensionValueName'})},
        ],
        columns: [
          {title: this.$t({id:'structure.dimensionValueCode'}), dataIndex: 'dimensionItemCode'},
          {title: this.$t({id:'structure.dimensionValueName'}), dataIndex: 'dimensionItemName'},
        ],
        key: 'id'
      },

    };
  }

  componentDidMount(){
    let dimension = this.props.params;
    let extraParams = this.state.extraParams;
    let value = {
      dimensionName: dimension.dimensionName,
      defaultDimensionCode:  dimension.defaultDimensionValue.length ?
        [{
          key: dimension.defaultDimensionValue[0].key,
          id: dimension.defaultDimensionValue[0].defaultDimValueId,
          code: dimension.defaultDimensionValue[0].defaultDimValueCode,
          name: dimension.defaultDimValueName
        }]: []
    };
    this.props.form.setFieldsValue(value);
    extraParams = {dimensionId: dimension.dimensionId};
    if(typeof dimension.id !== 'undefined'){
      extraParams = {dimensionId: dimension.dimensionId}
    }
    this.setState({
      enabled: dimension.enabled,
      dimension,
      extraParams,
      defaultDimension: dimension.defaultDimensionValue
    });
    /*//获取布局位置的值列表
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

     })
     });
     */
  }
/*
  componentWillReceiveProps(nextprops){
    if(nextprops.params.flag&&!this.props.params.flag){
      let value = {
        dimensionName: nextprops.params.dimensionName,
        defaultDimensionCode:  nextprops.params.defaultDimensionValue.length ?
          [{
            key: nextprops.params.defaultDimensionValue[0].key,
            id: nextprops.params.defaultDimensionValue[0].defaultDimValueId,
            code: nextprops.params.defaultDimensionValue[0].defaultDimValueCode,
            name: nextprops.params.defaultDimValueName
          }]: []
      };
      this.props.form.setFieldsValue(value);
      let extraParams = this.state.extraParams;
      extraParams = {costCenterId: nextprops.params.dimensionId};
      this.setState({
        enabled: nextprops.params.enabled,
        dimension: nextprops.params,
        extraParams,
        defaultDimension: nextprops.params.defaultDimensionValue
      });

    }
  }
*/

  handleSave = (e) =>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        values.id = this.state.dimension.id;
        values.dimensionId = values.dimensionCode[0].dimensionId;
        if(values.defaultDimensionCode.length>0){
          values.defaultDimValueId =values.defaultDimensionCode[0].id;
        }
        values.versionNumber = this.state.dimension.versionNumber;
        budgetService.structureUpdateDimension(values).then(res=>{
          this.setState({loading: false});
          if(res.status === 200){
            this.props.onClose(true);
            message.success(this.$t({id:"common.operate.success"}));
          }
        }).catch((e)=>{
          if(e.response){
            message.error(`${this.$t({id:"common.operate.filed"})}, ${e.response.data.message}`);
          }
          this.setState({loading: false});
        })
      }
    });
  };

  onCancel = () =>{
    this.props.form.resetFields();
    this.setState({
      enabled: this.state.dimension.enabled,
      dimension:{}
    });
    this.props.onClose();
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  };

  /**
   * ListSelector确认点击事件，返回的结果包装为form需要的格式
   * @param result
   */
  handleListOk = (result) => {
    let formItem = {};
    let values = [];
    result.result.map(item => {
      values.push({
        key: item[formItem.valueKey],
        label: item[formItem.labelKey],
        value: item
      })
    });
    let value = {};
    value[formItem.id] = values;
    this.props.form.setFieldsValue(value);
    this.setState({ showListSelector: false });
    formItem.handle && formItem.handle();
  };

  handleDimensionCode = (value)=>{
    if(typeof value!=='undefined'){
      if(value.length>0){
        let {dimension} = this.state;
        if (dimension.dimensionId === value[0].dimensionId && dimension.defaultDimValueCode === this.props.form.getFieldValue('defaultDimensionCode')) {
          return;
        }
        this.props.form.setFieldsValue({"dimensionName": value[0].dimensionName||dimension.dimensionName,"defaultDimensionCode": [],"defaultDimValueName":""})
        let extraParams = this.state.extraParams;
        extraParams.dimensionId = value[0].dimensionId;
        this.setState({
          extraParams
        });
      }
    }
  };

  handleDimensionValue = (value)=>{
    if(typeof value!== 'undefined'){
      this.props.form.setFieldsValue({"defaultDimValueName": value.length > 0 ? value[0].dimensionItemName : undefined});
      this.setState({
        defaultDimension:value
      })
    }
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { dimensionSelectorItem, enabled, dimension, layoutPosition ,selectorItem, extraParams} = this.state;
    const options = layoutPosition.map((item)=><Option key={item.id}>{item.value}</Option>);
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-budget-scenarios">
        <Form onSubmit={this.handleSave}>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:"common.column.status"})} colon={true}>
                {getFieldDecorator('enabled', {
                  valuePropName:"checked",
                  initialValue: enabled
                })(
                  <div>
                    <Switch defaultChecked={enabled} disabled={dimension.usedFlag} checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross" />} onChange={this.switchChange}/>
                    <span className="enabled-type" style={{marginLeft:20,width:100}}>{ enabled ? this.$t({id:"common.status.enable"}) : this.$t({id:"common.disabled"}) }</span>
                  </div>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:"structure.dimensionCode"})} colon={true}>
                {getFieldDecorator('dimensionCode', {
                  initialValue: dimension.defaultDimensionCode,
                  rules: [
                    {
                      required: true, message: this.$t({id:"common.please.select"})
                    }
                  ],
                })(
                  <Chooser
                    disabled={dimension.usedFlag}
                    placeholder={ this.$t({id:"common.please.enter"}) }
                    single={true}
                    labelKey="dimensionCode"
                    valueKey="dimensionId"
                    selectorItem={dimensionSelectorItem}
                    listExtraParams={{structureId: this.props.params.id, setOfBooksId: this.props.organization.setOfBooksId}}
                    onChange={this.handleDimensionCode}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:"structure.dimensionName"})} colon={true}>
                {getFieldDecorator('dimensionName', {
                  initialValue: dimension.dimensionName
                })(
                  <Input disabled/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:"structure.layoutPosition"})} colon={true}>
                {getFieldDecorator('layoutPosition', {
                  initialValue: dimension.layoutPosition,
                  rules: [{
                    required: true, message: this.$t({id:"common.please.select"})
                  }],
                })(
                  <Select disabled placeholder={this.$t({id:"common.please.enter"})}>
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:"structure.layoutPriority"})} colon={true}>
                {getFieldDecorator('layoutPriority', {
                  initialValue: dimension.layoutPriority,
                  rules: [
                    {
                      required: true, message: this.$t({id:"common.please.enter"})
                    },{
                      validator:(item,value,callback)=>{
                        callback()
                      }
                    }],
                })(
                  <InputNumber disabled={dimension.usedFlag} placeholder={this.$t({id:"common.please.enter"})}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:"structure.defaultDimValueCode"})} colon={true}>
                {getFieldDecorator('defaultDimensionCode', {
                  initialValue: dimension.defaultDimensionValue && dimension.defaultDimensionValue.length > 0 ? [{
                    key: dimension.defaultDimensionValue[0].key,
                    id: dimension.defaultDimensionValue[0].defaultDimValueId,
                    code: dimension.defaultDimensionValue[0].defaultDimValueCode,
                    name: dimension.defaultDimValueName
                  }] : []
                })(
                  <Chooser
                    placeholder={this.$t({id:"common.please.select"})}
                    single={true}
                    labelKey="dimensionItemCode"
                    valueKey="id"
                    selectorItem={selectorItem}
                    listExtraParams={extraParams}
                    onChange={this.handleDimensionValue}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({id:"structure.defaultDimValueName"})} colon={true}>
                {getFieldDecorator('defaultDimValueName', {
                  initialValue: dimension.defaultDimValueName
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
