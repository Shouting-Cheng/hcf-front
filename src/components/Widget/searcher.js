
import React from 'react';
import { Select, Icon } from 'antd'

import ListSearcher from 'widget/list-searcher'
import 'styles/components/chooser.scss'

import searcherData from 'share/searcherData'
import PropTypes from 'prop-types'

/**
 * 列表选择表单组件，由antd的select组件改造而来,select + listSearcher的自定义表单组件
 */
class Searcher extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: [],
      showListSearcher: false,
      listSelectedData: []
    };
  }

  componentWillMount(){
    this.setValue(this.props.value);
  }

  setValue = (valueWillSet) => {
    const { searcherItem, type } = this.props;
    let key = searcherItem ? searcherItem.key : searcherData[type].key;
    if(valueWillSet &&
      typeof valueWillSet !== 'string' && //onlyNeed模式下返回的single值
      !(valueWillSet.splice && valueWillSet.length > 0 && typeof valueWillSet[0] === 'string')  //onlyNeed模式下返回的只有需要值数组
    ){
      let lengthChange = valueWillSet.length !== this.state.value.length;
      let innerChange = false;
      if(valueWillSet.length === this.state.value.length){
        valueWillSet.map((nextItem, index) => {
          innerChange = innerChange || this.state.value[index].key !== (nextItem[key] + '');
        })
      }
      if(lengthChange || innerChange){
        let values = [];
        valueWillSet.map(item => {
          values.push({
            key: item[key],
            label: item[this.props.labelKey],
            value: item
          })
        });
        this.setState({ value: values });
        // this.onChange(valueWillSet);
      }
    }
    if((!valueWillSet && this.state.value.length > 0) || (valueWillSet && valueWillSet.length === 0 && this.state.value.length > 0)){
      this.setState({ value: [] })
    }
  };

  /**
   * value为传入值
   * @param nextProps
   */
  componentWillReceiveProps = (nextProps) => {
    this.setValue(nextProps.value)
  };

  /**
   * list控件因为select没有onClick事件，所以用onFocus代替
   * 每次focus后，用一个隐藏的input来取消聚焦
   */
  handleFocus = () => {
    this.refs.searcherBlur.focus();
    this.showList()
  };

  /**
   * 显示ListSearcher，如果有已经选择的值则包装为ListSearcher需要的默认值格式传入
   */
  showList = () => {
    let listSelectedData = [];
    if(this.state.value.length > 0){
      this.state.value.map(value => {
        listSelectedData.push(value.value)
      });
    }
    this.setState({ listSelectedData }, () => {
      this.setState({  showListSearcher: true })
    })
  };

  handleListCancel = () => {
    this.setState({ showListSearcher: false })
  };

  /**
   * ListSearcher确认点击事件，返回的结果包装为form需要的格式
   * @param result
   */
  handleListOk = (result) => {
    let value = [];
    const { type, searcherItem } = this.props;
    let key = searcherItem ? searcherItem.key : searcherData[type].key;
    result.result.map(item => {
      value.push({
        key: item[key],
        label: item[this.props.labelKey],
        value: item
      })
    });
    //手动调用onChange事件以与父级Form绑定
    this.onChange(result.result);
    this.setState({ showListSearcher: false, value });
  };

  clear = () => {
    this.onChange([]);
    this.setState({ value: [] })
  };

  onChange = (changedValue) => {
    const { onlyNeed, onChange, single } = this.props;
    if (onChange) {
      if(onlyNeed && changedValue){
        if(single)
          onChange(changedValue[0] ? changedValue[0][onlyNeed] : null,changedValue[0]);
        else{
          let result = [];
          changedValue.map(item => {
            result.push(item[onlyNeed])
          });
          onChange(result)
        }
      }
      else{
        onChange(changedValue);
      }
    }
  };

  render() {
    const { showListSearcher, listSelectedData, value } = this.state;
    const { placeholder, disabled, searcherItem, type, listExtraParams, single, showNumber,
      newline, maxNum, labelKey, showClear, descriptionKey, method, searchPlaceHolder, showDetail, isNeedToPage } = this.props;
    return (
      <div className={`chooser ${showNumber && 'number-only'} ${disabled && 'chooser-disabled'} ${newline && 'newline'}`}>
        <Select
          value={value}
          mode="multiple"
          labelInValue
          placeholder={placeholder}
          onFocus={this.handleFocus}
          dropdownStyle={{ display: 'none' }}
          disabled={disabled}
        >
        </Select>
        {/*如果禁用了，就不要后面的清除icon*/}
        {
          (disabled || !showClear) ? "" : <Icon className="ant-select-selection__clear" type="close-circle" onClick={this.clear} style={value.length === 0 ? {opacity: 0} : {}}/>
        }
        <div className="chooser-number" onClick={() => { !this.props.disabled && this.showList() }}>
          {/*已选择 {value.length} 条*/}
          {this.$t("common.total.selected" , { total: value.length === 0 ? '0' : value.length })}
        </div>
        <ListSearcher visible={showListSearcher}
                      type={type}
                      onCancel={this.handleListCancel}
                      onOk={this.handleListOk}
                      selectedData={listSelectedData}
                      extraParams={listExtraParams}
                      searcherItem={searcherItem}
                      single={single}
                      maxNum={maxNum}
                      labelKey={labelKey}
                      showDetail={showDetail}
                      descriptionKey={descriptionKey}
                      searchPlaceHolder={searchPlaceHolder}
                      isNeedToPage={isNeedToPage}
                      method={method}/>
        <div><input ref="searcherBlur" style={{opacity: 0, position: 'fixed', width: 0, height: 0, zIndex: -1 }}/></div>
      </div>
    );
  }
}

Searcher.propTypes = {
  placeholder: PropTypes.string,  //输入框空白时的显示文字
  disabled: PropTypes.bool,  //是否可用
  type: PropTypes.string,  //list选择的type，参见chooserData内
  searcherItem:PropTypes.object,  //listSearcher的searcherItem
  labelKey: PropTypes.string,  //表单项的显示变量名
  listExtraParams: PropTypes.object,  //listSearcher的额外参数
  single:PropTypes.bool,  //是否单选
  onChange: PropTypes.func,  //进行选择后的回调
  value: PropTypes.oneOfType([PropTypes.array,PropTypes.string]),  //已选择的值，需要传入完整目标数组
  showNumber: PropTypes.bool,  //是否只显示'已选XX条'
  onlyNeed: PropTypes.string,  //只需要对象内的某一值的对应变量名
  newline: PropTypes.bool,  //内容是否可换行
  maxNum: PropTypes.number,  //最多选择多少条数据
  method: PropTypes.string,  //调用方法get/post
  showClear:PropTypes.bool, //是否显示clear
  descriptionKey: PropTypes.any,  //listSearcher的descriptionKey
  showDetail: PropTypes.bool,  //是否在界面显示已选项
  searchPlaceHolder: PropTypes.string, //listSearcher的searchPlaceHolder
  isNeedToPage: PropTypes.bool,  //是否摇滚分页
};

Searcher.defaultProps = {
  placeholder: '请选择',
  disabled: false,
  listExtraParams: {},
  single: false,
  showNumber: false,
  newline: false,
  method: 'get',
  showClear: true,
  showDetail: false,
  isNeedToPage: false
};

export default Searcher;
