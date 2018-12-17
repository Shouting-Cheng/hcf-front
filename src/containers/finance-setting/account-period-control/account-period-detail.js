import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import {Affix, Spin, Button, Form,  Badge, Row, Col, message, Pagination } from 'antd'
import Table from 'widget/table'

import moment from 'moment';
import periodControlService from 'containers/finance-setting/account-period-control/account-period-control.service'

class AccountPeriodDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      periodInfo: {},
      periodInfoList: [
        {label: this.$t('account.period.control.periodSetCode'), id: 'periodSetCode'}, //会计期代码
        {label: this.$t('account.period.control.detail.periodSetName'), id: 'periodSetName'}, //会计期名称
        {label: this.$t('account.period.control.detail.totalPeriodNum'), id: 'totalPeriodNum'}, //期间总数
        {label: this.$t('account.period.control.sobCode'), id: 'setOfBooksCode'}, //账套代码
        {label: this.$t('legal.entity.detail.sob.name'), id: 'setOfBooksName'} //账套名称
      ],
      columns: [
        {title: this.$t('account.period.control.detail.column.year'), key: 'periodYear', dataIndex: 'periodYear'}, //年
        {title: this.$t('common.sequence'), key: 'periodSeq', dataIndex: 'periodSeq',
          render: (value, record) => {
            return (
              <div>
                {Number.parseInt(value) - Number.parseInt(record.periodYear) * 10000}
              </div>
            )
          }},  //序号
        {title: this.$t('finance.audit.startDate'), key: 'startDate', dataIndex: 'startDate',
          render: date => moment(date).format('YYYY-MM-DD')},  //日期从
        {title: this.$t('finance.audit.endDate'), key: 'endDate', dataIndex: 'endDate',
          render: date => moment(date).format('YYYY-MM-DD')},  //日期至
        {title: this.$t('budget.strategy.detail.period.quarter'), key: 'quarterNum', dataIndex: 'quarterNum'},  //季度
        {title: this.$t('account.period.control.detail.column.period'), key: 'periodName', dataIndex: 'periodName'},  //期间
        {title: this.$t('account.period.control.detail.column.period-status'), key: 'periodStatusCode', dataIndex: 'periodStatusCode',
          render: code => (
            <Badge status={code==='O' ? 'success' : 'error'}
                   text={code==='N' ? this.$t('account.period.control.detail.not.open'/*未打开*/) :
                     (code==='O' ? this.$t('account.period.control.detail.has.open'/*已打开*/) :
                       this.$t('account.period.control.detail.has.close'/*已关闭*/))}
            />
          )},  //期间状态
        {title: this.$t('common.operation'), key: 'id', dataIndex: 'id',
          render: (periodId, record) =>
            <a onClick={() => {this.operaPeriodStatus(periodId, record.periodSetId, record.periodStatusCode)}}>
              {record.periodStatusCode === 'O' ? this.$t('account.period.control.detail.close.period'/*关闭期间*/) :
                this.$t('account.period.control.detail.open.period'/*打开期间*/)}
            </a>},  //操作
      ],
      dataClose: [],
      dataOpen: [],
      pageClose: 0,
      pageOpen: 0,
      pageSizeClose: 5,
      pageSizeOpen: 5,
      paginationClose: {
        total: 0
      },
      paginationOpen: {
        total: 0
      },
      loadingClose: false,
      loadingOpen: false,
    };
  }

  componentWillMount() {
    this.getPeriodInfo();
    this.getClosedList();
    this.getOpenList();
  }

  getPeriodInfo = () => {
    periodControlService.getAccountPeriodInfo(this.props.match.params.periodSetId, this.props.match.params.setOfBooksId).then((res) => {
      this.setState({ periodInfo: res.data })
    }).catch(e => {

    })
  };

   //返回
   HandleReturn = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/finance-setting/account-period-control`,
      })
    );
  };

  getClosedList = () => {
    const { pageClose, pageSizeClose } = this.state;
    const { periodSetId, setOfBooksId } = this.props.match.params;
    this.setState({ loadingClose: true });
    periodControlService.getClosePeriod(pageClose, pageSizeClose, periodSetId, setOfBooksId).then((res) => {
      this.setState({
        dataClose: res.data,
        loadingClose: false,
        paginationClose: {
          total: Number(res.headers['x-total-count']),
          onChange: this.onChangeClosePage,
          pageSize: this.state.pageSizeClose
        }
      })
    }).catch(() => {
      this.setState({ loadingClose: false });
      message.error(this.$t('common.error1'))
    })
  };

  getOpenList = () => {
    const { pageOpen, pageSizeOpen } = this.state;
    const { periodSetId, setOfBooksId } = this.props.match.params;
    this.setState({ loadingOpen: true });
    periodControlService.getOpenPeriod(pageOpen, pageSizeOpen, periodSetId, setOfBooksId).then((res) => {
      this.setState({
        dataOpen: res.data,
        loadingOpen: false,
        paginationOpen: {
          total: Number(res.headers['x-total-count']),
          onChange: this.onChangeOpenPage,
          pageSize: this.state.pageSizeOpen
        }
      })
    }).catch(() => {
      this.setState({ loadingOpen: false });
      message.error(this.$t('common.error1'))
    })
  };

  //点击未打开状态的页码
  onChangeClosePage = (page) => {
    if(page - 1 !== this.state.pageClose) {
      this.setState({
        pageClose: page - 1,
        loadingClose: true
      }, () => {
        this.getClosedList();
      })
    }
  };

  //点击已打开状态的页码
  onChangeOpenPage = (page) => {
    if(page - 1 !== this.state.pageOpen) {
      this.setState({
        pageOpen: page - 1,
        loadingOpen: true
      }, () => {
        this.getOpenList();
      })
    }
  };

  //修改未打开状态每页显示的数量
  onShowCloseSizeChange = (current, pageSize) => {
    this.setState({
      pageClose: current - 1,
      pageSizeClose: pageSize
    },()=>{
      this.getClosedList()
    })
  };

  //修改已打开状态每页显示的数量
  onShowOpenSizeChange = (current, pageSize) => {
    this.setState({
      pageOpen: current - 1,
      pageSizeOpen: pageSize
    },()=>{
      this.getOpenList()
    })
  };

  //修改期间状态：打开 <=> 关闭
  operaPeriodStatus = (periodId, periodSetId, status) => {
    periodControlService.operaPeriodStatus(status === 'O' ? 'close' : 'open', periodId, periodSetId, this.props.match.params.setOfBooksId).then(res => {
      if (res.status === 200) {
        this.getClosedList();
        this.getOpenList();
        message.success(this.$t('common.operate.success')/* 操作成功 */)
      }
    }).catch(e => {
      message.error(`${this.$t('common.operate.filed')/* 操作失败 */}，${e.response.data.message}`)
    })
  };

  render(){

    const { periodInfo, periodInfoList, columns, dataClose, dataOpen, paginationClose, paginationOpen, loadingClose, loadingOpen, pageSizeClose, pageSizeOpen } = this.state;
    let periodRow = [];
    let periodCol = [];
    periodInfoList.map((item, index) => {
      periodCol.push(
        <Col span={8} style={{marginBottom: '15px'}} key={item.id}>
          <div style={{color: '#989898'}}>{item.label}:</div>
          <div style={{wordWrap:'break-word'}}>{periodInfo[item.id]}</div>
        </Col>
      );
      if (index === 2) {
        periodRow.push(
          <Row style={{background:'#f7f7f7',padding:'20px 25px 0',borderRadius:'6px'}} key="1">
            {periodCol}
          </Row>
        );
        periodCol = [];
      }
      if (index === 4) {
        periodRow.push(
          <Row style={{background:'#f7f7f7',padding:'0 25px 5px',borderRadius:'6px'}} key="2">
            {periodCol}
          </Row>
        );
      }
    });
    return (
      <div className="account-period-detail">
        <Spin spinning={false}>
          <h3 className="header-title">{this.$t('account.period.control.detail.title')/* 账套期间信息 */}</h3>
          {periodRow}
          <h3 className="header-title" style={{margin:'24px 0 10px'}}>{this.$t('account.period.control.detail.title.close')/* 会计期间-未打开 */}</h3>
          <Table rowKey={record => record.id}
                columns={columns}
                dataSource={dataClose}
                pagination={false}
                loading={loadingClose}
                bordered
                size="middle" />
          <Pagination size="small"
                      showSizeChanger
                      onShowSizeChange={this.onShowCloseSizeChange}
                      defaultPageSize={pageSizeClose}
                      pageSizeOptions={['5','10','20','30','50']}
                      style={{float:'right',margin:'10px 0'}}
                      onChange={this.onChangeClosePage}
                      total={paginationClose.total} />
          <h3 className="header-title" style={{margin:'40px 0 10px'}}>{this.$t('account.period.control.detail.title.open')/* 会计期间-已打开 */}</h3>
          <Table rowKey={record => record.id}
                columns={columns}
                dataSource={dataOpen}
                pagination={false}
                loading={loadingOpen}
                bordered
                size="middle" />
          <Pagination size="small"
                      showSizeChanger
                      onShowSizeChange={this.onShowOpenSizeChange}
                      defaultPageSize={pageSizeOpen}
                      pageSizeOptions={['5','10','20','30','50']}
                      style={{float:'right',margin:'10px 0 70px'}}
                      onChange={this.onChangeOpenPage}
                      total={paginationOpen.total} />

          <Affix
            offsetBottom={0}
            style={{
              position: 'fixed',
              bottom: 0,
              marginLeft: '-35px',
              width: '100%',
              height: '50px',
              boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
              background: '#fff',
              lineHeight: '50px',
            }}
          >
            <div>
              <Button
                className="button-return"
                style={{ marginLeft: '40px', marginRight: '8px' }}
                onClick={this.HandleReturn}
              >
                {this.$t({ id: 'budgetJournal.return' })}
              </Button>
            </div>
          </Affix>
        </Spin>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {}
}

const WrappedAccountPeriodDetail = Form.create()(AccountPeriodDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedAccountPeriodDetail);
