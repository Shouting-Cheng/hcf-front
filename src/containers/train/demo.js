import React from 'react';
import {connect} from 'react-redux';
//import {injectIntl} from 'react-intl';
import SearchArea from 'components/search-area';
import {messages} from "share/common";
import {trainReportService} from 'service';
import {Table, Badge, Button, Popover, message, Alert, Popconfirm} from 'antd';
import 'styles/train/train.scss';

import menuRoute from 'routes/menuRoute';

class Demo extends React.Component {

  constructor(props) {
    super(props);
    
    //const {formatMessage} = this.props.intl;
    this.state = {
      loading: false,
      buttonLoading: false,
      noticeAlert: null,
      batchDelete: true,
      reportMaintain: menuRoute.getRouteItem('tra-report-maintain', 'key'),
      selectedRow: [],
      selectedRowKeys: [],
      reportStatus: [],
      pagination: {
        total: 0,
        page: 0,
        pageSize: 10,
        current: 1,
        showSizeChanger: true,
        showQuickJumper: true
      },
      searchForm: [
        // 报销单ID
        {type: 'input', id: 'businessCode', label: messages('train.business.code')},
        // 报销单状态
        {
          type: 'value_list',
          label: messages('train.report.status'),
          id: 'reportStatus',
          options: [],
          valueListCode: 2028
        }
      ],
      searchParams: {// 查询条件
        businessCode: '',
        companyId: this.props.company.id,
        reportStatus: ''
      },
      tableData: [
        /*   { "id": 1,key:1, "applicationName": "dicky", businessCode: "BX001", "totalAmount": 200, "remark": "测试测试222222222", "reportStatusDesc": "提交", "report_date": "2018-01-04" },
        { "id": 2,key:2, "applicationName": "dicky", businessCode: "BX002", "totalAmount": 100, "remark": "测试测试111111111", "reportStatusDesc": "新建", "report_date": "2018-01-04" },
        { "id": 3,key:3, "applicationName": "dicky", businessCode: "BX003", "totalAmount": 400, "remark": "测试测试333333333", "reportStatusDesc": "审批通过", "report_date": "2018-01-04" }
      */
      ],
      columns: [
        /* { title: '序号', dataIndex: 'index', width: '5%' }, */
        {title: messages('train.report.id'), dataIndex: 'id', width: '20%', align: 'center'},
        {title: messages('train.business.code'), dataIndex: 'businessCode', width: '15%', align: 'center'},
        {
          title: messages('train.application.name'),
          dataIndex: 'applicationName',
          width: '10%',
          align: 'center'
        },
        {
          title: messages('train.total.amount'),
          dataIndex: 'totalAmount',
          width: '15%',
          className: 'rightClass'
        },
        {
          title: messages('train.remark'),
          dataIndex: 'remark',
          width: '25%',
          align: 'center',
          render: remark => (
            <Popover content={remark}>
              {remark}
            </Popover>)
        },
        {
          title: messages('common.column.status'),
          dataIndex: 'reportStatusDesc',
          width: '10%',
          align: 'center'
        },
        {
          title: messages('train.report.date'),
          dataIndex: 'reportDate',
          width: '13%',
          align: 'center',
          render: report_date => new Date(report_date).format('yyyy-MM-dd')
        },
        {
          title: messages('common.operation'),
          dataIndex: 'operation',
          width: '12%',
          dataIndex: 'index2',
          align: 'center',
          render: (text, record) => (
            <div>
              <span>
                <a onClick={e => this.editItem(e, record)}>{messages('common.edit')}</a>
                <span className="ant-divider"/>
                <Popconfirm onConfirm={e => this.deleteItem(e, record)}
                            title={messages('common.confirm.delete')}>{/* 你确定要删除organizationName吗 */}
                  <a href="#">{messages('common.delete')}</a>
                </Popconfirm>
              </span>
            </div>)
        }
      ]
    };
  }

  componentWillMount() {
    // debugger;
    this.getList();
  }
    // 批量删除
    batchDeleteItem = (e) => {
      this.setState({buttonLoading: true});
      //debugger; 
      //console.log(this.state.selectedRowKeys);
  
      trainReportService.batchDeleteReport(this.state.selectedRowKeys).then((res) => {
        if (res.status === 200) {
          message.success(messages('common.operate.success'));
          this.setState({
            selectedRowKeys: [],
            buttonLoading: false
          }, this.getList());
  
        }
      }).catch((e) => {
        message.error(`${messages('common.operate.filed')}${e.response.data.message}`);
      });
      this.setState({buttonLoading: false, batchDelete: true});
    }
  
