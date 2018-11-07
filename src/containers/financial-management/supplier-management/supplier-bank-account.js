import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Table, Badge, notification, Popover, Popconfirm, Icon } from 'antd';
import SearchArea from 'components/Widget/search-area';
import SlideFrame from 'components/Widget/slide-frame';
import vendorService from 'containers/financial-management/supplier-management/vendorService';
import 'styles/financial-management/supplier-management/supplier-bank-account.scss';
import NewUpdateBankAccount from 'containers/financial-management/supplier-management/new-update-bank-account';
import BasicInfo from 'containers/financial-management/supplier-management/basic-info';
import moment from 'moment';

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
        params: {},
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
          type: 'input',
          id: 'venderTypeName',
          disabled: true,
          label: this.$t('supplier.management.type'),
        } /*供应商类型*/,
        {
          type: 'input',
          id: 'venderCode',
          disabled: true,
          label: this.$t('supplier.management.code'),
        } /*供应商代码*/,
        {
          type: 'input',
          id: 'venNickname',
          disabled: true,
          label: this.$t('supplier.management.name'),
        } /*供应商名称*/,
        {
          type: 'switch',
          id: 'venType',
          defaultValue: true,
          label: this.$t('common.column.status'),
        } /*状态*/,
      ],
      columns: [
        {
          /*序号*/
          title: this.$t('supplier.management.ordinalNumber'),
          key: 'ordinalNumber',
          dataIndex: 'ordinalNumber',
          align:"center",
          width: '5%',
        },
        {
          /*银行代码*/
          title: this.$t('bank.bankCode'),
          key: 'bankCode',
          dataIndex: 'bankCode',
          render: desc => (
            <span>
              <Popover content={desc}>{desc}</Popover>
            </span>
          ),
        },
        {
          /*银行名称*/
          title: this.$t('bank.bankName'),
          key: 'bankName',
          dataIndex: 'bankName',
          width:180,
          render: desc => (
            <span>
              <Popover content={desc}>{desc}</Popover>
            </span>
          ),
        },
        {
          /*银行账号*/
          title: this.$t('supplier.bank.account'),
          key: 'bankAccount',
          dataIndex: 'bankAccount',
          width:180,
          render: desc => (
            <span>
              <Popover content={desc}>{desc}</Popover>
            </span>
          ),
        },
        {
          /*银行户名*/
          title: this.$t('bank.account.name'),
          key: 'venBankNumberName',
          dataIndex: 'venBankNumberName',
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          /*国家*/
          title: this.$t('bank.country'),
          key: 'country',
          dataIndex: 'country',
          width:90,
          render: desc => (
            <span>
              <Popover content={desc}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          /*最近更新时间*/
          title: this.$t('supplier.management.lastUpdate'),
          key: 'webUpdateDate',
          dataIndex: 'webUpdateDate',
          width:100,
          align:"center",
          render: desc => (
            <span>
              <Popover content={moment(new Date(desc)).format('YYYY-MM-DD')}>
                {desc ? moment(new Date(desc)).format('YYYY-MM-DD') : '-'}
              </Popover>
            </span>
          ),
        },
        {
          /*状态*/
          title: this.$t('common.column.status'),
          key: 'venType',
          dataIndex: 'venType',
          width:90,
          align:"center",
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
          /*主账户*/
          title: this.$t('supplier.main.account'),
          key: 'primaryFlag',
          dataIndex: 'primaryFlag',
          width:90,
          align:"center",
          render: desc => <span>{desc ? '是' : '否'}</span>,
        },
        {
          /*操作*/
          title: this.$t('common.operation'),
          key: 'operate',
          dataIndex: 'operate',
          width:80,
          align:"center",
          render: (text, record, index) => (
            <span>
              {/*如果是 TENANT且公司模式公司模式  就不能编辑*/}
              {/*{(!this.props.main.tenantMode && this.props.match.params.source === "TENANT") ? this.$t("common.edit") : <a href="#" onClick={(e) => this.handleUpdate(e, record, index)}>{this.$t('common.edit')}</a>}*/}
              {
                <a onClick={e => this.handleUpdate(e, record, index)}>
                  {this.$t('common.edit')}
                </a>
              }
            </span>
          ),
        },
      ],
    };
  }

  componentWillMount() {
    // let query = this.props.location.query;
    // console.log(query)
    // console.log(this.props.location)

    let params = this.props.match.params;
    //根据id查完整供应商信息
    vendorService.getVendorInfoById(params.id).then(response => {
      response.data.venType = (response.data.venType === 1001);
      this.setState(
        {
          vendorInfo: response.data,
        },
        this.getList
      );
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
    vendorService.getBanks(params).then(response => {
      let i = 0;
      response.data.body.map(item => {
        item.key = item.id;
        item.ordinalNumber = pagination.page * pagination.pageSize + ++i;
      });
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
      title: this.$t('supplier.add.bank.account'),
      visible: true,
      params: { vendorId: this.props.match.params.id,
        status: 'new',},
    };
    this.setState({
      slideFrame,
    });
  };

  handleUpdate = (e, record, index) => {
    let slideFrame = {
      title: this.$t('supplier.update.bank.account'),
      visible: true,
      params: { vendorId: this.props.match.params.id,
        status: 'editor',
        ...record },
    };
    console.log(slideFrame)
    this.setState({
      slideFrame,
    });
  };

  handleOnClose = () => {
    let slideFrame = {
      title: '',
      visible: false,
      params: {},
    };
    this.setState({
      slideFrame,
    });
  };

  handleAfterClose = params => {
    let slideFrame = {
      title: '',
      visible: false,
      params: {},
    };
    this.setState(
      {
        slideFrame,
      },
      () => {
        if (params) {
          this.getList();
        }
      }
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

  //返回
  handleBack = () => {
    //this.context.router.push(menuRoute.getRouteItem('supplier-maintain', 'key').url)
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/supplier-maintain`,
      })
    );
  };

  handleChange = () => {};

  render() {
    const {
      loading,
      vendorInfo,
      infoList,
      data,
      pagination,
      updateState,
      columns,
      slideFrame,
    } = this.state;

    return (
      <div className="supplier-bank-account">
        <BasicInfo
          infoList={infoList}
          infoData={vendorInfo}
          handelEvent={() => {}}
          updateHandle={() => {}}
          updateState={updateState}
        />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t('common.total', { total: `${pagination.total}` })}
          </div>{' '}
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button
              type="primary"
              disabled={!true && this.props.match.params.source === 'TENANT'}
              onClick={this.handleCreate}
            >
              {/*新 建*/}
              {this.$t('common.create')}
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
          size="middle"
        />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />
          {this.$t('common.back')}
        </a>
        <SlideFrame title={slideFrame.title} show={slideFrame.visible} onClose={this.handleOnClose}>
          <NewUpdateBankAccount onClose={this.handleAfterClose} params={slideFrame.params} />
          {console.log("------")}
          {console.log(slideFrame.params)}
        </SlideFrame>
      </div>
    );
  }
}

export default connect(
  null,
  null,
  null,
  { withRef: true }
)(SupplierBankAccount);
