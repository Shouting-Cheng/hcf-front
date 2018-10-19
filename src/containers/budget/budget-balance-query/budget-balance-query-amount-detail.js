import {messages} from "share/common";
import React from 'react'
import { connect } from 'react-redux'


import { Table, Button, message, Popover } from 'antd'

import httpFetch from 'share/httpFetch'
import config from 'config'
import menuRoute from 'routes/menuRoute'
import FileSaver from 'file-saver'

import 'styles/budget-setting/budget-organization/new-budget-organization.scss'
import budgetBalanceService from 'containers/budget/budget-balance/budget-balance.service'

class BudgetBalanceAmountDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      exporting: false,
      page: 0,
      size: 10,
      pagination: {
        total: 0
      },
      dimensionColumns: [],
      data: [],
      titleMap: {
        J: `${messages('budget.balance.budget.amt')}${messages('budget.balance.detail')}`,
        R: `${messages('budget.balance.budget.rsv')}${messages('budget.balance.detail')}`,
        U: `${messages('budget.balance.budget.usd')}${messages('budget.balance.detail')}`
      },
      budgetJournalDetailPage: menuRoute.getRouteItem('budget-journal-detail'),
      columns: {
        J: [
          {title: messages('budget.balance.period'), dataIndex: "periodName", render: periodName => <Popover content={periodName}>{periodName}</Popover>},
          {title: messages('budget.balance.season'), dataIndex: "periodQuarter"},
          {title: messages('budget.balance.year'), dataIndex: "periodYear"},
          {title: messages('budget.balance.company'), dataIndex: "companyName", render: companyName => <Popover content={companyName}>{companyName}</Popover>},
          {title: messages('budget.balance.department'), dataIndex: "unitName", render: unitName => <Popover content={unitName}>{unitName}</Popover>},
          {title: messages('budget.balance.budget.applicant'), dataIndex: "applicantName"},
          {title: messages('budget.balance.budget.journal.type'), dataIndex: "documentType"},
          {title: messages('budget.balance.budget.journal.code'), dataIndex: "documentNumber", render: documentNumber => <Popover content={documentNumber}><a onClick={() => this.goBudgetJournal(documentNumber)}>{documentNumber}</a></Popover>},
          {title: messages('budget.balance.budget.edit.date'), dataIndex: "requisitionDate", render: requisitionDate => new Date(requisitionDate).format('yyyy-MM-dd')},
          {title: messages('budget.balance.item'), dataIndex: "itemName", render: itemName => <Popover content={itemName}>{itemName}</Popover>},
          {title: messages('common.currency'), dataIndex: "currency"},
          {title: messages('common.currency.rate'), dataIndex: "rate", render: this.filterMoney},
          {title: messages('common.base.currency.amount'), dataIndex: "functionAmount", render: functionAmount => this.filterMoney(functionAmount, 4)},
          {title: messages('common.number'), dataIndex: "quantity"},
          {title: messages('budget.balance.abstract'), dataIndex: "description", render: description => <Popover content={description}>{description}</Popover>}
        ],
        R: [
          {title: messages('budget.balance.company'), dataIndex: "companyName", render: companyName => <Popover content={companyName}>{companyName}</Popover>},
          {title: messages('budget.balance.department'), dataIndex: "unitName", render: unitName => <Popover content={unitName}>{unitName}</Popover>},
          {title: messages('budget.balance.requisitioned.by'), dataIndex: "applicantName"},
          {title: messages('budget.balance.doc.type'), dataIndex: "documentType"},
          {title: messages('budget.balance.doc.no'), dataIndex: "documentNumber",
            render: (documentNumber, record) => (
              <Popover content={documentNumber}>
                <a onClick={() => this.skipToDocumentDetail(record)}>{documentNumber}</a>
              </Popover>
            )},
          {title: messages('budget.balance.requisitioned.date'), dataIndex: "requisitionDate", render: requisitionDate => new Date(requisitionDate).format('yyyy-MM-dd')},
          {title: messages('budget.balance.doc.line.no'), dataIndex: "documentLineNum"},
          {title: messages('budget.balance.requisitioned.item'), dataIndex: "itemName",  render: itemName => <Popover content={itemName}>{itemName}</Popover>},
          {title: messages('common.currency'), dataIndex: "currency"},
          {title: messages('budget.balance.requisitioned.amount'), dataIndex: "amount", },
          {title: messages('common.tax'), dataIndex: "taxAmount"},
          {title: messages('budget.balance.tax.free.amount'), dataIndex: "saleAmount"},
          {title: messages('common.column.status'), dataIndex: "documentStatus"},
          {title: messages('budget.balance.abstract'), dataIndex: "description", render: description => <Popover content={description}>{description}</Popover>},
          {title: messages('budget.balance.reversed.status'), dataIndex: "reversedStatus"},
          {title: messages('budget.balance.period'), dataIndex: "periodName"},
          {title: messages('budget.balance.audit.status'), dataIndex: "auditStatus"}
        ],
        U: [
          {title: messages('budget.balance.company'), dataIndex: "companyName", render: companyName => <Popover content={companyName}>{companyName}</Popover>},
          {title: messages('common.department'), dataIndex: "unitName", render: unitName => <Popover content={unitName}>{unitName}</Popover>},
          {title: messages('budget.balance.reimbursed.by'), dataIndex: "applicantName"},
          {title: messages('budget.balance.doc.type'), dataIndex: "documentType"},
          {title: messages('budget.balance.doc.no'), dataIndex: "documentNumber",
            render: (documentNumber, record) => (
              <Popover content={documentNumber}>
                <a onClick={() => this.skipToDocumentDetail(record)}>{documentNumber}</a>
              </Popover>
            )},
          {title: messages('budget.balance.reimbursed.date'), dataIndex: "requisitionDate", render: requisitionDate => new Date(requisitionDate).format('yyyy-MM-dd')},
          {title: messages('budget.balance.reimbursed.item'), dataIndex: "itemName", render: itemName => <Popover content={itemName}>{itemName}</Popover>},
          {title: messages('common.currency'), dataIndex: "currency"},
          {title: messages('budget.balance.reimbursed.amount'), dataIndex: "amount",},
          {title: messages('common.column.status'), dataIndex: "documentStatus"},
          {title: messages('budget.balance.abstract'), dataIndex: "description", render: description => <Popover content={description}>{description}</Popover>},
          {title: messages('budget.balance.period'), dataIndex: "periodName"},
          {title: messages('budget.balance.audit.status'), dataIndex: "auditStatus"}
        ]
      }
    };
  }

  //跳转去单据详情页
  skipToDocumentDetail = (record) => {
    if(record.businessType === 'EXP_REPORT'){
      budgetBalanceService.searchExportByBusinessCode(record.documentNumber).then(res => {
        if(res.data.length === 0){
          message.error('未找到报销单!')
        } else {
          window.open(menuRoute.getRouteItem('expense-report-detail-view').url.replace(':expenseReportOID', res.data[0].entityOID))
        }
      })
    }
  };

  exportDetail = () => {
    const { columns, dimensionColumns, titleMap } = this.state;
    const type = this.props.params.type;
    let columnFiledMap = {};
    columns[type].map((column, index) => {
      columnFiledMap['' + index] = column.title
    });
    dimensionColumns.map(column => {
      columnFiledMap[(20 + Number(column.index)) + ''] = column.title
    });
    let queryDetailDto = this.props.params.data;
    queryDetailDto.reserveFlag = this.props.params.type;
    queryDetailDto.organizationId = this.props.organization.id;
    queryDetailDto.year = queryDetailDto.periodYear;
    let params = {
      excelVersion: '2003',
      columnFiledMap,
      queryDetailDto
    };
    let hide = message.loading(messages('importer.spanned.file')/*正在生成文件..*/);
    this.setState({ exporting: true });
    budgetBalanceService.exportDetail(params).then(res => {
      this.setState({ exporting: false });
      let b = new Blob([res.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      FileSaver.saveAs(b, `${titleMap[type]}.xls`);
      hide();
    }).catch(() => {
      this.setState({ exporting: false });
      message.error(messages('importer.download.error.info')/*下载失败，请重试*/);
      hide();
    })
  };

  componentWillReceiveProps(nextProps){
    if((!this.props.params.data && nextProps.params.data) ||
      (this.props.params.data &&
        (nextProps.params.type !== this.props.params.type || nextProps.params.data.key !== this.props.params.data.key))){
      this.getList(nextProps);
    }
  }

  goBudgetJournal = (code) => {
    this.context.router.push(this.state.budgetJournalDetailPage.url.replace(":journalCode",code))
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1
      }, () => {
        this.getList(this.props);
      })
  };

  getList = (nextProps) => {
    this.setState({ loading: true });
    let { page, size } = this.state;
    let params = nextProps.params.data;
    params.reserveFlag = nextProps.params.type;
    params.organizationId = this.props.organization.id;
    params.year = params.periodYear;
    httpFetch.post(`${config.budgetUrl}/api/budget/balance/query/results/detail?page=${page}&size=${size}`, params).then(res => {
      let data = res.data.map((item, index) => {
        item.key = index;
        return item;
      });
      this.setState({
        loading: false,
        data,
        dimensionColumns: nextProps.params.dimensionColumns,
        pagination: {
          total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      });
    }).catch(e => {
      this.setState({ loading: false });
      message.error('error')
    })
  };

  render(){
    const type = this.props.params.type;
    const { data, loading, pagination, columns, titleMap, dimensionColumns, exporting } = this.state;

    let tableColumns = [].concat(columns[type] ? columns[type] : []).concat(dimensionColumns);
    return (
      <div>
        <h3 className="header-title">{titleMap[type]}</h3>
        <div className="table-header">
          <div className="table-header-title">{messages('common.total', {total: pagination.total ? pagination.total : '0'})}</div> {/* 共total条数据 */}
        </div>
        <Table columns={tableColumns}
               dataSource={data}
               bordered
               pagination={pagination}
               loading={loading}
               size="middle"
               rowKey="key"
               scroll={{ x: `${tableColumns.length * 20}%` }}/>
        <div className="slide-footer">
          <Button onClick={() => {this.getList(this.props)}}>{messages('budget.balance.search.again')}</Button>
          <Button onClick={this.exportDetail} loading={exporting}>{messages('budget.balance.export.CVS')}</Button>
        </div>
      </div>
    )
  }

}

BudgetBalanceAmountDetail.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    organization: state.login.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetBalanceAmountDetail);
