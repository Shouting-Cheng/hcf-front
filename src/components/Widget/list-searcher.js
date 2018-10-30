
/**
 * Created By ZaraNengap on 2017/09/21
 */
import React from 'react';
import { connect } from 'dva'
import SearcherContent from 'widget/searcher-content'
import { Modal, message, Input, Tag } from 'antd'
import PropTypes from 'prop-types'
const Search = Input.Search;

import httpFetch from 'share/httpFetch'

/**
 * 联动static/searcherData.js文件
 * 该文件内存储各选择的页面渲染选项
 * 包括title、url、key
 * @params title  显示在页面上方的标题
 * @params url  获得数据的接口
 * @params key  数据主键
 * @params listKey  列表在接口返回值内的变量名，如果接口直接返回数组则置空
 */
import searcherData from 'share/searcherData'

/**
 * 通用表格选择器组件
 * @params visible  是否可见，同Modal
 * @params onOk  点击OK后的方法，同Modal
 * @params onCancel  点击取消后的方法，同Modal
 * @params afterClose  关闭窗口后的方法，同Modal
 * @params type  选择器类型，配置在chooserData内
 * @params selectedData  默认选择的值，如果一个页面由多个ListSelector配置，则不同的选择项应该在后续多次选择时传入对应的选择项
 * @params extraParams  搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
 * @params searcherItem  组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
 * @params single 是否单选,默认为false
 * @params method 调用方法get/post
 * @params maxNum 最多选择多少条数据
 * @params showDetail 是否在界面显示Tag已选项
 *
 * type与searcherItem可共存，如果两者都有，searcherItem起作用
 *
 * 现在支持的选择方法见share/searcherData.js
 */
class ListSearcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      filterData: [],
      key: '',  //搜索参数
      searcherItem: {},  //当前的选择器类型数据项
      page: 0,
      total: 0,
      selectedData: [], //选中的item
      searching: false, //是否正在搜索
    };
  }

  //调用接口获取数据,isSearch表示搜索栏是否为空，isPage是否在分页，searching是否正在搜索
  getData = (searchParams,isSearch = false,isPage = false,searching = false) => {
    let { selectedData, searcherItem, data, filterData } = this.state;
    let url = searcherItem.url;
    const { listKey, key } = searcherItem;
    searching && this.setState({searching:true});
    httpFetch[this.props.method](url, searchParams).then(res => {
      if(listKey){
        data = res.data[listKey];
      } else {
        data = this.unique([...data,...res.data]);
      }
      data.map(item => {
        item._selected = false;
      });
      filterData = isSearch ?
        (isPage ? this.unique([...filterData,...res.data]) : res.data) :
        JSON.parse(JSON.stringify(data));
      if(selectedData && selectedData.length > 0 && data.length > 0){
        selectedData.map(selectedItem => {
          let filterDataSelect = filterData.filter((item) => item[key] === selectedItem[key]);
          filterDataSelect.length > 0 && (filterDataSelect[0]._selected = true);
          let dataSelect = data.filter((item) => item[key] === selectedItem[key]);
          dataSelect.length > 0 && (dataSelect[0]._selected = true);
        });
      }
      this.setState({
        data: data,
        filterData: filterData,
        loading: false,
        total: res.headers['x-total-count'] || 0,
        selectedData,
        searching: false
      })
    }).catch(e => {
      this.setState({
        data: [],
        loading: false
      });
      // '获取数据失败，请稍后重试或联系管理员'
      message.error(this.$t("common.error1"));
    });
  };

  //去重
  unique = (arr) => {
    const {searcherItem} = this.state;
    let valueKey = searcherItem.key;
    const res = new Map();
    return arr.filter((item) => !res.has(item[valueKey]) && res.set(item[valueKey], 1));
  };

  //下拉回调
  handleLoadMore = () => {
    let searchParams = Object.assign({}, this.props.extraParams);
    const { page, total, key, searching } = this.state;
    let size = searchParams.size;
    if(total / size > page + 1 && !searching) {
      this.setState({page : page + 1},() => {
        searchParams.page = this.state.page;
        searchParams.keyword = key;
        let isSearch = (key && key !== '') ? true : false;
        this.getData(searchParams,isSearch,true);
      });
    }
  };

  //得到数据
  getList(){
    let searchParams = Object.assign({}, this.props.extraParams);
    return this.getData(searchParams);
  }

  /**
   * 判断this.props.type是否有变化，如果有变化则重新渲染页面
   * @param type
   */
  checkType(type){
    let searcherItem = searcherData[type];
    if(searcherItem){
      this.checkSearcherItem(searcherItem)
    }
  };

  checkSearcherItem(searcherItem){
    this.setState({ searcherItem }, () => {
      this.getList();
    })
  }

  /**
   * 每次父元素进行setState时调用的操作，判断nextProps内是否有type的变化
   * 如果selectedData有值则代表有默认值传入需要替换本地已选择数组，
   * 如果没有值则需要把本地已选择数组置空
   * @param nextProps 下一阶段的props
   */
  componentWillReceiveProps = (nextProps) => {
    const { data, type } = this.state;
    if(nextProps.visible === this.props.visible)
      return;
    if(nextProps.selectedData && nextProps.selectedData.length > 0 && data.length > 0){
      let key = nextProps.searcherItem ? nextProps.searcherItem.key : searcherData[nextProps.type].key;
      nextProps.selectedData.map(selectedItem => {
        data.map(item => {
          if(item[key] === selectedItem[key])
            item._selected = true;
        })
      });
      this.setState({ data });
    }
    this.setState({selectedData:nextProps.selectedData});
    if(nextProps.type !== type && !nextProps.searcherItem && nextProps.visible)
      this.checkType(nextProps.type);
    else if(nextProps.searcherItem && nextProps.visible)
      this.checkSearcherItem(nextProps.searcherItem);
  };

  handleOk = () => {
    const { data } = this.state;
    let result = [];
    data.map(item => {
      item._selected && result.push(JSON.parse(JSON.stringify(item)));
    });
    result.map(item => {
      delete item._selected;
    });
    this.props.onOk({
      result,
      type: this.props.type
    })
  };

  closeTag = (e, record) => {
    e.preventDefault();
    const { data, filterData, searcherItem, selectedData } = this.state;
    let valueKey = searcherItem.key;
    data.map(item => {
      item[valueKey] === record[valueKey] && (item._selected = !item._selected)
    });
    filterData.map(item => {
      item[valueKey] === record[valueKey] && (item._selected = !item._selected)
    });
    let tempData = JSON.parse(JSON.stringify(selectedData));
    tempData.map((item,index) => {
      item[valueKey] === record[valueKey] && selectedData.splice(index,1)
    });
    this.setState({ data, filterData, selectedData })
  };

  handleChangeKey = (e) => {
    const { data } = this.state;
    const { labelKey, isNeedToPage } = this.props;
    let key = e.target.value;
    let filterData = [];
    if (!isNeedToPage) {
      if (key) {
        data.map(item => {
          let name = item[labelKey];
          if (this.props.renderLabel) {
            name = this.props.renderLabel(item)
          }
          if (name.indexOf(key) > -1 || (this.getDescription(item) && this.getDescription(item).indexOf(key) > -1))
            filterData.push(JSON.parse(JSON.stringify(item)))
        });
      } else {
        filterData = JSON.parse(JSON.stringify(data));
      }
    } else {
      this.setState({loading: true});
      let searchParams = Object.assign({}, this.props.extraParams);
      searchParams.keyword = key;
      this.getData(searchParams,true,false,true);
      filterData = this.state.filterData;
    }
    this.setState({ key, filterData, page : 0 });
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

  render() {
    const { visible, onCancel, afterClose, showDetail, labelKey, descriptionKey, searchPlaceHolder, renderLabel, externalLabel, isNeedToPage, maxNum, single } = this.props;
    const { data, loading, searcherItem, filterData, total, selectedData } = this.state;
    const { title, key } = searcherItem;
    let totalNumber = isNeedToPage ? total : filterData.length;
    return (
      <Modal
        title={title}
        visible={visible}
        onCancel={onCancel}
        afterClose={afterClose}
        width={500}
        onOk={this.handleOk}
        className="list-searcher">
        {showDetail && (
          <div className="selected-tag">
            {this.$t('org.selected')/*已选*/}:&nbsp;&nbsp;
            {selectedData.map((item) => (
                <span key={item[searcherItem.key]}>
                  <Tag closable
                       onClose={e => this.closeTag(e, item)}>{item[labelKey]}</Tag>
                </span>
              )
            )}
          </div>
        )}
        <Search onChange={this.handleChangeKey}
                placeholder={searchPlaceHolder}/>
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', {total: totalNumber})}{/* 共 total 条数据 */}
          </div>
        </div>
        <SearcherContent showDetail={showDetail}
                         loading={loading}
                         filterData={filterData}
                         labelKey={labelKey}
                         renderLabel={renderLabel}
                         externalLabel={externalLabel}
                         key={key}
                         descriptionKey={descriptionKey}
                         maxNum={maxNum}
                         data={data}
                         single={single}
                         isNeedToPage={isNeedToPage}
                         searcherItem={searcherItem}
                         selectedData={selectedData}
                         handleLoadMore={() => this.handleLoadMore()}
                         getSelect={(data, filterData, selectedData) => {
                           this.setState({data, filterData, selectedData})
                         }}/>
      </Modal>
    );
  }
}

ListSearcher.propTypes = {
  visible: PropTypes.bool,  //对话框是否可见
  onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel: PropTypes.func,  //点击取消后的回调
  afterClose: PropTypes.func,  //关闭后的回调
  type: PropTypes.string,  //选择类型
  selectedData: PropTypes.array,  //默认选择的值
  extraParams: PropTypes.object,  //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
  single: PropTypes.bool,  //是否单选
  searcherItem: PropTypes.object,  //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
  method: PropTypes.string,  //调用方法get/post
  maxNum: PropTypes.number,  //最多选择多少条数据
  showDetail: PropTypes.bool,  //是否在界面显示已选项
  labelKey: PropTypes.string,  //Tag内显示的值
  descriptionKey: PropTypes.any,  //description显示方式，如果不需要则不需要此值，可为字符串或方法
  searchPlaceHolder: PropTypes.string,
  renderLabel: PropTypes.func, //label渲染规则
  externalLabel: PropTypes.func, //在label后面显示，不参与label的搜索
  isNeedToPage: PropTypes.bool //是否摇滚分页
};

ListSearcher.defaultProps = {
  afterClose: () => {},
  extraParams: {},
  single: false,
  method: 'get',
  showDetail: false,
  descriptionKey: null,
  searchPlaceHolder: '请输入',
  isNeedToPage: false
};

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(ListSearcher);
