/**
 * Created by zhouli on 18/02/03
 * Email li.zhou@huilianyi.com
 * 组织架构部门角色控制
 */
import React from 'react';

import 'styles/enterprise-manage/org-structure/org-component/org-roles-list.scss';
import { Button, Table, Badge, Switch, Modal, Icon, Input, Form } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
const FormItem = Form.Item;
//需要在这个里面去配置弹窗类型
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';
import { LanguageInput } from 'components/Widget/index';

class OrgStructureRolesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalKey: 0,
      loading: true,
      showCreatModel: false, //弹窗是否显示
      //翻页
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,

        showSizeChanger: true,
        showQuickJumper: true,
      },
      data: [], //角色数据
      // 角色表格
      columns: [
        {
          /*角色名称*/
          title: this.$t('org.role.no-person'),
          key: 'positionName',
          dataIndex: 'positionName',
          width: '10%',
        },
        {
          /*角色代码*/
          width: '10%',
          title: this.$t('org.role.no-dep'),
          key: 'positionCode',
          dataIndex: 'positionCode',
        },
        {
          /*状态*/
          title: this.$t('common.column.status'),
          key: 'status',
          width: '10%',
          dataIndex: 'enabled',
          render: enabled => (
            <Badge
              status={enabled ? 'success' : 'error'}
              text={enabled ? this.$t('common.status.enable') : this.$t('common.status.disable')}
            />
          ),
        },
        {
          /*操作*/
          title: this.$t('common.operation'),
          key: 'operation',
          dataIndex: 'operation',
          width: '20%',
          render: (text, record) => (
            <span>
              <a onClick={e => this.editRole(e, record)}>{this.$t('common.edit')}</a>
            </span>
          ),
        },
      ],
      role: {}, //当前编辑或新增的角色
    };
  }

  componentDidMount() {
    this.getRoleList();
  }

  componentWillReceiveProps(nextProps) {}

  //获取角色列表
  getRoleList = () => {
    this.setState({ loading: true });
    let params = {
      size: this.state.pagination.pageSize,
      page: this.state.pagination.page,
    };
    const { pagination } = this.state;
    OrgService.getRoleList(params)
      .then(response => {
        let data = response.data.content;
        pagination.total = response.data.totalElements;
        this.setState({
          pagination,
          data: response.data.content,
        });
        this.setState({ loading: false });
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };
  //创建或者更新角色
  createUpdateRole = roles => {
    this.setState({
      loading: true,
    });
    OrgService.createUpdateRole(roles)
      .then(response => {
        this.getRoleList();
        //不重置的话，点击新增会有上一次的值
        this.props.form.resetFields();
        this.setState({
          loading: false,
          showCreatModel: false,
          role: {},
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
        });
      });
  };
  // 编辑角色
  editRole = (e, record) => {
    let modalKey = this.state.modalKey;
    modalKey++;
    this.setState({
      modalKey,
      showCreatModel: true,
      role: { ...record },
    });
  };
  //添加角色
  addRole = e => {
    //如果没有这个，页面会刷新
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.state.role.enabled = values.enabled;
        this.state.role.positionCode = values.positionCode;
        this.createUpdateRole([this.state.role]);
      }
    });
  };
  //取消添加角色
  cancelRole = () => {
    this.setState({
      showCreatModel: false,
      role: {},
    });
  };
  //显示添加角色模态框
  showAddRoleModel = () => {
    this.setState({
      showCreatModel: true,
      role: {
        positionName: '',
        i18n: null,
        enabled: true,
      },
    });
  };
  //监听表单值
  handleFormChange = () => {
    //有多语言慎用
  };
  //角色启用禁用状态改变
  switchChange = e => {
    let role = this.state.role;
    role.enabled = e;
    this.setState({
      role,
    });
  };
  //翻页
  onChangePager = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: {
          current: pagination.current,
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
        },
      },
      () => {
        this.getRoleList();
      }
    );
  };

  i18nChange = (name, i18nName) => {
    const role = this.state.role;
    role.positionName = name;
    role.i18n = {
      positionName: i18nName,
    };
  };
  handleBack = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/enterprise-manage/org-structure`,
      })
    );
    // this.context.router.push(menuRoute.getRouteItem('org-structure').url);
  };

  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    const { role, loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="org-roles-list">
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.showAddRoleModel}>
              {this.$t('common.create')}
            </Button>
          </div>
        </div>

        <Modal
          key={this.state.modalKey}
          closable
          width={600}
          className="create-update-modal"
          title={this.$t('org.role.create-or-update-role')} //创建或者更新部门角色
          visible={this.state.showCreatModel}
          footer={null}
          onCancel={this.cancelRole}
          destroyOnClose={true}
        >
          <Form onSubmit={this.addRole} onChange={this.handleFormChange}>
            {/*角色代码*/}
            {
              <FormItem {...formItemLayout} label={this.$t('org.role.no-dep')}>
                {getFieldDecorator('positionCode', {
                  initialValue: role.positionCode,
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                    {
                      min: 4,
                      message: this.$t('org.role.min4'), //"必须大于4位"
                    },
                    {
                      max: 9,
                      message: this.$t('org.role.max9'), //"不能超过9位"
                    },
                    {
                      type: 'number',
                      transform: value => parseInt(value),
                      message: this.$t('org.role.type-number'), //"必须是数字"
                    },
                    {
                      message: this.$t('org.role.e61'), //'角色代码第一位不能是0、1或者6'
                      validator: (rule, value, cb) => {
                        //如果不是新增不用校验代码
                        if (role.id) {
                          cb();
                          return;
                        }
                        //算是ad设计的缺陷 必须调用回调
                        let f = (value + '').charAt(0);
                        if (f + '' === '0' || f + '' === '1' || f + '' === '6') {
                          cb(false);
                        } else {
                          cb();
                        }
                      },
                    },
                  ],
                })(
                  <Input
                    disabled={typeof role.id === 'undefined' ? false : true}
                    placeholder={this.$t('org.role.e61')}
                  />
                )}
              </FormItem>
            }

            {/*角色名称*/}
            <FormItem {...formItemLayout} label={this.$t('org.role.no-person')}>
              <LanguageInput
                name={role.positionName}
                i18nName={role.i18n ? role.i18n.positionName : null}
                isEdit={role.id}
                nameChange={this.i18nChange}
              />
            </FormItem>

            {/*状态*/}
            <FormItem {...formItemLayout} label={this.$t('common.column.status')} colon={true}>
              {getFieldDecorator('enabled', {
                valuePropName: 'checked',
                initialValue: role.enabled,
              })(
                <div>
                  <Switch
                    defaultChecked={role.enabled}
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                    onChange={this.switchChange}
                  />
                  <span
                    className="enabled-type"
                    style={{
                      marginLeft: 20,
                      width: 100,
                    }}
                  >
                    {role.enabled ? this.$t('common.status.enable') : this.$t('common.disabled')}
                  </span>
                </div>
              )}
            </FormItem>
            <div className="role-list-from-footer">
              <Button onClick={this.cancelRole}>{this.$t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {this.$t('common.save')}
              </Button>
            </div>
          </Form>
        </Modal>

        <Table
          dataSource={this.state.data}
          loading={this.state.loading}
          pagination={this.state.pagination}
          onChange={this.onChangePager}
          columns={this.state.columns}
          size="middle"
          bordered
        />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />
          {/*返回*/}
          {this.$t('common.back')}
        </a>
      </div>
    );
  }
}

OrgStructureRolesList.propTypes = {};
const WrappedOrgStructureRolesList = Form.create()(OrgStructureRolesList);
export default connect(
  null,
  null,
  null,
  { withRef: true }
)(WrappedOrgStructureRolesList);
