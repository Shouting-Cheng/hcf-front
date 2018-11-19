import React from 'react'
import { connect } from 'dva'
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

import workflowService from 'containers/setting/workflow/workflow.service'
import 'styles/setting/workflow/workflow-detail.scss'
import { routerRedux } from 'dva/router';

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
      addPersonModalVisible: false, //添加审批人modal
      isRuleInEdit: false, //是否有审批条件处于编辑状态
    }
  }

  componentDidMount() {
    this.setState({ loading: true });
    Promise.all([
      this.getForm(),
      this.getApprovalChain()
    ]).then(() => {
      this.setState({ loading: false })
    })
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

  //是否显示表单配置
  handleFormSettingVisible = () => {
    if (this.state.isRuleInEdit) {
      message.warning(this.$t('workflow.detail.have.edit.condition'/*你有一个编辑中的审批条件未保存*/));
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
        message.warning(this.$t('workflow.detail.have.edit.condition'/*你有一个编辑中的审批条件未保存*/));
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
      this.setState({ saving: true, chainInfo: res.data }, () => {
        this.setState({ saving: false })
      })
    })
  };

  //审批人添加／删除
  handleApproverChange = (approverNotChange) => {
    this.setState({ addPersonModalVisible: false }, () => {
      if (!approverNotChange) {
        this.setState({ loading : true });
        workflowService.getApprovalChainDetail(this.props.match.params.formOID).then(res => {
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
    console.log(widget)
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
      <div className='workflow-detail' style={{paddingBottom: 20}}>
        <Spin spinning={loading}>
          <Row>
            <Col span={6} className="node-container">
              {(approvalMode === 1002 || approvalMode === 1003 || approvalMode === 1006) ? (
                <Tooltip title={formInfo.formName} placement="topLeft" className="form-name-tooltip">{formInfo.formName}</Tooltip>
              ) : (
                <Row>
                  <Col span={language.code === 'zh_CN' ? 15 : 12} className="form-name">
                    <Tooltip title={formInfo.formName} placement="topLeft" className="form-name-tooltip">{formInfo.formName}</Tooltip>
                  </Col>
                  <Col span={9}>
                    <Button type="primary"
                            onClick={this.handleFormSettingVisible}>
                      {this.$t('workflow.detail.form.property')/*表单配置*/}
                    </Button>
                  </Col>
                </Row>
              )}
              <div className="approve-type">
                <div>
                  {approvalMode === 1002 && this.$t('workflow.dep.manager'/*部门经理*/)}
                  {approvalMode === 1003 && this.$t('workflow.detail.candidate'/*选人*/)}
                  {approvalMode === 1005 && this.$t('workflow.detail.custom'/*自定义*/)}
                  {approvalMode === 1006 && this.$t('workflow.detail.educationFirst'/*英孚*/)}
                  {this.$t('workflow.detail.approval')/*审批*/}
                  <Popover placement="bottom" content={language.local === 'zh_CN' ? <img src={flowTipsImg} /> : <img src={flowTipsEnImg} />}>
                    <Icon type="question-circle-o" className="question-icon"/>
                  </Popover>
                </div>
                <p>
                  {approvalMode === 1002 && this.$t('workflow.detail.approve.by.dep.manager'/*由提交人所在部门领导审批*/)}
                  {(approvalMode === 1003 || approvalMode === 1006) && this.$t('workflow.detail.approve.by.selected.person'/*由提交人选择人员依次进行审批*/)}
                </p>
              </div>
              {(approvalMode === 1002 || approvalMode === 1003 || approvalMode === 1006) && (
                <div className="not-custom-approve selected">
                  <div className="approval-block">{this.$t('workflow.word.shen')/*审*/}</div>
                  <div className="title">
                    {approvalMode === 1002 && this.$t('workflow.dep.manager'/*部门经理*/)}
                    {approvalMode === 1003 && this.$t('workflow.select.approver'/*选人审批*/)}
                    {approvalMode === 1006 && this.$t('workflow.educationFirst.approver'/*英孚审批*/)}
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
                                   saving={saving}
                />
              )}
            </Col>
            {showFormSetting && <Col span={18} className="right-content"><FormSetting formOID={this.props.match.params.formOID}/></Col>}
            {!showFormSetting && (
              <Col span={18} className="right-content">
                {approvalMode === 1002 && (
                  <div className="node-not-custom-approve">
                    <Row>
                      <Col span={5}>{this.$t('workflow.detail.node.null')/*节点为空时*/}</Col>
                      <Col span={5}>{this.$t('workflow.detail.skip'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('workflow.detail.all.pass.go.next.node'/*全部通过后进入下一节点*/)}</Col>
                      <Col span={5}>{this.$t('workflow.detail.skip'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('workflow.detail.show.repeat.approve')/*出现重复审批操作*/}</Col>
                      <Col span={5}>{this.$t('workflow.detail.skip'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('workflow.detail.include.submitter'/*包含提交人*/)}</Col>
                      <Col span={5}>{this.$t('workflow.detail.skip'/*跳过*/)}</Col>
                    </Row>
                  </div>
                )}
                {approvalMode === 1003 && (
                  <div className="node-not-custom-approve">
                    <Row>
                      <Col span={5}>{this.$t('workflow.detail.node.null')/*节点为空时*/}</Col>
                      <Col span={5}>{this.$t('workflow.detail.skip'/*跳过*/)}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('workflow.detail.show.repeat.approve')/*出现重复审批操作*/}</Col>
                      <Col span={5}>{this.$t('workflow.detail.not.skip')/*不跳过*/}</Col>
                    </Row>
                    <Row>
                      <Col span={5}>{this.$t('workflow.detail.include.submitter'/*包含提交人*/)}</Col>
                      <Col span={5}>{this.$t('workflow.detail.not.skip')/*不跳过*/}</Col>
                    </Row>
                  </div>
                )}
                {approvalMode === 1005 && (
                  <div className="node-detail">
                    {chosenNodeType === 1001 && (
                      <NodeApproveMan basicInfo={chosenNodeWidget}
                                      formInfo={formInfo}
                                      basicInfoSaveHandle={this.handleBasicInfoSave}
                                      addPersonModalVisible={visible => this.setState({addPersonModalVisible: visible})}
                      />
                    )}
                    {chosenNodeType === 1002 && (
                      <NodeKnow basicInfo={chosenNodeWidget}
                                formInfo={formInfo}
                                basicInfoSaveHandle={this.handleBasicInfoSave}
                                addPersonModalVisible={visible => this.setState({addPersonModalVisible: visible})}
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
                                    handleCancel={()=>this.setState({addPersonModalVisible: false})}
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
                      <Col span={3}>{this.$t('workflow.detail.node.name')/*节点名称*/}</Col>
                      <Col span={3}>{this.$t('workflow.detail.node.finish')/*结束*/}</Col>
                    </Row>
                    {/*报销单的formType以3开头，只有报销单和借款单才有打印配置*/}
                    {formInfo.formType && (String(formInfo.formType).charAt(0) === '3' || formInfo.formType === 2005) && (
                      <Row style={{marginTop: 15}}>
                        <Col span={3}>{this.$t('workflow.detail.need.print')/*是否打印*/}</Col>
                        <Col span={3}>
                          <Checkbox defaultChecked={chosenNodeWidget.isPrint} onChange={e => this.handleEndNodePrint(e, chosenNodeWidget)}/>
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

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedWorkflowDetail)
