import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'dva';
import { Form, Icon } from 'antd';

class LoanRepaymentAmount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonRoleSwitch: this.props.isOwner
        ? true
        : this.checkPageRole('LOANBILLMANAGEMENT', 2) &&
          this.checkFunctionProfiles(['er.disabled'], [[false, undefined]]) &&
          this.checkFunctionProfiles(['finance.audit.disabled'], [[false, undefined]]), //按钮操作权限
    };
  }

  //格式化money
  renderMoney = value => {
    let numberString = Number(value || 0)
      .toFixed(2)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += numberString.indexOf('.') > -1 ? '' : '.00';
    return numberString;
  };

  //新建还款
  toRepayment = () => {
    this.props.handleToRepayment();
  };

  render() {
    const { info } = this.props;
    const { buttonRoleSwitch } = this.state;
    let repaymentInfo = info.writeoffArtificialDTO || {}; //还款信息
    return (
      (info.status === 1005 || info.status === 1006 || info.status === 1007) && (
        <span className="loan-repayment-amount">
          {repaymentInfo.hasWriteoffAmount !== info.originCurrencyTotalAmount && (
            <span>
              {repaymentInfo.hasWriteoffAmount
                ? `${this.$t('request.detail.loan.has.been.payment') /*已还款*/}：${
                    repaymentInfo.currencyCode
                  }  ${this.renderMoney(repaymentInfo.hasWriteoffAmount)}`
                : ''}
              {repaymentInfo.hasWriteoffAmount ? <span className="ant-divider" /> : ''}
              {repaymentInfo.lockedWriteoffAmount ? (
                <span style={{ color: '#00a854' }}>
                  {this.$t('request.detail.loan.in.the.payment') /*还款中*/}：{
                    repaymentInfo.currencyCode
                  }&nbsp; {this.renderMoney(repaymentInfo.lockedWriteoffAmount)}
                </span>
              ) : (
                ''
              )}
              {repaymentInfo.lockedWriteoffAmount && repaymentInfo.stayWriteoffAmount ? (
                <span className="ant-divider" />
              ) : (
                ''
              )}
              {repaymentInfo.stayWriteoffAmount ? (
                <span>
                  <span style={{ color: '#108ee9', marginRight: 10 }}>
                    {this.$t('request.detail.loan.balance') /*待还款*/}：{
                      repaymentInfo.currencyCode
                    }&nbsp; {this.renderMoney(repaymentInfo.stayWriteoffAmount)}
                  </span>
                  {buttonRoleSwitch && (
                    <a onClick={this.toRepayment}>
                      {this.$t('request.detail.loan.create.payment') /*新建还款*/} >
                    </a>
                  )}
                </span>
              ) : (
                ''
              )}
            </span>
          )}
          {repaymentInfo.hasWriteoffAmount === info.originCurrencyTotalAmount && (
            <span className="repayment-all">
              <Icon type="check-circle-o" className="repayment-all-icon" />
              {this.$t('request.detail.loan.all.repayment.completed') /*已全额还款*/}
            </span>
          )}
        </span>
      )
    );
  }
}

LoanRepaymentAmount.propTypes = {
  info: PropTypes.object,
  isOwner: PropTypes.bool, //是否为登录人控件，涉及权限
  handleToRepayment: PropTypes.func, //新建还款
};

LoanRepaymentAmount.defaultProps = {
  info: {},
  isOwner: false,
  handleToRepayment: () => {},
};

function mapStateToProps() {
  return {};
}

const wrappedLoanRepaymentAmount = Form.create()(LoanRepaymentAmount);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedLoanRepaymentAmount);
