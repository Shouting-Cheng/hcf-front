import React from 'react';
import { Modal, Table, message, Button, Input, Row, Col, Select, Tag, Icon, Popover } from 'antd';
import { connect } from 'dva';
import httpFetch from 'share/httpFetch';
import SearchArea from 'widget/search-area';
import config from 'config';
import ExpreportDetail from 'containers/reimburse/my-reimburse/reimburse-detail';
import PropTypes from 'prop-types';

class SelectExpense extends React.Component {
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
      searchForm: [
        {
          type: 'input',
          label: this.$t({ id: 'acp.requisitionNumber' } /*单据编号*/),
          id: 'reportNumber',
        },
      ],
      columns: [
        {
          title: this.$t({ id: 'acp.requisitionNumber' } /*单据编号*/),
          dataIndex: 'reportNumber',
          render: value => {
            return (
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>
                {value}
              </Popover>
            );
          },
        },
        {
          title: this.$t({ id: 'acp.public.documentTypeName' } /*单据类型名称*/),
          dataIndex: 'reportTypeName',
          render: value => {
            return (
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>
                {value}
              </Popover>
            );
          },
        },
        {
          title: this.$t({ id: 'acp.operator' } /*操作*/),
          dataIndex: 'reportHeadId',
          render: value => {
            return <a onClick={() => this.detail(value)}>{this.$t({ id: 'acp.view' } /*查看*/)}</a>;
          },
        },
      ],
      showListSelector: false,
      windowRandom: 0,
      expenseParams: {},
      btnloading: false,
      detailId: undefined, //合同或者报账单ID
      showExpreportDetail: false, //报账单详情
    };
  }

  detail = id => {
    this.setState({
      detailId: id,
      showExpreportDetail: true,
    });
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

  clear = () => {};
  //得到数据
  getList() {
    let selectorItem = this.state.selectorItem;

    const { typeParams } = this.props;

    const { page, pageSize } = this.state;

    let searchParams = { ...this.state.searchParams };

    let url = `${
      config.payUrl
    }/api/cash/transactionData/relation/query?page=${page}&size=${pageSize}&applicationId=${
      typeParams.applicationId
    }&allType=${typeParams.allType}&formTypes=${typeParams.formTypes}`;

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
              total: Number(response.headers['x-total-count'])
                ? Number(response.headers['x-total-count'])
                : 0,
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
        message.error(
          this.$t({ id: 'acp.getData.error' } /*获取数据失败!*/) + e.response.data.message
        );
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
    if (!this.props.visible) {
      this.setState({ showListSelector: false, windowRandom: Math.random() });
    }
  };

  handleOk = () => {
    this.setState({ btnloading: true }, () => {
      this.props.onOk({
        result: this.state.selectedData,
      });
    });
  };

  /**
   * 根据selectedData刷新当页selection
   */
  refreshSelected() {
    let { selectorItem, selectedData, data, rowSelection } = this.state;
    let nowSelectedRowKeys = [];
    selectedData.map((item, index) => {
      nowSelectedRowKeys.push(item.reportLineId);
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
    }
    this.setState({ selectedData });
  };

  //点击行时的方法，遍历遍历selectedData，根据是否选中进行遍历遍历selectedData和rowSelection的插入或删除操作
  handleRowClick = record => {
    let { selectedData, selectorItem, rowSelection } = this.state;
    if (this.props.single) {
      selectedData = [record];
      rowSelection.selectedRowKeys = [record['scheduleLineId']];
    }
    this.setState({ selectedData, rowSelection });
  };

  //选择当页全部时的判断
  onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
  };

  //渲染额外行
  expandedRowRender = (record, index) => {
    const columns = [
      {
        title: this.$t({ id: 'acp.index' } /*序号*/),
        dataIndex: 'scheduleLineNumber',
        key: 'scheduleLineNumber',
        width: 80,
        render: value => {
          return (
            <Popover content={value} overlayStyle={{ maxWidth: 300 }}>
              {value}
            </Popover>
          );
        },
      },
      {
        title: this.$t({ id: 'acp.public.total.amount' } /*延后支付金额*/),
        dataIndex: 'amount',
        key: 'amount',
        width: 120,
        render: value => {
          return (
            <Popover content={this.filterMoney(value)} overlayStyle={{ maxWidth: 300 }}>
              {this.filterMoney(value)}
            </Popover>
          );
        },
      },
      {
        title: this.$t({ id: 'acp.public.relation.amount' } /*已关联*/),
        dataIndex: 'associatedAmount',
        key: 'associatedAmount',
        width: 90,
        render: value => {
          return (
            <Popover content={this.filterMoney(value)} overlayStyle={{ maxWidth: 300 }}>
              {this.filterMoney(value)}
            </Popover>
          );
        },
      },
      {
        title: this.$t({ id: 'acp.public.able.relation' } /*可关联*/),
        dataIndex: 'availableAmount',
        key: 'availableAmount',
        width: 90,
        render: value => {
          return (
            <Popover content={this.filterMoney(value)} overlayStyle={{ maxWidth: 300 }}>
              {this.filterMoney(value)}
            </Popover>
          );
        },
      },
      {
        title: this.$t({ id: 'acp.currency' } /*币种*/),
        dataIndex: 'currency',
        key: 'currency',
        width: 70,
      },
      {
        title: this.$t({ id: 'acp.partnerCategory' } /*收款方*/),
        dataIndex: 'payeeId',
        width: 150,
        render: (value, record) => {
          return (
            <div style={{ whiteSpace: 'normal' }}>
              <Tag color="#000">
                {record.payeeCategory === 'EMPLOYEE'
                  ? this.$t({ id: 'acp.employee' } /*员工*/)
                  : this.$t({ id: 'acp.vendor' } /*供应商*/)}
              </Tag>
              <Popover
                placement="topLeft"
                content={record.payeeName}
                overlayStyle={{ maxWidth: 300 }}
              >
                {record.payeeName}
              </Popover>
            </div>
          );
        },
      },
    ];

    let data = record.lineList.map(item => {
      return { ...item, reportNumber: record.reportNumber, reportHeadId: record.reportHeadId };
    });
    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        onRow={record => ({
          onClick: () => this.handleRowClick(record),
        })}
        rowSelection={this.state.rowSelection}
        rowKey={record => record.scheduleLineId}
        scroll={{ x: true }}
        bordered={true}
        // onRow={record => ({ onClick: () => this.handleRowClick(record) })}
      />
    );
  };
  handleFocus = () => {
    this.refs.chooserBlur.focus();
    this.setState({
      showListSelector: true,
      selectedData: this.props.chooseredData,
      btnloading: false,
    });
    this.setState({ page: 0, searchParams: {} }, () => {
      this.getList();
    });
  };
  //清空
  handleClear = () => {
    this.setState({
      selectedData: [],
      rowSelection: {
        type: this.props.single ? 'radio' : 'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
        onSelect: this.onSelectItem,
        onSelectAll: this.onSelectAll,
      },
    });
  };
  //报账单返回
  onCloseExpreport = () => {
    this.setState({ showExpreportDetail: false });
  };
  wrapClose = content => {
    let id = this.state.detailId;
    const newProps = {
      params: { id: id, refund: true },
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };
  render() {
    const { onCancel, afterClose, fullName } = this.props;
    const {
      data,
      pagination,
      loading,
      columns,
      windowRandom,
      selectedData,
      inputValue,
      searchForm,
      showListSelector,
      openWindowFlag,
    } = this.state;
    return (
      <div>
        <Select
          mode="multiple"
          placeholder={this.$t({ id: 'acp.select.publicReport' } /* 请先选择报账单*/)}
          onFocus={this.handleFocus}
          dropdownStyle={{ display: 'none' }}
          value={fullName}
        />
        <Modal
          title={this.$t({ id: 'acp.select.publicReport' } /* 请先选择报账单*/)}
          visible={showListSelector}
          afterClose={afterClose}
          width={800}
          className="list-selector select-contract"
          closable={false}
          onCancel={onCancel}
          key={windowRandom}
          footer={[
            <Button key="back" onClick={onCancel}>
              {this.$t({ id: 'common.cancel' } /*取消*/)}
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={this.state.btnloading}
              onClick={this.handleOk}
            >
              {this.$t({ id: 'common.ok' } /*确定*/)}
            </Button>,
          ]}
        >
          {searchForm && searchForm.length > 0 ? (
            <SearchArea
              searchForm={searchForm}
              submitHandle={this.search}
              clearHandle={this.clear}
            />
          ) : null}
          <div className="table-header">
            <div className="table-header-title">
              {this.$t({ id: 'common.total' }, { total: pagination.total })}
              &nbsp;<span>/</span>&nbsp;
              {this.$t(
                { id: 'common.total.selected' },
                { total: selectedData.length === 0 ? '0' : selectedData.length }
              )}
              &nbsp;&nbsp;&nbsp;<a
                style={{ fontSize: '14px', paddingBottom: '20px' }}
                onClick={this.handleClear}
              >
                <Icon type="delete" style={{ marginRight: '5px' }} />
                {this.$t({ id: 'acp.clean' } /*清空*/)}
              </a>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            rowKey={record => record.reportHeadId}
            pagination={pagination}
            loading={loading}
            bordered={true}
            size="middle"
            expandedRowRender={this.expandedRowRender}
          />
        </Modal>
        <input
          ref="chooserBlur"
          style={{ position: 'absolute', top: '-9999vh', left: 0, zIndex: -1 }}
        />
        <Modal
          visible={this.state.showExpreportDetail}
          footer={[
            <Button key="back" onClick={this.onCloseExpreport}>
              {this.$t({ id: 'common.back' } /*返回*/)}
            </Button>,
          ]}
          width={1200}
          closable={false}
          destroyOnClose={true}
          onCancel={this.onCloseExpreport}
        >
          <div>{this.wrapClose(ExpreportDetail)}</div>
        </Modal>
      </div>
    );
  }
}

SelectExpense.propTypes = {
  visible: PropTypes.bool, //对话框是否可见
  onOk: PropTypes.func, //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel:PropTypes.func, //点击取消后的回调
  afterClose: PropTypes.func, //关闭后的回调
  type: PropTypes.string, //选择类型
  selectedData: PropTypes.array, //默认选择的值id数组
  extraParams: PropTypes.object, //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
  selectorItem: PropTypes.object, //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
  single: PropTypes.bool, //是否单选
};



SelectExpense.defaultProps = {
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
)(SelectExpense);
