import React from 'react';
import { connect } from 'dva';
import { Affix, message, Button, Modal, Icon } from 'antd';
import ApproveBar from 'widget/Template/approve-bar';
import financeAuditService from 'containers/financial-management/finance-audit/finance-audit.service';
import baseService from 'share/base.service';
import PropTypes from 'prop-types';
import expenseReportService from 'containers/expense-report/expense-report.service';

class AuditApplicationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passLoading: false,
      rejectLoading: false,
      noticeLoading: false,
      printLoading: false,
      checkLoading: false,
      modalShow: false,
      approvalTxtString: '',
      invoiceNumber: 0,
      invoice: [],
      financeAuditList: menuRoute.getRouteItem('finance-audit'),
    };
  }

  componentWillMount() {
    expenseReportService.checkInvoice(this.props.expenseOid).then(res => {
      this.setState({
        invoiceNumber: res.data.length,
        invoice: res.data,
      });
    });
  }

  //返回
  goBack = () => {
    this.context.router.push(
      this.state.financeAuditList.url +
        `?tab=${location.search.indexOf('prending_audit') > -1 ? 'prending_audit' : 'audit_pass'}`
    );
  };

  handleApprovePass = value => {
    value = value ? (typeof value !== 'string' ? this.state.approvalTxtString : value) : value;
    const { entityOID, entityType } = this.props;
    let params = {
      approvalTxt: value ? value.trim() : value,
      entities: [
        {
          entityOID,
          entityType,
        },
      ],
    };
    this.setState({ passLoading: true });
    financeAuditService
      .auditPass(params)
      .then(res => {
        if (res.status === 200 && res.data.failNum === 0) {
          message.success(this.$t('common.operate.success') /*操作成功*/);
          this.setState({ passLoading: false });
          this.goBack();
        } else {
          this.setState({ passLoading: false });
          if (res.data.failReason && res.data.failReason[entityOID]) {
            message.error(res.data.failReason[entityOID]); //'的报销单审核失败'
            return !1;
          }
          message.error(this.$t('common.operate.filed') /*操作失败*/);
        }
      })
      .catch(e => {
        this.setState({ passLoading: false });
        e.response.data.message
          ? message.error(`${this.$t('common.operate.filed')}，${e.response.data.message}`)
          : message.error(this.$t('common.operate.filed') /*操作失败*/);
      });
  };

  invoiceNumberPass = value => {
    this.setState({ approvalTxtString: value });
    const { invoiceNumber } = this.state;
    invoiceNumber === 0 ? this.handleApprovePass(value) : this.setState({ modalShow: true });
  };

  handleApproveReject = value => {
    const { entityOID, entityType } = this.props;
    let params = {
      approvalTxt: value,
      entities: [
        {
          entityOID,
          entityType,
        },
      ],
    };
    this.setState({ rejectLoading: true });
    financeAuditService
      .auditReject(params)
      .then(res => {
        if (res.status === 200 && res.data.failNum === 0) {
          message.success(this.$t('common.operate.success') /*操作成功*/);
          this.setState({ rejectLoading: false });
          this.goBack();
        } else {
          this.setState({ rejectLoading: false });
          modal && this.setState({ paperReject: false, paperLoading: false });
          let errorMessage = res.data.failReason[params.entities[0].entityOID];
          message.error(errorMessage);
        }
      })
      .catch(e => {
        this.setState({ rejectLoading: false });
        modal && this.setState({ paperReject: false, paperLoading: false });
        message.error(this.$t('common.operate.filed') /*操作失败*/);
      });
  };

  handleAuditNotice = value => {
    const { entityOID, entityType } = this.props;
    let params = {
      entityOID,
      entityType,
      notice: value,
    };
    this.setState({ noticeLoading: true });
    financeAuditService
      .noticeApplication(params)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t('common.operate.success') /*操作成功*/);
          this.setState({ noticeLoading: false });
          this.goBack();
        }
      })
      .catch(e => {
        this.setState({ noticeLoading: false });
        message.error(this.$t('common.operate.filed') /*操作失败*/);
      });
  };

  handlePrint = () => {
    const { entityOID } = this.props;
    this.setState({ printLoading: true });
    if (this.props.entityType === 1002) {
      baseService.printExpense(entityOID).then(res => {
        this.setState({ printLoading: false });
        window.open(res.data.link, '_blank');
      });
    } else {
      baseService.printApplication(entityOID).then(res => {
        this.setState({ printLoading: false });
        window.open(res.data.link, '_blank');
      });
    }
  };

  handleAuditCheck = () => {
    const invoice = this.state.invoice;
    this.setState({ checkLoading: true });
    expenseReportService.recheckInvoice(invoice).then(res => {
      if (res.data.failedCount === 0) {
        this.setState({ invoiceNumber: 0, invoice: [] });
        message.success(this.$t('expense.date.invoice.verified') /*发票查验成功*/);
      } else {
        this.setState({ invoiceNumber: res.data.failedCount, invoice: res.data.failedList });
        message.warn(this.$t('expense.date.fail.info') /*有查验失败的发票信息*/);
      }
      if (res.data.successList.length > 0) {
        this.props.afterClose(true);
      }
      this.setState({ checkLoading: false });
    });
  };

  closeModal = () => {
    this.setState({ modalShow: false });
  };

  render() {
    const {
      passLoading,
      rejectLoading,
      noticeLoading,
      printLoading,
      financeAuditList,
      invoiceNumber,
      checkLoading,
      modalShow,
      paperReject,
      paperLoading,
    } = this.state;
    const { profile, status } = this.props;
    let moreButtons = [];
    moreButtons.push('noticeBtn');
    invoiceNumber > 0 && moreButtons.push('auditCheck');
    return status === 1003 &&
      location.search.indexOf('prending_audit') > -1 &&
      !(profile['er.disabled'] && 1002 === this.props.entityType) ? (
      <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve">
        <ApproveBar
          backUrl={financeAuditList.url + '?tab=prending_audit'}
          passLoading={passLoading}
          rejectLoading={rejectLoading}
          noticeLoading={noticeLoading}
          printLoading={printLoading}
          moreButtons={moreButtons}
          handleApprovePass={this.invoiceNumberPass}
          handleApproveReject={this.handleApproveReject}
          handleAuditNotice={this.handleAuditNotice}
          handleAuditPrint={this.handlePrint}
          invoiceNumber={invoiceNumber}
          checkLoading={checkLoading}
          handleAuditCheck={this.handleAuditCheck}
          audit
        />
        <Modal
          onOk={this.handleApprovePass}
          onCancel={this.closeModal}
          okText={this.$t('constants.documentStatus.audit.pass') /*审核通过*/}
          cancelText={this.$t('common.cancel')}
          confirmLoading={passLoading}
          visible={modalShow}
          closable={false}
        >
          <div>
            <Icon
              type="exclamation-circle"
              style={{ color: '#F7C243', fontSize: '30', float: 'left' }}
            />
            <span style={{ lineHeight: '30px', fontSize: '20', marginLeft: '10px' }}>
              {this.$t('expense.date.fail.info') /*有查验失败的发票信息*/}
            </span>
            <div style={{ marginLeft: '40px', fontSize: '16px', color: 'red', lineHeight: '30px' }}>
              {this.$t('expense.date.still.approved') /*是否仍然审核通过*/}
            </div>
          </div>
        </Modal>
      </Affix>
    ) : (
      <Affix offsetBottom={0} className="bottom-bar">
        <Button type="primary" className="back-btn" onClick={this.goBack}>
          {this.$t('common.back') /*返回*/}
        </Button>
      </Affix>
    );
  }
}

AuditApplicationDetail.propTypes = {
  entityOID: PropTypes.string,
  entityType: PropTypes.number,
  status: PropTypes.number, //单据状态
  expenseOid: PropTypes.string,
  afterClose: PropTypes.func,
};

AuditApplicationDetail.defaultProps = {
  afterClose: () => {},
};

AuditApplicationDetail.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(AuditApplicationDetail);
