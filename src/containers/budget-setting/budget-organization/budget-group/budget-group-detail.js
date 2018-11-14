import React from 'react'
import {connect} from 'dva'


import {Table, Form, Select, Button, Icon, message, Popconfirm} from 'antd'

const FormItem = Form.Item;
const Option = Select.Option;
import { routerRedux } from 'dva/router';
import ListSelector from 'widget/list-selector'
import BasicInfo from 'widget/basic-info'

import config from 'config'
import budgetGroupService from 'containers/budget-setting/budget-organization/budget-group/budget-group.service'

import chooserData from 'share/chooserData'

class BudgetGroupDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updateState: false,
      loading: true,
      saving: false,
      groupData: {},
      columns: [
        {title: this.$t('budget.itemCode')/*"预算项目代码",*/, dataIndex: "itemCode", width: '25%'},
        {title: this.$t('budget.itemName')/*"预算项目名称",*/, dataIndex: "itemName", width: '35%'},
        {title: this.$t('budget.itemType') /*预算项目类型*/, dataIndex: "itemTypeName", width: '25%'},
        {
          title: this.$t('common.operation')/*操作*/, key: 'operation', width: '15%', render: (text, record) => (
            <Popconfirm onConfirm={(e) => this.deleteItem(e, record)}
                        title={this.$t('common.confirm.delete.filed', {name: record.itemName})}>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}>{this.$t('common.delete')/*删除*/}</a>
            </Popconfirm>)
        }
      ],
      infoList: [
        {
          type: 'input',
          label: this.$t('budget.organization')/*预算组织*/,
          id: 'organizationName',
          message: this.$t('common.please.enter')/*请输入*/,
          disabled: true,
          isRequired: true
        },
        {
          type: 'input',
          label: this.$t('budgetGroup.code')/*'预算项目组代码'*/,
          id: 'itemGroupCode',
          message: this.$t('common.please.enter')/*请输入*/,
          disabled: true,
          isRequired: true
        },
        {
          type: 'input',
          label: this.$t('budgetGroup.name')/*'预算项目组名称'*/,
          id: 'itemGroupName',
          message: this.$t('common.please.enter')/*请输入*/,
          isRequired: true
        },
        {type: 'switch', label: this.$t('common.column.status')/*状态*/, id: 'enabled'}
      ],
      data: [],
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      showListSelector: false,
      newData: [],
      extraParams: {organizationId: this.props.organization.id, enabled: true},
      selectedData: [],
      selectorItem: {},
      rowSelection: {
        selectedRowKeys: [],
        onChange: this.onSelectChange,
        onSelect: this.onSelectItem,
        onSelectAll: this.onSelectAll
      },
      editing: false,
    };
  }

  componentWillMount() {
    budgetGroupService.getOrganizationGroupById(this.props.match.params.id).then(response => {
      response.data.organizationName = this.props.organization.organizationName;
      this.setState({groupData: response.data});
    });
    this.getList();
    let selectorItem = chooserData['budget_item_filter'];
    selectorItem.url = `${config.budgetUrl}/api/budget/groupDetail/${this.props.match.params.id}/query/filter`;
    budgetGroupService.filterItemByGroupIdAndOrganizationId(this.props.match.params.id, this.props.organization.id).then(response => {
      let result = [];
      response.data.map((item) => {
        result.push({
          label: `${item.itemCode}(${item.itemName})`,
          value: item.itemCode
        })
      });
      selectorItem.searchForm[2].options = result;
      selectorItem.searchForm[3].options = result;
      this.setState({selectorItem})
    });
  }

  updateHandleInfo = (params) => {
    this.setState({editing: true});
    budgetGroupService.updateOrganizationGroup(Object.assign({}, this.state.groupData, params)).then(response => {
      message.success(this.$t("wait.for.save.modifySuccess")/*修改成功*/);
      response.data.organizationName = this.props.organization.organizationName;
      this.setState({
        editing: false,
        groupData: response.data,
        updateState: true
      });
    }).catch(e => {
      if (e.response) {
        message.error(`${this.$t("wait.for.save.modifyFail")/*修改失败*/}, ${e.response.data.message}`);
      }
      this.setState({
        editing: false,
        updateState: false
      })
    });
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList(this.state.nowStatus);
      })
  };

  /**
   * 根据selectedData刷新当页selection
   */
  refreshSelected() {
    let {selectedData, data, rowSelection} = this.state;
    let nowSelectedRowKeys = [];
    selectedData.map(selected => {
      data.map(item => {
        if (item.id === selected.id)
          nowSelectedRowKeys.push(item.id)
      })
    });
    rowSelection.selectedRowKeys = nowSelectedRowKeys;
    this.setState({rowSelection});
  };

  //选项改变时的回调，重置selection
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let {rowSelection} = this.state;
    rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({rowSelection});
  };

  /**
   * 选择单个时的方法，遍历selectedData，根据是否选中进行插入或删除操作
   * @param record 被改变的项
   * @param selected 是否选中
   */
  onSelectItem = (record, selected) => {
    let {selectedData} = this.state;
    if (!selected) {
      selectedData.map((selected, index) => {
        if (selected.id === record.id) {
          selectedData.splice(index, 1);
        }
      })
    } else {
      selectedData.push(record);
    }
    this.setState({selectedData});
  };

  //选择当页全部时的判断
  onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.map(changeRow => this.onSelectItem(changeRow, selected));
  };

  getList = () => {
    const {page, pageSize} = this.state;
    return budgetGroupService.getItemByGroupId(this.props.match.params.id, page, pageSize).then(response => {
      response.data.map((item) => {
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      }, () => {
        this.refreshSelected();  //刷新当页选择器
      })
    })
  };

  deleteItem = (text, record) => {
    this.setState({loading: true}, () => {
      budgetGroupService.deleteItemFromGroup(this.props.match.params.id, record.id).then(response => {
        message.success(this.$t('common.delete.success', {name: ""})/*删除成功*/);
        this.getList();
      })
    })
  };

  handleBatchDelete = () => {
    let paramList = [];
    this.state.selectedData.map(item => {
      paramList.push(item.id);
    });
    this.setState({loading: true}, () => {
      budgetGroupService.batchDeleteItemFromGroup(this.props.match.params.id, paramList).then(response => {
        message.success(this.$t('common.delete.success', {name: ""})/*删除成功*/);
        this.setState({
          selectedData: []
        },()=>this.getList())
      })
    })
  };

  handleNew = () => {
    this.setState({showListSelector: true, saving: true})
  };

  handleAdd = (result) => {
    this.setState({showListSelector: false});
    if (result.result.length > 0) {
      result.result.map(item => {
        item.itemGroupId = this.props.match.params.id;
        item.itemId = item.id;
        delete item.id;
      });
      budgetGroupService.batchAddItemToGroup(this.props.match.params.id, result.result).then(response => {
        message.success(this.$t('itinerary.remark.add.success')/*'添加成功'*/);
        this.setState({
          page: 0,
          saving: false
        }, () => {
          this.getList();
        })
      });
    } else {
      this.setState({saving: false})
    }
  };

  handleCancel = () => {
    this.setState({showListSelector: false, saving: false})
  };

  render() {
    const {pagination, saving, showListSelector, extraParams, loading, newData, data, rowSelection, columns, selectedData, infoList, groupData, updateState, selectorItem, editing} = this.state;
    return (
      <div>
        <BasicInfo infoList={infoList}
                   infoData={groupData}
                   updateHandle={this.updateHandleInfo}
                   updateState={updateState}
                   loading={editing}/>
        <div className="table-header">
          <div className="table-header-title"> {this.$t('common.total1',{total:pagination.total})}{/*共 {pagination.total} 条数据*/}</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew} loading={saving}>{this.$t('common.add')}{/*添 加*/}</Button>
            <Button onClick={this.handleBatchDelete} disabled={selectedData.length === 0}>{this.$t('common.delete')/*删除*/}</Button>
          </div>
        </div>
        <Table columns={columns}
               dataSource={newData.concat(data)}
               pagination={pagination}
               loading={loading}
               bordered
               size="middle"
               rowSelection={rowSelection}/>

        <a className="back" onClick={() => {
          this.props.dispatch(
            routerRedux.push({
              pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
                .replace(':id', this.props.match.params.orgId)
                .replace(":setOfBooksId",this.props.match.params.setOfBooksId)
                .replace(':tab','GROUP')
            })
          );
        }}>
          <Icon type="rollback" style={{marginRight: '5px'}}/>{this.$t('common.back')/*返回*/}
        </a>

        <ListSelector visible={showListSelector}
                      onOk={this.handleAdd}
                      onCancel={this.handleCancel}
                      type='budget_item_filter'
                      extraParams={extraParams}
                      selectorItem={selectorItem}/>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

const WrappedBudgetGroupDetail = Form.create()(BudgetGroupDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedBudgetGroupDetail);
