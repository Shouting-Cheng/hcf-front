/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import {connect} from 'react-redux'
import {Button, Table, Checkbox, message} from 'antd'
import SearchArea from 'components/search-area';
import ListSelector from 'components/list-selector'
import config from 'config'
import menuRoute from 'routes/menuRoute'
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service'
import 'styles/financial-accounting-setting/accounting-source/accounting-source.scss'
import {formatMessage} from 'share/common'

class AccountingSource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      dataVisible: false,
      lovVisible: false,
      lov: {
        title: formatMessage({id: "accounting.source.lovTitle"}),
        url: `${config.accountingUrl}/api/general/ledger/sob/source/transactions/query/filter`,
        searchForm: [],
        columns: [
          {title: formatMessage({id: "accounting.source.code"}), dataIndex: 'sourceTransactionCode'},
          {title: formatMessage({id: "accounting.source.name"}), dataIndex: 'description'},
        ],
        key: 'id'
      },
      setOfBooksId: this.props.company.setOfBooksId,
      searchParams: {
        sourceTransactionCode: "",
        description: "",
      },
      pageSize: 10,
      page: 0,
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
      },
      searchForm: [
        {type: 'select', id: 'setOfBooksId', label:formatMessage({id: "paymentCompanySetting.setOfBooks"}), options: [], defaultValue: '', isRequired: true,
          labelKey: 'setOfBooksCode', valueKey: 'setOfBooksId',event:'setOfBook'
        },
        {                                                                        //来源事物代码
          type: 'input', id: 'sourceTransactionCode', label: formatMessage({id: 'accounting.source.code'})
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'description', label: formatMessage({id: 'accounting.source.name'})
        },
      ],
      columns: [
        {
          /*来源事物代码*/
          title: formatMessage({id: "accounting.source.code"}),
          key: "sourceTransactionCode",
          dataIndex: 'sourceTransactionCode'
        },
        {
          /*来源事物名称*/
          title: formatMessage({id: "accounting.source.name"}), key: "description", dataIndex: 'description'
        },
        {
          /*自动过账*/
          title: formatMessage({id: "accounting.auto.checked"}),
          key: "glInterfaceFlag",
          dataIndex: 'glInterfaceFlag',
          width: '10%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabledGlInterfaceFlag(e, record)}
                                                   checked={record.glInterfaceFlag}/>
        },
        /*启用*/
        {
          title: formatMessage({id: "common.column.status"}),
          key: 'enabled',
          width: '10%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)}
                                                   checked={record.enabled}/>
        },
        {
          title: formatMessage({id: "accounting.source.setting"}),
          key: 'operation',
          width: '10%',
          render: (text, record, index) => (
            <span>
            <a href="#"
               onClick={(e) => this.handleLinkTemplate(e, record, index)}>{formatMessage({id: "accounting.source.setOfBook.template"})}</a> {/*凭证模板*/}
          </span>)

        },
      ],
    };
  }


  handleLinkTemplate = (e, record, index) => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source', 'key').children.voucherTemplateSob.url.replace(':id', record.id))
  };

  componentWillMount() {
    this.getList();
    accountingService.getSetOfBooksByTenant().then((res) => {
      let searchForm = this.state.searchForm;
      let searchParams = this.state.searchParams;
      let setOfBooksId = this.props.params.sourceSetOfBooksId!=":sourceSetOfBooksId"?this.props.params.sourceSetOfBooksId:this.props.company.setOfBooksId;
      searchForm[0].defaultValue = setOfBooksId;
      const options =[];
      res.data.map((item)=>{
        options.push({
          label:item.setOfBooksCode+" - "+item.setOfBooksName,
          value:String(item.id),
        })
      });
      searchForm[0].options = options;
      searchParams.setOfBooksId = this.props.company.setOfBooksId;
      this.setState({ searchForm, searchParams,setOfBooksId })
    })
  }

  getList() {
    this.setState({loading: true});
    let params = Object.assign({}, this.state.searchParams);
    params.setOfBooksId = this.state.setOfBooksId;
    params.sourceTransactionCode = this.state.searchParams.sourceTransactionCode ? this.state.searchParams.sourceTransactionCode : "";
    params.page = this.state.page;
    params.size = this.state.pageSize;
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    accountingService.getSourceTransactionSob(params).then((response) => {
      response.data.map((item, index) => {
        item.index = this.state.page * this.state.pageSize + index + 1;
        item.key = item.index;
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
    });
  }

  handleSearch = (result) => {
    let searchParams = {
      sourceTransactionCode: result.sourceTransactionCode,
      description: result.description,
    }

    this.setState({
      searchParams: searchParams,
      loading: true,
      page: 0,
      current: 1
    }, () => {
      this.getList();
    })

  };

  //修改来源事务，是否启用
  onChangeEnabled = (e, record) => {
    this.setState({loading: true});
    let data = [];
    record.enabled = e.target.checked;
    data.push(record);
    accountingService.upSourceTransactionSob(data).then(() => {
      message.success(`${formatMessage({id: 'common.operate.success'})}`);
      this.setState({loading: false}, () => {
        this.getList();
      })
    }).catch((e) => {
      this.setState({loading: false});
      message.error(e.response.data.message);
      this.getList();
    })
  };

  //是否自动过账
  onChangeEnabledGlInterfaceFlag = (e, record) => {
    this.setState({loading: true});
    let data = [];
    record.glInterfaceFlag = e.target.checked
    data.push(record);
    accountingService.upSourceTransactionSob(data).then(() => {
      message.success(`${formatMessage({id: 'common.operate.success'})}`);
      this.setState({loading: false}, () => {
        this.getList();
      })
    }).catch((e) => {
      this.setState({loading: false}, () => {
        this.getList();
      })
      message.error(e.response.data.message);
    })
  }

  handleCreate = () => {
    this.setState({lovVisible: true})
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

  //添加来源事务
  handleListOk = (value) => {
    let data = value.result;
    let valueData = [];
    if (data.length > 0) {
      data.map((item) => {
        valueData.push({
          "sourceTransactionId": item.id,
          "glInterfaceFlag": false
        })
      })
    }
    this.setState({loading: true});
    accountingService.addSourceTransactionSob(this.state.setOfBooksId, valueData).then(() => {
      message.success(`${formatMessage({id: 'common.operate.success'})}`);
      this.setState({loading: false, lovVisible: false}, () => {
        this.getList();
      })

    }).catch((e) => {
      message.error(e.response.data.message)
      this.setState({loading: false});
    })
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, () => {
      this.getList();
    })
  };

  //选择账套变化的时候，添加的数据的账套也变化,
  handleSetOfBookChang = (event, value) => {
    if (event == "setOfBook") {
      this.setState({
        setOfBooksId: value,
      }, () => {
        this.getList();
      })
    }
  }

  render() {
    const {loading, data, columns, searchForm, pagination, lovVisible, lov, dataVisible} = this.state;
    return (
      <div className="accounting-source">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch} eventHandle={this.handleSetOfBookChang}/>
        <div className="table-header">
          <div
            className="table-header-title">{formatMessage({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.add'})}</Button> {/*添加*/}
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
        <ListSelector
          visible={lovVisible}
          onOk={this.handleListOk}
          selectorItem={lov}
          extraParams={{setOfBooksId: this.state.setOfBooksId, enabled: true}}
          onCancel={() => this.setState({lovVisible: false})}/>
      </div>
    )
  }
}


AccountingSource.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    tenantMode: state.main.tenantMode,
    user: state.login.user,
    company: state.login.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingSource);
