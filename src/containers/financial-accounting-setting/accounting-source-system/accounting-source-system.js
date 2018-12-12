/**
 * created by jsq on 2017/12/22
 */
import React from 'react'
import {connect} from 'dva'
import {Button,  message, Checkbox} from 'antd'
import Table from 'widget/table'
import SlideFrame from 'widget/slide-frame'
import DataStructure from 'containers/financial-accounting-setting/accounting-source-system/data-structure'
import SearchArea from 'widget/search-area';
import ListSelector from 'widget/list-selector'
import  accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import 'styles/financial-accounting-setting/accounting-source-system/accounting-source-system.scss'
import { routerRedux } from 'dva/router';

class AccountingSourceSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataVisible: false,
      data: [],
      lov: {
        visible: false
      },
      pagination: {
        current: 1,
        page: 0,
        total:0,
        pageSize:10,
        showSizeChanger:true,
        showQuickJumper:true,
      },
      searchParams: {
        sourceTransactionCode: "",
        description: "",
      },
      searchForm: [
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
        /*是否启用*/
        {
          title: this.$t({id: "common.column.status"}),
          key: 'enabled',dataIndex: 'description',
          width: '10%',
          render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeEnabled(e, record)}
                                                   checked={record.enabled}/>
        },
        {
          title: this.$t({id: "common.operation"}),
          key: 'operation',
          width: '25%',
          render: (text, record, index) => (
            <span>
            <a onClick={(e) => this.handleLinkDataStructure(e, record, index)}>{this.$t({id: "accounting.source.data.setting"})}</a> {/*数据结构设置*/}
              <span className="ant-divider"/>
            <a onClick={(e) => this.handleLinkTemplate(e, record, index)}>{this.$t({id: "accounting.source.template"})}</a> {/*凭证模板设置*/}
          </span>)
        },
      ],
    };
  }


  handleLinkDataStructure = (e, record, index) => {
    let lov = this.state.lov;
    lov.params = record;
    this.setState({lov}, () => {
      this.setState({dataVisible: true,})
    })

  };

  handleLinkTemplate = (e, record, index) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/financial-accounting-setting/accounting-source-system/voucher-template/:id/:sourceTransactionType'
        .replace(':id', record.id).replace(':sourceTransactionType', record.sourceTransactionCode)
      })
    );
  };

  componentWillMount() {
    this.getList();
  }

  getList() {
    this.setState({loading: true});
    let params = Object.assign({}, this.state.searchParams);
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.size = this.state.pageSize;
    accountingService.getSourceTransaction(params).then((response) => {
      response.data.map((item, index) => {
        item.key = item.id;
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination
      })
    }).catch(e => {
      message.error(`${e.response.data.message}`);
      this.setState({
        loading: false,
      })

    });
  }

  //分页点击
  onChangePager = (pagination,filters, sorter) =>{
    let temp = this.state.pagination;
    temp.page = pagination.current-1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, ()=>{
      this.getList();
    })
  };


  handleSearch = (result) => {
    let searchParams = {
      sourceTransactionCode: result.sourceTransactionCode,
      description: result.description,
    };

    this.setState({
      searchParams: searchParams,
      loading: true,
      page: 0,
      current: 1
    }, () => {
      this.getList();
    })

  };

  handleCreate = () => {
    let showListSelector = true;
    this.setState({
      showListSelector
    })
  };

  //点击确定后，添加来源事务
  handleAdd = (value) => {
    let data = value.result;
    let dataValue = [];
    if (data.length > 0) {
      data.map((item) => {
        dataValue.push({
          enabled: true,
          sourceTransactionCode: item.code,
          description: item.name,
        })
      })
    }
    this.setState({loading: true});
    accountingService.addSourceTransaction(dataValue).then(() => {
      this.setState({showListSelector: false, loading: false}, () => {
        this.getList()
      })

    }).catch((e) => {
      message.error(e.response.data.message);
      this.setState({loading: false});
    })
  };

  //修改来源事务，是否启用
  onChangeEnabled = (e, record) => {
    this.setState({loading: true});
    let data = {
      versionNumber: record.versionNumber,
      id: record.id,
      enabled: e.target.checked
    };
    accountingService.upSourceTransaction(data).then(() => {
      this.getList()
    }).catch((e) => {
      this.setState({loading: false});
      message.error(e.response.data.message);
    })
  };

  //取消添加来源事务

  handleCancel = () => {
    this.setState({showListSelector: false})
  };

  render() {
    const {loading, data, columns, searchForm, pagination, lov, dataVisible, showListSelector} = this.state;
    return (
      <div className="accounting-source">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div
            className="table-header-title">{this.$t({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{this.$t({id: 'common.add'})}</Button> {/*新 建*/}
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
        <SlideFrame title={this.$t({id: "data.structure"})}
                    show={dataVisible}
                    onClose={() => this.setState({dataVisible: false})}>
          <DataStructure
            onClose={(value) => {this.setState({dataVisible: false})}}
            params={lov.params}/>
        </SlideFrame>
        <ListSelector visible={showListSelector}
                      onOk={this.handleAdd}
                      onCancel={this.handleCancel}
                      type="sys_sourceTransaction"
                      extraParams={{}}/>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    company: state.user.company,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(AccountingSourceSystem);
