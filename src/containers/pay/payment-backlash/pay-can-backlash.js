import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import SlideFrame from 'widget/slide-frame'
import config from 'config'
import SearchArea from 'widget/search-area'
import backlashService from './pay-backlash.service'
import moment from 'moment'
import { Radio, Badge, Table, Tabs, Popover, Pagination, message, Alert, Icon, Dropdown, Menu, Modal, Form, DatePicker } from 'antd'
import ToBacklash from './to-backlash';
const FormItem = Form.Item;
import {messages } from 'utils/utils'

class PayMyBacklash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      setOfBooksId: null,

      searchForm: [
        { type: 'input', colSpan: 6, id: 'billcode', label: this.$t({ id: 'pay.backlash.billCode' }) },
        { type: 'input', colSpan: 6, id: 'documentNumber', label: this.$t({ id: 'pay.backlash.documentNumber' }) },
        { type: 'value_list', colSpan: 6, id: 'documentTypeId', label: this.$t({ id: 'pay.backlash.documentTypeId' }), valueListCode: 2106, options: [], event: 'code' },
        {
          type: 'items', colSpan: 6, id: 'partner', items: [
            { type: 'value_list', id: 'partnerCategory', label: messages('pay.workbench.type')/*类型*/, valueListCode: 2107, options: [], event: 'PARTNER' },
            {
              type: 'list', id: 'partnerId', label: `${this.$t({ id: "pay.refund.partnerName" }/*收款方*/)}`, listType: 'select_payee', single: true,
              disabled: true, labelKey: "name", valueKey: "id", listExtraParams: { empFlag: "1001", pageFlag: true }
            },
          ]
        },
        {
          type: 'items', colSpan: 6, id: 'dateRange', items: [
            { type: 'date', id: 'payDateFrom', label: this.$t({ id: 'pay.backlash.payDateFrom' }) },
            { type: 'date', id: 'payDateTo', label: this.$t({ id: 'pay.backlash.payDateTo' }) }
          ]
        },

        {
          type: 'items', colSpan: 6, id: 'amountRange', items: [
            { type: 'input', id: 'amountFrom', label: this.$t({ id: 'pay.backlash.amountFrom' }) },
            { type: 'input', id: 'amountTo', label: this.$t({ id: 'pay.backlash.amountTo' }) }
          ]
        },

        {
          type: 'list', colSpan: 6, listType: "select_authorization_user", options: [], id: 'applicant', label: this.$t({ id: "pay.backlash.employeeName" }/*申请人*/), labelKey: "userName",
          valueKey: "userId", single: true
        }, //申请人
      ],
      canBacklashSearchParams: {},
      columns: [
        {
          title: this.$t({ id: 'pay.backlash.billCode' }), dataIndex: 'billcode', width: 150, align: "center",
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          title: this.$t({ id: 'pay.backlash.documentNumber' }), dataIndex: 'documentNumber', width: 150,
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          title: this.$t({ id: 'pay.backlash.documentTypeId' }), dataIndex: 'documentCategoryName',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          title: this.$t({ id: "pay.backlash.employeeName" }/*申请人*/), dataIndex: 'employeeName', width: 150,
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        // { title: '申请日期', dataIndex: 'requisitionDate',
        //   render: desc=><span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span>
        // },
        // {title: '币种', dataIndex: 'currency'},
        {
          title: this.$t({ id: 'pay.backlash.amount' }), dataIndex: 'amount',
          render: desc => <span><Popover content={this.filterMoney(desc, 2)}>{this.filterMoney(desc, 2)}</Popover></span>
        },
        {
          title: this.$t({ id: 'pay.backlash.currency' }), dataIndex: 'currency',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          title: this.$t({ id: 'pay.backlash.sign' }), dataIndex: 'partnerName',
          render: (value, record) => {
            return (
              <div>
                {record.partnerCategoryName}
                <span className="ant-divider" />
                {value}
              </div>
            )
          }

        },
        {
          title: this.$t({ id: 'pay.backlash.payDate' }), dataIndex: 'payDate',
          render: desc => <span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc ? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span>
        },

        {
          title: this.$t({ id: 'pay.backlash.option' }), render: (value, record) => {
            record.flag = false;
            return (
              <a onClick={() => { this.goBacklash(record) }}>发起反冲</a>
            )
          }
        }
      ],
      data: [],
      canBacklashPage: 0,
      canBacklashPageSize: 10,
      searchParams: {},
      canBacklashPagination: {
        total: 0
      },
      canBacklashData: [],
      goBacklash: null,
      openWindowFlag: false,//发起反冲窗口
    }
  }

  //去反冲页面
  goBacklash = (record) => {
    backlashService.getReadyByDetailId(record.id).then(
      res => {
        if (res.status === 200) {
          this.setState({ openWindowFlag: true, goBacklash: res.data })
        }
      }
    )
  };

  //反冲窗口关闭
  cancelWindow = (params) => {
    this.setState({ openWindowFlag: false },() => {
      params&&this.getCanBacklashList();
    });
  };

  //反冲窗口完全关闭后回掉
  restFormFunc = (params) => {
    this.setState({ openWindowFlag: false }, () => {
      params&&this.getCanBacklashList();
    });
  };



  //可反冲列表搜索
  canBacklashHandle = (values) => {
    values.payDateFrom && (values.payDateFrom = values.payDateFrom.format('YYYY-MM-DD'));
    values.payDateTo && (values.payDateTo = values.payDateTo.format('YYYY-MM-DD'));
    if (JSON.stringify(values.partnerId) !== '[]' && values.partnerId) {
      (values.partnerId = values.partnerId[0].id)
    }
    this.setState({ canBacklashSearchParams: values, canBacklashPage: 0 }, () => {
      this.getCanBacklashList()
    })
  };


  componentWillMount() {
    this.getCanBacklashList(this.state.nowStatus);
  }

  //可反冲点击页码
  canBacklashChangePaper = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ canBacklashPage: page - 1 }, () => {
        this.getCanBacklashList()
      })
    }
  };


  //获取可反冲列表
  getCanBacklashList = (resolve, reject) => {
    const { canBacklashPage, canBacklashPageSize, canBacklashSearchParams } = this.state;

    this.setState({ loading1: true });
    let params = { ...canBacklashSearchParams, page: canBacklashPage, size: canBacklashPageSize, backlashStatus: 'N' };
    for(let name in params){
      !params[name]&& delete  params[name]
    }
    backlashService.getCanBacklashList(params).then((res) => {

      if (res.status === 200) {
        this.setState({
          canBacklashData: res.data || [],
          loading1: false,
          canBacklashPagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            current: canBacklashPage + 1,
            pageSize: canBacklashPageSize,
            onChange: this.canBacklashChangePaper,
            pageSizeOptions: ['10', '20', '30', '40'],
            showSizeChanger: true,
            onShowSizeChange: this.onChangePageSize,
            showQuickJumper: true,
            showTotal: (total, range) => this.$t({ id: "common.show.total" }, { range0: `${range[0]}`, range1: `${range[1]}`, total: total })
          }
        });
        resolve && resolve()
      }
    }).catch(() => {
      this.setState({ loading1: false });
      reject && reject()
    })
  };

  //每页多少条
  onChangePageSize = (page, pageSize) => {
    if (page - 1 !== this.state.canBacklashPage || pageSize !== this.state.canBacklashPageSize) {
      this.setState({ canBacklashPage: page - 1, canBacklashPageSize: pageSize }, () => {
        this.getCanBacklashList();
      })
    }
  };
  rowClick(record) {

  }
  clear = () => {
    this.setState({ canBacklashSearchParams: {} }, () => {
      this.searchEventHandle("PARTNER", "");
    })
  }
  searchEventHandle = (event, value) => {
    if (event === "PARTNER") {
      let searchForm = this.state.searchForm;
      value = value ? value : "";
      if (value === "EMPLOYEE") {
        let item = searchForm[3];
        item.items[1].disabled = false;
        item.items[1].listExtraParams["empFlag"] = "1001";
        searchForm[3] = item;
        this.formRef.setValues({ partnerId: undefined })
        this.setState({ searchForm: searchForm })
      }
      if (value === "VENDER") {
        let item = searchForm[3];
        item.items[1].disabled = false;
        item.items[1].listExtraParams["empFlag"] = "1002";
        searchForm[3] = item;
        this.formRef.setValues({ partnerId: undefined })
        this.setState({ searchForm: searchForm })
      }
      if (value === "") {
        let item = searchForm[3];
        item.items[1].disabled = true;
        searchForm[3] = item;
        this.formRef.setValues({ partnerId: undefined })
        this.setState({ searchForm: searchForm })
      }
    }
  };
  render() {
    const { goBacklash, openWindowFlag, loading1, searchForm, columns, canBacklashData, canBacklashPagination } = this.state;
    return (
      <div className="pay-my-backlash">
        <SearchArea searchForm={searchForm}
          submitHandle={this.canBacklashHandle}
          clearHandle={this.clear}
          maxLength={4}
          eventHandle={this.searchEventHandle}
          wrappedComponentRef={(inst) => this.formRef = inst} />
        <div className="table-header" />
        <Table rowKey={record => record.id}
          columns={columns}
          dataSource={canBacklashData}
          pagination={canBacklashPagination}
          loading={loading1}
          onRow={record => ({
            onClick: this.rowClick(record)
          })}
          bordered
          size="middle" />
        <SlideFrame title={this.$t({ id: 'pay.backlash.backlashDetails' })}
          show={openWindowFlag}
          onClose={this.cancelWindow}
          afterClose={this.restFormFunc}>
          <ToBacklash  params={{ record: goBacklash, flag: openWindowFlag }}
                       onClose={(e)=>{this.cancelWindow(e)}}/>
        </SlideFrame>
      </div>
    );
  }
}





function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}


export default connect(mapStateToProps, null, null, { withRef: true })(PayMyBacklash);


