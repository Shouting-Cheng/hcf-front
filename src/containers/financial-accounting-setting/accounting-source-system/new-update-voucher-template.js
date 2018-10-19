/**
 * created by jsq on 2017/12/27
 */
import React from 'react'
import {connect} from 'react-redux'
import {Button, Input, Switch, Select, Form, Icon, notification, Alert, Row, Col, message} from 'antd'
import accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import 'styles/financial-accounting-setting/accounting-source-system/new-update-voucher-template.scss'
import Chooser from 'components/chooser'
import {formatMessage} from 'share/common'

const FormItem = Form.Item;
const Option = Select.Option;

class NewUpdateSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      setOfBook: [],
      scenariosOption: [],
      section: {},
      isNew: false,
      record: {}
    }
  }

  componentWillMount() {
    this.getGlScene();
    if (this.props.params && this.props.params.time) {
      if (this.props.params.isNew == true) {
        this.setState({isNew: true, record: {}}, () => {
        })
      } else if (this.props.params.isNew == false) {
        let data = this.props.params.record;
        this.setState({isNew: false, record: data}, () => {
        })
      }
    }
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.time && nextProps.params.time != this.props.params.time) {
      this.props.form.resetFields();
      if (nextProps.params.isNew == true) {
        this.props.form.setFieldsValue({basicSourceDate:[]});
        this.setState({isNew: true, record: {}}, () => {
        })
      } else if (nextProps.params.isNew == false) {
        let data = nextProps.params.record;
        this.setState({isNew: false, record: data}, () => {
        })
      }
    }
  }

  //获取核算场景
  getGlScene() {
    accountingService.getGlScene({enabled:true}).then((res) => {
      this.setState({
        scenariosOption: res.data
      })
    }).catch((e) => {
      message.error(e.response.data.message)
    })

  }

  handleNotification = () => {
    notification.close('section')
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {isNew, record} = this.state
    this.setState({
      loading: true,
    });
    this.props.form.validateFieldsAndScroll((err, values) => {

      if (!err) {
        if (isNew) {
          let data = {
            ...values,
            basicSourceDate: values.basicSourceDate[0].code,
            sourceTransactionId: this.props.params.sourceTransactionId
          }
          accountingService.addSourceTransactionModel(data).then((res) => {
            message.success(formatMessage({id: "common.operate.success"}));
            this.setState({loading: false});
            this.props.form.resetFields();
            this.props.close(true);
          }).catch((e) => {
            this.setState({loading: false});
            message.error(e.response.data.message);
          })
        } else {
          //编辑
          let data = {
            id: record.id,
            versionNumber: record.versionNumber,
            ...values,
            basicSourceDate: values.basicSourceDate[0].code,
          }

          data.glSceneId = data.glSceneId?data.glSceneId:"";

          delete data["journalLineModelCode"];
          accountingService.upSourceTransactionModel(data).then((res) => {
            message.success(formatMessage({id: "common.operate.success"}));
            this.props.form.resetFields();
            this.setState({loading: false});
            this.props.close(true);
          }).catch((e) => {
            this.setState({loading: false});
            message.error(e.response.data.message);
          })

        }
      }else {
        this.setState({loading: false});
      }
    })
  };

  onCancel = () => {
    this.props.close(false)
  };

  renderMessage() {
    return (
      <ul>
        <li className="header-tips-li"><span
          className="header-tips-content">{formatMessage({id: "voucher.template.tips2"})}</span></li>
      </ul>)
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {loading, section, isNew, scenariosOption, enabled, record} = this.state;
    let basicSourceDate = [];
    if (!isNew) {
      record.basicSourceDate&&(basicSourceDate = [{
        code: record.basicSourceDate,
        description: record.basicSourceDateDes,
        key: record.basicSourceDate
      }])
    }

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14, offset: 1},
    };

    return (
      <div className="new-update-voucher-template">
        {isNew?(  <Alert message={this.renderMessage()} type="warning"/>):""}
        <Form onSubmit={this.handleSubmit} className="voucher-template-form">
          <FormItem {...formItemLayout} label={formatMessage({id: 'voucher.template.code'})  /*凭证模板行代码*/}>
            {getFieldDecorator('journalLineModelCode', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }],
              initialValue: isNew ? "" : record.journalLineModelCode,
            })(
              <Input className="input-disabled-color" placeholder={ formatMessage({id: "common.please.enter"})}
                     disabled={!this.props.params.isNew}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: 'voucher.template.name'})  /*凭证模板行名称*/}>
            {getFieldDecorator('description', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.enter"})
              }],
              initialValue: isNew ? "" : record.description,
            })(
              <Input className="input-disabled-color" placeholder={ formatMessage({id: "common.please.enter"})}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={"核算场景"} disabled={!this.props.params.isNew}>
            {getFieldDecorator('glSceneId', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.select"})
              }],
              initialValue: isNew ? "" : record.glSceneId,
            })(
              <Select className="input-disabled-color" placeholder={ formatMessage({id: "common.please.select"})}>
                {
                  scenariosOption.map((item) => <Option
                    key={item.id}>{item.glSceneName + " - " + item.glSceneCode}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={formatMessage({id: 'basic.data.sheet'})  /*基础数据表*/}>
            {getFieldDecorator('basicSourceDate', {
              rules: [{
                required: true,
                message: formatMessage({id: "common.please.select"})
              }],
              initialValue: basicSourceDate,
            })(
              <Chooser
                placeholder={formatMessage({id: "common.please.select"})}
                type="source_transactions_data"
                single={true}
                labelKey="description"
                valueKey="code"
                listExtraParams={{"sourceTransactionType": this.props.params.sourceTransactionCode}}
                onChange={() => {
                }}/>
            )}
          </FormItem>
          <FormItem {...formItemLayout}
                    label={formatMessage({id: "common.column.status"})} colon={true}>
            {getFieldDecorator('enabled', {
              valuePropName: "checked",
              initialValue: isNew ? true : record.enabled
            })(
              <Switch checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="cross"/>}/>
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{formatMessage({id: "common.save"})}</Button>
            <Button onClick={this.onCancel}>{formatMessage({id: "common.cancel"})}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.login.company,
  }
}

const WrappedNewUpdateSection = Form.create()(NewUpdateSection);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewUpdateSection);
