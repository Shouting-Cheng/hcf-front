import React from 'react'
import {connect} from 'react-redux'


import {Table, Form, Select, Button, Icon, message, Popconfirm} from 'antd'

const FormItem = Form.Item;
const Option = Select.Option;

import {messages} from "share/common";
import ListSelector from 'components/list-selector'
import BasicInfo from 'components/basic-info'

import menuRoute from 'routes/menuRoute'
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
        {title: messages('budget.itemCode')/*"预算项目代码",*/, dataIndex: "itemCode", width: '25%'},
        {title: messages('budget.itemName')/*"预算项目名称",*/, dataIndex: "itemName", width: '35%'},
        {title: messages('budget.itemType') /*预算项目类型*/, dataIndex: "itemTypeName", width: '25%'},
        {
          title: messages('common.operation')/*操作*/, key: 'operation', width: '15%', render: (text, record) => (
            <Popconfirm onConfirm={(e) => this.deleteItem(e, record)}
                        title={messages('common.confirm.delete.filed', {name: record.itemName})}>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}>{messages('common.delete')/*删除*/}</a>
            </Popconfirm>)
        }
      ],
      infoList: [
        {
          type: 'input',
          label: messages('budget.organization')/*预算组织*/,
          id: 'organizationName',
          message: messages('common.please.enter')/*请输入*/,
          disabled: true,
          isRequired: true
        },
        {
          type: 'input',
          label: messages('budgetGroup.code')/*'预算项目组代码'*/,
          id: 'itemGroupCode',
          message: messages('common.please.enter')/*请输入*/,
          disabled: true,
          isRequired: true
        },
        {
          type: 'input',
          label: messages('budgetGroup.name')/*'预算项目组名称'*/,
          id: 'itemGroupName',
          message: messages('common.please.enter')/*请输入*/,
          isRequired: true
        },
        {type: 'switch', label: messages('common.column.status')/*状态*/, id: 'enabled'}
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
      budgetOrganization: menuRoute.getRouteItem('budget-organization-detail', 'key')  //预算组织详情的页面项
    };
  }

  componentWillMount() {
    budgetGroupService.getOrganizationGroupById(this.props.params.groupId).then(response => {
      response.data.organizationName = this.props.organization.organizationName;
      this.setState({groupData: response.data});
    });
    this.getList();
    let selectorItem = chooserData['budget_item_filter'];
    selectorItem.url = `${config.budgetUrl}/api/budget/groupDetail/${this.props.params.groupId}/query/filter`;
    budgetGroupService.filterItemByGroupIdAndOrganizationId(this.props.params.groupId, this.props.organization.id).then(response => {
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
      message.success(messages("wait.for.save.modifySuccess")/*修改成功*/);
      response.data.organizationName = this.props.organization.organizationName;
      this.setState({
        editing: false,
        groupData: response.data,
        updateState: true
      });
    }).catch(e => {
      if (e.response) {
        message.error(`${messages("wait.for.save.modifyFail")/*修改失败*/}, ${e.response.data.message}`);
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
    return budgetGroupService.getItemByGroupId(this.props.params.groupId, page, pageSize).then(response => {
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
      budgetGroupService.deleteItemFromGroup(this.props.params.groupId, record.id).then(response => {
        message.success(messages('common.delete.success', {name: ""})/*删除成功*/);
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
      budgetGroupService.batchDeleteItemFromGroup(this.props.params.groupId, paramList).then(response => {
        message.success(messages('common.delete.success', {name: ""})/*删除成功*/);
        this.getList();
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
        item.itemGroupId = this.props.params.groupId;
        item.itemId = item.id;
        delete item.id;
      });
      budgetGroupService.batchAddItemToGroup(this.props.params.groupId, result.result).then(response => {
        message.success(messages('itinerary.remark.add.success')/*'添加成功'*/);
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
          <div className="table-header-title"> {messages('common.total1',{total:pagination.total})}{/*共 {pagination.total} 条数据*/}</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew} loading={saving}>{messages('common.add')}{/*添 加*/}</Button>
            <Button onClick={this.handleBatchDelete} disabled={selectedData.length === 0}>{messages('common.delete')/*删除*/}</Button>
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
          this.context.router.push(this.state.budgetOrganization.url.replace(":id", this.props.organization.id).replace(":setOfBooksId",this.props.params.setOfBooksId) + '?tab=GROUP');
        }}>
          <Icon type="rollback" style={{marginRight: '5px'}}/>{messages('common.back')/*返回*/}
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

BudgetGroupDetail.contextTypes = {
  router: React.PropTypes.object
};

const WrappedBudgetGroupDetail = Form.create()(BudgetGroupDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(WrappedBudgetGroupDetail);
