/**
 * created by jsq on 2017/11/25
 */
import React from 'react'
import { connect } from 'dva'
import { Button, Select, Popover, Badge, message, Form, Spin, Popconfirm } from 'antd';
import Table from 'widget/table'
import SearchArea from 'widget/search-area';
import Chooser from 'widget/chooser'
import "styles/budget-setting/budget-organization/budget-item-map/budget-item-map.scss"
import budgetService from 'containers/budget-setting/budget-organization/budget-item-map/budget-item-map.service'
import config from 'config'
import selectorData from 'share/chooserData'
import ImporterNew from 'widget/Template/importer-new'
import httpFetch from 'share/httpFetch';
const FormItem = Form.Item;
const Option = Select.Option;

class BudgetItemMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      btnLoading: false,
      params: [],
      _data:[],
      isSave: true,
      paramsKey: 0,
      sourceType: [],
      showImportFrame: false,
      searchParams: {
        sourceType: "",
        itemId: "",
        orgId: this.props.id
      },
      itemSelectorItem:{},
      pagination: {
        current: 0,
        page: 0,
        total: 0,
        pageSize: 10,
      },
      paramValueMap: {},
      searchForm: [
        { type: 'select', options: [], id: 'sourceType', label: this.$t({ id: 'itemMap.sourceType' }) }, /*来源类别*/
        {
          type: 'select', id: 'itemId', options: [], labelKey: 'itemName', valueKey: 'id',
          label: this.$t({ id: 'itemMap.item' }),  /*预算项目*/
          listExtraParams: { organizationId: this.props.id },
          getUrl: `${config.budgetUrl}/api/budget/items/find/all`, method: 'get', getParams: { organizationId: this.props.id, enabled: true }
        },
      ],
      columns: [
        {          /*来源类别*/
          title: this.$t({ id: "itemMap.sourceType" }), key: "sourceType", dataIndex: 'sourceType', render: (text, record, index) => this.renderColumns(text, record, index, 'sourceType')
        },
        {          /*明细类型*/
          title: this.$t({ id: "itemMap.detailType" }), key: "sourceItemName", dataIndex: 'sourceItemName', render: (text, record, index) => this.renderColumns(text, record, index, 'detail')
        },
        {          /*预算项目*/
          title: this.$t({ id: "itemMap.item" }), key: "budgetItemName", dataIndex: 'budgetItemName', render: (text, record, index) => this.renderColumns(text, record, index, 'item')
        },                            //操作
        {
          title: this.$t({ id: "common.operation" }), key: 'operation', width: '15%', render: (text, record, index) => (
            <span>
              <a href="#" onClick={record.edit ? (e) => this.saveItem(e, record, index) : (e) => this.operateItem(e, record, index, true)}>{this.$t({ id: record.edit ? "common.save" : "common.edit" })}</a>
              {record.edit ?
                <a href="#" style={{ marginLeft: 12 }}
                   onClick={(e) => this.operateItem(e, record, index, false)} >{this.$t({ id: "common.cancel" })}</a>
                :
                <Popconfirm onConfirm={(e) => this.deleteItem(e, record, index)} title={this.$t({ id: "budget.are.you.sure.to.delete.rule" }, { controlRule: record.controlRuleName })}>{/* 你确定要删除organizationName吗 */}
                  <a href="#" style={{ marginLeft: 12 }}>{this.$t({ id: "common.delete" })}</a>
                </Popconfirm>
              }
            </span>)
        },
      ],
      selectedEntityOids: []    //已选择的列表项的Oids
    };
  }

  //保存
  saveItem = (e, record, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (record.sourceType !== "" && typeof record.budgetItemId !== 'undefined' && typeof record.sourceItemId !== 'undefined') {
      record.budgetOrganizationId = this.props.id;
      budgetService.insertOrUpdateItemMap([record]).then((response) => {
        message.success(`${this.$t({ id: "common.save.success" }, { name: "" })}`);

        let params = this.state.params;

        let flag = false;
        params.map((o, i) => {
          if (i != index && o.edit) {
            flag = true;
          }
        });

        if (!flag) {
          this.setState({
            loading: true,
            isSave: false,
            pagination: {
              ...this.state.pagination,
              pageSize: 10,
              current: 0,
              page: 0
            }
          }, this.getList);
        }
        else {
          response.data[0].edit = false;
          response.data[0].key = response.data[0].id;
          params[index] = {...response.data[0],detail: record.detail, item: record.item};
          this.setState({
            isSave: false,
            params
          })
        }
      }).catch((e) => {
        if (e.response) {
          message.error(`${this.$t({ id: "common.save.filed" })}, ${e.response.data.message}`)
        }
      })
    } else {
      message.warning(this.$t({ id: "item.errorMessage" }));
      return;
    }
  };

  operateItem = (e, record, index, flag) => {
    e.preventDefault();
    e.stopPropagation();
    let params = this.state.params;
    params[index].edit = flag;
    if (!flag) {
      if (typeof record.id === 'undefined') {
        params.delete(params[index]);
        let isSave = true;
        params.map(item => {
          if (item.edit)
            isSave = false
        });
        this.setState({
          params,
          isSave,
          pagination: {
            ...this.state.pagination,
            pageSize: this.state.pagination.pageSize - 1 >= 10 ? this.state.pagination.pageSize - 1 : 10,
            total: this.state.pagination.total - 1,
          }
        });
      }else {
        params[index] = {...this.state._data[index],edit: flag};
        this.setState({
          params,
          isSave: !flag
        });
      }
    } else {
      this.setState({
        params,
        isSave: !flag
      });
    }
  };

  //删除
  deleteItem = (e, record, index) => {
    e.preventDefault();
    e.stopPropagation();
    let param = [record.id];
    budgetService.deleteItemMap(param).then((response) => {
      message.success(`${this.$t({ id: "common.operate.success" })}`);
      let params = this.state.params;

      params.delete(params[index]);
      let isSave = true;
      params.map(item => {
        if (item.edit)
          isSave = false
      });
      this.setState({
        params,
        isSave,
        pagination: {
          ...this.state.pagination,
          page: (this.state.pagination.total - 1)%10===0 ? (this.state.pagination.total - 1)/10-1 : parseInt((this.state.pagination.total - 1)/10),
          //pageSize: this.state.pagination.pageSize - 1 >= 10 ? this.state.pagination.pageSize - 1 : 10,
          total: this.state.pagination.total - 1,
        }
      },()=>{
        this.getList();
      });
    }).catch((e) => {
      if (e.response) {
        message.error(`${this.$t({ id: "common.operate.filed" })},${e.response.data.message}`)
      }
    })
  };

  componentWillMount() {
    this.getList();
    let itemSelectorItem = selectorData['budget_item'];
    itemSelectorItem.searchForm[1].getUrl=itemSelectorItem.searchForm[1].getUrl.replace(':organizationId',this.props.id);
    itemSelectorItem.searchForm[2].getUrl=itemSelectorItem.searchForm[2].getUrl.replace(':organizationId',this.props.id);
    let paramValueMap = {
      title: this.$t({ id: "itemMap.expenseType" }),
      url: `${config.expenseUrl}/api/expense/types/${this.props.setOfBooksId}/query`,
      searchForm: [
        { type: 'input', id: 'name', label: this.$t({ id: "itemMap.expenseTypeName" }) },
      ],
      columns: [
        {
          title: this.$t({ id: "itemMap.icon" }), dataIndex: 'iconUrl',
          render: (value) => {
            return <img src={value} height="20" width="20" />
          }
        },
        { title: this.$t({ id: "itemMap.expenseTypeName" }), dataIndex: 'name' },
        {
          title: this.$t({ id: "common.column.status" }), dataIndex: 'enabled',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
                   text={enabled ? this.$t({ id: "common.status.enable" }) : this.$t({ id: "common.status.disable" })} />
          )
        },
      ],
      key: 'id'
    };
    this.setState({ paramValueMap });
    //获取来源类别值列表
    this.getSystemValueList(2027).then((response) => {
      let sourceType = [];
      response.data.values.map((item) => {
        let option = {
          value: item.code,
          label: item.messageKey
        };
        sourceType.push(option)
      });
      let searchForm = this.state.searchForm;
      searchForm[0].options = sourceType;
      this.setState({
        searchForm,
        sourceType,
        itemSelectorItem
      })
    });
  }

  //获取预算项目映射数据
  getList() {
    let params = Object.assign({}, this.state.searchParams);
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    this.setState({ loading: true });
    budgetService.getItemMapByOptions(params).then((response) => {
      let paramsKey = this.state.paramsKey;
      response.data.map((item, index) => {
        item.key = paramsKey++;
        item.edit = false;
        item.item = [{ id: item.budgetItemId, itemName: item.budgetItemName }];
        item.detail = [{ id: item.sourceItemId, name: item.sourceItemName }]
      });
      let pagination = this.state.pagination;
      pagination.total = Number(response.headers['x-total-count']);
      let _data = [];
      response.data.map(item=>_data.push({...item}));
      this.setState({
        pagination,
        loading: false,
        isSave: true,
        btnLoading: false,
        params: response.data,
        _data,
        paramsKey
      })
    })
  }

  handleSearch = (values) => {
    let searchParams = this.state.searchParams;
    searchParams.sourceType = values.sourceType === undefined ? "" : values.sourceType;
    searchParams.itemId = values.itemId === undefined ? "" : values.itemId;

    this.setState({
      searchParams,
      loading: true,
      pagination: {
        ...this.state.pagination,
        pageSize: 10
      }
    }, () => {
      this.getList()
    })
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = 10;
    this.setState({
      pagination: temp
    }, () => {
      this.getList();
    })
  };

  //控制是否弹出公司列表
  showListSelector = (flag) => {
    this.setState({
      companyListSelector: flag
    })
  };

  //修改来源类型
  handleChangeType = (value, index) => {
    let { params } = this.state;
    params[index].sourceType = value;
    params[index].detail = [];
    this.setState({ params });
  };

  //选择费用类型
  handleChangeExpenseType = (value, index) => {
    const { params } = this.state;
    params[index].detail = value;
    params[index].sourceItemId = value.length&&value[0].id;
    this.setState({ params })
  };

  //申请类型
  handleChangeAppType = () => { };

  //选择项目
  handleChangeItem = (value, index) => {
    let { params } = this.state;
    params[index].item = value;
    params[index].budgetItemId = value.length&&value[0].id;
    this.setState({ params });
  };

  renderColumns = (decode, record, index, dataIndex) => {
    const { paramValueMap, sourceType,itemSelectorItem } = this.state;
    if (record.edit) {
      switch (dataIndex) {
        case 'sourceType': {
          return (
            <Select placeholder={this.$t({ id: 'common.please.select' })}
                    onChange={(value) => this.handleChangeType(value, index)}
                    value={record.sourceType}
                    notFoundContent={<Spin size="small" />}>
              {sourceType.map((option) => {
                return <Option key={option.value}>{option.label}</Option>
              })}
            </Select>
          );
        }
        case 'detail': {
          let flag = record.sourceType ===  'EXPENSE_TYPE';
          paramValueMap.title = this.$t({ id: flag ? "itemMap.expenseType" : 'itemMap.applyType' });
          paramValueMap.columns[1].title = this.$t({ id: flag ? "expense.type.name" : 'application.type.management.name'});
          paramValueMap.searchForm[0].label = this.$t({ id: flag ? "expense.type.name" : 'application.type.management.name'});
          return (
            <Chooser
              onChange={(value) => this.handleChangeExpenseType(value, index)}
              labelKey='name'
              valueKey='id'
              itemMap={true}
              selectorItem={paramValueMap}
              listExtraParams={{typeFlag:  record.sourceType ===  'EXPENSE_TYPE' ? 1 : 0}}
              value={record.detail}
              single={true} />
          );
        }
        case 'item': {
          return (
            <Chooser
              onChange={(value) => this.handleChangeItem(value, index)}
              type='budget_item'
              labelKey='itemName'
              selectorItem={itemSelectorItem}
              valueKey='id'
              itemMap={true}
              listExtraParams={{ organizationId: this.props.id, enabled: true }}
              value={record.item}
              single={true} />)
        }
      }
    } else {
      switch (dataIndex) {
        case 'sourceType': return decode === "EXPENSE_TYPE" ? `${this.$t({ id: "itemMap.expenseType" })}` : `${this.$t({ id: "itemMap.applyType" })}`; break;
        case 'detail': return record.sourceItemName ? record.sourceItemName : '-'; break;
        case 'item': return record.budgetItemName; break
      }
    }
  };

  handleAdd = () => {
    let { params, paramsKey } = this.state;
    let newParams = { sourceType: '', detail: [], item: [], key: paramsKey++, edit: true };
    let array = [];
    array.push(newParams);
    let newArray = array.concat(params);
    this.setState({
      isSave: false, params: newArray, paramsKey,
    }, () => {
      this.setState({
        pagination: {
          ...this.state.pagination,
          pageSize: this.state.params.length >= 10 ? this.state.params.length : 10,
          //total: this.state.pagination.total + 1
        }
      })
    });
  };

  showImport = (flag) => {
    this.setState({ showImportFrame: flag })
  };

  //导入成功回调
  handleImportOk = (transactionID) => {
    httpFetch.post(`${config.budgetUrl}/api/budget/itemsMapping/import/new/confirm/${transactionID}`).then(res => {
      if (res.status === 200){
        this.getList()
      }
    }).catch(() => {
      message.error(this.$t('importer.import.error.info')/*导入失败，请重试*/)
    })
    this.showImport(false);
  };

  handleSave = () => {
    let params = this.state.params;
    let value = [];
    let flag = false;
    params.map(item => {
      if (item.edit) {

        if (!(item.sourceType !== '' && item.item.length > 0 && item.detail.length > 0)) {
          flag = true;
          return;
        }

        if (typeof item.id !== 'undefined' || (item.sourceType !== '' && item.item.length > 0 && item.detail.length > 0)) {
          item.budgetOrganizationId = this.props.id;
          value.push(item)
        }
      }
    });

    if (flag) {
      message.warning(this.$t({ id: "item.errorMessage" }));
      return;
    }

    budgetService.insertOrUpdateItemMap(value).then((response) => {
      message.success(`${this.$t({ id: "common.save.success" }, { name: "" })}`);
      this.setState({
        loading: true,
        btnLoading: true,
        pagination: {
          ...this.state.pagination,
          pageSize: 10,
          current: 0,
          page: 0
        }
      }, ()=>this.getList())
    }).catch((e) => {
      if (e.response) {
        message.error(`${this.$t({ id: "common.save.filed" })}, ${e.response.data.message}`)
      }
    })
  };

  render() {
    const { loading, searchForm, params, selectedRowKeys, pagination, columns, isSave, btnLoading, showImportFrame } = this.state;
    return (
      <div className="budget-item-map">
        <SearchArea searchForm={searchForm} submitHandle={this.handleSearch} />
        <div className="table-header">
          <div className="table-header-title">{this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}</div>  {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleAdd}>{this.$t({ id: 'common.add' })}</Button>  {/*添加*/}
            <Button type="primary" onClick={() => this.showImport(true)}>{this.$t({ id: 'importer.import' })}</Button>  {/*导入*/}
            <ImporterNew visible={showImportFrame}
                         title={this.$t({ id: "itemMap.itemUpload" })}
                         templateUrl={`${config.budgetUrl}/api/budget/itemsMapping/export/template`}
                         uploadUrl={`${config.budgetUrl}/api/budget/itemsMapping/import/new?orgId=${this.props.id}`}
                         errorUrl={`${config.budgetUrl}/api/budget/itemsMapping/import/new/error/export`}
                         errorDataQueryUrl={`${config.budgetUrl}/api/budget/itemsMapping/import/new/query/result`}
                         deleteDataUrl ={`${config.budgetUrl}/api/budget/itemsMapping/import/new/delete`}
                         fileName={this.$t({ id: "itemMap.itemUploadFile" })}
                         onOk={this.handleImportOk}
                         afterClose={() => this.showImport(false)} />
            <Button type="primary" loading={btnLoading} disabled={isSave} onClick={this.handleSave}>{this.$t({ id: 'common.save' })}</Button>  {/*保存*/}
          </div>
        </div>
        <Form
          className="ant-advanced-search-form">
          <Table
            dataSource={params}
            columns={columns}
            loading={loading}
            onChange={this.onChangePager}
            pagination={pagination}
            size="middle" />
        </Form>
      </div>
    )
  }

}


function mapStateToProps(state) {
  return {
    organization: state.budget.organization,
    company: state.user.company,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetItemMap);

