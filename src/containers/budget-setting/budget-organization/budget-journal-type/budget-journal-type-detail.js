import React from 'react'
import { connect } from 'dva'

import { Tabs, Button, message, Icon, Checkbox, Badge } from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;

import httpFetch from 'share/httpFetch'
import config from 'config'

import selectorData from 'share/chooserData'
import ListSelector from 'widget/list-selector'
import BasicInfo from 'widget/basic-info'
import { routerRedux } from 'dva/router';

class BudgetJournalTypeDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updateState: false,
      saving: false,
      loading: true,
      editing: false,
      infoList: [
        { type: 'input', label: '预算日记账类型代码', id: 'journalTypeCode', message: '请输入', disabled: true },
        { type: 'input', label: '预算日记账类型名称', id: 'journalTypeName', message: '请输入', isRequired: true },
        { type: 'value_list', labelKey: 'formName', valueKey: 'formOid', label: '预算业务类型', bgt: true, id: 'businessType', message: '请选择', options: [], valueListCode: 2018, isRequired: true },
        { type: 'select', label: '关联表单', bgt: true, id: 'form0id', message: '请选择', options: [], labelKey: 'formName', valueKey: 'formOid' },
        { type: 'switch', label: '状态', id: 'enabled' },
      ],
      tabs: [
        { key: 'STRUCTURE', name: '预算表' },
        { key: 'ITEM', name: '预算项目' },
        { key: 'COMPANY', name: '公司分配' }
      ],
      typeData: {},
      data: [],
      tabsData: {
        STRUCTURE: {
          saveUrl: `${config.budgetUrl}/api/budget/journal/type/assign/structures/batch`,
          url: `${config.budgetUrl}/api/budget/journal/type/assign/structures/query`,
          selectorItem: selectorData['budget_journal_structure'],
          extraParams: { organizationId: this.props.organization.id, journalTypeId: this.props.match.params.id },
          columns: [
            { title: "预算表代码", dataIndex: "structureCode", width: '40%' },
            { title: "预算表", dataIndex: "structureName", width: '30%' },
            { title: "默认", dataIndex: "defaultFlag", width: '15%', render: (defaultFlag, record) => <Checkbox onChange={(e) => this.onChangeDefault(e, record)} checked={record.defaultFlag} /> },
            { title: '启用', key: 'enabled', width: '15%', render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeStructureEnabled(e, record)} checked={record.enabled} /> }
          ]
        },
        ITEM: {
          saveUrl: `${config.budgetUrl}/api/budget/journal/type/assign/items/batch`,
          url: `${config.budgetUrl}/api/budget/journal/type/assign/items/query`,
          selectorItem: selectorData['budget_journal_item'],
          extraParams: { organizationId: this.props.organization.id, journalTypeId: this.props.match.params.id },
          columns:
            [
              { title: "预算项目代码", dataIndex: "itemCode", width: '30%' },
              { title: "预算项目名称", dataIndex: "itemName", width: '50%' },
              { title: '启用', key: 'enabled', width: '20%', render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeItemEnabled(e, record)} checked={record.enabled} /> }
            ]
        },
        COMPANY: {
          url: `${config.budgetUrl}/api/budget/journal/type/assign/companies/query`,
          saveUrl: `${config.budgetUrl}/api/budget/journal/type/assign/companies/batch`,
          selectorItem: selectorData['budget_journal_company'],
          extraParams: { journalTypeId: this.props.match.params.id },
          columns: [
            { title: "公司代码", dataIndex: "companyCode", width: '25%' },
            { title: "公司名称", dataIndex: "companyName", width: '30%' },
            { title: "公司类型", dataIndex: "companyTypeName", width: '25%' },
            {
              title: "启用", dataIndex: "enabled", width: '20%',
              render: (enabled, record) => <Checkbox onChange={(e) => this.onChangeCompanyEnabled(e, record)} checked={record.enabled} />
            },
          ]
        }
      },
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      nowStatus: 'STRUCTURE',
      showListSelector: false,
      newData: [],
    };
  }

  onChangeDefault = (e, record) => {
    this.setState({ loading: true });
    record.defaultFlag = e.target.checked;
    httpFetch.put(`${config.budgetUrl}/api/budget/journal/type/assign/structures`, record).then(() => {
      this.getList(this.state.nowStatus).then(() => {
        this.setState({ loading: false })
      });
    })
  };

  onChangeStructureEnabled = (e, record) => {
    this.setState({ loading: true });
    record.enabled = e.target.checked;
    httpFetch.put(`${config.budgetUrl}/api/budget/journal/type/assign/structures`, record).then(() => {
      this.getList(this.state.nowStatus).then(() => {
        this.setState({ loading: false })
      });
    })
  };

  onChangeItemEnabled = (e, record) => {
    this.setState({ loading: true });
    record.enabled = e.target.checked;
    httpFetch.put(`${config.budgetUrl}/api/budget/journal/type/assign/items`, record).then(() => {
      this.getList(this.state.nowStatus).then(() => {
        this.setState({ loading: false })
      });
    })
  };

  onChangeCompanyEnabled = (e, record) => {
    this.setState({ loading: true });
    record.enabled = e.target.checked;
    httpFetch.put(`${config.budgetUrl}/api/budget/journal/type/assign/companies`, record).then(() => {
      this.getList(this.state.nowStatus).then(() => {
        this.setState({ loading: false })
      });
    })
  };

  componentWillMount() {
    let setOfBooksId = this.props.setOfBooksId;
    if(!setOfBooksId){
      setOfBooksId = 0;
    }
    httpFetch.get(`${config.baseUrl}/api/custom/forms/setOfBooks/my/available/all?formTypeId=801002&setOfBooksId=${setOfBooksId}`).then(res => {
      let strategyGroup = [];
      res.data.map((item) => {
        let strategy = {
          id: item.formId,
          key: item.formName,
          label: item.formName,
          value: item.formOID,
          title: item.formName
        };
        strategyGroup.push(strategy)
      });
      let infoList = this.state.infoList;
      infoList[3].options = strategyGroup;
      this.setState({ infoList })
    })

    httpFetch.get(`${config.budgetUrl}/api/budget/journal/types/${this.props.match.params.id}`).then(response => {
      let data = response.data;
      data.businessType = { label: data.businessTypeName, value: data.businessType };
      data.form0id = data.form0id ? { label: data.formName, value: data.form0id } : "";
      // data.businessType = { label: data.businessTypeName, value: data.businessType };
      // data.form0id = { label: data.formName, value: data.form0id };
      let infoList = this.state.infoList;
      infoList[2].disabled = data.usedFlag;
      this.setState({ typeData: data, infoList });
    });
    this.getList(this.state.nowStatus);


    if (this.props.organization.id) {
      let tabsData = this.state.tabsData;
      tabsData['ITEM'].selectorItem.searchForm[2].getParams = tabsData['ITEM'].selectorItem.searchForm[3].getParams = { organizationId: this.props.organization.id };
      tabsData['STRUCTURE'].selectorItem.searchForm[2].getParams = tabsData['STRUCTURE'].selectorItem.searchForm[3].getParams = { organizationId: this.props.organization.id };
      this.setState({ tabsData });
    }
  }

  //渲染Tabs
  renderTabs() {
    return (
      this.state.tabs.map(tab => {
        return <TabPane tab={tab.name} key={tab.key} />
      })
    )
  }

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList(this.state.nowStatus);
      })
  };

  getList = (key) => {
    const { tabsData, page, pageSize } = this.state;
    let url = tabsData[key].url;
    if (url) {
      return httpFetch.get(`${url}?journalTypeId=${this.props.match.params.id}&page=${page}&size=${pageSize}`).then(response => {
        response.data.map((item, index) => {
          item.key = item.id ? item.id : index;
        });
        this.setState({
          data: response.data,
          loading: false,
          pagination: {
            total: Number(response.headers['x-total-count']),
            onChange: this.onChangePager,
            current: this.state.page + 1
          }
        })
      })
    }
  };

  onChangeTabs = (key) => {
    this.setState({
      nowStatus: key,
      loading: true,
      page: 0
    }, () => {
      this.getList(key);
    })
  };

  handleNew = () => {
    this.setState({ showListSelector: true })
  };

  handleAdd = (result) => {
    this.setState({
      newData: result.result,
      showListSelector: false
    }, () => {
      this.handleSave();
    })
  };

  handleCancel = () => {
    this.setState({ showListSelector: false })
  };

  handleSave = () => {
    const { tabsData, nowStatus, newData } = this.state;
    let paramList = [];
    newData.map(item => {
      if (nowStatus === 'STRUCTURE') {
        item.structureId = item.id;
        delete item.id;
      }
      if (nowStatus === 'ITEM') {
        item.bgtItemId = item.id;
        delete item.id;
      }
      if (nowStatus === 'COMPANY') {
        item = {
          companyId: item.id,
          companyCode: item.code,
          enabled: true
        };
      }
      item.journalTypeId = this.props.match.params.id;
      paramList.push(item);
    });
    this.setState({ saving: true }, () => {
      httpFetch.post(tabsData[nowStatus].saveUrl, paramList).then(response => {
        message.success('添加成功');
        this.setState({
          newData: [],
          page: 0,
          saving: false
        }, () => {
          this.getList(nowStatus);
        })
      })
    })
  };

  updateHandleInfo = (params) => {
    params.form0id = params.form0id || '';
    this.setState({ editing: true });
    httpFetch.put(`${config.budgetUrl}/api/budget/journal/types`, Object.assign({}, this.state.typeData, params)).then(response => {
      message.success(this.$t('common.update.success'));
      let data = response.data;
      data.businessType = { label: data.businessTypeName, value: data.businessType };
      //data.form0id = data.form0id ? { label: data.formName, value: data.form0id } : "";
      let infoList = this.state.infoList;
      infoList[2].disabled = data.usedFlag;
      this.setState({
        typeData: data,
        updateState: true,
        editing: false,
        infoList
      });
    }).catch(e => {
      this.setState({ editing: false })
    });
  };

  render() {
    const { infoList, typeData, tabsData, loading, pagination, nowStatus, data, showListSelector, saving, updateState, editing } = this.state;
    return (
      <div>
        <BasicInfo infoList={infoList}
          infoData={typeData}
          updateHandle={this.updateHandleInfo}
          updateState={updateState}
          loading={editing} />
        <Tabs onChange={this.onChangeTabs} style={{ marginTop: 20 }}>
          {this.renderTabs()}
        </Tabs>
        <div className="table-header">
          <div className="table-header-title">共搜索到 {pagination.total} 条数据</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew} loading={saving}>添 加</Button>
          </div>
        </div>
        <Table columns={tabsData[nowStatus].columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          bordered
          size="middle" />

        <a className="back" onClick={() => {
          this.props.dispatch(
            routerRedux.push({
              pathname: '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab'
                .replace(':id', this.props.match.params.orgId)
                .replace(":setOfBooksId",this.props.match.params.setOfBooksId)
                .replace(':tab','JOURNAL_TYPE')
            })
          );
        }}><
          Icon type="rollback" style={{ marginRight: '5px' }} />返回
        </a>

        <ListSelector visible={showListSelector}
          onOk={this.handleAdd}
          onCancel={this.handleCancel}
          selectorItem={tabsData[nowStatus].selectorItem}
          extraParams={tabsData[nowStatus].extraParams ? tabsData[nowStatus].extraParams : {}} />
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetJournalTypeDetail);
