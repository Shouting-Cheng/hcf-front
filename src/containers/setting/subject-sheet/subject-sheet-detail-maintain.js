/**
 * Created by dicky on 2017/12/05.
 */
import React from 'react';
import { connect } from 'dva';

import { Button, Form, Switch, Input, message, Icon, Select, Radio } from 'antd';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
import SearchArea from 'components/Widget/search-area.js';
import config from 'config';
import httpFetch from 'share/httpFetch';
import ListSelector from 'components/Widget/list-selector'


//科目明细 新建和编辑
class SubjectSheetDetailMaintain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      value: 1,
      params: {},
      isNew: true,
      reportTypeOptions: [], //报表类型
      balanceDirectionOptions: [], //余额方向
      accountTypeOptions: [] //科目类型
    };
  }

  //初始化加载
  componentWillMount() {

  }

  //获取 报表类型的值列表
  clickReportTypeSelect = () => {
    //如果已经有值，则不再查询
    if (this.state.reportTypeOptions.length > 1) {
      return;
    }
    this.getSystemValueList(2206).then(res => { //报表类型
      let reportTypeOptions = res.data.values || [];
      this.setState({ reportTypeOptions })
    });
  }
  //获取 余额方向的值列表
  clickBalanceDirectionSelect = () => {
    //console.log("balanceDirectionOptions length:" + this.state.balanceDirectionOptions.length);
    //如果已经有值，则不再查询
    if (this.state.balanceDirectionOptions.length > 1) {
      return;
    }
    this.getSystemValueList(2207).then(res => { //余额方向
      let balanceDirectionOptions = res.data.values || [];
      this.setState({ balanceDirectionOptions })
    });
  };

  //获取 科目类型的值列表
  clickAccountTypeSelect = () => {
    //如果已经有值，则不再查询
    if (this.state.accountTypeOptions.length > 1) {
      return;
    }
    this.getSystemValueList(2205).then(res => { //科目类型
      let accountTypeOptions = res.data.values || [];
      this.setState({ accountTypeOptions })
    });
  };

  //只要有props的值发生变化，就会调用该方法
  //   componentWillReceiveProps(nextProps) {
  //     // console.log(this.props.params);
  //     //console.log("=====componentWillReceiveProps begin");
  //     if(nextProps.params.record&&nextProps.params.record.id&&nextProps.params.visible&&!this.props.params.visible){
  //       //编辑时，获取下啦接口数据
  //       this.clickBalanceDirectionSelect();
  //       this.clickAccountTypeSelect();
  //       this.clickReportTypeSelect()
  //     }
  //     if (!nextProps.params || nextProps.params == this.props.params) {
  //       //console.log("=====componentWillReceiveProps return");
  //       return;
  //     }

  //     if(!nextProps.params.visible&&this.props.params.visible){
  //       //this.setState({newSheet:{i18n:{},accountSetDesc:''}});
  //       this.props.form.resetFields();
  //     }
  //     //console.log("=====componentWillReceiveProps continue");

  //     //余额方向 值列表
  //     let balanceDirectionOptionsTemp = [];
  //     //科目类型 值列表
  //     let accountTypeOptionsTemp = [];
  //     //报表类型 值列表
  //     let reportTypeOptionsTemp = [];

  //     if (nextProps.params.isNew == undefined || nextProps.params.isNew) {
  //       if (nextProps.params.accountTypeOptions == undefined || nextProps.params.accountTypeOptions.length == 0) {
  //         accountTypeOptionsTemp = [];
  //       }else{
  //         accountTypeOptionsTemp = nextProps.params.accountTypeOptions;
  //       }

  //     } else {
  //       balanceDirectionOptionsTemp.push({
  //         value: nextProps.params.record.balanceDirection,
  //         messageKey: nextProps.params.record.balanceDirectionName,
  //       });

  //       if (nextProps.params.accountTypeOptions.length == 0) {
  //         accountTypeOptionsTemp.push({
  //           value: nextProps.params.record.accountType,
  //           messageKey: nextProps.params.record.accountTypeName,
  //         })
  //       } else {
  //         accountTypeOptionsTemp = nextProps.params.accountTypeOptions;
  //       }

  //       reportTypeOptionsTemp.push({
  //         value: nextProps.params.record.reportType,
  //         messageKey: nextProps.params.record.reportTypeName,
  //       })

  //     }
  //     this.setState(
  //       {
  //         accountTypeOptions: accountTypeOptionsTemp, //? nextProps.params.accountTypeOptions :[],
  //         loading: false,
  //         balanceDirectionOptions: balanceDirectionOptionsTemp,
  //         reportTypeOptions: reportTypeOptionsTemp,
  //         isNew: nextProps.params.isNew
  //       }, () => {
  //         this.setState({
  //           params: { ...nextProps.params.record } //? nextProps.params.record : {},
  //         })
  //       }
  //     );
  //   }

  componentDidMount() {
    //编辑时，获取下啦接口数据
    this.clickBalanceDirectionSelect();
    this.clickAccountTypeSelect();
    this.clickReportTypeSelect()

    //余额方向 值列表
    let balanceDirectionOptionsTemp = [];
    //科目类型 值列表
    let accountTypeOptionsTemp = [];
    //报表类型 值列表
    let reportTypeOptionsTemp = [];

    if (this.props.params.isNew == undefined || this.props.params.isNew) {
      if (this.props.params.accountTypeOptions == undefined || this.props.params.accountTypeOptions.length == 0) {
        accountTypeOptionsTemp = [];
      } else {
        accountTypeOptionsTemp = this.props.params.accountTypeOptions;
      }

    } else {
      balanceDirectionOptionsTemp.push({
        value: this.props.params.record.balanceDirection,
        messageKey: this.props.params.record.balanceDirectionName,
      });

      if (this.props.params.accountTypeOptions.length == 0) {
        accountTypeOptionsTemp.push({
          value: this.props.params.record.accountType,
          messageKey: this.props.params.record.accountTypeName,
        })
      } else {
        accountTypeOptionsTemp = this.props.params.accountTypeOptions;
      }

      reportTypeOptionsTemp.push({
        value: this.props.params.record.reportType,
        messageKey: this.props.params.record.reportTypeName,
      })

    }
    this.setState(
      {
        accountTypeOptions: accountTypeOptionsTemp, //? nextProps.params.accountTypeOptions :[],
        loading: false,
        balanceDirectionOptions: balanceDirectionOptionsTemp,
        reportTypeOptions: reportTypeOptionsTemp,
        isNew: this.props.params.isNew
      }, () => {
        this.setState({
          params: { ...this.props.params.record } //? nextProps.params.record : {},
        })
      }
    );
  }

  //保存
  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.accountName = values.accountDesc;
        this.setState({ loading: true });
        let method;
        if (this.state.params.id) {
          //修改
          method = 'put';
          values = { ...this.state.params, ...values } // 如果params和values里值有重复，会以后面的值为准
        }
        else {
          //新增
          method = 'post';
          values.accountSetId = this.state.params.accountSetId;
        }
        httpFetch[method](`${config.baseUrl}/api/accounts`, values).then((res) => {
          this.setState({ loading: false });
          if (res.status === 200) {
            message.success(this.$t({ id: 'common.save.success' }, { name: this.$t({ id: 'subject.sheet.detail' }) }));  //保存成功
            this.props.form.resetFields();
            this.props.close(true);//会调用
          }
        }).catch((e) => {
          this.setState({ loading: false });
          message.error(this.$t({ id: 'common.save.filed' }) + `${e.response.data.message}`);
        })
      }
    })
  };
  //取消按钮
  onCancel = () => {
    this.props.form.resetFields();
    this.props.close();
  };


  render() {
    const { params, reportTypeOptions, accountTypeOptions, balanceDirectionOptions, isNew } = this.state;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 6, offset: 1 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-payment-method">
        <Form onSubmit={this.handleSave}>
          <FormItem {...formItemLayout} label={this.$t({ id: 'subject.code' })}>
            {getFieldDecorator('accountCode', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.enter' })
              },
              {
                validator: (item, value, callback) => {
                  let str = /^[0-9a-zA-z-_]*$/;
                  if (!str.test(value) || value.length > 35) {
                    callback(this.$t({ id: 'setting.companyGroupCode.tips' }))
                  }
                  callback();
                }
              }
              ],
              initialValue: isNew ? '' : params.accountCode
            })(
              <Input disabled={isNew ? false : true} placeholder={this.$t({ id: 'common.please.enter' })/*请输入代码*/} />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'subject.name' })}>
            {getFieldDecorator('accountDesc', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.enter' })
              },
              {
                validator: (item, value, callback) => {
                  let str = /^[\u4E00-\u9FA5\w\d-]*$/u;
                  if (!str.test(value) || value.length > 100) {
                    callback(this.$t({ id: 'setting.companyGroupName.tips' }))
                  }
                  callback();
                }
              }
              ],
              initialValue: isNew ? "" : params.accountDesc
            })(
              <Input placeholder={this.$t({ id: 'common.please.enter' })/*请输入名称*/} />
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'subject.balance.direction' })}>
            {getFieldDecorator('balanceDirection', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.enter' })
              }],
              initialValue: isNew ? undefined : params.balanceDirection
            })(
              <Select placeholder={this.$t({ id: 'common.please.select' })/*请选择*/} >
                {balanceDirectionOptions.map(option => {
                  return <Option key={option.value} value={option.value}>{option.messageKey}</Option>
                })}
              </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'subject.type' })}>
            {getFieldDecorator('accountType', {
              rules: [{
                required: true,
                message: this.$t({ id: 'common.please.enter' })
              }],
              initialValue: isNew ? undefined : params.accountType
            })(
              <Select allowClear placeholder={this.$t({ id: 'common.please.select' })/*请选择*/} >
                {accountTypeOptions.map(option => {
                  return <Option key={option.value} value={option.value}>{option.messageKey}</Option>
                })}
              </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'subject.report.type' })}>
            {getFieldDecorator('reportType', {
              rules: [{
                required: false,
                message: this.$t({ id: 'common.please.enter' })
              }],
              initialValue: isNew ? undefined : params.reportType
            })(
              <Select allowClear placeholder={this.$t({ id: 'common.please.select' })/*请选择*/} >
                {reportTypeOptions.map(option => {
                  return <Option key={option.value} value={option.value}>{option.messageKey}</Option>
                })}
              </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'common.column.status' })}>
            {getFieldDecorator('enabled', {
              initialValue: isNew ? true : params.enabled
            })(
              <Switch checked={this.props.form.getFieldValue('enabled')}
                checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />
              )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled') ? this.$t({ id: 'common.status.enable' }) : this.$t({ id: 'common.status.disable' })}
          </FormItem>

          <FormItem {...formItemLayout} label={this.$t({ id: 'subject.summary.flag' })}>
            {getFieldDecorator('summaryFlag', {
              rules: [{
                required: false,
                message: this.$t({ id: 'common.please.enter' })
              }],
              initialValue: isNew ? false : params.summaryFlag
            })(
              <RadioGroup onChange={this.onChange}>
                <Radio key="true" value={true}>{this.$t({ id: 'common.yes' })}</Radio>
                <Radio key="false" value={false}>{this.$t({ id: 'common.no' })}</Radio>
              </RadioGroup>
              )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit"
              loading={this.state.loading}>{this.$t({ id: 'common.save' })}</Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })}</Button>
          </div>
        </Form>
      </div>
    )
  }
}


const WrappedSubjectSheetDetailMaintain = Form.create()(SubjectSheetDetailMaintain);

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedSubjectSheetDetailMaintain);
