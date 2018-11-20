/**
 * Created by zhouli on 18/1/30
 * Email li.zhou@huilianyi.com
 * 组织架构部门角色
 * 两种状态，编辑与非编辑
 */
import React from 'react';
// import { deepCopy, deepFullCopy } from 'utils/extend';
import 'styles/enterprise-manage/org-structure/org-component/org-roles.scss';
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';
import { Button, Icon, Menu, Dropdown, message, Popover } from 'antd';
import ListSelector from 'components/Widget/list-selector.js';
//需要在这个里面去配置弹窗类型
import chooserData from 'share/chooserData';
import PropTypes from 'prop-types';
import { LanguageInput } from 'components/Widget/index';
import { fitText } from 'utils/extend';
//点击取消时用
class OrgStructureRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      selectedKeysDepDataByApi: {},
      editing: false,
      showListSelector: false, //弹窗是否显示
      extraParams: {
        //弹窗额外的参数
        excludeList: [],
        systemCustomEnumerationType: '', // systemCustomEnumerationType 代表类型，1001 type,1002 duty , 1008 级别
      },
      selectorItem: chooserData['user'], //弹窗显示配置
      currentRole: {}, //当前被选中的角色
    };
  }

  componentWillMount() {
    this.setState({ selectedKeysDepDataByApi: this.props.selectedKeysDepDataByApi });
  }

  componentDidMount() {
    this.setState({ selectedKeysDepDataByApi: this.props.selectedKeysDepDataByApi }, () => {
      let codeClass = 'f-left roles-title-text';
      let codeDisabled = false;
      if (this.state.selectedKeysDepDataByApi.custDeptNumber) {
        codeClass = 'f-left roles-title-text roles-title-text-disabled';
        codeDisabled = true;
      }
      this.setState({
        codeDisabled,
        codeClass,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selectedKeysDepDataByApi: nextProps.selectedKeysDepDataByApi }, () => {
      let codeClass = 'f-left roles-title-text';
      let codeDisabled = false;
      if (this.state.selectedKeysDepDataByApi.custDeptNumber) {
        codeClass = 'f-left roles-title-text roles-title-text-disabled';
        codeDisabled = true;
      }
      this.setState({
        codeDisabled,
        codeClass,
      });
    });
  }

  //处理条件添加弹框点击ok,添加值
  handleListOk = result => {
    const arr = result.result;
    let currentRole = this.state.currentRole;
    currentRole.userOID = arr[0].userOID;
    currentRole.userName = arr[0].fullName;
    this.setCurrentRoleToOriginDep(currentRole);
    //关闭弹窗
    this.handleCancel();
  };

  //把选中的角色还原
  setCurrentRoleToOriginDep = role => {
    let roles = this.state.selectedKeysDepDataByApi;
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].id === role.id) {
        roles[i] = role;
      }
    }
    this.setState({
      selectedKeysDepDataByApi: roles,
    });
  };
  //控制是否弹出条件添加弹窗
  handleCancel = () => {
    this.setState({ showListSelector: false, saving: false });
  };
  //添加人员
  selectRoleUser = role => {
    this.setState({
      currentRole: role,
    });
    this.setState({ showListSelector: true });
  };
  //移除角色
  removeRoleUser = item => {
    item.userOID = '';
    item.userName = '';
    this.setCurrentRoleToOriginDep(item);
  };
  editRoles = () => {
    let codeClass = 'f-left roles-title-text';
    let codeDisabled = false;
    if (this.state.selectedKeysDepDataByApi.custDeptNumber) {
      codeClass = 'f-left roles-title-text roles-title-text-disabled';
      codeDisabled = true;
    }
    this.setState(
      {
        editing: true,
        codeDisabled,
        codeClass,
      },
      () => {
        this.props.emitIsEdit(this.state.editing);
      }
    );
  };
  cancelRoleHandle = () => {
    this.setState(
      {
        editing: false,
      },
      () => {
        this.props.emitIsEdit(this.state.editing, this.state.selectedKeysDepDataByApi);
      }
    );
  };
  checkManagerIsOk = () => {
    if (this.props.managerIsRequired) {
      let roleList = this.state.selectedKeysDepDataByApi.departmentPositionDTOList;
      for (let i = 0; i < roleList.length; i++) {
        if (roleList[i].positionCode === '6101') {
          if (
            roleList[i].userOID === null ||
            roleList[i].userOID === '' ||
            roleList[i].userOID === undefined
          ) {
            return false;
          }
        }
      }
      return true;
    } else {
      return true;
    }
  };
  confirmRoleHandle = () => {
    //校验一下部门编码
    // if(!validCode(this.state.selectedKeysDepDataByApi.custDeptNumber,100)){
    // 部门代码数字与字母，长度不能超过100
    // message.error(this.$t('org-new-dep.dep-code-reg'));
    // return;
    // }
    if (this.checkManagerIsOk()) {
      this.setState({
        loading: true,
      });
      OrgService.updateDep(this.state.selectedKeysDepDataByApi)
        .then(res => {
          console.log(res);
          let dep = this.state.selectedKeysDepDataByApi;
          dep.custDeptNumber = res.data.custDeptNumber;
          this.props.updateDepSuccess();
          this.setState(
            {
              selectedKeysDepDataByApi: dep,
              editing: false,
              loading: false,
            },
            () => {
              this.props.emitIsEdit(this.state.editing);
            }
          );
        })
        .catch(() => {
          this.setState({
            loading: false,
          });
        });
    } else {
      // 请填写部门经理/
      message.error(this.$t('org.roles.please-input-manager'));
    }
  };
  //停用该部门
  disabledDep = () => {
    this.props.disabledDep(this.state.selectedKeysDepDataByApi);
  };
  //启用该部门
  enabledDep = (item) => {
    this.props.enabledDep(item, item);
  }
  //创建子部门
  createChildDep = e => {
    this.props.clickMeunNewChildDep(e, this.props.selectedKeysDepData);
  };
  //组织架构部门详情菜单
  renderRoleMoreMeun = (item) => {
    debugger;
    return (
      <Menu>
        <Menu.Item key="0">
          <div
            onClick={() => {
              this.editRoles();
            }}
          >
            {/*编辑*/}
            {this.$t('org.roles.edit')}
          </div>
        </Menu.Item>
        {item.status + "" === "101" ? <Menu.Item key="1">
          <div
            onClick={event => {
              this.disabledDep();
            }}
          >
            {/*停用该部门*/}
            {this.$t('org.roles.disabled')}
          </div>
        </Menu.Item>
        : 
        <Menu.Item key="1">
        <div
         onClick={event => {
          this.enabledDep(item)
        }}
        >
          {/*启用该部门*/}
          {this.$t('org.roles.enabled')}
        </div>
      </Menu.Item>}
        

        <Menu.Item key="2">
          <div
            onClick={event => {
              this.createChildDep(event);
            }}
          >
            {/*创建子部门*/}
            {this.$t('org.roles.create-child-dep')}
          </div>
        </Menu.Item>
      </Menu>
    );
  };
  //渲染角色
  renderRole = roles => {
    if (roles && roles.length > 0) {
      return roles.map(item => {
        return (
          <div key={item.id} className="role-item">
            <div className="role-item-position">{item.positionName}:</div>
            <div className="role-item-user">{item.userName}</div>
            <div className="clear" />
          </div>
        );
      });
    } else {
      return <div />;
    }
  };
  //渲染编辑状态角色
  renderRoleEditing = roles => {
    if (roles && roles.length > 0) {
      return roles.map(item => {
        return (
          <div key={item.id} className="role-item">
            <div className="role-item-position">{item.positionName}:</div>
            <div className="role-item-user">
              {/*请选择的节点需要重新渲染加className*/}
              <div
                className="f-left user-name"
                onClick={() => {
                  this.selectRoleUser(item);
                }}
              >
                {this.renderRoleEditingUserName(item)}{' '}
              </div>
              <div
                className="f-right remove"
                onClick={() => {
                  this.removeRoleUser(item);
                }}
              >
                <Icon type="close" />
              </div>
            </div>
            <div className="clear" />
          </div>
        );
      });
    } else {
      return <div />;
    }
  };
  renderRoleEditingUserName = item => {
    if (item.userName) {
      return <div>{item.userName}</div>;
    } else {
      return (
        <div className="please-select">
          {/*请选择*/}
          {this.$t('org.roles.please-select')}
        </div>
      );
    }
  };
  depNameChange = e => {
    let dep = this.state.selectedKeysDepDataByApi;
    dep.name = e.target.value;
    this.setState({
      selectedKeysDepDataByApi: dep,
    });
  };
  i18nChange = (name, i18nName) => {
    let dep = this.state.selectedKeysDepDataByApi;
    dep.name = name;
    dep.i18n = {
      name: i18nName,
    };
    this.setState({
      selectedKeysDepDataByApi: dep,
    });
  };
  depCustDeptNumberChange = e => {
    let dep = this.state.selectedKeysDepDataByApi;
    let code = e.target.value;
    code = code.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, '');
    dep.custDeptNumber = code;
    this.setState({
      selectedKeysDepDataByApi: dep,
    });
  };
  renderRoleMoreMeunByRole = (item) => {
    if (this.props.ROLE_TENANT_ADMIN && this.props.CREATE_DATA_TYPE) {
      return (
        <div>
          <Dropdown overlay={this.renderRoleMoreMeun(item)} trigger={['click']}>
            <a className="ant-dropdown-link" href="#">
              <Icon type="setting" />
            </a>
          </Dropdown>
        </div>
      );
    } else {
      return <div />;
    }
  };
  //渲染字段的内容，根据情况进行截取，鼠标浮动有提示
  renderNoEditingText = text => {
    let _text = fitText(text, 13);
    if (_text.text) {
      return (
        <Popover placement="topLeft" content={_text.origin}>
          <span>{_text.text}</span>
        </Popover>
      );
    } else {
      return text;
    }
  };
  render() {
    let rolesWrap = '';
    let rolesTitleWrap = '';
    if (this.state.editing) {
      rolesTitleWrap = (
        <div className="f-left">
          <div className="f-left roles-title">
            {/*部门名称：*/}
            {this.$t('org.roles.dep-name')}
          </div>

          <div className="f-left roles-title-text">
            <LanguageInput
              name={this.state.selectedKeysDepDataByApi.name}
              i18nName={this.state.selectedKeysDepDataByApi.i18n.name}
              isEdit={true}
              nameChange={this.i18nChange}
            />
          </div>

          <div className="f-left roles-title">
            {/*部门编码：*/}
            {this.$t('org.roles.dep-code')}
          </div>
          <input
            className="f-left roles-title-text"
            key={'custDeptNumber'}
            onChange={this.depCustDeptNumberChange}
            value={
              this.state.selectedKeysDepDataByApi.custDeptNumber
                ? this.state.selectedKeysDepDataByApi.custDeptNumber
                : ''
            }
            placeholder={this.$t('org.roles.please-input') /*请输入*/}
          />
          <div className="clear" />
        </div>
      );
      rolesWrap = (
        <div className="roles-wrap-editing">
          {this.renderRoleEditing(this.state.selectedKeysDepDataByApi.departmentPositionDTOList)}
          <div className="clear" />
          <div className="btn-wrap">
            <Button type="primary" loading={this.state.loading} onClick={this.confirmRoleHandle}>
              {this.$t('common.save') /*保存*/}
            </Button>
            <Button type="danger" onClick={this.cancelRoleHandle}>
              {this.$t('common.cancel') /*取消*/}
            </Button>
          </div>
        </div>
      );
    } else {
      rolesTitleWrap = (
        <div className="f-left">
          <div className="f-left roles-title">
            {/*部门名称：*/}
            {this.$t('org.roles.dep-name')}
          </div>
          <div className="f-left roles-title-text">
            {this.renderNoEditingText(this.state.selectedKeysDepDataByApi.name)}
          </div>
          <div className="f-left roles-title">
            {/*部门编码：*/}
            {this.$t('org.roles.dep-code')}
          </div>
          <div className="f-left roles-title-text">
            {this.renderNoEditingText(this.state.selectedKeysDepDataByApi.custDeptNumber)}
          </div>
          <div className="clear" />
        </div>
      );
      rolesWrap = (
        <div className="roles-wrap">
          {this.renderRole(this.state.selectedKeysDepDataByApi.departmentPositionDTOList)}
          <div className="clear" />
        </div>
      );
    }
    return (
      <div className="org-structure-roles">
        <div className="roles-title-wrap">
          {rolesTitleWrap}
          <div className="f-right">{this.renderRoleMoreMeunByRole(this.props.selectedKeysDepData)}</div>
          <div className="clear" />
        </div>
        {rolesWrap}
        <ListSelector
          single={true}
          visible={this.state.showListSelector}
          onOk={this.handleListOk}
          onCancel={this.handleCancel}
          extraParams={this.state.extraParams}
          selectorItem={this.state.selectorItem}
        />
      </div>
    );
  }
}

OrgStructureRoles.propTypes = {
  ROLE_TENANT_ADMIN: PropTypes.bool,
  CREATE_DATA_TYPE: PropTypes.bool,
  emitIsEdit: PropTypes.func.isRequired, //改变编辑状态的回调
  managerIsRequired: PropTypes.bool, //部门经理是否必填
  clickMeunNewChildDep: PropTypes.func, //点击创建子部门的回调
  disabledDep: PropTypes.func, //点击禁用的回调
  updateDepSuccess: PropTypes.func, //修改成功的
  selectedKeysDepDataByApi: PropTypes.object.isRequired, //被选择了的部门数据通过api
  selectedKeysDepData: PropTypes.object.isRequired, //被选择了的部门数据
  selectedKeys: PropTypes.array.isRequired, //被选择了的部门
};
export default OrgStructureRoles;
