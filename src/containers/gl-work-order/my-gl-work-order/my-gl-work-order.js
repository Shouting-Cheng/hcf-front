import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import {
  Table,
  Button,
  message,
  Badge,
  Divider,
  Dropdown,
  Menu,
  Row,
  Col,
  Icon,
  Input,
  Popover,
} from 'antd';
const Search = Input.Search;
import SearchArea from 'widget/search-area';
import myGlWorkOrderService from 'containers/gl-work-order/my-gl-work-order/my-gl-work-order.service';
import moment from 'moment';
import { routerRedux } from 'dva/router';
class MyGLWorkOrder extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      //核算工单类型集合
      glWorkOrderTypeList: [],
      //查询条件
      searchForm: [
        {
          type: 'select',
          label: '单据类型',
          id: 'workOrderTypeId',
          colSpan: '6',
          getUrl: `${
            config.accountingUrl
          }/api/general/ledger/work/order/types/query/by/setOfBooksId?setOfBooksId=${props.company.setOfBooksId}`,//userId=${this.props.user.id}
          options: [],
          method: 'get',
          valueKey: 'id',
          labelKey: 'workOrderTypeName',
          event: 'workOrderTypeId',
        },
        {
          type: 'items',
          id: 'requisitionDate',
          colSpan: '6',
          items: [
            { type: 'date', id: 'requisitionDateFrom',event: 'requisitionDateFrom', label: '申请日期从' },
            { type: 'date', id: 'requisitionDateTo', event: 'requisitionDateTo',label: '申请日期至' },
          ],
        },
        {
          type: 'list',
          label: '申请人',
          id: 'employeeId',
          colSpan: '6',
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
          listType: 'user_budget',
          event: 'APPLIER',
          valueKey: 'id',
          labelKey: 'fullName',
          single: true,
        },
        {
          type: 'select',
          label: '状态',
          id: 'status',
          colSpan: '6',
          options: [
            { value: 1001, label: '编辑中' },
            { value: 1002, label: '审批中' },
            { value: 1003, label: '撤回' },
            { value: 1004, label: '审批通过' },
            { value: 1005, label: '审批驳回' },
          ],
          valueKey: 'value',
          labelKey: 'label',
          event: 'status',
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
          event: 'currency',
        },
      ],
      //表格
      columns: [
        { title: '单据编号', dataIndex: 'workOrderNumber',width:180, align: 'center' },
        { title: '单据类型', dataIndex: 'typeName', align: 'center' },
        { title: '申请人', dataIndex: 'employeeName', align: 'center',width:110 },
        {
          title: '申请日期',
          dataIndex: 'requisitionDate',
          width:100,
          align: 'center',
          render: requisitionDate => {
            return <span>{moment(requisitionDate).format('YYYY-MM-DD')}</span>;
          },
        },
        { title: '币种', dataIndex: 'currency', align: 'center',width:90 },
        {
          title: '金额',
          dataIndex: 'amount',
          align: 'center',
          render: amount => {
            return <span>{this.filterMoney(amount, 2)}</span>;
          },
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
          render: remark => {
            return (
              <Popover content={remark}>
                <span>{remark}</span>
              </Popover>
            );
          },
        },
        {
          title: '状态',
          dataIndex: 'status',
          align: 'center',
          width:100,
          render: status => {
            return (
              <Badge
                status={this.$statusList[status].state}
                text={this.$statusList[status].label}
              />
            );
          },
        },
      ],
      loading: true,
      pagination: {
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      data: [],
      page: 0,
      pageSize: 10,
      searchParams: {},
    };
  }

  handleEvent = (key, value) => {
    let {searchParams} = this.state;
    switch (key) {
      case 'APPLIER': {
        if (value && value[0]) {
          searchParams.employeeId = value[0].id;
        } else {
          searchParams.employeeId = '';
        }
        break;
      }
      case 'requisitionDateFrom':{
        if(value){
          searchParams.requisitionDateFrom = moment(value).format('YYYY-MM-DD');
        }else{
          searchParams.requisitionDateFrom ='';
        }
        break;
      }
      case 'requisitionDateTo':{
        if(value){
          searchParams.requisitionDateTo = moment(value).format('YYYY-MM-DD');
        }else{
          searchParams.requisitionDateTo ='';
        }
        break;
      }
      default:
        if(value){
          searchParams[key] = value;
        }
    }
  };

  /**
   * 生命周期函数
   */
  componentWillMount = () => {
    this.getTypeList();
    this.getList();
  };
  /**
   * 获取核算工单类型集合
   */
  getTypeList = () => {
    let userId = this.props.user.id;
    myGlWorkOrderService
      .getTypeList(userId)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            glWorkOrderTypeList: res.data,
          });
        }
      })
      .catch(e => {
        if (e.response) {
          message.error(`获取核算工单类型失败：${e.response.data.message}`);
        }
      });
  };
  /**
   * 获取数据集合
   */
  getList = () => {
    let { page, pageSize, searchParams } = this.state;
    let params = {
      page: page,
      size: pageSize,
      workOrderNumber: searchParams.workOrderNumber ? searchParams.workOrderNumber : null,
      workOrderTypeId: searchParams.workOrderTypeId ? searchParams.workOrderTypeId : null,
      employeeId: searchParams.employeeId && searchParams.employeeId.toString()!=='' ? searchParams.employeeId: this.props.user.id,
      requisitionDateFrom: searchParams.requisitionDateFrom
        ? moment(searchParams.requisitionDateFrom).format('YYYY-MM-DD')
        : null,
      requisitionDateTo: searchParams.requisitionDateTo
        ? moment(searchParams.requisitionDateTo).format('YYYY-MM-DD')
        : null,
      status: searchParams.status ? searchParams.status : null,
      currency: searchParams.currency ? searchParams.currency : null,
    };
    myGlWorkOrderService
      .workOrderHeadQuery(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            data: res.data,
            pagination: {
              total: Number(res.headers['x-total-count'])
                ? Number(res.headers['x-total-count'])
                : 0,
              current: page + 1,
              onChange: this.onChangeCheckedPage,
              onShowSizeChange: this.onShowSizeChange,
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
          message.error(`加载核算工单数据失败，请重试：${e.response.data.message}`);
        }
        this.setState({ loading: false });
      });
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        loading: true,
        page: current - 1,
        pageSize,
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 切换分页
   */
  onChangeCheckedPage = page => {
    if (page - 1 !== this.state.page) {
      this.setState(
        {
          loading: true,
          page: page - 1,
        },
        () => {
          this.getList();
        }
      );
    }
  };
  /**
   * 新建按钮-选中某一个具体的单据类型
   */
  handleMenuClick = value => {
    let { glWorkOrderTypeList } = this.state;
    let nowType = glWorkOrderTypeList.find(item => item.id === value.key);
    // this.context.router.push(menuRoute.getRouteItem('new-gl-work-order', 'key').url.replace(':typeId', value.key).replace(':formOid', nowType.formOid ? nowType.formOid : 0));
    this.props.dispatch(
      routerRedux.push({
        pathname: `/gl-work-order/my-gl-work-order/new-gl-work-order/${value.key}/${
          nowType.formOid ? nowType.formOid : 0
        }/:id`,
      })
    );
  };
  /**
   * 根据核算工单单号搜索
   */
  onDocumentSearch = value => {
    this.setState(
      {
        loading: true,
        page: 0,
        searchParams: { ...this.state.searchParams,workOrderNumber: value },
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 搜索
   */
  search = params => {
    if(params.employeeId && params.employeeId[0]){
      params.employeeId = params.employeeId[0];
    }
    this.setState(
      {
        loading: true,
        page: 0,
        searchParams: { ...this.state.searchParams, ...params },
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 清空
   */
  clear = () => {
    this.setState(
      {
        loading: true,
        searchParams: {},
        page: 0,
      },
      () => {
        this.getList();
      }
    );
  };
  /**
   * 表格的行点击事件
   */
  onTableRowClick = record => {
    // this.context.router.push(menuRoute.getRouteItem('my-gl-work-order-detail', 'key').url.replace(':id', record.id).replace(':oid', record.documentOid));
    this.props.dispatch(
      routerRedux.push({
        pathname: `/gl-work-order/my-gl-work-order/my-gl-work-order-detail/${record.id}/${
          record.documentOid
        }`,
      })
    );
  };
  /**
   * 渲染函数
   */
  render() {
    //查询
    const { searchForm } = this.state;
    //新建按钮
    const { glWorkOrderTypeList } = this.state;
    //数据表格
    const { columns, loading, pagination, data } = this.state;
    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          maxLength={4}
          eventHandle={this.handleEvent}
          submitHandle={this.search}
          clearHandle={this.clear}
          wrappedComponentRef={inst => (this.formRef = inst)}
        />
        <div className="table-header">
          <div className="table-header-buttons">
            <Row>
              <Col id="my-gl-work-order-drop" style={{position : "relative"}} span={18}>
                <Dropdown getPopupContainer={ () => document.getElementById('my-gl-work-order-drop')}
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      {glWorkOrderTypeList.map(item => {
                        return <Menu.Item key={item.id}>{item.workOrderTypeName}</Menu.Item>;
                      })}
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Button type="primary">
                    新建核算工单 <Icon type="down" />
                  </Button>
                </Dropdown>
              </Col>
              <Col span={6}>
                <Search
                  placeholder="请输入核算工单单号"
                  onSearch={this.onDocumentSearch}
                  enterButton
                />
              </Col>
            </Row>
          </div>
        </div>
        <Table
          columns={columns}
          loading={loading}
          dataSource={data}
          pagination={pagination}
          size="middle"
          bordered
          rowKey={record => record['id']}
          onRowClick={record => this.onTableRowClick(record)}
        />
      </div>
    );
  }
}
// MyGLWorkOrder.contextTypes = {
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
)(MyGLWorkOrder);
