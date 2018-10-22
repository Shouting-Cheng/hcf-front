/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import {connect} from 'react-redux'
import {Button, Table, Badge, Icon, Popconfirm, message,Input} from 'antd'
import SlideFrame from 'components/slide-frame'
import NewUpdateVoucherTemplate from 'containers/financial-accounting-setting/accounting-source-system/new-update-voucher-template'
import menuRoute from 'routes/menuRoute'
import debounce from 'lodash.debounce'
import  accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import 'styles/financial-accounting-setting/accounting-source-system/accounting-source-system.scss'
import {formatMessage} from 'share/common'
const Search = Input.Search;

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
          type: 'input', id: 'journalLineModelCode', label: formatMessage({id: 'accounting.source.code'})
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'description', label: formatMessage({id: 'section.structure.name'})
        },
      ],
      columns: [
        {
          /*凭证行模板代码*/
          title: formatMessage({id: "voucher.template.code"}),
          key: "journalLineModelCode",
          dataIndex: 'journalLineModelCode'
        },
        {
          /*凭证行模板名称*/
          title: formatMessage({id: "voucher.template.name"}), key: "description", dataIndex: 'description'
        },
        {
          /*核算场景代码*/
          title: formatMessage({id: "accounting.scene.code"}), key: "glSceneCode", dataIndex: 'glSceneCode'
        },
        {
          /*核算场景名称*/
          title: formatMessage({id: "accounting.scene.name"}), key: "glSceneName", dataIndex: 'glSceneName'
        },
        {
          /*基础数据表*/
          title: formatMessage({id: "basic.data.sheet"}), key: "basicSourceDateDes", dataIndex: 'basicSourceDateDes'
        },
        {
          /*状态*/
          title: formatMessage({id: "common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})}/>
          )
        },
        {
          title: formatMessage({id: "common.operation"}),
          key: 'operation',
          width: 300, align:'center',
          render: (text, record, index) => (
            <span>
            <a href="#" onClick={(e) => this.handleUpdate(e, record, index)}>{formatMessage({id: "common.edit"})}</a>
              <span className="ant-divider"/>
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


  componentWillMount() {
    this.getList();
    this.getSourceName();
  }

  handleJudgeRules = (e, record, index) => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source-system', 'key').children.lineModeJudgeRulesSystem.url.replace(':id', this.props.params.id).replace(':lineModelId', record.id))
  };


  handleRules = (e, record, index) => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source-system', 'key').children.lineModeRulesSystem.url.replace(':id', this.props.params.id).replace(':lineModelId', record.id))

  }

  handleDataRules = (e, record, index) => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source-system', 'key').children.lineModeDataRulesSystem.url.replace(':id', this.props.params.id).replace(':lineModelId', record.id))
  }



  //获取来源事务名称
  getSourceName() {
    let sourceId = this.props.params.id;
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
    params.sourceTransactionId = this.props.params.id;
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
      title: formatMessage({id: "voucher.template.new"}),
      visible: true,
      params: {
        isNew: true,
        sourceTransactionId: this.props.params.id,
        sourceTransactionCode: this.props.params.sourceTransactionType,
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
      sourceTransactionCode: this.props.params.sourceTransactionType,
      "basicSourceDate": [].push(basicSourceDate),
      time: time
    }
    let lov = {
      title: formatMessage({id: "voucher.template.update"}),
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
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source-system', 'key').url);
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
          <h3>{ `${formatMessage({id:"voucher.template.header1"})} `+sourceName+` ${formatMessage({id:"voucher.template.header2"})}`}</h3>
        </div>

        <div className="table-header">
          <div
            className="table-header-title">{formatMessage({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.create'})}</Button> {/*新 建*/}
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
        <SlideFrame title={lov.title}
                    show={lov.visible}
                    content={NewUpdateVoucherTemplate}
                    afterClose={this.handleAfterClose}
                    onClose={() => this.handleShowSlide(false)}
                    params={lov.params}/>
      </div>
    )
  }
}


AccountingSource.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingSource);
