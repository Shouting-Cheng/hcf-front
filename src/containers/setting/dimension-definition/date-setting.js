import React, { Component } from 'react';
<<<<<<< HEAD
import { connect } from 'dva';
import { Form, Input, Button, message, Select, Switch, Icon } from 'antd';
=======
import { Form, Input, Button, message, Select, Switch } from 'antd';
>>>>>>> develop
import 'styles/setting/params-setting/params-setting.scss';
import service from './dimension-definition.service';
import baseService from 'share/base.service';


const FormItem = Form.Item;

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
<<<<<<< HEAD

  // 生命周期
  componentDidMount() {
    this.getNumber();
    // this.getSetOfBookList();
  }
  // 获取序号
  getNumber = ()=>{
    let set = this.props.set;
    service.NumberDimensionSetting(set).then ((res)=>{
      this.setState({
        paramsTypeList:res.data,

      });
    }).catch()
  }
=======
>>>>>>> develop


  //保存&&编辑
  handleSubmit = (e) => {
    e.preventDefault();
    let { params } = this.props;

    this.props.form.validateFields((err, values, record) => {
<<<<<<< HEAD
      let data = Object.assign({}, params, values);

=======
      let data = { ...params, ...values };
>>>>>>> develop
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
        service
          .editDimensionSetting(data)
          .then(res => {
            message.success('编辑成功！');
            this.setState({ saveLoading: false });
            this.props.close && this.props.close(true);
          })
          .catch(err => {
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      }
    });
  };

  //等下看一下
  hasErrors(fieldsError) {
    const { isFieldTouched } = this.props.form;
  }

  //取消
  handleCancel = () => {
    this.props.close && this.props.close();
  };
  // 状态开关
  onChange = checked => {
    this.setState({
      s: checked,
    });
  };
  render() {
    const { getFieldDecorator, getFieldsError } = this.props.form;
<<<<<<< HEAD
    const { params,setOfBooks,set} = this.props;
    const { saveLoading, paramsTypeList, section } = this.state;
=======
    const { params } = this.props;
    const { saveLoading, paramsTypeList } = this.state;
>>>>>>> develop
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
              rules: [
                {
                  required: true,
                },
              ],
              initialValue:JSON.stringify(params) === '{}' ?this.props.set: params.setOfBooksId,
            })(
              <Select disabled>
              {setOfBooks.map(option => {
                return <Option key={option.value}>{option.label}</Option>;
              })}
            </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="序号" hasFeedback>
            {getFieldDecorator('dimensionSequence', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: params.dimensionSequence || '',
            })(
              <Select placeholder="请选择" disabled={JSON.stringify(params) === '{}' ? false : true}>
                {paramsTypeList.map((item,index) => {
                  return (
<<<<<<< HEAD
                    <Select.Option key={index} value={item} >
                      {item}
=======
                    <Select.Option key={item.value} >
                      {item.messageKey}
>>>>>>> develop
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
            })(<Input placeholder="请选择" disabled={JSON.stringify(params) === '{}' ? false : true} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="维度名称">
            {getFieldDecorator('dimensionName', {
<<<<<<< HEAD
              rules: [
              {required: true,}
              ],
              initialValue: params.dimensionName || '',
            })(
                <Input key={1} name={params.dimensionName} placeholder={this.$t('common.please.enter') /* 请输入 */}/>
=======
              rules: [],
              initialValue: params.dimensionName || '',
            })(
              <div>
                <Input
                  key={1}
                  name={params.dimensionName}
                  placeholder={this.$t('common.please.enter') /* 请输入 */}
                // nameChange={this.i18nNameChange}
                />
              </div>
>>>>>>> develop
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="状态">
            {getFieldDecorator('enabled',{
                valuePropName: 'checked',
                initialValue: typeof params.id=== 'undefined' ? true: params.enabled,

            })(
             <Switch  />
            )}
            &nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? '启用' : '禁用'}{params.enabled}
          </FormItem>
          <div className="slide-footer">
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
  return{
    company: state.user.company
  }
}

const WrappedNewBuilt = Form.create()(NewBuilt);
export default connect(mapStateToProps, null, null, { withRef: true })(WrappedNewBuilt);

