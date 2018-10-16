import React from 'react';
import { Select, Icon, Button } from 'antd';
import PropTypes from 'prop-types';

import ListSelector from 'widget/list-selector';
import 'styles/components/chooser.scss';

/**
 * 列表选择表单组件，由antd的select组件改造而来,select + listSelector的自定义表单组件
 */
class SelectByBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      showListSelector: false,
      listSelectedData: [],
    };
  }

  componentWillMount() {
    if (this.props.itemMap) {
      let value = [];
      this.props.value.map(item => {
        value.push({
          key: item[this.props.valueKey],
          label: item[this.props.labelKey],
          value: this.props.value,
        });
      });
      this.setState({ value });
    }
    this.setValue(this.props.value);
  }

  setValue = valueWillSet => {
    if (
      valueWillSet &&
      typeof valueWillSet !== 'string' && //onlyNeed模式下返回的single值
      !(valueWillSet.splice && valueWillSet.length > 0 && typeof valueWillSet[0] === 'string') //onlyNeed模式下返回的只有需要值数组
    ) {
      let lengthChange = valueWillSet.length !== this.state.value.length;
      let innerChange = false;
      if (valueWillSet.length === this.state.value.length) {
        valueWillSet.map((nextItem, index) => {
          innerChange =
            innerChange || this.state.value[index].key !== nextItem[this.props.valueKey] + '';
        });
      }
      if (lengthChange || innerChange) {
        let values = [];
        valueWillSet.map(item => {
          values.push({
            key: item[this.props.valueKey] + '',
            label: item[this.props.labelKey],
            value: item,
          });
        });
        this.setState({ value: values });
        this.onChange(valueWillSet);
      }
    }
    if (
      (!valueWillSet && this.state.value.length > 0) ||
      (valueWillSet && valueWillSet.length === 0 && this.state.value.length > 0)
    ) {
      this.setState({ value: [] });
    }
  };

  /**
   * value为传入值
   * @param nextProps
   */
  componentWillReceiveProps = nextProps => {
    this.setValue(nextProps.value);
  };

  /**
   * list控件因为select没有onClick事件，所以用onFocus代替
   * 每次focus后，用一个隐藏的input来取消聚焦
   */
  handleFocus = () => {
    this.refs.chooserBlur.focus();
    this.showList();
  };

  /**
   * 显示ListSelector，如果有已经选择的值则包装为ListSelector需要的默认值格式传入
   */
  showList = () => {
    let listSelectedData = [];
    if (this.state.value.length > 0) {
      this.state.value.map(value => {
        listSelectedData.push(value.value);
      });
    }
    this.setState({ listSelectedData }, () => {
      this.setState({ showListSelector: true });
    });
  };

  handleListCancel = () => {
    this.setState({ showListSelector: false });
  };

  /**
   * ListSelector确认点击事件，返回的结果包装为form需要的格式
   * @param result
   */
  handleListOk = result => {
    let value = [];
    result.result.map(item => {
      value.push({
        key: item[this.props.valueKey],
        label: item[this.props.labelKey],
        value: item,
      });
    });
    if (this.props.onConfirm) {
      this.props.onConfirm(value);
    }
    //手动调用onChange事件以与父级Form绑定
    this.onChange(result.result);
    this.setState({ showListSelector: false, value });
  };

  clear = () => {
    this.onChange([]);
    this.setState({ value: [] });
  };

  onChange = changedValue => {
    const { onlyNeed, onChange, single } = this.props;
    if (onChange) {
      if (onlyNeed && changedValue) {
        if (single)
          // onChange(changedValue[0] ? changedValue[0][onlyNeed] : []);
          // wjk 注释掉上一行，只需要某一个字段却不存在时应返回null
          onChange(changedValue[0] ? changedValue[0][onlyNeed] : null, changedValue[0]);
        else {
          let result = [];
          changedValue.map(item => {
            result.push(item[onlyNeed]);
          });
          onChange(result);
        }
      } else {
        onChange(changedValue);
      }
    }
  };

  render() {
    const { showListSelector, listSelectedData, value } = this.state;
    const {
      placeholder,
      disabled,
      selectorItem,
      type,
      listExtraParams,
      single,
      showNumber,
      newline,
      maxNum,
      labelKey,
      showClear,
      showArrow,
      showDetail,
    } = this.props;
    return (
      <div
        className={`chooser ${showNumber && 'number-only'} ${disabled &&
          'chooser-disabled'} ${newline && 'newline'}`}
      >
        <Button
          onClick={this.showList}
          disabled={this.props.buttonDisabled}
          type={this.props.buttonType}
        >
          {this.props.title}
        </Button>
        <div
          className="chooser-number"
          onClick={() => {
            !this.props.disabled && this.showList();
          }}
        >
          {/*已选择 {value.length} 条*/}
          {this.$t('common.total.selected', { total: value.length === 0 ? '0' : value.length })}
        </div>
        <ListSelector
          visible={showListSelector}
          type={type}
          onCancel={this.handleListCancel}
          onOk={this.handleListOk}
          selectedData={listSelectedData}
          extraParams={listExtraParams}
          selectorItem={selectorItem}
          single={single}
          maxNum={maxNum}
          labelKey={labelKey}
          showDetail={!single && showDetail}
          showArrow={showArrow}
          method={this.props.method}
        />
        <div>
          <input
            ref="chooserBlur"
            style={{ opacity: 0, position: 'fixed', width: 0, height: 0, zIndex: -1 }}
          />
        </div>
      </div>
    );
  }
}

SelectByBtn.propTypes = {
  onConfirm: PropTypes.func.isRequired, // 点击确认之后的回调：返回结果
  disabled: PropTypes.bool, //是否可用
  type: PropTypes.string, //list选择的type，参见chooserData内
  selectorItem: PropTypes.object, //listSelector的selectorItem
  valueKey: PropTypes.string, //表单项的id变量名
  labelKey: PropTypes.string, //表单项的显示变量名
  listExtraParams: PropTypes.object, //listSelector的额外参数
  onChange: PropTypes.func, //进行选择后的回调
  single: PropTypes.bool, //是否单选
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]), //已选择的值，需要传入完整目标数组
  showNumber: PropTypes.bool, //是否只显示'已选XX条'
  onlyNeed: PropTypes.string, //只需要对象内的某一值的对应变量名
  newline: PropTypes.bool, //内容是否可换行
  maxNum: PropTypes.number, //最多选择多少条数据
  title: PropTypes.any, //
  buttonDisabled: PropTypes.bool,
  method: PropTypes.string, //调用方法get/post
  showClear: PropTypes.bool, //是否显示clear
  showArrow: PropTypes.bool, //是否在Tag中显示箭头
  showDetail: PropTypes.bool, //是否显示详情
};

SelectByBtn.defaultProps = {
  title: this.$t('rep.distribution.maintain.add.employees.condition'),
  disabled: false,
  listExtraParams: {},
  single: false,
  showNumber: false,
  newline: false,
  method: 'get',
  showClear: true,
  showArrow: false,
  showDetail: true,
  buttonDisabled: false,
};

export default SelectByBtn;
