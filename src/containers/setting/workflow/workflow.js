import React from 'react'
import { connect } from 'dva'
import { Form, Card, Spin, Icon, Row, Col, Modal, message, Radio, Select, Input } from 'antd'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import constants from 'share/constants';
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
import LanguageInput from "../../../components/Widget/Template/language-input/language-input";
import debounce from 'lodash.debounce';
const Option = Select.Option;


class Workflow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pasteLoading: false, //粘贴后页面loading
      data: [],
      setOfBooksId: this.props.match.params.setOfBooksId || this.props.company.setOfBooksId,
      setOfBooksName: this.props.company.setOfBooksName,
      sourceFormOid: null, //复制的表单Oid
      showEnableList: true, //显示启用的单据
      params: {}
    };
    this.handleDocType = debounce(this.handleDocType, 500);
  }

  componentDidMount() {
    this.getList()
  }

  getList = () => {
    this.setState({ loading: true });
    let params = {
      ...this.state.params,
      booksID: this.props.tenantMode ? this.state.setOfBooksId : '',
    };
    workflowService.getWorkflowList(params).then(res => {
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
    }, () => {
      this.getList()
    })
  };

  //获取节点图片
  getNodeImg = (type) => {
    switch (type) {
      case 1001:  //审批
        return <img src={manApprovalImg} className="node-image" />;
      case 1002:  //知会
        return <img src={knowImg} className="node-image" />;
      case 1003:  //机器人
        return <img src={aiApprovalImg} className="node-image" />;
      case 1004:  //发送打印
        return <img src={mailImg} className="node-image" />;
      case 1006:  //审核
        return <img src={auditImg} className="node-image" />;
      case 1005:  //结束
        return <img src={endImg} className="node-image" />
    }
  };

  //显示粘贴确认框
  showConfirmModal = (targetFormOid) => {
    Modal.confirm({
      title: this.$t('setting.key1426'/*是否确认更改*/), //是否确认更改
      content: this.$t('setting.key1427'/*粘贴后将覆盖原审批流*/), //粘贴后将覆盖原审批流
      onOk: () => this.handleFormCopy(targetFormOid)
    })
  };

  //粘贴审批链
  handleFormCopy = (targetFormOid) => {
    this.setState({ pasteLoading: true });
    workflowService.copyApproveChains(this.state.sourceFormOid, targetFormOid).then(() => {
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
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/admin-setting/workflow/workflow-setting/:setOfBooksId/:formOid'
          .replace(':formOid', record.formOid)
          .replace(':setOfBooksId', this.state.setOfBooksId)
      })
    );
  };

  handleCatType = (value) => {
    this.setState({
      params: {
        ...this.state.params,
        documentCategory: value
      }
    }, () => this.getList())
  };

  handleDocType = (value) => {
    this.setState({
      params: {
        ...this.state.params,
        formName: value
      }
    }, () => this.getList())
  };

  render() {
    const { tenantMode, language } = this.props;
    const { loading, data, setOfBooksName, setOfBooksId, sourceFormOid, showEnableList, pasteLoading } = this.state;
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
              <Col span={language.local === 'zh_cn' ? 1 : 2} style={{ width: 43 }} className="title">{this.$t('setting.key1428'/*帐套*/)}：</Col>
              <Col span={3}>
                <Selector type="setOfBooksByTenant"
                  allowClear={false}
                  entity
                  value={{ label: setOfBooksName, key: setOfBooksId }}
                  onChange={this.handleSetOfBooksChange}
                />
              </Col>
              <Col span={language.local === 'zh_cn' ? 2 : 3} style={{ width: 72 }} className="title" offset={1}>{this.$t('common.document.categories'/*单据大类*/)}：</Col>
              <Col span={3}>
                <Select
                  allowClear
                  onChange={this.handleCatType}
                  style={{ width: '100%' }}
                  placeholder={this.$t('common.please.select')}>
                  {
                    constants.documentType.map(item => <Option key={item.value}>{item.text}</Option>)
                  }
                </Select>
              </Col>
              <Col span={language.local === 'zh_cn' ? 3 : 4} style={{ width: 100 }} className="title" offset={1}>{this.$t('acp.public.documentTypeName'/*单据类型名称*/)}：</Col>
              <Col span={3} >
                <Input
                  onChange={e => this.handleDocType(e.target.value)}
                  placeholder={this.$t('common.please.enter')} />
              </Col>
            </Row>
          </div>
        )}
        {loading ? <Spin /> : (
          <Spin spinning={pasteLoading}>
            <div>
              <RadioGroup defaultValue={true} onChange={e => this.setState({ showEnableList: e.target.value })}>
                <RadioButton value={true}>{this.$t('common.enabled')}</RadioButton>
                <RadioButton value={false}>{this.$t('common.disabled')}</RadioButton>
              </RadioGroup>
              {(showEnableList ? enabledData : disabledData).map(item => {
                return (
                  <Card key={item.formOid} className="card-list" type="inner"
                    title={(
                      <div>
                        <span>{item.formName}</span>
                        {showEnableList && (
                          <div className="card-title-extra">
                            <a onClick={() => { this.goDetail(item) }}>{this.$t('setting.key1429'/*查看编辑*/)}</a>
                            {/*审批流复制粘贴功能只适用于自定义审批模式 bug 21262*/}
                            {item.ruleApprovalChain && item.ruleApprovalChain.approvalMode === 1005 && (
                              <div style={{ display: 'inline-block' }}>
                                <span className="ant-divider" />
                                <a onClick={() => { this.setState({ sourceFormOid: item.formOid }) }}>{this.$t('setting.key1430'/*复制*/)}</a>
                                {sourceFormOid && <span className="ant-divider" />}
                                {sourceFormOid && <a onClick={() => { this.showConfirmModal(item.formOid) }}>{this.$t('setting.key1431'/*粘贴*/)}</a>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  >
                    <Row type="flex">
                      {item.ruleApprovalChain && item.ruleApprovalChain.approvalMode === 1005 &&
                        (item.ruleApprovalChain.ruleApprovalNodes || []).map((node, index) => {
                          return (
                            <div key={node.ruleApprovalNodeOid} className="node-container">
                              <div>
                                {this.getNodeImg(node.typeNumber)}
                                {index < item.ruleApprovalChain.ruleApprovalNodes.length - 1 && <Icon type="arrow-right" className="right-arrow" />}
                              </div>
                              <p className="node-remark">{node.type === 1005 ? this.$t('setting.key1252'/*结束*/) : node.remark}</p>
                            </div>
                          )
                        })}
                      {item.ruleApprovalChain && item.ruleApprovalChain.approvalMode !== 1005 && (
                        <div className="node-container">
                          <div className="approval-block">{this.$t('setting.key1419'/*审*/)}</div>
                          <p className="node-remark">
                            {item.ruleApprovalChain.approvalMode === 1002 && this.$t('setting.key1413'/*部门经理*/)}
                            {item.ruleApprovalChain.approvalMode === 1003 && this.$t('setting.key1420'/*选人审批*/)}
                            {item.ruleApprovalChain.approvalMode === 1006 && this.$t('setting.key1421'/*英孚审批*/)}
                          </p>
                        </div>
                      )}
                    </Row>
                  </Card>
                )
              })}
              {showEnableList && !enabledData.length && (
                <div className="no-form-container">
                  <img src={noFormImg} />
                  <p>{this.$t('setting.key1432'/*无【已启用】单据，请先前往 表单设计器 启用表单*/)}</p>
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
  return {
    tenantMode: true,//state.main.tenantMode,
    company: state.user.company,
    language: state.languages,
  }
}

const wrappedWorkflow = Form.create()(Workflow);

export default connect(mapStateToProps)(wrappedWorkflow)
