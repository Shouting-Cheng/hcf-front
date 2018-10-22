import React from 'react';
import { Select, Spin } from 'antd';
const Option = Select.Option;
import PropTypes from 'prop-types';

import selectorData from 'share/selectorData';
import httpFetch from 'share/httpFetch';
import debounce from 'lodash.debounce';

/**
 * 选择表单组件，由antd的select组件改造而来
 * 使用需与share/selectorData.js内的数据一起使用
 */
class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      fetched: false, //是否已经得到结果
      options: [],
      selectorItem: {},
    };
    this.sourceData = []; //储存原始数据数组
    this.handleSearch = debounce(this.handleSearch, 250);
  }

  componentWillMount() {
    const { type, selectorItem } = this.props;
    //设置selectorItem
    if (selectorItem) {
      this.setState({ selectorItem });
    } else if (type) {
      let item = selectorData[type];
      this.setState({ selectorItem: item });
    }
    this.setValue(this.props.value);
  }

  /**
   * 设置Select的值
   * @param valueWillSet 将要设置的值
   */
  setValue = valueWillSet => {
    let { value, options } = this.state;
    if (valueWillSet) {
      if (typeof valueWillSet === 'string' && valueWillSet !== value) {
        this.setState({ value: valueWillSet });
      } else if (typeof valueWillSet === 'object') {
        if (valueWillSet === null) {
          this.setState({ value: [] });
        } else {
          let tempOptions = options;
          //如果options里没有值，则为options加上这个值，设置temp: true
          if (tempOptions.length === 0 || valueWillSet.optionsChange) {
            tempOptions = [Object.assign({ temp: true }, valueWillSet)];
          }
          if (!valueWillSet.key) {
            valueWillSet.key = valueWillSet[this.state.selectorItem.key];
          }
          this.setState({ options: tempOptions, value: valueWillSet.key });
        }
      }
    } else {
      this.setState({ value: [] });
    }
  };

  /**
   * value为传入值
   * @param nextProps
   */
  componentWillReceiveProps = nextProps => {
    this.setValue(nextProps.value);

    if (nextProps.selectorItem && nextProps.selectorItem.dynamicUrl) {
      this.setState({ selectorItem: nextProps.selectorItem });
    }
  };

  /**
   * 设置Select的Options
   * @param data
   */
  setOptions = data => {
    const { selectorItem } = this.state;
    const { filter } = this.props;
    let list;
    if (selectorItem.listKey) {
      let keys = selectorItem.listKey.split('.');
      list = data;
      keys.map(key => {
        list = list[key];
      });
    } else {
      list = data;
    }
    let resultOptions = [];
    list.map(item => {
      let option = {
        key: item[selectorItem.key],
        label:
          typeof selectorItem.label === 'string'
            ? item[selectorItem.label]
            : selectorItem.label(item),
      };
      filter(item) && resultOptions.push(option);
    });
    this.sourceData = list;
    this.setState({ options: resultOptions, fetched: true });
  };

  //得到焦点时的回调
  handleFocus = () => {
    const { options, selectorItem, fetched } = this.state;
    //如果存在searchKey，则为搜索模式，不触发handleFocus
    if (!fetched && selectorItem.searchKey) {
      this.setState({ fetched: true });
    }
    // url动态修改情况下 每次获取新的options数据
    if (selectorItem.dynamicUrl) {
      httpFetch.get(selectorItem.url, this.props.params).then(res => {
        this.setOptions(res.data);
      });
      return !1;
    }
    //如果接口尚未调用 且 options没有值或只有设置的默认值时 且 不为搜索模式 时
    if (
      !fetched &&
      (options.length === 0 || (options.length === 1 && options[0].temp)) &&
      !selectorItem.searchKey
    ) {
      httpFetch.get(selectorItem.url, this.props.params).then(res => {
        this.setOptions(res.data);
      });
    } else {
      if (
        selectorItem.offlineSearchMode &&
        (options.length === 0 || (options.length === 1 && options[0].temp))
      ) {
        httpFetch.get(selectorItem.url, this.props.params).then(res => {
          this.setOptions(res.data);
        });
      }
    }
  };
  //失去焦点
  handleBlur = () => {
    let { options, value } = this.state;
  };

  onSelect = (changedValue, option) => {
    if (changedValue !== this.state.value) {
      //选择的数据没有变化时不触发下面的操作
      let target = changedValue;
      //如果需要整个对象，则遍历原始数据列表
      if (this.props.entity) {
        this.sourceData.map(data => {
          if (data[this.state.selectorItem.key] === changedValue) target = data;
        });
      }
      const onChange = this.props.onChange;
      this.setState({ value: changedValue });
      if (onChange) {
        onChange(target, option.props);
      }
    }
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    this.setState({ value: changedValue });
    if (!changedValue) {
      onChange(changedValue);
    }
  };
  //搜索时的回调
  handleSearch = key => {
    const { selectorItem } = this.state;
    if (selectorItem.offlineSearchMode) {
      return;
    }
    this.setState({ fetched: false, value: key });
    if (key) {
      let params = this.props.params;
      //参数内加上对应的searchKey
      params[selectorItem.searchKey] = key;
      httpFetch.get(selectorItem.url, this.props.params).then(res => {
        this.setOptions(res.data);
      });
    } else {
      this.setState({ options: [], fetched: true });
    }
  };

  render() {
    const { value, options, fetched, selectorItem } = this.state;
    const { disabled, placeholder, showSearch, allowClear, getPopupContainer } = this.props;
    return (
      <Select
        allowClear={allowClear}
        showSearch={showSearch}
        style={{ width: '100%' }}
        mode={
          !showSearch && (selectorItem.searchKey || selectorItem.offlineSearchMode)
            ? 'combobox'
            : null
        }
        placeholder={placeholder}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        value={value}
        onSearch={this.handleSearch}
        onChange={this.onChange}
        disabled={disabled}
        onSelect={this.onSelect}
        getPopupContainer={getPopupContainer}
        filterOption={
          selectorItem.offlineSearchMode
            ? (input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        optionLabelProp="children"
        notFoundContent={
          fetched ? this.$t('my.contract.no.result') /*无匹配结果*/ : <Spin size="small" />
        }
      >
        {options.map(option => {
          return (
            <Option key={option.key} value={option.key}>
              {option.label}
            </Option>
          );
        })}
      </Select>
    );
  }
}

Selector.propTypes = {
  type: PropTypes.string, //Selector类型，见share/selectorData.js
  selectorItem: PropTypes.object, //如果selector类型不能满足要求，则可以自定义selectorItem，格式同type对应对象
  params: PropTypes.object, //调用接口的时候添加的参数
  disabled: PropTypes.bool, //是否可用
  showSearch: PropTypes.bool, //是否搜索模式，只支持单选模式
  allowClear: PropTypes.bool, //是否允许清除
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), //组件值，可为字符串或对象，若为对象则格式为{label, key}
  placeholder: PropTypes.string,
  entity: PropTypes.bool, //是否需要整个对象，如果为true则返回选择的整个对象，如果为false则只返回对应key值
  onChange: PropTypes.func,
  filter: PropTypes.func, //过滤规则，接收原始数据对象，返回为true则显示，为false则不显示
};

Selector.defaultProps = {
  disabled: false,
  showSearch: false,
  allowClear: true,
  placeholder: '',
  entity: false,
  getPopupContainer: () => document.body, // 项对滚动的节点元素
  filter: option => true,
};

export default Selector;
