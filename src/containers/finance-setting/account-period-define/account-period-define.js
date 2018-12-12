import React from 'react'
import { connect } from 'dva';

import {  Button } from 'antd'
import Table from 'widget/table'
import SearchArea from 'components/Widget/search-area'
import SlideFrame from 'components/Widget/slide-frame'
import NewAccountPeriod from 'containers/finance-setting/account-period-define/new-account-period'
import NewAccountRule from 'containers/finance-setting/account-period-define/new-account-rule'

import periodDefineService from 'containers/finance-setting/account-period-define/account-period-define.service'


class AccountPeriodDefine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searchForm: [
        {type: 'input', id: 'periodSetCode', label: this.$t('account.period.define.code'/*会计期代码*/)}
      ],
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        {title: this.$t('account.period.define.code'/*会计期代码*/), dataIndex: 'periodSetCode'},
        {title: this.$t('account.period.define.name'/*会计期名称*/), dataIndex: 'periodSetName'},
        {title: this.$t('account.period.define.rule.total-period'/*期间总数*/), dataIndex: 'totalPeriodNum', width: '10%'},
        {title: this.$t('account.period.define.rule.addition-name'/*名称附加*/), dataIndex: 'periodAdditionalFlagDes'},
        {title: this.$t('common.operation'/*操作*/), key: 'operation', width: '20%', render: (text, record) => (
          <span>
            <a onClick={() => this.editItem(record)}>{this.$t('security.view'/*查看*/)}</a>
            <span className="ant-divider"/>
            <a onClick={() => this.ruleItem(record)}>{this.$t('account.period.define.rule'/*会计期规则*/)}</a>
          </span>
        )},
      ],
      pagination: {
        total: 0
      },
      searchParams: {
        periodSetCode: '',
        periodSetName: ''
      },
      slideFrameVisible: false,
      slideFrameTitle: '',
      SlideFrameContent: NewAccountPeriod,
      slideFrameParams: {},
    }
  }

  componentWillMount(){
    this.getList()
  }

  //得到列表数据
  getList(){
    const { page, pageSize, searchParams } = this.state;
    this.setState({ loading: true });
    periodDefineService.getPeriodDefineList(page, pageSize, searchParams).then(res=>{
      res.data.map((item)=>{ item.key = item.periodSetCode });
      this.setState({
        data: res.data,
        loading: false,
        pagination: {
          total: Number(res.headers['x-total-count']) || 0,
          onChange: this.onChangePager,
          current: page + 1
        }
      })
    });
  }

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
      page: 0,
      pagination: {
        total: 0
      },
      searchParams: result
    }, ()=>{
      this.getList();
    })
  };

  //新建会计期间
  handleNew = () => {
    this.setState({
      slideFrameVisible: true,
      slideFrameTitle: this.$t('account.period.define.new.account'/*新建会计期间*/),
      SlideFrameContent: NewAccountPeriod,
      slideFrameParams: {period: null, hasInit: false},
    })
  };

  //编辑
  editItem = (record) => {
    this.setState({
      slideFrameVisible: true,
      slideFrameTitle: this.$t('account.period.define.account.detail'/*会计期间详情*/),
      SlideFrameContent: NewAccountPeriod,
      slideFrameParams: {period: record, hasInit: false},
    })
  };

  //会计期规则
  ruleItem = (record) => {
    this.setState({
      slideFrameVisible: true,
      slideFrameTitle: this.$t('account.period.define.rule'/*会计期规则*/),
      SlideFrameContent: NewAccountRule,
      slideFrameParams: {period: record, hasInit: false},
    })
  };

  handleAfterClose = (params) => {
    this.setState({
      slideFrameVisible: false
    },() => {
      params && this.getList()
    })
  };

  render(){
    const { loading, columns, data, pagination, searchForm, slideFrameVisible, slideFrameTitle, SlideFrameContent, slideFrameParams } = this.state;
    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={() => {}}/>
        <div className="table-header">
          <div className="table-header-title">{this.$t('common.total', {total: pagination.total || 0})}</div> {/* 共total条数据 */}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{this.$t('common.create')}</Button> {/* 新建 */}
          </div>
        </div>
        <Table rowKey="id"
               columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               bordered
               size="middle"/>

        <SlideFrame show={slideFrameVisible}
                    title={slideFrameTitle}
                    onClose={() => {this.setState({ slideFrameVisible: false })}}>
            <SlideFrameContent 
                params={{...slideFrameParams,visible: slideFrameVisible}}
                onClose={this.handleAfterClose}/>
        </SlideFrame>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountPeriodDefine);
