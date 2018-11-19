import React from 'react'
import { connect } from 'dva'
import { Table, Button, Badge, message, Icon, Popover } from 'antd';
import codingRuleService from './coding-rule.service'
// import menuRoute from 'routes/menuRoute'
import BasicInfo from 'widget/basic-info'
import { messages } from "utils/utils";

import { routerRedux } from 'dva/router';

class CodingRuleDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      editing: false,
      data: [],
      columns: [
        {
          title: messages('code.rule.code')/*编码规则代码*/,
          dataIndex: "codingRuleCode",
          width: '15%',
          align: 'center'
        },
        {
          title: messages('code.rule.name')/*编码规则名称*/,
          dataIndex: "codingRuleName",
          width: '25%',
          align: 'center',
          render: desc => <Popover content={desc}>{desc || '-'}</Popover>
        },
        {
          title: messages('code.rule.reset.frequency')/*重置频率*/,
          dataIndex: "resetFrequenceName",
          align: 'center',
          width: '15%'
        },
        {
          title: messages('code.rule.remark')/*备注*/,
          dataIndex: "remark",
          align: 'center',
          width: '30%',
          render: desc => <Popover content={desc}>{desc || '-'}</Popover>
        },
        {
          title: messages('code.rule.status')/*状态*/,
          align: 'center',
          dataIndex: 'enabled',
          width: '15%',
          render: isEnabled => (
            <Badge status={isEnabled ? 'success' : 'error'}
              text={isEnabled ? messages('common.status.enable') : messages('common.status.disable')} />)
        }
      ],
      pagination: {
        page: 0,
        total: 0,
        pageSize: 10,
      },
      updateState: false,
      infoList: [
        {
          type: 'input',
          label: messages('code.rule.document.type')/*单据类型'*/,
          id: 'documentTypeName', disabled: true
        },
        {
          type: 'input',
          label: messages('code.rule.apply.company')/*应用公司*/,
          id: 'companyName', disabled: true
        },
        {
          type: 'switch',
          label: messages('code.rule.status')/*状态*/,
          id: 'enabled'
        },
      ],
      infoData: {},
      // codingRuleValue: menuRoute.getRouteItem('coding-rule-value'),
      // newCodingRule: menuRoute.getRouteItem('new-coding-rule'),
      // codingRuleObject: menuRoute.getRouteItem('coding-rule-object')
    };
  }

  componentWillMount() {
    let _pagination = this.getBeforePage();
    let pagination = this.state.pagination;
    pagination.page = _pagination.page;
    pagination.current = _pagination.page + 1;
    this.setState({
      pagination,
    }, () => {
      this.clearBeforePage();
      this.getList();
    })
    codingRuleService.getCodingRuleObjectById(this.props.match.params.id).then(res => {
      this.setState({ infoData: res.data })
    })
  }

  //得到列表数据
  getList() {
    let pagination = this.state.pagination;
    this.setState({ loading: true });
    return codingRuleService.getCodingRuleList(pagination.page, pagination.pageSize, this.props.match.params.id)
      .then((response) => {
        response.data.map((item) => {
          item.key = item.id;
        });
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          data: response.data,
          loading: false,
          pagination
        })
      });
  }

  //分页点击
  onChangePager = (p, filters, sorter) => {
    let pagination = this.state.pagination;
    pagination.page = p.current - 1;
    pagination.current = p.current;
    this.setState({
      pagination
    }, () => {
      this.getList();
    })
  };

  updateInfo = (params) => {
    this.setState({ editing: true });
    codingRuleService.updateCodingRuleObject(Object.assign({}, this.state.infoData, params))
      .then(res => {
        message.success(messages('common.save.success', { name: '' }));  //保存成功
        this.setState({ updateState: true, infoData: res.data, editing: false });
      }).catch((e) => {
        if (e.response) {
          message.error(`${messages('common.save.filed')/*保存失败*/}, ${e.response.data.message}`);
        }
        this.setState({ editing: false });
      })
  };

  handleRowClick = (record) => {
    this.setBeforePage(this.state.pagination);

    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/coding-rule-value/" + this.props.match.params.id + "/" + record.id
    }));

  };

  handleNew = () => {

    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/new-coding-rule/" + this.props.match.params.id
    }));
    // this.context.router.push(this.state.newCodingRule.url.replace(':id', this.props.match.params.id))
  };

  cancel = () => {
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/coding-rule-object"
    }));
  }

  render() {
    const { columns, data, loading, pagination, infoList, infoData, updateState, editing } = this.state;
    return (
      <div>
        <BasicInfo infoList={infoList}
          infoData={infoData}
          updateState={updateState}
          updateHandle={this.updateInfo}
          loading={editing} />
        <div className="table-header">
          <div className="table-header-title">
            {messages('common.total', { total: pagination.total })}
          </div>
          {/* 共total条数据 */}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>
              {messages('code.rule.new.rule')/*新建规则*/}
            </Button>
          </div>
        </div>
        <Table columns={columns}
          dataSource={data}
          pagination={pagination}
          onChange={this.onChangePager}
          loading={loading}
          onRow={record => ({ onClick: () => this.handleRowClick(record) })}
          rowKey="id"
          bordered
          size="middle" />
        <a className="back" onClick={this.cancel}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />{messages('common.back')/*返回*/}
        </a>
      </div>
    )
  }
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(CodingRuleDetail);
