import React from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import config from 'config';
import {
  Popover,
  Alert,
  message,
  Tag,
  Row,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Modal,
} from 'antd';
import Table from 'widget/table'
import moment from 'moment';
import httpFetch from 'share/httpFetch';
import ExpreportDetail from 'containers/reimburse/my-reimburse/reimburse-detail';
import ContractDetail from 'containers/contract/my-contract/contract-detail';
import paymentRequisitionService from './paymentRequisitionService.service';
import 'styles/payment-requisition/payment-requisition-detail.scss'
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
class AddPaymentRequsition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        {
          type: 'input',
          id: 'reportNumber',
          label: this.$t('acp.reimburse.number'  /*报账单单号*/),
        },
        {
          type: 'select',
          id: 'documentTypeId',
          label: this.$t( 'acp.reimburse.type'  /*报账单类型*/),
          options: [],
          method: 'get',
          valueKey: 'formId',
          labelKey: 'formName',
        },
      ],
      columns: [
        {
          title: this.$t('acp.reimburse.number' /*报账单单号*/),
          dataIndex: 'reportNumber',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t( 'acp.reimburse.type'  /*报账单类型*/),
          dataIndex: 'reportTypeName',
          align: 'center',
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('acp.requisitionDate'  /*申请日期*/),
          dataIndex: 'requisitionDate',
          align: 'center',
          width: 90,
          render: recode => (
            <span>
              <Popover content={moment(recode).format('YYYY-MM-DD')}>
                {recode ? moment(recode).format('YYYY-MM-DD') : '-'}
              </Popover>
            </span>
          ),
        },
        {
          title: this.$t( 'acp.employeeName'  /*申请人*/),
          dataIndex: 'employeeName',
          align: 'center',
          width: 90,
          render: recode => (
            <span>
              <Popover content={recode}>{recode ? recode : '-'}</Popover>
            </span>
          ),
        },
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      searchParams: {},
      loading: true,
      typeParams: null,
      slideFrameTitle: '',
      showSlideFrame: false,
      slideParams: {},
      nowPage: 'type',
      lineData: {
        id: '',
        cshTransactionId: '', //来源待付ID
        refDocumentType: '', //关联单据类型
        refDocumentId: '', //关联单据头ID
        refDocumentLineId: '', //关联单据行ID，
        companyId: '', //机构ID
        partnerCategory: '', //收款对象
        partnerId: '', //收款对象ID
        cshTransactionClassId: '', //现金事务分类ID
        cshTransactionClassName: '', // 付款用途
        cashFlowItemId: '', //现金流量项ID
        exchangeRate: '', //汇率
        functionAmount: '', //本位币金额
        accountName: '', //银行户名
        accountNumber: '', //银行户名
        bankLocationCode: '', //分行代码
        bankLocationName: '', //分行名称
        provinceCode: '', //省份代码
        province: '', //省份名称
        cityCode: '', //城市代码
        cityName: '', //城市名称
        contractHeaderId: '', //关联合同ID
        paymentScheduleLineId: '', //资金计划行ID
        versionNumber: '',
        availableAmount: 0, //可支付金额
        freezeAmount: 0, //冻结总金额
        payeeName: '', //收款方
        contractNumber: '', //合同编号
        contractLineNumber: '', //付款计划序号
        contractDueDate: '', //付款计划日期
        cshTransactionTypeCode: '', //cshTransactionTypeCode
        // refDocumentNumber: '',//报账单单号
        currency: '', //币种
        // paymentMethodCategory:''//付款方式类型
        scheduleLineNumber: '', //付款计划序号
        schedulePaymentDate: '', //付款计划日期
      },
      payWayTypeList: [], //付款方式
      currencyList: [], //币种
      showExpreportDetail: false, //报账单详情
      detailId: undefined, //合同或者报账单ID
      showContractDetail: false, //合同详情
      headerData: {},
      addLineData: {},
      isAddLine: false,
      employeeBankList: [],
      vendorBankList: [],
      isReload: false,
    };
  }
  componentWillMount() {
    this.getPayWayTypeList();
  }

  componentDidMount() {
    this.setState(
      {
        nowPage: 'type',
        isAddLine: false,
        typeParams: this.props.params.typeDeatilParams,
        headerData: this.props.params.headerData,
      },
      () => {
        this.getList();
        let url = `${config.baseUrl}/api/expReportHeader/custom/forms/setOfBooksId?roleType=TENANT&setOfBooksId=${this.props.company.setOfBooksId}`
        httpFetch.post(url,this.props.params.typeDeatilParams.formTypes)
        .then(res => {
          let list = [];
          res.data.map(item => {
            list.push({ value: item.formId, label: item.formName});
          });
          let form = this.state.searchForm;

          form[1].options = list;

          this.setState({ searchForm: form });
        });
      }
    );
  }
  search = param => {
    this.setState({ searchParams: param, loading: true }, () => {
      this.getList();
    });
  };
  clear = () => {
    this.setState({ searchParams: {}, loading: true }, () => {
      this.getList();
    });
  };
  //获取表格数据
  getList = () => {
    let searchParams = { ...this.state.searchParams };
    let { page, pageSize, typeParams } = this.state;
    let url = `${
      config.payUrl
    }/api/cash/transactionData/relation/query?page=${page}&size=${pageSize}&applicationId=${
      typeParams.applicationId
    }&allType=${typeParams.allType}`;
    for (let key in searchParams) {
      if (searchParams[key]) {
        url += `&${key}=${searchParams[key]}`;
      }
    }
    httpFetch
      .post(url,typeParams.formTypes)
      .then(res => {
        this.setState({
          data: res.data,
          loading: false,
          pagination: {
            total: Number(res.headers['x-total-count']) ? Number(res.headers['x-total-count']) : 0,
            onChange: this.onChangePager,
            current: this.state.page + 1,
            showTotal: (total, range) =>
              this.$t(
                 'common.show.total' ,
                { range0: `${range[0]}`, range1: `${range[1]}`, total: total }
              ),
            showSizeChanger: true,
            showQuickJumper: true,
            onShowSizeChange: this.sizeChange,
            pageSizeOptions: ['10', '20', '30', '40'],
          },
        });
      })
      .catch(e => {
        message.error(this.$t( 'acp.getData.error'  /*获取数据失败!*/) + e.res.data.message);
        this.setState({ loading: false });
      });
  };
  onChangePager = page => {
    if (page - 1 !== this.state.page)
      this.setState(
        {
          page: page - 1,
          loading: true,
        },
        () => {
          this.getList();
        }
      );
  };
  //改变每页显示条数
  sizeChange = (page, size) => {
    this.setState(
      {
        pageSize: size,
        page: page - 1,
        loading: true,
      },
      this.getList
    );
  };
  //双击选中需要付款行
  handleRowClick = record => {
    const { id, versionNumber } = this.props.params.headerData;
    record.schedulePaymentDate && (record.schedulePaymentDate = moment(record.schedulePaymentDate));
    this.setState(
      {
        isReload: true,
        addLineData: record,
        nowPage: 'form',
        lineData: {
          // id,
          versionNumber,
          cshTransactionId: record.cshTransactionId, //来源待付ID
          refDocumentType: 'PUBLIC_REPORT', //关联单据类型
          refDocumentId: record.expReportHeaderId, //关联单据头ID
          refDocumentLineId: record.scheduleLineId, //关联单据行ID，
          companyId: record.companyId, //机构ID
          partnerCategory: record.payeeCategory, //收款对象
          partnerId: record.payeeId, //收款对象ID
          cshTransactionTypeCode: record.cshTransactionTypeCode, //现金事务类型代码
          cshTransactionClassId: record.cshTransactionClassId, //现金事务分类ID
          cshTransactionClassName: record.cshTransactionClassName, // 付款用途
          cashFlowItemId: record.cashFlowItemId, //现金流量项ID
          exchangeRate: record.exchangeRate, //汇率
          currencyCode: record.currency, //币种
          amount: record.availableAmount, //原币金额
          availableAmount: record.availableAmount, //可支付金额
          freezeAmount: record.amount, //冻结金额
          functionAmount: record.functionalAmount, //本位币金额
          accountName: record.accountName, //银行户名
          accountNumber: record.accountNumber, //银行户名
          bankLocationCode: record.bankLocationCode, //分行代码
          bankLocationName: record.bankLocationName, //分行名称
          provinceCode: record.provinceCode, //省份代码
          province: record.provinceName, //省份名称
          cityCode: record.cityCode, //城市代码
          cityName: record.cityName, //城市名称
          payeeName: record.payeeName, //收款方
          contractHeaderId: record.contractHeaderId, //关联合同ID
          paymentScheduleLineId: record.contractLineId, //资金计划行ID,
          contractNumber: record.contractNumber, //合同编号
          contractLineNumber: record.contractLineNumber, //合同行序号
          contractDueDate: record.contractDueDate, //付款计划日期
          scheduleLineNumber: record.scheduleLineNumber, //付款计划序号
          schedulePaymentDate: record.schedulePaymentDate, //付款计划日期
        },
        isAddLine: true,
      },
      () => {
        this.props.form.setFieldsValue({
          accountNumber: record.accountNumber,
          refDocumentNumber: record.reportNumber,
          paymentMethodCategory: record.paymentMethod,
          schedulePaymentDate: record.schedulePaymentDate,
          currencyCode: record.currency,
          amount: record.availableAmount,
        });
        this.getBankList(this.state.lineData.partnerId, this.state.lineData.partnerCategory);
      }
    );
  };


  //获取银行账号列表
  getBankList = (parterId, partnerCategory) => {
    if (partnerCategory === 'EMPLOYEE') {
      httpFetch
        .get(`${config.baseUrl}/api/contact/bank/account/user/id?userID=${parterId}`)
        .then(res => {
          this.setState({
            employeeBankList: res.data,
          });
        });
    } else {
      httpFetch.get(`${config.vendorUrl}/api/ven/bank?vendorInfoId=${parterId}`).then(res => {
        this.setState({
          vendorBankList: res.data.body,
        });
      });
    }
  };
  // 渲染额外行
  expandedRowRender = record => {
    const columns = [
      {
        title: this.$t( 'acp.index'  /*序号*/),
        dataIndex: 'scheduleLineNumber',
        key: 'scheduleLineNumber',
        width: 80,
        render: value => {
          return (
            <Popover content={value} overlayStyle={{ maxWidth: 300 }}>
              {value}
            </Popover>
          );
        },
      },
      {
        title: this.$t('acp.partnerCategory'  /*收款方*/),
        dataIndex: 'payeeId',
        width: 150,
        render: (value, record) => {
          return (
            <div style={{ whiteSpace: 'normal' }}>
              <Tag color="#000">
                {record.payeeCategory === 'EMPLOYEE'
                  ? this.$t('acp.employee'  /*员工*/)
                  : this.$t('acp.vendor'  /*供应商*/)}
              </Tag>
              <Popover
                placement="topLeft"
                content={record.payeeName}
                overlayStyle={{ maxWidth: 300 }}
              >
                {record.payeeName}
              </Popover>
            </div>
          );
        },
      },
      {
        title: this.$t( 'acp.currency' /*币种*/),
        dataIndex: 'currency',
        key: 'currency',
        width: 70,
      },
      {
        title: this.$t('acp.public.total.amount'  /*延后支付金额*/),
        dataIndex: 'amount',
        key: 'amount',
        width: 120,
        render: value => {
          return (
            <Popover content={this.filterMoney(value, 2)} overlayStyle={{ maxWidth: 300 }}>
              {this.filterMoney(value, 2)}
            </Popover>
          );
        },
      },
      {
        title: this.$t( 'acp.enabled.amount' ),
        dataIndex: 'availableAmount',
        key: 'availableAmount',
        width: 120,
        render: value => {
          return (
            <Popover content={this.filterMoney(value, 2)} overlayStyle={{ maxWidth: 300 }}>
              {this.filterMoney(value, 2)}
            </Popover>
          );
        },
      },
      {
        title: this.$t( 'acp.available.amount'  /*已申请金额*/),
        dataIndex: 'associatedAmount',
        key: 'associatedAmount',
        width: 120,
        render: value => {
          return (
            <Popover content={this.filterMoney(value, 2)} overlayStyle={{ maxWidth: 300 }}>
              {this.filterMoney(value, 2)}
            </Popover>
          );
        },
      },
    ];
    let data = record.lineList.map(item => {
      return { ...item, reportNumber: record.reportNumber, reportHeadId: record.reportHeadId };
    });
    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        onRow={record => ({
          onDoubleClick: () => this.handleRowClick(record),
        })}
      />
    );
  };
  //侧滑框
  showSlide = flag => {
    this.setState({
      showSlideFrame: flag,
    });
  };
  //关闭侧滑框
  closeFunc = e => {
    this.showSlide(false);
  };
  //侧滑框关闭后回调
  handleCloseSlide = flag => {
    this.showSlide(false);
    flag && this.getList();
    //this.props.close(true)
  };
  //校验可支付
  checkAmount = (rule, value, callback) => {
    if (value && value > this.state.lineData.availableAmount) {
      callback(
        this.$t('acp.payment.amountError'  /* 本次申请金额大于可申请金额：*/) +
          this.state.lineData.availableAmount
      );
    } else if (value <= 0) {
      callback(this.$t( 'acp.amount.mustMoreThanZero' /* 本次申请金额必须大于0!*/));
    } else {
      callback();
    }
  };
  //报账单返回
  onCloseExpreport = () => {
    this.setState({ showExpreportDetail: false });
  };
  //报账单详情链接
  detail = id => {
    this.setState({
      detailId: id,
      showExpreportDetail: true,
    });
  };
  //获取付款方式类型
  getPayWayTypeList = () => {
    this.getSystemValueList(2105).then(res => {
      this.setState({ payWayTypeList: res.data.values });
    });
  };
  //获取币种列表
  getCurrencyList = () => {
    if (this.state.currencyList.length === 0) {
      httpFetch.get(`${config.baseUrl}/api/company/standard/currency/getAll`).then(res => {
        this.setState({ currencyList: res.data });
      });
    }
  };
  //四舍五入 保留两位小数
  toDecimal2 = x => {
    let f = parseFloat(x);
    if (isNaN(f)) {
      return false;
    }
    f = Math.round(x * 100) / 100;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  };
  //金额失去焦点
  amountBlur = () => {
    let amount = this.props.form.getFieldValue('amount');
    let value = parseFloat(this.toDecimal2(amount));
    if (value > this.state.lineData.availableAmount) {
      value = this.state.lineData.availableAmount;
    }
    this.props.form.setFieldsValue({ amount: this.toDecimal2(value) });
  };
  //合同返回
  onCloseContract = () => {
    this.setState({ showContractDetail: false });
  };
  //查看合同
  onViewContractDetail = id => {
    this.setState({ showContractDetail: true, detailId: id });
  };
  wrapClose = content => {
    let id = this.state.detailId;
    const newProps = {
      params: { id: id, refund: true },
    };
    return React.createElement(content, Object.assign({}, newProps.params, newProps));
  };
  //添加付款申请保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { lineData, headerData, addLineData } = this.state;
        if (lineData.availableAmount < values.amount) {
          message.error(
            this.$t('acp.payment.amountError'  /* 本次申请金额大于可申请金额：*/)
          );
          return;
        }
        let acpRequisitionLine = { ...addLineData, ...lineData, ...values };
        let acpRequisitionLineDTO = [];
        acpRequisitionLineDTO.push(acpRequisitionLine);
        let AcpRequisitionHeaderDTO = { ...headerData };
        AcpRequisitionHeaderDTO['paymentRequisitionLineDTO'] = acpRequisitionLineDTO;
        this.setState({ loading: true }, () => {
          paymentRequisitionService
            .saveFunc(AcpRequisitionHeaderDTO)
            .then(res => {
              if (res.status === 200) {
                this.props.onClose(true);
                message.success(this.$t( 'common.operate.success' /*操作成功*/));
                this.setState({ loading: false, isReload: false });
              }
            })
            .catch(e => {
              this.setState({ loading: false, isReload: false });
              this.props.onClose(true);
              message.error(
                this.$t( 'common.operate.filed'  /*操作失败*/) + '!' + e.response.data.message
              );
            });
        });
      }
    });
  };
  //侧滑框关闭
  onCancel = () => {
    this.props.onClose(false);
  };
  render() {
    const {
      searchForm,
      columns,
      data,
      loading,
      slideFrameTitle,
      showSlideFrame,
      nowPage,
      lineData,
      payWayTypeList,
      currencyList,
      addLineData,
      isAddLine,
      vendorBankList,
      employeeBankList,
      isReload,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 13, offset: 1 },
    };

    return (
      <div className="header-title add-payment-content">
        <div className={`payment-container page-${nowPage}`}>
          <Row gutter={30}>
            <Col span={12} className="payment-type">
              <SearchArea
                searchForm={searchForm}
                submitHandle={this.search}
                clearHandle={this.clear}
              />
              <div className="divider" />
              <Alert
                message={this.$t('acp.alert.message'  /*请双击选中需要付款的行信息*/)}
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
              <Table
                size="middle"
                className="components-table-demo-nested"
                bordered
                columns={columns}
                dataSource={data}
                loading={loading}
                expandedRowRender={this.expandedRowRender}
              />
            </Col>
            {isReload && (
              <Col span={12} className="payment-form">
                <div className="new-payment-requisition-line">
                  <Form>
                    <div className="common-item-title">
                      {this.$t( 'acp.select.publicReport' /* 请先选择报账单*/)}
                    </div>
                    <Row>
                      <Col
                        span={5}
                        className="ant-form-item-label ant-form-item-required label-style"
                      >
                        {this.$t( 'acp.publicReport'  /* 报账单:*/)}{' '}
                      </Col>
                      <Col span={13} className="ant-col-offset-1">
                        <FormItem>
                          {getFieldDecorator('refDocumentNumber', {
                            rules: [
                              {
                                required: true,
                                message: this.$t(
                                   'acp.select.publicReport'  /* 请先选择报账单*/
                                ),
                              },
                            ],
                            //initialValue: addLineData.reportNumber
                          })(<Select
                            onDropdownVisibleChange={()=>{this.setState({isReload: false,nowPage: 'type'})}}
                            dropdownStyle={{ display: 'none' }}
                          />)}
                        </FormItem>
                      </Col>
                      <Col span={2} style={{marginLeft: 15, marginTop: 10}} className="ant-col-offset-1">
                        {lineData.refDocumentId === '' ? (
                          ''
                        ) : (
                          <a
                            onClick={() => {
                              this.detail(lineData.refDocumentId);
                            }}
                          >
                            {this.$t( 'acp.view.detail'  /* 查看详情*/)}
                          </a>
                        )}
                      </Col>
                    </Row>
                    <Row style={{ fontSize: '12px' }}>
                      <Col span={6} className="ant-form-item-label" />
                      <Col
                        span={13}
                        className="ant-col-offset-1"
                        style={{ margin: '-20px 0px 10px 0px' }}
                      >
                        付款计划序号&nbsp;:&nbsp;&nbsp;{lineData.scheduleLineNumber}&nbsp;&nbsp;|&nbsp;&nbsp;付款计划日期&nbsp;&nbsp;:&nbsp;&nbsp;{moment(
                          lineData.schedulePaymentDate
                        ).format('YYYY-MM-DD')}
                      </Col>
                    </Row>
                    <div className="common-item-title">
                      {this.$t( 'acp.detail'  /* 详情*/)}
                    </div>
                    <FormItem {...formItemLayout} label="收款方类型">
                      <Input
                        disabled
                        value={
                          lineData.partnerCategory !== ''
                            ? lineData.partnerCategory === 'EMPLOYEE'
                              ? this.$t( 'acp.employee'  /*员工*/)
                              : this.$t('acp.vendor'  /*供应商*/)
                            : ''
                        }
                      />
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label={this.$t( 'acp.partnerCategory'  /* 收款方*/)}
                    >
                      <Input disabled value={lineData.payeeName} />
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label={this.$t('acp.bank.number' /*银行账号*/)}
                    >
                      {getFieldDecorator('accountNumber', {
                        rules: [
                          {
                            required: true,
                            message: this.$t('common.please.select'  /*请选择*/),
                          },
                        ],
                        //initialValue: lineData.accountNumber
                      })(
                        <Select>
                          {lineData.partnerCategory === 'EMPLOYEE'
                            ? employeeBankList.map(item => {
                                return <Option key={item.bankCode}>{item.bankAccountNo}</Option>;
                              })
                            : vendorBankList.map(item => {
                                return <Option key={item.bankCode}>{item.bankAccount}</Option>;
                              })}
                        </Select>
                      )}
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label={this.$t('acp.accountName.detail'  /* 收款方户名*/)}
                    >
                      <Input
                        disabled
                        value={lineData.accountName === '' ? '-' : lineData.accountName}
                      />
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label={this.$t('acp.cshTransactionClassName'  /*付款用途*/)}
                    >
                      <Input
                        disabled
                        value={
                          lineData.cshTransactionClassName !== ''
                            ? lineData.cshTransactionClassName
                            : '-'
                        }
                      />
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label={this.$t( 'acp.paymentMethodType'  /*付款方式类型*/)}
                    >
                      {getFieldDecorator('paymentMethodCategory', {
                        rules: [
                          {
                            required: true,
                            message: this.$t( 'common.please.select'  /*请选择*/),
                          },
                        ],
                        //initialValue: addLineData.paymentMethod
                      })(
                        <Select style={{ width: '100%' }}>
                          {payWayTypeList.map(item => {
                            return <Option key={item.code}>{item.messageKey}</Option>;
                          })}
                        </Select>
                      )}
                    </FormItem>
                    <FormItem
                      {...formItemLayout}
                      label={this.$t( 'acp.schedulePaymentDate' /*计划付款日期*/)}
                    >
                      {getFieldDecorator('schedulePaymentDate', {
                        rules: [
                          {
                            required: true,
                            message: this.$t( 'common.please.select'  /*请选择*/),
                          },
                        ],
                        //initialValue: moment(lineData.schedulePaymentDate)
                      })(<DatePicker style={{ width: '100%' }} />)}
                    </FormItem>
                    <Row>
                      <Col
                        span={5}
                        className="ant-form-item-label ant-form-item-required label-style"
                      >
                        {this.$t('acp.requisition.amount'  /*本次申请金额*/)}：{' '}
                      </Col>
                      <Col span={6} className="ant-col-offset-1">
                        <FormItem>
                          {getFieldDecorator('currencyCode', {
                            rules: [
                              {
                                required: true,
                                message: this.$t( 'common.please.select'  /*请选择*/),
                              },
                            ],
                            //initialValue: lineData.currencyCode
                          })(
                            <Select disabled={true}>
                              {currencyList.map(item => {
                                return <Option key={item.currency}>{item.currencyName}</Option>;
                              })}
                            </Select>
                          )}
                          <div style={{ marginTop: '2px' }}>
                            {this.$t('acp.delay.amount'  /*冻结总金额：*/)}
                            {lineData.currencyCode}
                            {this.filterMoney(lineData.freezeAmount)}
                          </div>
                        </FormItem>
                      </Col>
                      <Col span={7} style={{ marginLeft: 3 }}>
                        <FormItem className="ant-col-offset-1">
                          {getFieldDecorator('amount', {
                            rules: [
                              {
                                required: true,
                                message: this.$t('common.please.enter'  /*请输入*/),
                              },
                              { validator: this.checkAmount },
                            ],
                            //initialValue: lineData.availableAmount
                          })(
                            <InputNumber
                              onBlur={this.amountBlur}
                              placeholder={this.$t('common.please.enter'  /*请输入*/)}
                              style={{ width: '100%' }}
                              step={0.01}
                              percision={2}
                            />
                          )}
                          <div style={{ marginTop: '2px' }}>
                            {this.$t('acp.enabled.amount' /*可申请金额：*/)}
                            {lineData.currencyCode}
                            {this.filterMoney(lineData.availableAmount)}
                          </div>
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={5} className="ant-form-item-label  label-style">
                        关联合同
                      </Col>
                      <Col span={13} className="ant-col-offset-1">
                        <FormItem>
                          <Input
                            disabled
                            value={lineData.contractNumber ? lineData.contractNumber : '-'}
                          />
                        </FormItem>
                      </Col>
                      <Col span={2} className="ant-col-offset-1">
                        {lineData.contractLineNumber === '' ||
                        lineData.contractLineNumber === null ? (
                          ''
                        ) : (
                          <a
                            onClick={() => {
                              this.onViewContractDetail(lineData.contractHeaderId);
                            }}
                          >
                            {this.$t( 'acp.view.detail'  /*查看详情*/)}
                          </a>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col span={5} />
                      <Col
                        span={4}
                        className="ant-col-offset-1"
                        style={{ marginTop: '-20px', marginBottom: '20px' }}
                      >
                        {lineData.contractLineNumber === '' || lineData.contractLineNumber === null
                          ? ''
                          : this.$t( 'acp.contract.lineNumber'  /*付款计划序号：*/) +
                            lineData.contractLineNumber}
                      </Col>
                      <Col
                        span={8}
                        className="ant-col-offset-1"
                        style={{ marginTop: '-20px', marginBottom: '20px' }}
                      >
                        {lineData.contractDueDate === '' || lineData.contractDueDate === null
                          ? ''
                          : this.$t( 'acp.contract.date'  /*付款计划日期：*/) +
                            lineData.contractDueDate}
                      </Col>
                    </Row>
                    <FormItem {...formItemLayout} label={this.$t( 'acp.remark' /*备注*/)}>
                      {getFieldDecorator('lineDescription', {
                        initialValue: '',
                      })(
                        <TextArea
                          autosize={{ minRows: 2 }}
                          style={{ minWidth: '100%' }}
                          placeholder={this.$t( 'common.please.enter'  /*请输入*/)}
                        />
                      )}
                    </FormItem>
                  </Form>
                </div>
              </Col>
            )}
          </Row>
        </div>
        {isAddLine && (
          <div className="footer-operate">
            <Button
              type="primary"
              style={{ marginRight: '20px' }}
              onClick={this.handleSave}
              loading={loading}
            >
              {this.$t({ id: 'common.save' } /*保存*/)}
            </Button>
            <Button onClick={this.onCancel}>{this.$t( 'common.cancel'  /*取消*/)}</Button>
          </div>
        )}
        <Modal
          visible={this.state.showExpreportDetail}
          footer={[
            <Button key="back" size="large" onClick={this.onCloseExpreport}>
              {this.$t('common.back' /*返回*/)}
            </Button>,
          ]}
          width={1200}
          closable={false}
          destroyOnClose={true}
          onCancel={this.onCloseExpreport}
        >
          <div>{this.wrapClose(ExpreportDetail)}</div>
        </Modal>
        <Modal
          visible={this.state.showContractDetail}
          footer={[
            <Button key="back" size="large" onClick={this.onCloseContract}>
              {this.$t('common.back'  /*返回*/)}
            </Button>,
          ]}
          width={1200}
          destroyOnClose={true}
          closable={false}
          onCancel={this.onCloseContract}
        >
          <div>{this.wrapClose(ContractDetail)}</div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    languages: state.languages,
  };
}
const wrappedAddPaymentRequsition = Form.create()(AddPaymentRequsition);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedAddPaymentRequsition);
