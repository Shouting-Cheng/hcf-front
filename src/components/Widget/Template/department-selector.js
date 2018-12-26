import React from 'react';
import { Select } from 'antd';
import SelectDepartment from 'widget/Template/select-department';
import PropTypes from 'prop-types';

/**
 * 权限分配组件
 */
class DepartmentSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      showSelectDepartment: false,
    };
  }

  componentWillMount() {}

  componentWillReceiveProps(nextProps) {}

  showSelectDepartment = () => {
    this.refs.selectDepartment.blur();
    this.setState({ showSelectDepartment: true });
  };

  handleListOk = values => {
    let value = values.checkedKeys.map(item => {
      return {
        label: item.label,
        key: item.value,
        value: item,
      };
    });
    this.setState({ selectedList: values.checkedKeys, value: value });
    this.onChange(values);
    this.handleListCancel();
  };

  handleListCancel = () => {
    this.setState({ showSelectDepartment: false });
  };

  onChange = values => {
    let list = !values
      ? []
      : values.checkedKeys.map(item => {
          return {
            label: item.label,
            key: item.value,
            value: item.value,
          };
        });
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(list);
    }
  };

  render() {
    const { value, showSelectDepartment } = this.state;
    const { mode, selectedData } = this.props;
    const textStyle = {
      position: 'absolute',
      top: 1,
      left: 10,
      right: 10,
      lineHeight: '30px',
      background: '#f7f7f7',
      color: 'rgba(0, 0, 0, 0.25)',
      cursor: 'pointer',
    };
    return (
      <div style={{ width: '100%' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Select
            value={value}
            ref="selectDepartment"
            onFocus={this.showSelectDepartment}
            dropdownStyle={{ display: 'none' }}
            labelInValue
          />
          <div
            style={textStyle}
            onClick={() => {
              !this.props.disabled && this.showSelectDepartment();
            }}
          >
            {selectedData.length > 0 && selectedData[0].label}
          </div>
        </div>

        <SelectDepartment
          visible={showSelectDepartment}
          onCancel={this.handleListCancel}
          onOk={this.handleListOk}
          single={true}
          selectedData={selectedData}
          mode={mode}
        />
      </div>
    );
  }
}

DepartmentSelector.propTypes = {
  onChange: PropTypes.func, //进行选择后的回调
  selectedData: PropTypes.array, //已选择的值 {key: "",value: "",label:""}
  mode: PropTypes.string,
};

DepartmentSelector.defaultProps = {
  mode: 'id',
};

export default DepartmentSelector;
