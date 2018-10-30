/**
 * Created by Allen on 2018/5/8.
 */
import React from 'react'
import { routerRedux } from "dva/router";
import { Form, Tabs, Button, Badge, Menu, Modal, Radio, Dropdown, Row, Col, Spin, Table, Timeline, message, Popover, Popconfirm, Icon, Select } from 'antd'
const TabPane = Tabs.TabPane;
import SearchArea from 'components/Widget/search-area'
import moment from 'moment'
import config from 'config';
import SlideFrame from 'components/Widget/slide-frame'
import ExpenseReverseInfo from 'containers/financial-management/expense-reverse/expense-reverse-info'
import NewExpenseInfo from 'containers/financial-management/expense-reverse/new-expense-info'
import EditReverseInfo from 'containers/financial-management/expense-reverse/edit-reverse-info'
import ExpenseInfo from 'containers/financial-management/expense-reverse/expense-info'
import UnpaidReverseInfo from 'containers/financial-management/expense-reverse/unpaid-reverse-info'
import NewPayInfo from 'containers/financial-management/expense-reverse/new-pay-info'
import EditUnpaidInfo from 'containers/financial-management/expense-reverse/edit-unpaid-info'
import ApproveHistory from "containers/financial-management/reimburse-review/approve-history-work-flow"
import reimburseService from '../../reimburse/my-reimburse/reimburse.service'
import reverseService from 'containers/financial-management/expense-reverse/expense-reverse.service'
import Invoice from "containers/reimburse/invoice"
import 'styles/financial-management/expense-reverse/reverse-detail.scss'
import DocumentBasicInfo from "components/Widget/document-basic-info";
import CostDetail from 'containers/financial-management/expense-reverse/cost-detail'
import PayInfo from 'containers/financial-management/expense-reverse/pay-info'
import ApprotionInfo from 'containers/financial-management/expense-reverse/approtion-info'
import AttachmentInformation from 'containers/financial-management/expense-reverse/attachment-information'
import { connect } from 'dva';
import PropTypes from 'prop-types'
class ReverseDetailCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNew: false,
      detailLoading: false,
      descriptionLoading: false,
      modalRecord: {},
      headerData: {
        reverseHeader: {},
        documentHeader: {}
      },
      modalData:[],
      lineDtos: [],
      dataChange: false,
      addLoading: true,
      documentParams: {},
      selectedRowKeys: [],  //选中的项
      contractStatus: {
        6002: { label: this.$t({ id: "my.contract.state.cancel" }/*已取消*/), state: 'default' },
        6003: { label: this.$t({ id: "my.contract.state.finish" }/*已完成*/), state: 'success' },
        1001: { label: this.$t({ id: "my.contract.state.generate" }/*编辑中*/), state: 'processing' },
        6001: { label: this.$t({ id: "my.contract.state.hold" }/*暂挂*/), state: 'warning' },
        1002: { label: this.$t({ id: "my.contract.state.submitted" }/*审核中*/), state: 'processing' },
        1005: { label: this.$t({ id: "my.contract.state.rejected" }/*已驳回*/), state: 'error' },
        1004: { label: this.$t({ id: "my.contract.state.confirm" }/*已通过*/), state: 'success' },
        1003: { label: this.$t({ id: "my.contract.state.withdrawal" }/*已撤回*/), state: 'warning' },
        2004: { label: this.$t({id:'exp.pay.success'} /*支付成功*/), state: 'success' },
        2003: { label: this.$t({id:'exp.pay.paying'} /*支付中*/) , state: 'processing' },
        2002: { label: this.$t({id:'constants.approvelHistory.auditPass'}), state: 'success' },
      },
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      visible: false,
      addExpensePagination:{
        page: 0,
        size: 10,
      },
      modalColumns: [
        { title: this.$t({id:'common.sequence'}), align: "center", dataIndex: "index", key: "index", width: 60,
          render: (value, record, index) => index + 1
        },
        {      //费用类型
          title: this.$t({id:'common.expense.type'}), dataIndex: 'expenseTypeName', key: 'expenseTypeName', width: 100
        },    //发生日期
        {title: this.$t({id:'common.happened.date'}), dataIndex: 'createdDate', key:'createdDate', width: 110, render: desc =>
          <span>{moment(desc).format('YYYY-MM-DD')}</span>
        },
        {     //金额
          title: this.$t({id:'common.amount'}), dataIndex: 'amount', key: 'amount', width: 90, render: this.filterMoney
        },
        {     //本位币金额
          title: this.$t({id:'common.base.currency.amount'}), dataIndex: 'baseAmount', key: 'baseAmount' ,width: 100, render: this.filterMoney
        },
        {
          title: this.$t({id:'common.comment'}), dataIndex: 'comment', key:'comment'
        },
        {      //'查看信息'
          title: this.$t({id:'exp.dir.info'}), dataIndex: 'checkInfo',render: (value, record) => {
          return (
            <div>
              {record.vatInvoice && <a onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showInvoiceDetail(record)
              }}>{this.$t({id:'exp.invoice.info'}/*发票信息*/)}</a>}
              {record.vatInvoice && <span className="ant-divider" />}
              <a onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showApprotion(record)
              }}>{this.$t({id:'exp.detail.info'})}</a>
              <span className="ant-divider" />
              <a onClick={e=>{
                e.preventDefault();
                e.stopPropagation();
                this.showAttInfo(record)
              }}>{this.$t({id:'common.attachments'})}</a>
            </div>
          )
        }
        }
      ],
      searchForm: [
        {
          type: 'list',
          id: 'expenseType',
          label: this.$t({id:'common.expense.type'}), //费用类型
          getUrl: `${config.baseUrl}/api/expense/adjust/types/getExpenseType`,
          //getUrl: '',
          selectorItem:{
            title: this.$t({ id: "itemMap.expenseType" }),
            url: `${config.baseUrl}/api/report/reverse/get/expense/type/by/reverse/id`,
            searchForm: [
              { type: 'input', id: 'expenseTypeName', label: this.$t({ id: "itemMap.expenseTypeName" }) },
            ],
            columns: [
              {
                title: this.$t({ id: "itemMap.icon" }), dataIndex: 'iconURL',
                render: (value) => {
                  return <img src={value} height="20" width="20" />
                }
              },
              { title: this.$t({ id: "itemMap.expenseTypeName" }), dataIndex: 'name' },
              {
                title: this.$t({ id: "common.column.status" }), dataIndex: 'enabled',
                render: isEnabled => (
                  <Badge status={isEnabled ? 'success' : 'error'}
                         text={isEnabled ? this.$t({ id: "common.status.enable" }) : this.$t({ id: "common.status.disable" })} />
                )
              },
            ],
            //listKey: 'expenseTypes',
            key: 'id'
          },
          listExtraParams:{reverseHeaderId: this.props.id, },
          single: true,
          itemMap: true,
          labelKey:'name',
          valueKey:'id'
        },
        /*{
         type: 'datePicker',
         id: 'createDate',
         label: '发生日期',
         },*/
        {
          type: 'items',
          id: 'applyDate',
          items: [                                   //发生日期从
            { type: 'date', id: 'applyDateFrom', label: this.$t({id:'exp.happen.date.from'}),event: 'DATE_FROM'},
            { type: 'date', id: 'applyDateTo', label: this.$t({id:'exp.happen.date.to'}),event:'DATE_TO' }
          ],
        },
        {
          type: 'items',
          id: 'amountRange',
          items: [
            { type: 'input', id: 'amountFrom', label: this.$t({id:'approve.request.moneyFrom'}) },
            { type: 'input', id: 'amountTo', label: this.$t({id:'approve.request.moneyTo'}) }
          ]
        }
      ],
      editReverseVisible: false,  //编辑费用行slideFrame
      detailVisible: false,       //查看原费用详情slideFrame
      payInfoVisible: false,      //新增支付信息的slideFrame
      editUnpaidVisible: false,    //编辑未支付冲销信息的slideFrame
      showInvoiceDetail: false,    //展示发票信息的弹窗
      invoiceData: {},
      isLoadExpenseLineData: false,
      newExpenseVisible: false,
      isLoadCostData: false,
      isLoadPayData: false,
      approveHistory: [],
      slideFrameTitle: '',
      reverseRecord: {},
      costRecord: {},
      flag: true,
      historyFlag: true,
      showInvoices: false,
      invoicesLoading: false,
      historyLoading: false,
      // newReverse: menuRoute.getRouteItem('update-reverse','key'),
      // expenseReverse: menuRoute.getRouteItem('expense-reverse','key'),  //费用反冲页
    }
  }

  //显示附件信息
  showAttInfo = (record)=>{
    this.setState({showAttInfo: true,modalRecord: record})
  };

  //显示分摊行
  showApprotion = (record) => {
    this.setState({
      modalRecord: record,
      showApprotion: true
    })
  };

  componentDidMount(){
    if (this.state.flag && this.props.headerData.documentHeader){
      this.setState({ flag: false }, () => {
        reimburseService.getDefaultApportion(this.props.headerData.documentHeader.documentId).then(res => {
          this.setState({ defaultApportion: res.data });
        }).catch(err => {
          message.error(this.$t({id:"exp.get.info.failed"}));
        });
      });
    }

    if (this.state.historyFlag && this.props.id) {
      this.setState({ historyFlag: false }, () => {
        this.setState({historyLoading: true});
        reverseService.getApproveHistory(this.props.id).then(res => {
          this.setState({ approveHistory: res.data, historyLoading: false });
        }).catch(err => {
          this.setState({historyLoading: false});
          message.error(this.$t({id:'exp.get.approve.history.failed'}));
        });
      });

    }

    if (this.props.headerData.reverseHeader){
      let documentParams = {
        businessCode: this.props.headerData.reverseHeader.reportReverseNumber,
        createdDate: moment(this.props.headerData.reverseHeader.creatDate).format('YYYY-MM-DD'),
        formName: this.$t({id:'detail.expense.reverse'}),
        createByName: this.props.headerData.documentHeader.applyName,
        totalAmount: this.props.headerData.reverseHeader.amount,
        statusCode: this.props.headerData.reverseHeader.status,
        currencyCode: this.props.headerData.reverseHeader.currencyCode,
        remark: this.props.headerData.reverseHeader.description,
        infoList: [
          { label: this.$t({id:'common.applicant'}), value: this.props.headerData.reverseHeader.employeeName },
          { label: this.$t({id:'exp.company'}), value: this.props.headerData.reverseHeader.companyName },
          { label: this.$t({id:'common.department'}), value: this.props.headerData.reverseHeader.departmentName },
          { label: this.$t({id:'ye.wu.da.lei'}), value: this.props.headerData.reverseHeader.businessClassName },
          { label: this.$t({id:'detail.source.report.number'}), value: this.props.headerData.reverseHeader.sourceReportHeaderCode },
          { label: this.$t({id:"exp.reserve.money"}), value: this.props.headerData.documentHeader.reverseAmount }
        ],
        attachments: []
      };
      documentParams.statusCode === 1002 && (documentParams.statusCode = 2002);
      this.setState({headerData: this.props.headerData,documentParams})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.flag && nextProps.headerData.documentHeader){
      this.setState({ flag: false }, () => {
        reimburseService.getDefaultApportion(nextProps.headerData.documentHeader.documentId).then(res => {
          this.setState({ defaultApportion: res.data });
        }).catch(err => {
          message.error(this.$t({id:"exp.get.info.failed"}));
        });
      });
    }

    if (this.state.historyFlag && nextProps.id) {
      this.setState({ historyFlag: false }, () => {
        this.setState({historyLoading: true});
        reverseService.getApproveHistory(nextProps.id).then(res => {
          this.setState({ approveHistory: res.data, historyLoading: false });
        }).catch(err => {
          this.setState({historyLoading: false});
          message.error(this.$t({id:'exp.get.approve.history.failed'}));
        });
      });

    }

    if (nextProps.headerData.reverseHeader){
      let documentParams = {
        businessCode: nextProps.headerData.reverseHeader.reportReverseNumber,
        createdDate: moment(nextProps.headerData.reverseHeader.creatDate).format('YYYY-MM-DD'),
        formName: this.$t({id:'detail.expense.reverse'}),
        createByName: nextProps.headerData.documentHeader.applyName,
        totalAmount: nextProps.headerData.reverseHeader.amount,
        statusCode: nextProps.headerData.reverseHeader.status,
        currencyCode: nextProps.headerData.reverseHeader.currencyCode,
        remark: nextProps.headerData.reverseHeader.description,
        infoList: [
          { label: this.$t({id:'common.applicant'}), value: nextProps.headerData.reverseHeader.employeeName },
          { label: this.$t({id:'exp.company'}), value: nextProps.headerData.reverseHeader.companyName },
          { label: this.$t({id:'common.department'}), value: nextProps.headerData.reverseHeader.departmentName },
          { label: this.$t({id:'ye.wu.da.lei'}), value: nextProps.headerData.reverseHeader.businessClassName },
          { label: this.$t({id:'detail.source.report.number'}), value: nextProps.headerData.reverseHeader.sourceReportHeaderCode },
          { label: this.$t({id:"exp.reserve.money"}), value: nextProps.headerData.documentHeader.reverseAmount }
        ],
        attachments: []
      };
      documentParams.statusCode === 1002 && (documentParams.statusCode = 2002);
      this.setState({headerData: nextProps.headerData,documentParams})
    }
  }

  //获取冲销信息行列表
  getReverseList = (flag) => {
    this.setState({
      reverseInfoVisible: false,
      editReverseVisible: false,
      detailVisible: false,
    }, () => {
      if (flag){
        this.setState({isLoadExpenseLineData: !this.state.isLoadExpenseLineData});
      }
    })
  };

  //获取未支付行列表
  getUnpaidList = (flag) => {
    this.setState({
      payInfoVisible: false,
      editUnpaidVisible: false
    }, () => {
      if (flag){
        this.setState({isLoadPayData: !this.state.isLoadPayData})
      }
    })
  };

  renderList = (title, value) => {
    return (
      <div className="list-info">
        <span className="title">{title}：</span>
        <span className="content">{value}</span>
      </div>
    )
  };


  //添加费用冲销行
  addReverseInfo = () => {                         //'添加费用'
    this.setState({reverseInfoVisible: true, slideFrameTitle: this.$t({id:'exp.add.expense'}), listType: 'reverseLine'})
  };

  //编辑费用冲销行
  editReverseInfo = (record) => {                            //编辑费用反冲信息
    this.setState({editReverseVisible: true, slideFrameTitle: this.$t({id:'exp.edit.reserve.info'}), reverseRecord: record})
  };

  //查看原费用
  checkReverseInfo = (record) => {                       //查看费用
    this.setState({detailVisible: true, slideFrameTitle: this.$t({id:'expense.view'}), costRecord: record})
  };

  //添加未支付冲销行
  addUnpaidLine = () => {                                //金额变动
    this.setState({payInfoVisible: true, slideFrameTitle: this.$t({id:'exp.amount.change'}), listType: 'unpaidLine'})
  };

  //编辑待付款冲销行
  editUnpaidInfo = (record) => {                                //编辑待支付反冲信息
    this.setState({editUnpaidVisible: true, slideFrameTitle: this.$t({id:'exp.edit.unReserve.info'}), unpaidRecord: record})
  };

  //新增费用行slide关闭后的操作
  handleCloseReverse = (success) => {
    this.setState({
      reverseInfoVisible: false,
      editReverseVisible: false,
      detailVisible: false,
    });
    success && this.getReverseList(true);
  };

  //支付行slide关闭后的操作
  handleClosePayInfo = (success) => {
    this.setState({
      payInfoVisible: false,
      editUnpaidVisible: false
    });
    success && this.getUnpaidList(true)
  };

  //点编辑，回到前一页
  handleEdit = () => {
    const { headerData } = this.state;
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/financial-management/expense-reverse/new-reverse/${headerData.documentHeader.documentId}/${headerData.reverseHeader.businessClass}/${this.state.isNew}/${headerData.reverseHeader.currencyCode}`,
        state: {isNew: false, id: headerData.reverseHeader.id}
      })
    );
    // this.context.router.push({
    //   pathname: this.state.newReverse.url.replace(':id', headerData.documentHeader.documentId).replace(':businessClass', headerData.reverseHeader.businessClass),
    //   state: { isNew: false, id: headerData.reverseHeader.id }
    // });
  };


  //撤回
  handleRecall = () => {
    reverseService.recallReverseDocument(this.props.id,this.props.userId).then(resp => {
      if (resp.status === 200){
        message.success(this.$t({id:'exp.withDraw.success'})); //撤回成功
        this.props.dispatch(
          routerRedux.replace({
            pathname: `/financial-management/expense-reverse`,
          })
        );
        // this.context.router.push(this.state.expenseReverse.url);
      }
    }).catch(e => {
      message.error(e.response.data ? e.response.data.message : this.$t({id:'exp.withDraw.failed'}))//撤回失败
    })
  };

   //显示发票
   showInvoiceDetail = (record) => {
    this.setState({ showInvoiceDetail: true, invoiceData: record.digitalInvoice });
  };

  //删除费用行
  deleteCost = (record) => {
    reimburseService.deleteCostDetail(record.id).then(res => {
      message.success(this.$t({id:'common.delete.success'},{name:''}));
      this.getCostList(true);
    }).catch(err => {
      message.error(this.$t({id:'common.delete.failed'}));
    })
  };

  //复制费用行
  costCopy = (record) => {
    this.setState({ visible: true, costRecord: record, isCopy: true });
  };

  //删除付款行
  deletePay = (record) => {
    reimburseService.deletePayDetail(record.id).then(res => {
      message.success(this.$t({id:'common.delete.success'},{name:''}));
      this.getPayList(true);
    }).catch(err => {
      message.error(this.$t({id:'common.delete.failed'}));
    })
  };

  onChangeLinePager = (page) => {
    if (page - 1 !== this.state.linePage) {
      this.setState({ linePage: page - 1 }, () => {
        this.getUpaidLineList()
      })
    }
  };

  getReverseLineList = ()=>{
    const { page, pageSize, searchParams } = this.state;
    this.setState({loading: true});
    let params = {
      ...searchParams,
      headerId: this.props.id,
      selectIds: []
    };
    reverseService.getExpenseLine(page, pageSize, params).then(resp => {
      if (resp.status === 200){
        this.setState({
          addLoading: false,
          modalLoading: false,
          modalData: resp.data,
          linePagination: {
            current: this.state.linePage + 1,
            total: Number(resp.headers['x-total-count']),
            onChange: this.onChangeLinePager
          }
        });
      }
    }).catch((e) => {
      this.setState({loading: false});
      if(e.response)
        message.error(e.response.data.message);
    })
  };

  addExpense=()=>{
    this.setState({
      newExpenseVisible: true,
      modalLoading: true,
    });
    this.getReverseLineList();
  };

  handleSave = () => {
    const { id, lineDtos } = this.state;
    if (lineDtos.length === 0){
      message.error(this.$t({id:'exp.add.tips'}));
      return false;
    }
    let params  = {
      lineDtos: lineDtos,
      reverseInvoice: {}
    };
    this.setState({addLoading: true,selectedRowKeys:[]});
    reverseService.saveExpenseLine(this.props.id,params).then(resp => {
      if (resp.status === 200){
        message.success(this.$t({id:'common.save.success'},{name:''}));
        this.setState({
          addLoading: false,
          newExpenseVisible: false,
          addLine: true,
        }, () => {
          this.props.query();
        });

      }
    }).catch(e => {
      this.setState({addLoading: false});
      if(e.response)
        message.error(e.response.data.message);
    })
  };

  onSelectChange = (selectedRowKeys) => {
    const { modalData } = this.state;
    let amount = 0;
    let lineDtos = [];
    selectedRowKeys.map(selectItem => {
      modalData.map(item => {
        if (item.id === selectItem){
          amount += item.actualAmount ;
          if (item.digitalInvoice && item.digitalInvoice.invoiceTypeNo === '01'){
            lineDtos.push({id: selectItem, invoiceOperationType: 'DELETE'})
          } else{
            lineDtos.push({id: selectItem, invoiceOperationType: 'NO_TICKET'})
          }
        }
      })
    });
    this.setState({ lineDtos, amount, selectedRowKeys });
  };

  handleSearch = (result) => {
    result.dateFrom = result.applyDateFrom ? result.applyDateFrom.format('YYYY-MM-DD') : undefined;
    result.dateTo = result.applyDateTo ? result.applyDateTo.format('YYYY-MM-DD') : undefined;
    let searchParams = {
      expenseTypeId: result.expenseType&&result.expenseType[0],
      dateFrom: result.dateFrom,
      dateTo: result.dateTo,
      amountFrom: result.amountFrom,
      amountTo: result.amountTo
    };
    this.setState({
      searchParams,
      linePage: 0,
      linePageSize: 10,
    }, () => {
      this.getReverseLineList();
    })
  };

  handleClear = () => {
    this.setState({ searchParams: {} });
  };


  render() {
    const { detailLoading, dataChange, addExpensePagination, modalColumns,  modalLoading, modalData,selectedRowKeys, searchForm, addLoading, reverseInfoVisible,newExpenseVisible, isLoadCostData, documentParams, editReverseVisible, payInfoVisible, editUnpaidVisible, isLoadExpenseLineData, isLoadPayData, descriptionLoading, detailVisible, listType, slideFrameTitle, headerData, contractStatus } = this.state;
    const status = headerData.reverseHeader.status;
    let isEdit = null;
    if (status === 1001 || status === 1003 || status === 1005){
      isEdit = true;
    }else if (status === 1002 || status ===1004){
      isEdit = false
    }

    let subContent = {};

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className="contract-detail-common reimburse" style={{marginBottom: 20}}>
        <div className="top-info" style={{ padding: '24px 15px 20px',marginLeft: -20, marginTop: -20, background: 'white' }}>
         {/* {contractInfo}*/}
          <DocumentBasicInfo params={documentParams}>
            {isEdit && (
              <div style={{float: 'right', paddingBottom: 5}}>
                <Button type="primary" onClick={this.handleEdit}>
                  {this.$t({ id: 'my.contract.edit' }/*编 辑*/)}</Button>
              </div>
            )}
            {status === 1002 && (
              <div style={{float: 'right', marginBottom: 8}}>
                <Button type="primary"
                        onClick={this.handleRecall}>{this.$t({ id: "my.contract.withdrawal" }/*撤 回*/)}</Button>
              </div>
            )}
          </DocumentBasicInfo>
        </div>

        <div>
          <div className="tab-container" style={{ marginBottom: 20 }}>
            <h3 style={{ padding: "0 0 10px", margin: 0 }} className="sub-header-title">{this.$t({id:'exp.expense.info'})}</h3>
            <Row gutter={24}>
              <Col span={18} style={{ lineHeight: "60px", height: "32px" }}>
              {
                isEdit && <Button onClick={this.addExpense} type="primary">{this.$t({id:'expense.new'})}</Button>
              }
              </Col>
              <Col span={6}  style={{textAlign: 'right', paddingTop: 27, marginLeft: -12}}>
                <span>{this.$t({id:'exp.amount.total'})}：<span style={{ color: "green" }}>{headerData.reverseHeader.currencyCode} {this.filterMoney(headerData.reverseHeader.amount)}</span></span>
              </Col>
            </Row>
            <CostDetail
              ref="costInfo"
              editReverseInfo={this.editReverseInfo}
              checkReverseInfo= { this.checkReverseInfo}
              showInvoiceDetail={this.showInvoiceDetail}
              //costDetail={this.costDetail}
              disabled={isEdit === false}
              deleteCost={this.deleteCost}
              costCopy={this.costCopy}
              costEdit={this.costEdit}
              query={this.props.query}
              dataChange={dataChange}
              flag={JSON.stringify(this.props.headerData) === '{}' ? false : true}
              headerData={this.props.headerData}>
            </CostDetail>
          </div>

          <PayInfo
            ref="payInfo"
            flag={isLoadPayData}
            headerData={headerData}
            id = {this.props.id}
            deletePay={this.deletePay}
            addPayPlan={this.addPayPlan}
            editUnpaidInfo={this.editUnpaidInfo}
            summaryView={headerData.summaryView || {}}
            writeOffOk={this.getPayList}
            disabled={isEdit === false}
          >
          </PayInfo>
          <div >
            <ApproveHistory loading={false} infoData={this.state.approveHistory}></ApproveHistory>
          </div>
        </div>

        <Modal visible={newExpenseVisible} title={this.$t({id:'exp.add.expense'})} onOk={this.handleSave}
               onCancel={() => this.setState({ newExpenseVisible: false })}
               footer={[
                 <Button key="submit" type="primary"
                         loading={addLoading} style={{ margin: '0 20px' }} onClick={this.handleSave}>
                   {this.$t({id: 'common.ok'}/*确定*/)}
                 </Button>,
                 <Button key="back" onClick={() => this.setState({ newExpenseVisible: false,searchParams:{},modalData: [] })}>
                   {this.$t({id: 'common.back'}/*返回*/)}
                 </Button>
               ]}
               width="70%"
        >
          <SearchArea
            searchForm={searchForm}
            submitHandle={this.handleSearch}
            clearHandle={this.handleClear}/>
          <div className="table-header">
            <div className="table-header-title">
              {/*{this.$t({id: "common.total"}, {total: linePagination.total})} 共 total 条数据 */}
             {/* &nbsp;<span>/</span>&nbsp;*/}
              {this.$t({id: "common.total.selected"}, {total: selectedRowKeys.length === 0 ? '0' : selectedRowKeys.length})}{/* 已选 total 条 */}
            </div>
          </div>
          <Table rowKey={record => record.id}
                 columns={modalColumns}
                 dataSource={modalData}
                 loading={modalLoading}
                 scroll={{ x: true, y: false }}
                 bordered
                 rowSelection={rowSelection}
                 pagination={addExpensePagination}
                 size="middle" />
          <ApprotionInfo close={() => { this.setState({ showApprotion: false }) }} headerData={this.state.headerData} visible={this.state.showApprotion} id={this.state.modalRecord.id}  z-index={1001}></ApprotionInfo>
          <AttachmentInformation sourceReportLineId={this.state.modalRecord.id} visible={this.state.showAttInfo} close={()=>{this.setState({showAttInfo: false})}}/>
        </Modal>
        <SlideFrame title={slideFrameTitle}
                    show={editReverseVisible}
                    // content={EditReverseInfo}
                    
                    onClose={() => this.setState({editReverseVisible: false})}
                    >
                    <EditReverseInfo 
                    onClose={this.handleCloseReverse}
                    params={{
                      id: this.state.reverseRecord.id,
                      lineFlag: editReverseVisible,
                      headerData: this.props.headerData,
                      defaultApportion: this.state.defaultApportion,
                      isNew: false,
                      visible: editReverseVisible
                    }}/>
          </SlideFrame>

        <SlideFrame title={slideFrameTitle}
                    show={detailVisible}
                    width="900px"
                    // content={ExpenseInfo}
                    
                    onClose={() => this.setState({ detailVisible: false })}
                    >
                    <ExpenseInfo 
                    onClose = {this.handleCloseReverse}
                    params={{
                      visible: this.state.detailVisible,
                      defaultApportion: this.state.defaultApportion,
                      isShowInvoice: this.state.costRecord.invoiceOperationType === 'BACK_LASE',
                      record: this.state.costRecord,
                      headerId: this.props.id,
                      headerData: this.props.headerData,
                    }}/>
          </SlideFrame>

        <SlideFrame title={slideFrameTitle}
                    show={payInfoVisible}
                    // content={NewPayInfo}
                   
                    onClose={() => this.setState({payInfoVisible: false})}
                    >
                    <NewPayInfo 
                    onClose={this.handleClosePayInfo}
                    params={{
                      id: headerData.documentHeader.documentId,
                      reverseId: headerData.reverseHeader.id,
                      lineFlag: payInfoVisible,
                      listType: listType}}/>
        </SlideFrame>

        <SlideFrame title={slideFrameTitle}
                    show={editUnpaidVisible}
                    // content={EditUnpaidInfo}
                    
                    onClose={() => this.setState({editUnpaidVisible: false})}
                    >
                    <EditUnpaidInfo 
                    onClose={this.handleClosePayInfo}
                    params={{
                      lineFlag: editUnpaidVisible,
                      isNew: false,
                      record: this.state.unpaidRecord
                    }}/>
          </SlideFrame>
        <Invoice cancel={() => { this.setState({ showInvoiceDetail: false }) }} invoice={this.state.invoiceData || {}} visible={this.state.showInvoiceDetail}></Invoice>

      </div>
    )
  }
}

ReverseDetailCommon.propTypes = {
  id: PropTypes.any.isRequired, //显示数据
  isApprovePage: PropTypes.bool, //是否在审批页面
  getContractStatus: PropTypes.func, //确认合同信息状态
};

ReverseDetailCommon.defaultProps = {
  isApprovePage: false,
  getContractStatus: () => { }
};

function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}

// ReverseDetailCommon.contextTypes = {
//   router: React.PropTypes.object
// };

const wrappedReverseDetailCommon = Form.create()(ReverseDetailCommon);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedReverseDetailCommon);
