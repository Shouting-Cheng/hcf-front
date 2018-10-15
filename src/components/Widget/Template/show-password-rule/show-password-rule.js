import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

class ShowPasswordRule extends React.Component {
  componentWillMount() {}

  componentDidMount() {}

  //密码长度
  renderLength = () => {
    let passwordRule = this.props.rule;
    if (passwordRule.minLength == passwordRule.maxLength) {
      return (
        <span>
          <span>
            {/*长度为*/}
            {this.$t('reset-password.rule.len2')}
          </span>
          <span>&nbsp;{passwordRule.maxLength}&nbsp;</span>
          <span>{this.$t('security.password.tips')}</span>
        </span>
      );
    } else {
      return (
        <span>
          <span>
            {/*长度为*/}
            {this.$t('reset-password.rule.len2')}
          </span>
          <span>&nbsp;{passwordRule.minLength}&nbsp;</span>
          <span>
            {/*至*/}
            {this.$t('reset-password.rule.to')}
          </span>
          <span>&nbsp;{passwordRule.maxLength}&nbsp;</span>
          <span>{this.$t('security.password.tips')}</span>
        </span>
      );
    }
  };
  //是否需要数字
  renderNeedNumber = () => {
    let passwordRule = this.props.rule;
    if (passwordRule.isNeedNumber) {
      return (
        <span>
          <span>,</span>
          <span>
            {/*必包含数字*/}
            {this.$t('reset-password.rule.num2')}
          </span>
        </span>
      );
    }
  };
  //是否需要小写字母
  renderNeedLowercase = () => {
    let passwordRule = this.props.rule;
    if (passwordRule.isNeedLowercase) {
      return (
        <span>
          <span>,</span>
          <span>
            {/*必包含小写字母*/}
            {this.$t('reset-password.rule.lower2')}
          </span>
        </span>
      );
    }
  };

  //是否需要大写字母
  renderNeedUppercase = () => {
    let passwordRule = this.props.rule;
    if (passwordRule.isNeedUppercase) {
      return (
        <span>
          <span>,</span>
          <span>
            {/*必包含大写字母*/}
            {this.$t('reset-password.rule.upper2')}
          </span>
        </span>
      );
    }
  };
  //是否需要特殊字符
  renderNeedSpecialChar = () => {
    let passwordRule = this.props.rule;
    if (passwordRule.isNeedSpecialChar) {
      return (
        <span>
          <span>,</span>
          <span>
            {/*必包含特殊字符*/}
            {this.$t('reset-password.rule.special2')}
          </span>
        </span>
      );
    }
  };
  render() {
    return (
      <div>
        <div>
          <span>
            {/*新密码规则*/}
            {this.$t('reset-password.rule')}
          </span>
          {this.renderLength()}
          {this.renderNeedNumber()}
          {this.renderNeedLowercase()}
          {this.renderNeedUppercase()}
          {this.renderNeedSpecialChar()}
        </div>
      </div>
    );
  }
}

ShowPasswordRule.contextTypes = {
  router: PropTypes.object,
};
ShowPasswordRule.defaultProps = {};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: state.main.tenantMode,
    company: state.login.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ShowPasswordRule);
