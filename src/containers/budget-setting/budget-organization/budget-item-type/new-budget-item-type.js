/**
 * Created by 13576 on 2017/9/21.
 */
import React from 'react';
import {connect} from 'dva';
import {Button,Form,Switch, Input,message, Icon} from 'antd';
const FormItem = Form.Item;
import budgetItemTypeService from 'containers/budget-setting/budget-organization/budget-item-type/budget-item-type.service'
import 'styles/budget-setting/budget-organization/buget-item-type/budget-item-type.scss'


class NewBudgetItemType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      enabled: true,
      isPut: false,
      loading: false,

    };
  }


  //新建
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        let toValue = {
          'enabled': values.enabled,
          'itemTypeName': values.itemTypeName,
          'itemTypeCode': values.itemTypeCode,
          'organizationId': this.props.organization.id
        }
        budgetItemTypeService.addItemType(toValue).then((res) => {
          this.setState({loading: false});
          this.props.form.resetFields();
          this.props.onClose(true);
          message.success(this.$t({id: "common.create.success"}, {name: `${this.$t({id: "budgetItemType.itemType"})}`}));
        }).catch((e) => {
          this.setState({loading: false});
          message.error(this.$t({id: "common.save.filed"}) +
            `, ${e.response.data.validationErrors ? e.response.data.validationErrors[0].message : e.response.data.message}`);
        })
      }
    });
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {params, enabled, isPut} = this.state;
    const formItemLayout = {
      labelCol: {span: 6, offset: 1},
      wrapperCol: {span: 14, offset: 1},
    };
    return (


      <div className="new-value">
        <Form onSubmit={this.handleSave}>
          {
            this.props.params.flag&&
            <FormItem {...formItemLayout}
                      label={this.$t({id: "common.column.status"})}>
              {getFieldDecorator('enabled', {
                valuePropName: "defaultChecked",
                initialValue: enabled
              })(
                <div>
                  <Switch defaultChecked={enabled} checkedChildren={<Icon type="check"/>}
                          unCheckedChildren={<Icon type="cross"/>} onChange={this.switchChange}/>
                  <span className="enabled-type" style={{
                    marginLeft: 20,
                    width: 100
                  }}>{ enabled ? this.$t({id: "common.enabled"}) : this.$t({id: "common.disabled"}) }</span>
                </div>
              )}
            </FormItem>
          }
          <FormItem {...formItemLayout} label={this.$t({id: "budget.organization"})}>
            {getFieldDecorator('organizationName', {
              rules: [{}],
              initialValue: this.props.organization.organizationName

            })(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budgetItemType.itemTypeCode"})}>
            {getFieldDecorator('itemTypeCode', {
              rules: [{
                required: true,
                message: this.$t({id: "common.please.enter"})
              }],
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({id: "budgetItemType.itemTypeName"})}>
            {getFieldDecorator('itemTypeName', {
              rules: [{
                required: true,
                message: this.$t({id: "common.please.enter"})
              }],
            })(
              <Input placeholder={this.$t({id: "common.please.enter"})}/>
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit"
                    loading={this.state.loading}>{this.$t({id: "common.save"})}</Button>
            <Button onClick={this.onCancel}>{this.$t({id: "common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}


const WrappedNewBudgetItemType = Form.create()(NewBudgetItemType);
function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBudgetItemType);
