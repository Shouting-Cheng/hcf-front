import React from 'react'
import { connect } from 'dva'
import httpFetch from 'share/httpFetch'
import config from 'config'
import { Form, Button, Input, message, Icon } from 'antd'
import Table from 'widget/table'
const Search = Input.Search;
import { routerRedux } from 'dva/router';

import BasicInfo from 'widget/basic-info'
import SlideFrame from 'widget/slide-frame'
import NewStrategyControlDetail from 'containers/budget-setting/budget-organization/budget-strategy/new-strategy-control-detail'
import 'styles/budget-setting/budget-organization/budget-strategy/strategy-control-detail.scss'


class StrategyControlDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      strategyControlId: null,
      infoList: [
        {type: 'input', label: this.$t({id: "common.sequence"}/*序号*/), id: 'detailSequence', isRequired: true, disabled: true},
        {type: 'input', label: this.$t({id: "budget.strategy.rule.code"}/*规则代码*/), id: 'detailCode', isRequired: true, disabled: true},
        {type: 'value_list', label: this.$t({id: "budget.strategy.control.strategy"}/*控制策略*/), id: 'controlMethod',
          isRequired: true, options: [], valueListCode: 2005, event: 'controlMethod'},
        {type: 'input', label: this.$t({id: "budget.strategy.rule.name"}/*控制规则名称*/), id: 'detailName', isRequired: true},
        {type: 'value_list', label: this.$t({id: "budget.strategy.message"}/*消息*/), id: 'messageCode',
          options: [], valueListCode: 2022, isRequired: true, disabled: false},
        {type: 'input', label: this.$t({id: "budget.strategy.event"}/*事件*/), id: 'expWfEvent'},
      ],
      infoData: {},
      updateState: false,
      baseInfoLoading: false,
      columns: [
        {title: this.$t({id: "budget.strategy.detail.type"}/*类型*/), dataIndex: 'id',
          render:() => {return this.$t({id: "budget.strategy.detail.formula"}/*公式*/)}},
        {title: this.$t({id: "budget.strategy.detail.control.object"}/*控制对象*/), dataIndex: 'object', render: value => <span>{value.label}</span>},
        {title: this.$t({id: "budget.strategy.detail.compare"}/*比较*/), dataIndex: 'range', render: value => <span>{value.label}</span>},
        {title: this.$t({id: "budget.strategy.detail.control.period"}/*控制期段*/), dataIndex: 'periodStrategy', render: value => <span>{value.label}</span>},
        {title: this.$t({id: "budget.strategy.detail.manner"}/*方式*/), dataIndex: 'manner', render: value => <span>{value.label}</span>},
        {title: this.$t({id: "common.operation"}/*操作*/), dataIndex: 'operator',
          render:(value, record)=>{return record.manner.value === 'FIXED_AMOUNT' ? value.label : '-'}},
        {title: this.$t({id: "budget.strategy.detail.value"}/*值*/), dataIndex: 'value',
          render:(value, record)=>{return record.manner.value === 'PERCENTAGE' ? value+'%' : value}},
      ],
      data: [],
      showSlideFrame: false,
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0
      },
      newParams: {},
      keyWords: '',
      isNew: false, //判断侧滑是新建或编辑
    };
  }

  componentWillMount() {
    this.setState({
      strategyControlId: this.props.match.params.id,
      newParams: {
        strategyControlId: this.props.match.params.id,
      }
    },() => {
      this.getBasicInfo();
      this.getList();
    })
  }

  getBasicInfo() {
    httpFetch.get(`${config.budgetUrl}/api/budget/control/strategy/details/${this.state.strategyControlId}`).then((res) => {
      if(res.status === 200) {
        let infoList = this.state.infoList;
        if (res.data.controlMethod.value === 'NO_MESSAGE') {
          res.data.messageCode = "";
          infoList.find(item => {
            if (item.id === 'messageCode') {
              item.isRequired = false;
              item.disabled = true
            }
          });
        }
        this.setState({ infoData: res.data, infoList })
      }
    })
  }

  getList() {
    let url = `${config.budgetUrl}/api/budget/control/strategy/mp/conds/query?page=${this.state.page}&size=${this.state.pageSize}&controlStrategyDetailId=${this.state.strategyControlId}`;
    url += this.state.keyWords ? `&keyWords=${this.state.keyWords}` : '';
    this.setState({ loading: true });
    httpFetch.get(url).then((response)=>{
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    }).catch((e)=>{

    })
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

  showSlide = (flag) => {
    this.setState({
      showSlideFrame: flag,
      isNew: true,
      newParams: {
        strategyControlId: this.props.match.params.id,
      }
    })
  };

  showUpdateSlide = (flag) => {
    this.setState({
      showSlideFrame: flag,
      isNew: false
    })
  };

  handleCloseSlide = (params) => {
    this.setState({
      showSlideFrame: false
    },() => {
      params && this.getList()
    })
  };

  //更新基本信息
  handleUpdate = (params) => {
    params.id = this.state.strategyControlId;
    params.versionNumber = this.state.infoData.versionNumber;
    if(!params.controlMethod || !params.detailName) return;
    if (params.controlMethod === 'NO_MESSAGE') {
      params.messageCode = undefined
    } else if (params.controlMethod !== 'NO_MESSAGE' && !params.messageCode) {
      message.error(this.$t({id: "budget.strategy.select.message"}/*请选择消息*/));
      return;
    }
    this.setState({ baseInfoLoading: true }, () => {
      httpFetch.put(`${config.budgetUrl}/api/budget/control/strategy/details`, params).then((response)=>{
        if(response.status === 200) {
          message.success(this.$t({id: "common.save.success"}, {name: ""}/*保存成功*/));
          this.getBasicInfo();
          this.setState({ updateState: true, baseInfoLoading: false }, () => {
            this.setState({ updateState: false })
          })
        }
      }).catch((e)=>{
        this.setState({ updateState: false, baseInfoLoading: false });
        if(e.response){
          message.error(`${this.$t({id: "common.save.filed"},/*保存失败*/)}, ${e.response.data.message}`);
        }
      })
    })
  };

  handleRowClick = (record) => {
    record.strategyControlId = this.props.match.params.id;
    this.setState({
      newParams: record
    }, () => {
      this.showUpdateSlide(true)
    })
  };

  handleBack = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-strategy/budget-strategy-detail/:setOfBooksId/:orgId/:id'
          .replace(':orgId', this.props.match.params.orgId)
          .replace(':setOfBooksId',this.props.match.params.setOfBooksId)
          .replace(':id', this.props.match.params.strategyId)
      })
    );
  };

  //处理修改基本信息
  eventHandle = (e) => {
    e = e || this.state.infoData.controlMethod.value;
    let infoList = this.state.infoList;
    infoList.map((item) => {
      if (item.id === 'messageCode') {
        if (e === 'NO_MESSAGE') {
          item.disabled = true;
          item.isRequired = false;
          this.infoRef._reactInternalInstance._renderedComponent._instance.setValues({'messageCode': ''})
        } else {
          item.disabled = false;
          item.isRequired = true;
        }
      }
    });
    this.setState({ infoList })
  };

  render() {
    const { infoList, infoData, columns, data, loading, pagination, showSlideFrame, updateState, baseInfoLoading, newParams, isNew } = this.state;
    return (
      <div className="strategy-control-detail" style={{paddingBottom:20}}>
        <BasicInfo infoList={infoList}
                   infoData={infoData}
                   updateHandle={this.handleUpdate}
                   updateState={updateState}
                   eventHandle={this.eventHandle}
                   wrappedComponentRef={(inst) => this.infoRef = inst}
                   loading={baseInfoLoading}/>
        <div className="table-header">
          <div className="table-header-title">
            <h5>{this.$t({id: "budget.strategy.detail.condition"}/*触发条件*/)}</h5>
            {this.$t({id: "common.total"},{total:`${pagination.total || 0}`}/*共搜索到 {total} 条数据*/)}
          </div>
          <div className="table-header-buttons">
            <Button type="primary"  onClick={() => this.showSlide(true)}>{this.$t({id: "common.create"}/*新建*/)}</Button>
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               rowKey={record => record.id}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               bordered
               size="middle"/>
        <SlideFrame title={(isNew ? this.$t({id: "common.create"}/*新建*/) : this.$t({id: "common.edit"}/*编辑*/)) + ' ' + this.$t({id: "budget.strategy.detail.condition"}/*触发条件*/)}
                    show={showSlideFrame}
                    onClose={() => this.showUpdateSlide(false)}>
          <NewStrategyControlDetail
            onClose={this.handleCloseSlide}
            params={{newParams, isNew}}/>
        </SlideFrame>
        <a style={{fontSize:'14px',paddingBottom:'20px'}} onClick={this.handleBack}>
          <Icon type="rollback" style={{marginRight:'5px'}}/>{this.$t({id:"common.back"}/*返回*/)}
        </a>
      </div>
    )
  }
}

function mapStateToProps() {
  return {}
}

const WrappedStrategyControlDetail = Form.create()(StrategyControlDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedStrategyControlDetail);