    // 删除
    deleteItem = (e, record) => {
      trainReportService.deleteReport(record.id).then((res) => {
        if (res.status === 200) {
          message.success(messages('common.operate.success'));
          this.getList();
        }
      }).catch((e) => {
        message.error(`${messages('common.operate.filed')}${e.response.data.message}`);
      });
    }
    // 编辑
    editItem = (e, record) => {
      //console.log(record);
      const path = this.state.reportMaintain.url.replace(':id', record.id);
      this.context.router.push(path);
    }
  
    // 搜索
    search = (res) => {
      // console.log(result);
      //console.log(this.state.searchParams);
      this.setState({
        searchParams: {
          ...this.state.searchParams,
          businessCode: res.businessCode ? res.businessCode : '',
          reportStatus: res.reportStatus ? res.reportStatus : ''
        }
      }, () => {
        this.getList();
      });
    };
    // 重置
    clear = () => {
      this.setState({
        searchParams: {
          businessCode: '',
          reportStatus: ''
        }
      });
    };
  
    // 跳转新建或编辑界面
    handleCreateClick = (e, value) => {
      const path = this.state.reportMaintain.url.replace(':id', 'create');
      this.context.router.push(path);
    }
  
    // 得到列表数据
    getList() {
      /* let params = this.state.searchParams;
      let url = `${config.trainUrl}/api/demo/training/report/headers/query?&page=${this.state.pagination.page}&size=${this.state.pagination.pageSize}`;
      for (let paramsName in params) {
          url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
      } */
      // console.log(url);
      const {pagination, searchParams} = this.state;
      //debugger;
      //console.log(this.state.searchParams);
      this.setState({loading: true, noticeAlert: null, selectedRowKeys: []});
      return trainReportService.getReportHeadList(pagination.page, pagination.pageSize, searchParams).then((response) => {
        response.data.map((item) => {
          item.key = item.id;
        });
        this.setState({
          tableData: response.data,
          loading: false,
          pagination: {
            ...this.state.pagination,
            total: Number(response.headers['x-total-count']) ? Number(response.headers['x-total-count']) : 0,
            onChange: this.onChangePager,
            current: this.state.pagination.page + 1
          }
        });
      });
    }
  
    // 分页点击
    onChangePager = (pagination, filters, sorter) => {
      const temp = this.state.pagination;
      temp.page = pagination.current - 1;
      temp.current = pagination.current;
      temp.pageSize = pagination.pageSize;
      this.setState({
        pagination: temp
      }, () => {
        this.getList();
      });
    };
  
    // 提示框显示
    noticeAlert = (rows) => {
      let amount = 0;
      rows.forEach((item) => {
        amount += item.totalAmount;
      });
      const noticeAlert = (
        <span>
                  已选择<span style={{fontWeight: 'bold', color: '#108EE9'}}> {rows.length} </span> 项span> 项
          <span className="ant-divider"/>
                  金额总计：<span style={{fontWeight: 'bold', fontSize: '15px'}}> {this.filterMoney(amount)} </span>
        </span>
      );
      this.setState({
        noticeAlert: rows.length ? noticeAlert : null,
        batchDelete: !rows.length
      });
    };
  
    onSelectChange = (selectedRowKeys, selectedRow) => {
      // console.log(selectedRow);
      this.setState({selectedRowKeys, batchDelete: !(selectedRowKeys.length > 0)},
        () => {
          if (selectedRowKeys.length > 0) {
            this.noticeAlert(selectedRow);
          } else {
            this.setState({
              noticeAlert: null
            });
          }
        });
    }

  render() {
    const {pagination, searchForm, batchDelete, tableData, loading, buttonLoading, columns, noticeAlert, selectedRowKeys, selectedRow} = this.state;
    const rowSelection = {
      selectedRowKeys,
      selectedRow,
      onChange: this.onSelectChange,
    };
    return (
      <div className="train">
        <h3 className="header-title">Demo界面</h3>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}
        />

        <div className="table-header">
          <div
            className="table-header-title">{messages('common.total', {total: pagination.total ? pagination.total : '0'})}</div>
          {/* 共total条数据 */}
          <div className="table-header-buttons">
            <Button
              type="primary"
              onClick={this.handleCreateClick}>{messages('common.create')}</Button> {/* 新建 */}
            <Popconfirm onConfirm={e => this.batchDeleteItem(e)} title={messages('common.confirm.delete')}>
              <Button disabled={batchDelete} loading={buttonLoading} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}>{messages('common.delete')}</Button>
            </Popconfirm>
          </div>
          {noticeAlert ? <Alert message={noticeAlert} type="info" showIcon style={{marginBottom: '10px'}}/> : ''}
          <Table
            rowKey={record => record.key}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            rowSelection={rowSelection}
            onRow={record => ({onClick: () => this.handleRowClick(record)})}
            loading={loading}
            onChange={this.onChangePager}
            bordered
            size="middle"/>
        </div>
      </div>
          );
  }
}


Demo.contextTypes = {
  router: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    company: state.login.company
  }
}
export default connect(mapStateToProps)(Demo);