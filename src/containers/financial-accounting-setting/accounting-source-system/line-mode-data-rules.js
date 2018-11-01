/**
 * Created by 13576 on 2018/1/14.
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Table, Badge, Icon, Popconfirm, message, Input, Popover } from 'antd'
import SlideFrame from 'containers/financial-accounting-setting/accounting-source/slide-frame'
import newUpDataLineModeDataRules from 'containers/financial-accounting-setting/accounting-source-system/new-updata-line-mode-data-rules'
import accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import { routerRedux } from 'dva/router';

class LineModeDataRulesSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataVisible: false,
      sourceTransactionCode: "",
      searchText: "",
      recode: {},
      filterDropdownVisible: false,
      data: [],
      journalLineModel: {},
      lov: {
        visible: false
      },
      page: 0,
      pageSize: 10,
      searchParams: [],
      pagination: {
        total: 0,
      },
      searchForm: [
        {                                                                        //来源事物代码
          type: 'input', id: 'journalLineModelCode', label: this.$t({ id: 'accounting.source.code' })
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'description', label: this.$t({ id: 'section.structure.name' })
        },
      ]
    };
  }


  componentWillMount() {
    this.getList();
    this.getLineMode();
    // this.getSourceTransactionData();
  }

  getLineMode() {
    accountingService.getSourceTransactionModelbyID(this.props.match.params.lineModelId).then((response) => {
      this.setState({
        journalLineModel: response.data
      })
    })
  }

  // getSourceTransactionData() {
  //   accountingService.getSourceTransactionDatabyID(this.props.match.params.id).then((response) => {
  //     this.setState({
  //       sourceTransactionCode: response.data.sourceTransactionCode,
  //     })
  //   })
  // }


  getList(searchText) {
    this.setState({
      loading: true
    })
    let params = Object.assign({}, this.state.searchParams);
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.size = this.state.pageSize;
    params.journalLineModelId = this.props.match.params.lineModelId;
    if (searchText) {
      params.elementNature = searchText;
    } else {
      params.elementNature = "";
    }
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    accountingService.getSystemSourceLineModelDataRules(params).then((response) => {
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
      this.setState({
        loading: false
      })
      message.error(`${e.response.data.message}`)
    });

  }

  handleSearch = (params) => {
  };

  handleCreate = () => {
    let timestamp = (new Date()).valueOf();
    let lov = {
      title: this.$t({ id: "accounting.source.newDataRules" }),
      visible: true,
      params: {
        isNew: true,
        timestamp: timestamp,
        sourceTransactionId: this.props.match.params.id,
        lineModelId: this.props.match.params.lineModelId,
        glSceneId: this.state.journalLineModel.glSceneId,
        journalLineModel: this.state.journalLineModel,
        sourceTransactionCode: this.state.sourceTransactionCode,
      }
    };
    this.setState({
      lov
    })
  };

  handleUpdate = (record) => {
    let timestamp = (new Date()).valueOf();
    let params = {
      record: record,
      isNew: false,
      timestamp: timestamp,
      sourceTransactionId: this.props.match.params.id,
      lineModelId: this.props.match.params.lineModelId,
      glSceneId: this.state.journalLineModel.glSceneId,
      journalLineModel: this.state.journalLineModel,
      sourceTransactionCode: this.state.sourceTransactionCode,
    }
    let lov = {
      title: this.$t({ id: "accounting.source.editDataRules" }),
      visible: true,
      params: params
    };
    this.setState({
      lov
    })
  };

  handleAfterClose = (valueRecord) => {
    console.log(valueRecord)
    if (valueRecord && JSON.stringify(valueRecord) != "{}"&&valueRecord.value.flag) {
      let value = valueRecord.value;
      let saveCount = valueRecord.saveCount;
      if (value.dataRule == "VALUE_OF_RULE" && saveCount < 2) {
        accountingService.getSystemSourceLineModelDataRulesById(value.id).then((res) => {
          let timestamp = (new Date()).valueOf();
          let params = {
            record: res.data,
            isNew: false,
            timestamp: timestamp,
            sourceTransactionId: this.props.match.params.id,
            lineModelId: this.props.match.params.lineModelId,
            glSceneId: this.state.journalLineModel.glSceneId,
            journalLineModel: this.state.journalLineModel,
            sourceTransactionCode: this.state.sourceTransactionCode,
          };
          let lov = {
            title: this.$t({ id: "accounting.source.editDataRules" }),
            visible: true,
            params: params
          };
          this.setState({
            lov
          }, () => {
            this.getList();
          })

        }).catch((e) => {

        })

      } else {
        this.setState({
          lov: { visible: false }
        }, () => {
          this.getList()
        })
      }
    } else {
      this.setState({
        lov: {
          visible: false
        }
      })
    }

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
        pathname: '/financial-accounting-setting/accounting-source-system/voucher-template/:id/:sourceTransactionType'
          .replace(':id', this.props.match.params.id)
      })
    );
  };

  //取消添加凭证模板
  handleCancel = () => {
    this.setState({ showListSelector: false })
  };


  onSearch = () => {
    const { searchText } = this.state;
    this.setState({
      filterDropdownVisible: false,
    }, () => {
      this.getList(searchText)
    })
  }

  onInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  }


  render() {
    const { loading, data, pagination, lov, journalLineModel } = this.state;
    const columns = [
      {
        /*核算要素*/
        title: this.$t({ id: "accounting.source.accountElementCode" }), key: "accountElementCode", dataIndex: 'accountElementCode',
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        /*要素性质*/
        title: this.$t({ id: "accounting.source.elementNature" }), key: "elementNature", dataIndex: 'elementNature',
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput = ele}
              placeholder={this.$t({ id: "accounting.source.elementNature" })}
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>Search</Button>
          </div>
        ),
        filterIcon: <Icon type="filter" />,
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            filterDropdownVisible: visible,
          }, () => this.searchInput && this.searchInput.focus());
        },
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        /*取值方式*/
        title: this.$t({ id: "accounting.source.dataRule" }), key: "dataRuleName", dataIndex: 'dataRuleName',
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        /*取值*/
        title: "取值", key: "data", tableField: 'data', width: '35%',
        render: (value, record) => {
          if (record.dataRule != "FIXED_VALUE" && record.dataRule != "VALUE_OF_API") {
            return (
              <div style={{ whiteSpace: "normal" }}>
                <div>{`${this.$t({ id: "accounting.source.sourceDataCode" })} : ` + record.sourceDataName + " , " + `${this.$t({ id: "accounting.source.sourceDatafile" })} : ` + record.tableFieldName}</div>
              </div>
            )
          } else {
            return (
              <div style={{ whiteSpace: "normal" }}>
                <div>{record.dataRule != "FIXED_VALUE" ? `${this.$t({ id: "accounting.source.fromAPI" })} : ` + record.tableField : record.tableField}</div>
              </div>
            )
          }

        }
      },
      {
        /*状态*/
        title: this.$t({ id: "common.column.status" }), key: 'status', width: '10%', dataIndex: 'enabled',
        render: enabled => (
          <Badge status={enabled ? 'success' : 'error'}
            text={enabled ? this.$t({ id: "common.status.enable" }) : this.$t({ id: "common.status.disable" })} />
        )
      },
      {
        title: this.$t({ id: "common.operation" }),
        key: 'operation',
        width: '8%',
        render: (text, record, index) => (
          <span>
            <a onClick={(e) => this.handleUpdate(record)}>{this.$t({ id: "common.edit" })}</a>
          </span>)
      },
    ];
    return (
      <div className="voucher-template" style={{paddingBottom: 20}}>
        <div className="voucher-template-header">
          <h3>
            <span style={{ marginLeft: "16px", size: "16px" }}>{this.$t({ id: "accounting.source.source" })}:{journalLineModel.sourceTransactionName}</span>
            <span style={{ marginLeft: "16px", size: "16px" }}>{this.$t({ id: "accounting.source.mode" })}:{journalLineModel.journalLineModelCode}</span>
            <span style={{ marginLeft: "16px", size: "16px" }}>{this.$t({ id: "accounting.source.scenarios" })}:{journalLineModel.glSceneName}</span>
          </h3>
        </div>

        <div className="table-header">
          <div
            className="table-header-title">{this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{this.$t({ id: 'common.create' })}</Button> {/*新 建*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          bordered
          size="middle" />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}><Icon type="rollback"
          style={{ marginRight: '5px' }} />{this.$t({ id: "common.back" })}
        </a>
        <SlideFrame width="50vw" title={lov.title}
          show={lov.visible}
          content={newUpDataLineModeDataRules}
          afterClose={this.handleAfterClose}
          onClose={() => this.handleShowSlide(false)}
          params={{ ...lov.params, visible: lov.visible }} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(LineModeDataRulesSystem);
