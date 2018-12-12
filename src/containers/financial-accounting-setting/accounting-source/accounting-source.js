/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import {connect} from 'dva'
import {Button, Checkbox, message} from 'antd'
import Table from 'widget/table'
import SearchArea from 'widget/search-area';
import ListSelector from 'widget/list-selector'
import config from 'config'
import accountingService from 'containers/financial-accounting-setting/accounting-source/accounting-source.service'
import 'styles/financial-accounting-setting/accounting-source/accounting-source.scss'
import { routerRedux } from 'dva/router';

class AccountingSource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      dataVisible: false,
      lovVisible: false,
      lov: {
        title: this.$t({id: "accounting.source.lovTitle"}),
        url: `${config.accountingUrl}/api/general/ledger/sob/source/transactions/query/filter`,
        searchForm: [],
        columns: [
          {title: this.$t({id: "accounting.source.code"}), dataIndex: 'sourceTransactionCode'},
          {title: this.$t({id: "accounting.source.name"}), dataIndex: 'description'},
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
        {type: 'select', id: 'setOfBooksId', label:this.$t({id: "paymentCompanySetting.setOfBooks"}), options: [], defaultValue: '', isRequired: true,
          labelKey: 'setOfBooksCode', valueKey: 'setOfBooksId',event:'setOfBook'
        },
        {                                                                        //来源事物代码
          type: 'input', id: 'sourceTransactionCode', label: this.$t({id: 'accounting.source.code'})
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'description', label: this.$t({id: 'accounting.source.name'})
        },
      ],
      columns: [
        {
          /*来源事物代码*/
          title: this.$t({id: "accounting.source.code"}),
          key: "sourceTransactionCode",
          dataIndex: 'sourceTransactionCode'
        },
        {
          /*来源事物名称*/
          title: this.$t({id: "accounting.source.name"}), key: "description", dataIndex: 'description'
        },
        {
          /*自动过账*/
          title: this.$t({id: "accounting.auto.checked"}),
          key: "glInterfaceFlag",
          dataIndex: 'glInterfaceFlag',
          width: '10%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabledGlInterfaceFlag(e, record)}
                                                   checked={record.glInterfaceFlag}/>
        },
        /*启用*/
        {
          title: this.$t({id: "common.column.status"}),
          key: 'enabled',
          width: '10%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)}
                                                   checked={record.enabled}/>
        },
        {
          title: this.$t({id: "accounting.source.setting"}),
          key: 'operation',
          width: '10%',
          render: (text, record, index) => (
            <span>
            <a
               onClick={(e) => this.handleLinkTemplate(e, record, index)}>{this.$t({id: "accounting.source.setOfBook.template"})}</a> {/*凭证模板*/}
          </span>)

        },
      ],
    };
  }


  handleLinkTemplate = (e, record, index) => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/financial-accounting-setting/accounting-source/voucher-template-sob/:id'
          .replace(':id', record.id)
      })
    );
  };

  componentWillMount() {
    this.getList();
    accountingService.getSetOfBooksByTenant().then((res) => {
      let searchForm = this.state.searchForm;
      let searchParams = this.state.searchParams;
      let setOfBooksId = this.props.match.params.sourceSetOfBooksId&&this.props.match.params.sourceSetOfBooksId!=":sourceSetOfBooksId"?this.props.match.params.sourceSetOfBooksId:this.props.company.setOfBooksId;
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
      message.success(`${this.$t({id: 'common.operate.success'})}`);
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
      message.success(`${this.$t({id: 'common.operate.success'})}`);
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
      message.success(`${this.$t({id: 'common.operate.success'})}`);
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
            className="table-header-title">{this.$t({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.add'})}</Button> {/*添加*/}
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

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingSource);
