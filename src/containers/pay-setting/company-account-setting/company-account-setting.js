import { messages } from 'utils/utils';
import React from 'react';
import { connect } from 'dva'

import { routerRedux } from 'dva/router';
import config from 'config'


import { Form, Button, Select, Row, Col, Input, Switch, Icon, Badge, Tabs, Table, message, Popover } from 'antd'


import SearchArea from 'widget/search-area'
import companyAccountSettingService from './company-account-setting.service'



class WrappedCompanyAccountSetting extends React.Component {

  constructor(props) {
    super(props);


    this.state = {
      showImportFrame: false,
      updateState: false,
      saving: false,
      loading: true,
      editing: false,
      infoData: {},
      selectedRowKeys: [],
      updateParams: {},
      typeData: {},
      data: [],
      searchForm: [
        {
          type: 'select', colSpan: 6, id: 'setOfBooksId', label: messages('company.setOfBooksName'), options: [],
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get', labelKey: 'setOfBooksName', valueKey: 'id',
          renderOption: data => `${data.setOfBooksCode} - ${data.setOfBooksName}`

        },/*账套*/
        { type: 'input', colSpan: 6, id: 'companyCode', label: messages('bank.account.companyCode') }, /*公司代码*/
        { type: 'input', colSpan: 6, id: 'companyName', label: messages('bank.account.companyName') }, /*公司名称*/
        { type: 'input', colSpan: 6, id: 'companyBankName', label: messages('bank.account.bankAccountName') }, /*银行账户名称*/
        { type: 'input', colSpan: 6, id: 'companyBankCode', label: messages('bank.account.bankAccountNumber') } /*银行账户账号*/
      ],
      searchParams: {},
      columns:
        [
          {
            title: messages('company.setOfBooksName'), dataIndex: 'setOfBooksId', width: '16%', render: (remark, record, index) => (
              <Popover content={record.setOfBooksCode + '-' + record.setOfBooksName}>
                {record.setOfBooksCode}-{record.setOfBooksName}
              </Popover>)
          },
          {
            title: messages('bank.account.companyCode'), dataIndex: 'companyCode', width: '16%', render: (remark, record, index) => (
              <Popover content={record.companyCode}>
                {record.companyCode}
              </Popover>)
          },
          {
            title: messages('bank.account.companyName'), dataIndex: 'companyName', width: '16%', render: (remark, record, index) => (
              <Popover content={record.companyName}>
                {record.companyName}
              </Popover>)
          },
          {
            title: messages('bank.account.bankName'), dataIndex: 'bankName', width: '16%', render: (remark, record, index) => (
              <Popover content={record.bankName}>
                {record.bankName}
              </Popover>)
          },
          {
            title: messages('bank.account.country'), dataIndex: 'countryCode', width: '16%', render: (remark, record, index) => (
              <Popover content={record.country}>
                {record.country}
              </Popover>)
          },
          {
            title: messages('bank.account.opening'), dataIndex: 'city', width: '16%', render: (remark, record, index) => (
              <Popover content={record.province + '/' + record.city}>
                {record.province}/{record.city}
              </Popover>)
          },
          {
            title: messages('bank.account.bankAddress'), dataIndex: 'bankAddress', width: '18%', render: (remark, record, index) => (
              <Popover content={record.bankAddress}>
                {record.bankAddress}
              </Popover>)
          },
          {
            title: messages('bank.account.bankAccountName'), dataIndex: 'bankAccountName', width: '18%', render: (remark, record, index) => (
              <Popover content={record.bankAccountName}>
                {record.bankAccountName}
              </Popover>)
          },
          {
            title: messages('bank.account.bankAccountNumber'), dataIndex: 'bankAccountNumber', width: '18%', render: (remark, record, index) => (
              <Popover content={record.bankAccountNumber}>
                {record.bankAccountNumber}
              </Popover>)
          },
          { title: messages('bank.account.currencyCode'), dataIndex: 'currencyName', width: '16%' },
          {
            title: messages('bank.account.remark'), dataIndex: 'remark', width: '16%', render: remark => (
              <Popover content={remark}>
                {remark}
              </Popover>)
          },
          {
            title: messages('common.operation'), dataIndex: 'operation', width: '14%',
            render: (text, record) => (
              <span>
                <a style={{ marginRight: 10 }} onClick={(e) => this.rowClick(e, record)}>{messages('company.maintain.detail')}</a>
              </span>)
          }
        ],
      rowSelection: {
        type: 'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
      },
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      nowStatus: 'BANK',
      showListSelector: false,
      newData: [],
      bankAccountPageDetail: '/pay-setting/company-account-setting/bank-account-detail/:companyBankId',              //银行账户详情
    }
  }

  eventHandle = (type, value) => {
    let searchForm = this.state.searchForm;
    this.formRef.setValues({
    })
    this.setState({ searchForm })
  };

