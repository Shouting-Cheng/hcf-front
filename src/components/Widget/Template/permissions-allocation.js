import React from 'react';
import { Select, Radio } from 'antd';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

import SelectDepartment from './select-department';
import SelectEmployeeGroup from 'widget/Template/select-employee-group';
import PropTypes from 'prop-types';

/**
 * 权限分配组件
 */
class PermissionsAllocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      type: '',
      showSelectDepartment: false,
      showSelectEmployeeGroup: false,
      selectedList: [],
      selectEmployeeText: '',
    };
  }

  componentWillMount() {
    let model = this.props.value;

    model &&
      this.setState({ type: model.type, selectedList: model.values, value: model.values }, () => {
        this.setSelectEmployeeText();
      });
  }

  componentWillReceiveProps(nextProps) {
    let model = nextProps.value;
    model &&
      this.setState({ type: model.type, selectedList: model.values, value: model.values }, () => {
        this.setSelectEmployeeText();
      });
  }

  onApplyEmployee = e => {
    this.setState({ type: e.target.value, selectedList: [] }, () => {
      this.setSelectEmployeeText();
      this.onChange();
    });
  };

  setSelectEmployeeText = () => {
    let text = '';
    if (this.state.type === 'department') {
      text = this.$t('common.selected.number.department', {
        number: this.state.selectedList.length,
      });
    } else if (this.state.type === 'group') {
      text = this.$t('common.selected.number.user.group', {
        number: this.state.selectedList.length,
      });
    } else if (this.state.type === 'all') {
      text = this.$t('common.all.type');
    }
    this.setState({ selectEmployeeText: text });
  };

  showSelectEmployeeGroup = () => {
    this.refs.selectEmployeeGroup.blur();

    if (this.state.type === 'department') {
      this.setState({ showSelectDepartment: true });
    } else if (this.state.type === 'group') {
      this.setState({ showSelectEmployeeGroup: true });
    }
  };

  handleListCancel = () => {
    this.setState({ showSelectEmployeeGroup: false, showSelectDepartment: false });
  };

  handleListOk = values => {
    let value = values.checkedKeys.map(item => {
      return {
        label: item.label,
        key: item.value,
        value: item,
      };
    });

    this.setState({ selectedList: values.checkedKeys, value: value }, () => {
      this.setSelectEmployeeText();
    });

    this.onChange(values);
    this.handleListCancel();
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
      onChange({ type: this.state.type, values: list });
    }
  };

  render() {
    const {
      value,
      selectEmployeeText,
      type,
      showSelectEmployeeGroup,
      showSelectDepartment,
      selectedList,
    } = this.state;
    const { disabled } = this.props;

    const textStyle = {
      position: 'absolute',
      top: 3,
      left: 10,
      right: 10,
      width: 180,
      height: 26,
      lineHeight: '26px',
      background: type === 'all' || disabled ? '#f5f5f5' : '#fff',
      color: type === 'all' || disabled ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.65)',
      cursor: 'pointer',
    };

    return (
      <div>
        <RadioGroup onChange={this.onApplyEmployee} value={type}>
          {this.props.hiddenComponents.indexOf('all') >= 0 || (
            <Radio disabled={disabled} value="all">
              {this.$t('common.all.user')}
            </Radio>
          )}
          {this.props.hiddenComponents.indexOf('department') >= 0 || (
            <Radio disabled={disabled} value="department">
              {this.$t('common.add.by.department')}
            </Radio>
          )}
          {this.props.hiddenComponents.indexOf('group') >= 0 || (
            <Radio disabled={disabled} value="group">
              {this.$t('common.add.by.user.group')}
            </Radio>
          )}
        </RadioGroup>

        {type &&
          type !== 'all' && (
            <div style={{ position: 'relative', width: '100%', height: 32, lineHeight: "32px", marginTop: 10 }}>
              <Select
                disabled={type === 'all' || this.props.disabled}
                value={value}
                ref="selectEmployeeGroup"
                onFocus={this.showSelectEmployeeGroup}
                dropdownStyle={{ display: 'none' }}
                labelInValue
                style={{ minWidth: 200 }}
              />
              <div
                style={textStyle}
                onClick={() => {
                  !this.props.disabled && this.showSelectEmployeeGroup();
                }}
              >
                {selectEmployeeText}
              </div>
            </div>
          )}

        {showSelectEmployeeGroup && <SelectEmployeeGroup
          visible={showSelectEmployeeGroup}
          onCancel={this.handleListCancel}
          onOk={this.handleListOk}
          single={true}
          selectedData={selectedList}
          mode={this.props.mode}
        />}

        {showSelectDepartment && <SelectDepartment
          visible={showSelectDepartment}
          onCancel={this.handleListCancel}
          onOk={this.handleListOk}
          single={true}
          selectedData={selectedList}
          mode={this.props.mode}
        />}
      </div>
    );
  }
}

PermissionsAllocation.propTypes = {
  onChange: PropTypes.func, //进行选择后的回调
  disabled: PropTypes.bool, //是否可用
  value: PropTypes.object, //已选择的值 {key: "",value: "",label:""}
  hiddenComponents: PropTypes.array, //不需要显示的组件 ["all","department","group"] 表示这三个组件不需要显示 默认全部都显示
  mode: PropTypes.string,
};

PermissionsAllocation.defaultProps = {
  hiddenComponents: [],
  disabled: false,
  mode: 'id',
};

export default PermissionsAllocation;
