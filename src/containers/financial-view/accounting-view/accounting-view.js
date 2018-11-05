/**
 * created by zk on 2018/04/18
 */
import React from 'react'
import {connect} from 'dva'

import {
  Form,
  Select,
  Breadcrumb,
  Tag,
  Divider,
  Input,
  DatePicker,
  Tabs,
  Button,
  Menu,
  Radio,
  Dropdown,
  Row,
  Col,
  Spin,
  Table,
  Timeline,
  message,
  Popover,
  Popconfirm,
  Icon
} from 'antd';

import SearchArea from 'widget/search-area';
import config from 'config'
import accountingViewService from 'containers/financial-view/accounting-view/accounting-view.service'
import baseService from 'share/base.service'
import 'styles/financial-view/accounting-view/accounting-view.scss'
//import SlideFrame from 'components/slide-frame'

import moment, {now} from "moment"
import FileSaver from "file-saver";

class AccountingView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      exportLoading: false,
      data: [],
      x: 0,
      searchForm: [
        {
          type: 'select',
          id: 'setOfBooksId',
          label: this.$t({id: "accounting.view.setOfBooks"}),
          options: [],
          isRequired: true,
          labelKey: 'setOfBooksCode',
          valueKey: 'setOfBooksId',
          disabled: !this.props.tenantMode,
          event: 'setOfBooksId',
          defaultValue: this.props.company.setOfBooksId
        },
        {
          type: 'list', isRequired:false,selectorItem:{
            title: "选择公司",
            url: `${config.baseUrl}/api/company/dto/by/tenant`,
            searchForm: [
              { type: 'input', id: 'companyCode', label: "公司代码" },
              { type: 'input', id: 'name', label: "公司名称" },
            ],
            columns: [
              { title: "公司代码", dataIndex: 'companyCode' },
              { title: "公司名称", dataIndex: 'name' }
            ],
            key: 'id'},
          id: 'companyId',listExtraParams: {"tenantId": this.props.company.tenantId, 'setOfBooksId': ''}, label: this.$t({id: "accounting.view.company"}), labelKey: "name", valueKey: "id", single: false
        },
        {
          type: 'items', id: 'accountCodeRange', items: [
            {
              type: 'list',
              listType: "select_setOfBooks_accounts",
              id: 'accountCodeFrom',
              label: this.$t({id: "accounting.view.accountCodeFrom"}),
              labelKey: "accountCode",
              valueKey: "accountCode",
              single: true,
              disabled: true,
              listExtraParams: {'setOfBooksId': ''}
            },
            {
              type: 'list',
              listType: "select_setOfBooks_accounts",
              id: 'accountCodeTo',
              label: this.$t({id: "accounting.view.accountCodeTo"}),
              labelKey: "accountCode",
              valueKey: "accountCode",
              single: true,
              disabled: true,
              listExtraParams: {'setOfBooksId': ''}
            }
          ]
        },
        {
          type: 'value_list',
          id: 'sourceTransactionType',
          label: this.$t({id: "accounting.view.sourceTransactionType"}),
          options: [],
          valueListCode: 2208
        },
        {
          type: 'items', id: 'accountingDateRange', items: [
            {type: 'date', id: 'accountingDateFrom', label: this.$t({id: "accounting.view.accountingDateFrom"})},
            {type: 'date', id: 'accountingDateTo', label: this.$t({id: "accounting.view.accountingDateTo"})}
          ]
        },
        {type: 'input', id: 'transactionNumber', label: this.$t({id: "accounting.view.transactionNumber"})},
        {
          type: 'items', id: 'transactionDateRange', items: [
            {
              type: 'date',
              id: 'transactionDateFrom',
              label: this.$t({id: "accounting.view.transactionDateFrom"})
            },
            {type: 'date', id: 'transactionDateTo', label: this.$t({id: "accounting.view.transactionDateTo"})}
          ]
        },
        {
          type: 'select',
          id: 'currencyCode',
          label: this.$t({id: "accounting.view.currencyCode"}),
          options: [],
          labelKey: 'currencyCode',
          valueKey: 'currencyCode'
        }
      ],
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      columns: [],
      searchParams: {
        setOfBooksId: this.props.company.setOfBooksId
      },
    }
  }

  //初始化会计凭证基础列
  setAccountingBasicField = (setOfBooksId) => {
    let x = 2190;
    let columns = [
      {
        title: this.$t({id: "accounting.view.journalHeadDescription"}),
        dataIndex: "description",
        key: "description",
        align: "center",
        width: 120,
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.journalLineDescription"}),
        width: 120,
        dataIndex: "lineDescription",
        key: "lineDescription",
        align: "center",
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.setOfBooks"}),
        align: "center",
        width: 180,
        dataIndex: "setOfBooksName",
        key: "setOfBooksName",
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.company"}),
        align: "center",
        width: 180,
        dataIndex: "companyName",
        key: "companyName",
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.department"}),
        align: "center",
        width: 180,
        dataIndex: "departmentName",
        key: "departmentName",
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.sourceTransactionType"}),
        align: "center",
        width: 120,
        dataIndex: "sourceTransactionTypeDesc",
        key: "sourceTransactionTypeDesc",
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.transactionNumber"}),
        align: "center",
        width: 150,
        dataIndex: "transactionNumber",
        key: "transactionNumber",
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.accountingDate"}),
        align: "center",
        width: 100,
        dataIndex: "accountingDate",
        key: "accountingDate",
        render: value => moment(value).format('YYYY-MM-DD')
      },
      {
        title: this.$t({id: "accounting.view.transactionDate"}),
        align: "center",
        width: 100,
        dataIndex: "transactionDate",
        key: "transactionDate",
        render: value => moment(value).format('YYYY-MM-DD')
      },
      {
        title: this.$t({id: "accounting.view.accountCode"}),
        align: "center",
        width: 120,
        dataIndex: "accountCode",
        key: "accountCode",
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        title: this.$t({id: "accounting.view.currencyCode"}),
        align: "center",
        width: 100,
        dataIndex: "currencyCode",
        key: "currencyCode"
      },
      {
        title: this.$t({id: "accounting.view.exchangeRate"}),
        align: "center",
        width: 100,
        dataIndex: "exchangeRate",
        key: "exchangeRate"
      },
      {
        title: this.$t({id: "accounting.view.enteredAmountDr"}),
        width: 110,
        dataIndex: 'enteredAmountDr',
        render: this.filterMoney
      },
      {
        title: this.$t({id: "accounting.view.enteredAmountCr"}),
        width: 110,
        dataIndex: 'enteredAmountCr',
        render: this.filterMoney
      },
      {
        title: this.$t({id: "accounting.view.functionalAmountDr"}),
        width: 110,
        dataIndex: 'functionalAmountDr',
        render: this.filterMoney
      },
      {
        title: this.$t({id: "accounting.view.functionalAmountCr"}),
        width: 110,
        dataIndex: 'functionalAmountCr',
        render: this.filterMoney
      }];
    this.setState({
      columns: columns,
      x: x
    }, () => {
      //设置科目段信息
      accountingViewService.getAccountingSegment(setOfBooksId).then(res => {
        let columnsSegment = this.state.columns;
        let xSegment = this.state.x;
        res.data.map(c => {
          columnsSegment.push({
            title: c.segmentName,
            dataIndex: c.segmentClassField,
            key: c.segmentClassField,
            tempColumn: true,
            align: "center",
            width: 130,
            render: recode => (
              <Popover content={recode}>
                {recode}
              </Popover>)
          });
        });
        this.setState({
          columns: columnsSegment,
          x: xSegment + (res.data.length) * 130
        }, () => {
          //设置成本中心信息
          accountingViewService.getAccountingCostCenter(setOfBooksId).then(res => {
            let columnsCostCenter = this.state.columns;
            let xCostCenter = this.state.x;
            res.data.map(c => {
              if (c.sequenceNumber) {
                let fieldName = `dimension${c.sequenceNumber}Name`;
                columnsCostCenter.push({
                  title: c.name,
                  dataIndex: fieldName,
                  key: fieldName,
                  tempColumn: true,
                  align: "center",
                  width: 130,
                  render: recode => (
                    <Popover content={recode}>
                      {recode}
                    </Popover>)
                });
              }
            });
            this.setState({columns: columnsCostCenter, x: xCostCenter + (res.data.length) * 130},() => {
              this.getList();
            });
          });
        });
      });
    });
  }


  //获取账套信息
  setSetOfBooksOptions = () => {
    baseService.getSetOfBooksByTenant().then((res) => {
      let searchForm = this.state.searchForm;
      if (this.props.tenantMode) {
        this.setParameterSetOfBooksId(this.props.company.setOfBooksId);
        searchForm.map(row => {
          if (row.id === 'companyId') {
            row.disabled = false;
          }
          if (row.id === 'accountCodeRange') {
            row.items[0].disabled = false;
            row.items[1].disabled = false;
          }
        });
      }
      const options = [];
      res.data.map((item) => {
        options.push({
          label: item.setOfBooksCode + ' - ' + item.setOfBooksName,
          value: String(item.id),
        })
      })
      searchForm.map((item) => {
        if (item.id === "setOfBooksId") {
          item.options = options;
          return item;
        }
      })
      this.setState({
        searchForm: searchForm
      })
    })
  }

  //获取币种信息
  setCurrencyOptions = () => {
    this.service.getCurrencyList().then((res) => {
      let searchForm = this.state.searchForm;
      const options = [];
      res.data.map((item) => {
        options.push({
          label: item.currency,
          value: String(item.currency),
        })
      })
      searchForm.map((item) => {
        if (item.id === "currencyCode") {
          item.options = options;
          return item;
        }
      })
      this.setState({
        searchForm: searchForm
      })
    })
  };

  //设置公司、科目的查询参数
  setParameterSetOfBooksId(setOfBooksId) {
    let searchForm = this.state.searchForm;
    searchForm.map((item) => {
      if (item.id === "companyId") {
        let listExtraParams = item["listExtraParams"];
        listExtraParams.setOfBooksId = setOfBooksId;
        item["listExtraParams"] = listExtraParams;
        // item["disabled"]=false;
        return item;
      }
      if (item.id === "accountCodeRange") {
        let listExtraParams = item.items[0]["listExtraParams"];
        listExtraParams.setOfBooksId = setOfBooksId;
        item.items[0]["listExtraParams"] = listExtraParams;
        // item["disabled"]=false;
        let listExtraParams1 = item.items[1]["listExtraParams"];
        listExtraParams1.setOfBooksId = setOfBooksId;
        item.items[1]["listExtraParams"] = listExtraParams1;
        return item;
      }

    })
    this.setState({
      searchForm: searchForm
    })
  }

  componentWillMount() {
    this.setAccountingBasicField(this.props.company.setOfBooksId);
    this.setSetOfBooksOptions();
    this.setCurrencyOptions();
    // this.searchEventHandle("setOfBooksId",this.props.company.setOfBooksId);
  }


  //获取数据
  getList = () => {
    let searchParams = this.state.searchParams;
    searchParams.tenantId = this.props.company.tenantId;
    searchParams.page = this.state.pagination.page;
    searchParams.size = this.state.pagination.pageSize;
    let company = "";
    let companyId = searchParams['companyId'];
    if(companyId){
      for(var i = 0;i < companyId.length; i++){
        if(company === ""){
          company = companyId[i];
        }else{
          company = company + ',' + companyId[i];
        }
      }
      searchParams.companyId = company;
    }
    accountingViewService.getAccountingMessage(searchParams).then((response) => {
      if (response.status === 200) {
        response.data.map((item) => {
          item.key = item.id;
        });
        this.setState({
          loading: false,
          data: response.data,
          pagination: {
            total: Number(response.headers['x-total-count']),
            current: this.state.pagination.current,
            page: this.state.pagination.page,
            pageSize: this.state.pagination.pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
          },
        });
      }
    })
  }

  // 导出数据
  handleDownLoad = () =>{
    let searchParams = this.state.searchParams;
    searchParams.tenantId = this.props.company.tenantId;
    let company = "";
    let companyId = searchParams['companyId'];
    if(companyId) {
      for (var i = 0; i < companyId.length; i++) {
        if (company === "") {
          company = companyId[i];
        } else {
          company = company + ',' + companyId[i];
        }
      }
      searchParams.companyId = company;
    }
    // let hide = message.loading(this.props.intl.this.$t({id: "importer.spanned.file"}/*正在生成文件..*/));
    this.setState({ exportLoading: true });
    accountingViewService.exportAccountingMessage(searchParams).then(response=>{
      let b = new Blob([response.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      let name = this.$t({id:'accounting.view.export.fileName'});
      FileSaver.saveAs(b, `${name}.xlsx`);
      this.setState({ exportLoading: false });
      message.success(this.$t({id:'accounting.view.export.success'}));
    }).catch((e) => {
      this.setState({ exportLoading: false });
      if (e.response) {
        message.error(`${this.$t({id:"accounting.view.export.failed"})}，${e.response.message}`);
      }
    })
  };

  //获取选择的账套
  searchEventHandle = (e, value) => {
    if (e === "setOfBooksId") {
      this.setState({searchParams: {setOfBooksId: value}}, () => {
        if (value) {
          this.setAccountingBasicField(value);
          this.setParameterSetOfBooksId(value);
          // this.getAccountingSegment(value);
          // this.getAccountingCostCenter(value);
          let searchForm = this.state.searchForm;
          searchForm.map(row => {
            if (row.id === 'companyId') {
              row.disabled = false;
            }
            if (row.id === 'accountCodeRange') {
              row.items[0].disabled = false;
              row.items[1].disabled = false;
            }
          });
          this.setState({
            searchForm: searchForm,
          }, () =>{
            this.getList();
          });
        } else {
          let searchForm = this.state.searchForm;
          searchForm.map(row => {
            this.formRef._reactInternalInstance._renderedComponent._instance.setValues({companyId: ''});
            this.formRef._reactInternalInstance._renderedComponent._instance.setValues({accountCodeFrom: ''});
            this.formRef._reactInternalInstance._renderedComponent._instance.setValues({accountCodeTo: ''});
            if (row.id === 'companyId') {
              row.disabled = true;
            }
            if (row.id === 'accountCodeRange') {
              row.items[0].disabled = true;
              row.items[1].disabled = true;
            }
          });
          this.setState({
            searchForm: searchForm,
            data: [],
            pagination: {
              current: 1,
              page: 0,
              total: 0,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }
          });
        }
      });
    }
  }

  handleSearch = (values) => {
    values.accountingDateFrom = values.accountingDateFrom ? moment(values.accountingDateFrom).format('YYYY-MM-DD') : null;
    values.accountingDateTo = values.accountingDateTo ? moment(values.accountingDateTo).format('YYYY-MM-DD') : null;
    values.transactionDateFrom = values.transactionDateFrom ? moment(values.transactionDateFrom).format('YYYY-MM-DD') : null;
    values.transactionDateTo = values.transactionDateTo ? moment(values.transactionDateTo).format('YYYY-MM-DD') : null;
    values.accountCodeFrom && values.accountCodeFrom.length > 0 && (values.accountCodeFrom = values.accountCodeFrom[0].accountCode);
    values.accountCodeTo && values.accountCodeTo.length > 0 && (values.accountCodeTo = values.accountCodeTo[0].accountCode);
    this.setState({
      searchParams: values,
      loading: true,
      pagination: {
        current: 1,
        page: 0,
        pageSize: this.state.pagination.pageSize,
        showSizeChanger: true,
        showQuickJumper: true,
      },
    }, () => {
      this.getList();
    })
  };

  clearEventHandle = () => {
    this.setParameterSetOfBooksId(this.props.company.setOfBooksId);
    this.setState({
      searchParams: {
        setOfBooksId: this.props.company.setOfBooksId
      }
    }, () => {
      this.setState({
        data: [],
        pagination: {
          current: 1,
          page: 0,
          total: 0,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }
      });
    })
  }

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState({
      pagination: {
        current: pagination.current,
        page: pagination.current - 1,
        pageSize: pagination.pageSize,
        total: pagination.total
      }
    }, () => {
      this.getList();
    })
  };


  render() {
    const {loading, exportLoading, data, searchForm, pagination, columns, showSlideFrame, nowItem, slideFrameTitle, x} = this.state;

    return (
      <div className="accounting-view">
        <h3 className="header-title">{this.$t({id: "menu.accounting-view"})}</h3> {/* 会计分录查询 */}
        <SearchArea searchForm={searchForm}
                    submitHandle={this.handleSearch}
                    eventHandle={this.searchEventHandle}
                    clearHandle={this.clearEventHandle}
                    wrappedComponentRef={(inst) => this.formRef = inst}/>
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleDownLoad} loading={exportLoading}>导出搜索数据</Button>
          </div>
          <div
            className="table-header-title">{this.$t({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
        </div>
        <Table
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={this.onChangePager}
          columns={columns}
          scroll={{x: x}}
          size="middle"
          bordered/>
      </div>
    )
  }
}

// CashFlowItem.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    company: state.user.company,
    tenantMode:  true//state.main.tenantMode,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingView);
