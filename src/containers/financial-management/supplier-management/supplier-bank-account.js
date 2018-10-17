import { messages } from "share/common";
/**
*  created by jsq on 2017/12/18
*/
//租户与公司模式控制
import React from 'react'
import { connect } from 'react-redux'

import { Button, Table, Badge, notification, Popover, Popconfirm, Icon } from 'antd';
import SearchArea from 'components/search-area';
import SlideFrame from "components/slide-frame";
import vendorService from 'containers/financial-management/supplier-management/vendorService';
import 'styles/financial-management/supplier-management/supplier-bank-account.scss'
import NewUpdateBankAccount from 'containers/financial-management/supplier-management/new-update-bank-account'
import menuRoute from 'routes/menuRoute'
import BasicInfo from 'containers/financial-management/supplier-management/basic-info'

import moment from "moment"

class SupplierBankAccount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      updateState: false,
      vendorInfo: {},
      slideFrame: {
        title: '',
        visible: false,
        params: {}
      },
      searchParams: {},
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      infoList: [
        {
          type: 'input', id: 'venderTypeName',
          disabled: true,
          label: messages('supplier.management.type')
        }, /*供应商类型*/
        {
          type: 'input', id: 'venderCode',
          disabled: true,
          label: messages('supplier.management.code')
        }, /*供应商代码*/
        {
          type: 'input', id: 'venNickname',
          disabled: true,
          label: messages('supplier.management.name')
        }, /*供应商名称*/
        {
          type: 'switch',
          id: 'venType',
          defaultValue: true,
          label: messages('common.column.status')
        }, /*状态*/
      ],
      columns: [
        {                         /*序号*/
          title: messages('supplier.management.ordinalNumber'),
          key: "ordinalNumber",
          dataIndex: 'ordinalNumber', width: '5%'
        },
        {/*银行代码*/
          title: messages('bank.bankCode'), key: "bankCode", dataIndex: 'bankCode',
          render: desc => <span><Popover content={desc}>{desc}</Popover></span>
        },
        {                         /*银行名称*/
          title: messages('bank.bankName'), key: "bankName", dataIndex: 'bankName',
          render: desc => <span><Popover content={desc}>{desc}</Popover></span>
        },
        {                         /*银行账号*/
          title: messages('supplier.bank.account'), key: "bankAccount", dataIndex: 'bankAccount',
          render: desc => <span><Popover content={desc}>{desc}</Popover></span>
        },
        {                         /*银行户名*/
          title: messages('bank.account.name'), key: "venBankNumberName", dataIndex: 'venBankNumberName',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {                         /*国家*/
          title: messages('bank.country'), key: "country", dataIndex: 'country',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {                         /*最近更新时间*/
          title: messages('supplier.management.lastUpdate'), key: "webUpdateDate", dataIndex: 'webUpdateDate',
          render: desc => <span>
            <Popover content={moment(new Date(desc)).format("YYYY-MM-DD")}>{desc ? moment(new Date(desc)).format("YYYY-MM-DD") : "-"}</Popover>
          </span>
        },
        {                         /*状态*/
          title: messages('common.column.status'), key: "venType", dataIndex: 'venType',
          render: venType => (
            <Badge status={venType === 1001 ? 'success' : 'error'}
              text={venType === 1001 ? messages("common.status.enable") : messages("common.status.disable")} />)
        },
        {                         /*主账户*/
          title: messages('supplier.main.account'), key: "primaryFlag", dataIndex: 'primaryFlag',
          render: desc => <span>{desc ? 'Y' : 'N'}</span>
        },
        {          /*操作*/
          title: messages('common.operation'), key: "operate", dataIndex: 'operate', width: '80',
          render: (text, record, index) => (
            <span>
              {/*如果是 TENANT且公司模式公司模式  就不能编辑*/}
              {(!this.props.main.tenantMode && this.props.params.source === "TENANT") ? messages("common.edit") : <a href="#" onClick={(e) => this.handleUpdate(e, record, index)}>{messages('common.edit')}</a>}
            </span>)
        },
      ]
    };
  }

  componentWillMount() {
    // let query = this.props.location.query;
    // console.log(query)
    // console.log(this.props.location)

    let params = this.props.params;
    console.log(this.props.params)
    //根据id查完整供应商信息
    vendorService.getVendorInfoById(params.id).then(response => {
      this.setState({
        vendorInfo: response.data,
      }, this.getList)
    });
  }

  getList() {
    this.setState({ loading: true });
    let pagination = this.state.pagination;
    let params = Object.assign({}, this.state.searchParams);
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.vendorInfoId = this.state.vendorInfo.id;
    params.page = pagination.page;
    params.size = pagination.pageSize;
    console.log(params)
    vendorService.getBanks(params).then(response => {
      let i = 0;
      response.data.body.map(item => {
        item.key = item.id;
        item.ordinalNumber = pagination.page * pagination.pageSize + ++i;
      });
      pagination.total = Number(response.headers['x-total-count']) ? Number(response.headers['x-total-count']) : 0;
      this.setState({
        loading: false,
        data: response.data.body,
        pagination,
      })
    })
  }

  //新建侧滑
  handleCreate = () => {
    let slideFrame = {
      title: messages('supplier.add.bank.account'),
      visible: true,
      params: { vendorId: this.props.params.id }
    };
    this.setState({
      slideFrame
    })
  };

  handleUpdate = (e, record, index) => {
    let slideFrame = {
      title: messages('supplier.update.bank.account'),
      visible: true,
      params: { vendorId: this.props.params.id, ...record }
    };
    this.setState({
      slideFrame
    })
  };

  handleOnClose = () => {
    let slideFrame = {
      title: "",
      visible: false,
      params: {}
    };
    this.setState({
      slideFrame
    })
  };

  handleAfterClose = (params) => {
    let slideFrame = {
      title: "",
      visible: false,
      params: {}
    };
    this.setState({
      slideFrame
    }, () => {
      if (params) {
        this.getList();
      }
    })
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, () => {
      this.getList();
    })
  };


  //返回
  handleBack = () => {
    this.context.router.push(menuRoute.getRouteItem('supplier-maintain', 'key').url)
  };

  handleChange = () => { };

  render() {
    const { loading, vendorInfo, infoList, data, pagination, updateState, columns, slideFrame } = this.state;

    return (
      <div className="supplier-bank-account">
        <BasicInfo
          infoList={infoList}
          infoData={vendorInfo}
          handelEvent={() => { }}
          updateHandle={() => { }}
          updateState={updateState} />
        <div className="table-header">
          <div className="table-header-title">
            {messages('common.total', { total: `${pagination.total}` })}
          </div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" disabled={(!this.props.main.tenantMode && this.props.params.source === "TENANT")} onClick={this.handleCreate}>
              {/*新 建*/}
              {messages('common.create')}
            </Button>
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          pagination={pagination}
          columns={columns}
          onChange={this.onChangePager}
          bordered
          size="middle" />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }}
          onClick={this.handleBack}><Icon type="rollback" style={{ marginRight: '5px' }} />
          {messages("common.back")}
        </a>
        <SlideFrame
          title={slideFrame.title}
          show={slideFrame.visible}
          content={NewUpdateBankAccount}
          onClose={this.handleOnClose}
          afterClose={this.handleAfterClose}
          params={slideFrame.params} />
      </div>
    )
  }
}

SupplierBankAccount.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    main: state.main
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(SupplierBankAccount);
