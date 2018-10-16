import React from 'react';
import { Input, Icon } from 'antd';

import ListSelector from 'widget/list-selector';
import PropTypes from 'prop-types';
/**
 * 列表选择输入表单组件，由antd的Input组件改造而来,Input + listSelector的自定义表单组件
 */
class Selput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      showListSelector: false,
    };
  }

  handleListCancel = () => {
    this.setState({ showListSelector: false });
  };

  //默认值，可控组件
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({ value });
    }
  }

  /**
   * ListSelector确认点击事件，返回的结果根据valueKey赋值
   * @param result
   */
  handleListOk = result => {
    if (result.result.length > 0) {
      let value = result.result[0][this.props.valueKey];
      this.setState({ value });
      //手动调用onChange事件以与父级Form绑定
      this.onChange(value);
    }
    this.setState({ showListSelector: false });
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { showListSelector, value } = this.state;
    const { placeholder, disabled, selectorItem, type, listExtraParams } = this.props;
    return (
      <div className="selput">
        <Input
          onChange={e => {
            this.setState({ value: e.target.value });
            this.onChange(e.target.value);
          }}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          addonAfter={
            <Icon
              type="ellipsis"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                this.setState({ showListSelector: !disabled });
              }}
            />
          }
        />
        <ListSelector
          visible={showListSelector}
          type={type}
          onCancel={this.handleListCancel}
          onOk={this.handleListOk}
          extraParams={listExtraParams}
          selectorItem={selectorItem}
          single={true}
        />
      </div>
    );
  }
}

Selput.propTypes = {
  placeholder: PropTypes.string, //输入框空白时的显示文字
  disabled: PropTypes.bool, //是否可用
  type: PropTypes.string, //list选择的type，参见chooserData内
  selectorItem: PropTypes.object, //listSelector的selectorItem
  valueKey: PropTypes.string, //所需要的变量名
  listExtraParams: PropTypes.object, //listSelector的额外参数
  onChange: PropTypes.func, //进行选择后的回调
  value: PropTypes.string, //显示的值
};

Selput.defaultProps = {
  placeholder: '请选择',
  disabled: false,
  listExtraParams: {},
};

export default Selput;
