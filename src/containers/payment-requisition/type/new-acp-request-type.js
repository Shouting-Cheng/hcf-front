import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import {
  Form,
  Switch,
  Icon,
  Input,
  Select,
  Button,
  Row,
  Col,
  message,
  Spin,
  Radio,
  Tooltip,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

import httpFetch from 'share/httpFetch';
import config from 'config';

import PermissionsAllocation from 'widget/Template/permissions-allocation';

import SelectCheckSheetType from './select-check-sheet-type';

class AcpRequestTypeDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: [],
      fetching: false,
      nowType: {},
      setOfBooks: [], //账套
      relatedType: 'BASIS_01', //关联报账单的类型
      isRelated: true, //是否关联报账单
      accordingAsRelated: 'BASIS_01',
      showSelectDepartment: false,
      employeeList: [],
      selectEmployeeText: '',
      applyEmployee: 'BASIS_01',
      defaultApplyEmployee: 'BASIS_01',
      isNew: false,
      editTag: false,
      formTypeOptions: [],
      showSelectRelated: false,
      relatedList: [],
      acpReqTypeDefine: '/document-type-manage/payment-requisition-type',
      relatedListOptions: [],
      queryFlag: true,
      permissions: {
        type: 'all',
        values: [],
      },
      showSelectCheckSheetType: false,
      list: [],
    };
  }

  componentWillMount() {
    httpFetch.get(`${config.baseUrl}/api/setOfBooks/by/tenant?roleType=TENANT`).then(res => {
      this.setState({ setOfBooks: res.data });
    });
    this.getSystemValueList(2105).then(res => {
      this.setState({ options: res.data.values });
    });
    let nowType = this.state.nowType;
    httpFetch
      .get(
        `${
          config.baseUrl
        }/api/custom/forms/setOfBooks/my/available/all?formTypeId=801005&setOfBooksId=${
          this.props.params.record.setOfBooksId
            ? this.props.params.record.setOfBooksId
            : this.props.params.record.record.setOfBooksId
        }`
      )
      .then(res => {
        this.setState({ formTypeOptions: res.data, fetching: false });
      });
    // this.getFormType();
  }

  componentDidMount() {
    if (this.props.params.record.record != undefined) {
      this.setState({ nowType: this.props.params.record.record, editTag: true });
      if (this.props.params.record.record !== undefined) {
        httpFetch
          .get(`${config.payUrl}/api/acp/request/type/query/${this.props.params.record.record.id}`)
          .then(res => {
            let temp = res.data;
            let relatedLists = [];
            if (temp.paymentRequisitionTypes.relatedType != 'BASIS_01') {
              temp.paymentRequisitionTypesToRelateds.map(item => {
                relatedLists.push(item.typeId);
              });
            }
            const applyEmployeeType = {
              BASIS_01: 'all',
              BASIS_02: 'department',
              BASIS_03: 'group',
            };
            let employeeLists = [];
            if (temp.paymentRequisitionTypes.applyEmployee != 'BASIS_01') {
              temp.paymentRequisitionTypesToUsers.map(item => {
                employeeLists.push(item.userGroupId);
              });
            }
            this.setState({
              employeeList: employeeLists,
              applyEmployee: temp.paymentRequisitionTypes.applyEmployee,
              relatedType: temp.paymentRequisitionTypes.relatedType,
              isRelated: true,
              queryFlag: false,
              editTag: true,
              relatedList: relatedLists,
              permissions: {
                type: applyEmployeeType[temp.paymentRequisitionTypes.applyEmployee],
                values: temp.paymentRequisitionTypesToUsers
                  ? temp.paymentRequisitionTypesToUsers.map(item => {
                      return {
                        label: item.pathOrName,
                        value: item.userGroupId,
                        key: item.userGroupId,
                      };
                    })
                  : [],
              },
            });
          });
      }
    } else {
      this.setState({
        nowType: {},
        // applyEmployee: this.state.applyEmployee ? this.state.applyEmployee : 'BASIS_01',
        relatedType: this.state.relatedType ? this.state.relatedType : 'BASIS_01',
        isRelated: true,
        editTag: false,
        accordingAsRelated: 'BASIS_01',
        showSelectRelated: false,
      });
    }
  }

  onCancel = () => {
    this.props.onClose(false);
    this.props.form.resetFields();
  };

  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = {
          ...this.state.nowType,
          ...values,
        };
        this.state.formTypeOptions.map(item => {
          if (item.formOid === values.formOid) {
            values.formName = item.formName;
            values.formType = item.formType;
          }
        });
        values.relatedType = this.state.relatedType;
        values.applyEmployee = this.state.applyEmployee;
        values.accordingAsRelated = this.state.accordingAsRelated;
        values.related = this.state.isRelated;
        values.tenantId = this.props.company.tenantId;
        delete values.form;

        let acpRequstTypesToUsers = [];

        if (values.applyEmployee == 'BASIS_01') {
          let userList = {};
          userList['userType'] = 'BASIS_01';
          acpRequstTypesToUsers.push(userList);
        } else {
          this.state.employeeList.map((item, index) => {
            let userList = {};
            userList['userType'] = this.state.applyEmployee;
            userList['userGroupId'] = item;
            //userList["pathOrName"] = this.state.list[index].label;
            acpRequstTypesToUsers.push(userList);
          });
        }
        if (this.state.applyEmployee == 'BASIS_02' && !acpRequstTypesToUsers.length) {
          message.warning('请至少选择一个部门');
          return;
        }
        if (this.state.applyEmployee == 'BASIS_03' && !acpRequstTypesToUsers.length) {
          message.warning('请至少选择一个员工组');
          return;
        }
        let acpRequestTypesToRelateds = [];
        if (values.relatedType == 'BASIS_01') {
          let relatedLists = {};
          relatedLists['relatedType'] = 'BASIS_01';
          acpRequestTypesToRelateds.push(relatedLists);
        } else {
          this.state.relatedList.map(item => {
            let relatedLists = {};
            relatedLists['relatedType'] = this.state.relatedType;
            relatedLists['typeId'] = item;
            acpRequestTypesToRelateds.push(relatedLists);
          });
        }
        if (values.relatedType == 'BASIS_02' && !acpRequestTypesToRelateds.length) {
          message.warning('请至少选择一个可关联报账单类型');
          return;
        }

        let params = {
          paymentRequisitionTypes: values,
          paymentRequisitionTypesToRelateds: acpRequestTypesToRelateds,
          paymentRequisitionTypesToUsers: acpRequstTypesToUsers,
        };
        httpFetch['post'](`${config.payUrl}/api/acp/request/type`, params)
          .then(res => {
            this.setState({ loading: false });
            message.success(
              this.$t(
                { id: 'common.save.success' },
                { name: res.data.paymentRequisitionTypes.description }
              )
            ); //保存成功
            this.props.onClose(false);
            this.setState({
              nowType: {},
              applyEmployee: 'BASIS_01',
              isRelated: true,
              accordingAsRelated: 'BASIS_01',
              selectEmployeeText: '',
              employeeList: [],
              relatedList: [],
              permissions: {
                type: 'all',
                values: [],
              },
            });
          })
          .catch(e => {
            if (e.response) {
              message.error(`保存失败, ${e.response.data.message}`);
            }
            this.setState({ loading: false });
          });
      }
    });
  };

  onrelatedTypeChange = e => {
    this.setState({ relatedType: e.target.value });
    if ('BASIS_01' === e.target.value) {
      this.setState({ relatedList: [] });
    }
  };

  //获取关联表单类型
  getFormType = () => {
    if (this.state.formTypeOptions.length) return;
    this.setState({ fetching: true });
    let setOfBooksId = !this.state.nowType.id
      ? this.props.params.record.setOfBooksId
      : this.state.nowType.setOfBooksId;
    if (!setOfBooksId) {
      setOfBooksId = 0;
    }
    httpFetch
      .get(
        `${
          config.baseUrl
        }/api/custom/forms/setOfBooks/my/available/all?formTypeId=801005&setOfBooksId=${setOfBooksId}`
      )
      .then(res => {
        this.setState({ formTypeOptions: res.data, fetching: false });
      });
  };

  //选择人员或者员工组使用公共组件，监听onChange事件
  onPermissionChange = values => {
    let nowApplyEmployee = '';
    let nowDepartOrUserIdList = [];
    if (values.type == 'all') {
      nowApplyEmployee = 'BASIS_01';
    } else if (values.type == 'department') {
      nowApplyEmployee = 'BASIS_02';
    } else if (values.type == 'group') {
      nowApplyEmployee = 'BASIS_03';
    }
    values.values.map(value => {
      nowDepartOrUserIdList.push(value['value']);
    });
    this.setState({
      applyEmployee: nowApplyEmployee,
      employeeList: nowDepartOrUserIdList,
      list: values.values || [],
    });
  };
  //显示可关联报账单类型弹窗
  showSelectCheckSheetType = () => {
    this.refs.SelectCheckSheetType.blur();
    let model = { ...this.state.nowType };
    model.setOfBooksId = this.props.form.getFieldValue('setOfBooksId');
    this.setState({ showSelectCheckSheetType: true, nowType: model });
  };
  //取消显示弹窗
  onSelectCheckSheetTypeCancel = () => {
    this.setState({ showSelectCheckSheetType: false });
  };
  //可关联报账单类型ok
  handleCheckSheetOk = values => {
    this.setState({ relatedList: values.result, showSelectCheckSheetType: false });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      nowType,
      fetching,
      setOfBooks,
      isRelated,
      accordingAsRelated,
      showSelectDepartment,
      selectEmployeeText,
      formTypeOptions,
      relatedListOptions,
      relatedList,
      relatedType,
      employeeList,
      permissions,
      showSelectCheckSheetType,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const form_label = (
      <span>
        关联表单类型
        <Tooltip title="关联表单设计器中的单据类型，用来使用工作流" overlayStyle={{ width: 220 }}>
          <Icon type="info-circle-o" style={{ margin: '0 3px' }} />
        </Tooltip>
      </span>
    );

    return (
      <div>
        <Form onSubmit={this.handleSave}>
          <div className="common-item-title">基本信息</div>

          {/* <FormItem {...formItemLayout} label="类型">
            <span>付款申请单</span>
          </FormItem> */}

          <FormItem {...formItemLayout} label="账套">
            {getFieldDecorator('setOfBooksId', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: !nowType.id
                ? this.props.params.record.setOfBooksId
                : nowType.setOfBooksId,
            })(
              <Select
                placeholder={this.$t({ id: 'common.please.select' }) /* 请选择 */}
                notFoundContent={<Spin size="small" />}
                disabled={true}
              >
                {setOfBooks.map(option => {
                  return (
                    <Option key={option.id}>
                      {option.setOfBooksCode}-{option.setOfBooksName}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="付款申请单类型代码">
            {getFieldDecorator('acpReqTypeCode', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }), //请输入
                },
              ],
              initialValue: nowType.acpReqTypeCode,
            })(
              <Input
                placeholder={this.$t({ id: 'common.please.enter' }) /* 请输入 */}
                disabled={!!nowType.acpReqTypeCode}
              />
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="付款申请单类型名称">
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.enter' }), //请输入
                },
              ],
              initialValue: nowType.description,
            })(<Input placeholder={this.$t({ id: 'common.please.enter' }) /* 请输入 */} />)}
          </FormItem>

          <FormItem {...formItemLayout} label={form_label}>
            {getFieldDecorator('formOid', {
              rules: [
                {
                  required: true,
                  message: this.$t({ id: 'common.please.select' }), //请输入
                },
              ],
              initialValue: nowType.formOid,
            })(
              <Select
                placeholder="请选择"
                onFocus={this.getFormType}
                notFoundContent={fetching ? <Spin size="small" /> : '无匹配结果'}
              >
                {formTypeOptions.map(option => {
                  return <Option key={option.formOid}>{option.formName}</Option>;
                })}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label={this.$t({ id: 'common.column.status' }) /* 状态 */}>
            {getFieldDecorator('enabled', {
              initialValue: !nowType.id ? true : nowType.enabled,
              valuePropName: 'checked',
            })(
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
              />
            )}&nbsp;&nbsp;&nbsp;&nbsp;{this.props.form.getFieldValue('enabled')
              ? this.$t({ id: 'common.status.enable' })
              : this.$t({ id: 'common.status.disable' })}
          </FormItem>

          <div className="common-item-title">关联报账单设置</div>
          <FormItem {...formItemLayout} label="是否关联报账单">
            <RadioGroup value={isRelated}>
              <RadioButton value={true}>关联</RadioButton>
            </RadioGroup>
          </FormItem>

          <FormItem {...formItemLayout} label="关联依据">
            <RadioGroup value={accordingAsRelated} disabled={!isRelated}>
              <Radio style={radioStyle} value="BASIS_01">
                报账单头申请人=付款申请单头申请人
              </Radio>
            </RadioGroup>
          </FormItem>

          <FormItem {...formItemLayout} label="可关联报账单类型">
            <div>
              <RadioGroup
                value={relatedType}
                disabled={!isRelated}
                onChange={this.onrelatedTypeChange}
              >
                <Radio value="BASIS_01">全部类型</Radio>
                <Radio value="BASIS_02">部分类型</Radio>
              </RadioGroup>
              <Input
                ref="SelectCheckSheetType"
                onFocus={this.showSelectCheckSheetType}
                disabled={relatedType === 'BASIS_01'}
                placeholder={
                  relatedType === 'BASIS_01' ? '全部类型' : `已选择了${relatedList.length}个类型`
                }
              />
            </div>
          </FormItem>

          <div className="common-item-title">权限设置</div>
          <FormItem {...formItemLayout} label="适用人员">
            {getFieldDecorator('employeeList', {
              initialValue: permissions,
            })(
              <PermissionsAllocation
                params={{
                  setOfBooksId: !nowType.id
                    ? this.props.params.record.setOfBooksId
                    : nowType.setOfBooksId,
                }}
                onChange={this.onPermissionChange}
              />
            )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={this.state.loading}>
              {this.$t({ id: 'common.save' }) /* 保存 */}
            </Button>
            <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' }) /* 取消 */}</Button>
          </div>
        </Form>
        {showSelectCheckSheetType&&
        <SelectCheckSheetType
          visible={showSelectCheckSheetType}
          onCancel={this.onSelectCheckSheetTypeCancel}
          params={{ setOfBooksId: nowType.setOfBooksId }}
          selectedData={[...relatedList]}
          onOk={this.handleCheckSheetOk}/>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}
const WrappedAcpRequestTypeDetail = Form.create()(AcpRequestTypeDetail);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedAcpRequestTypeDetail);
