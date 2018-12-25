import React from 'react';
import { connect } from 'dva';

import companyGroupService from 'containers/setting/company-group/company-group.service';
import config from 'config';

import { Form, Button, Select, Popover, Input, Switch, Icon, Popconfirm, Tabs,  message, } from 'antd';
import Table from 'widget/table'

import ListSelector from 'components/Widget/list-selector';
import BasicInfo from 'components/Widget/basic-info';
import 'styles/setting/company-group/company-group-detail.scss';

import { routerRedux } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

class CompanyGroupDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      buttonLoading: false,
      batchCompany: true,
      companyListSelector: false, //控制公司选则弹框
      companyGroup: {},
      data: [],
      edit: false,
      lov: {
        type: 'company',
        visible: false,
        listSelectedData: {},
      },
      selectedRowKeys: [],
      selectedEntityOids: [], //已选择的列表项的Oids
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      infoList: [
        {
          type: 'input',
          id: 'companyGroupCode',
          isRequired: true,
          disabled: true,
          label: this.$t({ id: 'setting.companyGroupCode' }) + ' :',
        },
        {
          type: 'input',
          id: 'companyGroupName',
          isRequired: true,
          label: this.$t({ id: 'setting.companyGroupName' }) + ' :',
        },
        {
          type: 'select',
          id: 'setOfBooksId',
          label: this.$t({ id: 'setting.set.of.book' }) + ' :',
          options: [],
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          labelKey: 'setOfBooksName',
          valueKey: 'id',
          // getParams: { roleType: 'TENANT' },
        },
        {
          type: 'switch',
          id: 'enabled',
          label: this.$t({ id: 'common.column.status' }) + ' :' /*状态*/,
        },
      ],
      columns: [
        {
          title: this.$t({ id: 'structure.companyCode' }),
          key: 'companyCode',
          dataIndex: 'companyCode',
        } /*公司代码*/,
        {
          title: this.$t({ id: 'structure.companyName' }),
          key: 'companyName',
          dataIndex: 'companyName' /*公司明称*/,
          render: record => (
            <span>{record ? <Popover content={record}>{record} </Popover> : '-'} </span>
          ),
        },
        {
          title: this.$t({ id: 'structure.companyType' }),
          key: 'companyTypeName',
          dataIndex: 'companyTypeName' /*公司类型*/,
          render: record => (
            <span>{record ? <Popover content={record}>{record} </Popover> : '-'} </span>
          ),
        },
        {
          title: this.$t({ id: 'common.operation' }),
          key: 'operation',
          width: '15%',
          render: (text, record) => (
            <span>
              <Popconfirm
                onConfirm={e => this.deleteItem(e, record)}
                title={this.$t(
                  { id: 'budget.are.you.sure.to.delete.rule' },
                  { controlRule: record.controlRuleName }
                )}
              >
                {/* 你确定要删除organizationName吗 */}
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {this.$t({ id: 'common.delete' })}
                </a>
              </Popconfirm>
            </span>
          ),
        }, //操作
      ],
      selectorItem: {
        title: this.$t({ id: 'chooser.data.company' } /*选择公司*/),
        url: `${config.baseUrl}/api/company/by/condition`,
        searchForm: [
          {
            type: 'input',
            id: 'companyCode',
            label: this.$t({ id: 'chooser.data.companyCode' } /*公司代码*/),
          },
          {
            type: 'input',
            id: 'name',
            label: this.$t({ id: 'chooser.data.companyName' } /*公司名称*/),
          },
          {
            type: 'input',
            id: 'companyCodeFrom',
            label: this.$t({ id: 'chooser.data.companyCode.from' } /*公司代码从*/),
          },
          {
            type: 'input',
            id: 'companyCodeTo',
            label: this.$t({ id: 'chooser.data.companyCode.to' } /*公司代码至*/),
          },
        ],
        columns: [
          {
            title: this.$t({ id: 'chooser.data.companyCode' } /*公司代码*/),
            dataIndex: 'companyCode',
          },
          { title: this.$t({ id: 'chooser.data.companyName' } /*公司名称*/), dataIndex: 'name' },
          {
            title: this.$t({ id: 'chooser.data.companyType' } /*公司类型*/),
            dataIndex: 'companyTypeName',
          },
        ],
        key: 'companyOid',
      },
    };
  }

  deleteItem = (e, record) => {
    this.setState({ loading: true });
    let param = [];
    typeof record === 'undefined' ? (param = this.state.selectedEntityOids) : param.push(record.id);
    companyGroupService
      .deleteCompany(param)
      .then(response => {
        message.success(
          this.$t(
            { id: 'common.delete.success' },
            { name: typeof record === 'undefined' ? '' : record.companyName }
          )
        ); // name删除成功
        this.setState(
          {
            selectedRowKeys: [],
            selectedEntityOids: [],
            batchCompany: true

          },
          this.getList
        );
      })
      .catch(e => {
        if (e.response) {
          message.error(`${this.$t({ id: 'common.operate.filed' })},${e.response.data.message}`);
        }
      });
  };

  componentWillMount() {
    //根据路径上的id,查出该条完整数据
    companyGroupService.getCompanyGroupById(this.props.match.params.id).then(response => {
      if (response.status === 200) {
        response.data.setOfBooksId = {
          label: response.data.setOfBooksName,
          value: response.data.setOfBooksId,
        };
      }
      this.setState(
        {
          companyGroup: response.data,
        },
        this.getList
      );
    });
  }

  //保存所做的详情修改
  handleUpdate = value => {
    value.id = this.props.match.params.id;
    companyGroupService.updateCompanyGroup(value).then(response => {
      if (response) {
        message.success(this.$t({ id: 'structure.saveSuccess' })); /*保存成功！*/
        response.data.setOfBooksId = {
          label: response.data.setOfBooksName,
          value: response.data.setOfBooksId,
        };
        this.setState({
          companyGroup: response.data,
          edit: true,
        });
      }
    });
  };

  //查询公司组子公司
  getList() {
    companyGroupService
      .getCompanies({ companyGroupId: this.props.match.params.id })
      .then(response => {
        response.data.map(item => {
          item.key = item.id;
        });
        let pagination = this.state.pagination;
        pagination.total = Number(response.headers['x-total-count']);
        if (response.status === 200) {
          this.setState({
            pagination,
            loading: false,
            data: response.data,
          });
        }
      });
  }

  //控制是否编辑
  handleEdit = flag => {
    this.setState({ edit: flag });
  };

  //控制是否弹出公司列表
  showListSelector = flag => {
    let lov = this.state.lov;
    lov.visible = flag;
    this.setState({
      lov,
    });
  };

  handleBack = () => {
    // this.context.router.push(menuRoute.getMenuItemByAttr('company-group', 'key').url);
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/company-group`,
      })
    );
  };

  //列表选择更改
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  //选择一行
  //选择逻辑：每一项设置selected属性，如果为true则为选中
  //同时维护selectedEntityOids列表，记录已选择的Oid，并每次分页、选择的时候根据该列表来刷新选择项
  onSelectRow = (record, selected) => {
    let temp = this.state.selectedEntityOids;
    if (selected) temp.push(record.id);
    else temp.delete(record.id);
    this.setState({
      selectedEntityOids: temp,
      batchCompany: temp.length > 0 ? false : true,
    });
  };

  //全选
  onSelectAllRow = selected => {
    let temp = this.state.selectedEntityOids;
    if (selected) {
      this.state.data.map(item => {
        temp.addIfNotExist(item.id);
      });
    } else {
      this.state.data.map(item => {
        temp.delete(item.id);
      });
    }
    this.setState({
      selectedEntityOids: temp,
      batchCompany: temp.length > 0 ? false : true,
    });
  };

  //换页后根据Oids刷新选择框
  refreshRowSelection() {
    let selectedRowKeys = [];
    this.state.selectedEntityOids.map(selectedEntityOid => {
      this.state.data.map((item, index) => {
        if (item.id === selectedEntityOid) selectedRowKeys.push(index);
      });
    });
    this.setState({ selectedRowKeys });
  }

  //清空选择框
  clearRowSelection() {
    this.setState({ selectedEntityOids: [], selectedRowKeys: [] });
  }

  //处理公司弹框点击ok,添加公司
  handleListOk = result => {
    let lov = this.state.lov;
    let param = [];
    result.result.map(item => {
      param.push({ companyGroupId: this.props.match.params.id, companyId: item.id });
    });
    companyGroupService.addCompanies(param).then(response => {
      if (response.status === 200) {
        lov.visible = false;
        this.setState(
          {
            loading: true,
            lov,
          },
          this.getList
        );
      }
    });
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: {
          current: pagination.current,
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
        },
      },
      () => {
        this.getList();
      }
    );
  };

  render() {
    const {
      edit,
      lov,
      pagination,
      companyGroup,
      columns,
      data,
      infoList,
      selectedRowKeys,
      batchCompany,
      selectorItem,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow,
    };

    return (
      <div style={{ paddingBottom: 20 }} className="budget-item-detail">
        <BasicInfo
          infoList={infoList}
          infoData={companyGroup}
          updateHandle={this.handleUpdate}
          updateState={edit}
          handleEdit={() =>
            // this.context.router.push(
            //   menuRoute
            //     .getRouteItem('new-company-group')
            //     .url.replace(':companyGroupId', this.props.match.params.id)
            // )
            this.props.dispatch(
              routerRedux.push({
                pathname: `/admin-setting/company-group/edit-company-group/${this.props.match.params.id}`,
              })
            )
          }
        />
        <div className="table-header">
          <div className="table-header-title">
            {this.$t({ id: 'common.total' }, { total: `${pagination.total}` })}
          </div>{' '}
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={() => this.showListSelector(true)}>
              {this.$t({ id: 'common.add' })}
            </Button>{' '}
            {/*添加公司*/}
            <Button disabled={batchCompany} onClick={this.deleteItem}>
              {this.$t({ id: 'common.delete' })}
            </Button>
          </div>
        </div>
        <Table
          dataSource={data}
          columns={columns}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.onChangePager}
          size="middle"
          bordered
        />
        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />
          {this.$t({ id: 'common.back' })}
        </a>
        <ListSelector
          visible={lov.visible}
          selectorItem={selectorItem}
          onCancel={() => this.showListSelector(false)}
          onOk={this.handleListOk}
          extraParams={
            JSON.stringify(companyGroup) === '{}'
              ? {}
              : { companyGroupId: companyGroup.id, setOfBooksId: companyGroup.setOfBooksId.value }
          }
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const WrappedCompanyGroupDetail = Form.create()(CompanyGroupDetail);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedCompanyGroupDetail);
