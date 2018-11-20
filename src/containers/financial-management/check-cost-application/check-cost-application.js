import React from 'react'
import { connect } from 'dva'
import { Form, Button, Table, message, Badge, Popover } from 'antd'
import moment from 'moment'
import config from 'config'
import FileSaver from 'file-saver'
import constants from 'share/constants'
import SearchArea from 'widget/search-area'
import costApplicationService from 'containers/financial-management/check-cost-application/check-cost-application.service'
import requestService from 'containers/request/request.service'
import 'styles/financial-management/finance-view.scss'
import CostCenterSearchForm from 'widget/Template/cost-center-search-form/cost-center-search-form'

import { routerRedux } from 'dva/router';

class CheckCostApplication extends React.Component {
  constructor(props) {
    super(props);
    // const {this.$t} =
    this.state = {
      loading: false,
      exportLoading: false,
      status: [
        { label: this.$t('finance.view.search.submitted'/*审批中*/), value: '1002', state: 'processing' },
        { label: this.$t('finance.view.search.pass'/*已通过*/), value: '1003', state: 'success' },
        { label: this.$t('finance.view.search.reject'/*已驳回*/), value: '1001', state: 'error' }
      ],
      searchForm: [
        {
          type: 'combobox', id: 'userOID', label: this.$t('finance.view.search.application'),
          placeholder: this.$t('common.please.enter') + this.$t('finance.view.search.application'),
          options: [], searchUrl: `${config.baseUrl}/api/search/users/all`,
          method: 'get', searchKey: 'keyword', labelKey: 'fullName', valueKey: 'userOID',
          renderOption: option => (`${option.employeeID}-${option.fullName}${(option.status != 1001 ? `(${this.$t('check.cost.application.search.leaved')})` : '')}`)
        }, //申请人姓名/工号
        { type: 'input', id: 'businessCode', label: this.$t('check.cost.application.search.businessCode'/*单号*/) },
        {
          type: 'items', id: 'dateRange', items: [
            { type: 'date', id: 'beginDate', label: this.$t('finance.view.search.dateFrom'), defaultValue: moment().subtract(1, 'month') }, //提交日期从
            { type: 'date', id: 'endDate', label: this.$t('finance.view.search.dateTo'), defaultValue: moment() } //提交日期至
          ]
        },
        {
          type: 'multiple',
          id: 'legalEntity',
          label: this.$t('finance.audit.legalEntity'/*法人实体*/),
          options: [],
          getUrl: `${config.baseUrl}/api/finance/role/legalEntity/query?page=0&size=100`,
          method: 'get',
          labelKey: 'entityName',
          valueKey: 'companyReceiptedOID',
          listKey: "rows"
        },
        {
          type: 'checkbox', id: 'status', label: this.$t('common.column.status'), colSpan: 24, options: [ //状态
            { label: this.$t('finance.view.search.submitted'), value: 'submitted' }, //审批中
            { label: this.$t('finance.view.search.pass'), value: 'approval_pass' },  //已通过
            { label: this.$t('finance.view.search.reject'), value: 'approval_reject' }, //已驳回
          ]
        },
        // {
        //   type: 'cost-center',
        //   id: 'searchCostCenterCommands',
        //   label: this.$t('finance.audit.cost.center')//成本中心
        // },
      ],
      checkboxListForm: [
        {
          id: 'formOIDs', items: [
            { label: this.$t('documentType.expense.request'/*费用申请单*/), key: 'cost', options: [] }
          ]
        }
      ],
      searchParams: {},
      columns: [
        { title: this.$t('common.sequence'), dataIndex: 'index', width: '7%', render: (text, record, index) => (this.state.page * 10 + index + 1) },  //序号
        { title: this.$t('finance.view.search.jobNumber'/*工号*/), dataIndex: 'employeeID' },
        { title: this.$t('finance.view.search.applicant'/*申请人*/), dataIndex: 'applicant', render: value => <Popover content={value}>{value}</Popover> },
        {
          title: this.$t('finance.view.search.submitDate'/*提交日期*/), dataIndex: 'lastSubmittedDate', render: (date, record) =>
            date ? moment(date).format('YYYY-MM-DD') : moment(record.createDate).format('YYYY-MM-DD'), sorter: true
        },
        { title: this.$t('finance.view.search.documentType'/*单据类型*/), dataIndex: 'formName', render: value => <Popover content={value}>{value}</Popover> },
        {
          title: this.$t('finance.view.search.documentNo'/*单号*/), dataIndex: 'businessCode', sorter: true, render: (value, record) => (
            <Popover content={record.parentBusinessCode ? `${record.parentBusinessCode} - ${value}` : value}>
              {record.parentBusinessCode ? `${record.parentBusinessCode} - ${value}` : value}
            </Popover>
          )
        },
        { title: this.$t('finance.view.search.currency'/*币种*/), dataIndex: 'currencyCode', width: '7%' },
        { title: this.$t('finance.view.search.totalAmount'/*总金额*/), dataIndex: 'totalAmount', render: this.renderMoney, sorter: true },
        {
          title: this.$t('common.column.status'), dataIndex: 'status', width: this.props.language.local === 'zh_CN' ? '8%' : '13%', render: (value, record) => {
            let applicationType = '';
            (+record.entityType === 1001) && (applicationType = 2005);//申请单下的applicationType是2005
            return (
              <Badge text={constants.getTextByValue(String(value + '' + applicationType), 'documentStatus') ||
                constants.getTextByValue(String(value + '' + record.rejectType), 'documentStatus') ||
                constants.getTextByValue(String(value), 'documentStatus')}
                status={constants.getTextByValue(String(value + '' + applicationType), 'documentStatus', 'state') ||
                  constants.getTextByValue(String(value + '' + record.rejectType), 'documentStatus', 'state') ||
                  constants.getTextByValue(String(value), 'documentStatus', 'state')} />
            )
          }
        },
        //状态
      ],
      data: [],
      pagination: {
        total: 0
      },
      sort: '',
      pageSize: 10,
      page: 0,
      haveLoan: true,    //搜索单据包含借款单
      haveExpense: true, //搜索单据包含报销单
    }
  }

