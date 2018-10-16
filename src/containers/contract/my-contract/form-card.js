/**
 * Created by 13576 on 2018/3/8.
 */
import React from 'react';
import { connect } from 'dva';
import { Collapse, Timeline, Spin, Row, Col } from 'antd';
import 'styles/contract/my-contract/from-card.scss';
import PropTypes from 'prop-types';

/**
 *
 关联预付款，
 关联报账单
 */
class FormCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: {
        '1001': { label: this.$t('common.editing'), state: 'default' },
        '1004': { label: this.$t('common.approve.pass'), state: 'success' },
        '1002': { label: this.$t('common.approving'), state: 'processing' },
        '1005': { label: this.$t('common.approve.rejected'), state: 'error' },
        '1003': { label: this.$t('common.withdraw'), state: 'warning' },
        '2002': { label: this.$t('constants.approvelHistory.auditPass'), state: 'success' },
        '2004': { label: this.$t('my.pay.success'), state: 'success' },
        '2003': { label: this.$t('my.paying'), state: 'processing' },
      },
    };
  }
  renderInformData = () => {
    const formType = this.props.formType;
    let renderInformData = [];

    if (formType == 'prePayment') {
      const lineData = this.props.basicsData.item.line;
      const prePaymentHeader = this.props.basicsData.item.head;

      for (let i = 0; i < lineData.length; i++) {
        let item = lineData[i];
        renderInformData.push(
          <div className={i != lineData.length - 1 ? 'form-line' : 'form-line2'} key={item.id}>
            <Row>
              <Row>
                <Col>
                  <span>
                    <b>
                      {this.props.formType == 'prePayment'
                        ? `${this.$t('my.pre.line.num')} :  ${i + 1}`
                        : this.$t('my.remise.line.num')}
                    </b>
                  </span>
                </Col>
              </Row>
              <br />
              <Row>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('my.link.line.number')} : `}</span>
                  <span>{i + 1}</span>
                </Col>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('pay.workbench.payee')} : `}</span>
                  <span>
                    {item.refDocumentName}
                    {item.partnerName}
                  </span>
                </Col>
              </Row>
              <br />
              <Row>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t(
                    'payment.batch.company.payWay'
                  )} :   `}</span>
                  <span>{item.paymentMethodName}</span>
                </Col>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('my.link.amount')} : `}</span>
                  <span>{`${item.currency}  ${item.functionAmount}`}</span>
                </Col>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('common.column.status')} :  `}</span>
                  <span>{this.state.status[prePaymentHeader.status].label}</span>
                </Col>
              </Row>
            </Row>
          </div>
        );
      }
      return renderInformData;
    } else if (formType == 'account') {
      const lineData = this.props.basicsData.item.expensePaymentScheduleList;
      const accountHeader = this.props.basicsData.item.expenseReportHeader;
      for (let i = 0; i < lineData.length; i++) {
        let item = lineData[i];
        renderInformData.push(
          <div className={i != lineData.length - 1 ? 'form-line' : 'form-line2'} key={item.id}>
            <Row>
              <Row>
                <Col>
                  <span>
                    <b>{`${this.$t('my.remise.line.num')}： ${item.scheduleLineNumber}`}</b>
                  </span>
                </Col>
              </Row>
              <br />
              <Row>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('my.link.line.number')} : `}</span>
                  <span>{item.contractLineNumber}</span>
                </Col>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('pay.workbench.payee')} : `}</span>
                  <span>
                    {item.payeeCategoryName}
                    {item.partnerName}
                  </span>
                </Col>
              </Row>
              <br />
              <Row>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t(
                    'payment.batch.company.payWay'
                  )} :   `}</span>
                  <span>{item.paymentMethodName}</span>
                </Col>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('my.link.amount')} : `}</span>
                  <span>{`${item.currencyCode}  ${item.relationFunctionAmount}`}</span>
                </Col>
                <Col span={8}>
                  <span style={{ color: 'black' }}>{`${this.$t('common.column.status')} :  `}</span>
                  <span>{this.state.status[accountHeader.reportStatus].label}</span>
                </Col>
              </Row>
            </Row>
          </div>
        );
      }
      return renderInformData;
    }
  };

  render() {
    let header;
    let panelHeader = null;
    if (this.props.formType === 'prePayment') {
      header = this.props.basicsData.item.head;
      panelHeader = (
        <div className="beep-info-in">
          <span
            className="beep-info-title"
            style={{ fontSize: '15px', color: 'black', marginRight: '24px' }}
          >
            {this.$t('pay.refund.documentNumber') + ':'}
            <a>{header.requisitionNumber}</a>
          </span>
          <span
            className="beep-info-title"
            style={{ fontSize: '15px', color: 'black', marginRight: '24px' }}
          >{`${this.$t('pay.workbench.applicant')} : ${header.employeeName} - ${
            header.employeeId
          }`}</span>
          <span
            className="beep-info-title"
            style={{ fontSize: '15px', color: 'black', marginRight: '24px' }}
          >{`${this.$t('acp.requisitionDate')} : ${header.createdDate.substring(0, 10)} `}</span>
        </div>
      );
    } else if (this.props.formType === 'account') {
      header = this.props.basicsData.item.expenseReportHeader;
      panelHeader = (
        <div className="beep-info-in">
          <span
            className="beep-info-title"
            style={{ fontSize: '15px', color: 'black', marginRight: '24px' }}
          >
            {this.$t('pay.workbench.receiptNumber') + ':  '}
            <a>{header.businessCode}</a>
          </span>
          <span
            className="beep-info-title"
            style={{ fontSize: '15px', color: 'black', marginRight: '24px' }}
          >{`${this.$t('pay.workbench.applicant')} : ${header.applicationName} - ${
            header.applicationId
          }`}</span>
          <span
            className="beep-info-title"
            style={{ fontSize: '15px', color: 'black', marginRight: '24px' }}
          >{`${this.$t('acp.requisitionDate')} : ${header.createdDate.substring(0, 10)} `}</span>
        </div>
      );
    }
    return (
      <div className="form-card">
        <Collapse defaultActiveKey="1">
          <Collapse.Panel header={panelHeader} key="1">
            {this.renderInformData()}
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
FormCard.propTypes = {
  basicsData: PropTypes.object, //传入的基础信息值
  formType: PropTypes.string, //单据类型, "prePayment","account"
};

FormCard.defaultProps = {
  basicsData: {},
  formType: '',
};

export default FormCard;
