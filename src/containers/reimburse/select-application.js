import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Modal, Table, message, Button, Input, Row, Col, Popover } from 'antd';

import httpFetch from 'share/httpFetch';
import SearchArea from 'widget/search-area';
import 'styles/pre-payment/my-pre-payment/select-contract.scss';
// import menuRoute from 'routes/menuRoute';
import moment from 'moment';
import config from 'config';


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
      searchForm: [{ type: 'input', label: '申请单编号', id: 'contractNumber' }],
      columns: [
        {
          title: '提交日期',
          dataIndex: 'submittedDate',
          render: value => {
            return <span>{moment(value).format('YYYY-MM-DD')}</span>;
          },
        },
        { title: '申请单号', dataIndex: 'businessCode' },
        { title: '申请单名称', dataIndex: 'formName' },
        { title: '总金额', dataIndex: 'totalAmount', render: this.filterMoney },
        {
          title: '相关人员',
          dataIndex: 'applicationParticipants',
          render: value => {
            let text = '';
            if (value && value.length) {
              text = value
                .map(item => {
                  return item.fullName;
                })
                .join(',');
            }
            return <Popover content={text}>{text}</Popover>;
          },
        },
        // {
        //     title: '操作', dataIndex: 'id', render: (value) => {
        //         return (
        //             <a onClick={() => this.detail(value)}>查看</a>
        //         )
        //     }
        // }
      ],
    };
  }

  //查看申请单详情
  detail = id => {
    // let url = menuRoute.getRouteItem('contract-detail', 'key');
    // window.open(url.url.replace(':id', id), '_blank');
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
    const { applincationParams, type } = this.props.params;
    let selectorItem = this.state.selectorItem;
    const { page, pageSize } = this.state;

    let url = `${
      config.baseUrl
    }/api/application/related/expense?expenseTypeId=${type}&currencyCode=${
      applincationParams.currencyCode
    }&expReportHeaderId=${applincationParams.id}&page=${page}&size=${pageSize}`;

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
        this.setState({ loading: false });
      });
  }

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
    if (nextProps.params.show && !this.props.params.show) {
      this.setState({ page: 0, selectedData: nextProps.selectedData }, () => {
        this.getList();
      });
    }
  };

  handleOk = () => {
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
        if (item.apportionmentList) {
          item.apportionmentList.map(o => {
            if (o.id == selected) {
              nowSelectedRowKeys.push(o.id);
              this.setState({
                expandedRowKeys: [item.id],
                selectedData: [{ ...o, businessCode: item.businessCode }],
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
      rowSelection.selectedRowKeys = [record.id];
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
    this.setState({ selectedData, rowSelection });
  };

  //选择当页全部时的判断
  onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
  };

  expandedRowhange = values => {
    this.setState({ expandedRowKeys: values });
  };

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
    record.apportionmentList.map(o => {
      o.businessCode = record.businessCode;
    });

    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'lineNumber',
        render: (value, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      { title: '费用类型', dataIndex: 'expenseTypeName', key: 'expenseTypeName' },
      {
        title: '分摊金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (value, record) => {
          return (
            <span>
              {record.currencyCode} {this.formatMoney(value)}
            </span>
          );
        },
      },
      {
        title: '已报账金额',
        dataIndex: 'usedAmount',
        key: 'usedAmount',
        render: (value, record) => {
          return (
            <span>
              {record.currencyCode} {this.formatMoney(value)}
            </span>
          );
        },
      },
      {
        title: '可报账金额',
        dataIndex: 'usableAmount',
        key: 'usableAmount',
        render: (value, record) => {
          return (
            <span>
              {record.currencyCode} {this.formatMoney(value)}
            </span>
          );
        },
      },
      { title: '公司', dataIndex: 'companyName', key: 'companyName' },
      { title: '部门', dataIndex: 'departmentName', key: 'departmentName' },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.apportionmentList}
        pagination={false}
        rowSelection={this.state.rowSelection}
        rowKey={record => record['id']}
        onRow={record => ({ onClick: () => this.handleRowClick(record) })}
      />
    );
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
        title={'选择申请单'}
        visible={visible}
        onCancel={onCancel}
        afterClose={afterClose}
        width={1000}
        onOk={this.handleOk}
        className="list-selector select-contract"
      >
        {searchForm && searchForm.length > 0 ? (
          <SearchArea searchForm={searchForm} submitHandle={this.search} clearHandle={this.clear} />
        ) : null}
        <div className="table-header">
          <div className="table-header-title">
            {this.$t({ id: 'common.total' }, { total: pagination.total })}
            &nbsp;<span>/</span>&nbsp;
            {this.$t(
              { id: 'common.total.selected' },
              { total: selectedData.length === 0 ? '0' : selectedData.length }
            )}
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
          rowKey={record => record.id}
          onExpandedRowsChange={this.expandedRowhange}
          expandedRowRender={this.expandedRowRender}
        />
      </Modal>
    );
  }
}

SelectContract.propTypes = {
  visible: React.PropTypes.bool, //对话框是否可见
  onOk: React.PropTypes.func, //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel: React.PropTypes.func, //点击取消后的回调
  afterClose: React.PropTypes.func, //关闭后的回调
  type: React.PropTypes.string, //选择类型
  selectedData: React.PropTypes.array, //默认选择的值id数组
  extraParams: React.PropTypes.object, //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
  selectorItem: React.PropTypes.object, //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
  single: React.PropTypes.bool, //是否单选
};

SelectContract.contextTypes = {
  router: React.PropTypes.object,
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
