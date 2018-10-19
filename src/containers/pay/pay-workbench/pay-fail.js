import { messages} from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';

import config from 'config'
import httpFetch from 'share/httpFetch'
import paymentService  from './pay-workbench.service'
import { Form, Radio, Badge, Table, Pagination, message, Button, Alert, Modal, Select, Input, Popconfirm, Spin } from 'antd'
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;
import FileSaver from 'file-saver'
import moment from 'moment'
import PropTypes from 'prop-types';


import SearchArea from 'widget/search-area'

class PayFail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      radioValue: 'online',
      partnerId: undefined,
      buttonDisabled: true,
      selectFlag:null,
      payCompanyBankNumber:null,
      searchForm: [
        {
          type: 'list', colSpan: 6, isRequired:true,selectorItem:{
          title: messages('pay.select.pay.company'), //选择付款公司
          url: `${config.baseUrl}/api/companyBankAuth/get/own/info/${this.props.user.userOID}`,
          searchForm: [
            { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/) },
            { type: 'input', id: 'companyName', label: messages('chooser.data.companyName'/*公司名称*/) }
          ],
          columns: [
            {title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'bankAccountCompanyCode'},
            {title: messages('chooser.data.companyName'/*公司名称*/) , dataIndex: 'bankAccountCompanyName'}
          ], key: 'bankAccountCompanyId'},
          id: 'paymentCompanyId',defaultValue:[{bankAccountCompanyName:this.props.company.name,bankAccountCompanyId:this.props.company.id}], label: messages('paymentCompanySetting.paymentCompanyName') /*"付款公司名称"*/, labelKey: "bankAccountCompanyName", valueKey: "bankAccountCompanyId", single: false
        },//付款机构选择
        {type: 'input', colSpan: 6, id: 'documentNumber', label: messages('pay.workbench.receiptNumber')}, //单据编号
        {type: 'value_list', colSpan: 6, id: 'documentCategory', label: messages('pay.workbench.receiptType'), options: [], valueListCode: 2106}, //单据类型
        {
          type: 'list', colSpan: 6, listType: "select_authorization_user", options: [], id: 'employeeId', label: messages('pay.workbench.applicant')/*申请人*/, labelKey: "userName",
          valueKey: "userId", single: true/*listExtraParams: { setOfBooksId: this.props.company.setOfBooksId }*/,
        },//申请人
        {type: 'items', colSpan: 6, id: 'amountRange', items: [
          {type: 'input', id: 'amountFrom', label: messages('pay.amount.from')},
          {type: 'input', id: 'amountTo', label:  messages('pay.amount.to')}
        ]},
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
        {type: 'input', colSpan: 6, id: 'billcode', label: messages('pay.refund.billCode')},
        {type: 'input', colSpan: 6, id: 'customerBatchNo', label: messages('pay.batch.number')},//付款批次号
      ],
      searchParams: {paymentCompanyId:this.props.company.id},
      columns: [
        {title: messages('pay.refund.billCode'), dataIndex: 'billcode', render: (value, record) => <a onClick={() => {this.checkPaymentDetail(record)}}>{value}</a>},
        {title: messages('pay.number.type'), dataIndex: 'documentNumber', render: (value, record) => {
          return (
            <div>
              <a onClick={() => {this.checkPaymentDetail(record)}}>{value}</a>
              <span className="ant-divider"/>
              {record.documentTypeName}
            </div>
          )}
        },
        {title: messages('pay.batch.number'), dataIndex: 'customerBatchNo'},
        {title: messages('pay.number.applicant'), dataIndex: 'employeeName', render: (value, record) => {
          return (
            <div>
              {record.employeeCode}
              <span className="ant-divider"/>
              {value}
            </div>
          )}
        },
        {title: messages('common.currency'), dataIndex: 'currency'},
        {title: messages('pay.this.pay.amount'), dataIndex: 'amount', render: this.filterMoney},
        {title: messages('payment.batch.company.payWay'), dataIndex: 'paymentTypeName'},
        {title: messages('pay.type.partner'), dataIndex: 'partnerCategoryName', render: (value, record) => {
          return (
            <div>
              {value}
              <span className="ant-divider"/>
              {record.partnerName}
            </div>
          )}
        },
        {title: messages('pay.refund.draweeAccountNumber'), dataIndex: 'payeeAccountNumber'},
        {title: messages('common.column.status'), dataIndex: 'paymentStatusName', render: (state, record) => <Badge status='error' text={record.refundStatus === 'Y' ? messages('pay.refund') : state}/>},
      ],
      selectedRowKeys: [], //选中行key
      selectedRows: [],  //选中行
      noticeAlert: null, //提示
      errorAlert: null,  //错误
      currency: null,    //选中行的币种
      modalVisible: false,
      modalLoading: false,
      payAccountFetching: false,
      payWayFetching: false,
      payAccountOptions: [],
      pageSizeOptions: ['10', '20', '30', '50'],

      /* 线上 */
      onlineLoading: false,
      onlineData: [],
      onlinePage: 0,
      onlinePageSize: 10,
      onlinePagination: {
        total: 0
      },
      onlineCash: [],  //总金额
      payWayOptions: [],

      /* 落地文件 */
      fileLoading: false,
      fileData: [],
      filePage: 0,
      filePageSize: 10,
      filePagination: {
        total: 0
      },
      fileCash: [],  //总金额

      paymentDetail:  "/pay/pay-workbench/payment-detail/:tab/:subTab/:id",    //支付详情
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
    let file = new Promise((resolve, reject) => {
      this.getFileList(resolve, reject)
    });
    Promise.all([ online, file ]).then(() => {
      this.getOnlineCash();
      this.getFileCash();
    }).catch(() => {
      message.error(messages('budgetJournal.getDataFail'))
    })
  };

  //搜索
  search = (values) => {
    if(!!this.state.partnerId){
      values.partnerId=this.state.partnerId;
    }else {
      values.partnerId && values.partnerId.length>0 && (values.partnerId = values.partnerId[0].id)
    }
    this.setState({
      searchParams: values,
      onlineCash: [],
      fileCash: [],
      onlinePage: 0,
      filePage:0,
    }, () => {
      this.getList()
    })
  };

  //清除搜索内容
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
      searchForm.map(row => {
        if (row.id === 'partner') {
          row.items.map(item => {
            if (item.id === 'partnerId') {
              item.disabled = false;
              if(value) {
                if (value === 'EMPLOYEE') { //员工
                  item.type = 'list';
                  item.labelKey = 'fullName';
                  partnerId = undefined;
                } else if (value === 'VENDER') { //供应商
                  item.type = 'select';
                  item.labelKey = 'venNickname';
                  partnerId = undefined;
                  this.formRef.setValues({ partnerId: '' })
                }
              } else {
                item.disabled = true;
                item.type === 'select' && this.formRef.setValues({ partnerId: '' })
              }
            }
          })
        }
      })
    }
    if (type === 'PARTNER'){
      searchForm.map(item=>{
        if(item.id === 'partner'&& item.items[1].type === 'select'){
          partnerId = value;
        }
      });
    }
    this.setState({ searchForm:searchForm,partnerId })
  };

  //选择 线上／线下／落地文件
  onRadioChange = (e) => {
    this.setState({
      radioValue: e.target.value,
      selectedRowKeys: [],
      selectedRows: []
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
    if(selected) {
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
    if(selected){
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
        amount += item.amount
      } else {
        errFlag = true
      }
    });
    if (!errFlag) {
      let noticeAlert = (
        <span>
          {messages('pay.selected')}<span style={{fontWeight:'bold',color:'#108EE9'}}> {rows.length} </span>{messages('pay.items')}
          <span className="ant-divider" />
          {messages('pay.this.amount')}：{currency} <span style={{fontWeight:'bold',fontSize:'15px'}}> {this.filterMoney(amount)} </span>
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

  //点击重新支付按钮
  repay = () => {
    this.setState({ payWayOptions: [], payAccountOptions: [], modalVisible: true,selectFlag:true,payCompanyBankNumber:null });
    let values = this.props.form.getFieldsValue();
    Object.keys(values).map(key => {
      this.props.form.setFieldsValue({ [key]: undefined });
    });
    this.props.form.setFieldsValue({ currency: this.state.currency });
    this.getExchangeRate();
  };

  //点击取消支付按钮
  cancelPay = () => {
    paymentService.cancelPay(this.state.selectedRows).then(res => {
      if (res.status === 200) {
        message.success(messages('pay.cancel.success'));
        this.getList();
        this.setState({ selectedRows: [] }, () => {
          this.noticeAlert(this.state.selectedRows)
        })
      }
    }).catch(() => {
      message.error(messages('pay.cancel.failed'));
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

  //获取付款方式
  getPayWay = () => {
    const { radioValue,payCompanyBankNumber } = this.state;
    //if (this.state.payWayOptions.length > 0) return;
    this.setState({ payWayFetching: true });
    let paymentType = radioValue === 'online' ? 'ONLINE_PAYMENT' : 'EBANK_PAYMENT';
    let url = `${config.baseUrl}/api/comapnyBankPayment/get/company/bank/payment/by/bank/account/number?number=${payCompanyBankNumber}&paymentMethod=${paymentType}`;
    httpFetch.get(url).then(res => {
      res.status === 200 && this.setState({ payWayOptions: res.data, payWayFetching: false })
    }).catch(() => {
      this.setState({ payWayFetching: false })
    })
  };

  //查看支付流水详情
  checkPaymentDetail = (record) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.paymentDetail.replace(':tab', 'Fail').replace(':subTab', this.state.radioValue).replace(':id', record.id),
      })
    );
  };

  /*********************** 获取总金额 ***********************/

  //线上
  getOnlineCash = () => {
    paymentService.getAmount('ONLINE_PAYMENT', 'F', this.state.searchParams).then(res => {
      this.setState({ onlineCash: res.data })
    })
  };

  //落地文件
  getFileCash = () => {
    paymentService.getAmount('EBANK_PAYMENT', 'F', this.state.searchParams).then(res => {
      this.setState({ fileCash: res.data })
    })
  };

  /************************ 获取列表 ************************/

  //线上
  getOnlineList = (resolve, reject) => {
    const { onlinePage, onlinePageSize, searchParams } = this.state;
    this.setState({ onlineLoading: true });
    paymentService.getFailList(onlinePage, onlinePageSize, 'ONLINE_PAYMENT', searchParams).then(res => {
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

  //落地文件
  getFileList = (resolve, reject) => {
    const { filePage, filePageSize, searchParams } = this.state;
    this.setState({ fileLoading: true });
    paymentService.getFailList(filePage, filePageSize, 'EBANK_PAYMENT', searchParams).then(res => {
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

  /********************* 修改每页显示数量 *********************/

  //线上
  onlinePaginationChange = (onlinePage, onlinePageSize) => {
    onlinePage = onlinePage - 1;
    this.setState({ onlinePage, onlinePageSize },() => {
      this.getOnlineList()
    })
  };

  //落地文件
  filePaginationChange = (filePage, filePageSize) => {
    filePage = filePage - 1;
    this.setState({ filePage, filePageSize },() => {
      this.getFileList()
    })
  };

  /********************** 弹框 - 确认支付 *********************/

  //线上
  handleOnlineModalOk = () => {
    let params = {};
    params.details = this.state.selectedRows;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.paymentMethodCategory = "ONLINE_PAYMENT";
        values.payCompanyBankName = values.payCompanyBankNumber.label;
        values.payCompanyBankNumber = values.payCompanyBankNumber.key;
        values.paymentDescription = values.paymentTypeId.label;
        values.paymentTypeId = values.paymentTypeId.key;
        params.payDTO = values;
        this.setState({ modalLoading: true });
        paymentService.rePay(params).then(res => {
          if (res.status === 200) {
            message.success(messages('common.operate.success'));
            this.getOnlineList();
            this.getOnlineCash();
            this.setState({
              modalVisible: false,
              modalLoading: false,
              selectedRowKeys: [],
              selectedRows: []
            },() => {
              this.noticeAlert(this.state.selectedRows)
            })
          }
        }).catch(e => {
          message.error(`${messages('common.operate.filed')}，${e.response.data.message}`);
          this.setState({ modalLoading: false })
        })
      }
    })
  };

  //落地文件
  handleFileModalOk = () => {
    let params = {};
    params.details = this.state.selectedRows;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.paymentMethodCategory = "ONLINE_PAYMENT";
        values.payCompanyBankName = values.payCompanyBankNumber.label;
        values.payCompanyBankNumber = values.payCompanyBankNumber.key;
        values.paymentDescription = values.paymentTypeId.label;
        values.paymentTypeId = values.paymentTypeId.key;
        params.payDTO = values;
        this.setState({ modalLoading: true });
        paymentService.rePayEBank(params).then(res => {
          if (res.status === 200) {
            message.success(messages('common.operate.success'));
            let fileName = res.headers['content-disposition'].split("filename=")[1];
            let f = new Blob([res.data]);
            FileSaver.saveAs(f,decodeURIComponent(fileName));
            this.getFileList();
            this.getFileCash();
            this.setState({
              modalVisible: false,
              modalLoading: false,
              selectedRowKeys: [],
              selectedRows: []
            }, () => {
              this.noticeAlert(this.state.selectedRows)
            })
          }
        }).catch(e => {
          let blob  = new Blob([e.response.data],{type: 'text/plain'});
          var reader = new FileReader();
          reader.readAsText(blob, 'utf-8');
          reader.onload = obj =>{
            let jsonRes = JSON.parse(reader.result);
            message.error(`${messages('common.operate.filed')}，${jsonRes.message}`);
            this.setState({modalLoading: false})
          };
        })
      }
    })
  };

  /************************ 内容渲染 ************************/

  //线上
  renderOnlineContent = () => {
    const { columns, onlineData, onlineLoading, onlinePageSize, onlinePagination, onlineCash, pageSizeOptions, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow
    };
    const tableTitle = (
      <div>
        {messages('pay.pay.or.return')}
        {onlineCash.length > 0 && <span className="ant-divider"/>}
        {onlineCash.map((item, index) => {
          return (
            <div key={index} style={{display:'inline-block'}}>
              {messages('common.amount')}：{item.currency} <span className="num-style">{this.filterMoney(item.totalAmount)}</span>
              <span className="ant-divider"/>
              {messages('pay.transaction')}：<span className="num-style">{item.documentNumber}{messages('pay.bi')}</span>
              {index !== onlineCash.length - 1 && <span className="ant-divider"/>}
            </div>
          )
        })}
      </div>
    );
    return (
      <div className="fail-online">
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={onlineData}
               pagination={false}
               loading={onlineLoading}
               rowSelection={rowSelection}
               title={()=>{return tableTitle}}
               scroll={{x: true, y: false}}
               bordered
               size="middle"/>
        {onlinePagination.total >0 && <Pagination size="small"
                    defaultPageSize={onlinePageSize}
                    showSizeChanger
                    pageSizeOptions={pageSizeOptions}
                    total={onlinePagination.total}
                    onChange={this.onlinePaginationChange}
                    onShowSizeChange={this.onlinePaginationChange}
                    showQuickJumper={true}
                    showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
                    style={{margin:'16px 0', textAlign:'right'}} />}
      </div>
    )
  };

  //落地文件
  renderFileContent = () => {
    const { columns, fileData, fileLoading, filePageSize, filePagination, fileCash, pageSizeOptions } = this.state;
    const rowSelection = {
      onSelect: this.handleSelectRow,
      onSelectAll: this.handleSelectAllRow
    };
    const tableTitle = (
      <div>
        {messages('pay.pay.or.return')}
        {fileCash.length > 0 && <span className="ant-divider"/>}
        {fileCash.map((item, index) => {
          return (
            <div key={index} style={{display:'inline-block'}}>
              {messages('common.amount')}：{item.currency} <span className="num-style">{this.filterMoney(item.totalAmount)}</span>
              <span className="ant-divider"/>
              {messages('pay.transaction')}：<span className="num-style">{item.documentNumber}{messages('pay.bi')}</span>
              {index !== fileCash.length - 1 && <span className="ant-divider"/>}
            </div>
          )
        })}
      </div>
    );
    return (
      <div className="fail-file">
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={fileData}
               pagination={false}
               loading={fileLoading}
               rowSelection={rowSelection}
               title={()=>{return tableTitle}}
               scroll={{x: true, y: false}}
               bordered
               size="middle"/>
        {filePagination.total > 0 && <Pagination size="small"
                    defaultPageSize={filePageSize}
                    showSizeChanger
                    pageSizeOptions={pageSizeOptions}
                    total={filePagination.total}
                    onChange={this.filePaginationChange}
                    onShowSizeChange={this.filePaginationChange}
                    showQuickJumper={true}
                    showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
                    style={{margin:'16px 0', textAlign:'right'}} />}
      </div>
    )
  };
  selectHandleChange =(value) =>{
    if (value.key) {
      this.setState({selectFlag : false,payCompanyBankNumber:value.key,payWayOptions:[]});
      this.props.form.setFieldsValue({ paymentTypeId: undefined });
    }
  };
  /************************* End *************************/

  render(){
    const { getFieldDecorator } = this.props.form;
    const { selectFlag,searchForm, radioValue, buttonDisabled, noticeAlert, errorAlert, modalVisible, modalLoading, currency, payWayOptions, payAccountFetching, payWayFetching, payAccountOptions } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="pay-fail">
        <SearchArea searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                    eventHandle={this.eventHandle}
                    maxLength={4}
                    wrappedComponentRef={(inst) => this.formRef = inst}/>
        <Radio.Group value={radioValue} style={{margin:'20px 0'}}
                     onChange={this.onRadioChange}>
          <Radio.Button value="online">{messages('pay.online')}</Radio.Button>
          <Radio.Button value="offline" disabled>{messages('pay.underline')}</Radio.Button>
          <Radio.Button value="file">{messages('pay.landing.file')}</Radio.Button>
        </Radio.Group>
        <div style={{marginBottom:10}}>
          <Button type="primary"
                  disabled={buttonDisabled}
                  style={{marginRight:20}}
                  onClick={this.repay}>{messages('pay.workbench.RePay')}</Button>
          <Popconfirm title={messages('pay.cancel.confirm')} onConfirm={this.cancelPay}>
            <Button type="primary"
                    disabled={buttonDisabled}>{messages('pay.workbench.CancelPay')}</Button>
          </Popconfirm>
        </div>
        {noticeAlert ? <Alert message={noticeAlert} type="info" showIcon style={{marginBottom:'10px'}}/> : ''}
        {errorAlert ? <Alert message={errorAlert} type="error" showIcon style={{marginBottom:'10px'}}/> : ''}
        {radioValue === 'online' && this.renderOnlineContent()}
        {radioValue === 'file' && this.renderFileContent()}
        {radioValue === 'online' ? (
          <Modal title={messages('pay.repay.confirm')}
                 visible={modalVisible}
                 confirmLoading={modalLoading}
                 okText={messages('pay.pay.confirm')}
                 onOk={this.handleOnlineModalOk}
                 onCancel={() => this.setState({ modalVisible: false })}>
            <Form>
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
                      return <Option key={option.bankAccountNumber}>{option.bankAccountName}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('common.currency')}>
                {getFieldDecorator('currency', {
                  rules: [{ required: true }]
                })(
                  <Input disabled />
                )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('pay.refund.exchangeRate')}>
                {getFieldDecorator('exchangeRate', {
                  rules: [{
                    required: true
                  }]
                })(
                  <Input disabled />
                )}
              </FormItem>
              <FormItem  {...formItemLayout} label={ messages('payment.batch.company.payWay')}>
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
                {getFieldDecorator('remark', {
                  initialValue: ''
                })(
                  <TextArea autosize={{minRows: 2}} style={{minWidth:'100%'}} placeholder={messages('common.please.enter')}/>
                )}
              </FormItem>
            </Form>
          </Modal>
        ) : (
          <Modal title={messages('pay.landing.repay')}
                 visible={modalVisible}
                 confirmLoading={modalLoading}
                 okText={messages('payment.import.file')}
                 onOk={this.handleFileModalOk}
                 onCancel={() => this.setState({ modalVisible: false })}>
            <Form>
              <div style={{marginBottom:15}}>01. {messages('payment.select.pay.account')}</div>
              <FormItem  {...formItemLayout} label={messages('pay.pay.account')}>
                {getFieldDecorator('payCompanyBankNumber', {
                  rules: [{
                    required: true,
                    message:messages('common.please.select')
                  }]
                })(
                  <Select placeholder={messages('common.please.select')}
                          onFocus={this.getPayAccount}
                          notFoundContent={payAccountFetching ? <Spin size="small" /> : messages('pay.refund.notFoundContent')}
                          onChange={this.selectHandleChange}
                          labelInValue>
                    {payAccountOptions.map(option => {
                      return <Option key={option.bankAccountNumber}>{option.bankAccountName}</Option>
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem  {...formItemLayout} label={messages('common.currency')} style={{marginBottom:15}}>
                {getFieldDecorator('currency', {
                  rules: [{
                    required: true
                  }],
                  initialValue: currency
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
              <div style={{marginBottom:15}}>02. {messages('payment.select.pay.way')}</div>
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
              <FormItem {...formItemLayout} label={messages('common.comment')} style={{marginBottom:15}}>
                {getFieldDecorator('description', {
                  initialValue: ''
                })(
                  <TextArea autosize={{minRows: 2}} style={{minWidth:'100%'}} placeholder={messages('common.please.enter')}/>
                )}
              </FormItem>
              <div style={{marginBottom:15}}>03. {messages('pay.import.tips')}</div>
              <FormItem  {...formItemLayout} style={{marginBottom:15}}>
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

PayFail.contextTypes = {
  router: PropTypes.object
};

PayFail.propTypes = {
  subTab: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

const wrappedPayFail = Form.create()(PayFail);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPayFail);
