import React from 'react';
import { connect } from 'dva';
import { routerRedux } from "dva/router";
import {  Button, Badge, Tooltip, Icon, Popover } from 'antd';
import Table from 'widget/table'

import LPService from 'containers/enterprise-manage/legal-person/legal-person.service';
import SearchArea from 'components/Widget/search-area.js';


class LegalPerson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },
      //搜索关键字
      params: {
        keyword: '',
      },
      searchForm: [
        {
          type: 'input',
          key: 'keyword', //必填，唯一，每行的标识
          id: 'keyword',
          label: this.$t('legal.person.name'), //'法人实体名称',
        },
      ],
      //老集团表格
      columns: [
        {
          title: this.$t('legal.person.index'), //'序号',
          dataIndex: 'index',
          width: '8%',
        },
        {
          title: this.$t('legal.person.name'), // "法人实体名称",
          key: 'companyName',
          dataIndex: 'companyName',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          title: this.$t('legal.person.person.total'), //"员工数量",
          key: 'userAmount',
          dataIndex: 'userAmount',
        },
        {
          title: this.$t('legal.person.status'), //'状态',
          dataIndex: 'enable',
          width: '15%',
          render: enable => (
            <Badge
              status={enable ? 'success' : 'error'}
              text={enable ? this.$t('common.enabled') : this.$t('common.disabled')}
            />
          ),
        },
        {
          title: this.$t('common.operation'), //"操作",
          dataIndex: 'id',
          key: 'id',
          render: (text, record) => (
            <span>
              <a
                onClick={e => this.editItemLegalPerson(e, record)}
                disabled={!this.props.tenantMode}
              >
                {/*编辑*/}
                {this.$t('common.edit')}
              </a>
              &nbsp;&nbsp;&nbsp;
              <a onClick={e => this.handleRowClick(e, record)}>
                {/*详情*/}
                {this.$t('common.detail')}
              </a>
            </span>
          ),
        },
      ],
      //新集团表格
      columnsNew: [
        {
          title: this.$t('legal.person.index'), //'序号',
          dataIndex: 'index',
          width: '8%',
        },
        {
          title: this.$t('legal.person.name'), // "法人实体名称",
          key: 'companyName',
          dataIndex: 'companyName',
        },
        {
          title: this.$t('legal.person.status'), //'状态',
          dataIndex: 'enable',
          width: '15%',
          render: enable => (
            <Badge
              status={enable ? 'success' : 'error'}
              text={enable ? this.$t('common.enabled') : this.$t('common.disabled')}
            />
          ),
        },
        {
          title: this.$t('common.operation'), //"操作",
          dataIndex: 'id',
          key: 'id',
          render: (text, record) => (
            <span>
              <a
                onClick={e => this.editItemLegalPerson(e, record)}
                disabled={!this.props.tenantMode}
              >
                {/*编辑*/}
                {this.$t('common.edit')}
              </a>
              &nbsp;&nbsp;&nbsp;
              <a onClick={e => this.handleRowClick(e, record)}>
                {/*详情*/}
                {this.$t('common.detail')}
              </a>
            </span>
          ),
        },
      ],
    };
  }

  componentDidMount() {
    //记住页码
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState(
      {
        pagination,
      },
      () => {
        this.clearBeforePage();
        this.getLegalPersonList();
      }
    );
  }

  //获取法人实体表格
  getLegalPersonList = () => {
    this.setState({
      loading: true,
    });
    let params = {
      keyword: this.state.params.keyword,
      page: this.state.pagination.page,
      size: this.state.pagination.pageSize,
    };
    LPService.getLegalList(params).then(response => {
      //加上序号
      response.data.map((item, index) => {
        item.index = this.state.pagination.page * this.state.pagination.pageSize + index + 1;
        item.key = item.index;
      });
      this.setState({
        loading: false,
        data: response.data,
        pagination: {
          page: this.state.pagination.page,
          pageSize: this.state.pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          total: Number(response.headers['x-total-count']),
        },
      });
    });
  };
  //点击搜搜索
  handleSearch = values => {
    this.setState(
      {
        params: values,
        pagination: {
          page: 0,
          total: 0,
          pageSize: 10,
        },
      },
      () => {
        this.getLegalPersonList();
      }
    );
  };
  //点击情况搜索
  clearSearchHandle = values => {
    let params = {
      keyword: '',
    };
    this.setState(
      {
        params,
      },
      () => {
        this.getLegalPersonList();
      }
    );
  };
  //新增法人实体
  handleCreateLP = () => {
     this.props.dispatch(
        routerRedux.replace({
          pathname: `/enterprise-manage/legal-person/new-legal-person/:legalPersonOID/:legalPersonID`,
        })
      );
    // this.context.router.push(
    //   menuRoute.getMenuItemByAttr('legal-person', 'key').children.newLegalPerson.url
    // );
  };
  //编辑法人实体
  editItemLegalPerson = (e, record) => {
    this.setBeforePage(this.state.pagination);
    e.stopPropagation();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/enterprise-manage/legal-person/new-legal-person/${record.companyReceiptedOID}/${record.id}`,
      })
    );
    // let detailUrl = menuRoute
    //   .getMenuItemByAttr('legal-person', 'key')
    //   .children.newLegalPerson.url.replace(':legalPersonOID', record.companyReceiptedOID);
    // detailUrl = detailUrl.replace(':legalPersonID', record.id);
    // this.context.router.push(detailUrl);
  };
  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: {
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
        },
      },
      () => {
        this.getLegalPersonList();
      }
    );
  };

  //点击行，进入该行详情页面
  //为了适应新老集团，这里传两个参数
  handleRowClick = (e, record) => {
    this.setBeforePage(this.state.pagination);
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/enterprise-manage/legal-person/legal-person-detail/${record.companyReceiptedOID}/${record.id}`,
      })
    );
    // let detailUrl = menuRoute
    //   .getMenuItemByAttr('legal-person', 'key')
    //   .children.legalPersonDetail.url.replace(':legalPersonOID', record.companyReceiptedOID);
    // detailUrl = detailUrl.replace(':legalPersonID', record.id);
    // this.context.router.push(detailUrl);
  };

  renderCreateBtn = () => {
    return (
      <div className="table-header-buttons">
        <Button type="primary" disabled={!this.props.tenantMode} onClick={this.handleCreateLP}>
          {/*新增法人实体*/}
          {this.$t('legal.person.new')}
        </Button>
        <Tooltip
          title={
            <div>
              <p>
                {this.$t('legal.person.tips1')}
                {/*1.法人实体名称是员工在法律上归属的公司注册名称,*/}
                {/*在应用开票平台开具增值税发票时,作为选择开票费用集合的单位*/}
              </p>
              <p>
                {this.$t('legal.person.tips2')}
                {/*2.法人实体详细信息是员工个人开具增值税发票的必要信息,*/}
                {/*用户可在APP我的-开票信息中查看*/}
              </p>
            </div>
          }
        >
          <span>
            <Icon type="info-circle-o" />
          </span>
        </Tooltip>
      </div>
    );
  };
  render() {
    return (
      <div className="legal-person-wrap">
        <SearchArea
          searchForm={this.state.searchForm}
          clearHandle={this.clearSearchHandle}
          submitHandle={this.handleSearch}
        />

        <div className="table-header">
          <div className="table-header-title">
            {/*共搜索到*条数据*/}
            {this.$t('common.total', { total: `${this.state.pagination.total}` })}
          </div>
          {this.renderCreateBtn()}
        </div>

        {/*新集团是显示公司*/}
        <Table
          loading={this.state.loading}
          dataSource={this.state.data}
          columns={this.props.isOldCompany ? this.state.columns : this.state.columnsNew}
          pagination={this.state.pagination}
          size="middle"
          bordered
          onChange={this.onChangePager}
        />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    profile: state.user.profile,
    user: state.user.currentUser,
    company: state.user.company,
    isOldCompany: state.user.isOldCompany,
    tenantMode: true,
  };
}

LegalPerson.propTypes = {};

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(LegalPerson);
