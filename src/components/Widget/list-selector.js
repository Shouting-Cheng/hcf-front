
/**
 * Created By ZaraNengap on 2017/09/21
 */
import React from 'react';
import { connect } from 'dva'
import { Modal, Table, message, Button, Input, Row, Col, Tag, Icon, Popover } from 'antd'

import httpFetch from 'share/httpFetch'
import SearchArea from 'widget/search-area'
import PropTypes from 'prop-types';

/**
 * 联动static/chooserData.js文件
 * 该文件内存储各选择的页面渲染选项
 * 包括title、url、searchForm、columns、key
 * @params title  显示在页面上方的标题
 * @params url  获得数据的接口
 * @params searchForm  联动searchForm组件的参数，配置顶部搜索区域搜索项
 * @params columns  表格列配置
 * @params key  数据主键
 * @params listKey  列表在接口返回值内的变量名，如果接口直接返回数组则置空
 */
import chooserData from 'chooserData'

/**
 * 通用表格选择器组件
 * @params visible  是否可见，同Modal
 * @params onOk  点击OK后的方法，同Modal
 * @params onCancel  点击取消后的方法，同Modal
 * @params afterClose  关闭窗口后的方法，同Modal
 * @params type  选择器类型，配置在chooserData内
 * @params selectedData  默认选择的值，如果一个页面由多个ListSelector配置，则不同的选择项应该在后续多次选择时传入对应的选择项
 * @params extraParams  搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
 * @params selectorItem  组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
 * @params single 是否单选,默认为false
 * @params method 调用方法get/post
 * @params selectAll 是否需要选择全部按钮
 * @params selectAllLoading 全选全部按钮loading
 * @params onSelectAll 点击选择全部时的回调
 * @params maxNum 最多选择多少条数据
 * @params showDetail 是否在界面显示Tag已选项
 * @params showArrow 是否在Tag中显示箭头
 *
 * type与selectorItem可共存，如果两者都有，selectorItem起作用
 *
 * 现在支持的选择方法见share/chooserData.js
 */
class ListSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      selectedData: [],  //已经选择的数据项
      selectorItem: {},  //当前的选择器类型数据项, 包含url、searchForm、columns
      searchParams: {},  //搜索需要的参数
      rowSelection: {
        type: this.props.single ? 'radio' : 'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
        onSelect: this.onSelectItem,
        onSelectAll: this.onSelectAll
      },
      scrollX: false,
    };
  }

  search = (params) => {
    this.setState({
      page: 0,
      searchParams: params,
      loading: true
    }, () => {
      this.getList();
    })
  };

  clear = () => {
    let searchParams = {};
    this.state.selectorItem.searchForm.map(form => {
      if(form.type === 'select' && form.defaultValue && form.defaultValue.key){
        searchParams[form.id] = form.defaultValue.key;
      } else {
        searchParams[form.id] = form.defaultValue;
      }
    });
    this.setState({
      page: 0,
      searchParams: searchParams
    }, () => {
      this.getList();
    })
  };
  getDataLabel(data, keys) {
    let lenth = keys.split('.').length;
    keys && keys.split('.').map((key, index) => {
      if (lenth - 1 !== index) {
        data = data[key];
      }
    })
    return data;
  }
  getLastKey = (key) => {
    return key.split('.')[key.split('.').length - 1];
  }
  //得到数据
  getList() {
    let selectorItem = this.state.selectorItem;
    let searchParams = Object.assign({}, this.state.searchParams, this.props.extraParams);
    let url = selectorItem.url;
    let reg = /\?+/;
    if (reg.test(url)) {
      //检测是否已经有参数了，如果有直接加&
      url = `${selectorItem.url}&page=${this.state.page}&size=${this.state.pageSize}`;
    } else {
      url = `${selectorItem.url}?page=${this.state.page}&size=${this.state.pageSize}`;
    }
    return httpFetch[this.props.method](url, searchParams).then((response) => {
      let data = [];
      if (selectorItem.isValue) {
        response.data.map((item) => {
          let option = {};
          option[this.getLastKey(selectorItem.key)] = item;
          data.push(option)
        });
      } else {
        data = selectorItem.listKey ? response.data[selectorItem.listKey] : selectorItem.isValueList ? response.data.values : response.data;
      }
      let tmpData = [];
      data.map((item) => {
        tmpData.push(this.getDataLabel(item, selectorItem.key))
      });
      data = tmpData;
      data.map((item) => {
        item.key = item[this.getLastKey(selectorItem.key)];
      });
      let pagination = {
        total: Number(response.headers['x-total-count']),
        onChange: this.onChangePager,
        current: this.state.page + 1
      };
      if (!Number(response.headers['x-total-count']) && typeof selectorItem.listKey !== 'undefined') {
        pagination.total = response.data[selectorItem.listKey].length
      }
      this.setState({
        data: data,
        loading: false,
        pagination
      }, () => {
        this.refreshSelected();  //刷新当页选择器
      })
    }).catch(e => {
      let pagination = {
        total: 0,
        onChange: this.onChangePager,
        current: 1
      };
      this.setState({
        data: [],
        loading: false,
        pagination
      }, () => {
        this.refreshSelected();  //刷新当页选择器
      })
      // '获取数据失败，请稍后重试或联系管理员'
      message.error(this.$t("common.error1"));
      this.setState({ loading: false })
    });
  }

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };

  /**
   * 判断this.props.type是否有变化，如果有变化则重新渲染页面
   * @param type
   */
  checkType(type) {
    let selectorItem = chooserData[type];
    if (selectorItem) {
      this.checkSelectorItem(selectorItem)
    }
  };

  checkSelectorItem(selectorItem) {
    let searchParams = {};
    selectorItem.searchForm.map(form => {
      searchParams[form.id] = form.defaultValue;  //遍历searchForm，取id组装成searchParams
      form.label = this.$t(form.label);
      if(form.type === 'select' && form.defaultValue && form.defaultValue.key){
        searchParams[form.id] = form.defaultValue.key;
      }
    });

    selectorItem.columns.map(item => {
      item.title = this.$t(item.title);
    })

    this.setState({ selectorItem, searchParams }, () => {
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
    if (nextProps.visible === this.props.visible)
      return;
    if (!nextProps.visible && this.props.visible) {
      //关闭Modal不需要再次查list数据
      this.formRef && this.formRef.clearSearchAreaSelectData();
    }
    this.setState({ page: 0 });
    if (nextProps.selectedData && nextProps.selectedData.length > 0){
      let { rowSelection, selectorItem } = this.state;
      let temp = [];
      let key = selectorItem.key || nextProps.selectorItem&&nextProps.selectorItem.key || chooserData[nextProps.type].key ;
      nextProps.selectedData.map(item=>temp.push(item[key]));
      rowSelection.selectedRowKeys = temp;
      this.setState({ selectedData: nextProps.selectedData ,rowSelection });
    }
    else
      this.setState({ selectedData: [] });
    if (nextProps.type !== this.state.type && !nextProps.selectorItem && nextProps.visible)
      this.checkType(nextProps.type);
    else if (nextProps.selectorItem && nextProps.visible)
      this.checkSelectorItem(nextProps.selectorItem);
    //rowSelection.selectedRowKeys = [];
    let { rowSelection } = this.state;
    if(nextProps.single !== (rowSelection.type === 'radio')) {
      rowSelection.type = nextProps.single ? 'radio' : 'checkbox';
      this.setState({rowSelection})
    }
  };

  componentDidMount() {
    let { columns } = this.props;
  }

  handleOk = () => {
    this.props.onOk({
      result: this.state.selectedData,
      type: this.props.type
    })
  };

  /**
   * 根据selectedData刷新当页selection
   */
  refreshSelected() {
    let { valueKey } = this.props;
    let { selectorItem, selectedData, data, rowSelection } = this.state;
    let nowSelectedRowKeys = [];
    selectedData.map(selected => {
      data.map(item => {
        if (item[this.getLastKey(selectorItem.key)] === selected[this.getLastKey(selectorItem.key)])
          nowSelectedRowKeys.push(item[this.getLastKey(selectorItem.key)])
      })
    });
    rowSelection.selectedRowKeys = nowSelectedRowKeys;
    this.setState({ rowSelection });
  };

  //选项改变时的回调，重置selection
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let { rowSelection } = this.state;
    if (!(this.props.maxNum && this.props.maxNum > 0 && selectedRowKeys.length > this.props.maxNum)) {
      rowSelection.selectedRowKeys = selectedRowKeys
    }
    this.setState({ rowSelection });
  };

  /**
   * 选择单个时的方法，遍历selectedData，根据是否选中进行插入或删除操作
   * @param record 被改变的项
   * @param selected 是否选中
   */
  onSelectItem = (record, selected) => {
    let { valueKey } = this.props;
    let { selectedData, selectorItem } = this.state;
    if (this.props.single) {
      selectedData = [record];
    } else {
      if (!selected) {
        selectedData.map((selected, index) => {
          if (selected[this.getLastKey(valueKey || selectorItem.key)] == record[this.getLastKey(valueKey || selectorItem.key)]) {
            selectedData.splice(index, 1);
          }
        })
      } else {
        if (this.props.maxNum && this.props.maxNum > 0 && selectedData.length >= this.props.maxNum) {
          message.warning(this.$t('common.max.selected.data', { max: this.props.maxNum }))
        } else {
          selectedData.push(record)
        }
      }
    }
    this.setState({ selectedData });
  };

  //点击行时的方法，遍历遍历selectedData，根据是否选中进行遍历遍历selectedData和rowSelection的插入或删除操作
  handleRowClick = (record) => {
    let { valueKey } = this.props;
    let { selectedData, selectorItem, rowSelection } = this.state;
    if (this.props.single) {
      selectedData = [record];
      rowSelection.selectedRowKeys = [record[this.getLastKey(selectorItem.key)]]
    } else {
      let haveIt = false;
      selectedData.map((selected, index) => {
        if (selected[this.getLastKey(valueKey || selectorItem.key)].toString() === record[this.getLastKey(valueKey || selectorItem.key)].toString()) {
          selectedData.splice(index, 1);
          haveIt = true;
        }
      });
      if (!haveIt) {
        if (this.props.maxNum && this.props.maxNum > 0 && selectedData.length >= this.props.maxNum) {
          message.warning(this.$t('common.max.selected.data', { max: this.props.maxNum }))
        } else {
          selectedData.push(record);
          rowSelection.selectedRowKeys.push(record[this.getLastKey(selectorItem.key)])
        }
      } else {
        rowSelection.selectedRowKeys.map((item, index) => {
          if((item + '') === (record[this.getLastKey(selectorItem.key)] + '')){
            rowSelection.selectedRowKeys.splice(index, 1);
          }
        })
      }
    }
    this.setState({ selectedData, rowSelection });
  };

  //选择当页全部时的判断
  onSelectAll = (selected, selectedRows, changeRows) => {
    if (this.props.maxNum && this.props.maxNum > 0 && changeRows.length + this.state.selectedData.length > this.props.maxNum) {
      message.warning(this.$t('common.max.selected.data', { max: this.props.maxNum }));
    } else {
      changeRows.map(changeRow => this.onSelectItem(changeRow, selected))
    }
  };

  closeTag = (e, record) => {
    e.preventDefault();
    this.handleRowClick(record)
  };

  render() {
    const { visible, onCancel, afterClose, selectAll, selectAllLoading, onSelectAll, showDetail, labelKey, showArrow, valueKey, modalWidth,showRowClick} = this.props;
    const { data, pagination, loading, selectorItem, selectedData, rowSelection, scrollX } = this.state;
    const { searchForm, columns, title, key } = selectorItem;
    return (
      <Modal
        title={title}
        visible={visible}
        onCancel={onCancel}
        afterClose={afterClose}
        width={modalWidth ? modalWidth : 800}
        onOk={this.handleOk}
        className="list-selector"
        footer={this.props.hideFooter ? null : this.state.footerButton}
      >

        {searchForm && searchForm.length > 0 ? <SearchArea searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}
          wrappedComponentRef={(inst) => this.formRef = inst} /> : null}

        {showDetail && (
          <div className="selected-tag">
            {selectedData.map((item, index) => (
              <span key={item[this.getLastKey(valueKey || key)]}>
                <Tag closable
                  onClose={e => this.closeTag(e, item)}>{item[labelKey]}</Tag>
                {showArrow && index !== selectedData.length - 1 && <Icon type="arrow-right" style={{ marginRight: 8 }} />}
              </span>
            )
            )}
          </div>
        )}

        <div className="table-header">
          <div className="table-header-title">
            {selectAll && <Button style={{ marginRight: 10 }} loading={selectAllLoading} onClick={onSelectAll} type="primary">{this.$t('common.selectAll')/*选择全部*/}</Button>}
            {this.$t('common.total', { total: pagination.total || data.length })}{/* 共 total 条数据 */}
            {/* 已选数据显示有问题，所有注掉了
            {this.props.showSelectTotal?undefined:<span style={{color:'rgba(0, 0, 0, 0.65)'}}>
              &nbsp;<span>/</span>&nbsp;
            {this.$t('common.total.selected', { total: selectedData.length === 0 ? '0' : selectedData.length })} 已选 total 条
            </span>}*/}
          </div>
        </div>
        <div>

        </div>

        <Table columns={columns}
          onRow={this.props.showRowClick?undefined:record => ({ onClick: () => this.handleRowClick(record) })}
          dataSource={data}
          rowKey={record => record[this.getLastKey(key)]}
          pagination={pagination}
          loading={loading}
          bordered
          scroll={{ x: scrollX }}
          size="middle"
          rowSelection={this.props.hideRowSelect ? undefined : rowSelection}

        />
      </Modal>
    );
  }
}

