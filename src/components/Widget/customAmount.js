import React from "react";
import { InputNumber} from 'antd'
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';


class customAmount extends React.Component{

  constructor(props){
    super(props);
    this.state={
      value: props.value || '',
    };
    //this.onChange = debounce(this.onChange, 500);
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({value});
    }
  }

  onBlur =(e)=>{
    const {len} = this.props;
    this.setState({
      value: e.target.value ? parseFloat(e.target.value).toFixed(len) : ''
    })
  };

  onChange =(value)=>{
    if(value){
      const {len} = this.props;
      //value = parseFloat(value).toFixed(len);
      this.setState({value});
      this.props.onChange&&this.props.onChange(value)
    }
    if(value===''){
      this.setState({value});
    }
  };

  render(){
    const {disabled, len, step,style,  } = this.props;
    return  <InputNumber
      style={style}
      placeholder={this.$t('common.enter')}
      precision={len}
      step={step}
      value={this.state.value}
      onChange={this.onChange}
      onBlur={this.onBlur}
      disabled={disabled} />
  }
}

customAmount.propTypes = {
  disabled: PropTypes.bool,  //是否可用
  onChange: PropTypes.func,  //输入后的回调
  len: PropTypes.number,     //小数位数
};

customAmount.defaultProps ={
  disabled: false,
  len: 2,
  step: 0.01,
  style: {width:'100%'}
};

export default customAmount
