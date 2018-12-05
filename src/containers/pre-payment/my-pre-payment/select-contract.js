import React from 'react';
import { connect } from 'dva';
import { Modal, Table, message, Button, Input, Row, Col, Popover } from 'antd';
import httpFetch from 'share/httpFetch';
import SearchArea from 'widget/search-area';
import 'styles/pre-payment/my-pre-payment/select-contract.scss';
// import menuRoute from 'routes/menuRoute'
import moment from 'moment';
import config from 'config';

import PropTypes from 'prop-types';

class SelectContract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      selectedData: [], //已经选择的数据项
      selectorItem: {}, //当前的选择器类型数据项, 包含url、searchForm、columns
      searchParams: {}, //搜索需要的参数
      rowSelection: {
        type: this.props.single ? 'radio' : 'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
        onSelect: this.onSelectItem,
        onSelectAll: this.onSelectAll,
      },
      expandedRowKeys: [],
      params: {},
      searchForm: [
        { type: 'input', label: '合同编号', id: 'contractNumber' },
        { type: 'input', label: '合同类型', id: 'contractTypeName' },
        { type: 'input', label: '合同名称', id: 'contractName' },
      ],
      columns: [
        { title: '合同编号', dataIndex: 'contractNumber', align: 'center' },
        { title: '合同类型', dataIndex: 'contractTypeName', align: 'center' },
        { title: '合同名称', dataIndex: 'contractName', align: 'center' },
        { title: '币种', dataIndex: 'contractCurrency', align: 'center' },
        { title: '总金额', dataIndex: 'contractAmount', align: 'center' },
        {
          title: '操作',
          dataIndex: 'contractHeaderId',
          align: 'center',
          render: value => {
            return <a onClick={() => this.detail(value)}>查看</a>;
          },
        },
      ],
    };
  }
  //查看申请单详情
  detail = id => {
    let url = menuRoute.getRouteItem('contract-detail', 'key');
    window.open(url.url.replace(':id', id).replace(':from', 'pre-payment'), '_blank');
  };
  search = params => {
    this.setState(
      {
        page: 0,
        searchParams: params,
        loading: true,
      },
      () => {
        this.getList();
      }
    );
  };
  clear = () => {
    let searchParams = {};
    this.state.selectorItem.searchForm.map(form => {
      searchParams[form.id] = form.defaultValue;
    });
    this.setState(
      {
        page: 0,
        searchParams: searchParams,
      },
      () => {
        this.getList();
      }
    );
  };
  //得到数据
  getList() {
    let selectorItem = this.state.selectorItem;
    const { page, pageSize } = this.state;
    let searchParams = { ...this.state.searchParams, ...this.state.params };
    let url = `${
      config.baseUrl
    }/contract/api/contract/document/relations/associate/query?page=${page}&size=${pageSize}`;
    for (let key in searchParams) {
      if (searchParams[key]) {
        url += `&${key}=${searchParams[key]}`;
      }
    }
    httpFetch
      .get(url)
      .then(response => {
        this.setState(
          {
            data: response.data,
            loading: false,
            pagination: {
              total: Number(response.headers['x-total-count']),
              onChange: this.onChangePager,
              current: this.state.page + 1,
            },
          },
          () => {
            this.refreshSelected(); //刷新当页选择器
          }
        );
      })
      .catch(e => {
        message.error('获取数据失败，请稍后重试或联系管理员');
        this.setState({
          loading: false,
        });
      });
  }
  /**
   * 分页方法
   */
  onChangePager = page => {
    if (page - 1 !== this.state.page)
      this.setState(
        {
          page: page - 1,
          loading: true,
        },
        () => {
          this.getList();
        }
      );
  };
  /**
   * 判断this.props.type是否有变化，如果有变化则重新渲染页面
   * @param type
   */
  checkType(type) {
    let selectorItem = selectorData[type];
    if (selectorItem) {
      this.checkSelectorItem(selectorItem);
    }
  }
  checkSelectorItem(selectorItem) {
    let searchParams = {};
    selectorItem.searchForm.map(form => {
      searchParams[form.id] = form.defaultValue; //遍历searchForm，取id组装成searchParams
    });
    this.setState({ selectorItem, searchParams }, () => {
      this.getList();
    });
  }
  /**
   * 每次父元素进行setState时调用的操作，判断nextProps内是否有type的变化
   * 如果selectedData有值则代表有默认值传入需要替换本地已选择数组，
   * 如果没有值则需要把本地已选择数组置空
   * @param nextProps 下一阶段的props
   */
  componentWillReceiveProps = nextProps => {
    if (JSON.stringify(nextProps.params) !== '{}' && JSON.stringify(this.props.params) === '{}') {
      this.setState(
        { page: 0, selectedData: nextProps.selectedData, params: nextProps.params },
        () => {
          this.getList();
        }
      );
    }
  };
  handleOk = () => {
    this.setState({ expandedRowKeys: [] });
    this.props.onOk({
      result: this.state.selectedData,
      type: this.props.type,
    });
  };
  /**
   * 根据selectedData刷新当页selection
   */
  refreshSelected() {
    let { selectorItem, selectedData, data, rowSelection } = this.state;
    let nowSelectedRowKeys = [];
    selectedData.map(selected => {
      data.map(item => {
        if (item.lineList) {
          item.lineList.map(o => {
            if (o.contractLineId == selected) {
              nowSelectedRowKeys.push(o.contractLineId);
              this.setState({
                expandedRowKeys: [item.contractHeaderId],
                selectedData: [
                  {
                    ...o,
                    contractNumber: item.contractNumber,
                    contractId: item.contractHeaderId,
                  },
                ],
              });
            }
          });
        }
      });
    });
    rowSelection.selectedRowKeys = nowSelectedRowKeys;
    this.setState({ rowSelection });
  }
  //选项改变时的回调，重置selection
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let { rowSelection } = this.state;
    rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({ rowSelection });
  };
  /**
   * 选择单个时的方法，遍历selectedData，根据是否选中进行插入或删除操作
   * @param record 被改变的项
   * @param selected 是否选中
   */
  onSelectItem = (record, selected) => {
    let { selectedData, selectorItem } = this.state;
    if (this.props.single) {
      selectedData = [record];
    } else {
      if (!selected) {
        selectedData.map((selected, index) => {
          if (selected[selectorItem.key] == record[selectorItem.key]) {
            selectedData.splice(index, 1);
          }
        });
      } else {
        selectedData.push(record);
      }
    }
    this.setState({ selectedData });
  };
  //点击行时的方法，遍历遍历selectedData，根据是否选中进行遍历遍历selectedData和rowSelection的插入或删除操作
  handleRowClick = record => {
    let { selectedData, selectorItem, rowSelection } = this.state;
    if (this.props.single) {
      selectedData = [record];
      rowSelection.selectedRowKeys = [record.contractLineId];
    } else {
      let haveIt = false;
      selectedData.map((selected, index) => {
        if (selected[selectorItem.key] == record[selectorItem.key]) {
          selectedData.splice(index, 1);
          haveIt = true;
        }
      });
      if (!haveIt) {
        selectedData.push(record);
        rowSelection.selectedRowKeys.push(record[selectorItem.key]);
      } else {
        rowSelection.selectedRowKeys.map((item, index) => {
          if (item == record[selectorItem.key]) {
            rowSelection.selectedRowKeys.splice(index, 1);
          }
        });
      }
    }
    this.setState({
      selectedData,
      rowSelection,
    });
  };
  //选择当页全部时的判断
  onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
  };
  //格式化金额
  formatMoney = (money, fixed = 2) => {
    if (typeof fixed !== 'number') fixed = 2;
    money = Number(money || 0)
      .toFixed(fixed)
      .toString();
    let numberString = '';
    if (money.indexOf('.') > -1) {
      let integer = money.split('.')[0];
      let decimals = money.split('.')[1];
      numberString = integer.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '.' + decimals;
    } else {
      numberString = money.replace(/(\d)(?=(\d{3})+(?!\d))\./g, '$1,');
    }
    numberString += numberString.indexOf('.') > -1 ? '' : '.00';
    return <span>{numberString}</span>;
  };
  //渲染额外行
  expandedRowRender = (record, index) => {
    const columns = [
      { title: '付款计划序号', dataIndex: 'lineNumber', key: 'lineNumber' },
      {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (value, record) => {
          return (
            <span>
              {record.currency} {this.formatMoney(value)}
            </span>
          );
        },
      },
      {
        title: '计划付款日期',
        key: 'dueDate',
        dataIndex: 'dueDate',
        render: value => moment(value).format('YYYY-MM-DD'),
      },
      {
        title: '已关联',
        dataIndex: 'associatedAmount',
        key: 'associatedAmount',
        render: (value, record) => {
          return (
            <span>
              {record.currency} {this.formatMoney(value)}
            </span>
          );
        },
      },
      {
        title: '可关联',
        dataIndex: 'availableAmount',
        key: 'availableAmount',
        render: (value, record) => {
          return (
            <span>
              {record.currency} {this.formatMoney(value)}
            </span>
          );
        },
      },
    ];
    let data = record.lineList.map(item => {
      return {
        ...item,
        contractNumber: record.contractNumber,
        contractId: record.contractHeaderId,
      };
    });
    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={this.state.rowSelection}
        rowKey={record => record['contractLineId']}
        onRow={record => ({ onClick: () => this.handleRowClick(record) })}
      />
    );
  };
  expandedRowhange = values => {
    this.setState({ expandedRowKeys: values });
  };
  onCancel = () => {
    this.setState({ expandedRowKeys: [] });
    this.props.onCancel && this.props.onCancel();
  };
  render() {
    const { visible, onCancel, afterClose } = this.props;
    const {
      data,
      pagination,
      loading,
      columns,
      selectorItem,
      selectedData,
      rowSelection,
      inputValue,
      searchForm,
      expandedRowKeys,
    } = this.state;
    return (
      <Modal
        title={'选择合同'}
        visible={visible}
        onCancel={this.onCancel}
        afterClose={afterClose}
        width={800}
        onOk={this.handleOk}
        className="list-selector select-contract"
      >
        {searchForm && searchForm.length > 0 ? (
          <SearchArea searchForm={searchForm} submitHandle={this.search} clearHandle={this.clear} />
        ) : null}
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: pagination.total })}
            {/* &nbsp;<span>/</span>&nbsp;
            {this.$t('common.total.selected', {
              total: selectedData.length === 0 ? '0' : selectedData.length,
            })} */}
          </div>
        </div>
        <Table
          columns={columns}
          className="components-table-demo-nested"
          dataSource={data}
          pagination={pagination}
          loading={loading}
          size="middle"
          expandRowByClick={true}
          expandedRowKeys={expandedRowKeys}
          onExpandedRowsChange={this.expandedRowhange}
          rowKey={record => record.contractHeaderId}
          expandedRowRender={this.expandedRowRender}
        />
      </Modal>
    );
  }
}
SelectContract.propTypes = {
  visible: PropTypes.bool, //对话框是否可见
  onOk: PropTypes.func, //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel: PropTypes.func, //点击取消后的回调
  afterClose: PropTypes.func, //关闭后的回调
  type: PropTypes.string, //选择类型
  selectedData: PropTypes.array, //默认选择的值id数组
  extraParams: PropTypes.object, //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
  selectorItem: PropTypes.object, //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
  single: PropTypes.bool, //是否单选
};

SelectContract.defaultProps = {
  afterClose: () => {},
  extraParams: {},
  single: false,
};
function mapStateToProps() {
  return {};
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SelectContract);
