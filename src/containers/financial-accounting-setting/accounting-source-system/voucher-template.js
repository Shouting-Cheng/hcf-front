/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import {connect} from 'dva'
import {Button, Table, Badge, Icon, Popconfirm, message,Input} from 'antd'
import SlideFrame from 'widget/slide-frame'
import NewUpdateVoucherTemplate from 'containers/financial-accounting-setting/accounting-source-system/new-update-voucher-template'
import debounce from 'lodash.debounce'
import  accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import 'styles/financial-accounting-setting/accounting-source-system/accounting-source-system.scss'
const Search = Input.Search;
import { routerRedux } from 'dva/router';

class AccountingSource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataVisible: false,
      data: [],
      lov: {
        visible: false
      },
      page: 0,
      pageSize: 10,
      searchParams: [],
      sourceName: "",
      keyWords:null,
      pagination: {
        total: 0
      },
      searchForm: [
        {                                                                        //来源事物代码
          type: 'input', id: 'journalLineModelCode', label: this.$t({id: 'accounting.source.code'})
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'description', label: this.$t({id: 'section.structure.name'})
        },
      ],
      columns: [
        {
          /*凭证行模板代码*/
          title: this.$t({id: "voucher.template.code"}),
          key: "journalLineModelCode",
          dataIndex: 'journalLineModelCode'
        },
        {
          /*凭证行模板名称*/
          title: this.$t({id: "voucher.template.name"}), key: "description", dataIndex: 'description'
        },
        {
          /*核算场景代码*/
          title: this.$t({id: "accounting.scene.code"}), key: "glSceneCode", dataIndex: 'glSceneCode'
        },
        {
          /*核算场景名称*/
          title: this.$t({id: "accounting.scene.name"}), key: "glSceneName", dataIndex: 'glSceneName'
        },
        {
          /*基础数据表*/
          title: this.$t({id: "basic.data.sheet"}), key: "basicSourceDateDes", dataIndex: 'basicSourceDateDes'
        },
        {
          /*状态*/
          title: this.$t({id: "common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({id: "common.status.enable"}) : this.$t({id: "common.status.disable"})}/>
          )
        },
        {
          title: this.$t({id: "common.operation"}),
          key: 'operation',
          width: 300, align:'center',
          render: (text, record, index) => (
            <span>
            <a onClick={(e) => this.handleUpdate(e, record, index)}>{this.$t({id: "common.edit"})}</a>
              <span className="ant-divider"/>
            <a onClick={(e) => this.handleDataRules(e, record, index)}>{this.$t({id: "accounting.source.dataRules"})}</a> {/*取值规则*/}
              <span className="ant-divider"/>
            <a onClick={(e) => this.handleJudgeRules(e, record, index)}>{this.$t({id: "accounting.source.judgeRuleName"})}</a> {/*判断规则*/}
              <span className="ant-divider"/>
            <a onClick={(e) => this.handleRules(e, record, index)}>{this.$t({id: "accounting.source.rule"})}</a> {/*核算规则*/}
           </span>
          )
        },

      ],
    };
    this.handleSearch = debounce(this.handleSearch, 250);
  }


  componentWillMount() {
    this.getList();
    this.getSourceName();
  }

  handleJudgeRules = (e, record, index) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-judge-rules-system/:lineModelId/:id'
          .replace(':id', this.props.match.params.id).replace(':lineModelId', record.id)
      })
    );
  };

  handleRules = (e, record, index) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-rules-system/:lineModelId/:id'
          .replace(':id', this.props.match.params.id).replace(':lineModelId', record.id)
      })
    );
  };

  handleDataRules = (e, record, index) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-data-rules-system/:lineModelId/:id'
          .replace(':id', this.props.match.params.id).replace(':lineModelId', record.id)
      })
    );
  };

  //获取来源事务名称
  getSourceName() {
    let sourceId = this.props.match.params.id;
    accountingService.getSourceTransactionbyID(sourceId).then((response) => {
      let data = response.data;
      console.log(data);
      this.setState({
        sourceName: data.description,
        sourceTransactionCode: data.sourceTransactionCode,
      })
    })
  }


  getList() {
    this.setState({loading: true});
    let params = Object.assign({}, this.state.searchParams);
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.size = this.state.pageSize;
    params.sourceTransactionId = this.props.match.params.id;
    params.journalLineModelCodeOrDescription = this.state.keyWords;
    accountingService.getSourceTransactionModel(params).then((response) => {
      response.data.map((item, index) => {
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          pageSize: this.state.pageSize,
          current: this.state.page + 1
        }
      })
    }).catch(e => {
      message.error(`${e.response.data.message}`);
      this.setState({loading: true})
    });

  }


  handleCreate = () => {
    let time = (new Date()).valueOf();
    let lov = {
      title: this.$t({id: "voucher.template.new"}),
      visible: true,
      params: {
        isNew: true,
        sourceTransactionId: this.props.match.params.id,
        sourceTransactionCode: this.props.match.params.sourceTransactionType,
        time: time
      }
    };
    this.setState({
      lov
    })
  };

  //搜索 名称／代码
  handleSearch= (value) => {
    this.setState({
      page: 0,
      keyWords: value,
      pagination: {
        current: 1
      }
    }, () => {
      this.getList();
    })
  };

  handleUpdate = (e, record, index) => {
    let time = (new Date()).valueOf()
    let basicSourceDate = {
      id: record.basicSourceDate,
      description: "1231",
      key: record.basicSourceDate
    }
    let params = {
      record: record,
      "isNew": false,
      sourceTransactionCode: this.props.match.params.sourceTransactionType,
      "basicSourceDate": [].push(basicSourceDate),
      time: time
    }
    let lov = {
      title: this.$t({id: "voucher.template.update"}),
      visible: true,
      params: params
    };
    this.setState({
      lov
    })
  };

  handleAfterClose = (value) => {
    this.setState({
      lov: {
        visible: false
      }
    }, () => {
      if (value) {
        this.getList();
      }
    })
  };

  handleShowSlide = () => {
    this.setState({
      lov: {
        visible: false
      }
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

  handleBack = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-source-system',
      })
    );
  };

  //取消添加凭证模板
  handleCancel = () => {
    this.setState({showListSelector: false})
  };


  render() {
    const {loading, data, columns, searchForm, pagination, lov, dataVisible, sourceName} = this.state;
    return (
      <div className="voucher-template">
        <div className="voucher-template-header">
          <h3>{ `${this.$t({id:"voucher.template.header1"})} `+sourceName+` ${this.$t({id:"voucher.template.header2"})}`}</h3>
        </div>

        <div className="table-header">
          <div
            className="table-header-title">{this.$t({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.create'})}</Button> {/*新 建*/}
            <Search placeholder={this.$t({id: 'voucher.template.input'})/* 请输入名称/代码 */}
                    style={{ width:200,position:'absolute',right:0,bottom:0 }}
                    onChange={(e) => this.handleSearch(e.target.value)}/>
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          onChange={this.onChangePager}
          bordered
          size="middle"/>
        <a style={{fontSize: '14px', paddingBottom: '20px'}} onClick={this.handleBack}><Icon type="rollback"
                                                                                             style={{marginRight: '5px'}}/>{this.$t({id: "common.back"})}
        </a>
        <SlideFrame title={lov.title}
                    show={lov.visible}
                    afterClose={this.handleAfterClose}
                    onClose={() => this.handleShowSlide(false)}>
          <NewUpdateVoucherTemplate
            onClose={this.handleAfterClose}
            params={lov.params}/>
        </SlideFrame>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingSource);
