import React from 'react'
import { connect } from 'dva'
//import Ellipsis from 'ant-design-pro/lib/Ellipsis'
import { Form, Icon, Row, Col, Button, Spin, Checkbox, message, Popover, Tooltip } from 'antd'

import CustomApproveNode from 'containers/setting/workflow/custom-approve-node'
import FormSetting from 'containers/setting/workflow/right-content/form-setting'
import NodeApproveMan from 'containers/setting/workflow/right-content/node-approve-man'
import NodeApproveAi from 'containers/setting/workflow/right-content/node-approve-ai'
import NodeKnow from 'containers/setting/workflow/right-content/node-know'
import NodePrint from 'containers/setting/workflow/right-content/node-print'
import NodeConditionList from 'containers/setting/workflow/right-content/condition-list'
import AddPersonModal from 'containers/setting/workflow/right-content/add-person-modal'
import flowTipsImg from 'images/setting/workflow/flow-tips.png'
import flowTipsEnImg from 'images/setting/workflow/flow-tips-en.png'
import { routerRedux } from 'dva/router';
import workflowService from 'containers/setting/workflow/workflow.service'
import 'styles/setting/workflow/workflow-detail.scss'

class WorkflowDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formInfo: {},
      saving: false,
      chainInfo: {},
      showFormSetting: false, //是否显示表单配置
      chosenNodeType: null, //选中的节点
      chosenNodeWidget: {}, //选中的节点内容
      choseNodeIndex: 0, //选中节点的index
      formFieldList: null, //表单条件字段 用于更新字段的名称
      addPersonModalVisible: false, //添加审批人modal
      isRuleInEdit: false, //是否有审批条件处于编辑状态
    }
  }

  componentDidMount() {
    this.setState({ loading: true });
    workflowService.getFormFields(this.props.match.params.formOID).then(res => {
      this.setState({formFieldList: res.data}, ()=>{
        Promise.all([
          this.getForm(),
          this.getApprovalChain()
        ]).then(() => {
          this.setState({ loading: false });
        });
      });
    }).catch(() => {
      this.setState({ loading: false });
      message.error(this.$t('common.error1'));
    });
  }

  //获取表单信息
  getForm = () => {
    return new Promise((resolve, reject) => {
      workflowService.getCustomForm(this.props.match.params.formOID).then(res => {
        this.setState({formInfo: res.data});
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  };

  //获取审批链详情
  getApprovalChain = () => {
    return new Promise((resolve, reject) => {
      workflowService.getApprovalChainDetail(this.props.match.params.formOID).then(res => {
        res.data = this.refreshName(res.data);
        this.setState({
          chainInfo: res.data,
          chosenNodeType: res.data.ruleApprovalNodes && res.data.ruleApprovalNodes[0].type,
          chosenNodeWidget: res.data.ruleApprovalNodes && res.data.ruleApprovalNodes[0]
        });
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  };

  //刷新字段名称，支持judge_cost_center
  refreshName = (data) => {
    let formFieldList = this.state.formFieldList;
    let judgeCostCenterList = formFieldList['400'];//申请人=成本中心经理
    let judgeCostCenterBatchCode = null;
    let selectCostCenterList = formFieldList['101'];//表单自定义条件
    let selectCostCenterBatchCode = null;
    if (data.ruleApprovalNodes && data.ruleApprovalNodes.length) {
      data.ruleApprovalNodes.map(node => {
        if (node.ruleApprovers && node.ruleApprovers.length) {
          node.ruleApprovers.map(approver => {
            if (approver.ruleConditionList) {
              let ruleConditionList = approver.ruleConditionList;
              ruleConditionList.length && ruleConditionList.map(condition => {
                condition.remark === 'judge_cost_center' && judgeCostCenterList.map(judgeCostCenter => {
                  if (condition.field === judgeCostCenter.fieldOID && condition.remark === judgeCostCenter.messageKey) {
                    condition.name = judgeCostCenter.fieldName;
                  }
                });
                if (condition.remark === 'judge_cost_center') {
                  judgeCostCenterBatchCode = condition.batchCode.toString();
                }
                condition.remark === 'select_cost_center' && selectCostCenterList.map(selectCostCenter => {
                  if (condition.field === selectCostCenter.fieldOID && condition.remark === selectCostCenter.messageKey) {
                    condition.name = selectCostCenter.fieldName;
                  }
                });
                if (condition.remark === 'select_cost_center') {
                  selectCostCenterBatchCode = condition.batchCode.toString();
                }
              });
              let ruleConditions = approver.ruleConditions;
              if (ruleConditions[judgeCostCenterBatchCode] && ruleConditions[judgeCostCenterBatchCode].length) {
                ruleConditions[judgeCostCenterBatchCode].map(condition => {
                  condition.remark === 'judge_cost_center' && judgeCostCenterList.map(judgeCostCenter => {
                    if (condition.field === judgeCostCenter.fieldOID && condition.remark === judgeCostCenter.messageKey) {
                      condition.name = judgeCostCenter.fieldName;
                    }
                  });
                });
              }
              if (ruleConditions[selectCostCenterBatchCode] && ruleConditions[selectCostCenterBatchCode].length) {
                ruleConditions[selectCostCenterBatchCode].map(condition => {
                  condition.remark === 'select_cost_center' && selectCostCenterList.map(selectCostCenter => {
                    if (condition.field === selectCostCenter.fieldOID && condition.remark === selectCostCenter.messageKey) {
                      condition.name = selectCostCenter.fieldName;
                    }
                  });
                });
              }
            }
          });
        }
      });
    }
    return data;
  };

  //是否显示表单配置
  handleFormSettingVisible = () => {
    if (this.state.isRuleInEdit) {
      message.warning(this.$t('setting.key1319'/*你有一个编辑中的审批条件未保存*/));
      return
    }
    this.setState({ showFormSetting: !this.state.showFormSetting })
  };

  //选择节点
  handleNodeSelect = (nodeType, widget, index) => {
    if (this.state.chosenNodeWidget.ruleApprovalNodeOID === widget.ruleApprovalNodeOID) {
      this.setState({ showFormSetting: false })
    } else {
      if (this.state.isRuleInEdit) {
        message.warning(this.$t('setting.key1319'/*你有一个编辑中的审批条件未保存*/));
        return
      }
      this.setState({ //先将选中的节点类型置空，否则如果选中前后的节点类型一样的话，部分数据可能不会刷新
        chosenNodeType: null,
      }, () => {
        this.setState({
          showFormSetting: false,
          chosenNodeType: nodeType,
          chosenNodeWidget: widget,
          choseNodeIndex: index
        })
      })
    }
  };

  handleNodeChange = (list) => {
    let chainInfo = this.state.chainInfo;
    chainInfo.ruleApprovalNodes = list;
    this.setState({ chainInfo })
  };

  //保存基本信息
  handleBasicInfoSave = () => {
    workflowService.getApprovalChainDetail(this.props.match.params.formOID).then(res => {
      res.data = this.refreshName(res.data);
      this.setState({ saving: true, chainInfo: res.data }, () => {
        this.setState({ saving: false })
      })
    })
  };

  //添加审批人弹框显示
  handlePersonModalShow = (visible) => {
    if (this.state.isRuleInEdit) {
      message.warning(this.$t('setting.key1319'/*你有一个编辑中的审批条件未保存*/))
    } else {
      this.setState({addPersonModalVisible: visible})
    }
  };

  //审批人添加／删除
  handleApproverChange = (approverNotChange) => {
    this.setState({ addPersonModalVisible: false }, () => {
      if (!approverNotChange) {
        this.setState({ loading : true });
        workflowService.getApprovalChainDetail(this.props.match.params.formOID).then(res => {
          res.data = this.refreshName(res.data);
          this.setState({
            loading: false,
            chainInfo: res.data,
            chosenNodeType: res.data.ruleApprovalNodes && res.data.ruleApprovalNodes[this.state.choseNodeIndex].type,
            chosenNodeWidget: res.data.ruleApprovalNodes && res.data.ruleApprovalNodes[this.state.choseNodeIndex]
          })
        })
      }
    })
  };

  //保存审批条件
  handleConditionSave = (widget) => {
    let chainInfo = this.state.chainInfo;
    chainInfo.ruleApprovalNodes.map((item, index) => {
      if (item.ruleApprovalNodeOID === widget.ruleApprovalNodeOID)
        chainInfo.ruleApprovalNodes[index] = widget
    });
    this.setState({ chainInfo })
  };

  //结束节点打印
  handleEndNodePrint = (e, params) => {
    params.isPrint = e.target.checked;
    workflowService.modifyApprovalNodes(params).then(() => {
      message.success(this.$t('common.operate.success'))
    })
  };

  //删除审批人
  handleDeleteApprover = (item) => {
    workflowService.deleteApprovers(item.ruleApproverOID)
  };

  //返回
  goBack = () => {
    let url = '/admin-setting/workflow';
    this.props.dispatch(
      routerRedux.replace({
        pathname: url
      })
    );
  };

  render() {
    const { language } = this.props;
    const { loading, formInfo, chainInfo, showFormSetting, chosenNodeType, chosenNodeWidget, addPersonModalVisible, isRuleInEdit, saving } = this.state;
    let approvalMode = chainInfo.approvalMode;
    return (
      <div className='workflow-detail'>
        <Spin spinning={loading}>
          <Row>
            <Col span={6} className="node-container">
              {(approvalMode === 1002 || approvalMode === 1003 || approvalMode === 1006) ? (
                <Tooltip title={formInfo.formName} placement="topLeft" className="form-name-tooltip">{formInfo.formName}</Tooltip>
              ) : (
                <Row>
                  <Col span={language.code === 'zh_cn' ? 15 : 12} className="form-name">
                    <Tooltip title={formInfo.formName} placement="topLeft" className="form-name-tooltip">{formInfo.formName}</Tooltip>
                  </Col>
                  <Col span={9}>
                    <Button type="primary"
                            onClick={this.handleFormSettingVisible}>
                      {this.$t('setting.key1412'/*表单配置*/)}
                    </Button>
                  </Col>
                </Row>
              )}
              <div className="approve-type">
                <div>
                  {approvalMode === 1002 && this.$t('setting.key1413'/*部门经理*/)}
                  {approvalMode === 1003 && this.$t('setting.key1414'/*选人*/)}
                  {approvalMode === 1005 && this.$t('setting.key1415'/*自定义*/)}
                  {approvalMode === 1006 && this.$t('setting.key1416'/*英孚*/)}
                  {this.$t('setting.key1248'/*审批*/)}
                  <Popover placement="bottom" content={language.code === 'zh_cn' ? <img src={flowTipsImg} /> : <img src={flowTipsEnImg} />}>
                    <Icon type="question-circle-o" className="question-icon"/>
                  </Popover>
                </div>
                <p>
                  {approvalMode === 1002 && this.$t('setting.key1417'/*由提交人所在部门领导审批*/)}
                  {(approvalMode === 1003 || approvalMode === 1006) && this.$t('setting.key1418'/*由提交人选择人员依次进行审批*/)}
                </p>
              </div>
              {(approvalMode === 1002 || approvalMode === 1003 || approvalMode === 1006) && (
                <div className="not-custom-approve selected">
                  <div className="approval-block">{this.$t('setting.key1419'/*审*/)}</div>
                  <div className="title">
                    {approvalMode === 1002 && this.$t('setting.key1413'/*部门经理*/)}
                    {approvalMode === 1003 && this.$t('setting.key1420'/*选人审批*/)}
                    {approvalMode === 1006 && this.$t('setting.key1421'/*英孚审批*/)}
                  </div>
                </div>
              )}
              {approvalMode === 1005 && (
                <CustomApproveNode ruleApprovalNodes={chainInfo.ruleApprovalNodes}
                                   ruleApprovalChainOID={chainInfo.ruleApprovalChainOID}
                                   formInfo={formInfo}
                                   formOID={this.props.match.params.formOID}
                                   isRuleInEdit={isRuleInEdit}
                                   onSelect={this.handleNodeSelect}
                                   onChange={this.handleNodeChange}
                                   onSaving={saving => this.setState({saving})}
                                   saving={saving}
                />
              )}
            </Col>
            {/*div.right-content-cover 是为了操作节点的时候右边的内容区域不可编辑*/}
            {saving && <Col span={18} className="right-content-cover"/>}
            {showFormSetting && <Col span={18} className="right-content"><FormSetting formOID={this.props.match.params.formOID}/></Col>}
            {!showFormSetting && (
              <Col span={18} className="right-content">
                {approvalMode === 1002 && (
                  <div className="node-not-custom-approve">
                    <Row>
                      <Col span={5}>{this.$t('setting.key1382'/*节点为空时*/)}</Col>
                      <Col span={5}>{this.$t('setting.key1383'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('setting.key1422'/*全部通过后进入下一节点*/)}</Col>
                      <Col span={5}>{this.$t('setting.key1383'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('setting.key1423'/*出现重复审批操作*/)}</Col>
                      <Col span={5}>{this.$t('setting.key1383'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('setting.key1424'/*包含提交人*/)}</Col>
                      <Col span={5}>{this.$t('setting.key1383'/*跳过*/)}</Col>
                    </Row>
                  </div>
                )}
                {approvalMode === 1003 && (
                  <div className="node-not-custom-approve">
                    <Row>
                      <Col span={5}>{this.$t('setting.key1382'/*节点为空时*/)}</Col>
                      <Col span={5}>{this.$t('setting.key1383'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('setting.key1423'/*出现重复审批操作*/)}</Col>
                      <Col span={5}>{this.$t('setting.key1384'/*不跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('setting.key1424'/*包含提交人*/)}</Col>
                      <Col span={5}>{this.$t('setting.key1384'/*不跳过*/)}</Col>
                    </Row>
                  </div>
                )}
                {approvalMode === 1005 && (
                  <div className="node-detail">
                    {chosenNodeType === 1001 && (
                      <NodeApproveMan basicInfo={chosenNodeWidget}
                                      formInfo={formInfo}
                                      basicInfoSaveHandle={this.handleBasicInfoSave}
                                      modalVisibleHandle={this.handlePersonModalShow}
                      />
                    )}
                    {chosenNodeType === 1002 && (
                      <NodeKnow basicInfo={chosenNodeWidget}
                                formInfo={formInfo}
                                basicInfoSaveHandle={this.handleBasicInfoSave}
                                modalVisibleHandle={this.handlePersonModalShow}
                      />
                    )}
                    {chosenNodeType === 1003 && (
                      <NodeApproveAi basicInfo={chosenNodeWidget}
                                     basicInfoSaveHandle={this.handleBasicInfoSave}
                      />
                    )}
                    <NodeConditionList formOID={this.props.match.params.formOID}
                                       basicInfo={chosenNodeWidget}
                                       formInfo={formInfo}
                                       onApproverChange={this.handleApproverChange}
                                       judgeRuleInEdit={isRuleInEdit => this.setState({isRuleInEdit})}
                                       conditionSaveHandle={this.handleConditionSave}
                    />
                    <AddPersonModal visible={addPersonModalVisible}
                                    personType={chosenNodeType === 1001 ? 1 : 2}
                                    ruleApprovers={chosenNodeWidget.ruleApprovers || []}
                                    ruleApprovalNodeOID={chosenNodeWidget.ruleApprovalNodeOID}
                                    formInfo={formInfo}
                                    onSelect={this.handleApproverChange}
                                    onDelete={this.handleDeleteApprover}
                    />
                  </div>
                )}
                {approvalMode === 1005 && chosenNodeType === 1004 && (
                  <NodePrint basicInfo={chosenNodeWidget}
                             basicInfoSaveHandle={this.handleBasicInfoSave}
                  />
                )}
                {approvalMode === 1005 && chosenNodeType === 1005 && (
                  <div>
                    <Row>
                      <Col span={3}>{this.$t('setting.key1372'/*节点名称*/)}</Col>
                      <Col span={3}>{this.$t('setting.key1252'/*结束*/)}</Col>
                    </Row>
                    {/*报销单的formType以3开头，只有报销单和借款单才有打印配置*/}
                    {formInfo.formType && (String(formInfo.formType).charAt(0) === '3' || formInfo.formType === 2005) && (
                      <Row style={{marginTop: 15}}>
                        <Col span={3}>{this.$t('setting.key1425'/*是否打印*/)}</Col>
                        <Col span={3}>
                          <Checkbox defaultChecked={chosenNodeWidget.isPrint}
                                    onChange={e => this.handleEndNodePrint(e, chosenNodeWidget)}/>
                        </Col>
                      </Row>
                    )}
                  </div>
                )}
              </Col>
            )}
          </Row>
        </Spin>
        <a className="back-icon" onClick={this.goBack}>
          <Icon type="rollback" />{this.$t('common.back')}
        </a>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    language: state.languages,
  }
}

const wrappedWorkflowDetail = Form.create()(WorkflowDetail);

export default connect(mapStateToProps)(wrappedWorkflowDetail)
