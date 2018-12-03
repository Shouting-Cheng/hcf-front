/**
 * Created by zaranengap on 2017/7/4.
 * 显示系统值列表与自定义值列表
 */
//0516重构与添加多语言
import React from 'react';
import { connect } from 'dva';
import { Tabs, Table, Button, Badge, message } from 'antd';
const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute';
import valueListService from 'containers/setting/value-list/value-list.service';
import ListSelector from 'widget/list-selector';
import 'styles/setting/value-list/value-list.scss';
import { messages } from "utils/utils";
import { routerRedux } from 'dva/router';


class ValueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dBtnDisabled: false,
      loading: false,
      status: 'SYSTEM',
      data: [],
      columns: [
        {
          title: messages('common.sequence'/*序号*/),
          dataIndex: 'index',
          width: '8%'
        },
        {
          title: messages('value.list.information'/*值列表名称*/),
          dataIndex: 'name'
        },
        {
          title: messages('common.column.status'/*状态*/),
          dataIndex: 'enabled', width: '15%',
          render: enabled =>
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? messages('common.status.enable') : messages('common.status.disable')} />
        }
      ],
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },
      selectedRowKeys: [],
      selectedRowIds: [],
      customEnumerationOIDs: [],
      showListSelector: false,
      // valueListPage: menuRoute.getRouteItem('new-value-list', 'key'),   //新建值列表的页面项
      // valueListDetail: menuRoute.getRouteItem('value-list-detail', 'key')   //值列表详情的页面项
    };
  }

  componentDidMount() {
    //记住页面
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState({

      pagination,
      status: this.props.match.params.tab || 'SYSTEM'
    }, () => {
      this.clearBeforePage();
      this.getList();
    })
  }

  //得到值列表数据
  getList() {
    const { status, pagination } = this.state;
    this.setState({ loading: true });
    valueListService.getValueListList(pagination.page, pagination.pageSize, status)
      .then(res => {
        res.data.map((item, index) => {
          item.index = pagination.page * pagination.pageSize + index + 1;
          item.key = item.index;
        });
        pagination.total = Number(res.headers['x-total-count']) || 0;
        this.setState({
          data: res.data,
          loading: false,
          pagination
        })
      });
  }

  //分页点击
  onChangePager = (p, filters, sorter) => {
    let pagination = this.state.pagination;
    pagination.page = p.current - 1;
    pagination.current = p.current;
    this.setState({
      pagination
    }, () => {
      this.getList();
    })
  };

  //Tabs点击
  onChangeTabs = (key) => {
    const { pagination } = this.state;
    pagination.page = 0;
    pagination.current = 1;
    this.setState({
      pagination,
      status: key
    }, () => {
      this.getList()
    });
  };

  //选中项发生变化的时的回调
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  };

  //选择/取消选择某行的回调
  handleSelectRow = (record, selected) => {
    let selectedRowIds = this.state.selectedRowIds;
    let customEnumerationOIDs = this.state.customEnumerationOIDs;
    if (selected) {
      selectedRowIds.push(record.id);
      customEnumerationOIDs.push(record.customEnumerationOID)
    } else {
      selectedRowIds.delete(record.id);
      customEnumerationOIDs.delete(record.customEnumerationOID)
    }
    this.setState({ selectedRowIds, customEnumerationOIDs })
  };

  //选择/取消选择所有行的回调
  handleSelectAllRow = (selected, selectedRows, changeRows) => {
    let selectedRowIds = this.state.selectedRowIds;
    let customEnumerationOIDs = this.state.customEnumerationOIDs;
    if (selected) {
      changeRows.map(item => {
        selectedRowIds.push(item.id);
        customEnumerationOIDs.push(item.customEnumerationOID)
      })
    } else {
      changeRows.map(item => {
        selectedRowIds.delete(item.id);
        customEnumerationOIDs.delete(item.customEnumerationOID)
      })
    }
    this.setState({ selectedRowIds, customEnumerationOIDs })
  };

  handleListShow = (flag) => {
    this.setState({ showListSelector: flag })
  };

  handleListOk = (values) => {
    if (!this.state.dBtnDisabled) {
      this.state.dBtnDisabled = true;
      let companies = [];
      values.result.map((item) => {
        companies.push(item.companyOID)
      })
      valueListService.distributeCompany(companies, this.state.customEnumerationOIDs)
        .then(res => {
          this.state.dBtnDisabled = false;
          if (res.status === 200) {
            message.success(messages('common.operate.success'/*操作成功*/));
            this.handleListShow(false);
            this.getList();
            this.setState({
              selectedRowKeys: [],
              selectedRowIds: [],
              customEnumerationOIDs: []
            })
          }
        }).catch(err => {
          this.state.dBtnDisabled = false;
        })
    }

  };

  handleRowClick = (record) => {
    this.setBeforePage(this.state.pagination);
    // let path = "/admin-setting/value-list-detail/:customEnumerationOID/:id".replace(':customEnumerationOID', record.customEnumerationOID);
    // path = path.replace(':id', record.id);
    // this.context.router.push(path);

    this.props.dispatch(routerRedux.push({
      pathname: `/admin-setting/value-list-detail/${record.customEnumerationOID}/${record.id}/:tab`.replace(':tab',this.state.status)
    }))

  };

  goValueListPage = () => {
    const { valueListPage } = this.state;
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/new-value-list/:tab".replace(':tab',this.state.status)
    }))
  };

  render() {
    const {
      columns, data, loading, pagination, status,
      selectedRowKeys, selectedRowIds, showListSelector
    } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow
    };
    return (
      <div style={{ paddingBottom: 20 }} className="value-list">
        <Tabs type="card" activeKey={status} onChange={this.onChangeTabs}>
          {/*系统值列表*/}
          <TabPane tab={messages('value.list.system.level')} key='SYSTEM' />
          {/*自定义值列表*/}
          <TabPane tab={messages('value.list.custom.level')} key='CUSTOM' />
        </Tabs>

        <div className="table-header">
          {status === 'SYSTEM' ? <div className="table-header-title">
            {/*汉得融晶系统正常工作所必要的值列表*/}
            {messages('value.list.system.notice')}
          </div> : null}
          {status === 'CUSTOM' ?
            <div className="table-header-buttons">
              <Button type="primary" onClick={this.goValueListPage}>
                {/*新增值列表*/}
                {messages('value.list.new')}
              </Button>
              {this.props.tenantMode && <Button type="primary"
                disabled={!selectedRowKeys.length}
                onClick={() => this.handleListShow(true)}>
                {/*分配公司*/}
                {messages('value.list.distribute.company')}
              </Button>}
            </div> : null}
        </div>

        <Table columns={columns}
          dataSource={data}
          pagination={pagination}
          onChange={this.onChangePager}
          loading={loading}
          onRow={record => ({
            onClick: () => this.handleRowClick(record)
          })}
          scroll={{ x: true, y: false }}
          rowSelection={(status === 'CUSTOM' && this.props.tenantMode) ? rowSelection : null}
          bordered
          size="middle" />

        <ListSelector visible={showListSelector}
          onCancel={() => this.handleListShow(false)}
          type="batch_deploy_company"
          extraParams={{sources: selectedRowIds} }
          onOk={this.handleListOk} />
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    tenantMode: true
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ValueList);
