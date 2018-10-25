import React from 'react';
import { Form, Button, Input, message, Menu, Dropdown, Icon } from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;
import jobService from './job.service';
import { connect } from 'dva';

class JobInfoGlue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      oldGlue: [],
    };
  }

  componentWillMount() {
    this.getList();
  }

  componentDidMount() {
    let result = {};
    result['glueSource'] = this.props.params.jobInfoDetail.glueSource;
    result['glueRemark'] = this.props.params.jobInfoDetail.glueRemark;
    this.props.form.setFieldsValue(result);
  }

  onChange = e => {};

  getList = () => {
    this.setState({ loading: true });
    jobService
      .queryGlue(this.props.params.jobInfoDetail.id)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            oldGlue: res.data,
            loading: false,
          });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        message.error(
          this.$t({ id: 'common.error' } /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  };

  // 取消
  onCancel = () => {
    this.props.close();
  };
  // 保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        let param = { ...values };
        param['id'] = this.props.params.jobInfoDetail.id;
        jobService
          .saveGlue(param)
          .then(res => {
            this.setState({ loading: false });
            if (res.data.code === 200) {
              this.props.close(true);
              message.success(this.$t({ id: 'common.operate.success' } /*操作成功*/));
            } else {
              message.error(
                this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + res.data.msg
              );
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(
              this.$t({ id: 'common.operate.filed' } /*操作失败*/) + '!' + e.response.data.message
            );
          });
      }
    });
  };

  handleMenuClick = e => {
    let result = {};
    result['glueSource'] = e.item.props.glueSource;
    result['glueRemark'] = e.item.props.children;
    this.props.form.setFieldsValue(result);
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, oldGlue } = this.state;
    const formItemLayout = {};
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {oldGlue.map(item => {
          return (
            <Menu.Item key={item.id} glueSource={item.glueSource}>
              {item.glueRemark}
            </Menu.Item>
          );
        })}
      </Menu>
    );
    return (
      <div className="new-payment-requisition-line">
        <Dropdown overlay={menu} trigger={['click']}>
          <Button icon="cloud" type="primary">
            {this.$t({ id: 'job.glue.historyVersion' } /*历史版本*/)} <Icon type="down" />
          </Button>
        </Dropdown>
        <Form onSubmit={this.handleSave}>
          <FormItem
            {...formItemLayout}
            label={this.$t({ id: 'job.info.versionName' } /*版本名称*/)}
          >
            {getFieldDecorator('glueRemark', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label={this.$t({ id: 'job.info.glueSource' } /*源码*/)}>
            {getFieldDecorator('glueSource', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: '',
            })(<TextArea autosize={{ minRows: 20 }} />)}
          </FormItem>
          <div className="ant-modal-footer">
            <Button type="primary" htmlType="submit" loading={loading}>
              {this.$t({ id: 'common.save' } /*保存*/)}
            </Button>
            <Button onClick={this.onCancel} loading={loading}>
              {this.$t({ id: 'common.cancel' } /*取消*/)}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}
const wrappedJobInfoGlue = Form.create()(JobInfoGlue);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedJobInfoGlue);
