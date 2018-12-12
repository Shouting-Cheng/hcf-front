import React from 'react'
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import { Form, Badge, Modal } from 'antd'
import Table from 'widget/table'
import periodControlService from 'containers/finance-setting/account-period-control/account-period-control.service'
import SearchArea from 'components/Widget/search-area';

class AccountPeriodControl extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: false,
      searchForm: [
        {type: 'input', id: 'setOfBooksCode', label: this.$t('account.period.control.sobCode')}, //账套代码
        {type: 'input', id: 'setOfBooksName', label: this.$t('legal.entity.detail.sob.name')} //账套名称
      ],
      searchParams: {},
      columns: [
        {title: this.$t('account.period.control.sobCode'), key: "setOfBooksCode", dataIndex: "setOfBooksCode"}, //账套代码
        {title: this.$t('legal.entity.detail.sob.name'), key: "setOfBooksName", dataIndex: 'setOfBooksName'}, //账套名称
        {title: this.$t('account.period.control.periodSetCode'), key: "periodSetCode", dataIndex: 'periodSetCode'}, //会计期代码
        {title: this.$t('set-of-books.base.currency'), key: "functionalCurrencyCode", dataIndex: 'functionalCurrencyCode'}, //本位币
        {title: this.$t('subject.sheet'), key: "accountSetCode", dataIndex: 'accountSetCode'}, //科目表
        {title: this.$t('common.column.status'), key: "enabled", dataIndex: 'enabled',width: '10%',  //状态
          render: isEnabled => <Badge status={isEnabled ? 'success' : 'error'}
                                      text={isEnabled ? this.$t('common.status.enable') : this.$t('common.status.disable')} />},
      ],
      data: [],
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      // accountPeriodDetail:  menuRoute.getRouteItem('account-period-detail','key'),    //会计期间信息详情
    };
  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    const { page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    periodControlService.getAccountPeriodList(page, pageSize, searchParams).then((res)=>{
      if(res.status === 200){
        this.setState({
          data: res.data,
          loading: false,
          pagination: {
            total: Number(res.headers['x-total-count']),
            onChange: this.onChangePager,
            pageSize: this.state.pageSize
          }
        })
      }
    }).catch(() => {
      this.setState({ loading: false })
    })
  };

  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, ()=>{
        this.getList();
      })
  };

  search = (result) => {
    this.setState({
      searchParams: result,
      loading: true,
      page: 0,
      pagination: {
        current: 1,
        total: 0
      }
    }, ()=>{
      this.getList();
    })
  };

  clear = () => {
    this.setState({
      searchParams: {
        sobCode: '',
        sobName: ''
      }
    })
  };

  handleRowClick = (record) => {
    if (!record.enabled) {
      Modal.info({
        title: this.$t('account.period.control.disabled.info.title'),  //该账套被禁用
        content: this.$t('account.period.control.disabled.info.content'),  //禁用的账套无法打开或关闭会计期间
        maskClosable: true
      });
      return
    }
    this.props.dispatch(
      routerRedux.push({
          pathname: `/finance-setting/account-period-control/account-period-detail/${record.periodSetId}/${record.setOfBooksId}`,
      })
  );
    // this.context.router.push(this.state.accountPeriodDetail.url.replace(':periodSetId', record.periodSetId).replace(':setOfBooksId', record.setOfBooksId));
  };

  render(){
    
    const { loading, searchForm, columns, data, pagination } = this.state;
    return (
      <div className="account-period-control">
        <h3 className="header-title">{this.$t('account.period.control.title')/* 账套级会计期间控制 */}</h3>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total', {total: pagination.total || 0})/* 共 total 条数据 */}</div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               rowKey={record => record.setOfBooksCode}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               bordered
               size="middle"/>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {}
}

const WrappedAccountPeriodControl = Form.create()(AccountPeriodControl);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedAccountPeriodControl);
