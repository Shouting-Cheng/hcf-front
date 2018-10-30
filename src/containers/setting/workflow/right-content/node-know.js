import React from 'react'
import { connect } from 'dva'
import { Form, Card, Button, Input, Checkbox, message, Icon, Spin } from 'antd'
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const TextArea = Input.TextArea;
import PropTypes from 'prop-types';

import AddPersonModal from 'containers/setting/workflow/right-content/add-person-modal'
import workflowService from 'containers/setting/workflow/workflow.service'

class NodeKnow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      notifyInfoOption: [
        {label: this.$t('workflow.detail.app.message'/*APP消息*/), value: 'isApp'},
        {label: (
          <div className="notify-weChat">
            {this.$t('workflow.detail.weChat.message')/*微信企业号消息*/}
            <span> {this.$t('workflow.detail.weChat.message.info')/*请先开通微信企业号，并联系客服启用汇联易微信版本*/}</span>
          </div>
        ), value: 'isWeChat'},
        {label: this.$t('workflow.detail.web.message'/*网页端消息*/), value: 'isWeb'}
      ],
      notifyWay: [],
      notifyTitle: this.props.basicInfo.notifyInfo.title,
    }
  }

  componentDidMount() {
    let notifyWay = [];
    this.props.basicInfo.notifyInfo.isApp && notifyWay.push('isApp');
    this.props.basicInfo.notifyInfo.isWeChat && notifyWay.push('isWeChat');
    this.props.basicInfo.notifyInfo.isWeb && notifyWay.push('isWeb');
    this.setState({ notifyWay })
  }

  //保存基础信息
  handleSaveBasicInfo = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { basicInfo } = this.props;
        let params = {};
        params.remark = values.remark;
        params.notifyInfo = {
          title: values.title,
          content: values.content,
          isApp: values.notifyWay.indexOf('isApp') !== -1,
          isWeChat: values.notifyWay.indexOf('isWeChat') !== -1,
          isWeb: values.notifyWay.indexOf('isWeb') !== -1,
          isMoney: true,
          isName: true,
          isReason: true
        };
        params.code = basicInfo.code;
        params.level = basicInfo.level;
        params.level = basicInfo.level;
        params.nextRuleApprovalNodeOID = basicInfo.nextRuleApprovalNodeOID;
        params.ruleApprovalChainOID = basicInfo.ruleApprovalChainOID;
        params.ruleApprovalNodeOID = basicInfo.ruleApprovalNodeOID;
        params.type = basicInfo.type;
        this.setState({ loading: true });
        workflowService.modifyApprovalNodes(params).then(() => {
          this.setState({ loading: false });
          this.props.basicInfoSaveHandle();
          message.success(this.$t('common.save.success', {name: ''}))
        }).catch(() => {
          this.setState({ loading: false })
        })
      }
    })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { user, basicInfo, formInfo } = this.props;
    const { loading, notifyInfoOption, notifyWay, notifyTitle } = this.state;
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 21},
    };
    return (
      <div className='node-know'>
        <Card className="basic-info-container">
          <h3 className="title">{this.$t('workflow.detail.node.basic.info')/*基础信息*/}</h3>
          <Form onSubmit={this.handleSaveBasicInfo}>
            <FormItem {...formItemLayout} label={this.$t('workflow.detail.node.name')/*节点名称*/} colon={false}>
              {getFieldDecorator('remark', {
                rules: [{
                  max: 8,
                  message: this.$t('common.max.characters.length', {max: 8})
                }],
                initialValue: basicInfo.remark
              })(
                <Input placeholder={this.$t('common.please.enter')} style={{width: 200}} autoComplete="off"/>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={this.$t('workflow.detail.notify.way')/*知会方式*/} colon={false}>
              {getFieldDecorator('notifyWay', {
                initialValue: notifyWay
              })(
                <CheckboxGroup options={notifyInfoOption}/>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={this.$t('workflow.detail.notify.format')/*知会格式*/} colon={false}>
              <div>{this.$t('workflow.detail.notify.format.tip')/*点击知会消息将进入单据详情页，只能查看，不可编辑*/}</div>
              <FormItem {...formItemLayout} label={this.$t('workflow.detail.notify.title')/*标题*/} colon={false}>
                <div>{this.$t('workflow.detail.notify.title.example')/*姓名 - 单据名称 - 自定义标题*/}</div>
                {getFieldDecorator('title', {
                  rules: [{
                    max: 20,
                    message: this.$t('common.max.characters.length', {max: 20})
                  }],
                  initialValue: notifyTitle
                })(
                  <Input placeholder={this.$t('workflow.detail.notify.title.placeholder'/*可输入自定义标题，最多20个字符*/)}
                         style={{width: 400}} autoComplete="off"
                         onChange={e => {this.setState({notifyTitle: e.target.value})}}/>
                )}
                <h4 className="notify-title-show">{this.$t('workflow.detail.notify.title.show')/*知会标题预览*/}：</h4>
                <div>{user.fullName} - {formInfo.formName}{notifyTitle ? ` - ${notifyTitle}` : ''}</div>
              </FormItem>
              <FormItem {...formItemLayout} label={this.$t('workflow.detail.notify.content')/*正文*/} colon={false}>
                <div>{this.$t('workflow.detail.notify.content.tip')/*单据上的【事由】*/}</div>
                {getFieldDecorator('content', {
                  rules: [{
                    max: 100,
                    message: this.$t('common.max.characters.length', {max: 100})
                  }],
                  initialValue: basicInfo.notifyInfo.content
                })(
                  <TextArea placeholder={this.$t('workflow.detail.notify.content.placeholder'/*可输入自定义事由，最多100个字符*/)}
                            rows={3} style={{resize: 'none', width: 400}}/>
                )}
              </FormItem>
            </FormItem>
            <Button type="primary" htmlType="submit" loading={loading}>{this.$t('common.save')}</Button>
          </Form>
        </Card>
        <div className="add-btn-container">
          <Button type="primary" onClick={() => this.props.addPersonModalVisible(true)}>{this.$t('workflow.detail.add.notify.person')/*添加知会人员*/}</Button>
          <Icon type="exclamation-circle-o" className="approve-info-icon"/>
          <span className="approve-info-text">{this.$t('workflow.detail.add.approve.condition.tip')/*一个条件组内多条件为and关系, 不同条件组为or关系*/}</span>
        </div>
      </div>
    )
  }
}

NodeKnow.propTypes = {
  basicInfo: PropTypes.object,
  formInfo: PropTypes.object,
  basicInfoSaveHandle: PropTypes.func, //基本信息保存成功的回调
  addPersonModalVisible: PropTypes.func, //用于添加审批人modal是否显示的传参
};


function mapStateToProps(state) {
  return {
    user: state.user.currentUser
  }
}

const wrappedNodeKnow = Form.create()(NodeKnow);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNodeKnow)
