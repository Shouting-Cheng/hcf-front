import {messages} from "share/common";
/**
 * Created by zhouli on 18/2/7
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import {connect} from 'react-redux';

import {Table, Button, Badge, Tooltip, Icon,Popover} from 'antd';

import LPService from 'containers/enterprise-manage/legal-person/legal-person.service';
import SearchArea from 'components/search-area.js';
import menuRoute from 'routes/menuRoute';

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
        "keyword": ""
      },
      searchForm: [
        {
          type: 'input',
          key: 'keyword',    //必填，唯一，每行的标识
          id: 'keyword',
          label: messages("legal.person.name"),//'法人实体名称',
        }
      ],
      //老集团表格
      columns: [
        {
          title: messages("legal.person.index"),//'序号',
          dataIndex: 'index',
          width: '8%'
        },
        {
          title: messages("legal.person.name"),// "法人实体名称",
          key: "companyName",
          dataIndex: 'companyName',
          render: text => <span>{text ? <Popover placement="topLeft" content={text}>{text}</Popover> : '-'}</span>
        },
        {
          title: messages("legal.person.person.total"),//"员工数量",
          key: "userAmount",
          dataIndex: 'userAmount',
        },
        {
          title: messages("legal.person.status"),//'状态',
          dataIndex: 'enable',
          width: '15%',
          render: enable => <Badge status={enable ? 'success' : 'error'}
                                   text={enable ? messages("common.enabled") : messages("common.disabled")}/>
        },
        {
          title: messages("common.operation"),//"操作",
          dataIndex: "id",
          key: "id",
          render: (text, record) => (
            <span>
              <a onClick={(e) => this.editItemLegalPerson(e, record)} disabled={!this.props.tenantMode}>
                     {/*编辑*/}
                {messages("common.edit")}
              </a>
              &nbsp;&nbsp;&nbsp;
              <a onClick={(e) => this.handleRowClick(e, record)}>
                {/*详情*/}
                {messages("common.detail")}
              </a>
            </span>)
        }
      ],
      //新集团表格
      columnsNew: [
        {
          title: messages("legal.person.index"),//'序号',
          dataIndex: 'index',
          width: '8%'
        },
        {
          title: messages("legal.person.name"),// "法人实体名称",
          key: "companyName",
          dataIndex: 'companyName'
        },
        {
          title: messages("legal.person.status"),//'状态',
          dataIndex: 'enable',
          width: '15%',
          render: enable => <Badge status={enable ? 'success' : 'error'}
                                   text={enable ? messages("common.enabled") : messages("common.disabled")}/>
        },
        {
          title: messages("common.operation"),//"操作",
          dataIndex: "id",
          key: "id",
          render: (text, record) => (
            <span>
              <a onClick={(e) => this.editItemLegalPerson(e, record)} disabled={!this.props.tenantMode}>
                {/*编辑*/}
                {messages("common.edit")}
              </a>
              &nbsp;&nbsp;&nbsp;
               <a onClick={(e) => this.handleRowClick(e, record)}>
                {/*详情*/}
                 {messages("common.detail")}
              </a>
            </span>)
        }
      ],
    }
  }

  componentDidMount() {
    //记住页码
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState({
      pagination,
    }, () => {
      this.clearBeforePage();
      this.getLegalPersonList();
    })
  }

  //获取法人实体表格
  getLegalPersonList = () => {
    this.setState({
      loading: true,
    })
    let params = {
      "keyword": this.state.params.keyword,
      "page": this.state.pagination.page,
      "size": this.state.pagination.pageSize,
    }
    LPService.getLegalList(params)
      .then((response) => {
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
          }
        })
      })
  }
  //点击搜搜索
  handleSearch = (values) => {
    this.setState({
      params: values,
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },
    }, () => {
      this.getLegalPersonList()
    })
  };
  //点击情况搜索
  clearSearchHandle = (values) => {
    let params = {
      keyword: ""
    }
    this.setState({
      params
    }, () => {
      this.getLegalPersonList()
    })
  }
  //新增法人实体
  handleCreateLP = () => {
    this.context.router.push(menuRoute.getMenuItemByAttr('legal-person', 'key').children.newLegalPerson.url);
  }
  //编辑法人实体
  editItemLegalPerson = (e, record) => {
    this.setBeforePage(this.state.pagination);
    e.stopPropagation();
    let detailUrl = menuRoute.getMenuItemByAttr('legal-person', 'key').children.newLegalPerson.url.replace(':legalPersonOID', record.companyReceiptedOID);
    detailUrl = detailUrl.replace(':legalPersonID', record.id);
    this.context.router.push(detailUrl);
  }
  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    this.setState({
      pagination: {
        page: pagination.current - 1,
        pageSize: pagination.pageSize
      }
    }, () => {
      this.getLegalPersonList();
    })
  };

  //点击行，进入该行详情页面
  //为了适应新老集团，这里传两个参数
  handleRowClick = (e,record) => {
    this.setBeforePage(this.state.pagination);
    let detailUrl = menuRoute.getMenuItemByAttr('legal-person', 'key').children.legalPersonDetail.url.replace(':legalPersonOID', record.companyReceiptedOID);
    detailUrl = detailUrl.replace(':legalPersonID', record.id);
    this.context.router.push(detailUrl);
  };

  renderCreateBtn = () => {
    return (
      <div className="table-header-buttons">
        <Button type="primary"
                disabled={!this.props.tenantMode}
                onClick={this.handleCreateLP}>
          {/*新增法人实体*/}
          {messages("legal.person.new")}
        </Button>
        <Tooltip
          title={<div>
            <p>
              {messages("legal.person.tips1")}
              {/*1.法人实体名称是员工在法律上归属的公司注册名称,*/}
              {/*在应用开票平台开具增值税发票时,作为选择开票费用集合的单位*/}
            </p>
            <p>
              {messages("legal.person.tips2")}
              {/*2.法人实体详细信息是员工个人开具增值税发票的必要信息,*/}
              {/*用户可在APP我的-开票信息中查看*/}
            </p>
          </div>}>
          <span><Icon type="info-circle-o"/></span>
        </Tooltip>
      </div>
    )
  }
  render() {
    return (
      <div className="legal-person-wrap">
        <SearchArea searchForm={this.state.searchForm}
                    clearHandle={this.clearSearchHandle}
                    submitHandle={this.handleSearch}/>

        <div className="table-header">
          <div className="table-header-title">
            {/*共搜索到*条数据*/}
            {messages('common.total',
              {total: `${this.state.pagination.total}`})}
          </div>
          {
            this.renderCreateBtn()
          }
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
    )
  }
}

LegalPerson.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    company: state.login.company,
    isOldCompany: state.login.isOldCompany,
    tenantMode: state.main.tenantMode,
  }
}

LegalPerson.propTypes = {};

export default connect(mapStateToProps, null, null, { withRef: true })(LegalPerson);



