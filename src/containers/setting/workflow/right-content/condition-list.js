import React from 'react'
import { connect } from 'dva'
import { deepCopy } from "utils/extend"
import constants from "share/constants"
import Ellipsis from 'ant-design-pro/lib/Ellipsis'
import { Form, Select, message, List, Popconfirm, Tag, Spin, Card } from 'antd'
const Option = Select.Option;
const ListItem = List.Item;
import PropTypes from 'prop-types';

import ConditionForm from 'containers/setting/workflow/right-content/condition-form'
import AddApproveRuleModal from 'containers/setting/workflow/right-content/add-rule-modal'
import workflowService from 'containers/setting/workflow/workflow.service'
import baseService from 'share/base.service'

class NodeConditionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ruleApprovalNodeOID: '',
      approvalAndDepLevel: [  //审批级别 部门层级
        {id: 1, name: this.$t('workflow.detail.level1st'), depLevel: this.$t('workflow.detail.level1')},
        {id: 2, name: this.$t('workflow.detail.level2nd'), depLevel: this.$t('workflow.detail.level2')},
        {id: 3, name: this.$t('workflow.detail.level3rd'), depLevel: this.$t('workflow.detail.level3')},
        {id: 4, name: this.$t('workflow.detail.level4th'), depLevel: this.$t('workflow.detail.level4')},
        {id: 5, name: this.$t('workflow.detail.level5th'), depLevel: this.$t('workflow.detail.level5')},
        {id: 6, name: this.$t('workflow.detail.level6th'), depLevel: this.$t('workflow.detail.level6')},
        {id: 7, name: this.$t('workflow.detail.level7th'), depLevel: this.$t('workflow.detail.level7')},
        {id: 8, name: this.$t('workflow.detail.level8th'), depLevel: this.$t('workflow.detail.level8')},
        {id: 9, name: this.$t('workflow.detail.level9th'), depLevel: this.$t('workflow.detail.level9')},
        {id: 10, name: this.$t('workflow.detail.level10th'), depLevel: this.$t('workflow.detail.level10')}
      ],
      expenseTypeList: [], //费用类型
      departmentList: [], //部门
      costCenterList: [], //成本中心
      companyList: [], //公司控件
      entityList: [], //法人实体
      valueList: [], //值列表
      formFieldList: null, //表单条件字段 字段类型(100默认, 101文本, 102整数, 103日期, 104浮点数, 105日期, 106值列表, 107GPS, 108布尔)
      formFieldCostCenterList: null, //审批条件为成本中心属性字段
      defaultAdditionOID: [], //默认审批条件的OID
      ruleApprovers: deepCopy(this.props.basicInfo.ruleApprovers) || [], //审批人
      symbolsType: [], //条件操作符
      approverOIDForAddRule: '', //审批人OID，用于添加审批条件modal
      batchCode: null, //审批条件的batchCode，用于添加审批条件modal
      isRuleInEdit: false, //是否有审批条件处于编辑状态
      deleteTagValue: {}, //审批条件中删除的值列表的值 {remark: '', value: ''}
      modalVisible: false,
    }
  }

  componentDidMount() {
    this.setState({
      ruleApprovalNodeOID: this.props.basicInfo.ruleApprovalNodeOID,
      loading: true
    });
    Promise.all([
      this.getExpenseTypeList(),
      this.getDepartmentList(),
      this.getAllSymbolsType(),
      this.getCostCenterList(),
      this.getCompanyList(),
      this.getEntityList(),
      this.getValueList()
    ]).then(() => {
      this.setState({ loading: false })
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.ruleApprovalNodeOID !== nextProps.basicInfo.ruleApprovalNodeOID) { //改变节点
      this.setState({
        ruleApprovalNodeOID: nextProps.basicInfo.ruleApprovalNodeOID,
        ruleApprovers: deepCopy(nextProps.basicInfo.ruleApprovers) || []
      },() => {
        this.props.form.resetFields();
        this.setState({ loading: true });
        Promise.all([
          this.getExpenseTypeList(),
          this.getDepartmentList(),
          this.getCostCenterList(),
          this.getCompanyList(),
          this.getEntityList(),
          this.getValueList()
        ]).then(() => {
          this.setState({ loading: false })
        })
      })
    } else { //节点不变，新增删除或修改审批人时需要重新获取ruleApprovers
      if (nextProps.basicInfo.ruleApprovers) {
        if (this.state.ruleApprovers.length !== nextProps.basicInfo.ruleApprovers.length) { //新增删除
          this.setState({ ruleApprovers: deepCopy(nextProps.basicInfo.ruleApprovers) || [] })
        } else { //修改人员或人员组
          let ruleApproverIsNotChange = true;
          this.state.ruleApprovers.map((item, index) => {
            if (item.ruleApproverOID !== nextProps.basicInfo.ruleApprovers[index].ruleApproverOID ||
              (item.level !== nextProps.basicInfo.ruleApprovers[index].level)) //申请人等级修改
              ruleApproverIsNotChange = false
          });
          !ruleApproverIsNotChange && this.setState({ ruleApprovers: deepCopy(nextProps.basicInfo.ruleApprovers) || [] })
        }
      }
    }
  }

  //获取所有的条件操作符
  getAllSymbolsType = () => {
    return new Promise((resolve, reject) => {
      workflowService.getSymbolsType().then(res => {
        this.setState({ symbolsType: res.data });
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  };

  //获取费用类型列表
  getExpenseTypeList = () => {
    let ruleApprovers = deepCopy(this.props.basicInfo.ruleApprovers) || [];
    let expenseTypeOID = [];
    ruleApprovers.map(approver => {
      (approver.ruleConditionList || []).map(item => {
        if (item.remark === 'default_expense_type') { //费用类型
          item.valueDetail && JSON.parse(item.valueDetail).value.map(oid => {
            expenseTypeOID.push(oid)
          })
        }
      })
    });
    let params = {
      formOID: this.props.formOID,
      isALL: true
    };
    if (expenseTypeOID.length) {
      return new Promise((resolve, reject) => {
        baseService.getExpenseTypesByFormOIDV2(params).then(res => {
          this.setState({ expenseTypeList: res.data ? res.data.expenseTypes : [] });
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    }
  };

  //获取部门列表
  getDepartmentList = () => {
    let ruleApprovers = deepCopy(this.props.basicInfo.ruleApprovers) || [];
    let departmentOID = [];
    ruleApprovers.map(approver => {
      (approver.ruleConditionList || []).map(item => {
        if (item.remark === 'select_department') { //部门
          item.valueDetail && JSON.parse(item.valueDetail).value.map(oid => {
            departmentOID.push(oid)
          })
        }
      })
    });
    if (departmentOID.length) {
      return new Promise((resolve, reject) => {
        workflowService.getDepartmentSimpleList(departmentOID).then(res => {
          this.setState({ departmentList: res.data });
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    }
  };

  //获取成本中心列表
  getCostCenterList = () => {
    let ruleApprovers = deepCopy(this.props.basicInfo.ruleApprovers) || [];
    let costCenterOID = [];
    ruleApprovers.map(approver => {
      (approver.ruleConditionList || []).map(item => {
        if (item.remark === 'select_cost_center') { //成本中心
          item.valueDetail && JSON.parse(item.valueDetail).value.map(oid => {
            costCenterOID.push(oid)
          })
        }
      })
    });
    if (costCenterOID.length) {
      return new Promise((resolve, reject) => {
        workflowService.getBatchCostCenterList(costCenterOID).then(res => {
          this.setState({ costCenterList: res.data });
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    }
  };

  //获取公司列表
  getCompanyList = () => {
    let ruleApprovers = deepCopy(this.props.basicInfo.ruleApprovers) || [];
    let companyOID = [];
    ruleApprovers.map(approver => {
      (approver.ruleConditionList || []).map(item => {
        if (item.remark === 'select_company' || item.remark === 'default_applicant_company') { //公司控件
          item.valueDetail && JSON.parse(item.valueDetail).value.map(oid => {
            companyOID.push(oid)
          })
        }
      })
    });
    if (companyOID.length) {
      return new Promise((resolve, reject) => {
        workflowService.getBatchCompanyItemList(companyOID).then(res => {
          this.setState({ companyList: res.data });
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    }
  };

  //获取法人实体列表
  getEntityList = () => {
    let ruleApprovers = deepCopy(this.props.basicInfo.ruleApprovers) || [];
    let entityOID = [];
    ruleApprovers.map(approver => {
      (approver.ruleConditionList || []).map(item => {
        if (item.remark === 'select_corporation_entity' || item.remark === 'default_corporation_entity') { //公司控件
          item.valueDetail && JSON.parse(item.valueDetail).value.map(oid => {
            entityOID.push(oid)
          })
        }
      })
    });
    if (entityOID.length) {
      return new Promise((resolve, reject) => {
        workflowService.getBatchCorporationEntityList(entityOID).then(res => {
          this.setState({ entityList: res.data });
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    }
  };

  //获取值列表
  getValueList = () => {
    let ruleApprovers = deepCopy(this.props.basicInfo.ruleApprovers) || [];
    let valueListOID = [];
    ruleApprovers.map(approver => {
      (approver.ruleConditionList || []).map(item => {
        if (item.remark === 'cust_list') { //值列表
          item.valueDetail && JSON.parse(item.valueDetail).valueOIDs.map(oid => {
            valueListOID.push(oid)
          })
        }
      })
    });
    if (valueListOID.length) {
      return new Promise((resolve, reject) => {
        workflowService.getCustomEnumerationList(valueListOID).then(res => {
          this.setState({ valueList: res.data });
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    }
  };

  //审批条件modal
  handleAdditionModalShow = (condition, ruleApproverOID) => {
    if (!condition.length && this.state.isRuleInEdit) {
      message.warning(this.$t('workflow.detail.have.edit.condition'/*你有一个编辑中的审批条件未保存*/));
      return
    }
    let defaultAdditionOID = [];
    condition.map(rule => {
      if (rule.remark === 'cust_list') {  //成本中心属性条件的field可能会重复，因此加上refCostCenterOID区分
        defaultAdditionOID.push(rule.refCostCenterOID ? `${rule.field}_${rule.refCostCenterOID}` : rule.field)
      } else if (rule.remark === 'judge_cost_center') { //【申请人=成本中心经理】与【成本中心】的fieldOID一样，因此加上remark区分
        defaultAdditionOID.push(`${rule.field}_${rule.remark}`)
      } else {
        defaultAdditionOID.push(rule.field)
      }
    });
    this.setState({
      defaultAdditionOID,
      approverOIDForAddRule: ruleApproverOID,
      batchCode: condition[0] ? condition[0].batchCode : null,
      modalVisible: true
    })
  };

  //获取审批人员类型
  getApplicantType = (item) => {
    if (item.departmentType === 1) {
      return this.$t('workflow.detail.applicant.organization'/*申请人组织架构*/)
    } else if (item.departmentType === 2) {
      return this.$t('workflow.detail.document.organization'/*单据上组织架构*/)
    } else {
      switch(item.approverType) {
        case 6001:
          return this.$t('workflow.detail.personnel.approval'/*人员审批*/);
        case 6002:
          return this.$t('workflow.detail.document.costCenter'/*单据上的成本中心经理*/);
        case 6003:
          return this.$t('workflow.detail.personnel.group.approval'/*人员组审批*/);
        case 6004:
          return this.$t('workflow.detail.costCenter.manager'/*成本中心主要部门经理*/);
      }
    }
    return ''
  };

  //删除审批人
  handleDeleteApprover = (item) => {
    let ruleApprovers = [];
    this.state.ruleApprovers.map(approver => {
      approver.ruleApproverOID !== item.ruleApproverOID && ruleApprovers.push(approver)
    });
    this.setState({ loading: true });
    workflowService.deleteApprovers(item.ruleApproverOID).then(() => {
      this.props.onApproverChange(false);
      this.setState({ loading: false, ruleApprovers });
      message.success(this.$t('common.delete.success', {name: ''}))
    })
  };

  //新增/编辑审批条件
  handleAddCondition = (rules, batchCode) => {
    if (rules.length) {
      let ruleApprovers = this.state.ruleApprovers;
      ruleApprovers.map(approver => {
        if (approver.ruleApproverOID === this.state.approverOIDForAddRule) {
          if (batchCode) { //编辑
            let condition = [];
            rules.map(rule => {
              let ruleHasExist = false;
              approver.ruleConditions[batchCode].map(item => {
                if (
                  (item.remark === rule.remark && item.field === rule.field) &&
                  (rule.remark !== 'cust_list' || item.refCostCenterOID === rule.refCostCenterOID)
                ) {
                  ruleHasExist = true;
                  condition.push(item)
                }
              });
              !ruleHasExist && condition.push(rule)
            });
            approver.ruleConditions[batchCode] = condition
          } else { //新增
            approver.ruleConditions = approver.ruleConditions || {};
            approver.ruleConditions[9999] = rules
          }
        }
      });
      this.setState({ modalVisible: false, ruleApprovers, isRuleInEdit: true }, () => {
        this.props.judgeRuleInEdit(this.state.isRuleInEdit)
      })
    } else {
      this.setState({ modalVisible: false, isRuleInEdit: false }, () => {
        this.props.judgeRuleInEdit(this.state.isRuleInEdit)
      });
      let ruleApprovers = deepCopy(this.props.basicInfo.ruleApprovers);
      if (batchCode) {
        ruleApprovers.map(approver => {
          if (approver.ruleApproverOID === this.state.approverOIDForAddRule) {
            this.handleDeleteCondition(approver.ruleConditions[batchCode], batchCode, this.state.approverOIDForAddRule)
          }
        })
      }
      this.setState({ ruleApprovers })
    }
  };

  //删除审批条件
  handleDeleteCondition = (condition, batchCode, approverOID) => {
    let params = [];
    condition.map(item => item.ruleConditionOID && params.push(item.ruleConditionOID));
    this.setState({ loading: true });
    workflowService.deleteRuleCondition(params).then(() => {
      let ruleApprovers = this.state.ruleApprovers;
      ruleApprovers.map((approver, index) => {
        if (approver.ruleApproverOID === approverOID) {
          let ruleConditions = approver.ruleConditions;
          delete ruleConditions[batchCode];
          ruleApprovers[index].ruleConditions = ruleConditions;
        }
      });
      this.setState({ loading: false, ruleApprovers }, () => {
        this.props.basicInfo.ruleApprovers = deepCopy(this.state.ruleApprovers)
      });
      message.success(this.$t('common.delete.success', {name: ''}))
    }).catch(() => {
      this.setState({ loading: false })
    })
  };

  //审批条件 点击"编辑"
  handleEditCondition = (condition, approverIndex, conditionIndex) => {
    if (!condition[0].isEdit && this.state.isRuleInEdit) {
      message.warning(this.$t('workflow.detail.have.edit.condition'/*你有一个编辑中的审批条件未保存*/));
      return
    }
    let ruleApprovers = this.state.ruleApprovers;
    Object.keys(ruleApprovers[approverIndex].ruleConditions).map((key, index) => {
      if (index === conditionIndex) {
        ruleApprovers[approverIndex].ruleConditions[key].map((conditionItem, conditionItemIndex) => {
          ruleApprovers[approverIndex].ruleConditions[key][conditionItemIndex].isEdit = true
        })
      }
    });
    this.setState({
      ruleApprovers,
      batchCode: condition[0].batchCode,
      isRuleInEdit: true
    }, () => {
      this.props.judgeRuleInEdit(this.state.isRuleInEdit)
    })
  };

  //保存审批条件, type: new, update
  handleSaveCondition = (conditions, approverOID, type) => {
    let ruleApprovers = this.state.ruleApprovers;
    ruleApprovers.map((approver, index) => {
      if (approver.ruleApproverOID === approverOID) {
        let ruleConditions = approver.ruleConditions;
        let batchCode = conditions[0].batchCode;
        if (type === 'update') {
          ruleConditions[batchCode][0].isEdit = false;
          conditions.map(conditionItem => {
            ruleConditions[batchCode].map((ruleItem, ruleIndex) => {
              if (ruleItem.ruleConditionOID === conditionItem.ruleConditionOID) {
                ruleConditions[batchCode][ruleIndex] = conditionItem
              }
            })
          })
        } else if (type === 'new') {
          conditions[0].isEdit = false;
          ruleConditions[batchCode] = ruleConditions[batchCode] || [];
          conditions.map(conditionItem => {
            let isConditionItemExist = false;
            ruleConditions[batchCode].map((ruleItem, ruleIndex) => {
              if (
                (ruleItem.remark === conditionItem.remark && ruleItem.field === conditionItem.field) &&
                (conditionItem.remark !== 'cust_list' || ruleItem.refCostCenterOID === conditionItem.refCostCenterOID)
              ) {
                isConditionItemExist = true;
                ruleConditions[batchCode][ruleIndex] = conditionItem
              }
            });
            !isConditionItemExist && ruleConditions[batchCode].push(conditionItem)
          })
        }
        ruleConditions[9999] && delete ruleConditions[9999];
        ruleApprovers[index].ruleConditions = ruleConditions;
      }
    });
    this.setState({ ruleApprovers, isRuleInEdit: false }, () => {
      this.props.basicInfo.ruleApprovers = deepCopy(this.state.ruleApprovers);
      this.props.conditionSaveHandle(this.props.basicInfo);
      this.props.judgeRuleInEdit(this.state.isRuleInEdit)
    })
  };

  //取消编辑审批条件
  handleCancelEditCondition = () => {
    this.setState({
      ruleApprovers: deepCopy(this.props.basicInfo.ruleApprovers),
      isRuleInEdit: false
    }, () => {
      this.props.judgeRuleInEdit(this.state.isRuleInEdit)
    })
  };

  //删除值列表的值
  handleDeleteValueItem = (e, remark, value) => {
    e.preventDefault();
    this.setState({
      deleteTagValue: {remark, value}
    })
  };

  //渲染审批条件的值
  renderConditionItem = (item, isEdit) => {
    switch(item.remark) {
      case 'default_department_level': //部门层级
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((code, index) => (
          this.state.approvalAndDepLevel.map(level => {
            if (String(level.id) === String(code))
              return isEdit ? this.renderConditionCustListTag(index, 'default_department_level', level.depLevel, code) :
                `${level.depLevel}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
          })
        ));
      case 'default_department_path': //部门路径
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((depName, index) => {
          let departmentOID = JSON.parse(item.valueDetail).valueOIDs[index];
          return isEdit ? this.renderConditionCustListTag(index, 'default_department_path', depName, departmentOID) :
            `${depName}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
        });
      case 'default_department_role': //部门角色
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((id, index) => (
          JSON.parse(item.fieldContent || '[]').map(field => {
            if (field.id === id)
              return isEdit ? this.renderConditionCustListTag(index, 'default_department_role', field.name, id) :
                `${field.name}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
          })
        ));
      case 'default_expense_type': //费用类型
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((oid, index) => {
          item.showValue = item.showValue || [];
          return (this.state.expenseTypeList.length ? this.state.expenseTypeList : item.showValue).map(expense => {
            if (expense.expenseTypeOID === oid)
              return isEdit ? this.renderConditionCustListTag(index, 'default_expense_type', expense.name, oid) : (
                <span>
                  {expense.name}
                  <span style={{color:'#aaa'}}>
                    {(expense.enable || expense.enabled) ? '' : `（${this.$t('workflow.detail.word.disabled')/*禁*/}）`}
                  </span>
                  {index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}
                </span>
              )
          })
        });
      case 'select_department': //部门
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((oid, index) => {
          item.showValue = item.showValue || {};
          this.state.departmentList.map(department => {
            if (department.departmentOID === oid) {
              item.showValue[oid] = department.name
            }
          });
          return isEdit ? this.renderConditionCustListTag(index, 'select_department', item.showValue[oid], oid) :
            `${item.showValue[oid]}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
        });
      case 'currency_code': //币种
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((code, index) => (
          isEdit ? this.renderConditionCustListTag(index, 'currency_code', constants.getTextByValue(code, 'cashName') || code, code) :
            `${constants.getTextByValue(code, 'cashName') || code}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
        ));
      case 'select_cost_center': //成本中心
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((oid, index) => {
          item.showValue = item.showValue || {};
          this.state.costCenterList.map(costCenter => {
            costCenter.costCenterItemOID === oid && (item.showValue[oid] = costCenter.name)
          });
          return isEdit ? this.renderConditionCustListTag(index, 'select_cost_center', item.showValue[oid], oid) :
            `${item.showValue[oid]}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
        });
      case 'select_company': //公司控件
      case 'default_applicant_company':
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((oid, index) => {
          item.showValue = item.showValue || {};
          this.state.companyList.map(company => {
            company.companyOID === oid && (item.showValue[oid] = company.name)
          });
          return isEdit ? this.renderConditionCustListTag(index, item.remark, item.showValue[oid], oid) :
            `${item.showValue[oid]}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
        });
      case 'select_corporation_entity': //法人实体
      case 'default_corporation_entity':
        return item.valueDetail && (JSON.parse(item.valueDetail).value || []).map((oid, index) => {
          let entityName = (item.showValue || {})[oid];
          this.state.entityList.map(entity => {
            entity.companyReceiptedOID === oid && (entityName = entity.companyName)
          });
          return isEdit ? this.renderConditionCustListTag(index, item.remark, entityName, oid) :
            `${entityName}${index < JSON.parse(item.valueDetail).value.length - 1 ? '、' : ''}`
        });
      case 'cust_list':
        return item.valueDetail && (JSON.parse(item.valueDetail).valueOIDs || []).map(oid => {
          let custListName = item.showValue;
          this.state.valueList.map(value => {
            value.customEnumerationItemOID === oid && (custListName = value.messageKey)
          });
          return custListName
        });
    }
  };

  //渲染审批条件值列表的tag值
  renderConditionCustListTag = (index, type, name, value) => {
    return (
      <Tag key={index} closable onClose={e => this.handleDeleteValueItem(e, type, value)}>
        <Ellipsis tooltip length={10}>{name}</Ellipsis>
      </Tag>
    )
  };

  //修改审批人的level
  handleApproverLevelChange = (item, level) => {
    let params = {
      approverType: item.approverType,
      level: level,
      name: item.name,
      ruleApprovalNodeOID: item.ruleApprovalNodeOID,
      ruleApproverOID: item.ruleApproverOID
    };
    workflowService.updateApprovers(params).then(res => {
      this.props.onApproverChange(false);
      message.success(this.$t('common.operate.success'))
    })
  };

  render() {
    const { basicInfo } = this.props;
    const { loading, approvalAndDepLevel, ruleApprovers, symbolsType, batchCode, deleteTagValue, modalVisible, defaultAdditionOID,
            approverOIDForAddRule } = this.state;
    return (
      <div className='node-condition-list'>
        <Spin spinning={loading}>
          {ruleApprovers.map((item, approverIndex) => {
            let ruleConditions = []; //条件列表
            Object.keys(item.ruleConditions || {}).map(key => {ruleConditions.push(item.ruleConditions[key])});
            let title = (
              <div className="collapse-header">
                {basicInfo.type !== 1003 ? item.name : this.$t('workflow.detail.node.robot1'/*机器人*/)}
                {this.getApplicantType(item) && <span>【{this.getApplicantType(item)}】</span>}
                {basicInfo.type !== 1003 && item.level && (
                  <div onClick={e => {e.preventDefault();e.stopPropagation()}} style={{display: 'inline-block'}}>
                    <Select size="small" className={this.props.language.local === 'zh_CN' ? 'approve-level' : 'approve-level-en'}
                            value={item.level}
                            onChange={level => this.handleApproverLevelChange(item, level)}>
                      {approvalAndDepLevel.map(level => <Option value={level.id} key={level.id}>{level.name}</Option>)}
                    </Select>
                  </div>
                )}
                {(item.containsApportionmentDepartmentManager || item.containsApportionmentCostCenterManager ||
                  item.containsApportionmentCostCenterPrimaryDepartmentManager) && `【${this.$t('workflow.detail.include.allocation'/*含分摊*/)}】`}
              </div>
            );
            let extra = (
              <div className="header-right">
                <div onClick={e => {e.preventDefault();e.stopPropagation()}} style={{display: 'inline-block'}}>
                  <a onClick={() => {this.handleAdditionModalShow([], item.ruleApproverOID)}}>
                    {this.$t('workflow.add.approve.condition')/*添加审批条件*/}
                  </a>
                </div>
                {basicInfo.type !== 1003 && <span className="ant-divider"/>}
                {basicInfo.type !== 1003 && (
                  <div onClick={e => {e.preventDefault();e.stopPropagation()}} style={{display: 'inline-block'}}>
                    <Popconfirm title={this.$t('common.confirm.delete')}
                                overlayStyle={{minWidth: 160}}
                                onConfirm={() => this.handleDeleteApprover(item)}>
                      <a>{this.$t('common.delete')}</a>
                    </Popconfirm>
                  </div>
                )}
              </div>
            );
            return (
              <Card key={approverIndex} title={title} extra={extra} className="condition-list-card" bodyStyle={{padding: '0 20px'}}>
                {!ruleConditions.length ? (
                  <div className="no-rule-content">
                    {this.$t('workflow.detail.please.first')/*请先*/}
                    <a onClick={() => {this.handleAdditionModalShow([], item.ruleApproverOID)}}>
                      【{this.$t('workflow.add.approve.condition')/*添加审批条件*/}】
                    </a>
                  </div>
                ) : (
                  <List itemLayout="horizontal"
                        dataSource={ruleConditions}
                        renderItem={(condition, conditionIndex) => {
                          let isEdit = condition && condition.length && condition[0].isEdit;
                          return (
                            <ListItem key={conditionIndex}>
                              <div className="condition-title">
                                <h4>{this.$t('workflow.detail.condition')/*条件*/}{conditionIndex + 1}</h4>
                                {!isEdit && (
                                  <div className="edit-and-delete">
                                    <a className="edit" onClick={() => this.handleEditCondition(condition, approverIndex, conditionIndex)}>
                                      {this.$t('common.edit')}
                                    </a>
                                    <Popconfirm title={this.$t('common.confirm.delete')}
                                                onConfirm={() => this.handleDeleteCondition(condition, condition[0].batchCode, item.ruleApproverOID)}>
                                      <a>{this.$t('common.delete')}</a>
                                    </Popconfirm>
                                  </div>
                                )}
                              </div>
                              {!!isEdit ? (
                                <ConditionForm condition={condition}
                                               symbolsType={symbolsType}
                                               batchCode={batchCode}
                                               formOID={this.props.formOID}
                                               approverIndex={approverIndex}
                                               deleteTagValue={deleteTagValue}
                                               afterDeleteTagValue={() => {this.setState({deleteTagValue: {}})}}
                                               addCondition={() => this.handleAdditionModalShow(condition, item.ruleApproverOID)}
                                               saveNewHandle={condition => this.handleSaveCondition(condition, item.ruleApproverOID, 'new')}
                                               saveUpdateHandle={condition => this.handleSaveCondition(condition, item.ruleApproverOID, 'update')}
                                               cancelHandle={this.handleCancelEditCondition}
                                               itemValueRender={this.renderConditionItem}
                                />
                              ) : (
                                condition.map((item, i) => {
                                  if (item.symbol === 9011) {
                                    let leftCondition = item.valueDetail ? (JSON.parse(item.valueDetail).list[0] || {}) : {};
                                    let rightCondition = item.valueDetail ? (JSON.parse(item.valueDetail).list[1] || {}) : {};
                                    return (
                                      <div key={i} className="condition-container">
                                        {leftCondition.symbol && (
                                          <span>
                                            {leftCondition.value}
                                            &nbsp;&nbsp;【{constants.getTextByValue(leftCondition.symbol, 'symbolFilter')}】&nbsp;&nbsp;
                                          </span>
                                        )}
                                        <span className="name">{item.name}</span>
                                        {rightCondition.symbol && (
                                          <span>
                                            &nbsp;&nbsp;【{constants.getTextByValue(rightCondition.symbol, 'symbolFilter')}】&nbsp;&nbsp;
                                            {rightCondition.value}
                                          </span>
                                        )}
                                      </div>
                                    )
                                  } else if (item.remark === 'judge_cost_center') { //申请人是否为成本中心主管
                                    if (item.symbol === 9012) {
                                      return (
                                        <div key={i} className="condition-container">
                                          {this.$t('workflow.detail.applicant')/*申请人*/}
                                          &nbsp;&nbsp;=&nbsp;&nbsp;
                                          {item.name}{this.$t('workflow.detail.manager')/*经理*/}
                                        </div>
                                      )
                                    } else if (item.symbol === 9013) {
                                      return (
                                        <div key={i} className="condition-container">
                                          {this.$t('workflow.detail.applicant')/*申请人*/}
                                          &nbsp;&nbsp;&ne;&nbsp;&nbsp;
                                          {item.name}{this.$t('workflow.detail.manager')/*经理*/}
                                        </div>
                                      )
                                    }
                                  } else if (item.value) {
                                    return (
                                      <div key={i} className="condition-container">
                                        <span className="name">{item.name}</span>
                                        &nbsp;&nbsp;【<span className="symbol">{constants.getTextByValue(item.symbol, 'symbolFilter')}</span>】&nbsp;&nbsp;
                                        <span>{item.value}</span>
                                      </div>
                                    )
                                  } else {
                                    return (
                                      <div key={i} className="condition-container">
                                        <span className="name">{item.name}</span>
                                        &nbsp;&nbsp;【<span className="symbol">{constants.getTextByValue(item.symbol, 'symbolFilter')}</span>】&nbsp;&nbsp;
                                        {!loading && this.renderConditionItem(item)}
                                      </div>
                                    )
                                  }
                                })
                              )}
                            </ListItem>
                          )
                        }}
                  />
                )}
              </Card>
            )
          })}
        </Spin>

        <AddApproveRuleModal visible={modalVisible}
                             formOID={this.props.formOID}
                             ruleApproverOID={approverOIDForAddRule}
                             batchCode={batchCode}
                             defaultValue={defaultAdditionOID}
                             onOk={this.handleAddCondition}
                             onCancel={() => {this.setState({modalVisible: false})}}
        />
      </div>
    )
  }
}

NodeConditionList.propTypes = {
  formOID: PropTypes.string,
  basicInfo: PropTypes.object,
  formInfo: PropTypes.object,
  judgeRuleInEdit: PropTypes.func, //判断是否有编辑中的条件，编辑状态下不可切换节点
  onApproverChange: PropTypes.func,
  conditionSaveHandle: PropTypes.func, //保存审批条件
};

NodeConditionList.contextTypes = {
  router: PropTypes.object
};

function mapStateToProps(state) {
  return {
    language: state.languages,
  }
}

const wrappedNodeConditionList = Form.create()(NodeConditionList);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNodeConditionList)
