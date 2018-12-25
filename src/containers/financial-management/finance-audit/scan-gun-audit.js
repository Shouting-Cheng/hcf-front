import { messages } from 'share/common';
import React from 'react';

import { Input, message, Form, Button } from 'antd';
import 'styles/financial-management/scan-send.scss';
import menuRoute from 'routes/menuRoute';
import financeAuditService from 'containers/financial-management/finance-audit/finance-audit.service';
class ScanGunAudit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      financeAudit: menuRoute.getRouteItem('finance-audit'),
      expenseDetailAudit: menuRoute.getRouteItem('expense-report-detail-audit'),
    };
  }

  componentDidMount() {
    this.input.focus();
  }

  handlePressEnter = e => {
    financeAuditService.scan(e.target.value).then(res => {
      if (res.data.expenseReport) {
        this.context.router.push(
          this.state.expenseDetailAudit.url
            .replace(':expenseReportOid', res.data.expenseReport.expenseReportOid)
            .replace(':backType', 'history') +
            (res.data.expenseReport.status === 1003 ? '?prending_audit=true' : '')
        );
      } else {
        message.error(res.data.msg);
      }
      this.props.form.resetFields();
    });
  };

  handleClickSwitch = () => {
    this.context.router.push(this.state.financeAudit.url);
  };

  render() {
    return (
      <div className="scan-send">
        <Button type="primary" icon="layout" onClick={this.handleClickSwitch}>
          {messages('finance.audit.normal.audit') /*普通审核*/}
        </Button>
        <h1>{messages('finance.audit.sweepGun') /*扫码枪审核*/}</h1>
        {this.props.form.getFieldDecorator('code')(
          <Input onPressEnter={this.handlePressEnter} ref={input => (this.input = input)} />
        )}
      </div>
    );
  }
}

ScanGunAudit.contextTypes = {
  router: React.PropTypes.object,
};

const WrappedScanGunAudit = Form.create()(ScanGunAudit);

export default WrappedScanGunAudit;
