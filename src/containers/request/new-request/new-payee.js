import PropTypes from 'prop-types';
/**
 * 收款人控件 messageKey: payee
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Select } from 'antd';
const Option = Select.Option;

import requestService from 'containers/request/request.service';
import debounce from 'lodash.debounce';

class NewPayee extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      options: [],
    };
    this.handleSearch = debounce(this.handleSearch, 250);
  }

  componentDidMount() {
    this.setState({ value: this.props.value });
  }

  handleSearch = value => {
    value &&
      requestService.getPayee(0, 20, value).then(res => {
        this.setState({ options: res.data });
      });
  };

  handleChange = value => {
    this.setState({ value });
    this.onChange(value);
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { value, options } = this.state;
    return (
      <div className="new-payee">
        <Select
          placeholder={this.$t('common.please.enter')}
          showSearch
          labelInValue
          allowClear
          value={value}
          disabled={this.props.disabled}
          showArrow={false}
          filterOption={false}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          defaultActiveFirstOption={false}
          onFocus={() => this.handleSearch(this.props.user.employeeID.substring(0, 1))}
          onSearch={this.handleSearch}
          onChange={this.handleChange}
        >
          {options.map(option => {
            return (
              <Option value={option.userOid} key={option.userOid}>
                {option.employeeID} | {option.fullName} |{' '}
                {option.department
                  ? option.department.name
                  : this.$t('expense.invoice.type.unknown') /*"未知"*/}{' '}
                | {option.title || this.$t('expense.invoice.type.unknown') /*"未知"*/}
              </Option>
            );
          })}
        </Select>
      </div>
    );
  }
}

NewPayee.propTypes = {
  value: PropTypes.object,
  disabled: PropTypes.bool,
};

NewPayee.defaultProps = {
  value: undefined,
  disabled: false,
};

function mapStateToProps(state) {
  return {
    user: state.login.user,
  };
}

const wrappedNewPayee = Form.create()(NewPayee);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewPayee);
