import {messages} from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';
import config from 'config'
import paymentService from './pay-workbench.service'
import { Badge, Radio, Table, Pagination, Alert, message, Modal, Icon, Form, DatePicker } from 'antd'
const FormItem = Form.Item;

import moment from 'moment'
import SearchArea from 'widget/search-area'
import PropTypes from 'prop-types';

class PaySuccess extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      radioValue: 'online',
      partnerId: undefined,
      searchForm: [
        {
          type: 'list',colSpan: 6,  isRequired:true,selectorItem:{
          title: messages('pay.select.pay.company'), //选择付款公司
          url: `${config.baseUrl}/api/companyBankAuth/get/own/info/${this.props.user.userOID}`,
          searchForm: [
            { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/) },
            { type: 'input', id: 'companyName', label: messages('chooser.data.companyName'/*公司名称*/) }
          ],
          columns: [
            {title: messages('chooser.data.companyCode'/*公司代码*/), dataIndex: 'bankAccountCompanyCode'},
            {title: messages('chooser.data.companyName'/*公司名称*/), dataIndex: 'bankAccountCompanyName'}
          ], key: 'bankAccountCompanyId'},
          id: 'paymentCompanyId',defaultValue:[{bankAccountCompanyName:this.props.company.name,bankAccountCompanyId:this.props.company.id}], label: messages('paymentCompanySetting.paymentCompanyName') /*"付款公司名称"*/, labelKey: "bankAccountCompanyName", valueKey: "bankAccountCompanyId", single: false
        },//付款机构选择
        {type: 'input', colSpan: 6, id: 'documentNumber', label: messages('pay.workbench.receiptNumber')}, //单据编号
        {type: 'value_list', colSpan: 6, id: 'documentCategory', label: messages('pay.workbench.receiptType'), options: [], valueListCode: 2106}, //单据类型
        {
          type: 'list', colSpan: 6, listType: "select_authorization_user", options: [], id: 'employeeId', label: messages('pay.workbench.applicant')/*申请人*/, labelKey: "userName",
          valueKey: "userId", single: true/*listExtraParams: { setOfBooksId: this.props.company.setOfBooksId }*/,
        },//申请人
        {type: 'items',  colSpan: 6, id: 'amountRange', items: [
          {type: 'input', id: 'amountFrom', label:messages('pay.amount.from')},//支付金额从
          {type: 'input', id: 'amountTo', label: messages('pay.amount.to')}//支付金额至
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
        {type: 'input', colSpan: 6, id: 'billcode', label: messages('pay.refund.billCode')},  //付款流水号
        {type: 'input', colSpan: 6, id: 'customerBatchNo', label: messages('pay.batch.number')},//付款批次号
        {type: 'items', colSpan: 6, id: 'dateRange', items: [
          {type: 'date', colSpan: 6, id: 'payDateFrom', label: messages('pay.date.from')}, //支付日期从
          {type: 'date', colSpan: 6, id: 'payDateTo', label: messages('pay.date.to')}
        ]}
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
        {title:  messages('pay.batch.number'), dataIndex: 'customerBatchNo'},
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
        {title: messages('pay.date'), dataIndex: 'payDate', render: value => moment(value).format('YYYY-MM-DD')},
        {title: messages('common.column.status'), dataIndex: 'paymentStatusName', render: (state) => <Badge status='success' text={state}/>},
      ],
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
      modalVisible: false,
      refundRow: {},
      confirmLoading: false,

      /* 线下 */
      offlineLoading: false,
      offlineData: [],
      offlinePage: 0,
      offlinePageSize: 10,
      offlinePagination: {
        total: 0
      },
      offlineCash: [],  //总金额

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
    Promise.all([ online, offline, file ]).then(() => {
      this.getOnlineCash();
      this.getOfflineCash();
      this.getFileCash();
    }).catch(() => {
      message.error(messages('budgetJournal.getDataFail'))
    })
  };

  search = (values) => {
    values.payDateFrom && (values.payDateFrom = moment(values.payDateFrom).format('YYYY-MM-DD'));
    values.payDateTo && (values.payDateTo = moment(values.payDateTo).format('YYYY-MM-DD'));
    if(!!this.state.partnerId){
      values.partnerId=this.state.partnerId;
    }else {
      values.partnerId && values.partnerId.length>0 && (values.partnerId = values.partnerId[0].id)
    }
    this.setState({
      searchParams: values,
      onlineCash: [],
      offlineCash: [],
      fileCash: [],
      onlinePage: 0,
      offlinePage:0 ,
      filePage:0,
    }, () => {
      this.getList()
    })
  };

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

  //退票
  handleRefund = (record) => {
    this.props.form.setFieldsValue({ refundDate: undefined });
    this.setState({ modalVisible: true, refundRow: record })
  };

  //确认退票
  confirmRefund = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ confirmLoading: true });
        paymentService.confirmRefund(moment(values.refundDate).format('YYYY-MM-DD'), this.state.refundRow).then(res => {
          if (res.status === 200) {
            this.setState({ modalVisible: false, confirmLoading: false });
            message.success(messages('my.refund.success'));
            this.getOnlineList();
            this.getOnlineCash()
          }
        }).catch((e) => {
          this.setState({ confirmLoading: false });
          message.error(messages('my.refund.failed')+ e.response.data.message +','+messages('common.try.again'))
        })
      }
    });
  };

  //查看支付流水详情
  checkPaymentDetail = (record) => {

    let path = this.state.paymentDetail.replace(':tab', 'Success').replace(':subTab', this.state.radioValue).replace(':id', record.id);
    this.props.dispatch(
      routerRedux.push({
        pathname: path,
      })
    );

  };

  /*********************** 获取总金额 ***********************/

  //线上
  getOnlineCash = () => {
    paymentService.getAmount('ONLINE_PAYMENT', 'S', this.state.searchParams).then(res => {
      this.setState({ onlineCash: res.data })
    })
  };

  //线下
  getOfflineCash = () => {
    paymentService.getAmount('OFFLINE_PAYMENT', 'S', this.state.searchParams).then(res => {
      this.setState({ offlineCash: res.data })
    })
  };

  //落地文件
  getFileCash = () => {
    paymentService.getAmount('EBANK_PAYMENT', 'S', this.state.searchParams).then(res => {
      this.setState({ fileCash: res.data })
    })
  };

  /************************ 获取列表 ************************/

  //线上
  getOnlineList = (resolve, reject) => {
    const { onlinePage, onlinePageSize, searchParams } = this.state;
    this.setState({ onlineLoading: true });
    paymentService.getSuccessList(onlinePage, onlinePageSize, 'ONLINE_PAYMENT', searchParams).then(res => {
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
    paymentService.getSuccessList(offlinePage, offlinePageSize, 'OFFLINE_PAYMENT', searchParams).then(res => {
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
    paymentService.getSuccessList(filePage, filePageSize, 'EBANK_PAYMENT', searchParams).then(res => {
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

  //线下
  offlinePaginationChange = (offlinePage, offlinePageSize) => {
    offlinePage = offlinePage - 1;
    this.setState({ offlinePage, offlinePageSize },() => {
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
  //日期限制
  disabledDate = (current) => {

    return current && current.valueOf() > Date.now();
  };
  /************************ 内容渲染 ************************/

  //线上
  renderOnlineContent = () => {
    const { columns, onlineData, onlineLoading, onlinePageSize, onlinePagination, onlineCash, pageSizeOptions } = this.state;
    let onlineColumns = [].concat(columns);
    onlineColumns.push(
      {title: messages('common.operation'), dataIndex: 'id', render: (id, record) => <a onClick={() => this.handleRefund(record)}>{messages('constants.bookerType.refund')}</a>}
    );
    const tableTitle = (
      <div>
        {messages('pay.pay.success')}
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
      <div className="success-online">
        <Table rowKey={record => record.id}
               columns={onlineColumns}
               dataSource={onlineData}
               pagination={false}
               loading={onlineLoading}
               title={()=>{return tableTitle}}
               scroll={{x: true, y: false}}
               bordered
               size="middle"/>
        {onlinePagination.total > 0 && <Pagination size="small"
                    defaultPageSize={onlinePageSize}
                    showSizeChanger
                    pageSizeOptions={pageSizeOptions}
                    total={onlinePagination.total}
                    onChange={this.onlinePaginationChange}
                    onShowSizeChange={this.onlinePaginationChange}
                    showQuickJumper={true}
                    showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
                    style={{margin:'16px 0', textAlign:'right'}} /> }
      </div>
    )
  };

  //线下
  renderOfflineContent = () => {
    const { columns, offlineData, offlineLoading, offlinePageSize, offlinePagination, offlineCash, pageSizeOptions } = this.state;
    const tableTitle = (
      <div>
        {messages('pay.pay.success')}
        {offlineCash.length > 0 && <span className="ant-divider"/>}
        {offlineCash.map((item, index) => {
          return (
            <div key={index} style={{display:'inline-block'}}>
              {messages('pay.transaction')}：{item.currency} <span className="num-style">{this.filterMoney(item.totalAmount)}</span>
              <span className="ant-divider"/>
              {messages('pay.transaction')}：<span className="num-style">{item.documentNumber}{messages('pay.bi')}</span>
              {index !== offlineCash.length - 1 && <span className="ant-divider"/>}
            </div>
          )
        })}
      </div>
    );
    return (
      <div className="success-offline">
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={offlineData}
               pagination={false}
               loading={offlineLoading}
               title={()=>{return tableTitle}}
               scroll={{x: true, y: false}}
               bordered
               size="middle"/>
        {offlinePagination.total > 0 && <Pagination size="small"
                    defaultPageSize={offlinePageSize}
                    showSizeChanger
                    pageSizeOptions={pageSizeOptions}
                    total={offlinePagination.total}
                    onChange={this.offlinePaginationChange}
                    onShowSizeChange={this.offlinePaginationChange}
                    showQuickJumper={true}
                    showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
                    style={{margin:'16px 0', textAlign:'right'}} /> }
      </div>
    )
  };

  //落地文件
  renderFileContent = () => {
    const { columns, fileData, fileLoading, filePageSize, filePagination, fileCash, pageSizeOptions } = this.state;
    const tableTitle = (
      <div>
        {messages('pay.pay.success')}
        {fileCash.length > 0 && <span className="ant-divider"/>}
        {fileCash.map((item, index) => {
          return (
            <div key={index} style={{display:'inline-block'}}>
              {messages('pay.transaction')}：{item.currency} <span className="num-style">{this.filterMoney(item.totalAmount)}</span>
              <span className="ant-divider"/>
              {messages('pay.transaction')}：<span className="num-style">{item.documentNumber}{messages('pay.bi')}</span>
              {index !== fileCash.length - 1 && <span className="ant-divider"/>}
            </div>
          )
        })}
      </div>
    );
    return (
      <div className="success-file">
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={fileData}
               pagination={false}
               loading={fileLoading}
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
                    showQuickJumper={true}
                    showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
                    onShowSizeChange={this.filePaginationChange}
                    style={{margin:'16px 0', textAlign:'right'}} /> }
      </div>
    )
  };

  /************************* End *************************/

  render(){
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 15, offset: 1 },
    };
    const { searchForm, radioValue, modalVisible, confirmLoading } = this.state;
    return (
      <div className="pay-success">
        <SearchArea searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                    eventHandle={this.eventHandle}
                    maxLength={4}
                    wrappedComponentRef={(inst) => this.formRef = inst}/>
        <Radio.Group value={radioValue} style={{margin:'20px 0'}}
                     onChange={(e) => {this.setState({ radioValue: e.target.value })}}>
          <Radio.Button value="online">{messages('pay.online')}</Radio.Button>
          <Radio.Button value="offline">{messages('pay.underline')}</Radio.Button>
          <Radio.Button value="file">{messages('pay.landing.file')}</Radio.Button>
        </Radio.Group>
        <Alert message={messages('pay.success.alert.tips')} type="info" showIcon style={{marginBottom:20}} />
        {radioValue === 'online' && this.renderOnlineContent()}
        {radioValue === 'offline' && this.renderOfflineContent()}
        {radioValue === 'file' && this.renderFileContent()}
        <Modal visible={modalVisible}
               confirmLoading={confirmLoading}
               onOk={this.confirmRefund}
               onCancel={() => this.setState({ modalVisible: false })}
               okText={messages('pay.refund.confirm')}
               width={400}>
          <div style={{height:110}}>
            <span style={{marginRight:10,fontSize:14}}>
              <Icon type="exclamation-circle" style={{color:'#faad14', fontSize:22, marginRight:8, position:'relative', top:2}}/>
              {messages('pay.change.status')}
            </span>
            <Badge status="error" text={messages('pay.refund')}/>
            <div style={{fontSize:12,color:'red',marginLeft:29}}>{messages('pay.success.refund.tips')}</div>
            <Form style={{marginLeft:29}}>
              <FormItem {...formItemLayout}
                        label={messages('pay.refund.date')}
                        style={{margin:'20px 0 10px'}}>
                {getFieldDecorator('refundDate', {
                  rules: [{
                    required: true,
                    message: messages('common.please.select')
                  }]
                })(
                  <DatePicker format="YYYY-MM-DD"
                              placeholder={messages('common.please.select')}
                              disabledDate={this.disabledDate}
                              allowClear={false}/>
                )}
              </FormItem>
            </Form>
          </div>
        </Modal>
      </div>
    )
  }

}

PaySuccess.contextTypes = {
  router: PropTypes.object
};

PaySuccess.propTypes = {
  subTab: PropTypes.string,
};


function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

const wrappedPaySuccess = Form.create()(PaySuccess);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPaySuccess);