ListSelector.propTypes = {
  visible: PropTypes.bool,  //对话框是否可见
  onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel: PropTypes.func,  //点击取消后的回调
  afterClose: PropTypes.func,  //关闭后的回调
  type: PropTypes.string,  //选择类型
  selectedData: PropTypes.array,  //默认选择的值id数组
  extraParams: PropTypes.object,  //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
  selectorItem: PropTypes.object,  //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
  single: PropTypes.bool,  //是否单选
  method: PropTypes.string,  //调用方法get/post
  selectAll: PropTypes.bool,  //是否需要选择全部按钮
  selectAllLoading: PropTypes.bool,  //全选全部按钮loading
  onSelectAll: PropTypes.func,  //点击选择全部时的回调
  maxNum: PropTypes.number,  //最多选择多少条数据
  showDetail: PropTypes.bool,  //是否在界面显示已选项
  labelKey: PropTypes.string,  //Tag内显示的值
  showArrow: PropTypes.bool,  //是否在Tag中显示箭头,
  hideRowSelect: PropTypes.bool, //是否去掉勾选框
  hideFooter: PropTypes.bool, //是否去掉底部确定取消按钮
  modalWidth: PropTypes.number, //modal的宽度
  showSelectTotal:PropTypes.bool,//是否显示已选多少条
  showRowClick:PropTypes.bool//是否需要行点击
};

ListSelector.defaultProps = {
  afterClose: () => { },
  extraParams: {},
  single: false,
  method: 'get',
  selectAll: false,
  selectAllLoading: false,
  onSelectAll: () => { },
  showDetail: false,
  showArrow: false,
  showSelectTotal:false,
  showRowClick:false
};

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(ListSelector);
