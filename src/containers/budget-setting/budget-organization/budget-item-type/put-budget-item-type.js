/**
 * Created by 13576 on 2017/9/22.
 */
import React from 'react'
import {connect} from 'react-redux'
import {formatMessage} from 'share/common'
import {Button,Form,Switch,Input,message,Icon}from 'antd'
const FormItem = Form.Item;

import config from 'config'
import httpFetch from 'share/httpFetch'
import budgetItemTypeService from 'containers/budget-setting/budget-organization/budget-item-type/budget-item-type.service'


import 'styles/budget-setting/budget-organization/buget-item-type/budget-item-type.scss'

class PutBudgetItemType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
      enabled: true,
      loading: false,

    };
  }

  //获取数据
  componentWillMount() {
    this.setState({
      params: this.props.params,
      enabled: this.props.params.enabled,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.flag && !this.props.params.flag) {
      this.setState({
        params: this.props.params,
        enabled: this.props.params.enabled,
      })
    }
  }


//修改
  handlePut = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({loading: true});
        const data = {
          ...this.props.params,
          'enabled': this.state.enabled,
          'itemTypeName': values.itemTypeName,
        }
        budgetItemTypeService.updateItemType(data).then((res) => {
          this.setState({loading: false});
          this.props.close(true);
          message.success(  formatMessage({id: "common.operate.success"}));
        }).catch((e) => {
          this.setState({loading: false});
          message.error(e.response.data.message);
        })
      }
    });
  };


  onCancel = () => {
    this.props.form.resetFields();
    this.props.close();
  };

  switchChange = () => {
    this.setState((prevState) => ({
      enabled: !prevState.enabled
    }))
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {params, enabled} = this.state;
    const formItemLayout = {
      labelCol: {span: 6, offset: 1},
      wrapperCol: {span: 14, offset: 1},
    };
    return (
      <div className="new-value">
        <Form onSubmit={this.handlePut}>
          {this.props.params.flag&&
          <FormItem {...formItemLayout}
                    label={formatMessage({id: "budgetItemType.enabled"})}>
            {getFieldDecorator('enabled', {})(
              <div>
                <Switch defaultChecked={params.enabled} checkedChildren={<Icon type="check"/>}
                        unCheckedChildren={<Icon type="cross"/>} onChange={this.switchChange}/>
                <span className="enabled-type" style={{
                  marginLeft: 20,
                  width: 100
                }}>{ enabled ? formatMessage({id: "common.enabled"}) : formatMessage({id: "common.disabled"}) }</span>
              </div>
            )}
          </FormItem>
          }
          <FormItem {...formItemLayout} label={formatMessage({id: "budget.organization"})}>
            {getFieldDecorator('organizationName', {
              initialValue: this.props.organization.organizationName

            })(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "budgetItemType.itemTypeCode"})}>
            {getFieldDecorator('itemTypeCode', {
              rules: [{
                required: true
              }],
              initialValue: this.props.params.itemTypeCode
            })(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: "budgetItemType.itemTypeName"})}>
            {getFieldDecorator('itemTypeName', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }],
              initialValue: this.props.params.itemTypeName
            })(
              <Input placeholder={formatMessage({id: "common.please.enter"})}/>
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit"
                    loading={this.state.loading}>{formatMessage({id: "common.save"})}</Button>
            <Button onClick={this.onCancel}>{formatMessage({id: "common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

const WrappedPutBudgetItemType = Form.create()(PutBudgetItemType);
function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedPutBudgetItemType);
