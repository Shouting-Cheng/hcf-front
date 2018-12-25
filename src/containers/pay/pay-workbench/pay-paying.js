import {messages} from "utils/utils";
import React from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router';

import config from 'config'
import { Radio, Badge, Pagination, message, Alert, Icon, Dropdown, Menu, Modal, Form, DatePicker } from 'antd'
import Table from 'widget/table'
const FormItem = Form.Item;
import paymentService  from './pay-workbench.service'

import moment from 'moment';
import SearchArea from 'widget/search-area'
import PropTypes from 'prop-types';

class PayPaying extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      radioValue: 'online',
      partnerId: undefined,
      searchForm: [
        {
          type: 'list', colSpan: 6, event: 'COMPANY', isRequired:true,selectorItem:{
          title: messages('pay.select.pay.company'), //选择付款公司
          url: `${config.baseUrl}/api/companyBankAuth/get/own/info/lov/${this.props.user.userOID}`,
          searchForm: [
            { type: 'input', id: 'companyCode', label: messages('chooser.data.companyCode'/*公司代码*/)},
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
        }, //申请人
        {type: 'items', colSpan: 6, id: 'amountRange', items: [
          {type: 'input', colSpan: 6, id: 'amountFrom', label: messages('pay.amount.from')},//支付金额从
          {type: 'input', colSpan: 6, id: 'amountTo', label: messages('pay.amount.to')}//支付金额至
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
          {type: 'date', id: 'payDateFrom', label: messages('pay.date.from')}, //支付日期从
          {type: 'date', id: 'payDateTo', label: messages('pay.date.to')}
        ]},
      ],
      searchParams: {paymentCompanyId:this.props.company.id},
      columns: [//付款流水号
        {title: messages('pay.refund.billCode'), dataIndex: 'billcode', render: (value, record) => <a onClick={() => {this.checkPaymentDetail(record)}}>{value}</a>},
        {title: messages('pay.number.type'), dataIndex: 'documentNumber', render: (value, record) => {
            /*'单据编号 | 单据类型'*/
          return (
            <div>
              <a onClick={() => {this.checkPaymentDetail(record)}}>{value}</a>
              <span className="ant-divider"/>
              {record.documentTypeName}
            </div>
          )}
        },//付款批次号
        {title: messages('pay.batch.number'), dataIndex: 'customerBatchNo'},
        {title: messages('pay.number.applicant'), dataIndex: 'employeeName', render: (value, record) => {
           /* '工号 | 申请人',*/
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
        },  //收款方账号
        {title: messages('pay.refund.draweeAccountNumber'), dataIndex: 'payeeAccountNumber'},
        {title: messages('pay.date'), dataIndex: 'payDate', render: value => moment(value).format('YYYY-MM-DD')},
        {title: messages('common.column.status'), dataIndex: 'paymentStatusName', render: (state) => <Badge status='processing' text={state}/>},
        {title: messages('common.operation'), dataIndex: 'id', render: (id, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                <a onClick={() => this.handleSuccess(record)}>{messages('pay.confirm.success')}</a>
              </Menu.Item>
              <Menu.Item>
                <a onClick={() => this.handleFail(record)}>{messages('pay.confirm.failed')}</a>
              </Menu.Item>
            </Menu>
          );
          return (
            <div>
              <a onClick={() => {this.checkPaymentDetail(record)}}>{messages('pay.view')}</a>
              {record.paymentStatus !== 'W' && (
                <span>
                  <span className="ant-divider"/>
                  <Dropdown overlay={menu} placement="bottomRight"><a>{messages('common.more')}<Icon type="down" /></a></Dropdown>
                </span>
              )}
            </div>
          )}
        }
      ],
      okModalVisible: false, //确认成功modal
      failModalVisible: false, //确认失败modal
      record: {}, //点击行信息
      confirmSuccessLoading: false,
      confirmFailLoading: false,
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
      onlineWarningRows: [],  //超过12小时未更新状态行

      /* 落地文件 */
      fileLoading: false,
      fileData: [],
      filePage: 0,
      filePageSize: 10,
      filePagination: {
        total: 0
      },
      fileCash: [],  //总金额
      fileWarningRows: [],  //超过12小时未更新状态行
      paymentDetail:  "/pay/pay-workbench/payment-detail/:tab/:subTab/:id",    //支付详情
    };
  }

  componentWillMount() {
    let {searchForm} = this.state;
    this.props.subTab && this.setState({ radioValue: this.props.subTab });
    searchForm[0].defaultValue = paymentService.getDefaultCompany(this.props.user.userOID,this.props.company.id);
    this.setState({searchForm});
    this.getList()
  }

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
      fileCash: [],
      onlinePage: 0,
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
                  item.labelKey = 'name';
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
    if(type === 'COMPANY'){
      let companyIds=[];
      value.map(item=>companyIds.push(item.bankAccountCompanyId));
      this.setState({
          selectedRowKeys: [], //选中行key
          selectedRows: [],  //选中行
          searchParams: {...this.state.searchParams, paymentCompanyId: companyIds}},
        ()=>this.getList())
    }
    this.setState({ searchForm:searchForm,partnerId })
  };

  //查看支付流水详情
  checkPaymentDetail = (record) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: this.state.paymentDetail.replace(':tab', 'Paying').replace(':subTab', this.state.radioValue).replace(':id', record.id),
      })
    );
  };

  //确认成功弹框
  handleSuccess = (record) => {
    this.props.form.setFieldsValue({ date: undefined });
    this.setState({ record, okModalVisible: true })
  };

  //确认成功操作
  confirmSuccess = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let date = moment(values.date).format('YYYY-MM-DD');
        let params = {
          detailIds: [this.state.record.id],
          versionNumbers: [this.state.record.versionNumber]
        };
        this.setState({ confirmSuccessLoading: true });
        paymentService.confirmSuccess(params, date).then(res => {
          if (res.status === 200) {
            message.success(messages('common.operate.success'));
            this.setState({ confirmSuccessLoading: false, okModalVisible: false });
            this.getList()
          }
        }).catch(() => {
          this.setState({ confirmSuccessLoading: false });
          message.error(messages('common.operate.filed'))
        })
      }
    })
  };

  //确认失败弹框
  handleFail = (record) => {
    this.setState({ record, failModalVisible: true })
  };

  //确认失败操作
  confirmFail = () => {
    let params = {
      detailIds: [this.state.record.id],
      versionNumbers: [this.state.record.versionNumber]
    };
    this.setState({ confirmFailLoading: true });
    paymentService.confirmFail(params).then(res => {
      if (res.status === 200) {
        message.success(messages('common.operate.success'));
        this.setState({ failModalVisible: false, confirmFailLoading: false });
        this.getList()
      }
    }).catch(() => {
      this.setState({ confirmFailLoading: false });
      message.error(messages('common.operate.filed'))
    })
  };

  /*********************** 获取总金额 ***********************/

  //线上
  getOnlineCash = () => {
    paymentService.getAmount('ONLINE_PAYMENT', 'P', this.state.searchParams).then(res => {
      this.setState({ onlineCash: res.data })
    })
  };

  //落地文件
  getFileCash = () => {
    paymentService.getAmount('EBANK_PAYMENT', 'P', this.state.searchParams).then(res => {
      this.setState({ fileCash: res.data })
    })
  };

  /************************ 获取列表 ************************/

  //线上
  getOnlineList = (resolve, reject) => {
    const { onlinePage, onlinePageSize, searchParams } = this.state;
    this.setState({ onlineLoading: true });
    paymentService.getPayingList(onlinePage, onlinePageSize, 'ONLINE_PAYMENT', searchParams).then(res => {
      if (res.status === 200) {
        let onlineWarningRows = [];
        res.data.map(item => {
          if ((new Date().getTime() - new Date(item.payDate).getTime())/1000/60/60 > 12) {  //付款时间超过12小时
            onlineWarningRows.push(item)
          }
        });
        this.setState({
          onlineData: res.data,
          onlineLoading: false,
          onlineWarningRows,
          onlinePagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0
          }
        });
        reject && resolve()
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
    paymentService.getPayingList(filePage, filePageSize, 'EBANK_PAYMENT', searchParams).then(res => {
      if (res.status === 200) {
        let fileWarningRows = [];
        res.data.map(item => {
          if ((new Date().getTime() - new Date(item.payDate).getTime())/1000/60/60 > 12) {  //付款时间超过12小时
            fileWarningRows.push(item)
          }
        });
        this.setState({
          fileData: res.data,
          fileLoading: false,
          fileWarningRows,
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

  /************************ 内容渲染 ************************/

  //线上
  renderOnlineContent = () => {
    const { columns, onlineData, onlineLoading, onlinePageSize, onlinePagination, onlineCash, onlineWarningRows, pageSizeOptions } = this.state;
    const tableTitle = (
      <div>
        {messages('pay.paying')}
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
      <div className="paying-online">
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={onlineData}
               pagination={false}
               loading={onlineLoading}
               title={()=>{return tableTitle}}
               scroll={{x: true, y: false}}
               rowClassName={record => {
                 let warningFlag = false;
                 onlineWarningRows.map(item => {
                   item.id === record.id && (warningFlag = true)
                 });
                 return warningFlag ? 'row-warning' : ''
               }}
               bordered
               size="middle"/>
        {onlinePagination.total > 0 && <Pagination size="small"
                    defaultPageSize={onlinePageSize}
                    showSizeChanger
                    pageSizeOptions={pageSizeOptions}
                    total={onlinePagination.total}
                    showQuickJumper={true}
                    showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
                    onChange={this.onlinePaginationChange}
                    onShowSizeChange={this.onlinePaginationChange}
                    style={{margin:'16px 0', textAlign:'right'}} />}
      </div>
    )
  };

  //落地文件
  renderFileContent = () => {
    const { columns, fileData, fileLoading, filePageSize, filePagination, fileCash, fileWarningRows, pageSizeOptions } = this.state;
    const tableTitle = (
      <div>
        {messages('pay.paying')}
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
      <div className="paying-file">
        <Table rowKey={record => record.id}
               columns={columns}
               dataSource={fileData}
               pagination={false}
               loading={fileLoading}
               title={()=>{return tableTitle}}
               scroll={{x: true, y: false}}
               rowClassName={record => {
                 let warningFlag = false;
                 fileWarningRows.map(item => {
                   item.id === record.id && (warningFlag = true)
                 });
                 return warningFlag ? 'row-warning' : ''
               }}
               bordered
               size="middle"/>
        {filePagination.total > 0 && <Pagination size="small"
                    defaultPageSize={filePageSize}
                    showSizeChanger
                    pageSizeOptions={pageSizeOptions}
                    total={filePagination.total}
                    showQuickJumper={true}
                    showTotal={(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})}
                    onChange={this.filePaginationChange}
                    onShowSizeChange={this.filePaginationChange}
                    style={{margin:'16px 0', textAlign:'right'}} />}
      </div>
    )
  };
//日期限制
  disabledDate = (current) => {
    return current && current.valueOf() > Date.now();
  }
  /************************* End *************************/

  render(){
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 15, offset: 1 },
    };
    const { radioValue, searchForm, okModalVisible, failModalVisible, onlineWarningRows, fileWarningRows, confirmSuccessLoading, confirmFailLoading } = this.state;
    let warningItems = radioValue === 'online' ? onlineWarningRows : fileWarningRows;
    let warningRows = warningItems.map(item => {
      return (
        <div key={item.id}>
          {messages('pay.refund.billCode')}：{item.billcode}
          <span className="ant-divider" />
          {messages('pay.workbench.receiptType')}：{item.documentCategoryName}
        </div>
      )
    });
    return (
      <div className="pay-paying">
        <SearchArea searchForm={searchForm}
                    submitHandle={this.search}
                    clearHandle={this.clear}
                    eventHandle={this.eventHandle}
                    maxLength={4}
                    wrappedComponentRef={(inst) => this.formRef = inst}/>
        <Radio.Group value={radioValue} style={{margin:'20px 0'}}
                     onChange={(e) => {this.setState({ radioValue: e.target.value })}}>
          <Radio.Button value="online">{messages('pay.online')}</Radio.Button>
          <Radio.Button value="offline" disabled>{messages('pay.underline')}</Radio.Button>
          <Radio.Button value="file">{messages('pay.landing.file')}</Radio.Button>
        </Radio.Group>
        <Alert message={messages('pay.paying.tips')} type="info" showIcon style={{marginBottom:20}} />
        {warningRows.length > 0 && <Alert message={messages('pay.warning.tips')}
                                          description={warningRows}
                                          type="warning"
                                          style={{margin:'-10px 0 20px'}}
                                          showIcon />}
        {radioValue === 'online' && this.renderOnlineContent()}
        {radioValue === 'file' && this.renderFileContent()}
        <Modal visible={okModalVisible}
               confirmLoading={confirmSuccessLoading}
               onOk={this.confirmSuccess}
               onCancel={() => this.setState({ okModalVisible: false })}
               okText={messages('pay.confirm.success')}
               width={400}>
          <div style={{height:110}}>
            <span style={{marginRight:10,fontSize:14}}>
              <Icon type="exclamation-circle" style={{color:'#faad14', fontSize:22, marginRight:8, position:'relative', top:2}}/>
              {messages('pay.change.status')}
            </span>
            <Badge status="success" text={messages('pay.pay.success')}/>
            <div style={{fontSize:12,color:'red',marginLeft:29}}>{messages('pay.account.tips.third')}</div>
            <Form style={{marginLeft:29}}>
              <FormItem {...formItemLayout}
                        label={messages('pay.date.actual')}
                        style={{margin:'20px 0 10px'}}>
                {getFieldDecorator('date', {
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
        <Modal visible={failModalVisible}
               confirmLoading={confirmFailLoading}
               onOk={this.confirmFail}
               onCancel={() => this.setState({ failModalVisible: false })}
               okText={messages('pay.confirm.failed')}
               width={400}>
          <div style={{height:80, paddingTop:20}}>
            <span style={{marginRight:10,fontSize:14}}>
              <Icon type="exclamation-circle" style={{color:'#faad14', fontSize:22, marginRight:8, position:'relative', top:2}}/>
              {messages('pay.change.status')}
            </span>
            <Badge status="error" text={messages('pay.failed')}/>
            <div style={{fontSize:12,color:'red',marginLeft:29}}>{messages('pay.pay.account.tips')}</div>
          </div>
        </Modal>
      </div>
    )
  }

}

PayPaying.contextTypes = {
  router: PropTypes.object
};

PayPaying.propTypes = {
  subTab: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

const wrappedPayPaying = Form.create()(PayPaying);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedPayPaying);
