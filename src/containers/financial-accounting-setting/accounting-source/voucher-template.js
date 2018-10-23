/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import {connect} from 'dva'
import {Button, Table, Badge, Icon, message, Popover,Checkbox,Input} from 'antd'
import ListSelector from 'widget/list-selector'
import config from 'config'
import debounce from 'lodash.debounce'
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service'
import 'styles/financial-accounting-setting/accounting-source/accounting-source.scss'
const Search = Input.Search;
import { routerRedux } from 'dva/router';


class VoucherTemplateSob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataVisible: false,
      showListSelector: false,
      sourceName: "",   //来源事务名称
      sourceTransactionCode: "",
      setOfBooksId:null,
      keyWords:null,
      data: [],
      lov: {
        title: this.$t({id: "accounting.source.lovTitle"}),
        url: `${config.localUrl}/api/general/ledger/sob/source/transactions/query/filter`,
        searchForm: [
          {type: 'input', id: 'sourceTransactionCode', label: this.$t({id: "accounting.source.code"})},
          {type: 'input', id: 'description', label: this.$t({id: "accounting.source.name"})}
        ],
        columns: [
          {title: this.$t({id: "accounting.source.code"}), dataIndex: 'sourceTransactionCode', width: '25%'},
          {title: this.$t({id: "accounting.source.name"}), dataIndex: 'description', width: '25%'},
        ],
        key: 'id'
      },
      pagination: {
        total: 0,
      },
      searchForm: [
        {                                                                        //来源事物代码
          type: 'input', id: 'accountingSourceCode', label: this.$t({id: 'accounting.source.code'})
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'accountingSourceName', label: this.$t({id: 'section.structure.name'})
        },
      ],
      columns: [
        {
          /*凭证行模板代码*/
          title: this.$t({id: "voucher.template.code"}),
          key: "journalLineModelCode",
          dataIndex: 'journalLineModelCode',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*凭证行模板名称*/
          title: this.$t({id: "voucher.template.name"}), key: "description", dataIndex: 'description',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*核算场景代码*/
          title: this.$t({id: "accounting.scene.code"}), key: "glSceneCode", dataIndex: 'glSceneCode',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*核算场景名称*/
          title: this.$t({id: "accounting.scene.name"}), key: "glSceneName", dataIndex: 'glSceneName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*基础数据表*/
          title: this.$t({id: "basic.data.sheet"}), key: "dataStructureName", dataIndex: 'dataStructureName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        /*启用*/
        {
          title: this.$t({id: "common.column.status"}),
          key: 'enabled',
          width: '5%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)}
                                                   checked={record.enabled}/>
        },
        {
          title: this.$t({id: "common.operation"}),
          key: 'operation',
          width: '22%',
          render: (text, record, index) => (
            <span>
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



  handleJudgeRules = (e, record, index) => {

    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source', 'key').children.lineModeJudgeRules.url.replace(':id', this.props.match.params.id).replace(':lineModelId', record.id))
  };


  handleRules = (e, record, index) => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source', 'key').children.lineModeRules.url.replace(':id', this.props.match.params.id).replace(':lineModelId', record.id))

  };

  handleDataRules = (e, record, index) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-source/voucher-template-sob/line-mode-data-rules/:id/:lineModelId'
          .replace(':id', this.props.match.params.id).replace(':lineModelId', record.id)
      })
    );
  };

  componentWillMount() {
    this.getList();
    this.getSourceName()
  }


  getList() {
    this.setState({
      loading: true
    })
    let params = Object.assign({}, this.state.searchParams);
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.size = this.state.pageSize;
    params.sobSourceTransactionId = this.props.match.params.id;
    params.keyWords = this.state.keyWords;
    accountingService.getSourceTransactionModelSob(params).then((response) => {
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
      message.error(`${e.response.data.message}`)
      this.setState({
        loading: false
      })
    });
  }

  //修改凭证模板，是否启用
  onChangeEnabled = (e, record) => {
    this.setState({loading: true});
    let data = [];
    record.enabled = e.target.checked;
    data.push(record);
    accountingService.upSourceTransactionModelSob(data).then(() => {
      message.success(`${this.$t({id: 'common.operate.success'})}`);
      this.setState({loading: false}, () => {
        this.getList();
      })
    }).catch((e) => {
      this.setState({loading: false})
      message.error(e.response.data.message);
      this.getList();
    })
  };

  //获取来源事务名称
  getSourceName() {
    let sourceId = this.props.match.params.id;
    accountingService.getSourceTransactionbyIDSob(sourceId).then((response) => {
      let data = response.data;
      this.setState({
        sourceName: data.description,
        setOfBooksId:data.setOfBooksId
      })
    })
  }


  handleCreate = () => {
    this.setState({
      showListSelector: true,
    })
  };

  handleUpdate = (e, record, index) => {
    let lov = {
      title: this.$t({id: "voucher.template.update"}),
      visible: true,
      params: record
    };
    this.setState({
      lov
    })
  };

  handleAfterClose = () => {
    this.setState({
      lov: {
        visible: false
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

  //点击确定后，添加凭证模板
  handleAdd = (value) => {
    let data = value.result;
    let valueData = [];
    if (data.length > 0) {
      data.map((item) => {
        valueData.push(
          {
            "journalLineModelId": item.id,
            "glSceneId": item.glSceneId
          }
        )
      })
    }
    this.setState({loading: true});
    accountingService.addSourceTransactionModelSob(this.props.match.params.id, valueData).then(() => {
      this.setState({showListSelector: false}, () => {
        this.getList()
      })

    }).catch((e) => {
      message.error(e.response.data.message)
      this.setState({loading: false});
    })
  }


  //取消添加凭证模板
  handleCancel = () => {
    this.setState({showListSelector: false})
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
        pathname: '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId'
          .replace(":sourceSetOfBooksId",this.state.setOfBooksId)
      })
    );
  };

  render() {
    const {loading, data, columns, searchForm, pagination, lov, dataVisible, showListSelector, sourceName} = this.state;
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
            <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.add'})}</Button> {/*添加*/}
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
        <ListSelector visible={showListSelector}
                      onOk={this.handleAdd}
                      onCancel={this.handleCancel}
                      type="sobLineModel"
                      extraParams={{sobSourceTransactionId: this.props.match.params.id}}/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(VoucherTemplateSob);
