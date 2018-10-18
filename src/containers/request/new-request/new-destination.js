import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'dva';
import { Form, Select } from 'antd';
const Option = Select.Option;

import requestService from 'containers/request/request.service';
import debounce from 'lodash.debounce';
import 'styles/request/new-request/new-ven-master.scss';

class NewDestination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      destinationOptions: [],
    };
    this.handleChange = debounce(this.handleChange, 250);
  }

  componentDidMount() {
    this.setState({ value: this.props.value });
  }

  handleChange = value => {
    this.setState({ value });
    this.onChange(value);
    value &&
      requestService.getDestinationByKeywork(value).then(res => {
        this.setState({ destinationOptions: res.data });
      });
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { value, destinationOptions } = this.state;
    return (
      <div className="new-destination">
        <Select
          placeholder={this.$t('common.please.enter')}
          mode="combobox"
          value={value}
          showArrow={false}
          filterOption={false}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          defaultActiveFirstOption={false}
          onChange={this.handleChange}
        >
          {destinationOptions.map(option => {
            return (
              <Option value={option} key={option}>
                {option}
              </Option>
            );
          })}
        </Select>
      </div>
    );
  }
}

NewDestination.propTypes = {
  value: PropTypes.string,
};

NewDestination.defaultProps = {
  value: '',
};

function mapStateToProps(state) {
  return {};
}

const wrappedNewDestination = Form.create()(NewDestination);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewDestination);
