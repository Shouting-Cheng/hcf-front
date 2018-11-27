/**
 * Created by seripin on 2018/1/25.
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Button,
  Form,
  Badge,
  message,
  Popover,
  Table,
  Dropdown,
  Menu,
  Icon,
  Input,
  InputNumber,
  Row,
  Col,
} from 'antd';
import config from 'config';
import paymentRequisitionService from './paymentRequisitionService.service';
import moment from 'moment';
import SearchArea from 'widget/search-area';
import httpFetch from 'share/httpFetch';
const Search = Input.Search;

class PaymentRequisition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pamentRequisitionStatus: {
        1001: { label: this.$t( 'acp.new'  /*编辑中*/), state: 'default' },
        1002: { label: this.$t( 'acp.approving' /*审批中*/), state: 'processing' },
        1003: { label: this.$t( 'acp.returned'  /*已撤回*/), state: 'warning' },
        1004: { label: this.$t( 'acp.approved'  /*审批通过*/), state: 'success' },
        1005: { label: this.$t( 'acp.rejected'  /*审批驳回*/), state: 'error' },
      },
      searchForm: [
        // { type: 'input', id: 'requisitionNumber', label: formatMessage({id:"acp.requisitionNumber"}/*单据编号*/) },
        {
          type: 'select',
          id: 'acpReqTypeId',
          label: this.$t('acp.typeName' /*单据类型*/),
          options: [],
          getUrl: `${config.payUrl}/api/acp/request/type/query/${this.props.company.setOfBooksId}/${
            this.props.company.id
          }`,
          method: 'get',
          labelKey: 'description',
          valueKey: 'id',
          colSpan: '6',
        }, //付款申请单类型
        {
          type: 'items',
          id: 'dateRange',
          items: [
            { type: 'date', id: 'requisitionDateFrom', label: '申请日期从' },
            { type: 'date', id: 'requisitionDateTo', label: '申请日期至' },
          ],
          colSpan: 6,
        },
        {
          type: 'list',
          listType: 'select_authorization_user',
          options: [],
          id: 'employeeId',
          label: this.$t( 'acp.employeeName'  /*申请人*/),
          labelKey: 'userName',
          valueKey: 'userId',
          single: true,
          colSpan: '6',
          event: 'APPLIER',
        },
        {
          type: 'select',
          id: 'status',
          label: this.$t( 'acp.status' /*状态*/),
          colSpan: '6',
          options: [
            { value: '1001', label: this.$t( 'acp.new' /*编辑中*/) },
            { value: '1002', label: this.$t( 'acp.approving' /*审批中*/) },
            { value: '1003', label: this.$t( 'acp.returned' /*已撤回*/) },
            { value: '1004', label: this.$t( 'acp.approved' /*审批通过*/) },
            { value: '1005', label: this.$t( 'acp.rejected' /*审批驳回*/) },
          ],
        }, // 状态
        {
          type: 'items',
          id: 'amountRange',
          items: [
            {
              type: 'inputNumber',
              id: 'functionAmountFrom',
              label: this.$t( 'acp.amount.from'  /*总金额从*/),
            },
            {
              type: 'inputNumber',
              id: 'functionAmountTo',
              label: this.$t( 'acp.amount.to'/*总金额至*/),
            },
          ],
          colSpan: '6',
        },
        {
          type: 'input',
          id: 'description',
          label: '备注',
          colSpan: 6,
        },
      ],
      searchParams: {},
      columns: [
        {
          title: this.$t( 'acp.requisitionNumber'  /*单据编号*/),
          dataIndex: 'requisitionNumber',
          align: 'center',
          width: 150,
          render: value => {
            return (
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>
                {value}
              </Popover>
            );
          },
        },
        {
          title: this.$t('acp.typeName'  /*单据类型*/),
          dataIndex: 'acpReqTypeName',
          align: 'center',
          width: 120,
          render: value => {
            return (
              <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>
                {value}
              </Popover>
            );
          },
        },
        // {
        //     title: formatMessage({ id: "acp.companyName" }/*公司名称*/), dataIndex: 'companyName', align: 'center', width: 100,
        //     render: value => {
        //         return <Popover placement="topLeft" content={value} overlayStyle={{ maxWidth: 300 }}>{value}</Popover>
        //     }
        // },
        {
          title: this.$t( 'acp.employeeName'  /*申请人*/),
          dataIndex: 'employeeName',
          align: 'center',
          width: 90,
          render: record => (
            <span>
              <Popover content={record}>{record ? record : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('acp.requisitionDate'  /*申请日期*/),
          dataIndex: 'requisitionDate',
          align: 'center',
          width: 90,
          render: recode => (
            <span>
              <Popover content={moment(recode).format('YYYY-MM-DD')}>
                {recode ? moment(recode).format('YYYY-MM-DD') : '-'}
              </Popover>
            </span>
          ),
        },
        {
          title: this.$t( 'acp.table.amount'  /*总金额*/),
          dataIndex: 'functionAmount',
          align: 'center',
          width: 110,
          render: recode => (
            <span>
              <Popover content={this.filterMoney(recode, 2)}>{this.filterMoney(recode, 2)}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('acp.remark'  /*备注*/),
          dataIndex: 'description',
          align: 'center',
          width: 250,
          render: value => {
            return (
              <Popover content={value} overlayStyle={{ maxWidth: 800 }}>
                {value}
              </Popover>
            );
          },
        },
        {
          title: this.$t('acp.status'  /*状态*/),
          dataIndex: 'status',
          align: 'center',
          width: 110,
          render: value => (
            <Badge
              status={this.state.pamentRequisitionStatus[value].state}
              text={this.state.pamentRequisitionStatus[value].label}
            />
          ),
        },
      ],
      menu: [],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: { total: 0 },
      visible: false,
      // selectorItem: {
      //     title: formatMessage({ id: "acp.select.type" }/*选择付款申请单类型*/),
      //     url: `${config.payUrl}/api/acp/request/type/${this.props.company.setOfBooksId}/${this.props.company.id}/query`,
      //     searchForm: [
      //         { type: 'input', id: 'acpReqTypeCode', label: formatMessage({ id: "acp.type.code" }/*付款申请单类型代码*/) },
      //         { type: 'input', id: 'description', label: formatMessage({ id: "acp.type.name" }/*付款申请单类型名称*/) },
      //     ],
      //     columns: [
      //         { title: formatMessage({ id: "acp.type.code" }/*付款申请单类型代码*/), dataIndex: 'acpReqTypeCode' },
      //         { title: formatMessage({ id: "acp.type.name" }/*付款申请单类型名称*/), dataIndex: 'description' }
      //     ],
      //     key: 'id'
      // }//付款申请单类型选择LOV
      myPaymentRequisitionDetail:
        '/payment-requisition/my-payment-requisition/payment-requisition-detail/:id', // 付款申请单详情
      newPaymentRequisition:
        '/payment-requisition/my-payment-requisition/new-payment-requisition/:id/:typeId', //新建付款申请单
    };
  }

  handleEvent = (key, value) => {
    switch (key) {
      case 'APPLIER':
        value.length === 0 &&
          this.setState({ searchParams: { ...this.state.searchParams, employeeId: '' } });
    }
  };

  componentWillMount() {
    this.getList();
    this.getForms();
  }

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList();
      });
    }
  };

  getList = () => {
    const { searchParams, page, pageSize } = this.state;
    const params = {
      ...searchParams,
      requisitionNumber: searchParams.requisitionNumber ? searchParams.requisitionNumber : null,
    };
    this.setState({ loading: true });
    paymentRequisitionService
      .queryList(page, pageSize, params)
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
              pageSize: pageSize,
              onChange: this.onChangePaper,
              onShowSizeChange: this.onShowSizeChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                this.$t(
                  'common.show.total' ,
                  { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
                ),
            },
          });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        message.error(
          this.$t('common.error'  /*哦呼，服务器出了点问题，请联系管理员或稍后再试:(*/)
        );
      });
  };
  //改变每页显示的条数
  onShowSizeChange = (current, pageSize) => {
    this.setState({ page: current - 1, pageSize }, () => {
      this.getList();
    });
  };

  // 搜索
  search = values => {
    values.requisitionDateFrom = values.requisitionDateFrom
      ? moment(values.requisitionDateFrom).format('YYYY-MM-DD')
      : undefined;
    values.requisitionDateTo = values.requisitionDateTo
      ? moment(values.requisitionDateTo).format('YYYY-MM-DD')
      : undefined;
    this.setState({ searchParams: { ...this.state.searchParams, ...values }, page: 0 }, () => {
      this.getList();
    });
  };

  // 清除
  clearFunction = () => {
    this.setState({ searchParams: {} });
  };

  // // 打开弹出框
  // handOpenModal = () => {
  //     this.setState({
  //         visible: true
  //     });
  // };
  // // 关必弹出框
  // handleCancel = () => {
  //     this.setState({
  //         visible: false
  //     });
  // };
  // //新增LOV点击确定
  // handleListOk = (value) => {
  //     let path = this.state.newPaymentRequisition.url.replace(':id', 0);
  //     this.context.router.push({ pathname: path, state: { acpTypeName: value.result[0].description, acpReqTypeId: value.result[0].id } });
  // };
  //行点击事件
  rowClick = record => {
    let path = this.state.myPaymentRequisitionDetail.replace(':id', record.id);
    this.props.dispatch(
      routerRedux.push({
        pathname: path,
      })
    );
  };
  //获取付款申请单数据
  getForms = () => {
    const { menu } = this.state;
    httpFetch
      .get(
        `${config.payUrl}/api/acp/request/type/${this.props.company.setOfBooksId}/${
          this.props.company.id
        }/query`
      )
      .then(res => {
        res.data.map(o => {
          menu.push({ acpReqTypeId: o.id, acpTypeName: o.description });
        });
        this.setState({ menu });
      })
      .catch(err => {
        message.error('网路错误！请稍后重试');
      });
  };
  //新建付款申请单
  newRequistionForm = value => {
    let formId = value.key;
    let acpReqTypeId = '';
    let acpTypeName = '';
    for (var i of this.state.menu) {
      if (i.acpReqTypeId === formId) {
        acpReqTypeId = i.acpReqTypeId;
        acpTypeName = i.acpTypeName;
      }
    }
    let path = this.state.newPaymentRequisition.replace(':id', 0);
    path = path.replace(':typeId', acpReqTypeId);
    this.props.dispatch(
      routerRedux.push({
        pathname: path
      })
    );
  };
  //根据付款申请单单号查询
  onDocumentSearch = value => {
    this.setState({ searchParams: { requisitionNumber: value }, page: 0 }, () => {
      this.getList();
    });
  };

  render() {
    const { searchForm, searchParams, columns, data, loading, pagination } = this.state;
    return (
      <div className="header-title">
        <SearchArea
          maxLength={4}
          searchParams={searchParams}
          submitHandle={this.search}
          eventHandle={this.handleEvent}
          clearHandle={this.clearFunction}
          searchForm={searchForm}
        />
        <div className="divider" />
        <div className="table-header">
          <Row>
            <Col id="drop" style={{position : "relative"}} span={18}>
              <div className="table-header-buttons">
                <Dropdown getPopupContainer={ () => document.getElementById('drop')}
                  trigger={['click']}
                  overlay={
                    <Menu onClick={this.newRequistionForm}>
                      {this.state.menu.map(function(value) {
                        return <Menu.Item key={value.acpReqTypeId}>{value.acpTypeName}</Menu.Item>;
                      })}
                    </Menu>
                  }
                >
                  <Button type="primary">
                    新建付款申请单<Icon type="down" />
                  </Button>
                </Dropdown>
              </div>
            </Col>
            <Col span={6}>
              <Search
                placeholder="请输入付款申请单单据编号"
                onSearch={this.onDocumentSearch}
                enterButton
              />
            </Col>
          </Row>
        </div>
        <Table
          rowKey={record => record.id}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onRow={record => ({
            onClick: () => this.rowClick(record),
          })}
          bordered={true}
          size="middle"
        />
      </div>
    );
  }
}


const wrappedPaymentRequisition = Form.create()(PaymentRequisition);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    languages: state.languages,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedPaymentRequisition);
