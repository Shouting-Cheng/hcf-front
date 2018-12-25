import { messages } from 'share/common';
import React from 'react';
import { connect } from 'react-redux';

import { Button, Input, Radio, Modal, message, Tag, Form } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
import config from 'config';
import menuRoute from 'routes/menuRoute';
import 'styles/financial-management/finance-audit/scan-audit.scss';
import ReconnectingWebSocket from 'reconnectingwebsocket';
import ScanAuditImg from 'images/scan-audit.png';
import baseService from 'share/base.service';
import FinanceAuditService from 'containers/financial-management/finance-audit/finance-audit.service';
class ScanAudit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      financeAudit: menuRoute.getRouteItem('finance-audit'),
      connectStatus: false,
      entityList: [],
      rejectEntity: {},
      hasConfirm: false,
      quickReply: [],
      loading: false,
    };
    this.connector = null;
    this.data = [];
  }

  componentWillUnmount = () => {
    if (this.connector) this.connector.close();
  };

  handleClickSwitch = () => {
    if (this.connector) this.connector.close();
    this.context.router.push(this.state.financeAudit.url);
  };

  componentDidMount = () => {
    this.getQuickReply();
    if (this.connector) this.connector.close();
    this.openWebSocket();
  };

  getQuickReply = () => {
    baseService.getQuickReply().then(res => {
      res.data.sort((a, b) => a.sequence > b.sequence || -1);
      this.setState({ quickReply: res.data });
    });
  };

  openWebSocket = () => {
    let url = `${config.wsUrl}/ws/scancode?scanMode=AUDIT`;
    this.connector = new ReconnectingWebSocket(url);
    this.connector.onopen = this.onOpen;
    this.connector.onerror = this.onError;
    this.connector.onmessage = this.onMessage;
    this.connector.onclose = this.onClose;
  };

  onOpen = () => {
    let body = {
      userOid: this.props.user.userOid,
      token: this.props.authToken.access_token,
    };
    let dict = {
      command: 'AUTH',
      body: JSON.stringify(body),
    };
    let dataSend = JSON.stringify(dict) + '\0';
    this.connector.send(dataSend);
  };

  onError = error => {
    this.setState({ connectStatus: false });
  };

  onMessage = message => {
    this.data.push(message.data);
    this.analyseData();
  };

  onClose = () => {
    if (this.state.connectStatus) this.setState({ connectStatus: false });
  };

  analyseData = () => {
    let lastReceive = this.data.pop();
    let end = '\0';
    if (lastReceive.indexOf(end) === -1) {
      this.data.push(lastReceive);
      return;
    }
    let temp = lastReceive.split(end);
    let expense = JSON.parse(this.data.join('') + temp[0]);
    if (temp[1] !== '') {
      this.data = [];
      this.data.push(temp[1]);
    }
    if (expense.command === 'ERROR') {
      if (this.state.hasConfirm) return;
      this.setState({ hasConfirm: true });
      Modal.confirm({
        title: 'Oops',
        content: expense.body,
        okText: messages('finance.audit.reconnect') /*重连*/,
        cancelText: messages('finance.audit.back.to.normal') /*返回普通审核*/,
        onOk: () => {
          this.setState({ hasConfirm: false });
        },
        onCancel: () => {
          this.setState({ hasConfirm: false });
          this.data = [];
          this.connector.close();
          this.handleClickSwitch();
        },
      });
    }
    expense.body = JSON.parse(expense.body);
    if (!expense.body || !expense.body.type || !expense.body.content) return;
    if (expense.command !== 'MESSAGE') return;
    let content = expense.body.content.split(':');
    let { entityList } = this.state;
    if (expense.body.type === 'AUTH_SUCCESS') {
      this.setState({ connectStatus: true });
    } else if (expense.body.type === 'EXPENSE_REPORT_PASS') {
      entityList.unshift({
        type: expense.body.type,
        entityOid: content[0] || '',
        businessCode: content[1] || '',
        name: content[2] || '',
        pass: true,
      });
      this.setState({ entityList }, () => {
        message.success(
          `${entityList[0].name}${
            messages('finance.audit.expense.report.passed') /*的报销单已通过*/
          }`
        );
      });
    } else if (expense.body.type === 'EXPENSE_REPORT_APPROVAL') {
      let rejectEntity = {
        type: expense.body.type,
        entityOid: content[0] || '',
        businessCode: content[1] || '',
        name: content[2] || '',
        pass: false,
      };
      this.setState({ rejectEntity });
    }
  };

  handleReject = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let { rejectEntity, entityList } = this.state;
        let params = {
          approvalTxt: values.approvalTxt,
          entities: [
            {
              entityOid: rejectEntity.entityOid,
              entityType: 1002,
            },
          ],
        };
        this.setState({ loading: true });
        FinanceAuditService.auditReject(params)
          .then(res => {
            if (res.status === 200 && res.data.failNum === 0) {
              entityList.unshift(JSON.parse(JSON.stringify(rejectEntity)));
              message.success(messages('common.operate.success') /*操作成功*/);
              this.setState({ loading: false, rejectEntity: {}, entityList });
            } else {
              this.setState({ loading: false });
              message.error(messages('common.operate.filed') /*操作失败*/);
            }
          })
          .catch(e => {
            this.setState({ loading: false });
            message.error(messages('common.operate.filed') /*操作失败*/);
          });
      }
    });
  };

  handleClickCancel = () => {
    this.setState({ rejectEntity: {} });
  };

  handleClickReply = reply => {
    this.props.form.setFieldsValue({ approvalTxt: reply });
  };

  render() {
    const { entityList, rejectEntity, quickReply, loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="scan-audit background-transparent">
        <Button type="primary" icon="layout" onClick={this.handleClickSwitch}>
          {messages('finance.audit.normal.audit') /*普通审核*/}
        </Button>
        <div className="reject-audit">
          {rejectEntity.businessCode ? (
            <div className="reject-audit-area">
              <div className="reject-audit-code">{rejectEntity.businessCode}</div>
              <div className="reject-audit-name">{rejectEntity.name}</div>
              <Form onSubmit={this.handleReject}>
                <FormItem label={messages('finance.audit.reject.reason') /*驳回理由*/}>
                  {getFieldDecorator('approvalTxt', {
                    rules: [
                      {
                        required: true,
                        max: 200,
                      },
                    ],
                  })(<TextArea rows={4} />)}
                </FormItem>
                <FormItem label={messages('finance.audit.quick.reply') /*快捷回复*/}>
                  {quickReply.length > 0 ? (
                    quickReply.map(item => (
                      <Tag
                        color="red"
                        key={item.id}
                        onClick={() => this.handleClickReply(item.reply)}
                      >
                        {item.reply}
                      </Tag>
                    ))
                  ) : (
                    <div className="no-reply">
                      {messages(
                        'finance.audit.no.quick.reply.info'
                      ) /*尚未设置快捷回复，请联系管理员在值列表中添加*/}
                    </div>
                  )}
                </FormItem>
                <Button type="primary" loading={loading} htmlType="submit">
                  {messages('common.reject') /*驳回*/}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleClickCancel}>
                  {messages('common.cancel') /*取消*/}
                </Button>
              </Form>
            </div>
          ) : (
            <div className="scan-alert">
              <img src={ScanAuditImg} />
              <h3>
                {messages(
                  'finance.audit.scan.audit.info'
                ) /*请打开汉得融晶app，扫描报销单上的二维码*/}
              </h3>
            </div>
          )}
        </div>
        <div className="pass-audit">
          <h4 className="pass-audit-title">
            {messages('finance.audit.scan.audit.result1') /*审核结果（在这里统一显示扫码*/}
            <Tag color="geekblue" style={{ marginLeft: 8 }}>
              {messages('common.pass') /*通过*/}
            </Tag>
            {messages('finance.audit.scan.audit.result2') /*和在此页面*/}
            <Tag color="magenta" style={{ marginLeft: 8 }}>
              {messages('common.reject') /*驳回*/}
            </Tag>
            {messages('finance.audit.scan.audit.result3') /*的单据）*/}
          </h4>
          <div className="pass-audit-result">
            {entityList.map(entity => (
              <Tag color={entity.pass ? 'geekblue' : 'magenta'} key={entity.entityOid}>
                {entity.businessCode}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.login.user,
    authToken: state.main.authToken,
  };
}

ScanAudit.contextTypes = {
  router: React.PropTypes.object,
};

const WrappedScanAudit = Form.create()(ScanAudit);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedScanAudit);