  componentWillMount() {
    let params = [
      { factorCode: "COMPANY", factorValue: this.props.user.companyId },
      { factorCode: "SET_OF_BOOKS", factorValue: this.props.company.setOfBooksId }
    ];
    requestService.searchPrintFree(this.props.user.tenantId, params).then(res => {
      if (res.data.rows[0].hitValue === 'Y') {
        let search = this.state.searchForm;
        search.push({
          type: 'select',
          id: 'printFree',
          label: this.$t('finance.view.column.weatherPrint')/*报销单是否免打印*/,
          options: [
            { label: this.$t('finance.view.column.all')/*全部*/, value: null },
            { label: this.$t('finance.view.column.printFree')/*免打印*/, value: true },
            { label: this.$t('finance.view.column.noPrintFree')/*非免打印*/, value: false }]
        });
        let length = search.length;
        let temp = search[length - 1];
        search[length - 1] = search[length - 2];
        search[length - 2] = temp;
        this.setState({ searchForm: search });
      }
    })
  }

  componentDidMount() {
    this.getForms();
    this.getList(true)
  }
  //获取表单
  getForms = () => {
    let checkboxListForm = this.state.checkboxListForm;
    let params = {
      formTypes: 2002,
      enabledFlag: 2
    };
    //获取费用申请单
    costApplicationService.getCostTypeList(params).then(res => {
      let options = [];
      res.data.map(list => {
        options.push({ label: list.formName, value: list.formOID })
      });
      checkboxListForm[0].items.map(item => {
        item.key === 'cost' && (item.options = options)
      })
    });
    this.setState({ checkboxListForm })
  };
  getList = (firstRequest) => {
    const { page, pageSize, searchParams, sort } = this.state;
    if (firstRequest) {
      searchParams.beginDate = moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss');
      searchParams.endDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    this.setState({ loading: true });
    costApplicationService.getFinanceViewList(page, pageSize, sort, searchParams).then(res => {
      if (res.status === 200) {
        this.setState({
          loading: false,
          data: res.data,
          pagination: {
            total: Number(res.headers['x-total-count']),
            pageSize: this.state.pageSize
          }
        })
      }
    }).catch(() => {
      this.setState({ loading: false });
      message.error(this.$t('common.error1'))
    })
  };

  search = (result) => {
    let { searchParams } = this.state;
    result.beginDate && (result.beginDate = moment(result.beginDate).format('YYYY-MM-DD 00:00:00'));
    result.endDate && (result.endDate = moment(result.endDate).format('YYYY-MM-DD 23:59:59'));
    result.printFree === 'null' && (delete result.printFree);
    result.searchCorporations = result.legalEntity ? result.legalEntity : [];
    result.searchCostCenterCommands = searchParams.searchCostCenterCommands;
    this.setState({
      searchParams: result,
      page: 0,
      pagination: {
        current: 1
      }
    }, () => {
      this.getList();
    })
  };

  clear = () => {
    this.handleSearchData();
    this.setState({ searchParams: {} })
  };

  handleSearchData = () => {
    let { searchForm } = this.state;
    let dateRange = searchForm.filter(item => item.id === 'dateRange')[0];
    dateRange.items[0].defaultValue = null;
    dateRange.items[1].defaultValue = null;
    this.setState({ searchForm })
  }

  //顶部横条checkbox搜索框处理事件
  handleCheckbox = (id, checked) => {
    let searchForm = this.state.searchForm;
    let haveLoan = true;
    let haveExpense = true;
    checked.map(list => {
      if (list.key === 'cost') {
        haveLoan = list.checked ? !!list.checked.length : false
      }
    });
    if (haveLoan !== this.state.haveLoan || haveExpense !== this.state.haveExpense) {
      this.formRef.setValues({
        status: ''
      })
    }
    searchForm.map(item => {
      item.id === 'status' && item.options.map(option => {
        if (option.value === 'paid_in_process' || option.value === 'paid_finish') {
          option.disabled = (!haveLoan && haveExpense)
        }
      })
    });
    this.setState({ haveLoan, haveExpense })
  };

  //导出事件
  handleExport = () => {
    const { searchParams } = this.state;
    this.setState({ exportLoading: true });
    costApplicationService.exportFinanceList(searchParams).then(res => {
      if (res.status === 200) {
        let b = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        FileSaver.saveAs(b, this.$t('finance.view.search.exportDocument'/*单据导出*/));
        this.setState({ exportLoading: false });
        message.success(this.$t('finance.view.search.exportSuccess'/*导出成功*/))
      }
    }).catch(e => {
      this.setState({ exportLoading: false });
      let blob = new Blob([e.response.data]);
      let reader = new FileReader();
      reader.readAsText(blob);
      reader.addEventListener("loadend", () => {
        let result = reader.result;
        if (result && typeof result === 'string') {
          result = JSON.parse(result);
          if (result.message) {
            message.error(`${this.$t('finance.view.search.exportFailure')}，${result.message}`)
          } else {
            message.error(`${this.$t('finance.view.search.exportFailure')}，${result.message}`)
          }
        }
      });
      reader.addEventListener('error', () => {
        message.error(this.$t('finance.view.search.exportFailure'))
      })
    })
  };

  handleRowClick = (record) => {
    // entityType：1001（申请单
    this.props.dispatch(
      routerRedux.push({
        pathname: "/financial-management/check-cost-application/cost-application-detail/:formOID/:applicationOID".replace(':formOID', record.formOID).replace(':applicationOID', record.entityOID) + '?readOnly=true',
      })
    );
  };

  //打印
  print = (record, event) => {
    event.preventDefault();
    event.stopPropagation();
    event.cancelBubble = true;
    if (record.entityType === 1002) {
      costApplicationService.printExpenseReport(record.entityOID).then(res => {
        window.open(res.data.fileURL, '_blank');
      })
    } else {
      requestService.printLoanApplication(record.entityOID).then(res => {
        window.open(res.data.link, '_blank')
      })
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    let page = pagination.current;
    let sort = '';
    if (sorter.order) {
      sort = `${sorter.columnKey},${sorter.order === 'ascend' ? 'ASC' : 'DESC'}`
    }
    this.setState({
      page: page - 1,
      sort
    }, () => {
      this.getList();
    })
  };

  //格式化money
  renderMoney = (value) => {
    let numberString = Number(value || 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
    return <span className="money-cell">{numberString}</span>
  };

  renderExpandedRow = (title, content) => {
    return (
      <div>
        <span>{title}</span>
        {content && <span>:{content}</span>}
      </div>
    )
  };

  renderAllExpandedRow = (record) => {
    let result = [];
    if (record.printFree) {
      result.push(this.renderExpandedRow(this.$t('common.print.free'), this.$t('common.print.require')));
    }
    if (result.length > 0) {
      return result;
    } else {
      return null;
    }
  };

  changeCostCenter = (value) => {
    let searchParams = this.state.searchParams;
    searchParams.searchCostCenterCommands = value;
    this.setState({ searchParams })
  };

  render() {
    const { loading, exportLoading, searchForm, checkboxListForm, columns, data, pagination, searchParams } = this.state;
    return (
      <div className="finance-view">
        <SearchArea searchForm={searchForm}
          isExtraFields={true}
          extraFields={[
            <div>
              <div style={{ lineHeight: '28px' }}>
                {/*成本中心*/}
                {this.$t('finance.audit.cost.center')}
              </div>
              <CostCenterSearchForm title={this.$t('finance.audit.cost.center')}
                value={searchParams.searchCostCenterCommands}
                onChange={this.changeCostCenter} />
            </div>
          ]}
          maxLength={4}
          checkboxListForm={checkboxListForm}
          submitHandle={this.search}
          clearHandle={this.clear}
          checkboxChange={this.handleCheckbox}
          wrappedComponentRef={(inst) => this.formRef = inst}
        />
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleExport} loading={exportLoading}>{this.$t('finance.view.search.exportSearchData')}</Button>
            {/*导出搜索数据*/}
          </div>
          <div className="table-header-title">{this.$t('common.total', { total: pagination.total || 0 })}</div>
          {/*共多少条数据*/}
        </div>
        <Table rowKey={record => record.entityOID}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={this.handleTableChange}
          onRow={record => ({ onClick: () => { this.handleRowClick(record) } })}
          expandedRowRender={this.renderAllExpandedRow}
          rowClassName={record => record.printFree ? '' : 'finance-view-reject'}
          bordered
          size="middle" />
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
    language: state.languages
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CheckCostApplication);
