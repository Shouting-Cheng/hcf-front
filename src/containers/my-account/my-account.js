import React  from 'react'
import { connect } from 'dva';
import { Button, Table, Menu, Dropdown, Icon, Row, Col, Popconfirm, Popover, message } from 'antd'

import 'styles/my-account/my-account.scss'
import SlideFrame from "components/Widget/slide-frame";
import NewExpense from 'containers/my-account/new-expense'
import expenseService from 'containers/my-account/expense.service'
import baseService from 'share/base.service'
import FileSaver from "file-saver";
import { rejectPiwik } from 'share/piwik'

class MyAccount extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      data: [],
      columns:[
        {title: this.$t('common.sequence')/*序号*/, dataIndex: 'index', width: '5%'},
        {title: this.$t('common.expense.type')/*费用类型*/, dataIndex: 'expenseTypeName', render: expenseTypeName => <Popover content={expenseTypeName}>{expenseTypeName}</Popover>},
        {title: this.$t('common.date')/*日期*/, dataIndex: 'createdDate', render: createdDate => new Date(createdDate).format('yyyy-MM-dd')},
        {title: this.$t('common.remark')/*备注*/, dataIndex: 'comment', render: comment => <Popover content={comment}>{comment || '-'}</Popover>},
        {title: this.$t("common.attachments")/*附件*/, dataIndex: 'attachments', width: '7%', render: attachments => attachments.length},
        {title: this.$t("common.currency")/*币种*/, dataIndex: 'invoiceCurrencyCode', width: '5%'},
        {title: this.$t("common.amount")/*金额*/, dataIndex: 'amount', render: this.filterMoney},
        {title: this.$t("common.base.currency.amount")/*本位币金额*/, dataIndex: 'baseAmount', render: this.filterMoney},
        {title: this.$t("common.operation")/*操作*/, dataIndex: 'operate', render: this.renderOperate}
      ],
      pagination: {
        total: 0,
      },
      page: 0,
      pageSize: 10,
      nowExpense: null,
      showExpenseFlag: false,
      expenseSource: '',
      businessCardEnabled: false,
      invoiceEnabled: false
    };
  }

  deleteExpense = (record) => {
    rejectPiwik(`我的账本/删除账本`);
    this.setState({ loading: true });
    expenseService.deleteExpense(record.invoiceOID).then(res => {
      message.success(this.$t('common.operate.success'));
      if(this.state.data.length === 1){
        this.setState({ page: 0 }, this.getList)
      } else {
        this.getList();
      }
    }).catch(e => {
      this.setState({ loading: false });
      message.error(this.$t('common.operate.filed'));
    });
  };

  print  = (record,event) => {
    event.preventDefault();
    event.stopPropagation();
    event.cancelBubble = true;
    expenseService.printInvoice(record.digitalInvoice,this.props.company.companyOID);
  };

  renderOperate = (text,record) => {
    let labels = record.invoiceLabels || [];
    let printButton = true;
    labels.map(items => {
      items.type === 'INVOICE_FREE' && (printButton = false);
    });
    let deleteContent;
    if(record.digitalInvoice && record.digitalInvoice.cardsignType === 'ALICARDSIGN'){
      deleteContent = this.$t('expense.delete.alipayTip') //删除后电子票将回到支付宝电子卡包
    }
    if(record.digitalInvoice && (record.digitalInvoice.cardsignType === 'JSCARDSIGN' || record.digitalInvoice.cardsignType === 'APPCARDSIGN')){
      deleteContent = this.$t('expense.delete.wxpayTip') //删除后电子票将回到微信电子卡包
    }
    let deleteContents=<span>{this.$t("common.confirm.delete")/*确定要删除吗？*/}<br/>{deleteContent}</span>
    //费用是否能删除
    let isNotDelete = (record.paymentType === 1002 && record.readonly) ? true : false;
    return (
      <span>
      <a onClick={e => this.setState({showExpenseFlag: true, nowExpense: record})}>{this.$t("common.edit")}</a>
      <span className="ant-divider"/>
        {isNotDelete ?<span style={{color:'#bfbfbf'}}>
          {this.$t("common.noDelete")}
        </span> : <Popconfirm title={deleteContents} onConfirm={() => this.deleteExpense(record)}><a
          onClick={e => e.stopPropagation()}>{this.$t("common.delete")}</a></Popconfirm>}
        {/* 费用打印 支付宝处理*/}
        {record.digitalInvoice && ((record.digitalInvoice.cardsignType === 'ALICARDSIGN' && record.digitalInvoice.pdfUrl)|| record.digitalInvoice.cardsignType === 'APPCARDSIGN' || record.digitalInvoice.cardsignType === 'JSCARDSIGN') && printButton && <span><span className="ant-divider" /><a onClick={event => this.print(record,event)}>{this.$t('common.print')/*打印*/}</a></span>}
      </span>)
  };

  componentWillMount(){
    rejectPiwik('我的账本/进入账本');
    this.getList();
    Promise.all([
      baseService.getBusinessCardConsumptionList('CMBC', false, this.props.user.userOID, 0, 10),
      expenseService.getBusinessCardStatus()
    ]).then(res => {
      this.setState({ businessCardEnabled: res[0].data.success && res[0].data.rows.length > 0 && res[1].data.rows })
    });
    expenseService.getTitleList(this.props.company.companyOID).then(res => {
      this.setState({ invoiceEnabled: res.data.length > 0 })
    })
  }

  getList(){
    let { page, pageSize } = this.state;
    this.setState({ loading: true });
    expenseService.getExpenseList(page, pageSize).then(res => {
      res.data.map((item, index) => {
        item.index = index + page * pageSize + 1;
        return item;
      });
      this.setState({
        loading: false,
        data: res.data,
        pagination: {
          total: Number(res.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1,
          onShowSizeChange: this.onShowSizeChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal:()=>{
            return(`共有${Number(res.headers['x-total-count'])?Number(res.headers['x-total-count']):0}条数据`)
          }
        }
      })
    })
  }

  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({page: page - 1,}, this.getList)
  };
  //切换每页显示的条数D
  onShowSizeChange=(current,pageSize)=>{
    this.setState({page:current-1,pageSize},()=>{
      this.getList()
    })
  }

  handleMenuClick = (e) => {
    this.setState({showExpenseFlag: true, nowExpense: null, expenseSource: e.key});
  };

  renderExpandedRowCost = (title, content, key) => {
    return (
      <div key={key}>
        <span>{title}</span>
        {content && <span>:{content}</span>}
      </div>
    )
  };

  renderExpandedRow= (type) => {
    return (
      <div className={`${type.level === 'WARN' ? 'warning-expanded-row' : (type.level === 'ERROR' ? 'error-expand-row' : '')}`}>
        <span>{type.name}</span>
        {type.toast && <span>:{type.toast}</span>}
      </div>
    )
  };

  renderExpandedSpan = (type) => {
    return (
      <span>{type.name}/</span>
    )
  };
  renderClass = (record) =>{
    return record.invoiceLabels.length > 0  ?  '' : 'row-expand-display-none';
  };
  renderAllExpandedRow = (record) => {
    let result = [];
    let infoRes = [];
    let types = record.invoiceLabels || [];
    let lastIndex = -1;
    types.map((label, index) => {
      if (label.level !== 'INFO') {
        result.push(this.renderExpandedRow(label, '', index));
      } else {
        lastIndex = label.name;
        infoRes.push(this.renderExpandedSpan(label, '', index));
      }
    });
    let infoLength = infoRes.length;
    infoLength > 0 && (infoRes[infoLength - 1] = <span key="lastIndex">{lastIndex}</span>);
    result.push(infoRes);
    return result.length > 0 ? result :  null;
  };

  handleCloseExpense = (refresh) => {
    this.setState({showExpenseFlag: false}, () => {
      refresh === true && this.getList();
    })
  };

  render(){
    const { loading, data, pagination, columns, showExpenseFlag, nowExpense, expenseSource,
      businessCardEnabled, invoiceEnabled } = this.state;
    const { user } = this.props;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="expenseType">{this.$t('expense.create.manually')/*手工创建*/}</Menu.Item>
        { invoiceEnabled && <Menu.Item key="invoice">{this.$t('expense.check.invoice')/*发票查验*/}</Menu.Item> }
        { businessCardEnabled && <Menu.Item key="businessCard">{this.$t('expense.import.business.card')/*导入商务卡费用*/}</Menu.Item> }
      </Menu>
    );
    return(
      <div className="my-account">
        <div className="operate-area">
          <div id="drop" style={{position : "relative"}}>
            <Dropdown getPopupContainer={ () => document.getElementById('drop')} overlay={menu}>
              <Button style={{ marginLeft: 8 }} type="primary">
                {this.$t('expense.new')/*新建费用*/} <Icon type="down" />
              </Button>
            </Dropdown>
          </div>
        </div>
        <Table dataSource={data}
               size="middle"
               bordered
               expandedRowRender={this.renderAllExpandedRow}
               rowKey="invoiceOID"
               rowClassName={this.renderClass}
               loading={loading}
               columns={columns}
               pagination={pagination}/>
        <SlideFrame show={showExpenseFlag}
                    title={this.$t('expense.new')/*新建费用*/}
                    hasFooter={false}
                    onClose={() => this.setState({showExpenseFlag: false, nowExpense: null, expenseSource: ''})}
                    width="800px">
              <NewExpense  params={{ nowExpense, expenseSource, slideFrameShowFlag: showExpenseFlag, businessCardEnabled, user }}
                          onClose={this.handleCloseExpense}/>
        </SlideFrame>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,

  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(MyAccount);
