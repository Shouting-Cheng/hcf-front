/**
 * Created by 13576 on 2018/1/14.
 */
import React from 'react';
import { connect } from 'dva';
import {
  Button,
  Input,
  Switch,
  Select,
  Form,
  Icon,
  notification,
  Alert,
  Row,
  Col,
  message,
  InputNumber,
} from 'antd';
import baseService from 'share/base.service';
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service';
import 'styles/financial-accounting-setting/accounting-source/new-update-voucher-template.scss';
import Chooser from 'widget/chooser';
const { Option, OptGroup } = Select;
const FormItem = Form.Item;

class NewUpDataLineModeJudgeRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      setOfBook: [],
      scenariosOption: [],
      journalFieldOption: [],
      andOrOption: [],
      judgeRuleOption: [],
      section: {},
      isNew: true,
      record: {},
      elementNature: '',
      accountElementCode: [],
    };
  }

  componentDidMount() {
    this.getSystemList();
    if (JSON.stringify(this.props.params) !== '{}' && this.props.params) {
      if (this.props.params.isNew === false) {
        this.setState(
          {
            isNew: false,
            enabled: this.props.params.record.enabled,
            record: this.props.params.record,
          },
          () => {}
        );
      } else if (this.props.params.isNew === true) {
        this.setState(
          {
            isNew: true,
            enabled: true,
          },
          () => {}
        );
      }
    }
  }

  //获取，和判断条件（judgeRule）
  getSystemList() {
    //判断规则
    baseService.getSystemValueList({ type: 2212 }).then(res => {
      let judgeRuleOption = [];
      if (res.data) {
        judgeRuleOption = res.data;
      }
      this.setState({
        judgeRuleOption,
      });
    });
  }

  handleSubmit = e => {
    let { isNew, record } = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        if (isNew) {
          let data = {
            ...values,
            accountElementCode: values.accountElementCode[0].code,
            sourceTransactionId: this.props.params.sourceTransactionId,
            sobJournalLineModelId: this.props.params.lineModelId,
          };
          accountingService
            .addSourceLineModelJudgeRules(data)
            .then(res => {
              message.success(this.$t({ id: 'common.operate.success' }));
              this.setState({ loading: false });
              this.props.onClose(true);
              this.props.form.resetFields;
            })
            .catch(e => {
              this.setState({ loading: false });
              e.response && message.error(e.response.data.message);
            });
        } else if (isNew === false) {
          let data = {
            ...values,
            accountElementCode: values.accountElementCode[0].code,
            sourceTransactionId: this.props.params.sourceTransactionId,
            sobJournalLineModelId: this.props.params.lineModelId,
            leftBracket: values.leftBracket ? values.leftBracket : '',
            rightBracket: values.rightBracket ? values.rightBracket : '',
            versionNumber: record.versionNumber,
            id: record.id,
          };
          accountingService
            .upSourceLineModelJudgeRules(data)
            .then(res => {
              message.success(this.$t({ id: 'common.operate.success' }));
              this.setState({ loading: false });
              this.props.onClose(true);
              this.props.form.resetFields;
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(e.response.data.message);
            });
        }
      }
    });
  };

  onCancel = () => {
    this.props.form.resetFields;
    this.props.onClose(false);
  };

  switchChange = () => {
    this.setState(prevState => ({
      enabled: !prevState.enabled,
    }));
  };

  //选择核素要素
  handleAccountingChange = value => {
    console.log(value);
    if (value && value.length > 0 && JSON.stringify(value) != '[]') {
      this.setState({
        elementNature: value[0].description,
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { judgeRuleOption, record, isNew, elementNature } = this.state;
    let { accountElementCode } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    if (!isNew) {
      accountElementCode = [
        {
          description: record.elementNature,
          code: record.accountElementCode,
          key: record.accountElementCode,
        },
      ];
    }
    return (
      <div className="new-update-voucher-template">
        <Form onSubmit={this.handleSubmit} className="voucher-template-form">
          <FormItem {...formItemLayout} label={this.$t({ id: 'accounting.source.sequence' })}>
            {/*优先级*/}
            {getFieldDecorator('sequence', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }),
                },
              ],
              initialValue: isNew ? '' : record.sequence,
            })(<InputNumber style={{ with: '200px' }} disabled={!isNew} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'accounting.source.andOr' })}>
            {/*逻辑操作*/}
            {getFieldDecorator('andOr', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' }),
                },
              ],
              initialValue: isNew ? '' : record.andOr,
            })(
              <Select
                className="input-disabled-color"
                placeholder={this.$t({ id: 'common.please.select' })}
              >
                <Option key={'AND'}>{'AND'}</Option>
                <Option key={'OR'}>{'OR'}</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'accounting.source.leftBracket' })}>
            {/*左括号*/}
            {getFieldDecorator('leftBracket', {
              initialValue: isNew ? '' : record.leftBracket,
            })(
              <Select
                className="input-disabled-color"
                placeholder={this.$t({ id: 'common.please.select' })}
                allowClear={true}
              >
                {<Option key={'('}>{'('}</Option>}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'accounting.source.accountElementCode' })}
          >
            {/*核算要素*/}
            {getFieldDecorator('accountElementCode', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' }),
                },
              ],
              initialValue: accountElementCode,
            })(
              <Chooser
                placeholder={this.$t({ id: 'common.please.select' })}
                type="accounting_scene_elements"
                single={true}
                labelKey="code"
                valueKey="code"
                listExtraParams={{
                  transactionSceneId: this.props.params.glSceneId
                    ? this.props.params.glSceneId
                    : null,
                  displayAll: true,
                  enabled: true,
                }}
                onChange={this.handleAccountingChange}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'accounting.source.elementNature' })}>
            {/*要素性质*/}
            {getFieldDecorator('elementNature', {
              initialValue: isNew ? elementNature : record.elementNature,
            })(<Input disabled={true} />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'accounting.source.judgeRuleName' })}>
            {/*判断条件*/}
            {getFieldDecorator('judgeRule', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' }),
                },
              ],
              initialValue: isNew ? '' : record.judgeRule,
            })(
              <Select
                className="input-disabled-color"
                placeholder={this.$t({ id: 'common.please.select' })}
              >
                {judgeRuleOption.map(item => <Option key={item.value}>{item.messageKey}</Option>)}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'accounting.source.data' })}>
            {/*值*/}
            {getFieldDecorator('judgeData', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' }),
                },
              ],
              initialValue: isNew ? '' : record.judgeData,
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'accounting.source.rightBracket' })}>
            {/*右括号*/}
            {getFieldDecorator('rightBracket', {
              initialValue: isNew ? '' : record.rightBracket,
            })(
              <Select
                className="input-disabled-color"
                placeholder={this.$t({ id: 'common.please.select' })}
                allowClear={true}
              >
                {<Option key={')'}>{')'}</Option>}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'common.column.status' })}
            colon={true}
          >
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: isNew ? true : record.enabled,
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
                onChange={this.switchChange}
              />
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>
              {this.$t({ id: 'common.save' })}
            </Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

const WrappedNewUpDataLineModeJudgeRules = Form.create()(NewUpDataLineModeJudgeRules);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewUpDataLineModeJudgeRules);
