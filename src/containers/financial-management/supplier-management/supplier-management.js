//租户与公司模式控制
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Badge, notification, Popover, Popconfirm, message } from 'antd';
import Table from 'widget/table'
import SearchArea from 'components/Widget/search-area';
import vendorService from 'containers/financial-management/supplier-management/vendorService';
import config from 'config';
import SlideFrame from 'components/Widget/slide-frame';
import NewUpdateSupplier from 'containers/financial-management/supplier-management/new-update-supplier';
import 'styles/financial-management/supplier-management/supplier-management.scss';
import Importer from 'components/Widget/Template/importer';
import moment from 'moment';
import ListSelector from 'components/Widget/list-selector';

class SupplierManagement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: [],
      venderLevel: [],
      companyListSelector: false, //控制公司选则弹框
      industry: [],
      batchCompany: true,
      selectedRowKeys: [],
      slideFrame: {
        title: '',
        visible: false,
        params: {},
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        disuse: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },

      searchForm: [
        {
          type: 'select',
          id: 'venderTypeId',
          label: this.$t('supplier.management.type') /*供应商类型*/,
          colSpan: '6',
          valueKey: 'id',
          labelKey: 'name',
          options: [],
          getUrl: `${config.vendorUrl}/api/ven/type/query`,
          method: 'get',
          getParams: { page: 0, size: 99999 },
        },
        {
          type: 'input',
          colSpan: '6',
          id: 'venderCode',
          label: this.$t('supplier.management.code') /*供应商代码*/,
        },
        {
          type: 'input',
          colSpan: '6',
          id: 'venNickname',
          label: this.$t('supplier.management.name') /*供应商名称*/,
        },
        {
          type: 'input',
          colSpan: '6',
          id: 'bankAccount',
          label: this.$t('supplier.bank.account') /*银行账号*/,
        },
        {
          type: 'radio',
          colSpan: '6',
          id: 'venType',
          label: this.$t('common.column.status') /*状态*/,
          options: [
            { label: this.$t('supplier.management.all'), value: null },
            { label: this.$t('common.status.enable'), value: '1001' },
            { label: this.$t('common.status.disable'), value: '1002' },
          ],
          defaultValue: null,
        },
      ],
      innerColumns: [
        {
          /*序号*/
          title: this.$t('supplier.management.index'),
          key: 'order',
          dataIndex: 'order',
        },
        {
          /*银行账号*/
          title: this.$t('supplier.bank.account'),
          key: 'bankAccount',
          dataIndex: 'bankAccount',
        },
        {
          /*银行代码*/
          title: this.$t('supplier.bank.code'),
          key: 'bankCode',
          dataIndex: 'bankCode',
        },
        {
          /*银行名称*/
          title: this.$t('supplier.bank.name'),
          key: 'bankName',
          dataIndex: 'bankName',
        },
        {
          /*国家*/
          title: this.$t('supplier.management.country'),
          key: 'country',
          dataIndex: 'country',
          render: desc => <span>{desc ? desc : '-'}</span>,
        },
        {
          /*开户地*/
          title: this.$t('supplier.bank.address'),
          key: 'bankAddress',
          dataIndex: 'bankAddress',
          render: desc => <span>{desc ? <Popover content={desc}>{desc}</Popover> : '-'}</span>,
        },
        {
          /*状态*/
          title: this.$t('common.column.status'),
          key: 'venType',
          dataIndex: 'venType',
          width: '8%',
          render: venType => (
            <Badge
              status={venType === 1001 ? 'success' : 'error'}
              text={
                venType === 1001
                  ? this.$t('common.status.enable')
                  : this.$t('common.status.disable')
              }
            />
          ),
        },
        {
          /*最近更新时间*/
          title: this.$t('supplier.bank.lastTime'),
          key: 'webUpdateDate',
          dataIndex: 'webUpdateDate',
          render: value => moment(new Date(value)).format('YYYY-MM-DD'),
        },
      ],
      columns: [
        {
          /*供应商代码*/
          title: this.$t('supplier.management.code'),
          key: 'venderCode',
          dataIndex: 'venderCode',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        //需求7348
        // {          /*外部标识ID*/
        //   title: this.$t('supplier.management.outerId'), key: "venNickOid", dataIndex: 'venNickOid',
        //   render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        // },
        {
          /*供应商名称*/
          title: this.$t('supplier.management.name'),
          key: 'venNickname',
          dataIndex: 'venNickname',
          width: '15%',
          render: desc => <span>{desc ? <Popover content={desc}>{desc}</Popover> : '-'}</span>,
        },
        {
          /*供应商类型*/
          title: this.$t('supplier.management.type'),
          key: 'venderTypeName',
          dataIndex: 'venderTypeName',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          /*更新日志*/
          title: this.$t('supplier.management.updateLog'),
          key: 'updateLog',
          dataIndex: 'updateTime',
          width: '17%',
          render: (value, record, index) => {
            let date = moment(new Date(value)).format('YYYY-MM-DD');

            // }
            // let add = m => m < 10 ? '0' + m : m;
            // let time = new Date(parseInt(record.updateTime));

            let content = date + ' ' + record.venOperatorName + '-' + record.venOperatorNumber;
            return <Popover content={content}>{content ? content : '-'}</Popover>;
          },
        },
        {
          /*状态*/
          title: this.$t('common.column.status'),
          key: 'status',
          dataIndex: 'venType',
          width: '7%',
          render: venType => (
            <Badge
              status={venType === 1001 ? 'success' : 'error'}
              text={
                venType === 1001
                  ? this.$t('common.status.enable')
                  : this.$t('common.status.disable')
              }
            />
          ),
        },
        {
          title: this.$t('common.operation'),
          key: 'operation',
          width: '18%',
          render: (text, record, index) => (
            <span>
              {/*如果是 TENANT且公司模式公司模式  就不能编辑*/}
              {/* {!this.props.main.tenantMode && record.source === "TENANT" ? this.$t("common.edit") : <a href="#"
                onClick={(e) => this.editItem(e, record, index)}>
                {this.$t("common.edit")}
              </a>}*/}
              {<a onClick={e => this.editItem(e, record, index)}>{this.$t('common.edit')}</a>}
              <span className="ant-divider" />
              <a onClick={e => this.handleLinkAccount(e, record, index)}>
                {this.$t('supplier.bank.account')}
              </a>
              {<span className="ant-divider" />}
              {
                <a onClick={e => this.handleLinkCompany(e, record, index)}>
                  {this.$t('supplier.management.deliveryCompany')}
                </a>
              }
            </span>
          ),
        },
      ],
      showImportFrame: false,
      selectedEntityOids: [], //已选择的列表项的Oids
    };
  }

  componentDidMount() {
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState(
      {
        pagination,
      },
      () => {
        this.clearBeforePage();
        this.getList();
      }
    );
    this.getSystemValueList(2214).then(response => {
      this.setState({
        industry: response.data.values,
      });
    });

    this.getSystemValueList(2215).then(response => {
      this.setState({
        venderLevel: response.data.values,
      });
    });
  }

  handleLinkAccount = (e, record, index) => {
    //this.setBeforePage(this.state.pagination);
    //let pathComp = menuRoute.getMenuItemByAttr('supplier-bank-account', 'key');
    //source是判定此供应商属于公司还是租户，
    //公司模式下，租户级供应商不能编辑
    //let path = pathComp.children.supplierBankAccount.url.replace(':id', ecord.id).replace(":source", record.source);
    //this.context.router.push(path);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/supplier-maintain/supplier-bank-account/${record.id}/${
          record.source
        }`,
      })
    );
  };

  handleLinkCompany = (e, record, index) => {
    this.setBeforePage(this.state.pagination);
    //let pathComp = menuRoute.getMenuItemByAttr('supplier-bank-account', 'key');
    //let path = pathComp.children.supplierCompanyDelivery.url.replace(':id', record.id);
    /*let _path = {
      pathname: path,
      // query: "query",
      // state: "state",
      // search: "search"
    }*/
    //this.context.router.push(_path);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/supplier-maintain/delivery-company/${record.id}`,
      })
    );
  };

  handleSearch = params => {
    let { pagination } = this.state;
    pagination.page = 0;
    pagination.current = 1;
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    this.setState(
      {
        pagination,
        searchParams: params,
      },
      this.getList
    );
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState(
      {
        loading: true,
        pagination: temp,
      },
      () => {
        this.getList();
      }
    );
  };

  //列表选择更改
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  //选择一行
  //选择逻辑：每一项设置selected属性，如果为true则为选中
  //同时维护selectedEntityOids列表，记录已选择的Oid，并每次分页、选择的时候根据该列表来刷新选择项
  onSelectRow = (record, selected) => {
    let temp = this.state.selectedEntityOids;
    if (selected) temp.push(record.id);
    else temp.delete(record.id);
    this.setState({
      selectedEntityOids: temp,
      batchCompany: temp.length > 0 ? false : true,
    });
  };

  //全选
  onSelectAllRow = selected => {
    let temp = this.state.selectedEntityOids;
    if (selected) {
      this.state.data.map(item => {
        temp.addIfNotExist(item.id);
      });
    } else {
      this.state.data.map(item => {
        temp.delete(item.id);
      });
    }
    this.setState({
      selectedEntityOids: temp,
      batchCompany: temp.length > 0 ? false : true,
    });
  };

  //换页后根据Oids刷新选择框
  refreshRowSelection() {
    let selectedRowKeys = [];
    this.state.selectedEntityOids.map(selectedEntityOid => {
      this.state.data.map((item, index) => {
        if (item.id === selectedEntityOid) selectedRowKeys.push(index);
      });
    });
    this.setState({ selectedRowKeys });
  }

  //清空选择框
  clearRowSelection() {
    this.setState({ selectedEntityOids: [], selectedRowKeys: [] });
  }

  getList() {
    this.setState({ loading: true });
    let { pagination } = this.state;
    let params = Object.assign({}, this.state.searchParams);
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = pagination.page;
    params.size = pagination.pageSize;
    vendorService.getVenInfoByOptions(params).then(response => {
      response.data.body.map(item => {
        item.key = item.id;
        let order = 0;
        if (typeof item.industryId !== 'undefined' && item.industryId !== null) {
          console.log(this.state.industry);
          this.state.industry.map(children => {
            if (parseInt(item.industryId) === children.id) {
              item.industryName = children.messageKey;
            }
          });
        }
        if (typeof item.venderLevelId !== 'undefined' && item.venderLevelId !== null) {
          this.state.venderLevel.map(children => {
            if (parseInt(item.venderLevelId) === children.id) {
              item.venderLevelName = children.messageKey;
            }
          });
        }
        // item.venOperatorName = this.props.user.fullName;
        // item.venOperatorNumber = this.props.user.employeeID;
        item.venBankAccountBeans.map(children => {
          children.order = ++order;
          children.key = children.id;
        });
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count'])
        ? Number(response.headers['x-total-count'])
        : 0;
      this.setState({
        loading: false,
        data: response.data.body,
        pagination,
      });
    });
  }

  //新建侧滑
  handleCreate = () => {
    let slideFrame = {
      title: this.$t('supplier.management.newSupplier'),
      visible: true,
      params: { flag: 'create' },
    };
    this.setState({
      slideFrame,
    });
  };

  editItem = (e, record, index) => {
    // record.effectiveDate = moment(new Date(record.effectiveDate));
    if (record.effectiveDate) {
      record.effectiveDate = moment(new Date(record.effectiveDate));
    } else {
      record.effectiveDate = null;
    }

    let slideFrame = {
      title: this.$t('supplier.management.updateSupplier'),
      visible: true,
      params: record,
    };
    this.setState({
      slideFrame,
    });
  };

  handleOnClose = (params) => {
    let slideFrame = {
      title: '',
      visible: false,
      params: {},
    };
    this.setState({
      slideFrame,
    },()=>{
      params&&this.getList();
    });
  };

  handleAfterClose = params => {
    let slideFrame = {
      title: '',
      visible: false,
      params: {},
    };
    this.setState({
      slideFrame,
      loading: params,
    });
    if (!!params) {
      this.getList();
    }
  };

  showImport = flag => {
    this.setState({ showImportFrame: flag });
  };

  //控制是否弹出公司列表
  showListSelector = flag => {
    this.setState({
      companyListSelector: flag,
    });
  };

  //处理公司弹框点击ok,分配公司
  handleListOk = result => {
    if (result.result.length > 0) {
      let params = {};
      let companyIDs = [];
      result.result.map(item => {
        companyIDs.push(item.id);
      });
      params.companyIDs = companyIDs;
      params.infoIDs = this.state.selectedRowKeys;
      vendorService
        .batchDeliveryCompany(params)
        .then(response => {
          message.success(`${this.$t('common.operate.success')}`);
          this.setState(
            {
              loading: false,
              companyListSelector: false,
              selectedRowKeys: [],
              selectedEntityOids: [],
              batchCompany:true,
            },
            this.getList
          );
        })
        .catch(e => {
          if (e.response) {
            message.error(`${this.$t('common.operate.filed')},${e.response.data.message}`);
          }
        });
    }
    this.showListSelector(false);
  };

  renderInnerTable = (record, index) => {
    const { innerColumns } = this.state;
    return (
      <Table columns={innerColumns} dataSource={record['venBankAccountBeans']} pagination={false} />
    );
  };

  //非租户模式只显示新增按钮
  renderNewByTenant = () => {
    const { batchCompany, showImportFrame } = this.state;
    return (
      <div className="table-header-buttons">
        <Button type="primary" onClick={this.handleCreate}>
          {/*新 建*/}
          {this.$t('common.create')}
        </Button>
        {/*<Button type="primary" onClick={() => this.showImport(true)}>*/}
        {/*/!*导入*!/*/}
        {/*{this.$t('importer.import')}*/}
        {/*</Button>*/}
        <Importer
          visible={showImportFrame}
          title={this.$t('supplier.management.upload')}
          templateUrl={`${config.budgetUrl}/api/budget/items/export/template`}
          uploadUrl={`${config.budgetUrl}/api/budget/items/import`}
          errorUrl={`${config.budgetUrl}/api/budget/items/export/failed/data`}
          fileName={this.$t('item.itemUploadFile')}
          onOk={this.handleImportOk}
          afterClose={() => this.showImport(false)}
        />
        <Button onClick={() => this.showListSelector(true)} disabled={batchCompany}>
          {this.$t('supplier.management.deliveryCompany')}
        </Button>
      </div>
    );
  };

  render() {
    const {
      loading,
      searchForm,
      data,
      columns,
      pagination,
      companyListSelector,
      selectedRowKeys,
      slideFrame,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow,
    };
    return (
      <div className="supplier-management">
        <SearchArea searchForm={searchForm} maxLength={4} submitHandle={this.handleSearch} />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('supplier.management.total', { total: `${pagination.total}` })}
          </div>
          {/*共搜索到*个供应商，*个已停用*/}
          {this.renderNewByTenant()}
        </div>

        <Table
          className="components-table-demo-nested"
          loading={loading}
          dataSource={data}
          rowSelection={rowSelection}
          columns={columns}
          expandedRowRender={this.renderInnerTable}
          rowKey={record => record.id}
          pagination={pagination}
          onChange={this.onChangePager}
          size="middle"
        />

        <SlideFrame
          title={slideFrame.title}
          show={slideFrame.visible}
          onClose={this.handleAfterClose}
        >
          <NewUpdateSupplier onClose={this.handleOnClose} params={slideFrame.params} />
        </SlideFrame>
        <ListSelector
          type="vendor_company"
          visible={companyListSelector}
          onOk={this.handleListOk}
          extraParams={{ tenantId: this.props.company.tenantId }}
          onCancel={() => this.showListSelector(false)}
        />
      </div>
    );
  }
}

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
)(SupplierManagement);
