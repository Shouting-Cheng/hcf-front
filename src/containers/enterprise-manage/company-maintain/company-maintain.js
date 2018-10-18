import {messages} from "share/common";
/**
 * Created by 13576 on 2017/11/1.
 */
//为了0416迭代上线，重构此文件
import React from 'react';
import {connect} from 'react-redux';

import {Button, Table,Badge, Popover} from 'antd';
import menuRoute from 'routes/menuRoute';
import SearchArea from 'components/search-area';

import companyMaintainService from 'containers/enterprise-manage/company-maintain/company-maintain.service';
import config from 'config';
import moment from "moment";

class CompanyMaintain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      params: {},
      searchParams: {
        name: "",
        companyCode: ""
      },
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      searchForm: [
        {
          type: 'select',
          id: 'setOfBooksId',
          label: messages("setting.set.of.book"),
          options: [],
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          labelKey: 'setOfBooksName',
          valueKey: 'id',
          getParams: {roleType: 'TENANT'},
          renderOption: option => (option.setOfBooksCode + "-" + option.setOfBooksName)
        },
        {
          type: 'select',
          id: 'legalEntityId',
          label: messages('company.maintain.company.legalEntityName'), /*法人*/
          options: [],
          getUrl: `${config.baseUrl}/api/all/legalentitys`,
          method: 'get',
          labelKey: 'entityName',
          valueKey: 'id',
        },
        {
          type: 'input',
          id: 'companyCode',
          label: messages('company.maintain.company.companyCode'), /*公司代码*/
        },
        {
          type: 'input',
          id: 'name',
          label: messages('company.maintain.company.name'), /*公司名称*/
        },
      ],

      columns: [
        {
          /*公司代码*/
          title: messages("company.maintain.company.companyCode"),
          key: "companyCode",
          dataIndex: 'companyCode',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          /*公司名称*/
          title: messages("company.maintain.company.name"),
          key: "name",
          dataIndex: 'name',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          /*账套*/
          title: messages("company.maintain.company.setOfBooksName"),
          key: "setOfBooksName",
          dataIndex: 'setOfBooksName',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          /*法人*/
          title: messages("company.maintain.company.legalEntityName"),
          key: "legalEntityName",
          dataIndex: 'legalEntityName',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          /*公司级别*/
          title: messages("company.maintain.company.companyLevelName"),
          key: "companyLevelName",
          dataIndex: 'companyLevelName',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          /*上级机构*/
          title: messages("company.maintain.company.parentCompanyName"),
          key: "parentCompanyName",
          dataIndex: 'parentCompanyName',
          render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
        },
        {
          /*有效日期从*/
          title: messages("company.maintain.company.startDateActive"),
          key: "startDateActive",
          dataIndex: 'startDateActive',
          render(recode) {
            return <Popover content={!!recode ? moment(recode).format("YYYY-MM-DD") : ""}>
              {!!recode ? moment(recode).format("YYYY-MM-DD") : ""}
            </Popover>
          }
        },
        {
          /*有效日期至*/
          title: messages("company.maintain.company.endDateActive"),
          key: "endDateActive",
          dataIndex: 'endDateActive',
          render(recode) {
            return <Popover content={!!recode ? moment(recode).format("YYYY-MM-DD") : "-"}>
              {!!recode ? moment(recode).format("YYYY-MM-DD") : ""}
            </Popover>
          },
        },
        {
          title: messages("common.column.status"),
          dataIndex: 'enabled',
          width: 100,
          render: isEnabled => (
            <Badge status={isEnabled ? 'success' : 'error'}
                   text={isEnabled ? messages("common.status.enable") : messages("common.status.disable")}/>
          )
        },
        {
          title: messages("common.operation"), //操作
          dataIndex: 'operation',
          width: '10%',
          key: "id",
          render: (text, record) => (
            <span>
              <a style={{marginRight: 10}} onClick={(e) => this.handleRowClick(e, record)}>
                {/*详情*/}
                {messages("common.detail")}
              </a>
              <a onClick={(e) => this.editItem(e, record)}>
                {/*编辑*/}
                {messages("common.edit")}
              </a>
            </span>
          )
        }
      ],
      newCompanyMaintainPage: menuRoute.getRouteItem('new-company-maintain', 'key'),       //公司新建
      companyMaintainDetailPage: menuRoute.getRouteItem('company-maintain-detail', 'key'),  //公司详情
    };
  }

  componentDidMount() {
    this.getList();
  }

  //获取公司列表
  getList() {
    this.setState({loading: true});
    let pagination = this.state.pagination;
    let params = this.state.searchParams;
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = pagination.page;
    params.size = pagination.pageSize;
    companyMaintainService.getCompaniesByOptions(params).then((response) => {
      response.data.map(item => {
        item.key = item.id
      });
      pagination.total = Number(response.headers['x-total-count']);
      this.setState({
        loading: false,
        data: response.data,
        pagination
      })
    })
  }

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

  //点击搜搜索
  handleSearch = (params) => {

    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    this.setState(
      {
        searchParams: params
      }, () => {
        this.getList();
      });
  };
  //点击清除
  clearHandle = () => {
    let searchParams = this.state.searchParams;
    searchParams.name = "";
    searchParams.companyCode = "";
    this.setState(
      {
        searchParams
      }, () => {
        this.getList();
      });
  }
  //新建
  handleCreate = () => {
    let path = this.state.newCompanyMaintainPage.url.replace(":flag", 'create');
    this.context.router.push(path)
  };
  //跳到新增页面，进行编辑
  editItem = (e, record) => {
    //companyOID需要传过去的，过滤本公司需要用
    let path = this.state.newCompanyMaintainPage.url.replace(":companyOID", record.companyOID);
    path = path.replace(":flag", record.id);
    this.context.router.push(path)
  };
  //跳转到详情
  handleRowClick = (e, value) => {
    let path = this.state.companyMaintainDetailPage.url.replace(":companyOId", value.companyOID);
    path = path.replace(":companyId", value.id);
    this.context.router.push(path);
  };


  render() {
    const {loading, searchForm, data, pagination, columns} = this.state;
    return (
      <div className="budget-journal">
        <SearchArea searchForm={searchForm}
                    clearHandle={this.clearHandle}
                    submitHandle={this.handleSearch}/>
        <div className="table-header">
          <div
            className="table-header-title">
            {messages('common.total', {total: `${pagination.total}`})}
          </div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary"
                    onClick={this.handleCreate}>
              {/*新 建*/}
              {messages('common.create')}
            </Button>
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          size="middle"
          bordered
          onChange={this.onChangePager}
        />
      </div>
    )
  }
}

CompanyMaintain.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    organization: state.login.organization
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(CompanyMaintain);
