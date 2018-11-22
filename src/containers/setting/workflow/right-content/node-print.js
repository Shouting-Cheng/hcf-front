import React from 'react'
import { connect } from 'dva'
import { Form, Card, Button, Input, message } from 'antd'
const FormItem = Form.Item;
import PropTypes from 'prop-types';

import workflowService from 'containers/setting/workflow/workflow.service'

class NodePrint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    }
  }

  //保存基础信息
  handleSaveBasicInfo = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { basicInfo } = this.props;
        let params = values;
        params.approvalActions = basicInfo.approvalActions;
        params.code = basicInfo.code;
        params.name = basicInfo.name;
        params.notifyInfo = basicInfo.notifyInfo;
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
    const { basicInfo } = this.props;
    const { loading } = this.state;
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 21},
    };
    return (
      <div className='node-print'>
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
            <Button type="primary" htmlType="submit" loading={loading}>{this.$t('common.save')}</Button>
          </Form>
        </Card>
      </div>
    )
  }
}

NodePrint.propTypes = {
  basicInfo: PropTypes.object,
  basicInfoSaveHandle: PropTypes.func, //基本信息保存成功的回调
};


function mapStateToProps(state) {
  return {

  }
}

const wrappedNodePrint = Form.create()(NodePrint);

export default connect(mapStateToProps)(wrappedNodePrint)
