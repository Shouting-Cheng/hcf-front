/**
 * Created by Allen on 2018/5/4.
 */
import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router"
import { Table, Tabs, message, Popover, Badge } from 'antd'
import SearchArea from 'components/Widget/search-area';
import CustomTable from 'components/Widget/custom-table';
import {messages} from 'utils/utils';
import config from 'config'
import moment from 'moment'
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
const TabPane = Tabs.TabPane;
const statusList = [
  { value: 1001, label: messages("common.editing") },
  { value: 1002, label: messages("detail.reverse.status.checkIng") },
  { value: 1004, label: messages("batch.print.approved") },
  { value: 1005, label: messages("request.audit.reject") },
  { value: 1003, label: messages("common.withdraw")}
];

class ExpenseReverse extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      isNew: true,
      tabs: [
        {key: 'CANREVERSE', name: this.$t('exp.can.reserve')}, //可反冲
        {key: 'MYREVERSE', name: this.$t("exp.finish.reserve")}  //已反冲
      ],
      currentTab: 'CANREVERSE',
      canSearchForm: [  //可反冲搜索searchArea选项
        {
          type: 'select',
          id: 'businessClass',
          label: this.$t('ye.wu.da.lei'),
          options: [
            {label: this.$t('exp.reserve.emp.reimburse'), value: 'USER_REPORT'},
            {label: this.$t('menu.public-reimburse-report'), value: 'PUBLIC_REPORT'}
          ],
          event: 'BUSINESSCLASS',
          colSpan: 6
        },
        {
          type: 'select',
          id: 'billType',
          label: this.$t('pay.refund.documentTypeName'),
          getUrl: '',
          disabled:true,
          options: [],
          method: "get",
          valueKey: "formId",
          labelKey: "formName",
          colSpan: 6
        },
        {
          type: 'input',
          id: 'billNum',
          label: this.$t('acp.requisitionNumber'),
          colSpan: 6
        },
      /*  {
          type: 'datePicker',
          id: 'applyDate',
          label: '申请日期',
          colSpan: 6
        },*/
        {
          type: 'items',
          id: 'applyDate',
          items: [
            { type: 'date', id: 'applyDateFrom', label: this.$t("epx.adjust.apply.dateFrom"),event: 'DATE_FROM'},
            { type: 'date', id: 'applyDateTo', label: this.$t("exp.adjust.apply.dateTo"),event:'DATE_TO' }
          ],
          colSpan: 6
        },
        {
          type: 'list', listType: "bgtUser", options: [],
          id: 'employeeId', label: this.$t("common.applicant"), labelKey: "fullName", valueKey: "id",colSpan: 6,single:true,
          listExtraParams:{setOfBooksId: this.props.company.setOfBooksId}
        },
        {
          type: 'list', listType: 'company', options: [],
          id: 'companyId', label: this.$t('exp.company'), labelKey: 'name',valueKey: 'id',colSpan: 6,single:true,
          listExtraParams:{setOfBooksId: this.props.company.setOfBooksId}
        },
        {
          type: 'list', listType: 'select_department_contract', options: [],
          id: 'departmentId', label: this.$t('common.department'), labelKey: 'name', valueKey: 'departmentId',colSpan: 6,single:true
        },
        {
          type: 'select', key: 'currency', id: 'currency', label: this.$t("common.currency"), getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`, options: [], method: "get",
          labelKey: 'currency', valueKey: 'currency', colSpan: 6
        },
        {
          type: 'items',
          id: 'amountRange',
          items: [
            { type: 'input', id: 'amountFrom', label: this.$t("expense.reverse.amount.from") },
           { type: 'input', id: 'amountTo', label: this.$t("expense.reverse.amount.to") }
          ],
          colSpan: 6
        },
        {
          type: 'items',
          id: 'reverseAmountRange',
          items: [
            { type: 'input', id: 'reverseAmountFrom', label: this.$t("exp.reserve.money.from") },
           { type: 'input', id: 'reverseAmountTo', label: this.$t("exp.reserve.money.to") }
          ],
          colSpan: 6
        },
      ],
      mySearchForm: [   //我发起的反冲search参数
        {
          type: 'input',
          id: 'reportReverseNumber',
          label: this.$t('exp.reverse.number'),
          colSpan: 6
        },
        {
          type: 'select',
          id: 'businessClass',
          label: this.$t('exp.old.business.type'),
          options: [
            {label: this.$t('exp.reserve.emp.reimburse'), value: 'USER_REPORT'},
            {label: this.$t('menu.public-reimburse-report'), value: 'PUBLIC_REPORT'}
          ],
          event: 'BUSINESSCLASS',
          colSpan: 6
        },
        {
          type: 'input',
          id: 'sourceDocumentCode',
          label: this.$t('expense.reverse.check.source.number'),
          colSpan: 6
        },
      /*  {
          type: 'datePicker',
          id: 'reverseDate',
          label: '反冲日期',
          colSpan: 6
        },*/
        {
          type: 'items',
          id: 'applyDate',
          items: [
            { type: 'date', id: 'applyDateFrom', label: this.$t("expense.reverse.date.from"),event: 'DATE_FROM'},
            { type: 'date', id: 'applyDateTo', label: this.$t("expense.reverse.date.to"),event:'DATE_TO' }
          ],
          colSpan: 6
        },
        {
          type: 'items',
          id: 'amountRange',
          items: [
            { type: 'input', id: 'reverseAmountFrom', label: this.$t("expense.reverse.amount.from") },
            { type: 'input', id: 'reverseAmountTo', label: this.$t("expense.reverse.amount.to") }
          ],
          colSpan: 6
        },

        {
          type: 'select', id: 'reverseStatus', label: this.$t('common.column.status'), options: statusList, colSpan: 6
        },
        {
          type: 'select', key: 'currency', id: 'currency', label: this.$t("common.currency"), getUrl: `${config.baseUrl}/api/company/standard/currency/getAll`, options: [], method: "get",
          labelKey: 'currency', valueKey: 'currency', colSpan: 6
        },
        {
          type: 'input',
          id: 'description',
          label: this.$t('common.comment'),
          colSpan: 6
        }
      ],
      canReverseTotal: 0,
      myReverseTotal: 0,
      canSearchParams: {},
      searchParams: {},
      canReverseColumns: [
        {title: this.$t("ye.wu.da.lei"), key: 'businessClassName', dataIndex: 'businessClassName',align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },              //单据编号
        {title: this.$t('acp.requisitionNumber'), key: 'documentCode', dataIndex: 'documentCode', width: 120,align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },             //单据类型
        {title: this.$t('acp.typeName'), key: 'documentType', dataIndex: 'documentType', width: 150,align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },         //申请人
        {title: this.$t('common.applicant'), key: 'applyName', dataIndex: 'applyName', width: 80,align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },          //申请日期
        {title: this.$t('acp.requisitionDate'), key: 'applyDate', dataIndex: 'applyDate',align: 'center',
          render: desc=><span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span>
        },          //公司
        {title: this.$t('exp.company'), key: 'companyName', dataIndex: 'companyName',align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },
        {title: this.$t('common.department'), key: 'departmentName', dataIndex: 'departmentName',align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },     //币种
        {title: this.$t('common.currency'), key: 'currencyCode', dataIndex: 'currencyCode', width: 80,align: 'center',
          render: desc => <span><Popover content={desc}>{desc}</Popover></span>
        },
        {title: this.$t('common.total.amount'), key: 'amount', dataIndex: 'amount', width: 80,align: 'center',
          render:
            (desc,currencyCode)=>
              <span>
                <Popover content={this.filterMoney(desc,2)}>
                  {this.filterMoney(desc,2)}
                </Popover>
            </span>
        },        //可反冲金额
        {title: this.$t('exp.reserve.money'), key: 'reverseAmount', dataIndex: 'reverseAmount', width: 100,align: 'center',
          render: (desc, record) =>
            <span>
              <Popover content={this.filterMoney(desc, 2)}>
                {this.filterMoney(desc, 2)}
              </Popover>
            </span>
        },
        {title: this.$t('common.operation'), key: 'operate', dataIndex: 'operate', width: 80,align: 'center',
          render: (text,record) => (
            <span>
                <a href="#" onClick={(e) => this.goReverse(e, record)}>{this.$t('acp.payment.reserved')}</a>
              </span>
          )
        }
      ],
      myReverseColumns: [
        {title: this.$t('exp.reverse.number'), key: 'reportReverseNumber', dataIndex: 'reportReverseNumber',align: 'center',
          render: (value,record) =>
            <a onClick={(e) => this.goReverse(e,record)}><Popover content={value}>{value? value : "-"}</Popover></a>
        },        //原单据编号
        {title: this.$t('expense.reverse.check.source.number'), key: 'sourceReportHeaderCode', dataIndex: 'sourceReportHeaderCode',align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },      //原业务大类
        {title: this.$t('exp.old.business.type'), key: 'businessClassName', dataIndex: 'businessClassName',align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },     //反冲日期
        {title: this.$t('detail.reverse.date'), key: 'reverseDate', dataIndex: 'reverseDate',align: 'center',
          render: desc=><span><Popover content={moment(desc).format('YYYY-MM-DD')}>{desc? moment(desc).format('YYYY-MM-DD') : "-"}</Popover></span>
        },
        {
          title: this.$t('common.currency'), key: 'currencyCode', dataIndex: 'currencyCode',align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        },         //反冲金额
        {title: this.$t('expense.reverse.amount'), key: 'amount', dataIndex: 'amount',align: 'center',
          render: desc=>
            <span><Popover content={this.filterMoney(desc,2)}>{this.filterMoney(desc,2)}</Popover></span>
        },
        {
          title: this.$t('common.comment'), key: 'description', dataIndex: 'description', width: 150,align: 'center',
          render: desc => <span><Popover content={desc}>{desc? desc : "-"}</Popover></span>
        }, //反冲状态
        {title: this.$t('exp.reserve.status'), key: 'status', dataIndex: 'status',align: 'center',
          render: (value,record) => {
           value === 1002 && (value = 3002);
           value === 1004 && (value = 1006);
          return <Badge status={this.$statusList[value].state} text={this.$statusList[value].label} />
          }
        }

      ],
      // newReverse: menuRoute.getRouteItem('new-reverse','key'),
      // expenseReverseDetail: menuRoute.getRouteItem('expense-reverse-detail','key') //费用反冲单详情页
    };
  }

  componentDidMount(){
    reverseService.myReverseList().then(response=> this.setState({
      canReverseTotal: this.customTable1.state.pagination.total,
      myReverseTotal:  Number(response.headers["x-total-count"]) || 0
    }))
  }

  shouldComponentUpdate(nextProps,nextState){
    return typeof nextState.canReverseTotal !== 'undefined' || typeof nextState.myReverseTotal !== 'undefined' || this.state.currentTab !== nextState.currentTab
  }

  searchCanReverse = (result) => {
    if (result.billType === 'NO_CONTENT') {
      result.billType = '';
    }
    result.applyDateFrom = result.applyDateFrom ? result.applyDateFrom.format('YYYY-MM-DD') : undefined;
    result.applyDateTo = result.applyDateTo ? result.applyDateTo.format('YYYY-MM-DD') : undefined;
    debugger
    let searchParams = {
      businessClass: result.businessClass,
      documentTypeId: result.billType,
      documentCode: result.billNum,
      currency: result.currency,
      applyDateFrom: result.applyDateFrom,
      applyDateTo: result.applyDateTo,
      amountFrom: result.amountFrom,
      amountTo: result.amountTo,
      reverseAmountFrom: result.reverseAmountFrom,
      reverseAmountTo: result.reverseAmountTo,
      applyId: result.employeeId,
      companyId: result.companyId,
      departmentId: result.departmentId,
      unitId: result.unitId&&result.unitId[0]
    };
    if(result.employeeId && result.employeeId[0]){
      searchParams = {
        ...searchParams,
        applyId:result.employeeId[0]
      }
    }
    if(result.companyId && result.companyId[0]){
      searchParams = {
        ...searchParams,
        companyId: result.companyId[0]
      }
    }
    if(result.departmentId && result.departmentId[0]){
      searchParams = {
        ...searchParams,
        departmentId: result.departmentId[0]
      }
    }
    this.setState({canSearchParams: searchParams}, ()=> this.customTable1.search(searchParams))
  };

  clearCanReverse = () => {
    let canSearchForm = this.state.canSearchForm;
    canSearchForm[1].disabled = true;
    this.setState({
      canSearchForm,
      canSearchParams: {}
    })
  };

  clearMyReverse = () =>{
    this.setState({searchParams:{}})
  };

  searchEventHandle = (event,value) => {
    let { canSearchForm, mySearchForm } = this.state;
    if (this.state.currentTab === 'CANREVERSE') {
      if (event === 'BUSINESSCLASS') {
        if (value === 'PUBLIC_REPORT') {
          canSearchForm[1].options = [];
          canSearchForm[1].disabled = false;
          canSearchForm[1].getUrl = `${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=105`
        } else if (value === 'USER_REPORT') {
          canSearchForm[1].options = [];
          canSearchForm[1].getUrl = '';
          this.formRef.setValues({
            billType: {label: '', value: 'NO_CONTENT'}
          })
        } else {
          canSearchForm[1].options = [];
          canSearchForm[1].getUrl = '';
          this.formRef.setValues({
            billType: {label: '', value: 'NO_CONTENT'}
          })
        }
        this.setState({canSearchForm})
      }
    } else if (this.state.currentTab === 'MYREVERSE') {
      if (event === 'BUSINESSCLASS') {
        if (value === 'PUBLIC_REPORT') {
          mySearchForm[2].options = [];
          mySearchForm[2].getUrl = `${config.baseUrl}/api/custom/forms/company/my/available/all/?formType=105`
        } else if (value === 'USER_REPORT') {
          mySearchForm[2].options = [];
          mySearchForm[2].getUrl = '';
          this.formRef.setValues({
            billType: {label: '', value: 'NO_CONTENT'}
          })
        } else {
          mySearchForm[2].options = [];
          mySearchForm[2].getUrl = '';
          this.formRe.setValues({
            billType: {label: '', value: 'NO_CONTENT'}
          })
        }
        this.setState({mySearchForm})
      }
    }
  };

  goReverse = (e,record) => {
    e.preventDefault();
    if (this.state.currentTab === 'CANREVERSE'){
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/financial-management/expense-reverse/new-reverse/${record.documentId}/${record.businessClass}/${this.state.isNew}/${record.currencyCode}`,
          state: {isNew: true, currency: record.currencyCode}
        })
      );
      
      // this.context.router.push({
      //   pathname: this.state.newReverse.url.replace(':id', record.documentId).replace(':businessClass', record.businessClass),
      //   state: {isNew: true, currency: record.currencyCode}
      // })
    } else if (this.state.currentTab === 'MYREVERSE'){
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/financial-management/expense-reverse/expense-reverse-detail/${record.id}`,
        })
      );
      // this.context.router.push(this.state.expenseReverseDetail.url.replace(':id',record.id))
    }

  };

  searchMyReverse = (result) => {
    if (result.billType === 'NO_CONTENT') {
      result.billType = '';
    }
    result.reverseDateFrom = result.applyDateFrom ? result.applyDateFrom.format('YYYY-MM-DD') : undefined;
    result.reverseDateTo = result.applyDateTo ? result.applyDateTo.format('YYYY-MM-DD') : undefined;
    let params = {
      reportReverseNumber: result.reportReverseNumber,
      businessClass: result.businessClass,
      sourceDocumentCode: result.sourceDocumentCode,
      reverseDateFrom: result.reverseDateFrom,
      reverseDateTo: result.reverseDateTo,
      reverseAmountFrom: result.reverseAmountFrom,
      reverseAmountTo: result.reverseAmountTo,
      reverseStatus: result.reverseStatus,
      currencyCode: result.currency,
      description: result.description,
      createdBy: this.props.user.id,
      page: this.state.page,
      size: this.state.pageSize
    };
    this.setState({
      searchParams: params
    },()=>{
      this.customTable2.search(params)
    });
  };

  onChangeTabs = (key) =>{
    this.setState({currentTab: key},()=>{
      if(key === 'CANREVERSE')
        this.customTable1.search(this.state.canSearchParams);
      else
        this.customTable2.search(this.state.searchParams);
    })
  };

  render(){
    const {  currentTab, canSearchForm, mySearchForm,  canReverseColumns, myReverseColumns, pagination } = this.state;
    return (
      <div className="expense-reverse">
        <Tabs defaultActiveKey={currentTab} onChange={this.onChangeTabs}>
          <TabPane tab={`${this.$t('exp.can.reserve')}(${this.state.canReverseTotal})`} key={this.state.tabs[0].key} />
          <TabPane tab={`${this.$t('exp.finish.reserve')}(${this.state.myReverseTotal})`} key={this.state.tabs[1].key} />
        </Tabs>
        {currentTab === 'CANREVERSE' && (
          <div>
            <SearchArea
              wrappedComponentRef={(inst) => this.formRef = inst}
              searchForm={canSearchForm}
              maxLength={4}
              submitHandle={this.searchCanReverse}
              clearHandle={this.clearCanReverse}
              eventHandle={this.searchEventHandle}/>
            <div className="divider"/>
            <CustomTable
              ref={ref => this.customTable1 = ref}
              columns={canReverseColumns}
              url={`${config.baseUrl}/api/report/reverse/get/result`}
            />
          </div>
        )}

        {currentTab === 'MYREVERSE' && (
          <div>
            <SearchArea
              wrappedComponentRef={(inst) => this.formRef = inst}
              searchForm={mySearchForm}
              maxLength={4}
              submitHandle={this.searchMyReverse}
              clearHandle={this.clearMyReverse}
              eventHandle={this.searchEventHandle}/>
            <div className="divider"/>

            <CustomTable
              ref={ref => this.customTable2 = ref}
              columns={myReverseColumns}
              url={`${config.baseUrl}/api/report/reverse/get/reverse/by/own`}
            />
          </div>
        )}
      </div>
    )
  }

}


function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ExpenseReverse)

