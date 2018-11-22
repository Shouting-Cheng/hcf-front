import React from 'react'
import { connect } from 'dva'
import { Form, Card, Input, Button, Radio, Icon, message } from 'antd'
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;
import PropTypes from 'prop-types';

import workflowService from 'containers/setting/workflow/workflow.service'

class NodeApproveAi extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      approvalAction: this.props.basicInfo.approvalActions
    }
  }

  //保存基础信息
  handleSaveBasicInfo = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { basicInfo } = this.props;
        let params = values;
        params.code = basicInfo.code;
        params.countersignRule = basicInfo.countersignRule;
        params.name = basicInfo.name;
        params.nullableRule = basicInfo.nullableRule;
        params.repeatRule = basicInfo.repeatRule;
        params.ruleApprovalNodeOID = basicInfo.ruleApprovalNodeOID;
        params.status = basicInfo.status;
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
    const { basicInfo } = this.props;
    const { loading, approvalAction } = this.state;
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 21},
    };
    return (
      <div className='node-approve-ai'>
        <Card className="basic-info-container">
          <h3 className="title">{this.$t('setting.key1371'/*基础信息*/)}</h3>
          <Form onSubmit={this.handleSaveBasicInfo}>
            <FormItem {...formItemLayout} label={this.$t('setting.key1372'/*节点名称*/)} colon={false}>
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
            <FormItem {...formItemLayout} label={this.$t('setting.key1373'/*节点类型*/)} colon={false}>
              {getFieldDecorator('approvalActions', {
                initialValue: basicInfo.approvalActions
              })(
                <RadioGroup onChange={e => {this.setState({approvalAction: e.target.value})}}>
                  <Radio value="8001">
                    {this.$t('setting.key1374'/*通过*/)}
                    <span className="approve-type-notice">{this.$t('setting.key1375'/*符合审批条件则系统自动审批通过,否则自动跳过到下一个节点*/)}</span>
                  </Radio>
                  <Radio value="8002">
                    {this.$t('setting.key1376'/*驳回*/)}
                    <span className="approve-type-notice">{this.$t('setting.key1377'/*符合审批条件则系统自动审批驳回,否则自动跳过到下一个节点*/)}</span>
                  </Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={this.$t('setting.key1378'/*审批意见*/)} colon={false}>
              {getFieldDecorator('comments', {
                rules: [{
                  max: 50,
                  message: this.$t('common.max.characters.length', {max: 50})
                }],
                initialValue: basicInfo.comments
              })(
                <TextArea placeholder={approvalAction === '8001' ? this.$t('setting.key1379'/*系统自动通过*/) :
                                        this.$t('setting.key1380'/*系统自动驳回*/)}
                          rows={2} style={{resize: 'none', width: 400}}/>
              )}
            </FormItem>
            <Button type="primary" htmlType="submit" loading={loading}>{this.$t('common.save')}</Button>
          </Form>
        </Card>
        <div className="add-btn-container">
          <Icon type="exclamation-circle-o" className="approve-info-icon"/>
          <span className="approve-info-text">{this.$t('setting.key1381'/*一个条件组内多条件为and关系, 不同条件组为or关系*/)}</span>
        </div>
      </div>
    )
  }
}

NodeApproveAi.propTypes = {
  basicInfo: PropTypes.object,
  basicInfoSaveHandle: PropTypes.func, //基本信息保存成功的回调
};

function mapStateToProps(state) {
  return {

  }
}

const wrappedNodeApproveAi = Form.create()(NodeApproveAi);

export default connect(mapStateToProps)(wrappedNodeApproveAi)
