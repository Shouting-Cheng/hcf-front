import React from 'react'
import { connect } from 'dva'
import { deepCopy} from "utils/extend"
import TagSelect from 'ant-design-pro/lib/TagSelect'
import { Form, Modal, Icon, Checkbox, List, message, Tag, Button, Spin } from 'antd'
const ListItem = List.Item;

import ListSelector from 'widget/list-selector'
import workflowService from 'containers/setting/workflow/workflow.service'
import CCService from 'containers/setting/cost-center/cost-center.service'
import PropTypes from 'prop-types';

class AddPersonModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      userVisible: false,
      userGroupVisible: false,
      hasGetCostCenter: false, //是否已获取了成本中心审批者
      allApproverType: null, //审批人类型
      costCenterApprover: null, //单据上成本中心主管审批者
      costCenterDeptApprover: null, //单据上成本中心主要部门经理审批者
      depByApplicantKeys: [],
      depByDeptKeys: [],
      costCenterKeys: [],
      costCenterDeptKeys: [],
      containsApportionmentDepartmentManager: false, //分摊组织领导会签
      containsApportionmentCostCenterManager: false, //分摊成本中心经理会签
      containsApportionmentCostCenterPrimaryDepartmentManager: false, //分摊后，对应的部门经理会签
      directManager: false,
      apiReturnApprover: false,
      approveUser: [], //指定人员审批
      approveUserGroup: [], //指定人员组审批
      defaultApproveUserOID: [], //默认审批人员OID
      defaultApproveUserGroupOID: [], //默认审批人员组OID
      approverNotChange: true, //审批人没有发生改变
    }
  }

  componentDidMount() {
    this.getApproverType();
    this.setDefaultUserAndGroup(this.props.ruleApprovers || [])
  }

  componentWillReceiveProps(nextProps) {
    !this.state.hasGetCostCenter && this.getCostCenterApprover();
    this.setDefaultUserAndGroup(nextProps.ruleApprovers || []);
    this.setState({
      hasGetCostCenter: !!this.props.formInfo.customFormFields,
      depByApplicantKeys: [],
      depByDeptKeys: [],
      costCenterKeys: [],
      costCenterDeptKeys: [],
      containsApportionmentDepartmentManager: false,
      containsApportionmentCostCenterManager: false,
      containsApportionmentCostCenterPrimaryDepartmentManager: false,
      directManager: false,
      apiReturnApprover: false
    })
  }

  //获取审批人类型
  getApproverType = () => {
    this.setState({ loading: true });
    workflowService.getApproverType().then(res => {
      this.setState({ loading: false, allApproverType: res.data })
    }).catch(() => {
      message.error(this.$t('common.error1'))
    })
  };

  //获取单据上成本中心主管审批者
  getCostCenterApprover = () => {
    let costCenterFields = [];
    let costCenterApprover = [];
    let costCenterDeptApprover = [];
    (this.props.formInfo.customFormFields || []).map(item => {
      if (item.messageKey === 'select_cost_center')
        costCenterFields.push(item)
    });
    Promise.all(
      costCenterFields.map(item => {
        let costCenterItem = {
          code: null,
          name: null,
          key: 6002,
          remark: '按单据上的成本中心经理审批',
          ruleApprovalNodeOID: null,
          approverEntityOID: null,
          value: item.fieldName
        };
        if (item.dataSource && JSON.parse(item.dataSource)) {
          costCenterItem.approverEntityOID = JSON.parse(item.dataSource).costCenterOID;
          if (costCenterItem.approverEntityOID) {
            return new Promise((resolve, reject) => {
              CCService.getCostCenterDetail(costCenterItem.approverEntityOID).then(res => {
                costCenterItem.value = res.data.name;
                resolve(costCenterItem)
              }).catch(e => {
                reject(e)
              })
            })
          } else {
            return costCenterItem
          }
        }
      })
    ).then(approver => {
      costCenterDeptApprover = deepCopy(approver);
      costCenterDeptApprover.map((item, index) => {
        costCenterDeptApprover[index].key = 6004;
        costCenterDeptApprover[index].remark = '按单据上的成本中心的主要部门经理审批'
      });
      this.setState({ costCenterApprover: approver, costCenterDeptApprover })
    })
  };

  //设置默认的审批人员和人员组
  setDefaultUserAndGroup = (ruleApprovers) => {
    let approveUser = [];
    let approveUserGroup = [];
    let defaultApproveUserOID = [];
    let defaultApproveUserGroupOID = [];
    ruleApprovers.map(item => {
      if (item.approverType === 6001) {
        item.userOID = item.approverEntityOID;
        item.fullName = item.name;
        approveUser.push(item);
        defaultApproveUserOID.push(item.approverEntityOID)
      } else if (item.approverType === 6003) {
        item.userGroupOID = item.approverEntityOID;
        approveUserGroup.push(item);
        defaultApproveUserGroupOID.push(item.approverEntityOID)
      }
    });
    this.setState({ approveUser, approveUserGroup, defaultApproveUserOID, defaultApproveUserGroupOID })
  };

  //新增指定人员审批
  handleAddUser = (value) => {
    this.setState({
      userVisible: false,
      approveUser: value.result || []
    })
  };

  //删除指定人员审批
  handleDeleteUser = (userOID) => {
    let approveUser = this.state.approveUser;
    let defaultApproveUserOID = this.state.defaultApproveUserOID;
    defaultApproveUserOID.delete(userOID);
    approveUser && approveUser.map((item, index) => {
      if (item.userOID === userOID) {
        approveUser.splice(index, 1);
        item.ruleApproverOID && this.props.onDelete(item)
      }
    });
    this.setState({ approveUser, defaultApproveUserOID, approverNotChange: false })
  };

  //新增指定人员组审批
  handleAddUserGroup = (value) => {
    this.setState({
      userGroupVisible: false,
      approveUserGroup: value.result
    })
  };

  //删除指定人员组审批
  handleDeleteUserGroup = (oid) => {
    let approveUserGroup = this.state.approveUserGroup;
    let defaultApproveUserGroupOID = this.state.defaultApproveUserGroupOID;
    defaultApproveUserGroupOID.delete(oid);
    approveUserGroup && approveUserGroup.map((item, index) => {
      if (item.userGroupOID === oid) {
        approveUserGroup.splice(index, 1);
        item.ruleApproverOID && this.props.onDelete(item)
      }
    });
    this.setState({ approveUserGroup, defaultApproveUserGroupOID, approverNotChange: false })
  };

  //点击"确定"
  handleOK = () => {
    const { ruleApprovalNodeOID } = this.props;
    const { allApproverType, costCenterApprover, costCenterDeptApprover, depByApplicantKeys, depByDeptKeys, costCenterKeys,
      costCenterDeptKeys, directManager, apiReturnApprover, containsApportionmentDepartmentManager,
      containsApportionmentCostCenterManager, containsApportionmentCostCenterPrimaryDepartmentManager,
      approveUser, approveUserGroup, defaultApproveUserOID, defaultApproveUserGroupOID } = this.state;
    let params = [];
    depByApplicantKeys.map(key => {
      allApproverType['RuleEnumDTO(key=0, value=按申请人所在的组织架构审批, remark=)'].map(item => {
        if (item.key === key) {
          params.push({
            departmentType: 1,
            code: null,
            name: item.value,
            remark: item.remark,
            approverType: key,
            level: 1,
            ruleApprovalNodeOID
          })
        }
      })
    });
    depByDeptKeys.map(key => {
      allApproverType['RuleEnumDTO(key=0, value=按单据上的组织架构审批, remark=)'].map(item => {
        if (item.key === key) {
          params.push({
            departmentType: 2,
            code: null,
            name: item.value,
            remark: item.remark,
            approverType: key,
            level: 1,
            ruleApprovalNodeOID,
            containsApportionmentDepartmentManager
          })
        }
      })
    });
    costCenterKeys.map(oid => {
      costCenterApprover.map(item => {
        if (item.approverEntityOID === oid) {
          params.push({
            code: item.code,
            remark: item.remark,
            name: item.value,
            approverType: 6002,
            approverEntityOID: oid,
            ruleApprovalNodeOID,
            containsApportionmentCostCenterManager
          })
        }
      })
    });
    costCenterDeptKeys.map(oid => {
      costCenterDeptApprover.map(item => {
        if (item.approverEntityOID === oid) {
          params.push({
            code: item.code,
            remark: item.remark,
            name: item.value,
            approverType: 6004,
            approverEntityOID: oid,
            ruleApprovalNodeOID,
            level: 1,
            containsApportionmentCostCenterPrimaryDepartmentManager
          })
        }
      })
    });
    directManager && params.push({
      approverType: 6100,
      ruleApprovalNodeOID,
      departmentType: 1,
      name: "直属领导",
      level: 1,
    });
    apiReturnApprover && params.push({
      approverType: 1004,
      ruleApprovalNodeOID,
      name: "外部接口"
    });
    approveUser && approveUser.map(item => {
      let itemHasExist = false;
      defaultApproveUserOID.map(oid => {
        item.userOID === oid && (itemHasExist = true)
      });
      !itemHasExist && params.push({
        approverType: 6001,
        ruleApprovalNodeOID,
        name: item.fullName,
        approverEntityOID: item.userOID
      })
    });
    approveUserGroup && approveUserGroup.map(item => {
      let itemHasExist = false;
      defaultApproveUserGroupOID.map(oid => {
        item.userGroupOID === oid && (itemHasExist = true)
      });
      !itemHasExist && params.push({
        approverType: 6003,
        ruleApprovalNodeOID,
        name: item.name,
        approverEntityOID: item.userGroupOID
      })
    });
    this.handleAddApprover(params)
  };

  //添加审批人
  handleAddApprover = (params) => {
    let { approveUser, approveUserGroup, defaultApproveUserOID, defaultApproveUserGroupOID } = this.state;
    if (params.length) {
      workflowService.createApprovers(params).then(res => {
        res.data && res.data.map(item => {
          if (item.approverType === 6001) {
            approveUser.map((userItem, index) => {
              userItem.userOID === item.approverEntityOID && (approveUser[index].ruleApproverOID = item.ruleApproverOID)
            });
            defaultApproveUserOID.push(item.approverEntityOID)
          }
          if (item.approverType === 6003) {
            approveUserGroup.map((groupItem, index) => {
              groupItem.userGroupOID === item.approverEntityOID && (approveUserGroup[index].ruleApproverOID = item.ruleApproverOID)
            });
            defaultApproveUserGroupOID.push(item.approverEntityOID)
          }
        });
        this.setState({ defaultApproveUserOID, defaultApproveUserGroupOID });
        message.success(this.$t('common.operate.success'));
        this.props.onSelect()
      })
    } else {
      this.props.onSelect(this.state.approverNotChange)
    }
  };

  render() {
    const { visible, personType } = this.props;
    const { loading, userVisible, userGroupVisible, approveUser, approveUserGroup, depByApplicantKeys, depByDeptKeys, costCenterKeys, costCenterDeptKeys,
      containsApportionmentDepartmentManager, containsApportionmentCostCenterManager, containsApportionmentCostCenterPrimaryDepartmentManager,
      directManager, apiReturnApprover, allApproverType, costCenterApprover, costCenterDeptApprover } = this.state;
    return (
      <div className='add-person-modal'>
        <div className="select-person-modal-container"/>
        <Modal title={personType === 1 ? this.$t('workflow.detail.select.approver'/*请选择审批人员*/) : this.$t('workflow.detail.select.informer'/*请选择知会人员*/)}
               visible={visible}
               width={550}
               closable={false}
               getContainer={() => {
                 return document.getElementsByClassName("select-person-modal-container")[0];
               }}
               footer={<Button type="primary" onClick={this.handleOK}>{this.$t('common.ok')}</Button>}
        >
          <Spin spinning={loading}>
            <List itemLayout="horizontal">
              <ListItem className="dep-by-applicant">
                <h4>
                  {personType === 1 ? this.$t('workflow.detail.approve.by.leader'/*按申请人所在的组织架构审批*/) :
                    this.$t('workflow.detail.notify.by.leader'/*按申请人所在的组织架构知会*/)}
                </h4>
                <TagSelect value={depByApplicantKeys} onChange={value => this.setState({depByApplicantKeys: value})}>
                  {(allApproverType && allApproverType['RuleEnumDTO(key=0, value=按申请人所在的组织架构审批, remark=)'] || []).map(item => (
                    <TagSelect.Option value={item.key} key={item.key}>{item.value}</TagSelect.Option>
                  ))}
                </TagSelect>
              </ListItem>
              <ListItem className="dep-by-bill">
                <div>
                  <h4>
                    {personType === 1 ? this.$t('workflow.detail.approve.by.organization'/*按单据上的组织架构审批*/) :
                      this.$t('workflow.detail.notify.by.organization'/*按单据上的组织架构知会*/)}
                  </h4>
                  <Checkbox checked={containsApportionmentDepartmentManager}
                            onChange={e => this.setState({containsApportionmentDepartmentManager: e.target.checked})}>
                    {personType === 1 ? this.$t('workflow.detail.approve.dept'/*分摊组织领导会签*/) :
                      this.$t('workflow.detail.notify.dept'/*知会分摊组织领导*/)}
                  </Checkbox>
                </div>
                <TagSelect value={depByDeptKeys} onChange={value => this.setState({depByDeptKeys: value})}>
                  {(allApproverType && allApproverType['RuleEnumDTO(key=0, value=按单据上的组织架构审批, remark=)'] || []).map(item => (
                    <TagSelect.Option value={item.key} key={item.key}>{item.value}</TagSelect.Option>
                  ))}
                </TagSelect>
              </ListItem>
              {costCenterApprover && !!costCenterApprover.length && (
                <ListItem className="cost-center">
                  <div>
                    <h4>
                      {personType === 1 ? this.$t('workflow.detail.approve.by.costCenter.manager'/*按单据上的成本中心经理审批*/) :
                        this.$t('workflow.detail.notify.by.costCenter.manager'/*按单据上的成本中心经理知会*/)}
                    </h4>
                    <Checkbox checked={containsApportionmentCostCenterManager}
                              onChange={e => this.setState({containsApportionmentCostCenterManager: e.target.checked})}>
                      {personType === 1 ? this.$t('workflow.detail.approve.costCenter'/*分摊成本中心经理会签*/) :
                        this.$t('workflow.detail.notify.costCenter'/*知会分摊成本中心经理*/)}
                    </Checkbox>
                  </div>
                  <TagSelect value={costCenterKeys} onChange={values => this.setState({costCenterKeys: values})}>
                    {costCenterApprover.map(item => (
                      <TagSelect.Option value={item.approverEntityOID} key={item.approverEntityOID}>{item.value}</TagSelect.Option>
                    ))}
                  </TagSelect>
                </ListItem>
              )}
              {costCenterDeptApprover && !!costCenterDeptApprover.length && (
                <ListItem className="cost-center-dept">
                  <div>
                    <h4>
                      {personType === 1 ? this.$t('workflow.detail.approve.by.costCenter.dept.manager'/*按单据上的成本中心的主要部门经理审批*/) :
                        this.$t('workflow.detail.notify.by.costCenter.dept.manager'/*按单据上的成本中心的主要部门经理知会*/)}
                    </h4>
                    <Checkbox checked={containsApportionmentCostCenterPrimaryDepartmentManager}
                              onChange={e => this.setState({containsApportionmentCostCenterPrimaryDepartmentManager: e.target.checked})}>
                      {personType === 1 ? this.$t('workflow.detail.approve.dept.manager'/*分摊后，对应的部门经理会签*/) :
                        this.$t('workflow.detail.notify.dept.manager'/*分摊后，知会对应的部门经理*/)}
                    </Checkbox>
                  </div>
                  <TagSelect value={costCenterDeptKeys} onChange={values => this.setState({costCenterDeptKeys: values})}>
                    {costCenterDeptApprover.map(item => (
                      <TagSelect.Option value={item.approverEntityOID} key={item.approverEntityOID}>{item.value}</TagSelect.Option>
                    ))}
                  </TagSelect>
                </ListItem>
              )}
              <ListItem className="direct-manager">
                <div>
                  <h4>{this.$t('workflow.detail.leader')/*直属领导*/}</h4>
                  <span>{this.$t('workflow.detail.leader.info')/*指申请人的人员信息中【直属领导】*/}</span>
                </div>
                <Checkbox checked={directManager} onChange={e => this.setState({directManager: e.target.checked})}>
                  {personType === 1 ? this.$t('workflow.detail.join.approve'/*参与审批*/) : this.$t('workflow.detail.notify'/*知会*/)}
                </Checkbox>
              </ListItem>
              <ListItem className="user-approver">
                <div>
                  <h4>
                    {personType === 1 ? this.$t('workflow.detail.approve.person'/*指定人员审批*/) :
                      this.$t('workflow.detail.notify.person'/*知会指定人员*/)}
                  </h4>
                  <a onClick={() => {this.setState({userVisible: true})}}>
                    <Icon type="plus-circle"/> {this.$t('workflow.detail.select.person')/*选择人员*/}
                  </a>
                </div>
                {approveUser && approveUser.map(item =>
                  <Tag key={item.userOID} closable onClose={() => this.handleDeleteUser(item.userOID)}>{item.fullName}</Tag>
                )}
              </ListItem>
              <ListItem className="user-group-approver">
                <div>
                  <h4>
                    {personType === 1 ? this.$t('workflow.detail.approve.person.group'/*指定人员组审批*/) :
                      this.$t('workflow.detail.notify.person.group'/*知会指定人员组*/)}
                  </h4>
                  <a onClick={() => {this.setState({userGroupVisible: true})}}>
                    <Icon type="plus-circle" /> {this.$t('workflow.detail.select.person.group')/*选择人员组*/}
                  </a>
                </div>
                <div style={{marginBottom: 5}}>{this.$t('workflow.detail.user.group.tip')/*只能引用到人员组中"按人员添加"的人，无法获取到"按照条件添加"的人。*/}</div>
                {approveUserGroup && approveUserGroup.map(item =>
                  <Tag key={item.userGroupOID} closable onClose={() => this.handleDeleteUserGroup(item.userGroupOID)}>{item.name}</Tag>
                )}
              </ListItem>
              <ListItem className="api-return-approver">
                <h4>
                  {personType === 1 ? this.$t('workflow.detail.api.back.approve'/*接口返回审批人*/) :
                    this.$t('workflow.detail.api.back.notify'/*接口返回知会人*/)}
                </h4>
                <Checkbox checked={apiReturnApprover} onChange={e => this.setState({apiReturnApprover: e.target.checked})}>
                  {personType === 1 ? this.$t('workflow.detail.return.approve.result'/*当满足审批条件时，节点调用对应地址的接口，返回审批结果*/) :
                    this.$t('workflow.detail.return.notify.result'/*当满足知会条件时，节点调用对应地址的接口，返回知会结果*/)}
                </Checkbox>
              </ListItem>
            </List>
          </Spin>
        </Modal>

        <ListSelector visible={userVisible}
                      type="user"
                      valueKey="userOID"
                      labelKey="fullName"
                      onlyNeed="userOID"
                      showDetail
                      extraParams={{roleType: 'TENANT'}}
                      selectedData={approveUser}
                      onOk={this.handleAddUser}
                      onCancel={() => {this.setState({userVisible: false})}}
        />
        <ListSelector visible={userGroupVisible}
                      type="user_group"
                      valueKey="userGroupOID"
                      labelKey="name"
                      selectedData={approveUserGroup}
                      onOk={this.handleAddUserGroup}
                      onCancel={() => {this.setState({userGroupVisible: false})}}
        />
      </div>
    )
  }
}

AddPersonModal.propTypes = {
  visible: PropTypes.bool,
  personType: PropTypes.number, //1 审批，2 知会
  ruleApprovers: PropTypes.array,
  ruleApprovalNodeOID: PropTypes.string,
  formInfo: PropTypes.object,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
};

function mapStateToProps(state) {
  return {

  }
}

const wrappedAddPersonModal = Form.create()(AddPersonModal);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedAddPersonModal)