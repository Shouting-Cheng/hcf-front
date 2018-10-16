import React, { Component } from 'react';
import { Modal, Table } from 'antd';
import { connect } from 'dva';
import httpFetch from 'share/httpFetch';
import SearchArea from 'widget/search-area';
import config from 'config';
import PropTypes from 'prop-types';

class SelectCheckSheetType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        { type: 'input', id: 'companyName', label: '公司名称' },
        { type: 'input', id: 'formCode', label: '报账单类型代码' },
        { type: 'input', id: 'formName', label: '报账单类型名称' },
      ],
      selectedData: [],
      columns: [
        { title: '公司名称', dataIndex: 'companyName' },
        { title: '报账单类型代码', dataIndex: 'formCode' },
        { title: '报账单类型名称', dataIndex: 'formName' },
      ],
      pagination: {
        total: 0,
      },
      loading: true,
      rowSelection: {
        type: 'checkbox',
        selectedRowKeys: [],
        onChange: this.onItemChange,
        onSelect: this.onItemSelect,
        onSelectAll: this.onSelectAll,
      },
      page: 0,
      pageSize: 10,
      searchParams: {},
      data: [],
    };
  }
  onItemChange = (selectedRowKeys, selectedRows) => {
    let { rowSelection } = this.state;
    rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({ rowSelection: rowSelection });
  };
  onItemSelect = (record, selected) => {
    let { selectedData } = this.state;
    if (!selected) {
      selectedData.map((item, index) => {
        if (item == record['formId']) {
          selectedData.splice(index, 1);
        }
      });
    } else {
      selectedData.push(record['formId']);
    }
    this.setState({ selectedData });
  };
  onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.map(changeRow => {
      this.onItemSelect(changeRow, selected);
    });
  };
  componentWillReceiveProps = nextProps => {
    if (nextProps.visible) {
      this.setState(
        {
          page: 0,
        },
        () => {
          this.getList();
        }
      );
    }
  };

  getList = () => {
    let params = {
      page: this.state.page,
      size: this.state.pageSize,
      setOfBooksId: this.props.params.setOfBooksId,
      companyName: this.state.searchParams.companyName,
      formName: this.state.searchParams.formName,
      formCode: this.state.searchParams.formCode,
    };
    httpFetch
      .get(`${config.baseUrl}/api/expReportHeader/custom/forms/setOfBooksId?`, params)
      .then(res => {
        this.setState(
          {
            loading: false,
            data: res.data,
            pagination: {
              total: Number(
                res.headers['x-total-count'] ? Number(res.headers['x-total-count']) : 0
              ),
              onChange: this.onChangePager,
              current: this.state.page + 1,
            },
          },
          () => {
            this.refreshSelectedData();
          }
        );
      });
  };
  refreshSelectedData = () => {
    let { rowSelection, data } = this.state;
    let nowSelectedRowKeys = [];
    this.props.selectedData.map(item => {
      data.map(record => {
        if (item == record['formId']) {
          nowSelectedRowKeys.push(record['formId']);
        }
      });
    });
    rowSelection.selectedRowKeys = nowSelectedRowKeys;
    this.setState({ selectedData: this.props.selectedData, rowSelection: rowSelection });
  };
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
  handleOk = () => {
    this.props.onOk({ result: this.state.selectedData });
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
    this.setState(
      {
        page: 0,
        loading: true,
        searchParams: {},
      },
      () => {
        this.getList();
      }
    );
  };
  //表格的行点击事件
  onTableRowClick = (record, index) => {
    let { selectedData, rowSelection } = this.state;
    let count = 0;
    selectedData.map((selected, indexx) => {
      if (selected == record['formId']) {
        count++;
        selectedData.splice(indexx, 1);
        rowSelection.selectedRowKeys.map((selectedRowKey, indexxx) => {
          if (selected == selectedRowKey) {
            rowSelection.selectedRowKeys.splice(indexxx, 1);
          }
        });
      }
    });
    if (count == 0) {
      selectedData.push(record['formId']);
      rowSelection.selectedRowKeys.push(record['formId']);
    }
    this.setState({ selectedData: selectedData, rowSelection: rowSelection });
  };
  render() {
    const { visible, onCancel } = this.props;
    const {
      loading,
      searchForm,
      columns,
      pagination,
      selectedData,
      rowSelection,
      data,
    } = this.state;
    return (
      <Modal
        title="报账单类型"
        onOk={this.handleOk}
        visible={visible}
        onCancel={onCancel}
        className="list-selector"
        width={800}
      >
        <div>
          {
            <SearchArea
              searchForm={searchForm}
              submitHandle={this.search}
              clearHandle={this.clear}
            />
          }
          <div className="table-header">
            <div className="table-header-title">
              {this.$t(
                { id: 'common.total' },
                { total: Number(pagination.total) == 0 ? '0' : Number(pagination.total) }
              )}
              &nbsp;<span>/</span>&nbsp;
              {this.$t(
                { id: 'common.total.selected' },
                { total: selectedData.length == 0 ? '0' : selectedData.length }
              )}
            </div>
          </div>
          <Table
            columns={columns}
            rowKey={record => record['formId']}
            loading={loading}
            pagination={pagination}
            size="middle"
            rowSelection={rowSelection}
            dataSource={data}
            bordered
            onRowClick={this.onTableRowClick}
          />
        </div>
      </Modal>
    );
  }
}
SelectCheckSheetType.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  selectedData: PropTypes.array,
  onOk: PropTypes.func,
};
function mapStateToProps() {
  return {};
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SelectCheckSheetType);
