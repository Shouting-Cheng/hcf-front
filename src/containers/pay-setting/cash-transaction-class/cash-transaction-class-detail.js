import React from 'react';
import { connect } from 'dva';
import { Tabs, Button, message, Icon, Table, Checkbox, Badge } from 'antd';
import chooserData from 'chooserData';
const TabPane = Tabs.TabPane;
import { routerRedux } from 'dva/router';
import cashTransactionClassService from './cash-transaction-class.service';
import ListSelector from 'widget/list-selector';
import BasicInfo from 'widget/basic-info';

class CashTransactionClassDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updateState: false,
      saving: false,
      loading: true,
      editing: false,
      setOfBookId: -1,
      infoList: [
        {
          type: 'input',
          id: 'setOfBookName',
          required: true,
          disabled: true,
          label: `${this.$t({ id: 'cash.transaction.class.setOfBooksName' })}`,
        }, //账套
        {
          type: 'input',
          id: 'typeName',
          required: true,
          disabled: true,
          label: this.$t({ id: 'cash.transaction.class.type' }),
        } /*现金事务类型代码*/,
        {
          type: 'input',
          id: 'classCode',
          required: true,
          disabled: true,
          label: this.$t({ id: 'cash.transaction.class.code' }),
        } /*现金事务分类代码*/,
        {
          type: 'input',
          id: 'description',
          required: true,
          label: this.$t({ id: 'cash.transaction.class.description' }),
        } /*现金事务分类名称*/,
        {
          type: 'switch',
          id: 'enabled',
          label: this.$t({ id: 'common.column.status' }) + ' :' /*状态*/,
        },
      ],
      classData: {},
      data: [],
      cashFlowItemData: {
        selectorItem: chooserData['cash_flow_item_no_save'],
        columns: [
          {
            title: this.$t({ id: 'cash.flow.item.flowCode' }),
            dataIndex: 'cashFlowItemCode',
            width: '30%',
          },
          {
            title: this.$t({ id: 'cash.flow.item.description' }),
            dataIndex: 'cashFlowItemName',
            width: '40%',
          },
          {
            title: this.$t({ id: 'cash.flow.item.default.flag' }),
            dataIndex: 'defaultFlag',
            width: '15%',
            render: (defaultFlag, record) => (
              <Checkbox
                onChange={e => this.onChangeDefault(e, record)}
                checked={record.defaultFlag}
              />
            ),
          },
          {
            title: this.$t({ id: 'cash.flow.item.enabled.flag' }),
            key: 'enabled',
            width: '15%',
            render: (enabled, record) => (
              <Checkbox onChange={e => this.onChangeEnabled(e, record)} checked={record.enabled} />
            ),
          },
        ],
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      showListSelector: false,
      newData: [],
      cashTransactionClass: '/pay-setting/cash-transaction-class',
    };
  }

  onChangeDefault = (e, record) => {
    this.setState({ loading: true });
    record.defaultFlag = e.target.checked;
    cashTransactionClassService
      .updateCashTransactionClassRefCashFlowItem(record)
      .then(() => {
        this.getList().then(response => {
          this.setState({ loading: false });
        });
      })
      .catch(e => {
        if (e.response) {
          message.error(this.$t({ id: 'common.save.filed' }) + `,${e.response.data.message}`);
        }
        this.setState({ loading: false });
      });
  };

  onChangeEnabled = (e, record) => {
    this.setState({ loading: true });
    record.enabled = e.target.checked;
    cashTransactionClassService
      .updateCashTransactionClassRefCashFlowItem(record)
      .then(() => {
        this.getList().then(response => {
          this.setState({ loading: false });
        });
      })
      .catch(e => {
        if (e.response) {
          message.error(this.$t({ id: 'common.save.filed' }) + `,${e.response.data.message}`);
        }
        this.setState({ loading: false });
      });
  };

  componentWillMount() {
    cashTransactionClassService
      .getCashTransactionClassById(this.props.match.params.id)
      .then(response => {
        let data = response.data;
        data.setOfBookName = data.setOfBookCode + ' - ' + data.setOfBookName;
        let infoList = this.state.infoList;
        this.setState({ classData: data, setOfBookId: data.setOfBookId, infoList });
      });
    this.getList();
  }

  getList = () => {
    let params = {};
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    params.transactionClassId = this.props.match.params.id;
    return cashTransactionClassService
      .getCashTransactionClassRefCashFlowItem(params)
      .then(response => {
        response.data.map((item, index) => {
          item.key = item.id ? item.id : index;
        });
        this.setState({
          data: response.data,
          loading: false,
          pagination: {
            total: Number(response.headers['x-total-count']) || 0,
            onChange: this.onChangePager,
            current: this.state.page + 1,
            pageSizeOptions: ['10', '20', '30', '40'],
            showSizeChanger: true,
            onShowSizeChange: this.onChangePageSize,
            showQuickJumper: true,
            showTotal: (total, range) =>
              this.$t(
                { id: 'common.show.total' },
                { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
              ),
          },
        });
      });
  };

  //每页多少条
  onChangePageSize = (page, pageSize) => {
    if (page - 1 !== this.state.pagination.page || pageSize !== this.state.pagination.pageSize) {
      this.setState(
        {
          pagination: {
            page: page - 1,
            pageSize: pageSize,
          },
        },
        () => {
          this.getList();
        }
      );
    }
  };
  handleNew = () => {
    this.setState({ showListSelector: true });
  };

  handleAdd = result => {
    this.setState(
      {
        newData: result.result,
        showListSelector: false,
      },
      () => {
        this.handleSave();
      }
    );
  };

  handleCancel = () => {
    this.setState({ showListSelector: false });
  };

  handleSave = () => {
    const { nowStatus, newData } = this.state;
    let paramList = [];
    newData.map(item => {
      let flowItem = {};
      flowItem.cashFlowItemId = item.id;
      flowItem.transactionClassId = this.props.match.params.id;
      flowItem.defaultFlag = false;
      flowItem.enabled = true;
      paramList.push(flowItem);
    });
    this.setState({ saving: true }, () => {
      cashTransactionClassService
        .batchAddCashTransactionClassRefCashFlowItem(paramList)
        .then(response => {
          message.success(this.$t({ id: 'common.operate.success' }));
          this.setState(
            {
              newData: [],
              page: 0,
              saving: false,
            },
            () => {
              this.getList();
            }
          );
        })
        .catch(e => {
          this.setState({ editing: false, saving: false });
          if (e.response) {
            message.error(this.$t({ id: 'common.operate.filed' }) + `,${e.response.data.message}`);
          }
        });
    });
  };

  //分页点击
  onChangePager = page => {
    if (page - 1 !== this.state.pagination.page)
      this.setState(
        {
          pagination: {
            page: page - 1,
            pageSize: pageSize,
          },
        },
        () => {
          this.getList();
        }
      );
  };

  updateHandleInfo = params => {
    this.setState({ editing: true });
    cashTransactionClassService
      .updateCashTransactionClass(Object.assign({}, this.state.classData, params))
      .then(response => {
        message.success(this.$t({ id: 'common.operate.success' }));
        let data = response.data;
        let infoList = this.state.infoList;
        this.setState({
          classData: data,
          updateState: true,
          editing: false,
          infoList,
        });
      })
      .catch(e => {
        if (e.response) {
          message.error(this.$t({ id: 'common.save.filed' }) + `,${e.response.data.message}`);
        }
        this.setState({ editing: false });
      });
  };
  backFunc = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.cashTransactionClass,
      })
    );
  };

  render() {
    const {
      infoList,
      classData,
      cashFlowItemData,
      loading,
      pagination,
      data,
      showListSelector,
      saving,
      updateState,
      editing,
    } = this.state;
    return (
      <div>
        <BasicInfo
          infoList={infoList}
          infoData={classData}
          updateHandle={this.updateHandleInfo}
          updateState={updateState}
          loading={editing}
        />
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew} loading={saving}>
              添 加
            </Button>
          </div>
        </div>
        <Table
          columns={cashFlowItemData.columns}
          dataSource={data}
          onChange={this.onChangePager}
          pagination={pagination}
          loading={loading}
          bordered
          size="middle"
        />

        <a className="back" onClick={this.backFunc}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />返回
        </a>

        <ListSelector
          visible={showListSelector}
          onOk={this.handleAdd}
          onCancel={this.handleCancel}
          selectorItem={cashFlowItemData.selectorItem}
          extraParams={
            cashFlowItemData.extraParams
              ? cashFlowItemData.extraParams
              : {
                  setOfBookId: this.state.setOfBookId,
                  enabled: true,
                  transactionClassId: this.props.match.params.id,
                }
          }
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(CashTransactionClassDetail);
