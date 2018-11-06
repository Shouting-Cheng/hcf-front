import React from 'react'
import config from 'config'
import {
  Form,
  Icon,
  Tag,
  Tabs,
  Button,
  Row,
  Col,
  Spin,
  Breadcrumb,
  Table,
  Timeline,
  message,
  Popover,
  Popconfirm,
  Modal,
  Affix,
  Divider
} from 'antd'
const TabPane = Tabs.TabPane;
import moment from 'moment'
import 'styles/pre-payment/my-pre-payment/pre-payment-detail.scss'
import { connect } from 'dva'
import ApproveHistory from "containers/pre-payment/my-pre-payment/approve-history-work-flow"
import CustomTable from "widget/custom-table";
import DocumentBasicInfo from "widget/Template/document-basic-info";
import ApprotionInfo from "containers/expense-adjust/expense-adjust/approtion-info";
import adjustService from "containers/expense-adjust/expense-adjust/expense-adjust.service";

class ExpenseAdjustApproveCommon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topLoading: false,
      detailLoading: false,
      planLoading: false,
      loading: false,
      backLoading: false,
      topTapValue: 'contractInfo',
      headerData: {},
      documentParams: {},
      amountText: '',
      functionAmount: "",
      historyLoading: false,     //控制审批历史记录是否loading
      isNew: true,
      timestamp: (new Date()).valueOf(),
      dimensionData: [],
      expenseAdjustType: {},
      showImportFrame: false,
      pagination: {
        total: 0
      },
      voucherColumns: [
        {  //序号
          title: this.$t('common.sequence'), align: "center", dataIndex: "1", key: "1", width: 62,
          render: (value, record, index) => index + 1
        },
        {
          title: this.$t('exp.line.desc'), align: "center", dataIndex: "2", key: "2", width: 62,
          render: (value, record, index) => index + 1
        },
        {//凭证日期
          title: this.$t('accounting.view.accountingDate'), align: "center", dataIndex: "3", key: "3", width: 62,
          render: (value, record, index) => index + 1
        },
        { //公司
          title: this.$t('exp.company'), align: "center", dataIndex: "4", key: "4", width: 62,
          render: (value, record, index) => index + 1
        },
        {//责任中心
          title: this.$t('detail.costCenter.name'), align: "center", dataIndex: "5", key: "5", width: 62,
          render: (value, record, index) => index + 1
        },
        {
          title: this.$t('common.currency'), align: "center", dataIndex: "6", key: "6", width: 62,
          render: (value, record, index) => index + 1
        },
        {//原币借方
          title: this.$t('detail.entered.amountDr'), align: "center", dataIndex: "7", key: "7", width: 62,
          render: (value, record, index) => index + 1
        },
        {//原币贷方
          title: this.$t('detail.entered.amountCr'), align: "center", dataIndex: "8", key: "8", width: 62,
          render: (value, record, index) => index + 1
        },
        {//本币借方
          title: this.$t('detail.functional.amountDr'), align: "center", dataIndex: "9", key: "9", width: 62,
          render: (value, record, index) => index + 1
        },
        {//本币贷方
          title: this.$t('detail.functional.amountCr'), align: "center", dataIndex: "10", key: "10", width: 62,
          render: (value, record, index) => index + 1
        },
        {//公司段
          title: this.$t('exp.cos.company'), align: "center", dataIndex: "11", key: "11", width: 62,
          render: (value, record, index) => index + 1
        },
        {//成本中心段
          title: this.$t('exp.cos.cos'), align: "center", dataIndex: "12", key: "12", width: 62,
          render: (value, record, index) => index + 1
        },
        {//科目段
          title: this.$t('exp.cos.section'), align: "center", dataIndex: "13", key: "13", width: 62,
          render: (value, record, index) => index + 1
        },
        {//部门段
          title: this.$t('exp.cos.dept'), align: "center", dataIndex: "14", key: "14", width: 62,
          render: (value, record, index) => index + 1
        },
      ],
      columns: [
        { title: this.$t('common.sequence'), align: "center", dataIndex: "index", key: "index", width: 62,
          render: (value, record, index) => index + 1
        },
        {
          title: this.$t('exp.company'), dataIndex: 'companyName', width: '80',
          render: desc => <span><Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover></span>
        },
        {
          title: this.$t('common.department'), dataIndex: 'unitName', width: '80',
          render: desc => <span><Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover></span>
        },
        {//费用类型
          title:  this.$t('common.expense.type') , dataIndex: 'expenseTypeName', width: 100,
          render: desc => <span><Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover></span>
        },
        {
          title: this.$t('common.amount'), dataIndex: 'amount', width: 100, align: 'center',
          render: desc=> this.filterMoney(desc)
        },
        {
          title: this.$t('acp.function.amount'), dataIndex: 'functionalAmount', width: 120, align: 'center',
          render: desc=> this.filterMoney(desc)
        },
        {
          title: this.$t('common.comment'), dataIndex: 'description',align: 'center',
          render: desc => <span><Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover></span>
        },
        {
          title: this.$t('common.operation'), dataIndex: 'operate', width: 160, align: 'center',
          render: (value, record) => {
            return (
              <div>
                {record.vatInvoice && <Divider type="vertical"></Divider>}
                <a onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.handleEdit(record)
                }}>编辑</a>
                <Divider type="vertical"></Divider>
                <a onClick={() => this.checkOldExpense(record)}>{this.$t('common.copy')}</a>
                <Divider type="vertical"></Divider>
                <Popconfirm title={this.$t('configuration.detail.tip.delete')} onConfirm={(e) => this.deleteItem(e, record)}><a>{this.$t('common.delete')}</a></Popconfirm>
              </div>
            )
          },
        },
      ],
      columnsLine: [{ title: this.$t('common.sequence'), dataIndex: 'index', align: "center", width: 50, render: (value, record, index) => (index + 1) },],
      columnsHeader: [{ title: this.$t('common.sequence'), dataIndex: 'index', align: "center", width: 50, render: (value, record, index) => (index + 1) },],
      status: {
        1001: { label: this.$t('common.editing'), state: 'default' }, //编辑中
        1004: { label: this.$t('common.approve.pass'), state: 'success' },//审批通过
        1002: { label: this.$t('common.approving'), state: 'processing' },//审批中
        1005: { label: this.$t('common.approve.rejected'), state: 'error' },//审批驳回
        1003: { label: this.$t('common.withdraw'), state: 'warning' }//撤回
      },
      subTabsList: [
        { label: this.$t('common.detail'), key: 'DETAIL' },
      ],
      data: [],
      planAmount: 0,
      pageSize: 10,
      page: 0,
      showSlideFrame: false,
      slideFrameTitle: '',
      stateName: '',
      record: {},
      id: '',
      companyId: '',
      flag: false,
      EditExpenseAdjust: '/expense-adjust/my-expense-adjust/new-expense-adjust/', //新建费用调整
      // ExpenseAdjustDetail: menuRoute.getRouteItem('expense-adjust-detail', 'key'), //费用调整详情,
      ExpenseAdjustDetail:'/approval-management/approve-expense-adjust/expense-adjust-approve-detail/',
      expenseAdjust: '/expense-adjust/my-expense-adjust',    //费用调整
    }
  }

  componentDidMount() {
    this.getInfo();
    this.getDimension();
    this.getList();
    this.getExpenseType();
  }

  componentWillReceiveProps(nextProps) {
  }

  //获取费用调整类型
  getExpenseType = () => {
    adjustService.getExpenseAdjustTypeById(this.props.expenseAdjustTypeId).then(res => {
      this.setState({ expenseAdjustType: res.data.expenseAdjustType });
    }).then((e) => { })
  };


  //获取维度
  getDimension = (expenseAdjustTypeId)=>{
    const {columns} = this.state;
    adjustService.getDimensionAndValue(this.props.expenseAdjustTypeId).then(response=>{
      response.data.reverse().map(item=> item&&columns.splice(7,0,{title: item.name, dataIndex: 'dimension'+item.sequenceNumber+'Name', align: 'center',
        render: desc => <span><Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover></span>})
      );
      this.setState({columns, costCenterData: response.data })
    })
  };

  getApproveHistory = () => {
    this.setState({
      historyLoading: true
    });
    let oid = this.state.headerData.documentOid;
    adjustService.getApproveHistoryWorkflow(oid).then(res => {
      this.setState({ historyLoading: false }, () => {
        this.setState({ approveHistory: res.data })
      })
    }).catch(error => {
      message.error(this.$t('budgetJournal.getDataFail'));
      this.setState({ historyLoading: false });
    })
  };

  //获取费用调整头信息
  getInfo = () => {
    adjustService.getExpenseAdjustHeadById(this.props.id).then(response=>{
      let documentParams = {
        businessCode: response.data.expAdjustHeaderNumber,
        createdDate:  moment(new Date(response.data.adjustDate)).format('YYYY-MM-DD'),
        formName: response.data.expAdjustTypeName,
        createByName: response.data.employeeName,
        totalAmount: response.data.totalAmount ? response.data.totalAmount : 0,
        currencyCode: response.data.currencyCode,
        statusCode: response.data.status,
        remark: response.data.description,
        infoList: [
          { label: this.$t('my.contract.number'), value: response.data.employeeName },
          { label: this.$t('common.applicant'), value: response.data.companyName },
          { label: this.$t('common.department'), value: response.data.unitName },
          { label: this.$t('exp.adjust.type'), value: response.data.adjustTypeCategory === '1001' ? this.$t('exp.adjust.exp.detail') : this.$t('exp.adjust.exp.add'), },
        ],
        attachments: response.data.attachments
      };
      let columns = this.state.columns;
      if(response.data.status === 1002 || response.data.status === 1004){
        columns.splice(columns.length-1,1)
      }
      this.setState({
        headerData: response.data,
        documentParams,
        columns
      },()=>{
        this.getHistory(response.data.documentOid)
      })
    })
  };

  getHistory = (oid) =>{
    adjustService.getApproveHistoryWorkflow(oid).then(response=>{
      this.setState({
        approveHistory: response.data
      })
    })
  };

  getList = () => {
    const { page, pageSize, pagination } = this.state;
    this.setState({ planLoading: true });
    let params = {
      expAdjustHeaderId: this.props.id,
      size: pageSize,
      page: page
    };
    adjustService.getExpenseAdjustLine(params).then(resp => {
      console.log(resp)
      if (resp.status === 200){
        resp.data.map(item=>item.key = item.id);
        pagination.total = Number(resp.headers['x-total-count']);
        this.setState({
          data: resp.data,
          loading: false,
          pagination
        })
      }
    }).catch((e) => {
      // message.error('数据加载失败，请重试');
      this.setState({ planLoading: false, historyLoading: false });
    })
  };

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };


  handleTabsChange = (tab) => {
    this.setState({ topTapValue: tab })
  };

  //侧滑
  showSlide = (flag) => {
    this.setState({ showSlideFrame: flag, flag: flag });
  };

  renderList = (title, value) => {
    return (
      <Row className="list-info">
        <Col span={6}>{title}：</Col>
        <Col className="content" span={18}>{value}</Col>
      </Row>
    )
  };

  //关闭侧滑
  handleCloseSlide = (params) => {
    this.setState({
      showSlideFrame: false,
      flag: false
    }, () => {
      if (params) {
        this.getList();
        this.getInfo();
      }
    })
  };

  handleClose = () => {
    let adjustTypeCategory = this.state.expenseAdjustType.adjustTypeCategory;
    this.setState({
      showSlideFrame: false,
    }, () => {
      if (adjustTypeCategory == "1001") {
        this.getList();
      }
    })
  }

  //取消
  onCancel = () => {
    this.context.router.push(this.state.expenseAdjust.url);
  };

  expandedRowRender = (recode) => {
    let adjustTypeCategory = this.state.expenseAdjustType.adjustTypeCategory;
    let columnsHeader = this.state.columnsHeader;
    return (
      <Table
        columns={columnsHeader}
        dataSource={recode.linesDTOList}
        size="middle"
        scroll={{ x: 1300 }}
      />);
  };
  /**
   * 行点击事件
   */
  onRowClick = (record) => {
    this.setState({
      record,
      timestamp: (new Date()).valueOf(),
      slideFrameTitle: this.$t('menu.edit-expense-adjust'),
      isNew: false,
      showSlideFrame: true
    })
  };

  renderContent = ()=>{
    const { nowStatus, type, previewVisible, previewImage, widthDrawLoading, documentParams, apportionParams,showApportion, voucherColumns, voucherData,pagination,voucherPagination, voucherLoading,loading, dLoading, data, columns, showSlideFrame, showImportFrame, slideFrameTitle, tabs, isModal, costCenterData, infoList, headerData, approveHistory } = this.state;
    let flag = headerData.status === 1004;
    return (
      <div className="adjust-content" style={{marginBottom: 50}}>
        <div className="document-basic-info" style={flag ? {margin: '-16px -10px 0 10px'}:{paddingLeft: 38}}>
          <DocumentBasicInfo params={documentParams}/>
        </div>
        <div className="expense-adjust-detail-center" style={{ marginTop:20, marginLeft: 30, background:'white', padding: '20px 20px 40px 20px'}}>
          <div className="center-title" style={{color:'black', fontSize: 17, borderBottom: '1px solid #ececec'}}>
            {this.$t('exp.adjust.info')}
          </div>
          <Row gutter={24} style={{marginTop: 15}}>
            <Col span={18} style={{marginBottom: 5}}/>
            <Col span={6} className="table-header-tips" style={{textAlign: 'right', marginTop: 10}}>
              {this.$t('exp.amount.total')}：<span style={{color: 'green'}}>{headerData.currencyCode&&headerData.currencyCode +" "}&nbsp;{headerData.totalAmount? this.filterMoney(headerData.totalAmount) : this.filterMoney(0)}</span>
            </Col>
          </Row>
          <Table
            rowKey={record=> record.id}
            dataSource={data}
            loading={loading}
            columns={columns}
            pagination={pagination}
            scroll={{x: 1300 ,y:0}}
            onChange={this.onChangePager}
            size="middle"
            expandedRowRender={this.expandedRowRender}
            bordered/>
        </div>

        <div className="approve-history" style={ flag? {margin:'20px 20px 35px 30px'}:{margin: '10px 0 0 10px',padding: 20}}>
          <ApproveHistory loading={false} infoData={approveHistory}/>
        </div>
        <ApprotionInfo
          close={() => { this.setState({ showApportion: false, apportionParams: [] }) }}
          visible={showApportion}
          params={{costCenterData:costCenterData, data: apportionParams}}
          z-index={1001} />
        <Modal visible={previewVisible} footer={null} onCancel={() => { this.setState({ previewVisible: false }) }}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>)

  };

  render() {
    const { voucherColumns, expenseAdjustType, topLoading, showImportFrame, backLoading, detailLoading, loading, planLoading, topTapValue, subTabsList, pagination, data, timestamp, showSlideFrame, headerData, dimensionData, record, slideFrameTitle, columns, columnsHeader, isNew } = this.state;
    let renderStatus = headerData.expAdjustTypeName;
    let adjustTypeCategory = this.state.expenseAdjustType.adjustTypeCategory;
    return (
      <div className="background-transparent">
        {
          headerData.status === 1004 ?
            <Tabs defaultActiveKey='detail' onChange={this.handleTab} forceRender className="adjust-tabs">
              <TabPane tab={this.$t('acp.document.info')} key='detail'>
                {this.renderContent()}
              </TabPane>
              <TabPane tab={this.$t('detail.voucher.info')} key='voucher'>
                <div style={{background: 'white', margin: '-16px -10px 0 -10px', padding: 10} }>
                  <div style={{padding: 10, margin: '20px 15px 20px 30px'}}>
                    <div style={{fontSize: 18, marginBottom: 5}}>{this.$t('exp.expense.voucher')}</div>
                    <CustomTable
                      ref={ref => this.customTable = ref}
                      showNumber={true}
                      methodType='post'
                      columns={voucherColumns}
                      params={{
                        tenantId: this.props.user.tenantId,
                        sourceTransactionType: '',
                        transactionNumber: '',
                      }}
                      url={`${config.accountingUrl}/api/accounting/gl/journal/lines/query/by/transaction/number`}
                      croll={{ x: 1300, y: 200 }}
                    />
                  </div>
                </div>
              </TabPane>
            </Tabs>
            :
            this.renderContent()
        }
      </div>
    )
  }
}

ExpenseAdjustApproveCommon.propTypes = {};

ExpenseAdjustApproveCommon.defaultProps = {};


const wrappedExpenseAdjustApproveCommon = Form.create()((ExpenseAdjustApproveCommon));

function mapStateToProps(state) {
  return {
    user: state.login.user,
    company: state.login.company,
    organization: state.login.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })((wrappedExpenseAdjustApproveCommon));
