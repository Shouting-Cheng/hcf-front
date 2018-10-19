/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import {connect} from 'react-redux'
import {Button, Table, Badge, Icon, message, Popover,Checkbox,Input} from 'antd'
import ListSelector from 'components/list-selector'
import config from 'config'
import menuRoute from 'routes/menuRoute'
import debounce from 'lodash.debounce'
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service'
import 'styles/financial-accounting-setting/accounting-source/accounting-source.scss'
import {formatMessage} from 'share/common'
const Search = Input.Search;


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
        title: formatMessage({id: "accounting.source.lovTitle"}),
        url: `${config.localUrl}/api/general/ledger/sob/source/transactions/query/filter`,
        searchForm: [
          {type: 'input', id: 'sourceTransactionCode', label: formatMessage({id: "accounting.source.code"})},
          {type: 'input', id: 'description', label: formatMessage({id: "accounting.source.name"})}
        ],
        columns: [
          {title: formatMessage({id: "accounting.source.code"}), dataIndex: 'sourceTransactionCode', width: '25%'},
          {title: formatMessage({id: "accounting.source.name"}), dataIndex: 'description', width: '25%'},
        ],
        key: 'id'
      },
      pagination: {
        total: 0,
      },
      searchForm: [
        {                                                                        //来源事物代码
          type: 'input', id: 'accountingSourceCode', label: formatMessage({id: 'accounting.source.code'})
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'accountingSourceName', label: formatMessage({id: 'section.structure.name'})
        },
      ],
      columns: [
        {
          /*凭证行模板代码*/
          title: formatMessage({id: "voucher.template.code"}),
          key: "journalLineModelCode",
          dataIndex: 'journalLineModelCode',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*凭证行模板名称*/
          title: formatMessage({id: "voucher.template.name"}), key: "description", dataIndex: 'description',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*核算场景代码*/
          title: formatMessage({id: "accounting.scene.code"}), key: "glSceneCode", dataIndex: 'glSceneCode',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*核算场景名称*/
          title: formatMessage({id: "accounting.scene.name"}), key: "glSceneName", dataIndex: 'glSceneName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        {
          /*基础数据表*/
          title: formatMessage({id: "basic.data.sheet"}), key: "dataStructureName", dataIndex: 'dataStructureName',
          render: recode => (
            <Popover content={recode}>
              {recode}
            </Popover>)
        },
        /*启用*/
        {
          title: formatMessage({id: "common.column.status"}),
          key: 'enabled',
          width: '5%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)}
                                                   checked={record.enabled}/>
        },
        {
          title: formatMessage({id: "common.operation"}),
          key: 'operation',
          width: '22%',
          render: (text, record, index) => (
            <span>
            <a href="#" onClick={(e) => this.handleDataRules(e, record, index)}>{formatMessage({id: "accounting.source.dataRules"})}</a> {/*取值规则*/}
              <span className="ant-divider"/>
            <a href="#" onClick={(e) => this.handleJudgeRules(e, record, index)}>{formatMessage({id: "accounting.source.judgeRuleName"})}</a> {/*判断规则*/}
              <span className="ant-divider"/>
            <a href="#" onClick={(e) => this.handleRules(e, record, index)}>{formatMessage({id: "accounting.source.rule"})}</a> {/*核算规则*/}
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
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source', 'key').children.lineModeJudgeRules.url.replace(':id', this.props.params.id).replace(':lineModelId', record.id))
  };


  handleRules = (e, record, index) => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source', 'key').children.lineModeRules.url.replace(':id', this.props.params.id).replace(':lineModelId', record.id))

  }

  handleDataRules = (e, record, index) => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source', 'key').children.lineModeDataRules.url.replace(':id', this.props.params.id).replace(':lineModelId', record.id))
  }

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
    params.sobSourceTransactionId = this.props.params.id;
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
      message.success(`${formatMessage({id: 'common.operate.success'})}`);
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
    let sourceId = this.props.params.id;
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
      title: formatMessage({id: "voucher.template.update"}),
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
    accountingService.addSourceTransactionModelSob(this.props.params.id, valueData).then(() => {
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
    let path = menuRoute.getMenuItemByAttr('accounting-source', 'key').url.replace(":sourceSetOfBooksId",this.state.setOfBooksId);
    this.context.router.push(path);
  };

  render() {
    const {loading, data, columns, searchForm, pagination, lov, dataVisible, showListSelector, sourceName} = this.state;
    return (
      <div className="voucher-template">
        <div className="voucher-template-header">
          <h3>{ `${formatMessage({id:"voucher.template.header1"})} `+sourceName+` ${formatMessage({id:"voucher.template.header2"})}`}</h3>
        </div>
        <div className="table-header">
          <div
            className="table-header-title">{formatMessage({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.add'})}</Button> {/*添加*/}
            <Search placeholder={formatMessage({id: 'voucher.template.input'})/* 请输入名称/代码 */}
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
                                                                                             style={{marginRight: '5px'}}/>{formatMessage({id: "common.back"})}
        </a>
        <ListSelector visible={showListSelector}
                      onOk={this.handleAdd}
                      onCancel={this.handleCancel}
                      type="sobLineModel"
                      extraParams={{sobSourceTransactionId: this.props.params.id}}/>
      </div>
    )
  }
}


VoucherTemplateSob.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(VoucherTemplateSob);
