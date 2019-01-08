import React from "react";
import { InputNumber } from 'antd'
import PropTypes from 'prop-types';


class CustomAmount extends React.Component {

  onBlur = (e) => {
    let value = this.filterMoney(e.target.value, 2, true, true)
    this.props.onChange && this.props.onChange(value)
  };

  onChange = (value) => {
    this.props.onChange && this.props.onChange(value)
  };

  render() {
    const { disabled, step, style, } = this.props;
    return <InputNumber
      style={style}
      placeholder={this.$t('common.enter')}
      step={step}
      value={this.props.value}
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
