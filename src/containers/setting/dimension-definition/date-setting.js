import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, message, Select, Switch, Icon } from 'antd';
import 'styles/setting/params-setting/params-setting.scss';
const FormItem = Form.Item;

import service from './dimension-definition.service';

class NewBuilt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      paramsTypeList: [],
      dimensionNameList: [],
      s: true,
      scenarios: {},
      section: {},
    };
  }
  // 生命周期
  componentDidMount() {
    this.getNumber();
  }
  // 获取序号
  getNumber = ()=>{
    let set = this.props.company.setOfBooksId;
    console.log(set,'set');
    service.NumberDimensionSetting(set).then ((res)=>{
      console.log(res,'009090');
      this.setState({
        paramsTypeList:res.data,

      });
    }).catch()
  }


  //保存&&编辑
  handleSubmit = () => {
    let { params } = this.props;

    this.props.form.validateFields((err, values, record) => {
      let data = Object.assign({}, params, values);
      if (err) return;
      this.setState({
        saveLoading: true,
      });

      if (!params.id) {
        service
          .addDimensionSetting(values)
          .then(res => {
            message.success('新增成功！');
            this.setState({ saveLoading: false });
            this.props.close && this.props.close(true);
          })
          .catch(err => {
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      } else {
        console.log(data);
        service
          .editDimensionSetting(data)
          .then(res => {
            console.log(data);
            message.success('编辑成功！');
            this.setState({ saveLoading: false });
            this.props.close && this.props.close(true);
          })
          .catch(err => {
            console.log(err)
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      }
    });
  };
  hasErrors(fieldsError) {
    const { isFieldTouched } = this.props.form;
  }
  //取消
  handleCancel = () => {
    this.props.close && this.props.close();
  };
  // 状态开关
  onChange = checked => {
    console.log(checked, '---------------');
    this.setState({
      s: checked,
    });
  };

  render() {
    const { getFieldDecorator, getFieldsError } = this.props.form;
    const { params } = this.props;
    console.log(params,'787878');
    const { saveLoading, paramsTypeList, section } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 12,
      },
    };
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
        <h3>基本信息</h3>
          <FormItem {...formItemLayout} label={'账套' /** 账套*/}>
            {getFieldDecorator('setOfBooksId', {
              // initialValue:,
              rules: [
                {
                  required: true,

                },
              ],
              initialValue:this.props.company.setOfBooksId || '',
            })(
              <Input disabled placeholder={this.$t({setOfBooksId:'1' })} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="序号" hasFeedback>
            {getFieldDecorator('dimensionSequence', {
              rules: [
                {
                  required:true,
                  message: '请选择',
                },
              ],
              initialValue: params.dimensionSequence || '',
            })(
              <Select placeholder="请选择" disabled={JSON.stringify(params) === '{}' ? false : true}>
                {paramsTypeList.map((item,index) => {
                  return (
                    <Select.Option key={index} value={item} >
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="维度代码">
            {getFieldDecorator('dimensionCode', {
              rules: [
                {
                  required: true,
                  message: '请输入',

                },
              ],
              initialValue: this.props.params.dimensionCode || '',
            })(<Input placeholder="请选择"  disabled={JSON.stringify(params) === '{}' ? false : true}/>)}
          </FormItem>
          <FormItem {...formItemLayout} label="维度名称">
            {getFieldDecorator('dimensionName', {
              rules: [],
              initialValue: params.dimensionName || '',
            })(
                <Input key={1} name={params.dimensionName} placeholder={this.$t('common.please.enter') /* 请输入 */}/>

            )}
          </FormItem>
          <FormItem {...formItemLayout} label="状态">
            {getFieldDecorator('enabled',{
                initialValue: params.enabled,
                valuePropName: 'checked'
            })(

             <Switch />

            )}
            &nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? '启用' : '禁用'}{params.enabled}
          </FormItem>
          <div className="footer-button">
            <Button
              className="btn"
              type="primary"
              htmlType="submit"
              loading={saveLoading}
              disabled={this.hasErrors(getFieldsError())}
            >
              {' '}
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

function mapStateToProps(state) {
  console.log(state);

  return{
    company: state.user.company
  }
}


const WrappedNewBuilt = Form.create()(NewBuilt);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBuilt);

