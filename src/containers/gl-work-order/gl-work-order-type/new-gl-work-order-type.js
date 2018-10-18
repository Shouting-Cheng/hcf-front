import React, { Component } from 'react';
import config from 'config';
import { Button, Form, Input, Select, Radio, Switch, message, Tooltip, Icon } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import SearchArea from 'components/Widget/search-area';
import baseService from 'share/base.service';
import glWorkOrderTypeService from './gl-work-order-type.service';
import ListSelector from 'components/Widget/list-selector';
import PermissionsAllocation from 'components/Template/permissions-allocation';
class NewGLWorkOrderType extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      //存储上个页面传过来的当前行
      nowTypeList: {},
      //存储上个页面条件查询中选中的账套
      setOfBooksId: '',
      //账套列表数据
      setOfBooksIdList: [],
      //关联表单类型
      relatedFormTypeList: [],
      /**
       * 需清空字段
       */
      /**
       * 维度
       */
      //全部维度还是部分维度
      dimensionScope: '1001',
      //选择的维度id数组
      dimensionIdList: [],
      //维度弹窗
      dimensionVisible: false,
      /**
       * 科目
       */
      accountScope: '1001',
      accountIdList: [],
      accountVisible: false,
      /**
       *核算公司设置
       */
      /**
       * 适用人员-权限设置
       */
      permissions: {
        type: 'all',
        values: [],
      },
      visibleUserScope: '1001',
      departmentOrUserGroupIdList: [],
    };
  }
  /**
   * 生命周期函数
   */
  componentWillMount = () => {
    this.getSetOfBookList();
    this.getRelatedFormList();
  };

  componentDidMount = () => {
    const applyEmployeeType = {
      '1001': 'all',
      '1003': 'department',
      '1002': 'group',
    };
    if (this.props.params.glWorkOrderTypeList.id) {
      //编辑时
      glWorkOrderTypeService
        .getTypeById(this.props.params.glWorkOrderTypeList.id)
        .then(res => {
          if (res.status === 200) {
            //当前数据
            let nowTypeList = res.data.generalLedgerWorkOrderType;
            this.setState({
              setOfBooksId: this.props.params.setOfBooksId,
              nowTypeList: nowTypeList,
            });
            //维度
            let dimensionIdList_value = [];
            res.data.dimensionIdList &&
              res.data.dimensionIdList.map(item => {
                dimensionIdList_value.push({ id: item });
              });
            //科目
            let accountIdList_value = [];
            res.data.accountIdList &&
              res.data.accountIdList.map(item => {
                accountIdList_value.push({ id: item });
              });
            //人员权限
            let departmentOrUserGroupIdList_value = res.data.departmentOrUserGroupIdList
              ? res.data.departmentOrUserGroupIdList
              : [];
            this.setState({
              dimensionScope: JSON.stringify(nowTypeList.dimensionScope),
              accountScope: JSON.stringify(nowTypeList.accountScope),
              visibleUserScope: JSON.stringify(nowTypeList.visibleUserScope),
              dimensionIdList: dimensionIdList_value,
              accountIdList: accountIdList_value,
              departmentOrUserGroupIdList: departmentOrUserGroupIdList_value,
              permissions: {
                type: applyEmployeeType[nowTypeList.visibleUserScope],
                values: res.data.departmentOrUserGroupList
                  ? res.data.departmentOrUserGroupList.map(item => {
                      return {
                        label: item.name,
                        value: item.id,
                        key: item.id,
                      };
                    })
                  : [],
              },
            });
          }
        })
        .catch(e => {
          console.log(`获取核算工单类型详情失败：${e}`);
          if (e.response) {
            message.error(`获取核算工单类型详情失败：${e.response.data.message}`);
          }
        });
    } else {
      //新增时
      let nowTypeList = this.props.params.glWorkOrderTypeList;
      this.setState({
        setOfBooksId: this.props.params.setOfBooksId,
        nowTypeList: nowTypeList,
      });
    }
  };
  /**
   * 获取关联表单类型
   */
  getRelatedFormList = () => {
    glWorkOrderTypeService
      .getRelatedFormList(this.props.company.setOfBooksId)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            relatedFormTypeList: res.data,
          });
        }
      })
      .catch(e => {
        console.log(`获取关联表单类型失败：${e}`);
      });
  };
  /**
   * 获取账套列表数据
   */
  getSetOfBookList = () => {
    baseService
      .getSetOfBooksByTenant()
      .then(res => {
        if (res.status === 200) {
          this.setState({
            setOfBooksIdList: res.data,
          });
        }
      })
      .catch(e => {
        console.log(`获取账套列表数据失败：${e}`);
      });
  };
  /**
   * 取消（保存旁边的按钮）
   */
  onSliderFormCancel = () => {
    this.props.onClose();
  };
  /**
   * 保存方法
   */
  onSubmit = e => {
    e.preventDefault();
    this.setState({ loading: true });

    //当前传过来的数据
    let { nowTypeList } = this.state;
    //维度
    let { dimensionScope, dimensionIdList } = this.state;
    let dimensionIdList_id = [];
    dimensionIdList &&
      dimensionIdList.map(item => {
        dimensionIdList_id.push(item.id);
      });
    //科目
    let { accountScope, accountIdList } = this.state;
    let accountIdList_id = [];
    accountIdList &&
      accountIdList.map(item => {
        accountIdList_id.push(item.id);
      });
    //适用人员
    let { visibleUserScope, departmentOrUserGroupIdList } = this.state;

    //验证维度和科目
    if (dimensionScope === '1002' && dimensionIdList_id.length == 0) {
      message.error('请选择至少一个维度字段');
      this.setState({ loading: false });
      return;
    }
    if (accountScope === '1002' && accountIdList_id.length == 0) {
      message.error('请选择至少一个可用科目');
      this.setState({ loading: false });
      return;
    }

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = {
          ...this.state.nowTypeList,
          ...values,
        };
        let params = {
          generalLedgerWorkOrderType: {
            id: nowTypeList.id,
            setOfBooksId: values.setOfBooksId,
            tenantId: this.props.company.tenantId,
            workOrderTypeCode: values.workOrderTypeCode,
            workOrderTypeName: values.workOrderTypeName,
            i18n: {},
            formOid: values.formOid.substring(0, values.formOid.indexOf('$$')),
            formName: values.formOid.substring(
              values.formOid.indexOf('$$') + 2,
              values.formOid.length
            ),
            dimensionScope: dimensionScope,
            accountScope: accountScope,
            visibleUserScope: visibleUserScope,
            visibleCompany: values.visibleCompany,
            enabled: values.enabled,
          },
          dimensionIdList: dimensionIdList_id,
          accountIdList: accountIdList_id,
          departmentOrUserGroupIdList: departmentOrUserGroupIdList,
        };
        if (nowTypeList.id) {
          params.generalLedgerWorkOrderType.versionNumber = nowTypeList.versionNumber;
        }
        if (nowTypeList.id) {
          //编辑时
          glWorkOrderTypeService
            .typeUpdate(params)
            .then(res => {
              if (res.status === 200) {
                message.success('保存成功');
                this.setState({
                  loading: false,
                });
                this.props.onClose(true);
              }
            })
            .catch(e => {
              console.log(`保存失败：${e}`);
              if (e.response) {
                message.error(`保存失败：${e.response.data.message}`);
              }
              this.setState({
                loading: false,
              });
            });
        } else {
          //新增时
          glWorkOrderTypeService
            .typeInsert(params)
            .then(res => {
              if (res.status === 200) {
                message.success('保存成功');
                this.setState({
                  loading: false,
                });
                this.props.onClose(true);
              }
            })
            .catch(e => {
              console.log(`保存失败：${e}`);
              if (e.response) {
                message.error(`保存失败：${e.response.data.message}`);
              }
              this.setState({
                loading: false,
              });
            });
        }
      } else {
        this.setState({ loading: false });
      }
    });
  };
  /**
   * 切换维度
   */
  onDimensionChange = e => {
    this.setState({
      dimensionScope: e.target.value,
      dimensionIdList: [],
    });
  };
  /**
   * 维度弹窗
   */
  onDimensionClick = () => {
    this.refs.SelectDimension.blur();
    this.setState({
      dimensionVisible: true,
    });
  };
  /**
   * 维度取消按钮
   */
  onDimensionCancel = () => {
    this.setState({
      dimensionVisible: false,
    });
  };
  /**
   * 维度确定按钮
   */
  onDimensionOk = value => {
    this.setState({
      dimensionIdList: value.result,
      dimensionVisible: false,
    });
  };
  /**
   * 科目切换事件
   */
  onAccountChange = e => {
    this.setState({
      accountScope: e.target.value,
      accountIdList: [],
    });
  };
  /**
   * 打开科目弹窗
   */
  onAccountClick = () => {
    this.refs.SelectAccount.blur();
    this.setState({
      accountVisible: true,
    });
  };
  /**
   * 科目弹窗取消
   */
  onAccountCancel = () => {
    this.setState({
      accountVisible: false,
    });
  };
  /**
   * 科目弹窗确定
   */
  onAccountOk = value => {
    this.setState({
      accountIdList: value.result,
      accountVisible: false,
    });
  };
  /**
   * 权限设置
   */
  onPermissionChange = values => {
    let nowApplyEmployee = '';
    let nowDepartOrUserIdList = [];
    if (values.type == 'all') {
      nowApplyEmployee = '1001';
    } else if (values.type == 'department') {
      nowApplyEmployee = '1003';
    } else if (values.type == 'group') {
      nowApplyEmployee = '1002';
    }
    values.values.map(value => {
      nowDepartOrUserIdList.push(value['value']);
    });
    this.setState({
      visibleUserScope: nowApplyEmployee,
      departmentOrUserGroupIdList: nowDepartOrUserIdList,
    });
  };
  /**
   * 渲染函数
   */
  render() {
    //按钮控制
    const { loading } = this.state;
    //上个页面传递过来的数据
    const { nowTypeList, setOfBooksId } = this.state;
    //列表数据-账套，关联表单类型
    const { setOfBooksIdList, relatedFormTypeList } = this.state;
    //维度
    const { dimensionScope, dimensionIdList, dimensionVisible } = this.state;
    //科目
    const { accountScope, accountVisible, accountIdList } = this.state;
    //公司设置
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    //权限设置
    const { permissions } = this.state;
    //表单
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 10, offset: 1 },
    };
    const accountParams = nowTypeList.id
      ? {
          setOfBooksId: nowTypeList.id ? nowTypeList.setOfBooksId : setOfBooksId,
          id: nowTypeList.id,
        }
      : { setOfBooksId: nowTypeList.id ? nowTypeList.setOfBooksId : setOfBooksId };
    return (
      <div>
        <Form onSubmit={this.onSubmit}>
          <div className="common-item-title">基本信息</div>
          <FormItem {...formItemLayout} label="账套">
            {getFieldDecorator('setOfBooksId', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: nowTypeList.id ? nowTypeList.setOfBooksId : setOfBooksId,
            })(
              <Select disabled>
                {setOfBooksIdList.map(item => {
                  return (
                    <Option value={item.id}>
                      {item.setOfBooksCode}-{item.setOfBooksName}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="核算工单类型代码">
            {getFieldDecorator('workOrderTypeCode', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: nowTypeList.id ? nowTypeList.workOrderTypeCode : '',
            })(<Input placeholder="请输入" disabled={nowTypeList.id} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="核算工单类型名称">
            {getFieldDecorator('workOrderTypeName', {
              rules: [
                {
                  required: true,
                  message: '请输入',
                },
              ],
              initialValue: nowTypeList.id ? nowTypeList.workOrderTypeName : '',
            })(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={
              <span>
                关联表单类型
                <Tooltip placement="topRight" title="关联表单设计器中的单据类型，用来使用工作流。">
                  <Icon type="info-circle-o" />
                </Tooltip>
              </span>
            }
          >
            {getFieldDecorator('formOid', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              initialValue: nowTypeList.id ? nowTypeList.formOid + '$$' + nowTypeList.formName : '',
            })(
              <Select placeholder="请选择">
                {relatedFormTypeList.map(item => {
                  return (
                    <Option value={item.formOID + '$$' + item.formName}>{item.formName}</Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="状态">
            {getFieldDecorator('enabled', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: nowTypeList.id ? nowTypeList.enabled : true,
              valuePropName: 'checked',
            })(<Switch />)}&nbsp;&nbsp;&nbsp;
            {this.props.form.getFieldValue('enabled') ? '启用' : '禁用'}
          </FormItem>
          <div className="common-item-title">维度设置</div>
          <FormItem {...formItemLayout} label="维度字段">
            <RadioGroup value={dimensionScope} onChange={this.onDimensionChange}>
              <Radio value="1001">全部维度</Radio>
              <Radio value="1002">部分维度</Radio>
            </RadioGroup>
            <Input
              ref="SelectDimension"
              onFocus={this.onDimensionClick}
              placeholder="请选择"
              disabled={dimensionScope === '1001' ? true : false}
              value={
                dimensionScope === '1001' ? '全部维度' : `已选择了${dimensionIdList.length}个维度`
              }
            />
          </FormItem>
          <div className="common-item-title">科目设置</div>
          <FormItem {...formItemLayout} label="可用科目">
            <RadioGroup value={accountScope} onChange={this.onAccountChange}>
              <Radio value="1001">全部科目</Radio>
              <Radio value="1002">部分科目</Radio>
            </RadioGroup>
            <Select
              ref="SelectAccount"
              onFocus={this.onAccountClick}
              placeholder="请选择"
              disabled={accountScope === '1001' ? true : false}
              value={accountScope === '1001' ? '全部科目' : `已选择了${accountIdList.length}个科目`}
            />
          </FormItem>
          <div className="common-item-title">核算公司设置</div>
          <FormItem {...formItemLayout} label=" " colon={false}>
            {getFieldDecorator('visibleCompany', {
              initialValue: nowTypeList.id ? JSON.stringify(nowTypeList.visibleCompany) : '1004',
            })(
              <RadioGroup>
                <Radio style={radioStyle} value="1001">
                  账套下全部公司
                </Radio>
                <Radio style={radioStyle} value="1002">
                  本公司及下属公司
                </Radio>
                <Radio style={radioStyle} value="1003">
                  下属公司
                </Radio>
                <Radio style={radioStyle} value="1004">
                  仅本公司
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
          <div className="common-item-title">权限设置</div>
          <FormItem {...formItemLayout} label="适用人员">
            {getFieldDecorator('departmentOrUserGroupIdList', {
              initialValue: permissions,
            })(
              <PermissionsAllocation
                params={{ setOfBooksId: nowTypeList.id ? nowTypeList.setOfBooksId : setOfBooksId }}
                onChange={this.onPermissionChange}
              />
            )}
          </FormItem>
          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t({ id: 'common.save' })}
            </Button>
            <Button onClick={this.onSliderFormCancel}>{this.$t({ id: 'common.cancel' })}</Button>
          </div>
        </Form>
        {/* 维度弹窗 */}
        <ListSelector
          visible={dimensionVisible}
          onCancel={this.onDimensionCancel}
          onOk={this.onDimensionOk}
          type="gl_select_dimension"
          selectedData={dimensionIdList}
          extraParams={{
            setOfBooksId: nowTypeList.id ? nowTypeList.setOfBooksId : setOfBooksId,
            id: nowTypeList.id,
          }}
          single={false}
        />
        <ListSelector
          visible={accountVisible}
          onCancel={this.onAccountCancel}
          onOk={this.onAccountOk}
          type="gl_select_account"
          selectedData={accountIdList}
          extraParams={accountParams}
          single={false}
        />
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}
const WrappedNewGLWorkOrderType = Form.create()(NewGLWorkOrderType);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewGLWorkOrderType);
