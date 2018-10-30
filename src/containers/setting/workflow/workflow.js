import React from 'react'
import { connect } from 'dva'
import { Form, Card, Spin, Icon, Row, Col, Modal, message, Radio } from 'antd'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

import manApprovalImg from 'images/setting/workflow/man-approval.svg'
import knowImg from 'images/setting/workflow/know.svg'
import aiApprovalImg from 'images/setting/workflow/aiapproval.svg'
import mailImg from 'images/setting/workflow/mail.png'
import auditImg from 'images/setting/workflow/audit.png'
import endImg from 'images/setting/workflow/end.png'
import noFormImg from 'images/setting/workflow/no-form.png'

import Selector from 'widget/selector'
import workflowService from 'containers/setting/workflow/workflow.service'
import 'styles/setting/workflow/workflow.scss'
import { routerRedux } from 'dva/router';

class Workflow extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {
      loading: false,
      pasteLoading: false, //粘贴后页面loading
      data: [],
      setOfBooksId: this.props.match.params.setOfBooksId || this.props.company.setOfBooksId,
      setOfBooksName:  this.props.company.setOfBooksName,
      sourceFormOID: null, //复制的表单OID
      showEnableList: true, //显示启用的单据
    }
  }

  componentDidMount() {
    this.getList()
  }

  getList = () => {
    this.setState({ loading: true });
    workflowService.getWorkflowList(this.props.tenantMode ? this.state.setOfBooksId : '').then(res => {
      this.setState({
        loading: false,
        data: res.data
      })
    })
  };

  //集团模式下改变帐套
  handleSetOfBooksChange = (value) => {
    this.setState({
      setOfBooksId: value.id,
      setOfBooksName: value.setOfBooksName,
      showEnableList: true
    },() => {
      this.getList()
    })
  };

  //获取节点图片
  getNodeImg = (type) => {
    switch(type) {
      case 1001:  //审批
        return <img src={manApprovalImg} className="node-image"/>;
      case 1002:  //知会
        return <img src={knowImg} className="node-image"/>;
      case 1003:  //机器人
        return <img src={aiApprovalImg} className="node-image"/>;
      case 1004:  //发送打印
        return <img src={mailImg} className="node-image"/>;
      case 1006:  //审核
        return <img src={auditImg} className="node-image"/>;
      case 1005:  //结束
        return <img src={endImg} className="node-image"/>
    }
  };

  //显示粘贴确认框
  showConfirmModal = (targetFormOID) => {
    Modal.confirm({
      title: this.$t('workflow.is.confirm.modify'), //是否确认更改
      content: this.$t('workflow.paste.will.cover.original.approval'), //粘贴后将覆盖原审批流
      onOk: () => this.handleFormCopy(targetFormOID)
    })
  };

  //粘贴审批链
  handleFormCopy = (targetFormOID) => {
    this.setState({ pasteLoading: true });
    workflowService.copyApproveChains(this.state.sourceFormOID, targetFormOID).then(() => {
      workflowService.getWorkflowList(this.props.tenantMode ? this.state.setOfBooksId : '').then(res => {
        this.setState({
          pasteLoading: false,
          data: res.data
        })
      });
      message.success(this.$t('common.operate.success'))
    }).catch(() => {
      this.setState({ loading: false })
    })
  };

  //进入详情页
  goDetail = (record) => {
    let url = '/setting/workflow/workflow-setting/:formOID'.replace(':formOID', record.formOID);
    url += this.props.tenantMode ? `?setOfBooksId=${this.state.setOfBooksId}&setOfBooksName=${this.state.setOfBooksName}` : '';

    this.props.dispatch(
      routerRedux.replace({
        pathname: url
      })
    );
  };

  render() {
    const { tenantMode, language } = this.props;
    const { loading, data, setOfBooksName, setOfBooksId, sourceFormOID, showEnableList, pasteLoading } = this.state;
    let enabledData = [];
    let disabledData = [];
    data.map(item => {
      item.valid ? enabledData.push(item) : disabledData.push(item)
    });
    return (
      <div className='workflow'>
        {tenantMode && (
          <div className="setOfBooks-container">
            <Row className="setOfBooks-select">
              <Col span={language.local === 'zh_CN' ? 4 : 8} className="title">{this.$t('workflow.set.of.books')/*帐套*/}：</Col>
              <Col span={16}>
                <Selector type="setOfBooksByTenant"
                          allowClear={false}
                          entity
                          value={{label: setOfBooksName, key: setOfBooksId}}
                          onChange={this.handleSetOfBooksChange}
                />
              </Col>
            </Row>
          </div>
        )}
        {loading ? <Spin/> : (
          <Spin spinning={pasteLoading}>
            <div>
              <RadioGroup defaultValue={true} onChange={e => this.setState({showEnableList: e.target.value})}>
                <RadioButton value={true}>{this.$t('common.enabled')}</RadioButton>
                <RadioButton value={false}>{this.$t('common.disabled')}</RadioButton>
              </RadioGroup>
              {(showEnableList ? enabledData : disabledData).map(item => {
                return (
                  <Card key={item.formOID} className="card-list" type="inner"
                        title={(
                          <div>
                            <span>{item.formName}</span>
                            {showEnableList && (
                              <div className="card-title-extra">
                                <a onClick={() => {this.goDetail(item)}}>{this.$t('workflow.look.edit')/*查看编辑*/}</a>
                                <span className="ant-divider"/>
                                <a onClick={() => {this.setState({sourceFormOID: item.formOID})}}>{this.$t('workflow.copy')/*复制*/}</a>
                                {sourceFormOID && <span className="ant-divider"/>}
                                {sourceFormOID && <a onClick={() => {this.showConfirmModal(item.formOID)}}>{this.$t('workflow.paste')/*粘贴*/}</a>}
                              </div>
                            )}
                          </div>
                        )}
                  >
                    {item.ruleApprovalChain && item.ruleApprovalChain.approvalMode === 1005 &&
                    (item.ruleApprovalChain.ruleApprovalNodes || []).map((node, index) => {
                      return (
                        <div key={node.ruleApprovalNodeOID} className="node-container">
                          <div>
                            {this.getNodeImg(node.type)}
                            {index < item.ruleApprovalChain.ruleApprovalNodes.length - 1 && <Icon type="arrow-right" className="right-arrow"/>}
                          </div>
                          <p className="node-remark">{node.type === 1005 ? this.$t('workflow.detail.node.finish'/*结束*/) : node.remark}</p>
                        </div>
                      )
                    })}
                    {item.ruleApprovalChain && item.ruleApprovalChain.approvalMode !== 1005 && (
                      <div className="node-container">
                        <div className="approval-block">{this.$t('workflow.word.shen')/*审*/}</div>
                        <p className="node-remark">
                          {item.ruleApprovalChain.approvalMode === 1002 && this.$t('workflow.dep.manager'/*部门经理*/)}
                          {item.ruleApprovalChain.approvalMode === 1003 && this.$t('workflow.select.approver'/*选人审批*/)}
                          {item.ruleApprovalChain.approvalMode === 1006 && this.$t('workflow.educationFirst.approver'/*英孚审批*/)}
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })}
              {showEnableList && !enabledData.length && (
                <div className="no-form-container">
                  <img src={noFormImg}/>
                  <p>{this.$t('workflow.go.to.formDesigner.enabled.form')/*无【已启用】单据，请先前往 表单设计器 启用表单*/}</p>
                </div>
              )}
            </div>
          </Spin>
        )}
      </div>
    )
  }
}

function mapStateToProps(state) {
  console.log(state)
  return {
    tenantMode: true, //state.main.tenantMode,
    company: state.user.company,
    language: state.languages,
  }
}

const wrappedWorkflow = Form.create()(Workflow);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedWorkflow)
