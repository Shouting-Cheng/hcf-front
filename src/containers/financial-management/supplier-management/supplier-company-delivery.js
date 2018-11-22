import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import { Button, Table, Badge, notification, Popover, Popconfirm, Icon, Checkbox, message } from 'antd';
import SearchArea from 'components/Widget/search-area';
import ListSelector from 'components/Widget/list-selector'
import vendorService from 'containers/financial-management/supplier-management/vendorService';
import 'styles/financial-management/supplier-management/supplier-company-delivery.scss'
import NewUpdateBankAccount from 'containers/financial-management/supplier-management/new-update-bank-account'
import BasicInfo from 'containers/financial-management/supplier-management/basic-info'

class SupplierCompanyDelivery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: [],
      vendorInfo: {},
      updateState: false,
      companyListSelector: false,  //控制公司选则弹框
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      infoList: [
        { type: 'input', id: 'venderTypeName', disabled: true, label: this.$t('supplier.management.type') }, /*供应商类型*/
        { type: 'input', id: 'venderCode', disabled: true, label: this.$t('supplier.management.code') }, /*供应商代码*/
        { type: 'input', id: 'venNickname', disabled: true, label: this.$t('supplier.management.name') }, /*供应商名称*/
        { type: 'switch', id: 'venType', defaultValue: true, label: this.$t('common.column.status') }, /*状态*/
      ],
      columns: [
        {                         /*公司代码*/
          title: this.$t('supplier.company.code'), key: "companyCode", dataIndex: 'companyCode',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {                         /*公司名称*/
          title: this.$t('supplier.company.name'), key: "name", dataIndex: 'name',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {                         /*公司类型*/
          title: this.$t('supplier.company.type'), key: "companyTypeName", dataIndex: 'companyTypeName',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {                         /*账套*/
          title: this.$t('supplier.company.setOfBook'), key: "setOfBooksName", dataIndex: 'setOfBooksName'
        },
        {                        /*启用*/
          title: this.$t('common.status.enable'), key: "enabled", dataIndex: 'enabled', width: '10%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)} checked={record.enabled} />
        }
      ]
    }
  }

  //改变启用状态
  onChangeEnabled = (e, record) => {
    this.setState({ loading: true });
    let params = {};
    params.id = record.infoAssignCompanyId;
    params.enabled = e.target.checked;
    vendorService.changeVendorCompanyInfo(params).then(response => {
      this.getList()
    })
  };

  componentDidMount() {
    let id = this.props.match.params.id;
    //根据id查完整供应商信息
    vendorService.getVendorInfoById(id).then(response => {
      response.data.venType = (response.data.venType === 1001);
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
    params.infoId = this.state.vendorInfo.id;
    params.page = pagination.page;
    params.size = pagination.pageSize;
    vendorService.getCompanies(params).then(response => {
      if (response.data.records) {
        response.data.records.map(item => {
          item.key = item.id
        });
      }
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']) ? Number(response.headers['x-total-count']) : 0;
      this.setState({
        pagination,
        loading: false,
        data: response.data.records ? response.data.records : []
      })
    })
  };

  //控制是否弹出公司列表
  showListSelector = (flag) => {
    this.setState({
      companyListSelector: flag
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

  //处理公司弹框点击ok,分配公司
  handleListOk = (result) => {
    if (result.result.length > 0) {
      let params = {};
      let companyIDs = [];
      result.result.map(item => {
        companyIDs.push(item.id)
      });
      params.companyIDs = companyIDs;
      params.infoIDs = [this.props.match.params.id];
      vendorService.batchDeliveryCompany(params).then(response => {
        message.success(`${this.$t('common.operate.success')}`);
        this.setState({
          loading: false,
          companyListSelector: false,
        }, this.getList)
      }).catch((e) => {
        if (e.response) {
          message.error(`${this.$t('common.operate.filed')},${e.response.data.message}`)
        }
      });
    }
    this.showListSelector(false)
  };

  //返回
  handleBack = () => {
    //this.context.router.push(menuRoute.getRouteItem('supplier-maintain', 'key').url);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/supplier-maintain`,
      })
    );
  };

  render() {
    const { loading, data, columns, pagination, searchForm, companyListSelector, vendorInfo, infoList, updateState } = this.state;


    return (
      <div className="supplier-company-delivery" style={{paddingBottom:20}}>
        <BasicInfo
          infoList={infoList}
          infoData={vendorInfo}
          handelEvent={() => { }}
          updateHandle={() => { }}
          updateState={updateState} />
        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total', { total: `${pagination.total}` })}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={() => this.showListSelector(true)}>{this.$t('budget.item.batchCompany')}</Button>  {/*批量分配公司*/}
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
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}><Icon type="rollback" style={{ marginRight: '5px' }} />{this.$t('common.back')}</a>

        <ListSelector type="vendor_company"
          visible={companyListSelector}
          onOk={this.handleListOk}
          extraParams={{ tenantId: this.props.company.tenantId, infoId: vendorInfo.id }}
          onCancel={() => this.showListSelector(false)} />
      </div>)
  }
}


function mapStateToProps(state) {
  return {
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(SupplierCompanyDelivery);
