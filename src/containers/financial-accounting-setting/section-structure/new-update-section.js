/**
 * created by jsq on 2017/12/25
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
} from 'antd';
import 'styles/financial-accounting-setting/section-structure/new-update-section.scss';
import Chooser from 'widget/chooser';
import accountingService from 'containers/financial-accounting-setting/section-structure/section-structure.service';

const FormItem = Form.Item;
const Option = Select.Option;

class NewUpdateSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      enabled: true,
      firstRender: true,
      setOfBook: [],
      section: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    let params = Object.assign({}, nextProps.params);
    if (JSON.stringify(params) == '{}') {
      this.props.form.resetFields();
      this.setState({
        firstRender: true,
      });
    } //编辑
    else if (typeof params.segmentSetId === 'undefined') {
      if (this.state.firstRender) {
        this.props.form.setFieldsValue({
          segmentField: [{ code: nextProps.params.record.segmentField }],
        });
        this.setState({
          section: params.record,
          enabled: params.record.enabled,
          firstRender: false,
        });
      }
    } else {
      //新建
      if (this.state.firstRender) {
        let section = {
          segmentSetId: nextProps.params.segmentSetId,
        };
        this.setState({
          section,
          enabled: true,
          firstRender: false,
        });
      }
    }
  }

  handleNotification = () => {
    notification.close('section');
  };

  handleSubmit = e => {
    e.preventDefault();
    this.setState({
      loading: true,
    });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.segmentSetId = this.state.section.segmentSetId;
        values.segmentField = values.segmentField[0].code;
        let method = null;
        if (typeof this.state.section.id === 'undefined') {
          method = accountingService.addSectionSetting(values);
        } else {
          values.id = this.state.section.id;
          values.versionNumber = this.state.section.versionNumber;
          method = accountingService.updateSectionSetting(values);
        }
        method
          .then(response => {
            this.setState({
              loading: false,
            });
            if (typeof this.state.section.id === 'undefined')
              message.success(`${this.$t({ id: 'common.save.success' }, { name: '' })}`);
            else message.success(`${this.$t({ id: 'common.operate.success' })}`);
            this.props.form.resetFields();
            this.props.onClose(true);
          })
          .catch(e => {
            if (e.response) {
              if (typeof this.state.section.id === 'undefined') {
                message.error(
                  `${this.$t({ id: 'common.save.filed' })}, ${
                    !!e.response.data.message ? e.response.data.message : e.response.data.errorCode
                  }`
                );
                this.setState({ loading: false });
              } else {
                message.error(
                  `${this.$t({ id: 'common.operate.filed' })}, ${
                    !!e.response.data.message ? e.response.data.message : e.response.data.errorCode
                  }`
                );
                this.setState({ loading: false });
              }
            }
          });
      }
    });
  };

  onCancel = () => {
    this.props.form.resetFields();
    this.setState({ enabled: false, loading: false });
    this.props.onClose(false);
  };

  switchChange = () => {
    this.setState(prevState => ({
      enabled: !prevState.enabled,
    }));
  };

  handleSelect = value => {
    if (value && value.length && typeof value[0].key !== 'undefined') {
      let section = this.state.section;
      section.segmentField = value[0].code;
      section.segmentFieldName = value[0].description;
      this.setState({ section });
    }
    if (value && value.length === 0) {
      let section = this.state.section;
      section.segmentFieldName = '-';
      this.setState({ section });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, section, setOfBook, enabled } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-update-section">
        <Form onSubmit={this.handleSubmit} className="new-update-section-form">
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'section.code' }) /*科目段代码*/}>
                {getFieldDecorator('segmentCode', {
                  initialValue: section.segmentCode,
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.enter' }),
                    },
                  ],
                })(
                  <Input
                    disabled={typeof section.id === 'undefined' ? false : true}
                    className="input-disabled-color"
                    placeholder={this.$t({ id: 'common.please.enter' })}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'section.name' }) /*科目段名称*/}>
                {getFieldDecorator('segmentName', {
                  initialValue: section.segmentName,
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.enter' }),
                    },
                  ],
                })(
                  <Input
                    className="input-disabled-color"
                    placeholder={this.$t({ id: 'common.please.enter' })}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem {...formItemLayout} label={this.$t({ id: 'section.field' }) /*科目段字段*/}>
                {getFieldDecorator('segmentField', {
                  rules: [
                    {
                      required: true,
                      message: this.$t({ id: 'common.please.select' }),
                    },
                  ],
                })(
                  <Chooser
                    placeholder={this.$t({ id: 'common.please.select' })}
                    type="section"
                    single={true}
                    labelKey="code"
                    valueKey="code"
                    listExtraParams={{ segmentSetId: this.state.section.segmentSetId }}
                    onChange={this.handleSelect}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={30}>
            <Col span={20}>
              <FormItem
                {...formItemLayout}
                label={this.$t({ id: 'section.field.name' }) /*科目段字段名称*/}
              >
                {getFieldDecorator('segmentFieldName')(
                  <label>
                    {typeof section.segmentFieldName === 'undefined' ||
                    section.segmentFieldName === ''
                      ? '-'
                      : section.segmentFieldName}
                  </label>
                )}
              </FormItem>
            </Col>
          </Row>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14, offset: 1 }}
            label={this.$t({ id: 'common.column.status' })}
            colon={true}
          >
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
              initialValue: enabled,
            })(
              <div>
                <Switch
                  checked={enabled}
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="cross" />}
                  onChange={this.switchChange}
                />
                <span className="enabled-type" style={{ marginLeft: 20, width: 100 }}>
                  {enabled
                    ? this.$t({ id: 'common.status.enable' })
                    : this.$t({ id: 'common.disabled' })}
                </span>
              </div>
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

const WrappedNewUpdateSection = Form.create()(NewUpdateSection);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewUpdateSection);
