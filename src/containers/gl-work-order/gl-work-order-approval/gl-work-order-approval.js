import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import config from 'config';
import {  Button, message, Badge, Popover, Tabs, Input, Row, Col } from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
const Search = Input.Search;
import SearchArea from 'widget/search-area';
import moment from 'moment';
import glWorkOrderCheckService from 'containers/gl-work-order/gl-work-order-approval/gl-work-order-approval.service';

class GLWorkOrderCheck extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      /**
       * 查询条件-未审批
       */
      searchForm1: [
        {
          type: 'select',
          label: '单据类型',
          id: 'typeId',
          colSpan: '6',
          getUrl: `${
            config.accountingUrl//userId=${this.props.user.id}&
          }/api/general/ledger/work/order/types/query/by/setOfBooksId?setOfBooksId=${props.company.setOfBooksId}`,
          options: [],
          method: 'get',
          valueKey: 'id',
          labelKey: 'workOrderTypeName',
          event:"typeId1"
        },
        {
          type: 'list',
          listType: 'bgtUserOid',
          options: [],
          id: 'userOid',
          label: this.$t({ id: 'pay.refund.employeeName' }),
          labelKey: 'fullName',
          valueKey: 'userOid',
          colSpan: 6,
          single: true,
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          event:"userOid1"
        },
        {
          type: 'items',
          id: 'date',
          colSpan: '6',
          items: [
            { type: 'date', id: 'beginDate', label: '提交日期从',event:"beginDate1" },
            { type: 'date', id: 'endDate', label: '提交日期至',event:"endDate1" },
          ],
        },
        {
          type: 'items',
          id: 'amount',
          colSpan: '6',
          items: [
            { type: 'input', id: 'amountFrom', label: '金额从',event:"amountFrom1"  },
            { type: 'input', id: 'amountTo', label: '金额至',event:"amountTo1"  },
          ],
        },
        {
          type: 'select',
          label: '币种',
          id: 'currency',
          colSpan: '6',
          options: [],
          method: 'get',
          getUrl: `${config.baseUrl}/api/currency/rate/list`,
          listKey: 'rows',
          getParams: {
            enable: true,
            setOfBooksId: this.props.company.setOfBooksId,
            tenantId: this.props.company.tenantId,
          },
          valueKey: 'currencyCode',
          labelKey: 'currencyCode',
          event:"currency1"
  },
        {
          type: 'input',
          label: '备注',
          id: 'description',
          colSpan: '6',
          event:"description1"
        },
      ],
      searchParams1: {},
      /**
       * 查询条件-已审批
       */
      searchForm2: [
        {
          type: 'select',
          label: '单据类型',
          id: 'typeId',
          colSpan: '6',
          getUrl: `${
            config.accountingUrl
          }/api/general/ledger/work/order/types/query/by/setOfBooksId?setOfBooksId=${props.company.setOfBooksId}`,//userId=${this.props.user.id}
          options: [],
          method: 'get',
          valueKey: 'id',
          labelKey: 'workOrderTypeName',
          event:"typeId2"
        },
        {
          type: 'list',
          listType: 'bgtUserOid',
          options: [],
          id: 'userOid',
          label: this.$t({ id: 'pay.refund.employeeName' }),
          labelKey: 'fullName',
          valueKey: 'userOid',
          colSpan: 6,
          single: true,
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          event:"userOid2"
        },
        {
          type: 'items',
          id: 'date',
          colSpan: '6',
          items: [
            { type: 'date', id: 'beginDate', label: '提交日期从',event:"beginDate2" },
            { type: 'date', id: 'endDate', label: '提交日期至',event:"endDate2"},
          ],
        },
        {
          type: 'items',
          id: 'amount',
          colSpan: '6',
          items: [
            { type: 'input', id: 'amountFrom', label: '金额从',event:"amountFrom2" },
            { type: 'input', id: 'amountTo', label: '金额至' ,event:"amountTo2"},
          ],
        },
        {
          type: 'select',
          label: '币种',
          id: 'currency',
          colSpan: '6',
          options: [],
          method: 'get',
          getUrl: `${config.baseUrl}/api/currency/rate/list`,
          listKey: 'rows',
          getParams: {
            enable: true,
            setOfBooksId: this.props.company.setOfBooksId,
            tenantId: this.props.company.tenantId,
          },
          valueKey: 'currencyCode',
          labelKey: 'currencyCode',
          event:"currency2"
        },
        {
          type: 'input',
          label: '备注',
          id: 'description',
          colSpan: '6',
          event:"description2"
        },
      ],
      searchParams2: {},
      /**
       * 表格-未审批
       */
      columns1: [
        {
          title: '单据编号',
          dataIndex: 'businessCode',
          align: 'center',
          width: 180,
        },
        {
          title: '单据类型',
          dataIndex: 'typeName',
          align: 'center',
        },
        {
          title: '申请人',
          dataIndex: 'applicantName',
          align: 'center',
          width: 100,
        },
        {
          title: '提交日期',
          dataIndex: 'submittedDate',
          align: 'center',
          width: 120,
          render: (submittedDate, record, index) => {
            return <span>{submittedDate?moment(submittedDate).format('YYYY-MM-DD'):null}</span>;
          },
        },
        {
          title: '币种',
          dataIndex: 'currencyCode',
          align: 'center',
          width: 90,
        },
        {
          title: '金额',
          dataIndex: 'totalAmount',
          align: 'center',
          render: (totalAmount, record, index) => {
            return <span>{this.filterMoney(totalAmount, 2)}</span>;
          },
        },
        {
          title: '备注',
          dataIndex: 'description',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'status',
          align: 'center',
          width: 100,
          render: (status, record, index) => {
            return (
              <Badge
                status={this.$statusList[status].state}
                text={this.$statusList[status].label}
              />
            );
          },
        },
      ],
      data1: [],
      loading1: true,
      pagination1: {
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      page1: 0,
      pageSize1: 10,
      /**
       * 表格-已审批
       */
      columns2: [
        {
          title: '单据编号',
          dataIndex: 'businessCode',
          align: 'center',
          width: 180,
        },
        {
          title: '单据类型',
          dataIndex: 'typeName',
          align: 'center',
        },
        {
          title: '申请人',
          dataIndex: 'applicantName',
          align: 'center',
          width: 100,
        },
        {
          title: '提交日期',
          dataIndex: 'submittedDate',
          align: 'center',
          width: 120,
          render: (submittedDate, record, index) => {
            return <span>{submittedDate?moment(submittedDate).format('YYYY-MM-DD'):null}</span>;
          },
        },
        {
          title: '币种',
          dataIndex: 'currencyCode',
          align: 'center',
          width: 90,
        },
        {
          title: '金额',
          dataIndex: 'totalAmount',
          align: 'center',
          render: (totalAmount, record, index) => {
            return <span>{this.filterMoney(totalAmount, 2)}</span>;
          },
        },
        {
          title: '备注',
          dataIndex: 'description',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'status',
          align: 'center',
          width: 100,
          render: (status, record, index) => {
            return (
              <Badge
                status={this.$statusList[status].state}
                text={this.$statusList[status].label}
              />
            );
          },
        },
      ],
      data2: [],
      loading2: true,
      pagination2: {
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      page2: 0,
      pageSize2: 10,
      /**
       * tabs面板控制
       */
      tabs: [
        { key: 'backlashRechecking', name: '未审批' }, //待复核
        { key: 'backlashRechecked', name: '已审批' }, //已经复核
      ],
      nowStatus: 'backlashRechecking',
    };
  }
  /**
   * 生命周期函数
   */
  componentWillMount = () => {
    this.getList1();
    // this.getList2();
  };
  /**-----------------------------------------------------------------------------未审批 */
  /**
   * 获取已审批或者未审批数据
   * finished 为true--已审批
   * finished 为false--未审批
   */
  getList1 = () => {
    let { page1, pageSize1, searchParams1 } = this.state;
    let params = {
      page: page1,
      size: pageSize1,
      finished: false,
      typeId: searchParams1.typeId ? searchParams1.typeId : '',
      userOid: searchParams1.userOid ? searchParams1.userOid : '',
      beginDate: searchParams1.beginDate
        ? moment(searchParams1.beginDate).format('YYYY-MM-DD')
        : '',
      endDate: searchParams1.endDate ? moment(searchParams1.endDate).format('YYYY-MM-DD') : '',
      amountFrom: searchParams1.amountFrom ? searchParams1.amountFrom : '',
      amountTo: searchParams1.amountTo ? searchParams1.amountTo : '',
      currency: searchParams1.currency ? searchParams1.currency : '',
      description: searchParams1.description ? searchParams1.description : '',
      businessCode: searchParams1.businessCode ? searchParams1.businessCode : '',
    };
    glWorkOrderCheckService
      .getList(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading1: false,
            data1:
              res.data.map(item => {
                return {
                  ...item.accountingApprovalView,
                  entityOid: item.entityOid,
                };
              }) || [],
            pagination1: {
              total: Number(res.headers['x-total-count'])
                ? Number(res.headers['x-total-count'])
                : 0,
              current: page1 + 1,
              onChange: this.onChangeCheckedPage1,
              onShowSizeChange: this.onShowSizeChange1,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                this.$t(
                  { id: 'common.show.total' },
                  { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
                ),
            },
          });
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(`获取审批数据失败:${e.response.data.message}`);
        }
        this.setState({ loading1: false });
      });
  };
  /**
   * 切换分页
   */
  onChangeCheckedPage1 = page => {
    if (page - 1 !== this.state.page1) {
      this.setState(
        {
          loading1: true,
          page1: page - 1,
        },
        () => {
          this.getList1();
        }
      );
    }
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange1 = (current, pageSize) => {
    this.setState(
      {
        loading1: true,
        page1: current - 1,
        pageSize1: pageSize,
      },
      () => {
        this.getList1();
      }
    );
  };
  /**
   * 搜索
   */
  search1 = params => {
    this.setState(
      {
        loading1: true,
        page1: 0,
        searchParams1: {...this.state.searchParams1,...params},
      },
      () => {
        this.getList1();
      }
    );
  };
  /**
   * 清空
   */
  clear1 = () => {
    this.setState(
      {
        loading1: true,
        searchParams1: {},
        page1: 0,
      },
      () => {
        this.getList1();

      }
    );
  };
  /**
   * 根据单据编号查询
   */
  onDocumentSearch1 = value => {
    this.setState(
      {
        loading1: true,
        page1: 0,
        searchParams1: { ...this.state.searchParams1,businessCode: value },
      },
      () => {
        this.getList1();
      }
    );
  };
  /**-----------------------------------------------------------------------------已审批 */
  /**
   * 获取已审批或者未审批数据
   * finished 为true--已审批
   * finished 为false--未审批
   */
  getList2 = () => {
    let { page2, pageSize2, searchParams2 } = this.state;
    let params = {
      page: page2,
      size: pageSize2,
      finished: true,
      typeId: searchParams2.typeId ? searchParams2.typeId : '',
      userOid: searchParams2.userOid ? searchParams2.userOid : '',
      beginDate: searchParams2.beginDate
        ? moment(searchParams2.beginDate).format('YYYY-MM-DD')
        : '',
      endDate: searchParams2.endDate ? moment(searchParams2.endDate).format('YYYY-MM-DD') : '',
      amountFrom: searchParams2.amountFrom ? searchParams2.amountFrom : '',
      amountTo: searchParams2.amountTo ? searchParams2.amountTo : '',
      currency: searchParams2.currency ? searchParams2.currency : '',
      description: searchParams2.description ? searchParams2.description : '',
      businessCode: searchParams2.businessCode ? searchParams2.businessCode : '',
    };
    glWorkOrderCheckService
      .getList(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading2: false,
            data2:
              res.data.map(item => {
                return {
                  ...item.accountingApprovalView,
                  entityOid: item.entityOid,
                };
              }) || [],
            pagination2: {
              total: Number(res.headers['x-total-count'])
                ? Number(res.headers['x-total-count'])
                : 0,
              current: page2 + 1,
              onChange: this.onChangeCheckedPage2,
              onShowSizeChange: this.onShowSizeChange2,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                this.$t(
                  { id: 'common.show.total' },
                  { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
                ),
            },
          });
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(`获取审批数据失败:${e.response.data.message}`);
        }
        this.setState({ loading2: false });
      });
  };
  /**
   * 切换分页
   */
  onChangeCheckedPage2 = page => {
    if (page - 1 !== this.state.page2) {
      this.setState(
        {
          loading2: true,
          page2: page - 1,
        },
        () => {
          this.getList2();
        }
      );
    }
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange2 = (current, pageSize) => {
    this.setState(
      {
        loading2: true,
        page2: current - 1,
        pageSize2: pageSize,
      },
      () => {
        this.getList2();
      }
    );
  };
  /**
   * 搜索
   */
  search2 = (params) => {
    this.setState(
      {
        loading2: true,
        page2: 0,
        searchParams2: {...this.state.searchParams2,...params},
      },
      () => {
        this.getList2();
      }
    );
  };
  /**
   * 清空
   */
  clear2 = () => {
    this.setState(
      {
        loading2: true,
        searchParams2: {},
        page2: 0,
      },
      () => {
        this.getList2();
      }
    );
  };
  /**
   * 根据单据编号查询
   */
  onDocumentSearch2 = value => {
    this.setState(
      {
        loading2: true,
        page2: 0,
        searchParams2: {  ...this.state.searchParams2,businessCode: value },
      },
      () => {
        this.getList2();
      }
    );
  };
  /**
   * 表格的行点击事件
   */
  onTableRowClick = record => {
    // this.context.router.push(menuRoute.getRouteItem('gl-work-order-check-detail', 'key').url.replace(':id', record.id).replace(':oid', record.entityOid).replace(':status', record.status));
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/approval-management/gl-work-order-approval/gl-work-order-approval-detail/${record.id}/${record.entityOid}/${record.status}`,
      })
    );
  };
  eventHandle1 = (type, value) => {
    let {searchParams1} = this.state;
    switch (type) {
      case 'typeId1': {
        searchParams1.typeId = value;
        break;
      }
      case 'userOid1': {
        if(value && value[0]){
          searchParams1.userOid = value[0].userOid;
        }else{
          searchParams1.userOid = '';
        }
        break;
      }
      case 'beginDate1': {
        if (value) {
          searchParams1.beginDate = moment(value).format('YYYY-MM-DD');
        } else {
          searchParams1.beginDate = '';
        }
        break;
      }
      case 'endDate1': {
        if (value) {
          searchParams1.endDate = moment(value).format('YYYY-MM-DD');
        } else {
          searchParams1.endDate = '';
        }
        break;
      }
      case 'currency1': {
        searchParams1.currency = value;
        break;
      }
      case 'amountFrom1': {
        searchParams1.amountFrom = value;
        break;
      }
      case 'amountTo1': {
        searchParams1.amountTo = value;
        break;
      }
      case 'description1': {
        searchParams1.description = value;
        break;
      }
        this.setState({searchParams1});
    }
  }
  eventHandle2 = (type, value) => {
    let {searchParams2} = this.state;
    switch (type) {
      case 'typeId2': {
        searchParams2.typeId = value;
        break;
      }
      case 'userOid2': {
        if(value && value[0]){
          searchParams2.userOid = value[0].userOid;
        }else{
          searchParams2.userOid = '';
        }
        break;
      }
      case 'beginDate2': {
        if (value) {
          searchParams2.beginDate = moment(value).format('YYYY-MM-DD');
        } else {
          searchParams2.beginDate = '';
        }
        break;
      }
      case 'endDate2': {
        if (value) {
          searchParams2.endDate = moment(value).format('YYYY-MM-DD');
        } else {
          searchParams2.endDate = '';
        }
        break;
      }
      case 'currency2': {
        searchParams2.currency = value;
        break;
      }
      case 'amountFrom2': {
        searchParams2.amountFrom = value;
        break;
      }
      case 'amountTo2': {
        searchParams2.amountTo = value;
        break;
      }
      case 'description2': {
        searchParams2.description = value;
        break;
      }
      this.setState({searchParams1});
    }
  }
  /**
   * 面板切换事件
   */
  onChangeTabs = key => {
    if (key === 'backlashRechecking') {
      this.clear1();
    } else {
      this.clear2();
    }
    this.setState({ nowStatus: key }, () => {
      // this.context.router.replace(`${menuRoute.getRouteItem('gl-work-order-check', 'key').url}?tab=${this.state.nowStatus}`);
    });
  };

  change1 = (e) =>{
    let {searchParams1} = this.state;
    if(e && e.target && e.target.value){
      searchParams1.businessCode = e.target.value;
    }else{
      searchParams1.businessCode = '';
    }
    this.setState({searchParams1});
  }
  change2 = (e) =>{
    let {searchParams2} = this.state;
    if(e && e.target && e.target.value){
      searchParams2.businessCode = e.target.value;
    }else{
      searchParams2.businessCode = '';
    }
    this.setState({searchParams2});
  }
  renderContent = () => {
    //搜索
    const { searchForm1, searchForm2 } = this.state;
    //已审批-table
    const { columns1, data1, pagination1, loading1 } = this.state;
    //未审批-table
    const { columns2, data2, pagination2, loading2 } = this.state;
    let content = null;
    switch (this.state.nowStatus) {
      case 'backlashRechecking':
        content = (
          <div>
            <SearchArea
              key="1"
              searchForm={searchForm1}
              maxLength={4}
              submitHandle={this.search1}
              eventHandle={this.eventHandle1}
              clearHandle={this.clear1}
              wrappedComponentRef={inst => (this.formRef1 = inst)}
            />
            <div className="divider" />
            <div className="table-header">
              <div className="table-header-buttons">
                <Row>
                  <Col span={18} />
                  <Col span={6}>
                    <Search
                      placeholder="请输入核算工单单号"
                      onSearch={this.onDocumentSearch1}
                      onChange={this.change1}
                      enterButton
                    />
                  </Col>
                </Row>
              </div>
            </div>
            <Table
              columns={columns1}
              dataSource={data1}
              pagination={pagination1}
              loading={loading1}
              bordered
              size="middle"
              rowKey={record => record['id']}
              onRow={record => ({ onClick: () => this.onTableRowClick(record) })}
            />
          </div>
        );
        break;
      case 'backlashRechecked':
        content = (
          <div>
            <SearchArea
              key="2"
              searchForm={searchForm2}
              eventHandle={this.eventHandle2}
              maxLength={4}
              submitHandle={this.search2}
              clearHandle={this.clear2}
              wrappedComponentRef={inst => (this.formRef2 = inst)}
            />
            <div className="divider" />
            <div className="table-header">
              <div className="table-header-buttons">
                <Row>
                  <Col span={18} />
                  <Col span={6}>
                    <Search
                      placeholder="请输入核算工单单号"
                      onSearch={this.onDocumentSearch2}
                      onChange={this.change2}
                      enterButton
                    />
                  </Col>
                </Row>
              </div>
            </div>
            <Table
              columns={columns2}
              dataSource={data2}
              pagination={pagination2}
              loading={loading2}
              bordered
              size="middle"
              rowKey={record => record['id']}
              onRow={record => ({ onClick: () => this.onTableRowClick(record) })}
            />
          </div>
        );
        break;
    }
    return content;
  };
  /**
   * 渲染函数
   */
  render() {
    //面板
    const { tabs, nowStatus } = this.state;
    return (
      <div>
        <Tabs onChange={this.onChangeTabs} defaultActiveKey={nowStatus}>
          {tabs.map(tab => {
            return <TabPane tab={tab.name} key={tab.key} />;
          })}
        </Tabs>
        {this.renderContent()}
      </div>
    );
  }
}
// GLWorkOrderCheck.contextTypes = {
//     router: React.PropTypes.object
// };
function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(GLWorkOrderCheck);
