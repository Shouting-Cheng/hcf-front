/**
 * Created by 13576 on 2017/12/4.
 */
import React from 'react'
import { connect } from 'dva'
import { Form, Button, Table, message, Badge, Popover, Dropdown, Icon, Menu, Row, Col, Input } from 'antd'
const Search = Input.Search;
import config from 'config'

import moment from 'moment'
import SearchArea from 'widget/search-area'
import prePaymentService from "containers/pre-payment/my-pre-payment/me-pre-payment.service"
import 'styles/pre-payment/my-pre-payment/me-pre-payment.scss'
import CustomTable from 'widget/custom-table'
import { routerRedux } from 'dva/router';

const statusList = [
  { value: 1001, label: "编辑中" },
  { value: 1002, label: "审批中" },
  { value: 1003, label: "撤回" },
  { value: 1004, label: "审批通过" },
  { value: 1005, label: "审批驳回" }
];


class MyPrePayment extends React.Component {
  constructor(props) {
    super(props);
    console.log(props.company.setOfBooksId);
    this.state = {
      loading: false,
      visible: false,
      setOfBooksId: null,
      searchForm:
        [
          {
            type: 'select', colSpan: '6', id: 'paymentReqTypeId', label: '单据类型',
            getUrl: `${config.prePaymentUrl}/api/cash/pay/requisition/types//queryAll?setOfBookId=${props.company.setOfBooksId}`,
            options: [], method: "get", valueKey: "id", labelKey: "typeName"
          },
          {
            type: 'items', colSpan: '6', id: 'dateRange',
            items:
              [
                { type: 'date', id: 'requisitionDateFrom', label: "申请日期从" },
                { type: 'date', id: 'requisitionDateTo', label: "申请日期至" }
              ]
          },
          {
            type: 'list', colSpan: '6', listExtraParams: { setOfBookId: props.company.setOfBooksId },
            id: 'employeeId', label: '申请人',
            listType: 'user', valueKey: 'id', labelKey: 'fullName', single: true, disabled: true
          },
          { type: 'select', colSpan: '6', id: 'status', label: '状态', options: statusList },
          {
            type: 'items', colSpan: '6', id: 'amountRange',
            items:
              [
                { type: 'input', id: 'advancePaymentAmountFrom', label: "本币金额从" },
                { type: 'input', id: 'advancePaymentAmountTo', label: "本币金额至" }
              ]
          },
          {
            type: 'items', colSpan: '6', id: 'noWritedAmount',
            items:
              [
                { type: 'input', id: 'noWritedAmountFrom', label: "未核销金额从" },
                { type: 'input', id: 'noWritedAmountTo', label: "未核销金额至" }
              ]
          },
          {
            type: 'input', colSpan: '6', id: 'description', label: '备注'
          }
        ],
      columns:
        [
          {
            title: '单号', dataIndex: 'requisitionNumber', width: 180, align: 'center',
            render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
          },
          {
            title: '单据类型', dataIndex: 'typeName', align: 'left',
            render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
          },
          {
            title: '申请人', dataIndex: 'createByName', width: 90, align: 'center',
            render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
          },
          {
            title: '申请日期', dataIndex: 'requisitionDate', width: 110, align: 'center',
            render: desc => <span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc ? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span>
          },
          {
            title: '本币金额', dataIndex: 'advancePaymentAmount', width: 110, align: 'right',
            render: desc => <span><Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover></span>
          },
          {
            title: '已核销金额', dataIndex: 'writedAmount', width: 110, align: 'right',
            render: desc => <span><Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover></span>
          },
          {
            title: '未核销金额', dataIndex: 'noWritedAmount', width: 110, align: 'right',
            render: desc => <span><Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover></span>
          },
          {
            title: '备注', dataIndex: 'description', align: 'left',
            render: (value) => {
              return (
                <Popover content={value}>{value}</Popover>
              )
            }
          },
          {
            title: '状态', dataIndex: 'status', align: 'center', width: 110,
            render: (value, record) => {
              return (
                <Badge status={this.$statusList[value].state} text={this.$statusList[value].label} />
              )
            }
          }
        ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true
      },
      searchParams: {},
      // NewPayRequisition: menuRoute.getRouteItem('new-pre-payment', 'key'), //新建预付款
      // PayRequisitionDetail: menuRoute.getRouteItem('pre-payment-detail', 'key'), //预付款详情,
      // ContractDetail: menuRoute.getRouteItem('contract-detail', 'key'), //合同详情
      //预付款单类型集合
      prePaymentTypeMenu: []
    }
  }

