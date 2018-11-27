import { messages} from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import config from 'config'
import httpFetch from 'share/httpFetch'
import moment from 'moment'

import { Radio, Table, Badge, Modal, Form, Select, Input, Pagination, Button, Alert, message, Icon, Tooltip, DatePicker, Spin } from 'antd'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import FileSaver from 'file-saver'
import SearchArea from 'widget/search-area'
import paymentService from './pay-workbench.service'
import PropTypes from 'prop-types';
import EditableCell from './editable-cell'

class PayUnpaid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      radioValue: 'online',
      partnerId: undefined,
      editCellError: false,
      searchParams: { paymentCompanyId: this.props.company.id },
      selectFlag: null,
      payCompanyBankNumber: null,
      chequeNumberFlag: false,//支票号是否可以显示
      searchForm: [
        {
          type: 'list', event: 'COMPANY', isRequired: true, colSpan: 6, selectorItem: {
            title: messages('pay.select.pay.company'), //选择付款公司
            url: `${config.baseUrl}/api/companyBankAuth/get/own/info/lov/${this.props.user.userOID}`,
            searchForm: [
              { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/) },
              { type: 'input', id: 'companyName', label: messages('chooser.data.companyName'/*公司名称*/) }
            ],
            columns: [
              { title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'bankAccountCompanyCode' },
              { title: messages('chooser.data.companyName'/*公司名称*/), dataIndex: 'bankAccountCompanyName' }
            ], key: 'bankAccountCompanyId'
          },
          id: 'paymentCompanyId', defaultValue: [{ bankAccountCompanyName: this.props.company.name, bankAccountCompanyId: this.props.company.id }], label: messages('paymentCompanySetting.paymentCompanyName') /*"付款公司名称"*/, labelKey: "bankAccountCompanyName", valueKey: "bankAccountCompanyId", single: false
        },
        { type: 'input',colSpan: 6, id: 'documentNumber', label: messages('pay.workbench.receiptNumber')/*单据编号*/ },
        { type: 'value_list', colSpan: 6, id: 'documentTypeName', label: messages('pay.workbench.receiptType')/*单据类型*/, options: [], valueListCode: 2106 },
        {
          type: 'list', colSpan: 6, listType: "select_authorization_user", options: [], id: 'employeeId', label: messages('pay.workbench.applicant')/*申请人*/, labelKey: "userName",
          valueKey: "userId", single: true/*listExtraParams: { setOfBooksId: this.props.company.setOfBooksId }*/,
        },//申请人
        {
          type: 'items', colSpan: 6, id: 'dateRange', items: [
            { type: 'date', id: 'requisitionDateFrom', label: messages('pay.workbench.dateFrom')/*申请日期从*/ },
            { type: 'date', id: 'requisitionDateTo', label: messages('pay.workbench.dateTo')/*申请日期至*/ }
          ]
        },
        {
          type: 'items', colSpan: 6, id: 'amountRange', items: [
            { type: 'input', id: 'amountFrom', label: messages('pay.workbench.mountFrom')/*总金额从*/ },
            { type: 'input', id: 'amountTo', label: messages('pay.workbench.mountTo')/*总金额至*/ }
          ]
        },
        {
          type: 'items', colSpan: 6, id: 'partner', items: [
            { type: 'value_list', id: 'partnerCategory', label: messages('pay.workbench.type')/*类型*/, valueListCode: 2107, options: [], event: 'code' },
            {
              type: 'list', id: 'partnerId', label: messages('pay.workbench.payee')/*收款方*/, options: [], listType: 'user', single: true, event: 'PARTNER',
              method: 'get', getParams: {}, valueKey: 'id', labelKey: "id", disabled: true,
              getUrl: `${config.prePaymentUrl}/api/cash/prepayment/requisitionHead/getReceivablesByName?page=0&size=1&roleType=TENANT&name=&empFlag=1002&pageFlag=false`
            },
          ]
        },
      ],
      columns: [
        {
          title: `${messages('pay.workbench.receiptNumber')/*单据编号*/} | ${messages('pay.workbench.receiptType')/*单据类型*/}`,
          dataIndex: 'documentNumber', render: (value, record) => (
            <div>
              {value}
              <span className="ant-divider" />
              {record.documentTypeName}
            </div>)
        },
        {
          title: `${messages('pay.workbench.employee.id')/*工号*/} | ${messages('pay.workbench.applicant')/*申请人*/}`,
          dataIndex: 'employeeName', render: (value, record) => (
            <div>
              {record.employeeCode}
              <span className="ant-divider" />
              {value}
            </div>)
        },
        {
          title: messages('pay.workbench.requisition.date')/*申请日期*/, dataIndex: 'requisitionDate',
          render: value => moment(value).format('YYYY-MM-DD')
        },
        { title: messages('pay.workbench.currency')/*币种*/, dataIndex: 'currency' },
        { title: messages('pay.workbench.amount')/*总金额*/, dataIndex: 'amount', render: this.filterMoney },
        {
          title: messages('pay.workbench.payable.amount')/*可支付金额*/, dataIndex: 'payableAmount', render: (value, record) => {
            let numberString = Number(value || 0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            numberString += (numberString.indexOf('.') > -1 ? '' : '.00');
            return (//可支付金额不等于总金额
              value === record.amount ? this.filterMoney(value) :
                <div style={{ textAlign: 'right' }}>
                  <Tooltip title={messages('pay.payable.tips')}><Icon type="exclamation-circle-o" style={{ color: 'red', marginRight: 5 }} /></Tooltip>
                  {numberString}
                </div>
            )
          }
        },
        {    //本次支付金额
          title: messages('pay.this.pay.amount'), dataIndex: 'currentPayAmount', render: (value, record) => (
            <EditableCell type="number"
              record={record}
              value={value}
              message={messages('pay.workbench.payedAmount.tooltip')/*点击修改本次支付金额*/}
              onChangeError={this.state.editCellError}
              onChange={(editValue) => this.editCurrentPay(editValue, record)} />
          )
        },
        {      //付款方式类型
          title: messages('paymentMethod.paymentMethodCategory'), dataIndex: 'paymentMethodCategoryName',
          render: (account, record) => (
            <EditableCell value={account}
              message={messages('pay.workbench.payMethodType.tooltip')/*点击修改付款方式类型*/}
              record={record}
              onChangeError={this.state.editCellError}
              payType="payType"
              onChange={(value) => this.editAccount("paymentMethodCategory", value, record)} />)
        },
        {   //'类型 | 收款方'
          title: messages('pay.type.rec'), dataIndex: 'partnerCategoryName', render: (value, record) => (
            <div>
              {value}
              <span className="ant-divider" />
              {record.partnerName}
            </div>
          )
        },
        {//收款账号
          title: messages('pay.rec.account'), dataIndex: 'accountNumber', render: (account, record) => (
            <EditableCell value={account}
              message={messages('pay.workbench.accountNumber.tooltip')/*点击修改收款账号*/}
              record={record}
              onChangeError={this.state.editCellError}
              onChange={(value) => this.editAccount('accountNumber', value, record)} />
          )
        },
        { title: messages('common.column.status'), dataIndex: 'paymentStatusName', render: (state) => <Badge status='default' text={state} /> }
      ],
      buttonDisabled: true,
      selectedRowKeys: [], //选中行key
      selectedRows: [],  //选中行
      noticeAlert: null, //提示
      errorAlert: null,  //错误
      currency: null,    //选中行的币种
      payWayFetching: false,
      payAccountFetching: false,
      payWayOptions: [],
      payAccountOptions: [],
      modalVisible: false,
      modalLoading: false,
      pageSizeOptions: ['10', '20', '30', '50'],

      /* 线上 */
      onlineLoading: false,
      onlinePage: 0,
      onlinePageSize: 10,
      onlinePagination: { total: 0 },
      onlineData: [],
      onlineCash: [],                 //总金额

      /* 线下 */
      offlineLoading: false,
      offlinePage: 0,
      offlinePageSize: 10,
      offlinePagination: { total: 0 },
      offlineData: [],
      offlineCash: [],                //总金额

      /* 落地文件 */
      fileLoading: false,
      filePage: 0,
      filePageSize: 10,
      filePagination: { total: 0 },
      fileData: [],
      fileCash: [],                   //总金额

      paymentDetail: "/pay/pay-workbench/payment-detail/:tab/:subTab/:id",    //支付详情
    };
  }

  componentWillMount() {
    this.props.subTab && this.setState({ radioValue: this.props.subTab });
    this.getList()
  }

  //获取列表及总金额
  getList = () => {
    let online = new Promise((resolve, reject) => {
      this.getOnlineList(resolve, reject)
    });
    let offline = new Promise((resolve, reject) => {
      this.getOfflineList(resolve, reject)
    });
    let file = new Promise((resolve, reject) => {
      this.getFileList(resolve, reject)
    });
    Promise.all([online, offline, file]).then(() => {
      this.getOnlineCash();
      this.getOfflineCash();
      this.getFileCash();
    }).catch(() => {
      message.error(messages('budgetJournal.getDataFail'))
    })
  };

  //搜索
  search = (result) => {
    result.requisitionDateFrom = result.requisitionDateFrom ? moment(result.requisitionDateFrom).format('YYYY-MM-DD') : null;
    result.requisitionDateTo = result.requisitionDateTo ? moment(result.requisitionDateTo).format('YYYY-MM-DD') : null;
    if (!!this.state.partnerId) {
      result.partnerId = this.state.partnerId;
    } else {
      result.partnerId && result.partnerId.length > 0 && (result.partnerId = result.partnerId[0].id)
    }
    this.setState({
      searchParams: result,
      onlineCash: [],
      onlinePage: 0,
      offlinePage:0 ,
      filePage:0,
      offlineCash: [],
      fileCash: []
    }, () => {
      this.getList()
    })
  };

  //清空搜索区域
  clear = () => {
    this.eventHandle('code', null);
    this.setState({
      partnerId: undefined
    })
  };

  eventHandle = (type, value) => {
    let searchForm = this.state.searchForm;
    let partnerId = this.state.partnerId;
    if (type === 'code') {
      this.formRef.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
      searchForm.map(row => {
        if (row.id === 'partner') {
          row.items.map(item => {
            if (item.id === 'partnerId') {
              item.disabled = false;
              if (value) {
                if (value === 'EMPLOYEE') { //员工
                  item.type = 'list';
                  item.labelKey = 'fullName';
                  partnerId = undefined;
                  this.formRef.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
                } else if (value === 'VENDER') { //供应商
                  item.type = 'select';
                  item.labelKey = 'name';
                  partnerId = undefined;
                  this.formRef.setValues({ partnerId: value === 'EMPLOYEE' ? [] : '' });
                  // this.formRef.setValues({ partnerId: '' })
                }
              }
              else {
                item.disabled = true;
                item.type === 'list' && this.formRef.setValues({ partnerId: [] })
                item.type === 'select' && this.formRef.setValues({ partnerId: '' })
              }
            }
          })
        }
      });
    }
    if (type === 'PARTNER') {
      searchForm.map(item => {
        if (item.id === 'partner' && item.items[1].type === 'select') {
          partnerId = value;
        }
      });
    }

    if(type === 'COMPANY'){
      let companyIds=[];
      value.map(item=>companyIds.push(item.bankAccountCompanyId));
      this.setState({
          selectedRowKeys: [], //选中行key
          selectedRows: [],  //选中行
          searchParams: {...this.state.searchParams, paymentCompanyId: companyIds}},
          ()=>this.getList())
    }
    this.setState({ searchForm: searchForm, partnerId })
  };

  //选择 线上／线下／落地文件
  onRadioChange = (e) => {
    let onlineData = this.state.onlineData;
    let offlineData = this.state.offlineData;
    let fileData = this.state.fileData;
    onlineData.map(item => {
      item.currentPay = undefined
    });
    offlineData.map(item => {
      item.currentPay = undefined
    });
    fileData.map(item => {
      item.currentPay = undefined
    });
    this.setState({
      radioValue: e.target.value,
      selectedRowKeys: [],
      selectedRows: [],
      onlineData,
      offlineData,
      fileData
    }, () => {
      let values = this.props.form.getFieldsValue();
      Object.keys(values).map(key => {
        this.props.form.setFieldsValue({ [key]: undefined })
      });
      this.noticeAlert(this.state.selectedRows)
    })
  };

  //选择/取消选择某行的回调
  handleSelectRow = (record, selected) => {
    let selectedRows = this.state.selectedRows;
    if (selected) {
      selectedRows.push(record)
    } else {
      selectedRows.map((item, index) => {
        item.id === record.id && (selectedRows[index] = 0)
      });
      selectedRows.delete(0)
    }
    this.setState({ selectedRows }, () => {
      this.noticeAlert(this.state.selectedRows)
    })
  };

  //选中行的key
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  };

  //选择/取消选择所有行的回调
  handleSelectAllRow = (selected, selectedRow, changeRows) => {
    let selectedRows = this.state.selectedRows;
    if (selected) {
      changeRows.map(item => {
        selectedRows.push(item)
      })
    } else {
      selectedRows.map((row, index) => {
        changeRows.map(item => {
          row.id === item.id && (selectedRows[index] = 0)
        })
      });
      changeRows.map(() => {
        selectedRows.delete(0)
      })
    }
    this.setState({ selectedRows }, () => {
      this.noticeAlert(this.state.selectedRows)
    })
  };

  //提示框显示
  noticeAlert = (rows) => {
    let amount = 0;
    let errFlag = false;
    let currency = rows[0] ? rows[0].currency : null;
    let paymentCompanyId = rows[0] ? rows[0].paymentCompanyId : null;
    this.setState({ currency });
    rows.forEach(item => {
      if (item.currency === currency && item.paymentCompanyId === paymentCompanyId) {
        amount += item.currentPay || item.currentPayAmount
      } else {
        errFlag = true
      }
    });
    if (!errFlag) {
      let noticeAlert = (
        <span>
          {messages('accounting.selected',{count: rows.length })}
          <span className="ant-divider" />
          {messages('pay.this.amount')}：{currency} <span style={{ fontWeight: 'bold', fontSize: '15px' }}> {this.filterMoney(amount)} </span>
        </span>
      );
      this.setState({
        noticeAlert: rows.length ? noticeAlert : null,
        errorAlert: null,
        buttonDisabled: !rows.length
      });
    } else {
      let errorAlert = (
        <span>
          {messages('pay.selected')}<span style={{fontWeight:'bold',color:'#108EE9'}}> {rows.length} </span>{messages('pay.items')}
          <span className="ant-divider" />
          {messages('pay.differ.tips')}
        </span>
      );
      this.setState({
        noticeAlert: null,
        errorAlert: errorAlert,
        buttonDisabled: true
      });
    }
  };

  //修改本次支付金额
  editCurrentPay = (value, record) => {
    if (!value || value <= 0) {
      message.error(messages('pay.pay.tips'));
      this.setState({ editCellError: true });
      return
    }
    if (value > record.payableAmount) {
      message.error(messages('pay.pay.amount.tips'));
      this.setState({ editCellError: true });
      return
    }
    this.setState({ editCellError: false });
    this.state.onlineData.map(item => {
      item.id === record.id && (item.currentPay = value)
    });
    this.state.offlineData.map(item => {
      item.id === record.id && (item.currentPay = value)
    });
    this.state.fileData.map(item => {
      item.id === record.id && (item.currentPay = value)
    });
    this.noticeAlert(this.state.selectedRows);
    message.success(messages('common.update.success'));
  };

  //修改收款账号
  editAccount = (key, value, record) => {
    let params = {
      id: record.id,
      versionNumber: record.versionNumber
    };

    if (key === "paymentMethodCategory" && record.paymentMethodCategoryName == value) {
      return;
    }

    params[key] = value;
    paymentService.updateAccountNum([params]).then(res => {
      if (res.status === 200) {
        message.success(messages('common.update.success'));
        this.setState({ editCellError: false }, () => {
          // if(res.paymentMethodCategory === "ONLINE_PAYMENT"){
          //   this.getOnlineList();
          // }else if(res.paymentMethodCategory === "OFFLINE_PAYMENT"){
          //   this.getOfflineList();
          // }else if(res.paymentMethodCategory === "EBANK_PAYMENT"){
          //   this.getFileList();
          // }

          // 如果修改付款方式，需要清空选择的行
          if ("paymentMethodCategory" === key){
            this.setState({
              selectedRows:[],
              selectedRowKeys: []
            },() =>{
              this.getList();
              this.noticeAlert(this.state.selectedRows);
            })
          }else{
            this.getOnlineList();
            this.getOfflineList();
            this.getFileList()
          }


        });
      }
    }).catch(e => {
      this.setState({ editCellError: true });
      message.error(`${messages('common.update.filed')}，${e.response.data.message}`);
    })
  };

  //点击支付按钮
  handlePayModal = () => {
    this.setState({ payWayOptions: [], payAccountOptions: [], modalVisible: true, selectFlag: true, payCompanyBankNumber: null });
    let values = this.props.form.getFieldsValue();
    Object.keys(values).map(key => {
      this.props.form.setFieldsValue({ [key]: undefined });
    });
    this.props.form.setFieldsValue({ currency: this.state.currency });
    this.getExchangeRate()
  };

  //获取汇率
  getExchangeRate = () => {
    let currencyDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    let url = `${config.baseUrl}/api/company/standard/currency/get?currency=${this.state.currency}&currencyDate=${currencyDate}`;
    httpFetch.get(url).then(res => {
      this.props.form.setFieldsValue({ exchangeRate: res.data.rate });
    }).catch(e => {
      message.error(messages('pay.get.tax.failed'));
    })
  };

  //获取付款方式
  getPayWay = () => {
    const { radioValue, payCompanyBankNumber } = this.state;
    //if (this.state.payWayOptions.length > 0) return;
    this.setState({ payWayFetching: true });
    let paymentType = radioValue === 'online' ? 'ONLINE_PAYMENT' : radioValue === 'offline' ? 'OFFLINE_PAYMENT' : 'EBANK_PAYMENT';

    let url = `${config.baseUrl}/api/comapnyBankPayment/get/company/bank/payment/by/bank/account/number?number=${payCompanyBankNumber}&paymentMethod=${paymentType}`;
    httpFetch.get(url).then(res => {
      res.status === 200 && this.setState({ payWayOptions: res.data, payWayFetching: false })
    }).catch(() => {
      this.setState({ payWayFetching: false })
    })
  };

  //获取付款账户
  getPayAccount = () => {
    if (this.state.payAccountOptions.length > 0) return;
    this.setState({ payAccountFetching: true });
    let paymentCompanyId = this.state.selectedRows[0].paymentCompanyId;
    let paymentMethodCode = this.state.selectedRows[0].paymentMethodCategory;
    let currency = this.state.currency;
    let url = `${config.baseUrl}/api/CompanyBank/getCompanyBank/by/companyId/and/paymentMethodCode?companyId=${paymentCompanyId}&paymentMethodCode=${paymentMethodCode}&currency=${currency}`;
    httpFetch.get(url).then(res => {
      res.status === 200 && this.setState({ payAccountOptions: res.data, payAccountFetching: false })
    }).catch(() => {
      this.setState({ payAccountFetching: false })
    })
  };

  //查看支付流水详情
  checkPaymentDetail = (record) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.paymentDetail.replace(':tab', 'Unpaid').replace(':subTab', this.state.radioValue).replace(':id', record.id)
      })
    );
  };

  /*********************** 获取总金额 ***********************/

  //线上
  getOnlineCash = () => {
    paymentService.getUnpaidAmount('ONLINE_PAYMENT', this.state.searchParams).then(res => {
      this.setState({ onlineCash: res.data })
    })
  };

  //线下
  getOfflineCash = () => {
    paymentService.getUnpaidAmount('OFFLINE_PAYMENT', this.state.searchParams).then(res => {
      this.setState({ offlineCash: res.data })
    })
  };

  //落地文件
  getFileCash = () => {
    paymentService.getUnpaidAmount('EBANK_PAYMENT', this.state.searchParams).then(res => {
      this.setState({ fileCash: res.data })
    })
  };

  /************************ 获取列表 ************************/

  //线上
  getOnlineList = (resolve, reject) => {
    const { onlinePage, onlinePageSize, searchParams } = this.state;
    this.setState({ onlineLoading: true });
    paymentService.getUnpaidList(onlinePage, onlinePageSize, 'ONLINE_PAYMENT', searchParams).then(res => {
      if (res.status === 200) {
        this.setState({
          onlineData: res.data,
          onlineLoading: false,
          onlinePagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0
          }
        });
        resolve && resolve()
      }
    }).catch(() => {
      this.setState({ onlineLoading: false });
      reject && reject()
    })
  };

  //线下
  getOfflineList = (resolve, reject) => {
    const { offlinePage, offlinePageSize, searchParams } = this.state;
    this.setState({ offlineLoading: true });
    paymentService.getUnpaidList(offlinePage, offlinePageSize, 'OFFLINE_PAYMENT', searchParams).then(res => {
      if (res.status === 200) {
        this.setState({
          offlineData: res.data,
          offlineLoading: false,
          offlinePagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0
          }
        });
        resolve && resolve()
      }
    }).catch(() => {
      this.setState({ offlineLoading: false });
      reject && reject()
    })
  };

  //落地文件
  getFileList = (resolve, reject) => {
    const { filePage, filePageSize, searchParams } = this.state;
    this.setState({ fileLoading: true });
    paymentService.getUnpaidList(filePage, filePageSize, 'EBANK_PAYMENT', searchParams).then(res => {
      if (res.status === 200) {
        this.setState({
          fileData: res.data,
          fileLoading: false,
          filePagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0
          }
        });
        resolve && resolve()
      }
    }).catch(() => {
      this.setState({ fileLoading: false });
      reject && reject()
    })
  };

  /********************** 弹框 - 确认支付 *********************/

  //线上&线下
  handleLineModalOk = () => {
    const { radioValue } = this.state;
    let category = radioValue === 'online' ? 'ONLINE_PAYMENT' : (radioValue === 'offline' ? 'OFFLINE_PAYMENT' : 'EBANK_PAYMENT');
    let params = {};
    params.dataIds = [];
    params.versionNumbers = [];
    params.currentAmount = [];
    this.state.selectedRows.map(row => {
      params.dataIds.push(row.id);
      params.versionNumbers.push(row.versionNumber);
      params.currentAmount.push(row.currentPay || row.currentPayAmount)
    });
    let fieldNames = ["payCompanyBankNumber", "currency", "exchangeRate", "paymentTypeId", "remark"];
    if (radioValue === 'offline') {
      this.state.chequeNumberFlag && fieldNames.push("chequeNumber");
      fieldNames.push("payDate")
    }
    this.props.form.validateFieldsAndScroll(fieldNames, (err, values) => {
      if (!err) {
        values.paymentMethodCategory = category;
        values.payCompanyBankName = values.payCompanyBankNumber.label;
        values.payCompanyBankNumber = values.payCompanyBankNumber.key;
        values.paymentDescription = values.paymentTypeId.label;
        values.paymentTypeId = values.paymentTypeId.key;
        values.payDate && (values.payDate = moment(values.payDate));
        params.cashPayDTO = values;
        this.setState({ modalLoading: true });

        if (radioValue == 'online' || radioValue == 'offline') {
          paymentService.confirmPay(params).then(res => {
            if (res.status === 200) {
              message.success(messages('common.operate.success'));
              if (radioValue === 'online') {
                this.getOnlineList();
                this.getOnlineCash()
              } else if (radioValue == 'offline') {
                this.getOfflineList();
                this.getOfflineCash()
              }
              this.setState({
                modalVisible: false,
                modalLoading: false,
                selectedRowKeys: [],
                selectedRows: [],
                noticeAlert: null
              })
            }
          }).catch(e => {
            message.error(`${messages('common.operate.field')}，${e.response.data.message}`);
            this.setState({ modalLoading: false })
          })
        } else {
          paymentService.confirmPayByEBank(params).then(res => {
            if (res.status === 200) {
              message.success(messages('common.operate.success'));
              let fileName = res.headers['content-disposition'].split("filename=")[1];
              let f = new Blob([res.data]);
              FileSaver.saveAs(f, decodeURIComponent(fileName));
              this.getFileList();
              this.getFileCash();
              this.setState({
                modalVisible: false,
                modalLoading: false,
                selectedRowKeys: [],
                selectedRows: [],
                noticeAlert: null
              })
            }
          }).catch(e => {
            message.error(`${messages('common.operate.filed')}，${e.response.data.message}`);
            this.setState({ modalLoading: false })
          })
        }
      }
    })
  };

  //落地文件
  handleFileModalOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalVisible: false });
      }
    })
  };

  /********************* 修改每页显示数量 *********************/

  //线上
  onlinePaginationChange = (onlinePage, onlinePageSize) => {
    onlinePage = onlinePage - 1;
    this.setState({ onlinePage, onlinePageSize }, () => {
      this.getOnlineList()
    })
  };

  //线下
  offlinePaginationChange = (offlinePage, offlinePageSize) => {
    offlinePage = offlinePage - 1;
    this.setState({ offlinePage, offlinePageSize }, () => {
      this.getOfflineList()
    })
  };

  //落地文件
  filePaginationChange = (filePage, filePageSize) => {
    filePage = filePage - 1;
    this.setState({ filePage, filePageSize }, () => {
      this.getFileList()
    })
  };

  /************************ 内容渲染 ************************/

  //线上
  renderOnlineContent = () => {
    const { onlineLoading, columns, onlineData, onlinePageSize, onlinePagination, onlineCash, selectedRowKeys, pageSizeOptions } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow
    };
    const tableTitle = (
      <div>
        {messages('pay.workbench.Unpaid')}
        {onlineCash.length > 0 && <span className="ant-divider" />}
        {onlineCash.map((item, index) => {
          return (
            <div key={index} style={{ display: 'inline-block' }}>
              {messages('common.amount')}：{item.currency} <span className="num-style">{this.filterMoney(item.totalAmount)}</span>
              <span className="ant-divider" />
              {messages('pay.transaction')}：<span className="num-style">{item.documentNumber}{messages('pay.bi')}</span>
              {index !== onlineCash.length - 1 && <span className="ant-divider" />}
            </div>
          )
        })}
      </div>
    );
    return (
      <div className="unpaid-online">
        <Table rowKey={record => record.id}
          columns={columns}
          dataSource={onlineData}
          pagination={false}
          loading={onlineLoading}
          rowSelection={rowSelection}
          title={() => { return tableTitle }}
          scroll={{ x: true, y: false }}
          bordered
          size="middle" />
        { onlinePagination.total > 0 && <Pagination size="small"
          defaultPageSize={onlinePageSize}
          showSizeChanger
          pageSizeOptions={pageSizeOptions}
          total={onlinePagination.total}
          showQuickJumper={true}
          showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
          onChange={this.onlinePaginationChange}
          onShowSizeChange={this.onlinePaginationChange}
          style={{ margin: '16px 0', textAlign: 'right' }} />}
      </div>
    )
  };

  //线下
  renderOfflineContent = () => {
    const { offlineLoading, columns, offlineData, offlinePageSize, offlinePagination, offlineCash, pageSizeOptions,selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow
    };
    const tableTitle = (
      <div>
        {messages('pay.workbench.Unpaid')}
        {offlineCash.length > 0 && <span className="ant-divider" />}
        {offlineCash.map((item, index) => {
          return (
            <div key={index} style={{ display: 'inline-block' }}>
              {messages('common.amount')}：{item.currency} <span className="num-style">{this.filterMoney(item.totalAmount)}</span>
              <span className="ant-divider" />
              {messages('pay.transaction')}：<span className="num-style">{item.documentNumber}{messages('pay.bi')}</span>
              {index !== offlineCash.length - 1 && <span className="ant-divider" />}
            </div>
          )
        })}
      </div>
    );
    return (
      <div className="unpaid-offline">
        <Table rowKey={record => record.id}
          columns={columns}
          dataSource={offlineData}
          pagination={false}
          loading={offlineLoading}
          rowSelection={rowSelection}
          title={() => { return tableTitle }}
          scroll={{ x: true, y: false }}
          bordered
          size="middle" />
        {offlinePagination.total > 0 &&<Pagination size="small"
          defaultPageSize={offlinePageSize}
          showSizeChanger
          pageSizeOptions={pageSizeOptions}
          total={offlinePagination.total}
          showQuickJumper={true}
          showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
          onChange={this.offlinePaginationChange}
          onShowSizeChange={this.offlinePaginationChange}
          style={{ margin: '16px 0', textAlign: 'right' }} />}
      </div>
    )
  };

  //落地文件
  renderFileContent = () => {
    const { fileLoading, columns, fileData, filePageSize, filePagination, fileCash, pageSizeOptions,selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow
    };
    const tableTitle = (
      <div>
        {messages('pay.workbench.Unpaid')}
        {fileCash.length > 0 && <span className="ant-divider" />}
        {fileCash.map((item, index) => {
          return (
            <div key={index} style={{ display: 'inline-block' }}>
              {messages('common.amount')}：{item.currency} <span className="num-style">{this.filterMoney(item.totalAmount)}</span>
              <span className="ant-divider" />
              {messages('pay.transaction')}：<span className="num-style">{item.documentNumber}{messages('pay.bi')}</span>
              {index !== fileCash.length - 1 && <span className="ant-divider" />}
            </div>
          )
        })}
      </div>
    );
    return (
      <div className="unpaid-file">
        <Table rowKey={record => record.id}
          columns={columns}
          dataSource={fileData}
          pagination={false}
          loading={fileLoading}
          rowSelection={rowSelection}
          title={() => { return tableTitle }}
          scroll={{ x: true, y: false }}
          bordered
          size="middle" />
        {filePagination.total > 0 && <Pagination size="small"
          defaultPageSize={filePageSize}
          showSizeChanger
          pageSizeOptions={pageSizeOptions}
          total={filePagination.total}
          showQuickJumper={true}
          showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
          onChange={this.filePaginationChange}
          onShowSizeChange={this.filePaginationChange}
          style={{ margin: '16px 0', textAlign: 'right' }} />}
      </div>
    )
  };

  selectHandleChange = (value) => {
    if (value.key) {
      this.setState({ selectFlag: false, payCompanyBankNumber: value.key, payWayOptions: [] });
      this.props.form.setFieldsValue({ paymentTypeId: undefined,_payCompanyBankNumber: value.key });
    }
  };

  //日期限制
  disabledDate = (current) => {
    return current && current.valueOf() > Date.now();
  };

  //支付方式改变
  onChangePaymentMethod = (value) => {
    const { payWayOptions } = this.state;
    let paymentMethodId;
    payWayOptions.map(item => {
      if (item.paymentMethodCode === 'PAY_IN_CHEQUE') {
        paymentMethodId = item.paymentMethodId;
      }
    });
    if (paymentMethodId === value.key) {
      this.setState({ chequeNumberFlag: true });
    } else {
      this.props.form.setFieldsValue({ chequeNumber: undefined });
      this.setState({ chequeNumberFlag: false });
    }
  };
  /************************* End *************************/

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectFlag, searchForm, modalVisible, radioValue, payWayOptions, payAccountOptions, buttonDisabled, noticeAlert, errorAlert, payWayFetching, payAccountFetching, modalLoading } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="pay-unpaid">
        <SearchArea searchForm={searchForm}
          eventHandle={this.eventHandle}
          submitHandle={this.search}
          clearHandle={this.clear}
          maxLength={4}
          wrappedComponentRef={(inst) => this.formRef = inst} />
        <Radio.Group value={radioValue} style={{ margin: '20px 0' }}
          onChange={this.onRadioChange}>
          <Radio.Button value="online">{messages('constants.paymentMethodCategory.online')}</Radio.Button>
          <Radio.Button value="offline">{messages('constants.paymentMethodCategory.offline')}</Radio.Button>
          <Radio.Button value="file">{messages('constants.paymentMethodCategory.landingFile')}</Radio.Button>
        </Radio.Group>
        <Button type="primary"
          style={{ marginBottom: 10, display: 'block' }}
          disabled={buttonDisabled}
          onClick={this.handlePayModal}>
          {radioValue === 'online' && messages('pay.workbench.payOnline')/*线上支付*/}
          {radioValue === 'offline' && messages('pay.workbench.payInline')}
          {radioValue === 'file' && messages('pay.workbench.Landing.payment')}
        </Button>
        {noticeAlert ? <Alert message={noticeAlert} type="info" showIcon style={{ marginBottom: '10px' }} /> : ''}
        {errorAlert ? <Alert message={errorAlert} type="error" showIcon style={{ marginBottom: '10px' }} /> : ''}
        {radioValue === 'online' && this.renderOnlineContent()}
        {radioValue === 'offline' && this.renderOfflineContent()}
        {radioValue === 'file' && this.renderFileContent()}
        {radioValue === 'online' ? (
          <Modal title={messages('pay.online.confirm')}
            visible={modalVisible}
            okText={messages('pay.pay.confirm')}
            confirmLoading={modalLoading}
            onOk={this.handleLineModalOk}
            onCancel={() => this.setState({ modalVisible: false })}>
            <Form>
              <FormItem  {...formItemLayout} label={messages('pay.pay.account')}>
                {getFieldDecorator('payCompanyBankNumber', {
                  rules: [{
                    required: true,
                    message: messages('common.please.select')
                  }]
                })(
                  <Select placeholder={ messages('common.please.select')}
                    onFocus={this.getPayAccount}
                    notFoundContent={payAccountFetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                    onChange={this.selectHandleChange}
                    labelInValue>
                    {payAccountOptions.map(option => {
                      return <Option key={option.bankAccountNumber}>
                        {option.bankAccountName + '-' + option.bankAccountNumber.padStart(4,"*").substr(option.bankAccountNumber.padStart(4,"*").length -4)}
                      </Option>
                    })}
                  </Select>
                  )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('pay.account.number')}>
                {getFieldDecorator('_payCompanyBankNumber')(
                  <Input disabled/>
                )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('common.currency')}>
                {getFieldDecorator('currency', {
                  rules: [{
                    required: true
                  }]
                })(
                  <Input disabled />
                  )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('common.currency.rate')}>
                {getFieldDecorator('exchangeRate', {
                  rules: [{
                    required: true
                  }]
                })(
                  <Input disabled />
                  )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('payment.batch.company.payWay')/*付款方式*/}>
                {getFieldDecorator('paymentTypeId', {
                  rules: [{
                    required: true,
                    message: messages('common.please.select')
                  }]
                })(
                  <Select placeholder={messages('common.please.select')}
                    onFocus={this.getPayWay}
                    notFoundContent={payWayFetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                    disabled={selectFlag}
                    labelInValue>
                    {payWayOptions.map(option => {
                      return <Option key={option.paymentMethodId}>{option.description}</Option>
                    })}
                  </Select>
                  )}
              </FormItem>
              <FormItem {...formItemLayout} label={messages('common.comment')}>
                {getFieldDecorator('remark')(
                  <TextArea autosize={{ minRows: 2 }} style={{ minWidth: '100%' }} placeholder={messages('common.please.enter')} />
                )}
              </FormItem>
            </Form>
          </Modal>
        ) : radioValue === 'offline' ? (
          <Modal title={messages('pay.under.confirm')}
            visible={modalVisible}
            okText={messages('pay.pay.confirm')}
            confirmLoading={modalLoading}
            onOk={this.handleLineModalOk}
            onCancel={() => this.setState({ modalVisible: false })}>
            <Form>
              <Alert message={messages('pay.alert.tips')} type="info" showIcon style={{ position: 'relative', top: -10 }} />
              <FormItem  {...formItemLayout} label={messages("pay.refund.payDate")}>
                {getFieldDecorator('payDate', {
                  rules: [{
                    required: true,
                    message: messages('common.please.select')
                  }]
                })(
                  <DatePicker disabledDate={this.disabledDate} />
                  )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('pay.pay.account')}>
                {getFieldDecorator('payCompanyBankNumber', {
                  rules: [{
                    required: true,
                    message: messages('common.please.select')
                  }]
                })(
                  <Select placeholder={messages('common.please.select')}
                    onFocus={this.getPayAccount}
                    notFoundContent={payAccountFetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                    onChange={this.selectHandleChange}
                    labelInValue>
                    {payAccountOptions.map(option => {
                      return <Option key={option.bankAccountNumber}>
                        {option.bankAccountName + '-' + option.bankAccountNumber.padStart(4,"*").substr(option.bankAccountNumber.padStart(4,"*").length -4)}
                      </Option>
                    })}
                  </Select>
                  )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('pay.account.number')}>
                {getFieldDecorator('_payCompanyBankNumber',{})(
                  <Input disabled/>
                )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('common.currency')}>
                {getFieldDecorator('currency', {
                  rules: [{
                    required: true
                  }]
                })(
                  <Input disabled />
                  )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('common.currency.rate')}>
                {getFieldDecorator('exchangeRate', {
                  rules: [{
                    required: true
                  }]
                })(
                  <Input disabled />
                  )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('payment.batch.company.payWay')}>
                {getFieldDecorator('paymentTypeId', {
                  rules: [{
                    required: true,
                    message: messages('common.please.select')
                  }]
                })(
                  <Select placeholder={messages('common.please.select')}
                    onFocus={this.getPayWay}
                    notFoundContent={payWayFetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                    disabled={selectFlag}
                    onChange={this.onChangePaymentMethod}
                    labelInValue>
                    {payWayOptions.map(option => {
                      return <Option key={option.paymentMethodId}>{option.description}</Option>
                    })}
                  </Select>
                  )}
              </FormItem>
              {this.state.chequeNumberFlag ? <FormItem  {...formItemLayout} label={messages('payment.batch.company.paymentChequeNo')}>
                {getFieldDecorator('chequeNumber', {
                })(
                  <Input />
                  )}
              </FormItem> : ''}
              <FormItem {...formItemLayout} label={messages('common.comment')}>
                {getFieldDecorator('remark')(
                  <TextArea autosize={{ minRows: 2 }} style={{ minWidth: '100%' }} placeholder={messages('common.please.enter')} />
                )}
              </FormItem>
            </Form>
          </Modal>
        ) : (
              <Modal title={messages('pay.workbench.Landing.payment')}
                visible={modalVisible}
                okText={messages('payment.import.file')}
                bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
                confirmLoading={modalLoading}
                onOk={this.handleLineModalOk}
                onCancel={() => this.setState({ modalVisible: false })}>
                <Form>
                  <div style={{ marginBottom: 15 }}>01. {messages('payment.select.pay.account')}</div>
                  <FormItem  {...formItemLayout} label={messages('pay.pay.account')}>
                    {getFieldDecorator('payCompanyBankNumber', {
                      rules: [{
                        required: true,
                        message: messages('common.please.select')
                      }]
                    })(
                      <Select placeholder={messages('common.please.select')}
                        onFocus={this.getPayAccount}
                        notFoundContent={payAccountFetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                        onChange={this.selectHandleChange}
                        labelInValue>
                        {payAccountOptions.map(option => {
                          return <Option key={option.bankAccountNumber}>
                            {option.bankAccountName + '-' + option.bankAccountNumber.padStart(4,"*").substr(option.bankAccountNumber.padStart(4,"*").length -4)}
                          </Option>
                        })}
                      </Select>
                      )}
                  </FormItem>
                  <FormItem  {...formItemLayout} label={messages('pay.account.number')}>
                    {getFieldDecorator('_payCompanyBankNumber',{})(
                      <Input disabled/>
                    )}
                  </FormItem>
                  <FormItem  {...formItemLayout} label={messages('common.currency')}>
                    {getFieldDecorator('currency', {
                      rules: [{
                        required: true
                      }]
                    })(
                      <Input disabled />
                      )}
                  </FormItem>
                  <FormItem  {...formItemLayout} label={messages('common.currency.rate')}>
                    {getFieldDecorator('exchangeRate', {
                      rules: [{
                        required: true
                      }]
                    })(
                      <Input disabled />
                      )}
                  </FormItem>
                  <div style={{ marginBottom: 15 }}>02. {messages('payment.select.pay.way')}</div>
                  <FormItem  {...formItemLayout} label={messages('payment.batch.company.payWay')}>
                    {getFieldDecorator('paymentTypeId', {
                      rules: [{
                        required: true,
                        message: messages('common.please.select')
                      }]
                    })(
                      <Select placeholder={messages('common.please.select')}
                        onFocus={this.getPayWay}
                        notFoundContent={payWayFetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                        disabled={selectFlag}
                        labelInValue>
                        {payWayOptions.map(option => {
                          return <Option key={option.paymentMethodId}>{option.description}</Option>
                        })}
                      </Select>
                      )}
                  </FormItem>
                  <FormItem {...formItemLayout} label={messages('common.comment')}>
                    {getFieldDecorator('remark')(
                      <TextArea autosize={{ minRows: 2 }} style={{ minWidth: '100%' }} placeholder={messages('common.please.enter')}/>
                    )}
                  </FormItem>
                  <div style={{ marginBottom: 15 }}>03. {messages('pay.import.tips')}</div>
                  <FormItem  {...formItemLayout}>
                    <div>1.{messages('pay.import.tips.first')}</div>
                    <div>2.{messages('pay.import.tips.second')}</div>
                    <div>3.{messages('pay.import.tips.third')}</div>
                  </FormItem>
                </Form>
              </Modal>
            )}
      </div>
    )
  }

}

PayUnpaid.contextTypes = {
  router: PropTypes.object
};

PayUnpaid.propTypes = {
  subTab: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

const WrappedPayUnpaid = Form.create()(PayUnpaid);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedPayUnpaid);
