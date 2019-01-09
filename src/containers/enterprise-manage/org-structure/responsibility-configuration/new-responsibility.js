import React, { Component } from 'react';
import { Form, Button, message, Select, Radio } from 'antd';
import 'styles/setting/params-setting/params-setting.scss';
import Service from './responsibility-service';
import Chooser from 'components/Widget/chooser';
import { connect } from 'dva';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

class Responsibility extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      allResponsibilityCenter: Number(props.params.allResponsibilityCenter) ? 'N' : 'Y',
      responsibilityCenterId: '1081475244784463873',
      setOfBooksId: props.params.setOfBooksId,
    };
  }

  // 生命周期
  componentDidMount() {
    console.log(this.props)
  }

  //提交
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values)
        this.setState({ saveLoading: true });
        let params = {
          id: this.props.params ? this.props.params.id : '',
          tenantId: this.props.company.tenantId,
          setOfBooksId: values.setOfBooksId,
          departmentId: this.props.departmentId,
          companyId: values.companyId ? values.companyId[0].id : '',
          defaultResponsibilityCenter: values.defaultResponsibilityCenter ? values.defaultResponsibilityCenter[0].id : '',
          allResponsibilityCenter: this.state.allResponsibilityCenter,
          ids: values.ids ? values.ids.map(item => item.id) : [],
        };
        console.log(params);
        Service.addResponsibility(params)
          .then(res => {
            this.setState({ saveLoading: false });
            this.props.close(true);
            message.success('配置责任中心保存成功！');
          })
          .catch(e => {
            message.error(e.response.data.message);
          });
      }
    });
  };

  //取消
  handleCancel = () => {
    this.props.close && this.props.close();
  };

  // 切换默认责任中心全选或部分
  onDimensionChange = e => {
    this.setState({
      allResponsibilityCenter: e.target.value
    });
  };

  //选择公司模态框点击确定
  onCompanyOk = value => {
    console.log(value)
  };

  // 选择默认责任中心模态框点击确定
  onDefaultOk = value => {
    console.log(value)
  };

  // 选择可用责任中心模态框点击确定
  onUsableOk = value => {
    // if (value.length === 0) {
    //   message.warn(this.$t('common.select.one.more'));
    //   return;
    // }
    console.log(value)
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { params, allSetBooks,company } = this.props;
    const {
      saveLoading,
      allResponsibilityCenter,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 12 },
    };
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label={'账套' /** 账套*/}>
            {getFieldDecorator('setOfBooksId', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: params.id ? params.setOfBooksId : company.setOfBooksId,
            })(
              <Select>
                {allSetBooks.map((item, index) => (
                  <Option key={index} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="公司" hasFeedback>
            {getFieldDecorator('companyId', {
              rules: [
                {
                  required: false,
                  message: '请选择',
                },
              ],
              initialValue: params.id ? [{ id: params.companyId, name: params.companyName }] : '',
            })(
              <Chooser
                type="responsibility_company"
                labelKey="name"
                valueKey="id"
                onChange={value => this.onCompanyOk(value)}
                single={true}
                listExtraParams={{ responsibilityCenterId: '1081475244784463873' }}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="默认责任中心">
            {getFieldDecorator('defaultResponsibilityCenter', {
              rules: [
                {
                  required: false,
                  message: '请输入',
                },
              ],
              initialValue: params.id ? [{ id: params.defaultResponsibilityCenter,responsibilityCenterName: params.defaultResponsibilityCenterName  }] : '',
            })(
              <Chooser
                type="responsibility_default"
                labelKey="responsibilityCenterName"
                valueKey="id"
                onChange={value => this.onDefaultOk(value)}
                single={true}
                listExtraParams={{ setOfBooksId: this.props.form.getFieldValue('setOfBooksId') }}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="可用责任中心">
            <RadioGroup
              value={allResponsibilityCenter}
              onChange={this.onDimensionChange}
            >
              <Radio value="Y">全部</Radio>
              <Radio value="N">部分</Radio>
            </RadioGroup>
            {getFieldDecorator('ids', {
              rules: [
                {
                  required: false,
                  message: '请输入',
                },
              ],
              initialValue: params.id ? params.length : '',
            })(
              <Chooser
                disabled={allResponsibilityCenter === 'Y' ? true : false}
                type="responsibility_usable"
                labelKey="responsibilityCenterName"
                valueKey="id"
                showNumber={true}
                onChange={value => this.onUsableOk(value)}
                single={false}
                listExtraParams={{ setOfBooksId: this.props.form.getFieldValue('setOfBooksId') }}
              />
            )}
          </FormItem>
          <div className="slide-footer">
            <Button className="btn" type="primary" htmlType="submit" loading={saveLoading}>
              {this.$t('common.save')}
            </Button>
            <Button className="btn" onClick={this.handleCancel}>
              {this.$t('common.cancel')}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}


const WrappedResponsibility = Form.create()(Responsibility);

function mapStateToProps(state) {
  return {
    company: state.user.company
  }
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedResponsibility);