  componentDidMount() {
    this.getPrePaymentType();
  }
  /**
   * 获取预付款单类型
   */
  getPrePaymentType = () => {
    let params = {
      userId: this.props.user.id,
      isEnabled: true
    };
    prePaymentService.getPrePaymentType(params).then(res => {
      if (res.status === 200) {
        this.setState({
          prePaymentTypeMenu: res.data
        });
      }
    }).catch(e => {
      message.error('获取预付款单类型失败');
      console.log(`获取预付款单类型失败：${e.response.data}`);
    });
  }

  /**
   * 选中预付款单类型
   */
  handleMenuClick = (value) => {
    const { dispatch } = this.props;
    let { prePaymentTypeMenu } = this.state;

    let currPrePaymentType = prePaymentTypeMenu.find(item => item.id === value.key);

    this.props.dispatch(
      routerRedux.replace({
        pathname: `/pre-payment/my-pre-payment/new-pre-payment/${0}/${currPrePaymentType.id}/${currPrePaymentType.formOid ? currPrePaymentType.formOid : 0}`,
      })
    );
  }

  //搜索
  search = (values) => {
    values.requisitionDateFrom && (values.requisitionDateFrom = moment(values.requisitionDateFrom).format('YYYY-MM-DD'));
    values.requisitionDateTo && (values.requisitionDateTo = moment(values.requisitionDateTo).format('YYYY-MM-DD'));
    console.log(values);
    this.setState({ searchParams: { ...values, employeeId: values.employeeId || this.props.user.id } }, () => {
      this.customTable.search(this.state.searchParams);
    });
  }
  /**
   * 行点击事件
   */
  rowClick = (record) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/pre-payment/me-pre-payment/pre-payment-detail/${record.id}/prePayment`,
      })
    );
  }
  /**
   * 根据预付款单单号搜索
   */
  onDocumentSearch = (value) => {
    this.setState({
      page: 0,
      searchParams: { ...this.state.searchParams, requisitionNumber: value }
    },
      () => {
        this.customTable.search(this.state.searchParams);
      });
  }
  render() {
    const { visible, loading, searchForm, columns, data, pagination, prePaymentTypeMenu } = this.state;
    return (
      <div className="pre-payment-container">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          maxLength={4} />
        {/* <div className='divider'></div> */}
        <div style={{ marginBottom: 10, marginTop: 10 }}>
          <Row>
            <Col span={18}>
              <Dropdown overlay={
                <Menu onClick={this.handleMenuClick} >
                  {
                    prePaymentTypeMenu.map(item => {
                      return <Menu.Item key={item.id}>{item.typeName}</Menu.Item >
                    })
                  }
                </Menu>}
                trigger={['click']}>
                <Button type='primary'>新建预付款单 <Icon type="down" /></Button>
              </Dropdown>
            </Col>
            <Col span={6}>
              <Search
                placeholder='请输入预付款单单号'
                onSearch={this.onDocumentSearch}
                enterButton
              />
            </Col>
          </Row>
        </div>
        <CustomTable
          ref={ref => this.customTable = ref}
          columns={columns}
          onClick={this.rowClick}
          scroll={{ x: true, y: false }}
          params={{
            ... this.state.searchParams,
            employeeId: this.props.user.id,
          }}
          url={`${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/query`}
        />
      </div>
    )
  }
}
// MyPrePayment.contextTypes = {
//   router: React.PropTypes.object
// }
const wrappedMyPrePayment = Form.create()(MyPrePayment);

function mapStateToProps(state) {
  console.log(state);
  return {
    user: state.user.currentUser,
    company: state.user.company,
    languages: state.languages
  }
}
export default connect(mapStateToProps, null, null, { withRef: true })(wrappedMyPrePayment)

