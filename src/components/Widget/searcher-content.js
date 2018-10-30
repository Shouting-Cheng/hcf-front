import React from 'react'
import { connect } from 'dva'
import { Icon, Spin } from 'antd'
import {message} from "antd/lib/index";
import PropTypes from 'prop-types'
class SearcherContent extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      filterData: [],
      key: null,
      data: [],
      searcherItem: null,
      selectedData: []
    }
  }

  componentDidMount() {
    if(this.refs.scrollPage){
      this.refs.scrollPage.addEventListener("scroll", () => {
        if ( this.refs.scrollPage.scrollTop + this.refs.scrollPage.clientHeight >= this.refs.scrollPage.scrollHeight ) {
          this.props.handleLoadMore();
        }
      });
    }
  };

  componentWillReceiveProps(nextProps) {
    if(nextProps){
      this.renderDiv(nextProps);
    }
  };

  renderDiv = (nextProps) => {
    const { loading, filterData, key, searcherItem, data, selectedData } = nextProps;
    this.setState({loading, filterData, key, searcherItem, data, selectedData});
  };

  renderNameByKey = (name, item) => {
    const { key } = this.state;
    if (this.props.renderLabel) {
      name = this.props.renderLabel(item)
    }
    let result = [];
    if (name) {
      let sections = name.split(key);
      sections.map((item, index) => {
        result.push(item);
        if(index !== sections.length - 1){
          result.push(<span className="target-key" key={index}>{key}</span>)
        }
      });
    }
    return result;
  };

  //先校验在放入数据中
  handleSelect = (record) => {
    let targetFlag = !record._selected;
    const { maxNum } = this.props;
    const { selectedData } = this.state;
    if(maxNum && targetFlag){
      let count = selectedData.length;
      if(count === maxNum){
        message.error(`最多只可选择${maxNum}个!`);
        return ;
      }
    }
    this.selectClick(record);
  };

  //选择数据处理
  selectClick = (record) => {
    let targetFlag = !record._selected;
    const { single, labelKey } = this.props;
    let { data, filterData, searcherItem, selectedData } = this.state;
    let valueKey = searcherItem.key;
    data.map(item => {
      single && item._selected && (item._selected = !item._selected);
      item[valueKey] === record[valueKey] && (item._selected = targetFlag)
    });
    filterData.map(item => {
      single && item._selected && (item._selected = !item._selected);
      item[valueKey] === record[valueKey] && (item._selected = targetFlag)
    });
    if(targetFlag){
      single && (selectedData = []);
      let selectItem = {};
      selectItem[valueKey] = record[valueKey];
      selectItem[labelKey] = record[labelKey];
      selectedData.push(selectItem);
    }else{
      let tempData = JSON.parse(JSON.stringify(selectedData));
      tempData.map((item,index) => {
        item[valueKey] === record[valueKey] && selectedData.splice(index,1)
      });
    }
    this.props.getSelect(data,filterData,selectedData);
    this.setState({ data, filterData, selectedData })
  };

  getDescription = (record) => {
    const { descriptionKey } = this.props;
    if(!descriptionKey)
      return false;
    if(typeof descriptionKey === 'string'){
      return record[descriptionKey]
    } else {
      return descriptionKey(record);
    }
  };


  render(){
    const { loading, filterData, key} = this.state;
    const { showDetail, labelKey, externalLabel, descriptionKey, isNeedToPage } = this.props;
    return (
      <div className={`searcher-content-list ${showDetail ? '' : 'no-show-detail'}`} ref={isNeedToPage ? 'scrollPage' : ''}>
        {loading ? <Spin/> : filterData.length > 0 ?
          filterData.map(item => (
            <div className={`searcher-list-item ${item._selected ? 'selected' : ''}`} key={item[key]} onClick={() => this.handleSelect(item)}>
              <div className="searcher-list-item-name">
                {this.renderNameByKey(item[labelKey], item)}{externalLabel && externalLabel(item)}<br/>
                {descriptionKey && <span className="searcher-list-item-description">{this.renderNameByKey(this.getDescription(item))}</span>}
              </div>
              {item._selected && <Icon type="check" className="searcher-list-item-check"/>}
            </div>
          )) : <div>{this.$t('common.select.no.search.data')/*无搜索数据*/}</div>}
      </div>
    )
  }
}

SearcherContent.propTypes = {
  showDetail: PropTypes.bool,
  loading: PropTypes.bool,
  filterData: PropTypes.array,
  renderLabel: PropTypes.func, //label渲染规则
  labelKey: PropTypes.string,  //Tag内显示的值
  externalLabel: PropTypes.func, //在label后面显示，不参与label的搜索
  key: PropTypes.string,
  single: PropTypes.bool,
  maxNum: PropTypes.number,  //最多选择多少条数据
  descriptionKey: PropTypes.any,  //description显示方式，如果不需要则不需要此值，可为字符串或方法
  data: PropTypes.any,
  searcherItem: PropTypes.object,
  getSelect: PropTypes.func, //提交选择
  handleLoadMore: PropTypes.func,
  isNeedToPage: PropTypes.bool
};

function mapStateToProps(){
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SearcherContent);
