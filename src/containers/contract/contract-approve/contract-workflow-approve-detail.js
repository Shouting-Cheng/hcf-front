import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import httpFetch from 'share/httpFetch';
import config from 'config';
import contractService from 'containers/contract/contract-approve/contract.service';
import { Form, Affix, Button, Row, Col, Input, Popover, Tag, message } from 'antd';
const FormItem = Form.Item;
const { CheckableTag } = Tag;

import ContractWorkflowDetailCommon from 'containers/contract/contract-approve/contract-workflow-common';
import 'styles/contract/my-contract/contract-detail.scss';

import ApproveBar from 'components/Widget/Template/approve-bar';

class ContractWorkflowApproveDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passLoading: false,
      rejectLoading: false,
      approveType: '', //审批类型：通过 or 驳回
      inputError: false,
      errorMessage: this.$t({ id: 'contract.input.rejected.approval' } /*请输入驳回审批意见*/),
      tags: [],
      fastReplyEdit: false,
      fastReplyChosen: [],
      inputVisible: false,
      inputValue: '',
      isConfirm: true, //合同审批是否通过
      //ContractWorkflow: menuRoute.getRouteItem('approve-workflow-contract', 'key'), //合同
    };
  }

  componentWillMount() {
    this.getQuickTags();
  }

  //获取快捷回复内容
  getQuickTags = () => {
    httpFetch.get(`${config.baseUrl}/api/quick/reply`).then(res => {
      if (res.status === 200) {
        this.setState({ tags: res.data });
      }
    });
  };

  //审批处理
  handleApprove = (reason, additionalItems, priceAuditor) => {
    let params = {
      approvalTxt: reason,
      countersignApproverOids: '',
      entities: [
        {
          entityOid: this.props.match.params.entityOid,
          entityType: this.props.match.params.entityType,
        },
      ],
    };
    this.setState({ passLoading: true });
    contractService
      .contractApproveWorkflowPass(params)
      .then(res => {
        if (res.data.successNum) {
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.goBack();
        } else {
          this.setState({ passLoading: false });
          message.error(
            `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${
              res.data.failReason[this.props.match.params.entityOid]
            }`
          );
        }
      })
      .catch(e => {
        this.setState({ passLoading: false });
        if (e.response)
          message.error(
            `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.res.messageCode}`
          );
      });
  };

  //驳回处理
  handleApproveReject = (reason, additionalItems, priceAuditor) => {
    let params = {
      approvalTxt: reason,
      countersignApproverOids: '',
      entities: [
        {
          entityOid: this.props.match.params.entityOid,
          entityType: this.props.match.params.entityType,
        },
      ],
    };
    this.setState({ rejectLoading: true });
    contractService
      .contractApproveWorkflowReject(params)
      .then(res => {
        if (res.data.successNum) {
          message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
          this.goBack();
        } else {
          this.setState({ rejectLoading: false });
          message.error(
            `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${
              res.data.failReason[this.props.match.params.entityOid]
            }`
          );
        }
      })
      .catch(e => {
        this.setState({ rejectLoading: false });
        message.error(
          `${this.$t({ id: 'common.operate.filed' } /*操作失败*/)}，${e.response.data.message}`
        );
      });
  };

  goBack = () => {
    /*if (this.state.isConfirm) {
      this.context.router.push(`${this.state.ContractWorkflow.url}?approved=true`);
    } else {
      this.context.router.push(this.state.ContractWorkflow.url);
    }*/
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/approval-management/contract-approve`,
      })
    );
  };

  //获取合同状态
  getStatus = params => {
    if (this.props.match.params.status === 'approved') {
      // 已审批点击进来，不允许再出现 审批按钮
      this.setState({ isConfirm: true });
    } else {
      this.setState({
        isConfirm: params === 1004 || params === 6001 || params === 6002 || params === 6003,
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      passLoading,
      rejectLoading,
      inputError,
      errorMessage,
      tags,
      fastReplyEdit,
      inputVisible,
      inputValue,
      isConfirm,
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    let fastReplyContent = (
      <div className="fast-reply">
        {tags.map(item => {
          return (
            <CheckableTag
              key={item.id}
              className="fast-reply-tag"
              checked={item.checked}
              onChange={checked => this.onFastReplyChange(checked, item.id)}
            >
              {item.reply}
              {fastReplyEdit && (
                <a className="delete-tag" onClick={e => this.onDeleteTag(e, item)}>
                  &times;
                </a>
              )}
            </CheckableTag>
          );
        })}
        {!inputVisible &&
          !fastReplyEdit && (
            <Button size="small" type="dashed" className="add-new-btn" onClick={this.showTagInput}>
              + {this.$t({ id: 'contract.add.fast.reply' } /*新增快捷回复*/)}
            </Button>
          )}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            className="fast-reply-input"
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
      </div>
    );
    let fastReplyTitle = (
      <div className="fast-reply-title">
        {this.$t({ id: 'contract.fast.reply' } /*快捷回复*/)}
        {!fastReplyEdit && (
          <a className="edit" onClick={this.onFastReplyEdit}>
            {this.$t({ id: 'common.edit' } /*编辑*/)}
          </a>
        )}
        {fastReplyEdit && (
          <a className="edit" onClick={this.onFastReplyEdit}>
            {this.$t({ id: 'common.cancel' } /*取消*/)}
          </a>
        )}
      </div>
    );
    return (
      <div className="contract-detail" style={{ margin: '-12px -14px' }}>
        <ContractWorkflowDetailCommon
          wrappedComponentRef={ref => (this.detail = ref)}
          id={this.props.match.params.id}
          isApprovePage={true}
          getContractStatus={this.getStatus}
        />
        {!isConfirm && (
          <Affix
            offsetBottom={0}
            className="bottom-bar bottom-bar-approve"
            style={{ paddingLeft: 15 }}
          >
            <Row>
              <Col span={21}>
                <ApproveBar
                  passLoading={passLoading}
                  style={{ paddingLeft: 40 }}
                  backUrl={'/approval-management/contract-approve'}
                  rejectLoading={rejectLoading}
                  handleApprovePass={this.handleApprove}
                  handleApproveReject={this.handleApproveReject}
                />
              </Col>
            </Row>
          </Affix>
          /*<Affix offsetBottom={0} className="bottom-bar bottom-bar-approve">
            <Row style={{ paddingLeft: 20, marginLeft: -15 }}>
              <Col span={24}>
                <Row>
                  <ApproveBar
                    backUrl={"/approval-management/contract-approve"}
                    style={{ paddingLeft: 60 }}
                    passLoading={passLoading}
                    rejectLoading={rejectLoading}
                    handleApprovePass={this.handleApprove}
                    handleApproveReject={this.handleApproveReject}
                  />
                </Row>
              </Col>
            </Row>
          </Affix>*/
        )}
        {isConfirm && (
          <Affix offsetBottom={0} className="bottom-bar-jsq">
            <Button style={{ marginLeft: 33 }} onClick={this.goBack} className="back-btn">
              {this.$t({ id: 'common.back' } /*返回*/)}
            </Button>
          </Affix>
        )}
      </div>
    );
  }
}

const wrappedContractWorkflowApproveDetail = Form.create()(ContractWorkflowApproveDetail);
export default connect(
  null,
  null,
  null,
  { withRef: true }
)(wrappedContractWorkflowApproveDetail);
