import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Modal, message, Button, Popconfirm, Popover, Badge, Tabs } from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
import BSService from 'containers/basic-data/bank-definition/bank-definition.service';
import SearchArea from 'widget/search-area';
class BankPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      page: 0,
      pageSize: 10,
      selectedData: [], //已经选择的数据项
      selectorItem: {}, //当前的选择器类型数据项, 包含url、searchForm、columns
      //点击顶部搜索时要参数
      searchParams: {
        bankBranchName: '',
      },
      label: 'customBank',
      tabs: [
        { key: 'customBank', name: this.$t('bank.customBank') } /*自定义银行*/,
        { key: 'commonBank', name: this.$t('bank.commonBank') } /*通用银行*/,
      ],
      searchForm: [
        {
          type: 'input',
          id: 'bankBranchName',
          label: this.$t('supplier.bank.bankName'),
        } /*银行名称*/,
      ],
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      data: [],
      // 自定义银行表格
      customBankColumns: [
        {
          /*国家*/
          title: this.$t('bank.country'),
          key: 'countryName',
          dataIndex: 'countryName',
          width: '10%',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          /*银行代码*/
          width: '15%',
          title: this.$t('bank.bankCode'),
          key: 'bankCode',
          dataIndex: 'bankCode',
        },
        {
          /*银行名称*/
          title: this.$t('bank.bankName'),
          key: 'bankName',
          dataIndex: 'bankName',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          /*支行名称*/
          title: this.$t('bank.bankBranchName'),
          key: 'bankBranchName',
          dataIndex: 'bankBranchName',
        },
        {
          /*开户地*/
          title: this.$t('bank.openAccount'),
          key: 'openAccount',
          dataIndex: 'openAccount',
        },
        {
          /*详细地址*/
          title: this.$t('bank.detailAddress'),
          key: 'detailAddress',
          dataIndex: 'detailAddress',
        },
      ],
      // 通用银行表格
      commonBankColumns: [
        {
          /*国家*/
          title: this.$t('bank.country'),
          key: 'countryName',
          dataIndex: 'countryName',
          width: '10%',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          /*银行代码*/
          width: '15%',
          title: this.$t('bank.bankCode'),
          key: 'bankCode',
          dataIndex: 'bankCode',
        },
        {
          /*银行名称*/
          title: this.$t('bank.bankName'),
          key: 'bankName',
          dataIndex: 'bankName',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          /*支行名称*/
          title: this.$t('bank.bankBranchName'),
          key: 'bankBranchName',
          dataIndex: 'bankBranchName',
          render: desc => (
            <span>
              {desc ? (
                <Popover placement="topLeft" content={desc}>
                  {desc}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          /*开户地*/
          title: this.$t('bank.openAccount'),
          key: 'openAccount',
          dataIndex: 'openAccount',
        },
        {
          /*详细地址*/
          title: this.$t('bank.detailAddress'),
          key: 'detailAddress',
          dataIndex: 'detailAddress',
        },
      ],
      columns: [],
    };
  }

  handleRowClick = record => {
    this.props.onChoose(record);
    this.props.onCancel();
  };

  componentWillMount() {
    let { customBankColumns } = this.state;
    this.setState({
      columns: customBankColumns,
    });
    this.getList();
  }

  renderTabs() {
    return this.state.tabs.map(tab => {
      return <TabPane tab={tab.name} key={tab.key} />;
    });
  }

  //获取公司下的银行数据
  getList() {
    this.setState({ loading: true });
    let params = this.state.searchParams;
    let ps = {
      page: this.state.pagination.page,
      size: this.state.pagination.pageSize,
    };
    if (this.state.label === 'customBank') {
      BSService.getSelfBankList(params, ps).then(response => {
        let pagination = this.state.pagination;
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          loading: false,
          data: response.data,
          pagination,
        });
      });
    } else {
      BSService.getSystemBankList(params, ps).then(response => {
        let pagination = this.state.pagination;
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          loading: false,
          data: response.data,
          pagination,
        });
      });
    }
  }

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: {
          current: pagination.current,
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
        },
      },
      () => {
        this.getList();
      }
    );
  };

  handleSearch = params => {
    this.setState(
      {
        searchParams: params,
        loading: true,
        page: 1,
      },
      () => {
        this.getList();
      }
    );
  };

  //Tabs点击
  onChangeTabs = key => {
    let { columns, commonBankColumns, pagination, customBankColumns } = this.state;
    if (key === 'customBank') {
      columns = customBankColumns;
    } else {
      columns = commonBankColumns;
    }
    pagination.page = 0;
    pagination.pageSize = 10;
    pagination.current = 1;
    this.setState(
      {
        loading: true,
        pagination,
        data: [],
        label: key,
        columns: columns,
      },
      () => {
        this.getList();
      }
    );
  };

  clear = () => {
    this.setState(
      {
        searchParams: {
          bankBranchName: '',
        },
      },
      this.getList()
    );
  };

  render() {
    const { visible, onCancel } = this.props;
    const { data, columns, pagination, loading, searchForm } = this.state;

    return (
      <Modal visible={visible} width={800} className="list-selector" onCancel={onCancel}>
        <Tabs onChange={this.onChangeTabs}>{this.renderTabs()}</Tabs>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.handleSearch}
          clearHandle={this.clear}
        />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: `${pagination.total}` })}
          </div>
        </div>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onChange={this.onChangePager}
          bordered
          size="middle"
          rowKey="key"
          onRow={record => ({
            onClick: () => this.handleRowClick(record),
          })}
        />
      </Modal>
    );
  }
}
BankPicker.propTypes = {
  visible: PropTypes.bool, //对话框是否可见
  onOk: PropTypes.func, //点击OK后的回调，当有选择的值时会返回一个数组
  onCancel: PropTypes.func, //点击取消后的回调
  onChoose: PropTypes.func, //点击选择银行
};
function mapStateToProps(state) {
  return {
    organization: state.user.organization,
    company: state.user.company,
    language: state.main.language,
    tenantMode: state.main.tenantMode,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(BankPicker);
