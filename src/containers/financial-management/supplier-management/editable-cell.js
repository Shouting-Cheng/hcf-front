import {messages} from "share/common";
import React from 'react'
import { Input, Select, Popover } from 'antd';

import 'styles/financial-management/supplier-management/supplier-detail.scss'
const Option =Select.Option;
class EditableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      editable: false,
      id:null
    }
  }
  
  componentWillMount() {
    this.setState({ value: this.props.value,id:this.props.id})
  }
  
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  };
  
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };
  
  edit = () => {
    this.setState({ editable: true });
  };
  
  showBankPicker = ()=>{
    this.props.showBank(this.state.id)
  };
  
  render() {
    const { editable, value, onChange, column } = this.props;
    return (
      <div>
        {editable
          ? column === 'bankOpeningBank' ? <div onClick={this.showBankPicker}><Select dropdownStyle={{ display: 'none' }} value={value} style={{width:'100%'}}><Option value={value}>{value}</Option></Select></div> :<Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
          : <Popover  content={value}>{value}</Popover>
        }
      </div>
    );
  }
}
EditableCell.propTypes = {
  value: React.PropTypes.any.isRequired, //默认值
  message: React.PropTypes.string,       //点击修改时的提示信息
  record: React.PropTypes.object,        //行信息
  onChange: React.PropTypes.func,        //确认修改时的回调
  showBank:React.PropTypes.func,
  id:React.PropTypes.number
};
const WrappedEditableCell= (EditableCell);

export default WrappedEditableCell;