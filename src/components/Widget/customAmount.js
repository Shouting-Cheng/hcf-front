import React from "react";
import { InputNumber} from 'antd'
import debounce from 'lodash.debounce';


class customAmount extends React.Component{

  constructor(props){
    super(props);
    this.state={
      value: props.value || 0,
    };
    this.onChange = debounce(this.onChange, 500);
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      value&&this.setState({value});
    }
  }

  onBlur =(e)=>{
    this.setState({
      value: parseFloat(e.target.value).toFixed(2)
    })
  };

  onChange =(value)=>{
    this.setState({value});
    this.props.onChange&&this.props.onChange(value)
  };


  render(){
    const {disabled,style } = this.props;

    return  <InputNumber
                style={style||'100%'}
                value={this.state.value}
                onChange={this.onChange}
                onBlur={this.onBlur}
                disabled={disabled} />
  }
}

export default customAmount