  componentWillMount() {

    //let forms = this.state.searchForm;
    /*if (!this.props.main.tenantMode) {
      forms[0] = {
        type: "input",
        id: "setOfBooksId",
        label: messages('company.setOfBooksName'),
        defaultValue: this.props.company.setOfBooksName,
        disabled: true
      },
        forms[1] = {
          type: "input",
          id: "companyCode",
          label: messages('bank.account.companyCode'),
          defaultValue: this.props.company.companyCode,
          disabled: true
        },
        forms[2] = {
          type: "input",
          id: "companyName",
          label: messages('bank.account.companyName'),
          defaultValue: this.props.company.name,
          disabled: true
        }
    }*/   // todo 不是租户模式暂不处理，等待后续要求
    //this.setState({ searchForm: forms });

    // const { company } = this.props;
    // const { searchForm, searchParams } = this.state;
    // searchForm[0].defaultValue = company.setOfBooksId;
    // searchForm[0].options = [{
    //   temp: true,
    //   label: company.setOfBooksName + ' - ' + company.setOfBooksCode,
    //   value: company.setOfBooksId
    // }];
    // searchParams.setOfBooksId = company.setOfBooksId;
    this.getList(this.state.nowStatus);
  }

  //根据companyCode获取公司
  getCompanyByCode = (companyCode) => {
    companyAccountSettingService.getCompanyByCode(companyCode).then((response) => {
      console.log(response.data);
      this.setState({
        infoData: response.data
      })
    })
  }

  getList = (key) => {

    let params = this.state.searchParams;
    // let url = `${config.baseUrl}/api/CompanyBank/selectByCompanyId?page=${this.state.page}&size=${this.state.pageSize}${this.props.main.tenantMode ? "" : "&companyId=" + this.props.company.id}`;
    // for (let paramsName in params) {
    //   url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
    // }
    // return httpFetch.get(url).then(response => {
    // return companyAccountSettingService.getList(url).then(response => {
    //let temp = this.props.main.tenantMode ? "" : "&companyId=" + this.props.company.id; // todo 等待后续处理
    let temp = "";
    return companyAccountSettingService.getList(this.state.page, this.state.pageSize, temp, params).then(response => {
      response.data.map((item, index) => {
        item.key = item.id ? item.id : index;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1,
          pageSizeOptions : ['10','20','30','40'],
          showSizeChanger: true,
          onShowSizeChange : this.onChangePageSize,
          showQuickJumper:true,
          showTotal:(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})
        }
      })
    })
  };
  //每页多少条
  onChangePageSize =(page, pageSize) =>{
    if (page - 1 !== this.state.page || pageSize !== this.state.pageSize) {
      this.setState({ page: page - 1,pageSize:pageSize ,loading: true}, () => {
        this.getList(this.state.nowStatus);
      })
    }
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true,
      }, () => {
        this.getList(this.state.nowStatus);
      })
  };

  //点击
  onChangeTabs = (key) => {
    this.setState({
      nowStatus: key,
      loading: true,
      data: [],
      pagination: {
        total: 0
      },
      page: 0
    }, () => {
      this.getList(key);
    })
  };


  showImport = (value) => {
    this.setState({
      showImportFrame: value
    })
  }

  CancelHandle = () => {
    this.showImport(false)
  }

  rowClick = (e, record) => {
    //跳转到详情页面
    let path = this.state.bankAccountPageDetail.replace(":companyBankId", record.id);
    this.props.dispatch(
      routerRedux.push({
        pathname: path
      })
    );
  }

  //搜索
  search = (values) => {
    /*let param = {};
    if (!this.props.main.tenantMode) {
      param.companyBankName = values.companyBankName;
      param.companyBankCode = values.companyBankCode;
    }
    this.setState({ searchParams: this.props.main.tenantMode ? values : param }, () => {
      this.getList()
    })*/ // todo 后续处理
    this.setState({ searchParams: values }, () => {
      this.getList()
    })
  };

  clear = () => {
    this.setState({ searchParams: {} }, () => {
      this.getList();
    })

  };

  render() {
    const { selectedRowKeys, infoData, loading, pagination, nowStatus, data, showListSelector, saving, newData, updateState, editing, showSlideFrame, updateParams, searchForm, columns } = this.state;

    return (
      <div>
        <SearchArea searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}
          maxLength={4}
          wrappedComponentRef={(inst) => this.formRef = inst} />
        <div className="table-header"/>
        <Table columns={columns}
               rowKey={record => record.id}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               bordered
               size="middle"
        />
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}

const CompanyAccountSetting = Form.create()(WrappedCompanyAccountSetting);

export default connect(mapStateToProps, null, null, { withRef: true })(CompanyAccountSetting);
