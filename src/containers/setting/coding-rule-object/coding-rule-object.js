import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'

import {  Button, Badge } from 'antd';
import Table from 'widget/table'
import codingRuleService from './coding-rule.service'
import SearchArea from 'widget/search-area'

import { routerRedux } from 'dva/router';


// import menuRoute from 'routes/menuRoute'
class CodingRule extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        { title: messages('code.rule.document.type')/*单据类型'*/, dataIndex: "documentTypeName", width: '40%',
          align: 'center',
        },
        { title: messages('code.rule.apply.company')/*应用公司*/, dataIndex: "companyName", width: '40%',
          align: 'center',
        },
        {
          title: messages('code.rule.status')/*状态*/, dataIndex: 'enabled', width: '20%',
          align: 'center',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'} text={enabled ? messages('common.status.enable') : messages('common.status.disable')} />)
        }
      ],
      pagination: {
        total: 0
      },
      searchForm: [
        { type: 'value_list', id: 'documentTypeCode', label: messages('code.rule.document.type')/*单据类型'*/, valueListCode: 2023, options: [] }
      ],
      searchParams: {
        documentCategoryCode: '',
        documentTypeCode: ''
      },
      // newCodingRuleObjectPage: menuRoute.getRouteItem('new-coding-rule-object', 'key'),
      // codingRule: menuRoute.getRouteItem('coding-rule', 'key')
    };
  }

  componentWillMount() {
    this.getList();
  }

  //得到列表数据
  getList() {
    this.setState({ loading: true });
    const { page, pageSize, searchParams } = this.state;
    codingRuleService.getCodingRuleObjectList(page, pageSize, searchParams).then((response) => {
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
      })
    });
  }

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };

  search = (result) => {
    this.setState({
      page: 0,
      searchParams: Object.assign({}, this.state.searchParams, result)
    }, () => {
      this.getList();
    })
  };

  clear = () => {
    this.setState({
      searchParams: {
        documentCategoryCode: '',
        documentTypeCode: ''
      }
    })
  };

  handleNew = () => {

    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/new-coding-rule-object"
    }))

    // this.context.router.push(this.state.newCodingRuleObjectPage.url);
  };

  handleRowClick = (record) => {
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/coding-rule/" + record.id
    }))
    // this.context.router.push(this.state.codingRule.url.replace(':id', record.id))
  };


  render() {
    const { columns, data, loading, pagination, searchForm } = this.state;

    return (
      <div>
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear} />

        <div className="table-header">
          <div className="table-header-title">{messages('common.total', { total: pagination.total + '' })}</div> {/* 共total条数据 */}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{messages('common.create')}</Button> {/* 新建 */}
          </div>
        </div>
        <Table columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onRow={record => ({ onClick: () => this.handleRowClick(record) })}
          rowKey="id"
          bordered
          size="middle" />

      </div>
    )
  }
}


function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(CodingRule);
