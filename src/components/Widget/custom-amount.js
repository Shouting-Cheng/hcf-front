import React from "react";
import { InputNumber } from 'antd'
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';


class CustomAmount extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
    };
    //this.onChange = debounce(this.onChange, 500);
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({ value });
    }
  }

  onBlur = (e) => {
    this.setState({
      value: this.filterMoney(e.target.value, 2, true)
    })
  };

  onChange = (value) => {
    if (value) {
      this.setState({ value });
      this.props.onChange && this.props.onChange(value)
    }
    if (value === '') {
      this.setState({ value });
    }
  };

  render() {
    const { disabled, len, step, style, } = this.props;
    return <InputNumber
      style={style}
      placeholder={this.$t('common.enter')}
      step={step}
      value={this.state.value}
      onChange={this.onChange}
      onBlur={this.onBlur}
      disabled={disabled} />
  }
}

CustomAmount.propTypes = {
  disabled: PropTypes.bool,  //是否可用
  onChange: PropTypes.func,  //输入后的回调
  len: PropTypes.number,     //小数位数
};

CustomAmount.defaultProps = {
  disabled: false,
  len: 2,
  step: 0.01,
  style: { width: '100%' }
};

export default CustomAmount
