import React from 'react'
import { connect } from 'dva'


import { Button, message, Popover } from 'antd'
import Table from 'widget/table'

import httpFetch from 'share/httpFetch'
import config from 'config'
import FileSaver from 'file-saver'
import { routerRedux } from 'dva/router';
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
        J: `${this.$t('budget.balance.budget.amt')}${this.$t('budget.balance.detail')}`,
        R: `${this.$t('budget.balance.budget.rsv')}${this.$t('budget.balance.detail')}`,
        U: `${this.$t('budget.balance.budget.usd')}${this.$t('budget.balance.detail')}`
      },
      columns: {
        J: [
          {title: this.$t('budget.balance.period'), dataIndex: "periodName", render: periodName => <Popover content={periodName}>{periodName}</Popover>},
          {title: this.$t('budget.balance.season'), dataIndex: "periodQuarter"},
          {title: this.$t('budget.balance.year'), dataIndex: "periodYear"},
          {title: this.$t('budget.balance.company'), dataIndex: "companyName", render: companyName => <Popover content={companyName}>{companyName}</Popover>},
          {title: this.$t('budget.balance.department'), dataIndex: "unitName", render: unitName => <Popover content={unitName}>{unitName}</Popover>},
          {title: this.$t('budget.balance.budget.applicant'), dataIndex: "applicantName"},
          {title: this.$t('budget.balance.budget.journal.type'), dataIndex: "documentType"},
          {title: this.$t('budget.balance.budget.journal.code'), dataIndex: "documentNumber", render: documentNumber => <Popover content={documentNumber}><a onClick={() => this.goBudgetJournal(documentNumber)}>{documentNumber}</a></Popover>},
          {title: this.$t('budget.balance.budget.edit.date'), dataIndex: "requisitionDate",
            render: requisitionDate =>requisitionDate ? new Date(requisitionDate).format('yyyy-MM-dd'):'-'
          },
          {title: this.$t('budget.balance.item'), dataIndex: "itemName", render: itemName => <Popover content={itemName}>{itemName}</Popover>},
          {title: this.$t('common.currency'), dataIndex: "currency"},
          {title: this.$t('common.currency.rate'), dataIndex: "rate", render: this.filterMoney},
          {title: this.$t('common.base.currency.amount'), dataIndex: "functionAmount", render: functionAmount => this.filterMoney(functionAmount, 4)},
          {title: this.$t('common.number'), dataIndex: "quantity"},
          {title: this.$t('budget.balance.abstract'), dataIndex: "description", render: description => <Popover content={description}>{description}</Popover>}
        ],
        R: [
          {title: this.$t('budget.balance.company'), dataIndex: "companyName", render: companyName => <Popover content={companyName}>{companyName}</Popover>},
          {title: this.$t('budget.balance.department'), dataIndex: "unitName", render: unitName => <Popover content={unitName}>{unitName}</Popover>},
          {title: this.$t('budget.balance.requisitioned.by'), dataIndex: "applicantName"},
          {title: this.$t('budget.balance.doc.type'), dataIndex: "documentType"},
          {title: this.$t('budget.balance.doc.no'), dataIndex: "documentNumber",
            render: (documentNumber, record) => (
              <Popover content={documentNumber}>
                <a onClick={() => this.skipToDocumentDetail(record)}>{documentNumber}</a>
              </Popover>
            )},
          {title: this.$t('budget.balance.requisitioned.date'), dataIndex: "requisitionDate",
            render: requisitionDate => requisitionDate ? new Date(requisitionDate).format('yyyy-MM-dd'):'-'
          },
          {title: this.$t('budget.balance.doc.line.no'), dataIndex: "documentLineNum"},
          {title: this.$t('budget.balance.requisitioned.item'), dataIndex: "itemName",  render: itemName => <Popover content={itemName}>{itemName}</Popover>},
          {title: this.$t('common.currency'), dataIndex: "currency"},
          {title: this.$t('budget.balance.requisitioned.amount'), dataIndex: "amount", },
          {title: this.$t('common.tax'), dataIndex: "taxAmount"},
          {title: this.$t('budget.balance.tax.free.amount'), dataIndex: "saleAmount"},
          {title: this.$t('common.column.status'), dataIndex: "documentStatus"},
          {title: this.$t('budget.balance.abstract'), dataIndex: "description", render: description => <Popover content={description}>{description}</Popover>},
          {title: this.$t('budget.balance.reversed.status'), dataIndex: "reversedStatus"},
          {title: this.$t('budget.balance.period'), dataIndex: "periodName"},
          {title: this.$t('budget.balance.audit.status'), dataIndex: "auditStatus"}
        ],
        U: [
          {title: this.$t('budget.balance.company'), dataIndex: "companyName", render: companyName => <Popover content={companyName}>{companyName}</Popover>},
          {title: this.$t('common.department'), dataIndex: "unitName", render: unitName => <Popover content={unitName}>{unitName}</Popover>},
          {title: this.$t('budget.balance.reimbursed.by'), dataIndex: "applicantName"},
          {title: this.$t('budget.balance.doc.type'), dataIndex: "documentType"},
          {title: this.$t('budget.balance.doc.no'), dataIndex: "documentNumber",
            render: (documentNumber, record) => (
              <Popover content={documentNumber}>
                <a onClick={() => this.skipToDocumentDetail(record)}>{documentNumber}</a>
              </Popover>
            )},
          {title: this.$t('budget.balance.reimbursed.date'), dataIndex: "requisitionDate",
            render: requisitionDate => requisitionDate ? new Date(requisitionDate).format('yyyy-MM-dd') : '-'
          },
          {title: this.$t('budget.balance.reimbursed.item'), dataIndex: "itemName", render: itemName => <Popover content={itemName}>{itemName}</Popover>},
          {title: this.$t('common.currency'), dataIndex: "currency"},
          {title: this.$t('budget.balance.reimbursed.amount'), dataIndex: "amount",},
          {title: this.$t('common.column.status'), dataIndex: "documentStatus"},
          {title: this.$t('budget.balance.abstract'), dataIndex: "description", render: description => <Popover content={description}>{description}</Popover>},
          {title: this.$t('budget.balance.period'), dataIndex: "periodName"},
          {title: this.$t('budget.balance.audit.status'), dataIndex: "auditStatus"}
        ]
      }
    };
  }

  //跳转去单据详情页
  skipToDocumentDetail = (record) => {
    if (record.businessType === 'EXP_REPORT') {
      budgetBalanceService.searchExportByBusinessCode(record.documentNumber).then(res => {
        if(res.data.length === 0){
          message.error(this.$t('budget.balance.cannot.find.expense.report'))
        } else {
          window.open(menuRoute.getRouteItem('expense-report-detail-view').url.replace(':expenseReportOid', res.data[0].entityOid))
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
    let hide = message.loading(this.$t('importer.spanned.file')/*正在生成文件..*/);
    this.setState({ exporting: true });
    budgetBalanceService.exportDetail(params).then(res => {
      this.setState({ exporting: false });
      let b = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      FileSaver.saveAs(b, `${titleMap[type]}.xls`);
      hide();
    }).catch(() => {
      this.setState({ exporting: false });
      message.error(this.$t('importer.download.error.info')/*下载失败，请重试*/);
      hide();
    })
  };
  componentDidMount(){
    console.log(this.props)
    this.getList(this.props);
  }

  goBudgetJournal = (code) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget/budget-journal/budget-journal-detail/:journalCode'
          .replace(":journalCode", code)
      })
    );
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
    params.organizationId = nextProps.params.orgId;
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

  render() {
    const type = this.props.params.type;
    const { data, loading, pagination, columns, titleMap, dimensionColumns, exporting } = this.state;

    let tableColumns = [].concat(columns[type] ? columns[type] : []).concat(dimensionColumns);
    return (
      <div>
        <h3 className="header-title">{titleMap[type]}</h3>
        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total', { total: pagination.total ? pagination.total : '0' })}</div> {/* 共total条数据 */}
        </div>
        <Table columns={tableColumns}
          dataSource={data}
          bordered
          pagination={pagination}
          loading={loading}
          size="middle"
          rowKey="key"
          scroll={{ x: `${tableColumns.length * 20}%` }} />
        <div className="slide-footer">
          <Button onClick={() => {this.getList(this.props)}}>{this.$t('budget.balance.search.again')}</Button>
          <Button onClick={this.exportDetail} loading={exporting}>{this.$t('budget.balance.export.CVS')}</Button>
        </div>
      </div>
    )
  }

}


function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetBalanceAmountDetail);
